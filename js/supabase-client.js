// =============================================================================
// OFFLINE-FIRST SYNC ENGINE & SUPABASE CLOUD (v3)
// Höchste Ausfallsicherheit: Vollständige Offline-Funktion mit automatischer
// Hintergrund-Synchronisation, robuster Warteschlange und Realtime-Events.
// =============================================================================

const SupaSync = (() => {
  const DEFAULT_URL = 'https://tujzmaqtatlvmwzjcdlk.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1anptYXF0YXRsdm13empjZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTg0MTQsImV4cCI6MjEwNTY3NDQxNH0.l4wT3P2u6ZCNdnkCWlihCdgWsDjtwXrC5dxIlQnaJAo';

  const STORAGE_PREFIX = 'supa_data_';
  const QUEUE_KEY = 'supa_sync_queue';

  function checkOnline() {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  let client = null;
  let isReady = false;
  let currentStatus = checkOnline() ? 'online' : 'offline';
  let isSyncing = false;
  const subscribers = {};
  const statusListeners = [];

  // ─── Status Management ────────────────────────────────────────────────
  function setStatus(status, details = {}) {
    currentStatus = status;
    statusListeners.forEach(fn => {
      try { fn(status, { ...details, queueLength: getQueue().length }); } catch (e) {}
    });
  }

  function onStatusChange(callback) {
    statusListeners.push(callback);
    callback(currentStatus, { queueLength: getQueue().length });
    return () => {
      const idx = statusListeners.indexOf(callback);
      if (idx !== -1) statusListeners.splice(idx, 1);
    };
  }

  function getStatus() {
    return {
      status: currentStatus,
      isOnline: checkOnline(),
      queueLength: getQueue().length,
      isReady
    };
  }

  // ─── Local Storage Helpers ───────────────────────────────────────────
  function readLocal(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item !== null) return JSON.parse(item);
    } catch (e) {}
    return defaultValue;
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      localStorage.setItem(STORAGE_PREFIX + key + '_ts', new Date().toISOString());
    } catch (e) {
      console.warn('LocalStorage Schreibfehler:', e);
    }
  }

  // ─── Persistent Offline Queue ─────────────────────────────────────────
  function getQueue() {
    try {
      const q = localStorage.getItem(QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch (e) {
      return [];
    }
  }

  function saveQueue(q) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  function enqueue(key, value) {
    const q = getQueue();
    // Replace existing queued item for same key, or append
    const existingIdx = q.findIndex(item => item.key === key);
    const entry = {
      key,
      value,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    if (existingIdx !== -1) {
      q[existingIdx] = entry;
    } else {
      q.push(entry);
    }
    saveQueue(q);
  }

  // ─── Supabase Initialization ─────────────────────────────────────────
  async function init() {
    let url = DEFAULT_URL;
    let key = DEFAULT_KEY;

    // Optional quick check for runtime config with 1s timeout to never hang
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const res = await fetch('/api/config', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const cfg = await res.json().catch(() => null);
        if (cfg?.supabaseUrl) url = cfg.supabaseUrl;
        if (cfg?.supabaseAnonKey) key = cfg.supabaseAnonKey;
      }
    } catch (e) {}

    // Initialize Supabase Client
    if (window.supabase && url && key) {
      try {
        client = window.supabase.createClient(url, key, {
          auth: { persistSession: false },
          realtime: { params: { eventsPerSecond: 10 } }
        });
        isReady = true;
        console.log('⚡ Supabase Cloud Sync aktiv:', url);

        // Setup global realtime listener for changes from other devices
        setupGlobalRealtime();

        // Flush any offline changes immediately
        flushQueue();

        setStatus(getQueue().length > 0 ? 'syncing' : 'synced');
      } catch (e) {
        console.warn('Supabase Client Init Fehler:', e);
        setStatus('error', { error: e.message });
      }
    } else {
      console.log('ℹ️ Supabase JS nicht geladen oder offline — arbeite im lokalen Offline-Modus');
      setStatus(navigator.onLine ? 'online' : 'offline');
    }

    // Network status event listeners
    window.addEventListener('online', () => {
      console.log('🌐 Internetverbindung wiederhergestellt — starte Synchronisation...');
      setStatus('syncing');
      flushQueue();
      syncAllFromCloud();
    });

    window.addEventListener('offline', () => {
      console.log('🔌 Offline-Modus aktiv — alle Daten werden lokal gesichert');
      setStatus('offline');
    });

    // Periodic heartbeat every 20 seconds
    const heartbeatTimer = setInterval(() => {
      if (navigator.onLine && isReady) {
        flushQueue();
      }
    }, 20000);
    if (typeof heartbeatTimer?.unref === 'function') {
      heartbeatTimer.unref();
    }
  }

  // ─── Flush Queue (Upload offline mutations to Supabase) ──────────────
  async function flushQueue() {
    if (!client || !navigator.onLine || isSyncing) return;
    const q = getQueue();
    if (q.length === 0) {
      setStatus('synced');
      return;
    }

    isSyncing = true;
    setStatus('syncing', { queueLength: q.length });

    const remaining = [];
    for (const item of q) {
      try {
        const { error } = await client
          .from('app_data')
          .upsert(
            { key: item.key, value: item.value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );

        if (error) {
          console.warn(`Sync Fehler für "${item.key}":`, error.message);
          item.attempts = (item.attempts || 0) + 1;
          if (item.attempts < 5) remaining.push(item);
        }
      } catch (err) {
        console.warn(`Netzwerkfehler beim Sync von "${item.key}":`, err.message);
        remaining.push(item);
        break; // Network probably dropped, pause flush
      }
    }

    saveQueue(remaining);
    isSyncing = false;
    setStatus(remaining.length === 0 ? 'synced' : 'syncing', { queueLength: remaining.length });
  }

  // ─── Global Realtime Listener ─────────────────────────────────────────
  function setupGlobalRealtime() {
    if (!client) return;
    try {
      client
        .channel('app_data_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_data' },
          payload => {
            const row = payload.new;
            if (row && row.key && row.value !== undefined) {
              const currentLocal = readLocal(row.key);
              // Only apply if different from current local
              if (JSON.stringify(currentLocal) !== JSON.stringify(row.value)) {
                writeLocal(row.key, row.value);
                notifySubscribers(row.key, row.value);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('📡 Realtime Cloud-Verbindung aktiv');
          }
        });
    } catch (e) {
      console.warn('Realtime Setup Fehler:', e);
    }
  }

  // ─── Public CRUD API (Offline-First) ──────────────────────────────────
  async function get(key, defaultValue = null) {
    // 1. Immediately return local data (Instant UI, 0ms, works offline)
    const localVal = readLocal(key, null);
    const effectiveVal = localVal !== null ? localVal : defaultValue;

    // 2. If online and client ready, fetch latest in background and sync
    if (client && navigator.onLine) {
      fetchCloudItem(key).then(cloudVal => {
        if (cloudVal !== null) {
          const isDiff = JSON.stringify(localVal) !== JSON.stringify(cloudVal);
          if (isDiff) {
            writeLocal(key, cloudVal);
            notifySubscribers(key, cloudVal);
          }
        }
      }).catch(() => {});
    }

    return effectiveVal;
  }

  async function fetchCloudItem(key) {
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('app_data')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error && data && data.value !== undefined) {
        return data.value;
      }
    } catch (e) {}
    return null;
  }

  async function set(key, value) {
    // 1. Save locally immediately (Never lose data)
    writeLocal(key, value);

    // 2. Enqueue for Cloud Sync
    enqueue(key, value);

    // 3. Notify local listeners immediately
    notifySubscribers(key, value);

    // 4. If online, attempt instant upload
    if (client && navigator.onLine) {
      flushQueue().catch(() => {});
    }

    return true;
  }

  // ─── Subscriptions ────────────────────────────────────────────────────
  function subscribe(key, callback) {
    if (!subscribers[key]) subscribers[key] = [];
    subscribers[key].push(callback);
    return () => {
      const list = subscribers[key];
      if (list) {
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
      }
    };
  }

  function notifySubscribers(key, value) {
    const list = subscribers[key];
    if (list && list.length > 0) {
      list.forEach(fn => {
        try { fn(value); } catch (e) { console.error(e); }
      });
    }
  }

  // ─── Sync All from Cloud ──────────────────────────────────────────────
  async function syncAllFromCloud() {
    if (!client || !navigator.onLine) return;
    try {
      const { data, error } = await client
        .from('app_data')
        .select('key, value, updated_at');

      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          if (item && item.key && item.value !== undefined) {
            const local = readLocal(item.key);
            if (JSON.stringify(local) !== JSON.stringify(item.value)) {
              writeLocal(item.key, item.value);
              notifySubscribers(item.key, item.value);
            }
          }
        });
      }
    } catch (e) {}
  }

  // ─── Backup & Restore ─────────────────────────────────────────────────
  function exportBackup() {
    const keys = [
      'profile',
      'staff',
      'category-permissions',
      'guides',
      'custom-categories',
      'progress',
      'audit_logs'
    ];
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      data: {}
    };
    keys.forEach(k => {
      backup.data[k] = readLocal(k, null);
    });
    return backup;
  }

  async function importBackup(backupJson) {
    if (!backupJson || typeof backupJson !== 'object' || !backupJson.data) {
      throw new Error('Ungültiges Backup-Format');
    }
    const data = backupJson.data;
    for (const key of Object.keys(data)) {
      if (data[key] !== null) {
        await set(key, data[key]);
      }
    }
    await flushQueue();
    return true;
  }

  // ─── Connection Diagnostics ───────────────────────────────────────────
  async function testConnection() {
    if (!navigator.onLine) {
      return { ok: false, error: 'Keine Internetverbindung auf diesem Gerät (Offline)' };
    }
    const start = Date.now();
    try {
      const res = await fetch(`${DEFAULT_URL}/rest/v1/app_data?select=key&limit=1`, {
        headers: {
          apikey: DEFAULT_KEY,
          Authorization: `Bearer ${DEFAULT_KEY}`
        }
      });
      const latency = Date.now() - start;
      if (res.ok) {
        return { ok: true, latencyMs: latency, url: DEFAULT_URL };
      } else {
        return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  return {
    init,
    get,
    set,
    subscribe,
    onStatusChange,
    getStatus,
    flushQueue,
    syncAllFromCloud,
    exportBackup,
    importBackup,
    testConnection,
    get isReady() { return isReady; },
    get client() { return client; }
  };
})();

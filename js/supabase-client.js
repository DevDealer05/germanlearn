// =============================================================================
// SUPABASE CLIENT & CLOUD SYNC
// Ermöglicht nahtlose Synchronisation über jedes Netzwerk (auch Mobilfunk/LTE)
// =============================================================================

const SupaSync = (() => {
  const DEFAULT_URL = 'https://tujzmaqtatlvmwzjcdlk.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1anptYXF0YXRsdm13empjZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTg0MTQsImV4cCI6MjEwNTY3NDQxNH0.l4wT3P2u6ZCNdnkCWlihCdgWsDjtwXrC5dxIlQnaJAo';

  let client = null;
  let isReady = false;

  async function init() {
    let url = DEFAULT_URL;
    let key = DEFAULT_KEY;

    // Try fetching updated config from server if available
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.supabaseUrl) url = cfg.supabaseUrl;
        if (cfg.supabaseAnonKey) key = cfg.supabaseAnonKey;
      }
    } catch (e) {}

    if (window.supabase && url && key) {
      try {
        client = window.supabase.createClient(url, key, {
          auth: { persistSession: false }
        });
        isReady = true;
        console.log('⚡ Supabase Cloud Sync initialisiert:', url);
      } catch (e) {
        console.warn('Supabase Init Fehler:', e);
      }
    }
  }

  async function get(key, defaultValue = null) {
    if (!client) return defaultValue;
    try {
      const { data, error } = await client
        .from('app_data')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error && data && data.value !== undefined) {
        return data.value;
      }
    } catch (e) {
      // Fallback silently if table does not exist or network error
    }
    return defaultValue;
  }

  async function set(key, value) {
    if (!client) return false;
    try {
      const { error } = await client
        .from('app_data')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      return !error;
    } catch (e) {
      return false;
    }
  }

  function subscribe(key, callback) {
    if (!client) return null;
    try {
      const channel = client
        .channel('realtime_' + key + '_' + Math.random().toString(36).substring(7))
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_data',
            filter: 'key=eq.' + key
          },
          payload => {
            if (payload.new && payload.new.value !== undefined) {
              callback(payload.new.value);
            }
          }
        )
        .subscribe();
      return channel;
    } catch (e) {
      return null;
    }
  }

  return {
    init,
    get,
    set,
    subscribe,
    get client() { return client; },
    get isReady() { return isReady; }
  };
})();

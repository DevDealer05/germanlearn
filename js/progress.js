// =============================================================================
// PROGRESS — Fortschritt speichern (Server + LocalStorage Fallback)
// =============================================================================

const Progress = (() => {
  const STORAGE_KEY = 'deutsch_lernen_progress';
  const SETTINGS_KEY = 'deutsch_lernen_settings';

  // Cache in memory for fast access
  let _progressCache = null;
  let _settingsCache = null;
  let _syncTimer = null;

  // ─── Server & Supabase Cloud Sync ─────────────────────────────────
  async function fetchFromServer(endpoint) {
    // 1. Try Supabase cloud first
    if (window.SupaSync) {
      const cloudData = await SupaSync.get(endpoint, null);
      if (cloudData !== null) return cloudData;
    }
    // 2. Fallback to local server
    try {
      const res = await fetch(`/api/${endpoint}`);
      if (res.ok) return await res.json();
    } catch (e) { /* offline — use local */ }
    return null;
  }

  async function saveToServer(endpoint, data) {
    // 1. Save to Supabase cloud
    if (window.SupaSync) {
      SupaSync.set(endpoint, data);
    }
    // 2. Save to local server
    try {
      await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) { /* offline — saved locally */ }
  }

  // Debounced server save (don't save on every single action)
  function scheduleSave() {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      if (_progressCache) saveToServer('progress', _progressCache);
    }, 1000);
  }

  // ─── Data structure ─────────────────────────────────────────────────
  function createEmptyProgress() {
    return {
      words: {},
      sentences: {},
      quizScores: {},
      totalSessions: 0,
      lastSessionDate: null
    };
  }

  function getProgress() {
    if (_progressCache) return _progressCache;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      _progressCache = data ? JSON.parse(data) : createEmptyProgress();
    } catch (e) {
      _progressCache = createEmptyProgress();
    }
    return _progressCache;
  }

  function saveProgress(progress) {
    _progressCache = progress;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* storage full */ }
    scheduleSave();
  }

  // Init: load from server if available (overrides local)
  async function init() {
    const serverData = await fetchFromServer('progress');
    if (serverData && serverData.words) {
      _progressCache = serverData;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
      } catch (e) {}
    } else {
      // First start or offline: use local, push to server
      const local = getProgress();
      saveToServer('progress', local);
    }

    const serverSettings = await fetchFromServer('settings');
    if (serverSettings) {
      _settingsCache = serverSettings;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(serverSettings));
      } catch (e) {}
    }
  }

  // ─── Word progress ─────────────────────────────────────────────────
  function markWordLearned(wordId) {
    const p = getProgress();
    if (!p.words[wordId]) {
      p.words[wordId] = { learned: false, quizCorrect: 0, lastSeen: null, nextReview: null };
    }
    p.words[wordId].learned = true;
    p.words[wordId].lastSeen = Date.now();
    saveProgress(p);
  }

  function markSentenceLearned(sentenceId) {
    const p = getProgress();
    if (!p.sentences[sentenceId]) {
      p.sentences[sentenceId] = { learned: false, lastSeen: null };
    }
    p.sentences[sentenceId].learned = true;
    p.sentences[sentenceId].lastSeen = Date.now();
    saveProgress(p);
  }

  // Record a quiz answer
  function recordQuizAnswer(categoryId, wordId, correct) {
    const p = getProgress();

    if (!p.words[wordId]) {
      p.words[wordId] = { learned: true, quizCorrect: 0, lastSeen: null, nextReview: null };
    }
    if (correct) {
      p.words[wordId].quizCorrect++;
      const intervals = [1, 3, 7, 14, 30];
      const level = Math.min(p.words[wordId].quizCorrect - 1, intervals.length - 1);
      p.words[wordId].nextReview = Date.now() + intervals[level] * 86400000;
    }
    p.words[wordId].lastSeen = Date.now();

    if (!p.quizScores[categoryId]) {
      p.quizScores[categoryId] = { total: 0, correct: 0, lastDate: null };
    }
    p.quizScores[categoryId].total++;
    if (correct) p.quizScores[categoryId].correct++;
    p.quizScores[categoryId].lastDate = new Date().toLocaleDateString('de-DE');

    saveProgress(p);
  }

  // Get progress percentage for a category
  function getCategoryProgress(category) {
    const p = getProgress();
    const allItems = [...category.words, ...category.sentences];
    if (allItems.length === 0) return 0;

    let learned = 0;
    category.words.forEach(w => {
      if (p.words[w.id] && p.words[w.id].learned) learned++;
    });
    category.sentences.forEach(s => {
      if (p.sentences[s.id] && p.sentences[s.id].learned) learned++;
    });

    return Math.round((learned / allItems.length) * 100);
  }

  function getWordsForReview(categoryId) {
    const p = getProgress();
    const category = getCategoryById(categoryId);
    if (!category) return [];

    return category.words.filter(w => {
      const wp = p.words[w.id];
      if (!wp || !wp.learned) return false;
      if (!wp.nextReview) return true;
      return Date.now() >= wp.nextReview;
    });
  }

  // Caretaker stats
  function getCaretakerStats() {
    const p = getProgress();
    return CATEGORIES.map(cat => {
      const progress = getCategoryProgress(cat);
      const score = p.quizScores[cat.id] || { total: 0, correct: 0, lastDate: null };
      const wordsLearned = cat.words.filter(w => p.words[w.id] && p.words[w.id].learned).length;
      const sentencesLearned = cat.sentences.filter(s => p.sentences[s.id] && p.sentences[s.id].learned).length;

      return {
        id: cat.id,
        emoji: cat.emoji,
        color: cat.color,
        progress,
        wordsLearned,
        wordsTotal: cat.words.length,
        sentencesLearned,
        sentencesTotal: cat.sentences.length,
        quizTotal: score.total,
        quizCorrect: score.correct,
        lastPractice: score.lastDate
      };
    });
  }

  function recordSession() {
    const p = getProgress();
    p.totalSessions++;
    p.lastSessionDate = new Date().toLocaleDateString('de-DE');
    saveProgress(p);
  }

  // ─── Settings ───────────────────────────────────────────────────────
  function getSettings() {
    if (_settingsCache) return _settingsCache;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      _settingsCache = data ? JSON.parse(data) : { showText: true };
    } catch (e) {
      _settingsCache = { showText: true };
    }
    return _settingsCache;
  }

  function saveSettings(settings) {
    _settingsCache = settings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
    saveToServer('settings', settings);
  }

  // ─── Reset ──────────────────────────────────────────────────────────
  function resetAll() {
    _progressCache = createEmptyProgress();
    localStorage.removeItem(STORAGE_KEY);
    saveToServer('progress', _progressCache);
  }

  return {
    init,
    getProgress,
    markWordLearned,
    markSentenceLearned,
    recordQuizAnswer,
    getCategoryProgress,
    getWordsForReview,
    getCaretakerStats,
    recordSession,
    getSettings, saveSettings,
    resetAll
  };
})();

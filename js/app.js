// =============================================================================
// APP — Hauptlogik, Navigation und Screen-Management
// =============================================================================

const App = (() => {
  let currentCategory = null;
  let currentWordIndex = 0;
  let currentSentenceIndex = 0;
  let currentMode = null; // 'learn', 'quiz', 'sentences'
  let quizState = null;

  // ─── Navigation ─────────────────────────────────────────────────────
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
    Audio.stop();
  }

  function goHome() {
    currentCategory = null;
    currentMode = null;
    showScreen('screen-home');
    renderHome();
  }

  function goToCategory(categoryId) {
    currentCategory = getCategoryById(categoryId);
    if (!currentCategory) return;
    showScreen('screen-category');
    renderCategory();
  }

  function goToLearn() {
    if (!currentCategory || currentCategory.words.length === 0) return;
    currentWordIndex = 0;
    currentMode = 'learn';
    showScreen('screen-learn');
    renderLearnCard();
  }

  function goToSentences() {
    if (!currentCategory || currentCategory.sentences.length === 0) return;
    currentSentenceIndex = 0;
    currentMode = 'sentences';
    showScreen('screen-sentences');
    renderSentenceCard();
  }

  function goToQuiz() {
    if (!currentCategory || currentCategory.words.length < 2) return;
    currentMode = 'quiz';

    // Restore quiz area HTML (may have been replaced by quiz-complete)
    document.getElementById('quiz-area').innerHTML = `
      <div class="quiz-prompt">
        <button class="btn-play" onclick="App.replayQuizAudio()" aria-label="Nochmal hören" style="width: 60px; height: 60px; font-size: 1.6rem;">
          🔊
        </button>
      </div>
      <div class="quiz-options" id="quiz-options"></div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
      <div class="quiz-progress" id="quiz-progress"></div>
    `;

    initQuiz();
    showScreen('screen-quiz');
    renderQuizQuestion();
  }

  function goToSentenceQuiz() {
    if (!currentCategory || !currentCategory.sentences || currentCategory.sentences.length < 2) return;
    currentMode = 'sentence-quiz';

    document.getElementById('quiz-area').innerHTML = `
      <div class="quiz-prompt">
        <button class="btn-play" onclick="App.replayQuizAudio()" aria-label="Nochmal hören" style="width: 60px; height: 60px; font-size: 1.6rem;">
          🔊
        </button>
      </div>
      <div class="quiz-options sentence-quiz-options" id="quiz-options"></div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
      <div class="quiz-progress" id="quiz-progress"></div>
    `;

    initSentenceQuiz();
    showScreen('screen-quiz');
    renderSentenceQuizQuestion();
  }

  function goBack() {
    if (currentMode === 'learn' || currentMode === 'sentences' || currentMode === 'quiz' || currentMode === 'sentence-quiz') {
      currentMode = null;
      if (currentCategory && currentCategory.id === '_daily') {
        goHome();
      } else {
        showScreen('screen-category');
        renderCategory();
      }
    } else if (currentMode === 'guide') {
      goToGuidesList();
    } else if (currentMode === 'guides-list') {
      goHome();
    } else if (currentCategory) {
      goHome();
    }
  }

  // ─── HOME SCREEN ───────────────────────────────────────────────────
  let customCategories = [];
  let guides = [];
  let categoryPermissions = {};

  async function loadCustomData() {
    // 1. Try Supabase cloud first
    if (window.SupaSync) {
      const [cloudCats, cloudGuides, cloudPerms] = await Promise.all([
        SupaSync.get('custom-categories', null),
        SupaSync.get('guides', null),
        SupaSync.get('category-permissions', null)
      ]);
      if (cloudCats !== null) customCategories = cloudCats;
      if (cloudGuides !== null) guides = cloudGuides;
      if (cloudPerms !== null) categoryPermissions = cloudPerms;
    }

    // 2. Fallback to local server / localStorage
    try {
      const [catRes, guideRes, permRes] = await Promise.all([
        fetch('/api/custom-categories'),
        fetch('/api/guides'),
        fetch('/api/category-permissions')
      ]);
      if (catRes.ok && customCategories.length === 0) customCategories = await catRes.json();
      if (guideRes.ok && guides.length === 0) guides = await guideRes.json();
      if (permRes.ok && Object.keys(categoryPermissions).length === 0) categoryPermissions = await permRes.json();
    } catch (e) {}

    if (Object.keys(categoryPermissions).length === 0) {
      try {
        const storedPerms = localStorage.getItem('category_permissions');
        if (storedPerms) categoryPermissions = JSON.parse(storedPerms);
      } catch (e) {}
    }
  }

  function getAllCategories() {
    // Merge built-in + custom categories
    const custom = customCategories.map(c => ({
      ...c,
      color: c.color || '#888',
      words: c.words || [],
      sentences: c.sentences || []
    }));
    return [...CATEGORIES, ...custom];
  }

  function renderHome() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';

    // Daily practice button (large, spans full width)
    const dailyBtn = document.createElement('div');
    dailyBtn.className = 'category-card';
    dailyBtn.style.gridColumn = '1 / -1';
    dailyBtn.style.background = 'linear-gradient(135deg, #5b8db8 0%, #7ba5cc 100%)';
    dailyBtn.style.color = 'white';
    dailyBtn.style.padding = '16px';
    dailyBtn.innerHTML = `
      <span class="category-card-emoji" style="font-size:2.2rem;">🔄</span>
      <div style="font-size:0.85rem; margin-top:4px; opacity:0.9;">Tägliche Übung</div>
    `;
    dailyBtn.addEventListener('click', () => goToDailyPractice());
    grid.appendChild(dailyBtn);

    // Guides button (if guides exist)
    if (guides.length > 0) {
      const guideBtn = document.createElement('div');
      guideBtn.className = 'category-card';
      guideBtn.style.gridColumn = '1 / -1';
      guideBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #6fcf97 100%)';
      guideBtn.style.color = 'white';
      guideBtn.style.padding = '16px';
      guideBtn.innerHTML = `
        <span class="category-card-emoji" style="font-size:2.2rem;">📋</span>
        <div style="font-size:0.85rem; margin-top:4px; opacity:0.9;">Anleitungen</div>
      `;
      guideBtn.addEventListener('click', () => goToGuidesList());
      grid.appendChild(guideBtn);
    }

    // Category cards (filtered by caretaker permissions)
    const allCats = getAllCategories().filter(cat => {
      if (!categoryPermissions || Object.keys(categoryPermissions).length === 0) return true;
      const perm = categoryPermissions[cat.id];
      if (perm === undefined) return true; // unlocked by default
      return perm.unlocked !== false;
    });
    allCats.forEach(cat => {
      const progress = Progress.getCategoryProgress(cat);
      const totalItems = (cat.words || []).length + (cat.sentences || []).length;
      const dotsCount = Math.min(totalItems, 8);
      const filledDots = Math.round((progress / 100) * dotsCount);
      const catName = cat.name || cat.id;

      const card = document.createElement('div');
      card.className = 'category-card';
      card.style.borderColor = progress > 0 ? (cat.color || '#3498db') + '40' : 'transparent';
      card.innerHTML = `
        <span class="category-card-emoji">${cat.emoji}</span>
        <div class="category-card-name">${catName}</div>
        <div class="category-card-progress">
          ${Array.from({length: dotsCount}, (_, i) =>
            `<div class="progress-dot ${i < filledDots ? 'filled' : ''}"></div>`
          ).join('')}
        </div>
      `;
      card.addEventListener('click', () => goToCategory(cat.id));
      grid.appendChild(card);
    });

    // Streak counter
    renderStreak();
  }

  // ─── CATEGORY SCREEN ───────────────────────────────────────────────
  function renderCategory() {
    if (!currentCategory) return;

    document.getElementById('category-emoji').textContent = currentCategory.emoji;
    const catHeaderTitle = document.querySelector('#screen-category .header-title');
    if (catHeaderTitle) {
      catHeaderTitle.textContent = currentCategory.name || currentCategory.id;
    }

    const buttonsContainer = document.getElementById('mode-buttons');
    buttonsContainer.innerHTML = '';

    // Learn button (words)
    if (currentCategory.words.length > 0) {
      buttonsContainer.innerHTML += `
        <button class="mode-btn" onclick="App.goToLearn()">
          <span class="mode-btn-emoji">📖</span>
          <span class="mode-btn-label">Wörter lernen</span>
          <span class="mode-btn-arrow">→</span>
        </button>
      `;
    }

    // Sentences button
    if (currentCategory.sentences.length > 0) {
      buttonsContainer.innerHTML += `
        <button class="mode-btn" onclick="App.goToSentences()">
          <span class="mode-btn-emoji">💬</span>
          <span class="mode-btn-label">Sätze üben</span>
          <span class="mode-btn-arrow">→</span>
        </button>
      `;
    }

    // Quiz button (needs at least 2 words)
    if (currentCategory.words && currentCategory.words.length >= 2) {
      buttonsContainer.innerHTML += `
        <button class="mode-btn" onclick="App.goToQuiz()">
          <span class="mode-btn-emoji">🎯</span>
          <span class="mode-btn-label">Wörter-Quiz</span>
          <span class="mode-btn-arrow">→</span>
        </button>
      `;
    }

    // Sentence Quiz button (needs at least 2 sentences)
    if (currentCategory.sentences && currentCategory.sentences.length >= 2) {
      buttonsContainer.innerHTML += `
        <button class="mode-btn" onclick="App.goToSentenceQuiz()">
          <span class="mode-btn-emoji">🧩</span>
          <span class="mode-btn-label">Satz-Quiz</span>
          <span class="mode-btn-arrow">→</span>
        </button>
      `;
    }
  }

  // ─── LEARN SCREEN ──────────────────────────────────────────────────
  function renderLearnCard() {
    if (!currentCategory) return;
    const words = currentCategory.words;
    const word = words[currentWordIndex];

    document.getElementById('learn-emoji').textContent = word.emoji;

    const wordText = document.getElementById('learn-word-text');
    const settings = Progress.getSettings();
    wordText.textContent = word.german;
    wordText.className = 'learn-word-text' + (settings.showText ? '' : ' hidden');

    document.getElementById('learn-counter').textContent =
      `${currentWordIndex + 1} / ${words.length}`;

    document.getElementById('btn-prev').disabled = currentWordIndex === 0;
    document.getElementById('btn-next').disabled = currentWordIndex === words.length - 1;

    // Mark as learned
    Progress.markWordLearned(word.id);
  }

  function learnPrev() {
    if (currentWordIndex > 0) {
      currentWordIndex--;
      renderLearnCard();
    }
  }

  function learnNext() {
    const words = currentCategory.words;
    if (currentWordIndex < words.length - 1) {
      currentWordIndex++;
      renderLearnCard();
      // Auto-play audio for new card
      setTimeout(() => speakCurrentWord(), 300);
    }
  }

  function speakCurrentWord() {
    if (!currentCategory) return;
    const word = currentCategory.words[currentWordIndex];
    const btn = document.getElementById('btn-play-learn');
    btn.classList.add('playing');
    Audio.speak(word.german, () => {
      btn.classList.remove('playing');
    });
  }

  // ─── SENTENCE SCREEN ──────────────────────────────────────────────
  function renderSentenceCard() {
    if (!currentCategory) return;
    const sentences = currentCategory.sentences;
    const sentence = sentences[currentSentenceIndex];

    const emojisContainer = document.getElementById('sentence-emojis');
    emojisContainer.innerHTML = sentence.emojis
      .map(e => `<span class="sentence-emoji-item">${e}</span>`)
      .join('');

    const sentenceText = document.getElementById('sentence-text');
    const settings = Progress.getSettings();
    sentenceText.textContent = sentence.german;
    sentenceText.className = 'sentence-text' + (settings.showText ? '' : ' hidden');

    document.getElementById('sentence-counter').textContent =
      `${currentSentenceIndex + 1} / ${sentences.length}`;

    document.getElementById('btn-prev-sentence').disabled = currentSentenceIndex === 0;
    document.getElementById('btn-next-sentence').disabled = currentSentenceIndex === sentences.length - 1;

    // Mark as learned
    Progress.markSentenceLearned(sentence.id);
  }

  function sentencePrev() {
    if (currentSentenceIndex > 0) {
      currentSentenceIndex--;
      renderSentenceCard();
    }
  }

  function sentenceNext() {
    const sentences = currentCategory.sentences;
    if (currentSentenceIndex < sentences.length - 1) {
      currentSentenceIndex++;
      renderSentenceCard();
      setTimeout(() => speakCurrentSentence(), 300);
    }
  }

  function speakCurrentSentence() {
    if (!currentCategory) return;
    const sentence = currentCategory.sentences[currentSentenceIndex];
    const btn = document.getElementById('btn-play-sentence');
    btn.classList.add('playing');
    Audio.speak(sentence.german, () => {
      btn.classList.remove('playing');
    });
  }

  // ─── WORD QUIZ ──────────────────────────────────────────────────────
  function initQuiz() {
    const words = [...currentCategory.words];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    const quizWords = words.slice(0, Math.min(6, words.length));

    quizState = {
      isSentence: false,
      questions: quizWords,
      currentIndex: 0,
      correctCount: 0,
      initialTotal: quizWords.length,
      retryCount: 0,
      answered: false
    };

    Progress.recordSession();
  }

  function renderQuizQuestion() {
    if (!quizState) return;

    if (quizState.currentIndex >= quizState.questions.length) {
      renderQuizComplete();
      return;
    }

    const question = quizState.questions[quizState.currentIndex];
    const allWords = currentCategory.words;

    // Generate wrong options (2-3 total options including correct)
    const numOptions = Math.min(3, allWords.length);
    let options = [question];

    const otherWords = allWords.filter(w => w.id !== question.id);
    const shuffledOther = otherWords.sort(() => Math.random() - 0.5);
    options = options.concat(shuffledOther.slice(0, numOptions - 1));

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    quizState.answered = false;

    // Render
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.className = 'quiz-options';
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'quiz-option';
      btn.textContent = opt.emoji;
      btn.dataset.wordId = opt.id;
      btn.addEventListener('click', () => handleQuizAnswer(opt.id, question.id, btn));
      optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback').textContent = '';

    // Render progress dots
    const progressContainer = document.getElementById('quiz-progress');
    const totalDots = Math.min(quizState.questions.length, 10);
    progressContainer.innerHTML = Array.from({ length: totalDots }, (_, i) => {
      let cls = 'quiz-progress-dot';
      if (i < quizState.currentIndex) cls += ' done';
      if (i === quizState.currentIndex) cls += ' current';
      return `<div class="${cls}"></div>`;
    }).join('');

    // Auto-speak the question
    setTimeout(() => {
      Audio.speak(question.german);
    }, 400);
  }

  function handleQuizAnswer(selectedId, correctId, btnElement) {
    if (quizState.answered) return;
    quizState.answered = true;

    const isCorrect = selectedId === correctId;
    const feedback = document.getElementById('quiz-feedback');
    const currentQ = quizState.questions[quizState.currentIndex];

    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.add('disabled');
      if (opt.dataset.wordId === correctId) {
        opt.classList.add('correct');
      }
    });

    if (isCorrect) {
      btnElement.classList.add('correct');
      feedback.textContent = '✅';
      Audio.playSuccessSound();
      quizState.correctCount++;
    } else {
      btnElement.classList.add('wrong');
      feedback.textContent = '🔄';
      Audio.playTryAgainSound();
      // Repetition: add question back to the end of the queue for spaced reinforcement (up to 3 retries)
      if (quizState.retryCount < 3) {
        quizState.questions.push(currentQ);
        quizState.retryCount++;
      }
      // Speak the correct word again after a moment
      const correctWord = currentCategory.words.find(w => w.id === correctId);
      setTimeout(() => Audio.speak(correctWord ? correctWord.german : currentQ.german), 800);
    }

    // Record answer
    Progress.recordQuizAnswer(currentCategory.id, correctId, isCorrect);

    // Move to next question after delay
    setTimeout(() => {
      quizState.currentIndex++;
      renderQuizQuestion();
    }, isCorrect ? 1500 : 2500);
  }

  // ─── SENTENCE QUIZ (Satz-Quiz) ──────────────────────────────────────
  function initSentenceQuiz() {
    const sentences = [...currentCategory.sentences];
    for (let i = sentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }
    const quizSentences = sentences.slice(0, Math.min(5, sentences.length));

    quizState = {
      isSentence: true,
      questions: quizSentences,
      currentIndex: 0,
      correctCount: 0,
      initialTotal: quizSentences.length,
      retryCount: 0,
      answered: false
    };

    Progress.recordSession();
  }

  function renderSentenceQuizQuestion() {
    if (!quizState) return;

    if (quizState.currentIndex >= quizState.questions.length) {
      renderQuizComplete();
      return;
    }

    const question = quizState.questions[quizState.currentIndex];
    const allSentences = currentCategory.sentences;

    const numOptions = Math.min(3, allSentences.length);
    let options = [question];

    const otherSentences = allSentences.filter(s => s.id !== question.id);
    const shuffledOther = otherSentences.sort(() => Math.random() - 0.5);
    options = options.concat(shuffledOther.slice(0, numOptions - 1));

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    quizState.answered = false;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.className = 'quiz-options sentence-quiz-options';
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'quiz-option sentence-option';
      btn.innerHTML = opt.emojis.map(e => `<span>${e}</span>`).join(' ');
      btn.dataset.sentenceId = opt.id;
      btn.addEventListener('click', () => handleSentenceQuizAnswer(opt.id, question.id, btn));
      optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback').textContent = '';

    const progressContainer = document.getElementById('quiz-progress');
    const totalDots = Math.min(quizState.questions.length, 10);
    progressContainer.innerHTML = Array.from({ length: totalDots }, (_, i) => {
      let cls = 'quiz-progress-dot';
      if (i < quizState.currentIndex) cls += ' done';
      if (i === quizState.currentIndex) cls += ' current';
      return `<div class="${cls}"></div>`;
    }).join('');

    setTimeout(() => {
      Audio.speak(question.german);
    }, 400);
  }

  function handleSentenceQuizAnswer(selectedId, correctId, btnElement) {
    if (quizState.answered) return;
    quizState.answered = true;

    const isCorrect = selectedId === correctId;
    const feedback = document.getElementById('quiz-feedback');
    const currentQ = quizState.questions[quizState.currentIndex];

    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.add('disabled');
      if (opt.dataset.sentenceId === correctId) {
        opt.classList.add('correct');
      }
    });

    if (isCorrect) {
      btnElement.classList.add('correct');
      feedback.textContent = '✅';
      Audio.playSuccessSound();
      quizState.correctCount++;
    } else {
      btnElement.classList.add('wrong');
      feedback.textContent = '🔄';
      Audio.playTryAgainSound();
      if (quizState.retryCount < 3) {
        quizState.questions.push(currentQ);
        quizState.retryCount++;
      }
      setTimeout(() => Audio.speak(currentQ.german), 800);
    }

    Progress.recordQuizAnswer(currentCategory.id, correctId, isCorrect);

    setTimeout(() => {
      quizState.currentIndex++;
      renderSentenceQuizQuestion();
    }, isCorrect ? 1600 : 2600);
  }

  function renderQuizComplete() {
    const total = quizState.initialTotal || quizState.questions.length;
    const correct = Math.min(quizState.correctCount, total);
    const stars = correct === total ? '⭐⭐⭐' :
                  correct >= total * 0.7 ? '⭐⭐' :
                  correct > 0 ? '⭐' : '💪';

    const restartFn = quizState.isSentence ? 'App.goToSentenceQuiz()' : 'App.goToQuiz()';

    const container = document.getElementById('quiz-area');
    container.innerHTML = `
      <div class="quiz-complete">
        <div class="quiz-complete-emoji">🎉</div>
        <div class="quiz-complete-stars">${stars}</div>
        <div style="color: #666; font-size: 1.1rem; font-weight:600;">${correct} von ${total} richtig!</div>
        ${quizState.retryCount > 0 ? '<div style="color: #999; font-size: 0.85rem; margin-top:4px;">Mit Wiederholungen gemeistert ✨</div>' : ''}
        <button class="btn-primary" onclick="${restartFn}" style="margin-top: 16px;">
          🔄 Noch einmal
        </button>
        <button class="btn-primary" onclick="App.goBack()" style="margin-top: 8px; background: #e8e2dc; color: #5a5a5a; box-shadow: none;">
          ← Zurück
        </button>
      </div>
    `;

    Audio.playSuccessSound();
  }

  // ─── Replay button for quiz ─────────────────────────────────────────
  function replayQuizAudio() {
    if (!quizState || quizState.answered) return;
    const question = quizState.questions[quizState.currentIndex];
    Audio.speak(question.german);
  }

  // ─── DAILY PRACTICE (Tägliche Übung) ──────────────────────────────
  function goToDailyPractice() {
    // Collect words from all categories for mixed review
    const allCats = getAllCategories();
    let allWords = [];
    allCats.forEach(cat => {
      cat.words.forEach(w => allWords.push({ ...w, categoryId: cat.id }));
    });

    if (allWords.length < 3) return;

    // Shuffle
    for (let i = allWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
    }

    // Take 8 words for daily practice
    const dailyWords = allWords.slice(0, Math.min(8, allWords.length));

    // Create a temporary category for the quiz
    currentCategory = {
      id: '_daily',
      emoji: '🔄',
      color: '#5b8db8',
      words: dailyWords,
      sentences: []
    };

    currentMode = 'quiz';

    // Restore quiz area
    document.getElementById('quiz-area').innerHTML = `
      <div class="quiz-prompt">
        <button class="btn-play" onclick="App.replayQuizAudio()" aria-label="Nochmal hören" style="width: 60px; height: 60px; font-size: 1.6rem;">
          🔊
        </button>
      </div>
      <div class="quiz-options" id="quiz-options"></div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
      <div class="quiz-progress" id="quiz-progress"></div>
    `;

    initQuiz();
    showScreen('screen-quiz');
    renderQuizQuestion();
  }

  // ─── GUIDES (Anleitungen) ─────────────────────────────────────────
  let currentGuide = null;
  let currentGuideStep = 0;

  function goToGuidesList() {
    currentMode = 'guides-list';
    showScreen('screen-guides-list');
    renderGuidesList();
  }

  function renderGuidesList() {
    const list = document.getElementById('guides-list');
    list.innerHTML = '';

    guides.forEach(guide => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'row';
      card.style.alignItems = 'center';
      card.style.gap = '16px';
      card.style.padding = '20px';
      card.style.textAlign = 'left';
      card.innerHTML = `
        <span style="font-size:2.5rem;">${guide.emoji || '📋'}</span>
        <span style="font-size:1rem; font-weight:600; color:#4a4a4a; flex:1;">${guide.title}</span>
        <span style="font-size:1.2rem; color:#bbb;">→</span>
      `;
      card.addEventListener('click', () => startGuide(guide));
      list.appendChild(card);
    });
  }

  function startGuide(guide) {
    currentGuide = guide;
    currentGuideStep = 0;
    currentMode = 'guide';
    showScreen('screen-guide');
    renderGuideStep();
  }

  function renderGuideStep() {
    if (!currentGuide) return;

    const step = currentGuide.steps[currentGuideStep];
    const total = currentGuide.steps.length;
    const isLast = currentGuideStep === total - 1;

    document.getElementById('guide-title-emoji').textContent = currentGuide.emoji || '📋';

    const emojisEl = document.getElementById('guide-step-emojis');
    emojisEl.innerHTML = step.emojis
      .map(e => `<span class="sentence-emoji-item">${e}</span>`)
      .join('');

    const textEl = document.getElementById('guide-step-text');
    const settings = Progress.getSettings();
    textEl.textContent = step.german;
    textEl.className = 'sentence-text' + (settings.showText ? '' : ' hidden');

    // Progress bar
    const pct = ((currentGuideStep + 1) / total) * 100;
    document.getElementById('guide-progress-fill').style.width = pct + '%';
    document.getElementById('guide-counter').textContent = `${currentGuideStep + 1} / ${total}`;

    // Button
    const btn = document.getElementById('guide-next-btn');
    if (isLast) {
      btn.textContent = '🎉';
      btn.onclick = () => goHome();
    } else {
      btn.textContent = '✅';
      btn.onclick = () => guideNext();
    }
  }

  function guideNext() {
    if (!currentGuide) return;
    if (currentGuideStep < currentGuide.steps.length - 1) {
      currentGuideStep++;
      renderGuideStep();
      setTimeout(() => speakGuideStep(), 300);
    }
  }

  function speakGuideStep() {
    if (!currentGuide) return;
    const step = currentGuide.steps[currentGuideStep];
    Audio.speak(step.german);
  }

  // ─── STREAK / BELOHNUNGEN ─────────────────────────────────────────
  function renderStreak() {
    const container = document.getElementById('streak-container');
    if (!container) return;

    const p = Progress.getProgress();
    const totalWords = Object.values(p.words || {}).filter(w => w.learned).length;
    const totalSessions = p.totalSessions || 0;

    // Check streak
    const today = new Date().toLocaleDateString('de-DE');
    const isActiveToday = p.lastSessionDate === today;

    container.innerHTML = `
      <div style="display:flex; justify-content:center; gap:20px; padding:8px 0;">
        <div style="text-align:center;">
          <div style="font-size:1.4rem; font-weight:700; color:#5b8db8;">${totalWords}</div>
          <div style="font-size:0.7rem; color:#999;">Wörter</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.4rem; font-weight:700; color:#7cb97c;">${totalSessions}</div>
          <div style="font-size:0.7rem; color:#999;">Übungen</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.4rem;">${isActiveToday ? '🔥' : '⭐'}</div>
          <div style="font-size:0.7rem; color:#999;">${isActiveToday ? 'Heute aktiv' : 'Los geht\'s!'}</div>
        </div>
      </div>
    `;
  }

  // ─── PROFILE / PERSONALISIERUNG ────────────────────────────────────
  let profile = {};

  async function fetchProfile() {
    // 1. Try Supabase cloud first
    if (window.SupaSync) {
      const cloudProfile = await SupaSync.get('profile', null);
      if (cloudProfile && cloudProfile.residentName) return cloudProfile;
    }
    // 2. Fallback to local server
    try {
      const res = await fetch('/api/profile');
      if (res.ok) return await res.json();
    } catch (e) {}
    return {};
  }

  async function saveProfile(data) {
    if (window.SupaSync) {
      SupaSync.set('profile', data);
    }
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  }

  function applyProfile() {
    const greeting = document.getElementById('home-greeting');
    const title = document.getElementById('home-title');

    if (profile.residentName) {
      greeting.textContent = `Hallo, ${profile.residentName}!`;
      title.textContent = `📖 ${profile.residentName}`;
    } else {
      greeting.textContent = '';
      title.textContent = '📖 Deutsch Lernen';
    }
  }

  async function saveSetup() {
    const nameInput = document.getElementById('setup-name');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderColor = '#d4816b';
      return;
    }
    profile.residentName = name;
    await saveProfile(profile);
    applyProfile();
    goHome();
  }

  // ─── INIT ──────────────────────────────────────────────────────────
  async function init() {
    if (window.SupaSync) {
      await SupaSync.init();
      // Setup realtime subscriptions so changes from caretaker phone update instantly
      SupaSync.subscribe('guides', (newGuides) => {
        guides = newGuides;
        if (currentMode === 'guides-list') renderGuidesList();
        else if (!currentCategory && !currentMode) renderHome();
      });
      SupaSync.subscribe('custom-categories', (newCats) => {
        customCategories = newCats;
        if (!currentCategory && !currentMode) renderHome();
      });
      SupaSync.subscribe('profile', (newProfile) => {
        profile = newProfile;
        applyProfile();
      });
      SupaSync.subscribe('category-permissions', (newPerms) => {
        categoryPermissions = newPerms || {};
        if (!currentCategory && !currentMode) renderHome();
      });
    }

    Audio.init();
    await Progress.init();
    await loadCustomData();

    // Load profile
    profile = await fetchProfile();

    if (!profile.residentName) {
      showScreen('screen-setup');
      setTimeout(() => document.getElementById('setup-name').focus(), 300);
    } else {
      applyProfile();
      goHome();
    }
  }

  // Public API
  return {
    init, saveSetup,
    goHome, goToCategory, goToLearn, goToSentences, goToQuiz, goToSentenceQuiz, goBack,
    goToDailyPractice, goToGuidesList, startGuide,
    learnPrev, learnNext, speakCurrentWord,
    sentencePrev, sentenceNext, speakCurrentSentence,
    replayQuizAudio, guideNext, speakGuideStep
  };
})();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);

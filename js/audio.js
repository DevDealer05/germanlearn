// =============================================================================
// AUDIO — Text-to-Speech Wrapper (Deutsche Aussprache)
// =============================================================================

const Audio = (() => {
  let synth = window.speechSynthesis;
  let germanVoice = null;
  let isPlaying = false;

  // Find the best German voice
  function findGermanVoice() {
    const voices = synth.getVoices();
    // Prefer high-quality German voices
    germanVoice =
      voices.find(v => v.lang === 'de-DE' && v.localService) ||
      voices.find(v => v.lang === 'de-DE') ||
      voices.find(v => v.lang.startsWith('de')) ||
      null;
  }

  // Initialize voices (may load async)
  function init() {
    findGermanVoice();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = findGermanVoice;
    }
  }

  // Speak a German text
  function speak(text, onEnd) {
    if (isPlaying) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.75; // Langsam sprechen — sehr wichtig!
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    isPlaying = true;

    utterance.onend = () => {
      isPlaying = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      isPlaying = false;
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
  }

  // Stop any ongoing speech
  function stop() {
    synth.cancel();
    isPlaying = false;
  }

  // Play a simple success sound (using AudioContext)
  function playSuccessSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context not available, silent fail
    }
  }

  // Play a gentle "try again" sound
  function playTryAgainSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(294, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Silent fail
    }
  }

  return { init, speak, stop, playSuccessSound, playTryAgainSound, get isPlaying() { return isPlaying; } };
})();

/**
 * Cross-platform speech utility
 * Optimized for Android WebView compatibility
 * 
 * Strategy:
 * 1. Primary: Google TTS via Audio() - synchronous in click handler
 * 2. Fallback: Web Speech API with pre-initialization
 */

// ── Audio cache ──
const audioCache = new Map<string, HTMLAudioElement>();

// ── Speech API state ──
let speechInitialized = false;
let availableVoices: SpeechSynthesisVoice[] = [];
let englishVoice: SpeechSynthesisVoice | null = null;

/**
 * Pre-initialize the speech engine.
 * Call this on first user interaction (e.g. "开始学习" button).
 * Speaking an empty utterance wakes up Android's TTS engine.
 */
export function initSpeechEngine(): void {
  if (speechInitialized) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Wake up the engine with an empty utterance
    const empty = new SpeechSynthesisUtterance('');
    empty.volume = 0;
    window.speechSynthesis.speak(empty);
    speechInitialized = true;
    console.log('[Speech] Engine pre-initialized');
  } catch (e) {
    console.warn('[Speech] Pre-init failed:', e);
  }

  // Load voices
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

function loadVoices(): void {
  const voices = window.speechSynthesis.getVoices();
  availableVoices = voices;
  englishVoice =
    voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
    voices.find(v => v.lang.startsWith('en') && !v.localService === false) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
  console.log(`[Speech] Voices loaded: ${voices.length}, english: ${englishVoice?.name || 'none'}`);
}

// Auto-init when module loads (best effort)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

// ── TTS URL ──
function getTTSUrl(text: string, lang: string = 'en'): string {
  const encoded = encodeURIComponent(text.slice(0, 200));
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
}

/**
 * Preload audio for instant playback
 */
export function preloadWord(word: string, lang: string = 'en'): void {
  if (audioCache.has(word)) return;
  try {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = getTTSUrl(word, lang);
    audio.load();
    audioCache.set(word, audio);
  } catch (e) {
    // Silent
  }
}

/**
 * Speak a word - MUST be called directly from onClick handler (synchronous)
 */
export function speakWord(word: string, lang: string = 'en', rate: number = 0.8): Promise<void> {
  // Ensure engine is initialized
  if (!speechInitialized) initSpeechEngine();

  // Strategy 1: Audio API (best for Android WebView)
  try {
    let audio: HTMLAudioElement;

    if (audioCache.has(word)) {
      audio = audioCache.get(word)!;
      audio.currentTime = 0;
    } else {
      // CRITICAL: Create synchronously in click handler
      audio = new Audio();
      audio.preload = 'auto';
      audio.src = getTTSUrl(word, lang);
      audioCache.set(word, audio);
    }

    // CRITICAL: .play() synchronously - NOT after await
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      return playPromise
        .then(() => new Promise<void>(resolve => {
          audio.onended = () => resolve();
          setTimeout(resolve, 5000);
        }))
        .catch((err) => {
          console.warn('[Speech] Audio.play() failed, falling back to SpeechAPI:', err.message);
          return speakWithSpeechAPI(word, lang, rate);
        });
    }

    return new Promise<void>(resolve => {
      audio.onended = () => resolve();
      setTimeout(resolve, 5000);
    });
  } catch (e) {
    console.warn('[Speech] Audio creation failed, using SpeechAPI:', e);
    return speakWithSpeechAPI(word, lang, rate);
  }
}

/**
 * Fallback: Web Speech API with full Android-safe handling
 */
function speakWithSpeechAPI(text: string, lang: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[Speech] speechSynthesis not available');
      resolve();
      return;
    }

    // CRITICAL: Cancel pending speech to prevent engine freeze
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use cached voice
    if (englishVoice && lang === 'en') {
      utterance.voice = englishVoice;
    }

    // Detailed logging for debugging on Android
    utterance.onstart = () => {
      console.log('[Speech] Started:', text.slice(0, 30));
    };

    utterance.onerror = (event) => {
      console.error('[Speech] Error:', event.error, 'text:', text.slice(0, 30));
      resolve();
    };

    utterance.onend = () => {
      console.log('[Speech] Ended:', text.slice(0, 30));
      resolve();
    };

    // Check voices availability
    if (availableVoices.length === 0) {
      console.warn('[Speech] No voices available, attempting anyway');
    }

    window.speechSynthesis.speak(utterance);

    // Safety timeout
    setTimeout(resolve, 8000);
  });
}

/**
 * Speak longer text - also Android-safe
 */
export function speakText(text: string, lang: string = 'en', rate: number = 0.8): Promise<void> {
  return speakWord(text, lang, rate);
}

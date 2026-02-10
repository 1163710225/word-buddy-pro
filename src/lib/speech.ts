/**
 * Cross-platform speech utility
 * Optimized for Android WebView compatibility
 * 
 * Strategy:
 * 1. Primary: Use a free TTS API via Audio() for reliable Android playback
 * 2. Fallback: Web Speech API
 * 
 * Key Android rules:
 * - new Audio() and .play() MUST be called synchronously in the click handler
 * - Never place .play() after an await
 * - Use https URLs only
 * - Preload audio when possible
 */

// Audio cache for preloaded words
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Get a TTS audio URL (free, no API key needed)
 * Uses Google Translate TTS endpoint over HTTPS
 */
function getTTSUrl(text: string, lang: string = 'en'): string {
  const encoded = encodeURIComponent(text.slice(0, 200));
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
}

/**
 * Preload audio for a word so it plays instantly on click
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
    // Silently fail preload
  }
}

/**
 * Speak a word - MUST be called directly from onClick handler (synchronous)
 * 
 * This function synchronously creates Audio and calls .play() to satisfy
 * Android WebView's user-gesture requirement.
 */
export function speakWord(word: string, lang: string = 'en', rate: number = 0.8): Promise<void> {
  // Strategy 1: Try Audio API (works better on Android WebView)
  try {
    let audio: HTMLAudioElement;
    
    // Use cached audio if available
    if (audioCache.has(word)) {
      audio = audioCache.get(word)!;
      audio.currentTime = 0;
    } else {
      // CRITICAL: Create Audio synchronously in the click handler
      audio = new Audio();
      audio.preload = 'auto';
      audio.src = getTTSUrl(word, lang);
      audioCache.set(word, audio);
    }

    // CRITICAL: Call .play() synchronously - NOT after await
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          return new Promise<void>((resolve) => {
            audio.onended = () => resolve();
          });
        })
        .catch((err) => {
          console.warn('Audio play failed, trying Speech API fallback:', err);
          return speakWithSpeechAPI(word, lang, rate);
        });
    }
    
    return new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      // Timeout fallback
      setTimeout(resolve, 3000);
    });
  } catch (e) {
    console.warn('Audio creation failed, using Speech API:', e);
    return speakWithSpeechAPI(word, lang, rate);
  }
}

/**
 * Fallback: Web Speech API
 */
function speakWithSpeechAPI(word: string, lang: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang === 'en' ? 'en-US' : lang;
    utterance.rate = rate;

    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    speechSynthesis.speak(utterance);
    
    // Safety timeout
    setTimeout(resolve, 5000);
  });
}

/**
 * Speak longer text (sentences, examples) - also Android-safe
 */
export function speakText(text: string, lang: string = 'en', rate: number = 0.8): Promise<void> {
  return speakWord(text, lang, rate);
}

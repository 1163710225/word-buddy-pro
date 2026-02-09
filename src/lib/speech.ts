/**
 * Cross-platform speech utility
 * Uses Web Speech API with fallback for Android WebView compatibility
 */

let speechSupported: boolean | null = null;

function isSpeechSupported(): boolean {
  if (speechSupported !== null) return speechSupported;
  speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  return speechSupported;
}

export function speakWord(word: string, lang: string = 'en-US', rate: number = 0.8): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = rate;
    
    // Android WebView workaround: voices might not be loaded yet
    const trySpeak = () => {
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech error:', e);
        resolve(); // Don't reject, just resolve silently
      };
      
      speechSynthesis.speak(utterance);
    };

    // On Android, voices load asynchronously
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        trySpeak();
      };
      // Fallback timeout - speak anyway after 500ms
      setTimeout(trySpeak, 500);
    } else {
      trySpeak();
    }
  });
}

/**
 * Safe Speech Synthesis wrapper for sandboxed environments.
 * Prevents DOMExceptions and security policy blocks from crashing the application.
 */

export function isSpeechSynthesisSupported(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      !!window.speechSynthesis &&
      typeof window.speechSynthesis.speak === 'function'
    );
  } catch (e) {
    console.warn("Speech synthesis feature detection blocked or unsupported:", e);
    return false;
  }
}

export function safeCancelSpeech(): void {
  try {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn("SpeechSynthesis.cancel failed or was blocked:", e);
  }
}

export function safeSpeak(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): boolean {
  try {
    if (!isSpeechSynthesisSupported()) {
      return false;
    }

    // Always cancel existing speech first
    safeCancelSpeech();

    const cleanText = text.replace(/[\*#_]/g, ''); // strip basic markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (options?.rate !== undefined) utterance.rate = options.rate;
    if (options?.pitch !== undefined) utterance.pitch = options.pitch;
    
    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options?.onError) {
      utterance.onerror = options.onError;
    } else {
      utterance.onerror = (e) => {
        console.warn("Utterance speech synthesis error:", e);
      };
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn("SpeechSynthesis.speak failed or was blocked:", e);
    if (options?.onError) {
      options.onError(e);
    }
    return false;
  }
}

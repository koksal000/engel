'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// For typing purposes, as SpeechRecognition APIs are not standard on the window object yet.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

// The hook implements a turn-based system with silence detection.
export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');
  
  // Use a ref to hold the latest onResult callback to avoid dependency issues.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Use a ref to get the current listening state inside callbacks without adding it to dependency arrays.
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        recognitionRef.current.stop(); // This triggers the 'onend' event which sets isListening(false)
      } catch(e) {
        // This can happen if recognition is already stopping. It's safe to ignore.
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
          // Recognition was already stopped.
        } else {
          console.error("Speech recognition stop error:", e);
        }
      }
    }
  }, []); // Stable: No dependencies.

  const handleSilence = useCallback(() => {
    stopListening();
    onResultRef.current(transcriptRef.current);
  }, [stopListening]); // Stable: Depends on a stable function.

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'tr-TR';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = fullTranscript;

      // Reset the silence timer every time the user speaks.
      silenceTimerRef.current = setTimeout(handleSilence, 2000);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        // Clean up all event listeners and stop recognition on unmount
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    };
  }, [handleSilence]); // Stable: This effect should now run only once.

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
        try {
            transcriptRef.current = '';
            recognitionRef.current.start();
            // Set initial timeout in case of no speech at all.
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(handleSilence, 2200);
        } catch (e) {
            console.error("Speech recognition start error:", e);
        }
    }
  }, [handleSilence]); // Stable: Depends on a stable function.

  return {
    isListening,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

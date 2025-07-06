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

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');
  
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        // The onend event will handle emitting the result and cleaning up.
        recognitionRef.current.stop();
      } catch(e) {
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
          // Already stopped, safe to ignore.
        } else {
          console.error("Speech recognition stop error:", e);
        }
      }
    }
  }, []);

  // This function's only job is to trigger the stop.
  const handleSilence = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    }
  }, [stopListening]);

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

    // onend is the single source of truth for when listening is over.
    // It emits the final transcript, preventing race conditions.
    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      // Only emit the result if we were actively listening.
      // This prevents emitting a result on an error-based stop.
      if (isListeningRef.current) {
        onResultRef.current(transcriptRef.current);
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      // Ensure we stop listening on error to prevent the UI from getting stuck.
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = fullTranscript;

      // Reset silence timer. A more generous 2.5 seconds to allow for natural pauses.
      silenceTimerRef.current = setTimeout(handleSilence, 2500);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    };
  }, [handleSilence]); // handleSilence is stable due to useCallback.

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
        try {
            transcriptRef.current = '';
            recognitionRef.current.start();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            // More generous initial timeout (3s) to allow the mic to properly start up.
            silenceTimerRef.current = setTimeout(handleSilence, 3000);
        } catch (e) {
            console.error("Speech recognition start error:", e);
        }
    }
  }, [handleSilence]);

  return {
    isListening,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

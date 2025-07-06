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

// The hook now implements a turn-based system with silence detection.
export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');
  
  // Use a ref to hold the latest onResult callback to avoid dependency issues in useEffect.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        recognitionRef.current.stop();
      } catch(e) {
        console.error("Speech recognition stop error:", e);
      }
    }
  }, [isListening]);

  // This function is called when silence is detected or the user stops speaking.
  const handleSilence = useCallback(() => {
    stopListening();
    // Fire the callback with the accumulated transcript.
    onResultRef.current(transcriptRef.current);
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

      // Reset the timer every time the user speaks. After 2s of silence, handleSilence is called.
      silenceTimerRef.current = setTimeout(handleSilence, 2000);
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [handleSilence]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
        try {
            transcriptRef.current = '';
            recognitionRef.current.start();
            // Set initial timeout in case of no speech at all (e.g., user is silent).
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(handleSilence, 2200); // A bit longer to give user time
        } catch (e) {
            console.error("Speech recognition start error:", e);
        }
    }
  }, [isListening, handleSilence]);

  return {
    isListening,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

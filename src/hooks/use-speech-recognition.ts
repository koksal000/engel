'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  const transcriptRef = useRef('');

  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

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
      transcriptRef.current = '';
      setIsListening(true);
    };
    
    recognition.onend = () => {
      // isListening check prevents firing on error-triggered stops
      if (isListening) {
        onResultRef.current(transcriptRef.current);
      }
      setIsListening(false);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = fullTranscript;
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        try {
          recognitionRef.current.stop();
        } catch(e) {
            // Ignore errors if already stopped
        }
      }
    };
  // isListening is a dependency now, to re-bind onend handler correctly
  // with the latest state. But onend should be stable with refs.
  // The issue is onend needs the *current* isListening state.
  // So, we'll keep the dependency array empty and use a ref for isListening.
  }, []); // Run only once.

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            if (e instanceof DOMException && e.name === 'InvalidStateError') {
              // Already started, safe to ignore.
            } else {
              console.error("Speech recognition start error:", e);
            }
        }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
        try {
            recognitionRef.current.stop();
        } catch (e) {
            if (e instanceof DOMException && e.name === 'InvalidStateError') {
              // Already stopped, safe to ignore.
            } else {
              console.error("Speech recognition stop error:", e);
            }
        }
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

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

  // Use a ref for the callback to avoid re-creating the effect when the callback changes.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Setup recognition engine only once.
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
    
    // This is the key handler for push-to-talk. It fires when recognition.stop() is called.
    recognition.onend = () => {
      // The onResult callback is now called unconditionally on 'end'.
      // This ensures that when stopListening() is called, the result is always processed.
      onResultRef.current(transcriptRef.current);
      setIsListening(false);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    // Accumulate transcript from result chunks.
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = finalTranscript;
    };
    
    recognitionRef.current = recognition;

    // Cleanup function to stop recognition and remove listeners when the component unmounts.
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
  }, []); // Empty dependency array ensures this runs only once on mount.

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) { // Directly use state here
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
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) { // Directly use state here
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
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

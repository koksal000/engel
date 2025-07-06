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
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResult(finalTranscript); // Callback with the final result
      }
    };
    
    recognitionRef.current = recognition;

  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
        try {
            setTranscript('');
            recognitionRef.current.start();
        } catch (e) {
            console.error("Speech recognition start error:", e);
        }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch(e) {
            console.error("Speech recognition stop error:", e);
        }
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport: !!SpeechRecognition,
  };
};

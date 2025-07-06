'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Phone, PhoneOff, Mic, Bot } from 'lucide-react';
import type { ApplicationData, Call } from '@/lib/db';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech-flow';
import { hospitalConsultant } from '@/ai/flows/hospital-conversation-flow';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { SiteLogo } from './site-logo';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCachedAudio, addCachedAudio } from '@/lib/db';

export function CallUI({ callData, activeCall, onEndCall }: CallUIProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'active'>('incoming');
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleAIResponse = useCallback((convo: typeof conversation) => {
    setTimeout(async () => {
      setIsAIThinking(true);
      try {
        const aiResponseText = await hospitalConsultant({
          patientAnalysis: { ...callData },
          conversationHistory: convo,
        });

        if (!aiResponseText?.trim()) {
          console.warn("AI returned an empty response.");
          setIsAIThinking(false);
          return;
        }

        const updatedConversation = [...convo, { role: 'model' as const, text: aiResponseText }];
        setConversation(updatedConversation);

        let audioDataUri: string;
        const cachedAudio = await getCachedAudio(aiResponseText);
        
        if (cachedAudio) {
            audioDataUri = cachedAudio.audioDataUri;
        } else {
            const audioResponse = await convertTextToSpeech(aiResponseText);
            audioDataUri = audioResponse.audioDataUri;
            await addCachedAudio({ text: aiResponseText, audioDataUri });
        }

        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioDataUri;
          audioPlayerRef.current.play().catch(e => {
            if (e.name !== 'AbortError') {
              console.error('AI audio playback failed:', e);
            }
          });
        }
      } catch (error) {
        console.error("Error in conversation flow:", error);
        setIsAIThinking(false);
      }
    }, 0);
  }, [callData]);

  const handleSpeechResult = useCallback((text: string) => {
    if (text.trim()) {
        const newConversation = [...conversation, { role: 'user' as const, text: text.trim() }];
        setConversation(newConversation);
        handleAIResponse(newConversation);
    } else {
        // If user releases without speaking, AI just waits.
        setIsAIThinking(false);
    }
  }, [conversation, handleAIResponse]);
  
  const { isListening, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);

  const endAndCleanUp = useCallback((status: Call['status']) => {
    stopListening();
    ringtoneRef.current?.pause();
    if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
    }
    onEndCall(status);
  }, [onEndCall, stopListening]);
  
  useEffect(() => {
    if (callStatus === 'incoming') {
      ringtoneRef.current = new Audio('https://files.catbox.moe/m9izjy.m4a');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => {
        if (e.name !== 'AbortError') console.error('Ringtone playback error:', e);
      });

      const missedCallTimeout = setTimeout(() => {
        toast({
          title: "Cevapsız Arama",
          description: `Deniz Tuğrul'dan gelen aramayı kaçırdınız.`,
          variant: "default",
        });
        endAndCleanUp('missed');
      }, 25000);

      return () => {
        ringtoneRef.current?.pause();
        clearTimeout(missedCallTimeout);
      };
    }
  }, [callStatus, endAndCleanUp, toast]);
  
  useEffect(() => {
    audioPlayerRef.current = new Audio();
    const player = audioPlayerRef.current;

    const handleAudioEnd = () => {
      setIsAIThinking(false);
    };

    player.addEventListener('ended', handleAudioEnd);
    
    return () => {
      player.removeEventListener('ended', handleAudioEnd);
      player.pause();
    };
  }, []);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (callStatus === 'active') {
          interval = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }
      return () => {
        clearInterval(interval);
      }
  }, [callStatus]);
  
  const handleAccept = () => {
    setCallStatus('active');
    handleAIResponse([]);
  };

  const handleReject = () => {
    endAndCleanUp('rejected');
  };

  const handleEndCall = () => {
    endAndCleanUp('answered');
  };
  
  const handlePressToTalk = () => {
    if (isAIThinking || isListening) return;
    setIsRecording(true);
    startListening();
  };

  const handleReleaseToTalk = () => {
    if (isRecording) {
      setIsRecording(false);
      stopListening();
    }
  };

  const IncomingCallButton = ({ icon, label, onClick, className = '' }: any) => (
    <div className="flex flex-col items-center gap-2 text-center">
      <button onClick={onClick} className={`flex items-center justify-center w-16 h-16 rounded-full ${className}`}>
        {icon}
      </button>
      {label && <span className="text-white text-sm mt-1">{label}</span>}
    </div>
  );
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-md z-[100] flex flex-col items-center justify-between text-white p-8">
        <div className="text-center mt-20">
          <Image src="https://files.catbox.moe/p2f1gk.png" alt="Deniz Tuğrul" width={120} height={120} className="rounded-full mx-auto shadow-lg" data-ai-hint="person face" />
          <h1 className="text-4xl font-semibold mt-6">Deniz Tuğrul</h1>
          <p className="text-xl mt-2 text-gray-300">Bakırköy Hastanesi arıyor...</p>
        </div>
        <div className="flex justify-between w-full max-w-xs mb-10">
          <IncomingCallButton icon={<PhoneOff size={32} />} label="Reddet" onClick={handleReject} className="bg-red-500 hover:bg-red-600" />
          <IncomingCallButton icon={<Phone size={32} />} label="Aç" onClick={handleAccept} className="bg-green-500 hover:bg-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div data-call-status="active" className="fixed inset-0 bg-gray-900 text-white z-[100] flex flex-col p-4">
      <header className="absolute top-4 left-4">
        <SiteLogo className="text-white !text-opacity-70" size="text-lg" />
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="flex-grow" />
        
        <h1 className="text-5xl font-thin tracking-wide">Deniz Tuğrul</h1>
        <p className="text-xl mt-2 text-gray-400">{formatDuration(callDuration)}</p>

        <div className="mt-8 h-10 flex items-center justify-center text-lg">
          {isAIThinking ? (
            <p className="text-cyan-300 flex items-center gap-2 animate-pulse"><Bot className="h-5 w-5" /> Danışman konuşuyor...</p>
          ) : isRecording ? (
            <p className="text-red-400 flex items-center gap-2"><Mic className="animate-pulse h-5 w-5" /> Sizi dinliyorum...</p>
          ) : (
            <p className="text-gray-400">Konuşmak için butona basılı tutun</p>
          )}
        </div>

        <div className="my-12">
          <button
            onMouseDown={handlePressToTalk}
            onMouseUp={handleReleaseToTalk}
            onTouchStart={handlePressToTalk}
            onTouchEnd={handleReleaseToTalk}
            disabled={isAIThinking || (isListening && !isRecording)}
            className={cn(
                "flex items-center justify-center w-28 h-28 rounded-full shadow-2xl transition-all duration-200 ease-in-out text-white focus:outline-none ring-4 ring-transparent focus:ring-blue-400",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isRecording 
                ? "bg-red-500 scale-110 shadow-red-500/50" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/50"
            )}
            aria-label="Konuşmak için basılı tutun"
          >
            <Mic size={56} />
          </button>
        </div>
        
        <div className="flex-grow" />

        <div className="mb-8">
          <button onClick={handleEndCall} className="flex items-center justify-center w-20 h-20 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
            <PhoneOff size={36} />
          </button>
        </div>
      </div>

      <audio ref={audioPlayerRef} hidden />
    </div>
  );
}

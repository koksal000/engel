'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Phone, PhoneOff, Mic, MicOff, Bot, Volume2, Keyboard, UserPlus, Video, Contact, X } from 'lucide-react';
import type { ApplicationData, Call } from '@/lib/db';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech-flow';
import { hospitalConsultant } from '@/ai/flows/hospital-conversation-flow';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { SiteLogo } from './site-logo';
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface CallUIProps {
  callData: ApplicationData;
  activeCall: Call;
  onEndCall: (status: Call['status']) => void;
}

const Keypad = ({ onClose, onNumberPress }: { onClose: () => void, onNumberPress: (num: string) => void }) => {
  const keypadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#'
  ];

  return (
    <div className="w-full max-w-xs mb-8 flex flex-col items-center animate-in fade-in-50 duration-300">
      <div className="grid grid-cols-3 gap-4 w-full">
        {keypadButtons.map(btn => (
          <button
            key={btn}
            onClick={() => onNumberPress(btn)}
            className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 text-white text-2xl font-light transition-colors hover:bg-white/20"
          >
            {btn}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-6 flex items-center justify-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30">
        <X size={28} />
      </button>
    </div>
  );
};


export function CallUI({ callData, activeCall, onEndCall }: CallUIProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
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
          console.warn("AI returned an empty response. Re-activating listener.");
          setIsAIThinking(false);
          if (callStatus === 'active') startListening();
          return;
        }

        const updatedConversation = [...convo, { role: 'model' as const, text: aiResponseText }];
        setConversation(updatedConversation);

        const audioResponse = await convertTextToSpeech(aiResponseText);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioResponse.audioDataUri;
          audioPlayerRef.current.play().catch(e => {
            if (e.name !== 'AbortError') {
              console.error('AI audio playback failed:', e);
            }
          });
        }
      } catch (error) {
        console.error("Error in conversation flow:", error);
        setIsAIThinking(false);
        if (callStatus === 'active') startListening();
      }
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callData, callStatus]);

  const handleSpeechResult = useCallback((text: string) => {
    if (isAIThinking) return;
    
    setConversation(prevConvo => {
        const newConversation = [...prevConvo, { role: 'user' as const, text: text.trim() }];
        handleAIResponse(newConversation);
        return newConversation;
    });

  }, [isAIThinking, handleAIResponse]);
  
  const { isListening, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);


  const endAndCleanUp = useCallback((status: Call['status']) => {
    stopListening();
    ringtoneRef.current?.pause();
    audioPlayerRef.current?.pause();
    onEndCall(status);
  }, [onEndCall, stopListening]);
  
  // Effect to manage ringtone and missed call timeout
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
  
  // Effect to initialize audio elements.
  useEffect(() => {
    audioPlayerRef.current = new Audio();
    
    return () => {
      audioPlayerRef.current?.pause();
    };
  }, []);
  
  // Effect to manage the AI audio player's 'ended' event for turn-based conversation.
  useEffect(() => {
    const player = audioPlayerRef.current;
    if (!player) return;

    const handleAudioEnd = () => {
      setIsAIThinking(false);
      if (callStatus === 'active') {
        startListening();
      }
    };

    player.addEventListener('ended', handleAudioEnd);
    return () => {
      player.removeEventListener('ended', handleAudioEnd);
    };
  }, [callStatus, startListening]);

  // Effect for speaker volume
  useEffect(() => {
    if (audioPlayerRef.current) {
        audioPlayerRef.current.volume = isSpeakerOn ? 1.0 : 0.4;
    }
  }, [isSpeakerOn]);


  // Effect to manage the call duration timer.
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

  const handleNotImplemented = () => {
    toast({
        title: "Özellik Henüz Aktif Değil",
        description: "Bu özellik gelecekteki güncellemelerde eklenecektir.",
        variant: "default",
    });
  };
  
  const IncomingCallButton = ({ icon, label, onClick, className = '' }: any) => (
    <div className="flex flex-col items-center gap-2 text-center">
      <button onClick={onClick} className={`flex items-center justify-center w-16 h-16 rounded-full ${className}`}>
        {icon}
      </button>
      {label && <span className="text-white text-sm mt-1">{label}</span>}
    </div>
  );
  
  const CallActionButton = ({ icon, label, onClick, className = '' }: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-white/10 transition-colors",
            "hover:bg-white/20",
            className
        )}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </button>
      <span className="text-sm text-gray-300">{label}</span>
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

  // Active call screen
  return (
    <div data-call-status="active" className="fixed inset-0 bg-gray-900 text-white z-[100] flex flex-col p-4">
      <header className="absolute top-4 left-4">
        <SiteLogo className="text-white !text-opacity-70" size="text-lg" />
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="flex-grow" />
        
        <h1 className="text-5xl font-thin tracking-wide">Deniz Tuğrul</h1>
        <p className="text-xl mt-2 text-gray-400">{formatDuration(callDuration)}</p>

        <div className="mt-4 h-6 text-center">
          {isAIThinking && <p className="text-base text-cyan-300 flex items-center gap-2"><Bot className="animate-spin h-4 w-4" /> Danışman konuşuyor...</p>}
          {isListening && <p className="text-base text-red-400 flex items-center gap-2"><Mic className="animate-pulse h-4 w-4" /> Sizi dinliyorum...</p>}
        </div>
        
        <div className="flex-grow" />

        {isKeypadVisible ? (
            <Keypad onNumberPress={() => {}} onClose={() => setIsKeypadVisible(false)} />
        ) : (
            <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-xs mb-8 animate-in fade-in-50 duration-300">
            <CallActionButton icon={isMuted ? <MicOff /> : <Mic />} label="Sessiz" onClick={() => setIsMuted(!isMuted)} className={cn(isMuted && "!bg-white/80 !text-black")} />
            <CallActionButton icon={<Keyboard />} label="Tuş Takımı" onClick={() => setIsKeypadVisible(true)} />
            <CallActionButton icon={<Volume2 />} label="Hoparlör" onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={cn(isSpeakerOn && "!bg-white/80 !text-black")} />
            <CallActionButton icon={<UserPlus />} label="Arama Ekle" onClick={handleNotImplemented} />
            <CallActionButton icon={<Video />} label="Görüntü" onClick={handleNotImplemented} />
            <CallActionButton icon={<Contact />} label="Kişiler" onClick={handleNotImplemented} />
            </div>
        )}

        <div className="mb-8">
          <button onClick={handleEndCall} className="flex items-center justify-center w-20 h-20 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
            <PhoneOff size={36} />
          </button>
        </div>
      </div>

      <audio ref={audioPlayerRef} muted={isMuted} hidden />
    </div>
  );
}

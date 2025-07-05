'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Phone, PhoneOff, Mic, MicOff, Bot, Volume2 } from 'lucide-react';
import type { ApplicationData, Call } from '@/lib/db';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech-flow';
import { hospitalConsultant } from '@/ai/flows/hospital-conversation-flow';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';

interface CallUIProps {
  callData: ApplicationData;
  activeCall: Call;
  onEndCall: (status: 'answered' | 'rejected') => void;
}

export function CallUI({ callData, activeCall, onEndCall }: CallUIProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleAIResponse = async (convo: typeof conversation) => {
      setIsAIThinking(true);
      try {
          const aiResponseText = await hospitalConsultant({
              patientAnalysis: { ...callData },
              conversationHistory: convo,
          });
          
          const updatedConversation = [...convo, { role: 'model' as const, text: aiResponseText }];
          setConversation(updatedConversation);

          const audioResponse = await convertTextToSpeech(aiResponseText);
          if (audioPlayerRef.current) {
              audioPlayerRef.current.src = audioResponse.audioDataUri;
              audioPlayerRef.current.play();
          }
      } catch (error) {
          console.error("Error in conversation flow:", error);
          setIsAIThinking(false);
      }
  }

  const handleSpeechResult = async (text: string) => {
    if (!text || isAIThinking) return;
    stopListening();
    const newConversation = [...conversation, { role: 'user' as const, text }];
    setConversation(newConversation);
    await handleAIResponse(newConversation);
  };

  const { isListening, startListening, stopListening, hasSupport } = useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    ringtoneRef.current = new Audio('https://files.catbox.moe/m9izjy.m4a');
    ringtoneRef.current.loop = true;

    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.onended = () => {
      setIsAIThinking(false);
      if(callStatus === 'active') {
        startListening();
      }
    };

    if (callStatus === 'incoming') {
      ringtoneRef.current.play();
    }

    return () => {
      ringtoneRef.current?.pause();
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    ringtoneRef.current?.pause();
    setCallStatus('active');
    // Start the conversation with the AI's greeting
    handleAIResponse([]);
  };

  const handleReject = () => {
    ringtoneRef.current?.pause();
    onEndCall('rejected');
  };
  
  const CallButton = ({ icon, label, onClick, className = '' }: any) => (
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
          <CallButton icon={<PhoneOff size={32} />} label="Reddet" onClick={handleReject} className="bg-red-500 hover:bg-red-600" />
          <CallButton icon={<Phone size={32} />} label="Aç" onClick={handleAccept} className="bg-green-500 hover:bg-green-600" />
        </div>
      </div>
    );
  }

  // Active call screen
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 backdrop-blur-xl z-[100] flex flex-col items-center text-white p-8">
      <div className="text-center mt-12">
        <h1 className="text-5xl font-light">Deniz Tuğrul</h1>
        <p className="text-2xl mt-3 text-green-400">{formatDuration(callDuration)}</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center w-full my-8">
          <Image src="https://files.catbox.moe/p2f1gk.png" alt="Deniz Tuğrul" width={180} height={180} className={cn("rounded-full mx-auto shadow-2xl transition-all duration-300", isAIThinking && "ring-4 ring-cyan-400 ring-offset-4 ring-offset-gray-900 animate-pulse-once")} data-ai-hint="person face" />
          
          <div className="mt-12 h-10 text-center">
            {isAIThinking && <p className="text-lg text-cyan-300 flex items-center gap-2"><Bot className="animate-spin" /> Danışman konuşuyor...</p>}
            {isListening && <p className="text-lg text-red-400 flex items-center gap-2"><Mic className="animate-pulse" /> Sizi dinliyorum...</p>}
          </div>
      </div>


      <div className="grid grid-cols-3 gap-x-8 gap-y-12 w-full max-w-sm mb-10">
        <CallButton 
          icon={isMuted ? <MicOff size={32} /> : <Mic size={32} />} 
          label={isMuted ? 'Sesi Aç' : 'Sessize Al'} 
          onClick={() => setIsMuted(!isMuted)} 
          className="bg-white/20" 
        />
        <CallButton 
            icon={<Volume2 size={32} />} 
            label="Hoparlör" 
            onClick={() => {}} 
            className="bg-white/20"
        />
        <div /> 
        <div /> 
         <CallButton 
          icon={<PhoneOff size={36} />} 
          label="" 
          onClick={() => onEndCall('answered')} 
          className="bg-red-500 hover:bg-red-600" 
        />
        <div />
      </div>
      <audio ref={audioPlayerRef} muted={isMuted} hidden />
    </div>
  );
}

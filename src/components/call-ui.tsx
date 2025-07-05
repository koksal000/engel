'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Bot } from 'lucide-react';
import type { ApplicationData, Call } from '@/lib/db';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech-flow';
import { hospitalConsultant } from '@/ai/flows/hospital-conversation-flow';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface CallUIProps {
  callData: ApplicationData;
  activeCall: Call;
  onEndCall: (status: 'answered' | 'rejected' | 'missed') => void;
  onAccept: () => void;
  onReject: () => void;
}

export function CallUI({ callData, activeCall, onEndCall, onAccept, onReject }: CallUIProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeechResult = async (text: string) => {
    if (!text || isAIThinking) return;
    
    const newConversation = [...conversation, { role: 'user' as const, text }];
    setConversation(newConversation);
    setIsAIThinking(true);

    try {
        const aiResponseText = await hospitalConsultant({
            patientAnalysis: { ...callData },
            conversationHistory: newConversation,
        });
        
        const updatedConversation = [...newConversation, { role: 'model' as const, text: aiResponseText }];
        setConversation(updatedConversation);

        const audioResponse = await convertTextToSpeech(aiResponseText);
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioResponse.audioDataUri;
            audioPlayerRef.current.play();
        }

    } catch (error) {
        console.error("Error in conversation flow:", error);
    } finally {
        setIsAIThinking(false);
    }
  };

  const { isListening, startListening, stopListening, hasSupport } = useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    ringtoneRef.current = new Audio('https://files.catbox.moe/m9izjy.m4a');
    ringtoneRef.current.loop = true;
    audioPlayerRef.current = new Audio();

    if (callStatus === 'incoming') {
      ringtoneRef.current.play();
    }

    return () => {
      ringtoneRef.current?.pause();
    };
  }, [callStatus]);
  
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (callStatus === 'active') {
          startListening();
          interval = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }
      return () => {
        stopListening();
        clearInterval(interval);
      }
  }, [callStatus, startListening, stopListening]);


  const handleAccept = () => {
    ringtoneRef.current?.pause();
    setCallStatus('active');
    onAccept();
  };

  const handleReject = () => {
    ringtoneRef.current?.pause();
    onReject();
  };
  
  const handleEndCall = () => {
    onEndCall(callStatus === 'active' ? 'answered' : 'rejected');
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const CallButton = ({ icon, label, onClick, className = '' }: any) => (
    <div className="flex flex-col items-center gap-2">
      <button onClick={onClick} className={`flex items-center justify-center w-20 h-20 rounded-full ${className}`}>
        {icon}
      </button>
      <span className="text-white text-sm">{label}</span>
    </div>
  );

  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[100] flex flex-col items-center justify-between text-white p-8">
        <div className="text-center mt-16">
          <h1 className="text-4xl font-semibold">Deniz Tuğrul</h1>
          <p className="text-xl mt-2 text-gray-300">Bakırköy Ruh ve Sinir Hastalıkları Hastanesi</p>
        </div>
        <div className="flex-grow flex items-center justify-center">
            <Image src="https://files.catbox.moe/p2f1gk.png" alt="Deniz Tuğrul" width={150} height={150} className="rounded-full" data-ai-hint="person face" />
        </div>
        <div className="flex justify-around w-full max-w-xs mb-8">
          <CallButton icon={<PhoneOff size={36} />} label="Reddet" onClick={handleReject} className="bg-red-500" />
          <CallButton icon={<Phone size={36} />} label="Aç" onClick={handleAccept} className="bg-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-90 backdrop-blur-lg z-[100] flex flex-col items-center text-white p-8">
      <div className="text-center mt-8">
        <h1 className="text-5xl font-light">Deniz Tuğrul</h1>
        <p className="text-2xl mt-2 text-green-400">{formatDuration(callDuration)}</p>
      </div>

       <div className="flex-grow w-full my-8 p-4 bg-white/10 rounded-lg overflow-y-auto">
            {conversation.map((entry, index) => (
                <div key={index} className={`flex items-start gap-2 my-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.role === 'model' && <Bot className="w-6 h-6 text-cyan-300 flex-shrink-0" />}
                    <p className={`max-w-xs p-3 rounded-lg ${entry.role === 'user' ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {entry.text}
                    </p>
                </div>
            ))}
            {isAIThinking && <p className="text-center text-cyan-300 animate-pulse">Danışman konuşuyor...</p>}
            {isListening && <p className="text-center text-red-400 animate-pulse">Dinleniyor...</p>}
        </div>

      <div className="grid grid-cols-3 gap-x-8 gap-y-12 w-full max-w-sm">
        <CallButton icon={isMuted ? <MicOff size={36} /> : <Mic size={36} />} label={isMuted ? 'Sessiz' : 'Sessize Al'} onClick={() => setIsMuted(!isMuted)} className="bg-white/20" />
        <div/>
        <div/>
        <div/>
        <CallButton icon={<PhoneOff size={40} />} label="Kapat" onClick={handleEndCall} className="bg-red-500" />
        <div/>
      </div>
      <audio ref={audioPlayerRef} hidden />
    </div>
  );
}

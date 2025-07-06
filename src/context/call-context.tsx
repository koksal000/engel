'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ApplicationData, Call } from '@/lib/db';
import { addCall, updateCall } from '@/lib/db';
import { CallUI } from '@/components/call-ui';

interface CallContextType {
  scheduleCall: (application: ApplicationData, delay: number) => void;
  endCall: (status: Call['status']) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [incomingCall, setIncomingCall] = useState<ApplicationData | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  const endCall = useCallback(async (status: Call['status']) => {
    if (activeCall) {
        let duration = 0;
        if (status === 'answered' && activeCall.date) {
             duration = Math.floor((new Date().getTime() - new Date(activeCall.date).getTime()) / 1000);
        }
        
        // Only update DB for terminal states initiated by user action.
        // 'missed' is the default, and if the call times out, the DB record is already correct.
        if (status === 'answered' || status === 'rejected') {
            const updatedCall = { ...activeCall, status, duration };
            await updateCall(updatedCall);
        }
    }
    setIncomingCall(null);
    setActiveCall(null);
  }, [activeCall]);

  const scheduleCall = useCallback((application: ApplicationData, delay: number) => {
    // Prevent scheduling a new call if one is already active/incoming
    if (activeCall || incomingCall) return;

    setTimeout(async () => {
        const newCall: Omit<Call, 'id'> = {
            applicationId: application.id!,
            patientName: `${application.name} ${application.surname}`,
            status: 'missed', // Default to missed, will be updated on user action
            date: new Date(),
            duration: 0,
        };
        const callId = await addCall(newCall);
        setActiveCall({ ...newCall, id: callId });
        setIncomingCall(application);
    }, delay);
  }, [activeCall, incomingCall]);

  return (
    <CallContext.Provider value={{ scheduleCall, endCall }}>
      {children}
      {incomingCall && activeCall && (
        <CallUI 
            callData={incomingCall} 
            activeCall={activeCall}
            onEndCall={endCall}
        />
      )}
    </CallContext.Provider>
  );
};

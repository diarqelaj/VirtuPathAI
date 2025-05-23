'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { chathubApi } from '@/lib/api';

interface SignalRContextType {
  hub: HubConnection | null;
  onlineUsers: Set<number>;
  typingUsers: Set<number>;
}

const SignalRContext = createContext<SignalRContextType>({
  hub: null,
  onlineUsers: new Set(),
  typingUsers: new Set(),
});

export function useSignalR() {
  return useContext(SignalRContext);
}

interface SignalRProviderProps {
  children: ReactNode;
}

export default function SignalRProvider({ children }: SignalRProviderProps) {
  const [hub, setHub] = useState<HubConnection | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const base = chathubApi.defaults.baseURL ?? '';
    const connection = new HubConnectionBuilder()
      .withUrl(`${base}/chathub`, { withCredentials: true })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // presence events
    connection.on('OnlineFriends', (ids: number[]) => {
      setOnlineUsers(new Set(ids));
    });
    connection.on('UserOnline', (uid: number | string) => {
      const id = typeof uid === 'string' ? parseInt(uid, 10) : uid;
      setOnlineUsers(prev => { const next = new Set(prev); next.add(id); return next; });
    });
    connection.on('UserOffline', (uid: number | string) => {
      const id = typeof uid === 'string' ? parseInt(uid, 10) : uid;
      setOnlineUsers(prev => { const next = new Set(prev); next.delete(id); return next; });
    });

    // typing events
    connection.on('UserTyping', (uid: number | string) => {
      const id = typeof uid === 'string' ? parseInt(uid, 10) : uid;
      setTypingUsers(prev => { const next = new Set(prev); next.add(id); return next; });
    });
    connection.on('UserStopTyping', (uid: number | string) => {
      const id = typeof uid === 'string' ? parseInt(uid, 10) : uid;
      setTypingUsers(prev => { const next = new Set(prev); next.delete(id); return next; });
    });

    // start connection
    connection.start()
      .then(() => setHub(connection))
      .catch(err => console.error('SignalR connect failed', err));

    return () => {
      if (connection) {
        connection.off('OnlineFriends');
        connection.off('UserOnline');
        connection.off('UserOffline');
        connection.off('UserTyping');
        connection.off('UserStopTyping');
        connection.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ hub, onlineUsers, typingUsers }}>
      {children}
    </SignalRContext.Provider>
  );
}

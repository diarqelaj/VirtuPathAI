// app/SignalRProvider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
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
  const [typingUsers, setTypingUsers]   = useState<Set<number>>(new Set());

  useEffect(() => {
    const base = chathubApi.defaults.baseURL ?? '';
    const connection = new HubConnectionBuilder()
      .withUrl(`${base}/chathub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    // presence
    connection.on('OnlineFriends', (ids: number[]) => {
      setOnlineUsers(new Set(ids));
    });
    connection.on('UserOnline',  (uid: number|string) => {
      const id = typeof uid === 'string' ? +uid : uid;
      setOnlineUsers(s => new Set(s).add(id));
    });
    connection.on('UserOffline', (uid: number|string) => {
      const id = typeof uid === 'string' ? +uid : uid;
      setOnlineUsers(s => { const next = new Set(s); next.delete(id); return next; });
    });

    // typing
    connection.on('UserTyping',   (uid: number|string) => {
      const id = typeof uid === 'string' ? +uid : uid;
      setTypingUsers(s => new Set(s).add(id));
    });
    connection.on('UserStopTyping', (uid: number|string) => {
      const id = typeof uid === 'string' ? +uid : uid;
      setTypingUsers(s => { const next = new Set(s); next.delete(id); return next; });
    });

    connection.start()
      .then(() => setHub(connection))
      .catch(console.error);

    return () => void connection.stop();
  }, []);

  return (
    <SignalRContext.Provider value={{ hub, onlineUsers, typingUsers }}>
      {children}
    </SignalRContext.Provider>
  );
}

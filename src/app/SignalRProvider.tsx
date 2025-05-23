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
}

const SignalRContext = createContext<SignalRContextType>({
  hub: null,
  onlineUsers: new Set(),
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

  useEffect(() => {
    const base = chathubApi.defaults.baseURL ?? '';
    const connection = new HubConnectionBuilder()
      .withUrl(`${base}/chathub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    // Presence handlers
    connection.on('UserOnline', (uid: number | string) => {
      setOnlineUsers(s => {
        const next = new Set(s);
        next.add(typeof uid === 'string' ? parseInt(uid, 10) : uid);
        return next;
      });
    });

    connection.on('UserOffline', (uid: number | string) => {
      setOnlineUsers(s => {
        const next = new Set(s);
        next.delete(typeof uid === 'string' ? parseInt(uid, 10) : uid);
        return next;
      });
    });

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR connected');
        setHub(connection);
      })
      .catch(err => console.error('SignalR connect failed', err));

    return () => {
      connection.stop().catch(console.error);
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ hub, onlineUsers }}>
      {children}
    </SignalRContext.Provider>
  );
}

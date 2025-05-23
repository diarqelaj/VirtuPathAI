'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'

const SignalRContext = createContext<HubConnection | null>(null)

export function useSignalR() {
  return useContext(SignalRContext)
}

interface SignalRProviderProps {
  children: ReactNode
}

export default function SignalRProvider({ children }: SignalRProviderProps) {
  const [hub, setHub] = useState<HubConnection | null>(null)

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(
        `${process.env.NEXT_PUBLIC_API_HOST || ''}/chathub`,
        { withCredentials: true }
      )
      .withAutomaticReconnect()
      .build()

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR connected')
        setHub(connection)
      })
      .catch(err => console.error('SignalR connect failed', err))

    return () => {
      connection.stop().catch(console.error)
    }
  }, [])

  return (
    <SignalRContext.Provider value={hub}>
      {children}
    </SignalRContext.Provider>
  )
}

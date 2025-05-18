'use client';

import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export default function ChatPage() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://virtupathapi-54vt.onrender.com/chathub') // ✅ Your backend SignalR endpoint
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR hub');

          connection.on('ReceiveMessage', (user: string, message: string) => {
            setMessages((prev) => [...prev, { user, message }]);
          });
        })
        .catch((err) => console.error('SignalR connection failed:', err));
    }
  }, [connection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (connection && message.trim()) {
      await connection.invoke('SendMessage', user || 'Anonymous', message.trim());
      setMessage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-black-100 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">💬 VirtuPath Chat</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Your name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-sm"
        />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold text-purple-400">{msg.user}:</span> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

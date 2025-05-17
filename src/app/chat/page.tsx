'use client';

import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import api from '@/lib/api';
import chathubApi from '@/lib/api';

export default function ChatPage() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [user, setUser] = useState('');
  const [receiver, setReceiver] = useState('');
  const [friends, setFriends] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hubUrl = `${chathubApi.defaults.baseURL}/chathub`;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Step 1: Fetch current user info
        const userRes = await api.get('/users/me');
        const currentUser = userRes.data;
        setUser(currentUser.username); // Save username for messages

        // Step 2: Fetch mutual friends by userId
        const friendsRes = await api.get(`/UserFriends/mutual/${currentUser.userID}`);
        console.log('✅ Mutual friends:', friendsRes.data);

        const usernames = friendsRes.data.map((f: any) => f.username);
        setFriends(usernames);
        setReceiver(usernames[0] || '');
      } catch (err) {
        console.error('❌ Failed to fetch user or friends:', err);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
        withCredentials: true, // if needed
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('✅ Connected to SignalR hub');
          connection.on('ReceiveMessage', (user: string, message: string) => {
            setMessages((prev) => [...prev, { user, message }]);
          });
        })
        .catch((err) => console.error('❌ SignalR connection failed:', err));
    }
  }, [connection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (connection && message.trim() && receiver) {
      await connection.invoke('SendMessage', receiver, message.trim());
      setMessages((prev) => [...prev, { user, message }]);
      setMessage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-black-100 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">💬 VirtuPath Chat</h1>

      <div className="mb-4">
        <label className="block text-sm mb-1">Send message to:</label>
        <select
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-sm"
        >
          {friends.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
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

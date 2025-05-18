'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

/* ───────────── Types ───────────── */

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentAt: string;
}

interface Friend {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string | null;
}

/* ───────────── Component ───────────── */

export default function ChatPage() {
  /* friends */
  const [friends, setFriends]     = useState<Friend[]>([]);
  const [filter, setFilter]       = useState('');

  /* active chat */
  const [active, setActive]       = useState<Friend | null>(null);
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [draft, setDraft]         = useState('');

  const [error, setError]         = useState('');
  const bottom = useRef<HTMLDivElement>(null);

  /* ── load friends once ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Friend[]>('/userfriends/accepted');
        setFriends(res.data);
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  /* ── load + poll chat ── */
  useEffect(() => {
    if (!active) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        setMessages(res.data);
        setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch (err: any) {
        if (err.response?.status === 403) setError('You are not friends.');
        else if (err.response?.status === 401) setError('Log in first.');
        else setError('Error loading chat.');
        setMessages([]);
      }
    };

    fetchMessages();
    const id = setInterval(fetchMessages, 2_000);
    return () => clearInterval(id);
  }, [active]);

  /* ── send ── */
  const send = async () => {
    if (!draft.trim() || !active) return;
    try {
      await api.post('/chat/send', {
        receiverId: active.id,
        message: draft.trim(),
      });
      setDraft('');
    } catch (err: any) {
      setError(err.response?.status === 403 ? "Can't message this user." : 'Send failed.');
    }
  };

  /* ── filtering ── */
  const visibleFriends = friends.filter(
    f =>
      f.username.toLowerCase().includes(filter.toLowerCase()) ||
      f.id.toString().includes(filter)
  );

  return (
    <div className="flex h-[calc(100vh-60px)]">  {/* adjust if you have a topbar */}
      {/* ───────── Sidebar ───────── */}
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto">
        <h3 className="text-lg font-semibold">Friends</h3>

        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search username or ID"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-600"
        />

        <div className="flex flex-col gap-2">
          {visibleFriends.map(f => (
            <button
              key={f.id}
              className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-left ${
                active?.id === f.id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => setActive(f)}
            >
              <img
                src={
                  f.profilePictureUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    f.fullName || f.username
                  )}&background=5e17eb&color=fff`
                }
                alt={f.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{f.username}</div>
                <div className="text-xs text-gray-500">#{f.id}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ───────── Chat pane ───────── */}
      <main className="flex-1 flex flex-col h-full relative">
        {active ? (
          <>
            {/* header */}
            <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-semibold">{active.username}</span>
              <span className="text-xs text-gray-500">ID {active.id}</span>
            </header>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm break-words ${
                    m.senderId === active.id
                      ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                      : 'bg-indigo-600 text-white ml-auto'
                  }`}
                >
                  {m.message}
                  <div className="mt-1 text-[10px] opacity-70">
                    {new Date(m.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={bottom} />
            </div>

            {/* input */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-600"
              />
              <button
                onClick={send}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
                disabled={!draft.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-gray-500">Select a friend to start chatting</div>
        )}

        {error && (
          <div className="absolute bottom-20 left-0 right-0 text-center text-red-600">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

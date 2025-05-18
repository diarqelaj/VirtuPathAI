'use client';

import { useEffect, useRef, useState } from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import api from '@/lib/api';

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentAt: string;
  replyToId?: number | null;
  emoji?: string | null;
  isEdited?: boolean;
  isDeletedForSender?: boolean;
  isDeletedForEveryone?: boolean;
}

interface Friend {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string | null;
}

export default function FloatingDrawer() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Friend | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ userID: number }>('/users/me');
        const raw = await api.get<any[]>(`/UserFriends/mutual/${me.data.userID}`);
        const mapped = raw.data.map(f => ({
          id: f.id ?? f.userID ?? f.friendId,
          username: f.username,
          fullName: f.fullName ?? f.username,
          profilePictureUrl: f.profilePictureUrl ?? null,
        }));
        setFriends(mapped);
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    const load = async () => {
      try {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        setMsgs(r.data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch {
        setError('Failed to load messages');
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [active]);

  const send = async () => {
    if (!msg.trim() || !active) return;
    try {
      await api.post('/chat/send', { receiverId: active.id, message: msg.trim() });
      setMsg('');
    } catch {
      setError('Failed to send message.');
    }
  };

  const filtered = friends.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full text-white text-sm">
      {!active && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-base font-semibold mb-2">Friends</h3>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username or ID"
            className="w-full px-3 py-2 bg-black-100 border border-gray-700 rounded-md placeholder-gray-500"
          />
          <div className="mt-3 flex flex-col gap-1 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
            {filtered.map(friend => (
              <button
                key={friend.id}
                onClick={() => setActive(friend)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800/60"
              >
                <img
                  src={friend.profilePictureUrl ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName)}&background=5e17eb&color=fff`}
                  alt={friend.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-medium">{friend.username}</div>
                  <div className="text-xs text-gray-400">#{friend.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {active && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black-100/80 backdrop-blur">
            <button onClick={() => setActive(null)}>
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <span className="font-semibold">{active.username}</span>
            <span className="text-xs text-gray-400">#{active.id}</span>
          </div>

          <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
            {msgs.map((m, idx) => {
              const isLast = idx === msgs.length - 1 || msgs[idx + 1].senderId !== m.senderId;
              if (m.isDeletedForSender) return null;
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                    m.senderId === active?.id
                      ? 'self-start bg-gray-700 text-gray-100'
                      : 'self-end bg-indigo-600 text-white'
                  }`}
                >
                  {m.replyToId && (
                    <div className="text-xs italic mb-1 text-gray-400">Replying to #{m.replyToId}</div>
                  )}
                  {m.message}
                  {m.emoji && <div className="mt-1">{m.emoji}</div>}
                  {isLast && (
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {new Date(m.sentAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-black-100/80 backdrop-blur">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm placeholder-gray-500"
            />
            <button
              onClick={send}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

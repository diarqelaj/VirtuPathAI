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
}
interface RawFriendDto {
  id?: number; userID?: number; friendId?: number;
  username: string; fullName?: string; profilePictureUrl?: string | null;
}
interface Friend {
  id: number; username: string; fullName: string;
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
        const raw = await api.get<RawFriendDto[]>(`/UserFriends/mutual/${me.data.userID}`);
        const list = raw.data
          .map(f => {
            const id = f.id ?? f.userID ?? f.friendId;
            if (!id) return null;
            return {
              id,
              username: f.username,
              fullName: f.fullName ?? f.username,
              profilePictureUrl: f.profilePictureUrl ?? null,
            };
          })
          .filter(Boolean) as Friend[];
        setFriends(list);
        setError('');
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    const pull = async () => {
      try {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        setMsgs(r.data);
        setError('');
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch (e: any) {
        if (e.response?.status === 403) setError('You are not friends.');
        else if (e.response?.status === 401) setError('Please log in.');
        else setError('Error loading messages.');
      }
    };
    pull();
    const id = setInterval(pull, 2_000);
    return () => clearInterval(id);
  }, [active]);

  const send = async () => {
    if (!msg.trim() || !active) return;
    try {
      await api.post('/chat/send', { receiverId: active.id, message: msg.trim() });
      setMsg('');
    } catch (e: any) {
      if (e.response?.status === 403) setError("You can't message this user.");
      else setError('Failed to send.');
    }
  };

  const list = friends.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase()) || f.id.toString().includes(search)
  );

  return (
    <div className="flex flex-col h-full text-white text-sm bg-black-100 rounded-3xl">
      {/* Sidebar (Friends list) */}
      {!active && (
        <aside className="p-4 border-b border-gray-800">
          <h3 className="text-base font-semibold mb-3">Friends</h3>
          <input
            placeholder="Search by username or ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 w-full bg-black-100 border border-gray-700 rounded-md text-sm placeholder-gray-500"
          />
          <div className="flex flex-col gap-1 mt-3 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
            {list.map(f => (
              <button
                key={f.id}
                onClick={() => setActive(f)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition"
              >
                <img
                  src={f.profilePictureUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=5e17eb&color=fff`}
                  alt={f.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-medium">{f.username}</div>
                  <div className="text-xs text-gray-400">#{f.id}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Chat UI */}
      {active && (
        <>
          <header className="px-4 py-3 border-b border-gray-800 bg-black-100/80 backdrop-blur flex items-center gap-3">
            <button onClick={() => setActive(null)} className="text-gray-400 hover:text-white">
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold">{active.username}</span>
            <span className="text-xs text-gray-500 ml-auto">#{active.id}</span>
          </header>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-700">
            {msgs.map(m => (
              <div
                key={m.id}
                className={`max-w-[85%] px-4 py-2 rounded-2xl break-words ${
                  m.senderId === active.id
                    ? 'self-start bg-gray-700 text-gray-100'
                    : 'self-end bg-indigo-600 text-white'
                }`}
              >
                {m.message}
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.sentAt).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 p-3 border-t border-gray-800 bg-black-100/80 backdrop-blur">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-black-100 border border-gray-700 rounded-full placeholder-gray-500"
            />
            <button
              onClick={send}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium"
            >
              Send
            </button>
          </div>
        </>
      )}

      {!active && (
        <div className="p-5 text-center text-gray-500 flex-1 flex items-center justify-center">
          Select a friend to start chatting
        </div>
      )}

      {error && (
        <div className="absolute bottom-20 left-0 right-0 text-center text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlineReply,
  HiCheck,
  HiOutlineEmojiHappy,
} from 'react-icons/hi';
import Picker from 'emoji-picker-react';
import api from '@/lib/api';

interface EmojiReaction {
  userId: number;
  emoji: string;
  fullName: string;
  profilePictureUrl: string | null;
}

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentAt: string;
  replyToId?: number | null;
  emojis: EmojiReaction[];
  isEdited?: boolean;
  isDeletedForSender?: boolean;
  isDeletedForEveryone?: boolean;
}

interface RawFriendDto {
  id?: number;
  userID?: number;
  friendId?: number;
  username: string;
  fullName?: string;
  profilePictureUrl?: string | null;
}

interface Friend {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string | null;
}

export default function ChatPage({ compact = false }: { compact?: boolean }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Friend | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [reactingToId, setReactingToId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const byId = (id: number | null) =>
    id ? msgs.find((m) => m.id === id) ?? null : null;

  const unreact = async (id: number) => {
    try {
      await api.delete(`/Chat/react/${id}`);
    } catch {
      setError('Failed to remove reaction.');
    }
  };

  const fetchMessages = async (userId: number) => {
    const r = await api.get<ChatMessage[]>(`/chat/messages/${userId}`);
    const enriched = await Promise.all(
      r.data.map(async (m) => {
        try {
          const emojiRes = await api.get<EmojiReaction[]>(`/Chat/react/${m.id}`);
          return { ...m, emojis: emojiRes.data };
        } catch {
          return { ...m, emojis: [] };
        }
      })
    );

    // ensure replied messages exist
    const replyIds = enriched.map(m => m.replyToId).filter(Boolean) as number[];
    const missing = replyIds.filter(id => !enriched.some(m => m.id === id));
    for (const id of missing) {
      try {
        const reply = await api.get<ChatMessage>(`/chat/message/${id}`);
        enriched.push(reply.data);
      } catch {}
    }

    setMsgs(enriched);
    setTimeout(() => bottomRef.current?.scrollIntoView(), 0);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ userID: number }>('/users/me');
        const raw = await api.get<RawFriendDto[]>(`/UserFriends/mutual/${me.data.userID}`);
        const list = raw.data
          .map((f) => {
            const id = f.id ?? f.userID ?? f.friendId;
            return id
              ? {
                  id,
                  username: f.username,
                  fullName: f.fullName ?? f.username,
                  profilePictureUrl: f.profilePictureUrl ?? null,
                }
              : null;
          })
          .filter(Boolean) as Friend[];
        setFriends(list);
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    fetchMessages(active.id);
    const interval = setInterval(() => fetchMessages(active.id), 2000);
    return () => clearInterval(interval);
  }, [active]);

  const send = async () => {
    if (!msg.trim() || !active) return;
    try {
      if (editingId) {
        await api.put(`/chat/edit/${editingId}`, { newMessage: msg.trim() });
        setEditingId(null);
      } else {
        await api.post('/chat/send', {
          receiverId: active.id,
          message: msg.trim(),
          replyToId: replyTo,
        });
      }
      setMsg('');
      setReplyTo(null);
    } catch {
      setError('Failed to send message.');
    }
  };

  const react = async (id: number, emoji: string) => {
    try {
      await api.patch(`/Chat/react/${id}`, { Emoji: emoji });
      setReactingToId(null);
      setShowEmojiPicker(false);
    } catch {
      setError('Failed to react.');
    }
  };

  const rmMe = (id: number) => api.post(`/chat/delete/${id}/sender`);
  const rmAll = (id: number) => api.post(`/chat/delete-for-everyone/${id}`);

  const filtered = friends.filter(
    (f) =>
      f.username.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toString().includes(search)
  );

  return (
    <div className={`flex ${compact ? 'flex-col' : 'md:flex-row'} h-full bg-black-100 text-white`}>
      {/* Sidebar */}
      <aside className={`${compact ? 'w-full border-b' : 'md:w-72 md:border-r'} border-gray-800 p-4 flex flex-col gap-4`}>
        {active && compact && (
          <button
            onClick={() => setActive(null)}
            className="flex items-center gap-1 text-sm mb-2 text-gray-400 hover:text-white"
          >
            <HiOutlineArrowLeft className="h-5 w-5" /> Back
          </button>
        )}
        <h3 className="text-lg font-semibold">Friends</h3>
        <input
          placeholder="Search by username or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-black-100 border border-gray-700 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />
        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {filtered.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f)}
              className={`flex items-center gap-3 p-2 rounded-md transition ${active?.id === f.id ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}
            >
              <img
                src={
                  f.profilePictureUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=5e17eb&color=fff`
                }
                alt={f.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-medium">{f.username}</div>
                <div className="text-xs text-gray-400">#{f.id}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Panel */}
      <main className="flex-1 flex flex-col relative">
        {!active ? (
          <div className="m-auto text-gray-500">Select a friend to start chatting</div>
        ) : (
          <>
            <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-black-100/80 backdrop-blur">
              <span className="font-semibold">{active.username}</span>
              <span className="text-xs text-gray-400">ID {active.id}</span>
            </header>

            <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 overscroll-contain">
              {msgs.map((m, idx) => {
                if (m.isDeletedForSender) return null;
                const self = m.senderId !== active.id;
                const hovered = hoveredMsgId === m.id;
                const last = idx === msgs.length - 1 || msgs[idx + 1].senderId !== m.senderId;

                return (
                  <div
                    key={m.id}
                    className={`relative group flex flex-col gap-1 w-fit ${
                      self ? 'ml-auto items-end' : 'items-start'
                    }`}
                    onMouseEnter={() => setHoveredMsgId(m.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* Reply preview */}
                    {m.replyToId && (
                      <div className="text-xs text-indigo-300 italic border-l-2 border-indigo-400 pl-2 max-w-[80%] bg-black-200 px-3 py-1 rounded">
                        ↪ {byId(m.replyToId)?.message.slice(0, 60) ?? '[Deleted]'}
                      </div>
                    )}

                    {/* Message */}
                    <div className={`block px-4 py-2 rounded-2xl text-sm break-words max-w-[48ch] min-w-[4rem] ${
                      self ? 'bg-indigo-600 text-white ml-auto' : 'bg-gray-700 text-gray-100 mr-auto'}`}>
                      {editingId === m.id ? (
                        <div className="flex gap-2">
                          <input value={msg} onChange={(e) => setMsg(e.target.value)} className="flex-1 px-2 py-1 rounded text-black" />
                          <button onClick={send}><HiCheck className="text-white" /></button>
                        </div>
                      ) : (
                        <>
                          {m.message}
                          {m.isEdited && <span className="text-[10px] italic ml-1">(edited)</span>}
                        </>
                      )}
                    </div>

                    {/* Emoji Reactions */}
                    {m.emojis?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 text-xl">
                        {m.emojis.map((e, i) => (
                          <div
                            key={i}
                            className="bg-black-200 px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition"
                            title={e.fullName}
                            onClick={() => unreact(m.id)}
                          >
                            {e.emoji}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hover actions */}
                    {hovered && (
                      <div className={`absolute top-1/2 -translate-y-1/2 z-10 flex gap-2 ${self ? 'right-full pr-2' : 'left-full pl-2'}`}>
                        <button onClick={() => setReplyTo(m.id)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"><HiOutlineReply className="w-3 h-3 text-white" /></button>
                        <button onClick={() => { setReactingToId(m.id); setShowEmojiPicker(true); }} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"><HiOutlineEmojiHappy className="w-4 h-4 text-white" /></button>
                        <div className="relative">
                          <button onClick={() => setOpenMenuId(m.id === openMenuId ? null : m.id)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">⋯</button>
                          {openMenuId === m.id && (
                            <div className="absolute right-0 mt-1 flex flex-col bg-gray-800 rounded shadow-md min-w-[6rem] z-20">
                              {self && (
                                <>
                                  <button onClick={() => { setMsg(m.message); setEditingId(m.id); setOpenMenuId(null); }} className="text-sm px-3 py-1 hover:bg-gray-700">Edit</button>
                                  <button onClick={() => { rmAll(m.id); setOpenMenuId(null); }} className="text-sm px-3 py-1 text-red-400 hover:text-red-600 hover:bg-gray-700">Delete for All</button>
                                </>
                              )}
                              <button onClick={() => { rmMe(m.id); setOpenMenuId(null); }} className="text-sm px-3 py-1 text-red-400 hover:text-red-600 hover:bg-gray-700">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {last && <div className="text-[10px] opacity-70">{new Date(m.sentAt).toLocaleTimeString()}</div>}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex flex-col gap-1 p-3 border-t border-gray-800 bg-black-100/80 backdrop-blur">
              {replyTo && (
                <div className="text-xs text-gray-400 mb-1 flex items-start gap-1">
                  <span className="font-semibold">Replying to:</span>
                  <span className="truncate max-w-[60%]">{byId(replyTo)?.message.slice(0, 60) ?? '[Deleted message]'}</span>
                  <button onClick={() => setReplyTo(null)} className="ml-auto text-red-500">Cancel</button>
                </div>
              )}
              {showEmojiPicker && (
                <Picker
                  onEmojiClick={(e) => reactingToId && react(reactingToId, e.emoji)}
                  height={350}
                  width={300}
                />
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-white px-2">😀</button>
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm placeholder-gray-500"
                />
                <button onClick={send} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium">Send</button>
              </div>
            </div>
          </>
        )}
        {error && (
          <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-sm">{error}</div>
        )}
      </main>
    </div>
  );
}

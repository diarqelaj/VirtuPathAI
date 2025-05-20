// FILE: ChatPage.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineReply,
  HiOutlineEmojiHappy,
  HiOutlineDotsHorizontal,
  HiCheck,
} from 'react-icons/hi';
import Picker from 'emoji-picker-react';
import api from '@/lib/api';
import { Theme } from 'emoji-picker-react';

/* ──────────────── Types ───────────────── */
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
  id?: number; userID?: number; friendId?: number;
  username: string; fullName?: string; profilePictureUrl?: string | null;
}
interface Friend {
  id: number; username: string; fullName: string; profilePictureUrl?: string | null;
}

/* ──────────────── Component ───────────── */
export default function ChatPage({ compact = false }: { compact?: boolean }) {
  /* ----- state ----- */
  const [friends, setFriends]             = useState<Friend[]>([]);
  const [search, setSearch]               = useState('');
  const [active, setActive]               = useState<Friend | null>(null);
  const [msgs, setMsgs]                   = useState<ChatMessage[]>([]);
  const [msg, setMsg]                     = useState('');
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [replyTo, setReplyTo]             = useState<number | null>(null);
  const [hoveredMsgId, setHoveredMsgId]   = useState<number | null>(null);
  const [openMenuId, setOpenMenuId]       = useState<number | null>(null);

  /* emoji-picker control */
  const [reactingToId, setReactingToId]   = useState<number | null>(null);
  const [pickerPos, setPickerPos]         = useState<{ top: number; left: number } | null>(null);
  const [showPicker, setShowPicker]       = useState(false);

  const [error, setError]                 = useState('');
  const bottomRef                         = useRef<HTMLDivElement>(null);
  const scrollAfterSend                   = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const cancelEdit = () => { setEditingId(null); setMsg(''); };

  /* ----- helpers ----- */
  const byId = (id: number | null) => id ? msgs.find(m => m.id === id) ?? null : null;

  const fetchMessages = async (uid: number) => {
    const r = await api.get<ChatMessage[]>(`/chat/messages/${uid}`);
    const enriched = await Promise.all(
      r.data.map(async m => {
        try {
          const res = await api.get<EmojiReaction[]>(`/Chat/react/${m.id}`);
          return { ...m, emojis: res.data, replyToId: m.replyToId ?? (m as any).replyToMessageId ?? null };
        } catch {
          return { ...m, emojis: [], replyToId: m.replyToId ?? (m as any).replyToMessageId ?? null };
        }
      })
    );
    setMsgs(enriched);
    if (scrollAfterSend.current) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      scrollAfterSend.current = false;
    }
  };

  /* ----- initial friend list ----- */
  useEffect(() => {
    (async () => {
      try {
        const me  = await api.get<{ userID: number }>('/users/me');
        const raw = await api.get<RawFriendDto[]>(`/UserFriends/mutual/${me.data.userID}`);
        const list = raw.data
          .map(f => {
            const id = f.id ?? f.userID ?? f.friendId;
            return id ? { id, username: f.username, fullName: f.fullName ?? f.username, profilePictureUrl: f.profilePictureUrl ?? null } : null;
          })
          .filter(Boolean) as Friend[];
        setFriends(list);
      } catch { setError('Failed to load friends.'); }
    })();
  }, []);

  /* ----- poll messages ----- */
  useEffect(() => {
    if (!active) return;
    scrollAfterSend.current = true;
    fetchMessages(active.id);
    const t = setInterval(() => fetchMessages(active.id), 2_000);
    return () => clearInterval(t);
  }, [active]);

  /* focus tricks */
 
  useEffect(() => {
    if (editingId !== null) setTimeout(() => inputRef.current?.focus(), 0);
  }, [editingId]);
  
  useEffect(() => {
    if (replyTo   !== null) setTimeout(() => inputRef.current?.focus(), 0);
  }, [replyTo]);
  
  /* picker close on outside-click / esc */
  useEffect(() => {
    if (!showPicker) return;
    const close = () => { setShowPicker(false); setReactingToId(null); setPickerPos(null); };
    const onClick = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) close(); };
    const onEsc   = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onClick); window.removeEventListener('keydown', onEsc); };
  }, [showPicker]);

  /* ----- actions ----- */
  const send = async () => {
    if (!msg.trim() || !active) return;
    try {
      if (editingId) {
        await api.put(`/chat/edit/${editingId}`, { newMessage: msg.trim() });
        setEditingId(null);
      } else {
        await api.post('/chat/send', { receiverId: active.id, message: msg.trim(), ReplyToMessageId: replyTo });
        scrollAfterSend.current = true;
      }
      setMsg(''); setReplyTo(null);
    } catch { setError('Failed to send.'); }
  };

  const react = async (id: number, emoji: string) => {
    try { await api.patch(`/Chat/react/${id}`, { Emoji: emoji }); }
    catch { setError('Failed to react.'); }
    finally { setReactingToId(null); setShowPicker(false); setPickerPos(null); }
  };

  const unreact = async (id: number) => {
    try { await api.delete(`/Chat/react/${id}`); }
    catch { setError('Failed to remove reaction.'); }
  };

  const rmMe  = (id: number) => api.post(`/chat/delete/${id}/sender`).catch(() => setError('Delete-me failed.'));
  const rmAll = (id: number) => api.post(`/chat/delete-for-everyone/${id}`).catch(() => setError('Delete-all failed.'));

  const openPicker = (e: React.MouseEvent, id: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = Math.min(320, window.innerWidth - 16);
    const H = 360;
    const top  = rect.bottom + H > window.innerHeight ? rect.top - H : rect.bottom;
    let   left = rect.left;
    if (left + W > window.innerWidth) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    setPickerPos({ top: top + window.scrollY, left });
    setReactingToId(id); setShowPicker(true);
  };

  const addEmojiToInput = (e: any) => setMsg(p => p + e.emoji);

  /* ----- filter friends ----- */
  const filtered = friends.filter(f => f.username.toLowerCase().includes(search.toLowerCase()) || f.id.toString().includes(search));

  /* ───────────────────────────── JSX ───────────────────────────── */
  return (
    <div className={`flex ${compact ? 'flex-col' : 'md:flex-row'} h-full bg-black-100 text-white`}>
      {/* Sidebar */}
      <aside className={`${compact ? 'w-full border-b' : 'md:w-72 md:border-r'} border-gray-800 p-4 flex flex-col gap-4`}>
        {active && compact && (
          <button onClick={() => setActive(null)} className="flex items-center gap-1 text-sm mb-2 text-gray-400 hover:text-white">
            <HiOutlineArrowLeft className="h-5 w-5" /> Back
          </button>
        )}
        <h3 className="text-lg font-semibold">Friends</h3>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="px-3 py-2 bg-black-100 border border-gray-700 rounded-md text-sm" />
        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {filtered.map(f => (
            <button key={f.id} onClick={() => setActive(f)} className={`flex items-center gap-3 p-2 rounded-md transition ${active?.id === f.id ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
              <img src={f.profilePictureUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=5e17eb&color=fff`} alt={f.username} className="w-10 h-10 rounded-full object-cover" />
              <div className="text-left">
                <div className="font-medium">{f.username}</div>
                <div className="text-xs text-gray-400">#{f.id}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat panel */}
      <main className="flex-1 flex flex-col relative">
        {!active ? (
          <div className="m-auto text-gray-500">Select a friend to start chatting</div>
        ) : (
          <>
            <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-black-100/80 backdrop-blur">
              <span className="font-semibold">{active.username}</span>
              <span className="text-xs text-gray-400">ID {active.id}</span>
            </header>

            {/* messages */}
            <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {msgs.map((m, idx) => {
                if (m.isDeletedForSender) return null;
                const self       = m.senderId !== active.id;
                const hovered    = hoveredMsgId === m.id;
                const last       = idx === msgs.length - 1 || msgs[idx + 1].senderId !== m.senderId;
                const menuOpen   = openMenuId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`relative w-full flex items-start ${menuOpen ? 'z-50' : ''}`}   /* ← lift when menu open */
                    onMouseEnter={() => setHoveredMsgId(m.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <div className={`group flex flex-col gap-1 max-w-[80%] ${self ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      {m.replyToId && (
                        <div className="text-xs text-indigo-300 italic border-l-2 border-indigo-400 bg-black-200 rounded px-3 py-1">
                          ↪ {byId(m.replyToId)?.message.slice(0, 60) ?? '[Deleted]'}
                        </div>
                      )}

                      {/* bubble */}
                      <div className="relative flex items-center">
                        <div className={`px-4 py-2 rounded-2xl text-sm break-words max-w-[48ch] min-w-[4rem] ${self ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                          {editingId === m.id ? (
                            <div className="flex gap-2">
                              <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); if (e.key === 'Escape') cancelEdit(); }} className="flex-1 px-2 py-1 rounded text-black" />
                              <button onClick={send}><HiCheck className="text-white" /></button>
                              <button onClick={cancelEdit} className="text-gray-300 hover:text-white">×</button>
                            </div>
                          ) : (
                            <>
                              {m.message}
                              {m.isEdited && <span className="text-[10px] italic ml-1">(edited)</span>}
                            </>
                          )}
                        </div>

                        {/* hover controls */}
                        {hovered && (
                          <div className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${self ? 'right-[calc(100%+0.4rem)]' : 'left-[calc(100%+0.4rem)]'}`}>
                            <button onClick={() => setReplyTo(m.id)} className="p-1 rounded-full hover:bg-gray-800"><HiOutlineReply className="w-4 h-4 text-white" /></button>
                            <button onClick={e => openPicker(e, m.id)} className="p-1 rounded-full hover:bg-gray-800"><HiOutlineEmojiHappy className="w-5 h-5 text-white" /></button>

                            {/* menu */}
                            <div className="relative">
                              <button onClick={() => setOpenMenuId(menuOpen ? null : m.id)} className="p-1 rounded-full hover:bg-gray-800">
                                <HiOutlineDotsHorizontal className="w-5 h-5 text-white" />
                              </button>

                              {menuOpen && (
                                <div className={`absolute ${self ? 'right-0' : 'left-0'} mt-1 flex flex-col bg-black-100 shadow-[0_0_10px_2px_rgba(255,255,255,0.10)] rounded min-w-[6rem]`}>
                                  {self && (
                                    <>
                                      <button onClick={() => { setMsg(m.message); setEditingId(m.id); setOpenMenuId(null); }} className="px-3 py-1 text-left text-sm hover:bg-gray-700">Edit</button>
                                      <button onClick={() => { rmAll(m.id); setOpenMenuId(null); }} className="px-3 py-1 text-left text-sm text-red-400 hover:text-red-600 hover:bg-gray-700">Delete for All</button>
                                    </>
                                  )}
                                  <button onClick={() => { rmMe(m.id); setOpenMenuId(null); }} className="px-3 py-1 text-left text-sm text-red-400 hover:text-red-600 hover:bg-gray-700">Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* emoji strip */}
                      {!!m.emojis.length && (
                        <div className="flex flex-wrap gap-1 mt-1 text-xl">
                          {m.emojis.map((e, i) => (
                            <div key={i} title={e.fullName} onClick={() => unreact(m.id)} className="bg-black-200 px-2 py-1 rounded-full cursor-pointer hover:opacity-80">{e.emoji}</div>
                          ))}
                        </div>
                      )}

                      {last && <div className="text-[10px] opacity-70">{new Date(m.sentAt).toLocaleTimeString()}</div>}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* floating picker (reaction) */}
            {showPicker && pickerPos && reactingToId && (
              <div className="fixed z-50" style={{ top: pickerPos.top, left: pickerPos.left, width: Math.min(320, window.innerWidth - 16) }}>
                <div ref={pickerRef} className="relative bg-black rounded-xl shadow-lg border border-gray-700">
                  <button onClick={() => { setShowPicker(false); setReactingToId(null); }} className="absolute right-1 top-1 text-gray-400 hover:text-white">×</button>
                  <Picker width={Math.min(320, window.innerWidth - 16)} height={350} theme={Theme.DARK} onEmojiClick={e => react(reactingToId, e.emoji)} />
                </div>
              </div>
            )}

            {/* composer */}
            <div className="flex flex-col gap-1 p-3 border-t border-gray-800 bg-black-100/80 backdrop-blur">
              {replyTo && (
                <div className="text-xs text-gray-400 mb-1 flex items-start gap-1">
                  <span className="font-semibold">Replying to:</span>
                  <span className="truncate max-w-[60%]">{byId(replyTo)?.message.slice(0, 60) ?? '[Deleted]'}</span>
                  <button onClick={() => setReplyTo(null)} className="ml-auto text-red-500">Cancel</button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button onClick={() => { setShowPicker(!showPicker); setReactingToId(null); }} className="text-white px-2">😀</button>
                <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…" className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm" />
                <button onClick={send} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium">Send</button>
              </div>

              {!reactingToId && showPicker && (
                <div className="mt-2"><Picker width={320} height={350} 
                theme={Theme.DARK} onEmojiClick={addEmojiToInput} /></div>
              )}
            </div>
          </>
        )}
        {error && <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-sm">{error}</div>}
      </main>
    </div>
  );
}

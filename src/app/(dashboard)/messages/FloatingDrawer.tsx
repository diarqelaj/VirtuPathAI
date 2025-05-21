'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiOutlineArrowLeft,
  HiOutlineReply,
  HiOutlineEmojiHappy,
  HiOutlineDotsHorizontal,
  HiOutlineCheck,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { FiSmile } from 'react-icons/fi';
import Picker, { Theme } from 'emoji-picker-react';
import api from '@/lib/api';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { OfficialBadge } from '@/components/OfficialBadge';

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
interface Friend {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string | null;
  isVerified?: boolean;
  isOfficial?: boolean;
  verifiedDate?: string;
}

export default function FloatingDrawer() {
  const router = useRouter();

  /* viewport check */
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* state */
  const [myId, setMyId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Friend | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);

  /* swipe helpers */
  const [swipeState, setSwipeState] = useState<{ id: number; offset: number; releasing: boolean } | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const longPressTimeout = useRef<number | null>(null);
  const lastTapRef = useRef<{ id: number; t: number }>({ id: 0, t: 0 });
  const MENU_W = 180, MENU_H = 160, MARG = 2, GAP = 2;

  /* context menu */
  const [menuMsgId, setMenuMsgId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* emoji picker */
  const [reactingToId, setReactingToId] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  /* misc */
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAfterSend = useRef(false);
  const [error, setError] = useState('');

  /* helper */
  const byId = (id: number | null) => id ? msgs.find(m => m.id === id) ?? null : null;

  /* ─── load me + friends ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ userID: number }>('/users/me');
        setMyId(me.data.userID);

        const raw = await api.get<any[]>(`/UserFriends/mutual/${me.data.userID}`);
        const list = raw.data
          .map((f: any) => ({
            id: f.id ?? f.userID ?? f.friendId,
            username: f.username,
            fullName: f.fullName ?? f.username,
            profilePictureUrl: f.profilePictureUrl ?? null
          }))
          .filter((f: any) => f.id);

        const enriched = await Promise.all(
          list.map(async (fr: Friend) => {
            try {
              const full = await api.get<{
                isVerified?: boolean;
                isOfficial?: boolean;
                verifiedDate?: string;
              }>(`/users/by-username/${fr.username}`);
              return {
                ...fr,
                isVerified: full.data.isVerified,
                isOfficial: full.data.isOfficial,
                verifiedDate: full.data.verifiedDate
              };
            } catch {
              return fr;
            }
          })
        );

        setFriends(enriched);
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  /* ─── messages poll ───────────────────────────────────────────────────────────────────────────── */
  const enrichMsg = async (m: any): Promise<ChatMessage> => {
    try {
      const res = await api.get<EmojiReaction[]>(`/Chat/react/${m.id}`);
      return { ...m, emojis: res.data, replyToId: m.replyToId ?? (m.replyToMessageId ?? null) };
    } catch {
      return { ...m, emojis: [], replyToId: m.replyToId ?? (m.replyToMessageId ?? null) };
    }
  };
  const fetchMessages = async (uid: number) => {
    const r = await api.get<ChatMessage[]>(`/chat/messages/${uid}`);
    const data = await Promise.all(r.data.map(enrichMsg));
    setMsgs(data);
    if (scrollAfterSend.current) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      scrollAfterSend.current = false;
    }
  };
  useEffect(() => {
    if (!active) return;
    fetchMessages(active.id);
    const t = setInterval(() => fetchMessages(active.id), 2000);
    return () => clearInterval(t);
  }, [active]);

  /* ─── focus hacks ──────────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (editingId !== null || replyTo !== null) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editingId, replyTo]);

  /* ─── outside-click / esc ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!showPicker) return;
    const close = () => { setShowPicker(false); setReactingToId(null); setPickerPos(null); };
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [showPicker]);
  useEffect(() => {
    if (!menuMsgId) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuMsgId(null);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [menuMsgId]);

  /* ─── positioning helpers ─────────────────────────────────────────────────────────────────────── */
  const openMenuMsg = (id: number, rect: DOMRect) => {
    let left = rect.left + rect.width / 2 - MENU_W / 2;
    if (left < MARG) left = MARG;
    if (left + MENU_W > window.innerWidth - MARG) left = window.innerWidth - MARG - MENU_W;
    let top = rect.top - MENU_H - GAP;
    if (top < MARG) {
      top = rect.bottom + GAP;
      const maxTop = window.innerHeight - MARG - MENU_H;
      if (top > maxTop) top = maxTop;
    }
    setMenuPos({ top: top + window.scrollY, left });
    setMenuMsgId(id);
  };
  const openPicker = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = Math.min(320, window.innerWidth - 16), H = 360;
    let top = rect.bottom + H > window.innerHeight ? rect.top - H : rect.bottom;
    let left = rect.left;
    if (left + W > window.innerWidth) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    setPickerPos({ top: top + window.scrollY, left });
    setReactingToId(id);
    setShowPicker(true);
  };

  /* ─── touch/swipe handlers ───────────────────────────────────────────────────────────────────── */
  const onTouchStart = (m: ChatMessage) => (e: React.TouchEvent) => {
    if (!compact) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwipeState({ id: m.id, offset: 0, releasing: false });
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    longPressTimeout.current = window.setTimeout(() => openMenuMsg(m.id, rect), 600);
  };
  const onTouchMove = (m: ChatMessage) => (e: React.TouchEvent) => {
    if (!compact || !swipeState || swipeState.id !== m.id) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const offset = m.senderId === myId ? Math.min(0, dx) : Math.max(0, dx);
    setSwipeState({ id: m.id, offset, releasing: false });
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };
  const onTouchEnd = (m: ChatMessage) => (e: React.TouchEvent) => {
    if (!compact || !swipeState || swipeState.id !== m.id) return;
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const now = Date.now();
    const tap = Math.abs(dx) < 8 && Math.abs(dy) < 8;
    if (tap) {
      const last = lastTapRef.current;
      if (now - last.t < 300 && last.id === m.id) {
        const already = m.emojis.some(r => r.userId === myId && r.emoji === '❤️');
        already ? unreact(m.id) : react(m.id, '❤️');
        lastTapRef.current = { id: 0, t: 0 };
      } else {
        lastTapRef.current = { id: m.id, t: now };
      }
    }
    const swiped = Math.abs(dx) > 50 && Math.abs(dy) < 50;
    setSwipeState(s => s && { ...s, releasing: true, offset: 0 });
    if (swiped) {
      if (dx > 0 && m.senderId !== myId) setReplyTo(m.id);
      if (dx < 0 && m.senderId === myId) setReplyTo(m.id);
    }
    setTimeout(() => setSwipeState(null), 200);
  };

  /* ─── actions ───────────────────────────────────────────────────────────────────────────────── */
  const send = async () => {
    if (!msg.trim() || !active || myId === null) return;
    try {
      if (editingId) {
        await api.put(`/chat/edit/${editingId}`, { newMessage: msg.trim() });
        setEditingId(null);
      } else {
        await api.post('/chat/send', {
          receiverId: active.id,
          message: msg.trim(),
          ReplyToMessageId: replyTo
        });
        scrollAfterSend.current = true;
      }
      setMsg(''); setReplyTo(null);
    } catch {
      setError('Failed to send');
    }
  };
  const react = (id: number, emoji: string) => api.patch(`/Chat/react/${id}`, { Emoji: emoji }).catch(() => setError('React failed'));
  const unreact = (id: number) => api.delete(`/Chat/react/${id}`).catch(() => setError('Unreact failed'));
  const rmMe = (id: number) => api.post(`/chat/delete/${id}/sender`).catch(() => setError('Delete failed'));
  const rmAll = (id: number) => api.post(`/chat/delete-for-everyone/${id}`).catch(() => setError('Delete-all failed'));
  const addEmojiToInput = (e: any) => setMsg(p => p + e.emoji);

  /* ─── friend filter ───────────────────────────────────────────────────────────────────────────── */
  const filtered = friends.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full text-white text-sm">
      {/* ─── Friend List ───────────────────────────────────────────────────────────── */}
      {!active && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-base font-semibold mb-2">Friends</h3>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full px-3 py-2 bg-black-100 border border-gray-700 rounded-md placeholder-gray-500"
          />
          <div className="mt-3 flex flex-col gap-1 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
            {filtered.map(f => (
              <button
                key={f.id}
                onClick={() => setActive(f)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800/60"
              >
                <img
                  src={f.profilePictureUrl
                    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=5e17eb&color=fff`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="font-medium truncate">{f.fullName}</span>
                    {f.isOfficial
                      ? <OfficialBadge date={f.verifiedDate} />
                      : f.isVerified
                        ? <VerifiedBadge date={f.verifiedDate} />
                        : null}
                  </div>
                  <div className="text-xs text-gray-400 truncate">@{f.username}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Chat Panel ───────────────────────────────────────────────────────────── */}
      {active && (
        <>
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black-100/80 backdrop-blur">
            <button onClick={() => setActive(null)} className="p-1">
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-300"/>
            </button>
            <div
              onClick={() => router.push(`/${active.username}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={active.profilePictureUrl
                  ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(active.fullName)}&background=5e17eb&color=fff`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold truncate">{active.fullName}</span>
                  {active.isOfficial
                    ? <OfficialBadge date={active.verifiedDate}/>
                    : active.isVerified
                      ? <VerifiedBadge date={active.verifiedDate}/>
                      : null}
                </div>
                <div className="text-xs text-gray-400 truncate">@{active.username}</div>
              </div>
            </div>
            <button onClick={() => console.log('Info for', active.id)} className="p-1">
              <HiOutlineInformationCircle className="w-5 h-5 text-gray-300"/>
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pb-32 md:pb-4">
            {msgs.map((m, idx) => {
              if (myId === null || m.isDeletedForSender) return null;
              const isOutgoing = m.senderId === myId;
              const hovered = hoveredMsgId === m.id;
              const lastOfGroup = idx === msgs.length - 1 || msgs[idx + 1].senderId !== m.senderId;

              return (
                <div
                  key={m.id}
                  className={`relative w-full flex items-start ${menuMsgId === m.id ? 'z-50' : ''}`}
                  onMouseEnter={() => !compact && setHoveredMsgId(m.id)}
                  onMouseLeave={() => !compact && setHoveredMsgId(null)}
                  onTouchStart={onTouchStart(m)}
                  onTouchMove={onTouchMove(m)}
                  onTouchEnd={onTouchEnd(m)}
                >
                  <div
                    className={`flex flex-col gap-1 max-w-[80%] ${isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    style={{
                      transform: swipeState?.id === m.id
                        ? `translateX(${swipeState.offset}px)`
                        : undefined,
                      transition: swipeState?.releasing
                        ? 'transform 0.2s ease-out'
                        : 'none',
                    }}
                  >
                    {m.replyToId && (
                      <div className="text-xs text-indigo-300 italic border-l-2 border-indigo-400 bg-black-200 rounded px-3 py-1">
                        ↪ {byId(m.replyToId)?.message.slice(0, 60) ?? '[Deleted]'}
                      </div>
                    )}
                    <div className="relative flex items-center">
                      <div
                        onDoubleClick={() => react(m.id, '❤️')}
                        className={`px-4 py-2 rounded-2xl text-sm break-words ${isOutgoing ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-100'}`}
                      >
                        {m.message}
                        {m.isEdited && <span className="italic text-[10px] ml-1">(edited)</span>}
                      </div>
                      {!compact && hovered && (
                        <div className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${isOutgoing ? 'right-[calc(100%+0.4rem)]' : 'left-[calc(100%+0.4rem)]'}`}>
                          <button onClick={() => setReplyTo(m.id)} className="p-1 rounded-full hover:bg-gray-800">
                            <HiOutlineReply className="w-4 h-4"/>
                          </button>
                          <button onClick={e => openPicker(e, m.id)} className="p-1 rounded-full hover:bg-gray-800">
                            <HiOutlineEmojiHappy className="w-5 h-5"/>
                          </button>
                          <button onClick={e => {
                              e.stopPropagation();
                              openMenuMsg(m.id, (e.currentTarget as HTMLElement).getBoundingClientRect());
                            }} className="p-1 rounded-full hover:bg-gray-800">
                            <HiOutlineDotsHorizontal className="w-5 h-5"/>
                          </button>
                        </div>
                      )}
                    </div>
                    {!!m.emojis.length && (
                      <div className="flex flex-wrap gap-1 mt-1 text-xl">
                        {m.emojis.map((e, i) => (
                          <div
                            key={i}
                            onClick={() => unreact(m.id)}
                            className="bg-black-200 px-2 py-1 rounded-full cursor-pointer hover:opacity-80"
                            title={e.fullName}
                          >
                            {e.emoji}
                          </div>
                        ))}
                      </div>
                    )}
                    {lastOfGroup && (
                      <div className="text-[10px] opacity-70">
                        {new Date(m.sentAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* context menu */}
          {menuMsgId && menuPos && (
            <div
              ref={menuRef}
              className="fixed z-50 bg-black-100 border border-gray-700 rounded shadow-lg p-2"
              style={{ top: menuPos.top, left: menuPos.left, width: MENU_W }}
            >
              <div className="flex items-center gap-1 flex-wrap mb-2">
                {msgs.find(m => m.id === menuMsgId)?.emojis.slice(0, 5).map((e, i) => (
                  <button key={i} onClick={() => react(menuMsgId, e.emoji)} className="p-1 text-xl">{e.emoji}</button>
                ))}
                <button onClick={e => openPicker(e as any, menuMsgId!)} className="p-1">
                  <HiOutlineEmojiHappy/>
                </button>
              </div>
              <button onClick={() => { setReplyTo(menuMsgId!); setMenuMsgId(null); }}
                      className="w-full text-left px-2 py-1 hover:bg-gray-800 rounded">
                Reply
              </button>
              <button onClick={() => { rmMe(menuMsgId!); setMenuMsgId(null); }}
                      className="w-full text-left px-2 py-1 hover:bg-gray-800 rounded text-red-400">
                Delete
              </button>
              {msgs.find(m => m.id === menuMsgId)?.senderId === myId && (
                <button onClick={() => { rmAll(menuMsgId!); setMenuMsgId(null); }}
                        className="w-full text-left px-2 py-1 hover:bg-gray-800 rounded text-red-400">
                  Delete for All
                </button>
              )}
            </div>
          )}

          {/* emoji picker */}
          {showPicker && pickerPos && reactingToId && (
            <div
              className="fixed z-50"
              style={{
                top: pickerPos.top,
                left: pickerPos.left,
                width: Math.min(320, window.innerWidth - 16)
              }}
            >
              <div ref={pickerRef} className="relative bg-black rounded-xl shadow-lg border border-gray-700">
                <button onClick={() => { setShowPicker(false); setReactingToId(null); }}
                        className="absolute right-1 top-1 text-gray-400 hover:text-white">×</button>
                <Picker
                  width={Math.min(320, window.innerWidth - 16)}
                  height={350}
                  theme={Theme.DARK}
                  onEmojiClick={e => react(reactingToId!, e.emoji)}
                />
              </div>
            </div>
          )}

          {/* composer */}
          <div className="sticky bottom-0 z-20 flex flex-col gap-1 p-3 border-t border-white/10 bg-black-100/80 backdrop-blur">
            {replyTo && (
              <div className="text-xs text-gray-400 mb-1 flex items-start gap-1">
                <span className="font-semibold">Replying to:</span>
                <span className="truncate max-w-[60%]">{byId(replyTo)?.message.slice(0, 60) ?? '[Deleted]'}</span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-red-500">×</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowPicker(!showPicker); setReactingToId(null); }} className="p-2">
                <FiSmile className="w-6 h-6 text-gray-300"/>
              </button>
              <input
                ref={inputRef}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm"
              />
              <button onClick={send} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium">
                Send
              </button>
            </div>
          </div>
        </>
      )}
      {error && (
        <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-xs">{error}</div>
      )}
    </div>
  );
}

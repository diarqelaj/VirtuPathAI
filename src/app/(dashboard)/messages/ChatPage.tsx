'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiOutlineArrowLeft,
  HiOutlineReply,
  HiOutlineEmojiHappy,
  HiOutlineDotsHorizontal,
  HiCheck,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { FiSmile } from 'react-icons/fi';
import Picker, { Theme } from 'emoji-picker-react';
import api from '@/lib/api';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { OfficialBadge } from '@/components/OfficialBadge';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';

/* ---------- types ---------- */
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
  isVerified?: boolean;
  isOfficial?: boolean;
  verifiedDate?: string;
}

/* ---------- component ---------- */
export default function ChatPage() {
  const router = useRouter();

  /* detect screen */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const compact = isMobile;

  /* state */
  const [myId, setMyId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Friend | null>(null);

  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const lastTapRef = useRef<{ id: number; t: number }>({ id: 0, t: 0 });
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);

  /* swipe (mobile) */
  const [swipeState, setSwipeState] =
    useState<{ id: number; offset: number; releasing: boolean } | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const longPressTimeout = useRef<number | null>(null);
  const MENU_MARGIN = 2;
  const MENU_V_GAP = 2;
  const MENU_WIDTH = 180;
  const MENU_HEIGHT = 160;

  /* context-menu */
  const [menuMsgId, setMenuMsgId] = useState<number | null>(null);
  const [menuPos, setMenuPos] =
    useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* emoji picker */
  const [reactingToId, setReactingToId] = useState<number | null>(null);
  const [pickerPos, setPickerPos] =
    useState<{ top: number; left: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  /* misc refs */
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAfterSend = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');

  /* helpers */
  const cancelEdit = () => {
    setEditingId(null);
    setMsg('');
  };
  const byId = (id: number | null) =>
    id ? msgs.find((m) => m.id === id) ?? null : null;

  /* -------- initial load (me + friends) -------- */
  useEffect(() => {
    (async () => {
      try {
        // 1) who am I?
        const me = await api.get<{ userID: number }>('/users/me');
        setMyId(me.data.userID);

        // 2) mutual friends raw
        const raw = await api.get<RawFriendDto[]>(
          `/UserFriends/mutual/${me.data.userID}`
        );
        const list = raw.data
          .map((f) => {
            const id = f.id ?? f.userID ?? f.friendId;
            return id
              ? {
                  id,
                  username: f.username,
                  fullName: f.fullName ?? f.username,
                  profilePictureUrl: f.profilePictureUrl ?? null
                }
              : null;
          })
          .filter(Boolean) as Friend[];

        // 3) enrich each friend with their user info (for badges)
        const enriched = await Promise.all(
          list.map(async (fr) => {
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

  /* -------- fetch + poll messages -------- */
  const fetchMessages = async (uid: number) => {
    const r = await api.get<ChatMessage[]>(`/chat/messages/${uid}`);
    const enriched = await Promise.all(
      r.data.map(async (m) => {
        try {
          const res = await api.get<EmojiReaction[]>(`/Chat/react/${m.id}`);
          return {
            ...m,
            emojis: res.data,
            replyToId:
              m.replyToId ?? (m as any).replyToMessageId ?? null
          };
        } catch {
          return {
            ...m,
            emojis: [],
            replyToId:
              m.replyToId ?? (m as any).replyToMessageId ?? null
          };
        }
      })
    );
    setMsgs(enriched);
    if (scrollAfterSend.current) {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
        0
      );
      scrollAfterSend.current = false;
    }
  };
  useEffect(() => {
    if (!active) return;
    scrollAfterSend.current = true;
    fetchMessages(active.id);
    const t = setInterval(() => fetchMessages(active.id), 2000);
    return () => clearInterval(t);
  }, [active]);

  /* -------- focus tricks -------- */
  useEffect(() => {
    if (editingId !== null || replyTo !== null) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editingId, replyTo]);

  /* -------- outside-click handlers -------- */
  useEffect(() => {
    if (!showPicker) return;
    const close = () => {
      setShowPicker(false);
      setReactingToId(null);
      setPickerPos(null);
    };
    const click = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        close();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', click);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', click);
      window.removeEventListener('keydown', esc);
    };
  }, [showPicker]);
  useEffect(() => {
    if (!menuMsgId) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuMsgId(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [menuMsgId]);

  /* -------- positioning helper -------- */
  const openMenuMsg = (id: number, rect: DOMRect) => {
    let left = rect.left + rect.width / 2 - MENU_WIDTH / 2;
    if (left < MENU_MARGIN) left = MENU_MARGIN;
    if (left + MENU_WIDTH > window.innerWidth - MENU_MARGIN) {
      left = window.innerWidth - MENU_MARGIN - MENU_WIDTH;
    }
    let top = rect.top - MENU_HEIGHT - MENU_V_GAP;
    if (top < MENU_MARGIN) {
      top = rect.bottom + MENU_V_GAP;
      const maxTop = window.innerHeight - MENU_MARGIN - MENU_HEIGHT;
      if (top > maxTop) top = maxTop;
    }
    setMenuPos({ top: top + window.scrollY, left });
    setMenuMsgId(id);
  };

  const openPicker = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = Math.min(320, window.innerWidth - 16),
      H = 360;
    let top = rect.bottom + H > window.innerHeight ? rect.top - H : rect.bottom;
    let left = rect.left;
    if (left + W > window.innerWidth) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    setPickerPos({ top: top + window.scrollY, left });
    setReactingToId(id);
    setShowPicker(true);
  };

  /* -------- actions -------- */
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
      setMsg('');
      setReplyTo(null);
    } catch {
      setError('Failed to send.');
    }
  };

  const react = (id: number, emoji: string) =>
    api.patch(`/Chat/react/${id}`, { Emoji: emoji }).catch(() => setError('React failed'));
  const unreact = (id: number) =>
    api.delete(`/Chat/react/${id}`).catch(() => setError('Unreact failed'));
  const rmMe = (id: number) =>
    api.post(`/chat/delete/${id}/sender`).catch(() => setError('Delete failed'));
  const rmAll = (id: number) =>
    api.post(`/chat/delete-for-everyone/${id}`).catch(() => setError('Delete-all failed'));
  const addEmojiToInput = (e: any) => setMsg((p) => p + e.emoji);

  /* -------- friend filter -------- */
  const filtered = friends.filter(
    (f) =>
      f.username.toLowerCase().includes(search.toLowerCase()) ||
      f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  /* -------- sidebar -------- */
  const Sidebar = (
    <aside
      className={`h-full ${
        compact ? 'w-full border-b' : 'md:w-72 md:border-r'
      } border-gray-800 p-4 flex flex-col`}
    >
      {active && compact && (
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1 text-sm mb-2 text-gray-400 hover:text-white"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
          Back
        </button>
      )}
      <h3 className="text-lg font-semibold mb-2">Friends</h3>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search…"
        className="px-3 py-2 bg-black-100 border border-gray-700 rounded-md text-sm mb-4"
      />
      {/* scroll only this list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <ul className="space-y-2 pr-2">
          {filtered.map((f) => {
            const isActive = active?.id === f.id;
            return (
              <li key={f.id}>
                <button
                  onClick={() => setActive(f)}
                  className={`w-full flex items-center justify-between gap-3 p-2 rounded-lg ${
                    isActive ? 'bg-gray-800' : 'hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        f.profilePictureUrl
                          ? `${API_HOST}${f.profilePictureUrl}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              f.fullName
                            )}&background=5e17eb&color=fff`
                      }
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      alt={f.username}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-white font-medium">
                        {f.fullName}
                        {f.isOfficial ? (
                          <OfficialBadge date={f.verifiedDate} />
                        ) : f.isVerified ? (
                          <VerifiedBadge date={f.verifiedDate} />
                        ) : null}
                      </div>
                      <div className="text-xs text-gray-400">@{f.username}</div>
                    </div>
                  </div>
                  <span className="text-indigo-400 text-sm">Chat</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  /* -------- chat panel -------- */
  const ChatPanel = (
    <main className="flex-1 flex flex-col relative">
      {!active ? (
        <div className="m-auto text-gray-500">
          Select a friend to start chatting
        </div>
      ) : (
        <>
          {/* header */}
          <header className="sticky top-0 left-0 right-0 z-20 px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-black-100/90 backdrop-blur">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push(`/${active.username}`)}
            >
              {compact && (
                <HiOutlineArrowLeft
                  onClick={() => setActive(null)}
                  className="h-5 w-5 text-white"
                />
              )}
              <img
                src={
                  active.profilePictureUrl
                    ? `${API_HOST}${active.profilePictureUrl}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        active.fullName
                      )}&background=5e17eb&color=fff`
                }
                className="w-8 h-8 rounded-full object-cover"
                alt={active.username}
              />
              <span className="font-semibold">{active.fullName}</span>
              {active.isOfficial ? (
                <OfficialBadge date={active.verifiedDate} />
              ) : active.isVerified ? (
                <VerifiedBadge date={active.verifiedDate} />
              ) : null}
            </div>
            <button
              onClick={() => console.log('User options for', active.id)}
              className="p-1 rounded-full hover:bg-gray-800/60"
              title="User options"
            >
              <HiOutlineInformationCircle className="w-5 h-5 text-gray-400" />
            </button>
          </header>

          {/* message list */}
          <div className="flex-1 flex flex-col space-y-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pb-32 md:pb-4">
            {(() => {
              const GAP = 1000 * 60 * 30;
              let lastTime = 0;
              const nodes: React.ReactNode[] = [];
              msgs.forEach((m, idx) => {
                if (myId === null || m.isDeletedForSender) return;
                const t = new Date(m.sentAt).getTime();
                if (idx === 0 || t - lastTime > GAP) {
                  nodes.push(
                    <div key={`divider-${m.id}`} className="self-center my-2">
                      <span className="text-gray-400 text-xs px-3 py-1 rounded-full">
                        {new Date(m.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  );
                }
                lastTime = t;

                const isOutgoing = m.senderId === myId;
                const hovered = hoveredMsgId === m.id;

                nodes.push(
                  <div
                    key={m.id}
                    className={`relative w-full flex items-start ${
                      menuMsgId === m.id ? 'z-50' : ''
                    }`}
                    onMouseEnter={() => !compact && setHoveredMsgId(m.id)}
                    onMouseLeave={() => !compact && setHoveredMsgId(null)}
                    onTouchStart={(e) => {
                      if (!compact) return;
                      touchStartX.current = e.touches[0].clientX;
                      touchStartY.current = e.touches[0].clientY;
                      setSwipeState({ id: m.id, offset: 0, releasing: false });
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      longPressTimeout.current = window.setTimeout(() => {
                        openMenuMsg(m.id, rect);
                      }, 600);
                    }}
                    onTouchMove={(e) => {
                      if (!compact || !swipeState || swipeState.id !== m.id) return;
                      const dx = e.touches[0].clientX - touchStartX.current;
                      const offset = isOutgoing ? Math.min(0, dx) : Math.max(0, dx);
                      setSwipeState({ id: m.id, offset, releasing: false });
                      if (longPressTimeout.current) {
                        clearTimeout(longPressTimeout.current);
                        longPressTimeout.current = null;
                      }
                    }}
                    onTouchEnd={(e) => {
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
                          const hearted = m.emojis.some(
                            (r) => r.userId === myId && r.emoji === '❤️'
                          );
                          hearted ? unreact(m.id) : react(m.id, '❤️');
                          lastTapRef.current = { id: 0, t: 0 };
                        } else {
                          lastTapRef.current = { id: m.id, t: now };
                        }
                      }
                      const swiped = Math.abs(dx) > 50 && Math.abs(dy) < 50;
                      setSwipeState((s) =>
                        s ? { ...s, offset: 0, releasing: true } : null
                      );
                      if (swiped) {
                        if (!isOutgoing && dx > 0) setReplyTo(m.id);
                        if (isOutgoing && dx < 0) setReplyTo(m.id);
                      }
                      setTimeout(() => setSwipeState(null), 200);
                    }}
                  >
                    <div
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                      style={{
                        transform:
                          swipeState?.id === m.id
                            ? `translateX(${swipeState.offset}px)`
                            : undefined,
                        transition: swipeState?.releasing
                          ? 'transform 0.2s ease-out'
                          : 'none'
                      }}
                    >
                      {m.replyToId && (
                        <div className="flex items-center text-xs text-indigo-300 italic border-l-2 border-indigo-400 bg-black-200 rounded px-3 py-1">
                          <HiOutlineReply className="w-4 h-4 mr-1" />
                          <span className="truncate">
                            {byId(m.replyToId)?.message.slice(0, 60) ?? '[Deleted]'}
                          </span>
                        </div>
                      )}
                      <div className="relative flex items-center">
                        <div
                          onDoubleClick={() => react(m.id, '❤️')}
                          className={`px-4 py-2 rounded-2xl text-sm break-words max-w-[48ch] min-w-[4rem] ${
                            isOutgoing
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          {editingId === m.id ? (
                            <div className="flex gap-2">
                              <input
                                ref={inputRef}
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') send();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 px-2 py-1 rounded text-black"
                              />
                              <button onClick={send}>
                                <HiCheck className="text-white" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-300 hover:text-white"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <>
                              {m.message}
                              {m.isEdited && (
                                <span className="text-[10px] italic ml-1">(edited)</span>
                              )}
                            </>
                          )}
                        </div>
                        {!compact && hovered && (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${
                              isOutgoing
                                ? 'right-[calc(100%+0.4rem)]'
                                : 'left-[calc(100%+0.4rem)]'
                            }`}
                          >
                            <button
                              onClick={() => setReplyTo(m.id)}
                              className="p-1 rounded-full hover:bg-gray-800"
                            >
                              <HiOutlineReply className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={(e) => openPicker(e, m.id)}
                              className="p-1 rounded-full hover:bg-gray-800"
                            >
                              <HiOutlineEmojiHappy className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                openMenuMsg(m.id, rect);
                              }}
                              className="p-1 rounded-full hover:bg-gray-800"
                            >
                              <HiOutlineDotsHorizontal className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                      {!!m.emojis.length && (
                        <div className="flex flex-wrap gap-1 mt-1 text-xl">
                          {m.emojis.map((e, i) => (
                            <div
                              key={i}
                              title={e.fullName}
                              onClick={() => unreact(m.id)}
                              className="bg-black-200 px-2 py-1 rounded-full cursor-pointer hover:opacity-80"
                            >
                              {e.emoji}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
              nodes.push(<div ref={bottomRef} key="bottom" />);
              return nodes;
            })()}
          </div>

          {/* context-menu */}
          {menuMsgId && menuPos && (
            <div
              ref={menuRef}
              className="fixed z-50 bg-black-100 rounded border-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.1)] p-2"
              style={{ top: menuPos.top, left: menuPos.left, width: 200 }}
            >
              <button
                onClick={() => {
                  setReplyTo(menuMsgId!);
                  setMenuMsgId(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
              >
                <HiOutlineReply className="w-5 h-5" /> Reply
              </button>
              {msgs.find((m) => m.id === menuMsgId)?.senderId === myId && (
                <button
                  onClick={() => {
                    setEditingId(menuMsgId!);
                    setMenuMsgId(null);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
                >
                  <HiOutlinePencilAlt className="w-5 h-5" /> Edit message
                </button>
              )}
              <button
                onClick={() => {
                  setReactingToId(menuMsgId!);
                  setShowPicker(true);
                  setMenuMsgId(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
              >
                <HiOutlineEmojiHappy className="w-5 h-5" /> React to message
              </button>
              <button
                onClick={() => {
                  rmMe(menuMsgId!);
                  setMenuMsgId(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded text-red-400"
              >
                <HiOutlineTrash className="w-5 h-5" /> Delete for you
              </button>
              {msgs.find((m) => m.id === menuMsgId)?.senderId === myId && (
                <button
                  onClick={() => {
                    rmAll(menuMsgId!);
                    setMenuMsgId(null);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded text-red-400"
                >
                  <HiOutlineTrash className="w-5 h-5" /> Delete for all
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
              <div
                ref={pickerRef}
                className="relative bg-black rounded-xl shadow-lg border border-gray-700"
              >
                <button
                  onClick={() => {
                    setShowPicker(false);
                    setReactingToId(null);
                  }}
                  className="absolute right-1 top-1 text-gray-400 hover:text-white"
                >
                  ×
                </button>
                <Picker
                  width={Math.min(320, window.innerWidth - 16)}
                  height={350}
                  theme={Theme.DARK}
                  onEmojiClick={(e) => react(reactingToId!, e.emoji)}
                />
              </div>
            </div>
          )}

          {/* composer */}
          <div className="sticky bottom-0 left-0 right-0 z-20 flex flex-col gap-1 p-3 border-t border-gray-800 bg-black-100/90 backdrop-blur">
            {replyTo && (
              <div className="text-xs text-gray-400 mb-1 flex items-start gap-1">
                <span className="font-semibold">Replying to:</span>
                <span className="truncate max-w-[60%]">
                  {byId(replyTo)?.message.slice(0, 60) ?? '[Deleted]'}
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="ml-auto text-red-500"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowPicker(!showPicker);
                  setReactingToId(null);
                }}
                className="p-2 rounded-full hover:bg-gray-800/60"
              >
                <FiSmile className="w-5 h-5 text-gray-400" />
              </button>
              <input
                ref={inputRef}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm"
              />
              <button
                onClick={send}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium"
              >
                Send
              </button>
            </div>
            {!reactingToId && showPicker && (
              <div className="mt-2">
                <Picker
                  width={320}
                  height={350}
                  theme={Theme.DARK}
                  onEmojiClick={addEmojiToInput}
                />
              </div>
            )}
          </div>
        </>
      )}
      {error && (
        <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-sm">
          {error}
        </div>
      )}
    </main>
  );

  return (
    <div className="h-full bg-black-100 text-white">
      {!compact ? (
        <div className="flex md:flex-row h-full">
          {Sidebar}
          {ChatPanel}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {!active ? Sidebar : ChatPanel}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef,useLayoutEffect , useState } from 'react';
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
  HiOutlineX ,

} from 'react-icons/hi';
import { FiSmile } from 'react-icons/fi';
import dynamic from 'next/dynamic'
import EmojiGrid from '@/components/EmojiGrid'
import api from '@/lib/api';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { OfficialBadge } from '@/components/OfficialBadge';
import { createPortal } from 'react-dom';
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import styles from "./typing.module.css"


const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';

/* ---------- types ---------- */
interface EmojiReaction {
  userId: number;
  emoji: string;
  fullName: string;
  profilePictureUrl: string | null;
}
interface ChatMessage {
  id:             number;
  senderId:       number;
  receiverId:     number;
  message:        string;
  sentAt:         string;
  replyToMessageId?: number | null;  // ← add this
  replyToId?:       number | null;   // you can still keep replyToId if you like
  emojis:         EmojiReaction[];
  isEdited?:      boolean;
  isDeletedForSender?:   boolean;
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

export default function ChatPage() {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // initialize
    setIsMobile(mql.matches);
    // listen for changes
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
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
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [hub, setHub] = useState<HubConnection | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
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
  const [menuHeight, setMenuHeight] = useState(0);

  /* reaction picker */
  const [reactingToId, setReactingToId] = useState<number | null>(null);
 // for reactions
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPos, setReactionPickerPos] = useState<{ top: number; left: number } | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  // for composer
  const [showComposerPicker, setShowComposerPicker] = useState(false);
  const [composerPickerPos, setComposerPickerPos] = useState<{ top: number; left: number } | null>(null);
  const composerPickerRef = useRef<HTMLDivElement>(null);


  /* misc refs */
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAfterSend = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const firstLoad = useRef(true);
  const prevMsgsCount = useRef(0);
  const [error, setError] = useState('');
  const SCROLL_THRESHOLD = 20; // px from bottom
  

  /* helpers */
  const byId = (id: number | null) =>
    id ? msgs.find((m) => m.id === id) ?? null : null;
  const cancelEdit = () => {
    setEditingId(null);
    setMsg('');
  };
  const handleScroll = () => {
    const c = containerRef.current;
    if (!c) return;
    if (c.scrollTop + c.clientHeight >= c.scrollHeight - SCROLL_THRESHOLD) {
      setHasNewMessages(false);
    }
  };
  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  };

  /* load me + friends */
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ userID: number }>('/users/me');
        setMyId(me.data.userID);

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
                  profilePictureUrl: f.profilePictureUrl ?? null,
                }
              : null;
          })
          .filter(Boolean) as Friend[];

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
                verifiedDate: full.data.verifiedDate,
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

    //  ▶▶▶ REAL-TIME CHAT: initial load + SignalR hookup
    useEffect(() => {
      if (!active) return;

      // 1) load history once
      (async () => {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        const data = await Promise.all(r.data.map(async m => {
          const reactions = await api.get<EmojiReaction[]>(`/Chat/react/${m.id}`);
          return { ...m, emojis: reactions.data, replyToId: m.replyToId ?? m.replyToMessageId ?? null };
        }));
        setMsgs(data);
        scrollAfterSend.current = true;
      })();

      // 2) build & start SignalR connection
      const connection = new HubConnectionBuilder()
        .withUrl(`${API_HOST}/chathub`, { withCredentials: true })
        .withAutomaticReconnect()
        .build();

      // 3) subscribe to hub events
      connection.on("ReceiveMessage", (m: ChatMessage) => {
        setMsgs(ms => [...ms, { ...m, emojis: [], replyToId: m.replyToId ?? m.replyToMessageId ?? null }]);
        scrollAfterSend.current = true;
      });
      connection.on("MessageEdited", ({ id, message, isEdited }) =>
        setMsgs(ms => ms.map(m => m.id === id ? { ...m, message, isEdited } : m))
      );
      connection.on("MessageDeletedForSender", (id: number) =>
        setMsgs(ms => ms.filter(m => m.id !== id))
      );
      connection.on("MessageDeletedForEveryone", (id: number) =>
        setMsgs(ms => ms.filter(m => m.id !== id))
      );
      connection.on("MessageReacted", ({ messageId, userId, emoji }) => {
        setMsgs(ms => ms.map(m =>
          m.id === messageId
            ? { ...m, emojis: [...m.emojis.filter(e => e.userId !== userId), { userId, emoji, fullName: "", profilePictureUrl: null }] }
            : m
        ));
      });
      connection.on("MessageReactionRemoved", ({ messageId, userId }) => {
        setMsgs(ms => ms.map(m =>
          m.id === messageId
            ? { ...m, emojis: m.emojis.filter(e => e.userId !== userId) }
            : m
        ));
      });

      connection.start().catch(console.error);
      setHub(connection);

      return () => {
        connection.stop();
        setHub(null);
      };
    }, [active]);

  
    /** establish a single, app-wide hub connection */
    useEffect(() => {
      const connection = new HubConnectionBuilder()
        .withUrl(`${API_HOST}/chathub`, { withCredentials: true })
        .withAutomaticReconnect()
        .build();

      // presence
      connection.on("UserOnline", (uid: string) => {
        setOnlineUsers(s => { const next = new Set(s); next.add(+uid); return next; });
      });
      connection.on("UserOffline", (uid: string) => {
        setOnlineUsers(s => { const next = new Set(s); next.delete(+uid); return next; });
      });

      // typing
      connection.on("UserTyping", (uid: string) => {
        setTypingUsers(s => { const next = new Set(s); next.add(+uid); return next; });
      });
      connection.on("UserStopTyping", (uid: string) => {
        setTypingUsers(s => { const next = new Set(s); next.delete(+uid); return next; });
      });

      connection.start()
        .then(() => {
          console.log("📶 SignalR connected for presence");
          setHub(connection);    // reuse this hub for your message logic below
        })
        .catch(console.error);

      return () => void connection.stop();
    }, []);
  /* focus hacks */
  useEffect(() => {
    if (editingId !== null || replyTo !== null) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editingId, replyTo]);

  useEffect(() => {
    if (!showReactionPicker) return;
    const close = (e: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target as Node)
      ) {
        setShowReactionPicker(false);
        setReactingToId(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showReactionPicker]);
  
  // Composer picker outside click
  useEffect(() => {
    if (!showComposerPicker) return;
    const close = (e: MouseEvent) => {
      if (
        composerPickerRef.current &&
        !composerPickerRef.current.contains(e.target as Node)
      ) {
        setShowComposerPicker(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showComposerPicker]);
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

  /* positioning helpers */
  const openMenuMsg = (id: number, rect: DOMRect) => {
    let left = rect.left;
    if (left + MENU_WIDTH > window.innerWidth - MENU_MARGIN) {
      left = window.innerWidth - MENU_MARGIN - MENU_WIDTH;
    }
    let top = rect.bottom + MENU_V_GAP;
    if (top + MENU_HEIGHT > window.innerHeight - MENU_MARGIN) {
      top = rect.top - MENU_HEIGHT - MENU_V_GAP;
    }
    setMenuPos({ top: top + window.scrollY, left: left + window.scrollX });
    setMenuMsgId(id);
  };

  const openReactionPicker = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = Math.min(320, window.innerWidth - 16),
      H = 360;
    let top = rect.bottom + H > window.innerHeight ? rect.top - H : rect.bottom;
    let left = rect.left;
    if (left + W > window.innerWidth) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    setReactionPickerPos({ top: top + window.scrollY, left });
    setReactingToId(id);
    setShowReactionPicker(true);
  };

  const openComposerPicker = () => {
    if (!emojiButtonRef.current) return;
    const rect = emojiButtonRef.current.getBoundingClientRect();
    const W = Math.min(compact ? 200 : 320, window.innerWidth - 16);
    const H = compact ? 240 : 350;
    let left = rect.left + rect.width / 2 - W / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
    let top = rect.top - H - 8;
    if (top < 8) top = rect.bottom + 8;
    setComposerPickerPos({ top, left });
    setShowComposerPicker(true);
  };
  
  /* actions */
  const send = async () => {
    if (!msg.trim() || !active || myId === null) return;
    try {
      if (editingId) {
        await hub?.invoke("EditMessage", editingId, msg.trim());
        setEditingId(null);
      } else {
        await hub?.invoke("SendMessage", active.id, msg.trim(), replyTo);
        scrollAfterSend.current = true;
      }
      setMsg('');
      setReplyTo(null);
    } catch {
      setError('Failed to send.');
    }
  };
  const react = (id: number, emoji: string) =>
    hub?.invoke("ReactToMessage", id, emoji)
  const unreact = (id: number) =>
    hub?.invoke("RemoveReaction", id)
  const rmMe = (id: number) =>
    hub?.invoke("DeleteForSender", id)
  const rmAll = (id: number) =>
    hub?.invoke("DeleteForEveryone", id)


  /* friend filter */
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
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
      <ul className="space-y-2 pr-2">
      {filtered.map((f) => {
        const isActive = active?.id === f.id;
        const isOnline = onlineUsers.has(f.id);
        return (
          <li
            key={f.id}
            onClick={() => setActive(f)}
            className={`flex items-center justify-between gap-3 p-2 rounded-lg min-w-0 ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800/60'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* wrap avatar in a relative container */}
              <div className="relative flex-shrink-0">
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
                {/* status dot */}
                <span
                  className={[
                    "absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-1 ring-black",
                    isOnline ? "bg-green-400" : "bg-gray-600",
                  ].join(" ")}
                  title={isOnline ? "Online" : "Offline"}
                />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <div className="flex items-center gap-1 text-white font-medium truncate">
                  {f.fullName}
                  {f.isOfficial ? (
                    <OfficialBadge date={f.verifiedDate} />
                  ) : f.isVerified ? (
                    <VerifiedBadge date={f.verifiedDate} />
                  ) : null}
                </div>
                <div className="text-xs text-gray-400 truncate">@{f.username}</div>
              </div>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 text-indigo-400 text-sm"
            >
              Chat
            </button>
          </li>
        );
      })}
    </ul>
      </div>
    </aside>
  );

  const ChatPanel = (
    <main className="flex-1 flex flex-col">
      {!active ? (
        <div className="m-auto text-gray-500">
          Select a friend to start chatting
        </div>
      ) : (
        <>
         
          {/* header */}
          <header
            className={`z-20 px-3  border-b border-gray-800
                        flex items-center justify-between bg-black-100/90 backdrop-blur
                        ${compact ? 'fixed inset-x-0 mt-1 py-0 top-0' : 'sticky py-2 top-3'}`}
            style={
              compact
                ? {
                    /* stay below the notch / status-bar */
                    top: `calc(var(--nav-h,56px) + env(safe-area-inset-top))` ,
                    height: `calc(56px + env(safe-area-inset-top))`, // h-14 (56 px) + safe area
                    paddingTop: 'env(safe-area-inset-top)',
                  }
                : {}
            }
          >
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
                        active.fullName,
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


          {/* messages */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`flex-1 overflow-y-auto p-4 space-y-2
              ${compact
                ? 'pt-[calc(var(--nav-h,56px)+env(safe-area-inset-top))] pb-[calc(3.5rem+env(safe-area-inset-bottom))]'
                : 'pt-[var(--nav-h,56px)] pb-16' }
            `}
          >

            {msgs.map((m, idx) => {
              if (myId === null || m.isDeletedForSender) return null;
              const isOutgoing = m.senderId === myId;
              const hovered = hoveredMsgId === m.id;
              const lastOfGroup =
                idx === msgs.length - 1 || msgs[idx + 1].senderId !== m.senderId;
              return (
                <div
                  key={m.id}
                  className={`relative w-full flex items-start ${menuMsgId === m.id ? 'z-50' : ''}`}
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
                    setSwipeState((s) => (s ? { ...s, offset: 0, releasing: true } : null));
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
                      transition: swipeState?.releasing ? 'transform 0.2s ease-out' : 'none',
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
                        className={`px-4 py-2 rounded-2xl text-sm break-words ${
                          isOutgoing ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {m.message}
                        {m.isEdited && <span className="italic text-[10px] ml-1">(edited)</span>}
                      </div>
                      {!compact && hovered && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${
                            isOutgoing
                              ? 'right-[calc(100%+0.4rem)]'
                              : 'left-[calc(100%+0.4rem)]'
                          }`}
                        >
                          <button onClick={() => setReplyTo(m.id)} className="p-1 rounded-full hover:bg-gray-800">
                            <HiOutlineReply className="w-4 h-4 text-white" />
                          </button>
                          <button onClick={(e) => openReactionPicker(e, m.id)} className="p-1 rounded-full hover:bg-gray-800">
                            <HiOutlineEmojiHappy className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openMenuMsg(m.id, (e.currentTarget as HTMLElement).getBoundingClientRect());
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
                        {new Date(m.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {typingUsers.has(active.id) && (
            <div className="flex items-start mr-auto max-w-[80%]">
              <div className="px-4 py-2 bg-gray-700 rounded-2xl flex items-center">
                {/* three-dot loader */}
                <span className={styles.typingDot} />
                <span className={styles.typingDotDelay200} />
                <span className={styles.typingDotDelay400} />
              </div>
            </div>
          )}
            <div ref={bottomRef} />
          </div>

          {menuMsgId && menuPos && createPortal(
            compact ? (
              // Mobile: full-width, auto height up to 50vh, scrollable
              <div
                ref={menuRef}
                className="fixed inset-x-0 z-50 bg-black-100 rounded-2xl border-t border-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.1)] overflow-y-auto p-2"
                style={{
                  // try positioning right under the bubble…
                  top: `calc(${menuPos.top}px - 16vh)`,
                  // …but if that would run off the bottom, flip above it:
                  ...(menuPos.top + menuHeight + 8 > window.innerHeight
                    ? { top: Math.max(8, menuPos.top - menuHeight - 8) }
                    : {}),
                  maxHeight: '50vh',
                  left:90,
                  right:90,
                }}
              >
                <button
                  onClick={() => { setReplyTo(menuMsgId!); setMenuMsgId(null); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded"
                >
                  <HiOutlineReply className="inline mr-2 align-middle" /> Reply
                </button>
                {msgs.find(m => m.id === menuMsgId)?.senderId === myId && (
                  <button
                    onClick={() => { setEditingId(menuMsgId!); setMenuMsgId(null); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded"
                  >
                    <HiOutlinePencilAlt className="inline mr-2 align-middle" /> Edit message
                  </button>
                )}
                <button
                  onClick={() => { setReactingToId(menuMsgId!); setShowReactionPicker(true); setMenuMsgId(null); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded"
                >
                  <HiOutlineEmojiHappy className="inline mr-2 align-middle" /> React
                </button>
                <button
                  onClick={() => { rmMe(menuMsgId!); setMenuMsgId(null); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded text-red-400"
                >
                  <HiOutlineTrash className="inline mr-2 align-middle" /> Delete for you
                </button>
                {msgs.find(m => m.id === menuMsgId)?.senderId === myId && (
                  <button
                    onClick={() => { rmAll(menuMsgId!); setMenuMsgId(null); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded text-red-400"
                  >
                    <HiOutlineTrash className="inline mr-2 align-middle" /> Delete for everyone
                  </button>
                )}
              </div>
            ) : (
              // Desktop: fixed size, original style
              <div
                ref={menuRef}
                className="fixed z-50 bg-black-100 rounded border-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.1)] p-2"
                style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
              >
                <button
                  onClick={() => { setReplyTo(menuMsgId!); setMenuMsgId(null); }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
                >
                  <HiOutlineReply className="w-5 h-5" /> Reply
                </button>
                {msgs.find((m) => m.id === menuMsgId)?.senderId === myId && (
                  <button
                    onClick={() => { setEditingId(menuMsgId!); setMenuMsgId(null); }}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
                  >
                    <HiOutlinePencilAlt className="w-5 h-5" /> Edit message
                  </button>
                )}
                <button
                  onClick={() => { setReactingToId(menuMsgId!); setShowReactionPicker(true); setMenuMsgId(null); }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded"
                >
                  <HiOutlineEmojiHappy className="w-5 h-5" /> React
                </button>
                <button
                  onClick={() => { rmMe(menuMsgId!); setMenuMsgId(null); }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded text-red-400"
                >
                  <HiOutlineTrash className="w-5 h-5" /> Delete for you
                </button>
                {msgs.find((m) => m.id === menuMsgId)?.senderId === myId && (
                  <button
                    onClick={() => { rmAll(menuMsgId!); setMenuMsgId(null); }}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded text-red-400"
                  >
                    <HiOutlineTrash className="w-5 h-5" /> Delete for all
                  </button>
                )}
              </div>
            ),
            document.body
          )}



    
          
          {showReactionPicker &&
          reactingToId != null &&
          createPortal(
            compact ? (
              // always show bottom‐sheet on mobile—no position check
              <div
                ref={reactionPickerRef}
                className="fixed inset-x-2 bottom-0 h-[35vh] bg-black-100/95 rounded-t-2xl border-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.1)] z-50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <button
                  onClick={() => {
                    setShowReactionPicker(false);
                    setReactingToId(null);
                  }}
                  className="absolute top-2 right-2 text-2xl text-white z-10"
                  aria-label="Close"
                >
                  ×
                </button>

                <EmojiGrid
                  width={window.innerWidth - 16}
                  height={window.innerHeight * 0.35}
                  mostUsedOverride={[]}
                  onSelect={(emoji) => {
                    react(reactingToId!, emoji);
                    setShowReactionPicker(false);
                  }}
                />
              </div>
            ) : (
              // desktop popup—*this* still needs reactionPickerPos
              reactionPickerPos && (
                <div
                  ref={reactionPickerRef}
                  className="fixed bg-black-100 rounded-2xl shadow-lg z-50"
                  style={{
                    top: reactionPickerPos.top,
                    left: reactionPickerPos.left,
                    width: Math.min(320, window.innerWidth - 16),
                    height: 360,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowReactionPicker(false);
                      setReactingToId(null);
                    }}
                    className="absolute top-2 right-1 p-1 text-white text-xl z-10"
                    aria-label="Close"
                  >
                    <HiOutlineX size={20} />
                  </button>

                  <EmojiGrid
                    width={Math.min(320, window.innerWidth - 16)}
                    height={360}
                    mostUsedOverride={[]}
                    onSelect={(emoji) => {
                      react(reactingToId!, emoji);
                      setShowReactionPicker(false);
                    }}
                  />
                </div>
              )
            ),
            document.body
          )}







          {/* composer */}
          <div className="fixed md:sticky bottom-0 left-0 right-0 z-20 flex flex-col gap-1 p-3 border-t border-gray-800 bg-black-100/90 backdrop-blur">
          {replyTo && (
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              {/* rotated reply arrow */}
              <HiOutlineReply className="w-4 h-4 text-gray-400 rotate-180" />
              <span className="font-semibold">Replying to:</span>
              <span className="truncate max-w-[60%]">
                {byId(replyTo)?.message.slice(0, 60) ?? '[Deleted]'}
              </span>
              {/* cancel button */}
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-red-300 p-1 rounded-full hover:bg-red-500/20"
                aria-label="Cancel reply"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
          )}
                  
          {editingId && (
            <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
              <span className="font-semibold">Editing message:</span>
              <span className="truncate max-w-[60%]">
                {byId(editingId)?.message ?? ''}
              </span>
              <button
                onClick={cancelEdit}
                className="ml-auto p-1 rounded-full text-red-300 hover:bg-red-500/20"
                aria-label="Cancel edit"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
          )}
            <div className="flex items-center gap-2">
              <button
                ref={emojiButtonRef}
                onClick={openComposerPicker}
                className="p-2 rounded-full hover:bg-gray-800/60"
              >
                <FiSmile className="w-5 h-5 text-gray-400" />
              </button>
              <input
                ref={inputRef}
                value={msg}
                onChange={(e) => {
                  const text = e.target.value;
                  setMsg(text);

                  // fire “Typing” once per keystroke
                  hub?.invoke("Typing", active!.id);

                  // reset a “stop typing” timer
                  if (typingTimeout.current) clearTimeout(typingTimeout.current);
                  typingTimeout.current = setTimeout(() => {
                    hub?.invoke("StopTyping", active!.id);
                  }, 1000);                   // send StopTyping 1s after last keystroke
                }}
                onBlur={() => {
                  // also send StopTyping when they leave the input
                  hub?.invoke("StopTyping", active!.id);
                }}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message…"
                className="…"
              />
              <button
                onClick={send}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
          {showComposerPicker && composerPickerPos && createPortal(
            <div
              ref={composerPickerRef}
              style={{
                position: 'fixed',
                zIndex: 9999,
                ...(compact
                  ? {
                      bottom: 60,
                      left: 8,
                      width: window.innerWidth - 16,
                      height: '35vh',
                    }
                  : {
                      top: composerPickerPos.top,
                      left: composerPickerPos.left,
                      width: Math.min(320, window.innerWidth - 16),
                      height: 350,
                    }),
              }}
              className={
                compact
                  ? 'bg-black-100/95 rounded-t-2xl border-t border-gray-700'
                  : 'bg-black-100 rounded-xl shadow-lg'
              }
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowComposerPicker(false)}
                className="absolute top-2 right-1 p-1 text-white hover:text-gray-300 z-10"
                title="Close"
              >
                <HiOutlineX size={20} />
              </button>
              
                {/* THE EMOJI PICKER */}
                <EmojiGrid
                  width={compact ? window.innerWidth - 16 : Math.min(320, window.innerWidth - 16)}
                  height={compact ? window.innerHeight * 0.35 : 350}
                  onSelect={(emoji) => {
                    // for your composer:
                    setMsg((m) => m + emoji)
                    setShowComposerPicker(false)

                    // for reactions, it’d be similar:
                    // react(reactingToId!, emoji)
                    // setShowReactionPicker(false)
                  }}
                />
            
            </div>,
            document.body
          )}

          



          {hasNewMessages && (
            <div className="absolute bottom-[4.5rem] w-full flex justify-center z-10">
              <button
                onClick={() => {
                  scrollToBottom(true);
                  setHasNewMessages(false);
                }}
                className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm text-white shadow"
              >
                New messages ↓
              </button>
            </div>
          )}

          {error && (
            <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-xs">{error}</div>
          )}
        </>
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

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineReply,
  HiCheck,
  HiOutlineEmojiHappy
} from 'react-icons/hi';
import Picker from 'emoji-picker-react';
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
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ----------------------------- helpers ----------------------------- */

  const getRepliedMessage = (id: number | null) =>
    id ? msgs.find(x => x.id === id) ?? null : null;

  /** Builds a reply-chain of max depth 2 (parent + grand-parent) */
  const buildReplyChain = (m: ChatMessage) => {
    const chain: ChatMessage[] = [];
    let cur = getRepliedMessage(m.replyToId ?? null);
    while (cur && chain.length < 2) {
      chain.push(cur);
      cur = getRepliedMessage(cur.replyToId ?? null);
    }
    return chain.reverse(); // oldest first
  };

  /* --------------------------- initial data -------------------------- */

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ userID: number }>('/users/me');
        const raw = await api.get<RawFriendDto[]>(
          `/UserFriends/mutual/${me.data.userID}`
        );
        const list = raw.data
          .map(f => {
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
        setFriends(list);
        setError('');
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  /* ----------------------------- polling ----------------------------- */

  useEffect(() => {
    if (!active) return;
    const pull = async () => {
      try {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        setMsgs(r.data);
        // scroll after DOM paints
        setTimeout(() => bottomRef.current?.scrollIntoView(), 0);
      } catch (e: any) {
        if (e.response?.status === 403) setError('You are not friends.');
        else if (e.response?.status === 401) setError('Please log in.');
        else setError('Error loading messages.');
      }
    };
    pull();
    const id = setInterval(pull, 2000);
    return () => clearInterval(id);
  }, [active]);

  /* ------------------------------ actions ---------------------------- */

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
          emoji: selectedEmoji
        });
      }
      setMsg('');
      setReplyTo(null);
      setSelectedEmoji(null);
      setShowEmoji(false);
    } catch {
      setError('Failed to send message.');
    }
  };

  const handleEmojiClick = (o: any) => {
    setSelectedEmoji(o.emoji);
    setShowEmoji(false);
  };

  const deleteForMe = (id: number) => api.post(`/chat/delete/${id}/sender`);
  const deleteForEveryone = (id: number) =>
    api.post(`/chat/delete-for-everyone/${id}`);

  /* ------------------------------- render ---------------------------- */

  const filteredFriends = friends.filter(
    f =>
      f.username.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toString().includes(search)
  );

  return (
    <div
      className={`flex ${
        compact ? 'flex-col' : 'md:flex-row'
      } h-full bg-black-100 text-white`}
    >
      {/* -------------------- friend list -------------------- */}
      <aside
        className={`${
          compact ? 'w-full border-b' : 'md:w-72 md:border-r'
        } border-gray-800 p-4 flex flex-col gap-4`}
      >
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
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-black-100 border border-gray-700 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />

        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {filteredFriends.map(f => (
            <button
              key={f.id}
              onClick={() => setActive(f)}
              className={`flex items-center gap-3 p-2 rounded-md transition ${
                active?.id === f.id
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-800/60'
              }`}
            >
              <img
                src={
                  f.profilePictureUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    f.fullName
                  )}&background=5e17eb&color=fff`
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

      {/* --------------------- chat panel -------------------- */}
      <main className="flex-1 flex flex-col relative">
        {!active ? (
          <div className="m-auto text-gray-500">
            Select a friend to start chatting
          </div>
        ) : (
          <>
            <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-black-100/80 backdrop-blur">
              <span className="font-semibold">{active.username}</span>
              <span className="text-xs text-gray-400">ID {active.id}</span>
            </header>

            {/* -------- message list -------- */}
            <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {msgs.map((m, idx) => {
                if (m.isDeletedForSender) return null;

                const isSelf = m.senderId !== active.id;
                const isHovered = hoveredMsgId === m.id;
                const chain = buildReplyChain(m);
                const isLast =
                  idx === msgs.length - 1 ||
                  msgs[idx + 1].senderId !== m.senderId;

                const optionPos = isSelf
                  ? 'left-full ml-2'
                  : 'right-full mr-2';

                return (
                  <div
                    key={m.id}
                    className="relative group flex flex-col gap-1"
                    onMouseEnter={() => setHoveredMsgId(m.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* ---------- hover options ---------- */}
                    {isHovered && (
                      <div
                        className={`absolute ${optionPos} top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10 bg-gray-800 rounded-md p-1 shadow-md`}
                      >
                        <button
                          onClick={() => setReplyTo(m.id)}
                          title="Reply"
                        >
                          <HiOutlineReply className="w-4 h-4 text-gray-300 hover:text-white" />
                        </button>
                        <button
                          onClick={() => setShowEmoji(true)}
                          title="React"
                        >
                          <HiOutlineEmojiHappy className="w-4 h-4 text-gray-300 hover:text-white" />
                        </button>
                        <button
                          onClick={() => deleteForMe(m.id)}
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4 text-gray-300 hover:text-white" />
                        </button>
                        {isSelf && (
                          <button
                            onClick={() => {
                              setMsg(m.message);
                              setEditingId(m.id);
                            }}
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-gray-300 hover:text-white" />
                          </button>
                        )}
                        {isSelf && (
                          <button
                            onClick={() => deleteForEveryone(m.id)}
                            title="Delete for Everyone"
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            All
                          </button>
                        )}
                      </div>
                    )}

                    {/* ---------- reply-chain (max 2) ---------- */}
                    {chain.map(c => (
                      <div
                        key={`chain-${c.id}`}
                        className={`max-w-[80%] md:max-w-[60%] px-3 py-1 rounded text-xs bg-black-200 text-gray-400 italic border-l-2 ${
                          isSelf
                            ? 'self-end border-indigo-400'
                            : 'self-start border-indigo-600'
                        }`}
                      >
                        {c.message}
                      </div>
                    ))}

                    {/* ------------- message bubble ------------- */}
                    <div
                      className={`relative max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                        isSelf
                          ? 'self-end bg-indigo-600 text-white ml-auto'
                          : 'self-start bg-gray-700 text-gray-100'
                      }`}
                    >
                      {editingId === m.id ? (
                        <div className="flex gap-2">
                          <input
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            className="flex-1 px-2 py-1 rounded text-black"
                          />
                          <button onClick={send}>
                            <HiCheck className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {m.message}{' '}
                          {m.isEdited && (
                            <span className="text-[10px] italic">(edited)</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* ------------ emoji reaction bar ------------ */}
                    {m.emoji && (
                      <div
                        className={`text-xl mt-1 ${
                          isSelf ? 'self-end mr-12' : 'self-start ml-12'
                        }`}
                      >
                        {m.emoji}
                      </div>
                    )}

                    {/* -------- timestamp (only last) -------- */}
                    {isLast && (
                      <div
                        className={`text-[10px] opacity-70 mt-1 ${
                          isSelf ? 'self-end' : 'self-start'
                        }`}
                      >
                        {new Date(m.sentAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* -------------- composer / input -------------- */}
            <div className="flex flex-col gap-1 p-3 border-t border-gray-800 bg-black-100/80 backdrop-blur">
              {replyTo && (
                <div className="text-xs text-gray-400 mb-1">
                  Replying to message #{replyTo}
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-2 text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {showEmoji && (
                <Picker
                  onEmojiClick={handleEmojiClick}
                  height={350}
                  width={300}
                />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="text-white px-2"
                >
                  😀
                </button>
                <input
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 bg-black-100 border border-gray-700 rounded-full text-sm placeholder-gray-500"
                />
                <button
                  onClick={send}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="absolute bottom-24 left-0 right-0 text-center text-red-500 text-sm">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

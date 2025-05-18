'use client';

import { useEffect, useRef, useState } from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import api from '@/lib/api';

/* ═════════ Data contracts ═════════ */
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

/* ═════════ Component ═════════ */
export default function ChatPage() {
  const [friends, setFriends]         = useState<Friend[]>([]);
  const [search,  setSearch]          = useState('');
  const [active,  setActive]          = useState<Friend | null>(null);
  const [msgs,    setMsgs]            = useState<ChatMessage[]>([]);
  const [msg,     setMsg]             = useState('');
  const [error,   setError]           = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── load friend list ── */
  useEffect(() => {
    (async () => {
      try {
        const me    = await api.get<{ userID: number }>('/users/me');
        const raw   = await api.get<RawFriendDto[]>(`/UserFriends/mutual/${me.data.userID}`);
        const list  = raw.data
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
      } catch { setError('Failed to load friends.'); }
    })();
  }, []);

  /* ── polling chat ── */
  useEffect(() => {
    if (!active) return;
    const pull = async () => {
      try {
        const r = await api.get<ChatMessage[]>(`/chat/messages/${active.id}`);
        setMsgs(r.data);
        setError('');
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch (e: any) {
        if (e.response?.status === 403)       setError('You are not friends.');
        else if (e.response?.status === 401)  setError('Please log in.');
        else                                  setError('Error loading messages.');
      }
    };
    pull();
    const id = setInterval(pull, 2_000);
    return () => clearInterval(id);
  }, [active]);

  /* ── send ── */
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

  /* ── filter list ── */
  const list = friends.filter(f => f.username.toLowerCase().includes(search.toLowerCase()) || f.id.toString().includes(search));

  /* ═════════ JSX ═════════ */
  return (
    <div className="flex md:flex-row flex-col h-full bg-black-100 text-white">
      {/* ░░░ Sidebar ░░░ */}
      <aside className="md:w-72 w-full md:border-r border-gray-800 p-4 flex flex-col gap-4">
        {/* mobile back btn */}
        {active && (
          <button
            onClick={() => setActive(null)}
            className="md:hidden flex items-center gap-1 text-sm mb-2 text-gray-400 hover:text-white"
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
          {list.map(f => (
            <button
              key={f.id}
              onClick={() => setActive(f)}
              className={`flex items-center gap-3 p-2 rounded-md transition ${
                active?.id === f.id ? 'bg-gray-800' : 'hover:bg-gray-800/60'
              }`}
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

      {/* ░░░ Chat pane ░░░ */}
      <main className="flex-1 flex flex-col relative">
        {active ? (
          <>
            {/* header */}
            <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-black-100/80 backdrop-blur">
              <span className="font-semibold">{active.username}</span>
              <span className="text-xs text-gray-400">ID {active.id}</span>
            </header>

            {/* messages */}
            <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {msgs.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm break-words ${
                    m.senderId === active.id
                      ? 'self-start bg-gray-700 text-gray-100'
                      : 'self-end bg-indigo-600 text-white'
                  }`}
                >
                  {m.message}
                  <div className="text-[10px] opacity-70 mt-1">
                    {new Date(m.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="flex gap-3 p-4 border-t border-gray-800 bg-black-100/80 backdrop-blur">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-black-100 border border-gray-700 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <button
                onClick={send}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-gray-500">Select a friend to start chatting</div>
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

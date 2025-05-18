'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

/* ───── Data shapes ───── */
interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentAt: string; // ISO string from API
}

/** Raw DTO coming from `/UserFriends/mutual/{meId}` */
interface RawFriendDto {
  id?: number;
  userID?: number;
  friendId?: number;
  username: string;
  fullName?: string;
  profilePictureUrl?: string | null;
}

/** Normalised shape we use in state/UI */
interface Friend {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string | null;
}

/* ───── Component ───── */
export default function ChatPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearch, setFriendSearch] = useState('');

  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');

  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Fetch mutual friends once */
  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get<{ userID: number }>('/users/me');

        const raw = await api.get<RawFriendDto[]>(
          `/UserFriends/mutual/${meRes.data.userID}`
        );

        const mapped: Friend[] = raw.data
          .map(f => {
            const id = f.id ?? f.userID ?? f.friendId;
            if (!id) return null; // skip malformed entry
            return {
              id,
              username: f.username,
              fullName: f.fullName ?? f.username,
              profilePictureUrl: f.profilePictureUrl ?? null,
            };
          })
          .filter(Boolean) as Friend[];

        setFriends(mapped);
        setError('');
      } catch {
        setError('Failed to load friends.');
      }
    })();
  }, []);

  /* Poll active chat every 2 s */
  useEffect(() => {
    if (!activeFriend) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get<ChatMessage[]>(
          `/chat/messages/${activeFriend.id}`
        );
        setMessages(res.data);
        setError('');
        // scroll to bottom smoothly
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch (err: any) {
        if (err.response?.status === 403)       setError('You are not friends.');
        else if (err.response?.status === 401)  setError('Please log in.');
        else                                    setError('Error loading messages.');
        setMessages([]);
      }
    };

    fetchMessages();
    const id = setInterval(fetchMessages, 2_000);
    return () => clearInterval(id);
  }, [activeFriend]);

  /* Send */
  const sendMessage = async () => {
    if (!message.trim() || !activeFriend) return;
    try {
      await api.post('/chat/send', {
        receiverId: activeFriend.id,
        message: message.trim(),
      });
      setMessage('');
    } catch (err: any) {
      if (err.response?.status === 403) setError("You can't message this user.");
      else setError('Failed to send.');
    }
  };

  /* Filter list */
  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.id.toString().includes(friendSearch)
  );

  /* ───── JSX ───── */
  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 p-4 flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Friends</h3>

        <input
          type="text"
          placeholder="Search by username or ID"
          value={friendSearch}
          onChange={e => setFriendSearch(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        />

        <div className="flex flex-col gap-2 overflow-y-auto">
          {filteredFriends.map(friend => (
            <button
              key={friend.id}
              onClick={() => setActiveFriend(friend)}
              className={`flex items-center gap-3 p-2 rounded-md text-left transition hover:bg-gray-100 ${
                activeFriend?.id === friend.id ? 'bg-gray-100' : ''
              }`}
            >
              <img
                src={
                  friend.profilePictureUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    friend.fullName
                  )}&background=5e17eb&color=fff`
                }
                alt={friend.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{friend.username}</div>
                <div className="text-xs text-gray-500">#{friend.id}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat pane */}
      <main className="flex-1 flex flex-col relative">
        {activeFriend ? (
          <>
            {/* header */}
            <header className="px-4 py-3 border-b flex justify-between items-center">
              <span className="font-semibold">{activeFriend.username}</span>
              <span className="text-xs text-gray-500">ID {activeFriend.id}</span>
            </header>

            {/* messages */}
            <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto bg-gray-50">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    m.senderId === activeFriend.id
                      ? 'self-start bg-gray-200 text-gray-900'
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
            <div className="flex gap-3 p-4 border-t">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-full text-sm"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-gray-500">
            Select a friend to start chatting
          </div>
        )}

        {error && (
          <div className="absolute bottom-20 left-0 right-0 text-center text-red-500 text-sm">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

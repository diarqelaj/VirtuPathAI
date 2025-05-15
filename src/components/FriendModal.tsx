'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';

interface User {
  userID: number;
  fullName: string;
  profilePictureUrl?: string;
}

interface FriendModalProps {
  title: string;
  type: 'followers' | 'following' | 'mutual';
  userIds: User[]; // now it's full objects, not just numbers
  currentUserId: number;
  onClose: () => void;
}

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

const resolveImageUrl = (url?: string | null): string =>
  url ? (url.startsWith('http') ? url : `${API_HOST}${url}`) : defaultAvatar;

export default function FriendModal({
  title,
  type,
  userIds,
  currentUserId,
  onClose,
}: FriendModalProps) {
  const [users, setUsers] = useState<User[]>(userIds);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleRemove = async (targetId: number) => {
    try {
      const isFollower = type === 'followers';
      await api.delete(
        `/userfriends/remove?followerId=${isFollower ? targetId : currentUserId}&followedId=${isFollower ? currentUserId : targetId}`
      );
      setUsers((prev) => prev.filter((u) => u.userID !== targetId));
      setConfirmId(null);
    } catch (err) {
      console.error('Failed to remove relationship:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-white hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>

        {users.length === 0 ? (
          <p className="text-neutral-400 text-sm">No users to display.</p>
        ) : (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {users.map((u) => (
              <li key={u.userID} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveImageUrl(u.profilePictureUrl)}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                    alt="avatar"
                  />
                  <span className="text-white text-sm font-medium">{u.fullName}</span>
                </div>
                <div>
                  {confirmId === u.userID ? (
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        onClick={() => handleRemove(u.userID)}
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-2 py-1 rounded border border-white/10 text-white hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(u.userID)}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
                    >
                      {type === 'followers' ? 'Remove' : 'Unfollow'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

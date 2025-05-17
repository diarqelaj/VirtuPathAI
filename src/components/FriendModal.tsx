'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import api from '@/lib/api';

interface User {
  userID: number;
  fullName: string;
  username: string; 
  profilePictureUrl?: string;
}


interface FriendModalProps {
  title: string;
  type: 'followers' | 'following' | 'mutual';
  userIds: User[];
  currentUserId: number;
  onClose: () => void;
}

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function FriendModal({
  title,
  type,
  userIds,
  currentUserId,
  onClose,
}: FriendModalProps) {
  const [users, setUsers] = useState<User[]>(userIds);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/userfriends/following/${currentUserId}`);
        const followingList: User[] = res.data || [];
        const map: Record<number, boolean> = {};
        followingList.forEach(u => {
          map[u.userID] = true;
        });
        setFollowingMap(map);
      } catch (err) {
        console.error("Failed to fetch following:", err);
      }
    };

    fetchFollowing();
  }, [currentUserId]);

  const handleRemove = async (targetId: number) => {
    try {
      let followerId = currentUserId;
      let followedId = targetId;

      if (type === 'followers') {
        followerId = targetId;
        followedId = currentUserId;
      }

      await api.delete(`/userfriends/remove?followerId=${followerId}&followedId=${followedId}`);
      setUsers((prev) => prev.filter((u) => u.userID !== targetId));
      setConfirmId(null);
    } catch (err) {
      console.error('Failed to remove relationship:', err);
    }
  };

  const handleFollow = async (targetId: number) => {
    try {
      await api.post(`/userfriends/follow?followerId=${currentUserId}&followedId=${targetId}`);
      setFollowingMap(prev => ({ ...prev, [targetId]: true }));
    } catch {
      alert('Failed to follow user.');
    }
  };

  const navigateToProfile = (user: User) => {
    if (user.userID !== currentUserId) {
      router.push(`/${user.username}`);
      onClose();
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
            {users.map((u) => {
              const isSelf = u.userID === currentUserId;
              const isFollowing = followingMap[u.userID];

              return (
                <li key={u.userID} className="flex items-center justify-between gap-4">
                  <div
                    className={`flex items-center gap-3 cursor-pointer ${
                      !isSelf ? 'hover:opacity-80' : ''
                    }`}
                    onClick={() => navigateToProfile(u)}

                  >
                    <img
                      src={u.profilePictureUrl ? `${API_HOST}${u.profilePictureUrl}` : defaultAvatar}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      alt="avatar"
                    />
                    <span className="text-white text-sm font-medium">
                      {u.fullName} {isSelf && <span className="text-xs text-white/50">(You)</span>}
                    </span>
                  </div>
                  <div>
                    {isSelf ? null : confirmId === u.userID ? (
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
                    ) : isFollowing ? (
                      <button
                        onClick={() => setConfirmId(u.userID)}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
                      >
                        {type === 'followers' ? 'Remove' : type === 'mutual' ? 'Unfriend' : 'Unfollow'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(u.userID)}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function FriendList() {
  const [userId, setUserId] = useState<number | null>(null);
  const [friends, setFriends] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMutualFriends = async () => {
      try {
        const meRes = await api.get('/users/me');
        const uid = meRes.data.userID;
        setUserId(uid);

        const res = await api.get(`/userfriends/mutual/${uid}`);
        setFriends(res.data);
      } catch (err) {
        console.error('Failed to fetch mutual friends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMutualFriends();
  }, []);

  return (
    <div className="p-4 rounded bg-zinc-900 text-white shadow">
      <h2 className="text-lg font-bold mb-2">Your Mutual Friends</h2>
      {loading ? (
        <p>Loading...</p>
      ) : friends.length === 0 ? (
        <p>You have no mutual friends yet.</p>
      ) : (
        <ul className="space-y-1">
          {friends.map((friendId, idx) => (
            <li key={idx} className="border-b border-zinc-700 py-1">
              Friend ID: {friendId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

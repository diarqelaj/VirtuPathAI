'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function UserSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSearchAndSendRequest = async () => {
    setStatus(null);

    try {
      const meRes = await api.get('/users/me');
      const senderId = meRes.data.userID;

      // You can replace this with a proper user search endpoint
      const searchRes = await api.get(`/users/search?email=${searchInput}`); // requires backend support
      const receiverId = searchRes.data.userID;

      setUserId(receiverId);

      await api.post(`/friendrequest/send`, {
        senderId,
        receiverId
      });

      setStatus('Friend request sent ✅');
    } catch (error) {
      console.error(error);
      setStatus('Failed to send request ❌');
    }
  };

  return (
    <div className="p-4 bg-zinc-900 rounded mt-4 text-white shadow">
      <h2 className="text-lg font-bold mb-2">Add a Friend</h2>
      <input
        type="text"
        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 mb-2"
        placeholder="Enter email or user ID"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={handleSearchAndSendRequest}
      >
        Send Friend Request
      </button>

      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}

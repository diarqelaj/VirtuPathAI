'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  isAccepted: boolean;
  sentAt: string;
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const me = await api.get('/users/me');
      const userId = me.data.userID;

      const res = await api.get(`/friendrequest/requests/incoming/${userId}`);
      setRequests(res.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number, senderId: number) => {
    await api.post(`/friendrequest/accept?requestId=${id}`);
    await api.post(`/userfriends/add?userId=${senderId}&friendId=${requests.find(r => r.id === id)?.receiverId}`);
    await fetchRequests();
  };

  const handleDecline = async (id: number) => {
    await api.delete(`/friendrequest/remove/${id}`);
    await fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 mt-4 rounded bg-zinc-900 text-white shadow">
      <h2 className="text-lg font-bold mb-2">Incoming Friend Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No incoming requests.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.id} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
              <div>From User ID: {req.senderId}</div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAccept(req.id, req.senderId)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

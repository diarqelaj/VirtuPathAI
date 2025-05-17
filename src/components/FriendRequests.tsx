'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OfficialBadge } from "@/components/OfficialBadge";

interface FollowRequest {
  id: number;
  followerId: number;
  followedId: number;
  isAccepted: boolean;
  follower: {
    userID: number;
    fullName: string;
    username: string;
    profilePictureUrl?: string;
    isVerified?: boolean;
    isOfficial?: boolean;
    
  };
}


export default function FriendRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const me = await api.get('/users/me');
      const currentUserId = me.data.userID;
      setUserId(currentUserId);

      const res = await api.get(`/userfriends/requests/incoming/${currentUserId}`);
      setRequests(res.data);
    } catch (error) {
      console.error('Error loading follow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (followerId: number) => {
    if (!userId) return;
    try {
      await api.post(`/userfriends/accept?followerId=${followerId}&followedId=${userId}`);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleDecline = async (followerId: number) => {
    if (!userId) return;
    try {
      await api.delete(`/userfriends/remove?followerId=${followerId}&followedId=${userId}`);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 mt-4 rounded bg-zinc-900 text-white shadow">
      <h2 className="text-lg font-bold mb-2">Incoming Follow Requests</h2>
      {loading ? (
        <p className="text-sm text-neutral-400">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-neutral-400">No incoming requests.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded">
             <div className="flex items-center gap-2">
                <img
                  src={
                    req.follower.profilePictureUrl
                      ? `${api.defaults.baseURL?.replace(/\/api\/?$/, '')}${req.follower.profilePictureUrl}`
                      : 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff'
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-medium">{req.follower.fullName}</span>
                    {req.follower.isVerified && <VerifiedBadge />}
                    {req.follower.isOfficial && <OfficialBadge />}
                  </div>
                  <span className="text-xs text-white/50">@{req.follower.username}</span>
                </div>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => handleAccept(req.followerId)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(req.followerId)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
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

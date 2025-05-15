'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SearchResult {
  userID: number;
  fullName: string;
}

export default function UserSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setCurrentUserID(res.data.userID);
      } catch (err) {
        console.error('Failed to fetch user.', err);
      }
    };
    fetchMe();
  }, []);

  const handleSearch = async () => {
    setStatus(null);
    try {
      const res = await api.get(`/users/search?name=${searchInput}`);
      const filtered = res.data.filter((u: SearchResult) => u.userID !== currentUserID);
      setResults(filtered);
    } catch (err) {
      console.error(err);
      setStatus('Search failed');
    }
  };

  const handleFollow = async (targetId: number) => {
    if (!currentUserID) return;
    try {
      await api.post(`/userfriends/follow?followerId=${currentUserID}&followedId=${targetId}`);
      setStatus(`Follow request sent to user ${targetId}`);
    } catch (err) {
      console.error(err);
      setStatus('Follow already sent or failed');
    }
  };

  return (
    <div className="p-4 bg-zinc-900 rounded mt-4 text-white shadow">
      <h2 className="text-lg font-bold mb-2">Find and Follow People</h2>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          placeholder="Search by full name (e.g., Leoni)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((user) => (
            <li
              key={user.userID}
              className="flex justify-between items-center bg-zinc-800 p-2 rounded"
            >
              <span>{user.fullName}</span>
              <button
                onClick={() => handleFollow(user.userID)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
              >
                Follow
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p className="mt-3 text-sm text-neutral-300">{status}</p>}
    </div>
  );
}

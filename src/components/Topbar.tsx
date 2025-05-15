'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { FaBell } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function Topbar() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>({ users: [], careers: [] });
  const [requests, setRequests] = useState<any[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await api.get('/userfriends/requests/incoming/' + user?.userID);
        setRequests(res.data || []);
      } catch {}
    };

    fetchUser();
    if (user?.userID) fetchRequests();
  }, [user?.userID]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search) {
        setResults({ users: [], careers: [{ title: 'MMA Fighter' }, { title: 'Fashion Designer' }] });
        return;
      }
      try {
        const res = await api.get(`/search?q=${search}`); // hypothetical endpoint
        setResults(res.data);
      } catch {}
    };
    fetchSearchResults();
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') setHighlightIndex((prev) => prev + 1);
    else if (e.key === 'ArrowUp') setHighlightIndex((prev) => Math.max(prev - 1, 0));
    else if (e.key === 'Enter') {
      const allItems = [...results.users, ...results.careers];
      const selected = allItems[highlightIndex];
      if (selected) {
        if ('userID' in selected) {
          window.location.href = `/profile/${selected.userID}`;
        } else {
          window.location.href = `/career/${selected.title.replace(/\s+/g, '-').toLowerCase()}`;
        }
      }
    }
  };

  return (
    <header className="w-full h-16 bg-[#0b0b22] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Image src="/virtupathai.png" alt="Logo" width={32} height={32} />
        <span className="text-white font-semibold text-lg hidden sm:inline">VirtuPath</span>
      </div>

      {/* Search */}
      <div className="flex-1 px-6 max-w-xl w-full relative hidden md:block">
        <input
          type="text"
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search careers, friends..."
          className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/10 focus:outline-none"
        />
        {search.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-zinc-900 text-white rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
            <li className="px-4 py-1 text-xs text-neutral-400">Users</li>
            {results.users.map((u: any, idx: number) => (
              <li
                key={u.userID}
                className={`px-4 py-2 cursor-pointer hover:bg-zinc-700 ${highlightIndex === idx ? 'bg-zinc-700' : ''}`}
              >
                👤 {u.fullName}
              </li>
            ))}
            <li className="px-4 py-1 text-xs text-neutral-400">Trending Careers</li>
            {results.careers.map((c: any, idx: number) => (
              <li
                key={c.title}
                className={`px-4 py-2 cursor-pointer hover:bg-zinc-700 ${highlightIndex === idx + results.users.length ? 'bg-zinc-700' : ''}`}
              >
                🔥 {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <FaBell className="text-white text-xl" />
          {requests.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
              {requests.length}
            </span>
          )}
        </div>
        {user ? (
          <Image
            src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
            alt="User"
            width={35}
            height={35}
            className="rounded-full object-cover"
          />
        ) : (
          <Link href="/login" className="text-sm text-white/80 hover:underline">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

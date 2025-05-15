'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { FaBell } from 'react-icons/fa';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function Topbar() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>({ users: [], careers: [] });
  const [requests, setRequests] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [seenRequests, setSeenRequests] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const loadRequests = async (userId: number) => {
    try {
      const res = await api.get(`/userfriends/requests/incoming/${userId}`);
      setRequests(res.data || []);
    } catch {}
  };

  useEffect(() => {
    if (user?.userID) {
      loadRequests(user.userID);
    }
  }, [user?.userID]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!search.trim()) {
        setResults({
          users: recent,
          careers: [
            { title: 'MMA Fighter' },
            { title: 'Fashion Designer' },
            { title: 'Software Developer' },
            { title: 'Data Scientist' }
          ]
        });
        setHighlightIndex(0);
        return;
      }

      try {
        const res = await api.get(`/users/search?name=${search}`);
        const sorted = res.data.sort((a: any, b: any) =>
          b.fullName.toLowerCase().startsWith(search.toLowerCase()) ? -1 : 1
        );
        console.log("Search API results:", sorted);
        setResults({ users: sorted, careers: [] });
        setHighlightIndex(0);
      } catch {
        setResults({ users: [], careers: [] });
      }
    }, 200);
  }, [search]);

  useEffect(() => {
    const activeItem = resultsRef.current?.querySelector('li.bg-zinc-700');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (entry: any) => {
    if ('userID' in entry) {
      updateRecent(entry);
      window.location.href = `/profile/${entry.userID}`;
    } else {
      window.location.href = `/career/${entry.title.replace(/\s+/g, '-').toLowerCase()}`;
    }
  };

  const updateRecent = (userEntry: any) => {
    setRecent((prev: any[]) => {
      const filtered = prev.filter((u) => u.userID !== userEntry.userID);
      return [userEntry, ...filtered].slice(0, 5);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = results.users.length + results.careers.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === 'Enter') {
      const allItems = [...results.users, ...results.careers];
      const selected = allItems[highlightIndex];
      if (selected) handleSelect(selected);
    }
  };

  const handleAccept = async (followerId: number) => {
    if (!user) return;
    await api.post(`/userfriends/accept?followerId=${followerId}&followedId=${user.userID}`);
    await loadRequests(user.userID);
  };

  const handleDecline = async (followerId: number) => {
    if (!user) return;
    await api.delete(`/userfriends/remove?followerId=${followerId}&followedId=${user.userID}`);
    await loadRequests(user.userID);
  };

  return (
    <header className="w-full h-16 bg-[#0b0b22] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
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
          <ul
            ref={resultsRef}
            className="absolute top-full left-0 w-full bg-zinc-900 text-white rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto"
          >
            <li className="px-4 py-1 text-xs text-neutral-400">
              {search.trim() ? 'Matching Users' : 'Recent & Suggested Users'}
            </li>
            {results.users.map((u: any, idx: number) => (
              <li
                key={u.userID}
                onClick={() => handleSelect(u)}
                className={`px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-zinc-700 ${
                  highlightIndex === idx ? 'bg-zinc-700' : ''
                }`}
              >
                <img
                  src={u.profilePictureUrl ? `${API_HOST}${u.profilePictureUrl}` : defaultAvatar}
                  alt={u.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>{u.fullName}</span>
              </li>
            ))}
            <li className="px-4 py-1 text-xs text-neutral-400">Trending Careers</li>
            {results.careers.map((c: any, idx: number) => (
              <li
                key={c.title}
                onClick={() => handleSelect(c)}
                className={`px-4 py-2 cursor-pointer hover:bg-zinc-700 ${
                  highlightIndex === idx + results.users.length ? 'bg-zinc-700' : ''
                }`}
              >
                🔥 {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <div
          className="relative cursor-pointer"
          onClick={() => {
            setSeenRequests(true);
            setShowDropdown((prev) => !prev);
          }}
        >
          <FaBell className="text-white text-xl" />
          {!seenRequests && requests.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
              {requests.length}
            </span>
          )}
        </div>

        {showDropdown && (
          <div className="absolute right-0 mt-12 bg-zinc-800 border border-white/10 rounded-lg shadow-xl w-72 z-50 p-2 space-y-2 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center text-sm text-neutral-400 py-4">No friend requests</div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.followerId}
                  className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg"
                >
                  <img
                    src={req.profilePictureUrl ? `${API_HOST}${req.profilePictureUrl}` : defaultAvatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{req.fullName || `User #${req.followerId}`}</div>
                  </div>
                  <button
                    onClick={() => handleAccept(req.followerId)}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req.followerId)}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
        )}

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

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaBars, FaHome, FaUser, FaTasks, FaChartBar, FaBook, FaUsers,
  FaBug, FaCog, FaBell
} from 'react-icons/fa';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { signOut } from 'next-auth/react';
import api from '@/lib/api';
import { FiX } from 'react-icons/fi';


const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

  useEffect(() => {
    if (user?.userID) {
      api.get(`/userfriends/requests/incoming/${user.userID}`)
        .then((res) => setRequests(res.data || []))
        .catch(() => {});
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
            { title: 'Data Scientist' },
          ],
        });
        setHighlightIndex(0);
        return;
      }

      try {
        const res = await api.get(`/users/search?name=${search}`);
        const sorted = res.data.sort((a: any, b: any) =>
          b.fullName.toLowerCase().startsWith(search.toLowerCase()) ? -1 : 1
        );
        setResults({ users: sorted, careers: [] });
        setHighlightIndex(0);
      } catch {
        setResults({ users: [], careers: [] });
      }
    }, 200);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        !inputRef.current?.contains(e.target) &&
        !resultsRef.current?.contains(e.target)
      ) {
        setSearch('');
        setResults({ users: [], careers: [] });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  

  const handleSelect = (entry: any) => {
    if ('userID' in entry) {
      updateRecent(entry);
      router.push(`/profile/${entry.userID}`);
    } else {
      router.push(`/career/${entry.title.replace(/\s+/g, '-').toLowerCase()}`);
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

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch {}
    await signOut({ redirect: false });
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', link: '/', icon: <FaHome size={20} /> },
    { name: 'Pathway', link: '/pathhub', icon: <FaUser size={20} /> },
    { name: 'Daily Missions', link: '/tasks', icon: <FaTasks size={20} /> },
    { name: 'Progress', link: '/progress', icon: <FaChartBar size={20} /> },
    { name: 'Opportunities', link: '/virtupathcareers', icon: <FaBook size={20} /> },
    { name: 'VirtuCrew', link: '/community', icon: <FaUsers size={20} /> },
    { name: 'Feedback', link: '/bug', icon: <FaBug size={20} /> },
  ];

  const renderNavItems = () =>
    navItems.map((item) => {
      const isActive = pathname === item.link;
      return (
        <Link
          key={item.name}
          href={item.link}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition w-full text-left ${
            isActive ? 'bg-purple-700 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
          {isOpen && <span>{item.name}</span>}
        </Link>
      );
    });
  

  return (
    <div className="flex flex-col h-screen text-white">
      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 px-6 flex items-center justify-between border-[rgba(19,19,54,0.62)] bg-[rgba(20,20,53,0.8)] backdrop-blur-md backdrop-saturate-150 shadow-md">
        <div className="flex items-center gap-4">
          <FaBars
            onClick={() =>
              window.innerWidth < 768 ? setShowMobileSidebar(true) : setIsOpen(!isOpen)
            }
            className="text-white cursor-pointer text-xl"
          />
          <div className="flex items-center gap-2">
            <Image src="/virtupathai.png" alt="Logo" width={28} height={28} />
            <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
              VirtuPath
            </span>
          </div>
        </div>

        <div className="relative w-1/2 sm:w-1/3">
          <input
            type="text"
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearch('');
                setResults({ users: [], careers: [] });
              } else {
                handleKeyDown(e);
              }
            }}
            placeholder="Search careers, friends..."
            className="w-full pr-10 px-4 py-2 bg-white/10 text-white rounded-xl border border-white/10 focus:outline-none text-sm"
          />

          {search && (
            <button
              onClick={() => {
                setSearch('');
                setResults({ users: [], careers: [] });
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
              aria-label="Clear search"
            >
              <FiX size={18} />
            </button>
          )}

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



        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
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
                  className="flex items-center gap-3 bg-[rgba(11,11,34,0.6)] p-3 rounded-lg"
                >
                  <img
                    src={req.profilePictureUrl ? `${API_HOST}${req.profilePictureUrl}` : defaultAvatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 text-sm text-white">{req.fullName}</div>
                  <button
                    onClick={async () => {
                      try {
                        await api.post(`/userfriends/accept?followerId=${req.followerId}&followedId=${user.userID}`);
                        setRequests((prev) => prev.filter((r) => r.followerId !== req.followerId));
                      } catch (err) {
                        console.error("Failed to accept friend:", err);
                        alert("Failed to accept the request.");
                      }
                    }}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/userfriends/remove?followerId=${req.followerId}&followedId=${user.userID}`);
                        setRequests((prev) => prev.filter((r) => r.followerId !== req.followerId));
                      } catch (err) {
                        console.error("Failed to decline:", err);
                        alert("Failed to decline the request.");
                      }
                    }}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
        )}


          <div className="cursor-pointer flex items-center gap-2" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Image
              src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
              alt="User"
              width={40}
              height={40}
              className="rounded-full object-cover aspect-square"
              unoptimized
            />
            <span className="hidden sm:block">
              {dropdownOpen ? <IoChevronUp /> : <IoChevronDown />}
            </span>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-14 bg-[#15152d] border border-white/10 w-48 rounded-xl shadow-xl z-50">
              {user ? (
                <>
                  {user && (
                    <Link href={`/profile/${user.userID}`} className="block px-4 py-3 hover:bg-white/10 text-sm">
                      View Profile
                    </Link>
                  )}

                  <Link href="/settings" className="block px-4 py-3 hover:bg-white/10 text-sm">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-600/30 text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block px-4 py-3 text-sm hover:bg-white/10">
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="flex pt-16 flex-1 overflow-hidden">
        {/* SIDEBAR DESKTOP */}
        <aside
          className={`hidden sm:flex ${
            isOpen ? 'w-64' : 'w-20'
          } h-full border-r border-[rgba(11,11,34,0.6)] bg-[rgba(11,11,34,0.6)] backdrop-saturate-150 shadow-md flex flex-col justify-between py-6 px-4 transition-all duration-300`}
        >
          <nav className="flex-1 space-y-2">{renderNavItems()}</nav>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition w-full text-left mb-4 ${
              pathname === '/settings' ? 'bg-purple-700 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <FaCog size={20} />
            {isOpen && <span>Settings</span>}
          </Link>
        </aside>

        {/* SIDEBAR MOBILE */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 bg-[rgba(11,11,34,0.6)] backdrop-blur-sm flex">
            <div className="w-64 bg-[#0a0a1f] border-r border-[rgba(11,11,34,0.6)] py-6 px-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-end mb-4">
                  <button onClick={() => setShowMobileSidebar(false)}>
                    <FaBars className="text-white text-xl" />
                  </button>
                </div>
                <nav className="space-y-2">{renderNavItems()}</nav>
              </div>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-white ${
                  pathname === '/settings' ? 'bg-purple-700 font-semibold' : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <FaCog size={20} />
                <span>Settings</span>
              </Link>
            </div>
            <div className="flex-1" onClick={() => setShowMobileSidebar(false)}></div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black-100">{children}</main>
      </div>
    </div>
  );
}

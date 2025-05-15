'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
  FaBook,
  FaChartBar,
  FaUsers,
  FaBug,
  FaSignOutAlt,
  FaUserCircle,
  FaTasks,
} from 'react-icons/fa';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { signOut } from 'next-auth/react';
import api from '@/lib/api';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch {}
    await signOut({ redirect: false });
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', link: '/', icon: <FaHome /> },
    { name: 'Pathway', link: '/pathhub', icon: <FaUser /> },
    { name: 'Daily Missions', link: '/tasks', icon: <FaTasks /> },
    { name: 'Progress', link: '/progress', icon: <FaChartBar /> },
    { name: 'Opportunities', link: '/virtupathcareers', icon: <FaBook /> },
    { name: 'VirtuCrew', link: '/community', icon: <FaUsers /> },
    { name: 'Control Room', link: '/settings', icon: <FaUserCircle /> },
    { name: 'Feedback', link: '/bug', icon: <FaBug /> },
  ];

  return (
    <aside
      className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 bg-[#0a0a1f] border-r border-white/10 flex flex-col`}
    >
      {/* Top */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/virtupathai.png" alt="Logo" width={30} height={30} />
          {isSidebarOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              VirtuPath
            </span>
          )}
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white ml-auto">
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.link;
          return (
            <Link
              key={item.name}
              href={item.link}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition w-full text-left ${
                isActive ? 'bg-purple-700 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 relative">
        <div
          className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/10"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="flex items-center gap-3">
            <Image
              src={
                user?.profilePictureUrl
                  ? `${API_HOST}${user.profilePictureUrl}`
                  : defaultAvatar
              }
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            {isSidebarOpen && (
              <div>
                <p className="text-sm font-medium">{user?.fullName?.split(' ')[0] || 'Guest'}</p>
                <p className="text-xs text-white/60">{user?.email || 'VirtuPath Account'}</p>
              </div>
            )}
          </div>
          {isSidebarOpen &&
            (dropdownOpen ? <IoChevronDown className="text-white/60" /> : <IoChevronUp className="text-white/60" />)}
        </div>

        {dropdownOpen && (
          <div className="absolute bottom-20 left-4 w-52 bg-[#15152d] border border-white/10 rounded-xl shadow-xl z-50">
            {user ? (
              <>
                <Link href="/settings" className="block px-4 py-3 hover:bg-white/10 text-sm">
                  View Profile
                </Link>
                <Link href="/settings" className="block px-4 py-3 hover:bg-white/10 text-sm">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-600/30 text-red-400 text-sm"
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
    </aside>
  );
}

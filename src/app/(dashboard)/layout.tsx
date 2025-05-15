'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaBars, FaHome, FaUser, FaTasks, FaChartBar, FaBook, FaUsers,
  FaUserCircle, FaBug, FaSignOutAlt, FaBell, FaCog
} from 'react-icons/fa';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { signOut } from 'next-auth/react';
import api from '@/lib/api';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
          {item.icon}
          {isOpen && <span>{item.name}</span>}
        </Link>
      );
    });

  return (
    <div className="flex flex-col h-screen text-white">
      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/10 backdrop-saturate-150">

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

        <div className="w-1/2 sm:w-1/3">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/10 focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 relative">
          <FaBell className="text-white text-xl cursor-pointer" />
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
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
                  <Link href="/settings" className="block px-4 py-3 hover:bg-white/10 text-sm">
                    View Profile
                  </Link>
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
          } h-full border-r border-white/10 bg-white/10 backdrop-blur-md backdrop-saturate-150 shadow-md flex flex-col justify-between py-6 px-4 transition-all duration-300`}
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

        {/* SIDEBAR MOBILE OVERLAY */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
            <div className="w-64 bg-[#0a0a1f] border-r border-white/10 py-6 px-4 flex flex-col justify-between">
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
                  pathname === '/settings'
                    ? 'bg-purple-700 font-semibold'
                    : 'hover:bg-white/10 text-white/80'
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

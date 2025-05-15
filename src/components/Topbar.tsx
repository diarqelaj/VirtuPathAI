'use client';

import Image from 'next/image';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  return (
    <header className="h-16 w-full bg-[#0b0b22] border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* LEFT: Toggle + Logo */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar}>
          <FaBars className="text-white text-xl cursor-pointer" />
        </button>
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image src="/virtupathai.png" alt="VirtuPath Logo" width={30} height={30} />
            <span className="hidden md:block text-white font-bold text-lg">VirtuPath</span>
          </div>
        </Link>
      </div>

      {/* CENTER: Search */}
      <div className="flex-1 max-w-lg mx-6 hidden sm:flex">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/10 focus:outline-none"
        />
      </div>

      {/* RIGHT: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <FaBell className="text-white text-lg cursor-pointer" />
        {user ? (
          <Image
            src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
            alt="User"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <Link href="/login">
            <FaUserCircle className="text-white text-xl cursor-pointer" />
          </Link>
        )}
      </div>
    </header>
  );
}

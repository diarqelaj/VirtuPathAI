'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { FaBell } from 'react-icons/fa';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';

export default function Topbar() {
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

  return (
    <header className="w-full h-16 bg-[#0b0b22] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/virtupathai.png" alt="Logo" width={32} height={32} />
        <span className="text-white font-semibold text-lg hidden sm:inline">VirtuPath</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 px-6 max-w-xl w-full hidden md:block">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/10 focus:outline-none"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <FaBell className="text-white text-xl cursor-pointer" />
        {user ? (
          <Image
            src={
              user?.profilePictureUrl
                ? `${API_HOST}${user.profilePictureUrl}`
                : defaultAvatar
            }
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

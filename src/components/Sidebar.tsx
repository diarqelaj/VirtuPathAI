"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaBook,
  FaChartBar,
  FaUsers,
  FaBug,
  FaBars,
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
  FaTasks,
} from "react-icons/fa";
import Image from "next/image";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch {}
    await signOut({ redirect: false });
    router.push("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const navItems = [
    { name: "Dashboard", link: "/", icon: <FaHome /> },
    { name: "Pathway", link: "/pathhub", icon: <FaUser /> },
    { name: "Daily Missions", link: "/tasks", icon: <FaTasks /> },
    { name: "Progress", link: "/progress", icon: <FaChartBar /> },
    { name: "Opportunities", link: "/virtupathcareers", icon: <FaBook /> },
    { name: "VirtuCrew", link: "/community", icon: <FaUsers /> },
    { name: "Control Room", link: "/settings", icon: <FaCog /> },
    { name: "Feedback", link: "/bug", icon: <FaBug /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 z-50 bg-[#0a0a1f] border-r border-white/10 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <Image src="/virtupathai.png" alt="Logo" width={30} height={30} />
            {isOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                VirtuPath AI
              </span>
            )}
          </div>
          <button
            className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-700 text-white font-semibold"
                    : "hover:bg-white/10 text-white/80"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="mt-6 px-2">
          <div
            className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/10 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <Image
                src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
                alt="User"
                width={40}
                height={40}
                className="rounded-full object-cover"
                unoptimized
              />
              {isOpen && (
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.fullName?.split(" ")[0] || "Guest"}
                  </p>
                  <p className="text-xs text-white/60">{user?.email || "VirtuPath Account"}</p>
                </div>
              )}
            </div>
            {isOpen && (dropdownOpen ? <IoChevronDown /> : <IoChevronUp />)}
          </div>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 bg-[#15152d] text-white border border-white/10 rounded-xl shadow-xl"
            >
              {user ? (
                <>
                  <Link href="/settings" className="block px-4 py-3 text-sm hover:bg-white/10">Profile</Link>
                  <Link href="/settings" className="block px-4 py-3 text-sm hover:bg-white/10">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-600/30">Logout</button>
                </>
              ) : (
                <Link href="/login" className="block px-4 py-3 text-sm hover:bg-white/10">Sign In</Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
}
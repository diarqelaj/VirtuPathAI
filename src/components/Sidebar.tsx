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
    { name: "Dashboard", link: "/", icon: <FaHome size={isOpen ? 18 : 22} /> },
    { name: "Pathway", link: "/pathhub", icon: <FaUser size={isOpen ? 18 : 22} /> },
    { name: "Daily Missions", link: "/tasks", icon: <FaTasks size={isOpen ? 18 : 22} /> },
    { name: "Progress", link: "/progress", icon: <FaChartBar size={isOpen ? 18 : 22} /> },
    { name: "Opportunities", link: "/virtupathcareers", icon: <FaBook size={isOpen ? 18 : 22} /> },
    { name: "VirtuCrew", link: "/community", icon: <FaUsers size={isOpen ? 18 : 22} /> },
    { name: "Control Room", link: "/settings", icon: <FaCog size={isOpen ? 18 : 22} /> },
    { name: "Feedback", link: "/bug", icon: <FaBug size={isOpen ? 18 : 22} /> },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${
          isOpen ? "w-64" : "w-20"
        } h-screen sticky top-0 bg-[#0a0a1f] border-r border-white/10 flex-col justify-between py-6 px-4 transition-all duration-300 z-50`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-6">
            <Image src="/virtupathai.png" alt="VirtuPath Logo" width={40} height={40} />
            {isOpen && (
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                VirtuPath AI
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.link;
              return (
                <Link
                  key={item.name}
                  href={item.link}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition w-full text-left ${
                    isActive ? "bg-purple-700 text-white font-semibold" : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  {item.icon}
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile */}
        <div className="mt-6 px-2 relative">
          <div
            className="bg-black-100/5 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/10 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <Image
                src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
                alt="User"
                width={40}
                height={40}
                quality={100}
                className="rounded-full object-cover aspect-square"
                unoptimized
              />
              {isOpen && (
                <div>
                  <p className="text-sm font-medium text-white">{user?.fullName?.split(" ")[0] || "Guest"}</p>
                  <p className="text-xs text-white/60">{user?.email || "VirtuPath Account"}</p>
                </div>
              )}
            </div>
            {isOpen &&
              (dropdownOpen ? (
                <IoChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <IoChevronUp className="w-4 h-4 text-white/50" />
              ))}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`absolute bottom-24 left-0 ${
                  isOpen ? "w-48" : "w-36"
                } bg-[#15152d] text-white border border-white/10 rounded-xl shadow-xl z-50`}
              >
                {user ? (
                  <>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 text-sm"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUserCircle size={16} />
                      {isOpen && "View Profile"}
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 text-sm"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaCog size={16} />
                      {isOpen && "Settings"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-600/30 text-sm text-red-400"
                    >
                      <FaSignOutAlt size={16} />
                      {isOpen && "Logout"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-sm hover:bg-white/10"
                  >
                    {isOpen ? "Sign In" : <FaUserCircle size={16} />}
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Button */}
        <button
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaBars className="rotate-180" /> : <FaBars />}
        </button>
      </aside>
    </>
  );
}

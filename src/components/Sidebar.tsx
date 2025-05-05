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
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
  FaTasks,
} from "react-icons/fa";
import Image from "next/image";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // if not already imported


const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";


export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
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
    { name: "Home", link: "/", icon: <FaHome /> },
    { name: "My Path", link: "/pathhub", icon: <FaUser /> },
    { name: "My Tasks", link: "/tasks", icon: <FaTasks /> },
    { name: "Progress", link: "/progress", icon: <FaChartBar /> },
    { name: "Explore Careers", link: "/virtupathcareers", icon: <FaBook /> },
    { name: "Community", link: "/community", icon: <FaUsers /> },
    { name: "Settings", link: "/settings", icon: <FaCog /> },
    { name: "Report a bug", link: "/bug", icon: <FaBug /> },
  ];

  const SidebarContent = ({
    mobile = false,
    dropdownOpen,
    setDropdownOpen,
  }: {
    mobile?: boolean;
    dropdownOpen: boolean;
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <Image src="/virtupathai.png" alt="VirtuPath Logo" width={40} height={40} />
        <span className="font-bold text-xl text-white">VirtuPath AI</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.link;
          return (
            <Link
              key={item.name}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition ${
                isActive
                  ? "bg-purple-700 text-white font-semibold"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Info with Dropdown */}
      <div className="mt-6 px-2 relative">
        <div
          className="bg-white/5 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Image
            src={
              user?.profilePictureUrl
                ? `${API_HOST}${user.profilePictureUrl}`
                : defaultAvatar
            }
            alt="User"
            width={40}
            height={40}
            quality={100}
            className="rounded-full object-cover aspect-square"
            unoptimized
          />

          <div>
            <p className="text-sm font-medium text-white">
             {user?.fullName?.split(" ")[0] || "User"}
            </p>
            <p className="text-xs text-white/60">{user?.email || "VirtuPath Account"}</p>
          </div>
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute bottom-14 left-2 w-48 bg-[#15152d] text-white border border-white/10 rounded-xl shadow-lg z-50"
          >
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 text-sm"
              onClick={() => setDropdownOpen(false)}
            >
              <FaUserCircle size={16} />
              View Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 text-sm"
              onClick={() => setDropdownOpen(false)}
            >
              <FaCog size={16} />
              Settings
            </Link>
            <button
             onClick={handleLogout}

              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-600/30 text-sm text-red-400"
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-[9999] bg-white/10 text-white p-2 rounded-md backdrop-blur-sm hover:bg-white/20 transition"
        onClick={() => setIsOpen(true)}
      >
        <FaBars />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed z-[9999] top-0 left-0 h-full w-64 bg-[#0a0a1f] border-r border-white/10 py-6 px-4"
            >
              <button
                className="absolute top-4 right-4 text-white"
                onClick={() => setIsOpen(false)}
              >
                <FaTimes size={18} />
              </button>
              <SidebarContent
                mobile
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-[#0a0a1f] border-r border-white/10 flex-col justify-between py-6 px-4">
        <SidebarContent
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
        />
      </aside>
    </>
  );
}

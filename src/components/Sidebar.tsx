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
  FaCog,
  FaBug,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import Image from "next/image";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

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
    { name: "Progress", link: "/progress", icon: <FaChartBar /> },
    { name: "Explore Careers", link: "/virtupathcareers", icon: <FaBook /> },
    { name: "Community", link: "/community", icon: <FaUsers /> },
    { name: "Settings", link: "/settings", icon: <FaCog /> },
    { name: "Report a bug", link: "/bug", icon: <FaBug /> },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
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
  
      {/* Profile Info at Bottom */}
      <div className="mt-6 px-2">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <HiUserCircle size={32} className="text-purple-400" />
          )}
          <div>
            <p className="text-sm font-medium text-white">
              Hi, {user?.fullName?.split(" ")[0] || "User"}
            </p>
            <p className="text-xs text-white/60">{user?.email || "VirtuPath Account"}</p>
          </div>
        </div>
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
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Sidebar panel */}
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
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-[#0a0a1f] border-r border-white/10 flex-col justify-between py-6 px-4">
        <SidebarContent />
      </aside>
    </>
  );
}

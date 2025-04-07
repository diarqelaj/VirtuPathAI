"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import Footer from '@/components/Footer';
import { Spotlight } from '@/components/ui/Spotlight';
import { navItems } from "@/data";
import { CheckCircle2 } from "lucide-react";

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({ name: parsedUser.name || "", email: parsedUser.email || "" });
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleUpdate = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-39 left-1/2 transform -translate-x-1/2 bg-black-100 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="text-sm  text-white">Profile has been updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Section */}
      <div className="min-h-screen pt-40 py-16 px-4 md:px-8 bg-black-100 text-white">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile Info Form */}
          <div className="bg-[rgba(17,25,40,0.85)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
            <img
              src={user.avatar || defaultAvatar}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border border-white/20"
            />

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <button
                onClick={handleUpdate}
                className="mt-4 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-all"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Extra Info Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[rgba(17,25,40,0.75)] border border-white/10 p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium mb-2">Account Overview</h3>
              <p className="text-neutral-400 text-sm">
                You’ve been a member since Jan 2025. Customize your profile and settings to personalize your experience.
              </p>
            </div>

            <div className="bg-[rgba(17,25,40,0.75)] border border-white/10 p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <p className="text-neutral-400 text-sm">
                Enable 2FA, change your password, or manage your session history in settings.
              </p>
            </div>
          </div>
        </motion.div>
        <Footer />
      </div>
    </div>
  );
};

export default ProfilePage;

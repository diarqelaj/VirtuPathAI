"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/ui/Spotlight";
import { navItems } from "@/data";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.fullName || "",
      }));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleUpdate = async () => {
    setError("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const updateData = {
        userID: user.userID,
        fullName: formData.name,
        passwordHash: formData.password || user.passwordHash, // fallback to existing
        email: user.email, // backend requires it
        registrationDate: user.registrationDate,
      };

      const response = await api.put(`/Users/${user.userID}`, updateData);

      const updatedUser = {
        ...user,
        fullName: response.data.fullName,
        passwordHash: response.data.passwordHash,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-100 text-white">
        <span className="text-lg text-neutral-400 animate-pulse">Loading profile...</span>
      </div>
    );
  }
  
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
            <span className="text-sm text-white">Profile has been updated</span>
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
          <div className="bg-[rgba(17,25,40,0.85)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
            <img
              src={user?.avatar || defaultAvatar}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border border-white/20"
            />

            <div className="flex-1 w-full space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Full Name</label>
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
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-white/10 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Registration Date</label>
                <input
                  type="text"
                  value={
                    user.registrationDate
                      ? new Date(user.registrationDate).toLocaleDateString()
                      : "N/A"
                  }
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-white/10 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black-100 border border-white/10"
                />
              </div>

              {formData.password && (
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-black-100 border border-white/10"
                  />
                </div>
              )}

              <button
                onClick={handleUpdate}
                className="mt-4 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[rgba(17,25,40,0.75)] border border-white/10 p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium mb-2">Account Overview</h3>
              <p className="text-neutral-400 text-sm">
                You’ve been a member since{" "}
                {user.registrationDate
                  ? new Date(user.registrationDate).toLocaleDateString()
                  : "N/A"}
                .
              </p>
            </div>

            <div className="bg-[rgba(17,25,40,0.75)] border border-white/10 p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <p className="text-neutral-400 text-sm">
                Change your password or view session info to enhance your account’s security.
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

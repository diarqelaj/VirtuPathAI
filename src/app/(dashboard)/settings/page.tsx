"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import FriendList from '@/components/FriendList';
import FriendRequests from '@/components/FriendRequests';
import UserSearch from '@/components/UserSearch';


const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/users/me");
        const sessionUser = res.data;
        setUser(sessionUser);
        setFormData({ name: sessionUser.fullName || "" });
      } catch {
        alert("Session expired. Please log in again.");
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  const handleUpdate = async () => {
    setError("");
    try {
      const updateData = {
        userID: user.userID,
        fullName: formData.name.trim(),
        passwordHash: user.passwordHash,
        email: user.email,
        registrationDate: user.registrationDate,
      };

      const response = await api.put(`/Users/${user.userID}`, updateData);
      const updatedUser = {
        ...user,
        fullName: response.data.fullName,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.userID);

    try {
      const res = await api.post("/users/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = {
        ...user,
        profilePictureUrl: res.data.profilePictureUrl,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Upload failed", err);
      setError("Failed to upload profile picture. Please try again.");
    }
  };

  const handleImageDelete = async () => {
    if (!user) return;
    try {
      await api.delete(`/users/delete-profile-picture`, {
        params: { userId: user.userID },
      });

      const updatedUser = {
        ...user,
        profilePictureUrl: null,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete profile picture. Please try again.");
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
    <div className="relative bg-black-100 text-white flex flex-col">
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-28 left-1/2 transform -translate-x-1/2 bg-black-100 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="text-sm text-white">Profile updated successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full pt-10 px-0 sm:px-4 md:px-8">
      <motion.div
      className="w-full max-w-none sm:max-w-2xl md:max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >


        <section className="w-full bg-[rgba(17,25,40,0.85)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">

            {/* Avatar + Actions */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group w-28 h-28 rounded-full overflow-hidden">
                <img
                  src={
                    user?.profilePictureUrl
                      ? `${API_HOST}${user.profilePictureUrl}`
                      : defaultAvatar
                  }
                  alt="User Avatar"
                  className="w-28 h-28 object-cover transition duration-300 group-hover:brightness-75"
                />

                {/* Desktop hover overlay */}
                {user?.profilePictureUrl ? (
                  <div className="absolute inset-0 hidden md:flex opacity-0 group-hover:opacity-100 transition duration-300">
                    <label
                      htmlFor="profile-upload"
                      className="w-1/2 flex items-center justify-center bg-black/50 text-white text-xs cursor-pointer"
                    >
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        id="profile-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <div
                      onClick={handleImageDelete}
                      className="w-1/2 flex items-center justify-center bg-black/50 text-red-500 text-xs cursor-pointer"
                    >
                      Delete
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="profile-upload"
                    className="absolute inset-0 hidden md:flex items-center justify-center bg-black/60 text-white text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300"
                  >
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-upload"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Mobile-only action buttons */}
              <div className="mt-3 md:hidden flex gap-3 w-full">
              <label
                htmlFor="profile-upload"
                className="flex-1 bg-white/10 text-white text-center py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-white/20 transition"
              >
                Change
                <input
                  type="file"
                  accept="image/*"
                  id="profile-upload"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {user?.profilePictureUrl && (
                <button
                  onClick={handleImageDelete}
                  className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-md text-sm font-medium hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              )}
            </div>


            </div>
            <section className="mt-10 bg-[rgba(17,25,40,0.85)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Friends</h2>

            {/* IG-style follower counts */}
            <div className="flex items-center gap-6 mb-6 text-white">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">10</span>
                <span className="text-sm text-neutral-400">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">20</span>
                <span className="text-sm text-neutral-400">Following</span>
              </div>
            </div>

            {/* Friend list */}
            <FriendList />

            {/* Friend request inbox */}
            <div className="mt-8">
              <FriendRequests />
            </div>

            {/* Friend search */}
            <div className="mt-8">
              <UserSearch />
            </div>
          </section>


            {/* Form */}
            <div className="flex-1 w-full space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">{error}</div>
              )}

              <InputField
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
              />

              <InputField label="Email" type="email" value={user.email} disabled />
              <InputField
                label="Registration Date"
                type="text"
                value={
                  user.registrationDate
                    ? new Date(user.registrationDate).toLocaleDateString()
                    : "N/A"
                }
                disabled
              />

              <div className="text-sm text-neutral-400 pt-1">
                Want to change your password?{" "}
                <a href="/settings/security" className="text-purple-400 hover:underline">
                  Go to Security Settings
                </a>
              </div>

              <button
                onClick={handleUpdate}
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Save Changes
              </button>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Account Overview">
              You’ve been a member since{" "}
              {user.registrationDate
                ? new Date(user.registrationDate).toLocaleDateString()
                : "N/A"}
              .
            </Card>
            <Card title="Security">
              Manage your sessions and password in the{" "}
              <a href="/settings/security" className="text-purple-400 hover:underline">
                security tab
              </a>
              .
            </Card>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

// Reusable input component
const InputField = ({
  label,
  type,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  type: string;
  value: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm text-neutral-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2 rounded-lg ${
        disabled ? "bg-gray-800 text-gray-400 cursor-not-allowed" : "bg-black-100"
      } border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20`}
    />
  </div>
);

// Reusable card component
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[rgba(17,25,40,0.75)] border border-white/10 p-5 rounded-xl shadow-lg">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-neutral-400 text-sm">{children}</p>
  </div>
);

export default ProfilePage;

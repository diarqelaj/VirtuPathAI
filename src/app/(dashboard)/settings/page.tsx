'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import FriendModal from '@/components/FriendModal';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");

  const [followersList, setFollowersList] = useState<number[]>([]);
  const [followingList, setFollowingList] = useState<number[]>([]);
  const [mutualList, setMutualList] = useState<number[]>([]);

  const [modalType, setModalType] = useState<"followers" | "following" | "mutual" | null>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/users/me");
        const sessionUser = res.data;
        setUser(sessionUser);
        setFormData({ name: sessionUser.fullName || "" });

        const [followersRes, followingRes, mutualRes] = await Promise.all([
          api.get(`/userfriends/followers/${sessionUser.userID}`),
          api.get(`/userfriends/following/${sessionUser.userID}`),
          api.get(`/userfriends/mutual/${sessionUser.userID}`)
        ]);

        setFollowersList(followersRes.data);
        setFollowingList(followingRes.data);
        setMutualList(mutualRes.data);
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
      const updatedUser = { ...user, fullName: response.data.fullName };
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

      const updatedUser = { ...user, profilePictureUrl: res.data.profilePictureUrl };
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
      await api.delete(`/users/delete-profile-picture`, { params: { userId: user.userID } });
      const updatedUser = { ...user, profilePictureUrl: null };
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
          className="w-full max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <section className="bg-[rgba(17,25,40,0.9)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative group w-32 h-32 rounded-full overflow-hidden shadow-xl">
                <img
                  src={
                    user?.profilePictureUrl
                      ? `${API_HOST}${user.profilePictureUrl}`
                      : defaultAvatar
                  }
                  alt="User Avatar"
                  className="w-full h-full object-cover transition duration-300 group-hover:brightness-75"
                />
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
              </div>

              <div className="flex gap-6 text-center text-sm text-white">
                <StatCard label="Followers" count={followersList.length} onClick={() => setModalType("followers")} />
                <StatCard label="Following" count={followingList.length} onClick={() => setModalType("following")} />
                <StatCard label="Friends" count={mutualList.length} onClick={() => setModalType("mutual")} />
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {error && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">{error}</div>
              )}

              <InputField label="Full Name" type="text" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} />
              <InputField label="Email" type="email" value={user.email} disabled />
              <InputField label="Registration Date" type="text" value={user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : "N/A"} disabled />

              <div className="text-sm text-neutral-400 pt-1">
                Want to change your password?{" "}
                <a href="/settings/security" className="text-purple-400 hover:underline">Go to Security Settings</a>
              </div>

              <button
                onClick={handleUpdate}
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Save Changes
              </button>
            </div>
          </section>
        </motion.div>
      </main>

      {showModal && modalType && (
        <FriendModal
          title={modalType.charAt(0).toUpperCase() + modalType.slice(1)}
          type={modalType}
          userIds={
            modalType === "followers"
              ? followersList
              : modalType === "following"
              ? followingList
              : mutualList
          }
          currentUserId={user.userID}
          onClose={() => {
            setShowModal(false);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
};

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

const StatCard = ({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number;
  onClick: () => void;
}) => (
  <div onClick={onClick} className="flex flex-col items-center cursor-pointer hover:text-purple-400 transition">
    <span className="text-lg font-semibold">{count}</span>
    <span className="text-neutral-400">{label}</span>
  </div>
);

export default ProfilePage;

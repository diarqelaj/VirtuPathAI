"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { navItems } from "@/data";
import { CheckCircle2, Lock } from "lucide-react";
import api from "@/lib/api";

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-100 text-white">
        <span className="text-lg text-neutral-400 animate-pulse">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
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

      <main className="min-h-screen pt-10 py-16 px-4 md:px-8">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <section className="bg-[rgba(17,25,40,0.85)] border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
            <img
              src={user?.avatar || defaultAvatar}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border border-white/20 object-cover"
            />

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

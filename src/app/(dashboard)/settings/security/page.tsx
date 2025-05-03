"use client";

import { useEffect, useState } from "react";
import { FaKey, FaMobileAlt, FaSignOutAlt } from "react-icons/fa";
import api from "@/lib/api";

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const user = res.data;
        setIs2FAEnabled(user.isTwoFactorEnabled);
        setUserId(user.userID);
      } catch (err) {
        console.error("Error fetching user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggle2FA = async () => {
    if (!userId) return;
  
    try {
      // 🔄 Get the current user object
      const userRes = await api.get(`/users/${userId}`);
      const currentUser = userRes.data;
  
      // 📝 Update the isTwoFactorEnabled flag
      const updatedUser = {
        ...currentUser,
        isTwoFactorEnabled: !is2FAEnabled,
      };
  
      await api.put(`/users/${userId}`, updatedUser);
      setIs2FAEnabled(!is2FAEnabled);
    } catch (err) {
      console.error("Error updating 2FA", err);
    }
  };
  
  const options = [
    {
      icon: <FaKey className="text-purple-400 w-5 h-5" />,
      title: "Change Password",
      description: "Set a new password to keep your account safe.",
      action: "Change",
      onClick: () => {},
    },
    {
      icon: <FaMobileAlt className="text-purple-400 w-5 h-5" />,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      action: is2FAEnabled ? "Disable" : "Enable",
      onClick: toggle2FA,
    },
    {
      icon: <FaSignOutAlt className="text-purple-400 w-5 h-5" />,
      title: "Active Sessions",
      description: "Review devices currently logged into your account.",
      action: "View",
      onClick: () => {},
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h2 className="text-3xl font-bold text-white">Security Settings</h2>

      <div className="space-y-6">
        {options.map(({ icon, title, description, action, onClick }) => (
          <div
            key={title}
            className="flex items-start justify-between p-5 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex gap-4">
              <div className="pt-1">{icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/60">{description}</p>
              </div>
            </div>
            <button
              onClick={onClick}
              className="text-sm bg-white/10 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
              disabled={loading && title === "Two-Factor Authentication"}
            >
              {action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

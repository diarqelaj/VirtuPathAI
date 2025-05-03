"use client";

import { useEffect, useState } from "react";
import { FaKey, FaMobileAlt, FaSignOutAlt } from "react-icons/fa";
import api from "@/lib/api";

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

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
      const userRes = await api.get(`/users/${userId}`);
      const currentUser = userRes.data;
      await api.put(`/users/${userId}`, {
        ...currentUser,
        isTwoFactorEnabled: !is2FAEnabled,
      });
      setIs2FAEnabled(!is2FAEnabled);
    } catch (err) {
      console.error("Error updating 2FA", err);
    }
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (!validatePassword(newPassword)) {
      setPasswordMessage("Password must have 1 uppercase, 1 number, 1 symbol, and 8+ characters.");
      return;
    }
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("✅ Password changed successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        setPasswordMessage(`❌ ${data.error || "Failed to change password."}`);
      }
    } catch (err: any) {
      setPasswordMessage(err.response?.data?.error || "❌ Error changing password.");
    }
  };

  const options = [
    {
      icon: <FaKey className="text-purple-400 w-5 h-5" />,
      title: "Change Password",
      description: "Set a new password to keep your account safe.",
      action: showPasswordForm ? "Close" : "Change",
      onClick: () => setShowPasswordForm(!showPasswordForm),
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
            className="p-5 bg-black/30 border border-white/10 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
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
  
            {/* Inject password form under "Change Password" */}
            {title === "Change Password" && showPasswordForm && (
              <div className="mt-6 space-y-4 p-4 bg-gradient-to-br from-purple-800/10 to-black/20 rounded-xl border border-white/10">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white placeholder-gray-400"
                />
  
                {passwordMessage && (
                  <div className={`text-sm ${passwordMessage.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                    {passwordMessage}
                  </div>
                )}
  
                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 rounded-lg font-medium"
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
}

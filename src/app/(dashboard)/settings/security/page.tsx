"use client";

import { useEffect, useState } from "react";
import { FaKey, FaMobileAlt, FaSignOutAlt, FaBell } from "react-icons/fa";
import NeonCheckbox from "@/components/NeonCheckbox"; // adjust the path to match your structure

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
  const [settings, setSettings] = useState({
    productUpdates: false,
    careerTips: false,
    newCareerPathAlerts: false,
    promotions: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const user = res.data;
        setIs2FAEnabled(user.isTwoFactorEnabled);
        setUserId(user.userID);
        setSettings({
          productUpdates: user.productUpdates,
          careerTips: user.careerTips,
          newCareerPathAlerts: user.newCareerPathAlerts,
          promotions: user.promotions,
        });
      } catch {
        console.error("Error loading user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const toggle2FA = async () => {
    if (!userId) return;
    const userRes = await api.get(`/users/${userId}`);
    const currentUser = userRes.data;
    await api.put(`/users/${userId}`, {
      ...currentUser,
      isTwoFactorEnabled: !is2FAEnabled,
    });
    setIs2FAEnabled(!is2FAEnabled);
  };

  const validatePassword = (p: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(p);

  const handleChangePassword = async () => {
    setPasswordMessage("");
    if (newPassword !== confirmPassword) return setPasswordMessage("❌ Passwords do not match.");
    if (!validatePassword(newPassword)) return setPasswordMessage("❌ Weak password format.");
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordMessage("✅ Password changed.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setShowPasswordForm(false);
    } else setPasswordMessage(`❌ ${data.error || "Failed to change."}`);
  };

  const handleToggleSetting = (key: keyof typeof settings) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...settings, [key]: e.target.checked };
    setSettings(updated);
    if (userId) await api.put(`/Users/notifications/${userId}`, updated);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      {/* SECURITY CARD */}
      <section className="bg-black/30 p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <span className="bg-yellow-500/10  text-white-100 p-2 rounded-full">
            <FaKey />
          </span>
          Security Settings
        </h2>

        <SettingCard
          icon={<FaKey className="text-purple-400/65" />}
          title="Change Password"
          description="Set a new password to keep your account safe."
          action={showPasswordForm ? "Close" : "Change"}
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        />

        {showPasswordForm && (
          <div className="space-y-4 mt-4 bg-black/20 p-5 rounded-lg border border-white/10">
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Current Password" className="input" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="input" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="input" />
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{passwordMessage}</p>
            )}
            <button onClick={handleChangePassword} className="btn-primary w-full">Save New Password</button>
          </div>
        )}

        <SettingCard
          icon={<FaMobileAlt className="text-purple-400/65" />}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
          action={is2FAEnabled ? "Disable" : "Enable"}
          onClick={toggle2FA}
        />
      </section>

      <section className="bg-black/30 p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <span className="bg-yellow-500/10 text-white-400/65 p-2 rounded-full">
            <FaBell />
          </span>
          Notification Preferences
        </h2>

        <NeonCheckbox
          label="Email me when there are product updates"
          checked={settings.productUpdates}
          onChange={handleToggleSetting("productUpdates")}
        />
        <NeonCheckbox
          label="Send me career tips and resources"
          checked={settings.careerTips}
          onChange={handleToggleSetting("careerTips")}
        />
        <NeonCheckbox
          label="Notify me when a new career path launches"
          checked={settings.newCareerPathAlerts}
          onChange={handleToggleSetting("newCareerPathAlerts")}
        />
        <NeonCheckbox
          label="Notify me of discounts and promotions"
          checked={settings.promotions}
          onChange={handleToggleSetting("promotions")}
        />
      </section>

    </div>
  );
}

function SettingCard({ icon, title, description, action, onClick }: any) {
  return (
    <div className="p-4 border border-white/10 rounded-lg bg-black/20 flex justify-between items-start hover:bg-white/5 transition">
      <div className="flex items-start gap-4">
        <div className="pt-1">{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/60">{description}</p>
        </div>
      </div>
      <button onClick={onClick} className="px-4 py-2 bg-white/10 hover:bg-purple-600 text-white text-sm rounded-lg transition">
        {action}
      </button>
    </div>
  );
}

function CheckboxSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: any }) {
  return (
    <label className="flex items-start space-x-3 hover:bg-white/5 p-3 rounded-md transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded bg-black border-white/20 text-purple-500 focus:ring-purple-500"
      />
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FaKey, FaMobileAlt, FaBell, FaUserShield } from "react-icons/fa";
import api from "@/lib/api";
import NeonCheckbox from "@/components/NeonCheckbox";

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", bio: "", about: "", isPrivate: false });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
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
        const data = res.data;
        setUser(data);
        setFormData({
          name: data.fullName || "",
          bio: data.bio || "",
          about: data.about || "",
          isPrivate: data.isProfilePrivate || false,
        });
        setIs2FAEnabled(data.isTwoFactorEnabled);
        setSettings({
          productUpdates: data.productUpdates,
          careerTips: data.careerTips,
          newCareerPathAlerts: data.newCareerPathAlerts,
          promotions: data.promotions,
        });
      } catch {
        console.error("Error loading user.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await api.put(`/users/${user.userID}`, {
        ...user,
        fullName: formData.name,
        bio: formData.bio,
        about: formData.about,
        isProfilePrivate: formData.isPrivate,
      });
      alert("Profile updated!");
    } catch {
      alert("Failed to update profile.");
    }
  };

  const handleImageUpload = async (e: any, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.userID);
    try {
      const res = await api.post(
        type === "profile" ? "/users/upload-profile-picture" : "/users/upload-cover",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUser((prev: any) => ({
        ...prev,
        [type === "profile" ? "profilePictureUrl" : "coverImageUrl"]: res.data.profilePictureUrl || res.data.coverImageUrl,
      }));
    } catch {
      alert("Failed to upload image.");
    }
  };

  const handleImageDelete = async (type: "profile" | "cover") => {
    if (!user) return;
    try {
      await api.delete(`/users/delete-${type === "profile" ? "profile-picture" : "cover-image"}?userId=${user.userID}`);
      setUser((prev: any) => ({
        ...prev,
        [type === "profile" ? "profilePictureUrl" : "coverImageUrl"]: null,
      }));
    } catch {
      alert("Failed to delete image.");
    }
  };

  const toggle2FA = async () => {
    if (!user) return;
    await api.put(`/users/${user.userID}`, {
      ...user,
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
    if (user?.userID) await api.put(`/Users/notifications/${user.userID}`, updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 md:px-10 space-y-10 text-white overflow-x-hidden">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {/* Profile Section */}
      <section className="bg-black/30 p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <FaUserShield className="text-purple-400/70" />
          Profile Details
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex flex-col items-center gap-2">
            <img src={user?.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar} className="w-24 h-24 rounded-full object-cover" />
            <div className="flex gap-2 text-sm">
              <label className="cursor-pointer underline">Change
                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, "profile")} />
              </label>
              <button onClick={() => handleImageDelete("profile")} className="text-red-400 underline">Remove</button>
            </div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <Input label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <Input label="Bio" value={formData.bio} onChange={(v) => setFormData({ ...formData, bio: v })} />
            <Input label="About" value={formData.about} onChange={(v) => setFormData({ ...formData, about: v })} />
            <label className="flex items-center gap-3 text-sm mt-2">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
              Make my profile private
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Cover Image</label>
          {user?.coverImageUrl && (
            <img src={`${API_HOST}${user.coverImageUrl}`} className="rounded-xl h-32 object-cover mb-2" />
          )}
          <div className="flex gap-4">
            <input type="file" onChange={(e) => handleImageUpload(e, "cover")} />
            <button onClick={() => handleImageDelete("cover")} className="text-red-400 underline text-sm">Remove Cover</button>
          </div>
        </div>

        <button onClick={handleSaveProfile} className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white text-sm font-medium transition">
          Save Changes
        </button>
      </section>

      {/* Security Section */}
      <section className="bg-black/30 p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <FaKey className="text-purple-400/70" />
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
          <div className="w-full p-3 bg-black/10 border border-white/10 rounded-md text-sm space-y-2">
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Current Password" className="input" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="input" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="input" />
            {passwordMessage && <p className={`text-sm ${passwordMessage.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{passwordMessage}</p>}
            <button onClick={handleChangePassword} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-sm font-medium transition">
              Save New Password
            </button>
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

      {/* Notification Section */}
      <section className="bg-black/30 p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <FaBell className="text-purple-400/65" />
          Notification Preferences
        </h2>
        <NeonCheckbox label="Email me when there are product updates" checked={settings.productUpdates} onChange={handleToggleSetting("productUpdates")} />
        <NeonCheckbox label="Send me career tips and resources" checked={settings.careerTips} onChange={handleToggleSetting("careerTips")} />
        <NeonCheckbox label="Notify me when a new career path launches" checked={settings.newCareerPathAlerts} onChange={handleToggleSetting("newCareerPathAlerts")} />
        <NeonCheckbox label="Notify me of discounts and promotions" checked={settings.promotions} onChange={handleToggleSetting("promotions")} />
      </section>
    </div>
  );
}

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="w-full">
    <label className="block text-sm text-white/70 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black-100 border border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

function SettingCard({ icon, title, description, action, onClick }: any) {
  return (
    <div className="p-4 border border-white/10 rounded-lg bg-black/20 flex flex-col sm:flex-row justify-between sm:items-start gap-4 hover:bg-white/5 transition">
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

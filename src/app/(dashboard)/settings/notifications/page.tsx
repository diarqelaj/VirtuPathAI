"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function NotificationsSettings() {
  const [settings, setSettings] = useState({
    productUpdates: false,
    careerTips: false,
    newCareerPathAlerts: false,
    promotions: false,
  });

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const res = await api.get("/Users/me");
        setUserId(res.data.userID);
        setSettings({
          productUpdates: res.data.productUpdates,
          careerTips: res.data.careerTips,
          newCareerPathAlerts: res.data.newCareerPathAlerts,
          promotions: res.data.promotions,
        });
      } catch (err) {
        console.error("Failed to load user settings.");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (key: keyof typeof settings) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    const updatedSettings = { ...settings, [key]: newValue };
    setSettings(updatedSettings);

    if (!userId) return;

    try {
      await api.put(`/Users/notifications/${userId}`, updatedSettings);
    } catch (err) {
      console.error("Failed to update notification settings.");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h2 className="text-2xl font-bold">Notification Preferences</h2>

      <div className="space-y-4">
        <CheckboxSetting
          label="Email me when there are product updates"
          checked={settings.productUpdates}
          onChange={handleChange("productUpdates")}
        />
        <CheckboxSetting
          label="Send me career tips and resources"
          checked={settings.careerTips}
          onChange={handleChange("careerTips")}
        />
        <CheckboxSetting
          label="Notify me when a new career path launches"
          checked={settings.newCareerPathAlerts}
          onChange={handleChange("newCareerPathAlerts")}
        />
        <CheckboxSetting
          label="Notify me of discounts and promotions"
          checked={settings.promotions}
          onChange={handleChange("promotions")}
        />
      </div>
    </div>
  );
}

function CheckboxSetting({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-start space-x-3">
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

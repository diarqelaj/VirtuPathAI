"use client";

import { FaKey, FaMobileAlt, FaSignOutAlt } from "react-icons/fa";

export default function SecuritySettingsPage() {
  const options = [
    {
      icon: <FaKey className="text-purple-400 w-5 h-5" />,
      title: "Change Password",
      description: "Set a new password to keep your account safe.",
      action: "Change",
    },
    {
      icon: <FaMobileAlt className="text-purple-400 w-5 h-5" />,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      action: "Enable",
    },
    {
      icon: <FaSignOutAlt className="text-purple-400 w-5 h-5" />,
      title: "Active Sessions",
      description: "Review devices currently logged into your account.",
      action: "View",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h2 className="text-3xl font-bold text-white">Security Settings</h2>

      <div className="space-y-6">
        {options.map(({ icon, title, description, action }) => (
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
            <button className="text-sm bg-white/10 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition">
              {action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

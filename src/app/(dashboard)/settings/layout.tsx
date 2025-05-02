"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const settingsNav = [
  { name: "Profile", href: "/settings" },
  { name: "Notifications", href: "/settings/notifications" },
  { name: "Security", href: "/settings/security" },
  { name: "Billing", href: "/settings/billing" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full px-6 py-8">
      {/* Nav Tabs */}
      <nav className="relative mb-8 border-b border-white/10 pb-2 flex gap-8">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-0 w-full h-0.5 bg-purple-500 rounded"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Render settings page */}
      <div>{children}</div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const settingsNav = [
  { name: "Settings", href: "/settings" },
  { name: "Billing", href: "/settings/billing" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8">


      {/* Nav Tabs */}
      <nav className="relative mb-8 border-b border-white/10 pb-2 flex flex-wrap gap-4 sm:gap-6">

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
      <div className="w-full">{children}</div>

    </div>
  );
}

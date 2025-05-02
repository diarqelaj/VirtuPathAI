"use client";

import Image from "next/image";
import { useState } from "react";
import { FaHome, FaUser, FaBook, FaChartBar, FaUsers, FaCog } from "react-icons/fa";

export default function VirtuPathDashboard() {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <div className="flex min-h-screen bg-black-100 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a1f] border-r border-white/10 flex flex-col justify-between py-6 px-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <Image src="/virtupathai.png" alt="VirtuPath Logo" width={40} height={40} />
            <span className="font-bold text-xl text-white">VirtuPath AI</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-3">
            {[
              { name: "Home", icon: <FaHome /> },
              { name: "My Path", icon: <FaUser /> },
              { name: "Progress", icon: <FaChartBar /> },
              { name: "Explore Careers", icon: <FaBook /> },
              { name: "Community", icon: <FaUsers /> },
              { name: "Settings", icon: <FaCog /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition ${
                  activeTab === item.name
                    ? "bg-purple-700 text-white font-semibold"
                    : "hover:bg-white/10 text-white/80"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User Panel */}
        <div className="px-2 mt-10">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <Image src="/virtupathai.png" alt="User" width={32} height={32} className="rounded-full" />
            <div>
              <p className="text-sm font-medium text-white">Hi, Alex</p>
              <p className="text-xs text-white/60">1V010a account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Welcome */}
        <div className="mb-8 flex items-center gap-6">
          <Image
            src="/virtupathai.png"
            alt="User Avatar"
            width={60}
            height={60}
            className="rounded-full"
          />
          <h1 className="text-3xl font-semibold">Hi, Alex!</h1>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-white/70 mb-2">Daily Task Completion</p>
            <h2 className="text-3xl font-bold mb-3">82%</h2>
            <div className="h-2 w-full bg-white/10 rounded-full">
              <div className="h-full bg-purple-500 rounded-full w-[82%]" />
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-white/70 mb-2">Performance Rating</p>
            <div className="text-purple-400 text-xl">⭐⭐⭐⭐☆</div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-white/70 mb-2">Current Path</p>
            <h2 className="text-lg font-medium">Software Developer</h2>
            <div className="h-2 mt-2 w-full bg-white/10 rounded-full">
              <div className="h-full bg-purple-400 rounded-full w-[70%]" />
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-white/70 mb-4">Weekly Progress</p>
            <div className="h-40 w-full bg-gradient-to-t from-purple-900 via-purple-600 to-purple-300 rounded-lg opacity-70"></div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-white/70 mb-4">Streak</p>
            <div className="h-40 w-full bg-gradient-to-t from-purple-900 via-purple-600 to-purple-300 rounded-lg opacity-70"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

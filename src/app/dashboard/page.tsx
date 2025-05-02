"use client";

import { useEffect, useState } from "react";
import {
  SparklesIcon,
  ChartBarIcon,
  BriefcaseIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  FaHome,
  FaUser,
  FaBook,
  FaChartBar,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi";
import Image from "next/image";
import api from "@/lib/api";

export default function VirtuPathDashboard() {
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState<any>(null);
  const [completionCount, setCompletionCount] = useState(0);
  const [performance, setPerformance] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("Loading...");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await api.get("/users/me");
        setUser(userRes.data);

        const completionRes = await api.get("/taskcompletion");
        setCompletionCount(completionRes.data?.length || 0);

        const perfRes = await api.get("/performancereviews");
        setPerformance(perfRes.data?.[0]);

        const subRes = await api.get("/UserSubscriptions");
        const subs = subRes.data;
        if (subs?.length > 0) {
          const latest = subs.reduce((a: any, b: any) =>
            new Date(a.startDate) > new Date(b.startDate) ? a : b
          );
          setCurrentPath(latest?.careerPathName || "No Path");
        } else {
          setCurrentPath("No Active Path");
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-black-100 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a1f] border-r border-white/10 flex flex-col justify-between py-6 px-4">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <Image src="/virtupathai.png" alt="VirtuPath Logo" width={40} height={40} />
            <span className="font-bold text-xl text-white">VirtuPath AI</span>
          </div>

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

        <div className="px-2 mt-10">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            {user?.profileImage ? (
              <Image src={user.profileImage} alt="User" width={32} height={32} className="rounded-full" />
            ) : (
              <HiUserCircle size={32} className="text-purple-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                Hi, {user?.fullName?.split(" ")[0] || "User"}
              </p>
              <p className="text-xs text-white/60">{user?.email || "VirtuPath Account"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* Large Welcome Card */}
          <div className="xl:col-span-3 bg-white/5 p-8 rounded-2xl flex items-center gap-6">
            {user?.profileImage ? (
              <Image src={user.profileImage} alt="User" width={72} height={72} className="rounded-full" />
            ) : (
              <HiUserCircle size={72} className="text-purple-400" />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-1">
                Hi, {user?.fullName?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-white/60 text-sm">Welcome back to your career journey.</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="bg-white/5 p-6 rounded-2xl text-center">
            <h3 className="text-sm text-white/60 mb-2">Daily Task Completion</h3>
            <p className="text-4xl font-bold text-purple-400">{completionCount}</p>
            <div className="mt-3 h-2 bg-white/10 rounded-full">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min((completionCount / 7) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl text-center">
            <h3 className="text-sm text-white/60 mb-2">Performance Rating</h3>
            <div className="flex justify-center text-purple-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(performance?.rating || 0)
                      ? "text-purple-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl text-center">
            <h3 className="text-sm text-white/60 mb-2">Current Path</h3>
            <p className="text-xl font-semibold">{currentPath}</p>
            <div className="mt-3 h-2 bg-white/10 rounded-full">
              <div className="h-full bg-purple-500 w-2/3 rounded-full" />
            </div>
          </div>
        </div>

        {/* Chart Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl">
            <h3 className="mb-3 font-medium">Weekly Progress</h3>
            <div className="h-40 bg-black-100 rounded-xl flex items-end gap-2 p-3">
              {[40, 60, 50, 70, 90, 100, 80].map((val, i) => (
                <div key={i} className="flex flex-col items-center justify-end w-full">
                  <div className="w-2 bg-purple-400 rounded-full transition-all" style={{ height: `${val}%` }} />
                  <p className="text-xs text-white/40 mt-1">{"SMTWTFS"[i]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl">
            <h3 className="mb-3 font-medium">Streak</h3>
            <div className="h-40 bg-black-100 rounded-xl flex items-end gap-2 p-3">
              {[1, 3, 5, 6, 8, 10, 7].map((val, i) => (
                <div key={i} className="flex flex-col items-center justify-end w-full">
                  <div className="w-2 bg-purple-300 rounded-full transition-all" style={{ height: `${val * 10}%` }} />
                  <p className="text-xs text-white/40 mt-1">{"SMTWTFS"[i]}</p>
                </div>
              ))}
            </div>
            <div className="text-sm text-white/60 mt-3 flex justify-between">
              <span>5 days</span>
              <span>5.5 days</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

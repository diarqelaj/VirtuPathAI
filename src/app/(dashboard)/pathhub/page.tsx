"use client";

import { useEffect, useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { StarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import api from "@/lib/api";

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

export default function VirtuPathDashboard() {
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
    <main className="px-6 md:px-10 py-10 w-full">
      {/* Welcome Card */}
      <div className="bg-white/5 p-6 rounded-2xl flex items-center gap-6 mb-10">
        {user ? (
          <Image
            src={
              user.profilePictureUrl
                ? `${API_HOST}${user.profilePictureUrl}`
                : defaultAvatar
            }
            alt="User Avatar"
            width={80}
            height={80}
            unoptimized
            className="rounded-full object-cover ring-2 ring-purple-600 shadow-md hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <HiUserCircle size={80} className="text-purple-400" />
        )}
        <div>
          <h1 className="text-4xl font-bold mb-1">
            Hi, {user?.fullName?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-white/60 text-sm">Welcome back to your career journey.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Completion */}
        <div className="bg-white/5 p-6 rounded-2xl text-center h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-white/60 mb-2">Daily Task Completion</h3>
            <p className="text-4xl font-bold text-purple-400">{completionCount}</p>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${Math.min((completionCount / 7) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white/5 p-6 rounded-2xl text-center h-full flex flex-col justify-between">
          <div>
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
        </div>

        {/* Current Path */}
        <div className="bg-white/5 p-6 rounded-2xl text-center h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-white/60 mb-2">Current Path</h3>
            <p className="text-xl font-semibold">{currentPath}</p>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div className="h-full bg-purple-500 w-2/3 rounded-full" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white/5 p-6 rounded-2xl h-full">
          <h3 className="mb-3 font-medium">Weekly Progress</h3>
          <div className="h-40 bg-black-100 rounded-xl flex items-end gap-2 p-3">
            {[40, 60, 50, 70, 90, 100, 80].map((val, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-full">
                <div
                  className="w-2 bg-purple-400 rounded-full transition-all"
                  style={{ height: `${val}%` }}
                />
                <p className="text-xs text-white/40 mt-1">{"SMTWTFS"[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white/5 p-6 rounded-2xl h-full">
          <h3 className="mb-3 font-medium">Streak</h3>
          <div className="h-40 bg-black-100 rounded-xl flex items-end gap-2 p-3">
            {[1, 3, 5, 6, 8, 10, 7].map((val, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-full">
                <div
                  className="w-2 bg-purple-300 rounded-full transition-all"
                  style={{ height: `${val * 10}%` }}
                />
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
  );
}

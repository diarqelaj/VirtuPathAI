"use client";

import { useEffect, useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { StarIcon } from "@heroicons/react/24/outline";
import { WiDaySunny, WiDayCloudy, WiNightAltCloudy } from "react-icons/wi";
import Image from "next/image";
import api from "@/lib/api";
import React from "react";

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff";

export default function VirtuPathDashboard() {
  const [user, setUser] = useState<any>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [currentPath, setCurrentPath] = useState("Loading...");
  const [weeklyProgress, setWeeklyProgress] = useState<
    { day: number; completed: number; total: number }[]
  >([]);
  const [greetingData, setGreetingData] = useState<{
    greeting: string;
    icon: React.ReactNode;
  } | null>(null);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const padded = (n: number) => String(n).padStart(2, "0");

  const getGreetingVisual = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        greeting: "Good morning",
        icon: <WiDaySunny className="text-yellow-300 w-7 h-7" />,
      };
    } else if (hour < 18) {
      return {
        greeting: "Good afternoon",
        icon: <WiDayCloudy className="text-orange-300 w-7 h-7" />,
      };
    } else {
      return {
        greeting: "Good evening",
        icon: <WiNightAltCloudy className="text-blue-300 w-7 h-7" />,
      };
    }
  };

  useEffect(() => {
    setGreetingData(getGreetingVisual());

    const fetchDashboardData = async () => {
      try {
        const userRes = await api.get("/users/me");
        const currentUser = userRes.data;
        setUser(currentUser);

        const { careerPathID, currentDay, userID } = currentUser;

        const tasksRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${currentDay}`);
        const todayTasks = tasksRes.data;
        setTotalToday(todayTasks.length);

        const completionRes = await api.get(`/taskcompletion/byuser/${userID}`);
        const userCompletions = completionRes.data;

        const today = new Date().toISOString().split("T")[0];
        const todayCompletions = userCompletions.filter(
          (tc: any) =>
            tc.careerDay === currentDay &&
            tc.completionDate?.startsWith(today)
        );
        setCompletedToday(todayCompletions.length);

        const perfRes = await api.get(`/PerformanceReviews/progress/daily?userId=${userID}&day=${currentDay}`);
        setPerformanceScore(perfRes.data?.performanceScore || 0);

        const pathRes = await api.get(`/CareerPaths/${careerPathID}`);
        setCurrentPath(pathRes.data?.name || "Unknown Path");

        const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
        const progressArr: { day: number; completed: number; total: number }[] = [];

        for (let day = weekStart; day < weekStart + 7; day++) {
          const dayTasksRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${day}`);
          const tasks = dayTasksRes.data || [];
          const total = tasks.length;
          const completed = userCompletions.filter((c: any) => c.careerDay === day).length;
          progressArr.push({ day, completed, total });
        }

        setWeeklyProgress(progressArr);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setHours(h);
      setMinutes(m);
      setSeconds(s);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const completionPercent = totalToday === 0 ? 0 : Math.min((completedToday / totalToday) * 100, 100);

  return (
    <main className="px-6 md:px-10 py-10 w-full">
      {/* Welcome */}
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
            className="rounded-full object-cover aspect-square ring-purple-600 shadow-md hover:scale-105 transition-transform duration-200"
            quality={100}
          />
        ) : (
          <HiUserCircle size={80} className="text-purple-400" />
        )}
        <div>
          <h1 className="text-4xl font-bold mb-1 flex items-center gap-2">
            {greetingData?.icon}
            {greetingData?.greeting}, {user?.fullName?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-white/60 text-sm">Welcome back to your career journey.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Completion */}
        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Today's Task Completion</h3>
          <p className="text-4xl font-bold text-purple-400">
            {completedToday} / {totalToday}
          </p>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Performance Rating</h3>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.round(performanceScore / 20);
              return (
                <StarIcon
                  key={i}
                  className={`w-7 h-7 ${filled ? "text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" : "text-white/20"}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-xs text-purple-300/80">{performanceScore}% accuracy today</p>
        </div>

        {/* Current Path */}
        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Current Path</h3>
          <p className="text-xl font-semibold">{currentPath}</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div className="h-full bg-purple-500 w-2/3 rounded-full" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white/5 p-6 rounded-2xl h-full">
          <h3 className="mb-3 font-medium">Weekly Progress</h3>
          <div className="h-40 bg-black-100 rounded-xl flex items-end gap-4 p-4">
            {weeklyProgress.map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-full h-full group">
                <div
                  className="w-2 bg-purple-400 rounded-full relative transition-all duration-300"
                  style={{ height: `${item.completed * 20}%` }}
                >
                  <div className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-center text-white bg-purple-700 px-2 py-1 rounded">
                    {item.completed} / {item.total} task{item.total !== 1 ? "s" : ""} done
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">{"SMTWTFS"[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="relative bg-[#0b0b1238] p-8 rounded-2xl text-center overflow-hidden shadow-xl">
          {/* Gradient Overlay for Depth */}
          <div className="absolute inset-0 z-0 bg-gradient-to-tl from-purple-900/40 via-transparent to-transparent pointer-events-none" />

          {/* Giant Background Time Numbers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[160px] md:text-[220px] font-extrabold text-purple-900/30 select-none leading-none tracking-tight">
              {padded(hours)}:{padded(minutes)}
            </span>
          </div>

          {/* Foreground Text */}
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300/70 via-purple-100/60 to-purple-300/70 tracking-wide mb-2 text-left">
              New Tasks In
            </h2>

            <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 drop-shadow">
             
            </div>
        
          </div>
        </div>

      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { StarIcon } from "@heroicons/react/24/outline";
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
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [monthlyPerformance, setMonthlyPerformance] = useState<any>(null);

  const padded = (n: number) => String(n).padStart(2, "0");

  const getGreetingData = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const icon = hour < 18 ? "/icons/sun.svg" : "/icons/moon.svg";
    return { greeting, icon };
  };

  const [greetingData, setGreetingData] = useState(getGreetingData());

  useEffect(() => {
    setGreetingData(getGreetingData());

    const fetchDashboardData = async () => {
      try {
        const userRes = await api.get("/users/me");
        const currentUser = userRes.data;
        setUser(currentUser);

        const { careerPathID, currentDay, userID } = currentUser;

        const tasksRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${currentDay}`);
        setTotalToday(tasksRes.data.length);

        const completionRes = await api.get(`/taskcompletion/byuser/${userID}`);
        const userCompletions = completionRes.data;
        const today = new Date().toISOString().split("T")[0];

        const todayCompletions = userCompletions.filter(
          (tc: any) => tc.careerDay === currentDay && tc.completionDate?.startsWith(today)
        );
        setCompletedToday(todayCompletions.length);

        const perfRes = await api.get(`/PerformanceReviews/progress/daily?userId=${userID}&day=${currentDay}`);
        setPerformanceScore(perfRes.data?.performanceScore || 0);

        const pathRes = await api.get(`/CareerPaths/${careerPathID}`);
        setCurrentPath(pathRes.data?.name || "Unknown Path");

        const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
        const progressArr: { day: number; completed: number; total: number }[] = [];

        for (let day = weekStart; day < weekStart + 7; day++) {
          const tasks = (await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${day}`)).data || [];
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

      setHours(Math.floor(diff / (1000 * 60 * 60)));
      setMinutes(Math.floor((diff / (1000 * 60)) % 60));
      setSeconds(Math.floor((diff / 1000) % 60));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMonthlyPerformance = async () => {
      try {
        const userRes = await api.get("/users/me");
        const userID = userRes.data.userID;

        const monthlyPerfRes = await api.get(`/PerformanceReviews/progress/monthly?userId=${userID}`);
        console.log("Monthly Performance API Response:", monthlyPerfRes.data);
        setMonthlyPerformance(monthlyPerfRes.data);
      } catch (err) {
        console.error("Error fetching monthly performance data:", err);
      }
    };

    fetchMonthlyPerformance();
  }, []);

  const completionPercent = totalToday === 0 ? 0 : Math.min((completedToday / totalToday) * 100, 100);

  return (
    <main className="px-6 md:px-10 py-10 w-full">
      {/* Welcome */}
      <div className="relative bg-white/5 p-6 rounded-2xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          {user ? (
            <Image
              src={user.profilePictureUrl ? `${API_HOST}${user.profilePictureUrl}` : defaultAvatar}
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
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              {greetingData.greeting}, {user?.fullName?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-white/60 text-sm">Welcome back to your career journey.</p>
          </div>
        </div>
        <div className="absolute right-4 top-4 md:static md:ml-auto z-0 opacity-70">
          <Image src={greetingData.icon} alt="Icon" width={72} height={72} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Today's Task Completion</h3>
          <p className="text-4xl font-bold text-purple-400">
            {completedToday} / {totalToday}
          </p>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Performance Rating</h3>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.round(performanceScore / 20);
              return (
                <StarIcon
                  key={i}
                  className={`w-7 h-7 ${
                    filled
                      ? "text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                      : "text-white/20"
                  }`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-xs text-purple-300/80">{performanceScore}% accuracy today</p>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl text-center">
          <h3 className="text-sm text-white/60 mb-2">Current Path</h3>
          <p className="text-xl font-semibold">{currentPath}</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full">
            <div className="h-full bg-purple-500 w-2/3 rounded-full" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px]">
        {/* Weekly Progress */}
        <div className="bg-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="mb-3 font-medium">Weekly Progress</h3>
          <div className="h-48 bg-[#111113] rounded-xl flex items-end gap-5 px-4 py-6">
          {weeklyProgress.map((item, i) => {
            const percent = item.total === 0 ? 0 : (item.completed / item.total) * 100;
            const heightPercent = Math.max(10, percent); // Ensure minimum height
            const dayLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];

            return (
              <div key={i} className="flex flex-col items-center justify-end w-full group">
                <div
                  className="w-4 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500 relative transition-all duration-300"
                  style={{ height: `${heightPercent}%`, minHeight: "0.5rem" }}
                >
                  <div className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-white bg-purple-700 px-2 py-1 rounded z-10 whitespace-nowrap">
                    {item.completed} / {item.total} task{item.total !== 1 ? "s" : ""}
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">{dayLabel}</p>
              </div>
            );
          })}
        </div>

        </div>



        {/* Countdown */}
        <div className="relative bg-[#0b0b1238] p-8 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl min-h-[320px]">
          <div className="absolute inset-0 z-0 bg-gradient-to-tl from-purple-900/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[160px] md:text-[220px] font-extrabold text-purple-900/30 select-none leading-none tracking-tight">
              {padded(hours)}:{padded(minutes)}
            </span>
          </div>
          <div className="relative z-10 text-left">
            <h2 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300/70 via-purple-100/60 to-purple-300/70 tracking-wide mb-2">
              New Tasks In
            </h2>
            
            <p className="text-sm text-white/50 mt-2">Local time until reset</p>
          </div>
        </div>
      </div>
    </main>
  );
}

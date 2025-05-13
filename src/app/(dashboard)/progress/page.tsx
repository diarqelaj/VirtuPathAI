'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Footer from '@/components/Footer';
import { navItems } from '@/data';
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/lib/api';

const Page = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [userID, setUserID] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; tasks: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ week: string; completed: number; total: number }[]>([]);
  const [circleStats, setCircleStats] = useState({ completed: 0, total: 1 }); // prevent divide-by-zero

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUserID(res.data.userID);
      } catch (err) {
        console.error('User not logged in');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userID) return;

    const fetchWeekly = async () => {
      try {
        const userRes = await api.get('/users/me');
        const { careerPathID, currentDay } = userRes.data;

        const completionRes = await api.get(`/taskcompletion/byuser/${userID}`);
        const completions = completionRes.data;

        const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
        const weekData: { day: string; tasks: number }[] = [];

        for (let i = 0; i < 7; i++) {
          const dayNumber = weekStart + i;
          const tasksRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${dayNumber}`);
          const completedCount = completions.filter((c: any) => c.careerDay === dayNumber).length;
          const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
          weekData.push({ day: dayLabel, tasks: completedCount });
        }

        setWeeklyData(weekData);

        const weeklyCircleRes = await api.get(`/PerformanceReviews/progress/weekly?userId=${userID}`);
        setCircleStats({
          completed: weeklyCircleRes.data.tasksCompleted,
          total: weeklyCircleRes.data.tasksAssigned,
        });
      } catch (err) {
        console.error('Error fetching weekly data:', err);
      }
    };

    const fetchMonthly = async () => {
      try {
        const userRes = await api.get('/users/me');
        const { currentDay } = userRes.data;
    
        const res = await api.get(`/PerformanceReviews/progress/monthly?userId=${userID}&day=${currentDay}`);
        const data = res.data;
    
        const formatted = data.weeklyProgress.map((week: any) => ({
          week: week.week,
          completed: week.completed,
          total: week.total,
        }));
    
        setMonthlyData(formatted);
    
        if (timeRange === 'month') {
          const totalCompleted = formatted.reduce((sum: number, w: any) => sum + w.completed, 0);
          const totalAssigned = formatted.reduce((sum: number, w: any) => sum + w.total, 0);
          setCircleStats({
            completed: totalCompleted,
            total: totalAssigned,
          });
        }
    
      } catch (err) {
        console.error('Error fetching monthly data:', err);
      }
    };
    
    
    

    if (timeRange === 'week') fetchWeekly();
    else fetchMonthly();
  }, [timeRange, userID]);

  const progressPercent = Math.round((circleStats.completed / circleStats.total) * 100);

  const chartContent =
    timeRange === 'week' ? (
      <BarChart data={weeklyData}>
        <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
        <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              return (
                <div className="text-sm bg-black rounded-xl border border-white/10 px-4 py-3 shadow-xl text-white">
                  <div><strong>Day:</strong> {label}</div>
                  <div><strong>Completed:</strong> {item.tasks}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="tasks" fill="url(#progressGradient)" radius={[8, 8, 0, 0]} />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </BarChart>
    ) : (
      <BarChart data={monthlyData}>
        <XAxis dataKey="week" stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
        <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} domain={[0, (dataMax: number) => Math.max(1, dataMax)]} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              return (
                <div className="text-sm bg-black rounded-xl border border-white/10 px-4 py-3 shadow-xl text-white">
                  <div><strong>{label}</strong></div>
                  <div><strong>Completed:</strong> {item.completed} / {item.total}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="completed" fill="url(#progressGradient)" radius={[8, 8, 0, 0]} />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </BarChart>
    );

    return (
      <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
        <main className="flex-1 pt-16 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 w-full max-w-[1600px] mx-auto overflow-x-hidden">

          <div className="bg-black-100/80 border border-white/10 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-12">
              <div className="text-center pb-2">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 leading-tight">
                  Progress Dashboard
                </h1>
                <p className="text-gray-400">Track your coding journey progress</p>
              </div>
    
              <div className="flex gap-4 justify-center flex-wrap">
                {(['week', 'month', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-6 py-2 rounded-full transition-all ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 hover:shadow-md'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
    
              <div className="flex flex-col lg:flex-row gap-12 justify-between items-center">
                <div className="w-full lg:flex-1 overflow-x-auto">
                  <div className="min-w-[300px] h-80 sm:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartContent}
                    </ResponsiveContainer>
                  </div>
                </div>


    
                <div className="flex-1 flex justify-center items-center">
                  <div className="relative w-52 h-52">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#1f1f1f" strokeWidth="10" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="282.6"
                        strokeDashoffset={282.6 - (progressPercent / 100) * 282.6}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-bold text-purple-300">
                        {progressPercent}%
                      </div>
                      <div className="text-sm text-white/60">Completed</div>
                      <div className="text-xs text-white/40 mt-1">
                        {circleStats.completed} / {circleStats.total}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="mt-12 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
                <h3 className="text-2xl font-semibold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                  Select Date to View Progress
                </h3>
                <div className="flex justify-center">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      if (date) setSelectedDate(date);
                    }}
                    inline
                    className="!bg-white/5 !border !border-white/10 rounded-xl overflow-hidden"
                    wrapperClassName="react-datepicker-wrapper"
                    calendarClassName="react-datepicker-dark"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
    
};

export default Page;

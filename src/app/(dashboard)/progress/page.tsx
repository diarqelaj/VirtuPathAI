'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import Footer from '@/components/Footer';
import { navItems } from '@/data';
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/lib/api';

const Page = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [userID, setUserID] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; completed: number; total: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ week: string; completed: number; total: number }[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me', { withCredentials: true });
        setUserID(res.data.userID);
      } catch (err) {
        console.error('User not logged in');
        setUserID(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMonthlyProgress = async () => {
      if (timeRange !== 'month' || userID === null) return;
      try {
        const res = await api.get(`/PerformanceReviews/progress/monthly?userId=${userID}`);
        const progress = res.data;
        const formatted = (progress.weeklyProgress || []).map((week: any, i: number) => ({
          week: `Week ${i + 1}`,
          completed: week.completed,
          total: week.total
        }));
        setMonthlyData(formatted);
      } catch (err) {
        console.error('Error fetching monthly progress:', err);
      }
    };
    fetchMonthlyProgress();
  }, [timeRange, userID]);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      try {
        const userRes = await api.get('/users/me');
        const currentUser = userRes.data;
        const { careerPathID, currentDay, userID } = currentUser;

        const completionRes = await api.get(`/taskcompletion/byuser/${userID}`);
        const completions = completionRes.data;

        const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;

        const taskRequests = Array.from({ length: 7 }, (_, i) =>
          api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${weekStart + i}`)
        );
        const taskResponses = await Promise.all(taskRequests);

        let totalCompleted = 0;
        let totalTasks = 0;

        const data = taskResponses.map((res, i) => {
          const dayNumber = weekStart + i;
          const tasks = res.data || [];
          const completedCount = completions.filter((c: any) => c.careerDay === dayNumber).length;
          totalCompleted += completedCount;
          totalTasks += tasks.length;

          return {
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            completed: completedCount,
            total: tasks.length
          };
        });

        setTotalCompleted(totalCompleted);
        setTotalTasks(totalTasks);
        setWeeklyData(data);
      } catch (err) {
        console.error('Error fetching weekly progress:', err);
      }
    };
    fetchWeeklyProgress();
  }, []);

  const percentage = totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);

  const chartContent = timeRange === 'week' ? (
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
                <div><strong>Completed:</strong> {item.completed} / {item.total} tasks</div>
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
  ) : (
    <BarChart data={monthlyData}>
      <XAxis dataKey="week" stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
      <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
      <Tooltip
        formatter={(_, __, payload: any) => {
          const item = payload?.[0]?.payload;
          return `${item.completed} / ${item.total} tasks`;
        }}
        contentStyle={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
        itemStyle={{ color: '#e5e7eb' }}
      />
      <Bar dataKey="completed" fill="url(#progressGradient)" radius={[8, 8, 0, 0]} />
    </BarChart>
  );

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
      <FloatingNav navItems={navItems} />
      <main className="flex-1 pt-20 px-6 md:px-12 max-w-screen-xl mx-auto">
        <div className="bg-black-100/80 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                Progress Dashboard
              </h1>
              <p className="text-gray-400">Track your coding journey progress</p>
            </div>

            <div className="flex gap-4 justify-center">
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

            <div className="flex flex-wrap md:flex-nowrap gap-8 justify-between">
              <div className="flex-1 max-w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartContent}
                </ResponsiveContainer>
              </div>

              {/* Circular Progress */}
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
                      strokeDashoffset={282.6 - (percentage / 100) * 282.6}
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
                    <div className="text-3xl font-bold text-purple-300">{percentage}%</div>
                    <div className="text-sm text-white/60">Weekly Completion</div>
                    <div className="text-xs text-white/40 mt-1">{totalCompleted} / {totalTasks}</div>
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
                  onChange={(date) => setSelectedDate(date)}
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

      <Footer />
    </div>
  );
};

export default Page;

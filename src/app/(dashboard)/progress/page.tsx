'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import Footer from '@/components/Footer';
import { navItems } from '@/data';
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/lib/api';

const Page = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [userID, setUserID] = useState<number | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState<{ week: string; completed: number; total: number }[]>([]);



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

  // Example mock logic that should be replaced with real data fetching logic when API is ready
  const [weeklyData, setWeeklyData] = useState<{ day: string; tasks: number }[]>([]);

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
        const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);
  
        const data: { day: string; tasks: number }[] = [];
  
        for (let i = 0; i < 7; i++) {
          const dayNumber = weekStart + i;
          const tasks = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${dayNumber}`);
          const completedCount = completions.filter(
            (c: any) => c.careerDay === dayNumber
          ).length;
  
          const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
          data.push({ day: dayLabel, tasks: completedCount });
        }
  
        setWeeklyData(data);
      } catch (err) {
        console.error('Error fetching weekly progress:', err);
      }
    };
  
    fetchWeeklyProgress();
  }, []);
  

  const mockTasks = [
    { text: 'Morning coding session', done: true, date: '2024-03-25' },
    { text: 'Project meeting', done: true, date: '2024-03-25' },
    { text: 'Code review', done: false, date: '2024-03-25' },
    { text: 'Learn new framework', done: false, date: '2024-03-25' },
  ];
  const chartContent = timeRange === 'week' ? (
    <BarChart data={weeklyData}>
      <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
      <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
      <Tooltip
        contentStyle={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
        itemStyle={{ color: '#e5e7eb' }}
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
    <BarChart
  data={monthlyData.map(w => ({
    week: w.week,
    completed: w.completed,
    total: w.total
  }))}
>
  <XAxis dataKey="week" stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
  <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} domain={[0, (dataMax: number) => Math.max(1, dataMax)]} />
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

              <div className="flex flex-wrap gap-8 md:flex-nowrap md:w-1/2">
                <div className="flex-1 bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircleIcon className="h-7 w-7 text-purple-400" />
                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100">
  Completed: {mockTasks.filter(t => t.done).length}
</h3>

                  </div>
                 
                </div>

                <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-purple-900/20 p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-7 border-2 border-blue-400 rounded-full" />
                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
  Pending: {mockTasks.filter(t => !t.done).length}
</h3>

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

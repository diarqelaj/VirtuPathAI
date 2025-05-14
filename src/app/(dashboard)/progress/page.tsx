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
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/lib/api';
import { motion, useSpring, useTransform } from 'framer-motion';

const Page = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [userID, setUserID] = useState<number | null>(null);
  const [careerPathID, setCareerPathID] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);

  const [weeklyData, setWeeklyData] = useState<{ day: string; tasks: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ week: string; completed: number; total: number }[]>([]);
  const [allTimeData, setAllTimeData] = useState<{ month: string; completed: number; total: number }[]>([]);
  const [circleStats, setCircleStats] = useState({ completed: 0, total: 1 });
  const [dailyTasks, setDailyTasks] = useState<{ content: string; isCompleted: boolean }[]>([]);

  const progressValue = (circleStats.completed / circleStats.total) * 100;
  const animatedProgress = useSpring(0, { stiffness: 100, damping: 20 });
  const circumference = 2 * Math.PI * 45;
  const dashOffset = useTransform(animatedProgress, (value) => circumference - (value / 100) * circumference);

  useEffect(() => {
    animatedProgress.set(progressValue);
  }, [progressValue]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        const { userID, careerPathID } = res.data;
        setUserID(userID);
        setCareerPathID(careerPathID);
        const start = await api.get(`/usersubscriptions/startdate?userId=${userID}&careerPathId=${careerPathID}`);
        setStartDate(new Date(start.data));
      } catch (err) {
        console.error('User not logged in');
      }
    };
    fetchUser();
  }, []);

  const getCareerDayFromDate = (date: Date): number => {
    if (!startDate) return 0;
    const diffTime = date.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    const fetchDaily = async () => {
      if (!userID || !careerPathID || !selectedDate || !startDate) return;
      const day = getCareerDayFromDate(selectedDate);
      if (day < 1) return;

      try {
        const taskRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${day}`);
        const tasks = taskRes.data;

        const completedRes = await api.get(`/taskcompletion/byuser/${userID}`);
        const completedIDs = completedRes.data.map((c: any) => c.taskID);

        const mapped = tasks.map((t: any) => ({
          content: t.content,
          isCompleted: completedIDs.includes(t.taskID),
        }));

        setDailyTasks(mapped);
      } catch (err) {
        console.error('Error fetching daily tasks:', err);
      }
    };

    fetchDaily();
  }, [selectedDate, userID, careerPathID, startDate]);

  useEffect(() => {
    if (!userID) return;

    const fetchWeekly = async () => {
      const userRes = await api.get('/users/me');
      const { careerPathID, currentDay } = userRes.data;
      const completionRes = await api.get(`/taskcompletion/byuser/${userID}`);
      const completions = completionRes.data;

      const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
      const dayNumbers = Array.from({ length: 7 }, (_, i) => weekStart + i);
      const taskRes = await api.get(`/DailyTasks/bycareerweek?careerPathId=${careerPathID}&startDay=${weekStart}`);
      const taskList = taskRes.data;

      const weekData = dayNumbers.map((dayNumber, i) => {
        const completedCount = completions.filter((c: any) => c.careerDay === dayNumber).length;
        const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
        return { day: dayLabel, tasks: completedCount };
      });

      setWeeklyData(weekData);
      const totalCompleted = weekData.reduce((sum, d) => sum + d.tasks, 0);
      const totalAssigned = taskList.length;
      if (timeRange === 'week') {
        setCircleStats({ completed: totalCompleted, total: totalAssigned });
      }
    };

    const fetchMonthly = async () => {
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
      const totalCompleted = formatted.reduce((sum: number, m: { completed: number }) => sum + m.completed, 0);
      const totalAssigned = formatted.reduce((sum: number, m: { total: number }) => sum + m.total, 0);
      if (timeRange === 'month') {
        setCircleStats({ completed: totalCompleted, total: totalAssigned });
      }
    };

    const fetchAllTime = async () => {
      const res = await api.get(`/PerformanceReviews/progress/alltime?userId=${userID}`);
      const data = res.data;
      const formatted = data.monthlyProgress.map((m: any) => ({
        month: m.month,
        completed: m.completed,
        total: m.total,
      }));
      setAllTimeData(formatted);
      const totalCompleted = formatted.reduce((sum: number, m: { completed: number }) => sum + m.completed, 0);
      const totalAssigned = formatted.reduce((sum: number, m: { total: number }) => sum + m.total, 0);
      if (timeRange === 'all') {
        setCircleStats({ completed: totalCompleted, total: totalAssigned });
      }
    };

    if (timeRange === 'week') fetchWeekly();
    else if (timeRange === 'month') fetchMonthly();
    else if (timeRange === 'all') fetchAllTime();
  }, [timeRange, userID]);

  const progressChart = timeRange === 'week' ? weeklyData : timeRange === 'month' ? monthlyData : allTimeData;
  const dataKey = timeRange === 'week' ? 'tasks' : 'completed';
  const labelKey = timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month';

  return (
    <div className="bg-black-100 text-white min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 pt-16 pb-24">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
            Progress Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your career journey day-by-day</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-full transition ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressChart}>
                <XAxis dataKey={labelKey} stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="text-sm bg-black-100 rounded-xl border border-white/10 px-4 py-3 shadow-xl text-white">
                          <div><strong>{label}</strong></div>
                          <div><strong>Completed:</strong> {item.completed ?? item.tasks} / {item.total ?? ''}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={dataKey} fill="url(#progressGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <motion.svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#1f1f1f" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: dashOffset }}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </motion.svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-bold text-purple-300">{Math.round(progressValue)}%</div>
                <div className="text-sm text-white/60">Completed</div>
                <div className="text-xs text-white/40 mt-1">
                  {circleStats.completed} / {circleStats.total}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
            View Tasks by Date
          </h3>
          <div className="flex flex-col lg:flex-row gap-8">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              inline
              minDate={startDate ?? undefined}
              maxDate={new Date()}
              calendarClassName="!bg-gradient-to-b from-[#1e1b2e] to-[#11101a] text-white border border-purple-800 rounded-xl shadow-xl"
              dayClassName={(date) => {
                const day = getCareerDayFromDate(date);
                return dailyTasks.length > 0 &&
                  date.toDateString() === selectedDate.toDateString()
                  ? '!bg-purple-600 !text-white rounded-full'
                  : getCareerDayFromDate(date) <= getCareerDayFromDate(new Date()) &&
                    getCareerDayFromDate(date) > 0
                  ? '!bg-green-600/60 text-white rounded-md'
                  : '';
              }}
            />


            <div className="flex-1 space-y-4">
              {dailyTasks.length === 0 ? (
                <p className="text-gray-400">No tasks assigned for this day.</p>
              ) : (
                <ul className="space-y-4">
                  {dailyTasks.map((task, index) => (
                    <li
                      key={index}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-md transition-all ${
                        task.isCompleted
                          ? 'border-purple-500 bg-purple-900/10 shadow-md shadow-purple-700/30'
                          : 'border-purple-700/40 bg-purple-800/10 shadow-inner shadow-purple-900/10'
                      }`}
                    >
                      <span className="text-white">{task.content}</span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          task.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        {task.isCompleted ? 'Completed' : 'Not Done'}
                      </span>
                    </li>

                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

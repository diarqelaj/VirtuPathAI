'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import Footer from '@/components/Footer';
import { navItems } from '@/data';
import 'react-datepicker/dist/react-datepicker.css';

const mockWeeklyData = [
  { day: 'Mon', tasks: 4 },
  { day: 'Tue', tasks: 6 },
  { day: 'Wed', tasks: 8 },
  { day: 'Thu', tasks: 5 },
  { day: 'Fri', tasks: 7 },
  { day: 'Sat', tasks: 3 },
  { day: 'Sun', tasks: 2 },
];

const mockTasks = [
  { text: 'Morning coding session', done: true, date: '2024-03-25' },
  { text: 'Project meeting', done: true, date: '2024-03-25' },
  { text: 'Code review', done: false, date: '2024-03-25' },
  { text: 'Learn new framework', done: false, date: '2024-03-25' },
];

const Page = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
      <FloatingNav navItems={navItems} />

      <main className="flex-1 pt-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-black-100/80 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                Progress Dashboard
              </h1>
              <p className="text-gray-400">Track your coding journey progress</p>
            </div>

            {/* Time Range Selector */}
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

            {/* Progress Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyData}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280" 
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: '#111113', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar
                    dataKey="tasks"
                    fill="url(#progressGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Tasks Overview */}
            <div className="flex gap-8">
              {/* Completed Tasks */}
              <div className="flex-1 bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircleIcon className="h-7 w-7 text-purple-400" />
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100">
                    Completed Tasks
                  </h3>
                </div>
                <div className="space-y-4">
                  {mockTasks.filter(t => t.done).map((task, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <CheckCircleIcon className="h-6 w-6 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-200 text-lg">{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-purple-900/20 p-8 rounded-2xl border border-white/10 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-7 w-7 border-2 border-blue-400 rounded-full" />
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
                    Pending Tasks
                  </h3>
                </div>
                <div className="space-y-4">
                  {mockTasks.filter(t => !t.done).map((task, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="h-6 w-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-400/30 rounded-full" />
                      </div>
                      <span className="text-gray-400 text-lg">{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Section */}
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
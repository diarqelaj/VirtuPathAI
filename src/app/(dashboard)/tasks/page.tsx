'use client';

import { useEffect, useRef, useState } from 'react';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type Task = {
  id: number;
  text: string;
  checked: boolean;
};

type CompletionMap = {
  [taskID: number]: number;
};

const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionMap, setCompletionMap] = useState<CompletionMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const userRes = await api.get('/users/me');
        const userID = userRes.data.userID;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const tasksRes = await api.get(`/DailyTasks/today`, {
          headers: { 'X-Timezone': timezone },
        });

        const dailyTasks: Task[] = tasksRes.data.map((task: any) => ({
          id: task.taskID,
          text: task.taskDescription,
          checked: false,
        }));

        const completionsRes = await api.get(`/TaskCompletion?userID=${userID}`);
        const map: CompletionMap = {};
        completionsRes.data.forEach((c: any) => {
          map[c.taskID] = c.completionID;
        });

        const finalTasks = dailyTasks.map((task) => ({
          ...task,
          checked: map[task.id] !== undefined,
        }));

        setTasks(finalTasks);
        setCompletionMap(map);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await api.get('/DailyQuotes/today');
        setDailyQuote(res.data.quote);
      } catch {
        setDailyQuote("The expert in anything was once a beginner.");
      }
    };

    fetchQuote();

    const interval = setInterval(() => {
      const now = new Date().toDateString();
      const stored = localStorage.getItem('lastQuoteDate');
      if (stored !== now) {
        localStorage.setItem('lastQuoteDate', now);
        fetchQuote();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const recordTaskCompletion = async (taskID: number) => {
    if (completionMap[taskID]) return;

    try {
      const userRes = await api.get('/users/me');
      const userID = userRes.data.userID;
      const careerDay = userRes.data.currentDay;

      const completionData = {
        completionID: 0,
        userID,
        taskID,
        careerDay,
        completionDate: new Date().toISOString(),
      };

      const res = await api.post('/TaskCompletion', completionData);
      setCompletionMap((prev) => ({ ...prev, [taskID]: res.data.completionID }));
    } catch {
      setError('Failed to record task completion.');
    }
  };

  const deleteTaskCompletion = async (taskID: number) => {
    const completionID = completionMap[taskID];
    if (!completionID) return;

    try {
      await api.delete(`/TaskCompletion/${completionID}`);
      setCompletionMap((prev) => {
        const map = { ...prev };
        delete map[taskID];
        return map;
      });
    } catch {
      setError('Failed to delete task completion.');
    }
  };

  const toggleTask = async (index: number) => {
    const updated = [...tasks];
    const task = updated[index];
    task.checked = !task.checked;
    setTasks(updated);

    try {
      if (task.checked) {
        await recordTaskCompletion(task.id);
      } else {
        await deleteTaskCompletion(task.id);
      }
    } catch {
      setError('Failed to update task status.');
    }
  };

  const completedTasks = tasks.filter((t) => t.checked).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
      <main className="flex-1 pt-12 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto w-full">
        <div className="bg-black-100/80 border border-white/10 backdrop-blur-xl p-4 sm:p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="text-center mb-10 sm:mb-12">
              <SparklesIcon className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 text-purple-400/30 mx-auto mb-2 sm:mb-4" />
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 leading-snug">
                “{dailyQuote || 'Loading daily quote...'}”
              </h1>
            </div>
  
            {loading ? (
            <div className="space-y-3 sm:space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 sm:p-5 rounded-xl border border-gray-800 bg-white/5 backdrop-blur-sm"
                >
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gray-700/60" />
                  <div className="flex-1 h-4 sm:h-5 rounded-md bg-gray-700/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl border ${
                    task.checked ? 'border-white/10' : 'border-gray-800'
                  } bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer group`}
                  onClick={() => toggleTask(index)}
                >
                  {task.checked ? (
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mt-0.5" />
                  ) : (
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                  <span className={`text-sm sm:text-base font-medium tracking-wide ${task.checked ? 'text-gray-200' : 'text-gray-400'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          )}

  
            {!loading && !error && (
              <div className="mt-10 sm:mt-12 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm font-medium text-purple-300">
                  <span>Progress</span>
                  <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
                <div className="relative h-3 rounded-full bg-purple-900/30 backdrop-blur-sm overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-right text-xs sm:text-sm text-purple-300/70">{Math.round(progress)}% completed</p>
              </div>
            )}
  
            <div className="mt-5 sm:mt-6">
              <div className="w-full bg-gradient-to-r from-purple-900 to-purple-700 text-center text-xs sm:text-sm text-purple-200 rounded-lg px-4 py-2 sm:px-5 sm:py-3 border border-purple-500/20 shadow-inner">
                Minimum 50% of tasks must be completed. A new set of daily tasks will become available after midnight local time.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
  
};

export default TaskPage;

'use client';

import { useEffect, useState } from 'react';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import Footer from '@/components/Footer';
import { navItems } from '@/data';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import api from '@/lib/api';

type Task = {
  id: number;
  text: string;
  checked: boolean;
};

const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const userID = localStorage.getItem('userID');
        if (!userID || userID === '0') {
          setError('Invalid user ID. Please log in again.');
          return;
        }

        const subscriptionsRes = await api.get(`/UserSubscriptions?userID=${userID}`);
        const subscriptions = subscriptionsRes.data;

        if (!subscriptions || subscriptions.length === 0) {
          setError('No active subscriptions found.');
          return;
        }

        const activeSubscription = subscriptions.reduce((latest, current) => {
          const latestStartDate = new Date(latest.startDate);
          const currentStartDate = new Date(current.startDate);
          return latestStartDate > currentStartDate ? latest : current;
        });

        const careerPathID = activeSubscription.careerPathID;
        let startDay = activeSubscription.lastAccessedDay || 1;

        const tasksRes = await api.get(`/DailyTasks/bycareerandday?careerPathId=${careerPathID}&day=${startDay}`);

        if (!tasksRes.data || tasksRes.data.length === 0) {
          setError('No tasks found for this career path on this day.');
        } else {
          const completionsRes = await api.get(`/TaskCompletion?userID=${userID}`);
          const completedTaskIDs = completionsRes.data.map((comp: any) => comp.taskID);

          const formattedTasks = tasksRes.data.map((task: any) => ({
            id: task.taskID,
            text: task.taskDescription,
            checked: completedTaskIDs.includes(task.taskID),
          }));

          setTasks(formattedTasks);
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const recordTaskCompletion = async (taskID: number) => {
    const userID = localStorage.getItem('userID');
    if (!userID || userID === '0') {
      setError('Invalid user ID. Please log in again.');
      return;
    }

    const completionData = {
      completionID: 0,
      userID: parseInt(userID),
      taskID: taskID,
      completionDate: new Date().toISOString(),
    };

    try {
      await api.post('/TaskCompletion', completionData);
      console.log('Task completion recorded:', completionData);
    } catch (err) {
      console.error('Error recording task completion:', err);
      setError('Failed to record task completion.');
    }
  };

  const toggleTask = async (index: number) => {
    const updatedTasks = [...tasks];
    const t = updatedTasks[index];
    t.checked = !t.checked;
    setTasks(updatedTasks);

    if (t.checked) {
      await recordTaskCompletion(t.id);
    }

    try {
      const orig = await api.get(`/DailyTasks/${t.id}`);
      const fullTask = orig.data;
      fullTask.isCompleted = t.checked;
      await api.put(`/DailyTasks/${t.id}`, fullTask);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status.');
    }
  };

  const completedTasks = tasks.filter((task) => task.checked).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
      <FloatingNav navItems={navItems} />

      <main className="flex-1 pt-40 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-black-100/80 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <SparklesIcon className="h-12 w-12 text-purple-400/30 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                "The expert in anything was once a beginner."
              </h1>
              <p className="text-sm text-gray-400 font-light tracking-wide">– Helen Hayes</p>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading tasks...</p>
            ) : error ? (
              <p className="text-center text-red-400">{error}</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-5 rounded-xl border
                      ${task.checked ? 'border-white/10' : 'border-gray-800'}
                      bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300
                      cursor-pointer group`}
                    onClick={() => toggleTask(index)}
                  >
                    {task.checked ? (
                      <CheckCircleIcon className="h-7 w-7 flex-shrink-0 text-gray-400" />
                    ) : (
                      <svg
                        className="h-7 w-7 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    <span
                      className={`text-lg font-medium tracking-wide ${
                        task.checked ? 'text-gray-200' : 'text-gray-400'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && (
              <div className="mt-12 space-y-2">
                <div className="flex justify-between text-sm font-medium text-purple-300">
                  <span>Progress</span>
                  <span>
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-purple-900/30 backdrop-blur-sm overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-right text-sm text-purple-300/70">
                  {Math.round(progress)}% completed
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaskPage;

'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
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
  const [userDay, setUserDay] = useState<number | null>(null); // ⬅️ Track day globally

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const userRes = await api.get('/users/me');
        const user = userRes.data;
        const userID = user.userID;
        const careerPathID = user.careerPathID;
        const day = user.currentDay;

        if (!careerPathID || !day || day < 1) {
          setError("No career path or day found for user.");
          return;
        }
        
        

        setUserDay(day); // ⬅️ Save day for later use in record

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await api.post('/Progress/check', {
          userID,
          careerPathID,
          timeZone: timezone,
        });

        const tasksRes = await api.get(`/DailyTasks/bycareerandday`, {
          params: { careerPathId: careerPathID, day },
        });

        const dailyTasks: Task[] = tasksRes.data.map((task: any) => ({
          id: task.taskID,
          text: task.taskDescription,
          checked: false,
        }));

        const completionsRes = await api.get(`/TaskCompletion?userID=${userID}`);
        const completionData = completionsRes.data;

        const map: CompletionMap = {};
        completionData.forEach((comp: any) => {
          map[comp.taskID] = comp.completionID;
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

  const recordTaskCompletion = async (taskID: number) => {
    if (completionMap[taskID]) return;

    try {
      const userRes = await api.get('/users/me');
      const userID = userRes.data.userID;
      const careerDay = userRes.data.currentDay; // or use userDay

      const completionData = {
        completionID: 0,
        userID,
        taskID,
        careerDay, // ✅ Ensure careerDay is sent
        completionDate: new Date().toISOString(),
      };

      const res = await api.post('/TaskCompletion', completionData);
      setCompletionMap((prev) => ({ ...prev, [taskID]: res.data.completionID }));
    } catch (err) {
      console.error('Error recording task completion:', err);
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
    } catch (err) {
      console.error('Error deleting task completion:', err);
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
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status.');
    }
  };

  const completedTasks = tasks.filter((t) => t.checked).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col">
      <main className="flex-1 pt-15 px-6 md:px-12 max-w-4xl mx-auto">
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
                      <CheckCircleIcon className="h-7 w-7 text-gray-400" />
                    ) : (
                      <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium tracking-wide ${task.checked ? 'text-gray-200' : 'text-gray-400'}`}>
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
                  <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
                <div className="relative h-3 rounded-full bg-purple-900/30 backdrop-blur-sm overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-right text-sm text-purple-300/70">{Math.round(progress)}% completed</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskPage;

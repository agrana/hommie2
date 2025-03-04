"use client";
import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import PomodoroTimer from "@/components/PomodoroTimer";
import TaskList from "@/components/TaskList";
import Notes from "@/components/Notes";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ✅ Load tasks from Supabase when the page loads
  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setTasks(data || []);
    }
    fetchTasks();
  }, []);

  // ✅ Persist selectedTask across page refreshes
  useEffect(() => {
    const savedTask = localStorage.getItem("selectedTask");
    if (savedTask) {
      setSelectedTask(JSON.parse(savedTask));
    }
  }, []);

  useEffect(() => {
    if (selectedTask) {
      localStorage.setItem("selectedTask", JSON.stringify(selectedTask));
    }
  }, [selectedTask]);

  // ✅ Function to update focus time live
  const updateTaskFocusTime = (taskId: string, newFocusTime: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, focus_time: newFocusTime } : task
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Pomodoro Productivity App</h1>

      <div className="grid grid-cols-12 gap-6 w-full max-w-7xl">
        <div className="bg-gray-800 p-4 rounded col-span-8">
          <Notes />
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          {/* ✅ Ensure PomodoroTimer gets `updateTaskFocusTime` */}
          <div className="bg-gray-800 p-4 rounded">
            <PomodoroTimer selectedTask={selectedTask} updateTaskFocusTime={updateTaskFocusTime} />
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <TaskList onTaskSelect={setSelectedTask} onTaskAdd={(task) => setTasks([...tasks, task])} />
          </div>
        </div>
      </div>
    </div>
  );
}

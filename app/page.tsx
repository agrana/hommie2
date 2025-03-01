"use client";
import { useState, useEffect } from "react";
import type { Task } from "@/lib/types"; // ✅ Use `import type` to avoid conflicts
import PomodoroTimer from "@/components/PomodoroTimer";
import TaskList from "@/components/TaskList";
import Notes from "@/components/Notes"; // ✅ Add Notes.tsx

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ✅ Fix: Load tasks inside `useEffect` to prevent hydration issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      setTasks(savedTasks);
    }
  }, []);

  const addTask = (newTask: Task) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Pomodoro Productivity App</h1>

      <div className="grid grid-cols-12 gap-6 w-full max-w-7xl">
        {/* ✅ Fix: Include Notes component */}
        <div className="bg-gray-800 p-4 rounded col-span-8">
          <Notes />
        </div>

        {/* Pomodoro & Tasks Section */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Pomodoro Timer */}
          <div className="bg-gray-800 p-4 rounded">
            <PomodoroTimer selectedTask={selectedTask} />
          </div>

          {/* Task List (Pass both handlers) */}
          <div className="bg-gray-800 p-4 rounded">
            <TaskList onTaskSelect={(task: Task) => setSelectedTask(task)} onTaskAdd={addTask} /> 
          </div>
        </div>
      </div>
    </div>
  );
}

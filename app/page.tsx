"use client";
import { useState } from "react";
import type { Task } from "@/lib/types"; 
import PomodoroTimer from "@/components/PomodoroTimer";
import TaskList from "@/components/TaskList";
import Notes from "@/components/Notes"; 

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ✅ Function to handle adding a new task
  const addTask = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]); // ✅ Update local state with new task
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Pomodoro Productivity App</h1>

      <div className="grid grid-cols-12 gap-6 w-full max-w-7xl">
        <div className="bg-gray-800 p-4 rounded col-span-8">
          <Notes />
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded">
            <PomodoroTimer selectedTask={selectedTask} />
          </div>

          <div className="bg-gray-800 p-4 rounded">
            {/* ✅ Ensure both props are passed */}
            <TaskList onTaskSelect={setSelectedTask} onTaskAdd={addTask} /> 
          </div>
        </div>
      </div>
    </div>
  );
}

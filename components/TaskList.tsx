"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskAdd: (newTask: Task) => void;
  selectedTask: Task | null;
  isPomodoroRunning: boolean;
}

export default function TaskList({ onTaskSelect, onTaskAdd, selectedTask, isPomodoroRunning }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState(""); // ✅ Ensure task input is present

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

  // ✅ Update UI `focus_time` every second for the selected task
  useEffect(() => {
    if (!isPomodoroRunning || !selectedTask) return;

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? { ...task, focus_time: task.focus_time + 1 } // ✅ Increase `focus_time` every second
            : task
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPomodoroRunning, selectedTask]);

  // ✅ Function to format `focus_time`
  const formatFocusTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`; // ✅ Show seconds if < 1 min
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">📝 Tasks</h2>

      {/* ✅ Ensure the task input box is present */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          className="p-2 bg-gray-700 rounded w-full"
          placeholder="New task..."
        />
       <button 
    className="bg-blue-500 px-4 py-2 rounded" 
    onClick={async () => {
      if (!taskInput.trim()) return;
    
      try {
        const { data: insertData, error: insertError } = await supabase
          .from("tasks")
          .insert([
            {
              text: taskInput,
              completed: false,
              focus_time: 0,
            },
          ])
          .select();
    
        console.log("🧪 Insert result:", insertData, insertError);
    
        if (insertError) {
          console.error("❌ Supabase insert error:", insertError);
          return;
        }
    
        if (!Array.isArray(insertData) || insertData.length === 0) {
          console.warn("⚠️ Supabase insert returned no rows");
          return;
        }
    
        const savedTask = {
          ...insertData[0],
          seconds: 0,
        };
    
        setTasks((prev) => [savedTask, ...prev]);
        onTaskAdd(savedTask);
        setTaskInput("");
      } catch (err) {
        console.error("💥 Uncaught save error:", err);
      }
    }}
    >Add</button> 
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-2 flex items-center justify-between bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
            onClick={() => onTaskSelect(task)}
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={task.completed} className="cursor-pointer" />
              <span>{task.text}</span>
            </div>
            {/* ✅ Show formatted `focus_time` */}
            <span className="text-sm text-gray-300">
              ⏳ {formatFocusTime(task.focus_time)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

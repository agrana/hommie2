"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ✅ Import Supabase client
import type { Task } from "@/lib/types"; // ✅ Import the shared Task type

// ✅ Define correct props for TaskList
interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskAdd: (newTask: Task) => void; // ✅ Ensure onTaskAdd is included
}

export default function TaskList({ onTaskSelect, onTaskAdd }: TaskListProps) { // ✅ Corrected function props
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // ✅ Fetch tasks from Supabase on mount
  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (!error) setTasks(data || []);
    }
    fetchTasks();
  }, []);

  // ✅ Add a new task and update UI immediately
  const addTask = async () => {
    if (!taskInput.trim()) return;

    // Save to Supabase
    const { data, error } = await supabase.from("tasks").insert([{ text: taskInput }]).select().single();

    if (!error && data) {
      setTasks((prev) => [data, ...prev]); // ✅ Update the UI state instantly
      setTaskInput(""); // Clear input field
      onTaskAdd(data); // ✅ Notify the parent component about the new task
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">📝 Tasks</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          className="p-2 bg-gray-700 rounded w-full"
          placeholder="New task..."
        />
        <button className="bg-blue-500 px-4 py-2 rounded" onClick={addTask}>
          Add Task
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="p-2 rounded bg-gray-700 cursor-pointer hover:bg-gray-600" onClick={() => onTaskSelect(task)}>
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

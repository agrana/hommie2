"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskAdd: (newTask: Task) => void;
}

export default function TaskList({ onTaskSelect, onTaskAdd }: TaskListProps) {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // ✅ Fetch tasks from Supabase on mount
  useEffect(() => {
    const interval = setInterval(() => {
      async function fetchTasks() {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });
  
        if (!error) setTasks(data || []);
      }
      fetchTasks();
    }, 1000); // ✅ Refresh every second
    return () => clearInterval(interval);
  }, []);
  // ✅ Toggle task completion
  const toggleTaskCompletion = async (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };

    const { error } = await supabase
      .from("tasks")
      .update({ completed: updatedTask.completed })
      .eq("id", task.id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );
    }
  };

  // ✅ Add a new task and update UI immediately
  const addTask = async () => {
    if (!taskInput.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ text: taskInput, completed: false, focus_time: 0 }])
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [data, ...prev]); // ✅ Add task to the list instantly
      setTaskInput(""); // ✅ Clear input field
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
          <li
            key={task.id}
            className={`p-2 flex items-center justify-between bg-gray-700 rounded cursor-pointer hover:bg-gray-600 ${
              task.completed ? "line-through text-gray-400" : ""
            }`}
            onClick={() => {
              console.log("Task Selected:", task); // ✅ Debugging log
              onTaskSelect(task); // ✅ Ensure clicking anywhere selects the task
            }}
          >
            <div className="flex items-center gap-2">
              {/* ✅ Checkbox to mark completion */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation(); // ✅ Prevents checkbox from also selecting task
                  toggleTaskCompletion(task);
                }}
                className="cursor-pointer"
              />
              {/* ✅ Text will still be strikethrough if completed */}
              <span>{task.text}</span>
            </div>
            {/* ✅ Show total Pomodoro time spent */}
            <span className="text-sm text-gray-300">
              ⏳ {task.focus_time} min
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
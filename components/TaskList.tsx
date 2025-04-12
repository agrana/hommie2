"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskAdd: (newTask: Task) => void;
  selectedTask: Task | null;
  isPomodoroRunning: boolean;
}

export default function TaskList({
  onTaskSelect,
  onTaskAdd,
  selectedTask,
  isPomodoroRunning,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("deleted", false) // Only fetch non-deleted tasks
        .order("created_at", { ascending: false });

      if (!error) setTasks(data || []);
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!isPomodoroRunning || !selectedTask) return;

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? { ...task, focus_time: task.focus_time + 1 }
            : task
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPomodoroRunning, selectedTask]);

  const formatFocusTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
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
                    deleted: false,
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
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-2 flex items-center justify-between bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
          >
            <div
              className="flex items-center gap-2"
              onClick={() => onTaskSelect(task)}
            >
              <input
                type="checkbox"
                checked={task.completed}
                className="cursor-pointer"
                readOnly
              />
              <span>{task.text}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">
                ⏳ {formatFocusTime(task.focus_time)}
              </span>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const { error } = await supabase
                    .from("tasks")
                    .update({ deleted: true })
                    .eq("id", task.id);

                  if (error) {
                    console.error("🗑️ Error deleting task:", error);
                    return;
                  }

                  setTasks((prev) => prev.filter((t) => t.id !== task.id));
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

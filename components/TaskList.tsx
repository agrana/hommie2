"use client";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TaskList({ onTaskSelect }: { onTaskSelect: (task: Task) => void }) {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(savedTasks);
  }, []);

  const addTask = () => {
    if (!taskInput.trim()) return;

    const newTask: Task = { id: Date.now(), text: taskInput, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTaskInput("");
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
            className={`p-2 rounded cursor-pointer ${task.completed ? "line-through text-gray-500" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => onTaskSelect(task)} // 👈 Calls the function when a task is clicked
          >
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

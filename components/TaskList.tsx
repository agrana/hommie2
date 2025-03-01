"use client";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskAdd: (task: Task) => void;
}

export default function TaskList({ onTaskSelect, onTaskAdd }: TaskListProps) {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load saved tasks on mount
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(savedTasks);
  }, []);

  // Function to add a new task
  const addTask = () => {
    if (!taskInput.trim()) return;

    const newTask: Task = { id: Date.now(), text: taskInput, completed: false };
    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    onTaskAdd(newTask); // Notify parent component that a task was added
    setTaskInput(""); // Clear input
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">📝 Tasks</h2>

      {/* Task Input Field */}
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

      {/* Task List */}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-2 rounded bg-gray-700 cursor-pointer hover:bg-gray-600"
            onClick={() => onTaskSelect(task)} // ✅ Allow task selection for Pomodoro
          >
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

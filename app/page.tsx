import { useState } from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import TaskList from "@/components/TaskList";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("tasks") || "[]");
    }
    return [];
  });

  const addTask = (newTask: Task) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Pomodoro Productivity App</h1>

      <div className="grid grid-cols-12 gap-6 w-full max-w-7xl">
        {/* Notes Section */}
        <div className="bg-gray-800 p-4 rounded col-span-8">Notes Placeholder</div>

        {/* Pomodoro & Tasks Section */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* ✅ Pass `selectedTask` to PomodoroTimer */}
          <div className="bg-gray-800 p-4 rounded">
            <PomodoroTimer selectedTask={selectedTask} />
          </div>

          {/* ✅ Allow TaskList to update selectedTask */}
          <div className="bg-gray-800 p-4 rounded">
            <TaskList onTaskSelect={setSelectedTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

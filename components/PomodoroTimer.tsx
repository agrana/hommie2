import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

interface PomodoroTimerProps {
  selectedTask: Task | null;
  updateTaskFocusTime: (taskId: string, newFocusTime: number) => void;
}

export default function PomodoroTimer({ selectedTask, updateTaskFocusTime }: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // ✅ Load saved timer state from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem("pomodoroTimeRemaining");
    const savedRunningState = localStorage.getItem("pomodoroIsRunning");
    const savedLastUpdate = localStorage.getItem("pomodoroLastUpdated");

    if (savedTime && savedRunningState && savedLastUpdate) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedLastUpdate)) / 1000);
      const adjustedTime = Math.max(parseInt(savedTime) - elapsedTime, 0);
      setTimeRemaining(adjustedTime);
      setIsRunning(savedRunningState === "true");
    }
  }, []);

  // ✅ Save timer state when changes occur
  useEffect(() => {
    localStorage.setItem("pomodoroTimeRemaining", String(timeRemaining));
    localStorage.setItem("pomodoroIsRunning", String(isRunning));
    localStorage.setItem("pomodoroLastUpdated", String(Date.now()));
  }, [timeRemaining, isRunning]);

  // ✅ Track time in the background
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let focusUpdateInterval: NodeJS.Timeout;

    if (isRunning && selectedTask) {
      const updateTime = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        if (elapsedSeconds > 0) {
          setTimeRemaining((prev) => Math.max(prev - elapsedSeconds, 0));
          setLastUpdate(now);
        }
      };

      // ✅ Update the timer every second
      timer = setInterval(updateTime, 1000);

      // ✅ Update `focus_time` in Supabase every second
      focusUpdateInterval = setInterval(() => {
        updateFocusTime(selectedTask, 1);
      }, 1000);

      // ✅ Handle when the tab becomes hidden or active
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateTime(); // ✅ Compensate for time lost while tab was hidden
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(timer);
        clearInterval(focusUpdateInterval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isRunning, selectedTask, lastUpdate]);

  const updateFocusTime = async (task: Task, seconds: number) => {
    const newFocusTime = task.focus_time + Math.floor(seconds / 60); // ✅ Convert seconds to minutes

    const { error } = await supabase
      .from("tasks")
      .update({ focus_time: newFocusTime })
      .eq("id", task.id);

    if (!error) {
      updateTaskFocusTime(task.id, newFocusTime); // ✅ Update UI in TaskList
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">⏳ Pomodoro Timer</h2>
      <p>
        <strong>Current Task:</strong> {selectedTask ? selectedTask.text : "❗ Select a task before starting Pomodoro"}
      </p>
      <p className="text-2xl font-bold">
        {String(Math.floor(timeRemaining / 3600)).padStart(2, "0")}:
        {String(Math.floor((timeRemaining % 3600) / 60)).padStart(2, "0")}:
        {String(timeRemaining % 60).padStart(2, "0")}
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (selectedTask) {
              setIsRunning(true);
              setLastUpdate(Date.now());
            } else {
              alert("❗ Please select a task first!");
            }
          }} 
          className={`px-4 py-2 rounded ${selectedTask ? "bg-green-500" : "bg-gray-500 cursor-not-allowed"}`}
          disabled={!selectedTask}
        >
          Start
        </button>
        <button onClick={() => setIsRunning(false)} className="bg-yellow-500 px-4 py-2 rounded">Pause</button>
        <button 
          onClick={() => {
            setTimeRemaining(25 * 60);
            setIsRunning(false);
            localStorage.removeItem("pomodoroTimeRemaining");
            localStorage.removeItem("pomodoroIsRunning");
            localStorage.removeItem("pomodoroLastUpdated");
          }} 
          className="bg-red-500 px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

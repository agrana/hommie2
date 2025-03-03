import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

interface PomodoroTimerProps {
  selectedTask: Task | null;
}

export default function PomodoroTimer({ selectedTask }: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25-minute Pomodoro
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let focusUpdateInterval: NodeJS.Timeout;

    if (isRunning && selectedTask) {
      // ✅ Decrease time every second
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(focusUpdateInterval);
            return 25 * 60; // Reset Pomodoro
          }
          return prev - 1;
        });
      }, 1000);

      // ✅ Update focus_time in Supabase every minute
      focusUpdateInterval = setInterval(() => {
        console.log(`⏳ Adding 1 minute to ${selectedTask.text}`);
        updateFocusTime(selectedTask, 1);
      }, 60 * 1000); // Every 60 seconds
    }

    return () => {
      clearInterval(timer);
      clearInterval(focusUpdateInterval); // ✅ Ensure cleanup when timer stops
    };
  }, [isRunning, selectedTask]);

  const updateFocusTime = async (task: Task, minutes: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ focus_time: task.focus_time + minutes })
      .eq("id", task.id);

    if (!error) {
      console.log(`✅ Focus time updated: ${task.text} +${minutes} min`);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">⏳ Pomodoro Timer</h2>
      <p>
        <strong>Current Task:</strong> {selectedTask ? selectedTask.text : "❗ Select a task before starting Pomodoro"}
      </p>
      <p className="text-2xl font-bold">{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}</p>
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (selectedTask) {
              setIsRunning(true);
            } else {
              alert("❗ Please select a task first!");
            }
          }} 
          className={`px-4 py-2 rounded ${selectedTask ? "bg-green-500" : "bg-gray-500 cursor-not-allowed"}`}
          disabled={!selectedTask} // ✅ Prevents starting without a task
        >
          Start
        </button>
        <button onClick={() => setIsRunning(false)} className="bg-yellow-500 px-4 py-2 rounded">Pause</button>
        <button 
          onClick={() => {
            setTimeRemaining(25 * 60);
            setIsRunning(false);
          }} 
          className="bg-red-500 px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

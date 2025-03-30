import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

interface PomodoroTimerProps {
  selectedTask: Task | null;
  updateTaskFocusTime: (taskId: string, newFocusTime: number) => void;
  setIsPomodoroRunning: (running: boolean) => void;
}


export default function PomodoroTimer({ selectedTask, updateTaskFocusTime }: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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
  

  useEffect(() => {
    localStorage.setItem("pomodoroTimeRemaining", String(timeRemaining));
    localStorage.setItem("pomodoroIsRunning", String(isRunning));
    localStorage.setItem("pomodoroLastUpdated", String(Date.now()));
  }, [timeRemaining, isRunning]);
  // ✅ Track time in the background
  useEffect(() => {
    let timer: NodeJS.Timeout;
  
    if (isRunning && selectedTask) {
      const updateTime = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
  
        if (elapsedSeconds > 0) {
          setTimeRemaining((prev) => {
            const newTime = Math.max(prev - elapsedSeconds, 0);
  
            if (newTime === 0) {
              setIsRunning(false);
              alert("🍅 Time's up! Take a break.");
              return 25 * 60; // 🔁 Reset after completion
            }

            updateFocusTime(selectedTask, elapsedSeconds);
            setLastUpdate(now);
            return newTime;
          });
        }
      };
  
      timer = setInterval(updateTime, 1000);
  
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateTime();
        }
      };
  
      document.addEventListener("visibilitychange", handleVisibilityChange);
  
      return () => {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isRunning, selectedTask, lastUpdate]);
  
  
  const updateFocusTime = async (task: Task, seconds: number) => {
    console.log(`🔄 Attempting to increment focus_time for "${task.text}" by ${seconds}s in Supabase`);
  
    const { data, error } = await supabase.rpc("increment_focus_time", {
      inc_value: seconds,
      task_id: task.id,
    });
  
    if (error) {
      console.error("❌ Supabase Update Error:", error);
    } else {
      console.log(`✅ Supabase Updated: Task "${task.text}" focus_time incremented by ${seconds}s.`);
    }
    };
  return (
    <div>
      <h2 className="text-lg font-semibold">⏳ Task Timer</h2>
      <p>
        <strong>Current Task:</strong> {selectedTask ? selectedTask.text : "❗ Select a task before starting Pomodoro"}
      </p>
      <p className="text-2xl font-bold">
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

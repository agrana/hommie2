"use client";
import { useState, useEffect } from "react";
import type { Task } from "@/lib/types"; // ✅ Use the shared Task type

interface PomodoroTimerProps {
  selectedTask: Task | null;
}

export default function PomodoroTimer({ selectedTask }: { selectedTask: Task | null }) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const startPomodoro = () => {
    if (!selectedTask) {
      alert("Please select a task before starting a Pomodoro!");
      return;
    }
    setIsRunning(true);
  };

  if (!hydrated) return null;

  return (
    <div className="bg-gray-800 p-4 rounded w-full">
      <h2 className="text-lg font-semibold mb-2">⏳ Pomodoro Timer</h2>
      {selectedTask ? (
        <p className="text-md mb-2">📌 Current Task: <strong>{selectedTask.text}</strong></p>
      ) : (
        <p className="text-gray-400 mb-2">Select a task to start a Pomodoro</p>
      )}
      <div className="text-5xl font-mono mb-4">{`${Math.floor(timeRemaining / 60)}:${String(
        timeRemaining % 60
      ).padStart(2, "0")}`}</div>
      <div className="flex space-x-2">
        <button className="bg-green-500 px-4 py-2 rounded" onClick={startPomodoro}>
          Start
        </button>
        <button className="bg-yellow-500 px-4 py-2 rounded" onClick={() => setIsRunning(false)}>
          Pause
        </button>
        <button
          className="bg-red-500 px-4 py-2 rounded"
          onClick={() => {
            setIsRunning(false);
            setTimeRemaining(25 * 60);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
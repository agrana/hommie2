import PomodoroTimer from "@/components/PomodoroTimer";
import Notes from "@/components/Notes";
import TaskList from "@/components/TaskList";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">🚀 Pomodoro Productivity App</h1>

      <div className="grid grid-cols-12 gap-6 w-full max-w-7xl">
        {/* Notes Section (Takes the entire left side) */}
        <div className="bg-gray-800 p-4 rounded col-span-8">
          <Notes />
        </div>

        {/* Pomodoro & Tasks Section (Right side) */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Pomodoro Timer (Top) */}
          <div className="bg-gray-800 p-4 rounded">
            <PomodoroTimer />
          </div>

          {/* Tasks (Below Pomodoro) */}
          <div className="bg-gray-800 p-4 rounded">
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
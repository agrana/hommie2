export interface Task {
    id: string;
    text: string;
    completed: boolean;
    focus_time: number;
    seconds: number;
  }
export {}; // ✅ Ensures TypeScript recognizes this as a module
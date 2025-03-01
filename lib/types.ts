export interface Task {
    id: string; // ✅ Ensure it's a string (UUID from Supabase)
    text: string;
    completed: boolean;
  }
export {}; // ✅ Ensures TypeScript recognizes this as a module
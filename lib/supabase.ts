import { createClient } from "@supabase/supabase-js";

// ✅ Load environment variables from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

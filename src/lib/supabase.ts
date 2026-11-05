import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://apmwlxbdhfjbrdymvfsp.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_dZSUHhNzPSre-QnuhLQJGg_Wh0z0b8D";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

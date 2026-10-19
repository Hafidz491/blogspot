import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zcliqmlgfcppudvpsinn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_F9bRzQOtBfajhouiutrKXg_lsrU6o4p";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing in environment variables.");
}

/**
 * Standard Supabase client for client-side and server-side operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Storage bucket name for blog media & thumbnails
 */
export const STORAGE_BUCKET = "blog-media";

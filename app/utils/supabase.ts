import { createClient } from "@supabase/supabase-js";

// Mengambil URL dan Key dari environment variables
// Jika di browser (client-side), Remix menggunakan prefix VITE_
const supabaseUrl = typeof window !== "undefined" 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL;
  
const supabaseAnonKey = typeof window !== "undefined" 
  ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
  : process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fallback kosong untuk mencegah error saat proses build, 
// pastikan .env memiliki nilai yang benar
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

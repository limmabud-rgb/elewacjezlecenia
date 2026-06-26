import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Nie wywalamy build-u (Next potrzebuje to zaimportować nawet bez .env),
  // ale ostrzegamy głośno w konsoli przeglądarki / serwera.
  console.warn(
    "[Supabase] Brak NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w zmiennych środowiskowych."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

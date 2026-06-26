import { createClient } from "@supabase/supabase-js";

const TRZYDZIESC_DNI_MS = 1000 * 60 * 60 * 24 * 30;

/** Sprawdza, czy token JWT z Supabase jest poprawny i nie wygasł. */
export async function tokenJestPoprawny(token: string | undefined): Promise<boolean> {
if (!token) return false;

try {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL as string,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const { data: { user }, error } = await supabase.auth.getUser(token);
return !error && !!user;
} catch {
return false;
}
}

/** Zostawione dla kompatybilności — nie używane przy Supabase Auth. */
export async function stworzTokenSesji(): Promise<string> {
return "";
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CIASTECZKO = "crm_sesja";
const TRZYDZIESC_DNI = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
const { email, haslo } = await request.json();

if (!email || !haslo) {
return NextResponse.json(
{ ok: false, blad: "Podaj email i hasło." },
{ status: 400 }
);
}

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL as string,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const { data, error } = await supabase.auth.signInWithPassword({
email,
password: haslo,
});

if (error || !data.session) {
return NextResponse.json(
{ ok: false, blad: "Nieprawidłowy email lub hasło." },
{ status: 401 }
);
}

const odpowiedz = NextResponse.json({ ok: true });
odpowiedz.cookies.set(CIASTECZKO, data.session.access_token, {
httpOnly: true,
secure: true,
sameSite: "lax",
path: "/",
maxAge: TRZYDZIESC_DNI,
});
return odpowiedz;
}

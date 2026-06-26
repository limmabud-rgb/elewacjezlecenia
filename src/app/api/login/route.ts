import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stworzTokenSesji } from "@/lib/sesja";

const CIASTECZKO = "crm_sesja";
const TRZYDZIESC_DNI = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  const { haslo } = await request.json();

  if (typeof haslo !== "string" || !haslo) {
    return NextResponse.json(
      { ok: false, blad: "Podaj hasło." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data: poprawne, error } = await supabase.rpc("sprawdz_haslo", {
    podane_haslo: haslo,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, blad: "Błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }

  if (!poprawne) {
    return NextResponse.json(
      { ok: false, blad: "Nieprawidłowe hasło." },
      { status: 401 }
    );
  }

  const token = await stworzTokenSesji();
  const odpowiedz = NextResponse.json({ ok: true });
  odpowiedz.cookies.set(CIASTECZKO, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: TRZYDZIESC_DNI,
  });
  return odpowiedz;
}

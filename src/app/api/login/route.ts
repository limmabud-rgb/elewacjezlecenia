import { NextRequest, NextResponse } from "next/server";

const CIASTECZKO = "crm_auth";
const TRZYDZIESC_DNI = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  const { haslo } = await request.json();
  const prawidloweHaslo = process.env.APP_PASSWORD;

  if (!prawidloweHaslo) {
    // Brak skonfigurowanego hasła po stronie serwera — nie blokujemy.
    return NextResponse.json({ ok: true });
  }

  if (haslo !== prawidloweHaslo) {
    return NextResponse.json(
      { ok: false, blad: "Nieprawidłowe hasło." },
      { status: 401 }
    );
  }

  const odpowiedz = NextResponse.json({ ok: true });
  odpowiedz.cookies.set(CIASTECZKO, prawidloweHaslo, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: TRZYDZIESC_DNI,
  });
  return odpowiedz;
}

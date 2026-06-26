import { NextRequest, NextResponse } from "next/server";

/**
 * Prosta ochrona hasłem dla całej aplikacji.
 *
 * Działanie: jeśli przeglądarka nie ma ciasteczka "crm_auth" z poprawną
 * wartością, każde żądanie (oprócz strony logowania i jej API) jest
 * przekierowywane na /login. Po wpisaniu poprawnego hasła ciasteczko
 * jest ustawiane na 30 dni, więc nie trzeba logować się przy każdej wizycie.
 *
 * Hasło NIE jest zapisane w kodzie — pochodzi ze zmiennej środowiskowej
 * APP_PASSWORD (ustawianej w Vercel → Settings → Environment Variables).
 */

const CIASTECZKO = "crm_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strona logowania i jej endpoint API muszą być zawsze dostępne,
  // inaczej nie da się wpisać hasła.
  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  // Pliki statyczne Next.js (CSS, JS, obrazy) — przepuszczamy,
  // żeby strona logowania mogła się poprawnie wyświetlić.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const haslo = process.env.APP_PASSWORD;

  // Jeśli administrator nie ustawił hasła, nie blokujemy aplikacji —
  // (bezpieczniejsze byłoby zablokować, ale wtedy ktoś, kto zapomni
  // ustawić zmienną środowiskową, zablokowałby sam siebie ze swojej apki).
  if (!haslo) {
    return NextResponse.next();
  }

  const ciasteczko = request.cookies.get(CIASTECZKO)?.value;

  if (ciasteczko === haslo) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki oprócz plików statycznych Next.js,
     * żeby middleware nie blokował obrazów, czcionek itd.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";
import { tokenJestPoprawny } from "@/lib/sesja";

/**
 * Ochrona hasłem dla całej aplikacji.
 *
 * Hasło samo jest sprawdzane (i może być zmieniane) w Supabase — patrz
 * supabase/schema.sql (tabela app_auth, funkcje sprawdz_haslo i
 * zmien_haslo). Middleware nie zna hasła — sprawdza tylko, czy
 * przeglądarka ma podpisany token sesji wystawiony po udanym
 * zalogowaniu (patrz src/lib/sesja.ts).
 */

const CIASTECZKO = "crm_sesja";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strona logowania i jej endpointy API muszą być zawsze dostępne,
  // inaczej nie da się wpisać hasła ani go zmienić.
  if (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname === "/api/zmien-haslo"
  ) {
    return NextResponse.next();
  }

  // Pliki statyczne Next.js (CSS, JS, obrazy) — przepuszczamy,
  // żeby strona logowania mogła się poprawnie wyświetlić.
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(CIASTECZKO)?.value;

  if (await tokenJestPoprawny(token)) {
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

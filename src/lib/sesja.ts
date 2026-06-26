/**
 * Podpisany token sesji ("ciasteczko logowania").
 *
 * Po sprawdzeniu hasła w Supabase serwer nie zapisuje samego hasła
 * w ciasteczku — zamiast tego wystawia token z datą wygaśnięcia,
 * podpisany kluczem SESSION_SECRET (HMAC-SHA256). Middleware przy
 * każdym żądaniu weryfikuje tylko podpis, bez pytania bazy danych —
 * dzięki temu działa szybko i offline względem Supabase.
 *
 * Token nie jest tajny w sensie hasła — to tylko dowód "ktoś się
 * zalogował poprawnie przed datą X". Nawet jeśli ktoś go przechwyci,
 * nie dowie się z niego hasła do aplikacji.
 */

function pobierzSekret(): string {
  const sekret = process.env.SESSION_SECRET;
  if (!sekret) {
    throw new Error(
      "Brak zmiennej środowiskowej SESSION_SECRET. Ustaw ją w Vercel → Settings → Environment Variables (dowolny losowy ciąg znaków, np. 32+ losowych liter i cyfr)."
    );
  }
  return sekret;
}

function bajtyNaBase64Url(bajty: ArrayBuffer): string {
  const tablica = new Uint8Array(bajty);
  let binarny = "";
  for (let i = 0; i < tablica.length; i++) {
    binarny += String.fromCharCode(tablica[i]);
  }
  // btoa jest dostępne w Edge Runtime (jest to globalna funkcja webowa).
  return btoa(binarny)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function podpisz(dane: string): Promise<string> {
  const sekret = pobierzSekret();
  const klucz = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sekret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const podpis = await crypto.subtle.sign(
    "HMAC",
    klucz,
    new TextEncoder().encode(dane)
  );
  return bajtyNaBase64Url(podpis);
}

const TRZYDZIESC_DNI_MS = 1000 * 60 * 60 * 24 * 30;

/** Tworzy nowy token sesji ważny 30 dni od teraz. */
export async function stworzTokenSesji(): Promise<string> {
  const wygasa = Date.now() + TRZYDZIESC_DNI_MS;
  const podpis = await podpisz(String(wygasa));
  return `${wygasa}.${podpis}`;
}

/** Sprawdza, czy token jest poprawnie podpisany i jeszcze nie wygasł. */
export async function tokenJestPoprawny(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [wygasaStr, podpis] = token.split(".");
  if (!wygasaStr || !podpis) return false;

  const wygasa = Number(wygasaStr);
  if (!Number.isFinite(wygasa) || wygasa < Date.now()) return false;

  const oczekiwanyPodpis = await podpisz(wygasaStr);
  return oczekiwanyPodpis === podpis;
}

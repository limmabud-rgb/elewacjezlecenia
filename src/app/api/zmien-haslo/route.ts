import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { stareHaslo, noweHaslo } = await request.json();

  if (typeof stareHaslo !== "string" || !stareHaslo) {
    return NextResponse.json(
      { ok: false, blad: "Podaj aktualne hasło." },
      { status: 400 }
    );
  }

  if (typeof noweHaslo !== "string" || noweHaslo.trim().length < 4) {
    return NextResponse.json(
      { ok: false, blad: "Nowe hasło musi mieć co najmniej 4 znaki." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data: udalo, error } = await supabase.rpc("zmien_haslo", {
    stare_haslo: stareHaslo,
    nowe_haslo: noweHaslo,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, blad: "Błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }

  if (!udalo) {
    return NextResponse.json(
      { ok: false, blad: "Aktualne hasło jest nieprawidłowe." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EtapKey, StatusRealizacji, Zlecenie, ZlecenieDraft } from "@/lib/types";
import KartaZlecenia from "@/components/KartaZlecenia";
import FormularzZlecenia from "@/components/FormularzZlecenia";

type Filtr = "wszystkie" | "w_trakcie" | "zrealizowana";

export default function StronaGlowna() {
  const [zlecenia, setZlecenia] = useState<Zlecenie[]>([]);
  const [wczytywanie, setWczytywanie] = useState(true);
  const [bladPolaczenia, setBladPolaczenia] = useState<string | null>(null);

  const [szukaj, setSzukaj] = useState("");
  const [filtr, setFiltr] = useState<Filtr>("wszystkie");

  const [edytowane, setEdytowane] = useState<Zlecenie | null>(null);
  const [formularzOtwarty, setFormularzOtwarty] = useState(false);

  // ---------- Pobieranie danych ----------
  const pobierzZlecenia = useCallback(async () => {
    const { data, error } = await supabase
      .from("zlecenia")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setBladPolaczenia(
        "Nie udało się połączyć z bazą danych. Sprawdź konfigurację Supabase w zmiennych środowiskowych."
      );
      console.error(error);
    } else {
      setBladPolaczenia(null);
      setZlecenia(data as Zlecenie[]);
    }
    setWczytywanie(false);
  }, []);

  useEffect(() => {
    pobierzZlecenia();

    // Realtime — zmiany na innym urządzeniu odświeżają listę automatycznie
    const channel = supabase
      .channel("zlecenia-zmiany")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zlecenia" },
        () => {
          pobierzZlecenia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pobierzZlecenia]);

  // ---------- Akcje CRUD ----------
  async function zapiszNowe(dane: ZlecenieDraft) {
    const { error } = await supabase.from("zlecenia").insert(dane);
    if (error) throw error;
    setFormularzOtwarty(false);
    pobierzZlecenia();
  }

  async function zapiszEdycje(dane: ZlecenieDraft) {
    if (!edytowane) return;
    const { error } = await supabase
      .from("zlecenia")
      .update(dane)
      .eq("id", edytowane.id);
    if (error) throw error;
    setEdytowane(null);
    pobierzZlecenia();
  }

  async function usunZlecenie() {
    if (!edytowane) return;
    const { error } = await supabase
      .from("zlecenia")
      .delete()
      .eq("id", edytowane.id);
    if (error) throw error;
    setEdytowane(null);
    pobierzZlecenia();
  }

  async function przelaczEtap(zlecenie: Zlecenie, klucz: EtapKey) {
    const nowaWartosc = !zlecenie[klucz];
    // optymistyczna aktualizacja UI
    setZlecenia((prev) =>
      prev.map((z) => (z.id === zlecenie.id ? { ...z, [klucz]: nowaWartosc } : z))
    );
    const { error } = await supabase
      .from("zlecenia")
      .update({ [klucz]: nowaWartosc })
      .eq("id", zlecenie.id);
    if (error) {
      console.error(error);
      pobierzZlecenia(); // wycofaj w razie błędu
    }
  }

  async function przelaczStatusRealizacji(zlecenie: Zlecenie) {
    const nowyStatus: StatusRealizacji =
      zlecenie.status_realizacji === "zrealizowana" ? "w_trakcie" : "zrealizowana";
    setZlecenia((prev) =>
      prev.map((z) =>
        z.id === zlecenie.id ? { ...z, status_realizacji: nowyStatus } : z
      )
    );
    const { error } = await supabase
      .from("zlecenia")
      .update({ status_realizacji: nowyStatus })
      .eq("id", zlecenie.id);
    if (error) {
      console.error(error);
      pobierzZlecenia();
    }
  }

  // ---------- Filtrowanie i statystyki ----------
  const przefiltrowane = useMemo(() => {
    let wynik = zlecenia;
    if (filtr !== "wszystkie") {
      wynik = wynik.filter((z) => z.status_realizacji === filtr);
    }
    if (szukaj.trim()) {
      const s = szukaj.trim().toLowerCase();
      wynik = wynik.filter(
        (z) =>
          z.imie_nazwisko.toLowerCase().includes(s) ||
          (z.adres ?? "").toLowerCase().includes(s) ||
          (z.telefon ?? "").toLowerCase().includes(s)
      );
    }
    return wynik;
  }, [zlecenia, filtr, szukaj]);

  const liczbaWTrakcie = zlecenia.filter(
    (z) => z.status_realizacji === "w_trakcie"
  ).length;
  const liczbaZrealizowanych = zlecenia.filter(
    (z) => z.status_realizacji === "zrealizowana"
  ).length;

  return (
    <main className="strona">
      <header className="naglowek">
        <div className="naglowek__marka">
          <img src="/logo.png" alt="ModernFas" className="naglowek__logo" />
          <div className="naglowek__tytul">
            <span className="naglowek__eyebrow">ModernFas · Zarządzanie zleceniami</span>
            <h1>Lista klientów</h1>
          </div>
        </div>
        <button
          type="button"
          className="btn-nowe"
          onClick={() => setFormularzOtwarty(true)}
        >
          + Nowe zlecenie
        </button>
      </header>

      <section className="statystyki">
        <div className="staty-kafel">
          <span className="staty-kafel__liczba">{zlecenia.length}</span>
          <span className="staty-kafel__etykieta">Wszystkie zlecenia</span>
        </div>
        <div className="staty-kafel staty-kafel--bursztyn">
          <span className="staty-kafel__liczba">{liczbaWTrakcie}</span>
          <span className="staty-kafel__etykieta">W trakcie</span>
        </div>
        <div className="staty-kafel staty-kafel--zielony">
          <span className="staty-kafel__liczba">{liczbaZrealizowanych}</span>
          <span className="staty-kafel__etykieta">Zrealizowane</span>
        </div>
      </section>

      <section className="kontrolki">
        <input
          type="search"
          placeholder="Szukaj po nazwisku, adresie lub telefonie…"
          value={szukaj}
          onChange={(e) => setSzukaj(e.target.value)}
          className="szukaj"
        />
        <div className="filtry" role="group" aria-label="Filtruj po statusie">
          <button
            className={filtr === "wszystkie" ? "filtr filtr--aktywny" : "filtr"}
            onClick={() => setFiltr("wszystkie")}
          >
            Wszystkie
          </button>
          <button
            className={filtr === "w_trakcie" ? "filtr filtr--aktywny" : "filtr"}
            onClick={() => setFiltr("w_trakcie")}
          >
            W trakcie
          </button>
          <button
            className={filtr === "zrealizowana" ? "filtr filtr--aktywny" : "filtr"}
            onClick={() => setFiltr("zrealizowana")}
          >
            Zrealizowane
          </button>
        </div>
      </section>

      {bladPolaczenia && <div className="alert">{bladPolaczenia}</div>}

      {wczytywanie && !bladPolaczenia && (
        <p className="status-tekst">Wczytywanie zleceń…</p>
      )}

      {!wczytywanie && !bladPolaczenia && przefiltrowane.length === 0 && (
        <div className="pusto">
          {zlecenia.length === 0 ? (
            <>
              <p className="pusto__tytul">Brak zleceń.</p>
              <p>Dodaj pierwszego klienta, żeby zacząć śledzić postęp prac.</p>
            </>
          ) : (
            <p className="pusto__tytul">Nic nie znaleziono dla tych filtrów.</p>
          )}
        </div>
      )}

      <section className="lista">
        {przefiltrowane.map((zlecenie) => (
          <KartaZlecenia
            key={zlecenie.id}
            zlecenie={zlecenie}
            onEdytuj={() => setEdytowane(zlecenie)}
            onToggleEtap={(klucz) => przelaczEtap(zlecenie, klucz)}
            onToggleStatus={() => przelaczStatusRealizacji(zlecenie)}
          />
        ))}
      </section>

      {formularzOtwarty && (
        <FormularzZlecenia
          zlecenie={null}
          onZapisz={zapiszNowe}
          onZamknij={() => setFormularzOtwarty(false)}
        />
      )}

      {edytowane && (
        <FormularzZlecenia
          zlecenie={edytowane}
          onZapisz={zapiszEdycje}
          onUsun={usunZlecenie}
          onZamknij={() => setEdytowane(null)}
        />
      )}

      <style jsx>{`
        .strona {
          max-width: 880px;
          margin: 0 auto;
          padding: 28px 20px 80px;
        }

        .naglowek {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .naglowek__marka {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .naglowek__logo {
          width: 48px;
          height: 48px;
          border-radius: var(--radius);
          background: var(--grafit);
          padding: 6px;
          flex-shrink: 0;
          object-fit: contain;
        }

        .naglowek__eyebrow {
          font-family: var(--font-mono);
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--cegla);
          font-weight: 600;
        }

        .naglowek__tytul h1 {
          font-family: var(--font-display);
          font-size: 30px;
          margin: 4px 0 0;
          color: var(--grafit);
        }

        .btn-nowe {
          background: var(--grafit);
          color: var(--bialy);
          border: none;
          border-radius: var(--radius);
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
        }

        .btn-nowe:hover {
          background: var(--cegla);
        }

        .statystyki {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 22px;
        }

        .staty-kafel {
          background: var(--bialy);
          border: 1px solid var(--beton);
          border-left: 4px solid var(--grafit);
          border-radius: var(--radius);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .staty-kafel--bursztyn {
          border-left-color: var(--bursztyn);
        }

        .staty-kafel--zielony {
          border-left-color: var(--zielen);
        }

        .staty-kafel__liczba {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          color: var(--grafit);
          line-height: 1.1;
        }

        .staty-kafel__etykieta {
          font-size: 12px;
          color: var(--grafit-2);
        }

        .kontrolki {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .szukaj {
          flex: 1;
          min-width: 200px;
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          padding: 10px 12px;
          font-size: 14px;
          background: var(--bialy);
          color: var(--grafit);
        }

        .szukaj:focus {
          border-color: var(--cegla);
        }

        .filtry {
          display: flex;
          gap: 6px;
        }

        .filtr {
          border: 1px solid var(--beton);
          background: var(--bialy);
          border-radius: var(--radius);
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 600;
          color: var(--grafit-2);
          cursor: pointer;
          white-space: nowrap;
        }

        .filtr:hover {
          border-color: var(--grafit-2);
        }

        .filtr--aktywny {
          background: var(--grafit);
          border-color: var(--grafit);
          color: var(--bialy);
        }

        .alert {
          background: #f4e4e0;
          border: 1px solid var(--czerwien);
          color: var(--czerwien);
          border-radius: var(--radius);
          padding: 12px 14px;
          font-size: 13.5px;
          margin-bottom: 20px;
        }

        .status-tekst {
          color: var(--grafit-2);
          font-size: 14px;
        }

        .pusto {
          background: var(--tynk-ciemny);
          border: 1px dashed var(--beton);
          border-radius: var(--radius);
          padding: 32px 20px;
          text-align: center;
          color: var(--grafit-2);
        }

        .pusto__tytul {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: var(--grafit);
          margin: 0 0 6px;
        }

        .pusto p {
          margin: 0;
          font-size: 14px;
        }

        .lista {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 560px) {
          .statystyki {
            grid-template-columns: 1fr 1fr;
          }
          .staty-kafel:first-child {
            grid-column: 1 / -1;
          }
          .naglowek__tytul h1 {
            font-size: 24px;
          }
          .naglowek__logo {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </main>
  );
}

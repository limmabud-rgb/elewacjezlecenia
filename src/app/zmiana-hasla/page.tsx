"use client";

import { useState } from "react";
import Link from "next/link";

export default function StronaZmianyHasla() {
  const [stareHaslo, setStareHaslo] = useState("");
  const [noweHaslo, setNoweHaslo] = useState("");
  const [powtorzHaslo, setPowtorzHaslo] = useState("");

  const [blad, setBlad] = useState<string | null>(null);
  const [sukces, setSukces] = useState(false);
  const [wysylanie, setWysylanie] = useState(false);

  async function obsluzWyslanie(e: React.FormEvent) {
    e.preventDefault();
    setBlad(null);

    if (noweHaslo !== powtorzHaslo) {
      setBlad("Nowe hasła nie są identyczne.");
      return;
    }
    if (noweHaslo.trim().length < 4) {
      setBlad("Nowe hasło musi mieć co najmniej 4 znaki.");
      return;
    }

    setWysylanie(true);
    try {
      const res = await fetch("/api/zmien-haslo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stareHaslo, noweHaslo }),
      });
      const dane = await res.json();

      if (dane.ok) {
        setSukces(true);
        setStareHaslo("");
        setNoweHaslo("");
        setPowtorzHaslo("");
      } else {
        setBlad(dane.blad ?? "Nie udało się zmienić hasła.");
      }
    } catch {
      setBlad("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setWysylanie(false);
    }
  }

  return (
    <div className="ekran">
      <form onSubmit={obsluzWyslanie} className="karta">
        <div className="karta__pas" />
        <img src="/logo.png" alt="ModernFas" className="logo" />
        <span className="eyebrow">ModernFas · CRM</span>
        <h1>Zmiana hasła</h1>
        <p className="opis">
          Zmieni się hasło dostępu dla wszystkich, którzy korzystają z
          aplikacji.
        </p>

        <label htmlFor="stare">Aktualne hasło</label>
        <input
          id="stare"
          type="password"
          autoFocus
          value={stareHaslo}
          onChange={(e) => setStareHaslo(e.target.value)}
          placeholder="••••••••"
        />

        <label htmlFor="nowe">Nowe hasło</label>
        <input
          id="nowe"
          type="password"
          value={noweHaslo}
          onChange={(e) => setNoweHaslo(e.target.value)}
          placeholder="••••••••"
        />

        <label htmlFor="powtorz">Powtórz nowe hasło</label>
        <input
          id="powtorz"
          type="password"
          value={powtorzHaslo}
          onChange={(e) => setPowtorzHaslo(e.target.value)}
          placeholder="••••••••"
        />

        {blad && <p className="blad">{blad}</p>}
        {sukces && (
          <p className="sukces">
            Hasło zostało zmienione. Od teraz obowiązuje nowe hasło.
          </p>
        )}

        <button
          type="submit"
          disabled={wysylanie || !stareHaslo || !noweHaslo || !powtorzHaslo}
        >
          {wysylanie ? "Zapisywanie…" : "Zmień hasło"}
        </button>

        <Link href="/" className="wstecz">
          ← Wróć do listy klientów
        </Link>
      </form>

      <style jsx>{`
        .ekran {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .karta {
          background: var(--bialy);
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          box-shadow: var(--shadow-card);
          width: 100%;
          max-width: 380px;
          padding: 28px 26px 26px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          overflow: hidden;
        }

        .karta__pas {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: repeating-linear-gradient(
            90deg,
            var(--cegla) 0 28px,
            var(--cegla-ciemna) 28px 30px
          );
        }

        .logo {
          width: 56px;
          height: 56px;
          border-radius: var(--radius);
          background: var(--grafit);
          padding: 7px;
          object-fit: contain;
          margin-top: 18px;
          align-self: flex-start;
        }

        .eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--cegla);
          font-weight: 600;
          margin-top: 14px;
        }

        h1 {
          font-family: var(--font-display);
          font-size: 22px;
          margin: 4px 0 2px;
          color: var(--grafit);
        }

        .opis {
          margin: 0 0 18px;
          font-size: 13.5px;
          color: var(--grafit-2);
        }

        label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--grafit-2);
          margin-bottom: 6px;
        }

        input {
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          padding: 10px 12px;
          font-size: 15px;
          color: var(--grafit);
          background: var(--bialy);
          margin-bottom: 14px;
        }

        input:focus {
          border-color: var(--cegla);
        }

        .blad {
          margin: -6px 0 14px;
          color: var(--czerwien);
          font-size: 13px;
          background: #f4e4e0;
          padding: 8px 10px;
          border-radius: var(--radius);
        }

        .sukces {
          margin: -6px 0 14px;
          color: var(--zielen);
          font-size: 13px;
          background: var(--zielen-tlo);
          padding: 8px 10px;
          border-radius: var(--radius);
        }

        button {
          background: var(--grafit);
          color: var(--bialy);
          border: none;
          border-radius: var(--radius);
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          background: var(--cegla);
        }

        button:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .wstecz {
          margin-top: 16px;
          text-align: center;
          font-size: 13px;
          color: var(--grafit-2);
          text-decoration: none;
        }

        .wstecz:hover {
          color: var(--cegla);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

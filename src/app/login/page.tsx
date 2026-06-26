"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FormularzLogowania() {
  const router = useRouter();
  const params = useSearchParams();
  const skadPrzyszedl = params.get("from") || "/";

  const [haslo, setHaslo] = useState("");
  const [blad, setBlad] = useState<string | null>(null);
  const [wysylanie, setWysylanie] = useState(false);

  async function obsluzWyslanie(e: React.FormEvent) {
    e.preventDefault();
    setBlad(null);
    setWysylanie(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haslo }),
      });
      const dane = await res.json();

      if (dane.ok) {
        router.push(skadPrzyszedl);
        router.refresh();
      } else {
        setBlad(dane.blad ?? "Nieprawidłowe hasło.");
        setWysylanie(false);
      }
    } catch {
      setBlad("Błąd połączenia. Spróbuj ponownie.");
      setWysylanie(false);
    }
  }

  return (
    <div className="ekran">
      <form onSubmit={obsluzWyslanie} className="karta">
        <div className="karta__pas" />
        <img src="/logo.png" alt="ModernFas" className="logo" />
        <span className="eyebrow">ModernFas · CRM</span>
        <h1>Dostęp chroniony</h1>
        <p className="opis">Wpisz hasło, aby zobaczyć listę zleceń.</p>

        <label htmlFor="haslo">Hasło</label>
        <input
          id="haslo"
          type="password"
          autoFocus
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
          placeholder="••••••••"
        />

        {blad && <p className="blad">{blad}</p>}

        <button type="submit" disabled={wysylanie || !haslo}>
          {wysylanie ? "Sprawdzanie…" : "Wejdź"}
        </button>
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
          max-width: 360px;
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
          margin-bottom: 16px;
        }

        input:focus {
          border-color: var(--cegla);
        }

        .blad {
          margin: -8px 0 14px;
          color: var(--czerwien);
          font-size: 13px;
          background: #f4e4e0;
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
      `}</style>
    </div>
  );
}

export default function StronaLogowania() {
  return (
    <Suspense fallback={null}>
      <FormularzLogowania />
    </Suspense>
  );
}

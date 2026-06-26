"use client";

import { useEffect, useState } from "react";
import { Zlecenie, ZlecenieDraft } from "@/lib/types";

interface Props {
  zlecenie: Zlecenie | null; // null = tworzenie nowego
  onZapisz: (dane: ZlecenieDraft) => Promise<void>;
  onUsun?: () => Promise<void>;
  onZamknij: () => void;
}

const PUSTY_DRAFT: ZlecenieDraft = {
  imie_nazwisko: "",
  telefon: "",
  adres: "",
  notatki: "",
  wizyta_u_klienta: false,
  wycena_zrobiona: false,
  wycena_zaakceptowana: false,
  material_zamowiony: false,
  ekipa_przypisana: false,
  status_realizacji: "w_trakcie",
  pozycja: 0,
};

export default function FormularzZlecenia({
  zlecenie,
  onZapisz,
  onUsun,
  onZamknij,
}: Props) {
  const [dane, setDane] = useState<ZlecenieDraft>(PUSTY_DRAFT);
  const [zapisywanie, setZapisywanie] = useState(false);
  const [potwierdzUsuniecie, setPotwierdzUsuniecie] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);

  useEffect(() => {
    if (zlecenie) {
      const { id, created_at, updated_at, ...reszta } = zlecenie;
      setDane(reszta);
    } else {
      setDane(PUSTY_DRAFT);
    }
  }, [zlecenie]);

  async function obsluzZapis(e: React.FormEvent) {
    e.preventDefault();
    if (!dane.imie_nazwisko.trim()) {
      setBlad("Podaj imię i nazwisko klienta.");
      return;
    }
    setBlad(null);
    setZapisywanie(true);
    try {
      await onZapisz(dane);
    } catch (err) {
      setBlad("Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie.");
      setZapisywanie(false);
    }
  }

  async function obsluzUsuniecie() {
    if (!onUsun) return;
    setZapisywanie(true);
    try {
      await onUsun();
    } catch {
      setBlad("Nie udało się usunąć zlecenia.");
      setZapisywanie(false);
    }
  }

  return (
    <div className="nadkladka" onClick={onZamknij}>
      <div
        className="panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={zlecenie ? "Edytuj zlecenie" : "Nowe zlecenie"}
      >
        <div className="panel__pas" />
        <header className="panel__header">
          <h2>{zlecenie ? "Edycja zlecenia" : "Nowe zlecenie"}</h2>
          <button
            type="button"
            className="btn-zamknij"
            onClick={onZamknij}
            aria-label="Zamknij"
          >
            ✕
          </button>
        </header>

        <form onSubmit={obsluzZapis} className="formularz">
          <div className="pole">
            <label htmlFor="imie_nazwisko">Imię i nazwisko *</label>
            <input
              id="imie_nazwisko"
              type="text"
              required
              autoFocus
              value={dane.imie_nazwisko}
              onChange={(e) =>
                setDane({ ...dane, imie_nazwisko: e.target.value })
              }
              placeholder="np. Jan Kowalski"
            />
          </div>

          <div className="rzad-2">
            <div className="pole">
              <label htmlFor="telefon">Numer telefonu</label>
              <input
                id="telefon"
                type="tel"
                value={dane.telefon ?? ""}
                onChange={(e) => setDane({ ...dane, telefon: e.target.value })}
                placeholder="600 000 000"
              />
            </div>
            <div className="pole">
              <label htmlFor="status_realizacji">Status realizacji</label>
              <select
                id="status_realizacji"
                value={dane.status_realizacji}
                onChange={(e) =>
                  setDane({
                    ...dane,
                    status_realizacji: e.target.value as
                      | "w_trakcie"
                      | "zrealizowana",
                  })
                }
              >
                <option value="w_trakcie">W trakcie</option>
                <option value="zrealizowana">Zrealizowana</option>
              </select>
            </div>
          </div>

          <div className="pole">
            <label htmlFor="adres">Adres</label>
            <input
              id="adres"
              type="text"
              value={dane.adres ?? ""}
              onChange={(e) => setDane({ ...dane, adres: e.target.value })}
              placeholder="ul. Przykładowa 12, Poznań"
            />
          </div>

          <fieldset className="etapy-fieldset">
            <legend>Etapy realizacji</legend>
            <div className="etapy-grid">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={dane.wizyta_u_klienta}
                  onChange={(e) =>
                    setDane({ ...dane, wizyta_u_klienta: e.target.checked })
                  }
                />
                Wizyta u klienta
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={dane.wycena_zrobiona}
                  onChange={(e) =>
                    setDane({ ...dane, wycena_zrobiona: e.target.checked })
                  }
                />
                Wycena zrobiona
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={dane.wycena_zaakceptowana}
                  onChange={(e) =>
                    setDane({
                      ...dane,
                      wycena_zaakceptowana: e.target.checked,
                    })
                  }
                />
                Wycena zaakceptowana
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={dane.material_zamowiony}
                  onChange={(e) =>
                    setDane({ ...dane, material_zamowiony: e.target.checked })
                  }
                />
                Materiał zamówiony
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={dane.ekipa_przypisana}
                  onChange={(e) =>
                    setDane({ ...dane, ekipa_przypisana: e.target.checked })
                  }
                />
                Ekipa jest przypisana
              </label>
            </div>
          </fieldset>

          <div className="pole">
            <label htmlFor="notatki">Notatki</label>
            <textarea
              id="notatki"
              rows={3}
              value={dane.notatki ?? ""}
              onChange={(e) => setDane({ ...dane, notatki: e.target.value })}
              placeholder="Dodatkowe informacje, ustalenia, terminy..."
            />
          </div>

          {blad && <p className="blad">{blad}</p>}

          <div className="akcje">
            {onUsun && (
              <div className="akcje__usuwanie">
                {potwierdzUsuniecie ? (
                  <>
                    <span className="potwierdz-tekst">Na pewno?</span>
                    <button
                      type="button"
                      className="btn btn--czerwony"
                      onClick={obsluzUsuniecie}
                      disabled={zapisywanie}
                    >
                      Usuń zlecenie
                    </button>
                    <button
                      type="button"
                      className="btn btn--cichy"
                      onClick={() => setPotwierdzUsuniecie(false)}
                    >
                      Cofnij
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn--cichy-czerwony"
                    onClick={() => setPotwierdzUsuniecie(true)}
                  >
                    Usuń zlecenie
                  </button>
                )}
              </div>
            )}
            <div className="akcje__zapis">
              <button
                type="button"
                className="btn btn--cichy"
                onClick={onZamknij}
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="btn btn--cegla"
                disabled={zapisywanie}
              >
                {zapisywanie ? "Zapisywanie…" : "Zapisz"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .nadkladka {
          position: fixed;
          inset: 0;
          background: rgba(43, 42, 40, 0.5);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 16px;
          overflow-y: auto;
          z-index: 100;
        }

        .panel {
          background: var(--bialy);
          width: 100%;
          max-width: 560px;
          border-radius: var(--radius);
          box-shadow: var(--shadow-pop);
          margin-top: 24px;
          position: relative;
          overflow: hidden;
        }

        .panel__pas {
          height: 5px;
          background: repeating-linear-gradient(
            90deg,
            var(--cegla) 0 28px,
            var(--cegla-ciemna) 28px 30px
          );
        }

        .panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px 4px;
        }

        .panel__header h2 {
          font-family: var(--font-display);
          font-size: 19px;
          margin: 0;
          color: var(--grafit);
        }

        .btn-zamknij {
          background: none;
          border: none;
          font-size: 16px;
          color: var(--grafit-2);
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
        }

        .btn-zamknij:hover {
          color: var(--grafit);
        }

        .formularz {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 24px 24px;
        }

        .pole {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rzad-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 480px) {
          .rzad-2 {
            grid-template-columns: 1fr;
          }
        }

        label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--grafit-2);
        }

        input[type="text"],
        input[type="tel"],
        select,
        textarea {
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          padding: 9px 11px;
          font-size: 14.5px;
          color: var(--grafit);
          background: var(--bialy);
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: var(--cegla);
        }

        textarea {
          resize: vertical;
          font-family: inherit;
        }

        .etapy-fieldset {
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          padding: 14px 14px 10px;
        }

        .etapy-fieldset legend {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--grafit-2);
          padding: 0 4px;
        }

        .etapy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 16px;
        }

        @media (max-width: 480px) {
          .etapy-grid {
            grid-template-columns: 1fr;
          }
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          font-weight: 400;
          color: var(--grafit);
          cursor: pointer;
        }

        .checkbox-row input {
          width: 16px;
          height: 16px;
          accent-color: var(--cegla);
          cursor: pointer;
        }

        .blad {
          margin: 0;
          color: var(--czerwien);
          font-size: 13px;
          background: #f4e4e0;
          padding: 8px 10px;
          border-radius: var(--radius);
        }

        .akcje {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .akcje__usuwanie {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .akcje__zapis {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }

        .potwierdz-tekst {
          font-size: 13px;
          color: var(--grafit-2);
        }

        .btn {
          border: 1px solid transparent;
          border-radius: var(--radius);
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn--cegla {
          background: var(--cegla);
          color: var(--bialy);
        }

        .btn--cegla:hover {
          background: var(--cegla-ciemna);
        }

        .btn--cichy {
          background: transparent;
          color: var(--grafit-2);
          border-color: var(--beton);
        }

        .btn--cichy:hover {
          background: var(--tynk-ciemny);
        }

        .btn--czerwony {
          background: var(--czerwien);
          color: var(--bialy);
        }

        .btn--cichy-czerwony {
          background: transparent;
          color: var(--czerwien);
          border-color: transparent;
        }

        .btn--cichy-czerwony:hover {
          background: #f4e4e0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}

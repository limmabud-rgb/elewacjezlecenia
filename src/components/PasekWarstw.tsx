"use client";

import { EtapKey, ETAPY_KEYS, ETAPY_SKROT, Zlecenie } from "@/lib/types";

interface Props {
  zlecenie: Zlecenie;
  onToggle: (klucz: EtapKey) => void;
  disabled?: boolean;
}

/**
 * Pasek warstw — wizualna metafora przekroju elewacji.
 * Każdy segment to jedna "warstwa" procesu (wizyta → wycena → akceptacja
 * → materiał → ekipa). Wypełniony segment = etap ukończony.
 * Kolejność od lewej do prawej odpowiada faktycznej kolejności prac.
 */
export default function PasekWarstw({ zlecenie, onToggle, disabled }: Props) {
  return (
    <div className="pasek-warstw" role="group" aria-label="Etapy zlecenia">
      {ETAPY_KEYS.map((klucz, i) => {
        const aktywny = zlecenie[klucz];
        return (
          <button
            key={klucz}
            type="button"
            disabled={disabled}
            className={`warstwa ${aktywny ? "warstwa--aktywna" : ""}`}
            onClick={() => onToggle(klucz)}
            aria-pressed={aktywny}
            title={ETAPY_SKROT[klucz]}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="warstwa__numer">{i + 1}</span>
            <span className="warstwa__etykieta">{ETAPY_SKROT[klucz]}</span>
          </button>
        );
      })}

      <style jsx>{`
        .pasek-warstw {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          width: 100%;
        }

        .warstwa {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 7px 6px 6px;
          border: 1px solid var(--beton);
          background: var(--tynk-ciemny);
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease,
            transform 0.1s ease;
          text-align: left;
          min-height: 46px;
        }

        .warstwa:hover {
          border-color: var(--grafit-2);
        }

        .warstwa:active {
          transform: translateY(1px);
        }

        .warstwa:disabled {
          cursor: default;
        }

        .warstwa--aktywna {
          background: var(--cegla);
          border-color: var(--cegla-ciemna);
        }

        .warstwa--aktywna:hover {
          border-color: var(--cegla-ciemna);
        }

        .warstwa__numer {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--grafit-2);
          line-height: 1;
        }

        .warstwa--aktywna .warstwa__numer {
          color: rgba(251, 249, 244, 0.75);
        }

        .warstwa__etykieta {
          font-size: 11.5px;
          font-weight: 600;
          line-height: 1.15;
          color: var(--grafit);
        }

        .warstwa--aktywna .warstwa__etykieta {
          color: var(--bialy);
        }

        @media (max-width: 640px) {
          .warstwa__etykieta {
            font-size: 10.5px;
          }
          .warstwa {
            padding: 6px 5px;
            min-height: 40px;
          }
        }
      `}</style>
    </div>
  );
}

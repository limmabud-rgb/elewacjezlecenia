"use client";

import { EtapKey, Zlecenie } from "@/lib/types";
import PasekWarstw from "./PasekWarstw";
import BadgeStatus from "./BadgeStatus";

interface Props {
  zlecenie: Zlecenie;
  onEdytuj: () => void;
  onToggleEtap: (klucz: EtapKey) => void;
  onToggleStatus: () => void;
}

export default function KartaZlecenia({
  zlecenie,
  onEdytuj,
  onToggleEtap,
  onToggleStatus,
}: Props) {
  return (
    <article className="karta">
      <div className="karta__gora">
        <div className="karta__info" onClick={onEdytuj} role="button" tabIndex={0}>
          <h3 className="karta__nazwa">{zlecenie.imie_nazwisko}</h3>
          <div className="karta__dane-kontakt">
            {zlecenie.telefon && (
              <a
                href={`tel:${zlecenie.telefon.replace(/\s+/g, "")}`}
                className="karta__telefon"
                onClick={(e) => e.stopPropagation()}
              >
                {zlecenie.telefon}
              </a>
            )}
            {zlecenie.adres && (
              <span className="karta__adres">{zlecenie.adres}</span>
            )}
          </div>
        </div>
        <BadgeStatus status={zlecenie.status_realizacji} onClick={onToggleStatus} />
      </div>

      <PasekWarstw zlecenie={zlecenie} onToggle={onToggleEtap} />

      {zlecenie.notatki && <p className="karta__notatki">{zlecenie.notatki}</p>}

      <style jsx>{`
        .karta {
          background: var(--bialy);
          border: 1px solid var(--beton);
          border-radius: var(--radius);
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--shadow-card);
        }

        .karta__gora {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .karta__info {
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }

        .karta__nazwa {
          font-family: var(--font-display);
          font-size: 16.5px;
          font-weight: 700;
          margin: 0 0 4px;
          color: var(--grafit);
        }

        .karta__info:hover .karta__nazwa {
          color: var(--cegla);
        }

        .karta__dane-kontakt {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 13px;
          color: var(--grafit-2);
        }

        .karta__telefon {
          font-family: var(--font-mono);
          text-decoration: none;
          color: var(--grafit-2);
        }

        .karta__telefon:hover {
          color: var(--cegla);
          text-decoration: underline;
        }

        .karta__adres {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .karta__notatki {
          margin: 0;
          font-size: 13px;
          color: var(--grafit-2);
          background: var(--tynk-ciemny);
          padding: 8px 10px;
          border-radius: var(--radius);
          white-space: pre-wrap;
        }
      `}</style>
    </article>
  );
}

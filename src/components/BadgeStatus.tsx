"use client";

import { StatusRealizacji } from "@/lib/types";

interface Props {
  status: StatusRealizacji;
  onClick?: () => void;
  disabled?: boolean;
}

export default function BadgeStatus({ status, onClick, disabled }: Props) {
  const zrealizowana = status === "zrealizowana";

  return (
    <button
      type="button"
      className={`badge ${zrealizowana ? "badge--zielony" : "badge--bursztyn"}`}
      onClick={onClick}
      disabled={disabled || !onClick}
      title="Kliknij, aby zmienić status realizacji"
    >
      <span className="kropka" />
      {zrealizowana ? "Zrealizowana" : "W trakcie"}

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          padding: 5px 10px 5px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: ${onClick ? "pointer" : "default"};
          white-space: nowrap;
        }

        .badge--zielony {
          background: var(--zielen-tlo);
          color: var(--zielen);
        }

        .badge--bursztyn {
          background: var(--bursztyn-tlo);
          color: var(--bursztyn);
        }

        .kropka {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .badge:disabled {
          cursor: default;
        }
      `}</style>
    </button>
  );
}

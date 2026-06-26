export type StatusRealizacji = "w_trakcie" | "zrealizowana";

export interface Zlecenie {
  id: string;
  created_at: string;
  updated_at: string;

  imie_nazwisko: string;
  telefon: string | null;
  adres: string | null;
  notatki: string | null;

  wizyta_u_klienta: boolean;
  wycena_zrobiona: boolean;
  wycena_zaakceptowana: boolean;
  material_zamowiony: boolean;
  ekipa_przypisana: boolean;

  status_realizacji: StatusRealizacji;
  pozycja: number;
}

export type ZlecenieDraft = Omit<Zlecenie, "id" | "created_at" | "updated_at">;

export const ETAPY_KEYS = [
  "wizyta_u_klienta",
  "wycena_zrobiona",
  "wycena_zaakceptowana",
  "material_zamowiony",
  "ekipa_przypisana",
] as const;

export type EtapKey = (typeof ETAPY_KEYS)[number];

export const ETAPY_LABELS: Record<EtapKey, string> = {
  wizyta_u_klienta: "Wizyta u klienta",
  wycena_zrobiona: "Wycena zrobiona",
  wycena_zaakceptowana: "Wycena zaakceptowana",
  material_zamowiony: "Materiał zamówiony",
  ekipa_przypisana: "Ekipa przypisana",
};

export const ETAPY_SKROT: Record<EtapKey, string> = {
  wizyta_u_klienta: "Wizyta",
  wycena_zrobiona: "Wycena",
  wycena_zaakceptowana: "Akceptacja",
  material_zamowiony: "Materiał",
  ekipa_przypisana: "Ekipa",
};

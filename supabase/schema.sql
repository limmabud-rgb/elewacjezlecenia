-- ============================================================
-- ELEWACJE CRM — Schemat bazy danych
-- ============================================================
-- Wklej całość w Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.zlecenia (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- dane klienta
  imie_nazwisko text not null,
  telefon text,
  adres text,
  notatki text,

  -- statusy etapów (checkboxy, niezależne od siebie)
  wizyta_u_klienta boolean not null default false,
  wycena_zrobiona boolean not null default false,
  wycena_zaakceptowana boolean not null default false,
  material_zamowiony boolean not null default false,
  ekipa_przypisana boolean not null default false,

  -- status realizacji (jedna wartość z zestawu)
  status_realizacji text not null default 'w_trakcie'
    check (status_realizacji in ('w_trakcie', 'zrealizowana')),

  -- kolejność wyświetlania ręcznie ustalana przez użytkownika (opcjonalnie)
  pozycja integer not null default 0
);

-- automatyczna aktualizacja updated_at przy każdej zmianie
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_zlecenia_updated_at on public.zlecenia;
create trigger trg_zlecenia_updated_at
  before update on public.zlecenia
  for each row
  execute function public.set_updated_at();

-- indeks pod sortowanie po dacie dodania
create index if not exists idx_zlecenia_created_at on public.zlecenia (created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
-- Wersja startowa: jedna współdzielona baza dla całej firmy,
-- dostęp przez publiczny anon key (tak jak w prostym CRM na firmowym
-- intranecie/telefonach). Jeśli w przyszłości chcesz logowanie per
-- pracownik, zamień te polityki na "auth.uid() is not null".

alter table public.zlecenia enable row level security;

drop policy if exists "Pozwól na wszystko - anon" on public.zlecenia;
create policy "Pozwól na wszystko - anon"
  on public.zlecenia
  for all
  to anon
  using (true)
  with check (true);

-- ============================================================
-- Realtime (żeby zmiany na jednym urządzeniu odświeżały się
-- automatycznie na innych, np. telefon ekipy + komputer w biurze)
-- ============================================================
alter publication supabase_realtime add table public.zlecenia;

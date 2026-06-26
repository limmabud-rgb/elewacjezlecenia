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

-- ============================================================
-- Hasło dostępu do aplikacji (wspólne dla całej firmy)
-- ============================================================
-- Hasło jest przechowywane jako hash (bcrypt, przez rozszerzenie
-- pgcrypto) — nigdy jako czysty tekst. Tabela NIE jest dostępna
-- bezpośrednio z anon key (brak polityk RLS pozwalających na select/
-- update) — dostęp tylko przez funkcje poniżej, które działają z
-- uprawnieniami "security definer" i nigdy nie zwracają samego hasha.

create extension if not exists "pgcrypto";

create table if not exists public.app_auth (
  id int primary key default 1,
  haslo_hash text not null,
  updated_at timestamptz not null default now(),
  constraint app_auth_single_row check (id = 1)
);

alter table public.app_auth enable row level security;
-- Uwaga: brak jakichkolwiek "create policy" tutaj jest zamierzone —
-- to blokuje wszelki bezpośredni dostęp z anon/authenticated key.
-- Jedyna droga do tej tabeli to funkcje "security definer" poniżej.

-- Wstaw hasło startowe TYLKO jeśli tabela jest jeszcze pusta.
-- Podmień 'zmien-to-haslo' na własne hasło startowe przed uruchomieniem
-- tego pliku — albo zmień je później przez ekran "Zmień hasło" w apce.
insert into public.app_auth (id, haslo_hash)
values (1, crypt('zmien-to-haslo', gen_salt('bf')))
on conflict (id) do nothing;

-- Sprawdza, czy podane hasło jest prawidłowe. Zwraca tylko true/false —
-- nigdy hash. Bezpieczne do wołania z anon key.
create or replace function public.sprawdz_haslo(podane_haslo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  zapisany_hash text;
begin
  select haslo_hash into zapisany_hash from public.app_auth where id = 1;
  if zapisany_hash is null then
    return false;
  end if;
  return zapisany_hash = crypt(podane_haslo, zapisany_hash);
end;
$$;

-- Zmienia hasło, ale tylko jeśli stare_haslo jest prawidłowe.
-- Zwraca true przy sukcesie, false jeśli stare hasło się nie zgadza.
create or replace function public.zmien_haslo(stare_haslo text, nowe_haslo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  zapisany_hash text;
begin
  select haslo_hash into zapisany_hash from public.app_auth where id = 1;

  if zapisany_hash is null or zapisany_hash <> crypt(stare_haslo, zapisany_hash) then
    return false;
  end if;

  if nowe_haslo is null or length(trim(nowe_haslo)) < 4 then
    raise exception 'Nowe hasło musi mieć co najmniej 4 znaki.';
  end if;

  update public.app_auth
    set haslo_hash = crypt(nowe_haslo, gen_salt('bf')),
        updated_at = now()
    where id = 1;

  return true;
end;
$$;

-- Pozwól anonimowym użytkownikom (czyli każdemu z linkiem do apki)
-- wołać te dwie funkcje — to jedyny dozwolony "wjazd" do app_auth.
grant execute on function public.sprawdz_haslo(text) to anon;
grant execute on function public.zmien_haslo(text, text) to anon;

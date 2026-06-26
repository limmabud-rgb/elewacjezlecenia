# Elewacje CRM

Prosta aplikacja do zarządzania zleceniami na elewacje. Dla każdego klienta
zapisujesz dane kontaktowe i zaznaczasz postęp na pięciu etapach:

1. Wizyta u klienta
2. Wycena zrobiona
3. Wycena zaakceptowana
4. Materiał zamówiony
5. Ekipa przypisana

Niezależnie od tego ustawiasz **status realizacji**: *w trakcie* albo
*zrealizowana*.

Dane są w Supabase (czyli dostępne z każdego urządzenia — telefon, tablet,
komputer w biurze), a sama aplikacja jest hostowana na Vercel.

---

## Krok 1 — Supabase (baza danych)

1. Wejdź na [supabase.com](https://supabase.com) i załóż darmowe konto (jeśli
   jeszcze nie masz).
2. Kliknij **New Project**. Podaj nazwę (np. `elewacje-crm`), ustaw hasło do
   bazy (zapisz je gdzieś — nie będzie potrzebne do tej aplikacji, ale dobrze
   je mieć) i wybierz region najbliższy Polsce (np. `Central EU (Frankfurt)`).
3. Poczekaj, aż projekt się utworzy (ok. 1–2 minuty).
4. W lewym menu wejdź w **SQL Editor**.
5. Otwórz plik [`supabase/schema.sql`](./supabase/schema.sql) z tego
   repozytorium, skopiuj całą zawartość i wklej do edytora SQL w Supabase.
6. Kliknij **Run**. To stworzy tabelę `zlecenia` ze wszystkimi kolumnami,
   zabezpieczeniami i obsługą aktualizacji w czasie rzeczywistym.
7. Wejdź w **Project Settings → API**. Skopiuj sobie dwie wartości:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon public key** (długi ciąg znaków)

   Będą potrzebne w kroku 3.

> **Uwaga o bezpieczeństwie:** w wersji startowej każdy, kto ma link do
> aplikacji, może dodawać/edytować/usuwać zlecenia — tak jak we wspólnym
> firmowym arkuszu. To wystarczające rozwiązanie dla małej firmy korzystającej
> z aplikacji wewnętrznie. Jeśli w przyszłości chcesz dodać logowanie
> pracowników (każdy z osobnym kontem), napisz, a rozbudujemy to o
> Supabase Auth.

---

## Krok 2 — Wgranie kodu na GitHub

1. Załóż konto na [github.com](https://github.com), jeśli nie masz.
2. Stwórz nowe, **prywatne** repozytorium (np. `elewacje-crm`) — bez README,
   bez .gitignore (już je masz w tym folderze).
3. W folderze projektu (ten, który właśnie pobrałeś) otwórz terminal i
   wykonaj:

   ```bash
   git init
   git add .
   git commit -m "Pierwsza wersja CRM"
   git branch -M main
   git remote add origin https://github.com/TWOJA-NAZWA/elewacje-crm.git
   git push -u origin main
   ```

   (Zamień `TWOJA-NAZWA` na swój login z GitHuba — dokładny adres zobaczysz
   na stronie repozytorium po jego utworzeniu, przycisk "Code".)

---

## Krok 3 — Vercel (hosting)

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się przez swoje konto
   GitHub.
2. Kliknij **Add New → Project**.
3. Wybierz repozytorium `elewacje-crm`, które przed chwilą wgrałeś.
4. Vercel sam wykryje, że to projekt Next.js — nie musisz zmieniać żadnych
   ustawień budowania.
5. Przed kliknięciem **Deploy** rozwiń sekcję **Environment Variables** i
   dodaj dwie zmienne (te z kroku 1):

   | Name                            | Value                            |
   |----------------------------------|-----------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`       | Twój Project URL z Supabase       |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Twój anon public key z Supabase   |

6. Kliknij **Deploy**. Po minucie-dwóch dostaniesz link typu
   `https://elewacje-crm.vercel.app` — to jest Twoja aplikacja, działająca
   na każdym urządzeniu z dostępem do internetu.

### Aktualizacje w przyszłości

Każda zmiana, którą wgrasz na GitHub (`git push`), automatycznie pojawi się
na Vercel w ciągu minuty — nie musisz nic klikać.

---

## Krok 4 — Hasło dostępu do aplikacji

Aplikacja jest chroniona jednym wspólnym hasłem dla całej firmy — każdy, kto
wpisze poprawne hasło w przeglądarce, ma dostęp przez kolejne 30 dni (potem
trzeba wpisać je ponownie).

1. W Vercel wejdź w swój projekt → **Settings → Environment Variables**.
2. Dodaj nową zmienną:

   | Name | Value |
   |---|---|
   | `APP_PASSWORD` | wybrane przez Ciebie hasło, np. `elewacje2026` |

3. Zaznacz **Production and Preview** jako środowiska.
4. Zapisz, a potem wejdź w zakładkę **Deployments** → przy najnowszym
   deploymencie kliknij **⋯ → Redeploy** (zmienne środowiskowe działają
   tylko od następnego builda, nie wstecznie).

Od teraz każdy wchodzący na link aplikacji zobaczy ekran z prośbą o hasło.
Jeśli zapomnisz ustawić `APP_PASSWORD`, aplikacja **nie blokuje dostępu** —
to zabezpieczenie przed przypadkowym zablokowaniem samego siebie.

> Jeśli chcesz zmienić hasło w przyszłości, po prostu zmień wartość
> `APP_PASSWORD` w Vercel i zrób redeploy — osoby, które były już
> zalogowane starym hasłem, zostaną poproszone o nowe przy najbliższej
> wizycie po wygaśnięciu ciasteczka (lub możesz je wylogować wcześniej,
> czyszcząc dane strony w przeglądarce).

---



```bash
npm install
cp .env.local.example .env.local
# wklej swoje dane Supabase do .env.local
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:3000`.

---

## Struktura projektu

```
elewacje-crm/
├── supabase/
│   └── schema.sql          ← struktura bazy danych (wklejana w Supabase)
├── src/
│   ├── middleware.ts        ← sprawdza hasło dostępu przy każdym żądaniu
│   ├── app/
│   │   ├── layout.tsx      ← główny layout + czcionki
│   │   ├── page.tsx        ← strona główna (lista klientów, filtry)
│   │   ├── globals.css     ← kolory, style globalne
│   │   ├── login/
│   │   │   └── page.tsx    ← ekran logowania hasłem
│   │   └── api/login/
│   │       └── route.ts    ← sprawdza hasło, ustawia ciasteczko
│   ├── components/
│   │   ├── KartaZlecenia.tsx     ← karta jednego klienta na liście
│   │   ├── PasekWarstw.tsx       ← pasek 5 etapów (klikalne segmenty)
│   │   ├── BadgeStatus.tsx       ← znacznik "w trakcie / zrealizowana"
│   │   └── FormularzZlecenia.tsx ← formularz dodawania/edycji
│   └── lib/
│       ├── supabaseClient.ts ← połączenie z Supabase
│       └── types.ts          ← typy danych
├── .env.local.example
└── package.json
```

## Najczęstsze pytania

**Czy mogę zmienić nazwę firmy / kolory?**
Tak — kolory są zdefiniowane na górze pliku `src/app/globals.css`
(zmienne typu `--cegla`, `--grafit` itd.), a tytuł strony w
`src/app/layout.tsx`.

**Czy da się dodać więcej etapów albo zmienić ich nazwy?**
Tak. Etykiety etapów są w `src/lib/types.ts` (`ETAPY_LABELS`,
`ETAPY_SKRÓT`). Dodanie nowego etapu wymaga też dodania nowej kolumny w
bazie danych (osobne zapytanie SQL — napisz, jeśli potrzebujesz pomocy).

**Czy kilka osób może korzystać z aplikacji jednocześnie?**
Tak — to jest cały sens połączenia z Supabase. Zmiana zrobiona na telefonie
ekipy w terenie pojawi się automatycznie na komputerze w biurze (dzięki
funkcji Realtime włączonej w `schema.sql`).

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

## Aktualizujesz istniejące wdrożenie?

Jeśli już masz tę aplikację działającą (z hasłem ustawionym przez zmienną
`APP_PASSWORD`) i wgrywasz tę nowszą wersję, zmiana hasła przeniosła się do
Supabase. Zrób dodatkowo:

1. W Supabase → **SQL Editor** ponownie wklej i uruchom cały plik
   `supabase/schema.sql` (jest bezpieczny do wielokrotnego uruchamiania —
   nie usunie istniejących zleceń, tylko doda nową tabelę `app_auth`).
   Przed uruchomieniem zamień w nim `'zmien-to-haslo'` na hasło, które
   chcesz mieć ustawione na start.
2. W Vercel dodaj nową zmienną `SESSION_SECRET` (opis w Kroku 4 poniżej) —
   stara zmienna `APP_PASSWORD` nie jest już używana, możesz ją usunąć.
3. Zrób redeploy.

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
trzeba wpisać je ponownie). Hasło jest przechowywane w Supabase (jako hash,
nigdy jako czysty tekst) i **można je zmienić bezpośrednio w aplikacji**, bez
dotykania Vercela czy Supabase — wystarczy znać aktualne hasło.

### Hasło startowe

Plik `supabase/schema.sql` ustawia hasło startowe na `zmien-to-haslo`. Zanim
go uruchomisz w Supabase (Krok 1), otwórz ten plik i zamień
`'zmien-to-haslo'` na własne hasło startowe — albo zostaw jak jest i zmień
je od razu po pierwszym zalogowaniu, na ekranie **„Zmień hasło dostępu"**
(link w prawym górnym rogu listy klientów).

### Zmiana hasła w przyszłości

1. Wejdź na stronę aplikacji i zaloguj się.
2. Kliknij **„Zmień hasło dostępu"** w prawym górnym rogu.
3. Podaj aktualne hasło i nowe hasło (dwa razy, dla potwierdzenia).
4. Gotowe — od tego momentu obowiązuje nowe hasło dla wszystkich. Osoby,
   które są już zalogowane na innych urządzeniach, zostaną poproszone o
   nowe hasło po wygaśnięciu ich sesji (do 30 dni) — jeśli chcesz, żeby
   stało się to natychmiast, daj znać, można to rozbudować o wylogowanie
   wszystkich na raz.

### Konfiguracja techniczna (jednorazowa, przy wdrożeniu)

Mechanizm logowania wymaga jednej dodatkowej zmiennej środowiskowej w
Vercelu — to **nie jest hasło do aplikacji**, tylko techniczny sekret
używany do podpisywania sesji (żeby przeglądarka mogła dowieść, że ktoś już
się zalogował, bez przechowywania samego hasła w ciasteczku).

1. W Vercel wejdź w swój projekt → **Settings → Environment Variables**.
2. Dodaj zmienną:

   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | dowolny długi, losowy ciąg znaków (np. 32+ znaków) |

   Możesz taki ciąg wygenerować np. na stronie
   [generate-secret.vercel.app](https://generate-secret.vercel.app/32) albo
   komendą `openssl rand -hex 32` w terminalu.

3. Zaznacz **Production and Preview** jako środowiska, zapisz.
4. Wejdź w zakładkę **Deployments** → przy najnowszym deploymencie kliknij
   **⋯ → Redeploy**.

Ten krok robisz tylko raz, przy wdrożeniu — `SESSION_SECRET` nie zmienia się
przy zmianie hasła dostępu.

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
│   └── schema.sql          ← struktura bazy + hasło dostępu (wklejana w Supabase)
├── src/
│   ├── middleware.ts        ← sprawdza sesję logowania przy każdym żądaniu
│   ├── app/
│   │   ├── layout.tsx      ← główny layout + czcionki
│   │   ├── page.tsx        ← strona główna (lista klientów, filtry)
│   │   ├── globals.css     ← kolory, style globalne
│   │   ├── icon.png        ← favicon (logo w karcie przeglądarki)
│   │   ├── login/
│   │   │   └── page.tsx    ← ekran logowania hasłem
│   │   ├── zmiana-hasla/
│   │   │   └── page.tsx    ← ekran zmiany hasła dostępu
│   │   └── api/
│   │       ├── login/route.ts        ← sprawdza hasło w Supabase, wystawia sesję
│   │       └── zmien-haslo/route.ts  ← zmienia hasło w Supabase
│   ├── components/
│   │   ├── KartaZlecenia.tsx     ← karta jednego klienta na liście
│   │   ├── PasekWarstw.tsx       ← pasek 5 etapów (klikalne segmenty)
│   │   ├── BadgeStatus.tsx       ← znacznik "w trakcie / zrealizowana"
│   │   └── FormularzZlecenia.tsx ← formularz dodawania/edycji
│   └── lib/
│       ├── supabaseClient.ts ← połączenie z Supabase (dane klientów)
│       ├── sesja.ts          ← podpisywanie/weryfikacja tokenu logowania
│       └── types.ts          ← typy danych
├── public/
│   └── logo.png             ← logo widoczne w nagłówku i na logowaniu
├── .env.local.example
└── package.json
```

## Najczęstsze pytania

**Czy mogę zmienić nazwę firmy / kolory?**
Tak — kolory są zdefiniowane na górze pliku `src/app/globals.css`
(zmienne typu `--cegla`, `--grafit` itd.), a tytuł strony w
`src/app/layout.tsx`.

**Czy mogę zmienić logo?**
Tak. Logo znajduje się w dwóch miejscach:
- `public/logo.png` — logo widoczne w nagłówku strony i na ekranie logowania
- `src/app/icon.png` — ikonka widoczna w karcie przeglądarki (favicon)

Żeby zmienić logo, po prostu zastąp te dwa pliki nowymi (zachowując te
same nazwy: `logo.png` i `icon.png`).

**Czy da się dodać więcej etapów albo zmienić ich nazwy?**
Tak. Etykiety etapów są w `src/lib/types.ts` (`ETAPY_LABELS`,
`ETAPY_SKROT`). Dodanie nowego etapu wymaga też dodania nowej kolumny w
bazie danych (osobne zapytanie SQL — napisz, jeśli potrzebujesz pomocy).

**Czy kilka osób może korzystać z aplikacji jednocześnie?**
Tak — to jest cały sens połączenia z Supabase. Zmiana zrobiona na telefonie
ekipy w terenie pojawi się automatycznie na komputerze w biurze (dzięki
funkcji Realtime włączonej w `schema.sql`).

**Czy hasło jest bezpiecznie przechowane?**
Tak. Hasło nigdy nie jest zapisane jawnie — w bazie trzyma się tylko jego
hash (nieodwracalny "odcisk", przez `pgcrypto`/bcrypt), a sama tabela z tym
hashem jest niedostępna z zewnątrz aplikacji (brak polityk RLS otwierających
do niej dostęp). Jedyny sposób na sprawdzenie albo zmianę hasła to dwie
specjalne funkcje SQL, które same weryfikują stare hasło i nigdy nie
zwracają hasha na zewnątrz.

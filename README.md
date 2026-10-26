# StarMess — strona gry

Osobny projekt statyczny z własnym repozytorium Git. PL/EN/RU, landing page, Steam (wishlist lub zakup), galeria z filtrami i powiększaniem, osadzane TikToki, Discord i historia zmian gry. Nie modyfikuje gry ani jej wersji.

## Lokalnie

Wymagany Node.js 22 lub nowszy. Brak zależności do instalowania. Na Windows możesz uruchomić **Start-Website.cmd**; korzysta z lokalnego Node dostarczonego z Codex, jeśli jest dostępny, lub systemowego Node. Pozostaw okno uruchomionego serwera otwarte i otwórz podany poniżej adres. Ctrl+C zatrzymuje serwer.

```sh
npm run dev
```

Podgląd: http://127.0.0.1:4173. Opcjonalnie ustaw zmienną `PORT`.

```sh
npm test
npm run build
npm run preview
```

Build tworzy `dist/`, które można wgrać na dowolny hosting statyczny. Domyślny hosting to Vercel z automatycznym deployem z GitHuba. Źródła strony są w `public/`; nie edytuj wygenerowanego `dist/`.

## Steam, Discord i TikTok

Edytuj `public/data/site.json`:

```json
{
  "steamUrl": "https://store.steampowered.com/app/TWOJE_ID/",
  "steamMode": "wishlist",
  "discordUrl": "https://discord.gg/TWOJE_ZAPROSZENIE",
  "tiktokProfileUrl": "https://www.tiktok.com/@TWOJ_PROFIL",
  "tiktoks": [
    {
      "url": "https://www.tiktok.com/@TWOJ_PROFIL/video/NUMERYCZNE_ID_FILMU",
      "title": { "pl": "Jeszcze jedna próba", "en": "One more try", "ru": "Ещё одна попытка" }
    }
  ]
}
```

Przykład powyżej zawiera placeholdery: zastąp je prawdziwymi danymi przed buildem. Puste linki są obsługiwane i pokazują komunikat „wkrótce”. Nie ma fikcyjnych filmów. TikToki wymagają pełnego linku do publicznego posta; skrócone linki `vm.tiktok.com` najpierw rozwiń. Oficjalny iframe TikTok wczytuje się dopiero po kliknięciu i ma link zapasowy. Bez dostępnego publicznego filmu nie można zweryfikować jego odtwarzania.

Po premierze ustaw `steamMode` na `buy`, aby przełączyć wszystkie CTA i tekst sekcji Steam na zakup. Cena jest dostępna w Steam. Linki zewnętrzne otwierają nową kartę. TikTok nie jest kontaktowany przed kliknięciem; fonty i grafiki są lokalne.

## Aktualizowanie treści

- Teksty strony: `public/locales/{pl,en,ru}.json`. Klucze muszą być zgodne we wszystkich językach; build to sprawdza.
- Galeria: `public/data/gallery.json` i `public/assets/`. Podpisy: klucze `gallery.*` w tłumaczeniach.
- Dziennik gry: `public/data/releases.json`. Jest wersjonowaną kopią dziennika gry, nie pobiera plików z komputera odwiedzającego.
- Po nowej wersji gry: `npm run sync:game`, następnie `npm test` i commit strony. Domyślnie importuje katalog gry o poziom wyżej; po przeniesieniu projektu: `node scripts/sync-game.mjs "C:/ścieżka/do/gry"`.
- Import zachowuje wersję, datę i pełne tłumaczenia z katalogu gry. Nie podbija wersji gry ani nie zapisuje jej plików.
- Build generuje pełne strony `/pl/`, `/en/`, `/ru/`: tłumaczenia, galeria i cała historia zmian są dostępne w HTML bez wykonywania JavaScriptu. Starsze wpisy rozwijają się przez natywne `details`. Katalog główny pokazuje PL z canonical do `/pl/` po skonfigurowaniu adresu.
- Metadane każdego języka pochodzą z `pageTitle` i `pageDescription` w katalogach tłumaczeń. Nie zmieniaj ręcznie `dist/`.

## SEO i domena

Na Vercel build automatycznie używa `VERCEL_PROJECT_PRODUCTION_URL` do canonical, `hreflang`, sitemapy i podglądów społecznościowych. Nie potrzebujesz wpisywać domeny podczas pierwszego importu. Pozostaw włączone systemowe zmienne środowiskowe Vercel (Expose System Environment Variables).

Możesz nadpisać adres przez `SITE_URL` (pełny adres HTTPS) w ustawieniach Vercel lub `siteUrl` w `public/data/site.json`. Kolejność: `SITE_URL`, `siteUrl`, produkcyjna domena Vercel. Nie używamy adresu deploymentu preview jako canonical. Podglądy mają `noindex,nofollow` i nie emitują sitemapy. Lokalny build bez domeny pomija absolutne metadane.

Po zmianie domeny zbuduj stronę ponownie. Nie kopiuj sitemapy ze starego hostingu. Przełącznik języka prowadzi do rzeczywistych adresów, bez zależności od cookies lub języka przeglądarki. Stare linki `?lang=en` są obsługiwane przez przekierowanie JS do nowej wersji językowej.

Po publikacji dodaj rzeczywistą domenę do Google Search Console, potwierdź własność i zgłoś `sitemap.xml`. Sprawdź indeksowanie adresów oraz Core Web Vitals/PageSpeed na publicznym hostingu; lokalne testy nie gwarantują pozycji ani wyniku wydajności. Dane strukturalne `VideoGame` opisują grę, bez fikcyjnych ocen, cen i dat premiery. Politykę prywatności odwiedzający znajdzie w stopce.

## Vercel + GitHub: automatyczny deploy

Repozytorium: https://github.com/Tems-py/starmess-website . To osobne repo strony, więc katalogiem głównym na Vercel jest **`./`**, nie `website`.

1. Vercel → Add New → Project → Import Git Repository → `Tems-py/starmess-website`.
2. Zostaw Root Directory `./` i Application/Framework Preset **Other**.
3. `vercel.json` ustawia Build Command **`npm run build:vercel`** oraz Output Directory **`dist`**. Jeśli włączasz ręczne nadpisanie w panelu, wpisz te same wartości. Nie ustawiaj `public` jako output.
4. Nie musisz dodawać zmiennych środowiskowych dla pierwszego deployu. Kliknij **Deploy**.
5. Produkcyjną gałęzią w Settings → Git/Environments powinna być **main**. Każdy push do niej uruchomi aktualizację; pozostałe gałęzie/PR dostaną podglądy zgodnie z ustawieniami Vercel.

Vercel przed buildem uruchamia testy. GitHub Actions „Check StarMess website” dodatkowo sprawdza zmiany i pull requesty, ale nie publikuje strony. Nie są potrzebne tokeny Vercel w GitHub Secrets. Dawny workflow GitHub Pages został usunięty; jeżeli Pages był wcześniej włączony, wyłącz jego publikację w Settings → Pages, aby nie utrzymywać starej kopii strony.

Po dodaniu własnej domeny w Vercel ustaw ją jako `SITE_URL` i wykonaj Redeploy, aby jednoznacznie wskazać preferowaną domenę SEO. Nie dodawaj `.vercel/` ani tokenów do repozytorium.

## Pochodzenie materiałów

Grafiki i kadry: projekt StarMess, `docs/previews/` i `assets/icons/`. Roboto Mono i Pixelify Sans: lokalne fonty projektu, licencje OFL w `public/assets/`. Roboto Mono jest fontem interfejsu; Pixelify Sans używany jest tylko w logo. Kadry przedstawiają prototyp, nie gwarancję finalnego wyglądu.

## Dokumentacja integracji

- [Oficjalny TikTok Embed Player](https://developers.tiktok.com/doc/embed-player/)
- [Vercel: konfiguracja projektu](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel: systemowe zmienne środowiskowe](https://vercel.com/docs/environment-variables/system-environment-variables)

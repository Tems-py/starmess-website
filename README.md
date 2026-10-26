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

Build tworzy `dist/`, które można wgrać na dowolny hosting statyczny. Wszystkie ścieżki są względne, więc działa też GitHub Pages pod `/nazwa-repo/`. Źródła strony są w `public/`; nie edytuj wygenerowanego `dist/`.

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

Na GitHub Pages workflow automatycznie przekazuje `steps.pages.outputs.base_url` jako `SITE_URL`. Build generuje wtedy absolutne canonical, wzajemne `hreflang` (w tym `x-default`), `sitemap.xml`, wpis sitemapy w `robots.txt` oraz podglądy Open Graph/Twitter z obrazem gry. Obsługiwane są również adresy z podkatalogiem repozytorium.

Na innym hostingu ustaw `SITE_URL`, np. `https://twoja-domena.pl/`, lub wpisz rzeczywisty adres w `siteUrl` w `public/data/site.json`. Zmienna środowiskowa ma pierwszeństwo. Bez adresu produkcyjnego build lokalny nie wymyśla domeny: generuje `robots.txt` i lokalne odnośniki językowe, ale pomija sitemapę, canonical i absolutne metadane społecznościowe.

Po zmianie domeny zbuduj stronę ponownie. Nie kopiuj sitemapy ze starego hostingu. Przełącznik języka prowadzi do rzeczywistych adresów, bez zależności od cookies lub języka przeglądarki. Stare linki `?lang=en` są obsługiwane przez przekierowanie JS do nowej wersji językowej.

Po publikacji dodaj rzeczywistą domenę do Google Search Console, potwierdź własność i zgłoś `sitemap.xml`. Sprawdź indeksowanie adresów oraz Core Web Vitals/PageSpeed na publicznym hostingu; lokalne testy nie gwarantują pozycji ani wyniku wydajności. Dane strukturalne `VideoGame` opisują grę, bez fikcyjnych ocen, cen i dat premiery. Politykę prywatności odwiedzający znajdzie w stopce.

## GitHub i automatyczny deploy

Repozytorium lokalne jest gotowe. Zdalne repozytorium i hosting nie zostały jeszcze utworzone.

1. Utwórz puste repozytorium GitHub, np. `starmess-website` (bez początkowego README).
2. W katalogu **website**, nie w repozytorium gry:

   ```sh
   git remote add origin https://github.com/TWOJ_LOGIN/starmess-website.git
   git push -u origin main
   ```

3. GitHub → repo → **Settings → Pages → Source: GitHub Actions**.
4. Uruchom workflow „Deploy StarMess website” ręcznie albo wypchnij kolejny commit do `main`. Workflow sprawdza treść, buduje stronę i publikuje `dist/`.
5. Kolejne `git push` do `main` automatycznie aktualizują stronę. Ustawienia środowiska `github-pages` mogą wymagać zatwierdzenia zależnie od konfiguracji repozytorium.

Publiczne repozytorium może używać GitHub Pages na darmowym planie; dostępność dla prywatnych repozytoriów zależy od planu. Nie publikuj prywatnych materiałów w publicznym repozytorium.

## Pochodzenie materiałów

Grafiki i kadry: projekt StarMess, `docs/previews/` i `assets/icons/`. Roboto Mono i Pixelify Sans: lokalne fonty projektu, licencje OFL w `public/assets/`. Roboto Mono jest fontem interfejsu; Pixelify Sans używany jest tylko w logo. Kadry przedstawiają prototyp, nie gwarancję finalnego wyglądu.

## Dokumentacja integracji

- [Oficjalny TikTok Embed Player](https://developers.tiktok.com/doc/embed-player/)
- [GitHub Pages: custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

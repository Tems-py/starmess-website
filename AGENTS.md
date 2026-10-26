# StarMess website

Osobny projekt i repozytorium strony, niezależne od gry nadrzędnej. Zmiany strony zapisuj wyłącznie w tym repozytorium; nie podbijaj wersji gry i nie buduj JAR za zmiany witryny.

- Font UI: Roboto Mono; Pixelify Sans tylko w logo. Zachowuj styl i proporcje grafik gry.
- Każdy tekst strony dodawaj do PL/EN/RU w public/locales. Nie reklamuj planowanych funkcji jako gotowych.
- Linki zewnętrzne i filmy konfiguruje public/data/site.json. Nie wymyślaj URL-i ani ID filmów.
- TikTok iframe ładuje się dopiero po świadomym kliknięciu. Zachowaj link zapasowy do filmu.
- npm test i npm run build przed commitem zmian funkcjonalnych. Wersja strony i jej CHANGELOG.md są niezależne od wersji gry.
- dist i node_modules pozostają poza historią. Nie dodawaj plików .local ani zasobów spoza public.
- Vercel buduje repo strony przez integrację GitHub i vercel.json. GitHub Actions wykonuje wyłącznie kontrole, bez deployu Pages. Import changelogu gry jest jawny: npm run sync:game.
- SEO: zachowuj pełny statyczny HTML w /pl/, /en/, /ru/ i prawdziwe linki do języków. Treść galerii i changelogu musi być dostępna bez JS. Nie zastępuj archiwum pobieraniem treści dopiero po kliknięciu.
- Domyślny język strony to angielski: strona główna i x-default wskazują EN. Polski jest dodatkowy pod /pl/; zachowaj też /ru/.
- SITE_URL, siteUrl w konfiguracji lub VERCEL_PROJECT_PRODUCTION_URL jest źródłem adresów canonical, hreflang, obrazów społecznościowych i sitemapy. Podglądy Vercel mają noindex i wskazują canonical produkcji. Nie wpisuj fikcyjnej domeny. Dane strukturalne nie mogą zawierać wymyślonych ocen, cen ani dat premiery.

# StarMess website

Osobny projekt i repozytorium strony, niezależne od gry nadrzędnej. Zmiany strony zapisuj wyłącznie w tym repozytorium; nie podbijaj wersji gry i nie buduj JAR za zmiany witryny.

- Font UI: Roboto Mono; Pixelify Sans tylko w logo. Zachowuj styl i proporcje grafik gry.
- Każdy tekst strony dodawaj do PL/EN/RU w public/locales. Nie reklamuj planowanych funkcji jako gotowych.
- Linki zewnętrzne i filmy konfiguruje public/data/site.json. Nie wymyślaj URL-i ani ID filmów.
- TikTok iframe ładuje się dopiero po świadomym kliknięciu. Zachowaj link zapasowy do filmu.
- npm test i npm run build przed commitem zmian funkcjonalnych. Wersja strony i jej CHANGELOG.md są niezależne od wersji gry.
- dist i node_modules pozostają poza historią. Nie dodawaj plików .local ani zasobów spoza public.
- GitHub Pages buduje repo strony samodzielnie. Import changelogu gry jest jawny: npm run sync:game.

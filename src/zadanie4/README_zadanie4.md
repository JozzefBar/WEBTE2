# Dokumentácia: Kam na dovolenku? (Zadanie 4)

Táto aplikácia je postavená na frameworku **Laravel 11** a slúži ako vyhľadávač a porovnávač dovolenkových destinácií na základe užívateľských preferencií.

## Prečo má zadanie 4 vlastný priečinok `vendor`?

Všimli ste si, že sa inštalovali závislosti do `src/zadanie4/vendor`, aj keď v `src/vendor` už nejaké sú z 2. zadania.
Je to **správny a štandardný prístup**, pretože:
1. **Laravel je obrovský framework:** Na rozdiel od 2. zadania (kde boli len 3 knižnice pre 2FA a Google), Laravel vyžaduje takmer 100 rôznych balíčkov (Symfony komponenty, Guzzle, atď.).
2. **Autoloader a menné priestory:** Laravel očakáva, že má svoj vlastný `composer.json` s nastavenými cestami pre `App\` (modely, controllery) a ďalšie veci. Zlúčenie do jedného `src/composer.json` by vyžadovalo neštandardné prepisovanie ciest a mohlo by rozbiť fungovanie zadania 2 aj zadania 4.
3. **Izolácia:** Je dobrým zvykom mať oddelené projekty plne izolované. Zabraňuje to konfliktom verzií.

Dobrá správa je, že inštalácia z predchádzajúceho kroku už **úspešne zbehla do konca**, takže databáza je naplnená a aplikácia by mala fungovať.

---

## Architektúra a funkčnosť

### 1. Databáza a Modely
Aplikácia využíva MySQL (MariaDB v Dockeri) a pozostáva z týchto tabuliek:
- **`destinations`** (`Destination.php`): Základné údaje o destinácii (názov, štát, mena, letové hodiny, koordináty).
- **`destination_types`** (`DestinationType.php`): Pivot tabuľka pre typy destinácií (more, hory, mesto...). Jedna destinácia môže mať viacero typov.
- **`monthly_weather`** (`MonthlyWeather.php`): Historické priemerné teploty pre každý z 12 mesiacov.
- **`visits`** (`Visit.php`): Tabuľka pre ukladanie štatistík návštev. **Neukladá IP adresu**, ale iba jej SHA-256 hash.
- **`searches`** (`Search.php`): Štatistiky vyhľadávania a prezerania (ktorá destinácia, mesiac, atď.).

**Súbory:** `app/Models/*`, `database/migrations/*`, `database/seeders/*`

### 2. Formulár a Vyhľadávanie
- **`HomeController@index`**: Zobrazuje hlavnú stránku (`home.blade.php`) s formulárom.
- **`SearchController@search`**: Tu sa nachádza **jadro logiky**.
  - Zoberie preferencie z formulára (mesiac, teplota, vzdialenosť, typy).
  - Každú destináciu ohodnotí bodmi (napr. zhoda typu +30b, zhoda vzdialenosti +20b).
  - Destinácie zoradí od najlepšej a výsledok pošle do `results.blade.php`.
  - Zároveň uloží štatistiku o vyhľadávaní do tabuľky `searches`.

### 3. Detail Destinácie a API
- **`DestinationController@show`**: Zobrazuje kartu destinácie (`destination.blade.php`).
  - Získa historické počasie z databázy.
  - Využíva **Open-Meteo API** (`https://api.open-meteo.com/v1/forecast`) pre stiahnutie aktuálnej teploty a vlhkosti. Tieto dáta cachuje na 1 hodinu.
  - Využíva **Frankfurter API** (`https://api.frankfurter.dev/v1/latest`) pre získanie kurzu meny (ak sa v krajine neplatí Eurom). Tieto dáta cachuje na 24 hodín.
  - Súčasťou je aj funkcia `generateWhyNow()`, ktorá na základe dostupných údajov o počasí a lete automaticky vygeneruje krátky text "Prečo práve teraz".

### 4. Porovnanie
- V zozname výsledkov si užívateľ môže zaškrtnúť presne 2 destinácie.
- **`DestinationController@compare`**: Zobrazí `compare.blade.php`, kde sa vedľa seba v tabuľke porovnajú teploty, typy, dĺžka letu a meny.

### 5. Štatistiky a Sledovanie Návštevnosti
- **`TrackVisit.php` (Middleware)**: Pri každej požiadavke na aplikáciu skontroluje hashovanú IP adresu. Ak tento hash nebol videný za posledných 60 minút, započíta sa to ako "unikátna návšteva". Ukladá sa aj to, či ide o ráno, poobedie, atď.
- **`StatisticsController@index`**: Združuje dáta (celkové návštevy, grafy podľa dennej doby, zoznam najhľadanejších destinácií a grafy preferencií) a pošle ich do `statistics.blade.php`, ktorý ich vykreslí pomocou knižnice Chart.js.

---

## Ako aplikáciu otestovať?
1. Otvorte prehliadač a choďte na **http://localhost:8080/zadanie4/** (vďaka novému nastaveniu Nginx vás to presmeruje do Laravelu).
2. Zadajte preferencie a kliknite na "Nájsť destinácie".
3. Rozkliknite si nejakú destináciu a pozrite sa na načítané počasie a menu.
4. Vyberte dve destinácie a otestujte ich porovnanie.
5. Prekliknite sa do záložky "Štatistiky", kde uvidíte zozbierané dáta o vašich vlastných dopytoch a návštevách (tabuľka sa dá triediť kliknutím na hlavičky stĺpcov).

## Zhrnutie splnenia podmienok zadania
- ✅ **PHP framework Laravel** bol použitý.
- ✅ **Formulár (Kedy, Ako dlho, Čo, Teplota, Vzdialenosť)** je vytvorený.
- ✅ **Výsledky** ukazujú prečo sú odporúčané (body za zhodu, vypísané dôvody).
- ✅ **Karta destinácie** obsahuje historické počasie, aktuálnu predpoveď, vlajky, menu z externého API a automaticky vygenerovaný text "Prečo práve teraz".
- ✅ **Porovnanie 2 destinácií** v prehľadnej tabuľke funguje.
- ✅ **Štatistiky** majú počítadlo návštev a unikátov bez ukladania IP, grafy a zotriediteľnú tabuľku dopytov.
- ✅ **Databáza destinácií** je naplnená ~35 destináciami.

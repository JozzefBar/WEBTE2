# Technická správa – Zadanie 1

## Zmeny v konfigurácii VPS / servera

Pri nasadení bolo potrebné upraviť konfiguráciu servera kvôli nahrávaniu väčších CSV súborov:
- Boli upravené PHP limity na väčšie hodnoty pomocou lokálneho súboru `.user.ini` v koreňovom adresári backendu (napr. `upload_max_filesize = 500M` a `post_max_size = 500M`). Tým sa prekonali prednastavené FPM obmedzenia pre tento špecifický projekt.

Súbor `client_secret.json` pre Google OAuth bol z bezpečnostných dôvodov uložený mimo verejne prístupného webového adresára na `/var/www/client_secret.json`.

## Dodatočne nainštalované systémové balíky

- `php8.3`
- `mariadb-server`
- `nginx`
- `nodejs`, `npm`
- `composer`

## Použité frameworky a knižnice

### Frontend
- React (Vite) – JavaScript GUI framework
- Bootstrap – CSS framework + ikony
- DataTables – tabuľky so stránkovaním a sortovaním
- Google Fonts – Inter, Poppins, sans-serif

### Backend
- Google API PHP Client – OAuth2 prihlásenie
- RobThree/TwoFactorAuth – 2FA (TOTP)
- BaconQrCode – generovanie QR kódov

## Postup nasadenia

### 1. Inštalácia systémových závislostí

```bash
sudo apt update
sudo apt install php8.3 
sudo apt install mariadb-server nginx
sudo apt install nodejs npm
sudo apt install composer
```

### 2. Konfigurácia a vytvorenie databázy

Databáza bola vytvorená na serveri v MariaDB. 
Vytvorené boli tabuľky:
`athletes`, `countries`, `disciplines`, `login_history`, 
`olympic_games`, `medal_types`, `athletes_medals`, `user`.


### 3. Backend – inštalácia závislostí a konfigurácia

```bash
cd zadanie1/backend
composer install
```

Upraviť prihlasovacie údaje k databáze v súbore `backend/config.php`:

### 4. Frontend – inštalácia závislostí a build

```bash
cd zadanie1/frontend
npm install
npm run build
```

Výstupné súbory sa vygenerujú do priečinka `frontend/dist/`.

### 5. Naplnenie databázy

1. Otvoriť aplikáciu v prehliadači
2. Zaregistrovať sa a prihlásiť sa
3. Na stránke „Dashboard" nahrať CSV súbor cez sekciu „Import dát"

## 6. Architektúra vlastného REST API (Zadanie 2)

V rámci druhého zadania bola implementovaná plnohodnotná **REST API architektúra**, ktorá oddeľuje logiku smerovania od samotného spracovania požiadaviek a komunikuje čisto cez formát **JSON**.

**Technické riešenie API:**
- **Vlastný Router (`Router.php`):** Aplikácia využíva vlastnú implementáciu smerovača (Router), ktorá zachytáva prichádzajúce HTTP metódy (`GET`, `POST`, `PUT`, `DELETE`) a spáruje ich s príslušnou cestou (napr. `/athletes` alebo dynamickou metódou `/athletes/{id}`).
- **Controllers (napr. `AthleteController.php`):** Logika je rozdelená do kontrolérov. Router po nájdení zhody inštanciuje konkrétny kontrolér a zavolá v ňom príslušnú metódu (napríklad pre `GET /athletes/{id}` sa zavolá metóda `show($id)`). API tak dodržiava základný návrhový vzor MVC.
- **Smerovanie (`index.php`):** Pre podporu pekných URL adries (bez priameho využitia `/index.php/...`) sa na Nginx servri (alebo lokálne cez Vite dev-server) presmerovávajú API požiadavky na backendový `index.php?_route=...`. Náš `Router` následne parsuje tento parameter.
- **HTTP Návratové kódy a JSON:** API poctivo vracia príslušné stavové kódy ako `200 OK`, `201 Created`, `400 Bad Request` a `404 Not Found`, pričom celá komunikácia a odovzdávanie dát (`Response::json`) je striktne v JSON formáte.
- **Integrácia s Frontend-om (`api.js`):** Na strane Reactu je vytvorená centrálna vrstva pre REST volania pomocou `fetch`, ktorá obsluhuje CRUD operácie (vytváranie, mazanie a úpravu športovcov).

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

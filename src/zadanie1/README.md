# Technická správa – Zadanie 1

## Zmeny v konfigurácii VPS servera

- Povolenie portov 80, 443 a 8080 v ufw firewalle
- Nastavenie Nginx ako reverse proxy pre PHP backend (port 8080)
- Konfigurácia PHP-FPM s php8.3-fpm soketom
- Nastavenie Nginx pre servovanie React build súborov (frontend)

## Dodatočne nainštalované systémové balíky

- `php8.3`, `php8.3-fpm`, `php8.3-mysql`, `php8.3-mbstring`, `php8.3-xml`, `php8.3-curl`
- `mariadb-server`
- `nginx`
- `nodejs`, `npm`
- `composer`

## Použité frameworky a knižnice

### Frontend
- React (Vite) – JavaScript GUI framework
- Bootstrap 5.3.3 – CSS framework + ikony
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
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl
sudo apt install mariadb-server nginx
sudo apt install nodejs npm
sudo apt install composer
```

### 2. Konfigurácia a vytvorenie databázy

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'heslo';
GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import štruktúry tabuliek:

```bash
mysql -u app_user -p app_db < app_db.sql
```

### 3. Backend – inštalácia závislostí a konfigurácia

```bash
cd zadanie1/backend
composer install
```

Upraviť prihlasovacie údaje k databáze v súbore `backend/config.php`:

```php
$hostname = "localhost";
$database = "app_db";
$username = "app_user";
$password = "heslo";
```

### 4. Frontend – inštalácia závislostí a build

```bash
cd zadanie1/frontend
npm install
npm run build
```

Výstupné súbory sa vygenerujú do priečinka `frontend/dist/`.

### 5. Konfigurácia Nginx

Nakonfigurovať Nginx tak, aby servoval frontend z `dist/` a backend cez PHP-FPM. Nastaviť PHP-FPM soket v konfigurácii Nginx.

### 6. Naplnenie databázy

1. Otvoriť aplikáciu v prehliadači
2. Zaregistrovať sa a prihlásiť sa
3. Na stránke „Dashboard" nahrať CSV súbor cez sekciu „Import dát"

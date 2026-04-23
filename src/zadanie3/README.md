# WEBTE2 Zadanie 3 — Online Curling

Online curling hra pre dvoch hráčov v reálnom čase cez WebSockety (socket.io).
Rendering pomocou Canvas API, fyzika pomocou Matter.js.


## Použité frameworky / knižnice

### Server (Node.js)
- **express** `^4.21.0` — HTTP server (na lokáli servuje aj statiku)
- **socket.io** `^4.8.0` — WebSocket server (autorita nad stavom hry)

### Klient (prehliadač)
- **matter-js** `0.19.0` — fyzika (kolízie, trenie, odrazy) — cez CDN
- **socket.io-client** — WebSocket klient — servovaný socket.io serverom
- **bootstrap-icons** `1.11.1` — ikony — cez CDN
- Google Fonts (Inter) — typografia

## Lokálne spustenie

```sh
npm install
npm start
# Otvor http://localhost:3000
```

## Nasadenie na VPS (node26.webte.fei.stuba.sk)

### Predpoklady na VPS
- Node.js nainštalovaný cez nvm (verzia 24.x)
- Nginx
- SSL certifikát (už existuje pre `*.webte.fei.stuba.sk`)

### 1. Inštalácia závislostí na VPS

```sh
cd ~/z3-server
npm install --omit=dev
```

### 2. Nginx konfigurácia

Do `server { listen 443 ssl; ... }` bloku pridať:

```nginx
location = /Z3 {
    return 301 /Z3/;
}

location ^~ /Z3/ {
    root /var/www/node26.webte.fei.stuba.sk/;
    try_files $uri $uri/ /Z3/index.html;
    index index.html;
}

location /z3-ws/ {
    proxy_pass http://localhost:3001/;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

Poznámka: Z3 používa port **3001** a vlastný WS endpoint `/z3-ws/`, pretože
port 3000 a cestu `/ws/` už obsadzuje chat-app aplikácia zo cvičenia.

```sh
sudo nginx -t
sudo systemctl reload nginx
```

### 2a. Úprava portu a klient-side ciest

V `/home/xbarcakj/z3-server/server.js` nastaviť port:
```js
const PORT = 3001;
```

V `/var/www/node26.webte.fei.stuba.sk/Z3/index.html`:
```html
<script src="/z3-ws/socket.io/socket.io.js"></script>
```

V `/var/www/node26.webte.fei.stuba.sk/Z3/js/network.js` — inicializácia socketu
(auto-detect lokál vs. produkcia):
```js
const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
socket = isLocal ? io() : io({ path: '/z3-ws/socket.io' });
```

### 3. Systemd služba

```sh
sudo nano /etc/systemd/system/z3-curling.service
```

```ini
[Unit]
Description=Z3 Curling WebSocket Server
After=network.target

[Service]
WorkingDirectory=/home/xusername/z3-server
ExecStart=/home/xusername/.nvm/versions/node/v24.14.1/bin/node server.js
Restart=always
User=xusername

[Install]
WantedBy=multi-user.target
```

Cestu k `node` zistíš cez `which node`. `xusername` nahraď svojím loginom.

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now z3-curling
sudo systemctl status z3-curling
```

### 4. Overenie

- https://node26.webte.fei.stuba.sk/Z3/ — hra sa načíta
- Otvoriť DevTools → Network → WS: mala by byť aktívna socket.io connection
  na `wss://node26.webte.fei.stuba.sk/z3-ws/socket.io/...`
- Logy služby: `sudo journalctl -u z3-curling -f`

## Zmeny na VPS oproti default inštalácii

- Nainštalovaný **Node.js 24.x** cez `nvm`
- Pridané **Nginx location bloky `/Z3/` a `/z3-ws/`**
- Pridaná **systemd služba `z3-curling`** pre Node WS server na porte 3001
- Blok `location /ws/ { ... }` (port 3000) z cvičenia ostal nedotknutý — patrí chat-app

Žiadne ďalšie systémové balíky navyše.

## Ako hra komunikuje

1. Klient otvorí `https://node26.../Z3/` → Nginx pošle statiku z `/var/www/.../Z3/`
2. Prehliadač načíta `/z3-ws/socket.io/socket.io.js` → Nginx proxuje na Node (localhost:3001) → Node vráti klient skript
3. Klient spustí `io({ path: '/z3-ws/socket.io' })` → WebSocket upgrade cez Nginx proxy → Node
4. Server (autorita):
   - Páruje čakajúcich hráčov do miestností (`join-lobby` → `game-matched`)
   - Pri `shoot` prepošle vektor oboma klientom (`shot-fired`) — oba klienti robia rovnakú fyzikálnu simuláciu (determinizmus)
   - Striedanie ťahov, pauza, reštart, disconnect — autoritatívne
5. Fyzika (Matter.js) beží **na klientoch**, server nevykonáva simuláciu

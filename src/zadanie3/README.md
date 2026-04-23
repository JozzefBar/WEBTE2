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

```nginx
location = /Z3 {
    return 301 /Z3/;
}

location ^~ /Z3/ {
    root /var/www/node26.webte.fei.stuba.sk/;
    try_files $uri $uri/ /Z3/index.html;
    index index.html;
}
```

Blok `location /ws/ { proxy_pass http://localhost:3000/; ... }` je už nakonfigurovaný.

```sh
sudo nginx -t
sudo systemctl reload nginx
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
  na `wss://node26.webte.fei.stuba.sk/ws/socket.io/...`
- Logy služby: `sudo journalctl -u z3-curling -f`

## Zmeny na VPS oproti default inštalácii

- Nainštalovaný **Node.js 24.x** cez `nvm`
- Pridaný **Nginx location blok `/Z3/`** (viď vyššie)
- Pridaná **systemd služba `z3-curling`** pre Node WS server
- Blok `location /ws/ { ... }` v Nginx (bol pridaný už v rámci cvičenia WebSockets)

Žiadne ďalšie systémové balíky navyše.

## Ako hra komunikuje

1. Klient otvorí `https://node26.../Z3/` → Nginx pošle statiku
2. Prehliadač načíta `/ws/socket.io/socket.io.js` → Nginx proxuje na Node → Node vráti klient skript
3. Klient spustí `io({ path: '/ws/socket.io' })` → WebSocket upgrade cez Nginx proxy → Node
4. Server (autorita):
   - Páruje čakajúcich hráčov do miestností (`join-lobby` → `game-matched`)
   - Pri `shoot` prepošle vektor oboma klientom (`shot-fired`) — oba klienti robia rovnakú fyzikálnu simuláciu (determinizmus)
   - Striedanie ťahov, pauza, reštart, disconnect — autoritatívne
5. Fyzika (Matter.js) beží **na klientoch**, server nevykonáva simuláciu

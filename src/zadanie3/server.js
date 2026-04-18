// ============================================================
// SERVER.JS — WebSocket server pre online curling hru
// Pouziva Express (servovanie statickych suborov) + Socket.io (WebSockety)
// ============================================================
// [ZADANIE: WebSocket synchronizacia, Herna logika, Zakladne herne prvky]

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// --- Nacitanie hernej konfiguracie z externeho JSON suboru ---
// [ZADANIE: Konfiguracia - parametre hry z externeho suboru]
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

// --- Inicializacia Express + HTTP servera ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servovanie statickych suborov (HTML, CSS, JS) z priecinka 'public'
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint — klient si stiahne konfiguraciu hry
app.get('/config', (req, res) => {
  res.json(config);
});

// ============================================================
// HERNA LOGIKA NA SERVERI
// ============================================================
// [ZADANIE: Server plni ulohu autority nad stavom hry —
//  riadi striedanie hracov a odosiela herne udalosti]

// Fronta cakajucich hracov (lobby)
let waitingPlayer = null;

// Aktivne herne miestnosti
const rooms = {};
let roomCounter = 0;

// --- WebSocket udalosti ---
io.on('connection', (socket) => {
  console.log(`[+] Hrac pripojeny: ${socket.id}`);

  // ----------------------------------------------------------
  // PRIHLASENIE / LOBBY
  // [ZADANIE: Pred zaciatkom hry sa hrac prihlasi menom.
  //  Server sparuje dvoch cakajucich hracov do jednej miestnosti.
  //  Pokial caka len jeden, zobrazi sa mu cakacia obrazovka.]
  // ----------------------------------------------------------
  socket.on('join-lobby', (data) => {
    const playerName = data.name || 'Anonym';
    console.log(`[LOBBY] ${playerName} (${socket.id}) sa pripaja`);

    // Ak uz niekto caka a nie je to ten isty hrac
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      // Sparujeme dvoch hracov do novej miestnosti
      const roomId = `room-${++roomCounter}`;
      console.log(`[ROOM] Vytvorena miestnost ${roomId}: ${waitingPlayer.name} vs ${playerName}`);

      // Struktura miestnosti — uchovava stav hry
      rooms[roomId] = {
        players: [
          { id: waitingPlayer.id, name: waitingPlayer.name, index: 0 },
          { id: socket.id, name: playerName, index: 1 }
        ],
        currentPlayer: 0,        // kto je na tahu (0 alebo 1)
        stonesThrown: [0, 0],    // kolko kamenov uz kazdy hrac hodil
        paused: false,           // ci je hra pozastavena
        pausedBy: null,          // kto pozastavil
        gameOver: false,         // ci hra skoncila
        gameStarted: false,      // ci hra uz zacala
        readyPlayers: new Set(), // hraci pripraveni zacat
        restartRequests: new Set() // ziadosti o restart
      };

      // Socket.io rooms — oba hraci sa pripoja do spolocnej miestnosti
      waitingPlayer.socket.join(roomId);
      socket.join(roomId);

      // Ulozime roomId a index hraca na socket pre neskorsi pristup
      waitingPlayer.socket.data.roomId = roomId;
      waitingPlayer.socket.data.playerIndex = 0;
      waitingPlayer.socket.data.playerName = waitingPlayer.name;
      socket.data.roomId = roomId;
      socket.data.playerIndex = 1;
      socket.data.playerName = playerName;

      // Posleme obom hracom informaciu o sparovani
      io.to(waitingPlayer.id).emit('game-matched', {
        roomId,
        playerIndex: 0,
        opponentName: playerName,
        config
      });
      io.to(socket.id).emit('game-matched', {
        roomId,
        playerIndex: 1,
        opponentName: waitingPlayer.name,
        config
      });

      // Vymazeme cakajuceho hraca
      waitingPlayer = null;

    } else {
      // Prvy hrac — caka na supera
      waitingPlayer = { id: socket.id, name: playerName, socket };
      socket.emit('waiting');
      console.log(`[LOBBY] ${playerName} caka na supera...`);
    }
  });

  // ----------------------------------------------------------
  // ZACATIE HRY
  // [ZADANIE: Hlavne menu — spustit hru po sparovani]
  // ----------------------------------------------------------
  socket.on('start-game', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.readyPlayers.add(socket.data.playerIndex);
    console.log(`[GAME] Hrac ${socket.data.playerIndex} pripraveny v ${roomId}`);

    // Ked su obaja hraci pripraveni, hra zacina
    if (room.readyPlayers.size >= 2) {
      room.gameStarted = true;
      room.currentPlayer = 0;
      room.stonesThrown = [0, 0];
      room.gameOver = false;
      room.paused = false;
      // Prvy hrac zacina
      io.to(roomId).emit('game-start', { firstPlayer: 0 });
      console.log(`[GAME] Hra zacala v ${roomId}`);
    } else {
      // Informujeme hraca, ze cakame na druheho
      socket.emit('waiting-for-opponent-start');
    }
  });

  // ----------------------------------------------------------
  // VYSTREL KAMENA
  // [ZADANIE: Klient posiela serveru vektor vystrelu (smer a silu).
  //  Server tieto data preposle druhemu klientovi.
  //  Fyzikalna simulacia bezi na strane klientov.]
  // ----------------------------------------------------------
  socket.on('shoot', (data) => {
    const roomId = socket.data.roomId;
    const playerIndex = socket.data.playerIndex;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];

    // Kontrola ci je hrac na tahu a hra nie je pozastavena
    if (room.currentPlayer !== playerIndex) return;
    if (room.paused || room.gameOver) return;

    // Zvysime pocet odhozenych kamenov
    room.stonesThrown[playerIndex]++;

    console.log(`[SHOOT] Hrac ${playerIndex} hodil kamen ${room.stonesThrown[playerIndex]} v ${roomId}`);

    // Posielame OBOM klientom informaciu o vystrele
    // Obaja dostanu rovnake vstupne parametre pre fyziku
    io.to(roomId).emit('shot-fired', {
      playerIndex,
      stoneIndex: room.stonesThrown[playerIndex] - 1,
      dx: data.dx,
      dy: data.dy
    });
  });

  // ----------------------------------------------------------
  // KAMENE SA ZASTAVILI — prepnutie tahu
  // [ZADANIE: Dalsi hrac moze hadzat az vtedy, ked sa vsetky
  //  kamene na ploche uplne zastavia.]
  // ----------------------------------------------------------
  socket.on('stones-stopped', () => {
    const roomId = socket.data.roomId;
    const playerIndex = socket.data.playerIndex;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    // Len aktivny hrac reportuje zastavenie
    if (room.currentPlayer !== playerIndex) return;

    const totalThrown = room.stonesThrown[0] + room.stonesThrown[1];
    const totalStones = config.stonesPerPlayer * 2;

    console.log(`[STOP] Kamene zastavene. Odhodene: ${totalThrown}/${totalStones}`);

    if (totalThrown >= totalStones) {
      // Vsetky kamene boli odhodene — koniec hry
      room.gameOver = true;
      io.to(roomId).emit('all-stones-thrown');
      console.log(`[GAME] Koniec hry v ${roomId}`);
    } else {
      // Zmena tahu na druheho hraca
      room.currentPlayer = room.currentPlayer === 0 ? 1 : 0;
      io.to(roomId).emit('turn-change', { currentPlayer: room.currentPlayer });
      console.log(`[TURN] Na tahu je hrac ${room.currentPlayer}`);
    }
  });

  // ----------------------------------------------------------
  // PAUZA
  // [ZADANIE: Aktualny hrac moze hru kedykolvek pozastavit.
  //  Druhy hrac je o pauze informovany. Pauzu moze zrusit
  //  ktorykolvek hrac.]
  // ----------------------------------------------------------
  socket.on('pause', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    if (room.paused || room.gameOver) return;

    room.paused = true;
    room.pausedBy = socket.data.playerIndex;
    io.to(roomId).emit('game-paused', {
      pausedBy: socket.data.playerIndex,
      pausedByName: socket.data.playerName
    });
    console.log(`[PAUSE] Hra pozastavena hracom ${socket.data.playerIndex} v ${roomId}`);
  });

  socket.on('unpause', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    if (!room.paused) return;

    room.paused = false;
    room.pausedBy = null;
    io.to(roomId).emit('game-unpaused');
    console.log(`[UNPAUSE] Hra pokracuje v ${roomId}`);
  });

  // ----------------------------------------------------------
  // RESTART
  // [ZADANIE: Po skonceni hry (alebo kedykolvek pocas nej
  //  po vzajomnom suhlase) je mozne spustit novu hru.]
  // ----------------------------------------------------------
  socket.on('restart-request', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.restartRequests.add(socket.data.playerIndex);

    console.log(`[RESTART] Ziadost od hraca ${socket.data.playerIndex} v ${roomId}`);

    // Po skonceni hry staci ziadost jedneho hraca
    // Pocas hry treba suhlas oboch
    if (room.gameOver || room.restartRequests.size >= 2) {
      // Reset stavu miestnosti
      room.currentPlayer = 0;
      room.stonesThrown = [0, 0];
      room.gameOver = false;
      room.gameStarted = false;
      room.paused = false;
      room.pausedBy = null;
      room.restartRequests.clear();
      room.readyPlayers = new Set();

      io.to(roomId).emit('game-restart');
      console.log(`[RESTART] Hra restartovana v ${roomId}`);
    } else {
      // Informujeme druheho hraca o ziadosti
      const otherPlayer = room.players.find(p => p.index !== socket.data.playerIndex);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('restart-requested', {
          fromName: socket.data.playerName
        });
      }
    }
  });

  // Suhlas s restartom (druhy hrac)
  socket.on('restart-accept', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.restartRequests.add(socket.data.playerIndex);

    if (room.restartRequests.size >= 2) {
      room.currentPlayer = 0;
      room.stonesThrown = [0, 0];
      room.gameOver = false;
      room.gameStarted = false;
      room.paused = false;
      room.pausedBy = null;
      room.restartRequests.clear();
      room.readyPlayers = new Set();

      io.to(roomId).emit('game-restart');
      console.log(`[RESTART] Restart schvaleny v ${roomId}`);
    }
  });

  // Zamietnutie restartu
  socket.on('restart-reject', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.restartRequests.clear();

    const otherPlayer = room.players.find(p => p.index !== socket.data.playerIndex);
    if (otherPlayer) {
      io.to(otherPlayer.id).emit('restart-rejected');
    }
  });

  // ----------------------------------------------------------
  // ODPOJENIE HRACA
  // [ZADANIE: Ak niektory hrac zatvori prehliadac alebo prerusi
  //  spojenie, druhy hrac je o tom informovany a hra sa
  //  korektne ukonci.]
  // ----------------------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[-] Hrac odpojeny: ${socket.id}`);

    // Ak cakajuci hrac sa odpojil
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
      console.log(`[LOBBY] Cakajuci hrac odisiel`);
      return;
    }

    // Ak bol v aktivnej hre — informujeme supera
    const roomId = socket.data?.roomId;
    if (roomId && rooms[roomId]) {
      io.to(roomId).emit('opponent-disconnected');
      delete rooms[roomId];
      console.log(`[ROOM] Miestnost ${roomId} zrusena (hrac odisiel)`);
    }
  });
});

// --- Spustenie servera ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`+------------------------------------------+`);
  console.log(`|  🥌 Curling server bezi na porte ${PORT}      |`);
  console.log(`|  http://localhost:${PORT}                   |`);
  console.log(`+------------------------------------------+`);
});

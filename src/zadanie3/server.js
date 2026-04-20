// ============================================================
// SERVER.JS — WebSocket server for online curling game
// Uses Express (serves static files) + Socket.io (WebSockets)
// ============================================================
// [ASSIGNMENT: WebSocket synchronization, Game logic, Core game elements]

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// --- Load game configuration from external JSON file ---
// [ASSIGNMENT: Configuration - game parameters from an external file]
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

// --- Initialization of Express + HTTP server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serving static files (HTML, CSS, JS) from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint — client downloads game configuration
app.get('/config', (req, res) => {
  res.json(config);
});

// ============================================================
// SERVER-SIDE GAME LOGIC
// ============================================================
// [ASSIGNMENT: Server acts as authority over game state —
//  manages player turns and broadcasts game events]

// Queue of waiting players (lobby)
let waitingPlayer = null;

// Active game rooms
const rooms = {};
let roomCounter = 0;

// --- WebSocket events ---
io.on('connection', (socket) => {
  console.log(`[+] Hrac pripojeny: ${socket.id}`);

  // ----------------------------------------------------------
  // LOGIN / LOBBY
  // [ASSIGNMENT: Before starting the game, player logs in with a name.
  //  Server pairs two waiting players into one room.
  //  If only one is waiting, they see a waiting screen.]
  // ----------------------------------------------------------
  socket.on('join-lobby', (data) => {
    const playerName = data.name || 'Anonym';
    console.log(`[LOBBY] ${playerName} (${socket.id}) sa pripaja`);

    // If someone is already waiting and it's not the same player
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      // Pair two players into a new room
      const roomId = `room-${++roomCounter}`;
      console.log(`[ROOM] Vytvorena miestnost ${roomId}: ${waitingPlayer.name} vs ${playerName}`);

      // Room structure — holds game state
      rooms[roomId] = {
        players: [
          { id: waitingPlayer.id, name: waitingPlayer.name, index: 0 },
          { id: socket.id, name: playerName, index: 1 }
        ],
        currentPlayer: 0,        // whose turn it is (0 or 1)
        stonesThrown: [0, 0],    // how many stones each player has thrown
        paused: false,           // is game paused
        pausedBy: null,          // who paused
        gameOver: false,         // is game over
        gameStarted: false,      // has game started
        readyPlayers: new Set(), // players ready to start
        restartRequests: new Set() // restart requests
      };

      // Socket.io rooms — both players join a shared room
      waitingPlayer.socket.join(roomId);
      socket.join(roomId);

      // Save roomId and player index to socket for later access
      waitingPlayer.socket.data.roomId = roomId;
      waitingPlayer.socket.data.playerIndex = 0;
      waitingPlayer.socket.data.playerName = waitingPlayer.name;
      socket.data.roomId = roomId;
      socket.data.playerIndex = 1;
      socket.data.playerName = playerName;

      // Send pairing information to both players
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

      // Delete waiting player
      waitingPlayer = null;

    } else {
      // First player — waits for opponent
      waitingPlayer = { id: socket.id, name: playerName, socket };
      socket.emit('waiting');
      console.log(`[LOBBY] ${playerName} caka na supera...`);
    }
  });

  // ----------------------------------------------------------
  // START GAME
  // [ASSIGNMENT: Main menu — start game after pairing]
  // ----------------------------------------------------------
  socket.on('start-game', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.readyPlayers.add(socket.data.playerIndex);
    console.log(`[GAME] Hrac ${socket.data.playerIndex} pripraveny v ${roomId}`);

    // When both players are ready, game starts
    if (room.readyPlayers.size >= 2) {
      room.gameStarted = true;
      room.currentPlayer = 0;
      room.stonesThrown = [0, 0];
      room.gameOver = false;
      room.paused = false;
      // First player starts
      io.to(roomId).emit('game-start', { firstPlayer: 0 });
      console.log(`[GAME] Hra zacala v ${roomId}`);
    } else {
      // Inform player that we are waiting for the opponent
      socket.emit('waiting-for-opponent-start');
      
      // Inform other player that the opponent wants to start
      const otherPlayer = room.players.find(p => p.index !== socket.data.playerIndex);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('opponent-ready');
      }
    }
  });

  // ----------------------------------------------------------
  // SHOOT STONE
  // [ASSIGNMENT: Client sends the server a shot vector (direction and power).
  //  Server forwards this data to the other client.
  //  Physics simulation runs on the clients' side.]
  // ----------------------------------------------------------
  socket.on('shoot', (data) => {
    const roomId = socket.data.roomId;
    const playerIndex = socket.data.playerIndex;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];

    // Check if it's the player's turn and the game is not paused
    if (room.currentPlayer !== playerIndex) return;
    if (room.paused || room.gameOver) return;

    // Increase thrown stones count
    room.stonesThrown[playerIndex]++;

    console.log(`[SHOOT] Hrac ${playerIndex} hodil kamen ${room.stonesThrown[playerIndex]} v ${roomId}`);

    // Send shot info to BOTH clients
    // Both receive the same input parameters for physics
    io.to(roomId).emit('shot-fired', {
      playerIndex,
      stoneIndex: room.stonesThrown[playerIndex] - 1,
      dx: data.dx,
      dy: data.dy
    });
  });

  // ----------------------------------------------------------
  // STONES STOPPED — turn switch
  // [ASSIGNMENT: Next player can throw only when all
  //  stones on the board come to a complete stop.]
  // ----------------------------------------------------------
  socket.on('stones-stopped', () => {
    const roomId = socket.data.roomId;
    const playerIndex = socket.data.playerIndex;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    // Only the active player reports stopping
    if (room.currentPlayer !== playerIndex) return;

    const totalThrown = room.stonesThrown[0] + room.stonesThrown[1];
    const totalStones = config.stonesPerPlayer * 2;

    console.log(`[STOP] Kamene zastavene. Odhodene: ${totalThrown}/${totalStones}`);

    if (totalThrown >= totalStones) {
      // All stones were thrown — game over
      room.gameOver = true;
      io.to(roomId).emit('all-stones-thrown');
      console.log(`[GAME] Koniec hry v ${roomId}`);
    } else {
      // Change turn to the other player
      room.currentPlayer = room.currentPlayer === 0 ? 1 : 0;
      io.to(roomId).emit('turn-change', { currentPlayer: room.currentPlayer });
      console.log(`[TURN] Na tahu je hrac ${room.currentPlayer}`);
    }
  });

  // ----------------------------------------------------------
  // PAUSE
  // [ASSIGNMENT: Current player can pause the game anytime.
  //  Other player is informed of the pause. Pause can be canceled
  //  by any player.]
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
  // [ASSIGNMENT: After the game ends (or anytime during
  //  by mutual agreement) a new game can be started.]
  // ----------------------------------------------------------
  socket.on('restart-request', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    room.restartRequests.add(socket.data.playerIndex);

    console.log(`[RESTART] Ziadost od hraca ${socket.data.playerIndex} v ${roomId}`);

    // After game over, one player's request is enough
    // During game, both need to agree
    if (room.gameOver || room.restartRequests.size >= 2) {
      // Reset room state
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
      // Inform other player of request
      const otherPlayer = room.players.find(p => p.index !== socket.data.playerIndex);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('restart-requested', {
          fromName: socket.data.playerName
        });
      }
    }
  });

  // Agree to restart (second player)
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

  // Reject restart
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
  // PLAYER DISCONNECT
  // [ASSIGNMENT: If any player closes the browser or loses
  //  connection, other player is informed and game
  //  ends gracefully.]
  // ----------------------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[-] Hrac odpojeny: ${socket.id}`);

    // If waiting player disconnected
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
      console.log(`[LOBBY] Cakajuci hrac odisiel`);
      return;
    }

    // If in active game — inform opponent
    const roomId = socket.data?.roomId;
    if (roomId && rooms[roomId]) {
      io.to(roomId).emit('opponent-disconnected');
      delete rooms[roomId];
      console.log(`[ROOM] Miestnost ${roomId} zrusena (hrac odisiel)`);
    }
  });
});

// --- Start server ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`+------------------------------------------+`);
  console.log(`|  🥌 Curling server bezi na porte ${PORT}      |`);
  console.log(`|  http://localhost:${PORT}                   |`);
  console.log(`+------------------------------------------+`);
});

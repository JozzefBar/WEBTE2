// ============================================================
// NETWORK.JS — Socket.io client for communication with server
// [ASSIGNMENT: WebSocket synchronization — client sends server
//  shot vector, server forwards it to the other client]
// ============================================================

const Network = (function () {
  // Socket.io connection — connect to server
  let socket = null;

  // Callbacks — set from main.js
  let callbacks = {};

  // --- Initialize connection ---
  function connect() {
    // Creating WebSocket connection via socket.io
    // On localhost we connect directly, on server via reverse proxy
    socket = io();

    // ---------- Lobby events ----------

    // Server told us we are waiting for opponent
    socket.on('waiting', () => {
      if (callbacks.onWaiting) callbacks.onWaiting();
    });

    // Server matched two players — game can start
    socket.on('game-matched', (data) => {
      if (callbacks.onMatched) callbacks.onMatched(data);
    });

    // ---------- Game events ----------

    // Wait until second player presses "Start"
    socket.on('waiting-for-opponent-start', () => {
      if (callbacks.onWaitingStart) callbacks.onWaitingStart();
    });

    // Second player pressed "Start" (we are not ready yet)
    socket.on('opponent-ready', () => {
      if (callbacks.onOpponentReady) callbacks.onOpponentReady();
    });

    // Both players are ready — game starts
    socket.on('game-start', (data) => {
      if (callbacks.onGameStart) callbacks.onGameStart(data);
    });

    // Shot fired — received from server (sent to BOTH players)
    // [ASSIGNMENT: Both clients receive identical input parameters]
    socket.on('shot-fired', (data) => {
      if (callbacks.onShotFired) callbacks.onShotFired(data);
    });

    // Turn change — next player's turn
    socket.on('turn-change', (data) => {
      if (callbacks.onTurnChange) callbacks.onTurnChange(data);
    });

    // All stones were thrown — end of game
    socket.on('all-stones-thrown', () => {
      if (callbacks.onAllStonesThrown) callbacks.onAllStonesThrown();
    });

    // ---------- Pause ----------

    // Game was paused
    socket.on('game-paused', (data) => {
      if (callbacks.onPaused) callbacks.onPaused(data);
    });

    // Game continues
    socket.on('game-unpaused', () => {
      if (callbacks.onUnpaused) callbacks.onUnpaused();
    });

    // ---------- Restart ----------

    // Opponent requests a restart
    socket.on('restart-requested', (data) => {
      if (callbacks.onRestartRequested) callbacks.onRestartRequested(data);
    });

    // Restart was accepted — new game
    socket.on('game-restart', () => {
      if (callbacks.onGameRestart) callbacks.onGameRestart();
    });

    // Restart was rejected
    socket.on('restart-rejected', () => {
      if (callbacks.onRestartRejected) callbacks.onRestartRejected();
    });

    // ---------- Disconnect ----------

    // Opponent disconnected
    // [ASSIGNMENT: If one player closes the browser, the other is informed]
    socket.on('opponent-disconnected', () => {
      if (callbacks.onOpponentDisconnected) callbacks.onOpponentDisconnected();
    });
  }

  // --- Sending messages to server ---

  // Connect to lobby with player name
  function joinLobby(name) {
    socket.emit('join-lobby', { name });
  }

  // Player is ready to start the game
  function sendStartGame() {
    socket.emit('start-game');
  }

  // Sending shot vector (direction + power)
  // [ASSIGNMENT: Client sends server the shot vector]
  function sendShoot(dx, dy) {
    socket.emit('shoot', { dx, dy });
  }

  // Stones stopped — server can switch turn
  function sendStonesStop() {
    socket.emit('stones-stopped');
  }

  // Pause the game
  function sendPause() {
    socket.emit('pause');
  }

  // Continue the game
  function sendUnpause() {
    socket.emit('unpause');
  }

  // Request a restart
  function sendRestartRequest() {
    socket.emit('restart-request');
  }

  // Accept a restart
  function sendRestartAccept() {
    socket.emit('restart-accept');
  }

  // Reject a restart
  function sendRestartReject() {
    socket.emit('restart-reject');
  }

  // Disconnect from server
  function disconnect() {
    if (socket) socket.disconnect();
  }

  // Setup callbacks
  function on(event, callback) {
    callbacks[event] = callback;
  }

  // --- Public API ---
  return {
    connect,
    joinLobby,
    sendStartGame,
    sendShoot,
    sendStonesStop,
    sendPause,
    sendUnpause,
    sendRestartRequest,
    sendRestartAccept,
    sendRestartReject,
    disconnect,
    on
  };
})();

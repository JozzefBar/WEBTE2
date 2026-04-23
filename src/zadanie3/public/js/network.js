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
      if (callbacks.onMatched) callbacks.onMatched({
        playerIndex: data.playerIndex,
        opponentName: data.opponentName,
        config: data.config,
        skins: data.skins
      });
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
    // Both clients receive identical input parameters]
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
    socket.on('opponent-disconnected', () => {
      if (callbacks.onOpponentDisconnected) callbacks.onOpponentDisconnected();
    });
  }

  // --- Sending messages to server ---

  // Join lobby with name and skin
  function joinLobby(name, skin) {
    socket.emit('join-lobby', { name, skin });
  }

  // Player is ready to start the game
  function sendStartGame() {
    socket.emit('start-game');
  }

  // Sending shot vector (direction + power)
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

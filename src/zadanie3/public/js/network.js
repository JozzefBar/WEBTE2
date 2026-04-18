// ============================================================
// NETWORK.JS — Socket.io klient pre komunikaciu so serverom
// [ZADANIE: WebSocket synchronizacia — klient posiela serveru
//  vektor vystrelu, server preposiela druhemu klientovi]
// ============================================================

const Network = (function () {
  // Socket.io spojenie — pripojenie na server
  let socket = null;

  // Callbacky — nastavia sa z main.js
  let callbacks = {};

  // --- Inicializacia spojenia ---
  function connect() {
    // Vytvorenie WebSocket spojenia cez socket.io
    // Na localhost sa pripajame priamo, na serveri cez reverse proxy
    socket = io();

    // ---------- Lobby udalosti ----------

    // Server nam povedal, ze cakame na supera
    socket.on('waiting', () => {
      if (callbacks.onWaiting) callbacks.onWaiting();
    });

    // Server sparoval dvoch hracov — hra sa moze zacat
    socket.on('game-matched', (data) => {
      if (callbacks.onMatched) callbacks.onMatched(data);
    });

    // ---------- Herne udalosti ----------

    // Cakame na to, kym druhy hrac stlaci "Start"
    socket.on('waiting-for-opponent-start', () => {
      if (callbacks.onWaitingStart) callbacks.onWaitingStart();
    });

    // Oba hraci su pripraveni — hra zacina
    socket.on('game-start', (data) => {
      if (callbacks.onGameStart) callbacks.onGameStart(data);
    });

    // Vystrel kamena — prijaty od servera (posielany OBOM hracom)
    // [ZADANIE: Obaja klienti dostanu rovnake vstupne parametre]
    socket.on('shot-fired', (data) => {
      if (callbacks.onShotFired) callbacks.onShotFired(data);
    });

    // Zmena tahu — na tahu je dalsi hrac
    socket.on('turn-change', (data) => {
      if (callbacks.onTurnChange) callbacks.onTurnChange(data);
    });

    // Vsetky kamene boli odhodene — koniec hry
    socket.on('all-stones-thrown', () => {
      if (callbacks.onAllStonesThrown) callbacks.onAllStonesThrown();
    });

    // ---------- Pauza ----------

    // Hra bola pozastavena
    socket.on('game-paused', (data) => {
      if (callbacks.onPaused) callbacks.onPaused(data);
    });

    // Hra pokracuje
    socket.on('game-unpaused', () => {
      if (callbacks.onUnpaused) callbacks.onUnpaused();
    });

    // ---------- Restart ----------

    // Supera ziada restart
    socket.on('restart-requested', (data) => {
      if (callbacks.onRestartRequested) callbacks.onRestartRequested(data);
    });

    // Restart bol schvaleny — nova hra
    socket.on('game-restart', () => {
      if (callbacks.onGameRestart) callbacks.onGameRestart();
    });

    // Restart bol zamietnuty
    socket.on('restart-rejected', () => {
      if (callbacks.onRestartRejected) callbacks.onRestartRejected();
    });

    // ---------- Odpojenie ----------

    // Supera sa odpojil
    // [ZADANIE: Ak niektory hrac zatvori prehliadac, druhy je informovany]
    socket.on('opponent-disconnected', () => {
      if (callbacks.onOpponentDisconnected) callbacks.onOpponentDisconnected();
    });
  }

  // --- Odosielanie sprav na server ---

  // Pripojenie do lobby s menom hraca
  function joinLobby(name) {
    socket.emit('join-lobby', { name });
  }

  // Hrac je pripraveny zacat hru
  function sendStartGame() {
    socket.emit('start-game');
  }

  // Odoslanie vektora vystrelu (smer + sila)
  // [ZADANIE: Klient posiela serveru vektor vystrelu]
  function sendShoot(dx, dy) {
    socket.emit('shoot', { dx, dy });
  }

  // Kamene sa zastavili — server moze prepnut tah
  function sendStonesStop() {
    socket.emit('stones-stopped');
  }

  // Pozastavenie hry
  function sendPause() {
    socket.emit('pause');
  }

  // Pokracovanie v hre
  function sendUnpause() {
    socket.emit('unpause');
  }

  // Ziadost o restart
  function sendRestartRequest() {
    socket.emit('restart-request');
  }

  // Suhlas s restartom
  function sendRestartAccept() {
    socket.emit('restart-accept');
  }

  // Zamietnutie restartu
  function sendRestartReject() {
    socket.emit('restart-reject');
  }

  // Odpojenie od servera
  function disconnect() {
    if (socket) socket.disconnect();
  }

  // Nastavenie callbackov
  function on(event, callback) {
    callbacks[event] = callback;
  }

  // --- Verejne API ---
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

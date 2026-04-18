// ============================================================
// MAIN.JS — Hlavna logika aplikacie (UI, prepinanie obrazoviek)
// Spaja Network (WebSocket) a Game (Canvas + Matter.js)
// ============================================================

(function () {
  // ============================================================
  // PREMENNE
  // ============================================================

  let myPlayerIndex = -1;     // Index tohto hraca (0 alebo 1)
  let myName = '';            // Meno tohto hraca
  let opponentName = '';      // Meno supera
  let gameConfig = null;      // Herna konfiguracia (z servera)
  let previousScreen = null;  // Pre "spat" tlacidlo z pravidiel

  // ============================================================
  // POMOCNE FUNKCIE — prepinanie obrazoviek
  // ============================================================

  // Zobrazi jednu obrazovku a skryje vsetky ostatne
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  }

  // Zobrazi/skryje overlay
  function showOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.style.display = 'flex';
  }

  function hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.style.display = 'none';
  }

  function hideAllOverlays() {
    document.querySelectorAll('.overlay').forEach(o => o.style.display = 'none');
  }

  // Aktualizacia herneho UI (header) — mena, tah, kamene
  function updateGameUI() {
    const stonesThrown = Game.getStonesThrown();
    const stonesPerPlayer = Game.getStonesPerPlayer();
    const currentTurn = Game.getCurrentTurn();

    // Mena hracov (nastavia sa len raz)
    document.getElementById('name-0').textContent =
      myPlayerIndex === 0 ? myName : opponentName;
    document.getElementById('name-1').textContent =
      myPlayerIndex === 1 ? myName : opponentName;

    // Zostávajúce kamene
    const p0Left = stonesPerPlayer - stonesThrown[0];
    const p1Left = stonesPerPlayer - stonesThrown[1];
    document.getElementById('stones-0').textContent = `⚪ ${p0Left}`;
    document.getElementById('stones-1').textContent = `⚪ ${p1Left}`;

    // Kto je na tahu — zvyraznime
    document.getElementById('player-info-0').classList.toggle('active-turn', currentTurn === 0);
    document.getElementById('player-info-1').classList.toggle('active-turn', currentTurn === 1);

    // Text tahu
    const turnName = currentTurn === myPlayerIndex ? 'Ty' :
      (currentTurn === 0 ? (myPlayerIndex === 0 ? 'Ty' : opponentName) :
        (myPlayerIndex === 1 ? 'Ty' : opponentName));
    document.getElementById('turn-indicator').textContent = `Ťah: ${turnName}`;

    // Status text
    const statusEl = document.getElementById('game-status-text');
    if (currentTurn === myPlayerIndex) {
      statusEl.textContent = 'Si na ťahu — klikni na kameň a ťahaj!';
    } else {
      statusEl.textContent = 'Čakáš na súpera...';
    }
  }

  // ============================================================
  // INICIALIZACIA — pripojenie eventov
  // ============================================================

  function setupUI() {
    // --- Login obrazovka ---
    // [ZADANIE: Prihlasenie / lobby — hrac sa prihlasi menom]
    document.getElementById('btn-join').addEventListener('click', () => {
      const nameInput = document.getElementById('input-name');
      myName = nameInput.value.trim();
      if (!myName) {
        nameInput.style.borderColor = '#ef5350';
        nameInput.focus();
        return;
      }
      // Pripojime sa k serveru a do lobby
      Network.connect();
      Network.joinLobby(myName);
    });

    // Enter klaves v input poli
    document.getElementById('input-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-join').click();
    });

    // --- Cakacia obrazovka ---
    document.getElementById('btn-cancel-wait').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Menu obrazovka ---
    // [ZADANIE: Hlavne menu — spustit hru, pravidla, ukoncit spojenie]
    document.getElementById('btn-start').addEventListener('click', () => {
      Network.sendStartGame();
      document.getElementById('btn-start').disabled = true;
      document.getElementById('waiting-start-msg').style.display = 'block';
    });

    document.getElementById('btn-disconnect').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Pravidla ---
    document.getElementById('btn-rules-login').addEventListener('click', () => {
      previousScreen = 'screen-login';
      showScreen('screen-rules');
    });

    document.getElementById('btn-rules-menu').addEventListener('click', () => {
      previousScreen = 'screen-menu';
      showScreen('screen-rules');
    });

    document.getElementById('btn-rules-back').addEventListener('click', () => {
      showScreen(previousScreen || 'screen-login');
    });

    // --- Herná obrazovka ---
    // [ZADANIE: Pauza — aktualny hrac moze hru kedykolvek pozastavit]
    document.getElementById('btn-pause').addEventListener('click', () => {
      Network.sendPause();
    });

    // [ZADANIE: Restart — mozne spustit novu hru]
    document.getElementById('btn-restart-ingame').addEventListener('click', () => {
      Network.sendRestartRequest();
      document.getElementById('game-status-text').textContent =
        'Čakáme na súhlas súpera s reštartom...';
    });

    // --- Pauza overlay ---
    // [ZADANIE: Pauzu moze zrusit ktorykolvek hrac]
    document.getElementById('btn-unpause').addEventListener('click', () => {
      Network.sendUnpause();
    });

    // --- Restart overlay ---
    document.getElementById('btn-restart-accept').addEventListener('click', () => {
      Network.sendRestartAccept();
      hideOverlay('overlay-restart');
    });

    document.getElementById('btn-restart-reject').addEventListener('click', () => {
      Network.sendRestartReject();
      hideOverlay('overlay-restart');
    });

    // --- Vysledkova obrazovka ---
    document.getElementById('btn-play-again').addEventListener('click', () => {
      Network.sendRestartRequest();
    });

    document.getElementById('btn-quit').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Odpojenie supera overlay ---
    document.getElementById('btn-back-lobby').addEventListener('click', () => {
      hideAllOverlays();
      Network.disconnect();
      showScreen('screen-login');
    });
  }

  // ============================================================
  // SIETOVE CALLBACKY — reakcie na udalosti zo servera
  // ============================================================

  function setupNetworkCallbacks() {
    // Cakame na supera
    Network.on('onWaiting', () => {
      showScreen('screen-waiting');
    });

    // Supera najdeny — zobrazi sa menu
    // [ZADANIE: Server sparuje dvoch hracov do jednej miestnosti]
    Network.on('onMatched', (data) => {
      myPlayerIndex = data.playerIndex;
      opponentName = data.opponentName;
      gameConfig = data.config;

      // Nastavenie UI
      document.getElementById('opponent-name').textContent = opponentName;
      const badge = document.getElementById('player-color-badge');
      badge.className = 'color-badge ' + (myPlayerIndex === 0 ? 'red' : 'blue');

      // Reset start button stavu
      document.getElementById('btn-start').disabled = false;
      document.getElementById('waiting-start-msg').style.display = 'none';

      showScreen('screen-menu');
    });

    // Cakame na supera kym stlaci "Start"
    Network.on('onWaitingStart', () => {
      document.getElementById('waiting-start-msg').textContent =
        'Čakáme na súpera...';
    });

    // Hra zacina!
    Network.on('onGameStart', (data) => {
      showScreen('screen-game');
      hideAllOverlays();

      // Pripravenie mien pre Game modul
      const names = myPlayerIndex === 0
        ? [myName, opponentName]
        : [opponentName, myName];

      // Inicializacia herneho enginu
      const canvas = document.getElementById('game-canvas');
      Game.init(canvas, gameConfig, myPlayerIndex, names);

      // Nastavenie callbackov z Game modulu
      // Ked hrac vystreli — posleme vektor na server
      Game.setOnShoot((dx, dy) => {
        Network.sendShoot(dx, dy);
      });

      // Ked kamene zastanu — informujeme server
      Game.setOnStonesStop(() => {
        Network.sendStonesStop();
      });

      // Ked hra skonci — zobrazime vysledky
      // [ZADANIE: Vysledok hry musi byt prehladne zobrazeny obom hracom]
      Game.setOnGameOver((results) => {
        showResults(results);
      });

      // Spustenie herneho loopu
      Game.startGameLoop(data.firstPlayer);
      updateGameUI();
    });

    // Vystrel kamena (od servera — oba klienti)
    Network.on('onShotFired', (data) => {
      Game.handleShotFired(data);
      updateGameUI();
    });

    // Zmena tahu
    Network.on('onTurnChange', (data) => {
      Game.handleTurnChange(data);
      updateGameUI();
    });

    // Vsetky kamene odhodene — koniec hry
    Network.on('onAllStonesThrown', () => {
      Game.handleAllStonesThrown();
    });

    // Pauza
    // [ZADANIE: Druhy hrac je o pauze informovany]
    Network.on('onPaused', (data) => {
      Game.pause();
      const pauseInfo = document.getElementById('pause-info');
      pauseInfo.textContent = `Hru pozastavil: ${data.pausedByName}`;
      showOverlay('overlay-pause');
    });

    // Koniec pauzy
    Network.on('onUnpaused', () => {
      Game.unpause();
      hideOverlay('overlay-pause');
    });

    // Ziadost o restart
    Network.on('onRestartRequested', (data) => {
      document.getElementById('restart-info').textContent =
        `${data.fromName} chce reštartovať hru. Súhlasíš?`;
      showOverlay('overlay-restart');
    });

    // Restart schvaleny — nova hra
    // [ZADANIE: Restart bez nutnosti obnovovat stranku]
    Network.on('onGameRestart', () => {
      hideAllOverlays();
      Game.reset();

      // Reset start button
      document.getElementById('btn-start').disabled = false;
      document.getElementById('waiting-start-msg').style.display = 'none';

      showScreen('screen-menu');
    });

    // Restart zamietnuty
    Network.on('onRestartRejected', () => {
      const statusEl = document.getElementById('game-status-text');
      if (statusEl) statusEl.textContent = 'Súper odmietol reštart.';
    });

    // Supera sa odpojil
    // [ZADANIE: Ak niektory hrac zatvori prehliadac,
    //  druhy hrac je informovany a hra sa korektne ukonci]
    Network.on('onOpponentDisconnected', () => {
      Game.pause();
      hideAllOverlays();
      showOverlay('overlay-disconnected');
    });
  }

  // ============================================================
  // ZOBRAZENIE VYSLEDKOV
  // ============================================================

  function showResults(results) {
    const titleEl = document.getElementById('result-title');
    const detailsEl = document.getElementById('result-details');
    const iconEl = document.getElementById('result-icon');
    const distEl = document.getElementById('result-distances');

    if (results.winner === -1) {
      // Remiza
      titleEl.textContent = 'Remíza!';
      detailsEl.textContent = 'Obaja hráči majú kameň rovnako blízko k cieľu.';
      iconEl.textContent = '🤝';
    } else {
      // Niekto vyhral
      const winnerName = results.winner === myPlayerIndex ? myName : opponentName;
      const isMyWin = results.winner === myPlayerIndex;

      titleEl.textContent = isMyWin ? 'Vyhral si! 🎉' : 'Prehral si 😔';
      detailsEl.textContent = `Víťaz: ${winnerName}`;
      iconEl.textContent = isMyWin ? '🏆' : '😔';
    }

    // Zobrazenie vzdialenosti
    const name0 = myPlayerIndex === 0 ? myName : opponentName;
    const name1 = myPlayerIndex === 1 ? myName : opponentName;
    const d0 = Math.round(results.bestDistances[0]);
    const d1 = Math.round(results.bestDistances[1]);
    const w0 = results.winner === 0 ? 'winner' : '';
    const w1 = results.winner === 1 ? 'winner' : '';

    distEl.innerHTML = `
      <div class="dist-row ${w0}">
        <span class="dist-dot" style="background: #ef5350;"></span>
        <span>${name0}: ${d0} px od cieľa</span>
        ${results.winner === 0 ? ' ⭐' : ''}
      </div>
      <div class="dist-row ${w1}">
        <span class="dist-dot" style="background: #42a5f5;"></span>
        <span>${name1}: ${d1} px od cieľa</span>
        ${results.winner === 1 ? ' ⭐' : ''}
      </div>
    `;

    showScreen('screen-result');
  }

  // ============================================================
  // SPUSTENIE APLIKACIE
  // ============================================================

  // Po nacitani stranky inicializujeme vsetko
  document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupNetworkCallbacks();
    console.log('[APP] Aplikacia inicializovana');
  });
})();

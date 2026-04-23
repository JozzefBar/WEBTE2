// MAIN.JS — Main application logic (UI, screen switching)
// Connects Network (WebSocket) and Game (Canvas + Matter.js)

(function () {
  // VARIABLES

  let myPlayerIndex = -1;     // Index of this player (0 or 1)
  let myName = '';            // Name of this player
  let opponentName = '';      // Name of opponent
  let gameConfig = null;      // Game configuration (from server)
  let previousScreen = null;  // For "back" button from rules

  // HELPER FUNCTIONS — screen switching

  // Shows one screen and hides all others
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  }

  // Shows/hides overlay
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

  // Shows a generic info message overlay
  function showInfo(title, text) {
    document.getElementById('info-title').textContent = title;
    document.getElementById('info-text').textContent = text;
    showOverlay('overlay-info');
  }

  // Update game UI (header) — names, turn, stones
  function updateGameUI() {
    const stonesThrown = Game.getStonesThrown();
    const stonesPerPlayer = Game.getStonesPerPlayer();
    const currentTurn = Game.getCurrentTurn();

    // Player names (set only once)
    document.getElementById('name-0').textContent =
      myPlayerIndex === 0 ? myName : opponentName;
    document.getElementById('name-1').textContent =
      myPlayerIndex === 1 ? myName : opponentName;

    // Remaining stones
    const p0Left = stonesPerPlayer - stonesThrown[0];
    const p1Left = stonesPerPlayer - stonesThrown[1];
    document.getElementById('stones-0').innerHTML = `<i class="bi bi-circle-fill" style="font-size: 0.7rem;"></i> ${p0Left}`;
    document.getElementById('stones-1').innerHTML = `<i class="bi bi-circle-fill" style="font-size: 0.7rem;"></i> ${p1Left}`;

    // Current score (closest distance)
    const currentScore = Game.getCurrentScore ? Game.getCurrentScore() : [Infinity, Infinity];
    const d0 = currentScore[0] === Infinity ? '-' : `${Math.round(currentScore[0])} px`;
    const d1 = currentScore[1] === Infinity ? '-' : `${Math.round(currentScore[1])} px`;
    
    document.getElementById('score-0').textContent = `Vzdialenosť: ${d0}`;
    document.getElementById('score-1').textContent = `Vzdialenosť: ${d1}`;

    // Who is on turn — highlight
    document.getElementById('player-info-0').classList.toggle('active-turn', currentTurn === 0);
    document.getElementById('player-info-1').classList.toggle('active-turn', currentTurn === 1);

    // Turn text
    const turnName = currentTurn === myPlayerIndex ? 'Ty' :
      (currentTurn === 0 ? (myPlayerIndex === 0 ? 'Ty' : opponentName) :
        (myPlayerIndex === 1 ? 'Ty' : opponentName));
    document.getElementById('turn-indicator').textContent = `Ťah: ${turnName}`;

    // Status text odstraneny zo spodnej listy
  }

  // INITIALIZATION — event binding

  function setupUI() {
    // --- Login screen ---
    // [ASSIGNMENT: Login / lobby — player logs in with name]
    document.getElementById('btn-join').addEventListener('click', () => {
      const nameInput = document.getElementById('input-name');
      myName = nameInput.value.trim();
      if (!myName) {
        nameInput.style.borderColor = '#ef5350';
        nameInput.focus();
        return;
      }
      // Connect to server and lobby
      Network.connect();
      Network.joinLobby(myName);
    });

    // Enter key in input field
    document.getElementById('input-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-join').click();
    });

    // --- Waiting screen ---
    document.getElementById('btn-cancel-wait').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Menu screen ---
    // [ASSIGNMENT: Main menu — start game, rules, disconnect]
    document.getElementById('btn-start').addEventListener('click', () => {
      Network.sendStartGame();
      document.getElementById('btn-start').disabled = true;
      document.getElementById('waiting-start-msg').style.display = 'block';
    });

    document.getElementById('btn-disconnect').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Rules ---
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

    // --- Game screen ---
    // [ASSIGNMENT: Pause — current player can pause game anytime]
    document.getElementById('btn-pause').addEventListener('click', () => {
      Network.sendPause();
    });

    // [ASSIGNMENT: Restart — possible to start new game]
    document.getElementById('btn-restart-ingame').addEventListener('click', () => {
      Network.sendRestartRequest();
      // Waiting notification can be omitted since status panel was removed
    });

    // --- Pause overlay ---
    // [ASSIGNMENT: Pause can be canceled by any player]
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

    // --- Result screen ---
    document.getElementById('btn-play-again').addEventListener('click', () => {
      Network.sendRestartRequest();
    });

    document.getElementById('btn-quit').addEventListener('click', () => {
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Opponent disconnected overlay ---
    document.getElementById('btn-back-lobby').addEventListener('click', () => {
      hideAllOverlays();
      Network.disconnect();
      showScreen('screen-login');
    });

    // --- Info overlay ---
    document.getElementById('btn-info-close').addEventListener('click', () => {
      hideOverlay('overlay-info');
    });
  }

  // NETWORK CALLBACKS — reactions to server events

  function setupNetworkCallbacks() {
    // Waiting for opponent
    Network.on('onWaiting', () => {
      showScreen('screen-waiting');
    });

    // Opponent found — menu is shown
    // [ASSIGNMENT: Server pairs two players into one room]
    Network.on('onMatched', (data) => {
      myPlayerIndex = data.playerIndex;
      opponentName = data.opponentName;
      gameConfig = data.config;

      // UI setup
      document.getElementById('opponent-name').textContent = opponentName;
      const badge = document.getElementById('player-color-badge');
      badge.className = 'color-badge ' + (myPlayerIndex === 0 ? 'red' : 'blue');

      // Reset start button state
      document.getElementById('btn-start').disabled = false;
      document.getElementById('waiting-start-msg').style.display = 'none';

      showScreen('screen-menu');
    });

    // Waiting for opponent to press "Start"
    Network.on('onWaitingStart', () => {
      const msg = document.getElementById('waiting-start-msg');
      msg.textContent = 'Čakáme na súpera...';
      msg.style.display = 'block';
    });
    
    // Opponent pressed Start, waiting for us
    Network.on('onOpponentReady', () => {
      const msg = document.getElementById('waiting-start-msg');
      msg.textContent = 'Súper chce začať hru, čaká sa na teba!';
      msg.style.display = 'block';
    });

    // Game starts!
    Network.on('onGameStart', (data) => {
      showScreen('screen-game');
      hideAllOverlays();

      // Prepare names for Game module
      const names = myPlayerIndex === 0
        ? [myName, opponentName]
        : [opponentName, myName];

      // Initialize game engine
      const canvas = document.getElementById('game-canvas');
      Game.init(canvas, gameConfig, myPlayerIndex, names);

      // Setup Game module callbacks
      // When player shoots — send vector to server
      Game.setOnShoot((dx, dy) => {
        Network.sendShoot(dx, dy);
      });

      // When stones stop — inform server
      Game.setOnStonesStop(() => {
        Network.sendStonesStop();
      });

      // When game ends — show results
      // [ASSIGNMENT: Game result must be clearly displayed to both players]
      Game.setOnGameOver((results) => {
        showResults(results);
      });

      // Start game loop
      Game.startGameLoop(data.firstPlayer);
      updateGameUI();
    });

    // Stone fired (from server — both clients)
    Network.on('onShotFired', (data) => {
      Game.handleShotFired(data);
      updateGameUI();
    });

    // Turn change
    Network.on('onTurnChange', (data) => {
      Game.handleTurnChange(data);
      updateGameUI();
    });

    // All stones thrown — game over
    Network.on('onAllStonesThrown', () => {
      Game.handleAllStonesThrown();
    });

    // Pause
    // [ASSIGNMENT: Other player is informed of pause]
    Network.on('onPaused', (data) => {
      Game.pause();
      const pauseInfo = document.getElementById('pause-info');
      pauseInfo.textContent = `Hru pozastavil: ${data.pausedByName}`;
      showOverlay('overlay-pause');
    });

    // End of pause
    Network.on('onUnpaused', () => {
      Game.unpause();
      hideOverlay('overlay-pause');
    });

    // Restart request
    Network.on('onRestartRequested', (data) => {
      document.getElementById('restart-info').textContent =
        `${data.fromName} chce reštartovať hru. Súhlasíš?`;
      showOverlay('overlay-restart');
    });

    // Restart approved — new game
    // [ASSIGNMENT: Restart without need to refresh page]
    Network.on('onGameRestart', () => {
      hideAllOverlays();
      Game.reset();

      // Reset start button
      document.getElementById('btn-start').disabled = false;
      document.getElementById('waiting-start-msg').style.display = 'none';

      showScreen('screen-menu');
    });

    // Restart rejected
    Network.on('onRestartRejected', () => {
      showInfo('Reštart odmietnutý', 'Súper odmietol tvoju žiadosť o reštart.');
    });

    // Opponent disconnected
    // [ASSIGNMENT: If either player closes browser,
    //  other player is informed and game ends correctly]
    Network.on('onOpponentDisconnected', () => {
      Game.pause();
      hideAllOverlays();
      showOverlay('overlay-disconnected');
    });
  }

  // DISPLAY RESULTS

  function showResults(results) {
    const titleEl = document.getElementById('result-title');
    const detailsEl = document.getElementById('result-details');
    const distEl = document.getElementById('result-distances');

    if (results.winner === -1) {
      // Draw
      titleEl.textContent = 'Remíza!';
      detailsEl.textContent = 'Obaja hráči majú kameň rovnako blízko k cieľu.';
    } else {
      // Someone won
      const winnerName = Number(results.winner) === Number(myPlayerIndex) ? myName : opponentName;
      const isMyWin = Number(results.winner) === Number(myPlayerIndex);

      titleEl.textContent = isMyWin ? 'Vyhral si!' : 'Prehral si!';
      detailsEl.textContent = `Víťaz: ${winnerName}`;
    }

    // Display distances
    const name0 = myPlayerIndex === 0 ? myName : opponentName;
    const name1 = myPlayerIndex === 1 ? myName : opponentName;
    const d0 = Math.round(results.bestDistances[0]);
    const d1 = Math.round(results.bestDistances[1]);
    let w0 = '';
    let w1 = '';
    let icon0 = '';
    let icon1 = '';

    // Only highlight the current player's own row
    if (results.winner !== -1) {
      const isMyWin = Number(results.winner) === Number(myPlayerIndex);
      if (Number(myPlayerIndex) === 0) {
        w0 = isMyWin ? 'winner' : 'loser';
        icon0 = isMyWin ? ' <i class="bi bi-star-fill"></i>' : ' <i class="bi bi-x-circle-fill"></i>';
      } else if (Number(myPlayerIndex) === 1) {
        w1 = isMyWin ? 'winner' : 'loser';
        icon1 = isMyWin ? ' <i class="bi bi-star-fill"></i>' : ' <i class="bi bi-x-circle-fill"></i>';
      }
    }

    distEl.innerHTML = `
      <div class="dist-row ${w0}">
        <span class="dist-dot" style="background: #ef5350;"></span>
        <span>${name0}: ${d0 === Infinity ? '-' : d0 + ' px od cieľa'}</span>
        ${icon0}
      </div>
      <div class="dist-row ${w1}">
        <span class="dist-dot" style="background: #42a5f5;"></span>
        <span>${name1}: ${d1 === Infinity ? '-' : d1 + ' px od cieľa'}</span>
        ${icon1}
      </div>
    `;

    showScreen('screen-result');
  }

  // START APPLICATION

  // After page load initialize everything
  document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupNetworkCallbacks();
    console.log('[APP] Aplikacia inicializovana');
  });
})();

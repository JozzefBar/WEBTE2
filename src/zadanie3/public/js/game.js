// GAME.JS — Game logic, physics (Matter.js) and rendering (Canvas)
// [ASSIGNMENT: Game board and visualization — Canvas API]
// [ASSIGNMENT: Controls — slingshot mechanic]
// [ASSIGNMENT: Physics — Matter.js (collisions, friction, bouncing)]
// [ASSIGNMENT: Game logic and turn switching]

const Game = (function () {
  // --- Matter.js modules ---
  const Engine = Matter.Engine;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;
  const Composite = Matter.Composite;
  const Events = Matter.Events;

  // --- Color constants ---
  // [ASSIGNMENT: Stones of both players must be color-distinguished]
  const PLAYER_COLORS = ['#ef5350', '#42a5f5'];       // red, blue
  const PLAYER_COLORS_DARK = ['#c62828', '#1565c0'];   // darker version (border)
  const PLAYER_COLORS_LIGHT = ['#ef9a9a', '#90caf9'];  // lighter version (highlight)

  // Target colors (concentric circles like in curling)
  const TARGET_COLORS = ['#1565c0', '#e8eaf6', '#c62828', '#f44336'];

  // --- Game state ---
  let canvas, ctx;           // Canvas element and 2D context
  let engine;                // Matter.js physics engine
  let config;                // Game configuration (from JSON)
  let fieldW, fieldH;        // Dimensions of the game board

  let myPlayerIndex = -1;    // Index of this player (0 or 1)
  let currentTurn = -1;      // Whose turn it is (0 or 1)
  let stonesThrown = [0, 0]; // Number of stones thrown by each player
  let allStones = [];        // All stones on the board [{body, playerIndex}]
  let activeStone = null;    // Currently active stone (on turn)

  // Aiming state (slingshot)
  let isAiming = false;      // Is player aiming right now
  let mousePos = { x: 0, y: 0 }; // Mouse position in logical coordinates

  // Stopped state of stones
  let waitingForStop = false;  // Waiting for stones to stop after shot
  let shotFrameCount = 0;     // Counter of frames after shot
  const SHOT_DELAY_FRAMES = 15; // Number of frames before checking for stop

  // Game states
  let gameActive = false;     // Is game running
  let isPaused = false;       // Is game paused
  let isGameOver = false;     // Is game over
  let animFrameId = null;     // ID of animation frame (for cancelling)

  // Callbacks — called when player shoots or stones stop
  let onShootCallback = null;
  let onStonesStopCallback = null;
  let onGameOverCallback = null;

  // Player names (for display)
  let playerNames = ['Hráč 1', 'Hráč 2'];

  // INITIALIZATION

  // Initialize game engine and canvas
  function init(canvasElement, gameConfig, playerIndex, names) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    config = gameConfig;
    myPlayerIndex = playerIndex;
    playerNames = names || playerNames;
    fieldW = config.field.width;
    fieldH = config.field.height;

    // Set Canvas to logical dimensions
    // CSS handles responsive scaling
    canvas.width = fieldW;
    canvas.height = fieldH;

    // Create Matter.js engine WITHOUT gravity (top-down view)
    engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;

    // Create walls (edges of the game board)
    // [ASSIGNMENT: Stones bounce off the edges of the board]
    createWalls();

    // Setup mouse/touch events
    setupInputEvents();

    console.log('[GAME] Inicializovany. Hrac:', myPlayerIndex);
  }

  // Create walls around game board
  function createWalls() {
    const t = 50; // wall thickness
    const r = config.wallRestitution; // wall restitution (bounciness)

    const walls = [
      // Top wall
      Bodies.rectangle(fieldW / 2, -t / 2, fieldW + t * 2, t, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-top'
      }),
      // Bottom wall
      Bodies.rectangle(fieldW / 2, fieldH + t / 2, fieldW + t * 2, t, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-bottom'
      }),
      // Left wall
      Bodies.rectangle(-t / 2, fieldH / 2, t, fieldH + t * 2, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-left'
      }),
      // Right wall
      Bodies.rectangle(fieldW + t / 2, fieldH / 2, t, fieldH + t * 2, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-right'
      })
    ];

    Composite.add(engine.world, walls);
  }

  // INPUT EVENTS (mouse + touch)
  // [ASSIGNMENT: Controls — slingshot mechanic]

  function setupInputEvents() {
    // --- Mouse ---
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);

    // --- Touch (mobile devices) ---
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      onPointerDown(touchToMouse(touch));
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      onPointerMove(touchToMouse(touch));
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      onPointerUp();
    }, { passive: false });
  }

  // Convert touch event to a format compatible with mouse event
  function touchToMouse(touch) {
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  // Convert coordinates from canvas pixels to logical coordinates
  function canvasToLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // --- Clicking on a stone ---
  // [ASSIGNMENT: Player clicks on a stone at the starting position
  //  and drags the mouse away from the target]
  function onPointerDown(e) {
    if (!gameActive || isPaused || isGameOver) return;
    if (currentTurn !== myPlayerIndex) return; // not my turn
    if (!activeStone) return;
    if (waitingForStop) return;

    const pos = canvasToLogical(e.clientX, e.clientY);
    const stone = activeStone.body;

    // Check if clicked strictly on stone (distance from center)
    const dx = pos.x - stone.position.x;
    const dy = pos.y - stone.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= config.stoneRadius * 2.5) {
      // Start aiming
      isAiming = true;
      mousePos = pos;
    }
  }

  // --- Mouse movement during aiming ---
  // [ASSIGNMENT: While aiming, visual aid is displayed —
  //  line or arrow from stone center to cursor]
  function onPointerMove(e) {
    if (!isAiming) return;
    mousePos = canvasToLogical(e.clientX, e.clientY);
  }

  // --- Mouse release — shoot ---
  // [ASSIGNMENT: After mouse release, stone is fired]
  function onPointerUp() {
    if (!isAiming) return;
    isAiming = false;

    const stone = activeStone.body;

    // Calculate shot vector (slingshot — opposite drag direction)
    // [ASSIGNMENT: Shot power is proportional to drag distance]
    const pullDx = mousePos.x - stone.position.x;
    const pullDy = mousePos.y - stone.position.y;
    const pullDist = Math.sqrt(pullDx * pullDx + pullDy * pullDy);

    // Minimum drag to prevent accidental clicks
    if (pullDist < 10) return;

    // Clip to maximum drag distance
    const maxDrag = config.maxDragDistance;
    const clampedDist = Math.min(pullDist, maxDrag);

    // Shot power — proportional to drag distance
    const power = (clampedDist / maxDrag) * config.maxShotSpeed;

    // Shot direction — OPPOSITE direction of drag (slingshot mechanic)
    const angle = Math.atan2(pullDy, pullDx);
    const shootDx = -Math.cos(angle) * power;
    const shootDy = -Math.sin(angle) * power;

    // Send vector to server
    if (onShootCallback) {
      onShootCallback(shootDx, shootDy);
    }
  }

  // GAME LOOP — physics + rendering

  function startGameLoop(firstPlayer) {
    gameActive = true;
    isPaused = false;
    isGameOver = false;
    currentTurn = firstPlayer;
    stonesThrown = [0, 0];
    allStones = [];
    activeStone = null;
    waitingForStop = false;

    // Create first stone
    placeNewStone(firstPlayer);

    // Start game loop
    gameLoop();
    console.log('[GAME] Hra zacala. Prvy hrac:', firstPlayer);
  }

  function gameLoop() {
    if (!gameActive) return;

    // Physics — engine update with fixed step (determinism)
    // [ASSIGNMENT: Physics simulation runs on clients' side,
    //  while both clients receive the same input parameters
    //  and simulate the same game state]
    if (!isPaused) {
      Engine.update(engine, 1000 / 60);
      checkStoneSpeeds();
      checkStonesStop();
    }

    // Rendering to canvas
    render();

    // Next frame
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // Check and fully stop very slow moving stones
  // [ASSIGNMENT: Stones slow down by friction and come to full stop]
  function checkStoneSpeeds() {
    const threshold = config.stopThreshold;
    allStones.forEach(s => {
      const speed = Math.sqrt(s.body.velocity.x ** 2 + s.body.velocity.y ** 2);
      if (speed > 0 && speed < threshold) {
        // Stone is too slow — stop entirely
        Body.setVelocity(s.body, { x: 0, y: 0 });
        Body.setAngularVelocity(s.body, 0);
      }
    });
  }

  // Check if all stones stopped (after shot)
  function checkStonesStop() {
    if (!waitingForStop) return;

    shotFrameCount++;
    // Wait a few frames for force to apply
    if (shotFrameCount < SHOT_DELAY_FRAMES) return;

    // Check if all stones stand still
    const allStopped = allStones.every(s => {
      const speed = Math.sqrt(s.body.velocity.x ** 2 + s.body.velocity.y ** 2);
      return speed === 0;
    });

    if (allStopped) {
      waitingForStop = false;
      console.log('[GAME] Vsetky kamene zastali');

      // Only active player (who fired) reports the stop
      if (currentTurn === myPlayerIndex) {
        if (onStonesStopCallback) onStonesStopCallback();
      }
    }
  }

  // STONE MANAGEMENT

  // Place new stone at starting position
  function placeNewStone(playerIndex) {
    const x = config.throwPosition.x;
    const y = config.throwPosition.y;

    // Create physics body (circle)
    // [ASSIGNMENT: Collisions between stones are physically correct (circle-circle bounce)]
    const body = Bodies.circle(x, y, config.stoneRadius, {
      friction: config.friction,
      frictionAir: config.frictionAir,
      restitution: config.restitution,
      density: 0.005,
      label: `stone-p${playerIndex}-${stonesThrown[playerIndex]}`
    });

    Composite.add(engine.world, body);

    const stoneObj = { body, playerIndex };
    allStones.push(stoneObj);
    activeStone = stoneObj;

    console.log(`[GAME] Novy kamen pre hraca ${playerIndex} na [${x}, ${y}]`);
  }

  // RECEIVED SHOT FROM SERVER
  // Both clients do the exact same thing — determinism

  function handleShotFired(data) {
    // If stone hasn't been created yet (other player), create it
    if (!activeStone || activeStone.playerIndex !== data.playerIndex) {
      placeNewStone(data.playerIndex);
    }

    stonesThrown[data.playerIndex] = data.stoneIndex + 1;

    // Apply velocity to stone (not force — for predictability)
    Body.setVelocity(activeStone.body, { x: data.dx, y: data.dy });

    // Start waiting for stones to stop
    waitingForStop = true;
    shotFrameCount = 0;
    isAiming = false;

    console.log(`[GAME] Vystrel hraca ${data.playerIndex}: dx=${data.dx.toFixed(2)}, dy=${data.dy.toFixed(2)}`);
  }

  // Turn change — new stone for the next player
  // [ASSIGNMENT: Players take turns throwing stones]
  function handleTurnChange(data) {
    currentTurn = data.currentPlayer;
    activeStone = null;
    waitingForStop = false;

    // Create new stone for the player on turn
    placeNewStone(data.currentPlayer);

    console.log(`[GAME] Zmena tahu — na tahu: ${data.currentPlayer}`);
  }

  // All stones thrown — determine winner
  // [ASSIGNMENT: After all stones are played, winner is determined —
  //  the player whose stone is closest to the target wins]
  function handleAllStonesThrown() {
    isGameOver = true;
    activeStone = null;

    // Calculate distance of stones from target
    const results = calculateResults();

    console.log('[GAME] Koniec hry! Vysledky:', results);

    if (onGameOverCallback) {
      onGameOverCallback(results);
    }
  }

  // Calculate results — distance of each stone from target
  function calculateResults() {
    const targetX = config.target.x;
    const targetY = config.target.y;

    let bestDist = [Infinity, Infinity]; // Best distance for each player
    let stoneDistances = [];

    allStones.forEach(s => {
      const dx = s.body.position.x - targetX;
      const dy = s.body.position.y - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      stoneDistances.push({
        playerIndex: s.playerIndex,
        distance: dist
      });

      if (dist < bestDist[s.playerIndex]) {
        bestDist[s.playerIndex] = dist;
      }
    });

    // Determine winner
    let winner = -1; // -1 = draw
    if (bestDist[0] < bestDist[1]) winner = 0;
    else if (bestDist[1] < bestDist[0]) winner = 1;

    return {
      winner,
      bestDistances: bestDist,
      allDistances: stoneDistances
    };
  }

  // Calculate current best distances for each player (live)
  function getCurrentScore() {
    if (!config) return [Infinity, Infinity];
    const targetX = config.target.x;
    const targetY = config.target.y;

    let bestDist = [Infinity, Infinity];

    allStones.forEach(s => {
      const dx = s.body.position.x - targetX;
      const dy = s.body.position.y - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < bestDist[s.playerIndex]) {
        bestDist[s.playerIndex] = dist;
      }
    });

    return bestDist;
  }

  // RENDERING (Canvas API)
  // [ASSIGNMENT: Rendering of the game board must be implemented
  //  using Canvas API]

  function render() {
    ctx.clearRect(0, 0, fieldW, fieldH);

    drawField();
    drawTarget();
    drawAllStones();
    drawAimingLine();
    drawTurnText();
  }

  // --- Game board (background) — vertical layout ---
  function drawField() {
    // Ice surface — gradient (top to bottom)
    const grad = ctx.createLinearGradient(0, 0, 0, fieldH);
    grad.addColorStop(0, '#d4e6f1');
    grad.addColorStop(0.5, '#e8f0f8');
    grad.addColorStop(1, '#d4e6f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, fieldW, fieldH);

    // Border line
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, fieldW - 4, fieldH - 4);

    // Center line (horizontal)
    ctx.beginPath();
    ctx.moveTo(0, fieldH / 2);
    ctx.lineTo(fieldW, fieldH / 2);
    ctx.strokeStyle = 'rgba(144, 164, 174, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Shooting line (hog line) — horizontal, above starting position
    const throwY = config.throwPosition.y - config.stoneRadius * 3;
    ctx.beginPath();
    ctx.moveTo(0, throwY);
    ctx.lineTo(fieldW, throwY);
    ctx.strokeStyle = 'rgba(198, 40, 40, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // --- Target (concentric circles) ---
  // [ASSIGNMENT: Target must be color-marked on the board
  //  (e.g., concentric circles)]
  function drawTarget() {
    const { x, y, radius } = config.target;
    const rings = [
      { ratio: 1.0, color: TARGET_COLORS[0] },    // outer — blue
      { ratio: 0.75, color: TARGET_COLORS[1] },   // white
      { ratio: 0.5, color: TARGET_COLORS[2] },    // red
      { ratio: 0.25, color: TARGET_COLORS[3] }    // center — red
    ];

    rings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(x, y, radius * ring.ratio, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshair center
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- All stones ---
  function drawAllStones() {
    allStones.forEach(s => {
      drawStone(s.body, s.playerIndex, s === activeStone);
    });
  }

  // Draw single stone
  function drawStone(body, playerIndex, isActive) {
    const x = body.position.x;
    const y = body.position.y;
    const r = config.stoneRadius;

    // Stone shadow
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Stone body — fill
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const stoneGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    stoneGrad.addColorStop(0, PLAYER_COLORS_LIGHT[playerIndex]);
    stoneGrad.addColorStop(1, PLAYER_COLORS[playerIndex]);
    ctx.fillStyle = stoneGrad;
    ctx.fill();

    // Stone border
    ctx.strokeStyle = PLAYER_COLORS_DARK[playerIndex];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stone handle (small circle in center)
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = PLAYER_COLORS_DARK[playerIndex];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active stone blinks (highlight)
    if (isActive && currentTurn === myPlayerIndex && !waitingForStop && !isGameOver) {
      ctx.beginPath();
      ctx.arc(x, y, r + 5 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = PLAYER_COLORS[playerIndex];
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // --- Aiming line (visual aid during drag) ---
  // [ASSIGNMENT: Visual aid is shown during aiming —
  //  line or arrow from stone center to cursor —
  //  indicating direction and power of shot]
  function drawAimingLine() {
    if (!isAiming || !activeStone) return;

    const stone = activeStone.body;
    const sx = stone.position.x;
    const sy = stone.position.y;
    const mx = mousePos.x;
    const my = mousePos.y;

    // Drag distance
    const pullDx = mx - sx;
    const pullDy = my - sy;
    const pullDist = Math.sqrt(pullDx * pullDx + pullDy * pullDy);
    const maxDrag = config.maxDragDistance;
    const powerRatio = Math.min(pullDist / maxDrag, 1);

    // 1) Line from stone to cursor (drag)
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2) Arrow in shot direction (opposite to drag)
    const angle = Math.atan2(pullDy, pullDx);
    const arrowLen = powerRatio * 120; // arrow length based on power
    const arrowEndX = sx - Math.cos(angle) * arrowLen;
    const arrowEndY = sy - Math.sin(angle) * arrowLen;

    // Arrow color based on power (green → yellow → red)
    const r = Math.round(255 * powerRatio);
    const g = Math.round(255 * (1 - powerRatio));
    const arrowColor = `rgb(${r}, ${g}, 50)`;

    // Main arrow line
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrow head
    const headLen = 12;
    const headAngle = angle + Math.PI; // shot direction
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(
      arrowEndX - headLen * Math.cos(headAngle - 0.4),
      arrowEndY - headLen * Math.sin(headAngle - 0.4)
    );
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(
      arrowEndX - headLen * Math.cos(headAngle + 0.4),
      arrowEndY - headLen * Math.sin(headAngle + 0.4)
    );
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3) Power indicator (text)
    const powerPercent = Math.round(powerRatio * 100);
    ctx.fillStyle = arrowColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${powerPercent}%`, sx, sy - config.stoneRadius - 15);
  }

  // --- Text indicating whose turn it is ---
  function drawTurnText() {
    if (isGameOver) return;

    const textY = fieldH - 30; // Moved from top to bottom

    if (waitingForStop) {
      // Stones are moving
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kamene sa pohybujú...', fieldW / 2, textY);
    } else if (currentTurn !== myPlayerIndex && !isGameOver) {
      // Opponent's turn
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Čaká sa na súpera...', fieldW / 2, textY);
    } else if (currentTurn === myPlayerIndex && !waitingForStop) {
      // My turn
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ťahaj od kameňa a zamier!', fieldW / 2, textY);
    }
  }

  // PAUSE / RESTART

  function pause() {
    isPaused = true;
  }

  function unpause() {
    isPaused = false;
  }

  // Reset game for new match
  function reset() {
    // Stop animation loop
    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameActive = false;
    isPaused = false;
    isGameOver = false;
    isAiming = false;
    waitingForStop = false;
    activeStone = null;
    allStones = [];
    stonesThrown = [0, 0];
    currentTurn = -1;

    // Reset Matter.js — remove all bodies
    Composite.clear(engine.world);
    Engine.clear(engine);

    // Recreate engine and walls
    engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    createWalls();

    // Clear canvas
    ctx.clearRect(0, 0, fieldW, fieldH);

    console.log('[GAME] Hra resetovana');
  }

  // GETTERS AND SETTERS

  function getCurrentTurn() { return currentTurn; }
  function getMyPlayerIndex() { return myPlayerIndex; }
  function getStonesThrown() { return stonesThrown; }
  function getStonesPerPlayer() { return config ? config.stonesPerPlayer : 0; }
  function getIsGameOver() { return isGameOver; }
  function getIsPaused() { return isPaused; }

  function setOnShoot(cb) { onShootCallback = cb; }
  function setOnStonesStop(cb) { onStonesStopCallback = cb; }
  function setOnGameOver(cb) { onGameOverCallback = cb; }

  // PUBLIC API

  return {
    init,
    startGameLoop,
    handleShotFired,
    handleTurnChange,
    handleAllStonesThrown,
    pause,
    unpause,
    reset,
    getCurrentTurn,
    getMyPlayerIndex,
    getStonesThrown,
    getStonesPerPlayer,
    getIsGameOver,
    getIsPaused,
    setOnShoot,
    setOnStonesStop,
    setOnGameOver,
    getCurrentScore
  };
})();

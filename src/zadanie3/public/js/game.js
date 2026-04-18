// ============================================================
// GAME.JS — Herna logika, fyzika (Matter.js) a renderovanie (Canvas)
// ============================================================
// [ZADANIE: Hracia plocha a vizualizacia — Canvas API]
// [ZADANIE: Ovladanie — mechanika praku (slingshot)]
// [ZADANIE: Fyzika — Matter.js (kolizie, trenie, odrazy)]
// [ZADANIE: Herna logika a striedanie]

const Game = (function () {
  // --- Matter.js moduly ---
  const Engine = Matter.Engine;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;
  const Composite = Matter.Composite;
  const Events = Matter.Events;

  // --- Konstanty farieb ---
  // [ZADANIE: Kamene oboch hracov musia byt farebne odlisene]
  const PLAYER_COLORS = ['#ef5350', '#42a5f5'];       // cervena, modra
  const PLAYER_COLORS_DARK = ['#c62828', '#1565c0'];   // tmavsia verzia (okraj)
  const PLAYER_COLORS_LIGHT = ['#ef9a9a', '#90caf9'];  // svetlejsia (highlight)

  // Farby ciela (sustredne kruhy ako v curlingu)
  const TARGET_COLORS = ['#1565c0', '#e8eaf6', '#c62828', '#f44336'];

  // --- Herny stav ---
  let canvas, ctx;           // Canvas element a 2D kontext
  let engine;                // Matter.js fyzikalny engine
  let config;                // Herna konfiguracia (z JSON)
  let fieldW, fieldH;        // Rozmery hracej plochy

  let myPlayerIndex = -1;    // Index tohto hraca (0 alebo 1)
  let currentTurn = -1;      // Kto je na tahu (0 alebo 1)
  let stonesThrown = [0, 0]; // Pocet odhozenych kamenov kazdym hracom
  let allStones = [];        // Vsetky kamene na ploche [{body, playerIndex}]
  let activeStone = null;    // Aktualne aktivny kamen (na tahu)

  // Stav mierenia (slingshot)
  let isAiming = false;      // Ci hrac prave mieri
  let mousePos = { x: 0, y: 0 }; // Pozicia mysi v logickych suradniciach

  // Stav zastavenia kamenov
  let waitingForStop = false;  // Cakame na zastavenie kamenov po vystrele
  let shotFrameCount = 0;     // Pocitadlo framov po vystrele
  const SHOT_DELAY_FRAMES = 15; // Pocet framov pred kontrolou zastavenia

  // Stavy hry
  let gameActive = false;     // Ci hra prebieha
  let isPaused = false;       // Ci je hra pozastavena
  let isGameOver = false;     // Ci hra skoncila
  let animFrameId = null;     // ID animacneho framu (pre zrusenie)

  // Callbacky — volane ked hrac vystreli alebo kamene zastanu
  let onShootCallback = null;
  let onStonesStopCallback = null;
  let onGameOverCallback = null;

  // Mena hracov (pre zobrazenie)
  let playerNames = ['Hráč 1', 'Hráč 2'];

  // ============================================================
  // INICIALIZACIA
  // ============================================================

  // Inicializacia herneho enginu a canvasu
  function init(canvasElement, gameConfig, playerIndex, names) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    config = gameConfig;
    myPlayerIndex = playerIndex;
    playerNames = names || playerNames;
    fieldW = config.field.width;
    fieldH = config.field.height;

    // Nastavime Canvas na logicke rozmery
    // CSS sa stara o responzivne skalovanie
    canvas.width = fieldW;
    canvas.height = fieldH;

    // Vytvorenie Matter.js enginu BEZ gravitacie (pohlad zhora)
    engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;

    // Vytvorenie stien (okrajov hracej plochy)
    // [ZADANIE: Kamene sa odrazaju od okrajov hracej plochy]
    createWalls();

    // Nastavenie mouse/touch eventov
    setupInputEvents();

    console.log('[GAME] Inicializovany. Hrac:', myPlayerIndex);
  }

  // Vytvorenie stien okolo hracej plochy
  function createWalls() {
    const t = 50; // hrubka steny
    const r = config.wallRestitution; // odrazivost stien

    const walls = [
      // Horna stena
      Bodies.rectangle(fieldW / 2, -t / 2, fieldW + t * 2, t, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-top'
      }),
      // Dolna stena
      Bodies.rectangle(fieldW / 2, fieldH + t / 2, fieldW + t * 2, t, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-bottom'
      }),
      // Lava stena
      Bodies.rectangle(-t / 2, fieldH / 2, t, fieldH + t * 2, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-left'
      }),
      // Prava stena
      Bodies.rectangle(fieldW + t / 2, fieldH / 2, t, fieldH + t * 2, {
        isStatic: true, restitution: r, friction: 0, label: 'wall-right'
      })
    ];

    Composite.add(engine.world, walls);
  }

  // ============================================================
  // INPUT EVENTS (mys + touch)
  // [ZADANIE: Ovladanie — mechanika praku]
  // ============================================================

  function setupInputEvents() {
    // --- Mys ---
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);

    // --- Touch (mobilne zariadenia) ---
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

  // Konverzia touch eventu na format kompatibilny s mouse eventom
  function touchToMouse(touch) {
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  // Konverzia suradnic z canvas pixelov na logicke suradnice
  function canvasToLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // --- Kliknutie na kamen ---
  // [ZADANIE: Hrac klikne na kamen na startovacej pozicii
  //  a taha mysou smerom od ciela]
  function onPointerDown(e) {
    if (!gameActive || isPaused || isGameOver) return;
    if (currentTurn !== myPlayerIndex) return; // nie je moj tah
    if (!activeStone) return;
    if (waitingForStop) return;

    const pos = canvasToLogical(e.clientX, e.clientY);
    const stone = activeStone.body;

    // Kontrola ci klikol na kamen (vzdialenost od stredu)
    const dx = pos.x - stone.position.x;
    const dy = pos.y - stone.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= config.stoneRadius * 2.5) {
      // Zaciname mierenie
      isAiming = true;
      mousePos = pos;
    }
  }

  // --- Pohyb mysi pocas mierenia ---
  // [ZADANIE: Pocas mierenia sa zobrazuje vizualna pomocka —
  //  ciara alebo sipka od stredu kamena ku kurzoru]
  function onPointerMove(e) {
    if (!isAiming) return;
    mousePos = canvasToLogical(e.clientX, e.clientY);
  }

  // --- Uvolnenie mysi — vystrel ---
  // [ZADANIE: Po uvolneni mysi je kamen vystreleny]
  function onPointerUp() {
    if (!isAiming) return;
    isAiming = false;

    const stone = activeStone.body;

    // Vypocet vektora vystrelu (slingshot — opacny smer od tahu)
    // [ZADANIE: Sila vystrelu je umerna vzdialenosti tahu]
    const pullDx = mousePos.x - stone.position.x;
    const pullDy = mousePos.y - stone.position.y;
    const pullDist = Math.sqrt(pullDx * pullDx + pullDy * pullDy);

    // Minimalny tah aby sa zabranilo nahodnym klikom
    if (pullDist < 10) return;

    // Orezanie na maximalnu vzdialenost tahu
    const maxDrag = config.maxDragDistance;
    const clampedDist = Math.min(pullDist, maxDrag);

    // Sila vystrelu — umerna vzdialenosti tahu
    const power = (clampedDist / maxDrag) * config.maxShotSpeed;

    // Smer vystrelu — OPACNY smer od tahu (mechanika praku)
    const angle = Math.atan2(pullDy, pullDx);
    const shootDx = -Math.cos(angle) * power;
    const shootDy = -Math.sin(angle) * power;

    // Odoslanie vektora na server
    if (onShootCallback) {
      onShootCallback(shootDx, shootDy);
    }
  }

  // ============================================================
  // HERNY LOOP — fyzika + renderovanie
  // ============================================================

  function startGameLoop(firstPlayer) {
    gameActive = true;
    isPaused = false;
    isGameOver = false;
    currentTurn = firstPlayer;
    stonesThrown = [0, 0];
    allStones = [];
    activeStone = null;
    waitingForStop = false;

    // Vytvorenie prveho kamena
    placeNewStone(firstPlayer);

    // Spustenie herneho loopu
    gameLoop();
    console.log('[GAME] Hra zacala. Prvy hrac:', firstPlayer);
  }

  function gameLoop() {
    if (!gameActive) return;

    // Fyzika — aktualizacia enginu s fixnym krokom (determinizmus)
    // [ZADANIE: Fyzikalna simulacia bezi na strane klientov,
    //  pricvom obaja klienti dostanu rovnake vstupne parametre
    //  a simuluju ten isty stav hry]
    if (!isPaused) {
      Engine.update(engine, 1000 / 60);
      checkStoneSpeeds();
      checkStonesStop();
    }

    // Renderovanie na canvas
    render();

    // Dalsi frame
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // Kontrola a zastavenie velmi pomaly sa pohybujucich kamenov
  // [ZADANIE: Kamene spomaluju trenim a uplne zastanu]
  function checkStoneSpeeds() {
    const threshold = config.stopThreshold;
    allStones.forEach(s => {
      const speed = Math.sqrt(s.body.velocity.x ** 2 + s.body.velocity.y ** 2);
      if (speed > 0 && speed < threshold) {
        // Kamen je priilis pomaly — zastavime ho uplne
        Body.setVelocity(s.body, { x: 0, y: 0 });
        Body.setAngularVelocity(s.body, 0);
      }
    });
  }

  // Kontrola ci vsetky kamene zastali (po vystrele)
  function checkStonesStop() {
    if (!waitingForStop) return;

    shotFrameCount++;
    // Pockame par framov kym sila zaprsobi
    if (shotFrameCount < SHOT_DELAY_FRAMES) return;

    // Kontrola ci vsetky kamene stoja
    const allStopped = allStones.every(s => {
      const speed = Math.sqrt(s.body.velocity.x ** 2 + s.body.velocity.y ** 2);
      return speed === 0;
    });

    if (allStopped) {
      waitingForStop = false;
      console.log('[GAME] Vsetky kamene zastali');

      // Len aktivny hrac (ktory vystrelil) reportuje zastavenie
      if (currentTurn === myPlayerIndex) {
        if (onStonesStopCallback) onStonesStopCallback();
      }
    }
  }

  // ============================================================
  // SPRAVA KAMENOV
  // ============================================================

  // Umiestnenie noveho kamena na startovaciu poziciu
  function placeNewStone(playerIndex) {
    const x = config.throwPosition.x;
    const y = config.throwPosition.y;

    // Vytvorenie fyzikalneho telesa (kruh)
    // [ZADANIE: Kolizie medzi kamenmi su fyzikalne korektne (odraz kruh-kruh)]
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

  // ============================================================
  // PRIJATIE VYSTRELU ZO SERVERA
  // Oba klienti spravia to iste — determinizmus
  // ============================================================

  function handleShotFired(data) {
    // Ak kamen este nebol vytvoreny (druhy hrac), vytvorime ho
    if (!activeStone || activeStone.playerIndex !== data.playerIndex) {
      placeNewStone(data.playerIndex);
    }

    stonesThrown[data.playerIndex] = data.stoneIndex + 1;

    // Aplikujeme rychlost na kamen (nie silu — pre predspovedatelnost)
    Body.setVelocity(activeStone.body, { x: data.dx, y: data.dy });

    // Zaciname cakat na zastavenie kamenov
    waitingForStop = true;
    shotFrameCount = 0;
    isAiming = false;

    console.log(`[GAME] Vystrel hraca ${data.playerIndex}: dx=${data.dx.toFixed(2)}, dy=${data.dy.toFixed(2)}`);
  }

  // Zmena tahu — novy kamen pre dalsieho hraca
  // [ZADANIE: Hraci sa v hadzani kamenov striedaju]
  function handleTurnChange(data) {
    currentTurn = data.currentPlayer;
    activeStone = null;

    // Vytvorenie noveho kamena pre hraca na tahu
    placeNewStone(data.currentPlayer);

    console.log(`[GAME] Zmena tahu — na tahu: ${data.currentPlayer}`);
  }

  // Vsetky kamene boli odhodene — urcenie vitaza
  // [ZADANIE: Po odohrani vsetkych kamenov sa urci vitaz —
  //  vyhrava hrac, ktoreho kamen je najblizsi k cielu]
  function handleAllStonesThrown() {
    isGameOver = true;
    activeStone = null;

    // Vypocet vzdialenosti kamenov od ciela
    const results = calculateResults();

    console.log('[GAME] Koniec hry! Vysledky:', results);

    if (onGameOverCallback) {
      onGameOverCallback(results);
    }
  }

  // Vypocet vysledkov — vzdialenost kazdeho kamena od ciela
  function calculateResults() {
    const targetX = config.target.x;
    const targetY = config.target.y;

    let bestDist = [Infinity, Infinity]; // Najlepsia vzdialenost pre kazdeho hraca
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

    // Urcenie vitaza
    let winner = -1; // -1 = remiza
    if (bestDist[0] < bestDist[1]) winner = 0;
    else if (bestDist[1] < bestDist[0]) winner = 1;

    return {
      winner,
      bestDistances: bestDist,
      allDistances: stoneDistances
    };
  }

  // ============================================================
  // RENDEROVANIE (Canvas API)
  // [ZADANIE: Rendering hracej plochy musi byt realizovany
  //  pomocou Canvas API]
  // ============================================================

  function render() {
    ctx.clearRect(0, 0, fieldW, fieldH);

    drawField();
    drawTarget();
    drawAllStones();
    drawAimingLine();
    drawTurnText();
  }

  // --- Hracia plocha (pozadie) — vertikalny layout ---
  function drawField() {
    // Ledova plocha — gradient (zhora nadol)
    const grad = ctx.createLinearGradient(0, 0, 0, fieldH);
    grad.addColorStop(0, '#d4e6f1');
    grad.addColorStop(0.5, '#e8f0f8');
    grad.addColorStop(1, '#d4e6f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, fieldW, fieldH);

    // Okrajova ciara
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, fieldW - 4, fieldH - 4);

    // Stredova ciara (horizontalna)
    ctx.beginPath();
    ctx.moveTo(0, fieldH / 2);
    ctx.lineTo(fieldW, fieldH / 2);
    ctx.strokeStyle = 'rgba(144, 164, 174, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Strelecka ciara (hog line) — horizontalna, nad startovacou poziciou
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

  // --- Ciel (sustredne kruhy) ---
  // [ZADANIE: Ciel musi byt na hracej ploche farebne vyznaceny
  //  (napr. sustredne kruhy)]
  function drawTarget() {
    const { x, y, radius } = config.target;
    const rings = [
      { ratio: 1.0, color: TARGET_COLORS[0] },    // vonkajsi — modry
      { ratio: 0.75, color: TARGET_COLORS[1] },   // biely
      { ratio: 0.5, color: TARGET_COLORS[2] },    // cerveny
      { ratio: 0.25, color: TARGET_COLORS[3] }    // stredovy — cerveny
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

    // Krizikovvy stred
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- Vsetky kamene ---
  function drawAllStones() {
    allStones.forEach(s => {
      drawStone(s.body, s.playerIndex, s === activeStone);
    });
  }

  // Vykreslenie jedneho kamena
  function drawStone(body, playerIndex, isActive) {
    const x = body.position.x;
    const y = body.position.y;
    const r = config.stoneRadius;

    // Tien kamena
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Telo kamena — vypln
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const stoneGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    stoneGrad.addColorStop(0, PLAYER_COLORS_LIGHT[playerIndex]);
    stoneGrad.addColorStop(1, PLAYER_COLORS[playerIndex]);
    ctx.fillStyle = stoneGrad;
    ctx.fill();

    // Okraj kamena
    ctx.strokeStyle = PLAYER_COLORS_DARK[playerIndex];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rukovet kamena (maly kruh v strede)
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = PLAYER_COLORS_DARK[playerIndex];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Aktivny kamen bliká (highlight)
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

  // --- Mieridlo (vizualna pomocka pocas tahu) ---
  // [ZADANIE: Pocas mierenia sa zobrazuje vizualna pomocka —
  //  ciara alebo sipka od stredu kamena ku kurzoru —
  //  indikujuca smer a silu vystrelu]
  function drawAimingLine() {
    if (!isAiming || !activeStone) return;

    const stone = activeStone.body;
    const sx = stone.position.x;
    const sy = stone.position.y;
    const mx = mousePos.x;
    const my = mousePos.y;

    // Vzdialenost tahu
    const pullDx = mx - sx;
    const pullDy = my - sy;
    const pullDist = Math.sqrt(pullDx * pullDx + pullDy * pullDy);
    const maxDrag = config.maxDragDistance;
    const powerRatio = Math.min(pullDist / maxDrag, 1);

    // 1) Ciara od kamena ku kurzoru (tah)
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2) Sipka v smere vystrelu (opacny smer tahu)
    const angle = Math.atan2(pullDy, pullDx);
    const arrowLen = powerRatio * 120; // dlzka sipky podla sily
    const arrowEndX = sx - Math.cos(angle) * arrowLen;
    const arrowEndY = sy - Math.sin(angle) * arrowLen;

    // Farba sipky podla sily (zelena → zlta → cervena)
    const r = Math.round(255 * powerRatio);
    const g = Math.round(255 * (1 - powerRatio));
    const arrowColor = `rgb(${r}, ${g}, 50)`;

    // Hlavna ciara sipky
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hrot sipky
    const headLen = 12;
    const headAngle = angle + Math.PI; // smer vystrelu
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

    // 3) Indikator sily (text)
    const powerPercent = Math.round(powerRatio * 100);
    ctx.fillStyle = arrowColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${powerPercent}%`, sx, sy - config.stoneRadius - 15);
  }

  // --- Text kto je na tahu (v pripade ze nie som ja) ---
  function drawTurnText() {
    if (isGameOver) return;

    if (waitingForStop) {
      // Kamene sa pohybuju
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kamene sa pohybujú...', fieldW / 2, 30);
    } else if (currentTurn !== myPlayerIndex && !isGameOver) {
      // Na tahu je supera
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Čaká sa na súpera...', fieldW / 2, 30);
    } else if (currentTurn === myPlayerIndex && !waitingForStop) {
      // Na tahu som ja
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ťahaj od kameňa a zamier!', fieldW / 2, 30);
    }
  }

  // ============================================================
  // PAUZA / RESTART
  // ============================================================

  function pause() {
    isPaused = true;
  }

  function unpause() {
    isPaused = false;
  }

  // Reset hry pre novu partiu
  function reset() {
    // Zastavime animacny loop
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

    // Reset Matter.js — vymazeme vsetky telesa
    Composite.clear(engine.world);
    Engine.clear(engine);

    // Znovu vytvorime engine a steny
    engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    createWalls();

    // Vycistime canvas
    ctx.clearRect(0, 0, fieldW, fieldH);

    console.log('[GAME] Hra resetovana');
  }

  // ============================================================
  // GETTRE A SETTRE
  // ============================================================

  function getCurrentTurn() { return currentTurn; }
  function getMyPlayerIndex() { return myPlayerIndex; }
  function getStonesThrown() { return stonesThrown; }
  function getStonesPerPlayer() { return config ? config.stonesPerPlayer : 0; }
  function getIsGameOver() { return isGameOver; }
  function getIsPaused() { return isPaused; }

  function setOnShoot(cb) { onShootCallback = cb; }
  function setOnStonesStop(cb) { onStonesStopCallback = cb; }
  function setOnGameOver(cb) { onGameOverCallback = cb; }

  // ============================================================
  // VEREJNE API
  // ============================================================

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
    setOnGameOver
  };
})();

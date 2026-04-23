// Stone skin patterns — rendered on top of the base colored circle.
const StoneSkins = (function () {

  const SKINS = ['classic', 'stripes', 'star', 'dots', 'bullseye', 'diamond'];

  // Draw skin pattern on top of an already-filled stone at (x, y) with radius r
  function drawPattern(ctx, skin, x, y, r) {
    if (skin === 'stripes') {
      drawStripes(ctx, x, y, r);
    } else if (skin === 'star') {
      drawStar(ctx, x, y, r);
    } else if (skin === 'dots') {
      drawDots(ctx, x, y, r);
    } else if (skin === 'bullseye') {
      drawBullseye(ctx, x, y, r);
    } else if (skin === 'diamond') {
      drawDiamond(ctx, x, y, r);
    }
    // 'classic' — no extra pattern, just the plain stone circle
  }

  function drawStripes(ctx, x, y, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-r * 1.5, -r * 0.5, r * 3, r * 0.2);
    ctx.fillRect(-r * 1.5, r * 0.1, r * 3, r * 0.2);
    ctx.fillRect(-r * 1.5, -r * 0.15, r * 3, r * 0.2);
    ctx.restore();
  }

  function drawStar(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    const outerR = r * 0.55;
    const innerR = outerR * 0.4;
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      if (i === 0) ctx.moveTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
      else ctx.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
      ctx.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawDots(ctx, x, y, r) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const dotR = r * 0.16;
    const dist = r * 0.38;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(x + dx * dist, y + dy * dist, dotR, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBullseye(ctx, x, y, r) {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    // Solid center dot — matches the white core of the CSS preview
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDiamond(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const side = r * 0.65;
    ctx.fillRect(-side / 2, -side / 2, side, side);
    ctx.restore();
  }

  return {
    drawPattern,
    SKINS
  };
})();

// Лёгкое конфетти на canvas для побед и новых уровней.

const COLORS = ['#7c5cff', '#22c55e', '#facc15', '#f472b6', '#38bdf8', '#fb923c'];
let particles = [];
let running = false;

function canvas() {
  return document.getElementById('confetti');
}

function reducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function confetti({ x = 0.5, y = 0.35, count = 120, spread = 1 } = {}) {
  const el = canvas();
  if (!el || reducedMotion()) return;
  const dpr = window.devicePixelRatio || 1;
  el.width = innerWidth * dpr;
  el.height = innerHeight * dpr;
  const ctx = el.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (4 + Math.random() * 8) * spread;
    particles.push({
      x: x * innerWidth,
      y: y * innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
      life: 0,
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(() => frame(ctx));
  }
}

function frame(ctx) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life < 140 && p.y < innerHeight + 40);
  for (const p of particles) {
    p.life += 1;
    p.vy += 0.28;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, 1 - p.life / 140);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (particles.length) requestAnimationFrame(() => frame(ctx));
  else {
    running = false;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}

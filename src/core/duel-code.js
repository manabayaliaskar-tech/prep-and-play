// Код дуэли: результат игрока + зерно заданий, упакованные в короткую строку для ссылки.
// Сервер не нужен: у друга по тому же зерну получатся те же задания.

export const DUEL_LENGTH = 10;
const SECTIONS = ['math', 'rw', 'mix'];

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code) {
  let b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodeDuel({ seed, section, name, correct, timeMs }) {
  return toBase64Url(
    JSON.stringify({ v: 1, s: seed, m: section, n: String(name).slice(0, 24), c: correct, k: DUEL_LENGTH, t: Math.round(timeMs) }),
  );
}

export function decodeDuel(code) {
  try {
    const d = JSON.parse(fromBase64Url(code));
    const valid =
      d &&
      Number.isInteger(d.s) &&
      d.s >= 0 &&
      SECTIONS.includes(d.m) &&
      typeof d.n === 'string' &&
      d.k === DUEL_LENGTH &&
      Number.isInteger(d.c) &&
      d.c >= 0 &&
      d.c <= d.k &&
      Number.isFinite(d.t) &&
      d.t >= 0;
    if (!valid) return null;
    return { seed: d.s, section: d.m, name: d.n.slice(0, 24), correct: d.c, total: d.k, timeMs: d.t };
  } catch {
    return null;
  }
}

/** Кто победил: больше правильных, при равенстве — быстрее. */
export function duelOutcome(me, them) {
  if (me.correct !== them.correct) return me.correct > them.correct ? 'win' : 'lose';
  if (Math.abs(me.timeMs - them.timeMs) < 1000) return 'draw';
  return me.timeMs < them.timeMs ? 'win' : 'lose';
}

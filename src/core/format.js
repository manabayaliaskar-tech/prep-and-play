// Красивая запись математики в HTML: минус «−», курсивные переменные, дроби, степени.

export const MINUS = '−';

export function num(x) {
  if (!Number.isFinite(x)) return String(x);
  const r = Math.round(x * 1000) / 1000;
  const abs = Math.abs(r);
  const body = Number.isInteger(abs) ? abs.toLocaleString('en-US') : String(abs);
  return (r < 0 ? MINUS : '') + body;
}

export const v = (name = 'x') => `<i>${name}</i>`;

/** Многочлен по коэффициентам от старшей степени: [2, -3, 1] → 2x² − 3x + 1 */
export function polyStr(coefs, name = 'x') {
  const deg = coefs.length - 1;
  const parts = [];
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const varPart = p === 0 ? '' : p === 1 ? v(name) : `${v(name)}<sup>${p}</sup>`;
    const abs = Math.abs(c);
    const body = varPart ? (abs === 1 ? varPart : num(abs) + varPart) : num(abs);
    if (parts.length === 0) parts.push((c < 0 ? MINUS : '') + body);
    else parts.push((c < 0 ? ` ${MINUS} ` : ' + ') + body);
  });
  return parts.length ? parts.join('') : '0';
}

export const linear = (a, b, name = 'x') => polyStr([a, b], name);

/** Сумма слагаемых вида [[коэф, 'x'], [коэф, 'y'], [коэф, '']] */
export function terms(list) {
  const parts = [];
  for (const [c, name] of list) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const body = name ? (abs === 1 ? v(name) : num(abs) + v(name)) : num(abs);
    if (parts.length === 0) parts.push((c < 0 ? MINUS : '') + body);
    else parts.push((c < 0 ? ` ${MINUS} ` : ' + ') + body);
  }
  return parts.length ? parts.join('') : '0';
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function simplify(n, d) {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

export function fracHtml(n, d) {
  const [a, b] = simplify(n, d);
  if (b === 1) return num(a);
  return `${a < 0 ? MINUS : ''}<span class="frac"><span>${Math.abs(a)}</span><span>${b}</span></span>`;
}

/** Дробь обычным текстом для ответа с вводом: «3/4», «-5/2», «7». */
export function fracText(n, d) {
  const [a, b] = simplify(n, d);
  return b === 1 ? String(a) : `${a}/${b}`;
}

export const money = (x) => `$${num(x)}`;

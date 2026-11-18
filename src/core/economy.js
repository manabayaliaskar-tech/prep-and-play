// Экономика и «жизнь» Препи: монеты, множитель за серию, цвет огонька, спасение серии и настроение.
// Здесь только чистые функции от профиля - сам профиль хранится в core/profile.js.

import { daysBetween } from './dates.js';

// ---------- Монеты ----------

/** Сколько XP нужно на одну монету. */
export const XP_PER_COIN = 4;
/** Монеты за каждое достижение и за новый уровень. */
export const ACH_COINS = 50;
export const levelCoins = (level) => 25 + level * 5;
/** Подарок Препи за выполненную дневную цель: база + бонус за цвет огонька. */
export const giftCoins = (streak) => 20 + flameIndex(streak) * 10;

// ---------- Множитель за серию ----------

export const MULT_TIERS = [
  [100, 2],
  [60, 1.75],
  [30, 1.5],
  [14, 1.3],
  [7, 1.2],
  [3, 1.1],
];

export function streakMultiplier(streak) {
  for (const [days, mult] of MULT_TIERS) if (streak >= days) return mult;
  return 1;
}

/** Следующая ступень множителя: { days, mult, left } или null. */
export function nextMultiplier(streak) {
  const next = [...MULT_TIERS].reverse().find(([days]) => streak < days);
  return next ? { days: next[0], mult: next[1], left: next[0] - streak } : null;
}

// ---------- Огонёк ----------

export const FLAMES = [
  { id: 'out', min: 0, colors: ['#cbd5e1', '#94a3b8', '#64748b'] },
  { id: 'orange', min: 1, colors: ['#fde68a', '#fb923c', '#ea580c'] },
  { id: 'red', min: 7, colors: ['#fecaca', '#f87171', '#b91c1c'] },
  { id: 'blue', min: 30, colors: ['#e0f2fe', '#38bdf8', '#1d4ed8'] },
  { id: 'purple', min: 100, colors: ['#f5d0fe', '#c084fc', '#6d28d9'] },
  { id: 'rainbow', min: 365, colors: ['#fef08a', '#f472b6', '#6366f1'] },
];

export function flameIndex(streak) {
  let i = 0;
  FLAMES.forEach((f, k) => {
    if (streak >= f.min) i = k;
  });
  return i;
}

export const flameOf = (streak) => FLAMES[flameIndex(streak)];

/** Следующий цвет огонька: { flame, left } или null. */
export function nextFlame(streak) {
  const next = FLAMES[flameIndex(streak) + 1];
  return next ? { flame: next, left: next.min - streak } : null;
}

let flameUid = 0;

/** Огонёк в виде картинки: цвет зависит от длины серии, радужный переливается. */
export function flameSvg(streak, cls = '') {
  const f = flameOf(streak);
  const id = `fl${++flameUid}`;
  const [a, b, c] = f.colors;
  return `<svg class="flame flame-${f.id} ${cls}" viewBox="0 0 24 30" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
    <path class="flame-outer" d="M12 1 C14 7 21 10 21 18 A9 9 0 0 1 3 18 C3 13 6 11 7 7 C8 10 9 11 10 11 C10 7 11 4 12 1 Z" fill="url(#${id})"/>
    <path class="flame-inner" d="M12 13 C13 16 16 17 16 21 A4 4 0 0 1 8 21 C8 18 10 17 12 13 Z" fill="${a}" opacity=".9"/>
  </svg>`;
}

// ---------- Спасение серии ----------

/** Сколько XP нужно набрать в день возвращения, чтобы вернуть погасшую серию. */
export const RESCUE_XP = 120;

/**
 * Состояние спасения серии на сегодня:
 * { state: 'pending' } - пропущен ровно один день и сегодня ещё не занимались;
 * { state: 'active', xp } - уже занимаются, нужно добрать RESCUE_XP;
 * null - спасать нечего.
 */
export function rescueState(profile, today, xpToday) {
  const lost = profile.streakLost;
  if (lost?.day === today) return { state: 'active', count: lost.count, xp: Math.min(xpToday, RESCUE_XP), need: RESCUE_XP };
  const s = profile.streak ?? {};
  if (s.last && s.count >= 2 && daysBetween(s.last, today) === 2) return { state: 'pending', count: s.count, xp: 0, need: RESCUE_XP };
  return null;
}

// ---------- Настроение Препи ----------

/** С какой серии Препи становится качком и огненным. */
export const FORM_STREAK = { buff: 7, blaze: 30 };

export const MOODS = {
  blaze: { mascot: 'starstruck', form: 'blaze', energy: 100 },
  buff: { mascot: 'win', form: 'buff', energy: 100 },
  joy: { mascot: 'win', energy: 100 },
  happy: { mascot: 'happy', energy: 75 },
  hello: { mascot: 'happy', energy: 60 },
  wait: { mascot: 'think', energy: 50 },
  sad: { mascot: 'sad', energy: 25 },
  sick: { mascot: 'sick', form: 'sick', energy: 12 },
  rip: { mascot: 'ghost', form: 'tomb', energy: 0 },
};

/**
 * Настроение и облик Препи: зависят от того, занимался ли ты сегодня, длины серии и долгого ли был перерыв.
 * Длинная серия - качок (7+ дней) и огненный (30+); перерыв 3-6 дней - заболел; неделя и больше - призрак над надгробием серии.
 */
export function prepiMood(profile, today, xpToday, goal) {
  const last = profile.streak?.last;
  const count = profile.streak?.count ?? 0;
  let id;
  if (xpToday > 0) id = count >= FORM_STREAK.blaze ? 'blaze' : count >= FORM_STREAK.buff ? 'buff' : xpToday >= goal ? 'joy' : 'happy';
  else if (!last) id = 'hello';
  else {
    const gap = daysBetween(last, today);
    id = gap <= 1 ? 'wait' : gap === 2 ? 'sad' : gap < 7 ? 'sick' : 'rip';
  }
  const base = MOODS[id];
  const energy = xpToday > 0 && xpToday < goal ? Math.round(55 + (40 * xpToday) / goal) : base.energy;
  return { id, mascot: base.mascot, form: base.form ?? null, energy };
}

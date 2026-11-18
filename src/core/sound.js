// Звуки игры, синтезированные прямо в браузере (Web Audio) - без аудиофайлов.

import { getProfile } from './profile.js';
import { storage } from './storage.js';

/** Громкость 0…1, по умолчанию 0.8. */
export function getVolume() {
  const v = storage.get('volume', 0.8);
  return typeof v === 'number' && v >= 0 && v <= 1 ? v : 0.8;
}

export function setVolume(v) {
  storage.set('volume', Math.max(0, Math.min(1, v)));
}

let ctx = null;

function audio() {
  if (!ctx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, duration, { type = 'sine', gain = 0.1 } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * getVolume() * 1.25), t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function play(fn) {
  if (!getProfile().sound) return;
  try {
    fn();
  } catch {
    // Браузер не дал воспроизвести звук - игра продолжается без него.
  }
}

const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];

export const sfx = {
  tap: () => play(() => tone(700, 0, 0.05, { type: 'triangle', gain: 0.04 })),
  select: () => play(() => tone(880, 0, 0.06, { type: 'triangle', gain: 0.05 })),
  correct: (combo = 1) =>
    play(() => {
      const shift = Math.pow(2, Math.min(combo - 1, 8) / 12);
      tone(NOTES[2] * shift, 0, 0.12, { type: 'triangle' });
      tone(NOTES[4] * shift, 0.07, 0.14, { type: 'triangle' });
      tone(NOTES[7] * shift, 0.14, 0.22, { type: 'triangle', gain: 0.08 });
    }),
  wrong: () =>
    play(() => {
      tone(233, 0, 0.16, { type: 'sawtooth', gain: 0.045 });
      tone(174, 0.12, 0.26, { type: 'sawtooth', gain: 0.045 });
    }),
  hit: () =>
    play(() => {
      tone(140, 0, 0.12, { type: 'square', gain: 0.06 });
      tone(90, 0.05, 0.2, { type: 'square', gain: 0.05 });
    }),
  win: () => play(() => [0, 2, 4, 7].forEach((n, i) => tone(NOTES[n], i * 0.11, 0.3, { type: 'triangle' }))),
  lose: () => play(() => [4, 2, 0].forEach((n, i) => tone(NOTES[n] / 2, i * 0.16, 0.32, { type: 'sine', gain: 0.08 }))),
  levelUp: () => play(() => [0, 4, 7, 4, 7].forEach((n, i) => tone(NOTES[n] * 1.5, i * 0.09, 0.22, { type: 'square', gain: 0.04 }))),
  tick: () => play(() => tone(1200, 0, 0.03, { type: 'square', gain: 0.025 })),
  /** Звезда на экране результатов: каждая следующая - выше. */
  star: (i = 0) => play(() => tone(NOTES[4 + i] ?? NOTES[7], 0, 0.18, { type: 'triangle', gain: 0.08 })),
  /** Новый рекорд: короткие фанфары. */
  record: () =>
    play(() => {
      [0, 4, 7, 12].forEach((n, i) => tone(NOTES[0] * Math.pow(2, n / 12), i * 0.09, 0.26, { type: 'square', gain: 0.045 }));
      tone(NOTES[7] * 2, 0.4, 0.5, { type: 'triangle', gain: 0.07 });
    }),
  /** Монетка: начисление опыта. */
  coin: () =>
    play(() => {
      tone(988, 0, 0.07, { type: 'square', gain: 0.035 });
      tone(1319, 0.06, 0.16, { type: 'square', gain: 0.035 });
    }),
};

export function vibrate(pattern) {
  try {
    globalThis.navigator?.vibrate?.(pattern);
  } catch {
    // Вибрация не поддерживается.
  }
}

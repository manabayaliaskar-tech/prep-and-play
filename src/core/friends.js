// Рейтинг друзей: свой код (PREP-XXXXX), список кодов друзей, своя строка в таблице board
// (имя, вид Препи, опыт за неделю, серия, уровень) и строки друзей по кодам. Почта никуда не уходит.
// Своя строка появляется, только когда человек сам открыл «Друзей» (получил код) и вошёл в аккаунт.
// Список друзей хранится через storage - вместе с прогрессом он приходит на все устройства.

import { getSession, isSignedIn, request } from './cloud.js';
import { dayKey } from './dates.js';
import { currentStreak, dayRecord, getProfile, levelInfo } from './profile.js';
import { storage } from './storage.js';
import { getOutfit, itemById } from './wardrobe.js';

/** Буквы кода: без похожих 0/O, 1/I. */
export const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const CODE_RE = /^PREP-[2-9A-HJ-NP-Z]{5}$/;
export const MAX_FRIENDS = 50;
export const NAME_MAX = 24;
/** Слоты, которые видно на маленьком Препи в таблице (аура и питомец не нужны). */
export const LOOK_SLOTS = ['color', 'head', 'face', 'neck', 'body', 'back', 'feet', 'hand'];

const CODE_KEY = 'friendCode';
const LIST_KEY = 'friends';
/** Своя строка отправляется не раньше чем через 15 с после изменения и не чаще раза в 3 минуты. */
const PUBLISH_DELAY = 15000;
const PUBLISH_GAP = 3 * 60 * 1000;

// ---------- Коды ----------

export function makeCode(rng = Math.random) {
  let s = '';
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  return `PREP-${s}`;
}

/** Введённый код (или ссылка с ним) в виде PREP-XXXXX; null - если код неверный. */
export function normalizeCode(raw) {
  let s = String(raw ?? '')
    .toUpperCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, '');
  if (s.includes('/')) s = s.slice(s.lastIndexOf('/') + 1);
  if (!/^[2-9A-HJ-NP-Z]{5}$/.test(s)) s = s.replace(/^PREP-?/, '');
  const code = `PREP-${s}`;
  return CODE_RE.test(code) ? code : null;
}

export const myCode = () => {
  const c = storage.get(CODE_KEY, null);
  return CODE_RE.test(c ?? '') ? c : null;
};

// ---------- Список друзей ----------

export function getFriends() {
  const list = storage.get(LIST_KEY, []);
  return Array.isArray(list) ? [...new Set(list.filter((c) => CODE_RE.test(c ?? '')))] : [];
}

/** Можно ли добавить код: { code } или { error: 'format' | 'self' | 'dup' | 'max' }. */
export function checkAdd(raw, list, mine) {
  const code = normalizeCode(raw);
  if (!code) return { error: 'format' };
  if (code === mine) return { error: 'self' };
  if (list.includes(code)) return { error: 'dup' };
  if (list.length >= MAX_FRIENDS) return { error: 'max' };
  return { code };
}

export function addFriend(raw) {
  const res = checkAdd(raw, getFriends(), myCode());
  if (res.code) storage.set(LIST_KEY, [...getFriends(), res.code]);
  return res;
}

export function removeFriend(code) {
  storage.set(LIST_KEY, getFriends().filter((c) => c !== code));
}

// ---------- Неделя ----------

const fromKey = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const toKey = (dt) => dt.toISOString().slice(0, 10);

/** Неделя по ISO (с понедельника): «2026-W47». */
export function isoWeek(day = dayKey()) {
  const dt = fromKey(day);
  // Четверг этой недели определяет год и номер недели.
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7) + 3);
  const year = dt.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstThu = new Date(jan4);
  firstThu.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + 3);
  const week = 1 + Math.round((dt - firstThu) / (7 * 86400000));
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Дни недели с понедельника по воскресенье (ключи ГГГГ-ММ-ДД). */
export function weekDays(day = dayKey()) {
  const dt = fromKey(day);
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dt);
    d.setUTCDate(dt.getUTCDate() + i);
    return toKey(d);
  });
}

/** Опыт за текущую неделю: сумма по дням из истории профиля. */
export function weekXp(day = dayKey(), record = dayRecord) {
  return weekDays(day)
    .filter((d) => d <= day)
    .reduce((sum, d) => sum + (Number(record(d)?.xp) || 0), 0);
}

// ---------- Вид Препи ----------

/** Что надето - коротко, для строки рейтинга. */
export function myLook(outfit = getOutfit()) {
  const look = {};
  for (const slot of LOOK_SLOTS) if (outfit?.[slot] && !(slot === 'color' && outfit[slot] === 'classic')) look[slot] = outfit[slot];
  return look;
}

/** Наряд для рисования из чужой строки: только существующие вещи своих слотов. */
export function readLook(look) {
  const out = { head: null, face: null, neck: null, body: null, feet: null, hand: null, back: null, color: 'classic', aura: null, pet: null };
  if (!look || typeof look !== 'object') return out;
  for (const slot of LOOK_SLOTS) {
    const id = look[slot];
    if (typeof id === 'string' && itemById(id)?.slot === slot) out[slot] = id;
  }
  return out;
}

// ---------- Таблица ----------

/** Своя строка для таблицы board. */
export function myRow(code = myCode(), p = getProfile(), day = dayKey()) {
  return {
    code,
    name: String(p.name ?? '').trim().slice(0, NAME_MAX) || null,
    look: myLook(),
    week: isoWeek(day),
    week_xp: weekXp(day),
    streak: currentStreak(day),
    level: levelInfo(p.xp ?? 0).level,
  };
}

/** Порядок: опыт за эту неделю (из прошлой недели - 0), при равенстве - серия, потом имя. */
export function sortBoard(rows, week = isoWeek()) {
  return rows
    .map((r) => ({ ...r, xp: r.week === week ? Math.max(0, Number(r.week_xp) || 0) : 0, streak: Math.max(0, Number(r.streak) || 0) }))
    .sort((a, b) => b.xp - a.xp || b.streak - a.streak || String(a.name ?? '').localeCompare(String(b.name ?? '')));
}

/** Таблица ещё не создана в базе (владелец не запустил friends.sql). */
export const notReady = (err) => err?.status === 404 || /^PGRST2/.test(err?.code ?? '') || err?.code === '42P01' || err?.code === '42883';

/** Вид ошибки для экрана: soon - ещё не включено, offline - нет сети, signedOut, error. */
export function errorKind(err) {
  if (notReady(err)) return 'soon';
  if (err?.message === 'signed-out') return 'signedOut';
  if (globalThis.navigator?.onLine === false || err instanceof TypeError) return 'offline';
  return 'error';
}

// ---------- Облако ----------

let timer = null;
let lastAt = 0;
let off = false;
let hooked = false;

const uid = () => getSession()?.user?.id ?? null;

async function upsert(row, keepalive) {
  await request('/rest/v1/board', {
    method: 'POST',
    auth: true,
    keepalive,
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: { user_id: uid(), ...row },
  });
}

/** Отправить свою строку. Если код уже занят другим игроком - берём новый (до 5 попыток). */
export async function publishNow({ keepalive = false } = {}) {
  clearTimeout(timer);
  timer = null;
  if (!isSignedIn() || !uid() || !myCode()) return;
  lastAt = Date.now();
  for (let i = 0; i < 5; i++) {
    try {
      await upsert(myRow(), keepalive);
      return;
    } catch (e) {
      if (notReady(e)) off = true;
      if (e.status !== 409 || i === 4) throw e;
      storage.set(CODE_KEY, makeCode());
    }
  }
}

/** Свой код: из своей строки в базе (если уже есть), иначе новый. Сразу публикует строку. */
export async function ensureCode() {
  if (!uid()) throw new Error('signed-out');
  const rows = await request(`/rest/v1/board?select=code&user_id=eq.${uid()}`, { auth: true });
  const saved = rows?.[0]?.code;
  if (CODE_RE.test(saved ?? '')) storage.set(CODE_KEY, saved);
  else if (!myCode()) storage.set(CODE_KEY, makeCode());
  off = false;
  await publishNow();
  return myCode();
}

/** Строки друзей по кодам (только открытые поля). */
export async function fetchFriends(codes = getFriends()) {
  if (!codes.length) return [];
  const rows = await request('/rest/v1/rpc/board_by_codes', { method: 'POST', auth: true, body: { codes: codes.slice(0, MAX_FRIENDS) } });
  return Array.isArray(rows) ? rows.filter((r) => CODE_RE.test(r?.code ?? '')) : [];
}

/** Убрать себя из рейтинга: удалить свою строку и забыть код. */
export async function leaveBoard() {
  if (uid()) await request(`/rest/v1/board?user_id=eq.${uid()}`, { method: 'DELETE', auth: true, headers: { Prefer: 'return=minimal' } });
  clearTimeout(timer);
  timer = null;
  storage.set(CODE_KEY, null);
}

/** После изменения опыта или входа: отправить строку позже (с паузой между отправками). */
export function schedulePublish() {
  if (!hooked && globalThis.document) {
    hooked = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && timer) publishNow({ keepalive: true }).catch(() => {});
    });
  }
  if (off || timer || !isSignedIn() || !myCode()) return;
  const wait = Math.max(PUBLISH_DELAY, lastAt + PUBLISH_GAP - Date.now());
  timer = setTimeout(() => publishNow().catch(() => {}), wait);
}

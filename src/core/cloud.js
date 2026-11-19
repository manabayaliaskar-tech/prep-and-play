// Облако (Supabase): вход по коду из письма, прогресс в аккаунте, сообщения об ошибках в заданиях.
// Работает через REST - без сторонних библиотек. Ключ publishable открытый: доступ к данным
// ограничен правилами базы (каждый видит только свой прогресс).

import { storage, onStorageSet } from './storage.js';

export const CLOUD_URL = 'https://wkwqbghmghhsvjajlkoi.supabase.co';
const KEY = 'sb_publishable_3TBytkBIAvi6JR4ctR2tag_oVuWs5DH';

const PREFIX = 'prepplay:';
const SESSION = 'cloudSession';
const META = 'cloudMeta';
/** Не уходят в облако: вход, служебные отметки синхронизации, перезагрузки. */
const LOCAL_ONLY = new Set([SESSION, META, 'chunkReload', 'cloudLinkError']);
const PUSH_DELAY = 12000;

let pushTimer = null;
const listeners = new Set();

// ---------- Сессия ----------

export const getSession = () => storage.get(SESSION, null);
export const isSignedIn = () => Boolean(getSession()?.refresh_token);
export const cloudEmail = () => getSession()?.user?.email ?? '';
export const cloudMeta = () => storage.get(META, {}) ?? {};
const setMeta = (patch) => storage.set(META, { ...cloudMeta(), ...patch });

/** Подписка на изменения состояния облака (вход, выход, синхронизация). */
export function onCloud(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const notify = () => listeners.forEach((fn) => fn());

function saveSession(s) {
  const expires_at = s.expires_at ?? Math.floor(Date.now() / 1000) + (s.expires_in ?? 3600);
  storage.set(SESSION, { access_token: s.access_token, refresh_token: s.refresh_token, expires_at, user: { id: s.user?.id, email: s.user?.email } });
}

async function request(path, { method = 'GET', body, auth = false, headers = {}, keepalive = false } = {}) {
  const h = { apikey: KEY, 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = await accessToken();
    if (!token) throw new Error('signed-out');
    h.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(CLOUD_URL + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body), keepalive });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data?.msg || data?.message || data?.error_description || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = data?.error_code || data?.code;
    throw err;
  }
  return data;
}

/** Действующий токен: если почти истёк - обновляем. */
async function accessToken() {
  const s = getSession();
  if (!s?.refresh_token) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
  try {
    const fresh = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } });
    saveSession({ ...fresh, user: fresh.user ?? s.user });
    return fresh.access_token;
  } catch (e) {
    // Токен отозван (вышли на другом устройстве) - считаем, что вход закончился.
    if (e.status === 400 || e.status === 401) {
      storage.set(SESSION, null);
      notify();
    }
    return null;
  }
}

// ---------- Вход по коду ----------

/** Отправить на почту код входа (аккаунт создаётся сам, если его ещё нет). */
export async function sendCode(email) {
  // Куда вернуть после ссылки из письма - на эту же страницу сайта (адрес должен быть в Redirect URLs Supabase).
  const back = encodeURIComponent(`${location.origin}${location.pathname}`);
  await request(`/auth/v1/otp?redirect_to=${back}`, { method: 'POST', body: { email: email.trim().toLowerCase(), create_user: true } });
}

/** Проверить код из письма. Возвращает { conflict } - если в аккаунте и на устройстве разный прогресс. */
export async function verifyCode(email, code) {
  const s = await request('/auth/v1/verify', { method: 'POST', body: { type: 'email', email: email.trim().toLowerCase(), token: code.trim() } });
  saveSession(s);
  notify();
  return firstSync();
}

/** Вход по ссылке из письма: Supabase возвращает на сайт с #access_token=… в адресе. */
export function takeSessionFromUrl() {
  const hash = location.hash;
  // Ссылка устарела или уже использована - ведём в профиль и говорим, что делать.
  if (/[#&]error(_code)?=/.test(hash) && !hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.slice(1));
    storage.set('cloudLinkError', params.get('error_code') || params.get('error') || 'error');
    history.replaceState(null, '', `${location.pathname}#/profile`);
    return false;
  }
  if (!hash.includes('access_token=')) return false;
  const params = new URLSearchParams(hash.slice(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return false;
  let user = {};
  try {
    const payload = JSON.parse(atob(access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    user = { id: payload.sub, email: payload.email };
  } catch {
    // Без данных пользователя - возьмём их при первом запросе.
  }
  saveSession({ access_token, refresh_token, expires_in: Number(params.get('expires_in')) || 3600, user });
  history.replaceState(null, '', `${location.pathname}#/profile`);
  return true;
}

export async function signOut() {
  try {
    await pushNow();
    await request('/auth/v1/logout', { method: 'POST', auth: true });
  } catch {
    // Даже без интернета выходим на этом устройстве.
  }
  storage.set(SESSION, null);
  storage.set(META, {});
  notify();
}

// ---------- Прогресс ----------

/** Все данные сайта из браузера, кроме служебных. */
function collectLocal() {
  const out = {};
  const ls = globalThis.localStorage;
  if (!ls) return out;
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k?.startsWith(PREFIX)) continue;
    const short = k.slice(PREFIX.length);
    if (!LOCAL_ONLY.has(short)) out[short] = ls.getItem(k);
  }
  return out;
}

/** Записать данные из облака в браузер (служебное не трогаем) и перезапустить сайт с ними. */
function applyRemote(data) {
  const ls = globalThis.localStorage;
  for (const short of Object.keys(collectLocal())) if (!(short in data)) ls.removeItem(PREFIX + short);
  for (const [short, raw] of Object.entries(data)) if (!LOCAL_ONLY.has(short) && typeof raw === 'string') ls.setItem(PREFIX + short, raw);
}

const xpOf = (data) => {
  try {
    return JSON.parse(data?.profile ?? 'null')?.xp ?? 0;
  } catch {
    return 0;
  }
};
export const levelSummary = (data) => ({ xp: xpOf(data) });

async function fetchRemote() {
  const uid = getSession()?.user?.id;
  const rows = await request(`/rest/v1/progress?select=data,updated_at${uid ? `&user_id=eq.${uid}` : ''}`, { auth: true });
  return rows?.[0] ?? null;
}

export async function pushNow({ keepalive = false } = {}) {
  clearTimeout(pushTimer);
  pushTimer = null;
  if (!isSignedIn()) return;
  const uid = getSession()?.user?.id;
  if (!uid) return;
  const updated_at = new Date().toISOString();
  await request('/rest/v1/progress', {
    method: 'POST',
    auth: true,
    keepalive,
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: { user_id: uid, data: collectLocal(), updated_at },
  });
  setMeta({ lastSync: updated_at, dirty: false });
  notify();
}

/** После входа: облако пустое - выгружаем своё; на устройстве пусто - берём из облака; иначе спрашиваем. */
async function firstSync() {
  const remote = await fetchRemote();
  const local = collectLocal();
  if (!remote || !Object.keys(remote.data ?? {}).length) {
    await pushNow();
    return { conflict: null };
  }
  if (xpOf(local) === 0) {
    useRemote(remote);
    return { conflict: null, reloaded: true };
  }
  return { conflict: { remote, localXp: xpOf(local), remoteXp: xpOf(remote.data) } };
}

/** Выбор при конфликте: взять прогресс из облака (сайт перезапустится). */
export function useRemote(remote) {
  applyRemote(remote.data);
  setMeta({ lastSync: remote.updated_at, dirty: false });
  location.reload();
}

/** При открытии сайта: если на другом устройстве прогресс новее - берём его. */
export async function syncOnStart() {
  if (!isSignedIn()) return;
  try {
    const remote = await fetchRemote();
    const meta = cloudMeta();
    if (!remote) return pushNow();
    const remoteNewer = !meta.lastSync || new Date(remote.updated_at) > new Date(meta.lastSync);
    if (remoteNewer && !meta.dirty) useRemote(remote);
    else if (meta.dirty) pushNow();
  } catch {
    // Нет интернета - работаем как раньше, отправим позже.
  }
}

function schedulePush() {
  if (!isSignedIn() || pushTimer) return;
  pushTimer = setTimeout(() => pushNow().catch(() => {}), PUSH_DELAY);
}

/** Запуск: следим за изменениями и отправляем их в облако с небольшой задержкой. */
export function startCloud() {
  onStorageSet((key) => {
    if (LOCAL_ONLY.has(key) || !isSignedIn()) return;
    if (!cloudMeta().dirty) setMeta({ dirty: true });
    schedulePush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && cloudMeta().dirty) pushNow({ keepalive: true }).catch(() => {});
  });
  syncOnStart();
}

// ---------- Сообщения об ошибках ----------

export async function sendReport({ questionId, topic, lang, message }) {
  await request('/rest/v1/reports', {
    method: 'POST',
    auth: isSignedIn(),
    headers: { Prefer: 'return=minimal' },
    body: { question_id: String(questionId).slice(0, 190), topic: topic ? String(topic).slice(0, 90) : null, lang, message: String(message).slice(0, 1900) },
  });
}

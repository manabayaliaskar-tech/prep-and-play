// Безопасная обёртка над localStorage (в приватном режиме он может быть недоступен).

const PREFIX = 'prepplay:';
const setListeners = new Set();

/** Подписка на любые записи (для синхронизации с облаком). fn(key). */
export function onStorageSet(fn) {
  setListeners.add(fn);
  return () => setListeners.delete(fn);
}

export const storage = {
  get(key, fallback) {
    try {
      const raw = globalThis.localStorage?.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Хранилище недоступно - прогресс просто не сохранится.
    }
    setListeners.forEach((fn) => fn(key));
  },
};

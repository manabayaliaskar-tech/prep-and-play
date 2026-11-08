// Безопасная обёртка над localStorage: в приватном режиме браузера он может быть недоступен.

const PREFIX = 'algovision:';

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
      // Хранилище недоступно — просто не сохраняем рекорд.
    }
  },
};

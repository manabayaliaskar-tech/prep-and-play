// Свежие курсы валют для примерной суммы в местной валюте.
// Курс берётся из открытого источника и хранится в браузере сутки.
// Если загрузить не удалось, используются запасные курсы из pricing.js.

import { CURRENCIES } from './pricing.js';
import { storage } from './storage.js';

const SOURCE = 'https://open.er-api.com/v6/latest/USD';
/** Источник курсов просит указывать ссылку на него рядом с суммой. */
export const RATES_CREDIT = { label: 'Rates By Exchange Rate API', url: 'https://www.exchangerate-api.com' };
const DAY_MS = 24 * 60 * 60 * 1000;

/** Из ответа сервиса оставляет только нужные валюты с положительным курсом. */
export function pickRates(data) {
  if (data?.result !== 'success' || !data.rates || typeof data.rates !== 'object') return null;
  const rates = {};
  for (const code of Object.keys(CURRENCIES)) {
    const value = data.rates[code];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) rates[code] = value;
  }
  return Object.keys(rates).length ? rates : null;
}

export function cachedRates() {
  const saved = storage.get('rates', null);
  return saved && typeof saved === 'object' && saved.rates && typeof saved.rates === 'object' ? saved : null;
}

/** Возвращает курсы к доллару: { KZT: 520, … } или null. Никогда не бросает ошибку. */
export async function loadRates(now = Date.now()) {
  const saved = cachedRates();
  if (saved && now - saved.at < DAY_MS) return saved.rates;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(SOURCE, { signal: controller.signal });
    clearTimeout(timer);
    const rates = pickRates(await response.json());
    if (!rates) return saved?.rates ?? null;
    storage.set('rates', { at: now, rates });
    return rates;
  } catch {
    return saved?.rates ?? null;
  }
}

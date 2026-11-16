// Тарифы и цены. Только расчёты, без интерфейса — поэтому всё проверяется тестами.
// Цены задаются в долларах. Местная валюта показывается приблизительно, со знаком «≈»:
// точную сумму списания определяет банк покупателя.

// usd — цена за месяц в целых долларах; покупатель видит её на один цент меньше (3 → 2,99 $).
export const PLANS = [
  { id: 'gold', icon: '🥇', usd: 3, color: '#f59e0b' },
  { id: 'diamond', icon: '💎', usd: 4, color: '#0ea5e9' },
  { id: 'amethyst', icon: '🔮', usd: 5, color: '#8b5cf6' },
];

/** Срок подписки и скидка в процентах. */
export const PERIODS = [
  { months: 1, off: 0 },
  { months: 3, off: 10 },
  { months: 6, off: 20 },
  { months: 12, off: 30 },
];

export const planById = (id) => PLANS.find((p) => p.id === id) ?? null;
export const periodByMonths = (months) => PERIODS.find((p) => p.months === months) ?? null;

/**
 * Цена за весь срок в центах. Сумма со скидкой уменьшается на один цент:
 * 3 $ → 2,99 $, три месяца «Золота» со скидкой 10% → 8,09 $.
 */
export function priceCents(plan, period) {
  return Math.round(plan.usd * period.months * (100 - period.off)) - 1;
}

/** Сколько выходит за один месяц при оплате за весь срок (в центах, округление вниз). */
export function monthlyCents(plan, period) {
  return Math.floor(priceCents(plan, period) / period.months);
}

/** Экономия по сравнению с оплатой помесячно (в центах). */
export function savedCents(plan, period) {
  return priceCents(plan, PERIODS[0]) * period.months - priceCents(plan, period);
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Валюты: знак и запасной курс к доллару на случай, если свежий курс загрузить не удалось.
 * Запасные курсы приблизительные и нужны только для ориентира.
 */
export const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  KZT: { symbol: '₸', rate: 520 },
  UZS: { symbol: 'сум', rate: 12700 },
  KGS: { symbol: 'сом', rate: 87 },
  TJS: { symbol: 'сомони', rate: 10 },
  AZN: { symbol: '₼', rate: 1.7 },
  AMD: { symbol: '֏', rate: 385 },
  MDL: { symbol: 'лей', rate: 17.5 },
  GEL: { symbol: '₾', rate: 2.7 },
  TMT: { symbol: 'ман.', rate: 3.5 },
  UAH: { symbol: '₴', rate: 41.5 },
  RUB: { symbol: '₽', rate: 85 },
  BYN: { symbol: 'Br', rate: 3.2 },
  TRY: { symbol: '₺', rate: 40 },
  EUR: { symbol: '€', rate: 0.9 },
  GBP: { symbol: '£', rate: 0.77 },
};

const ZONE_CURRENCY = [
  [/^Asia\/(Almaty|Qyzylorda|Qostanay|Aqtobe|Aqtau|Atyrau|Oral)$/, 'KZT'],
  [/^Asia\/(Tashkent|Samarkand)$/, 'UZS'],
  [/^Asia\/Bishkek$/, 'KGS'],
  [/^Asia\/Dushanbe$/, 'TJS'],
  [/^Asia\/Baku$/, 'AZN'],
  [/^Asia\/Yerevan$/, 'AMD'],
  [/^Europe\/Chisinau$/, 'MDL'],
  [/^Asia\/Tbilisi$/, 'GEL'],
  [/^Asia\/Ashgabat$/, 'TMT'],
  [/^Europe\/(Kyiv|Kiev|Uzhgorod|Zaporozhye)$/, 'UAH'],
  [/^Europe\/Minsk$/, 'BYN'],
  [/^Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Saratov|Ulyanovsk|Astrakhan|Kirov)$/, 'RUB'],
  [/^Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Vladivostok|Magadan|Sakhalin|Kamchatka|Anadyr|Khandyga|Ust-Nera|Srednekolymsk)$/, 'RUB'],
  [/^Europe\/Istanbul$/, 'TRY'],
  [/^Europe\/London$/, 'GBP'],
];

const REGION_CURRENCY = { KZ: 'KZT', UZ: 'UZS', KG: 'KGS', TJ: 'TJS', AZ: 'AZN', AM: 'AMD', MD: 'MDL', GE: 'GEL', TM: 'TMT', UA: 'UAH', RU: 'RUB', BY: 'BYN', TR: 'TRY', GB: 'GBP', US: 'USD' };

/** Валюта по часовому поясу и языку браузера. Если не удалось определить — доллары. */
export function guessCurrency(timeZone = '', locale = '') {
  for (const [pattern, code] of ZONE_CURRENCY) if (pattern.test(timeZone)) return code;
  const region = locale.split('-')[1]?.toUpperCase();
  if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  if (/^Europe\//.test(timeZone)) return 'EUR';
  return 'USD';
}

/** Округление «для глаз»: три значащие цифры для больших сумм, копейки — только для маленьких. */
export function roundNice(amount) {
  if (amount >= 100) {
    const magnitude = 10 ** (Math.floor(Math.log10(amount)) - 2);
    return Math.round(amount / magnitude) * magnitude;
  }
  if (amount >= 10) return Math.round(amount * 10) / 10;
  return Math.round(amount * 100) / 100;
}

/** Примерная сумма в местной валюте: { amount, text } или null для долларов. */
export function approxLocal(cents, code, rates = null) {
  const currency = CURRENCIES[code];
  if (!currency || code === 'USD') return null;
  const rate = rates?.[code] > 0 ? rates[code] : currency.rate;
  const amount = roundNice((cents / 100) * rate);
  const digits = amount >= 100 ? 0 : amount >= 10 ? 1 : 2;
  const [int, frac] = amount.toFixed(digits).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return { amount, text: `≈ ${grouped}${frac && Number(frac) ? `,${frac}` : ''} ${currency.symbol}` };
}

/** Проверка суммы поддержки: от 1 до 500 долларов, не больше двух знаков после запятой. */
export function parseDonation(input) {
  const text = String(input ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  return cents >= 100 && cents <= 50000 ? cents : null;
}

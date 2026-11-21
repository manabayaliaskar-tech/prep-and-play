import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRENCIES,
  PERIODS,
  PLANS,
  approxLocal,
  formatUsd,
  guessCurrency,
  monthlyCents,
  parseDonation,
  periodByMonths,
  planById,
  priceCents,
  roundNice,
  savedCents,
} from '../src/core/pricing.js';
import { detectLang, langFromSearch } from '../src/core/i18n.js';
import { loadRates, pickRates } from '../src/core/rates.js';

const NBSP = ' ';

test('тарифы: Золото 2,99 $, Алмаз 3,99 $, Аметист 4,99 $ в месяц', () => {
  assert.deepEqual(PLANS.map((p) => p.id), ['gold', 'diamond', 'amethyst']);
  const month = periodByMonths(1);
  assert.deepEqual(PLANS.map((p) => formatUsd(priceCents(p, month))), ['$2.99', '$3.99', '$4.99']);
  assert.equal(planById('nope'), null);
  assert.equal(periodByMonths(2), null);
});

test('сроки и скидки: 3 месяца - 10%, 6 месяцев - 20%, год - 30%', () => {
  assert.deepEqual(PERIODS.map((p) => [p.months, p.off]), [[1, 0], [3, 10], [6, 20], [12, 30]]);
  // Цена в центах за 1, 3, 6 и 12 месяцев.
  const table = {
    gold: [299, 809, 1439, 2519],
    diamond: [399, 1079, 1919, 3359],
    amethyst: [499, 1349, 2399, 4199],
  };
  for (const plan of PLANS) {
    assert.deepEqual(PERIODS.map((period) => priceCents(plan, period)), table[plan.id], plan.id);
    let previousMonthly = Infinity;
    for (const period of PERIODS) {
      const total = priceCents(plan, period);
      assert.equal(total % 10, 9, `${plan.id} ${period.months}: цена должна заканчиваться на 9`);
      // Скидка считается от полной цены в целых долларах, затем сумма уменьшается на один цент.
      const full = plan.usd * 100 * period.months;
      assert.equal(total, (full * (100 - period.off)) / 100 - 1, `${plan.id} ${period.months}: скидка`);
      const monthly = monthlyCents(plan, period);
      assert.ok(monthly < previousMonthly, `${plan.id}: чем дольше срок, тем дешевле месяц`);
      assert.ok(monthly * period.months <= total, 'цена за месяц округляется вниз');
      previousMonthly = monthly;
      assert.ok(savedCents(plan, period) >= 0);
    }
    assert.equal(savedCents(plan, PERIODS[0]), 0, 'при оплате за месяц экономии нет');
  }
  // Год «Золота»: 12 × 2,99 = 35,88 $ помесячно против 25,19 $ за год.
  assert.equal(savedCents(planById('gold'), periodByMonths(12)), 3588 - 2519);
  assert.equal(formatUsd(monthlyCents(planById('gold'), periodByMonths(12))), '$2.09');
});

test('запись суммы в долларах', () => {
  assert.equal(formatUsd(199), '$1.99');
  assert.equal(formatUsd(1679), '$16.79');
  assert.equal(formatUsd(100), '$1.00');
  assert.equal(formatUsd(5), '$0.05');
});

test('валюта определяется по часовому поясу, затем по языку браузера', () => {
  assert.equal(guessCurrency('Asia/Almaty', 'ru-RU'), 'KZT', 'часовой пояс важнее языка');
  assert.equal(guessCurrency('Asia/Qyzylorda', 'en-US'), 'KZT');
  assert.equal(guessCurrency('Asia/Tashkent', ''), 'UZS');
  assert.equal(guessCurrency('Asia/Bishkek', 'ru'), 'KGS');
  assert.equal(guessCurrency('Asia/Dushanbe', 'ru'), 'TJS');
  assert.equal(guessCurrency('Asia/Baku', 'az'), 'AZN');
  assert.equal(guessCurrency('Asia/Yerevan', 'hy'), 'AMD');
  assert.equal(guessCurrency('Europe/Chisinau', 'ro'), 'MDL');
  assert.equal(guessCurrency('Europe/Moscow', 'ru-RU'), 'RUB');
  assert.equal(guessCurrency('Asia/Novosibirsk', 'ru-RU'), 'RUB');
  assert.equal(guessCurrency('Europe/Minsk', 'ru'), 'BYN');
  assert.equal(guessCurrency('', 'ru-KZ'), 'KZT');
  assert.equal(guessCurrency('', 'kk-KZ'), 'KZT');
  assert.equal(guessCurrency('Europe/Berlin', 'de-DE'), 'EUR');
  assert.equal(guessCurrency('America/New_York', 'en-US'), 'USD');
  assert.equal(guessCurrency('Asia/Tokyo', 'ja-JP'), 'USD', 'неизвестная страна - доллары');
  assert.equal(guessCurrency(), 'USD');
  for (const code of Object.keys(CURRENCIES)) {
    assert.ok(CURRENCIES[code].symbol.length > 0 && CURRENCIES[code].rate > 0, code);
  }
});

test('язык при первом заходе: казахский, русский для СНГ, английский для остального мира', () => {
  assert.equal(detectLang('kk-KZ', 'Asia/Almaty'), 'kk');
  assert.equal(detectLang('ru-RU', ''), 'ru');
  assert.equal(detectLang('uz-UZ', ''), 'ru');
  assert.equal(detectLang('en-US', 'Asia/Almaty'), 'ru', 'телефон на английском, но человек в Казахстане');
  assert.equal(detectLang('en-KZ', ''), 'ru');
  assert.equal(detectLang('en-US', 'Asia/Tashkent'), 'ru');
  assert.equal(detectLang('en-US', 'America/New_York'), 'en');
  assert.equal(detectLang('de-DE', 'Europe/Berlin'), 'en');
  assert.equal(detectLang('tr-TR', 'Europe/Istanbul'), 'en');
  assert.equal(detectLang('', ''), 'ru', 'если о браузере ничего не известно - русский');
});

test('округление суммы в местной валюте', () => {
  assert.equal(roundNice(1034.8), 1030);
  assert.equal(roundNice(25273), 25300);
  assert.equal(roundNice(213233), 213000);
  assert.equal(roundNice(999.6), 1000);
  assert.equal(roundNice(173.13), 173);
  assert.equal(roundNice(100), 100);
  assert.equal(roundNice(33.83), 33.8);
  assert.equal(roundNice(3.383), 3.38);
});

test('примерная сумма в местной валюте показывается со знаком «≈»', () => {
  assert.equal(approxLocal(199, 'USD'), null, 'доллары пересчитывать не нужно');
  assert.equal(approxLocal(199, 'XXX'), null);
  const kzt = approxLocal(199, 'KZT', { KZT: 520 });
  assert.equal(kzt.amount, 1030);
  assert.equal(kzt.text, `≈${NBSP}1${NBSP}030${NBSP}₸`);
  assert.equal(approxLocal(1679, 'UZS', { UZS: 12700 }).text, `≈${NBSP}213${NBSP}000${NBSP}сум`);
  assert.equal(approxLocal(199, 'AZN', { AZN: 1.7 }).text, `≈${NBSP}3,38${NBSP}₼`);
  assert.equal(approxLocal(199, 'MDL', { MDL: 17.5 }).text, `≈${NBSP}34,8${NBSP}лей`);
  assert.equal(approxLocal(200, 'MDL', { MDL: 17.5 }).text, `≈${NBSP}35${NBSP}лей`, 'нулевые копейки не показываются');
  // Если свежего курса нет или он испорчен, берётся запасной курс.
  const fallback = roundNice(1.99 * CURRENCIES.KZT.rate);
  assert.equal(approxLocal(199, 'KZT', null).amount, fallback);
  assert.equal(approxLocal(199, 'KZT', { KZT: 0 }).amount, fallback);
  assert.equal(approxLocal(199, 'KZT', { UZS: 12700 }).amount, fallback);
  for (const code of Object.keys(CURRENCIES)) {
    if (code === 'USD') continue;
    assert.ok(approxLocal(399, code).text.startsWith('≈'), code);
  }
});

test('сумма поддержки: от 1 до 500 долларов', () => {
  assert.equal(parseDonation('3'), 300);
  assert.equal(parseDonation('2.5'), 250);
  assert.equal(parseDonation('2,50'), 250);
  assert.equal(parseDonation(' 10 '), 1000);
  assert.equal(parseDonation('500'), 50000);
  assert.equal(parseDonation(7), 700);
  for (const bad of ['0', '0.5', '501', 'abc', '', '1.234', '-5', '1e3', '3 $', null, undefined]) {
    assert.equal(parseDonation(bad), null, String(bad));
  }
});

test('курсы валют: из ответа сервиса берутся только нужные и корректные', () => {
  assert.deepEqual(pickRates({ result: 'success', rates: { KZT: 520.4, UZS: 12700, XYZ: 5, RUB: -1, EUR: 'oops' } }), { KZT: 520.4, UZS: 12700 });
  assert.equal(pickRates({ result: 'error', rates: { KZT: 520 } }), null);
  assert.equal(pickRates({ result: 'success' }), null);
  assert.equal(pickRates({ result: 'success', rates: { XYZ: 1 } }), null);
  assert.equal(pickRates(null), null);
});

test('курсы валют: сбой загрузки не ломает страницу', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ json: async () => ({ result: 'success', rates: { KZT: 531.2, USD: 1 } }) });
    assert.deepEqual(await loadRates(), { KZT: 531.2, USD: 1 });
    globalThis.fetch = async () => {
      throw new Error('offline');
    };
    assert.equal(await loadRates(), null);
    globalThis.fetch = async () => ({ json: async () => ({ result: 'error' }) });
    assert.equal(await loadRates(), null);
  } finally {
    globalThis.fetch = original;
  }
});

test('язык из адреса страницы: ?lang=kk', () => {
  assert.equal(langFromSearch('?lang=kk'), 'kk');
  assert.equal(langFromSearch('?lang=en&x=1'), 'en');
  assert.equal(langFromSearch('?lang=de'), null);
  assert.equal(langFromSearch(''), null);
});

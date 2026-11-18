// Тарифы: бесплатная версия и три подписки - Золото, Алмаз, Аметист.
// Цены показываются в долларах. Перед покупкой показывается примерная сумма в местной валюте.
// Оплата ещё не подключена: пока идёт бета-версия, все функции открыты.

import { t } from '../core/i18n.js';
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
  savedCents,
} from '../core/pricing.js';
import { RATES_CREDIT, cachedRates, loadRates } from '../core/rates.js';
import { storage } from '../core/storage.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';



// Строки таблицы: [название, «скоро», бесплатно, золото, алмаз, аметист].
// «Скоро» - функция ещё не готова и появится позже.
const ROWS = [
  ['premium.rowAll', false, true, true, true, true],
  ['premium.rowSolutions', false, true, true, true, true],
  ['premium.rowTests', false, 'premium.limitDay', 'premium.unlimited', 'premium.unlimited', 'premium.unlimited'],
  ['premium.rowStats', true, false, true, true, true],
  ['premium.rowPlan', true, false, false, true, true],
  ['premium.rowTutor', true, false, false, 'premium.tutorLimit', 'premium.unlimited'],
  ['premium.rowClass', true, false, false, true, true],
  ['premium.rowAudio', true, false, false, false, true],
];

const cell = (v) => (v === true ? '<span class="yes">✓</span>' : v === false ? '<span class="no">-</span>' : `<span class="txt">${t(v)}</span>`);
const periodLabel = (period) => t(`premium.period${period.months}`);

function currentCurrency() {
  const saved = storage.get('currency', null);
  if (saved && CURRENCIES[saved]) return saved;
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // Часовой пояс недоступен - определим валюту только по языку браузера.
  }
  return guessCurrency(zone, globalThis.navigator?.language ?? '');
}

/** Окно перед оплатой: сумма в долларах и примерная сумма в местной валюте. */
function openCheckout(title, cents) {
  let code = currentCurrency();
  const body = () => {
    const saved = cachedRates();
    const local = approxLocal(cents, code, saved?.rates ?? null);
    return `
      <div class="checkout">
        <div class="checkout-row"><span>${t('premium.total')}</span><b class="checkout-usd">${formatUsd(cents)}</b></div>
        <div class="checkout-row">
          <label for="currency-select">${t('premium.approx')}</label>
          <select id="currency-select" class="currency-select">${Object.keys(CURRENCIES)
            .map((c) => `<option value="${c}" ${c === code ? 'selected' : ''}>${c}</option>`)
            .join('')}</select>
        </div>
        <div class="checkout-local">${local ? esc(local.text) : formatUsd(cents)}</div>
        <p class="muted small">${t('premium.approxNote')}${saved ? ` <a href="${RATES_CREDIT.url}" target="_blank" rel="noopener">${RATES_CREDIT.label}</a>` : ''}</p>
        <p class="notice">ℹ️ ${t('premium.notYet')}</p>
      </div>`;
  };
  const refresh = () => {
    const root = document.querySelector('.modal-body');
    if (!root?.querySelector('.checkout')) return;
    root.innerHTML = body();
    root.querySelector('.currency-select').addEventListener('change', (e) => {
      code = e.target.value;
      storage.set('currency', code);
      refresh();
    });
  };
  openModal({ title, body: '<div class="checkout"></div>', actions: [{ label: t('premium.ok'), primary: true }] });
  refresh();
  // Свежий курс подгружается в фоне; если окно ещё открыто, сумма обновится.
  loadRates().then(refresh);
}

export function premiumScreen(app) {
  let months = storage.get('premiumPeriod', 12);
  if (!periodByMonths(months)) months = 12;

  const render = () => {
    const period = periodByMonths(months);
    const planCard = (plan) => {
      const total = priceCents(plan, period);
      return `
        <div class="plan plan-paid" style="--c:${plan.color}">
          ${plan.id === 'diamond' ? `<span class="plan-ribbon">${t('premium.popular')}</span>` : ''}
          <span class="plan-icon">${plan.icon}</span>
          <h2>${t(`premium.${plan.id}`)}</h2>
          <p class="plan-price">${formatUsd(total)}</p>
          <p class="plan-period">${period.months === 1 ? t('premium.perMonthOnly') : t('premium.forPeriod', { period: periodLabel(period) })}</p>
          <p class="plan-save">${
            period.months > 1
              ? `${t('premium.perMonth', { price: formatUsd(monthlyCents(plan, period)) })} · ${t('premium.save', { sum: formatUsd(savedCents(plan, period)) })}`
              : '&nbsp;'
          }</p>
          <p class="muted plan-desc">${t(`premium.${plan.id}Desc`)}</p>
          <button type="button" class="btn btn-primary btn-lg choose-btn" data-plan="${plan.id}">${t('premium.choose')}</button>
        </div>`;
    };
    app.innerHTML = `
      <section class="page premium">
        <div class="premium-hero">
          ${mascot('win', 'mascot-lg')}
          <h1>${t('premium.title')}</h1>
          <p class="muted">${t('premium.subtitle')}</p>
          <div class="beta-note">🎁 ${t('premium.beta')}</div>
        </div>

        <div class="period-switch" role="radiogroup" aria-label="${t('premium.periodLabel')}">
          ${PERIODS.map(
            (p) =>
              `<button type="button" role="radio" aria-checked="${p.months === months}" data-months="${p.months}">${periodLabel(p)}${p.off ? `<span class="off">−${p.off}%</span>` : ''}</button>`,
          ).join('')}
        </div>

        <div class="plans four">
          <div class="plan plan-free">
            <span class="plan-icon">🎓</span>
            <h2>${t('premium.free')}</h2>
            <p class="plan-price">$0</p>
            <p class="plan-period">${t('premium.forever')}</p>
            <p class="plan-save">&nbsp;</p>
            <p class="muted plan-desc">${t('premium.freeDesc')}</p>
            <a class="btn btn-soft btn-lg" href="#/">▶ ${t('premium.play')}</a>
          </div>
          ${PLANS.map(planCard).join('')}
        </div>

        <div class="panel">
          <h2>${t('premium.compare')}</h2>
          <div class="table-wrap">
            <table class="compare">
              <thead><tr><th></th><th>${t('premium.free')}</th>${PLANS.map((p) => `<th>${p.icon} ${t(`premium.${p.id}`)}</th>`).join('')}</tr></thead>
              <tbody>${ROWS.map(
                ([key, soon, ...cols]) =>
                  `<tr><th scope="row">${t(key)}${soon ? ` <span class="soon-tag">${t('cat.soonShort')}</span>` : ''}</th>${cols.map((v) => `<td>${cell(v)}</td>`).join('')}</tr>`,
              ).join('')}</tbody>
            </table>
          </div>
          <p class="muted small compare-note">${t('premium.note')}</p>
        </div>

        <div class="panel support">
          <div class="support-text">
            <h2>💜 ${t('premium.supportTitle')}</h2>
            <p class="muted">${t('premium.supportText')}</p>
          </div>
          <div class="support-form">
            <div class="support-presets">${[1, 3, 5, 10].map((v) => `<button type="button" class="btn btn-soft btn-sm" data-amount="${v}">$${v}</button>`).join('')}</div>
            <div class="support-row">
              <label class="support-input"><span>$</span><input type="text" inputmode="decimal" class="amount-input" value="3" maxlength="6" aria-label="${t('premium.supportAmount')}"/></label>
              <button type="button" class="btn btn-primary support-btn">${t('premium.supportBtn')}</button>
            </div>
          </div>
        </div>
      </section>`;

    app.querySelectorAll('[data-months]').forEach((b) =>
      b.addEventListener('click', () => {
        months = Number(b.dataset.months);
        storage.set('premiumPeriod', months);
        render();
      }),
    );
    app.querySelectorAll('.choose-btn').forEach((b) =>
      b.addEventListener('click', () => {
        const plan = planById(b.dataset.plan);
        openCheckout(`${plan.icon} ${t(`premium.${plan.id}`)} · ${periodLabel(period)}`, priceCents(plan, period));
      }),
    );
    const input = app.querySelector('.amount-input');
    app.querySelectorAll('[data-amount]').forEach((b) =>
      b.addEventListener('click', () => {
        input.value = b.dataset.amount;
      }),
    );
    app.querySelector('.support-btn').addEventListener('click', () => {
      const cents = parseDonation(input.value);
      if (cents === null) {
        toast(`⚠️ ${t('premium.supportBad')}`, { kind: 'warn' });
        input.focus();
        return;
      }
      openCheckout(`💜 ${t('premium.supportTitle')}`, cents);
    });
  };
  render();
  return { relabel: render };
}

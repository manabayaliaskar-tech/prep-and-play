// Экран результатов после любой игры: итог, звёзды, статистика, кнопки и разбор ошибок.

import { t, tx } from '../core/i18n.js';
import { skillName } from '../content/labels.js';
import { esc } from './dom.js';
import { mascot } from './mascot.js';
import { getEmote } from '../core/shop.js';
import { bindQuestion, questionHtml } from './question.js';
import { mountSolution } from './solution.js';
import { sfx } from '../core/sound.js';

export function starsHtml(stars, max = 3) {
  return `<div class="stars" aria-label="${stars}/${max}">${Array.from({ length: max }, (_, i) => `<span class="star ${i < stars ? 'on' : ''}" style="--d:${i * 180}ms">★</span>`).join('')}</div>`;
}

/** Список заданий с разбором; каждое раскрывается по нажатию. */
/** Метки по каждому заданию: сам / с подсказкой / ошибка. */
function marksHtml(log) {
  const mark = (e) => (!e.correct ? ['bad', '✗', t('help.markWrong')] : e.helped ? ['help', '💡', t('help.markHelp')] : ['ok', '✓', t('help.markSelf')]);
  return `<div class="help-marks">
    <div class="hm-row">${log.map((e, i) => { const [c, s, l] = mark(e); return `<span class="hm hm-${c}" title="#${i + 1} · ${l}">${s}</span>`; }).join('')}</div>
    <div class="hm-legend"><span><i class="hm hm-ok">✓</i> ${t('help.markSelf')}</span><span><i class="hm hm-help">💡</i> ${t('help.markHelp')}</span><span><i class="hm hm-bad">✗</i> ${t('help.markWrong')}</span></div>
    <p class="muted small">${t('help.starsNote')}</p>
  </div>`;
}

export function reviewHtml(log, { onlyWrong = true } = {}) {
  const items = log.map((entry, i) => ({ ...entry, n: i + 1 })).filter((e) => !onlyWrong || !e.correct);
  if (!items.length) return '';
  return `
    <section class="review">
      <h2>${onlyWrong ? t('res.reviewWrong', { n: items.length }) : t('res.reviewAll')}</h2>
      ${items
        .map(
          (e) => `
        <details class="review-item ${e.correct ? 'ok' : 'bad'}" data-n="${e.n - 1}">
          <summary><span class="review-mark">${e.correct ? (e.helped ? '💡' : '✓') : '✗'}</span><span>#${e.n} · ${esc(tx(skillName(e.question.skill)))}</span><span class="review-open">${t('res.open')}</span></summary>
          <div class="review-body"></div>
        </details>`,
        )
        .join('')}
    </section>`;
}

export function bindReview(root, log) {
  root.querySelectorAll('.review-item').forEach((details) =>
    details.addEventListener('toggle', () => {
      const body = details.querySelector('.review-body');
      if (!details.open || body.dataset.ready) return;
      body.dataset.ready = '1';
      const entry = log[Number(details.dataset.n)];
      body.innerHTML = `${questionHtml(entry.question)}<div class="review-solution"></div>`;
      const binder = bindQuestion(body, entry.question, { autofocus: false });
      binder.setResponse(entry.response);
      binder.lock(entry.correct);
      mountSolution(body.querySelector('.review-solution'), entry.question);
    }),
  );
}

const SHARE_ICON = '<svg class="share-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Чем делиться: свой результат экрана или, если его нет, новый уровень игрока. */
function shareData(data) {
  if (data.share) return data.share;
  if (data.levelUp) return { title: t('toast.levelUp'), big: String(data.levelUp), note: t('share.levelNote'), text: t('share.text', { r: t('home.level', { n: data.levelUp }) }) };
  return null;
}

/** Модуль картинки грузится только по нажатию (наведение заранее подгружает его). */
function bindShare(btn, share) {
  const load = () => import('./share.js');
  btn.addEventListener('pointerenter', load, { once: true });
  btn.addEventListener('click', async () => {
    btn.classList.add('is-busy');
    try {
      await (await load()).shareResult(share);
    } finally {
      btn.classList.remove('is-busy');
    }
  });
}

/**
 * build() возвращает данные экрана:
 * { mood, title, subtitle, stars, stats: [{ icon, label, value }], xp, actions: [{ label, href | onClick, primary }], extraHtml, log,
 *   share: { title, big, small, note, badge, stars } - кнопка «Поделиться» (см. ui/share.js), levelUp - новый уровень игрока }
 */
export function renderResults(app, build) {
  const data = build();
  const share = shareData(data);
  const mascotMood = data.mood === 'win' ? 'win' : data.mood === 'lose' ? 'sad' : 'happy';
  app.innerHTML = `
    <section class="results page">
      <div class="results-hero mood-${data.mood ?? 'neutral'}">
        ${mascot(mascotMood, 'mascot-lg bounce-in', undefined, { emote: data.mood === 'win' ? (getEmote() ?? undefined) : undefined })}
        <h1>${data.title}</h1>
        ${data.subtitle ? `<p class="results-sub">${data.subtitle}</p>` : ''}
        ${data.stars !== undefined && data.stars !== null ? starsHtml(data.stars) : ''}
        ${data.xp ? `<div class="xp-earned">+${data.xp} XP</div>` : ''}
      </div>
      ${data.stats?.length ? `<div class="result-stats">${data.stats.map((s) => `<div class="result-stat"><span class="rs-icon">${s.icon ?? ''}</span><b>${s.value}</b><span>${s.label}</span></div>`).join('')}</div>` : ''}
      ${data.extraHtml ?? ''}
      <div class="result-actions">
        ${(data.actions ?? [])
          .map((a, i) =>
            a.href
              ? `<a class="btn ${a.primary ? 'btn-primary btn-lg' : 'btn-soft btn-lg'}" href="#${a.href}">${a.label}</a>`
              : `<button type="button" class="btn ${a.primary ? 'btn-primary btn-lg' : 'btn-soft btn-lg'}" data-res-action="${i}">${a.label}</button>`,
          )
          .join('')}
      </div>
      ${share ? `<div class="result-share"><button type="button" class="btn btn-soft share-btn">${SHARE_ICON}<span>${t('share.btn')}</span></button></div>` : ''}
      ${data.log?.some((e) => e.helped) ? marksHtml(data.log) : ''}
      ${data.log ? reviewHtml(data.log, { onlyWrong: data.reviewOnlyWrong ?? true }) : ''}
    </section>`;
  app.querySelectorAll('[data-res-action]').forEach((b) => b.addEventListener('click', () => data.actions[Number(b.dataset.resAction)].onClick?.()));
  if (data.log) bindReview(app, data.log);
  if (share) bindShare(app.querySelector('.share-btn'), share);
  animateResults(app, data);
  data.afterRender?.(app);
}

/** Числа «набегают» от нуля, звёзды загораются по одной со звуком, новый рекорд - фанфары. */
export function animateResults(root, data = {}) {
  const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const targets = [...root.querySelectorAll('.result-stat b, .xp-earned')];
  for (const el of targets) {
    const text = el.textContent;
    const m = text.match(/^(\D*)(\d+)(\D*)$/);
    if (!m || reduce) continue;
    const [, pre, num, post] = m;
    const to = Number(num);
    if (to < 2) continue;
    const start = performance.now();
    const dur = Math.min(1200, 400 + to * 8);
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = `${pre}${Math.round(to * eased)}${post}`;
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = `${pre}0${post}`;
    requestAnimationFrame(step);
  }
  const stars = root.querySelectorAll('.stars .star.on');
  stars.forEach((_, i) => setTimeout(() => sfx.star(i), 350 + i * 180));
  if (data.title && String(data.title).includes(t('res.newRecord'))) setTimeout(() => sfx.record(), 300);
  else if (data.xp) setTimeout(() => sfx.coin(), 250);
}

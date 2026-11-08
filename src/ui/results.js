// Экран результатов после любой игры: итог, звёзды, статистика, кнопки и разбор ошибок.

import { t, tx } from '../core/i18n.js';
import { SKILLS } from '../content/skills.js';
import { esc } from './dom.js';
import { mascot } from './mascot.js';
import { bindQuestion, questionHtml } from './question.js';
import { mountSolution } from './solution.js';

export function starsHtml(stars, max = 3) {
  return `<div class="stars" aria-label="${stars}/${max}">${Array.from({ length: max }, (_, i) => `<span class="star ${i < stars ? 'on' : ''}" style="--d:${i * 180}ms">★</span>`).join('')}</div>`;
}

/** Список заданий с разбором; каждое раскрывается по нажатию. */
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
          <summary><span class="review-mark">${e.correct ? '✓' : '✗'}</span><span>#${e.n} · ${esc(tx(SKILLS[e.question.skill].name))}</span><span class="review-open">${t('res.open')}</span></summary>
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

/**
 * build() возвращает данные экрана:
 * { mood, title, subtitle, stars, stats: [{ icon, label, value }], xp, actions: [{ label, href | onClick, primary }], extraHtml, log }
 */
export function renderResults(app, build) {
  const data = build();
  const mascotMood = data.mood === 'win' ? 'win' : data.mood === 'lose' ? 'sad' : 'happy';
  app.innerHTML = `
    <section class="results page">
      <div class="results-hero mood-${data.mood ?? 'neutral'}">
        ${mascot(mascotMood, 'mascot-lg bounce-in')}
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
      ${data.log ? reviewHtml(data.log, { onlyWrong: data.reviewOnlyWrong ?? true }) : ''}
    </section>`;
  app.querySelectorAll('[data-res-action]').forEach((b) => b.addEventListener('click', () => data.actions[Number(b.dataset.resAction)].onClick?.()));
  if (data.log) bindReview(app, data.log);
  data.afterRender?.(app);
}

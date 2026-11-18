// Пробный экзамен целиком: выбор предметов и версии (полная / короткая), разделы по порядку
// со своим таймером, между разделами - экран-переход, в конце - балл по шкале экзамена,
// разбор ошибок и история прошлых попыток.

import { MOCKS, electiveSlots, mockPlan, mockScore, picksComplete } from '../catalog/mocks.js';
import { courseById, courseHref, trackById } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { bindChart, lineChart } from '../ui/chart.js';
import { courseBadge } from './hub.js';
import { celebrate, runSession } from './play.js';

const MAX_HISTORY = 20;
const mockHref = (course) => `/mock/${course.id}`;

/** Как показать итог: «112 / 140», «6.5», «4.3», «78%». */
export function formatScore(res) {
  if (res.unit === 'percent') return `${res.score}%`;
  if (res.unit === 'band') return `${res.score}`;
  return `${res.score}`;
}

export function saveMockResult(examId, entry) {
  const p = getProfile();
  p.mocks = [...(p.mocks ?? []), { exam: examId, date: dayKey(), ...entry }].slice(-MAX_HISTORY);
  p.counters.mocks = (p.counters.mocks ?? 0) + 1;
}

const historyOf = (examId) => (getProfile().mocks ?? []).filter((m) => m.exam === examId);

const fmtDay = (d) => d.split('-').reverse().slice(0, 2).join('.');

/** Точки графика: все попытки по порядку; короткая версия - полая точка. */
export const progressPoints = (examId) =>
  historyOf(examId).map((h) => ({ label: fmtDay(h.date), value: h.score, hollow: h.short, note: h.short ? t('mock.short') : t('mock.full') }));

/**
 * Панель «Твой прогресс»: график и только факты - лучший, последний, изменение с первой попытки.
 * Никаких прогнозов: баллы растут постепенно, и обещать их нельзя.
 */
export function progressPanelHtml(examId) {
  const list = historyOf(examId);
  if (!list.length) return '';
  const last = list.at(-1);
  const best = list.reduce((b, h) => Math.max(b, h.score), -Infinity);
  const sameKind = list.filter((h) => h.short === last.short);
  const diff = sameKind.length > 1 ? Math.round((last.score - sameKind[0].score) * 10) / 10 : null;
  return `<div class="panel mock-progress-panel">
    <h2>📈 ${t('mock.progress')}</h2>
    <div class="mp-facts">
      <div><b>${list.length}</b><span>${t('mock.attempts')}</span></div>
      <div><b>${best}</b><span>${t('mock.bestShort')}</span></div>
      <div><b>${last.score}</b><span>${t('mock.lastShort')}</span></div>
      <div><b class="${diff > 0 ? 'is-up' : diff < 0 ? 'is-down' : ''}">${diff === null ? '-' : `${diff > 0 ? '+' : ''}${diff}`}</b><span>${t('mock.sinceFirst')}</span></div>
    </div>
    ${list.length >= 2 ? lineChart(progressPoints(examId), { max: last.max, ariaLabel: t('mock.progress') }) : `<p class="muted small">${t('mock.oneMore')}</p>`}
    <p class="muted tiny">${list.some((h) => h.short) ? `◯ ${t('mock.hollow')} · ` : ''}${t('mock.slow')}</p>
  </div>`;
}

export function mockRoute(app, { exam: examId }) {
  const course = courseById(examId);
  const mock = MOCKS[examId];
  if (!course || !mock) {
    navigate(course ? courseHref(course) : '/exams');
    return null;
  }
  const saved = storage.get(`mockPicks:${examId}`, null);
  let picks = Array.isArray(saved) ? saved : (mock.electives ?? []).map(() => []);
  let short = storage.get('mockShort', false) === true;
  let session = null;

  const trackName = (id) => tx(trackById(course, id)?.name ?? { en: id, ru: id, kk: id });
  const trackIcon = (id) => trackById(course, id)?.icon ?? '📘';

  // ---------- Подготовка ----------
  const renderSetup = () => {
    const plan = mockPlan(examId, picks, short);
    const ready = picksComplete(examId, picks);
    const totalQ = plan.reduce((s, x) => s + x.count, 0);
    const totalMin = plan.reduce((s, x) => s + x.minutes, 0);
    const history = historyOf(examId).slice(-5).reverse();
    const best = historyOf(examId).filter((h) => !h.short).reduce((b, h) => (b === null || h.score > b.score ? h : b), null);
    app.innerHTML = `
      <section class="page mock-page" style="--c:${course.color}">
        <a class="crumb" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="mock-hero">
          <div class="mock-hero-text">
            <p class="hero-kicker">${courseBadge(course)} ${esc(tx(course.full))}</p>
            <h1>🏁 ${t('mock.title')}</h1>
            <p class="muted">${t('mock.desc')}</p>
            ${best ? `<p class="mock-best">🏆 ${t('mock.best', { s: formatScore(best), m: best.max })}</p>` : ''}
          </div>
          ${mascot('think', 'mascot-lg float')}
        </div>

        <div class="mock-grid">
          <div class="panel mock-format">
            <h2>${t('mock.format')}</h2>
            ${(mock.electives ?? [])
              .map(
                (g, gi) => `<div class="mock-pick">
                  <p class="mock-pick-title">${t('mock.choose', { n: g.choose })} <span class="muted small">${(picks[gi] ?? []).length}/${g.choose}</span></p>
                  <div class="mock-chips">${g.from
                    .map((id) => {
                      const on = (picks[gi] ?? []).includes(id);
                      return `<button type="button" class="mock-chip ${on ? 'is-on' : ''}" data-group="${gi}" data-track="${id}" aria-pressed="${on}">${trackIcon(id)} ${esc(trackName(id))}</button>`;
                    })
                    .join('')}</div>
                </div>`,
              )
              .join('')}
            <ol class="mock-sections">
              ${plan
                .map(
                  (s, i) => `<li style="--i:${i}"><span class="ms-num">${i + 1}</span><span class="ms-name">${trackIcon(s.track)} ${esc(trackName(s.track))}</span><span class="ms-meta">${t('mock.q', { n: s.count })} · ${t('mock.min', { n: s.minutes })}${s.points && mock.scale === 'sum' ? ` · ${t('mock.pts', { n: s.points })}` : ''}</span></li>`,
                )
                .join('')}
              ${electiveSlots(mock).some((n, gi) => (picks[gi] ?? []).length < n) ? `<li class="ms-empty"><span class="ms-num">?</span><span class="ms-name muted">${t('mock.pickMore')}</span></li>` : ''}
            </ol>
            <p class="muted small">${t(`mock.note.${examId}`)}</p>
          </div>

          <div class="panel mock-start">
            <div class="mock-length" role="group">
              <button type="button" class="ml-btn ${short ? '' : 'is-on'}" data-short="0"><b>${t('mock.full')}</b><small>${t('mock.fullDesc')}</small></button>
              <button type="button" class="ml-btn ${short ? 'is-on' : ''}" data-short="1"><b>${t('mock.short')}</b><small>${t('mock.shortDesc')}</small></button>
            </div>
            <div class="mock-totals">
              <div><b>${plan.length}</b><span>${t('mock.sections')}</span></div>
              <div><b>${totalQ}</b><span>${t('mock.questions')}</span></div>
              <div><b>${Math.floor(totalMin / 60) ? `${Math.floor(totalMin / 60)}:${String(totalMin % 60).padStart(2, '0')}` : totalMin}</b><span>${Math.floor(totalMin / 60) ? t('mock.hours') : t('mock.minutes')}</span></div>
            </div>
            <button type="button" class="btn btn-primary btn-lg mock-go" ${ready ? '' : 'disabled'}>▶ ${t('mock.start')}</button>
            ${ready ? '' : `<p class="muted small">${t('mock.pickFirst')}</p>`}
            <ul class="mock-rules">
              <li>⏱ ${t('mock.rule1')}</li>
              <li>🤫 ${t('mock.rule2')}</li>
              <li>📋 ${t('mock.rule3')}</li>
            </ul>
            ${
              history.length
                ? `<div class="mock-history"><h3>${t('mock.history')}</h3>${history
                    .map((h) => `<div class="mh-row"><span>${h.date.split('-').reverse().join('.')}</span><span class="muted small">${h.short ? t('mock.short') : t('mock.full')}</span><b>${formatScore(h)}<small>/${h.max}</small></b></div>`)
                    .join('')}</div>`
                : ''
            }
          </div>
        </div>
        ${progressPanelHtml(examId)}
      </section>`;
    bindChart(app, progressPoints(examId));

    app.querySelectorAll('[data-track]').forEach((b) =>
      b.addEventListener('click', () => {
        const gi = Number(b.dataset.group);
        const g = mock.electives[gi];
        const list = picks[gi] ?? [];
        const id = b.dataset.track;
        if (list.includes(id)) picks[gi] = list.filter((x) => x !== id);
        else picks[gi] = g.choose === 1 ? [id] : list.length < g.choose ? [...list, id] : [...list.slice(1), id];
        storage.set(`mockPicks:${examId}`, picks);
        sfx.tap();
        renderSetup();
      }),
    );
    app.querySelectorAll('[data-short]').forEach((b) =>
      b.addEventListener('click', () => {
        short = b.dataset.short === '1';
        storage.set('mockShort', short);
        sfx.tap();
        renderSetup();
      }),
    );
    app.querySelector('.mock-go')?.addEventListener('click', () => {
      sfx.select();
      startMock();
    });
  };

  // ---------- Сам экзамен ----------
  function startMock() {
    const plan = mockPlan(examId, picks, short);
    const results = [];
    const logs = [];
    const started = Date.now();

    const runSection = (i) => {
      const s = plan[i];
      const track = trackById(course, s.track);
      session?.cleanup?.();
      session = runSession(app, {
        title: () => `🏁 ${tx(course.name)} · ${i + 1}/${plan.length} · ${tx(track.name)}`,
        questions: buildTopicSet({ rng: createRng(newSeed()), spec: track.spec, count: s.count }),
        timeLimit: s.minutes * 60,
        silent: true,
        catalog: true,
        exitTo: mockHref(course),
        onFinish: (run, { reason }) => {
          results.push({ track: s.track, correct: run.correct, count: s.count, points: s.points });
          logs.push(...run.log);
          const last = i === plan.length - 1;
          if (!last) {
            const next = plan[i + 1];
            const nextTrack = trackById(course, next.track);
            return () => ({
              mood: 'neutral',
              title: reason === 'time' ? t('mock.sectionTime', { n: i + 1 }) : t('mock.sectionDone', { n: i + 1 }),
              subtitle: t('mock.answersLater'),
              extraHtml: progressHtml(plan, i + 1) + `<div class="mock-next"><span>${t('mock.next')}</span><b>${nextTrack.icon} ${esc(tx(nextTrack.name))}</b><small>${t('mock.q', { n: next.count })} · ${t('mock.min', { n: next.minutes })}</small></div>`,
              actions: [{ label: `▶ ${t('mock.nextGo')}`, onClick: () => runSection(i + 1), primary: true }],
            });
          }
          return finishMock(results, logs, started);
        },
      });
    };
    runSection(0);
  }

  const progressHtml = (plan, done) =>
    `<div class="mock-progress">${plan
      .map((s, i) => `<span class="mp-step ${i < done ? 'is-done' : i === done ? 'is-next' : ''}" title="${esc(trackName(s.track))}">${i < done ? '✓' : trackIcon(s.track)}</span>`)
      .join('<i></i>')}</div>`;

  function finishMock(results, logs, started) {
    const res = mockScore(examId, results);
    const prevBest = historyOf(examId).filter((h) => h.short === short).reduce((b, h) => Math.max(b, h.score), -1);
    const correct = results.reduce((s, r) => s + r.correct, 0);
    const count = results.reduce((s, r) => s + r.count, 0);
    const minutes = Math.round((Date.now() - started) / 60000);
    saveMockResult(examId, { short, score: res.score, max: res.max, unit: res.unit, sections: results.map((r) => ({ track: r.track, c: r.correct, n: r.count })) });
    saveProfile();
    const good = res.score / res.max >= 0.6;
    const record = prevBest >= 0 && res.score > prevBest;
    celebrate(good);
    return () => ({
      mood: good ? 'win' : 'neutral',
      title: t('mock.done'),
      subtitle: `${tx(course.name)} · ${short ? t('mock.short') : t('mock.full')}`,
      record,
      stats: [
        { icon: '✅', label: t('mock.correct'), value: `${correct}/${count}` },
        { icon: '⏱', label: t('mock.spent'), value: t('mock.min', { n: minutes }) },
      ],
      extraHtml: `
        <div class="mock-score" style="--p:${Math.round((res.score / res.max) * 100)}">
          <div class="ms-ring"><b>${formatScore(res)}</b><small>${t(`mock.unit.${res.unit}`, { m: res.max })}</small></div>
          ${record ? `<p class="ms-record">🎉 ${t('mock.record')}</p>` : prevBest >= 0 ? `<p class="muted">${t('mock.prev', { s: prevBest })}</p>` : ''}
          <p class="muted tiny">${t('mock.estimate')}</p>
        </div>
        <div class="panel mock-breakdown">
          <h2>${t('mock.bySection')}</h2>
          ${res.sections
            .map(
              (s) => `<div class="mb-row"><span class="mb-name">${trackIcon(s.track)} ${esc(trackName(s.track))}</span><span class="bar"><i style="width:${Math.round(s.pct * 100)}%"></i></span><b>${s.value}<small>/${s.max}</small></b></div>`,
            )
            .join('')}
        </div>`,
      log: logs,
      actions: [
        { label: `↻ ${t('mock.again')}`, href: mockHref(course), primary: true },
        { label: `← ${esc(tx(course.name))}`, href: courseHref(course) },
      ],
    });
  }

  renderSetup();
  return {
    relabel: () => (session ? session.relabel?.() : renderSetup()),
    cleanup: () => session?.cleanup?.(),
  };
}

/** Карточка «Пробный экзамен целиком» на странице экзамена. */
export function mockCardHtml(course) {
  if (!MOCKS[course.id]) return '';
  const last = historyOf(course.id).at(-1);
  return `<a class="mock-card" href="#${mockHref(course)}" style="--c:${course.color}">
    <span class="mock-card-icon" aria-hidden="true">🏁</span>
    <span class="mock-card-text"><b>${t('mock.title')}</b><small>${last ? t('mock.last', { s: formatScore(last), m: last.max }) : t('mock.cardDesc')}</small></span>
    <span class="daily-go">→</span>
  </a>`;
}

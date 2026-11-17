// Инструменты курса: диагностика на старте, карта знаний и тренировка «под мой уровень» (адаптивная сложность).

import { courseById, courseHref, levelLabel, trackById, trackHref } from '../catalog/index.js';
import { AdaptiveStream, TIER_ICONS, TIERS } from '../core/adaptive.js';
import { DIAG_PER_LEVEL, DIAG_PER_TRACK, diagDefaultTracks, diagLevels, diagQuestions, diagResult, lastDiag, saveDiag } from '../core/diagnostic.js';
import { t, tx } from '../core/i18n.js';
import { STATES, STATE_ICONS, courseMap, mapSummary, tierForState } from '../core/mastery.js';
import { avgSeconds, paceFor } from '../core/pace.js';
import { getPlan } from '../core/plan.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { skillName } from '../content/labels.js';
import { explainerFor } from '../content/explainers.js';
import { TOPICS } from '../pools/topics.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal } from '../ui/overlay.js';
import { courseBadge, ring } from './hub.js';
import { baseStats, celebrate, runSession } from './play.js';

export const ADAPT_COUNT = 15;
export const TOPIC_COUNT = 8;

const tierName = (tier) => t(`adapt.tier${tier}`);
const tierBadge = (stream) => `<span class="tier-dots" title="${t('adapt.level')}: ${tierName(stream.tier)}">${TIER_ICONS[stream.tier]}<i>${Array.from({ length: TIERS }, (_, i) => `<b class="${i <= stream.tier ? 'on' : ''}"></b>`).join('')}</i></span>`;

/** Тренировка с адаптивной сложностью. spec — темы, tier — с какого уровня начать. */
export function runAdaptive(app, { title, spec, tier = 2, count = ADAPT_COUNT, exitTo, back }) {
  const stream = new AdaptiveStream({ rng: createRng(newSeed()), spec, tier });
  const startTier = stream.tier;
  return runSession(app, {
    title,
    stream,
    limit: count,
    catalog: true,
    exitTo,
    badge: () => tierBadge(stream),
    onAnswer: (_q, correct) => stream.feedback(correct),
    onFinish: (run) => {
      const p = getProfile();
      p.counters.adaptive = (p.counters.adaptive ?? 0) + 1;
      p.counters.adaptPeak = Math.max(p.counters.adaptPeak ?? 0, stream.peak);
      saveProfile();
      const good = run.correct >= Math.ceil(run.answered * 0.7);
      celebrate(good);
      return () => ({
        mood: good ? 'win' : 'neutral',
        title: t('adapt.done'),
        subtitle: t('pr.result', { c: run.correct, n: run.answered }),
        xp: run.xp,
        stats: [
          ...baseStats(run),
          { icon: TIER_ICONS[stream.tier], label: t('adapt.reached'), value: tierName(stream.tier) },
        ],
        extraHtml: tierTrailHtml(startTier, stream.history),
        log: run.log,
        actions: [
          { label: `↻ ${t('pr.again')}`, onClick: () => navigate(exitTo), primary: true },
          ...(back ? [back] : []),
        ],
      });
    },
  });
}

/** Лесенка уровней за тренировку: как менялась сложность. */
function tierTrailHtml(start, history) {
  const all = [start, ...history];
  const w = 100 / Math.max(1, all.length - 1);
  const pts = all.map((v, i) => `${(i * w).toFixed(2)},${(100 - (v / (TIERS - 1)) * 80 - 10).toFixed(2)}`).join(' ');
  return `<div class="panel tier-trail"><h3>${t('adapt.trail')}</h3>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" vector-effect="non-scaling-stroke"/></svg>
    <div class="tier-trail-legend"><span>${TIER_ICONS[0]} ${tierName(0)}</span><span>${TIER_ICONS[TIERS - 1]} ${tierName(TIERS - 1)}</span></div></div>`;
}

/** Карточки инструментов на странице курса. */
export function courseToolsHtml(course) {
  if (!course.tracks.length) return '';
  const diag = lastDiag(course);
  const sum = mapSummary(courseMap(course));
  return `<div class="course-tools" style="--c:${course.color}">
    <a class="tool-card tool-diag" href="#/diag/${course.id}">
      <span class="tool-icon" aria-hidden="true">🩺</span>
      <span class="tool-text"><b>${t('diag.title')}</b><small>${diag ? t('diag.last', { pct: diag.pct, date: diag.date.split('-').reverse().join('.') }) : t('diag.short')}</small></span>
    </a>
    <a class="tool-card tool-map" href="#/know/${course.id}">
      <span class="tool-icon" aria-hidden="true">🗺️</span>
      <span class="tool-text"><b>${t('know.title')}</b><small>${t('know.short', { m: sum.mastered, n: sum.total })}</small></span>
      <span class="tool-mini" aria-hidden="true">${STATES.map((s) => `<i class="st-${s}" style="flex:${sum.counts[s]}"></i>`).join('')}</span>
    </a>
    <a class="tool-card tool-adapt" href="#/adapt/${course.id}">
      <span class="tool-icon" aria-hidden="true">🎯</span>
      <span class="tool-text"><b>${t('adapt.title')}</b><small>${t('adapt.short', { n: ADAPT_COUNT })}</small></span>
    </a>
  </div>`;
}

// ---------- Диагностика ----------

export function diagRoute(app, { course: id }) {
  const course = courseById(id);
  if (!course?.tracks.length) {
    navigate(course ? courseHref(course) : '/');
    return null;
  }
  let session = null;
  let picked = new Set(diagDefaultTracks(course));

  function start() {
    const questions = diagQuestions(course, [...picked], createRng(newSeed()));
    session = runSession(app, {
      title: () => `🩺 ${t('diag.title')} · ${tx(course.name)}`,
      questions,
      silent: true,
      hints: false,
      pace: false,
      catalog: true,
      exitTo: `/diag/${course.id}`,
      onFinish: (run) => {
        const result = diagResult(course, run.log);
        saveDiag(course, result);
        saveProfile();
        celebrate(result.pct >= 50);
        return () => ({
          mood: result.pct >= 70 ? 'win' : result.pct >= 40 ? 'happy' : 'think',
          title: t('diag.doneTitle'),
          subtitle: t('diag.doneSub', { c: result.c, n: result.n }),
          xp: run.xp,
          stats: baseStats(run).slice(0, 2),
          extraHtml: diagReportHtml(course, result),
          log: run.log,
          actions: diagActions(course, result),
        });
      },
    });
  }

  const render = () => {
    const diag = lastDiag(course);
    const count = course.leveled ? diagLevels(course).length * DIAG_PER_LEVEL : picked.size * DIAG_PER_TRACK;
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card wide diag-setup" style="--c:${course.color}">
          <div class="diag-hero">${mascot('think', 'mascot-lg float')}<span class="diag-steth" aria-hidden="true">🩺</span></div>
          <p class="track-kicker">${esc(tx(course.name))}</p>
          <h1>${t('diag.title')}</h1>
          <p class="muted">${course.leveled ? t('diag.descLevels') : t('diag.desc')}</p>
          <ul class="diag-facts">
            <li>📝 ${t('diag.count', { n: count })}</li>
            <li>🤫 ${t('diag.silent')}</li>
            <li>📊 ${t('diag.honest')}</li>
          </ul>
          ${
            course.leveled
              ? ''
              : `<h2 class="section-title">${t('diag.pick')}</h2>
                 <div class="diag-picks">${course.tracks
                   .map((tr) => `<button type="button" class="diag-pick" data-track="${tr.id}" aria-pressed="${picked.has(tr.id)}"><span>${esc(tr.icon)}</span>${esc(tx(tr.name))}</button>`)
                   .join('')}</div>`
          }
          ${diag ? `<p class="diag-last">${t('diag.last', { pct: diag.pct, date: diag.date.split('-').reverse().join('.') })}</p>` : ''}
          <button type="button" class="btn btn-primary btn-xl diag-start" ${count ? '' : 'disabled'}>▶ ${t('diag.start')}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-track]').forEach((b) =>
      b.addEventListener('click', () => {
        const tid = b.dataset.track;
        if (picked.has(tid)) picked.delete(tid);
        else picked.add(tid);
        render();
      }),
    );
    app.querySelector('.diag-start').addEventListener('click', start);
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

function diagReportHtml(course, result) {
  const rows = result.tracks
    .map((x) => {
      const tr = trackById(course, x.id);
      const tone = x.pct >= 75 ? 'good' : x.pct >= 50 ? 'mid' : 'low';
      const name = course.leveled ? `${levelLabel(course, tr)} · ${tx(tr.name)}` : tx(tr.name);
      return `<div class="diag-row tone-${tone}"><span class="diag-row-name">${esc(tr.icon)} ${esc(name)}</span><span class="bar"><i style="width:${x.pct}%"></i></span><b>${x.c}/${x.n}</b></div>`;
    })
    .join('');
  const weak = result.topics.filter((x) => x.pct < 50).slice(0, 6);
  const strong = result.topics.filter((x) => x.pct === 100 && x.n >= 1).slice(0, 6);
  const rec = trackById(course, result.level);
  return `<div class="panel diag-report">
    <h3>${t('diag.bySubject')}</h3>
    <div class="diag-rows">${rows}</div>
    ${rec ? `<div class="diag-rec"><span>🧭</span><div><b>${t(course.leveled ? 'diag.recLevel' : 'diag.recSubject')}</b><p>${esc(rec.icon)} ${esc(course.leveled ? `${levelLabel(course, rec)} · ${tx(rec.name)}` : tx(rec.name))}</p></div></div>` : ''}
    ${weak.length ? `<h3>${t('diag.weak')}</h3><div class="topic-chips">${weak.map((x) => `<span class="topic-chip is-weak">${esc(tx(skillName(x.topic)))}</span>`).join('')}</div>` : ''}
    ${strong.length ? `<h3>${t('diag.strong')}</h3><div class="topic-chips">${strong.map((x) => `<span class="topic-chip is-strong">${esc(tx(skillName(x.topic)))}</span>`).join('')}</div>` : ''}
    <p class="muted small">${t('diag.note')}</p>
  </div>`;
}

function diagActions(course, result) {
  const rec = trackById(course, result.level);
  const plan = getPlan();
  return [
    ...(rec ? [{ label: `▶ ${t('diag.startHere')}`, href: trackHref(course, rec), primary: true }] : []),
    { label: `🗺️ ${t('know.title')}`, href: `/know/${course.id}` },
    ...(course.group === 'exams' && plan?.course !== course.id ? [{ label: `🗓️ ${t('diag.makePlan')}`, href: '/plan' }] : []),
  ];
}

// ---------- Карта знаний ----------

export function knowRoute(app, { course: id }) {
  const course = courseById(id);
  if (!course?.tracks.length) {
    navigate(course ? courseHref(course) : '/');
    return null;
  }
  let session = null;

  function practiceTopic(item) {
    const name = tx(skillName(item.topic));
    session = runAdaptive(app, {
      title: () => `🗺️ ${name}`,
      spec: [[item.topic, item.keys]],
      tier: tierForState(item.state),
      count: TOPIC_COUNT,
      exitTo: `/know/${course.id}`,
      back: { label: `🗺️ ${t('know.back')}`, href: `/know/${course.id}` },
    });
  }

  function openTopic(item) {
    const name = tx(skillName(item.topic));
    const avg = avgSeconds(item.topic);
    const ex = explainerFor(item.topic);
    const target = paceFor({ skill: item.topic, section: TOPICS[item.topic]?.pool === 'math' ? 'math' : 'rw', local: true });
    openModal({
      title: `${STATE_ICONS[item.state]} ${esc(name)}`,
      body: `<div class="topic-info">
        <p class="topic-state st-${item.state}">${t(`know.st.${item.state}`)}</p>
        <div class="topic-stats">
          <div><b>${item.a}</b><span>${t('know.answers')}</span></div>
          <div><b>${item.pct === null ? '—' : `${item.pct}%`}</b><span>${t('know.accuracy')}</span></div>
          <div><b>${avg === null ? '—' : `${avg} ${t('pace.s')}`}</b><span>${t('know.speed', { n: target })}</span></div>
        </div>
        <p class="muted small">${t(`know.tip.${item.state}`)}</p>
      </div>`,
      actions: [
        { label: `▶ ${t('know.train', { n: TOPIC_COUNT })}`, primary: true, onClick: () => practiceTopic(item) },
        ...(ex ? [{ label: `🎬 ${t('explain.watch')}`, onClick: () => navigate(`/explain/${ex}`) }] : []),
      ],
    });
  }

  const render = () => {
    const groups = courseMap(course);
    const sum = mapSummary(groups);
    let i = 0;
    app.innerHTML = `
      <section class="page know-page" style="--c:${course.color}">
        <a class="crumb" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="know-hero">
          <div class="plan-big-ring">${ring(sum.pct, 100)}<div><b>${sum.pct}%</b><small>${t('know.mastered')}</small></div></div>
          <div>
            <p class="hero-kicker">${courseBadge(course)} ${esc(tx(course.name))}</p>
            <h1>${t('know.title')}</h1>
            <p class="muted">${t('know.desc')}</p>
            <div class="know-legend">${STATES.map((s) => `<span class="st-${s}"><i></i>${t(`know.st.${s}`)} · <b>${sum.counts[s]}</b></span>`).join('')}</div>
          </div>
        </div>
        ${groups
          .map(
            (g) => `<div class="know-group">
              <h2 class="section-title">${esc(g.track.icon)} ${esc(course.leveled ? `${levelLabel(course, g.track)} · ${tx(g.track.name)}` : tx(g.track.name))}</h2>
              <div class="know-grid">${g.topics
                .map(
                  (x) => `<button type="button" class="know-cell st-${x.state}" data-topic="${x.topic}" style="--i:${i++}">
                    <span class="kc-name">${esc(tx(skillName(x.topic)))}</span>
                    <span class="kc-meta">${x.pct === null ? t('know.notYet') : `${x.pct}% · ${x.a}`}${explainerFor(x.topic) ? ' · 🎬' : ''}</span>
                    <span class="kc-bar"><i style="width:${x.pct ?? 0}%"></i></span>
                  </button>`,
                )
                .join('')}</div>
            </div>`,
          )
          .join('')}
      </section>`;
    const items = new Map(groups.flatMap((g) => g.topics.map((x) => [x.topic, x])));
    app.querySelectorAll('[data-topic]').forEach((b) => b.addEventListener('click', () => openTopic(items.get(b.dataset.topic))));
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

// ---------- Под мой уровень (весь курс) ----------

export function adaptRoute(app, { course: id }) {
  const course = courseById(id);
  if (!course?.tracks.length) {
    navigate(course ? courseHref(course) : '/');
    return null;
  }
  let session = null;
  const diag = lastDiag(course);

  function start(trackId) {
    const tracks = trackId === 'all' ? course.tracks : [trackById(course, trackId)];
    const spec = tracks.flatMap((tr) => tr.spec);
    const p = getProfile();
    // Стартовый уровень — по средней точности в выбранных темах.
    const stats = spec.map(([topic]) => p.skills[topic]).filter((s) => s?.a);
    const acc = stats.length ? stats.reduce((s, x) => s + x.c / x.a, 0) / stats.length : 0.5;
    const tier = Math.max(0, Math.min(TIERS - 1, Math.round(acc * (TIERS - 1)) - (stats.length ? 0 : 1)));
    session = runAdaptive(app, {
      title: () => `🎯 ${t('adapt.title')} · ${tx(course.name)}`,
      spec,
      tier,
      exitTo: `/adapt/${course.id}`,
      back: { label: `← ${esc(tx(course.name))}`, href: courseHref(course) },
    });
  }

  const render = () => {
    const suggested = course.leveled ? (diag?.level ?? getProfile().last?.track) : null;
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card wide" style="--c:${course.color}">
          <div class="setup-icon">🎯</div>
          <p class="track-kicker">${esc(tx(course.name))}</p>
          <h1>${t('adapt.title')}</h1>
          <p class="muted">${t('adapt.desc', { n: ADAPT_COUNT })}</p>
          <div class="adapt-ladder" aria-hidden="true">${Array.from({ length: TIERS }, (_, i) => `<span style="--i:${i}">${TIER_ICONS[i]}<small>${tierName(i)}</small></span>`).join('')}</div>
          <h2 class="section-title">${t('adapt.pick')}</h2>
          <div class="adapt-picks">
            ${course.leveled ? '' : `<button type="button" class="option-card" data-start="all"><b>🌐 ${t('adapt.all')}</b><span>${t('adapt.allDesc', { n: course.tracks.length })}</span></button>`}
            ${course.tracks
              .map((tr) => {
                const star = tr.id === suggested;
                return `<button type="button" class="option-card ${star ? 'is-suggested' : ''}" data-start="${tr.id}"><b>${esc(tr.icon)} ${esc(course.leveled ? `${levelLabel(course, tr)} · ${tx(tr.name)}` : tx(tr.name))}</b>${star ? `<span>⭐ ${t('adapt.suggested')}</span>` : `<span>${esc(tx(tr.desc))}</span>`}</button>`;
              })
              .join('')}
          </div>
        </div>
      </section>`;
    app.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => start(b.dataset.start)));
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

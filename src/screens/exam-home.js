// Страница экзамена (кроме SAT) по образцу SAT: верх с целью дня, «Продолжить» по каждому предмету,
// 8 режимов игры внутри экзамена, прогноз балла. Режимы берут задания только из предметов этого экзамена.
//
//   #/c/:exam              - страница экзамена
//   #/x/:exam/path         - «Путь к …»: острова = предметы, на каждом 4 уровня и босс
//   #/x/:exam/lv/:track/:n - уровень пути (n = 1…4 или boss)
//   #/x/:exam/survival | blitz | duel | daily | theory

import { courseById, courseHref, trackById, trackHref, trackRecord } from '../catalog/index.js';
import { bossFor } from '../catalog/bosses.js';
import { hasMock } from '../catalog/mocks.js';
import { DUEL_LENGTH, duelOutcome, encodeDuel } from '../core/duel-code.js';
import { dayKey, msUntilMidnight } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { DAILY_GOAL, addXp, getProfile, levelInfo, saveProfile, todayXp } from '../core/profile.js';
import { createRng, hashString, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { storage } from '../core/storage.js';
import { UsedSet } from '../core/seen.js';
import { starsFor } from '../engine/session.js';
import { TopicStream, buildTopicSet } from '../pools/stream.js';
import { esc, formatTime } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { toast } from '../ui/overlay.js';
import { courseBadge } from './hub.js';
import { trackTopics } from './catalog.js';
import { courseToolsHtml } from './learn.js';
import { fullReadCardHtml } from './fullread.js';
import { cardsCardHtml } from './cards.js';
import { lessonTopics, runLesson } from './lesson.js';
import { baseStats, celebrate, runSession } from './play.js';
import { BOSS_QUESTIONS, saveBossResult } from './practice.js';

/** Цель «Пути к …» по шкале экзамена. */
const PATH_GOAL = { cambridge: 'C2', duolingo: '160', pte: '90', toeic: '990', act: '36', psat: '1520', ap: '5', gre: '340', gmat: '805', dele: 'C2', delf: 'C2', ib: '45', alevel: 'A*', gcse: '9', jee: '300', neet: '720', gaokao: '750', csat: '1', yks: '560', nis: '100%', bil: '100%', ielts: '9.0', toefl: '120', hsk: 'HSK 6', ent: '140', ege: '100', oge: '«5»', ct: '100', dtm: '189', ort: '245', tj: '100', dim: '700', arm: '20', bac: '10' };
const LEVELS = 4;
const LEVEL_Q = 8;
const DAILY_N = 5;
const DAILY_XP = 30;
const BLITZ_S = 90;
const SHOWN = 6;

const examHref = (course) => courseHref(course);
const xHref = (course, rest) => `/x/${course.id}/${rest}`;
const hasEnglish = (course) => course.tracks.some((tr) => tr.id === 'english' || tr.id === 'grammar');

// ---------- Задания по уровням сложности ----------

/** Ступень ключа внутри темы: 1 - лёгкие, 2 - средние, 3 - сложные (по месту среди ключей темы). */
function tieredSpec(tracks, allowed) {
  const spec = [];
  for (const tr of tracks)
    for (const [topic, keys] of tr.spec) {
      const sorted = [...keys].sort((a, b) => a - b);
      const pick = sorted.length === 1 ? sorted : sorted.filter((_, i) => allowed.includes(1 + Math.floor((i * 3) / sorted.length)));
      if (pick.length) spec.push([topic, pick]);
    }
  return spec.length ? spec : tracks.flatMap((tr) => tr.spec);
}

const LEVEL_TIERS = { 1: [1], 2: [1, 2], 3: [2, 3], 4: [1, 2, 3] };

/** Поток с растущей сложностью: next(d) берёт задания ступени не выше d. */
class ExamStream {
  constructor({ rng, tracks, quick = false, memory = true }) {
    const used = new UsedSet({ memory });
    this.streams = [1, 2, 3].map((d) => {
      const s = new TopicStream({ rng, spec: tieredSpec(tracks, [1, 2, 3].filter((x) => x <= d)), quick, memory });
      s.used = used;
      return s;
    });
  }
  next(d = 2) {
    return this.streams[Math.max(1, Math.min(3, d)) - 1].next();
  }
}

// ---------- Прогресс пути ----------

function pathStore(course) {
  const p = getProfile();
  p.examPath ??= {};
  p.examPath[course.id] ??= {};
  return p.examPath[course.id];
}
const levelStars = (course, track, n) => getProfile().examPath?.[course.id]?.[track.id]?.[n] ?? 0;
const levelOpen = (course, track, n) => n === 1 || levelStars(course, track, n - 1) >= 1;
const bossOpen = (course, track) => levelStars(course, track, LEVELS) >= 1;
const bossBeaten = (course, track) => Boolean(trackRecord(course, track)?.boss);

/** Следующий шаг пути по предмету: { n | boss, done }. */
function nextOnIsland(course, track) {
  for (let n = 1; n <= LEVELS; n++) if (!levelStars(course, track, n)) return { n };
  if (!bossBeaten(course, track)) return { boss: true };
  return { done: true };
}
const islandStars = (course, track) => Array.from({ length: LEVELS }, (_, i) => levelStars(course, track, i + 1)).reduce((a, b) => a + b, 0);

/** Предметы: сначала тот, где занимались последним, остальные - по порядку экзамена. */
function orderedTracks(course) {
  const last = storage.get(`xLast:${course.id}`, null);
  const list = [...course.tracks];
  const i = list.findIndex((tr) => tr.id === last);
  if (i > 0) list.unshift(...list.splice(i, 1));
  return list;
}

// ---------- Страница экзамена ----------

function ring(value, max) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, value / max);
  return `<svg class="ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="${r}" class="ring-bg"/><circle cx="40" cy="40" r="${r}" class="ring-fg ${ratio >= 1 ? 'full' : ''}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}"/></svg>`;
}

function sectionTile(course, track) {
  const step = nextOnIsland(course, track);
  const href = step.done ? xHref(course, 'path') : xHref(course, `lv/${track.id}/${step.boss ? 'boss' : step.n}`);
  const text = step.done ? `✓ ${t('xm.islandDone')}` : step.boss ? `${bossFor(course, track).icon} ${t('xm.boss')}` : t('map.level', { n: step.n });
  return `<a class="continue-card xm-sec" href="#${href}" title="${t('xm.continue')}: ${esc(tx(track.name))}"><span class="cc-icon">${esc(track.icon)}</span><span class="cc-text"><small>${esc(tx(track.name))}</small><b>${text} <span class="xm-stars">★ ${islandStars(course, track)}/${LEVELS * 3}</span></b></span><span class="cc-go">▶</span></a>`;
}

function modes(course) {
  const rec = getProfile().examRecords?.[course.id] ?? {};
  return [
    { href: xHref(course, 'path'), icon: '🗺️', title: t('xm.path', { goal: PATH_GOAL[course.id] ?? '100' }), desc: t('xm.pathDesc', { n: course.tracks.length }), color: '#7c5cff' },
    hasMock(course.id) && { href: `/mock/${course.id}`, icon: '📝', title: t('mode.exam.title'), desc: t('xm.mockDesc', { name: tx(course.name) }), color: '#0ea5e9' },
    { href: xHref(course, 'duel'), icon: '🤺', title: t('mode.duel.title'), desc: t('mode.duel.desc'), color: '#f43f5e' },
    { href: xHref(course, 'survival'), icon: '🛡️', title: t('mode.survival.title'), desc: t('mode.survival.desc'), color: '#22c55e', rec: rec.survival },
    { href: xHref(course, 'blitz'), icon: '⚡', title: t('mode.blitz.title'), desc: t('mode.blitz.desc'), color: '#f59e0b', rec: rec.blitz },
    hasEnglish(course)
      ? { href: '/detective', icon: '🕵️', title: t('mode.det.title'), desc: t('xm.detDesc'), color: '#8b5cf6' }
      : { href: xHref(course, 'theory'), icon: '📖', title: t('lesson.theory'), desc: t('xm.theoryDesc'), color: '#8b5cf6' },
    { href: `/weak/${course.id}`, icon: '🎯', title: t('mode.weak.title'), desc: t('mode.weak.desc'), color: '#ec4899' },
    { href: xHref(course, 'daily'), icon: '☀️', title: t('mode.daily.title'), desc: t('mode.daily.desc'), color: '#fb923c', rec: getProfile().examDaily?.[course.id]?.[dayKey()] ? '✓' : null },
  ].filter(Boolean);
}

export function examHomeScreen(app, course) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const xpToday = todayXp();
    const tracks = orderedTracks(course);
    const extra = tracks.length - SHOWN;
    const open = storage.get('xmAllSecs', false) === true;
    const mocks = (p.mocks ?? []).filter((m) => m.exam === course.id);
    const last = mocks.at(-1);
    app.innerHTML = `
      <section class="page home exam-home" style="--c:${course.color}">
        <a class="crumb" href="#/exams">← ${t('nav.exams')}</a>
        <div class="hero-card">
          <div class="hero-mascot">${mascot(xpToday >= DAILY_GOAL ? 'win' : 'happy', 'mascot-xl float')}</div>
          <div class="hero-text">
            <p class="hero-kicker">${courseBadge(course)} ${esc(tx(course.name))}</p>
            <h1>${t('xm.title', { name: esc(tx(course.name)) })}</h1>
            <p class="muted">${esc(tx(course.full))}</p>
            <div class="hero-badges">
              <span class="badge lvl-xp-badge">⭐ <b>${t('home.level', { n: lvl.level })}</b> <span class="lx-num">${p.xp}/${p.xp - lvl.into + lvl.need} XP</span><span class="goal-bar"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></span></span>
            </div>
          </div>
          <div class="goal">
            ${ring(xpToday, DAILY_GOAL)}
            <div class="goal-text"><b>${Math.min(xpToday, DAILY_GOAL)}/${DAILY_GOAL}</b><span>${xpToday >= DAILY_GOAL ? t('home.goalDone') : t('home.goal')}</span></div>
          </div>
        </div>

        <div class="continue-row xm-secs ${open ? 'show-all' : ''}" style="--n:${Math.min(tracks.length, 3)}">
          ${tracks.map((tr, i) => `<div class="xm-sec-wrap ${i >= SHOWN ? 'is-extra' : ''}">${sectionTile(course, tr)}</div>`).join('')}
          ${extra > 0 ? `<button type="button" class="exam-more-btn xm-more" aria-expanded="${open}"><span class="em-more">${t('profile.examsMore', { n: extra })} ▾</span><span class="em-less">${t('profile.examsLess')} ▴</span></button>` : ''}
        </div>

        <h2 class="section-title">${t('home.modes')}</h2>
        <div class="modes-grid">
          ${modes(course)
            .map(
              (m, i) => `<a class="mode-card" href="#${m.href}" style="--c:${m.color}; --i:${i}">
              <span class="mode-icon">${m.icon}</span>
              <b>${esc(m.title)}</b>
              <span class="mode-desc">${esc(m.desc)}</span>
              ${m.rec ? `<span class="mode-record">🏆 ${m.rec}</span>` : ''}
            </a>`,
            )
            .join('')}
        </div>

        ${
          hasMock(course.id)
            ? `<div class="score-preview">
          <div>
            <h2>${t('xm.scoreTitle', { name: esc(tx(course.name)) })}</h2>
            <p class="muted">${last ? t('home.scoreLast', { date: last.date.split('-').reverse().join('.') }) : t('home.scoreNone')}</p>
          </div>
          <div class="score-preview-value">${last ? `${last.score}${last.max ? `<small>/${last.max}</small>` : ''}` : '-'}</div>
          <a class="btn btn-primary" href="#/mock/${course.id}">📝 ${t('home.takeExam')}</a>
        </div>`
            : ''
        }

        <h2 class="section-title">${t('xm.tools')}</h2>
        ${courseToolsHtml(course)}
        <a class="learn-card lc-sheets xm-sheet" href="#/sheet/${course.id}"><span class="learn-icon" aria-hidden="true">📄</span><span><b>${t('sheet.title')} ${esc(tx(course.name))}</b><small>${t('sheet.examDesc')}</small></span></a>
        ${fullReadCardHtml(course)}
        ${cardsCardHtml(course)}

        <div class="about-card">
          <h2>${esc(tx(course.full))}</h2>
          <p>${esc(tx(course.about))}</p>
          ${course.official ? `<p class="small">${t('cat.official')}: <a href="${course.official.url}" target="_blank" rel="noopener">${esc(course.official.label)}</a></p>` : ''}
          ${course.soon?.length ? `<p class="muted small">🔒 ${t('cat.soon')}: ${course.soon.map((s) => esc(tx(s))).join(', ')}</p>` : ''}
          <p class="muted tiny">${t('cat.disclaimer')}</p>
        </div>
      </section>`;
    app.querySelector('.xm-more')?.addEventListener('click', (e) => {
      const box = e.currentTarget.closest('.xm-secs');
      const on = box.classList.toggle('show-all');
      e.currentTarget.setAttribute('aria-expanded', String(on));
      storage.set('xmAllSecs', on);
    });
  };
  render();
  return { relabel: render };
}

// ---------- «Путь к …» ----------

export function examPathRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  const render = () => {
    const islands = orderedTracks(course).map((tr) => {
      const nodes = Array.from({ length: LEVELS }, (_, i) => {
        const n = i + 1;
        const s = levelStars(course, tr, n);
        const on = levelOpen(course, tr, n);
        const cur = on && !s;
        return on
          ? `<a class="xp-node ${s ? 'is-done' : ''} ${cur ? 'is-current' : ''}" href="#${xHref(course, `lv/${tr.id}/${n}`)}"><b>${n}</b><small>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</small></a>`
          : `<span class="xp-node is-locked"><b>🔒</b><small>☆☆☆</small></span>`;
      });
      const boss = bossFor(course, tr);
      const bOpen = bossOpen(course, tr);
      nodes.push(
        bOpen
          ? `<a class="xp-node xp-boss ${bossBeaten(course, tr) ? 'is-done' : 'is-current'}" href="#${xHref(course, `lv/${tr.id}/boss`)}"><b>${boss.icon}</b><small>${bossBeaten(course, tr) ? '👑' : t('xm.boss')}</small></a>`
          : `<span class="xp-node xp-boss is-locked"><b>${boss.icon}</b><small>🔒</small></span>`,
      );
      return `<div class="xp-island"><div class="xp-head"><span class="xp-icon">${esc(tr.icon)}</span><a class="xp-name" href="#${trackHref(course, tr)}" title="${t('xm.subjectPage')}">${esc(tx(tr.name))} ›</a><span class="xp-score">★ ${islandStars(course, tr)}/${LEVELS * 3}${bossBeaten(course, tr) ? ' · 👑' : ''}</span></div><div class="xp-nodes">${nodes.join('<i class="xp-link"></i>')}</div></div>`;
    });
    app.innerHTML = `
      <section class="page xpath" style="--c:${course.color}">
        <a class="crumb" href="#${examHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="page-head xp-top">${mascot('happy', 'mascot-sm')}<div><h1>🗺️ ${t('xm.path', { goal: PATH_GOAL[course.id] ?? '100' })}</h1><p class="muted">${t('xm.pathHint')}</p></div></div>
        <div class="xp-islands">${islands.join('')}</div>
      </section>`;
  };
  render();
  return { relabel: render };
}

export function examLevelRoute(app, { exam, track: trackId, n: nRaw }) {
  const course = courseById(exam);
  const track = course && trackById(course, trackId);
  if (!track) return navigate(course ? examHref(course) : '/exams');
  storage.set(`xLast:${course.id}`, track.id);
  const isBoss = nRaw === 'boss';
  const n = Number(nRaw);
  const back = xHref(course, 'path');
  if (isBoss ? !bossOpen(course, track) : !(n >= 1 && n <= LEVELS && levelOpen(course, track, n))) {
    navigate(back);
    return null;
  }
  const title = () => `${tx(course.name)} · ${tx(track.name)} · ${isBoss ? t('xm.boss') : t('map.level', { n })}`;
  const boss = bossFor(course, track);
  const play = () =>
    runSession(app, {
      title: () => (isBoss ? `⚔️ ${title()}` : title()),
      questions: buildTopicSet({ rng: createRng(newSeed()), spec: tieredSpec([track], isBoss ? [1, 2, 3] : LEVEL_TIERS[n]), count: isBoss ? BOSS_QUESTIONS : LEVEL_Q }),
      ...(isBoss ? { lives: 3, boss } : {}),
      catalog: true,
      exitTo: back,
      onFinish: (run) => {
        let stars = 0;
        let won = false;
        if (isBoss) {
          won = run.bossHp === 0;
          saveBossResult(course, track, won);
        } else {
          stars = starsFor(run.clean, LEVEL_Q);
          const st = pathStore(course);
          st[track.id] ??= {};
          st[track.id][n] = Math.max(st[track.id][n] ?? 0, stars);
        }
        saveProfile();
        const ok = isBoss ? won : stars >= 1;
        celebrate(ok);
        const next = isBoss ? null : n < LEVELS ? `lv/${track.id}/${n + 1}` : `lv/${track.id}/boss`;
        return () => ({
          mood: ok ? 'win' : 'neutral',
          title: isBoss ? (won ? t('res.bossWin', { name: tx(boss.name) }) : t('res.bossLose', { name: tx(boss.name) })) : stars >= 2 ? t('pr.great') : t('pr.done'),
          subtitle: isBoss ? (won ? t('pr.bossBeaten') : t('res.bossTip')) : t('pr.result', { c: run.correct, n: LEVEL_Q }),
          ...(isBoss ? {} : { stars }),
          share: stars === 3 ? { title: `${tx(course.name)} · ${tx(track.name)}`, stars: 3, note: t('map.level', { n }), badge: t('share.stars') } : null,
          xp: run.xp,
          stats: baseStats(run),
          log: run.log,
          actions: [
            ...(ok && next ? [{ label: `${t('pr.next')} →`, href: xHref(course, next), primary: true }] : []),
            { label: `↻ ${t('pr.again')}`, onClick: () => navigate(xHref(course, `lv/${track.id}/${nRaw}`)), primary: !(ok && next) },
            { label: `🗺️ ${t('xm.toPath')}`, href: back },
          ],
        });
      },
    });
  let session = null;
  // Перед первым уровнем острова - мини-уроки по темам предмета, которых человек ещё не видел.
  const start = () => (session = play());
  if (!isBoss && n === 1 && lessonTopics(trackTopics(track)).length) {
    const seen = storage.get('lessonsSeen', {}) ?? {};
    const fresh = lessonTopics(trackTopics(track)).filter((id) => !seen[id]).slice(0, 3);
    if (fresh.length) session = runLesson(app, { topics: fresh, title: title(), onDone: start });
    else start();
  } else start();
  return { cleanup: () => session?.cleanup?.(), relabel: () => session?.relabel?.() };
}

// ---------- Экран подготовки с выбором предмета ----------

function sectionPicker(course, selected) {
  const opts = [['mix', '🎲', t('mode.mix')], ...course.tracks.map((tr) => [tr.id, tr.icon, tx(tr.name)])];
  return `<div class="xm-picker" role="radiogroup" aria-label="${t('mode.section')}">${opts
    .map(([id, icon, label]) => `<button type="button" role="radio" data-section="${id}" aria-checked="${id === selected}">${esc(icon)} ${esc(label)}</button>`)
    .join('')}</div>`;
}

const tracksFor = (course, section) => (section === 'mix' ? course.tracks : [trackById(course, section) ?? course.tracks[0]]);
const sectionName = (course, section) => (section === 'mix' ? t('mode.mix') : tx(trackById(course, section)?.name ?? ''));

function examModeRoute(app, course, setup, start) {
  let section = storage.get(`xSec:${course.id}`, 'mix');
  if (section !== 'mix' && !trackById(course, section)) section = 'mix';
  let session = null;
  const render = () => {
    const s = setup();
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${examHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card">
          <div class="setup-icon">${s.icon}</div>
          <h1>${s.title}</h1>
          <p class="muted">${s.desc}</p>
          <ul class="rules">${s.rules.map((r) => `<li>${r}</li>`).join('')}</ul>
          ${s.record ? `<div class="record">🏆 ${t('mode.record')}: <b>${s.record}</b></div>` : ''}
          ${s.extraHtml ?? ''}
          <div class="setup-section"><span>${t('mode.section')}</span>${sectionPicker(course, section)}</div>
          <button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('mode.start')}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-section]').forEach((b) =>
      b.addEventListener('click', () => {
        section = b.dataset.section;
        storage.set(`xSec:${course.id}`, section);
        app.querySelectorAll('[data-section]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', () => {
      if (section !== 'mix') storage.set(`xLast:${course.id}`, section);
      session = start(section);
    });
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

function saveRecord(course, key, value) {
  const p = getProfile();
  p.examRecords ??= {};
  p.examRecords[course.id] ??= {};
  const isRecord = value > (p.examRecords[course.id][key] ?? 0);
  if (isRecord) p.examRecords[course.id][key] = value;
  saveProfile();
  return { isRecord, best: p.examRecords[course.id][key] ?? 0 };
}

export function examSurvivalRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  const again = xHref(course, 'survival');
  return examModeRoute(
    app,
    course,
    () => ({ icon: '🛡️', title: `${t('survival.title')} · ${esc(tx(course.name))}`, desc: t('survival.desc'), rules: [t('survival.rule1'), t('survival.rule2'), t('survival.rule3')], record: getProfile().examRecords?.[course.id]?.survival }),
    (section) =>
      runSession(app, {
        title: () => `${t('survival.title')} · ${sectionName(course, section)}`,
        stream: new ExamStream({ rng: createRng(newSeed()), tracks: tracksFor(course, section) }),
        difficultyAt: (i) => (i < 5 ? 1 : i < 12 ? 2 : 3),
        lives: 3,
        exitTo: again,
        onFinish: (run) => {
          const { isRecord, best } = saveRecord(course, 'survival', run.correct);
          celebrate(isRecord);
          return () => ({
            mood: isRecord ? 'win' : 'neutral',
            title: isRecord ? t('res.newRecord') : t('survival.over'),
            subtitle: t('survival.score', { n: run.correct }),
            xp: run.xp,
            stats: [...baseStats(run), { icon: '🏆', label: t('mode.record'), value: best }],
            share: isRecord ? { title: `${t('survival.title')} · ${tx(course.name)}`, big: String(run.correct), note: t('share.correct'), badge: t('share.record') } : null,
            log: run.log,
            actions: [
              { label: `↻ ${t('res.again')}`, onClick: () => navigate(again), primary: true },
              { label: `← ${esc(tx(course.name))}`, href: examHref(course) },
            ],
          });
        },
      }),
  );
}

export function examBlitzRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  const again = xHref(course, 'blitz');
  return examModeRoute(
    app,
    course,
    () => ({ icon: '⚡', title: `${t('blitz.title')} · ${esc(tx(course.name))}`, desc: t('blitz.desc', { s: BLITZ_S }), rules: [t('blitz.rule1'), t('blitz.rule2'), t('blitz.rule3')], record: getProfile().examRecords?.[course.id]?.blitz }),
    (section) =>
      runSession(app, {
        title: () => `${t('blitz.title')} · ${sectionName(course, section)}`,
        stream: new ExamStream({ rng: createRng(newSeed()), tracks: tracksFor(course, section), quick: true }),
        difficultyAt: (i) => (i < 8 ? 1 : 2),
        timeLimit: BLITZ_S,
        quick: true,
        exitTo: again,
        onFinish: (run) => {
          const { isRecord, best } = saveRecord(course, 'blitz', run.correct);
          celebrate(isRecord || run.correct >= 8);
          return () => ({
            mood: isRecord ? 'win' : 'neutral',
            title: isRecord ? t('res.newRecord') : t('blitz.over'),
            subtitle: t('blitz.score', { n: run.correct, s: BLITZ_S }),
            xp: run.xp,
            stats: [...baseStats(run), { icon: '🏆', label: t('mode.record'), value: best }],
            share: isRecord ? { title: `${t('blitz.title')} · ${tx(course.name)}`, big: String(run.correct), note: t('blitz.score', { n: run.correct, s: BLITZ_S }), badge: t('share.record') } : null,
            log: run.log,
            actions: [
              { label: `↻ ${t('res.again')}`, onClick: () => navigate(again), primary: true },
              { label: `← ${esc(tx(course.name))}`, href: examHref(course) },
            ],
          });
        },
      }),
  );
}

// ---------- Дуэль ----------

const duelLink = (code) => `${location.origin}${location.pathname}#/duel/${code}`;

function duelShare(app, code, text) {
  const link = duelLink(code);
  app.querySelector('.copy-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
    } catch {
      app.querySelector('.share-input')?.select();
    }
    const p = getProfile();
    p.counters.duelsSent += 1;
    saveProfile();
    toast(`✅ ${t('duel.copied')}`, { kind: 'good' });
  });
}

/** Дуэль на заданиях экзамена; opponent - вызов из ссылки. */
export function playExamDuel(app, { course, seed, section, opponent = null }) {
  const name = getProfile().name || t('duel.anonymous');
  const questions = buildTopicSet({ rng: createRng(seed), spec: tieredSpec(tracksFor(course, section), [1, 2, 3]), count: DUEL_LENGTH, memory: false });
  return runSession(app, {
    title: () => (opponent ? `🤺 ${t('duel.vs', { name: opponent.name })}` : `🤺 ${t('duel.title')} · ${tx(course.name)}`),
    questions,
    exitTo: xHref(course, 'duel'),
    onFinish: (run) => {
      const code = encodeDuel({ seed, section, name, correct: run.correct, timeMs: run.timeMs, exam: course.id });
      const outcome = opponent ? duelOutcome({ correct: run.correct, timeMs: run.timeMs }, opponent) : null;
      celebrate(!opponent || outcome === 'win');
      const text = t('duel.shareText', { c: run.correct, n: DUEL_LENGTH });
      return () => ({
        mood: outcome === 'lose' ? 'lose' : 'win',
        title: opponent ? t(`duel.${outcome}`) : t('duel.sent'),
        subtitle: opponent
          ? t('duel.compare', { me: run.correct, them: opponent.correct, name: esc(opponent.name) })
          : t('duel.yourResult', { c: run.correct, n: DUEL_LENGTH, time: formatTime(run.timeMs) }),
        xp: run.xp,
        stats: [...baseStats(run), { icon: '⏱', label: t('duel.time'), value: formatTime(run.timeMs) }],
        extraHtml: `<div class="share-box"><p><b>${t('duel.shareTitle')}</b></p><div class="share-row"><input class="share-input" readonly value="${esc(duelLink(code))}" aria-label="${t('duel.link')}"/><button type="button" class="btn btn-primary copy-btn">📋 ${t('duel.copy')}</button></div><p class="muted small">${t('duel.shareHint')}</p></div>`,
        log: run.log,
        actions: [
          { label: `🤺 ${t('duel.newDuel')}`, onClick: () => navigate(xHref(course, 'duel')), primary: Boolean(opponent) },
          { label: `← ${esc(tx(course.name))}`, href: examHref(course) },
        ],
        afterRender: (root) => duelShare(root, code, text),
      });
    },
  });
}

export function examDuelRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  return examModeRoute(
    app,
    course,
    () => ({
      icon: '🤺',
      title: `${t('duel.title')} · ${esc(tx(course.name))}`,
      desc: t('duel.desc', { n: DUEL_LENGTH }),
      rules: [t('duel.rule1'), t('duel.rule2'), t('duel.rule3')],
      extraHtml: `<label class="name-field"><span>${t('duel.yourName')}</span><input class="name-input" type="text" maxlength="24" value="${esc(getProfile().name)}" placeholder="${t('duel.namePlaceholder')}"/></label>`,
    }),
    (section) => {
      const input = app.querySelector('.name-input');
      if (input) {
        getProfile().name = input.value.trim().slice(0, 24);
        saveProfile();
      }
      return playExamDuel(app, { course, seed: newSeed(), section });
    },
  );
}

// ---------- Задание дня экзамена ----------

export function examDailyRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  const today = dayKey();
  let session = null;
  let timer = null;
  const render = () => {
    clearInterval(timer);
    const done = getProfile().examDaily?.[course.id]?.[today];
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${examHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card">
          <div class="setup-icon">☀️</div>
          <h1>${t('daily.title')} · ${esc(tx(course.name))}</h1>
          <p class="muted">${t('daily.desc', { n: DAILY_N, xp: DAILY_XP })}</p>
          ${
            done
              ? `<div class="daily-done">${mascot('win', 'mascot-sm')}<div><b>${t('daily.doneToday', { c: done.c, n: DAILY_N })}</b><p class="muted">${t('daily.next')} <span class="countdown"></span></p></div></div>
                 <a class="btn btn-soft btn-xl" href="#${examHref(course)}">← ${esc(tx(course.name))}</a>`
              : `<button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('daily.start')}</button>`
          }
        </div>
      </section>`;
    if (done) {
      const cd = app.querySelector('.countdown');
      const tick = () => {
        const ms = msUntilMidnight();
        cd.textContent = t('daily.countdown', { h: Math.floor(ms / 3600000), m: Math.floor(ms / 60000) % 60 });
      };
      tick();
      timer = setInterval(tick, 30000);
      return;
    }
    app.querySelector('.start-btn').addEventListener('click', () => {
      const stream = new ExamStream({ rng: createRng(hashString(`xdaily-${course.id}-${today}`)), tracks: course.tracks, memory: false });
      session = runSession(app, {
        title: () => `☀️ ${t('daily.title')} · ${tx(course.name)}`,
        questions: [1, 2, 2, 3, 3].map((d) => stream.next(d)),
        exitTo: examHref(course),
        onFinish: (run) => {
          const p = getProfile();
          let bonus = 0;
          p.examDaily ??= {};
          p.examDaily[course.id] ??= {};
          if (!p.examDaily[course.id][today]) {
            p.examDaily[course.id] = { [today]: { c: run.correct } };
            bonus = addXp(DAILY_XP);
          }
          saveProfile();
          celebrate(run.correct >= 3);
          return () => ({
            mood: run.correct >= 3 ? 'win' : 'neutral',
            title: t('daily.complete'),
            subtitle: t('daily.result', { c: run.correct, n: DAILY_N }),
            xp: run.xp + bonus,
            stats: baseStats(run),
            log: run.log,
            actions: [{ label: `← ${esc(tx(course.name))}`, href: examHref(course), primary: true }],
          });
        },
      });
    });
  };
  render();
  return {
    cleanup: () => {
      clearInterval(timer);
      session?.cleanup();
    },
    relabel: () => (session ? session.relabel() : render()),
  };
}

// ---------- Теория (для экзаменов без английского) ----------

export function examTheoryRoute(app, { exam }) {
  const course = courseById(exam);
  if (!course?.tracks.length) return navigate('/exams');
  let session = null;
  const render = () => {
    session = null;
    app.innerHTML = `
      <section class="page catalog">
        <a class="crumb" href="#${examHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="page-head"><h1>📖 ${t('lesson.theory')} · ${esc(tx(course.name))}</h1><p class="muted">${t('xm.theoryDesc')}</p></div>
        <div class="explain-grid">${course.tracks
          .filter((tr) => lessonTopics(trackTopics(tr)).length)
          .map((tr, i) => `<button type="button" class="explain-card xm-theory" data-track="${tr.id}" style="--i:${i}"><span class="explain-icon">${esc(tr.icon)}</span><b>${esc(tx(tr.name))}</b><small>${t('xm.lessons', { n: lessonTopics(trackTopics(tr)).length })}</small></button>`)
          .join('')}</div>
      </section>`;
    app.querySelectorAll('.xm-theory').forEach((b) =>
      b.addEventListener('click', () => {
        const tr = trackById(course, b.dataset.track);
        session = runLesson(app, { topics: trackTopics(tr), title: `${tx(course.name)} · ${tx(tr.name)}`, doneLabel: t('lesson.done'), onDone: render });
      }),
    );
  };
  render();
  return { relabel: () => (session ? session.relabel() : render()) };
}

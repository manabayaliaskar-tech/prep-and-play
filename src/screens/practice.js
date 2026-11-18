// Тренировка по дорожке каталога: уровень математики или английского, предмет экзамена,
// уровень олимпиадных задач. Два режима: тренировка с разбором после каждого задания
// и тест на время с разбором в конце.

import { bossFor } from '../catalog/bosses.js';
import { courseById, courseHref, levelLabel, practiceKey, trackById, trackHref, trackRecord } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile, todayStats } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { skillName } from '../content/labels.js';
import { starsFor } from '../engine/session.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { trackTopics } from './catalog.js';
import { courseBadge } from './hub.js';
import { lessonTopics, runLesson, unseenLessons } from './lesson.js';
import { baseStats, celebrate, runSession } from './play.js';

export const TRAIN_COUNT = 10;
/** Куда ведёт кнопка «назад» из тренировки: для разделов с общей страницей - на неё. */
const GROUP_HOME = { daily: '/practice', code: '/code' };

/** Сохраняет результат тренировки. Возвращает запись с лучшими показателями. */
export function saveTrackResult(course, track, { correct, total, clean = correct }, today = dayKey()) {
  const p = getProfile();
  const key = practiceKey(course, track);
  const rec = (p.practice[key] ??= { best: 0, runs: 0, pct: 0, last: null });
  rec.runs += 1;
  // Звёзды - только за задания без подсказок и формул (clean).
  rec.best = Math.max(rec.best, starsFor(clean, total));
  rec.pct = Math.max(rec.pct, total ? Math.round((correct / total) * 100) : 0);
  rec.last = today;
  p.last = { course: course.id, track: track.id };
  if (starsFor(clean, total) >= 2) todayStats(today).stars2 += 1;
  return rec;
}

/** Сохраняет итог боя с боссом уровня. */
export function saveBossResult(course, track, won, today = dayKey()) {
  const p = getProfile();
  const rec = (p.practice[practiceKey(course, track)] ??= { best: 0, runs: 0, pct: 0, last: null });
  const first = won && !rec.boss;
  if (won) {
    rec.boss = true;
    todayStats(today).bosses += 1;
  }
  rec.last = today;
  p.last = { course: course.id, track: track.id };
  return first;
}

export const BOSS_QUESTIONS = 10;

/** Сколько новых мини-уроков показать перед тренировкой; остальные - в следующие разы. */
const LESSONS_BEFORE = 3;

export function trackRoute(app, { course: courseId, track: trackId }) {
  const course = courseById(courseId);
  const track = trackById(course, trackId);
  if (!course || !track) {
    navigate(course ? courseHref(course) : '/');
    return null;
  }
  const index = course.tracks.indexOf(track);
  const next = course.leveled ? course.tracks[index + 1] : null;
  let session = null;

  const title = () => `${tx(course.name)} · ${course.leveled ? levelLabel(course, track) : tx(track.name)}`;

  function start(mode, skipLesson = false) {
    const fresh = mode === 'train' && !skipLesson ? unseenLessons(trackTopics(track)).slice(0, LESSONS_BEFORE) : [];
    if (fresh.length) {
      session = runLesson(app, { topics: fresh, title: title(), onDone: () => start(mode, true) });
      return;
    }
    const test = mode === 'test' ? track.test : null;
    const count = test ? test.count : TRAIN_COUNT;
    session = runSession(app, {
      title,
      questions: buildTopicSet({ rng: createRng(newSeed()), spec: track.spec, count }),
      timeLimit: test ? test.minutes * 60 : null,
      silent: Boolean(test),
      catalog: true,
      exitTo: trackHref(course, track),
      onFinish: (run, { reason }) => {
        // Задания, до которых не дошла очередь в тесте на время, считаются неверными.
        const stars = starsFor(run.clean, count);
        saveTrackResult(course, track, { correct: run.correct, total: count, clean: run.clean });
        saveProfile();
        celebrate(stars >= 1);
        return () => ({
          mood: stars >= 1 ? 'win' : 'neutral',
          title: reason === 'time' ? t('pr.timeUp') : test ? t('pr.testDone') : stars >= 2 ? t('pr.great') : t('pr.done'),
          subtitle: t('pr.result', { c: run.correct, n: count }),
          stars,
          xp: run.xp,
          stats: baseStats(run),
          log: run.log,
          actions: [
            ...(next && stars >= 2 ? [{ label: `${t('pr.next')} →`, href: trackHref(course, next), primary: true }] : []),
            { label: `↻ ${t('pr.again')}`, onClick: () => navigate(trackHref(course, track)), primary: !(next && stars >= 2) },
            { label: `← ${esc(tx(course.name))}`, href: GROUP_HOME[course.group] ?? courseHref(course) },
          ],
        });
      },
    });
  }

  const boss = bossFor(course, track);

  function fight() {
    session = runSession(app, {
      title: () => `⚔️ ${t('pr.boss')} · ${title()}`,
      questions: buildTopicSet({ rng: createRng(newSeed()), spec: track.spec, count: BOSS_QUESTIONS }),
      lives: 3,
      boss,
      catalog: true,
      exitTo: trackHref(course, track),
      onFinish: (run) => {
        const won = run.bossHp === 0;
        const first = saveBossResult(course, track, won);
        saveProfile();
        celebrate(won);
        return () => ({
          mood: won ? 'win' : 'lose',
          title: won ? t('res.bossWin', { name: tx(boss.name) }) : t('res.bossLose', { name: tx(boss.name) }),
          subtitle: won ? t('pr.bossBeaten') : t('res.bossTip'),
          xp: run.xp,
          stats: baseStats(run),
          log: run.log,
          extraHtml: first ? `<div class="banner-win">👑 ${t('pr.bossBeaten')}</div>` : '',
          actions: [
            ...(won && next ? [{ label: `${t('pr.next')} →`, href: trackHref(course, next), primary: true }] : []),
            ...(won ? [] : [{ label: `↻ ${t('res.retry')}`, onClick: () => navigate(trackHref(course, track)), primary: true }]),
            { label: `← ${esc(tx(course.name))}`, href: GROUP_HOME[course.group] ?? courseHref(course) },
          ],
        });
      },
    });
  }

  const render = () => {
    const rec = trackRecord(course, track);
    const topics = trackTopics(track);
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${GROUP_HOME[course.group] ?? courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card wide" style="--c:${course.color}">
          ${courseBadge(course, 'big')}
          <p class="track-kicker">${course.leveled ? `${esc(tx(course.name))} · ${levelLabel(course, track)}` : esc(tx(course.name))}</p>
          <h1>${esc(tx(track.name))}</h1>
          <p class="muted">${esc(tx(track.desc))}</p>
          ${rec?.runs ? `<div class="record">${rec.boss ? '👑 ' : ''}★ ${rec.best}/3 · ${t('cat.bestPct', { n: rec.pct })} · ${t('cat.runs', { n: rec.runs })}</div>` : ''}
          <div class="topic-chips center">${topics.map((id) => `<span class="topic-chip">${esc(tx(skillName(id)))}</span>`).join('')}</div>
          ${lessonTopics(topics).length ? `<div class="theory-row"><button type="button" class="btn btn-soft btn-sm theory-btn">📖 ${t('lesson.theory')}</button><a class="btn btn-soft btn-sm" href="#/sheet/${course.id}/${track.id}">📄 ${t('sheet.title')}</a></div>` : ''}
          <div class="start-options">
            <button type="button" class="option-card start-train"><b>▶ ${t('pr.train')}</b><span>${t('pr.trainDesc', { n: TRAIN_COUNT })}</span></button>
            <button type="button" class="option-card start-boss ${rec?.boss ? 'is-beaten' : ''}"><span class="option-boss" aria-hidden="true">${boss.icon}</span><b>⚔️ ${t('pr.boss')}${rec?.boss ? ' 👑' : ''}</b><span>${esc(t('pr.bossDesc', { name: tx(boss.name) }))}</span></button>
            ${track.test ? `<button type="button" class="option-card start-test"><b>⏱ ${t('pr.test')}</b><span>${t('pr.testDesc', { n: track.test.count, m: track.test.minutes })}</span></button>` : ''}
          </div>
        </div>
      </section>`;
    app.querySelector('.start-train').addEventListener('click', () => start('train'));
    app.querySelector('.start-test')?.addEventListener('click', () => start('test'));
    app.querySelector('.start-boss').addEventListener('click', fight);
    app.querySelector('.theory-btn')?.addEventListener('click', () => {
      session = runLesson(app, {
        topics,
        title: title(),
        doneLabel: t('pr.train'),
        onDone: () => start('train', true),
      });
    });
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

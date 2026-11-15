// Тренировка по дорожке каталога: уровень математики или английского, предмет экзамена,
// уровень олимпиадных задач. Два режима: тренировка с разбором после каждого задания
// и тест на время с разбором в конце.

import { courseById, courseHref, levelLabel, practiceKey, trackById, trackHref, trackRecord } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { skillName } from '../content/labels.js';
import { starsFor } from '../engine/session.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { trackTopics } from './catalog.js';
import { courseBadge } from './hub.js';
import { baseStats, celebrate, runSession } from './play.js';

export const TRAIN_COUNT = 10;

/** Сохраняет результат тренировки. Возвращает запись с лучшими показателями. */
export function saveTrackResult(course, track, { correct, total }, today = dayKey()) {
  const p = getProfile();
  const key = practiceKey(course, track);
  const rec = (p.practice[key] ??= { best: 0, runs: 0, pct: 0, last: null });
  rec.runs += 1;
  rec.best = Math.max(rec.best, starsFor(correct, total));
  rec.pct = Math.max(rec.pct, total ? Math.round((correct / total) * 100) : 0);
  rec.last = today;
  p.last = { course: course.id, track: track.id };
  return rec;
}

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

  function start(mode) {
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
        const stars = starsFor(run.correct, count);
        saveTrackResult(course, track, { correct: run.correct, total: count });
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
            { label: `← ${esc(tx(course.name))}`, href: course.group === 'daily' ? '/practice' : courseHref(course) },
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
        <a class="crumb" href="#${course.group === 'daily' ? '/practice' : courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card wide" style="--c:${course.color}">
          ${courseBadge(course, 'big')}
          <p class="track-kicker">${course.leveled ? `${esc(tx(course.name))} · ${levelLabel(course, track)}` : esc(tx(course.name))}</p>
          <h1>${esc(tx(track.name))}</h1>
          <p class="muted">${esc(tx(track.desc))}</p>
          ${rec ? `<div class="record">★ ${rec.best}/3 · ${t('cat.bestPct', { n: rec.pct })} · ${t('cat.runs', { n: rec.runs })}</div>` : ''}
          <div class="topic-chips center">${topics.map((id) => `<span class="topic-chip">${esc(tx(skillName(id)))}</span>`).join('')}</div>
          <div class="start-options">
            <button type="button" class="option-card start-train"><b>▶ ${t('pr.train')}</b><span>${t('pr.trainDesc', { n: TRAIN_COUNT })}</span></button>
            ${track.test ? `<button type="button" class="option-card start-test"><b>⏱ ${t('pr.test')}</b><span>${t('pr.testDesc', { n: track.test.count, m: track.test.minutes })}</span></button>` : ''}
          </div>
        </div>
      </section>`;
    app.querySelector('.start-train').addEventListener('click', () => start('train'));
    app.querySelector('.start-test')?.addEventListener('click', () => start('test'));
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

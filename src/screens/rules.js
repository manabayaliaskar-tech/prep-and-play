// «Повторить правила»: короткие карточки правил, в которых ты ошибался, и по 2 задания на каждое.
// Расписание ведёт src/core/rules.js: верно - правило вернётся позже, ошибся - завтра.

import { COURSES } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { saveProfile } from '../core/profile.js';
import { createRng, newSeed, shuffle } from '../core/random.js';
import { navigate } from '../core/router.js';
import { applyRule, dueRules, restRulesToday } from '../core/rules.js';
import { SKILLS } from '../content/skills.js';
import { skillName } from '../content/labels.js';
import { buildSet } from '../content/bank.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { baseStats, celebrate, runSession } from './play.js';
import { runLesson } from './lesson.js';

/** Сколько заданий на одно правило. */
const PER_RULE = 2;

/** Уровни сложности темы из всех курсов: для повтора берём два самых лёгких. */
function easyKeys(topic) {
  const keys = new Set();
  for (const c of COURSES) for (const tr of c.tracks) for (const [tp, k] of tr.spec) if (tp === topic) k.forEach((x) => keys.add(x));
  const list = [...keys].sort((a, b) => a - b);
  return list.length ? list.slice(0, 2) : [1, 2];
}

function questionsFor(topics, rng) {
  const out = [];
  for (const topic of topics) {
    try {
      const qs = SKILLS[topic]
        ? buildSet({ rng, skills: [topic], count: PER_RULE, difficulties: [1, 2] })
        : buildTopicSet({ rng, spec: [[topic, easyKeys(topic)]], count: PER_RULE });
      out.push(...qs.filter(Boolean));
    } catch {
      // У темы нет генератора заданий - повторяем только правило.
    }
  }
  return shuffle(out, rng);
}

/** Через сколько дней правило вернётся - для подписи в итогах. */
function whenText(next, today) {
  if (!next) return t('rules.learned');
  const [y1, m1, d1] = today.split('-').map(Number);
  const [y2, m2, d2] = next.split('-').map(Number);
  const days = Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
  return days <= 1 ? t('rules.tomorrow') : t('rules.inDays', { n: days });
}

export function rulesRoute(app) {
  const today = dayKey();
  const topics = dueRules(today);
  if (!topics.length) {
    navigate('/');
    return null;
  }
  let session = null;
  const title = () => `📘 ${t('rules.title')}`;

  const startQuestions = () => {
    const questions = questionsFor(topics, createRng(newSeed()));
    if (!questions.length) {
      // Заданий нет - считаем, что правило повторено по карточке.
      topics.forEach((tp) => applyRule(tp, true, today));
      restRulesToday(today);
      navigate('/');
      return;
    }
    session = runSession(app, {
      title,
      questions,
      catalog: true,
      exitTo: '/',
      onFinish: (run) => {
        // Правило повторено верно, если все его задания решены без ошибок.
        const ok = new Map(topics.map((tp) => [tp, true]));
        for (const e of run.log) if (ok.has(e.question.skill) && !e.correct) ok.set(e.question.skill, false);
        const rows = topics.map((tp) => {
          const next = applyRule(tp, ok.get(tp), today);
          return `<div class="rule-row ${ok.get(tp) ? 'is-ok' : 'is-again'}"><span aria-hidden="true">${ok.get(tp) ? '✅' : '🔁'}</span><b>${esc(tx(skillName(tp)))}</b><small>${whenText(next, today)}</small></div>`;
        });
        restRulesToday(today);
        saveProfile();
        const all = [...ok.values()].every(Boolean);
        celebrate(all);
        return () => ({
          mood: all ? 'win' : 'neutral',
          title: all ? t('rules.doneAll') : t('rules.done'),
          subtitle: t('pr.result', { c: run.correct, n: run.answered }),
          xp: run.xp,
          stats: baseStats(run),
          extraHtml: `<section class="quiz-breakdown"><h2>${t('rules.next')}</h2><div class="rule-rows">${rows.join('')}</div><p class="muted small">${t('rules.how')}</p></section>`,
          log: run.log,
          actions: [{ label: `🏠 ${t('res.home')}`, href: '/', primary: true }],
        });
      },
    });
  };

  const lesson = runLesson(app, { topics, title: title(), onDone: startQuestions, doneLabel: t('rules.toTasks') });
  return {
    cleanup: () => session?.cleanup(),
    relabel: () => (session ? session.relabel() : lesson?.relabel()),
  };
}

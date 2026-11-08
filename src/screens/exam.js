// Пробный экзамен в формате цифрового SAT: 2 модуля на раздел, таймер, отметки «вернуться»,
// адаптивный второй модуль и прогноз балла 400–1600.

import { confetti } from '../core/confetti.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { addXp, checkAchievements, getProfile, recordAnswer, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate, setLeaveGuard } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { QuestionStream } from '../content/bank.js';
import { DOMAINS, SECTIONS } from '../content/skills.js';
import { checkAnswer } from '../engine/answer.js';
import { moduleDifficulties, routeAfterModule1, sectionScore } from '../engine/scoring.js';
import { esc, formatTime } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';
import { bindQuestion, questionHtml } from '../ui/question.js';
import { openReference } from '../ui/reference.js';
import { renderResults } from '../ui/results.js';
import { langSwitchHtml } from '../ui/topbar.js';

export const FORMATS = {
  mini: { rw: { count: 10, minutes: 13 }, math: { count: 8, minutes: 13 } },
  full: { rw: { count: 27, minutes: 32 }, math: { count: 22, minutes: 35 } },
};

const DOMAIN_WEIGHTS = {
  rw: [
    ['craft', 0.28],
    ['info', 0.26],
    ['conventions', 0.26],
    ['expression', 0.2],
  ],
  math: [
    ['algebra', 0.35],
    ['advanced', 0.35],
    ['data', 0.15],
    ['geometry', 0.15],
  ],
};

/** Сколько заданий каждого домена в модуле (метод наибольших остатков). */
export function domainCounts(section, count) {
  const weights = DOMAIN_WEIGHTS[section];
  const raw = weights.map(([d, w]) => [d, w * count]);
  const result = raw.map(([d, x]) => [d, Math.floor(x)]);
  let left = count - result.reduce((s, [, n]) => s + n, 0);
  const order = raw.map(([, x], i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k++, left--) result[order[k % order.length][1]][1] += 1;
  return result;
}

export function buildModule(stream, section, count, moduleIndex, route, rng) {
  const diffs = moduleDifficulties(moduleIndex, route, count);
  let di = 0;
  const items = [];
  for (const [domain, n] of domainCounts(section, count)) {
    for (let i = 0; i < n; i++) items.push(stream.next(diffs[di++ % diffs.length], { domain }));
  }
  if (section === 'math') items.sort((a, b) => a.d - b.d);
  return items;
}

export function examRoute(app) {
  const st = {
    view: 'setup',
    sectionChoice: storage.get('examSection', 'both'),
    length: storage.get('examLength', 'mini'),
    plan: [],
    sectionIndex: 0,
    moduleIndex: 0,
    route: null,
    module: null,
    results: {},
    timer: null,
    started: false,
    finished: false,
    build: null,
    rng: null,
    streams: {},
  };

  setLeaveGuard(() => !st.started || st.finished || confirm(t('exam.leave')));

  function render() {
    if (st.view === 'setup') renderSetup();
    else if (st.view === 'module') renderModule();
    else if (st.view === 'between') renderBetween();
    else if (st.view === 'done') renderResults(app, st.build);
  }

  // ----- Подготовка -----
  function renderSetup() {
    const opt = (group, value, label, desc) =>
      `<button type="button" class="option-card" role="radio" data-${group}="${value}" aria-checked="${(group === 'section' ? st.sectionChoice : st.length) === value}"><b>${label}</b><span>${desc}</span></button>`;
    const f = FORMATS[st.length];
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card wide">
          <div class="setup-icon">📝</div>
          <h1>${t('exam.title')}</h1>
          <p class="muted">${t('exam.desc')}</p>
          <div class="option-group"><span>${t('exam.what')}</span><div class="options">
            ${opt('section', 'both', t('exam.both'), '400–1600')}
            ${opt('section', 'rw', tx(SECTIONS.rw.name), '200–800')}
            ${opt('section', 'math', tx(SECTIONS.math.name), '200–800')}
          </div></div>
          <div class="option-group"><span>${t('exam.length')}</span><div class="options">
            ${opt('length', 'mini', t('exam.mini'), t('exam.miniDesc'))}
            ${opt('length', 'full', t('exam.full'), t('exam.fullDesc'))}
          </div></div>
          <ul class="rules">
            <li>${t('exam.rule1', { rw: f.rw.count, rwm: f.rw.minutes, m: f.math.count, mm: f.math.minutes })}</li>
            <li>${t('exam.rule2')}</li>
            <li>${t('exam.rule3')}</li>
          </ul>
          <button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('exam.start')}</button>
          <p class="muted small">${t('exam.disclaimer')}</p>
        </div>
      </section>`;
    app.querySelectorAll('[data-section]').forEach((b) =>
      b.addEventListener('click', () => {
        st.sectionChoice = b.dataset.section;
        storage.set('examSection', st.sectionChoice);
        renderSetup();
      }),
    );
    app.querySelectorAll('[data-length]').forEach((b) =>
      b.addEventListener('click', () => {
        st.length = b.dataset.length;
        storage.set('examLength', st.length);
        renderSetup();
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', start);
  }

  function start() {
    st.plan = st.sectionChoice === 'both' ? ['rw', 'math'] : [st.sectionChoice];
    st.rng = createRng(newSeed());
    st.plan.forEach((s) => (st.streams[s] = new QuestionStream({ rng: st.rng, section: s })));
    st.started = true;
    st.sectionIndex = 0;
    st.moduleIndex = 0;
    st.route = null;
    document.body.classList.add('in-session');
    startModule();
  }

  function startModule() {
    const section = st.plan[st.sectionIndex];
    const { count, minutes } = FORMATS[st.length][section];
    const questions = buildModule(st.streams[section], section, count, st.moduleIndex, st.route, st.rng);
    st.module = {
      section,
      questions,
      responses: questions.map(() => null),
      marked: questions.map(() => false),
      current: 0,
      timeLeft: minutes * 60,
    };
    st.view = 'module';
    renderModule();
    clearInterval(st.timer);
    st.timer = setInterval(() => {
      const m = st.module;
      m.timeLeft -= 1;
      const el = app.querySelector('.exam-timer');
      if (el) {
        el.textContent = formatTime(m.timeLeft * 1000);
        el.classList.toggle('is-low', m.timeLeft <= 60);
      }
      if (m.timeLeft === 300) toast(`⏰ ${t('exam.fiveLeft')}`, { kind: 'warn' });
      if (m.timeLeft <= 0) {
        toast(`⌛ ${t('exam.timeUp')}`, { kind: 'warn' });
        finishModule();
      }
    }, 1000);
  }

  // ----- Модуль -----
  function renderModule() {
    const m = st.module;
    const q = m.questions[m.current];
    const isLast = m.current === m.questions.length - 1;
    app.innerHTML = `
      <div class="exam">
        <header class="exam-bar">
          <div class="exam-title"><b>${esc(tx(SECTIONS[m.section].name))}</b><span>${t('exam.module', { k: st.moduleIndex + 1 })}</span></div>
          <div class="exam-timer ${m.timeLeft <= 60 ? 'is-low' : ''}">${formatTime(m.timeLeft * 1000)}</div>
          <div class="exam-tools">
            ${langSwitchHtml('mini')}
            ${m.section === 'math' ? `<button type="button" class="btn btn-soft btn-sm ref-btn">📏 ${t('ref.short')}</button><a class="btn btn-soft btn-sm" href="https://www.desmos.com/calculator" target="_blank" rel="noopener">🧮 Desmos</a>` : ''}
          </div>
        </header>
        <div class="exam-qhead">
          <span class="exam-qnum">${m.current + 1}</span>
          <button type="button" class="mark-btn ${m.marked[m.current] ? 'is-on' : ''}" aria-pressed="${m.marked[m.current]}">🔖 ${t('exam.mark')}</button>
        </div>
        <main class="q-area">${questionHtml(q)}</main>
        <footer class="exam-nav">
          <button type="button" class="btn btn-soft prev-btn" ${m.current === 0 ? 'disabled' : ''}>← ${t('exam.back')}</button>
          <button type="button" class="btn btn-soft palette-btn">${t('exam.qOf', { i: m.current + 1, n: m.questions.length })} ▾</button>
          <button type="button" class="btn btn-primary next-btn">${isLast ? t('exam.review') : `${t('exam.next')} →`}</button>
        </footer>
      </div>`;
    const binder = bindQuestion(app.querySelector('.q-area'), q, {
      onChange: (r) => {
        m.responses[m.current] = r;
      },
      onSubmit: () => go(1),
    });
    binder.setResponse(m.responses[m.current]);
    app.querySelector('.ref-btn')?.addEventListener('click', openReference);
    app.querySelector('.mark-btn').addEventListener('click', () => {
      m.marked[m.current] = !m.marked[m.current];
      renderModule();
    });
    app.querySelector('.prev-btn').addEventListener('click', () => go(-1));
    app.querySelector('.next-btn').addEventListener('click', () => (isLast ? openPalette() : go(1)));
    app.querySelector('.palette-btn').addEventListener('click', openPalette);
  }

  function go(delta) {
    const m = st.module;
    const next = m.current + delta;
    if (next < 0) return;
    if (next >= m.questions.length) {
      openPalette();
      return;
    }
    m.current = next;
    renderModule();
    window.scrollTo(0, 0);
  }

  function openPalette() {
    const m = st.module;
    const unanswered = m.responses.filter((r) => r === null).length;
    const close = openModal({
      title: t('exam.paletteTitle', { k: st.moduleIndex + 1 }),
      body: `
        <div class="palette-legend"><span><i class="pl answered"></i>${t('exam.answered')}</span><span><i class="pl"></i>${t('exam.unanswered')}</span><span><i class="pl marked"></i>${t('exam.marked')}</span></div>
        <div class="palette">${m.questions
          .map(
            (_, i) =>
              `<button type="button" class="pal ${m.responses[i] !== null ? 'answered' : ''} ${m.marked[i] ? 'marked' : ''} ${i === m.current ? 'current' : ''}" data-goto="${i}">${i + 1}</button>`,
          )
          .join('')}</div>
        ${unanswered ? `<p class="warn-note">⚠️ ${t('exam.unansweredWarn', { n: unanswered })}</p>` : `<p class="good-note">✅ ${t('exam.allAnswered')}</p>`}`,
      actions: [{ label: `✓ ${t('exam.finishModule')}`, primary: true, onClick: () => finishModule() }],
    });
    document.querySelectorAll('[data-goto]').forEach((b) =>
      b.addEventListener('click', () => {
        close();
        m.current = Number(b.dataset.goto);
        renderModule();
      }),
    );
  }

  function moduleItems(m) {
    return m.questions.map((q, i) => ({ question: q, d: q.d, response: m.responses[i], correct: checkAnswer(q, m.responses[i]) }));
  }

  function finishModule() {
    clearInterval(st.timer);
    document.getElementById('modal-root').innerHTML = '';
    const m = st.module;
    const items = moduleItems(m);
    const res = (st.results[m.section] ??= { modules: [], route: null });
    res.modules.push(items);
    sfx.select();
    if (st.moduleIndex === 0) {
      st.route = routeAfterModule1(items);
      res.route = st.route;
      st.moduleIndex = 1;
      st.view = 'between';
      st.betweenKind = 'module';
      renderBetween();
      return;
    }
    if (st.sectionIndex < st.plan.length - 1) {
      st.sectionIndex += 1;
      st.moduleIndex = 0;
      st.route = null;
      st.view = 'between';
      st.betweenKind = 'section';
      renderBetween();
      return;
    }
    finishExam();
  }

  function renderBetween() {
    const isSection = st.betweenKind === 'section';
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          ${mascot(isSection ? 'win' : 'happy', 'mascot-lg')}
          <h1>${isSection ? t('exam.breakTitle') : t('exam.module1Done')}</h1>
          <p class="muted">${isSection ? t('exam.breakDesc') : t('exam.module2Desc')}</p>
          <button type="button" class="btn btn-primary btn-xl continue-btn">${isSection ? t('exam.startMath') : t('exam.startModule2')} →</button>
        </div>
      </section>`;
    app.querySelector('.continue-btn').addEventListener('click', startModule);
  }

  // ----- Итог -----
  function finishExam() {
    st.finished = true;
    st.view = 'done';
    document.body.classList.remove('in-session');
    const scores = {};
    const log = [];
    for (const section of st.plan) {
      const r = st.results[section];
      scores[section] = sectionScore(r.modules[0], r.modules[1], r.route);
      for (const items of r.modules) {
        for (const it of items) {
          recordAnswer(it.question.skill, it.correct);
          log.push({ question: it.question, correct: it.correct, response: it.response });
        }
      }
    }
    const total = st.plan.length === 2 ? scores.rw + scores.math : null;
    const correct = log.filter((e) => e.correct).length;
    const xp = correct * 6;
    addXp(xp);
    const p = getProfile();
    p.exams.push({ date: dayKey(), length: st.length, rw: scores.rw ?? null, math: scores.math ?? null, total });
    if (p.exams.length > 30) p.exams.shift();
    checkAchievements();
    saveProfile();
    sfx.win();
    confetti();

    const byDomain = {};
    for (const e of log) {
      const d = (byDomain[e.question.domain] ??= { c: 0, n: 0 });
      d.n += 1;
      if (e.correct) d.c += 1;
    }
    st.build = () => {
      const scoreCard = `
        <div class="score-card">
          ${total !== null ? `<div class="score-total"><span>${t('exam.predicted')}</span><b>${total}</b><small>400–1600</small></div>` : ''}
          <div class="score-sections">
            ${st.plan.map((s) => `<div class="score-section"><span>${SECTIONS[s].icon} ${esc(tx(SECTIONS[s].name))}</span><b>${scores[s]}</b><small>200–800 · ${t(st.results[s].route === 'hard' ? 'exam.routeHard' : 'exam.routeEasy')}</small></div>`).join('')}
          </div>
          <p class="muted small">${t('exam.disclaimer')}</p>
        </div>
        <div class="domain-bars">
          <h2>${t('exam.byDomain')}</h2>
          ${Object.entries(byDomain)
            .map(
              ([d, v]) => `<div class="domain-row"><span>${DOMAINS[d].icon} ${esc(tx(DOMAINS[d].name))}</span><div class="bar" style="--c:${DOMAINS[d].color}"><i style="width:${Math.round((v.c / v.n) * 100)}%"></i></div><b>${v.c}/${v.n}</b></div>`,
            )
            .join('')}
        </div>`;
      const avg = st.plan.reduce((sum, sec) => sum + scores[sec], 0) / st.plan.length;
      return {
        mood: avg >= 500 ? 'win' : 'neutral',
        title: t('exam.doneTitle'),
        subtitle: t('exam.doneSub', { c: correct, n: log.length }),
        xp,
        extraHtml: scoreCard,
        log,
        actions: [
          { label: `🎯 ${t('exam.trainWeak')}`, href: '/weak', primary: true },
          { label: `↻ ${t('exam.again')}`, onClick: () => navigate('/exam') },
          { label: `🏠 ${t('res.home')}`, href: '/' },
        ],
      };
    };
    renderResults(app, st.build);
    window.scrollTo(0, 0);
  }

  render();

  return {
    cleanup() {
      clearInterval(st.timer);
      document.body.classList.remove('in-session');
    },
    relabel: render,
  };
}

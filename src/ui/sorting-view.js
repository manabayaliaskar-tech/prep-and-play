// Раздел «Сортировки»: пошаговая анимация, псевдокод, пояснения и режим «Угадай шаг».

import { SORTING_ALGORITHMS } from '../algorithms/sorting.js';
import { ARRAY_PRESETS, MAX_SIZE, MIN_SIZE, generateArray, parseArrayInput } from '../algorithms/arrays.js';
import { StepPlayer, speedToBatch, speedToDelay } from '../core/player.js';
import { createRng } from '../core/random.js';
import { storage } from '../core/storage.js';
import { createBars, renderBars } from './bars.js';
import { escapeHtml, playbackControlsHtml, wirePlayback } from './common.js';

const TEMPLATE = `
  <div class="toolbar">
    <div class="segmented" role="radiogroup" aria-label="Алгоритм" data-role="algos"></div>
  </div>

  <div class="layout-split">
    <div class="panel stage-panel">
      <div class="panel-head">
        <div>
          <h2 data-role="title"></h2>
          <p class="muted" data-role="description"></p>
        </div>
      </div>

      <div class="bars" data-role="bars" aria-hidden="true"></div>

      ${playbackControlsHtml()}

      <div class="data-controls">
        <label class="field">
          <span>Данные</span>
          <select data-role="preset">
            ${Object.entries(ARRAY_PRESETS)
              .map(([key, name]) => `<option value="${key}">${name}</option>`)
              .join('')}
          </select>
        </label>
        <label class="field field-range">
          <span>Размер: <b data-role="size-label"></b></span>
          <input type="range" min="${MIN_SIZE + 3}" max="${MAX_SIZE}" data-role="size" />
        </label>
        <button class="btn" data-role="shuffle" type="button">↻ Новый массив</button>
        <form class="custom-input" data-role="custom-form">
          <input type="text" inputmode="numeric" placeholder="Свой массив: 5, 3, 8, 1" data-role="custom" aria-label="Свой массив" />
          <button class="btn" type="submit">Применить</button>
        </form>
        <p class="error" data-role="error" role="alert"></p>
      </div>
    </div>

    <aside class="side">
      <div class="panel predict-panel" data-role="predict-panel">
        <label class="switch">
          <input type="checkbox" data-role="predict" />
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span class="switch-label">Игра «Угадай шаг»</span>
        </label>
        <p class="muted small">Перед каждым сравнением алгоритм остановится и спросит, что будет дальше.</p>
        <div class="score" data-role="score" hidden>
          <div><b data-role="score-correct">0</b><span>верно</span></div>
          <div><b data-role="score-total">0</b><span>вопросов</span></div>
          <div><b data-role="score-streak">0</b><span>серия</span></div>
          <div><b data-role="score-best">0</b><span>рекорд</span></div>
        </div>
      </div>

      <div class="panel explain" data-role="explain-panel" aria-live="polite">
        <div class="explain-label">Что происходит</div>
        <p class="explain-text" data-role="explain"></p>
        <div class="question" data-role="question" hidden>
          <p class="question-text" data-role="question-text"></p>
          <div class="question-actions">
            <button class="btn btn-yes" type="button" data-answer="yes">Да</button>
            <button class="btn btn-no" type="button" data-answer="no">Нет</button>
          </div>
        </div>
        <p class="feedback" data-role="feedback" hidden></p>
      </div>

      <div class="panel">
        <div class="stats">
          <div><span>Сравнения</span><b data-role="stat-comparisons">0</b></div>
          <div><span>Обмены</span><b data-role="stat-swaps">0</b></div>
          <div><span>Записи</span><b data-role="stat-writes">0</b></div>
        </div>
      </div>

      <div class="panel">
        <div class="explain-label">Псевдокод</div>
        <ol class="code" data-role="code"></ol>
      </div>

      <div class="panel">
        <div class="explain-label">Сложность</div>
        <dl class="complexity" data-role="complexity"></dl>
        <div class="legend">
          <span><i class="dot dot-compare"></i>сравнение</span>
          <span><i class="dot dot-swap"></i>обмен</span>
          <span><i class="dot dot-write"></i>запись</span>
          <span><i class="dot dot-marker"></i>опорный / минимум</span>
          <span><i class="dot dot-sorted"></i>на своём месте</span>
        </div>
      </div>
    </aside>
  </div>
`;

export function mountSortingView(root) {
  root.innerHTML = TEMPLATE;
  const $ = (role) => root.querySelector(`[data-role="${role}"]`);
  const ui = {
    algos: $('algos'),
    title: $('title'),
    description: $('description'),
    bars: $('bars'),
    preset: $('preset'),
    size: $('size'),
    sizeLabel: $('size-label'),
    shuffle: $('shuffle'),
    customForm: $('custom-form'),
    custom: $('custom'),
    error: $('error'),
    predict: $('predict'),
    score: $('score'),
    explainPanel: $('explain-panel'),
    explain: $('explain'),
    question: $('question'),
    questionText: $('question-text'),
    feedback: $('feedback'),
    code: $('code'),
    complexity: $('complexity'),
  };

  const rng = createRng();
  const state = {
    algo: 'bubble',
    preset: 'random',
    size: 16,
    input: [],
    maxValue: 1,
    steps: [],
    bars: [],
    answered: new Map(),
    pending: null,
    score: { correct: 0, total: 0, streak: 0, best: storage.get('bestStreak', 0) },
  };

  const playback = wirePlayback(root, {
    onRender: render,
    canMove: () => !state.pending,
    delay: () => speedToDelay(playback.speed),
    batch: () => speedToBatch(playback.speed),
  });
  const player = playback.player;

  // --- Алгоритмы ---
  ui.algos.innerHTML = Object.entries(SORTING_ALGORITHMS)
    .map(
      ([key, algo]) =>
        `<button type="button" role="radio" class="seg" data-algo="${key}" aria-checked="false">${algo.name}</button>`,
    )
    .join('');
  ui.algos.addEventListener('click', (event) => {
    const button = event.target.closest('[data-algo]');
    if (!button || button.dataset.algo === state.algo) return;
    state.algo = button.dataset.algo;
    rebuild();
  });

  // --- Данные ---
  ui.size.value = state.size;
  ui.sizeLabel.textContent = state.size;
  ui.size.addEventListener('input', () => {
    state.size = Number(ui.size.value);
    ui.sizeLabel.textContent = state.size;
    newArray();
  });
  ui.preset.addEventListener('change', () => {
    state.preset = ui.preset.value;
    newArray();
  });
  ui.shuffle.addEventListener('click', newArray);
  ui.customForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const parsed = parseArrayInput(ui.custom.value);
    if (!parsed.ok) {
      ui.error.textContent = parsed.error;
      return;
    }
    ui.error.textContent = '';
    setInput(parsed.values);
  });

  // --- Режим «Угадай шаг» ---
  ui.predict.addEventListener('change', () => {
    ui.score.hidden = !ui.predict.checked;
    if (!ui.predict.checked && state.pending) clearPending();
    updateScore();
  });
  ui.question.addEventListener('click', (event) => {
    const button = event.target.closest('[data-answer]');
    if (button) answer(button.dataset.answer === 'yes');
  });

  function newArray() {
    ui.error.textContent = '';
    setInput(generateArray(state.preset, state.size, rng));
  }

  function setInput(values) {
    state.input = values;
    state.maxValue = Math.max(...values);
    state.bars = createBars(ui.bars, values.length, { showValues: values.length <= 24 });
    rebuild();
  }

  function rebuild() {
    const algo = SORTING_ALGORITHMS[state.algo];
    clearPending();
    state.answered.clear();
    state.steps = algo.run(state.input);

    ui.algos.querySelectorAll('[data-algo]').forEach((b) => {
      b.setAttribute('aria-checked', String(b.dataset.algo === state.algo));
    });
    ui.title.textContent = `Сортировка ${algo.name.toLowerCase()}`;
    ui.description.textContent = algo.description;
    ui.code.innerHTML = algo.pseudocode.map((line) => `<li><code>${escapeHtml(line)}</code></li>`).join('');
    const c = algo.complexity;
    ui.complexity.innerHTML = `
      <div><dt>Лучший</dt><dd>${c.best}</dd></div>
      <div><dt>Средний</dt><dd>${c.average}</dd></div>
      <div><dt>Худший</dt><dd>${c.worst}</dd></div>
      <div><dt>Память</dt><dd>${c.memory}</dd></div>
      <div><dt>Устойчивая</dt><dd>${c.stable ? 'да' : 'нет'}</dd></div>`;
    player.load(state.steps.length);
  }

  function render(index, prevIndex) {
    const step = state.steps[index];
    renderBars(state.bars, step, state.maxValue);
    ui.bars.classList.toggle('is-finished', step.type === 'done');

    ui.code.querySelectorAll('li').forEach((li, i) => li.classList.toggle('is-active', i === step.line));
    $('stat-comparisons').textContent = step.comparisons;
    $('stat-swaps').textContent = step.swaps;
    $('stat-writes').textContent = step.writes;

    if (state.pending && state.pending.index !== index) clearPending();

    const movedForward = index === prevIndex + 1;
    if (ui.predict.checked && step.question && movedForward && !state.answered.has(index)) {
      ask(index, step);
      return;
    }
    ui.explain.textContent = step.text;
    ui.question.hidden = true;
    const verdict = state.answered.get(index);
    showFeedback(verdict === undefined ? null : verdict);
  }

  function ask(index, step) {
    state.pending = { index, wasPlaying: player.playing };
    player.pause();
    ui.explain.textContent = 'Подумай, что сейчас произойдёт:';
    ui.questionText.textContent = step.question.text;
    ui.question.hidden = false;
    showFeedback(null);
    ui.explainPanel.classList.add('is-asking');
    playback.refresh();
    ui.question.querySelector('[data-answer="yes"]').focus({ preventScroll: true });
  }

  function answer(yes) {
    if (!state.pending) return;
    const { index, wasPlaying } = state.pending;
    const step = state.steps[index];
    const correct = yes === step.question.answer;
    const s = state.score;
    s.total += 1;
    if (correct) {
      s.correct += 1;
      s.streak += 1;
      if (s.streak > s.best) {
        s.best = s.streak;
        storage.set('bestStreak', s.best);
      }
    } else {
      s.streak = 0;
    }
    state.answered.set(index, correct);
    clearPending();
    updateScore();
    ui.explain.textContent = step.text;
    showFeedback(correct);
    if (wasPlaying) {
      setTimeout(() => {
        if (!state.pending && player.index === index) player.play();
      }, correct ? 700 : 1400);
    }
  }

  function clearPending() {
    state.pending = null;
    ui.question.hidden = true;
    ui.explainPanel.classList.remove('is-asking');
    playback.refresh();
  }

  function showFeedback(correct) {
    ui.feedback.hidden = correct === null;
    if (correct === null) return;
    ui.feedback.className = `feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    ui.feedback.textContent = correct ? '✓ Верно!' : '✗ Не угадал — посмотри пояснение выше.';
  }

  function updateScore() {
    const s = state.score;
    $('score-correct').textContent = s.correct;
    $('score-total').textContent = s.total;
    $('score-streak').textContent = s.streak;
    $('score-best').textContent = s.best;
  }

  newArray();
  updateScore();

  return {
    onHide: () => player.pause(),
    onKey: (event) => playback.handleKey(event),
  };
}

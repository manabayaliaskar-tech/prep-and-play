// Раздел «Гонка»: все сортировки одновременно сортируют один и тот же массив.
// Один «шаг» = одна операция (сравнение, обмен или запись), поэтому побеждает тот, кому нужно меньше работы.

import { SORTING_ALGORITHMS } from '../algorithms/sorting.js';
import { OPERATION_TYPES } from '../algorithms/sort-recorder.js';
import { ARRAY_PRESETS, generateArray } from '../algorithms/arrays.js';
import { createRng } from '../core/random.js';
import { createBars, renderBars } from './bars.js';

const SPEEDS = { 1: '×1', 3: '×3', 10: '×10' };
const MEDALS = ['🥇', '🥈', '🥉'];

const INSIGHTS = {
  random:
    'На случайных данных алгоритмы O(n log n) — слиянием и быстрая — заметно обгоняют O(n²). А чем больше массив, тем больше разрыв.',
  nearly:
    'Почти отсортированный массив — звёздный час сортировки вставками: ей почти нечего сдвигать. Быстрая сортировка, наоборот, страдает из-за неудачного опорного.',
  reversed:
    'Обратный порядок — худший случай для пузырька и вставок: каждый элемент приходится тащить через весь массив. Быстрая сортировка с последним опорным тоже деградирует до O(n²).',
  few: 'Когда много одинаковых значений, многие сравнения заканчиваются «равны» — посмотри, кому это помогает, а кому мешает.',
};

const TEMPLATE = `
  <div class="panel">
    <div class="panel-head">
      <div>
        <h2>Гонка алгоритмов</h2>
        <p class="muted">Пять сортировок получают одинаковый массив. Каждый кадр — одна операция: сравнение, обмен или запись. Кто закончит первым?</p>
      </div>
    </div>
    <div class="race-controls">
      <label class="field">
        <span>Данные</span>
        <select data-role="preset">
          ${Object.entries(ARRAY_PRESETS)
            .map(([key, name]) => `<option value="${key}">${name}</option>`)
            .join('')}
        </select>
      </label>
      <label class="field">
        <span>Размер</span>
        <select data-role="size">
          <option value="20">20</option>
          <option value="30" selected>30</option>
          <option value="50">50</option>
        </select>
      </label>
      <div class="field">
        <span>Скорость</span>
        <div class="segmented segmented-small" role="radiogroup" data-role="speed">
          ${Object.entries(SPEEDS)
            .map(
              ([value, label]) =>
                `<button type="button" class="seg" role="radio" data-speed="${value}" aria-checked="${value === '3'}">${label}</button>`,
            )
            .join('')}
        </div>
      </div>
      <div class="race-actions">
        <button class="btn" type="button" data-role="shuffle">↻ Новый массив</button>
        <button class="play-btn" type="button" data-role="start"><span>▶</span><span data-role="start-label">Старт гонки</span></button>
      </div>
    </div>
    <div class="lanes" data-role="lanes"></div>
    <div class="insight" data-role="insight" hidden></div>
  </div>
`;

export function mountRaceView(root) {
  root.innerHTML = TEMPLATE;
  const $ = (role) => root.querySelector(`[data-role="${role}"]`);
  const rng = createRng();
  const state = { preset: 'random', size: 30, speed: 3, lanes: [], running: false, frame: null, input: [] };

  $('preset').addEventListener('change', (e) => {
    state.preset = e.target.value;
    setup();
  });
  $('size').addEventListener('change', (e) => {
    state.size = Number(e.target.value);
    setup();
  });
  $('shuffle').addEventListener('click', setup);
  $('speed').addEventListener('click', (e) => {
    const button = e.target.closest('[data-speed]');
    if (!button) return;
    state.speed = Number(button.dataset.speed);
    $('speed')
      .querySelectorAll('[data-speed]')
      .forEach((b) => b.setAttribute('aria-checked', String(b === button)));
  });
  $('start').addEventListener('click', () => {
    if (state.running) pause();
    else start();
  });

  function setup() {
    pause();
    state.input = generateArray(state.preset, state.size, rng);
    const maxValue = Math.max(...state.input);
    const lanesEl = $('lanes');
    lanesEl.replaceChildren();

    state.lanes = Object.entries(SORTING_ALGORITHMS).map(([key, algo]) => {
      const steps = algo.run(state.input);
      const frames = steps.filter((s, i) => i === 0 || i === steps.length - 1 || OPERATION_TYPES.has(s.type));
      const lane = document.createElement('div');
      lane.className = 'lane';
      lane.innerHTML = `
        <div class="lane-head">
          <span class="lane-name">${algo.name}</span>
          <span class="lane-big-o">${algo.complexity.average}</span>
          <span class="lane-place" data-lane="place"></span>
        </div>
        <div class="bars bars-mini" data-lane="bars"></div>
        <div class="lane-foot">
          <div class="lane-progress"><i data-lane="progress"></i></div>
          <span class="lane-ops"><b data-lane="ops">0</b> опер.</span>
        </div>`;
      lanesEl.append(lane);
      const bars = createBars(lane.querySelector('[data-lane="bars"]'), state.input.length);
      return {
        key,
        frames,
        ops: frames.length - 2,
        index: 0,
        bars,
        maxValue,
        el: lane,
        placeEl: lane.querySelector('[data-lane="place"]'),
        progressEl: lane.querySelector('[data-lane="progress"]'),
        opsEl: lane.querySelector('[data-lane="ops"]'),
      };
    });

    // Место определяется числом операций: меньше операций — раньше финиш.
    const sortedOps = [...new Set(state.lanes.map((l) => l.ops))].sort((a, b) => a - b);
    state.lanes.forEach((lane) => {
      lane.place = sortedOps.indexOf(lane.ops);
      renderLane(lane);
    });
    $('insight').hidden = true;
    updateStartButton();
  }

  function renderLane(lane) {
    const frame = lane.frames[lane.index];
    renderBars(lane.bars, frame, lane.maxValue);
    const opsDone = Math.min(lane.index, lane.ops);
    lane.opsEl.textContent = opsDone;
    lane.progressEl.style.width = `${(lane.index / (lane.frames.length - 1)) * 100}%`;
    const finished = lane.index === lane.frames.length - 1;
    lane.el.classList.toggle('is-finished', finished);
    lane.placeEl.textContent = finished ? `${MEDALS[lane.place] ?? `${lane.place + 1}-е место`}` : '';
  }

  function start() {
    if (state.lanes.every((l) => l.index === l.frames.length - 1)) {
      state.lanes.forEach((l) => {
        l.index = 0;
        renderLane(l);
      });
      $('insight').hidden = true;
    }
    state.running = true;
    updateStartButton();
    const tick = () => {
      let active = false;
      for (const lane of state.lanes) {
        const last = lane.frames.length - 1;
        if (lane.index < last) {
          lane.index = Math.min(last, lane.index + state.speed);
          renderLane(lane);
        }
        if (lane.index < last) active = true;
      }
      if (active) state.frame = requestAnimationFrame(tick);
      else finish();
    };
    state.frame = requestAnimationFrame(tick);
  }

  function pause() {
    cancelAnimationFrame(state.frame);
    state.running = false;
    updateStartButton();
  }

  function finish() {
    state.running = false;
    updateStartButton();
    const ranking = [...state.lanes].sort((a, b) => a.ops - b.ops);
    const winner = ranking[0];
    const loser = ranking.at(-1);
    const ratio = (loser.ops / Math.max(1, winner.ops)).toFixed(1);
    const insight = $('insight');
    insight.hidden = false;
    insight.innerHTML = `
      <p><b>🏁 Победитель — ${SORTING_ALGORITHMS[winner.key].name.toLowerCase()}:</b> ${winner.ops} операций.
      Последнее место — ${SORTING_ALGORITHMS[loser.key].name.toLowerCase()} (${loser.ops}), это в ${ratio} раза больше.</p>
      <p class="muted">${INSIGHTS[state.preset]}</p>`;
  }

  function updateStartButton() {
    const allDone = state.lanes.length > 0 && state.lanes.every((l) => l.index === l.frames.length - 1);
    $('start-label').textContent = state.running ? 'Пауза' : allDone ? 'Ещё раз' : 'Старт гонки';
    $('start').firstElementChild.textContent = state.running ? '❚❚' : '▶';
  }

  setup();

  return {
    onHide: pause,
    onKey: (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        $('start').click();
      }
    },
  };
}

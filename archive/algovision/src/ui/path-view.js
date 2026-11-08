// Раздел «Поиск пути»: рисуем стены и «болото», запускаем BFS / DFS / Дейкстру / A*.

import { PATH_ALGORITHMS, WEIGHT_COST } from '../algorithms/pathfinding.js';
import { generateMaze } from '../algorithms/maze.js';
import { createRng } from '../core/random.js';
import { speedToBatch, speedToDelay } from '../core/player.js';
import { playbackControlsHtml, wirePlayback } from './common.js';

const TOOLS = {
  wall: { label: 'Стена', icon: '▦' },
  weight: { label: `Болото ×${WEIGHT_COST}`, icon: '≈' },
  erase: { label: 'Ластик', icon: '⌫' },
};

const TEMPLATE = `
  <div class="toolbar">
    <div class="segmented" role="radiogroup" aria-label="Алгоритм" data-role="algos">
      ${Object.entries(PATH_ALGORITHMS)
        .map(
          ([key, a]) =>
            `<button type="button" class="seg" role="radio" data-algo="${key}" aria-checked="false">${a.name}</button>`,
        )
        .join('')}
    </div>
  </div>
  <div class="layout-split">
    <div class="panel stage-panel">
      <div class="panel-head">
        <div>
          <h2 data-role="title"></h2>
          <p class="muted" data-role="description"></p>
        </div>
      </div>
      <div class="grid-tools">
        <div class="segmented segmented-small" role="radiogroup" aria-label="Инструмент" data-role="tools">
          ${Object.entries(TOOLS)
            .map(
              ([key, t]) =>
                `<button type="button" class="seg" role="radio" data-tool="${key}" aria-checked="${key === 'wall'}"><span aria-hidden="true">${t.icon}</span> ${t.label}</button>`,
            )
            .join('')}
        </div>
        <div class="grid-actions">
          <button class="btn" type="button" data-role="maze">🎲 Лабиринт</button>
          <button class="btn" type="button" data-role="clear-path">Очистить путь</button>
          <button class="btn btn-ghost" type="button" data-role="clear-all">Очистить всё</button>
        </div>
      </div>
      <div class="grid-wrap">
        <div class="grid" data-role="grid" aria-label="Поле: рисуйте стены мышкой или пальцем"></div>
      </div>
      <p class="muted small hint">Рисуй мышкой или пальцем. Перетаскивай <span class="chip chip-start">старт</span> и <span class="chip chip-end">финиш</span>. После поиска путь пересчитывается сразу, когда меняешь поле.</p>
      ${playbackControlsHtml({ speed: 7 })}
    </div>

    <aside class="side">
      <div class="panel">
        <div class="stats stats-2">
          <div><span>Осмотрено клеток</span><b data-role="stat-visited">—</b></div>
          <div><span>Длина пути</span><b data-role="stat-length">—</b></div>
          <div><span>Стоимость пути</span><b data-role="stat-cost">—</b></div>
          <div><span>Кратчайший?</span><b data-role="stat-shortest">—</b></div>
        </div>
        <p class="feedback" data-role="message" hidden></p>
      </div>
      <div class="panel">
        <div class="explain-label">Сравнить все алгоритмы на этом поле</div>
        <button class="btn btn-wide" type="button" data-role="compare">⚖ Сравнить</button>
        <div class="compare-table" data-role="compare-table"></div>
      </div>
      <div class="panel">
        <div class="explain-label">Обозначения</div>
        <div class="legend legend-grid">
          <span><i class="cell-dot start"></i>старт</span>
          <span><i class="cell-dot end"></i>финиш</span>
          <span><i class="cell-dot wall"></i>стена</span>
          <span><i class="cell-dot weight"></i>болото (шаг стоит ${WEIGHT_COST})</span>
          <span><i class="cell-dot visited"></i>осмотрено</span>
          <span><i class="cell-dot path"></i>путь</span>
        </div>
      </div>
    </aside>
  </div>
`;

function gridSize() {
  return window.innerWidth < 640 ? { rows: 23, cols: 17 } : { rows: 21, cols: 41 };
}

export function mountPathView(root) {
  root.innerHTML = TEMPLATE;
  const $ = (role) => root.querySelector(`[data-role="${role}"]`);
  const gridEl = $('grid');
  const rng = createRng();

  const state = {
    algo: 'astar',
    tool: 'wall',
    rows: 0,
    cols: 0,
    start: 0,
    end: 0,
    walls: new Set(),
    weights: new Set(),
    cells: [],
    events: [],
    result: null,
    live: false, // после первого поиска поле пересчитывается мгновенно при изменениях
    drag: null,
  };

  const playback = wirePlayback(root, {
    onRender: renderEvents,
    delay: () => speedToDelay(playback.speed),
    batch: () => speedToBatch(playback.speed) * 2,
    onState: ({ index, total }) => {
      if (total > 1 && index === total - 1) {
        state.live = true;
        showStats();
      }
    },
  });
  const player = playback.player;

  // --- Сетка ---
  function buildGrid() {
    const { rows, cols } = gridSize();
    state.rows = rows;
    state.cols = cols;
    state.walls.clear();
    state.weights.clear();
    const mid = Math.floor(rows / 2);
    state.start = mid * cols + Math.floor(cols * 0.2);
    state.end = mid * cols + Math.floor(cols * 0.8);
    gridEl.style.setProperty('--cols', cols);
    gridEl.replaceChildren();
    state.cells = [];
    for (let i = 0; i < rows * cols; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.idx = i;
      gridEl.append(cell);
      state.cells.push(cell);
    }
    resetSearch();
    paintAll();
  }

  function cellClass(i) {
    if (i === state.start) return 'cell start';
    if (i === state.end) return 'cell end';
    if (state.walls.has(i)) return 'cell wall';
    if (state.weights.has(i)) return 'cell weight';
    return 'cell';
  }

  function paintAll() {
    state.cells.forEach((cell, i) => {
      cell.className = cellClass(i);
    });
  }

  function gridData() {
    return {
      rows: state.rows,
      cols: state.cols,
      start: state.start,
      end: state.end,
      walls: state.walls,
      weights: state.weights,
    };
  }

  // --- Поиск и анимация ---
  function compute() {
    const result = PATH_ALGORITHMS[state.algo].run(gridData());
    state.result = result;
    state.events = [{ type: 'start' }];
    result.visited.forEach((idx) => state.events.push({ type: 'visit', idx }));
    result.path.forEach((idx) => state.events.push({ type: 'path', idx }));
    return result;
  }

  function applyEvent(event, animate) {
    if (event.type === 'start') return;
    const { idx } = event;
    if (idx === state.start || idx === state.end) return;
    const cell = state.cells[idx];
    if (event.type === 'visit') cell.classList.add('visited');
    if (event.type === 'path') cell.classList.add('path');
    if (animate) {
      cell.classList.remove('anim');
      void cell.offsetWidth; // перезапуск CSS-анимации
      cell.classList.add('anim');
    }
  }

  function renderEvents(index, prevIndex) {
    if (index === prevIndex + 1 && prevIndex >= 0) {
      applyEvent(state.events[index], true);
    } else {
      paintAll();
      for (let k = 0; k <= index; k++) applyEvent(state.events[k], false);
    }
    if (index < state.events.length - 1) hideStats();
  }

  function run() {
    compute();
    state.live = false;
    player.load(state.events.length);
    player.play();
  }

  function liveUpdate() {
    if (!state.live) {
      resetSearch();
      return;
    }
    compute();
    player.load(state.events.length);
    player.seek(state.events.length - 1);
    showStats();
  }

  function resetSearch() {
    state.live = false;
    state.result = null;
    state.events = [{ type: 'start' }];
    player.load(1);
    paintAll();
    hideStats();
  }

  function hideStats() {
    ['visited', 'length', 'cost', 'shortest'].forEach((k) => {
      $(`stat-${k}`).textContent = '—';
    });
    $('message').hidden = true;
  }

  function showStats() {
    const r = state.result;
    if (!r) return;
    const algo = PATH_ALGORITHMS[state.algo];
    $('stat-visited').textContent = r.visited.length;
    $('stat-length').textContent = r.found ? r.path.length - 1 : '—';
    $('stat-cost').textContent = r.found ? r.cost : '—';
    const best = PATH_ALGORITHMS.dijkstra.run(gridData()).cost;
    $('stat-shortest').textContent = r.found ? (r.cost === best ? 'да ✓' : 'нет ✗') : '—';
    const message = $('message');
    message.hidden = false;
    if (!r.found) {
      message.className = 'feedback is-wrong';
      message.textContent = 'Пути нет: финиш отрезан стенами.';
    } else if (r.cost !== best) {
      message.className = 'feedback is-warn';
      message.textContent = algo.weighted
        ? 'Путь найден, но не самый дешёвый.'
        : `${algo.name} не учитывает «болото»: самый дешёвый путь стоит ${best}, а этот — ${r.cost}.`;
    } else {
      message.className = 'feedback is-correct';
      message.textContent = 'Найден самый дешёвый путь.';
    }
  }

  // --- Рисование мышкой и пальцем ---
  function cellFromPoint(x, y) {
    const target = document.elementFromPoint(x, y);
    const cell = target?.closest?.('.cell');
    return cell && gridEl.contains(cell) ? Number(cell.dataset.idx) : null;
  }

  function paintCell(idx) {
    if (idx === state.start || idx === state.end) return;
    const mode = state.drag.mode;
    state.walls.delete(idx);
    state.weights.delete(idx);
    if (mode === 'wall') state.walls.add(idx);
    if (mode === 'weight') state.weights.add(idx);
    state.cells[idx].className = cellClass(idx);
  }

  gridEl.addEventListener('pointerdown', (event) => {
    const idx = cellFromPoint(event.clientX, event.clientY);
    if (idx === null) return;
    event.preventDefault();
    if (player.playing) player.pause();
    if (!state.live) resetSearch();
    gridEl.setPointerCapture(event.pointerId);
    if (idx === state.start || idx === state.end) {
      state.drag = { kind: idx === state.start ? 'start' : 'end', last: idx };
      return;
    }
    // Если кликнули по уже нарисованной стене тем же инструментом — стираем.
    let mode = state.tool;
    if (mode === 'wall' && state.walls.has(idx)) mode = 'erase';
    if (mode === 'weight' && state.weights.has(idx)) mode = 'erase';
    state.drag = { kind: 'paint', mode, last: idx };
    paintCell(idx);
    if (state.live) liveUpdate();
  });

  gridEl.addEventListener('pointermove', (event) => {
    if (!state.drag) return;
    const idx = cellFromPoint(event.clientX, event.clientY);
    if (idx === null || idx === state.drag.last) return;
    state.drag.last = idx;
    if (state.drag.kind === 'paint') {
      paintCell(idx);
    } else {
      const other = state.drag.kind === 'start' ? state.end : state.start;
      if (idx === other || state.walls.has(idx)) return;
      state.weights.delete(idx);
      state[state.drag.kind] = idx;
      paintAll();
    }
    if (state.live) liveUpdate();
  });

  const endDrag = () => {
    state.drag = null;
  };
  gridEl.addEventListener('pointerup', endDrag);
  gridEl.addEventListener('pointercancel', endDrag);

  // --- Кнопки ---
  $('algos').addEventListener('click', (event) => {
    const button = event.target.closest('[data-algo]');
    if (!button) return;
    selectAlgo(button.dataset.algo);
    if (state.live) liveUpdate();
  });
  $('tools').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tool]');
    if (!button) return;
    state.tool = button.dataset.tool;
    $('tools')
      .querySelectorAll('[data-tool]')
      .forEach((b) => b.setAttribute('aria-checked', String(b === button)));
  });
  $('maze').addEventListener('click', () => {
    const maze = generateMaze(state.rows, state.cols, rng);
    state.walls = maze.walls;
    state.weights.clear();
    state.start = maze.start;
    state.end = maze.end;
    // Немного «болота» в проходах, чтобы алгоритмы отличались сильнее.
    for (let i = 0; i < state.rows * state.cols; i++) {
      if (!state.walls.has(i) && i !== state.start && i !== state.end && rng() < 0.07) state.weights.add(i);
    }
    resetSearch();
  });
  $('clear-path').addEventListener('click', resetSearch);
  $('clear-all').addEventListener('click', buildGrid);
  $('compare').addEventListener('click', () => {
    const grid = gridData();
    const rows = Object.entries(PATH_ALGORITHMS).map(([key, algo]) => ({ key, algo, r: algo.run(grid) }));
    const best = rows.find((x) => x.key === 'dijkstra').r.cost;
    $('compare-table').innerHTML = `
      <table>
        <thead><tr><th>Алгоритм</th><th>Осмотрено</th><th>Стоимость</th></tr></thead>
        <tbody>
          ${rows
            .map(
              ({ algo, r }) => `<tr>
                <td>${algo.name}</td>
                <td>${r.visited.length}</td>
                <td>${r.found ? `${r.cost} ${r.cost === best ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'}` : 'нет пути'}</td>
              </tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <p class="muted small">Меньше «осмотрено» — алгоритм быстрее. ✓ — найден самый дешёвый путь.</p>`;
  });

  // Кнопка «Старт» запускает поиск заново, если он ещё не посчитан.
  const playButton = root.querySelector('[data-pb="play"]');
  playButton.addEventListener(
    'click',
    (event) => {
      if (state.events.length <= 1) {
        event.stopImmediatePropagation();
        run();
      }
    },
    true,
  );

  function selectAlgo(key) {
    state.algo = key;
    const algo = PATH_ALGORITHMS[key];
    $('algos')
      .querySelectorAll('[data-algo]')
      .forEach((b) => b.setAttribute('aria-checked', String(b.dataset.algo === key)));
    $('title').textContent = algo.name;
    $('description').textContent = algo.description;
  }

  let lastLayout = gridSize().cols;
  window.addEventListener('resize', () => {
    const cols = gridSize().cols;
    // Пересоздаём поле под новый экран, только если пользователь ещё ничего не нарисовал.
    const untouched = state.walls.size === 0 && state.weights.size === 0 && state.events.length <= 1;
    if (cols !== lastLayout && untouched) {
      lastLayout = cols;
      buildGrid();
    }
  });

  selectAlgo(state.algo);
  buildGrid();

  return {
    onHide: () => player.pause(),
    onKey: (event) => {
      if (event.key === ' ' && state.events.length <= 1) {
        event.preventDefault();
        run();
      } else {
        playback.handleKey(event);
      }
    },
  };
}

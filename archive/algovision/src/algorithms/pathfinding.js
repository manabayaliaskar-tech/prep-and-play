// Поиск пути на клеточном поле.
// Поле: { rows, cols, start, end, walls: Set, weights: Set }. Клетка задаётся номером idx = row * cols + col.
// Каждый алгоритм возвращает { visited, path, found, cost }:
//   visited — порядок, в котором алгоритм «осматривал» клетки (для анимации);
//   path    — найденный путь от старта до финиша (или пустой массив).

import { MinHeap } from '../core/heap.js';

export const WEIGHT_COST = 5;

export function cellCost(grid, idx) {
  return grid.weights.has(idx) ? WEIGHT_COST : 1;
}

export function neighbors(grid, idx) {
  const { rows, cols, walls } = grid;
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const result = [];
  if (r > 0) result.push(idx - cols); // вверх
  if (c < cols - 1) result.push(idx + 1); // вправо
  if (r < rows - 1) result.push(idx + cols); // вниз
  if (c > 0) result.push(idx - 1); // влево
  return result.filter((n) => !walls.has(n));
}

export function manhattan(grid, a, b) {
  const { cols } = grid;
  return Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) + Math.abs((a % cols) - (b % cols));
}

function buildResult(grid, visited, parent, found) {
  const path = [];
  let cost = 0;
  if (found) {
    for (let cur = grid.end; cur !== undefined; cur = parent.get(cur)) {
      path.push(cur);
      if (cur !== grid.start) cost += cellCost(grid, cur);
    }
    path.reverse();
  }
  return { visited, path, found, cost: found ? cost : null };
}

export function bfs(grid) {
  const visited = [];
  const parent = new Map();
  const seen = new Set([grid.start]);
  const queue = [grid.start];
  let head = 0;
  let found = false;
  while (head < queue.length) {
    const cur = queue[head++];
    visited.push(cur);
    if (cur === grid.end) {
      found = true;
      break;
    }
    for (const n of neighbors(grid, cur)) {
      if (!seen.has(n)) {
        seen.add(n);
        parent.set(n, cur);
        queue.push(n);
      }
    }
  }
  return buildResult(grid, visited, parent, found);
}

export function dfs(grid) {
  const visited = [];
  const parent = new Map();
  const seen = new Set();
  const stack = [grid.start];
  let found = false;
  while (stack.length > 0) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    visited.push(cur);
    if (cur === grid.end) {
      found = true;
      break;
    }
    const ns = neighbors(grid, cur);
    for (let k = ns.length - 1; k >= 0; k--) {
      const n = ns[k];
      if (!seen.has(n)) {
        // Последний положенный в стек родитель — тот, из которого клетку и достанут.
        parent.set(n, cur);
        stack.push(n);
      }
    }
  }
  return buildResult(grid, visited, parent, found);
}

function bestFirst(grid, heuristic) {
  const visited = [];
  const parent = new Map();
  const dist = new Map([[grid.start, 0]]);
  const done = new Set();
  let seq = 0;
  // Сравнение должно вернуть true/false: «a идёт раньше b?»
  const heap = new MinHeap((a, b) => (a.f - b.f || a.h - b.h || a.seq - b.seq) < 0);
  heap.push({ idx: grid.start, g: 0, h: heuristic(grid.start), f: heuristic(grid.start), seq: seq++ });
  let found = false;
  while (heap.size > 0) {
    const { idx, g } = heap.pop();
    if (done.has(idx)) continue;
    done.add(idx);
    visited.push(idx);
    if (idx === grid.end) {
      found = true;
      break;
    }
    for (const n of neighbors(grid, idx)) {
      if (done.has(n)) continue;
      const ng = g + cellCost(grid, n);
      if (ng < (dist.get(n) ?? Infinity)) {
        dist.set(n, ng);
        parent.set(n, idx);
        const h = heuristic(n);
        heap.push({ idx: n, g: ng, h, f: ng + h, seq: seq++ });
      }
    }
  }
  return buildResult(grid, visited, parent, found);
}

export function dijkstra(grid) {
  return bestFirst(grid, () => 0);
}

export function aStar(grid) {
  return bestFirst(grid, (idx) => manhattan(grid, idx, grid.end));
}

export const PATH_ALGORITHMS = {
  astar: {
    name: 'A* (A-звезда)',
    run: aStar,
    weighted: true,
    shortest: true,
    description:
      'Дейкстра + «подсказка»: оценивает, сколько ещё осталось до финиша, и в первую очередь идёт в его сторону. Так работают навигаторы и игры.',
  },
  dijkstra: {
    name: 'Дейкстра',
    run: dijkstra,
    weighted: true,
    shortest: true,
    description:
      'Расширяется от старта по возрастанию стоимости пути. Учитывает «болото» и всегда находит самый дешёвый путь.',
  },
  bfs: {
    name: 'Поиск в ширину (BFS)',
    run: bfs,
    weighted: false,
    shortest: true,
    description:
      'Обходит поле «волной» с помощью очереди. Находит путь с наименьшим числом шагов, но не замечает «болото».',
  },
  dfs: {
    name: 'Поиск в глубину (DFS)',
    run: dfs,
    weighted: false,
    shortest: false,
    description:
      'Идёт как можно дальше в одну сторону с помощью стека и возвращается назад в тупиках. Путь находит, но часто длинный.',
  },
};

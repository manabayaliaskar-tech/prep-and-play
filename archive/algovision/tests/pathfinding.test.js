import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATH_ALGORITHMS, bfs, dijkstra, aStar, dfs, neighbors, cellCost } from '../src/algorithms/pathfinding.js';
import { generateMaze } from '../src/algorithms/maze.js';
import { createRng } from '../src/core/random.js';

const makeGrid = (rows, cols, start, end, walls = [], weights = []) => ({
  rows,
  cols,
  start,
  end,
  walls: new Set(walls),
  weights: new Set(weights),
});

function assertValidPath(grid, path) {
  assert.equal(path[0], grid.start);
  assert.equal(path.at(-1), grid.end);
  for (let i = 1; i < path.length; i++) {
    assert.ok(neighbors(grid, path[i - 1]).includes(path[i]), 'соседние клетки');
    assert.ok(!grid.walls.has(path[i]), 'путь не проходит сквозь стены');
  }
}

test('BFS на пустом поле находит путь длиной в манхэттенское расстояние', () => {
  const grid = makeGrid(5, 7, 0, 34);
  const { path, found } = bfs(grid);
  assert.ok(found);
  assert.equal(path.length, 4 + 6 + 1);
  assertValidPath(grid, path);
});

test('на пустом поле без болота все кратчайшие алгоритмы совпадают с BFS', () => {
  for (const [rows, cols, start, end] of [
    [3, 5, 5, 9],
    [5, 5, 0, 4],
    [21, 41, 418, 442],
    [23, 17, 0, 23 * 17 - 1],
  ]) {
    const grid = makeGrid(rows, cols, start, end);
    const best = bfs(grid).cost;
    assert.equal(dijkstra(grid).cost, best);
    assert.equal(aStar(grid).cost, best);
  }
});

test('все алгоритмы сообщают, что пути нет, если финиш замурован', () => {
  // финиш в правом нижнем углу (24) окружён стенами 19 и 23
  const grid = makeGrid(5, 5, 0, 24, [19, 23]);
  for (const algo of Object.values(PATH_ALGORITHMS)) {
    const result = algo.run(grid);
    assert.equal(result.found, false);
    assert.deepEqual(result.path, []);
    assert.equal(result.cost, null);
  }
});

test('Дейкстра обходит болото, если обход дешевле', () => {
  // 3×5, старт слева в середине, финиш справа; в середине среднего ряда болото
  const grid = makeGrid(3, 5, 5, 9, [], [7]);
  const result = dijkstra(grid);
  assert.ok(!result.path.includes(7));
  assert.equal(result.cost, 6);
  assert.equal(cellCost(grid, 7), 5);
});

test('A* и Дейкстра находят путь одинаковой стоимости на случайных полях', () => {
  const rng = createRng(123);
  for (let k = 0; k < 150; k++) {
    const rows = 9;
    const cols = 13;
    const walls = [];
    const weights = [];
    for (let i = 0; i < rows * cols; i++) {
      const v = rng();
      if (v < 0.25) walls.push(i);
      else if (v < 0.4) weights.push(i);
    }
    const grid = makeGrid(rows, cols, 0, rows * cols - 1, walls, weights);
    grid.walls.delete(grid.start);
    grid.walls.delete(grid.end);
    const d = dijkstra(grid);
    const a = aStar(grid);
    assert.equal(a.found, d.found);
    assert.equal(a.cost, d.cost);
    if (a.found) {
      assertValidPath(grid, a.path);
      assertValidPath(grid, d.path);
      assert.ok(a.visited.length <= d.visited.length, 'A* осматривает не больше клеток');
      const b = bfs(grid);
      assert.ok(d.cost <= b.cost, 'Дейкстра не дороже BFS');
      assert.ok(d.cost <= dfs(grid).cost, 'Дейкстра не дороже DFS');
      assert.ok(b.path.length <= a.path.length, 'BFS — минимум шагов');
      assertValidPath(grid, dfs(grid).path);
    }
  }
});

test('лабиринт: старт и финиш свободны и соединены', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const rows = 21;
    const cols = 41;
    const { walls, start, end } = generateMaze(rows, cols, createRng(seed));
    assert.ok(!walls.has(start) && !walls.has(end));
    const result = bfs(makeGrid(rows, cols, start, end, [...walls]));
    assert.ok(result.found, `seed ${seed}`);
  }
});

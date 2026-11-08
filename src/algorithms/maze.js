// Генерация лабиринта методом «рекурсивного возврата» (randomized DFS).
// Клетки с нечётными координатами — «комнаты», между ними прорубаются проходы.

import { shuffle } from '../core/random.js';

/**
 * @param rows, cols — нечётные числа (иначе крайний ряд будет сплошной стеной)
 * @param loops — доля дополнительных проходов: чтобы у лабиринта было несколько путей
 * @returns { walls: Set, start, end }
 */
export function generateMaze(rows, cols, rng, { loops = 0.08 } = {}) {
  const idx = (r, c) => r * cols + c;
  const walls = new Set();
  for (let i = 0; i < rows * cols; i++) walls.add(i);

  const inside = (r, c) => r > 0 && c > 0 && r < rows - 1 && c < cols - 1;
  const stack = [[1, 1]];
  walls.delete(idx(1, 1));
  const directions = [
    [-2, 0],
    [0, 2],
    [2, 0],
    [0, -2],
  ];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const options = shuffle(directions, rng).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return inside(nr, nc) && walls.has(idx(nr, nc));
    });
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const [dr, dc] = options[0];
    walls.delete(idx(r + dr / 2, c + dc / 2));
    walls.delete(idx(r + dr, c + dc));
    stack.push([r + dr, c + dc]);
  }

  // Убираем часть внутренних стен между комнатами, чтобы появились альтернативные пути.
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const between = (r % 2 === 1 && c % 2 === 0) || (r % 2 === 0 && c % 2 === 1);
      if (between && walls.has(idx(r, c)) && rng() < loops) walls.delete(idx(r, c));
    }
  }

  const start = idx(1, 1);
  const end = idx(rows - 2 - ((rows - 1) % 2), cols - 2 - ((cols - 1) % 2));
  walls.delete(start);
  walls.delete(end);
  return { walls, start, end };
}

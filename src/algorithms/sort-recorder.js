// «Записывающее устройство» для сортировок.
// Алгоритм сортирует массив как обычно, но каждое действие (сравнение, обмен, запись)
// сохраняется как шаг со снимком массива. Интерфейс потом просто проигрывает эти шаги.

export class SortRecorder {
  constructor(input) {
    this.array = [...input];
    this.steps = [];
    this.comparisons = 0;
    this.swaps = 0;
    this.writes = 0;
    this.sorted = new Set();
    this.range = null;
    this.marker = null;
    this.#push(
      'start',
      [],
      -1,
      `Исходный массив из ${this.array.length} элементов. Нажми «Старт» или стрелку →, чтобы сделать первый шаг.`,
    );
  }

  #push(type, indices, line, text, extra = {}) {
    this.steps.push({
      type,
      indices,
      line,
      text,
      array: [...this.array],
      sorted: [...this.sorted],
      range: this.range,
      marker: this.marker,
      comparisons: this.comparisons,
      swaps: this.swaps,
      writes: this.writes,
      ...extra,
    });
  }

  /** Подсвечивает рабочий отрезок [lo, hi]; остальное приглушается. */
  setRange(lo, hi) {
    this.range = [lo, hi];
  }

  clearRange() {
    this.range = null;
  }

  /** Особый элемент: текущий минимум, опорный элемент, позиция записи. */
  setMarker(index) {
    this.marker = index;
  }

  /**
   * Сравнение. question — вопрос для режима «Угадай шаг»:
   * { text: 'Поменяются ли местами 5 и 3?', answer: true }
   */
  compare(indices, line, text, question) {
    this.comparisons += 1;
    this.#push('compare', indices, line, text, question ? { question } : {});
  }

  swap(i, j, line, text) {
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
    this.swaps += 1;
    this.#push('swap', [i, j], line, text);
  }

  write(index, value, line, text) {
    this.array[index] = value;
    this.writes += 1;
    this.#push('write', [index], line, text);
  }

  pivot(index, line, text) {
    this.#push('pivot', [index], line, text);
  }

  /** Отмечает элементы, стоящие на своих окончательных местах. Шаг создаётся, только если есть текст. */
  markSorted(indices, line, text) {
    indices.forEach((i) => this.sorted.add(i));
    if (text) this.#push('sorted', indices, line, text);
  }

  note(line, text, indices = []) {
    this.#push('note', indices, line, text);
  }

  finish() {
    this.range = null;
    this.marker = null;
    this.array.forEach((_, i) => this.sorted.add(i));
    const extra = this.writes > 0 ? `, ${this.writes} записей` : '';
    this.#push(
      'done',
      [],
      -1,
      `Готово! Массив отсортирован: ${this.comparisons} сравнений, ${this.swaps} обменов${extra}.`,
    );
    return this.steps;
  }
}

/** Типы шагов, которые считаются «операциями» (используется в режиме «Гонка»). */
export const OPERATION_TYPES = new Set(['compare', 'swap', 'write']);

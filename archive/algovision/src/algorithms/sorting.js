// Пять классических сортировок. Каждая принимает массив чисел
// и возвращает список шагов для визуализации (исходный массив не изменяется).

import { SortRecorder } from './sort-recorder.js';

export function bubbleSort(input) {
  const r = new SortRecorder(input);
  const a = r.array;
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    r.setRange(0, n - 1 - i);
    for (let j = 0; j < n - 1 - i; j++) {
      const x = a[j];
      const y = a[j + 1];
      const willSwap = x > y;
      r.compare(
        [j, j + 1],
        3,
        willSwap
          ? `Сравниваем ${x} и ${y}: ${x} > ${y}, значит их нужно поменять местами.`
          : `Сравниваем ${x} и ${y}: ${x} ≤ ${y}, порядок правильный — ничего не делаем.`,
        { text: `Поменяются ли местами ${x} и ${y}?`, answer: willSwap },
      );
      if (willSwap) {
        r.swap(j, j + 1, 4, `Меняем местами ${x} и ${y} — большее число «всплывает» вправо.`);
        swapped = true;
      }
    }
    r.clearRange();
    r.markSorted(
      [n - 1 - i],
      0,
      `Проход №${i + 1} завершён: число ${a[n - 1 - i]} всплыло на своё окончательное место.`,
    );
    if (!swapped) {
      r.note(5, 'За весь проход не было ни одного обмена — массив уже отсортирован, заканчиваем досрочно.');
      break;
    }
  }
  return r.finish();
}

export function selectionSort(input) {
  const r = new SortRecorder(input);
  const a = r.array;
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.setRange(i, n - 1);
    r.setMarker(min);
    r.note(1, `Ищем минимум среди элементов начиная с позиции ${i}. Пока минимум — ${a[min]}.`, [i]);
    for (let j = i + 1; j < n; j++) {
      const isLess = a[j] < a[min];
      r.compare(
        [j, min],
        3,
        isLess ? `${a[j]} < ${a[min]} — нашли новый минимум.` : `${a[j]} ≥ ${a[min]} — минимум не меняется.`,
        { text: `Станет ли ${a[j]} новым минимумом (сейчас минимум ${a[min]})?`, answer: isLess },
      );
      if (isLess) {
        min = j;
        r.setMarker(min);
      }
    }
    r.setMarker(null);
    if (min !== i) {
      r.swap(i, min, 4, `Ставим минимум ${a[min]} на позицию ${i} (меняем его с ${a[i]}).`);
    } else {
      r.note(4, `Минимум ${a[i]} уже стоит на позиции ${i} — обмен не нужен.`, [i]);
    }
    r.markSorted([i]);
  }
  r.clearRange();
  return r.finish();
}

export function insertionSort(input) {
  const r = new SortRecorder(input);
  const a = r.array;
  const n = a.length;
  for (let i = 1; i < n; i++) {
    r.setRange(0, i);
    r.note(1, `Берём ${a[i]} и вставляем его в уже упорядоченную левую часть.`, [i]);
    let j = i;
    while (j > 0) {
      const x = a[j - 1];
      const y = a[j];
      const needSwap = x > y;
      r.compare(
        [j - 1, j],
        2,
        needSwap ? `${x} > ${y} — сдвигаем ${y} левее.` : `${x} ≤ ${y} — ${y} нашёл своё место.`,
        { text: `Сдвинется ли ${y} левее числа ${x}?`, answer: needSwap },
      );
      if (!needSwap) break;
      r.swap(j - 1, j, 3, `Меняем ${x} и ${y} местами.`);
      j -= 1;
    }
  }
  r.clearRange();
  return r.finish();
}

export function mergeSort(input) {
  const r = new SortRecorder(input);
  const a = r.array;

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    r.setRange(lo, hi);
    r.note(2, `Делим отрезок [${lo}…${hi}] пополам: [${lo}…${mid}] и [${mid + 1}…${hi}].`);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    r.setRange(lo, hi);
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    r.note(4, `Сливаем две упорядоченные половины: [${left.join(', ')}] и [${right.join(', ')}].`);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      const takeLeft = left[i] <= right[j];
      r.setMarker(k);
      r.compare(
        [],
        4,
        takeLeft
          ? `${left[i]} ≤ ${right[j]} — берём ${left[i]} из левой половины.`
          : `${right[j]} < ${left[i]} — берём ${right[j]} из правой половины.`,
        { text: `Следующим запишем ${left[i]} из левой половины (а не ${right[j]} из правой)?`, answer: takeLeft },
      );
      const value = takeLeft ? left[i++] : right[j++];
      r.write(k, value, 5, `Записываем ${value} на позицию ${k}.`);
      k += 1;
    }
    while (i < left.length) {
      r.setMarker(k);
      const value = left[i++];
      r.write(k, value, 5, `Правая половина закончилась — переносим ${value} на позицию ${k}.`);
      k += 1;
    }
    while (j < right.length) {
      r.setMarker(k);
      const value = right[j++];
      r.write(k, value, 5, `Левая половина закончилась — переносим ${value} на позицию ${k}.`);
      k += 1;
    }
    r.setMarker(null);
  }

  sort(0, a.length - 1);
  return r.finish();
}

export function quickSort(input) {
  const r = new SortRecorder(input);
  const a = r.array;

  function quick(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      r.setRange(lo, hi);
      r.markSorted([lo], 0, `В отрезке один элемент (${a[lo]}) — он уже на своём месте.`);
      return;
    }
    r.setRange(lo, hi);
    r.setMarker(hi);
    const p = a[hi];
    r.pivot(hi, 1, `Опорный элемент — ${p} (последний в отрезке [${lo}…${hi}]). Всё, что меньше, отправим влево.`);
    let i = lo;
    for (let j = lo; j < hi; j++) {
      const less = a[j] < p;
      r.compare(
        [j, hi],
        3,
        less ? `${a[j]} < ${p} — элемент идёт в левую часть.` : `${a[j]} ≥ ${p} — элемент остаётся справа.`,
        { text: `${a[j]} меньше опорного ${p}?`, answer: less },
      );
      if (less) {
        if (i !== j) r.swap(i, j, 4, `Перекладываем ${a[j]} в левую часть (меняем с ${a[i]}).`);
        i += 1;
      }
    }
    r.setMarker(null);
    if (i !== hi) r.swap(i, hi, 5, `Ставим опорный ${p} между частями — на позицию ${i}.`);
    r.markSorted([i], 5, `Опорный ${p} стоит на своём окончательном месте: слева всё меньше, справа — не меньше.`);
    quick(lo, i - 1);
    quick(i + 1, hi);
  }

  quick(0, a.length - 1);
  return r.finish();
}

export const SORTING_ALGORITHMS = {
  bubble: {
    name: 'Пузырьком',
    run: bubbleSort,
    description:
      'Идём по массиву и меняем соседей, если они стоят неправильно. Большие числа «всплывают» вправо, как пузырьки.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', memory: 'O(1)', stable: true },
    pseudocode: [
      'для i = 0 … n−2:',
      '  обменов = 0',
      '  для j = 0 … n−2−i:',
      '    если a[j] > a[j+1]:',
      '      поменять a[j] ↔ a[j+1]; обменов++',
      '  если обменов = 0: стоп',
    ],
  },
  selection: {
    name: 'Выбором',
    run: selectionSort,
    description: 'Находим минимум в неотсортированной части и ставим его в начало. Повторяем, пока часть не кончится.',
    complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', memory: 'O(1)', stable: false },
    pseudocode: [
      'для i = 0 … n−2:',
      '  min = i',
      '  для j = i+1 … n−1:',
      '    если a[j] < a[min]: min = j',
      '  поменять a[i] ↔ a[min]',
    ],
  },
  insertion: {
    name: 'Вставками',
    run: insertionSort,
    description:
      'Как сортировка карт в руке: берём следующее число и сдвигаем его влево, пока оно не встанет на место.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', memory: 'O(1)', stable: true },
    pseudocode: [
      'для i = 1 … n−1:',
      '  j = i',
      '  пока j > 0 и a[j−1] > a[j]:',
      '    поменять a[j−1] ↔ a[j]; j = j−1',
    ],
  },
  merge: {
    name: 'Слиянием',
    run: mergeSort,
    description:
      '«Разделяй и властвуй»: делим массив пополам, сортируем половины и сливаем их, каждый раз беря меньший элемент.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', memory: 'O(n)', stable: true },
    pseudocode: [
      'сортировка(lo, hi):',
      '  если lo ≥ hi: выход',
      '  mid = (lo+hi)/2',
      '  сортировка(lo, mid); сортировка(mid+1, hi)',
      '  слить: сравнить начала половин',
      '    a[k] = меньший из двух; k++',
    ],
  },
  quick: {
    name: 'Быстрая',
    run: quickSort,
    description:
      'Выбираем опорный элемент, меньшие числа отправляем влево, большие — вправо. Затем то же самое для каждой части.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', memory: 'O(log n)', stable: false },
    pseudocode: [
      'быстрая(lo, hi): если lo ≥ hi — выход',
      '  опорный = a[hi]; i = lo',
      '  для j = lo … hi−1:',
      '    если a[j] < опорный:',
      '      поменять a[i] ↔ a[j]; i++',
      '  поменять a[i] ↔ a[hi]',
      '  быстрая(lo, i−1); быстрая(i+1, hi)',
    ],
  },
};

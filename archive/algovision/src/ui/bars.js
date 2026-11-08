// Отрисовка массива в виде столбиков. Используется и в «Сортировках», и в «Гонке».

export function createBars(container, count, { showValues = false } = {}) {
  container.replaceChildren();
  container.style.setProperty('--count', count);
  container.classList.toggle('show-values', showValues);
  const bars = [];
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.setProperty('--i', i);
    const label = document.createElement('span');
    label.className = 'bar-value';
    bar.append(label);
    container.append(bar);
    bars.push(bar);
  }
  return bars;
}

export function renderBars(bars, step, maxValue) {
  const sorted = new Set(step.sorted);
  const active = new Set(step.indices);
  const [lo, hi] = step.range ?? [0, bars.length - 1];
  const done = step.type === 'done';

  bars.forEach((bar, i) => {
    const value = step.array[i];
    bar.style.height = `${Math.max(3, (value / maxValue) * 100)}%`;
    bar.firstChild.textContent = value;

    let state = '';
    if (active.has(i)) {
      if (step.type === 'swap') state = 'is-swap';
      else if (step.type === 'write') state = 'is-write';
      else if (step.type === 'compare') state = 'is-compare';
      else if (step.type === 'pivot') state = 'is-marker';
      else if (step.type === 'sorted') state = 'is-sorted is-flash';
      else state = 'is-focus';
    } else if (step.marker === i) {
      state = 'is-marker';
    } else if (sorted.has(i)) {
      state = 'is-sorted';
    }
    const dim = !done && !sorted.has(i) && (i < lo || i > hi) ? ' is-dim' : '';
    bar.className = `bar ${state}${dim}${done ? ' is-done' : ''}`;
  });
}

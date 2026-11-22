// Почему клетки маленькие: S/V куба, график S/V = 6/a, деление на мелкие клетки, глубина диффузии, задания.
const DIFF = 1; // за отведённое время вещества проникают на 1 мкм вглубь
const cubePic = (x, y, s, cls = 'exc-g') => {
  const d = s * 0.42;
  return `<path class="ex-fill ${cls}" style="opacity:.35" d="M${n1(x)} ${n1(y)} h${n1(s)} v${n1(s)} h${n1(-s)} Z"/><path class="ex-fill ${cls}" style="opacity:.55" d="M${n1(x)} ${n1(y)} l${n1(d)} ${n1(-d)} h${n1(s)} l${n1(-d)} ${n1(d)} Z"/><path class="ex-fill ${cls}" style="opacity:.75" d="M${n1(x + s)} ${n1(y)} l${n1(d)} ${n1(-d)} v${n1(s)} l${n1(-d)} ${n1(d)} Z"/>`;
};
const csTask = () => (Math.random() < 0.5 ? { type: 0, r: pick([1, 1.5, 2, 3, 6]) } : { type: 1, a: 8, r: pick([1.5, 2.25, 3]) });

//@@SCENE
  cellsize: {
    title: L('Why cells are small', 'Почему клетки маленькие', 'Жасушалар неге кішкентай'),
    intro: L('A cell takes in food and oxygen through its surface, but needs them in its whole volume. When a cell grows, V grows faster than S.', 'Клетка получает пищу и кислород через поверхность, а нужны они всему объёму. Когда клетка растёт, V растёт быстрее, чем S.', 'Жасуша қорек пен оттекті беті арқылы алады, ал олар бүкіл көлемге керек. Жасуша өскенде V S-тен тез өседі.'),
    sliders: [
      { id: 'a', label: L('side a, µm', 'сторона a, мкм', 'қыры a, мкм'), min: 1, max: 10, step: 0.5, value: 4, hidden: (v, st) => st.m === 2 && st.task.type === 1 },
      { id: 'n', label: L('split into n³ cells', 'делим на n³ клеток', 'n³ жасушаға бөлеміз'), min: 1, max: 4, step: 1, value: 2, hidden: (v, st) => st.m === 0 || (st.m === 2 && st.task.type === 0) },
    ],
    buttons: [L('One cell', 'Одна клетка', 'Бір жасуша'), L('Divide', 'Деление', 'Бөліну'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 2) return null;
      st.task = csTask();
      return st.task.type === 1 ? { a: 8, n: 1 } : { a: 10 };
    },
    draw(v, step, st) {
      const task = st.m === 2 ? st.task : null;
      const split = task ? task.type === 1 : st.m === 1;
      const n = split ? Math.round(v.n) : 1;
      const a = v.a;
      const b = a / n;
      const S = 6 * b * b * n ** 3;
      const V = a ** 3;
      const r = S / V;
      const fed = b <= 2 * DIFF ? 1 : 1 - ((b - 2 * DIFF) / b) ** 3;
      // Картинка: куб (или кубики), снаружи слой, куда доходит кислород.
      const side = 10 * a;
      const x0 = 76 - side / 2;
      const y0 = 130 - side / 2;
      let pic = '';
      if (n === 1) {
        pic = cubePic(x0, y0, side);
        const inner = Math.max(0, side - 2 * DIFF * 10);
        if (inner > 0) pic += `<rect x="${n1(x0 + DIFF * 10)}" y="${n1(y0 + DIFF * 10)}" width="${n1(inner)}" height="${n1(inner)}" class="ex-fill exc-r" style="opacity:.35"/>`;
      } else {
        const sb = side / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            pic += cubePic(x0 + j * sb * 1.08, y0 + i * sb * 1.08, sb * 0.92);
            const inner = Math.max(0, sb * 0.92 - 2 * DIFF * 10);
            if (inner > 0) pic += `<rect x="${n1(x0 + j * sb * 1.08 + DIFF * 10)}" y="${n1(y0 + i * sb * 1.08 + DIFF * 10)}" width="${n1(inner)}" height="${n1(inner)}" class="ex-fill exc-r" style="opacity:.35"/>`;
          }
      }
      // График S/V = 6/a.
      const gx = (x) => 178 + (x - 1) * 14.8;
      const gy = (y) => 186 - y * 24;
      const curve = plot((x) => 6 / x, 1, 10, gx, gy);
      const svg = `${pic}${tt(76, 214, `${n > 1 ? `${n ** 3} × ` : ''}${fmt(b, 2)} ${u('µm', 'мкм', 'мкм')}`, 'exs-t')}
        <line class="ex-axis" x1="178" y1="186" x2="314" y2="186"/><line class="ex-axis" x1="178" y1="186" x2="178" y2="36"/>${[1, 4, 7, 10].map((x) => tt(gx(x), 199, String(x), 'exs-s')).join('')}${tt(312, 212, `a, ${u('µm', 'мкм', 'мкм')}`, 'exs-s ex-end')}${tt(182, 40, 'S/V', 'exs-s ex-start')}
        <path class="ex-curve" d="${curve}"/><circle class="ex-dot" cx="${n1(gx(clamp(b, 1, 10)))}" cy="${n1(gy(6 / clamp(b, 1, 10)))}" r="5"/>
        ${box(198, 4, 118, 76)}${tt(204, 18, `S = ${fmt(S, 1)} ${u('µm²', 'мкм²', 'мкм²')}`, 'exs-t ex-start')}${tt(204, 33, `V = ${fmt(V, 1)} ${u('µm³', 'мкм³', 'мкм³')}`, 'exs-t ex-start')}${tt(204, 50, `S/V = ${fmt(r, 2)}`, 'exs-h ex-start tc exc-p')}${tt(204, 70, `${u('supplied', 'снабжается', 'қоректенеді')}: ${fmt(fed * 100, 0)}%`, `exs-s ex-start tc ${fed > 0.9 ? 'exc-g' : 'exc-r'}`)}
        ${tt(6, 16, u('red: oxygen does not reach', 'красное: кислород не доходит', 'қызыл: оттек жетпейді'), 'exs-s ex-start tc exc-r')}`;
      let caption = split && n === 1
        ? u('n = 1: the cell is not divided yet. Move the slider to split it into 8, 27 or 64 small cells.', 'n = 1: клетка ещё не разделена. Двигай ползунок - получится 8, 27 или 64 маленькие клетки.', 'n = 1: жасуша әлі бөлінбеген. Жүгірткіні жылжытсаң - 8, 27 немесе 64 кішкентай жасуша шығады.')
        : split
        ? u(
            `One cell ${fmt(a, 1)} µm split into ${n ** 3} cells of ${fmt(b, 2)} µm: the volume is the same (${fmt(V, 1)} µm³), but the surface grew ${n} times: S/V = 6/${fmt(b, 2)} = ${fmt(r, 2)}. That is why organisms grow by dividing cells, not by making them huge.`,
            `Клетку ${fmt(a, 1)} мкм разделили на ${n ** 3} ${ruN(n ** 3, 'клетку', 'клетки', 'клеток')} по ${fmt(b, 2)} мкм: объём тот же (${fmt(V, 1)} мкм³), а поверхность выросла в ${n} раза: S/V = 6/${fmt(b, 2)} = ${fmt(r, 2)}. Поэтому организм растёт делением клеток, а не их раздуванием.`,
            `${fmt(a, 1)} мкм жасушаны ${fmt(b, 2)} мкм-лік ${n ** 3} жасушаға бөлдік: көлемі сол (${fmt(V, 1)} мкм³), ал беті ${n} есе өсті: S/V = 6/${fmt(b, 2)} = ${fmt(r, 2)}. Сондықтан ағза жасушаларды үлкейтпей, бөліну арқылы өседі.`,
          )
        : u(
            `S = 6a² = ${fmt(S, 1)}, V = a³ = ${fmt(V, 1)}, S/V = 6/a = ${fmt(r, 2)}. Double the side: S grows 4 times, V - 8 times, S/V halves. Oxygen gets only ${DIFF} µm deep, so ${fmt(100 - fed * 100, 0)}% of this cell starves.`,
            `S = 6a² = ${fmt(S, 1)}, V = a³ = ${fmt(V, 1)}, S/V = 6/a = ${fmt(r, 2)}. Увеличь сторону вдвое: S вырастет в 4 раза, V - в 8, S/V уменьшится вдвое. Кислород проникает лишь на ${DIFF} мкм, поэтому ${fmt(100 - fed * 100, 0)}% этой клетки голодает.`,
            `S = 6a² = ${fmt(S, 1)}, V = a³ = ${fmt(V, 1)}, S/V = 6/a = ${fmt(r, 2)}. Қырын екі есе үлкейтсең: S 4 есе, V 8 есе өседі, S/V екі есе азаяды. Оттек тек ${DIFF} мкм тереңдікке жетеді, сондықтан бұл жасушаның ${fmt(100 - fed * 100, 0)}%-ы аш қалады.`,
          );
      if (task) {
        const ok = near(r, task.r, 0.01);
        caption = taskCap(
          task.type === 0 ? u(`choose the side of the cube so that S/V = ${fmt(task.r, 2)}.`, `подбери сторону куба, чтобы S/V = ${fmt(task.r, 2)}.`, `S/V = ${fmt(task.r, 2)} болатындай куб қырын тап.`) : u(`a cell of 8 µm. Into how many cells must it divide so that S/V = ${fmt(task.r, 2)}?`, `клетка 8 мкм. На сколько клеток её разделить, чтобы S/V = ${fmt(task.r, 2)}?`, `8 мкм жасуша. S/V = ${fmt(task.r, 2)} болуы үшін оны неше жасушаға бөлу керек?`),
          ok,
          u(`Now S/V = ${fmt(r, 2)}.`, `Сейчас S/V = ${fmt(r, 2)}.`, `Қазір S/V = ${fmt(r, 2)}.`),
          task.type === 0 ? `a = 6 / ${fmt(task.r, 2)} = ${fmt(6 / task.r, 1)} ${u('µm', 'мкм', 'мкм')}.` : `S/V = 6n/a → n = ${fmt(task.r, 2)} · 8 / 6 = ${fmt((task.r * 8) / 6, 0)}, ${fmt(((task.r * 8) / 6) ** 3, 0)} ${u('cells', 'клеток', 'жасуша')}.`,
        );
        return { svg: svg + taskBadge(ok, 316, 98), caption };
      }
      return { svg, caption };
    },
  },

// Новая сцена: митоз и мейоз по фазам (2n = 4), набор хромосом n и хроматид c, задания на фазы.
const MIT = [
  { name: L('Interphase', 'Интерфаза', 'Интерфаза'), nc: '2n2c → 2n4c', what: L('DNA is copied: each chromosome gets two chromatids.', 'ДНК удваивается: у каждой хромосомы становится две хроматиды.', 'ДНҚ екі еселенеді: әр хромосомада екі хроматида болады.') },
  { name: L('Prophase', 'Профаза', 'Профаза'), nc: '2n4c', what: L('Chromosomes coil up and become visible, the nuclear envelope breaks down, a spindle forms.', 'Хромосомы спирализуются и становятся видны, ядерная оболочка распадается, образуется веретено деления.', 'Хромосомалар спиральданып көрінеді, ядро қабығы ыдырайды, бөліну ұршығы түзіледі.') },
  { name: L('Metaphase', 'Метафаза', 'Метафаза'), nc: '2n4c', what: L('Chromosomes line up on the equator; spindle threads hold each centromere.', 'Хромосомы выстраиваются на экваторе, нити веретена прикреплены к центромерам.', 'Хромосомалар экваторға тізіледі, ұршық жіптері центромераларға бекиді.') },
  { name: L('Anaphase', 'Анафаза', 'Анафаза'), nc: '4n4c', what: L('Sister chromatids separate and move to opposite poles.', 'Сестринские хроматиды расходятся к противоположным полюсам.', 'Апалы-сіңлілі хроматидалар қарама-қарсы полюстерге ажырайды.') },
  { name: L('Telophase', 'Телофаза', 'Телофаза'), nc: '2n2c', what: L('Two nuclei form and the cell divides: two identical daughter cells.', 'Образуются два ядра, клетка делится: две одинаковые дочерние клетки.', 'Екі ядро түзіліп, жасуша бөлінеді: екі бірдей жас жасуша.') },
];
const MEI = [
  { name: L('Prophase I', 'Профаза I', 'Профаза I'), nc: '2n4c', what: L('Homologous chromosomes pair up (conjugation) and swap pieces (crossing over).', 'Гомологичные хромосомы сближаются (конъюгация) и обмениваются участками (кроссинговер).', 'Гомологты хромосомалар жақындасып (конъюгация), бөліктерімен алмасады (кроссинговер).') },
  { name: L('Metaphase I', 'Метафаза I', 'Метафаза I'), nc: '2n4c', what: L('Pairs of homologues (bivalents) line up on the equator.', 'Пары гомологов (биваленты) выстраиваются на экваторе.', 'Гомологтар жұптары (биваленттер) экваторға тізіледі.') },
  { name: L('Anaphase I', 'Анафаза I', 'Анафаза I'), nc: '2n4c', what: L('Whole homologous chromosomes (not chromatids!) go to the poles.', 'К полюсам расходятся целые гомологичные хромосомы (а не хроматиды!).', 'Полюстерге тұтас гомологты хромосомалар (хроматидалар емес!) ажырайды.') },
  { name: L('Telophase I', 'Телофаза I', 'Телофаза I'), nc: 'n2c', what: L('Two cells with a halved set: each chromosome still has two chromatids.', 'Две клетки с уменьшенным вдвое набором: у каждой хромосомы ещё две хроматиды.', 'Жиынтығы екі есе азайған екі жасуша: әр хромосомада әлі екі хроматида.') },
  { name: L('Metaphase II', 'Метафаза II', 'Метафаза II'), nc: 'n2c', what: L('In each cell chromosomes line up on a new equator. No DNA copying before this division.', 'В каждой клетке хромосомы выстраиваются на новом экваторе. ДНК перед этим делением не удваивается.', 'Әр жасушада хромосомалар жаңа экваторға тізіледі. Бұл бөлінуден бұрын ДНҚ екі еселенбейді.') },
  { name: L('Anaphase II', 'Анафаза II', 'Анафаза II'), nc: '2n2c', what: L('Sister chromatids separate, as in mitosis.', 'Сестринские хроматиды расходятся, как в митозе.', 'Апалы-сіңлілі хроматидалар митоздағыдай ажырайды.') },
  { name: L('Telophase II', 'Телофаза II', 'Телофаза II'), nc: 'nc', what: L('Four cells with a single set (n): gametes. Crossing over made them all different.', 'Четыре клетки с одинарным набором (n): гаметы. Из-за кроссинговера все они разные.', 'Жалғыз жиынтықты (n) төрт жасуша: гаметалар. Кроссинговер салдарынан бәрі әртүрлі.') },
];
// Хроматида: [x, y] для каждой из 8 (хромосома j>>1, сторона j&1) по ключевым кадрам.
const mitPos = (st2, j) => {
  const c = j >> 1;
  const s = j & 1 ? 1 : -1;
  const scat = [[140, 92], [180, 98], [146, 132], [184, 126]][c];
  const eqY = [70, 96, 124, 150][c];
  if (st2 === 0) return [scat[0], scat[1]];
  if (st2 === 1) return [scat[0] + s * 3, scat[1]];
  if (st2 === 2) return [160 + s * 3, eqY];
  if (st2 === 3) return [160 + s * 52, eqY];
  return [160 + s * 50, eqY];
};
const meiPos = (st2, j) => {
  const c = j >> 1; // 0,1 - пара длинных; 2,3 - пара коротких
  const s = j & 1 ? 1 : -1;
  const pair = c >> 1;
  const homo = c & 1 ? 1 : -1;
  const y0 = pair ? 132 : 88;
  if (st2 === 0) return [160 + homo * 7 + s * 3, y0];
  if (st2 === 1) return [160 + homo * 10 + s * 3, y0];
  if (st2 === 2) return [160 + homo * 52 + s * 3, y0];
  if (st2 === 3 || st2 === 4) return [160 + homo * 50 + s * 3, y0];
  const cx = 160 + homo * 40 + (pair ? 10 : -10);
  return [cx, s < 0 ? 66 : 152];
};
const chromatid = (x, y, len, cls, thin) => `<rect class="ex-fill ${cls}" x="${n1(x - (thin ? 1.2 : 2.3))}" y="${n1(y - len / 2)}" width="${thin ? 2.4 : 4.6}" height="${n1(len)}" rx="2.3" style="${thin ? 'opacity:.5' : ''}"/>`;
const mitTask = () => {
  const mei = Math.random() < 0.5;
  const list = mei ? MEI : MIT;
  const k = ri(mei ? 0 : 1, list.length - 1);
  return { mei, k };
};

//@@SCENE
  mitosis: {
    title: L('Mitosis and meiosis', 'Митоз и мейоз', 'Митоз және мейоз'),
    intro: L('Mitosis gives two identical cells (2n), meiosis - four gametes with half the set (n). Here 2n = 4: two pairs of homologues.', 'Митоз даёт две одинаковые клетки (2n), мейоз - четыре гаметы с половинным набором (n). Здесь 2n = 4: две пары гомологов.', 'Митоз екі бірдей жасуша (2n) береді, мейоз - жиынтығы жартылай (n) төрт гамета. Мұнда 2n = 4: гомологтардың екі жұбы.'),
    sliders: [{ id: 'k', label: L('division, %', 'деление, %', 'бөліну, %'), min: 0, max: 100, step: 0.5, value: 50 }],
    buttons: [L('▶ Divide', '▶ Делить', '▶ Бөлу'), L('Mitosis', 'Митоз', 'Митоз'), L('Meiosis', 'Мейоз', 'Мейоз'), TASK],
    state: () => ({ mei: false, m: 0, task: null }),
    pressed: (i, v, st) => (i === 1 && !st.mei && st.m === 0) || (i === 2 && st.mei && st.m === 0) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => st.m === 1 && (i === 1 || i === 2),
    onButton(i, st, v, api) {
      if (i === 0) {
        api.play('k', { linear: true, dur: st.mei ? 9000 : 6500 });
        return null;
      }
      if (i < 3) {
        st.m = 0;
        st.mei = i === 2;
        return { k: 0 };
      }
      if (st.m === 1) st.m = 0;
      st.m = 1;
      st.task = mitTask();
      st.mei = st.task.mei;
      return { k: 0 };
    },
    draw(v, step, st) {
      const list = st.mei ? MEI : MIT;
      const n = list.length;
      const x = (clamp(v.k, 0, 99.999) / 100) * n;
      const idx = Math.floor(x);
      const p = x - idx;
      // В пределах фазы: первые 60% - переход от прошлого кадра, остальное - сама фаза.
      const e = clamp(p / 0.6, 0, 1);
      const ee = e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2;
      const pos = st.mei ? meiPos : mitPos;
      const lens = [24, 24, 15, 15];
      const cls = (j) => ((j >> 1) & 1 ? 'exc-b' : 'exc-o');
      let chrom = '';
      for (let j = 0; j < 8; j++) {
        const [x1, y1] = pos(Math.max(0, idx - (idx > 0 ? 1 : 0)), j);
        const [x2, y2] = pos(idx, j);
        const k2 = idx === 0 ? 1 : ee;
        const thin = !st.mei && idx === 0;
        const c = j >> 1;
        // В интерфазе до удвоения хроматиды лежат друг на друге.
        const off = thin ? (j & 1 ? 1 : -1) * 3 * clamp((p - 0.3) / 0.4, 0, 1) : 0;
        chrom += chromatid(lerp(x1, x2, k2) + off, lerp(y1, y2, k2), lens[c] * (thin ? 1.1 : 1), st.mei ? ((c & 1) ? 'exc-b' : 'exc-o') : cls(j), thin);
      }
      // Кроссинговер: цветные кончики у пары в профазе I и дальше.
      let cross = '';
      if (st.mei && (idx > 0 || p > 0.5)) {
        for (const j of [1, 2, 5, 6]) {
          const [cx2, cy2] = (() => {
            const a = meiPos(Math.max(0, idx - (idx > 0 ? 1 : 0)), j);
            const b = meiPos(idx, j);
            const k2 = idx === 0 ? 1 : ee;
            return [lerp(a[0], b[0], k2), lerp(a[1], b[1], k2)];
          })();
          const c = j >> 1;
          const L2 = [24, 24, 15, 15][c];
          cross += `<rect class="ex-fill ${(c & 1) ? 'exc-o' : 'exc-b'}" x="${n1(cx2 - 2.3)}" y="${n1(cy2 + L2 / 2 - 7)}" width="4.6" height="7" rx="2"/>`;
        }
      }
      // Клетки и веретено.
      let cells;
      if (!st.mei) {
        if (idx < 4) cells = `<ellipse class="exs-soft exc-g" cx="160" cy="110" rx="82" ry="66"/>${idx < 2 ? `<circle class="ex-stroke exc-m ex-dash" style="stroke-width:1.5;opacity:${idx === 0 ? 1 : n1(1 - ee)}" cx="160" cy="112" r="42"/>` : ''}`;
        else {
          const sp = ee;
          cells = `<ellipse class="exs-soft exc-g" cx="${n1(160 - 50 * sp)}" cy="110" rx="${n1(82 - 36 * sp)}" ry="66"/><ellipse class="exs-soft exc-g" cx="${n1(160 + 50 * sp)}" cy="110" rx="${n1(82 - 36 * sp)}" ry="66"/>${sp > 0.6 ? '<circle class="ex-stroke exc-m ex-dash" style="stroke-width:1.2" cx="110" cy="110" r="36"/><circle class="ex-stroke exc-m ex-dash" style="stroke-width:1.2" cx="210" cy="110" r="36"/>' : ''}`;
        }
        if (idx === 2 || idx === 3) for (const [px] of [[80], [240]]) for (let j = 0; j < 4; j++) cells += ln(px, 110, idx === 2 ? 160 : 160 + (px < 160 ? -52 : 52), [70, 96, 124, 150][j], 'exc-m ex-faint', 0.8);
      } else if (idx < 3) cells = `<ellipse class="exs-soft exc-g" cx="160" cy="110" rx="82" ry="66"/>${idx === 0 ? `<circle class="ex-stroke exc-m ex-dash" style="stroke-width:1.5;opacity:${n1(1 - p * 0.8)}" cx="160" cy="110" r="44"/>` : ''}`;
      else if (idx < 6) {
        const sp = idx === 3 ? ee : 1;
        cells = `<ellipse class="exs-soft exc-g" cx="${n1(160 - 50 * sp)}" cy="110" rx="${n1(82 - 36 * sp)}" ry="66"/><ellipse class="exs-soft exc-g" cx="${n1(160 + 50 * sp)}" cy="110" rx="${n1(82 - 36 * sp)}" ry="66"/>`;
      } else {
        const sp = ee;
        cells = [-1, 1].map((h) => { const cx = 160 + h * lerp(50, 40, sp); const rx = lerp(46, 36, sp); return `<ellipse class="exs-soft exc-g" cx="${n1(cx)}" cy="${n1(110 - 44 * sp)}" rx="${n1(rx)}" ry="${n1(66 - 36 * sp)}"/><ellipse class="exs-soft exc-g" cx="${n1(cx)}" cy="${n1(110 + 44 * sp)}" rx="${n1(rx)}" ry="${n1(66 - 36 * sp)}"/>`; }).join('');
      }
      if (st.mei && idx === 1) cells += ln(160, 40, 160, 180, 'exc-m ex-dash', 1);
      if (!st.mei && idx === 2) cells += ln(160, 40, 160, 180, 'exc-m ex-dash', 1);
      const ph = list[idx];
      // Шкала фаз внизу.
      const bar = list.map((f, i) => `<rect x="${n1(8 + (i * 304) / n)}" y="200" width="${n1(304 / n - 3)}" height="14" rx="4" class="ex-fill ${i === idx ? 'exc-p' : 'exc-m'}" style="opacity:${i === idx ? 0.9 : 0.2}"/>`).join('');
      const svg = `${cells}${chrom}${cross}${bar}${box(4, 4, 86, 36)}${tt(10, 18, tx(ph.name), 'exs-t ex-start')}${tt(10, 33, ph.nc, 'exs-m ex-start tc exc-p')}${tt(316, 16, st.mei ? u('meiosis', 'мейоз', 'мейоз') : u('mitosis', 'митоз', 'митоз'), 'exs-s ex-end')}`;
      let caption = `${tx(ph.name)} (${ph.nc}). ${tx(ph.what)}`;
      if (st.m === 1) {
        const q = st.task;
        const t2 = (q.mei ? MEI : MIT)[q.k];
        const ok = idx === q.k;
        caption = taskCap(
          u(`(${q.mei ? 'meiosis' : 'mitosis'}) find the phase: «${tx(t2.what)}»`, `(${q.mei ? 'мейоз' : 'митоз'}) найди фазу: «${tx(t2.what)}»`, `(${q.mei ? 'мейоз' : 'митоз'}) фазаны тап: «${tx(t2.what)}»`),
          ok,
          u(`Now: ${tx(ph.name)}. Move the slider.`, `Сейчас: ${tx(ph.name)}. Двигай ползунок.`, `Қазір: ${tx(ph.name)}. Жүгірткіні жылжыт.`),
          `${tx(t2.name)}, ${t2.nc}.`,
        );
        return { svg: svg + taskBadge(ok, 316, 34), caption };
      }
      return { svg, caption };
    },
  },

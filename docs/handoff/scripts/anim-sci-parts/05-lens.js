// Линза: собирающая и рассеивающая, три луча, все классические случаи, формула тонкой линзы, задания.
const LENS_CASES = [
  { k: 3, name: L('d > 2F: camera, eye', 'd > 2F: фотоаппарат, глаз', 'd > 2F: фотоаппарат, көз') },
  { k: 2, name: L('d = 2F: copier', 'd = 2F: копировальный аппарат', 'd = 2F: көшіру аппараты') },
  { k: 1.5, name: L('F < d < 2F: projector', 'F < d < 2F: проектор', 'F < d < 2F: проектор') },
  { k: 1, name: L('d = F: searchlight, no image', 'd = F: прожектор, изображения нет', 'd = F: прожектор, кескін жоқ') },
  { k: 0.5, name: L('d < F: magnifying glass', 'd < F: лупа', 'd < F: лупа') },
];
const LENS_SHOTS = [
  [10, 15, 30], [10, 20, 20], [10, 30, 15], [10, 14, 35], [8, 12, 24], [8, 16, 16], [8, 24, 12], [6, 9, 18], [6, 12, 12], [6, 18, 9],
];
const lensTask = () => {
  const type = ri(0, 4);
  if (type === 3) {
    const [F, d, f] = pick(LENS_SHOTS);
    return { type, F, d, f };
  }
  const F = pick([6, 8, 10, 12]);
  const d = [1.5 * F, 2 * F, F / 2, 0, F][type];
  return { type, F, d };
};
/** Изображение: f (минус - мнимое), увеличение. */
const lensImg = (d, F, div) => {
  if (div) {
    const f = -(d * F) / (d + F);
    return { f, G: -f / d, none: false };
  }
  if (Math.abs(d - F) < 0.01) return { f: Infinity, G: Infinity, none: true };
  const f = (d * F) / (d - F);
  return { f, G: Math.abs(f / d), none: false };
};

//@@SCENE
  lens: {
    title: L('How a lens makes an image', 'Как линза строит изображение', 'Линза кескінді қалай құрады'),
    intro: L('Three easy rays: parallel → through the focus, through the centre → straight, through the focus → parallel. 1/F = 1/d + 1/f.', 'Три удобных луча: параллельный → через фокус, через центр → прямо, через фокус → параллельно. 1/F = 1/d + 1/f.', 'Үш ыңғайлы сәуле: параллель → фокус арқылы, орталық арқылы → түзу, фокус арқылы → параллель. 1/F = 1/d + 1/f.'),
    sliders: [
      { id: 'd', label: L('object distance d, cm', 'до предмета d, см', 'нәрсеге дейін d, см'), min: 2, max: 50, step: 0.5, value: 30 },
      { id: 'F', label: L('focal length F, cm', 'фокус F, см', 'фокус F, см'), min: 5, max: 15, step: 0.5, value: 10, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('Converging', 'Собирающая', 'Жинағыш'), L('Diverging', 'Рассеивающая', 'Шашыратқыш'), L('Next case ↻', 'Следующий случай ↻', 'Келесі жағдай ↻'), TASK, FREE],
    state: () => ({ div: false, c: 0, m: 0, task: null }),
    pressed: (i, v, st) => (i === 0 && !st.div && st.m === 0) || (i === 1 && st.div && st.m === 0) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => (st.m === 1 ? i < 3 : i === 4 || (i === 2 && st.div)),
    onButton(i, st, v) {
      if (i === 0 || i === 1) {
        st.div = i === 1;
        return null;
      }
      if (i === 2) {
        st.c = (st.c + 1) % LENS_CASES.length;
        return { d: LENS_CASES[st.c].k * v.F };
      }
      if (i === 4) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.div = false;
      st.task = lensTask();
      return { F: st.task.F, d: 45 };
    },
    draw(v, step, st) {
      const { d, F } = v;
      const div = st.div;
      // Масштаб: предмет и 3F всегда помещаются слева от линзы.
      const s = 140 / Math.max(d, 3 * F);
      const L0 = 168;
      const ax = 120;
      const h = 34;
      const Xo = L0 - d * s;
      const Yt = ax - h;
      const im = lensImg(d, F, div);
      const real = !im.none && im.f > 0;
      const Xi = L0 + im.f * s;
      const hi = im.none ? 0 : real ? -h * im.G : h * im.G;
      const Yi = ax - hi;
      const Fp = L0 + F * s;
      const Fm = L0 - F * s;
      // Продлить отрезок до края картинки.
      const ext = (x1, y1, x2, y2) => {
        const k = 900 / (Math.hypot(x2 - x1, y2 - y1) || 1);
        return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
      };
      const seg = (pts, cls, dash = false) => `<path class="ex-stroke ${cls}${dash ? ' ex-dash' : ''}" style="stroke-width:${dash ? 1.1 : 1.6}" d="M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join(' L')}"/>`;
      let rays = '';
      let back = '';
      if (!div) {
        rays += seg([[Xo, Yt], [L0, Yt], ext(L0, Yt, Fp, ax)], 'exc-o');
        rays += seg([[Xo, Yt], ext(Xo, Yt, L0, ax)], 'exc-g');
        if (Math.abs(d - F) > 0.3) {
          const y3 = Yt + ((ax - Yt) * (L0 - Xo)) / (Fm - Xo);
          if (Math.abs(y3 - ax) < 95) rays += seg([[Xo, Yt], [L0, y3], [W + 20, y3]], 'exc-k');
          if (!real && Math.abs(y3 - ax) < 95) back += seg([[L0, y3], [Xi, Yi]], 'exc-k', true);
        }
        if (!real && !im.none) back += seg([[L0, Yt], [Xi, Yi]], 'exc-o', true) + seg([[Xo, Yt], [Xi, Yi]], 'exc-g', true);
      } else {
        rays += seg([[Xo, Yt], [L0, Yt], ext(Fm, ax, L0, Yt)], 'exc-o');
        back += seg([[L0, Yt], [Fm, ax]], 'exc-o', true);
        rays += seg([[Xo, Yt], ext(Xo, Yt, L0, ax)], 'exc-g');
        const y3 = Yt + ((ax - Yt) * (L0 - Xo)) / (Fp - Xo);
        rays += seg([[Xo, Yt], [L0, y3], [W + 20, y3]], 'exc-k');
        back += seg([[L0, y3], [Xi, y3]], 'exc-k', true);
      }
      const lensPath = div
        ? `M${L0 - 7} 50 Q${L0} ${ax} ${L0 - 7} 190 H${L0 + 7} Q${L0} ${ax} ${L0 + 7} 50 Z`
        : `M${L0} 50 Q${L0 + 14} ${ax} ${L0} 190 Q${L0 - 14} ${ax} ${L0} 50 Z`;
      const marks = [-2, -1, 1, 2]
        .map((m) => {
          const x = L0 + m * F * s;
          return x > 4 && x < 316 ? `<circle class="ex-fill exc-m" cx="${n1(x)}" cy="${ax}" r="2.5"/>${tt(x, ax + 13, `${Math.abs(m) === 2 ? '2F' : 'F'}`, 'exs-s')}` : '<g/>';
        })
        .join('');
      const onScreen = !im.none && Xi > 2 && Xi < 318;
      const hiC = clamp(hi, -100, 100);
      const img = onScreen ? arrow(Xi, ax, Xi, ax - hiC, `exc-k${real ? '' : ' ex-faint'}`, 3) : '<g/>';
      const kindTxt = im.none
        ? u('no image', 'изображения нет', 'кескін жоқ')
        : `${real ? u('real', 'действительное', 'нақты') : u('virtual', 'мнимое', 'жалған')}, ${hi < 0 ? u('inverted', 'перевёрнутое', 'төңкерілген') : u('upright', 'прямое', 'тура')}, ${Math.abs(im.G - 1) < 0.01 ? u('same size', 'равное', 'тең') : im.G > 1 ? u('magnified', 'увеличенное', 'үлкейген') : u('reduced', 'уменьшенное', 'кішірейген')}`;
      const info = `${box(4, 4, 312, 40)}${tt(10, 16, `${div ? '−' : ''}1/F = 1/d ${div ? '−' : '+'} 1/f · D = ${div ? '−' : '+'}${fmt(100 / F, 1)} ${u('dpt', 'дптр', 'дптр')}`, 'exs-t ex-start')}${tt(10, 28, `f = ${im.none ? '∞' : fmt(Math.abs(im.f), 1) + ' ' + UN.cm()}${im.none ? '' : `, Γ = f/d = ${fmt(im.G, 2)}`}`, 'exs-t ex-start tc exc-k')}${tt(10, 40, kindTxt, 'exs-s ex-start tc exc-k')}`;
      const dims = `${ln(Xo, 198, L0, 198, 'exc-p', 1.2)}${ln(Xo, 194, Xo, 202, 'exc-p', 1.2)}${tt(Math.min((Xo + L0) / 2, L0 - 22), 209, `d = ${fmt(d, 1)}`, 'exs-s tc exc-p')}${onScreen && Math.abs(Xi - L0) > 3 ? ln(Xi, real ? 198 : 214, L0, real ? 198 : 214, 'exc-k', 1.2) + ln(Xi, real ? 194 : 210, Xi, real ? 202 : 218, 'exc-k', 1.2) + tt(real ? Math.max((Xi + L0) / 2, L0 + 22) : L0 + 4, real ? 209 : 217, `f = ${fmt(Math.abs(im.f), 1)}`, `exs-s tc exc-k${real ? '' : ' ex-start'}`) : '<g/><g/><g/>'}`;
      const svg = `<line class="ex-axis" x1="0" y1="${ax}" x2="${W}" y2="${ax}"/><path class="ex-lens" d="${lensPath}"/>${marks}${back}${rays}${arrow(Xo, ax, Xo, Yt, 'exc-b', 3)}${img}${dims}${info}`;
      const fNum = im.none ? '∞' : fmt(Math.abs(im.f), 1);
      let caption;
      if (div)
        caption = u(
          `A diverging lens always gives a virtual, upright, reduced image between F and the lens: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} cm, Γ = ${fmt(im.G, 2)}. The rays spread out; their dashed extensions meet at the image.`,
          `Рассеивающая линза всегда даёт мнимое, прямое, уменьшенное изображение между F и линзой: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} см, Γ = ${fmt(im.G, 2)}. Лучи расходятся, а их пунктирные продолжения сходятся в изображении.`,
          `Шашыратқыш линза әрқашан F пен линза арасында жалған, тура, кішірейген кескін береді: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} см, Γ = ${fmt(im.G, 2)}. Сәулелер тарайды, ал олардың пунктир жалғасы кескінде тоғысады.`,
        );
      else if (im.none)
        caption = u('d = F: after the lens all rays go parallel and never meet - there is no image (a searchlight works like this).', 'd = F: после линзы лучи идут параллельно и не пересекаются - изображения нет (так работает прожектор).', 'd = F: линзадан кейін сәулелер параллель жүріп, қиылыспайды - кескін жоқ (прожектор осылай жұмыс істейді).');
      else
        caption = u(
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} cm. Image: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' It can be caught on a screen.' : ' The rays spread, the eye sees it behind the lens.'}`,
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} см. Изображение: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' Его можно поймать на экране.' : ' Лучи расходятся, глаз видит его за линзой.'}`,
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} см. Кескін: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' Оны экранға түсіруге болады.' : ' Сәулелер тарайды, көз оны линзаның артында көреді.'}`,
        );
      const ci = LENS_CASES.findIndex((c) => Math.abs(d - c.k * F) < 0.01);
      if (!div && ci >= 0 && st.m === 0) caption = `${tx(LENS_CASES[ci].name)}. ${caption}`;
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        const now = u(`Now: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`, `Сейчас: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`, `Қазір: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`);
        if (q.type === 0) {
          ok = real && near(im.G, 2, 0.03);
          goal = u(`F = ${q.F} cm. Get a real image twice as big as the object.`, `F = ${q.F} см. Получи действительное изображение в 2 раза больше предмета.`, `F = ${q.F} см. Нәрседен 2 есе үлкен нақты кескін ал.`);
          done = u(`d = 1.5F = ${fmt(q.d, 1)} cm, f = 2d = ${fmt(2 * q.d, 0)} cm.`, `d = 1,5F = ${fmt(q.d, 1)} см, f = 2d = ${fmt(2 * q.d, 0)} см.`, `d = 1,5F = ${fmt(q.d, 1)} см, f = 2d = ${fmt(2 * q.d, 0)} см.`);
        } else if (q.type === 1) {
          ok = real && near(im.G, 1, 0.02);
          goal = u(`F = ${q.F} cm. Get a real image of the same size.`, `F = ${q.F} см. Получи действительное изображение того же размера.`, `F = ${q.F} см. Өлшемі бірдей нақты кескін ал.`);
          done = u(`d = f = 2F = ${2 * q.F} cm.`, `d = f = 2F = ${2 * q.F} см.`, `d = f = 2F = ${2 * q.F} см.`);
        } else if (q.type === 2) {
          ok = !real && !im.none && near(im.G, 2, 0.03);
          goal = u(`F = ${q.F} cm. Use the lens as a magnifier: a virtual image 2 times bigger.`, `F = ${q.F} см. Сделай из линзы лупу: мнимое изображение в 2 раза больше.`, `F = ${q.F} см. Линзаны лупа ет: 2 есе үлкен жалған кескін.`);
          done = u(`d = F/2 = ${fmt(q.F / 2, 1)} cm: the object is inside the focus.`, `d = F/2 = ${fmt(q.F / 2, 1)} см: предмет внутри фокуса.`, `d = F/2 = ${fmt(q.F / 2, 1)} см: нәрсе фокус ішінде.`);
        } else if (q.type === 3) {
          ok = real && near(im.f, q.f, 0.3);
          goal = u(`F = ${q.F} cm. The screen is ${q.f} cm behind the lens. Where must the object be for a sharp image?`, `F = ${q.F} см. Экран стоит в ${q.f} см за линзой. Где поставить предмет, чтобы изображение было резким?`, `F = ${q.F} см. Экран линзадан ${q.f} см қашықта. Кескін анық болуы үшін нәрсені қайда қою керек?`);
          done = `1/d = 1/F − 1/f = 1/${q.F} − 1/${q.f} → d = ${fmt(q.d, 1)} ${UN.cm()}.`;
        } else {
          ok = im.none;
          goal = u(`F = ${q.F} cm. Where must the object be so that there is no image at all?`, `F = ${q.F} см. Где должен стоять предмет, чтобы изображения не было совсем?`, `F = ${q.F} см. Кескін мүлде болмауы үшін нәрсе қайда тұруы керек?`);
          done = u(`In the focus: d = F = ${q.F} cm, the rays leave parallel.`, `В фокусе: d = F = ${q.F} см, лучи выходят параллельно.`, `Фокуста: d = F = ${q.F} см, сәулелер параллель шығады.`);
        }
        hint = now;
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 316, 62), caption };
      }
      return { svg, caption };
    },
  },

// Анимации тем: Физика, химия и биология. Формат сцены описан в src/screens/explain.js.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';

export const SCENES_SCIENCE = {

  'sine-wave': {
    title: L('Waves: amplitude, frequency, phase', 'Волна: амплитуда, частота, фаза', 'Толқын: амплитуда, жиілік, фаза'),
    intro: L('y = A·sin(2π·f·t + φ). A is the height of the crest, f is how many waves fit in one second, φ shifts the wave sideways.', 'y = A·sin(2π·f·t + φ). A - высота гребня, f - сколько волн умещается за секунду, φ сдвигает волну вбок.', 'y = A·sin(2π·f·t + φ). A - толқын жотасының биіктігі, f - бір секундта неше толқын сыяды, φ толқынды бүйірге ығыстырады.'),
    sliders: [
      { id: 'A', label: 'A', min: 0.2, max: 2, step: C, value: 1 },
      { id: 'f', label: L('f, Hz', 'f, Гц', 'f, Гц'), min: 0.25, max: 3, step: C, value: 1 },
      { id: 'ph', label: 'φ, °', min: 0, max: 360, step: C, value: 0 },
    ],
    buttons: [L('▶ Shift the phase', '▶ Сдвигать фазу', '▶ Фазаны ығыстыру')],
    play: 'ph',
    playDur: 3000,
    playLinear: true,
    draw(v) {
      const sx = (tt) => 20 + tt * 145;
      const sy = (y) => 110 - y * 40;
      const w = (tt) => v.A * Math.sin(2 * Math.PI * v.f * tt + (v.ph * Math.PI) / 180);
      const T = 1 / v.f;
      const tc = ((((0.25 - v.ph / 360) % 1) + 1) % 1) * T;
      const top = sy(v.A);
      const t2 = tc + T <= 2 ? tc + T : tc - T;
      const [ta, tb] = [Math.min(tc, t2), Math.max(tc, t2)];
      return {
        svg: `<line class="ex-axis" x1="20" y1="110" x2="312" y2="110"/><line class="ex-axis" x1="20" y1="20" x2="20" y2="200"/>
          ${[0, 0.5, 1, 1.5, 2].map((s) => `<text class="ex-tiny" x="${sx(s)}" y="212">${fmt(s, 1)}</text>`).join('')}
          <path class="ex-stroke exc-m" style="opacity:.35;stroke-width:1.5" d="${plot((tt) => Math.sin(2 * Math.PI * tt), 0, 2, sx, sy, 160)}"/>
          <path class="ex-curve" d="${plot(w, 0, 2, sx, sy, 240)}"/>
          ${arrow(sx(tc), 110, sx(tc), top, 'exc-k', 2)}<text class="ex-tag tc exc-k" x="${n1(sx(tc) + 5)}" y="${n1((110 + top) / 2 + 4)}">A</text>
          ${ta >= 0 && tb <= 2.001 ? `<g class="exc-o"><line class="ex-stroke" style="stroke-width:1.5" x1="${n1(sx(ta))}" y1="${n1(top - 8)}" x2="${n1(sx(tb))}" y2="${n1(top - 8)}"/></g><text class="ex-tag tc exc-o" x="${n1(sx(ta) + 4)}" y="${n1(top - 13)}">T = ${fmt(T)} ${u('s', 'с', 'с')}</text>` : '<g/><g/>'}`,
        caption: L(
          `A = ${fmt(v.A)}: the crest rises ${fmt(v.A)} above the middle line. f = ${fmt(v.f)} Hz: ${fmt(v.f)} waves per second, so one wave lasts T = 1/f = ${fmt(T)} s. φ = ${fmt(v.ph)}° shifts the wave by ${fmt(v.ph / 360)} of a period. The grey wave is A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: гребень поднимается на ${fmt(v.A)} над средней линией. f = ${fmt(v.f)} Гц: ${fmt(v.f)} волны в секунду, значит одна волна длится T = 1/f = ${fmt(T)} с. φ = ${fmt(v.ph)}° сдвигает волну на ${fmt(v.ph / 360)} периода. Серая волна - A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: жота орта сызықтан ${fmt(v.A)}-ге көтеріледі. f = ${fmt(v.f)} Гц: секундына ${fmt(v.f)} толқын, демек бір толқын T = 1/f = ${fmt(T)} с созылады. φ = ${fmt(v.ph)}° толқынды периодтың ${fmt(v.ph / 360)} бөлігіне ығыстырады. Сұр толқын - A = 1, f = 1, φ = 0.`,
        ),
      };
    },
  },

  ohm: {
    title: L("Ohm's law: I = U / R", 'Закон Ома: I = U / R', 'Ом заңы: I = U / R'),
    intro: L('Voltage pushes the charges, resistance holds them back. The current is voltage divided by resistance - and the bulb shines brighter when more current flows.', 'Напряжение толкает заряды, сопротивление их тормозит. Сила тока - это напряжение, делённое на сопротивление; чем больше ток, тем ярче лампа.', 'Кернеу зарядтарды итереді, кедергі оларды тежейді. Ток күші - кернеуді кедергіге бөлгенге тең; ток неғұрлым көп болса, шам соғұрлым жарқын.'),
    sliders: [
      { id: 'U', label: L('U, V', 'U, В', 'U, В'), min: 0, max: 12, step: C, value: 6 },
      { id: 'R', label: L('R, Ω', 'R, Ом', 'R, Ом'), min: 1, max: 20, step: C, value: 4 },
    ],
    buttons: [L('U × 2', 'U × 2', 'U × 2'), L('R × 2', 'R × 2', 'R × 2'), RESET],
    onButton: (i, st, v) => [{ U: clamp(v.U * 2, 0, 12) }, { R: clamp(v.R * 2, 1, 20) }, { U: 6, R: 4 }][i],
    state: () => ({ ph: 0 }),
    live(dt, v, st) {
      st.ph = (st.ph + dt * (v.U / v.R) * 45) % 740;
    },
    draw(v, step, st) {
      const I = v.U / v.R;
      const b = clamp(I / 3, 0, 1);
      const P = v.U * I;
      // Электроны бегут по прямоугольному контуру.
      const along = (s) => {
        s = ((s % 740) + 740) % 740;
        if (s < 240) return [40 + s, 50];
        if (s < 370) return [280, 50 + (s - 240)];
        if (s < 610) return [280 - (s - 370), 180];
        return [40, 180 - (s - 610)];
      };
      const el = Array.from({ length: 20 }, (_, i) => {
        const [x, y] = along(i * 37 + st.ph);
        return `<circle class="ex-fill exc-b" cx="${n1(x)}" cy="${n1(y)}" r="${I > 0.005 ? 2.6 : 0}"/>`;
      }).join('');
      const V = u('V', 'В', 'В');
      const A = u('A', 'А', 'А');
      const Om = u('Ω', 'Ом', 'Ом');
      return {
        svg: `<path class="ex-wire" d="M40 50 H280 V180 H40 Z"/>
          <rect class="ex-res" x="125" y="40" width="70" height="20" rx="5"/><text class="ex-small" x="160" y="32">R = ${fmt(v.R)} ${Om}</text>
          <rect x="30" y="98" width="20" height="34" style="fill:var(--surface)"/><line class="ex-batt" x1="26" y1="104" x2="54" y2="104"/><line class="ex-batt thin" x1="32" y1="126" x2="48" y2="126"/><text class="ex-tag" x="58" y="120">U = ${fmt(v.U)} ${V}</text>
          ${el}
          <circle class="ex-glow" cx="280" cy="115" r="${n1(16 + 26 * b)}" opacity="${n1(b * 80) / 100}"/><circle class="ex-bulb" cx="280" cy="115" r="16" style="fill:color-mix(in srgb, var(--yellow) ${Math.round(b * 100)}%, var(--surface))"/><path class="ex-fil" d="M272 118 l4 -8 l4 8 l4 -8 l4 8"/>
          <text class="ex-big" x="160" y="125">I = ${fmt(I)} ${A}</text><text class="ex-small" x="160" y="150">${fmt(v.U)} ${V} ÷ ${fmt(v.R)} ${Om}</text><text class="ex-tag" x="8" y="210">P = U·I = ${fmt(P)} ${u('W', 'Вт', 'Вт')}</text>`,
        caption: L(
          `I = U / R = ${fmt(v.U)} V ÷ ${fmt(v.R)} Ω = ${fmt(I)} A. Double the voltage - the current doubles and the bulb gets brighter; double the resistance - the current halves. Power P = U·I = ${fmt(P)} W.`,
          `I = U / R = ${fmt(v.U)} В ÷ ${fmt(v.R)} Ом = ${fmt(I)} А. Увеличь напряжение вдвое - ток вырастет вдвое и лампа станет ярче; увеличь вдвое сопротивление - ток уменьшится вдвое. Мощность P = U·I = ${fmt(P)} Вт.`,
          `I = U / R = ${fmt(v.U)} В ÷ ${fmt(v.R)} Ом = ${fmt(I)} А. Кернеуді екі есе арттыр - ток екі есе өседі, шам жарқырайды; кедергіні екі есе арттыр - ток екі есе азаяды. Қуат P = U·I = ${fmt(P)} Вт.`,
        ),
      };
    },
  },

  lens: {
    title: L('How a lens makes an image', 'Как линза строит изображение', 'Линза кескінді қалай құрады'),
    intro: L('A ray parallel to the axis passes through the focus after the lens; a ray through the centre goes straight. Where they meet, the image appears.', 'Луч, параллельный оси, после линзы проходит через фокус; луч через центр линзы идёт не преломляясь. Где они встретятся - там изображение.', 'Оске параллель сәуле линзадан кейін фокус арқылы өтеді; линза ортасы арқылы өтетін сәуле сынбайды. Олар қай жерде кездессе - кескін сонда.'),
    sliders: [
      { id: 'd', label: L('object distance d', 'до предмета d', 'нәрсеге дейін d'), min: 0.5, max: 8, step: C, value: 5 },
      { id: 'F', label: L('focal length F', 'фокус F', 'фокус F'), min: 1, max: 4, step: C, value: 2 },
    ],
    buttons: [L('d = 2F', 'd = 2F', 'd = 2F'), L('d < F: magnifier', 'd < F: лупа', 'd < F: лупа')],
    onButton: (i, st, v) => [{ d: clamp(2 * v.F, 0.5, 8) }, { d: v.F * 0.6 }][i],
    draw(v) {
      const { d, F } = v;
      const s = 18;
      const L0 = 170;
      const ax = 120;
      const h = 2;
      const Xo = L0 - d * s;
      const Yt = ax - h * s;
      const none = Math.abs(d - F) < 0.01;
      const di = none ? Infinity : (d * F) / (d - F);
      const real = di > 0;
      const hi = -h * (di / d);
      const Xi = L0 + di * s;
      const Yi = ax - hi * s;
      const far = (x1, y1, x2, y2) => {
        const k = 600 / (Math.hypot(x2 - x1, y2 - y1) || 1);
        return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
      };
      const r1 = far(L0, Yt, L0 + F * s, ax);
      const r2 = far(Xo, Yt, L0, ax);
      const back = !none && !real ? `<g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${L0}" y1="${n1(Yt)}" x2="${n1(Xi)}" y2="${n1(Yi)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${L0}" y1="${ax}" x2="${n1(Xi)}" y2="${n1(Yi)}"/></g>` : '<g/>';
      const img = none || Math.abs(Xi) > 2000 ? '<g/>' : arrow(Xi, ax, Xi, Yi, `exc-k${real ? '' : ' ex-faint'}`, 3);
      const marks = [-2, -1, 1, 2].map((m) => `<circle class="ex-fill exc-m" cx="${L0 + m * F * s}" cy="${ax}" r="2.5"/><text class="ex-tiny" x="${L0 + m * F * s}" y="${ax + 14}">${Math.abs(m) === 2 ? '2F' : 'F'}</text>`).join('');
      const G = Math.abs(di / d);
      return {
        svg: `<line class="ex-axis" x1="0" y1="${ax}" x2="${W}" y2="${ax}"/><path class="ex-lens" d="M${L0} 40 Q${L0 + 12} ${ax} ${L0} 200 Q${L0 - 12} ${ax} ${L0} 40 Z"/>${marks}
          <g class="exc-o"><path class="ex-stroke" style="stroke-width:1.6" d="M${n1(Xo)} ${n1(Yt)} L${L0} ${n1(Yt)} L${n1(r1[0])} ${n1(r1[1])}"/><path class="ex-stroke" style="stroke-width:1.6" d="M${n1(Xo)} ${n1(Yt)} L${n1(r2[0])} ${n1(r2[1])}"/></g>${back}
          ${arrow(Xo, ax, Xo, Yt, 'exc-p', 3)}${img}
          <text class="ex-tag" x="8" y="18">1/d + 1/f = 1/F</text><text class="ex-tag" x="8" y="36">f = ${none ? '∞' : fmt(di)}</text>`,
        caption: none
          ? L('d = F: after the lens the rays go parallel and never meet - there is no image.', 'd = F: после линзы лучи идут параллельно и не встречаются - изображения нет.', 'd = F: линзадан кейін сәулелер параллель жүреді, кездеспейді - кескін жоқ.')
          : real
            ? L(`d = ${fmt(d)} > F: the image is real and upside down at f = dF/(d − F) = ${fmt(di)}, magnified ${fmt(G)}×${d > 2 * F ? ' (smaller than the object, like in a camera)' : d < 2 * F ? ' (bigger than the object, like in a projector)' : ' (same size at d = 2F)'}.`, `d = ${fmt(d)} > F: изображение действительное и перевёрнутое, на расстоянии f = dF/(d − F) = ${fmt(di)}, увеличение ${fmt(G)}×${d > 2 * F ? ' (меньше предмета, как в фотоаппарате)' : d < 2 * F ? ' (больше предмета, как в проекторе)' : ' (того же размера при d = 2F)'}.`, `d = ${fmt(d)} > F: кескін нақты және төңкерілген, f = dF/(d − F) = ${fmt(di)} қашықтықта, үлкейту ${fmt(G)}×${d > 2 * F ? ' (нәрседен кіші, фотоаппараттағыдай)' : d < 2 * F ? ' (нәрседен үлкен, проектордағыдай)' : ' (d = 2F кезінде өлшемі бірдей)'}.`)
            : L(`d = ${fmt(d)} < F: the rays spread out after the lens; their dashed extensions meet in front of it. The image is virtual, upright and ${fmt(G)}× bigger - that is a magnifying glass.`, `d = ${fmt(d)} < F: после линзы лучи расходятся, а их пунктирные продолжения встречаются перед линзой. Изображение мнимое, прямое и увеличенное в ${fmt(G)} раза - так работает лупа.`, `d = ${fmt(d)} < F: линзадан кейін сәулелер тарайды, ал олардың пунктир жалғасы линзаның алдында кездеседі. Кескін жалған, тура және ${fmt(G)} есе үлкен - лупа осылай жұмыс істейді.`),
      };
    },
  },

  projectile: {
    title: L('A ball thrown at an angle', 'Бросок под углом к горизонту', 'Көкжиекке бұрыш жасай лақтыру'),
    intro: L('Horizontally the ball flies at a constant speed, vertically gravity slows it down and then speeds it up. Kinetic and potential energy trade places, but their sum stays the same.', 'По горизонтали мяч летит с постоянной скоростью, а по вертикали сила тяжести сначала тормозит его, потом разгоняет. Кинетическая и потенциальная энергия переходят друг в друга, а их сумма не меняется.', 'Көлденеңінен доп тұрақты жылдамдықпен ұшады, ал тігінен ауырлық күші алдымен тежейді, содан кейін үдетеді. Кинетикалық және потенциалдық энергия бір-біріне ауысады, бірақ қосындысы өзгермейді.'),
    sliders: [
      { id: 'v0', label: L('v₀, m/s', 'v₀, м/с', 'v₀, м/с'), min: 5, max: 30, step: C, value: 20 },
      { id: 'al', label: 'α, °', min: 5, max: 85, step: C, value: 60 },
      { id: 'tt', label: PROGRESS, min: 0, max: 100, step: C, value: 40 },
    ],
    buttons: [L('▶ Throw', '▶ Бросить', '▶ Лақтыру'), L('α = 45°: farthest', 'α = 45°: дальше всего', 'α = 45°: ең алыс')],
    onButton(i, st, v, api) {
      if (i === 1) return { al: 45 };
      api.play('tt', { linear: true, dur: 2600 });
      return null;
    },
    draw(v) {
      const g = 9.8;
      const a = (v.al * Math.PI) / 180;
      const vx = v.v0 * Math.cos(a);
      const vy0 = v.v0 * Math.sin(a);
      const T = (2 * vy0) / g;
      const R = vx * T;
      const Hm = (vy0 * vy0) / (2 * g);
      const tm = (v.tt / 100) * T;
      const s = 290 / 92;
      const X = (t2) => 15 + vx * t2 * s;
      const Y = (t2) => 200 - (vy0 * t2 - (g * t2 * t2) / 2) * s;
      const full = plot((t2) => Y(t2), 0, T, X, (y) => y, 80);
      const done = plot((t2) => Y(t2), 0, tm, X, (y) => y, 80);
      const bx = X(tm);
      const by = Y(tm);
      const vy = vy0 - g * tm;
      const E = (v.v0 * v.v0) / 2;
      const Ep = g * Math.max(0, vy0 * tm - (g * tm * tm) / 2);
      const kk = clamp((E - Ep) / E, 0, 1);
      const KE = u('KE', 'Eк', 'Eк');
      const PE = u('PE', 'Eп', 'Eп');
      return {
        svg: `<line class="ex-axis" x1="10" y1="200" x2="312" y2="200"/><path class="ex-stroke exc-m ex-dash" style="stroke-width:1.5" d="${full}"/><path class="ex-curve" d="${done || 'M0 0'}"/>
          ${arrow(bx, by, bx + vx * 2, by, 'exc-g', 2)}${arrow(bx, by, bx, by - vy * 2, 'exc-k', 2)}
          <circle class="ex-ball" cx="${n1(bx)}" cy="${n1(by)}" r="7"/>
          <rect class="ex-fill exc-o" x="200" y="12" width="${n1(110 * kk)}" height="12" rx="3"/><rect class="ex-fill exc-b" x="${n1(200 + 110 * kk)}" y="12" width="${n1(110 * (1 - kk))}" height="12" rx="3"/>
          <text class="ex-tag tc exc-o" x="200" y="38">${KE}</text><text class="ex-tag tc exc-b" x="282" y="38">${PE}</text>
          <text class="ex-tag" x="8" y="18">L = ${fmt(R, 1)} ${u('m', 'м', 'м')}</text><text class="ex-tag" x="8" y="36">H = ${fmt(Hm, 1)} ${u('m', 'м', 'м')}</text><text class="ex-tag" x="8" y="54">T = ${fmt(T)} ${u('s', 'с', 'с')}</text>`,
        caption: L(
          `Flight time T = 2v₀·sin α / g = ${fmt(T)} s, range L = v₀²·sin 2α / g = ${fmt(R, 1)} m, height H = ${fmt(Hm, 1)} m. The horizontal speed (green) stays ${fmt(vx)} m/s; the vertical one (pink) is now ${fmt(vy)} m/s. At the top KE is smallest, PE largest.`,
          `Время полёта T = 2v₀·sin α / g = ${fmt(T)} с, дальность L = v₀²·sin 2α / g = ${fmt(R, 1)} м, высота H = ${fmt(Hm, 1)} м. Горизонтальная скорость (зелёная) всё время ${fmt(vx)} м/с, вертикальная (розовая) сейчас ${fmt(vy)} м/с. В верхней точке Eк меньше всего, Eп больше всего.`,
          `Ұшу уақыты T = 2v₀·sin α / g = ${fmt(T)} с, қашықтық L = v₀²·sin 2α / g = ${fmt(R, 1)} м, биіктік H = ${fmt(Hm, 1)} м. Көлденең жылдамдық (жасыл) үнемі ${fmt(vx)} м/с, тік жылдамдық (қызғылт) қазір ${fmt(vy)} м/с. Ең жоғарғы нүктеде Eк ең аз, Eп ең көп.`,
        ),
      };
    },
  },

  pendulum: {
    title: L('The period of a pendulum', 'Период маятника', 'Маятниктің периоды'),
    intro: L('A pendulum swings with period T = 2π√(l/g). It depends only on the string length and gravity - not on the mass of the bob.', 'Маятник качается с периодом T = 2π√(l/g). Он зависит только от длины нити и силы тяжести - масса груза не важна.', 'Маятник T = 2π√(l/g) периодымен тербеледі. Ол тек жіптің ұзындығы мен ауырлық күшіне тәуелді - жүктің массасы маңызды емес.'),
    sliders: [
      { id: 'l', label: L('l, m', 'l, м', 'l, м'), min: 0.2, max: 2.5, step: C, value: 1 },
      { id: 'g', label: L('g, m/s²', 'g, м/с²', 'g, м/с²'), min: 1.6, max: 25, step: C, value: 9.81 },
    ],
    buttons: [L('Moon', 'Луна', 'Ай'), L('Earth', 'Земля', 'Жер'), L('Jupiter', 'Юпитер', 'Юпитер')],
    onButton: (i) => ({ g: [1.62, 9.81, 24.79][i] }),
    pressed: (i, v) => Math.abs(v.g - [1.62, 9.81, 24.79][i]) < 0.02,
    state: () => ({ ph: 0 }),
    live(dt, v, st) {
      st.ph = (st.ph + dt * Math.sqrt(v.g / v.l)) % (Math.PI * 2);
    },
    draw(v, step, st) {
      const T = 2 * Math.PI * Math.sqrt(v.l / v.g);
      const th0 = (20 * Math.PI) / 180;
      const th = th0 * Math.cos(st.ph);
      const Lp = v.l * 72;
      const px = 160;
      const py = 18;
      const bx = px + Lp * Math.sin(th);
      const by = py + Lp * Math.cos(th);
      const arc = `M${n1(px + Lp * Math.sin(-th0))} ${n1(py + Lp * Math.cos(th0))} A${n1(Lp)} ${n1(Lp)} 0 0 0 ${n1(px + Lp * Math.sin(th0))} ${n1(py + Lp * Math.cos(th0))}`;
      return {
        svg: `<line class="ex-axis" x1="110" y1="${py}" x2="210" y2="${py}" style="stroke-width:3"/><path class="ex-stroke exc-m ex-dash" style="stroke-width:1.2" d="${arc}"/><line class="ex-grid" x1="${px}" y1="${py}" x2="${px}" y2="${n1(py + Lp + 12)}"/>
          <line class="ex-rad" x1="${px}" y1="${py}" x2="${n1(bx)}" y2="${n1(by)}"/><circle class="ex-ball" cx="${n1(bx)}" cy="${n1(by)}" r="10"/>
          <text class="ex-tag" x="8" y="40">T = ${fmt(T)} ${u('s', 'с', 'с')}</text><text class="ex-tag" x="8" y="58">${fmt(60 / T, 1)} ${u('swings/min', 'кол./мин', 'тербеліс/мин')}</text>`,
        caption: L(
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} s. A 4 times longer string gives a 2 times longer period. On the Moon gravity is weak, so the pendulum swings slowly; on Jupiter - fast.`,
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} с. Нить в 4 раза длиннее - период в 2 раза больше. На Луне тяготение слабое, и маятник качается медленно, на Юпитере - быстро.`,
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} с. Жіп 4 есе ұзын болса - период 2 есе артады. Айда тартылыс әлсіз, маятник баяу тербеледі, Юпитерде - жылдам.`,
        ),
      };
    },
  },

  newton: {
    title: L("Newton's second law: a = F / m", 'Второй закон Ньютона: a = F / m', 'Ньютонның екінші заңы: a = F / m'),
    intro: L('The same force speeds up a light cart faster than a heavy one. Acceleration is force divided by mass.', 'Одна и та же сила разгоняет лёгкую тележку быстрее, чем тяжёлую. Ускорение - это сила, делённая на массу.', 'Бірдей күш жеңіл арбаны ауырға қарағанда тезірек үдетеді. Үдеу - күшті массаға бөлгенге тең.'),
    sliders: [
      { id: 'F', label: L('F, N', 'F, Н', 'F, Н'), min: 0, max: 20, step: C, value: 8 },
      { id: 'm', label: L('m, kg', 'm, кг', 'm, кг'), min: 0.5, max: 10, step: C, value: 2 },
      { id: 'tt', label: L('t, s', 't, с', 't, с'), min: 0, max: 3, step: C, value: 1.5 },
    ],
    buttons: [L('▶ Push', '▶ Толкнуть', '▶ Итеру'), L('F × 2', 'F × 2', 'F × 2'), L('m × 2', 'm × 2', 'm × 2')],
    onButton(i, st, v, api) {
      if (i === 0) {
        api.play('tt', { linear: true, dur: 3000 });
        return null;
      }
      return i === 1 ? { F: clamp(v.F * 2, 0, 20) } : { m: clamp(v.m * 2, 0.5, 10) };
    },
    draw(v) {
      const a = v.F / v.m;
      const t2 = v.tt;
      const s = (a * t2 * t2) / 2;
      const vel = a * t2;
      const cw = 26 + v.m * 4;
      const ch = 18 + v.m * 2;
      const x = 40 + Math.min(s, 40) * 6.2;
      const ms = u('m/s', 'м/с', 'м/с');
      const vt = (tt) => 90 - (Math.min(a * tt, 60) / 60) * 66;
      return {
        svg: `<line class="ex-road" x1="10" y1="180" x2="312" y2="180"/><line class="ex-axis" x1="${40 + 40 * 6.2 + 26}" y1="140" x2="${40 + 40 * 6.2 + 26}" y2="180" style="stroke-width:3"/>
          <g transform="translate(${n1(x)} 0)"><rect class="ex-cart" x="0" y="${n1(172 - ch)}" width="${n1(cw)}" height="${n1(ch)}" rx="4"/><circle class="ex-wheel" cx="${n1(cw * 0.25)}" cy="174" r="5"/><circle class="ex-wheel" cx="${n1(cw * 0.75)}" cy="174" r="5"/><text class="ex-tiny ex-cartt" x="${n1(cw / 2)}" y="${n1(172 - ch / 2 + 4)}">${fmt(v.m, 1)}</text></g>
          ${v.F > 0.05 ? arrow(x - 6 - v.F * 3.2, 172 - ch / 2, x - 3, 172 - ch / 2, 'exc-o', 3) : '<g/>'}
          <line class="ex-axis" x1="210" y1="90" x2="312" y2="90"/><line class="ex-axis" x1="210" y1="20" x2="210" y2="90"/><g class="exc-p"><path class="ex-stroke" d="M210 90 L${n1(210 + t2 * 33)} ${n1(vt(t2))}"/><path class="ex-stroke ex-dash ex-faint" style="stroke-width:1.5" d="M210 90 L309 ${n1(vt(3))}"/></g><text class="ex-tiny" x="300" y="102">t</text><text class="ex-tiny" x="202" y="26">v</text>
          <text class="ex-tag" x="8" y="18">a = F / m = ${fmt(a)} ${u('m/s²', 'м/с²', 'м/с²')}</text><text class="ex-tag" x="8" y="36">v = a·t = ${fmt(vel)} ${ms}</text><text class="ex-tag" x="8" y="54">s = a·t²/2 = ${fmt(s)} ${u('m', 'м', 'м')}</text>`,
        caption: L(
          `a = F / m = ${fmt(v.F)} N ÷ ${fmt(v.m)} kg = ${fmt(a)} m/s². Twice the force → twice the acceleration; twice the mass → half of it. After ${fmt(t2)} s the cart moves at ${fmt(vel)} m/s.`,
          `a = F / m = ${fmt(v.F)} Н ÷ ${fmt(v.m)} кг = ${fmt(a)} м/с². Сила вдвое больше → ускорение вдвое больше; масса вдвое больше → ускорение вдвое меньше. Через ${fmt(t2)} с скорость тележки ${fmt(vel)} м/с.`,
          `a = F / m = ${fmt(v.F)} Н ÷ ${fmt(v.m)} кг = ${fmt(a)} м/с². Күш екі есе көп → үдеу екі есе көп; масса екі есе көп → үдеу екі есе аз. ${fmt(t2)} с кейін арбаның жылдамдығы ${fmt(vel)} м/с.`,
        ),
      };
    },
  },

  gas: {
    title: L('Gas in a cylinder: pressure, volume, temperature', 'Газ под поршнем: давление, объём, температура', 'Поршень астындағы газ: қысым, көлем, температура'),
    intro: L('Pressure is the molecules hitting the walls. Squeeze the gas - they hit more often; heat it - they move faster. For a fixed amount of gas pV/T stays constant.', 'Давление - это удары молекул о стенки. Сожмёшь газ - удары чаще, нагреешь - молекулы быстрее. Для данной массы газа pV/T не меняется.', 'Қысым - молекулалардың қабырғаға соқтығысуы. Газды сықсаң - соққылар жиілейді, қыздырсаң - молекулалар жылдамдайды. Газдың берілген массасы үшін pV/T өзгермейді.'),
    sliders: [
      { id: 'V', label: L('V, L', 'V, л', 'V, л'), min: 1, max: 4, step: C, value: 2 },
      { id: 'T', label: L('T, K', 'T, К', 'T, К'), min: 150, max: 600, step: C, value: 300 },
    ],
    buttons: [L('Compress ×2', 'Сжать в 2 раза', '2 есе сығу'), L('Heat ×2', 'Нагреть в 2 раза', '2 есе қыздыру'), RESET],
    onButton: (i, st, v) => [{ V: clamp(v.V / 2, 1, 4) }, { T: clamp(v.T * 2, 150, 600) }, { V: 2, T: 300 }][i],
    state: () => {
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      return { m: Array.from({ length: 28 }, () => ({ x: rnd() * 180, y: rnd() * 80, a: rnd() * Math.PI * 2 })) };
    },
    live(dt, v, st) {
      const h = v.V * 42;
      const sp = 90 * Math.sqrt(v.T / 300);
      for (const p of st.m) {
        p.x += Math.cos(p.a) * sp * dt;
        p.y += Math.sin(p.a) * sp * dt;
        if (p.x < 0 || p.x > 180) {
          p.x = clamp(p.x, 0, 180);
          p.a = Math.PI - p.a;
        }
        if (p.y < 0 || p.y > h) {
          p.y = clamp(p.y, 0, h);
          p.a = -p.a;
        }
      }
    },
    draw(v, step, st) {
      const p = 100 * (v.T / 300) * (2 / v.V);
      const h = v.V * 42;
      const top = 196 - h;
      const hue = Math.round(220 - ((v.T - 150) / 450) * 220);
      const mol = st.m.map((m) => `<circle cx="${n1(70 + m.x)}" cy="${n1(196 - Math.min(m.y, h))}" r="4" style="fill:hsl(${hue} 80% 55%)"/>`).join('');
      const ang = -135 + 270 * clamp(p / 400, 0, 1);
      const ra = (ang * Math.PI) / 180;
      const th = clamp((v.T - 150) / 450, 0, 1);
      return {
        svg: `<path class="ex-cyl" d="M64 20 V200 H256 V20"/><rect class="ex-piston" x="66" y="${n1(top - 12)}" width="188" height="12" rx="3"/><line class="ex-rod" x1="160" y1="${n1(top - 12)}" x2="160" y2="4"/>${mol}
          <circle class="ex-ring" cx="290" cy="70" r="22"/><line class="ex-rad" x1="290" y1="70" x2="${n1(290 + 18 * Math.sin(ra))}" y2="${n1(70 - 18 * Math.cos(ra))}"/><text class="ex-tiny" x="290" y="108">p</text>
          <rect class="ex-thermo" x="24" y="40" width="12" height="150" rx="6"/><rect x="26" y="${n1(188 - 146 * th)}" width="8" height="${n1(146 * th)}" rx="4" style="fill:hsl(${hue} 80% 55%)"/><text class="ex-tiny" x="30" y="206">T</text>
          <text class="ex-small" x="290" y="140">${fmt(p, 1)}</text><text class="ex-tiny" x="290" y="154">${u('kPa', 'кПа', 'кПа')}</text>`,
        caption: L(
          `p = ${fmt(p, 1)} kPa. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - always the same. Halve the volume → the pressure doubles; double the temperature (in kelvins) → the pressure doubles too.`,
          `p = ${fmt(p, 1)} кПа. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - всегда одно и то же. Объём меньше вдвое → давление вдвое больше; температура (в кельвинах) вдвое выше → давление тоже вдвое больше.`,
          `p = ${fmt(p, 1)} кПа. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - әрқашан бірдей. Көлем екі есе азайса → қысым екі есе артады; температура (кельвинмен) екі есе артса → қысым да екі есе артады.`,
        ),
      };
    },
  },

  ph: {
    title: L('The pH scale', 'Шкала pH', 'pH шкаласы'),
    intro: L('pH shows how acidic or alkaline a solution is: below 7 - acid, 7 - neutral, above 7 - alkali. One step on the scale means 10 times more or fewer H⁺ ions.', 'pH показывает, насколько раствор кислый или щелочной: меньше 7 - кислота, 7 - нейтральный, больше 7 - щёлочь. Шаг шкалы на 1 - это в 10 раз больше или меньше ионов H⁺.', 'pH ерітіндінің қаншалықты қышқыл не сілтілі екенін көрсетеді: 7-ден аз - қышқыл, 7 - бейтарап, 7-ден көп - сілті. Шкаладағы 1 қадам - H⁺ иондары 10 есе көп не аз деген сөз.'),
    sliders: [{ id: 'pH', label: 'pH', min: 0, max: 14, step: C, value: 7 }],
    buttons: [L('Lemon juice', 'Лимонный сок', 'Лимон шырыны'), L('Pure water', 'Чистая вода', 'Таза су'), L('Soap', 'Мыло', 'Сабын')],
    onButton: (i) => ({ pH: [2.4, 7, 10][i] }),
    draw(v) {
      const hue = (x) => (x <= 7 ? (x / 7) * 120 : 120 + ((x - 7) / 7) * 160);
      const col = (x) => `hsl(${Math.round(hue(x))} 75% 52%)`;
      const scale = Array.from({ length: 15 }, (_, i) => `<rect x="${20 + i * 18.67}" y="176" width="19" height="16" style="fill:${col(i)}"/>`).join('');
      const nH = Math.round(12 * clamp(0.5 + (7 - v.pH) / 12, 0, 1));
      const ions = Array.from({ length: 12 }, (_, i) => {
        const x = 124 + (i % 4) * 24 + (Math.floor(i / 4) % 2) * 10;
        const y = 98 + Math.floor(i / 4) * 22;
        const hp = i < nH;
        return `<text class="ex-tiny ex-ion${hp ? '' : ' oh'}" x="${x}" y="${y}">${hp ? 'H⁺' : 'OH⁻'}</text>`;
      }).join('');
      const px = 20 + (v.pH / 14) * 280;
      const neutral = Math.abs(v.pH - 7) < 0.005;
      const ratio = 10 ** Math.abs(7 - v.pH);
      const kind = (acid, neu, base) => (neutral ? neu : v.pH < 7 ? acid : base);
      const exp = fmt(-v.pH);
      return {
        svg: `<path class="ex-beaker" d="M110 40 V160 Q110 168 118 168 H202 Q210 168 210 160 V40"/><path d="M112 72 H208 V160 Q208 166 202 166 H118 Q112 166 112 160 Z" style="fill:${col(v.pH)};opacity:.55"/>${ions}
          ${scale}<path class="ex-fill" style="color:var(--ink)" d="M${n1(px)} 174 l-7 -12 h14 Z"/>${[0, 7, 14].map((x) => `<text class="ex-tiny" x="${20 + x * 20}" y="206">${x}</text>`).join('')}
          <text class="ex-big" x="270" y="70">${fmt(v.pH)}</text><text class="ex-small" x="270" y="94" style="fill:${col(v.pH)}">${u(...kind(['acid', 'кислота', 'қышқыл'], ['neutral', 'нейтр.', 'бейтарап'], ['alkali', 'щёлочь', 'сілті']))}</text>
          <text class="ex-tag" x="8" y="40">[H⁺] = 10<tspan dy="-6" font-size="9">${exp}</tspan></text>`,
        caption: neutral
          ? L('pH = 7: neutral, like pure water - H⁺ and OH⁻ ions are equal (10⁻⁷ mol/L each).', 'pH = 7: нейтральная среда, как чистая вода, - ионов H⁺ и OH⁻ поровну (по 10⁻⁷ моль/л).', 'pH = 7: бейтарап орта, таза судағыдай - H⁺ және OH⁻ иондары тең (әрқайсысы 10⁻⁷ моль/л).')
          : L(
              `pH = ${fmt(v.pH)}: ${kind(['acidic'], [''], ['alkaline'])[0]}. [H⁺] = 10^(${exp}) mol/L - ${fmt(ratio, ratio < 10 ? 2 : 0)} times ${v.pH < 7 ? 'more' : 'fewer'} H⁺ ions than in pure water.`,
              `pH = ${fmt(v.pH)}: ${kind(['кислая среда'], [''], ['щелочная среда'])[0]}. [H⁺] = 10^(${exp}) моль/л - ионов H⁺ в ${fmt(ratio, ratio < 10 ? 2 : 0)} раз ${v.pH < 7 ? 'больше' : 'меньше'}, чем в чистой воде.`,
              `pH = ${fmt(v.pH)}: ${kind(['қышқыл орта'], [''], ['сілтілі орта'])[0]}. [H⁺] = 10^(${exp}) моль/л - H⁺ иондары таза судағыдан ${fmt(ratio, ratio < 10 ? 2 : 0)} есе ${v.pH < 7 ? 'көп' : 'аз'}.`,
            ),
      };
    },
  },

  balancing: {
    title: L('Balancing a chemical equation', 'Уравниваем химическую реакцию', 'Химиялық реакцияны теңестіру'),
    intro: L('Atoms are not created or destroyed in a reaction, only regrouped. Pick the numbers of molecules so that every kind of atom is the same on both sides.', 'В реакции атомы не появляются и не исчезают - они только перегруппировываются. Подбери число молекул так, чтобы атомов каждого вида слева и справа было поровну.', 'Реакцияда атомдар пайда болмайды да, жоғалмайды да - тек қайта топтасады. Әр түрлі атомдар сол және оң жақта тең болатындай молекулалар санын тап.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 4, value: 1 },
      { id: 'b', label: 'b', min: 1, max: 4, value: 1 },
      { id: 'c', label: 'c', min: 1, max: 4, value: 1 },
    ],
    buttons: [L('Water', 'Вода', 'Су'), L('Ammonia', 'Аммиак', 'Аммиак'), L('Magnesium oxide', 'Оксид магния', 'Магний оксиді'), L('Show the answer', 'Показать ответ', 'Жауапты көрсету')],
    state: () => ({ r: 0 }),
    pressed: (i, v, st) => i === st.r,
    onButton(i, st) {
      if (i < 3) {
        st.r = i;
        return { a: 1, b: 1, c: 1 };
      }
      const [a, b, c] = REACTIONS[st.r].ans;
      return { a, b, c };
    },
    draw(v, step, st) {
      const R = REACTIONS[st.r];
      const ks = [v.a, v.b, v.c];
      const cols = [55, 135, 250];
      const mols = R.mol
        .map((m, j) =>
          Array.from({ length: ks[j] }, (_, i) => {
            const atoms = m.atoms.map((el, q) => `<circle class="ex-atom at-${el}" cx="${n1(q * 11 - (m.atoms.length - 1) * 5.5)}" cy="0" r="${ATOM_R[el]}"/>`).join('');
            return `<g transform="translate(${cols[j]} ${62 + i * 26})" data-key="${st.r}-${j}">${atoms}</g>`;
          }).join(''),
        )
        .join('');
      const count = (side) => {
        const cnt = {};
        R.mol.forEach((m, j) => {
          if ((j < 2) !== (side === 0)) return;
          for (const el of m.atoms) cnt[el] = (cnt[el] ?? 0) + ks[j];
        });
        return cnt;
      };
      const left = count(0);
      const right = count(1);
      const els = Object.keys(left);
      const ok = els.every((el) => left[el] === right[el]);
      const rows = els.map((el, i) => `<text class="ex-small tc ${left[el] === right[el] ? 'exc-g' : 'exc-r'}" x="${160 + (i - (els.length - 1) / 2) * 110}" y="206">${el}: ${left[el]} → ${right[el]} ${left[el] === right[el] ? '✓' : '✗'}</text>`).join('');
      const lab = (k, f) => `${k === 1 ? '' : k}${f}`;
      const eq = `${lab(v.a, R.f[0])} + ${lab(v.b, R.f[1])} → ${lab(v.c, R.f[2])}`;
      const list = els.map((el) => `${el} ${left[el]}`).join(', ');
      return {
        svg: `<text class="ex-big" x="160" y="28">${eq}</text>${mols}<text class="ex-big" x="95" y="100">+</text><text class="ex-big" x="192" y="100">→</text>
          <text class="ex-small" x="55" y="172">${lab(v.a, R.f[0])}</text><text class="ex-small" x="135" y="172">${lab(v.b, R.f[1])}</text><text class="ex-small" x="250" y="172">${lab(v.c, R.f[2])}</text>${rows}`,
        caption: ok
          ? L(`Balanced: ${list} on each side. The coefficients ${v.a} : ${v.b} : ${v.c} are also the ratio of moles in the reaction.`, `Уравнено: ${list} с каждой стороны. Коэффициенты ${v.a} : ${v.b} : ${v.c} - это и соотношение молей в реакции.`, `Теңестірілді: әр жақта ${list}. ${v.a} : ${v.b} : ${v.c} коэффициенттері - реакциядағы моль қатынасы да.`)
          : L('Not balanced yet: some atoms (red) differ on the left and on the right. Change the number of molecules - never the small indices inside a formula.', 'Пока не уравнено: каких-то атомов (красные) слева и справа разное число. Меняй число молекул (коэффициенты), а не маленькие индексы в формуле.', 'Әлі теңестірілмеген: кейбір атомдар (қызыл) сол және оң жақта әртүрлі. Формуладағы кіші индекстерді емес, молекулалар санын (коэффициенттерді) өзгерт.'),
      };
    },
  },

  photosynthesis: {
    title: L('Photosynthesis: what goes in and out', 'Фотосинтез: что входит и что выходит', 'Фотосинтез: не кіреді, не шығады'),
    intro: L('A leaf takes carbon dioxide from the air and water from the roots and, using light energy, makes glucose and oxygen: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', 'Лист берёт углекислый газ из воздуха и воду из корней и с помощью энергии света делает глюкозу и кислород: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', 'Жапырақ ауадан көмірқышқыл газын, тамырдан су алады да, жарық энергиясымен глюкоза мен оттек жасайды: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.'),
    sliders: [
      { id: 'light', label: L('light, %', 'свет, %', 'жарық, %'), min: 0, max: 100, step: C, value: 70 },
      { id: 'co2', label: 'CO₂, %', min: 0, max: 100, step: C, value: 40 },
    ],
    buttons: [L('Night', 'Ночь', 'Түн'), L('Sunny day', 'Солнечный день', 'Шуақты күн')],
    onButton: (i) => [{ light: 0 }, { light: 100 }][i],
    state: () => ({ t: 0 }),
    live(dt, v, st) {
      st.t += dt * (0.25 + 0.75 * (Math.min(v.light, v.co2) / 100));
    },
    draw(v, step, st) {
      const rate = Math.min(v.light, v.co2) / 100;
      const L1 = v.light / 100;
      const rays = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<line x1="${n1(40 + 20 * Math.cos(a))}" y1="${n1(40 + 20 * Math.sin(a))}" x2="${n1(40 + 28 * Math.cos(a))}" y2="${n1(40 + 28 * Math.sin(a))}"/>`;
      }).join('');
      const bubbles = Array.from({ length: 6 }, (_, i) => {
        const k = (st.t * 0.6 + i / 6) % 1;
        return `<circle class="ex-bubble" cx="${n1(262 + 8 * Math.sin(k * 9 + i))}" cy="${n1(120 - k * 100)}" r="${n1(3 + 3 * k)}" opacity="${n1(rate * (1 - k) * 100) / 100}"/>`;
      }).join('');
      const lim = Math.abs(v.light - v.co2) < 0.5 ? 'both' : v.light < v.co2 ? 'light' : 'co2';
      return {
        svg: `<g class="ex-sun" opacity="${n1((0.2 + 0.8 * L1) * 100) / 100}"><circle cx="40" cy="40" r="15"/><g class="ex-rays">${rays}</g></g>
          <g class="exc-y" opacity="${n1(L1 * 100) / 100}">${arrow(62, 54, 120, 92, '', 1 + 3 * L1)}</g>
          <path class="ex-leaf" style="opacity:${n1((0.45 + 0.55 * rate) * 100) / 100}" d="M95 140 Q150 50 245 85 Q195 175 95 140 Z"/><path class="ex-vein" d="M95 140 Q170 110 245 85"/>
          ${arrow(14, 168, 100, 138, 'exc-m', 1 + 4 * (v.co2 / 100))}<text class="ex-tag" x="10" y="190">CO₂</text>
          ${arrow(165, 214, 165, 152, 'exc-b', 3)}<text class="ex-tag tc exc-b" x="172" y="206">H₂O</text>
          ${arrow(236, 92, 280, 52, 'exc-g', 1 + 4 * rate)}${bubbles}<text class="ex-tag tc exc-g" x="284" y="40">O₂</text>
          <rect class="ex-fill exc-o" x="220" y="${n1(196 - 40 * rate)}" width="22" height="${n1(40 * rate)}" rx="4"/><text class="ex-tiny" x="231" y="210">C₆H₁₂O₆</text>
          <text class="ex-tag" x="120" y="18">${u('rate', 'скорость', 'жылдамдық')}: ${fmt(rate * 100, 0)}%</text>`,
        caption:
          rate < 0.005
            ? L(`No ${v.light < 0.005 ? 'light' : 'CO₂'} - no photosynthesis: no glucose and no oxygen are made.`, `Нет ${v.light < 0.005 ? 'света' : 'CO₂'} - нет фотосинтеза: глюкоза и кислород не образуются.`, `${v.light < 0.005 ? 'Жарық' : 'CO₂'} жоқ - фотосинтез жоқ: глюкоза мен оттек түзілмейді.`)
            : L(
                `Rate ${fmt(rate * 100, 0)}%. It is limited by the factor in shortest supply - ${lim === 'both' ? 'light and CO₂ are equal now' : lim === 'light' ? 'now it is light' : 'now it is CO₂'}. Adding more of the other factor does not help.`,
                `Скорость ${fmt(rate * 100, 0)}%. Её ограничивает то, чего меньше всего, - ${lim === 'both' ? 'сейчас свет и CO₂ поровну' : lim === 'light' ? 'сейчас это свет' : 'сейчас это CO₂'}. Добавлять другой фактор бесполезно.`,
                `Жылдамдық ${fmt(rate * 100, 0)}%. Оны ең аз фактор шектейді - ${lim === 'both' ? 'қазір жарық пен CO₂ тең' : lim === 'light' ? 'қазір бұл жарық' : 'қазір бұл CO₂'}. Басқа факторды қосу пайдасыз.`,
              ),
      };
    },
  },

  punnett: {
    title: L('Punnett square', 'Решётка Пеннета', 'Пеннет торы'),
    intro: L('Each parent passes one of its two alleles to a child. A (yellow peas) is dominant, a (green) is recessive: a pea is green only as aa.', 'Каждый родитель передаёт ребёнку один из двух своих аллелей. A (жёлтый горох) - доминантный, a (зелёный) - рецессивный: зелёный горох только у aa.', 'Әр ата-ана балаға өзінің екі аллелінің бірін береді. A (сары бұршақ) - доминантты, a (жасыл) - рецессивті: жасыл бұршақ тек aa-да болады.'),
    sliders: [
      { id: 'p1', label: L('parent 1', 'родитель 1', '1-ата-ана'), min: 0, max: 2, value: 1, show: (g) => ['aa', 'Aa', 'AA'][g] },
      { id: 'p2', label: L('parent 2', 'родитель 2', '2-ата-ана'), min: 0, max: 2, value: 1, show: (g) => ['aa', 'Aa', 'AA'][g] },
    ],
    buttons: [L('Aa × Aa', 'Aa × Aa', 'Aa × Aa'), L('Test cross Aa × aa', 'Анализирующее Aa × aa', 'Талдаушы Aa × aa'), L('AA × aa', 'AA × aa', 'AA × aa')],
    onButton: (i) => [{ p1: 1, p2: 1 }, { p1: 1, p2: 0 }, { p1: 2, p2: 0 }][i],
    draw(v) {
      const gam = (g) => (g === 2 ? ['A', 'A'] : g === 1 ? ['A', 'a'] : ['a', 'a']);
      const g1 = gam(v.p1);
      const g2 = gam(v.p2);
      const cnt = [0, 0, 0];
      let cells = '';
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          const gt = [g1[j], g2[i]].sort().join('');
          const n = (gt.match(/A/g) ?? []).length;
          cnt[n] += 1;
          const x = 90 + j * 56;
          const y = 52 + i * 56;
          cells += `<rect class="ex-pcell ${n ? 'dom' : 'rec'}" x="${x}" y="${y}" width="52" height="52" rx="8"/><text class="ex-small" x="${x + 26}" y="${y + 31}">${gt}</text>`;
        }
      const dom = ((cnt[1] + cnt[2]) / 4) * 100;
      const G = ['aa', 'Aa', 'AA'];
      return {
        svg: `${g1.map((a, j) => `<text class="ex-big" x="${116 + j * 56}" y="42">${a}</text>`).join('')}${g2.map((a, i) => `<text class="ex-big" x="72" y="${86 + i * 56}">${a}</text>`).join('')}
          <text class="ex-tag" x="8" y="30">${G[v.p1]} × ${G[v.p2]}</text>${cells}
          <text class="ex-small" x="270" y="60">AA : Aa : aa</text><text class="ex-big" x="270" y="88">${cnt[2]} : ${cnt[1]} : ${cnt[0]}</text>
          <circle class="ex-pea dom" cx="248" cy="130" r="10"/><text class="ex-small" x="286" y="135">${fmt(dom, 0)}%</text><circle class="ex-pea rec" cx="248" cy="166" r="10"/><text class="ex-small" x="286" y="171">${fmt(100 - dom, 0)}%</text>`,
        caption: L(
          `${G[v.p1]} × ${G[v.p2]}: 4 equally likely combinations. Genotypes AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Yellow peas (at least one A) ${fmt(dom, 0)}%, green (aa) ${fmt(100 - dom, 0)}%.`,
          `${G[v.p1]} × ${G[v.p2]}: 4 равновероятные комбинации. Генотипы AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Жёлтый горох (есть хотя бы одна A) - ${fmt(dom, 0)}%, зелёный (aa) - ${fmt(100 - dom, 0)}%.`,
          `${G[v.p1]} × ${G[v.p2]}: 4 тең ықтимал комбинация. Генотиптер AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Сары бұршақ (кем дегенде бір A бар) - ${fmt(dom, 0)}%, жасыл (aa) - ${fmt(100 - dom, 0)}%.`,
        ),
      };
    },
  },

  // ===== Новые анимации: химия, биология, география, информатика, алгебра, геометрия, высшая математика =====

  atom: {
    title: L('Atom: protons, electrons and shells', 'Атом: протоны, электроны и оболочки', 'Атом: протондар, электрондар және қабаттар'),
    intro: L('The atomic number Z is the number of protons in the nucleus and electrons around it. Electrons fill shells: 2 on the first, then 8, then 8.', 'Порядковый номер Z - это число протонов в ядре и электронов вокруг него. Электроны заполняют оболочки: на первой 2, дальше по 8.', 'Реттік нөмір Z - ядродағы протондар мен айналасындағы электрондар саны. Электрондар қабаттарды толтырады: біріншіде 2, әрі қарай 8-ден.'),
    sliders: [{ id: 'z', label: 'Z', min: 1, max: 20, value: 11 }],
    buttons: [L('Noble gas', 'Инертный газ', 'Инертті газ'), L('Alkali metal', 'Щелочной металл', 'Сілтілік металл')],
    onButton: (i, st, v) => [{ z: [2, 10, 18].reduce((a, b) => (Math.abs(b - v.z) < Math.abs(a - v.z) ? b : a)) }, { z: [3, 11, 19].reduce((a, b) => (Math.abs(b - v.z) < Math.abs(a - v.z) ? b : a)) }][i],
    state: () => ({ ph: 0 }),
    live(dt, v, st) {
      st.ph = (st.ph + dt * 0.6) % (Math.PI * 2);
    },
    draw(v, step, st) {
      const z = Math.round(v.z);
      const SYM = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
      const shells = [];
      for (let left = z, cap = [2, 8, 8, 2], i = 0; left > 0; i++) shells.push(Math.min(left, cap[i])), (left -= cap[i]);
      const cx = 105;
      const cy = 112;
      const rings = shells
        .map((n, i) => {
          const r = 30 + i * 22;
          const dots = Array.from({ length: n }, (_, k) => {
            const a = st.ph * (1 - i * 0.2) + (k / n) * Math.PI * 2;
            return `<circle class="ex-fill exc-b" cx="${n1(cx + r * Math.cos(a))}" cy="${n1(cy + r * Math.sin(a))}" r="3.6"/>`;
          }).join('');
          return `<circle class="ex-stroke exc-m" style="fill:none;stroke-width:1.2" cx="${cx}" cy="${cy}" r="${r}"/>${dots}`;
        })
        .join('');
      const val = shells.at(-1);
      const ruN = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? b : c);
      const pRu = `${z} ${ruN(z, 'протон', 'протона', 'протонов')} и ${z} ${ruN(z, 'электрон', 'электрона', 'электронов')}`;
      const pEn = `${z} proton${z > 1 ? 's' : ''} and ${z} electron${z > 1 ? 's' : ''}`;
      const noble = z === 2 || val === 8;
      const group = noble ? 'VIII' : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][val - 1];
      return {
        svg: `${rings}<circle class="ex-fill exc-o" cx="${cx}" cy="${cy}" r="16"/><text class="ex-small" x="${cx}" y="${cy + 4}" style="fill:#fff">+${z}</text>
          <text class="ex-big" x="250" y="60">${SYM[z - 1]}</text><text class="ex-tag" x="200" y="95">Z = ${z}</text>
          <text class="ex-tag" x="200" y="118">${u('shells', 'оболочки', 'қабаттар')}: ${shells.join(', ')}</text>
          <text class="ex-tag" x="200" y="141">${u('period', 'период', 'период')} ${shells.length} · ${u('group', 'группа', 'топ')} ${group}</text>`,
        caption: L(
          `${SYM[z - 1]}: ${pEn} arranged ${shells.join(', ')}. ${noble ? 'The outer shell is full - a noble gas, it hardly reacts.' : `The outer shell has ${val} electron${val > 1 ? 's' : ''} - that is the group number and what decides how the element reacts.`} The number of shells is the period.`,
          `${SYM[z - 1]}: ${pRu}, по оболочкам ${shells.join(', ')}. ${noble ? 'Внешняя оболочка заполнена - это инертный газ, он почти не вступает в реакции.' : `На внешней оболочке ${val} ${ruN(val, 'электрон', 'электрона', 'электронов')} - это номер группы, и именно эти электроны решают, как элемент реагирует.`} Число оболочек - номер периода.`,
          `${SYM[z - 1]}: ${z} протон және ${z} электрон, қабаттар бойынша ${shells.join(', ')}. ${noble ? 'Сыртқы қабат толған - бұл инертті газ, реакцияға дерлік түспейді.' : `Сыртқы қабатта ${val} - бұл топ нөмірі, элементтің қалай әрекеттесетінін осы электрондар шешеді.`} Қабаттар саны - период нөмірі.`,
        ),
      };
    },
  },

  solution: {
    title: L('Solutions: mass fraction', 'Растворы: массовая доля', 'Ерітінділер: массалық үлес'),
    intro: L('The mass fraction shows what part of the solution is the dissolved substance: w = m(substance) / m(solution). Add water - the solution gets weaker; evaporate water - it gets stronger.', 'Массовая доля показывает, какую часть раствора составляет растворённое вещество: w = m(вещества) / m(раствора). Долили воды - раствор слабее, выпарили воду - крепче.', 'Массалық үлес ерітіндінің қандай бөлігі еріген зат екенін көрсетеді: w = m(зат) / m(ерітінді). Су қосса - ерітінді әлсірейді, суды буландырса - күшейеді.'),
    sliders: [
      { id: 's', label: L('salt, g', 'соль, г', 'тұз, г'), min: 0, max: 100, step: C, value: 20 },
      { id: 'w', label: L('water, g', 'вода, г', 'су, г'), min: 20, max: 400, step: C, value: 180 },
    ],
    buttons: [L('+ 100 g water', '+ 100 г воды', '+ 100 г су'), L('Evaporate 50 g', 'Выпарить 50 г', '50 г буландыру'), RESET],
    onButton: (i, st, v) => [{ w: clamp(v.w + 100, 20, 400) }, { w: clamp(v.w - 50, 20, 400) }, { s: 20, w: 180 }][i],
    draw(v) {
      const total = v.s + v.w;
      const frac = v.s / total;
      const h = clamp((total / 500) * 150, 8, 150);
      const dots = Array.from({ length: Math.round(v.s / 4) }, (_, i) => {
        const x = 70 + ((i * 37) % 96);
        const y = 196 - ((i * 53) % Math.max(6, h - 6)) - 4;
        return `<circle class="ex-fill exc-m" cx="${x}" cy="${n1(y)}" r="2"/>`;
      }).join('');
      return {
        svg: `<path class="ex-stroke exc-m" style="fill:none;stroke-width:2.5" d="M60 40 V200 H180 V40"/>
          <rect x="62" y="${n1(198 - h)}" width="116" height="${n1(h)}" style="fill:color-mix(in srgb, var(--blue) ${Math.round(18 + frac * 70)}%, var(--surface))"/>${dots}
          <text class="ex-big" x="250" y="70">${fmt(frac * 100, 1)}%</text>
          <text class="ex-tag" x="200" y="105">m(${u('solution', 'р-ра', 'ерітінді')}) = ${fmt(total, 1)} ${u('g', 'г', 'г')}</text>
          <text class="ex-tag" x="200" y="128">w = ${fmt(v.s, 1)} / ${fmt(total, 1)}</text>`,
        caption: L(
          `w = ${fmt(v.s, 1)} g ÷ ${fmt(total, 1)} g = ${fmt(frac * 100, 1)}%. Remember: the solution's mass is salt plus water, not just water. Adding water keeps the salt the same but makes the fraction smaller.`,
          `w = ${fmt(v.s, 1)} г ÷ ${fmt(total, 1)} г = ${fmt(frac * 100, 1)}%. Помни: масса раствора - это соль плюс вода, а не только вода. Если долить воды, соли столько же, а доля меньше.`,
          `w = ${fmt(v.s, 1)} г ÷ ${fmt(total, 1)} г = ${fmt(frac * 100, 1)}%. Есте сақта: ерітінді массасы - тұз бен судың қосындысы, тек су емес. Су қоссаң, тұз сол күйі, ал үлесі азаяды.`,
        ),
      };
    },
  },

  molar: {
    title: L('Moles: from grams to particles', 'Моль: от граммов к частицам', 'Моль: граммнан бөлшектерге'),
    intro: L('One mole is 6.02 · 10²³ particles. Its mass in grams equals the molar mass M (from the periodic table). So n = m / M.', 'Один моль - это 6,02 · 10²³ частиц. Его масса в граммах равна молярной массе M (по таблице Менделеева). Поэтому n = m / M.', 'Бір моль - 6,02 · 10²³ бөлшек. Оның граммдағы массасы молярлық массаға M тең (Менделеев кестесі бойынша). Сондықтан n = m / M.'),
    sliders: [{ id: 'm', label: L('mass m, g', 'масса m, г', 'масса m, г'), min: 0, max: 180, step: C, value: 36 }],
    buttons: ['H₂O (18)', 'CO₂ (44)', 'O₂ (32)', 'NaCl (58,5)'],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const SUB = [
        ['H₂O', 18],
        ['CO₂', 44],
        ['O₂', 32],
        ['NaCl', 58.5],
      ];
      const [f, M] = SUB[st.k];
      const n = v.m / M;
      const full = Math.floor(n);
      const part = n - full;
      const balls = Array.from({ length: Math.min(10, Math.ceil(n)) }, (_, i) => {
        const fill = i < full ? 1 : part;
        const x = 30 + (i % 5) * 52;
        const y = 120 + Math.floor(i / 5) * 52;
        return `<circle class="ex-stroke exc-p" style="fill:none;stroke-width:2" cx="${x}" cy="${y}" r="20"/><path class="ex-fill exc-p" style="opacity:.75" d="M${x} ${y} L${x} ${y - 20} A20 20 0 ${fill > 0.5 ? 1 : 0} 1 ${n1(x + 20 * Math.sin(fill * 2 * Math.PI - 1e-6))} ${n1(y - 20 * Math.cos(fill * 2 * Math.PI - 1e-6))} Z"/>`;
      }).join('');
      const N = n * 6.02;
      return {
        svg: `<text class="ex-big" x="160" y="40">n = ${fmt(v.m, 1)} / ${M} = ${fmt(n)} ${u('mol', 'моль', 'моль')}</text>
          <text class="ex-tag" x="8" y="72">${f}: M = ${String(M).replace('.', getLang() === 'en' ? '.' : ',')} ${u('g/mol', 'г/моль', 'г/моль')}</text>
          <text class="ex-tag" x="8" y="92">N ≈ ${fmt(N)} · 10²³ ${u('molecules', 'частиц', 'бөлшек')}</text>${balls}`,
        caption: L(
          `${fmt(v.m, 1)} g of ${f} is ${fmt(n)} mol (each full circle is one mole). That is about ${fmt(N)} · 10²³ particles. Heavier molecules (bigger M) give fewer moles for the same mass.`,
          `${fmt(v.m, 1)} г ${f} - это ${fmt(n)} моль (каждый полный круг - один моль). Это примерно ${fmt(N)} · 10²³ частиц. Чем тяжелее молекула (больше M), тем меньше молей при той же массе.`,
          `${fmt(v.m, 1)} г ${f} - бұл ${fmt(n)} моль (әр толық шеңбер - бір моль). Бұл шамамен ${fmt(N)} · 10²³ бөлшек. Молекула неғұрлым ауыр (M үлкен) болса, сол массада моль соғұрлым аз.`,
        ),
      };
    },
  },

  foodchain: {
    title: L('Food chain and the 10% rule', 'Пищевая цепь и правило 10%', 'Қоректік тізбек және 10% ережесі'),
    intro: L('At each step of a food chain only about 10% of the energy passes on - the rest is spent on life and lost as heat. That is why chains are short and predators are few.', 'На каждом звене пищевой цепи дальше переходит лишь около 10% энергии - остальное тратится на жизнь и уходит в тепло. Поэтому цепи короткие, а хищников мало.', 'Қоректік тізбектің әр буынында энергияның тек 10%-ы ғана әрі өтеді - қалғаны тіршілікке жұмсалып, жылуға айналады. Сондықтан тізбектер қысқа, жыртқыштар аз.'),
    sliders: [
      { id: 'E', label: L('plants, kJ', 'растения, кДж', 'өсімдіктер, кДж'), min: 1000, max: 100000, step: 100, value: 50000 },
      { id: 'p', label: L('passes on, %', 'переходит, %', 'өтеді, %'), min: 5, max: 20, step: C, value: 10 },
    ],
    buttons: [L('10% rule', 'Правило 10%', '10% ережесі')],
    onButton: () => ({ p: 10 }),
    draw(v) {
      const names = [L('grass', 'трава', 'шөп'), L('hare', 'заяц', 'қоян'), L('fox', 'лиса', 'түлкі'), L('wolf', 'волк', 'қасқыр')];
      const icons = ['🌿', '🐇', '🦊', '🐺'];
      const vals = names.map((_, i) => v.E * (v.p / 100) ** i);
      // «в 10 раз», «в 2 раза», «в 6,7 раза»
      const timesRu = (x) => {
        const r = Math.round(x * 10) / 10;
        if (!Number.isInteger(r)) return 'раза';
        return r % 10 >= 2 && r % 10 <= 4 && (r % 100 < 12 || r % 100 > 14) ? 'раза' : 'раз';
      };
      const max = Math.log10(v.E + 1);
      const bars = vals
        .map((e, i) => {
          const w = clamp((Math.log10(e + 1) / max) * 220, 14, 220);
          const y = 180 - i * 42;
          return `<rect x="${n1(160 - w / 2)}" y="${y}" width="${n1(w)}" height="34" rx="6" class="ex-fill ${['exc-g', 'exc-y', 'exc-o', 'exc-r'][i]}" style="opacity:.8"/><text class="ex-small" x="160" y="${y + 22}">${icons[i]} ${tx(names[i])}: ${fmt(e, e < 10 ? 2 : 0)}</text>`;
        })
        .join('');
      return {
        svg: bars,
        caption: L(
          `From ${fmt(v.E, 0)} kJ in plants only ${fmt(vals[3], 1)} kJ reach the wolf - ${fmt((vals[3] / v.E) * 100, 3)}%. With ${fmt(v.p, 1)}% passing at each step, every next level gets ${fmt(100 / v.p, 1)} times less energy.`,
          `Из ${fmt(v.E, 0)} кДж в растениях до волка доходит лишь ${fmt(vals[3], 1)} кДж - ${fmt((vals[3] / v.E) * 100, 3)}%. Если на каждом звене переходит ${fmt(v.p, 1)}%, у каждого следующего энергии в ${fmt(100 / v.p, 1)} ${timesRu(100 / v.p)} меньше.`,
          `Өсімдіктердегі ${fmt(v.E, 0)} кДж-дан қасқырға тек ${fmt(vals[3], 1)} кДж жетеді - ${fmt((vals[3] / v.E) * 100, 3)}%. Әр буында ${fmt(v.p, 1)}% өтсе, келесі деңгейде энергия ${fmt(100 / v.p, 1)} есе аз.`,
        ),
      };
    },
  },

  enzyme: {
    title: L('Enzymes: temperature and pH', 'Ферменты: температура и pH', 'Ферменттер: температура және pH'),
    intro: L('An enzyme works fastest at its optimum. Warmer speeds it up - until the protein is destroyed (denatured) above about 45 °C. Each enzyme also has its own best pH.', 'Фермент работает быстрее всего в оптимуме. Тепло ускоряет его - пока белок не разрушится (денатурирует) выше примерно 45 °C. И у каждого фермента свой лучший pH.', 'Фермент оптимумда ең жылдам жұмыс істейді. Жылу оны жылдамдатады - шамамен 45 °C-тан жоғары ақуыз бұзылғанға (денатурация) дейін. Әр ферменттің өз ең жақсы pH-ы бар.'),
    sliders: [
      { id: 't', label: 't, °C', min: 0, max: 80, step: C, value: 37 },
      { id: 'ph', label: 'pH', min: 1, max: 13, step: C, value: 7 },
    ],
    buttons: [L('Amylase (saliva)', 'Амилаза (слюна)', 'Амилаза (сілекей)'), L('Pepsin (stomach)', 'Пепсин (желудок)', 'Пепсин (асқазан)')],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
      return { ph: i ? 2 : 7, t: 37 };
    },
    draw(v, step, st) {
      const opt = st.k ? 2 : 7;
      const act = (t, ph) => {
        const T = t <= 40 ? Math.exp(-(((t - 37) / 18) ** 2)) : Math.exp(-(((40 - 37) / 18) ** 2)) * Math.max(0, 1 - (t - 40) / 18);
        return T * Math.exp(-(((ph - opt) / 1.8) ** 2));
      };
      const sx = (t) => 20 + t * 3.6;
      const sy = (a) => 190 - a * 150;
      const curve = plot((t) => act(t, v.ph), 0, 80, sx, sy);
      const a = act(v.t, v.ph);
      return {
        svg: `<line class="ex-axis" x1="20" y1="190" x2="310" y2="190"/><line class="ex-axis" x1="20" y1="20" x2="20" y2="190"/>
          <path class="ex-stroke exc-p" style="fill:none;stroke-width:2.5" d="${curve}"/>
          <circle class="ex-fill exc-o" cx="${n1(sx(v.t))}" cy="${n1(sy(a))}" r="6"/>
          <text class="ex-tiny" x="${sx(37)}" y="205">37 °C</text><text class="ex-tiny" x="${sx(0)}" y="205">0</text><text class="ex-tiny" x="${sx(80)}" y="205">80</text>
          <text class="ex-tag" x="190" y="30">${u('activity', 'активность', 'белсенділік')}: ${Math.round(a * 100)}%</text>`,
        caption:
          v.t > 45
            ? L(`At ${fmt(v.t, 0)} °C the enzyme protein is denatured - its shape is broken and it almost stops working, even when cooled back.`, `При ${fmt(v.t, 0)} °C белок фермента денатурирует - его форма разрушена, и он почти перестаёт работать, даже если остудить.`, `${fmt(v.t, 0)} °C-та фермент ақуызы денатурацияланады - пішіні бұзылып, салқындатса да дерлік жұмыс істемейді.`)
            : L(`${st.k ? 'Pepsin works in the acidic stomach (pH ≈ 2)' : 'Amylase works in neutral saliva (pH ≈ 7)'}. Now activity is ${Math.round(a * 100)}%: closer to 37 °C and the right pH - faster.`, `${st.k ? 'Пепсин работает в кислом желудке (pH ≈ 2)' : 'Амилаза работает в нейтральной слюне (pH ≈ 7)'}. Сейчас активность ${Math.round(a * 100)}%: чем ближе к 37 °C и нужному pH, тем быстрее.`, `${st.k ? 'Пепсин қышқыл асқазанда жұмыс істейді (pH ≈ 2)' : 'Амилаза бейтарап сілекейде жұмыс істейді (pH ≈ 7)'}. Қазір белсенділік ${Math.round(a * 100)}%: 37 °C-қа және қажетті pH-қа жақын болған сайын жылдамырақ.`),
      };
    },
  },

  cellsize: {
    title: L('Why cells are small', 'Почему клетки маленькие', 'Жасушалар неге кішкентай'),
    intro: L('A cell takes in food and oxygen through its surface, but needs them for its whole volume. When a cell grows, volume grows faster than surface - so big cells starve.', 'Клетка получает пищу и кислород через поверхность, а нужны они всему объёму. Когда клетка растёт, объём растёт быстрее поверхности - большой клетке не хватает питания.', 'Жасуша қорек пен оттегін беті арқылы алады, ал олар бүкіл көлемге керек. Жасуша өскенде көлем бетке қарағанда тез өседі - үлкен жасушаға қорек жетпейді.'),
    sliders: [{ id: 'a', label: L('side a, µm', 'сторона a, мкм', 'қыры a, мкм'), min: 1, max: 10, step: C, value: 3 }],
    buttons: [L('a × 2', 'a × 2', 'a × 2'), RESET],
    onButton: (i, st, v) => [{ a: clamp(v.a * 2, 1, 10) }, { a: 3 }][i],
    draw(v) {
      const a = v.a;
      const S = 6 * a * a;
      const V = a ** 3;
      const s = 9 * a;
      const x = 70 - s / 2;
      const y = 140 - s / 2;
      const d = s * 0.45;
      const ratio = S / V;
      return {
        svg: `<path class="ex-fill exc-g" style="opacity:.35" d="M${n1(x)} ${n1(y)} h${n1(s)} v${n1(s)} h${n1(-s)} Z"/><path class="ex-fill exc-g" style="opacity:.55" d="M${n1(x)} ${n1(y)} l${n1(d)} ${n1(-d)} h${n1(s)} l${n1(-d)} ${n1(d)} Z"/><path class="ex-fill exc-g" style="opacity:.75" d="M${n1(x + s)} ${n1(y)} l${n1(d)} ${n1(-d)} v${n1(s)} l${n1(-d)} ${n1(d)} Z"/>
          <text class="ex-tag" x="180" y="60">S = 6a² = ${fmt(S, 1)}</text><text class="ex-tag" x="180" y="84">V = a³ = ${fmt(V, 1)}</text>
          <text class="ex-big" x="245" y="125">S/V = ${fmt(ratio)}</text>
          <rect x="180" y="150" width="${n1(clamp(ratio * 20, 4, 130))}" height="18" rx="5" class="ex-fill exc-b"/>`,
        caption: L(
          `For a = ${fmt(a)} µm: surface ${fmt(S, 1)}, volume ${fmt(V, 1)}, so each unit of volume has ${fmt(ratio)} units of surface (S/V = 6/a). Double the side and S/V halves - feeding the inside becomes twice as hard.`,
          `При a = ${fmt(a)} мкм: поверхность ${fmt(S, 1)}, объём ${fmt(V, 1)}, на каждую единицу объёма приходится ${fmt(ratio)} единицы поверхности (S/V = 6/a). Увеличь сторону вдвое - S/V уменьшится вдвое, и кормить середину станет вдвое труднее.`,
          `a = ${fmt(a)} мкм болғанда: беті ${fmt(S, 1)}, көлемі ${fmt(V, 1)}, әр көлем бірлігіне ${fmt(ratio)} бет бірлігі келеді (S/V = 6/a). Қырын екі есе үлкейтсең - S/V екі есе азаяды, ортасын қоректендіру екі есе қиындайды.`,
        ),
      };
    },
  },

  ions: {
    title: L('Writing formulas from ion charges', 'Формулы по зарядам ионов', 'Иондар зарядтары бойынша формула'),
    intro: L('A compound is neutral: the total plus charge equals the total minus charge. Ca²⁺ and Cl⁻ give CaCl₂ - two Cl⁻ balance one Ca²⁺.', 'Вещество электронейтрально: сумма плюсов равна сумме минусов. Ca²⁺ и Cl⁻ дают CaCl₂ - два Cl⁻ уравновешивают один Ca²⁺.', 'Зат электрбейтарап: оң зарядтар қосындысы теріс зарядтар қосындысына тең. Ca²⁺ мен Cl⁻ CaCl₂ береді - екі Cl⁻ бір Ca²⁺-ті теңестіреді.'),
    sliders: [],
    buttons: ['Na⁺', 'Ca²⁺', 'Al³⁺', 'Cl⁻', 'O²⁻', 'PO₄³⁻'],
    state: () => ({ c: 1, an: 0 }),
    pressed: (i, v, st) => (i < 3 ? i === st.c : i - 3 === st.an),
    onButton(i, st) {
      if (i < 3) st.c = i;
      else st.an = i - 3;
    },
    draw(v, step, st) {
      const CAT = [['Na', 1], ['Ca', 2], ['Al', 3]];
      const AN = [['Cl', 1, false], ['O', 2, false], ['PO₄', 3, true]];
      const [cs, cq] = CAT[st.c];
      const [as, aq, poly] = AN[st.an];
      const g = (x, y) => (y ? g(y, x % y) : x);
      const l = (cq * aq) / g(cq, aq);
      const nc = l / cq;
      const na = l / aq;
      const sub = (n) => (n > 1 ? String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]) : '');
      const formula = `${cs}${sub(nc)}${poly && na > 1 ? `(${as})${sub(na)}` : `${as}${sub(na)}`}`;
      const sup = (q, s) => `${q > 1 ? '⁰¹²³⁴⁵⁶⁷⁸⁹'[q] : ''}${s === '+' ? '⁺' : '⁻'}`;
      const bubbles = [
        ...Array.from({ length: nc }, (_, i) => `<circle class="ex-fill exc-o" cx="${40 + i * 44}" cy="90" r="18"/><text class="ex-small" x="${40 + i * 44}" y="95" style="fill:#fff">${cs}${sup(cq, '+')}</text>`),
        ...Array.from({ length: na }, (_, i) => `<circle class="ex-fill exc-b" cx="${40 + i * 44}" cy="150" r="18"/><text class="ex-small" x="${40 + i * 44}" y="155" style="fill:#fff;font-size:11px">${as}${sup(aq, '−')}</text>`),
      ].join('');
      return {
        svg: `${bubbles}<text class="ex-big" x="250" y="110">${formula}</text><text class="ex-tag" x="200" y="150">+${nc * cq} ${u('and', 'и', 'және')} −${na * aq}</text>`,
        caption: L(
          `${cs}${sup(cq, '+')} and ${as}${sup(aq, '−')}: the smallest common multiple of ${cq} and ${aq} is ${l}, so ${nc} × (+${cq}) = ${na} × (−${aq}) in size. Formula: ${formula}.`,
          `${cs}${sup(cq, '+')} и ${as}${sup(aq, '−')}: наименьшее общее кратное ${cq} и ${aq} - ${l}, поэтому ${nc} × (+${cq}) уравновешивают ${na} × (−${aq}). Формула: ${formula}.`,
          `${cs}${sup(cq, '+')} және ${as}${sup(aq, '−')}: ${cq} пен ${aq}-тің ең кіші ортақ еселігі - ${l}, сондықтан ${nc} × (+${cq}) ${na} × (−${aq})-ті теңестіреді. Формула: ${formula}.`,
        ),
      };
    },
  },

  // ===== Физика: Архимед, пружина, цепи, преломление, плавление, давление =====

  buoyancy: {
    title: L("Archimedes' principle: float or sink", 'Закон Архимеда: утонет или всплывёт', 'Архимед заңы: батады ма, қалқиды ма'),
    intro: L('A liquid pushes up with a force equal to the weight of the liquid displaced. If the body is less dense than the liquid, it floats with part of it above the surface.', 'Жидкость выталкивает тело с силой, равной весу вытесненной жидкости. Если тело легче (менее плотное), чем жидкость, оно плавает, частично выступая над водой.', 'Сұйық денені ығыстырылған сұйықтың салмағына тең күшпен итереді. Дене сұйықтан жеңіл (тығыздығы аз) болса, бір бөлігі судан шығып, қалқиды.'),
    sliders: [
      { id: 'rb', label: L('body density, kg/m³', 'плотность тела, кг/м³', 'дене тығыздығы, кг/м³'), min: 100, max: 3000, step: 10, value: 600 },
      { id: 'rl', label: L('liquid density, kg/m³', 'плотность жидкости, кг/м³', 'сұйық тығыздығы, кг/м³'), min: 700, max: 1300, step: 10, value: 1000 },
    ],
    buttons: [L('Wood', 'Дерево', 'Ағаш'), L('Ice', 'Лёд', 'Мұз'), L('Iron', 'Железо', 'Темір'), L('Sea water', 'Морская вода', 'Теңіз суы')],
    onButton: (i) => [{ rb: 600 }, { rb: 900 }, { rb: 2700 }, { rl: 1030 }][i],
    draw(v) {
      const k = v.rb / v.rl;
      const side = 60;
      const surf = 90;
      const floats = k < 1;
      const sub = floats ? k * side : side;
      const top = floats ? surf - (side - sub) : 196 - side;
      return {
        svg: `<rect x="20" y="${surf}" width="280" height="110" class="ex-fill exc-b" style="opacity:.25"/><line class="ex-stroke exc-b" x1="20" y1="${surf}" x2="300" y2="${surf}"/>
          <rect x="130" y="${n1(top)}" width="${side}" height="${side}" rx="6" class="ex-fill exc-o" style="opacity:.85"/>
          ${arrow(160, n1(top + side / 2), 160, n1(top + side / 2 + 40), 'exc-r', 2.5)}${arrow(178, n1(top + side), 178, n1(top + side - (floats ? 40 : 40 / k)), 'exc-g', 2.5)}
          <text class="ex-tag" x="8" y="20">ρ ${u('body', 'тела', 'дене')} / ρ ${u('liquid', 'жидк.', 'сұйық')} = ${fmt(k)}</text>
          <text class="ex-tag" x="8" y="42">${floats ? `${u('under water', 'под водой', 'су астында')}: ${Math.round(k * 100)}%` : u('sinks', 'тонет', 'батады')}</text>`,
        caption: floats
          ? L(`The body is ${fmt(k)} times as dense as the liquid, so it floats with ${Math.round(k * 100)}% of its volume under the surface: then the buoyant force (green) equals gravity (red).`, `Плотность тела в ${fmt(k)} раза от плотности жидкости, поэтому оно плавает, погрузившись на ${Math.round(k * 100)}% объёма: тогда сила Архимеда (зелёная) равна силе тяжести (красная).`, `Дене тығыздығы сұйық тығыздығының ${fmt(k)} бөлігі, сондықтан ол көлемінің ${Math.round(k * 100)}%-ына батып, қалқиды: сонда Архимед күші (жасыл) ауырлық күшіне (қызыл) тең.`)
          : L(`The body is denser than the liquid (${fmt(k)} times), so even fully under water the buoyant force is smaller than gravity - it sinks.`, `Тело плотнее жидкости (в ${fmt(k)} раза), поэтому даже полностью под водой сила Архимеда меньше силы тяжести - оно тонет.`, `Дене сұйықтан тығызырақ (${fmt(k)} есе), сондықтан толық батса да Архимед күші ауырлық күшінен аз - ол батады.`),
      };
    },
  },

  spring: {
    title: L("Hooke's law: a spring", 'Закон Гука: пружина', 'Гук заңы: серіппе'),
    intro: L('The spring stretches in proportion to the force: F = k · x. A stiffer spring (bigger k) stretches less under the same load.', 'Пружина растягивается пропорционально силе: F = k · x. Чем жёстче пружина (больше k), тем меньше она растянется под тем же грузом.', 'Серіппе күшке пропорционал созылады: F = k · x. Серіппе неғұрлым қатаң (k үлкен) болса, сол жүкпен соғұрлым аз созылады.'),
    sliders: [
      { id: 'm', label: L('mass, kg', 'масса, кг', 'масса, кг'), min: 0, max: 5, step: C, value: 2 },
      { id: 'k', label: L('k, N/m', 'k, Н/м', 'k, Н/м'), min: 50, max: 500, step: 1, value: 200 },
    ],
    buttons: [L('m × 2', 'm × 2', 'm × 2'), L('k × 2', 'k × 2', 'k × 2'), RESET],
    onButton: (i, st, v) => [{ m: clamp(v.m * 2, 0, 5) }, { k: clamp(v.k * 2, 50, 500) }, { m: 2, k: 200 }][i],
    draw(v) {
      const F = v.m * 10;
      const x = F / v.k;
      const len = 50 + x * 300;
      const coils = Array.from({ length: 12 }, (_, i) => `${i % 2 ? 'L130' : 'L190'} ${n1(30 + (len * (i + 1)) / 13)}`).join(' ');
      return {
        svg: `<line class="ex-axis" x1="100" y1="30" x2="220" y2="30"/><path class="ex-stroke exc-m" style="fill:none;stroke-width:2" d="M160 30 ${coils} L160 ${n1(30 + len)}"/>
          <rect x="135" y="${n1(30 + len)}" width="50" height="${n1(20 + v.m * 5)}" rx="5" class="ex-fill exc-o"/><text class="ex-small" x="160" y="${n1(46 + len)}" style="fill:#fff">${fmt(v.m, 1)} ${u('kg', 'кг', 'кг')}</text>
          <text class="ex-tag" x="200" y="80">F = mg = ${fmt(F, 1)} ${u('N', 'Н', 'Н')}</text><text class="ex-tag" x="200" y="104">x = F / k</text><text class="ex-big" x="250" y="140">${fmt(x * 100, 1)} ${u('cm', 'см', 'см')}</text>`,
        caption: L(`x = F / k = ${fmt(F, 1)} N ÷ ${fmt(v.k, 0)} N/m = ${fmt(x, 3)} m = ${fmt(x * 100, 1)} cm. Double the mass - the stretch doubles; double k - it halves.`, `x = F / k = ${fmt(F, 1)} Н ÷ ${fmt(v.k, 0)} Н/м = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. Удвой массу - растяжение удвоится; удвой k - уменьшится вдвое.`, `x = F / k = ${fmt(F, 1)} Н ÷ ${fmt(v.k, 0)} Н/м = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. Массаны екі есе арттыр - созылу екі есе артады; k-ны екі есе арттыр - екі есе азаяды.`),
      };
    },
  },

  circuits: {
    title: L('Series and parallel circuits', 'Последовательное и параллельное соединение', 'Тізбектей және параллель жалғау'),
    intro: L('In series the resistances add up: R = R₁ + R₂, the same current flows through both. In parallel 1/R = 1/R₁ + 1/R₂ - the total is smaller than the smallest one.', 'При последовательном соединении сопротивления складываются: R = R₁ + R₂, ток через оба одинаковый. При параллельном 1/R = 1/R₁ + 1/R₂ - общее меньше самого маленького.', 'Тізбектей жалғағанда кедергілер қосылады: R = R₁ + R₂, екеуінен бірдей ток өтеді. Параллель жалғағанда 1/R = 1/R₁ + 1/R₂ - жалпы кедергі ең кішісінен де аз.'),
    sliders: [
      { id: 'r1', label: 'R₁, Ω', min: 1, max: 20, step: C, value: 6 },
      { id: 'r2', label: 'R₂, Ω', min: 1, max: 20, step: C, value: 3 },
      { id: 'U', label: 'U, V', min: 1, max: 24, step: C, value: 12 },
    ],
    buttons: [L('Series', 'Последовательно', 'Тізбектей'), L('Parallel', 'Параллельно', 'Параллель')],
    state: () => ({ par: 0 }),
    pressed: (i, v, st) => i === st.par,
    onButton(i, st) {
      st.par = i;
    },
    draw(v, step, st) {
      const R = st.par ? (v.r1 * v.r2) / (v.r1 + v.r2) : v.r1 + v.r2;
      const I = v.U / R;
      const res = (x, y, label) => `<rect x="${x}" y="${y - 10}" width="60" height="20" rx="5" class="ex-res"/><text class="ex-tiny" x="${x + 30}" y="${y - 16}">${label}</text>`;
      const wires = st.par
        ? `<path class="ex-wire" d="M40 180 V60 H130 M190 60 H260 V180 H40 M100 60 V140 H130 M190 140 H260"/>${res(130, 60, `R₁ ${fmt(v.r1, 1)}`)}${res(130, 140, `R₂ ${fmt(v.r2, 1)}`)}`
        : `<path class="ex-wire" d="M40 180 V100 H70 M130 100 H180 M240 100 H270 V180 H40"/>${res(70, 100, `R₁ ${fmt(v.r1, 1)}`)}${res(180, 100, `R₂ ${fmt(v.r2, 1)}`)}`;
      const batt = `<rect x="146" y="168" width="28" height="24" style="fill:var(--surface)"/><line class="ex-batt" x1="154" y1="166" x2="154" y2="194"/><line class="ex-batt thin" x1="166" y1="172" x2="166" y2="188"/>`;
      return {
        svg: `${wires}${batt}<text class="ex-tag" x="8" y="20">R = ${fmt(R)} Ω · I = U/R = ${fmt(I)} ${u('A', 'А', 'А')}</text><text class="ex-tiny" x="160" y="212">U = ${fmt(v.U, 1)} ${u('V', 'В', 'В')}</text>`,
        caption: st.par
          ? L(`Parallel: 1/R = 1/${fmt(v.r1, 1)} + 1/${fmt(v.r2, 1)}, R = ${fmt(R)} Ω - less than both. Each resistor gets the full voltage ${fmt(v.U, 1)} V; the currents add up to ${fmt(I)} A.`, `Параллельно: 1/R = 1/${fmt(v.r1, 1)} + 1/${fmt(v.r2, 1)}, R = ${fmt(R)} Ом - меньше обоих. На каждом резисторе всё напряжение ${fmt(v.U, 1)} В, токи складываются в ${fmt(I)} А.`, `Параллель: 1/R = 1/${fmt(v.r1, 1)} + 1/${fmt(v.r2, 1)}, R = ${fmt(R)} Ом - екеуінен де аз. Әр резисторда толық кернеу ${fmt(v.U, 1)} В, токтар қосылып ${fmt(I)} А болады.`)
          : L(`Series: R = ${fmt(v.r1, 1)} + ${fmt(v.r2, 1)} = ${fmt(R)} Ω, the same current ${fmt(I)} A everywhere; the voltage splits: ${fmt(I * v.r1)} V and ${fmt(I * v.r2)} V.`, `Последовательно: R = ${fmt(v.r1, 1)} + ${fmt(v.r2, 1)} = ${fmt(R)} Ом, ток везде одинаковый ${fmt(I)} А, а напряжение делится: ${fmt(I * v.r1)} В и ${fmt(I * v.r2)} В.`, `Тізбектей: R = ${fmt(v.r1, 1)} + ${fmt(v.r2, 1)} = ${fmt(R)} Ом, ток барлық жерде бірдей ${fmt(I)} А, ал кернеу бөлінеді: ${fmt(I * v.r1)} В және ${fmt(I * v.r2)} В.`),
      };
    },
  },

  refraction: {
    title: L('Refraction of light', 'Преломление света', 'Жарықтың сынуы'),
    intro: L('When light goes into a denser medium (glass, water), it slows down and bends toward the normal: n₁ sin α = n₂ sin β. Going the other way past a critical angle, it is totally reflected.', 'Переходя в более плотную среду (стекло, воду), свет замедляется и отклоняется к нормали: n₁ sin α = n₂ sin β. В обратную сторону после предельного угла он полностью отражается.', 'Тығызырақ ортаға (шыны, су) өткенде жарық баяулап, нормальға қарай ауытқиды: n₁ sin α = n₂ sin β. Кері бағытта шекті бұрыштан кейін толық шағылады.'),
    sliders: [
      { id: 'a', label: L('angle α, °', 'угол α, °', 'α бұрышы, °'), min: 0, max: 89, step: C, value: 40 },
      { id: 'n1', label: 'n₁', min: 1, max: 2, step: C, value: 1 },
      { id: 'n2', label: 'n₂', min: 1, max: 2, step: C, value: 1.5 },
    ],
    buttons: [L('Air → glass', 'Воздух → стекло', 'Ауа → шыны'), L('Glass → air', 'Стекло → воздух', 'Шыны → ауа'), L('Air → water', 'Воздух → вода', 'Ауа → су')],
    onButton: (i) => [{ n1: 1, n2: 1.5 }, { n1: 1.5, n2: 1 }, { n1: 1, n2: 1.33 }][i],
    draw(v) {
      const a = (v.a * Math.PI) / 180;
      const s = (v.n1 / v.n2) * Math.sin(a);
      const tir = s > 1;
      const b = tir ? null : Math.asin(s);
      const cx = 160;
      const cy = 110;
      const R = 90;
      const crit = v.n1 > v.n2 ? (Math.asin(v.n2 / v.n1) * 180) / Math.PI : null;
      return {
        svg: `<rect x="0" y="${cy}" width="320" height="110" class="ex-fill exc-b" style="opacity:${0.1 + (v.n2 - 1) * 0.35}"/><rect x="0" y="0" width="320" height="${cy}" class="ex-fill exc-b" style="opacity:${0.1 + (v.n1 - 1) * 0.35}"/>
          <line class="ex-axis" x1="0" y1="${cy}" x2="320" y2="${cy}"/><line class="ex-stroke exc-m ex-dash" x1="${cx}" y1="15" x2="${cx}" y2="205"/>
          ${arrow(cx - R * Math.sin(a), cy - R * Math.cos(a), cx, cy, 'exc-y', 3)}
          ${tir ? arrow(cx, cy, cx + R * Math.sin(a), cy - R * Math.cos(a), 'exc-y', 3) : `${arrow(cx, cy, cx + R * Math.sin(b), cy + R * Math.cos(b), 'exc-o', 3)}<g style="opacity:.35">${arrow(cx, cy, cx + R * 0.6 * Math.sin(a), cy - R * 0.6 * Math.cos(a), 'exc-y', 1.5)}</g>`}
          <text class="ex-tag" x="8" y="20">n₁ = ${fmt(v.n1)} · α = ${fmt(v.a, 1)}°</text><text class="ex-tag" x="8" y="205">n₂ = ${fmt(v.n2)} · ${tir ? u('total reflection', 'полное отражение', 'толық шағылу') : `β = ${fmt((b * 180) / Math.PI, 1)}°`}</text>`,
        caption: tir
          ? L(`sin β would be ${fmt(s)} > 1 - impossible, so the light does not leave: total internal reflection. Critical angle here ≈ ${fmt(crit, 1)}°. That is how optical fibres work.`, `sin β получился бы ${fmt(s)} > 1 - так не бывает, поэтому свет не выходит: полное внутреннее отражение. Предельный угол здесь ≈ ${fmt(crit, 1)}°. Так работает оптоволокно.`, `sin β ${fmt(s)} > 1 болар еді - мұндай болмайды, сондықтан жарық шықпайды: толық ішкі шағылу. Мұнда шекті бұрыш ≈ ${fmt(crit, 1)}°. Оптоталшық осылай жұмыс істейді.`)
          : L(`${fmt(v.n1)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2)} · sin β, so β = ${fmt((b * 180) / Math.PI, 1)}°. ${v.n2 > v.n1 ? 'Into a denser medium the ray bends toward the normal.' : v.n2 < v.n1 ? `Into a less dense medium it bends away from the normal; beyond ${fmt(crit, 1)}° it will not get out at all.` : 'Same medium - no bending.'}`, `${fmt(v.n1)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2)} · sin β, значит β = ${fmt((b * 180) / Math.PI, 1)}°. ${v.n2 > v.n1 ? 'В более плотную среду луч отклоняется к нормали.' : v.n2 < v.n1 ? `В менее плотную - от нормали; после ${fmt(crit, 1)}° он вообще не выйдет.` : 'Среда та же - преломления нет.'}`, `${fmt(v.n1)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2)} · sin β, демек β = ${fmt((b * 180) / Math.PI, 1)}°. ${v.n2 > v.n1 ? 'Тығызырақ ортаға сәуле нормальға қарай ауытқиды.' : v.n2 < v.n1 ? `Тығыздығы аз ортаға - нормальдан алыс; ${fmt(crit, 1)}°-тан кейін мүлдем шықпайды.` : 'Орта бірдей - сыну жоқ.'}`),
      };
    },
  },

  melting: {
    title: L('Heating ice: melting and boiling', 'Нагревание льда: плавление и кипение', 'Мұзды қыздыру: балқу және қайнау'),
    intro: L('While ice melts or water boils, the temperature stays the same - all the heat goes into changing the state. That is why the graph has flat steps.', 'Пока лёд плавится или вода кипит, температура не меняется - вся теплота уходит на смену состояния. Поэтому на графике горизонтальные площадки.', 'Мұз еріп немесе су қайнап жатқанда температура өзгермейді - бүкіл жылу күйді өзгертуге кетеді. Сондықтан графикте көлденең алаңдар бар.'),
    sliders: [{ id: 'Q', label: L('heat given, kJ', 'подведено тепла, кДж', 'берілген жылу, кДж'), min: 0, max: 3100, step: 1, value: 200 }],
    buttons: [L('▶ Heat up', '▶ Нагреть', '▶ Қыздыру')],
    play: 'Q',
    playDur: 9000,
    playLinear: true,
    draw(v) {
      // 1 кг: лёд от −20 °C (c = 2,1), плавление 334 кДж, вода (c = 4,2), кипение 2260 кДж, пар (c = 2,0) до 120 °C.
      const segs = [
        { q: 42, t0: -20, t1: 0 },
        { q: 334, t0: 0, t1: 0 },
        { q: 420, t0: 0, t1: 100 },
        { q: 2260, t0: 100, t1: 100 },
        { q: 40, t0: 100, t1: 120 },
      ];
      const total = segs.reduce((s, x) => s + x.q, 0);
      const T = (Q) => {
        let left = Q;
        for (const s of segs) {
          if (left <= s.q) return s.t0 + ((s.t1 - s.t0) * left) / s.q;
          left -= s.q;
        }
        return 120;
      };
      const phase = (Q) => {
        let acc = 0;
        for (let i = 0; i < segs.length; i++) {
          acc += segs[i].q;
          if (Q <= acc) return i;
        }
        return 4;
      };
      const sx = (q) => 30 + (q / total) * 280;
      const sy = (t) => 190 - ((t + 20) / 140) * 160;
      let d = 'M' + sx(0) + ' ' + sy(-20);
      for (let acc = 0, i = 0; i < segs.length; i++) {
        acc += segs[i].q;
        d += ` L${n1(sx(acc))} ${n1(sy(segs[i].t1))}`;
      }
      const ph = phase(v.Q);
      const names = [L('ice warms', 'лёд нагревается', 'мұз жылиды'), L('ice melts (0 °C)', 'лёд плавится (0 °C)', 'мұз ериді (0 °C)'), L('water warms', 'вода нагревается', 'су жылиды'), L('water boils (100 °C)', 'вода кипит (100 °C)', 'су қайнайды (100 °C)'), L('steam warms', 'пар нагревается', 'бу жылиды')];
      return {
        svg: `<line class="ex-axis" x1="30" y1="190" x2="310" y2="190"/><line class="ex-axis" x1="30" y1="20" x2="30" y2="190"/>
          <text class="ex-tiny" x="18" y="${sy(0) + 4}">0</text><text class="ex-tiny" x="16" y="${sy(100) + 4}">100</text>
          <path class="ex-stroke exc-m" style="fill:none;stroke-width:2;opacity:.4" d="${d}"/><circle class="ex-fill exc-r" cx="${n1(sx(v.Q))}" cy="${n1(sy(T(v.Q)))}" r="6"/>
          <text class="ex-tag" x="40" y="22">t = ${fmt(T(v.Q), 1)} °C · ${tx(names[ph])}</text>`,
        caption: L(
          `Given ${fmt(v.Q, 0)} kJ to 1 kg of ice. Now: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. Melting takes 334 kJ, boiling away 2260 kJ - far more than warming water from 0 to 100 °C (420 kJ).`,
          `Подведено ${fmt(v.Q, 0)} кДж к 1 кг льда. Сейчас: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. На плавление уходит 334 кДж, на выкипание - 2260 кДж: гораздо больше, чем на нагрев воды от 0 до 100 °C (420 кДж).`,
          `1 кг мұзға ${fmt(v.Q, 0)} кДж берілді. Қазір: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. Балқуға 334 кДж, толық қайнап кетуге 2260 кДж кетеді: суды 0-ден 100 °C-қа дейін қыздырудан (420 кДж) әлдеқайда көп.`,
        ),
      };
    },
  },

  pressure: {
    title: L('Pressure in a liquid', 'Давление в жидкости', 'Сұйықтағы қысым'),
    intro: L('The deeper, the higher the pressure: p = ρ g h. It does not depend on the shape of the vessel - only on depth and the liquid.', 'Чем глубже, тем больше давление: p = ρ g h. Оно не зависит от формы сосуда - только от глубины и жидкости.', 'Неғұрлым терең болса, қысым соғұрлым жоғары: p = ρ g h. Ол ыдыстың пішініне тәуелді емес - тек тереңдікке және сұйыққа.'),
    sliders: [
      { id: 'h', label: L('depth h, m', 'глубина h, м', 'тереңдік h, м'), min: 0, max: 100, step: C, value: 10 },
      { id: 'r', label: L('density, kg/m³', 'плотность, кг/м³', 'тығыздық, кг/м³'), min: 700, max: 13600, step: 10, value: 1000 },
    ],
    buttons: [L('Water', 'Вода', 'Су'), L('Sea water', 'Морская вода', 'Теңіз суы'), L('Mercury', 'Ртуть', 'Сынап')],
    onButton: (i) => [{ r: 1000 }, { r: 1030 }, { r: 13600 }][i],
    draw(v) {
      const p = v.r * 10 * v.h;
      const y = 30 + (v.h / 100) * 160;
      const atm = p / 101325;
      return {
        svg: `<rect x="20" y="30" width="180" height="170" class="ex-fill exc-b" style="opacity:${0.15 + Math.min(0.6, v.r / 25000)}"/><line class="ex-stroke exc-b" x1="20" y1="30" x2="200" y2="30"/>
          <circle class="ex-fill exc-o" cx="110" cy="${n1(y)}" r="8"/>${[0, 1, 2, 3].map((k) => arrow(110 + 22 * Math.cos((k * Math.PI) / 2), y + 22 * Math.sin((k * Math.PI) / 2), 110 + 10 * Math.cos((k * Math.PI) / 2), y + 10 * Math.sin((k * Math.PI) / 2), 'exc-r', Math.min(4, 1 + atm / 3))).join('')}
          <text class="ex-tag" x="210" y="60">p = ρgh</text><text class="ex-big" x="262" y="100">${fmt(p / 1000, 1)}</text><text class="ex-small" x="262" y="120">${u('kPa', 'кПа', 'кПа')}</text><text class="ex-tag" x="210" y="150">≈ ${fmt(atm, 2)} ${u('atm', 'атм', 'атм')}</text>`,
        caption: L(
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} kPa (plus the atmosphere on top). In water every 10 m adds about 1 atmosphere. The pressure pushes equally in all directions.`,
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа (плюс атмосферное сверху). В воде каждые 10 м добавляют примерно 1 атмосферу. Давление действует одинаково во все стороны.`,
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа (үстінен атмосфералық қысым қосылады). Суда әр 10 м шамамен 1 атмосфера қосады. Қысым барлық жаққа бірдей әсер етеді.`,
        ),
      };
    },
  },
};

// Данные для сцен.

const ATOM_R = { H: 5.5, O: 8, N: 8, Mg: 9 };
const REACTIONS = [
  { f: ['H₂', 'O₂', 'H₂O'], mol: [{ atoms: ['H', 'H'] }, { atoms: ['O', 'O'] }, { atoms: ['H', 'O', 'H'] }], ans: [2, 1, 2] },
  { f: ['N₂', 'H₂', 'NH₃'], mol: [{ atoms: ['N', 'N'] }, { atoms: ['H', 'H'] }, { atoms: ['H', 'N', 'H', 'H'] }], ans: [1, 3, 2] },
  { f: ['Mg', 'O₂', 'MgO'], mol: [{ atoms: ['Mg'] }, { atoms: ['O', 'O'] }, { atoms: ['Mg', 'O'] }], ans: [2, 1, 2] },
];

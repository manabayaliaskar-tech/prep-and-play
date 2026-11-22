// Второй закон Ньютона с трением: силы на тележке, движение, график v(t), задания.
const G = 9.8;
const nwtA = (F, m, mu) => Math.max(0, (F - mu * m * G) / m);
const nwtTask = () => {
  const type = ri(0, 2);
  for (let g = 0; g < 300; g++) {
    if (type === 0) {
      const m = pick([1, 2, 4, 5]);
      const mu = pick([0, 0.1, 0.2]);
      const a = pick([0.5, 1, 1.5, 2, 3]);
      const F = m * (a + mu * G);
      if (F <= 19.5) return { type, m, mu, a, F };
    } else if (type === 1) {
      const m = pick([1, 2, 2.5, 4, 5, 8]);
      const F = ri(4, 20);
      const a = F / m;
      if (Math.abs(a * 10 - Math.round(a * 10)) < 1e-9 && a <= 10) return { type, m, mu: 0, a, F };
    } else {
      const m = pick([2, 3, 4, 5]);
      const mu = pick([0.2, 0.3, 0.4]);
      const F = mu * m * G;
      if (F <= 19.5) return { type, m, mu, a: 0, F };
    }
  }
  return { type: 0, m: 2, mu: 0, a: 2, F: 4 };
};

//@@SCENE
  newton: {
    title: L("Newton's second law: F = m · a", 'Второй закон Ньютона: F = m · a', 'Ньютонның екінші заңы: F = m · a'),
    intro: L('The resultant force gives the body an acceleration a = F / m. Friction Fтр = μmg works against the motion.', 'Равнодействующая сила сообщает телу ускорение a = F / m. Сила трения Fтр = μmg мешает движению.', 'Тең әсерлі күш денеге a = F / m үдеу береді. Үйкеліс күші Fүйк = μmg қозғалысқа кедергі жасайды.'),
    sliders: [
      { id: 'F', label: L('F, N', 'F, Н', 'F, Н'), min: 0, max: 20, step: 0.1, value: 8, hidden: (v, st) => st.m === 1 && st.task.type === 1 },
      { id: 'm', label: L('m, kg', 'm, кг', 'm, кг'), min: 0.5, max: 10, step: 0.1, value: 2, hidden: (v, st) => st.m === 1 && st.task.type !== 1 },
      { id: 'mu', label: L('friction μ', 'трение μ', 'үйкеліс μ'), min: 0, max: 0.6, step: 0.01, value: 0.1, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('▶ Push', '▶ Толкнуть', '▶ Итеру'), L('F × 2', 'F × 2', 'F × 2'), L('m × 2', 'm × 2', 'm × 2'), TASK, FREE],
    state: () => ({ m: 0, t: 1.5, run: false, task: null }),
    pressed: (i, v, st) => i === 3 && st.m === 1,
    btnHidden: (i, v, st) => (st.m === 1 ? i === 1 || i === 2 : i === 4),
    onButton(i, st, v) {
      if (i === 0) {
        st.t = reduced() ? 3 : 0;
        st.run = !reduced();
        return null;
      }
      st.t = 3;
      st.run = false;
      if (i === 1) return { F: clamp(v.F * 2, 0, 20) };
      if (i === 2) return { m: clamp(v.m * 2, 0.5, 10) };
      if (i === 4) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.task = nwtTask();
      const k = st.task;
      return k.type === 1 ? { F: k.F, mu: 0, m: 10 } : { m: k.m, mu: k.mu, F: 0 };
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.t = Math.min(3, st.t + dt);
      if (st.t >= 3) st.run = false;
    },
    draw(v, step, st) {
      const { F, m, mu } = v;
      const fmax = mu * m * G;
      const moving = F > fmax + 1e-9;
      const fr = moving ? fmax : F;
      const a = nwtA(F, m, mu);
      const t = st.t;
      const s = (a * t * t) / 2;
      const vel = a * t;
      const s3 = a * 4.5;
      const Ltr = [1, 2, 5, 10, 20, 50, 100, 200].find((x) => x >= s3) ?? 200;
      const X0 = 62;
      const px = 200 / Ltr;
      const cw = 30 + m * 2.6;
      const ch = 18 + m * 1.2;
      const gy = 168;
      const x = X0 + s * px;
      const cy = gy - 6 - ch / 2;
      // Масштаб сил: самая большая сила - 46 px.
      const k = 46 / Math.max(F, m * G, 1);
      let ticks = '';
      for (let i = 0; i <= 5; i++) ticks += `${ln(X0 + (i * 200) / 5, gy, X0 + (i * 200) / 5, gy + 4, 'exc-m', 1)}${tt(X0 + (i * 200) / 5, gy + 22, fmt((i * Ltr) / 5, 1), 'exs-s')}`;
      const cart = `<g transform="translate(${n1(x)} 0)"><rect class="ex-cart" x="0" y="${n1(gy - 6 - ch)}" width="${n1(cw)}" height="${n1(ch)}" rx="4"/><circle class="ex-wheel" cx="${n1(cw * 0.25)}" cy="${gy - 4}" r="4"/><circle class="ex-wheel" cx="${n1(cw * 0.75)}" cy="${gy - 4}" r="4"/>${tt(cw / 2, cy + 4, `${fmt(m, 1)} ${UN.kg()}`, 'exs-t ex-cartt')}</g>`;
      const cxm = x + cw / 2;
      const forces = `${F > 0.05 ? varrow(x - F * k - 6, cy, x - 2, cy, 'exc-o', '', 2.5) + tt(x - F * k - 10, cy + 4, 'F', 'exs-t ex-end tc exc-o') : '<g/><g/>'}
        ${fr > 0.05 ? varrow(x + cw, gy + 7, x + cw - fr * k - 4, gy + 7, 'exc-r', '', 2.5) + tt(x + cw + 3, gy + 11, u('Ffr', 'Fтр', 'Fүйк'), 'exs-s ex-start tc exc-r') : '<g/><g/>'}
        ${varrow(cxm, cy, cxm, cy + m * G * k, 'exc-b', 'mg', 2, -13, -2)}${varrow(cxm, cy, cxm, cy - m * G * k, 'exc-g', 'N', 2, 9, 6)}
        ${a > 0.005 ? varrow(x - 30, gy - 12 - ch, x - 4, gy - 12 - ch, 'exc-p', 'a', 2, -13, -5) : '<g/>'}`;
      // График v(t) в правом верхнем углу.
      const vmax = Math.max(1, nwtA(20, m, mu) * 3);
      const gx = (tt2) => 232 + tt2 * 26;
      const gyv = (vv) => 66 - (vv / vmax) * 48;
      const graph = `${box(214, 4, 104, 80)}<line class="ex-axis" x1="232" y1="66" x2="314" y2="66"/><line class="ex-axis" x1="232" y1="66" x2="232" y2="14"/>
        ${tt(312, 78, 't, ' + UN.s(), 'exs-s ex-end')}${tt(236, 16, 'v', 'exs-s ex-start')}
        ${ln(232, 66, gx(3), gyv(a * 3), 'exc-p ex-faint', 1.5)}${ln(232, 66, gx(t), gyv(vel), 'exc-p', 2.5)}<circle class="ex-dot" cx="${n1(gx(t))}" cy="${n1(gyv(vel))}" r="3.5"/>`;
      const info = `${box(4, 4, 200, 62)}${tt(10, 20, `a = (F − μmg) / m = ${fmt(a, 2)} ${UN.ms2()}`, 'exs-t ex-start')}${tt(10, 36, `${u('t', 't', 't')} = ${fmt(t, 1)} ${UN.s()}: v = a·t = ${fmt(vel, 2)} ${UN.ms()}`, 'exs-t ex-start')}${tt(10, 52, `s = a·t²/2 = ${fmt(s, 2)} ${UN.m()}`, 'exs-t ex-start')}`;
      const svg = `<line class="ex-axis" x1="10" y1="${gy}" x2="312" y2="${gy}" style="stroke-width:2"/>${ticks}${tt(300, gy + 22, UN.m(), 'exs-s')}
        ${mu > 0 ? `<rect x="10" y="${gy}" width="302" height="4" class="ex-fill exc-m" style="opacity:${n1(0.1 + mu)}"/>` : '<g/>'}${cart}${forces}${graph}${info}`;
      const fric = u(
        `Friction Fтр = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9.8 = ${fmt(fmax, 2)} N.`,
        `Трение Fтр = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9,8 = ${fmt(fmax, 2)} Н.`,
        `Үйкеліс Fүйк = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9,8 = ${fmt(fmax, 2)} Н.`,
      );
      let caption = moving
        ? u(
            `${fric} Resultant F − Fтр = ${fmt(F - fr, 2)} N, so a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} m/s². Twice the force - more acceleration, twice the mass - less.`,
            `${fric} Равнодействующая F − Fтр = ${fmt(F - fr, 2)} Н, поэтому a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} м/с². Больше сила - больше ускорение, больше масса - меньше.`,
            `${fric} Тең әсерлі күш F − Fүйк = ${fmt(F - fr, 2)} Н, сондықтан a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} м/с². Күш көп - үдеу көп, масса көп - үдеу аз.`,
          )
        : u(
            `F = ${fmt(F, 1)} N is not more than the maximum friction ${fmt(fmax, 2)} N: the cart stays, static friction equals F and a = 0.`,
            `F = ${fmt(F, 1)} Н не больше наибольшей силы трения ${fmt(fmax, 2)} Н: тележка стоит, трение покоя равно F, a = 0.`,
            `F = ${fmt(F, 1)} Н ең үлкен үйкеліс күшінен ${fmt(fmax, 2)} Н артық емес: арба тұр, тыныштық үйкелісі F-ке тең, a = 0.`,
          );
      let extra = '';
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        if (q.type === 0) {
          ok = near(a, q.a, 0.05);
          goal = u(`a cart of ${q.m} kg, μ = ${fmt(q.mu, 1)}. Find the force that gives a = ${fmt(q.a, 1)} m/s².`, `тележка ${q.m} кг, μ = ${fmt(q.mu, 1)}. Подбери силу, чтобы ускорение было a = ${fmt(q.a, 1)} м/с².`, `арба ${q.m} кг, μ = ${fmt(q.mu, 1)}. Үдеу a = ${fmt(q.a, 1)} м/с² болатындай күшті тап.`);
          hint = u(`Now a = ${fmt(a, 2)} m/s². Use F = m·a + μmg.`, `Сейчас a = ${fmt(a, 2)} м/с². Подсказка: F = m·a + μmg.`, `Қазір a = ${fmt(a, 2)} м/с². Кеңес: F = m·a + μmg.`);
          done = `F = ${q.m}·${fmt(q.a, 1)} + ${fmt(q.mu, 1)}·${q.m}·9,8 = ${fmt(q.F, 2)} ${UN.N()}.`;
        } else if (q.type === 1) {
          ok = near(m, q.m, 0.05);
          goal = u(`a force of ${q.F} N, no friction. What mass gets a = ${fmt(q.a, 1)} m/s²?`, `сила ${q.F} Н, трения нет. Какая масса получит ускорение a = ${fmt(q.a, 1)} м/с²?`, `күш ${q.F} Н, үйкеліс жоқ. Қандай масса a = ${fmt(q.a, 1)} м/с² үдеу алады?`);
          hint = u(`Now a = ${fmt(a, 2)} m/s². m = F / a.`, `Сейчас a = ${fmt(a, 2)} м/с². m = F / a.`, `Қазір a = ${fmt(a, 2)} м/с². m = F / a.`);
          done = `m = F / a = ${q.F} / ${fmt(q.a, 1)} = ${fmt(q.m, 1)} ${UN.kg()}.`;
        } else {
          ok = F > q.F - 0.02 && F <= q.F + 0.2;
          goal = u(`a cart of ${q.m} kg, μ = ${fmt(q.mu, 1)}. Find the smallest force that starts it moving.`, `тележка ${q.m} кг, μ = ${fmt(q.mu, 1)}. Найди наименьшую силу, которая сдвинет её с места.`, `арба ${q.m} кг, μ = ${fmt(q.mu, 1)}. Оны орнынан қозғайтын ең кіші күшті тап.`);
          hint = F < q.F ? u('The cart does not move yet - push harder.', 'Тележка пока стоит - толкни сильнее.', 'Арба әлі тұр - қаттырақ ит.') : u('It moves, but the force is bigger than needed.', 'Едет, но сила больше, чем нужно.', 'Қозғалды, бірақ күш қажеттіден көп.');
          done = `F = μmg = ${fmt(q.mu, 1)} · ${q.m} · 9,8 = ${fmt(q.F, 2)} ${UN.N()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        extra = taskBadge(ok, 318, 100);
      }
      return { svg: svg + extra, caption };
    },
  },

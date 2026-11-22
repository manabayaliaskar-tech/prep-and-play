// Атом: элементы 1-20, протоны, нейтроны, электроны по слоям и подуровням, ионы, изотопы, задания.
const EL = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca'.split(' ');
const EL_EN = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium'.split(' ');
const EL_RU = 'Водород Гелий Литий Бериллий Бор Углерод Азот Кислород Фтор Неон Натрий Магний Алюминий Кремний Фосфор Сера Хлор Аргон Калий Кальций'.split(' ');
const EL_KK = 'Сутек Гелий Литий Бериллий Бор Көміртек Азот Оттек Фтор Неон Натрий Магний Алюминий Кремний Фосфор Күкірт Хлор Аргон Калий Кальций'.split(' ');
const EL_AR = [1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35.5, 40, 39, 40];
// Нейтроны изотопов: первый - самый распространённый; радиоактивные помечены в ISO_RAD (Z-A).
const EL_ISO = [[0, 1, 2], [2, 1], [4, 3], [5], [6, 5], [6, 7, 8], [7, 8], [8, 9, 10], [10], [10, 12, 11], [12], [12, 13, 14], [14], [14, 15, 16], [16], [16, 18, 17], [18, 20], [22, 18, 20], [20, 22, 21], [20, 24, 22]];
const ISO_RAD = ['1-3', '6-14', '19-40'];
const EL_ION = [1, 0, 1, 2, 0, 0, -3, -2, -1, 0, 1, 2, 3, 0, -3, -2, -1, 0, 1, 2];
const EL_KIND = [0, 2, 1, 1, 0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 2, 1, 1];
const elName = (z) => u(EL_EN[z - 1], EL_RU[z - 1], EL_KK[z - 1]);
const elLow = (z) => u(EL_EN[z - 1], EL_RU[z - 1].toLowerCase(), EL_KK[z - 1].toLowerCase());
const shellsOf = (e) => {
  const out = [];
  for (let left = e, i = 0, cap = [2, 8, 8, 2]; left > 0 && i < 4; i++) out.push(Math.min(left, cap[i])), (left -= cap[i]);
  return out;
};
const configOf = (e) => {
  const subs = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];
  const out = [];
  for (let left = e, i = 0; left > 0 && i < subs.length; i++) out.push(`${subs[i][0]}${sup(Math.min(left, subs[i][1]))}`), (left -= subs[i][1]);
  return out.join(' ') || '-';
};
const chargeSup = (q) => (q === 0 ? '' : `${Math.abs(q) > 1 ? sup(Math.abs(q)) : ''}${q > 0 ? '⁺' : '⁻'}`);
const groupOf = (z) => {
  const val = z === 2 ? 8 : shellsOf(z).at(-1);
  return `${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][val - 1]}A`;
};
const atomTask = () => {
  const type = ri(0, 3);
  const z = ri(3, 20);
  if (type === 1) {
    const iso = EL_ISO[z - 1];
    return { type, z, n: iso.length > 1 ? iso[1] : iso[0] };
  }
  if (type === 2) {
    const zi = pick([3, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20]);
    return { type, z: zi, e: zi - EL_ION[zi - 1] };
  }
  return { type, z };
};

//@@SCENE
  atom: {
    title: L('Atom: protons, neutrons, electrons', 'Атом: протоны, нейтроны, электроны', 'Атом: протондар, нейтрондар, электрондар'),
    intro: L('Z is the number of protons and (in a neutral atom) electrons. Electrons fill layers 2, 8, 8, ...; the outer ones decide the chemistry.', 'Z - число протонов и (в нейтральном атоме) электронов. Электроны заполняют слои по 2, 8, 8, ...; внешние решают химию.', 'Z - протондар саны және (бейтарап атомда) электрондар саны. Электрондар қабаттарды 2, 8, 8, ... толтырады; сыртқылары химияны шешеді.'),
    sliders: [
      { id: 'Z', label: L('Z (protons)', 'Z (протоны)', 'Z (протондар)'), min: 1, max: 20, step: 1, value: 11 },
      { id: 'N', label: L('N (neutrons)', 'N (нейтроны)', 'N (нейтрондар)'), min: 0, max: 24, step: 1, value: 12, hidden: (v, st) => !(st.m === 2 || (st.m === 3 && st.task.type === 1)) },
      { id: 'e', label: L('electrons', 'электроны', 'электрондар'), min: 0, max: 20, step: 1, value: 11, hidden: (v, st) => !(st.m === 1 || (st.m === 3 && st.task.type === 2)) },
    ],
    buttons: [L('Atom', 'Атом', 'Атом'), L('Ion', 'Ион', 'Ион'), L('Isotopes ↻', 'Изотопы ↻', 'Изотоптар ↻'), TASK],
    state: () => ({ ph: 0, m: 0, z: 11, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st, v) {
      const z = Math.round(v.Z);
      if (i === 0) {
        st.m = 0;
        return { e: z, N: EL_ISO[z - 1][0] };
      }
      if (i === 1) {
        st.m = 1;
        return { e: z - EL_ION[z - 1] };
      }
      if (i === 2) {
        const iso = EL_ISO[z - 1];
        const k = st.m === 2 ? (iso.indexOf(Math.round(v.N)) + 1) % iso.length : 0;
        st.m = 2;
        return { N: iso[k], e: z };
      }
      st.m = 3;
      st.task = atomTask();
      st.z = 1;
      return { Z: 1, N: 0, e: 1 };
    },
    live(dt, v, st) {
      st.ph = (st.ph + dt * 0.5) % (Math.PI * 2);
    },
    draw(v, step, st) {
      const z = clamp(Math.round(v.Z), 1, 20);
      // Сменили элемент - нейтроны и электроны подстраиваются под него.
      if (z !== st.z) {
        st.z = z;
        v.N = EL_ISO[z - 1][0];
        v.e = st.m === 1 ? z - EL_ION[z - 1] : z;
      }
      const N = Math.round(v.N);
      const e = Math.round(v.e);
      const q = z - e;
      const A = z + N;
      const sh = shellsOf(e);
      const cx = 92;
      const cy = 112;
      // Ядро: протоны (красные) и нейтроны (серые) «подсолнухом».
      let nuc = '';
      const ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < A; i++) {
        const r = 2.45 * Math.sqrt(i + 0.5);
        const isP = Math.floor(((i + 1) * z) / A) > Math.floor((i * z) / A);
        nuc += `<circle class="ex-fill ${isP ? 'exc-r' : 'exc-m'}" cx="${n1(cx + r * Math.cos(i * ga))}" cy="${n1(cy + r * Math.sin(i * ga))}" r="2.7" style="stroke:var(--card);stroke-width:.6"/>`;
      }
      const rings = sh
        .map((cnt, i) => {
          const r = 30 + i * 18;
          const dots = Array.from({ length: cnt }, (_, k) => {
            const a = st.ph * (1 - i * 0.18) + (k / cnt) * Math.PI * 2;
            return `<circle class="ex-fill exc-b" cx="${n1(cx + r * Math.cos(a))}" cy="${n1(cy + r * Math.sin(a))}" r="3.3"/>`;
          }).join('');
          return `<circle class="ex-stroke exc-m" style="stroke-width:1;opacity:.6" cx="${cx}" cy="${cy}" r="${r}"/>${dots}${tt(cx + r * 0.71 + 3, cy - r * 0.71 - 2, String(cnt), 'exs-s ex-start tc exc-b')}`;
        })
        .join('');
      const isoKey = `${z}-${A}`;
      const natural = EL_ISO[z - 1].includes(N);
      const rad2 = ISO_RAD.includes(isoKey);
      const kind = [u('non-metal', 'неметалл', 'бейметалл'), u('metal', 'металл', 'металл'), u('noble gas', 'благородный газ', 'асыл газ')][EL_KIND[z - 1]];
      const val = sh.at(-1) ?? 0;
      const sym = `${EL[z - 1]}${chargeSup(q)}`;
      const card = `${box(176, 4, 140, 212)}
        ${tt(184, 20, String(z), 'exs-t ex-start')}${tt(310, 20, `Ar = ${fmt(EL_AR[z - 1], 1)}`, 'exs-s ex-end')}
        ${tt(246, 50, sym, 'ex-big')}${tt(246, 66, elName(z), 'exs-t')}
        ${tt(184, 86, `p⁺ = ${z}`, 'exs-t ex-start tc exc-r')}${tt(234, 86, `n⁰ = ${N}`, 'exs-t ex-start tc exc-m')}${tt(278, 86, `e⁻ = ${e}`, 'exs-t ex-start tc exc-b')}
        ${tt(184, 104, `A = Z + N = ${A}: ${sup(A)}${EL[z - 1]}`, 'exs-t ex-start')}
        ${tt(184, 122, `${u('layers', 'слои', 'қабаттар')}: ${sh.join(', ') || '-'}`, 'exs-t ex-start')}
        ${tt(184, 138, configOf(e), 'exs-s ex-start tc exc-b')}
        ${tt(184, 156, `${u('period', 'период', 'период')} ${shellsOf(z).length} · ${u('group', 'группа', 'топ')} ${groupOf(z)}`, 'exs-t ex-start')}
        ${tt(184, 172, kind, 'exs-s ex-start')}
        ${tt(184, 192, st.m === 2 || !natural || rad2 ? `${EL[z - 1]}-${A}: ${rad2 ? u('radioactive', 'радиоактивный', 'радиоактивті') : natural ? u('stable isotope', 'устойчивый изотоп', 'тұрақты изотоп') : u('not found in nature', 'в природе нет', 'табиғатта жоқ')}` : `${u('outer electrons', 'внешних e⁻', 'сыртқы e⁻')}: ${val}`, `exs-s ex-start tc ${rad2 || !natural ? 'exc-o' : 'exc-g'}`)}
        ${tt(184, 208, q === 0 ? u('neutral atom', 'нейтральный атом', 'бейтарап атом') : `${u('ion', 'ион', 'ион')} ${sym}: ${q > 0 ? u(`gave away ${q} e⁻`, `отдал ${q} e⁻`, `${q} e⁻ берді`) : u(`took ${-q} e⁻`, `принял ${-q} e⁻`, `${-q} e⁻ қосып алды`)}`, `exs-s ex-start tc ${q === 0 ? 'exc-m' : q > 0 ? 'exc-r' : 'exc-b'}`)}`;
      const svg = `${rings}${nuc}${card}`;
      const pRu = `${z} ${ruN(z, 'протон', 'протона', 'протонов')}, ${N} ${ruN(N, 'нейтрон', 'нейтрона', 'нейтронов')}, ${e} ${ruN(e, 'электрон', 'электрона', 'электронов')}`;
      let caption;
      if (st.m === 1)
        caption = q === 0
          ? u(`${EL[z - 1]} has no typical ion${EL_KIND[z - 1] === 2 ? ': its outer layer is already full' : ''}. Change the electrons to make one.`, `У ${EL[z - 1]} нет типичного иона${EL_KIND[z - 1] === 2 ? ': внешний слой уже заполнен' : ''}. Измени число электронов, чтобы получить ион.`, `${EL[z - 1]}-да типтік ион жоқ${EL_KIND[z - 1] === 2 ? ': сыртқы қабаты толық' : ''}. Ион алу үшін электрондар санын өзгерт.`)
          : u(
              `${sym}: ${z} protons and ${e} electrons, charge ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'A metal gives away its outer electrons' : 'A non-metal takes electrons'}, and the ion gets the layers ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - like a noble gas' : ''}.`,
              `${sym}: ${z} ${ruN(z, 'протон', 'протона', 'протонов')} и ${e} ${ruN(e, 'электрон', 'электрона', 'электронов')}, заряд ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'Металл отдаёт внешние электроны' : 'Неметалл принимает электроны'}, и у иона слои ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - как у благородного газа' : ''}.`,
              `${sym}: ${z} протон және ${e} электрон, заряды ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'Металл сыртқы электрондарын береді' : 'Бейметалл электрон қосып алады'}, ионның қабаттары ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - асыл газдағыдай' : ''}.`,
            );
      else if (st.m === 2)
        caption = u(
          `Isotopes of ${elName(z)} have the same Z = ${z} but different numbers of neutrons. ${EL[z - 1]}-${A}: ${N} neutrons, mass number A = ${z} + ${N} = ${A}. Press «Isotopes» again for the next one. Ar = ${fmt(EL_AR[z - 1], 1)} is the average over natural isotopes.`,
          `Изотопы элемента ${elLow(z)} (${EL[z - 1]}) - одинаковый Z = ${z}, но разное число нейтронов. ${EL[z - 1]}-${A}: ${N} ${ruN(N, 'нейтрон', 'нейтрона', 'нейтронов')}, массовое число A = ${z} + ${N} = ${A}. Нажми «Изотопы» ещё раз - следующий. Ar = ${fmt(EL_AR[z - 1], 1)} - среднее по природным изотопам.`,
          `${elName(z)} изотоптарында Z = ${z} бірдей, нейтрондар саны әртүрлі. ${EL[z - 1]}-${A}: ${N} нейтрон, массалық сан A = ${z} + ${N} = ${A}. Келесісі үшін «Изотоптар» батырмасын тағы бас. Ar = ${fmt(EL_AR[z - 1], 1)} - табиғи изотоптардың орташасы.`,
        );
      else
        caption = u(
          `${elName(z)} (${EL[z - 1]}): ${z} protons, ${N} neutrons, ${e} electrons. Layers ${sh.join(', ')}: ${sh.length} layers → period ${sh.length}; ${EL_KIND[z - 1] === 2 ? 'the outer layer is full - a noble gas' : `${val} outer electron${val > 1 ? 's' : ''} → group ${groupOf(z)}`}. Formula: ${configOf(e)}.`,
          `${elName(z)} (${EL[z - 1]}): ${pRu}. Слои ${sh.join(', ')}: ${sh.length} ${ruN(sh.length, 'слой', 'слоя', 'слоёв')} → ${sh.length} период; ${EL_KIND[z - 1] === 2 ? 'внешний слой заполнен - благородный газ' : `${val} ${ruN(val, 'электрон', 'электрона', 'электронов')} снаружи → группа ${groupOf(z)}`}. Формула: ${configOf(e)}.`,
          `${elName(z)} (${EL[z - 1]}): ${z} протон, ${N} нейтрон, ${e} электрон. Қабаттар ${sh.join(', ')}: ${sh.length} қабат → ${sh.length}-период; ${EL_KIND[z - 1] === 2 ? 'сыртқы қабаты толық - асыл газ' : `сыртта ${val} электрон → ${groupOf(z)} топ`}. Формуласы: ${configOf(e)}.`,
        );
      if (st.m === 3) {
        const k = st.task;
        let ok;
        let goal;
        let done;
        const ks = shellsOf(k.z);
        if (k.type === 0) {
          ok = z === k.z && e === z;
          goal = u(`find the element whose atom has ${ks.length} electron layers and ${ks.at(-1)} electrons on the outer one.`, `найди элемент, у атома которого ${ks.length} ${ruN(ks.length, 'электронный слой', 'электронных слоя', 'электронных слоёв')} и ${ks.at(-1)} ${ruN(ks.at(-1), 'электрон', 'электрона', 'электронов')} на внешнем.`, `атомында ${ks.length} электрон қабаты және сыртқы қабатында ${ks.at(-1)} электрон бар элементті тап.`);
          done = u(`It is ${elName(k.z)}: layers ${ks.join(', ')}, period ${ks.length}, group ${groupOf(k.z)}.`, `Это ${elLow(k.z)}: слои ${ks.join(', ')}, период ${ks.length}, группа ${groupOf(k.z)}.`, `Бұл ${elLow(k.z)}: қабаттар ${ks.join(', ')}, ${ks.length}-период, ${groupOf(k.z)} топ.`);
        } else if (k.type === 1) {
          ok = z === k.z && N === k.n;
          goal = u(`build the nucleus of ${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}): choose Z and N.`, `собери ядро ${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}): подбери Z и N.`, `${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}) ядросын құрастыр: Z мен N-ді тап.`);
          done = `Z = ${k.z}, N = A − Z = ${k.z + k.n} − ${k.z} = ${k.n}.`;
        } else if (k.type === 2) {
          const qq = k.z - k.e;
          ok = z === k.z && e === k.e;
          goal = u(`build the ion ${EL[k.z - 1]}${chargeSup(qq)}: choose Z and the number of electrons.`, `собери ион ${EL[k.z - 1]}${chargeSup(qq)}: подбери Z и число электронов.`, `${EL[k.z - 1]}${chargeSup(qq)} ионын құрастыр: Z мен электрондар санын тап.`);
          done = `e⁻ = Z − (${qq > 0 ? '+' : '−'}${Math.abs(qq)}) = ${k.z} ${qq > 0 ? '−' : '+'} ${Math.abs(qq)} = ${k.e}.`;
        } else {
          ok = z === k.z && e === z;
          goal = u(`which element has the electron formula ${configOf(k.z)}?`, `у какого элемента электронная формула ${configOf(k.z)}?`, `қай элементтің электрондық формуласы ${configOf(k.z)}?`);
          done = u(`Add the upper numbers: ${k.z} electrons → ${elName(k.z)}.`, `Сложи верхние цифры: ${k.z} электронов → ${elLow(k.z)}.`, `Жоғарғы сандарды қос: ${k.z} электрон → ${elLow(k.z)}.`);
        }
        caption = taskCap(goal, ok, u(`Now: ${EL[z - 1]}, Z = ${z}.`, `Сейчас: ${EL[z - 1]}, Z = ${z}.`, `Қазір: ${EL[z - 1]}, Z = ${z}.`), done);
        return { svg: svg + taskBadge(ok, 170, 14), caption };
      }
      return { svg, caption };
    },
  },

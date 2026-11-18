// Физика: расчётные задачи (генераторы) и вопросы на знание законов и единиц (банк).
// Ускорение свободного падения во всех задачах принято равным 10 м/с².

import { pick, randomInt } from '../../core/random.js';
import { T } from '../bank.js';
import { PHYSICS_MORE } from './science-more.js';
import { L, ask, dec, n, poolQ, same, steps } from '../gen.js';
import { frac } from '../math/fractions.js';
import { PHYSICS_MORE2 } from './science-more2.js';

const TIMES = '×';
const DIV = '÷';
const MINUS = '−';
const G_NOTE = L('Take g = 10 m/s².', 'Считай g = 10 м/с².', 'g = 10 м/с² деп ал.');
const withG = (text) => L(`${text.en} ${G_NOTE.en}`, `${text.ru} ${G_NOTE.ru}`, `${text.kk} ${G_NOTE.kk}`);

export function kinematics(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const v = randomInt(rng, 2, 25);
    const t = randomInt(rng, 3, 20);
    const s = v * t;
    const kind = randomInt(rng, 0, 2);
    if (kind === 0) {
      return poolQ('p.kin', d, {
        prompt: L(
          `A body moves uniformly at ${v} m/s. What distance (in metres) does it cover in ${t} s?`,
          `Тело движется равномерно со скоростью ${v} м/с. Какой путь (в метрах) оно пройдёт за ${t} с?`,
          `Дене ${v} м/с жылдамдықпен бірқалыпты қозғалады. Ол ${t} с ішінде қандай жол (метрмен) жүреді?`,
        ),
        ex: steps(same('<i>s</i> = <i>v</i> · <i>t</i>'), same(`<i>s</i> = ${v} ${TIMES} ${t} = ${s}`)),
        ...ask(ctx, s, [v + t, s + v, s - v, s * 2]),
      });
    }
    if (kind === 1) {
      return poolQ('p.kin', d, {
        prompt: L(
          `A body moving uniformly covers ${s} m in ${t} s. Find its speed in m/s.`,
          `Тело, двигаясь равномерно, прошло ${s} м за ${t} с. Найди его скорость в м/с.`,
          `Дене бірқалыпты қозғалып, ${t} с ішінде ${s} м жол жүрді. Оның жылдамдығын м/с-пен тап.`,
        ),
        ex: steps(same('<i>v</i> = <i>s</i> / <i>t</i>'), same(`<i>v</i> = ${s} ${DIV} ${t} = ${v}`)),
        ...ask(ctx, v, [v + 1, v - 1, v + 2, s - t].filter((x) => x !== v && x > 0)),
      });
    }
    return poolQ('p.kin', d, {
      prompt: L(
        `A body moves uniformly at ${v} m/s. In how many seconds will it cover ${s} m?`,
        `Тело движется равномерно со скоростью ${v} м/с. За сколько секунд оно пройдёт ${s} м?`,
        `Дене ${v} м/с жылдамдықпен бірқалыпты қозғалады. Ол ${s} м жолды неше секундта жүріп өтеді?`,
      ),
      ex: steps(same('<i>t</i> = <i>s</i> / <i>v</i>'), same(`<i>t</i> = ${s} ${DIV} ${v} = ${t}`)),
      ...ask(ctx, t, [t + 1, t - 1, t + 2, t * 2].filter((x) => x !== t && x > 0)),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 1, 5);
    const t = randomInt(rng, 2, 10);
    const v0 = randomInt(rng, 0, 12);
    const v = v0 + a * t;
    if (rng() < 0.5) {
      return poolQ('p.kin', d, {
        prompt: L(
          `The speed of a car increased uniformly from ${v0} m/s to ${v} m/s in ${t} s. Find its acceleration in m/s².`,
          `Скорость автомобиля равномерно увеличилась с ${v0} м/с до ${v} м/с за ${t} с. Найди его ускорение в м/с².`,
          `Автомобильдің жылдамдығы ${t} с ішінде ${v0} м/с-тан ${v} м/с-қа дейін бірқалыпты артты. Оның үдеуін м/с²-пен тап.`,
        ),
        ex: steps(
          same(`<i>a</i> = ${frac('<i>v</i> − <i>v</i><sub>0</sub>', '<i>t</i>')}`),
          same(`<i>a</i> = ${frac(`${v} ${MINUS} ${v0}`, t)} = ${a}`),
        ),
        ...ask(ctx, a, [a + 1, v / t, a + 2, (v + v0) / t].filter((x) => x !== a && Number.isInteger(x) && x > 0)),
      });
    }
    return poolQ('p.kin', d, {
      prompt: L(
        `A body starts with a speed of ${v0} m/s and moves with an acceleration of ${a} m/s². What will its speed (in m/s) be after ${t} s?`,
        `Тело имеет начальную скорость ${v0} м/с и движется с ускорением ${a} м/с². Какой будет его скорость (в м/с) через ${t} с?`,
        `Дененің бастапқы жылдамдығы ${v0} м/с, ол ${a} м/с² үдеумен қозғалады. ${t} с өткенде оның жылдамдығы (м/с-пен) қандай болады?`,
      ),
      ex: steps(same('<i>v</i> = <i>v</i><sub>0</sub> + <i>a</i> · <i>t</i>'), same(`<i>v</i> = ${v0} + ${a} ${TIMES} ${t} = ${v}`)),
      ...ask(ctx, v, [a * t, v0 * a + t, v + a, v - a].filter((x) => x !== v && x > 0)),
    });
  }
  if (rng() < 0.5) {
    const t = randomInt(rng, 2, 8);
    const h = 5 * t * t;
    return poolQ('p.kin', d, {
      prompt: withG(L(
        `A stone falls freely without initial speed for ${t} s. What distance (in metres) does it fall?`,
        `Камень свободно падает без начальной скорости в течение ${t} с. Какое расстояние (в метрах) он пролетит?`,
        `Тас бастапқы жылдамдықсыз ${t} с бойы еркін түседі. Ол қандай қашықтыққа (метрмен) түседі?`,
      )),
      ex: steps(same(`<i>h</i> = ${frac('<i>g</i> · <i>t</i><sup>2</sup>', 2)}`), same(`<i>h</i> = ${frac(`10 ${TIMES} ${t * t}`, 2)} = ${h}`)),
      ...ask(ctx, h, [10 * t, 10 * t * t, 5 * t, h + 10].filter((x) => x !== h)),
    });
  }
  const a = 2 * randomInt(rng, 1, 3);
  const t = randomInt(rng, 3, 10);
  const v0 = randomInt(rng, 2, 10);
  const s = v0 * t + (a * t * t) / 2;
  return poolQ('p.kin', d, {
    prompt: L(
      `A body with an initial speed of ${v0} m/s moves with an acceleration of ${a} m/s². What distance (in metres) does it cover in ${t} s?`,
      `Тело с начальной скоростью ${v0} м/с движется с ускорением ${a} м/с². Какой путь (в метрах) оно пройдёт за ${t} с?`,
      `Бастапқы жылдамдығы ${v0} м/с дене ${a} м/с² үдеумен қозғалады. Ол ${t} с ішінде қандай жол (метрмен) жүреді?`,
    ),
    ex: steps(
      same(`<i>s</i> = <i>v</i><sub>0</sub> · <i>t</i> + ${frac('<i>a</i> · <i>t</i><sup>2</sup>', 2)}`),
      same(`<i>s</i> = ${v0} ${TIMES} ${t} + ${frac(`${a} ${TIMES} ${t * t}`, 2)} = ${v0 * t} + ${(a * t * t) / 2} = ${s}`),
    ),
    ...ask(ctx, s, [v0 * t + a * t * t, v0 * t, (a * t * t) / 2, s + t].filter((x) => x !== s)),
  });
}

export function dynamics(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    if (rng() < 0.5) {
      const m = randomInt(rng, 2, 20);
      const a = randomInt(rng, 2, 9);
      const F = m * a;
      const find = randomInt(rng, 0, 1);
      return poolQ('p.dyn', d, {
        prompt: find
          ? L(
              `A force of ${F} N acts on a body of mass ${m} kg. Find its acceleration in m/s².`,
              `На тело массой ${m} кг действует сила ${F} Н. Найди ускорение тела в м/с².`,
              `Массасы ${m} кг денеге ${F} Н күш әсер етеді. Дененің үдеуін м/с²-пен тап.`,
            )
          : L(
              `A body of mass ${m} kg moves with an acceleration of ${a} m/s². Find the force (in newtons) acting on it.`,
              `Тело массой ${m} кг движется с ускорением ${a} м/с². Найди силу (в ньютонах), действующую на тело.`,
              `Массасы ${m} кг дене ${a} м/с² үдеумен қозғалады. Денеге әсер ететін күшті (ньютонмен) тап.`,
            ),
        ex: steps(
          L("Newton's second law: F = m · a.", 'Второй закон Ньютона: F = m · a.', 'Ньютонның екінші заңы: F = m · a.'),
          find ? same(`<i>a</i> = ${F} ${DIV} ${m} = ${a}`) : same(`<i>F</i> = ${m} ${TIMES} ${a} = ${F}`),
        ),
        ...ask(ctx, find ? a : F, find ? [a + 1, a - 1, F - m, a + 2].filter((x) => x !== a && x > 0) : [m + a, F + m, F - a, F * 2]),
      });
    }
    const m = randomInt(rng, 2, 60);
    return poolQ('p.dyn', d, {
      prompt: withG(L(
        `Find the weight (force of gravity, in newtons) of a body of mass ${m} kg.`,
        `Найди силу тяжести (в ньютонах), действующую на тело массой ${m} кг.`,
        `Массасы ${m} кг денеге әсер ететін ауырлық күшін (ньютонмен) тап.`,
      )),
      ex: steps(same('<i>F</i> = <i>m</i> · <i>g</i>'), same(`<i>F</i> = ${m} ${TIMES} 10 = ${m * 10}`)),
      ...ask(ctx, m * 10, [m, m + 10, m * 100, m * 5]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const S = pick(rng, [2, 4, 5, 8, 10]);
      const p = 100 * randomInt(rng, 2, 30);
      const F = p * S;
      return poolQ('p.dyn', d, {
        prompt: L(
          `A force of ${n(F)} N acts perpendicular to a surface of area ${S} m². Find the pressure in pascals.`,
          `Сила ${n(F)} Н действует перпендикулярно на поверхность площадью ${S} м². Найди давление в паскалях.`,
          `${n(F)} Н күш ауданы ${S} м² бетке перпендикуляр әсер етеді. Қысымды паскальмен тап.`,
        ),
        ex: steps(same('<i>p</i> = <i>F</i> / <i>S</i>'), same(`<i>p</i> = ${n(F)} ${DIV} ${S} = ${n(p)}`)),
        ...ask(ctx, p, [F * S, F - S, p * 10, p / 10].filter((x) => x !== p && Number.isInteger(x))),
      });
    }
    const V = randomInt(rng, 2, 9);
    const rho = pick(rng, [800, 900, 1000, 2700, 7800, 8900]);
    const m = rho * V;
    return poolQ('p.dyn', d, {
      prompt: L(
        `A body has a mass of ${n(m)} kg and a volume of ${V} m³. Find its density in kg/m³.`,
        `Масса тела равна ${n(m)} кг, а объём - ${V} м³. Найди плотность тела в кг/м³.`,
        `Дененің массасы ${n(m)} кг, көлемі ${V} м³. Дененің тығыздығын кг/м³-пен тап.`,
      ),
      ex: steps(same('ρ = <i>m</i> / <i>V</i>'), same(`ρ = ${n(m)} ${DIV} ${V} = ${n(rho)}`)),
      ...ask(ctx, rho, [m * V, rho + 100, rho * 10, rho / 10].filter((x) => x !== rho && Number.isInteger(x))),
    });
  }
  if (rng() < 0.5) {
    const m = randomInt(rng, 2, 10);
    const a = randomInt(rng, 1, 6);
    const F2 = randomInt(rng, 2, 20);
    const F1 = F2 + m * a;
    return poolQ('p.dyn', d, {
      prompt: L(
        `Two forces act on a body of mass ${m} kg along one line in opposite directions: ${F1} N and ${F2} N. Find the acceleration of the body in m/s².`,
        `На тело массой ${m} кг вдоль одной прямой в противоположные стороны действуют силы ${F1} Н и ${F2} Н. Найди ускорение тела в м/с².`,
        `Массасы ${m} кг денеге бір түзу бойымен қарама-қарсы бағытта ${F1} Н және ${F2} Н күштер әсер етеді. Дененің үдеуін м/с²-пен тап.`,
      ),
      ex: steps(
        L(`The resultant force is ${F1} ${MINUS} ${F2} = ${F1 - F2} N.`, `Равнодействующая сила: ${F1} ${MINUS} ${F2} = ${F1 - F2} Н.`, `Тең әсерлі күш: ${F1} ${MINUS} ${F2} = ${F1 - F2} Н.`),
        same(`<i>a</i> = ${F1 - F2} ${DIV} ${m} = ${a}`),
      ),
      ...ask(ctx, a, [(F1 + F2) / m, F1 / m, a + 1, a + 2].filter((x) => x !== a && Number.isInteger(x))),
    });
  }
  const m = randomInt(rng, 2, 20);
  const mu = pick(rng, [0.1, 0.2, 0.3, 0.4, 0.5]);
  const F = Math.round(mu * m * 10);
  return poolQ('p.dyn', d, {
    prompt: withG(L(
      `A box of mass ${m} kg slides on a horizontal floor. The coefficient of friction is ${dec(mu).en}. Find the friction force in newtons.`,
      `Ящик массой ${m} кг скользит по горизонтальному полу. Коэффициент трения равен ${dec(mu).ru}. Найди силу трения в ньютонах.`,
      `Массасы ${m} кг жәшік көлденең еденмен сырғанайды. Үйкеліс коэффициенті ${dec(mu).kk}. Үйкеліс күшін ньютонмен тап.`,
    )),
    ex: steps(
      same('<i>F</i> = μ · <i>m</i> · <i>g</i>'),
      L(`F = ${dec(mu).en} ${TIMES} ${m} ${TIMES} 10 = ${F}`, `F = ${dec(mu).ru} ${TIMES} ${m} ${TIMES} 10 = ${F}`, `F = ${dec(mu).kk} ${TIMES} ${m} ${TIMES} 10 = ${F}`),
    ),
    ...ask(ctx, F, [m * 10, F * 10, F + m, F + 10].filter((x) => x !== F)),
  });
}

export function energy(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    if (rng() < 0.5) {
      const F = randomInt(rng, 5, 60);
      const s = randomInt(rng, 2, 20);
      return poolQ('p.energy', d, {
        prompt: L(
          `A force of ${F} N moves a body ${s} m in the direction of the force. Find the work done in joules.`,
          `Сила ${F} Н перемещает тело на ${s} м в направлении действия силы. Найди работу силы в джоулях.`,
          `${F} Н күш денені күш бағытымен ${s} м-ге жылжытады. Күштің жұмысын джоульмен тап.`,
        ),
        ex: steps(same('<i>A</i> = <i>F</i> · <i>s</i>'), same(`<i>A</i> = ${F} ${TIMES} ${s} = ${n(F * s)}`)),
        ...ask(ctx, F * s, [F + s, F * s * 2, F * s + F, F * s - s]),
      });
    }
    const m = randomInt(rng, 2, 20);
    const h = randomInt(rng, 2, 15);
    const E = m * 10 * h;
    return poolQ('p.energy', d, {
      prompt: withG(L(
        `Find the potential energy (in joules) of a body of mass ${m} kg raised to a height of ${h} m.`,
        `Найди потенциальную энергию (в джоулях) тела массой ${m} кг, поднятого на высоту ${h} м.`,
        `${h} м биіктікке көтерілген массасы ${m} кг дененің потенциалдық энергиясын (джоульмен) тап.`,
      )),
      ex: steps(same('<i>E</i> = <i>m</i> · <i>g</i> · <i>h</i>'), same(`<i>E</i> = ${m} ${TIMES} 10 ${TIMES} ${h} = ${n(E)}`)),
      ...ask(ctx, E, [m * h, E / 2, E + m * 10, E * 2]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const m = 2 * randomInt(rng, 1, 10);
      const v = randomInt(rng, 2, 12);
      const E = (m * v * v) / 2;
      return poolQ('p.energy', d, {
        prompt: L(
          `Find the kinetic energy (in joules) of a body of mass ${m} kg moving at ${v} m/s.`,
          `Найди кинетическую энергию (в джоулях) тела массой ${m} кг, движущегося со скоростью ${v} м/с.`,
          `${v} м/с жылдамдықпен қозғалатын массасы ${m} кг дененің кинетикалық энергиясын (джоульмен) тап.`,
        ),
        ex: steps(same(`<i>E</i> = ${frac('<i>m</i> · <i>v</i><sup>2</sup>', 2)}`), same(`<i>E</i> = ${frac(`${m} ${TIMES} ${v * v}`, 2)} = ${n(E)}`)),
        ...ask(ctx, E, [m * v * v, (m * v) / 2, m * v, E + m].filter((x) => x !== E)),
      });
    }
    const N = 10 * randomInt(rng, 2, 50);
    const t = randomInt(rng, 2, 30);
    const A = N * t;
    return poolQ('p.energy', d, {
      prompt: L(
        `An engine does ${n(A)} J of work in ${t} s. Find its power in watts.`,
        `Двигатель совершает работу ${n(A)} Дж за ${t} с. Найди его мощность в ваттах.`,
        `Қозғалтқыш ${t} с ішінде ${n(A)} Дж жұмыс атқарады. Оның қуатын ваттпен тап.`,
      ),
      ex: steps(same('<i>N</i> = <i>A</i> / <i>t</i>'), same(`<i>N</i> = ${n(A)} ${DIV} ${t} = ${N}`)),
      ...ask(ctx, N, [A * t, N + 10, N * 10, N - 10].filter((x) => x !== N && x > 0)),
    });
  }
  if (rng() < 0.5) {
    const v = pick(rng, [10, 20, 30, 40]);
    const h = (v * v) / 20;
    return poolQ('p.energy', d, {
      prompt: withG(L(
        `A ball falls freely from a height of ${h} m without initial speed. Find its speed (in m/s) just before it hits the ground. Ignore air resistance.`,
        `Мяч свободно падает с высоты ${h} м без начальной скорости. Найди его скорость (в м/с) перед ударом о землю. Сопротивлением воздуха пренебречь.`,
        `Доп ${h} м биіктіктен бастапқы жылдамдықсыз еркін түседі. Жерге соғылар алдындағы жылдамдығын (м/с-пен) тап. Ауа кедергісін ескерме.`,
      )),
      ex: steps(
        L('Potential energy turns into kinetic energy: m·g·h = m·v²/2.', 'Потенциальная энергия переходит в кинетическую: m·g·h = m·v²/2.', 'Потенциалдық энергия кинетикалық энергияға айналады: m·g·h = m·v²/2.'),
        same(`<i>v</i> = √(2 · <i>g</i> · <i>h</i>) = √(2 ${TIMES} 10 ${TIMES} ${h}) = √${v * v} = ${v}`),
      ),
      ...ask(ctx, v, [h, 10 * h, v + 10, v / 2].filter((x) => x !== v)),
    });
  }
  const useful = 10 * randomInt(rng, 2, 9);
  const total = 100 * randomInt(rng, 2, 8);
  const A = (total * useful) / 100;
  return poolQ('p.energy', d, {
    prompt: L(
      `A machine receives ${total} J of energy and does ${A} J of useful work. Find its efficiency in percent.`,
      `Механизм получил ${total} Дж энергии и совершил ${A} Дж полезной работы. Найди его КПД в процентах.`,
      `Механизм ${total} Дж энергия алып, ${A} Дж пайдалы жұмыс атқарды. Оның ПӘК-ін пайызбен тап.`,
    ),
    ex: steps(
      L('Efficiency = useful work ÷ total energy × 100%.', 'КПД = полезная работа ÷ затраченная энергия × 100%.', 'ПӘК = пайдалы жұмыс ÷ жұмсалған энергия × 100%.'),
      same(`${A} ${DIV} ${total} ${TIMES} 100 = ${useful}%`),
    ),
    ...ask(ctx, useful, [100 - useful, useful + 10, useful / 2, useful - 10].filter((x) => x !== useful && x > 0 && Number.isInteger(x))),
  });
}

const PARALLEL = [[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [20, 30, 12], [12, 4, 3], [10, 40, 8], [6, 30, 5]];

export function electricity(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const I = randomInt(rng, 1, 8);
    const R = randomInt(rng, 2, 30);
    const U = I * R;
    const kind = randomInt(rng, 0, 2);
    const law = L("Ohm's law: I = U / R.", 'Закон Ома: I = U / R.', 'Ом заңы: I = U / R.');
    if (kind === 0) {
      return poolQ('p.elec', d, {
        prompt: L(
          `The voltage across a resistor of ${R} Ω is ${U} V. Find the current in amperes.`,
          `Напряжение на резисторе сопротивлением ${R} Ом равно ${U} В. Найди силу тока в амперах.`,
          `Кедергісі ${R} Ом резистордағы кернеу ${U} В. Ток күшін ампермен тап.`,
        ),
        ex: steps(law, same(`<i>I</i> = ${U} ${DIV} ${R} = ${I}`)),
        ...ask(ctx, I, [I + 1, I + 2, U - R, I * 2].filter((x) => x !== I && x > 0)),
      });
    }
    if (kind === 1) {
      return poolQ('p.elec', d, {
        prompt: L(
          `A current of ${I} A flows through a resistor of ${R} Ω. Find the voltage across it in volts.`,
          `Через резистор сопротивлением ${R} Ом течёт ток ${I} А. Найди напряжение на нём в вольтах.`,
          `Кедергісі ${R} Ом резистор арқылы ${I} А ток өтеді. Ондағы кернеуді вольтпен тап.`,
        ),
        ex: steps(law, same(`<i>U</i> = <i>I</i> · <i>R</i> = ${I} ${TIMES} ${R} = ${U}`)),
        ...ask(ctx, U, [I + R, U + R, U - I, U * 2].filter((x) => x !== U)),
      });
    }
    return poolQ('p.elec', d, {
      prompt: L(
        `At a voltage of ${U} V the current in a wire is ${I} A. Find the resistance of the wire in ohms.`,
        `При напряжении ${U} В сила тока в проводнике равна ${I} А. Найди сопротивление проводника в омах.`,
        `Кернеу ${U} В болғанда өткізгіштегі ток күші ${I} А. Өткізгіштің кедергісін оммен тап.`,
      ),
      ex: steps(law, same(`<i>R</i> = <i>U</i> / <i>I</i> = ${U} ${DIV} ${I} = ${R}`)),
      ...ask(ctx, R, [U * I, R + 1, R + 2, U - I].filter((x) => x !== R && x > 0)),
    });
  }
  if (d === 2) {
    const kind = randomInt(rng, 0, 2);
    if (kind === 0) {
      const [r1, r2, r] = pick(rng, PARALLEL);
      return poolQ('p.elec', d, {
        prompt: L(
          `Two resistors of ${r1} Ω and ${r2} Ω are connected in parallel. Find their total resistance in ohms.`,
          `Два резистора сопротивлением ${r1} Ом и ${r2} Ом соединены параллельно. Найди их общее сопротивление в омах.`,
          `Кедергілері ${r1} Ом және ${r2} Ом екі резистор параллель жалғанған. Олардың жалпы кедергісін оммен тап.`,
        ),
        ex: steps(
          same(`${frac(1, '<i>R</i>')} = ${frac(1, r1)} + ${frac(1, r2)} = ${frac(1, r)}`),
          same(`<i>R</i> = ${r}`),
        ),
        ...ask(ctx, r, [r1 + r2, (r1 + r2) / 2, Math.abs(r1 - r2), r + 1].filter((x) => x !== r && Number.isInteger(x) && x > 0)),
      });
    }
    if (kind === 1) {
      const r1 = randomInt(rng, 2, 30);
      const r2 = randomInt(rng, 2, 30);
      const r3 = randomInt(rng, 2, 30);
      return poolQ('p.elec', d, {
        prompt: L(
          `Three resistors of ${r1} Ω, ${r2} Ω and ${r3} Ω are connected in series. Find their total resistance in ohms.`,
          `Три резистора сопротивлением ${r1} Ом, ${r2} Ом и ${r3} Ом соединены последовательно. Найди их общее сопротивление в омах.`,
          `Кедергілері ${r1} Ом, ${r2} Ом және ${r3} Ом үш резистор тізбектей жалғанған. Олардың жалпы кедергісін оммен тап.`,
        ),
        ex: steps(
          L('In a series connection the resistances add up.', 'При последовательном соединении сопротивления складываются.', 'Тізбектей жалғағанда кедергілер қосылады.'),
          same(`${r1} + ${r2} + ${r3} = ${r1 + r2 + r3}`),
        ),
        ...ask(ctx, r1 + r2 + r3, [r1 + r2, Math.max(r1, r2, r3), r1 + r2 + r3 + 2, r1 + r3]),
      });
    }
    const U = pick(rng, [12, 24, 36, 110, 220]);
    const I = randomInt(rng, 2, 10);
    return poolQ('p.elec', d, {
      prompt: L(
        `A device works at a voltage of ${U} V and a current of ${I} A. Find its power in watts.`,
        `Прибор работает при напряжении ${U} В и силе тока ${I} А. Найди его мощность в ваттах.`,
        `Аспап ${U} В кернеуде және ${I} А ток күшінде жұмыс істейді. Оның қуатын ваттпен тап.`,
      ),
      ex: steps(same('<i>P</i> = <i>U</i> · <i>I</i>'), same(`<i>P</i> = ${U} ${TIMES} ${I} = ${n(U * I)}`)),
      ...ask(ctx, U * I, [U + I, U / I, U * I * 2, U * I + U].filter((x) => x !== U * I && Number.isInteger(x))),
    });
  }
  if (rng() < 0.5) {
    const I = randomInt(rng, 1, 5);
    const R = randomInt(rng, 2, 20);
    const t = 10 * randomInt(rng, 1, 12);
    const Q = I * I * R * t;
    return poolQ('p.elec', d, {
      prompt: L(
        `A current of ${I} A flows through a resistor of ${R} Ω for ${t} s. How much heat (in joules) is released?`,
        `Через резистор сопротивлением ${R} Ом в течение ${t} с течёт ток ${I} А. Сколько теплоты (в джоулях) выделится?`,
        `Кедергісі ${R} Ом резистор арқылы ${t} с бойы ${I} А ток өтеді. Қанша жылу (джоульмен) бөлінеді?`,
      ),
      ex: steps(
        L('Joule-Lenz law: Q = I² · R · t.', 'Закон Джоуля - Ленца: Q = I² · R · t.', 'Джоуль - Ленц заңы: Q = I² · R · t.'),
        same(`<i>Q</i> = ${I * I} ${TIMES} ${R} ${TIMES} ${t} = ${n(Q)}`),
      ),
      ...ask(ctx, Q, [I * R * t, I * I * R, Q * 2, Q + R * t].filter((x) => x !== Q)),
    });
  }
  const r1 = randomInt(rng, 2, 12);
  const r2 = randomInt(rng, 2, 12);
  const I = randomInt(rng, 1, 5);
  const U = I * (r1 + r2);
  return poolQ('p.elec', d, {
    prompt: L(
      `Resistors of ${r1} Ω and ${r2} Ω are connected in series to a source of ${U} V. Find the voltage (in volts) across the first resistor.`,
      `Резисторы сопротивлением ${r1} Ом и ${r2} Ом соединены последовательно и подключены к источнику напряжением ${U} В. Найди напряжение (в вольтах) на первом резисторе.`,
      `Кедергілері ${r1} Ом және ${r2} Ом резисторлар тізбектей жалғанып, кернеуі ${U} В көзге қосылған. Бірінші резистордағы кернеуді (вольтпен) тап.`,
    ),
    ex: steps(
      L(`Total resistance: ${r1} + ${r2} = ${r1 + r2} Ω.`, `Общее сопротивление: ${r1} + ${r2} = ${r1 + r2} Ом.`, `Жалпы кедергі: ${r1} + ${r2} = ${r1 + r2} Ом.`),
      L(`Current: ${U} ${DIV} ${r1 + r2} = ${I} A.`, `Сила тока: ${U} ${DIV} ${r1 + r2} = ${I} А.`, `Ток күші: ${U} ${DIV} ${r1 + r2} = ${I} А.`),
      same(`<i>U</i><sub>1</sub> = ${I} ${TIMES} ${r1} = ${I * r1}`),
    ),
    ...ask(ctx, I * r1, [I * r2, U, U / 2, I * r1 + I].filter((x) => x !== I * r1 && Number.isInteger(x))),
  });
}

export function heat(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const m = randomInt(rng, 1, 6);
    const dt = 10 * randomInt(rng, 1, 8);
    const Q = (42 * m * dt) / 10;
    return poolQ('p.heat', d, {
      prompt: L(
        `How much heat (in kilojoules) is needed to heat ${m} kg of water by ${dt} °C? The specific heat of water is 4200 J/(kg·°C).`,
        `Сколько теплоты (в килоджоулях) нужно, чтобы нагреть ${m} кг воды на ${dt} °C? Удельная теплоёмкость воды - 4200 Дж/(кг·°C).`,
        `${m} кг суды ${dt} °C-қа қыздыру үшін қанша жылу (килоджоульмен) керек? Судың меншікті жылу сыйымдылығы - 4200 Дж/(кг·°C).`,
      ),
      ex: steps(
        same('<i>Q</i> = <i>c</i> · <i>m</i> · Δ<i>t</i>'),
        L(`Q = 4200 ${TIMES} ${m} ${TIMES} ${dt} = ${n(Q * 1000)} J = ${n(Q)} kJ`, `Q = 4200 ${TIMES} ${m} ${TIMES} ${dt} = ${n(Q * 1000)} Дж = ${n(Q)} кДж`, `Q = 4200 ${TIMES} ${m} ${TIMES} ${dt} = ${n(Q * 1000)} Дж = ${n(Q)} кДж`),
      ),
      ...ask(ctx, Q, [Q * 10, Q / 10, Q + 42, 4.2 * m].filter((x) => x !== Q), { fmt: dec }),
    });
  }
  if (d === 2) {
    const m = randomInt(rng, 2, 9);
    const [lambda, name] = pick(rng, [
      [330, L('ice at 0 °C', 'льда при 0 °C', '0 °C температурадағы мұзды')],
      [25, L('lead at its melting point', 'свинца при температуре плавления', 'балқу температурасындағы қорғасынды')],
      [270, L('iron at its melting point', 'железа при температуре плавления', 'балқу температурасындағы темірді')],
    ]);
    return poolQ('p.heat', d, {
      prompt: L(
        `How much heat (in kilojoules) is needed to melt ${m} kg of ${name.en}? The specific heat of fusion is ${lambda} kJ/kg.`,
        `Сколько теплоты (в килоджоулях) нужно, чтобы расплавить ${m} кг ${name.ru}? Удельная теплота плавления - ${lambda} кДж/кг.`,
        `${m} кг ${name.kk} балқыту үшін қанша жылу (килоджоульмен) керек? Меншікті балқу жылуы - ${lambda} кДж/кг.`,
      ),
      ex: steps(same('<i>Q</i> = λ · <i>m</i>'), same(`<i>Q</i> = ${lambda} ${TIMES} ${m} = ${n(lambda * m)}`)),
      ...ask(ctx, lambda * m, [lambda + m, lambda / m, lambda * m * 10, lambda * (m + 1)].filter((x) => Number.isInteger(x))),
    });
  }
  let m1;
  let m2;
  let t1;
  let t2;
  do {
    m1 = randomInt(rng, 1, 5);
    m2 = randomInt(rng, 1, 5);
    t1 = 10 * randomInt(rng, 1, 3);
    t2 = 10 * randomInt(rng, 5, 9);
  } while ((m1 * t1 + m2 * t2) % (m1 + m2) !== 0);
  const t = (m1 * t1 + m2 * t2) / (m1 + m2);
  return poolQ('p.heat', d, {
    prompt: L(
      `${m1} kg of water at ${t1} °C is mixed with ${m2} kg of water at ${t2} °C. Find the temperature of the mixture in °C. Ignore heat losses.`,
      `Смешали ${m1} кг воды при температуре ${t1} °C и ${m2} кг воды при температуре ${t2} °C. Найди температуру смеси в °C. Потерями тепла пренебречь.`,
      `Температурасы ${t1} °C ${m1} кг су мен температурасы ${t2} °C ${m2} кг су араластырылды. Қоспаның температурасын °C-пен тап. Жылу шығынын ескерме.`,
    ),
    ex: steps(
      L('The heat given by the hot water equals the heat received by the cold water.', 'Тепло, отданное горячей водой, равно теплу, полученному холодной.', 'Ыстық су берген жылу суық су алған жылуға тең.'),
      same(`<i>t</i> = ${frac(`${m1} ${TIMES} ${t1} + ${m2} ${TIMES} ${t2}`, `${m1} + ${m2}`)} = ${frac(m1 * t1 + m2 * t2, m1 + m2)} = ${t}`),
    ),
    ...ask(ctx, t, [(t1 + t2) / 2, t1 + t2, t + 5, t - 5].filter((x) => x !== t && Number.isInteger(x) && x > 0)),
  });
}

export function waves(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const nu = pick(rng, [2, 4, 5, 10, 20, 25, 50]);
    const t = randomInt(rng, 2, 12);
    const count = nu * t;
    return poolQ('p.wave', d, {
      prompt: L(
        `A pendulum makes ${count} oscillations in ${t} s. Find the frequency of the oscillations in hertz.`,
        `Маятник совершает ${count} колебаний за ${t} с. Найди частоту колебаний в герцах.`,
        `Маятник ${t} с ішінде ${count} тербеліс жасайды. Тербеліс жиілігін герцпен тап.`,
      ),
      ex: steps(
        L('Frequency is the number of oscillations per second.', 'Частота - число колебаний за одну секунду.', 'Жиілік - бір секундтағы тербелістер саны.'),
        same(`ν = ${count} ${DIV} ${t} = ${nu}`),
      ),
      ...ask(ctx, nu, [count * t, nu + 1, nu * 2, nu + 5].filter((x) => x !== nu)),
    });
  }
  if (d === 2) {
    const lambda = randomInt(rng, 2, 12);
    const nu = pick(rng, [5, 10, 20, 50, 100, 170]);
    const v = lambda * nu;
    return poolQ('p.wave', d, {
      prompt: L(
        `A wave travels at ${n(v)} m/s and has a frequency of ${nu} Hz. Find its wavelength in metres.`,
        `Волна распространяется со скоростью ${n(v)} м/с, её частота равна ${nu} Гц. Найди длину волны в метрах.`,
        `Толқын ${n(v)} м/с жылдамдықпен таралады, жиілігі ${nu} Гц. Толқын ұзындығын метрмен тап.`,
      ),
      ex: steps(same('λ = <i>v</i> / ν'), same(`λ = ${n(v)} ${DIV} ${nu} = ${lambda}`)),
      ...ask(ctx, lambda, [lambda + 1, lambda * 2, lambda + 2, lambda - 1].filter((x) => x !== lambda && x > 0)),
    });
  }
  const [dd, f, F] = pick(rng, PARALLEL);
  return poolQ('p.wave', d, {
    prompt: L(
      `An object is ${dd} cm from a converging lens, and its real image is ${f} cm from the lens. Find the focal length of the lens in centimetres.`,
      `Предмет находится на расстоянии ${dd} см от собирающей линзы, а его действительное изображение - на расстоянии ${f} см от линзы. Найди фокусное расстояние линзы в сантиметрах.`,
      `Нәрсе жинағыш линзадан ${dd} см қашықтықта, ал оның нақты кескіні линзадан ${f} см қашықтықта орналасқан. Линзаның фокус аралығын сантиметрмен тап.`,
    ),
    ex: steps(
      L('Thin lens formula: 1/F = 1/d + 1/f.', 'Формула тонкой линзы: 1/F = 1/d + 1/f.', 'Жұқа линза формуласы: 1/F = 1/d + 1/f.'),
      same(`${frac(1, '<i>F</i>')} = ${frac(1, dd)} + ${frac(1, f)} = ${frac(1, F)}, <i>F</i> = ${F}`),
    ),
    ...ask(ctx, F, [dd + f, (dd + f) / 2, Math.abs(dd - f), F + 1].filter((x) => x !== F && Number.isInteger(x) && x > 0)),
  });
}

/** Вопросы на знание: единицы, законы, явления. */
export const PHYSICS_THEORY = [
  [1, T('В каких единицах измеряется сила?', 'Күш қандай бірлікпен өлшенеді?', 'In what units is force measured?'),
    T('ньютон', 'ньютон', 'newton'), [T('джоуль', 'джоуль', 'joule'), T('ватт', 'ватт', 'watt'), T('паскаль', 'паскаль', 'pascal')],
    T('Сила измеряется в ньютонах (Н). Джоуль - единица работы и энергии, ватт - мощности, паскаль - давления.', 'Күш ньютонмен (Н) өлшенеді. Джоуль - жұмыс пен энергияның, ватт - қуаттың, паскаль - қысымның бірлігі.', 'Force is measured in newtons (N). The joule is the unit of work and energy, the watt of power, the pascal of pressure.')],
  [1, T('В каких единицах измеряется электрическое сопротивление?', 'Электр кедергісі қандай бірлікпен өлшенеді?', 'In what units is electrical resistance measured?'),
    T('ом', 'ом', 'ohm'), [T('вольт', 'вольт', 'volt'), T('ампер', 'ампер', 'ampere'), T('ватт', 'ватт', 'watt')],
    T('Сопротивление измеряется в омах, напряжение - в вольтах, сила тока - в амперах.', 'Кедергі оммен, кернеу вольтпен, ток күші ампермен өлшенеді.', 'Resistance is measured in ohms, voltage in volts, current in amperes.')],
  [1, T('Какая из величин является векторной?', 'Қай шама векторлық болып табылады?', 'Which of these quantities is a vector?'),
    T('скорость', 'жылдамдық', 'velocity'), [T('масса', 'масса', 'mass'), T('время', 'уақыт', 'time'), T('температура', 'температура', 'temperature')],
    T('У векторной величины есть направление. Скорость направлена, а масса, время и температура - нет.', 'Векторлық шаманың бағыты болады. Жылдамдықтың бағыты бар, ал масса, уақыт пен температураның бағыты жоқ.', 'A vector quantity has a direction. Velocity has one; mass, time and temperature do not.')],
  [1, T('Каким прибором измеряют силу тока?', 'Ток күшін қандай аспаппен өлшейді?', 'Which instrument measures electric current?'),
    T('амперметром', 'амперметрмен', 'an ammeter'), [T('вольтметром', 'вольтметрмен', 'a voltmeter'), T('барометром', 'барометрмен', 'a barometer'), T('динамометром', 'динамометрмен', 'a dynamometer')],
    T('Амперметр измеряет силу тока, вольтметр - напряжение, барометр - атмосферное давление, динамометр - силу.', 'Амперметр ток күшін, вольтметр кернеуді, барометр атмосфералық қысымды, динамометр күшті өлшейді.', 'An ammeter measures current, a voltmeter voltage, a barometer air pressure, a dynamometer force.')],
  [2, T('Как называется явление сохранения скорости тела при отсутствии действия на него других тел?', 'Денеге басқа денелер әсер етпегенде оның жылдамдығын сақтау құбылысы қалай аталады?', 'What is the name of the tendency of a body to keep its velocity when no other bodies act on it?'),
    T('инерция', 'инерция', 'inertia'), [T('диффузия', 'диффузия', 'diffusion'), T('конвекция', 'конвекция', 'convection'), T('индукция', 'индукция', 'induction')],
    T('Инерция - свойство тела сохранять скорость, если на него не действуют другие тела (первый закон Ньютона).', 'Инерция - басқа денелер әсер етпегенде дененің жылдамдығын сақтау қасиеті (Ньютонның бірінші заңы).', "Inertia is the property of a body to keep its velocity when no other bodies act on it (Newton's first law).")],
  [2, T('Как изменится сила тока в проводнике, если напряжение на нём увеличить в 2 раза, а сопротивление не менять?', 'Өткізгіштегі кернеуді 2 есе арттырып, кедергіні өзгертпесе, ток күші қалай өзгереді?', 'How will the current in a conductor change if the voltage is doubled and the resistance stays the same?'),
    T('увеличится в 2 раза', '2 есе артады', 'it will double'), [T('уменьшится в 2 раза', '2 есе кемиді', 'it will halve'), T('не изменится', 'өзгермейді', 'it will not change'), T('увеличится в 4 раза', '4 есе артады', 'it will increase 4 times')],
    T('По закону Ома I = U / R: сила тока прямо пропорциональна напряжению.', 'Ом заңы бойынша I = U / R: ток күші кернеуге тура пропорционал.', "By Ohm's law I = U / R: the current is directly proportional to the voltage.")],
  [2, T('Какой вид теплопередачи может происходить в вакууме?', 'Жылу берілудің қай түрі вакуумде жүре алады?', 'Which kind of heat transfer can take place in a vacuum?'),
    T('излучение', 'сәуле шығару', 'radiation'), [T('конвекция', 'конвекция', 'convection'), T('теплопроводность', 'жылуөткізгіштік', 'conduction'), T('ни один из видов', 'ешқайсысы', 'none of them')],
    T('Для теплопроводности и конвекции нужно вещество. Излучение распространяется и в вакууме - так тепло Солнца доходит до Земли.', 'Жылуөткізгіштік пен конвекцияға зат қажет. Сәуле шығару вакуумде де таралады - Күн жылуы Жерге осылай жетеді.', "Conduction and convection need matter. Radiation travels through a vacuum too - this is how the Sun's heat reaches the Earth.")],
  [2, T('Что происходит с давлением жидкости при увеличении глубины?', 'Тереңдік артқанда сұйықтың қысымы қалай өзгереді?', 'What happens to the pressure in a liquid as the depth increases?'),
    T('увеличивается', 'артады', 'it increases'), [T('уменьшается', 'кемиді', 'it decreases'), T('не меняется', 'өзгермейді', 'it does not change'), T('сначала растёт, потом падает', 'алдымен артып, сосын кемиді', 'it first rises, then falls')],
    T('Давление жидкости p = ρ · g · h растёт с глубиной h.', 'Сұйық қысымы p = ρ · g · h тереңдікпен (h) бірге артады.', 'The pressure of a liquid p = ρ · g · h grows with the depth h.')],
  [2, T('Какая частица имеет отрицательный электрический заряд?', 'Қай бөлшектің электр заряды теріс?', 'Which particle has a negative electric charge?'),
    T('электрон', 'электрон', 'the electron'), [T('протон', 'протон', 'the proton'), T('нейтрон', 'нейтрон', 'the neutron'), T('ядро атома', 'атом ядросы', 'the atomic nucleus')],
    T('Электрон заряжен отрицательно, протон - положительно, нейтрон не имеет заряда.', 'Электрон теріс, протон оң зарядталған, нейтронның заряды жоқ.', 'The electron is negative, the proton is positive, the neutron has no charge.')],
  [3, T('Тело плавает в жидкости, частично погрузившись. Что можно сказать о силе Архимеда?', 'Дене сұйықта жартылай батып жүзеді. Архимед күші туралы не айтуға болады?', 'A body floats partly submerged in a liquid. What can be said about the buoyant force?'),
    T('она равна силе тяжести', 'ол ауырлық күшіне тең', 'it equals the force of gravity'), [T('она больше силы тяжести', 'ол ауырлық күшінен үлкен', 'it is greater than gravity'), T('она меньше силы тяжести', 'ол ауырлық күшінен кіші', 'it is less than gravity'), T('она равна нулю', 'ол нөлге тең', 'it is zero')],
    T('Тело покоится, значит силы уравновешены: сила Архимеда равна силе тяжести.', 'Дене тыныштықта, демек күштер теңгерілген: Архимед күші ауырлық күшіне тең.', 'The body is at rest, so the forces balance: the buoyant force equals gravity.')],
  [3, T('Как изменится сила притяжения между двумя телами, если расстояние между ними увеличить в 2 раза?', 'Екі дененің арақашықтығын 2 есе арттырса, олардың тартылыс күші қалай өзгереді?', 'How will the gravitational force between two bodies change if the distance between them is doubled?'),
    T('уменьшится в 4 раза', '4 есе кемиді', 'it will become 4 times smaller'), [T('уменьшится в 2 раза', '2 есе кемиді', 'it will halve'), T('увеличится в 2 раза', '2 есе артады', 'it will double'), T('не изменится', 'өзгермейді', 'it will not change')],
    T('По закону всемирного тяготения сила обратно пропорциональна квадрату расстояния: 2² = 4.', 'Бүкіләлемдік тартылыс заңы бойынша күш қашықтықтың квадратына кері пропорционал: 2² = 4.', 'By the law of universal gravitation the force is inversely proportional to the square of the distance: 2² = 4.')],
  [3, T('Какое явление доказывает, что свет - это волна?', 'Қай құбылыс жарықтың толқын екенін дәлелдейді?', 'Which phenomenon shows that light is a wave?'),
    T('интерференция', 'интерференция', 'interference'), [T('фотоэффект', 'фотоэффект', 'the photoelectric effect'), T('прямолинейное распространение', 'түзу сызықты таралу', 'travelling in straight lines'), T('образование тени', 'көлеңкенің пайда болуы', 'the formation of a shadow')],
    T('Интерференция и дифракция - волновые явления. Фотоэффект, наоборот, показывает, что свет ведёт себя как поток частиц.', 'Интерференция мен дифракция - толқындық құбылыстар. Фотоэффект, керісінше, жарықтың бөлшектер ағыны сияқты әрекет ететінін көрсетеді.', 'Interference and diffraction are wave phenomena. The photoelectric effect, on the contrary, shows light behaving as a stream of particles.')],
];

// Дополнительные вопросы - в science-more.js.
PHYSICS_THEORY.push(...PHYSICS_MORE);
PHYSICS_THEORY.push(...PHYSICS_MORE2);

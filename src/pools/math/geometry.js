// Геометрия: периметр и площадь, теорема Пифагора, углы, объёмы.

import { MINUS } from '../../core/format.js';
import { pick, randomInt } from '../../core/random.js';
import { L, ask, n, par, poolQ, same, steps } from '../gen.js';
import { frac } from './fractions.js';

const TIMES = '×';
const DIV = '÷';
const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

function triple(rng, maxScale = 3) {
  const [a, b, c] = pick(rng, TRIPLES);
  const k = c > 20 ? 1 : randomInt(rng, 1, maxScale);
  return rng() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}

export function area(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 3, 15);
    const b = randomInt(rng, 2, 12);
    if (rng() < 0.5) {
      const ans = 2 * (a + b);
      return poolQ('m.area', d, {
        prompt: L(
          `A rectangle has sides ${a} cm and ${b} cm. Find its perimeter in centimetres.`,
          `Стороны прямоугольника равны ${a} см и ${b} см. Найди его периметр в сантиметрах.`,
          `Тіктөртбұрыштың қабырғалары ${a} см және ${b} см. Оның периметрін сантиметрмен тап.`,
        ),
        ex: steps(
          L('The perimeter is the sum of all four sides.', 'Периметр — сумма длин всех четырёх сторон.', 'Периметр — төрт қабырғаның ұзындықтарының қосындысы.'),
          same(`2 ${TIMES} (${a} + ${b}) = ${ans}`),
        ),
        ...ask(ctx, ans, [a * b, a + b, ans + 2, 2 * a + b].filter((v) => v !== ans)),
      });
    }
    const ans = a * b;
    return poolQ('m.area', d, {
      prompt: L(
        `A rectangle has sides ${a} cm and ${b} cm. Find its area in square centimetres.`,
        `Стороны прямоугольника равны ${a} см и ${b} см. Найди его площадь в квадратных сантиметрах.`,
        `Тіктөртбұрыштың қабырғалары ${a} см және ${b} см. Оның ауданын шаршы сантиметрмен тап.`,
      ),
      ex: steps(
        L('The area of a rectangle is length times width.', 'Площадь прямоугольника — произведение длины на ширину.', 'Тіктөртбұрыштың ауданы — ұзындығы мен енінің көбейтіндісі.'),
        same(`${a} ${TIMES} ${b} = ${ans}`),
      ),
      ...ask(ctx, ans, [2 * (a + b), a + b, ans + a, ans - b].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const base = 2 * randomInt(rng, 2, 10);
      const h = randomInt(rng, 3, 14);
      const ans = (base * h) / 2;
      return poolQ('m.area', d, {
        prompt: L(
          `A triangle has a side of ${base} cm, and the height drawn to it is ${h} cm. Find the area of the triangle.`,
          `Сторона треугольника равна ${base} см, а высота, проведённая к ней, равна ${h} см. Найди площадь треугольника.`,
          `Үшбұрыштың қабырғасы ${base} см, оған түсірілген биіктік ${h} см. Үшбұрыштың ауданын тап.`,
        ),
        ex: steps(
          same(`<i>S</i> = ${frac(1, 2)} ${TIMES} <i>a</i> ${TIMES} <i>h</i>`),
          same(`<i>S</i> = ${frac(1, 2)} ${TIMES} ${base} ${TIMES} ${h} = ${ans}`),
        ),
        ...ask(ctx, ans, [base * h, base + h, ans + h, ans * 4].filter((v) => v !== ans)),
      });
    }
    const a = randomInt(rng, 3, 10);
    const b = a + 2 * randomInt(rng, 1, 5);
    const h = randomInt(rng, 2, 9);
    const ans = ((a + b) / 2) * h;
    return poolQ('m.area', d, {
      prompt: L(
        `The bases of a trapezoid are ${a} cm and ${b} cm, and its height is ${h} cm. Find the area of the trapezoid.`,
        `Основания трапеции равны ${a} см и ${b} см, а высота равна ${h} см. Найди площадь трапеции.`,
        `Трапецияның табандары ${a} см және ${b} см, биіктігі ${h} см. Трапецияның ауданын тап.`,
      ),
      ex: steps(
        same(`<i>S</i> = ${frac('<i>a</i> + <i>b</i>', 2)} ${TIMES} <i>h</i>`),
        same(`<i>S</i> = ${frac(`${a} + ${b}`, 2)} ${TIMES} ${h} = ${(a + b) / 2} ${TIMES} ${h} = ${ans}`),
      ),
      ...ask(ctx, ans, [(a + b) * h, a * b * h, ans + h, (a * b) / 2].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  const r = randomInt(rng, 2, 12);
  if (rng() < 0.5) {
    const ans = r * r;
    return poolQ('m.area', d, {
      prompt: L(
        `The radius of a circle is ${r}. Its area equals <i>k</i>π. Find <i>k</i>.`,
        `Радиус круга равен ${r}. Его площадь равна <i>k</i>π. Найди <i>k</i>.`,
        `Дөңгелектің радиусы ${r}. Оның ауданы <i>k</i>π-ге тең. <i>k</i>-ны тап.`,
      ),
      ex: steps(same(`<i>S</i> = π<i>r</i><sup>2</sup> = π ${TIMES} ${r}<sup>2</sup> = ${ans}π`), same(`<i>k</i> = ${ans}`)),
      ...ask(ctx, ans, [2 * r, r, 2 * r * r, ans + r].filter((v) => v !== ans)),
    });
  }
  const R = r + randomInt(rng, 1, 5);
  const ans = R * R - r * r;
  return poolQ('m.area', d, {
    prompt: L(
      `A ring lies between two circles with the same centre and radii ${R} and ${r}. Its area equals <i>k</i>π. Find <i>k</i>.`,
      `Кольцо ограничено двумя окружностями с общим центром и радиусами ${R} и ${r}. Его площадь равна <i>k</i>π. Найди <i>k</i>.`,
      `Сақина центрі ортақ, радиустары ${R} және ${r} екі шеңбермен шектелген. Оның ауданы <i>k</i>π-ге тең. <i>k</i>-ны тап.`,
    ),
    ex: steps(
      L('Subtract the area of the small circle from the area of the large one.', 'Из площади большого круга вычтем площадь малого.', 'Үлкен дөңгелектің ауданынан кішісінің ауданын азайтамыз.'),
      same(`π ${TIMES} ${R}<sup>2</sup> ${MINUS} π ${TIMES} ${r}<sup>2</sup> = ${R * R}π ${MINUS} ${r * r}π = ${ans}π`),
    ),
    ...ask(ctx, ans, [(R - r) ** 2, R * R + r * r, 2 * (R - r), ans + r].filter((v) => v !== ans)),
  });
}

export function pythagoras(ctx, d) {
  const { rng } = ctx;
  const [a, b, c] = triple(rng);
  if (d === 1) {
    return poolQ('m.pyth', d, {
      prompt: L(
        `The legs of a right triangle are ${a} and ${b}. Find the hypotenuse.`,
        `Катеты прямоугольного треугольника равны ${a} и ${b}. Найди гипотенузу.`,
        `Тікбұрышты үшбұрыштың катеттері ${a} және ${b}. Гипотенузасын тап.`,
      ),
      ex: steps(
        same(`<i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> = ${a * a} + ${b * b} = ${c * c}`),
        same(`<i>c</i> = √${c * c} = ${c}`),
      ),
      ...ask(ctx, c, [a + b, c + 1, c - 1, Math.abs(a - b) + c].filter((v) => v !== c)),
    });
  }
  if (d === 2) {
    return poolQ('m.pyth', d, {
      prompt: L(
        `The hypotenuse of a right triangle is ${c} and one leg is ${a}. Find the other leg.`,
        `Гипотенуза прямоугольного треугольника равна ${c}, а один из катетов равен ${a}. Найди второй катет.`,
        `Тікбұрышты үшбұрыштың гипотенузасы ${c}, бір катеті ${a}. Екінші катетін тап.`,
      ),
      ex: steps(
        same(`<i>b</i><sup>2</sup> = <i>c</i><sup>2</sup> ${MINUS} <i>a</i><sup>2</sup> = ${c * c} ${MINUS} ${a * a} = ${b * b}`),
        same(`<i>b</i> = √${b * b} = ${b}`),
      ),
      ...ask(ctx, b, [c - a, c + a, b + 1, b - 1].filter((v) => v !== b && v > 0)),
    });
  }
  const kind = randomInt(rng, 0, 2);
  if (kind === 0) {
    return poolQ('m.pyth', d, {
      prompt: L(
        `The sides of a rectangle are ${a} and ${b}. Find its diagonal.`,
        `Стороны прямоугольника равны ${a} и ${b}. Найди его диагональ.`,
        `Тіктөртбұрыштың қабырғалары ${a} және ${b}. Диагоналін тап.`,
      ),
      ex: steps(
        L('The diagonal is the hypotenuse of a right triangle formed by two sides.', 'Диагональ — гипотенуза прямоугольного треугольника, образованного двумя сторонами.', 'Диагональ — екі қабырғадан құралған тікбұрышты үшбұрыштың гипотенузасы.'),
        same(`√(${a * a} + ${b * b}) = √${c * c} = ${c}`),
      ),
      ...ask(ctx, c, [a + b, c + 2, c - 1, 2 * c].filter((v) => v !== c)),
    });
  }
  if (kind === 1) {
    return poolQ('m.pyth', d, {
      prompt: L(
        `The diagonals of a rhombus are ${2 * a} and ${2 * b}. Find the side of the rhombus.`,
        `Диагонали ромба равны ${2 * a} и ${2 * b}. Найди сторону ромба.`,
        `Ромбтың диагональдары ${2 * a} және ${2 * b}. Ромбтың қабырғасын тап.`,
      ),
      ex: steps(
        L(
          `The diagonals of a rhombus are perpendicular and bisect each other, so they form right triangles with legs ${a} and ${b}.`,
          `Диагонали ромба перпендикулярны и делятся пополам, поэтому образуют прямоугольные треугольники с катетами ${a} и ${b}.`,
          `Ромбтың диагональдары перпендикуляр және қақ бөлінеді, сондықтан катеттері ${a} және ${b} тікбұрышты үшбұрыштар құрайды.`,
        ),
        same(`√(${a * a} + ${b * b}) = ${c}`),
      ),
      ...ask(ctx, c, [2 * c, a + b, c + 1, 2 * (a + b)].filter((v) => v !== c)),
    });
  }
  const x1 = randomInt(rng, -5, 5);
  const y1 = randomInt(rng, -5, 5);
  const x2 = x1 + (rng() < 0.5 ? a : -a);
  const y2 = y1 + (rng() < 0.5 ? b : -b);
  return poolQ('m.pyth', d, {
    prompt: L(
      `Find the distance between the points (${n(x1)}; ${n(y1)}) and (${n(x2)}; ${n(y2)}).`,
      `Найди расстояние между точками (${n(x1)}; ${n(y1)}) и (${n(x2)}; ${n(y2)}).`,
      `(${n(x1)}; ${n(y1)}) және (${n(x2)}; ${n(y2)}) нүктелерінің арақашықтығын тап.`,
    ),
    ex: steps(
      same(`<i>d</i> = √((<i>x</i><sub>2</sub> ${MINUS} <i>x</i><sub>1</sub>)<sup>2</sup> + (<i>y</i><sub>2</sub> ${MINUS} <i>y</i><sub>1</sub>)<sup>2</sup>)`),
      same(`<i>d</i> = √(${par(x2 - x1)}<sup>2</sup> + ${par(y2 - y1)}<sup>2</sup>) = √(${a * a} + ${b * b}) = ${c}`),
    ),
    ...ask(ctx, c, [a + b, c + 1, Math.abs(a - b) || c + 3, c * 2].filter((v) => v !== c)),
  });
}

export function angles(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 25, 95);
    const b = randomInt(rng, 20, 150 - a);
    const ans = 180 - a - b;
    return poolQ('m.angle', d, {
      prompt: L(
        `Two angles of a triangle are ${a}° and ${b}°. Find the third angle in degrees.`,
        `Два угла треугольника равны ${a}° и ${b}°. Найди третий угол в градусах.`,
        `Үшбұрыштың екі бұрышы ${a}° және ${b}°. Үшінші бұрышын градуспен тап.`,
      ),
      ex: steps(
        L('The angles of a triangle add up to 180°.', 'Сумма углов треугольника равна 180°.', 'Үшбұрыш бұрыштарының қосындысы 180°.'),
        same(`180 ${MINUS} ${a} ${MINUS} ${b} = ${ans}`),
      ),
      ...ask(ctx, ans, [a + b, 360 - a - b, ans + 10, 90 - a].filter((v) => v !== ans && v > 0)),
    });
  }
  if (d === 2) {
    const kind = randomInt(rng, 0, 2);
    if (kind === 0) {
      const sides = randomInt(rng, 5, 12);
      const ans = (sides - 2) * 180;
      return poolQ('m.angle', d, {
        prompt: L(
          `Find the sum of the interior angles of a convex polygon with ${sides} sides (in degrees).`,
          `Найди сумму внутренних углов выпуклого ${sides}-угольника (в градусах).`,
          `Дөңес ${sides}-бұрыштың ішкі бұрыштарының қосындысын тап (градуспен).`,
        ),
        ex: steps(same(`180° ${TIMES} (<i>n</i> ${MINUS} 2) = 180° ${TIMES} ${sides - 2} = ${ans}°`)),
        ...ask(ctx, ans, [sides * 180, (sides - 1) * 180, 360, ans - 180].filter((v) => v !== ans)),
      });
    }
    if (kind === 1) {
      const sides = pick(rng, [5, 6, 8, 9, 10, 12]);
      const ans = ((sides - 2) * 180) / sides;
      return poolQ('m.angle', d, {
        prompt: L(
          `Find the interior angle of a regular polygon with ${sides} sides (in degrees).`,
          `Найди внутренний угол правильного ${sides}-угольника (в градусах).`,
          `Дұрыс ${sides}-бұрыштың ішкі бұрышын тап (градуспен).`,
        ),
        ex: steps(
          L(`The sum of the angles is 180° ${TIMES} ${sides - 2} = ${(sides - 2) * 180}°.`, `Сумма углов: 180° ${TIMES} ${sides - 2} = ${(sides - 2) * 180}°.`, `Бұрыштар қосындысы: 180° ${TIMES} ${sides - 2} = ${(sides - 2) * 180}°.`),
          L(`All ${sides} angles are equal: ${(sides - 2) * 180} ${DIV} ${sides} = ${ans}°.`, `Все ${sides} углов равны: ${(sides - 2) * 180} ${DIV} ${sides} = ${ans}°.`, `Барлық ${sides} бұрыш тең: ${(sides - 2) * 180} ${DIV} ${sides} = ${ans}°.`),
        ),
        ...ask(ctx, ans, [360 / sides, 180 - ans + 90, ans + 10, ans - 12].filter((v) => v !== ans && Number.isInteger(v))),
      });
    }
    const a = randomInt(rng, 25, 155);
    const ans = 180 - a;
    return poolQ('m.angle', d, {
      prompt: L(
        `One of two adjacent (supplementary) angles is ${a}°. Find the other angle in degrees.`,
        `Один из двух смежных углов равен ${a}°. Найди другой угол в градусах.`,
        `Екі сыбайлас бұрыштың бірі ${a}°. Екінші бұрышты градуспен тап.`,
      ),
      ex: steps(L('Adjacent angles on a straight line add up to 180°.', 'Сумма смежных углов равна 180°.', 'Сыбайлас бұрыштардың қосындысы 180°.'), same(`180 ${MINUS} ${a} = ${ans}`)),
      ...ask(ctx, ans, [a, 360 - a, Math.abs(90 - a) || 45, ans + 10].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const inscribed = randomInt(rng, 15, 85);
    const central = 2 * inscribed;
    const give = rng() < 0.5;
    const ans = give ? inscribed : central;
    return poolQ('m.angle', d, {
      prompt: give
        ? L(
            `A central angle of a circle is ${central}°. Find the inscribed angle that stands on the same arc.`,
            `Центральный угол окружности равен ${central}°. Найди вписанный угол, опирающийся на ту же дугу.`,
            `Шеңбердің центрлік бұрышы ${central}°. Сол доғаға тірелген іштей сызылған бұрышты тап.`,
          )
        : L(
            `An inscribed angle of a circle is ${inscribed}°. Find the central angle that stands on the same arc.`,
            `Вписанный угол окружности равен ${inscribed}°. Найди центральный угол, опирающийся на ту же дугу.`,
            `Шеңберге іштей сызылған бұрыш ${inscribed}°. Сол доғаға тірелген центрлік бұрышты тап.`,
          ),
      ex: steps(
        L('An inscribed angle is half of the central angle on the same arc.', 'Вписанный угол равен половине центрального, опирающегося на ту же дугу.', 'Іштей сызылған бұрыш сол доғаға тірелген центрлік бұрыштың жартысына тең.'),
        give ? same(`${central} ${DIV} 2 = ${inscribed}`) : same(`${inscribed} ${TIMES} 2 = ${central}`),
      ),
      ...ask(ctx, ans, [give ? central : inscribed, 180 - ans, give ? central * 2 : inscribed / 2, ans + 10].filter((v) => v !== ans && Number.isInteger(v) && v > 0)),
    });
  }
  const vertex = 2 * randomInt(rng, 10, 70);
  const ans = (180 - vertex) / 2;
  return poolQ('m.angle', d, {
    prompt: L(
      `The angle at the vertex of an isosceles triangle is ${vertex}°. Find the angle at the base.`,
      `Угол при вершине равнобедренного треугольника равен ${vertex}°. Найди угол при основании.`,
      `Теңбүйірлі үшбұрыштың төбесіндегі бұрыш ${vertex}°. Табанындағы бұрышты тап.`,
    ),
    ex: steps(
      L('The base angles of an isosceles triangle are equal.', 'Углы при основании равнобедренного треугольника равны.', 'Теңбүйірлі үшбұрыштың табанындағы бұрыштары тең.'),
      same(`(180 ${MINUS} ${vertex}) ${DIV} 2 = ${ans}`),
    ),
    ...ask(ctx, ans, [180 - vertex, vertex / 2, 90 - vertex / 2 + 10, vertex].filter((v) => v !== ans && v > 0)),
  });
}

export function volume(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    if (rng() < 0.5) {
      const a = randomInt(rng, 2, 9);
      const b = randomInt(rng, 2, 8);
      const c = randomInt(rng, 2, 7);
      const ans = a * b * c;
      return poolQ('m.vol', d, {
        prompt: L(
          `A rectangular box measures ${a} cm, ${b} cm and ${c} cm. Find its volume in cubic centimetres.`,
          `Измерения прямоугольного параллелепипеда: ${a} см, ${b} см и ${c} см. Найди его объём в кубических сантиметрах.`,
          `Тікбұрышты параллелепипедтің өлшемдері: ${a} см, ${b} см және ${c} см. Оның көлемін текше сантиметрмен тап.`,
        ),
        ex: steps(same(`<i>V</i> = <i>a</i> ${TIMES} <i>b</i> ${TIMES} <i>c</i> = ${a} ${TIMES} ${b} ${TIMES} ${c} = ${ans}`)),
        ...ask(ctx, ans, [a + b + c, 2 * (a * b + b * c + a * c), a * b + c, ans + a].filter((v) => v !== ans)),
      });
    }
    const a = randomInt(rng, 2, 10);
    const ans = 6 * a * a;
    return poolQ('m.vol', d, {
      prompt: L(
        `The edge of a cube is ${a} cm. Find the total surface area of the cube.`,
        `Ребро куба равно ${a} см. Найди площадь полной поверхности куба.`,
        `Кубтың қыры ${a} см. Кубтың толық бетінің ауданын тап.`,
      ),
      ex: steps(
        L(`A cube has 6 equal square faces, each of area ${a * a}.`, `У куба 6 равных граней-квадратов, площадь каждой ${a * a}.`, `Кубтың 6 тең шаршы жағы бар, әрқайсысының ауданы ${a * a}.`),
        same(`6 ${TIMES} ${a * a} = ${ans}`),
      ),
      ...ask(ctx, ans, [a ** 3, 4 * a * a, 12 * a, a * a].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const r = randomInt(rng, 2, 8);
    const h = randomInt(rng, 2, 12);
    const ans = r * r * h;
    return poolQ('m.vol', d, {
      prompt: L(
        `A cylinder has base radius ${r} and height ${h}. Its volume equals <i>k</i>π. Find <i>k</i>.`,
        `Радиус основания цилиндра равен ${r}, высота равна ${h}. Объём цилиндра равен <i>k</i>π. Найди <i>k</i>.`,
        `Цилиндр табанының радиусы ${r}, биіктігі ${h}. Цилиндрдің көлемі <i>k</i>π-ге тең. <i>k</i>-ны тап.`,
      ),
      ex: steps(same(`<i>V</i> = π<i>r</i><sup>2</sup><i>h</i> = π ${TIMES} ${r * r} ${TIMES} ${h} = ${ans}π`), same(`<i>k</i> = ${ans}`)),
      ...ask(ctx, ans, [2 * r * h, r * h, r * r + h, ans * 2].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const r = randomInt(rng, 2, 9);
    const h = 3 * randomInt(rng, 1, 5);
    const ans = (r * r * h) / 3;
    return poolQ('m.vol', d, {
      prompt: L(
        `A cone has base radius ${r} and height ${h}. Its volume equals <i>k</i>π. Find <i>k</i>.`,
        `Радиус основания конуса равен ${r}, высота равна ${h}. Объём конуса равен <i>k</i>π. Найди <i>k</i>.`,
        `Конус табанының радиусы ${r}, биіктігі ${h}. Конустың көлемі <i>k</i>π-ге тең. <i>k</i>-ны тап.`,
      ),
      ex: steps(
        same(`<i>V</i> = ${frac(1, 3)}π<i>r</i><sup>2</sup><i>h</i> = ${frac(1, 3)} ${TIMES} π ${TIMES} ${r * r} ${TIMES} ${h} = ${ans}π`),
        same(`<i>k</i> = ${ans}`),
      ),
      ...ask(ctx, ans, [r * r * h, (r * h) / 3, ans + r, r * r * 3].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  const r = randomInt(rng, 2, 10);
  const ans = 4 * r * r;
  return poolQ('m.vol', d, {
    prompt: L(
      `The radius of a sphere is ${r}. Its surface area equals <i>k</i>π. Find <i>k</i>.`,
      `Радиус шара равен ${r}. Площадь его поверхности равна <i>k</i>π. Найди <i>k</i>.`,
      `Шардың радиусы ${r}. Оның бетінің ауданы <i>k</i>π-ге тең. <i>k</i>-ны тап.`,
    ),
    ex: steps(same(`<i>S</i> = 4π<i>r</i><sup>2</sup> = 4 ${TIMES} π ${TIMES} ${r * r} = ${ans}π`), same(`<i>k</i> = ${ans}`)),
    ...ask(ctx, ans, [r * r, 2 * r * r, 4 * r, ans + 4].filter((v) => v !== ans)),
  });
}


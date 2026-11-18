// Математика 1-2 классов: счёт в пределах 10, 20 и 100, сравнение чисел, простые задачи.

import { pick, randomInt } from '../../core/random.js';
import { L, W, ask, loc, mcText, plural, poolQ, same, steps } from '../gen.js';

const MINUS = '−';
const calc = (expr) => loc((l) => `${W.calc[l]}: ${expr}`);

export function early(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    // Сложение и вычитание в пределах 10.
    const a = randomInt(rng, 1, 9);
    if (rng() < 0.5) {
      const b = randomInt(rng, 1, 10 - a);
      return poolQ('m.early', d, {
        prompt: calc(`${a} + ${b}`),
        ex: steps(L(`Count on ${b} from ${a}: ${a + b}.`, `Отсчитаем от ${a} ещё ${b}: получится ${a + b}.`, `${a}-ден тағы ${b} санаймыз: ${a + b} шығады.`)),
        ...ask(ctx, a + b, [a + b + 1, a + b - 1, a + b + 2, Math.abs(a - b)].filter((x) => x >= 0)),
      });
    }
    const b = randomInt(rng, 0, a);
    return poolQ('m.early', d, {
      prompt: calc(`${a} ${MINUS} ${b}`),
      ex: steps(L(`Count back ${b} from ${a}: ${a - b}.`, `Отсчитаем от ${a} назад ${b}: получится ${a - b}.`, `${a}-ден ${b} кері санаймыз: ${a - b} шығады.`)),
      ...ask(ctx, a - b, [a - b + 1, a + b, a - b + 2, Math.max(0, a - b - 1)].filter((x) => x !== a - b)),
    });
  }
  if (d === 2) {
    // Переход через десяток в пределах 20 и сравнение.
    if (rng() < 0.3) {
      let a = randomInt(rng, 3, 20);
      let b = randomInt(rng, 3, 20);
      while (a === b) b = randomInt(rng, 3, 20);
      const sign = a > b ? '&gt;' : '&lt;';
      return poolQ('m.early', d, {
        prompt: L(`Which sign goes between the numbers: ${a} ? ${b}`, `Какой знак нужно поставить между числами: ${a} ? ${b}`, `Сандардың арасына қай таңбаны қою керек: ${a} ? ${b}`),
        ex: steps(
          L(`${a} is ${a > b ? 'greater' : 'less'} than ${b}, so ${a} ${sign} ${b}.`, `${a} ${a > b ? 'больше' : 'меньше'}, чем ${b}, поэтому ${a} ${sign} ${b}.`, `${a} саны ${b}-ден ${a > b ? 'үлкен' : 'кіші'}, сондықтан ${a} ${sign} ${b}.`),
        ),
        mc: mcText(rng, sign, [a > b ? '&lt;' : '&gt;', '=', '+']),
      });
    }
    const a = randomInt(rng, 6, 9);
    const b = randomInt(rng, 11 - a, 9);
    const sum = a + b;
    if (rng() < 0.5) {
      return poolQ('m.early', d, {
        prompt: calc(`${a} + ${b}`),
        ex: steps(
          L(`Make ten first: ${a} + ${10 - a} = 10.`, `Сначала дополним до десяти: ${a} + ${10 - a} = 10.`, `Алдымен онға дейін толықтырамыз: ${a} + ${10 - a} = 10.`),
          same(`10 + ${b - (10 - a)} = ${sum}`),
        ),
        ...ask(ctx, sum, [sum - 1, sum + 1, sum - 10, sum + 2]),
      });
    }
    return poolQ('m.early', d, {
      prompt: calc(`${sum} ${MINUS} ${b}`),
      ex: steps(
        L(`Subtract down to ten first: ${sum} ${MINUS} ${sum - 10} = 10.`, `Сначала вычтем до десяти: ${sum} ${MINUS} ${sum - 10} = 10.`, `Алдымен онға дейін азайтамыз: ${sum} ${MINUS} ${sum - 10} = 10.`),
        same(`10 ${MINUS} ${b - (sum - 10)} = ${a}`),
      ),
      ...ask(ctx, a, [a + 1, a - 1, a + 2, b]),
    });
  }
  // Простые текстовые задачи в пределах 100.
  const kind = randomInt(rng, 0, 2);
  const [itemEn, forms, itemKk] = pick(rng, [
    ['apples', ['яблоко', 'яблока', 'яблок'], 'алма'],
    ['pencils', ['карандаш', 'карандаша', 'карандашей'], 'қарындаш'],
    ['stickers', ['наклейка', 'наклейки', 'наклеек'], 'жапсырма'],
    ['books', ['книга', 'книги', 'книг'], 'кітап'],
  ]);
  const ru = (k) => `${k} ${plural(k, ...forms)}`;
  const itemRu = forms[2];
  const a = 10 * randomInt(rng, 2, 6) + randomInt(rng, 0, 9);
  const b = randomInt(rng, 3, 25);
  if (kind === 0) {
    return poolQ('m.early', d, {
      prompt: L(
        `Ali had ${a} ${itemEn}. He was given ${b} more. How many ${itemEn} does he have now?`,
        `У Али было ${ru(a)}. Ему дали ещё ${b}. Сколько ${itemRu} стало у Али?`,
        `Әлиде ${a} ${itemKk} болды. Оған тағы ${b} берді. Әлиде неше ${itemKk} болды?`,
      ),
      ex: steps(L('"More" means we add.', '«Ещё дали» - значит, складываем.', '«Тағы берді» - демек, қосамыз.'), same(`${a} + ${b} = ${a + b}`)),
      ...ask(ctx, a + b, [a - b, a + b + 10, a + b - 1, a + b + 1]),
    });
  }
  if (kind === 1) {
    return poolQ('m.early', d, {
      prompt: L(
        `Dana had ${a} ${itemEn}. She gave away ${b}. How many ${itemEn} are left?`,
        `У Даны было ${ru(a)}. Она отдала ${b}. Сколько ${itemRu} осталось?`,
        `Данада ${a} ${itemKk} болды. Ол ${b} берді. Неше ${itemKk} қалды?`,
      ),
      ex: steps(L('"Gave away" means we subtract.', '«Отдала» - значит, вычитаем.', '«Берді» - демек, азайтамыз.'), same(`${a} ${MINUS} ${b} = ${a - b}`)),
      ...ask(ctx, a - b, [a + b, a - b + 10, a - b - 1, a - b + 1]),
    });
  }
  const c = a + b;
  return poolQ('m.early', d, {
    prompt: L(
      `There are ${c} ${itemEn} in two boxes. The first box has ${a}. How many are in the second box?`,
      `В двух коробках лежит ${ru(c)}. В первой коробке ${a}. Сколько во второй?`,
      `Екі қорапта ${c} ${itemKk} бар. Біріншісінде ${a}. Екіншісінде неше?`,
    ),
    ex: steps(L('Subtract the known part from the whole.', 'Из целого вычтем известную часть.', 'Бүтіннен белгілі бөлікті азайтамыз.'), same(`${c} ${MINUS} ${a} = ${b}`)),
    ...ask(ctx, b, [c + a, b + 10, b - 1, b + 1].filter((x) => x > 0)),
  });
}

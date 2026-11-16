// Генераторы заданий по географии: страны и столицы, части света, сравнение гор, рек, озёр и стран,
// области Казахстана и его соседи. Ключ сложности — 1…3.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { AREA, CONTINENTS, COUNTRIES_TEXT, KZ_NEIGHBOURS, KZ_NOT_NEIGHBOURS, KZ_REGIONS, LAKES, PEAKS, POPULATION, RIVERS } from './geo-data.js';

const lines = (text) => text.trim().split('\n').map((line) => line.split('|'));

export const COUNTRIES = lines(COUNTRIES_TEXT).map(([level, cont, en, ru, kk, cen, cru, ckk]) => ({
  level: Number(level),
  cont,
  name: L(en, ru, kk),
  capital: L(cen, cru, ckk),
}));
const byName = new Map(COUNTRIES.map((c) => [c.name.en, c]));

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

/** Три других элемента, все тексты которых отличаются от правильного и друг от друга. */
function others(rng, pool, correct, key) {
  const out = [];
  for (const x of shuffle(pool, rng)) {
    if (out.length === 3) break;
    const k = key(x);
    if ([correct, ...out].every((y) => ['en', 'ru', 'kk'].every((l) => key(y)[l] !== k[l]))) out.push(x);
  }
  return out;
}

const contName = (code) => L(...CONTINENTS[code]);

// ---------- Страны, столицы, части света ----------

export function worldMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    const pool = COUNTRIES.filter((c) => c.level === d);
    for (let attempt = 0; attempt < 10; attempt++) {
      const c = pick(rng, pool);
      const mode = pick(rng, c.cont === 'x' ? ['cap', 'country'] : ['cap', 'cap', 'country', 'cont']);
      // Ловушки — из той же части света, если там хватает стран.
      const same = COUNTRIES.filter((x) => x !== c && x.cont === c.cont);
      const near = same.length >= 6 ? same : COUNTRIES.filter((x) => x !== c);
      let q;
      if (mode === 'cap') {
        const wrong = others(rng, near, c, (x) => x.capital);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`What is the capital of ${c.name.en}?`, `Какая столица у страны ${c.name.ru}?`, `${c.name.kk} елінің астанасы қай қала?`),
          ex: L(`The capital of ${c.name.en} is ${c.capital.en}.`, `Столица страны ${c.name.ru} — ${c.capital.ru}.`, `${c.name.kk} елінің астанасы — ${c.capital.kk}.`),
          mc: mcOf(rng, c.capital, wrong.map((x) => x.capital)),
        });
      } else if (mode === 'country') {
        const wrong = others(rng, near, c, (x) => x.name);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`${c.capital.en} is the capital of which country?`, `Столицей какой страны является ${c.capital.ru}?`, `${c.capital.kk} қай елдің астанасы?`),
          ex: L(`${c.capital.en} is the capital of ${c.name.en}.`, `${c.capital.ru} — столица страны ${c.name.ru}.`, `${c.capital.kk} — ${c.name.kk} елінің астанасы.`),
          mc: mcOf(rng, c.name, wrong.map((x) => x.name)),
        });
      } else {
        const wrong = shuffle(Object.keys(CONTINENTS).filter((k) => k !== c.cont), rng).slice(0, 3);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`On which continent is ${c.name.en}?`, `В какой части света находится ${c.name.ru}?`, `${c.name.kk} дүниенің қай бөлігінде орналасқан?`),
          ex: L(`${c.name.en} is in ${contName(c.cont).en}; its capital is ${c.capital.en}.`, `${c.name.ru} — это ${contName(c.cont).ru}, столица — ${c.capital.ru}.`, `${c.name.kk} — ${contName(c.cont).kk}, астанасы — ${c.capital.kk}.`),
          mc: mcOf(rng, contName(c.cont), wrong.map(contName)),
        });
      }
      q.id = `${topic}:${mode}:${c.name.en}`;
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

// ---------- Сравнения: самая высокая гора, самая длинная река… ----------

const table = (text) => lines(text).map(([en, ru, kk, v]) => ({ name: L(en, ru, kk), value: Number(v) }));
const countryTable = (text) =>
  lines(text).map(([en, v]) => {
    const c = byName.get(en);
    if (!c) throw new Error(`Нет страны ${en}`);
    return { name: c.name, value: Number(v) };
  });

const fmt = (x) => (x >= 10000 ? String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(x));

const RECORDS = [
  { id: 'peak', items: table(PEAKS), ratio: 1.03, unit: L('m', 'м', 'м'),
    max: L('Which of these peaks is the highest?', 'Какая из этих вершин самая высокая?', 'Бұл шыңдардың қайсысы ең биік?'),
    min: L('Which of these peaks is the lowest?', 'Какая из этих вершин самая низкая?', 'Бұл шыңдардың қайсысы ең аласа?') },
  { id: 'river', items: table(RIVERS), ratio: 1.15, unit: L('km', 'км', 'км'),
    max: L('Which of these rivers is the longest?', 'Какая из этих рек самая длинная?', 'Бұл өзендердің қайсысы ең ұзын?'),
    min: L('Which of these rivers is the shortest?', 'Какая из этих рек самая короткая?', 'Бұл өзендердің қайсысы ең қысқа?') },
  { id: 'lake', items: table(LAKES), ratio: 1.15, unit: L('km²', 'км²', 'км²'),
    max: L('Which of these lakes has the largest area?', 'У какого из этих озёр самая большая площадь?', 'Бұл көлдердің қайсысының ауданы ең үлкен?'),
    min: L('Which of these lakes has the smallest area?', 'У какого из этих озёр самая маленькая площадь?', 'Бұл көлдердің қайсысының ауданы ең кіші?') },
  { id: 'area', items: countryTable(AREA), ratio: 1.15, unit: L('thousand km²', 'тыс. км²', 'мың км²'),
    max: L('Which of these countries is the largest by area?', 'Какая из этих стран самая большая по площади?', 'Бұл елдердің қайсысы аумағы бойынша ең үлкен?'),
    min: L('Which of these countries is the smallest by area?', 'Какая из этих стран самая маленькая по площади?', 'Бұл елдердің қайсысы аумағы бойынша ең кіші?') },
  { id: 'pop', items: countryTable(POPULATION), ratio: 1.2, unit: L('million people', 'млн человек', 'млн адам'),
    max: L('Which of these countries has the largest population?', 'В какой из этих стран больше всего жителей?', 'Бұл елдердің қайсысында халық ең көп?'),
    min: L('Which of these countries has the smallest population?', 'В какой из этих стран меньше всего жителей?', 'Бұл елдердің қайсысында халық ең аз?') },
];

export function recordsMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    // Чем выше сложность, тем ближе значения и тем чаще вопрос «самый маленький».
    const gap = d === 1 ? 1.6 : d === 2 ? 1.3 : 1;
    for (let attempt = 0; attempt < 40; attempt++) {
      const rec = pick(rng, RECORDS);
      const four = shuffle(rec.items, rng).slice(0, 4);
      const wantMax = d < 3 || rng() < 0.5;
      const sorted = [...four].sort((a, b) => (wantMax ? b.value - a.value : a.value - b.value));
      const [best, second] = sorted;
      const ratio = wantMax ? best.value / second.value : second.value / best.value;
      if (ratio < Math.max(rec.ratio, gap)) continue;
      const list = (l) => [...four].sort((a, b) => b.value - a.value).map((x) => `${x.name[l]} — ${fmt(x.value)} ${rec.unit[l]}`).join('; ');
      const q = poolQ(topic, d, {
        kind: 'text',
        prompt: wantMax ? rec.max : rec.min,
        ex: L(`Answer: ${best.name.en}. ${list('en')}.`, `Ответ: ${best.name.ru}. ${list('ru')}.`, `Жауабы: ${best.name.kk}. ${list('kk')}.`),
        mc: mcOf(rng, best.name, four.filter((x) => x !== best).map((x) => x.name)),
      });
      q.id = `${topic}:${rec.id}:${wantMax ? 'max' : 'min'}:${hashString(four.map((x) => x.name.en).sort().join())}`;
      if (!ctx.used?.has(q.id) || attempt > 30) return q;
    }
    return null;
  };
}

// ---------- Казахстан: области и соседи ----------

const REGIONS = lines(KZ_REGIONS).map(([en, ru, kk, cen, cru, ckk]) => ({ name: L(en, ru, kk), centre: L(cen, cru, ckk) }));

export function kazakhstanMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    for (let attempt = 0; attempt < 10; attempt++) {
      const mode = pick(rng, d === 1 ? ['centre', 'centre', 'border'] : ['centre', 'region', 'border', 'noborder']);
      let q;
      if (mode === 'centre' || mode === 'region') {
        const r = pick(rng, REGIONS);
        const wrong = others(rng, REGIONS.filter((x) => x !== r), r, (x) => (mode === 'centre' ? x.centre : x.name));
        q = poolQ(topic, d, {
          kind: 'text',
          prompt:
            mode === 'centre'
              ? L(`What is the administrative centre of ${r.name.en}?`, `Какой город — административный центр: ${r.name.ru}?`, `${r.name.kk} әкімшілік орталығы қай қала?`)
              : L(`${r.centre.en} is the centre of which region?`, `Центром какой области является ${r.centre.ru}?`, `${r.centre.kk} қай облыстың орталығы?`),
          ex: L(`${r.name.en}: centre — ${r.centre.en}.`, `${r.name.ru}: центр — ${r.centre.ru}.`, `${r.name.kk}: орталығы — ${r.centre.kk}.`),
          mc: mode === 'centre' ? mcOf(rng, r.centre, wrong.map((x) => x.centre)) : mcOf(rng, r.name, wrong.map((x) => x.name)),
        });
        q.id = `${topic}:${mode}:${r.name.en}`;
      } else {
        const yes = shuffle(KZ_NEIGHBOURS, rng);
        const no = shuffle(KZ_NOT_NEIGHBOURS, rng);
        const odd = mode === 'border' ? yes[0] : no[0];
        const rest = mode === 'border' ? no.slice(0, 3) : yes.slice(0, 3);
        const name = (en) => byName.get(en).name;
        const neighbours = (l) => KZ_NEIGHBOURS.map((en) => name(en)[l]).join(', ');
        q = poolQ(topic, d, {
          kind: 'text',
          prompt:
            mode === 'border'
              ? L('Which of these countries borders Kazakhstan?', 'Какая из этих стран граничит с Казахстаном?', 'Бұл елдердің қайсысы Қазақстанмен шекаралас?')
              : L('Which of these countries does NOT border Kazakhstan?', 'Какая из этих стран НЕ граничит с Казахстаном?', 'Бұл елдердің қайсысы Қазақстанмен шекаралас ЕМЕС?'),
          ex: L(`Kazakhstan has land borders with five countries: ${neighbours('en')}.`, `Казахстан граничит по суше с пятью странами: ${neighbours('ru')}.`, `Қазақстан құрлықта бес елмен шекаралас: ${neighbours('kk')}.`),
          mc: mcOf(rng, name(odd), rest.map(name)),
        });
        q.id = `${topic}:${mode}:${hashString([odd, ...rest].sort().join())}`;
      }
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

// Генератор заданий по истории: год события, век, что произошло раньше или позже, кто есть кто.
// Ключ сложности — 1…3.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { KZ_EVENTS, KZ_PEOPLE, RU_EVENTS, WORLD_EVENTS, WORLD_PEOPLE } from './timeline.js';

const rows = (text) => text.trim().split('\n').map((line) => line.split('|'));
const events = (text) => rows(text).map(([y, en, ru, kk]) => ({ year: Number(y), name: L(en, ru, kk) }));
const people = (text) => rows(text).map(([en, ru, kk, aen, aru, akk]) => ({ name: L(en, ru, kk), about: L(aen, aru, akk) }));

const SETS = {
  kz: { events: events(KZ_EVENTS), people: people(KZ_PEOPLE) },
  world: { events: events(WORLD_EVENTS), people: people(WORLD_PEOPLE) },
  ru: { events: events(RU_EVENTS), people: null },
};

export const TIMELINE_SIZE = Object.values(SETS).reduce((s, x) => s + x.events.length + (x.people?.length ?? 0), 0);

const yearText = (y) => (y < 0 ? L(`${-y} BC`, `${-y} г. до н. э.`, `б. з. д. ${-y} ж.`) : L(String(y), String(y), String(y)));
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const ord = (n) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const century = (c) => L(`the ${ord(c)} century`, `${ROMAN[c]} век`, `${ROMAN[c]} ғасыр`);

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

function yearTask(ctx, topic, d, set) {
  const { rng } = ctx;
  const e = pick(rng, set.events);
  // Ловушки: годы соседних событий и близкие годы — чем выше сложность, тем ближе.
  const spread = d === 1 ? [25, 50, 100] : d === 2 ? [5, 10, 20] : [1, 2, 3, 5];
  const cands = new Set();
  for (const s of shuffle(spread, rng)) cands.add(e.year + (rng() < 0.5 ? s : -s));
  for (const x of shuffle(set.events, rng).slice(0, 3)) cands.add(x.year);
  cands.delete(e.year);
  const wrong = shuffle([...cands].filter((y) => y !== 0 && y <= 2025), rng).slice(0, 3);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(`In which year did this happen: ${e.name.en}?`, `В каком году произошло событие: ${e.name.ru}?`, `Бұл оқиға қай жылы болды: ${e.name.kk}?`),
    ex: L(`${e.name.en} — ${yearText(e.year).en}.`, `${e.name.ru} — ${yearText(e.year).ru}.`, `${e.name.kk} — ${yearText(e.year).kk}.`),
    mc: mcOf(rng, yearText(e.year), wrong.map(yearText)),
  });
  q.id = `${topic}:y:${e.year}:${e.name.en}`;
  return q;
}

function centuryTask(ctx, topic, d, set) {
  const { rng } = ctx;
  const e = pick(rng, set.events.filter((x) => x.year > 0));
  const c = Math.ceil(e.year / 100);
  const near = [c - 1, c + 1, c - 2, c + 2, c - 3, c + 3].filter((x) => x >= 1 && x <= 21);
  const wrong = shuffle(near.slice(0, 4), rng).slice(0, 3);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(`In which century did this happen: ${e.name.en}?`, `В каком веке произошло событие: ${e.name.ru}?`, `Бұл оқиға қай ғасырда болды: ${e.name.kk}?`),
    ex: L(`${e.year} is in ${century(c).en}: years ${(c - 1) * 100 + 1}–${c * 100}.`, `${e.year} год — это ${century(c).ru}: годы ${(c - 1) * 100 + 1}–${c * 100}.`, `${e.year} жыл — ${century(c).kk}: ${(c - 1) * 100 + 1}–${c * 100} жылдар.`),
    mc: mcOf(rng, century(c), wrong.map(century)),
  });
  q.id = `${topic}:c:${e.name.en}`;
  return q;
}

function orderTask(ctx, topic, d, set) {
  const { rng } = ctx;
  for (let attempt = 0; attempt < 20; attempt++) {
    const four = shuffle(set.events, rng).slice(0, 4);
    if (new Set(four.map((x) => x.year)).size < 4) continue;
    const sorted = [...four].sort((a, b) => a.year - b.year);
    // На первой сложности события далеко друг от друга.
    const gap = d === 1 ? 50 : d === 2 ? 10 : 1;
    if (sorted[1].year - sorted[0].year < gap || sorted[3].year - sorted[2].year < gap) continue;
    const first = rng() < 0.6;
    const right = first ? sorted[0] : sorted[3];
    const line = (l) => sorted.map((x) => `${yearText(x.year)[l]} — ${x.name[l]}`).join('; ');
    const q = poolQ(topic, d, {
      kind: 'text',
      prompt: first
        ? L('Which of these events happened first?', 'Какое из этих событий произошло раньше всех?', 'Бұл оқиғалардың қайсысы бәрінен бұрын болды?')
        : L('Which of these events happened last?', 'Какое из этих событий произошло позже всех?', 'Бұл оқиғалардың қайсысы бәрінен кейін болды?'),
      ex: L(`In order: ${line('en')}.`, `По порядку: ${line('ru')}.`, `Ретімен: ${line('kk')}.`),
      mc: mcOf(rng, right.name, four.filter((x) => x !== right).map((x) => x.name)),
    });
    q.id = `${topic}:o:${first ? 'f' : 'l'}:${hashString(four.map((x) => x.name.en).sort().join())}`;
    return q;
  }
  return null;
}

function personTask(ctx, topic, d, set) {
  const { rng } = ctx;
  const p = pick(rng, set.people);
  const wrong = shuffle(set.people.filter((x) => x !== p), rng).slice(0, 3);
  const fwd = rng() < 0.5;
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: fwd
      ? L(`Who was ${p.name.en}?`, `Кто такой ${p.name.ru}?`, `${p.name.kk} кім?`)
      : L(`Who is this: ${p.about.en}?`, `О ком речь: ${p.about.ru}?`, `Бұл кім туралы: ${p.about.kk}?`),
    ex: L(`${p.name.en} — ${p.about.en}.`, `${p.name.ru} — ${p.about.ru}.`, `${p.name.kk} — ${p.about.kk}.`),
    mc: fwd ? mcOf(rng, p.about, wrong.map((x) => x.about)) : mcOf(rng, p.name, wrong.map((x) => x.name)),
  });
  q.id = `${topic}:p:${fwd ? 'f' : 'b'}:${p.name.en}`;
  return q;
}

/** Генератор по истории региона: kz — Казахстан, world — всемирная, ru — Россия. */
export function timelineMaker(topic, region) {
  const set = SETS[region];
  return (ctx, d) => {
    const modes = ['year', 'year', 'order', 'order', ...(d >= 2 ? ['century'] : []), ...(set.people ? ['person', 'person'] : [])];
    for (let attempt = 0; attempt < 10; attempt++) {
      const mode = pick(ctx.rng, modes);
      const q =
        mode === 'year' ? yearTask(ctx, topic, d, set) : mode === 'century' ? centuryTask(ctx, topic, d, set) : mode === 'order' ? orderTask(ctx, topic, d, set) : personTask(ctx, topic, d, set);
      if (q && (!ctx.used?.has(q.id) || attempt === 9)) return q;
    }
    return yearTask(ctx, topic, d, set);
  };
}

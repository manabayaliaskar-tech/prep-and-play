// Задания по английскому, собранные из таблиц (запись как в bank.js): времена, предлоги времени и места.
// Каждая строка проверена по построению: один правильный вариант, остальные заведомо неверны.

const VP = `play|plays|playing|played|played|football after school
watch|watches|watching|watched|watched|a film
cook|cooks|cooking|cooked|cooked|dinner
clean|cleans|cleaning|cleaned|cleaned|the kitchen
write|writes|writing|wrote|written|a letter
drink|drinks|drinking|drank|drunk|tea
eat|eats|eating|ate|eaten|lunch
buy|buys|buying|bought|bought|bread
take|takes|taking|took|taken|photos
make|makes|making|made|made|a cake
see|sees|seeing|saw|seen|a doctor
meet|meets|meeting|met|met|friends
sing|sings|singing|sang|sung|a song
swim|swims|swimming|swam|swum|in the river
ride|rides|riding|rode|ridden|a bike
drive|drives|driving|drove|driven|a truck
speak|speaks|speaking|spoke|spoken|English
run|runs|running|ran|run|in the park
give|gives|giving|gave|given|a present
draw|draws|drawing|drew|drawn|a picture
sleep|sleeps|sleeping|slept|slept|late
teach|teaches|teaching|taught|taught|maths
paint|paints|painting|painted|painted|the fence
open|opens|opening|opened|opened|the window
wash|washes|washing|washed|washed|the car
learn|learns|learning|learned|learned|a poem
visit|visits|visiting|visited|visited|an aunt
call|calls|calling|called|called|a friend
answer|answers|answering|answered|answered|the phone
carry|carries|carrying|carried|carried|heavy bags
study|studies|studying|studied|studied|history
build|builds|building|built|built|a house
find|finds|finding|found|found|a coin
bring|brings|bringing|brought|brought|a gift
win|wins|winning|won|won|the game
wear|wears|wearing|wore|worn|a hat
catch|catches|catching|caught|caught|a fish
grow|grows|growing|grew|grown|tomatoes
break|breaks|breaking|broke|broken|a cup
travel|travels|travelling|travelled|travelled|by train
come|comes|coming|came|come|home late
sell|sells|selling|sold|sold|vegetables`
  .split('\n')
  .map((l) => {
    const [b, s, g, p, pp, rest] = l.split('|');
    return { b, s, g, p, pp, rest };
  });

// [с большой буквы, с маленькой, местоимение, вид]: s - он / она, p - они / мы / вы, i - я.
const SUBJ = [
  ['My brother', 'my brother', 'he', 's'],
  ['Our teacher', 'our teacher', 'she', 's'],
  ['The boy', 'the boy', 'he', 's'],
  ['Aigerim', 'Aigerim', 'she', 's'],
  ['My parents', 'my parents', 'they', 'p'],
  ['The children', 'the children', 'they', 'p'],
  ['We', 'we', 'we', 'p'],
  ['My mother', 'my mother', 'she', 's'],
  ['Her cousin', 'her cousin', 'he', 's'],
  ['They', 'they', 'they', 'p'],
  ['The old man', 'the old man', 'he', 's'],
  ['The students', 'the students', 'they', 'p'],
  ['I', 'I', 'I', 'i'],
  ['Daniyar', 'Daniyar', 'he', 's'],
  ['My friends', 'my friends', 'they', 'p'],
  ['Dana', 'Dana', 'she', 's'],
  ['Our neighbours', 'our neighbours', 'they', 'p'],
  ['My grandfather', 'my grandfather', 'he', 's'],
  ['You', 'you', 'you', 'p'],
  ['The girl', 'the girl', 'she', 's'],
];
const FREQ = ['every day', 'every morning', 'every weekend', 'on Sundays', 'twice a week', 'every evening'];
const PAST = ['Yesterday', 'Last night', 'Two days ago', 'Last Sunday', 'A week ago', 'Last summer'];

const be = (k) => (k === 'i' ? 'am' : k === 's' ? 'is' : 'are');
const was = (k) => (k === 's' || k === 'i' ? 'was' : 'were');
const has = (k) => (k === 's' ? 'has' : 'have');

/** Три разных неверных варианта из кандидатов (без правильного ответа). */
function wrongOf(correct, cands, extra) {
  const out = [];
  for (const c of [...cands, ...extra]) if (c !== correct && !out.includes(c)) out.push(c);
  return out.slice(0, 3);
}

const rows = { 1: [], 2: [], 3: [], 4: [] };

/** Для шаблона t берём n глаголов со сдвигом и разные подлежащие. */
function build(level, t, n, make) {
  for (let i = 0; i < n; i++) {
    const v = VP[(i * 3 + t * 5) % VP.length];
    const sub = SUBJ[(i * 7 + t * 3) % SUBJ.length];
    const row = make(v, sub, i);
    if (row) rows[level].push([level, ...row]);
  }
}
const X = (v) => [`to ${v.b}`];

// ---------- A1 ----------
build(1, 0, 22, (v, [C, , , k], i) => {
  const ok = k === 's' ? v.s : v.b;
  return [`${C} ______ ${v.rest} ${FREQ[i % 6]}.`, ok, wrongOf(ok, [k === 's' ? v.b : v.s, v.g, v.p], X(v)), k === 's' ? 'ps3' : 'psbase'];
});
build(1, 1, 20, (v, [C, , , k]) => {
  const ok = `${be(k)} ${v.g}`;
  const bad = k === 's' ? 'are' : 'is';
  return [`Look! ${C} ______ ${v.rest}.`, ok, wrongOf(ok, [k === 's' ? v.s : v.b, v.p, `${bad} ${v.g}`], X(v)), 'prescont'];
});
build(1, 2, 20, (v, [, m, , k], i) => [`${PAST[i % 6]} ${m} ______ ${v.rest}.`, v.p, wrongOf(v.p, [v.b, v.s, v.g], X(v)), 'pastirr']);
build(1, 3, 16, (v, [, m], i) => [`Did ${m} ______ ${v.rest} ${['yesterday', 'last night', 'last week'][i % 3]}?`, v.b, wrongOf(v.b, [v.p, v.s, v.g], X(v)), 'did']);
build(1, 4, 14, (v, [, m, , k]) => {
  const ok = k === 's' ? 'Does' : 'Do';
  return [`______ ${m} ${v.b} ${v.rest} every day?`, ok, wrongOf(ok, ['Did', k === 's' ? 'Is' : 'Are', 'Has'], []), 'psdo'];
});
build(1, 5, 14, (v, [C, , , k], i) => {
  const ok = k === 's' ? 'does' : 'do';
  return [`${C} ______ not ${v.b} ${v.rest} ${FREQ[(i + 2) % 6]}.`, ok, wrongOf(ok, [k === 's' ? 'do' : 'does', k === 's' ? 'is' : 'are', 'has'], []), 'psdo'];
});

// ---------- A2 ----------
build(2, 0, 20, (v, [, m]) => [`Have you ever ______ ${v.rest}?`, v.pp, wrongOf(v.pp, [v.b, v.g, v.s, v.p], X(v)), 'ppexp']);
build(2, 1, 18, (v, [C, , , k]) => {
  const ok = v.pp;
  return [`${C} ${has(k)} never ______ ${v.rest}.`, ok, wrongOf(ok, [v.b, v.g, v.s, v.p], X(v)), 'ppexp'];
});
build(2, 2, 18, (v, [, m, , k], i) => {
  const ok = `${was(k)} ${v.g}`;
  const t = ["At nine o'clock last night", 'At that moment yesterday', 'At six yesterday evening'][i % 3];
  return [`${t}, ${m} ______ ${v.rest}.`, ok, wrongOf(ok, [`${be(k)} ${v.g}`, `${has(k)} ${v.pp}`, k === 's' ? v.s : v.b], []), 'pastcont'];
});
build(2, 3, 16, (v, [, m], i) => [`Years ago, ${m} ______ ${v.rest} ${['every week', 'every summer', 'every Saturday'][i % 3]}.`, `used to ${v.b}`, [`use to ${v.b}`, `used to ${v.g}`, `was used to ${v.b}`], 'usedto']);
build(2, 4, 16, (v, [, m, , k], i) => [`${['Tomorrow', 'Next week', 'Next month'][i % 3]} ${m} ______ ${v.rest}.`, `will ${v.b}`, [`will ${v.s}`, `will ${v.g}`, `would ${v.p}`], 'will']);
build(2, 5, 14, (v, [, m, , k], i) => {
  const ok = `${be(k)} going to ${v.b}`;
  return [`I think ${m} ______ ${v.rest} ${['tomorrow', 'next week', 'soon'][i % 3]}.`, ok, [`${be(k)} going ${v.b}`, `${be(k)} go to ${v.g}`, `will to ${v.b}`], 'goingto'];
});

// ---------- B1 ----------
build(3, 0, 22, (v, [, m, , k]) => [`By the time we arrived, ${m} ______ ${v.rest}.`, `had ${v.pp}`, [`${has(k)} ${v.pp}`, `will have ${v.pp}`, `${be(k)} ${v.g}`], 'pastperf']);
build(3, 1, 20, (v, [C, , , k], i) => [`${C} ______ ${v.rest} for ${['two hours', 'three hours', 'a long time'][i % 3]} when the phone rang.`, `had been ${v.g}`, [`${has(k)} been ${v.g}`, `was been ${v.g}`, `${be(k)} ${v.g}`], 'pastperfcont']);
build(3, 2, 20, (v, [, m, , k], i) => [`${['This time tomorrow', 'At noon tomorrow', 'At eight tomorrow morning'][i % 3]}, ${m} ______ ${v.rest}.`, `will be ${v.g}`, [`will ${v.g}`, `${has(k)} ${v.pp}`, `${was(k)} ${v.g}`], 'futcont']);
build(3, 3, 20, (v, [C, , , k]) => [`${C} ______ ${v.rest} since early morning.`, `${has(k)} been ${v.g}`, [`${be(k)} ${v.g}`, k === 's' ? v.s : v.b, `had ${v.g}`], 'ppcont']);
build(3, 4, 16, (v, [, m, , k]) => [`It is the first time ${m} ______ ${v.rest}.`, `${has(k)} ${v.pp}`, [`${was(k)} ${v.g}`, `had ${v.pp}`, `does ${v.b}`], 'firsttime']);

// ---------- B2 ----------
build(4, 0, 18, (v, [C, , p, k]) => [`${C} ${was(k)} exhausted because ${p} ______ ${v.rest} all day.`, `had been ${v.g}`, [`${has(k === 'i' ? 'p' : k)} been ${v.g}`, `${be(k)} ${v.g}`, `had ${v.g}`], 'pastperfcont']);

export const MORE4_GEN = {
  'e.tenses': [...rows[1], ...rows[2], ...rows[3], ...rows[4]],
};

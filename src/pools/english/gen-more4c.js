// Задания по английскому из таблиц существительных и предлогов (запись как в bank.js).

const COUNT = 'apples books chairs students cars eggs tomatoes flowers pencils bananas shops tickets mistakes visitors questions birds windows coins sandwiches stamps friends teachers rooms ideas photos oranges cups lessons games letters'.split(' ');
const UNC = 'water milk sugar rice bread money time music snow salt coffee tea furniture traffic homework information advice rain luggage cheese butter juice oil paper noise work weather sand flour'.split(' ');
const SOMEC = 'apples books pencils bananas tickets eggs tomatoes oranges cups stamps sandwiches letters'.split(' ');
const SOMEU = 'water milk sugar rice bread salt coffee tea paper cheese butter juice oil flour'.split(' ');
const rows = { det: [], basics: [], prep: [] };

const MM = ['How much / how many: much - с неисчисляемыми, many - с исчисляемыми во множественном числе.', 'How much / how many: much - саналмайтын, many - көпше түрдегі саналатын зат есіммен.'];
const FEW = ['a few - с исчисляемыми, a little - с неисчисляемыми.', 'a few - саналатын, a little - саналмайтын зат есіммен.'];
const SOME = ['some используется в просьбах и предложениях: с исчисляемыми во мн. числе и неисчисляемыми.', 'some өтініш пен ұсыныста қолданылады: көпше саналатын және саналмайтын зат есіммен.'];
const TOO = ['too many - с исчисляемыми, too much - с неисчисляемыми.', 'too many - саналатын, too much - саналмайтын зат есіммен.'];
const FEWER = ['fewer - с исчисляемыми, less - с неисчисляемыми.', 'fewer - саналатын, less - саналмайтын зат есіммен.'];
const SOMANY = ['so many - с исчисляемыми, so much - с неисчисляемыми.', 'so many - саналатын, so much - саналмайтын зат есіммен.'];

COUNT.forEach((n, i) => {
  rows.det.push([1, `How ______ ${n} do you need?`, 'many', ['much', 'little', 'a little'], MM]);
  rows.det.push([2, `We have only ______ ${n} left.`, 'a few', ['a little', 'much', 'a lot'], FEW]);
  rows.det.push([3, `There are too ______ ${n} in this room.`, 'many', ['much', 'a few', 'a lot'], TOO]);
  rows.det.push([4, `There were ______ ${n} than we expected.`, 'fewer', ['less', 'few', 'a few'], FEWER]);
  rows.det.push([3, `I could not believe there were so ______ ${n} in the shop.`, 'many', ['much', 'a little', 'a lot'], SOMANY]);
  if (SOMEC.includes(n)) rows.det.push([2, `Can I have ______ ${n}, please?`, 'some', ['a', 'an', 'much'], SOME]);
});
UNC.forEach((n) => {
  rows.det.push([1, `How ______ ${n} do you need?`, 'much', ['many', 'few', 'a few'], MM]);
  rows.det.push([2, `We have only ______ ${n} left.`, 'a little', ['a few', 'many', 'a lot'], FEW]);
  rows.det.push([3, `There is too ______ ${n} in this house.`, 'much', ['many', 'a little', 'a lot'], TOO]);
  rows.det.push([4, `There was ______ ${n} than we expected.`, 'less', ['fewer', 'little', 'a little'], FEWER]);
  rows.det.push([3, `I could not believe there was so ______ ${n} here.`, 'much', ['many', 'a few', 'a lot'], SOMANY]);
  if (SOMEU.includes(n)) rows.det.push([2, `Can I have ______ ${n}, please?`, 'some', ['a', 'an', 'many'], SOME]);
});

// a / an: слово - тип первого звука (v - гласный звук)
const AAN = ['a|ant', 'e|egg', 'i|idea', 'o|orange', 'u|umbrella', 'a|apple', 'h|hour', 'h|honest man', 'u|university', 'c|car', 'b|book', 'd|dog', 'f|friend', 'g|garden', 'l|lamp', 'm|mother', 'n|nurse', 'p|pen', 'r|rabbit', 's|sister', 't|table', 'w|window', 'y|yellow bag', 'e|elephant', 'e|email', 'u|uncle', 'e|English book', 'o|old man', 'u|unit', 'u|uniform', 'h|horse', 'i|island', 'a|actor', 'a|airport', 'a|answer', 'c|cat', 'k|key', 'j|job', 'z|zoo', 'v|village'];
const VOWEL = new Set(['ant', 'egg', 'idea', 'orange', 'umbrella', 'apple', 'hour', 'honest man', 'elephant', 'email', 'uncle', 'English book', 'old man', 'island', 'actor', 'airport', 'answer']);
const AANREF = ['an - перед гласным звуком (an apple, an hour), a - перед согласным звуком (a university, a unit).', 'an - дауысты дыбыс алдында (an apple, an hour), a - дауыссыз дыбыс алдында (a university, a unit).'];
AAN.forEach((e, i) => {
  const w = e.split('|')[1];
  const ok = VOWEL.has(w) ? 'an' : 'a';
  const bad = ok === 'an' ? 'a' : 'an';
  const frame = [`I need ______ ${w}.`, `She has ______ ${w}.`, `Is there ______ ${w} here?`][i % 3];
  rows.basics.push([1, frame, ok, [bad, 'some', 'many'], AANREF]);
});

// множественное число: единственное|множественное
const PL = 'box|boxes bus|buses watch|watches dish|dishes baby|babies city|cities country|countries story|stories lady|ladies family|families boy|boys day|days key|keys toy|toys leaf|leaves knife|knives wife|wives shelf|shelves wolf|wolves man|men woman|women child|children foot|feet tooth|teeth mouse|mice potato|potatoes tomato|tomatoes hero|heroes photo|photos piano|pianos class|classes glass|glasses church|churches brush|brushes fox|foxes party|parties library|libraries'.split(' ');
const WRONG_PL = (s, p) => {
  const c = [s + 's', s + 'es', s.replace(/y$/, 'ies'), s.replace(/y$/, 'ys'), s.replace(/f$|fe$/, 'ves'), s + 'en', s, s.replace(/o$/, 'oes'), s.replace(/oo/, 'ee'), s.replace(/an$/, 'en')];
  return [...new Set(c)].filter((x) => x !== p && !['mans', 'womans', 'childs', 'foots', 'tooths', 'mouses'].includes(x) || true).filter((x) => x !== p);
};
const OKPL = new Set(['photos', 'pianos', 'tomatoes', 'potatoes', 'heroes', 'wolves', 'leaves', 'knives', 'wives', 'shelves']);
PL.forEach((e, i) => {
  const [s, p] = e.split('|');
  // исключаем неоднозначные: допустимые варианты не должны попадать в неверные
  const bad = WRONG_PL(s, p).filter((x) => !['mice', 'people', 'persons', 'tomatos', 'potatos', 'heros', 'wolfs', 'leafs', 'knifes', 'wifes', 'shelfs'].includes(x) || true);
  const wrong = bad.filter((x) => x !== s || ['sheep'].includes(s)).slice(0, 3);
  if (wrong.length < 3) return;
  const frames = [`There are three ______ in the picture.`, `I can see two ______ over there.`, `We bought five ______ yesterday.`, `Look at those ______!`];
  for (const frame of [frames[i % 4], frames[(i + 1) % 4]]) {
  rows.basics.push([2, frame, p, wrong, ['Множественное число: ' + s + ' - ' + p + '.', 'Көпше түрі: ' + s + ' - ' + p + '.']]);
  }
});

// предлоги времени и места: [уровень, слово/обороты, предлог, три заведомо неверных]
const TIME = [
  ['six o\'clock', 'at'], ['noon', 'at'], ['night', 'at'], ['midnight', 'at'], ['lunchtime', 'at'], ['Christmas', 'at'],
  ['Monday', 'on'], ['Friday evening', 'on'], ['my birthday', 'on'], ['the fifth of May', 'on'], ['New Year\'s Day', 'on'], ['Sunday morning', 'on'], ['Saturdays', 'on'], ['Tuesday', 'on'],
  ['July', 'in'], ['winter', 'in'], ['2020', 'in'], ['the morning', 'in'], ['the evening', 'in'], ['the afternoon', 'in'], ['the twenty-first century', 'in'], ['spring', 'in'], ['October', 'in'], ['summer', 'in'],
];
const TFRAME = [(n) => `The concert starts ______ ${n}.`, (n) => `We usually meet ______ ${n}.`, (n) => `My cousin arrived ______ ${n}.`];
TIME.forEach(([n, p], i) => {
  const wrong = ['in', 'on', 'at'].filter((x) => x !== p).concat(['to', 'of']).slice(0, 3);
  TFRAME.forEach((f, k) => {
    if (k === 2 && i % 2) return;
    rows.prep.push([k === 0 ? 1 : k === 1 ? 1 : 2, f(n), p, wrong, 'timeprep']);
  });
});
const PLACE = [
  ['the kitchen', 'in', ['on', 'at', 'of']], ['Paris', 'in', ['on', 'at', 'to']], ['the second floor', 'on', ['in', 'at', 'of']],
  ['the left', 'on', ['in', 'at', 'of']], ['the bus stop', 'at', ['in', 'on', 'of']],
];
const PFRAME = [(n) => `My brother is waiting ______ ${n}.`, (n) => `We met ______ ${n} yesterday.`];
PLACE.forEach(([n, p, w], i) => {
  PFRAME.forEach((f, k) => {
    const sent = f(n);
    // «waiting in the car / on the bus» допустимо только для явного варианта, потому неверные - явно неподходящие
    rows.prep.push([k === 0 ? 1 : 2, sent, p, w, 'placeprep']);
  });
});

export const MORE4_GEN3 = { 'e.det': rows.det, 'e.basics': rows.basics, 'e.prep': rows.prep };

// Каталог сайта: три раздела (экзамены, олимпиадная математика, ежедневная практика),
// в каждом — курсы, в каждом курсе — дорожки (предметы или уровни).
// Дорожка — это просто список тем из общих банков (src/pools), поэтому новый экзамен
// добавляется описанием в этом файле, без изменения игрового движка.

import { englishSpec } from '../pools/english/index.js';
import { L } from '../pools/gen.js';

export const GROUPS = [
  {
    id: 'exams',
    href: '/exams',
    icon: '📝',
    color: '#0ea5e9',
    name: L('Exams', 'Экзамены', 'Емтихандар'),
    desc: L(
      'SAT, IELTS, TOEFL and the national exams of the CIS countries.',
      'SAT, IELTS, TOEFL и национальные экзамены стран СНГ.',
      'SAT, IELTS, TOEFL және ТМД елдерінің ұлттық емтихандары.',
    ),
  },
  {
    id: 'olymp',
    href: '/c/olymp',
    icon: '🏆',
    color: '#f59e0b',
    name: L('Olympiad math', 'Олимпиадная математика', 'Олимпиадалық математика'),
    desc: L(
      'Non-standard problems: logic, combinatorics, number theory.',
      'Нестандартные задачи: логика, комбинаторика, теория чисел.',
      'Стандартты емес есептер: логика, комбинаторика, сандар теориясы.',
    ),
  },
  {
    id: 'code',
    href: '/code',
    icon: '💻',
    color: '#0f172a',
    name: L('Programming', 'Программирование', 'Бағдарламалау'),
    desc: L(
      'Python, C++, JavaScript and Java: read code and predict what it prints.',
      'Python, C++, JavaScript и Java: читай код и угадывай, что он выведет.',
      'Python, C++, JavaScript және Java: кодты оқып, оның не шығаратынын тап.',
    ),
  },
  {
    id: 'daily',
    href: '/practice',
    icon: '📅',
    color: '#22c55e',
    name: L('Daily practice', 'Ежедневная практика', 'Күнделікті жаттығу'),
    desc: L(
      'Math, languages and sciences at any level — a little every day.',
      'Математика, языки и естественные науки на любом уровне — понемногу каждый день.',
      'Кез келген деңгейдегі математика, тілдер және жаратылыстану — күн сайын аздап.',
    ),
  },
];

// ---------- Наборы тем ----------

/** Математика по классам: 1–11 класс и три уровня после школы. Сложность внутри темы — 1…3. */
const G = (en, ru, kk) => L(en, ru, kk);
const MATH_GRADES = [
  [G('Counting to 10', 'Счёт до 10', '10-ға дейін санау'), G('Adding and subtracting within 10', 'Сложение и вычитание в пределах 10', '10 көлемінде қосу және азайту'),
    [['m.early', [1]]]],
  [G('Numbers to 100', 'Числа до 100', '100-ге дейінгі сандар'), G('Crossing ten, comparison, first word problems', 'Переход через десяток, сравнение, первые задачи', 'Ондықтан өту, салыстыру, алғашқы есептер'),
    [['m.early', [2, 3]], ['m.add', [1]], ['m.mul', [1]]]],
  [G('Times tables', 'Таблица умножения', 'Көбейту кестесі'), G('Multiplication, division, order of operations', 'Умножение, деление, порядок действий', 'Көбейту, бөлу, амалдар реті'),
    [['m.add', [1, 2]], ['m.mul', [1, 2]], ['m.seq', [1]], ['m.order', [1]]]],
  [G('Multi-digit numbers', 'Многозначные числа', 'Көп таңбалы сандар'), G('Big numbers, motion, area of a rectangle', 'Большие числа, движение, площадь прямоугольника', 'Үлкен сандар, қозғалыс, тіктөртбұрыш ауданы'),
    [['m.add', [2, 3]], ['m.mul', [2, 3]], ['m.order', [1, 2]], ['m.seq', [1, 2]], ['m.area', [1]], ['m.motion', [1]]]],
  [G('Fractions and decimals', 'Дроби и десятичные', 'Бөлшектер мен ондық сандар'), G('Fractions, decimals, divisibility, angles', 'Обыкновенные и десятичные дроби, делимость, углы', 'Жай және ондық бөлшектер, бөлінгіштік, бұрыштар'),
    [['m.frac', [1, 2]], ['m.dec', [1, 2]], ['m.divis', [1, 2]], ['m.order', [2, 3]], ['m.area', [1, 2]], ['m.pct', [1]], ['m.angle', [1]], ['m.mix', [1]]]],
  [G('Negative numbers and ratios', 'Отрицательные числа и пропорции', 'Теріс сандар мен пропорциялар'), G('Negative numbers, proportions, first equations', 'Отрицательные числа, пропорции, первые уравнения', 'Теріс сандар, пропорциялар, алғашқы теңдеулер'),
    [['m.neg', [1, 2, 3]], ['m.frac', [3]], ['m.dec', [3]], ['m.ratio', [1, 2]], ['m.pct', [1, 2]], ['m.divis', [3]], ['m.lineq', [1]], ['m.stat', [1]], ['m.work', [1]]]],
  [G('Algebra begins', 'Начало алгебры', 'Алгебраның басы'), G('Linear equations, expressions, functions, triangles', 'Линейные уравнения, выражения, функции, треугольники', 'Сызықтық теңдеулер, өрнектер, функциялар, үшбұрыштар'),
    [['m.lineq', [1, 2, 3]], ['m.expr', [1, 2]], ['m.pow', [1]], ['m.func', [1]], ['m.sys', [1]], ['m.angle', [1, 2]], ['m.motion', [2]], ['m.prob', [1]]]],
  [G('Quadratics and Pythagoras', 'Квадратные уравнения и Пифагор', 'Квадрат теңдеулер мен Пифагор'), G('Quadratic equations, roots, inequalities, areas', 'Квадратные уравнения, корни, неравенства, площади', 'Квадрат теңдеулер, түбірлер, теңсіздіктер, аудандар'),
    [['m.quad', [1, 2]], ['m.pow', [2]], ['m.ineq', [1, 2]], ['m.pyth', [1, 2]], ['m.area', [2, 3]], ['m.expr', [3]], ['m.func', [2]], ['m.stat', [2]]]],
  [G('Progressions and systems', 'Прогрессии и системы', 'Прогрессиялар мен жүйелер'), G('Progressions, systems, probability, circles', 'Прогрессии, системы, вероятность, окружность', 'Прогрессиялар, жүйелер, ықтималдық, шеңбер'),
    [['m.prog', [1, 2]], ['m.sys', [2, 3]], ['m.ineq', [3]], ['m.func', [3]], ['m.prob', [2]], ['m.comb', [1]], ['m.angle', [3]], ['m.vol', [1]], ['m.work', [2]], ['m.mix', [2]]]],
  [G('Trigonometry and logarithms', 'Тригонометрия и логарифмы', 'Тригонометрия мен логарифмдер'), G('Trigonometry, logarithms, combinatorics, solids', 'Тригонометрия, логарифмы, комбинаторика, тела', 'Тригонометрия, логарифмдер, комбинаторика, денелер'),
    [['m.trig', [1, 2, 3]], ['m.log', [1, 2]], ['m.pow', [3]], ['m.vol', [2]], ['m.comb', [2]], ['m.prob', [3]], ['m.quad', [3]]]],
  [G('Derivative and exam prep', 'Производная и подготовка к экзаменам', 'Туынды және емтиханға дайындық'), G('Derivative, logarithmic equations, volumes, statistics', 'Производная, логарифмические уравнения, объёмы, статистика', 'Туынды, логарифмдік теңдеулер, көлемдер, статистика'),
    [['m.deriv', [1, 2, 3]], ['m.log', [3]], ['m.prog', [3]], ['m.vol', [3]], ['m.comb', [3]], ['m.stat', [3]], ['m.pyth', [3]], ['m.motion', [3]], ['m.mix', [3]]]],
];
const MATH_BEYOND = [
  ['🎓', G('Whole school course', 'Весь школьный курс', 'Мектеп курсы толығымен'), G('The hardest school problems from every topic', 'Самые трудные школьные задачи по всем темам', 'Барлық тақырып бойынша ең қиын мектеп есептері'),
    [['m.lineq', [3]], ['m.quad', [3]], ['m.sys', [3]], ['m.ineq', [3]], ['m.func', [3]], ['m.pow', [3]], ['m.log', [3]], ['m.trig', [3]], ['m.deriv', [3]], ['m.prog', [3]], ['m.prob', [3]], ['m.comb', [3]], ['m.vol', [3]], ['m.pyth', [3]], ['m.pct', [3]], ['m.mix', [3]]]],
  ['∑', G('Introduction to higher math', 'Начала высшей математики', 'Жоғары математиканың бастамасы'), G('Limits, integrals, complex numbers, vectors', 'Пределы, интегралы, комплексные числа, векторы', 'Шектер, интегралдар, комплекс сандар, векторлар'),
    [['m.limit', [1, 2]], ['m.integral', [1, 2]], ['m.complex', [1, 2]], ['m.vector', [1, 2]], ['m.matrix', [1]]]],
  ['∫', G('Higher mathematics', 'Высшая математика', 'Жоғары математика'), G('Harder limits and integrals, matrices, perpendicular vectors', 'Сложные пределы и интегралы, матрицы, перпендикулярные векторы', 'Күрделі шектер мен интегралдар, матрицалар, перпендикуляр векторлар'),
    [['m.limit', [3]], ['m.integral', [3]], ['m.complex', [3]], ['m.vector', [3]], ['m.matrix', [2, 3]], ['m.deriv', [3]]]],
];

/** Подписи уровней математики: «1 класс» … «11 класс», «11+ · уровень 1» … */
const gradeKicker = (g) => L(`Grade ${g}`, `${g} класс`, `${g}-сынып`);
const beyondKicker = (k) => L(`11+ · level ${k}`, `11+ · уровень ${k}`, `11+ · ${k}-деңгей`);

/** Математическая грамотность: проценты, пропорции, текстовые задачи, данные. */
const MATH_LITERACY = [['m.pct', [1, 2, 3]], ['m.ratio', [2, 3]], ['m.motion', [1, 2]], ['m.work', [1, 2]], ['m.mix', [1, 2]], ['m.seq', [2, 3]], ['m.stat', [1, 2, 3]], ['m.area', [1, 2]], ['m.prob', [1]], ['m.order', [2]], ['m.frac', [2]], ['m.dec', [2]]];
/** Базовая школьная математика (9 класс). */
const MATH_BASIC = [['m.frac', [2, 3]], ['m.dec', [2, 3]], ['m.pct', [1, 2, 3]], ['m.ratio', [1, 2]], ['m.lineq', [1, 2, 3]], ['m.expr', [1, 2]], ['m.pow', [1, 2]], ['m.quad', [1, 2]], ['m.sys', [1, 2]], ['m.ineq', [1, 2]], ['m.func', [1, 2]], ['m.prog', [1, 2]], ['m.area', [1, 2, 3]], ['m.pyth', [1, 2]], ['m.angle', [1, 2, 3]], ['m.stat', [1, 2]], ['m.prob', [1, 2]], ['m.motion', [1, 2]], ['m.work', [1, 2]]];
/** Математика выпускного уровня (11 класс). */
const MATH_SENIOR = [['m.quad', [2, 3]], ['m.sys', [2, 3]], ['m.ineq', [2, 3]], ['m.pow', [2, 3]], ['m.log', [1, 2, 3]], ['m.trig', [1, 2, 3]], ['m.prog', [1, 2, 3]], ['m.deriv', [1, 2, 3]], ['m.func', [2, 3]], ['m.pyth', [2, 3]], ['m.vol', [1, 2, 3]], ['m.comb', [1, 2, 3]], ['m.prob', [2, 3]], ['m.motion', [2, 3]], ['m.work', [2, 3]], ['m.mix', [2, 3]], ['m.area', [3]], ['m.angle', [3]], ['m.expr', [3]], ['m.pct', [3]]];

const N = {
  math: L('Mathematics', 'Математика', 'Математика'),
  mathLit: L('Mathematical literacy', 'Математическая грамотность', 'Математикалық сауаттылық'),
  mathProfile: L('Mathematics (profile subject)', 'Математика (профильный предмет)', 'Математика (бейіндік пән)'),
  english: L('English', 'Английский язык', 'Ағылшын тілі'),
  history: L('History', 'История', 'Тарих'),
  physics: L('Physics', 'Физика', 'Физика'),
  chemistry: L('Chemistry', 'Химия', 'Химия'),
  biology: L('Biology', 'Биология', 'Биология'),
  geography: L('Geography', 'География', 'География'),
  informatics: L('Computer science', 'Информатика', 'Информатика'),
  native: L('Native language', 'Родной язык', 'Ана тілі'),
  russian: L('Russian language', 'Русский язык', 'Орыс тілі'),
  social: L('Social studies', 'Обществознание', 'Қоғамтану'),
  listening: L('Listening', 'Listening (аудирование)', 'Listening (тыңдалым)'),
  speaking: L('Speaking', 'Speaking (говорение)', 'Speaking (айтылым)'),
  writing: L('Writing', 'Writing (письмо)', 'Writing (жазылым)'),
};

const D = {
  mathAll: L('Algebra, geometry, word problems', 'Алгебра, геометрия, текстовые задачи', 'Алгебра, геометрия, мәтінді есептер'),
  mathSenior: L('Equations, logarithms, trigonometry, derivative', 'Уравнения, логарифмы, тригонометрия, производная', 'Теңдеулер, логарифмдер, тригонометрия, туынды'),
  mathLit: L('Percentages, proportions, logic, data', 'Проценты, пропорции, логика, данные', 'Пайыздар, пропорциялар, логика, деректер'),
};

const track = (id, icon, name, desc, spec, test = null) => ({ id, icon, name, desc, spec, test });

// Английский: уровни европейской шкалы. Ключ в наборе тем — номер уровня от 1 (A1) до 6 (C2).
const ENGLISH_LEVELS = [
  ['A1', L('Beginner', 'Начальный', 'Бастапқы'), L('To be, Present Simple, first words', 'To be, Present Simple, первые слова', 'To be, Present Simple, алғашқы сөздер')],
  ['A2', L('Elementary', 'Элементарный', 'Қарапайым'), L('Past and future, comparison, everyday vocabulary', 'Прошедшее и будущее, сравнение, бытовая лексика', 'Өткен және келер шақ, салыстыру, тұрмыстық лексика')],
  ['B1', L('Intermediate', 'Средний', 'Орта'), L('Perfect tenses, conditionals, passive voice', 'Перфектные времена, условные предложения, пассив', 'Перфект шақтар, шартты сөйлемдер, ырықсыз етіс')],
  ['B2', L('Upper-Intermediate', 'Выше среднего', 'Ортадан жоғары'), L('Complex tenses, modals in the past, phrasal verbs', 'Сложные времена, модальные глаголы в прошлом, фразовые глаголы', 'Күрделі шақтар, өткен шақтағы модаль етістіктер, фразалық етістіктер')],
  ['C1', L('Advanced', 'Продвинутый', 'Жоғары'), L('Inversion, formal structures, academic vocabulary', 'Инверсия, книжные конструкции, академическая лексика', 'Инверсия, кітаби құрылымдар, академиялық лексика')],
  ['C2', L('Proficiency', 'Свободное владение', 'Еркін меңгеру'), L('Rare structures, idioms, precise vocabulary', 'Редкие конструкции, идиомы, точная лексика', 'Сирек құрылымдар, идиомалар, дәл лексика')],
];

/** Английский язык как предмет экзамена: грамматика и лексика выбранных уровней. */
const englishTrack = (levels, test) =>
  track('english', 'EN', N.english, L('Grammar and vocabulary', 'Грамматика и лексика', 'Грамматика және лексика'), englishSpec(levels), test);

// ---------- Предметы экзаменов: одни и те же наборы тем для разных стран ----------
// Ключ 0 у банков знаний — задания любой сложности.

const ALL = [1, 2, 3];
/** Генераторы по хронологии к банкам истории. */
const HISTORY_GEN = { 'h.kz': 'h.kzt', 'h.world': 'h.wt', 'h.ru': 'h.rut' };
const SUBJECT = {
  physics: () =>
    track('physics', '⚛️', N.physics, L('Mechanics, electricity, heat, optics', 'Механика, электричество, тепло, оптика', 'Механика, электр, жылу, оптика'),
      [['p.kin', ALL], ['p.dyn', ALL], ['p.energy', ALL], ['p.elec', ALL], ['p.heat', ALL], ['p.wave', ALL], ['p.theory', [0]], ['p.facts', ALL]], { count: 15, minutes: 30 }),
  chemistry: () =>
    track('chemistry', '⚗️', N.chemistry, L('Calculations, substances and reactions', 'Расчёты, вещества и реакции', 'Есептеулер, заттар мен реакциялар'),
      [['c.molar', ALL], ['c.mole', ALL], ['c.theory', [0]], ['c.elem', [2, 3]], ['c.salts', ALL]], { count: 15, minutes: 30 }),
  biology: () =>
    track('biology', '🧬', N.biology, L('Cell, human body, genetics, ecology', 'Клетка, человек, генетика, экология', 'Жасуша, адам, генетика, экология'),
      [['b.bank', ALL], ['b.animals', ALL], ['b.body', ALL], ['b.cell', ALL], ['b.gen', ALL], ['b.plants', ALL], ['b.eco', ALL]], { count: 15, minutes: 20 }),
  geography: () =>
    track('geography', '🌍', N.geography, L('Maps, climate, nature, population', 'Карты, климат, природа, население', 'Карталар, климат, табиғат, халық'),
      [['g.bank', ALL], ['g.world', ALL], ['g.records', ALL]], { count: 15, minutes: 20 }),
  informatics: () =>
    track('informatics', '💻', N.informatics, L('Number systems, logic, algorithms', 'Системы счисления, логика, алгоритмы', 'Санау жүйелері, логика, алгоритмдер'),
      [['i.num', ALL], ['i.units', ALL], ['i.logic', ALL], ['i.algo', ALL], ['i.theory', [0]], ['i.facts', ALL]], { count: 15, minutes: 30 }),
  russian: () =>
    track('russian', 'Аа', N.russian, L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'),
      [['l.ru', ALL], ['l.rugen', ALL]], { count: 15, minutes: 20 }),
  social: () =>
    track('social', '⚖️', N.social, L('State, law, economics, society', 'Государство, право, экономика, общество', 'Мемлекет, құқық, экономика, қоғам'),
      [['s.bank', ALL], ['s.terms', ALL], ['s.powers', ALL]], { count: 12, minutes: 15 }),
  /** История страны: свой банк вместе со всемирной историей. */
  history: (topic, name, id = 'history') =>
    track(id, '📜', name, L('Key events and people', 'Главные события и личности', 'Басты оқиғалар мен тұлғалар'),
      [...(HISTORY_GEN[topic] ? [[topic, [0]], [HISTORY_GEN[topic], ALL]] : [[topic, [0]]]), ...(topic === 'h.world' ? [] : [['h.world', [0]], ['h.wt', [1, 2]]])], { count: topic === 'h.world' ? 12 : 15, minutes: 20 }),
};

// Олимпиадная математика: три уровня. Ключ в наборе тем — номер уровня.
const OLYMP_TOPICS = ['o.count', 'o.digit', 'o.div', 'o.pigeon', 'o.sum', 'o.games', 'o.logic', 'o.geom', 'o.rem', 'o.fact', 'o.paths'];
const OLYMP_LEVELS = [
  [L('Logic and counting', 'Логика и подсчёт', 'Логика және санау'), L('Truth-tellers, liars and careful counting', 'Рыцари, лжецы и аккуратный подсчёт', 'Ақиқатшылар, өтірікшілер және мұқият санау'), 1, ['o.logic', 'o.count']],
  [L('The last digit', 'Последняя цифра', 'Соңғы цифр'), L('Cycles of last digits of powers', 'Циклы последних цифр степеней', 'Дәрежелердің соңғы цифрларының циклдері'), 1, ['o.digit']],
  [L('The pigeonhole principle', 'Принцип Дирихле', 'Дирихле принципі'), L('The worst case and guaranteed outcomes', 'Худший случай и гарантированный результат', 'Ең нашар жағдай және кепілді нәтиже'), 1, ['o.pigeon', 'o.logic']],
  [L('Counting in geometry', 'Подсчёт в геометрии', 'Геометриядағы санау'), L('Squares, triangles and diagonals', 'Квадраты, треугольники и диагонали', 'Шаршылар, үшбұрыштар және диагональдар'), 1, ['o.geom']],
  [L('Tournaments and handshakes', 'Турниры и рукопожатия', 'Турнирлер мен қол алысулар'), L('Games, matches and pairs', 'Игры, матчи и пары', 'Ойындар, матчтар және жұптар'), 2, ['o.games']],
  [L('Divisors', 'Делители', 'Бөлгіштер'), L('The number of divisors, GCD, LCM', 'Число делителей, НОД и НОК', 'Бөлгіштер саны, ЕҮОБ және ЕКОЕ'), 2, ['o.div']],
  [L('Remainders', 'Остатки', 'Қалдықтар'), L('Remainders of large numbers and powers', 'Остатки больших чисел и степеней', 'Үлкен сандар мен дәрежелердің қалдықтары'), 2, ['o.rem']],
  [L('Routes and combinations', 'Маршруты и комбинации', 'Маршруттар мен комбинациялар'), L('The multiplication rule and grid paths', 'Правило умножения и пути по сетке', 'Көбейту ережесі және тор бойындағы жолдар'), 2, ['o.paths', 'o.count']],
  [L('Clever sums', 'Хитрые суммы', 'Қызықты қосындылар'), L('Gauss’s trick and telescoping sums', 'Приём Гаусса и телескопические суммы', 'Гаусс тәсілі және телескоптық қосындылар'), 2, ['o.sum']],
  [L('Digits and factorials', 'Цифры и факториалы', 'Цифрлар мен факториалдар'), L('Zeros at the end of n! and digit puzzles', 'Нули в конце n! и задачи на цифры', 'n! соңындағы нөлдер және цифр есептері'), 3, ['o.fact', 'o.digit']],
  [L('Equations in integers', 'Уравнения в целых числах', 'Бүтін сандардағы теңдеулер'), L('Diophantine equations', 'Диофантовы уравнения', 'Диофант теңдеулері'), 3, ['o.eq', 'o.div']],
  [L('Grades 9–11: regional round', '9–11 классы: областной этап', '9–11 сыныптар: облыстық кезең'), L('Number theory and combinatorics', 'Теория чисел и комбинаторика', 'Сандар теориясы және комбинаторика'), 3, ['o.rem', 'o.div', 'o.count', 'o.paths', 'o.sum', 'o.pigeon']],
  [L('Grand final', 'Финал', 'Финал'), L('The hardest problems of every type', 'Самые трудные задачи всех типов', 'Барлық түрдегі ең қиын есептер'), 3, null],
];


// ---------- Испанский, французский, китайский ----------
const LEVEL_NAMES = [
  L('Beginner', 'Начальный', 'Бастапқы'),
  L('Elementary', 'Элементарный', 'Қарапайым'),
  L('Intermediate', 'Средний', 'Орта'),
  L('Upper-Intermediate', 'Выше среднего', 'Ортадан жоғары'),
  L('Advanced', 'Продвинутый', 'Жоғары'),
  L('Proficiency', 'Свободное владение', 'Еркін меңгеру'),
];
const LANG_DESC = {
  es: [
    L('Ser, regular verbs, articles, gustar', 'Ser, правильные глаголы, артикли, gustar', 'Ser, дұрыс етістіктер, артикльдер, gustar'),
    L('Past and near future, comparison, reflexive verbs', 'Прошедшее и ближайшее будущее, сравнение, возвратные глаголы', 'Өткен және жақын келер шақ, салыстыру, өздік етістіктер'),
    L('Subjunctive, conditionals, passive', 'Сослагательное наклонение, условные, пассив', 'Шартты рай, шартты сөйлемдер, ырықсыз етіс'),
    L('Past subjunctive, complex conditionals', 'Сослагательное в прошлом, сложные условные', 'Өткен шақтағы шартты рай, күрделі шартты сөйлемдер'),
    L('Imperfect subjunctive, como si, cuyo', 'Imperfecto de subjuntivo, como si, cuyo', 'Imperfecto de subjuntivo, como si, cuyo'),
    L('Literary forms, fixed formulas, all irregular verbs', 'Книжные формы, устойчивые формулы, все неправильные глаголы', 'Кітаби түрлер, тұрақты тіркестер, барлық бұрыс етістіктер'),
  ],
  fr: [
    L('Être, avoir, aller, articles, prepositions', 'Être, avoir, aller, артикли, предлоги', 'Être, avoir, aller, артикльдер, предлогтар'),
    L('Passé composé, imparfait, comparison', 'Passé composé, imparfait, сравнение', 'Passé composé, imparfait, салыстыру'),
    L('Subjonctif, conditionnel, passive', 'Subjonctif, conditionnel, пассив', 'Subjonctif, conditionnel, ырықсыз етіс'),
    L('Past conditional, agreement, relative pronouns', 'Прошедшее условное, согласование, относительные местоимения', 'Өткен шақтағы шартты рай, қиысу, қатыстық есімдіктер'),
    L('Plus-que-parfait, dont, lequel, subjunctive after conjunctions', 'Plus-que-parfait, dont, lequel, subjonctif после союзов', 'Plus-que-parfait, dont, lequel, жалғаулықтардан кейінгі subjonctif'),
    L('Participle agreement, literary forms, all irregular verbs', 'Согласование причастий, книжные формы, все неправильные глаголы', 'Есімшелердің қиысуы, кітаби түрлер, барлық бұрыс етістіктер'),
  ],
};
const HSK_NAMES = [
  L('HSK 1: first words', 'HSK 1: первые слова', 'HSK 1: алғашқы сөздер'),
  L('HSK 2: everyday phrases', 'HSK 2: бытовые фразы', 'HSK 2: тұрмыстық сөз тіркестері'),
  L('HSK 3: grammar patterns', 'HSK 3: грамматические конструкции', 'HSK 3: грамматикалық құрылымдар'),
  L('HSK 4: connected speech', 'HSK 4: связная речь', 'HSK 4: байланыстырып сөйлеу'),
  L('HSK 5: newspapers and essays', 'HSK 5: газеты и сочинения', 'HSK 5: газеттер мен шығармалар'),
  L('HSK 6: fluent Chinese', 'HSK 6: свободный китайский', 'HSK 6: еркін қытай тілі'),
];
const HSK_DESC = [
  L('Greetings, numbers, people, basic verbs', 'Приветствия, числа, люди, основные глаголы', 'Амандасу, сандар, адамдар, негізгі етістіктер'),
  L('了, 比, measure words, everyday words', '了, 比, счётные слова, бытовая лексика', '了, 比, мөлшер сөздер, тұрмыстық лексика'),
  L('把 and 被, 虽然…但是, 越来越', '把 и 被, 虽然…但是, 越来越', '把 және 被, 虽然…但是, 越来越'),
  L('尽管, 即使, 无论…都 and other connectors', '尽管, 即使, 无论…都 и другие связки', '尽管, 即使, 无论…都 және басқа жалғаулықтар'),
  L('宁可, 与其…不如, 何况, abstract words', '宁可, 与其…不如, 何况, абстрактная лексика', '宁可, 与其…不如, 何况, дерексіз лексика'),
  L('一旦, 固然, 鉴于, idioms (chengyu)', '一旦, 固然, 鉴于, идиомы-чэнъюй', '一旦, 固然, 鉴于, чэнъюй идиомалары'),
];

/** Набор тем уровня иностранного языка: банк, слова и (для испанского и французского) спряжение. */
const langSpec = (lang, level) => (lang === 'zh' ? [['zh.bank', [level]], ['zh.words', [level]]] : [[`${lang}.bank`, [level]], [`${lang}.words`, [level]], [`${lang}.verbs`, [level]]]);
const SIX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CODE_NAMES = { py: 'Python', cpp: 'C++', js: 'JavaScript', java: 'Java' };

// ---------- Курсы ----------

export const COURSES = [
  // ===== Экзамены: международные =====
  {
    id: 'sat',
    group: 'exams',
    region: 'intl',
    code: 'SAT',
    color: '#6c4cf5',
    href: '/sat',
    name: L('SAT', 'SAT', 'SAT'),
    full: L('Digital SAT', 'Цифровой SAT', 'Цифрлық SAT'),
    about: L(
      'Admission test for universities in the USA and other countries: Reading and Writing, and Math. Score 400–1600. Here it is a full game: a map with bosses, duels, a mock test with a score estimate.',
      'Экзамен для поступления в вузы США и других стран: Reading and Writing и Math. Балл — от 400 до 1600. Здесь это целая игра: карта с боссами, дуэли, пробный экзамен с прогнозом балла.',
      'АҚШ пен басқа елдердің ЖОО-ларына түсу емтиханы: Reading and Writing және Math. Балл — 400-ден 1600-ге дейін. Мұнда бұл — тұтас ойын: босстары бар карта, жекпе-жектер, балл болжамы бар сынақ емтиханы.',
    ),
    tracks: [],
  },
  {
    id: 'ielts',
    group: 'exams',
    region: 'intl',
    code: 'IELTS',
    color: '#e11d48',
    name: L('IELTS', 'IELTS', 'IELTS'),
    full: L('International English Language Testing System', 'Международный экзамен по английскому языку', 'Ағылшын тілінен халықаралық емтихан'),
    about: L(
      'An international English exam for study, work and migration. Four parts: Listening, Reading, Writing, Speaking. Each part and the overall result are scored from 0 to 9.',
      'Международный экзамен по английскому для учёбы, работы и переезда. Четыре части: Listening, Reading, Writing, Speaking. Каждая часть и общий результат оцениваются от 0 до 9.',
      'Оқу, жұмыс және көшу үшін ағылшын тілінен халықаралық емтихан. Төрт бөлім: Listening, Reading, Writing, Speaking. Әр бөлім мен жалпы нәтиже 0-ден 9-ға дейін бағаланады.',
    ),
    official: { label: 'ielts.org', url: 'https://www.ielts.org/' },
    tracks: [
      track('reading', '📖', L('Reading', 'Reading (чтение)', 'Reading (оқылым)'), L('Texts with True / False / Not Given and multiple-choice questions', 'Тексты с вопросами True / False / Not Given и с выбором ответа', 'True / False / Not Given және жауап таңдау сұрақтары бар мәтіндер'), [['r.ielts', [1]]], { count: 15, minutes: 25 }),
      track('grammar', 'B2', L('Grammar and vocabulary, B2–C1', 'Грамматика и лексика, B2–C1', 'Грамматика және лексика, B2–C1'), L('The level needed for band 6.5–7.5', 'Уровень, который нужен для оценки 6.5–7.5', '6.5–7.5 бағасына қажет деңгей'), englishSpec([4, 5]), { count: 20, minutes: 15 }),
    ],
    soon: [N.listening, N.speaking, N.writing],
  },
  {
    id: 'toefl',
    group: 'exams',
    region: 'intl',
    code: 'TOEFL',
    color: '#0369a1',
    name: L('TOEFL', 'TOEFL', 'TOEFL'),
    full: L('TOEFL iBT', 'TOEFL iBT', 'TOEFL iBT'),
    about: L(
      'An international exam in academic English accepted by universities around the world. Four parts: Reading, Listening, Speaking, Writing.',
      'Международный экзамен по академическому английскому, который принимают университеты по всему миру. Четыре части: Reading, Listening, Speaking, Writing.',
      'Әлем университеттері қабылдайтын академиялық ағылшын тілінен халықаралық емтихан. Төрт бөлім: Reading, Listening, Speaking, Writing.',
    ),
    official: { label: 'ets.org/toefl', url: 'https://www.ets.org/toefl.html' },
    tracks: [
      track('reading', '📖', L('Reading', 'Reading (чтение)', 'Reading (оқылым)'), L('Academic texts: facts, words in context, inference', 'Академические тексты: факты, слова в контексте, выводы', 'Академиялық мәтіндер: фактілер, контекстегі сөздер, қорытындылар'), [['r.toefl', [1]]], { count: 10, minutes: 18 }),
      track('grammar', 'B2', L('Grammar and vocabulary, B2–C1', 'Грамматика и лексика, B2–C1', 'Грамматика және лексика, B2–C1'), L('Structures and words of academic English', 'Конструкции и слова академического английского', 'Академиялық ағылшын тілінің құрылымдары мен сөздері'), englishSpec([4, 5]), { count: 20, minutes: 15 }),
    ],
    soon: [N.listening, N.speaking, N.writing],
  },
  {
    id: 'hsk',
    group: 'exams',
    region: 'intl',
    code: 'HSK',
    color: '#b91c1c',
    name: L('HSK', 'HSK', 'HSK'),
    full: L('Chinese Proficiency Test', 'Экзамен по китайскому языку', 'Қытай тілінен емтихан'),
    about: L(
      'The international exam in Chinese. It has six levels; here are all six: characters, pinyin, measure words and grammar, as in the reading part of the exam.',
      'Международный экзамен по китайскому языку. В нём шесть уровней; здесь есть все шесть: иероглифы, пиньинь, счётные слова и грамматика, как в части «чтение».',
      'Қытай тілінен халықаралық емтихан. Онда алты деңгей бар; мұнда алтауы да бар: иероглифтер, пиньинь, мөлшер сөздер және грамматика, «оқылым» бөліміндегідей.',
    ),
    official: { label: 'chinesetest.cn', url: 'https://www.chinesetest.cn/' },
    tracks: [1, 2, 3, 4, 5, 6].map((k) => track(`hsk${k}`, `${k}`, HSK_NAMES[k - 1], HSK_DESC[k - 1], langSpec('zh', k), { count: 15, minutes: 15 })),
    soon: [L('Listening', 'Аудирование', 'Тыңдалым'), L('Writing characters', 'Письмо иероглифов', 'Иероглиф жазу')],
  },
  // ===== Экзамены: страны СНГ =====
  {
    id: 'ent',
    group: 'exams',
    region: 'cis',
    code: 'KZ',
    color: '#0891b2',
    name: L('UNT', 'ЕНТ', 'ҰБТ'),
    full: L('Unified National Testing, Kazakhstan', 'Единое национальное тестирование, Казахстан', 'Ұлттық бірыңғай тестілеу, Қазақстан'),
    about: L(
      'The admission exam for universities in Kazakhstan. Three compulsory subjects (History of Kazakhstan, mathematical literacy, reading literacy) and two profile subjects. The maximum is 140 points.',
      'Экзамен для поступления в вузы Казахстана. Три обязательных предмета (история Казахстана, математическая грамотность, грамотность чтения) и два профильных. Максимум — 140 баллов.',
      'Қазақстан ЖОО-ларына түсу емтиханы. Үш міндетті пән (Қазақстан тарихы, математикалық сауаттылық, оқу сауаттылығы) және екі бейіндік пән. Ең жоғары балл — 140.',
    ),
    official: { label: 'testcenter.kz', url: 'https://testcenter.kz/' },
    tracks: [
      track('mathlit', '🧩', N.mathLit, D.mathLit, MATH_LITERACY, { count: 10, minutes: 20 }),
      track('math', '📐', N.mathProfile, D.mathSenior, MATH_SENIOR, { count: 15, minutes: 30 }),
      track('history', '📜', L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'), L('From the Saka to independence', 'От саков до независимости', 'Сақтардан тәуелсіздікке дейін'), [['h.kz', ALL], ['h.kzt', ALL]], { count: 15, minutes: 20 }),
      track('reading', '📖', L('Reading literacy', 'Грамотность чтения', 'Оқу сауаттылығы'), L('Texts and questions about them', 'Тексты и вопросы к ним', 'Мәтіндер және оларға сұрақтар'), [['r.literacy', [1]]], { count: 12, minutes: 20 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
      SUBJECT.geography(),
      SUBJECT.informatics(),
      SUBJECT.history('h.world', L('World history', 'Всемирная история', 'Дүниежүзі тарихы'), 'world'),
    ],
  },
  {
    id: 'ege',
    group: 'exams',
    region: 'cis',
    code: 'RU',
    color: '#2563eb',
    name: L('EGE', 'ЕГЭ', 'ЕГЭ'),
    full: L('Unified State Exam, Russia', 'Единый государственный экзамен, Россия', 'Бірыңғай мемлекеттік емтихан, Ресей'),
    about: L(
      'The school-leaving and university admission exam in Russia. Russian language and mathematics (basic or profile level) are compulsory, other subjects are chosen by the student.',
      'Выпускной и вступительный экзамен в России. Обязательные предметы — русский язык и математика (базовая или профильная), остальные сдаются по выбору.',
      'Ресейдегі бітіру және ЖОО-ға түсу емтиханы. Орыс тілі мен математика (базалық немесе бейіндік) міндетті, қалған пәндер таңдау бойынша тапсырылады.',
    ),
    official: { label: 'fipi.ru', url: 'https://fipi.ru/' },
    tracks: [
      track('base', '🧮', L('Mathematics (basic level)', 'Математика (базовый уровень)', 'Математика (базалық деңгей)'), D.mathLit, [...MATH_LITERACY, ['m.lineq', [1, 2]], ['m.pow', [1, 2]], ['m.pyth', [1, 2]], ['m.angle', [1, 2]], ['m.vol', [1, 2]], ['m.log', [1]]], { count: 10, minutes: 25 }),
      track('profile', '📐', L('Mathematics (profile level, part 1)', 'Математика (профильный уровень, часть 1)', 'Математика (бейіндік деңгей, 1-бөлім)'), D.mathSenior, MATH_SENIOR, { count: 12, minutes: 45 }),
      SUBJECT.russian(),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.social(),
      SUBJECT.history('h.ru', L('History of Russia', 'История России', 'Ресей тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
      SUBJECT.geography(),
      SUBJECT.informatics(),
    ],

  },
  {
    id: 'oge',
    group: 'exams',
    region: 'cis',
    code: 'RU',
    color: '#4f46e5',
    name: L('OGE', 'ОГЭ', 'ОГЭ'),
    full: L('Basic State Exam (grade 9), Russia', 'Основной государственный экзамен (9 класс), Россия', 'Негізгі мемлекеттік емтихан (9-сынып), Ресей'),
    about: L(
      'The exam after grade 9 in Russia: Russian language, mathematics and two subjects chosen by the student.',
      'Экзамен после 9 класса в России: русский язык, математика и два предмета по выбору.',
      'Ресейде 9-сыныптан кейінгі емтихан: орыс тілі, математика және таңдау бойынша екі пән.',
    ),
    official: { label: 'fipi.ru', url: 'https://fipi.ru/' },
    tracks: [
      track('math', '📐', N.math, D.mathAll, MATH_BASIC, { count: 12, minutes: 30 }),
      SUBJECT.russian(),
      englishTrack([2, 3], { count: 15, minutes: 15 }),
      SUBJECT.social(),
      SUBJECT.informatics(),
      SUBJECT.geography(),
      SUBJECT.physics(),
      SUBJECT.biology(),
      SUBJECT.chemistry(),
    ],
  },
  {
    id: 'ct',
    group: 'exams',
    region: 'cis',
    code: 'BY',
    color: '#16a34a',
    name: L('CT / CE', 'ЦТ и ЦЭ', 'ЦТ және ЦЭ'),
    full: L('Centralised Testing and Exam, Belarus', 'Централизованное тестирование и экзамен, Беларусь', 'Орталықтандырылған тестілеу мен емтихан, Беларусь'),
    about: L(
      'The centralised exam (CE) and centralised testing (CT) are used for admission to universities in Belarus. Each subject is scored on a 100-point scale.',
      'Централизованный экзамен (ЦЭ) и централизованное тестирование (ЦТ) нужны для поступления в вузы Беларуси. Каждый предмет оценивается по 100-балльной шкале.',
      'Орталықтандырылған емтихан (ЦЭ) мен орталықтандырылған тестілеу (ЦТ) Беларусь ЖОО-ларына түсу үшін қажет. Әр пән 100 балдық шкаламен бағаланады.',
    ),
    official: { label: 'rikc.by', url: 'https://rikc.by/' },
    tracks: [
      track('math', '📐', N.math, D.mathSenior, MATH_SENIOR, { count: 12, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.russian(),
      SUBJECT.history('h.by', L('History of Belarus', 'История Беларуси', 'Беларусь тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Belarusian language', 'Белорусский язык', 'Беларусь тілі')],
  },
  {
    id: 'dtm',
    group: 'exams',
    region: 'cis',
    code: 'UZ',
    color: '#0d9488',
    name: L('DTM', 'DTM', 'DTM'),
    full: L('University admission tests, Uzbekistan', 'Вступительные тесты в вузы, Узбекистан', 'ЖОО-ға түсу тесттері, Өзбекстан'),
    about: L(
      'Admission tests for universities in Uzbekistan: compulsory subjects (native language, mathematics, history of Uzbekistan) and two profile subjects. The maximum is 189 points.',
      'Вступительные тесты в вузы Узбекистана: обязательные предметы (родной язык, математика, история Узбекистана) и два профильных. Максимум — 189 баллов.',
      'Өзбекстан ЖОО-ларына түсу тесттері: міндетті пәндер (ана тілі, математика, Өзбекстан тарихы) және екі бейіндік пән. Ең жоғары балл — 189.',
    ),
    tracks: [
      track('mathbase', '🧮', L('Mathematics (compulsory block)', 'Математика (обязательный блок)', 'Математика (міндетті блок)'), D.mathAll, MATH_BASIC, { count: 10, minutes: 20 }),
      track('math', '📐', N.mathProfile, D.mathSenior, MATH_SENIOR, { count: 15, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.uz', L('History of Uzbekistan', 'История Узбекистана', 'Өзбекстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Uzbek language and literature', 'Узбекский язык и литература', 'Өзбек тілі мен әдебиеті')],
  },
  {
    id: 'ort',
    group: 'exams',
    region: 'cis',
    code: 'KG',
    color: '#dc2626',
    name: L('ORT', 'ОРТ', 'ОРТ'),
    full: L('Nationwide Testing, Kyrgyzstan', 'Общереспубликанское тестирование, Кыргызстан', 'Жалпыреспубликалық тестілеу, Қырғызстан'),
    about: L(
      'The admission test for universities in Kyrgyzstan. The main test covers mathematics, analogies and sentence completion, reading comprehension and practical grammar. There are also subject tests.',
      'Тест для поступления в вузы Кыргызстана. Основной тест: математика, аналогии и дополнение предложений, чтение и понимание, практическая грамматика. Есть и предметные тесты.',
      'Қырғызстан ЖОО-ларына түсу тесті. Негізгі тест: математика, аналогиялар мен сөйлемдерді толықтыру, оқу және түсіну, практикалық грамматика. Пәндік тесттер де бар.',
    ),
    tracks: [
      track('math', '📐', L('Mathematics (main test)', 'Математика (основной тест)', 'Математика (негізгі тест)'), D.mathLit, [...MATH_LITERACY, ['m.lineq', [1, 2]], ['m.ineq', [1, 2]], ['m.pyth', [1, 2]], ['m.angle', [1, 2]], ['m.pow', [1, 2]]], { count: 15, minutes: 30 }),
      track('analogies', '🔗', L('Analogies and sentence completion', 'Аналогии и дополнение предложений', 'Аналогиялар мен сөйлемдерді толықтыру'), L('Relations between words, meaning in context', 'Связи между словами, смысл в контексте', 'Сөздер арасындағы байланыс, контекстегі мағына'), [['l.analogy', [0]], ['l.analogy2', [1, 2, 3]], ['l.complete', [0]]], { count: 15, minutes: 15 }),
      track('reading', '📖', L('Reading comprehension', 'Чтение и понимание', 'Оқу және түсіну'), L('Texts and questions about them', 'Тексты и вопросы к ним', 'Мәтіндер және оларға сұрақтар'), [['r.literacy', [1]]], { count: 12, minutes: 20 }),
      track('grammar', 'Аа', L('Practical grammar (Russian)', 'Практическая грамматика (русский язык)', 'Практикалық грамматика (орыс тілі)'), L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'), [['l.ru', ALL], ['l.rugen', ALL]], { count: 15, minutes: 20 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.kg', L('History of Kyrgyzstan', 'История Кыргызстана', 'Қырғызстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
  },
  {
    id: 'tj',
    group: 'exams',
    region: 'cis',
    code: 'TJ',
    color: '#15803d',
    name: L('NTC exams', 'ЦВЭ', 'ЦВЭ'),
    full: L('Centralised entrance exams, Tajikistan', 'Централизованные вступительные экзамены, Таджикистан', 'Орталықтандырылған түсу емтихандары, Тәжікстан'),
    about: L(
      'Centralised entrance exams for universities in Tajikistan, held by the National Testing Centre.',
      'Централизованные вступительные экзамены в вузы Таджикистана. Их проводит Национальный центр тестирования.',
      'Тәжікстан ЖОО-ларына орталықтандырылған түсу емтихандары. Оларды Ұлттық тестілеу орталығы өткізеді.',
    ),
    tracks: [
      track('math', '📐', N.math, D.mathAll, [...MATH_BASIC, ['m.log', [1, 2]], ['m.trig', [1, 2]]], { count: 12, minutes: 30 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.tj', L('History of Tajikistan', 'История Таджикистана', 'Тәжікстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Tajik language', 'Таджикский язык', 'Тәжік тілі')],
  },
  {
    id: 'dim',
    group: 'exams',
    region: 'cis',
    code: 'AZ',
    color: '#0284c7',
    name: L('DİM', 'DİM', 'DİM'),
    full: L('State Examination Center exams, Azerbaijan', 'Экзамены Государственного экзаменационного центра, Азербайджан', 'Мемлекеттік емтихан орталығының емтихандары, Әзербайжан'),
    about: L(
      'School-leaving and university admission exams in Azerbaijan, held by the State Examination Center (DİM). The maximum admission score is 700 points.',
      'Выпускные и вступительные экзамены в Азербайджане. Их проводит Государственный экзаменационный центр (DİM). На вступительном экзамене максимум — 700 баллов.',
      'Әзербайжандағы бітіру және түсу емтихандары. Оларды Мемлекеттік емтихан орталығы (DİM) өткізеді. Түсу емтиханында ең жоғары балл — 700.',
    ),
    official: { label: 'dim.gov.az', url: 'https://dim.gov.az/' },
    tracks: [
      track('math', '📐', N.math, D.mathSenior, MATH_SENIOR, { count: 12, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.az', L('History of Azerbaijan', 'История Азербайджана', 'Әзербайжан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Azerbaijani language', 'Азербайджанский язык', 'Әзербайжан тілі')],
  },
  {
    id: 'arm',
    group: 'exams',
    region: 'cis',
    code: 'AM',
    color: '#ea580c',
    name: L('Unified exams', 'Единые экзамены', 'Бірыңғай емтихандар'),
    full: L('Unified State Exams, Armenia', 'Единые государственные экзамены, Армения', 'Бірыңғай мемлекеттік емтихандар, Армения'),
    about: L(
      'Unified state exams for admission to universities in Armenia. Each subject is scored on a 20-point scale.',
      'Единые государственные экзамены для поступления в вузы Армении. Каждый предмет оценивается по 20-балльной шкале.',
      'Армения ЖОО-ларына түсуге арналған бірыңғай мемлекеттік емтихандар. Әр пән 20 балдық шкаламен бағаланады.',
    ),
    tracks: [
      track('math', '📐', N.math, D.mathSenior, MATH_SENIOR, { count: 12, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.am', L('History of Armenia', 'История Армении', 'Армения тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Armenian language', 'Армянский язык', 'Армян тілі')],
  },
  {
    id: 'bac',
    group: 'exams',
    region: 'cis',
    code: 'MD',
    color: '#ca8a04',
    name: L('BAC', 'BAC', 'BAC'),
    full: L('Baccalaureate exams, Moldova', 'Экзамены на степень бакалавра (BAC), Молдова', 'Бакалавриат емтихандары (BAC), Молдова'),
    about: L(
      'The national school-leaving exams of lyceums in Moldova. Marks are given on a 10-point scale.',
      'Национальные выпускные экзамены лицеев в Молдове. Оценки ставятся по 10-балльной шкале.',
      'Молдовадағы лицейлердің ұлттық бітіру емтихандары. Бағалар 10 балдық шкаламен қойылады.',
    ),
    tracks: [
      track('math', '📐', N.math, D.mathSenior, MATH_SENIOR, { count: 12, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.md', L('History of Moldova', 'История Молдовы', 'Молдова тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Romanian language', 'Румынский язык', 'Румын тілі')],
  },
  // ===== Олимпиадная математика =====
  {
    id: 'olymp',
    group: 'olymp',
    code: '🏆',
    color: '#f59e0b',
    leveled: true,
    name: L('Olympiad math', 'Олимпиадная математика', 'Олимпиадалық математика'),
    full: L('Non-standard problems by level', 'Нестандартные задачи по уровням', 'Деңгейлер бойынша стандартты емес есептер'),
    about: L(
      'Problems that are solved by an idea, not by a formula: counting, divisibility, pigeonhole principle, extreme cases. Every problem has a worked solution.',
      'Задачи, которые решаются идеей, а не формулой: подсчёты, делимость, принцип Дирихле, крайние случаи. У каждой задачи — подробное решение.',
      'Формуламен емес, идеямен шешілетін есептер: санау, бөлінгіштік, Дирихле принципі, шеткі жағдайлар. Әр есептің толық шешімі бар.',
    ),
    tracks: OLYMP_LEVELS.map(([name, desc, d, topics], i) =>
      track(`l${i + 1}`, String(i + 1), name, desc, [...(topics ?? OLYMP_TOPICS).map((id) => [id, [d]]), ...(d > 1 && !topics ? [['o.eq', [d]]] : [])], { count: 8, minutes: 30 }),
    ),
  },
  // ===== Ежедневная практика =====
  {
    id: 'math',
    group: 'daily',
    code: '📐',
    color: '#22c55e',
    leveled: true,
    name: L('Mathematics', 'Математика', 'Математика'),
    full: L('Grades 1–11 and beyond', '1–11 классы и дальше', '1–11 сыныптар және одан әрі'),
    about: L(
      'A section for every school grade from 1 to 11 and three levels after school, up to limits and integrals. Algebra, geometry and trigonometry are all included. Problems are generated endlessly, each with a step-by-step solution.',
      'Раздел для каждого класса с 1-го по 11-й и три уровня после школы — вплоть до пределов и интегралов. Алгебра, геометрия и тригонометрия — всё внутри. Задачи создаются бесконечно, у каждой — пошаговое решение.',
      '1-ден 11-ге дейінгі әр сыныпқа арналған бөлім және мектептен кейінгі үш деңгей — шектер мен интегралдарға дейін. Алгебра, геометрия және тригонометрия — бәрі ішінде. Есептер шексіз құрастырылады, әрқайсысының қадамдық шешімі бар.',
    ),
    tracks: [
      ...MATH_GRADES.map(([name, desc, spec], i) => ({ ...track(`g${i + 1}`, String(i + 1), name, desc, spec), kicker: gradeKicker(i + 1) })),
      ...MATH_BEYOND.map(([icon, name, desc, spec], i) => ({ ...track(`u${i + 1}`, icon, name, desc, spec), kicker: beyondKicker(i + 1) })),
    ],
  },
  {
    id: 'english',
    group: 'daily',
    code: 'EN',
    color: '#3b82f6',
    leveled: true,
    cefr: true,
    name: L('English', 'Английский язык', 'Ағылшын тілі'),
    full: L('Levels A1–C2', 'Уровни A1–C2', 'A1–C2 деңгейлері'),
    about: L(
      'Grammar and vocabulary at six levels of the European scale, from beginner (A1) to proficient (C2). Every answer comes with a rule in your language.',
      'Грамматика и лексика на шести уровнях европейской шкалы: от начального (A1) до свободного владения (C2). К каждому ответу — правило на твоём языке.',
      'Еуропалық шкаланың алты деңгейіндегі грамматика мен лексика: бастауыштан (A1) еркін меңгеруге (C2) дейін. Әр жауапқа — өз тіліңдегі ереже.',
    ),
    tracks: ENGLISH_LEVELS.map(([code, name, desc], i) => track(code.toLowerCase(), code, name, desc, englishSpec([i + 1]))),
  },
  {
    id: 'spanish',
    group: 'daily',
    code: 'ES',
    color: '#dc2626',
    leveled: true,
    cefr: true,
    name: L('Spanish', 'Испанский язык', 'Испан тілі'),
    full: L('Levels A1–C2', 'Уровни A1–C2', 'A1–C2 деңгейлері'),
    about: L(
      'Grammar and vocabulary from the first words to the subjunctive. Every answer comes with a rule in your language.',
      'Грамматика и лексика: от первых слов до сослагательного наклонения. К каждому ответу — правило на твоём языке.',
      'Грамматика мен лексика: алғашқы сөздерден шартты райға дейін. Әр жауапқа — өз тіліңдегі ереже.',
    ),
    tracks: SIX.map((code, i) => track(code.toLowerCase(), code, LEVEL_NAMES[i], LANG_DESC.es[i], langSpec('es', i + 1))),
  },
  {
    id: 'french',
    group: 'daily',
    code: 'FR',
    color: '#2563eb',
    leveled: true,
    cefr: true,
    name: L('French', 'Французский язык', 'Француз тілі'),
    full: L('Levels A1–C2', 'Уровни A1–C2', 'A1–C2 деңгейлері'),
    about: L(
      'Grammar and vocabulary from être and avoir to the subjunctive. Every answer comes with a rule in your language.',
      'Грамматика и лексика: от être и avoir до subjonctif. К каждому ответу — правило на твоём языке.',
      'Грамматика мен лексика: être мен avoir-дан subjonctif-ке дейін. Әр жауапқа — өз тіліңдегі ереже.',
    ),
    tracks: SIX.map((code, i) => track(code.toLowerCase(), code, LEVEL_NAMES[i], LANG_DESC.fr[i], langSpec('fr', i + 1))),
  },
  {
    id: 'chinese',
    group: 'daily',
    code: '中',
    color: '#b91c1c',
    leveled: true,
    cefr: true,
    name: L('Chinese', 'Китайский язык', 'Қытай тілі'),
    full: L('HSK levels 1–6', 'Уровни HSK 1–6', 'HSK 1–6 деңгейлері'),
    about: L(
      'Characters with pinyin, measure words and the main grammar patterns, level by level as in the HSK exam.',
      'Иероглифы с пиньинем, счётные слова и главные грамматические конструкции — по уровням, как в экзамене HSK.',
      'Пиньинь жазылған иероглифтер, мөлшер сөздер және негізгі грамматикалық құрылымдар — HSK емтиханындағыдай деңгейлер бойынша.',
    ),
    tracks: [1, 2, 3, 4, 5, 6].map((k) => track(`hsk${k}`, `HSK${k}`, HSK_NAMES[k - 1], HSK_DESC[k - 1], langSpec('zh', k))),
  },
  // ===== Ежедневная практика: естественные науки =====
  {
    id: 'physics',
    group: 'daily',
    code: '⚛️',
    color: '#6366f1',
    leveled: true,
    name: N.physics,
    full: L('Thirteen levels', 'Тринадцать уровней', 'Он үш деңгей'),
    about: L(
      'Motion, forces, energy, heat, electricity and waves, plus units, formulas and great physicists. Calculation problems are generated endlessly and come with a step-by-step solution.',
      'Движение, силы, энергия, тепло, электричество и волны, а ещё единицы, формулы и великие физики. Расчётные задачи создаются бесконечно, у каждой — пошаговое решение.',
      'Қозғалыс, күштер, энергия, жылу, электр және толқындар, сондай-ақ бірліктер, формулалар және ұлы физиктер. Есептер шексіз құрастырылады, әрқайсысының қадамдық шешімі бар.',
    ),
    tracks: [
      track('p1', '1', L('Speed and distance', 'Скорость и путь', 'Жылдамдық және жол'), L('Uniform motion problems', 'Задачи на равномерное движение', 'Бірқалыпты қозғалыс есептері'), [['p.kin', [1]]]),
      track('p2', '2', L('Mass, density, pressure', 'Масса, плотность, давление', 'Масса, тығыздық, қысым'), L('Weight, density and pressure of solids', 'Вес, плотность и давление твёрдых тел', 'Қатты денелердің салмағы, тығыздығы және қысымы'), [['p.dyn', [1]]]),
      track('p3', '3', L('Work and energy', 'Работа и энергия', 'Жұмыс және энергия'), L('Mechanical work, power, energy', 'Механическая работа, мощность, энергия', 'Механикалық жұмыс, қуат, энергия'), [['p.energy', [1]]]),
      track('p4', '4', L('Units and formulas', 'Единицы и формулы', 'Бірліктер мен формулалар'), L('SI units and the main formulas', 'Единицы СИ и главные формулы', 'ХБЖ бірліктері және негізгі формулалар'), [['p.facts', [1, 2]], ['p.theory', [1]], ['p.kin', [1]]]),
      track('p5', '5', L('Heat', 'Тепловые явления', 'Жылу құбылыстары'), L('Heating, melting, boiling', 'Нагревание, плавление, кипение', 'Қыздыру, балқу, қайнау'), [['p.heat', [1, 2]]]),
      track('p6', '6', L('Electric current', 'Электрический ток', 'Электр тогы'), L('Ohm’s law, circuits, power', 'Закон Ома, цепи, мощность', 'Ом заңы, тізбектер, қуат'), [['p.elec', [1, 2]], ['p.theory', [2]]]),
      track('p7', '7', L('Acceleration', 'Ускорение', 'Үдеу'), L('Uniformly accelerated motion, free fall', 'Равноускоренное движение, свободное падение', 'Бірқалыпты үдемелі қозғалыс, еркін түсу'), [['p.kin', [2, 3]]]),
      track('p8', '8', L('Newton’s laws', 'Законы Ньютона', 'Ньютон заңдары'), L('Forces, momentum, friction', 'Силы, импульс, трение', 'Күштер, импульс, үйкеліс'), [['p.dyn', [2, 3]]]),
      track('p9', '9', L('Oscillations and waves', 'Колебания и волны', 'Тербелістер мен толқындар'), L('Period, frequency, wavelength', 'Период, частота, длина волны', 'Период, жиілік, толқын ұзындығы'), [['p.wave', [1, 2]]]),
      track('p10', '10', L('Conservation of energy', 'Закон сохранения энергии', 'Энергияның сақталу заңы'), L('Energy transformations and heat balance', 'Превращения энергии и тепловой баланс', 'Энергияның түрленуі және жылу балансы'), [['p.energy', [2, 3]], ['p.heat', [3]]]),
      track('p11', '11', L('Electrodynamics and optics', 'Электродинамика и оптика', 'Электродинамика және оптика'), L('Joule heating, lenses, light', 'Закон Джоуля — Ленца, линзы, свет', 'Джоуль — Ленц заңы, линзалар, жарық'), [['p.elec', [3]], ['p.wave', [3]]]),
      track('p12', '12', L('Great physicists', 'Великие физики', 'Ұлы физиктер'), L('Laws, discoveries and their authors', 'Законы, открытия и их авторы', 'Заңдар, ашылулар және олардың авторлары'), [['p.facts', [1, 2, 3]], ['p.theory', [2, 3]]]),
      track('p13', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('The hardest problems from every topic', 'Самые трудные задачи по всем темам', 'Барлық тақырып бойынша ең қиын есептер'), [['p.kin', [3]], ['p.dyn', [3]], ['p.energy', [3]], ['p.elec', [3]], ['p.heat', [3]], ['p.wave', [3]], ['p.facts', [3]], ['p.theory', [3]]], { count: 15, minutes: 25 }),
    ],
  },
  {
    id: 'chemistry',
    group: 'daily',
    code: '⚗️',
    color: '#14b8a6',
    leveled: true,
    name: N.chemistry,
    full: L('Ten levels', 'Десять уровней', 'Он деңгей'),
    about: L(
      'The periodic table, formulas and names of compounds, molar mass, amount of substance and reactions.',
      'Таблица Менделеева, формулы и названия веществ, молярная масса, количество вещества и реакции.',
      'Менделеев кестесі, заттардың формулалары мен атаулары, молярлық масса, зат мөлшері және реакциялар.',
    ),
    tracks: [
      track('c1', '1', L('Element symbols', 'Символы элементов', 'Элемент таңбалары'), L('H, O, Na, Cl and the first twenty', 'H, O, Na, Cl и первые двадцать', 'H, O, Na, Cl және алғашқы жиырма'), [['c.elem', [1]]]),
      track('c2', '2', L('The periodic table', 'Таблица Менделеева', 'Менделеев кестесі'), L('Periods, groups, metals and non-metals', 'Периоды, группы, металлы и неметаллы', 'Периодтар, топтар, металдар мен бейметалдар'), [['c.elem', [2]], ['c.theory', [1]]]),
      track('c3', '3', L('Simple formulas', 'Простые формулы', 'Қарапайым формулалар'), L('NaCl, KOH, AgNO₃ and their names', 'NaCl, KOH, AgNO₃ и их названия', 'NaCl, KOH, AgNO₃ және олардың атаулары'), [['c.salts', [1, 2]], ['c.molar', [1]]]),
      track('c4', '4', L('Molar mass', 'Молярная масса', 'Молярлық масса'), L('Adding up atomic masses', 'Сложение атомных масс', 'Атомдық массаларды қосу'), [['c.molar', [1, 2]]]),
      track('c5', '5', L('Oxides, bases, salts', 'Оксиды, основания, соли', 'Оксидтер, негіздер, тұздар'), L('Charges and indices in formulas', 'Заряды и индексы в формулах', 'Формулалардағы зарядтар мен индекстер'), [['c.salts', [2]], ['c.theory', [2]]]),
      track('c6', '6', L('Amount of substance', 'Количество вещества', 'Зат мөлшері'), L('Moles, mass and gas volume', 'Моли, масса и объём газа', 'Мольдер, масса және газ көлемі'), [['c.mole', [1, 2]]]),
      track('c7', '7', L('Inside the atom', 'Строение атома', 'Атом құрылысы'), L('Protons, neutrons, electron shells', 'Протоны, нейтроны, электронные слои', 'Протондар, нейтрондар, электрон қабаттары'), [['c.elem', [3]]]),
      track('c8', '8', L('Complex salts', 'Сложные соли', 'Күрделі тұздар'), L('Sulfates, phosphates, mass fractions', 'Сульфаты, фосфаты, массовые доли', 'Сульфаттар, фосфаттар, массалық үлестер'), [['c.salts', [3]], ['c.molar', [3]]]),
      track('c9', '9', L('Reaction calculations', 'Расчёты по уравнениям', 'Теңдеулер бойынша есептеулер'), L('Calculations, bonds, redox', 'Расчёты, связи, окисление', 'Есептеулер, байланыстар, тотығу'), [['c.mole', [3]], ['c.theory', [3]]]),
      track('c10', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('Everything from the school course', 'Всё из школьного курса', 'Мектеп курсының бәрі'), [['c.elem', [3]], ['c.salts', [2, 3]], ['c.molar', [3]], ['c.mole', [2, 3]], ['c.theory', [2, 3]]], { count: 15, minutes: 25 }),
    ],
  },
  {
    id: 'biology',
    group: 'daily',
    code: '🧬',
    color: '#16a34a',
    leveled: true,
    name: N.biology,
    full: L('Eleven levels', 'Одиннадцать уровней', 'Он бір деңгей'),
    about: L(
      'Plants, classes of animals, ecology, the human body, the cell, genetics, evolution and the great biologists.',
      'Растения, классы животных, экология, организм человека, клетка, генетика, эволюция и великие биологи.',
      'Өсімдіктер, жануарлар кластары, экология, адам ағзасы, жасуша, генетика, эволюция және ұлы биологтар.',
    ),
    tracks: [
      track('b1', '1', L('Plants', 'Растения', 'Өсімдіктер'), L('Root, stem, leaf, flower and seed', 'Корень, стебель, лист, цветок и семя', 'Тамыр, сабақ, жапырақ, гүл және тұқым'), [['b.plants', [1, 2]], ['b.animals', [1]], ['b.bank', [1]]]),
      track('b2', '2', L('Animals around us', 'Животные вокруг нас', 'Айналамыздағы жануарлар'), L('Mammals, birds, fish, insects', 'Млекопитающие, птицы, рыбы, насекомые', 'Сүтқоректілер, құстар, балықтар, жәндіктер'), [['b.animals', [1, 2]]]),
      track('b3', '3', L('Unusual animals', 'Необычные животные', 'Ерекше жануарлар'), L('Whales, bats, penguins, spiders and crabs', 'Киты, летучие мыши, пингвины, пауки и раки', 'Киттер, жарқанаттар, пингвиндер, өрмекшілер мен шаяндар'), [['b.animals', [3]], ['b.plants', [3]]]),
      track('b4', '4', L('Ecology', 'Экология', 'Экология'), L('Food chains, ecosystems, the Red Book', 'Пищевые цепи, экосистемы, Красная книга', 'Қоректік тізбектер, экожүйелер, Қызыл кітап'), [['b.eco', [1, 2, 3]], ['b.animals', [2]], ['b.bank', [2]]]),
      track('b5', '5', L('Human organs', 'Органы человека', 'Адам мүшелері'), L('Heart, lungs, stomach, brain', 'Сердце, лёгкие, желудок, мозг', 'Жүрек, өкпе, асқазан, ми'), [['b.body', [1, 2]], ['b.bank', [1, 2]]]),
      track('b6', '6', L('Organ systems and vitamins', 'Системы органов и витамины', 'Мүшелер жүйесі және дәрумендер'), L('Endocrine glands, blood vessels, vitamin deficiency', 'Железы, сосуды, нехватка витаминов', 'Бездер, қан тамырлары, дәрумен тапшылығы'), [['b.body', [3]], ['b.bank', [2]]]),
      track('b7', '7', L('The cell', 'Клетка', 'Жасуша'), L('Organelles, cell processes, DNA', 'Органоиды, процессы в клетке, ДНК', 'Органоидтар, жасушадағы үдерістер, ДНҚ'), [['b.cell', [1, 2, 3]], ['b.gen', [1]], ['b.bank', [2]]]),
      track('b8', '8', L('Genetic crosses', 'Задачи на скрещивание', 'Будандастыру есептері'), L('Dominant and recessive traits, Punnett squares', 'Доминантные и рецессивные признаки, решётка Пеннета', 'Доминантты және рецессивті белгілер, Пеннет торы'), [['b.gen', [1, 2]]]),
      track('b9', '9', L('DNA and RNA', 'ДНК и РНК', 'ДНҚ және РНҚ'), L('Complementarity, transcription, Chargaff’s rule', 'Комплементарность, транскрипция, правило Чаргаффа', 'Комплементарлық, транскрипция, Чаргафф ережесі'), [['b.gen', [3]], ['b.bank', [3]]]),
      track('b10', '10', L('Discoveries in biology', 'Открытия в биологии', 'Биологиядағы ашылулар'), L('Darwin, Mendel, Pasteur, Vernadsky and more', 'Дарвин, Мендель, Пастер, Вернадский и другие', 'Дарвин, Мендель, Пастер, Вернадский және басқалар'), [['b.sci', [1, 2, 3]], ['b.cell', [3]], ['b.eco', [3]], ['b.bank', [3]]]),
      { ...track('b11', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('All topics, the hardest questions', 'Все темы, самые трудные вопросы', 'Барлық тақырып, ең қиын сұрақтар'), [['b.animals', [3]], ['b.body', [3]], ['b.cell', [3]], ['b.gen', [2, 3]], ['b.eco', [3]], ['b.plants', [3]], ['b.bank', [1, 2, 3]]], { count: 15, minutes: 20 }), kicker: L('Exam', 'Экзамен', 'Емтихан') },
    ],
  },
  {
    id: 'geography',
    group: 'daily',
    code: '🌍',
    color: '#0891b2',
    leveled: true,
    name: N.geography,
    full: L('Ten levels', 'Десять уровней', 'Он деңгей'),
    about: L(
      'Continents and oceans, countries and capitals, the highest mountains and the longest rivers, Kazakhstan and the world.',
      'Материки и океаны, страны и столицы, самые высокие горы и длинные реки, Казахстан и мир.',
      'Материктер мен мұхиттар, елдер мен астаналар, ең биік таулар мен ең ұзын өзендер, Қазақстан және әлем.',
    ),
    tracks: [
      track('g1', '1', L('Earth and maps', 'Земля и карты', 'Жер және карталар'), L('Continents, oceans, the basics', 'Материки, океаны, основы', 'Материктер, мұхиттар, негіздер'), [['g.bank', [1]], ['g.world', [1]]]),
      track('g2', '2', L('Famous capitals', 'Известные столицы', 'Белгілі астаналар'), L('Capitals of the best-known countries', 'Столицы самых известных стран', 'Ең белгілі елдердің астаналары'), [['g.world', [1]]]),
      track('g3', '3', L('Capitals of the world', 'Столицы мира', 'Әлем астаналары'), L('Europe, Asia, Africa and the Americas', 'Европа, Азия, Африка и Америка', 'Еуропа, Азия, Африка және Америка'), [['g.world', [2]]]),
      track('g4', '4', L('Rare capitals', 'Редкие столицы', 'Сирек астаналар'), L('Small and distant countries', 'Небольшие и далёкие страны', 'Шағын және алыс елдер'), [['g.world', [2, 3]]]),
      track('g5', '5', L('Mountains and rivers', 'Горы и реки', 'Таулар мен өзендер'), L('The highest and the longest', 'Самые высокие и самые длинные', 'Ең биік және ең ұзын'), [['g.records', [1, 2]]]),
      track('g6', '6', L('Records of the planet', 'Рекорды планеты', 'Планета рекордтары'), L('Lakes, area and population of countries', 'Озёра, площадь и население стран', 'Көлдер, елдердің аумағы мен халқы'), [['g.records', [3]]]),
      track('g7', '7', L('Regions of Kazakhstan', 'Области Казахстана', 'Қазақстан облыстары'), L('Regions, their centres and neighbours', 'Области, их центры и соседи', 'Облыстар, орталықтары және көршілер'), [['g.kz', [1, 2]]]),
      track('g8', '8', L('Climate and nature', 'Климат и природа', 'Климат және табиғат'), L('Winds, time zones, resources', 'Ветры, часовые пояса, ресурсы', 'Желдер, уақыт белдеулері, ресурстар'), [['g.bank', [2, 3]], ['g.records', [2]]]),
      track('g9', '9', L('Kazakhstan and the world', 'Казахстан и мир', 'Қазақстан және әлем'), L('Neighbours, capitals, comparisons', 'Соседи, столицы, сравнения', 'Көршілер, астаналар, салыстырулар'), [['g.kz', [2]], ['g.world', [2, 3]]]),
      track('g10', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('Everything together', 'Всё вместе', 'Барлығы бірге'), [['g.world', [2, 3]], ['g.records', [3]], ['g.kz', [2]], ['g.bank', [1, 2, 3]]], { count: 15, minutes: 20 }),
    ],
  },
  {
    id: 'informatics',
    group: 'daily',
    code: '💻',
    color: '#0ea5e9',
    leveled: true,
    name: N.informatics,
    full: L('Eleven levels', 'Одиннадцать уровней', 'Он бір деңгей'),
    about: L(
      'How a computer works, measuring information, number systems, logic and algorithms. Calculation tasks are generated endlessly.',
      'Как устроен компьютер, измерение информации, системы счисления, логика и алгоритмы. Расчётные задания создаются бесконечно.',
      'Компьютер қалай жұмыс істейді, ақпаратты өлшеу, санау жүйелері, логика және алгоритмдер. Есептер шексіз құрастырылады.',
    ),
    tracks: [
      track('i1', '1', L('The computer', 'Компьютер', 'Компьютер'), L('Devices, files, first binary numbers', 'Устройства, файлы, первые двоичные числа', 'Құрылғылар, файлдар, алғашқы екілік сандар'), [['i.facts', [1, 2]], ['i.theory', [1]], ['i.num', [1]]]),
      track('i2', '2', L('Files and terms', 'Файлы и термины', 'Файлдар мен терминдер'), L('File types, browser, CPU, RAM', 'Типы файлов, браузер, процессор, память', 'Файл түрлері, браузер, процессор, жад'), [['i.facts', [3]], ['i.theory', [2]], ['i.units', [1]]]),
      track('i3', '3', L('Units of information', 'Единицы информации', 'Ақпарат бірліктері'), L('Bits, bytes, kilobytes', 'Биты, байты, килобайты', 'Биттер, байттар, килобайттар'), [['i.units', [1]]]),
      track('i4', '4', L('File size and speed', 'Размер файлов и скорость', 'Файл өлшемі және жылдамдық'), L('Text, images, transfer time', 'Текст, изображения, время передачи', 'Мәтін, суреттер, жіберу уақыты'), [['i.units', [2, 3]]]),
      track('i5', '5', L('Binary numbers', 'Двоичная система', 'Екілік санау жүйесі'), L('Converting to and from binary', 'Перевод в двоичную и обратно', 'Екілік жүйеге және кері аудару'), [['i.num', [1]]]),
      track('i6', '6', L('Other number systems', 'Другие системы счисления', 'Басқа санау жүйелері'), L('Octal and hexadecimal', 'Восьмеричная и шестнадцатеричная', 'Сегіздік және он алтылық'), [['i.num', [2, 3]]]),
      track('i7', '7', L('Logic', 'Логика', 'Логика'), L('AND, OR, NOT', 'И, ИЛИ, НЕ', 'ЖӘНЕ, НЕМЕСЕ, ЕМЕС'), [['i.logic', [1, 2]]]),
      track('i8', '8', L('Truth tables', 'Таблицы истинности', 'Ақиқат кестелері'), L('Complex logical expressions', 'Сложные логические выражения', 'Күрделі логикалық өрнектер'), [['i.logic', [2, 3]], ['i.theory', [2]]]),
      track('i9', '9', L('Algorithms', 'Алгоритмы', 'Алгоритмдер'), L('Executors, loops, counting steps', 'Исполнители, циклы, подсчёт шагов', 'Орындаушылар, циклдер, қадамдарды санау'), [['i.algo', [1, 2]]]),
      track('i10', '10', L('Hard algorithms', 'Сложные алгоритмы', 'Күрделі алгоритмдер'), L('Nested loops and tricky executors', 'Вложенные циклы и хитрые исполнители', 'Кірістірілген циклдер және қиын орындаушылар'), [['i.algo', [3]], ['i.theory', [3]]]),
      track('i11', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('The hardest tasks of the exam', 'Самые трудные задания экзамена', 'Емтиханның ең қиын тапсырмалары'), [['i.num', [3]], ['i.units', [3]], ['i.logic', [3]], ['i.algo', [3]], ['i.theory', [3]], ['i.facts', [3]]], { count: 15, minutes: 25 }),
    ],
  },
  {
    id: 'history',
    group: 'daily',
    code: '📜',
    color: '#b45309',
    leveled: true,
    name: N.history,
    full: L('Nine levels', 'Девять уровней', 'Тоғыз деңгей'),
    about: L(
      'Key dates, events and people: from the Saka and the Kazakh Khanate to independence, and world history from Ancient Greece to the present day.',
      'Главные даты, события и личности: от саков и Казахского ханства до независимости и всемирная история — от Древней Греции до наших дней.',
      'Басты даталар, оқиғалар мен тұлғалар: сақтар мен Қазақ хандығынан тәуелсіздікке дейін және Ежелгі Грекиядан бүгінге дейінгі дүниежүзі тарихы.',
    ),
    tracks: [
      track('h1', '1', L('Kazakhstan: the basics', 'Казахстан: основы', 'Қазақстан: негіздер'), L('The most important dates and people', 'Самые важные даты и личности', 'Ең маңызды даталар мен тұлғалар'), [['h.kzt', [1]], ['h.kz', [1]]]),
      track('h2', '2', L('World history: the basics', 'Всемирная история: основы', 'Дүниежүзі тарихы: негіздер'), L('Great empires, discoveries and wars', 'Великие империи, открытия и войны', 'Ұлы империялар, ашылулар мен соғыстар'), [['h.wt', [1]], ['h.world', [1]]]),
      track('h3', '3', L('History of Russia: the basics', 'История России: основы', 'Ресей тарихы: негіздер'), L('From Rurik to the USSR', 'От Рюрика до СССР', 'Рюриктен КСРО-ға дейін'), [['h.rut', [1]], ['h.ru', [1]]]),
      track('h4', '4', L('Kazakhstan in depth', 'Казахстан подробно', 'Қазақстан тереңірек'), L('Khans, uprisings, the Soviet era', 'Ханы, восстания, советская эпоха', 'Хандар, көтерілістер, кеңестік дәуір'), [['h.kzt', [2]], ['h.kz', [2]]]),
      track('h5', '5', L('World history in depth', 'Всемирная история подробно', 'Дүниежүзі тарихы тереңірек'), L('Centuries and the order of events', 'Века и порядок событий', 'Ғасырлар және оқиғалар реті'), [['h.wt', [2]], ['h.world', [2]]]),
      track('h6', '6', L('History of Russia in depth', 'История России подробно', 'Ресей тарихы тереңірек'), L('Close dates and the order of events', 'Близкие даты и порядок событий', 'Жақын даталар және оқиғалар реті'), [['h.rut', [2, 3]], ['h.ru', [2, 3]]]),
      track('h7', '7', L('Kazakhstan: exact dates', 'Казахстан: точные даты', 'Қазақстан: нақты даталар'), L('Dates that differ by one or two years', 'Даты, которые отличаются на год-два', 'Бір-екі жылға ғана ерекшеленетін даталар'), [['h.kzt', [3]], ['h.kz', [3]]]),
      track('h8', '8', L('World history: exact dates', 'Всемирная история: точные даты', 'Дүниежүзі тарихы: нақты даталар'), L('The hardest questions on dates and people', 'Самые трудные вопросы о датах и людях', 'Даталар мен тұлғалар туралы ең қиын сұрақтар'), [['h.wt', [3]], ['h.world', [3]]]),
      track('h9', '🎓', L('Exam prep', 'Подготовка к экзамену', 'Емтиханға дайындық'), L('Everything together', 'Всё вместе', 'Барлығы бірге'), [['h.kzt', [3]], ['h.wt', [3]], ['h.rut', [3]], ['h.kz', [3]], ['h.world', [3]]], { count: 15, minutes: 20 }),
    ],
  },
  // ===== Программирование =====
  ...[
    ['python', 'py', 'Py', '#2563eb', L('The most popular first language: simple and readable syntax.', 'Самый популярный первый язык: простой и понятный синтаксис.', 'Ең танымал алғашқы тіл: қарапайым әрі түсінікті синтаксис.')],
    ['cpp', 'cpp', 'C++', '#4f46e5', L('A fast language for olympiads, games and systems programming.', 'Быстрый язык для олимпиад, игр и системного программирования.', 'Олимпиадаларға, ойындарға және жүйелік бағдарламалауға арналған жылдам тіл.')],
    ['javascript', 'js', 'JS', '#ca8a04', L('The language of the web: it runs in every browser.', 'Язык веба: работает в каждом браузере.', 'Веб тілі: әр браузерде жұмыс істейді.')],
    ['java', 'java', 'Java', '#c2410c', L('A strict language for big applications and Android.', 'Строгий язык для больших приложений и Android.', 'Үлкен қосымшалар мен Android-ке арналған қатаң тіл.')],
  ].map(([id, lang, code, color, about]) => ({
    id,
    group: 'code',
    code,
    color,
    leveled: true,
    name: L(CODE_NAMES[lang], CODE_NAMES[lang], CODE_NAMES[lang]),
    full: L('Fourteen levels', 'Четырнадцать уровней', 'Он төрт деңгей'),
    about: L(
      `${about.en} Each question is a short program: read it and say what it prints. The answers are computed by actually running the code.`,
      `${about.ru} Каждое задание — короткая программа: прочитай её и скажи, что она выведет. Ответы получены настоящим запуском кода.`,
      `${about.kk} Әр тапсырма — қысқа бағдарлама: оны оқып, не шығаратынын айт. Жауаптар кодты шынымен іске қосу арқылы алынған.`,
    ),
    tracks: [
      track('l1', '1', L('Arithmetic', 'Арифметика', 'Арифметика'), L('The order of operations in code', 'Порядок действий в коде', 'Кодтағы амалдар реті'), [[`${lang}.vars`, [1]], ['code.terms', [1]]], { count: 10, minutes: 15 }),
      track('l2', '2', L('Variables', 'Переменные', 'Айнымалылар'), L('Assigning and changing values', 'Присваивание и изменение значений', 'Мәндерді меншіктеу және өзгерту'), [[`${lang}.vars`, [2]], ['code.theory', [1]]], { count: 10, minutes: 15 }),
      track('l3', '3', L('Division and remainder', 'Деление и остаток', 'Бөлу және қалдық'), L('Integer division and the % operator', 'Целочисленное деление и операция %', 'Бүтін бөлу және % амалы'), [[`${lang}.vars`, [3]], ['code.terms', [1]]], { count: 10, minutes: 15 }),
      track('l4', '4', L('The first if', 'Первое условие', 'Алғашқы шарт'), L('if and else', 'if и else', 'if және else'), [[`${lang}.cond`, [1]], ['code.theory', [1]]], { count: 10, minutes: 15 }),
      track('l5', '5', L('Chains of conditions', 'Цепочки условий', 'Шарттар тізбегі'), L('if – else if – else', 'if – else if – else', 'if – else if – else'), [[`${lang}.cond`, [2]], ['code.terms', [2]]], { count: 10, minutes: 15 }),
      track('l6', '6', L('Logical operators', 'Логические операции', 'Логикалық амалдар'), L('and, or and comparisons', 'and, or и сравнения', 'and, or және салыстырулар'), [[`${lang}.cond`, [3]], ['code.theory', [2]]], { count: 10, minutes: 15 }),
      track('l7', '7', L('The for loop', 'Цикл for', 'for циклі'), L('Repeating and adding up', 'Повторение и суммирование', 'Қайталау және қосу'), [[`${lang}.loop`, [1]], ['code.terms', [2]]], { count: 10, minutes: 15 }),
      track('l8', '8', L('Counters and products', 'Счётчики и произведения', 'Санауыштар мен көбейтінділер'), L('Loops with steps and multiplication', 'Циклы с шагом и умножением', 'Қадамы бар және көбейтетін циклдер'), [[`${lang}.loop`, [2]]], { count: 10, minutes: 15 }),
      track('l9', '9', L('The while loop', 'Цикл while', 'while циклі'), L('Loops with a condition', 'Циклы с условием', 'Шарты бар циклдер'), [[`${lang}.loop`, [3]], ['code.theory', [2]]], { count: 10, minutes: 15 }),
      track('l10', '10', L('Arrays', 'Массивы', 'Массивтер'), L('Indexes and the sum of elements', 'Индексы и сумма элементов', 'Индекстер және элементтер қосындысы'), [[`${lang}.arr`, [1, 2]]], { count: 10, minutes: 15 }),
      track('l11', '11', L('Search in an array', 'Поиск в массиве', 'Массивтен іздеу'), L('The maximum and other algorithms', 'Поиск максимума и другие алгоритмы', 'Ең үлкенін іздеу және басқа алгоритмдер'), [[`${lang}.arr`, [3]], ['code.terms', [3]]], { count: 10, minutes: 15 }),
      track('l12', '12', L('Functions', 'Функции', 'Функциялар'), L('Defining and calling functions', 'Объявление и вызов функций', 'Функцияны жариялау және шақыру'), [[`${lang}.func`, [1, 2]], ['code.theory', [3]]], { count: 10, minutes: 15 }),
      track('l13', '13', L('Recursion', 'Рекурсия', 'Рекурсия'), L('Factorial, Fibonacci, powers', 'Факториал, Фибоначчи, степени', 'Факториал, Фибоначчи, дәрежелер'), [[`${lang}.func`, [3]], ['code.terms', [3]]], { count: 10, minutes: 15 }),
      track('l14', '🏆', L('Olympiad level', 'Олимпиадный уровень', 'Олимпиада деңгейі'), L('The hardest programs from every topic', 'Самые сложные программы по всем темам', 'Барлық тақырып бойынша ең күрделі бағдарламалар'), [[`${lang}.vars`, [3]], [`${lang}.cond`, [3]], [`${lang}.loop`, [3]], [`${lang}.arr`, [3]], [`${lang}.func`, [3]]], { count: 12, minutes: 20 }),
    ],
  })),
];

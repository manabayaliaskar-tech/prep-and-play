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
    id: 'daily',
    href: '/practice',
    icon: '📅',
    color: '#22c55e',
    name: L('Daily practice', 'Ежедневная практика', 'Күнделікті жаттығу'),
    desc: L(
      'Math and English at any level — a little every day.',
      'Математика и английский на любом уровне — понемногу каждый день.',
      'Кез келген деңгейдегі математика мен ағылшын тілі — күн сайын аздап.',
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
const SUBJECT = {
  physics: () =>
    track('physics', '⚛️', N.physics, L('Mechanics, electricity, heat, optics', 'Механика, электричество, тепло, оптика', 'Механика, электр, жылу, оптика'),
      [['p.kin', ALL], ['p.dyn', ALL], ['p.energy', ALL], ['p.elec', ALL], ['p.heat', ALL], ['p.wave', ALL], ['p.theory', [0]]], { count: 15, minutes: 30 }),
  chemistry: () =>
    track('chemistry', '⚗️', N.chemistry, L('Calculations, substances and reactions', 'Расчёты, вещества и реакции', 'Есептеулер, заттар мен реакциялар'),
      [['c.molar', ALL], ['c.mole', ALL], ['c.theory', [0]]], { count: 15, minutes: 30 }),
  biology: () =>
    track('biology', '🧬', N.biology, L('Cell, human body, genetics, ecology', 'Клетка, человек, генетика, экология', 'Жасуша, адам, генетика, экология'),
      [['b.bank', ALL]], { count: 12, minutes: 15 }),
  geography: () =>
    track('geography', '🌍', N.geography, L('Maps, climate, nature, population', 'Карты, климат, природа, население', 'Карталар, климат, табиғат, халық'),
      [['g.bank', ALL]], { count: 12, minutes: 15 }),
  informatics: () =>
    track('informatics', '💻', N.informatics, L('Number systems, logic, algorithms', 'Системы счисления, логика, алгоритмы', 'Санау жүйелері, логика, алгоритмдер'),
      [['i.num', ALL], ['i.units', ALL], ['i.logic', ALL], ['i.algo', ALL], ['i.theory', [0]]], { count: 15, minutes: 30 }),
  russian: () =>
    track('russian', 'Аа', N.russian, L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'),
      [['l.ru', ALL]], { count: 15, minutes: 20 }),
  social: () =>
    track('social', '⚖️', N.social, L('State, law, economics, society', 'Государство, право, экономика, общество', 'Мемлекет, құқық, экономика, қоғам'),
      [['s.bank', ALL]], { count: 10, minutes: 12 }),
  /** История страны: свой банк вместе со всемирной историей. */
  history: (topic, name, id = 'history') =>
    track(id, '📜', name, L('Key events and people', 'Главные события и личности', 'Басты оқиғалар мен тұлғалар'),
      topic === 'h.world' ? [[topic, [0]]] : [[topic, [0]], ['h.world', [0]]], { count: topic === 'h.world' ? 10 : 12, minutes: 15 }),
};

// Олимпиадная математика: три уровня. Ключ в наборе тем — номер уровня.
const OLYMP_TOPICS = ['o.count', 'o.digit', 'o.div', 'o.pigeon', 'o.sum', 'o.games', 'o.logic', 'o.geom', 'o.rem', 'o.fact', 'o.paths'];
const OLYMP_LEVELS = [
  [L('Grades 5–6', '5–6 классы', '5–6 сыныптар'), L('First ideas: counting, pairs, the worst case', 'Первые идеи: подсчёт, разбиение на пары, худший случай', 'Алғашқы идеялар: санау, жұптау, ең нашар жағдай')],
  [L('Grades 7–8', '7–8 классы', '7–8 сыныптар'), L('Divisibility, remainders, combinatorics', 'Делимость, остатки, комбинаторика', 'Бөлінгіштік, қалдықтар, комбинаторика')],
  [L('Grades 9–11', '9–11 классы', '9–11 сыныптар'), L('Number theory, counting routes, clever sums', 'Теория чисел, подсчёт маршрутов, хитрые суммы', 'Сандар теориясы, маршруттарды санау, қызықты қосындылар')],
];

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
      track('history', '📜', L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'), L('From the Saka to independence', 'От саков до независимости', 'Сақтардан тәуелсіздікке дейін'), [['h.kz', ALL]], { count: 15, minutes: 20 }),
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
      track('analogies', '🔗', L('Analogies and sentence completion', 'Аналогии и дополнение предложений', 'Аналогиялар мен сөйлемдерді толықтыру'), L('Relations between words, meaning in context', 'Связи между словами, смысл в контексте', 'Сөздер арасындағы байланыс, контекстегі мағына'), [['l.analogy', [0]], ['l.complete', [0]]], { count: 15, minutes: 15 }),
      track('reading', '📖', L('Reading comprehension', 'Чтение и понимание', 'Оқу және түсіну'), L('Texts and questions about them', 'Тексты и вопросы к ним', 'Мәтіндер және оларға сұрақтар'), [['r.literacy', [1]]], { count: 12, minutes: 20 }),
      track('grammar', 'Аа', L('Practical grammar (Russian)', 'Практическая грамматика (русский язык)', 'Практикалық грамматика (орыс тілі)'), L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'), [['l.ru', ALL]], { count: 15, minutes: 20 }),
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
    tracks: OLYMP_LEVELS.map(([name, desc], i) =>
      track(`l${i + 1}`, String(i + 1), name, desc, [...OLYMP_TOPICS.map((id) => [id, [i + 1]]), ...(i > 0 ? [['o.eq', [i + 1]]] : [])], { count: 8, minutes: 30 }),
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
  // ===== Ежедневная практика: естественные науки =====
  {
    id: 'physics',
    group: 'daily',
    code: '⚛️',
    color: '#6366f1',
    leveled: true,
    name: N.physics,
    full: L('Grades 7–11', '7–11 классы', '7–11 сыныптар'),
    about: L(
      'Motion, forces, energy, heat, electricity and waves. Calculation problems are generated endlessly and come with a step-by-step solution.',
      'Движение, силы, энергия, тепло, электричество и волны. Расчётные задачи создаются бесконечно, у каждой — пошаговое решение.',
      'Қозғалыс, күштер, энергия, жылу, электр және толқындар. Есептер шексіз құрастырылады, әрқайсысының қадамдық шешімі бар.',
    ),
    tracks: [
      { ...track('p1', '7', L('Motion and forces', 'Движение и силы', 'Қозғалыс және күштер'), L('Speed, mass, weight, work', 'Скорость, масса, вес, работа', 'Жылдамдық, масса, салмақ, жұмыс'), [['p.kin', [1]], ['p.dyn', [1]], ['p.energy', [1]], ['p.theory', [1]]]), kicker: L('Grade 7', '7 класс', '7-сынып') },
      { ...track('p2', '8', L('Heat and electricity', 'Тепло и электричество', 'Жылу және электр'), L('Heating, melting, Ohm’s law, circuits', 'Нагревание, плавление, закон Ома, цепи', 'Қыздыру, балқу, Ом заңы, тізбектер'), [['p.heat', [1, 2]], ['p.elec', [1, 2]], ['p.theory', [2]]]), kicker: L('Grade 8', '8 класс', '8-сынып') },
      { ...track('p3', '9', L('Mechanics', 'Механика', 'Механика'), L('Acceleration, Newton’s laws, energy, oscillations', 'Ускорение, законы Ньютона, энергия, колебания', 'Үдеу, Ньютон заңдары, энергия, тербелістер'), [['p.kin', [2, 3]], ['p.dyn', [2, 3]], ['p.energy', [2, 3]], ['p.wave', [1]]]), kicker: L('Grade 9', '9 класс', '9-сынып') },
      { ...track('p4', '10', L('Senior physics', 'Физика старших классов', 'Жоғары сынып физикасы'), L('Waves, optics, Joule heating, heat balance', 'Волны, оптика, закон Джоуля — Ленца, тепловой баланс', 'Толқындар, оптика, Джоуль — Ленц заңы, жылу балансы'), [['p.wave', [2, 3]], ['p.elec', [3]], ['p.heat', [3]], ['p.theory', [3]], ['p.energy', [3]]]), kicker: L('Grades 10–11', '10–11 классы', '10–11-сыныптар') },
    ],
  },
  {
    id: 'chemistry',
    group: 'daily',
    code: '⚗️',
    color: '#14b8a6',
    leveled: true,
    name: N.chemistry,
    full: L('Grades 8–11', '8–11 классы', '8–11 сыныптар'),
    about: L(
      'Formulas, molar mass, amount of substance, reactions and the classes of compounds.',
      'Формулы, молярная масса, количество вещества, реакции и классы соединений.',
      'Формулалар, молярлық масса, зат мөлшері, реакциялар және қосылыстар кластары.',
    ),
    tracks: [
      { ...track('c1', '8', L('Substances and formulas', 'Вещества и формулы', 'Заттар мен формулалар'), L('Elements, molar mass, simple calculations', 'Элементы, молярная масса, простые расчёты', 'Элементтер, молярлық масса, қарапайым есептеулер'), [['c.molar', [1]], ['c.mole', [1]], ['c.theory', [1]]]), kicker: L('Grade 8', '8 класс', '8-сынып') },
      { ...track('c2', '9', L('Reactions and solutions', 'Реакции и растворы', 'Реакциялар мен ерітінділер'), L('Gas volumes, acids and bases, types of reactions', 'Объёмы газов, кислоты и основания, типы реакций', 'Газ көлемдері, қышқылдар мен негіздер, реакция түрлері'), [['c.molar', [2]], ['c.mole', [2]], ['c.theory', [2]]]), kicker: L('Grade 9', '9 класс', '9-сынып') },
      { ...track('c3', '10', L('Senior chemistry', 'Химия старших классов', 'Жоғары сынып химиясы'), L('Mass fractions, reaction calculations, bonds, redox', 'Массовые доли, расчёты по уравнениям, связи, окисление', 'Массалық үлестер, теңдеу бойынша есептеу, байланыстар, тотығу'), [['c.molar', [3]], ['c.mole', [3]], ['c.theory', [3]]]), kicker: L('Grades 10–11', '10–11 классы', '10–11-сыныптар') },
    ],
  },
  {
    id: 'biology',
    group: 'daily',
    code: '🧬',
    color: '#16a34a',
    leveled: true,
    name: N.biology,
    full: L('Three levels', 'Три уровня', 'Үш деңгей'),
    about: L(
      'From plants and animals to the cell, genetics and evolution.',
      'От растений и животных до клетки, генетики и эволюции.',
      'Өсімдіктер мен жануарлардан жасушаға, генетика мен эволюцияға дейін.',
    ),
    tracks: [
      track('b1', '1', L('Living world', 'Живой мир', 'Тірі әлем'), L('Plants, animals, the main organs', 'Растения, животные, главные органы', 'Өсімдіктер, жануарлар, негізгі мүшелер'), [['b.bank', [1]]]),
      track('b2', '2', L('Human body', 'Человек и здоровье', 'Адам және денсаулық'), L('Blood, digestion, hormones, ecosystems', 'Кровь, пищеварение, гормоны, экосистемы', 'Қан, ас қорыту, гормондар, экожүйелер'), [['b.bank', [2]]]),
      track('b3', '3', L('Cell and genetics', 'Клетка и генетика', 'Жасуша және генетика'), L('DNA, proteins, heredity, evolution', 'ДНК, белки, наследственность, эволюция', 'ДНҚ, ақуыздар, тұқым қуалаушылық, эволюция'), [['b.bank', [3]]]),
    ],
  },
  {
    id: 'geography',
    group: 'daily',
    code: '🌍',
    color: '#0891b2',
    leveled: true,
    name: N.geography,
    full: L('Three levels', 'Три уровня', 'Үш деңгей'),
    about: L(
      'Continents and oceans, maps and climate, Kazakhstan and the world.',
      'Материки и океаны, карты и климат, Казахстан и мир.',
      'Материктер мен мұхиттар, карталар мен климат, Қазақстан және әлем.',
    ),
    tracks: [
      track('g1', '1', L('Earth and maps', 'Земля и карты', 'Жер және карталар'), L('Continents, oceans, the highest and the longest', 'Материки, океаны, самые высокие и длинные', 'Материктер, мұхиттар, ең биік және ең ұзын'), [['g.bank', [1]]]),
      track('g2', '2', L('Climate and nature', 'Климат и природа', 'Климат және табиғат'), L('Map scale, winds, deserts, rivers', 'Масштаб, ветры, пустыни, реки', 'Масштаб, желдер, шөлдер, өзендер'), [['g.bank', [2]]]),
      track('g3', '3', L('The world in depth', 'Мир подробно', 'Әлем тереңірек'), L('Time zones, fronts, resources, population', 'Часовые пояса, фронты, ресурсы, население', 'Уақыт белдеулері, фронттар, ресурстар, халық'), [['g.bank', [3]]]),
    ],
  },
];

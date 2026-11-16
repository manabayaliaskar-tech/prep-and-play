// Реестр тем: какой генератор отвечает за какую тему и как она называется на трёх языках.
// Тема — наименьшая единица статистики: по ней считается точность в профиле.

import { L } from './gen.js';
import { add, divis, mul, neg, order, seq } from './math/arith.js';
import { decimals, fractions, percent, ratio } from './math/fractions.js';
import { expressions, functions, inequalities, linearEq, powers, progressions, quadratics, systems } from './math/algebra.js';
import { combinatorics, derivative, logarithms, probability, statistics, trig } from './math/advanced.js';
import { angles, area, pythagoras, volume } from './math/geometry.js';
import { mixtures, motion, work } from './math/word.js';
import { early } from './math/early.js';
import { complexNumbers, integrals, limits, matrices, vectors } from './math/higher.js';
import { englishMaker } from './english/index.js';
import { readingMaker } from './reading.js';
import { bankMaker } from './bank.js';
import { PHYSICS_THEORY, dynamics, electricity, energy, heat, kinematics, waves } from './science/physics.js';
import { CHEMISTRY_THEORY, molarMass, moles } from './science/chemistry.js';
import { BIOLOGY, GEOGRAPHY } from './science/bio-geo.js';
import { HISTORY_KZ, HISTORY_REGION, HISTORY_RU, HISTORY_WORLD } from './humanities/history.js';
import { ANALOGIES, RUSSIAN, SENTENCES, SOCIAL } from './humanities/language.js';
import { LITERACY } from './humanities/literacy.js';
import { INFORMATICS_THEORY, algorithms, infoUnits, logic as boolLogic, numberSystems } from './science/informatics.js';
import { counting, diophantine, divisors, factorials, lastDigit, logic, paths, pigeonhole, remainders, shapes, sums, tournaments } from './olymp.js';

const topic = (pool, name, make) => ({ pool, name, make });

export const TOPICS = {
  // ----- Математика -----
  'm.early': topic('math', L('Counting within 100', 'Счёт в пределах 100', '100 көлеміндегі санау'), early),
  'm.add': topic('math', L('Addition and subtraction', 'Сложение и вычитание', 'Қосу және азайту'), add),
  'm.mul': topic('math', L('Multiplication and division', 'Умножение и деление', 'Көбейту және бөлу'), mul),
  'm.order': topic('math', L('Order of operations', 'Порядок действий', 'Амалдар реті'), order),
  'm.neg': topic('math', L('Negative numbers', 'Отрицательные числа', 'Теріс сандар'), neg),
  'm.divis': topic('math', L('Divisibility, GCD and LCM', 'Делимость, НОД и НОК', 'Бөлінгіштік, ЕҮОБ және ЕКОЕ'), divis),
  'm.seq': topic('math', L('Number patterns', 'Числовые закономерности', 'Сандық заңдылықтар'), seq),
  'm.frac': topic('math', L('Fractions', 'Обыкновенные дроби', 'Жай бөлшектер'), fractions),
  'm.dec': topic('math', L('Decimals', 'Десятичные дроби', 'Ондық бөлшектер'), decimals),
  'm.pct': topic('math', L('Percentages', 'Проценты', 'Пайыздар'), percent),
  'm.ratio': topic('math', L('Ratios and proportions', 'Отношения и пропорции', 'Қатынастар мен пропорциялар'), ratio),
  'm.lineq': topic('math', L('Linear equations', 'Линейные уравнения', 'Сызықтық теңдеулер'), linearEq),
  'm.expr': topic('math', L('Expressions and formulas', 'Выражения и формулы', 'Өрнектер мен формулалар'), expressions),
  'm.pow': topic('math', L('Powers and roots', 'Степени и корни', 'Дәрежелер мен түбірлер'), powers),
  'm.quad': topic('math', L('Quadratic equations', 'Квадратные уравнения', 'Квадрат теңдеулер'), quadratics),
  'm.sys': topic('math', L('Systems of equations', 'Системы уравнений', 'Теңдеулер жүйесі'), systems),
  'm.ineq': topic('math', L('Inequalities', 'Неравенства', 'Теңсіздіктер'), inequalities),
  'm.func': topic('math', L('Functions', 'Функции', 'Функциялар'), functions),
  'm.prog': topic('math', L('Progressions', 'Прогрессии', 'Прогрессиялар'), progressions),
  'm.log': topic('math', L('Logarithms', 'Логарифмы', 'Логарифмдер'), logarithms),
  'm.trig': topic('math', L('Trigonometry', 'Тригонометрия', 'Тригонометрия'), trig),
  'm.comb': topic('math', L('Combinatorics', 'Комбинаторика', 'Комбинаторика'), combinatorics),
  'm.prob': topic('math', L('Probability', 'Вероятность', 'Ықтималдық'), probability),
  'm.deriv': topic('math', L('Derivative', 'Производная', 'Туынды'), derivative),
  'm.stat': topic('math', L('Mean and median', 'Среднее и медиана', 'Орта мән және медиана'), statistics),
  'm.area': topic('math', L('Perimeter and area', 'Периметр и площадь', 'Периметр және аудан'), area),
  'm.pyth': topic('math', L('Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'), pythagoras),
  'm.angle': topic('math', L('Angles', 'Углы', 'Бұрыштар'), angles),
  'm.vol': topic('math', L('Volume and surface area', 'Объём и площадь поверхности', 'Көлем және бет ауданы'), volume),
  'm.motion': topic('math', L('Motion problems', 'Задачи на движение', 'Қозғалыс есептері'), motion),
  'm.work': topic('math', L('Work problems', 'Задачи на работу', 'Жұмысқа берілген есептер'), work),
  'm.mix': topic('math', L('Prices, solutions and mixtures', 'Покупки, растворы и смеси', 'Сатып алу, ерітінділер мен қоспалар'), mixtures),
  'm.limit': topic('math', L('Limits', 'Пределы', 'Шектер'), limits),
  'm.integral': topic('math', L('Integrals', 'Интегралы', 'Интегралдар'), integrals),
  'm.complex': topic('math', L('Complex numbers', 'Комплексные числа', 'Комплекс сандар'), complexNumbers),
  'm.vector': topic('math', L('Vectors', 'Векторы', 'Векторлар'), vectors),
  'm.matrix': topic('math', L('Matrices', 'Матрицы', 'Матрицалар'), matrices),

  // ----- Английский язык -----
  'e.basics': topic('english', L('Basics: to be, pronouns, nouns', 'Основы: to be, местоимения, существительные', 'Негіздер: to be, есімдіктер, зат есімдер'), englishMaker('e.basics')),
  'e.tenses': topic('english', L('Tenses', 'Времена', 'Шақтар'), englishMaker('e.tenses')),
  'e.det': topic('english', L('Articles, quantity, comparison', 'Артикли, количество, сравнение', 'Артикльдер, мөлшер, салыстыру'), englishMaker('e.det')),
  'e.prep': topic('english', L('Prepositions', 'Предлоги', 'Предлогтар'), englishMaker('e.prep')),
  'e.modal': topic('english', L('Modal verbs', 'Модальные глаголы', 'Модаль етістіктер'), englishMaker('e.modal')),
  'e.struct': topic('english', L('Conditionals, passive, verb patterns', 'Условные, пассив, формы глагола', 'Шартты сөйлемдер, ырықсыз етіс, етістік түрлері'), englishMaker('e.struct')),
  'e.adv': topic('english', L('Advanced structures', 'Продвинутые конструкции', 'Күрделі құрылымдар'), englishMaker('e.adv')),
  'e.vocab': topic('english', L('Vocabulary', 'Лексика', 'Лексика'), englishMaker('e.vocab')),
  'e.phrasal': topic('english', L('Phrasal verbs and idioms', 'Фразовые глаголы и идиомы', 'Фразалық етістіктер мен идиомалар'), englishMaker('e.phrasal')),
  'e.wordform': topic('english', L('Word formation', 'Словообразование', 'Сөзжасам'), englishMaker('e.wordform')),

  // ----- Физика -----
  'p.kin': topic('physics', L('Kinematics', 'Кинематика', 'Кинематика'), kinematics),
  'p.dyn': topic('physics', L('Forces, pressure, density', 'Силы, давление, плотность', 'Күштер, қысым, тығыздық'), dynamics),
  'p.energy': topic('physics', L('Work, energy, power', 'Работа, энергия, мощность', 'Жұмыс, энергия, қуат'), energy),
  'p.elec': topic('physics', L('Electricity', 'Электричество', 'Электр'), electricity),
  'p.heat': topic('physics', L('Heat', 'Тепловые явления', 'Жылу құбылыстары'), heat),
  'p.wave': topic('physics', L('Oscillations, waves, optics', 'Колебания, волны, оптика', 'Тербелістер, толқындар, оптика'), waves),
  'p.theory': topic('physics', L('Laws and units', 'Законы и единицы', 'Заңдар мен бірліктер'), bankMaker('p.theory', PHYSICS_THEORY)),

  // ----- Химия -----
  'c.molar': topic('chemistry', L('Molar mass and mass fraction', 'Молярная масса и массовая доля', 'Молярлық масса және массалық үлес'), molarMass),
  'c.mole': topic('chemistry', L('Amount of substance and reactions', 'Количество вещества и расчёты по уравнениям', 'Зат мөлшері және теңдеу бойынша есептеулер'), moles),
  'c.theory': topic('chemistry', L('Substances and reactions', 'Вещества и реакции', 'Заттар мен реакциялар'), bankMaker('c.theory', CHEMISTRY_THEORY)),

  // ----- Информатика -----
  'i.num': topic('informatics', L('Number systems', 'Системы счисления', 'Санау жүйелері'), numberSystems),
  'i.units': topic('informatics', L('Measuring information', 'Измерение информации', 'Ақпаратты өлшеу'), infoUnits),
  'i.logic': topic('informatics', L('Logic', 'Логика', 'Логика'), boolLogic),
  'i.algo': topic('informatics', L('Algorithms', 'Алгоритмы', 'Алгоритмдер'), algorithms),
  'i.theory': topic('informatics', L('Computers and networks', 'Компьютер и сети', 'Компьютер және желілер'), bankMaker('i.theory', INFORMATICS_THEORY)),

  // ----- Биология и география -----
  'b.bank': topic('biology', L('Biology', 'Биология', 'Биология'), bankMaker('b.bank', BIOLOGY)),
  'g.bank': topic('geography', L('Geography', 'География', 'География'), bankMaker('g.bank', GEOGRAPHY)),

  // ----- История и обществознание -----
  'h.kz': topic('history', L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'), bankMaker('h.kz', HISTORY_KZ)),
  'h.world': topic('history', L('World history', 'Всемирная история', 'Дүниежүзі тарихы'), bankMaker('h.world', HISTORY_WORLD)),
  'h.ru': topic('history', L('History of Russia', 'История России', 'Ресей тарихы'), bankMaker('h.ru', HISTORY_RU)),
  'h.uz': topic('history', L('History of Uzbekistan', 'История Узбекистана', 'Өзбекстан тарихы'), bankMaker('h.uz', HISTORY_REGION.uz)),
  'h.kg': topic('history', L('History of Kyrgyzstan', 'История Кыргызстана', 'Қырғызстан тарихы'), bankMaker('h.kg', HISTORY_REGION.kg)),
  'h.tj': topic('history', L('History of Tajikistan', 'История Таджикистана', 'Тәжікстан тарихы'), bankMaker('h.tj', HISTORY_REGION.tj)),
  'h.az': topic('history', L('History of Azerbaijan', 'История Азербайджана', 'Әзербайжан тарихы'), bankMaker('h.az', HISTORY_REGION.az)),
  'h.am': topic('history', L('History of Armenia', 'История Армении', 'Армения тарихы'), bankMaker('h.am', HISTORY_REGION.am)),
  'h.by': topic('history', L('History of Belarus', 'История Беларуси', 'Беларусь тарихы'), bankMaker('h.by', HISTORY_REGION.by)),
  'h.md': topic('history', L('History of Moldova', 'История Молдовы', 'Молдова тарихы'), bankMaker('h.md', HISTORY_REGION.md)),
  's.bank': topic('social', L('Social studies', 'Обществознание', 'Қоғамтану'), bankMaker('s.bank', SOCIAL)),

  // ----- Русский язык, логика и чтение на языке интерфейса -----
  'l.ru': topic('russian', L('Russian language', 'Русский язык', 'Орыс тілі'), bankMaker('l.ru', RUSSIAN)),
  'l.analogy': topic('russian', L('Analogies', 'Аналогии', 'Аналогиялар'), bankMaker('l.analogy', ANALOGIES)),
  'l.complete': topic('russian', L('Sentence completion', 'Дополнение предложений', 'Сөйлемді толықтыру'), bankMaker('l.complete', SENTENCES)),
  'r.literacy': topic('reading', L('Reading literacy', 'Грамотность чтения', 'Оқу сауаттылығы'), readingMaker('r.literacy', LITERACY)),

  // ----- Чтение -----
  'r.ielts': topic('reading', L('IELTS Reading', 'IELTS: чтение', 'IELTS: оқылым'), readingMaker('r.ielts', 'ielts')),
  'r.toefl': topic('reading', L('TOEFL Reading', 'TOEFL: чтение', 'TOEFL: оқылым'), readingMaker('r.toefl', 'toefl')),

  // ----- Олимпиадная математика -----
  'o.count': topic('olymp', L('Counting and inclusion–exclusion', 'Подсчёт и формула включений-исключений', 'Санау және қосу-алу формуласы'), counting),
  'o.digit': topic('olymp', L('Last digit', 'Последняя цифра', 'Соңғы цифр'), lastDigit),
  'o.div': topic('olymp', L('Divisors', 'Делители', 'Бөлгіштер'), divisors),
  'o.pigeon': topic('olymp', L('Pigeonhole principle', 'Принцип Дирихле', 'Дирихле принципі'), pigeonhole),
  'o.sum': topic('olymp', L('Clever sums', 'Хитрые суммы', 'Қызықты қосындылар'), sums),
  'o.games': topic('olymp', L('Tournaments and handshakes', 'Турниры и рукопожатия', 'Турнирлер мен қол алысулар'), tournaments),
  'o.logic': topic('olymp', L('Logic and reasoning', 'Логика и рассуждения', 'Логика және пайымдау'), logic),
  'o.geom': topic('olymp', L('Counting in geometry', 'Подсчёт в геометрии', 'Геометриядағы санау'), shapes),
  'o.rem': topic('olymp', L('Remainders', 'Остатки', 'Қалдықтар'), remainders),
  'o.fact': topic('olymp', L('Digits and factorials', 'Цифры и факториалы', 'Цифрлар мен факториалдар'), factorials),
  'o.paths': topic('olymp', L('Routes and the multiplication rule', 'Маршруты и правило умножения', 'Маршруттар және көбейту ережесі'), paths),
  'o.eq': topic('olymp', L('Equations in integers', 'Уравнения в целых числах', 'Бүтін сандардағы теңдеулер'), diophantine),
};

/** Значок и цвет полосы для каждого банка заданий (поле pool в src/pools/topics.js). */
export const POOLS = {
  math: { icon: '📐', color: '#22c55e' },
  english: { icon: '🔤', color: '#3b82f6' },
  olymp: { icon: '🏆', color: '#f59e0b' },
  reading: { icon: '📖', color: '#e11d48' },
  physics: { icon: '⚛️', color: '#6366f1' },
  chemistry: { icon: '⚗️', color: '#14b8a6' },
  informatics: { icon: '💻', color: '#0ea5e9' },
  biology: { icon: '🧬', color: '#16a34a' },
  geography: { icon: '🌍', color: '#0891b2' },
  history: { icon: '📜', color: '#b45309' },
  social: { icon: '⚖️', color: '#7c3aed' },
  russian: { icon: 'Аа', color: '#db2777' },
};

export const topicIds = (pool) => Object.keys(TOPICS).filter((id) => !pool || TOPICS[id].pool === pool);

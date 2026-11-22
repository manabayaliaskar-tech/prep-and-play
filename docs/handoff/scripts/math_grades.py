PATH = '/home/user/School/src/catalog/courses.js'
s = open(PATH, encoding='utf8').read()

start = s.index('const MATH_LEVELS = [')
end = s.index('];', start) + 3
GRADES = '''/** Математика по классам: 1–11 класс и три уровня после школы. Сложность внутри темы — 1…3. */
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
'''
s = s[:start] + GRADES + s[end:]

old = "    tracks: MATH_LEVELS.map((lvl, i) => track(`l${i + 1}`, String(i + 1), lvl.name, lvl.desc, lvl.spec)),"
assert old in s
s = s.replace(old, """    tracks: [
      ...MATH_GRADES.map(([name, desc, spec], i) => ({ ...track(`g${i + 1}`, String(i + 1), name, desc, spec), kicker: gradeKicker(i + 1) })),
      ...MATH_BEYOND.map(([icon, name, desc, spec], i) => ({ ...track(`u${i + 1}`, icon, name, desc, spec), kicker: beyondKicker(i + 1) })),
    ],""")
s = s.replace("""    full: L('From counting to senior school', 'От счёта до старшей школы', 'Санаудан жоғары сыныптарға дейін'),
    about: L(
      'Nine levels: start where it is easy and move up. Problems are generated endlessly, each with a step-by-step solution.',
      'Девять уровней: начни там, где легко, и поднимайся выше. Задачи создаются бесконечно, у каждой — пошаговое решение.',
      'Тоғыз деңгей: жеңіл жерден бастап, жоғары көтеріл. Есептер шексіз құрастырылады, әрқайсысының қадамдық шешімі бар.',
    ),""", """    full: L('Grades 1–11 and beyond', '1–11 классы и дальше', '1–11 сыныптар және одан әрі'),
    about: L(
      'A section for every school grade from 1 to 11 and three levels after school, up to limits and integrals. Algebra, geometry and trigonometry are all included. Problems are generated endlessly, each with a step-by-step solution.',
      'Раздел для каждого класса с 1-го по 11-й и три уровня после школы — вплоть до пределов и интегралов. Алгебра, геометрия и тригонометрия — всё внутри. Задачи создаются бесконечно, у каждой — пошаговое решение.',
      '1-ден 11-ге дейінгі әр сыныпқа арналған бөлім және мектептен кейінгі үш деңгей — шектер мен интегралдарға дейін. Алгебра, геометрия және тригонометрия — бәрі ішінде. Есептер шексіз құрастырылады, әрқайсысының қадамдық шешімі бар.',
    ),""")
open(PATH, 'w', encoding='utf8').write(s)
print('ok')

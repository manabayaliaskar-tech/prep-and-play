// Реестр тем: какой генератор отвечает за какую тему и как она называется на трёх языках.
// Тема - наименьшая единица статистики: по ней считается точность в профиле.

import { L } from './gen.js';
import { add, divis, mul, neg, order, seq } from './math/arith.js';
import { decimals, fractions, percent, ratio } from './math/fractions.js';
import { expressions, functions, inequalities, linearEq, powers, progressions, quadratics, systems } from './math/algebra.js';
import { combinatorics, derivative, logarithms, probability, statistics, trig } from './math/advanced.js';
import { angles, area, pythagoras, volume } from './math/geometry.js';
import { mixtures, motion, work } from './math/word.js';
import { early } from './math/early.js';
import { add10, add20, clock1, compare, count100, length1, money1, num10, num20, orient, pattern1, shapes1, word1 } from './math/grade1.js';
import { add2d, change2, col, eq1, laws, mulMean, order2, perim, place100, rightAngle, tab23, time2, units2, word2 } from './math/grade2.js';
import { area3, circle3, col3, colMul, eq3, mass, mulBig, num1000, parts, price, remDiv, time3 } from './math/grade3.js';
import { addBig, bigNum, box, chart, eq2step, motion4, mul2d, partOf, romanQ, seq4, speed, units4 } from './math/grade4.js';
import { eq5, formula, mixedNum, primes, props, ray, roundDec, roundNat, sqCube, triKinds } from './math/grade5.js';
import { brackets, circle6, coord, diagram, fracAdd, fracMul, lines, modulus, pctTask, rational, scale, symmetry } from './math/grade6.js';
import { complexNumbers, integrals, limits, matrices, vectors } from './math/higher.js';
import { englishMaker } from './english/index.js';
import { ukusMaker, variantize } from './english/variant.js';
import { getEnVariant } from '../core/en-variant.js';
import { readingMaker } from './reading.js';
import { listeningMaker } from './listening.js';
import { CODE_LANGS, CODE_TOPIC_NAMES, codeTopics } from './code.js';
import { CODE_THEORY } from './code-theory.js';
import { languageMaker } from './languages/index.js';
import { FRENCH, SPANISH } from './languages/romance.js';
import { CHINESE } from './languages/chinese.js';
import { analogyMaker, wordsMaker } from './languages/vocab.js';
import { verbsMaker } from './languages/verbs.js';
import { hanziMaker } from './languages/zh.js';
import { GERMAN } from './languages/de.js';
import { TURKISH } from './languages/tr.js';
import { deVerbsMaker } from './languages/de-verbs.js';
import { trVerbsMaker } from './languages/tr-verbs.js';
import { xWordsMaker } from './languages/xwords.js';
import { jaBankMaker, jaWordsMaker, kanaMaker, kanjiMaker } from './languages/ja.js';
import { hangulMaker, koBankMaker, koWordsMaker } from './languages/ko.js';
import { RKI_BANK } from './languages/rki-bank.js';
import { RKI_VERBS } from './languages/rki-verbs.js';
import { ITALIAN_BANK } from './languages/it-bank.js';
import { IT_VERB_ROWS } from './languages/it-verbs.js';
import { ruitWordsMaker } from './languages/ruit-words.js';
import { comparisonMaker, grammarMaker, irregularMaker } from './english/gen.js';
import { kazakhstanMaker, recordsMaker, worldMaker } from './science/geo.js';
import { compoundsMaker, elementsMaker } from './science/chem-gen.js';
import { biologyMaker, geneticsMaker } from './science/bio-gen.js';
import { codeTermsMaker, informaticsFactsMaker, physicsFactsMaker } from './science/facts-gen.js';
import { bankMaker } from './bank.js';
import { PHYSICS_THEORY, dynamics, electricity, energy, heat, kinematics, waves } from './science/physics.js';
import { CHEMISTRY_THEORY, molarMass, moles } from './science/chemistry.js';
import { BIOLOGY, GEOGRAPHY } from './science/bio-geo.js';
import { HISTORY_KZ, HISTORY_REGION, HISTORY_RU, HISTORY_WORLD } from './humanities/history.js';
import { ANALOGIES, RUSSIAN, SENTENCES, SOCIAL } from './humanities/language.js';
import { LITERACY } from './humanities/literacy.js';
import { LITERACY_MORE } from './humanities/literacy-more.js';
import { timelineMaker } from './humanities/history-gen.js';
import { powersMaker, russianMaker, socialMaker } from './humanities/ru-gen.js';
import { INFORMATICS_THEORY, algorithms, infoUnits, logic as boolLogic, numberSystems } from './science/informatics.js';
import { counting, diophantine, divisors, factorials, lastDigit, logic, paths, pigeonhole, remainders, shapes, sums, tournaments } from './olymp.js';

const topic = (pool, name, make) => ({ pool, name, make });
/** Задания английского - в выбранном варианте: британское или американское написание. */
const enV = (make) => (ctx, key) => variantize(make(ctx, key), getEnVariant());
/** Озвучка ответа после задания (русский как иностранный, итальянский): предложение с вставленным ответом. */
const voiced = (make, lang) => (ctx, key) => Object.assign(make(ctx, key), { voice: { lang } });

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
  // 1 класс
  'm.num10': topic('math', L('Numbers 1 to 10', 'Числа от 1 до 10', '1-ден 10-ға дейінгі сандар'), num10),
  'm.cmp': topic('math', L('Comparing numbers', 'Сравнение чисел', 'Сандарды салыстыру'), compare),
  'm.add10': topic('math', L('Adding and subtracting within 10', 'Сложение и вычитание в пределах 10', '10 көлеміндегі қосу және азайту'), add10),
  'm.num20': topic('math', L('Numbers 11 to 20: tens and ones', 'Числа от 11 до 20: десяток и единицы', '11-ден 20-ға дейінгі сандар: ондық және бірлік'), num20),
  'm.add20': topic('math', L('Adding and subtracting within 20', 'Сложение и вычитание в пределах 20', '20 көлеміндегі қосу және азайту'), add20),
  'm.word1': topic('math', L('One-step word problems', 'Задачи в одно действие', 'Бір амалды есептер'), word1),
  'm.len': topic('math', L('Length: centimetre and ruler', 'Длина: сантиметр, линейка', 'Ұзындық: сантиметр, сызғыш'), length1),
  'm.shapes': topic('math', L('Shapes and lines', 'Геометрические фигуры', 'Геометриялық фигуралар'), shapes1),
  'm.orient': topic('math', L('Left, right, above, below', 'Ориентация: левее, правее, выше, ниже', 'Бағдарлау: сол, оң, жоғары, төмен'), orient),
  'm.pattern': topic('math', L('Patterns and sequences', 'Закономерности и последовательности', 'Заңдылықтар мен тізбектер'), pattern1),
  'm.money1': topic('math', L('Money: coins and notes', 'Деньги: монеты и купюры', 'Ақша: монеталар мен банкноттар'), money1),
  'm.clock1': topic('math', L('Time: clock and days of the week', 'Время: часы, дни недели', 'Уақыт: сағат, апта күндері'), clock1),
  'm.count100': topic('math', L('Counting to 100', 'Счёт до 100', '100-ге дейін санау'), count100),
  // 2 класс
  'm.place100': topic('math', L('Numbers to 100: place value', 'Числа до 100, разряды', '100-ге дейінгі сандар, разрядтар'), place100),
  'm.add2d': topic('math', L('Mental addition and subtraction of two-digit numbers', 'Сложение и вычитание двузначных чисел устно', 'Екі таңбалы сандарды ауызша қосу және азайту'), add2d),
  'm.col': topic('math', L('Column addition and subtraction', 'Сложение и вычитание столбиком', 'Бағанмен қосу және азайту'), col),
  'm.mulmean': topic('math', L('What multiplication and division mean', 'Смысл умножения и деления', 'Көбейту мен бөлудің мағынасы'), mulMean),
  'm.tab23': topic('math', L('Times tables for 2 and 3', 'Таблица умножения на 2 и 3', '2 мен 3-ке көбейту кестесі'), tab23),
  'm.laws': topic('math', L('Commutative and associative laws', 'Переместительный и сочетательный законы', 'Ауыстырымдылық және терімділік заңдары'), laws),
  'm.ord2': topic('math', L('Brackets and order of operations', 'Скобки и порядок действий', 'Жақшалар және амалдар реті'), order2),
  'm.eq1': topic('math', L('Simple equations', 'Простые уравнения', 'Қарапайым теңдеулер'), eq1),
  'm.units': topic('math', L('Units of length: mm, cm, dm, m', 'Единицы длины: мм, см, дм, м', 'Ұзындық бірліктері: мм, см, дм, м'), units2),
  'm.time2': topic('math', L('Time: hours, minutes, calendar', 'Время: час, минута, календарь', 'Уақыт: сағат, минут, күнтізбе'), time2),
  'm.perim': topic('math', L('Perimeter of a polygon', 'Периметр многоугольника', 'Көпбұрыштың периметрі'), perim),
  'm.rect': topic('math', L('Right angle, rectangle and square', 'Прямой угол, прямоугольник и квадрат', 'Тік бұрыш, тіктөртбұрыш және шаршы'), rightAngle),
  'm.word2': topic('math', L('Two-step word problems', 'Задачи в два действия', 'Екі амалды есептер'), word2),
  'm.change': topic('math', L('Money: cost and change', 'Деньги: стоимость покупки и сдача', 'Ақша: сатып алу құны және қайтарым'), change2),
  // 3 класс
  'm.remdiv': topic('math', L('Division with a remainder', 'Деление с остатком', 'Қалдықпен бөлу'), remDiv),
  'm.mulbig': topic('math', L('Multiplication and division beyond the table', 'Внетабличное умножение и деление', 'Кестеден тыс көбейту және бөлу'), mulBig),
  'm.num1000': topic('math', L('Numbers to 1000', 'Числа до 1000', '1000-ға дейінгі сандар'), num1000),
  'm.col3': topic('math', L('Written addition and subtraction of three-digit numbers', 'Письменное сложение и вычитание трёхзначных чисел', 'Үш таңбалы сандарды жазбаша қосу және азайту'), col3),
  'm.colmul': topic('math', L('Column multiplication and division by a one-digit number', 'Умножение и деление на однозначное число столбиком', 'Бір таңбалы санға бағанмен көбейту және бөлу'), colMul),
  'm.parts': topic('math', L('Parts: half, third, quarter', 'Доли: половина, треть, четверть', 'Үлестер: жарты, үштен бір, төрттен бір'), parts),
  'm.area3': topic('math', L('Area: cm², dm², m²', 'Площадь: см², дм², м²', 'Аудан: см², дм², м²'), area3),
  'm.mass': topic('math', L('Mass: grams and kilograms', 'Масса: грамм, килограмм', 'Масса: грамм, килограмм'), mass),
  'm.time3': topic('math', L('Time: year, month, day', 'Время: год, месяц, сутки', 'Уақыт: жыл, ай, тәулік'), time3),
  'm.eq3': topic('math', L('Equations with multiplication and division', 'Уравнения с умножением и делением', 'Көбейту және бөлу амалдары бар теңдеулер'), eq3),
  'm.price': topic('math', L('Price, quantity and cost', 'Задачи на цену, количество и стоимость', 'Баға, саны және құн есептері'), price),
  'm.circle3': topic('math', L('Circle: radius and diameter', 'Окружность и круг, радиус, диаметр', 'Шеңбер мен дөңгелек, радиус, диаметр'), circle3),
  // 4 класс
  'm.bignum': topic('math', L('Multi-digit numbers: thousands and millions', 'Многозначные числа: классы тысяч и миллионов', 'Көп таңбалы сандар: мыңдар және миллиондар класы'), bigNum),
  'm.addbig': topic('math', L('Adding and subtracting multi-digit numbers', 'Сложение и вычитание многозначных чисел', 'Көп таңбалы сандарды қосу және азайту'), addBig),
  'm.mul2d': topic('math', L('Multiplying and dividing by two- and three-digit numbers', 'Умножение и деление на двузначное и трёхзначное число', 'Екі және үш таңбалы санға көбейту және бөлу'), mul2d),
  'm.speed': topic('math', L('Speed, time, distance', 'Скорость, время, расстояние', 'Жылдамдық, уақыт, қашықтық'), speed),
  'm.motion4': topic('math', L('Moving towards each other and catching up', 'Движение навстречу и вдогонку', 'Қарсы қозғалыс және қуып жету'), motion4),
  'm.partof': topic('math', L('A fraction of a number and a number from its fraction', 'Нахождение части числа и числа по части', 'Санның бөлігін және бөлігі бойынша санды табу'), partOf),
  'm.units4': topic('math', L('Units of mass and area: t, c, km², ha', 'Единицы массы и площади: тонна, центнер, км², гектар', 'Масса және аудан бірліктері: тонна, центнер, км², гектар'), units4),
  'm.box': topic('math', L('Rectangular box and cube, volume', 'Прямоугольный параллелепипед и куб, объём', 'Тікбұрышты параллелепипед және текше, көлем'), box),
  'm.eq2step': topic('math', L('Two-step equations', 'Уравнения в два действия', 'Екі амалды теңдеулер'), eq2step),
  'm.chart': topic('math', L('Tables and charts', 'Таблицы и диаграммы', 'Кестелер мен диаграммалар'), chart),
  'm.seq4': topic('math', L('Number patterns (grade 4)', 'Числовые закономерности (4 класс)', 'Сандық заңдылықтар (4-сынып)'), seq4),
  'm.roman': topic('math', L('Roman numerals', 'Римские цифры', 'Рим цифрлары'), romanQ),
  // 5 класс
  'm.ray': topic('math', L('Scales and the coordinate ray', 'Натуральные числа и шкалы, координатный луч', 'Натурал сандар мен шкалалар, координаталық сәуле'), ray),
  'm.round': topic('math', L('Rounding whole numbers', 'Округление натуральных чисел', 'Натурал сандарды дөңгелектеу'), roundNat),
  'm.sqcube': topic('math', L('Powers: square and cube', 'Степень числа, квадрат и куб', 'Санның дәрежесі, квадрат және куб'), sqCube),
  'm.props': topic('math', L('Properties of addition and multiplication', 'Свойства сложения и умножения, упрощение выражений', 'Қосу мен көбейтудің қасиеттері, өрнектерді ықшамдау'), props),
  'm.eq5': topic('math', L('Equations (grade 5)', 'Уравнения (5 класс)', 'Теңдеулер (5-сынып)'), eq5),
  'm.formula': topic('math', L('Formulas: area, volume, distance', 'Формулы площади, объёма и пути', 'Аудан, көлем және жол формулалары'), formula),
  'm.mixed': topic('math', L('Mixed numbers', 'Смешанные числа', 'Аралас сандар'), mixedNum),
  'm.rounddec': topic('math', L('Rounding decimals', 'Округление десятичных дробей', 'Ондық бөлшектерді дөңгелектеу'), roundDec),
  'm.tri': topic('math', L('Types of triangles', 'Виды треугольников', 'Үшбұрыштың түрлері'), triKinds),
  'm.prime': topic('math', L('Prime and composite numbers', 'Простые и составные числа, разложение на множители', 'Жай және құрама сандар, көбейткіштерге жіктеу'), primes),
  // 6 класс
  'm.fracadd': topic('math', L('Adding and subtracting fractions with different denominators', 'Сложение и вычитание дробей с разными знаменателями', 'Бөлімдері әртүрлі бөлшектерді қосу және азайту'), fracAdd),
  'm.fracmul': topic('math', L('Multiplying and dividing fractions', 'Умножение и деление дробей', 'Бөлшектерді көбейту және бөлу'), fracMul),
  'm.scale': topic('math', L('Map scale', 'Масштаб', 'Масштаб'), scale),
  'm.circle': topic('math', L('Circumference and area of a circle', 'Длина окружности и площадь круга', 'Шеңбердің ұзындығы және дөңгелектің ауданы'), circle6),
  'm.modulus': topic('math', L('Absolute value', 'Модуль числа', 'Санның модулі'), modulus),
  'm.rational': topic('math', L('Operations with rational numbers', 'Действия с рациональными числами', 'Рационал сандарға амалдар қолдану'), rational),
  'm.coord': topic('math', L('The coordinate plane', 'Координатная плоскость', 'Координаталық жазықтық'), coord),
  'm.brackets': topic('math', L('Expanding brackets and like terms', 'Раскрытие скобок, подобные слагаемые', 'Жақшаны ашу, ұқсас қосылғыштар'), brackets),
  'm.lines': topic('math', L('Parallel and perpendicular lines', 'Перпендикулярные и параллельные прямые', 'Перпендикуляр және параллель түзулер'), lines),
  'm.diagram': topic('math', L('Bar and pie charts', 'Диаграммы: столбчатые и круговые', 'Диаграммалар: бағанды және дөңгелек'), diagram),
  'm.pcttask': topic('math', L('Percentage problems', 'Задачи на проценты', 'Пайызға берілген есептер'), pctTask),
  'm.sym': topic('math', L('Line and point symmetry', 'Осевая и центральная симметрия', 'Осьтік және центрлік симметрия'), symmetry),

  // ----- Английский язык -----
  'e.basics': topic('english', L('Basics: to be, pronouns, nouns', 'Основы: to be, местоимения, существительные', 'Негіздер: to be, есімдіктер, зат есімдер'), enV(englishMaker('e.basics'))),
  'e.tenses': topic('english', L('Tenses', 'Времена', 'Шақтар'), enV(englishMaker('e.tenses'))),
  'e.det': topic('english', L('Articles, quantity, comparison', 'Артикли, количество, сравнение', 'Артикльдер, мөлшер, салыстыру'), enV(englishMaker('e.det'))),
  'e.prep': topic('english', L('Prepositions', 'Предлоги', 'Предлогтар'), enV(englishMaker('e.prep'))),
  'e.modal': topic('english', L('Modal verbs', 'Модальные глаголы', 'Модаль етістіктер'), enV(englishMaker('e.modal'))),
  'e.struct': topic('english', L('Conditionals, passive, verb patterns', 'Условные, пассив, формы глагола', 'Шартты сөйлемдер, ырықсыз етіс, етістік түрлері'), enV(englishMaker('e.struct'))),
  'e.adv': topic('english', L('Advanced structures', 'Продвинутые конструкции', 'Күрделі құрылымдар'), enV(englishMaker('e.adv'))),
  'e.vocab': topic('english', L('Vocabulary', 'Лексика', 'Лексика'), enV(englishMaker('e.vocab'))),
  'e.phrasal': topic('english', L('Phrasal verbs and idioms', 'Фразовые глаголы и идиомы', 'Фразалық етістіктер мен идиомалар'), enV(englishMaker('e.phrasal'))),
  'e.wordform': topic('english', L('Word formation', 'Словообразование', 'Сөзжасам'), enV(englishMaker('e.wordform'))),
  'e.words': topic('english', L('Words', 'Слова', 'Сөздер'), enV(wordsMaker('e.words', 'en'))),
  'e.gram': topic('english', L('Tenses in sentences', 'Времена в предложениях', 'Сөйлемдегі шақтар'), enV(grammarMaker('e.gram'))),
  'e.irreg': topic('english', L('Irregular verbs', 'Неправильные глаголы', 'Бұрыс етістіктер'), enV(irregularMaker('e.irreg'))),
  'e.ukus': topic('english', L('British and American English', 'Британский и американский английский', 'Британ және американ ағылшыны'), ukusMaker('e.ukus')),
  'e.comp': topic('english', L('Comparison of adjectives', 'Степени сравнения', 'Сын есімнің шырайлары'), enV(comparisonMaker('e.comp'))),

  // ----- Физика -----
  'p.kin': topic('physics', L('Kinematics', 'Кинематика', 'Кинематика'), kinematics),
  'p.dyn': topic('physics', L('Forces, pressure, density', 'Силы, давление, плотность', 'Күштер, қысым, тығыздық'), dynamics),
  'p.energy': topic('physics', L('Work, energy, power', 'Работа, энергия, мощность', 'Жұмыс, энергия, қуат'), energy),
  'p.elec': topic('physics', L('Electricity', 'Электричество', 'Электр'), electricity),
  'p.heat': topic('physics', L('Heat', 'Тепловые явления', 'Жылу құбылыстары'), heat),
  'p.wave': topic('physics', L('Oscillations, waves, optics', 'Колебания, волны, оптика', 'Тербелістер, толқындар, оптика'), waves),
  'p.theory': topic('physics', L('Laws and units', 'Законы и единицы', 'Заңдар мен бірліктер'), bankMaker('p.theory', PHYSICS_THEORY, { tf: true })),
  'p.facts': topic('physics', L('Units, formulas, scientists', 'Единицы, формулы, учёные', 'Бірліктер, формулалар, ғалымдар'), physicsFactsMaker('p.facts')),

  // ----- Химия -----
  'c.molar': topic('chemistry', L('Molar mass and mass fraction', 'Молярная масса и массовая доля', 'Молярлық масса және массалық үлес'), molarMass),
  'c.mole': topic('chemistry', L('Amount of substance and reactions', 'Количество вещества и расчёты по уравнениям', 'Зат мөлшері және теңдеу бойынша есептеулер'), moles),
  'c.theory': topic('chemistry', L('Substances and reactions', 'Вещества и реакции', 'Заттар мен реакциялар'), bankMaker('c.theory', CHEMISTRY_THEORY, { tf: true })),
  'c.elem': topic('chemistry', L('The periodic table', 'Таблица Менделеева', 'Менделеев кестесі'), elementsMaker('c.elem')),
  'c.salts': topic('chemistry', L('Formulas and names of compounds', 'Формулы и названия веществ', 'Заттардың формулалары мен атаулары'), compoundsMaker('c.salts')),

  // ----- Информатика -----
  'i.num': topic('informatics', L('Number systems', 'Системы счисления', 'Санау жүйелері'), numberSystems),
  'i.units': topic('informatics', L('Measuring information', 'Измерение информации', 'Ақпаратты өлшеу'), infoUnits),
  'i.logic': topic('informatics', L('Logic', 'Логика', 'Логика'), boolLogic),
  'i.algo': topic('informatics', L('Algorithms', 'Алгоритмы', 'Алгоритмдер'), algorithms),
  'i.theory': topic('informatics', L('Computers and networks', 'Компьютер и сети', 'Компьютер және желілер'), bankMaker('i.theory', INFORMATICS_THEORY, { tf: true })),
  'i.facts': topic('informatics', L('Devices, files, terms', 'Устройства, файлы, термины', 'Құрылғылар, файлдар, терминдер'), informaticsFactsMaker('i.facts')),

  // ----- Биология и география -----
  'b.bank': topic('biology', L('Biology', 'Биология', 'Биология'), bankMaker('b.bank', BIOLOGY, { tf: true })),
  'b.animals': topic('biology', L('Classes of animals', 'Классы животных', 'Жануарлар кластары'), biologyMaker('b.animals', 'animals')),
  'b.body': topic('biology', L('The human body', 'Организм человека', 'Адам ағзасы'), biologyMaker('b.body', 'body')),
  'b.gen': topic('biology', L('Genetics problems', 'Задачи по генетике', 'Генетика есептері'), geneticsMaker('b.gen')),
  'b.plants': topic('biology', L('Plants', 'Растения', 'Өсімдіктер'), biologyMaker('b.plants', 'plants')),
  'b.eco': topic('biology', L('Ecology', 'Экология', 'Экология'), biologyMaker('b.eco', 'eco')),
  'b.sci': topic('biology', L('Great biologists', 'Великие биологи', 'Ұлы биологтар'), biologyMaker('b.sci', 'sci')),
  'b.cell': topic('biology', L('The cell and great biologists', 'Клетка и великие биологи', 'Жасуша және ұлы биологтар'), biologyMaker('b.cell', 'cell')),
  'g.bank': topic('geography', L('Geography', 'География', 'География'), bankMaker('g.bank', GEOGRAPHY, { tf: true })),
  'g.world': topic('geography', L('Countries and capitals', 'Страны и столицы', 'Елдер мен астаналар'), worldMaker('g.world')),
  'g.records': topic('geography', L('Mountains, rivers, lakes, countries', 'Горы, реки, озёра, страны', 'Таулар, өзендер, көлдер, елдер'), recordsMaker('g.records')),
  'g.kz': topic('geography', L('Geography of Kazakhstan', 'География Казахстана', 'Қазақстан географиясы'), kazakhstanMaker('g.kz')),

  // ----- История и обществознание -----
  'h.kz': topic('history', L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'), bankMaker('h.kz', HISTORY_KZ, { tf: true })),
  'h.world': topic('history', L('World history', 'Всемирная история', 'Дүниежүзі тарихы'), bankMaker('h.world', HISTORY_WORLD, { tf: true })),
  'h.ru': topic('history', L('History of Russia', 'История России', 'Ресей тарихы'), bankMaker('h.ru', HISTORY_RU, { tf: true })),
  'h.uz': topic('history', L('History of Uzbekistan', 'История Узбекистана', 'Өзбекстан тарихы'), bankMaker('h.uz', HISTORY_REGION.uz, { tf: true })),
  'h.kg': topic('history', L('History of Kyrgyzstan', 'История Кыргызстана', 'Қырғызстан тарихы'), bankMaker('h.kg', HISTORY_REGION.kg, { tf: true })),
  'h.tj': topic('history', L('History of Tajikistan', 'История Таджикистана', 'Тәжікстан тарихы'), bankMaker('h.tj', HISTORY_REGION.tj, { tf: true })),
  'h.az': topic('history', L('History of Azerbaijan', 'История Азербайджана', 'Әзербайжан тарихы'), bankMaker('h.az', HISTORY_REGION.az, { tf: true })),
  'h.am': topic('history', L('History of Armenia', 'История Армении', 'Армения тарихы'), bankMaker('h.am', HISTORY_REGION.am, { tf: true })),
  'h.by': topic('history', L('History of Belarus', 'История Беларуси', 'Беларусь тарихы'), bankMaker('h.by', HISTORY_REGION.by, { tf: true })),
  'h.md': topic('history', L('History of Moldova', 'История Молдовы', 'Молдова тарихы'), bankMaker('h.md', HISTORY_REGION.md, { tf: true })),
  's.bank': topic('social', L('Social studies', 'Обществознание', 'Қоғамтану'), bankMaker('s.bank', SOCIAL, { tf: true })),
  's.powers': topic('social', L('Branches of power and spheres of society', 'Ветви власти и сферы общества', 'Билік тармақтары мен қоғам салалары'), powersMaker('s.powers')),
  's.terms': topic('social', L('Terms of social studies', 'Термины обществознания', 'Қоғамтану терминдері'), socialMaker('s.terms')),
  'h.kzt': topic('history', L('Kazakhstan: dates and people', 'Казахстан: даты и личности', 'Қазақстан: даталар мен тұлғалар'), timelineMaker('h.kzt', 'kz')),
  'h.wt': topic('history', L('World history: dates and people', 'Всемирная история: даты и личности', 'Дүниежүзі тарихы: даталар мен тұлғалар'), timelineMaker('h.wt', 'world')),
  'h.rut': topic('history', L('Russia: dates', 'Россия: даты', 'Ресей: даталар'), timelineMaker('h.rut', 'ru')),
  'h.uzt': topic('history', L('Uzbekistan: dates and people', 'Узбекистан: даты и личности', 'Өзбекстан: даталар мен тұлғалар'), timelineMaker('h.uzt', 'uz')),
  'h.kgt': topic('history', L('Kyrgyzstan: dates and people', 'Кыргызстан: даты и личности', 'Қырғызстан: даталар мен тұлғалар'), timelineMaker('h.kgt', 'kg')),
  'h.tjt': topic('history', L('Tajikistan: dates and people', 'Таджикистан: даты и личности', 'Тәжікстан: даталар мен тұлғалар'), timelineMaker('h.tjt', 'tj')),
  'h.azt': topic('history', L('Azerbaijan: dates and people', 'Азербайджан: даты и личности', 'Әзербайжан: даталар мен тұлғалар'), timelineMaker('h.azt', 'az')),
  'h.amt': topic('history', L('Armenia: dates and people', 'Армения: даты и личности', 'Армения: даталар мен тұлғалар'), timelineMaker('h.amt', 'am')),
  'h.byt': topic('history', L('Belarus: dates and people', 'Беларусь: даты и личности', 'Беларусь: даталар мен тұлғалар'), timelineMaker('h.byt', 'by')),
  'h.mdt': topic('history', L('Moldova: dates and people', 'Молдова: даты и личности', 'Молдова: даталар мен тұлғалар'), timelineMaker('h.mdt', 'md')),

  // ----- Русский язык, логика и чтение на языке интерфейса -----
  'l.ru': topic('russian', L('Russian language', 'Русский язык', 'Орыс тілі'), bankMaker('l.ru', RUSSIAN, { tf: true })),
  'l.rugen': topic('russian', L('Stress and spelling', 'Ударения и словарные слова', 'Екпін және сөздік сөздер'), russianMaker('l.rugen')),
  'l.analogy': topic('russian', L('Analogies', 'Аналогии', 'Аналогиялар'), bankMaker('l.analogy', ANALOGIES)),
  'l.analogy2': topic('russian', L('Word analogies', 'Аналогии слов', 'Сөз аналогиялары'), analogyMaker('l.analogy2')),
  'l.complete': topic('russian', L('Sentence completion', 'Дополнение предложений', 'Сөйлемді толықтыру'), bankMaker('l.complete', SENTENCES)),
  'r.literacy': topic('reading', L('Reading literacy', 'Грамотность чтения', 'Оқу сауаттылығы'), readingMaker('r.literacy', [...LITERACY, ...LITERACY_MORE])),

  // ----- Чтение -----
  'r.ielts': topic('reading', L('IELTS Reading', 'IELTS: чтение', 'IELTS: оқылым'), readingMaker('r.ielts', 'ielts')),
  'r.toefl': topic('reading', L('TOEFL Reading', 'TOEFL: чтение', 'TOEFL: оқылым'), readingMaker('r.toefl', 'toefl')),
  'li.ielts': topic('english', L('IELTS Listening', 'IELTS: аудирование', 'IELTS: тыңдалым'), listeningMaker('li.ielts', 'ielts')),
  'li.toefl': topic('english', L('TOEFL Listening', 'TOEFL: аудирование', 'TOEFL: тыңдалым'), listeningMaker('li.toefl', 'toefl')),

  // ----- Другие иностранные языки -----
  'es.bank': topic('spanish', L('Spanish grammar and vocabulary', 'Испанский: грамматика и лексика', 'Испан тілі: грамматика және лексика'), languageMaker('es.bank', SPANISH)),
  'fr.bank': topic('french', L('French grammar and vocabulary', 'Французский: грамматика и лексика', 'Француз тілі: грамматика және лексика'), languageMaker('fr.bank', FRENCH)),
  'zh.bank': topic('chinese', L('Chinese words and grammar', 'Китайский: слова и грамматика', 'Қытай тілі: сөздер мен грамматика'), languageMaker('zh.bank', CHINESE)),
  'es.words': topic('spanish', L('Spanish words', 'Испанский: слова', 'Испан тілі: сөздер'), wordsMaker('es.words', 'es')),
  'es.verbs': topic('spanish', L('Spanish verb conjugation', 'Испанский: спряжение глаголов', 'Испан тілі: етістіктің жіктелуі'), verbsMaker('es.verbs', 'es')),
  'fr.words': topic('french', L('French words', 'Французский: слова', 'Француз тілі: сөздер'), wordsMaker('fr.words', 'fr')),
  'fr.verbs': topic('french', L('French verb conjugation', 'Французский: спряжение глаголов', 'Француз тілі: етістіктің жіктелуі'), verbsMaker('fr.verbs', 'fr')),
  'zh.words': topic('chinese', L('Chinese characters and pinyin', 'Китайский: иероглифы и пиньинь', 'Қытай тілі: иероглифтер мен пиньинь'), hanziMaker('zh.words')),
  'de.bank': topic('german', L('German grammar', 'Немецкий: грамматика', 'Неміс тілі: грамматика'), languageMaker('de.bank', GERMAN)),
  'de.words': topic('german', L('German words and articles', 'Немецкий: слова и артикли', 'Неміс тілі: сөздер мен артикльдер'), xWordsMaker('de.words', 'de')),
  'de.verbs': topic('german', L('German verb conjugation', 'Немецкий: спряжение глаголов', 'Неміс тілі: етістіктің жіктелуі'), deVerbsMaker('de.verbs')),
  'tr.bank': topic('turkish', L('Turkish grammar', 'Турецкий: грамматика', 'Түрік тілі: грамматика'), languageMaker('tr.bank', TURKISH)),
  'tr.words': topic('turkish', L('Turkish words and cases', 'Турецкий: слова и падежи', 'Түрік тілі: сөздер мен септіктер'), xWordsMaker('tr.words', 'tr')),
  'tr.verbs': topic('turkish', L('Turkish verb conjugation', 'Турецкий: спряжение глаголов', 'Түрік тілі: етістіктің жіктелуі'), trVerbsMaker('tr.verbs')),
  'ja.kana': topic('japanese', L('Japanese: hiragana and katakana', 'Японский: хирагана и катакана', 'Жапон тілі: хирагана мен катакана'), kanaMaker('ja.kana')),
  'ja.words': topic('japanese', L('Japanese words', 'Японский: слова', 'Жапон тілі: сөздер'), jaWordsMaker('ja.words')),
  'ja.kanji': topic('japanese', L('Japanese kanji', 'Японский: иероглифы кандзи', 'Жапон тілі: кандзи иероглифтері'), kanjiMaker('ja.kanji')),
  'ja.bank': topic('japanese', L('Japanese grammar', 'Японский: грамматика', 'Жапон тілі: грамматика'), jaBankMaker('ja.bank')),
  'ko.hangul': topic('korean', L('Korean: reading hangul', 'Корейский: чтение хангыля', 'Корей тілі: хангыльді оқу'), hangulMaker('ko.hangul')),
  'ko.words': topic('korean', L('Korean words', 'Корейский: слова', 'Корей тілі: сөздер'), koWordsMaker('ko.words')),
  'ko.bank': topic('korean', L('Korean grammar', 'Корейский: грамматика', 'Корей тілі: грамматика'), koBankMaker('ko.bank')),
  'rki.bank': topic('rki', L('Russian as a foreign language: grammar', 'Русский как иностранный: грамматика', 'Орыс тілі шет тілі ретінде: грамматика'), voiced(languageMaker('rki.bank', RKI_BANK), 'ru')),
  'rki.words': topic('rki', L('Russian as a foreign language: words', 'Русский как иностранный: слова', 'Орыс тілі шет тілі ретінде: сөздер'), ruitWordsMaker('rki.words', 'ru')),
  'rki.verbs': topic('rki', L('Russian as a foreign language: verbs and aspect', 'Русский как иностранный: глаголы и вид', 'Орыс тілі шет тілі ретінде: етістіктер және етістік түрі'), voiced(languageMaker('rki.verbs', RKI_VERBS), 'ru')),
  'it.bank': topic('italian', L('Italian grammar', 'Итальянский: грамматика', 'Итальян тілі: грамматика'), voiced(languageMaker('it.bank', ITALIAN_BANK), 'it')),
  'it.words': topic('italian', L('Italian words and articles', 'Итальянский: слова и артикли', 'Итальян тілі: сөздер мен артикльдер'), ruitWordsMaker('it.words', 'it')),
  'it.verbs': topic('italian', L('Italian verb conjugation', 'Итальянский: спряжение глаголов', 'Итальян тілі: етістіктің жіктелуі'), voiced(languageMaker('it.verbs', IT_VERB_ROWS), 'it')),

  // ----- Программирование -----
  'code.theory': topic('code', L('Programming basics', 'Основы программирования', 'Бағдарламалау негіздері'), bankMaker('code.theory', CODE_THEORY, { tf: true })),
  'code.terms': topic('code', L('Programming terms', 'Понятия программирования', 'Бағдарламалау ұғымдары'), codeTermsMaker('code.terms')),
  ...Object.fromEntries(
    Object.entries(CODE_LANGS).flatMap(([lang, { name }]) =>
      Object.entries(codeTopics(lang)).map(([id, make]) => {
        const base = CODE_TOPIC_NAMES[id.split('.')[1]];
        return [id, topic('code', L(`${name}: ${base.en.toLowerCase()}`, `${name}: ${base.ru.toLowerCase()}`, `${name}: ${base.kk.toLowerCase()}`), make)];
      }),
    ),
  ),

  // ----- Олимпиадная математика -----
  'o.count': topic('olymp', L('Counting and inclusion-exclusion', 'Подсчёт и формула включений-исключений', 'Санау және қосу-алу формуласы'), counting),
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
  spanish: { icon: 'ES', color: '#dc2626' },
  french: { icon: 'FR', color: '#2563eb' },
  chinese: { icon: '中', color: '#b91c1c' },
  german: { icon: 'DE', color: '#ca8a04' },
  turkish: { icon: 'TR', color: '#e30a17' },
  japanese: { icon: 'JA', color: '#be123c' },
  korean: { icon: 'KO', color: '#0369a1' },
  rki: { icon: 'RU', color: '#1d4ed8' },
  italian: { icon: 'IT', color: '#15803d' },
  code: { icon: '</>', color: '#0f172a' },
};

export const topicIds = (pool) => Object.keys(TOPICS).filter((id) => !pool || TOPICS[id].pool === pool);

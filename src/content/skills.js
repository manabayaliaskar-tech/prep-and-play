// Структура цифрового SAT: 2 раздела → 8 доменов → навыки.
// Совпадает с официальной спецификацией College Board (названия доменов и навыков).

export const SECTIONS = {
  rw: { icon: '📖', name: { en: 'Reading and Writing', ru: 'Чтение и письмо', kk: 'Оқу және жазу' } },
  math: { icon: '📐', name: { en: 'Math', ru: 'Математика', kk: 'Математика' } },
};

export const DOMAINS = {
  craft: {
    section: 'rw',
    icon: '🔎',
    color: '#8b5cf6',
    name: { en: 'Craft and Structure', ru: 'Лексика и структура', kk: 'Лексика және құрылым' },
  },
  info: {
    section: 'rw',
    icon: '💡',
    color: '#0ea5e9',
    name: { en: 'Information and Ideas', ru: 'Информация и идеи', kk: 'Ақпарат және идеялар' },
  },
  conventions: {
    section: 'rw',
    icon: '✍️',
    color: '#f43f5e',
    name: { en: 'Standard English Conventions', ru: 'Грамматика и пунктуация', kk: 'Грамматика және тыныс белгілері' },
  },
  expression: {
    section: 'rw',
    icon: '🔗',
    color: '#f59e0b',
    name: { en: 'Expression of Ideas', ru: 'Выражение идей', kk: 'Ойды жеткізу' },
  },
  algebra: {
    section: 'math',
    icon: '🧮',
    color: '#22c55e',
    name: { en: 'Algebra', ru: 'Алгебра', kk: 'Алгебра' },
  },
  advanced: {
    section: 'math',
    icon: '🚀',
    color: '#6366f1',
    name: { en: 'Advanced Math', ru: 'Продвинутая математика', kk: 'Күрделі математика' },
  },
  data: {
    section: 'math',
    icon: '📊',
    color: '#ec4899',
    name: {
      en: 'Problem-Solving and Data Analysis',
      ru: 'Задачи и анализ данных',
      kk: 'Есептер және деректерді талдау',
    },
  },
  geometry: {
    section: 'math',
    icon: '📐',
    color: '#14b8a6',
    name: { en: 'Geometry and Trigonometry', ru: 'Геометрия и тригонометрия', kk: 'Геометрия және тригонометрия' },
  },
};

const s = (domain, en, ru, kk) => ({ domain, name: { en, ru, kk } });

export const SKILLS = {
  // Reading and Writing
  words: s('craft', 'Words in Context', 'Слова в контексте', 'Контекстегі сөздер'),
  structure: s('craft', 'Text Structure and Purpose', 'Структура и цель текста', 'Мәтіннің құрылымы мен мақсаты'),
  cross: s('craft', 'Cross-Text Connections', 'Связь двух текстов', 'Екі мәтін арасындағы байланыс'),
  central: s('info', 'Central Ideas and Details', 'Главная идея и детали', 'Негізгі ой және детальдар'),
  evidence: s('info', 'Command of Evidence: Textual', 'Доказательства из текста', 'Мәтіннен дәлел'),
  quant: s('info', 'Command of Evidence: Quantitative', 'Доказательства из данных', 'Деректерден дәлел'),
  inference: s('info', 'Inferences', 'Логические выводы', 'Логикалық қорытынды'),
  boundaries: s('conventions', 'Boundaries', 'Границы предложений и пунктуация', 'Сөйлем шекаралары және тыныс белгілері'),
  fss: s('conventions', 'Form, Structure, and Sense', 'Форма и согласование', 'Сөз формасы және үйлесім'),
  transitions: s('expression', 'Transitions', 'Связующие слова', 'Байланыстырушы сөздер'),
  synthesis: s('expression', 'Rhetorical Synthesis', 'Работа с заметками', 'Жазбалармен жұмыс'),
  // Math
  'lin-eq': s('algebra', 'Linear equations in one variable', 'Линейные уравнения', 'Сызықтық теңдеулер'),
  'lin-func': s('algebra', 'Linear functions', 'Линейные функции', 'Сызықтық функциялар'),
  'lin-model': s('algebra', 'Linear models in context', 'Линейные модели в задачах', 'Есептердегі сызықтық модельдер'),
  systems: s('algebra', 'Systems of linear equations', 'Системы уравнений', 'Теңдеулер жүйесі'),
  inequalities: s('algebra', 'Linear inequalities', 'Линейные неравенства', 'Сызықтық теңсіздіктер'),
  quadratics: s('advanced', 'Quadratic equations', 'Квадратные уравнения', 'Квадрат теңдеулер'),
  equivalent: s('advanced', 'Equivalent expressions', 'Равносильные выражения', 'Тепе-тең өрнектер'),
  exponential: s('advanced', 'Exponential functions', 'Показательные функции', 'Көрсеткіштік функциялар'),
  functions: s('advanced', 'Function notation', 'Функции и их значения', 'Функциялар және мәндері'),
  nonlinear: s('advanced', 'Nonlinear functions and systems', 'Нелинейные функции и системы', 'Сызықтық емес функциялар'),
  ratios: s('data', 'Ratios, rates, and units', 'Отношения, скорости, единицы', 'Қатынастар, жылдамдық, бірліктер'),
  percent: s('data', 'Percentages', 'Проценты', 'Пайыздар'),
  stats: s('data', 'One-variable data', 'Среднее, медиана, разброс', 'Орта мән, медиана, құлаш'),
  probability: s('data', 'Probability', 'Вероятность', 'Ықтималдық'),
  models: s('data', 'Two-variable data and models', 'Модели по данным', 'Деректер бойынша модельдер'),
  'area-volume': s('geometry', 'Area and volume', 'Площадь и объём', 'Аудан және көлем'),
  angles: s('geometry', 'Lines, angles, and triangles', 'Прямые, углы, треугольники', 'Түзулер, бұрыштар, үшбұрыштар'),
  'right-tri': s('geometry', 'Right triangles and trigonometry', 'Прямоугольные треугольники и тригонометрия', 'Тікбұрышты үшбұрыштар және тригонометрия'),
  circles: s('geometry', 'Circles', 'Окружности', 'Шеңберлер'),
  similar: s('geometry', 'Similar figures', 'Подобные фигуры', 'Ұқсас фигуралар'),
};

/** Острова карты «Путь к 1600»: по 4 на каждый раздел. У каждого — свой босс. */
export const ZONES = [
  {
    id: 'rw1',
    track: 'rw',
    domain: 'conventions',
    boss: { icon: '🐙', name: { en: 'Comma Kraken', ru: 'Кракен Запятых', kk: 'Үтір Кракены' } },
  },
  {
    id: 'rw2',
    track: 'rw',
    domain: 'expression',
    boss: { icon: '🧌', name: { en: 'Transition Troll', ru: 'Тролль Связок', kk: 'Байланыс Троллі' } },
  },
  {
    id: 'rw3',
    track: 'rw',
    domain: 'craft',
    boss: { icon: '🧛', name: { en: 'Vocabulary Vampire', ru: 'Вампир Словаря', kk: 'Сөздік Вампирі' } },
  },
  {
    id: 'rw4',
    track: 'rw',
    domain: 'info',
    boss: { icon: '🦁', name: { en: 'Sphinx of Evidence', ru: 'Сфинкс Доказательств', kk: 'Дәлелдер Сфинксі' } },
  },
  {
    id: 'm1',
    track: 'math',
    domain: 'algebra',
    boss: { icon: '🗿', name: { en: 'Algebra Golem', ru: 'Голем Алгебры', kk: 'Алгебра Големі' } },
  },
  {
    id: 'm2',
    track: 'math',
    domain: 'advanced',
    boss: { icon: '🐉', name: { en: 'Parabola Dragon', ru: 'Дракон Парабол', kk: 'Парабола Айдаһары' } },
  },
  {
    id: 'm3',
    track: 'math',
    domain: 'data',
    boss: { icon: '🐍', name: { en: 'Data Hydra', ru: 'Гидра Данных', kk: 'Деректер Гидрасы' } },
  },
  {
    id: 'm4',
    track: 'math',
    domain: 'geometry',
    boss: { icon: '🤖', name: { en: 'Trig Titan', ru: 'Титан Тригонометрии', kk: 'Тригонометрия Титаны' } },
  },
];

export const LEVELS_PER_ZONE = 4;
/** Сложность заданий на уровнях острова: 1 — лёгкие, 2 — средние, 3 — сложные. */
export const LEVEL_DIFFICULTIES = [[1], [1, 2], [2], [2, 3]];
export const BOSS_DIFFICULTIES = [2, 3];

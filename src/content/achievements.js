// Достижения. test(profile) → true, если достижение заработано.

import { daysBetween } from '../core/dates.js';
import { levelInfo } from '../core/profile.js';
import { storage } from '../core/storage.js';
import { ZONES } from './skills.js';

const a = (id, icon, en, ru, kk, den, dru, dkk, test) => ({
  id,
  icon,
  name: { en, ru, kk },
  desc: { en: den, ru: dru, kk: dkk },
  test,
});

const anyStars = (p, n) => Object.values(p.map.stars).some((s) => s >= n);

export const ACHIEVEMENTS = [
  a('first', '👣', 'First step', 'Первый шаг', 'Алғашқы қадам',
    'Answer your first question', 'Ответь на первый вопрос', 'Алғашқы сұраққа жауап бер',
    (p) => p.counters.answered >= 1),
  a('combo5', '🔥', 'On fire', 'В ударе', 'Қызу шақ',
    'Get a 5-answer combo', 'Сделай комбо из 5 ответов', '5 жауаптан тұратын комбо жаса',
    (p) => p.counters.bestCombo >= 5),
  a('combo15', '☄️', 'Unstoppable', 'Неудержимый', 'Тоқтаусыз',
    'Get a 15-answer combo', 'Сделай комбо из 15 ответов', '15 жауаптан тұратын комбо жаса',
    (p) => p.counters.bestCombo >= 15),
  a('perfect', '🌟', 'Perfectionist', 'Перфекционист', 'Мінсіз',
    'Finish a map level with 3 stars', 'Пройди уровень карты на 3 звезды', 'Карта деңгейін 3 жұлдызбен өт',
    (p) => anyStars(p, 3)),
  a('boss1', '⚔️', 'Boss slayer', 'Победитель боссов', 'Босс жеңімпазы',
    'Defeat your first boss', 'Победи первого босса', 'Алғашқы боссты жең',
    (p) => Object.keys(p.map.bosses).length >= 1),
  a('bossAll', '👑', 'Ruler of the map', 'Властелин карты', 'Карта билеушісі',
    'Defeat all 8 bosses', 'Победи всех 8 боссов', '8 боссты түгел жең',
    (p) => ZONES.every((z) => p.map.bosses[z.id])),
  a('survivor', '🛡️', 'Survivor', 'Выживший', 'Тірі қалған',
    'Answer 15 in a row in Survival', 'Набери 15 в «Выживании»', '«Аман қалу» режимінде 15 жинау',
    (p) => p.records.survival >= 15),
  a('blitz', '⚡', 'Lightning', 'Молния', 'Найзағай',
    'Score 12 in Blitz', 'Набери 12 в «Блице»', '«Блицте» 12 жинау',
    (p) => p.records.blitz >= 12),
  a('streak3', '📅', 'Habit', 'Привычка', 'Әдет',
    'Practice 3 days in a row', 'Занимайся 3 дня подряд', '3 күн қатарынан жаттық',
    (p) => p.streak.best >= 3),
  a('streak7', '🗓️', 'Iron will', 'Железная воля', 'Темір ерік',
    'Practice 7 days in a row', 'Занимайся 7 дней подряд', '7 күн қатарынан жаттық',
    (p) => p.streak.best >= 7),
  a('exam', '📝', 'Test taker', 'Экзаменуемый', 'Емтихан тапсырушы',
    'Complete a practice test', 'Пройди пробный экзамен', 'Сынақ емтиханын тапсыр',
    (p) => p.exams.length >= 1),
  a('score700', '🎯', 'Sharpshooter', 'Снайпер', 'Мерген',
    'Score 700+ on a section of a practice test', 'Набери 700+ в разделе пробника', 'Сынақ бөлімінде 700+ жина',
    (p) => p.exams.some((e) => (e.rw ?? 0) >= 700 || (e.math ?? 0) >= 700)),
  a('detective', '🕵️', 'Grammar detective', 'Грамматический сыщик', 'Грамматика тергеушісі',
    'Find 20 errors in Detective mode', 'Найди 20 ошибок в «Детективе»', '«Детективте» 20 қате тап',
    (p) => p.counters.detectiveFound >= 20),
  a('duelist', '🤺', 'Duelist', 'Дуэлянт', 'Жекпе-жекші',
    'Send a duel challenge', 'Отправь вызов на дуэль', 'Жекпе-жекке шақыру жібер',
    (p) => p.counters.duelsSent >= 1),
  a('polyglot', '🌍', 'Polyglot', 'Полиглот', 'Полиглот',
    'Read a solution in another language', 'Прочитай решение на другом языке', 'Шешімді басқа тілде оқы',
    (p) => p.counters.langSwitch >= 1),
  a('daily', '☀️', 'Early bird', 'Ранняя пташка', 'Ерте тұрған',
    'Complete a daily challenge', 'Пройди ежедневный челлендж', 'Күнделікті сынақты орында',
    (p) => p.counters.dailyDone >= 1),
  a('century', '💯', 'Century', 'Сотня', 'Жүздік',
    'Answer 100 questions', 'Ответь на 100 вопросов', '100 сұраққа жауап бер',
    (p) => p.counters.answered >= 100),
  // Уровни и экзамены из каталога (ключ записи - «курс:дорожка», например «math:l3»).
  a('practice1', '🎒', 'Getting started', 'Начало положено', 'Бастамасы жасалды',
    'Finish a practice in any level or exam subject', 'Заверши тренировку по любому уровню или предмету экзамена', 'Кез келген деңгей немесе емтихан пәні бойынша жаттығуды аяқта',
    (p) => practiced(p).length >= 1),
  a('flawless', '🏅', 'Flawless', 'Без единой ошибки', 'Бірде-бір қатесіз',
    'Get 3 stars in a practice or a timed test', 'Получи 3 звезды в тренировке или тесте на время', 'Жаттығуда немесе уақытқа тестте 3 жұлдыз ал',
    (p) => practiced(p).some(([, rec]) => rec.best >= 3)),
  a('explorer', '🧭', 'Explorer', 'Исследователь', 'Зерттеуші',
    'Practise in 5 different levels or subjects', 'Позанимайся на 5 разных уровнях или предметах', '5 түрлі деңгейде немесе пәнде жаттық',
    (p) => practiced(p).length >= 5),
  a('olympian', '🏆', 'Olympian', 'Олимпиец', 'Олимпиадашы',
    'Get 2 stars on any level of olympiad math', 'Получи 2 звезды на любом уровне олимпиадной математики', 'Олимпиадалық математиканың кез келген деңгейінде 2 жұлдыз ал',
    (p) => practiced(p).some(([key, rec]) => key.startsWith('olymp:') && rec.best >= 2)),
  a('quiz', '🎲', 'Know-it-all', 'Всезнайка', 'Бәрін білгіш',
    'Finish a quiz', 'Пройди квиз', 'Квизді аяқта',
    (p) => (p.counters.quizzes ?? 0) >= 1),
  a('quizmaster', '🧠', 'Quiz master', 'Мастер квиза', 'Квиз шебері',
    'Answer 10 of 10 in a quiz of difficulty 7 or higher', 'Ответь на 10 из 10 в квизе сложности 7 или выше', '7 немесе одан жоғары күрделіліктегі квизде 10 сұрақтың 10-ына жауап бер',
    (p) => Object.entries(p.records?.quiz ?? {}).some(([level, best]) => Number(level) >= 7 && best >= 10)),
  a('quizsprint', '⏱️', 'Quiz sprinter', 'Спринтер квиза', 'Квиз спринтері',
    'Answer 15 correctly in a quiz blitz', 'Дай 15 верных ответов в блице квиза', 'Квиз блицінде 15 дұрыс жауап бер',
    (p) => (p.records?.quizBlitz ?? 0) >= 15),
  a('quizsurvivor', '🛡️', 'Unbreakable', 'Несокрушимый', 'Мызғымас',
    'Answer 20 correctly in quiz survival', 'Дай 20 верных ответов в выживании квиза', 'Квиздің аман қалу режимінде 20 дұрыс жауап бер',
    (p) => (p.records?.quizSurvival ?? 0) >= 20),
  a('quizdaily', '📆', 'Every day a quiz', 'Квиз каждый день', 'Күн сайын квиз',
    'Play the daily quiz on 5 different days', 'Сыграй в квиз дня в 5 разных дней', 'Күн квизін 5 түрлі күні ойна',
    (p) => Object.keys(p.records?.quizDaily ?? {}).length >= 5),
  a('champion', '🗡️', 'Champion', 'Чемпион', 'Чемпион',
    'Defeat 5 level bosses in any courses', 'Победи 5 боссов уровней в любых курсах', 'Кез келген курста 5 деңгей боссын жең',
    (p) => bossesBeaten(p) >= 5),
  // ===== Новые: мастерство, привычки, предметы, коллекции и особые =====
  a('answer500', '📚', 'Bookworm', 'Книжный червь', 'Кітап құрты',
    'Answer 500 questions', 'Ответь на 500 вопросов', '500 сұраққа жауап бер',
    (p) => p.counters.answered >= 500),
  a('combo30', '🌋', 'Volcano', 'Вулкан', 'Жанартау',
    'Get a 30-answer combo', 'Сделай комбо из 30 ответов', '30 жауаптан тұратын комбо жаса',
    (p) => p.counters.bestCombo >= 30),
  a('accuracy', '🧐', 'Eagle eye', 'Зоркий глаз', 'Қырағы көз',
    'Keep 85% accuracy after 200 answers', 'Держи точность 85% после 200 ответов', '200 жауаптан кейін 85% дәлдікті сақта',
    (p) => p.counters.answered >= 200 && p.counters.correct / p.counters.answered >= 0.85),
  a('level10', '🌠', 'Rising star', 'Восходящая звезда', 'Өрлеген жұлдыз',
    'Reach level 10', 'Достигни 10-го уровня', '10-деңгейге жет',
    (p) => levelInfo(p.xp).level >= 10),
  a('streak30', '🌅', 'A month without a break', 'Месяц без пропусков', 'Үзіліссіз бір ай',
    'Practise 30 days in a row', 'Занимайся 30 дней подряд', '30 күн қатарынан жаттық',
    (p) => p.streak.best >= 30),
  a('marathon', '🏃', 'Marathon runner', 'Марафонец', 'Марафоншы',
    'Answer 100 questions in one day', 'Ответь на 100 вопросов за один день', 'Бір күнде 100 сұраққа жауап бер',
    (p) => bestDay(p) >= 100),
  a('night', '🦉', 'Night owl', 'Сова', 'Үкі',
    'Practise after 11 pm', 'Позанимайся после 23:00', 'Сағат 23:00-ден кейін жаттық',
    (p) => (p.counters.night ?? 0) >= 1),
  a('lark', '🐓', 'Lark', 'Жаворонок', 'Бозторғай',
    'Practise before 8 am', 'Позанимайся до 8 утра', 'Таңғы 8-ге дейін жаттық',
    (p) => (p.counters.lark ?? 0) >= 1),
  a('weekend', '🏖️', 'Weekend warrior', 'Выходные с пользой', 'Пайдалы демалыс',
    'Practise on both Saturday and Sunday', 'Позанимайся и в субботу, и в воскресенье', 'Сенбіде де, жексенбіде де жаттық',
    (p) => fullWeekend(p)),
  a('comeback', '🔄', 'The comeback', 'Возвращение', 'Қайта оралу',
    'Come back after a break of a week or more', 'Вернись к занятиям после перерыва в неделю и больше', 'Бір апта не одан көп үзілістен кейін сабаққа орал',
    (p) => (p.counters.comeback ?? 0) >= 1),
  a('polymath', '🎓', 'Polymath', 'Эрудит', 'Эрудит',
    'Practise in 8 different courses', 'Позанимайся в 8 разных курсах', '8 түрлі курста жаттық',
    (p) => coursesPracticed(p).size >= 8),
  a('linguist', '🗣️', 'Linguist', 'Лингвист', 'Лингвист',
    'Practise 3 foreign languages', 'Позанимайся тремя иностранными языками', 'Үш шет тілімен жаттық',
    (p) => LANGS.filter((c) => coursesPracticed(p).has(c)).length >= 3),
  a('scientist', '🔬', 'Scientist', 'Учёный', 'Ғалым',
    'Practise physics, chemistry and biology', 'Позанимайся физикой, химией и биологией', 'Физика, химия және биологиямен жаттық',
    (p) => SCIENCES.every((c) => coursesPracticed(p).has(c))),
  a('coder', '🧑‍💻', 'Coder', 'Программист', 'Бағдарламашы',
    'Finish 10 programming levels', 'Пройди 10 уровней программирования', 'Бағдарламалаудың 10 деңгейінен өт',
    (p) => codeLevels(p) >= 10),
  a('warlord', '🐉', 'Dragon hunter', 'Охотник на драконов', 'Айдаһар аңшысы',
    'Defeat 15 level bosses', 'Победи 15 боссов уровней', '15 деңгей боссын жең',
    (p) => bossesBeaten(p) >= 15),
  a('starfall', '✨', 'Starfall', 'Звездопад', 'Жұлдыз жауыны',
    'Get 3 stars on 15 levels', 'Получи 3 звезды на 15 уровнях', '15 деңгейде 3 жұлдыз ал',
    (p) => threeStars(p) >= 15),
  a('mistakes10', '🩹', 'Bug fixer', 'Работа над ошибками', 'Қатемен жұмыс',
    'Master 10 mistakes in review', 'Исправь навсегда 10 ошибок в повторении', 'Қайталауда 10 қатені біржола түзе',
    () => mastered() >= 10),
  a('cards50', '🃏', 'Word collector', 'Собиратель слов', 'Сөз жинаушы',
    'Learn 50 flashcards', 'Выучи 50 карточек слов', '50 сөз карточкасын жаттап ал',
    () => learnedCards() >= 50),
  a('chest', '🎁', 'Treasure hunter', 'Кладоискатель', 'Қазына іздеуші',
    'Open a streak chest', 'Открой сундук за серию', 'Серия сандығын аш',
    () => openedChestsCount() >= 1),
  a('stylist', '👗', 'Stylist', 'Стилист', 'Стилист',
    'Dress Prepi in all four slots at once', 'Наряди Препи сразу во все четыре слота', 'Препиді бірден төрт ұяшыққа киіндір',
    () => fullOutfit()),
  a('planner', '🗺️', 'Strategist', 'Стратег', 'Стратег',
    'Make a study plan for an exam', 'Составь план подготовки к экзамену', 'Емтиханға дайындық жоспарын құр',
    () => Boolean(storage.get('plan', null))),
  a('sharer', '📣', 'Show-off', 'Хвастунишка', 'Мақтаншақ',
    'Share your weekly report', 'Поделись недельным отчётом', 'Апталық есеппен бөліс',
    (p) => (p.counters.shared ?? 0) >= 1),
  a('app', '📱', 'Always at hand', 'Всегда под рукой', 'Әрдайым қолда',
    'Open Prep&Play as an app from the home screen', 'Открой Prep&Play как приложение с экрана «Домой»', 'Prep&Play-ді басты экраннан қосымша ретінде аш',
    (p) => (p.counters.app ?? 0) >= 1),
];

/** Записи о тренировках из каталога: [[ключ, { best, runs, pct }], …]. */
function practiced(profile) {
  return Object.entries(profile.practice ?? {}).filter(([, rec]) => rec.runs > 0);
}

const bossesBeaten = (profile) => Object.values(profile.practice ?? {}).filter((rec) => rec.boss).length;

const LANGS = ['english', 'spanish', 'french', 'chinese', 'hsk', 'ielts', 'toefl'];
const SCIENCES = ['physics', 'chemistry', 'biology'];
const CODE = ['python', 'cpp', 'javascript', 'java'];

const coursesPracticed = (profile) => new Set(practiced(profile).map(([key]) => key.split(':')[0]));
const codeLevels = (profile) => practiced(profile).filter(([key]) => CODE.includes(key.split(':')[0])).length;
const threeStars = (profile) => practiced(profile).filter(([, rec]) => rec.best >= 3).length;

/** Больше всего ответов за один день (история и сегодняшний день). */
function bestDay(profile) {
  const days = Object.values(profile.history ?? {}).map((d) => d.a ?? 0);
  return Math.max(0, profile.today?.answered ?? 0, ...days);
}

/** Были ли занятия в субботу и следующее за ней воскресенье. */
function fullWeekend(profile) {
  const days = new Set(Object.keys(profile.history ?? {}));
  if (profile.today?.date && profile.today.answered) days.add(profile.today.date);
  for (const day of days) {
    if (new Date(`${day}T12:00:00`).getDay() !== 6) continue;
    for (const other of days) if (daysBetween(day, other) === 1) return true;
  }
  return false;
}

// Данные других разделов читаем прямо из хранилища (чтобы не было циклических импортов).
const mastered = () => Number(storage.get('mistakesMastered', 0)) || 0;
const learnedCards = () => Object.values(storage.get('cards', {}) ?? {}).filter((c) => c?.s >= 4).length;
const openedChestsCount = () => {
  const list = storage.get('chests', []);
  return Array.isArray(list) ? list.length : 0;
};
const fullOutfit = () => {
  const o = storage.get('outfit', null);
  return Boolean(o && o.head && o.face && o.neck && o.back);
};

// Разделы страницы достижений.
export const ACH_CATS = ['start', 'skill', 'habit', 'subjects', 'modes', 'collect'];
const CAT = {
  start: ['first', 'practice1', 'daily', 'quiz', 'exam', 'duelist', 'polyglot', 'planner', 'app', 'sharer'],
  skill: ['combo5', 'combo15', 'combo30', 'perfect', 'flawless', 'accuracy', 'century', 'answer500', 'level10', 'score700'],
  habit: ['streak3', 'streak7', 'streak30', 'marathon', 'night', 'lark', 'weekend', 'comeback'],
  subjects: ['explorer', 'polymath', 'linguist', 'scientist', 'coder', 'olympian', 'detective'],
  modes: ['boss1', 'bossAll', 'champion', 'warlord', 'starfall', 'survivor', 'blitz', 'quizmaster', 'quizsprint', 'quizsurvivor', 'quizdaily'],
  collect: ['mistakes10', 'cards50', 'chest', 'stylist'],
};
for (const ach of ACHIEVEMENTS) ach.cat = Object.keys(CAT).find((c) => CAT[c].includes(ach.id)) ?? 'start';

// Прогресс к числовым достижениям: [сейчас, цель].
const PROGRESS = {
  combo5: (p) => [p.counters.bestCombo, 5],
  combo15: (p) => [p.counters.bestCombo, 15],
  combo30: (p) => [p.counters.bestCombo, 30],
  century: (p) => [p.counters.answered, 100],
  answer500: (p) => [p.counters.answered, 500],
  accuracy: (p) => [p.counters.answered, 200],
  level10: (p) => [levelInfo(p.xp).level, 10],
  streak3: (p) => [p.streak.best, 3],
  streak7: (p) => [p.streak.best, 7],
  streak30: (p) => [p.streak.best, 30],
  marathon: (p) => [bestDay(p), 100],
  explorer: (p) => [practiced(p).length, 5],
  polymath: (p) => [coursesPracticed(p).size, 8],
  linguist: (p) => [LANGS.filter((c) => coursesPracticed(p).has(c)).length, 3],
  scientist: (p) => [SCIENCES.filter((c) => coursesPracticed(p).has(c)).length, 3],
  coder: (p) => [codeLevels(p), 10],
  champion: (p) => [bossesBeaten(p), 5],
  warlord: (p) => [bossesBeaten(p), 15],
  starfall: (p) => [threeStars(p), 15],
  bossAll: (p) => [ZONES.filter((z) => p.map.bosses[z.id]).length, ZONES.length],
  detective: (p) => [p.counters.detectiveFound, 20],
  survivor: (p) => [p.records.survival ?? 0, 15],
  blitz: (p) => [p.records.blitz ?? 0, 12],
  quizsprint: (p) => [p.records?.quizBlitz ?? 0, 15],
  quizsurvivor: (p) => [p.records?.quizSurvival ?? 0, 20],
  quizdaily: (p) => [Object.keys(p.records?.quizDaily ?? {}).length, 5],
  mistakes10: () => [mastered(), 10],
  cards50: () => [learnedCards(), 50],
};

/** Прогресс к достижению { now, goal } или null, если он не измеряется числом. */
export function achProgress(ach, profile) {
  const fn = PROGRESS[ach.id];
  if (!fn) return null;
  const [now, goal] = fn(profile);
  return { now: Math.min(goal, Math.max(0, Number(now) || 0)), goal };
}

export function evaluateAchievements(profile) {
  return ACHIEVEMENTS.filter((ach) => ach.test(profile)).map((ach) => ach.id);
}

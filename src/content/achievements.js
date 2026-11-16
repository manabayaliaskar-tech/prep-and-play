// Достижения. test(profile) → true, если достижение заработано.

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
  // Уровни и экзамены из каталога (ключ записи — «курс:дорожка», например «math:l3»).
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
];

/** Записи о тренировках из каталога: [[ключ, { best, runs, pct }], …]. */
function practiced(profile) {
  return Object.entries(profile.practice ?? {}).filter(([, rec]) => rec.runs > 0);
}

const bossesBeaten = (profile) => Object.values(profile.practice ?? {}).filter((rec) => rec.boss).length;

export function evaluateAchievements(profile) {
  return ACHIEVEMENTS.filter((ach) => ach.test(profile)).map((ach) => ach.id);
}

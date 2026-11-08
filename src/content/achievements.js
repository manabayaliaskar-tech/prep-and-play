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
];

export function evaluateAchievements(profile) {
  return ACHIEVEMENTS.filter((ach) => ach.test(profile)).map((ach) => ach.id);
}

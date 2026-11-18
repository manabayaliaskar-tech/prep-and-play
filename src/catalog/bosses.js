// Боссы уровней каталога. У каждого уровня (дорожки) свой босс - он выбирается по коду курса и уровня
// и не меняется между заходами.

import { hashString } from '../core/random.js';

const boss = (icon, en, ru, kk) => ({ icon, name: { en, ru, kk } });

export const BOSSES = [
  boss('🐉', 'Formula Dragon', 'Дракон Формул', 'Формулалар Айдаһары'),
  boss('👾', 'Glitch Invader', 'Пришелец-Глюк', 'Ақаулы Келімсек'),
  boss('🦖', 'Rule Rex', 'Тираннозавр Правил', 'Ережелер Тираннозавры'),
  boss('🧟', 'Homework Zombie', 'Зомби Домашки', 'Үй жұмысы Зомбиі'),
  boss('👻', 'Ghost of Mistakes', 'Призрак Ошибок', 'Қателер Елесі'),
  boss('🦑', 'Squid of Doubt', 'Кальмар Сомнений', 'Күмән Кальмары'),
  boss('🤖', 'Robo-Examiner', 'Робот-Экзаменатор', 'Емтихан Роботы'),
  boss('🦂', 'Trick Scorpion', 'Скорпион-Подвох', 'Айлакер Шаян'),
  boss('🧙', 'Riddle Wizard', 'Маг Загадок', 'Жұмбақ Сиқыршысы'),
  boss('🐺', 'Deadline Wolf', 'Волк Дедлайнов', 'Мерзім Қасқыры'),
  boss('🦇', 'Blunder Bat', 'Летучая Мышь Промахов', 'Қателік Жарқанаты'),
  boss('🐲', 'Exam Wyrm', 'Змей Экзаменов', 'Емтихан Жыланы'),
  boss('🕷️', 'Web of Traps', 'Паук Ловушек', 'Тұзақтар Өрмекшісі'),
  boss('🦈', 'Shark of Speed', 'Акула Скорости', 'Жылдамдық Акуласы'),
];

export function bossFor(course, track) {
  return BOSSES[hashString(`${course.id}:${track.id}`) % BOSSES.length];
}

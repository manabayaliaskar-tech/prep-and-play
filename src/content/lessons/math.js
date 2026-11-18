// Мини-уроки по математике (темы m.*). Формат - в index.js.

import { L, same } from '../../pools/gen.js';

export default {
  'm.lineq': {
    rule: L(
      'An equation is a balance: whatever you do to one side, do the same to the other. Goal - leave x alone on one side.',
      'Уравнение - это весы: что делаешь с одной частью, то же делай и с другой. Цель - оставить x одного с одной стороны.',
      'Теңдеу - таразы: бір жағымен не істесең, екінші жағымен де соны істе. Мақсат - x-ті бір жақта жалғыз қалдыру.',
    ),
    points: [
      L('Move a term to the other side - change its sign: x + 5 = 12 → x = 12 - 5.', 'Перенёс слагаемое через знак «=» - поменяй его знак: x + 5 = 12 → x = 12 - 5.', 'Қосылғышты «=» арқылы көшірсең - таңбасын өзгерт: x + 5 = 12 → x = 12 - 5.'),
      L('If x is multiplied by a number, divide both sides by it: 3x = 12 → x = 4.', 'Если x умножен на число - раздели обе части на него: 3x = 12 → x = 4.', 'Егер x санға көбейтілсе - екі жағын да сол санға бөл: 3x = 12 → x = 4.'),
      L('Check: put the answer back into the equation.', 'Проверка: подставь ответ обратно в уравнение.', 'Тексеру: жауапты теңдеуге қайта қой.'),
    ],
    example: {
      q: same('2x + 3 = 11'),
      steps: [
        L('Subtract 3 from both sides: 2x = 8.', 'Вычтем 3 из обеих частей: 2x = 8.', 'Екі жағынан 3-ті азайтамыз: 2x = 8.'),
        L('Divide both sides by 2: x = 4.', 'Разделим обе части на 2: x = 4.', 'Екі жағын 2-ге бөлеміз: x = 4.'),
        L('Check: 2 · 4 + 3 = 11. Correct.', 'Проверка: 2 · 4 + 3 = 11. Верно.', 'Тексеру: 2 · 4 + 3 = 11. Дұрыс.'),
      ],
    },
    check: {
      q: L('Solve: x - 7 = 5', 'Реши: x - 7 = 5', 'Шеш: x - 7 = 5'),
      options: [same('12'), same('-2'), same('2')],
      answer: 0,
      why: L('Add 7 to both sides: x = 5 + 7 = 12.', 'Прибавим 7 к обеим частям: x = 5 + 7 = 12.', 'Екі жағына 7 қосамыз: x = 5 + 7 = 12.'),
    },
  },
};

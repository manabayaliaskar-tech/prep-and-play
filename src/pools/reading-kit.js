// Короткие конструкторы вопросов для дополнительных текстов IELTS и TOEFL.
import { L } from './gen.js';

export const tfx = (statement, ans, quote) => ({
  type: 'tfng',
  statement,
  answer: ans === 'T' ? 0 : ans === 'F' ? 1 : 2,
  ex:
    ans === 'T'
      ? L(`True: the text says "${quote}".`, `True: в тексте сказано «${quote}».`, `True: мәтінде «${quote}» делінген.`)
      : ans === 'F'
        ? L(`False: the text says "${quote}", which contradicts the statement.`, `False: в тексте сказано «${quote}», что противоречит утверждению.`, `False: мәтінде «${quote}» делінген, бұл тұжырымға қайшы келеді.`)
        : L('Not Given: the text does not give this information.', 'Not Given: в тексте нет такой информации.', 'Not Given: мәтінде мұндай ақпарат жоқ.'),
});
export const mcx = (question, choices, quote) => ({
  type: 'mc',
  question,
  choices,
  ex: L(`The text says: "${quote}"`, `В тексте: «${quote}»`, `Мәтінде: «${quote}»`),
});


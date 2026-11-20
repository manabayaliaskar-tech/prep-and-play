// Банк заданий Reading and Writing: собираем все файлы в единый формат.

import { SKILLS } from '../skills.js';
import { CONVENTIONS } from './conventions.js';
import { CRAFT } from './craft.js';
import { EXPRESSION } from './expression.js';
import { INFO } from './info.js';
import { WORDS_MORE } from './more4-a.js';
import { CENTRAL_MORE, STRUCTURE_MORE } from './more4-b.js';

export const RW_QUESTIONS = [...CRAFT, ...INFO, ...CONVENTIONS, ...EXPRESSION, ...WORDS_MORE, ...STRUCTURE_MORE, ...CENTRAL_MORE].map((q) => ({
  ...q,
  id: `rw:${q.id}`,
  section: 'rw',
  domain: SKILLS[q.skill].domain,
  type: 'mc',
  answer: 0, // в исходных данных правильный вариант всегда первый
}));

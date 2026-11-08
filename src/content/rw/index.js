// Банк заданий Reading and Writing: собираем все файлы в единый формат.

import { SKILLS } from '../skills.js';
import { CONVENTIONS } from './conventions.js';
import { CRAFT } from './craft.js';
import { EXPRESSION } from './expression.js';
import { INFO } from './info.js';

export const RW_QUESTIONS = [...CRAFT, ...INFO, ...CONVENTIONS, ...EXPRESSION].map((q) => ({
  ...q,
  id: `rw:${q.id}`,
  section: 'rw',
  domain: SKILLS[q.skill].domain,
  type: 'mc',
  answer: 0, // в исходных данных правильный вариант всегда первый
}));

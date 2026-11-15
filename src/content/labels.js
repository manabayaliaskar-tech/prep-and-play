// Название навыка или темы для любого задания: и для SAT, и для общих банков.

import { TOPICS } from '../pools/topics.js';
import { SKILLS } from './skills.js';

export function skillName(id) {
  return SKILLS[id]?.name ?? TOPICS[id]?.name ?? id;
}

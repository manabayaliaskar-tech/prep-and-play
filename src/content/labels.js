// Название навыка или темы для любого задания: и для SAT, и для общих банков.

import { TOPIC_NAMES } from '../pools/topic-names.js';
import { SKILLS } from './skills.js';

export function skillName(id) {
  return SKILLS[id]?.name ?? TOPIC_NAMES[id]?.[1] ?? id;
}

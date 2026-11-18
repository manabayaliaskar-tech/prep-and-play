// Ежедневные задания: каждый день три задания из списка, одинаковые для всех в этот день.
// За выполненное задание - награда опытом (выдаётся один раз).

import { createRng, hashString, shuffle } from './random.js';

export const QUESTS_PER_DAY = 3;

/** value(day) - текущий прогресс по счётчикам дня из профиля (profile.today). */
export const QUESTS = [
  { id: 'answer', icon: '✏️', goal: 20, reward: 30, value: (d) => d.answered },
  { id: 'correct', icon: '✅', goal: 15, reward: 30, value: (d) => d.correct },
  { id: 'xp', icon: '⚡', goal: 150, reward: 40, value: (d) => d.xp },
  { id: 'stars', icon: '⭐', goal: 1, reward: 40, value: (d) => d.stars2 },
  { id: 'boss', icon: '⚔️', goal: 1, reward: 50, value: (d) => d.bosses },
  { id: 'quiz', icon: '🎲', goal: 1, reward: 30, value: (d) => d.quizzes },
  { id: 'combo', icon: '🔥', goal: 7, reward: 30, value: (d) => d.combo },
];

/** Задания на день dayKey. */
export function dailyQuests(day) {
  return shuffle(QUESTS, createRng(hashString(`quests:${day}`))).slice(0, QUESTS_PER_DAY);
}

const EMPTY = { xp: 0, answered: 0, correct: 0, combo: 0, stars2: 0, bosses: 0, quizzes: 0, quests: {} };

/** Состояние заданий дня для показа: [{ quest, value, done, claimed }]. Профиль не меняет. */
export function questState(profile, day) {
  const stats = profile.today?.date === day ? { ...EMPTY, ...profile.today } : EMPTY;
  return dailyQuests(day).map((quest) => {
    const value = Math.min(quest.goal, quest.value(stats) ?? 0);
    return { quest, value, done: value >= quest.goal, claimed: Boolean(stats.quests?.[quest.id]) };
  });
}

/**
 * Отмечает выполненные, но ещё не награждённые задания. Возвращает их список;
 * опыт за них начисляет вызывающий код.
 */
export function claimQuests(profile, day) {
  if (profile.today?.date !== day) return [];
  const fresh = questState(profile, day).filter((s) => s.done && !s.claimed).map((s) => s.quest);
  profile.today.quests ??= {};
  for (const quest of fresh) profile.today.quests[quest.id] = true;
  return fresh;
}

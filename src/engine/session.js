// Логика игровой сессии без интерфейса: очки опыта, комбо, жизни, урон боссу, звёзды.
// Отделена от экрана, поэтому её можно проверить тестами.

export const XP_RULES = { base: 10, difficultyBonus: { 1: 0, 2: 3, 3: 6 } };
/** Сколько правильных ответов нужно, чтобы победить босса. */
export const BOSS_HITS = 6;

export function comboBonus(combo) {
  return combo >= 3 ? Math.min(combo - 2, 5) * 2 : 0;
}

export function createRun({ lives = null, bossHp = null } = {}) {
  return {
    answered: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    lives,
    maxLives: lives,
    bossHp,
    bossMax: bossHp,
    xp: 0,
    timeMs: 0,
    log: [],
  };
}

export function applyAnswer(run, { question, correct, response = null, timeMs = 0 }) {
  run.answered += 1;
  run.timeMs += timeMs;
  let xp = 0;
  let damage = 0;
  if (correct) {
    run.correct += 1;
    run.combo += 1;
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    xp = XP_RULES.base + (XP_RULES.difficultyBonus[question.d] ?? 0) + comboBonus(run.combo);
    if (run.bossHp !== null) {
      damage = Math.ceil(run.bossMax / BOSS_HITS);
      run.bossHp = Math.max(0, run.bossHp - damage);
    }
  } else {
    run.combo = 0;
    if (run.lives !== null) run.lives = Math.max(0, run.lives - 1);
  }
  run.xp += xp;
  run.log.push({ question, correct, response, timeMs });
  return {
    xp,
    damage,
    combo: run.combo,
    bossDefeated: run.bossHp === 0,
    outOfLives: run.lives === 0,
  };
}

export function starsFor(correct, total) {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.6) return 1;
  return 0;
}

export function accuracy(run) {
  return run.answered ? Math.round((run.correct / run.answered) * 100) : 0;
}

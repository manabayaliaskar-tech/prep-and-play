// Пробные экзамены целиком: разделы по порядку, у каждого свой таймер, итог — по шкале экзамена.
// Формат приближен к настоящему (число заданий, время, баллы), но части без нашего контента
// (аудирование, письмо, устная часть, родной язык) не входят — это сказано на странице экзамена.
// Каждый раздел — дорожка курса экзамена (src/catalog/courses.js), задания берутся из её тем.

/** Раздел: дорожка, число заданий, минуты, максимум баллов. */
const sec = (track, count, minutes, points) => ({ track, count, minutes, points });
/** Предметы по выбору: choose из from; count/minutes — число или { дорожка: число }; points — число или по слотам. */
const pick = (choose, from, count, minutes, points) => ({ choose, from, count, minutes, points });

export const MOCKS = {
  ent: {
    scale: 'sum',
    compulsory: [sec('history', 20, 30, 20), sec('mathlit', 10, 20, 10), sec('reading', 10, 25, 10)],
    electives: [pick(2, ['math', 'physics', 'chemistry', 'biology', 'geography', 'informatics', 'world', 'english'], 40, 80, 50)],
  },
  ege: {
    scale: 'sum',
    compulsory: [sec('russian', 26, 80, 100)],
    electives: [
      pick(1, ['profile', 'base'], { profile: 12, base: 21 }, 90, 100),
      pick(1, ['english', 'social', 'history', 'physics', 'chemistry', 'biology', 'geography', 'informatics'], 25, 90, 100),
    ],
  },
  oge: {
    scale: 'grade',
    compulsory: [sec('math', 20, 90, 5), sec('russian', 15, 60, 5)],
    electives: [pick(2, ['english', 'social', 'informatics', 'geography', 'physics', 'biology', 'chemistry'], 20, 60, 5)],
  },
  ct: {
    scale: 'sum',
    electives: [pick(3, ['math', 'russian', 'english', 'history', 'physics', 'chemistry', 'biology'], 30, 120, 100)],
  },
  dtm: {
    scale: 'sum',
    compulsory: [sec('mathbase', 10, 20, 11), sec('history', 10, 20, 11)],
    electives: [pick(2, ['math', 'english', 'physics', 'chemistry', 'biology'], 30, 60, [93, 63])],
  },
  ort: {
    scale: 'ort',
    compulsory: [sec('math', 30, 60, 0), sec('analogies', 30, 30, 0), sec('reading', 30, 60, 0), sec('grammar', 30, 35, 0)],
  },
  ielts: {
    scale: 'ielts',
    compulsory: [sec('reading', 40, 60, 0), sec('grammar', 30, 30, 0)],
  },
  toefl: {
    scale: 'sum',
    compulsory: [sec('reading', 20, 35, 30), sec('grammar', 20, 15, 30)],
  },
  hsk: {
    scale: 'sum',
    electives: [pick(1, ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'], 40, 40, 100)],
  },
  tj: {
    scale: 'percent',
    electives: [pick(3, ['math', 'english', 'history', 'physics', 'chemistry', 'biology'], 30, 60, 100)],
  },
  dim: {
    scale: 'scaled',
    max: 700,
    electives: [pick(3, ['math', 'english', 'history', 'physics', 'chemistry', 'biology'], 30, 60, 100)],
  },
  arm: {
    scale: 'sum',
    electives: [pick(3, ['math', 'english', 'history', 'physics', 'chemistry', 'biology'], 25, 60, 20)],
  },
  bac: {
    scale: 'avg10',
    electives: [pick(3, ['math', 'english', 'history', 'physics', 'chemistry', 'biology'], 20, 60, 10)],
  },
};

export const hasMock = (examId) => Boolean(MOCKS[examId]);

const valueFor = (v, track) => (typeof v === 'object' && !Array.isArray(v) ? v[track] : v);

/** Сколько предметов выбрать в каждой группе (для подписи и проверки выбора). */
export const electiveSlots = (mock) => (mock.electives ?? []).map((g) => g.choose);

/**
 * Список разделов экзамена с учётом выбора: picks — массив выбранных дорожек для каждой группы.
 * short — короткая версия: вдвое меньше заданий и времени.
 */
export function mockPlan(examId, picks = [], short = false) {
  const mock = MOCKS[examId];
  if (!mock) return [];
  const list = [...(mock.compulsory ?? [])];
  (mock.electives ?? []).forEach((g, gi) => {
    (picks[gi] ?? []).slice(0, g.choose).forEach((track, slot) => {
      const points = Array.isArray(g.points) ? g.points[slot] : g.points;
      list.push(sec(track, valueFor(g.count, track), valueFor(g.minutes, track), points));
    });
  });
  return short ? list.map((s) => ({ ...s, count: Math.ceil(s.count / 2), minutes: Math.ceil(s.minutes / 2) })) : list;
}

/** Выбор сделан полностью? */
export const picksComplete = (examId, picks) => (MOCKS[examId]?.electives ?? []).every((g, gi) => (picks[gi] ?? []).length === g.choose);

// Шкала IELTS Academic Reading: число верных из 40 → балл.
const IELTS_BANDS = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
const ogeGrade = (pct) => (pct >= 0.8 ? 5 : pct >= 0.55 ? 4 : pct >= 0.3 ? 3 : 2);
const round1 = (x) => Math.round(x * 10) / 10;

/**
 * Итог по шкале экзамена. results — [{ track, correct, count, points }].
 * Возвращает { score, max, unit, sections: [{ track, correct, count, pct, value, max }] }.
 * unit: 'points' | 'band' | 'grade' | 'percent' | 'mark'.
 */
export function mockScore(examId, results) {
  const mock = MOCKS[examId];
  const sections = results.map((r) => {
    const pct = r.count ? r.correct / r.count : 0;
    let value = round1(pct * r.points);
    let max = r.points;
    if (mock.scale === 'grade') [value, max] = [ogeGrade(pct), 5];
    if (mock.scale === 'avg10') [value, max] = [Math.max(1, Math.round(pct * 10)), 10];
    if (mock.scale === 'percent' || mock.scale === 'scaled') [value, max] = [Math.round(pct * 100), 100];
    if (mock.scale === 'ort' || mock.scale === 'ielts') [value, max] = [r.correct, r.count];
    return { track: r.track, correct: r.correct, count: r.count, pct, value, max };
  });
  const correct = results.reduce((s, r) => s + r.correct, 0);
  const count = results.reduce((s, r) => s + r.count, 0);
  const pct = count ? correct / count : 0;
  const avg = (list) => round1(list.reduce((s, x) => s + x.value, 0) / Math.max(1, list.length));
  switch (mock.scale) {
    case 'grade':
      return { score: avg(sections), max: 5, unit: 'grade', sections };
    case 'avg10':
      return { score: avg(sections), max: 10, unit: 'mark', sections };
    case 'percent':
      return { score: Math.round(pct * 100), max: 100, unit: 'percent', sections };
    case 'scaled':
      return { score: Math.round(pct * mock.max), max: mock.max, unit: 'points', sections };
    case 'ort':
      return { score: Math.round(55 + 190 * pct), max: 245, unit: 'points', sections };
    case 'ielts': {
      const of40 = Math.round(pct * 40);
      return { score: IELTS_BANDS.find(([n]) => of40 >= n)?.[1] ?? 2, max: 9, unit: 'band', sections };
    }
    default:
      return {
        score: round1(sections.reduce((s, x) => s + x.value, 0)),
        max: round1(sections.reduce((s, x) => s + x.max, 0)),
        unit: 'points',
        sections,
      };
  }
}

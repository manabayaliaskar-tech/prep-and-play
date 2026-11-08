// Формулировки вопросов в стиле цифрового SAT (Reading and Writing).
// Договорённость в банке заданий: ПЕРВЫЙ вариант в choices — правильный.
// При показе варианты перемешиваются.

export const CONV = 'Which choice completes the text so that it conforms to the conventions of Standard English?';
export const WORD = 'Which choice completes the text with the most logical and precise word or phrase?';
export const TRANS = 'Which choice completes the text with the most logical transition?';
export const PURPOSE = 'Which choice best states the main purpose of the text?';
export const STRUCT = 'Which choice best describes the overall structure of the text?';
export const MAIN = 'Which choice best states the main idea of the text?';
export const INFER = 'Which choice most logically completes the text?';
export const QUANT = 'Which choice most effectively uses data from the table to complete the statement?';
export const NOTES_INTRO = 'While researching a topic, a student has taken the following notes:';
export const synthesis = (goal) =>
  `The student wants to ${goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?`;
export const cross = (target) => `Based on the texts, how would the author of Text 2 most likely respond to ${target}?`;

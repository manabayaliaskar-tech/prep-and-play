// Помощники для полных тестов IELTS Academic Reading (src/pools/ielts-full.js и файлы t2…t8).
// Ответ - номер варианта. para - буква абзаца, quote - цитата из него (или пояснение для NOT GIVEN).

/** Утверждение для True / False / Not Given или Yes / No / Not Given: answer 0 - TRUE/YES, 1 - FALSE/NO, 2 - NOT GIVEN. */
export const tf = (statement, answer, para, quote) => ({ statement, answer, para, quote });
/** Вопрос с выбором ответа A-D. */
export const choice = (question, choices, answer, para, quote) => ({ question, choices, answer, para, quote });
/** Предложение с пропуском: ответ - номер слова из списка группы. */
export const gap = (text, answer, para, quote) => ({ text, answer, para, quote });
/** Заголовок для абзаца: ответ - номер заголовка из списка группы. */
export const head = (para, answer, quote) => ({ para, answer, quote });

const n = (from, to) => `Questions ${from}-${to}.`;
export const INTRO = {
  tfng: (a, b) => `${n(a, b)} Do the following statements agree with the information given in the passage? Choose TRUE, FALSE or NOT GIVEN.`,
  ynng: (a, b) => `${n(a, b)} Do the following statements agree with the claims of the writer? Choose YES, NO or NOT GIVEN.`,
  mc: (a, b) => `${n(a, b)} Choose the correct letter, A, B, C or D.`,
  bankSentences: (a, b, last) => `${n(a, b)} Complete the sentences. Choose the correct word, A-${last}, from the list.`,
  bankSummary: (a, b, last) => `${n(a, b)} Complete the summary. Choose the correct word, A-${last}, from the list.`,
  heading: (a, b, last) => `${n(a, b)} Choose the correct heading for each paragraph, A-${last}, from the list of headings below.`,
};

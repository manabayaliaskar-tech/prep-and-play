// Короткие конструкторы записей аудирования (формат как в listening.js).
export const say = (s, t) => ({ s, t });
export const mc = (question, choices, quote) => ({ type: 'mc', question, choices, quote });
export const num = (question, value, quote) => ({ type: 'num', question, value, quote });

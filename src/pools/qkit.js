// Короткая запись для банков: Q(сложность, [ru, kk, en], ответ, [неверные], [разбор ru, kk, en]).
// Ответ и неверные варианты - строка (одинакова на всех языках) или тройка [ru, kk, en].
import { T } from './bank.js';

const tx = (v) => (Array.isArray(v) ? T(v[0], v[1], v[2]) : v);

export const Q = (d, q, a, w, e) => [d, T(q[0], q[1], q[2]), tx(a), w.map(tx), T(e[0], e[1], e[2])];

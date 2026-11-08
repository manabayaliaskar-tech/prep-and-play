// Простейшая шина событий: «профиль изменился», «новое достижение», «новый уровень».

const handlers = new Map();

export function on(name, fn) {
  if (!handlers.has(name)) handlers.set(name, new Set());
  handlers.get(name).add(fn);
  return () => handlers.get(name).delete(fn);
}

export function emit(name, payload) {
  handlers.get(name)?.forEach((fn) => fn(payload));
}

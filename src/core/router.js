// Маршрутизатор по адресу после #: #/map, #/level/rw1/2, #/duel/<код> и т. д.
// Экран возвращает { cleanup, relabel } — что сделать при уходе и при смене языка.

const routes = [];
let current = null;
let guard = null;
let lastHash = '#/';
let skipNext = false;

export function route(pattern, handler) {
  const keys = [];
  const re = new RegExp(
    '^' +
      pattern.replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      }) +
      '$',
  );
  routes.push({ re, keys, handler });
}

export function navigate(path) {
  if (location.hash === '#' + path) resolve(true);
  else location.hash = '#' + path;
}

/** Пока игра идёт, спрашиваем подтверждение перед уходом со страницы. */
export function setLeaveGuard(fn) {
  guard = fn;
}

function teardown() {
  if (typeof current === 'function') current();
  else current?.cleanup?.();
  current = null;
}

function resolve(force = false) {
  if (skipNext) {
    skipNext = false;
    return;
  }
  if (!force && guard && !guard()) {
    skipNext = true;
    location.hash = lastHash;
    return;
  }
  guard = null;
  lastHash = location.hash || '#/';
  const path = location.hash.slice(1) || '/';
  for (const r of routes) {
    const match = path.match(r.re);
    if (match) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
      teardown();
      window.scrollTo(0, 0);
      current = r.handler(params) ?? null;
      document.dispatchEvent(new CustomEvent('routechange', { detail: path }));
      return;
    }
  }
  navigate('/');
}

/** Смена языка: экран перерисовывает надписи сам или открывается заново. */
export function refreshRoute() {
  if (current && typeof current === 'object' && current.relabel) current.relabel();
  else resolve(true);
}

export function startRouter() {
  window.addEventListener('hashchange', () => resolve());
  resolve(true);
}

export function currentPath() {
  return location.hash.slice(1) || '/';
}

// Приложение на экране телефона (PWA): сервис-воркер для работы без интернета и кнопка «Установить».
// На Android и в Chrome браузер сам показывает окно установки; на iPhone и iPad - инструкция
// «Поделиться → На экран «Домой»».

import { storage } from './storage.js';

let deferred = null;

export function initPwa() {
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && secure) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Без сервис-воркера сайт просто работает только онлайн.
    });
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    document.dispatchEvent(new CustomEvent('installready'));
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    storage.set('installDismissed', true);
  });
}

export const isStandalone = () => globalThis.matchMedia?.('(display-mode: standalone)').matches || globalThis.navigator?.standalone === true;

export function isIOS() {
  const ua = globalThis.navigator?.userAgent ?? '';
  return /iPad|iPhone|iPod/.test(ua) || (globalThis.navigator?.platform === 'MacIntel' && globalThis.navigator?.maxTouchPoints > 1);
}

/** Можно ли предложить установку: приложение ещё не установлено, а браузер это умеет. */
export const canInstall = () => !isStandalone() && (Boolean(deferred) || isIOS());

export const installDismissed = () => storage.get('installDismissed', false) === true;
export const dismissInstall = () => storage.set('installDismissed', true);

/** Запускает установку. Возвращает 'prompted', 'ios' (нужна инструкция) или 'none'. */
export async function install() {
  if (deferred) {
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // Пользователь закрыл окно.
    }
    deferred = null;
    return 'prompted';
  }
  return isIOS() ? 'ios' : 'none';
}

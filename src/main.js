// Точка входа: маршруты, верхняя панель, уведомления о достижениях и новых уровнях.

import { confetti } from './core/confetti.js';
import { on } from './core/events.js';
import { getLang, onLangChange, t, tx } from './core/i18n.js';
import { refreshRoute, route, startRouter } from './core/router.js';
import { sfx } from './core/sound.js';
import { ACHIEVEMENTS } from './content/achievements.js';
import { detectiveRoute } from './screens/detective.js';
import { examRoute } from './screens/exam.js';
import { homeScreen } from './screens/home.js';
import { bossRoute, levelRoute, mapScreen } from './screens/map.js';
import { blitzRoute, dailyRoute, duelAcceptRoute, duelRoute, survivalRoute, weakRoute } from './screens/modes.js';
import { profileScreen } from './screens/profile.js';
import { premiumScreen } from './screens/premium.js';
import { toast } from './ui/overlay.js';
import { bindLangSwitches, renderTopbar } from './ui/topbar.js';

const app = document.getElementById('app');

route('/', () => homeScreen(app));
route('/map', () => mapScreen(app));
route('/level/:zone/:n', (params) => levelRoute(app, params));
route('/boss/:zone', (params) => bossRoute(app, params));
route('/exam', () => examRoute(app));
route('/survival', () => survivalRoute(app));
route('/blitz', () => blitzRoute(app));
route('/weak', () => weakRoute(app));
route('/daily', () => dailyRoute(app));
route('/duel', () => duelRoute(app));
route('/duel/:code', (params) => duelAcceptRoute(app, params));
route('/detective', () => detectiveRoute(app));
route('/profile', () => profileScreen(app));
route('/premium', () => premiumScreen(app));

on('profile', renderTopbar);
document.addEventListener('routechange', renderTopbar);

on('achievement', (id) => {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return;
  toast(`<span class="toast-icon">${a.icon}</span><span><small>${t('toast.achievement')}</small><b>${tx(a.name)}</b></span>`, {
    kind: 'achievement',
    duration: 4200,
  });
});

on('levelup', (level) => {
  sfx.levelUp();
  confetti({ y: 0.2, count: 140 });
  toast(`<span class="toast-icon">⭐</span><span><small>${t('toast.levelUp')}</small><b>${t('home.level', { n: level })}</b></span>`, {
    kind: 'level',
    duration: 4200,
  });
});

onLangChange(() => {
  renderTopbar();
  refreshRoute();
});

document.documentElement.lang = getLang();
bindLangSwitches();
startRouter();
renderTopbar();

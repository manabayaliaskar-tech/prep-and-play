// Точка входа: маршруты, верхняя панель, уведомления о достижениях и новых уровнях.

import { confetti } from './core/confetti.js';
import { on } from './core/events.js';
import { dayKey } from './core/dates.js';
import { getLang, onLangChange, t, tx } from './core/i18n.js';
import { addXp, getProfile, saveProfile } from './core/profile.js';
import { claimQuests } from './core/quests.js';
import { applyTheme } from './core/theme.js';
import { refreshRoute, route, startRouter } from './core/router.js';
import { sfx } from './core/sound.js';
import { ACHIEVEMENTS } from './content/achievements.js';
import { detectiveRoute } from './screens/detective.js';
import { examRoute } from './screens/exam.js';
import { courseScreen, examsScreen, practiceHubScreen } from './screens/catalog.js';
import { hubScreen } from './screens/hub.js';
import { bossRoute, levelRoute, mapScreen } from './screens/map.js';
import { blitzRoute, dailyRoute, duelAcceptRoute, duelRoute, survivalRoute, weakRoute } from './screens/modes.js';
import { trackRoute } from './screens/practice.js';
import { quizRoute } from './screens/quiz.js';
import { profileScreen } from './screens/profile.js';
import { premiumScreen } from './screens/premium.js';
import { satHomeScreen } from './screens/sat-home.js';
import { toast } from './ui/overlay.js';
import { startMotion } from './ui/motion.js';
import { bindThemePicker } from './ui/theme-picker.js';
import { bindPins } from './core/pins.js';
import { bindLangSwitches, renderTopbar } from './ui/topbar.js';

const app = document.getElementById('app');

// Общие разделы
route('/', () => hubScreen(app));
route('/exams', () => examsScreen(app));
route('/practice', () => practiceHubScreen(app));
route('/code', () => practiceHubScreen(app, 'code'));
route('/quiz', () => quizRoute(app));
route('/c/:course', (params) => courseScreen(app, params));
route('/c/:course/:track', (params) => trackRoute(app, params));
// SAT
route('/sat', () => satHomeScreen(app));
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

on('profile', () => {
  // Ежедневные задания: за каждое выполненное — опыт и уведомление (один раз).
  const fresh = claimQuests(getProfile(), dayKey());
  for (const quest of fresh) {
    addXp(quest.reward);
    toast(`<span class="toast-icon">${quest.icon}</span><span><small>${t('toast.quest')}</small><b>+${quest.reward} XP</b></span>`, {
      kind: 'achievement',
      duration: 4200,
    });
  }
  if (fresh.length) saveProfile();
  else renderTopbar();
});
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

applyTheme();
document.documentElement.lang = getLang();
bindLangSwitches();
bindThemePicker();
bindPins(refreshRoute);
startMotion(app);
startRouter();
renderTopbar();

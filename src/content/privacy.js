// Политика конфиденциальности: простым языком, для школьников и родителей. Тексты - L(en, ru, kk).

import { L } from '../pools/gen.js';

export const PRIVACY_UPDATED = '2026-11-21';
export const SUPPORT_EMAIL = 'support@prepplay.app';

export const PRIVACY = [
  {
    title: L('In short', 'Коротко', 'Қысқаша'),
    items: [
      L(
        'Prep&Play works without an account: your progress is stored only in this browser.',
        'Prep&Play работает без аккаунта: прогресс хранится только в этом браузере.',
        'Prep&Play аккаунтсыз жұмыс істейді: прогресс тек осы браузерде сақталады.',
      ),
      L(
        'If you sign in, we store your email and a copy of your progress so it works on all your devices.',
        'Если войти в аккаунт, мы храним твою почту и копию прогресса, чтобы он был на всех твоих устройствах.',
        'Аккаунтқа кірсең, прогресс барлық құрылғыда болуы үшін поштаңды және прогресс көшірмесін сақтаймыз.',
      ),
      L(
        'No ads, no selling of data, no tracking across other sites.',
        'Никакой рекламы, мы не продаём данные и не следим за тобой на других сайтах.',
        'Жарнама жоқ, деректерді сатпаймыз және басқа сайттарда сені бақыламаймыз.',
      ),
      L(
        'You can delete your account and all its data at any time in your profile.',
        'Аккаунт и все его данные можно удалить в любой момент в профиле.',
        'Аккаунтты және оның барлық деректерін профильде кез келген уақытта жоюға болады.',
      ),
    ],
  },
  {
    title: L('What we store', 'Что мы храним', 'Не сақтаймыз'),
    items: [
      L(
        'In your browser: progress, coins, Prepi’s outfits, settings, notes and which tasks you have already seen. This stays on your device.',
        'В твоём браузере: прогресс, монеты, наряды Препи, настройки, заметки и какие задания ты уже видел. Это остаётся на твоём устройстве.',
        'Браузеріңде: прогресс, монеталар, Препидің киімдері, баптаулар, жазбалар және қай тапсырмаларды көргенің. Бұлар құрылғыңда қалады.',
      ),
      L(
        'With an account: your email (to send the sign-in link or code) and a copy of the same progress data.',
        'С аккаунтом: твоя почта (чтобы присылать ссылку или код для входа) и копия тех же данных прогресса.',
        'Аккаунтпен: поштаң (кіру сілтемесін не кодын жіберу үшін) және сол прогресс деректерінің көшірмесі.',
      ),
      L(
        'If you use Friends: your chosen name, Prepi’s look, weekly XP, streak and level are visible to people who have your friend code. Your email is never shown. You can remove yourself from the leaderboard on the Friends page.',
        'Если пользуешься «Друзьями»: выбранное имя, вид Препи, опыт за неделю, серия и уровень видны тем, у кого есть твой код друга. Почта не показывается никогда. Убрать себя из рейтинга можно на странице «Друзья».',
        'Егер «Достар» бөлімін қолдансаң: таңдаған есімің, Препидің түрі, апталық тәжірибе, серия және деңгей сенің дос кодың бар адамдарға көрінеді. Пошта ешқашан көрсетілмейді. Өзіңді рейтингтен «Достар» бетінде алып тастауға болады.',
      ),
      L(
        'Error reports you send from a task: the task number, the subject, the interface language and your message.',
        'Сообщения об ошибках, которые ты отправляешь из задания: номер задания, тема, язык сайта и твой текст.',
        'Тапсырмадан жіберетін қате туралы хабарламалар: тапсырма нөмірі, тақырып, сайт тілі және сенің мәтінің.',
      ),
      L(
        'We do not ask for your real name, age, phone, school or location. The name in your profile is optional and stays in the browser and your account.',
        'Мы не спрашиваем настоящее имя, возраст, телефон, школу или где ты живёшь. Имя в профиле - по желанию, оно хранится в браузере и в аккаунте.',
        'Шын атыңды, жасыңды, телефоныңды, мектебіңді немесе қай жерде тұратыныңды сұрамаймыз. Профильдегі есім - қалауың бойынша, ол браузерде және аккаунтта сақталады.',
      ),
    ],
  },
  {
    title: L('Where and how', 'Где и как хранится', 'Қайда және қалай сақталады'),
    items: [
      L(
        'Account data is stored with Supabase on servers in the European Union (Ireland). The connection is always encrypted (https).',
        'Данные аккаунта хранятся в сервисе Supabase на серверах в Европейском союзе (Ирландия). Соединение всегда зашифровано (https).',
        'Аккаунт деректері Supabase сервисінде Еуропалық одақтағы (Ирландия) серверлерде сақталады. Байланыс әрқашан шифрланған (https).',
      ),
      L(
        'Each user can read and change only their own progress - this is enforced by the database rules.',
        'Каждый пользователь может читать и менять только свой прогресс - это закреплено правилами базы данных.',
        'Әр пайдаланушы тек өз прогресін оқи және өзгерте алады - бұл дерекқор ережелерімен бекітілген.',
      ),
      L(
        'The site itself is hosted on GitHub Pages. We do not use advertising or analytics trackers.',
        'Сам сайт размещён на GitHub Pages. Рекламных и аналитических трекеров мы не используем.',
        'Сайттың өзі GitHub Pages-те орналасқан. Жарнамалық және аналитикалық трекерлерді қолданбаймыз.',
      ),
    ],
  },
  {
    title: L('For parents', 'Для родителей', 'Ата-аналарға'),
    items: [
      L(
        'Prep&Play is made for school students. If your child is under 16, we recommend that you create the account together and use your own email.',
        'Prep&Play сделан для школьников. Если ребёнку меньше 16 лет, советуем создать аккаунт вместе и указать почту родителя.',
        'Prep&Play оқушыларға арналған. Балаңыз 16 жасқа толмаса, аккаунтты бірге ашып, ата-ананың поштасын көрсетуге кеңес береміз.',
      ),
      L(
        'You can ask us to delete any data at any time by email.',
        'Вы можете в любой момент попросить нас удалить любые данные по почте.',
        'Кез келген уақытта поштамен кез келген деректерді жоюды сұрай аласыз.',
      ),
    ],
  },
  {
    title: L('Deleting your data', 'Как удалить данные', 'Деректерді қалай жою'),
    items: [
      L(
        'Account: Profile → Account → «Delete account». The account, your email and the cloud copy of progress are deleted immediately.',
        'Аккаунт: Профиль → Аккаунт → «Удалить аккаунт». Аккаунт, почта и копия прогресса в облаке удаляются сразу.',
        'Аккаунт: Профиль → Аккаунт → «Аккаунтты жою». Аккаунт, пошта және бұлттағы прогресс көшірмесі бірден жойылады.',
      ),
      L(
        'Browser: Profile → «Reset progress», or clear the site data in your browser settings.',
        'Браузер: Профиль → «Сбросить прогресс» или очистить данные сайта в настройках браузера.',
        'Браузер: Профиль → «Прогресті өшіру» немесе браузер баптауларында сайт деректерін тазала.',
      ),
    ],
  },
];

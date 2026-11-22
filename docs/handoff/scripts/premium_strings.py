# Заменяет в src/i18n/strings.js старые строки страницы Premium на строки новых тарифов.
import re

PATH = '/home/user/School/src/i18n/strings.js'

NEW = {
    'ru': """  'nav.premium': 'Тарифы',
  'home.premiumTitle': 'Тарифы и поддержка проекта',
  'home.premiumText': 'Золото, Алмаз и Аметист — от 1,99 $ в месяц. Пока идёт бета-версия, всё открыто бесплатно.',
  'premium.title': 'Тарифы Prep&Play',
  'premium.subtitle': 'Вся основная подготовка бесплатна. Подписка откроет дополнительные инструменты и поможет проекту развиваться.',
  'premium.beta': 'Пока идёт бета-версия, все функции сайта открыты для всех.',
  'premium.periodLabel': 'Срок подписки',
  'premium.period1': '1 месяц',
  'premium.period3': '3 месяца',
  'premium.period6': '6 месяцев',
  'premium.period12': '1 год',
  'premium.free': 'Бесплатно',
  'premium.freeDesc': 'Все разделы, тренировки и разбор каждого задания на трёх языках.',
  'premium.forever': 'навсегда',
  'premium.gold': 'Золото',
  'premium.goldDesc': 'Тесты на время без ограничений и подробная статистика.',
  'premium.diamond': 'Алмаз',
  'premium.diamondDesc': 'Всё из «Золота», план подготовки к экзамену и ИИ-помощник Препи.',
  'premium.amethyst': 'Аметист',
  'premium.amethystDesc': 'Всё из «Алмаза», Препи без ограничений, аудирование и speaking.',
  'premium.popular': 'Популярный',
  'premium.perMonthOnly': 'в месяц',
  'premium.forPeriod': 'за {period}',
  'premium.perMonth': '{price} в месяц',
  'premium.save': 'экономия {sum}',
  'premium.choose': 'Выбрать',
  'premium.play': 'Заниматься',
  'premium.compare': 'Что входит в тарифы',
  'premium.rowAll': 'Все разделы: экзамены, олимпиада, ежедневная практика',
  'premium.rowSolutions': 'Разбор каждого задания на трёх языках',
  'premium.rowTests': 'Тесты на время и пробные экзамены',
  'premium.limitDay': '3 в день',
  'premium.unlimited': 'без ограничений',
  'premium.rowStats': 'Подробная статистика и слабые темы',
  'premium.rowPlan': 'План подготовки к дате экзамена',
  'premium.rowTutor': 'ИИ-помощник Препи',
  'premium.tutorLimit': '30 вопросов в день',
  'premium.rowClass': 'Рейтинг класса и кабинет учителя',
  'premium.rowAudio': 'Аудирование и speaking',
  'premium.note': 'Состав тарифов предварительный и может измениться до подключения оплаты.',
  'premium.total': 'К оплате',
  'premium.approx': 'Примерно в твоей валюте',
  'premium.approxNote': 'Сумма в местной валюте округлена. Точную сумму определит твой банк по курсу на день оплаты.',
  'premium.notYet': 'Оплата пока не подключена. Идёт бета-версия, поэтому все функции сейчас открыты бесплатно.',
  'premium.ok': 'Понятно',
  'premium.supportTitle': 'Поддержать проект',
  'premium.supportText': 'Любая сумма помогает добавлять новые экзамены, задания и языки.',
  'premium.supportAmount': 'Сумма в долларах',
  'premium.supportBtn': 'Поддержать',
  'premium.supportBad': 'Введи сумму от 1 до 500 долларов.',
""",
    'en': """  'nav.premium': 'Plans',
  'home.premiumTitle': 'Plans and project support',
  'home.premiumText': 'Gold, Diamond and Amethyst — from $1.99 a month. During the beta everything is open for free.',
  'premium.title': 'Prep&Play plans',
  'premium.subtitle': 'All the core preparation is free. A subscription will unlock extra tools and help the project grow.',
  'premium.beta': 'During the beta, every feature of the site is open to everyone.',
  'premium.periodLabel': 'Subscription period',
  'premium.period1': '1 month',
  'premium.period3': '3 months',
  'premium.period6': '6 months',
  'premium.period12': '1 year',
  'premium.free': 'Free',
  'premium.freeDesc': 'All sections, practice and a solution for every question in three languages.',
  'premium.forever': 'forever',
  'premium.gold': 'Gold',
  'premium.goldDesc': 'Unlimited timed tests and detailed statistics.',
  'premium.diamond': 'Diamond',
  'premium.diamondDesc': 'Everything in Gold, a study plan for your exam and the AI helper Prepi.',
  'premium.amethyst': 'Amethyst',
  'premium.amethystDesc': 'Everything in Diamond, unlimited Prepi, listening and speaking.',
  'premium.popular': 'Popular',
  'premium.perMonthOnly': 'per month',
  'premium.forPeriod': 'for {period}',
  'premium.perMonth': '{price} per month',
  'premium.save': 'save {sum}',
  'premium.choose': 'Choose',
  'premium.play': 'Start practising',
  'premium.compare': 'What the plans include',
  'premium.rowAll': 'All sections: exams, olympiad math, daily practice',
  'premium.rowSolutions': 'A solution for every question in three languages',
  'premium.rowTests': 'Timed tests and mock exams',
  'premium.limitDay': '3 a day',
  'premium.unlimited': 'unlimited',
  'premium.rowStats': 'Detailed statistics and weak topics',
  'premium.rowPlan': 'A study plan for your exam date',
  'premium.rowTutor': 'AI helper Prepi',
  'premium.tutorLimit': '30 questions a day',
  'premium.rowClass': 'Class leaderboard and teacher dashboard',
  'premium.rowAudio': 'Listening and speaking',
  'premium.note': 'The contents of the plans are preliminary and may change before payments are launched.',
  'premium.total': 'To pay',
  'premium.approx': 'Roughly in your currency',
  'premium.approxNote': 'The amount in local currency is rounded. Your bank will set the exact amount at the rate on the day of payment.',
  'premium.notYet': 'Payments are not connected yet. The site is in beta, so every feature is open for free right now.',
  'premium.ok': 'Got it',
  'premium.supportTitle': 'Support the project',
  'premium.supportText': 'Any amount helps us add new exams, questions and languages.',
  'premium.supportAmount': 'Amount in dollars',
  'premium.supportBtn': 'Support',
  'premium.supportBad': 'Enter an amount from 1 to 500 dollars.',
""",
    'kk': """  'nav.premium': 'Тарифтер',
  'home.premiumTitle': 'Тарифтер және жобаны қолдау',
  'home.premiumText': 'Алтын, Алмас және Аметист — айына 1,99 $-дан бастап. Бета-нұсқа кезінде бәрі тегін ашық.',
  'premium.title': 'Prep&Play тарифтері',
  'premium.subtitle': 'Негізгі дайындықтың бәрі тегін. Жазылым қосымша құралдарды ашады және жобаның дамуына көмектеседі.',
  'premium.beta': 'Бета-нұсқа кезінде сайттың барлық мүмкіндіктері бәріне ашық.',
  'premium.periodLabel': 'Жазылым мерзімі',
  'premium.period1': '1 ай',
  'premium.period3': '3 ай',
  'premium.period6': '6 ай',
  'premium.period12': '1 жыл',
  'premium.free': 'Тегін',
  'premium.freeDesc': 'Барлық бөлімдер, жаттығулар және әр тапсырманың үш тілдегі талдауы.',
  'premium.forever': 'әрқашан',
  'premium.gold': 'Алтын',
  'premium.goldDesc': 'Уақытқа тесттер шектеусіз және толық статистика.',
  'premium.diamond': 'Алмас',
  'premium.diamondDesc': '«Алтынның» бәрі, емтиханға дайындық жоспары және ЖИ-көмекші Препи.',
  'premium.amethyst': 'Аметист',
  'premium.amethystDesc': '«Алмастың» бәрі, Препи шектеусіз, тыңдалым және speaking.',
  'premium.popular': 'Танымал',
  'premium.perMonthOnly': 'айына',
  'premium.forPeriod': '{period} үшін',
  'premium.perMonth': 'айына {price}',
  'premium.save': 'үнем {sum}',
  'premium.choose': 'Таңдау',
  'premium.play': 'Жаттығу',
  'premium.compare': 'Тарифтерге не кіреді',
  'premium.rowAll': 'Барлық бөлімдер: емтихандар, олимпиада, күнделікті жаттығу',
  'premium.rowSolutions': 'Әр тапсырманың үш тілдегі талдауы',
  'premium.rowTests': 'Уақытқа тесттер және сынақ емтихандары',
  'premium.limitDay': 'күніне 3',
  'premium.unlimited': 'шектеусіз',
  'premium.rowStats': 'Толық статистика және әлсіз тақырыптар',
  'premium.rowPlan': 'Емтихан күніне дейінгі дайындық жоспары',
  'premium.rowTutor': 'ЖИ-көмекші Препи',
  'premium.tutorLimit': 'күніне 30 сұрақ',
  'premium.rowClass': 'Сынып рейтингі және мұғалім кабинеті',
  'premium.rowAudio': 'Тыңдалым және speaking',
  'premium.note': 'Тарифтердің құрамы алдын ала берілген және төлем қосылғанға дейін өзгеруі мүмкін.',
  'premium.total': 'Төлем сомасы',
  'premium.approx': 'Шамамен өз валютаңда',
  'premium.approxNote': 'Жергілікті валютадағы сома дөңгелектелген. Нақты соманы банкің төлем күнгі бағам бойынша анықтайды.',
  'premium.notYet': 'Төлем әлі қосылмаған. Бета-нұсқа жүріп жатыр, сондықтан барлық мүмкіндіктер қазір тегін ашық.',
  'premium.ok': 'Түсінікті',
  'premium.supportTitle': 'Жобаны қолдау',
  'premium.supportText': 'Кез келген сома жаңа емтихандар, тапсырмалар мен тілдер қосуға көмектеседі.',
  'premium.supportAmount': 'Доллармен сома',
  'premium.supportBtn': 'Қолдау',
  'premium.supportBad': '1-ден 500 долларға дейінгі соманы енгіз.',
""",
}

OLD_KEY = re.compile(r"^  '(premium\.[A-Za-z0-9]+|home\.premium[A-Za-z]+|nav\.premium)':")

source = open(PATH, encoding='utf8').read()
lines = source.split('\n')
out = []
lang = None
removed = {'ru': 0, 'en': 0, 'kk': 0}
skip_next = False
for line in lines:
    if skip_next:
        # продолжение значения на следующей строке
        skip_next = not line.rstrip().endswith(',')
        continue
    start = re.match(r'^const (ru|en|kk) = \{$', line)
    if start:
        lang = start.group(1)
        out.append(line)
        out.extend(NEW[lang].rstrip('\n').split('\n'))
        continue
    if lang and OLD_KEY.match(line):
        removed[lang] += 1
        skip_next = not line.rstrip().endswith(',')
        continue
    if line == '};':
        lang = None
    out.append(line)

open(PATH, 'w', encoding='utf8').write('\n'.join(out))
print('removed old lines:', removed)
for code in NEW:
    print(code, 'new keys:', NEW[code].count("':"))

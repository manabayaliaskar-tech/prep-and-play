K = {
 'mock.progress': ('Твой прогресс','Your progress','Сенің прогресің'),
 'mock.attempts': ('попыток','attempts','әрекет'),
 'mock.bestShort': ('лучший','best','үздік'),
 'mock.lastShort': ('последний','latest','соңғы'),
 'mock.sinceFirst': ('с первой попытки','since the first try','алғашқы әрекеттен бері'),
 'mock.oneMore': ('Пройди экзамен ещё раз — и здесь появится график.','Take the exam once more and a chart will appear here.','Емтиханды тағы бір рет тапсыр — мұнда график пайда болады.'),
 'mock.hollow': ('полая точка — короткая версия','hollow dot — short version','қуыс нүкте — қысқа нұсқа'),
 'mock.slow': ('Баллы растут постепенно: сравнивай попытки одной версии и смотри на тенденцию за несколько недель.','Scores grow gradually: compare attempts of the same version and look at the trend over several weeks.','Балл біртіндеп өседі: бір нұсқадағы әрекеттерді салыстырып, бірнеше аптадағы үрдіске қара.'),
 'today.title': ('Что мне сегодня делать?','What should I do today?','Бүгін не істеймін?'),
 'today.kicker': ('План на сегодня','Today’s plan','Бүгінгі жоспар'),
 'today.desc': ('Собрали по твоим ошибкам, слабым темам и плану подготовки. Можно идти по порядку.','Built from your mistakes, weak topics and study plan. Go through it in order.','Қателеріңнен, әлсіз тақырыптарыңнан және дайындық жоспарыңнан құрастырылды. Ретімен орында.'),
 'today.cardDesc': ('Тренировка дня на {n} заданий и что ещё полезно сделать','A {n}-question daily mix and what else to do','{n} тапсырмалық күн жаттығуы және тағы не істеу пайдалы'),
 'today.doneShort': ('Тренировка дня пройдена · сделано {c} из {n}','Daily mix done · {c} of {n} completed','Күн жаттығуы өтілді · {n} ішінен {c} орындалды'),
 'today.mix': ('Тренировка дня: {n} заданий','Daily mix: {n} questions','Күн жаттығуы: {n} тапсырма'),
 'today.mixShort': ('Тренировка дня','Daily mix','Күн жаттығуы'),
 'today.fromMistakes': ('ошибок к повтору: {n}','mistakes to review: {n}','қайталанатын қате: {n}'),
 'today.fromCourse': ('слабые темы и план: {name}','weak topics and plan: {name}','әлсіз тақырыптар мен жоспар: {name}'),
 'today.fromQuiz': ('вопросы обо всём — чтобы понять, с чего начать','questions on everything — to see where to start','бәрі туралы сұрақтар — неден бастау керегін түсіну үшін'),
 'today.start': ('Начать','Start','Бастау'),
 'today.again': ('Ещё раз','Again','Тағы да'),
 'today.go': ('Перейти','Go','Өту'),
 'today.cards': ('Карточки: {n} слов к повтору','Flashcards: {n} words to review','Карточкалар: қайталанатын {n} сөз'),
 'today.mock': ('Пробный экзамен: {name}','Mock exam: {name}','Сынақ емтиханы: {name}'),
 'today.mockFirst': ('Ты ещё не проходил пробник — короткая версия займёт около часа.','You haven’t taken a mock yet — the short version takes about an hour.','Сен әлі сынақ тапсырған жоқсың — қысқа нұсқа шамамен бір сағат алады.'),
 'today.mockWeek': ('С последнего пробника прошла неделя — пора сверить прогресс.','A week has passed since your last mock — time to check your progress.','Соңғы сынақтан бері бір апта өтті — прогресті тексеретін уақыт.'),
 'today.season': ('Награды сезона ждут: {n}','Season rewards waiting: {n}','Маусым сыйлықтары күтіп тұр: {n}'),
 'today.seasonDesc': ('Монеты, сундуки и эксклюзивы месяца','Coins, chests and this month’s exclusives','Тиындар, сандықтар және ай эксклюзивтері'),
 'today.goal': ('Цель дня: осталось {n} XP','Daily goal: {n} XP to go','Күн мақсаты: тағы {n} XP'),
 'today.goalDone': ('Цель дня выполнена!','Daily goal reached!','Күн мақсаты орындалды!'),
 'today.goalDesc': ('Огонёк серии растёт, а Препи радуется','Your streak flame grows and Prepi is happy','Серия оты өседі, Препи қуанады'),
 'today.whyTitle': ('Почему эти темы','Why these topics','Неге осы тақырыптар'),
 'today.why': ('Здесь у тебя меньше всего верных ответов — на них тренировка дня делает упор.','These are where you get the fewest answers right, so the daily mix focuses on them.','Мұнда дұрыс жауабың ең аз — күн жаттығуы соларға көбірек көңіл бөледі.'),
 'today.mixDone': ('Тренировка дня пройдена!','Daily mix complete!','Күн жаттығуы өтілді!'),
 'today.back': ('К плану на сегодня','Back to today’s plan','Бүгінгі жоспарға'),
}
p='/home/user/School/src/i18n/strings.js'
s=open(p).read()
parts=s.split("  'wear.rainbow':")
assert len(parts)==4
out=parts[0]
for lang,part in zip(['ru','en','kk'],parts[1:]):
    li={'ru':0,'en':1,'kk':2}[lang]
    nl=part.index('\n')+1
    add=''.join("  '%s': '%s',\n" % (k, v[li].replace("\\","\\\\").replace("'","\\'")) for k,v in K.items())
    out+="  'wear.rainbow':"+part[:nl]+add+part[nl:]
open(p,'w').write(out)
print(len(K))

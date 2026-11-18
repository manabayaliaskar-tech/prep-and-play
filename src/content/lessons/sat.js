// Мини-уроки по SAT (навыки из content/skills.js). Формат - в index.js.

import { L, same } from '../../pools/gen.js';

// Короткая запись: тексты - массивы [en, ru, kk] (один элемент - одинаково везде), готовые L/same тоже допустимы.
const t = (a) => (Array.isArray(a) ? (a.length === 1 ? (typeof a[0] === 'string' ? same(a[0]) : a[0]) : L(a[0], a[1], a[2])) : a);
const les = (rule, points, q, steps, cq, opts, answer, why) => ({
  rule: t(rule),
  points: points.map(t),
  example: { q: t(q), steps: steps.map(t) },
  check: { q: t(cq), options: opts.map(t), answer, why: t(why) },
});

export default {
  words: les(
    [`Words in Context: before looking at the options, read the sentence and guess your own word for the blank. Then choose the option closest to your guess.`, `Слова в контексте: сначала прочитай предложение и придумай своё слово для пропуска, и только потом смотри варианты. Выбери тот, что ближе к твоему слову.`, `Контекстегі сөздер: алдымен сөйлемді оқып, бос орынға өз сөзіңді ойла, содан кейін ғана нұсқаларды қара. Өз сөзіңе ең жақынын таңда.`],
    [[`Look for clue words in the sentence: they define the missing word.`, `Ищи в предложении слова-подсказки: они определяют нужное слово.`, `Сөйлемнен нұсқау сөздерді іздеу керек: олар жетіспейтін сөзді анықтайды.`], [`Trap: a word's common meaning may not fit this context.`, `Ловушка: привычное значение слова может не подойти по контексту.`, `Тұзақ: сөздің әдеттегі мағынасы контекстке сәйкес келмеуі мүмкін.`], [`Plug the option back in and reread the whole sentence.`, `Подставь вариант в предложение и перечитай его целиком.`, `Нұсқаны сөйлемге қойып, толық қайта оқы.`]],
    [`Her explanation was so ______ that even beginners understood it at once. (lucid / ornate / vague)`],
    [[`Clue: "even beginners understood it at once".`, `Подсказка: «даже новички сразу поняли».`, `Нұсқау: «жаңадан бастағандар да бірден түсінді».`], [`My word: "clear".`, `Моё слово: «понятная».`, `Менің сөзім: «түсінікті».`], [`Closest option: lucid (clear). Ornate and vague would make it harder to understand.`, `Ближе всего lucid (ясная). Ornate и vague затруднили бы понимание.`, `Ең жақыны: lucid (айқын). Ornate мен vague түсінуді қиындатар еді.`]],
    [`Unlike his cautious brother, Leo was ______ and often took big risks.`, `В отличие от осторожного брата, Лео был ______ и часто сильно рисковал.`, `Сақ ағасынан айырмашылығы, Лео ______ болды және жиі қатты тәуекелге барды.`],
    [[`bold`], [`timid`], [`careful`]], 0,
    [`"Unlike" signals contrast with cautious, and "took big risks" confirms bold.`, `«В отличие от» указывает на контраст с осторожным, а «сильно рисковал» подтверждает bold (смелый).`, `«Айырмашылығы» сақтыққа қарама-қарсылықты көрсетеді, «қатты тәуекел» bold (батыл) екенін растайды.`]),

  structure: les(
    [`Structure and Purpose questions ask what the text does, not what it says. Name the function with a verb: introduces, challenges, illustrates, concludes.`, `В вопросах о структуре и цели важно, что текст делает, а не что в нём сказано. Назови функцию глаголом: вводит, оспаривает, иллюстрирует, подводит итог.`, `Құрылым және мақсат сұрақтары мәтін не айтатынын емес, не істейтінін сұрайды. Қызметін етістікпен ата: енгізеді, даулайды, мысалмен көрсетеді, қорытады.`],
    [[`Read the first and last sentences and spot signals like "Yet" or "For example".`, `Прочитай первое и последнее предложения и найди сигналы вроде «Yet» или «For example».`, `Бірінші және соңғы сөйлемді оқып, «Yet» немесе «For example» сияқты белгілерді тап.`], [`For an underlined sentence, ask what job it does for its neighbours.`, `Для подчёркнутого предложения спроси: какую роль оно играет рядом с соседними?`, `Асты сызылған сөйлемге: көрші сөйлемдерге қандай қызмет атқарады деп сұра.`], [`Trap: an option can be true in detail but describe the wrong function.`, `Ловушка: вариант может быть верен по фактам, но описывать не ту функцию.`, `Тұзақ: нұсқа фактіге сай болуы мүмкін, бірақ қызметі басқа болуы мүмкін.`]],
    [`Many people think bees only make honey. Yet bees also pollinate about a third of the food we eat. Without them, grocery shelves would look very different. Main purpose?`],
    [[`Sentence 1 states a common belief.`, `Предложение 1 называет распространённое мнение.`, `1-сөйлем кең таралған пікірді айтады.`], [`"Yet" in sentence 2 corrects it.`, `«Yet» в предложении 2 его поправляет.`, `2-сөйлемдегі «Yet» оны түзетеді.`], [`Sentence 3 shows the consequence, so the purpose is to correct a misconception and show why bees matter.`, `Предложение 3 показывает следствие, значит цель - исправить заблуждение и показать важность пчёл.`, `3-сөйлем салдарды көрсетеді, яғни мақсат - қате пікірді түзету және аралардың маңызын көрсету.`]],
    [`Some critics call the film slow. But its quiet pace lets viewers notice small details. What does the second sentence do?`, `Некоторые критики называют фильм медленным. Но его спокойный темп позволяет заметить мелкие детали. Что делает второе предложение?`, `Кейбір сыншылар фильмді баяу дейді. Бірақ оның байсалды қарқыны ұсақ детальдарды байқауға мүмкіндік береді. Екінші сөйлем не істейді?`],
    [[`It repeats the criticism.`, `Повторяет критику.`, `Сынды қайталайды.`], [`It summarizes the plot.`, `Пересказывает сюжет.`, `Сюжетті баяндайды.`], [`It offers a defense of the film.`, `Защищает фильм.`, `Фильмді қорғайды.`]], 2,
    [`"But" turns against the criticism and gives a benefit of the slow pace.`, `«But» противопоставляет критике и называет пользу медленного темпа.`, `«But» сынға қарсы шығып, баяу қарқынның пайдасын атайды.`]),

  cross: les(
    [`With two texts, first sum up each in a few words. Then name how they relate: agree, disagree, add detail, or give an example.`, `Когда два текста, сначала выдели суть каждого в паре слов. Затем определи связь: согласие, спор, дополнение или пример.`, `Екі мәтін болғанда, алдымен әрқайсысының мәнін бірнеше сөзбен жаз. Содан кейін байланысын анықта: келісу, қарсы шығу, толықтыру немесе мысал.`],
    [[`Answer about the author of Text 2 reacting to Text 1, not the reverse.`, `Если спрашивают о реакции автора текста 2 на текст 1 - не путай порядок.`, `Егер 2-мәтін авторының 1-мәтінге реакциясы сұралса - ретін шатастырма.`], [`Wrong options often exaggerate: "completely rejects" when it only qualifies.`, `Неверные варианты часто преувеличивают: «полностью отвергает», хотя лишь уточняет.`, `Қате нұсқалар көбіне асыра айтады: тек нақтылап тұрса да «толық жоққа шығарады» дейді.`]],
    [`Text 1: Remote work raises productivity. Text 2: Productivity gains vanish when teams need close collaboration. How would Text 2 respond to Text 1?`],
    [[`Text 1: remote work is good for output.`, `Текст 1: удалённая работа повышает отдачу.`, `1-мәтін: қашықтан жұмыс өнімділікті арттырады.`], [`Text 2: that holds only in some cases.`, `Текст 2: это верно лишь в некоторых случаях.`, `2-мәтін: бұл кей жағдайда ғана дұрыс.`], [`So Text 2 qualifies Text 1: it adds a limit, it does not reject it.`, `Значит, текст 2 уточняет текст 1: добавляет ограничение, а не отвергает.`, `Демек, 2-мәтін 1-мәтінді нақтылайды: шектеу қосады, жоққа шығармайды.`]],
    [`Text 1: Cities should ban cars downtown. Text 2: A ban would hurt small shops that rely on drivers. Relation?`, `Текст 1: Городам стоит запретить машины в центре. Текст 2: Запрет навредит маленьким магазинам, которым нужны водители. Какова связь?`, `1-мәтін: Қалалар орталықта көлікті тыйым салуы керек. 2-мәтін: Тыйым жүргізушілерге сүйенетін шағын дүкендерге зиян келтіреді. Қандай байланыс?`],
    [[`Text 2 supports Text 1.`, `Текст 2 поддерживает текст 1.`, `2-мәтін 1-мәтінді қолдайды.`], [`Text 2 raises an objection to Text 1.`, `Текст 2 возражает тексту 1.`, `2-мәтін 1-мәтінге қарсылық білдіреді.`], [`Text 2 repeats Text 1.`, `Текст 2 повторяет текст 1.`, `2-мәтін 1-мәтінді қайталайды.`]], 1,
    [`Text 2 names a harm of the ban, so it objects.`, `Текст 2 называет вред от запрета, значит возражает.`, `2-мәтін тыйымның зиянын атайды, яғни қарсы шығады.`]),

  central: les(
    [`The central idea is the one-sentence answer to "what is this whole passage about?". Details only support it.`, `Главная идея - ответ одним предложением на вопрос «о чём весь текст?». Детали лишь её поддерживают.`, `Басты ой - «бүкіл мәтін неден?» деген сұраққа бір сөйлемдік жауап. Детальдар оны ғана қолдайды.`],
    [[`Skim for the point the author keeps returning to.`, `Найди мысль, к которой автор возвращается снова и снова.`, `Автор қайта-қайта оралатын ойды тап.`], [`Trap: too narrow (one detail) or too broad (beyond the text).`, `Ловушка: слишком узко (одна деталь) или слишком широко (за пределами текста).`, `Тұзақ: тым тар (бір детальды) немесе тым кең (мәтіннен тыс).`], [`Beware extreme words like "always" and "never".`, `Остерегайся крайних слов вроде «всегда» и «никогда».`, `«Әрқашан» және «ешқашан» сияқты шектен тыс сөздерден сақтан.`]],
    [`Octopuses can open jars, escape tanks, and recognize human faces. Researchers say these skills show a flexible kind of intelligence. Central idea?`],
    [[`Details: jars, tanks, faces.`, `Детали: банки, аквариумы, лица.`, `Детальдар: құмыралар, аквариумдар, жүздер.`], [`They all point to one claim: octopuses are flexibly intelligent.`, `Все они ведут к одной мысли: осьминоги гибко мыслят.`, `Бәрі бір ойға әкеледі: сегізаяқтар икемді ойлайды.`], [`A correct answer states that claim, not just one trick.`, `Верный ответ называет эту мысль, а не один трюк.`, `Дұрыс жауап сол ойды айтады, бір ғана амалды емес.`]],
    [`Which is the best central idea for a text about a town that turned an old factory into a library, a gym, and a market?`, `Какая идея лучше всего подходит тексту о городе, превратившем старую фабрику в библиотеку, спортзал и рынок?`, `Ескі фабриканы кітапханаға, спортзалға және базарға айналдырған қала туралы мәтіннің басты ойы қайсысы?`],
    [[`Towns should never build new factories.`, `Городам нельзя строить новые фабрики.`, `Қалалар жаңа фабрика салмауы керек.`], [`A town reused an old building to serve many needs.`, `Город дал старому зданию новую жизнь для разных нужд.`, `Қала ескі ғимаратты әртүрлі қажеттілікке пайдаланды.`], [`The library has many books.`, `В библиотеке много книг.`, `Кітапханада кітап көп.`]], 1,
    [`It covers all details without going too broad (first) or too narrow (third).`, `Она охватывает все детали, не будучи слишком широкой (первый) или узкой (третий).`, `Ол барлық детальды қамтиды, тым кең (бірінші) немесе тым тар (үшінші) емес.`]),

  evidence: les(
    [`When asked which quote best supports a claim, test each option: does it directly prove the claim, or only mention the same topic?`, `Если нужно выбрать цитату, подтверждающую утверждение, проверь каждый вариант: он прямо доказывает утверждение или лишь касается той же темы?`, `Тұжырымды қолдайтын дәйексөзді таңдағанда әр нұсқаны тексер: ол тұжырымды тікелей дәлелдей ме, әлде тек сол тақырыпты айта ма?`],
    [[`Restate the claim in your own words first.`, `Сначала перескажи утверждение своими словами.`, `Алдымен тұжырымды өз сөзіңмен қайта айт.`], [`The right quote matches the claim's specific part, not just a keyword.`, `Верная цитата совпадает с конкретной частью утверждения, а не просто с ключевым словом.`, `Дұрыс дәйексөз тұжырымның нақты бөлігіне сәйкес келеді, тек кілт сөзге емес.`], [`Trap: a quote that sounds similar but says something weaker or different.`, `Ловушка: цитата звучит похоже, но говорит слабее или другое.`, `Тұзақ: ұқсас естілетін, бірақ әлсіздеу немесе басқаны айтатын дәйексөз.`]],
    [`Claim: Maya's garden thrives because she waters it daily. Which quote supports it? (A) "Maya planted roses in April." (B) "Each morning Maya waters the garden, and it blooms all summer."`],
    [[`The claim has two parts: daily watering and thriving.`, `В утверждении две части: ежедневный полив и процветание сада.`, `Тұжырымның екі бөлігі бар: күнде суару және гүлдеу.`], [`A mentions planting only, so it does not prove the claim.`, `A говорит только о посадке, значит не доказывает утверждение.`, `A тек отырғызуды айтады, яғни тұжырымды дәлелдемейді.`], [`B has both parts, so it is the answer.`, `В содержит обе части, это и есть ответ.`, `B-да екі бөлік те бар, жауап сол.`]],
    [`Claim: The study found that sleep improves memory. Which finding supports it?`, `Утверждение: исследование показало, что сон улучшает память. Какой результат это подтверждает?`, `Тұжырым: зерттеу ұйқы есті жақсартатынын көрсетті. Қай нәтиже оны қолдайды?`],
    [[`Students who slept 8 hours recalled more words than those who stayed awake.`, `Студенты, спавшие 8 часов, вспомнили больше слов, чем не спавшие.`, `8 сағат ұйықтаған студенттер ұйықтамағандарға қарағанда көбірек сөз есіне түсірді.`], [`Students said they liked the study.`, `Студенты сказали, что исследование им понравилось.`, `Студенттер зерттеу ұнағанын айтты.`], [`The study lasted two weeks.`, `Исследование длилось две недели.`, `Зерттеу екі апта жалғасты.`]], 0,
    [`Only the first compares memory results between sleep and no sleep.`, `Только первый сравнивает результаты памяти со сном и без него.`, `Тек біріншісі ұйқысы бар және жоқ жағдайдағы есті салыстырады.`]),

  quant: les(
    [`Read the title, axis labels, and units first. Then check each part of the claim against the actual numbers.`, `Сначала прочитай заголовок, подписи осей и единицы. Затем сверь каждую часть утверждения с реальными числами.`, `Алдымен тақырыпты, осьтердің атауларын және өлшем бірліктерін оқы. Содан кейін тұжырымның әр бөлігін нақты сандармен салыстыр.`],
    [[`Trap: wrong year, wrong category, or mixing up units.`, `Ловушка: не тот год, не та категория или перепутанные единицы.`, `Тұзақ: басқа жыл, басқа санат немесе шатасқан бірліктер.`], [`If the claim says "doubled" or "rose by 15", compute it.`, `Если в утверждении «удвоилось» или «выросло на 15» - посчитай.`, `Тұжырымда «екі есе» немесе «15-ке өсті» десе - есепте.`], [`The right option must be true in every part.`, `Верный вариант должен быть верен во всех частях.`, `Дұрыс нұсқа барлық бөлігінде шын болуы керек.`]],
    [`Sales (in thousands): 2021 - 40, 2022 - 55, 2023 - 70. Claim: sales rose by 15 thousand each year.`, `Продажи (в тысячах): 2021 - 40, 2022 - 55, 2023 - 70. Утверждение: продажи росли на 15 тысяч каждый год.`, `Сатылым (мыңмен): 2021 - 40, 2022 - 55, 2023 - 70. Тұжырым: сатылым жыл сайын 15 мыңға өсті.`],
    [[`2022: 55 - 40 = 15.`], [`2023: 70 - 55 = 15.`], [`Both years match, so the claim is supported.`, `Оба года совпадают, значит утверждение подтверждено.`, `Екі жыл да сәйкес, демек тұжырым қолдау тапты.`]],
    [`A chart shows 12 cats and 18 dogs. Which claim is supported?`, `На диаграмме 12 кошек и 18 собак. Какое утверждение подтверждается?`, `Диаграммада 12 мысық және 18 ит бар. Қай тұжырым қолдау табады?`],
    [[`Cats outnumber dogs.`, `Кошек больше, чем собак.`, `Мысық иттен көп.`], [`There are twice as many dogs as cats.`, `Собак вдвое больше, чем кошек.`, `Иттер мысықтан екі есе көп.`], [`Dogs outnumber cats by 6.`, `Собак больше, чем кошек, на 6.`, `Иттер мысықтан 6-ға көп.`]], 2,
    [`18 - 12 = 6; twice 12 would be 24, so only the last claim holds.`, `18 - 12 = 6; вдвое больше было бы 24, значит верно только последнее.`, `18 - 12 = 6; екі есе болса 24 болар еді, сондықтан тек соңғысы дұрыс.`]),

  inference: les(
    [`An inference must be necessarily true based on the text, not just possible. Stay close to what is written and ignore outside knowledge.`, `Вывод должен обязательно следовать из текста, а не быть просто возможным. Держись написанного и не привлекай посторонние знания.`, `Қорытынды мәтіннен міндетті түрде шығуы керек, тек мүмкін болуы жеткіліксіз. Жазылғанға сүйен, сырттан білім қоспа.`],
    [[`Ask: "Does the text force this?" If not, drop it.`, `Спроси: «Текст это гарантирует?» Если нет - отбрасывай.`, `Сұра: «Мәтін бұны кепілдей ме?» Жоқ болса - тастап кет.`], [`Trap: options that go too far or add new facts.`, `Ловушка: варианты, которые заходят слишком далеко или добавляют новые факты.`, `Тұзақ: тым алысқа кететін немесе жаңа факт қосатын нұсқалар.`], [`The safest option is usually modest.`, `Самый надёжный вариант обычно скромный по смыслу.`, `Ең сенімді нұсқа әдетте мазмұны жағынан қарапайым болады.`]],
    [`Every painting from the 1800s in the museum was donated. This portrait, painted in 1850, hangs in the museum. So the portrait was probably ______.`],
    [[`Rule from the text: 1800s paintings in the museum = donated.`, `Правило из текста: картины XIX века в музее = подаренные.`, `Мәтіндегі ереже: мұражайдағы XIX ғасыр картиналары = сыйға тартылған.`], [`The portrait is from 1850 and is in the museum.`, `Портрет 1850 года и висит в музее.`, `Портрет 1850 жылғы және мұражайда тұр.`], [`Conclusion: it was donated.`, `Вывод: его подарили.`, `Қорытынды: ол сыйға тартылған.`]],
    [`All of Ana's pets are cats. Ana has a pet named Milo. What must be true?`, `Все питомцы Аны - кошки. У Аны есть питомец по имени Майло. Что обязательно верно?`, `Аның барлық үй жануарлары - мысықтар. Анада Майло деген жануар бар. Не міндетті түрде шын?`],
    [[`Milo is a young cat.`, `Майло - молодая кошка.`, `Майло - жас мысық.`], [`Ana has only one pet.`, `У Аны только один питомец.`, `Анада бір ғана жануар бар.`], [`Milo is a cat.`, `Майло - кошка.`, `Майло - мысық.`]], 2,
    [`If all pets are cats, Milo must be one; age and number are not stated.`, `Если все питомцы - кошки, то Майло тоже; возраст и число не указаны.`, `Барлық жануар мысық болса, Майло да мысық; жасы мен саны айтылмаған.`]),

  boundaries: les(
    [`Two complete sentences cannot be joined by a comma alone. Use a period, a semicolon, or a comma plus a conjunction (and, but, so, yet).`, `Два полных предложения нельзя соединять одной запятой. Нужна точка, точка с запятой или запятая с союзом (and, but, so, yet).`, `Екі толық сөйлемді жалғыз үтірмен жалғауға болмайды. Нүкте, нүктелі үтір немесе үтір мен жалғаулық (and, but, so, yet) қажет.`],
    [[`Test each side: can it stand alone as a sentence?`, `Проверь каждую часть: может ли она быть отдельным предложением?`, `Әр бөлікті тексер: ол жеке сөйлем бола ала ма?`], [`A colon must follow a complete sentence.`, `Двоеточие ставят после полного предложения.`, `Қос нүкте толық сөйлемнен кейін қойылады.`], [`Never put a comma between a subject and its verb.`, `Не ставь запятую между подлежащим и сказуемым.`, `Бастауыш пен баяндауыштың арасына үтір қойма.`]],
    [`The experiment failed, the team tried again.`],
    [[`Both parts are complete sentences.`, `Обе части - полные предложения.`, `Екі бөлік те толық сөйлем.`], [`A comma alone is a comma splice, which is wrong.`, `Одна запятая - это comma splice, ошибка.`, `Жалғыз үтір - comma splice, қате.`], [`Fix: "The experiment failed, so the team tried again." or use a semicolon.`, `Исправление: «The experiment failed, so the team tried again.» или точка с запятой.`, `Түзету: «The experiment failed, so the team tried again.» немесе нүктелі үтір.`]],
    [`Which sentence is punctuated correctly?`, `Какое предложение расставлено верно?`, `Қай сөйлемнің тыныс белгілері дұрыс?`],
    [[`She loved math, she joined the club.`], [`She loved math; she joined the club.`], [`She loved math she joined the club.`]], 1,
    [`A semicolon correctly joins two complete sentences.`, `Точка с запятой верно соединяет два полных предложения.`, `Нүктелі үтір екі толық сөйлемді дұрыс жалғайды.`]),

  fss: les(
    [`Check that the verb matches its subject, pronouns match their nouns, and tense stays consistent. First find the real subject.`, `Проверь, что глагол согласуется с подлежащим, местоимение с существительным, а время не скачет. Сначала найди настоящее подлежащее.`, `Етістік бастауышқа, есімдік зат есімге сәйкес келетінін және шақ өзгермейтінін тексер. Алдымен нағыз бастауышты тап.`],
    [[`Cross out prepositional phrases (of, in, with): the subject is never inside them.`, `Вычеркни предложные обороты (of, in, with): подлежащее не бывает внутри них.`, `Көмекші сөз тіркестерін (of, in, with) сыз: бастауыш олардың ішінде болмайды.`], [`Each, every, and everyone take a singular verb.`, `Each, every, everyone требуют глагола в единственном числе.`, `Each, every, everyone жекеше етістікпен келеді.`], [`A pronoun must match its noun in number: "a student... they" is wrong.`, `Местоимение должно совпадать с существительным по числу.`, `Есімдік зат есіммен санда сәйкес болуы керек.`]],
    [`The box of old letters ______ on the shelf. (is / are)`],
    [[`Cross out "of old letters".`, `Вычеркиваем «of old letters».`, `«of old letters» сызылады.`], [`The subject is "box", which is singular.`, `Подлежащее - «box», единственное число.`, `Бастауыш - «box», жекеше.`], [`So the verb is "is".`, `Значит, глагол - «is».`, `Демек, етістік - «is».`]],
    [`Each of the students ______ a laptop.`, `Each of the students ______ a laptop. Какая форма верна?`, `Each of the students ______ a laptop. Қай форма дұрыс?`],
    [[`have`], [`having`], [`has`]], 2,
    [`"Each" is singular, so the verb is "has".`, `«Each» - единственное число, значит «has».`, `«Each» - жекеше, сондықтан «has».`]),

  transitions: les(
    [`First find the relationship between the two sentences, then pick the transition that expresses it. Ignore which word sounds fancy.`, `Сначала определи связь между двумя предложениями, затем выбери связку, которая её выражает. Не важно, какое слово звучит красивее.`, `Алдымен екі сөйлемнің байланысын анықта, содан кейін оны білдіретін байланыстырғышты таңда. Қай сөз әдемі естілгені маңызды емес.`],
    [[`Contrast: however, but, yet. Cause and result: therefore, thus.`, `Контраст: however, but, yet. Причина и следствие: therefore, thus.`, `Қарама-қарсылық: however, but, yet. Себеп-салдар: therefore, thus.`], [`Addition: moreover, also. Example: for instance.`, `Добавление: moreover, also. Пример: for instance.`, `Қосу: moreover, also. Мысал: for instance.`], [`Reread both sentences without the blank before choosing.`, `Перечитай оба предложения без пропуска, прежде чем выбирать.`, `Таңдамас бұрын екі сөйлемді бос орынсыз қайта оқы.`]],
    [`The trail looked easy. ______, it took five hours.`],
    [[`Sentence 1: easy. Sentence 2: five hours, so it was harder.`, `Предложение 1: легко. Предложение 2: пять часов, то есть труднее.`, `1-сөйлем: оңай. 2-сөйлем: бес сағат, яғни қиынырақ.`], [`The relationship is contrast.`, `Связь - контраст.`, `Байланыс - қарама-қарсылық.`], [`Answer: "However".`, `Ответ: «However».`, `Жауабы: «However».`]],
    [`Plants need light. ______, they need water.`, `Plants need light. ______, they need water. Какая связка подходит?`, `Plants need light. ______, they need water. Қай байланыстырғыш сәйкес?`],
    [[`However`], [`Therefore`], [`In addition`]], 2,
    [`The second sentence adds another need, so addition fits.`, `Второе предложение добавляет ещё одну потребность - подходит добавление.`, `Екінші сөйлем тағы бір қажеттілікті қосады, сондықтан қосу мағынасы сай.`]),

  synthesis: les(
    [`In Rhetorical Synthesis, read the goal first. Then choose the sentence that uses only the notes needed to achieve exactly that goal.`, `В заданиях на синтез сначала прочитай цель. Затем выбери предложение, которое использует только нужные заметки и достигает именно этой цели.`, `Риторикалық синтезде алдымен мақсатты оқы. Содан кейін дәл сол мақсатқа жету үшін қажет жазбаларды ғана қолданатын сөйлемді таңда.`],
    [[`Underline the goal words: "introduce", "contrast", "emphasize".`, `Подчеркни слова цели: «ввести», «сопоставить», «подчеркнуть».`, `Мақсат сөздерін сыз: «таныстыру», «салыстыру», «баса айту».`], [`Not every note belongs in the answer.`, `Не все заметки нужны в ответе.`, `Барлық жазба жауапқа керек емес.`], [`Trap: a true sentence that serves a different goal.`, `Ловушка: верное предложение, но для другой цели.`, `Тұзақ: дұрыс, бірақ басқа мақсатқа қызмет ететін сөйлем.`]],
    [`Notes: Reef Lines is a book about coral; it was published in 2022; it has 200 pages. Goal: emphasize when the book came out.`],
    [[`The goal is the date.`, `Цель - дата.`, `Мақсат - күні.`], [`Use the note about 2022; page count is not needed.`, `Берём заметку о 2022 годе; число страниц не нужно.`, `2022 жыл туралы жазбаны аламыз; бет саны қажет емес.`], [`Answer: "Published in 2022, Reef Lines is about coral."`, `Ответ: «Published in 2022, Reef Lines is about coral.»`, `Жауап: «Published in 2022, Reef Lines is about coral.»`]],
    [`Goal: emphasize the book's length. Notes: 200 pages; about coral; published in 2022.`, `Цель: подчеркнуть объём книги. Заметки: 200 страниц; о кораллах; издана в 2022.`, `Мақсат: кітаптың көлемін баса айту. Жазбалар: 200 бет; маржан туралы; 2022 жылы шықты.`],
    [[`Reef Lines is about coral.`], [`Reef Lines came out in 2022.`], [`Reef Lines runs a full 200 pages.`]], 2,
    [`Only the last one highlights the page count.`, `Только последний выделяет число страниц.`, `Тек соңғысы бет санын көрсетеді.`]),

  'lin-eq': les(
    [`Solve by keeping the equation balanced. On SAT, watch the special cases: if the x terms cancel, you get either no solution or infinitely many.`, `Решай, сохраняя баланс. На SAT есть особые случаи: если x сокращается, решений нет или их бесконечно много.`, `Теңдікті сақтап шеш. SAT-та ерекше жағдайлар бар: x қысқарып кетсе, шешім жоқ немесе шексіз көп болады.`],
    [[`Same x terms and the same constants: infinitely many solutions.`, `Одинаковые части с x и одинаковые константы: бесконечно много решений.`, `x бар бөліктер де, тұрақтылар да бірдей: шексіз көп шешім.`], [`Same x terms but different constants: no solution.`, `Одинаковые части с x, но разные константы: решений нет.`, `x бөліктері бірдей, тұрақтылар әртүрлі: шешім жоқ.`]],
    [`For what value of k does 2x + 6 = 2(x + k) have infinitely many solutions?`],
    [[`Expand: 2x + 6 = 2x + 2k.`], [`The x terms match, so the constants must match: 6 = 2k.`, `Части с x совпадают, значит совпадать должны и константы: 6 = 2k.`, `x бөліктері сәйкес, демек тұрақтылар да сәйкес болуы керек: 6 = 2k.`], [`k = 3.`]],
    [`How many solutions does 4x + 1 = 4x + 5 have?`, `Сколько решений у уравнения 4x + 1 = 4x + 5?`, `4x + 1 = 4x + 5 теңдеуінің неше шешімі бар?`],
    [[`None`, `Нет`, `Жоқ`], [`One`, `Одно`, `Біреу`], [`Infinitely many`, `Бесконечно много`, `Шексіз көп`]], 0,
    [`The x terms cancel and 1 = 5 is false, so there is no solution.`, `x сокращается, а 1 = 5 неверно, значит решений нет.`, `x қысқарады, ал 1 = 5 жалған, демек шешім жоқ.`]),

  'lin-func': les(
    [`A linear function is y = mx + b: m is the slope, b is where the line crosses the y-axis. Slope = (y2 - y1) / (x2 - x1).`, `Линейная функция - это y = mx + b: m - наклон, b - точка пересечения с осью y. Наклон = (y2 - y1) / (x2 - x1).`, `Сызықтық функция - y = mx + b: m - көлбеулік, b - y осін қиятын нүкте. Көлбеулік = (y2 - y1) / (x2 - x1).`],
    [[`Parallel lines have equal slopes.`, `У параллельных прямых наклоны равны.`, `Параллель түзулердің көлбеуі тең.`], [`Perpendicular slopes are negative reciprocals: 2 and -1/2.`, `У перпендикулярных наклоны - противоположные обратные: 2 и -1/2.`, `Перпендикуляр түзулердің көлбеуі қарама-қарсы кері сандар: 2 және -1/2.`]],
    [`Find the line through (1, 3) and (3, 7).`, `Найди прямую через (1, 3) и (3, 7).`, `(1, 3) және (3, 7) нүктелері арқылы өтетін түзуді тап.`],
    [[`Slope: (7 - 3) / (3 - 1) = 2.`, `Наклон: (7 - 3) / (3 - 1) = 2.`, `Көлбеулік: (7 - 3) / (3 - 1) = 2.`], [`Use (1, 3): 3 = 2 · 1 + b, so b = 1.`, `Подставим (1, 3): 3 = 2 · 1 + b, откуда b = 1.`, `(1, 3) қоямыз: 3 = 2 · 1 + b, одан b = 1.`], [`y = 2x + 1.`]],
    [`What is the slope of the line through (0, 1) and (2, 7)?`, `Каков наклон прямой через (0, 1) и (2, 7)?`, `(0, 1) және (2, 7) нүктелері арқылы өтетін түзудің көлбеуі қандай?`],
    [[`6`], [`3`], [`2`]], 1,
    [`(7 - 1) / (2 - 0) = 3.`]),

  'lin-model': les(
    [`In a word problem the slope is the change per one unit (a rate), and the intercept is the starting value (a fixed fee). Write y = rate · x + start.`, `В текстовой задаче наклон - это изменение на одну единицу (скорость), а b - начальное значение (фиксированная плата). Запиши y = скорость · x + начало.`, `Мәтінді есепте көлбеулік - бір бірлікке өзгеріс (жылдамдық), ал b - бастапқы мән (тұрақты төлем). y = жылдамдық · x + бастамасы деп жаз.`],
    [[`"Per" means rate: the number in front of x.`, `«За каждый» означает скорость: число перед x.`, `«Әр» сөзі жылдамдықты білдіреді: x алдындағы сан.`], [`"Fee", "initial", "at the start" means the constant.`, `«Плата», «начальный», «в начале» - это константа.`, `«Төлем», «бастапқы», «басында» - тұрақты.`]],
    [`A taxi charges $5 plus $2 per kilometer. How much is a 10 km ride?`, `Такси берёт 5 $ плюс 2 $ за каждый километр. Сколько стоит поездка в 10 км?`, `Такси 5 $ жəне әр километрі үшін 2 $ алады. 10 км жол қанша тұрады?`],
    [[`Model: C = 2d + 5.`, `Модель: C = 2d + 5.`, `Модель: C = 2d + 5.`], [`Put d = 10: C = 2 · 10 + 5.`], [`C = 25, so the ride costs $25.`, `C = 25, поездка стоит 25 $.`, `C = 25, жол 25 $ тұрады.`]],
    [`In y = 3x + 8, where y is the water depth in cm and x is the hours, what does 3 mean?`, `В y = 3x + 8, где y - глубина воды в см, а x - часы, что означает 3?`, `y = 3x + 8 теңдеуінде y - судың тереңдігі (см), x - сағат; 3 нені білдіреді?`],
    [[`Depth rises 3 cm each hour.`, `Глубина растёт на 3 см каждый час.`, `Тереңдік сағатына 3 см артады.`], [`Starting depth is 3 cm.`, `Начальная глубина 3 см.`, `Бастапқы тереңдік 3 см.`], [`After 3 hours depth is 8 cm.`, `Через 3 часа глубина 8 см.`, `3 сағаттан кейін тереңдік 8 см.`]], 0,
    [`The coefficient of x is the rate of change per hour.`, `Коэффициент при x - изменение за час.`, `x алдындағы коэффициент - сағатына өзгеріс.`]),

  systems: les(
    [`For a system of two equations, use substitution or elimination. Parallel lines (same slope, different intercept) give no solution; identical lines give infinitely many.`, `Для системы двух уравнений используй подстановку или сложение. Параллельные прямые (одинаковый наклон, разный сдвиг) дают ноль решений, совпадающие - бесконечно много.`, `Екі теңдеулер жүйесін қою немесе қосу әдісімен шеш. Параллель түзулер (көлбеуі бірдей, жылжуы басқа) шешімсіз, беттесетін түзулер шексіз көп шешімді.`],
    [[`Elimination: add the equations so one variable cancels.`, `Сложение: сложи уравнения, чтобы одна переменная ушла.`, `Қосу әдісі: теңдеулерді қосып, бір айнымалыны жой.`], [`Substitution: express one variable, then plug it in.`, `Подстановка: выразить одну переменную и подставить.`, `Қою: бір айнымалыны өрнектеп, екіншіге қою.`], [`Always check both equations.`, `Всегда проверяй оба уравнения.`, `Екі теңдеуді де тексер.`]],
    [`x + y = 10 and x - y = 2. Find x and y.`, `x + y = 10 и x - y = 2. Найди x и y.`, `x + y = 10 және x - y = 2. x пен y-ті тап.`],
    [[`Add: 2x = 12, so x = 6.`, `Сложим: 2x = 12, значит x = 6.`, `Қосамыз: 2x = 12, яғни x = 6.`], [`Then y = 10 - 6 = 4.`, `Тогда y = 10 - 6 = 4.`, `Сонда y = 10 - 6 = 4.`], [`Check: 6 - 4 = 2.`, `Проверка: 6 - 4 = 2.`, `Тексеру: 6 - 4 = 2.`]],
    [`x + y = 7 and x - y = 1. What is x?`, `x + y = 7 и x - y = 1. Чему равен x?`, `x + y = 7 және x - y = 1. x неге тең?`],
    [[`3`], [`4`], [`6`]], 1,
    [`Adding gives 2x = 8, so x = 4.`, `Сложение даёт 2x = 8, значит x = 4.`, `Қосқанда 2x = 8, демек x = 4.`]),

  inequalities: les(
    [`Solve an inequality like an equation, with one important change: when you multiply or divide by a negative number, flip the sign.`, `Решай неравенство как уравнение, но с одним важным отличием: при умножении или делении на отрицательное число знак меняется на противоположный.`, `Теңсіздікті теңдеудей шеш, бірақ бір маңызды айырмашылық бар: теріс санға көбейткенде немесе бөлгенде таңбаны өзгерт.`],
    [[`> and < are open: the number itself is not included.`, `> и < - строгие: само число не входит.`, `> және < қатаң: санның өзі кірмейді.`], [`≥ and ≤ include the number.`, `≥ и ≤ включают само число.`, `≥ және ≤ санның өзін қосады.`], [`Test one number from your answer.`, `Проверь одно число из ответа.`, `Жауаптағы бір санды тексер.`]],
    [`Solve -2x + 3 > 11.`, `Реши -2x + 3 > 11.`, `-2x + 3 > 11 шеш.`],
    [[`Subtract 3: -2x > 8.`, `Вычтем 3: -2x > 8.`, `3-ті азайтамыз: -2x > 8.`], [`Divide by -2 and flip the sign: x < -4.`, `Делим на -2 и меняем знак: x < -4.`, `-2-ге бөліп, таңбаны өзгертеміз: x < -4.`], [`Check x = -5: 10 + 3 = 13 > 11.`, `Проверка x = -5: 10 + 3 = 13 > 11.`, `Тексеру x = -5: 10 + 3 = 13 > 11.`]],
    [`Solve 3x - 2 ≤ 10.`, `Реши 3x - 2 ≤ 10.`, `3x - 2 ≤ 10 шеш.`],
    [[`x ≥ 4`], [`x ≤ 12`], [`x ≤ 4`]], 2,
    [`3x ≤ 12, so x ≤ 4 (dividing by a positive number keeps the sign).`, `3x ≤ 12, значит x ≤ 4 (деление на положительное число знак сохраняет).`, `3x ≤ 12, яғни x ≤ 4 (оң санға бөлгенде таңба өзгермейді).`]),

  quadratics: les(
    [`For ax² + bx + c = 0, try factoring first. Otherwise use the formula. The discriminant b² - 4ac tells the number of solutions: positive means two, zero means one, negative means none.`, `Для ax² + bx + c = 0 сначала попробуй разложить на множители, иначе используй формулу. Дискриминант b² - 4ac показывает число решений: положительный - два, нуль - одно, отрицательный - ни одного.`, `ax² + bx + c = 0 үшін алдымен көбейткіштерге жіктеп көр, болмаса формуланы қолдан. Дискриминант b² - 4ac шешім санын көрсетеді: оң - екі, нөл - біреу, теріс - жоқ.`],
    [[same(`x = (-b ± √(b² - 4ac)) / (2a)`)], [`Zero product rule: (x - p)(x - q) = 0 gives x = p or x = q.`, `Правило нуля: (x - p)(x - q) = 0 даёт x = p или x = q.`, `Нөл көбейтінді ережесі: (x - p)(x - q) = 0 болса, x = p немесе x = q.`]],
    [`Solve x² - 5x + 6 = 0.`, `Реши x² - 5x + 6 = 0.`, `x² - 5x + 6 = 0 шеш.`],
    [[`Find two numbers with product 6 and sum -5: -2 and -3.`, `Найдём два числа с произведением 6 и суммой -5: -2 и -3.`, `Көбейтіндісі 6, қосындысы -5 екі санды табамыз: -2 және -3.`], [`(x - 2)(x - 3) = 0.`], [`x = 2 or x = 3.`, `x = 2 или x = 3.`, `x = 2 немесе x = 3.`]],
    [`Solve x² - 9 = 0.`, `Реши x² - 9 = 0.`, `x² - 9 = 0 шеш.`],
    [[`x = 9`], [`x = 3 only`, `только x = 3`, `тек x = 3`], [`x = 3 or x = -3`, `x = 3 или x = -3`, `x = 3 немесе x = -3`]], 2,
    [`x² = 9 has two roots, 3 and -3.`, `x² = 9 имеет два корня: 3 и -3.`, `x² = 9 теңдеуінің екі түбірі бар: 3 және -3.`]),

  equivalent: les(
    [`Equivalent expressions are the same value in different forms. Expand brackets, combine like terms, and use exponent rules to match the form in the options.`, `Равносильные выражения имеют одно и то же значение в разной форме. Раскрывай скобки, приводи подобные и применяй правила степеней, чтобы получить форму из вариантов.`, `Мәндес өрнектер - әртүрлі түрдегі бірдей мән. Жақшаны аш, ұқсас мүшелерді біріктір және дәреже ережелерін қолданып, нұсқалардағы түрге келтір.`],
    [[same(`x^a · x^b = x^(a+b),  (x^a)^b = x^(ab)`)], [same(`(a + b)(a - b) = a² - b²`)], [`Test with a number like x = 2 if unsure.`, `Если сомневаешься, подставь число, например x = 2.`, `Күмән болса, x = 2 сияқты сан қойып көр.`]],
    [same(`(x + 3)(x - 2)`)],
    [[`Multiply each pair: x² - 2x + 3x - 6.`, `Умножаем каждую пару: x² - 2x + 3x - 6.`, `Әр жұпты көбейтеміз: x² - 2x + 3x - 6.`], [`Combine like terms: x² + x - 6.`, `Приводим подобные: x² + x - 6.`, `Ұқсас мүшелерді біріктіреміз: x² + x - 6.`]],
    [`Which expression is equivalent to x² - 16?`, `Какое выражение равносильно x² - 16?`, `x² - 16 өрнегіне қайсысы мәндес?`],
    [[`(x - 4)²`], [`(x - 4)(x + 4)`], [`(x + 4)²`]], 1,
    [`Difference of squares: x² - 4² = (x - 4)(x + 4).`, `Разность квадратов: x² - 4² = (x - 4)(x + 4).`, `Квадраттар айырмасы: x² - 4² = (x - 4)(x + 4).`]),

  exponential: les(
    [`Exponential growth is y = a · bᵗ: a is the start, b is the multiplier per step. For a percent rate r, b = 1 + r when growing and b = 1 - r when decaying.`, `Показательный рост - это y = a · bᵗ: a - начальное значение, b - множитель за шаг. При процентной ставке r: b = 1 + r при росте и b = 1 - r при убывании.`, `Көрсеткіштік өсу - y = a · bᵗ: a - бастапқы мән, b - әр қадамдағы көбейткіш. Пайыз r болса: өскенде b = 1 + r, кеміген кезде b = 1 - r.`],
    [[`b > 1 means growth, 0 < b < 1 means decay.`, `b > 1 - рост, 0 < b < 1 - убывание.`, `b > 1 - өсу, 0 < b < 1 - кему.`], [`Do not add the percent each time: multiply.`, `Не прибавляй процент каждый раз: умножай.`, `Пайызды әр жолы қосуға болмайды: көбейту керек.`]],
    [`A population of 200 grows 10% per year. How many after 2 years?`, `Популяция в 200 растёт на 10% в год. Сколько будет через 2 года?`, `200-ден тұратын популяция жылына 10%-ға өседі. 2 жылдан кейін қанша болады?`],
    [[`Model: y = 200 · 1.1ᵗ.`, `Модель: y = 200 · 1,1ᵗ.`, `Модель: y = 200 · 1,1ᵗ.`], [`t = 2: 200 · 1.21.`, `t = 2: 200 · 1,21.`, `t = 2: 200 · 1,21.`], [`y = 242.`]],
    [`A value of 50 falls 20% each year. Which model fits?`, `Величина 50 падает на 20% каждый год. Какая модель подходит?`, `50 шамасы жыл сайын 20%-ға кемиді. Қай модель сәйкес?`],
    [[`50 · 1.2ᵗ`], [`50 · 0.2ᵗ`], [`50 · 0.8ᵗ`]], 2,
    [`Falling 20% leaves 80%, so b = 0.8.`, `Падение на 20% оставляет 80%, значит b = 0,8.`, `20%-ға кему 80%-ды қалдырады, яғни b = 0,8.`]),

  functions: les(
    [`In f(x), x is a placeholder. To find f(3), replace every x with 3 and calculate. For f(g(x)), work from the inside out.`, `В f(x) буква x - место для значения. Чтобы найти f(3), замени каждый x на 3 и посчитай. Для f(g(x)) считай изнутри наружу.`, `f(x) жазбасында x - мән қоятын орын. f(3) табу үшін әр x-тің орнына 3 қойып есепте. f(g(x)) үшін ішінен сыртқа қарай есепте.`],
    [[`f(a) = b means the point (a, b) is on the graph.`, `f(a) = b значит, что точка (a, b) лежит на графике.`, `f(a) = b дегеніміз (a, b) нүктесі графикте жатыр.`], [`Use parentheses when you substitute negatives.`, `Подставляя отрицательные числа, используй скобки.`, `Теріс сандарды қойғанда жақша қолдан.`]],
    [`f(x) = 2x² - 3. Find f(3).`, `f(x) = 2x² - 3. Найди f(3).`, `f(x) = 2x² - 3. f(3) тап.`],
    [[`Replace x with 3: 2 · 3² - 3.`, `Подставим 3: 2 · 3² - 3.`, `x орнына 3 қоямыз: 2 · 3² - 3.`], [`2 · 9 - 3 = 15.`]],
    [`f(x) = 3x - 1. What is f(4)?`, `f(x) = 3x - 1. Чему равно f(4)?`, `f(x) = 3x - 1. f(4) неге тең?`],
    [[`12`], [`13`], [`11`]], 2,
    [`3 · 4 - 1 = 11.`]),

  nonlinear: les(
    [`A parabola y = a(x - h)² + k has its vertex at (h, k): a minimum if a > 0, a maximum if a < 0. A line meets a curve where their equations are equal, so set them equal and solve.`, `Парабола y = a(x - h)² + k имеет вершину (h, k): минимум при a > 0, максимум при a < 0. Прямая пересекает кривую там, где уравнения равны, поэтому приравняй их и реши.`, `y = a(x - h)² + k параболасының төбесі (h, k): a > 0 болса минимум, a < 0 болса максимум. Түзу қисықты теңдеулер тең болатын жерде қиып өтеді, сондықтан оларды теңестіріп шеш.`],
    [[`x-intercepts are where y = 0.`, `x-пересечения - там, где y = 0.`, `x-қиылысу нүктелері y = 0 болатын жерде.`], [`The number of intersections equals the number of solutions.`, `Число пересечений равно числу решений.`, `Қиылысу саны шешім санына тең.`]],
    [`What is the minimum value of y = (x - 2)² + 3?`, `Каково наименьшее значение y = (x - 2)² + 3?`, `y = (x - 2)² + 3 функциясының ең кіші мәні қандай?`],
    [[`The vertex is (2, 3).`, `Вершина - (2, 3).`, `Төбесі - (2, 3).`], [`a = 1 > 0, so the parabola opens up and the vertex is the lowest point.`, `a = 1 > 0, ветви вверх, вершина - самая низкая точка.`, `a = 1 > 0, тармақтары жоғары, төбесі - ең төменгі нүкте.`], [`Minimum value: 3 (at x = 2).`, `Наименьшее значение: 3 (при x = 2).`, `Ең кіші мән: 3 (x = 2 кезінде).`]],
    [`What is the vertex of y = (x + 1)² - 4?`, `Какова вершина y = (x + 1)² - 4?`, `y = (x + 1)² - 4 функциясының төбесі қандай?`],
    [[`(-1, -4)`], [`(1, -4)`], [`(-1, 4)`]], 0,
    [`x + 1 = x - (-1), so h = -1 and k = -4.`, `x + 1 = x - (-1), значит h = -1, k = -4.`, `x + 1 = x - (-1), яғни h = -1, k = -4.`]),

  ratios: les(
    [`For units, multiply by a conversion fraction so the unwanted units cancel. For ratios, split the total into parts: a ratio a : b makes a + b parts.`, `Для единиц измерения умножай на дробь-переход, чтобы лишние единицы сократились. Для отношений дели целое на части: отношение a : b даёт a + b частей.`, `Өлшем бірліктері үшін қажетсіз бірліктер қысқаратындай ауыстыру бөлшегіне көбейт. Қатынастар үшін бүтінді бөлікке бөл: a : b қатынасы a + b бөлік береді.`],
    [[`Write units next to numbers all the way through.`, `Пиши единицы рядом с числами на всех шагах.`, `Бірліктерді барлық қадамда сандардың жанына жаз.`], [`Rate = amount / time.`, `Скорость = количество / время.`, `Жылдамдық = мөлшер / уақыт.`]],
    [`Convert 90 km/h to m/s.`, `Переведи 90 км/ч в м/с.`, `90 км/сағ-ты м/с-қа ауыстыр.`],
    [[`1 km = 1000 m, 1 h = 3600 s.`, `1 км = 1000 м, 1 ч = 3600 с.`, `1 км = 1000 м, 1 сағ = 3600 с.`], [`90 · 1000 / 3600.`], [`= 25 m/s.`, `= 25 м/с.`, `= 25 м/с.`]],
    [`The ratio of boys to girls is 3 : 5 and there are 24 students. How many boys?`, `Отношение мальчиков к девочкам 3 : 5, всего 24 ученика. Сколько мальчиков?`, `Ұлдар мен қыздардың қатынасы 3 : 5, барлығы 24 оқушы. Ұлдар қанша?`],
    [[`15`], [`9`], [`8`]], 1,
    [`8 parts, so 1 part = 3 students and boys = 3 · 3 = 9.`, `8 частей, значит 1 часть = 3 ученика, мальчиков 3 · 3 = 9.`, `8 бөлік, яғни 1 бөлік = 3 оқушы, ұлдар 3 · 3 = 9.`]),

  percent: les(
    [`Part = percent / 100 · whole. To raise by p%, multiply by (1 + p/100); to lower, multiply by (1 - p/100). Successive changes multiply, they do not add.`, `Часть = процент / 100 · целое. Чтобы увеличить на p%, умножь на (1 + p/100); чтобы уменьшить - на (1 - p/100). Последовательные изменения перемножаются, а не складываются.`, `Бөлік = пайыз / 100 · бүтін. p%-ға арттыру үшін (1 + p/100)-ге, азайту үшін (1 - p/100)-ге көбейт. Біртіндеп өзгерістер қосылмайды, көбейтіледі.`],
    [[`"Of" means multiply.`, `«От» значит умножить.`, `«Of» көбейтуді білдіреді.`], [`Percent change = (new - old) / old · 100.`, `Изменение в процентах = (новое - старое) / старое · 100.`, `Пайыздық өзгеріс = (жаңа - ескі) / ескі · 100.`]],
    [`A price of 80 rises 25%, then falls 25%. What is the final price?`, `Цена 80 выросла на 25%, затем упала на 25%. Какова итоговая цена?`, `80 баға 25%-ға өсіп, содан кейін 25%-ға төмендеді. Соңғы баға қанша?`],
    [[`After the rise: 80 · 1.25 = 100.`, `После роста: 80 · 1,25 = 100.`, `Өскеннен кейін: 80 · 1,25 = 100.`], [`After the fall: 100 · 0.75 = 75.`, `После падения: 100 · 0,75 = 75.`, `Төмендегеннен кейін: 100 · 0,75 = 75.`], [`The result is 75, not 80.`, `Итог 75, а не 80.`, `Нәтиже 75, 80 емес.`]],
    [`What is 40 increased by 10%?`, `Сколько будет 40, увеличенное на 10%?`, `40-ты 10%-ға арттырса қанша болады?`],
    [[`44`], [`4`], [`50`]], 0,
    [`40 · 1.1 = 44.`, `40 · 1,1 = 44.`, `40 · 1,1 = 44.`]),

  stats: les(
    [`Mean = sum / count. Median = middle value of the sorted list. Range = max - min. Outliers pull the mean a lot but the median very little.`, `Среднее = сумма / количество. Медиана - середина упорядоченного списка. Размах = максимум - минимум. Выбросы сильно сдвигают среднее, а медиану почти нет.`, `Орташа = қосынды / саны. Медиана - реттелген тізімнің ортасы. Өріс = ең үлкені - ең кішісі. Шектен тыс мәндер орташаны көп, медиананы аз өзгертеді.`],
    [[`Sort the list before finding the median.`, `Перед поиском медианы упорядочи список.`, `Медиананы іздер алдында тізімді рет.`], [`Larger spread means larger standard deviation.`, `Больший разброс - больше стандартное отклонение.`, `Шашырау көп болса, стандартты ауытқу да көп.`]],
    [`Find the mean and median of 2, 3, 3, 4, 13.`, `Найди среднее и медиану для 2, 3, 3, 4, 13.`, `2, 3, 3, 4, 13 үшін орташа мен медиананы тап.`],
    [[`Mean: (2 + 3 + 3 + 4 + 13) / 5 = 25 / 5 = 5.`, `Среднее: (2 + 3 + 3 + 4 + 13) / 5 = 25 / 5 = 5.`, `Орташа: (2 + 3 + 3 + 4 + 13) / 5 = 25 / 5 = 5.`], [`Median: the middle of the sorted list is 3.`, `Медиана: середина упорядоченного списка - 3.`, `Медиана: реттелген тізімнің ортасы - 3.`], [`The outlier 13 raised the mean above the median.`, `Выброс 13 поднял среднее выше медианы.`, `13 шектен тыс мәні орташаны медианадан жоғары көтерді.`]],
    [`What is the median of 7, 1, 5?`, `Чему равна медиана чисел 7, 1, 5?`, `7, 1, 5 сандарының медианасы неге тең?`],
    [[`7`], [`1`], [`5`]], 2,
    [`Sorted: 1, 5, 7, so the middle is 5.`, `Упорядочим: 1, 5, 7, середина - 5.`, `Реттесек: 1, 5, 7, ортасы - 5.`]),

  probability: les(
    [`Probability = favorable outcomes / total outcomes. For independent events multiply the probabilities. For conditional probability, shrink the total to the given group.`, `Вероятность = благоприятные исходы / все исходы. Для независимых событий вероятности перемножаются. Для условной вероятности сузь общее число до заданной группы.`, `Ықтималдық = қолайлы нәтижелер / барлық нәтижелер. Тәуелсіз оқиғалар үшін ықтималдықтар көбейтіледі. Шартты ықтималдықта барлығын берілген топқа дейін тарылт.`],
    [[`The answer is always between 0 and 1.`, `Ответ всегда от 0 до 1.`, `Жауап әрқашан 0 мен 1 арасында.`], [`"Given that..." means use only that group as the total.`, `«При условии, что...» значит брать только эту группу как общее число.`, `«...болған жағдайда» дегені тек сол топты барлығы деп алу.`]],
    [`A bag has 3 red and 5 blue marbles. What is the probability of drawing red?`, `В мешке 3 красных и 5 синих шариков. Какова вероятность вытащить красный?`, `Қапта 3 қызыл және 5 көк шарик бар. Қызыл шарик алу ықтималдығы қандай?`],
    [[`Favorable: 3.`, `Благоприятных: 3.`, `Қолайлы: 3.`], [`Total: 3 + 5 = 8.`, `Всего: 3 + 5 = 8.`, `Барлығы: 3 + 5 = 8.`], [same(`P = 3/8`)]],
    [`A bag has 4 red and 6 green marbles. What is the probability of drawing green?`, `В мешке 4 красных и 6 зелёных шариков. Какова вероятность вытащить зелёный?`, `Қапта 4 қызыл және 6 жасыл шарик бар. Жасыл шарик алу ықтималдығы қандай?`],
    [[`2/5`], [`3/5`], [`6/4`]], 1,
    [`6 of 10 are green: 6/10 = 3/5.`, `Зелёных 6 из 10: 6/10 = 3/5.`, `10-ның 6-ы жасыл: 6/10 = 3/5.`]),

  models: les(
    [`A line of best fit y = mx + b predicts y from x. The slope m is the predicted change in y per 1 unit of x. The intercept b is the predicted y when x = 0.`, `Прямая наилучшего приближения y = mx + b предсказывает y по x. Наклон m - предсказанное изменение y на 1 единицу x. Свободный член b - предсказанное y при x = 0.`, `Ең жақсы жуықтау түзуі y = mx + b y-ті x арқылы болжайды. m көлбеуі - x бір бірлікке артқандағы y-тің болжамды өзгерісі. b - x = 0 кезіндегі болжамды y.`],
    [[`A prediction is not an exact value: points scatter around the line.`, `Предсказание - не точное значение: точки разбросаны вокруг прямой.`, `Болжам - нақты мән емес: нүктелер түзудің айналасында шашыраған.`], [`Do not predict far outside the data range.`, `Не делай прогнозов далеко за пределами данных.`, `Деректер аралығынан тым алыс болжам жасама.`]],
    [`The model y = 2.5x + 10 predicts a test score y from x hours of study. Interpret 2.5 and predict y for 4 hours.`, `Модель y = 2,5x + 10 предсказывает балл y по x часам подготовки. Объясни 2,5 и предскажи y для 4 часов.`, `y = 2,5x + 10 моделі x сағат дайындық бойынша y балын болжайды. 2,5-ті түсіндір және 4 сағатқа y-ті болжа.`],
    [[`Each extra hour of study predicts 2.5 more points.`, `Каждый дополнительный час подготовки добавляет по прогнозу 2,5 балла.`, `Әр қосымша сағат болжам бойынша 2,5 балл қосады.`], [`x = 4: 2.5 · 4 + 10.`, `x = 4: 2,5 · 4 + 10.`, `x = 4: 2,5 · 4 + 10.`], [`Predicted score: 20.`, `Предсказанный балл: 20.`, `Болжамды балл: 20.`]],
    [`Using y = 3x + 5, what is the predicted y when x = 10?`, `По модели y = 3x + 5 каково предсказанное y при x = 10?`, `y = 3x + 5 моделі бойынша x = 10 болғанда болжамды y қандай?`],
    [[`35`], [`30`], [`15`]], 0,
    [`3 · 10 + 5 = 35.`]),

  'area-volume': les(
    [`Know the standard formulas and keep units consistent. Area is in square units, volume in cubic units.`, `Знай основные формулы и следи за единицами. Площадь - в квадратных единицах, объём - в кубических.`, `Негізгі формулаларды біл және бірліктерді сәйкестендір. Аудан - шаршы бірлікпен, көлем - куб бірлікпен.`],
    [[same(`Triangle: ½bh.  Circle: πr².  Box: lwh.`)], [same(`Cylinder: πr²h.  Cone: ⅓πr²h.  Sphere: 4/3 πr³.`)], [`The reference box on the test lists these, but knowing them saves time.`, `Эти формулы есть в справке на тесте, но знание ускоряет работу.`, `Бұл формулалар тесттегі анықтамада бар, бірақ білу уақыт үнемдейді.`]],
    [`Find the volume of a cylinder with radius 3 cm and height 5 cm.`, `Найди объём цилиндра с радиусом 3 см и высотой 5 см.`, `Радиусы 3 см, биіктігі 5 см цилиндрдің көлемін тап.`],
    [[same(`V = πr²h`)], [same(`V = π · 3² · 5 = 45π`)], [`V = 45π cm³ (about 141 cm³).`, `V = 45π см³ (около 141 см³).`, `V = 45π см³ (шамамен 141 см³).`]],
    [`What is the volume of a box 2 cm by 3 cm by 4 cm?`, `Каков объём коробки 2 см на 3 см на 4 см?`, `2 см, 3 см және 4 см өлшемді қораптың көлемі қандай?`],
    [[`9 cm³`, `9 см³`, `9 см³`], [`24 cm³`, `24 см³`, `24 см³`], [`26 cm³`, `26 см³`, `26 см³`]], 1,
    [`2 · 3 · 4 = 24 cubic centimeters.`, `2 · 3 · 4 = 24 кубических сантиметра.`, `2 · 3 · 4 = 24 текше сантиметр.`]),

  angles: les(
    [`Key facts: angles of a triangle sum to 180°, angles on a straight line sum to 180°, vertical angles are equal. With parallel lines, corresponding and alternate angles are equal.`, `Главное: сумма углов треугольника 180°, сумма углов на прямой 180°, вертикальные углы равны. При параллельных прямых соответственные и накрест лежащие углы равны.`, `Басты фактілер: үшбұрыштың бұрыштар қосындысы 180°, түзудегі бұрыштар қосындысы 180°, вертикаль бұрыштар тең. Параллель түзулерде сәйкес және айқасқан бұрыштар тең.`],
    [[`An exterior angle equals the sum of the two remote interior angles.`, `Внешний угол равен сумме двух несмежных внутренних.`, `Сыртқы бұрыш өзімен сыбайлас емес екі ішкі бұрыштың қосындысына тең.`], [`An isosceles triangle has two equal angles.`, `У равнобедренного треугольника два угла равны.`, `Теңбүйірлі үшбұрыштың екі бұрышы тең.`]],
    [`A triangle has angles 50° and 60°. Find the third angle.`, `У треугольника углы 50° и 60°. Найди третий угол.`, `Үшбұрыштың екі бұрышы 50° және 60°. Үшінші бұрышты тап.`],
    [[`Sum is 180°.`, `Сумма равна 180°.`, `Қосынды 180°.`], [`50 + 60 = 110.`], [`180 - 110 = 70°.`]],
    [`Two angles on a straight line: one is 110°. What is the other?`, `Два угла на прямой: один равен 110°. Чему равен другой?`, `Түзудегі екі бұрыштың бірі 110°. Екіншісі неге тең?`],
    [[`70°`], [`80°`], [`110°`]], 0,
    [`Angles on a line sum to 180°: 180 - 110 = 70.`, `Углы на прямой дают 180°: 180 - 110 = 70.`, `Түзудегі бұрыштар қосындысы 180°: 180 - 110 = 70.`]),

  'right-tri': les(
    [`In a right triangle, a² + b² = c² (c is the hypotenuse). Trigonometry: sin = opposite / hypotenuse, cos = adjacent / hypotenuse, tan = opposite / adjacent.`, `В прямоугольном треугольнике a² + b² = c² (c - гипотенуза). Тригонометрия: sin = противолежащий / гипотенуза, cos = прилежащий / гипотенуза, tan = противолежащий / прилежащий.`, `Тікбұрышты үшбұрышта a² + b² = c² (c - гипотенуза). Тригонометрия: sin = қарсы катет / гипотенуза, cos = іргелес катет / гипотенуза, tan = қарсы катет / іргелес катет.`],
    [[`Common triples: 3-4-5, 5-12-13, 8-15-17.`, `Частые тройки: 3-4-5, 5-12-13, 8-15-17.`, `Жиі кездесетін үштіктер: 3-4-5, 5-12-13, 8-15-17.`], [`sin of an angle equals cos of its complement: sin 30° = cos 60°.`, `sin угла равен cos его дополнения: sin 30° = cos 60°.`, `Бұрыштың sin-і оның толықтауышының cos-іне тең: sin 30° = cos 60°.`]],
    [`The legs of a right triangle are 6 and 8. Find the hypotenuse.`, `Катеты прямоугольного треугольника 6 и 8. Найди гипотенузу.`, `Тікбұрышты үшбұрыштың катеттері 6 және 8. Гипотенузаны тап.`],
    [[same(`c² = 6² + 8² = 36 + 64 = 100`)], [`c = 10 (the 3-4-5 triangle doubled).`, `c = 10 (удвоенный треугольник 3-4-5).`, `c = 10 (екі еселенген 3-4-5 үшбұрышы).`]],
    [`In a right triangle the side opposite angle A is 5 and the hypotenuse is 13. What is sin A?`, `В прямоугольном треугольнике сторона против угла A равна 5, гипотенуза 13. Чему равен sin A?`, `Тікбұрышты үшбұрышта A бұрышына қарсы қабырға 5, гипотенуза 13. sin A неге тең?`],
    [[`12/13`], [`5/12`], [`5/13`]], 2,
    [`sin = opposite / hypotenuse = 5/13.`, `sin = противолежащий / гипотенуза = 5/13.`, `sin = қарсы катет / гипотенуза = 5/13.`]),

  circles: les(
    [`Circumference = 2πr, area = πr². An arc or sector is a fraction θ/360 of the whole circle. A circle with center (h, k) has equation (x - h)² + (y - k)² = r².`, `Длина окружности = 2πr, площадь = πr². Дуга или сектор - это доля θ/360 от всего круга. Окружность с центром (h, k) задаётся уравнением (x - h)² + (y - k)² = r².`, `Шеңбер ұзындығы = 2πr, ауданы = πr². Доға немесе сектор - бүкіл шеңбердің θ/360 бөлігі. Центрі (h, k) шеңбер теңдеуі: (x - h)² + (y - k)² = r².`],
    [[same(`Arc length = θ/360 · 2πr`)], [same(`Sector area = θ/360 · πr²`)], [`In the equation the right side is r², not r, and signs of h and k flip.`, `В уравнении справа стоит r², а не r, и знаки у h и k противоположные.`, `Теңдеудің оң жағында r², r емес, ал h пен k таңбалары кері.`]],
    [same(`(x - 1)² + (y + 2)² = 25`)],
    [[`Compare with (x - h)² + (y - k)² = r².`, `Сравним с (x - h)² + (y - k)² = r².`, `(x - h)² + (y - k)² = r² түрімен салыстырамыз.`], [`y + 2 = y - (-2), so the center is (1, -2).`, `y + 2 = y - (-2), значит центр (1, -2).`, `y + 2 = y - (-2), яғни центр (1, -2).`], [`r² = 25, so r = 5.`, `r² = 25, значит r = 5.`, `r² = 25, яғни r = 5.`]],
    [`What is the center of (x + 3)² + (y - 4)² = 9?`, `Каков центр окружности (x + 3)² + (y - 4)² = 9?`, `(x + 3)² + (y - 4)² = 9 шеңберінің центрі қандай?`],
    [[`(3, -4)`], [`(-3, 4)`], [`(-3, -4)`]], 1,
    [`x + 3 means h = -3, y - 4 means k = 4.`, `x + 3 даёт h = -3, y - 4 даёт k = 4.`, `x + 3 болса h = -3, y - 4 болса k = 4.`]),

  similar: les(
    [`Similar figures have the same shape: equal angles and proportional sides. If the scale factor is k, lengths are multiplied by k, areas by k², volumes by k³.`, `Подобные фигуры имеют одинаковую форму: равные углы и пропорциональные стороны. Если коэффициент подобия k, длины умножаются на k, площади на k², объёмы на k³.`, `Ұқсас фигуралардың пішіні бірдей: бұрыштары тең, қабырғалары пропорционал. Ұқсастық коэффициенті k болса, ұзындықтар k-ға, аудандар k²-қа, көлемдер k³-ке көбейеді.`],
    [[`Match corresponding sides carefully (same position).`, `Аккуратно сопоставляй соответственные стороны (на тех же местах).`, `Сәйкес қабырғаларды (бірдей орындағы) мұқият сәйкестендір.`], [`Two angles equal is enough to prove triangles similar.`, `Равенства двух углов достаточно для подобия треугольников.`, `Үшбұрыштардың ұқсастығына екі бұрыштың теңдігі жеткілікті.`]],
    [`Triangles are similar. One has sides 3 and 4, the other has sides 6 and x. Find x.`, `Треугольники подобны. У одного стороны 3 и 4, у другого 6 и x. Найди x.`, `Үшбұрыштар ұқсас. Біреуінің қабырғалары 3 және 4, екіншісінің 6 және x. x-ті тап.`],
    [[`Scale factor: 6 / 3 = 2.`, `Коэффициент подобия: 6 / 3 = 2.`, `Ұқсастық коэффициенті: 6 / 3 = 2.`], [`x = 4 · 2 = 8.`]],
    [`Two similar shapes have scale factor 3. What is the ratio of their areas?`, `Две подобные фигуры имеют коэффициент подобия 3. Каково отношение их площадей?`, `Екі ұқсас фигураның ұқсастық коэффициенті 3. Олардың аудандар қатынасы қандай?`],
    [[`3 : 1`], [`6 : 1`], [`9 : 1`]], 2,
    [`Areas scale by k² = 9.`, `Площади меняются в k² = 9 раз.`, `Аудандар k² = 9 есе өзгереді.`]),
};

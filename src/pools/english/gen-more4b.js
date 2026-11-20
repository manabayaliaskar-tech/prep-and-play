// Лексика и фразовые глаголы из таблиц определений (запись как в bank.js).
// Строка таблицы: уровень|вид|слово|определение|ru|kk.
// Вид: p - человек, l - место, t - предмет, v - глагол, h - свойство человека.
// Неверные варианты - другие слова той же таблицы, определения которых заведомо не совпадают.

const VOCAB = `
1|t|pen|something you write with|ручка|қалам
1|t|knife|something you use to cut food|нож|пышақ
1|t|bed|something you sleep on|кровать|төсек
1|t|chair|something you sit on|стул|орындық
1|t|clock|something that shows the time|часы|сағат
1|t|mirror|something you look at to see yourself|зеркало|айна
1|t|phone|something you use to call people|телефон|телефон
1|t|television|something you watch for news and films|телевизор|теледидар
1|t|window|something in a wall that lets light into a room|окно|терезе
1|t|door|something you open to go into a room|дверь|есік
1|t|lamp|something that gives light in a room|лампа|шам
1|t|bicycle|something with two wheels that you ride|велосипед|велосипед
1|t|ball|a round thing that you play games with|мяч|доп
1|t|soap|something you wash your hands with|мыло|сабын
1|t|towel|something you dry yourself with|полотенце|орамал
1|t|pillow|something soft you put your head on in bed|подушка|жастық
1|t|blanket|something warm that covers you in bed|одеяло|көрпе
1|t|plate|something flat that you put food on|тарелка|тәрелке
1|t|bottle|something you keep water or milk in|бутылка|бөтелке
1|t|envelope|something you put a letter in|конверт|конверт
1|t|ruler|something you use to draw straight lines|линейка|сызғыш
1|t|scissors|something you use to cut paper|ножницы|қайшы
1|t|comb|something you use to make your hair tidy|расчёска|тарақ
1|t|toothbrush|something you use to clean your teeth|зубная щётка|тіс щеткасы
1|p|teacher|teaches students at school|учитель|мұғалім
1|p|doctor|helps sick people to get well|врач|дәрігер
1|p|driver|drives a bus or a car|водитель|жүргізуші
1|p|cook|prepares food|повар|аспаз
1|p|singer|sings songs|певец|әнші
1|p|nurse|looks after patients in a hospital|медсестра|мейірбике
1|p|policeman|catches thieves and keeps people safe|полицейский|полицей
1|p|student|studies at school or university|студент|студент
1|p|actor|plays a role in a film or a play|актёр|актёр
1|p|painter|makes pictures with paint|художник|суретші
1|l|school|children go to learn|школа|мектеп
1|l|hospital|sick people are treated|больница|аурухана
1|l|restaurant|people eat meals that other people cook|ресторан|мейрамхана
1|l|park|people walk and play outside in the city|парк|саябақ
1|l|kitchen|people cook food at home|кухня|ас үй
1|l|bedroom|people sleep at home|спальня|жатын бөлме
1|l|station|trains or buses stop for passengers|вокзал|вокзал
1|l|farm|animals and crops are kept|ферма|ферма
1|l|beach|people swim next to the sea|пляж|жағажай
1|v|eat|put food in your mouth and swallow it|есть|жеу
1|v|drink|take water or tea into your mouth|пить|ішу
1|v|sleep|rest with your eyes closed at night|спать|ұйықтау
1|v|walk|move on foot|идти пешком|жаяу жүру
1|v|swim|move through water|плавать|жүзу
1|v|read|look at words and understand them|читать|оқу
1|v|write|put words on paper|писать|жазу
1|v|sing|make music with your voice|петь|ән салу
1|v|open|move a door or a window so that people can pass|открывать|ашу
1|v|close|shut a door or a window|закрывать|жабу
1|v|wash|clean something with water|мыть|жуу
1|v|cook|prepare food with heat|готовить|пісіру
1|v|wait|stay in a place until something happens|ждать|күту
1|v|buy|get something by paying money|покупать|сатып алу
1|v|sell|give something to a person for money|продавать|сату
1|v|dance|move your body to music|танцевать|билеу
1|h|tall|has a long body, taller than most people|высокий|ұзын бойлы
1|h|happy|feels good and smiles|счастливый|бақытты
1|h|sad|feels unhappy and may cry|грустный|қайғылы
1|h|hungry|wants to eat|голодный|аш
1|h|thirsty|wants to drink|испытывающий жажду|шөлдеген
1|h|tired|needs to rest or sleep|усталый|шаршаған
1|h|angry|is very cross with someone|сердитый|ашулы
1|h|old|has lived for many years|старый|қарт
1|h|young|has lived for only a few years|молодой|жас
2|p|pilot|flies planes|лётчик|ұшқыш
2|p|waiter|brings food to people in a restaurant|официант|даяшы
2|p|dentist|looks after people's teeth|стоматолог|тіс дәрігері
2|p|mechanic|repairs cars and machines|механик|механик
2|p|cashier|takes money from customers in a shop|кассир|кассир
2|p|lawyer|helps people with the law|юрист|заңгер
2|p|farmer|grows crops and keeps animals|фермер|фермер
2|p|librarian|works in a library|библиотекарь|кітапханашы
2|p|plumber|repairs water pipes|сантехник|сантехник
2|p|baker|makes bread and cakes|пекарь|наубайшы
2|p|photographer|takes pictures as a job|фотограф|фотограф
2|p|tourist|visits other places for a holiday|турист|турист
2|p|neighbour|lives next to you|сосед|көрші
2|l|library|you can borrow books|библиотека|кітапхана
2|l|bakery|bread and cakes are made and sold|пекарня|наубайхана
2|l|pharmacy|you can buy medicine|аптека|дәріхана
2|l|museum|old and interesting objects are shown to the public|музей|музей
2|l|airport|planes take off and land|аэропорт|әуежай
2|l|gym|people do exercise|спортзал|жаттығу залы
2|l|stadium|sports matches are played in front of crowds|стадион|стадион
2|l|bank|people keep their money|банк|банк
2|l|cinema|people watch films|кинотеатр|кинотеатр
2|l|zoo|wild animals are kept for people to see|зоопарк|хайуанаттар бағы
2|l|market|people buy and sell fruit and vegetables|рынок|базар
2|t|umbrella|something you hold over your head when it rains|зонт|қолшатыр
2|t|suitcase|a large bag for carrying clothes on a trip|чемодан|чемодан
2|t|ticket|a piece of paper that lets you travel or enter a place|билет|билет
2|t|passport|a document you need to travel to other countries|паспорт|төлқұжат
2|t|dictionary|a book that explains the meaning of words|словарь|сөздік
2|t|calendar|something that shows the days and months of the year|календарь|күнтізбе
2|t|wallet|a small case for money and cards|кошелёк|әмиян
2|t|battery|something that gives power to a phone or a torch|батарейка|батарея
2|t|map|a drawing that shows where places are|карта|карта
2|t|recipe|instructions for cooking a dish|рецепт|рецепт
2|t|receipt|a paper that shows you have paid for something|чек|чек
2|v|borrow|take something and give it back later|взять взаймы|қарызға алу
2|v|lend|give something to somebody for a short time|одолжить|қарызға беру
2|v|invite|ask someone to come to a party or event|приглашать|шақыру
2|v|repair|fix something that is broken|ремонтировать|жөндеу
2|v|collect|bring things together from different places|собирать|жинау
2|v|cancel|decide that something will not happen|отменять|жою
2|v|improve|become better|улучшать|жақсарту
2|v|decorate|make a place look nice with paint or flowers|украшать|безендіру
2|v|recycle|use waste materials again|перерабатывать|қайта өңдеу
2|h|generous|likes to give things to other people|щедрый|жомарт
2|h|lazy|does not want to work or make an effort|ленивый|жалқау
2|h|shy|feels nervous when meeting new people|застенчивый|ұялшақ
2|h|polite|always behaves in a respectful way|вежливый|сыпайы
2|h|curious|wants to know about everything|любопытный|қызығушы
2|h|honest|always tells the truth|честный|адал
2|h|brave|is not afraid of danger|храбрый|батыл
2|h|friendly|is kind and pleasant to everyone|дружелюбный|ақжарқын
3|p|colleague|works with you in the same company|коллега|әріптес
3|p|referee|makes sure players follow the rules in a match|судья|төреші
3|p|architect|designs buildings|архитектор|сәулетші
3|p|journalist|writes news for newspapers or websites|журналист|журналист
3|p|surgeon|performs operations on patients|хирург|хирург
3|p|tenant|pays rent to live in a flat|жилец, арендатор|жалға алушы
3|p|candidate|is applying for a job or running in an election|кандидат|үміткер
3|p|witness|sees a crime or accident happen|свидетель|куә
3|p|translator|changes writing from one language into another|переводчик|аудармашы
3|p|volunteer|works without being paid to help others|волонтёр|еріктілер
3|p|passenger|travels in a vehicle but does not drive it|пассажир|жолаушы
3|p|customer|buys goods or services from a shop|покупатель|тұтынушы
3|l|laundry|clothes are washed|прачечная|кір жуатын орын
3|l|theatre|actors perform plays|театр|театр
3|l|garage|cars are repaired or kept|гараж|гараж
3|l|dentist's|people go to have their teeth checked|стоматологический кабинет|тіс емдейтін бөлме
3|l|campsite|tents are put up for holidays|кемпинг|кемпинг
3|l|reception|guests of a hotel check in|стойка регистрации|қабылдау орны
3|t|souvenir|something you buy to remember a place you visited|сувенир|сыйлық-естелік
3|t|ingredient|one of the foods you use to make a dish|ингредиент|құрамдас бөлік
3|t|invoice|a document that lists goods and the money to pay|счёт|шот-фактура
3|t|deadline|the latest time by which something must be done|крайний срок|соңғы мерзім
3|t|shortage|a situation when there is not enough of something|нехватка|тапшылық
3|t|salary|the money you get every month for your job|зарплата|жалақы
3|t|fine|money you must pay for breaking a rule|штраф|айыппұл
3|t|queue|a line of people waiting for something|очередь|кезек
3|v|recommend|say that something is good and should be tried|рекомендовать|ұсыну
3|v|complain|say that you are not satisfied with something|жаловаться|шағымдану
3|v|apologise|say that you are sorry|извиняться|кешірім сұрау
3|v|attend|go to an event or lesson regularly|посещать|қатысу
3|v|postpone|move an event to a later time|откладывать|кейінге қалдыру
3|v|admire|respect and like someone very much|восхищаться|таңдану
3|v|prevent|stop something from happening|предотвращать|болдырмау
3|v|persuade|make someone agree by giving reasons|убеждать|көндіру
3|v|reduce|make something smaller or less|сокращать|азайту
3|v|replace|put a new thing in the place of an old one|заменять|ауыстыру
3|h|ambitious|wants very much to be successful|амбициозный|мақсатшыл
3|h|reliable|can always be trusted to do what is expected|надёжный|сенімді
3|h|stubborn|refuses to change their opinion|упрямый|қасарысқан
3|h|cheerful|is always happy and positive|жизнерадостный|көңілді
3|h|selfish|only thinks about their own needs|эгоистичный|өзімшіл
3|h|creative|has many new and original ideas|творческий|шығармашыл
3|h|modest|does not talk proudly about their achievements|скромный|қарапайым
3|h|talkative|likes to talk a lot|разговорчивый|сөзшең
4|p|ambassador|represents their country in a foreign country|посол|елші
4|p|spokesperson|speaks officially for an organisation|пресс-секретарь|ресми өкіл
4|p|rival|competes against you for the same thing|соперник|бәсекелес
4|p|mentor|gives advice and guidance to a less experienced person|наставник|тәлімгер
4|p|skeptic|doubts that something is true|скептик|күмәншіл
4|p|pedestrian|walks in the street instead of driving|пешеход|жаяу жүргінші
4|p|ancestor|was a member of your family long ago|предок|ата-баба
4|p|critic|gives opinions on books, films or music|критик|сыншы
4|p|refugee|has been forced to leave their country because of danger|беженец|босқын
4|p|heir|will receive money or property when someone dies|наследник|мұрагер
4|p|trainee|is learning a job by working|стажёр|жаттықтырылушы
4|t|bargain|something that costs less than its normal price|выгодная покупка|тиімді сатып алу
4|t|loophole|a gap in a law that lets people avoid it|лазейка|олқылық
4|t|stance|a firm opinion or position on an issue|позиция|ұстаным
4|t|obstacle|something that blocks your way or makes progress difficult|препятствие|кедергі
4|t|sibling|a brother or a sister|брат или сестра|аға-іні немесе апа-сіңлі
4|t|currency|the system of money used in a country|валюта|валюта
4|t|asset|something valuable that a person or company owns|актив|актив
4|t|prejudice|an unfair opinion formed without knowing the facts|предубеждение|алдын ала пікір
4|t|compromise|an agreement in which both sides accept less than they wanted|компромисс|ымыраға келу
4|t|loan|money that you borrow and must pay back|кредит|несие
4|t|merit|a good quality that deserves praise|заслуга|артықшылық
4|v|undermine|weaken something gradually|подрывать|әлсіретіп жіберу
4|v|enforce|make people obey a law or rule|обеспечивать исполнение|орындауға мәжбүрлеу
4|v|overcome|succeed in dealing with a problem|преодолевать|жеңу
4|v|abolish|officially end a law or system|отменять (закон)|жою
4|v|assess|judge the quality or amount of something|оценивать|бағалау
4|v|neglect|fail to look after something properly|пренебрегать|елемеу
4|v|exaggerate|say that something is bigger or better than it is|преувеличивать|асыра сілтеу
4|v|consume|use or eat or drink something|потреблять|тұтыну
4|v|flourish|grow strongly and be successful|процветать|гүлдену
4|v|resign|officially leave your job|уходить в отставку|отставкаға кету
4|h|gullible|believes everything people tell them|доверчивый|аңқау
4|h|frugal|spends very little money|бережливый|үнемшіл
4|h|ruthless|has no pity and does whatever is needed to succeed|безжалостный|аяусыз
4|h|diligent|works hard and carefully|прилежный|еңбекқор
4|h|arrogant|thinks they are better than other people|высокомерный|менмен
4|h|sceptical|doubts that things are true or useful|скептичный|күмәншіл
4|h|tactful|is careful not to upset other people|тактичный|сыпайы, мәдениетті
4|h|impulsive|acts quickly without thinking|импульсивный|ойланбай әрекет ететін
5|p|philanthropist|gives a lot of money to help people in need|филантроп|қайырымдылық жасаушы
5|p|whistleblower|tells the public about illegal activity inside an organisation|разоблачитель|жария етуші
5|p|procrastinator|keeps delaying things that must be done|прокрастинатор|кейінге қалдырушы
5|p|perfectionist|wants everything to be exactly right|перфекционист|мінсіздікке ұмтылушы
5|p|pessimist|always expects the worst to happen|пессимист|пессимист
5|p|veteran|has a lot of experience in a particular activity|ветеран|тәжірибелі маман
5|p|arbitrator|is chosen to settle a dispute between two sides|арбитр|төреші
5|p|dissident|publicly disagrees with the government|диссидент|диссидент
5|l|sanctuary|animals or people are protected from danger|убежище|пана жер
5|l|observatory|scientists study the stars|обсерватория|обсерватория
5|l|archive|old documents and records are stored|архив|мұрағат
5|l|foundry|metal is melted and shaped|литейный цех|құю цехы
5|l|embassy|diplomats represent their country abroad|посольство|елшілік
5|l|plaza|people meet in a large open public square|площадь|алаң
5|t|dilemma|a situation in which you must choose between two bad options|дилемма|қиын таңдау
5|t|backlash|a strong negative reaction to something|резкая негативная реакция|кері реакция
5|t|milestone|an important stage in the development of something|веха|маңызды кезең
5|t|stalemate|a situation in which neither side can win or make progress|тупик|тығырық
5|t|scrutiny|careful and critical examination of something|тщательная проверка|мұқият тексеру
5|t|windfall|a large amount of money that you did not expect|неожиданный доход|күтпеген пайда
5|t|resilience|the ability to recover quickly from difficulties|стойкость|төзімділік
5|t|catalyst|something that causes a change to happen|катализатор|катализатор
5|v|alleviate|make pain or a problem less severe|облегчать|жеңілдету
5|v|advocate|publicly support an idea or plan|выступать за|жақтау
5|v|scrutinise|examine very carefully|тщательно изучать|мұқият зерттеу
5|v|proliferate|increase quickly in number|быстро распространяться|тез көбею
5|v|reiterate|say something again to make it clear|повторять|қайталап айту
5|v|jeopardise|put something at risk|ставить под угрозу|қауіп төндіру
5|v|substantiate|prove that something is true with evidence|подтверждать доказательствами|дәлелдеу
5|v|exacerbate|make a bad situation worse|усугублять|ушықтыру
5|v|curtail|reduce or limit something|сокращать, ограничивать|шектеу
5|h|meticulous|pays great attention to every small detail|скрупулёзный|өте мұқият
5|h|gregarious|enjoys being with other people|общительный|көпшіл
5|h|astute|quickly understands a situation and uses it to advantage|проницательный|тапқыр
5|h|obstinate|refuses to change their mind however hard you try|упорный, упрямый|қыңыр
5|h|aloof|is distant and not friendly|отстранённый|алшақ, салқын
5|h|resourceful|is good at finding ways to solve problems|находчивый|тапқыр, іскер
5|h|ostentatious|likes to show off their wealth|показной|көрсетпек
5|h|fickle|keeps changing their opinions or feelings|непостоянный|құбылмалы
6|p|oracle|gives wise advice that is thought to be always right|оракул|даналық иесі
6|p|philistine|has no interest in art or culture|обыватель|мәдениетке бейтарап адам
6|p|sycophant|praises powerful people to gain an advantage|подхалим|жағымпаз
6|p|maverick|thinks and acts in an independent way|независимо мыслящий человек|дербес ойлайтын адам
6|p|zealot|is extremely enthusiastic about a cause|фанатик|діттеуші
6|p|dilettante|takes up an activity without being serious about it|дилетант|әуесқой
6|p|nomad|moves from place to place with no permanent home|кочевник|көшпенді
6|t|juxtaposition|placing two things close together to show a contrast|сопоставление|қарама-қарсы қою
6|t|paradigm|a typical model or pattern of something|парадигма|үлгі, парадигма
6|t|conundrum|a confusing problem that is difficult to solve|головоломка|жұмбақ
6|t|nemesis|an enemy that is hard to defeat|заклятый враг|жеңе алмайтын қарсылас
6|t|panacea|a solution that is supposed to cure all problems|панацея|барлық дертке шипа
6|t|hiatus|a pause in an activity|перерыв|үзіліс
6|t|zenith|the highest point of success or power|зенит, вершина|шың, ең жоғары нүкте
6|v|vindicate|prove that someone was right or innocent|оправдывать|ақтау
6|v|obfuscate|make something unclear or hard to understand|запутывать|бұлдырату
6|v|ostracise|deliberately exclude someone from a group|изгонять из общества|қоғамнан аластау
6|v|belittle|make someone or something seem unimportant|принижать|кемсіту
6|v|eschew|deliberately avoid something|избегать|қашу
6|v|extol|praise something very highly|превозносить|мақтап көкке көтеру
6|h|sanguine|is cheerful and hopeful about the future|оптимистичный|үмітшіл
6|h|taciturn|speaks very little|молчаливый|аз сөйлейтін
6|h|magnanimous|forgives easily and is generous toward rivals|великодушный|кеңпейіл
6|h|ebullient|is full of energy and enthusiasm|бурлящий энергией|өмірге құштар
6|h|sagacious|has good judgement and wisdom|мудрый|дана
6|h|dogmatic|insists that their own opinions are the only correct ones|догматичный|догматик
6|h|parsimonious|is unwilling to spend money|скупой|сараң
`;

const PHR = `
2|get up|rise from your bed|вставать с постели|төсектен тұру
2|turn on|start a machine or light|включать|қосу
2|turn off|stop a machine or light|выключать|өшіру
2|put on|dress yourself in clothes|надевать|киіну
2|take off|remove something you are wearing|снимать (одежду)|шешу
2|look for|try to find something|искать|іздеу
2|look after|take care of someone|присматривать|қарау, күту
2|wake up|stop sleeping|просыпаться|ояну
2|sit down|take a seat|садиться|отыру
2|stand up|rise to your feet|вставать|тұру
2|come back|return to a place|возвращаться|оралу
2|go out|leave your home to do something social|выходить из дома|сыртқа шығу
2|give back|return something to its owner|возвращать|қайтарып беру
2|pick up|lift something from the floor|поднимать|көтеріп алу
2|throw away|put something in the bin|выбрасывать|тастау
2|fill in|write information on a form|заполнять|толтыру
2|find out|learn a fact|узнавать|анықтау
2|hurry up|go or act faster|торопиться|асығу
2|slow down|go more slowly|замедлять ход|жылдамдықты азайту
2|clean up|make a place tidy|убирать|жинастыру
2|try on|put on clothes to see if they fit|примерять|киіп көру
2|set off|begin a journey|отправляться в путь|жолға шығу
2|grow up|become an adult|вырасти|есею
2|cheer up|become happier|взбодриться|көңілді болу
2|calm down|become quieter and less angry|успокаиваться|тынышталу
2|carry on|continue doing something|продолжать|жалғастыру
3|take up|start a new hobby or activity|заняться (чем-то)|айналысып кету
3|give up|stop trying or stop a habit|бросать, сдаваться|тастау, берілу
3|put off|move something to a later time|откладывать|кейінге қалдыру
3|call off|cancel an event|отменять|жою
3|turn down|refuse an offer or request|отклонять|бас тарту
3|look up|search for information in a book or online|искать (в справочнике)|іздеп табу
3|look forward to|wait for something with pleasure|ждать с нетерпением|тағатсыздана күту
3|get along with|have a good relationship with someone|ладить|тіл табысу
3|run out of|have no more of something|исчерпать запас|таусылу
3|keep up with|stay at the same level or speed as others|не отставать|қалыспау
3|come across|find something by chance|наткнуться|кездейсоқ табу
3|get over|recover from an illness or a shock|оправиться|айығу
3|put up with|accept something annoying without complaining|терпеть|шыдау
3|make up|invent a story or an excuse|выдумывать|ойлап шығару
3|point out|draw attention to a fact|указывать на|көрсету
3|set up|establish a business or organisation|основать|құру
3|fall out|have an argument and stop being friends|поссориться|араздасу
3|bring up|raise a child|воспитывать|тәрбиелеу
3|take after|look or behave like an older relative|походить на|ұқсау
3|show up|arrive at a place|появляться|келіп жету
3|hand in|give work to a teacher|сдавать (работу)|тапсыру
3|drop out|leave school before finishing|бросить учёбу|оқуды тастау
3|let down|disappoint someone|подводить|көңілін қалдыру
3|split up|end a relationship|расставаться|ажырасу
3|end up|finally be in a place or situation|оказаться в итоге|соңында болу
4|carry out|perform or complete a task|выполнять|орындау
4|come up with|think of an idea or plan|придумать|ойлап табу
4|cut down on|eat, use or do less of something|сократить потребление|азайту
4|deal with|take action to solve a problem|справляться, иметь дело|шешумен айналысу
4|fall through|fail to happen|сорваться|жүзеге аспау
4|figure out|understand or solve something|понять, разобраться|түсіну, шешу
4|get away with|avoid punishment for a wrong action|уйти от наказания|жазасыз қалу
4|go through|experience something difficult|пережить|бастан кешіру
4|look into|investigate something|расследовать|зерттеу, тексеру
4|pull off|succeed in doing something difficult|добиться успеха в трудном|қиын істі істеп шығу
4|put forward|suggest an idea for discussion|выдвигать|ұсыну
4|run into|meet someone by chance|случайно встретить|кездейсоқ кездесу
4|stand for|represent or mean something|означать, символизировать|білдіру
4|stand out|be easy to notice|выделяться|көзге түсу
4|take over|take control of something|принимать на себя|басқаруды алу
4|turn out|prove to be in the end|оказаться|болып шығу
4|back up|support someone or something|поддерживать|қолдау
4|break out|start suddenly, like a war or a fire|вспыхнуть|басталып кету
4|bring about|cause something to happen|вызвать|тудыру
4|call for|demand or require something|требовать|талап ету
4|catch on|become popular|стать популярным|кең тарау
4|come down with|become ill with a disease|заболеть|ауырып қалу
4|do away with|get rid of something completely|покончить с|жою
4|draw up|prepare a plan or document|составлять|жасау, құрастыру
4|fall back on|use as a last resort|прибегнуть к|соңғы амал ретінде қолдану
5|iron out|solve small problems|уладить мелкие проблемы|кішігірім мәселелерді шешу
5|phase out|gradually stop using something|постепенно прекращать|біртіндеп тоқтату
5|rule out|decide that something is not possible|исключать|жоққа шығару
5|boil down to|be basically|сводиться к|мәнінде … болу
5|bring to light|make something known|выявлять|әшкерелеу
5|come to terms with|accept something unpleasant|смириться с|қабылдау
5|get round to|find time to do something|дойти до|қолы жету
5|take on|accept a responsibility|взять на себя|мойнына алу
5|follow up|do something more after a first action|довести до конца|жалғастыру
5|live up to|be as good as people expected|оправдывать ожидания|үмітті ақтау
5|opt out of|choose not to take part|отказаться от участия|қатыспауды таңдау
5|shed light on|explain something so it is easier to understand|прояснять|түсіндіре түсу
5|weigh up|consider the good and bad points carefully|взвешивать|салмақтау
5|wind up|end up in a situation|в итоге оказаться|соңында болу
5|write off|decide that something is lost or has failed|списать со счетов|жоқ деп есептеу
5|touch on|mention something briefly|вскользь затронуть|тоқталып өту
5|set back|delay the progress of something|задерживать|кері тарту
5|sum up|give the main points of something briefly|подытожить|қорытындылау
5|spell out|explain something in a very clear way|разъяснять подробно|жан-жақты түсіндіру
5|break down|stop working because of a fault|ломаться|істен шығу
5|crack down on|take strict action against something|принимать жёсткие меры|қатаң шара қолдану
5|pass away|die, in a polite way|скончаться|қайтыс болу
6|bite the bullet|face a difficult situation bravely|стиснуть зубы и сделать|төзіп, шешім қабылдау
6|hit the nail on the head|be exactly right|попасть в точку|дәл тап басу
6|the tip of the iceberg|a small visible part of a much bigger problem|верхушка айсберга|үлкен мәселенің аз ғана бөлігі
6|burn the midnight oil|work late into the night|работать допоздна|түн ортасына дейін жұмыс істеу
6|a blessing in disguise|something bad that turns out to be good|не было бы счастья, да несчастье помогло|жамандық ішіндегі жақсылық
6|break the ice|make people feel more relaxed at the start|растопить лёд|араға жылу кіргізу
6|cost an arm and a leg|be extremely expensive|стоить целое состояние|өте қымбат болу
6|let the cat out of the bag|reveal a secret by mistake|проболтаться|байқамай құпияны ашу
6|once in a blue moon|very rarely|раз в сто лет|өте сирек
6|under the weather|slightly ill|неважно себя чувствовать|сәл ауырып жүру
6|a piece of cake|something very easy|проще простого|өте оңай нәрсе
6|call it a day|stop working for the day|на сегодня хватит|жұмысты тоқтату
6|face the music|accept punishment for what you have done|отвечать за содеянное|жауап беру
6|sit on the fence|refuse to choose between two sides|занимать выжидательную позицию|ортада қалу
6|the last straw|the final problem that makes a situation unbearable|последняя капля|соңғы тамшы
6|throw in the towel|admit defeat and stop trying|признать поражение|жеңілгенін мойындау
6|bark up the wrong tree|have the wrong idea about how to solve something|ошибаться в выборе пути|қате жолмен жүру
6|cut corners|do something badly to save time or money|делать кое-как ради экономии|жұмысты қысқарту
6|jump on the bandwagon|join something that has become popular|присоединиться к модному течению|сәнге ілесу
6|miss the boat|lose a chance because you were too late|упустить шанс|мүмкіндікті жіберіп алу
6|in the nick of time|just before it is too late|в самый последний момент|нақ уақытында
6|go back to square one|start again from the beginning|начать всё сначала|басынан бастау
6|bend over backwards|try very hard to help someone|из кожи вон лезть|жанталаса көмектесу
6|steal the show|attract the most attention in a performance|затмить всех|назарды өзіне аудару
6|beat around the bush|avoid talking about the main point|ходить вокруг да около|айналып өту
`;

const parse = (txt) =>
  txt
    .trim()
    .split('\n')
    .map((l) => {
      const [level, type, word, def, ru, kk] = l.split('|');
      return { level: Number(level), type, word, def, ru, kk };
    });

const FRAME = {
  p: (w) => `A ______ is a person who ${w.def}.`,
  l: (w) => `A ______ is a place where ${w.def}.`,
  t: (w) => `A ______ is ${w.def}.`,
  v: (w) => `To ______ means to ${w.def}.`,
  h: (w) => `Someone who is ______ ${w.def}.`,
};
const FRAME_B = {
  p: (w) => `A ${w.word} is a person who ______.`,
  l: (w) => `A ${w.word} is a place where ______.`,
  v: (w) => `To ${w.word} means to ______.`,
  h: (w) => `Someone who is ${w.word} ______.`,
};

/** Три неверных слова: другие слова того же вида из соседних уровней. */
function others(list, item, n, step) {
  const pool = list.filter((x) => x !== item && x.type === item.type && Math.abs(x.level - item.level) <= 1);
  const out = [];
  const start = list.indexOf(item) * 7 + step;
  for (let k = 0; out.length < n && k < pool.length * 2; k++) {
    const x = pool[(start + k * 5) % pool.length];
    if (x.word !== item.word && !out.some((o) => o.word === x.word)) out.push(x);
  }
  return out;
}

const vocab = parse(VOCAB);
const vocabRows = [];
for (const w of vocab) {
  const ref = [`${w.word} - ${w.ru}`, `${w.word} - ${w.kk}`];
  const wrong = others(vocab, w, 3, 1);
  if (wrong.length === 3) vocabRows.push([w.level, FRAME[w.type](w), w.word, wrong.map((x) => x.word), ref]);
  if (FRAME_B[w.type]) {
    const wr = others(vocab, w, 3, 3);
    if (wr.length === 3) vocabRows.push([w.level, FRAME_B[w.type](w), w.def, wr.map((x) => x.def), ref]);
  }
}

const phr = parse(PHR.replace(/^(\d)\|/gm, '$1|v|'));
const phrRows = [];
for (const w of phr) {
  const ref = [`${w.word} - ${w.ru}`, `${w.word} - ${w.kk}`];
  const wrong = others(phr, w, 3, 2);
  if (wrong.length < 3) continue;
  if (w.level === 6) {
    phrRows.push([6, `The idiom ______ means: ${w.def}.`, w.word, wrong.map((x) => x.word), ref]);
  } else {
    phrRows.push([w.level, `To ______ means to ${w.def}.`, w.word, wrong.map((x) => x.word), ref]);
    const wr = others(phr, w, 3, 5);
    if (wr.length === 3) phrRows.push([w.level, `To "${w.word}" means to ______.`, w.def, wr.map((x) => x.def), ref]);
  }
}

export const MORE4_GEN2 = { 'e.vocab': vocabRows, 'e.phrasal': phrRows };

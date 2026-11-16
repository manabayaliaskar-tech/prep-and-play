// Китайские слова по уровням HSK 1–6. Строка: иероглифы|пиньинь|английский|русский|казахский.

const HSK1 = `
我|wǒ|I|я|мен
你|nǐ|you|ты|сен
他|tā|he|он|ол (ер адам)
我们|wǒmen|we|мы|біз
爸爸|bàba|dad|папа|әке
妈妈|māma|mum|мама|ана
儿子|érzi|son|сын|ұл
女儿|nǚ'ér|daughter|дочь|қыз
朋友|péngyou|friend|друг|дос
老师|lǎoshī|teacher|учитель|мұғалім
学生|xuésheng|student|ученик|оқушы
医生|yīshēng|doctor|врач|дәрігер
人|rén|person|человек|адам
狗|gǒu|dog|собака|ит
猫|māo|cat|кошка|мысық
水|shuǐ|water|вода|су
茶|chá|tea|чай|шай
米饭|mǐfàn|cooked rice|варёный рис|піскен күріш
苹果|píngguǒ|apple|яблоко|алма
杯子|bēizi|cup|чашка|кесе
书|shū|book|книга|кітап
字|zì|character, letter|иероглиф, знак|таңба
电脑|diànnǎo|computer|компьютер|компьютер
电视|diànshì|television|телевизор|теледидар
电影|diànyǐng|film|фильм|фильм
飞机|fēijī|plane|самолёт|ұшақ
出租车|chūzūchē|taxi|такси|такси
学校|xuéxiào|school|школа|мектеп
饭店|fàndiàn|restaurant|ресторан|мейрамхана
商店|shāngdiàn|shop|магазин|дүкен
医院|yīyuàn|hospital|больница|аурухана
火车站|huǒchēzhàn|railway station|вокзал|темір жол вокзалы
中国|Zhōngguó|China|Китай|Қытай
家|jiā|home, family|дом, семья|үй, отбасы
今天|jīntiān|today|сегодня|бүгін
明天|míngtiān|tomorrow|завтра|ертең
昨天|zuótiān|yesterday|вчера|кеше
年|nián|year|год|жыл
月|yuè|month, moon|месяц, луна|ай
星期|xīngqī|week|неделя|апта
上午|shàngwǔ|morning (before noon)|утро (до полудня)|түске дейін
下午|xiàwǔ|afternoon|после полудня|түстен кейін
天气|tiānqì|weather|погода|ауа райы
吃|chī|to eat|есть|жеу
喝|hē|to drink|пить|ішу
看|kàn|to look, to watch|смотреть|қарау
听|tīng|to listen|слушать|тыңдау
说|shuō|to speak|говорить|сөйлеу
写|xiě|to write|писать|жазу
买|mǎi|to buy|покупать|сатып алу
去|qù|to go|идти, ехать|бару
来|lái|to come|приходить|келу
住|zhù|to live (somewhere)|жить (где-то)|тұру
做|zuò|to do, to make|делать|істеу
坐|zuò|to sit|сидеть|отыру
喜欢|xǐhuan|to like|нравиться, любить|ұнату
想|xiǎng|to want, to think|хотеть, думать|қалау, ойлау
睡觉|shuìjiào|to sleep|спать|ұйықтау
认识|rènshi|to know (a person)|быть знакомым|танысу
会|huì|can (have learned to)|уметь|істей білу
大|dà|big|большой|үлкен
小|xiǎo|small|маленький|кішкентай
多|duō|many, much|много|көп
少|shǎo|few, little|мало|аз
冷|lěng|cold|холодный|суық
热|rè|hot|жаркий|ыстық
好|hǎo|good|хороший|жақсы
漂亮|piàoliang|pretty|красивый|әдемі
高兴|gāoxìng|glad|радостный|қуанышты
`;

const HSK2 = `
哥哥|gēge|elder brother|старший брат|аға
姐姐|jiějie|elder sister|старшая сестра|әпке
弟弟|dìdi|younger brother|младший брат|іні
妹妹|mèimei|younger sister|младшая сестра|сіңлі
丈夫|zhàngfu|husband|муж|күйеу
妻子|qīzi|wife|жена|әйелі
孩子|háizi|child|ребёнок|бала
服务员|fúwùyuán|waiter|официант|даяшы
鸡蛋|jīdàn|egg|яйцо|жұмыртқа
西瓜|xīguā|watermelon|арбуз|қарбыз
牛奶|niúnǎi|milk|молоко|сүт
鱼|yú|fish|рыба|балық
咖啡|kāfēi|coffee|кофе|кофе
手表|shǒubiǎo|wristwatch|наручные часы|қол сағат
手机|shǒujī|mobile phone|мобильный телефон|ұялы телефон
报纸|bàozhǐ|newspaper|газета|газет
衣服|yīfu|clothes|одежда|киім
眼睛|yǎnjing|eye|глаз|көз
身体|shēntǐ|body, health|тело, здоровье|дене, денсаулық
公司|gōngsī|company|компания|компания
机场|jīchǎng|airport|аэропорт|әуежай
教室|jiàoshì|classroom|класс (комната)|сынып бөлмесі
房间|fángjiān|room|комната|бөлме
路|lù|road|дорога|жол
雪|xuě|snow|снег|қар
太阳|tàiyáng|sun|солнце|күн
颜色|yánsè|colour|цвет|түс
红|hóng|red|красный|қызыл
白|bái|white|белый|ақ
黑|hēi|black|чёрный|қара
生日|shēngrì|birthday|день рождения|туған күн
晚上|wǎnshang|evening|вечер|кеш
去年|qùnián|last year|в прошлом году|былтыр
小时|xiǎoshí|hour|час|сағат (уақыт)
问题|wèntí|question, problem|вопрос, проблема|сұрақ, мәселе
考试|kǎoshì|exam|экзамен|емтихан
旅游|lǚyóu|to travel|путешествовать|саяхаттау
运动|yùndòng|sport|спорт|спорт
游泳|yóuyǒng|to swim|плавать|жүзу
跑步|pǎobù|to run|бегать|жүгіру
唱歌|chànggē|to sing|петь|ән айту
跳舞|tiàowǔ|to dance|танцевать|билеу
帮助|bāngzhù|to help|помогать|көмектесу
告诉|gàosu|to tell|сообщать|айтып беру
介绍|jièshào|to introduce|представлять, знакомить|таныстыру
等|děng|to wait|ждать|күту
找|zhǎo|to look for|искать|іздеу
给|gěi|to give|давать|беру
卖|mài|to sell|продавать|сату
懂|dǒng|to understand|понимать|түсіну
知道|zhīdào|to know (a fact)|знать|білу
觉得|juéde|to feel, to think|считать, чувствовать|сезіну, санау
希望|xīwàng|to hope|надеяться|үміттену
开始|kāishǐ|to begin|начинать|бастау
准备|zhǔnbèi|to prepare|готовиться|дайындалу
起床|qǐchuáng|to get up|вставать|төсектен тұру
上班|shàngbān|to go to work|ходить на работу|жұмысқа бару
便宜|piányi|cheap|дешёвый|арзан
贵|guì|expensive|дорогой|қымбат
快|kuài|fast|быстрый|жылдам
慢|màn|slow|медленный|баяу
远|yuǎn|far|далёкий|алыс
近|jìn|near|близкий|жақын
新|xīn|new|новый|жаңа
长|cháng|long|длинный|ұзын
高|gāo|tall, high|высокий|биік
累|lèi|tired|уставший|шаршаған
忙|máng|busy|занятой|бос емес
快乐|kuàilè|happy, joyful|весёлый|көңілді
`;

const HSK3 = `
爷爷|yéye|grandfather|дедушка|ата
奶奶|nǎinai|grandmother|бабушка|әже
叔叔|shūshu|uncle|дядя|аға (әкесінің інісі)
阿姨|āyí|aunt|тётя|апай
邻居|línjū|neighbour|сосед|көрші
同事|tóngshì|colleague|коллега|әріптес
经理|jīnglǐ|manager|менеджер|менеджер
司机|sījī|driver|водитель|жүргізуші
校长|xiàozhǎng|headmaster|директор школы|мектеп директоры
香蕉|xiāngjiāo|banana|банан|банан
面包|miànbāo|bread|хлеб|нан
蛋糕|dàngāo|cake|торт|торт
筷子|kuàizi|chopsticks|палочки для еды|таяқшалар
冰箱|bīngxiāng|fridge|холодильник|тоңазытқыш
空调|kōngtiáo|air conditioner|кондиционер|кондиционер
电梯|diàntī|lift|лифт|лифт
地铁|dìtiě|metro|метро|метро
自行车|zìxíngchē|bicycle|велосипед|велосипед
船|chuán|boat|лодка, судно|қайық, кеме
护照|hùzhào|passport|паспорт|төлқұжат
地图|dìtú|map|карта|карта
图书馆|túshūguǎn|library|библиотека|кітапхана
公园|gōngyuán|park|парк|саябақ
超市|chāoshì|supermarket|супермаркет|супермаркет
银行|yínháng|bank|банк|банк
城市|chéngshì|city|город|қала
国家|guójiā|country|страна|ел
河|hé|river|река|өзен
山|shān|mountain|гора|тау
树|shù|tree|дерево|ағаш
鸟|niǎo|bird|птица|құс
熊猫|xióngmāo|panda|панда|панда
马|mǎ|horse|лошадь|жылқы
头发|tóufa|hair|волосы|шаш
耳朵|ěrduo|ear|ухо|құлақ
鼻子|bízi|nose|нос|мұрын
嘴|zuǐ|mouth|рот|ауыз
脚|jiǎo|foot|ступня|табан
季节|jìjié|season|время года|жыл мезгілі
春|chūn|spring|весна|көктем
夏|xià|summer|лето|жаз
秋|qiū|autumn|осень|күз
冬|dōng|winter|зима|қыс
历史|lìshǐ|history|история|тарих
数学|shùxué|mathematics|математика|математика
音乐|yīnyuè|music|музыка|музыка
文化|wénhuà|culture|культура|мәдениет
节日|jiérì|festival|праздник|мереке
礼物|lǐwù|gift|подарок|сыйлық
照片|zhàopiàn|photo|фотография|фотосурет
作业|zuòyè|homework|домашнее задание|үй тапсырмасы
词典|cídiǎn|dictionary|словарь|сөздік
成绩|chéngjì|results, grades|оценки, результаты|үлгерім
办法|bànfǎ|way, method|способ|амал
机会|jīhuì|chance|шанс, возможность|мүмкіндік
习惯|xíguàn|habit|привычка|әдет
打扫|dǎsǎo|to clean|убирать|тазалау
借|jiè|to borrow, to lend|брать или давать взаймы|қарызға алу не беру
搬|bān|to move (house)|переезжать|көшу
选择|xuǎnzé|to choose|выбирать|таңдау
决定|juédìng|to decide|решать|шешу
关心|guānxīn|to care about|заботиться|қамқорлық жасау
担心|dānxīn|to worry|беспокоиться|уайымдау
相信|xiāngxìn|to believe|верить|сену
忘记|wàngjì|to forget|забывать|ұмыту
害怕|hàipà|to be afraid|бояться|қорқу
生气|shēngqì|angry|сердитый|ашулы
健康|jiànkāng|healthy|здоровый|сау
安静|ānjìng|quiet|тихий|тыныш
干净|gānjìng|clean|чистый|таза
简单|jiǎndān|simple|простой|қарапайым
容易|róngyì|easy|лёгкий|оңай
重要|zhòngyào|important|важный|маңызды
有名|yǒumíng|famous|знаменитый|әйгілі
聪明|cōngming|clever|умный|ақылды
认真|rènzhēn|conscientious|старательный|ынталы
满意|mǎnyì|satisfied|довольный|риза
奇怪|qíguài|strange|странный|оғаш
`;

const HSK4 = `
律师|lǜshī|lawyer|адвокат|заңгер
警察|jǐngchá|police officer|полицейский|полицей
记者|jìzhě|journalist|журналист|тілші
作家|zuòjiā|writer|писатель|жазушы
演员|yǎnyuán|actor|актёр|актёр
顾客|gùkè|customer|покупатель|сатып алушы
网站|wǎngzhàn|website|сайт|сайт
密码|mìmǎ|password|пароль|құпиясөз
信息|xìnxī|information|информация|ақпарат
广告|guǎnggào|advertisement|реклама|жарнама
新闻|xīnwén|news|новости|жаңалықтар
杂志|zázhì|magazine|журнал|журнал
签证|qiānzhèng|visa|виза|виза
航班|hángbān|flight|рейс|рейс
首都|shǒudū|capital city|столица|астана
森林|sēnlín|forest|лес|орман
海洋|hǎiyáng|ocean|океан|мұхит
沙漠|shāmò|desert|пустыня|шөл
气候|qìhòu|climate|климат|климат
温度|wēndù|temperature|температура|температура
污染|wūrǎn|pollution|загрязнение|ластану
环境|huánjìng|environment|окружающая среда|қоршаған орта
植物|zhíwù|plant|растение|өсімдік
科学|kēxué|science|наука|ғылым
经济|jīngjì|economy|экономика|экономика
法律|fǎlǜ|law|закон|заң
社会|shèhuì|society|общество|қоғам
原因|yuányīn|reason|причина|себеп
结果|jiéguǒ|result|результат|нәтиже
经验|jīngyàn|experience|опыт|тәжірибе
能力|nénglì|ability|способность|қабілет
责任|zérèn|responsibility|ответственность|жауапкершілік
压力|yālì|pressure, stress|давление, стресс|қысым, күйзеліс
态度|tàidu|attitude|отношение|көзқарас
性格|xìnggé|personality|характер|мінез
友谊|yǒuyì|friendship|дружба|достық
方向|fāngxiàng|direction|направление|бағыт
距离|jùlí|distance|расстояние|қашықтық
速度|sùdù|speed|скорость|жылдамдық
质量|zhìliàng|quality|качество|сапа
价格|jiàgé|price|цена|баға
收入|shōurù|income|доход|табыс
讨论|tǎolùn|to discuss|обсуждать|талқылау
比较|bǐjiào|to compare|сравнивать|салыстыру
解释|jiěshì|to explain|объяснять|түсіндіру
证明|zhèngmíng|to prove|доказывать|дәлелдеу
提醒|tíxǐng|to remind|напоминать|еске салу
拒绝|jùjué|to refuse|отказывать|бас тарту
接受|jiēshòu|to accept|принимать|қабылдау
鼓励|gǔlì|to encourage|поощрять|көтермелеу
原谅|yuánliàng|to forgive|прощать|кешіру
保护|bǎohù|to protect|защищать|қорғау
减少|jiǎnshǎo|to reduce|уменьшать|азайту
增加|zēngjiā|to increase|увеличивать|көбейту
成功|chénggōng|to succeed|добиваться успеха|табысқа жету
失败|shībài|to fail|терпеть неудачу|сәтсіздікке ұшырау
坚持|jiānchí|to persist|упорствовать|табанды болу
放弃|fàngqì|to give up|сдаваться|қол үзу
诚实|chéngshí|honest|честный|адал
勇敢|yǒnggǎn|brave|смелый|батыл
骄傲|jiāo'ào|proud|гордый|тәкаппар
幽默|yōumò|humorous|остроумный|әзілқой
激动|jīdòng|excited|взволнованный|толқыған
失望|shīwàng|disappointed|разочарованный|көңілі қалған
紧张|jǐnzhāng|nervous|нервный|қобалжыған
危险|wēixiǎn|dangerous|опасный|қауіпті
安全|ānquán|safe|безопасный|қауіпсіз
正确|zhèngquè|correct|правильный|дұрыс
详细|xiángxì|detailed|подробный|толық
`;

const HSK5 = `
资源|zīyuán|resources|ресурсы|ресурстар
能源|néngyuán|energy sources|источники энергии|энергия көздері
政府|zhèngfǔ|government|правительство|үкімет
政治|zhèngzhì|politics|политика|саясат
权利|quánlì|right|право|құқық
义务|yìwù|duty|обязанность|міндет
观点|guāndiǎn|point of view|точка зрения|көзқарас тұрғысы
目标|mùbiāo|goal|цель|мақсат
效率|xiàolǜ|efficiency|эффективность|тиімділік
措施|cuòshī|measure, step|мера|шара
现象|xiànxiàng|phenomenon|явление|құбылыс
实验|shíyàn|experiment|эксперимент|тәжірибе
理论|lǐlùn|theory|теория|теория
系统|xìtǒng|system|система|жүйе
设备|shèbèi|equipment|оборудование|жабдық
软件|ruǎnjiàn|software|программа|бағдарлама
产品|chǎnpǐn|product|продукт|өнім
市场|shìchǎng|market|рынок|нарық
投资|tóuzī|investment|инвестиция|инвестиция
利润|lìrùn|profit|прибыль|пайда
竞争|jìngzhēng|competition|конкуренция|бәсекелестік
合作|hézuò|cooperation|сотрудничество|ынтымақтастық
传统|chuántǒng|tradition|традиция|дәстүр
文明|wénmíng|civilisation|цивилизация|өркениет
哲学|zhéxué|philosophy|философия|философия
文学|wénxué|literature|литература|әдебиет
风格|fēnggé|style|стиль|стиль
灵感|línggǎn|inspiration|вдохновение|шабыт
智慧|zhìhuì|wisdom|мудрость|даналық
勇气|yǒngqì|courage|смелость|ерлік
毅力|yìlì|perseverance|упорство|табандылық
分析|fēnxī|to analyse|анализировать|талдау
承认|chéngrèn|to admit|признавать|мойындау
避免|bìmiǎn|to avoid|избегать|болдырмау
改善|gǎishàn|to improve|улучшать|жақсарту
促进|cùjìn|to promote|способствовать|ықпал ету
控制|kòngzhì|to control|контролировать|бақылау
实现|shíxiàn|to achieve, to realise|осуществлять|жүзеге асыру
培养|péiyǎng|to cultivate, to train|воспитывать, развивать|тәрбиелеу
尊重|zūnzhòng|to respect|уважать|құрметтеу
适应|shìyìng|to adapt|приспосабливаться|бейімделу
强调|qiángdiào|to emphasise|подчёркивать|атап көрсету
克服|kèfú|to overcome|преодолевать|еңсеру
犹豫|yóuyù|to hesitate|колебаться|екіұдай болу
珍惜|zhēnxī|to cherish|дорожить|қадірлеу
明显|míngxiǎn|obvious|очевидный|айқын
必要|bìyào|necessary|необходимый|қажетті
合理|hélǐ|reasonable|разумный|орынды
灵活|línghuó|flexible|гибкий|икемді
谦虚|qiānxū|modest|скромный|кішіпейіл
慷慨|kāngkǎi|generous|щедрый|жомарт
孤独|gūdú|lonely|одинокий|жалғыз
豪华|háohuá|luxurious|роскошный|сәнді
独特|dútè|unique|уникальный|бірегей
`;

const HSK6 = `
权威|quánwēi|authority|авторитет|бедел
主权|zhǔquán|sovereignty|суверенитет|егемендік
繁荣|fánróng|prosperity|процветание|өркендеу
遗产|yíchǎn|heritage|наследие|мұра
弊端|bìduān|drawback|недостаток|кемшілік
悖论|bèilùn|paradox|парадокс|парадокс
前提|qiántí|premise|предпосылка|алғышарт
共识|gòngshí|consensus|консенсус|ортақ келісім
偏见|piānjiàn|prejudice|предубеждение|бейтарап емес көзқарас
困境|kùnjìng|predicament|затруднительное положение|қиын жағдай
机制|jīzhì|mechanism|механизм|тетік
宗旨|zōngzhǐ|guiding aim|основная цель|негізгі мұрат
视野|shìyě|horizons|кругозор|ой-өріс
灵魂|línghún|soul|душа|жан
本质|běnzhì|essence|сущность|мән
潜力|qiánlì|potential|потенциал|әлеует
阐述|chǎnshù|to expound|излагать|баяндау
斟酌|zhēnzhuó|to weigh carefully|тщательно обдумывать|мұқият ойластыру
遏制|èzhì|to curb|сдерживать|тежеу
削弱|xuēruò|to weaken|ослаблять|әлсірету
衡量|héngliáng|to weigh, to measure|оценивать|өлшеу
忽略|hūlüè|to neglect|упускать из виду|елемеу
倡导|chàngdǎo|to advocate|выступать за|насихаттау
弥补|míbǔ|to make up for|восполнять|орнын толтыру
维护|wéihù|to safeguard|защищать, поддерживать|қорғап сақтау
揭露|jiēlù|to expose|разоблачать|әшкерелеу
颠覆|diānfù|to overturn|подрывать, опрокидывать|төңкеру
敏锐|mǐnruì|keen, sharp|проницательный|қырағы
严谨|yánjǐn|rigorous|строгий, тщательный|мұқият
含糊|hánhu|vague|невнятный|бұлыңғыр
坦率|tǎnshuài|frank|откровенный|ашық
务实|wùshí|pragmatic|практичный|іскер
卓越|zhuóyuè|outstanding|выдающийся|көрнекті
深奥|shēn'ào|profound, abstruse|глубокий, мудрёный|терең мағыналы
荒谬|huāngmiù|absurd|абсурдный|орынсыз
苛刻|kēkè|harsh|придирчивый|қатал
恰当|qiàdàng|appropriate|уместный|орынды
迫切|pòqiè|urgent|насущный|шұғыл
漫长|màncháng|very long (time)|долгий|ұзаққа созылған
显著|xiǎnzhù|notable|заметный|елеулі
微妙|wēimiào|subtle|тонкий, деликатный|нәзік
必然|bìrán|inevitable|неизбежный|сөзсіз
无动于衷|wúdòngyúzhōng|indifferent|равнодушный|бейжай
千方百计|qiānfāngbǎijì|by every possible means|всеми способами|бар амалмен
一丝不苟|yīsībùgǒu|meticulous|скрупулёзный|мұқият
半途而废|bàntú'érfèi|to give up halfway|бросить на полпути|жарты жолда тастау
理所当然|lǐsuǒdāngrán|naturally, of course|само собой разумеется|өзінен-өзі түсінікті
`;

function parse(text, level) {
  return text
    .trim()
    .split('\n')
    .map((line) => {
      const [hz, py, en, ru, kk] = line.split('|');
      if (!kk) throw new Error(`HSK: ${line}`);
      return { level, hz, py, en, ru, kk };
    });
}

export const HANZI = [HSK1, HSK2, HSK3, HSK4, HSK5, HSK6].flatMap((text, i) => parse(text, i + 1)).map((w, i) => ({ ...w, i }));

/**
 * Счётные слова: [существительное, пиньинь, перевод en|ru|kk, [верные счётные слова], уровень].
 * Первое счётное слово — основное, остальные тоже допустимы и поэтому не попадают в ловушки.
 */
export const MEASURE = [
  ['书', 'shū', 'book|книга|кітап', ['本'], 2],
  ['杂志', 'zázhì', 'magazine|журнал|журнал', ['本'], 3],
  ['词典', 'cídiǎn', 'dictionary|словарь|сөздік', ['本'], 3],
  ['猫', 'māo', 'cat|кошка|мысық', ['只'], 2],
  ['鸟', 'niǎo', 'bird|птица|құс', ['只'], 2],
  ['狗', 'gǒu', 'dog|собака|ит', ['只', '条'], 2],
  ['鱼', 'yú', 'fish|рыба|балық', ['条'], 2],
  ['河', 'hé', 'river|река|өзен', ['条'], 3],
  ['路', 'lù', 'road|дорога|жол', ['条'], 3],
  ['裤子', 'kùzi', 'trousers|брюки|шалбар', ['条'], 3],
  ['纸', 'zhǐ', 'sheet of paper|лист бумаги|қағаз парағы', ['张'], 2],
  ['桌子', 'zhuōzi', 'table|стол|үстел', ['张'], 2],
  ['照片', 'zhàopiàn', 'photo|фотография|фотосурет', ['张'], 3],
  ['票', 'piào', 'ticket|билет|билет', ['张'], 2],
  ['床', 'chuáng', 'bed|кровать|төсек', ['张'], 3],
  ['车', 'chē', 'car|машина|көлік', ['辆'], 2],
  ['自行车', 'zìxíngchē', 'bicycle|велосипед|велосипед', ['辆'], 3],
  ['衣服', 'yīfu', 'piece of clothing|предмет одежды|киім', ['件', '套'], 2],
  ['事', 'shì', 'matter, thing|дело|іс', ['件'], 3],
  ['椅子', 'yǐzi', 'chair|стул|орындық', ['把'], 2],
  ['伞', 'sǎn', 'umbrella|зонт|қолшатыр', ['把'], 3],
  ['钥匙', 'yàoshi', 'key|ключ|кілт', ['把'], 3],
  ['鞋', 'xié', 'pair of shoes|пара обуви|бір жұп аяқ киім', ['双'], 2],
  ['筷子', 'kuàizi', 'pair of chopsticks|пара палочек|бір жұп таяқша', ['双'], 3],
  ['老师', 'lǎoshī', 'teacher (polite)|учитель (вежливо)|мұғалім (сыпайы)', ['位', '个', '名'], 2],
  ['客人', 'kèrén', 'guest (polite)|гость (вежливо)|қонақ (сыпайы)', ['位', '个', '名'], 3],
  ['电脑', 'diànnǎo', 'computer|компьютер|компьютер', ['台', '个', '部'], 3],
  ['电视', 'diànshì', 'TV set|телевизор|теледидар', ['台', '个', '部'], 3],
  ['公司', 'gōngsī', 'company|компания|компания', ['家', '个'], 3],
  ['饭店', 'fàndiàn', 'restaurant|ресторан|мейрамхана', ['家', '个'], 3],
  ['银行', 'yínháng', 'bank|банк|банк', ['家', '个'], 3],
  ['树', 'shù', 'tree|дерево|ағаш', ['棵'], 3],
  ['马', 'mǎ', 'horse|лошадь|жылқы', ['匹'], 4],
  ['笔', 'bǐ', 'pen|ручка|қалам', ['支'], 3],
  ['信', 'xìn', 'letter|письмо|хат', ['封'], 4],
  ['山', 'shān', 'mountain|гора|тау', ['座'], 4],
  ['桥', 'qiáo', 'bridge|мост|көпір', ['座'], 4],
  ['课', 'kè', 'lesson|урок|сабақ', ['节', '堂', '门'], 3],
  ['歌', 'gē', 'song|песня|ән', ['首', '个'], 3],
  ['电影', 'diànyǐng', 'film|фильм|фильм', ['部', '个'], 3],
  ['花', 'huā', 'flower|цветок|гүл', ['朵', '束', '枝'], 4],
  ['蛋糕', 'dàngāo', 'piece of cake|кусок торта|бір кесек торт', ['块', '个'], 3],
  ['咖啡', 'kāfēi', 'cup of coffee|чашка кофе|бір кесе кофе', ['杯'], 2],
  ['问题', 'wèntí', 'question|вопрос|сұрақ', ['个', '道'], 2],
];

/** Значение счётных слов: для разбора. */
export const MEASURE_INFO = {
  本: ['běn', 'books and magazines|книги и журналы|кітаптар мен журналдар'],
  只: ['zhī', 'most animals|большинство животных|жануарлардың көбі'],
  条: ['tiáo', 'long, thin things|длинные и узкие предметы|ұзын әрі жіңішке заттар'],
  张: ['zhāng', 'flat things|плоские предметы|жалпақ заттар'],
  辆: ['liàng', 'vehicles|транспорт|көліктер'],
  件: ['jiàn', 'clothes and matters|одежда и дела|киім мен істер'],
  把: ['bǎ', 'things with a handle|предметы с ручкой|сабы бар заттар'],
  双: ['shuāng', 'pairs|пары|жұптар'],
  位: ['wèi', 'people, politely|людей (вежливо)|адамдар (сыпайы)'],
  台: ['tái', 'machines|машины и приборы|машиналар мен аспаптар'],
  家: ['jiā', 'companies and shops|компании и заведения|компаниялар мен мекемелер'],
  棵: ['kē', 'trees and plants|деревья и растения|ағаштар мен өсімдіктер'],
  匹: ['pǐ', 'horses|лошади|жылқылар'],
  支: ['zhī', 'pens and thin sticks|ручки и палочки|қаламдар мен таяқшалар'],
  封: ['fēng', 'letters|письма|хаттар'],
  座: ['zuò', 'mountains, bridges, buildings|горы, мосты, здания|таулар, көпірлер, ғимараттар'],
  节: ['jié', 'lessons|уроки|сабақтар'],
  首: ['shǒu', 'songs and poems|песни и стихи|әндер мен өлеңдер'],
  部: ['bù', 'films and devices|фильмы и аппараты|фильмдер мен аппараттар'],
  朵: ['duǒ', 'flowers and clouds|цветы и облака|гүлдер мен бұлттар'],
  块: ['kuài', 'pieces|куски|кесектер'],
  杯: ['bēi', 'cups of a drink|чашки напитка|сусын кеселері'],
  个: ['gè', 'the general measure word|общее счётное слово|жалпы мөлшер сөз'],
};

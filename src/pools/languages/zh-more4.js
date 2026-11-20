// Дополнительные задания по китайскому (запись как в chinese.js): слова и предложения HSK 1-6.
// Данные - строки «китайский | ru | kk | en»; из них собираются задания той же записи, что и в zh-more3.js.
import { T } from '../bank.js';

const mean = (word) => T(`Что значит ${word}?`, `${word} сөзі нені білдіреді?`, `What does ${word} mean?`);
const sentence = (text) => T(`Как перевести предложение ${text}?`, `${text} сөйлемі қалай аударылады?`, `How do you translate ${text}?`);

const WORDS_TXT = {
  1: `
爸爸 (bàba)|папа|әке|dad
哥哥 (gēge)|старший брат|аға|elder brother
姐姐 (jiějie)|старшая сестра|апа|elder sister
弟弟 (dìdi)|младший брат|іні|younger brother
妹妹 (mèimei)|младшая сестра|қарындас, сіңлі|younger sister
老师 (lǎoshī)|учитель|мұғалім|teacher
学生 (xuésheng)|ученик, студент|оқушы, студент|student
医生 (yīshēng)|врач|дәрігер|doctor
同学 (tóngxué)|одноклассник|сыныптас|classmate
名字 (míngzi)|имя|есім|name
水果 (shuǐguǒ)|фрукты|жеміс|fruit
牛奶 (niúnǎi)|молоко|сүт|milk
鸡蛋 (jīdàn)|куриное яйцо|тауық жұмыртқасы|egg
面条 (miàntiáo)|лапша|кеспе|noodles
菜 (cài)|блюдо, овощи|тағам, көкөніс|dish, vegetable
杯子 (bēizi)|чашка, стакан|шыны аяқ|cup
桌子 (zhuōzi)|стол|үстел|table
椅子 (yǐzi)|стул|орындық|chair
书 (shū)|книга|кітап|book
电视 (diànshì)|телевизор|теледидар|television
电脑 (diànnǎo)|компьютер|компьютер|computer
电影 (diànyǐng)|фильм|фильм|film
出租车 (chūzūchē)|такси|такси|taxi
飞机 (fēijī)|самолёт|ұшақ|aeroplane
商店 (shāngdiàn)|магазин|дүкен|shop
饭店 (fàndiàn)|ресторан, гостиница|мейрамхана|restaurant
上午 (shàngwǔ)|утро (до полудня)|түске дейін|morning
下午 (xiàwǔ)|вторая половина дня|түстен кейін|afternoon
晚上 (wǎnshang)|вечер|кеш|evening
明天 (míngtiān)|завтра|ертең|tomorrow
昨天 (zuótiān)|вчера|кеше|yesterday
现在 (xiànzài)|сейчас|қазір|now
年 (nián)|год|жыл|year
月 (yuè)|месяц, луна|ай|month
号 (hào)|число, номер|күн, нөмір|date, number
点 (diǎn)|час (о времени)|сағат (уақыт)|o'clock
天气 (tiānqì)|погода|ауа райы|weather
下雨 (xiàyǔ)|идти (о дожде)|жаңбыр жауу|to rain
冷 (lěng)|холодный|суық|cold
热 (rè)|жаркий|ыстық|hot
大 (dà)|большой|үлкен|big
小 (xiǎo)|маленький|кіші|small
多 (duō)|много|көп|many
少 (shǎo)|мало|аз|few
好吃 (hǎochī)|вкусный|дәмді|delicious
漂亮 (piàoliang)|красивый|әдемі|pretty
高兴 (gāoxìng)|радостный|қуанышты|happy
喜欢 (xǐhuan)|нравиться|ұнату|to like
爱 (ài)|любить|сүю|to love
看 (kàn)|смотреть|қарау|to look
听 (tīng)|слушать|тыңдау|to listen
说 (shuō)|говорить|айту|to speak
读 (dú)|читать вслух|оқу|to read
写 (xiě)|писать|жазу|to write
吃 (chī)|есть|жеу|to eat
坐 (zuò)|сидеть, ехать на|отыру|to sit
开 (kāi)|открывать, водить|ашу|to open
住 (zhù)|жить, проживать|тұру|to live
会 (huì)|уметь|білу, алу|can
能 (néng)|мочь|алу, мүмкін|to be able to
想 (xiǎng)|думать, хотеть|ойлау, қалау|to think, to want
认识 (rènshi)|знать (человека)|танысу|to know someone
叫 (jiào)|называться|аталу|to be called
给 (gěi)|давать|беру|to give
在 (zài)|находиться|болу|to be at
没有 (méiyǒu)|не иметь|жоқ|not have
对不起 (duìbuqǐ)|извините|кешіріңіз|sorry
没关系 (méi guānxi)|ничего страшного|ештеңе етпейді|it doesn't matter
再见 (zàijiàn)|до свидания|сау болыңыз|goodbye
请 (qǐng)|пожалуйста|өтінемін|please
`,
  2: `
旁边 (pángbiān)|рядом|жанында|beside
左边 (zuǒbian)|слева|сол жақ|left side
右边 (yòubian)|справа|оң жақ|right side
外面 (wàimiàn)|снаружи|сырт|outside
离 (lí)|от (расстояние)|қашықтық|from
远 (yuǎn)|далёкий|алыс|far
近 (jìn)|близкий|жақын|near
路 (lù)|дорога|жол|road
地铁 (dìtiě)|метро|метро|subway
公共汽车 (gōnggòng qìchē)|автобус|автобус|bus
自行车 (zìxíngchē)|велосипед|велосипед|bicycle
火车站 (huǒchēzhàn)|вокзал|вокзал|railway station
票 (piào)|билет|билет|ticket
房间 (fángjiān)|комната|бөлме|room
家人 (jiārén)|члены семьи|отбасы мүшелері|family members
孩子 (háizi)|ребёнок|бала|child
男 (nán)|мужской|ер|male
女 (nǚ)|женский|әйел|female
太阳 (tàiyáng)|солнце|күн|sun
月亮 (yuèliang)|луна|ай|moon
雪 (xuě)|снег|қар|snow
晴 (qíng)|ясный|ашық|sunny
阴 (yīn)|пасмурный|бұлтты|overcast
春天 (chūntiān)|весна|көктем|spring
夏天 (xiàtiān)|лето|жаз|summer
秋天 (qiūtiān)|осень|күз|autumn
冬天 (dōngtiān)|зима|қыс|winter
生日 (shēngrì)|день рождения|туған күн|birthday
礼物 (lǐwù)|подарок|сыйлық|gift
新 (xīn)|новый|жаңа|new
旧 (jiù)|старый (о вещах)|ескі|old
快 (kuài)|быстрый|жылдам|fast
便宜 (piányi)|дешёвый|арзан|cheap
黑色 (hēisè)|чёрный цвет|қара түс|black
白色 (báisè)|белый цвет|ақ түс|white
红色 (hóngsè)|красный цвет|қызыл түс|red
蓝色 (lánsè)|синий цвет|көк түс|blue
咖啡 (kāfēi)|кофе|кофе|coffee
牛肉 (niúròu)|говядина|сиыр еті|beef
鱼 (yú)|рыба|балық|fish
西瓜 (xīguā)|арбуз|қарбыз|watermelon
面包 (miànbāo)|хлеб|нан|bread
考试 (kǎoshì)|экзамен|емтихан|exam
问题 (wèntí)|вопрос, проблема|сұрақ, мәселе|question
意思 (yìsi)|значение|мағына|meaning
懂 (dǒng)|понимать|түсіну|to understand
进 (jìn)|входить|кіру|to enter
出 (chū)|выходить|шығу|to go out
走 (zǒu)|идти|жүру|to walk
跑步 (pǎobù)|бегать|жүгіру|to run
踢足球 (tī zúqiú)|играть в футбол|футбол ойнау|to play football
唱 (chàng)|петь|ән айту|to sing
跳舞 (tiàowǔ)|танцевать|билеу|to dance
洗 (xǐ)|мыть|жуу|to wash
找 (zhǎo)|искать|іздеу|to look for
等 (děng)|ждать|күту|to wait
知道 (zhīdào)|знать|білу|to know
觉得 (juéde)|считать, чувствовать|деп ойлау|to feel, to think
希望 (xīwàng)|надеяться|үміттену|to hope
准备 (zhǔnbèi)|готовиться|дайындалу|to prepare
离开 (líkāi)|покидать|кету|to leave
关 (guān)|закрывать, выключать|жабу, өшіру|to close
卖 (mài)|продавать|сату|to sell
借 (jiè)|одолжить, занимать|қарыз алу|to borrow
还 (huán)|возвращать|қайтару|to return
累 (lèi)|уставший|шаршаған|tired
忙 (máng)|занятой|бос емес|busy
别 (bié)|не (запрет)|болмайды|do not
`,
  3: `
爱好 (àihào)|увлечение|қызығушылық|hobby
办法 (bànfǎ)|способ|әдіс|method
帮忙 (bāngmáng)|помогать|көмектесу|to help
变化 (biànhuà)|изменение|өзгеріс|change
表演 (biǎoyǎn)|выступление|өнер көрсету|performance
不但 (búdàn)|не только|тек қана емес|not only
成绩 (chéngjì)|результат, оценка|нәтиже, баға|result
迟到 (chídào)|опаздывать|кешігу|to be late
重要 (zhòngyào)|важный|маңызды|important
聪明 (cōngming)|умный|ақылды|clever
打扫 (dǎsǎo)|убирать|жинау|to clean
担心 (dānxīn)|беспокоиться|уайымдау|to worry
地图 (dìtú)|карта|карта|map
对面 (duìmiàn)|напротив|қарсы алдында|opposite
饿 (è)|голодный|аш|hungry
放心 (fàngxīn)|не волноваться|алаңдамау|to rest assured
附近 (fùjìn)|поблизости|жақын маңда|nearby
感冒 (gǎnmào)|простуда|тұмау|a cold
刚才 (gāngcái)|только что|жаңа ғана|just now
根据 (gēnjù)|согласно|сәйкес|according to
关心 (guānxīn)|заботиться|қамқор болу|to care about
害怕 (hàipà)|бояться|қорқу|to be afraid
护照 (hùzhào)|паспорт|төлқұжат|passport
欢迎 (huānyíng)|приветствовать|қош келдіңіз|to welcome
环境 (huánjìng)|окружающая среда|қоршаған орта|environment
会议 (huìyì)|собрание|жиналыс|meeting
几乎 (jīhū)|почти|дерлік|almost
机会 (jīhuì)|возможность|мүмкіндік|opportunity
记得 (jìde)|помнить|есте сақтау|to remember
健康 (jiànkāng)|здоровье|денсаулық|health
将来 (jiānglái)|будущее|болашақ|future
节日 (jiérì)|праздник|мереке|festival
结婚 (jiéhūn)|жениться, выходить замуж|үйлену|to get married
解决 (jiějué)|решать|шешу|to solve
禁止 (jìnzhǐ)|запрещать|тыйым салу|to forbid
经常 (jīngcháng)|часто|жиі|often
经过 (jīngguò)|проходить мимо|өту|to pass by
爬山 (páshān)|ходить в горы|тауға шығу|to go hiking
习惯 (xíguàn)|привычка|әдет|habit
相信 (xiāngxìn)|верить|сену|to believe
小心 (xiǎoxīn)|осторожно|сақ болу|to be careful
新闻 (xīnwén)|новости|жаңалық|news
选择 (xuǎnzé)|выбирать|таңдау|to choose
合适 (héshì)|подходящий|лайықты|suitable
进步 (jìnbù)|прогресс|жетістік, ілгерілеу|progress
抱歉 (bàoqiàn)|сожалеть|өкіну|sorry
`,
  4: `
安排 (ānpái)|организовывать|жоспарлау|to arrange
保证 (bǎozhèng)|гарантировать|кепілдік беру|to guarantee
报名 (bàomíng)|записаться|тіркелу|to sign up
抱怨 (bàoyuàn)|жаловаться|шағымдану|to complain
本来 (běnlái)|изначально|бастапқыда|originally
避免 (bìmiǎn)|избегать|болдырмау|to avoid
博物馆 (bówùguǎn)|музей|мұражай|museum
不管 (bùguǎn)|независимо от|қандай болса да|no matter
参观 (cānguān)|осматривать|тамашалау|to visit
长途 (chángtú)|дальний|ұзақ жол|long-distance
承认 (chéngrèn)|признавать|мойындау|to admit
称赞 (chēngzàn)|хвалить|мақтау|to praise
成功 (chénggōng)|успех|табыс|success
吃惊 (chījīng)|удивляться|таңғалу|to be surprised
重新 (chóngxīn)|заново|қайтадан|anew
出发 (chūfā)|отправляться|жолға шығу|to set off
传统 (chuántǒng)|традиция|дәстүр|tradition
粗心 (cūxīn)|небрежный|немқұрайлы|careless
答应 (dāying)|соглашаться|келісу|to promise
打算 (dǎsuàn)|собираться|жоспарлау|to plan
大概 (dàgài)|примерно|шамамен|approximately
倒霉 (dǎoméi)|не везёт|сәтсіз|unlucky
道歉 (dàoqiàn)|извиняться|кешірім сұрау|to apologise
得意 (déyì)|самодовольный|мақтаныш|pleased with oneself
登机牌 (dēngjīpái)|посадочный талон|ұшаққа отыру талоны|boarding pass
堵车 (dǔchē)|пробка|көлік кептелісі|traffic jam
分析 (fēnxī)|анализ|талдау|analysis
符合 (fúhé)|соответствовать|сәйкес келу|to conform to
改变 (gǎibiàn)|менять|өзгерту|to change
感动 (gǎndòng)|трогать до глубины|тебірену|to be moved
工资 (gōngzī)|зарплата|жалақы|salary
购物 (gòuwù)|делать покупки|сауда жасау|to shop
估计 (gūjì)|предполагать|болжау|to estimate
规定 (guīdìng)|правило|ереже|regulation
国籍 (guójí)|гражданство|азаматтық|nationality
过程 (guòchéng)|процесс|үдеріс|process
后悔 (hòuhuǐ)|сожалеть|өкіну|to regret
互相 (hùxiāng)|друг друга|бір-бірін|each other
怀疑 (huáiyí)|сомневаться|күмәндану|to doubt
获得 (huòdé)|получать|алу|to obtain
积极 (jījí)|активный, позитивный|белсенді|positive
计划 (jìhuà)|план|жоспар|plan
即使 (jíshǐ)|даже если|тіпті|even if
坚持 (jiānchí)|упорствовать|табандылық таныту|to persist
减少 (jiǎnshǎo)|сокращать|азайту|to reduce
建议 (jiànyì)|предлагать|ұсыныс|to suggest
降低 (jiàngdī)|снижать|төмендету|to lower
交流 (jiāoliú)|обмениваться|пікір алмасу|to communicate
教育 (jiàoyù)|образование|білім беру|education
接受 (jiēshòu)|принимать|қабылдау|to accept
节约 (jiéyuē)|экономить|үнемдеу|to save
经济 (jīngjì)|экономика|экономика|economy
精彩 (jīngcǎi)|яркий, блестящий|тамаша|brilliant
竞争 (jìngzhēng)|конкуренция|бәсеке|competition
距离 (jùlí)|расстояние|қашықтық|distance
开玩笑 (kāi wánxiào)|шутить|әзілдеу|to joke
可惜 (kěxī)|жаль|өкінішті|a pity
克服 (kèfú)|преодолевать|жеңу|to overcome
`,
  5: `
挨 (ái)|терпеть, быть рядом|шыдау|to endure
爱护 (àihù)|беречь|қорғау, аялау|to cherish
安慰 (ānwèi)|утешать|жұбату|to comfort
把握 (bǎwò)|уверенность, держать|сенімділік|assurance
包含 (bāohán)|содержать|қамту|to contain
保持 (bǎochí)|сохранять|сақтау|to maintain
抱负 (bàofù)|стремления|арман-мақсат|aspiration
悲观 (bēiguān)|пессимистичный|пессимистік|pessimistic
被迫 (bèipò)|быть вынужденным|мәжбүр болу|to be forced
本质 (běnzhì)|сущность|мәні, табиғаты|essence
比例 (bǐlì)|пропорция|үйлесім|proportion
彼此 (bǐcǐ)|друг друга|бір-бірі|each other
避免 (bìmiǎn)|избегать|болдырмау|to avoid
鞭炮 (biānpào)|петарды|петарда|firecracker
标准 (biāozhǔn)|стандарт|стандарт|standard
表面 (biǎomiàn)|поверхность|беті|surface
捕捉 (bǔzhuō)|ловить|ұстау|to catch
不断 (búduàn)|непрерывно|үздіксіз|continuously
财产 (cáichǎn)|имущество|мүлік|property
采取 (cǎiqǔ)|принимать (меры)|қабылдау|to adopt
参与 (cānyù)|участвовать|қатысу|to participate
操作 (cāozuò)|управлять, работать|басқару|to operate
策略 (cèlüè)|стратегия|стратегия|strategy
差距 (chājù)|разрыв|алшақтық|gap
长期 (chángqī)|долгосрочный|ұзақ мерзімді|long-term
场合 (chǎnghé)|случай, ситуация|орын, жағдай|occasion
超过 (chāoguò)|превышать|асып түсу|to exceed
陈列 (chénliè)|выставлять|қою, көрсету|to display
成就 (chéngjiù)|достижение|жетістік|achievement
承担 (chéngdān)|нести (ответственность)|мойнына алу|to bear
充分 (chōngfèn)|достаточный, полный|толық|sufficient
崇拜 (chóngbài)|поклоняться|табыну|to worship
创造 (chuàngzào)|создавать|жасау|to create
从而 (cóng'ér)|тем самым|осылайша|thus
促进 (cùjìn)|способствовать|ықпал ету|to promote
措施 (cuòshī)|мера|шара|measure
达到 (dádào)|достигать|жету|to reach
打击 (dǎjī)|удар, подавление|соққы беру|to strike
大型 (dàxíng)|крупный|ірі|large-scale
当代 (dāngdài)|современный|қазіргі заман|contemporary
档案 (dàng'àn)|досье, архив|архив|file, archive
导致 (dǎozhì)|приводить к|әкелу|to lead to
地位 (dìwèi)|положение|мәртебе|status
抵抗 (dǐkàng)|сопротивляться|қарсы тұру|to resist
动力 (dònglì)|движущая сила|қозғаушы күш|driving force
独立 (dúlì)|независимый|тәуелсіз|independent
对待 (duìdài)|относиться|қарым-қатынас жасау|to treat
对象 (duìxiàng)|объект, партнёр|нысан|target
发挥 (fāhuī)|проявлять, использовать|көрсету|to bring into play
繁荣 (fánróng)|процветание|гүлдену|prosperous
反映 (fǎnyìng)|отражать, сообщать|көрсету, жеткізу|to reflect
范围 (fànwéi)|сфера, рамки|аясы|scope
防止 (fángzhǐ)|предотвращать|алдын алу|to prevent
分配 (fēnpèi)|распределять|бөлу|to distribute
丰富 (fēngfù)|богатый|бай|rich
否定 (fǒudìng)|отрицать|жоққа шығару|to deny
`,
  6: `
哀悼 (āidào)|скорбеть|қайғыру|to mourn
暧昧 (àimèi)|двусмысленный|күмәнді|ambiguous
案例 (ànlì)|случай, прецедент|жағдай|case
昂贵 (ángguì)|дорогой|қымбат|costly
熬夜 (áoyè)|не спать ночью|түнде ұйықтамау|to stay up late
奥秘 (àomì)|тайна|жұмбақ|mystery
霸道 (bàdào)|властный|өктем|overbearing
颁布 (bānbù)|обнародовать|жариялау|to promulgate
斑 (bān)|пятно|дақ|spot
半途而废 (bàntú ér fèi)|бросить на полпути|жолда тастау|to give up halfway
包庇 (bāobì)|покрывать|жасыру|to cover up
饱和 (bǎohé)|насыщение|қанығу|saturation
保障 (bǎozhàng)|гарантировать, защита|кепілдік|safeguard
报酬 (bàochou)|вознаграждение|сыйақы|reward
爆发 (bàofā)|вспыхнуть|жарылу|to break out
卑鄙 (bēibǐ)|подлый|жексұрын|despicable
奔波 (bēnbō)|мотаться|жүгіру|to rush about
崩溃 (bēngkuì)|рухнуть|құлау|to collapse
鄙视 (bǐshì)|презирать|менсінбеу|to despise
弊端 (bìduān)|недостаток|кемшілік|drawback
贬低 (biǎndī)|принижать|кемсіту|to belittle
辩护 (biànhù)|защищать|қорғау|to defend
濒临 (bīnlín)|быть на грани|жақындау|to be on the verge of
波动 (bōdòng)|колебаться|тербеліс|to fluctuate
搏斗 (bódòu)|бороться|алысу|to fight
薄弱 (bóruò)|слабый|әлсіз|weak
补偿 (bǔcháng)|компенсировать|өтеу|to compensate
不言而喻 (bù yán ér yù)|само собой разумеется|өзінен-өзі түсінікті|self-evident
不择手段 (bù zé shǒuduàn)|любыми средствами|кез келген жолмен|by any means
财富 (cáifù)|богатство|байлық|wealth
残酷 (cánkù)|жестокий|қатыгез|cruel
草率 (cǎoshuài)|небрежный|асығыс|careless
侧面 (cèmiàn)|сторона, аспект|қырынан|aspect
策划 (cèhuà)|планировать|жоспарлау|to plan
差异 (chāyì)|различие|айырмашылық|difference
忏悔 (chànhuǐ)|раскаиваться|өкіну|to repent
颤抖 (chàndǒu)|дрожать|дірілдеу|to tremble
彻底 (chèdǐ)|полностью|түбегейлі|thorough
沉淀 (chéndiàn)|осаждаться|тұну|to settle
沉着 (chénzhuó)|хладнокровный|сабырлы|composed
称呼 (chēnghu)|обращение|атау|form of address
成效 (chéngxiào)|эффективность|нәтиже|effect
澄清 (chéngqīng)|прояснять|анықтау|to clarify
惩罚 (chéngfá)|наказывать|жазалау|to punish
迟疑 (chíyí)|колебаться|күмәнмен тұру|to hesitate
冲突 (chōngtū)|конфликт|қақтығыс|conflict
崇高 (chónggāo)|возвышенный|ізгі|lofty
抽象 (chōuxiàng)|абстрактный|абстрактілі|abstract
踌躇 (chóuchú)|мяться|толғану|to hesitate
`,
};

const SENTENCES_TXT = {
  1: `
我叫王明。|Меня зовут Ван Мин.|Менің атым Ван Мин.|My name is Wang Ming.
这是我的书。|Это моя книга.|Бұл менің кітабым.|This is my book.
她是我的老师。|Она моя учительница.|Ол менің мұғалімім.|She is my teacher.
我家有四口人。|В моей семье четыре человека.|Біздің отбасы төрт адам.|There are four people in my family.
你想喝什么？|Что ты хочешь выпить?|Сен не ішкің келеді?|What do you want to drink?
我不吃肉。|Я не ем мясо.|Мен ет жемеймін.|I do not eat meat.
今天星期几？|Какой сегодня день недели?|Бүгін аптаның қай күні?|What day is it today?
现在几点？|Который час?|Қазір сағат неше?|What time is it now?
我明天去北京。|Завтра я еду в Пекин.|Мен ертең Пекинге барамын.|I am going to Beijing tomorrow.
他在家看电视。|Он дома смотрит телевизор.|Ол үйде теледидар көріп отыр.|He is watching TV at home.
你住在哪儿？|Где ты живёшь?|Сен қайда тұрасың?|Where do you live?
我会说一点儿汉语。|Я немного говорю по-китайски.|Мен қытайша аздап сөйлей аламын.|I can speak a little Chinese.
这个多少钱？|Сколько это стоит?|Бұл қанша тұрады?|How much is this?
我想买一个苹果。|Я хочу купить яблоко.|Мен бір алма сатып алғым келеді.|I want to buy an apple.
天气很好。|Погода хорошая.|Ауа райы өте жақсы.|The weather is very nice.
外面在下雨。|На улице идёт дождь.|Далада жаңбыр жауып тұр.|It is raining outside.
我爱我的家人。|Я люблю свою семью.|Мен отбасымды жақсы көремін.|I love my family.
他有两个哥哥。|У него два старших брата.|Оның екі ағасы бар.|He has two elder brothers.
我们是好朋友。|Мы хорошие друзья.|Біз жақсы достармыз.|We are good friends.
你的电话号码是多少？|Какой у тебя номер телефона?|Телефон нөміріңіз қандай?|What is your phone number?
我在学校学习。|Я учусь в школе.|Мен мектепте оқимын.|I study at school.
请坐。|Пожалуйста, садитесь.|Отырыңыз.|Please sit down.
对不起，我来晚了。|Простите, я опоздал.|Кешіріңіз, мен кешігіп келдім.|Sorry, I am late.
医院在学校后面。|Больница за школой.|Аурухана мектептің артында.|The hospital is behind the school.
`,
  2: `
我每天坐地铁上班。|Каждый день я езжу на работу на метро.|Мен күн сайын жұмысқа метромен барамын.|I take the subway to work every day.
你能告诉我去机场的路吗？|Можете подсказать дорогу в аэропорт?|Әуежайға баратын жолды айта аласыз ба?|Can you tell me the way to the airport?
他比我高一点儿。|Он немного выше меня.|Ол менен сәл ұзын.|He is a little taller than me.
这个房间太小了。|Эта комната слишком маленькая.|Бұл бөлме тым кішкентай.|This room is too small.
我们先吃饭，然后去看电影。|Сначала поедим, потом пойдём в кино.|Алдымен тамақ ішеміз, сосын фильм көреміз.|Let us eat first and then go to the cinema.
她正在洗衣服。|Она сейчас стирает одежду.|Ол қазір киім жуып жатыр.|She is washing clothes.
我已经做完作业了。|Я уже сделал уроки.|Мен үй тапсырмасын орындап қойдым.|I have already finished my homework.
你觉得这件衣服怎么样？|Как тебе эта одежда?|Бұл киім саған қалай көрінеді?|What do you think of this piece of clothing?
明天会下雪吗？|Завтра будет снег?|Ертең қар жауа ма?|Will it snow tomorrow?
我想去商店买一些水果。|Я хочу пойти в магазин за фруктами.|Мен дүкенге барып жеміс алғым келеді.|I want to go to the shop to buy some fruit.
他唱歌唱得很好听。|Он поёт очень красиво.|Ол өте әдемі ән айтады.|He sings very beautifully.
我家离学校很近。|Мой дом очень близко от школы.|Біздің үй мектепке өте жақын.|My home is very close to the school.
请你再说一遍。|Пожалуйста, повторите ещё раз.|Тағы бір рет айтыңызшы.|Please say it once more.
我昨天没有睡好。|Вчера я плохо спал.|Кеше мен жақсы ұйықтамадым.|I did not sleep well yesterday.
你喜欢红色还是蓝色？|Тебе нравится красный или синий?|Саған қызыл ма, көк пе ұнайды?|Do you like red or blue?
他的生日是五月八号。|Его день рождения восьмого мая.|Оның туған күні сегізінші мамыр.|His birthday is on the eighth of May.
我借了一本书给他。|Я одолжил ему книгу.|Мен оған бір кітап қарызға бердім.|I lent him a book.
别忘了带手机。|Не забудь взять телефон.|Телефонды алуды ұмытпа.|Do not forget to bring your phone.
我们在火车站等你。|Мы ждём тебя на вокзале.|Біз сені вокзалда күтеміз.|We will wait for you at the railway station.
她买了一双新鞋。|Она купила новую пару обуви.|Ол бір жұп жаңа аяқ киім сатып алды.|She bought a new pair of shoes.
孩子们在外面跑步。|Дети бегают на улице.|Балалар сыртта жүгіріп жүр.|The children are running outside.
我有点儿累。|Я немного устал.|Мен сәл шаршадым.|I am a little tired.
你知道他住在哪儿吗？|Ты знаешь, где он живёт?|Оның қайда тұратынын білесің бе?|Do you know where he lives?
这家饭店的鱼很好吃。|Рыба в этом ресторане очень вкусная.|Бұл мейрамханада балық өте дәмді.|The fish at this restaurant is delicious.
`,
  3: `
我比以前忙多了。|Я стал намного занятее, чем раньше.|Мен бұрынғыдан әлдеқайда бос емеспін.|I am much busier than before.
虽然很累，但是我很高兴。|Хотя я устал, но я рад.|Шаршасам да, қуаныштымын.|Although I am tired, I am happy.
如果明天下雨，我们就不去了。|Если завтра будет дождь, мы не пойдём.|Ертең жаңбыр жауса, біз бармаймыз.|If it rains tomorrow, we will not go.
他把钥匙放在桌子上了。|Он положил ключ на стол.|Ол кілтті үстелге қойды.|He put the key on the table.
我的自行车被朋友借走了。|Мой велосипед одолжил друг.|Менің велосипедімді досым алып кетті.|My bicycle was borrowed by a friend.
她一边听音乐，一边做作业。|Она делает уроки и одновременно слушает музыку.|Ол музыка тыңдап, сонымен бірге үй тапсырмасын орындайды.|She does her homework while listening to music.
你应该多注意身体。|Тебе следует больше заботиться о здоровье.|Сен денсаулығыңа көбірек мән беруің керек.|You should pay more attention to your health.
我听说他搬到上海去了。|Я слышал, что он переехал в Шанхай.|Оның Шанхайға көшіп кеткенін естідім.|I heard he has moved to Shanghai.
这个问题我还没想好。|Я ещё не обдумал этот вопрос.|Бұл мәселені мен әлі ойланып болған жоқпын.|I have not thought this question through yet.
他每天坚持锻炼身体。|Он каждый день упорно занимается спортом.|Ол күн сайын тұрақты түрде жаттығады.|He keeps exercising every day.
请把窗户关上。|Закройте, пожалуйста, окно.|Терезені жауып қойыңызшы.|Please close the window.
我们班的同学都很友好。|Все в нашем классе дружелюбны.|Біздің сыныптағылардың бәрі мейірімді.|Everyone in our class is friendly.
她对音乐很感兴趣。|Она очень интересуется музыкой.|Ол музыкаға өте қызығады.|She is very interested in music.
我已经学了三年汉语。|Я изучаю китайский уже три года.|Мен қытай тілін үш жыл оқыдым.|I have studied Chinese for three years.
你的汉语说得越来越好了。|Твой китайский становится всё лучше.|Қытайша сөйлеуің барған сайын жақсарып келеді.|Your Chinese is getting better and better.
因为堵车，我们迟到了。|Из-за пробки мы опоздали.|Көлік кептелісінен біз кешігіп қалдық.|We were late because of the traffic jam.
他不但聪明，而且很努力。|Он не только умный, но и очень старательный.|Ол ақылды ғана емес, сонымен қатар өте еңбекқор.|He is not only clever but also hardworking.
这次考试比上次难。|Этот экзамен сложнее прошлого.|Бұл емтихан өткенінен қиынырақ.|This exam is harder than the last one.
我打算明年去中国旅游。|Я собираюсь в следующем году поехать в Китай.|Мен келесі жылы Қытайға саяхатқа барғым келеді.|I plan to travel to China next year.
周末我常常去爬山。|По выходным я часто хожу в горы.|Демалыс күндері мен жиі тауға шығамын.|At weekends I often go hiking.
他突然想起了一件事。|Он вдруг вспомнил одно дело.|Ол кенеттен бір нәрсені есіне түсірді.|He suddenly remembered something.
请你小声一点儿，孩子在睡觉。|Говорите потише, ребёнок спит.|Дауысыңызды сәл баяулатыңыз, бала ұйықтап жатыр.|Please speak more quietly; the child is sleeping.
我对这个城市很熟悉。|Я хорошо знаю этот город.|Мен бұл қаланы жақсы білемін.|I am very familiar with this city.
他走得太快，我跟不上。|Он идёт слишком быстро, я не успеваю.|Ол тым жылдам жүреді, мен үлгермеймін.|He walks too fast; I cannot keep up.
`,
  4: `
尽管很忙，他还是来参加了聚会。|Несмотря на занятость, он всё же пришёл на вечеринку.|Бос емес болса да, ол кешке келді.|Although he was busy, he still came to the party.
只要努力，就一定能成功。|Если только стараться, обязательно добьёшься успеха.|Тек ұмтылсаң, міндетті түрде табысқа жетесің.|As long as you work hard, you will succeed.
除了英语以外，他还会说汉语。|Кроме английского, он ещё говорит по-китайски.|Ағылшын тілінен басқа, ол қытайша да сөйлейді.|Besides English, he can also speak Chinese.
这件事对我影响很大。|Это дело сильно на меня повлияло.|Бұл оқиға маған қатты әсер етті.|This matter influenced me a lot.
他一边工作，一边学习。|Он работает и одновременно учится.|Ол жұмыс істеп, сонымен бірге оқиды.|He works and studies at the same time.
我对这个计划没有意见。|У меня нет возражений по этому плану.|Менің бұл жоспарға қарсылығым жоқ.|I have no objection to this plan.
为了健康，他戒烟了。|Ради здоровья он бросил курить.|Денсаулығы үшін ол темекіні тастады.|He quit smoking for the sake of his health.
无论遇到什么困难，我们都不放弃。|С какими бы трудностями мы ни столкнулись, мы не сдаёмся.|Қандай қиындыққа тап болсақ та, берілмейміз.|No matter what difficulties we meet, we do not give up.
这个办法值得试一试。|Этот способ стоит попробовать.|Бұл әдісті байқап көруге тұрады.|This method is worth trying.
他的建议很有道理。|Его совет очень разумен.|Оның кеңесі өте орынды.|His suggestion makes a lot of sense.
他们终于解决了这个矛盾。|Они наконец разрешили это противоречие.|Олар ақыры бұл қайшылықты шешті.|They finally resolved this conflict.
由于天气不好，航班取消了。|Из-за плохой погоды рейс отменили.|Ауа райы нашар болғандықтан, рейс жойылды.|The flight was cancelled because of bad weather.
她的普通话说得很标准。|Её путунхуа очень правильное.|Оның мандарин тілінде сөйлеуі өте дұрыс.|Her Mandarin is very standard.
我们应该互相帮助。|Мы должны помогать друг другу.|Біз бір-бірімізге көмектесуіміз керек.|We should help each other.
这个城市的变化让我吃惊。|Перемены в этом городе удивили меня.|Бұл қаладағы өзгерістер мені таңғалдырды.|The changes in this city surprised me.
他对工作非常负责。|Он очень ответственно относится к работе.|Ол жұмысына өте жауапкершілікпен қарайды.|He is very responsible about his work.
网络给我们的生活带来了方便。|Интернет сделал нашу жизнь удобнее.|Интернет біздің өмірімізге қолайлылық әкелді.|The Internet has made our lives more convenient.
这场比赛的结果令人失望。|Результат этого матча разочаровывает.|Бұл жарыстың нәтижесі көңіл қалдырады.|The result of this match is disappointing.
他坚持每天写日记。|Он упорно ведёт дневник каждый день.|Ол күн сайын күнделік жазуды тоқтатпайды.|He keeps a diary every day.
这里的环境越来越好。|Окружающая среда здесь становится всё лучше.|Мұндағы қоршаған орта барған сайын жақсарып келеді.|The environment here keeps getting better.
我觉得我们应该提前准备。|Я считаю, что нам стоит подготовиться заранее.|Біз алдын ала дайындалуымыз керек деп ойлаймын.|I think we should prepare in advance.
`,
  5: `
这个问题涉及到很多方面。|Этот вопрос затрагивает множество аспектов.|Бұл мәселе көптеген жақтарға қатысты.|This issue involves many aspects.
他们对这一现象提出了不同的看法。|Они высказали разные мнения об этом явлении.|Олар бұл құбылысқа әртүрлі көзқарас білдірді.|They put forward different views on this phenomenon.
面对竞争，我们必须不断创新。|Перед лицом конкуренции мы должны постоянно обновляться.|Бәсекеге тап болғанда, біз үнемі жаңашыл болуымыз керек.|Facing competition, we must keep innovating.
这项政策受到了广泛的关注。|Эта политика привлекла широкое внимание.|Бұл саясат кеңінен назар аударды.|This policy has received wide attention.
他的成功离不开家人的支持。|Его успех неотделим от поддержки семьи.|Оның табысы отбасының қолдауынсыз мүмкін болмас еді.|His success is inseparable from his family's support.
随着科技的发展，生活越来越方便。|С развитием технологий жизнь становится всё удобнее.|Технологияның дамуымен өмір барған сайын қолайлы болып барады.|With the development of technology, life gets more and more convenient.
我们要充分利用现有的资源。|Нужно в полной мере использовать имеющиеся ресурсы.|Біз қолда бар ресурстарды толық пайдалануымыз керек.|We must make full use of existing resources.
这位作家的作品影响了一代人。|Произведения этого писателя повлияли на целое поколение.|Бұл жазушының шығармалары бір ұрпаққа әсер етті.|This writer's works influenced a generation.
他不顾家人的反对，决定出国留学。|Вопреки возражениям семьи, он решил учиться за границей.|Ол отбасының қарсылығына қарамай, шетелге оқуға баруды шешті.|Despite his family's opposition, he decided to study abroad.
经过多年的努力，他终于实现了梦想。|После многих лет усилий он наконец осуществил мечту.|Көп жылғы еңбектен кейін ол ақыры арманына жетті.|After years of effort, he finally realised his dream.
这种做法违反了规定。|Такой поступок нарушает правила.|Мұндай әрекет ережені бұзады.|This practice violates the regulations.
他们的合作取得了显著的成果。|Их сотрудничество принесло заметные результаты.|Олардың ынтымақтастығы айтарлықтай нәтиже берді.|Their cooperation has achieved remarkable results.
我们不能忽视环境保护的重要性。|Мы не можем игнорировать важность защиты окружающей среды.|Біз қоршаған ортаны қорғаудың маңыздылығын елемей қоя алмаймыз.|We cannot ignore the importance of environmental protection.
她以优异的成绩毕业了。|Она окончила учёбу с отличными результатами.|Ол үздік нәтижемен бітірді.|She graduated with excellent results.
这个提议得到了大多数人的赞同。|Это предложение получило одобрение большинства.|Бұл ұсынысты көпшілік қолдады.|This proposal was approved by the majority.
他对自己的行为感到惭愧。|Ему стыдно за своё поведение.|Ол өз қылығына ұялды.|He feels ashamed of his behaviour.
经济的快速增长带来了许多新问题。|Быстрый рост экономики принёс много новых проблем.|Экономиканың жылдам өсуі көптеген жаңа мәселе туғызды.|Rapid economic growth has brought many new problems.
这件事要求我们认真对待。|Это дело требует от нас серьёзного отношения.|Бұл іс бізден байыпты қарауды талап етеді.|This matter requires us to take it seriously.
他在比赛中发挥了出色的水平。|На соревновании он показал блестящий уровень.|Ол жарыста тамаша деңгей көрсетті.|He performed at an excellent level in the competition.
公司决定扩大生产规模。|Компания решила расширить масштаб производства.|Компания өндіріс көлемін ұлғайтуды шешті.|The company decided to expand its scale of production.
`,
  6: `
他的言论引起了社会各界的强烈反响。|Его высказывания вызвали сильный отклик во всех слоях общества.|Оның сөздері қоғамның барлық саласында қатты жаңғырық тудырды.|His remarks caused strong reactions across society.
面对困境，她始终保持着乐观的态度。|Перед лицом трудностей она всегда сохраняла оптимизм.|Қиындыққа тап болса да, ол үнемі сенімділігін сақтады.|Faced with hardship, she always kept an optimistic attitude.
这一发现颠覆了人们长期以来的认识。|Это открытие перевернуло многолетние представления людей.|Бұл жаңалық адамдардың көпжылдық түсінігін төңкеріп жіберді.|This discovery overturned what people had long believed.
政府采取了一系列措施来遏制通货膨胀。|Правительство приняло ряд мер для сдерживания инфляции.|Үкімет инфляцияны тежеу үшін бірқатар шара қолданды.|The government took a series of measures to curb inflation.
他的行为与他一贯的作风大相径庭。|Его поведение резко расходится с его обычным стилем.|Оның қылығы әдеттегі мінезінен мүлде басқаша.|His behaviour is completely at odds with his usual style.
这部小说深刻地揭示了人性的弱点。|Этот роман глубоко раскрывает слабости человеческой натуры.|Бұл роман адам табиғатының әлсіз тұстарын терең ашады.|This novel profoundly reveals the weaknesses of human nature.
专家们对这一方案的可行性持怀疑态度。|Эксперты скептически относятся к осуществимости этого плана.|Сарапшылар бұл жоспардың іске асуына күмәнмен қарайды.|Experts are doubtful about the feasibility of this plan.
时间的流逝并没有冲淡他们之间的友谊。|Течение времени не ослабило их дружбу.|Уақыттың өтуі олардың достығын бәсеңдеткен жоқ.|The passage of time did not weaken their friendship.
这起事件暴露出管理制度上的漏洞。|Этот инцидент выявил пробелы в системе управления.|Бұл оқиға басқару жүйесіндегі кемшіліктерді әшкереледі.|This incident exposed loopholes in the management system.
他在逆境中磨练出了顽强的意志。|В трудностях он закалил железную волю.|Ол қиындықта мығым ерік-жігерін шыңдады.|He forged a tenacious will in adversity.
我们必须摒弃陈旧的观念。|Мы должны отказаться от устаревших представлений.|Біз ескірген көзқарастардан бас тартуымыз керек.|We must abandon outdated ideas.
这场辩论持续了整整一个下午。|Эти дебаты продолжались целый день.|Бұл пікірталас түстен кейін бүкіл уақытқа созылды.|The debate lasted the whole afternoon.
企业要想长远发展，就必须注重人才的培养。|Чтобы предприятие развивалось в долгосрочной перспективе, оно должно уделять внимание подготовке кадров.|Кәсіпорын ұзақ дамығысы келсе, кадрларды даярлауға мән беруі керек.|If a company wants long-term development, it must pay attention to training talent.
她以敏锐的洞察力发现了问题的症结。|Благодаря острой проницательности она обнаружила суть проблемы.|Ол өткір байқампаздықпен мәселенің түйінін тапты.|With keen insight she found the crux of the problem.
面对质疑，他显得从容不迫。|Перед лицом недоверия он выглядел невозмутимым.|Күмәнге тап болғанда ол сабырлы көрінді.|Faced with doubts, he appeared unhurried.
这一理论在学术界引起了广泛的争议。|Эта теория вызвала широкие споры в научном мире.|Бұл теория ғылыми ортада кең дау тудырды.|This theory caused wide controversy in academic circles.
他把全部精力都倾注在研究上。|Он вложил все силы в исследование.|Ол бар күш-жігерін зерттеуге жұмсады.|He devoted all his energy to his research.
这笔投资的风险不容忽视。|Риском этих инвестиций нельзя пренебрегать.|Бұл инвестицияның қаупін елемеуге болмайды.|The risk of this investment cannot be ignored.
文化交流有助于增进各国人民的相互理解。|Культурный обмен способствует взаимопониманию народов разных стран.|Мәдени алмасу әр елдің халықтарының өзара түсіністігін арттыруға көмектеседі.|Cultural exchange helps increase mutual understanding between peoples.
他的话听起来冠冕堂皇，实际上毫无诚意。|Его слова звучат высокопарно, но на деле совершенно неискренни.|Оның сөздері сыртынан әдемі естіледі, бірақ шын мәнінде шынайылығы жоқ.|His words sound grand, but in fact are utterly insincere.
`,
};

const opt = (e) => T(e[1], e[2], e[3]);
const parse = (txt) => txt.trim().split('\n').map((l) => l.split('|'));

function build(list, offsets, kind, level) {
  const n = list.length;
  const rows = [];
  list.forEach((e, i) => {
    const wrong = [];
    for (let k = 0; wrong.length < 3 && k < n; k++) {
      const c = list[(i + offsets[wrong.length] + k * 13) % n];
      if (c !== e && c[1] !== e[1] && c[3] !== e[3] && !wrong.includes(c)) wrong.push(c);
    }
    if (wrong.length < 3) return;
    const ex = kind === 'word'
      ? T(`${e[0]} - «${e[1]}». Слово из списка HSK ${level}.`, `${e[0]} - «${e[2]}». HSK ${level} тізіміндегі сөз.`, `${e[0]} means "${e[3]}". A word from the HSK ${level} list.`)
      : T(`${e[0]} - «${e[1]}». Предложение уровня HSK ${level}.`, `${e[0]} - «${e[2]}». HSK ${level} деңгейіндегі сөйлем.`, `${e[0]} means "${e[3]}". A sentence of HSK level ${level}.`);
    rows.push([level, kind === 'word' ? mean(e[0]) : sentence(e[0]), opt(e), wrong.map(opt), ex]);
  });
  return rows;
}

export const CHINESE_MORE4 = [];
const seenWord = new Set();
for (let level = 1; level <= 6; level++) {
  const words = parse(WORDS_TXT[level]).filter((e) => e.length === 4 && !seenWord.has(e[0]) && seenWord.add(e[0]));
  const sents = parse(SENTENCES_TXT[level]).filter((e) => e.length === 4);
  CHINESE_MORE4.push(...build(words, [3, 7, 11], 'word', level), ...build(sents, [1, 2, 3], 'sentence', level));
}

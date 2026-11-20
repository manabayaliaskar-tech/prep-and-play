// Дополнительные задания по английскому в сжатой записи: уровень|предложение|ответ|неверные через ;|ключ правила или «ru // kk».
const parse = (text) =>
  text
    .trim()
    .split('\n')
    .map((l) => {
      const [level, sentence, correct, wrong, ref] = l.split('|');
      return [Number(level), sentence, correct, wrong.split(';'), ref.includes(' // ') ? ref.split(' // ') : ref];
    });

export const MORE4_H = {
  'e.prep': parse(`
2|She is very good ______ playing chess.|at|in;on;for|fixedprep
2|They are interested ______ modern art.|in|on;at;for|fixedprep
2|My brother is afraid ______ the dark.|of|from;at;with|fixedprep
2|I am waiting ______ the bus.|for|to;at;on|fixedprep
2|Listen ______ the teacher carefully.|to|at;on;for|fixedprep
2|He is looking ______ his glasses.|for|at;to;on|fixedprep
2|This book belongs ______ my sister.|to|for;at;with|fixedprep
2|We are very proud ______ our school.|of|for;at;from|fixedprep
2|It depends ______ the weather.|on|of;from;to|fixedprep
2|I agree ______ you.|with|to;on;at|fixedprep
2|She laughed ______ his joke.|at|on;to;for|fixedprep
2|He paid ______ the tickets with his card.|for|to;at;of|fixedprep
2|Please ask ______ the menu.|for|to;at;of|fixedprep
2|We walked ______ the bridge to the other side.|across|between;among;beside|across = на другую сторону, поперёк // across = арғы бетке, көлденең
2|The dog ran ______ the garden.|into|onto;at;between|into = внутрь (движение) // into = ішке (қозғалыс)
2|There is a bridge ______ the river.|over|among;to;between|over = над, поверх // over = үстінде
2|Our house is ______ the church and the post office.|between|among;across;to|between = между двумя // between = екеуінің арасында
2|I have not seen her ______ last Friday.|since|for;during;ago|ppsince
2|We stayed in London ______ two weeks.|for|since;during;ago|ppsince
2|He has lived here ______ 2010.|since|for;ago;from|ppsince
2|The film starts ______ half past seven.|at|in;on;by|timeprep
2|My sister was born ______ April.|in|on;at;by|timeprep
2|The party is ______ Saturday evening.|on|in;at;by|timeprep
2|I live ______ the second floor.|on|in;at;by|placeprep
3|She is allergic ______ nuts.|to|of;with;from|fixedprep
3|He is jealous ______ his brother's success.|of|for;at;with|fixedprep
3|We are grateful ______ you for your help.|to|of;at;with|fixedprep
3|The manager is satisfied ______ the results.|with|of;at;for|fixedprep
3|She is responsible ______ the whole team.|for|of;at;to|fixedprep
3|He is tired ______ waiting for the answer.|of|from;at;to|fixedprep
3|The film is full ______ surprises.|of|with;from;in|fixedprep
3|She succeeded ______ passing the exam.|in|at;on;with|fixedprep
3|He apologised ______ the mistake.|for|of;at;to|fixedprep
3|The workers complained ______ the long hours.|about|of;at;for|fixedprep
3|I prefer tea ______ coffee.|to|than;from;over|fixedprep
3|This sauce consists ______ tomatoes and onions.|of|from;with;in|fixedprep
3|They are fond ______ travelling.|of|for;at;with|fixedprep
3|Who is in charge ______ this office?|of|for;on;at|fixedprep
3|The shop is open ______ Monday to Saturday.|from|since;at;on|fixedprep
3|The road runs ______ the lake.|along|among;between;at|along = вдоль // along = бойымен
3|We drove ______ the tunnel.|through|across;along;above|through = сквозь, через // through = арқылы өтіп
3|He hid ______ the sofa.|behind|among;across;between|behind = за, позади // behind = артында
3|There was a long queue ______ the entrance.|at|in;on;of|placeprep
3|I have been learning English ______ three years.|for|since;during;from|ppsince
3|He fell asleep ______ the film.|during|for;while;since|during = в течение, во время // during = барысында
3|She finished the work ______ Friday.|by|until;since;during|by = к определённому сроку // by = белгілі мерзімге дейін
3|We will stay here ______ Friday.|until|by;since;during|until = до (действие продолжается) // until = дейін (іс жалғасады)
3|He is angry ______ his friend for lying.|with|to;on of;for of|fixedprep
3|The teacher was surprised ______ my answer.|at|of;with;for|fixedprep
3|They arrived ______ the airport at midnight.|at|in;on;to|placeprep
3|They arrived ______ Astana on Monday.|in|at;on;to|placeprep
3|My flat is ______ the top floor.|on|in;at;by|placeprep
3|She travels to work ______ train.|by|with;on;in|bytransport
3|I always go to the market ______ foot.|on|by;with;in|bytransport
3|She spoke ______ a quiet voice.|in|with;by;on|in a quiet voice = тихим голосом // in a quiet voice = ақырын дауыспен
3|They were sitting ______ the table, talking.|around|among;between;to|around = вокруг // around = айналасында
3|I know him ______ sight, but not his name.|by|with;on;from|by sight = в лицо // by sight = бетінен
4|The decision is ______ the hands of the committee.|in|at;by;with|in the hands of = в руках // in the hands of = қолында
4|She was ______ tears when she heard the news.|in|with;by;at|in tears = в слезах // in tears = көз жасымен
4|We are ______ agreement with the proposal.|in|on;at;by|in agreement with = согласны с // in agreement with = келісімдеміз
4|The matter is ______ no importance.|of|in;at;by|of no importance = не имеет значения // of no importance = маңызы жоқ
4|The manager is ______ leave until Monday.|on|in;at;by|on leave = в отпуске // on leave = демалыста
4|The product is currently ______ stock.|in|on;at;by|in stock = в наличии // in stock = қоймада бар
4|The item is ______ stock; we will order it.|out of|off;without;from|out of stock = нет в наличии // out of stock = қоймада жоқ
4|This is ______ my control.|beyond|over;above of;behind of|beyond my control = вне моего контроля // beyond my control = менің бақылауымнан тыс
4|The project is ______ schedule.|behind|after;below;under|behind schedule = с отставанием от графика // behind schedule = кестеден кешігіп
4|The train arrived ______ schedule.|on|in;at;by|on schedule = по расписанию // on schedule = кесте бойынша
4|The two sides are ______ odds over the budget.|at|in;on;by|at odds = в разногласии // at odds = келіспеушілікте
4|I met her ______ chance at the airport.|by|in;on;at|by chance = случайно // by chance = кездейсоқ
4|He did it ______ purpose.|on|in;by;at|on purpose = нарочно // on purpose = әдейі
4|We have a meeting ______ the moment.|at|on;in;by|at the moment = сейчас // at the moment = қазір
4|The film is ______ the whole very good.|on|in;at;by|on the whole = в целом // on the whole = жалпы алғанда
4|______ the contrary, I think it is a good idea.|On|In;At;By|on the contrary = напротив // on the contrary = керісінше
4|She succeeded ______ spite of many difficulties.|in|on;at;by|in spite of = несмотря на // in spite of = қарамастан
4|I will do it ______ all costs.|at|in;on;by|at all costs = любой ценой // at all costs = қандай да бір бағамен
4|He is a man ______ his word.|of|in;on;at|a man of his word = человек слова // a man of his word = сөзінде тұратын адам
4|They live ______ the edge of the forest.|on|in;at;by|on the edge of = на краю // on the edge of = шетінде
4|The company is ______ danger of collapse.|in|on;at;by|in danger of = в опасности // in danger of = қауіп астында
4|He took the job ______ the understanding that it was temporary.|on|in;at;by|on the understanding that = при условии // on the understanding that = шартымен
4|The goods are ______ delivery.|on|in;at;by|on delivery = при доставке // on delivery = жеткізу кезінде
4|The meeting was held ______ camera.|in|on;at;by|in camera = в закрытом режиме // in camera = жабық режимде
4|We are not ______ liberty to discuss this.|at|in;on;by|at liberty = вправе // at liberty = құқылы
4|The job is not ______ my liking.|to|in;on;at|to my liking = по вкусу // to my liking = ұнайтын
4|______ the whole, the results were positive.|On|In;At;By|on the whole = в целом // on the whole = жалпы алғанда
4|The shop is ______ sale this week.|on|in;at;by|on sale = в продаже со скидкой // on sale = жеңілдікпен сатылымда
`).map((r) => [r[0], r[1], r[2], r[3].map((w) => w.replace(/ (of|to)$/, '')), r[4]]),
  'e.basics': parse(`
2|There ______ some milk in the fridge.|is|are;were;be|thereis
2|There ______ two apples on the plate.|are|is;be;was|thereis
2|______ there a bank near here?|Is|Are;Do;Does|thereis
2|Are there ______ cinemas in your town?|any|some;a;an|someany
2|There ______ not any bread left.|is|are;were;be|thereis
2|My parents are ______ home now.|at|in;on;to|placeprep
2|Where ______ you from?|are|is;do;does|be
2|Who ______ that man over there?|is|are;do;does|be
2|______ is your favourite colour?|What|Who;Where;When|wh
2|______ old is your grandfather?|How|What;Who;Which|wh
2|______ do you get up? - At seven.|What time|How much;How many;Which|wh
2|______ does the shop open? - At nine.|When|Who;Whose;What|wh
2|______ coat is this? - It is mine.|Whose|Who;Who's;Which|wh
2|______ are you crying? - Because I lost my toy.|Why|Who;What;Where|wh
2|Is this ______ umbrella? - No, it is my sister's.|your|you;yours;you're|poss
2|This is not my bag. ______ is on the chair.|Mine|My;Me;I|poss
2|These shoes are ______.|hers|she;her's;hers'|poss
2|The dog wagged ______ tail.|its|it's;it;their|poss
2|I like ______ new teacher. She is very kind.|our|we;us;ours|poss
2|We often visit ______ grandparents at weekends.|our|we;us;ours|poss
2|Is that ______ phone ringing?|your|you;yours;yourself|poss
2|They love ______ new house.|their|they;them;theirs|poss
2|Ali and I are friends. ______ sit together.|We|Us;Our;They|subjpron
2|Aidar is my brother. ______ is fifteen.|He|His;Him;She|subjpron
2|Dana and Aigul are sisters. ______ live in Almaty.|They|Their;Them;We|subjpron
2|I saw Marat yesterday. I gave ______ the book.|him|he;his;himself|Объектное местоимение после глагола: him. // Етістіктен кейін объектілік есімдік: him.
2|Can you call ______ later? I am busy now.|me|I;my;mine|Объектное местоимение после глагола: me. // Етістіктен кейін объектілік есімдік: me.
2|This letter is for ______.|you|your;yours;yourself|Объектное местоимение после предлога: you. // Предлогтан кейін объектілік есімдік: you.
2|Look at ______! They are dancing.|them|they;their;theirs|Объектное местоимение после предлога: them. // Предлогтан кейін объектілік есімдік: them.
2|My sister cut ______ with a knife.|herself|her;hers;she|Возвратное местоимение: herself. // Өздік есімдік: herself.
2|He looked at ______ in the mirror.|himself|him;his;he|Возвратное местоимение: himself. // Өздік есімдік: himself.
2|There are many ______ in this zoo.|monkeys|monkies;monkeyes;monkey|Множественное число: monkey - monkeys (после гласной просто -s). // Көпше түрі: monkey - monkeys (дауыстыдан кейін -s).
2|I have two ______ and a sister.|brothers|brother;brothers';brotheres|Множественное число после числительного: brothers. // Сан есімнен кейін көпше түр: brothers.
2|These are my ______.|glasses|glass;glasss;glassies|Множественное число: glass - glasses. // Көпше түрі: glass - glasses.
2|My grandmother has three ______.|grandchildren|grandchilds;grandchildrens;grandchild|pluralirr
2|She put the ______ on the table.|knives|knifes;knife;knifies|Множественное число: knife - knives. // Көпше түрі: knife - knives.
2|The ______ are playing in the yard.|children|childs;childrens;child|pluralirr
2|I do not like ______ in the dark.|walking|walk;to walks;walked|Глагол после like обычно принимает -ing. // like-тан кейін етістік көбіне -ing түрінде тұрады.
`),
  'e.modal': parse(`
1|You ______ talk loudly in the hospital.|must not|must to;do not to;can to|must
1|I ______ swim, but I cannot dive.|can|cans;am;do|can
1|She ______ speak French very well.|can|cans;is can;can to|can
1|______ I come in?|May|Does;Am;Are|canperm
1|______ you give me a glass of water, please?|Could|Are;Does;Is|canperm
1|Students ______ wear a uniform at this school.|must|musts;must to;can to|must
1|You ______ eat a lot of vegetables. They are good for you.|should|shoulds;should to;must to|should
1|He is ill. He ______ stay in bed.|should|shoulds;should to;is should|should
1|I ______ not find my keys. Where are they?|can|am;does;must|can
1|They ______ play outside. It is raining.|cannot|do not can;are not can;must can|can
1|You ______ do your homework before you play.|must|musts;must to;are must|must
1|Dad says we ______ be home by nine.|must|musts;must to;are must|must
1|We ______ go to the zoo on Sunday.|can|cans;can to;are can|can
1|I ______ run fast when I was young.|could|can;must;should|couldpast
1|My grandfather ______ play the violin when he was young.|could|can;must;should|couldpast
1|You look tired. You ______ rest.|should|shoulds;should to;are should|should
1|Please ______ the door. It is cold.|close|closes;to close;closing|can
1|You should ______ to the doctor.|go|goes;to go;going|can
1|She can ______ three languages.|speak|speaks;to speak;speaking|can
1|We must ______ quiet in the library.|be|are;to be;being|can
1|Can I ______ your pen?|use|uses;to use;using|can
1|You ______ cross the road when the light is red.|must not|must to;do not to;can to|must
1|He ______ come with us because he is busy.|cannot|do not can;is not can;must can|can
1|You ______ be late for school.|must not|must to;do not to;can to|must
1|______ she play tennis?|Can|Does;Is;Must|can
1|They ______ stay up late on school days.|should not|do not should;are not should;should to not|should
1|Birds ______ fly, but penguins cannot.|can|cans;are;do|can
1|I ______ come to your party. I am sorry.|cannot|do not can;am not can;must not can|can
1|______ I help you?|Can|Does;Am;Are|canperm
1|You ______ smoke here. It is forbidden.|must not|must to;do not to;can to|must
1|We have lots of time. We ______ hurry.|do not have to|must to;cannot to;should not to|donthave
1|Tomorrow is Sunday. I ______ get up early.|do not have to|must to;cannot to;should not to|donthave
1|______ I sit here?|Can|Does;Am;Are|canperm
1|He ______ ride a bike when he was four.|could|can;must;should|couldpast
1|You ______ drink coffee at night. It is bad for sleep.|should not|do not should;are not should;should to not|should
1|Children ______ cross the road alone.|must not|must to;do not to;can to|must
1|I have a test tomorrow. I ______ study tonight.|must|musts;must to;am must|must
1|She ______ to wake up early for work.|has|have;must;is|have to / has to - обязанность. // have to / has to - міндеттілік.
1|He ______ to wear a tie at work.|has|have;must;is|have to / has to - обязанность. // have to / has to - міндеттілік.
`),
};

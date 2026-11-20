// Дополнительные задания по английскому в сжатой записи: добавки до 100 на уровень.
const parse = (text) =>
  text
    .trim()
    .split('\n')
    .map((l) => {
      const [level, sentence, correct, wrong, ref] = l.split('|');
      return [Number(level), sentence, correct, wrong.split(';'), ref.includes(' // ') ? ref.split(' // ') : ref];
    });
const DED = 'DED';
const MP = ['modal + have + причастие говорит о прошлом: should have, must have, could have.', 'modal + have + үшінші форма өткен туралы айтады: should have, must have, could have.'];

export const MORE4_K = {
  'e.modal': parse(`
4|She ______ have been delighted when she heard the news.|must|should to;would to;can|DED
4|I ______ have gone to the party, but I was too tired.|could|must;should to;would to|DED
4|You ______ have been more careful with the glass.|should|must to;might to;would|DED
4|He ______ not have seen us; he walked straight past.|can|should to;would to;need|DED
4|They ______ have known the way; they have lived here for years.|must|can;should to;need|DED
4|I ______ have told you earlier, but I forgot.|should|must;would to;might to|DED
4|It ______ have been much worse if we had not acted quickly.|could|must;should to;needn't|DED
4|You ______ have made so much food; nobody was hungry.|needn't|mustn't;can't;shouldn't to|DED
4|She is not answering. She ______ be asleep.|might|should to;would to;must to|DED
4|He ______ be the thief; he was abroad at the time.|can't|mustn't;needn't;shouldn't|DED
4|The meeting ______ finish soon; it started two hours ago.|should|must to;would to;can't|DED
4|You ______ well have a point.|may|can;ought;need|DED
4|There ______ have been a mistake in the calculation.|must|may to;should to;can't|DED
4|We ______ not have been able to do it without you.|would|should to;might to;must|DED
4|She ______ have won the race, but she fell.|could|must;should to;needn't|DED
4|You ______ have waited so long. You could have called me.|needn't|mustn't;couldn't to;can't|DED
`).map((r) => [r[0], r[1], r[2], r[3], MP]),
  'e.prep': parse(`
4|The scheme is ______ review at the moment.|under|in;at;on|under review = на рассмотрении // under review = қарау үстінде
4|She is ______ the impression that the exam is easy.|under|in;at;on|under the impression = с впечатлением // under the impression = әсерде
4|We have the situation ______ control.|under|in;at;on|under control = под контролем // under control = бақылауда
4|He did it ______ his own free will.|of|in;on;at|of one's own free will = по своей воле // of one's own free will = өз еркімен
4|The two events are ______ no way connected.|in|on;at;by|in no way = никоим образом // in no way = ешқандай жолмен
4|I disagree ______ the whole idea.|with|to;on;at|fixedprep
4|They congratulated her ______ her promotion.|on|for;at;with|fixedprep
4|The team is made ______ of ten players.|up|out;in;off|made up of = состоит из // made up of = тұрады
4|This is a matter ______ life and death.|of|in;on;at|a matter of = вопрос чего-либо // a matter of = мәселесі
4|The concert was held ______ aid of charity.|in|on;at;by|in aid of = в пользу // in aid of = пайдасына
4|He gave up smoking ______ the advice of his doctor.|on|in;at;by|on the advice of = по совету // on the advice of = кеңесімен
4|She is ______ the weather today; she has a cold.|under|in;at;on|under the weather = нездоровится // under the weather = сыр берген
4|The company is ______ the brink of collapse.|on|in;at;by|on the brink of = на грани // on the brink of = шегінде
3|The singer is popular ______ young people.|among|between;across;beside|among = среди многих // among = көптің арасында
3|Please write your name ______ the top of the page.|at|in;on of;by|placeprep
3|I have not got much in common ______ him.|with|to;at;by|fixedprep
3|We got stuck ______ a traffic jam.|in|on;at;by|placeprep
3|They live ______ the countryside.|in|on;at;by|placeprep
3|The boy ran ______ the road without looking.|across|among;between;above|across = поперёк, через // across = көлденең өтіп
2|The cat jumped ______ the wall.|over|among;between;at|over = через, над // over = үстінен
2|We go ______ a walk every evening.|for|to;at;in|go for a walk = идти на прогулку // go for a walk = серуенге шығу
2|He is ______ holiday in Turkey.|on|in;at;by|on holiday = в отпуске // on holiday = демалыста
2|The bus stop is ______ front of the school.|in|on;at;by|in front of = перед // in front of = алдында
2|She was born ______ the 5th of May.|on|in;at;by|timeprep
2|We had dinner ______ a restaurant.|in|on;at to;by|placeprep
`).map((r) => [r[0], r[1], r[2], r[3].map((w) => w.replace(/ (of|to)$/, '')), r[4]]),
  'e.wordform': parse(`
3|The ______ of the lesson is to practise grammar. (PURPOSE)|purpose|purposeful;purposely;purposes-ly|wordform
3|It is ______ to ride a bike without a helmet. (SAFE)|unsafe|safely;safety;safe|wordform
3|The teacher was very ______ with the class. (PATIENT)|patient|patiently;patience;impatiently|wordform
3|There is a ______ of water in this region. (SHORT)|shortage|shorten;shortly;shorter|wordform
3|The ______ were waiting for the show to begin. (AUDIENCE)|audience|audible;audio;audiences-ly|wordform
3|We admire her ______. (BRAVE)|bravery|bravely;braver;brave|wordform
3|His ______ to the team was important. (CONTRIBUTE)|contribution|contributor;contributed;contributing|wordform
4|The ______ of the experiment was clear. (CONCLUDE)|conclusion|concluded;conclusive;concluding|wordform
4|He spoke ______ and everyone listened. (CONFIDENT)|confidently|confident;confidence;confide|wordform
4|Her ______ with the results was obvious. (SATISFY)|satisfaction|satisfied;satisfying;satisfactory|wordform
4|The ______ of the museum was moved to a new building. (COLLECT)|collection|collective;collected;collector|wordform
4|He is ______ for the damage. (RESPONSE)|responsible|responsibly;responsibility;respond|wordform
4|The new plan is more ______ than the old one. (PRACTICE)|practical|practically;practise;practitioner|wordform
4|There is a lack of ______ between the departments. (CO-OPERATE)|co-operation|co-operative;co-operated;co-operating|wordform
4|This is an ______ opportunity. (CREDIT)|incredible|incredibly;incredulous;credible|wordform
4|He felt ______ when he saw the mess. (FURY)|furious|furiously;furies;furiousness|wordform
4|The ______ of the building was delayed. (COMPLETE)|completion|completely;completed;incomplete|wordform
4|He is a ______ driver; he never takes risks. (CARE)|careful|carefully;careless;caring|wordform
4|The students gave a ______ presentation. (BRILLIANCE)|brilliant|brilliantly;brilliance;brilliants|wordform
4|The ______ of the plan is questionable. (WISE)|wisdom|wisely;wise;wiser|wordform
4|They enjoyed the ______ of the countryside. (PEACE)|peace|peaceful;peacefully;peaces|wordform
5|The ______ of the old building cost millions. (RESTORE)|restoration|restored;restorative;restoring|wordform
5|It is ______ to expect immediate results. (REAL)|unrealistic|realistically;reality;realise|wordform
5|The ______ of the new rules was gradual. (ENFORCE)|enforcement|enforced;enforcing;enforceable|wordform
5|He was ______ of the dangers of the job. (UNAWARE)|unaware|awareness;unawareness;awarely|wordform
5|The film was a ______ success. (COMMERCE)|commercial|commercially;commerce;commercialise|wordform
5|She showed great ______ in difficult times. (DETERMINE)|determination|determined;determine;determinedly|wordform
5|The ______ of the situation became clear. (SERIOUS)|seriousness|serious;seriously;series|wordform
5|The company has a strong ______ for quality. (REPUTE)|reputation|reputable;reputed;reputedly|wordform
5|There was ______ opposition to the plan. (WIDE)|widespread|widely;widen;width|wordform
5|His ______ was greatly appreciated. (ASSIST)|assistance|assistant;assisted;assisting|wordform
5|The ______ of the two drugs is dangerous. (COMBINE)|combination|combined;combining;combinable|wordform
5|It was a ______ decision that surprised everyone. (CONTROVERSY)|controversial|controversially;controversy;controvert|wordform
6|The report was ______ and full of errors. (RELIABLE)|unreliable|reliably;reliability;reliant|wordform
6|The ______ of his argument was obvious to everyone. (WEAK)|weakness|weakly;weaken;weaker|wordform
6|The negotiations ended in complete ______. (FAIL)|failure|failed;failing;fails|wordform
6|His ______ to the cause was beyond doubt. (DEVOTE)|devotion|devoted;devotedly;devotee|wordform
6|It was a ______ gesture that touched everyone. (SPONTANEOUS)|spontaneous|spontaneity;spontaneously;spontaneities|wordform
6|The ______ of the old laws is long overdue. (REFORM)|reform|reformed;reformer;reforming|wordform
6|The two sides showed a ______ to compromise. (WILLING)|willingness|willing;willingly;unwilling|wordform
6|The ______ in the city centre worsened. (CONGEST)|congestion|congested;congesting;congestive|wordform
6|The ______ of the rainforest is alarming. (DESTROY)|destruction|destroyed;destructive;destroyer|wordform
6|A ______ look crossed his face. (PUZZLE)|puzzled|puzzling;puzzle;puzzlement|wordform
6|She gave a ______ performance. (BREATH)|breathtaking|breathless;breathed;breathe|wordform
6|The ______ of the findings is widely accepted. (SIGNIFY)|significance|significant;signify;significantly|wordform
6|It is ______ to say who will win. (POSSIBLE)|impossible|possible;possibly;possibility|wordform
`).filter((r) => !/-(ly|ful|ness)|-ly|co-operat/.test(r[2] + r[3].join(''))),
  'e.struct': parse(`
2|If you ______ hungry, eat something.|are|will be;were;would be|cond1
2|If I see him, I ______ him.|will tell|tell to;told;would tell|cond1
2|The cake ______ by my grandmother.|was made|made;is making;makes|passive
2|My bike ______ yesterday.|was repaired|repaired;repairs;is repairing|passive
2|They want ______ to the cinema.|to go|go;going;went|infin
2|I am good at ______ jokes.|telling|tell;to tell;told|AFTERPREP_
3|If I were rich, I ______ a big house.|would buy|will buy;bought;buy|cond2
3|The windows ______ every week.|are cleaned|clean;cleans;cleaned|passive
3|She said she ______ tired.|was|is;will be;has been|reported
3|I wish I ______ a bigger room.|had|have;would have;will have|wish
3|He asked me what I ______.|wanted|want;will want;am wanting|reported
4|If she had known, she ______ differently.|would have acted|would act;had acted;will act|cond3
4|I wish I ______ the exam last year.|had passed|passed;have passed;would pass|wish
4|He is said ______ a fortune.|to have made|making;to make;made|passinf
4|We had the car ______ last week.|serviced|service;servicing;to service|causative
4|It is time we ______ a decision.|made|make;will make;have to made|hightime
5|If only he ______ listened to me!|had|has;would;did|wish
5|She is understood ______ the country last year.|to have left|leaving;to leave;left|passinf
5|The proposal ______ by the board next week.|will be reviewed|reviews;will review;is reviewing|passive
5|He objected to ______ treated like a child.|being|be;been;to be|passgerund
`).map((r) => (r[4] === 'AFTERPREP_' ? [r[0], r[1], r[2], r[3], ['после предлога глагол принимает форму -ing.', 'предлогтан кейін етістік -ing түрінде тұрады.']] : r)),
  'e.basics': parse(`
1|There ______ a book on the table.|is|are;be;have|thereis
1|There ______ three chairs in the room.|are|is;be;has|thereis
1|I have ______ new bike.|a|an;some;many|aan
2|There are ______ people in the park today.|many|much;a;an|someany
2|He has ______ brother and two sisters.|a|an;some;many|aan
`).map((r) => [r[0], r[1], r[2], r[3].filter((w) => w.length > 0), r[4]]),
  'e.modal+': parse(`
1|You ______ run in the corridor.|must not|must to;do not to;can to|must
1|Birds ______ fly, but fish cannot.|can|cans;do;are|can
1|I ______ speak Chinese, but I can understand a little.|cannot|do not can;am not can;must not can|can
1|______ you open the window, please?|Could|Are;Does;Is|canperm
1|We ______ wear helmets when we ride bikes.|should|shoulds;should to;are should|should
1|She ______ play chess when she was six.|could|can;must;should|couldpast
2|You ______ to show your ticket at the entrance.|have|has;must to;are|have to / has to - обязанность. // have to / has to - міндеттілік.
2|He ______ to get up early because the bus leaves at six.|has|have;must to;is|have to / has to - обязанность. // have to / has to - міндеттілік.
2|We ______ not use phones during the lesson.|should|do;are;can to|should
2|You ______ borrow my book if you like.|may|mays;may to;are may|canperm
2|It ______ rain today. Take an umbrella.|might|mights;might to;is might|might / may выражает возможность. // might / may мүмкіндікті білдіреді.
`).map((r) => r),
  'e.wordform+': parse(`
3|The ______ of the book was very interesting. (END)|ending|ended;endless;endlessly|wordform
3|It was an ______ day; we saw nothing special. (EVENT)|uneventful|eventful;eventually;event|wordform
3|He is ______ to learn new things. (EAGERNESS)|eager|eagerly;eagerness;eagers|wordform
3|She answered the phone ______. (QUICK)|quickly|quick;quicker;quickness|wordform
5|His ______ to learn languages is remarkable. (ABLE)|ability|able;ably;unable|wordform
5|The ______ of the roads caused delays. (CLOSE)|closure|closed;closely;closeness|wordform
4|The ______ of the story is a mystery. (BEGIN)|beginning|began;begun;beginner|wordform
4|The ______ of the museum is free for students. (ADMIT)|admission|admitted;admittance-ly;admitting|wordform
4|His ______ made the team lose. (CARE)|carelessness|careless;carelessly;careful|wordform
5|The ______ of the two sides took weeks. (RECONCILE)|reconciliation|reconciled;reconcilable;reconciling|wordform
`).filter((r) => !/-ly/.test(r[3].join(''))),
  'e.prep+': parse(`
4|He is known ______ his sense of humour.|for|of;at;with|fixedprep
2|My grandmother lives ______ a small village.|in|on;at;by|placeprep
3|We arrived ______ the hotel late at night.|at|in;on;to|placeprep
4|The manager is ______ the opinion that we should wait.|of|in;on;at|of the opinion = придерживается мнения // of the opinion = пікірде
`),
  'e.adv': parse(`
5|It was ______ a hot day that we stayed indoors.|such|so;very;too|sosuch
5|The soup was ______ salty that nobody could eat it.|so|such;very;a|sosuch
5|Never again ______ I trust him.|will|do;am;have|inversion
`),

};

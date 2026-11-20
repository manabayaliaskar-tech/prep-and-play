// Дополнительные задания по английскому в сжатой записи: условные, пассив, формы глагола, продвинутые конструкции, модальные.
const parse = (text) =>
  text
    .trim()
    .split('\n')
    .map((l) => {
      const [level, sentence, correct, wrong, ref] = l.split('|');
      return [Number(level), sentence, correct, wrong.split(';'), ref.includes(' // ') ? ref.split(' // ') : ref];
    });

export const MORE4_I = {
  'e.struct': parse(`
2|If you ______ the button, the machine starts.|press|will press;pressed;would press|Zero conditional (общая истина): if + Present Simple, Present Simple. // Zero conditional (жалпы ақиқат): if + Present Simple, Present Simple.
2|If it is sunny tomorrow, we ______ swimming.|will go|go to;went;would go|cond1
2|I will tell you if I ______ anything.|hear|will hear;heard;would hear|cond1
2|If she ______ late, I will wait for her.|is|will be;was;would be|cond1
2|We will not go out if it ______.|rains|will rain;rained;would rain|cond1
2|If you ______ me, I will help you.|ask|will ask;asked;would ask|cond1
2|He will be angry if you ______ his things.|touch|will touch;touched;would touch|cond1
2|The bread ______ in the morning.|is baked|bakes;baked;is baking|passive
2|The museum ______ by thousands of tourists every year.|is visited|visits;visited;is visiting|passive
2|This house ______ in 1980.|was built|built;is built;has built|passive
2|The doors ______ at eight o'clock.|are opened|open;is opened;opens|passive
2|The thief ______ by the police yesterday.|was caught|caught;is caught;catches|passive
2|Many languages ______ in Switzerland.|are spoken|speak;is spoken;spoke|passive
2|The match ______ because of the rain.|was cancelled|cancelled;is cancelled;cancels|passive
2|She wants ______ a doctor when she grows up.|to be|be;being;is|infin
2|We hope ______ you soon.|to see|see;seeing;saw|infin
2|They agreed ______ the plan.|to change|change;changing;changed|infin
2|He learned ______ when he was five.|to swim|swim;swimming;swam|infin
2|I am planning ______ my cousin next week.|to visit|visit;visiting;visited|infin
2|She dislikes ______ early.|getting up|get up;to getting up;got up|gerund
2|They enjoy ______ football together.|playing|play;to played;played|gerund
2|I am looking forward to ______ you.|seeing|see;saw;to see|toing
2|He gave up ______ after ten years.|smoking|smoke;to smoking;smoked|gerund
2|She is afraid of ______ in the dark.|walking|walk;to walk;walked|gerund
2|We stopped ______ and had a rest.|walking|walk;to walks;walked|gerund
2|My father let me ______ his car.|drive|to drive;driving;drove|letmake
2|The film made me ______.|laugh|to laugh;laughing;laughed|letmake
2|Please let me ______ you.|help|to help;helping;helped|letmake
2|I need ______ some milk.|to buy|buy;buying;bought|infin
2|She asked me ______ the window.|to open|open;opening;opened|infin
2|He told us ______ quiet.|to be|be;being;been|infin
2|It is good ______ early.|to get up|get up;getting up;got up|infin
2|I can not decide what ______.|to wear|wear;wearing;wore|infin
2|She is too tired ______ any more.|to walk|walk;walking;walked|infin
2|Tell me where ______.|you live|do you live;you do live;lives you|indirectq
2|Do you know what time ______?|it is|is it;it does;does it|indirectq
2|I wonder how much ______.|it costs|does it cost;costs it;it cost does|indirectq
3|If I ______ more free time, I would learn to paint.|had|have;would have;will have|cond2
3|If she ______ here, she would help us.|were|is;would be;will be|cond2
3|We would buy a bigger house if we ______ more money.|had|have;would have;will have|cond2
3|If I ______ the answer, I would tell you.|knew|know;would know;will know|cond2
3|Would you go abroad if you ______ the chance?|had|have;would have;will have|cond2
3|He would be happier if he ______ more friends.|had|has;would have;will have|cond2
3|If it ______ warmer, we would go to the beach.|were|is;would be;will be|cond2
3|I wish I ______ how to cook.|knew|know;would know;will know|wish
3|I wish she ______ here now.|were|is;would be;will be|wish
3|If only I ______ a car!|had|have;will have;would have|wish
3|I wish they ______ so noisy.|would not be|will not be;are not;were being|wish
3|The room ______ every day.|is cleaned|cleans;cleaned;is cleaning|passive
3|A new bridge ______ here next year.|will be built|builds;will build;is built|passive
3|The documents ______ yet.|have not been signed|did not sign;are not sign;were not signing|passive
3|The car ______ at the moment.|is being repaired|repairs;is repaired;repaired|passcont
3|My bag ______ on the train last week.|was stolen|stole;is stolen;has stolen|passive
3|The results ______ tomorrow.|will be announced|announce;will announce;announced|passive
3|English ______ in many countries.|is spoken|speaks;speak;spoke|passive
3|She said that she ______ the film.|had seen|saw;has seen;sees|reported
3|He told me he ______ tired.|was|is;will be;has been|reported
3|She asked me where I ______.|lived|live;do live;was lived|reported
3|They said they ______ help us.|would|will;shall;can|reported
3|He asked if I ______ coffee.|wanted|want;do want;am wanting|whether
3|She wondered whether he ______ come.|would|will;shall;does|whether
3|Don't forget ______ the lights before you leave.|to turn off|turning off;turn off;turned off|remember
3|I remember ______ him at the party last year.|meeting|to meet;meet;met|remember
3|He is used to ______ in the cold.|working|work;worked;to work|toing
3|I am looking forward to ______ from you.|hearing|hear;heard;to hear|toing
3|She is getting her hair ______ tomorrow.|cut|cutting;to cut;cuts|causative
3|We had the windows ______ last week.|cleaned|clean;cleaning;to clean|causative
3|He had his photo ______ for the passport.|taken|take;taking;took|causative
3|She promised ______ me a postcard.|to send|sending;send;sent|infin
3|He suggested ______ a taxi.|taking|to take;take;took|gerund
3|They decided ______ the party.|to cancel|cancelling;cancel;cancelled|infin
3|It is no use ______ with him.|arguing|to argue;argue;argued|WORTH_
4|If I ______ about the problem, I would have helped.|had known|knew;have known;would know|cond3
4|She would have won if she ______ faster.|had run|ran;has run;would run|cond3
4|If they had left earlier, they ______ the flight.|would not have missed|will not miss;would not miss;had not missed|cond3
4|If you ______ the instructions, you would not have made mistakes.|had read|read;have read;would read|cond3
4|If he had been more careful, he ______ the vase.|would not have broken|would not break;had not broken;will not break|cond3
4|If I ______ the exam, I would be at university now.|had passed|passed;have passed;would pass|condmixed
4|If she ______ harder at school, she would have a better job now.|had studied|studied;has studied;would study|condmixed
4|If we had not lost the map, we ______ lost now.|would not be|would not have been;will not be;were not|condmixed
4|______ she not called, we would have waited.|Had|Has;Did;Was|condinv
4|______ you like more information, please call us.|Should|Would;Did;Had|condinv
4|I wish I ______ the truth earlier.|had known|knew;have known;would know|wish
4|I wish I ______ more careful yesterday.|had been|was;were;would be|wish
4|If only we ______ the tickets in advance!|had booked|booked;have booked;would book|wish
4|It is believed ______ the earliest cities appeared there.|that|what;which;to|passinf
4|The president is expected ______ tomorrow.|to arrive|arriving;arrive;to arrived|passinf
4|He is said ______ nine languages.|to speak|speaking;speak;to spoke|passinf
4|The painting is believed ______ stolen last year.|to have been|to be;being;been|passinf
4|They had the house ______ last summer.|painted|paint;painting;to paint|causative
4|I must get my laptop ______.|fixed|fix;fixing;to fix|causative
4|The bridge ______ at the moment.|is being built|builds;is built;has been building|passcont
4|The proposal ______ by the committee now.|is being discussed|discusses;is discussed;discussed|passcont
4|He denied ______ the window.|breaking|to break;break;broke|gerund
4|She admitted ______ the money.|taking|to take;take;took|gerund
4|He regrets ______ that remark.|making|to make;make;made|remember
4|Remember ______ me when you arrive.|to call|calling;call;called|remember
4|I will never forget ______ the sea for the first time.|seeing|to see;see;saw|remember
4|She is tired of ______ what to do.|being told|telling;to tell;told|passgerund
4|He enjoys ______ by his fans.|being admired|admiring;to admire;admired|passgerund
4|It is high time you ______ a decision.|made|make;will make;have to made|hightime
4|I would rather you ______ me the truth.|told|tell;will tell;would tell|hightime
4|The teacher insisted that he ______ the exam again.|take|takes;took;will take|subjunctive
4|It is important that she ______ on time.|arrive|arrives;arrived;will arrive|subjunctive
4|They suggested that the meeting ______ postponed.|be|is;was;were being|subjunctive
5|______ I known the risk, I would never have agreed.|Had|Have;Did;If|condinv
5|But for your advice, I ______ the wrong choice.|would have made|will make;had made;would make|butfor
5|If it ______ not for him, we would have failed.|had|were;has;did|condinv
5|If he ______ to ask, I would help him.|were|was being;is;would be|cond2
5|I would have called you had I ______ your number.|known|know;knew;have known|condinv
5|If I ______ you, I would think twice.|were|am;was being;would be|cond2
5|She talks as if she ______ the boss.|were|is;has been;would be|asthough
5|He looked as though he ______ a ghost.|had seen|has seen;sees;would see|asthough
5|I wish I ______ speak Japanese.|could|can;would;will|wish
5|It is time we ______ the problem seriously.|took|take;will take;would take|hightime
5|The suspect is thought ______ left the country.|to have|having;have;to has|passinf
5|The company is said ______ to cut jobs.|to be planning|being planned;planning;to planned|passinf
5|She is believed ______ the secret for years.|to have known|knowing;to know;known|passinf
5|The matter is being ______ by experts.|investigated|investigating;investigate;to investigate|passcont
5|I object to ______ like a child.|being treated|treating;treated;be treated|passgerund
5|He was accused of ______ the data.|falsifying|to falsify;falsify;falsified|gerund
5|I am not used to ______ spoken to like that.|being|be;been;to be|passgerund
5|She resented ______ asked to leave.|being|be;to be;been|passgerund
5|He insisted ______ seeing the manager.|on|in;at;to|fixedprep
5|The committee recommended that the plan ______ approved.|be|is;was;will be|subjunctive
5|It is essential that all staff ______ the rules.|follow|follows;followed;will follow|subjunctive
5|I would rather he ______ so late yesterday.|had not arrived|did not arrive;has not arrived;would not arrive|hightime
5|They were made ______ for hours.|to wait|wait;waiting;waited|letmake
5|The prisoners were not allowed ______.|to speak|speaking;speak;spoke|infin
5|The house is said ______ been built in 1700.|to have|having;have;to has|passinf
5|Supposing the plan ______, what would we do?|failed|fails;will fail;would fail|cond2
5|He might have succeeded if he ______ harder.|had tried|tried;has tried;would try|cond3
5|If we ______ the deadline, we would have lost the contract.|had missed|missed;have missed;would miss|cond3
5|Were I ______ in your position, I would accept.|to be|being;am;will be|WERETO_
5|Should it ______ necessary, we will call you.|prove|proves;proved;will prove|condinv
5|They would be happier if they ______ in the countryside.|lived|live;will live;would live|cond2
`).map((r) => (r[4] === 'WORTH_' ? [r[0], r[1], r[2], r[3], 'gerund'] : r[4] === 'WERETO_' ? [r[0], r[1], r[2], r[3], 'cond2'] : r)),
  'e.adv': parse(`
4|He worked ______ hard that he fell ill.|so|such;very;too|sosuch
4|It was ______ a long film that we left early.|such|so;very;too|sosuch
4|They had ______ a good time that they did not want to leave.|such|so;very;too|sosuch
4|The coffee was ______ hot that I could not drink it.|so|such;very;a|sosuch
4|She is ______ a clever girl that she always wins.|such|so;very;too|sosuch
4|He drove ______ fast that he missed the exit.|so|such;very;a|sosuch
4|There was ______ much noise that I could not sleep.|so|such;very;a|sosuch
4|______ the bad weather, the match took place.|Despite|Although;Because;However|despite
4|______ the match was difficult, we won.|Although|Despite;In spite of;Because of|despite
4|We enjoyed the trip in spite of ______ the rain.|the|that;being;because|despite
4|She went to work in spite of ______ ill.|feeling|she felt;to feel;felt|despite
4|He passed the exam, ______ he had not studied much.|although|despite;in spite of;because of|despite
4|Hardly ______ I closed the door when the phone rang.|had|did;have;was|hardly
4|No sooner had she arrived ______ it began to snow.|than|when;that;as|hardly
4|Never ______ I seen such a crowd.|have|did;had;do|inversion
4|Only after the show ______ I realise how late it was.|did|do;had;was|inversion
4|Not only ______ late, but he was also rude.|was he|he was;did he;he did be|inversion
4|Rarely ______ we eat out.|do|did;have;are|inversion
4|Seldom ______ she complain about anything.|does|did;has;is|inversion
4|Little ______ he know what was waiting for him.|did|does;has;was|inversion
4|At no time ______ they lie to us.|did|do;were;have|inversion
4|It was Aigerim ______ won the first prize.|who|whom;which;what|cleft
4|It was in Almaty ______ we first met.|that|what;who;whom|cleft
4|What I like about this city ______ the people.|is|are;be;does|cleft
4|The thing that annoys me most ______ his laziness.|is|are;do;be|cleft
4|There is no point ______ for him; he never comes on time.|in waiting|to wait;wait;waited|nopoint
4|It is no good ______ to change his mind.|trying|to try;try;tried|nopoint
4|He is bound ______ the exam if he studies.|to pass|passing;pass;passed|nopoint
4|She is due ______ tomorrow at ten.|to arrive|arriving;arrive;arrived|nopoint
4|It looks ______ it will snow tonight.|as if|as;like if;so that|asthough
4|She talks ______ she knew everything.|as if|as;so;because|asthough
4|Come ______ may, we will not give up.|what|how;when;who|fixedform
4|Try ______ he might, he could not find the key.|as|so;though of;however of|concession
4|Much ______ I admire him, I cannot agree.|as|that;so;though of|concession
4|No matter ______ you go, you will find friends.|where|what;which;who|LESS_
4|Whatever ______ happens, stay calm.|else|so;much;else of|LESS_
5|______ rarely does he make a mistake that people are surprised.|So|Such;Very;Too|inversion
5|Not until the end of the film ______ the truth.|did we learn|we learned;we did learn;learned we|inversion
5|Under no circumstances ______ you open this door.|should|do;must to;are|inversion
5|Nowhere in the city ______ such a view.|can you find|you can find;do you find;find you|inversion
5|Only when she left ______ how much she missed him.|did he realise|he realised;he did realise;realised he|inversion
5|On no account ______ the machine be left on.|must|does;is;do|inversion
5|Not a word ______ she say about it.|did|does;was;had been|inversion
5|No sooner ______ the door than the alarm sounded.|had he opened|he had opened;he opened;opened he|hardly
5|Hardly ______ the letter when the phone rang.|had she read|she had read;she read;read she|hardly
5|Such ______ the noise that nobody could think.|was|is being;did;were|sosuch
5|So ______ was the storm that all flights were cancelled.|severe|severely;severity;more severe|sosuch
5|She is a woman ______ opinion I respect.|whose|who;which;whom|cleft
5|The man ______ I spoke to was very polite.|whom|who of;whose;which|cleft
5|The film, ______ I saw last week, was brilliant.|which|what;that;who|cleft
5|The reason ______ he left is unclear.|why|what;how;which|cleft
5|The town ______ I was born is small.|where|which;that;what|cleft
5|It was not until midnight ______ the guests left.|that|when;than;then|cleft
5|What he said ______ everyone.|surprised|were surprised;surprise;surprising|cleft
5|Having ______ the report, she sent it to the manager.|finished|finish;finishing;to finish|PART_
5|Not knowing the way, he ______ a map.|bought|buys;buying;having buy|PART_
5|______ in Paris, she speaks perfect French.|Born|Bearing;Been born;To born|PART_
5|The house, ______ in 1900, is still in good condition.|built|building;to build;having built|PART_
5|______ the door, he found the room empty.|Opening|Opened;To open;Open|PART_
5|Strange as it ______ seem, he won.|may|will;does;is|concession
5|Hard as she ______, she could not move the box.|tried|tries;will try;is trying|concession
5|Much as I ______ to stay, I must leave.|would like|like;am liking;liked|concession
5|However hard the task ______, we will finish it.|is|will be;was being;were|concession
5|Whoever ______ the competition will get a prize.|wins|will win;won;is winning|LESS_
5|Whatever you ______, do not be late.|do|will do;did;are doing|LESS_
5|Wherever he ______, he makes friends.|goes|will go;went;is going|LESS_
5|Try as they ______, they could not solve the puzzle.|might|will;do;shall|concession
5|The quicker we start, ______ we will finish.|the sooner|sooner;the soon;more soon|comp
5|The more she read, the ______ she understood.|more|most;much;many|comp
5|There is no ______ in complaining; nothing will change.|point|reason to;need to;use at|nopoint
5|He is certain ______ win the competition.|to|for;of to;at|nopoint
6|Little ______ she suspect that her friend was lying.|did|does;was;had|NEG
6|Not for one moment ______ he doubt her honesty.|did|does;was;had been|NEG
6|Scarcely ______ the meeting begun when the fire alarm rang.|had|did;was;has|hardly
6|On no condition ______ the report be shown to the press.|may|does;is;do|NEG
6|Seldom ______ such courage been seen.|has|have;did;is|NEG
6|Never before ______ so many people attended the festival.|had|have;did;was|NEG
6|Only after years of research ______ the cause identified.|was|is;did;were being|NEG
6|Not until the lights went out ______ the noise begin.|did|does;was;had|NEG
6|So fierce ______ the storm that the ferry service was suspended.|was|is;did;were|sosuch
6|Such ______ the demand that the tickets sold out in an hour.|was|were;did;is being|sosuch
6|Were it ______ for the volunteers, the event would have collapsed.|not|no;never;none|condinv
6|Had it not ______ for the timely warning, many lives would have been lost.|been|being;be;was|condinv
6|Should the weather ______ bad, the match will be postponed.|turn|turns;turned;will turn|condinv
6|It is imperative that the document ______ signed today.|be|is;was;will be|subjunctive
6|The jury recommended that he ______ released.|be|is;was;will be|subjunctive
6|He acted as though nothing ______ happened.|had|has;have;would have|asthough
6|She spoke as if she ______ the whole story.|knew|knows;has known;would know|asthough
6|Be it ever ______ humble, there is no place like home.|so|as;such;that|fixedform
6|______ it as it may, we must continue.|Be|Is;Was;Let|fixedform
6|Far be ______ me to criticise, but the plan has flaws.|it from|it for;this from;that to|fixedform
6|Come ______ may, I will stand by you.|what|how;if;who|fixedform
6|______ as it may, the facts remain unchanged.|Be that|Is that;Was that;Let that|fixedform
6|The fact ______ he was tired did not excuse his rudeness.|that|what;which;whom|cleft
6|It is her kindness ______ I will remember most.|that|which what;who;whose|cleft
6|The book ______ cover was torn belonged to my aunt.|whose|who;which;whom|cleft
6|He was the only person ______ I could trust.|whom|who of;which;whose|cleft
6|The results, ______ were published yesterday, surprised everyone.|which|what;whom;who|cleft
6|We were told to wait, ______ we did for two hours.|which|what;whom;who|cleft
6|The more complex the problem, ______ the solution.|the harder|hard;harder than;more hard|comp
6|Not only ______ the money, but he also lost his job.|did he lose|he lost;he did lose;lost he|NEG
6|Under no circumstances ______ we accept such terms.|will|do;are;did|NEG
6|Nor ______ I intend to apologise.|do|am;have;did|NEG
6|Neither ______ the manager nor his assistant knew the answer.|did|has;was;were|NEG
6|______ was the confusion that nobody knew what to do.|Such|So;Very;Too|sosuch
6|Barely ______ he arrived when the meeting started.|had|did;was;has|hardly
6|By no means ______ the problem solved.|is|are;does;was being|NEG
6|Rarely ______ one find such honesty.|does|did;do;has|NEG
6|Little did we expect ______ the result would be.|what|that;which;how of|cleft
6|Had I ______ about the traffic, I would have left earlier.|known|know;knew;been known|condinv
6|Should you ______ any difficulty, contact the helpdesk.|experience|experiences;experienced;experiencing|condinv
`).map((r) => (r[4] === 'LESS_' ? [r[0], r[1], r[2], r[3], ['whatever, wherever, whoever + глагол: «что / где / кто бы ни».', 'whatever, wherever, whoever + етістік: «не / қайда / кім болса да».']] : r[4] === 'PART_' ? [r[0], r[1], r[2], r[3], ['причастный оборот: Having + причастие, -ing, -ed - в зависимости от смысла.', 'есімшелі айналым: Having + үшінші форма, -ing, -ed - мағынаға қарай.']] : r[4] === 'NEG' ? [r[0], r[1], r[2], r[3], 'inversion'] : r)),
};

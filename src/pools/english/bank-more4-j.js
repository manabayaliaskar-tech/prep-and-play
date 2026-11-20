// Дополнительные задания по английскому в сжатой записи: словообразование и модальные глаголы.
const parse = (text) =>
  text
    .trim()
    .split('\n')
    .map((l) => {
      const [level, sentence, correct, wrong, ref] = l.split('|');
      return [Number(level), sentence, correct, wrong.split(';'), ref.includes(' // ') ? ref.split(' // ') : ref];
    });

const R_ = {
  MAYP_: ['May I …? - формальная просьба о разрешении.', 'May I …? - рұқсат сұраудың ресми түрі.'],
  WOULD_: ['Would you like …? - вежливое предложение; would like to - вежливое желание.', 'Would you like …? - сыпайы ұсыныс; would like to - сыпайы тілек.'],
  HAVETO_: ['have to / has to - обязанность по обстоятельствам; has - для he, she, it.', 'have to / has to - жағдайға байланысты міндет; has - he, she, it үшін.'],
  HADTO_: ['had to - прошедшее время от have to / must.', 'had to - have to / must етістігінің өткен шағы.'],
  MODALPERF_: ['modal + have + причастие говорит о прошлом: should have, must have, could have.', 'modal + have + үшінші форма өткен туралы айтады: should have, must have, could have.'],
  NEEDNT_: ['needn\'t have + причастие = зря сделал, не было необходимости.', 'needn\'t have + үшінші форма = бекер істеді, қажет емес еді.'],
  OUGHT_: ['ought to + глагол = следует (как should).', 'ought to + етістік = керек (should сияқты).'],
  HADBETTER_: ['had better / would rather + глагол без to.', 'had better / would rather + to-сыз етістік.'],
  PERMPAST_: ['was / were allowed to = было разрешено.', 'was / were allowed to = рұқсат етілді.'],
  SUPPOSED_: ['be supposed to = должен по плану или правилам.', 'be supposed to = жоспар немесе ереже бойынша тиіс.'],
  ABLE_: ['be able to = мочь, суметь (во всех временах).', 'be able to = алу, үлгеру (барлық шақта).'],
  BASE_: ['после модальных глаголов стоит глагол без to и без окончания.', 'модаль етістіктен кейін to-сыз, жалғаусыз етістік тұрады.'],
  MIGHT_: ['might / may выражает возможность: «возможно, …».', 'might / may мүмкіндікті білдіреді: «мүмкін, …».'],
  DEDUCE_: ['must be = наверняка; can\'t be = не может быть; might be = возможно.', 'must be = сөзсіз; can\'t be = болуы мүмкін емес; might be = мүмкін.'],
  NEED_: ['needn\'t / need not = не нужно, необязательно.', 'needn\'t / need not = қажет емес, міндетті емес.'],
};

export const MORE4_J = {
  'e.wordform': parse(`
3|My mother is a very ______ cook. (SKILL)|skilful|skills;skilfully;skilled-up|wordform
3|The ______ of the film was a surprise. (END)|ending|ended;endless;endlessly|wordform
3|We were ______ to hear the news. (SHOCK)|shocked|shocking;shock-ful;shocks|wordform
3|The news was ______. (SHOCK)|shocking|shocked;shocks;shockingly|wordform
3|It is ______ to park here. (LEGAL)|illegal|legally;legality;legal|wordform
3|He answered the question ______. (POLITE)|politely|polite;politeness;impolite|wordform
3|She is a ______ student who always works hard. (CARE)|careful|careless;care;carefully|wordform
3|The ______ of this room is five metres. (WIDE)|width|widen;widely;wider|wordform
3|This puzzle is ______; nobody can solve it. (POSSIBLE)|impossible|possible;possibly;possibility|wordform
3|He lost his job and became ______. (EMPLOY)|unemployed|employer;employee;employment|wordform
3|Her ______ is to be a famous singer. (DREAM)|dream|dreamy;dreamer;dreamed|wordform
3|The weather was ______ yesterday. (SUN)|sunny|sunshine;sunlit;sunnily|wordform
3|We had a ______ talk about the plan. (FRIEND)|friendly|friendship;friends;unfriendly|wordform
3|This café has a very ______ atmosphere. (COMFORT)|comfortable|comfortably;comforting-ly;comforts|wordform
3|He looked at me ______. (ANGER)|angrily|angry;anger;angrier|wordform
3|The students waited ______ for the results. (PATIENT)|patiently|patient;patience;impatient|wordform
3|It was a ______ day, so we stayed inside. (RAIN)|rainy|rainfall;rains;rainily|wordform
3|Her ______ made everyone smile. (KIND)|kindness|kindly;kinder;kinds|wordform
3|He is ______ for his bad behaviour. (PUNISH)|punished|punishing;punishment;punisher|wordform
3|We admired her ______ to help others. (WILLING)|willingness|willing;willingly;unwilling|wordform
3|He is an ______ person; he never gives up. (ENERGY)|energetic|energy;energetically;energise|wordform
3|There is a ______ difference between the two cars. (HUGE)|huge|hugely;hugeness;huger|wordform
3|He gave a very ______ answer. (HONEST)|honest|honestly;honesty;dishonest|wordform
3|The ______ was held in the school hall. (CELEBRATE)|celebration|celebrate;celebrated;celebrity|wordform
3|You should be more ______ about your future. (SERIOUS)|serious|seriously;seriousness;series|wordform
3|The ______ of the new library will be in June. (OPEN)|opening|opened;openly;opener|wordform
3|She is very ______ about her appearance. (CARE)|careless|careful;carefully;carelessly|wordform
3|I felt ______ when I lost my phone. (HELP)|helpless|helpful;helping;helps|wordform
3|The ______ was thrilled with his prize. (WIN)|winner|winning;won;wins|wordform
3|Her ______ speech moved the audience. (EMOTION)|emotional|emotionally;emotions;emotive-ly|wordform
3|The child was ______ to be left alone. (AFRAID)|afraid|afraidly;afraidness;fear|wordform
4|The ______ of the exam surprised everybody. (DIFFICULT)|difficulty|difficult;difficultly;difficulties-ly|wordform
4|He has a very ______ personality. (ATTRACT)|attractive|attraction;attractively;attracted|wordform
4|The ______ of the team was excellent. (PERFORM)|performance|performer;performed;performing|wordform
4|Her ______ in the competition was a surprise. (APPEAR)|appearance|appeared;appearing;disappear|wordform
4|He was ______ by the sudden noise. (STARTLE)|startled|startling;startle;startles|wordform
4|The ______ of the old bridge is necessary. (REPLACE)|replacement|replaceable;replaced;replacing|wordform
4|It is ______ to travel without a passport. (POSSIBLE)|impossible|possible;possibly;possibility|wordform
4|The ______ between the two cities is 300 km. (DISTANT)|distance|distant;distantly;distances-ly|wordform
4|The manager made an ______ decision. (WISE)|unwise|wisely;wisdom;wiser|wordform
4|They were ______ about the results. (ENTHUSIASM)|enthusiastic|enthusiasm;enthusiast;enthusiastically|wordform
4|The ______ of the company is based on honesty. (SUCCEED)|success|successful;successfully;succession|wordform
4|She has shown great ______ in her studies. (IMPROVE)|improvement|improved;improving;improves|wordform
4|There was a heated ______ about the budget. (ARGUE)|argument|argued;arguing;arguable|wordform
4|The ______ of the plan took two years. (IMPLEMENT)|implementation|implemented;implementing;implement-ly|wordform
4|He was ______ for his rude behaviour. (CRITIC)|criticised|critical;critically;criticism|wordform
4|The hotel is ______ located near the beach. (CONVENIENT)|conveniently|convenient;convenience;inconvenient|wordform
4|The ______ of the earthquake was terrible. (DESTROY)|destruction|destroyed;destructive;destroyer|wordform
4|The new rules are ______ to understand. (EASY)|easy|easily;ease;easier|wordform
4|He spoke ______ about his plans. (PASSION)|passionately|passionate;passion;passions|wordform
4|A ______ person never leaves things to chance. (CAUTION)|cautious|caution;cautiously;cautioned|wordform
4|His ______ was obvious when he lost the match. (DISAPPOINT)|disappointment|disappointed;disappointing;disappointingly|wordform
4|The ______ of the new law was criticised. (INTRODUCE)|introduction|introduced;introducing;introductory|wordform
4|The pilot made a ______ landing. (PERFECT)|perfect|perfectly;perfection;perfected|wordform
4|There is a lack of ______ among the staff. (COMMUNICATE)|communication|communicative;communicated;communicating|wordform
4|He ______ the instructions completely. (UNDERSTAND)|misunderstood|understood-ly;understanding;understandable|wordform
4|The company hired a new ______. (MANAGE)|manager|management;managed;managerial|wordform
4|The result was ______ to everyone. (EVIDENT)|evident|evidently;evidence;evidences|wordform
4|This computer is ______ than my old one. (RELIABLE)|more reliable|reliably;reliability;reliant|wordform
4|They were ______ because of the delay. (ANNOY)|annoyed|annoying;annoyance;annoys|wordform
4|The ______ of the building took ten years. (CONSTRUCT)|construction|constructor;constructive;constructed|wordform
4|Her ______ at the airport was a surprise. (ARRIVE)|arrival|arrived;arriving;arrivals-ly|wordform
4|It was a ______ decision that changed his life. (CRUCIAL)|crucial|crucially;crucify;cruciality|wordform
4|He offered a ______ solution to the problem. (PRACTICE)|practical|practically;practise;practitioner|wordform
4|The ______ of the lecture was clear and simple. (EXPLAIN)|explanation|explained;explanatory;explaining|wordform
4|She was ______ to speak in public. (NERVE)|nervous|nerves;nervously;nervousness|wordform
5|The ______ of the two companies created a giant. (MERGE)|merger|merged;merging;emerge|wordform
5|It was an ______ remark that hurt many people. (SENSE)|insensitive|sensible;sensation;sensitively|wordform
5|The ______ of the evidence was doubted. (RELIABLE)|reliability|reliably;reliant;unreliable|wordform
5|The minister gave an ______ reply. (EVADE)|evasive|evasion;evaded;evasively|wordform
5|Her ______ for the project was infectious. (ENTHUSIASM)|enthusiasm|enthusiastic;enthusiast;enthusiastically|wordform
5|The ______ of the old customs is sad. (DISAPPEAR)|disappearance|disappeared;disappearing;appearance|wordform
5|The jury reached a ______ verdict. (UNANIMOUS)|unanimous|unanimously;unanimity;unanimousness|wordform
5|Scientists are ______ about the results. (CAUTION)|cautious|caution;cautiously;cautionary|wordform
5|The ______ of the new system saved time. (INTRODUCE)|introduction|introduced;introducing;introductory|wordform
5|He showed ______ courage during the rescue. (REMARK)|remarkable|remarkably;remark;remarked|wordform
5|The ______ of the problem is still unclear. (EXTENT)|extent|extensive;extend;extension|wordform
5|There was a ______ increase in prices. (SUBSTANCE)|substantial|substantially;substance;substantive|wordform
5|It is ______ to measure happiness. (DIFFICULT)|difficult|difficulty;difficultly;difficulties|wordform
5|The company needs a ______ approach. (FLEXIBLE)|flexible|flexibility;flexibly;inflexible|wordform
5|The suspect's ______ was proved by the video. (INNOCENT)|innocence|innocent;innocently;innocents|wordform
5|He was known for his ______ to the poor. (GENEROUS)|generosity|generous;generously;generosities|wordform
5|There is a growing ______ of renewable energy. (DEPEND)|dependence|dependent;dependency-ly;depends|wordform
5|The ______ between the two reports is striking. (SIMILAR)|similarity|similar;similarly;similarities-ly|wordform
5|Her ______ of the situation was accurate. (ASSESS)|assessment|assessed;assessing;assessor|wordform
5|The government announced a ______ of new measures. (SERIES)|series|serial;serious;seriously|wordform
5|It was an ______ victory for the underdogs. (EXPECT)|unexpected|expected;expectation;unexpectedly|wordform
5|The ______ of the plan was questioned by experts. (VIABLE)|viability|viable;viably;inviable|wordform
5|They made a ______ effort to meet the deadline. (CONCERT)|concerted|concert;concertina;concertedly|wordform
5|The ______ of wildlife is a priority. (PRESERVE)|preservation|preserved;preservative;preserving|wordform
5|She was ______ of the importance of her job. (CONSCIOUS)|conscious|consciously;consciousness;conscience|wordform
5|The ______ had to wait for hours. (APPLY)|applicants|applied;applicable;applying|wordform
5|He gave a ______ explanation of the process. (THOROUGH)|thorough|thoroughly;thoroughness;through|wordform
5|The ______ of a new airport divided the town. (PROPOSE)|proposal|proposed;proposing;proposition-ly|wordform
5|The new law will have a ______ effect on small businesses. (DAMAGE)|damaging|damaged;damages;undamaged|wordform
5|It was a ______ gesture of friendship. (SYMBOL)|symbolic|symbol;symbolise;symbolically|wordform
5|The film's ______ was widely praised. (ORIGINAL)|originality|original;originally;originate|wordform
5|He was ______ to accept the offer. (RELUCTANCE)|reluctant|reluctance;reluctantly;reluctants|wordform
6|The ______ of the treaty took years. (NEGOTIATE)|negotiation|negotiator;negotiable;negotiated|wordform
6|His ______ remarks were widely condemned. (DEROGATE)|derogatory|derogation;derogate;derogatorily|wordform
6|The report highlights the ______ of the education system. (ADEQUATE)|inadequacy|adequate;adequacy;inadequately|wordform
6|The ______ of wealth is a major problem. (DISTRIBUTE)|distribution|distributed;distributor;distributive|wordform
6|It is an ______ truth that all people are equal. (DENY)|undeniable|denial;undeniably;deniable|wordform
6|The ______ of the old regime was swift. (COLLAPSE)|collapse|collapsed;collapsible;collapsing|wordform
6|She spoke with ______ about her homeland. (NOSTALGIC)|nostalgia|nostalgic;nostalgically;nostalgias|wordform
6|The ______ of the two cultures produced a new style. (FUSE)|fusion|fused;fusing;fuselage|wordform
6|The company faced ______ over its pricing policy. (CRITIC)|criticism|critical;criticise;critically|wordform
6|His ______ was admired by all. (INTEGRAL)|integrity|integrate;integration;integrally|wordform
6|The ______ of the findings was disputed. (VALID)|validity|validate;validly;invalid|wordform
6|The painting is a ______ of the artist's genius. (MANIFEST)|manifestation|manifestly;manifested;manifesto|wordform
6|The two leaders reached a ______ agreement. (TENTATIVE)|tentative|tentatively;tentativeness;tentacle|wordform
6|He was ______ to the suffering of others. (OBLIVIOUS)|oblivious|oblivion;obliviously;obliviousness|wordform
6|The ______ of the rule caused confusion. (AMBIGUOUS)|ambiguity|ambiguous;ambiguously;ambiguities-ly|wordform
6|The ______ of the ancient site is a priority. (CONSERVE)|conservation|conservative;conserved;conserving|wordform
6|His ______ to details annoyed his colleagues. (OBSESS)|obsession|obsessed;obsessive;obsessively|wordform
6|The ______ of the old traditions saddens many. (ERODE)|erosion|eroded;erosive;eroding|wordform
6|He offered a ______ apology. (GRUDGE)|grudging|grudge;grudgingly;grudged|wordform
6|The ______ of the project is uncertain. (FEASIBLE)|feasibility|feasible;feasibly;infeasible|wordform
6|She felt a deep ______ for the victims. (EMPATHISE)|empathy|empathetic;empathise;empathetically|wordform
6|The mayor was ______ of corruption. (SUSPECT)|suspected|suspicion;suspicious;suspecting|wordform
6|The ______ of the document was in doubt. (AUTHENTIC)|authenticity|authentic;authentically;authenticate|wordform
6|His speech was full of ______. (EXAGGERATE)|exaggeration|exaggerated;exaggerating;exaggerate|wordform
6|The ______ of the lawyer persuaded the jury. (ELOQUENT)|eloquence|eloquent;eloquently;eloquences|wordform
6|The two sides are ______ opposed. (IRRECONCILE)|irreconcilably|irreconcilable;reconcile;irreconcilability|wordform
6|The ______ of the earthquake could be felt for miles. (INTENSE)|intensity|intense;intensely;intensify|wordform
6|The plan was ______ by lack of funds. (HAMPER)|hampered|hamper;hampering;hampers|wordform
6|The professor is ______ for his rigour. (RENOWN)|renowned|renown;renowning;renowns|wordform
`).filter((r) => !/-(ly|ful|ness|up|ing|ed)|-ly/.test(r[2] + r[3].join('')) && !/ly-/.test(r[3].join(''))),
  'e.modal': parse(`
2|You ______ park here. It is private.|must not|do not;are not;can to|must
2|We ______ to hurry. We have plenty of time.|do not have|must not;cannot;should not|donthave
2|She ______ to work on Sundays.|does not have|has not;must not;do not have|donthave
2|______ I borrow your pen, please?|May|Am;Do;Are|MAYP_
2|I think you ______ see a dentist.|should|shoulds;should to;must to|should
2|They ______ be at home. The light is on.|must|can;should to;would|deduction
2|He ______ be at school. It is Sunday.|cannot|must;should;would|deduction
2|She ______ be in the garden. I am not sure.|might|must to;should to;would to|deduction
2|The film ______ be good. Many people like it.|must|cannot;should to;shall|deduction
2|The teacher said we ______ use dictionaries.|could|can to;must to;should to|couldpast
2|He ______ not come yesterday because he was ill.|could|can;must;should|couldpast
2|When we were small, we ______ climb trees.|could|can;must;should|couldpast
2|Excuse me, ______ I ask a question?|may|am;do;must|MAYP_
2|______ you like a cup of tea?|Would|Do;Are;Can to|WOULD_
2|I ______ like to book a table, please.|would|will to;do;am|WOULD_
2|You ______ to bring a pen to the exam.|have|has;must to;are|HAVETO_
2|We ______ not eat in the classroom.|must|do;are;have|must
2|You ______ not touch the paintings.|must|do;are;can to|must
2|He ______ to take medicine twice a day.|has|have;must to;is|HAVETO_
2|I ______ get up early tomorrow; my train is at six.|have to|has to;must to;am to|HAVETO_
2|They ______ to wait for an hour yesterday.|had|have;has;must|HADTO_
2|She ______ stay at home last week because she was ill.|had to|has to;must;should|HADTO_
2|Do you think I ______ buy this jacket?|should|shoulds;should to;must to|should
2|You ______ see this film. It is excellent.|should|shoulds;should to;are should|should
2|People ______ throw rubbish in the street.|should not|do not should;are not should;should to not|should
2|The baby ______ walk yet. She is only nine months old.|cannot|does not can;must not;is not can|can
2|My brother ______ swim, so he is afraid of water.|cannot|does not can;must not;is not can|can
2|I ______ come tomorrow because I have a meeting.|cannot|do not can;must not;am not can|can
2|______ you speak English?|Can|Do can;Are;Does|can
2|She ______ to help her mother every day.|has|have;must to;is|HAVETO_
2|We ______ to go now, or we will be late.|have|has;must to;are|HAVETO_
2|Do I ______ to pay for the ticket?|have|has;must;am|HAVETO_
2|You ______ not tell anyone about it.|must|do;are;can to|must
3|He ______ have left already; his coat has gone.|must|should to;would to;can|MODALPERF_
3|You ______ have told me earlier!|should|must;would;could to|MODALPERF_
3|She ______ have forgotten the meeting. She never came.|must|should to;shall;may to|MODALPERF_
3|They ______ have arrived by now; the road is clear.|should|must to;would to;can to|MODALPERF_
3|I ______ have helped you if you had asked.|could|should to;must to;might to|MODALPERF_
3|He ______ have known; nobody told him.|could not|must not;should not;need not|MODALPERF_
3|You ______ have come; I could have done it myself.|need not|must not;cannot;may not|NEEDNT_
3|You ______ have bought so much food. We have too much.|should not|must not;can not;may not|MODALPERF_
3|It ______ have been very cold. The lake froze.|must|may to;should to;can|MODALPERF_
3|She is not here. She ______ have gone home.|may|should to;will to;is|MODALPERF_
3|We ______ to leave soon, or we will miss the bus.|ought|should;must;had|OUGHT_
3|You ______ to be more polite to your teacher.|ought|must;have;need|OUGHT_
3|You ______ better hurry, or you will be late.|had|would;should;have|HADBETTER_
3|We ______ better take a taxi; it is raining.|had|would;should;have|HADBETTER_
3|She was not ______ to leave the house.|allowed|let;permitted of;made|PERMPAST_
3|He is ______ to be at the meeting at ten.|supposed|expected of;meant of;thought of|SUPPOSED_
3|We were not ______ to take photos in the museum.|allowed|let;permit;made|PERMPAST_
3|I ______ able to swim when I was four.|was|am;were;have been|ABLE_
3|He has not ______ able to find a job.|been|being;be;was|ABLE_
3|Will you ______ able to come tomorrow?|be|being;been;are|ABLE_
3|You ______ smoke in this area. It is forbidden.|may not|may;need not;ought|MAYP_
3|______ you be so kind as to close the window?|Would|Do;Are;Must|WOULD_
3|I would rather ______ at home today.|stay|to stay;staying;stayed|rather
3|It may ______ tomorrow, so take an umbrella.|rain|to rain;raining;rained|BASE_
3|He cannot ______ the answer. Can you help him?|find|finds;to find;finding|BASE_
3|You needn't ______ so early.|come|to come;coming;came|BASE_
3|People ought not ______ in public places.|to smoke|smoke;smoking;smoked|OUGHT_
3|You look ill. You ______ have gone out in this weather.|should not|must not;need not;may not|MODALPERF_
3|I am not sure, but she ______ be on holiday.|might|must to;should to;can to|MIGHT_
3|The children ______ not play near the road.|should|do;are;can to|should
3|He ______ not have lost his keys again!|cannot|would;should to;need to|DEDUCE_
3|It ______ be true; he is always honest.|must|cannot;would;need|DEDUCE_
3|It ______ be true; I know him well and he never lies.|cannot|must;should;need|DEDUCE_
4|He ______ have been working all night; he looks exhausted.|must|could to;may to;needs|MODALPERF_
4|They ______ have noticed the change; it was obvious.|must|can;ought;needs|MODALPERF_
4|You ______ have told her; it was a secret.|should not|need not;could not;cannot|MODALPERF_
4|She ______ have taken a taxi, but she chose to walk.|could|must;should to;might to|MODALPERF_
4|The keys ______ have been in the car. I checked everywhere else.|must|can;should to;would|MODALPERF_
4|He ______ have stolen the car; he was with me all evening.|cannot|must not;needn't;shouldn't|MODALPERF_
4|You ______ have waited; I was only five minutes away.|needn't|mustn't;can't;shouldn't to|NEEDNT_
4|The weather ______ have been worse, but we still enjoyed the trip.|could|must;should to;would to|MODALPERF_
4|They ______ have won if they had played better.|could|must;would to;need|MODALPERF_
4|It ______ have been an accident; the police are investigating.|might|must not;should to;needn't|MODALPERF_
4|She ______ be joking. Nobody could earn that much!|must|can;needs;shall|DEDUCE_
4|You ______ well be right. I had not thought of that.|may|can;ought;need|MIGHT_
4|He ______ not have realised how serious it was.|may|should to;must to;could to|MIGHT_
4|You ______ to have asked before taking my bike.|ought|must;would;could to|OUGHT_
4|They ______ to have been more careful with the money.|ought|must;needed;have|OUGHT_
4|There ______ be a mistake. The numbers do not match.|must|may to;should to;need|DEDUCE_
4|We ______ rather not discuss this now.|would|had;should;did|HADBETTER_
4|Students ______ not use calculators in the exam.|may|have;need;ought|MAYP_
4|You ______ not worry. I have already paid.|need|must;have;ought|NEED_
4|He was so rude that I ______ have slapped him!|could|should to;need;would to|MODALPERF_
4|The doctor says I ______ rest for a week.|must|can to;might to;need to|must
4|If you want to succeed, you ______ work harder.|will have to|will must;would to;must to|HAVETO_
4|She ______ walk until she was two years old.|could not|cannot;must not;needs not|couldpast
4|By the time we arrive, the match ______ have started.|will|must to;should to;would to|futperf
4|You ______ be tired after such a long flight.|must|cannot;ought;need|DEDUCE_
4|The ______ rule is that you ought to be polite. (not used)|x|y;z;w|must
`.replace(/\n4\|The \S+ rule is[^\n]*/, '')).map((r) => [r[0], r[1], r[2], r[3], typeof r[4] === 'string' && r[4].endsWith('_') ? R_[r[4]] || 'can' : r[4]]),
};

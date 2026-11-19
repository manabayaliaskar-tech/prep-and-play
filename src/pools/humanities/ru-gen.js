// Русский язык: ударения (орфоэпический минимум ЕГЭ) и словарные слова.
// Обществознание: термины и определения. Ключ сложности - 1…3.
// Задания по русскому языку показываются по-русски при любом языке интерфейса - как на экзамене.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { R } from '../bank.js';

const rows = (text) => text.trim().split('\n').map((line) => line.split('|'));

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

// ---------- Ударения: сложность|верно|неверно (ударная гласная - заглавная) ----------
const STRESS = rows(`
1|звонИт|звОнит
1|тОрты|тортЫ
1|бАнты|бантЫ
1|шАрфы|шарфЫ
1|крАны|кранЫ
1|щавЕль|щАвель
1|свЁкла|свеклА
1|красИвее|красивЕе
1|кУхонный|кухОнный
1|договОр|дОговор
1|каталОг|катАлог
1|жалюзИ|жАлюзи
1|аэропОрты|аэропортЫ
1|шофЁр|шОфер
2|квартАл|квАртал
2|крапИва|крАпива
2|баловАть|бАловать
2|облегчИт|облЕгчит
2|включИт|вклЮчит
2|вручИт|врУчит
2|нАчал|начАл
2|понЯв|пОняв
2|оптОвый|Оптовый
2|сливОвый|слИвовый
2|ворОта|вОрота
2|бухгАлтеров|бухгалтерОв
2|Иксы|иксЫ
2|лыжнЯ|лЫжня
2|корЫсть|кОрысть
2|досУг|дОсуг
3|мЕстностей|местнОстей
3|дОнельзя|донЕльзя
3|зАгодя|загОдя
3|Издавна|издАвна
3|навЕрх|нАверх
3|кремЕнь|крЕмень
3|экспЕрт|Эксперт
3|закУпорить|закупОрить
3|кровоточАщий|кровотОчащий
3|диспансЕр|диспАнсер
3|кОнусы|конУсы
3|балОванный|бАлованный
3|углубИть|углУбить
3|ходАтайство|ходатАйство
3|цепОчка|цЕпочка
3|кормЯщий|кОрмящий
3|довезЁнный|довЕзенный
3|исчЕрпать|исчерпАть
`).map(([d, ok, bad]) => ({ d: Number(d), ok, bad }));

const plainWord = (w) => w.toLowerCase();

function stressTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = STRESS.filter((w) => w.d <= d);
  const right = pick(rng, d === 1 ? pool : pool.filter((w) => w.d >= d - 1));
  const others = shuffle(pool.filter((w) => w !== right), rng).slice(0, 3);
  const wrongFirst = rng() < 0.5;
  // Два вида: «где ударение верно» (одно верное) и «где ошибка» (одно неверное).
  const correct = wrongFirst ? right.bad : right.ok;
  const wrong = others.map((w) => (wrongFirst ? w.ok : w.bad));
  const list = [right, ...others].map((w) => w.ok).join(', ');
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: wrongFirst
      ? R('В каком слове НЕВЕРНО выделена буква, обозначающая ударный гласный звук?')
      : R('В каком слове ВЕРНО выделена буква, обозначающая ударный гласный звук?'),
    ex: R(`Правильно: ${list}. Ударение в слове «${plainWord(right.ok)}»: ${right.ok}.`),
    mc: mcOf(rng, correct, wrong),
  });
  q.id = `${topic}:st:${wrongFirst ? 'w' : 'r'}:${hashString([right, ...others].map((w) => w.ok).sort().join())}`;
  return q;
}

// ---------- Словарные слова: сложность|верно|с ошибкой ----------
const SPELLING = rows(`
1|пожалуйста|пожалуста
1|здравствуйте|здраствуйте
1|праздник|празник
1|лестница|лесница
1|чувствовать|чуствовать
1|вкусный|вкустный
1|опасный|опастный
1|велосипед|виласипед
1|компьютер|компютер
1|шоколад|шиколад
1|горизонт|гаризонт
1|парашют|парашут
1|брошюра|брошура
1|жюри|жури
2|агентство|агенство
2|интеллигенция|интелигенция
2|иллюминация|илюминация
2|ветеринар|ветиринар
2|привилегия|привелегия
2|аплодировать|апплодировать
2|колоссальный|колосальный
2|профессиональный|професиональный
2|коммуникация|комуникация
2|терраса|тераса
2|расчёт|рассчёт
2|чрезвычайный|черезвычайный
2|эскалатор|экскалатор
2|сверстник|сверсник
2|объяснять|обьяснять
2|грамматика|граматика
3|беспрецедентный|беспрецендентный
3|винегрет|венегрет
3|дилетант|дилентант
3|компетентный|компетенный
3|бюллетень|бюлетень
3|металлический|металический
3|эпидемия|эпидимия
3|оранжерея|аранжерея
3|режиссёр|рижиссёр
3|дискуссия|дискусия
3|эффективный|эфективный
3|иероглиф|еироглиф
3|юбилей|юбелей
3|ассоциация|асоциация
`).map(([d, ok, bad]) => ({ d: Number(d), ok, bad }));

function spellingTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = SPELLING.filter((w) => w.d <= d);
  const right = pick(rng, d === 1 ? pool : pool.filter((w) => w.d >= d - 1));
  const others = shuffle(pool.filter((w) => w !== right), rng).slice(0, 3);
  const findError = rng() < 0.5;
  const correct = findError ? right.bad : right.ok;
  const wrong = others.map((w) => (findError ? w.ok : w.bad));
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: findError ? R('В каком слове допущена орфографическая ошибка?') : R('Какое слово написано правильно?'),
    ex: R(`Правильное написание: ${[right, ...others].map((w) => w.ok).join(', ')}. Словарные слова нужно запомнить.`),
    mc: mcOf(rng, correct, wrong),
  });
  q.id = `${topic}:sp:${findError ? 'e' : 'r'}:${hashString([right, ...others].map((w) => w.ok).sort().join())}`;
  return q;
}

export function russianMaker(topic) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const q = ctx.rng() < 0.5 ? stressTask(ctx, topic, d) : spellingTask(ctx, topic, d);
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return stressTask(ctx, topic, d);
  };
}

// ---------- Обществознание: сложность|термин en|ru|kk|определение en|ru|kk ----------
const TERMS = rows(`
1|state|государство|мемлекет|an organisation of political power over a whole country|организация политической власти на территории всей страны|бүкіл ел аумағындағы саяси билік ұйымы
1|constitution|конституция|конституция|the basic law of a country with the highest legal force|основной закон страны, обладающий высшей юридической силой|ең жоғары заңдық күші бар елдің негізгі заңы
1|republic|республика|республика|a form of government where the highest bodies of power are elected|форма правления, при которой высшие органы власти избираются|жоғары билік органдары сайланатын басқару нысаны
1|monarchy|монархия|монархия|a form of government where power belongs to one ruler and is usually inherited|форма правления, при которой власть принадлежит одному правителю и обычно передаётся по наследству|билік бір билеушіге тиесілі және әдетте мұраға қалатын басқару нысаны
1|tax|налог|салық|a compulsory payment of citizens and companies to the state|обязательный платёж граждан и организаций государству|азаматтар мен ұйымдардың мемлекетке төлейтін міндетті төлемі
1|budget|бюджет|бюджет|a plan of income and expenses for a period|план доходов и расходов на определённый срок|белгілі бір мерзімге арналған кіріс пен шығыс жоспары
1|citizenship|гражданство|азаматтық|a stable legal bond between a person and a state|устойчивая правовая связь человека с государством|адам мен мемлекет арасындағы тұрақты құқықтық байланыс
2|democracy|демократия|демократия|a political regime where the people are the source of power|политический режим, при котором источником власти является народ|биліктің қайнар көзі халық болатын саяси режим
2|federation|федерация|федерация|a state made of parts that have their own laws and bodies of power|государство из частей, у которых есть свои законы и органы власти|өз заңдары мен билік органдары бар бөліктерден тұратын мемлекет
2|referendum|референдум|референдум|a nationwide vote on the most important questions|всенародное голосование по важнейшим вопросам|ең маңызды мәселелер бойынша бүкілхалықтық дауыс беру
2|parliament|парламент|парламент|the highest representative and law-making body|высший представительный и законодательный орган|жоғары өкілді және заң шығарушы орган
2|inflation|инфляция|инфляция|a general rise in prices and a fall in the value of money|общий рост цен и обесценивание денег|бағаның жалпы өсуі және ақшаның құнсыздануы
2|demand|спрос|сұраныс|the amount of goods buyers want and can buy at a given price|количество товара, которое покупатели хотят и могут купить по данной цене|сатып алушылар белгілі бағамен алғысы келетін және ала алатын тауар мөлшері
2|supply|предложение (в экономике)|ұсыныс (экономикада)|the amount of goods sellers are ready to sell at a given price|количество товара, которое продавцы готовы продать по данной цене|сатушылар белгілі бағамен сатуға дайын тауар мөлшері
2|competition|конкуренция|бәсекелестік|rivalry between producers for buyers|соперничество производителей за покупателей|өндірушілердің сатып алушылар үшін бәсекесі
2|unemployment|безработица|жұмыссыздық|a situation where able-bodied people who want to work cannot find a job|ситуация, когда трудоспособные люди, желающие работать, не могут найти работу|жұмыс істегісі келетін еңбекке қабілетті адамдар жұмыс таба алмайтын жағдай
3|monopoly|монополия|монополия|a market where there is only one seller|рынок, на котором есть только один продавец|бір ғана сатушы бар нарық
3|GDP|ВВП|ЖІӨ|the total value of all final goods and services produced in a country in a year|стоимость всех конечных товаров и услуг, произведённых в стране за год|елде бір жылда өндірілген барлық соңғы тауарлар мен қызметтердің құны
3|sovereignty|суверенитет|егемендік|the independence of a state in its internal and external affairs|независимость государства во внутренних и внешних делах|мемлекеттің ішкі және сыртқы істердегі тәуелсіздігі
3|separation of powers|разделение властей|билікті бөлу|dividing power into legislative, executive and judicial branches|деление власти на законодательную, исполнительную и судебную|билікті заң шығарушы, атқарушы және сот тармақтарына бөлу
3|legal capacity|правоспособность|құқық қабілеттілігі|the ability to have rights and duties|способность иметь права и обязанности|құқықтар мен міндеттерге ие болу қабілеті
3|legal competence|дееспособность|әрекет қабілеттілігі|the ability to gain and exercise rights by one’s own actions|способность своими действиями приобретать и осуществлять права|өз әрекетімен құқықтарға ие болу және оларды жүзеге асыру қабілеті
3|socialisation|социализация|әлеуметтену|the process of learning the norms and values of society|процесс усвоения человеком норм и ценностей общества|адамның қоғам нормалары мен құндылықтарын игеру үдерісі
3|rule-of-law state|правовое государство|құқықтық мемлекет|a state in which the law is above everyone, including the authorities|государство, в котором закон выше всех, в том числе власти|заң бәрінен, соның ішінде биліктен де жоғары тұратын мемлекет
1|election|выборы|сайлау|choosing officials by voting|избрание должностных лиц голосованием|лауазымды тұлғаларды дауыс беру арқылы сайлау
1|law|закон|заң|a rule adopted by parliament that everyone must obey|правило, принятое парламентом и обязательное для всех|парламент қабылдаған, бәріне міндетті ереже
1|family|семья|отбасы|a small group of people linked by marriage or kinship|малая группа людей, связанных браком или родством|некемен не туыстықпен байланысқан адамдардың шағын тобы
1|salary|заработная плата|жалақы|payment for work|вознаграждение за труд|еңбек үшін төленетін ақы
1|price|цена|баға|the amount of money paid for a good|количество денег, которое платят за товар|тауар үшін төленетін ақша мөлшері
2|market|рынок|нарық|a place or system where buyers and sellers exchange goods|место или система обмена товаров между покупателями и продавцами|сатып алушылар мен сатушылар тауар алмасатын орын немесе жүйе
2|bank|банк|банк|an organisation that accepts deposits and gives loans|организация, которая принимает вклады и выдаёт кредиты|салым қабылдап, несие беретін ұйым
2|loan (credit)|кредит|несие|money lent that must be returned with interest|деньги в долг, которые нужно вернуть с процентами|пайызымен қайтару керек қарызға берілген ақша
2|culture|культура|мәдениет|everything people have created: values, art, knowledge, traditions|всё, что создано людьми: ценности, искусство, знания, традиции|адамдар жасаған бәрі: құндылықтар, өнер, білім, дәстүрлер
2|morality|мораль|мораль|the rules of good and bad behaviour accepted in society|принятые в обществе правила хорошего и плохого поведения|қоғамда қабылданған жақсы және жаман мінез-құлық ережелері
2|crime|преступление|қылмыс|a dangerous act forbidden by criminal law|опасное деяние, запрещённое уголовным законом|қылмыстық заңмен тыйым салынған қауіпті әрекет
2|court|суд|сот|a state body that settles disputes and decides cases by law|государственный орган, который разрешает споры и дела по закону|дауларды заң бойынша шешетін мемлекеттік орган
2|human rights|права человека|адам құқықтары|freedoms that belong to every person from birth|свободы, которые принадлежат каждому человеку от рождения|әр адамға туғаннан тиесілі бостандықтар
3|totalitarianism|тоталитаризм|тоталитаризм|a regime where the state controls every area of life|режим, при котором государство контролирует все сферы жизни|мемлекет өмірдің барлық салаларын бақылайтын режим
3|globalisation|глобализация|жаһандану|the growing interconnection of countries in economics, politics and culture|усиление взаимосвязи стран в экономике, политике и культуре|елдердің экономикада, саясатта және мәдениетте өзара байланысының күшеюі
3|civil society|гражданское общество|азаматтық қоғам|associations of citizens that are independent of the state|объединения граждан, независимые от государства|мемлекеттен тәуелсіз азаматтар бірлестіктері
3|deficit|дефицит бюджета|бюджет тапшылығы|a situation where state spending is greater than income|ситуация, когда расходы государства больше доходов|мемлекет шығысы кірісінен көп болатын жағдай
3|entrepreneurship|предпринимательство|кәсіпкерлік|independent activity aimed at making a profit at one’s own risk|самостоятельная деятельность ради прибыли на свой риск|өз тәуекелімен пайда табуға бағытталған дербес қызмет
3|social mobility|социальная мобильность|әлеуметтік ұтқырлық|a person’s movement from one social position to another|переход человека из одной социальной позиции в другую|адамның бір әлеуметтік жағдайдан басқасына өтуі
3|stock (share)|акция|акция|a security that gives its owner a share in a company|ценная бумага, дающая владельцу долю в компании|иесіне компаниядағы үлесті беретін бағалы қағаз
3|subculture|субкультура|субмәдениет|the culture of a group that differs from the dominant culture|культура группы, отличающаяся от господствующей|үстем мәдениеттен ерекшеленетін топтың мәдениеті
`).map(([d, en, ru, kk, den, dru, dkk]) => ({ d: Number(d), term: L(en, ru, kk), def: L(den, dru, dkk) }));

export function socialMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    for (let attempt = 0; attempt < 10; attempt++) {
      const pool = TERMS.filter((t) => t.d <= d);
      const t = pick(rng, d === 1 ? pool : pool.filter((x) => x.d >= d - 1));
      const wrong = shuffle(TERMS.filter((x) => x !== t), rng).slice(0, 3);
      const fwd = rng() < 0.5;
      const q = poolQ(topic, d, {
        kind: 'text',
        prompt: fwd
          ? L(`What is ${t.term.en}?`, `Что такое «${t.term.ru}»?`, `«${t.term.kk}» дегеніміз не?`)
          : L(`Which term means: ${t.def.en}?`, `Какой термин означает: ${t.def.ru}?`, `Қай термин мынаны білдіреді: ${t.def.kk}?`),
        ex: L(`${t.term.en} - ${t.def.en}.`, `${t.term.ru} - ${t.def.ru}.`, `${t.term.kk} - ${t.def.kk}.`),
        mc: fwd ? mcOf(rng, t.def, wrong.map((x) => x.def)) : mcOf(rng, t.term, wrong.map((x) => x.term)),
      });
      q.id = `${topic}:${fwd ? 'f' : 'b'}:${t.term.en}`;
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

// ---------- Обществознание: к какой ветви власти или сфере относится ----------

const BRANCHES = {
  leg: L('the legislative branch', 'законодательная власть', 'заң шығарушы билік'),
  exe: L('the executive branch', 'исполнительная власть', 'атқарушы билік'),
  jud: L('the judicial branch', 'судебная власть', 'сот билігі'),
};
const BODIES = rows(`
leg|parliament|парламент|парламент
leg|the Senate|Сенат|Сенат
leg|the Mazhilis|Мажилис|Мәжіліс
leg|the State Duma|Государственная дума|Мемлекеттік дума
exe|the government|правительство|үкімет
exe|a ministry|министерство|министрлік
exe|the prime minister|премьер-министр|премьер-министр
exe|a regional akimat (administration)|акимат (администрация региона)|әкімдік
jud|the Supreme Court|Верховный суд|Жоғарғы сот
jud|a district court|районный суд|аудандық сот
jud|the Constitutional Court|Конституционный суд|Конституциялық сот
jud|a court of appeal|апелляционный суд|апелляциялық сот
leg|the Federation Council|Совет Федерации|Федерация Кеңесі
exe|the tax service|налоговая служба|салық қызметі
`).map(([b, en, ru, kk]) => ({ b, name: L(en, ru, kk) }));

const SPHERES = {
  eco: L('economic', 'экономическая', 'экономикалық'),
  pol: L('political', 'политическая', 'саяси'),
  soc: L('social', 'социальная', 'әлеуметтік'),
  spi: L('spiritual (cultural)', 'духовная', 'рухани'),
};
const FACTS = rows(`
eco|a factory produces cars|завод выпускает автомобили|зауыт автомобиль шығарады
eco|a family takes out a bank loan|семья берёт кредит в банке|отбасы банктен несие алады
eco|a shop raises its prices|магазин повышает цены|дүкен бағаны көтереді
eco|a farmer sells grain at the market|фермер продаёт зерно на рынке|фермер нарықта астық сатады
pol|citizens vote in an election|граждане голосуют на выборах|азаматтар сайлауда дауыс береді
pol|parliament passes a law|парламент принимает закон|парламент заң қабылдайды
pol|two countries sign a peace treaty|две страны подписывают мирный договор|екі ел бейбітшілік шартына қол қояды
pol|a party presents its programme|партия представляет свою программу|партия өз бағдарламасын ұсынады
soc|a new school is opened for children|для детей открывают новую школу|балаларға жаңа мектеп ашылады
soc|the state pays pensions to the elderly|государство выплачивает пенсии пожилым|мемлекет қарттарға зейнетақы төлейді
soc|a young family receives housing support|молодая семья получает помощь с жильём|жас отбасы баспанаға көмек алады
spi|a theatre stages a new play|театр ставит новый спектакль|театр жаңа спектакль қояды
spi|scientists publish a discovery|учёные публикуют открытие|ғалымдар жаңалығын жариялайды
spi|a museum opens an exhibition|музей открывает выставку|мұражай көрме ашады
spi|a writer publishes a novel|писатель издаёт роман|жазушы роман шығарады
eco|a bank pays interest on deposits|банк начисляет проценты по вкладам|банк салымдар бойынша пайыз есептейді
pol|a deputy takes part in a parliament session|депутат участвует в заседании парламента|депутат парламент отырысына қатысады
soc|a clinic vaccinates children|поликлиника делает прививки детям|емхана балаларға екпе жасайды
`).map(([s2, en, ru, kk]) => ({ s: s2, fact: L(en, ru, kk) }));

export function powersMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    for (let attempt = 0; attempt < 10; attempt++) {
      let q;
      if (rng() < 0.5) {
        const body = pick(rng, BODIES);
        const wrong = Object.keys(BRANCHES).filter((k) => k !== body.b).map((k) => BRANCHES[k]);
        const extra = L('it is not a body of state power', 'это не орган государственной власти', 'бұл мемлекеттік билік органы емес');
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`Which branch of power does ${body.name.en} belong to?`, `К какой ветви власти относится ${body.name.ru}?`, `${body.name.kk} биліктің қай тармағына жатады?`),
          ex: L(`${body.name.en} - ${BRANCHES[body.b].en}.`, `${body.name.ru} - ${BRANCHES[body.b].ru}.`, `${body.name.kk} - ${BRANCHES[body.b].kk}.`),
          mc: mcOf(rng, BRANCHES[body.b], [...wrong, extra]),
        });
        q.id = `${topic}:b:${body.name.en}`;
      } else {
        const f = pick(rng, FACTS);
        const wrong = Object.keys(SPHERES).filter((k) => k !== f.s).map((k) => SPHERES[k]);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`Which sphere of society does this illustrate: ${f.fact.en}?`, `Какую сферу общества иллюстрирует пример: ${f.fact.ru}?`, `Мысал қоғамның қай саласын көрсетеді: ${f.fact.kk}?`),
          ex: L(`This is the ${SPHERES[f.s].en} sphere.`, `Это ${SPHERES[f.s].ru} сфера.`, `Бұл - ${SPHERES[f.s].kk} сала.`),
          mc: mcOf(rng, SPHERES[f.s], wrong),
        });
        q.id = `${topic}:s:${f.fact.en}`;
      }
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

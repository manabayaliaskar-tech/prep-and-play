// Дополнительные тексты для IELTS и TOEFL: длиннее прежних (350-450 слов), ближе к экзамену.
// Формат тот же, что в reading.js: tf(...) - True / False / Not Given, mc(...) - первый вариант правильный.

import { L } from './gen.js';

const tf = (statement, answer, ex) => ({ type: 'tfng', statement, answer, ex });
const mc = (question, choices, ex) => ({ type: 'mc', question, choices, ex });

export const IELTS_MORE = [
  {
    id: 'heat-island',
    title: 'Why Cities Are Warmer',
    text:
      'On a calm summer evening, the centre of a large city can be several degrees warmer than the fields just outside it. Scientists call this the urban heat island effect, and it was first described in the early nineteenth century by Luke Howard, an English chemist who compared temperature records from London with those from the surrounding countryside. Since then the effect has been measured in cities on every inhabited continent.\n\n' +
      'Several causes work together. Asphalt, concrete and dark roofs absorb a large share of the sunlight that falls on them and release the stored heat slowly after sunset. Tall buildings trap this warm air and block the wind that would otherwise carry it away. Cities also have far fewer trees and open patches of soil than the countryside. Plants cool their surroundings by releasing water vapour, a process that uses energy from the air; when vegetation is replaced by hard surfaces, this natural cooling disappears. Finally, cars, air conditioners and factories add heat of their own.\n\n' +
      'The consequences are more serious than mild discomfort. During heat waves, hospitals in hot cities record more cases of heat stroke, and older people and young children are at the greatest risk. Higher temperatures also raise the demand for air conditioning, which increases electricity use and, in many places, the emissions that warm the climate further. In this way the heat island can feed itself.\n\n' +
      'City planners now have a number of tools to fight back. Painting roofs white or covering them with light-coloured materials reflects sunlight instead of absorbing it. "Green roofs", planted with grass and small shrubs, cool buildings and also hold rainwater. Planting trees along streets provides shade, and some cities have created networks of parks so that cool air can flow between them. Researchers caution, however, that no single measure is enough: the best results come from combining several of them and planning new districts with the problem in mind from the start.',
    qs: [
      tf('Luke Howard compared temperatures in a city and in the countryside around it.', 0, L(
        'True: he "compared temperature records from London with those from the surrounding countryside".',
        'True: он «сравнил записи температуры в Лондоне и в окружающей сельской местности».',
        'True: ол «Лондон мен оның маңындағы ауылдық жерлердің температура жазбаларын салыстырған».',
      )),
      tf('The urban heat island effect has only been found in European cities.', 1, L(
        'False: it has been measured "in cities on every inhabited continent".',
        'False: эффект измерен «в городах на всех обитаемых континентах».',
        'False: әсер «адамдар тұратын барлық құрлықтардағы қалаларда» өлшенген.',
      )),
      tf('Dark surfaces release the heat they store mainly at night.', 0, L(
        'True: they "release the stored heat slowly after sunset".',
        'True: они «медленно отдают накопленное тепло после заката».',
        'True: олар «жиналған жылуды күн батқаннан кейін баяу шығарады».',
      )),
      tf('Green roofs are cheaper to build than white roofs.', 2, L(
        'Not Given: the text describes what both kinds of roof do, but says nothing about their cost.',
        'Not Given: в тексте описано, что дают оба вида крыш, но об их стоимости ничего не сказано.',
        'Not Given: мәтінде шатырдың екі түрінің пайдасы айтылған, бірақ бағасы туралы ештеңе жоқ.',
      )),
      mc('How do plants cool their surroundings, according to the passage?', [
        'By releasing water vapour, which uses energy from the air',
        'By reflecting sunlight back into the sky',
        'By blocking the wind between buildings',
        'By absorbing heat from asphalt',
      ], L(
        'The text says plants cool the air "by releasing water vapour, a process that uses energy from the air".',
        'В тексте сказано, что растения охлаждают воздух, «выделяя водяной пар - этот процесс забирает энергию у воздуха».',
        'Мәтін бойынша өсімдіктер «су буын шығару арқылы» салқындатады - бұл процесс ауадан энергия алады.',
      )),
      mc('What does the writer mean by "the heat island can feed itself"?', [
        'Heat increases air-conditioner use, which leads to even more warming.',
        'Cities grow bigger every year because people like warm weather.',
        'Hot cities produce more food than the countryside.',
        'The effect disappears without any help from planners.',
      ], L(
        'More heat → more air conditioning → more electricity and emissions → more warming. The effect strengthens itself.',
        'Больше жары → больше кондиционеров → больше электричества и выбросов → ещё сильнее нагрев. Эффект усиливает сам себя.',
        'Ыстық көбейеді → кондиционер көбірек қосылады → электр мен шығарындылар артады → тағы да жылынады. Әсер өзін-өзі күшейтеді.',
      )),
      mc('What do researchers recommend in the final paragraph?', [
        'Combining several measures and planning new districts carefully',
        'Painting every roof in the city white',
        'Moving hospitals out of city centres',
        'Banning air conditioners during heat waves',
      ], L(
        'They say "no single measure is enough" and the best results come from combining measures and planning ahead.',
        'Они говорят, что «одной меры недостаточно», а лучший результат даёт сочетание мер и продуманное планирование.',
        'Олар «бір шара жеткіліксіз» дейді: ең жақсы нәтижені бірнеше шараны біріктіру мен алдын ала жоспарлау береді.',
      )),
    ],
  },
  {
    id: 'memory',
    title: 'The Science of Remembering',
    text:
      'Most students prepare for exams in the same way: they read their notes again and again, often on the night before the test. It feels productive, because the material becomes more familiar with every reading. Yet psychologists have shown that familiarity is a poor guide to what we will actually remember a week later.\n\n' +
      'In the 1880s the German researcher Hermann Ebbinghaus tested his own memory by learning lists of meaningless syllables and checking how many he could recall after different intervals. He found that forgetting is fastest in the first hours and days after learning and then gradually slows down. This pattern, later called the forgetting curve, has been confirmed by many studies since.\n\n' +
      'Ebbinghaus also noticed that material reviewed several times, with gaps between the sessions, was retained much longer than material studied in one long session. Modern researchers call this the spacing effect. One explanation is that each review after a gap forces the brain to work harder to rebuild the memory, and this effort makes the memory stronger.\n\n' +
      'A second powerful technique is known as retrieval practice. Instead of rereading, the learner tries to recall the information without looking: by answering questions, writing down everything they remember or explaining the topic to a friend. In a number of experiments, students who tested themselves in this way remembered considerably more on a later exam than students who spent the same amount of time rereading. Interestingly, many of them predicted the opposite result, because rereading had felt easier.\n\n' +
      'Neither technique requires special equipment. A student can turn notes into questions, cover the answers and come back to them after one day, then three days, then a week. Flashcard applications that schedule reviews automatically are built on the same principle. The main difficulty is psychological: effective learning often feels slower and harder than ineffective learning, so students need to trust the method rather than their feelings.',
    qs: [
      tf('Ebbinghaus studied memory by learning lists of real words.', 1, L(
        'False: he learned "lists of meaningless syllables", not real words.',
        'False: он учил «списки бессмысленных слогов», а не настоящие слова.',
        'False: ол нақты сөздерді емес, «мағынасыз буындар тізімін» жаттаған.',
      )),
      tf('According to the forgetting curve, we forget most quickly soon after learning.', 0, L(
        'True: "forgetting is fastest in the first hours and days after learning".',
        'True: «забывание быстрее всего идёт в первые часы и дни после изучения».',
        'True: «ұмыту оқығаннан кейінгі алғашқы сағаттар мен күндерде ең жылдам жүреді».',
      )),
      tf('Ebbinghaus was the first person to use flashcards.', 2, L(
        'Not Given: the text mentions flashcard applications but not who first used flashcards.',
        'Not Given: в тексте упомянуты приложения с карточками, но не сказано, кто первым стал использовать карточки.',
        'Not Given: мәтінде карточка қосымшалары айтылған, бірақ карточканы алғаш кім қолданғаны айтылмаған.',
      )),
      tf('Students who used retrieval practice expected to do better than those who reread.', 1, L(
        'False: "many of them predicted the opposite result, because rereading had felt easier".',
        'False: «многие из них предсказывали обратный результат, потому что перечитывание казалось легче».',
        'False: «олардың көбі керісінше нәтиже күтті, өйткені қайта оқу оңайырақ көрінді».',
      )),
      mc('Why, according to one explanation, does spacing make memories stronger?', [
        'Rebuilding a memory after a gap takes more effort, which strengthens it.',
        'Short gaps allow the brain to rest completely.',
        'Material becomes more familiar when it is reread.',
        'Long study sessions tire the brain.',
      ], L(
        'The text: each review after a gap "forces the brain to work harder to rebuild the memory, and this effort makes the memory stronger".',
        'В тексте: каждое повторение после перерыва «заставляет мозг сильнее трудиться, чтобы восстановить воспоминание, и это делает его прочнее».',
        'Мәтінде: үзілістен кейінгі әр қайталау «миды естелікті қалпына келтіруге көбірек күш салуға мәжбүрлейді, ал бұл оны бекітеді».',
      )),
      mc('Which of these is an example of retrieval practice?', [
        'Explaining a topic to a friend without notes',
        'Reading a chapter for the third time',
        'Highlighting key sentences in a textbook',
        'Copying notes into a new notebook',
      ], L(
        'Retrieval practice means recalling without looking - for example, "explaining the topic to a friend".',
        'Практика вспоминания - это воспроизведение без подсказки, например «объяснить тему другу».',
        'Еске түсіру жаттығуы - қарамай еске түсіру, мысалы «тақырыпты досыңа түсіндіру».',
      )),
      mc('What is the "main difficulty" mentioned in the last paragraph?', [
        'Effective methods feel harder, so students may not trust them.',
        'The methods require expensive equipment.',
        'Flashcard applications are difficult to use.',
        'Teachers do not allow students to test themselves.',
      ], L(
        'The difficulty is psychological: effective learning "often feels slower and harder", so students must trust the method.',
        'Трудность психологическая: эффективное обучение «часто кажется медленнее и труднее», поэтому нужно доверять методу.',
        'Қиындық психологиялық: тиімді оқу «көбіне баяу әрі қиынырақ сезіледі», сондықтан әдіске сену керек.',
      )),
    ],
  },
  {
    id: 'wind',
    title: 'Harvesting the Wind',
    text:
      'People have used the power of the wind for thousands of years. Sailing ships crossed seas long before the invention of engines, and windmills were grinding grain in Persia more than a thousand years ago. In medieval Europe windmills spread widely, and in the Netherlands they were also used to pump water out of low-lying land, helping to create new farmland below sea level.\n\n' +
      'The idea of producing electricity from the wind appeared at the end of the nineteenth century, when inventors in Scotland, Denmark and the United States built the first small wind turbines. For most of the twentieth century, however, wind power remained a niche technology. Electricity from coal, oil and gas was cheap, and early turbines were small and unreliable.\n\n' +
      'The situation began to change in the 1970s, when sharp rises in oil prices pushed several governments to look for other sources of energy. Denmark became a pioneer, supporting research and offering help to people who installed turbines. Over the following decades the machines grew dramatically. A typical modern turbine has three blades, each longer than a passenger plane\'s wing, mounted on a tower taller than most office buildings. Because the energy in the wind rises sharply with its speed, engineers try to place turbines where winds are strong and steady: on hilltops, in open plains and, increasingly, out at sea.\n\n' +
      'Wind power has clear advantages. Once a turbine is built, its fuel is free, and it produces no greenhouse gases while operating. Yet it also has limitations. The wind does not blow all the time, so electricity systems need other sources or storage for calm days. Some local residents object to the noise or to the change in the landscape, and turbines must be positioned carefully to reduce the risk to birds and bats.\n\n' +
      'Despite these challenges, the share of electricity produced by the wind has grown steadily in many countries, including Kazakhstan, where large wind farms have been built on the windy steppes.',
    qs: [
      tf('Windmills in the Netherlands were used only for grinding grain.', 1, L(
        'False: in the Netherlands they "were also used to pump water out of low-lying land".',
        'False: в Нидерландах их «также использовали, чтобы откачивать воду с низменных земель».',
        'False: Нидерландта олар «ойпат жерлерден су сорып шығару үшін де» қолданылған.',
      )),
      tf('The first wind turbines for electricity were built at the end of the 1800s.', 0, L(
        'True: they appeared "at the end of the nineteenth century".',
        'True: они появились «в конце XIX века».',
        'True: олар «XIX ғасырдың соңында» пайда болды.',
      )),
      tf('Denmark produces more wind electricity than any other country.', 2, L(
        'Not Given: the text calls Denmark a pioneer but does not compare its production with other countries.',
        'Not Given: Данию называют первопроходцем, но её выработку не сравнивают с другими странами.',
        'Not Given: Дания бастамашы деп аталады, бірақ оның өндірісі басқа елдермен салыстырылмайды.',
      )),
      tf('Wind turbines release greenhouse gases while they are working.', 1, L(
        'False: a turbine "produces no greenhouse gases while operating".',
        'False: турбина «не выделяет парниковых газов во время работы».',
        'False: турбина «жұмыс кезінде парниктік газ шығармайды».',
      )),
      mc('Why did interest in wind power grow in the 1970s?', [
        'Oil prices rose sharply.',
        'Coal became illegal in Europe.',
        'Turbines suddenly became very cheap.',
        'Sailing ships came back into use.',
      ], L(
        'The text: "sharp rises in oil prices pushed several governments to look for other sources of energy".',
        'В тексте: «резкий рост цен на нефть подтолкнул правительства искать другие источники энергии».',
        'Мәтінде: «мұнай бағасының күрт өсуі үкіметтерді басқа энергия көздерін іздеуге итермеледі».',
      )),
      mc('Why do engineers place turbines where winds are strong and steady?', [
        'Because the energy in the wind rises sharply with its speed',
        'Because turbines are cheaper to build on hilltops',
        'Because birds avoid windy places',
        'Because local residents prefer it',
      ], L(
        'The reason is stated directly: "the energy in the wind rises sharply with its speed".',
        'Причина названа прямо: «энергия ветра резко растёт с его скоростью».',
        'Себебі тікелей айтылған: «желдің энергиясы оның жылдамдығымен бірге күрт өседі».',
      )),
      mc('Which is a limitation of wind power mentioned in the passage?', [
        'Electricity systems need backup for days without wind.',
        'Turbines need expensive fuel.',
        'Turbines can only be built at sea.',
        'Modern turbines are too small to be useful.',
      ], L(
        'Because "the wind does not blow all the time", systems need other sources or storage for calm days.',
        'Так как «ветер дует не всегда», в безветренные дни нужны другие источники или накопители.',
        '«Жел үнемі соқпайтындықтан», желсіз күндерге басқа көздер немесе энергия жинағыштар керек.',
      )),
    ],
  },
  {
    id: 'languages',
    title: 'When Languages Disappear',
    text:
      'Linguists estimate that around seven thousand languages are spoken in the world today, but their distribution is extremely uneven. A small number of major languages are used by the majority of the world\'s population, while thousands of others have only a few thousand speakers, and some only a handful of elderly ones. Many researchers believe that a large share of the world\'s languages could stop being spoken by the end of this century.\n\n' +
      'A language rarely disappears suddenly. More often the process takes several generations. Parents who speak a minority language may decide that their children will have better opportunities in school and at work if they use the dominant language of the country. The children understand their grandparents but answer in the majority language, and their own children may not understand the old language at all. When the last people who learned it as their first language die, the language is described as extinct, even if some words survive in songs or place names.\n\n' +
      'Why should this matter to anyone who does not speak these languages? Supporters of language preservation give several reasons. Each language contains a unique way of describing the world, including detailed knowledge about local plants, animals and weather that may not exist anywhere else. Oral traditions - stories, poems and histories - can vanish together with the language in which they were told. For many communities, their language is also a central part of their identity.\n\n' +
      'There are examples of successful revival. Hebrew, which for centuries was used mainly in religious texts, became the everyday language of millions of people in the twentieth century. In Wales, bilingual schools and media have helped the Welsh language to stabilise after a long decline. Revival is not easy, however. It requires materials for teaching, trained teachers and, above all, families who choose to speak the language at home.\n\n' +
      'Technology offers new tools as well. Linguists record elderly speakers, and communities create dictionaries, apps and online courses so that young people can learn the language of their ancestors.',
    qs: [
      tf('Most of the world’s languages have millions of speakers.', 1, L(
        'False: thousands of languages have "only a few thousand speakers" - the distribution is very uneven.',
        'False: у тысяч языков «лишь несколько тысяч носителей» - распределение очень неравномерное.',
        'False: мыңдаған тілде «бар болғаны бірнеше мың сөйлеуші» бар - бөлініс өте біркелкі емес.',
      )),
      tf('Languages usually disappear within a single year.', 1, L(
        'False: "A language rarely disappears suddenly. More often the process takes several generations."',
        'False: «Язык редко исчезает внезапно. Чаще этот процесс занимает несколько поколений».',
        'False: «Тіл сирек кенеттен жойылады. Көбіне бұл бірнеше ұрпаққа созылады».',
      )),
      tf('A language is called extinct even if some of its words are still used in place names.', 0, L(
        'True: it is "described as extinct, even if some words survive in songs or place names".',
        'True: его называют исчезнувшим, «даже если некоторые слова сохранились в песнях или названиях мест».',
        'True: ол «кейбір сөздері әндерде немесе жер атауларында сақталса да» жойылған деп саналады.',
      )),
      tf('Welsh is now spoken by more people than English in Wales.', 2, L(
        'Not Given: the text says Welsh has stabilised, but gives no comparison with English.',
        'Not Given: сказано, что валлийский язык стабилизировался, но сравнения с английским нет.',
        'Not Given: уэльс тілі тұрақтанғаны айтылған, бірақ ағылшын тілімен салыстыру жоқ.',
      )),
      mc('Why might parents stop speaking a minority language to their children?', [
        'They think the dominant language will give their children better opportunities.',
        'The minority language is banned in their homes.',
        'Their children refuse to learn any language.',
        'Grandparents ask them to change language.',
      ], L(
        'Parents "may decide that their children will have better opportunities in school and at work" in the dominant language.',
        'Родители «могут решить, что на основном языке у детей будет больше возможностей в школе и на работе».',
        'Ата-аналар басым тілде балаларының «мектепте де, жұмыста да мүмкіндігі көбірек болады» деп шешуі мүмкін.',
      )),
      mc('Which example of language revival does the passage give?', [
        'Hebrew became an everyday language again.',
        'Latin became the official language of Wales.',
        'Seven thousand languages were recorded on apps.',
        'Welsh replaced Hebrew in religious texts.',
      ], L(
        'The text says Hebrew "became the everyday language of millions of people in the twentieth century".',
        'В тексте: иврит «в XX веке стал повседневным языком миллионов людей».',
        'Мәтінде: иврит «ХХ ғасырда миллиондаған адамның күнделікті тіліне айналды».',
      )),
      mc('According to the writer, what is "above all" needed for revival?', [
        'Families who speak the language at home',
        'Government laws',
        'Famous writers',
        'Large online courses',
      ], L(
        'The text lists materials and teachers, "and, above all, families who choose to speak the language at home".',
        'В тексте перечислены материалы и учителя, «а прежде всего - семьи, которые решают говорить на языке дома».',
        'Мәтінде материалдар мен мұғалімдер аталған, «бәрінен бұрын - үйде сол тілде сөйлейтін отбасылар».',
      )),
    ],
  },
  {
    id: 'tea',
    title: 'A Cup That Changed the World',
    text:
      'Tea is made from the leaves of a single plant, Camellia sinensis, yet it is drunk in an astonishing variety of ways: green and unsweetened in Japan, with milk in Britain, and in Kazakhstan strong and hot, often with milk and served from a samovar or a teapot that is refilled again and again for guests.\n\n' +
      'The plant is native to the region where China, India and Myanmar meet, and China was the first country to turn it into a widely consumed drink. By the time of the Tang dynasty, more than a thousand years ago, tea had become part of daily life there, and a writer named Lu Yu produced a famous book describing how it should be grown, prepared and served.\n\n' +
      'From China, tea travelled along trade routes in several directions. Caravans carried compressed blocks of tea across Central Asia, where the drink became especially important for nomadic peoples: it warmed them in winter, and its slight bitterness balanced a diet rich in meat and milk. Tea reached Europe much later, in the seventeenth century, brought by Dutch and Portuguese merchants. At first it was an expensive luxury, but by the nineteenth century it had become the everyday drink of ordinary British families.\n\n' +
      'The growing demand had far-reaching consequences. For a long time Britain bought almost all of its tea from China and paid largely in silver. To reduce this dependence, British companies began growing tea on large plantations in India and later in Ceylon, now Sri Lanka. These plantations transformed the landscape and economy of the regions, but they also relied on hard and poorly paid work.\n\n' +
      'Today tea is one of the most widely consumed drinks on Earth after water. Its history shows how a simple leaf can connect distant cultures, shape trade and leave a mark on everyday customs.',
    qs: [
      tf('Different kinds of tea come from different plants.', 1, L(
        'False: tea "is made from the leaves of a single plant, Camellia sinensis".',
        'False: чай делают «из листьев одного растения - Camellia sinensis».',
        'False: шай «бір ғана өсімдіктің - Camellia sinensis жапырақтарынан» жасалады.',
      )),
      tf('Lu Yu wrote a book about growing and preparing tea.', 0, L(
        'True: he "produced a famous book describing how it should be grown, prepared and served".',
        'True: он «написал знаменитую книгу о том, как чай выращивать, готовить и подавать».',
        'True: ол шайды «қалай өсіру, дайындау және ұсыну туралы атақты кітап» жазған.',
      )),
      tf('Tea arrived in Europe before it reached Central Asia.', 1, L(
        'False: caravans carried tea across Central Asia, and it reached Europe "much later, in the seventeenth century".',
        'False: по Центральной Азии чай везли караваны, а в Европу он попал «гораздо позже, в XVII веке».',
        'False: Орталық Азияға шайды керуендер жеткізген, ал Еуропаға ол «әлдеқайда кейін, XVII ғасырда» жеткен.',
      )),
      tf('Lu Yu travelled to Central Asia with tea caravans.', 2, L(
        'Not Given: the text mentions Lu Yu’s book and the caravans separately; it never says he travelled with them.',
        'Not Given: о книге Лу Юя и о караванах говорится отдельно; что он ездил с ними, не сказано.',
        'Not Given: Лу Юйдің кітабы мен керуендер бөлек айтылады; оның керуенмен жүргені айтылмаған.',
      )),
      mc('Why was tea especially important to nomadic peoples?', [
        'It kept them warm and balanced a diet rich in meat and milk.',
        'It could be grown easily on the steppe.',
        'It was cheaper than water.',
        'It was used as money in all markets.',
      ], L(
        'The text: tea "warmed them in winter, and its slight bitterness balanced a diet rich in meat and milk".',
        'В тексте: чай «согревал зимой, а его лёгкая горечь уравновешивала пищу, богатую мясом и молоком».',
        'Мәтінде: шай «қыста жылытқан, ал оның сәл ащылығы етке және сүтке бай тағамды теңестірген».',
      )),
      mc('Why did British companies start plantations in India?', [
        'To depend less on buying tea from China',
        'Because tea did not grow in China any more',
        'To sell tea to Japan',
        'Because silver was found in India',
      ], L(
        'Britain paid for Chinese tea largely in silver; plantations were started "to reduce this dependence".',
        'Британия платила за китайский чай в основном серебром; плантации начали, «чтобы уменьшить эту зависимость».',
        'Ұлыбритания қытай шайы үшін көбіне күміспен төлеген; плантациялар «осы тәуелділікті азайту үшін» ашылған.',
      )),
      mc('What is the main idea of the final paragraph?', [
        'Tea has linked cultures and influenced trade and customs.',
        'Tea is now more popular than water.',
        'Tea should only be drunk with milk.',
        'Tea plantations no longer exist.',
      ], L(
        'The last sentence sums up the passage: a simple leaf "can connect distant cultures, shape trade and leave a mark on everyday customs".',
        'Последнее предложение подводит итог: простой лист может «связать далёкие культуры, влиять на торговлю и оставить след в обычаях».',
        'Соңғы сөйлем қорытынды жасайды: қарапайым жапырақ «алыс мәдениеттерді байланыстырып, саудаға әсер етіп, салт-дәстүрде із қалдыра алады».',
      )),
    ],
  },
];

export const TOEFL_MORE = [
  {
    id: 'botai',
    title: 'The Horses of Botai',
    text:
      'The domestication of the horse changed human history. Horses allowed people to travel and trade over great distances, to herd animals across wide grasslands and, eventually, to fight on horseback. Yet the question of where and when horses were first domesticated has proved surprisingly difficult to answer.\n\n' +
      'For many years, one of the strongest candidates was Botai, a settlement in northern Kazakhstan that was occupied around 5,500 years ago. Archaeologists working there found enormous numbers of horse bones - far more than the bones of any other animal. Some of the pottery contained traces of fats that appeared to come from mare\'s milk, and certain horse teeth showed wear that some researchers interpreted as damage caused by a bit, the metal or leather piece placed in a horse\'s mouth for riding. Together, this evidence suggested that the people of Botai were not merely hunting wild horses but keeping and possibly riding them.\n\n' +
      'In 2018, however, a genetic study complicated the picture. Scientists analysed ancient DNA from Botai horses and compared it with that of modern horses. They concluded that the Botai animals were not the main ancestors of today\'s domestic horses. Instead, they were most closely related to Przewalski\'s horses, the stocky animals of the Mongolian steppe that had long been considered the last truly wild horses. If the Botai horses had been domesticated, then Przewalski\'s horses are not wild at all but the descendants of animals that escaped from human control.\n\n' +
      'Later studies suggested that the ancestors of modern domestic horses spread from a region further west, in the steppes north of the Black and Caspian Seas, more than four thousand years ago. The debate about Botai continues: some researchers believe its people domesticated horses that later died out or became feral, while others think the evidence can be explained by intensive hunting. What is clear is that the steppes of Eurasia played a central role in the story of the horse.',
    qs: [
      mc('Why was Botai long considered a likely place of early horse domestication?', [
        'Large numbers of horse bones and possible signs of milking and riding were found there.',
        'Written records describe horse riding at Botai.',
        'Modern domestic horses are direct descendants of the Botai horses.',
        'Botai is the only ancient site in Kazakhstan.',
      ], L(
        'The second paragraph lists the evidence: many horse bones, traces of mare’s milk and tooth wear that might come from a bit.',
        'Во втором абзаце перечислены доказательства: много костей лошадей, следы кобыльего молока и износ зубов, похожий на след удил.',
        'Екінші абзацта дәлелдер берілген: жылқы сүйектері көп, бие сүтінің іздері және ауыздыққа ұқсас тіс тозуы.',
      )),
      mc('The word "bit" in the passage refers to', [
        'a piece placed in a horse’s mouth for riding',
        'a small amount of food',
        'a type of pottery',
        'a part of a horse’s tooth',
      ], L(
        'The passage defines it: "a bit, the metal or leather piece placed in a horse’s mouth for riding".',
        'В тексте дано определение: «удила - металлическая или кожаная деталь, которую вкладывают лошади в рот для верховой езды».',
        'Мәтінде түсіндірілген: «ауыздық - мінген кезде жылқының аузына салатын темір не былғары бөлік».',
      )),
      mc('What did the 2018 genetic study conclude?', [
        'The Botai horses were closely related to Przewalski’s horses, not mainly to modern domestic horses.',
        'The Botai horses were the main ancestors of all modern horses.',
        'Horses were first domesticated in Mongolia.',
        'Przewalski’s horses died out 5,500 years ago.',
      ], L(
        'The study found the Botai animals "were not the main ancestors of today’s domestic horses" but were closest to Przewalski’s horses.',
        'Исследование показало, что лошади Ботая «не были главными предками современных домашних лошадей», а ближе всего к лошадям Пржевальского.',
        'Зерттеу Ботай жылқылары «қазіргі үй жылқыларының негізгі ата-тегі емес», Пржевальский жылқысына жақын екенін көрсетті.',
      )),
      mc('What can be inferred about Przewalski’s horses if the Botai horses were domesticated?', [
        'They may descend from animals that escaped from humans.',
        'They were never in contact with people.',
        'They are the ancestors of the Botai horses.',
        'They were brought to Mongolia by ships.',
      ], L(
        'The text says that in this case they "are not wild at all but the descendants of animals that escaped from human control".',
        'В тексте сказано: тогда они «вовсе не дикие, а потомки животных, ушедших из-под контроля человека».',
        'Мәтінде: онда олар «мүлде жабайы емес, адам бақылауынан қашқан жануарлардың ұрпағы».',
      )),
      mc('According to later studies, where did the ancestors of modern domestic horses spread from?', [
        'The steppes north of the Black and Caspian Seas',
        'Northern Kazakhstan',
        'The Mongolian steppe',
        'Western Europe',
      ], L(
        'The last paragraph: they spread "from a region further west, in the steppes north of the Black and Caspian Seas".',
        'Последний абзац: они распространились «из региона западнее, из степей к северу от Чёрного и Каспийского морей».',
        'Соңғы абзац: олар «батысырақ аймақтан, Қара және Каспий теңіздерінің солтүстігіндегі далалардан» таралған.',
      )),
      mc('What is the author’s attitude to the question of Botai?', [
        'The author presents it as still debated.',
        'The author thinks it has been completely solved.',
        'The author believes the genetic study was wrong.',
        'The author considers the question unimportant.',
      ], L(
        'The author writes "The debate about Botai continues" and presents both views without choosing one.',
        'Автор пишет: «Споры о Ботае продолжаются» - и приводит обе точки зрения, не выбирая одну.',
        'Автор «Ботай туралы пікірталас жалғасуда» деп жазып, екі көзқарасты да таңдамай келтіреді.',
      )),
    ],
  },
  {
    id: 'glow',
    title: 'Living Light',
    text:
      'On a dark night, waves on certain beaches glow blue, and in summer meadows fireflies flash like tiny lanterns. Both are examples of bioluminescence - the production of light by living organisms. The phenomenon is rare on land but remarkably common in the ocean, where a large proportion of the animals living in the deep sea are thought to be able to produce light.\n\n' +
      'Bioluminescence is the result of a chemical reaction. In most cases a light-emitting molecule, generally called luciferin, reacts with oxygen with the help of an enzyme called luciferase. The energy released by the reaction is given off as light rather than heat, which is why bioluminescence is sometimes described as "cold light". Different organisms use different versions of these molecules, and as a result the light they produce varies in colour, although blue and green are by far the most common in the sea, because these colours travel farthest through water.\n\n' +
      'Organisms use their light for a variety of purposes. Some deep-sea fish dangle a glowing lure in front of their mouths to attract prey. Many small animals living in the middle depths of the ocean light up their undersides to match the faint sunlight coming from above, so that predators looking up cannot see their silhouettes - a kind of camouflage known as counter-illumination. Fireflies, on the other hand, use flashes of light to communicate: each species has its own pattern, which helps males and females find each other.\n\n' +
      'Some of the glowing waves seen from beaches are caused by tiny single-celled organisms called dinoflagellates, which flash when the water around them is disturbed. One theory suggests that the sudden light acts as a "burglar alarm": by lighting up, the dinoflagellates may attract larger predators that eat the animals trying to eat them.\n\n' +
      'Scientists have also found practical uses for bioluminescence. Genes that produce glowing proteins are used in laboratories to track how cells work, helping researchers study diseases and test new medicines.',
    qs: [
      mc('According to the passage, where is bioluminescence most common?', [
        'In the ocean, especially the deep sea',
        'In summer meadows',
        'On sandy beaches',
        'In laboratories',
      ], L(
        'The text: it is "rare on land but remarkably common in the ocean", especially among deep-sea animals.',
        'В тексте: оно «редко на суше, но удивительно часто в океане», особенно у глубоководных животных.',
        'Мәтінде: ол «құрлықта сирек, ал мұхитта таңқаларлық жиі», әсіресе терең судағы жануарларда.',
      )),
      mc('Why is bioluminescence sometimes called "cold light"?', [
        'The energy of the reaction is released as light rather than heat.',
        'It is produced only in cold water.',
        'It makes the water around the animal colder.',
        'It can only be seen in winter.',
      ], L(
        'The energy "is given off as light rather than heat, which is why bioluminescence is sometimes described as cold light".',
        'Энергия «выделяется в виде света, а не тепла, поэтому биолюминесценцию иногда называют холодным светом».',
        'Энергия «жылу емес, жарық түрінде бөлінеді, сондықтан биолюминесценцияны кейде суық жарық деп атайды».',
      )),
      mc('Why are blue and green the most common colours of light in the sea?', [
        'They travel farthest through water.',
        'They are the only colours luciferin can produce.',
        'Fish cannot see other colours.',
        'They are easiest for scientists to measure.',
      ], L(
        'The reason is given: "these colours travel farthest through water".',
        'Причина названа: «эти цвета дальше всего проходят сквозь воду».',
        'Себебі айтылған: «бұл түстер суда ең алысқа таралады».',
      )),
      mc('What is the purpose of counter-illumination?', [
        'To hide an animal’s silhouette from predators below',
        'To attract prey to the animal’s mouth',
        'To help males and females find each other',
        'To warn other animals of danger',
      ], L(
        'Animals light their undersides "so that predators looking up cannot see their silhouettes".',
        'Животные подсвечивают нижнюю сторону тела, «чтобы хищники, глядящие снизу вверх, не видели их силуэт».',
        'Жануарлар денесінің астыңғы жағын жарықтандырады, «төменнен жоғары қараған жыртқыштар олардың сұлбасын көрмеуі үшін».',
      )),
      mc('The "burglar alarm" theory suggests that dinoflagellates glow in order to', [
        'attract predators that will eat the animals attacking them',
        'find food in the dark',
        'communicate with other dinoflagellates',
        'warm the water around them',
      ], L(
        'The flash may "attract larger predators that eat the animals trying to eat them" - like an alarm calling for help.',
        'Вспышка может «привлечь более крупных хищников, которые съедят тех, кто пытается съесть динофлагеллят», - как сигнализация.',
        'Жарқыл «динофлагеллаттарды жегісі келгендерді жейтін ірі жыртқыштарды шақыруы» мүмкін - дабыл сияқты.',
      )),
      mc('Which of the following is NOT mentioned as a use of bioluminescence by living things?', [
        'Keeping warm in cold water',
        'Attracting prey',
        'Communication between fireflies',
        'Camouflage',
      ], L(
        'Prey, communication and camouflage are all described; keeping warm is not - the light is "cold".',
        'Приманка, общение и маскировка описаны; согревание - нет (свет «холодный»).',
        'Жем, қарым-қатынас және бүркеніс сипатталған; жылыну айтылмаған - жарық «суық».',
      )),
    ],
  },
  {
    id: 'coffeehouses',
    title: 'The Penny Universities',
    text:
      'In the middle of the seventeenth century a new kind of public space appeared in London: the coffeehouse. The drink itself had come to Europe from the Ottoman Empire, where coffeehouses were already popular meeting places. The first London coffeehouse is usually dated to the 1650s, and within a few decades there were hundreds of them across the city.\n\n' +
      'Coffeehouses differed from the taverns that had existed for centuries. Coffee did not make customers drunk, and the atmosphere encouraged conversation rather than noisy celebration. For the price of a single cup - often a penny for entry - a visitor could sit for hours, read the newspapers and pamphlets that were kept on the tables, and join discussions with strangers. Because of this, coffeehouses were nicknamed "penny universities".\n\n' +
      'Many coffeehouses came to specialise. Merchants and ship owners gathered in some to exchange news about cargoes and voyages; scientists met in others to discuss experiments; writers and critics preferred their own favourite rooms. One coffeehouse owned by Edward Lloyd became a meeting place for people involved in shipping, and the business of insuring ships that grew there eventually developed into Lloyd\'s of London, a major insurance market that still exists today.\n\n' +
      'Not everyone welcomed the new institutions. Some critics complained that people wasted their time in coffeehouses instead of working. The government, worried that the lively political discussions might encourage opposition, attempted in 1675 to close them. The order caused such protest that it was withdrawn within days.\n\n' +
      'Historians have argued that coffeehouses helped to create what is sometimes called a public sphere - a space where private individuals could gather to discuss matters of common concern and form opinions independently of the government and the church. Whether or not this view is entirely accurate, the coffeehouse clearly played an important role in the spread of news and ideas.',
    qs: [
      mc('Where did London’s coffee culture originally come from?', [
        'The Ottoman Empire',
        'France',
        'The Netherlands',
        'China',
      ], L(
        'The drink "had come to Europe from the Ottoman Empire, where coffeehouses were already popular".',
        'Напиток «пришёл в Европу из Османской империи, где кофейни уже были популярны».',
        'Сусын «Еуропаға кофеханалар бұрыннан танымал болған Осман империясынан келген».',
      )),
      mc('Why were coffeehouses called "penny universities"?', [
        'For a small price, people could read and join discussions.',
        'They were built next to universities.',
        'Students received a penny for each visit.',
        'Professors gave official lectures there.',
      ], L(
        'For a penny a visitor could read newspapers and discuss topics with others - like learning at a university.',
        'За пенни посетитель мог читать газеты и обсуждать темы с другими - как будто учиться в университете.',
        'Бір пенни төлеп келуші газет оқып, басқалармен пікір алмаса алған - университетте оқығандай.',
      )),
      mc('How were coffeehouses different from taverns?', [
        'Coffee did not make people drunk, so conversation was encouraged.',
        'Coffeehouses were open only at night.',
        'Taverns did not allow strangers to talk.',
        'Coffeehouses served food but no drinks.',
      ], L(
        'The text: "Coffee did not make customers drunk, and the atmosphere encouraged conversation rather than noisy celebration".',
        'В тексте: «кофе не опьянял посетителей, а обстановка располагала к беседе, а не к шумному веселью».',
        'Мәтінде: «кофе адамды мас етпеген, ал ортасы шулы тойға емес, әңгімеге қолайлы болған».',
      )),
      mc('What does the example of Edward Lloyd illustrate?', [
        'A coffeehouse could give rise to a lasting business institution.',
        'Coffeehouse owners were usually scientists.',
        'The government owned most coffeehouses.',
        'Ships carried coffee from London to the Ottoman Empire.',
      ], L(
        'Ship insurance that grew in Lloyd’s coffeehouse "developed into Lloyd’s of London", which still exists.',
        'Страхование судов, возникшее в кофейне Ллойда, «превратилось в Lloyd’s of London», который существует до сих пор.',
        'Ллойдтың кофеханасында пайда болған кеме сақтандыруы «Lloyd’s of London-ға айналды», ол әлі бар.',
      )),
      mc('What happened after the government tried to close coffeehouses in 1675?', [
        'The order was withdrawn because of strong protest.',
        'All coffeehouses closed for ten years.',
        'Coffeehouses moved to other cities.',
        'Coffee became more expensive.',
      ], L(
        'The order "caused such protest that it was withdrawn within days".',
        'Указ «вызвал такие протесты, что его отменили через несколько дней».',
        'Жарлық «сондай наразылық тудырды, бірнеше күнде кері қайтарылды».',
      )),
      mc('In the last paragraph, the author’s view of the "public sphere" idea is best described as', [
        'cautious: the role in spreading news is clear, but the theory may not be entirely accurate',
        'completely negative',
        'certain that it is fully correct',
        'uninterested in the question',
      ], L(
        'The author says "Whether or not this view is entirely accurate", the coffeehouse clearly helped spread news - a cautious position.',
        'Автор пишет: «Верна ли эта точка зрения полностью или нет», кофейни явно помогали распространять новости - осторожная позиция.',
        'Автор «Бұл көзқарас толық дұрыс па, жоқ па» деп жазады, бірақ кофеханалар жаңалық таратқаны анық - сақ ұстаным.',
      )),
    ],
  },
  {
    id: 'tardigrades',
    title: 'The Toughest Animals on Earth',
    text:
      'Tardigrades, sometimes called water bears because of their plump bodies and slow, lumbering walk, are tiny animals usually less than a millimetre long. They have eight short legs ending in claws and live almost everywhere: in moss and lichens, in soil, in lakes and oceans, and from high mountains to the deep sea. They were first described in the eighteenth century, and around 1,300 species are now known.\n\n' +
      'What makes tardigrades famous is their extraordinary ability to survive extreme conditions. When their environment dries out, many species pull in their legs, lose almost all the water in their bodies and curl into a dry ball called a tun. In this state their metabolism slows down to an almost undetectable level. They can remain like this for years, and when water returns, they rehydrate and become active again within hours.\n\n' +
      'In the tun state, tardigrades have survived conditions that would kill almost any other animal. Laboratory experiments have exposed them to temperatures close to absolute zero, to high levels of radiation and to pressures greater than those at the bottom of the deepest ocean trench. In 2007 tardigrades were even sent into orbit on the outside of a satellite, exposed to the vacuum of space; after returning to Earth, some of them recovered and produced healthy offspring.\n\n' +
      'Researchers have discovered part of the secret. Some tardigrades produce special proteins that form a glass-like material inside their cells as they dry out, protecting important molecules from damage. Another protein appears to shield their DNA from radiation.\n\n' +
      'It is important not to exaggerate, however. Tardigrades are not immortal, and in their active state they are fairly fragile. Their toughness is a strategy for waiting out bad conditions rather than for living in them. Scientists hope that understanding this strategy could one day help, for example, to store medicines and vaccines without refrigeration.',
    qs: [
      mc('Why are tardigrades called "water bears"?', [
        'Because of their plump bodies and slow walk',
        'Because they eat fish like bears',
        'Because they live only in water',
        'Because they sleep through the winter',
      ], L(
        'The first sentence explains the name: "because of their plump bodies and slow, lumbering walk".',
        'Первое предложение объясняет прозвище: «из-за пухлого тела и медленной, неуклюжей походки».',
        'Бірінші сөйлем атауын түсіндіреді: «томпақ денесі мен баяу, ебедейсіз жүрісі үшін».',
      )),
      mc('What is a "tun"?', [
        'A dry, curled-up state in which metabolism almost stops',
        'A type of moss where tardigrades live',
        'A protein that protects DNA',
        'The claw at the end of a tardigrade’s leg',
      ], L(
        'When drying out, tardigrades "curl into a dry ball called a tun", and their metabolism nearly stops.',
        'Высыхая, тихоходки «сворачиваются в сухой шарик - тун», и обмен веществ почти останавливается.',
        'Кепкенде тихоходтар «тун деп аталатын құрғақ шарға айналады», зат алмасуы тоқтауға жақын болады.',
      )),
      mc('What happened to tardigrades after the 2007 space experiment?', [
        'Some recovered and had healthy offspring.',
        'All of them died in orbit.',
        'They grew larger than before.',
        'They lost the ability to form tuns.',
      ], L(
        'The text: "after returning to Earth, some of them recovered and produced healthy offspring".',
        'В тексте: «вернувшись на Землю, некоторые из них ожили и дали здоровое потомство».',
        'Мәтінде: «Жерге оралғаннан кейін кейбіреуі тіріліп, сау ұрпақ берген».',
      )),
      mc('According to the passage, how do some special proteins protect tardigrades?', [
        'They form a glass-like material that protects molecules inside cells.',
        'They keep the body full of water.',
        'They make tardigrades grow thicker skin.',
        'They raise the animal’s body temperature.',
      ], L(
        'They "form a glass-like material inside their cells as they dry out, protecting important molecules from damage".',
        'Они «образуют внутри клеток стеклоподобное вещество при высыхании и защищают важные молекулы от повреждений».',
        'Олар «кепкен кезде жасушаның ішінде шыны тәрізді зат түзіп, маңызды молекулаларды зақымнан қорғайды».',
      )),
      mc('Why does the author say "It is important not to exaggerate"?', [
        'Tardigrades are fragile when active and survive by waiting, not by living in extreme conditions.',
        'Most experiments with tardigrades failed.',
        'Tardigrades are actually very large animals.',
        'Scientists have not studied tardigrades yet.',
      ], L(
        'The author explains they are "not immortal", are "fairly fragile" when active, and their toughness is for "waiting out bad conditions".',
        'Автор поясняет: они «не бессмертны», в активном состоянии «довольно хрупки», а их стойкость нужна, чтобы «переждать плохие условия».',
        'Автор түсіндіреді: олар «өлмейтін емес», белсенді күйде «әжептәуір нәзік», ал төзімділігі «қолайсыз жағдайды күтіп шығуға» арналған.',
      )),
      mc('What possible future use of this research does the passage mention?', [
        'Storing medicines and vaccines without refrigeration',
        'Sending people into space without spacesuits',
        'Growing moss in deserts',
        'Making animals immortal',
      ], L(
        'The last sentence: it could help "to store medicines and vaccines without refrigeration".',
        'Последнее предложение: это может помочь «хранить лекарства и вакцины без холодильника».',
        'Соңғы сөйлем: бұл «дәрілер мен вакциналарды тоңазытқышсыз сақтауға» көмектесуі мүмкін.',
      )),
    ],
  },
];
import { IELTS_MORE4A } from './reading-ielts4a.js';
import { IELTS_MORE4B } from './reading-ielts4b.js';
IELTS_MORE.push(...IELTS_MORE4A, ...IELTS_MORE4B);

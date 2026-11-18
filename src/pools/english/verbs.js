// Глаголы для генераторов английского: неправильные (три формы) и правильные.
// Строка неправильного: основа|прошедшее|причастие|-s|-ing|дополнение|ru|kk|уровень|st (st - глагол состояния, без Continuous).
// Строка правильного: основа|-s|-ing|прошедшее (= причастие)|дополнение|ru|kk.

const IRREGULAR = `
go|went|gone|goes|going|to school|идти|бару|1
have|had|had|has|having|breakfast|завтракать (have breakfast)|таңғы ас ішу|1
do|did|done|does|doing|the homework|делать|істеу|1
eat|ate|eaten|eats|eating|an apple|есть|жеу|1
drink|drank|drunk|drinks|drinking|some water|пить|ішу|1
see|saw|seen|sees|seeing|a rainbow|видеть|көру|1|st
come|came|come|comes|coming|home|приходить|келу|1
make|made|made|makes|making|a cake|делать, готовить|жасау|1
take|took|taken|takes|taking|a photo|брать, делать (фото)|алу, түсіру|1
give|gave|given|gives|giving|a present|давать|беру|1
write|wrote|written|writes|writing|a letter|писать|жазу|1
read|read|read|reads|reading|a book|читать|оқу|1
buy|bought|bought|buys|buying|a new phone|покупать|сатып алу|1
sing|sang|sung|sings|singing|a song|петь|ән айту|1
swim|swam|swum|swims|swimming|in the lake|плавать|жүзу|1
run|ran|run|runs|running|in the park|бегать|жүгіру|1
sleep|slept|slept|sleeps|sleeping|in the tent|спать|ұйықтау|1
get|got|got|gets|getting|a letter|получать|алу|2
speak|spoke|spoken|speaks|speaking|to the teacher|говорить|сөйлеу|2
know|knew|known|knows|knowing|the answer|знать|білу|2|st
find|found|found|finds|finding|the keys|находить|табу|2
tell|told|told|tells|telling|a story|рассказывать|айтып беру|2
sit|sat|sat|sits|sitting|by the window|сидеть|отыру|2
meet|met|met|meets|meeting|an old friend|встречать|кездестіру|2
leave|left|left|leaves|leaving|the house|уходить из|шығып кету|2
send|sent|sent|sends|sending|a message|отправлять|жіберу|2
spend|spent|spent|spends|spending|a lot of money|тратить|жұмсау|2
lose|lost|lost|loses|losing|the game|проигрывать, терять|ұтылу, жоғалту|2
win|won|won|wins|winning|the match|выигрывать|жеңу|2
pay|paid|paid|pays|paying|the bill|платить|төлеу|2
sell|sold|sold|sells|selling|the old car|продавать|сату|2
bring|brought|brought|brings|bringing|some food|приносить|әкелу|2
teach|taught|taught|teaches|teaching|maths|учить (кого-то)|оқыту|2
catch|caught|caught|catches|catching|the bus|успевать на, ловить|ұстау, үлгеру|2
build|built|built|builds|building|a house|строить|салу|2
draw|drew|drawn|draws|drawing|a picture|рисовать|сурет салу|2
drive|drove|driven|drives|driving|a car|водить машину|көлік жүргізу|2
fly|flew|flown|flies|flying|a kite|запускать (воздушного змея)|ұшыру|2
forget|forgot|forgotten|forgets|forgetting|the password|забывать|ұмыту|2
ride|rode|ridden|rides|riding|a horse|ездить верхом|міну|2
wear|wore|worn|wears|wearing|a jacket|носить (одежду)|кию|2
break|broke|broken|breaks|breaking|a cup|разбивать|сындыру|3
choose|chose|chosen|chooses|choosing|a new course|выбирать|таңдау|3
grow|grew|grown|grows|growing|tomatoes|выращивать|өсіру|3
hide|hid|hidden|hides|hiding|the present|прятать|жасыру|3
lend|lent|lent|lends|lending|money to a friend|одалживать|қарызға беру|3
steal|stole|stolen|steals|stealing|a bike|красть|ұрлау|3
throw|threw|thrown|throws|throwing|the ball|бросать|лақтыру|3
understand|understood|understood|understands|understanding|the rule|понимать|түсіну|3|st
hold|held|held|holds|holding|a meeting|проводить (собрание)|өткізу|3
keep|kept|kept|keeps|keeping|a diary|вести (дневник)|жүргізу|3
shake|shook|shaken|shakes|shaking|the bottle|трясти|шайқау|3
beat|beat|beaten|beats|beating|the champion|побеждать (соперника)|жеңіп шығу|4
bite|bit|bitten|bites|biting|the apple|кусать|тістеу|4
blow|blew|blown|blows|blowing|out the candles|задувать|үрлеп сөндіру|4
dig|dug|dug|digs|digging|a hole|копать|қазу|4
feed|fed|fed|feeds|feeding|the cat|кормить|тамақтандыру|4
forgive|forgave|forgiven|forgives|forgiving|his friend|прощать|кешіру|4
freeze|froze|frozen|freezes|freezing|the meat|замораживать|мұздату|4
lay|laid|laid|lays|laying|the table|накрывать (на стол)|дастархан жаю|4
lead|led|led|leads|leading|the team|вести, руководить|басқару|4
shoot|shot|shot|shoots|shooting|a video|снимать (видео)|түсіру|4
bend|bent|bent|bends|bending|the wire|сгибать|майыстыру|5
seek|sought|sought|seeks|seeking|advice|искать (совета)|іздеу|5
forbid|forbade|forbidden|forbids|forbidding|phones in class|запрещать|тыйым салу|5
withdraw|withdrew|withdrawn|withdraws|withdrawing|the money|снимать (деньги)|шешіп алу|5
undertake|undertook|undertaken|undertakes|undertaking|the task|браться за|қолға алу|5
overcome|overcame|overcome|overcomes|overcoming|the difficulties|преодолевать|еңсеру|5
foresee|foresaw|foreseen|foresees|foreseeing|the problem|предвидеть|алдын ала көру|5|st
mislead|misled|misled|misleads|misleading|the public|вводить в заблуждение|адастыру|6
overthrow|overthrew|overthrown|overthrows|overthrowing|the king|свергать|тақтан тайдыру|6
uphold|upheld|upheld|upholds|upholding|the law|поддерживать (закон)|қорғау|6
forsake|forsook|forsaken|forsakes|forsaking|his friends|покидать|тастап кету|6
spin|spun|spun|spins|spinning|the wheel|крутить|айналдыру|6
overtake|overtook|overtaken|overtakes|overtaking|the lorry|обгонять|басып озу|6
withhold|withheld|withheld|withholds|withholding|the information|утаивать|жасырып қалу|6
override|overrode|overridden|overrides|overriding|the decision|отменять (решение)|күшін жою|6
swear|swore|sworn|swears|swearing|an oath|клясться|ант беру|5
`;

const REGULAR = `
play|plays|playing|played|football|играть|ойнау
watch|watches|watching|watched|a film|смотреть|көру
cook|cooks|cooking|cooked|dinner|готовить|тамақ пісіру
clean|cleans|cleaning|cleaned|the room|убирать|жинау
visit|visits|visiting|visited|our grandparents|навещать|бару
help|helps|helping|helped|our neighbours|помогать|көмектесу
wash|washes|washing|washed|the dishes|мыть|жуу
call|calls|calling|called|a friend|звонить|қоңырау шалу
paint|paints|painting|painted|the fence|красить|бояу
study|studies|studying|studied|English|изучать|оқу
carry|carries|carrying|carried|the bags|нести|көтеру
finish|finishes|finishing|finished|the project|заканчивать|аяқтау
stop|stops|stopping|stopped|the car|останавливать|тоқтату
plan|plans|planning|planned|a trip|планировать|жоспарлау
open|opens|opening|opened|the window|открывать|ашу
close|closes|closing|closed|the door|закрывать|жабу
listen to|listens to|listening to|listened to|music|слушать|тыңдау
wait for|waits for|waiting for|waited for|the bus|ждать|күту
fix|fixes|fixing|fixed|the bike|чинить|жөндеу
answer|answers|answering|answered|the question|отвечать на|жауап беру
check|checks|checking|checked|the email|проверять|тексеру
dance|dances|dancing|danced|at the party|танцевать|билеу
walk|walks|walking|walked|the dog|выгуливать|серуендету
water|waters|watering|watered|the plants|поливать|суару
bake|bakes|baking|baked|bread|печь|пісіру
order|orders|ordering|ordered|a pizza|заказывать|тапсырыс беру
deliver|delivers|delivering|delivered|the parcels|доставлять|жеткізу
organise|organises|organising|organised|a concert|организовывать|ұйымдастыру
travel|travels|travelling|travelled|to Spain|путешествовать|саяхаттау
practise|practises|practising|practised|the piano|упражняться в|жаттығу
`;

export const IRREGULAR_VERBS = IRREGULAR.trim()
  .split('\n')
  .map((line) => {
    const [base, past, pp, s, ing, obj, ru, kk, level, flag] = line.split('|');
    return { base, past, pp, s, ing, obj, ru, kk, level: Number(level), stative: flag === 'st', irregular: true };
  });

export const REGULAR_VERBS = REGULAR.trim()
  .split('\n')
  .map((line) => {
    const [base, s, ing, past, obj, ru, kk] = line.split('|');
    return { base, past, pp: past, s, ing, obj, ru, kk, level: 1, stative: false, irregular: false };
  });

export const ALL_VERBS = [...IRREGULAR_VERBS, ...REGULAR_VERBS];

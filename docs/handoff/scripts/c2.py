import sys
sys.path.insert(0,'/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad')
from ins import insert
B='science/bio-gen.js'
insert(B,"id: 'plants',",'''
1|trunk|ствол|діңгек|holds up the crown of a tree and carries water|держит крону дерева и проводит воду|ағаштың басын ұстап тұрады және су өткізеді
1|crown|крона|ағаш басы|is formed by the branches and leaves of a tree|состоит из ветвей и листьев дерева|ағаштың бұтақтары мен жапырақтарынан тұрады
1|branch|ветка|бұтақ|grows from the trunk and carries leaves|отходит от ствола и несёт листья|діңнен өсіп, жапырақтарды көтеріп тұрады
1|nectar|нектар|нектар (гүл шырыны)|attracts insects with its sweet taste|привлекает насекомых сладким вкусом|тәтті дәмімен жәндіктерді тартады
1|needle|хвоинка|қылқан жапырақ|is the narrow leaf of a pine or spruce|служит узким листом сосны или ели|қарағай не шыршаның жіңішке жапырағы болады
1|leaf blade|листовая пластинка|жапырақ тақтасы|is the wide flat part of a leaf that catches light|широкая плоская часть листа, улавливающая свет|жарықты қабылдайтын жапырақтың жалпақ бөлігі болады
1|leaf vein|жилка листа|жапырақ жүйкесі|carries water and food through the leaf|проводит воду и вещества по листу|жапырақ ішімен су мен заттарды өткізеді
1|petiole|черешок|сағақ|joins the leaf blade to the stem|соединяет листовую пластинку со стеблем|жапырақ тақтасын сабақпен жалғайды
1|root cap|корневой чехлик|тамыр қалпақшасы|protects the growing tip of the root|защищает растущий кончик корня|тамырдың өсіп жатқан ұшын қорғайды
1|seed coat|семенная кожура|тұқым қабығы|protects the embryo inside the seed|защищает зародыш внутри семени|тұқым ішіндегі ұрықты қорғайды
1|embryo|зародыш семени|тұқым ұрығы|is the young plant inside a seed|представляет собой молодое растение внутри семени|тұқым ішіндегі жас өсімдік болады
1|stigma|рыльце пестика|аналық аузы|receives the pollen|принимает пыльцу|тозаңды қабылдайды
1|tendril|усик|мұртша|helps a climbing plant hold on to a support|помогает вьющемуся растению держаться за опору|өрмелеуші өсімдікке тіректі ұстануға көмектеседі
1|sepal|чашелистик|тостағанша жапырақшасы|protects the flower bud|защищает цветочный бутон|гүл бүршігін қорғайды
1|stem node|узел стебля|сабақ буыны|is the place where leaves grow from the stem|является местом, где от стебля отходят листья|жапырақтар сабақтан өсетін орын болады
''')
insert(B,"id: 'eco',",'''
1|greenhouse effect|парниковый эффект|жылыжай эффектісі|warming caused by gases that hold heat in the atmosphere|потепление из-за газов, удерживающих тепло в атмосфере|атмосферада жылуды ұстайтын газдардан болатын жылыну
1|acid rain|кислотный дождь|қышқылды жаңбыр|rain polluted by sulfur and nitrogen oxides|дождь, загрязнённый оксидами серы и азота|күкірт және азот оксидтерімен ластанған жаңбыр
1|endangered species|исчезающий вид|жойылу қаупіндегі түр|a species that is at risk of dying out|вид, которому грозит вымирание|жойылу қаупі төнген түр
1|renewable energy|возобновляемая энергия|жаңартылатын энергия|energy from sources that do not run out, such as sun and wind|энергия неисчерпаемых источников, например солнца и ветра|күн мен жел сияқты таусылмайтын көздердің энергиясы
1|waste|отходы|қалдықтар|materials that are thrown away after use|материалы, которые выбрасывают после использования|пайдаланғаннан кейін тасталатын материалдар
1|compost|компост|компост|rotten plant remains used to fertilise soil|перегнившие остатки растений для удобрения почвы|топырақты тыңайтуға арналған шіріген өсімдік қалдықтары
1|extinction|вымирание|жойылу|the complete disappearance of a species|полное исчезновение вида|түрдің толық жоғалуы
1|adaptation|приспособленность|бейімделу|a feature that helps an organism survive in its environment|особенность, помогающая организму выживать в среде обитания|ағзаға тіршілік ортасында аман қалуға көмектесетін ерекшелік
1|competition between species|конкуренция между организмами|ағзалар арасындағы бәсеке|rivalry of organisms for food, light and space|борьба организмов за пищу, свет и место|ағзалардың азық, жарық және орын үшін күресі
1|water cycle|круговорот воды|судың айналымы|the movement of water between the sea, the air and the land|движение воды между морем, воздухом и сушей|судың теңіз, ауа және құрлық арасындағы қозғалысы
1|ecology|экология|экология|the science of how living things relate to their environment|наука о связях живых организмов со средой|тірі ағзалардың қоршаған ортамен байланысын зерттейтін ғылым
1|overfishing|перелов|шамадан тыс балық аулау|catching fish faster than they can reproduce|вылов рыбы быстрее, чем она успевает размножаться|балықты өсіп-өнуінен жылдам ауландыру
1|poaching|браконьерство|браконьерлік|illegal hunting or fishing|незаконная охота или рыбная ловля|заңсыз аң аулау немесе балық аулау
1|afforestation|лесовосстановление|орман отырғызу|planting new forests where trees were cut down|посадка новых лесов на месте вырубленных|кесілген орнына жаңа орман отырғызу
1|waste sorting|раздельный сбор мусора|қоқысты бөлек жинау|collecting different kinds of rubbish separately|раздельный сбор разных видов мусора|қоқыстың әртүрлі түрін бөлек жинау
''')
insert(B,"id: 'sci',",'''
1|Hippocrates|Гиппократ|Гиппократ|the oath of doctors and the idea of medicine as a science|клятва врачей и взгляд на медицину как на науку|дәрігерлер антты және медицинаны ғылым деп қарау
1|Florence Nightingale|Флоренс Найтингейл|Флоренс Найтингейл|the foundations of modern nursing|основы современного ухода за больными|заманауи мейірбикелік күтімнің негізі
1|Nikolai Pirogov|Николай Пирогов|Николай Пирогов|field surgery and the use of anaesthesia in war|военно-полевая хирургия и применение наркоза на войне|далалық хирургия және соғыста наркозды қолдану
1|Joseph Lister|Джозеф Листер|Джозеф Листер|antiseptics in surgery|антисептика в хирургии|хирургиядағы антисептика
1|Christiaan Barnard|Кристиан Барнард|Кристиан Барнард|the first human heart transplant|первая пересадка сердца человеку|адам жүрегін алғаш рет ауыстырып салу
1|Jonas Salk|Джонас Солк|Джонас Солк|the first polio vaccine|первая вакцина против полиомиелита|полиомиелитке қарсы алғашқы вакцина
1|Rachel Carson|Рэйчел Карсон|Рэйчел Карсон|a book on the harm of pesticides that started the environmental movement|книга о вреде пестицидов, давшая начало движению в защиту природы|табиғатты қорғау қозғалысына бастау болған пестицид зияны туралы кітап
1|Alexander von Humboldt|Александр фон Гумбольдт|Александр фон Гумбольдт|the study of how plants are spread across the world|изучение того, как растения распределены по миру|өсімдіктердің әлемде таралуын зерттеу
1|Jacques Cousteau|Жак Кусто|Жак Кусто|the exploration of the underwater world|исследование подводного мира|су асты әлемін зерттеу
1|Dian Fossey|Дайан Фосси|Дайан Фосси|the study and protection of mountain gorillas|изучение и защита горных горилл|тау гориллаларын зерттеу және қорғау
1|Avicenna (Ibn Sina)|Авиценна (Ибн Сина)|Авиценна (Ибн Сина)|The Canon of Medicine|«Канон врачебной науки»|«Медицина каноны»
1|Gerald Durrell|Джеральд Даррелл|Джеральд Даррелл|saving rare animals and books about them|спасение редких животных и книги о них|сирек жануарларды сақтау және олар туралы кітаптар
1|Nikolai Przhevalsky|Николай Пржевальский|Николай Пржевальский|the description of the wild horse of Central Asia|описание дикой лошади Центральной Азии|Орталық Азияның жабайы жылқысын сипаттау
1|Jean-Henri Fabre|Жан-Анри Фабр|Жан-Анри Фабр|studies of the behaviour of insects|исследования поведения насекомых|жәндіктердің мінез-құлқын зерттеу
1|Alfred Brehm|Альфред Брем|Альфред Брем|the multi-volume book "Life of Animals"|многотомная книга «Жизнь животных»|көп томдық «Жануарлар тіршілігі» кітабы
''')
insert(B,'const ORGANS = rows(','''
circ|1|blood vessels|кровеносные сосуды|қан тамырлары
resp|1|nasal cavity|носовая полость|мұрын қуысы
dig|1|mouth|ротовая полость|ауыз қуысы
musc|1|bones|кости|сүйектер
musc|1|ribs|рёбра|қабырғалар
nerv|1|nerves of the body|нервы тела|дене жүйкелері
excr|1|urine-forming organs|почки и мочевыводящие пути|бүйрек және несеп жолдары
''')
insert(B,"id: 'vit',",'''
1|calcium|кальций|кальций|weak bones and teeth|слабые кости и зубы|әлсіз сүйектер мен тістер
1|vitamin A|витамин A|A дәрумені|poor vision in the dark|плохое зрение в темноте|қараңғыда нашар көру
''') if False else None

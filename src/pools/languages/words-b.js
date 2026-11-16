// Общий словарь, уровни B1 и B2. Строка: тема|английский|русский|казахский|испанский|французский.

export const WORDS_B1 = `
health|medicine|лекарство|дәрі|la medicina|le médicament
health|illness|болезнь|ауру|la enfermedad|la maladie
health|pain|боль|ауырсыну|el dolor|la douleur
health|fever|температура|қызу|la fiebre|la fièvre
health|cough|кашель|жөтел|la tos|la toux
health|pharmacy|аптека|дәріхана|la farmacia|la pharmacie
health|patient|пациент|науқас|el paciente|le patient
health|health|здоровье|денсаулық|la salud|la santé
health|injury|травма|жарақат|la herida|la blessure
work|job|работа|жұмыс|el trabajo|le travail
work|salary|зарплата|жалақы|el sueldo|le salaire
work|office|офис|кеңсе|la oficina|le bureau
work|boss|начальник|бастық|el jefe|le patron
work|meeting|встреча|кездесу|la reunión|la réunion
work|company|компания|компания|la empresa|l'entreprise
work|customer|клиент|клиент|el cliente|le client
work|interview|собеседование|сұхбат|la entrevista|l'entretien
work|money|деньги|ақша|el dinero|l'argent
work|price|цена|баға|el precio|le prix
travel|passport|паспорт|төлқұжат|el pasaporte|le passeport
travel|luggage|багаж|жүк|el equipaje|les bagages
travel|journey|поездка|сапар|el viaje|le voyage
travel|hotel|гостиница|қонақ үй|el hotel|l'hôtel
travel|tourist|турист|турист|el turista|le touriste
travel|border|граница|шекара|la frontera|la frontière
travel|guide|гид|гид|el guía|le guide
travel|flight|рейс|рейс|el vuelo|le vol
tech|computer|компьютер|компьютер|el ordenador|l'ordinateur
tech|phone|телефон|телефон|el teléfono|le téléphone
tech|screen|экран|экран|la pantalla|l'écran
tech|message|сообщение|хабарлама|el mensaje|le message
tech|password|пароль|құпиясөз|la contraseña|le mot de passe
tech|website|сайт|сайт|la página web|le site web
tech|keyboard|клавиатура|пернетақта|el teclado|le clavier
tech|battery|батарея|батарея|la batería|la batterie
nature|weather|погода|ауа райы|el tiempo|le temps
nature|storm|буря|дауыл|la tormenta|la tempête
nature|earth|земля|жер|la tierra|la terre
nature|ocean|океан|мұхит|el océano|l'océan
nature|valley|долина|аңғар|el valle|la vallée
nature|coast|побережье|жағалау|la costa|la côte
nature|plant|растение|өсімдік|la planta|la plante
nature|leaf|лист|жапырақ|la hoja|la feuille
nature|ice|лёд|мұз|el hielo|la glace
society|country|страна|ел|el país|le pays
society|government|правительство|үкімет|el gobierno|le gouvernement
society|law|закон|заң|la ley|la loi
society|history|история|тарих|la historia|l'histoire
society|language|язык|тіл|el idioma|la langue
society|news|новости|жаңалықтар|las noticias|les nouvelles
society|culture|культура|мәдениет|la cultura|la culture
society|tradition|традиция|дәстүр|la tradición|la tradition
society|war|война|соғыс|la guerra|la guerre
society|peace|мир|бейбітшілік|la paz|la paix
mind|idea|идея|идея|la idea|l'idée
mind|dream|мечта|арман|el sueño|le rêve
mind|question|вопрос|сұрақ|la pregunta|la question
mind|answer|ответ|жауап|la respuesta|la réponse
mind|mistake|ошибка|қате|el error|l'erreur
mind|reason|причина|себеп|la razón|la raison
mind|problem|проблема|мәселе|el problema|le problème
mind|choice|выбор|таңдау|la elección|le choix
mind|advice|совет|кеңес|el consejo|le conseil
mind|memory|память|ес|la memoria|la mémoire
feeling|proud|гордый|мақтаншақ|orgulloso|fier
feeling|nervous|нервный|қобалжыған|nervioso|nerveux
feeling|bored|скучающий|жалыққан|aburrido|ennuyé
feeling|surprised|удивлённый|таңғалған|sorprendido|surpris
feeling|worried|обеспокоенный|алаңдаған|preocupado|inquiet
feeling|lonely|одинокий|жалғыз|solo|seul
feeling|calm|спокойный|сабырлы|tranquilo|calme
verb|begin|начинать|бастау|empezar|commencer
verb|finish|заканчивать|аяқтау|terminar|finir
verb|explain|объяснять|түсіндіру|explicar|expliquer
verb|understand|понимать|түсіну|entender|comprendre
verb|remember|помнить|есте сақтау|recordar|se souvenir
verb|decide|решать|шешу|decidir|décider
verb|choose|выбирать|таңдау жасау|escoger|choisir
verb|change|менять|өзгерту|cambiar|changer
verb|send|отправлять|жіберу|enviar|envoyer
verb|receive|получать|қабылдау|recibir|recevoir
verb|sell|продавать|сату|vender|vendre
verb|pay|платить|төлеу|pagar|payer
verb|build|строить|салу|construir|construire
verb|grow|расти|өсу|crecer|grandir
verb|win|побеждать|жеңу|ganar|gagner
verb|lose|терять|жоғалту|perder|perdre
verb|believe|верить|сену|creer|croire
verb|smile|улыбаться|күлімсіреу|sonreír|sourire
verb|try|пытаться|тырысу|intentar|essayer
verb|carry|нести|көтеру|llevar|porter
adj|important|важный|маңызды|importante|important
adj|dangerous|опасный|қауіпті|peligroso|dangereux
adj|safe|безопасный|қауіпсіз|seguro|sûr
adj|strong|сильный|күшті|fuerte|fort
adj|weak|слабый|әлсіз|débil|faible
adj|rich|богатый|бай|rico|riche
adj|poor|бедный|кедей|pobre|pauvre
adj|quiet|тихий|тыныш|silencioso|silencieux
adj|loud|громкий|қатты|ruidoso|bruyant
adj|empty|пустой|бос|vacío|vide
adj|full|полный|толы|lleno|plein
adj|wet|мокрый|дымқыл|mojado|mouillé
adj|dry|сухой|құрғақ|seco|sec
adj|famous|знаменитый|әйгілі|famoso|célèbre
adj|modern|современный|заманауи|moderno|moderne
adj|ancient|древний|ежелгі|antiguo|ancien
adj|healthy|здоровый|сау|sano|sain
adj|polite|вежливый|сыпайы|educado|poli
`;

export const WORDS_B2 = `
work|career|карьера|мансап|la carrera|la carrière
work|profit|прибыль|пайда|el beneficio|le bénéfice
work|tax|налог|салық|el impuesto|l'impôt
work|loan|кредит|несие|el préstamo|le prêt
work|contract|договор|келісімшарт|el contrato|le contrat
work|employee|сотрудник|қызметкер|el empleado|l'employé
work|market economy|рыночная экономика|нарықтық экономика|la economía de mercado|l'économie de marché
work|budget|бюджет|бюджет|el presupuesto|le budget
work|deadline|крайний срок|соңғы мерзім|el plazo|la date limite
work|skill|навык|дағды|la habilidad|la compétence
society|election|выборы|сайлау|las elecciones|les élections
society|citizen|гражданин|азамат|el ciudadano|le citoyen
society|right|право|құқық|el derecho|le droit
society|duty|обязанность|міндет|el deber|le devoir
society|crime|преступление|қылмыс|el delito|le crime
society|court|суд|сот|el tribunal|le tribunal
society|poverty|бедность|кедейлік|la pobreza|la pauvreté
society|population|население|халық саны|la población|la population
society|freedom|свобода|бостандық|la libertad|la liberté
society|equality|равенство|теңдік|la igualdad|l'égalité
science|experiment|эксперимент|тәжірибе|el experimento|l'expérience
science|research|исследование|зерттеу|la investigación|la recherche
science|discovery|открытие|жаңалық ашу|el descubrimiento|la découverte
science|evidence|доказательство|дәлел|la prueba|la preuve
science|theory|теория|теория|la teoría|la théorie
science|energy|энергия|энергия|la energía|l'énergie
science|planet|планета|ғаламшар|el planeta|la planète
science|climate|климат|климат|el clima|le climat
science|pollution|загрязнение|ластану|la contaminación|la pollution
science|species|вид (биологический)|түр|la especie|l'espèce
tech|device|устройство|құрылғы|el dispositivo|l'appareil
tech|software|программное обеспечение|бағдарламалық жасақтама|el software|le logiciel
tech|network|сеть|желі|la red|le réseau
tech|data|данные|деректер|los datos|les données
tech|robot|робот|робот|el robot|le robot
tech|invention|изобретение|өнертабыс|el invento|l'invention
mind|opinion|мнение|пікір|la opinión|l'opinion
mind|goal|цель|мақсат|el objetivo|le but
mind|success|успех|табыс|el éxito|le succès
mind|failure|неудача|сәтсіздік|el fracaso|l'échec
mind|knowledge|знание|білім|el conocimiento|la connaissance
mind|wisdom|мудрость|даналық|la sabiduría|la sagesse
mind|attention|внимание|назар|la atención|l'attention
mind|habit|привычка|әдет|el hábito|l'habitude
mind|decision|решение|шешім|la decisión|la décision
mind|patience|терпение|шыдамдылық|la paciencia|la patience
feeling|anxious|тревожный|мазасыз|ansioso|anxieux
feeling|grateful|благодарный|риза|agradecido|reconnaissant
feeling|jealous|ревнивый|қызғаншақ|celoso|jaloux
feeling|confident|уверенный в себе|өзіне сенімді|seguro de sí|confiant
feeling|disappointed|разочарованный|көңілі қалған|decepcionado|déçu
feeling|embarrassed|смущённый|ұялған|avergonzado|gêné
feeling|excited|взволнованный|толқыған|emocionado|enthousiaste
verb|achieve|достигать|қол жеткізу|lograr|atteindre
verb|avoid|избегать|аулақ болу|evitar|éviter
verb|compare|сравнивать|салыстыру|comparar|comparer
verb|describe|описывать|сипаттау|describir|décrire
verb|develop|развивать|дамыту|desarrollar|développer
verb|improve|улучшать|жақсарту|mejorar|améliorer
verb|increase|увеличивать|арттыру|aumentar|augmenter
verb|reduce|сокращать|азайту|reducir|réduire
verb|prevent|предотвращать|алдын алу|prevenir|prévenir
verb|protect|защищать|қорғау|proteger|protéger
verb|suggest|предлагать|ұсыну|sugerir|suggérer
verb|require|требовать|талап ету|exigir|exiger
verb|solve|решать (задачу)|шығару|resolver|résoudre
verb|predict|предсказывать|болжау|predecir|prédire
verb|respect|уважать|құрметтеу|respetar|respecter
verb|borrow|брать взаймы|қарызға алу|pedir prestado|emprunter
verb|deserve|заслуживать|лайық болу|merecer|mériter
verb|admit|признавать|мойындау|admitir|admettre
verb|argue|спорить|дауласу|discutir|se disputer
verb|warn|предупреждать|ескерту|advertir|avertir
adj|reliable|надёжный|сенімді|fiable|fiable
adj|necessary|необходимый|қажетті|necesario|nécessaire
adj|possible|возможный|мүмкін|posible|possible
adj|serious|серьёзный|байсалды|serio|sérieux
adj|available|доступный|қолжетімді|disponible|disponible
adj|common|распространённый|кең таралған|común|courant
adj|rare|редкий|сирек|raro|rare
adj|huge|огромный|орасан зор|enorme|énorme
adj|tiny|крошечный|кішкене ғана|diminuto|minuscule
adj|accurate|точный|дәл|preciso|précis
adj|honest|честный|адал|honesto|honnête
adj|brave|смелый|батыл|valiente|courageux
adj|lazy|ленивый|жалқау|perezoso|paresseux
adj|generous|щедрый|жомарт|generoso|généreux
adj|curious|любопытный|әуесқой|curioso|curieux
adj|tolerant|терпимый|төзімді|tolerante|tolérant
`;

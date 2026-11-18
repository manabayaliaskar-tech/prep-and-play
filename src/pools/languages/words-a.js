// Общий словарь, уровни A1 и A2. Строка: тема|английский|русский|казахский|испанский|французский.
// Существительные испанского и французского - с артиклем, чтобы было видно род.

export const WORDS_A1 = `
food|apple|яблоко|алма|la manzana|la pomme
food|bread|хлеб|нан|el pan|le pain
food|milk|молоко|сүт|la leche|le lait
food|juice|сок|шырын|el zumo|le jus
food|egg|яйцо|жұмыртқа|el huevo|l'œuf
food|cheese|сыр|ірімшік|el queso|le fromage
food|tea|чай|шай|el té|le thé
food|coffee|кофе|кофе|el café|le café
food|rice|рис|күріш|el arroz|le riz
food|meat|мясо|ет|la carne|la viande
food|soup|суп|сорпа|la sopa|la soupe
food|salt|соль|тұз|la sal|le sel
food|cake|торт|торт|la tarta|le gâteau
food|banana|банан|банан|el plátano|la banane
food|potato|картофель|картоп|la patata|la pomme de terre
food|tomato|помидор|қызанақ|el tomate|la tomate
animal|dog|собака|ит|el perro|le chien
animal|cat|кошка|мысық|el gato|le chat
animal|horse|лошадь|жылқы|el caballo|le cheval
animal|cow|корова|сиыр|la vaca|la vache
animal|bird|птица|құс|el pájaro|l'oiseau
animal|sheep|овца|қой|la oveja|le mouton
animal|mouse|мышь|тышқан|el ratón|la souris
animal|bear|медведь|аю|el oso|l'ours
animal|wolf|волк|қасқыр|el lobo|le loup
animal|lion|лев|арыстан|el león|le lion
animal|rabbit|кролик|қоян|el conejo|le lapin
body|head|голова|бас|la cabeza|la tête
body|hand|кисть руки|қол|la mano|la main
body|eye|глаз|көз|el ojo|l'œil
body|nose|нос|мұрын|la nariz|le nez
body|mouth|рот|ауыз|la boca|la bouche
body|ear|ухо|құлақ|la oreja|l'oreille
body|leg|нога|аяқ|la pierna|la jambe
body|tooth|зуб|тіс|el diente|la dent
people|mother|мама|ана|la madre|la mère
people|father|папа|әке|el padre|le père
people|brother|брат|аға-іні|el hermano|le frère
people|sister|сестра|апа-сіңлі|la hermana|la sœur
people|friend|друг|дос|el amigo|l'ami
people|child|ребёнок|бала|el niño|l'enfant
people|boy|мальчик|ұл бала|el chico|le garçon
people|girl|девочка|қыз бала|la chica|la fillette
people|baby|младенец|нәресте|el bebé|le bébé
people|grandmother|бабушка|әже|la abuela|la grand-mère
people|grandfather|дедушка|ата|el abuelo|le grand-père
home|house|дом|үй|la casa|la maison
home|room|комната|бөлме|la habitación|la chambre
home|door|дверь|есік|la puerta|la porte
home|window|окно|терезе|la ventana|la fenêtre
home|table|стол|үстел|la mesa|la table
home|chair|стул|орындық|la silla|la chaise
home|bed|кровать|төсек|la cama|le lit
home|kitchen|кухня|ас үй|la cocina|la cuisine
home|key|ключ|кілт|la llave|la clé
home|lamp|лампа|шам|la lámpara|la lampe
school|book|книга|кітап|el libro|le livre
school|pen|ручка|қалам|el bolígrafo|le stylo
school|pencil|карандаш|қарындаш|el lápiz|le crayon
school|lesson|урок|сабақ|la lección|la leçon
school|backpack|рюкзак|рюкзак|la mochila|le sac à dos
school|notebook|тетрадь|дәптер|el cuaderno|le cahier
color|red|красный|қызыл|rojo|rouge
color|blue|синий|көк|azul|bleu
color|green|зелёный|жасыл|verde|vert
color|yellow|жёлтый|сары|amarillo|jaune
color|white|белый|ақ|blanco|blanc
color|black|чёрный|қара|negro|noir
nature|sun|солнце|күн|el sol|le soleil
nature|moon|луна|ай|la luna|la lune
nature|sky|небо|аспан|el cielo|le ciel
nature|tree|дерево|ағаш|el árbol|l'arbre
nature|flower|цветок|гүл|la flor|la fleur
nature|rain|дождь|жаңбыр|la lluvia|la pluie
nature|snow|снег|қар|la nieve|la neige
nature|river|река|өзен|el río|la rivière
nature|sea|море|теңіз|el mar|la mer
nature|mountain|гора|тау|la montaña|la montagne
time|day|день|күн|el día|le jour
time|night|ночь|түн|la noche|la nuit
time|morning|утро|таң|la mañana|le matin
time|week|неделя|апта|la semana|la semaine
time|year|год|жыл|el año|l'année
time|today|сегодня|бүгін|hoy|aujourd'hui
time|tomorrow|завтра|ертең|mañana|demain
place|city|город|қала|la ciudad|la ville
place|street|улица|көше|la calle|la rue
place|shop|магазин|дүкен|la tienda|le magasin
place|park|парк|саябақ|el parque|le parc
place|hospital|больница|аурухана|el hospital|l'hôpital
place|school|школа|мектеп|la escuela|l'école
clothes|shirt|рубашка|жейде|la camisa|la chemise
clothes|shoes|обувь|аяқ киім|los zapatos|les chaussures
clothes|hat|шляпа|қалпақ|el sombrero|le chapeau
clothes|dress|платье|көйлек|el vestido|la robe
transport|car|машина|автокөлік|el coche|la voiture
transport|bus|автобус|автобус|el autobús|le bus
transport|train|поезд|пойыз|el tren|le train
transport|plane|самолёт|ұшақ|el avión|l'avion
transport|bike|велосипед|велосипед|la bicicleta|le vélo
verb|eat|есть|жеу|comer|manger
verb|drink|пить|ішу|beber|boire
verb|sleep|спать|ұйықтау|dormir|dormir
verb|go|идти|бару|ir|aller
verb|read|читать|оқу|leer|lire
verb|write|писать|жазу|escribir|écrire
verb|see|видеть|көру|ver|voir
verb|speak|говорить|сөйлеу|hablar|parler
verb|play|играть|ойнау|jugar|jouer
verb|live|жить|тұру|vivir|habiter
verb|love|любить|жақсы көру|amar|aimer
verb|open|открывать|ашу|abrir|ouvrir
verb|buy|покупать|сатып алу|comprar|acheter
verb|run|бегать|жүгіру|correr|courir
verb|swim|плавать|жүзу|nadar|nager
verb|sing|петь|ән айту|cantar|chanter
adj|big|большой|үлкен|grande|grand
adj|small|маленький|кішкентай|pequeño|petit
adj|good|хороший|жақсы|bueno|bon
adj|bad|плохой|жаман|malo|mauvais
adj|new|новый|жаңа|nuevo|nouveau
adj|old|старый|ескі|viejo|vieux
adj|hot|горячий|ыстық|caliente|chaud
adj|cold|холодный|суық|frío|froid
feeling|happy|счастливый|бақытты|feliz|heureux
feeling|sad|грустный|мұңды|triste|triste
adj|beautiful|красивый|әдемі|bonito|beau
`;

export const WORDS_A2 = `
food|vegetable|овощ|көкөніс|la verdura|le légume
food|fruit|фрукт|жеміс|la fruta|le fruit
food|butter|сливочное масло|сары май|la mantequilla|le beurre
food|onion|лук|пияз|la cebolla|l'oignon
food|carrot|морковь|сәбіз|la zanahoria|la carotte
food|grapes|виноград|жүзім|las uvas|le raisin
food|honey|мёд|бал|la miel|le miel
food|salad|салат|салат|la ensalada|la salade
food|breakfast|завтрак|таңғы ас|el desayuno|le petit-déjeuner
food|dinner|ужин|кешкі ас|la cena|le dîner
food|lunch|обед|түскі ас|el almuerzo|le déjeuner
animal|camel|верблюд|түйе|el camello|le chameau
animal|snake|змея|жылан|la serpiente|le serpent
animal|fox|лиса|түлкі|el zorro|le renard
animal|monkey|обезьяна|маймыл|el mono|le singe
animal|elephant|слон|піл|el elefante|l'éléphant
animal|goat|коза|ешкі|la cabra|la chèvre
animal|duck|утка|үйрек|el pato|le canard
animal|frog|лягушка|бақа|la rana|la grenouille
animal|bee|пчела|ара|la abeja|l'abeille
body|heart|сердце|жүрек|el corazón|le cœur
body|shoulder|плечо|иық|el hombro|l'épaule
body|finger|палец|саусақ|el dedo|le doigt
body|knee|колено|тізе|la rodilla|le genou
body|neck|шея|мойын|el cuello|le cou
body|back|спина|арқа|la espalda|le dos
body|stomach|живот|іш|el estómago|le ventre
body|face|лицо|бет|la cara|le visage
people|husband|муж|күйеу|el marido|le mari
people|wife|жена|әйелі|la esposa|l'épouse
people|neighbour|сосед|көрші|el vecino|le voisin
people|guest|гость|қонақ|el invitado|l'invité
people|son|сын|ұл|el hijo|le fils
people|daughter|дочь|қыз|la hija|la fille
home|garden|сад|бақ|el jardín|le jardin
home|wall|стена|қабырға|la pared|le mur
home|floor|пол|еден|el suelo|le sol
home|roof|крыша|шатыр|el tejado|le toit
home|mirror|зеркало|айна|el espejo|le miroir
home|cup|чашка|кесе|la taza|la tasse
home|plate|тарелка|тәрелке|el plato|l'assiette
home|spoon|ложка|қасық|la cuchara|la cuillère
home|knife|нож|пышақ|el cuchillo|le couteau
home|fridge|холодильник|тоңазытқыш|la nevera|le frigo
home|pillow|подушка|жастық|la almohada|l'oreiller
school|exam|экзамен|емтихан|el examen|l'examen
school|ruler|линейка|сызғыш|la regla|la règle
school|dictionary|словарь|сөздік|el diccionario|le dictionnaire
school|library|библиотека|кітапхана|la biblioteca|la bibliothèque
school|blackboard|доска|тақта|la pizarra|le tableau
school|pupil|ученик|оқушы|el alumno|l'élève
place|airport|аэропорт|әуежай|el aeropuerto|l'aéroport
place|station|вокзал|вокзал|la estación|la gare
place|museum|музей|мұражай|el museo|le musée
place|cinema|кинотеатр|кинотеатр|el cine|le cinéma
place|bank|банк|банк|el banco|la banque
place|bridge|мост|көпір|el puente|le pont
place|square|площадь|алаң|la plaza|la place
place|village|деревня|ауыл|el pueblo|le village
place|market|рынок|базар|el mercado|le marché
nature|forest|лес|орман|el bosque|la forêt
nature|lake|озеро|көл|el lago|le lac
nature|island|остров|арал|la isla|l'île
nature|wind|ветер|жел|el viento|le vent
nature|cloud|облако|бұлт|la nube|le nuage
nature|star|звезда|жұлдыз|la estrella|l'étoile
nature|desert|пустыня|шөл|el desierto|le désert
nature|field|поле|алқап|el campo|le champ
nature|stone|камень|тас|la piedra|la pierre
nature|grass|трава|шөп|la hierba|l'herbe
clothes|jacket|куртка|күртеше|la chaqueta|la veste
clothes|trousers|брюки|шалбар|los pantalones|le pantalon
clothes|skirt|юбка|белдемше|la falda|la jupe
clothes|socks|носки|шұлық|los calcetines|les chaussettes
clothes|gloves|перчатки|қолғап|los guantes|les gants
clothes|scarf|шарф|мойын орамал|la bufanda|l'écharpe
clothes|belt|ремень|белдік|el cinturón|la ceinture
clothes|glasses|очки|көзілдірік|las gafas|les lunettes
time|month|месяц|ай|el mes|le mois
time|hour|час|сағат|la hora|l'heure
time|minute|минута|минут|el minuto|la minute
time|evening|вечер|кеш|la tarde|le soir
time|yesterday|вчера|кеше|ayer|hier
time|spring|весна|көктем|la primavera|le printemps
time|summer|лето|жаз|el verano|l'été
time|autumn|осень|күз|el otoño|l'automne
time|winter|зима|қыс|el invierno|l'hiver
job|teacher|учитель|мұғалім|el profesor|le professeur
job|doctor|врач|дәрігер|el médico|le médecin
job|driver|водитель|жүргізуші|el conductor|le chauffeur
job|cook|повар|аспаз|el cocinero|le cuisinier
job|farmer|фермер|фермер|el granjero|l'agriculteur
job|police officer|полицейский|полицей|el policía|le policier
job|singer|певец|әнші|el cantante|le chanteur
job|pilot|пилот|ұшқыш|el piloto|le pilote
hobby|football|футбол|футбол|el fútbol|le football
hobby|music|музыка|музыка|la música|la musique
hobby|game|игра|ойын|el juego|le jeu
hobby|film|фильм|фильм|la película|le film
hobby|song|песня|ән|la canción|la chanson
hobby|photo|фотография|сурет|la foto|la photo
hobby|holidays|каникулы|демалыс|las vacaciones|les vacances
transport|ship|корабль|кеме|el barco|le bateau
transport|ticket|билет|билет|el billete|le billet
transport|road|дорога|жол|el camino|la route
transport|map|карта|карта|el mapa|la carte
verb|help|помогать|көмектесу|ayudar|aider
verb|wait|ждать|күту|esperar|attendre
verb|find|находить|табу|encontrar|trouver
verb|give|давать|беру|dar|donner
verb|take|брать|алу|tomar|prendre
verb|know|знать|білу|saber|savoir
verb|think|думать|ойлау|pensar|penser
verb|work|работать|жұмыс істеу|trabajar|travailler
verb|learn|учить|үйрену|aprender|apprendre
verb|travel|путешествовать|саяхаттау|viajar|voyager
verb|tidy up|убирать|жинау|limpiar|ranger
verb|call|звонить|қоңырау шалу|llamar|appeler
verb|forget|забывать|ұмыту|olvidar|oublier
adj|tall|высокий|биік|alto|haut
adj|short|короткий|қысқа|corto|court
adj|long|длинный|ұзын|largo|long
adj|cheap|дешёвый|арзан|barato|bon marché
adj|expensive|дорогой|қымбат|caro|cher
adj|easy|лёгкий|оңай|fácil|facile
adj|difficult|трудный|қиын|difícil|difficile
adj|fast|быстрый|жылдам|rápido|rapide
adj|slow|медленный|баяу|lento|lent
adj|clean|чистый|таза|limpio|propre
adj|dirty|грязный|лас|sucio|sale
feeling|hungry|голодный|аш|hambriento|affamé
feeling|tired|уставший|шаршаған|cansado|fatigué
feeling|angry|сердитый|ашулы|enfadado|fâché
feeling|afraid|испуганный|қорыққан|asustado|effrayé
`;

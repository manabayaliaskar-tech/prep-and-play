import sys
sys.path.insert(0,'/tmp/claude-0/-home-user-School/85201317-ee32-532d-9302-8de0cffaf71b/scratchpad')
from ins import insert
F='science/facts-gen.js'
insert(F,'const UNITS = rows(','''
1|area|площадь|аудан|square metre (m²)|квадратный метр (м²)|шаршы метр (м²)
1|volume|объём|көлем|cubic metre (m³)|кубический метр (м³)|текше метр (м³)
1|air temperature in daily life|температура воздуха (в быту)|ауа температурасы (тұрмыста)|degree Celsius (°C)|градус Цельсия (°C)|Цельсий градусы (°C)
1|electricity consumed at home|электроэнергия по счётчику|есептегіш бойынша электр энергиясы|kilowatt-hour (kWh)|киловатт-час (кВт·ч)|киловатт-сағат (кВт·сағ)
''')
insert(F,'const FORMULAS = rows(','''
1|area of a rectangle|площадь прямоугольника|тіктөртбұрыш ауданы|S = ab|S = ab
1|volume of a cuboid|объём прямоугольного параллелепипеда|тіктөртбұрышты параллелепипед көлемі|V = abc|V = abc
1|mass from density and volume|масса через плотность и объём|тығыздық пен көлем арқылы масса|m = ρV|m = ρV
1|distance in uniform motion|путь при равномерном движении|бірқалыпты қозғалыстағы жол|s = vt|s = vt
1|time of uniform motion|время равномерного движения|бірқалыпты қозғалыс уақыты|t = s / v|t = s / v
''')
insert(F,'const PHYSICISTS = rows(','''
1|Yuri Gagarin|Юрий Гагарин|Юрий Гагарин|the first human flight into space|первый полёт человека в космос|адамның ғарышқа алғашқы ұшуы
1|Konstantin Tsiolkovsky|Константин Циолковский|Константин Циолковский|the foundations of theoretical astronautics|основы теоретической космонавтики|теориялық ғарыш зерттеудің негіздері
1|Thomas Edison|Томас Эдисон|Томас Эдисон|a practical electric light bulb and the phonograph|практичная лампа накаливания и фонограф|тәжірибеде қолданылатын қыздыру шамы мен фонограф
1|Alexander Graham Bell|Александр Белл|Александр Белл|the telephone|телефон|телефон
1|Marie Curie|Мария Кюри|Мария Кюри|the study of radioactivity|исследование радиоактивности|радиоактивтілікті зерттеу
''')
insert(F,'const TERMS = rows(','''
1|file|файл|файл|a named piece of data stored on a disk|именованный набор данных на диске|дискіде сақталатын аталған деректер жиыны
1|folder|папка|қапшық|a container for organising files|контейнер для упорядочивания файлов|файлдарды ретке келтіруге арналған контейнер
1|icon|значок|белгіше|a small picture that stands for a program or file|маленькая картинка, обозначающая программу или файл|бағдарламаны немесе файлды білдіретін кішкентай сурет
1|desktop|рабочий стол|жұмыс үстелі|the main screen where icons are placed|главный экран, на котором расположены значки|белгішелер орналасатын басты экран
1|cursor|курсор|меңзер|a mark on the screen that shows where you type or click|метка на экране, показывающая, где вы печатаете или щёлкаете|экранда теру немесе басу орнын көрсететін белгі
1|password|пароль|құпиясөз|a secret word that protects an account|секретное слово, защищающее учётную запись|тіркелгіні қорғайтын құпия сөз
1|byte|байт|байт|a unit of information equal to eight bits|единица информации, равная восьми битам|сегіз битке тең ақпарат бірлігі
1|bit|бит|бит|the smallest unit of information: 0 or 1|наименьшая единица информации: 0 или 1|ақпараттың ең кіші бірлігі: 0 немесе 1
1|internet|интернет|интернет|a global network that connects computers|всемирная сеть, соединяющая компьютеры|компьютерлерді байланыстыратын жаһандық желі
1|website|сайт|сайт|a set of linked web pages under one address|набор связанных веб-страниц под одним адресом|бір мекенжайдағы өзара байланысқан веб-беттер жиыны
1|e-mail|электронная почта|электрондық пошта|messages sent through the internet|сообщения, пересылаемые через интернет|интернет арқылы жіберілетін хабарламалар
1|search engine|поисковая система|іздеу жүйесі|a service that finds web pages by a query|сервис, который находит веб-страницы по запросу|сұраныс бойынша веб-беттерді табатын қызмет
1|computer virus|компьютерный вирус|компьютерлік вирус|a harmful program that spreads and damages data|вредоносная программа, которая распространяется и портит данные|таралып, деректерді бүлдіретін зиянды бағдарлама
1|software|программное обеспечение|бағдарламалық қамтама|the programs that run on a computer|программы, которые работают на компьютере|компьютерде жұмыс істейтін бағдарламалар
1|hardware|аппаратное обеспечение|аппараттық қамтама|the physical parts of a computer|физические части компьютера|компьютердің физикалық бөліктері
1|menu|меню|мәзір|a list of commands to choose from|список команд, из которых можно выбрать|таңдауға болатын командалар тізімі
1|window|окно|терезе|a framed area of the screen for one program|рамка на экране для одной программы|бір бағдарламаға арналған экрандағы жақтау
1|pixel|пиксель|пиксель|the smallest dot of a digital image|наименьшая точка цифрового изображения|сандық кескіннің ең кіші нүктесі
1|keyboard shortcut|горячие клавиши|жылдам пернелер|a key combination that runs a command quickly|сочетание клавиш для быстрого выполнения команды|команданы тез орындайтын пернелер тіркесі
1|download|скачивание|жүктеп алу|copying a file from the internet to your device|копирование файла из интернета на своё устройство|файлды интернеттен өз құрылғыңа көшіру
1|upload|загрузка на сервер|серверге жүктеу|sending a file from your device to the internet|отправка файла со своего устройства в интернет|файлды өз құрылғыңнан интернетке жіберу
1|Wi-Fi|Wi-Fi|Wi-Fi|a wireless connection to a network|беспроводное подключение к сети|желіге сымсыз қосылу
1|motherboard|материнская плата|аналық плата|the main board that connects all parts of a computer|главная плата, соединяющая все части компьютера|компьютердің барлық бөліктерін қосатын басты плата
1|cloud storage|облачное хранилище|бұлтты қойма|storing files on remote servers on the internet|хранение файлов на удалённых серверах в интернете|файлдарды интернеттегі қашықтағы серверлерде сақтау
1|spreadsheet|электронная таблица|электрондық кесте|a program for calculations in rows and columns|программа для вычислений в строках и столбцах|жолдар мен бағандардағы есептеулерге арналған бағдарлама
1|hyperlink|гиперссылка|гиперсілтеме|a clickable link to another page or file|ссылка, по которой можно перейти на другую страницу или файл|басқа бетке немесе файлға өтуге болатын сілтеме
''')
insert(F,'const CODE_TERMS = rows(','''
1|constant|константа|тұрақты шама|a value that does not change while the program runs|значение, которое не меняется во время работы программы|бағдарлама жұмысы кезінде өзгермейтін мән
1|keyword|ключевое слово|кілт сөз|a reserved word of the language, such as if or while|зарезервированное слово языка, например if или while|тілдің сақталған сөзі, мысалы if немесе while
1|statement|инструкция|нұсқау (инструкция)|one command of a program|одна команда программы|бағдарламаның бір командасы
1|expression|выражение|өрнек|a combination of values and operators that gives a result|сочетание значений и операторов, дающее результат|нәтиже беретін мәндер мен операторлар тіркесі
1|input|ввод данных|деректерді енгізу|data that the user gives to a program|данные, которые пользователь передаёт программе|пайдаланушы бағдарламаға беретін деректер
1|output|вывод данных|деректерді шығару|data that a program shows to the user|данные, которые программа показывает пользователю|бағдарлама пайдаланушыға көрсететін деректер
1|float (real number)|вещественное число (float)|нақты сан (float)|a number with a fractional part|число с дробной частью|бөлшек бөлігі бар сан
1|data type|тип данных|деректер түрі|the kind of value, which defines what can be done with it|вид значения, определяющий, что с ним можно делать|мәнмен не істеуге болатынын анықтайтын мән түрі
1|assignment|присваивание|меншіктеу|putting a value into a variable|запись значения в переменную|айнымалыға мән жазу
1|source code|исходный код|бастапқы код|the text of a program written by a programmer|текст программы, написанный программистом|бағдарламашы жазған бағдарлама мәтіні
1|program|программа|бағдарлама|a sequence of instructions for a computer|последовательность команд для компьютера|компьютерге арналған командалар тізбегі
1|flowchart|блок-схема|блок-схема|a diagram that shows the steps of an algorithm|схема, показывающая шаги алгоритма|алгоритм қадамдарын көрсететін сызба
1|indentation|отступ|шегініс|spaces at the start of a line that show the structure of code|пробелы в начале строки, показывающие структуру кода|код құрылымын көрсететін жол басындағы бос орындар
1|counter|счётчик|санауыш|a variable that counts repetitions or events|переменная, которая считает повторения или события|қайталауларды немесе оқиғаларды санайтын айнымалы
1|index|индекс|индекс|the position number of an element in a list|номер позиции элемента в списке|тізімдегі элементтің орын нөмірі
1|character|символ|таңба (символ)|a single letter, digit or sign|одна буква, цифра или знак|бір әріп, сан немесе белгі
1|print|вывод на экран (print)|экранға шығару (print)|a command that shows text on the screen|команда, которая показывает текст на экране|мәтінді экранға шығаратын команда
1|programming language|язык программирования|бағдарламалау тілі|a formal language for writing instructions for a computer|формальный язык для записи команд компьютеру|компьютерге командалар жазуға арналған формальды тіл
1|text editor|текстовый редактор|мәтін редакторы|a program for typing and editing code or text|программа для набора и правки кода или текста|код немесе мәтінді теруге және түзетуге арналған бағдарлама
1|running a program|запуск программы|бағдарламаны іске қосу|starting a program so that the computer executes it|начало работы программы, чтобы компьютер её выполнил|компьютер орындауы үшін бағдарламаны бастау
1|error message|сообщение об ошибке|қате туралы хабарлама|text that tells what went wrong|текст, сообщающий, что пошло не так|не дұрыс болғанын хабарлайтын мәтін
1|loop body|тело цикла|цикл денесі|the block of code that the loop repeats|блок кода, который повторяет цикл|цикл қайталайтын код блогы
1|else branch|ветка else|else тармағы|code that runs when the if condition is false|код, который выполняется, когда условие if ложно|if шарты жалған болғанда орындалатын код
2|parameter|параметр функции|функция параметрі|a variable in a function definition that receives a value|переменная в описании функции, получающая значение|мән қабылдайтын функция сипаттамасындағы айнымалы
2|return value|возвращаемое значение|қайтарылатын мән|the result that a function gives back|результат, который возвращает функция|функция қайтаратын нәтиже
2|scope|область видимости|көріну аймағы|the part of a program where a variable can be used|часть программы, где можно использовать переменную|айнымалыны қолдануға болатын бағдарлама бөлігі
2|nested loop|вложенный цикл|ішкі цикл|a loop placed inside another loop|цикл, расположенный внутри другого цикла|басқа цикл ішіндегі цикл
2|dictionary|словарь|сөздік|a collection of key and value pairs|набор пар «ключ - значение»|«кілт - мән» жұптарының жиыны
2|exception|исключение|ерекше жағдай (exception)|an error during execution that the program can handle|ошибка при выполнении, которую программа может обработать|орындау кезіндегі бағдарлама өңдей алатын қате
2|module|модуль|модуль|a file with code that can be imported into a program|файл с кодом, который можно подключить к программе|бағдарламаға қосуға болатын кодты файл
2|method|метод|әдіс (метод)|a function that belongs to an object or class|функция, принадлежащая объекту или классу|объектіге немесе класқа тиесілі функция
3|inheritance|наследование|мұрагерлік|a way for a class to take the features of another class|способ, которым класс получает свойства другого класса|класс басқа таптың қасиеттерін алу тәсілі
3|object|объект|нысан (объект)|a specific instance of a class|конкретный экземпляр класса|таптың нақты данасы
3|stack|стек|стек|a structure where the last added item is taken first|структура, в которой первым извлекается последний добавленный элемент|соңғы қосылған элемент бірінші алынатын құрылым
3|queue|очередь|кезек|a structure where the first added item is taken first|структура, в которой первым извлекается первый добавленный элемент|бірінші қосылған элемент бірінші алынатын құрылым
3|hash table|хеш-таблица|хеш-кесте|a structure that finds values quickly by a key|структура, быстро находящая значения по ключу|мәндерді кілт бойынша тез табатын құрылым
3|time complexity|временная сложность|уақыттық күрделілік|how the running time grows as the input gets bigger|как растёт время работы при увеличении входных данных|кіріс деректер өскенде жұмыс уақыты қалай артатыны
3|unit test|модульный тест|модульдік тест|a small automatic check of one piece of code|небольшая автоматическая проверка одной части кода|кодтың бір бөлігін шағын автоматты тексеру
''')
R='humanities/ru-gen.js'
insert(R,'''const TERMS = rows(`
1|state''' if False else 'const TERMS = rows(','''
1|society|общество|қоғам|people living together under common rules and institutions|люди, живущие вместе по общим правилам и институтам|ортақ ережелер мен институттар бойынша бірге тұратын адамдар
1|citizen|гражданин|азамат|a person who belongs to a state and has rights and duties in it|человек, принадлежащий государству и имеющий в нём права и обязанности|мемлекетке тиесілі, онда құқықтары мен міндеттері бар адам
1|right|право (возможность)|құқық|what a person may do and what the state protects|то, что человек может делать и что защищает государство|адам істей алатын және мемлекет қорғайтын нәрсе
1|duty|обязанность|міндет|what a person must do|то, что человек должен делать|адам міндетті түрде істеуге тиіс нәрсе
1|freedom|свобода|еркіндік|the ability to act by one’s own will within the law|возможность действовать по своей воле в рамках закона|заң шеңберінде өз еркімен әрекет ету мүмкіндігі
1|money|деньги|ақша|a universal means of exchange and payment|всеобщее средство обмена и платежа|айырбас пен төлемнің әмбебап құралы
1|income|доход|табыс|money received by a person or family|деньги, которые получает человек или семья|адам немесе отбасы алатын ақша
1|expenses|расходы|шығын|money spent on goods and services|деньги, потраченные на товары и услуги|тауар мен қызметке жұмсалған ақша
1|property|собственность|меншік|things that belong to a person or organisation by law|вещи, которые по закону принадлежат человеку или организации|заң бойынша адамға немесе ұйымға тиесілі заттар
1|profession|профессия|мамандық|a kind of work that needs special training|вид работы, требующий специальной подготовки|арнайы дайындықты қажет ететін жұмыс түрі
1|need|потребность|қажеттілік|something a person feels they must have|то, в чём человек ощущает нужду|адам өзіне қажет деп санайтын нәрсе
1|trade|торговля|сауда|buying and selling goods|купля и продажа товаров|тауарды сатып алу және сату
1|government|правительство|үкімет|the body that carries out laws and manages the country|орган, который исполняет законы и управляет страной|заңдарды орындап, елді басқаратын орган
1|president|президент|президент|the head of state in a republic|глава государства в республике|республикадағы мемлекет басшысы
1|patriotism|патриотизм|отансүйгіштік|love for one’s country and readiness to serve it|любовь к своей стране и готовность ей служить|өз еліне деген сүйіспеншілік және оған қызмет етуге дайындық
1|tradition|традиция|дәстүр|customs passed down from generation to generation|обычаи, передаваемые из поколения в поколение|ұрпақтан ұрпаққа берілетін әдет-ғұрыптар
1|religion|религия|дін|a system of beliefs about the divine and rules of behaviour|система верований о божественном и правил поведения|құдайға сенім мен мінез-құлық ережелері жүйесі
1|education|образование|білім беру|the process of gaining knowledge, skills and values|процесс получения знаний, умений и ценностей|білім, дағды және құндылықтарды игеру үдерісі
''')
insert(R,'const BODIES = rows(','''
leg|a parliamentary committee|комитет парламента|парламент комитеті
leg|a deputy of parliament|депутат парламента|парламент депутаты
leg|the Federal Assembly|Федеральное собрание|Федералдық жиналыс
exe|the Ministry of Finance|Министерство финансов|Қаржы министрлігі
exe|the Ministry of Health|Министерство здравоохранения|Денсаулық сақтау министрлігі
exe|the police|полиция|полиция
exe|the customs service|таможенная служба|кеден қызметі
exe|a city akim|аким города|қала әкімі
exe|the Ministry of Education|Министерство образования|Білім министрлігі
jud|a city court|городской суд|қалалық сот
jud|a regional court|областной суд|облыстық сот
jud|a Supreme Court judge|судья Верховного суда|Жоғарғы сот судьясы
jud|an inter-district economic court|межрайонный экономический суд|ауданаралық экономикалық сот
jud|a military court|военный суд|әскери сот
''')
insert(R,'const FACTS = rows(','''
eco|a farmer buys a tractor on credit|фермер покупает трактор в кредит|фермер тракторды несиеге сатып алады
eco|a company opens a new factory|компания открывает новый завод|компания жаңа зауыт ашады
eco|a shop sells goods at a discount|магазин продаёт товары со скидкой|дүкен тауарды жеңілдікпен сатады
eco|a bank raises its interest rate on deposits|банк повышает процент по вкладам|банк салым бойынша пайызды көтереді
pol|a candidate takes part in a debate|кандидат участвует в дебатах|үміткер дебатқа қатысады
pol|the president signs a law|президент подписывает закон|президент заңға қол қояды
pol|a party holds a congress|партия проводит съезд|партия съезд өткізеді
pol|citizens send a petition to the authorities|граждане направляют петицию властям|азаматтар билікке петиция жолдайды
soc|volunteers help elderly people|волонтёры помогают пожилым людям|еріктілер қарт адамдарға көмектеседі
soc|a family receives a child allowance|семья получает пособие на ребёнка|отбасы бала жәрдемақысын алады
soc|a social worker visits a lonely pensioner|социальный работник навещает одинокого пенсионера|әлеуметтік қызметкер жалғыз зейнеткерге барады
spi|a schoolchild takes part in a poetry contest|школьник участвует в конкурсе стихов|оқушы өлең жарысына қатысады
spi|a composer writes a symphony|композитор пишет симфонию|композитор симфония жазады
spi|people celebrate Nauryz with folk games|люди отмечают Наурыз народными играми|адамдар Наурызды халық ойындарымен тойлайды
''')

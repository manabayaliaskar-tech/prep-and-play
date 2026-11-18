// Мини-уроки по программированию (темы code.*, py.*, cpp.*, js.*, java.*). Формат - в index.js.

import { L, same } from '../../pools/gen.js';

export default {
  'code.theory': {
    rule: L(
      "A program is a list of exact instructions. The computer runs them one by one, from top to bottom, unless a condition or a loop changes the order.",
      "Программа - это список точных инструкций. Компьютер выполняет их по очереди, сверху вниз, пока условие или цикл не изменит порядок.",
      "Бағдарлама - нақты нұсқаулар тізімі. Компьютер оларды жоғарыдан төменге қарай бірінен соң бірін орындайды, шарт немесе цикл ретті өзгертпесе.",
    ),
    points: [
      L("Three basic blocks: sequence, branching (if), repetition (loop).", "Три основных блока: следование, ветвление (if), повторение (цикл).", "Үш негізгі блок: тізбектеу, тармақталу (if), қайталау (цикл)."),
      L("A variable is a named box for a value.", "Переменная - это коробка с именем для значения.", "Айнымалы - мәнге арналған аты бар жәшік."),
      L("Trace the program on paper, line by line, writing down the values.", "Прогоняй программу на бумаге, строка за строкой, записывая значения.", "Бағдарламаны қағазда жол-жолымен орындап, мәндерді жазып отыр."),
    ],
    example: {
      q: same("x = 2\nx = x + 3"),
      steps: [
        L("First x gets the value 2.", "Сначала x получает значение 2.", "Алдымен x 2 мәнін алады."),
        L("Then the right side is computed (2 + 3 = 5) and stored in x. Now x = 5.", "Потом считается правая часть (2 + 3 = 5) и записывается в x. Теперь x = 5.", "Сосын оң жағы есептеледі (2 + 3 = 5) және x-ке жазылады. Енді x = 5."),
      ],
    },
    check: {
      q: L("In which order are lines normally executed?", "В каком порядке обычно выполняются строки?", "Жолдар әдетте қандай ретпен орындалады?"),
      options: [L("bottom to top", "снизу вверх", "төменнен жоғары"), L("random", "случайно", "кездейсоқ"), L("top to bottom", "сверху вниз", "жоғарыдан төмен")],
      answer: 2,
      why: L("Lines run in order from top to bottom.", "Строки идут по порядку сверху вниз.", "Жолдар жоғарыдан төмен қарай тәртіппен орындалады."),
    },
  },
  'code.terms': {
    rule: L(
      "Programming has its own vocabulary. Learn each term as a short definition with an example: variable, function, loop, condition, array, bug.",
      "У программирования свой словарь. Учи каждый термин как короткое определение с примером: переменная, функция, цикл, условие, массив, ошибка.",
      "Бағдарламалаудың өз сөздігі бар. Әр терминді қысқа анықтама мен мысалмен үйрен: айнымалы, функция, цикл, шарт, массив, қате.",
    ),
    points: [
      L("Variable - a named value. Function - a named piece of code you can call.", "Переменная - именованное значение. Функция - именованный кусок кода, который можно вызвать.", "Айнымалы - аты бар мән. Функция - шақыруға болатын аты бар код бөлігі."),
      L("Loop repeats; condition chooses; array stores many values.", "Цикл повторяет; условие выбирает; массив хранит много значений.", "Цикл қайталайды; шарт таңдайды; массив көп мәнді сақтайды."),
      L("Bug - an error in a program; debugging - finding and fixing it.", "Баг - ошибка в программе; отладка - поиск и исправление.", "Баг - бағдарламадағы қате; жөндеу (debugging) - оны табу және түзету."),
    ],
    example: {
      q: L("What is a loop?", "Что такое цикл?", "Цикл дегеніміз не?"),
      steps: [
        L("Look at the idea: do something many times.", "Вспомни идею: сделать что-то много раз.", "Идеясын еске түсір: бірдеңені көп рет істеу."),
        L("A loop repeats a block of code.", "Цикл повторяет блок кода.", "Цикл код блогын қайталайды."),
      ],
    },
    check: {
      q: L("What is debugging?", "Что такое отладка?", "Жөндеу (debugging) дегеніміз не?"),
      options: [L("finding and fixing errors", "поиск и исправление ошибок", "қателерді табу және түзету"), L("deleting a program", "удаление программы", "бағдарламаны жою"), L("drawing a picture", "рисование картинки", "сурет салу")],
      answer: 0,
      why: L("Debugging means finding and fixing bugs.", "Отладка - поиск и исправление багов.", "Debugging - бағтарды табу және түзету."),
    },
  },
  'py.vars': {
    rule: L(
      "In Python a variable is created by assignment: x = 5. No type is declared; the type follows the value. Arithmetic: + - * / // % **.",
      "В Python переменная создаётся присваиванием: x = 5. Тип не объявляется, он определяется значением. Арифметика: + - * / // % **.",
      "Python-да айнымалы меншіктеу арқылы жасалады: x = 5. Түрі жарияланбайды, мәнге қарай анықталады. Арифметика: + - * / // % **.",
    ),
    points: [
      L("/ gives a decimal (7 / 2 = 3.5); // is integer division (7 // 2 = 3).", "/ даёт дробь (7 / 2 = 3.5); // - целочисленное деление (7 // 2 = 3).", "/ бөлшек береді (7 / 2 = 3.5); // - бүтін бөлу (7 // 2 = 3)."),
      L("% is the remainder: 7 % 2 = 1. ** is power: 2 ** 3 = 8.", "% - остаток: 7 % 2 = 1. ** - степень: 2 ** 3 = 8.", "% - қалдық: 7 % 2 = 1. ** - дәреже: 2 ** 3 = 8."),
      L("input() returns a string: wrap it with int().", "input() возвращает строку: оберни в int().", "input() жол қайтарады: оны int()-ке орап жібер."),
    ],
    example: {
      q: same("a = 7\nb = 2\nprint(a // b, a % b)"),
      steps: [
        L("7 // 2 is the whole part of the division: 3.", "7 // 2 - целая часть деления: 3.", "7 // 2 - бөлудің бүтін бөлігі: 3."),
        L("7 % 2 is the remainder: 1. Output: 3 1.", "7 % 2 - остаток: 1. Вывод: 3 1.", "7 % 2 - қалдық: 1. Шығару: 3 1."),
      ],
    },
    check: {
      q: same("print(2 ** 3)"),
      options: [same("6"), same("8"), same("5")],
      answer: 1,
      why: L("** is the power: 2 to the power 3 is 8.", "** - степень: 2 в степени 3 равно 8.", "** - дәреже: 2-нің 3-дәрежесі 8."),
    },
  },
  'py.cond': {
    rule: L(
      "if checks a condition and runs the indented block only when it is True. Add elif for more cases and else for everything else.",
      "if проверяет условие и выполняет блок с отступом, только если оно True. Добавь elif для других случаев и else для всего остального.",
      "if шартты тексереді және True болғанда ғана шегінісі бар блокты орындайды. Басқа жағдайларға elif, қалғанының бәріне else қос.",
    ),
    points: [
      L("A colon after the condition and an indent are required.", "После условия нужны двоеточие и отступ.", "Шарттан кейін қос нүкте мен шегініс міндетті."),
      L("Compare with ==, not =: x == 5.", "Сравнивай через ==, а не =: x == 5.", "Салыстыру үшін ==, = емес: x == 5."),
      L("Combine with and, or, not.", "Комбинируй через and, or, not.", "and, or, not арқылы біріктір."),
    ],
    example: {
      q: same("x = 7\nif x > 10:\n    print(\"big\")\nelse:\n    print(\"small\")"),
      steps: [
        L("Check 7 > 10: it is False.", "Проверяем 7 > 10: это False.", "7 > 10 тексереміз: False."),
        L("So the else block runs. Output: small.", "Значит выполняется блок else. Вывод: small.", "Демек else блогы орындалады. Шығару: small."),
      ],
    },
    check: {
      q: L("Which operator checks equality?", "Какой оператор проверяет равенство?", "Теңдікті қай оператор тексереді?"),
      options: [same("="), same("=="), same("=>")],
      answer: 1,
      why: L("= assigns, == compares.", "= присваивает, == сравнивает.", "= меншіктейді, == салыстырады."),
    },
  },
  'py.loop': {
    rule: L(
      "for repeats a known number of times: for i in range(n). while repeats as long as a condition is True. range(n) gives 0, 1, ..., n-1.",
      "for повторяет известное число раз: for i in range(n). while повторяет, пока условие True. range(n) даёт 0, 1, ..., n-1.",
      "for белгілі санда қайталайды: for i in range(n). while шарт True болғанша қайталайды. range(n) 0, 1, ..., n-1 береді.",
    ),
    points: [
      L("range(a, b) goes from a to b-1; range(a, b, step) uses a step.", "range(a, b) идёт от a до b-1; range(a, b, step) - с шагом.", "range(a, b) a-дан b-1-ге дейін; range(a, b, step) қадаммен жүреді."),
      L("break exits the loop, continue skips to the next turn.", "break выходит из цикла, continue переходит к следующему шагу.", "break циклден шығады, continue келесі қадамға өтеді."),
      L("In while, change the variable or the loop never ends.", "В while меняй переменную, иначе цикл не закончится.", "while-де айнымалыны өзгерт, әйтпесе цикл бітпейді."),
    ],
    example: {
      q: same("s = 0\nfor i in range(1, 4):\n    s += i\nprint(s)"),
      steps: [
        L("i takes the values 1, 2, 3.", "i принимает значения 1, 2, 3.", "i 1, 2, 3 мәндерін қабылдайды."),
        L("s = 1 + 2 + 3 = 6. Output: 6.", "s = 1 + 2 + 3 = 6. Вывод: 6.", "s = 1 + 2 + 3 = 6. Шығару: 6."),
      ],
    },
    check: {
      q: same("for i in range(3):\n    print(i)"),
      options: [same("1 2 3"), same("0 1 2"), same("0 1 2 3")],
      answer: 1,
      why: L("range(3) gives 0, 1, 2.", "range(3) даёт 0, 1, 2.", "range(3) 0, 1, 2 береді."),
    },
  },
  'py.arr': {
    rule: L(
      "A list stores many values in order: a = [4, 7, 9]. Indexes start from 0, and negative indexes count from the end.",
      "Список хранит много значений по порядку: a = [4, 7, 9]. Индексы начинаются с 0, а отрицательные считаются с конца.",
      "Тізім көп мәнді ретімен сақтайды: a = [4, 7, 9]. Индекстер 0-ден басталады, теріс индекстер соңынан санайды.",
    ),
    points: [
      L("a[0] is the first, a[-1] is the last.", "a[0] - первый, a[-1] - последний.", "a[0] - бірінші, a[-1] - соңғы."),
      L("len(a) is the length; a.append(x) adds to the end.", "len(a) - длина; a.append(x) добавляет в конец.", "len(a) - ұзындығы; a.append(x) соңына қосады."),
      L("Slice a[1:3] takes indexes 1 and 2.", "Срез a[1:3] берёт индексы 1 и 2.", "Кесінді a[1:3] 1 және 2 индекстерін алады."),
    ],
    example: {
      q: same("a = [4, 7, 9]\nprint(a[1], len(a))"),
      steps: [
        L("Index 1 is the second element: 7.", "Индекс 1 - второй элемент: 7.", "1 индексі - екінші элемент: 7."),
        L("The length is 3. Output: 7 3.", "Длина 3. Вывод: 7 3.", "Ұзындығы 3. Шығару: 7 3."),
      ],
    },
    check: {
      q: same("a = [5, 6, 7]\nprint(a[-1])"),
      options: [same("5"), same("6"), same("7")],
      answer: 2,
      why: L("-1 is the last element.", "-1 - последний элемент.", "-1 - соңғы элемент."),
    },
  },
  'py.func': {
    rule: L(
      "A function is a named block of code. Define it with def, give it parameters, and return the result with return.",
      "Функция - это именованный блок кода. Объяви её через def, передай параметры, а результат верни через return.",
      "Функция - аты бар код блогы. Оны def арқылы жарияла, параметр бер, нәтижені return арқылы қайтар.",
    ),
    points: [
      L("def add(a, b): return a + b", "def add(a, b): return a + b", "def add(a, b): return a + b"),
      L("print shows a value; return gives it back to the caller.", "print показывает значение; return возвращает его вызывающему коду.", "print мәнді көрсетеді; return оны шақырушыға қайтарады."),
      L("Variables made inside are local.", "Переменные внутри - локальные.", "Ішіндегі айнымалылар - жергілікті."),
    ],
    example: {
      q: same("def sq(x):\n    return x * x\nprint(sq(4))"),
      steps: [
        L("The call sq(4) puts 4 into x.", "Вызов sq(4) передаёт 4 в x.", "sq(4) шақыруы 4-ті x-ке береді."),
        L("It returns 4 * 4 = 16. Output: 16.", "Возвращает 4 * 4 = 16. Вывод: 16.", "4 * 4 = 16 қайтарады. Шығару: 16."),
      ],
    },
    check: {
      q: L("Which keyword defines a function in Python?", "Какое слово объявляет функцию в Python?", "Python-да функцияны қай сөз жариялайды?"),
      options: [same("func"), same("def"), same("function")],
      answer: 1,
      why: L("Python uses def.", "В Python используется def.", "Python-да def қолданылады."),
    },
  },
  'cpp.vars': {
    rule: L(
      "In C++ you must declare the type: int x = 5; double d = 2.5; char c = 'a'; string s. Integer division cuts off the fractional part.",
      "В C++ нужно указывать тип: int x = 5; double d = 2.5; char c = 'a'; string s. Целочисленное деление отбрасывает дробную часть.",
      "C++-та түрді көрсету керек: int x = 5; double d = 2.5; char c = 'a'; string s. Бүтін бөлу бөлшек бөлігін қалдырып кетеді.",
    ),
    points: [
      L("7 / 2 = 3 for int; use 7.0 / 2 for 3.5.", "7 / 2 = 3 для int; для 3.5 пиши 7.0 / 2.", "int үшін 7 / 2 = 3; 3.5 үшін 7.0 / 2 жаз."),
      L("% gives the remainder: 7 % 2 = 1.", "% даёт остаток: 7 % 2 = 1.", "% қалдық береді: 7 % 2 = 1."),
      L("Every statement ends with a semicolon.", "Каждая инструкция заканчивается точкой с запятой.", "Әр нұсқау нүктелі үтірмен аяқталады."),
    ],
    example: {
      q: same("int a = 7, b = 2;\ncout << a / b;"),
      steps: [
        L("Both are int, so the division is integer.", "Оба int, значит деление целочисленное.", "Екеуі де int, демек бөлу бүтін."),
        L("7 / 2 = 3. Output: 3.", "7 / 2 = 3. Вывод: 3.", "7 / 2 = 3. Шығару: 3."),
      ],
    },
    check: {
      q: L("Which type stores 2.5?", "Какой тип хранит 2.5?", "2.5 мәнін қай түр сақтайды?"),
      options: [same("int"), same("double"), same("char")],
      answer: 1,
      why: L("double stores decimals.", "double хранит дробные числа.", "double бөлшек сандарды сақтайды."),
    },
  },
  'cpp.cond': {
    rule: L(
      "if (condition) { ... } else { ... }. The condition goes in parentheses and the block in braces. Compare with ==, combine with && (and), || (or), ! (not).",
      "if (условие) { ... } else { ... }. Условие в круглых скобках, блок в фигурных. Сравнивай через ==, комбинируй через && (и), || (или), ! (не).",
      "if (шарт) { ... } else { ... }. Шарт дөңгелек жақшада, блок ұшты жақшада. == арқылы салыстыр, && (және), || (немесе), ! (емес) арқылы біріктір.",
    ),
    points: [
      L("= assigns, == compares: if (x == 5).", "= присваивает, == сравнивает: if (x == 5).", "= меншіктейді, == салыстырады: if (x == 5)."),
      L("else if adds another case.", "else if добавляет ещё один случай.", "else if тағы бір жағдай қосады."),
      L("switch is for many fixed values.", "switch удобен для многих фиксированных значений.", "switch көп тұрақты мәндер үшін ыңғайлы."),
    ],
    example: {
      q: same("int x = 7;\nif (x > 10) cout << \"big\";\nelse cout << \"small\";"),
      steps: [
        L("7 > 10 is false.", "7 > 10 - ложь.", "7 > 10 - жалған."),
        L("The else branch runs. Output: small.", "Выполняется ветка else. Вывод: small.", "else тармағы орындалады. Шығару: small."),
      ],
    },
    check: {
      q: L("What does && mean?", "Что означает &&?", "&& нені білдіреді?"),
      options: [L("or", "или", "немесе"), L("and", "и", "және"), L("not", "не", "емес")],
      answer: 1,
      why: L("&& is logical and.", "&& - логическое «и».", "&& - логикалық «және»."),
    },
  },
  'cpp.loop': {
    rule: L(
      "for (int i = 0; i < n; i++) repeats n times. while (condition) repeats while the condition is true. do-while runs at least once.",
      "for (int i = 0; i < n; i++) повторяет n раз. while (условие) повторяет, пока условие истинно. do-while выполняется хотя бы один раз.",
      "for (int i = 0; i < n; i++) n рет қайталайды. while (шарт) шарт шын болғанша қайталайды. do-while кемінде бір рет орындалады.",
    ),
    points: [
      L("for has three parts: start; condition; step.", "У for три части: начало; условие; шаг.", "for-дың үш бөлігі бар: басы; шарт; қадам."),
      L("i < n gives 0 to n-1; i <= n gives 0 to n.", "i < n даёт от 0 до n-1; i <= n - от 0 до n.", "i < n 0-ден n-1-ге дейін; i <= n 0-ден n-ге дейін."),
      L("break leaves the loop, continue skips a turn.", "break выходит из цикла, continue пропускает шаг.", "break циклден шығады, continue қадамды өткізеді."),
    ],
    example: {
      q: same("int s = 0;\nfor (int i = 1; i <= 3; i++) s += i;\ncout << s;"),
      steps: [
        L("i takes 1, 2, 3 (i <= 3 includes 3).", "i принимает 1, 2, 3 (i <= 3 включает 3).", "i 1, 2, 3 мәндерін алады (i <= 3 үшті қамтиды)."),
        L("s = 6. Output: 6.", "s = 6. Вывод: 6.", "s = 6. Шығару: 6."),
      ],
    },
    check: {
      q: same("for (int i = 0; i < 3; i++) cout << i;"),
      options: [same("012"), same("123"), same("0123")],
      answer: 0,
      why: L("i runs from 0 while i < 3: 0, 1, 2.", "i идёт от 0, пока i < 3: 0, 1, 2.", "i < 3 болғанша 0-ден жүреді: 0, 1, 2."),
    },
  },
  'cpp.arr': {
    rule: L(
      "An array has a fixed size and one type: int a[3] = {4, 7, 9}. A vector can grow: vector<int> v. Indexes start from 0.",
      "Массив имеет фиксированный размер и один тип: int a[3] = {4, 7, 9}. Вектор может расти: vector<int> v. Индексы начинаются с 0.",
      "Массивтің өлшемі тұрақты және бір түрлі: int a[3] = {4, 7, 9}. Вектор өсе алады: vector<int> v. Индекстер 0-ден басталады.",
    ),
    points: [
      L("The last index of a size-n array is n-1; going outside is an error.", "Последний индекс массива размера n - n-1; выход за границы - ошибка.", "n өлшемді массивтің соңғы индексі - n-1; шектен шығу - қате."),
      L("v.push_back(x) adds to the end; v.size() is the length.", "v.push_back(x) добавляет в конец; v.size() - длина.", "v.push_back(x) соңына қосады; v.size() - ұзындығы."),
      L("A for loop is the usual way to go through it.", "Обычно по нему идут циклом for.", "Оны әдетте for циклімен аралайды."),
    ],
    example: {
      q: same("int a[3] = {4, 7, 9};\ncout << a[1];"),
      steps: [
        L("Indexes: 0 is 4, 1 is 7, 2 is 9.", "Индексы: 0 - это 4, 1 - это 7, 2 - это 9.", "Индекстер: 0 - 4, 1 - 7, 2 - 9."),
        L("Output: 7.", "Вывод: 7.", "Шығару: 7."),
      ],
    },
    check: {
      q: L("What is the last valid index of int a[5]?", "Какой последний допустимый индекс у int a[5]?", "int a[5] массивінің соңғы жарамды индексі қандай?"),
      options: [same("5"), same("4"), same("6")],
      answer: 1,
      why: L("Indexes are 0..4 for five elements.", "Для пяти элементов индексы 0..4.", "Бес элемент үшін индекстер 0..4."),
    },
  },
  'cpp.func': {
    rule: L(
      "A function has a return type, a name and parameters: int sq(int x) { return x * x; }. Call it by name: sq(4).",
      "У функции есть тип возвращаемого значения, имя и параметры: int sq(int x) { return x * x; }. Вызывай по имени: sq(4).",
      "Функцияның қайтару түрі, аты және параметрлері бар: int sq(int x) { return x * x; }. Оны аты бойынша шақыр: sq(4).",
    ),
    points: [
      L("void means the function returns nothing.", "void значит, что функция ничего не возвращает.", "void функцияның ештеңе қайтармайтынын білдіреді."),
      L("Parameters are copied unless you use a reference: int& x.", "Параметры копируются, если не использовать ссылку: int& x.", "Параметрлер көшіріледі, сілтеме (int& x) қолданбасаң."),
      L("main() is where the program starts.", "main() - место, откуда начинается программа.", "main() - бағдарлама басталатын жер."),
    ],
    example: {
      q: same("int sq(int x) { return x * x; }\ncout << sq(4);"),
      steps: [
        L("x gets 4.", "x получает 4.", "x 4-ті алады."),
        L("Returns 16. Output: 16.", "Возвращает 16. Вывод: 16.", "16 қайтарады. Шығару: 16."),
      ],
    },
    check: {
      q: L("What does void mean?", "Что значит void?", "void нені білдіреді?"),
      options: [L("returns an int", "возвращает int", "int қайтарады"), L("returns nothing", "ничего не возвращает", "ештеңе қайтармайды"), L("returns text", "возвращает текст", "мәтін қайтарады")],
      answer: 1,
      why: L("void means no return value.", "void - нет возвращаемого значения.", "void - қайтарылатын мән жоқ."),
    },
  },
  'js.vars': {
    rule: L(
      "In JavaScript use let for a changing variable and const for a constant: let x = 5; const PI = 3.14. The type follows the value.",
      "В JavaScript используй let для меняющейся переменной и const для постоянной: let x = 5; const PI = 3.14. Тип определяется значением.",
      "JavaScript-те өзгеретін айнымалыға let, тұрақтыға const қолдан: let x = 5; const PI = 3.14. Түрі мәнге қарай анықталады.",
    ),
    points: [
      L("/ always gives a decimal: 7 / 2 = 3.5; use Math.floor(7 / 2) for 3.", "/ всегда даёт дробь: 7 / 2 = 3.5; для 3 используй Math.floor(7 / 2).", "/ әрдайым бөлшек береді: 7 / 2 = 3.5; 3 үшін Math.floor(7 / 2) қолдан."),
      L("\"5\" + 3 is \"53\" (string), but 5 + 3 is 8.", "\"5\" + 3 даёт \"53\" (строка), а 5 + 3 даёт 8.", "\"5\" + 3 - \"53\" (жол), ал 5 + 3 - 8."),
      L("Use === to compare strictly.", "Для строгого сравнения используй ===.", "Қатаң салыстыру үшін === қолдан."),
    ],
    example: {
      q: same("let a = 7;\nlet b = 2;\nconsole.log(a % b, a / b);"),
      steps: [
        L("7 % 2 = 1 (remainder).", "7 % 2 = 1 (остаток).", "7 % 2 = 1 (қалдық)."),
        L("7 / 2 = 3.5. Output: 1 3.5.", "7 / 2 = 3.5. Вывод: 1 3.5.", "7 / 2 = 3.5. Шығару: 1 3.5."),
      ],
    },
    check: {
      q: same("console.log(\"5\" + 3)"),
      options: [same("8"), same("53"), same("error")],
      answer: 1,
      why: L("With a string, + joins text: \"53\".", "Со строкой + склеивает текст: \"53\".", "Жолмен + мәтінді жалғайды: \"53\"."),
    },
  },
  'js.cond': {
    rule: L(
      "if (condition) { ... } else { ... }. Use === for strict comparison, && and || for and/or. Anything not false, 0, \"\" or null counts as true.",
      "if (условие) { ... } else { ... }. Для строгого сравнения используй ===, для и/или - && и ||. Всё, кроме false, 0, \"\" и null, считается истиной.",
      "if (шарт) { ... } else { ... }. Қатаң салыстыру үшін ===, және/немесе үшін && және ||. false, 0, \"\" және null-ден басқасы ақиқат саналады.",
    ),
    points: [
      L("=== compares value and type; == converts types, avoid it.", "=== сравнивает значение и тип; == приводит типы, его лучше избегать.", "=== мән мен түрді салыстырады; == түрді түрлендіреді, одан аулақ бол."),
      L("Ternary: x > 0 ? \"plus\" : \"minus\".", "Тернарный оператор: x > 0 ? \"plus\" : \"minus\".", "Үштік оператор: x > 0 ? \"plus\" : \"minus\"."),
    ],
    example: {
      q: same("let x = 7;\nif (x > 10) console.log(\"big\");\nelse console.log(\"small\");"),
      steps: [
        L("7 > 10 is false.", "7 > 10 - ложь.", "7 > 10 - жалған."),
        L("The else branch runs. Output: small.", "Выполняется ветка else. Вывод: small.", "else тармағы орындалады. Шығару: small."),
      ],
    },
    check: {
      q: same("console.log(5 === \"5\")"),
      options: [same("true"), same("false"), same("undefined")],
      answer: 1,
      why: L("=== also compares the type: number is not string.", "=== сравнивает и тип: число - не строка.", "=== түрді де салыстырады: сан жол емес."),
    },
  },
  'js.loop': {
    rule: L(
      "for (let i = 0; i < n; i++) repeats n times. while (condition) repeats while the condition is true. for...of goes through array elements.",
      "for (let i = 0; i < n; i++) повторяет n раз. while (условие) повторяет, пока условие истинно. for...of перебирает элементы массива.",
      "for (let i = 0; i < n; i++) n рет қайталайды. while (шарт) шарт шын болғанша қайталайды. for...of массив элементтерін аралайды.",
    ),
    points: [
      L("i < n gives 0 to n-1.", "i < n даёт от 0 до n-1.", "i < n 0-ден n-1-ге дейін береді."),
      L("break exits, continue skips a turn.", "break выходит, continue пропускает шаг.", "break шығады, continue қадамды өткізеді."),
      L("Avoid endless loops: always change the variable.", "Избегай бесконечных циклов: всегда меняй переменную.", "Шексіз циклден сақ бол: айнымалыны әрдайым өзгерт."),
    ],
    example: {
      q: same("let s = 0;\nfor (let i = 1; i <= 3; i++) s += i;\nconsole.log(s);"),
      steps: [
        L("i takes 1, 2, 3.", "i принимает 1, 2, 3.", "i 1, 2, 3 мәндерін алады."),
        L("s = 6. Output: 6.", "s = 6. Вывод: 6.", "s = 6. Шығару: 6."),
      ],
    },
    check: {
      q: same("for (let i = 0; i < 3; i++) console.log(i);"),
      options: [same("0 1 2"), same("1 2 3"), same("0 1 2 3")],
      answer: 0,
      why: L("i < 3 stops before 3: 0, 1, 2.", "i < 3 останавливается перед 3: 0, 1, 2.", "i < 3 үштің алдында тоқтайды: 0, 1, 2."),
    },
  },
  'js.arr': {
    rule: L(
      "An array stores values in order: const a = [4, 7, 9]. Indexes start from 0. Arrays can change size.",
      "Массив хранит значения по порядку: const a = [4, 7, 9]. Индексы начинаются с 0. Размер массива может меняться.",
      "Массив мәндерді ретімен сақтайды: const a = [4, 7, 9]. Индекстер 0-ден басталады. Массив өлшемі өзгере алады.",
    ),
    points: [
      L("a.length is the size; a.push(x) adds to the end; a.pop() removes the last.", "a.length - размер; a.push(x) добавляет в конец; a.pop() удаляет последний.", "a.length - өлшемі; a.push(x) соңына қосады; a.pop() соңғысын жояды."),
      L("Last element: a[a.length - 1].", "Последний элемент: a[a.length - 1].", "Соңғы элемент: a[a.length - 1]."),
      L("map, filter, reduce build new arrays or values.", "map, filter, reduce создают новые массивы или значения.", "map, filter, reduce жаңа массив немесе мән жасайды."),
    ],
    example: {
      q: same("const a = [4, 7, 9];\nconsole.log(a[1], a.length);"),
      steps: [
        L("Index 1 is 7.", "Индекс 1 - это 7.", "1 индексі - 7."),
        L("The length is 3. Output: 7 3.", "Длина 3. Вывод: 7 3.", "Ұзындығы 3. Шығару: 7 3."),
      ],
    },
    check: {
      q: same("[1, 2, 3].map(x => x * 2)"),
      options: [same("[2, 4, 6]"), same("[1, 2, 3]"), same("6")],
      answer: 0,
      why: L("map applies the function to every element.", "map применяет функцию к каждому элементу.", "map функцияны әр элементке қолданады."),
    },
  },
  'js.func': {
    rule: L(
      "A function: function add(a, b) { return a + b; } or an arrow function: const add = (a, b) => a + b. Call it by name: add(2, 3).",
      "Функция: function add(a, b) { return a + b; } или стрелочная: const add = (a, b) => a + b. Вызов по имени: add(2, 3).",
      "Функция: function add(a, b) { return a + b; } немесе жебелі: const add = (a, b) => a + b. Аты бойынша шақырылады: add(2, 3).",
    ),
    points: [
      L("Without return the function gives undefined.", "Без return функция вернёт undefined.", "return болмаса функция undefined қайтарады."),
      L("Parameters are local to the function.", "Параметры локальны для функции.", "Параметрлер функция үшін жергілікті."),
      L("Functions can be passed as values: arr.map(f).", "Функции можно передавать как значения: arr.map(f).", "Функцияларды мән ретінде беруге болады: arr.map(f)."),
    ],
    example: {
      q: same("const sq = x => x * x;\nconsole.log(sq(4));"),
      steps: [
        L("x gets 4.", "x получает 4.", "x 4-ті алады."),
        L("It returns 16. Output: 16.", "Возвращает 16. Вывод: 16.", "16 қайтарады. Шығару: 16."),
      ],
    },
    check: {
      q: L("What does a function without return give?", "Что вернёт функция без return?", "return жоқ функция не қайтарады?"),
      options: [same("0"), same("undefined"), same("null")],
      answer: 1,
      why: L("It returns undefined by default.", "По умолчанию возвращается undefined.", "Әдепкі бойынша undefined қайтарады."),
    },
  },
  'java.vars': {
    rule: L(
      "Java is strictly typed: int x = 5; double d = 2.5; String s = \"hi\"; boolean b = true. Each statement ends with a semicolon.",
      "Java строго типизирована: int x = 5; double d = 2.5; String s = \"hi\"; boolean b = true. Каждая инструкция заканчивается точкой с запятой.",
      "Java қатаң типтелген: int x = 5; double d = 2.5; String s = \"hi\"; boolean b = true. Әр нұсқау нүктелі үтірмен аяқталады.",
    ),
    points: [
      L("int / int is integer division: 7 / 2 = 3.", "int / int - целочисленное деление: 7 / 2 = 3.", "int / int - бүтін бөлу: 7 / 2 = 3."),
      L("% is the remainder; String starts with a capital letter.", "% - остаток; String пишется с заглавной буквы.", "% - қалдық; String бас әріппен жазылады."),
      L("Output: System.out.println(x);", "Вывод: System.out.println(x);", "Шығару: System.out.println(x);"),
    ],
    example: {
      q: same("int a = 7, b = 2;\nSystem.out.println(a / b);"),
      steps: [
        L("Both are int, so the division is integer.", "Оба int, значит деление целочисленное.", "Екеуі де int, демек бөлу бүтін."),
        L("7 / 2 = 3. Output: 3.", "7 / 2 = 3. Вывод: 3.", "7 / 2 = 3. Шығару: 3."),
      ],
    },
    check: {
      q: L("Which type stores text?", "Какой тип хранит текст?", "Мәтінді қай түр сақтайды?"),
      options: [same("int"), same("boolean"), same("String")],
      answer: 2,
      why: L("String stores text.", "String хранит текст.", "String мәтінді сақтайды."),
    },
  },
  'java.cond': {
    rule: L(
      "if (condition) { ... } else { ... }. The condition must be boolean. Combine with && (and), || (or), ! (not).",
      "if (условие) { ... } else { ... }. Условие должно быть boolean. Комбинируй через && (и), || (или), ! (не).",
      "if (шарт) { ... } else { ... }. Шарт boolean болуы керек. && (және), || (немесе), ! (емес) арқылы біріктір.",
    ),
    points: [
      L("Compare numbers with ==, but compare strings with .equals().", "Числа сравнивай через ==, а строки - через .equals().", "Сандарды == арқылы, жолдарды .equals() арқылы салыстыр."),
      L("if (x = 5) is an error: use ==.", "if (x = 5) - ошибка: используй ==.", "if (x = 5) - қате: == қолдан."),
      L("switch works with many fixed values.", "switch работает с многими фиксированными значениями.", "switch көп тұрақты мәнмен жұмыс істейді."),
    ],
    example: {
      q: same("int x = 7;\nif (x > 10) System.out.println(\"big\");\nelse System.out.println(\"small\");"),
      steps: [
        L("7 > 10 is false.", "7 > 10 - ложь.", "7 > 10 - жалған."),
        L("The else branch runs. Output: small.", "Выполняется ветка else. Вывод: small.", "else тармағы орындалады. Шығару: small."),
      ],
    },
    check: {
      q: L("How do you compare two strings in Java?", "Как сравнить две строки в Java?", "Java-да екі жолды қалай салыстырады?"),
      options: [same("a == b"), same("a.equals(b)"), same("a = b")],
      answer: 1,
      why: L(".equals() compares the content.", ".equals() сравнивает содержимое.", ".equals() мазмұнын салыстырады."),
    },
  },
  'java.loop': {
    rule: L(
      "for (int i = 0; i < n; i++) repeats n times. while (condition) repeats while the condition is true. for (int x : a) goes through an array.",
      "for (int i = 0; i < n; i++) повторяет n раз. while (условие) повторяет, пока условие истинно. for (int x : a) перебирает массив.",
      "for (int i = 0; i < n; i++) n рет қайталайды. while (шарт) шарт шын болғанша қайталайды. for (int x : a) массивті аралайды.",
    ),
    points: [
      L("for has three parts: start; condition; step.", "У for три части: начало; условие; шаг.", "for-дың үш бөлігі бар: басы; шарт; қадам."),
      L("i < n gives 0 to n-1.", "i < n даёт от 0 до n-1.", "i < n 0-ден n-1-ге дейін береді."),
      L("break exits, continue skips a turn.", "break выходит, continue пропускает шаг.", "break шығады, continue қадамды өткізеді."),
    ],
    example: {
      q: same("int s = 0;\nfor (int i = 1; i <= 3; i++) s += i;\nSystem.out.println(s);"),
      steps: [
        L("i takes 1, 2, 3.", "i принимает 1, 2, 3.", "i 1, 2, 3 мәндерін алады."),
        L("s = 6. Output: 6.", "s = 6. Вывод: 6.", "s = 6. Шығару: 6."),
      ],
    },
    check: {
      q: same("for (int i = 0; i < 3; i++) System.out.print(i);"),
      options: [same("123"), same("012"), same("0123")],
      answer: 1,
      why: L("i runs from 0 while i < 3: 0, 1, 2.", "i идёт от 0, пока i < 3: 0, 1, 2.", "i < 3 болғанша 0-ден жүреді: 0, 1, 2."),
    },
  },
  'java.arr': {
    rule: L(
      "An array has a fixed size and one type: int[] a = {4, 7, 9}. Indexes start from 0. ArrayList is a list that can grow.",
      "Массив имеет фиксированный размер и один тип: int[] a = {4, 7, 9}. Индексы начинаются с 0. ArrayList - список, который может расти.",
      "Массивтің өлшемі тұрақты және бір түрлі: int[] a = {4, 7, 9}. Индекстер 0-ден басталады. ArrayList - өсе алатын тізім.",
    ),
    points: [
      L("a.length is the size (no parentheses); the last index is a.length - 1.", "a.length - размер (без скобок); последний индекс - a.length - 1.", "a.length - өлшемі (жақшасыз); соңғы индекс - a.length - 1."),
      L("Going outside gives ArrayIndexOutOfBoundsException.", "Выход за границы даёт ArrayIndexOutOfBoundsException.", "Шектен шығу ArrayIndexOutOfBoundsException береді."),
      L("ArrayList: list.add(x), list.get(i), list.size().", "ArrayList: list.add(x), list.get(i), list.size().", "ArrayList: list.add(x), list.get(i), list.size()."),
    ],
    example: {
      q: same("int[] a = {4, 7, 9};\nSystem.out.println(a[1] + a.length);"),
      steps: [
        L("a[1] is 7, a.length is 3.", "a[1] равно 7, a.length равно 3.", "a[1] - 7, a.length - 3."),
        L("7 + 3 = 10. Output: 10.", "7 + 3 = 10. Вывод: 10.", "7 + 3 = 10. Шығару: 10."),
      ],
    },
    check: {
      q: L("How do you get the size of an array a?", "Как получить размер массива a?", "a массивінің өлшемін қалай алады?"),
      options: [same("a.size()"), same("a.length"), same("len(a)")],
      answer: 1,
      why: L("For arrays it is the field length, without parentheses.", "У массива это поле length, без скобок.", "Массивте бұл length өрісі, жақшасыз."),
    },
  },
  'java.func': {
    rule: L(
      "In Java a function is a method with a return type: static int sq(int x) { return x * x; }. Call it by name: sq(4).",
      "В Java функция - это метод с типом возврата: static int sq(int x) { return x * x; }. Вызов по имени: sq(4).",
      "Java-да функция - қайтару түрі бар әдіс: static int sq(int x) { return x * x; }. Аты бойынша шақырылады: sq(4).",
    ),
    points: [
      L("void means no return value.", "void - нет возвращаемого значения.", "void - қайтарылатын мән жоқ."),
      L("Parameters are passed by value: the original int does not change.", "Параметры передаются по значению: исходное int не меняется.", "Параметрлер мән бойынша беріледі: бастапқы int өзгермейді."),
      L("The program starts in public static void main(String[] args).", "Программа стартует с public static void main(String[] args).", "Бағдарлама public static void main(String[] args)-тан басталады."),
    ],
    example: {
      q: same("static int sq(int x) { return x * x; }\nSystem.out.println(sq(4));"),
      steps: [
        L("x gets 4.", "x получает 4.", "x 4-ті алады."),
        L("Returns 16. Output: 16.", "Возвращает 16. Вывод: 16.", "16 қайтарады. Шығару: 16."),
      ],
    },
    check: {
      q: L("What does the word before the method name show?", "Что показывает слово перед именем метода?", "Әдіс атының алдындағы сөз нені көрсетеді?"),
      options: [L("the return type", "тип возвращаемого значения", "қайтару түрі"), L("the author", "автора", "авторды"), L("the number of lines", "число строк", "жол санын")],
      answer: 0,
      why: L("It is the return type, like int or void.", "Это тип возврата, например int или void.", "Бұл қайтару түрі, мысалы int немесе void."),
    },
  },
};

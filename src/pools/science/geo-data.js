// Данные для генератора заданий по географии.
// Страны: уровень|часть света|английский|русский|казахский|столица en|ru|kk.
// Часть света «x» — страна лежит в двух частях света; вопрос о части света для неё не задаётся.
// Не взяты страны со спорной или двойной столицей и страны, у которых столица называется так же, как страна.

export const COUNTRIES_TEXT = `
1|eu|France|Франция|Франция|Paris|Париж|Париж
1|eu|Germany|Германия|Германия|Berlin|Берлин|Берлин
1|eu|United Kingdom|Великобритания|Ұлыбритания|London|Лондон|Лондон
1|eu|Italy|Италия|Италия|Rome|Рим|Рим
1|eu|Spain|Испания|Испания|Madrid|Мадрид|Мадрид
1|x|Russia|Россия|Ресей|Moscow|Москва|Мәскеу
1|x|Kazakhstan|Казахстан|Қазақстан|Astana|Астана|Астана
1|as|China|Китай|Қытай|Beijing|Пекин|Бейжің
1|as|Japan|Япония|Жапония|Tokyo|Токио|Токио
1|as|India|Индия|Үндістан|New Delhi|Нью-Дели|Нью-Дели
1|x|Turkey|Турция|Түркия|Ankara|Анкара|Анкара
1|na|United States|США|АҚШ|Washington|Вашингтон|Вашингтон
1|na|Canada|Канада|Канада|Ottawa|Оттава|Оттава
1|na|Mexico|Мексика|Мексика|Mexico City|Мехико|Мехико
1|sa|Brazil|Бразилия|Бразилия|Brasília|Бразилиа|Бразилиа
1|sa|Argentina|Аргентина|Аргентина|Buenos Aires|Буэнос-Айрес|Буэнос-Айрес
1|oc|Australia|Австралия|Аустралия|Canberra|Канберра|Канберра
1|af|Egypt|Египет|Мысыр|Cairo|Каир|Каир
1|af|Nigeria|Нигерия|Нигерия|Abuja|Абуджа|Абуджа
1|as|South Korea|Южная Корея|Оңтүстік Корея|Seoul|Сеул|Сеул
1|as|Uzbekistan|Узбекистан|Өзбекстан|Tashkent|Ташкент|Ташкент
1|as|Kyrgyzstan|Кыргызстан|Қырғызстан|Bishkek|Бишкек|Бішкек
1|as|Tajikistan|Таджикистан|Тәжікстан|Dushanbe|Душанбе|Душанбе
1|as|Turkmenistan|Туркменистан|Түрікменстан|Ashgabat|Ашхабад|Ашхабад
1|as|Mongolia|Монголия|Моңғолия|Ulaanbaatar|Улан-Батор|Ұланбатыр
1|eu|Ukraine|Украина|Украина|Kyiv|Киев|Киев
1|eu|Belarus|Беларусь|Беларусь|Minsk|Минск|Минск
1|x|Azerbaijan|Азербайджан|Әзербайжан|Baku|Баку|Баку
1|x|Armenia|Армения|Армения|Yerevan|Ереван|Ереван
1|x|Georgia|Грузия|Грузия|Tbilisi|Тбилиси|Тбилиси
1|eu|Poland|Польша|Польша|Warsaw|Варшава|Варшава
1|eu|Greece|Греция|Грекия|Athens|Афины|Афины
1|eu|Portugal|Португалия|Португалия|Lisbon|Лиссабон|Лиссабон
1|eu|Netherlands|Нидерланды|Нидерланд|Amsterdam|Амстердам|Амстердам
1|as|Saudi Arabia|Саудовская Аравия|Сауд Арабиясы|Riyadh|Эр-Рияд|Эр-Рияд
1|as|Iran|Иран|Иран|Tehran|Тегеран|Тегеран
1|as|Thailand|Таиланд|Тайланд|Bangkok|Бангкок|Бангкок
1|as|Vietnam|Вьетнам|Вьетнам|Hanoi|Ханой|Ханой
1|as|United Arab Emirates|ОАЭ|БАӘ|Abu Dhabi|Абу-Даби|Әбу-Даби
1|sa|Chile|Чили|Чили|Santiago|Сантьяго|Сантьяго
1|sa|Peru|Перу|Перу|Lima|Лима|Лима
1|af|Kenya|Кения|Кения|Nairobi|Найроби|Найроби
1|af|Morocco|Марокко|Марокко|Rabat|Рабат|Рабат
1|oc|New Zealand|Новая Зеландия|Жаңа Зеландия|Wellington|Веллингтон|Веллингтон
2|eu|Sweden|Швеция|Швеция|Stockholm|Стокгольм|Стокгольм
2|eu|Norway|Норвегия|Норвегия|Oslo|Осло|Осло
2|eu|Finland|Финляндия|Финляндия|Helsinki|Хельсинки|Хельсинки
2|eu|Denmark|Дания|Дания|Copenhagen|Копенгаген|Копенгаген
2|eu|Austria|Австрия|Австрия|Vienna|Вена|Вена
2|eu|Switzerland|Швейцария|Швейцария|Bern|Берн|Берн
2|eu|Belgium|Бельгия|Бельгия|Brussels|Брюссель|Брюссель
2|eu|Czech Republic|Чехия|Чехия|Prague|Прага|Прага
2|eu|Hungary|Венгрия|Венгрия|Budapest|Будапешт|Будапешт
2|eu|Romania|Румыния|Румыния|Bucharest|Бухарест|Бухарест
2|eu|Bulgaria|Болгария|Болгария|Sofia|София|София
2|eu|Ireland|Ирландия|Ирландия|Dublin|Дублин|Дублин
2|eu|Moldova|Молдова|Молдова|Chișinău|Кишинёв|Кишинев
2|eu|Lithuania|Литва|Литва|Vilnius|Вильнюс|Вильнюс
2|eu|Latvia|Латвия|Латвия|Riga|Рига|Рига
2|eu|Estonia|Эстония|Эстония|Tallinn|Таллин|Таллин
2|eu|Serbia|Сербия|Сербия|Belgrade|Белград|Белград
2|eu|Croatia|Хорватия|Хорватия|Zagreb|Загреб|Загреб
2|as|Pakistan|Пакистан|Пәкістан|Islamabad|Исламабад|Исламабад
2|as|Afghanistan|Афганистан|Ауғанстан|Kabul|Кабул|Кабул
2|as|Iraq|Ирак|Ирак|Baghdad|Багдад|Бағдат
2|as|Syria|Сирия|Сирия|Damascus|Дамаск|Дамаск
2|as|Jordan|Иордания|Иордания|Amman|Амман|Амман
2|as|Qatar|Катар|Катар|Doha|Доха|Доха
2|as|North Korea|КНДР|КХДР|Pyongyang|Пхеньян|Пхеньян
2|as|Philippines|Филиппины|Филиппин|Manila|Манила|Манила
2|as|Malaysia|Малайзия|Малайзия|Kuala Lumpur|Куала-Лумпур|Куала-Лумпур
2|as|Bangladesh|Бангладеш|Бангладеш|Dhaka|Дакка|Дакка
2|as|Nepal|Непал|Непал|Kathmandu|Катманду|Катманду
2|af|Ethiopia|Эфиопия|Эфиопия|Addis Ababa|Аддис-Абеба|Аддис-Абеба
2|af|Ghana|Гана|Гана|Accra|Аккра|Аккра
2|af|Senegal|Сенегал|Сенегал|Dakar|Дакар|Дакар
2|af|Angola|Ангола|Ангола|Luanda|Луанда|Луанда
2|af|South Africa|ЮАР|Оңтүстік Африка Республикасы|Pretoria|Претория|Претория
2|na|Cuba|Куба|Куба|Havana|Гавана|Гавана
2|na|Jamaica|Ямайка|Ямайка|Kingston|Кингстон|Кингстон
2|sa|Colombia|Колумбия|Колумбия|Bogotá|Богота|Богота
2|sa|Venezuela|Венесуэла|Венесуэла|Caracas|Каракас|Каракас
2|sa|Uruguay|Уругвай|Уругвай|Montevideo|Монтевидео|Монтевидео
2|sa|Ecuador|Эквадор|Эквадор|Quito|Кито|Кито
2|sa|Paraguay|Парагвай|Парагвай|Asunción|Асунсьон|Асунсьон
3|eu|Slovakia|Словакия|Словакия|Bratislava|Братислава|Братислава
3|eu|Slovenia|Словения|Словения|Ljubljana|Любляна|Любляна
3|eu|Iceland|Исландия|Исландия|Reykjavík|Рейкьявик|Рейкьявик
3|eu|Albania|Албания|Албания|Tirana|Тирана|Тирана
3|eu|North Macedonia|Северная Македония|Солтүстік Македония|Skopje|Скопье|Скопье
3|eu|Bosnia and Herzegovina|Босния и Герцеговина|Босния және Герцеговина|Sarajevo|Сараево|Сараево
3|eu|Montenegro|Черногория|Черногория|Podgorica|Подгорица|Подгорица
3|eu|Malta|Мальта|Мальта|Valletta|Валлетта|Валлетта
3|as|Oman|Оман|Оман|Muscat|Маскат|Маскат
3|as|Lebanon|Ливан|Ливан|Beirut|Бейрут|Бейрут
3|as|Laos|Лаос|Лаос|Vientiane|Вьентьян|Вьентьян
3|as|Cambodia|Камбоджа|Камбоджа|Phnom Penh|Пномпень|Пномпень
3|as|Myanmar|Мьянма|Мьянма|Naypyidaw|Нейпьидо|Нейпьидо
3|as|Bhutan|Бутан|Бутан|Thimphu|Тхимпху|Тхимпху
3|as|Bahrain|Бахрейн|Бахрейн|Manama|Манама|Манама
3|af|Sudan|Судан|Судан|Khartoum|Хартум|Хартум
3|af|Libya|Ливия|Ливия|Tripoli|Триполи|Триполи
3|af|Madagascar|Мадагаскар|Мадагаскар|Antananarivo|Антананариву|Антананариву
3|af|Zimbabwe|Зимбабве|Зимбабве|Harare|Хараре|Хараре
3|af|Zambia|Замбия|Замбия|Lusaka|Лусака|Лусака
3|af|Uganda|Уганда|Уганда|Kampala|Кампала|Кампала
3|af|Cameroon|Камерун|Камерун|Yaoundé|Яунде|Яунде
3|af|Mali|Мали|Мали|Bamako|Бамако|Бамако
3|af|Namibia|Намибия|Намибия|Windhoek|Виндхук|Виндхук
3|af|Rwanda|Руанда|Руанда|Kigali|Кигали|Кигали
3|na|Costa Rica|Коста-Рика|Коста-Рика|San José|Сан-Хосе|Сан-Хосе
3|na|Honduras|Гондурас|Гондурас|Tegucigalpa|Тегусигальпа|Тегусигальпа
3|na|Nicaragua|Никарагуа|Никарагуа|Managua|Манагуа|Манагуа
3|sa|Guyana|Гайана|Гайана|Georgetown|Джорджтаун|Джорджтаун
3|sa|Suriname|Суринам|Суринам|Paramaribo|Парамарибо|Парамарибо
3|oc|Fiji|Фиджи|Фиджи|Suva|Сува|Сува
3|oc|Papua New Guinea|Папуа — Новая Гвинея|Папуа — Жаңа Гвинея|Port Moresby|Порт-Морсби|Порт-Морсби
`;

export const CONTINENTS = {
  eu: ['Europe', 'Европа', 'Еуропа'],
  as: ['Asia', 'Азия', 'Азия'],
  af: ['Africa', 'Африка', 'Африка'],
  na: ['North America', 'Северная Америка', 'Солтүстік Америка'],
  sa: ['South America', 'Южная Америка', 'Оңтүстік Америка'],
  oc: ['Australia and Oceania', 'Австралия и Океания', 'Аустралия және Мұхит аралдары'],
};

// Объекты для сравнения: английский|русский|казахский|число. Числа округлены; в одном вопросе
// значения отличаются заметно, поэтому разница в источниках не меняет ответа.

/** Вершины, высота в метрах. */
export const PEAKS = `
Everest|Эверест (Джомолунгма)|Эверест (Жомолунгма)|8849
K2 (Chogori)|Чогори (K2)|Чогори (K2)|8611
Aconcagua|Аконкагуа|Аконкагуа|6961
Denali|Денали|Денали|6190
Kilimanjaro|Килиманджаро|Килиманджаро|5895
Elbrus|Эльбрус|Эльбрус|5642
Mont Blanc|Монблан|Монблан|4806
Khan Tengri|Хан-Тенгри|Хан Тәңірі|7010
Ismoil Somoni Peak|пик Исмоила Сомони|Исмоил Сомони шыңы|7495
Belukha|Белуха|Мұзтау (Белуха)|4506
Mount Fuji|Фудзияма|Фудзи тауы|3776
Mount Kosciuszko|гора Косцюшко|Косцюшко тауы|2228
Mount Ararat|Арарат|Арарат|5137
Kazbek|Казбек|Қазбек|5054
Matterhorn|Маттерхорн|Маттерхорн|4478
Mount Olympus|Олимп|Олимп|2918
Talgar Peak|пик Талгар|Талғар шыңы|4979
`;

/** Реки, длина в километрах. */
export const RIVERS = `
Nile|Нил|Ніл|6650
Yangtze|Янцзы|Янцзы|6300
Lena|Лена|Лена|4400
Congo|Конго|Конго|4700
Mekong|Меконг|Меконг|4350
Volga|Волга|Еділ (Волга)|3530
Danube|Дунай|Дунай|2850
Irtysh|Иртыш|Ертіс|4248
Ural|Урал|Жайық|2428
Syr Darya|Сырдарья|Сырдария|2212
Rhine|Рейн|Рейн|1230
Thames|Темза|Темза|346
Ili|Или|Іле|1439
Dnieper|Днепр|Днепр|2201
Don|Дон|Дон|1870
Ganges|Ганг|Ганг|2525
Niger|Нигер|Нигер|4180
Seine|Сена|Сена|777
`;

/** Озёра, площадь в км². */
export const LAKES = `
Caspian Sea|Каспийское море|Каспий теңізі|371000
Lake Superior|Верхнее озеро|Жоғарғы көл|82100
Lake Victoria|озеро Виктория|Виктория көлі|68870
Lake Tanganyika|Танганьика|Танганьика көлі|32600
Lake Baikal|Байкал|Байкал көлі|31500
Lake Balkhash|Балхаш|Балқаш көлі|16400
Lake Ladoga|Ладожское озеро|Ладога көлі|17700
Lake Titicaca|Титикака|Титикака көлі|8372
Issyk-Kul|Иссык-Куль|Ыстықкөл|6236
Lake Onega|Онежское озеро|Онега көлі|9700
Lake Alakol|Алаколь|Алакөл|2650
Lake Geneva|Женевское озеро|Женева көлі|580
Lake Zaysan|Зайсан|Зайсан көлі|1810
`;

/** Площадь страны, тыс. км² (англ. название — из списка стран выше). */
export const AREA = `
Russia|17100
Canada|9985
China|9600
Brazil|8516
Australia|7692
India|3287
Kazakhstan|2725
Mongolia|1564
Iran|1648
Mexico|1964
Egypt|1002
Turkey|784
Ukraine|604
Spain|506
Japan|378
Germany|357
United Kingdom|243
Uzbekistan|449
Kyrgyzstan|200
Tajikistan|143
Italy|301
Peru|1285
Nigeria|924
Pakistan|882
Turkmenistan|488
Saudi Arabia|2150
`;

/** Население страны, млн человек (около 2024 года). */
export const POPULATION = `
India|1430
United States|335
Pakistan|240
Nigeria|224
Brazil|216
Bangladesh|173
Russia|144
Mexico|129
Japan|124
Ethiopia|126
Egypt|112
Philippines|117
Vietnam|99
Iran|89
Turkey|85
Germany|84
Thailand|72
United Kingdom|68
Italy|59
Kenya|55
South Korea|52
Spain|48
Argentina|46
Canada|39
Uzbekistan|36
Australia|26
Kazakhstan|20
Netherlands|18
Kyrgyzstan|7
Mongolia|3.4
New Zealand|5.2
`;

/** Области Казахстана и их центры: область en|ru|kk, центр en|ru|kk. */
export const KZ_REGIONS = `
Akmola Region|Акмолинская область|Ақмола облысы|Kokshetau|Кокшетау|Көкшетау
Aktobe Region|Актюбинская область|Ақтөбе облысы|Aktobe|Актобе|Ақтөбе
Almaty Region|Алматинская область|Алматы облысы|Konaev|Конаев|Қонаев
Atyrau Region|Атырауская область|Атырау облысы|Atyrau|Атырау|Атырау
East Kazakhstan Region|Восточно-Казахстанская область|Шығыс Қазақстан облысы|Oskemen|Усть-Каменогорск|Өскемен
Jambyl Region|Жамбылская область|Жамбыл облысы|Taraz|Тараз|Тараз
West Kazakhstan Region|Западно-Казахстанская область|Батыс Қазақстан облысы|Oral|Уральск|Орал
Karaganda Region|Карагандинская область|Қарағанды облысы|Karaganda|Караганда|Қарағанды
Kostanay Region|Костанайская область|Қостанай облысы|Kostanay|Костанай|Қостанай
Kyzylorda Region|Кызылординская область|Қызылорда облысы|Kyzylorda|Кызылорда|Қызылорда
Mangystau Region|Мангистауская область|Маңғыстау облысы|Aktau|Актау|Ақтау
Pavlodar Region|Павлодарская область|Павлодар облысы|Pavlodar|Павлодар|Павлодар
North Kazakhstan Region|Северо-Казахстанская область|Солтүстік Қазақстан облысы|Petropavl|Петропавловск|Петропавл
Turkistan Region|Туркестанская область|Түркістан облысы|Turkistan|Туркестан|Түркістан
Abai Region|область Абай|Абай облысы|Semey|Семей|Семей
Jetisu Region|область Жетысу|Жетісу облысы|Taldykorgan|Талдыкорган|Талдықорған
Ulytau Region|область Улытау|Ұлытау облысы|Jezkazgan|Жезказган|Жезқазған
`;

/** Соседи Казахстана по суше и страны, которые с ним не граничат. */
export const KZ_NEIGHBOURS = ['Russia', 'China', 'Kyrgyzstan', 'Uzbekistan', 'Turkmenistan'];
export const KZ_NOT_NEIGHBOURS = ['Tajikistan', 'Mongolia', 'Afghanistan', 'Iran', 'Azerbaijan', 'Pakistan', 'Ukraine', 'Georgia'];

K = {
 'season.title': ('Сезон «{name}»','Season “{name}”','«{name}» маусымы'),
 'season.kicker': ('Сезон месяца','Season of the month','Ай маусымы'),
 'season.tierOf': ('ступень {n} из {m}','tier {n} of {m}','{m} баспалдақтың {n}-сі'),
 'season.left': ('ещё {d} дн.','{d} days left','тағы {d} күн'),
 'season.ends': ('До конца сезона: {d} дн. {h} ч','Season ends in {d} d {h} h','Маусым соңына дейін: {d} күн {h} сағ'),
 'season.toNext': ('ещё {n} очков до ступени {k}','{n} points to tier {k}','{k}-баспалдаққа дейін тағы {n} ұпай'),
 'season.max': ('Все ступени пройдены — ты легенда сезона!','All tiers done — you are a season legend!','Барлық баспалдақ өтілді — сен маусым аңызысың!'),
 'season.claimAll': ('Забрать всё ({n})','Claim all ({n})','Барлығын алу ({n})'),
 'season.preview': ('Препи в эксклюзивах сезона','Prepi in this season’s exclusives','Препи маусым эксклюзивтерінде'),
 'season.road': ('Путь сезона','Season road','Маусым жолы'),
 'season.howPts': ('1 XP = 1 очко сезона','1 XP = 1 season point','1 XP = 1 маусым ұпайы'),
 'season.tier': ('Ступень {n}','Tier {n}','{n}-баспалдақ'),
 'season.exclusive': ('Эксклюзивы сезона','Season exclusives','Маусым эксклюзивтері'),
 'season.got': ('получено','owned','алынды'),
 'season.atTier': ('на ступени {n}','at tier {n}','{n}-баспалдақта'),
 'season.note': ('Эти вещи можно получить только в этом месяце. Новый сезон начинается 1-го числа; невзятые награды выдадим автоматически.','These items are only available this month. A new season starts on the 1st; unclaimed rewards are handed out automatically.','Бұл заттарды тек осы айда алуға болады. Жаңа маусым 1-күні басталады; алынбаған сыйлықтар автоматты түрде беріледі.'),
 'season.itemHint': ('Вещь уже в гардеробе — надень её Препи!','It’s in the wardrobe — put it on Prepi!','Зат гардеробта — оны Препиге кигіз!'),
 'season.tierUp': ('Новая ступень: {n}!','New tier: {n}!','Жаңа баспалдақ: {n}!'),
 'season.endTitle': ('Сезон закончился — награды выданы','The season ended — rewards delivered','Маусым аяқталды — сыйлықтар берілді'),
 'season.boxFree': ('Награда сезона — открыть бесплатно!','Season reward — open it for free!','Маусым сыйлығы — тегін аш!'),
 'season.allOwned': ('У тебя уже есть все вещи этой редкости — держи монеты!','You already own every item of this rarity — have some coins!','Сенде бұл сирек заттардың бәрі бар — тиын ал!'),
 'wear.bySeason': ('сезон «{name}»','season “{name}”','«{name}» маусымы'),
 'wear.frost': ('метель','blizzard','боран'),
 'wear.aurora': ('северное сияние','northern lights','солтүстік шұғыласы'),
 'wear.snowman': ('снеговик','snowman','аққала'),
 'wear.valentine': ('стрелы Амура','Cupid’s arrows','Амур жебелері'),
 'wear.rose': ('розовый','rose','раушан'),
 'wear.teddy': ('плюшевый мишка','teddy bear','ойыншық аю'),
 'wear.tulips': ('тюльпаны','tulips','қызғалдақтар'),
 'wear.spring': ('весенний','spring green','көктемгі'),
 'wear.bee': ('пчёлка','bee','ара'),
 'wear.planets': ('планеты','planets','планеталар'),
 'wear.nebula': ('туманность','nebula','тұмандық'),
 'wear.alien': ('инопланетянин','alien','бөтен планеталық'),
 'wear.daisies': ('ромашки','daisies','түймедақтар'),
 'wear.meadow': ('луговой','meadow','шалғын'),
 'wear.ladybug': ('божья коровка','ladybug','қызыл қоңыз'),
 'wear.suns': ('солнышки','little suns','күншуақтар'),
 'wear.lemonade': ('лимонад','lemonade','лимонад'),
 'wear.crab': ('крабик','crab','краб'),
 'wear.shells': ('ракушки','seashells','бақалшақтар'),
 'wear.lagoon': ('лагуна','lagoon','лагуна'),
 'wear.dolphin': ('дельфин','dolphin','дельфин'),
 'wear.fireworks': ('салют','fireworks','отшашу'),
 'wear.neon': ('неон','neon','неон'),
 'wear.lion': ('львёнок','lion cub','арыстан'),
 'wear.pencils': ('карандаши','pencils','қарындаштар'),
 'wear.chalk': ('меловой','chalk','бор'),
 'wear.bookworm': ('книжный червячок','bookworm','кітап құрты'),
 'wear.ghosts': ('привидения','ghosts','елестер'),
 'wear.pumpkin': ('тыквенный','pumpkin','асқабақ'),
 'wear.batpet': ('летучая мышка','little bat','жарқанат'),
 'wear.maple': ('кленовые листья','maple leaves','үйеңкі жапырақтары'),
 'wear.autumn': ('осенний','autumn','күзгі'),
 'wear.hedgehog': ('ёжик','hedgehog','кірпі'),
 'wear.gifts': ('подарки','gifts','сыйлықтар'),
 'wear.xmas': ('праздничный','festive','мерекелік'),
 'wear.reindeer': ('северный олень','reindeer','солтүстік бұғысы'),
}
p='/home/user/School/src/i18n/strings.js'
s=open(p).read()
parts=s.split("  'wear.rainbow':")
assert len(parts)==4
out=parts[0]
for lang,part in zip(['ru','en','kk'],parts[1:]):
    li={'ru':0,'en':1,'kk':2}[lang]
    nl=part.index('\n')+1
    add=''.join("  '%s': '%s',\n" % (k, v[li].replace("\\","\\\\").replace("'","\\'")) for k,v in K.items())
    out+="  'wear.rainbow':"+part[:nl]+add+part[nl:]
open(p,'w').write(out)
print(len(K))

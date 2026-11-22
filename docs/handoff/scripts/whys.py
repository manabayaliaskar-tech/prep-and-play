import re,sys
R={}
def sub(path, old, new):
    s=R.setdefault(path, open(path).read())
    if s.count(old)!=1: print('MISS',path,old[:70],s.count(old)); return
    R[path]=s.replace(old,new)
A='src/pools/math/arith.js'; G='src/pools/math/geometry.js'; AL='src/pools/math/algebra.js'; F='src/pools/math/fractions.js'
W=lambda v,en,ru,kk: f"why({v}, L({en!r}, {ru!r}, {kk!r}))"
# arith
sub(A,"...ask(ctx, a * b, [a * (b + 1), a * (b - 1), a * b + 2, a + b]),",
 "...ask(ctx, a * b, [a * (b + 1), a * (b - 1), "+W("a + b","You added the numbers instead of multiplying.","Ты сложил числа вместо того, чтобы умножить.","Сандарды көбейтудің орнына қостың.")+", a * b + 2]),")
sub(A,"...ask(ctx, ans, [(a + b) * c, a + b + c, ans + c, a * b + c]),",
 "...ask(ctx, ans, ["+W("(a + b) * c","You added first. Multiplication comes before addition.","Ты сначала сложил. Умножение выполняется раньше сложения.","Алдымен қостың. Көбейту қосудан бұрын орындалады.")+", a + b + c, ans + c, a * b + c]),")
sub(A,"...ask(ctx, ans, [b - a, -(a + b), ans - 1, ans + 2]),",
 "...ask(ctx, ans, ["+W("b - a","The difference is right, but the sign is lost: the subtrahend is larger, so the answer is negative.","Разность верная, но потерян знак: вычитаемое больше, поэтому ответ отрицательный.","Айырма дұрыс, бірақ таңба жоғалды: азайтқыш үлкен, сондықтан жауап теріс.")+", "+W("-(a + b)","You added the numbers. Here you subtract them and keep the minus.","Ты сложил числа. Здесь их нужно вычесть и оставить минус.","Сандарды қостың. Мұнда оларды азайтып, минусты қалдыру керек.")+", ans - 1, ans + 2]),")
sub(A,"...ask(ctx, ans, [-(a + b), a + b, -ans, ans + 1]),",
 "...ask(ctx, ans, ["+W("-(a + b)","A minus and a plus are different signs: subtract the smaller number from the larger one.","У чисел разные знаки: из большего модуля вычитают меньший, а не складывают.","Сандардың таңбасы әртүрлі: үлкен модульден кішісін азайтады, қоспайды.")+", a + b, "+W("-ans","The sign is wrong: the positive number is larger, so the answer is positive.","Ошибка в знаке: положительное число больше по модулю, поэтому ответ положительный.","Таңба қате: оң сан модулі бойынша үлкен, сондықтан жауап оң.")+", ans + 1]),")
# geometry
sub(G,"...ask(ctx, ans, [a * b, a + b, ans + 2, 2 * a + b].filter((v) => v !== ans)),",
 "...ask(ctx, ans, ["+W("a * b","That is the area. The perimeter is the sum of all sides.","Это площадь. Периметр — сумма всех сторон.","Бұл — аудан. Периметр — барлық қабырғалардың қосындысы.")+", "+W("a + b","You added only two sides. A rectangle has four.","Ты сложил только две стороны. У прямоугольника их четыре.","Тек екі қабырғаны қостың. Тіктөртбұрышта олар төртеу.")+", ans + 2, 2 * a + b].filter((v) => val(v) !== ans)),")
sub(G,"...ask(ctx, ans, [2 * (a + b), a + b, ans + a, ans - b].filter((v) => v !== ans)),",
 "...ask(ctx, ans, ["+W("2 * (a + b)","That is the perimeter. The area is length × width.","Это периметр. Площадь — длина × ширина.","Бұл — периметр. Аудан — ұзындық × ен.")+", a + b, ans + a, ans - b].filter((v) => val(v) !== ans)),")
sub(G,"...ask(ctx, c, [a + b, c + 1, c - 1, Math.abs(a - b) + c].filter((v) => v !== c)),",
 "...ask(ctx, c, ["+W("a + b","You added the legs. Add their squares and take the square root.","Ты сложил катеты. Нужно сложить их квадраты и извлечь корень.","Катеттерді қостың. Олардың квадраттарын қосып, түбір табу керек.")+", c + 1, c - 1, Math.abs(a - b) + c].filter((v) => val(v) !== c)),")
sub(G,"...ask(ctx, b, [c - a, c + a, b + 1, b - 1].filter((v) => v !== b && v > 0)),",
 "...ask(ctx, b, ["+W("c - a","You subtracted the lengths. Subtract the squares: b² = c² − a².","Ты вычел длины. Вычитать нужно квадраты: b² = c² − a².","Ұзындықтарды азайттың. Квадраттарды азайту керек: b² = c² − a².")+", c + a, b + 1, b - 1].filter((v) => val(v) !== b && val(v) > 0)),")
sub(G,"...ask(ctx, ans, [a + b, 360 - a - b, ans + 10, 90 - a].filter((v) => v !== ans && v > 0)),",
 "...ask(ctx, ans, ["+W("a + b","That is the sum of the two angles. The third one is 180° minus this sum.","Это сумма двух углов. Третий угол — 180° минус эта сумма.","Бұл — екі бұрыштың қосындысы. Үшінші бұрыш — 180° минус осы қосынды.")+", "+W("360 - a - b","The angles of a triangle add up to 180°, not 360°.","Сумма углов треугольника — 180°, а не 360°.","Үшбұрыш бұрыштарының қосындысы — 360° емес, 180°.")+", ans + 10, 90 - a].filter((v) => val(v) !== ans && val(v) > 0)),")
sub(G,"...ask(ctx, ans, [sides * 180, (sides - 1) * 180, 360, ans - 180].filter((v) => v !== ans)),",
 "...ask(ctx, ans, ["+W("sides * 180","The formula is (n − 2) × 180°, not n × 180°.","Формула — (n − 2) × 180°, а не n × 180°.","Формула — n × 180° емес, (n − 2) × 180°.")+", (sides - 1) * 180, "+W("360","360° is the sum of the exterior angles, not the interior ones.","360° — сумма внешних углов, а не внутренних.","360° — ішкі емес, сыртқы бұрыштардың қосындысы.")+", ans - 180].filter((v) => val(v) !== ans)),")
# algebra
sub(AL,"...ask(ctx, x, [(c + b) / a, c - b, -x, x + 2].filter(Number.isInteger)),",
 "...ask(ctx, x, ["+W("(c + b) / a","When a number moves to the other side, its sign changes. Here you kept it.","При переносе в другую часть знак числа меняется. Здесь он остался прежним.","Сан екінші жаққа өткенде таңбасы өзгереді. Мұнда ол өзгермеді.")+", "+W("c - b","You moved the number but forgot to divide by the coefficient of x.","Число перенесено верно, но ты забыл разделить на коэффициент при x.","Сан дұрыс көшірілді, бірақ x коэффициентіне бөлуді ұмыттың.")+", -x, x + 2].filter((v) => Number.isInteger(val(v)))),")
sub(AL,"...ask(ctx, ans, [a * k, a ** (k - 1), a ** (k + 1), ans + a]),",
 "...ask(ctx, ans, ["+W("a * k","You multiplied the base by the exponent. A power means multiplying the base by itself.","Ты умножил основание на показатель. Степень — это умножение основания само на себя.","Негізді көрсеткішке көбейттің. Дәреже — негізді өзіне-өзі көбейту.")+", "+W("a ** (k - 1)","One factor too few: count the multipliers again.","Одного множителя не хватает: пересчитай множители.","Бір көбейткіш жетпейді: көбейткіштерді қайта сана.")+", a ** (k + 1), ans + a]),")
sub(AL,"...ask(ctx, ans, [m * k - j, m + k + j, m * k, ans + 1].filter((v) => v !== ans)),",
 "...ask(ctx, ans, ["+W("m * k - j","When multiplying powers with the same base, exponents are added, not multiplied.","При умножении степеней с одинаковым основанием показатели складываются, а не умножаются.","Негіздері бірдей дәрежелерді көбейткенде көрсеткіштер көбейтілмейді, қосылады.")+", "+W("m + k + j","When dividing, the exponent is subtracted.","При делении показатель вычитается.","Бөлгенде көрсеткіш азайтылады.")+", m * k, ans + 1].filter((v) => val(v) !== ans)),")
# fractions
sub(F,"""      ...askFrac(ctx, [top, den], [
        [top, den * 2],""","""      ...askFrac(ctx, [top, den], [
        why([top, den * 2], L('You added the denominators too. With equal denominators, the denominator stays the same.', 'Ты сложил и знаменатели. При одинаковых знаменателях знаменатель не меняется.', 'Бөлімдерін де қостың. Бөлімдері бірдей болса, бөлім өзгермейді.')),""")
sub(F,"...ask(ctx, ans, [N / p, ans * 10, N - ans, ans + p].filter((v) => v !== ans && Number.isInteger(v))),",
 "...ask(ctx, ans, [N / p, "+W("ans * 10","The decimal point is in the wrong place: 1% is one hundredth, divide by 100.","Ошибка в 10 раз: 1% — это сотая часть, делить нужно на 100.","10 есе қате: 1% — жүзден бір бөлік, 100-ге бөлу керек.")+", "+W("N - ans","That is what remains after taking the percentage. The question asks for the percentage itself.","Это остаток после вычитания процентов. А спрашивают сами проценты.","Бұл — пайызды алып тастағаннан кейінгі қалдық. Ал сұрақ пайыздың өзі туралы.")+", ans + p].filter((v) => val(v) !== ans && Number.isInteger(val(v)))),")
sub(F,"...ask(ctx, ans, [(N * p) / 100, N + (up ? -1 : 1) * ((N * p) / 100), N + p, ans + 10].filter((v) => v !== ans)),",
 "...ask(ctx, ans, ["+W("(N * p) / 100","That is only the change. Add it to (or subtract it from) the old price.","Это только изменение цены. Его нужно прибавить к старой цене или вычесть из неё.","Бұл — тек бағаның өзгерісі. Оны ескі бағаға қосу немесе одан азайту керек.")+", N + (up ? -1 : 1) * ((N * p) / 100), "+W("N + p","You added the percentage as a number. First find what p% of the price is.","Ты прибавил проценты как обычное число. Сначала найди, сколько это от цены.","Пайызды қарапайым сан ретінде қостың. Алдымен оның бағадан қанша екенін тап.")+", ans + 10].filter((v) => val(v) !== ans)),")
sub(F,"...ask(ctx, orig, [(now * (100 + p)) / 100, now + p, orig + 20, orig - 20].filter((v) => v !== orig && Number.isInteger(v))),",
 "...ask(ctx, orig, ["+W("(now * (100 + p)) / 100","A common trap: adding p% back to the new price. The discount was taken from the old price, so divide by (100 − p)%.","Частая ловушка: прибавить p% к новой цене. Скидку считали от старой цены, поэтому делим на (100 − p)%.","Жиі тұзақ: жаңа бағаға p% қосу. Жеңілдік ескі бағадан есептелген, сондықтан (100 − p)%-ға бөлеміз.")+", now + p, orig + 20, orig - 20].filter((v) => val(v) !== orig && Number.isInteger(val(v)))),")
for p,s in R.items():
    # import why, val
    m=re.search(r"import \{([^}]*)\} from '\.\./gen\.js';", s)
    names=[x.strip() for x in m.group(1).split(',')]
    for x in ['why','val']:
        if x not in names: names.append(x)
    s=s.replace(m.group(0), "import { "+', '.join(sorted(names, key=str.lower))+" } from '../gen.js';")
    open(p,'w').write(s)

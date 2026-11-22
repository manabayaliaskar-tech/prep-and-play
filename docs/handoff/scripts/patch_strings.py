# Точечные правки src/i18n/strings.js: замена значений и добавление новых ключей по языкам.
# Запуск: python3 patch_strings.py <файл-с-правками.json>
import json
import re
import sys

PATH = '/home/user/School/src/i18n/strings.js'
spec = json.load(open(sys.argv[1], encoding='utf8'))

source = open(PATH, encoding='utf8').read()
bounds = {}
order = ['ru', 'en', 'kk']
for i, lang in enumerate(order):
    start = source.index(f'const {lang} = {{')
    end = source.index(f'const {order[i + 1]} = {{') if i + 1 < len(order) else len(source)
    bounds[lang] = (start, end)

def js_string(text):
    return "'" + text.replace('\\', '\\\\').replace("'", "\\'") + "'"

# Идём с конца файла, чтобы позиции блоков не сдвигались.
for lang in reversed(order):
    start, end = bounds[lang]
    block = source[start:end]
    for key, value in spec.get('set', {}).get(lang, {}).items():
        pattern = re.compile(r"^  '" + re.escape(key) + r"':\s*\n?\s*'(?:[^'\\]|\\.)*',$", re.M)
        line = f"  '{key}': {js_string(value)},"
        if pattern.search(block):
            block = pattern.sub(lambda _m: line, block, count=1)
        else:
            anchor = spec.get('after', {}).get(key) or spec.get('afterAll')
            anchor_pattern = re.compile(r"^  '" + re.escape(anchor) + r"':.*$", re.M)
            found = anchor_pattern.search(block)
            if not found:
                raise SystemExit(f'anchor {anchor} not found for {key} ({lang})')
            block = block[:found.end()] + '\n' + line + block[found.end():]
    for key in spec.get('remove', []):
        pattern = re.compile(r"^  '" + re.escape(key) + r"':\s*\n?\s*'(?:[^'\\]|\\.)*',\n", re.M)
        block, count = pattern.subn('', block, count=1)
        if not count:
            raise SystemExit(f'cannot remove {key} ({lang})')
    source = source[:start] + block + source[end:]

open(PATH, 'w', encoding='utf8').write(source)
print('patched', {lang: len(spec.get('set', {}).get(lang, {})) for lang in order}, 'removed', len(spec.get('remove', [])))

# Картинки эмодзи для сайта: python3 tools/emoji-images.py
# Находит все эмодзи в src/ и index.html, скачивает их объёмные версии из Fluent Emoji (Microsoft, MIT,
# https://github.com/microsoft/fluentui-emoji), сжимает в WebP 128×128 в icons/emoji/ и обновляет src/ui/emoji-list.js.
# Нужны: git, curl, Python с Pillow. Новые эмодзи на сайте - просто запустить скрипт ещё раз.

import glob, json, os, re, subprocess, tempfile, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'icons', 'emoji')
NODE_SCAN = r"""
const fs=require('fs'),path=require('path');const files=[];
const walk=d=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(/\.(js|html)$/.test(f))files.push(p);}};
walk(process.argv[1]+'/src');files.push(process.argv[1]+'/index.html');
const RE=/(?:\p{RI}\p{RI}|[#*0-9]️⃣|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)(?:[\u{1F3FB}-\u{1F3FF}])?(?:‍\p{Extended_Pictographic}️?(?:[\u{1F3FB}-\u{1F3FF}])?)*)/gu;
const s=new Set();for(const f of files)for(const m of fs.readFileSync(f,'utf8').matchAll(RE))s.add(m[0]);
console.log(JSON.stringify([...s]));
"""

def code(e):
    return '-'.join(f'{ord(c):x}' for c in e if c != '️')

def main():
    used = [e for e in json.loads(subprocess.check_output(['node', '-e', NODE_SCAN, ROOT], text=True)) if e != '🪙']
    tmp = tempfile.mkdtemp()
    repo = os.path.join(tmp, 'fe')
    subprocess.check_call(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', 'https://github.com/microsoft/fluentui-emoji', repo])
    subprocess.check_call(['git', 'sparse-checkout', 'set', '--no-cone', '/assets/*/metadata.json'], cwd=repo)
    subprocess.check_call(['git', 'checkout', '-q', 'main'], cwd=repo)
    norm = lambda s: s.replace('️', '')
    folders = {}
    for meta in glob.glob(os.path.join(repo, 'assets', '*', 'metadata.json')):
        folders[norm(json.load(open(meta))['glyph'])] = os.path.basename(os.path.dirname(meta))
    pngs = {}
    for p in subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=repo, text=True).split('\n'):
        if re.search(r'/3D/.*\.png$', p):
            f = p.split('/')[1]
            if f not in pngs or '/Default/' in p:
                pngs[f] = p
    os.makedirs(OUT, exist_ok=True)
    missing = []
    for e in used:
        f = folders.get(norm(e))
        if not f or f not in pngs:
            missing.append(e)
            continue
        out = os.path.join(OUT, code(e) + '.webp')
        if os.path.exists(out):
            continue
        raw = os.path.join(tmp, code(e) + '.png')
        subprocess.check_call(['curl', '-sS', '-f', '-o', raw, 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/' + urllib.parse.quote(pngs[f])])
        Image.open(raw).convert('RGBA').resize((128, 128), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
    codes = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.webp'))
    rows = [', '.join(f"'{c}'" for c in codes[i:i + 10]) for i in range(0, len(codes), 10)]
    with open(os.path.join(ROOT, 'src', 'ui', 'emoji-list.js'), 'w') as fh:
        fh.write('// Список эмодзи, для которых есть картинки в icons/emoji (Fluent Emoji 3D от Microsoft, лицензия MIT).\n'
                 '// Код - шестнадцатеричные коды символов через «-» без FE0F. Список пересоздаётся скриптом tools/emoji-images.py.\n\n'
                 'export const EMOJI_CODES = new Set([\n' + '\n'.join('  ' + r + ',' for r in rows) + '\n]);\n')
    print(f'картинок: {len(codes)}; нет в Fluent: {" ".join(missing) or "-"}')

if __name__ == '__main__':
    main()

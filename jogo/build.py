import glob, os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
page = open(os.path.join(SRC, 'page.html'), encoding='utf-8').read()
# a foto da tela de carregamento (o sobrevivente de mochila, a mesma do lobby em 21g_lobby_dados.js) vai direto no HTML:
# assim ela já está na página antes de o código do jogo rodar
import re
_lob = re.search(r'multi:"(data:image/jpeg;base64,[A-Za-z0-9+/=]+)"', open(os.path.join(SRC, '21g_lobby_dados.js'), encoding='utf-8').read())
page = page.replace('__IMG_CARGA__', _lob.group(1) if _lob else '')
# FONTES=caminho/fontes.css (só para testes fora do .exe): põe as fontes do jogo dentro da página, como o desktop/preparar.mjs faz
# no .exe (o arquivo vem do teste do Windows, junto com as fotos). Sem isso a página usa o link do Google Fonts, como sempre
if os.environ.get('FONTES'):
    _css = open(os.environ['FONTES'], encoding='utf-8').read()
    page = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', page)
    page = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]+">', lambda m: '<style>/* fontes do jogo dentro da página (teste) */\n' + _css + '</style>', page, count=1)
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(SRC, '*.js'))))
out = page.replace('/*__JS__*/', js)
SAIDA = os.environ.get('SAIDA')   # SAIDA=test_dev.html: só gera esse arquivo (para testar sem mexer no test.html nem no site)
dest = os.path.join(os.path.dirname(ROOT), 'vaydr.html')
if not SAIDA:
    open(dest, 'w', encoding='utf-8').write(out)
check = os.path.join(ROOT, 'check.js')
open(check, 'w', encoding='utf-8').write("(() => {\n'use strict';\n" + js + "\n})();\n")
r = subprocess.run(['node', '--check', check], capture_output=True, text=True)
if r.returncode:
    print(r.stderr); sys.exit(1)
skel = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open(os.path.join(ROOT, SAIDA or 'test.html'), 'w', encoding='utf-8').write(skel + out + '</body></html>')
if SAIDA:
    print('ok', SAIDA, len(out), 'bytes'); sys.exit(0)
# versão do site, instalável como aplicativo (PWA): pasta site/ ao lado do vaydr.html
sys.path.insert(0, ROOT)
import site_pwa
site_pwa.montar(out, skel, os.path.join(os.path.dirname(ROOT), 'site'))
print('ok', len(out), 'bytes')

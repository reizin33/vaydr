"""Traz do jogo antigo (jogo/src) o que as telas e o HUD do Godot usam:
- os ícones do HUD (os <symbol id="i-..."> do page.html), cada um como um SVG branco (o Godot pinta com a cor que quiser),
  em dados/hud/icones_svg.json (o jogo monta a textura na hora, no tamanho que precisar);
- as fotos do lobby (21g_lobby_dados.js: sozinho, multi, pers), em assets/telas/*.jpg;
- as dicas da tela de carregamento e do "Você sabia?" (texto), em dados/hud/dicas.json.
Rodar da pasta godot/: python3 tools/gerar_telas_antigas.py"""
import base64, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(RAIZ), 'jogo', 'src')

pag = open(os.path.join(SRC, 'page.html'), encoding='utf-8').read()
icones = {}
for nome, attrs, corpo in re.findall(r'<symbol id="i-([^"]+)"([^>]*)>(.*?)</symbol>', pag, re.S):
    vb = re.search(r'viewBox="([^"]+)"', attrs)
    vb = vb.group(1) if vb else '0 0 24 24'
    resto = re.sub(r'\s*viewBox="[^"]+"', '', attrs).strip()
    w, h = vb.split()[2:4]
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="%s" height="%s" viewBox="%s" %s>%s</svg>' % (w, h, vb, resto, corpo.strip())
    svg = svg.replace('currentColor', '#ffffff')
    svg = re.sub(r'\s+', ' ', svg)
    icones[nome] = svg
os.makedirs(os.path.join(RAIZ, 'dados', 'hud'), exist_ok=True)
json.dump(icones, open(os.path.join(RAIZ, 'dados', 'hud', 'icones_svg.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
print('ícones:', len(icones))

lob = open(os.path.join(SRC, '21g_lobby_dados.js'), encoding='utf-8').read()
os.makedirs(os.path.join(RAIZ, 'assets', 'telas'), exist_ok=True)
for nome, b64 in re.findall(r'(\w+):"data:image/jpeg;base64,([A-Za-z0-9+/=]+)"', lob):
    dado = base64.b64decode(b64)
    open(os.path.join(RAIZ, 'assets', 'telas', 'lobby_%s.jpg' % nome), 'wb').write(dado)
    print('foto do lobby:', nome, len(dado) // 1024, 'KB')

"""Sessão do jogo aberta para investigar e fotografar sem esperar o carregamento a cada pergunta.
Abre a página no Chromium (SwiftShader), entra num jogo novo e fica esperando comandos numa pasta:
  cada arquivo <id>.cmd.json = {"js": "código (corpo de função async; use return)"} ou {"foto": "nome", "espera": ms}
  a resposta vai para <id>.res.json. O cliente é tools/s.py.
Uso (na pasta jogo/): python3 tools/sessao.py pagina.html pasta_de_comandos"""
import sys, os, json, time, glob, traceback
from playwright.sync_api import sync_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG, PASTA = sys.argv[1], sys.argv[2]
os.makedirs(PASTA, exist_ok=True)
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)[:400]))
    pg.on('console', lambda m: erros.append('console: ' + m.text[:400]) if m.type == 'error' else None)
    pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
    t0 = time.time()
    pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
    pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
    pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
    pg.wait_for_timeout(400)
    pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
    pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
    pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
      try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
      window.__fixaY=null;window.__semZumbi=true;window.__cadaPasso=()=>{const n=__nnc;if(window.__fixaY!==null){n.P.y=window.__fixaY;n.P.vy=0;}if(window.__semZumbi)n.Z.length=0;n.P.vida=100;
        if(window.__hora!==undefined)n.G.hora=window.__hora;try{if(window.__limpo){n.G.clima.atual='limpo';n.G.clima.k=1;n.G.chuva=0;}}catch(e){}};window.__hora=10;window.__limpo=true;}""")
    log('jogo em %.0fs' % (time.time() - t0))
    open(os.path.join(PASTA, 'pronto'), 'w').write('%.0f' % (time.time() - t0))
    while True:
        cmds = sorted(glob.glob(os.path.join(PASTA, '*.cmd.json')))
        if not cmds:
            time.sleep(0.15); continue
        for c in cmds:
            rid = c[:-9]
            try:
                q = json.load(open(c))
            except Exception:
                time.sleep(0.1); continue
            os.remove(c)
            r = {}
            try:
                if q.get('sair'):
                    json.dump({'ok': 1}, open(rid + '.res.json', 'w')); b.close(); sys.exit(0)
                if 'js' in q:
                    r['v'] = pg.evaluate('async()=>{' + q['js'] + '\n}')
                if 'foto' in q:
                    pg.wait_for_timeout(q.get('espera', 1500))
                    caminho = q['foto'] if q['foto'].startswith('/') else BASE + 'shots/' + q['foto'] + '.png'
                    pg.screenshot(path=caminho, timeout=600000); r['foto'] = caminho
                if 'espera' in q and 'foto' not in q:
                    pg.wait_for_timeout(q['espera'])
            except Exception as e:
                r['erro'] = str(e)[:1500]
            if erros:
                r['erros_pagina'] = erros[:8]; erros.clear()
            try:
                txt = json.dumps(r, ensure_ascii=False, default=str)
            except Exception as e:   # resposta com referência circular etc.: não derruba a sessão
                txt = json.dumps({'erro': 'resposta não serializável: ' + str(e)[:200], 'texto': str(r)[:2000]}, ensure_ascii=False)
            open(rid + '.tmp', 'w').write(txt)
            os.replace(rid + '.tmp', rid + '.res.json')

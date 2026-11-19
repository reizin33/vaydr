"""Teste do combate na LAN (v10.7.1, a partir do lan_teste.py da v10.4.0): voadora, derrubada e pisão do convidado nos bonecos.
Antes: teste da LAN (v10.4.0): dois jogos no mesmo Chromium (um anfitrião e um convidado), ligados pelo servidor de verdade
(desktop/lan.js rodando no Node). Confere: entrar, ver o outro, zumbi do anfitrião caçando o convidado e batendo nele,
golpe do convidado chegando no zumbi do anfitrião, bonecos dos zumbis no convidado, bate-papo e sair. Tira fotos dos dois.
Uso (na pasta jogo/): python3 tools/lan_teste.py pagina.html [pasta_das_fotos]"""
import sys, os, json, time, subprocess
from playwright.sync_api import sync_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]
FOTOS = sys.argv[2] if len(sys.argv) > 2 else BASE + 'shots'
PORTA = 47811
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
R = {'passos': []}
def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)
def passo(nome, ok, info=None):
    R['passos'].append({'passo': nome, 'ok': bool(ok), 'info': info}); log(('OK ' if ok else 'FALHOU ') + nome, json.dumps(info, ensure_ascii=False)[:600] if info is not None else '')

srv = subprocess.Popen(['node', os.path.join(BASE, '..', 'desktop', 'lan.js'), str(PORTA)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
time.sleep(1.0)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=ARGS)
        pags = {}
        for nome in ('A', 'B'):
            ctx = b.new_context(viewport={'width': 1280, 'height': 720})
            ctx.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'medio',grafManual:true}))}catch(e){}")
            pg = ctx.new_page(); erros = []
            pg.on('pageerror', lambda e, er=erros: er.append(str(e)[:400]))
            pg.on('console', lambda m, er=erros: er.append('console: ' + m.text[:300]) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'ERR_' not in m.text else None)
            pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
            pags[nome] = (pg, erros)
        t0 = time.time()
        for nome, (pg, _) in pags.items():
            pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=1500000, polling=1000)
            log(nome, 'no menu em %.0fs' % (time.time() - t0))
        for nome, (pg, _) in pags.items():
            pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
            pg.wait_for_timeout(500)
            pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        for nome, (pg, _) in pags.items():
            pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=1500000, polling=500)
            pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;const t=document.getElementById('teclas');if(t)t.hidden=true;try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
              n.Z.length=0;window.__cadaPasso=()=>{const n=__nnc;n.P.vida=Math.max(n.P.vida,5);};window.__semRender=true;}""")
            log(nome, 'no jogo em %.0fs' % (time.time() - t0))
        A, eA = pags['A']; B, eB = pags['B']
        ev = lambda pg, code: pg.evaluate('(c)=>__nnc.ev(c)', code)
        ev(A, "(()=>{P.x=6;P.z=6;P.y=ground(6,6);P.yaw=P.body=Math.PI/2;return 1})()")
        ev(B, "(()=>{P.x=12;P.z=6;P.y=ground(12,6);P.yaw=P.body=0;return 1})()")
        ev(A, "(()=>{LAN.nome='Davi';lanConectar('ws://127.0.0.1:%d','anfitriao');return 1})()" % PORTA)
        A.wait_for_timeout(1500)
        ev(B, "(()=>{LAN.nome='Lucas';lanConectar('ws://127.0.0.1:%d','convidado');return 1})()" % PORTA)
        B.wait_for_timeout(3000)
        passo('os dois na partida', ev(A, "LAN.on&&LAN.jog.size===1") and ev(B, "LAN.on"), {'A': ev(A, "LAN.status"), 'B': ev(B, "LAN.status")})
        # zumbi do anfitrião na frente do convidado (parado, sem atacar)
        ev(A, "(()=>{const q=criarZ('walker',12,8.0);q.st='vaga';q.hp=300;q.hpMax=300;window.__zv=q.id;return q.id})()")
        B.wait_for_timeout(2500)
        pz = ev(B, "(()=>{const L=Z.filter(z=>z.lan);return L.map(z=>[+z.x.toFixed(1),+z.z.toFixed(1),z.st])})()")
        passo('o boneco aparece no convidado', len(pz) == 1, pz)
        # 1) voadora do convidado
        ev(B, "(()=>{const z=Z.find(q=>q.lan);P.x=z.x;P.z=z.z-1.6;P.y=ground(P.x,P.z);P.yaw=P.body=0;P.vx=P.vz=P.vy=0;P.noChao=true;P.acao=null;P.cd=0;P.energia=100;P.correndo=true;return comecarVoadora()})()")
        B.wait_for_timeout(1600)
        ha = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zv);return z?{st:z.st,hp:Math.round(z.hp),derr:LAN.info.derr||0,hits:LAN.info.hits}:null})()")
        passo('a voadora do convidado derruba o zumbi do anfitrião', ha and ha['st'] == 'derrubado' and ha['hits'] >= 1, ha)
        B.wait_for_timeout(800)
        pb = ev(B, "(()=>{const z=Z.find(q=>q.lan);return z?{st:z.st,lanSt:z.lanStAnt}:null})()")
        passo('o boneco do convidado cai junto', pb and pb['st'] == 'derrubado', pb)
        for pg, nome in ((B, 'lan_derrubado_convidado'),):
            pg.evaluate("()=>{window.__semRender=false;}"); pg.wait_for_timeout(2500)
            pg.screenshot(path=FOTOS + '/' + nome + '.png', timeout=600000); pg.evaluate("()=>{window.__semRender=true;}")
        # 2) pisão do convidado no boneco caído (se ainda estiver no chão; senão derruba de novo pelo anfitrião)
        ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zv);if(z&&z.st!=='derrubado')derrubarZ(z,0,0,6);else if(z)z.t=6;return 1})()")
        B.wait_for_timeout(1500)
        ps = ev(B, "(()=>{const z=Z.find(q=>q.lan);if(!z)return null;P.x=z.x;P.z=z.z-1.2;P.y=ground(P.x,P.z);P.yaw=P.body=0;P.acao=null;P.cd=0;P.energia=100;P.correndo=false;const c=zCaidoNaFrente();return{achou:!!c,st:z.st,comecou:c?comecarPisao(c):false}})()")
        B.wait_for_timeout(1500)
        hm = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zv);return z?{vivo:z.vivo,st:z.st,hp:Math.round(z.hp)}:null})()")
        passo('o pisão do convidado acaba com o zumbi caído', ps and ps['comecou'] and hm and not hm['vivo'], {'convidado': ps, 'anfitriao': hm})
        # 3) o anfitrião derruba e o zumbi levanta: o boneco levanta junto
        ev(A, "(()=>{const q=criarZ('walker',14,12);q.st='vaga';window.__z2=q.id;return 1})()")
        B.wait_for_timeout(2000)
        ev(A, "(()=>{const z=Z.find(q=>q.id===window.__z2);return derrubarZ(z,0,0,2.0)})()")
        B.wait_for_timeout(1200)
        c1 = ev(B, "(()=>{const z=Z.filter(q=>q.lan&&q.vivo).pop();return z?z.st:null})()")
        B.wait_for_timeout(4000)
        c2 = ev(B, "(()=>{const z=Z.filter(q=>q.lan&&q.vivo).pop();return z?{st:z.st,lev:+(z.levanta||0).toFixed(2)}:null})()")
        h2 = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__z2);return z?z.st:null})()")
        passo('derrubado pelo anfitrião: o boneco cai e levanta junto', c1 == 'derrubado' and c2 and c2['st'] != 'derrubado' and h2 != 'derrubado', {'caiu': c1, 'depois': c2, 'anfitriao': h2})
        R['erros'] = {'A': eA[:10], 'B': eB[:10]}
        passo('sem erro de página', not eA and not eB, R['erros'])
        b.close()
finally:
    srv.terminate()
    try:
        R['servidor'] = srv.communicate(timeout=5)[0][-1500:]
    except Exception:
        pass
R['ok'] = all(p['ok'] for p in R['passos'])
json.dump(R, open(os.path.join(BASE, 'logs', 'lan_combate.json'), 'w'), ensure_ascii=False, indent=1)
log('RESULTADO', 'OK' if R['ok'] else 'FALHOU')

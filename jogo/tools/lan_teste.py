"""Teste da LAN (v10.4.0): dois jogos no mesmo Chromium (um anfitrião e um convidado), ligados pelo servidor de verdade
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
        # lugares: os dois na clareira, a 6 m um do outro
        ev(A, "(()=>{P.x=6;P.z=6;P.y=ground(6,6);P.yaw=P.body=Math.PI/2;return 1})()")
        ev(B, "(()=>{P.x=12;P.z=6;P.y=ground(12,6);P.yaw=P.body=-Math.PI/2;return 1})()")
        # o convidado é uma mulher (personagem do MakeHuman); o anfitrião fica com o sobrevivente do jogo novo
        log('aparência B', ev(B, "(()=>{G.aparencia=aparLimpa({corpo:'mh',mh:Object.assign(mhPadrao('mulher'),{cabelo:'rabo'}),altura:1});survAplicar();const a=mhAp();return{corpo:a.corpo,mh:a.mh};})()"))
        ev(A, "(()=>{LAN.nome='Davi';lanConectar('ws://127.0.0.1:%d','anfitriao');return 1})()" % PORTA)
        A.wait_for_timeout(1500)
        ev(B, "(()=>{LAN.nome='Lucas';lanConectar('ws://127.0.0.1:%d','convidado');return 1})()" % PORTA)
        B.wait_for_timeout(3000)
        log('diag A', ev(A, "({on:LAN.on,st:LAN.status,erro:LAN.erro,ws:LAN.ws&&LAN.ws.readyState,info:LAN.info})"), 'B', ev(B, "({on:LAN.on,st:LAN.status,erro:LAN.erro,ws:LAN.ws&&LAN.ws.readyState,info:LAN.info})"))
        sa = ev(A, "({on:LAN.on,papel:LAN.papel,jog:[...LAN.jog.values()].map(q=>({nome:q.nome,ok:q.ok,m:q.m,x:+q.tx.toFixed(1),z:+q.tz.toFixed(1)}))})")
        sb = ev(B, "({on:LAN.on,papel:LAN.papel,host:LAN.hostNome,jog:[...LAN.jog.values()].map(q=>({nome:q.nome,anf:q.anf,ok:q.ok,x:+q.tx.toFixed(1),z:+q.tz.toFixed(1)})),zLocais:Z.filter(z=>!z.lan).length})")
        passo('os dois entraram e um vê o outro', sa['on'] and sb['on'] and any(j['nome'] == 'Lucas' and j['ok'] for j in sa['jog']) and any(j['nome'] == 'Davi' and j['ok'] for j in sb['jog']), {'A': sa, 'B': sb})
        passo('o convidado não tem zumbi dele', sb['zLocais'] == 0, sb['zLocais'])
        # cada um aparece com o personagem que criou (não o boneco dos sobreviventes)
        A.wait_for_timeout(1500)
        va = ev(A, "(()=>{lanAnima(0.05);lanAnima(0.05);return[...LAN.jog.values()].map(q=>({nome:q.nome,apG:q.ap&&q.ap.mh&&q.ap.mh.g,cabelo:q.ap&&q.ap.mh&&q.ap.mh.cabelo,mh:!!(q.ch&&q.ch.mh),g:q.ch&&q.ch.sk&&q.ch.sk.t&&q.ch.sk.t.mh&&q.ch.sk.t.mh.g,s:q.ch&&+q.ch.s.toFixed(3),loco:!!(q.ch&&q.ch.sk&&q.ch.sk.loco)}))})()")
        vb = ev(B, "(()=>{lanAnima(0.05);lanAnima(0.05);return[...LAN.jog.values()].map(q=>({nome:q.nome,mh:!!(q.ch&&q.ch.mh),g:q.ch&&q.ch.sk&&q.ch.sk.t&&q.ch.sk.t.mh&&q.ch.sk.t.mh.g,cabelo:q.ap&&q.ap.mh&&q.ap.mh.cabelo}))})()")
        passo('cada um aparece com o personagem que criou', any(v['mh'] and v['g'] == 'mulher' for v in va) and any(v['mh'] and v['g'] == 'homem' for v in vb), {'noAnfitriao': va, 'noConvidado': vb})
        for pg, nome in ((A, 'lan_anfitriao_ve'), (B, 'lan_convidado_ve')):
            pg.evaluate("()=>{window.__semRender=false;}"); pg.wait_for_timeout(3000)
            pg.screenshot(path=FOTOS + '/' + nome + '.png', timeout=600000); pg.evaluate("()=>{window.__semRender=true;}")
        # convidado tenta criar zumbi: não pode
        cz = ev(B, "(()=>{const q=criarZ('walker',20,20);return q?1:0})()")
        passo('criarZ no convidado não cria', cz == 0, cz)
        # zumbi do anfitrião perto do convidado
        ev(A, "(()=>{const q=criarZ('walker',13,12);q.st='caca';q.viu=0;q.lx=13;q.lz=6;window.__zLan=q.id;return q.id})()")
        B.wait_for_timeout(2500)
        pz = ev(B, "(()=>{const L=Z.filter(z=>z.lan);return{n:L.length,pos:L.map(z=>[+z.x.toFixed(1),+z.z.toFixed(1),z.st])}})()")
        hz = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zLan);return z?{x:+z.x.toFixed(1),z:+z.z.toFixed(1),st:z.st,hp:Math.round(z.hp)}:null})()")
        passo('o zumbi do anfitrião aparece no convidado', pz['n'] == 1 and hz and abs(pz['pos'][0][0] - hz['x']) < 3 and abs(pz['pos'][0][1] - hz['z']) < 3, {'convidado': pz, 'anfitriao': hz})
        vidaB0 = ev(B, "P.vida")
        B.wait_for_timeout(9000)
        hz2 = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zLan);return z?{x:+z.x.toFixed(1),z:+z.z.toFixed(1),st:z.st,hp:Math.round(z.hp)}:null})()")
        vidaB1 = ev(B, "P.vida"); danos = ev(B, "LAN.info.danos"); vidaA = ev(A, "P.vida")
        passo('o zumbi do anfitrião foi atrás do convidado (o mais perto) e bateu nele', danos > 0 and vidaB1 < vidaB0, {'zumbi': hz2, 'vidaConvidado': [vidaB0, vidaB1], 'danos': danos, 'vidaAnfitriao': vidaA})
        for pg, nome in ((A, 'lan_anfitriao'), (B, 'lan_convidado')):
            pg.evaluate("()=>{window.__semRender=false;}"); pg.wait_for_timeout(2500)
            pg.screenshot(path=FOTOS + '/' + nome + '.png', timeout=600000); pg.evaluate("()=>{window.__semRender=true;}")
        # golpe do convidado no boneco
        log('depois das fotos', ev(A, "({on:LAN.on,jog:LAN.jog.size})"), ev(B, "({on:LAN.on,bonecos:Z.filter(z=>z.lan).length,vida:P.vida,vivo:P.alive})"))
        hp0 = ev(A, "Math.round(Z.find(q=>q.id===window.__zLan).hp)")
        ev(B, "(()=>{const z=Z.find(q=>q.lan);if(z)ferirZ(z,30,0.5,0,false);return z?1:0})()")
        A.wait_for_timeout(800)
        hp1 = ev(A, "(()=>{const z=Z.find(q=>q.id===window.__zLan);return z?Math.round(z.hp):-1})()")
        passo('o golpe do convidado tira vida do zumbi do anfitrião', hp1 < hp0, {'antes': hp0, 'depois': hp1, 'hits': ev(A, 'LAN.info.hits')})
        # matar: o boneco morre no convidado
        ev(B, "(()=>{const z=Z.find(q=>q.lan);if(z)ferirZ(z,999,0,0,true);return z?1:0})()")
        B.wait_for_timeout(1500)
        mz = ev(B, "(()=>{const z=Z.find(q=>q.lan);return z?{vivo:z.vivo,st:z.st}:null})()")
        passo('o zumbi morre para os dois', mz is not None and not mz['vivo'], mz)
        # bate-papo
        ev(A, "(()=>{lanMandar({t:'chat',txt:'bora pro posto'});return 1})()")
        B.wait_for_timeout(600)
        ch = ev(B, "LAN.chat.map(c=>(c.nome||'')+': '+c.txt)")
        passo('bate-papo chega', any('bora pro posto' in c for c in ch), ch)
        # /ir: o convidado vai para o lado do anfitrião (no mundo dele)
        ev(B, "(()=>{P.alive=true;P.vida=100;if(G.modo!=='jogo')G.modo='jogo';P.x=60;P.z=-30;P.y=ground(60,-30);lanComando('/ir');return 1})()")
        di = ev(B, "(()=>{const q=[...LAN.jog.values()].find(j=>j.anf);return{d:+Math.hypot(P.x-q.tx,P.z-q.tz).toFixed(2),msg:LAN.chat.slice(-1)[0].txt}})()")
        passo('/ir leva o convidado para o lado do anfitrião', di['d'] < 3, di)
        # o anfitrião abre a mochila: o mundo dele continua (o zumbi anda)
        ev(A, "(()=>{const q=criarZ('walker',18,6);q.st='caca';q.viu=0;window.__z2=q.id;return 1})()")
        A.wait_for_timeout(500)
        x0 = ev(A, "Z.find(q=>q.id===window.__z2).x")
        ev(A, "(()=>{abrirMochila();return G.modo})()")
        A.wait_for_timeout(3000)
        x1 = ev(A, "Z.find(q=>q.id===window.__z2).x"); modo = ev(A, "G.modo")
        ev(A, "(()=>{fecharMochila();return 1})()")
        passo('com o anfitrião na mochila, o zumbi continua andando', abs(x1 - x0) > 0.3 and modo == 'mochila', {'x': [x0, x1], 'modo': modo})
        # o convidado sai
        ev(B, "(()=>{lanDesligar(false);return 1})()")
        A.wait_for_timeout(1200)
        nA = ev(A, "LAN.jog.size"); nZB = ev(B, "Z.filter(z=>z.lan).length")
        passo('o convidado saiu: o anfitrião fica sozinho e o convidado volta ao mundo dele', nA == 0 and nZB == 0, {'jogadoresNoAnfitriao': nA, 'bonecosNoConvidado': nZB})
        # entra de novo e o anfitrião fecha
        ev(B, "(()=>{lanConectar('ws://127.0.0.1:%d','convidado');return 1})()" % PORTA)
        B.wait_for_timeout(2500)
        ev(A, "(()=>{lanDesligar(false);return 1})()")
        B.wait_for_timeout(1500)
        sb2 = ev(B, "({on:LAN.on,bonecos:Z.filter(z=>z.lan).length})")
        passo('o anfitrião fechou: o convidado sai da partida', not sb2['on'] and sb2['bonecos'] == 0, sb2)
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
json.dump(R, open(os.path.join(BASE, 'logs', 'lan_teste.json'), 'w'), ensure_ascii=False, indent=1)
log('RESULTADO', 'OK' if R['ok'] else 'FALHOU')

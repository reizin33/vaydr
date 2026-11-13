"""Teste do sobrevivente no jogo (62z_sobrevivente.js): fotos em terceira pessoa (parado de frente, andando, correndo de lado,
agachado andando, no meio do pulo, com o machado andando) e em primeira pessoa, com o estado da animação de cada uma.
Uso (na pasta jogo/): python3 tools/p257_sobrevivente_fotos.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'surv'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        print('menu em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';n.cfg.graf='alto';
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;__nnc.P.energia=100;__nnc.P.fome=100;__nnc.P.sede=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}""")
        await pg.wait_for_timeout(1500)
        info = await pg.evaluate("()=>{const n=__nnc,X=s=>n.ev(s),ch=n.P.ch;return{surv:!!ch.surv,proc:!!ch.proc,tipo:ch.sk&&ch.sk.t.nome,pronto:!!(X('SKT').surv&&X('SKT').surv.pronto),clipes:Object.keys(X('SKA')).filter(k=>k[0]==='s').length,s:ch.s}}")
        print('personagem', json.dumps(info), flush=True)
        async def lugar(x, z, yaw, body=None, cam='3', pitch=0.08):
            await pg.evaluate("""([x,z,yaw,body,cam,pitch])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=yaw;P.body=body===null?yaw:body;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, yaw, body, cam, pitch])
        async def estado():
            return await pg.evaluate("()=>{const n=__nnc,S=n.ev('SURV'),L=n.P.ch.sk&&n.P.ch.sk.loco;return{estado:S.estado,w:L?+L.w.toFixed(2):null,v:+Math.hypot(n.P.vx,n.P.vz).toFixed(2),agachado:!!n.P.agachado,noChao:n.P.noChao}}")
        async def foto(nome):
            st = await estado(); await pg.screenshot(path=BASE + 'shots/p257_' + PRE + '_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(st), '%.0fs' % (time.time() - t0), flush=True)
        # 1) parado, de frente para a câmera
        await lugar(6.0, 18.0, 3.14159, 0.0); await pg.wait_for_timeout(5000); await foto('frente_parado')
        # 2) andando (de costas para a câmera): devagar = sem correr; o passo normal do jogo
        await lugar(6.0, 18.0, 0.0); await pg.wait_for_timeout(3000)
        await pg.keyboard.down('w'); await pg.wait_for_timeout(1600); await foto('andando'); await pg.keyboard.up('w'); await pg.wait_for_timeout(800)
        # 3) correndo para a direita (a câmera vê o lado)
        await lugar(6.0, 30.0, 0.0); await pg.wait_for_timeout(2500)
        await pg.keyboard.down('Shift'); await pg.keyboard.down('d'); await pg.wait_for_timeout(1500); await foto('correndo_lado')
        await pg.keyboard.up('d'); await pg.keyboard.up('Shift'); await pg.wait_for_timeout(800)
        # 4) agachado andando para a esquerda (vê o outro lado)
        await lugar(6.0, 18.0, 0.0); await pg.wait_for_timeout(2500); await pg.keyboard.press('c'); await pg.wait_for_timeout(600)
        await pg.keyboard.down('a'); await pg.wait_for_timeout(1500); await foto('agachado_andando'); await pg.keyboard.up('a'); await pg.keyboard.press('c'); await pg.wait_for_timeout(800)
        # 5) pulo (foto no ar)
        await lugar(6.0, 18.0, 0.0, 1.2); await pg.wait_for_timeout(2500); await pg.keyboard.press('Space'); await pg.wait_for_timeout(180); await foto('pulo')
        await pg.wait_for_timeout(1500)
        # 6) com o machado, andando na diagonal
        await pg.evaluate("()=>{const n=__nnc,P=n.P;P.inv[0]={id:'machado',n:1,dur:170};P.sel=0;n.ev('hudBarra')();}")
        await lugar(6.0, 18.0, 0.0); await pg.wait_for_timeout(2500)
        await pg.keyboard.down('w'); await pg.keyboard.down('d'); await pg.wait_for_timeout(1500); await foto('machado_andando'); await pg.keyboard.up('d'); await pg.keyboard.up('w'); await pg.wait_for_timeout(800)
        # 7) primeira pessoa olhando para baixo (braço, machado e a sombra do corpo)
        await lugar(6.0, 18.0, 2.4, None, '1', -0.55); await pg.wait_for_timeout(4000); await foto('primeira_pessoa')
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

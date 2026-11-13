"""Conferência "sem árvore de bola e cone" (62y_mata.js e 62ya_mata_chao.js): a clareira do mesmo jeito da foto do dono, um
panorama do alto (árvores de longe), uma gigante de perto, uma árvore de fruta de sítio, moitas, e a clareira no gráfico Baixo.
Uso (na pasta jogo/): python3 tools/p258_sem_bolas.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'sb'
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
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';n.cfg.graf='alto';
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}if(window.__yFixo!==undefined){__nnc.P.y=window.__yFixo;__nnc.P.vy=0;}};}""")
        alvos = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),G=X('GIGANTES'),F=X('FRUTEIRAS'),B=X('BUSHES').filter(b=>!b.agua&&b.alive!==false);
          const perto=(L,x,z)=>L.slice().sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
          const g=perto(G,0,0),f=perto(F,60,-80),m=perto(B,8,20);return{g:g&&{x:g.x,z:g.z,H:g.H},f:f&&{x:f.x,z:f.z},m:m&&{x:m.x,z:m.z},n:{gigantes:G.length,fruteiras:F.length,moitas:B.length}}}""")
        print('alvos', json.dumps(alvos), flush=True)
        async def lugar(x, z, tx, tz, pitch=0.05, cam='3', alto=None, body=None):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam,alto,body])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;P.x=x;P.z=z;P.y=X('ground')(x,z)+(alto||0);P.vx=P.vz=P.vy=0;P.noChao=!alto;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=body===null?P.yaw:body;P.pitch=pitch;window.__yFixo=alto?P.y:undefined;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam, alto, body])
        async def foto(nome, espera=9000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(2500)
            st = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),V=X('MATAV'),M=X('MCH');let n=0,l=0;for(const e of V.esp)for(const L of e.lods)for(const q of L)n+=q.m.n;if(V.longe)for(const q of V.longe.m)l+=q.n;
              return{especies_perto:n,placas_longe:l,extra:V.nExtra,restoPinho:V.restoP?V.restoP.n:null,restoRedonda:V.restoR.n,moitas:(M.moitas||[]).reduce((s,v)=>s+v.ms[0].n,0),pronta:X('mataProntas')(),graf:__nnc.cfg.graf}}""")
            await pg.screenshot(path=BASE + 'shots/p258_' + PRE + '_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(st), '%.0fs' % (time.time() - t0), flush=True)
        await lugar(6.0, 18.0, 6.0, 6.0, 0.05, '3', None, 0.0); await foto('clareira')        # como a foto do dono: olhando para a barraca, ele de frente
        await lugar(-10.0, 30.0, -80.0, -60.0, -0.22, '1', 34.0); await foto('panorama')       # primeira pessoa (no alto ele ficaria no ar)
        if alvos['g']:
            g = alvos['g']; await lugar(g['x'] + 16, g['z'] + 4, g['x'], g['z'], 0.32); await foto('gigante')
        if alvos['f']:
            f = alvos['f']; await lugar(f['x'] + 6, f['z'] + 3, f['x'], f['z'], 0.12); await foto('fruteira')
        if alvos['m']:
            m = alvos['m']; await lugar(m['x'] + 3.5, m['z'] + 1.5, m['x'], m['z'], -0.05); await foto('moita')
        await pg.evaluate("()=>{const n=__nnc;n.cfg.graf='baixo';n.aplicarCfg&&n.aplicarCfg();}")
        await lugar(6.0, 18.0, 6.0, 6.0, 0.05, '3', None, 0.0); await foto('clareira_baixo')
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

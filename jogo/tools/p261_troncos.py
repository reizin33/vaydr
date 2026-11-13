"""Conferência dos troncos e galhos novos da mata (tools/mata_banco.py de 13/11: normais da malha original e galhos que não
viram fita): as duas vistas das fotos do sobrevivente onde o tronco parecia papel dobrado, uma árvore de cada espécie de perto
(primeira pessoa) e uma gigante. Uso (na pasta jogo/): python3 tools/p261_troncos.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'tr'
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
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}""")
        async def lugar(x, z, tx, tz, pitch=0.05, cam='3', body=None):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam,body])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=body===null?P.yaw:body;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam, body])
        async def foto(nome, espera=8000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(2500)
            st = await pg.evaluate("()=>{const X=s=>__nnc.ev(s),V=X('MATAV');return{pronta:X('mataProntas')(),info:V.info&&V.info.especies.map(e=>e.id+':'+e.tri.join('/'))}}")
            await pg.screenshot(path=BASE + 'shots/p261_' + PRE + '_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(st), '%.0fs' % (time.time() - t0), flush=True)
        # 1 e 2) as vistas das fotos do sobrevivente (andando e correndo de lado)
        await lugar(6.0, 18.0, 6.0, 40.0, 0.08); await foto('vista_andando')
        await lugar(6.0, 30.0, 6.0, 52.0, 0.08); await foto('vista_correndo')
        # 3) uma árvore de cada espécie perto da clareira, de 7 m, em primeira pessoa
        alvos = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),M=X('MESH').roundN,V=X('MATAV'),me=X('mataEsp'),out={};
          for(let i=0;i<M.n;i++){const o=i*8,x=M.arr[o],z=M.arr[o+2],e=V.esp[me(x,z)].id,d=Math.hypot(x-6,z-18);if(d<8)continue;
            if(!out[e]||d<out[e].d)out[e]={x,z,d:+d.toFixed(1),s:+M.arr[o+4].toFixed(2)};}return out;}""")
        print('alvos', json.dumps(alvos), flush=True)
        for e, a in sorted(alvos.items()):
            dx, dz = 6.0 - a['x'], 18.0 - a['z']; L = max(0.1, (dx * dx + dz * dz) ** 0.5); k = 7.0 / L
            await lugar(a['x'] + dx * k, a['z'] + dz * k, a['x'], a['z'], 0.18, '1'); await foto('especie_' + e)
        # 4) uma gigante (madeira dela + copa de jacarandá)
        g = await pg.evaluate("()=>{const G=__nnc.ev('GIGANTES');const g=G.slice().sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];return g&&{x:g.x,z:g.z};}")
        if g: await lugar(g['x'] + 16, g['z'] + 4, g['x'], g['z'], 0.32); await foto('gigante')
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

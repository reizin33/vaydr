"""Fotos de antes e depois da mata nova (62y_mata.js): a clareira e a mata em volta, de dia, no fim da tarde e em primeira pessoa.
Uso (na pasta jogo/): python3 tools/p256_mata_fotos.py pagina.html prefixo   (ex.: x_rel.html antes / x_mata.html depois)"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'mata'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# nome, x, z, para onde olha (x, z), hora, câmera, inclinação
VISTAS = [('clareira', 6.0, 18.0, -6.0, -22.0, 10.0, '3', 0.03),
          ('mata', 18.0, -30.0, 40.0, -62.0, 10.5, '3', 0.06),
          ('mata_1p', 30.0, -46.0, 55.0, -70.0, 11.0, '1', 0.12),
          ('fim_de_tarde', -22.0, 30.0, -50.0, 55.0, 17.4, '3', 0.05),
          ('borda_serra', -112.0, -52.0, -150.0, -98.0, 10.0, '3', 0.08)]
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
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';n.cfg.graf='alto';try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}")
        info = await pg.evaluate("()=>{try{return __nnc.ev('MATAV').info}catch(e){return null}}")
        print('mata', json.dumps(info), flush=True)
        for nome, x, z, tx, tz, hora, cam, pit in VISTAS:
            await pg.evaluate("""([x,z,tx,tz,hora,cam,pit])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.G.hora=hora;n.cfg.cam=cam;n.Z.length=0;
              P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pit;
              X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, hora, cam, pit])
            await pg.wait_for_timeout(9000)
            await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);}")
            await pg.wait_for_timeout(3000)
            await pg.screenshot(path=BASE + 'shots/p256_' + PRE + '_' + nome + '.png', timeout=600000)
            st = await pg.evaluate("()=>{const n=__nnc;let m=null;try{const V=n.ev('MATAV');m={ok:V.ok,longe:!!V.longe,prontas:n.ev('mataProntas')(),n:V.esp.map(e=>e.lods.map(L=>L[0].m.n))}}catch(e){}return{x:+n.P.x.toFixed(1),z:+n.P.z.toFixed(1),mata:m}}")
            print('foto', nome, json.dumps(st), '%.0fs' % (time.time() - t0), flush=True)
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

"""Diagnóstico das manchas brancas no chão da mata: a mesma vista (perto da moita ao sul da clareira) com tudo, sem os galhos
secos, sem as samambaias novas e sem a folhagem nova do chão. Uso: python3 tools/p260_branco.py pagina.html"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 960, 'height': 540})
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='1';n.cfg.graf='alto';
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;}catch(e){}};
          const P=n.P,X=s=>n.ev(s);P.x=17.2;P.z=31.6;P.y=X('ground')(17.2,31.6);P.yaw=Math.atan2(13.7-17.2,30.07-31.6)+0.35;P.body=P.yaw;P.pitch=-0.18;X('rebuildVeg')(true);X('rebuildGrass')();}""")
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.wait_for_timeout(12000)
        casos = [('tudo_v6', "()=>{}")]
        for nome, js in casos:
            await pg.evaluate(js); await pg.wait_for_timeout(1500)
            info = await pg.evaluate("()=>{const X=s=>__nnc.ev(s);return{mch:X('MCH').ok,mata:X('MATAV').ok,grama:X('GRAMA').ok}}")
            await pg.screenshot(path=BASE + 'shots/p260b_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(info), '%.0fs' % (time.time() - t0), flush=True)
        await b.close()
asyncio.run(main())

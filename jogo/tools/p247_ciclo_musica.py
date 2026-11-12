"""Confere as pausas da trilha calma: começa tocando, some quando o ciclo vira e volta na hora com um tema (ou perigo).
Uso (na pasta jogo/): SAIDA=t_som.html python3 build.py && python3 tools/p247_ciclo_musica.py t_som.html"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 960, 'height': 540}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + (sys.argv[1] if len(sys.argv) > 1 else 'test.html') + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        await pg.evaluate("()=>{window.__semRender=true;document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        await pg.evaluate("async()=>{const n=__nnc;n.ev('audioInit')();const c=n.ev('AU').ctx;if(c.state!=='running')await c.resume();n.G.hora=10;n.Z.length=0;}")
        r = {}
        await pg.wait_for_timeout(3000)
        r['comeco'] = await pg.evaluate("()=>{const A=__nnc.ev('AU');return{tem:!!A.musCiclo,ligado:A.cicloOn,ganho:+A.musCiclo.gain.value.toFixed(2)}}")
        await pg.evaluate("()=>{__nnc.ev('AU').cicloT=0.001;}")
        await pg.wait_for_timeout(14000)
        r['pausa_14s'] = await pg.evaluate("()=>{const A=__nnc.ev('AU');return{ligado:A.cicloOn,ganho:+A.musCiclo.gain.value.toFixed(3),proxima_s:Math.round(A.cicloT)}}")
        await pg.evaluate("()=>{__nnc.ev('AU').temaT=7;}")
        await pg.wait_for_timeout(2500)
        r['tema_2s'] = await pg.evaluate("()=>{const A=__nnc.ev('AU');return{ganho:+A.musCiclo.gain.value.toFixed(2)}}")
        r['erros'] = erros[:5]
        ok = r['comeco']['tem'] and r['comeco']['ganho'] > 0.9 and r['pausa_14s']['ganho'] < 0.1 and r['tema_2s']['ganho'] > 0.8 and not erros
        r['resultado'] = 'PASSOU' if ok else 'FALHOU'
        print(json.dumps(r, ensure_ascii=False)); await b.close()
asyncio.run(main())

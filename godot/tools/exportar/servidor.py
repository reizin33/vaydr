"""Deixa o VAYDR antigo aberto num Chromium sem tela e responde pedidos: cada arquivo <nome>.js que aparecer na pasta
de pedidos é rodado dentro do jogo (com __nnc.ev, que enxerga tudo do jogo) e a resposta vai para <nome>.json.
Se a resposta for {"__bin__": [números...]} ou trouxer chaves "__f32__"/"__u8__" com base64, quem pediu decodifica.
Uso: python3 servidor.py <pagina.html> <pasta_pedidos>"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]


async def main(pagina, pasta):
    os.makedirs(pasta, exist_ok=True)
    t0 = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        ctx = await b.new_context(viewport={'width': 640, 'height': 360})
        pg = await ctx.new_page()
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)))
        await pg.goto('file://' + pagina + '#teste', wait_until='domcontentloaded', timeout=600000)
        await pg.wait_for_function("typeof __nnc!=='undefined'", timeout=600000, polling=500)
        try:
            await pg.wait_for_function("()=>window.__bootFeito!==false", timeout=1200000, polling=1000)
        except Exception as e:
            print('montagem não terminou:', e, flush=True)
        print('PRONTO em %.0f s' % (time.time() - t0), flush=True)
        open(os.path.join(pasta, 'PRONTO'), 'w').write('ok')
        while True:
            pedidos = sorted(f for f in os.listdir(pasta) if f.endswith('.js'))
            for f in pedidos:
                caminho = os.path.join(pasta, f)
                js = open(caminho, encoding='utf-8').read()
                os.remove(caminho)
                t1 = time.time()
                try:
                    r = await pg.evaluate("(js)=>{try{return __nnc.ev(js)}catch(e){return {erro:String(e)+' '+(e.stack||'')}}}", js)
                except Exception as e:
                    r = {'erro': 'evaluate: ' + str(e)}
                saida = os.path.join(pasta, f[:-3] + '.json')
                with open(saida + '.tmp', 'w', encoding='utf-8') as g:
                    json.dump(r, g, ensure_ascii=False)
                os.replace(saida + '.tmp', saida)
                print('%s: %.1f s, %d KB' % (f, time.time() - t1, os.path.getsize(saida) // 1024), flush=True)
            if os.path.exists(os.path.join(pasta, 'PARAR')):
                break
            await asyncio.sleep(0.3)
        await b.close()

asyncio.run(main(sys.argv[1], sys.argv[2]))

"""Abre o VAYDR antigo (página montada pelo jogo/build.py) num Chromium sem tela e roda expressões no jogo.
Uso: python3 sonda.py <pagina.html> <arquivo_com_js> [saida.json]
O JS recebe o jogo pronto (depois da montagem do mundo) e deve devolver algo serializável."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]


async def main(pagina, arq_js, saida):
    js = open(arq_js, encoding='utf-8').read()
    t0 = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        ctx = await b.new_context(viewport={'width': 640, 'height': 360})
        pg = await ctx.new_page()
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)))
        await pg.goto('file://' + pagina + '#teste', wait_until='domcontentloaded', timeout=600000)
        await pg.wait_for_function("typeof __nnc!=='undefined'", timeout=600000, polling=500)
        print('jogo carregado em %.0f s' % (time.time() - t0), flush=True)
        try:
            await pg.wait_for_function("()=>window.__bootFeito!==false", timeout=900000, polling=1000)
        except Exception as e:
            print('montagem não terminou:', e, flush=True)
        print('montagem do mundo em %.0f s' % (time.time() - t0), flush=True)
        r = await pg.evaluate("(js)=>{try{return __nnc.ev(js)}catch(e){return {erro:String(e)+' '+(e.stack||'')}}}", js)
        if saida:
            with open(saida, 'w', encoding='utf-8') as f:
                json.dump(r, f, ensure_ascii=False)
            print('gravado', saida, len(json.dumps(r)) // 1024, 'KB')
        else:
            print(json.dumps(r, ensure_ascii=False)[:4000])
        if erros:
            print('erros da página:', erros[:5])
        await b.close()

asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None))

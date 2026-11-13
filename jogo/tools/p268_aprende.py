# p268: a barra de carregamento aprende o tempo das etapas neste computador.
# Abre a página duas vezes na mesma janela (o que fica guardado continua) e confere: na 1ª vez usa o peso de fábrica
# (__etapasAprendidas false) e guarda os tempos; na 2ª usa os tempos guardados (true).
# Uso: SRC=x_carga2.html python3 tools/p268_aprende.py
import asyncio, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = os.environ.get('SRC', 'x_carga2.html')
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def uma(pg, rotulo):
    await pg.wait_for_function("window.__bootFeito===true", timeout=1800000, polling=250)
    r = await pg.evaluate("({aprendeu:window.__etapasAprendidas,etapas:(window.__etapasTempo||[]).length,total_ms:window.__etapasTotal,guardado:!!localStorage.getItem('vaydr_carga_v1')})")
    print(rotulo, json.dumps(r, ensure_ascii=False), flush=True)
    return r
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        ctx = await b.new_context(viewport={'width': 960, 'height': 540})
        pg = await ctx.new_page()
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        a = await uma(pg, '1ª vez')
        await pg.reload(wait_until='domcontentloaded', timeout=180000)
        c = await uma(pg, '2ª vez')
        ok = a['aprendeu'] is False and c['aprendeu'] is True and c['guardado']
        print('RESULTADO', 'ok' if ok else 'FALHOU', 'erros na página:', erros)
        await b.close()
asyncio.run(main())

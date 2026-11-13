# p266: uma foto da tela de carregamento no meio da montagem, em 1920x1080 (o tamanho da imagem aprovada), e fecha.
# Uso: SRC=x_carga_fontes.html python3 tools/p266_carga_foto.py saida.png [marca, padrão 0.55]
import asyncio, os, sys, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = os.environ.get('SRC', 'x_carga2.html')
SAIDA = sys.argv[1]
MARCA = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        pg = await b.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("(m)=>typeof window.__cargaPct==='number'&&window.__cargaPct>=m", arg=MARCA, timeout=900000, polling=50)
        await pg.screenshot(path=SAIDA, timeout=600000)
        st = await pg.evaluate("({pct:Math.round(window.__cargaPct*100),etapa:window.__cargaEtapa,fontes:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).slice(0,8)})")
        print(json.dumps(st, ensure_ascii=False))
        await b.close()
asyncio.run(main())

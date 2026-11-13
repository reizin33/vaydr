# p265: a tela de carregamento nova (10.2.1) dentro do jogo de verdade, sem montagem nenhuma.
# Abre a página do jogo (SRC, padrão x_carga.html) em 1920x1080, tira fotos no meio da montagem do mundo (nas etapas que der),
# no "Pronto" e no menu, grava o vídeo do carregamento inteiro e anota o tempo de cada etapa (__etapasTempo).
# Uso: SRC=x_carga.html python3 tools/p265_carregamento.py [prefixo]
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = os.environ.get('SRC', 'x_carga.html')
PRE = sys.argv[1] if len(sys.argv) > 1 else 'p265'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"]
OUT = BASE + 'shots/'
os.makedirs(OUT + PRE + '_video', exist_ok=True)
ESTADO = """()=>({pct:Math.round((window.__cargaPct||0)*100),etapa:window.__cargaEtapa||'',rotulo:(document.getElementById('carregando')||{}).textContent,
  feitas:[...document.querySelectorAll('#cg-etapas li.feita')].map(l=>l.dataset.e),atual:(document.querySelector('#cg-etapas li.atual')||{dataset:{}}).dataset.e||'',
  dica:(document.getElementById('cg-dica')||{}).textContent,status:(document.getElementById('cg-status')||{}).textContent,versao:(document.getElementById('cg-versao')||{}).textContent,
  tituloVisivel:!document.getElementById('t-titulo').hidden,modo:typeof __nnc!=='undefined'&&__nnc.G?__nnc.G.modo:'?'})"""

async def main():
    rel = {'pagina': PAG, 'fotos': []}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        ctx = await b.new_context(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1,
                                  record_video_dir=OUT + PRE + '_video', record_video_size={'width': 960, 'height': 540})
        pg = await ctx.new_page()
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:300]) if m.type == 'error' else None)
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        rel['pagina_carregou_s'] = round(time.time() - t0, 1)
        async def foto(nome):
            st = await pg.evaluate(ESTADO)
            await pg.screenshot(path=OUT + PRE + '_' + nome + '.png', timeout=600000)
            st['nome'] = nome; st['s'] = round(time.time() - t0, 1); rel['fotos'].append(st)
            print('foto', nome, json.dumps(st, ensure_ascii=False), flush=True)
        # fotos no meio da montagem: a primeira que passar de cada marca (a montagem anda em saltos, uma etapa por vez)
        for marca, nome in [(0.0, '1_terreno'), (0.25, '2_mata'), (0.5, '3_meio'), (0.62, '4_62'), (0.8, '5_lugares')]:
            try:
                await pg.wait_for_function("(m)=>typeof window.__cargaPct==='number'&&(window.__cargaPct>=m||window.__bootFeito===true)", arg=marca, timeout=600000, polling=50)
            except Exception as e:
                print('marca', marca, 'não chegou:', e, flush=True); continue
            if await pg.evaluate('window.__bootFeito===true'): break
            await foto(nome)
        await pg.wait_for_function("window.__bootFeito===true", timeout=900000, polling=50)
        await foto('6_pronto')
        rel['montagem_s'] = round(time.time() - t0, 1)
        await pg.wait_for_function("__nnc.G.modo==='menu'", timeout=120000, polling=100)
        await pg.wait_for_timeout(1500)
        await foto('7_menu')
        rel['etapas'] = await pg.evaluate('window.__etapasTempo')
        rel['etapas_total_ms'] = await pg.evaluate('window.__etapasTotal')
        rel['primeira_pintura_ms'] = await pg.evaluate("(performance.getEntriesByType('paint').find(e=>e.name==='first-paint')||{}).startTime||null")
        # RECARREGAR=1: abre de novo na mesma janela (com o que ficou guardado) e confere se a barra usou os tempos aprendidos
        if os.environ.get('RECARREGAR') == '1':
            await pg.reload(wait_until='domcontentloaded', timeout=180000)
            await pg.wait_for_function("typeof window.__cargaPct==='number'&&window.__cargaPct>=0.4", timeout=900000, polling=50)
            await foto('8_segunda_vez')
            await pg.wait_for_function("window.__bootFeito===true", timeout=900000, polling=100)
            rel['segunda_vez'] = await pg.evaluate("({aprendeu:window.__etapasAprendidas,total_ms:window.__etapasTotal,guardado:!!localStorage.getItem('vaydr_carga_v1')})")
            print('segunda vez:', rel['segunda_vez'], flush=True)
        rel['erros'] = erros
        video = await pg.video.path() if pg.video else None
        await ctx.close(); await b.close()
        rel['video'] = video
    json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
    print('erros:', len(erros), erros[:5])
    print('montagem', rel['montagem_s'], 's; etapas', rel['etapas_total_ms'], 'ms; primeira pintura', rel['primeira_pintura_ms'], 'ms; vídeo', video)

asyncio.run(main())

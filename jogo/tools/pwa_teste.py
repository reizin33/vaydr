"""Testa a versão do site (pasta site/) num servidor local: manifesto, se o Chrome considera instalável, service worker,
botão Instalar, abrir sem internet e começar um jogo. Uso: python3 tools/pwa_teste.py [porta]"""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(os.path.dirname(BASE), 'site')
PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
URL = 'http://localhost:%d/' % PORTA
HASH = '#teste-rapido'   # liga o gancho de teste: dá para desligar o desenho 3D antes de recarregar (no software do teste ele trava a navegação)
PARA = 'window.__semRender=true;'
R = {}

async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORTA), '--bind', '127.0.0.1'], cwd=SITE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            br = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
            ctx = await br.new_context(viewport={'width': 1280, 'height': 720})
            await ctx.route(lambda u: 'fonts.googleapis.com' in u or 'fonts.gstatic.com' in u, lambda r: r.abort())   # sem internet de fora aqui
            pg = await ctx.new_page()
            erros = []
            pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
            await pg.goto(URL + HASH, wait_until='domcontentloaded', timeout=120000)
            await pg.wait_for_selector('#m-novo', state='visible', timeout=120000)
            await pg.evaluate(PARA)
            R['titulo'] = await pg.title()
            cdp = await ctx.new_cdp_session(pg)
            man = await cdp.send('Page.getAppManifest')
            R['manifesto_erros'] = man.get('errors')
            R['manifesto_url'] = man.get('url')
            try:
                pm = json.loads(man.get('data') or '{}')
                R['manifesto'] = {k: pm.get(k) for k in ('name', 'short_name', 'display', 'start_url', 'theme_color')} | {'icones': len(pm.get('icons', []))}
            except Exception as e:
                R['manifesto'] = 'erro ' + str(e)
            sw = await pg.evaluate("navigator.serviceWorker.ready.then(r=>({ativo:!!r.active,escopo:r.scope,estado:r.active&&r.active.state}))")
            R['service_worker'] = sw
            # espera o SW guardar os arquivos e assumir a página
            await pg.reload(wait_until='domcontentloaded')
            await pg.wait_for_selector('#m-novo', state='visible', timeout=120000)
            await pg.evaluate(PARA)
            R['controlado'] = await pg.evaluate("!!navigator.serviceWorker.controller")
            inst = await cdp.send('Page.getInstallabilityErrors')
            R['instalavel_erros'] = inst.get('installabilityErrors')
            R['cache'] = await pg.evaluate("caches.keys().then(async ks=>{const o={};for(const k of ks){const c=await caches.open(k);o[k]=(await c.keys()).map(r=>new URL(r.url).pathname)}return o;})")
            # botão Instalar: aparece quando o navegador oferece a instalação
            R['botao_antes'] = await pg.evaluate("document.getElementById('m-instalar').hidden")
            await pg.evaluate("(()=>{const e=new Event('beforeinstallprompt');e.prompt=()=>{window.__pediu=1;};e.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(e);})()")
            R['botao_depois'] = await pg.evaluate("document.getElementById('m-instalar').hidden")
            try:
                await pg.screenshot(path=os.path.join(BASE, 'shots', '820_site_menu.png'), timeout=60000)   # menu com o botão (cena 3D parada)
                R['foto'] = 'ok'
            except Exception as e:
                R['foto'] = 'falhou: ' + str(e)[:80]
            await pg.click('#m-instalar')
            await pg.wait_for_timeout(300)
            R['clique_pediu'] = await pg.evaluate("window.__pediu===1")
            R['botao_apos_aceitar'] = await pg.evaluate("document.getElementById('m-instalar').hidden")
            # sem internet: a página abre da cópia guardada (numa aba nova, para não depender de descarregar a atual)
            print('parcial', json.dumps(R, ensure_ascii=False)[:1500], flush=True)
            await pg.close()
            await ctx.set_offline(True)
            pg2 = await ctx.new_page()
            pg2.on('pageerror', lambda e: erros.append(str(e)[:200]))
            try:
                await pg2.goto(URL + HASH, wait_until='domcontentloaded', timeout=90000)
                await pg2.wait_for_selector('#m-novo', state='visible', timeout=120000)
                await pg2.evaluate(PARA)
                R['offline_abriu'] = await pg2.evaluate("({titulo:document.title,menu:!document.getElementById('t-menu').hidden,controlado:!!navigator.serviceWorker.controller,online:navigator.onLine})")
            except Exception as e:
                R['offline_abriu'] = 'falhou: ' + str(e)[:160]
            await ctx.set_offline(False)
            pg = pg2
            # jogo de verdade pelo site: novo jogo até a criação de personagem
            await pg.click('#m-novo')
            await pg.wait_for_timeout(1500)
            R['criacao'] = await pg.evaluate("!document.getElementById('t-criacao').hidden")
            R['erros_pagina'] = erros[:8]
            await br.close()
    finally:
        srv.terminate()
    print(json.dumps(R, ensure_ascii=False, indent=1))
    json.dump(R, open(os.path.join(BASE, 'pwa.out.json'), 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())

"""p242 (12/11): fotos do lobby novo e das telas de cada caminho (Jogar sozinho, Multiplayer, Configurações e abas, Personagem, login).
Uso: python3 tools/p242_lobby_fotos.py [pagina.html] [escala]   (padrão x_lobby.html, escala 1; fotos em shots/p242_*.png)"""
import asyncio, json, os, sys, shutil, tempfile
from playwright.async_api import async_playwright
J = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAG = os.path.join(J, sys.argv[1] if len(sys.argv) > 1 else 'x_lobby.html'); ESC = float(sys.argv[2]) if len(sys.argv) > 2 else 1
TMP = tempfile.mkdtemp(prefix='p242_'); shutil.copy(PAG, TMP + '/p.html'); URL = 'file://' + TMP + '/p.html'
SHOTS = os.path.join(J, 'shots'); R, ERROS = {}, []
async def esperar(pg, cond, t=180): await pg.wait_for_function("()=>{try{return !!(" + cond + ")}catch(e){return false}}", timeout=t * 1000)
async def foto(pg, nome, espera=1.2):
    await pg.wait_for_timeout(espera * 1000); await pg.screenshot(path=os.path.join(SHOTS, 'p242_' + nome + '.png'), timeout=240000); print('foto', nome)
async def ev(pg, nome, corpo): R[nome] = await pg.evaluate("()=>{const X=s=>__nnc.ev(s);" + corpo + "}"); print(nome, json.dumps(R[nome], ensure_ascii=False)[:300])
async def mundo(pg, dia):
    await pg.evaluate("()=>{__nnc.ev('pfAbrirSozinho')();}"); await pg.click('#m-novo'); await esperar(pg, "__nnc.G.modo==='criacao'")
    await pg.evaluate("()=>{__nnc.ev('criaComecar')();}"); await esperar(pg, "__nnc.G.modo==='jogo'")
    await pg.evaluate("(d)=>{__nnc.G.dia=d;__nnc.ev('salvarJogo')();__nnc.ev('mostrarMenu')();}", dia)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 810}, device_scale_factor=ESC); pg = await ctx.new_page()
        pg.on('pageerror', lambda e: ERROS.append(str(e)[:300]))
        try:
            await pg.goto(URL + '#teste'); await esperar(pg, "typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'&&!document.getElementById('t-menu').hidden")
            await pg.evaluate("()=>{window.__semRender=true;window.__turbo=6;}")
            await mundo(pg, 5); await mundo(pg, 12)
            await ev(pg, 'lobby', "return{continuar:document.getElementById('m-continuar').textContent,vis:!document.getElementById('m-continuar').hidden,mundo:document.getElementById('lb-mundo').textContent,"
                     "perfil:document.querySelector('#m-perfil .m-pn').textContent,paineis:[...document.querySelectorAll('#vl-fila .vl-pan')].map(p=>p.dataset.k+':'+Math.round(p.getBoundingClientRect().width)),"
                     "links:[...document.querySelectorAll('.vl-links .btn')].filter(b=>!b.hidden).map(b=>b.textContent),versao:document.querySelector('.vl .versao').textContent};")
            await pg.mouse.move(720, 790); await foto(pg, 'lobby')
            await pg.hover("#vl-fila .vl-pan[data-k='pers']"); await foto(pg, 'lobby_mouse_personagem')
            await pg.hover("#vl-fila .vl-pan[data-k='conf']"); await foto(pg, 'lobby_mouse_config')
            await pg.mouse.move(5, 5); await pg.keyboard.press('2'); await foto(pg, 'lobby_tecla_2')
            await ev(pg, 'tecla2', "return{foco:document.activeElement&&document.activeElement.dataset.k};")
            await pg.keyboard.press('Enter'); await esperar(pg, "!document.getElementById('t-multi').hidden"); await foto(pg, 'multiplayer')
            await pg.keyboard.press('Escape'); await esperar(pg, "!document.getElementById('t-menu').hidden")
            await pg.click("#vl-fila .vl-pan[data-k='sozinho'] .vl-sub"); await esperar(pg, "!document.getElementById('t-sozinho').hidden"); await foto(pg, 'sozinho')
            await ev(pg, 'sozinho', "return[...document.querySelectorAll('#sz-lista .sz-m')].map(li=>li.querySelector('.sz-i').textContent);")
            await pg.click('#sz-voltar'); await esperar(pg, "!document.getElementById('t-menu').hidden")
            await pg.click('#m-ajustes'); await esperar(pg, "!document.getElementById('t-ajustes').hidden"); await foto(pg, 'config_graficos')
            for k in ['resolucao', 'som', 'sens', 'controles', 'jogo', 'conta']:
                await pg.click("[data-sec-b='" + k + "']"); await foto(pg, 'config_' + k, 0.6)
            await pg.click("[data-sec-b='resolucao']"); await pg.click("#aj-res button[data-v='0.75']")
            await ev(pg, 'resolucao', "return{info:document.getElementById('aj-res-info').textContent,res:__nnc.cfg.res,canvas:[document.getElementById('cena').width,document.getElementById('cena').height]};")
            await pg.click("#aj-res button[data-v='auto']")
            await pg.click('#aj-volta'); await esperar(pg, "!document.getElementById('t-menu').hidden")
            await ev(pg, 'lobby_volta', "return{conf:document.getElementById('vl-conf-resumo').textContent};")
            await pg.evaluate("()=>{window.__semRender=false;window.__turbo=1;}")
            await pg.click('#m-personagem', timeout=240000); await esperar(pg, "__nnc.G.modo==='criacao'"); await foto(pg, 'personagem', 6)
            await pg.evaluate("()=>{__nnc.ev('sairCriacao')();}"); await esperar(pg, "!document.getElementById('t-menu').hidden")
            await pg.click('#m-trocar'); await esperar(pg, "!document.getElementById('t-login').hidden"); await foto(pg, 'login', 5)
        except Exception as e:
            R['EXCECAO'] = str(e)[:800]; print('EXCECAO', e)
        await b.close()
    R['erros_da_pagina'] = ERROS; json.dump(R, open(os.path.join(J, 'tools', 'p242.out.json'), 'w'), ensure_ascii=False, indent=1); print('erros:', ERROS)
asyncio.run(main())

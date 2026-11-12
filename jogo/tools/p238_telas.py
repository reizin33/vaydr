"""p238 (11/11, versão 10): login por perfil, lobby, Jogar sozinho com vários mundos, personagem do perfil e Ajustes em seções.
Uso: python3 tools/p238_telas.py [pagina.html]   (padrão: x_lobby.html; resultados em tools/p238_telas.out.json e fotos em shots/)
A (#teste-login, sem nada salvo): cria o perfil Davi (o personagem vem logo depois), lobby, dois mundos (nomes, chaves e
  dias separados), renomeia, joga de novo o primeiro, apaga o segundo, cria a Lucélia, troca de perfil, Ajustes em seções,
  muda o nome em Conta e perfil, recarrega (a sessão continua) e abre numa aba nova (volta o login).
B (migração): só o save de antes dos perfis (nnc_jogo_v1): vira o perfil 1 com o Mundo 1 e o Continuar abre o jogo."""
import asyncio, json, os, sys, shutil, tempfile
from playwright.async_api import async_playwright
J = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAG = os.path.join(J, sys.argv[1] if len(sys.argv) > 1 else 'x_lobby.html')
TMP = tempfile.mkdtemp(prefix='p238_'); shutil.copy(PAG, TMP + '/p.html'); URL = 'file://' + TMP + '/p.html'
SHOTS = os.path.join(J, 'shots'); os.makedirs(SHOTS, exist_ok=True)
R, ERROS = {}, []
X = "(s=>__nnc.ev(s))"
async def esperar(pg, cond, t=180):
    await pg.wait_for_function("()=>{try{return !!(" + cond + ")}catch(e){return false}}", timeout=t * 1000)
async def ev(pg, nome, corpo):
    R[nome] = await pg.evaluate("()=>{const X=s=>__nnc.ev(s);" + corpo + "}"); print(nome, json.dumps(R[nome], ensure_ascii=False)[:400])
async def foto(pg, nome, espera=5):
    await pg.evaluate("()=>{window.__semRender=false;window.__turbo=1;}"); await pg.wait_for_timeout(espera * 1000)
    await pg.screenshot(path=os.path.join(SHOTS, nome), timeout=240000); await pg.evaluate("()=>{window.__semRender=true;window.__turbo=6;}")
async def modo(pg, m, t=180): await esperar(pg, "__nnc.G.modo==='" + m + "'", t)
async def nova_pagina(ctx):
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: ERROS.append(str(e)[:300])); return pg
async def parte_a(b):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await nova_pagina(ctx)
    await pg.goto(URL + '#teste-login')
    await esperar(pg, "typeof __nnc!=='undefined'&&!document.getElementById('t-login').hidden")
    await pg.evaluate("()=>{window.__semRender=true;window.__turbo=6;}")
    await ev(pg, 'login_vazio', "return{form:!document.getElementById('lg-novo').hidden,perfis:document.querySelectorAll('#lg-lista [data-id]').length,sub:document.getElementById('lg-sub').textContent,cancelarVisivel:!document.getElementById('lg-cancelar').hidden};")
    await foto(pg, 'p238_login_vazio.png')
    await pg.fill('#lg-nome', 'Davi'); await pg.click('#lg-criar'); await modo(pg, 'criacao')
    await ev(pg, 'personagem_primeiro', "return{tit:document.querySelector('#t-criacao .cr-tit h2').textContent,ok:document.getElementById('cr-confirmar').textContent.trim(),nome:document.getElementById('cr-nome').value,campoMundo:!document.getElementById('cr-mundo-l').hidden};")
    await pg.click('#cr-nav [data-aba="cabelo"]'); await pg.click('#cr-opcoes [data-k="cabelo"][data-i="3"]', timeout=120000)
    await pg.click('#cr-confirmar'); await esperar(pg, "__nnc.G.modo==='menu'&&!document.getElementById('t-menu').hidden")
    await ev(pg, 'lobby_davi', "const P=X('PERFIL');return{perfil:document.getElementById('m-perfil-n').textContent,cabeloNoPerfil:P.ap&&P.ap.cabelo,continuarVisivel:!document.getElementById('m-continuar').hidden,"
             "sozinhoPrim:document.getElementById('m-sozinho').classList.contains('prim'),multi:document.getElementById('m-multi').disabled,paineis:[...document.querySelectorAll('#vl-fila .vl-pan')].map(p=>p.dataset.k),info:document.getElementById('lb-mundo').textContent,novoNoMenu:!!document.querySelector('#t-menu #m-novo')};")
    await foto(pg, 'p238_lobby.png', 7)
    # primeiro mundo, pela tela (nome escrito no modal)
    await pg.click('#m-sozinho'); await esperar(pg, "!document.getElementById('t-sozinho').hidden")
    await ev(pg, 'sozinho_vazio', "return{texto:document.getElementById('sz-lista').textContent,novo:!document.getElementById('m-novo').disabled};")
    await pg.click('#m-novo'); await modo(pg, 'criacao')
    await ev(pg, 'personagem_mundo', "return{tit:document.querySelector('#t-criacao .cr-tit h2').textContent,ok:document.getElementById('cr-confirmar').textContent.trim(),campoMundo:!document.getElementById('cr-mundo-l').hidden,nomeMundo:document.getElementById('cr-mundo').value,cabelo:X('CRIA').ap.cabelo};")
    await pg.click('#cr-confirmar'); await pg.fill('#cr-mundo', 'Clareira'); await pg.click('#cr-m-sim'); await modo(pg, 'jogo')
    await ev(pg, 'mundo1', "return{chave:X('SAVE_KEY'),mundos:X('PERFIL').mundos.map(m=>m.nome+'@'+m.chave),salvo:!!localStorage.getItem('nnc_jogo_v1'),cabeloNoMundo:X('G').aparencia.cabelo,dia:X('G').dia};")
    await pg.evaluate("()=>{__nnc.ev('salvarJogo')();__nnc.ev('mostrarMenu')();}")
    await ev(pg, 'lobby_continuar', "return{continuar:document.getElementById('m-continuar').textContent,visivel:!document.getElementById('m-continuar').hidden,info:document.getElementById('lb-mundo').textContent};")
    # segundo mundo: o Novo mundo não apaga o primeiro
    await pg.click('#m-sozinho'); await pg.click('#m-novo'); await modo(pg, 'criacao'); await pg.click('#cr-confirmar')
    await ev(pg, 'nome_padrao_2', "return document.getElementById('cr-mundo').value;")
    await pg.click('#cr-m-sim'); await modo(pg, 'jogo')
    await pg.evaluate("()=>{__nnc.G.dia=7;__nnc.ev('salvarJogo')();}")
    await ev(pg, 'mundo2', "const P=X('PERFIL');return{chave:X('SAVE_KEY'),mundos:P.mundos.map(m=>m.nome+'@'+m.chave+'@dia'+m.dia),primeiroIntacto:JSON.parse(localStorage.getItem('nnc_jogo_v1')).dia};")
    await pg.evaluate("()=>{__nnc.ev('mostrarMenu')();}"); await pg.click('#m-sozinho'); await esperar(pg, "!document.getElementById('t-sozinho').hidden")
    await ev(pg, 'lista2', "return[...document.querySelectorAll('#sz-lista .sz-m')].map(li=>li.querySelector('.sz-i').textContent+' | '+[...li.querySelectorAll('[data-a]')].map(b=>b.dataset.a).join(','));")
    await foto(pg, 'p238_sozinho.png')
    sel2 = "#sz-lista .sz-m:has-text('Mundo 2')"
    # Jogar sozinho novo (62t): escolhe o mundo na lista e as ações ficam no destaque
    await pg.click(sel2 + " .sz-ver"); await pg.click("#sz-hero [data-a='renomear']"); await pg.fill('#sz-ren', 'Base Norte'); await pg.click("#sz-hero [data-a='ren-ok']")
    await ev(pg, 'renomeado', "return X('PERFIL').mundos.map(m=>m.nome);")
    await pg.click("#sz-lista .sz-m:has-text('Clareira') .sz-ver"); await pg.click("#sz-hero [data-a='jogar']"); await modo(pg, 'jogo')
    await ev(pg, 'jogou_clareira', "return{chave:X('SAVE_KEY'),dia:X('G').dia,ultimo:X('PERFIL').ultimoMundo===X('MUNDO').id,nome:X('MUNDO').nome};")
    await pg.evaluate("()=>{__nnc.ev('salvarJogo')();__nnc.ev('mostrarMenu')();}"); await pg.click('#m-sozinho')
    chave2 = await pg.evaluate("()=>__nnc.ev('PERFIL').mundos.find(m=>m.nome==='Base Norte').chave")
    await pg.click("#sz-lista .sz-m:has-text('Base Norte') .sz-ver"); await pg.click("#sz-hero [data-a='apagar']")
    await ev(pg, 'apagar_confirma', "return document.querySelector('#sz-hero .sz-apagar.sim')?document.querySelector('#sz-hero .sz-apagar.sim').textContent:null;")
    await pg.click("#sz-hero [data-a='apagar']")
    await ev(pg, 'apagado', "return{mundos:X('PERFIL').mundos.map(m=>m.nome),chaveSumiu:!localStorage.getItem('" + chave2 + "'),msg:document.getElementById('sz-msg').textContent,primeiroContinua:!!localStorage.getItem('nnc_jogo_v1')};")
    await pg.click('#sz-voltar'); await pg.click('#m-trocar'); await esperar(pg, "!document.getElementById('t-login').hidden")
    await pg.click('#lg-mais'); await pg.fill('#lg-nome', 'davi')
    await pg.click('#lg-criar'); await ev(pg, 'nome_repetido', "return document.getElementById('lg-msg').textContent;")
    await pg.fill('#lg-nome', 'Lucélia'); await pg.click('#lg-criar'); await modo(pg, 'criacao'); await pg.click('#cr-confirmar')
    await esperar(pg, "__nnc.G.modo==='menu'&&!document.getElementById('t-menu').hidden")
    await ev(pg, 'lobby_lucelia', "return{perfil:document.getElementById('m-perfil-n').textContent,continuarVisivel:!document.getElementById('m-continuar').hidden,mundos:X('PERFIL').mundos.length,chave:X('SAVE_KEY')};")
    await pg.click('#m-trocar'); await esperar(pg, "!document.getElementById('t-login').hidden")
    await ev(pg, 'login_dois', "return[...document.querySelectorAll('#lg-lista [data-id]')].map(b=>b.textContent);")
    await foto(pg, 'p238_login.png')
    await pg.click("#lg-lista [data-id]:has-text('Davi')"); await esperar(pg, "!document.getElementById('t-menu').hidden")
    await ev(pg, 'voltou_davi', "return{perfil:document.getElementById('m-perfil-n').textContent,continuar:document.getElementById('m-continuar').textContent,chave:X('SAVE_KEY')};")
    # Ajustes em seções
    await pg.click('#m-ajustes'); await esperar(pg, "!document.getElementById('t-ajustes').hidden")
    await ev(pg, 'ajustes', "const ids=['aj-graf','aj-graf-nota','aj-tex','aj-fps','aj-fov','aj-som','aj-mus','aj-efx','aj-sens','aj-invy','aj-sensgp','aj-teclas-btn','aj-tela','aj-dif','aj-cam','aj-camdist','aj-animabre','aj-criativo','aj-hud','aj-teclas'];"
             "const onde={};for(const i of ids){const e=document.getElementById(i);const p=e&&e.closest('.aj-painel');onde[i]=p?p.dataset.sec:(e?'SOLTO':'FALTA');}"
             "return{secoes:[...document.querySelectorAll('.aj-nav [data-sec-b]')].map(b=>b.textContent),visivel:[...document.querySelectorAll('.aj-painel')].filter(p=>!p.hidden).map(p=>p.dataset.sec),onde,"
             "soltos:[...document.querySelector('#t-ajustes .cartao').children].filter(e=>e.classList.contains('opcao')).length};")
    await foto(pg, 'p238_ajustes.png', 3)
    await pg.click("[data-sec-b='conta']"); await pg.fill('#aj-pf-nome', 'Davi R'); await pg.click('#aj-pf-salvar')
    await ev(pg, 'conta', "return{nome:X('PERFIL').nome,msg:document.getElementById('aj-pf-msg').textContent,trocar:!document.getElementById('aj-pf-trocar').disabled,info:document.getElementById('aj-pf-info').textContent};")
    await foto(pg, 'p238_ajustes_conta.png', 3)
    await pg.click("[data-sec-b='jogo']"); await pg.click("#aj-criativo button[data-v='0']")
    await pg.click('#aj-ok'); await esperar(pg, "!document.getElementById('t-menu').hidden")
    await ev(pg, 'depois_ajustes', "return document.getElementById('m-perfil-n').textContent;")
    # recarregar a aba: a sessão continua; aba nova: login
    await pg.reload(); await esperar(pg, "typeof __nnc!=='undefined'&&(!document.getElementById('t-menu').hidden||!document.getElementById('t-login').hidden)")
    await ev(pg, 'recarregou', "return{menu:!document.getElementById('t-menu').hidden,login:!document.getElementById('t-login').hidden,perfil:document.getElementById('m-perfil-n').textContent};")
    pg2 = await nova_pagina(ctx); await pg2.goto(URL + '#teste-login')
    await esperar(pg2, "typeof __nnc!=='undefined'&&(!document.getElementById('t-menu').hidden||!document.getElementById('t-login').hidden)")
    await ev(pg2, 'aba_nova', "return{login:!document.getElementById('t-login').hidden,perfis:[...document.querySelectorAll('#lg-lista [data-id] b')].map(b=>b.textContent)};")
    legado = await pg.evaluate("()=>localStorage.getItem('nnc_jogo_v1')")
    await ctx.close(); return legado
async def parte_b(b, legado):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await nova_pagina(ctx)
    await pg.goto(URL + '#teste-login'); await esperar(pg, "typeof __nnc!=='undefined'&&!document.getElementById('t-login').hidden")
    await pg.evaluate("(t)=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('nnc_jogo_v1',t);}", legado)
    await pg.reload(); await esperar(pg, "typeof __nnc!=='undefined'&&!document.getElementById('t-login').hidden")
    await pg.evaluate("()=>{window.__semRender=true;window.__turbo=6;}")
    await ev(pg, 'migracao_login', "const P=JSON.parse(localStorage.getItem('vaydr_perfis_v1'));return{perfis:[...document.querySelectorAll('#lg-lista [data-id]')].map(b=>b.textContent),mundo:P.lista[0]&&P.lista[0].mundos.map(m=>m.nome+'@'+m.chave)};")
    await pg.click('#lg-lista [data-id]'); await esperar(pg, "!document.getElementById('t-menu').hidden")
    # lobby novo (62t): o Continuar fica no painel Jogar sozinho, que se abre com o mouse em cima
    await pg.hover("#vl-fila .vl-pan[data-k='sozinho']"); await pg.wait_for_timeout(800)
    await pg.click('#m-continuar'); await modo(pg, 'jogo')
    await ev(pg, 'migracao_jogo', "return{chave:X('SAVE_KEY'),dia:X('G').dia,nome:X('MUNDO').nome};")
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        try:
            legado = await parte_a(b); await parte_b(b, legado)
        except Exception as e:
            R['EXCECAO'] = str(e)[:800]; print('EXCECAO', e)
        await b.close()
    R['erros_da_pagina'] = ERROS
    json.dump(R, open(os.path.join(J, 'tools', 'p238_telas.out.json'), 'w'), ensure_ascii=False, indent=1)
    print('erros da página:', ERROS)
asyncio.run(main())

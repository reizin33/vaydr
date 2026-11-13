"""Tipo de corpo na criação (62za_criacao_corpo.js): a tela de criação abre com o sobrevivente; as abas de rosto e corpo
mostram a escolha do corpo; trocar para Personalizado volta o boneco de partes com todas as opções; começar o jogo com o
sobrevivente grava a escolha; o ajuste "Corpo do personagem" troca o corpo com o jogo aberto.
Uso (na pasta jogo/): python3 tools/p264_criacao_corpo.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'cc'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
ESTADO = """()=>{const n=__nnc,X=s=>n.ev(s),C=X('CRIA'),ch=n.P.ch,el=document.getElementById('cr-opcoes');
  return{modo:n.G.modo,corpoCria:C.ap?X('corpoDe')(C.ap):null,apCorpo:C.ap?C.ap.corpo||null:null,surv:!!ch.surv,proc:!!ch.proc,s:+(ch.s||0).toFixed(3),aba:C.aba,
    tipos:el?el.querySelectorAll('[data-corpo]').length:0,opcoes:el?[...new Set([...el.querySelectorAll('[data-k]')].map(b=>b.dataset.k))]:[],
    alturas:el?[...el.querySelectorAll('[data-k="altura"] b')].map(b=>b.textContent):[],resumo:(document.getElementById('cr-resumo')||{}).textContent||'',
    jogoCorpo:n.G.aparencia?n.G.aparencia.corpo||null:null,ajuste:[...document.querySelectorAll('#aj-personagem button')].map(b=>b.textContent+':'+b.getAttribute('aria-pressed')).join(' ')}}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        print('menu em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("()=>{try{__nnc.ev('GRAF').alto.dpr=1;__nnc.ev('resize')();}catch(e){}const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_function("__nnc.G.modo==='criacao'", timeout=300000, polling=250)
        async def foto(nome, espera=9000):
            await pg.wait_for_timeout(espera); st = await pg.evaluate(ESTADO)
            await pg.screenshot(path=BASE + 'shots/p264_' + PRE + '_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(st, ensure_ascii=False), '%.0fs' % (time.time() - t0), flush=True)
        clica = lambda sel: pg.evaluate("(s)=>{const b=document.querySelector(s);if(!b)return false;b.click();return true;}", sel)
        await foto('cria_sobrevivente_rosto', 15000)
        await clica('#cr-nav [data-aba="corpo"]'); await foto('cria_sobrevivente_corpo')
        await clica('#cr-opcoes [data-corpo="personalizado"]'); await foto('cria_personalizado_corpo', 12000)
        await clica('#cr-nav [data-aba="rosto"]'); await foto('cria_personalizado_rosto')
        await clica('#cr-opcoes [data-corpo="sobrevivente"]'); await clica('#cr-nav [data-aba="roupas"]'); await foto('cria_sobrevivente_roupas', 12000)
        # começa o jogo com o sobrevivente
        await pg.evaluate("()=>{document.getElementById('cr-nome').value='Teste';__nnc.ev('criaComecar')();}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;};const P=n.P,X=s=>n.ev(s);P.x=6;P.z=18;P.y=X('ground')(6,18);P.yaw=Math.PI;P.body=0;P.pitch=0.08;X('rebuildVeg')(true);X('rebuildGrass')();}""")
        await foto('jogo_sobrevivente', 12000)
        # ajuste "Corpo do personagem" com o jogo aberto: Personalizado e de volta
        await clica('#aj-personagem [data-v="classico"]'); await foto('jogo_personalizado', 9000)
        await clica('#aj-personagem [data-v="sobrevivente"]'); await pg.wait_for_timeout(4000)
        st = await pg.evaluate(ESTADO); print('volta', json.dumps(st, ensure_ascii=False), flush=True)
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

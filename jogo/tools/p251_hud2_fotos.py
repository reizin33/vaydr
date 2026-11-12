"""Fotos do HUD v2 no jogo (minimapa, bússola e barra rápida novos): começa um mundo, põe na barra o mesmo que o protótipo
mostrava (machado de incêndio, pistola, água, lata, bandagem, tábuas), escolhe o machado e tira a foto; depois a pistola, as
mãos vazias e uma perto da casa abandonada (o nome do lugar embaixo do minimapa). Confere também que o texto da barra, da
bússola e do lugar estão certos.
Uso (na pasta jogo/): SAIDA=t_hud.html python3 build.py && python3 tools/p251_hud2_fotos.py t_hud.html"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        await pg.evaluate("()=>{document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),P=n.P;n.G.hora=16.5;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
          for(let i=0;i<P.inv.length;i++)P.inv[i]=null;const I=X('ITEMS');
          const pos=(i,id,o)=>{P.inv[i]=Object.assign({id,n:1},o||{});const d=I[id];if(d.durMax&&P.inv[i].dur===undefined)P.inv[i].dur=d.durMax;};
          pos(0,'machado');pos(1,'pistola',{mun:7});pos(2,'agua',{n:2});pos(3,'feijao',{n:3});pos(4,'bandagem',{n:4});pos(5,'tabuas',{n:30});
          X('invAdd')('municao9',12);P.sel=0;X('hudBarra')();}""")
        await pg.wait_for_timeout(5000)
        res = {}
        async def foto(nome):
            await pg.evaluate("()=>{__nnc.ev('HUD2').lugarT=0;}"); await pg.wait_for_timeout(1500)   # o nome do lugar atualiza a cada 0,4 s de jogo
            await pg.screenshot(path=BASE + 'shots/p251_' + nome + '.png', timeout=400000)
            res[nome] = await pg.evaluate("""()=>({item:document.getElementById('item-nome').textContent,lugar:(document.getElementById('mapa-lugar')||{}).textContent,
              mapa:Math.round(document.querySelector('#hud .mapa').getBoundingClientRect().width),slot:Math.round(document.querySelector('#slots .slot').getBoundingClientRect().width),
              fita:document.querySelectorAll('#bus-fita .bus-t').length,graus:document.querySelectorAll('#bus-fita .bus-g').length})""")
            print(nome, json.dumps(res[nome], ensure_ascii=False), flush=True)
        await foto('machado')
        await pg.evaluate("()=>{const n=__nnc;n.P.sel=1;n.ev('hudBarra')();}"); await pg.wait_for_timeout(1500); await foto('pistola')
        await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),L=X('LUGARES').find(l=>l.id==='casaAbandonada'),M=X('lugMundo'),p=M(L,3,16),t=M(L,0,0),P=n.P;
          P.x=p[0];P.z=p[1];P.y=X('chaoEm')(p[0],p[1],L.y+0.3);P.yaw=Math.atan2(t[0]-p[0],t[1]-p[1]);P.body=P.yaw;P.inv[2]=null;P.sel=2;X("hudBarra")();X('rebuildVeg')(true);X('rebuildGrass')();}""")
        await pg.wait_for_timeout(5000); await foto('casa')
        res['erros'] = erros[:5]
        ok = 'Machado' in res['machado']['item'] and '%' in res['machado']['item'] and 'pente' in res['pistola']['item'] and 'Casa abandonada' in (res['casa']['lugar'] or '') \
            and res['machado']['fita'] == 72 and not erros
        print(json.dumps({'erros': erros[:5], 'resultado': 'PASSOU' if ok else 'FALHOU'}, ensure_ascii=False)); await b.close()
asyncio.run(main())

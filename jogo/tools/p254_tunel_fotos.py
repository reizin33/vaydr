"""Fotos do túnel do metrô no subsolo (depois da linha da estação escondida): da plataforma olhando para o túnel, dentro dele
para os dois lados, e uma volta andando para conferir que dá para atravessar e que as paredes seguram.
Uso (na pasta jogo/): SAIDA=t_hud.html python3 build.py && python3 tools/p254_tunel_fotos.py t_hud.html"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# x, z, rumo (para onde olha: o x e o z do alvo)
VISTAS = [('plataforma', -90.5, -84.0, -66.0, -84.5, '3'), ('tunel_leste', -77.5, -84.0, -66.0, -85.0, '3'), ('tunel_oeste', -68.5, -85.5, -90.0, -84.0, '3'),
          ('tunel_1p', -78.5, -86.5, -66.0, -84.0, '1')]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=400000, polling=500)
        await pg.evaluate("()=>{document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=400000, polling=250)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=11;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';}")
        info = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),S=X('SUB').salas.find(s=>s.nome==='Túnel do metrô abandonado'),L=X('LUGARES').find(l=>l.id==='tunelMetro');
          return{sala:!!S,modelo:S&&S.modelo,lugarY:L&&L.y,caixas:X('COLL').filter(c=>c.lugar==='tunelMetro').length}}""")
        print('info', json.dumps(info), flush=True)
        for nome, x, z, tx, tz, cam in VISTAS:
            await pg.evaluate("""([x,z,tx,tz,cam])=>{const n=__nnc,X=s=>n.ev(s);n.cfg.cam=cam;X('subIr')(x,X('Y_SUB'),z,Math.atan2(tx-x,tz-z));if(!n.P.lanterna)try{X('lanterna')();}catch(e){}}""", [x, z, tx, tz, cam])
            await pg.wait_for_timeout(6000)
            await pg.screenshot(path=BASE + 'shots/p254_' + nome + '.png', timeout=400000)
            print('foto', nome, json.dumps(await pg.evaluate("()=>({x:+__nnc.P.x.toFixed(1),y:+__nnc.P.y.toFixed(1),z:+__nnc.P.z.toFixed(1),lugar:document.getElementById('mapa-lugar').textContent})")), flush=True)
        # anda: da linha para dentro do túnel (tem que entrar e seguir), depois de lado contra a parede (tem que parar)
        await pg.evaluate("()=>{window.__semRender=true;const n=__nnc,X=s=>n.ev(s);n.cfg.cam='3';X('subIr')(-84,X('Y_SUB'),-84,Math.PI/2);}")
        await pg.keyboard.down('w'); await pg.wait_for_timeout(4000); await pg.keyboard.up('w')
        anda = await pg.evaluate("()=>({x:+__nnc.P.x.toFixed(2),y:+__nnc.P.y.toFixed(2),z:+__nnc.P.z.toFixed(2)})")
        await pg.evaluate("()=>{const n=__nnc,X=s=>n.ev(s);X('subIr')(-73,X('Y_SUB'),-84.7,Math.PI);}")
        await pg.keyboard.down('w'); await pg.wait_for_timeout(4000); await pg.keyboard.up('w')
        parede = await pg.evaluate("()=>({x:+__nnc.P.x.toFixed(2),y:+__nnc.P.y.toFixed(2),z:+__nnc.P.z.toFixed(2)})")
        ok = info['sala'] and info['caixas'] > 0 and anda['x'] > -79 and -89.5 < parede['z'] < -86.5 and abs(anda['y'] + 30) < 0.5 and not erros   # atravessa os trilhos e para na parede
        print(json.dumps({'anda_para_leste': anda, 'contra_a_parede_sul': parede, 'erros': erros[:5], 'resultado': 'PASSOU' if ok else 'FALHOU'}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

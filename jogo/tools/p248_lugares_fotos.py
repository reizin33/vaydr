"""Fotos dos lugares escaneados dentro do jogo (de dia, sem zumbi): por fora e por dentro.
Uso (na pasta jogo/): SAIDA=t_lug.html python3 build.py && python3 tools/p248_lugares_fotos.py t_lug.html [escala]"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'; ESC = float(sys.argv[2]) if len(sys.argv) > 2 else 1
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# (nome, lugar, deslocamento em metros no espaço do lugar [ao longo do comprimento, de lado], para onde olhar [idem], altura da câmera)
VISTAS = [('galpao_fora', 'galpao', [0, 30], [0, 0]), ('galpao_dentro', 'galpao', [-14, 2], [14, -1]),
          ('casa_frente', 'casaAbandonada', [3, 15], [0, 0]), ('predioD_frente', 'predioDestruido', [-2, 15], [0, 1]),
          ('predioA_frente', 'predioAbandonado', [13, 14], [0, 3]), ('ruina_frente', 'ruinaMata', [-3, 15], [2, 0]),
          ('ruina_lado', 'ruinaMata', [22, 4], [0, 0]), ('carro1', 'carro1', [-7, -3], [0, 0]),
          ('bunker_lado', 'bunker', [-9, -7], [0, 0])]
SO = sys.argv[3].split(',') if len(sys.argv) > 3 else None   # só algumas vistas (nomes separados por vírgula)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=ESC)
        pg = await ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        await pg.evaluate("()=>{window.__semRender=true;document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        info = await pg.evaluate("()=>{const n=__nnc;n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();n.cfg.cam='3';n.G.hora=10.5;n.Z.length=0;n.P.vida=100;const t=document.getElementById('teclas');if(t)t.hidden=true;return n.ev('LUG').info;}")
        print('info', json.dumps(info, ensure_ascii=False))
        chk = await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),LUG=X('LUG'),L=X('LUGARES');const g=L.find(l=>l.id==='galpao');
          const pisoG=X('chaoEm')(g.x+3,g.z+2,g.y+0.2),terr=X('ground')(g.x+3,g.z+2);
          const caixas=X('COLL').filter(c=>c.lugar).length,cred=!!document.getElementById('m-creditos');
          let bloqueia=null;{const c=L.find(l=>l.id==='casaAbandonada');bloqueia=!!X('pointBlocked')(c.x,c.z,0.3);}
          return{caixas,col:LUG.col,pisoGalpao:+pisoG.toFixed(2),terrenoGalpao:+terr.toFixed(2),yGalpao:+g.y.toFixed(2),casaBloqueia:bloqueia,botaoCreditos:cred};}""")
        print('conferencia', json.dumps(chk, ensure_ascii=False))
        for nome, lug, off, alvo in VISTAS:
            if SO and nome not in SO: continue
            r = await pg.evaluate("""([lug,off,alvo])=>{const n=__nnc,X=s=>n.ev(s),L=X('LUGARES').find(l=>l.id===lug),c=Math.cos(L.yaw),s=Math.sin(L.yaw);
              const W=(a,b)=>[L.x+a*c+b*s,L.z-a*s+b*c];/* mesma convenção de mat() e colBox */const [x,z]=W(off[0],off[1]),[tx,tz]=W(alvo[0],alvo[1]);const P=n.P;
              P.x=x;P.z=z;P.y=X('chaoEm')(x,z,(L.y||0)+3);P.vx=P.vz=P.vy=0;P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=0.02;n.G.modo='jogo';
              X('rebuildVeg')(true);X('rebuildGrass')();window.__semRender=false;return{x:+x.toFixed(1),z:+z.toFixed(1),y:+P.y.toFixed(2)};}""", [lug, off, alvo])
            await pg.wait_for_timeout(5000)
            pr = await pg.evaluate("()=>{const L=__nnc.ev('LUG');let t=0,p=0;for(const k in L.malhas)for(const m of L.malhas[k]){t++;if(m.tex&&m.tex.pronta)p++;}return p+'/'+t;}")
            await pg.screenshot(path=BASE + 'shots/p248_' + nome + '.png', timeout=400000); print('foto', nome, r, 'texturas', pr, flush=True)
            await pg.evaluate("()=>{window.__semRender=true;}")
        print('erros', erros[:5]); await b.close()
asyncio.run(main())

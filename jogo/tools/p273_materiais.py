"""p273: confere a textura em tudo numa página do jogo: sem erro, texturas prontas, quantas peças ganharam material em cada
assunto, e fotos reais da clareira (fogueira e barraca nos mesmos ângulos do levantamento p269) com a textura ligada e desligada.
Uso (na pasta jogo/): python3 tools/p273_materiais.py pagina.html prefixo [nivel]"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'mat'; NIVEL = sys.argv[3] if len(sys.argv) > 3 else 'alto'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
OUT = BASE + 'shots/'
async def main():
    rel = {'fotos': []}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:400]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:400]) if m.type == 'error' else None)
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'%s',grafManual:true}))}catch(e){}" % NIVEL)
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.wait_for_function("(()=>{try{return __nnc.ev('MATX').pronta||!!__nnc.ev('MATX').erro}catch(e){return true}})()", timeout=120000, polling=250)
        rel['matx'] = await pg.evaluate("()=>{const M=__nnc.ev('MATX');return{pronta:M.pronta,erro:M.erro,lado:M.S,porAssunto:M.cont,ligada:__nnc.ev('matxLigada')()};}")
        print('matx', json.dumps(rel['matx'], ensure_ascii=False), flush=True)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
          try{n.ev('GRAF')[n.cfg.graf].dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{const n=__nnc;n.Z.length=0;n.P.vida=100;n.G.hora=10;try{n.G.clima.atual='limpo';n.G.clima.k=1;n.G.chuva=0;}catch(e){}};}""")
        async def lugar(x, z, tx, tz, pitch=0.0):
            await pg.evaluate("""([x,z,tx,tz,pitch])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam='1';P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch])
        async def foto(nome, oque, espera=6000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=OUT + PRE + '_' + nome + '.png', timeout=600000)
            rel['fotos'].append({'nome': nome, 'mostra': oque}); print('foto', nome, '%.0fs' % (time.time() - t0), flush=True)
        F = await pg.evaluate("()=>__nnc.ev('FIRE')"); T = await pg.evaluate("()=>__nnc.ev('TENT')")
        for liga in (True, False):
            await pg.evaluate("(v)=>{__nnc.cfg.texReal=v;}", liga); suf = '' if liga else '_sem'
            await lugar(F[0] + 2.0, F[2] + 1.3, F[0], F[2], -0.38); await foto('fogueira' + suf, 'fogueira e barraca' + ('' if liga else ' (textura desligada)'))
            await lugar(T[0] + 3.6, T[1] + 2.6, T[0], T[1], -0.12); await foto('barraca' + suf, 'barraca, lenha e tambor' + ('' if liga else ' (textura desligada)'))
        # tempo de cada quadro com a textura ligada e desligada, no mesmo lugar (mediana de 30 quadros)
        MEDE = """()=>new Promise(r=>{const t=[];const f=ts=>{t.push(ts);if(t.length<31)requestAnimationFrame(f);else{const d=[];for(let i=1;i<t.length;i++)d.push(t[i]-t[i-1]);
          d.sort((a,b)=>a-b);r({mediana_ms:Math.round(d[d.length>>1]),media_ms:Math.round(d.reduce((a,b)=>a+b,0)/d.length)});}};requestAnimationFrame(f);})"""
        await lugar(F[0] + 2.0, F[2] + 1.3, F[0], F[2], -0.38); rel['quadro'] = {}
        for liga in (True, False, True, False):
            await pg.evaluate("(v)=>{__nnc.cfg.texReal=v;}", liga); await pg.wait_for_timeout(1500)
            q = await pg.evaluate(MEDE); k = 'ligada' if liga else 'desligada'; rel['quadro'].setdefault(k, []).append(q)
        print('quadro', json.dumps(rel['quadro']), flush=True)
        rel['erros'] = erros[:12]
        json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

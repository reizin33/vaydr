"""Troncos de perto, como quando a pessoa para do lado da árvore para cortar: uma árvore de cada espécie com o jogador a 1,6 m do
tronco (terceira pessoa), uma em primeira pessoa encostado no tronco, e a vista das fotos do sobrevivente (andando).
Uso (na pasta jogo/): python3 tools/p263_troncos_perto.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'tp'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';n.cfg.graf='alto';
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}""")
        async def lugar(x, z, tx, tz, pitch=0.05, cam='3'):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam])
        async def foto(nome, espera=8000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(2500)
            st = await pg.evaluate("()=>{const X=s=>__nnc.ev(s),V=X('MATAV');return{pronta:X('mataProntas')(),info:V.info&&V.info.especies.map(e=>e.id+':'+e.tri.join('/'))}}")
            await pg.screenshot(path=BASE + 'shots/p263_' + PRE + '_' + nome + '.png', timeout=600000)
            print('foto', nome, json.dumps(st), '%.0fs' % (time.time() - t0), flush=True)
        await lugar(6.0, 18.0, 6.0, 40.0, 0.08); await foto('vista_andando')
        # a árvore de cada espécie mais perto da clareira, com o lado de fora livre (nenhuma outra árvore a menos de 4 m)
        alvos = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),M=X('MESH').roundN,V=X('MATAV'),me=X('mataEsp'),out={},L=[];
          for(let i=0;i<M.n;i++){const o=i*8;L.push([M.arr[o],M.arr[o+2],M.arr[o+4]]);}
          for(const[x,z,s]of L){const e=V.esp[me(x,z)].id,d=Math.hypot(x-6,z-18);if(d<6)continue;
            const dx=(6-x)/d,dz=(18-z)/d,px=x+dx*1.6,pz=z+dz*1.6;let livre=true;for(const[x2,z2]of L){if(x2===x&&z2===z)continue;if(Math.hypot(x2-px,z2-pz)<3.5){livre=false;break;}}
            if(!livre)continue;if(!out[e]||d<out[e].d)out[e]={x,z,d:+d.toFixed(1),s:+s.toFixed(2),dx,dz};}return out;}""")
        print('alvos', json.dumps(alvos), flush=True)
        for e, a in sorted(alvos.items()):
            # o jogador a 1,6 m do centro do tronco, de frente para ele; a câmera atrás dele (como ao cortar)
            await lugar(a['x'] + a['dx'] * 1.6, a['z'] + a['dz'] * 1.6, a['x'], a['z'], 0.12, '3'); await foto('perto_' + e)
        if 'ilha2' in alvos or 'ilha1' in alvos:
            a = alvos.get('ilha2') or alvos.get('ilha1')
            await lugar(a['x'] + a['dx'] * 1.3, a['z'] + a['dz'] * 1.3, a['x'], a['z'], 0.05, '1'); await foto('encostado')
        print(json.dumps({'erros': erros[:8]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

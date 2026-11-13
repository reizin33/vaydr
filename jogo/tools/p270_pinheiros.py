"""p270: os pinheiros como estão hoje (capturas reais, sem edição), longe da clareira, onde a mata é quase só deles:
uma vista de dentro do pinhal (de pé, olhando para as árvores), uma de perto do tronco e uma de longe, do alto.
Uso (na pasta jogo/): python3 tools/p270_pinheiros.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'pin'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__fixaY=null;window.__cadaPasso=()=>{if(window.__fixaY!==null){__nnc.P.y=window.__fixaY;__nnc.P.vy=0;}__nnc.Z.length=0;__nnc.P.vida=100;__nnc.G.hora=10;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}""")
        # o quadrado de 24 m com mais pinheiros, entre 70 e 160 m da clareira, em chão firme
        alvo = await pg.evaluate("""()=>{const T=__nnc.ev('TREES'),C=new Map();for(const t of T){if(!t.alive||t.agua||t.kind!==0)continue;const d=Math.hypot(t.x,t.z);if(d<70||d>160)continue;
            const k=Math.floor(t.x/24)+','+Math.floor(t.z/24);C.set(k,(C.get(k)||0)+1);}let mk=null,mn=0;for(const[k,n]of C)if(n>mn){mn=n;mk=k;}
          const[i,j]=mk.split(',').map(Number),cx=i*24+12,cz=j*24+12;let perto=null,pd=1e9;for(const t of T){if(!t.alive||t.kind!==0)continue;const d=Math.hypot(t.x-cx,t.z-cz);if(d<pd){pd=d;perto=t;}}
          return{cx,cz,pinheiros:mn,px:perto.x,pz:perto.z,s:perto.s};}""")
        print('pinhal', json.dumps(alvo), flush=True)
        async def lugar(x, z, tx, tz, pitch=0.0, cam='1', y=None):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam,y])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;window.__fixaY=y;P.x=x;P.z=z;P.y=(y===null?X('ground')(x,z):y);P.vx=P.vz=P.vy=0;P.noChao=(y===null);
              P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam, y])
        async def foto(nome):
            await pg.wait_for_timeout(7000); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=BASE + 'shots/' + PRE + '_' + nome + '.png', timeout=600000); print('foto', nome, '%.0fs' % (time.time() - t0), flush=True)
        d = max(1e-3, (alvo['cx'] ** 2 + alvo['cz'] ** 2) ** 0.5); ux, uz = alvo['cx'] / d, alvo['cz'] / d
        # de dentro do pinhal: na beira do quadrado, do lado da clareira, olhando para o meio
        await lugar(alvo['cx'] - ux * 14, alvo['cz'] - uz * 14, alvo['cx'], alvo['cz'], 0.18); await foto('pinhal')
        # de perto do tronco de um pinheiro
        await lugar(alvo['px'] - ux * 3.2, alvo['pz'] - uz * 3.2, alvo['px'], alvo['pz'], 0.35); await foto('pinheiro_perto')
        # de longe e do alto (como de um morro), para ver a mata inteira
        gy = await pg.evaluate("([x,z])=>__nnc.ev('ground')(x,z)", [alvo['cx'] - ux * 70, alvo['cz'] - uz * 70])
        await lugar(alvo['cx'] - ux * 70, alvo['cz'] - uz * 70, alvo['cx'], alvo['cz'], -0.12, '1', gy + 22); await foto('mata_de_longe')
        print(json.dumps({'erros': erros[:6]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

"""Custo de desenho antes e depois (mesmo lugar, mesma qualidade 'alto'): tempo de um quadro (render + leitura de 1 pixel para
esperar a placa terminar), em 4 lugares, 2 rodadas de 5 quadros depois de 10 de aquecimento. No SwiftShader (placa de vídeo
feita na CPU) os números absolutos não dizem o FPS de um PC de verdade; servem para comparar uma versão com a outra.
Uso (na pasta jogo/): python3 tools/p259_desempenho.py antes.html depois.html"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
LUGARES = [('clareira', 6.0, 18.0, 6.0, 6.0), ('mata', 18.0, -30.0, 40.0, -62.0), ('serra', -104.0, -42.0, -150.0, -98.0), ('vila', 66.0, -76.0, 58.0, -90.0)]
MED = """async ([x,z,tx,tz])=>{const n=__nnc,P=n.P,X=s=>n.ev(s),gl=X('gl'),px=new Uint8Array(4),rd=X('render'),uc=X('updateCamera');
  P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=0.02;X('rebuildVeg')(true);X('rebuildGrass')();
  for(let i=0;i<30;i++)uc(0.05);for(let i=0;i<10;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}
  const t=[];for(let k=0;k<2;k++){const t0=performance.now();for(let i=0;i<5;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}t.push((performance.now()-t0)/5);}
  return +((t[0]+t[1])/2).toFixed(1);}"""
async def medir(pag):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        await pg.goto('file://' + BASE + pag + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;n.cfg.cam='3';n.cfg.graf='alto';try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;};}")
        await pg.wait_for_timeout(20000)            # texturas e fotos das árvores de longe
        r = {}
        for nome, x, z, tx, tz in LUGARES:
            r[nome] = await pg.evaluate(MED, [x, z, tx, tz]); print(pag, nome, r[nome], 'ms', flush=True)
        await b.close(); return r
async def main():
    res = {}
    for pag in sys.argv[1:]: res[pag] = await medir(pag)
    print(json.dumps(res))
asyncio.run(main())

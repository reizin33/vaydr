"""Tira do jogo a altura do chão de hoje na área da serra nova (grade de ~1 m, alinhada às linhas da grade do terreno) e a borda
de andar (raio do mapa por ângulo), para o gerador da serra (tools/serra_gerar.py) partir do chão que o jogo realmente tem.
Uso (na pasta jogo/): SAIDA=t_base.html python3 build.py && python3 tools/serra_base.py t_base.html /caminho/serra_base.npz"""
import asyncio, sys, os, json, base64
import numpy as np
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; SAI = sys.argv[2]
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
I0, I1, J0, J1 = 2, 48, 2, 51          # linhas da grade do terreno (GX) que fazem a borda do retângulo da serra
JS = r"""([i0,i1,j0,j1])=>{const n=__nnc,X=s=>n.ev(s),GX=X('GX'),ground=X('ground');const x0=GX[i0],x1=GX[i1],z0=GX[j0],z1=GX[j1];
  const nx=Math.round(x1-x0),nz=Math.round(z1-z0),H=new Float32Array((nx+1)*(nz+1));
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)H[j*(nx+1)+i]=ground(x0+(x1-x0)*i/nx,z0+(z1-z0)*j/nz);
  const b=new Uint8Array(H.buffer);let s='';for(let k=0;k<b.length;k+=8192)s+=String.fromCharCode.apply(null,b.subarray(k,k+8192));
  const borda=[];for(let a=180;a<=270;a+=1)borda.push(X('raioMapaAng')(a));
  const pontos={};for(const p of X('PLACES'))pontos['place_'+p.id]=[p.x,p.z,p.r];
  try{for(const L of X('LUGARES'))pontos['lugar_'+L.id]=[L.x,L.z,8];}catch(e){}
  for(const e of X('SUB').entradas)pontos['sub_'+e.id]=[e.sup[0],e.sup[1],4];
  return{x0,x1,z0,z1,nx,nz,h:btoa(s),borda,MAP_R:X('MAP_R'),pontos};}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 640, 'height': 360})
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=400000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=400000, polling=500)
        r = await pg.evaluate(JS, [I0, I1, J0, J1]); await b.close()
    h = np.frombuffer(base64.b64decode(r['h']), dtype=np.float32).reshape(r['nz'] + 1, r['nx'] + 1)
    np.savez_compressed(SAI, h=h, x0=r['x0'], x1=r['x1'], z0=r['z0'], z1=r['z1'], borda=np.array(r['borda']), MAP_R=r['MAP_R'],
                        pontos=json.dumps(r['pontos']), grade=np.array([I0, I1, J0, J1]))
    print('ok', h.shape, 'x', r['x0'], r['x1'], 'z', r['z0'], r['z1'], 'altura', float(h.min()), float(h.max()), 'MAP_R', r['MAP_R'])
    print(json.dumps(r['pontos']))
asyncio.run(main())

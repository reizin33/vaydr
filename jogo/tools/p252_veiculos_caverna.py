"""Confere a velocidade nova dos veículos (simula o acelerador no asfalto e mede a velocidade a cada segundo) e tira fotos da
boca da caverna (de frente, de lado e por trás) e de dentro da caverna, no subsolo.
Uso (na pasta jogo/): SAIDA=t_hud.html python3 build.py && python3 tools/p252_veiculos_caverna.py t_hud.html [fotos]"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'
FOTOS = (sys.argv[2] if len(sys.argv) > 2 else 'boca,perto,dentro,ponte').split(',')
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
VEL = r"""()=>{const n=__nnc,X=s=>n.ev(s),VE=X('VEICS'),VT=X('VTIPOS'),IN=X('IN'),up=X('updateVeic'),rz=X('roadZ'),out={};
  for(const tipo of ['caminhonete','sedan','moto','triciclo']){const v=VE.find(q=>q.tipo===tipo);if(!v){out[tipo]='não achei';continue;}
    const g={x:v.x,z:v.z,y:v.y,yaw:v.yaw,v:v.v,ativo:v.ativo,comb:v.comb,hp:v.hp};
    v.x=40;v.z=rz(40);v.yaw=-Math.PI/2;v.v=0;v.ativo=true;v.comb=50;v.hp=100;const ms=[];let t40=null;
    const ant={mz:IN.mz,mx:IN.mx,freio:IN.freio};IN.mz=1;IN.mx=0;IN.freio=false;
    for(let i=1;i<=240;i++){v.x=40;v.z=rz(40);up(v,0.05);if(i%20===0)ms.push(Math.round(v.v*3.6));if(t40===null&&v.v*3.6>=40)t40=+(i*0.05).toFixed(2);}
    IN.mz=ant.mz;IN.mx=ant.mx;IN.freio=ant.freio;Object.assign(v,g);
    out[tipo]={maxKmh:Math.round(VT[tipo].maxV*3.6),kmh_por_segundo:ms,ate40kmh_s:t40};}
  return out;}"""
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
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=11;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;}")
        print('velocidade', json.dumps(await pg.evaluate(VEL), ensure_ascii=False), flush=True)
        # boca da caverna: de frente, de lado e por trás (o arco fica na encosta)
        vistas = {'boca': (0, -7), 'perto': (0.6, -4.2), 'lado': (8, 3)}
        for nome in FOTOS:
            if nome in vistas:
                a, bb = vistas[nome]
                await pg.evaluate("""([a,b])=>{const n=__nnc,X=s=>n.ev(s),E=X('SUB').entradas.find(e=>e.tipo==='caverna'),[ex,ez,ey]=E.sup,c=Math.cos(ey),s=Math.sin(ey);
                  const x=ex+a*c+b*s,z=ez-a*s+b*c,P=n.P;P.x=x;P.z=z;P.y=X('chaoEm')(x,z,X('ground')(x,z)+0.5);P.yaw=Math.atan2(ex-x,ez-z);P.body=P.yaw;n.cfg.cam='3';
                  X('rebuildVeg')(true);X('rebuildGrass')();}""", [a, bb])
            elif nome == 'dentro':
                await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),E=X('SUB').entradas.find(e=>e.tipo==='caverna'),[sx,sz,sy]=E.sub;X('subIr')(sx,X('Y_SUB'),sz,sy+Math.PI);n.cfg.cam='3';
                  if(!n.P.lanterna)try{X('lanterna')();}catch(e){}}""")
            elif nome == 'ponte':
                await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),B=X('PONTE'),P=n.P,x=B.x+B.hw+7,z=B.z+4;P.x=x;P.z=z;P.y=X('chaoEm')(x,z,X('ground')(x,z)+0.5);
                  P.yaw=Math.atan2(B.x-x,B.z-z);P.body=P.yaw;n.cfg.cam='3';if(n.P.lanterna)try{X('lanterna')();}catch(e){}X('rebuildVeg')(true);X('rebuildGrass')();}""")
            await pg.wait_for_timeout(6000)
            await pg.screenshot(path=BASE + 'shots/p252_caverna_' + nome + '.png', timeout=400000)
            print('foto', nome, json.dumps(await pg.evaluate("()=>({x:+__nnc.P.x.toFixed(1),y:+__nnc.P.y.toFixed(1),z:+__nnc.P.z.toFixed(1)})")), flush=True)
        print('erros', erros[:5]); await b.close()
asyncio.run(main())

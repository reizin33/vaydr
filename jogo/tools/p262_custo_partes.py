"""De onde vem o custo do quadro (SwiftShader: compara as partes entre si, não diz o FPS de um PC): no mesmo lugar e na mesma
qualidade, o tempo do quadro com tudo, sem a mata nova (volta a árvore antiga), sem a folhagem nova do chão, com o boneco
clássico no lugar do sobrevivente e sem as três; na serra, também sem os paredões e sem a serra toda. Uso (na pasta jogo/): python3 tools/p262_custo_partes.py pagina.html [graf]"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; GRAF = sys.argv[2] if len(sys.argv) > 2 else 'alto'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
LUGARES = [('clareira', 6.0, 18.0, 6.0, 6.0), ('mata', 18.0, -30.0, 40.0, -62.0), ('serra', -104.0, -42.0, -150.0, -98.0)]
POS = """([x,z,tx,tz])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=0.02;
  X('rebuildVeg')(true);X('rebuildGrass')();const uc=X('updateCamera');for(let i=0;i<30;i++)uc(0.05);}"""
MED = """()=>{const n=__nnc,X=s=>n.ev(s),gl=X('gl'),px=new Uint8Array(4),rd=X('render');
  for(let i=0;i<2;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}
  const t0=performance.now();for(let i=0;i<3;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}return +((performance.now()-t0)/3).toFixed(0);}"""
# cada caso: (nome, js que liga/desliga). A mata e o chão novos voltam ao antigo pelo próprio interruptor (ok) e redistribuindo.
CASOS = [
    ('tudo', "()=>{}"),
    ('sem_mata', "()=>{const X=s=>__nnc.ev(s);X('MATAV').ok=false;X('rebuildVeg')(true);}"),
    ('sem_chao', "()=>{const X=s=>__nnc.ev(s);X('MATAV').ok=true;X('MCH').ok=false;X('rebuildVeg')(true);}"),
    ('classico', "()=>{const n=__nnc,X=s=>n.ev(s);X('MCH').ok=true;n.cfg.personagem='classico';X('survAplicar')();X('rebuildVeg')(true);}"),
    ('sem_os_tres', "()=>{const n=__nnc,X=s=>n.ev(s);X('MATAV').ok=false;X('MCH').ok=false;X('rebuildVeg')(true);}"),
]
# só na serra: sem os paredões e pedras grandes (SVP) e sem a serra toda (terreno novo e gruta, SVN) — com tudo o mais ligado
CASOS_SERRA = [
    ('sem_paredoes', "()=>{const n=__nnc,X=s=>n.ev(s);X('MATAV').ok=true;X('MCH').ok=true;n.cfg.personagem='sobrevivente';X('survAplicar')();X('SVP').ok=false;X('rebuildVeg')(true);}"),
    ('sem_serra', "()=>{const n=__nnc,X=s=>n.ev(s);X('SVN').pronto=false;X('rebuildVeg')(true);}"),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'%s',grafManual:true}))}catch(e){}" % GRAF)
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;n.cfg.cam='3';n.cfg.graf='%s';try{n.ev('GRAF')['%s'].dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;};}" % (GRAF, GRAF))
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.wait_for_timeout(20000)
        res = {}
        for nome, x, z, tx, tz in LUGARES:
            res[nome] = {}
            for caso, js in CASOS + (CASOS_SERRA if nome == 'serra' else []):
                await pg.evaluate(js); await pg.evaluate(POS, [x, z, tx, tz]); await pg.wait_for_timeout(1500)
                ms = await pg.evaluate(MED); res[nome][caso] = ms; print(nome, caso, ms, 'ms', '%.0fs' % (time.time() - t0), flush=True)
            # volta tudo para o próximo lugar
            await pg.evaluate("()=>{const n=__nnc,X=s=>n.ev(s);X('MATAV').ok=true;X('MCH').ok=true;n.cfg.personagem='sobrevivente';X('survAplicar')();}")
        print(json.dumps(res))
        await b.close()
asyncio.run(main())

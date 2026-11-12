"""Quadros do golpe do machado (primeira e terceira pessoa) em fases fixas do movimento, para ver o preparo, a descida e a
volta. O tempo do jogo quase para (G.hitstop) enquanto cada quadro é fotografado. Junta tudo numa tira só.
Uso (na pasta jogo/): SAIDA=t_hud.html python3 build.py && python3 tools/p253_golpe_machado.py t_hud.html shots/p253_golpe.png"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'; SAI = sys.argv[2] if len(sys.argv) > 2 else 'shots/p253_golpe.png'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
FASES = [0.0, 0.25, 0.4, 0.52, 0.62, 0.8]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 960, 'height': 540}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        await pg.evaluate("()=>{document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        await pg.evaluate("""()=>{const n=__nnc,X=s=>n.ev(s),P=n.P;n.G.hora=10.5;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
          document.getElementById('hud').style.visibility='hidden';P.inv[0]={id:'machado',n:1,dur:170};P.sel=0;X('hudBarra')();P.x=6;P.z=6;P.yaw=0.6;P.body=0.6;
          P.y=X('chaoEm')(6,6,X('ground')(6,6)+0.5);P.vy=0;   /* a altura também: o começo do jogo é 2 m mais baixo que a clareira e o jogador ficava enterrado (a câmera via o céu por baixo do chão: chão cinza liso nas fotos) */
          X('rebuildVeg')(true);X('rebuildGrass')();}""")
        await pg.wait_for_timeout(3000)
        # segura a fase do golpe a cada passo do jogo (sem isso o tempo anda enquanto a foto é tirada)
        await pg.evaluate("()=>{__nnc.ev('PASSOS').push(()=>{const P=__nnc.P;if(window.__fixa!=null&&P.acao&&P.acao.tipo==='golpe')P.acao.t=window.__fixa*P.acao.dur;});}")
        quadros = []
        for cam in os.environ.get('CAMS', '1,3').split(','):
            await pg.evaluate("(c)=>{__nnc.cfg.cam=c;}", cam); await pg.wait_for_timeout(1500)
            for f in FASES:
                await pg.evaluate("""(f)=>{const n=__nnc,X=s=>n.ev(s),P=n.P,d=X('ITEMS').machado,dur=d.tempo*0.85;
                  P.acao={tipo:'golpe',t:f*dur,dur,vertical:true,arma:P.inv[0],mira:null,hit:true};n.G.hitstop=1e6;window.__fixa=f;}""", f)
                await pg.wait_for_timeout(900)
                nome = BASE + 'shots/p253_%s_%02d.png' % (cam, int(f * 100)); await pg.screenshot(path=nome, timeout=400000); quadros.append((cam, f, nome))
                print('quadro', cam, f, flush=True)
            await pg.evaluate("()=>{__nnc.G.hitstop=0;__nnc.P.acao=null;}")
        print('erros', erros[:5]); await b.close()
    # tira: linha de cima primeira pessoa, embaixo terceira
    W, H = 320, 180; tira = Image.new('RGB', (W * len(FASES), H * 2 + 22), (16, 18, 19)); d = ImageDraw.Draw(tira)
    for cam, f, nome in quadros:
        im = Image.open(nome).convert('RGB').resize((W, H), Image.LANCZOS); i = FASES.index(f); y = 22 + (0 if cam == '1' else H)
        tira.paste(im, (i * W, y))
    for i, f in enumerate(FASES): d.text((i * W + 6, 5), '%d%% do golpe' % int(f * 100), fill=(236, 228, 210))
    tira.save(BASE + SAI); print('tira', SAI)
asyncio.run(main())

import asyncio, sys, json
from playwright.async_api import async_playwright
import os
BASE=os.path.dirname(os.path.abspath(__file__))+'/'   # a pasta jogo/ onde está este arquivo (antes era um caminho fixo da sessão)
# cada execução usa a sua própria cópia da página: dá para recompilar enquanto o teste roda
import shutil
os.makedirs(BASE+'tmp',exist_ok=True)
_COPIA='tmp/t_'+os.path.basename(sys.argv[1]).replace('.json','')+'.html'
shutil.copy(BASE+os.environ.get('SRC','test.html'),BASE+_COPIA)
PAGE='file://'+BASE+_COPIA+os.environ.get('HASH','#teste')
if len(sys.argv)>2 and sys.argv[2]=='rapido':PAGE='file://'+BASE+_COPIA+'#teste-rapido'
SEMFOTO=os.environ.get('SEMFOTO')=='1'
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"]
OUT=sys.argv[1].replace('.json','')+'.out.json'
async def run(plan):
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=ARGS)
        for name,opts,steps in plan:
            ctx=await b.new_context(**opts)
            pg=await ctx.new_page()
            logs=[]
            pg.on('console', lambda m, logs=logs: logs.append(f'{m.type}: {m.text}') if m.type in ('error','warning') else None)
            pg.on('pageerror', lambda e, logs=logs: logs.append(f'PAGEERROR: {e}'))
            await pg.goto(PAGE,wait_until='domcontentloaded',timeout=180000)
            for i,st in enumerate(steps):
                k=st[0]
                # SEMFOTO=1: pula as fotos (e a espera logo antes delas); as conferências continuam todas
                if SEMFOTO and (k=='shot' or (k=='wait' and i+1<len(steps) and steps[i+1][0]=='shot')): continue
                # clique e toque esperam até 2 min: a tela de criação refaz 4 fotos do personagem a cada escolha, e sem placa de vídeo isso demora
                if k=='wait': await pg.wait_for_timeout(st[1]*1000)
                elif k in('click','tap'):
                    # versão 10: "Novo mundo" (#m-novo) fica na tela Jogar sozinho; os testes antigos clicam nele direto do menu
                    if st[1]=='#m-novo':
                        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}}")
                    await (pg.click(st[1],timeout=120000) if k=='click' else pg.tap(st[1],timeout=120000))
                    # Novo jogo abre a criação do personagem: os testes antigos confirmam o personagem padrão
                    # (passo ["click","#m-novo","criacao"] deixa a tela aberta para testar a criação)
                    if st[1] in('#m-novo','#c-sim') and not(len(st)>2 and st[2]=='criacao'):
                        await pg.wait_for_timeout(120)
                        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
                elif k=='press': await pg.keyboard.press(st[1])
                elif k=='down': await pg.keyboard.down(st[1])
                elif k=='up': await pg.keyboard.up(st[1])
                elif k=='mouse': await pg.mouse.click(st[1],st[2])
                elif k=='drag':   # arrasta com o mouse do centro de um elemento até o centro de outro: ["drag", selA, selB, passos]
                    ra=await pg.locator(st[1]).first.bounding_box(); rb=await pg.locator(st[2]).first.bounding_box()
                    await pg.mouse.move(ra['x']+ra['width']/2,ra['y']+ra['height']/2); await pg.mouse.down()
                    await pg.mouse.move(rb['x']+rb['width']/2,rb['y']+rb['height']/2,steps=st[3] if len(st)>3 else 10); await pg.mouse.up()
                elif k=='dragxy':   # arrasta entre pontos que a página calcula: ["dragxy", "expressão que devolve [x0,y0,x1,y1]"]
                    q=await pg.evaluate(st[1]); await pg.mouse.move(q[0],q[1]); await pg.mouse.down(); await pg.mouse.move(q[2],q[3],steps=10); await pg.mouse.up()
                elif k=='clickxy':   # clica onde a página manda: ["clickxy", "expressão que devolve [x,y]"]
                    xy=await pg.evaluate(st[1]); await pg.mouse.click(xy[0],xy[1])
                elif k=='shot':
                    try: await pg.screenshot(path=BASE+'shots/'+st[1],timeout=150000)
                    except Exception as e: logs.append('SHOTERRO '+st[1]+': '+str(e).split('\n')[0][:200])
                elif k=='eval':
                    try: out[name+'_'+st[1]]=await pg.evaluate(st[2])
                    except Exception as e: out[name+'_'+st[1]]={'ERRO':str(e).split('\n')[0][:300]}
                    open(OUT,'w').write(json.dumps(out,indent=1,ensure_ascii=False))
                elif k=='js':
                    try: await pg.evaluate(st[1])
                    except Exception as e: logs.append('JSERRO: '+str(e).split('\n')[0][:300])
                elif k=='reload': await pg.reload(wait_until='domcontentloaded',timeout=180000)
                elif k=='gwait':
                    t0=await pg.evaluate('__nnc.G.t')
                    await pg.wait_for_function('(t)=>__nnc.G.t>=t',arg=t0+st[1],timeout=st[2]*1000 if len(st)>2 else 300000,polling='raf')   # confere a cada quadro: no modo rápido o jogo anda ~18× o tempo real
                elif k=='until': await pg.wait_for_function(st[1],timeout=(st[2] if len(st)>2 else 300)*1000,polling=250)
                elif k=='fps': out[name+'_fps'+str(len(out))]=await pg.evaluate("(s)=>new Promise(r=>{let n=0;const t0=performance.now();function f(){n++;if(performance.now()-t0<s*1000)requestAnimationFrame(f);else r(+(n/((performance.now()-t0)/1000)).toFixed(2));}requestAnimationFrame(f);})", st[1])
            out[name+'_logs']=[l for l in logs if 'ERR_TUNNEL' not in l][:25]
            open(OUT,'w').write(json.dumps(out,indent=1,ensure_ascii=False))
            await ctx.close()
        await b.close()
    print(json.dumps(out,indent=1,ensure_ascii=False))
asyncio.run(run(json.load(open(sys.argv[1]))))

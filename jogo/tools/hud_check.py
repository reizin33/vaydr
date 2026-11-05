import asyncio, json, sys
from playwright.async_api import async_playwright
BASE='/tmp/claude-0/-home-claude/d6133a28-118d-54a2-ac28-a551fc07194e/scratchpad/jogo/'
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
SIZES=[(1920,1080),(1600,900),(1366,768),(1280,720),(1100,650),(1000,560),(900,600),(800,600),(700,560)]
JS='''()=>{const R=s=>{const e=document.querySelector(s);if(!e||e.offsetParent===null&&getComputedStyle(e).position!=='fixed')return null;const r=e.getBoundingClientRect();return r.width?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null;};
 const o={slots:R('#slots'),nome:R('#item-nome'),vitais:R('.vitais'),dir:R('.dir'),esq:R('.esq'),teclas:R('#teclas'),util:R('#util'),radio:R('.radio')};
 const ov=(a,b)=>a&&b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];
 o.over=[];for(const k of['vitais','dir','esq','teclas','util','radio'])if(ov(o.slots,o[k])||ov(o.nome,o[k]))o.over.push(k);return o;}'''
async def main(shots):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=ARGS)
        ctx=await b.new_context(viewport={'width':1280,'height':720})
        pg=await ctx.new_page()
        await pg.goto('file://'+BASE+'test.html#teste')
        await pg.wait_for_timeout(3000)
        await pg.click('#m-novo')
        await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}")   # novo jogo passa pela criação do personagem
        await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{const n=__nnc;n.invAdd('machado',1);n.invAdd('pedra',5);n.invAdd('feijao',2);}")
        for w,h in SIZES:
            await pg.set_viewport_size({'width':w,'height':h})
            await pg.wait_for_timeout(700)
            r=await pg.evaluate(JS)
            print(w,h,json.dumps(r))
            if shots and r['over']:
                await pg.screenshot(path=BASE+'shots/hud_%dx%d.png'%(w,h),clip={'x':0,'y':h*0.55,'width':w,'height':h*0.45},timeout=120000)
        await b.close()
asyncio.run(main('shots' in sys.argv))

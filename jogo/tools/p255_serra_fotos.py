"""Teste da etapa 1 da serra (62x_serra.js): fotos da Serra Velha nova e da Gruta da Serra Velha, de longe, da boca, de dentro com a
lanterna e de noite, e uma conferência andando (entra na gruta pelo pátio, a parede segura, a encosta íngreme não se sobe andando).
Uso (na pasta jogo/): SAIDA=x_serra.html python3 build.py && python3 tools/p255_serra_fotos.py x_serra.html [só_estas_fotos,...]"""
import asyncio, sys, os, json, math
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'x_serra.html'
SO = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# vistas em coordenadas da gruta: s (para dentro da serra), t (de lado), hora, câmera, lanterna, s e t do alvo, altura extra da câmera
VISTAS = [
    ('longe_base', None, None, 10.5, '1', False, None, None, 0),        # da Base Militar olhando para a serra
    ('longe_alto', None, None, 15.5, '1', False, None, None, 0),        # de cima, a serra inteira
    ('boca', -9.0, 1.0, 10.0, '3', False, 3.0, 0.0, 0),           # no pátio, a boca na frente
    ('boca_lado', -11.0, -9.0, 15.5, '3', False, 3.0, 2.0, 0),
    ('dentro_lanterna', 9.0, -0.4, 10.0, '3', True, 24.0, -2.0, 0),
    ('salao_1p', 23.0, -1.8, 10.0, '1', True, 33.0, 2.5, 0),
    ('olhando_para_fora', 14.0, -1.0, 10.0, '3', False, -6.0, 0.0, 0),
    ('noite_boca', -12.0, 0.5, 21.5, '3', True, 4.0, 0.0, 0),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:300]))
        pg.on('console', lambda m: erros.append('console: ' + m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script("try{localStorage.setItem('nnc_cfg_v1',JSON.stringify({graf:'alto',grafManual:true}))}catch(e){}")
        import time; t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=900000, polling=500)
        print('menu em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("()=>{const b=document.getElementById('m-novo');if(b&&!b.offsetParent){try{__nnc.ev('pfAbrirSozinho')()}catch(e){}}document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=900000, polling=250)
        print('jogo em %.0fs' % (time.time() - t0), flush=True)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.cam='3';n.cfg.graf='alto';try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;__nnc.G.chuva=0;}catch(e){}};}")
        info = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),S=X('SVN');return{pronto:S.pronto,pedacos:S.pedacos.length,boca:[S.EX,S.hE,S.EZ],dir:[S.ca,S.sa],
          caixasGruta:X('COLL').filter(c=>c.gruta).length,limpeza:X('SVN_INFO'),max:(()=>{let m=-1e9;for(let i=0;i<S.H2.length;i++)if(S.H2[i]>m)m=S.H2[i];return m.toFixed(1);})(),
          chaoBoca:X('ground')(S.EX-S.ca*8,S.EZ-S.sa*8).toFixed(2),chaoDentro:X('ground')(S.EX+S.ca*10,S.EZ+S.sa*10).toFixed(2),
          tetoDentro:X('svnTeto')(S.EX+S.ca*10,S.EZ+S.sa*10)}}""")
        print('info', json.dumps(info), flush=True)
        EX, hE, EZ = info['boca']; ca, sa = info['dir']
        W = lambda s, t: (EX + ca * s - sa * t, EZ + sa * s + ca * t)
        for nome, s, t, hora, cam, lant, ts, tt, hy in VISTAS:
            if SO and nome not in SO: continue
            if nome == 'longe_base':
                x, z = -104.0, -42.0; tx, tz = W(8, 0)
            elif nome == 'longe_alto':
                x, z = -88.0, -40.0; tx, tz = W(25, 0)
            else:
                x, z = W(s, t); tx, tz = W(ts, tt)
            await pg.evaluate("""([x,z,tx,tz,hora,cam,lant,alto])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.G.hora=hora;n.cfg.cam=cam;n.Z.length=0;
              P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;
              const ty=X('ground')(tx,tz)+1.2,hy=P.y+1.6;P.pitch=Math.atan2(ty-hy,Math.hypot(tx-x,tz-z))+(alto?-0.12:0.02);
              if(alto){window.__alto=alto;}else window.__alto=0;
              if(!!P.lanterna!==lant){try{X('lanterna')();}catch(e){P.lanterna=lant;}}
              X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, hora, cam, lant, 1 if nome == 'longe_alto' else 0])
            if nome == 'longe_alto':
                # câmera alta: modo foto do jogo não existe no teste; sobe o jogador num ponto alto de verdade (P.y) só para a foto
                await pg.evaluate("()=>{const n=__nnc,P=n.P;P.y+=26;P.vy=0;window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;__nnc.P.vy=0;__nnc.P.y=window.__yAlto;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;}catch(e){}};window.__yAlto=P.y;}")
            await pg.wait_for_timeout(9000)
            await pg.screenshot(path=BASE + 'shots/p255_' + nome + '.png', timeout=400000)
            st = await pg.evaluate("()=>{const n=__nnc,S=n.ev('SVN');return{x:+n.P.x.toFixed(1),y:+n.P.y.toFixed(1),z:+n.P.z.toFixed(1),tri:S.tri,ped:S.ped,gruta:n.ev('svnNaGruta')(n.P.x,n.P.y+1,n.P.z),esc:+n.ev('svnEscuro')(n.P.x,n.P.y+1,n.P.z).toFixed(2),adapt:+S.adapt.toFixed(2)}}")
            print('foto', nome, json.dumps(st), flush=True)
            if nome == 'longe_alto':
                await pg.evaluate("()=>{window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.vida=100;try{__nnc.G.clima.atual='limpo';__nnc.G.clima.k=1;}catch(e){}};}")
        # andando: do pátio para dentro (tem que entrar), contra a parede (tem que parar), encosta íngreme (não sobe)
        await pg.evaluate("()=>{window.__semRender=true;}")
        async def anda(s, t, ts, tt, seg):
            x, z = W(s, t); tx, tz = W(ts, tt)
            await pg.evaluate("""([x,z,tx,tz])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.G.hora=10;n.cfg.cam='3';P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=0;}""", [x, z, tx, tz])
            await pg.keyboard.down('w'); await pg.wait_for_timeout(int(seg * 1000)); await pg.keyboard.up('w'); await pg.wait_for_timeout(300)
            return await pg.evaluate("""()=>{const n=__nnc,P=n.P,X=s=>n.ev(s);return{s:+X('svnS')(P.x,P.z).toFixed(2),t:+X('svnT')(P.x,P.z).toFixed(2),y:+P.y.toFixed(2),
              chao:+X('ground')(P.x,P.z).toFixed(2),gruta:X('svnNaGruta')(P.x,P.y+1,P.z),mapa:X('dentroMapa')(P.x,P.z)}}""")
        entra = await anda(-10, 0, 30, -1.5, 9)
        parede = await anda(8, 0, 8, 20, 4)          # de lado, dentro do túnel
        # encosta: o paredão do lado da boca (t = 14, s = 2: lá o terreno sobe ~67°)
        encosta = await anda(-4, 14, 12, 14, 5)
        ok = info['pronto'] and info['caixasGruta'] > 100 and entra['s'] > 6 and entra['gruta'] and abs(entra['y'] - entra['chao']) < 0.3 \
            and parede['t'] < 4.5 and encosta['y'] < hE + 4 and not [e for e in erros if 'console' not in e]
        print(json.dumps({'entra': entra, 'parede': parede, 'encosta': encosta, 'erros': erros[:8], 'resultado': 'PASSOU' if ok else 'FALHOU'}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

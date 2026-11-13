"""p271: segunda parte do levantamento (capturas reais, sem edição): construções num lugar seco, a cerca de estacas da
clareira, animais, zumbis, veículos, água, e a mata de longe nos níveis de gráfico Baixo e Médio. Também guarda se o
fogo da fogueira se mexe e o que tem textura (para o projeto "textura em tudo").
Uso (na pasta jogo/): python3 tools/p271_levantamento2.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'lev2'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
OUT = BASE + 'shots/'
# acha um lugar seco, plano e sem árvore para uma fileira de L metros (ou um retângulo L x Wz), longe da clareira
SECO = """([L,Wz,xmin,xmax,zmin,zmax])=>{const X=s=>__nnc.ev(s),T=X('TREES'),g=X('ground'),agua=X('aguaNivel');
  const livre=(x,z)=>{if(agua(x,z)!==null)return false;for(const t of T){if(t.alive&&Math.abs(t.x-x)<3&&Math.abs(t.z-z)<3)return false;}return true;};
  for(let z0=zmin;z0<=zmax;z0+=4)for(let x0=xmin;x0<=xmax;x0+=4){if(Math.hypot(x0+L/2,z0)<14)continue;const g0=g(x0,z0);let ok=true;
    for(let k=0;k<=L&&ok;k+=3)for(let w=0;w<=Wz&&ok;w+=3){const x=x0+k,z=z0-w;if(!livre(x,z)||Math.abs(g(x,z)-g0)>1.2)ok=false;}
    for(let k=0;k<=L&&ok;k+=4){const x=x0+k,z=z0+9;if(agua(x,z)!==null)ok=false;}
    if(ok)return{x0,z0};}return null;}"""
async def main():
    rel = {'fotos': []}
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
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;
          try{n.ev('GRAF').alto.dpr=1;n.ev('GRAF').medio.dpr=1;n.ev('GRAF').baixo.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__fixos=[];window.__semZ=true;window.__fixaY=null;
          window.__cadaPasso=()=>{const n=__nnc;if(window.__fixaY!==null){n.P.y=window.__fixaY;n.P.vy=0;}if(window.__semZ)n.Z.length=0;n.P.vida=100;n.G.hora=10;
            try{n.G.clima.atual='limpo';n.G.clima.k=1;n.G.chuva=0;}catch(e){}
            for(const f of window.__fixos){const o=f.o;o.x=f.x;o.z=f.z;if(f.y!==undefined)o.y=f.y;if(o.yaw!==undefined)o.yaw=f.yaw;if(o.vx!==undefined){o.vx=0;o.vz=0;}if(f.carro&&o.v!==undefined)o.v=0;}};}""")
        async def lugar(x, z, tx, tz, pitch=0.0, cam='1', y=None):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam,y])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;window.__fixaY=y;P.x=x;P.z=z;P.y=(y===null?X('ground')(x,z):y);
              P.vx=P.vz=P.vy=0;P.noChao=(y===null);P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam, y])
        async def foto(nome, oque, espera=5000):
            if os.environ.get('SO') and nome not in os.environ['SO'].split(','): return   # SO=nome1,nome2: só essas fotos (para o depois nos mesmos ângulos)
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=OUT + PRE + '_' + nome + '.png', timeout=600000)
            rel['fotos'].append({'nome': nome, 'mostra': oque}); print('foto', nome, '%.0fs' % (time.time() - t0), flush=True)
            json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        J = pg.evaluate
        # dados: o fogo se mexe? o que tem textura?
        a1 = await J("()=>Array.from(__nnc.ev('FIREM').m).slice(0,64)"); await pg.wait_for_timeout(800); a2 = await J("()=>Array.from(__nnc.ev('FIREM').m).slice(0,64)")
        rel['fogo_mexe'] = {'diferenca_maxima_ossos': round(max(abs(x - y) for x, y in zip(a1, a2)), 5)}
        rel['texturas'] = await J("""()=>{const X=s=>__nnc.ev(s),M=X('MESH'),com=[],sem=[];const tem=m=>!!(m&&(m.tex||m.uvBuf||m.mod3d));
          for(const k in M){const m=M[k];if(!m||typeof m!=='object')continue;if(m.vao||m.count)(tem(m)?com:sem).push(k);else for(const j in m){const q=m[j];if(q&&(q.vao||q.count))(tem(q)?com:sem).push(k+'.'+j);}}
          return{comTextura:com.length,soCor:sem.length,exemplosSoCor:sem.slice(0,60)};}""")
        print('dados', json.dumps({'fogo': rel['fogo_mexe'], 'tex': [rel['texturas']['comTextura'], rel['texturas']['soCor']]}), flush=True)
        # 1. a cerca de estacas da clareira (a da sua foto)
        bar = await J("()=>{const B=__nnc.ev('BARRICADE_ARC');const a=B.angs[Math.floor(B.angs.length/2)]*Math.PI/180;return[B.r*Math.sin(a),-B.r*Math.cos(a)];}")
        await lugar(bar[0] * 0.55, bar[1] * 0.55, bar[0], bar[1], -0.05); await foto('cerca_estacas', 'cerca de estacas da clareira')
        # 2. construções do jogador num lugar seco
        s = await J(SECO, [28, 0, -90, -16, -60, 60])
        rel['lugar_obras'] = s
        if s:
            obras = await J("""([x0,z0])=>{const X=s=>__nnc.ev(s),O=X('OBRAS'),quero=['cerca','muro','muroPedra','barricada','estacas','portao','bau','parede','pilar','janela','porta'];
              const ok=quero.filter(k=>O[k]);let x=x0;const feitas=[];for(const k of ok){try{X('criarObra')(k,x,z0,0);feitas.push(k);}catch(e){}x+=Math.max(2.4,(O[k].hw||1)*2+1.2);}return{feitas,fim:x};}""", [s['x0'], s['z0']])
            rel['obras'] = obras; meio = (s['x0'] + obras['fim']) / 2
            await lugar(meio, s['z0'] - 10, meio, s['z0'], -0.05); await foto('construcoes', 'construções do jogador: ' + ', '.join(obras['feitas']))
            await lugar(s['x0'] + 3, s['z0'] - 4.0, s['x0'] + 3, s['z0'], -0.08); await foto('construcoes_perto', 'cerca e muro de madeira de perto')
        # 3. animais em fileiras, parados
        s = await J(SECO, [24, 8, -90, 40, -70, 70])
        if s:
            bichos = await J("""([x0,z0])=>{const n=__nnc,X=s=>n.ev(s),F=X('FAUNA'),tipos=Object.keys(F),xs=[];let i=0;
              for(const tp of tipos){const x=x0+(i%6)*4.4,z=z0-Math.floor(i/6)*5.5;const b=X('criarBicho')(tp,x,z,{yaw:Math.PI});if(b){window.__fixos.push({o:b,x,z,yaw:Math.PI});xs.push(tp);}i++;}return xs;}""", [s['x0'], s['z0']])
            rel['animais'] = bichos
            await lugar(s['x0'] + 11, s['z0'] + 9, s['x0'] + 11, s['z0'] - 3, -0.1); await foto('animais', 'animais: ' + ', '.join(bichos))
            await lugar(s['x0'] + 4.4, s['z0'] + 4.2, s['x0'] + 4.4, s['z0'], -0.15); await foto('animais_perto', 'animais de perto')
            await J("()=>{window.__fixos=[];}")
        # 4. zumbis de cada tipo, parados numa fileira
        s = await J(SECO, [21, 0, -90, 40, -70, 70])
        if s:
            zs = await J("""([x0,z0])=>{const n=__nnc,X=s=>n.ev(s);window.__semZ=false;n.Z.length=0;const tipos=['walker','runner','brute','screamer','rastejante','policial','inchado','caoZ'],xs=[];
              let i=0;for(const tp of tipos){const x=x0+i*2.8,z=z0;try{const z1=X('criarZ')(tp,x,z,{y:X('ground')(x,z)});const zz=z1&&typeof z1==='object'?z1:n.Z[n.Z.length-1];
                if(zz){window.__fixos.push({o:zz,x,z,yaw:Math.PI});xs.push(tp);}}catch(e){}i++;}return xs;}""", [s['x0'], s['z0']])
            rel['zumbis'] = zs
            await lugar(s['x0'] + 10, s['z0'] + 8, s['x0'] + 10, s['z0'], -0.06); await foto('zumbis', 'zumbis: ' + ', '.join(zs))
            await lugar(s['x0'] + 1.4, s['z0'] + 3.0, s['x0'] + 1.4, s['z0'], 0.0); await foto('zumbis_perto', 'zumbis de perto')
            await J("()=>{window.__semZ=true;window.__fixos=[];__nnc.Z.length=0;}")
        # 5. veículos: um de cada tipo, numa fileira
        s = await J(SECO, [56, 0, -120, 40, -80, 80])
        if s:
            vs = await J("""([x0,z0])=>{const X=s=>__nnc.ev(s),V=X('VEICS'),vistos={},xs=[];let x=x0;for(const v of V){if(vistos[v.tipo])continue;vistos[v.tipo]=1;
              v.x=x;v.z=z0;v.yaw=Math.PI/2;v.y=X('veicChao')(v,x,z0);window.__fixos.push({o:v,x,z:z0,y:v.y,yaw:Math.PI/2,carro:true});xs.push(v.tipo);x+=v.tipo==='heli'?11:7;}return{tipos:xs,fim:x};}""", [s['x0'], s['z0']])
            rel['veiculos'] = vs; meio = (s['x0'] + vs['fim']) / 2
            await lugar(meio, s['z0'] - 24, meio, s['z0'], -0.04); await foto('veiculos', 'um veículo de cada tipo: ' + ', '.join(vs['tipos']))
            await lugar(s['x0'] + 10, s['z0'] - 8, s['x0'] + 10, s['z0'], -0.1); await foto('veiculos_perto', 'veículos de perto')
            await J("()=>{window.__fixos=[];}")
        # 6. água: o rio perto da clareira e o lago
        await lugar(16.5, -6.0, 31, 9, -0.22); await foto('agua_rio', 'o Rio Claro perto da clareira')
        await lugar(48, 88, 66, 104, -0.15); await foto('agua_lago', 'o Lago Serra Azul')
        # 7. a mata de longe nos níveis Médio e Baixo (o mesmo lugar e ângulo da foto no Alto)
        cx, cz = 60, 132; d = (cx * cx + cz * cz) ** 0.5; ux, uz = cx / d, cz / d
        gy = await J("([x,z])=>__nnc.ev('ground')(x,z)", [cx - ux * 70, cz - uz * 70])
        for nivel in ['medio', 'baixo']:
            await J("(g)=>{const n=__nnc;n.cfg.graf=g;n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}}", nivel)
            await lugar(cx - ux * 70, cz - uz * 70, cx, cz, -0.12, '1', gy + 22); await foto('mata_de_longe_' + nivel, 'a mata de longe no nível ' + nivel)
        rel['erros'] = erros[:10]
        json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        print(json.dumps({'erros': erros[:6]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

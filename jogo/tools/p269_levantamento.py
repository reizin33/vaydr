"""p269: levantamento do que está sem textura ou sem animação, com capturas reais do jogo (sem edição), para o projeto
"textura em tudo". Começa um jogo, põe a câmera perto de cada coisa que o dono apontou e tira a foto: árvores (pinheiro,
morta, gigante), a árvore cortada, fogueira e fogo, barraca, cercas e construções, animais, zumbis, veículos e água.
Também mede se o fogo da fogueira se mexe (compara os ossos das chamas meio segundo depois) e lista o que tem textura.
Uso (na pasta jogo/): python3 tools/p269_levantamento.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'lev'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
OUT = BASE + 'shots/'
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
        # dia claro, sem zumbis nem bichos andando sozinhos; o que for posto para a foto fica parado no lugar (window.__fixos)
        await pg.evaluate("""()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;n.cfg.graf='alto';
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__fixos=[];window.__semZ=true;
          window.__cadaPasso=()=>{const n=__nnc;if(window.__semZ)n.Z.length=0;n.P.vida=100;n.G.hora=10;try{n.G.clima.atual='limpo';n.G.clima.k=1;n.G.chuva=0;}catch(e){}
            for(const f of window.__fixos){const o=f.o;o.x=f.x;o.z=f.z;if(f.y!==undefined)o.y=f.y;if(o.yaw!==undefined)o.yaw=f.yaw;if(o.vx!==undefined){o.vx=0;o.vz=0;}if(o.v!==undefined&&f.carro)o.v=0;}};}""")
        async def lugar(x, z, tx, tz, pitch=0.0, cam='1'):
            await pg.evaluate("""([x,z,tx,tz,pitch,cam])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam=cam;P.x=x;P.z=z;P.y=X('ground')(x,z);P.vx=P.vz=P.vy=0;P.noChao=true;
              P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, cam])
        async def foto(nome, oque, espera=7000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=OUT + PRE + '_' + nome + '.png', timeout=600000)
            rel['fotos'].append({'nome': nome, 'mostra': oque}); print('foto', nome, '%.0fs' % (time.time() - t0), flush=True)
        J = lambda s: pg.evaluate(s)
        # o que tem textura hoje (malhas desenhadas com imagem) e o que é só cor
        rel['texturas'] = await J("""()=>{const X=s=>__nnc.ev(s),M=X('MESH'),Z=X('ZMESH'),com=[],sem=[];
          const tem=m=>!!(m&&(m.tex||m.uvBuf||m.mod3d));
          for(const k in M){const m=M[k];if(!m||typeof m!=='object')continue;if(m.vao||m.count){(tem(m)?com:sem).push(k);}else if(typeof m==='object'){for(const j in m){const q=m[j];if(q&&(q.vao||q.count))(tem(q)?com:sem).push(k+'.'+j);}}}
          const z={};for(const k in Z){const v=Z[k];const a=Array.isArray(v)?v:[v];z[k]=a.map(q=>q&&q.mesh?(q.sk?'pele '+(q.sk.nome||'mixamo'):'cor'):'?').join(',');}
          return{comTextura:com,soCor:sem,personagens:z};}""")
        # 1. fogueira e fogo: o fogo se mexe? (ossos das chamas agora e meio segundo depois)
        F = await J("()=>{const F=__nnc.ev('FIRE');return[F[0],F[2]];}")
        await lugar(F[0] + 2.0, F[1] + 1.3, F[0], F[1], -0.38)
        a1 = await J("()=>Array.from(__nnc.ev('FIREM').m).slice(0,48)")
        await pg.wait_for_timeout(600)
        a2 = await J("()=>Array.from(__nnc.ev('FIREM').m).slice(0,48)")
        rel['fogo_mexe'] = {'diferenca_maxima': round(max(abs(x - y) for x, y in zip(a1, a2)), 5)}
        await foto('fogueira', 'fogueira da clareira com o fogo aceso, de perto')
        # 2. barraca
        T = await J("()=>__nnc.ev('TENT')")
        await lugar(T[0] + 3.6, T[1] + 2.6, T[0], T[1], -0.12); await foto('barraca', 'barraca da clareira')
        # 3. árvores: pinheiro, árvore morta, gigante (as mais perto da clareira, com espaço em volta)
        arv = await J("""()=>{const T=__nnc.ev('TREES'),out={};for(const t of T){if(!t.alive||t.agua)continue;const d=Math.hypot(t.x,t.z);if(d<9)continue;
          const k=t.kind===0?'pinheiro':t.kind===2?'morta':t.kind===3?'betula':'redonda';if(!out[k]||d<out[k].d)out[k]={id:t.id,x:t.x,z:t.z,d:+d.toFixed(1),s:+t.s.toFixed(2)};}
          const G=__nnc.ev('GIGANTES');if(G.length){let g=G[0],gd=1e9;for(const q of G){const d=Math.hypot(q.x,q.z);if(d<gd){gd=d;g=q;}}out.gigante={x:g.x,z:g.z,d:+gd.toFixed(1)};}return out;}""")
        rel['arvores'] = arv
        for k, dist, pit, oque in [('pinheiro', 5.5, 0.32, 'pinheiro (72% das árvores do mapa são deste tipo)'), ('morta', 5.0, 0.25, 'árvore morta'), ('gigante', 13.0, 0.42, 'árvore gigante da mata')]:
            if k not in arv: continue
            a = arv[k]; d = max(1e-3, (a['x'] ** 2 + a['z'] ** 2) ** 0.5); ux, uz = -a['x'] / d, -a['z'] / d
            await lugar(a['x'] + ux * dist, a['z'] + uz * dist, a['x'], a['z'], pit); await foto('arvore_' + k, oque)
        # 4. árvore cortada: derruba o pinheiro de perto (como o jogo faz ao terminar de cortar) e fotografa o que fica
        if 'pinheiro' in arv:
            a = arv['pinheiro']; d = max(1e-3, (a['x'] ** 2 + a['z'] ** 2) ** 0.5); ux, uz = -a['x'] / d, -a['z'] / d
            await pg.evaluate("(id)=>{const T=__nnc.ev('TREES'),t=T.find(q=>q.id===id);if(t)__nnc.ev('derrubarArvore')(t);}", a['id'])
            await lugar(a['x'] + ux * 3.2, a['z'] + uz * 3.2, a['x'], a['z'], -0.35); await foto('arvore_cortada', 'o mesmo pinheiro depois de cortado (o que sobra no chão)')
        # 5. cercas e construções do jogador, numa fileira perto da clareira
        obras = await J("""()=>{const n=__nnc,X=s=>n.ev(s),O=X('OBRAS'),quero=['cerca','muro','muroPedra','barricada','estacas','portao','bau','bancada','parede','pilar','porta','janela','plataforma','piso'];
          const ok=quero.filter(k=>O[k]);const x0=7,z0=12;let x=x0;const feitas=[];
          for(const k of ok){try{X('criarObra')(k,x,z0,0);feitas.push(k);}catch(e){}x+=Math.max(2.4,(O[k].hw||1)*2+1.2);}return{feitas,fim:x};}""")
        rel['obras'] = obras
        await lugar(7 + (obras['fim'] - 7) / 2, 12 - 9.5, 7 + (obras['fim'] - 7) / 2, 12, -0.05); await foto('construcoes', 'cercas e construções do jogador: ' + ', '.join(obras['feitas']))
        await lugar(9.5, 12 - 4.2, 9.5, 12, -0.1); await foto('construcoes_perto', 'cerca e muro de madeira de perto')
        # 6. animais em fileiras (parados no lugar), de frente para a câmera
        bichos = await J("""()=>{const n=__nnc,X=s=>n.ev(s),F=X('FAUNA'),tipos=Object.keys(F);window.__fixos=window.__fixos.filter(f=>!f.bicho);const xs=[];
          const z0=-22;let i=0;for(const tp of tipos){const x=-24+(i%6)*4.2,z=z0-Math.floor(i/6)*5.5;const b=X('criarBicho')(tp,x,z,{yaw:0});if(b){b.yaw=0;window.__fixos.push({o:b,x,z,yaw:0,bicho:true});xs.push(tp);}i++;}return xs;}""")
        rel['animais'] = bichos
        await lugar(-24 + 2.5 * 4.2, -22 + 9.5, -24 + 2.5 * 4.2, -24.5, -0.08); await foto('animais', 'animais do jogo: ' + ', '.join(bichos))
        await lugar(-24 + 1 * 4.2, -22 + 4.0, -24 + 1 * 4.2, -22, -0.12); await foto('animais_perto', 'animais de perto (' + ', '.join(bichos[:3]) + ')')
        # 7. zumbis de cada tipo, parados numa fileira
        zs = await J("""()=>{const n=__nnc,X=s=>n.ev(s);window.__semZ=false;n.Z.length=0;const tipos=['walker','runner','brute','screamer','rastejante','policial','inchado','caoZ'],xs=[];
          let i=0;for(const tp of tipos){const x=20+i*2.6,z=-16;try{const z1=X('criarZ')(tp,x,z,{y:X('ground')(x,z)});const zz=z1||n.Z[n.Z.length-1];if(zz){zz.yaw=Math.PI;window.__fixos.push({o:zz,x,z,yaw:Math.PI,zumbi:true});xs.push(tp);}}catch(e){}i++;}return xs;}""")
        rel['zumbis'] = zs
        await lugar(20 + 3.5 * 2.6, -16 + 7.5, 20 + 3.5 * 2.6, -16, -0.06); await foto('zumbis', 'zumbis: ' + ', '.join(zs))
        await lugar(20 + 0.5 * 2.6, -16 + 3.0, 20 + 0.5 * 2.6, -16, -0.02); await foto('zumbis_perto', 'zumbis de perto (comum e corredor)')
        await J("()=>{window.__semZ=true;window.__fixos=window.__fixos.filter(f=>!f.zumbi);__nnc.Z.length=0;}")
        # 8. veículos: uma fileira com um de cada tipo, perto da estrada da clareira
        vs = await J("""()=>{const X=s=>__nnc.ev(s),V=X('VEICS'),vistos={},xs=[];let x=-30;for(const v of V){if(vistos[v.tipo])continue;vistos[v.tipo]=1;
          const z=34;v.x=x;v.z=z;v.yaw=Math.PI/2;v.y=X('veicChao')(v,x,z);window.__fixos.push({o:v,x,z,y:v.y,yaw:Math.PI/2,carro:true});xs.push(v.tipo);x+=v.tipo==='heli'?11:7;}return{tipos:xs,fim:x};}""")
        rel['veiculos'] = vs
        meio = (-30 + vs['fim']) / 2
        await lugar(meio, 34 - 22, meio, 34, -0.04); await foto('veiculos', 'um veículo de cada tipo: ' + ', '.join(vs['tipos']))
        await lugar(-30 + 1.5 * 7, 34 - 8, -30 + 1.5 * 7, 34, -0.1); await foto('veiculos_perto', 'veículos de perto (' + ', '.join(vs['tipos'][:2]) + ')')
        # 9. água: o rio perto da clareira e o lago
        await lugar(16.5, -6.0, 31, 9, -0.22); await foto('agua_rio', 'o Rio Claro perto da clareira')
        await lugar(48, 88, 66, 104, -0.15); await foto('agua_lago', 'o Lago Serra Azul')
        rel['erros'] = erros[:10]
        json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        print(json.dumps({'fogo': rel['fogo_mexe'], 'erros': erros[:6]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

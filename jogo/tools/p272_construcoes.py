"""p272: todas as construções como estão hoje (capturas reais, sem edição), para o projeto "textura em tudo".
Monta cada aba do menu de construção (Muros, Defesa, Casa, Base, Oficina, Plantio e as peças fora das abas) numa fileira
num lugar seco e fotografa a fileira; o muro de pedra, o de chapa de ferro e o portão de ferro também de perto.
Depois fotografa as construções das regiões do mapa (Vila, Fazenda, Posto, Base Militar, Torre de rádio, um sítio, a ponte).
Uso (na pasta jogo/): python3 tools/p272_construcoes.py pagina.html prefixo"""
import asyncio, sys, os, json, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1]; PRE = sys.argv[2] if len(sys.argv) > 2 else 'obras'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
OUT = BASE + 'shots/'
SECO = """([L,Wz,xmin,xmax,zmin,zmax,usados])=>{const X=s=>__nnc.ev(s),T=X('TREES'),g=X('ground'),agua=X('aguaNivel');
  const livre=(x,z)=>{if(agua(x,z)!==null)return false;for(const t of T){if(t.alive&&Math.abs(t.x-x)<3&&Math.abs(t.z-z)<3)return false;}
    for(const u of usados){if(Math.abs(u[0]-x)<u[2]&&Math.abs(u[1]-z)<14)return false;}return true;};
  for(let z0=zmin;z0<=zmax;z0+=4)for(let x0=xmin;x0<=xmax;x0+=4){if(Math.hypot(x0+L/2,z0)<14)continue;const g0=g(x0,z0);let ok=true;
    for(let k=0;k<=L&&ok;k+=3)for(let w=0;w<=Wz&&ok;w+=3){const x=x0+k,z=z0-w;if(!livre(x,z)||Math.abs(g(x,z)-g0)>1.2)ok=false;}
    for(let k=0;k<=L&&ok;k+=4){const x=x0+k,z=z0+10;if(agua(x,z)!==null||!livre(x,z))ok=false;}
    if(ok)return{x0,z0};}return null;}"""
async def main():
    rel = {'fotos': [], 'abas': {}}
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
          try{n.ev('GRAF').alto.dpr=1;}catch(e){}n.aplicarCfg&&n.aplicarCfg();try{n.ev('resize')();}catch(e){}try{n.ev('FAUNA_POP').ativosMax=0;}catch(e){}
          window.__fixaY=null;window.__cadaPasso=()=>{const n=__nnc;if(window.__fixaY!==null){n.P.y=window.__fixaY;n.P.vy=0;}n.Z.length=0;n.P.vida=100;n.G.hora=10;
            try{n.G.clima.atual='limpo';n.G.clima.k=1;n.G.chuva=0;}catch(e){}};}""")
        async def lugar(x, z, tx, tz, pitch=0.0, y=None):
            await pg.evaluate("""([x,z,tx,tz,pitch,y])=>{const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam='1';window.__fixaY=y;P.x=x;P.z=z;P.y=(y===null?X('ground')(x,z):y);
              P.vx=P.vz=P.vy=0;P.noChao=(y===null);P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch=pitch;X('rebuildVeg')(true);X('rebuildGrass')();}""", [x, z, tx, tz, pitch, y])
        async def foto(nome, oque, espera=5000):
            await pg.wait_for_timeout(espera); await pg.evaluate("()=>{__nnc.ev('rebuildVeg')(true);__nnc.ev('rebuildGrass')();}"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=OUT + PRE + '_' + nome + '.png', timeout=600000)
            rel['fotos'].append({'nome': nome, 'mostra': oque}); print('foto', nome, '%.0fs' % (time.time() - t0), flush=True)
            json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        J = pg.evaluate
        # as abas do menu de construção, mais as peças que não estão em nenhuma aba
        abas = await J("""()=>{const X=s=>__nnc.ev(s),O=X('OBRAS'),C=X('OBRA_CATS'),M=X('MESH').obra||{},pom=(typeof POMAR!=='undefined')?Object.keys(POMAR):[];
          const tem=k=>!!O[k]&&!pom.includes(k);const out=C.map(c=>({id:c.id,nome:c.nome,t:c.t.filter(tem)}));
          const usados=new Set(out.flatMap(c=>c.t));const fora=Object.keys(O).filter(k=>tem(k)&&!usados.has(k));out.push({id:'outras',nome:'Fora das abas',t:fora});
          return out.filter(c=>c.t.length);}""")
        usados = []
        for aba in abas:
            ks = aba['t']; L = max(12, len(ks) * 3.6)
            s = await J(SECO, [L, 4, -150, 150, -150, 150, usados])
            if not s: print('sem lugar para', aba['id'], flush=True); continue
            usados.append([s['x0'] + L / 2, s['z0'], L / 2 + 8])
            r = await J("""([ks,x0,z0])=>{const X=s=>__nnc.ev(s),O=X('OBRAS');let x=x0;const feitas=[],falhou=[],pos={};
              for(const k of ks){const hw=Math.max(0.6,(O[k]&&O[k].hw)||1);x+=hw;try{X('criarObra')(k,x,z0,0);feitas.push(k);pos[k]=x;}catch(e){falhou.push(k+': '+String(e).slice(0,60));}x+=hw+1.4;}
              return{feitas,falhou,pos,fim:x};}""", [ks, s['x0'], s['z0']])
            rel['abas'][aba['id']] = {'nome': aba['nome'], **r}
            meio = (s['x0'] + r['fim']) / 2; dist = max(9.0, (r['fim'] - s['x0']) * 0.62)
            await lugar(meio, s['z0'] - dist, meio, s['z0'], -0.06)
            await foto('aba_' + aba['id'], aba['nome'] + ': ' + ', '.join(r['feitas']))
            for k in ('muroPedra', 'muroFerro', 'portaoFerro', 'palicada', 'muralha'):
                if k in r['pos']:
                    x = r['pos'][k]; await lugar(x - 0.6, s['z0'] - 3.6, x, s['z0'], -0.02); await foto('perto_' + k, k + ' de perto')
        # construções das regiões do mapa: de fora do lugar, olhando para o centro
        locais = await J("""()=>{const L=__nnc.ev('PLACES');const q=['vila','fazenda','posto','base','torre','sitio1'];
          return q.map(id=>L.find(p=>p.id===id)).filter(Boolean).map(p=>({id:p.id,nome:p.nome,x:p.x,z:p.z,r:p.r}));}""")
        for lc in locais:
            d = (lc['x'] ** 2 + lc['z'] ** 2) ** 0.5 or 1; ux, uz = -lc['x'] / d, -lc['z'] / d; k = lc['r'] * 0.85 + 4
            await lugar(lc['x'] + ux * k, lc['z'] + uz * k, lc['x'], lc['z'], -0.04); await foto('regiao_' + lc['id'], lc['nome'])
        pt = await J("()=>{const P=__nnc.ev('PONTE');return[P.x,P.z,P.hw];}")
        await lugar(pt[0] - pt[2] - 6, pt[1] - 7, pt[0], pt[1], -0.05); await foto('regiao_ponte', 'ponte do Rio Claro')
        rel['erros'] = erros[:10]
        json.dump(rel, open(OUT + PRE + '.json', 'w'), ensure_ascii=False, indent=1)
        print(json.dumps({'erros': erros[:6]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())

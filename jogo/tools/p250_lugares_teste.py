"""Confere os lugares escaneados jogando: anda contra a parede da casa, do bunker e do carro (tem que parar do lado de fora),
atravessa o galpão por dentro (tem que andar livre, no nível do piso), confere que a mata de dentro saiu de vez (marca .agua,
sem toco) e abre a tela de créditos pelo menu.
Uso (na pasta jogo/): SAIDA=t_lug.html python3 build.py && python3 tools/p250_lugares_teste.py t_lug.html"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# (nome, lugar, ponto de partida no espaço do lugar, para onde andar, segundos, o que conferir)
CASOS = [('casa', 'casaAbandonada', [0, 8], [0, 0], 3.5, 'fora'), ('bunker', 'bunker', [0, 6], [0, 0], 3, 'fora'),
         ('carro', 'carro1', [0, 4], [0, 0], 2.5, 'fora'), ('predioD', 'predioDestruido', [0, 8], [0, 0], 3, 'fora'),
         ('galpao', 'galpao', [-15, 0], [15, 0], 3, 'anda')]
PREP = """([lug,a,b])=>{const n=__nnc,X=s=>n.ev(s),L=X('LUGARES').find(l=>l.id===lug),M=X('lugMundo');const p=M(L,a[0],a[1]),t=M(L,b[0],b[1]),P=n.P;
  P.x=p[0];P.z=p[1];P.y=X('chaoEm')(p[0],p[1],L.y+0.3);P.vx=P.vz=P.vy=0;P.yaw=Math.atan2(t[0]-p[0],t[1]-p[1]);P.body=P.yaw;P.pitch=0;n.Z.length=0;P.vida=100;return[+P.x.toFixed(2),+P.z.toFixed(2)];}"""
MEDE = """([lug])=>{const n=__nnc,X=s=>n.ev(s),L=X('LUGARES').find(l=>l.id===lug),q=X('lugLocal')(L,n.P.x,n.P.z),t=X('LUGX')[L.m].tam;
  return{local:[+q[0].toFixed(2),+q[1].toFixed(2)],meia:[t[0]/2,t[2]/2],y:+n.P.y.toFixed(2),yLugar:+L.y.toFixed(2),dentroCaixa:!!X('pointBlocked')(n.P.x,n.P.z,0.05)}}"""
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 960, 'height': 540}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        # créditos: o botão está no menu, a tela abre, tem os autores CC BY e o Voltar volta
        res['creditos'] = await pg.evaluate("""()=>{const b=document.getElementById('m-creditos');if(!b)return{botao:false};b.click();const t=document.getElementById('t-creditos');
          const txt=t?t.textContent:'';const aberta=t&&!t.hidden;document.getElementById('cd-voltar').click();
          return{botao:true,aberta,autores:['Federico Paredes','AspectStudios','matousekfoto','Renafox','Prince Obrymec'].filter(a=>txt.includes(a)).length,cc:(txt.match(/CC BY 4.0/g)||[]).length,voltou:!document.getElementById('t-menu').hidden}}""")
        await pg.evaluate("()=>{window.__semRender=true;document.getElementById('m-novo').click();}")
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10.5;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;}")
        res['mata'] = await pg.evaluate("""()=>{const X=s=>__nnc.ev(s),L=X('LUGARES'),em=X('lugEm');let vivas=0,tiradas=0,semMarca=0;
          for(const t of X('TREES')){if(!em(t.x,t.z,0))continue;if(t.alive)vivas++;else if(t.agua)tiradas++;else semMarca++;}return{arvoresVivasDentro:vivas,tiradas,semMarca}}""")
        for nome, lug, a, alvo, seg, conf in CASOS:
            ini = await pg.evaluate(PREP, [lug, a, alvo]); await pg.wait_for_timeout(300)
            await pg.keyboard.down('w'); await pg.wait_for_timeout(int(seg * 1000)); await pg.keyboard.up('w'); await pg.wait_for_timeout(300)
            m = await pg.evaluate(MEDE, [lug]); m['inicio'] = ini
            lx, lz = abs(m['local'][0]), abs(m['local'][1]); hx, hz = m['meia']
            # parou do lado de fora: não entrou em caixa nenhuma e não chegou perto do meio (a casa tem varanda: para no guarda-corpo dela)
            if conf == 'fora': m['ok'] = not m['dentroCaixa'] and (lx * lx + lz * lz) ** 0.5 > 1.2
            else: m['ok'] = m['local'][0] - a[0] > 5 and abs(m['y'] - m['yLugar']) < 0.2
            res[nome] = m; print(nome, json.dumps(m, ensure_ascii=False), flush=True)
        res['erros'] = erros[:5]
        ok = res['creditos'].get('aberta') and res['creditos'].get('autores') == 5 and res['creditos'].get('voltou') and res['mata']['arvoresVivasDentro'] == 0 \
            and res['mata']['semMarca'] == 0 and all(res[c[0]]['ok'] for c in CASOS) and not erros
        res['resultado'] = 'PASSOU' if ok else 'FALHOU'
        print(json.dumps({k: res[k] for k in ('creditos', 'mata', 'erros', 'resultado')}, ensure_ascii=False)); await b.close()
asyncio.run(main())

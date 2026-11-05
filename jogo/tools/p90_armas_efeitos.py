"""p90: armas novas (espingarda, rifle com luneta, besta, bomba, isca), sangue/impacto e ferimentos (sangramento, perna, vírus e seringa)."""
import json, os
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "vivo=()=>{if(!P.alive){n.renascer();}G.modo='jogo';P.vida=100;},"
     "r2=v=>Math.round(v*100)/100,ZZ=(t,x,z,o)=>n.criarZ(t,x,z,Object.assign({y:n.chaoEm(x,z,50)},o||{})),"
     "sel=id=>{const i=P.inv.findIndex(q=>q&&q.id===id);if(i>=0&&i>5){const j=P.inv.slice(0,6).findIndex(q=>!q);const k=j>=0?j:0;const t=P.inv[k];P.inv[k]=P.inv[i];P.inv[i]=t;n.selecionar(k);return P.inv[k];}if(i>=0){n.selecionar(i);return P.inv[i];}return null;},"
     "mira=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;const hy=P.y+1.55;P.pitch=Math.atan2(y-hy,Math.hypot(dx,dz));};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
def ao_vivo(nome, c, antes=0.3, esp=2.2):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", esp], ["shot", nome], js("window.__semRender=true;window.__turbo=6;")]
X0, Z0 = "n.FIRE[0]+40", "n.FIRE[2]+2"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;G.chuva=0;G.chuvaAlvo=0;"),
         ["gwait", 0.3],
         js("for(const[k,q]of[['espingarda',1],['cartucho',12],['rifle',1],['balaRifle',8],['besta',1],['virote',6],['bombaCaseira',2],['isca',2],['seringa',2],['tala',1],['bandagem',2]])n.invAdd(k,q);"),
         ev("itens", "const ids=['espingarda','cartucho','rifle','balaRifle','besta','virote','bombaCaseira','isca','seringa','tala','mascaraGas'];return{faltaIcone:ids.filter(i=>!document.getElementById(n.ITEMS[i].icon)).join(','),malhas:['espingarda','rifle','besta','bombaCaseira','isca'].filter(i=>!n.MESH.arma[i]).join(','),receitas:['cartucho','balaRifle','besta','virote','bombaCaseira','isca','tala','seringa'].filter(r=>!n.RECIPES.find(q=>q.faz===r)).join(',')};")]
# 0) ajuste visual do capacete (três alturas), cachorro e inchado de perto
for i,(y,z) in enumerate([(0.13,0.02),(0.11,0.03),(0.15,0.0)]):
    steps += foto(f"29{5+i}_capacete_{i}.png", f"vivo();Z.length=0;vai({X0}-60,{Z0});const x0={X0},z0={Z0},y0=n.chaoEm(x0,z0,50);n.capAjuste({y},{z});const q=ZZ('policial',x0,z0);q.st='vaga';q.idleT=999;q.ch.yaw=Math.PI*0.82;window.__pol=q;G.camFix={{pos:[x0+0.55,y0+1.75,z0-1.25],tgt:[x0,y0+1.6,z0]}};", 0.15)
steps += foto("298_cachorro.png", f"Z.length=0;const x0={X0},z0={Z0},y0=n.chaoEm(x0,z0,50);const q=ZZ('caoZ',x0,z0);q.st='vaga';q.idleT=999;q.ch.yaw=Math.PI+0.7;G.camFix={{pos:[x0-0.9,y0+0.75,z0-1.5],tgt:[x0,y0+0.4,z0]}};", 0.15)
steps += foto("299_inchado.png", f"Z.length=0;const x0={X0},z0={Z0},y0=n.chaoEm(x0,z0,50);const q=ZZ('inchado',x0,z0);q.st='vaga';q.idleT=999;q.ch.yaw=Math.PI;G.camFix={{pos:[x0+0.3,y0+1.5,z0-2.0],tgt:[x0,y0+1.15,z0]}};", 0.15)
steps += [js("G.camFix=null;Z.length=0;")]
# 1) espingarda: de perto derruba; de longe espalha
steps += [js(f"vivo();Z.length=0;vai({X0},{Z0});const s=sel('espingarda');s.mun=5;window.__a=ZZ('walker',P.x,P.z+4);window.__b=ZZ('walker',P.x+0.6,P.z+22);for(const q of[window.__a,window.__b]){{q.st='dorme';q.ch.yaw=Math.PI;}}mira(P.x,P.y+1.2,P.z+4);"),
          ["gwait", 0.4],
          js("const s=P.inv[P.sel];n.atirarEsp(s,n.ITEMS.espingarda);"), ["gwait", 0.3],
          ev("espingarda_perto", "const a=window.__a;return{vivo:a.vivo,hp:Math.round(a.hp),mun:P.inv[P.sel].mun,feridas:(a.feridas||[]).length,gotas:n.MANCHAS.filter(m=>m.tipo==='gota').length,manchas:n.MANCHAS.length};"),
          js("mira(window.__b.x,P.y+1.2,window.__b.z);const s=P.inv[P.sel];n.atirarEsp(s,n.ITEMS.espingarda);"), ["gwait", 0.3],
          ev("espingarda_longe", "const b=window.__b;return{vivo:b.vivo,dano:Math.round(b.hpMax-b.hp)};"),
          js("P.acao=null;const s=P.inv[P.sel];s.mun=2;n.recarregar();window.__rec=P.acao&&P.acao.dur;"), ["gwait", 2.5],
          ev("espingarda_recarga", "return{dur:r2(window.__rec||0),mun:P.inv[P.sel].mun,cart:n.invCount('cartucho')};")]
steps += foto("300_sangue_chao.png", "Z.length=0;G.camFix={pos:[P.x+2.2,P.y+2.0,P.z+1.0],tgt:[P.x,P.y,P.z+4.5]};", 0.1)
# 2) rifle: luneta e atravessa dois zumbis em fila
steps += [js(f"G.camFix=null;vivo();Z.length=0;vai({X0},{Z0});const s=sel('rifle');s.mun=5;window.__f=[ZZ('walker',P.x,P.z+15),ZZ('walker',P.x,P.z+17)];for(const q of window.__f){{q.st='dorme';q.ch.yaw=Math.PI;}}mira(P.x,P.y+1.3,P.z+15);n.IN.aim=true;"),
          ["gwait", 0.6],
          ev("luneta", "return{ativa:n.lunetaAtiva(),tela:!document.getElementById('luneta').hidden,fov:r2(n.cam.fov),mira:document.getElementById('mira').classList.contains('escondido')};")]
steps += ao_vivo("301_luneta.png", "", 0.05)
steps += [js("const s=P.inv[P.sel];n.atirarEsp(s,n.ITEMS.rifle);n.IN.aim=false;"), ["gwait", 0.4],
          ev("rifle_atravessa", "const f=window.__f;return{a:f[0].vivo?Math.round(f[0].hpMax-f[0].hp):'morto',b:f[1].vivo?Math.round(f[1].hpMax-f[1].hp):'morto'};")]
# 3) besta: virote voa, acerta e dá para recolher
steps += [js(f"vivo();Z.length=0;vai({X0},{Z0});const s=sel('besta');s.mun=1;window.__c=ZZ('walker',P.x,P.z+12);window.__c.st='dorme';window.__c.ch.yaw=Math.PI;mira(P.x,P.y+1.2,P.z+12);window.__v0=n.invCount('virote');"),
          ["gwait", 0.4], js("const s=P.inv[P.sel];n.atirarEsp(s,n.ITEMS.besta);"), ["gwait", 1.2],
          ev("besta", "const c=window.__c;return{dano:Math.round(c.hpMax-c.hp),vivo:c.vivo,flechas:n.FLECHAS.filter(f=>f.item==='virote').length,mun:P.inv[P.sel].mun,virotes:n.invCount('virote'),acao:P.acao&&P.acao.tipo};")]
# 4) bomba caseira e isca de barulho
steps += [js(f"vivo();Z.length=0;vai({X0},{Z0});window.__g=[ZZ('walker',P.x+14,P.z+14),ZZ('runner',P.x+15.5,P.z+13),ZZ('walker',P.x+8,P.z+8)];for(const q of window.__g){{q.st='dorme';}}n.aterrissar({{tipo:'bombaCaseira',t:0}},[P.x+14,P.y,P.z+14]);"),
          ["gwait", 3.2],
          ev("bomba", "return{zumbis:window.__g.map(q=>q.vivo?Math.round(q.hpMax-q.hp):'morto').join(','),vida:Math.round(P.vida),bombas:n.BOMBAS.length};"),
          js(f"vivo();Z.length=0;vai({X0},{Z0});window.__i=ZZ('walker',P.x+20,P.z-15);window.__i.st='vaga';window.__i.idleT=99;n.aterrissar({{tipo:'isca',t:0}},[P.x+20,P.y,P.z+12]);"),
          ["gwait", 6.0],
          ev("isca", "const q=window.__i,l=n.ISCAS[0];return{st:q.st,dIsca:l?r2(Math.hypot(q.x-l.x,q.z-l.z)):null,iscas:n.ISCAS.length};"),
          js("Z.length=0;n.ISCAS.length=0;")]
steps += ao_vivo("302_explosao.png", f"vivo();vai({X0}+30,{Z0});n.aterrissar({{tipo:'bombaCaseira',t:0}},[P.x+7,P.y,P.z+7]);n.BOMBAS[0].t=2.35;G.camFix={{pos:[P.x-1,P.y+2.2,P.z-1.5],tgt:[P.x+7,P.y+1.0,P.z+7]}};", 0.12, 0.5)
# 5) quando você apanha: sangue na tela, câmera, cambaleio
steps += [js(f"G.camFix=null;vivo();Z.length=0;vai({X0},{Z0}-30);P.yaw=0;P.body=0;window.__z=ZZ('walker',P.x+1.2,P.z+0.8);window.__z.st='dorme';n.ferirJogador(22,window.__z);"),
          ["gwait", 0.08],
          ev("apanhou", "const t=document.getElementById('tela-sangue');return{manchasTela:t.children.length,kick:r2(P.kickT||0),cambaleia:r2(P.cambaleia||0),roll:r2(n.cam.roll||0),vida:Math.round(P.vida),empurrado:r2(Math.hypot(P.vx,P.vz))};")]
steps += ao_vivo("303_apanhou.png", "n.ferirJogador(25,window.__z);", 0.05, 0.25)
steps += ao_vivo("304_pouca_vida.png", "Z.length=0;P.vida=14;", 0.6, 2.0)
# 6) ferimentos: sangramento para com bandagem; perna quebrada deixa lento e a tala ajuda
steps += [js("vivo();n.lesao('sangramento',null);P.lesoes.sangra=2;"), ["gwait", 2.0],
          ev("sangrando", "return{vida:Math.round(P.vida),chip:!document.getElementById('vx-sangra').hidden,gotas:n.MANCHAS.filter(m=>m.tipo==='gota').length};"),
          js("const i=P.inv.findIndex(q=>q&&q.id==='bandagem');n.usarItem(i);"), ev("bandagem", "return{sangra:P.lesoes.sangra};"),
          js("n.lesao('perna',null);"), ev("perna", "return{vel:n.lesaoVel(),chip:document.getElementById('vx-perna').textContent.trim()};"),
          js("const i=P.inv.findIndex(q=>q&&q.id==='tala');n.usarItem(i);"), ev("tala", "return{vel:n.lesaoVel(),chip:document.getElementById('vx-perna').textContent.trim()};"),
          js("P.lesoes.perna=0;n.updateLesoes(0);")]
# 7) vírus: ataque passa o vírus, sobe, mostra veias; seringa cura; sem seringa mata e o corpo levanta
steps += [js("vivo();P.roupa={};let v=false;for(let k=0;k<60&&!v;k++){n.lesaoMordida({tipo:'rastejante'});v=P.lesoes.virus>0;}window.__mordeu=v;"),
          ev("virus_pegou", "return{pegou:window.__mordeu,virus:r2(P.lesoes.virus),chip:document.getElementById('vx-infec').textContent.trim()};"),
          js("P.lesoes.virus=70;"), ["gwait", 1.0],
          ev("virus_70", "return{vidaMax:n.vidaMax?n.vidaMax():null,veias:!document.getElementById('tela-veias').hidden,cinza:document.getElementById('tela-cinza').style.opacity};")]
steps += ao_vivo("305_virus.png", "P.lesoes.virus=82;P.vida=60;", 0.3, 2.2)
steps += [js("const i=P.inv.findIndex(q=>q&&q.id==='seringa');n.usarItem(i);"), ["gwait", 0.5],
          ev("seringa", "return{virus:P.lesoes.virus,imune:r2(P.lesoes.imuneH),chip:!document.getElementById('vx-infec').hidden,veias:!document.getElementById('tela-veias').hidden};"),
          js("P.lesoes.imuneH=0;n.lesaoMordida({tipo:'walker'});P.lesoes.virus=99.6;window.__px=[P.x,P.z];"), ["gwait", 3.0],
          ev("virus_matou", "return{vivo:P.alive,causa:G.causa||null,txt:document.getElementById('morte-t')?document.getElementById('morte-t').textContent:''};"),
          js("n.renascer();G.modo='jogo';"), ["gwait", 2.0],
          ev("corpo_levantou", "const p=window.__px;return{zumbiPerto:Z.filter(q=>q.vivo&&Math.hypot(q.x-p[0],q.z-p[1])<3).length,virus:P.lesoes.virus};")]
# 8) receita da seringa na oficina
steps += [js("vivo();G.fab.nv=2;vai(n.BENCH[0]+1.2,n.BENCH[1]+0.8);n.invAdd('remedios',2);n.invAdd('antisseptico',1);n.invAdd('agua',1);"),
          ev("receita_seringa", "const r=n.RECIPES.find(q=>q.faz==='seringa');return{pode:n.podeFabricar(r),custo:r.custo};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p90.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))

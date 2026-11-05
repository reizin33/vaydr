"""Gera p57.json: bases nas árvores (plataforma, parapeito, escada de corda, ponte, telhado, lamparina, baú), salvar/carregar, zumbi embaixo e queda em cadeia."""
import json, os
J = lambda s: s.strip()
ACHA = "const n=__nnc,pl=n.OB.find(o=>o.tipo==='plataforma'),es=n.OB.find(o=>o.tipo==='escadaCorda');"
steps = [
 ["wait", 3], ["click", "#m-novo"], ["wait", 2],
 ["js", "window.__turbo=6;window.__semRender=true;"],
 ["gwait", 0.3],
 ["eval", "setup", J("""(()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;
  for(const[k,q]of[['tabuas',60],['corda',30],['pregos',30],['fibra',20],['sucata',6],['pano',4],['graveto',6]])n.invAdd(k,q);
  const G2=n.GIGANTES;let A=null,B=null,bd=1e9;for(const a of G2)for(const b of G2){if(a===b)continue;const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<bd){bd=d;A=a;B=b;}}
  window.__A=A;window.__B=B;const gE=(b,t)=>[b.ax+(b.bx-b.ax)*t,b.ay+(b.by-b.ay)*t+(b.r0+(b.r1-b.r0)*t)*0.95,b.az+(b.bz-b.az)*t];
  let best=null,bs=1e9;for(const ka of A.galhos)for(let ta=0.55;ta<=0.96;ta+=0.1)for(const kb of B.galhos)for(let tb=0.25;tb<=0.96;tb+=0.1){const p=gE(ka,ta),q=gE(kb,tb),d=Math.hypot(p[0]-q[0],p[2]-q[2]),dy=Math.abs(p[1]-q[1]);
    if(d<5||d>13||dy>2)continue;let livre=true;for(const T of G2){const vx=q[0]-p[0],vz=q[2]-p[2],L2=vx*vx+vz*vz,t=Math.max(0,Math.min(1,((T.x-p[0])*vx+(T.z-p[2])*vz)/L2));if(Math.hypot(p[0]+vx*t-T.x,p[2]+vz*t-T.z)<T.R+0.9){livre=false;break;}}if(!livre)continue;const s=dy*2+Math.abs(d-8)*0.2;if(s<bs){bs=s;best={ka:A.galhos.indexOf(ka),kb:B.galhos.indexOf(kb),p,q,d,dy};}}
  window.__P2=best;const kp=best&&best.ka===0&&A.galhos.length>1?1:0;window.__kp=kp;const v=A.vias[kp];
  n.P.x=v.topo.x;n.P.z=v.topo.z;n.P.y=v.topo.y+0.02;n.P.vy=0;n.P.yaw=v.topo.rumo;n.P.body=v.topo.rumo;n.P.escala=null;
  return{gigantes:G2.length,dAB:+bd.toFixed(1),galhosA:A.galhos.length,kp,ponte:best?{ka:best.ka,kb:best.kb,d:+best.d.toFixed(1),dy:+best.dy.toFixed(2)}:null};})()""")],
 ["gwait", 0.4],
 ["eval", "plat", J("""(()=>{const n=__nnc;n.modoObra(true);n.OBRA.tipo='plataforma';n.OBRA.rot=0;n.obraAlvo();const O=n.OBRA;
  return{ok:O.ok,motivo:O.motivo,apoio:O.ext&&O.ext.apoio,y:+O.y.toFixed(2),pesJogador:+n.P.y.toFixed(2),menu:n.obrasVisiveis().join(',')};})()""")],
 ["js", "__nnc.colocarObra()"],
 ["eval", "platFeita", J("(()=>{" + ACHA + "return pl?{y:+pl.y.toFixed(2),apoio:pl.apoio,sup:!!pl.sup,alturaDoChao:+(pl.y-n.ground(pl.x,pl.z)).toFixed(1)}:null;})()")],
 ["js", J("(()=>{" + ACHA + "n.P.x=pl.x;n.P.z=pl.z;n.P.y=pl.y+0.05;n.P.vy=0;})()")],
 ["gwait", 0.5],
 ["eval", "naPlat", J("(()=>{" + ACHA + "return{dy:+(n.P.y-pl.y).toFixed(3),noChao:n.P.noChao,chaoEm:+(n.chaoEm(n.P.x,n.P.z,n.P.y)-pl.y).toFixed(3)};})()")],
 ["eval", "parapeito", J("(()=>{" + ACHA + "n.P.x=pl.x;n.P.z=pl.z;n.P.yaw=pl.yaw+Math.PI/2;n.OBRA.tipo='parapeito';n.obraAlvo();const r={ok:n.OBRA.ok,motivo:n.OBRA.motivo};n.colocarObra();r.feito=n.OB.some(o=>o.tipo==='parapeito');return r;})()")],
 ["eval", "escada", J("(()=>{" + ACHA + "n.P.x=pl.x;n.P.z=pl.z;n.P.yaw=pl.yaw+Math.PI*1.5;n.OBRA.tipo='escadaCorda';n.obraAlvo();const r={ok:n.OBRA.ok,motivo:n.OBRA.motivo};n.colocarObra();const e=n.OB.find(o=>o.tipo==='escadaCorda');r.h=e?+e.h.toFixed(1):null;r.via=!!(e&&e.via&&n.VIAS.includes(e.via));n.modoObra(false);return r;})()")],
 ["js", J("(()=>{" + ACHA + "const t=es.via.topo;n.P.x=t.x;n.P.z=t.z;n.P.y=t.y+0.02;n.P.vy=0;n.P.yaw=es.yaw;n.P.body=es.yaw;})()")],
 ["gwait", 0.3],
 ["eval", "alvoTopo", "(()=>{const a=__nnc.alvo;return a?{k:a.k,t:__nnc.textoInter(a).t}:null;})()"],
 ["press", "e"],
 ["gwait", 0.1],
 ["eval", "desce", "(()=>{const n=__nnc;return{esc:!!n.P.escala,u:n.P.escala?+n.P.escala.u.toFixed(2):null};})()"],
 ["js", "window.__turbo=2;"], ["down", "s"], ["until", "!__nnc.P.escala", 120], ["up", "s"], ["js", "window.__turbo=6;"], ["gwait", 0.4],
 ["eval", "chegouChao", "(()=>{const n=__nnc,es=n.OB.find(o=>o.tipo==='escadaCorda'),b=es.via.base;return{esc:!!n.P.escala,alto:+(n.P.y-n.ground(n.P.x,n.P.z)).toFixed(2),dBase:+Math.hypot(n.P.x-b.x,n.P.z-b.z).toFixed(2),vida:Math.round(n.P.vida)};})()"],
 ["eval", "alvoBase", "(()=>{const a=__nnc.alvo;return a?{k:a.k,t:__nnc.textoInter(a).t}:null;})()"],
 ["press", "e"], ["js", "window.__turbo=2;"], ["down", "w"], ["until", "!__nnc.P.escala", 120], ["up", "w"], ["js", "window.__turbo=6;"], ["gwait", 0.6],
 ["eval", "subiuEscada", J("(()=>{" + ACHA + "return{esc:!!n.P.escala,dy:+(n.P.y-pl.y).toFixed(2)};})()")],
 ["js", J("(()=>{" + ACHA + "const t=es.via.topo;n.P.x=t.x;n.P.z=t.z;n.P.y=t.y+0.02;n.P.vy=0;n.P.yaw=es.yaw;n.P.body=es.yaw;})()")],
 ["gwait", 0.3],
 ["down", "e"], ["gwait", 1.2], ["up", "e"], ["gwait", 0.3],
 ["eval", "recolheu", J("(()=>{" + ACHA + "const a=n.alvo;return{recolhida:es.via.recolhida,esc:!!n.P.escala,viaPerto:!!n.viaPerto(),alvo:a?a.k:null};})()")],
 ["press", "e"], ["gwait", 0.2],
 ["eval", "baixou", J("(()=>{" + ACHA + "const r={recolhida:es.via.recolhida};n.escadaRecolher(es,true);r.recolhidaDeNovo=es.via.recolhida;return r;})()")],
 # ponte de galho a galho entre as duas gigantes
 ["eval", "ponte", J("""(()=>{const n=__nnc,b=window.__P2;if(!b)return null;const p=b.p,q=b.q,yaw=Math.atan2(q[0]-p[0],q[2]-p[2]);
  n.P.x=p[0];n.P.z=p[2];n.P.y=p[1]+0.02;n.P.vy=0;n.P.yaw=yaw;n.P.body=yaw;n.modoObra(true);n.OBRA.tipo='ponteCorda';n.obraAlvo();const O=n.OBRA,r={ok:O.ok,motivo:O.motivo,ext:O.ext};
  n.colocarObra();n.modoObra(false);const o=n.OB.find(o=>o.tipo==='ponteCorda');r.feita=!!o;if(o)r.L=+Math.hypot(o.ext.bx-o.ext.ax,o.ext.bz-o.ext.az).toFixed(1);return r;})()""")],
 # anda pelo eixo da ponte que ficou pronta (a ponte liga os galhos que o jogo escolheu, não exatamente os pontos da busca)
 ["js", J("""(()=>{const n=__nnc,o=n.OB.find(o=>o.tipo==='ponteCorda');if(!o)return;const e=o.ext,yaw=Math.atan2(e.bx-e.ax,e.bz-e.az);
  n.P.x=e.ax+Math.sin(yaw)*0.3;n.P.z=e.az+Math.cos(yaw)*0.3;n.P.y=n.chaoEm(n.P.x,n.P.z,e.ay+1);n.P.vy=0;n.P.vx=n.P.vz=0;n.P.yaw=yaw;n.P.body=yaw;n.P.pitch=0;})()""")], ["gwait", 0.3],
 ["down", "w"], ["gwait", 4.0], ["up", "w"], ["gwait", 0.4],
 ["eval", "atravessou", J("""(()=>{const n=__nnc,o=n.OB.find(o=>o.tipo==='ponteCorda');if(!o)return null;const e=o.ext;
  return{dFim:+Math.hypot(n.P.x-e.bx,n.P.z-e.bz).toFixed(2),dInicio:+Math.hypot(n.P.x-e.ax,n.P.z-e.az).toFixed(2),alto:+(n.P.y-n.ground(n.P.x,n.P.z)).toFixed(1),dyFim:+(n.P.y-e.by).toFixed(2),vida:Math.round(n.P.vida)};})()""")],
 # telhado, lamparina e baú em cima da plataforma
 ["eval", "objetos", J("(()=>{" + ACHA + """const c=Math.cos(pl.yaw),s=Math.sin(pl.yaw),W=(lx,lz)=>[pl.x+lx*c+lz*s,pl.z-lx*s+lz*c],r={};
  n.P.x=pl.x;n.P.z=pl.z;n.P.y=pl.y+0.02;n.P.vy=0;n.modoObra(true);
  n.OBRA.tipo='telhado';n.obraAlvo();r.telhado=n.OBRA.ok||n.OBRA.motivo;n.colocarObra();
  const mira=()=>{n.cam.fwd=[0,0,1];n.cam.right=[0,0,0];};let w=W(0,-0.8);n.P.x=w[0];n.P.z=w[1];n.P.yaw=pl.yaw;n.OBRA.tipo='lamparina';n.OBRA.rot=0;mira();n.obraAlvo();r.lamparina=n.OBRA.ok||n.OBRA.motivo;r.lampY=+(n.OBRA.y-pl.y).toFixed(2);n.colocarObra();
  w=W(0,0.6);n.P.x=w[0];n.P.z=w[1];n.P.yaw=pl.yaw+Math.PI;n.OBRA.tipo='bau';mira();n.obraAlvo();r.bau=n.OBRA.ok||n.OBRA.motivo;n.colocarObra();n.modoObra(false);
  const bau=n.OB.find(o=>o.tipo==='bau'&&o.y>pl.y-0.3);if(bau)bau.itens[0]={id:'tabuas',n:3};
  r.tipos=n.OB.filter(o=>o.y-n.ground(o.x,o.z)>1).map(o=>o.tipo).sort().join(',');r.luzLamparina=n.FIRES.some(f=>f.lamp);return r;})()""")],
 ["js", "__nnc.salvarJogo()"],
 ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2],
 ["js", "window.__turbo=6;window.__semRender=true;"],
 ["gwait", 0.4],
 ["eval", "carregado", J("(()=>{" + ACHA + """const alto=n.OB.filter(o=>o.y-n.ground(o.x,o.z)>1);const po=n.OB.find(o=>o.tipo==='ponteCorda'),bau=alto.find(o=>o.tipo==='bau');
  return{tipos:alto.map(o=>o.tipo).sort().join(','),platSup:!!(pl&&pl.sup&&n.SUPS.includes(pl.sup)),escadaRecolhida:!!(es&&es.via&&es.via.recolhida),viaNaLista:!!(es&&n.VIAS.includes(es.via)),
   ponteSup:!!(po&&po.sup&&n.SUPS.includes(po.sup)),ponteExt:po?po.ext:null,bauItem:bau&&bau.itens[0]?bau.itens[0].id+'x'+bau.itens[0].n:null,lamp:n.FIRES.filter(f=>f.lamp).length,
   jogadorY:+n.P.y.toFixed(2)};})()""")],
 # zumbi embaixo da plataforma
 ["js", J("(()=>{" + ACHA + "n.P.x=pl.x;n.P.z=pl.z;n.P.y=pl.y+0.02;n.P.vy=0;n.Z.length=0;window.__v0=n.P.vida;const z=n.criarZ('walker',pl.x+1.2,pl.z+0.8);z.st='caca';z.viu=0;window.__z=z;})()")],
 ["gwait", 4],
 ["eval", "zumbi4s", "(()=>{const n=__nnc,z=window.__z;return{st:z.st,fora:+(z.fora||0).toFixed(1),vida:Math.round(n.P.vida),antes:Math.round(window.__v0),dist:+Math.hypot(z.x-n.P.x,z.z-n.P.z).toFixed(1),dy:+(n.P.y-z.y).toFixed(1)};})()"],
 ["gwait", 13],
 ["eval", "zumbi17s", "(()=>{const n=__nnc,z=window.__z;return{st:z.st,ignora:+(z.ignora||0).toFixed(1),vida:Math.round(n.P.vida)};})()"],
 # queda em cadeia
 ["eval", "cadeia", J("(()=>{" + ACHA + """n.Z.length=0;n.P.x=pl.x+8;n.P.z=pl.z+8;n.P.y=n.ground(n.P.x,n.P.z);n.P.vy=0;const antes=n.OB.length,y=pl.y,ev=es&&es.via;n.destruirObra(pl);
  const sobrou=n.OB.filter(o=>Math.abs(o.y-y)<0.4&&o.tipo!=='ponteCorda').map(o=>o.tipo);const d=n.DROPS2().find(d=>d.itens.some(i=>i[0]==='tabuas'));
  return{antes,depois:n.OB.length,sobrouNaAltura:sobrou.join(','),dropTabuas:!!d,dropNoChao:d?+(d.y-n.ground(d.x,d.z)).toFixed(2):null,viaEscada:!!(ev&&n.VIAS.includes(ev))};})()""")],
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
out = os.path.join(os.path.dirname(__file__), '..', 'p57.json')
json.dump(plan, open(out, 'w'), ensure_ascii=False)
print('ok', len(steps))

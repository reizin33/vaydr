"""p63: base dentro de prédio (tábuas em porta e janela, baú, colchão), telhado (plataforma, fogueira), zumbi forçando as tábuas, salvar, renascer no colchão."""
import json, os
J=lambda s:s.strip()
A="const n=__nnc,C=n.CID,a=C.predios[0];const W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];const mira=()=>{n.cam.fwd=[0,0,1];n.cam.right=[0,0,0];};"
# os cercos dos sobreviventes (Seu Jorge na oficina, Marina na delegacia, Tião no metrô) põem 3 ou 4 zumbis caçando o jogador
# assim que ele chega perto; parado no meio do teste ele morre (igual na versão anterior). Este teste confere a cidade, então os cercos ficam desligados.
SEM_CERCO = ["js", "(()=>{try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}})()"]
steps=[["wait",3],["click","#m-novo"], SEM_CERCO,["wait",1],
 ["js",J("(()=>{"+A+"n.G.hora=10;n.Z.length=0;for(const[k,q]of[['tabuas',60],['pregos',40],['pano',20],['pedra',10],['graveto',10],['fibra',10],['corda',10],['sucata',6]])n.invAdd(k,q);})()")],
 ["eval","sala",J("(()=>{"+A+"const s=a.salas[1].find(s=>s.tipo==='apartamento'&&s.u0<a.uc);window.__s=s;const d=C.portas.find(d=>d.p===a&&d.f===1&&(d.sA===s||d.sB===s)&&d.larg<1.3&&(d.sA&&d.sA.tipo==='corredor'||d.sB&&d.sB.tipo==='corredor'));window.__d=d;n.portaEstado(d,'aberta');\n  const w=W(a,(s.u0+s.u1)/2,(s.v0+s.v1)/2);n.P.x=w[0];n.P.z=w[1];n.P.y=s.y;n.P.vy=0;return{sala:s.tipo,f:s.f,porta:d?d.id:null};})()")],
 ["gwait",0.3],
 ["eval","menu","(()=>{const n=__nnc;n.modoObra(true);return{ctx:n.contextoObra(),menu:n.obrasVisiveis().join(',')};})()"],
 ["eval","tabuasPorta",J("(()=>{"+A+"const d=window.__d;const dx=d.x-n.P.x,dz=d.z-n.P.z,yy=Math.atan2(dx,dz);const k=1-1.6/Math.hypot(dx,dz);n.P.x+=dx*k;n.P.z+=dz*k;n.P.yaw=yy;n.P.body=yy;n.OBRA.tipo='tabuasPorta';mira();n.obraAlvo();const r={ok:n.OBRA.ok,motivo:n.OBRA.motivo,ext:n.OBRA.ext};n.colocarObra();r.feito=n.OB.some(o=>o.tipo==='tabuasPorta');r.texto=n.textoInter({k:'porta',o:d}).t;return r;})()")],
 ["eval","tabuasJanela",J("(()=>{"+A+"const s=window.__s;const j=C.janelas.filter(j=>j.p===a&&j.f===1).sort((p,q)=>Math.hypot(p.x-s.x,p.z-s.z)-Math.hypot(q.x-s.x,q.z-s.z))[0];const dx=j.x-n.P.x,dz=j.z-n.P.z,yy=Math.atan2(dx,dz);n.P.x=j.x-Math.sin(j.yaw)*1.4;n.P.z=j.z-Math.cos(j.yaw)*1.4;n.P.yaw=j.yaw;n.P.body=j.yaw;n.OBRA.tipo='tabuasJanela';mira();n.obraAlvo();const r={ok:n.OBRA.ok,motivo:n.OBRA.motivo};n.colocarObra();r.feito=n.OB.some(o=>o.tipo==='tabuasJanela');return r;})()")],
 ["eval","bauCama",J("(()=>{"+A+"const s=window.__s;const w=W(a,(s.u0+s.u1)/2,(s.v0+s.v1)/2);n.P.x=w[0];n.P.z=w[1];n.P.yaw=a.yaw+Math.PI/2;n.P.body=n.P.yaw;const r={};\n   n.obraAlvo();for(const t of['bau','cama','fogueira']){let ok=false;for(const fu of[0.5,0.3,0.7]){for(const fv of[0.5,0.3,0.7]){const w2=W(a,s.u0+(s.u1-s.u0)*fu,s.v0+(s.v1-s.v0)*fv);n.P.x=w2[0];n.P.z=w2[1];for(const rot of[0,1.57,3.14,4.71]){n.OBRA.ctx=n.contextoObra();n.OBRA.tipo=t;n.OBRA.rot=0;n.P.yaw=a.yaw+rot;mira();n.obraAlvo();if(n.OBRA.ok){ok=true;break;}}if(ok)break;}if(ok)break;}r[t]=n.OBRA.ok?'ok':n.OBRA.motivo;if(n.OBRA.ok){n.colocarObra();}}\n   const b=n.OB.find(o=>o.tipo==='bau'),c=n.OB.find(o=>o.tipo==='cama');r.bauY=b?+(b.y-s.y).toFixed(2):null;if(c){n.alvo={k:'camaObra',o:c};n.interagir(false);n.ev('usarSolta')();}r.cama=n.G.cama?true:false;if(b)b.itens[0]={id:'pregos',n:5};return r;})()")],
 # (colchão desde a v8: toque = salva e vira ponto de volta; segurar = dormir. O teste simula o toque: aperta e solta.)
 # telhado
 ["eval","telhado",J("(()=>{"+A+"const t=a.telhado;const w=W(a,3,4);n.P.x=w[0];n.P.z=w[1];n.P.y=t.y;n.P.vy=0;n.P.yaw=a.yaw;n.P.body=a.yaw;const r={ctx:n.contextoObra(),menu:n.obrasVisiveis().join(',')};\n   n.OBRA.tipo='plataforma';n.OBRA.rot=0;mira();n.obraAlvo();r.plat=n.OBRA.ok?n.OBRA.ext.apoio:n.OBRA.motivo;if(n.OBRA.ok)n.colocarObra();\n   n.P.yaw=a.yaw+Math.PI/2;n.OBRA.tipo='fogueira';mira();n.obraAlvo();r.fogo=n.OBRA.ok?'ok':n.OBRA.motivo;if(n.OBRA.ok)n.colocarObra();n.modoObra(false);return r;})()")],
 # zumbi no corredor tenta entrar pela porta pregada
 ["eval","zumbiPorta",J("(()=>{"+A+"const s=window.__s,d=window.__d;const w=W(a,(s.u0+s.u1)/2,(s.v0+s.v1)/2);n.P.x=w[0];n.P.z=w[1];n.P.y=s.y;n.P.vy=0;const cor=a.salas[1].find(q=>q.tipo==='corredor');\n   const z=n.criarZ('walker',cor.x,cor.z,{y:cor.y,cidade:true});z.st='caca';z.viu=0;z.lx=n.P.x;z.lz=n.P.z;z.ly=n.P.y;window.__z=z;const t=n.OB.find(o=>o.tipo==='tabuasPorta');window.__tb=t;return{hp:t.hp};})()")],
 ["gwait",14],
 ["eval","zumbiPorta14",J("(()=>{const n=__nnc,z=window.__z,t=window.__tb;return{zst:z.st,alvo:z.obra?(z.obra.tipo||'porta'):null,tabuasHp:Math.round(t.hp),existe:n.OB.includes(t),vida:Math.round(n.P.vida),zEntrou:n.salaEm(z.x,z.y+0.3,z.z)===window.__s};})()")],
 ["js","(()=>{const n=__nnc;n.Z.length=0;n.salvarJogo();})()"],
 ["reload"],["wait",2],["click","#m-continuar"],["wait",1],["gwait",0.3],
 ["eval","carregado",J("(()=>{"+A+"const s=window.__s||null;const L=n.OB.filter(o=>o.y>1).map(o=>o.tipo+'@'+o.y.toFixed(1)).sort();const b=n.OB.find(o=>o.tipo==='bau');return{obras:L.join(' '),bauItem:b&&b.itens[0]?b.itens[0].id+'x'+b.itens[0].n:null,cama:!!n.G.cama};})()")],
 ["eval","renasce",J("(()=>{const n=__nnc;n.P.x=230;n.P.z=8;n.P.y=0;n.P.vida=0;const c=n.OB.find(o=>o.tipo==='cama');n.renascer();return{d:+Math.hypot(n.P.x-c.x,n.P.z-c.z).toFixed(2),dy:+(n.P.y-c.y).toFixed(2)};})()")],
]
plan=[["desk",{"viewport":{"width":960,"height":540}},steps]]
json.dump(plan,open(os.path.join(os.path.dirname(__file__),'..','p63.json'),'w'),ensure_ascii=False)
print('ok',len(steps))

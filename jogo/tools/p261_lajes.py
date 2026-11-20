"""p261 (v10.8.9): Corrida das Lajes no Morro do Sabiá.
1 montada: o caminho de lajes (ligações dentro dos limites: sobe até 2,5 m, desce até 3,3 m), pontos no alto, largada numa
  casa com escada de marinheiro; no O que fazer com o jeito de começar
2 um robô corre o caminho de verdade (anda, sobe pulando de frente, pula os becos, passa nas tábuas) sem pisar no chão
3 descer para o beco no meio da corrida: perdeu
4 de ponto em ponto rápido: ouro, o tênis de corrida e a conquista
5 o tênis: corre mais rápido e amortece a queda (4,2 m sem ele machuca, com ele não)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
L = "const L=X('LAJ'),C=L.C,K=X('CORR'),S=()=>X('corridaD')('lajes');"
PASSO = ("window.__cadaPasso=(dt)=>{const n=__nnc,P=n.P,IN=n.ev('IN');n.Z.length=0;if(!window.__livre){P.vida=100;}P.fome=100;P.sede=100;"
         "const B=window.__bot;if(B&&!B.fim){const C=n.ev('CORR');B.t+=dt;"
         "if(!C.ativa){B.fim={t:+B.t.toFixed(2),wp:B.i,de:B.wp.length,x:+P.x.toFixed(2),z:+P.z.toFixed(2),y:+P.y.toFixed(2),alto:+(P.y-n.ev('ground')(P.x,P.z)).toFixed(2)};IN.mz=0;IN.run=false;}"
         "else if(C.t>0){P.energia=100;let w=B.wp[B.i];while(w&&Math.hypot(w.x-P.x,w.z-P.z)<w.r){B.log.push([B.i,+B.t.toFixed(2),+P.y.toFixed(2)]);B.i++;w=B.wp[B.i];}"
         "if(w){const dx=w.x-P.x,dz=w.z-P.z,d=Math.hypot(dx,dz),fx=dx/d,fz=dz/d;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;IN.mx=0;IN.mz=1;IN.run=true;"
         "if(!P.muro&&!P.escala&&P.noChao){B.pulo-=dt;B.dt+=dt;if(B.dt>0.3){const m=Math.hypot(P.x-B.ult[0],P.z-B.ult[1]);B.dt=0;B.ult=[P.x,P.z];if(m<0.3&&B.pulo<=0){n.ev('pular')();B.pulo=0.5;B.pulos++;}}"
         "if(w.tipo&&['salto','escala','descida'].includes(w.tipo)&&B.pulo<=0){const la=w.tipo==='escala'?0.3:0.7,g=n.ev('chaoEm')(P.x+fx*la,P.z+fz*la,P.y+0.3);if(P.y-g>1.0){n.ev('pular')();B.pulo=0.7;B.saltos++;}}}}}}"
         "const T=window.__tele;if(T){const C=n.ev('CORR');if(C.ativa&&C.t>0){const p=C.ativa.pts[C.i];if(p){P.x=p.x;P.z=p.z;P.y=p.y+0.02;P.vy=0;P.noChao=true;}}}};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__livre=false;window.__bot=null;window.__tele=false;" + PASSO)]
s += [ev("montada", L + "if(!L.ok)return{ok:false,montado:!!X('MOR').ok};const g=X('ground'),H=L.R.path;"
         "const lig=L.R.edges.map(e=>e.t+':'+r2(e.dy));const lim=L.R.edges.every(e=>X('LAJ_TABUA').has(e.t)?Math.abs(e.dy)<=3.4:(e.dy<=2.5&&e.dy>=-3.3));"
         "const altos=L.pts.map(p=>r2(p.y-g(p.x,p.z)));"
         "X('ativLimpa')();const a=X('ativTodas')().find(q=>q.id==='corrida-lajes');"
         "return{ok:true,lajes:H.length,lig,lim,tabuas:L.R.edges.filter(e=>X('LAJ_TABUA').has(e.t)).length,pulos:L.R.edges.filter(e=>X('LAJ_PULA').has(e.t)).length,obras:L.obras.length,sobe:L.R.edges.filter(e=>e.dy>=0.75).length,"
         "pontos:L.pts.length,altoMin:Math.min(...altos),escada:!!H[0].escada,ini:[r2(L.ini.x),r2(L.ini.z),r2(L.ini.y)],len:r2(L.len),base:r2(L.base),tempos:C.tempos,"
         "malha:!!L.malha,pich:!!L.pich,oQueFazer:a?{nome:a.nome,falta:a.falta,premio:a.premio}:null};")]
# 2: o robô corre de verdade
s += [js(L + "const q=L.ini,p=L.pts[0];vai(q.x,q.z,q.y+0.02);P.yaw=P.body=Math.atan2(p.x-q.x,p.z-q.z);P.energia=100;"
         "const tipos=L.R.edges.map(e=>e.t),wp=[];let k=0;for(const p of L.pts){if(p.tabua){wp.push({x:p.de[0],z:p.de[1],y:p.y,r:0.5},{x:p.para[0],z:p.para[1],y:p.y,r:0.5});}else{wp.push({x:p.x,z:p.z,y:p.y,r:1.0,tipo:tipos[k]});k++;}}"
         "window.__bot={wp,i:0,t:0,ult:[P.x,P.z],dt:0,pulo:0,pulos:0,saltos:0,log:[],fim:null};"), ["gwait", 0.3],
      ev("comecar", L + "const a=X('interAtual')(),t=a&&X('INTER_K')[a.k]?X('INTER_K')[a.k].texto(a.o):null;if(a&&a.k==='corridaIni')X('INTER_K').corridaIni.usar(a.o);const pelaPlaca=!!K.ativa;if(!K.ativa)X('corridaComecar')(C);return{k:a&&a.k,t:t&&(t.t+' | '+t.s),pelaPlaca,ativa:!!K.ativa};"),
      ["gwait", 45],
      ev("robo", L + "const B=window.__bot,s=S();return{fim:B.fim,melhor:s.melhor,medalha:s.medalha,pulos:B.pulos,saltos:B.saltos,log:B.log,vida:P.vida};")]
# 3: pisou no chão
s += [js(L + "window.__bot=null;Z.length=0;const q=L.ini;vai(q.x,q.z,q.y+0.02);window.__m=S().melhor;X('corridaComecar')(C);"), ["gwait", 3.4],
      js(L + "const p=L.pts[0];vai(p.x,p.z,p.y+0.02);"), ["gwait", 0.3],
      ev("noAlto", L + "return{ativa:!!K.ativa,i:K.i};"),
      js(L + "const h=L.R.path[0],e=h.escada,b=X('morroPw')(h,e.u,h.D/2+0.85);vai(b[0],b[1],X('ground')(b[0],b[1])+0.02);"), ["gwait", 0.4],
      ev("chao", L + "return{ativa:!!K.ativa,melhorIgual:S().melhor===window.__m,alto:r2(P.y-X('ground')(P.x,P.z))};")]
# 4: de ponto em ponto
s += [js(L + "const q=L.ini;vai(q.x,q.z,q.y+0.02);window.__tn=conta('tenisCorrida');X('corridaComecar')(C);"), ["gwait", 3.3],
      js("window.__tele=true;"), ["gwait", 2.0],
      ev("teleporte", L + "window.__tele=false;const c=(X('G').conq||{});return{ativa:!!K.ativa,medalha:S().medalha,melhor:S().melhor,tenis:conta('tenisCorrida')-window.__tn,item:X('ITEMS').tenisCorrida&&X('ITEMS').tenisCorrida.nome,conq:X('CONQ').some(d=>d.id==='lajesOuro')};")]
# 5: o tênis
s += [js("const i=P.inv.findIndex(q=>q&&q.id==='tenisCorrida');if(i>=0)X('vestir')(i);"), ["gwait", 0.2],
      ev("tenis", "const f=X('movFatorVel');return{pes:P.roupa.pes,ef:r2(X('tenisEf')()),corre:r2(f(true)),anda:r2(f(false))};"),
      js("const La=X('MOR').largo,b=[(La.x0+La.x1)/2+2,(La.z0+La.z1)/2+1,La.y];window.__q=b;window.__livre=true;P.vida=100;vai(b[0],b[1],b[2]+4.2);P.noChao=false;P.vy=0;"), ["gwait", 1.5],
      ev("quedaCom", "const v=P.vida;window.__livre=false;P.vida=100;return{vida:r2(v),noChao:P.noChao};"),
      js("X('tirarRoupa')('pes');const b=window.__q;window.__livre=true;P.vida=100;vai(b[0],b[1],b[2]+4.2);P.noChao=false;P.vy=0;"), ["gwait", 1.5],
      ev("quedaSem", "const v=P.vida;window.__livre=false;P.vida=100;return{vida:r2(v),pes:P.roupa.pes};")]
salvar('tools/p261_lajes.json', s)

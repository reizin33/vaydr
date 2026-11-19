"""p257 (v10.8.5 e v10.8.6): atividades por perto (aviso e bússola) e o bondinho do Plano Inclinado.
1 perto: longe (30 m) do Abrigo do Cais a atividade entra na lista de perto sem aviso; a 8 m o aviso sai uma vez e ela fica vista
2 bondinho: montado (malha, colisão no meio da subida, uma só); o painel pede fusível, óleo de motor e fio; ligado, sobe sozinho
  até a estação de cima; entrar, descer até embaixo levando o jogador (sem cair nem morrer); sair na escadaria; zumbi nos trilhos
  na frente é empurrado para a escadaria; chamar lá de cima; O que fazer (conserto) feito"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__semZ=true;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;n.P.sede=100;n.P.vida=Math.max(n.P.vida,80);if(window.__semZ)n.Z.length=0;};")]
TX = "const a=X('interAtual')(),t=a&&X('INTER_K')[a.k]?X('INTER_K')[a.k].texto(a.o):null;"
# 1 atividades por perto
s += [js("const A=X('ABRIGOS').find(q=>q.id==='cais');vai(A.x+85,A.z,X('chaoEm')(A.x+85,A.z,A.y+3));"), ["gwait", 1.5],
      ev("pertoLonge", "const L=X('ATIV_PERTO').ids.map(q=>q.a.id);return{ids:L,visto:!!(X('ativD')().vistas||{})['abrigo-cais']};"),
      js("const A=X('ABRIGOS').find(q=>q.id==='cais');vai(A.x+8,A.z,X('chaoEm')(A.x+8,A.z,A.y+3));"), ["gwait", 2.0],
      ev("pertoPerto", "const L=X('ATIV_PERTO').ids.map(q=>q.a.id),T=[...document.querySelectorAll('.toast p')].map(p=>p.textContent).concat(X('toastFila').map(q=>q[1])).filter(t=>/Abrigo do Cais/.test(t));"
         "return{ids:L,visto:!!(X('ativD')().vistas||{})['abrigo-cais'],conhecida:X('ativConhecida')(X('ativTodas')().find(a=>a.id==='abrigo-cais')),toasts:T.length,txt:(T[0]||'').slice(0,140),bus:document.querySelectorAll('.bus-at').length};")]
# 2 bondinho: montado e o conserto
s += [ev("bondeMontado", "const B=X('BONDE'),S=X('bondeD')(),q=X('bondePose')(S.t),n0=X('COLL').filter(c=>c.calta&&c.t===1&&Math.abs(c.hw-1.1)<0.01&&Math.abs(c.hd-2.6)<0.01).length;"
         "return{ok:B.ok,malha:!!B.malha,estat:!!B.estat,t:r2(S.t),L:r2(B.R.L),tMax:r2(B.tMax),col:!!B.col,nCol:n0,loot:!!B.loot,q:[r2(q.x),r2(q.y),r2(q.z)],painel:[r2(B.painel.x),r2(B.painel.z),r2(B.painel.g)]};"),
      js("const Pn=X('BONDE').painel;vai(Pn.x+0.75,Pn.z,X('chaoEm')(Pn.x+0.75,Pn.z,Pn.g+2));P.yaw=-Math.PI/2;P.body=P.yaw;"), ["gwait", 0.6],
      ev("painelSem", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("X('ganhar')('fusivel',1);X('ganhar')('oleoMotor',1);X('ganhar')('fio',1);"), ["gwait", 0.3],
      ev("painelCom", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s),hold:t&&!!t.hold};"),
      js("const a=X('interAtual')();if(a&&a.k==='bondePainel')X('INTER_K').bondePainel.usar(a.o,true);"), ["gwait", 0.5],
      ev("ligado", "const S=X('bondeD')();X('ativLimpa')();return{ligado:S.ligado,alvo:S.alvo&&r2(S.alvo),fusivel:conta('fusivel'),oleo:conta('oleoMotor'),fio:conta('fio'),feito:(X('ativTodas')().find(a=>a.id==='bonde')||{}).feito};"),
      ["gwait", 10],
      ev("subiu", "const S=X('bondeD')(),B=X('BONDE');return{t:r2(S.t),alvo:S.alvo,est:X('bondeEstacao')(S.t),colZ:B.col&&r2(B.col.z),lootZ:B.loot&&r2(B.loot.z)};")]
# entrar lá em cima, descer, sair
s += [js("const S=X('bondeD')(),q=X('bondePose')(S.t),w=X('bondeW')(q,1.55,0,0.6);vai(w[0]+0.5,w[2],X('chaoEm')(w[0]+0.5,w[2],q.y+2));P.yaw=-Math.PI/2;P.body=P.yaw;"), ["gwait", 0.6],
      ev("entrarTexto", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("X('bondeEntrar')();"), ["gwait", 0.6],
      ev("dentro", "const S=X('bondeD')(),q=X('bondePose')(S.t);" + TX + "return{bonde:!!P.bonde,dx:r2(P.x-q.x),dy:r2(P.y-q.y),dz:r2(P.z-q.z),k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("window.__y0=P.y;const a=X('interAtual')();if(a&&a.k==='bondeDentro')X('INTER_K').bondeDentro.usar(a.o);"), ["gwait", 4],
      ev("descendo", "const S=X('bondeD')(),q=X('bondePose')(S.t);return{bonde:!!P.bonde,t:r2(S.t),alvo:S.alvo&&r2(S.alvo),desceu:r2(window.__y0-P.y),dentro:Math.abs(P.x-q.x)<1&&Math.abs(P.z-q.z)<2.5,vida:r2(P.vida),v:r2(X('BONDE').v)};"),
      ["gwait", 16],
      ev("embaixo", "const S=X('bondeD')(),q=X('bondePose')(S.t);return{bonde:!!P.bonde,t:r2(S.t),alvo:S.alvo,est:X('bondeEstacao')(S.t),dentro:Math.abs(P.x-q.x)<1&&Math.abs(P.z-q.z)<2.5,desceu:r2(window.__y0-P.y),vivo:P.alive};"),
      js("X('pular')();"), ["gwait", 0.8],
      ev("saiu", "return{bonde:!!P.bonde,x:r2(P.x),z:r2(P.z),dy:r2(P.y-X('chaoEm')(P.x,P.z,P.y+1)),bloq:X('bloqueadoAlto')(P.x,P.z,0.3,P.y+0.05),vivo:P.alive};")]
# zumbi nos trilhos na frente do bondinho subindo vazio; o jogador espera lá em cima, longe dos trilhos
s += [js("vai(272,-134.5,X('chaoEm')(272,-134.5,40));window.__semZ=false;Z.length=0;const B=X('BONDE'),c=B.R.pt(B.tMin+9),x=c[0]+B.xOff,y=B.R.yEm(B.tMin+9);"
         "const q=ZZ('walker',x,c[1],{y:y+0.1});if(q){q.st='vaga';window.__zb=q;}X('bondeIr')(B.tMax);"), ["gwait", 7],
      ev("empurrou", "const q=window.__zb,B=X('BONDE');return q?{x:r2(q.x),xTrilho:r2(B.R.P0[0]+B.xOff),hp:r2(q.hp),vivo:q.vivo,st:q.st}:{semZumbi:true};"),
      js("window.__semZ=true;Z.length=0;"), ["gwait", 12],
      ev("emCima", "const S=X('bondeD')();return{t:r2(S.t),est:X('bondeEstacao')(S.t)};"),
      js("X('bondeIr')(X('BONDE').tMin);"), ["gwait", 20],
      js("const B=X('BONDE'),c=B.R.pt(B.tMax),x=B.R.P0[0]+1.5,z=c[1]-1.6;vai(x+0.6,z,X('chaoEm')(x+0.6,z,B.R.yEm(B.tMax)+2));P.yaw=-Math.PI/2;P.body=P.yaw;"), ["gwait", 0.6],
      ev("chamarTexto", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s),est:X('bondeEstacao')(X('bondeD')().t)};"),
      js("const a=X('interAtual')();if(a&&a.k==='bondeChamar')X('INTER_K').bondeChamar.usar(a.o);"), ["gwait", 20],
      ev("chamado", "const S=X('bondeD')();return{t:r2(S.t),est:X('bondeEstacao')(S.t),vivo:P.alive};")]
# 3 botijões: montados pela cidade; pegar; pôr no chão; tiro (raio) com zumbi na frente segura; vaza e explode (zumbis em volta caem);
#   explosão estoura o do lado; fogo perto explode
s += [ev("botiMontado", "const L=X('BOTI').lista;return{n:L.length,malhas:X('BOTI').malhas.length,bloq:L.filter(b=>X('bloqueadoAlto')(b.x,b.z,0.2,b.y+0.1)).length,"
         "dy:Math.max(0,...L.map(b=>Math.abs(b.y-X('chaoEm')(b.x,b.z,b.y+1)))),onde:L.slice(0,14).map(b=>[Math.round(b.x),Math.round(b.z)])};"),
      js("const b=X('BOTI').lista[0];vai(b.x+1.0,b.z,X('chaoEm')(b.x+1.0,b.z,b.y+1.5));P.yaw=-Math.PI/2;P.body=P.yaw;window.__nb0=conta('botijaoGas');"), ["gwait", 0.6],
      ev("botiTexto", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("const a=X('interAtual')();if(a&&a.k==='botijao')X('INTER_K').botijao.usar(a.o);"), ["gwait", 0.4],
      ev("botiPego", "const b=X('BOTI').lista[0];return{antes:window.__nb0,depois:conta('botijaoGas'),sumiu:!X('botiTodos')().includes(b),st:(X('botiD')().st[b.id]||{}).st};"),
      js("X('ganhar')('botijaoGas',2);vai(283,-89,X('chaoEm')(283,-89,8));P.body=0;P.yaw=0;const i=P.inv.findIndex(q=>q&&q.id==='botijaoGas');X('UTIL_ACOES').botijaoGas(i);"), ["gwait", 0.3],
      js("vai(283,-86.6,X('chaoEm')(283,-86.6,8));P.body=0;P.yaw=0;const i=P.inv.findIndex(q=>q&&q.id==='botijaoGas');X('UTIL_ACOES').botijaoGas(i);"), ["gwait", 0.3],
      ev("botiPostos", "const S=X('botiD')();return{n:S.soltos.length,pos:S.soltos.map(b=>[r2(b.x),r2(b.z),r2(b.y-X('chaoEm')(b.x,b.z,b.y+1))]),resta:conta('botijaoGas')};"),
      js("const S=X('botiD')(),b=S.soltos[0];window.__b0=b;window.__b1=S.soltos[1];window.__semZ=false;Z.length=0;window.__zs=[];for(const[dx,dz]of[[1.6,0.4],[-1.4,0.9],[0.3,-1.8]]){const q=ZZ('walker',b.x+dx,b.z+dz);if(q){q.st='vaga';window.__zs.push(q);}}"
         "vai(b.x-12,b.z,X('chaoEm')(b.x-12,b.z,b.y+2));"), ["gwait", 0.2],
      ev("botiRaio", "const b=window.__b0,o=[b.x-10,b.y+1.5,b.z],d=[0,0,0],tx=b.x-o[0],ty=b.y+0.25-o[1],tz=b.z-o[2],L=Math.hypot(tx,ty,tz);d[0]=tx/L;d[1]=ty/L;d[2]=tz/L;"
         "const h=X('botiRaio')(o,d,60),q=ZZ('walker',b.x-5,b.z),tap=h?X('botiTampado')(o,d,h.t):null;if(q){q.vivo=false;Z.splice(Z.indexOf(q),1);}const tap2=h?X('botiTampado')(o,d,h.t):null;"
         "return{acha:!!h&&h.b===b,t:h&&r2(h.t),comZumbi:tap,semZumbi:tap2};"),
      js("window.__k0=(X('G').tarefas||[]).map(t=>t.id+':'+t.n).join(',');X('botiAtingido')(window.__b0,'tiro');"), ["gwait", 0.5],
      ev("botiVazando", "const b=window.__b0;return{vaza:b.vaza!=null?r2(b.vaza):null,foi:!!b.foi};"),
      ["gwait", 2.5],
      ev("botiExplodiu", "const b=window.__b0,b1=window.__b1,S=X('botiD')();return{foi:!!b.foi,naLista:S.soltos.includes(b),outro:{foi:!!b1.foi,vaza:b1.vaza!=null},zumbis:window.__zs.map(q=>q.vivo?r2(q.hp):'morto'),vida:r2(P.vida),vivo:P.alive};"),
      ["gwait", 1.5],
      ev("botiCorrente", "const b1=window.__b1,S=X('botiD')();return{foi:!!b1.foi,soltos:S.soltos.length};"),
      js("window.__semZ=true;Z.length=0;X('ganhar')('botijaoGas',1);vai(262,-89,X('chaoEm')(262,-89,8));P.body=0;P.yaw=0;const i=P.inv.findIndex(q=>q&&q.id==='botijaoGas');X('UTIL_ACOES').botijaoGas(i);"
         "const S=X('botiD')(),b=S.soltos[S.soltos.length-1];window.__b2=b;X('CHAMAS').push({x:b.x+0.8,y:b.y,z:b.z,r:1.0,t:0,dur:5,rr:0});vai(249,-88,X('chaoEm')(249,-88,8));"), ["gwait", 2.0],
      ev("botiFogo", "const b=window.__b2;return{foi:!!b.foi,vivo:P.alive};")]
salvar('tools/p257_bonde.json', s)

"""p125: ajustes depois da primeira jogada — fome, sede e energia caem mais devagar; dormir na barraca à noite mesmo sem sono;
janela com móvel na frente não deixa passar (nem jogador nem zumbi caem dentro de móvel); casas mais cheias; tecla G larga o item da mão;
setinha some no jogo (PC); cercas bloqueiam (arame dos sítios e tábuas da fazenda, com porteira)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;G.hora=9;P.fome=100;P.sede=100;P.energia=100;P.sono=100;window.__t0=G.t;"), ["gwait", 60],
      ev("taxas60s", "return{fome:r2(100-P.fome),sede:r2(100-P.sede),sono:r2(100-P.sono),seg:r2(G.t-window.__t0)};"),
      js("P.energia=100;"), ["down","ShiftLeft"], ["down","w"], ["gwait", 5], ["up","w"], ["up","ShiftLeft"],
      ev("corrida5s", "return{energiaGasta:r2(100-P.energia)};")]
s += [js("vivo();Z.length=0;const b=X('INTER').find(i=>i.kind==='cama');window.__b=b;vai(b.x+1.5,b.z);G.hora=10;P.sono=100;n.alvo={k:'inter',o:b};n.interagir(true);"),
      ev("barracaDia", "return{dormindo:!!G.dormindo};"),
      js("const b=window.__b;G.hora=19.2;P.sono=100;n.alvo={k:'inter',o:b};n.interagir(true);"),
      ev("barracaNoite", "return{dormindo:!!G.dormindo,noite:G.dormindo&&G.dormindo.noite};"),
      js("if(G.dormindo)X('sonoAcordar')('__manual');G.hora=10;")]
s += [ev("janelas", "const J=X('CID').janelas.filter(j=>j.quebrada&&j.f===0);let tap=0,livres=[],ruins=0;for(const j of J){const a=X('janelaPouso')(j,true),b=X('janelaPouso')(j,false);if(!a||!b){tap++;if(!X('janelaTapada')(j))ruins++;}else livres.push(j);}"
         "let pulos=0,dentroDeMovel=0;for(const j of livres.slice(0,12)){const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw),x=j.x+nx*0.8,z=j.z+nz*0.8;vai(x,z,X('chaoEm')(x,z,j.y+0.5));X('pularJanela')(j);pulos++;if(X('bloqueadoAlto')(P.x,P.z,0.25,P.y))dentroDeMovel++;}"
         "return{quebradasTerreo:J.length,tapadasPorMovel:tap,tapadaSemMarcar:ruins,pulos,dentroDeMovel};")]
s += [ev("casas", "const C=X('CID'),cont=f=>{const L=C.predios.filter(f);let m=0,k={};for(const p of L){const M=C.moveis.filter(q=>q.p===p);m+=M.length;for(const q of M)k[q.k]=(k[q.k]||0)+1;}return{casas:L.length,moveisPorCasa:r2(m/Math.max(1,L.length)),novos:['quadro','quadroP','planta','caixasP','comoda','roupasChao','entulho','bancadaCoz','armarioAlto','luminaria','cadeira','chuveiro','lixeira'].map(t=>t+':'+(k[t]||0)).join(' ')};};"
         "return{rurais:cont(p=>p.rural),cidade:cont(p=>!p.rural&&/casa/.test(p.tipo||''))};")]
s += [js("vivo();Z.length=0;vai(F[0]+4,F[2]+4);for(let i=0;i<P.inv.length;i++)P.inv[i]=null;X('invAdd')('pedra',3);n.selecionar(P.inv.findIndex(q=>q&&q.id==='pedra'));window.__d0=X('DROPS').length;"),
      ["press", "g"], ["gwait", 0.2],
      ev("teclaG", "return{naMao:P.inv[P.sel]?P.inv[P.sel].id:null,drops:X('DROPS').length-window.__d0,semCursor:document.body.classList.contains('sem-cursor'),tela:n.cfg.tela};")]
s += [ev("cercas", "const C=X('COLL'),arame=C.filter(c=>c.t===1&&c.hd===0.06).length,tabuas=C.filter(c=>c.t===1&&c.hd===0.08).length;const c=C.find(c=>c.t===1&&c.hd===0.06);"
         "return{arame,tabuas,bloqueiaNoMeio:c?!!X('pointBlocked')(c.x,c.z,0.3):null};")]
s += foto("690_casa_sala_cheia.png", "G.hora=11;Z.length=0;const C=X('CID'),p=C.predios.find(q=>q.rural&&q.salas[0]&&q.salas[0].some(s=>s.tipo==='sala_casa'));const sa=p.salas[0].find(s=>s.tipo==='sala_casa');"
          "const W=(u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],m=W((sa.u0+sa.u1)/2,(sa.v0+sa.v1)/2);vai(m[0],m[1],sa.y);const c0=W(sa.u0+0.35,sa.v0+0.35),c1=W(sa.u1-0.8,sa.v1-0.8);"
          "G.camFix={pos:[c0[0],sa.y+1.95,c0[1]],tgt:[c1[0],sa.y+0.4,c1[1]],fov:1.1};", 0.5)
s += foto("691_casa_quarto_cheio.png", "const C=X('CID'),p=C.predios.find(q=>q.rural&&q.salas[0]&&q.salas[0].some(s=>s.tipo==='quarto'));const sa=p.salas[0].find(s=>s.tipo==='quarto');"
          "const W=(u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],m=W((sa.u0+sa.u1)/2,(sa.v0+sa.v1)/2);vai(m[0],m[1],sa.y);const c0=W(sa.u1-0.35,sa.v0+0.35),c1=W(sa.u0+0.8,sa.v1-0.8);"
          "G.camFix={pos:[c0[0],sa.y+1.95,c0[1]],tgt:[c1[0],sa.y+0.4,c1[1]],fov:1.1};", 0.5)
s += foto("692_pinheiro_perto.png", "G.camFix=null;const T=X('TREES').filter(t=>t.alive&&t.kind==='pine'&&Math.hypot(t.x-P.x,t.z-P.z)<60).sort((a,b)=>a.s-b.s);const t=T[Math.floor(T.length/2)]||X('TREES')[0];"
          "vai(t.x+1.2,t.z+0.4);P.yaw=P.body=Math.atan2(t.x-P.x,t.z-P.z);n.cfg.cam='3';const a=P.yaw+Math.PI*0.75;G.camFix={pos:[P.x+Math.sin(a)*3.4,P.y+1.6,P.z+Math.cos(a)*3.4],tgt:[P.x,P.y+1.3,P.z],fov:0.9};", 0.5)
salvar('p125.json', s)

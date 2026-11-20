"""p258 (v10.8.6): mais consertos.
1 luz da Cidade Alta: cabine montada em lugar livre; pede 2 fusíveis, 3 fios e 1 fita; ligada, à noite os postes ficam acesos
  (luz de verdade do poste mais perto); zumbi debaixo do poste vai para a beira da luz; quem caçava o jogador debaixo do poste desiste
2 motobomba da caixa-d'água do morro: montada fora das pernas da torre; pede peças de máquina, óleo de motor e fio; consertada,
  a bica enche as garrafas vazias e mata a sede
3 a luz das salas do Hospital com o gerador ligado (a chamada que estava num comentário desde a v10.2.2)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__semZ=true;window.__sede=true;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;if(window.__sede)n.P.sede=100;n.P.vida=Math.max(n.P.vida,80);if(window.__semZ)n.Z.length=0;};")]
TX = "const a=X('interAtual')(),t=a&&X('INTER_K')[a.k]?X('INTER_K')[a.k].texto(a.o):null;"
# 1 luz da Cidade Alta
s += [ev("luzMontada", "const L=X('LUZCA');return{ok:L.ok,cab:L.cab&&[r2(L.cab.x),r2(L.cab.z),r2(L.cab.g)],postes:X('luzcaPostes')().length,malha:!!L.malha,livreFrente:!X('pointBlocked')(L.cab.x,L.cab.z+1.0,0.3)};"),
      js("const c=X('LUZCA').cab;vai(c.x,c.z+1.2,X('chaoEm')(c.x,c.z+1.2,c.g+2));P.yaw=Math.PI;P.body=P.yaw;"), ["gwait", 0.6],
      ev("cabineSem", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("X('ganhar')('fusivel',2);X('ganhar')('fio',3);X('ganhar')('fita',1);"), ["gwait", 0.3],
      ev("cabineCom", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s),hold:t&&!!t.hold};"),
      js("const a=X('interAtual')();if(a&&a.k==='luzCabine')X('INTER_K').luzCabine.usar(a.o,true);X('ativLimpa')();"), ["gwait", 0.4],
      ev("luzLigada", "return{ligado:X('luzcaD')().ligado,fusivel:conta('fusivel'),fio:conta('fio'),fita:conta('fita'),feito:(X('ativTodas')().find(a=>a.id==='luz-calta')||{}).feito,acesaDeDia:X('luzcaAcesa')()};"),
      js("G.hora=23;"), ["gwait", 1.0],
      ev("noite", "return{n:r2(X('E').n||0),acesa:X('luzcaAcesa')()};"),
      # zumbi debaixo de um poste do Largo da Matriz; o jogador longe
      js("const Ls=X('luzcaPostes')(),M=X('CA').largos.find(l=>l.id==='matriz');const L=Ls.find(q=>q.x>M.x0-1&&q.x<M.x1+1&&q.z>M.z0-1&&q.z<M.z1+1)||Ls[0];window.__lp=L;"
         "vai(L.x+12,L.z+12,X('chaoEm')(L.x+12,L.z+12,L.g+3));window.__semZ=false;Z.length=0;const q=ZZ('walker',L.x+1.2,L.z+0.6);if(q){q.st='vaga';window.__zl=q;}"), ["gwait", 1.0],
      ev("zumbiNaLuz", "const q=window.__zl,L=window.__lp;return q?{dist:r2(Math.hypot(q.x-L.x,q.z-L.z)),r:X('LUZCA').r,st:q.st,vivo:q.vivo}:{semZumbi:true};"),
      # o jogador debaixo do poste; um zumbi caçando de 9 m
      js("const L=window.__lp;Z.length=0;vai(L.x+0.6,L.z-0.4,X('chaoEm')(L.x+0.6,L.z-0.4,L.g+2));const q=ZZ('walker',L.x+9,L.z);if(q){q.st='caca';q.lx=P.x;q.lz=P.z;window.__zc=q;}"), ["gwait", 2.0],
      ev("cacadorDesiste", "const q=window.__zc,L=window.__lp;return q?{dist:r2(Math.hypot(q.x-L.x,q.z-L.z)),st:q.st,alvoLonge:q.ax!==undefined?r2(Math.hypot(q.ax-L.x,q.az-L.z)):null,vida:r2(P.vida)}:{semZumbi:true};"),
      ev("luzReal", "X('luzes')();const L=window.__lp,v=X('PLv'),nl=X('NPL');let perto=false;for(let i=0;i<nl;i++){if(Math.hypot(v[i*4]-L.x,v[i*4+2]-L.z)<0.6&&Math.abs(v[i*4+1]-(L.y-0.25))<0.6)perto=true;}return{luzes:nl,doPoste:perto};"),
      js("window.__semZ=true;Z.length=0;G.hora=10;"), ["gwait", 0.5]]
# 2 motobomba do morro
s += [ev("bombaMontada", "const B=X('BOMBA'),T=X('MOR').torre;return B.ok?{p:[r2(B.p.x),r2(B.p.z),r2(B.p.g)],bica:[r2(B.bica.x),r2(B.bica.z)],distTorre:r2(Math.hypot(B.p.x-T.x,B.p.z-T.z)),malha:!!B.malha,"
         "frenteLivre:!X('pointBlocked')(B.p.x+Math.sin(B.p.yaw)*0.75,B.p.z+Math.cos(B.p.yaw)*0.75,0.3),bicaLivre:!X('pointBlocked')(B.bica.x+Math.sin(B.bica.yaw)*0.6,B.bica.z+Math.cos(B.bica.yaw)*0.6,0.3)}:{ok:false};"),
      js("const p=X('BOMBA').p,x=p.x+Math.sin(p.yaw)*1.1,z=p.z+Math.cos(p.yaw)*1.1;vai(x,z,X('chaoEm')(x,z,p.g+2));P.yaw=p.yaw+Math.PI;P.body=P.yaw;"), ["gwait", 0.6],
      ev("motorSem", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("X('ganhar')('pecasMaquina',1);X('ganhar')('oleoMotor',1);X('ganhar')('fio',2);"), ["gwait", 0.3],
      js("const a=X('interAtual')();window.__k=a&&a.k;if(a&&a.k==='bombaMotor')X('INTER_K').bombaMotor.usar(a.o,true);X('ativLimpa')();"), ["gwait", 0.4],
      ev("bombaLigada", "return{k:window.__k,ligada:X('bombaD')().ligada,pecas:conta('pecasMaquina'),oleo:conta('oleoMotor'),feito:(X('ativTodas')().find(a=>a.id==='bomba-morro')||{}).feito};"),
      js("const b=X('BOMBA').bica,x=b.x+Math.sin(b.yaw)*1.0,z=b.z+Math.cos(b.yaw)*1.0;vai(x,z,X('chaoEm')(x,z,b.g+2));P.yaw=b.yaw+Math.PI;P.body=P.yaw;X('ganhar')('garrafa',3);"), ["gwait", 0.6],
      ev("bicaTexto", TX + "return{k:a&&a.k,t:t&&(t.t+' | '+t.s),garrafas:conta('garrafa'),agua0:conta('agua')};"),
      js("const a=X('interAtual')();if(a&&a.k==='bombaBica')X('INTER_K').bombaBica.usar(a.o,true);"), ["gwait", 0.4],
      ev("encheu", "return{garrafas:conta('garrafa'),agua:conta('agua')};"),
      js("window.__sede=false;P.sede=20;const a=X('interAtual')();if(a&&a.k==='bombaBica')X('INTER_K').bombaBica.usar(a.o,false);"), ["gwait", 0.2],
      ev("bebeu", "const s=Math.round(P.sede);window.__sede=true;return{sede:s};")]
# 3 hospital: sala acesa com o gerador ligado
s += [ev("hospital", "const p=X('CID').predios.find(q=>q.gerador);if(!p)return{semGerador:true};const g=p.gerador;vai(g.x,g.z,g.y+0.05);const c=X('G').cid;const e0=c.energia;c.energia=0;X('luzes')();const n0=X('NPL');"
         "c.energia=1;X('luzes')();const n1=X('NPL');c.energia=e0;return{nome:p.nome,semEnergia:n0,comEnergia:n1};")]
salvar('tools/p258_consertos.json', s)

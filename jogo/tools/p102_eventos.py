"""p102: eventos do mundo — enchente (sobe, alaga, baixa e deixa entulho), incêndio (espalha, apaga, revela esconderijo), estrada bloqueada
(bloqueia e o machado libera), ninho de zumbis (aparecem, morrem, ninho destruído), comboio do Exército (soldados e caixas), fartura, salvar/carregar e fotos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const M=()=>X('mundoD')(),IK=X('INTER_K'),IN=X('IN'),gr=(x,z)=>X('ground')(x,z),RIO=X('RIO'),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),ev1=t=>M().ev.find(e=>e.tipo===t&&!e.fim);")
s = inicio("X('FAUNA_POP').ativosMax=0;")
# ---------- enchente ----------
s += [js(F+"vivo();Z.length=0;const C=M().cheia;window.__ponto=null;for(let k=0;k<400&&!window.__ponto;k++){const sv=0.2+Math.random()*0.6,p=X('rioPonto')(sv),w=RIO.larg(sv)+2.5,x=p[0]-p[3]*w,z=p[1]+p[2]*w;"
         "if(X('aguaNivel')(x,z)===null&&gr(x,z)<X('rioNivel')(sv)+1.0)window.__ponto=[x,z,sv];}const q=window.__ponto;window.__antes={agua:X('aguaNivel')(q[0],q[1]),prof:X('aguaProf')(q[0],q[1])};"
         "G.chuva=0.9;C.chuva=200;X('cheiaPasso')(1);window.__aviso=C.ativa;X('cheiaPasso')(400);"),
      ev("cheiaSobe", F+"const C=M().cheia,q=window.__ponto,nv=X('aguaNivel')(q[0],q[1]);return{ativa:window.__aviso,nivel:r2(C.nivel),alvo:r2(C.alvo),aguaAntes:window.__antes.agua,aguaDepois:nv===null?null:r2(nv),profDepois:r2(X('aguaProf')(q[0],q[1])),enchente:r2(RIO.enchente)};")]
s += foto("420_enchente.png", F+"const q=window.__ponto;vai(q[0]+6,q[1]+6);G.hora=11;G.camFix={pos:[q[0]+9,gr(q[0],q[1])+5,q[1]+9],tgt:[q[0],gr(q[0],q[1]),q[1]]};", 0.4)
s += [js("G.camFix=null;"), js(F+"const C=M().cheia;window.__drops=X('DROPS').length;G.tm=C.fim+10;G.chuva=0;X('cheiaPasso')(600);"),
      ev("cheiaBaixa", F+"const C=M().cheia;return{ativa:C.ativa,nivel:r2(C.nivel),entulho:X('DROPS').length-window.__drops};")]
# ---------- incêndio ----------
# o alçapão aparece em 3 de cada 4 incêndios grandes; quando o sorteio não revela, o teste põe um igual ao do jogo para conferir a abertura e o saque
s += [js(F+"const T=X('TREES').filter(t=>t.alive&&!t.agua&&Math.hypot(t.x-P.x,t.z-P.z)>40&&Math.hypot(t.x-P.x,t.z-P.z)<120&&X('colQuery')(t.x,t.z,7).filter(c=>c.tree&&c.tree.alive).length>=4);"
         "window.__t0=T[0];M().fogo=null;window.__ok=X('incendioComecar')(T[0],'teste');for(let k=0;k<8;k++){X('incendioPasso')(2);}"),
      ev("fogoEspalha", F+"const f=M().fogo;return{comecou:window.__ok,queimando:f?f.ids.length:0,total:f?f.n:0,chamas:X('CHAMAS').filter(c=>c.mata).length};")]
s += foto("421_incendio.png", F+"const t=window.__t0;vai(t.x+16,t.z+16);G.camFix={pos:[t.x+18,gr(t.x,t.z)+7,t.z+18],tgt:[t.x,gr(t.x,t.z)+4,t.z]};", 0.6)
s += [js("G.camFix=null;"), js(F+"for(let k=0;k<120&&M().fogo;k++){X('incendioPasso')(2);}"),
      ev("fogoApaga", F+"const e=ev1('esconderijo');return{apagou:!M().fogo,tocos:M().tocos.length,esconderijo:!!e};"),
      js(F+"let e=ev1('esconderijo');window.__forcado=false;if(!e){const t=window.__t0;M().ev.push({id:M().id++,tipo:'esconderijo',x:t.x+1,z:t.z+1,dia:G.dia,aberto:false});e=ev1('esconderijo');window.__forcado=true;}vai(e.x+1.2,e.z);IK.evEsconderijo.usar(e);"), ["wait", 0.3],
      ev("esconderijo", F+"const e=M().ev.find(e=>e.tipo==='esconderijo');return e?{aberto:e.aberto,itens:(e.itens||[]).filter(Boolean).map(q=>q.id).join(','),modo:G.modo,forcadoNoTeste:window.__forcado}:null;"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# ---------- estrada bloqueada ----------
s += [js(F+"vivo();vai(0,0);window.__okE=X('estradaComecar')();"),
      ev("estrada", F+"const e=ev1('estrada');return e?{ok:window.__okE,troncos:e.troncos.length,bloqueia:e.troncos.every(t=>!!X('pointBlocked')(t.x,t.z,0.3)),x:r2(e.x),z:r2(e.z)}:{ok:window.__okE};")]
s += foto("422_estrada.png", F+"const e=ev1('estrada');vai(e.x+8,e.z+8);G.camFix={pos:[e.x+7,gr(e.x,e.z)+3.5,e.z+7],tgt:[e.x,gr(e.x,e.z)+0.5,e.z]};", 0.4)
s += [js("G.camFix=null;"), js(F+"vazio();add('machado',1);const e=ev1('estrada');for(const t of e.troncos){vai(t.x+1.5,t.z+1.5);window.__txtT=IK.evTronco.texto(t);for(let k=0;k<3;k++)IK.evTronco.usar(t,true);}"), ["gwait", 1.5],
      ev("estradaLiberada", F+"const e=M().ev.find(e=>e.tipo==='estrada');const pb=t=>{const c=X('pointBlocked')(t.x,t.z,0.3);return c?Object.keys(c).filter(k=>c[k]===true||k==='tipo').join('/')+(c.tronco?':TRONCO':''):null;};return{texto:window.__txtT.t,fim:e?e.fim:'removido',bloqueia:e?e.troncos.map(pb).join(' | '):false,troncosHp:e?e.troncos.map(t=>t.hp).join(','):'',madeira:conta('madeira')};")]
# ---------- ninho ----------
s += [js(F+"Z.length=0;window.__okN=X('infestacaoComecar')();const e=ev1('infestacao');window.__ne=e;vai(e.x+30,e.z+30);"), ["gwait", 2],
      ev("ninho", F+"const e=window.__ne;return{ok:window.__okN,local:e&&e.local,restantes:e&&e.restantes,criados:Z.filter(q=>q.ninhoEv===e.id&&q.vivo).length};")]
s += foto("423_ninho.png", F+"const e=window.__ne;G.camFix={pos:[e.x+12,gr(e.x,e.z)+6,e.z+12],tgt:[e.x,gr(e.x,e.z)+0.5,e.z]};", 0.4)
s += [js("G.camFix=null;"), js(F+"const e=window.__ne;for(const q of Z.filter(q=>q.ninhoEv===e.id))X('ferirZ')(q,9999,0,0,true);"), ["gwait", 1.5],
      js(F+"const e=window.__ne;vazio();add('machado',1);sel('machado');vai(e.x+1.4,e.z);mira(e.x,gr(e.x,e.z)+0.4,e.z);for(let k=0;k<12&&e.ninho>0;k++)X('golpeAcerta')({arma:P.inv[P.sel],vertical:true});"), ["gwait", 1.5],
      ev("ninhoLimpo", F+"const e=window.__ne;return{restantes:e.restantes,ninho:r2(e.ninho),fim:e.fim,conquista:!!X('CQ').f.ninho};")]
# ---------- comboio ----------
s += [js(F+"Z.length=0;vai(0,0);window.__okC=X('comboioComecar')();const e=ev1('comboio');window.__ce=e;vai(e.x+25,e.z+20);"), ["gwait", 2],
      ev("comboio", F+"const e=window.__ce;return{ok:window.__okC,veiculos:e.vs.length,tombado:e.vs.some(v=>v.tomb),caixas:e.caixas.length,soldados:Z.filter(q=>q.comboioEv===e.id&&q.vivo).length,bloqueia:!!X('pointBlocked')(e.vs[0].x,e.vs[0].z,0.3)};")]
s += foto("424_comboio.png", F+"const e=window.__ce;Z.length=0;G.camFix={pos:[e.x+12,gr(e.x,e.z)+5,e.z+12],tgt:[e.x,gr(e.x,e.z)+1,e.z]};", 0.4)
s += [js("G.camFix=null;"), js(F+"const e=window.__ce;const c=e.caixas[0];vai(c.x+1,c.z);IK.evCaixaComboio.usar(c);"), ["wait", 0.3],
      ev("caixaComboio", F+"const c=window.__ce.caixas[0];return{aberta:c.aberta,itens:(c.itens||[]).filter(Boolean).map(q=>q.id).join(','),modo:G.modo};"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# ---------- fartura ----------
s += [js(F+"M().cardume=G.tm+60;"), ev("cardume", F+"return X('peixeMult')();")]
# ---------- salvar e carregar com estrada bloqueada nova e comboio ----------
s += [js(F+"X('estradaComecar')();window.__nev=M().ev.filter(e=>!e.fim).length;X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.3],
      ev("carregar", F+"const e=ev1('estrada');return{eventos:M().ev.filter(e=>!e.fim).length,antes:window.__nev,troncosBloqueiam:e?e.troncos.filter(t=>t.hp>0).every(t=>!!X('pointBlocked')(t.x,t.z,0.3)):null,tocos:M().tocos.length};")]
salvar('p102.json', s)

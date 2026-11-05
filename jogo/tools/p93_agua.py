"""p93: rio, lago, ponte, natação, água suja, fogueira, pesca, sono e clima."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("mundo", "const R=X('RIO'),L=X('LAGO'),Pn=X('PONTE'),q=X('rioPonto')(0.5),g=n.chaoEm(q[0],q[1],50);return{ok:R.ok,lago:r2(L.nivel),ponte:r2(Pn.y),rioMeio:{nivel:r2(X('rioNivel')(0.5)),fundo:r2(g),x:r2(q[0]),z:r2(q[1])},lagoCentro:X('aguaNivel')(L.x,L.z),prof:r2(X('aguaProf')(L.x,L.z)),arvoresAgua:X('TREES').filter(t=>t.agua).length,niveis:Array.from(R.nivel).filter((v,i)=>i%8===0).map(r2)};")]
# ponte: em cima do tabuleiro não nada
s += [js("vivo();const Pn=X('PONTE');vai(Pn.x,Pn.z,Pn.y+0.3);"), ["gwait", 1.0],
      ev("ponte", "return{y:r2(P.y),deck:r2(X('PONTE').y),nada:!!P.nada};")]
s += foto("330_ponte.png", "const Pn=X('PONTE');vai(Pn.x-14,Pn.z+9);G.camFix={pos:[Pn.x-16,Pn.y+3.5,Pn.z+14],tgt:[Pn.x,Pn.y-1,Pn.z]};", 0.3)
s += [js("G.camFix=null;")]
# lago: nadar no meio
s += [js("vivo();const L=X('LAGO');vai(L.x-6,L.z-4,X('LAGO').nivel-3);P.energia=100;"), ["gwait", 1.0],
      ev("nadando", "return{nada:!!P.nada,y:r2(P.y),nivel:r2(X('LAGO').nivel),energia:r2(P.energia)};"),
      js("X('IN').mz=1;X('IN').run=true;"), ["gwait", 3.0], js("X('IN').mz=0;X('IN').run=false;"),
      ev("nadou", "return{nada:!!P.nada,energia:r2(P.energia),molhado:r2(P.molhado||0)};")]
s += foto("331_nadando.png", "const L=X('LAGO');P.yaw=0.6;X('IN').mz=1;", 0.5)
s += [js("X('IN').mz=0;")]
# zumbi no fundo do lago não alcança; afogamento sem energia
s += [js("const L=X('LAGO');vivo();vai(L.x+2,L.z-2,X('LAGO').nivel-3);P.energia=100;window.__z=ZZ('walker',L.x+3,L.z-2);window.__z.st='caca';"), ["gwait", 4.0],
      ev("zumbi_fundo", "const z=window.__z;return{vida:P.vida,zy:r2(z.y),py:r2(P.y),dif:r2(P.y-z.y)};"),
      js("Z.length=0;P.energia=0;P.vida=60;"), ["gwait", 2.0],
      ev("afogando", "return{vida:r2(P.vida),nada:!!P.nada};"), js("P.energia=100;P.vida=100;")]
# beira do rio: encher garrafas e beber
s += [js("vivo();const R=X('RIO'),s0=0.3,q=X('rioPonto')(s0),w=R.larg(s0)+1.8;vai(q[0]+q[3]*w,q[1]-q[2]*w);P.yaw=Math.atan2(-q[3],q[2]);P.body=P.yaw;n.invAdd('garrafa',3);"), ["gwait", 0.4],
      ev("beira", "const a=X('interAtual')();return{alvo:a&&a.k,txt:a?X('textoInter')(a):null,nada:!!P.nada};"),
      js("X('alvoInter');const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(false);})')(a);"), ["gwait", 0.2],
      ev("encheu", "return{suja:conta('aguaSuja'),garrafa:conta('garrafa')};")]
# fogueira ferve a água suja e assa o peixe
s += [js("vivo();vai(F[0]+1.6,F[2]+0.4);n.invAdd('peixeCru',2);P.yaw=Math.atan2(F[0]-P.x,F[2]-P.z);P.body=P.yaw;"), ["gwait", 0.3],
      ev("fogo_txt", "const a=X('interAtual')();return{k:a&&a.k,txt:a?X('textoInter')(a):null};"),
      js("X('cozinhar')();"), ev("cozinhou", "return{agua:conta('agua'),suja:conta('aguaSuja'),peixe:conta('peixeAssado'),cru:conta('peixeCru')};")]
# pesca no lago
s += [js("vivo();const L=X('LAGO');vai(72.2,90.5,L.nivel+0.6);P.yaw=Math.PI*0.02;P.body=P.yaw;n.invAdd('vara',1);sel('vara');"), ["gwait", 0.5],
      ev("cais", "const a=X('interAtual')();return{y:r2(P.y),nada:!!P.nada,k:a&&a.k,txt:a?X('textoInter')(a):null};"),
      js("const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(false);})')(a);"),
      ev("pescando", "return{pesca:!!P.pesca,morde:P.pesca?r2(P.pesca.morde):null};"),
      js("if(P.pesca)P.pesca.morde=0.2;"), ["gwait", 0.5],
      js("const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(false);})')(a);"),
      ev("peixe", "return{peixe:conta('peixeCru'),pesca:!!P.pesca,vara:(P.inv.find(q=>q&&q.id==='vara')||{}).dur};")]
# sono: barraca, segurar para dormir à noite e acordar de manhã descansado
s += [js("vivo();G.hora=21;P.sono=20;Z.length=0;const c=X('INTER').find(i=>i.kind==='cama');vai(c.x,c.z+0.6);P.yaw=Math.PI;P.body=Math.PI;"), ["gwait", 0.3],
      ev("cama_txt", "const a=X('interAtual')();return{k:a&&a.k,txt:a?X('textoInter')(a):null};"),
      js("const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(true);})')(a);"),
      ev("dormindo", "return{dorme:!!P.dorme,g:!!G.dormindo,tela:!document.getElementById('tela-sono').hidden};"),
      ["until", "__nnc.G.modo!=='jogo'||!__nnc.ev('G.dormindo')", 240],
      ev("acordou", "return{hora:r2(G.hora),sono:r2(P.sono),dorme:!!P.dorme,dia:G.dia};")]
# clima: tempestade e neblina forçadas
s += [js("vivo();G.hora=13;Z.length=0;const c=G.clima;c.segs=[[12,30,'tempestade']];c.atual='limpo';"), ["gwait", 6.0],
      ev("tempestade", "const E=X('E');return{atual:G.clima.atual,k:r2(G.clima.k),chuva:r2(G.chuva),alvo:G.chuvaAlvo,fog:r2(E.fogD*1000),visao:r2(X('climaVisao')())};"),
      js("X('raioCai')();"), ev("raio", "return{raio:r2(G.raio),chamas:X('CHAMAS').length};")]
s += foto("332_tempestade.png", "vai(F[0]+20,F[2]+8);P.yaw=-1.2;", 1.0)
s += [js("G.clima.segs=[[6,30,'neblina']];G.clima.atual='limpo';"), ["gwait", 8.0],
      ev("neblina", "const E=X('E');return{atual:G.clima.atual,fog:r2(E.fogD*1000),visao:r2(X('climaVisao')()),chuva:r2(G.chuva)};")]
s += foto("333_neblina.png", "vai(F[0]+6,F[2]+14);P.yaw=2.6;", 0.5)
# salvar e carregar
s += [js("P.sono=55;P.intox=100;X('salvarJogo')();"), js("X('carregarJogo')();G.modo='jogo';"), ["gwait", 0.3],
      ev("carregado", "return{sono:r2(P.sono),intox:Math.round(P.intox||0),clima:G.clima&&G.clima.segs.length,nada:!!P.nada};")]
salvar('p93.json', s)

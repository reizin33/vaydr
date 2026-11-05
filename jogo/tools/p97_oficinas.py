"""p97: rastros, oficinas (fornalha, bancada de armas, defumador, oficina), validade da comida, ferida grave, abrigo, chuva x roupa, serra e minério."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const B=X('BICHOS'),cria=(t,x,z,o)=>X('criarBicho')(t,x,z,o||{}),limpa=()=>{B.length=0;},vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},"
     "add=(id,q,ex)=>X('invAdd')(id,q,ex),EM=id=>X('EST_MUNDO').find(e=>e.id===id),RA=X('RASTROS');")
s = inicio("X('FAUNA_POP').ativosMax=0;")
# rastros: um cervo andando deixa pegadas; ler o rastro; com o guia lê a espécie; chuva apaga
s += [js(F+"vivo();limpa();RA.length=0;G.hora=10;vai(-20,40);const b=cria('cervo',-20,30,{yaw:Math.PI/2});b.st='explora';b.t=60;b.vAlvo=1.1;b.rx=1;b.rz=0;window.__b=b;"),
      ["gwait", 6.0],
      ev("rastros", F+"const L=RA.filter(r=>r.tipo==='cervo');const r=L[L.length-1];const t0=X('rastroLeitura')(r);G.fab.manuais.guiaRastros=1;const t1=X('rastroLeitura')(r);"
         "return{n:L.length,tipos:[...new Set(L.map(r=>r.k))].join(','),sem:t0,com:t1,alcance:r2(X('rastroAlcance')(r))};"),
      js(F+"G.chuva=1;G.tm+=200;"), ["gwait", 3.0], ev("rastros_chuva", F+"return{n:RA.filter(r=>r.tipo==='cervo').length};"), js("G.chuva=0;")]
s += foto("360_rastros.png", F+"vivo();limpa();RA.length=0;vai(0,30);for(let i=0;i<8;i++)RA.push({id:900+i,x:-1+i*0.9,z:27,tipo:i<4?'cervo':'lobo',k:'pegada',yaw:Math.PI/2,t0:G.tm,idade:0,porte:'medio',s:1,grupo:1});"
              "RA.push({id:990,x:1.5,z:25.5,tipo:'javali',k:'comida',yaw:0,t0:G.tm,idade:0,porte:'medio',s:1});RA.push({id:991,x:-1.5,z:25.2,tipo:'cervo',k:'cama',yaw:0.4,t0:G.tm,idade:0,porte:'medio',s:1});"
              "RA.push({id:992,x:3,z:26.5,tipo:'urso',k:'pegada',yaw:2,t0:G.tm,idade:0,porte:'grande',s:1});RA.push({id:993,x:0.5,z:24.5,tipo:'cervo',k:'fezes',yaw:0,t0:G.tm,idade:0,porte:'medio',s:1});"
              "G.camFix={pos:[0.5,X('ground')(0.5,30)+2.2,30],tgt:[0.8,X('ground')(0.8,26)+0.1,26]};", 0.3)
s += [js("G.camFix=null;")]
# fornalha da serra: carvão e barra; receitas da fornalha
s += [js(F+"vivo();vazio();P.roupa.costas='mochila';const e=EM('fornalhaSerra');vai(e.x+1.8,e.z+0.6);add('madeira',6);add('minerioFerro',4);X('abrirEstacao')(e);const U=X('ESTACAO_UI').forja;window.__m=[U.acao(e,'proc:carvao')];G.tm+=70;window.__m.push(U.acao(e,'recolher'));"
         "window.__m.push(U.acao(e,'proc:barra'),U.acao(e,'proc:barra'));G.tm+=130;window.__m.push(U.acao(e,'recolher'));X('fecharEstacao')();"),
      ev("fornalha", F+"return{msgs:window.__m,barra:X('invCount')('barraFerro'),carvao:X('invCount')('carvao'),minerio:X('invCount')('minerioFerro'),madeira:X('invCount')('madeira')};"),
      ev("forja_receitas", F+"add('couroPequeno',1);add('madeira',1);const R=X('RECIPES'),i=R.findIndex(r=>r.faz==='facaCaca'),j=R.findIndex(r=>r.faz==='pregos'&&r.est==='forja');const a=X('fabricar')(i),b=X('fabricar')(j);"
         "return{faca:a,pregos:b,temFaca:X('invCount')('facaCaca'),nPregos:X('invCount')('pregos'),barra:X('invCount')('barraFerro')};")]
# bancada de armas da base: conserto 30% mais barato e melhorias (fio, cabo)
s += [js(F+"vivo();vazio();const e=EM('armasBase');vai(e.x+1.6,e.z+0.8);add('facaCaca',1,{dur:100});add('pedra',2);add('gordura',1);add('couroPequeno',1);add('linha',1);add('barraFerro',1);X('abrirEstacao')(e);"),
      ev("armas", F+"const e=EM('armasBase'),U=X('ESTACAO_UI').armas,r=U.render(e),i=P.inv.findIndex(s=>s&&s.id==='facaCaca'),s=P.inv[i],d0=X('danoUp')(s),m0=X('durMaxDe')(s);"
         "const a1=U.acao(e,'up:fio:'+i),a2=U.acao(e,'up:cabo:'+i),a3=U.acao(e,'cons:'+i);X('fecharEstacao')();return{acoes:r.acoes.map(a=>a.id).join(','),msgs:[a1,a2,a3],dano:[d0,X('danoUp')(s)],max:[m0,X('durMaxDe')(s)],dur:s.dur,up:JSON.stringify(s.up),barra:X('invCount')('barraFerro')};")]
# defumador da fazenda: defumar carne; validade: carne crua estraga na mochila, no baú dura mais
s += [js(F+"vivo();vazio();const e=EM('defumadorFazenda');vai(e.x+1.6,e.z+0.8);add('carneCrua',4);add('madeira',2);X('abrirEstacao')(e);const U=X('ESTACAO_UI').conserva;window.__m=[U.acao(e,'proc:defCarne'),U.acao(e,'proc:charque')];G.tm+=250;window.__m.push(U.acao(e,'recolher'));X('fecharEstacao')();"),
      ev("defumador", F+"const d=P.inv.find(s=>s&&s.id==='carneDefumada');return{msgs:window.__m,defumada:X('invCount')('carneDefumada'),crua:X('invCount')('carneCrua'),validadeDias:d?Math.round((d.v-G.tm)/1440):null};"),
      js(F+"vivo();vazio();add('carneCrua',2);const o=X('criarObra')('bau',P.x+2,P.z+2,0);o.itens[0]=Object.assign(X('newItem')('carneCrua',2),{v:Math.round(G.tm+24*60)});window.__bau=o;X('validadePasso')();G.tm+=26*60;X('validadePasso')();"),
      ev("validade", F+"const b=window.__bau.itens[0];return{mochila:P.inv.filter(Boolean).map(s=>s.id+':'+s.n).join(','),bau:b.id+' faltam '+Math.round((b.v-G.tm)/60)+'h'};")]
# ferida grave: vida máxima cai; sutura fecha
s += [js(F+"vivo();vazio();P.vida=100;if(P.lesoes)P.lesoes.ferida=null;X('feridaGrave')(30);"),
      ev("ferida", F+"const m=X('vidaMax')();add('sutura',1);const i=P.inv.findIndex(s=>s&&s.id==='sutura');X('usarItem')(i);return{maxComFerida:m,maxDepois:X('vidaMax')(),ferida:!!P.lesoes.ferida};")]
# abrigo e chuva: na cabana do pescador não molha; com jaqueta de couro molha menos
s += [js(F+"vivo();vazio();P.roupa={cabeca:null,rosto:null,camiseta:null,tronco:null,maos:null,cintura:null,pernas:null,pes:null,costas:'mochila'};P.roupaInfo={};P.molhado=0;G.chuva=1;G.chuvaAlvo=1;vai(77.5,80.5);"),
      ["gwait", 3.0], ev("abrigo", F+"return{abrigado:X('abrigado')(),molhado:r2(P.molhado),chip:!document.getElementById('vx-abrigo').hidden};"),
      js(F+"P.molhado=0;vai(60,70);"), ["gwait", 4.0], ev("chuva_sem_roupa", F+"return{molhado:r2(P.molhado)};"),
      js(F+"P.molhado=0;add('camisaCouro',1);X('vestir')(P.inv.findIndex(s=>s&&s.id==='camisaCouro'));add('calcaCouro',1);X('vestir')(P.inv.findIndex(s=>s&&s.id==='calcaCouro'));"), ["gwait", 4.0],
      ev("chuva_com_couro", F+"return{molhado:r2(P.molhado),chuvaRoupa:r2(X('chuvaRoupa')())};"), js("G.chuva=0;G.chuvaAlvo=0;")]
# serra: morro mais alto e pedras com minério
s += [ev("serra", F+"const S=X('SERRA'),h=X('ground')(S.x,S.z),h2=X('ground')(-20,-30),R=X('ROCKS').filter(r=>r.serra);return{alturaCentro:r2(h),alturaMata:r2(h2),pedrasSerra:R.length};"),
      js(F+"vivo();vazio();add('picareta',1);const r=X('ROCKS').find(r=>r.serra&&r.alive);vai(r.x+r.s*0.9+0.6,r.z,X('ground')(r.x+r.s*0.9+0.6,r.z));mira(r.x,r.y+0.5,r.z);P.body=P.yaw;const i=P.inv.findIndex(s=>s&&s.id==='picareta');n.selecionar(i);window.__r=r;"),
      js(F+"for(let k=0;k<6;k++){X('golpeAcerta')({arma:P.inv[P.sel],vertical:true});}"),
      ev("minerio", F+"return{pedra:X('invCount')('pedra'),minerio:X('invCount')('minerioFerro'),hp:window.__r.hp};")]
s += foto("361_serra.png", F+"vivo();vazio();G.hora=10;const S=X('SERRA');vai(S.x+30,S.z+28);G.camFix={pos:[S.x+34,X('ground')(S.x+34,S.z+30)+5,S.z+30],tgt:[S.x,X('ground')(S.x,S.z)+2,S.z]};", 0.3)
s += foto("362_oficinas.png", F+"vivo();const e=EM('fornalhaSerra');vai(e.x+4,e.z+4);G.camFix={pos:[e.x+3.2,e.y+2.0,e.z+3.2],tgt:[e.x,e.y+0.8,e.z]};", 0.3)
s += foto("363_curtume.png", F+"vivo();const e=X('EST_MUNDO')[0];vai(e.x+5,e.z+5);G.camFix={pos:[e.x+2.6,e.y+1.7,e.z+2.8],tgt:[e.x,e.y+0.9,e.z]};", 0.3)
s += [js("G.camFix=null;"), js(F+"vivo();const e=X('EST_MUNDO')[0];vai(e.x+1.6,e.z+0.8);vazio();add('couro',3,{q:1});add('gordura',1);X('abrirEstacao')(e);"), ["wait", 0.5],
      js("window.__semRender=false;window.__turbo=1;"), ["wait", 2], ["shot", "364_tela_estacao.png"], js("window.__semRender=true;window.__turbo=6;"), js(F+"X('fecharEstacao')();")]
salvar('p97.json', s)

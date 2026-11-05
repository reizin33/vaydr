"""p100: ferrovia (linha, ponte caída e conserto, trem: vagão-abrigo, vagão blindado com código, diário do maquinista, estação da cidade,
draisine, portão do túnel da serra como atalho) + reteste da taxa de esporos com tempo medido, trepadeira parado e fotos que faltaram do subsolo."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const FE=X('FERRO'),S=()=>X('FERRO_ESTADO')(),IK=X('INTER_K'),IN=X('IN'),YS=X('Y_SUB'),gr=(x,z)=>X('ground')(x,z),PL=X('ESP_PL'),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),T=FE.trem,"
     "alvo=()=>{const a=X('interAtual')();return a?{k:a.k,t:(X('textoInter')(a)||{}).t}:null;},roupa=(slot,id)=>{P.roupa[slot]=id;if(P.roupaInfo)delete P.roupaInfo[slot];};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
# ---------- linha ----------
s += [ev("linha", F+"let acimaChao=0,abaixo=0,maxSalto=0;for(let i=0;i<FE.ys.length;i++){const p=X('ferroPonto')(FE.pts,FE.cum,i),g=gr(p[0],p[1]);if(FE.ys[i]<g-0.05&&i<FE.ys.length-9)abaixo++;else acimaChao++;"
         "if(i)maxSalto=Math.max(maxSalto,Math.abs(FE.ys[i]-FE.ys[i-1]));}const P0=FE.ponte,agua=X('aguaNivel')(14.1,-46.5);"
         "return{comprimento:r2(FE.L),desvio:r2(FE.dL),amostras:FE.ys.length,abaixoDoChao:abaixo,maiorDegrauPorMetro:r2(maxSalto),ponteY:r2(P0.y),agua:agua===null?null:r2(agua),folgaAgua:agua===null?null:r2(P0.y-agua),tremY:r2(T.y),pisoVagao:r2(T.yf)};")]
# andar em cima do trilho (rampas)
s += [js(F+"vivo();vazio();Z.length=0;const p=X('ferroPonto')(FE.pts,FE.cum,100);vai(p[0],p[1]);P.yaw=P.body=Math.atan2(p[2],p[3]);IN.mz=1;"), ["gwait", 3], js(F+"IN.mz=0;"),
      ev("andarTrilho", F+"const q=X('ferroPerto')(FE.pts,FE.cum,P.x,P.z);return{distTrilho:r2(q.d),y:r2(P.y),yTrilho:r2(X('ferroY')(q.s)),chao:r2(gr(P.x,P.z))};")]
# ---------- trem: diário, vagão de passageiros (entrar pela porta), cama, bagageiro ----------
s += [js(F+"vai(T.loco[1]-1.6,T.z+2.4);P.yaw=P.body=Math.PI;"), ["gwait", 0.3], ev("alvoDiario", F+"return alvo();"),
      js(F+"const a=X('interAtual')();IK[a.k].usar(a.o);"), ["wait", 0.3], ev("diario", F+"return{modo:G.modo,titulo:document.getElementById('doc-tit').textContent,temCodigo:document.getElementById('doc-txt').textContent.indexOf(S().codigo)>=0};"),
      js(F+"X('fecharDoc')();vai(38,T.z+3.6);P.yaw=P.body=Math.PI;IN.mz=1;"), ["gwait", 2.2], js(F+"IN.mz=0;"),
      ev("entrarVagao", F+"return{x:r2(P.x),z:r2(P.z),y:r2(P.y),piso:r2(T.yf),dentro:!!X('ferroInteriorEm')(P.x,P.y+0.3,P.z),abrigado:X('abrigado')(),teto:X('tetoEm')(P.x,P.y+0.3,P.z),interior:X('interiorEm')(P.x,P.y+0.3,P.z)};"),
      js(F+"vai(T.pass[0]+1.3,T.z-0.1,T.yf);P.yaw=P.body=Math.PI;"), ["gwait", 0.2], ev("alvoCama", F+"return alvo();"),
      js(F+"G.cama=null;IK.ferro_camaVagao.curto({x:T.pass[0]+1.3,z:T.z-0.55,y:T.yf});"), ev("cama", F+"return{cama:G.cama};"),
      js(F+"vazio();add('pano',3);IK.ferro_bagageiro.usar();"), ["wait", 0.3], js(F+"const i=P.inv.findIndex(q=>q&&q.id==='pano');X('bauGuardar')(i);X('fecharMochila')();"),
      ev("bagageiro", F+"const L=S().bagageiro;return{guardado:L.filter(Boolean).map(q=>q.id+':'+q.n).join(','),inv:conta('pano')};")]
# ---------- vagão blindado ----------
s += [js(F+"vazio();vai(51.2,T.z+2.6);P.yaw=P.body=Math.PI;"), ["gwait", 0.2], ev("alvoBlindado", F+"return alvo();"),
      js(F+"IK.ferro_blindado.usar({x:51.2,z:T.z+1.95});"), ["wait", 0.3], js(F+"for(const k of '1111')X('tecladoTecla')(k);X('tecladoTecla')('ok');"),
      ev("blindadoErrado", F+"return{modo:G.modo,aberto:S().blindado};"),
      js(F+"for(const k of S().codigo)X('tecladoTecla')(k);X('tecladoTecla')('ok');"),
      ev("blindadoCerto", F+"return{modo:G.modo,aberto:S().blindado};"),
      js(F+"IK.ferro_blindado.usar({x:51.2,z:T.z+1.95});"), ["wait", 0.3],
      ev("blindadoCarga", F+"const L=S().blindCx;return{modo:G.modo,itens:L.filter(Boolean).map(q=>q.id).join(','),cartaoLab:L.some(q=>q&&q.id==='cartaoLab')};"), js(F+"X('fecharMochila')();")]
# ---------- estação da cidade: entrar no prédio e ler o quadro ----------
s += [js(F+"const E=FE.est;vai(E.x,E.z+E.d/2+2.5);P.yaw=P.body=Math.PI;IN.mz=1;"), ["gwait", 1.6], js(F+"IN.mz=0;"),
      ev("estacao", F+"const E=FE.est;return{dentro:!!X('ferroInteriorEm')(P.x,P.y+0.3,P.z),y:r2(P.y),piso:r2(E.y),z:r2(P.z)};"),
      js(F+"const E=FE.est;vai(E.x+2.2,E.z-E.d/2+1.5,E.y);P.yaw=P.body=Math.PI;"), ["gwait", 0.2], ev("alvoQuadro", F+"return alvo();")]
# ---------- draisine: sobe, acelera para oeste, para na ponte caída, desce ----------
s += [js(F+"vazio();const d=S().draisine;d.s=60;const p=X('ferroPonto')(FE.pts,FE.cum,d.s);vai(p[0]-p[3]*1.2,p[1]+p[2]*1.2);"), ["gwait", 0.2], ev("alvoDraisine", F+"return alvo();"),
      js(F+"IK.draisine.usar(S().draisine);P.yaw=P.body=-Math.PI/2;IN.mz=1;"), ["gwait", 25], js(F+"IN.mz=0;"),
      ev("draisine", F+"const d=S().draisine,P0=FE.ponte;return{montado:!!P.trilho,s:r2(d.s),paradaPonte:r2(P0.sv0-1),v:r2(d.v),x:r2(P.x),y:r2(P.y),yTrilho:r2(X('ferroY')(d.s))};"),
      js(F+"const a=X('interAtual')();window.__sair=a&&a.k;IK.draisineSair.usar();"),
      ev("descer", F+"return{alvo:window.__sair,montado:!!P.trilho,y:r2(P.y),chao:r2(X('chaoEm')(P.x,P.z,P.y+0.5))};")]
# ---------- ponte: projeto (entrega parcial, depois completa), atravessar a pé e de draisine ----------
s += [js(F+"vazio();add('tabuas',10);add('pregos',4);const P0=FE.ponte;vai(P0.v1+2.2,-46.5,P0.y+0.2);P.yaw=P.body=-Math.PI/2;"), ["gwait", 0.2],
      ev("alvoPonte", F+"return alvo();"), js(F+"IK.ferro_ponte.usar();"),
      ev("ponteParcial", F+"return{entregue:S().ponte.entregue,feita:S().ponte.feita,tabuas:conta('tabuas')};"),
      js(F+"add('tabuas',6);add('pregos',6);add('barraFerro',4);add('corda',2);IK.ferro_ponte.usar();"),
      ev("ponteFeita", F+"return{feita:S().ponte.feita,chaoNoVao:r2(X('chaoEm')(14.1,-46.5,FE.ponte.y+0.5)),ponteY:r2(FE.ponte.y)};"),
      js(F+"const P0=FE.ponte;vai(P0.v1+1.5,-46.5,P0.y+0.15);P.yaw=P.body=-Math.PI/2;IN.mz=1;"), ["gwait", 4], js(F+"IN.mz=0;"),
      ev("atravessar", F+"return{x:r2(P.x),y:r2(P.y),nadando:!!P.nada};"),
      js(F+"const d=S().draisine;d.s=X('FERRO').ponte.sv0-4;IK.draisine.usar(d);P.yaw=P.body=-Math.PI/2;IN.mz=1;"), ["gwait", 10], js(F+"IN.mz=0;"),
      ev("draisinePassa", F+"const d=S().draisine;return{s:r2(d.s),passou:d.s>FE.ponte.sv1+1};"), js(F+"IK.draisineSair.usar();")]
# ---------- portão do túnel da serra: fechado por fora, abre por dentro, vira atalho ----------
s += [js(F+"vivo();const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');vai(e.sup[0]+0.6,e.sup[1]);P.yaw=P.body=-Math.PI/2;"), ["gwait", 0.2],
      ev("portalFora", F+"const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');return{alvo:alvo(),texto:IK.entradaSub.texto(e).t};"),
      js(F+"const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');vai(e.sub[0],e.sub[1],YS);"), ["gwait", 0.2], ev("portalDentro", F+"return alvo();"),
      js(F+"const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');IK.saidaSub.usar(e);"), ev("alavanca", F+"return{aberto:!!X('subD')().abertas.ent_tunelTrem,y:r2(P.y)};"),
      js(F+"const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');IK.saidaSub.usar(e);"), ["wait", 1.5], ["gwait", 0.3],
      ev("saiuPortal", F+"const e=X('SUB').entradas.find(q=>q.id==='tunelTrem');return{y:r2(P.y),dist:r2(Math.hypot(P.x-e.sup[0],P.z-e.sup[1])),texto:IK.entradaSub.texto(e).t};")]
# ---------- salvar e carregar ----------
s += [js(F+"X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.3],
      ev("carregar", F+"const d=S();return{ponte:d.ponte.feita,chaoNoVao:r2(X('chaoEm')(14.1,-46.5,FE.ponte.y+0.5)),blindado:d.blindado,bagageiro:(d.bagageiro||[]).filter(Boolean).length,draisine:r2(d.draisine.s),portal:!!X('subD')().abertas.ent_tunelTrem};")]
# ---------- reteste: esporos com tempo medido e trepadeira parado ----------
s += [js(F+"vivo();vazio();Z.length=0;roupa('rosto',null);const p=PL.find(q=>q.t==='bulbo'&&q.e===2);window.__b=p;vai(p.x+0.9,p.z+0.3);P.esporo=0;window.__t0=G.t;"), ["gwait", 4],
      ev("taxaSem", F+"const dt=G.t-window.__t0;return{esporo:r2(P.esporo),tempo:r2(dt),porSeg:r2(P.esporo/dt),intens:r2(X('espIntensidade')(P.x,P.y,P.z))};"),
      js(F+"roupa('rosto','bandana');P.esporo=0;window.__t0=G.t;"), ["gwait", 4],
      ev("taxaBandana", F+"const dt=G.t-window.__t0;return{esporo:r2(P.esporo),tempo:r2(dt),porSeg:r2(P.esporo/dt),prot:r2(X('espProtecao')())};"),
      js(F+"roupa('rosto',null);P.esporo=0;const p=PL.find(q=>q.t==='trepadeira'&&q.e===2);vai(p.x+0.3,p.z+0.2);"), ["gwait", 0.6],
      ev("trepadeiraParado", F+"return{lento:P.lentoMata};")]
# ---------- fotos ----------
s += foto("400_trem.png", F+"vivo();G.hora=10;vai(60,-60);G.camFix={pos:[60,T.y+6,-62],tgt:[34,T.y+1.5,-50]};", 0.4)
s += foto("401_vagao_dentro.png", F+"vai(40.5,T.z,T.yf);P.yaw=P.body=-Math.PI/2;G.camFix={pos:[43.0,T.yf+1.8,T.z+0.4],tgt:[33.0,T.yf+0.6,T.z-0.3]};", 0.3)
s += foto("402_ponte.png", F+"vai(24,-40);G.camFix={pos:[24,FE.ponte.y+5,-36],tgt:[12,FE.ponte.y-1,-46.5]};", 0.3)
s += foto("403_estacao.png", F+"const E=FE.est;vai(E.x-14,-34);G.camFix={pos:[E.x-14,E.yp+4,-33],tgt:[E.x,E.yp+1,-44]};", 0.3)
s += foto("404_portal.png", F+"const p=FE.portal;vai(p.x+14,p.z+3);G.camFix={pos:[p.x+12,p.y+3.5,p.z+5],tgt:[p.x,p.y+2,p.z]};", 0.3)
s += foto("405_draisine.png", F+"const d=S().draisine;d.s=150;const p=X('ferroPonto')(FE.pts,FE.cum,d.s);IK.draisine.usar(d);G.camFix={pos:[p[0]-4,X('ferroY')(d.s)+2.6,p[1]+5],tgt:[p[0],X('ferroY')(d.s)+1,p[1]]};", 0.3)
s += [js("G.camFix=null;"), js(F+"IK.draisineSair.usar();")]
s += foto("375_caverna.png", F+"vai(-118,-95,YS);G.camFix={pos:[-114.0,YS+2.4,-93.5],tgt:[-121.5,YS+1.0,-101]};", 0.3)
s += foto("376_lab_cultivo.png", F+"X('SUB').portas.find(d=>d.B.nome==='Sala de cultivo').aberta=true;vai(-47,-115,YS);G.camFix={pos:[-43.2,YS+2.0,-114.8],tgt:[-50.5,YS+0.6,-119.5]};", 0.3)
s += foto("377_nucleo.png", F+"vai(-39,-118,YS);G.camFix={pos:[-40.6,YS+2.6,-117.0],tgt:[-35.5,YS+1.5,-123.0]};", 0.3)
s += foto("378_abrigo.png", F+"vai(52,-60,YS);G.camFix={pos:[49.0,YS+2.2,-58.6],tgt:[56,YS+0.6,-64.5]};", 0.3)
s += foto("382_alcapao_base.png", F+"vivo();const e=X('SUB').entradas.find(q=>q.id==='bunker');vai(e.sup[0]+3,e.sup[1]+3);G.camFix={pos:[e.sup[0]+3.5,gr(e.sup[0],e.sup[1])+2.6,e.sup[1]+3.5],tgt:[e.sup[0],gr(e.sup[0],e.sup[1])+0.2,e.sup[1]]};", 0.3)
s += foto("383_entrada_mina.png", F+"const e=X('SUB').entradas.find(q=>q.id==='mina');vai(e.sup[0]+5,e.sup[1]+6);const g=gr(e.sup[0],e.sup[1]);G.camFix={pos:[e.sup[0]+Math.sin(e.sup[2])*-7,g+3,e.sup[1]+Math.cos(e.sup[2])*-7],tgt:[e.sup[0],g+1.4,e.sup[1]]};", 0.3)
s += foto("384_boca_caverna.png", F+"const e=X('SUB').entradas.find(q=>q.id==='caverna');vai(e.sup[0]+6,e.sup[1]+6);const g=gr(e.sup[0],e.sup[1]);G.camFix={pos:[e.sup[0]+Math.sin(e.sup[2])*-8,g+3,e.sup[1]+Math.cos(e.sup[2])*-8],tgt:[e.sup[0],g+1.4,e.sup[1]]};", 0.3)
s += [js("G.camFix=null;")]
salvar('p100.json', s)

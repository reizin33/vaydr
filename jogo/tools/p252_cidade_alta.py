"""p252 (v10.8.0): Cidade Alta. Confere: o bairro montado sem erro (casas, ruas, igreja, plano inclinado), subir a pé pela Ladeira
da Conceição e pela escadaria do Plano Inclinado, ruas livres (nada no meio do caminho), subir correndo no telhado de uma casa de
1 andar e andar por cima dele, subir na sacada correndo, a escada da torre até o sino, tocar o sino (zumbi perto ouve), observar
do alto (o mapa), revistar o saque de um telhado, os zumbis do bairro e salvar/carregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
CA = "const CA=X('CA'),IN=X('IN');"
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();window.__cadaPasso=()=>{const n=__nnc;n.P.vida=Math.max(n.P.vida,50);if(window.__semZ)n.Z.length=0;};window.__semZ=true;X('BICHOS').length=0;")]
s += [ev("estado", CA + "const R=CA.rampas;return{ok:CA.ok,erro:CA.erro,casas:CA.casas.length,predios:CA.predios.length,igreja:!!CA.igreja,torre:!!(CA.torre&&CA.torre.via),ruas:CA.ruas.length,"
         "rampas:R.map(q=>q.nome+':'+r2(q.ys[0])+'->'+r2(q.ys[q.ns])),info:CA.info,mapa:X('dentroMapa')(240,-190)};")]
# ruas livres: o eixo de cada rua (fora as praças) sem colisor no caminho
s += [ev("ruasLivres", CA + "const out={};for(const r of CA.ruas){if(r.praca)continue;let n=0,b=0;for(let t=1;t<r.len-1;t+=1){const p=X('caRuaEm')(r,t);n++;if(X('pointBlocked')(p.x,p.z,0.35))b++;}out[r.nome]=b+'/'+n;}return out;")]
# subir a ladeira a pé
s += [js(CA + "const R=CA.rampas[0];const p=R.pt(1.2);vai(p[0],p[1],R.yEm(1.2)+0.02);P.yaw=P.body=R.yaw;IN.mz=1;IN.run=false;window.__lad=R;"), ["gwait", 22],
      ev("ladeira", CA + "const R=window.__lad,t=(P.x-R.P0[0])*R.d[0]+(P.z-R.P0[1])*R.d[1];IN.mz=0;return{x:r2(P.x),z:r2(P.z),y:r2(P.y),avancou:r2(t),L:r2(R.L),yTopo:r2(R.ys[R.ns]),noChao:P.noChao};")]
# subir a escadaria do plano inclinado
s += [js(CA + "const R=CA.rampas[1];vai(R.P0[0]+1.3,R.P0[1]-0.8,R.yEm(0.8)+0.02);P.yaw=P.body=Math.PI;IN.mz=1;window.__pl=R;"), ["gwait", 14],
      ev("plano", CA + "const R=window.__pl;IN.mz=0;return{x:r2(P.x),z:r2(P.z),y:r2(P.y),yTopo:r2(R.ys[R.ns]),zTopo:r2(R.P1[1]),chegou:P.z<R.P1[1]+2&&Math.abs(P.y-R.ys[R.ns])<0.6};")]
# telhado: casa de 1 andar com a frente livre (correndo de frente para a fachada, sobe no beiral)
s += [js(CA + "const H=CA.casas.filter(h=>h.n===1&&!h.sacada&&h.W>5.4).map(h=>{const f=X('caPw')(h,0,-h.D/2-2.6);return{h,f,ok:!X('pointBlocked')(f[0],f[1],0.5)&&Math.abs(X('ground')(f[0],f[1])-(h.base-0.14))<0.6};}).filter(q=>q.ok);"
          "const q=H[0];window.__casa=q&&q.h;if(q){vai(q.f[0],q.f[1],X('ground')(q.f[0],q.f[1])+0.02);P.yaw=P.body=q.h.yaw;IN.mz=1;IN.run=true;P.correndo=true;P.energia=100;}"), ["gwait", 0.45],
      js(CA + "X('pular')();"), ["gwait", 2.0],
      ev("telhado", CA + "const h=window.__casa;IN.mz=0;IN.run=false;if(!h)return{semCasa:true};const yR=h.yR;return{n:h.n,yE:r2(h.yE),yR:r2(yR),y:r2(P.y),emCima:P.y>h.yE-0.1,noChao:P.noChao};")]
s += [js(CA + "const h=window.__casa;if(h){const c=X('caPw')(h,0,-0.2);P.yaw=P.body=h.yaw+Math.PI/2;IN.mz=1;}"), ["gwait", 1.2],
      ev("andaTelhado", CA + "const h=window.__casa;IN.mz=0;if(!h)return null;return{y:r2(P.y),acimaDoBeiral:P.y>h.yE-0.2,vida:Math.round(P.vida)};")]
# sacada: correndo de frente, sobe no piso da sacada
s += [js(CA + "const H=CA.casas.filter(h=>h.sacadas&&h.sacadas.length).map(h=>{const sc=h.sacadas[0],u=(sc[0]+sc[1])/2,f=X('caPw')(h,u,-h.D/2-2.8);return{h,sc,f,ok:!X('pointBlocked')(f[0],f[1],0.5)};}).filter(q=>q.ok);"
          "const q=H[0];window.__sac=q;if(q){vai(q.f[0],q.f[1],X('ground')(q.f[0],q.f[1])+0.02);P.yaw=P.body=q.h.yaw;IN.mz=1;IN.run=true;P.correndo=true;P.energia=100;}"), ["gwait", 0.45],
      js(CA + "X('pular')();"), ["gwait", 2.0],
      ev("sacada", CA + "const q=window.__sac;IN.mz=0;IN.run=false;if(!q)return{semSacada:true};return{ySacada:r2(q.sc[2]+0.06),y:r2(P.y),subiu:Math.abs(P.y-(q.sc[2]+0.06))<0.3||P.y>q.sc[2]+0.5};")]
# torre: escada de marinheiro até o sino
s += [js(CA + "const t=CA.torre,v=t.via;vai(v.base.x,v.base.z,v.base.y+0.02);P.energia=100;X('comecarEscalada')({v,u:0});IN.mz=1;window.__t=t;"), ["gwait", 11],
      ev("torre", CA + "const t=window.__t;IN.mz=0;return{escalando:!!P.escala,y:r2(P.y),yS:r2(t.yS),noSino:Math.abs(P.y-t.yS)<0.4&&!P.escala};")]
s += [ev("torreTexto", "const t=window.__t,K=X('INTER_K');return{sino:K.caltaSino.texto(t).t,mirante:K.caltaMirante.texto(t).t};")]
# sino: um zumbi a 40 m ouve e vem para a igreja
s += [js("window.__semZ=false;const t=window.__t;const z=ZZ('walker',t.x+30,t.z-26);z.st='vaga';window.__zs=z;X('INTER_K').caltaSino.usar(t);"), ["gwait", 3],
      ev("sino", "const z=window.__zs,t=window.__t;return{ouviu:!!(z.ouvir||z.st==='caca'||z.st==='alerta'),st:z.st,dist0:r2(Math.hypot(30,26)),dist:r2(Math.hypot(z.x-t.x,z.z-t.z)),espera:X('INTER_K').caltaSino.texto(t).t};")]
s += [js("window.__semZ=true;Z.length=0;X('INTER_K').caltaMirante.usar(window.__t,true);"), ["gwait", 0.3],
      ev("mirante", "return{mapeado:X('caD')().mapeado};")]
# saque de telhado
s += [js(CA + "const it=X('INTER').find(o=>o.id==='calta-t0');window.__it=it;if(it){vai(it.x+0.3,it.z,it.y);}"), ["gwait", 0.3],
      ev("saque", "const it=window.__it;if(!it)return{semSaque:true};return{id:it.id,tabela:it.tabela,label:it.label,y:r2(it.y)};")]
# zumbis do bairro: aparecem quando você chega
s += [js("window.__semZ=false;Z.length=0;vai(233,-193,X('ground')(233,-193)+0.02);X('caD')().zVivos=-1;X('CA_POV').feito=false;"), ["gwait", 3],
      ev("zumbis", "const L=Z.filter(z=>z.calta&&z.vivo);return{n:L.length,longeDoJogador:L.every(z=>Math.hypot(z.x-P.x,z.z-P.z)>=19),noBairro:L.filter(z=>X('dentroCAlta')(z.x,z.z,0)).length};")]
# salvar e carregar dentro do bairro
s += [js("window.__semZ=true;Z.length=0;vai(233,-193,X('ground')(233,-193)+0.02);X('caD')().mapeado=true;window.__ok=X('salvarJogo')()!==false;X('novoJogo')();"), ["gwait", 0.5], js("X('carregarJogo')();"), ["gwait", 2.5],
      ev("carregar", "return{salvou:window.__ok,x:r2(P.x),z:r2(P.z),mapeado:X('caD')().mapeado,preso:!!X('pointBlocked')(P.x,P.z,0.2)};")]
# atividades: a lista tem as coisas do mapa (abrigo, corrida, territórios, sobreviventes, destroços...)
s += [ev("atividades", "const L=X('ativTodas')(),t={};for(const a of L)t[a.tipo]=(t[a.tipo]||0)+1;X('abrirMapa')();const el=document.getElementById('mapa-ativ');const ni=el?el.querySelectorAll('.at-i').length:-1;X('fecharMapa')();return{n:L.length,tipos:t,itensNaLista:ni};")]
# abrigo da Matriz: sem zumbi em volta fica limpo; com fio, fita e fusível, acende; cama, bancada e a luz que espanta
s += [js(CA + "Z.length=0;window.__semZ=true;const A=CA.abrigo;window.__ab=A;vai(A.x+8,A.z+2);"), ["gwait", 1.2],
      ev("abrigoLimpo", "const A=window.__ab,S=X('abrigoD')(A.id);return{limpo:S.limpo,ligado:S.ligado,falta:X('INTER_K').abrigoQuadro.texto(A).s};")]
s += [js("const A=window.__ab;n.ev(\"invAdd('fio',2);invAdd('fita',1);invAdd('fusivel',1);\");vai(A.quadro.x,A.quadro.z,A.quadro.y);const K=X('INTER_K').abrigoQuadro;window.__txt=K.texto(A);K.usar(A,true);"), ["gwait", 1.0],
      ev("abrigoLigado", "const A=window.__ab,S=X('abrigoD')(A.id);vai(A.bancada.x+0.9,A.bancada.z,A.bancada.y);const banc=X('pertoBancada')();X('INTER_K').abrigoCama.curto(A);"
         "return{texto:window.__txt.t,ligado:S.ligado,luzes:X('FIRES').filter(f=>f.abrigo===A.id).length,bancada:banc,cama:!!(G.cama&&G.cama.abrigo===A.id),sobrouFio:X('invCount')('fio')};")]
s += [js("window.__semZ=false;const A=window.__ab;vai(A.cama.x,A.cama.z,A.cama.y);const z=ZZ('walker',A.x+4,A.z+3);z.st='caca';window.__za=z;"), ["gwait", 2.5],
      ev("abrigoLuz", "const A=window.__ab,z=window.__za;return{dist:r2(Math.hypot(z.x-A.x,z.z-A.z)),rIn:r2(A.r*0.55),longe:Math.hypot(z.x-A.x,z.z-A.z)>A.r*0.5,vivo:z.vivo,st:z.st};")]
# corrida: começa, passa pelos pontos na ordem e termina com medalha e prêmio
s += [js(CA + "window.__semZ=true;Z.length=0;const C=CA.corrida;window.__c=C;vai(C.ini.x,C.ini.z,C.ini.y);window.__m0=X('invCount')('mochilaPequena');X('corridaComecar')(C);"), ["gwait", 3.4]]
for i in range(8):
    s += [js("const C=window.__c,p=C.pts[" + str(i) + "];if(p)vai(p.x,p.z,p.y+0.05);"), ["gwait", 0.6]]
s += [ev("corrida", "const C=window.__c,S=X('corridaD')(C.id);return{pontos:C.pts.length,ativa:!!X('CORR').ativa,melhor:S.melhor,medalha:S.medalha,mochila:X('invCount')('mochilaPequena')-window.__m0,ouro:C.tempos.ouro};")]
s += [ev("maquinas", "const it=X('INTER').find(o=>o.id==='calta-maquinas');return it?{x:r2(it.x),z:r2(it.z),primeiro:JSON.stringify(it.primeiro)}:null;")]
s += foto("p252_abrigo_matriz.png", "Z.length=0;const A=window.__ab;vai(A.cama.x+1,A.cama.z);G.hora=20;G.camFix={pos:[A.quadro.x-1.5,A.y+2.4,A.quadro.z+0.5],tgt:[A.cama.x,A.y+1.0,A.cama.z]};", 0.4)
s += foto("p252_cidade_alta_rua.png", "Z.length=0;vai(250,-150);G.hora=16;G.camFix={pos:[247,19,-146],tgt:[262,16.5,-170]};", 0.4)
s += foto("p252_cidade_alta_telhados.png", "Z.length=0;vai(262,-186);G.hora=16;G.camFix={pos:[275,27,-168],tgt:[245,16,-205]};", 0.4)
salvar('tools/p252_cidade_alta.json', s)

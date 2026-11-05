"""p235 (relato do dono, 05/11 19:13): 'não consigo correr nem pular' e, na enchente, 'a água fica voando, não segue a grama
e não dá para atravessar nadando, parece que tem uma parede'.
1 correr (Shift) e pular (Espaço) com as teclas de verdade, na estrada
2 enchente no máximo (1,5 m): onde o chão está abaixo da água e não tem água (buraco) e onde a beira da água fica no ar
3 atravessar o rio nadando, longe da ponte, e atravessar a ponte alagada andando
4 fotos da enchente: da estrada olhando a ponte (como na foto do dono) e da beira do rio"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;__nnc.Z.length=0;"
         "if(window.__track){window.__ymax=Math.max(window.__ymax,P.y);window.__nadou=window.__nadou||!!P.nada;window.__xmax=Math.max(window.__xmax,P.x);}};")]
RZ = "const rz=x=>5.6+Math.sin(x*0.045)*3.2;"
# 1 correr e pular
s += [js(RZ + "vai(6,rz(6));P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=0;P.energia=100;"), ["down", "w"], ["gwait", 1.0],
      ev("andando", "return{vel:r2(Math.hypot(P.vx,P.vz)),energia:Math.round(P.energia)};"), ["down", "Shift"], ["gwait", 1.2],
      ev("correndo", "return{vel:r2(Math.hypot(P.vx,P.vz)),energia:Math.round(P.energia),run:X('IN').run,agachado:!!P.agachado};"), ["up", "Shift"], ["up", "w"], ["gwait", 0.8]]
s += [js("window.__ymax=P.y;window.__y0=P.y;window.__xmax=P.x;window.__nadou=false;window.__track=1;"), ["down", "Space"], ["gwait", 0.08], ["up", "Space"], ["gwait", 1.0],
      ev("pulo", "window.__track=0;return{subiu:r2(window.__ymax-window.__y0),energia:Math.round(P.energia),noChao:P.noChao};")]
# 2 enchente no máximo
s += [js("const C=X('mundoD')().cheia;C.ativa=true;C.alvo=1.5;C.nivel=1.5;C.fim=G.tm+8*60;C.chuva=0;X('cheiaPasso')(0);"), ["gwait", 0.3]]
s += [ev("enchente", """const R=X('RIO'),ex=R.enchente,an=X('aguaNivel'),gr=n.ground,lr=X('lagoR'),nova=X('typeof cheiaAlc')==='function';
 const alc=(s,l)=>nova?X('cheiaAlc')(s,l)+1.2:1.1+ex*4,sobe=s=>nova?X('cheiaEx')(s):ex;let noAr=0,maxAr=0,bordaAr=[],buraco=0,amostras=0,maxSobe=0,minSobe=9;
 for(let i=0;i<=100;i++){const s=i/100,p=X('rioPonto')(s);if(lr(p[0],p[1])<0.93)break;const w=R.larg(s),e=sobe(s),nv=X('rioNivel')(s)+e,nx=-p[3],nz=p[2];maxSobe=Math.max(maxSobe,e);minSobe=Math.min(minSobe,e);
  for(const lado of[-1,1]){const wv=w+alc(s,lado),xe=p[0]+nx*wv*lado,ze=p[1]+nz*wv*lado,g=gr(xe,ze);if(g<nv-0.05&&Math.abs(X('rioPerto')(xe,ze).s-s)<0.03){noAr++;maxAr=Math.max(maxAr,nv-g);if(bordaAr.length<6)bordaAr.push([Math.round(xe),Math.round(ze),r2(nv-g)]);}
   for(let d=w;d<w+alc(s,lado)-1.2;d+=1){const x=p[0]+nx*d*lado,z=p[1]+nz*d*lado,q=X('rioPerto')(x,z);if(Math.abs(q.s-s)>0.03)continue;amostras++;if(gr(x,z)<nv-0.3&&an(x,z)===null)buraco++;}}}
 const lug=X('PLACES').map(p=>{let ag=0;for(let a=0;a<16;a++)for(const f of[0,0.5,1]){const x=p.x+Math.cos(a/16*6.283)*p.r*f,z=p.z+Math.sin(a/16*6.283)*p.r*f;const v=an(x,z);if(v!==null&&v>gr(x,z)+0.05)ag++;}return p.id+':'+ag;}).filter(t=>!t.endsWith(':0'));
 return{nivelExtra:ex,versaoNova:nova,subidaMax:r2(maxSobe),subidaMin:r2(minSobe),beirasNoAr:noAr,maiorAltura:r2(maxAr),exemplos:bordaAr,buracosSemAgua:buraco,amostras,lugaresAlagados:lug,aguaNaFogueira:an(F[0],F[2])};""")]
# 3 atravessar nadando (longe da ponte) e pela ponte alagada
s += [js("vai(4,40);P.yaw=Math.PI/2;P.body=P.yaw;P.energia=100;window.__ymax=P.y;window.__y0=P.y;window.__xmax=P.x;window.__nadou=false;window.__track=1;"), ["down", "w"], ["gwait", 26], ["up", "w"],
      ev("nadando", "window.__track=0;const q=X('rioPerto')(P.x,P.z);return{x:r2(P.x),z:r2(P.z),xMax:r2(window.__xmax),nadou:window.__nadou,atravessou:P.x>45,nadandoAgora:!!P.nada,energia:Math.round(P.energia),vida:Math.round(P.vida)};")]
s += [js(RZ + "vai(8,rz(8));P.yaw=Math.PI/2;P.body=P.yaw;P.energia=100;window.__xmax=P.x;window.__nadou=false;window.__ymax=P.y;window.__y0=P.y;window.__track=1;"), ["down", "w"], ["gwait", 14], ["up", "w"],
      ev("ponte", "window.__track=0;const nv=X('aguaNivel')(P.x,P.z);return{x:r2(P.x),z:r2(P.z),xMax:r2(window.__xmax),atravessou:P.x>44,nadou:window.__nadou,nadandoAgora:!!P.nada,y:r2(P.y),nivelAgua:nv===null?null:r2(nv),chao:r2(n.chaoEm(P.x,P.z,P.y+0.5)),terreno:r2(n.ground(P.x,P.z)),deck:r2(X('PONTE').y)};")]
# 4 fotos
s += foto("p235_ponte.png", RZ + "vai(9,rz(9));P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.06;G.hora=11;")
s += foto("p235_margem.png", "vai(6,52);P.yaw=Math.PI/2+0.35;P.body=P.yaw;P.pitch=-0.12;G.hora=11;")
salvar('tools/p235_enchente.json', s, vp=(960, 540))

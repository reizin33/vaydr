"""p101: árvores maiores, vila espalhada com mais casas, sítios pelo mapa; reteste da estação (dentro do mapa) e da escada do vagão."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const FE=X('FERRO'),E=FE.est,T=FE.trem,IN=X('IN'),gr=(x,z)=>X('ground')(x,z),PLC=X('PLACES'),INT=X('INTER');")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("arvores", F+"const T2=X('TREES').filter(t=>!t.agua);const ss=T2.map(t=>t.s).sort((a,b)=>a-b);const gr2=T2.filter(t=>t.s>=2.2).length;"
         "return{total:T2.length,menor:r2(ss[0]),media:r2(ss.reduce((a,b)=>a+b,0)/ss.length),maior:r2(ss[ss.length-1]),grandes:gr2,gigantes:X('GIGANTES').length};"),
      ev("vila", F+"const V=PLC.find(p=>p.id==='vila');const casas=INT.filter(i=>/^vila-casa|^vila-antena|^vila-mercado|^vila-farmacia/.test(i.id));"
         "let menor=1e9;for(let a=0;a<casas.length;a++)for(let b=a+1;b<casas.length;b++)menor=Math.min(menor,Math.hypot(casas[a].x-casas[b].x,casas[a].z-casas[b].z));"
         "return{raio:V.r,construcoes:casas.length,ids:casas.map(c=>c.id).join(','),menorDistanciaEntrePortas:r2(menor),antena:!!INT.find(i=>i.id==='vila-antena')};"),
      ev("sitios", F+"return PLC.filter(p=>p.sitio).map(p=>({id:p.id,nome:p.nome,casa:!!INT.find(i=>i.id==='casa-'+p.id),galpao:!!INT.find(i=>i.id==='galpao-'+p.id),poco:!!INT.find(i=>i.id==='poco-'+p.id),"
         "carro:!!INT.find(i=>i.id==='carro-'+p.id),dentroMapa:X('dentroMapa')(p.x,p.z,8),arvoresNoQuintal:X('TREES').filter(t=>t.alive&&Math.hypot(t.x-p.x,t.z-p.z)<p.r).length}));")]
# andar até a porta de cada casa da vila (as portas não ficam presas em parede ou em outra casa)
s += [ev("portasLivres", F+"const L=INT.filter(i=>/^vila-|^casa-sitio|^galpao-sitio|^poco-sitio/.test(i.id));return L.filter(i=>X('pointBlocked')(i.x,i.z,0.3)).map(i=>i.id);")]
# estação: entrar no prédio pela plataforma e ler o quadro
s += [js(F+"vivo();vai(E.x,E.z+E.d/2+2.5);P.yaw=P.body=Math.PI;IN.mz=1;"), ["gwait", 1.8], js(F+"IN.mz=0;"),
      ev("estacao", F+"return{dentroDoMapa:X('dentroMapa')(E.x,E.z),dentro:!!X('ferroInteriorEm')(P.x,P.y+0.3,P.z),y:r2(P.y),piso:r2(E.y),z:r2(P.z),abrigado:X('abrigado')()};"),
      js(F+"vai(E.x+2.2,E.z-E.d/2+1.5,E.y);P.yaw=P.body=Math.PI;"), ["gwait", 0.2],
      ev("quadro", F+"const a=X('interAtual')();return a&&a.k;")]
# vagão: subir pela escada e entrar
s += [js(F+"vai(38,T.z+3.6);P.yaw=P.body=Math.PI;IN.mz=1;"), ["gwait", 3], js(F+"IN.mz=0;"),
      ev("vagao", F+"return{z:r2(P.z),y:r2(P.y),piso:r2(T.yf),dentro:!!X('ferroInteriorEm')(P.x,P.y+0.3,P.z),degraus:X('vagaoDegraus')().length};")]
# fotos
s += foto("410_vila_alto.png", F+"vivo();G.hora=10.5;const V=PLC.find(p=>p.id==='vila');vai(V.x,V.z+40);G.camFix={pos:[V.x+8,gr(V.x,V.z)+46,V.z+44],tgt:[V.x,gr(V.x,V.z),V.z-6]};", 0.5)
s += foto("411_vila_rua.png", F+"const V=PLC.find(p=>p.id==='vila');vai(V.x+2,V.z+4);G.camFix={pos:[V.x+2,gr(V.x,V.z)+2.2,V.z+8],tgt:[V.x-8,gr(V.x,V.z)+2,V.z-20]};", 0.5)
s += foto("412_sitio.png", F+"const p=PLC.find(p=>p.id==='sitio3');vai(p.x+14,p.z+12);G.camFix={pos:[p.x+16,gr(p.x,p.z)+7,p.z+15],tgt:[p.x,gr(p.x,p.z)+1,p.z]};", 0.5)
s += foto("413_sitio2.png", F+"const p=PLC.find(p=>p.id==='sitio1');vai(p.x+14,p.z-12);G.camFix={pos:[p.x+15,gr(p.x,p.z)+6,p.z-14],tgt:[p.x,gr(p.x,p.z)+1,p.z]};", 0.5)
s += foto("414_mata.png", F+"const t=X('TREES').filter(t=>t.alive&&t.s>2.3&&Math.hypot(t.x,t.z)<120)[0];vai(t.x+10,t.z+10);G.camFix={pos:[t.x+9,gr(t.x,t.z)+1.8,t.z+9],tgt:[t.x,gr(t.x,t.z)+5,t.z]};", 0.5)
s += foto("415_clareira_mata.png", F+"vai(0,-12);G.camFix={pos:[0,gr(0,-12)+1.7,-12],tgt:[0,gr(0,-40)+4,-40]};", 0.5)
s += [js("G.camFix=null;")]
salvar('p101.json', s)

"""p256 (v10.8.4): mais coisas para fazer, ligadas.
1 Caçadas: depois do boato, cada chefe da região entra no "O que fazer" (onde fica, como lutar e o que deixa)
2 Abrigo de São José (largo da igreja da Vila, gerador: 2 gasolina e 1 óleo de motor) e Abrigo do Cais (Porto Velho, bateria
  de veículo e 2 fios): montados em lugar livre, limpam, acendem, cama e baú; zumbi na luz vai para a beira
3 viajar do São José para o Cais (os dois acesos)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__semZ=true;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;n.P.sede=100;n.P.vida=Math.max(n.P.vida,80);if(window.__semZ)n.Z.length=0;};")]
# 1 caçadas
s += [ev("cacadasAntes", "return X('ativTodas')().filter(a=>a.tipo==='chefe').map(a=>a.id);"),
      js("const C=G.chefesR;C.acougueiro.ouviu=true;C.maquinista.ouviu=true;X('ativLimpa')();"),
      ev("cacadas", "return X('ativTodas')().filter(a=>a.tipo==='chefe').map(a=>({id:a.id,nome:a.nome,x:Math.round(a.x),z:Math.round(a.z),falta:a.falta.slice(0,60),premio:a.premio}));")]
# 2 abrigos
for ab, itens in (("saojose", "X('ganhar')('gasolina',2);X('ganhar')('oleoMotor',1);"), ("cais", "X('ganhar')('bateriaVeic',1);X('ganhar')('fio',2);")):
    s += [ev(ab + "Montado", "const A=X('ABRIGOS').find(q=>q.id==='" + ab + "');if(!A)return{ok:false};const y=A.y;"
             "const livre=(p)=>!X('bloqueadoAlto')(p.x,p.z,0.3,p.y+0.05);return{ok:true,x:r2(A.x),z:r2(A.z),y:r2(y),custo:A.custo,quadro:[r2(A.quadro.x),r2(A.quadro.z)],"
             "chaoCama:r2(X('chaoEm')(A.cama.x,A.cama.z,y+1)-y),chaoQuadro:r2(X('chaoEm')(A.quadro.x,A.quadro.z,y+1)-y),malha:!!X('ABR2').malha};"),
          js("const A=X('ABRIGOS').find(q=>q.id==='" + ab + "');vai(A.x,A.z,A.y+0.05);"), ["gwait", 1.2],
          js("const A=X('ABRIGOS').find(q=>q.id==='" + ab + "');" + itens + "const K=X('INTER_K').abrigoQuadro;window.__t=K.texto(A);K.usar(A,true);"), ["gwait", 1.2],
          ev(ab + "Aceso", "const A=X('ABRIGOS').find(q=>q.id==='" + ab + "'),S=X('abrigoD')(A.id);return{texto:window.__t.t+' | '+window.__t.s,limpo:S.limpo,ligado:S.ligado,luzes:X('FIRES').filter(f=>f.abrigo===A.id).length};"),
          js("const A=X('ABRIGOS').find(q=>q.id==='" + ab + "');window.__semZ=false;Z.length=0;const q=ZZ('walker',A.x+3,A.z+2.5);if(q){q.st='caca';window.__zq=q;}vai(A.x,A.z,A.y+0.05);"), ["gwait", 1.0],
          ev(ab + "Luz", "const A=X('ABRIGOS').find(q=>q.id==='" + ab + "'),q=window.__zq;return q?{dist:r2(Math.hypot(q.x-A.x,q.z-A.z)),rIn:r2(A.r*0.55),st:q.st}:{semZumbi:true};"),
          js("window.__semZ=true;Z.length=0;")]
# 3 viagem
s += [js("const A=X('ABRIGOS').find(q=>q.id==='saojose');vai(A.x,A.z,A.y+0.05);window.__tm0=G.tm;"), ["gwait", 0.3],
      js("X('abrigoViajar')(X('ABRIGOS').find(q=>q.id==='cais'));"), ["gwait", 0.3],
      ev("viagem", "const C=X('ABRIGOS').find(q=>q.id==='cais');return{dist:r2(Math.hypot(P.x-C.cama.x,P.z-C.cama.z)),minutos:Math.round(G.tm-window.__tm0),cama:G.cama&&G.cama.abrigo,vivo:P.alive};")]
salvar('tools/p256_abrigos.json', s)

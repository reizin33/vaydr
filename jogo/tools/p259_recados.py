"""p259 (v10.8.7): recados do bairro (coleção de 12 bilhetes).
1 os 12 lugares: no chão de verdade (chaoEm igual à altura do papel), sem nada em cima, cada um com o seu texto
2 ler: a tela de documento abre com o texto, a coleção conta; ler de novo não conta duas vezes
3 prêmios: o 4º recado dá kit médico e 2 bandagens
4 O que fazer: a coleção aparece com a região do recado mais perto que falta
5 fachadas da cidade (v10.8.7): grades no térreo e ar-condicionado nas janelas de cima"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__semZ=true;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;n.P.sede=100;n.P.vida=Math.max(n.P.vida,80);if(window.__semZ)n.Z.length=0;};")]
s += [ev("lugares", "const L=X('REC').lista;return{n:L.length,ids:L.map(r=>r.id),malha:!!X('REC').malha,"
         "ruins:L.filter(r=>Math.abs(X('chaoEm')(r.x,r.z,r.y+0.5)-r.y)>0.3||X('bloqueadoAlto')(r.x,r.z,0.12,r.y+0.05)).map(r=>r.id),semTexto:L.filter(r=>!X('REC_TEXTOS')[r.id]).map(r=>r.id),"
         "onde:L.map(r=>r.id+'@'+Math.round(r.x)+','+Math.round(r.y)+','+Math.round(r.z))};")]
# 1o recado: chega perto, lê
s += [js("const r=X('REC').lista[0];window.__r0=r;vai(r.x+0.9,r.z,X('chaoEm')(r.x+0.9,r.z,r.y+1));P.yaw=-Math.PI/2;P.body=P.yaw;window.__k0=X('invCount')('kit');window.__b0=X('invCount')('bandagem');"), ["gwait", 0.6],
      ev("texto", "const a=X('interAtual')(),t=a&&X('INTER_K')[a.k]?X('INTER_K')[a.k].texto(a.o):null;return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("const a=X('interAtual')();if(a&&a.k==='recado')X('INTER_K').recado.usar(a.o);"), ["wait", 0.5],
      ev("lido", "return{modo:G.modo,tit:document.getElementById('doc-tit').textContent,txt:document.getElementById('doc-txt').textContent.slice(0,80),achados:X('recAchados')()};"),
      js("X('fecharDoc')();"), ["gwait", 0.3],
      js("X('recLer')(window.__r0);"), ["wait", 0.3],
      ev("deNovo", "const m=G.modo;X('fecharDoc')();return{modo:m,achados:X('recAchados')()};")]
# mais 3 (o 4º dá o prêmio)
s += [js("const L=X('REC').lista;for(let i=1;i<4;i++){if(!L[i])continue;X('recLer')(L[i]);X('fecharDoc')();}"), ["gwait", 0.8],
      ev("quatro", "return{achados:X('recAchados')(),kit:X('invCount')('kit')-window.__k0,bandagem:X('invCount')('bandagem')-window.__b0,modo:G.modo};"),
      ev("oQueFazer", "X('ativLimpa')();const a=X('ativTodas')().find(q=>q.id==='recados');return a?{nome:a.nome,falta:a.falta,premio:a.premio,feito:a.feito,r:a.r}:{semAtividade:true};")]
s += [ev("fachadas", "const FA=X('FACH');return{malha:!!FA.malha,grades:FA.n,ar:FA.ac,janelas:X('CID').janelas.length};")]
salvar('tools/p259_recados.json', s)

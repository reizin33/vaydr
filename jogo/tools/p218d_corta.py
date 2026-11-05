"""p218d: corta-cadeado (item novo): existe com ícone, descrição e modelo na mão; aparece nas tabelas de saque de oficina, celeiro,
depósito e garagem (e não no começo do jogo); no porto, com ele na mochila, o contêiner trancado mostra "Cortar o cadeado", abre
segurando E, sem barulho, e o corta-cadeado gasta."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;"),
      ev("item", "const I=X('ITEMS').cortaCadeado,L=X('LOOT'),CL=X('CID_LOOT');const tem=(t,id)=>!!(t&&t.some(e=>e[0]===id));"
         "return{existe:!!I,nome:I&&I.nome,mao:!!(I&&I.mao),durMax:I&&I.durMax,icone:!!document.getElementById('i-cortaCadeado'),modelo:!!(X('MESH').arma.cortaCadeado&&X('MESH').arma.cortaCadeado.mod3d),"
         "saque:{oficina:tem(L.oficina,'cortaCadeado'),celeiro:tem(L.celeiro,'cortaCadeado'),cidOficina:tem(CL.oficina,'cortaCadeado'),deposito:tem(CL.deposito,'cortaCadeado'),garagem:tem(CL.garagem,'cortaCadeado'),inicio:tem(L.inicio,'cortaCadeado')},"
         "naMochilaNoComeco:conta('cortaCadeado')};"),
      js("const C=X('CONTS').filter(c=>c.st==='cadeado');const c=C[0];window.__c=c;const p=X('contPorta')(c,0.75);vai(p[0],p[1],c.y);P.yaw=Math.atan2(c.x-P.x,c.z-P.z);P.body=P.yaw;"),
      ["gwait", 0.5],
      ev("sem_corta", "const a=X('interAtual')(),t=a&&X('textoInter')(a);return{alvo:a&&a.k,texto:t&&t.t,sub:t&&t.s,contSt:window.__c.st};"),
      js("X('invAdd')('cortaCadeado',1);"), ["gwait", 0.3],
      ev("com_corta", "const a=X('interAtual')(),t=a&&X('textoInter')(a);return{alvo:a&&a.k,texto:t&&t.t,sub:t&&t.s,segura:!!(t&&t.hold)};"),
      js("window.__ruido=X('NOISE').length;window.__dur=P.inv.find(q=>q&&q.id==='cortaCadeado').dur;const a=X('interAtual')();window.__a=a;n.ev('alvoInter=window.__a');X('usarPress')();"),
      ["gwait", 1.6], js("X('usarSolta')();"), ["gwait", 0.2],
      ev("cortou", "const it=P.inv.find(q=>q&&q.id==='cortaCadeado');return{contSt:window.__c.st,aberto:!!X('portoD')().abertos[window.__c.id],ruidoNovo:X('NOISE').length-window.__ruido,durAntes:window.__dur,durDepois:it&&it.dur};")]
salvar('p218d_corta.json', s, vp=(640, 360))

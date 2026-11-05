"""p190: Etapa 19, ajuda e o ajuste "Baú e bancada: com animação / abrir na hora" (na hora, o baú abre sem esperar a animação)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("ajuda", "const aj=document.querySelector('#t-ajuda [data-e19p]');return{ajuda:aj?aj.textContent.slice(0,70):null,ajuste:!!document.getElementById('aj-animabre')};"),
      js("window.__animAtraso=true;window.__turbo=1;vivo();Z.length=0;"), ["wait", 0.4],
      js("const b=document.querySelector('#aj-animabre [data-v=\"0\"]');b&&b.click();"), ["wait", 0.2],
      ev("naHora", "n.ev(\"G.modo='jogo';tela(null);\");const b=X('criarObra')('bau',P.x+Math.sin(P.body)*1.3,P.z+Math.cos(P.body)*1.3,0);window.__a={k:'guarda',o:b};X('alvoInter=window.__a');X('interagir')(false);"
         "const r={cfg:n.cfg.animAbre,modo:n.G.modo,anim:P.anim?P.anim.tipo:null};X('fecharMochila')();n.cfg.animAbre=1;return r;"),
      ev("comAnim", "const b=X('OB').find(o=>o.tipo==='bau');window.__a={k:'guarda',o:b};X('alvoInter=window.__a');X('interagir')(false);return{modo:n.G.modo,anim:P.anim?P.anim.tipo:null};"),
      ["gwait", 0.45], ev("comAnimDepois", "const r={modo:n.G.modo};n.ev('fecharMochila')();return r;")]
salvar('p190.json', s)

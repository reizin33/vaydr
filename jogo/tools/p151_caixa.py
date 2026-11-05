"""p151: sinalizador → avião → caixa de paraquedas. Mostra se o jogador morre esperando (e de quê) e se a caixa abre e dá os suprimentos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
REG = ("const zz=Z.filter(z=>z.hp>0);const dz=zz.map(z=>Math.hypot(z.x-P.x,z.z-P.z));window.__log=window.__log||[];"
       "window.__log.push({t:r2(G.t),vida:Math.round(P.vida),vivo:P.alive,z:zz.length,perto:dz.length?r2(Math.min(...dz)):null,ev:!!(G.ev&&G.ev.ativo),fome:Math.round(P.fome),sede:Math.round(P.sede)});")
s += [js("vivo();Z.length=0;G.hora=11;G.chuva=0;vai(-55,46);X('invAdd')('sinalizador',1);const i=P.inv.findIndex(q=>q&&q.id==='sinalizador');G.ev=null;X('aereoD')().lancamento=null;X('usarUtil')(i);" + REG)]
for k in range(10):
    s += [["gwait", 4], js(REG)]
s += [["until", "__nnc.G.ev&&__nnc.G.ev.ativo", 200], js(REG), ["gwait", 2], js(REG), ["gwait", 4], js(REG)]
s += [ev("esperando", "return{log:window.__log,ev:G.ev&&{x:r2(G.ev.x),z:r2(G.ev.z),ativo:G.ev.ativo},jogador:[r2(P.x),r2(P.z)],mortes:G.mortes};")]
s += [js("vivo();P.vida=100;Z.length=0;const e=G.ev;vai(e.x+1.2,e.z);mira(e.x,(e.y||P.y)+0.4,e.z);"), ["gwait", 0.4],
      js("const a=X('interAtual')();window.__alvo=a&&a.k;window.__antes=P.inv.filter(Boolean).map(q=>q.id+'x'+q.n).join(',');if(a)n.interagir(true);"), ["wait", 0.4],
      ev("abriu", "const e=G.ev;return{alvo:window.__alvo,feito:!!(e&&e.feito),ativa:!!(e&&e.ativo),vivo:P.alive,antes:window.__antes,depois:P.inv.filter(Boolean).map(q=>q.id+'x'+q.n).join(',')};")]
salvar('p151.json', s)

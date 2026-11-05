"""p204: Etapa 25, catálogo conferido no jogo rodando: cada item tem ícone que existe na página, descrição e entra na mochila."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__semRender=true;vivo();Z.length=0;"),
      ev("itens", "const I=X('ITEMS'),o={};let ok=0,falha=[];for(const id in I){const d=I[id];P.inv.fill(null);let sobra=null;try{sobra=n.invAdd(id,1);}catch(e){sobra='erro';}"
         "const r={icone:!!(d.icon&&document.getElementById(d.icon)),mochila:sobra===0&&conta(id)>=1,desc:typeof d.desc==='string'&&d.desc.length>5};o[id]=r;if(r.icone&&r.mochila&&r.desc)ok++;else falha.push(id);}P.inv.fill(null);"
         "return{n:Object.keys(I).length,ok,falha,itens:o};")]
salvar('p204.json', s, vp=(640, 360))

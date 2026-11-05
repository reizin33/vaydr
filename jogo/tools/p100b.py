import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F="const FE=X('FERRO'),E=FE.est,T=FE.trem,IN=X('IN');"
s=inicio()
s+=[js(F+"vivo();let vx=P.x;window.__pilha=[];Object.defineProperty(P,'x',{configurable:true,get(){return vx;},set(v){if(Math.abs(v-vx)>3&&window.__pilha.length<4)window.__pilha.push([vx,v,new Error().stack.split('\\n').slice(1,7).join(' | ')]);vx=v;}});vai(E.x,E.z+E.d/2+2.5);"),["gwait",0.3],
    ev("pilha",F+"const r=window.__pilha;const v=P.x;delete P.x;P.x=v;return r;")]
salvar('p100b.json',s)

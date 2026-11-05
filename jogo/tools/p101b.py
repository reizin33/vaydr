import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F="const gr=(x,z)=>X('ground')(x,z),PLC=X('PLACES');"
s=inicio("X('FAUNA_POP').ativosMax=0;")
# câmera livre (fora de copa): procura um ponto aberto a 22-30 m de uma árvore grande
s+=foto("416_arvore_grande.png",F+"vivo();G.hora=9.5;const T=X('TREES').filter(t=>t.alive&&!t.agua&&t.s>2.5&&Math.hypot(t.x,t.z)<110);let best=null;for(const t of T){for(let k=0;k<12&&!best;k++){const a=k/12*6.283,x=t.x+Math.cos(a)*24,z=t.z+Math.sin(a)*24;"
   "if(X('TREES').some(q=>q.alive&&Math.hypot(q.x-x,q.z-z)<7)||X('pointBlocked')(x,z,1))continue;best={t,x,z};}if(best)break;}window.__b=best;const b=best;vai(b.x,b.z);"
   "G.camFix={pos:[b.x,gr(b.x,b.z)+1.7,b.z],tgt:[b.t.x,gr(b.t.x,b.t.z)+7,b.t.z]};",0.5)
s+=foto("417_mata_alto.png",F+"G.camFix={pos:[-30,gr(-30,-40)+38,-15],tgt:[-55,gr(-55,-70),-70]};",0.5)
s+=foto("418_clareira.png",F+"vai(6,6);G.camFix={pos:[8,gr(8,8)+3,10],tgt:[-6,gr(-6,-12)+3,-14]};",0.5)
s+=foto("419_personagem_arvore.png",F+"const b=window.__b;vai(b.t.x+4,b.t.z+2);P.yaw=P.body=Math.atan2(b.t.x-P.x,b.t.z-P.z);G.camFix={pos:[b.t.x+12,gr(b.t.x,b.t.z)+2.5,b.t.z+7],tgt:[b.t.x+2,gr(b.t.x,b.t.z)+4,b.t.z+1]};",0.5)
s+=[js("G.camFix=null;")]
salvar('p101b.json',s)

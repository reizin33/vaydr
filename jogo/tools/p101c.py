import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F="const gr=(x,z)=>X('ground')(x,z),PLC=X('PLACES');"
s=inicio("X('FAUNA_POP').ativosMax=0;")
# visão normal de jogo (câmera atrás do personagem)
s+=foto("440_jogo_mata.png",F+"vivo();G.camFix=null;G.hora=9.8;vai(-2,-15);P.yaw=P.body=Math.PI;",1.2)
s+=foto("441_jogo_arvore.png",F+"const T=X('TREES').filter(t=>t.alive&&!t.agua&&t.s>2.6&&Math.hypot(t.x,t.z)>25&&Math.hypot(t.x,t.z)<80);const t=T[0];vai(t.x+5.5,t.z+5.5);P.yaw=P.body=Math.atan2(t.x-P.x,t.z-P.z);",1.2)
s+=foto("442_jogo_vila.png",F+"const V=PLC.find(p=>p.id==='vila');vai(V.x-1,V.z+18);P.yaw=P.body=Math.PI+0.2;",1.2)
s+=foto("443_jogo_sitio.png",F+"const p=PLC.find(p=>p.id==='sitio4');vai(p.x+10,p.z+12);P.yaw=P.body=Math.atan2(p.x-P.x,p.z-P.z);",1.2)
salvar('p101c.json',s)

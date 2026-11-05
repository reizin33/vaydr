"""p127: fotos para comparar o visual (rua da vila e mata) e conferir que os shaders compilam."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += foto("700_vis_vila.png", "vivo();Z.length=0;G.hora=10;const p=X('PLACES').find(q=>q.id==='vila');vai(p.x+2,p.z+16);P.yaw=P.body=Math.PI;n.cfg.cam='3';G.camFix={pos:[p.x+3.5,P.y+2.2,p.z+22],tgt:[p.x,P.y+1.4,p.z],fov:0.95};", 0.5)
s += foto("701_vis_mata.png", "vai(-40,22);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.5)
salvar('p127.json', s)

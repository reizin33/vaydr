"""p142: pinheiros de perto (pineHi) e de longe (pine) depois de trocar os cones empilhados por massas de agulha; refaz a lista de árvores depois de mover o jogador."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += foto("770_mata_longe.png", "G.hora=10;G.chuva=0;Z.length=0;vai(-40,22);X('rebuildVeg')(true);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.6, 4.0)
s += foto("771_pinheiro_perto.png", "G.hora=10;const T=X('TREES').filter(t=>t.kind===0&&t.alive&&!t.agua).sort((a,b)=>Math.hypot(a.x+40,a.z-22)-Math.hypot(b.x+40,b.z-22))[0];vai(T.x+4,T.z+4);X('rebuildVeg')(true);G.camFix={pos:[T.x+7,T.y+2.0,T.z+7],tgt:[T.x,T.y+3.0,T.z],fov:1.0};", 0.6, 4.0)
s += foto("772_mata_horizonte.png", "G.hora=10;vai(0,-10);X('rebuildVeg')(true);G.camFix={pos:[0,P.y+9,-10],tgt:[60,P.y+2,-60],fov:1.0};", 0.6, 4.0)
s += [js("n.cfg.graf='baixo';n.aplicarCfg&&n.aplicarCfg();for(const p of X('CID').predios){p.mPerto=p.mLonge;}")]
s += foto("773_cerco_leste_rua.png", "G.hora=10;Z.length=0;vai(330,8);P.yaw=P.body=Math.PI/2;G.camFix={pos:[327.5,P.y+2.3,10.5],tgt:[336,P.y+0.9,7],fov:1.0};", 0.6, 6.0)
salvar('p142.json', s)

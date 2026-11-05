"""p140: fotos do cerco de quarentena (borda da cidade e corredor da estrada). Para a foto sair no navegador sem GPU, os prédios usam a malha de longe."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("n.cfg.graf='baixo';n.aplicarCfg&&n.aplicarCfg();for(const p of X('CID').predios){p.mPerto=p.mLonge;}")]
s += foto("760_cerco_rua_norte.png", "G.hora=10;G.chuva=0;Z.length=0;vai(255,-77);P.yaw=P.body=Math.PI;G.camFix={pos:[257.5,P.y+2.3,-72.5],tgt:[254.5,P.y+0.9,-84],fov:1.0};", 0.6, 6.0)
s += foto("761_cerco_corredor.png", "G.hora=10;Z.length=0;vai(164,10);G.camFix={pos:[161,P.y+1.9,9],tgt:[171,P.y+1.2,16.5],fov:1.05};", 0.6, 6.0)
s += foto("762_cerco_leste.png", "G.hora=10;Z.length=0;vai(331,30);G.camFix={pos:[329,P.y+1.9,24],tgt:[336,P.y+1.1,33],fov:1.0};", 0.6, 6.0)
salvar('p140.json', s, vp=(960, 540))

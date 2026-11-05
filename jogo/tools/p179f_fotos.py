"""p179f: fotos: alçapão (de cima, fechado e aberto; de baixo, a escada de mão), porão (alçapão no chão, tapete, cômodo lá embaixo)."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p179_porao as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'alcPoe')
s = m.s[:k + 1]
H = m.H + "const olha=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(y-(P.y+1.6),Math.hypot(dx,dz));};"
def e(nome, c): return ev(nome, H + c)
s += [e("poePorao", "n.invAdd('pa',1);const r=mirarChao('porao',1.0,-1.6,-0.9,-1.2);X('colocarObra')();X('modoObra')(false);return{feito:!!por()};")]
s += foto("e16_alcapao_cima_fechado.png", H + "window.__semRender=false;n.cfg.cam='1';const o=alc(),p=plat(),w=W(o,1.3,1.1);vai(w[0],w[1],p.y);olha(o.x,o.y,o.z);", antes=0.6, esp=3.0)
s += foto("e16_alcapao_cima_aberto.png", H + "window.__semRender=false;const o=alc();X('alcTampa')(o,true);", antes=1.2, esp=3.0)
s += foto("e16_alcapao_baixo.png", H + "window.__semRender=false;n.cfg.cam='1';const o=alc(),p=plat(),w=W(o,1.6,0.9);vai(w[0],w[1],g(w[0],w[1]));olha(o.x-0.3,o.y-0.6,o.z);", antes=0.6, esp=3.0)
s += foto("e16_porao_alcapao.png", H + "window.__semRender=false;n.cfg.cam='1';const o=por(),p=plat(),w=W(p,0.9,-0.2);vai(w[0],w[1],g(w[0],w[1]));olha(o.x,o.y,o.z);", antes=0.6, esp=3.0)
s += [e("tapete", "const o=por();o.ext.tapete=true;return 1;")]
s += foto("e16_porao_tapete.png", H + "window.__semRender=false;", antes=0.3, esp=2.5)
s += [e("desce", "const o=por();delete o.ext.tapete;P.energia=100;X('porDescer')(o);return 1;"), ["wait", 1.3],
      e("cava", "const o=por();P.energia=100;return[X('porCavar')(o,'l'),X('porCavar')(o,'s')];")]
s += foto("e16_porao_dentro.png", H + "window.__semRender=false;n.cfg.cam='1';P.lanterna=true;const o=por(),q=X('porBaixo')(o);vai(q[0]-1.4,q[1]-1.4,-30);olha(o.x+4.4,-29,o.z+2);", antes=0.6, esp=3.0)
s += [e("fim", "return{y:r2(P.y),sala:(X('salaSubEm')(P.x,P.y+0.3,P.z)||{}).nome};")]
salvar('p179f.json', s)

"""p180f: fotos da ponte de madeira e do deque."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p180_ponte as m
from vt import *
k1 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'ponteFaz')
k2 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'dequeLugar')
k3 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'dequeFaz')
s = m.s[:k1 + 1] + m.s[k2:k3 + 1]
H = m.H + "const olha=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(y-(P.y+1.6),Math.hypot(dx,dz));};"
s += foto("e16_ponte.png", H + "window.__semRender=false;n.cfg.cam='3';const o=ob('ponteMadeira')[0],e=o.ext,px=e.ax-Math.sin(o.yaw)*5+Math.cos(o.yaw)*3,pz=e.az-Math.cos(o.yaw)*5-Math.sin(o.yaw)*3;vai(px,pz);olha(o.x,o.y,o.z);P.pitch=0.05;", antes=0.6, esp=3.0)
s += foto("e16_deque.png", H + "window.__semRender=false;n.cfg.cam='3';const o=ob('deque')[0],w=X('localW')(o,5,-4);vai(w[0],w[1]);olha(o.x,o.y,o.z);P.pitch=0.05;", antes=0.6, esp=3.0)
salvar('p180f.json', s)

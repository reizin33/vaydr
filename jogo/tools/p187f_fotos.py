"""p187f: fotos da Etapa 18: o guincho puxando o carro para a plataforma (cabo), o carro preso em cima da plataforma engatada na
caminhonete, e o barco em cima do reboque perto do lago."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p187_reboques as m
from vt import *
k1 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'guinchoCarro')
k2 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'carroEmCima')
k3 = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'barcoEmCima')
kb = next(i for i, st in enumerate(m.s) if st[0] == 'js' and "window.__b0" in st[1])
H = m.H + "const olha=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(y-(P.y+1.6),Math.hypot(dx,dz));};"
s = m.s[:k1 + 1]
s += [["gwait", 2.5]]
s += foto("e18_guincho.png", H + "window.__semRender=false;n.cfg.cam='1';const r=rb('plataformaSitio'),w=loc(r,5.5,0,-5.5);vai(w[0],w[2]);olha(r.x,r.y+0.8,r.z-1);", antes=0.3, esp=2.5)
s += [["gwait", 12.0]]
s += foto("e18_plataforma.png", H + "window.__semRender=false;n.cfg.cam='1';const r=rb('plataformaSitio'),w=loc(r,6.5,0,1.5);vai(w[0],w[2]);olha(r.x,r.y+0.9,r.z);r.presa=true;", antes=0.3, esp=2.5)
s += m.s[kb:k3 + 1]
s += foto("e18_barco.png", H + "window.__semRender=false;n.cfg.cam='1';const r=rb('reboqueCais'),w=loc(r,5,0,3);vai(w[0],w[2]);olha(r.x,r.y+0.8,r.z);", antes=0.3, esp=2.5)
salvar('p187f.json', s)

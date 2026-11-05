"""p178g: fotos de fora da casa de 4 m (telhado duas águas, pontudo e plano) com a vista livre de árvores."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p178f_fotos as f
from vt import *
k = next(i for i, st in enumerate(f.s) if st[0] == 'eval' and st[1] == 'monta')
s = f.s[:k + 1]
H = f.H + ("const vista=(d)=>{const p=plat(),T=X('TREES');let best=null,bs=-1;for(let a=0;a<360;a+=10){const r=a*Math.PI/180,cx=p.x+Math.sin(r)*d,cz=p.z+Math.cos(r)*d;let mn=99;"
           "for(const t of T){if(!t.alive)continue;const vx=p.x-cx,vz=p.z-cz,L2=vx*vx+vz*vz,u=Math.max(0,Math.min(1,((t.x-cx)*vx+(t.z-cz)*vz)/L2)),qx=cx+vx*u,qz=cz+vz*u,dd=Math.hypot(t.x-qx,t.z-qz)-1.0*t.s;if(dd<mn)mn=dd;}"
           "if(mn>bs){bs=mn;best=r;}}return[best,bs];};"
           "const poeVista=()=>{const p=plat(),[r]=vista(12);window.__vr=r;const px=p.x+Math.sin(r)*8.5,pz=p.z+Math.cos(r)*8.5;vai(px,pz,g(px,pz));olha(p.x,p.y-0.2,p.z);P.pitch=0.08;};")
def e(nome, c): return ev(nome, H + c)
s += [e("vista", "const v=vista(12);return{ang:Math.round(v[0]*180/Math.PI),folga:Math.round(v[1]*10)/10};")]
s += foto("e16_teto_duas.png", H + "window.__semRender=false;n.cfg.cam='3';poeVista();", antes=0.6, esp=3.0)
s += [e("pontudo", "const t=ob('telhadoCasa')[0];return X('ESTACAO_UI').tetoCasa.acao(t,'e_quatro');")]
s += foto("e16_teto_pontudo.png", H + "window.__semRender=false;n.cfg.cam='3';poeVista();", antes=0.6, esp=3.0)
s += [e("plano", "const t=ob('telhadoCasa')[0];return[X('ESTACAO_UI').tetoCasa.acao(t,'e_plano'),X('ESTACAO_UI').tetoCasa.acao(t,'c_chapa')];")]
s += foto("e16_teto_plano.png", H + "window.__semRender=false;n.cfg.cam='3';poeVista();", antes=0.6, esp=3.0)
salvar('p178g.json', s)

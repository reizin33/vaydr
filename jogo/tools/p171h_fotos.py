"""p171h: a malha com a trama nova (frente e costas, de perto)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const veste=id=>{X('invAdd')(id,1);X('vestir')(P.inv.findIndex(q=>q&&q.id===id));},"
     "frente=(d,h,a)=>{const yw=P.body+(a||0);G.camFix={pos:[P.x+Math.sin(yw)*d,P.y+h,P.z+Math.cos(yw)*d],tgt:[P.x,P.y+0.95,P.z],fov:0.8};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);G.hora=10;G.noite=false;n.cfg.cam='3';"
        "const x=F[0]+6,z=F[2]+22;vai(x,z);P.yaw=0;P.body=0;P.pitch=0;for(const id of['capaceteMalha','peitoralMalha','calcaMalha'])veste(id);"), ["gwait", 0.6]]
s += foto('p171_malha_frente.png', H + "P.body=0;P.yaw=0;frente(2.1,1.4,0.35);", 0.4, 4.0)
s += foto('p171_malha_costas.png', H + "frente(2.1,1.5,Math.PI-0.35);", 0.3, 4.0)
salvar('p171h.json', s)

"""p167: fotos dos visuais novos das Etapas 7 e 8 (quadro de força e alavanca do Armazém Norte, caixa militar contando,
copas do outono, lua em quarto minguante e a crescente no céu)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const S=X('DSF'),dia=(d,h)=>{G.dia=d;if(h!==undefined)G.hora=h;G.clima.dia=d;G.clima.segs=[];G.clima.atual='limpo';G.clima.k=1;};")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;P.vida=100;};"
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;" + LIMPA + "n.cfg.cam='1';")]
# quadro de força com fusível (luz amarela) e a alavanca em cima, olhando para a parede do portão do estoque
s += [j("X('dsfD')().fus=true;dia(2,11);const p=S.p,w=X('pw')(p,S.quadro.u+0.45,S.vQ-2.4);vai(w[0],w[1],S.ya);const c=X('pw')(p,S.quadro.u+0.45,S.vQ);mira(c[0],S.ya+1.15,c[1]);")]
s += foto('p167_quadro_forca.png', "", 0.4, 4.0)
# caixa militar contando (luz piscando) de dia
s += [j("const d=X('CXM_DEF')[0];X('cxmD')()[d.id].st='contando';X('cxmD')()[d.id].resta=90;X('cxmD')()[d.id].onda=4;dia(2,15);vai(d.x+3.2,d.z+1.2,X('chaoEm')(d.x+3.2,d.z+1.2,5));mira(d.x,d.y+0.4,d.z);")]
s += foto('p167_caixa_militar.png', "", 0.4, 4.0)
# copas no outono, de dia, na mata
s += [j("dia(16,10.5);vai(F[0]-30,F[2]+20);P.yaw=2.4;P.body=2.4;P.pitch=0.06;")]
s += foto('p167_outono.png', "", 1.5, 4.0)
# a lua em quarto minguante (dia 5) às 22h30
s += [j("dia(5,22.5);vai(F[0]+2,F[2]+2);const m=X('MOON_DIR');P.yaw=Math.atan2(m[0],m[2]);P.body=P.yaw;P.pitch=Math.asin(m[1])-0.03;")]
s += foto('p167_lua_minguante.png', "", 1.0, 4.0)
# lua crescente (dia 8)
s += [j("dia(8,22.5);")]
s += foto('p167_lua_crescente.png', "", 1.0, 4.0)
salvar('p167.json', s)

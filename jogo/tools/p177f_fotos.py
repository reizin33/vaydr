"""p177f: fotos da Etapa 16 (mover/desmontar): peça mirada com destaque e rótulo, movendo o baú (fantasma), confirmação de desmontar."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p177_mover as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'casa')
s = m.s[:k + 1]
H = m.H
def e(nome, c): return ev(nome, H + c)
# olhar a parede de dentro da casa, em primeira pessoa, no modo de construção
mirarParede = ("window.__semRender=false;n.cfg.cam='1';const w=ob('paredeCasa')[0];vai(C[0]+2.6,C[1]+2.6,g(C[0]+2.6,C[1]+2.6));const dx=w.x-P.x,dz=w.z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=-0.05;"
               "if(!O().ativo)X('modoObra')(true);O().tipo='barricada';X('hudObras')();")
s += foto("e16_mira_parede.png", H + mirarParede, antes=0.4, esp=2.5)
s += [e("mira1", "return{mira:O().mira&&O().mira.tipo,rotulo:alvoTxt(),botoes:[bt('o-mover'),bt('o-desmontar')]};")]
s += foto("e16_desmontar_conf.png", H + "window.__semRender=false;X('desmontarAcao')();", antes=0.3, esp=2.5)
s += [e("conf1", "return{pend:!!O().desm,rotulo:alvoTxt(),botao:bt('o-desmontar')};"), js(H + "O().desm=null;X('modoObra')(false);")]
s += foto("e16_movendo_bau.png", H + "window.__semRender=false;n.cfg.cam='3';const b=ob('bau')[0];vai(b.x-3.4,b.z+0.4,g(b.x-3.4,b.z+0.4));P.yaw=Math.atan2(b.x-P.x,b.z-P.z);P.body=P.yaw;P.pitch=-0.25;"
           "X('modoObra')(true);cam.pos=[P.x,P.y+1.62,P.z];const d=Math.hypot(b.x-P.x,b.z-P.z);cam.fwd=[(b.x-P.x)/d,-0.3,(b.z-P.z)/d];X('obraAlvo')();X('moverAcao')();P.yaw+=0.5;", antes=0.5, esp=2.5)
s += [e("mov1", "return{mov:!!O().mov,linha:document.getElementById('item-nome').textContent,botao:bt('o-mover')};"), js(H + "X('modoObra')(false);")]
salvar('p177f.json', s)

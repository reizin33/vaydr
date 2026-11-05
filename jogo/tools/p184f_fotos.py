"""p184f: fotos da Etapa 17: as peças novas, os fios pendurados entre elas, a noite com as lâmpadas acesas, a tela de fios e o painel."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p184_painel as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'textos')
s = m.s[:k]
H = m.H + "const olha=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(y-(P.y+1.6),Math.hypot(dx,dz));};"
# uma fileira com todas as peças novas, ligadas, na frente do gerador
s += [js(H + "const L=['bateriaBase','interruptor','temporizador','sensor','divisor','luminaria','geladeira','freezer','esteira','bestaAuto','armCartucho','lancaChamas'];window.__fila=[];"
          "L.forEach((t,i)=>{const o=cria(t,-9+i*1.7,-9,'f'+i,Math.PI);window.__fila.push(o);});const gr=cria('gerador',-11.5,-10.5,'fger');gr.ext.comb=1;gr.ext.ligado=true;"
          "const Lg=X('ligarFio');const f=window.__fila;Lg(gr,f[0],true);Lg(f[0],f[1],true);Lg(f[1],f[5],true);Lg(gr,f[4],true);Lg(f[4],f[6],true);Lg(f[4],f[7],true);Lg(f[4],f[9],true);Lg(f[0],f[3],true);Lg(f[3],f[11],true);W();")]
s += foto("e17_pecas.png", H + "window.__semRender=false;n.cfg.cam='1';G.hora=11;vai(C[0]+0.5,C[1]-2.2);olha(C[0]+0.5,g(C[0],C[1]-9)+0.8,C[1]-9);", antes=0.6, esp=3.0)
s += foto("e17_fios_mundo.png", H + "window.__semRender=false;n.cfg.cam='1';G.hora=16;vai(C[0]-13.5,C[1]-5.5);olha(C[0]-6,g(C[0]-6,C[1]-9)+1.0,C[1]-9.5);", antes=0.6, esp=3.0)
s += foto("e17_noite.png", H + "window.__semRender=false;n.cfg.cam='1';G.hora=21.5;vai(C[0]+1,C[1]+8);olha(C[0]+1,g(C[0],C[1])+1.0,C[1]-3);", antes=1.0, esp=3.5)
s += [js(H + "G.hora=11;")]
s += foto("e17_tela_fios.png", H + "window.__semRender=false;G.modo='jogo';vai(C[0]+1,C[1]+4);X('abrirFios')(window.__pe.ger);const T=X('FT');T.sel=window.__pe.ger;X('fiosRender')(true);", antes=0.3, esp=2.0)
s += [js(H + "X('fecharFios')();")]
s += foto("e17_painel.png", H + "window.__semRender=false;G.modo='jogo';X('abrirEnergia')(window.__fila[0]);", antes=0.3, esp=2.0)
s += [js(H + "X('fecharEstacao')();")]
salvar('p184f.json', s)

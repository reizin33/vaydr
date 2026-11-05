"""p197g: fotos de conferência da Etapa 21 depois do ajuste (relevo mais suave, chão molhado liso): a mesma vista da mata no Baixo e no Ultra, a cidade no Alto (paredes, tijolo, relevo), pedras e casca
de perto, a praia com a areia nova, a noite com fogueira e a chuva molhando a rua."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const nivel=g=>{n.cfg.graf=g;n.cfg.grafManual=true;X('aplicarCfg')();X('perfDone=true');X('rebuildGrass')();X('rebuildVeg')(true);},cam1=()=>{n.cfg.cam='1';},hora=h=>{G.hora=h;G.t+=1e-3;};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=11;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};X('perfDone=true');")]
s += foto("e21g_cidade.png", H + "window.__semRender=false;nivel('alto');hora(15.5);cam1();vai(229,-41);P.yaw=0.35;P.pitch=0.05;", antes=0.5, esp=3.0)
s += foto("e21g_noite.png", H + "window.__semRender=false;nivel('alto');hora(22.5);cam1();vai(F[0]-3.5,F[2]+2.5);mira(F[0]+1,F[1]+0.6,F[2]-1);", antes=0.8, esp=3.0)
s += foto("e21g_chuva.png", H + "window.__semRender=false;nivel('alto');hora(13);G.chuva=1;cam1();vai(250,8);P.yaw=Math.PI/2;P.pitch=-0.12;", antes=1.0, esp=3.0)
salvar('p197g.json', s, vp=(960, 540))

"""p232b (Parte 1, teste geral): fotos para conferir a olho os itens visuais 'a confirmar':
fogueira com fumaça, fogo do molotov, explosão, textura da encosta da serra, parede de prédio da cidade e roupa/mochila no corpo
(frente, costas, agachado e correndo). Jogo parado na hora da foto; câmera posta à mão."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
CAM = ("const cf=(p,t)=>{const c=X('cam');c.pos=p.slice();c.tgt=t.slice();const f=[t[0]-p[0],t[1]-p[1],t[2]-p[2]],l=Math.hypot(f[0],f[1],f[2]);c.fwd=f.map(v=>v/l);"
       "const r=[-c.fwd[2],0,c.fwd[0]],lr=Math.hypot(r[0],r[2]);c.right=r.map(v=>v/lr);"
       "c.up=[c.right[1]*c.fwd[2]-c.right[2]*c.fwd[1],c.right[2]*c.fwd[0]-c.right[0]*c.fwd[2],c.right[0]*c.fwd[1]-c.right[1]*c.fwd[0]];};"
       "const fw=[Math.sin(P.yaw),0,Math.cos(P.yaw)],rt=[fw[2],0,-fw[0]];")
def fotoCam(nome, pos, tgt, antes=0.2):
    return [["gwait", antes] if antes else ["wait", 0.01],
            js("G.modo='pausa';window.__turbo=1;window.__semRender=false;" + CAM + "cf(" + pos + "," + tgt + ");"),
            ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;G.modo='jogo';")]
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};X('BICHOS').length=0;")]
# 1 fogueira ao entardecer
s += [js("G.hora=18.6;vai(F[0]+7,F[2]+7);")]
s += fotoCam("p232_fogueira.png", "[F[0]+3.4,F[1]+1.8,F[2]+3.0]", "[F[0],F[1]+0.8,F[2]]", 0.6)
# 2 fogo do molotov
s += [js("G.hora=18.6;const x=F[0]+12,z=F[2]-3;window.__m=[x,n.ground(x,z),z];X('quebrarMolotov')(x,__m[1],z);")]
s += fotoCam("p232_molotov.png", "[__m[0]+4.2,__m[1]+2.0,__m[2]+3.2]", "[__m[0],__m[1]+0.5,__m[2]]", 0.8)
# 3 explosão
s += [js("G.hora=12;const x=F[0]-12,z=F[2]+5;window.__e=[x,n.ground(x,z),z];X('explosao')(x,__e[1],z,4,0);")]
s += fotoCam("p232_explosao.png", "[__e[0]+6,__e[1]+2.5,__e[2]+5]", "[__e[0],__e[1]+1.0,__e[2]]", 0.12)
# 4 encosta da serra (texturas)
s += [js("G.hora=11;vai(-78,-66);")]
s += fotoCam("p232_serra.png", "[-78,n.ground(-78,-66)+5,-66]", "[-100,n.ground(-100,-84)+2,-84]", 0.6)
# 5 parede de prédio da cidade (texturas)
s += [js("G.hora=11;vai(220,8);")]
s += fotoCam("p232_predio.png", "[214,n.ground(214,9)+1.7,9]", "[221,n.ground(220,19)+4,19]", 0.6)
# 6 roupa e mochila no corpo
s += [js("G.hora=11;X('invAdd')('jaquetaReforcada',1);X('invAdd')('mochila',1);for(let i=0;i<P.inv.length;i++){const q=P.inv[i];if(q&&(q.id==='jaquetaReforcada'||q.id==='mochila'))X('vestir')(i);}"
         "vai(F[0]+6,F[2]-6);P.yaw=0.6;P.body=0.6;P.pitch=0;n.cfg.cam='3';"), ["gwait", 0.6]]
s += [ev("vestido", "return{roupa:JSON.parse(JSON.stringify(P.roupa||{}))};")]
s += fotoCam("p232_roupa_frente.png", "[P.x+fw[0]*2.3+rt[0]*0.5,P.y+1.35,P.z+fw[2]*2.3+rt[2]*0.5]", "[P.x,P.y+1.05,P.z]", 0.3)
s += fotoCam("p232_roupa_costas.png", "[P.x-fw[0]*2.2+rt[0]*0.6,P.y+1.45,P.z-fw[2]*2.2+rt[2]*0.6]", "[P.x,P.y+1.1,P.z]", 0.3)
s += [js("P.agachado=true;"), ["gwait", 0.6]]
s += fotoCam("p232_roupa_agachado.png", "[P.x+rt[0]*2.2+fw[0]*0.6,P.y+1.0,P.z+rt[2]*2.2+fw[2]*0.6]", "[P.x,P.y+0.7,P.z]", 0.2)
s += [js("P.agachado=false;"), ["gwait", 0.3], ["down", "w"], ["down", "Shift"], ["gwait", 0.7]]
s += fotoCam("p232_roupa_correndo.png", "[P.x+rt[0]*2.4+fw[0]*1.0,P.y+1.2,P.z+rt[2]*2.4+fw[2]*1.0]", "[P.x,P.y+0.95,P.z]", 0)
s += [["up", "Shift"], ["up", "w"]]
salvar('tools/p232b_fotos.json', s, vp=(960, 540))

"""p217b: fotos de perto da ferramenta na mão do personagem (3ª pessoa, câmera de frente e de lado, jogo parado), para conferir
o encaixe de cada modelo novo na mão: pistola, machado de incêndio, picareta, pá (e corta-cadeado quando o item existir)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
CAM = ("const cf=(p,t)=>{const c=X('cam');c.pos=p.slice();c.tgt=t.slice();const f=[t[0]-p[0],t[1]-p[1],t[2]-p[2]],l=Math.hypot(f[0],f[1],f[2]);c.fwd=f.map(v=>v/l);"
       "const r=[-c.fwd[2],0,c.fwd[0]],lr=Math.hypot(r[0],r[2]);c.right=r.map(v=>v/lr);"
       "c.up=[c.right[1]*c.fwd[2]-c.right[2]*c.fwd[1],c.right[2]*c.fwd[0]-c.right[0]*c.fwd[2],c.right[0]*c.fwd[1]-c.right[1]*c.fwd[0]];};"
       "const mao=X('xf')(P.ch.m.subarray(11*16,12*16),0,0,0.2),fw=[Math.sin(P.yaw),0,Math.cos(P.yaw)],rt=[fw[2],0,-fw[0]];")
def foto_mao(nome, lado):
    # lado: deslocamento para a direita do personagem (+) ou esquerda (-), e quanto à frente
    dx, fr = lado
    return [js("n.cfg.cam='3';"), ["gwait", 0.4],
            js("G.modo='pausa';window.__turbo=1;window.__semRender=false;" + CAM +
               "cf([mao[0]+fw[0]*" + str(fr) + "+rt[0]*" + str(dx) + ",mao[1]+0.25,mao[2]+fw[2]*" + str(fr) + "+rt[2]*" + str(dx) + "],[mao[0],mao[1]+0.05,mao[2]]);"),
            ["wait", 3.0], ["shot", nome],
            js("window.__semRender=true;window.__turbo=6;G.modo='jogo';")]
IDS = sys.argv[1:] or ['pistola', 'machado', 'picareta', 'pa']
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;"
         "for(const id of " + str(IDS) + ")X('invAdd')(id,1);"), ["gwait", 0.5],
      ["until", "(()=>{const T=__nnc.ev('MOD3D_TEX');return Object.values(T).length>=4&&Object.values(T).every(t=>t.pronta);})()", 30]]
for id in IDS:
    s += [js("sel('" + id + "');P.yaw=0.6;P.body=0.6;P.pitch=0;"), ["gwait", 0.6]]
    s += foto_mao("e26_" + id + "_mao_frente.png", (0.45, 1.1))
    s += foto_mao("e26_" + id + "_mao_lado.png", (1.0, 0.25))
salvar('p217b_fotos3p.json', s, vp=(800, 600))

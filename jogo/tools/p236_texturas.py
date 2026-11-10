"""p236 (prova de estilo, 10/11): texturas realistas no chão e na madeira, antes e depois do mesmo lugar e do mesmo ângulo.
1 carregou: as duas texturas em camadas prontas, sem erro de imagem nem de WebGL
2 fotos com as texturas desligadas (antes) e ligadas (depois): clareira, mata, encosta com rocha, parede de tábuas
3 tempo de desenho com e sem as texturas, nos mesmos lugares (mesma qualidade 'alto')"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=10.5;window.__cadaPasso=()=>{__nnc.G.hora=10.5;__nnc.Z.length=0;};"), ["until", "__nnc.ev('TEXR').pronta||!!__nnc.ev('TEXR').erro", 60]]
s += [ev("carregou", "const T=X('TEXR'),gl=X('gl');return{pronta:T.pronta,erro:T.erro,ligada:X('texRealLigada')(),camadas:X('TEXREAL_DADOS').map(d=>d.id),erroGL:gl.getError()};")]
# lugares: clareira (grama), mata (chão de mata e folhas), encosta mais íngreme perto da serra (rocha), parede de tábuas montada na clareira
LUG = ("const F0=F;window.__L={clareira:[F0[0]+9,F0[2]-11,2.6],mata:[-112,8,-1.57]};"
       "{const S=X('SERRA');let best=null;for(let i=0;i<400;i++){const a=i*2.399,r=4+Math.sqrt(i)*2.2,x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r;"
       "const g=n.ground,d=Math.hypot(g(x+1,z)-g(x-1,z),g(x,z+1)-g(x,z-1))/2;if(!best||d>best[2])best=[x,z,d];}"
       "const b=best,dx=X('ground')(b[0]+1,b[1])-X('ground')(b[0]-1,b[1]),dz=X('ground')(b[0],b[1]+1)-X('ground')(b[0],b[1]-1),l=Math.hypot(dx,dz)||1;"
       "window.__L.encosta=[b[0]-dx/l*7,b[1]-dz/l*7,Math.atan2(dx/l,dz/l),r2(b[2])];}"
       "{const x=F0[0]+14,z=F0[2]+6;for(let k=0;k<3;k++)X('criarObra')('paredeCasa',x+k*2.4,z,0);window.__L.parede=[x+2.4,z-4.5,0];}")
s += [js(LUG), ["gwait", 0.4], ev("lugares", "return window.__L;")]
def vai_ver(nome):
    return (f"const q=window.__L['{nome}'];vai(q[0],q[1]);P.yaw=q[2];P.body=q[2];P.pitch={'-0.16' if nome=='encosta' else '-0.08'};G.hora=10.5;"
            "X('rebuildVeg')(true);X('rebuildGrass')&&X('rebuildGrass')();")
for nome in ("clareira", "mata", "encosta", "parede"):
    s += foto(f"t_{nome}_antes.png", "n.cfg.texReal=false;" + vai_ver(nome), 0.6, 3.5)
    s += foto(f"t_{nome}_depois.png", "n.cfg.texReal=true;" + vai_ver(nome), 0.3, 3.5)
# tempo de desenho (ms por quadro, como no p233c): sem e com textura em cada lugar
MED = ("const gl=X('gl'),px=X('PX_SYNC'),rd=X('render'),uc=X('updateCamera'),r={};for(const tx of[false,true]){n.cfg.texReal=tx;for(let i=0;i<20;i++)uc(0.05);rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);"
       "const t0=performance.now();for(let i=0;i<4;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}r[tx?'com':'sem']=r2((performance.now()-t0)/4);}r.erroGL=gl.getError();return r;")
for nome in ("clareira", "mata", "encosta"):
    s += [js(vai_ver(nome)), ["gwait", 0.4], ev("tempo_" + nome, MED)]
s += [js("n.cfg.texReal=true;")]
salvar('tools/p236_texturas.json', s, vp=(960, 540))

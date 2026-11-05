"""p222c: fotos de conferência depois dos ajustes (agulhas com miolo mais escuro e sumindo perto da câmera; baú de frente):
capim de perto em 1ª pessoa (novo e antigo, mesmo lugar), mata de pinheiros em 3ª pessoa (Alto), a mata vista de uma clareira
(pinheiro novo perto e o de antes mais longe) e o baú construído visto de frente."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
GR = "const gr=(x,z)=>X('ground')(x,z),va=(x,z)=>vai(x,z,gr(x,z));"
ACHA = ("const dm=X('dentroMapa'),dc=X('dentroCidade'),pb=X('pointBlocked');"
        "const melhor=(L,ok)=>{const c=new Map();for(const g of L){if(!ok(g))continue;const k=Math.floor(g.x/12)+','+Math.floor(g.z/12);c.set(k,(c.get(k)||0)+1);}"
        "let b=null,bn=0;for(const[k,v]of c){const[i,j]=k.split(',').map(Number),x=i*12+6,z=j*12+6;if(v>bn&&dm(x,z,-3)&&!dc(x,z,8)&&!pb(x,z,0.6)){bn=v;b=[x,z];}}return b;};"
        "window.__campo=melhor(X('GRASS'),g=>!g.anel&&!g.alto);window.__mata=melhor(X('TREES'),t=>t.kind===0&&t.alive&&!t.agua&&!t.alto);")
s += [js("vivo();Z.length=0;G.hora=13;" + GR + ACHA + "va(window.__campo[0],window.__campo[1]);"), ["gwait", 1.0]]
# capim de perto: o mesmo enquadramento com o capim novo e com o antigo
CAP = GR + "va(window.__campo[0]+3,window.__campo[1]-2);X('rebuildVeg')(true);X('rebuildGrass')();n.cfg.cam='1';P.yaw=-0.9;P.body=P.yaw;P.pitch=-0.3;G.hora=13;"
s += foto("e27_capim_perto_novo.png", CAP + "X('GRAMA').ok=true;")
s += foto("e27_capim_perto_antigo.png", CAP + "X('GRAMA').ok=false;")
s += [js("X('GRAMA').ok=true;")]
# mata em 3ª pessoa (agulhas somem perto da câmera)
s += foto("e27_mata_nova2.png", GR + "va(window.__mata[0],window.__mata[1]);X('rebuildVeg')(true);X('rebuildGrass')();n.cfg.cam='3';P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;G.hora=13;")
# a mata vista de uma clareira: procura um ponto sem árvore a menos de 7 m, com pinheiros entre 8 e 40 m
CLAR = (GR + "const T=X('TREES').filter(t=>t.alive&&!t.agua);let best=null,bs=-1;for(let a=0;a<160;a++){const r=20+a*0.6,ang=a*2.4,x=window.__mata[0]+Math.cos(ang)*r,z=window.__mata[1]+Math.sin(ang)*r;"
        "if(!X('dentroMapa')(x,z,-3)||X('pointBlocked')(x,z,1.5))continue;let perto=0,pin=0;for(const t of T){const d=Math.hypot(t.x-x,t.z-z);if(d<7)perto++;if(t.kind===0&&d>8&&d<40)pin++;}"
        "if(perto===0&&pin>bs){bs=pin;best=[x,z];}}window.__clar=best;va(best[0],best[1]);X('rebuildVeg')(true);X('rebuildGrass')();"
        "P.yaw=Math.atan2(window.__mata[0]-best[0],window.__mata[1]-best[1]);P.body=P.yaw;P.pitch=0.02;n.cfg.cam='3';G.hora=13;")
s += foto("e27_mata_clareira.png", CLAR)
# baú construído, visto de frente (um pouco de lado do jogador para ele não tampar)
s += [js(GR + "va(window.__campo[0],window.__campo[1]);P.yaw=0.4;P.body=P.yaw;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);"
         "window.__bau=X('criarObra')('bau',P.x+fx*2.4,P.z+fz*2.4,P.yaw);X('rebuildVeg')(true);X('rebuildGrass')();")]
s += foto("e27_bau_frente.png", "n.cfg.cam='1';P.yaw=0.4;P.body=P.yaw;P.pitch=-0.42;G.hora=13;")
s += [ev("fim", "return{erroGL:X('gl').getError(),campo:window.__campo,mata:window.__mata,clareira:window.__clar,bau:!!window.__bau,pinheiro:X('pinhoPronto')(),capim:X('gramaPronta')()};")]
salvar('tools/p222c_fotos.json', s, vp=(960, 540))

"""p241 (12/11): caverna transparente ao entrar e machado que some no golpe em primeira pessoa (relatos do Himalaia).
Uso: python3 tools/p241_caverna_machado.py NOME   (fotos shots/NOME_cav_*.png e NOME_golpe_*.png)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
q = sys.argv[1] if len(sys.argv) > 1 else 'x'
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [["gwait", 0.5]]
# ---- machado em primeira pessoa: o golpe congelado em vários momentos (s = fração do golpe; acerta em 0.55)
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=11;n.invAdd('machado',1);sel('machado');const x=F[0]+5,z=F[2]+5;vai(x,z,n.ground(x,z));n.cfg.cam='1';P.yaw=0.4;P.pitch=-0.05;"), ["gwait", 0.4]]
for fr in [0.0, 0.25, 0.4, 0.5, 0.55, 0.62, 0.75, 0.9]:
    s += foto(q + "_golpe_%02d.png" % int(fr * 100),
              "n.cfg.cam='1';P.yaw=0.4;P.pitch=-0.05;const d=X('ITEMS').machado;P.acao={tipo:'golpe',t:%f*d.tempo*0.85,dur:d.tempo*0.85,vertical:true,hit:true,arma:P.inv[P.sel],mira:null};P.amp=0;" % fr, 0, 1.5)
s += [js("P.acao=null;")]
# ---- caverna: a boca por fora, depois lá dentro (terceira e primeira pessoa, com e sem lanterna)
s += [ev("entrada", "const e=X('SUB').entradas.find(e=>e.id==='caverna');window.__CAV=e;return{sup:e.sup,sub:e.sub};")]
s += [js("const e=window.__CAV;const a=e.sup[2]+Math.PI,x=e.sup[0]+Math.sin(a)*6,z=e.sup[1]+Math.cos(a)*6;vai(x,z,n.ground(x,z));P.yaw=Math.atan2(e.sup[0]-x,e.sup[1]-z);P.body=P.yaw;P.pitch=-0.05;n.cfg.cam='3';"), ["gwait", 0.4]]
s += foto(q + "_cav_boca.png", "n.cfg.cam='3';", 0.2, 3.0)
s += [js("X('subDescer')(window.__CAV);"), ["wait", 1.5], ["gwait", 0.5]]
s += [ev("dentro", "return{x:r2(P.x),y:r2(P.y),z:r2(P.z),yaw:r2(P.yaw),sub:X('noSubsolo')(),camDist:r2(X('camDist')),cam:X('cam').pos.map(r2)};")]
s += foto(q + "_cav_3p.png", "n.cfg.cam='3';P.lanterna=false;P.pitch=-0.08;", 0.3, 3.0)
s += foto(q + "_cav_3p_lant.png", "n.cfg.cam='3';P.lanterna=true;P.pitch=-0.08;", 0.3, 3.0)
s += [ev("cam3", "return{cam:X('cam').pos.map(r2),camDist:r2(X('camDist')),P:[r2(P.x),r2(P.y),r2(P.z)]};")]
s += foto(q + "_cav_3p_volta.png", "n.cfg.cam='3';P.lanterna=true;P.yaw+=Math.PI;P.body=P.yaw;P.pitch=-0.08;", 0.3, 3.0)
s += foto(q + "_cav_1p.png", "n.cfg.cam='1';P.lanterna=true;P.pitch=0.0;", 0.3, 3.0)
s += foto(q + "_cav_1p_cima.png", "n.cfg.cam='1';P.lanterna=true;P.pitch=0.6;", 0.3, 3.0)
salvar('tools/p241_' + q + '.json', s, vp=(1280, 720))

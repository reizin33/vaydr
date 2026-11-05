"""p213d: depuração do p60 — da rua para a calçada da cidade: o jogador anda mais tempo (2, 4 e 6 s) e mostra onde parou e a
altura (a calçada fica 0,15 m acima da rua). Confere se o meio-fio ainda deixa subir (o p60 andava só 2 s)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = [["wait", 3], ["click", "#m-novo"], js("try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}"), ["wait", 2],
     js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.3]]
for seg in (2, 4, 6):
    s += [js("G.hora=10;Z.length=0;P.x=200;P.z=8;P.y=0;P.vy=0;P.vx=P.vz=0;P.yaw=Math.PI;P.body=Math.PI;"), ["gwait", 0.3],
          ["down", "w"], ["gwait", float(seg)], ["up", "w"], ["gwait", 0.3],
          ev("andou%ds" % seg, "return{x:+P.x.toFixed(1),z:+P.z.toFixed(1),y:+P.y.toFixed(3),sup:(()=>{const s=X('supEm')(P.x,P.z,P.y,0.3);return s?(s.t||'')+' '+(s.dono&&s.dono.tipo||''):null;})()};")]
s += [ev("velocidade", "return{descalco:!P.roupa.pes};")]
salvar('p213d.json', s, vp=(640, 360))

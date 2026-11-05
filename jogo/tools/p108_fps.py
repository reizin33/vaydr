"""p108: custo de desenho por lugar (chamadas e vértices por quadro): clareira, mata, vila, dentro de casa, sítio e cidade."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
HOOK=("if(!window.__glc){const gl=document.querySelector('canvas').getContext('webgl2');window.__glc={c:0,v:0};const a=gl.drawArrays.bind(gl),b=gl.drawArraysInstanced.bind(gl);"
      "gl.drawArrays=(m,f,n)=>{window.__glc.c++;window.__glc.v+=n;return a(m,f,n);};gl.drawArraysInstanced=(m,f,n,k)=>{window.__glc.c++;window.__glc.v+=n*k;return b(m,f,n,k);};"
      "const raf=window.requestAnimationFrame.bind(window);window.__glc.q=0;window.requestAnimationFrame=cb=>raf(t=>{window.__glc.q++;cb(t);});}")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js(HOOK)]
def lugar(nome, code):
    return [js(code+"G.hora=10;Z.length=0;window.__turbo=1;window.__semRender=false;"), ["wait", 3.5], js("window.__glc.c=0;window.__glc.v=0;window.__glc.q=0;"), ["wait", 9],
            ev(nome, "const g=window.__glc,q=Math.max(1,g.q);return{quadros:g.q,chamadasPorQuadro:Math.round(g.c/q),milVertPorQuadro:Math.round(g.v/q/1000)};"), js("window.__semRender=true;window.__turbo=6;")]
s += lugar("clareira", "vai(2,6);P.yaw=3.1;P.body=3.1;")
s += lugar("mata", "vai(-60,10);P.yaw=1.5;P.body=1.5;")
s += lugar("vila", "vai(61.5,-64);P.yaw=3.14;P.body=3.14;")
s += lugar("vila_dentro", "const p=X('RURAIS')[0],sl=p.salas[0][0],w=X('pw')(p,(sl.u0+sl.u1)/2,(sl.v0+sl.v1)/2);vai(w[0],w[1],sl.y);")
s += lugar("sitio", "const pl=X('placeById')('sitio1');vai(pl.x+14,pl.z+3);P.yaw=-1.6;P.body=-1.6;")
s += lugar("cidade", "vai(240,8);P.yaw=1.6;P.body=1.6;")
salvar('p108.json', s)

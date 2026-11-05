"""p234 (problema 'o jogo fecha sozinho', 05/11): sessão longa medindo o que o jogo acumula com o tempo.
Em cada parada: memória do JavaScript, objetos da placa de vídeo criados e apagados (buffers, texturas, VAOs, framebuffers),
elementos da página, canvas, sons tocando, zumbis, bichos e partículas. Se algo só cresce, é vazamento."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=34;")
s += [js("vivo();window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;};"
         "const gl=X('gl'),C=window.__glc={};for(const f of['createBuffer','deleteBuffer','createTexture','deleteTexture','createVertexArray','deleteVertexArray','createFramebuffer','deleteFramebuffer','createRenderbuffer','createProgram','createShader']){const o=gl[f].bind(gl);C[f]=0;gl[f]=function(){C[f]++;return o.apply(null,arguments);};}"
         "window.__aud=0;try{const AC=window.AudioContext||window.webkitAudioContext,pr=AC.prototype;for(const f of['createBuffer','createBufferSource','createOscillator','createGain','createBiquadFilter','createPanner','createStereoPanner']){if(!pr[f])continue;const o=pr[f];pr[f]=function(){window.__aud++;return o.apply(this,arguments);};}}catch(e){}"
         "for(const[k,q]of[['pistola',1],['municao',60],['molotov',4],['bandagem',10],['tabuas',30],['pregos',20]])X('invAdd')(k,q);")]
MED = ("const m=performance.memory||{};let ls=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls+=(localStorage.getItem(k)||'').length;}}catch(e){}"
       "return{heapMB:+((m.usedJSHeapSize||0)/1048576).toFixed(1),totalMB:+((m.totalJSHeapSize||0)/1048576).toFixed(1),gl:Object.assign({},window.__glc),audioNos:window.__aud,"
       "dom:document.getElementsByTagName('*').length,canvas:document.querySelectorAll('canvas').length,lsKB:Math.round(ls/1024),"
       "zumbis:Z.filter(z=>z.vivo).length,zTotal:Z.length,bichos:X('BICHOS').length,part:X('PART').length,obras:X('OB').length,reg:(X('regiaoEm')(P.x,P.z)||{}).id,tJogo:Math.round(G.t),erroGL:X('gl').getError()};")
s += [ev("inicio", MED)]
for k in range(16):
    noite = k % 3 == 2
    s += [js("const R=X('REGIOES'),r=R[" + str(k) + "%R.length];vai(r.x+6,r.z+6);P.yaw=" + str(0.7 * k) + ";G.hora=" + ("22.5" if noite else "10") + ";"
             + ("for(let i=0;i<4;i++){const a=i*1.6;ZZ(i%2?'runner':'walker',P.x+Math.cos(a)*14,P.z+Math.sin(a)*14);}" if noite else "")
             + ("try{X('abrirMapa')();X('fecharMapa')();}catch(e){}" if k % 4 == 1 else "")
             + ("try{X('salvarJogo')();}catch(e){}" if k % 4 == 3 else "")),
          ["gwait", 45]]
    s += [ev("parada" + str(k), MED)]
s += [js("G.hora=10;vai(F[0]+5,F[2]+5);"), ["gwait", 60], ev("fim", MED)]
salvar('tools/p234_memoria.json', s, vp=(800, 450))

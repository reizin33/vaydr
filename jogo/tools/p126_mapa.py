"""p126: tecla M abre o mapa grande (jogo para), M fecha; Esc também fecha sem abrir a pausa; tocar no minimapa abre;
sensibilidade: teclas - e = mudam e guardam; em primeira pessoa dá para olhar mais para baixo e para cima."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [js("vivo();Z.length=0;G.hora=11;"), ["press","m"], ["wait",0.5],
      ev("abriu", "const c=document.getElementById('mapa-g'),g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let s=0,k=0;for(let i=0;i<d.length;i+=97*4){s+=d[i]+d[i+1]+d[i+2];k++;}return{modo:G.modo,tela:!document.getElementById('t-mapa').hidden,larg:c.width,brilho:Math.round(s/k)};"),
      js("window.__semRender=false;window.__turbo=1;"), ["wait",2], ["shot","695_mapa.png"], js("window.__semRender=true;window.__turbo=6;"),
      ["press","m"], ["wait",0.3], ev("fechouM", "return{modo:G.modo,tela:!document.getElementById('t-mapa').hidden};"),
      ["press","m"], ["wait",0.3], ["press","Escape"], ["wait",0.3], ev("fechouEsc", "return{modo:G.modo,pausa:!document.getElementById('t-pausa').hidden};"),
      js("document.getElementById('minimapa').click();"), ["wait",0.3], ev("minimapa", "return{modo:G.modo};"), ["press","Escape"], ["wait",0.3],
      js("n.cfg.sens=1;"), ["press","Equal"], ["press","Equal"], ["press","Minus"],
      ev("sens", "n.cfg.cam='1';P.pitch=0;X('olhar')(0,5000,0.0016);const baixo=P.pitch;X('olhar')(0,-9000,0.0016);return{sens:n.cfg.sens,pitchMin:r2(baixo),pitchMax:r2(P.pitch),modo:G.modo};")]
salvar('p126.json', s)

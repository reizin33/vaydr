import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
PAD = ("window.__pad={connected:true,id:'teste',buttons:[...Array(17)].map(()=>({pressed:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad];n.ev('GP.ativo=true');"
       "window.__bt=(i,v)=>{window.__pad.buttons[i].pressed=!!v;window.__pad.buttons[i].value=v?1:0;};")
def bt(i, segura=0.15, depois=0.25):
    return [js("window.__bt(%d,1);" % i), ["wait", segura], js("window.__bt(%d,0);" % i), ["wait", depois]]
EST="return{modo:G.modo,pausa:!document.getElementById('t-pausa').hidden,foco:document.activeElement&&document.activeElement.id,ativo:n.ev('GP.ativo'),semRender:window.__semRender,ant9:n.ev('GP.ant[9]')};"
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;n.pausar();document.getElementById('p-ajustes').click();"), ["wait",0.3], js("G.modo='jogo';"), js("document.getElementById('aj-ok').click();n.ev(\"G.modo='jogo';tela(null);\");" + PAD), ["gwait", 0.3], ev("a0", EST)]
s += bt(9) + [ev("a1", EST)] + bt(13) + [ev("a2", EST)] + bt(13) + [ev("a3", EST)]
s += [js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 1.0], ev("a4", EST)]
salvar('d170.json', s)

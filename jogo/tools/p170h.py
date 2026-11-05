import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
PAD = ("window.__pad={connected:true,id:'teste',buttons:[...Array(17)].map(()=>({pressed:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad];n.ev('GP.ativo=true');"
       "window.__bt=(i,v)=>{window.__pad.buttons[i].pressed=!!v;window.__pad.buttons[i].value=v?1:0;};")
def bt(i, segura=0.15, depois=0.25):
    return [js("window.__bt(%d,1);" % i), ["wait", segura], js("window.__bt(%d,0);" % i), ["wait", depois]]
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;G.hora=15;vai(F[0]+5,F[2]+7);P.yaw=2.6;P.body=P.yaw;" + PAD), ["gwait", 0.3]]
s += bt(9) + bt(13) + bt(13) + [ev("antes", "return{modo:G.modo,pausa:!document.getElementById('t-pausa').hidden,foco:document.activeElement&&document.activeElement.id};")]
s += foto('p170_pausa_controle.png', "", 0.1, 2.0)
s += [ev("depois", "return{modo:G.modo,pausa:!document.getElementById('t-pausa').hidden,foco:document.activeElement&&document.activeElement.id};")]
salvar('p170h.json', s)

import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
PAD = ("const B=i=>({pressed:i===4,value:i===4?1:0});window.__pad={id:'Controle de teste',index:0,connected:true,mapping:'standard',axes:[0,0,0.9,0],buttons:Array.from({length:17},(_,i)=>B(i)),timestamp:1};"
       "navigator.getGamepads=()=>[window.__pad];X('GP').ativo=true;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};window.__y0=P.yaw;"), ["wait", 1.6], ["gwait", 2.0],
      js("window.__y1=P.yaw;n.cfg.usarControle=false;" + PAD + "window.__a=P.assobioT||-9;"), ["wait", 1.6], ["gwait", 2.0],
      js("window.__y2=P.yaw;window.__a2=P.assobioT||-9;n.cfg.usarControle=true;"), ["wait", 1.6], ["gwait", 2.0],
      js("window.__y3=P.yaw;window.__a3=P.assobioT||-9;"),
      ev("r", "return{semControle:r2(window.__y1-window.__y0),controleDesligado:r2(window.__y2-window.__y1),desligadoAssobiou:window.__a2!==window.__a,controleLigado:r2(window.__y3-window.__y2),ligadoAssobiou:window.__a3!==window.__a2};")]
salvar('tools/p225b.json', s, vp=(640, 360))

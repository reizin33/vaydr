import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
TECLA = "const tecla=(t,c)=>{const e=new KeyboardEvent(t,{code:c,key:c==='Space'?' ':c,bubbles:true,cancelable:true});window.dispatchEvent(e);};"
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};const v=X('VEICS').find(q=>q.tipo==='heli');Object.assign(v.pecas,{motor:100,bateria:true,rotor:2});v.comb=80;v.hp=100;"
         "vai(v.x+3,v.z+3);window.__h=v;window.__log=[];window.__p0=[v.x,v.z,v.y];X('entrarVeic')(v);window.__p1=[v.x,v.z,v.y];" + TECLA + "tecla('keydown','Space');")]
for i in range(6):
    s += [["gwait", 1.0], js("const v=window.__h,IN=X('IN');window.__log.push([r2(X('__nnc')?0:0),r2(v.x),r2(v.z),r2(v.alt),r2(v.v),r2(v.rotor),IN.mz,IN.mx,r2(v.yaw)]);")]
s += [ev("r", "return{antesDeEntrar:window.__p0.map(r2),depoisDeEntrar:window.__p1.map(r2),log:window.__log};")]
salvar('tools/p224b.json', s, vp=(640, 360))

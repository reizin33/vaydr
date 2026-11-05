import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [ev("vias", "const d=X('CXM_DEF')[0];const L=X('VIAS').map(v=>({tipo:v.tipo,dono:v.dono&&v.dono.tipo||typeof v.dono,base:v.base&&[Math.round(v.base.x*10)/10,Math.round(v.base.z*10)/10],topo:v.topo&&[Math.round(v.topo.x*10)/10,Math.round(v.topo.z*10)/10],keys:Object.keys(v).slice(0,14).join(',')})).filter(v=>(v.base&&Math.hypot(v.base[0]-d.x,v.base[1]-d.z)<8)||(v.topo&&Math.hypot(v.topo[0]-d.x,v.topo[1]-d.z)<8));"
       "return{d:[d.x,d.z],n:X('VIAS').length,perto:L,exemplo:Object.keys(X('VIAS')[0]||{}).join(',')};")]
salvar('p164d.json', s)

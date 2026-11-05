import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("q", "const L=X('CID').props.filter(o=>Math.hypot(o.x-331,o.z-9)<7).map(o=>({k:o.k,x:r2(o.x),z:r2(o.z),yaw:r2(o.yaw||0),cor:o.cor,nivel:o.nivel}));"
  "const pr=X('CID').predios.filter(p=>p.x0<338&&p.x1>324&&p.z0<16&&p.z1>2).map(p=>({nome:p.nome,tipo:p.tipo,x0:p.x0,x1:p.x1,z0:p.z0,z1:p.z1}));"
  "const col=X('COLL').filter(c=>Math.hypot(c.x-330.5,c.z-9.5)<3).map(c=>({x:r2(c.x),z:r2(c.z),hw:c.hw,hd:c.hd,r:c.r,y0:c.y0,y1:c.y1,k:Object.keys(c).join(',')}));return{L,pr,col};")]
salvar('p143.json', s)

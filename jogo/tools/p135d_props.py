"""p135d: objetos de rua da cidade (CID.props) cujo tipo não tem desenho em geoCidadeProps (colisor sem nada desenhado)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("props", "const L=X('CID').props,src=X('geoCidadeProps').toString(),kinds={};for(const o of L)kinds[o.k]=(kinds[o.k]||0)+1;"
         "const tratados=Object.keys(kinds).filter(k=>src.includes(\"'\"+k+\"'\"));const sem=Object.keys(kinds).filter(k=>!tratados.includes(k));"
         "const ex=L.filter(o=>sem.includes(o.k)).slice(0,30).map(o=>({k:o.k,x:r2(o.x),z:r2(o.z),yaw:r2(o.yaw||0),w:o.w,d:o.d,h:o.h}));"
         "return{total:L.length,kinds,semDesenho:sem,ex};")]
salvar('p135d.json', s)

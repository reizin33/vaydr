import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("folhas", "let cid=0,rur=0,pc=0,pr=0,maxp=0;for(const p of X('CID').predios){let f=0;for(const h of (p.heras||[]))f+=Math.round(10+h.w*h.h*9);if(p.rural){rur+=f;pr++;}else{cid+=f;pc++;}if(f>maxp)maxp=f;}return{cid,rur,pc,pr,maxp,trisCid:cid*12,trisRur:rur*12};")]
salvar('p150.json', s)

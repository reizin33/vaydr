import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [ev("lugares", "const gr=X('ground'),bl=X('bloqueadoChao'),out=[];for(let k=0;k<600;k++){const a=k*0.47,r=12+k*0.1,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r),g=gr(x,z);if(!X('dentroMapa')(x,z,20))continue;let nb=0,dy=0;"
         "for(let i=-7;i<=7;i+=1.75)for(let q=-7;q<=7;q+=1.75){const y=gr(x+i,z+q);dy=Math.max(dy,Math.abs(y-g));const c=bl(x+i,z+q,0.4,y);if(c)nb++;}const ag=X('aguaPerto')(x,z,9);out.push([nb,r2(dy),x,z,r2(r),ag?1:0]);}"
         "out.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);return{F:[r2(F[0]),r2(F[2])],melhores:out.slice(0,12),barr:X('BARRICADE_ARC')};")]
salvar('d169.json', s)

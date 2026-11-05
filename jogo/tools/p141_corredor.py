"""p141: borda do corredor da estrada (fora do círculo da mata, até a cidade) e borda do círculo: trechos sem árvore nem colisor perto (parede invisível em campo aberto)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("corredor", "const T=X('TREES'),dm=X('dentroMapa'),rz=X('roadZ'),cq=X('colQuery'),MR=X('MAP_R'),C=X('CIDADE');"
  "const perto=(x,z,r)=>{for(const t of T){if(t.agua)continue;if(Math.abs(t.x-x)<r&&Math.abs(t.z-z)<r&&Math.hypot(t.x-x,t.z-z)<r)return true;}for(const c of cq(x,z,r)){if(c.solid&&Math.hypot(c.x-x,c.z-z)<r+(c.r||Math.hypot(c.hw||0,c.hd||0)))return true;}return false;};"
  "const runs=[];let ini=null,ult=null,nn=0,ab=0;"
  "for(let x=MR-40;x<C.x0+6;x+=0.5){const zc=x<168?rz(x):8.2;for(const sg of[-1,1]){const z=zc+sg*10.6;if(x*x+z*z<(MR-1)**2)continue;nn++;const aberto=!perto(x,z,2.5)&&!dm(x,z+sg*0.8);if(aberto)ab++;"
  "const k=sg+'';if(aberto){if(!runs[k])runs[k]=[];const L=runs[k];if(L.length&&x-L[L.length-1][1]<=0.6)L[L.length-1][1]=x;else L.push([x,x]);}}}"
  "const lim=[];for(let a=0;a<6.283;a+=0.01){const x=Math.cos(a)*(MR-0.6),z=Math.sin(a)*(MR-0.6);if(dm(x+Math.cos(a)*1.2,z+Math.sin(a)*1.2))continue;if(!perto(x,z,3.0))lim.push([r2(x),r2(z)]);}"
  "const fmt=L=>(L||[]).filter(r=>r[1]-r[0]>=2).map(r=>[r2(r[0]),r2(r[1])]);"
  "return{nn,ab,norte:fmt(runs['-1']),sul:fmt(runs['1']),circuloSemArvore:lim.length,exCirculo:lim.slice(0,30)};")]
salvar('p141.json', s)

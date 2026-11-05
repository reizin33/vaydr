"""p144: peças das barricadas do cerco (blocos, carros e entulho) não podem ficar uma dentro da outra nem dentro de carro, caminhão ou poste que já existia."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("barr", "const L=X('COLL'),cq=X('colQuery');const B=L.filter(c=>c.barr);"
  "const dentro=(c,x,z)=>{if(c.t===0)return Math.hypot(x-c.x,z-c.z)<c.r;const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c;return Math.abs(lx)<c.hw&&Math.abs(lz)<c.hd;};"
  "const pts=c=>{const r=[];if(c.t===0){for(let a=0;a<6.28;a+=0.5)r.push([c.x+Math.cos(a)*c.r*0.9,c.z+Math.sin(a)*c.r*0.9]);r.push([c.x,c.z]);return r;}for(let i=-1;i<=1;i+=0.25)for(let j=-1;j<=1;j+=0.25){const a=i*c.hw*0.95,b=j*c.hd*0.95;r.push([c.x+a*c.c+b*c.s,c.z-a*c.s+b*c.c]);}return r;};"
  "const ruins=[];for(const c of B){let hit=null;for(const[x,z]of pts(c)){for(const o of [...cq(x,z,0.2)]){if(o===c||!o.solid||o.cerco||o.sub)continue;if(dentro(o,x,z)){hit=o;break;}}if(hit)break;}"
  "if(hit)ruins.push({x:r2(c.x),z:r2(c.z),com:{x:r2(hit.x),z:r2(hit.z),k:Object.keys(hit).filter(k=>!['x','z','t','hw','hd','c','s','yaw','r','solid','stamp','br','cells','y0','y1'].includes(k)).join(',')}});}"
  "const kinds={};for(const o of X('CID').props)if(['jersey','cerco'].includes(o.k))kinds[o.k]=(kinds[o.k]||0)+1;return{barr:B.length,sobrepostos:ruins.length,ex:ruins.slice(0,12),kinds};")]
salvar('p144.json', s)

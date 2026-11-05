"""p145: lugares livres na vila para os marcos novos (caixa d'água, ponto de ônibus, mesas do bar)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("vila", "const pb=X('pointBlocked'),gr=X('ground'),ri=X('roadInfo'),T=X('TREES');"
  "const arv=(x,z)=>{let m=1e9;for(const t of T){const d=Math.hypot(t.x-x,t.z-z);if(d<m)m=d;}return m;};"
  "const inc=(x,z,r)=>{let a=1e9,b=-1e9;for(let i=0;i<8;i++){const g=gr(x+Math.cos(i*0.785)*r,z+Math.sin(i*0.785)*r);a=Math.min(a,g);b=Math.max(b,g);}const g0=gr(x,z);return[r2(b-a),r2(g0)];};"
  "const caixa=[],ponto=[];for(let x=20;x<=105;x+=2)for(let z=-122;z<=-44;z+=2){const R=ri(x,z),dc=Math.hypot(x-62,z-72*-1);"
  "if(!pb(x,z,3.8)&&R.d>R.road.w/2+2.5){const[i,g]=inc(x,z,3.5),a=arv(x,z);if(i<0.35&&a>5)caixa.push({x,z,dc:r2(dc),i,g,a:r2(a),rd:r2(R.d)});}"
  "if(R.d>R.road.w/2+0.9&&R.d<R.road.w/2+2.4&&!pb(x,z,1.9)){const[i,g]=inc(x,z,1.8);if(i<0.25)ponto.push({x,z,dc:r2(dc),i,g,rd:r2(R.d),w:R.road.w,rid:R.road.id||R.road.nome||''});}}"
  "caixa.sort((p,q)=>p.dc-q.dc);ponto.sort((p,q)=>p.dc-q.dc);"
  "const bar=X('VILA').v7,fr=[];for(let u=0.5;u<bar.W;u+=1)for(let v=-3.6;v<=-0.6;v+=0.6){const w=X('pw')(bar,u,v);if(!pb(w[0],w[1],0.55))fr.push([r2(u),r2(v),r2(w[0]),r2(w[1])]);}"
  "return{caixa:caixa.slice(0,25),ponto:ponto.slice(0,25),bar:{ox:bar.ox,oz:bar.oz,yaw:r2(bar.yaw),W:bar.W,D:bar.D,uF:bar.uF,yq:bar.yq,y0:bar.y0,livres:fr.length,ex:fr.slice(0,40)}};")]
salvar('p145.json', s)

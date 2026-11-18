/* ================= Perigo na estrada (v10.3.3, 18/11/2026) =================
   Do questionário do Himalaia sobre o clima de fim do mundo ("perigo e tensão"). De dia, andando pelas estradas e trilhas
   fora da cidade e longe da base, de vez em quando um grupinho de 2 a 4 mortos aparece lá longe na estrada (nasce a uns 80 m,
   na neblina, à frente de para onde você vai) e vem andando devagar para onde você está. Um a cada 2 a 4 minutos, no máximo
   um grupo por vez; quem fica para trás (a mais de 140 m) some. Não acontece de noite (a horda já vem), dentro da cidade (lá já
   tem os dela), perto da base, de carro andando rápido nem no modo criativo. */
const ESTRADA={t:140,ids:[],grupos:0};
/* anda "dist" metros pela estrada a partir do ponto dela mais perto de (px,pz), para o lado s (+1 ou -1); null se acabar antes */
function estradaAnda(r,i,q,s,dist){let x=q[0],z=q[1],k=s>0?i+1:i;
  while(k>=0&&k<r.pts.length){const b=r.pts[k],d=Math.hypot(b[0]-x,b[1]-z);if(d>=dist){const t=dist/d;return[x+(b[0]-x)*t,z+(b[1]-z)*t];}dist-=d;x=b[0];z=b[1];k+=s;}return null;}
function estradaPonto(px,pz,vx,vz,dist){let best=null;
  for(const r of ROADS)for(let i=0;i<r.pts.length-1;i++){const a=r.pts[i],b=r.pts[i+1],d=segDist(px,pz,a[0],a[1],b[0],b[1]);if(!best||d<best.d)best={d,r,i};}
  if(!best||best.d>best.r.w/2+8)return null;const{r,i}=best,a=r.pts[i],b=r.pts[i+1],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez||1,t=clamp(((px-a[0])*ex+(pz-a[1])*ez)/L2,0,1),q=[a[0]+ex*t,a[1]+ez*t];
  const va=vx*ex+vz*ez,s0=Math.abs(va)>0.2?Math.sign(va):(Math.random()<0.5?1:-1);
  return estradaAnda(r,i,q,s0,dist)||estradaAnda(r,i,q,-s0,dist);}
function estradaPode(){if(G.modo!=='jogo'||!P.alive||window.__semZumbi||(typeof ADM!=='undefined'&&ADM.ativo))return false;
  if(G.hora<6.5||G.hora>17.5)return false;if(dentroCidade(P.x,P.z,25))return false;
  const bc=typeof baseCentro==='function'?baseCentro():[FIRE[0],FIRE[2]];if(Math.hypot(P.x-bc[0],P.z-bc[1])<60||Math.hypot(P.x-FIRE[0],P.z-FIRE[2])<60)return false;
  if(CARRO&&CARRO.ativo&&Math.abs(CARRO.v||0)>6)return false;return roadInfo(P.x,P.z).d<12;}
PASSOS.push(function estradaPasso(dt){
  /* quem ficou para trás some */
  if(ESTRADA.ids.length){for(let j=ESTRADA.ids.length-1;j>=0;j--){const id=ESTRADA.ids[j],k=Z.findIndex(q=>q.id===id);
      if(k<0||!Z[k].vivo){ESTRADA.ids.splice(j,1);continue;}if(Math.hypot(Z[k].x-P.x,Z[k].z-P.z)>140&&Z[k].st!=='caca'){Z.splice(k,1);ESTRADA.ids.splice(j,1);}}}
  ESTRADA.t-=dt;if(ESTRADA.t>0)return;ESTRADA.t=10;
  if(ESTRADA.ids.length||!estradaPode()||Z.length>=ZMAX-16)return;
  const vx=CARRO&&CARRO.ativo?Math.sin(CARRO.yaw||0):P.vx,vz=CARRO&&CARRO.ativo?Math.cos(CARRO.yaw||0):P.vz,pt=estradaPonto(P.x,P.z,vx,vz,74+Math.random()*14);if(!pt)return;
  if(dentroCidade(pt[0],pt[1],10)||Math.hypot(pt[0]-FIRE[0],pt[1]-FIRE[2])<50)return;
  const n=2+Math.floor(Math.random()*3);let feitos=0;
  for(let k=0;k<n;k++){const x=pt[0]+(Math.random()-0.5)*5,z=pt[1]+(Math.random()-0.5)*5;if(!pontoLivre(x,z))continue;const q=criarZ(Math.random()<0.12?'runner':'walker',x,z);if(!q)continue;
    q.hx=P.x+(Math.random()-0.5)*12;q.hz=P.z+(Math.random()-0.5)*12;q.idleT=Math.random()*1.5;q.estrada=true;ESTRADA.ids.push(q.id);feitos++;}
  if(feitos){ESTRADA.grupos++;ESTRADA.t=120+Math.random()*120;sfx('gemido',pt[0],pt[1],1.2);}});

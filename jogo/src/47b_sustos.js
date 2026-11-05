/* ================= sustos na mata: vulto entre as árvores e zumbis saindo da terra ================= */
const VULTO={ativo:false,t:0,dur:0,x:0,z:0,ch:null,prox:70};
function updateVulto(dt){const V=VULTO;if(!V.ch)return;
  if(V.ativo){V.t+=dt;const dx=P.x-V.x,dz=P.z-V.z,d=Math.hypot(dx,dz);let some=V.t>V.dur||d<13||!P.alive||CARRO.ativo;
    if(!some&&P.lanterna&&(E.n||0)>0.2&&d<32){const fx=cam.fwd[0],fz=cam.fwd[2],fl=Math.hypot(fx,fz)||1;if((-dx*fx-dz*fz)/(d*fl)>0.975)some=true;}
    if(some){V.ativo=false;V.ch.vis=false;if(d<13)sfx('sussurro',V.x,V.z,1);return;}
    V.ch.x=V.x;V.ch.z=V.z;V.ch.y=ground(V.x,V.z);V.ch.yaw=Math.atan2(dx,dz);V.ch.tint=[0.03,0.03,0.035];poseZIdle(V.ch.r,G.t*0.25,ZP.walker);V.ch.vis=true;return;}
  V.prox-=dt;if(V.prox>0)return;const n=E.n||0,mt=mata(P.x,P.z);V.prox=lerp(110,40,n)+Math.random()*50;
  if(CARRO.ativo||!P.alive||G.modo!=='jogo'||mt<0.6)return;if(n<0.25&&Math.random()>0.3)return;
  const yaw=Math.atan2(cam.fwd[0],cam.fwd[2]);
  for(let k=0;k<16;k++){const a=yaw+(Math.random()-0.5)*1.2,r=21+Math.random()*14,x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;
    if(Math.hypot(x-FIRE[0],z-FIRE[2])<24||mata(x,z)<0.7||pointBlocked(x,z,0.45))continue;
    V.x=x;V.z=z;V.t=0;V.dur=3.5+Math.random()*4;V.ativo=true;if(Math.random()<0.6)sfx('galho',x,z,0.8);break;}}
/* zumbi que sai da terra (de noite perto de você, e às vezes de dia no fundo da mata) */
function zLevantar(tipo,x,z,extra){const q=criarZ(tipo,x,z,Object.assign({st:'sobe',t:0,sink:-1.75},extra||{}));if(!q)return null;
  q.ch.y=ground(x,z)-1.75;q.ch.yaw=Math.atan2(P.x-x,P.z-z);sfx('gemido',x,z,0.9);poeira(x,ground(x,z)+0.2,z,10);return q;}
function pontoLevantar(minR,maxR,frente){const yaw=Math.atan2(cam.fwd[0],cam.fwd[2]);
  for(let k=0;k<20;k++){const a=frente?yaw+(Math.random()-0.5)*2.2:Math.random()*6.283,r=minR+Math.random()*(maxR-minR),x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;
    if(Math.hypot(x-FIRE[0],z-FIRE[2])<15||pointBlocked(x,z,0.6))continue;const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2)continue;return[x,z];}return null;}
let susMataT=200;
function updateSustosMata(dt){if(G.modo!=='jogo'||!P.alive||CARRO.ativo)return;susMataT-=dt;if(susMataT>0)return;susMataT=150+Math.random()*120;
  const n=E.n||0;if(n>0.5)return;if(mata(P.x,P.z)<0.85)return;if(Z.some(z=>z.vivo&&d2(z.x,z.z,P.x,P.z)<18*18))return;
  const p=pontoLevantar(11,16,false);if(p){zLevantar('walker',p[0],p[1]);dica('levanta','alerta','Tem coisa enterrada nessa mata. Fique esperto longe da clareira.');}}

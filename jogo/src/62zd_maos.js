/* ================= Duas mãos (v10.2.3, 14/11/2026) =================
   Himalaia: "nenhum item ele segura com as duas mãos". Na 3ª pessoa, quem segura machado, picareta, pá, lança, taco e
   corta-cadeado põe também a mão esquerda no cabo (o jogador e os sobreviventes do Personalizado e do Sobrevivente).
   · Depois da animação (andar, correr, golpe), o braço esquerdo é refeito por cinemática inversa de dois ossos: o ombro fica
     onde está, o cotovelo vai para baixo e para fora e o meio da mão esquerda chega a um ponto do cabo. O ponto é dado no
     espaço do item (cabo ao longo de +z, lâmina ou ponta para -y; a mão direita fica no zero), em MAO2.
   · Se o cabo fica longe demais para o braço (golpe bem aberto), a mão chega o mais perto que dá.
   · Entra e sai aos poucos (MAO2_VEL por segundo): trocar de item não faz o braço pular.
   · A mão direita, a animação do resto do corpo e o golpe continuam iguais. */
const MAO2={machado:[0,0,0.27],picareta:[0,0,0.27],pa:[0,0,0.3],lanca:[0,0,0.45],taco:[0,0,0.11],tacoCravado:[0,0,0.11]};
const MAO2_VEL=5;
const _MAO2T={q:new Float32Array(4),v:[0,0,0],R:new Float32Array(16),L:new Float32Array(16),liga:true,erro:null};
const nrm3=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];};
/* qual item está na mão direita deste personagem (o jogador ou um sobrevivente) */
function mao2Item(ch){if(ch===P.ch){if(G.modo==='criacao'||CARRO.ativo||!P.alive)return null;const it=selItem();if(!it)return null;const d=ITEMS[it.id];
    return d&&(d.tipo==='arma'||d.mao)&&MESH.arma&&MESH.arma[it.id]?it.id:null;}
  if(typeof SOBREV!=='undefined')for(const s of SOBREV)if(s.ch===ch){if(s.st==='morto'||s.st==='caido')return null;return s.def&&s.def.arma||null;}
  return null;}
function maosIK(ch,dt){const s=ch.sk;if(!s||!s.t.pronto||!s.Q||!s.G)return;const id=mao2Item(ch),g=id?MAO2[id]:null;
  s.m2w=approach(s.m2w||0,g?1:0,dt*MAO2_VEL);if(g)s.m2g=g;if(s.m2w<0.004||!s.m2g)return;
  const t=s.t,Q=s.Q,X=s.P,w=s.m2w*s.m2w*(3-2*s.m2w),G2=s.m2g,LA=SKI.LeftArm,LF=SKI.LeftForeArm,LH=SKI.LeftHand,RH=SKI.RightHand,v=_MAO2T.v;
  /* o ponto do cabo onde fecha a mão esquerda, no espaço do personagem (o quadro da mão direita é o do item: 21b, enc(11)) */
  qmul(_MAO2T.q,0,Q,RH*4,t.AqInv,RH*4);qrot(Q,RH*4,0,0.075,0,v);const hx=X[RH*3]+v[0],hy=X[RH*3+1]+v[1],hz=X[RH*3+2]+v[2];
  qrot(_MAO2T.q,0,G2[0],G2[1],G2[2],v);const Ax=hx+v[0],Ay=hy+v[1],Az=hz+v[2];
  /* ombro, cotovelo e pulso esquerdos da animação; o meio da mão fica 7,5 cm à frente do pulso (como na mão direita) */
  const Sx=X[LA*3],Sy=X[LA*3+1],Sz=X[LA*3+2],Ex=X[LF*3],Ey=X[LF*3+1],Ez=X[LF*3+2],Wx=X[LH*3],Wy=X[LH*3+1],Wz=X[LH*3+2];
  qrot(Q,LH*4,0,0.075,0,v);const Hx=Wx+v[0],Hy=Wy+v[1],Hz=Wz+v[2];
  const L1=Math.hypot(Ex-Sx,Ey-Sy,Ez-Sz),L2=Math.hypot(Hx-Ex,Hy-Ey,Hz-Ez);if(L1<1e-3||L2<1e-3)return;
  /* alvo: do lugar da animação até o cabo, pelo peso (entra e sai sem pulo) */
  let Tx=Hx+(Ax-Hx)*w,Ty=Hy+(Ay-Hy)*w,Tz=Hz+(Az-Hz)*w;
  let dx=Tx-Sx,dy=Ty-Sy,dz=Tz-Sz;const d0=Math.hypot(dx,dy,dz)||1e-4,ux=dx/d0,uy=dy/d0,uz=dz/d0;
  const d=Math.min((L1+L2)*0.998,Math.max(Math.abs(L1-L2)*1.05+1e-3,d0));Tx=Sx+ux*d;Ty=Sy+uy*d;Tz=Sz+uz*d;
  /* o cotovelo vai para o lado do cotovelo da animação, puxado para baixo e para fora (a esquerda do personagem é +x) */
  let px=Ex-Sx+0.22*w,py=Ey-Sy-0.3*w,pz=Ez-Sz-0.08*w,pu=px*ux+py*uy+pz*uz;px-=ux*pu;py-=uy*pu;pz-=uz*pu;let pl=Math.hypot(px,py,pz);
  if(pl<1e-5){px=0.3;py=-1;pz=0;pu=px*ux+py*uy+pz*uz;px-=ux*pu;py-=uy*pu;pz-=uz*pu;pl=Math.hypot(px,py,pz)||1;}px/=pl;py/=pl;pz/=pl;
  const a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a)),E2x=Sx+ux*a+px*h,E2y=Sy+uy*a+py*h,E2z=Sz+uz*a+pz*h;
  /* braço: gira em volta do ombro até o cotovelo novo; antebraço e mão: em volta do cotovelo até o alvo */
  const qa=qFromTo(nrm3(Ex-Sx,Ey-Sy,Ez-Sz),nrm3(E2x-Sx,E2y-Sy,E2z-Sz));for(const b of[LA,LF,LH])qmul(Q,b*4,qa,0,Q,b*4);
  qrot(qa,0,Hx-Sx,Hy-Sy,Hz-Sz,v);const H1x=Sx+v[0],H1y=Sy+v[1],H1z=Sz+v[2];qrot(qa,0,Wx-Sx,Wy-Sy,Wz-Sz,v);const W1x=Sx+v[0]-E2x,W1y=Sy+v[1]-E2y,W1z=Sz+v[2]-E2z;
  const qb=qFromTo(nrm3(H1x-E2x,H1y-E2y,H1z-E2z),nrm3(Tx-E2x,Ty-E2y,Tz-E2z));for(const b of[LF,LH])qmul(Q,b*4,qb,0,Q,b*4);
  qrot(qb,0,W1x,W1y,W1z,v);X[LF*3]=E2x;X[LF*3+1]=E2y;X[LF*3+2]=E2z;X[LH*3]=E2x+v[0];X[LH*3+1]=E2y+v[1];X[LH*3+2]=E2z+v[2];
  /* matrizes da pele dos três ossos e os quadros de encaixe que dependem deles (os mesmos do 21b) */
  trs(_MAO2T.R,ch.x,ch.y,ch.z,ch.pitch,ch.yaw,ch.roll,ch.s,ch.s,ch.s);
  for(const b of[LA,LF,LH]){qMat(_MAO2T.L,Q,b*4,X[b*3],X[b*3+1],X[b*3+2]);const Gb=s.G.subarray(b*16,b*16+16);mul(Gb,_MAO2T.R,_MAO2T.L);mul(s.skin.subarray(b*16,b*16+16),Gb,t.inv.subarray(b*16,b*16+16));}
  const enc=(dst,b,oy)=>{qmul(_MAO2T.q,0,Q,b*4,t.AqInv,b*4);qrot(Q,b*4,0,oy,0,v);qMat(_MAO2T.L,_MAO2T.q,0,X[b*3]+v[0],X[b*3+1]+v[1],X[b*3+2]+v[2]);mul(dst,_MAO2T.R,_MAO2T.L);};
  enc(ch.m.subarray(4*16,5*16),LF,0);if(ch.mE)enc(ch.mE,LH,0.075);if(ch.proc)enc(ch.m.subarray(3*16,4*16),LA,0);
  s.m2ok=(s.m2ok||0)+1;}
{const _sp=skPose;skPose=function(ch,dt){_sp.apply(this,arguments);if(!_MAO2T.liga)return;try{maosIK(ch,dt);}catch(e){if(!_MAO2T.erro){_MAO2T.erro=String(e);console.error('duas mãos',e);}}};}

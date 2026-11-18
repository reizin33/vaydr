/* ================= Clareira: acampamento de sobrevivente (v10.3.3, 18/11/2026) =================
   Himalaia: "mude a clareira". A clareira do começo vira o acampamento de quem vive ali:
   · BARRACA DE LONA: maior, com a trama do tecido, de duas águas (a cumeeira cede um pouco no meio), sobreteto verde-escuro
     por cima, a porta enrolada dos dois lados (o escuro de dentro aparece), o saco de dormir saindo pela porta, a mochila e a
     bota na entrada, as varetas e as cordas esticadas até as estacas. A colisão e o "Descansar na barraca" continuam iguais.
   · LONA AZUL NA BANCADA: esticada em quatro varas por cima da bancada do rádio (mais alta na frente, a chuva escorre para
     trás), cedendo no meio, com as cordas de amarrar.
   · VARAL atrás da barraca, com camiseta, calça, toalha e pano pendurados.
   · PANELA NO TRIPÉ em cima da fogueira.
   · TERRA BATIDA em volta da fogueira, da barraca e da bancada, e as trilhas de tanto andar (até a bancada, o barril, o portão
     e a saída para a mata).
   · TRALHA: cadeira de plástico na fogueira, pneus empilhados de banco, galões, botijão, tambor-fogão, caixas de plástico,
     tambor e o carrinho de mão.
   Nada disso tem colisão nova (só onde já tinha): não prende construção nenhuma de jogo salvo. */
const ACAMP={malha:null,tentou:false,info:null};
function acampBarraca(){return true;}   // 10_world: a barraca antiga vai para o buffer que é jogado fora
/* ---------- terra batida: canal de terra do mapa de chão (o mesmo das trilhas), com a borda irregular ---------- */
const ACAMP_TRILHAS=[[FIRE[0],FIRE[2],BENCH[0],BENCH[1]],[FIRE[0],FIRE[2],-1.5,-4.4],[FIRE[0],FIRE[2],0,-10.6],[FIRE[0],FIRE[2],5,12.8],[TENT[0],TENT[1],FIRE[0],FIRE[2]],[BENCH[0],BENCH[1],6.2,-0.2]];
function acampTerra(x,z){const n=vnoise(x*0.6+11,z*0.6-4),n2=vnoise(x*1.9-3,z*1.9+9),e=(n-0.5)*1.5+(n2-0.5)*0.6;let d=0;
  d=Math.max(d,smooth(5.0,2.4,Math.hypot(x-FIRE[0],z-FIRE[2])+e)*0.9);
  for(const[px,pz,r,k]of[[TENT[0],TENT[1],3.0,0.72],[BENCH[0],BENCH[1],2.9,0.78],[-1.5,-4.5,1.7,0.62],[5.9,-0.1,1.8,0.6]]){const q=Math.hypot(x-px,z-pz)+e*0.8;d=Math.max(d,smooth(r,r*0.4,q)*k);}
  for(const s of ACAMP_TRILHAS){const q=segDist(x,z,s[0],s[1],s[2],s[3])+e*0.45;d=Math.max(d,smooth(1.0,0.28,q)*0.62);}
  return d;}
{const _sd=splatData;splatData=function(){const D=_sd.apply(this,arguments);
  try{const S=SPLAT_S,H=SPLAT_H,ts=2*H/S,R0=16,i0=Math.max(0,Math.floor((-R0+H)/ts)),i1=Math.min(S-1,Math.ceil((R0+H)/ts));
    for(let j=i0;j<=i1;j++)for(let i=i0;i<=i1;i++){const v=acampTerra(-H+(i+0.5)*ts,-H+(j+0.5)*ts);if(v<0.02)continue;const o=(j*S+i)*4+1,b=Math.round(clamp(v,0,1)*255);if(b>D[o])D[o]=b;}}
  catch(e){console.error('acampamento (terra)',e);}return D;};}

/* ---------- geometria ---------- */
/* triângulo com a frente para fora: inverte a ordem se a normal apontar contra out(centro) */
function acampOrient(q,out){const[p0,p1,p2]=q,ux=p1[0]-p0[0],uy=p1[1]-p0[1],uz=p1[2]-p0[2],vx=p2[0]-p0[0],vy=p2[1]-p0[1],vz=p2[2]-p0[2];
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,o=out((p0[0]+p1[0]+p2[0])/3,(p0[1]+p1[1]+p2[1])/3,(p0[2]+p1[2]+p2[2])/3);return nx*o[0]+ny*o[1]+nz*o[2]<0?[p0,p2,p1]:q;}
/* superfície em grade f(u,v) → [x,y,z], com a frente para out */
function acampGrade(G,M,cor,f,ni,nj,out,R){const t=[];for(let i=0;i<ni;i++)for(let j=0;j<nj;j++){const a=f(i/ni,j/nj),b=f((i+1)/ni,j/nj),c=f((i+1)/ni,(j+1)/nj),d=f(i/ni,(j+1)/nj);
    t.push(acampOrient([a,b,c],out),acampOrient([a,c,d],out));}add(G,t,M,cor,{keepWind:true,crease:50,j:0.06,rnd:R});}
/* corda (ou vareta fina) de A até B, em coordenadas do mundo */
function acampCorda(G,A,B,r,cor){const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],L=Math.hypot(dx,dy,dz);add(G,cylTris(r,r,L,4),alignY(A[0],A[1],A[2],dx,dy,dz),cor);}

/* a barraca: origem no centro da barraca, +z para a porta (que olha para a fogueira) */
function acampBarracaGeo(gP,gM,gL,R){const B=mat(TENT[0],ground(TENT[0],TENT[1]),TENT[1],0,TENT_YAW,0),L=1.4,b=1.22,h=1.62,b2=b+0.2,h2=h+0.15,L2=L+0.32,v0=0.27;
  const lona=lin(0x8f8667),sobre=lin(0x4e5a3a),escuro=lin(0x0c0e0b),corda=lin(0xb8ad8c),haste=lin(0x3b3f42),W=(x,y,z)=>xf(B,x,y,z);
  const fora=(x,y,z)=>[x,y-h*0.35,0];   // para fora do eixo da cumeeira
  // a barraca de dentro (lona clara) e o sobreteto (verde-escuro, mais largo e mais comprido, sem encostar no chão)
  for(const s of[-1,1]){acampGrade(gP,B,lona,(u,v)=>[s*b*(1-v),h*v-0.05*Math.sin(Math.PI*v)-0.07*Math.sin(Math.PI*u)*v,-L+2*L*u],6,3,fora,R);
    acampGrade(gP,B,sobre,(u,v)=>{const vv=v0+(1-v0)*v;return[s*b2*(1-vv),h2*vv-0.04*Math.sin(Math.PI*vv)-0.09*Math.sin(Math.PI*u)*vv,-L2+2*L2*u];},7,3,fora,R);}
  // fundo fechado, frente com a porta aberta (os dois lados enrolados) e o escuro de dentro
  add(gP,[acampOrient([[-b,0,-L],[b,0,-L],[0,h,-L]],()=>[0,0,-1])],B,lona,{keepWind:true});
  add(gP,[acampOrient([[-b,0,L],[-0.5,0,L],[0,h-0.14,L]],()=>[0,0,1]),acampOrient([[-b,0,L],[0,h-0.14,L],[0,h,L]],()=>[0,0,1]),
          acampOrient([[b,0,L],[0.5,0,L],[0,h-0.14,L]],()=>[0,0,1]),acampOrient([[b,0,L],[0,h-0.14,L],[0,h,L]],()=>[0,0,1])],B,lona,{keepWind:true});
  add(gL,[acampOrient([[-0.6,0.01,L-0.06],[0.6,0.01,L-0.06],[0,h-0.08,L-0.06]],()=>[0,0,1])],B,escuro,{keepWind:true});
  for(const s of[-1,1])acampCorda(gP,W(s*0.53,0.06,L+0.05),W(s*0.06,h-0.17,L+0.05),0.065,lin(0x7d7558));   // as abas enroladas
  // chão de lona e o escuro de dentro (o que se vê pela porta)
  add(gP,boxTris(2*b+0.3,0.025,2*L+0.35),mm(B,mat(0,0.0,0.05)),lin(0x3f4432));
  add(gL,[acampOrient([[-b+0.08,0.03,-L+0.08],[b-0.08,0.03,-L+0.08],[0,h-0.12,-L+0.08]],()=>[0,0,1])],B,escuro,{keepWind:true});
  // varetas da frente e de trás, cordas da cumeeira e dos cantos até as estacas
  for(const s of[-1,1]){add(gM,cylTris(0.022,0.026,h2+0.16,5),mm(B,mat(0,0,s*(L+0.2))),haste);
    const est=(x,z)=>{add(gM,boxTris(0.04,0.26,0.04),mm(B,mat(x,0.08,z,0,0,0.35*Math.sign(x||1))),lin(0x6a5236));return W(x,0.14,z);};
    acampCorda(gM,W(0,h2+0.12,s*(L+0.2)),est(0,s*(L+1.25)),0.008,corda);
    for(const sx of[-1,1])acampCorda(gM,W(sx*b2*(1-v0),h2*v0,s*(L2-0.12)),est(sx*(b+1.05),s*(L+0.55)),0.008,corda);}
  // saco de dormir saindo pela porta, mochila encostada, bota e uma lata
  add(gP,bvTris(0.72,0.19,1.9),mm(B,mat(0.12,0.1,L-0.2,0,0.06,0)),lin(0x7a3527),{j:0.05,rnd:R});
  add(gP,bvTris(0.6,0.14,0.32),mm(B,mat(0.1,0.21,L-0.95,0,0.08,0)),lin(0x55604a));
  add(gP,bvTris(0.38,0.52,0.24),mm(B,mat(0.82,0.27,L+0.42,-0.3,0.25,0)),lin(0x4a5233),{j:0.06,rnd:R});
  add(gP,bvTris(0.3,0.16,0.08),mm(B,mat(0.82,0.32,L+0.56,-0.3,0.25,0)),lin(0x3c432b));
  for(const s of[-1,1])add(gL,bvTris(0.12,0.16,0.3),mm(B,mat(-0.66+s*0.08,0.08,L+0.5,0,0.2,0)),lin(0x2a221b));
  add(gL,cylTris(0.045,0.045,0.12,7),mm(B,mat(-0.95,0,L+0.75)),lin(0x6d6f70));}

/* a lona azul por cima da bancada do rádio: origem na bancada, +z para onde a gente fica de pé */
function acampLonaGeo(gP,gM,R){const yw=-0.35,B=mat(BENCH[0],ground(BENCH[0],BENCH[1]),BENCH[1],0,yw,0),W=(x,y,z)=>xf(B,x,y,z),azul=lin(0x3b5a6e),vara=lin(0x6b5034),corda=lin(0xb8ad8c);
  const X=2.05,Z0=-0.95,Z1=2.15,yA=2.02,yB=2.38,pos=(u,v)=>[-X+2*X*u,yA+(yB-yA)*v-0.28*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)-0.05*Math.sin(3*Math.PI*u)*Math.sin(2*Math.PI*v),Z0+(Z1-Z0)*v];
  acampGrade(gP,B,azul,pos,6,5,()=>[0,1,0],R);acampGrade(gP,B,scl(azul,0.8),(u,v)=>{const p=pos(u,v);return[p[0],p[1]-0.012,p[2]];},6,5,()=>[0,-1,0],R);
  for(const[x,z,y]of[[-1.85,-0.75,2.06],[1.85,-0.75,2.06],[-1.85,1.95,2.4],[1.85,1.95,2.4]]){add(gM,cylTris(0.035,0.042,y+0.1,6),mm(B,mat(x,0,z,(R()-0.5)*0.05,0,(R()-0.5)*0.05)),vara,{j:0.08,rnd:R});
    const sx=Math.sign(x),sz=z>0?1:-1;acampCorda(gM,W(x,y,z),W(x+sx*0.85,0.1,z+sz*0.8),0.008,corda);add(gM,boxTris(0.04,0.24,0.04),mm(B,mat(x+sx*0.85,0.08,z+sz*0.8,0,0,0.35*sx)),lin(0x6a5236));}}

/* o varal atrás da barraca, da vareta de trás até uma vara fincada, com a roupa pendurada */
function acampVaralGeo(gP,gM,R){const BT=mat(TENT[0],ground(TENT[0],TENT[1]),TENT[1],0,TENT_YAW,0),A=xf(BT,0,1.86,-1.6),pb=xf(BT,0.4,0,-3.65),Bp=[pb[0],ground(pb[0],pb[2])+1.88,pb[2]];
  add(gM,cylTris(0.035,0.042,1.98,6),mat(pb[0],ground(pb[0],pb[2]),pb[2],0.06,0,-0.04),lin(0x6b5034));
  const pt=t=>[A[0]+(Bp[0]-A[0])*t,A[1]+(Bp[1]-A[1])*t-0.16*Math.sin(Math.PI*t),A[2]+(Bp[2]-A[2])*t],yaw=Math.atan2(Bp[0]-A[0],Bp[2]-A[2]);
  for(let i=0;i<8;i++)acampCorda(gM,pt(i/8),pt((i+1)/8),0.007,lin(0xb8ad8c));
  for(const[t,w,hh,c]of[[0.24,0.52,0.6,0x8a897b],[0.44,0.4,0.86,0x3d4a5e],[0.63,0.62,0.48,0x9a4636],[0.82,0.34,0.3,0xb3aa94]]){const p=pt(t),M=mat(p[0],p[1]-hh/2-0.02,p[2],0,yaw+Math.PI/2,(R()-0.5)*0.12);
    add(gP,bvTris(w,hh,0.025),M,lin(c),{j:0.08,rnd:R});for(const s of[-1,1])add(gM,boxTris(0.02,0.07,0.03),mat(p[0]+Math.cos(yaw+Math.PI/2)*s*w*0.38,p[1]-0.01,p[2]-Math.sin(yaw+Math.PI/2)*s*w*0.38),lin(0x8a6a3a));}}

/* a panela pendurada no tripé, em cima da fogueira */
function acampTripeGeo(gM,gL,R){const fx=FIRE[0],fz=FIRE[2],y=FIRE[1],T=[fx,y+1.3,fz];
  for(let i=0;i<3;i++){const a=0.5+i*2.094,p=[fx+Math.cos(a)*0.95,y-0.05,fz+Math.sin(a)*0.95];add(gM,cylTris(0.03,0.04,Math.hypot(T[0]-p[0],T[1]-p[1],T[2]-p[2])+0.14,6),alignY(p[0],p[1],p[2],T[0]-p[0],T[1]-p[1],T[2]-p[2]),lin(0x5b4330),{j:0.1,rnd:R});}
  add(gL,cylTris(0.009,0.009,0.5,4),mat(fx,y+0.8,fz),lin(0x2a2a2a));
  const pb=mat(fx,y+0.56,fz);add(gL,cylTris(0.17,0.15,0.22,10),pb,lin(0x1f1f1d));add(gL,cylTris(0.176,0.176,0.03,10),mm(pb,mat(0,0.21,0)),lin(0x2b2b29));
  add(gL,cylTris(0.007,0.007,0.36,4),mm(pb,mat(-0.18,0.24,0,0,0,-Math.PI/2)),lin(0x2a2a2a));}

function acampMalha(){const R=rng(31337),gP=new GB(1<<12,8),gM=new GB(1<<12,8),gL=new GB(1<<10,8),info={};
  acampBarracaGeo(gP,gM,gL,R);acampLonaGeo(gP,gM,R);acampVaralGeo(gP,gM,R);acampTripeGeo(gM,gL,R);
  const partes=[],mk=(g,k,esc)=>{if(!g.n)return;const f=g.data();let m=null;try{if(typeof itxMalha==='function'&&typeof ITX_DADOS!=='undefined'&&ITX_DADOS[k])m=itxMalha('acamp_'+k,f,esc,true,k);}catch(e){m=null;}
    if(m)partes.push(...m.partes);else partes.push(litMesh(f));info[k]=g.n/3|0;};
  mk(gP,'pano',2.2);mk(gM,'madeira',1.4);if(gL.n){partes.push(litMesh(gL.data()));info.liso=gL.n/3|0;}
  if(partes.length)ACAMP.malha={partes,vao:partes[0].vao,count:partes[0].count,itx:true};ACAMP.info=info;}

/* a tralha (modelos de verdade, sem colisão: é baixa e se atravessa) */
function acampTralha(){if(!prpOk())return 0;let n=0;const M=(id,x,z,yaw,s,dy,rx,rz)=>{if(!prpTem(id))return;prpReg(PRP.mundo,id,x,ground(x,z)+(dy||0),z,yaw||0,s||[1,1,1],rx||0,rz||0,0.6,90);n++;};
  const olha=(x,z)=>Math.atan2(FIRE[0]-x,FIRE[2]-z);
  M('cadeiraPlastico',-0.75,-1.3,olha(-0.75,-1.3));
  M('pneuVelho',0.35,1.6,0.3);M('pneuVelho',0.33,1.6,1.1,[1,1,1],0.24);
  M('galaoVerde',6.15,1.0,0.4);M('galaoVerde',6.5,0.8,1.9);
  M('botijaoGas',2.55,-2.05,0.6);M('fogareiroTambor',2.15,-3.45,0.2);
  M('caixaPlastico',-1.85,-3.25,0.5);M('caixaPlastico2',-1.83,-3.22,0.62,[1,1,1],0.3);
  M('tambor2',6.25,-2.65,0.3);M('carrinhoMao',-2.0,-6.0,2.4);
  return n;}

/* monta junto com o mundo (a lista PRP.mundo é refeita a cada mundo novo) */
{const _cp=clearingProps;clearingProps=function(){const r=_cp.apply(this,arguments);
  try{if(!ACAMP.malha&&!ACAMP.tentou){ACAMP.tentou=true;acampMalha();}}catch(e){console.error('acampamento (malha)',e);}
  try{ACAMP.tralha=acampTralha();}catch(e){console.error('acampamento (tralha)',e);}return r;};}
const _MACAMP=M4();
DESENHO.opaco.push(function acampDesenho(Pg){if(!ACAMP.malha||cam.pos[1]<SUB_FUNDO||d2(cam.pos[0],cam.pos[2],0,0)>170*170)return;trs(_MACAMP,0,0,0,0,0,0,1,1,1);drawStat(Pg,ACAMP.malha,_MACAMP);});
DESENHO.sombra.push(function acampSombra(Pg,perto){if(!ACAMP.malha||d2(P.x,P.z,0,0)>(perto?60:140)**2)return;trs(_MACAMP,0,0,0,0,0,0,1,1,1);drawStat(Pg,ACAMP.malha,_MACAMP);});

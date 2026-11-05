/* ================= escada interna da casa: do térreo ao andar de cima, por uma abertura no piso =================
   Vai embaixo de uma plataforma de casa (2,6 m), encostada na parede que você está olhando, e sobe andando (é mais
   íngreme que a de fora, porque cabe dentro dos 3 m da casa). O pé fica do lado mais perto de você; R inverte.
   O piso de cima ganha uma abertura no lugar do lance, com guarda-corpo em volta; a passagem fica do lado do patamar.
   Na ponta de cima também há guarda-corpo, para ninguém sair pela beirada da casa quando não há parede em cima.
   Se a escada quebra, o piso fecha de novo; se a plataforma cai, a escada cai junto.
   Medidas no "lado" escolhido da plataforma: u vai do centro para a parede (a parede fica em u=1,5) e v corre ao longo dela.
   O lance ocupa u de 0,6 a 1,36 (entre o vão da casa e a face de dentro da parede); o topo encosta na parede do fundo. */
iconesNovos({'i-escada-int':'<path d="M3.5 10.5 12 4l8.5 6.5"/><path d="M5.5 9v11.5h13V9"/><path d="M8 20.5v-2.4h2.4v-2.4h2.4v-2.4h2.4v-2.2"/>'});
const EI_W=0.76,EI_UC=0.98,EI_PAT=0.45,EI_L=2.17,EI_TOPO=1.36,EI_PE=0.81,EI_L4=2.3;   // na casa de 4 m o lance é mais comprido (menos íngreme) e o pé ainda deixa 0,55 m até a parede
const eiL=e=>e&&e.m===4?EI_L4:EI_L;
OBRAS.escadaInterna={nome:'Escada interna',icon:'i-escada-int',custo:{tabuas:8,pregos:6},hp:200,hw:0.4,hd:1.1,solid:true,etapa:2,montar:escadaIntMontar,alvo:alvoEscadaInterna};
OBRA_ORDEM.push('escadaInterna');
{const i=OBRAS_CHAO.indexOf('escadaMadeira');OBRAS_CHAO.splice(i>=0?i+1:OBRAS_CHAO.length,0,'escadaInterna');}
BASE_DICAS.escadaInterna='Escada interna pronta: suba andando até o andar de cima pela abertura no piso. Lá em cima, o guarda-corpo protege a abertura; a passagem fica do lado do patamar.';

/* até onde vai a abertura no piso (medido do topo da escada): a cabeça de quem sobe precisa passar pelo piso */
function escadaIntMedidas(h,L){L=L||EI_L;const Lr=L-EI_PAT,fr=Math.max(0,(h-0.24-1.75)/h),crit=L-Lr*fr;return{Lr,szH:clamp(crit+0.35,1.0,L),L};}
const paraLocal=(F,wx,wz)=>{const dx=wx-F.x,dz=wz-F.z,c=Math.cos(F.yaw),s=Math.sin(F.yaw);return[dx*c-dz*s,dx*s+dz*c];};
/* a plataforma em cima da escada */
function platDaEscada(q){const e=q.ext||{};if(e.px===undefined)return null;
  for(const p of OB)if(p.tipo==='plataforma'&&d2(p.x,p.z,e.px,e.pz)<0.04&&Math.abs(p.y-e.py)<0.15)return p;return null;}
/* abertura no piso, no sistema da plataforma: [x0,x1,z0,z1] */
function furoDaEscada(p,e){const m=escadaIntMedidas(e.h,eiL(e)),F={x:p.x,z:p.z,yaw:p.yaw+e.k*Math.PI/2},v0=EI_TOPO-m.szH,
    a=localW(F,0.6,e.d>0?v0:-1.38),b=localW(F,1.38,e.d>0?1.38:-v0),la=paraLocal(p,a[0],a[1]),lb=paraLocal(p,b[0],b[1]);
  return[Math.min(la[0],lb[0]),Math.max(la[0],lb[0]),Math.min(la[1],lb[1]),Math.max(la[1],lb[1])];}
/* chamada no fim da montagem da plataforma: com escada interna embaixo, o piso vira retângulos em volta da abertura */
function platFuros(p){p.furo=null;const q=OB.find(q=>q.tipo==='escadaInterna'&&q.ext&&d2(q.ext.px,q.ext.pz,p.x,p.z)<0.04&&Math.abs(q.ext.py-p.y)<0.15);if(!q)return;
  const H=furoDaEscada(p,q.ext),R=[],ad=(x0,x1,z0,z1)=>{if(x1-x0>0.04&&z1-z0>0.04)R.push([x0,x1,z0,z1]);};
  ad(-1.5,H[0],-1.5,1.5);ad(H[1],1.5,-1.5,1.5);ad(H[0],H[1],-1.5,H[2]);ad(H[0],H[1],H[3],1.5);
  supRemove(p.sup);p.sup=null;const alto=!!p.col;colRemove(p.col);p.col=null;
  const kp=modK(p);p.sups=R.map(r=>{const w=localW(p,(r[0]+r[1])/2*kp,(r[2]+r[3])/2*kp);return supAdd({t:'ret',x:w[0],z:w[1],hw:(r[1]-r[0])/2*kp,hd:(r[3]-r[2])/2*kp,yaw:p.yaw,y:p.y,dono:p});});
  if(alto)p.cols=R.map(r=>{const w=localW(p,(r[0]+r[1])/2*kp,(r[2]+r[3])/2*kp);return colBox(w[0],w[1],(r[1]-r[0])/2*kp,(r[3]-r[2])/2*kp,p.yaw,{solid:true,obra:p,y0:p.y-0.24,y1:p.y});});
  p.mesh=litMesh(geoPlatFuro(H));p.furo=H;}
/* refaz o piso de uma plataforma (abre ou fecha a abertura) sem mexer no apoio dela */
function remontarPlat(p){const ap=p.apoio,nv=p.nivel;colRemove(p.col);p.col=null;if(p.cols){for(const c of p.cols)colRemove(c);p.cols=null;}
  desmontarAlto(p);montarAlto(p,OBRAS.plataforma,p.ext);p.apoio=ap;p.nivel=nv;}

/* ---------- onde vai: dentro da casa, na parede que você olha ---------- */
function alvoEscadaInterna(x,z,yaw){const gP=ground(P.x,P.z);let p=null;
  for(const o of OB){if(o.tipo!=='plataforma')continue;const hh=o.y-gP;if(hh<1.4||hh>3.4*modKH(o))continue;if(noRet(P.x,P.z,o.x,o.z,o.yaw,1.5*modK(o),1.5*modK(o),0)){p=o;break;}}
  if(!p)return{x,z,y:ground(x,z),yaw,ok:false,motivo:'Entre na casa: a escada interna vai embaixo do piso de cima, encostada numa parede'};
  let k=0,best=-9;for(let i=0;i<4;i++){const a=p.yaw+i*Math.PI/2,dd=Math.sin(P.yaw-a);if(dd>best){best=dd;k=i;}}
  const kk=modK(p),a=p.yaw+k*Math.PI/2,F={x:p.x,z:p.z,yaw:a},pl=paraLocal(F,P.x,P.z).map(v=>v/kk);
  let d=pl[1]<0?1:-1;if(Math.round(OBRA.rot/(Math.PI/4))&1)d=-d;
  const Le=kk>1.01?EI_L4:EI_L,Pe=Le-EI_TOPO,O=localW(F,EI_UC*kk,d*EI_TOPO*kk),b=a+(d>0?Math.PI:0),pe=localW(F,EI_UC*kk,-d*Pe*kk),fg=ground(pe[0],pe[1]),h=p.y-fg;
  const r={x:O[0],z:O[1],y:p.y,yaw:b,ext:modExt(kk,{px:+p.x.toFixed(2),pz:+p.z.toFixed(2),py:+p.y.toFixed(2),k,d,h:+h.toFixed(2)})},no=m=>Object.assign(r,{ok:false,motivo:m});
  if(h<1.6)return no('Baixo demais para escada');if(h>3.2*modKH(p))return no('Alto demais para a escada interna');
  if(OB.some(q=>q.tipo==='escadaInterna'&&platDaEscada(q)===p))return no('Essa casa já tem escada interna');
  for(const q of OB){if(q.tipo!=='portaMadeira'&&q.tipo!=='portao'&&q.tipo!=='portaoFerro')continue;const l=paraLocal(F,q.x,q.z).map(v=>v/kk);
    if(Math.abs(l[0]-1.5)<0.35&&Math.abs(l[1])<1.2&&Math.abs(q.y-gP)<1)return no('A porta está nessa parede: vire para outra parede');}
  const m=escadaIntMedidas(h,Le),va=d>0?EI_TOPO-m.szH:-1.38,vb=d>0?1.38:-(EI_TOPO-m.szH);
  for(const q of OB){const Dq=OBRAS[q.tipo];if(q===p||!(Dq.bau||Dq.peq||q.tipo==='lamparina'||q.tipo==='armarioFerro'))continue;if(Math.abs(q.y-p.y)>0.4)continue;
    const l=paraLocal(F,q.x,q.z).map(v=>v/kk);if(l[0]>0.25&&l[0]<1.6&&l[1]>va-0.35&&l[1]<vb+0.35)return no('Tire o que está em cima, no lugar da abertura');}
  if(pl[0]>0.35&&pl[0]<1.5&&pl[1]*d>-Pe-0.3&&pl[1]*d<EI_TOPO+0.1)return no('Saia da frente: a escada vai onde você está');
  const ign=c=>c.obra&&(c.obra.tipo==='plataforma'||c.obra.tipo==='pilar');
  for(let t=0;t<=6;t++){const sz=0.1+t*(Le-0.2)/6,v=d*(EI_TOPO-sz),yr=fg+(sz<=EI_PAT?h:h*(Le-sz)/m.Lr);
    for(const u of[0.72,EI_UC,1.24]){const w=localW(F,u*kk,v*kk),gy=ground(w[0],w[1]);
      if(gy>yr+0.12)return no('O chão sobe no caminho da escada');
      if(bloqueadoChao(w[0],w[1],0.08,gy,ign))return no('Tem coisa no caminho da escada');}}
  r.ok=true;return r;}

/* ---------- montagem: patamar e rampa andáveis, banzo do lado aberto, guarda-corpo em volta da abertura ---------- */
function escadaIntMontar(o){const e=o.ext,m=escadaIntMedidas(e.h,eiL(e)),Lr=m.Lr,os=e.d>0?1:-1,fg=o.y-e.h,kk=modK(o),W=(sx,sz)=>localW(o,sx*kk,sz*kk),zA=0.76,zB=m.szH+0.03;
  {const c=W(0,EI_PAT/2-0.02),r=W(0,EI_PAT+Lr/2);
    o.sups=[supAdd({t:'ret',x:c[0],z:c[1],hw:(EI_W/2-0.03)*kk,hd:(EI_PAT/2+0.02)*kk,yaw:o.yaw,y:o.y,dono:o}),
      supAdd({t:'ram',x:r[0],z:r[1],hw:(EI_W/2-0.03)*kk,hd:Lr/2*kk,yaw:o.yaw,ya:o.y,yb:fg,dono:o})];}
  o.cols=[];{const c=W(os*(EI_W/2-0.035),m.L/2);o.cols.push(colBox(c[0],c[1],0.04*kk,m.L/2*kk,o.yaw,{solid:true,obra:o,y0:fg-0.3,y1:o.y-0.05}));}
  {const c=W(os*0.41,(zA+zB)/2);o.cols.push(colBox(c[0],c[1],0.035*kk,(zB-zA)/2*kk,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+1.0}));}
  {const c=W(os*0.005,zB);o.cols.push(colBox(c[0],c[1],0.405*kk,0.035*kk,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+1.0}));}
  {const c=W(0,-0.04);o.cols.push(colBox(c[0],c[1],0.4*kk,0.035*kk,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+1.0}));}   // na ponta de cima: ninguém sai pela beirada da casa
  o.mesh=litMesh(geoEscadaInt(e));}

/* ---------- geometria ---------- */
/* escada no sistema dela: topo na origem (altura do piso de cima), descendo para +z até o pé; lado aberto em x=os */
function geoEscadaInt(e){const g=new GB(4096,8),R=rng(Math.round(e.h*100)+77),C=k=>lin(COR_CASA[k]),m=escadaIntMedidas(e.h,eiL(e)),P0=EI_PAT,L=m.L,Lr=m.Lr,h=e.h,
    S=Math.hypot(Lr,h),th=Math.atan2(h,Lr),os=e.d>0?1:-1,W=EI_W,zA=0.76,zB=m.szH+0.03;
  for(let i=0;i<2;i++)add(g,boxTris(W-0.04,0.055,0.22),mat(0,-0.03,0.115+i*0.225),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});   // patamar
  for(const x of[-(W/2-0.035),W/2-0.035]){add(g,boxTris(0.06,0.2,P0+0.03),mat(x,-0.13,P0/2),C('esc'),{j:0.06,rnd:R});
    add(g,boxTris(0.06,0.2,S),mat(x,-h/2-0.1,P0+Lr/2,th,0,0),C('esc'),{j:0.06,rnd:R});}                                         // banzos
  const n=Math.max(5,Math.round(h/0.23));
  for(let k=0;k<n;k++){const t=(k+0.5)/n;add(g,boxTris(W-0.1,0.05,Lr/n*0.9),mat(0,-h*t-0.03,P0+Lr*t),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}   // degraus
  const xc=os*(W/2+0.01);   // corrimão do lado aberto
  for(const t of[0.1,0.55,0.97])add(g,boxTris(0.05,0.9,0.05),mat(xc,-h*t+0.45,P0+Lr*t),C('esc2'));
  add(g,boxTris(0.05,0.05,S),mat(xc,-h/2+0.88,P0+Lr/2,th,0,0),C('mad'),{j:0.06,rnd:R});
  add(g,boxTris(W+0.1,0.1,0.2),mat(0,-h+0.03,L-0.08),C('pedra'),{j:0.1,rnd:R});                                                 // pé
  const xr=os*0.41,xw=-os*0.4;   // guarda-corpo no andar de cima: ao longo da abertura e atravessado no fim dela
  for(const z of[zA,(zA+zB)/2,zB])add(g,boxTris(0.06,1.0,0.06),mat(xr,0.5,z),C('esc2'));
  add(g,boxTris(0.06,1.0,0.06),mat(xw,0.5,zB),C('esc2'));
  add(g,boxTris(0.06,0.06,zB-zA+0.06),mat(xr,0.97,(zA+zB)/2),C('mad'));add(g,boxTris(0.05,0.05,zB-zA),mat(xr,0.5,(zA+zB)/2),C('mad2'));
  add(g,boxTris(Math.abs(xw-xr)+0.06,0.06,0.06),mat((xw+xr)/2,0.97,zB),C('mad'));add(g,boxTris(Math.abs(xw-xr),0.05,0.05),mat((xw+xr)/2,0.5,zB),C('mad2'));
  for(const x of[-0.38,0.38])add(g,boxTris(0.06,1.0,0.06),mat(x,0.5,-0.04),C('esc2'));   // ponta de cima
  add(g,boxTris(0.82,0.06,0.06),mat(0,0.97,-0.04),C('mad'));add(g,boxTris(0.76,0.05,0.05),mat(0,0.5,-0.04),C('mad2'));
  return g.data();}
/* piso da plataforma com a abertura (mesmas tábuas e vigas da plataforma inteira; corta o que cai dentro do vão) */
function geoPlatFuro(H){const g=new GB(4096,8),R=rng(4242),C=k=>lin(COR_CASA[k]),[x0,x1,z0,z1]=H,dentro=(a,b,c0,c1)=>a<c1-0.02&&b>c0+0.02;
  const tabZ=(x,a,b,c)=>{if(b-a>0.04)add(g,boxTris(0.28,0.08,b-a),mat(x,-0.04,(a+b)/2),c,{j:0.08,rnd:R});};
  for(let i=0;i<10;i++){const x=-1.35+i*0.3,c=mixc(C('mad'),C('mad2'),R());if(x>=x0&&x<=x1){tabZ(x,-1.5,z0,c);tabZ(x,z1,1.5,c);}else tabZ(x,-1.5,1.5,c);}
  for(const z of[-1.25,0,1.25]){if(dentro(z-0.075,z+0.075,z0,z1)){if(x0>-1.5)add(g,boxTris(x0+1.52,0.14,0.15),mat((x0-1.52)/2,-0.15,z),C('esc'));if(x1<1.5)add(g,boxTris(1.52-x1,0.14,0.15),mat((x1+1.52)/2,-0.15,z),C('esc'));}
    else add(g,boxTris(3.04,0.14,0.15),mat(0,-0.15,z),C('esc'));}
  for(const x of[-1.44,1.44]){if(dentro(x-0.06,x+0.06,x0,x1)){if(z0>-1.5)add(g,boxTris(0.12,0.12,z0+1.52),mat(x,-0.14,(z0-1.52)/2),C('esc'));if(z1<1.5)add(g,boxTris(0.12,0.12,1.52-z1),mat(x,-0.14,(z1+1.52)/2),C('esc'));}
    else add(g,boxTris(0.12,0.12,3.04),mat(x,-0.14,0),C('esc'));}
  // moldura da abertura
  add(g,boxTris(x1-x0+0.1,0.1,0.05),mat((x0+x1)/2,-0.05,z0-0.025),C('esc'));add(g,boxTris(x1-x0+0.1,0.1,0.05),mat((x0+x1)/2,-0.05,z1+0.025),C('esc'));
  add(g,boxTris(0.05,0.1,z1-z0),mat(x0-0.025,-0.05,(z0+z1)/2),C('esc'));add(g,boxTris(0.05,0.1,z1-z0),mat(x1+0.025,-0.05,(z0+z1)/2),C('esc'));
  return g.data();}

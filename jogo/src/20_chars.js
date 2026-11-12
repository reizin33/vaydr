/* ================= personagens, armas e animações ================= */
const BASE={thigh:0.41,shin:0.39,foot:0.08,torsoH:0.56,chestW:0.46,waistW:0.38,depth:0.26,hipW:0.38,hipX:0.105,shX:0.29,uArm:0.31,lArm:0.28,armW:0.12,legW:0.155,headW:0.25,headH:0.28,headD:0.26};
function bonesOf(P){const leg=P.thigh+P.shin+P.foot+0.02;return[
  {p:-1,o:[0,leg,0]},{p:0,o:[0,0.04,0]},{p:1,o:[0,P.torsoH,0]},
  {p:1,o:[P.shX,P.torsoH-0.07,0]},{p:3,o:[0,-P.uArm,0]},{p:1,o:[-P.shX,P.torsoH-0.07,0]},{p:5,o:[0,-P.uArm,0]},
  {p:0,o:[P.hipX,-0.03,0]},{p:7,o:[0,-P.thigh,0]},{p:0,o:[-P.hipX,-0.03,0]},{p:9,o:[0,-P.thigh,0]},
  {p:6,o:[0,-P.lArm-0.05,0]}];}
/* caixa chanfrada (bordas cortadas), com afinamento em cima (tx,tz) e embaixo (bx,bz) */
function fixWind(T){for(const t of T){const a=t[0],b=t[1],c=t[2];const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(nx*(a[0]+b[0]+c[0])+ny*(a[1]+b[1]+c[1])+nz*(a[2]+b[2]+c[2])<0){t[1]=c;t[2]=b;}}return T;}
function bevelTris(w,h,d,b,o){o=o||{};const hx=w/2,hy=h/2,hz=d/2,tx=o.tx??1,tz=o.tz??1,bx=o.bx??1,bz=o.bz??1;b=Math.min(b,hx*0.45,hy*0.45,hz*0.45);
  const V=(a,sx,sy,sz)=>{const kx=sy>0?tx:bx,kz=sy>0?tz:bz;return[sx*(a===0?hx:hx-b)*kx,sy*(a===1?hy:hy-b),sz*(a===2?hz:hz-b)*kz];};
  const T=[],tri=(p,q,r)=>T.push([p,q,r]),quad=(p,q,r,s)=>{tri(p,q,r);tri(p,r,s);};
  for(const s of[1,-1]){quad(V(0,s,-1,-1),V(0,s,1,-1),V(0,s,1,1),V(0,s,-1,1));quad(V(1,-1,s,-1),V(1,1,s,-1),V(1,1,s,1),V(1,-1,s,1));quad(V(2,-1,-1,s),V(2,1,-1,s),V(2,1,1,s),V(2,-1,1,s));}
  for(const sx of[1,-1])for(const sy of[1,-1])quad(V(0,sx,sy,-1),V(1,sx,sy,-1),V(1,sx,sy,1),V(0,sx,sy,1));
  for(const sx of[1,-1])for(const sz of[1,-1])quad(V(0,sx,-1,sz),V(2,sx,-1,sz),V(2,sx,1,sz),V(0,sx,1,sz));
  for(const sy of[1,-1])for(const sz of[1,-1])quad(V(1,-1,sy,sz),V(2,-1,sy,sz),V(2,1,sy,sz),V(1,1,sy,sz));
  for(const sx of[1,-1])for(const sy of[1,-1])for(const sz of[1,-1])tri(V(0,sx,sy,sz),V(1,sx,sy,sz),V(2,sx,sy,sz));
  return fixWind(T);}
/* ---------- formas arredondadas: revolução, elipsoide ---------- */
/* perfil [[r,y,dz,kx,kz],...] de baixo para cima; a0/a1 recortam um arco (remendos que seguem o corpo); dr engorda a peça */
function latheTris(prof,seg,sx,sz,o){o=o||{};sx=sx||1;sz=sz||1;const full=o.a0===undefined,a0=o.a0??0,a1=o.a1??Math.PI*2,dr=o.dr||0,t=[];
  const rings=prof.map(p=>{const r=p[0]>1e-6?p[0]+dr:0,kx=p[3]||1,kz=p[4]||1,a=[];for(let i=0;i<=seg;i++){const ang=a0+(a1-a0)*i/seg;a.push([Math.sin(ang)*r*sx*kx,p[1],Math.cos(ang)*r*sz*kz+(p[2]||0)]);}return a;});
  for(let k=0;k<prof.length-1;k++){const A=rings[k],B=rings[k+1],ra=prof[k][0]>1e-6,rb=prof[k+1][0]>1e-6;
    for(let i=0;i<seg;i++){if(ra&&rb)t.push([A[i],B[i+1],B[i]],[A[i],A[i+1],B[i+1]]);else if(rb)t.push([A[i],B[i+1],B[i]]);else if(ra)t.push([A[i],A[i+1],B[i]]);}}
  if(o.capB&&full&&prof[0][0]>1e-6){const p=prof[0],c=[0,p[1],p[2]||0],L=rings[0];for(let i=0;i<seg;i++)t.push([c,L[i+1],L[i]]);}
  if(o.capT&&full&&prof[prof.length-1][0]>1e-6){const p=prof[prof.length-1],c=[0,p[1],p[2]||0],L=rings[rings.length-1];for(let i=0;i<seg;i++)t.push([c,L[i],L[i+1]]);}
  return t;}
function ellipTris(rx,ry,rz,seg,rings){seg=seg||12;rings=rings||8;const pr=[];for(let i=0;i<=rings;i++){const th=Math.PI*i/rings;pr.push([Math.sin(th),-Math.cos(th)*ry]);}return latheTris(pr,seg,rx,rz);}
/* recorta um perfil-base [[t,k,dz,kx],...] entre t0 e t1 e converte para [r,y,...] */
function perfil(base,t0,t1,R,Y0,H){const at=t=>{for(let i=0;i<base.length-1;i++){const a=base[i],b=base[i+1];if(t>=a[0]-1e-9&&t<=b[0]+1e-9){const u=(t-a[0])/((b[0]-a[0])||1);
      return[t,lerp(a[1],b[1],u),lerp(a[2]||0,b[2]||0,u),lerp(a[3]||1,b[3]||1,u)];}}return base[t<base[0][0]?0:base.length-1];};
  const pts=[at(t0)];for(const p of base)if(p[0]>t0+1e-6&&p[0]<t1-1e-6)pts.push(p);pts.push(at(t1));
  return pts.map(p=>[R*p[1],Y0+H*p[0],p[2]||0,p[3]||1]);}
/* perfil suavizado (corpo do jogador): curva cúbica monotônica entre os pontos-base (sem passar do ponto), três anéis por trecho:
   o corpo fica sem as "quinas" entre um anel e outro. As roupas usam o mesmo perfil, então continuam por cima do corpo. */
const _PSUAVE=new WeakMap();
function perfilSuave(base){let r=_PSUAVE.get(base);if(r)return r;const n=base.length,val=(i,c)=>c===3?(base[i][3]||1):(base[i][c]||0),tg={};
  for(const c of[1,2,3]){const d=[],m=new Array(n).fill(0);for(let i=0;i<n-1;i++){const h=base[i+1][0]-base[i][0];d.push(h>0?(val(i+1,c)-val(i,c))/h:0);}
    m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
    for(let i=0;i<n-1;i++){if(d[i]===0){m[i]=0;m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],q=a*a+b*b;if(q>9){const k=3/Math.sqrt(q);m[i]=k*a*d[i];m[i+1]=k*b*d[i];}}
    tg[c]=m;}
  const out=[];for(let i=0;i<n-1;i++){const t0=base[i][0],h=base[i+1][0]-t0;
    for(let s=0;s<3;s++){const u=s/3,u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2,p=[t0+h*u];
      for(const c of[1,2,3])p.push(h00*val(i,c)+h10*h*tg[c][i]+h01*val(i+1,c)+h11*h*tg[c][i+1]);p[1]=Math.max(0,p[1]);out.push(p);}}
  const L=base[n-1];out.push([L[0],L[1],L[2]||0,L[3]||1]);_PSUAVE.set(base,out);return out;}
const formaDe=(M,f)=>M.suave?perfilSuave(f):f;
/* formas-base do corpo (t de 0 a 1 ao longo de cada parte) */
const F_PELVE=[[0,0.62],[0.18,0.86],[0.45,0.98],[0.7,1.0],[0.88,0.97],[1,0.93]];
const F_TRONCO=[[0,0.86],[0.12,0.84],[0.3,0.9],[0.5,0.98],[0.66,1.0],[0.78,0.97,0,1.05],[0.87,0.86,-0.006,1.08],[0.94,0.6,-0.01,1.05],[0.985,0.34,-0.008],[1,0.26,-0.006]];
const F_CABECA=[[0,0.22,0.02],[0.07,0.52,0.018],[0.17,0.75,0.012],[0.3,0.9,0.006],[0.45,0.98,0],[0.6,1.0,-0.004],[0.74,0.97,-0.008],[0.85,0.86,-0.008],[0.93,0.66,-0.006],[0.98,0.38,-0.003],[1,0,0]];
const F_BRACO=[[0,0.84],[0.08,1.0],[0.2,1.02],[0.42,0.96],[0.62,0.92],[0.82,0.82],[1,0.74]];
const F_ANTEB=[[0,0.78],[0.12,0.86],[0.28,0.88],[0.55,0.76],[0.85,0.62],[1,0.58]];
const F_COXA=[[0,1.08],[0.1,1.1],[0.3,1.02],[0.55,0.92],[0.8,0.8],[1,0.72]];
const F_CANELA=[[0,0.74],[0.12,0.8,-0.004],[0.3,0.85,-0.013],[0.5,0.75,-0.006],[0.78,0.58],[0.94,0.5],[1,0.5]];
/* massa dos ombros e trapézio (no osso do tronco): deixa o ombro caído e redondo em vez de reto */
function ombrosTris(P,dr){const T=P.torsoH,o=[];for(const s of[1,-1]){o.push([ellipTris(0.088+dr,0.075+dr,0.092+dr,14,9),mat(s*(P.shX-0.085),T-0.075,-0.008)]);
    o.push([ellipTris(0.1+dr,0.045+dr,0.07+dr,12,8),mat(s*0.105,T-0.02,-0.018,0,0,-s*0.42)]);}return o;}
/* medidas usadas pelo corpo e pelas roupas */
function corpoMedidas(P){const ra=P.armW*0.5,rl=P.legW*0.5;return{suave:(P.seg||1)>1,
  pelve:{R:P.hipW/2,sz:(P.depth*0.92)/P.hipW,y0:-0.16,h:0.25},tronco:{R:P.chestW/2,sz:P.depth/P.chestW,y0:-0.03,h:P.torsoH+0.03},
  cabeca:{R:P.headW/2,sz:P.headD/P.headW,y0:0.06,h:P.headH},braco:{R:ra,sz:0.95,y0:-P.uArm,h:P.uArm+0.03},antebraco:{R:ra,sz:0.9,y0:-P.lArm,h:P.lArm},
  coxa:{R:rl,sz:0.95,y0:-P.thigh,h:P.thigh+0.04},canela:{R:rl,sz:0.95,y0:-P.shin,h:P.shin}};}
/* peça do corpo (ou da roupa) seguindo a forma-base: t0..t1 em fração da parte, dr engorda */
function parteCorpo(M,forma,nome,t0,t1,dr,seg,o){const m=M[nome];o=o||{};
  let pr=perfil(formaDe(M,forma),t0,t1,m.R,m.y0,m.h);if(nome==='braco'||nome==='antebraco'||nome==='coxa'||nome==='canela')pr=pr.map(p=>[p[0],m.y0+m.h-(p[1]-m.y0),p[2],p[3]]).reverse();
  return latheTris(pr,seg||12,1,m.sz,Object.assign({dr},o));}
function frenteCabeca(M,t,x,FC){const m=M.cabeca,p=perfil(formaDe(M,FC||F_CABECA),t,t,m.R,m.y0,m.h)[0],r=p[0],q=x/Math.max(r,1e-4);return{y:p[1],z:r*m.sz*Math.sqrt(Math.max(0,1-q*q))+p[2]};}
function buildHuman(P,extras){const g=new GB(16384,8),R=P.rnd,c=k=>lin(P.c[k]),M=corpoMedidas(P),SG=P.seg||1;   // seg: mais lados nas peças (o corpo do jogador fica mais redondo)
  const put=(b,tris,m,col,e,j)=>add(g,tris,m,col,{b,e:e||0,j:j===undefined?0.04:j,rnd:R});
  const pele=c('skin'),pe=P.descalco;
  // quadril
  put(0,parteCorpo(M,F_PELVE,'pelve',0,1,0,Math.round(14*SG),{capB:true,capT:true}),ID,c('pants'));
  if(P.cinto!==false)put(0,latheTris([[M.pelve.R*0.95,0.05],[M.pelve.R*0.96,0.088]],14,1,M.pelve.sz,{dr:0.006}),ID,c('belt'));
  if(P.cueca)put(0,latheTris([[M.pelve.R*0.95,0.055],[M.pelve.R*0.96,0.085]],14,1,M.pelve.sz,{dr:0.004}),ID,lin(P.cueca));
  // tronco (peito, cintura, ombros) e pescoço
  put(1,parteCorpo(M,F_TRONCO,'tronco',0,1,0,Math.round(18*SG),{capB:true,capT:true}),ID,c('shirt'));for(const[t,m]of ombrosTris(P,0))put(1,t,m,c('shirt'));
  put(2,latheTris([[0.057,-0.07],[0.052,0.02],[0.055,0.09]],10,1,1.05),ID,pele);
  // cabeça arredondada com rosto
  const H=M.cabeca,FC=P.fCab||F_CABECA;put(2,parteCorpo(M,FC,'cabeca',0,1,0,Math.round(16*SG),{capB:true}),ID,pele);
  const te=0.53,olho=frenteCabeca(M,te,0.045,FC),SB=P.sobr||{w:0.05,h:0.012,a:0.12,dy:0.1};
  for(const s of[1,-1]){const x=s*0.045;
    if(P.sclera){put(2,ellipTris(0.021,0.0125,0.01,10,6),mat(x,olho.y,olho.z-0.006),P.sclera,0,0);
      put(2,ellipTris(0.0095,0.0105,0.006,8,5),mat(x-s*0.003,olho.y,olho.z+0.0025),P.eye,P.eyeE,0);
      if(P.palpebras){put(2,ellipTris(0.0235,0.0068,0.0125,10,5),mat(x,olho.y+0.0082,olho.z-0.0035,-0.32,0,0),scl(pele,0.86),0,0);put(2,ellipTris(0.021,0.0042,0.0105,10,4),mat(x,olho.y-0.0098,olho.z-0.004,0.2,0,0),scl(pele,0.92),0,0);}}   // pálpebras: olho menos arregalado
    else put(2,ellipTris(0.02,0.012,0.01,10,6),mat(x,olho.y,olho.z-0.004),P.eye,P.eyeE,0);
    const sb=frenteCabeca(M,te+SB.dy,s*0.045,FC);put(2,bevelTris(SB.w,SB.h,0.016,0.005),mat(x,sb.y,sb.z-0.002,0,0,-s*SB.a),P.brow||scl(pele,0.42),0,0);
    put(2,ellipTris(0.016,0.031,0.025,8,6),mat(s*H.R*0.97,olho.y-0.012,-0.012,0,s*0.25,0),scl(pele,0.94));}
  const NZ=P.nariz||{w:0.034,h:0.06,d:0.042},na=frenteCabeca(M,0.4,0,FC);put(2,bevelTris(NZ.w,NZ.h,NZ.d,0.013,{tx:0.55,tz:0.62}),mat(0,na.y,na.z+0.006,-0.12,0,0),scl(pele,0.97));
  const BC=P.boca||{w:0.026,h:0.0075},bo=frenteCabeca(M,0.25,0,FC);put(2,ellipTris(BC.w,BC.h,0.009,10,5),mat(0,bo.y,bo.z-0.001),P.labio||lin(0x9a5a48),0,0);
  cabeloGeo(put,M,P,FC);barbaGeo(put,M,P,FC,pele);
  // braços: ombro, braço, cotovelo, antebraço e mão com polegar
  for(const s of[1,-1]){const up=s>0?3:5,lo=s>0?4:6,side=s>0?'L':'R',ra=M.braco.R;
    put(up,ellipTris(ra*1.12,ra*1.25,ra*1.06,12,8),mat(-s*0.008,-0.01,0),c('sleeve'+side));
    put(up,parteCorpo(M,F_BRACO,'braco',0,1,0,Math.round(12*SG),{capB:true}),ID,c('sleeve'+side));
    put(lo,ellipTris(ra*0.77,ra*0.84,ra*0.74,10,6),ID,c('fore'+side));
    put(lo,parteCorpo(M,F_ANTEB,'antebraco',0,1,0,Math.round(12*SG),{capB:true}),ID,c('fore'+side));
    const hy=-P.lArm-0.05;
    put(lo,ellipTris(0.036,0.05,0.019,10,6),mat(0,hy+0.004,0.004),pele);
    put(lo,ellipTris(0.033,0.034,0.016,10,6),mat(0,hy-0.05,0.012,0.35,0,0),pele);
    put(lo,ellipTris(0.012,0.028,0.012,8,5),mat(s*-0.034,hy-0.004,0.02,0.3,0,s*0.55),pele);}
  // pernas: coxa, joelho, canela e pé (descalço ou de sapato)
  for(const s of[1,-1]){const up=s>0?7:9,lo=s>0?8:10,side=s>0?'L':'R',rl=M.coxa.R;
    const cb=P.cueca?0.17:0.42;   // cueca (jogador): a bermuda de verdade é uma peça vestida por cima
    put(up,parteCorpo(M,F_COXA,'coxa',0,P.bermuda?cb:1,0,Math.round(12*SG),{capT:true,capB:!P.bermuda}),ID,c('pants'));
    if(P.bermuda){put(up,parteCorpo(M,F_COXA,'coxa',cb,1,0,Math.round(12*SG),{capB:true}),ID,pele);put(up,parteCorpo(M,F_COXA,'coxa',cb-(P.cueca?0.04:0.07),cb+0.02,P.cueca?0.004:0.007,12),ID,P.cueca?lin(P.cueca):c('pants'));}
    put(lo,ellipTris(rl*0.75,rl*0.82,rl*0.76,10,6),ID,P.bermuda?pele:c('pants'));
    put(lo,parteCorpo(M,F_CANELA,'canela',0,1,0,Math.round(12*SG),{capB:true}),ID,c('shin'+side));
    const fy=-P.shin-P.foot/2;
    if(pe){put(lo,ellipTris(0.047,0.036,0.112,12,8),mat(0,fy+0.002,0.045),pele);put(lo,ellipTris(0.045,0.021,0.042,10,6),mat(0,fy-0.013,0.135),pele);}
    else{put(lo,ellipTris(0.054,0.042,0.125,12,8),mat(0,fy+0.004,0.05),c('shoes'));put(lo,ellipTris(0.056,0.014,0.128,12,6),mat(0,-P.shin-P.foot+0.006,0.05),scl(c('shoes'),0.45));}}
  if(extras)extras(put,P,P.depth/2,c,M);
  return g.data();}

/* cabelo: 0 curto bagunçado, 1 raspado, 2 médio, 3 comprido, 4 careca, 5 rabo de cavalo (sem estilo: o corte curto de sempre) */
function cabeloGeo(put,M,P,FC){if(!P.cabelo)return;const c=lin(P.cabelo),e=P.cabeloEst,R=P.rnd,Hc=M.cabeca;
  if(e===4)return;
  if(e===1){const cc=mixc(c,lin(P.c.skin),0.35);put(2,parteCorpo(M,FC,'cabeca',0.64,1,0.0025,16),ID,cc,0,0.03);put(2,parteCorpo(M,FC,'cabeca',0.4,0.66,0.0025,12,{a0:1.25,a1:Math.PI*2-1.25}),ID,cc,0,0.03);return;}
  const longo=e===2||e===3||e===5;
  if(!P.chapeu)put(2,parteCorpo(M,FC,'cabeca',0.66,1,longo?0.011:e===0?0.008:0.006,16),ID,c,0,0.06);   // com chapéu/boné só fica o cabelo dos lados e da nuca
  put(2,parteCorpo(M,FC,'cabeca',longo?0.24:0.36,P.chapeu?0.6:0.68,longo?0.011:0.006,12,{a0:1.2,a1:Math.PI*2-1.2}),ID,c,0,0.06);
  if((e===0||e===2)&&!P.chapeu){const top=Hc.y0+Hc.h;
    for(let i=0;i<11;i++){const a=R()*6.283,f=0.15+R()*0.6,rr=Hc.R*f,y=top-0.012-f*f*0.07;put(2,bevelTris(0.04+R()*0.03,0.022+R()*0.02,0.05+R()*0.03,0.008),mat(Math.cos(a)*rr,y,Math.sin(a)*rr*Hc.sz,R()*0.7-0.35,a,R()*0.7-0.35),scl(c,0.9+R()*0.2),0,0.1);}
    for(let i=0;i<4;i++){const x=(i-1.5)*0.034,f=frenteCabeca(M,0.85,x,FC);put(2,bevelTris(0.034,0.046,0.014,0.006),mat(x,f.y-0.012,f.z-0.002,0.42,0,(R()-0.5)*0.45),c,0,0.08);}}
  if(e===3){put(2,bevelTris(P.headW+0.035,0.36,0.07,0.03),mat(0,0.06+P.headH*0.36,-P.headD/2+0.012),c,0,0.06);
    for(const sx of[0.132,-0.132])put(2,bevelTris(0.045,0.3,0.12,0.02),mat(sx,0.06+P.headH*0.36,-0.04),c,0,0.06);}
  if(e===5){put(2,latheTris([[0.035,0],[0.042,0.06],[0.032,0.2],[0.012,0.3]],10,1,1,{capB:true,capT:true}),mat(0,0.06+P.headH*0.6,-P.headD/2+0.005,-2.55,0,0),c,0,0.06);
    put(2,cylTris(0.026,0.026,0.025,8),mat(0,0.06+P.headH*0.6,-P.headD/2-0.004,Math.PI/2,0,0),lin(0x1a1a1a),0,0);}}
/* barba: 0 sem, 1 por fazer, 2 cavanhaque e bigode, 3 curta, 4 cheia (sem estilo: a curta de sempre) */
function barbaGeo(put,M,P,FC,pele){if(!P.barba)return;const e=P.barbaEst??3,c=lin(P.barba);if(e===0)return;
  if(e===1){put(2,parteCorpo(M,FC,'cabeca',0.03,0.34,0.0018,14,{a0:-1.9,a1:1.9}),ID,mixc(c,pele,0.42),0,0.14);return;}
  const mo=frenteCabeca(M,0.295,0,FC);
  if(e===2){put(2,parteCorpo(M,FC,'cabeca',0.02,0.2,0.006,10,{a0:-0.6,a1:0.6}),ID,c,0,0.08);put(2,bevelTris(0.07,0.014,0.014,0.005),mat(0,mo.y,mo.z+0.002),c,0,0);return;}
  if(e===3){put(2,parteCorpo(M,FC,'cabeca',0.02,0.33,0.0035,14,{a0:-1.95,a1:1.95}),ID,c,0,0.08);return;}
  put(2,parteCorpo(M,FC,'cabeca',0.0,0.37,0.011,14,{a0:-2.1,a1:2.1}),ID,c,0,0.1);const qx=frenteCabeca(M,0.06,0,FC);
  put(2,ellipTris(0.06,0.045,0.04,10,6),mat(0,qx.y-0.02,qx.z-0.025),c,0,0.12);put(2,bevelTris(0.085,0.018,0.018,0.006),mat(0,mo.y,mo.z+0.003),c,0,0);}
function survivorSpec(){return{...BASE,torsoH:0.58,chestW:0.5,waistW:0.42,depth:0.27,hipW:0.4,hipX:0.11,shX:0.31,armW:0.14,legW:0.18,headW:0.26,headH:0.29,headD:0.275,thigh:0.42,shin:0.4,
  rnd:rng(4),eye:lin(0x3a2616),eyeE:0,sclera:lin(0xeae5da),brow:lin(0x2a1d14),labio:lin(0x9c5e4a),cabelo:0x2b1d14,barba:0x3a2a20,bermuda:true,descalco:true,cinto:false,
  c:{skin:0xc68c60,shirt:0xc68c60,sleeveL:0xc68c60,sleeveR:0xc68c60,foreL:0xc68c60,foreR:0xc68c60,pants:0x2f3a48,shinL:0xc68c60,shinR:0xc68c60,shoes:0x4a3324,belt:0x1f1a17}};}
function survivorExtras(put,P,d,c,M){const T=P.torsoH,fz=M.tronco.R*M.tronco.sz;if(P.semLanterna)return;
  // lanterna pendurada num cordão no pescoço
  put(1,latheTris([[0.074,T-0.012],[0.074,T+0.004]],14,1,1.05,{dr:0.004}),ID,lin(0x2a2522),0);
  for(const s of[1,-1])put(1,bevelTris(0.008,0.16,0.008,0.003),mat(s*0.035,T-0.09,fz*0.82+0.012,-0.32,0,s*0.18),lin(0x2a2522),0);
  put(1,latheTris([[0.026,-0.05],[0.028,0.04],[0.034,0.06]],10,1,1,{capB:true,capT:true}),mat(0,T-0.19,fz*0.96+0.03,Math.PI/2,0,0),lin(0x2b2d31));
  put(1,cylTris(0.03,0.03,0.008,10),mat(0,T-0.19,fz*0.96+0.093,Math.PI/2,0,0),lin(0xfff2c8),1.6,0);}
const EYE_Z=lin(0xfff0a8);
function zombieSpec(type,seed){const R=rng(seed);
  const skin=pick(R,[0x8b9a76,0x7f8e6c,0x96a283,0x7a8a6e]),shirt=pick(R,[0x4e5e70,0x6a5642,0x5d5a52,0x46404f,0x5f6b4e,0x7a6a5a]),pants=pick(R,[0x39372f,0x2d3340,0x3f3a33,0x2f3a2f]);
  const P={...BASE,rnd:R,eye:EYE_Z,eyeE:1.6,brow:lin(0x3a3f30),labio:lin(0x3a2420),mouthW:0.1,mouthH:0.035,stains:3,hair:R()<0.6?pick(R,[0x2a221c,0x3b2a1a,0x55483a]):0,longHair:R()<0.3,type,rips:2+Math.floor(R()*3),ribs:R()<0.3,
    c:{skin,shirt,sleeveL:shirt,sleeveR:R()<0.3?skin:shirt,foreL:R()<0.4?skin:shirt,foreR:shirt,pants,shinL:R()<0.35?skin:pants,shinR:pants,shoes:0x24211d,belt:0x1d1b18}};
  if(type==='runner'){Object.assign(P,{chestW:0.4,waistW:0.32,depth:0.22,armW:0.105,legW:0.14,shX:0.26,longHair:false});
    Object.assign(P.c,{shirt:0x8a8678,sleeveL:skin,sleeveR:skin,foreL:skin,foreR:skin,shinL:skin,shinR:skin});}
  if(type==='brute'){Object.assign(P,{chestW:0.66,waistW:0.58,depth:0.38,hipW:0.48,hipX:0.13,shX:0.4,armW:0.17,legW:0.2,uArm:0.33,lArm:0.3,stains:4,scale:1.3,hair:0,longHair:false,ribs:false});
    Object.assign(P.c,{skin:0x7f8c6a,shirt:0x6c3b2b,sleeveL:0x7f8c6a,sleeveR:0x7f8c6a,foreL:0x7f8c6a,foreR:0x7f8c6a,pants:0x384a5f,shinL:0x384a5f,shinR:0x384a5f});}
  if(type==='brute'||type==='screamer'){}
  if(type==='screamer'){Object.assign(P,{chestW:0.4,waistW:0.33,armW:0.105,uArm:0.35,lArm:0.32,legW:0.14,mouthW:0.11,mouthH:0.09,stains:2,hair:0x1f1a17,longHair:true});
    Object.assign(P.c,{skin:0xa3ad91,shirt:0x93a7aa,sleeveL:0x93a7aa,sleeveR:0x93a7aa,foreL:0xa3ad91,foreR:0xa3ad91,pants:0x93a7aa,shinL:0xa3ad91,shinR:0xa3ad91});}
  P.cabelo=P.hair||0;return P;}
function zombieExtras(put,P,d){const hy=0.08,R=P.rnd,sk=lin(P.c.skin);
  // boca aberta com dentes
  put(2,boxTris(P.mouthW,P.mouthH,0.02),mat(0,hy+P.headH*0.22,P.headD/2*0.93+0.01),lin(0x2a1414),0,0);
  for(let i=0;i<4;i++)put(2,boxTris(0.016,0.016,0.012),mat(-P.mouthW*0.36+i*P.mouthW*0.24,hy+P.headH*0.22+P.mouthH*0.36,P.headD/2*0.93+0.02),lin(0xcfc6a8),0,0);
  // manchas de sangue, rasgos na roupa mostrando pele, costelas
  for(let i=0;i<P.stains;i++)put(1,boxTris(0.06+R()*0.1,0.05+R()*0.12,0.02),mat((R()-0.5)*P.chestW*0.6,0.1+R()*P.torsoH*0.7,d*0.95+0.01),lin(R()<0.6?0x4a1410:0x2b2722),0,0);
  for(let i=0;i<P.rips;i++){const fr=R()<0.6,y=0.08+R()*P.torsoH*0.7;put(1,boxTris(0.05+R()*0.08,0.04+R()*0.08,0.015),mat((R()-0.5)*P.chestW*0.7,y,fr?d*0.94+0.012:-d*0.94-0.012),sk,0,0);}
  if(P.ribs){put(1,boxTris(0.16,0.15,0.016),mat(0.05,P.torsoH*0.5,d*0.94+0.014),lin(0x5a1a14),0,0);
    for(let i=0;i<3;i++)put(1,boxTris(0.13,0.016,0.018),mat(0.05,P.torsoH*0.44+i*0.045,d*0.94+0.02),lin(0xd8cfb4),0,0);}
  if(P.longHair&&P.hair){put(2,bevelTris(P.headW+0.03,0.34,0.07,0.03),mat(0,0.06+P.headH*0.42,-P.headD/2+0.005),lin(P.hair));
    for(const sx of[0.135,-0.135])put(2,bevelTris(0.045,0.28,0.12,0.02),mat(sx,0.06+P.headH*0.4,-0.05),lin(P.hair));}
  if(P.type==='brute'){put(1,boxTris(P.chestW*0.62,P.torsoH*0.5,0.03),mat(0,P.torsoH*0.28,d*0.95),lin(0x384a5f));
    for(const sx of[0.17,-0.17])put(1,boxTris(0.06,P.torsoH*0.5,0.03),mat(sx,P.torsoH*0.72,d*0.97),lin(0x384a5f));
    put(1,icoTris(0.2,0.1,R),mat(0,P.torsoH*0.22,d*0.6,0,0,0,1.2,0.9,0.8),lin(0x6c3b2b));}
  if(P.type==='screamer')put(0,bevelTris(P.hipW+0.08,0.5,P.depth+0.06,0.03,{bx:1.12,bz:1.1}),mat(0,-0.3,0),lin(0x8a9ea1));}
/* armas no espaço da mão (osso 11): cabo ao longo de +z; pistola com o cano em -y */
function weaponGeometry(){const W={},R=rng(12);
  const mk=f=>{const g=new GB(512,8);f(g);return g.data();};
  const wood=lin(0x6b4a2c),steel=lin(0x8d969f),dark=lin(0x2a2c30);
  W.machado=mk(g=>{add(g,cylTris(0.024,0.028,0.82,6),mat(0,0,-0.14,Math.PI/2,0,0),wood);
    add(g,boxTris(0.035,0.25,0.12),mat(0,-0.06,0.62),steel);add(g,boxTris(0.04,0.07,0.08),mat(0,0.07,0.62),lin(0xa8261d));});
  W.picareta=mk(g=>{add(g,cylTris(0.024,0.028,0.82,6),mat(0,0,-0.14,Math.PI/2,0,0),wood);
    add(g,boxTris(0.04,0.5,0.05,{tx:0.4}),mat(0,-0.17,0.64,0,0,0),steel);add(g,boxTris(0.04,0.22,0.05,{tx:0.4}),mat(0,0.16,0.64,Math.PI,0,0),steel);});
  W.machadoPedra=mk(g=>{add(g,cylTris(0.022,0.027,0.7,6),mat(0,0,-0.12,Math.PI/2,0,0),lin(0x7a5634),{j:0.08,rnd:R});
    add(g,boxTris(0.06,0.21,0.12,{tx:0.55,tz:0.75}),mat(0,-0.07,0.5,0,0,Math.PI),lin(0x7b7d78),{j:0.12,rnd:R});
    add(g,boxTris(0.065,0.05,0.135),mat(0,0.035,0.5),lin(0x8a6a3e));add(g,boxTris(0.065,0.035,0.05),mat(0,0.035,0.43,0.6,0,0),lin(0x8a6a3e));});
  W.porrete=mk(g=>{add(g,cylTris(0.025,0.062,0.76,7),mat(0,0,0.66,-Math.PI/2,0,0),lin(0x6a4a2e),{j:0.12,rnd:R});
    add(g,boxTris(0.05,0.045,0.06),mat(0.048,0.008,0.56),lin(0x553a22));add(g,boxTris(0.045,0.045,0.05),mat(-0.03,0.04,0.44),lin(0x553a22));
    add(g,boxTris(0.06,0.03,0.035),mat(0,-0.03,-0.02),lin(0x3d2b1a));});
  W.faca=mk(g=>{add(g,boxTris(0.03,0.04,0.12),mat(0,0,0),dark);add(g,boxTris(0.008,0.035,0.2,{tx:0.2}),mat(0,-0.005,0.16),lin(0xc4cad0));});
  W.facaPedra=mk(g=>{add(g,cylTris(0.016,0.019,0.13,8),mat(0,0,-0.03,Math.PI/2,0,0),lin(0x6b4a2c));add(g,cylTris(0.021,0.021,0.035,8),mat(0,0,0.075,Math.PI/2,0,0),lin(0x8a7350));
    add(g,bevelTris(0.016,0.04,0.15,0.006,{tx:0.4}),mat(0,-0.004,0.17),lin(0x6f6e68),{j:0.15,rnd:R});});
  W.lanca=mk(g=>{add(g,cylTris(0.018,0.022,1.75,7),mat(0,0,-0.55,Math.PI/2,0,0),lin(0x7a5634),{j:0.08,rnd:R});
    add(g,cylTris(0,0.03,0.17,4),mat(0,0,1.2,Math.PI/2,0,0),lin(0x75746d),{j:0.12,rnd:R,flat:true});add(g,cylTris(0.026,0.026,0.07,7),mat(0,0,1.17,Math.PI/2,0,0),lin(0xb9a56a));});
  W.pedra=mk(g=>{add(g,icoTris(0.07,0.3,R),mat(0,0.01,0.03,0.3,0.5,0.2,1.05,0.85,1.2),lin(0x7b7d78),{j:0.12,rnd:R,crease:40});});
  W.peDeCabra=mk(g=>{add(g,cylTris(0.016,0.016,0.78,7),mat(0,0,0.62,-Math.PI/2,0,0),lin(0x5f6a73),{j:0.04,rnd:R});add(g,boxTris(0.03,0.09,0.03),mat(0,0.04,0.63),lin(0x5f6a73));add(g,boxTris(0.04,0.025,0.1),mat(0,-0.015,0.0),lin(0x8a2a22));});
  W.taco=mk(g=>{add(g,cylTris(0.022,0.05,0.86,8),mat(0,0,0.74,-Math.PI/2,0,0),lin(0x9a7448),{j:0.05,rnd:R});});
  W.tacoCravado=mk(g=>{add(g,cylTris(0.022,0.05,0.86,8),mat(0,0,0.74,-Math.PI/2,0,0),lin(0x8a6640),{j:0.05,rnd:R});
    for(let i=0;i<14;i++){const z=0.43+(i%7)*0.045,a=i*2.39996+(i%2)*0.6,r=(0.022+0.028*((z+0.12)/0.86))*0.8;
      add(g,cylTris(0.0035,0.0045,0.075,4),mat(Math.cos(a)*r,Math.sin(a)*r,z,0,0,a-Math.PI/2),lin(0x9aa0a6));}
    add(g,cylTris(0.025,0.025,0.12,8),mat(0,0,-0.01,-Math.PI/2,0,0),lin(0x2b2b2b));});
  W.facao=mk(g=>{add(g,boxTris(0.03,0.04,0.14),mat(0,0,0),dark);add(g,boxTris(0.006,0.06,0.5,{tx:0.6}),mat(0,-0.01,0.32),lin(0xb4bac0));});
  W.pistola=mk(g=>{add(g,boxTris(0.034,0.05,0.11),mat(0,0.01,0),dark);add(g,boxTris(0.038,0.21,0.045),mat(0,-0.06,0.075),lin(0x3a3d42));
    add(g,boxTris(0.03,0.02,0.04),mat(0,-0.03,0.02),dark);});
  W.molotov=mk(g=>{add(g,cylTris(0.036,0.036,0.15,9),mat(0,0,-0.05,Math.PI/2,0,0),lin(0x2f5a3c),{j:0.04,rnd:R});add(g,cylTris(0.013,0.033,0.035,9),mat(0,0,0.1,Math.PI/2,0,0),lin(0x2f5a3c));
    add(g,cylTris(0.013,0.013,0.05,7),mat(0,0,0.135,Math.PI/2,0,0),lin(0x2f5a3c));add(g,boxTris(0.03,0.03,0.07,{tx:0.6}),mat(0,0.005,0.2,0.2,0,0.3),lin(0xd8c8a8),{j:0.1,rnd:R});
    add(g,boxTris(0.02,0.02,0.035),mat(0,0.01,0.245),lin(0xff7a20),{e:2.2});add(g,cylTris(0.032,0.032,0.07,9),mat(0,0,-0.03,Math.PI/2,0,0),lin(0x8a5a1a),{e:0.05});});
  W.braco=mk(g=>{add(g,boxTris(0.085,0.1,0.075),mat(0,0,0),lin(0xc48a5e));add(g,boxTris(0.105,0.38,0.105),mat(0,0.25,0),lin(0xa8441f));
    add(g,boxTris(0.115,0.06,0.115),mat(0,0.09,0),lin(0x7e3016));});
  return W;}
const WGRIP={pistola:[0,-0.17,0.075]};

/* ---------- poses (12 ossos × 3 rotações) ---------- */
const S3=(o,i,x,y,z)=>{o[i*3]=x;o[i*3+1]=y;o[i*3+2]=z;};
const lerpPose=(o,a,b,t)=>{for(let i=0;i<36;i++)o[i]=a[i]+(b[i]-a[i])*t;};
function poseLoco(o,ph,amp,t,run){o.fill(0);const rk=typeof run==='number'?clamp(run,0,1):(run?1:0),s=Math.sin(ph),c=Math.cos(ph),id=1-Math.min(1,amp*1.5);
  // parado não é estátua: respira, troca o peso de perna, os braços balançam soltos e a cabeça olha em volta devagar
  const br=Math.sin(t*1.6)*0.02*id,pe=Math.sin(t*0.37)*0.04*id,ol=(Math.sin(t*0.23)*0.12+Math.sin(t*0.71)*0.04)*id;
  // andando/correndo: o quadril gira e balança de lado, o tronco compensa ao contrário, a cabeça segura o olhar e os cotovelos dobram mais no braço que vai para trás
  S3(o,0,0,s*0.07*amp,c*0.045*amp+pe);S3(o,1,0.04+lerp(0.06,0.2,rk)*amp+br,-s*0.1*amp,-c*0.035*amp-pe*0.6);S3(o,2,-lerp(0.04,0.12,rk)*amp-br*0.5,s*0.05*amp+ol,c*0.02*amp);
  const ab=0.1+0.04*amp,bS=s*lerp(0.52,0.72,rk)*amp,cot=lerp(0.32,1.0,rk)*amp;
  S3(o,3,-0.06+bS+Math.sin(t*1.6+0.4)*0.03*id,0,ab);S3(o,4,-0.28-cot-Math.max(0,s)*0.22*amp,0,0);
  S3(o,5,-0.06-bS+Math.sin(t*1.6+1.1)*0.03*id,0,-ab);S3(o,6,-0.28-cot-Math.max(0,-s)*0.22*amp,0,0);
  S3(o,7,-s*0.62*amp-pe*0.4,0,0.03);S3(o,8,(0.08+Math.max(0,Math.sin(ph+1.3))*0.95)*amp+0.04+Math.max(0,pe)*1.2,0,0);
  S3(o,9,s*0.62*amp+pe*0.4,0,-0.03);S3(o,10,(0.08+Math.max(0,Math.sin(ph+1.3+Math.PI))*0.95)*amp+0.04+Math.max(0,-pe)*1.2,0,0);}
/* golpe corpo a corpo: s de 0 a 1; vertical para machado/picareta, horizontal para o resto */
function poseMelee(o,s,vertical){let ux,uz,fo,pr,ch,cy;
  /* golpe de cima (machado): v10.1 o tronco também gira (o ombro direito vai para trás no preparo e vem na descida), para o golpe ter peso */
  if(vertical){let tw;if(s<0.4){const k=easeIO(s/0.4);ux=lerp(-0.4,-2.9,k);fo=lerp(-0.7,-0.5,k);ch=lerp(0.05,-0.15,k);pr=0;tw=lerp(0,0.32,k);}
    else{const k=easeOut(Math.min(1,(s-0.4)/0.22)),v=1-smooth(0.7,1,s);ux=lerp(-2.9,-0.7,k);fo=lerp(-0.5,-0.2,k);ch=lerp(-0.15,0.4,k);pr=lerp(0,1.2,k);tw=lerp(0.32,-0.22,k)*v;}
    S3(o,1,ch,tw,0);S3(o,2,-ch*0.4,-tw*0.5,0);S3(o,3,ux,0,-0.18);S3(o,4,fo,0,0);S3(o,5,ux,0,0.12);S3(o,6,fo,0,0);S3(o,11,pr,0,0);return;}
  if(s<0.38){const k=easeIO(s/0.38);cy=lerp(0,-0.7,k);ux=lerp(-0.35,-1.3,k);uz=lerp(-0.12,-0.75,k);fo=lerp(-0.9,-0.55,k);pr=lerp(0,0.5,k);}
  else{const k=easeOut(Math.min(1,(s-0.38)/0.2));cy=lerp(-0.7,0.65,k);ux=lerp(-1.3,-1.45,k);uz=lerp(-0.75,0.35,k);fo=lerp(-0.55,-0.15,k);pr=lerp(0.5,0.9,k);}
  S3(o,1,0.08,cy,0);S3(o,2,0,-cy*0.5,0);S3(o,3,-0.4,0,0.2);S3(o,4,-0.8,0,0);S3(o,5,ux,0,uz);S3(o,6,fo,0,0);S3(o,11,pr,0,0);}
function poseAim(o,k,recoil){S3(o,5,lerp(o[15],-1.48-recoil*0.25,k),0,lerp(o[17],0.12,k));S3(o,6,lerp(o[18],-0.02,k),0,0);S3(o,11,0,0,0);
  S3(o,3,lerp(o[9],-1.3,k),0,lerp(o[11],-0.45,k));S3(o,4,lerp(o[12],-0.35,k),0,0);}
function poseUse(o,k){S3(o,5,lerp(o[15],-1.25,k),0,lerp(o[17],0.45,k));S3(o,6,lerp(o[18],-1.95,k),0,0);S3(o,2,lerp(o[6],-0.25,k),0,0);}
function posePush(o,k){S3(o,3,lerp(o[9],-1.55,k),0,lerp(o[11],0.1,k));S3(o,4,lerp(o[12],-0.1,k),0,0);S3(o,5,lerp(o[15],-1.55,k),0,lerp(o[17],-0.1,k));S3(o,6,lerp(o[18],-0.1,k),0,0);S3(o,1,lerp(o[3],0.25,k),0,0);}
const ZP={walker:{lean:0.25,arm:1.25,arm2:1.12,spread:0.08,leg:0.45,sway:1,tilt:0.12},
  runner:{lean:0.48,arm:0.9,arm2:1.3,spread:0.18,leg:0.8,sway:1.4,tilt:-0.15},
  brute:{lean:0.32,arm:0.55,arm2:0.7,spread:0.3,leg:0.32,sway:0.7,tilt:0.08},
  screamer:{lean:0.2,arm:0.4,arm2:0.4,spread:0.12,leg:0.4,sway:1,tilt:0.2}};
function poseZWalk(o,ph,P,amp){o.fill(0);const s=Math.sin(ph),c=Math.cos(ph);
  S3(o,0,0,s*0.08,s*0.06*P.sway);S3(o,1,P.lean+Math.sin(ph*2)*0.04,-s*0.1,s*0.1*P.sway);S3(o,2,0.18,0,P.tilt+Math.sin(ph*0.5)*0.15);
  S3(o,3,-P.arm+s*0.14,0,P.spread);S3(o,4,-0.25-c*0.1,0,0);S3(o,5,-P.arm2-s*0.14,0,-P.spread);S3(o,6,-0.35+c*0.1,0,0);
  S3(o,7,-s*P.leg*amp,0,0);S3(o,8,0.2+Math.max(0,Math.sin(ph+1.2))*P.leg*1.1*amp,0,0);S3(o,9,s*P.leg*amp,0,0);S3(o,10,0.2+Math.max(0,Math.sin(ph+1.2+Math.PI))*P.leg*1.1*amp,0,0);}
function poseZIdle(o,t,P){o.fill(0);const s=Math.sin(t*1.1);
  S3(o,0,0,0,s*0.04);S3(o,1,P.lean*0.8+s*0.03,0,s*0.05);S3(o,2,0.25,Math.sin(t*0.5)*0.3,P.tilt+s*0.1);
  S3(o,3,-0.3,0,0.12);S3(o,4,-0.3,0,0);S3(o,5,-0.25,0,-0.12);S3(o,6,-0.35,0,0);S3(o,8,0.12,0,0);S3(o,10,0.12,0,0);}
/* ataque: k de 0 (preparo) a 1 (golpe) */
function poseZAttack(o,k,P){o.fill(0);const w=k<0.7?easeIO(k/0.7):1-easeOut((k-0.7)/0.3)*0.4;
  const up=k<0.7?lerp(-1.2,-2.5,w):lerp(-2.5,-1.0,easeOut((k-0.7)/0.3));
  S3(o,1,k<0.7?lerp(P.lean,-0.1,w):lerp(-0.1,P.lean+0.35,easeOut((k-0.7)/0.3)),0,0);S3(o,2,0.1,0,0.1);
  S3(o,3,up,0,0.2);S3(o,4,-0.4,0,0);S3(o,5,up,0,-0.2);S3(o,6,-0.4,0,0);
  S3(o,7,-0.3,0,0.04);S3(o,8,0.35,0,0);S3(o,9,0.2,0,-0.04);S3(o,10,0.25,0,0);}
function poseZPound(o,ph,P){o.fill(0);
  S3(o,1,P.lean+0.12+Math.sin(ph*2)*0.06,0,Math.sin(ph)*0.05);S3(o,2,0.1,0,Math.sin(ph)*0.2);
  S3(o,3,-1.7-Math.max(0,Math.sin(ph))*0.9,0,0.15);S3(o,4,-0.5,0,0);S3(o,5,-1.7-Math.max(0,Math.sin(ph+Math.PI))*0.9,0,-0.15);S3(o,6,-0.5,0,0);
  S3(o,7,-0.25,0,0.04);S3(o,8,0.35,0,0);S3(o,9,0.15,0,-0.04);S3(o,10,0.2,0,0);}
function poseZScream(o,t,k){o.fill(0);const sw=Math.sin(t*1.3);
  S3(o,0,0,0,sw*0.05);S3(o,1,0.25*(1-k)-0.42*k,0,sw*0.06);S3(o,2,0.3*(1-k)-0.75*k,0,0.25*(1-k));
  S3(o,3,-0.2*(1-k)-0.5*k,0,0.15+k);S3(o,4,-0.2-0.4*k,0,0);S3(o,5,-0.2*(1-k)-0.5*k,0,-0.15-k);S3(o,6,-0.2-0.4*k,0,0);
  S3(o,7,0.05,0,0);S3(o,8,0.08,0,0);S3(o,9,-0.05,0,0);S3(o,10,0.08,0,0);}

/* ---------- personagem: malha compartilhada + ossos próprios ---------- */
const ROOT=M4(),LOC=M4();
function newChar(meshInfo,scale){return{mesh:meshInfo.mesh,bones:meshInfo.bones,r:new Float32Array(36),m:new Float32Array(192),x:0,y:0,z:0,yaw:0,pitch:0,roll:0,s:scale||1,hipY:0,vis:true,tint:[1,1,1],sk:meshInfo.sk?skNovo(meshInfo.sk):null,gt:null};}
function poseBones(ch){trs(ROOT,ch.x,ch.y,ch.z,ch.pitch,ch.yaw,ch.roll,ch.s,ch.s,ch.s);const B=ch.bones,r=ch.r,m=ch.m;
  for(let i=0;i<B.length;i++){const b=B[i],o=b.o;trs(LOC,o[0],o[1]+(i===0?ch.hipY:0),o[2],r[i*3],r[i*3+1],r[i*3+2],1,1,1);
    mul(m.subarray(i*16,i*16+16),b.p<0?ROOT:m.subarray(b.p*16,b.p*16+16),LOC);}
  // personagem com malha do Mixamo: a pose acima vira a pose do esqueleto de 22 ossos (com animações por cima)
  if(ch.sk&&ch.sk.t.pronto){const dt=ch.gt===null?0:clamp(G.t-ch.gt,0,0.25);ch.gt=G.t;skPose(ch,dt);}}

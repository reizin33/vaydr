/* ================= base: DOM, matemática, geometria, WebGL ================= */
const $ = id => document.getElementById(id);
const body = document.body;
const mq = q => !!(window.matchMedia && window.matchMedia(q).matches);
const reduced = mq('(prefers-reduced-motion: reduce)');
const touch = mq('(pointer: coarse)') || ('ontouchstart' in window);
const small = touch && Math.min(screen.width, screen.height) < 820;
const store = {
  get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(_){return null;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(_){return false;}},
  del(k){try{localStorage.removeItem(k);}catch(_){}}
};

const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function hash2(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
function vnoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
  return lerp(lerp(hash2(ix,iy),hash2(ix+1,iy),ux),lerp(hash2(ix,iy+1),hash2(ix+1,iy+1),ux),uy);}
const s2l=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const lin=h=>[s2l(((h>>16)&255)/255),s2l(((h>>8)&255)/255),s2l((h&255)/255)];
const srgb=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const scl=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const norm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];};
const approach=(a,b,s)=>a<b?Math.min(b,a+s):Math.max(b,a-s);
function angDiff(a,b){return((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;}
const angLerp=(a,b,t)=>a+angDiff(a,b)*t;
const d2=(ax,az,bx,bz)=>(ax-bx)*(ax-bx)+(az-bz)*(az-bz);
const pick=(R,a)=>a[Math.floor(R()*a.length)];
const randi=(R,a,b)=>a+Math.floor(R()*(b-a+1));

const M4=()=>new Float32Array(16);
const _t=new Float32Array(16);
function mul(o,a,b){
  for(let c=0;c<4;c++){const b0=b[c*4],b1=b[c*4+1],b2=b[c*4+2],b3=b[c*4+3];
    _t[c*4]=a[0]*b0+a[4]*b1+a[8]*b2+a[12]*b3;_t[c*4+1]=a[1]*b0+a[5]*b1+a[9]*b2+a[13]*b3;
    _t[c*4+2]=a[2]*b0+a[6]*b1+a[10]*b2+a[14]*b3;_t[c*4+3]=a[3]*b0+a[7]*b1+a[11]*b2+a[15]*b3;}
  o.set(_t);return o;}
function trs(o,px,py,pz,rx,ry,rz,sx,sy,sz){
  const ca=Math.cos(rx),sa=Math.sin(rx),cb=Math.cos(ry),sb=Math.sin(ry),cc=Math.cos(rz),sc=Math.sin(rz);
  o[0]=(cb*cc+sb*sa*sc)*sx;o[1]=ca*sc*sx;o[2]=(-sb*cc+cb*sa*sc)*sx;o[3]=0;
  o[4]=(-cb*sc+sb*sa*cc)*sy;o[5]=ca*cc*sy;o[6]=(sb*sc+cb*sa*cc)*sy;o[7]=0;
  o[8]=sb*ca*sz;o[9]=-sa*sz;o[10]=cb*ca*sz;o[11]=0;
  o[12]=px;o[13]=py;o[14]=pz;o[15]=1;return o;}
function mat(px=0,py=0,pz=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx){return trs(M4(),px,py,pz,rx,ry,rz,sx,sy,sz);}
const mm=(a,b)=>mul(M4(),a,b);
function persp(o,fy,asp,n,f){const t=1/Math.tan(fy/2),nf=1/(n-f);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)*nf;o[11]=-1;o[14]=2*f*n*nf;return o;}
function ortho(o,l,r,b,t,n,f){const lr=1/(l-r),bt=1/(b-t),nf=1/(n-f);o.fill(0);o[0]=-2*lr;o[5]=-2*bt;o[10]=2*nf;o[12]=(l+r)*lr;o[13]=(t+b)*bt;o[14]=(f+n)*nf;o[15]=1;return o;}
function lookAt(o,e,c,up){
  let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2];let l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
  let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;
  const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
  o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
  o[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);o[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);o[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);o[15]=1;return o;}
const xf=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
const xd=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z,m[1]*x+m[5]*y+m[9]*z,m[2]*x+m[6]*y+m[10]*z];
function alignY(px,py,pz,dx,dy,dz){const l=Math.hypot(dx,dy,dz)||1;return mat(px,py,pz,Math.acos(clamp(dy/l,-1,1)),Math.atan2(dx,dz),0);}

/* ---------- construtor de geometria ---------- */
class GB{
  constructor(n,st){this.st=st===8?11:st;this.f=new Float32Array(n*this.st);this.n=0;}
  grow(){const g=new Float32Array(this.f.length*2);g.set(this.f);this.f=g;}
  v8(x,y,z,r,g,b,e,bo,nx,ny,nz){if((this.n+1)*11>this.f.length)this.grow();const f=this.f,i=this.n*11;f[i]=x;f[i+1]=y;f[i+2]=z;f[i+3]=r;f[i+4]=g;f[i+5]=b;f[i+6]=e;f[i+7]=bo;
    f[i+8]=nx===undefined?0:nx;f[i+9]=ny===undefined?1:ny;f[i+10]=nz===undefined?0:nz;this.n++;}
  v7(x,y,z,r,g,b,a){if((this.n+1)*7>this.f.length)this.grow();const f=this.f,i=this.n*7;f[i]=x;f[i+1]=y;f[i+2]=z;f[i+3]=r;f[i+4]=g;f[i+5]=b;f[i+6]=a;this.n++;}
  data(){return this.f.slice(0,this.n*this.st);}
}
function boxTris(w,h,d,o){o=o||{};const hx=w/2,hy=h/2,hz=d/2,tx=o.tx??1,tz=o.tz??1,bx=o.bx??1,bz=o.bz??1;
  const v=[[-hx*bx,-hy,-hz*bz],[hx*bx,-hy,-hz*bz],[hx*bx,-hy,hz*bz],[-hx*bx,-hy,hz*bz],[-hx*tx,hy,-hz*tz],[hx*tx,hy,-hz*tz],[hx*tx,hy,hz*tz],[-hx*tx,hy,hz*tz]];
  const q=[[7,6,5,4],[0,1,2,3],[3,2,6,7],[1,0,4,5],[2,1,5,6],[0,3,7,4]],t=[];
  for(const f of q)t.push([v[f[0]],v[f[1]],v[f[2]]],[v[f[0]],v[f[2]],v[f[3]]]);return t;}
/* caixa com as quinas chanfradas: tira a cara de bloco de móveis, caixas, carros e objetos.
   Peça grande demais (parede, chão, viga comprida) ou fina demais fica caixa simples, para não pesar. */
function bvTris(w,h,d,o){const mn=Math.min(w,h,d),mx=Math.max(w,h,d);if(mn<0.025||mx>3.2||(o&&o.reta))return boxTris(w,h,d,o);return bevelTris(w,h,d,clamp(mn*0.14,0.006,0.045),o);}
function cylTris(rt,rb,h,seg,o){o=o||{};const ph=o.phase||0,t=[];
  for(let i=0;i<seg;i++){const a0=ph+i/seg*Math.PI*2,a1=ph+(i+1)/seg*Math.PI*2,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    const b0=[rb*c0,0,rb*s0],b1=[rb*c1,0,rb*s1];
    if(rt<=0)t.push([b0,[0,h,0],b1]);
    else{const t0=[rt*c0,h,rt*s0],t1=[rt*c1,h,rt*s1];t.push([b0,t0,t1],[b0,t1,b1]);if(o.top!==false)t.push([[0,h,0],t1,t0]);}
    if(o.bottom)t.push([[0,0,0],b0,b1]);}
  return t;}
const ICO_V=(()=>{const t=(1+Math.sqrt(5))/2,v=[-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1],o=[];
  for(let i=0;i<12;i++){const x=v[i*3],y=v[i*3+1],z=v[i*3+2],l=Math.hypot(x,y,z);o.push([x/l,y/l,z/l]);}return o;})();
const ICO_F=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];
function icoTris(r,jit,R){R=R||Math.random;const v=ICO_V.map(p=>{const k=r*(1+(R()-0.5)*jit);return[p[0]*k,p[1]*k,p[2]*k];}),t=[];
  for(let i=0;i<60;i+=3)t.push([v[ICO_F[i]],v[ICO_F[i+1]],v[ICO_F[i+2]]]);return t;}
/* octaedro com os vértices mexidos: bolo de 8 triângulos para versões de longe (massa de agulhas do pinheiro distante) */
function octTris(r,jit,R){R=R||Math.random;const k=()=>r*(1+(R()-0.5)*jit),px=[k(),0,0],nx=[-k(),0,0],py=[0,k(),0],ny=[0,-k(),0],pz=[0,0,k()],nz=[0,0,-k()];
  return[[px,py,pz],[py,nx,pz],[nx,ny,pz],[ny,px,pz],[py,px,nz],[nx,py,nz],[ny,nx,nz],[px,ny,nz]];}
function icoSubTris(r,jit,R,lv){R=R||Math.random;let V=ICO_V.map(p=>p.slice()),F=[];for(let i=0;i<60;i+=3)F.push([ICO_F[i],ICO_F[i+1],ICO_F[i+2]]);
  for(let l=0;l<(lv||1);l++){const mid=new Map(),nf=[];const m=(a,b)=>{const k=a<b?a*4096+b:b*4096+a;let i=mid.get(k);
      if(i===undefined){const p=V[a],q=V[b],x=p[0]+q[0],y=p[1]+q[1],z=p[2]+q[2],L=Math.hypot(x,y,z);V.push([x/L,y/L,z/L]);i=V.length-1;mid.set(k,i);}return i;};
    for(const[a,b,c]of F){const ab=m(a,b),bc=m(b,c),ca=m(c,a);nf.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);}F=nf;}
  const K=V.map(()=>r*(1+(R()-0.5)*jit));return F.map(f=>f.map(i=>[V[i][0]*K[i],V[i][1]*K[i],V[i][2]*K[i]]));}
function copaTris(R0,h,seg,R,droop){const t=[],rim=[],mid=[],ph=R()*6.28;
  for(let i=0;i<seg;i++){const a=ph+i/seg*Math.PI*2,k=1+(R()-0.5)*0.24,k2=1+(R()-0.5)*0.12;rim.push([Math.cos(a)*R0*k,-(droop||0)*(0.6+R()*0.8),Math.sin(a)*R0*k]);mid.push([Math.cos(a)*R0*0.56*k2,h*0.4,Math.sin(a)*R0*0.56*k2]);}
  const top=[0,h,0],c0=[0,h*0.08,0];
  for(let i=0;i<seg;i++){const j=(i+1)%seg;t.push([rim[i],mid[j],mid[i]],[rim[i],rim[j],mid[j]],[mid[i],mid[j],top],[c0,rim[j],rim[i]]);}
  return t;}
function roofTris(w,h,L){const A=[-w/2,0,-L/2],B=[w/2,0,-L/2],C=[0,h,-L/2],D=[-w/2,0,L/2],E=[w/2,0,L/2],F=[0,h,L/2];
  return[[A,D,F],[A,F,C],[B,C,F],[B,F,E],[D,E,F],[B,A,C],[A,B,E],[A,E,D]];}
/* add: grava uma peça com normais apontando para fora dela, suavizadas entre faces com menos de "crease" graus
   (tira o aspecto quadrado sem perder quinas de verdade) e com a variação de cor contínua pela superfície */
function hashP(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c|0,2147483647);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;}
function add(gb,tris,m,col,o){o=o||{};const e=o.e||0,b=o.b||0,j=o.j||0,R=o.rnd||Math.random,nT=tris.length;if(!nT)return;
  const P=new Float32Array(nT*9);let cx=0,cy=0,cz=0;
  for(let k=0;k<nT;k++){const tr=tris[k];if(j)R();for(let v=0;v<3;v++){const p=tr[v],x=p[0],y=p[1],z=p[2],i=k*9+v*3;
    const X=m[0]*x+m[4]*y+m[8]*z+m[12],Y=m[1]*x+m[5]*y+m[9]*z+m[13],Z=m[2]*x+m[6]*y+m[10]*z+m[14];P[i]=X;P[i+1]=Y;P[i+2]=Z;cx+=X;cy+=Y;cz+=Z;}}
  const nv=nT*3;cx/=nv;cy/=nv;cz/=nv;
  const FN=new Float32Array(nT*3),AW=new Float32Array(nv),flip=new Uint8Array(nT);
  for(let k=0;k<nT;k++){const i=k*9,ux=P[i+3]-P[i],uy=P[i+4]-P[i+1],uz=P[i+5]-P[i+2],vx=P[i+6]-P[i],vy=P[i+7]-P[i+1],vz=P[i+8]-P[i+2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);
    if(l<1e-14){FN[k*3+1]=1;continue;}nx/=l;ny/=l;nz/=l;
    const mx=(P[i]+P[i+3]+P[i+6])/3-cx,my=(P[i+1]+P[i+4]+P[i+7])/3-cy,mz=(P[i+2]+P[i+5]+P[i+8])/3-cz;
    if(!o.keepWind&&nx*mx+ny*my+nz*mz<-1e-5*Math.hypot(mx,my,mz)){nx=-nx;ny=-ny;nz=-nz;flip[k]=1;}
    FN[k*3]=nx;FN[k*3+1]=ny;FN[k*3+2]=nz;
    for(let v=0;v<3;v++){const a=i+v*3,b2=i+((v+1)%3)*3,c2=i+((v+2)%3)*3;const ex=P[b2]-P[a],ey=P[b2+1]-P[a+1],ez=P[b2+2]-P[a+2],fx=P[c2]-P[a],fy=P[c2+1]-P[a+1],fz=P[c2+2]-P[a+2];
      AW[k*3+v]=Math.acos(clamp((ex*fx+ey*fy+ez*fz)/((Math.hypot(ex,ey,ez)*Math.hypot(fx,fy,fz))||1),-1,1));}}
  const VN=new Float32Array(nv*3),JF=new Float32Array(nv).fill(1);
  const keyOf=v=>{const i=v*3;return Math.round(P[i]*2000)+','+Math.round(P[i+1]*2000)+','+Math.round(P[i+2]*2000);};
  if(o.nrm){for(let v=0;v<nv;v++){VN[v*3]=o.nrm[0];VN[v*3+1]=o.nrm[1];VN[v*3+2]=o.nrm[2];}}
  if(o.flat&&!o.nrm){for(let v=0;v<nv;v++){const f=(v/3|0)*3;VN[v*3]=FN[f];VN[v*3+1]=FN[f+1];VN[v*3+2]=FN[f+2];}}
  if(!o.nrm&&!o.flat||j){const cc=Math.cos((o.crease??64)*Math.PI/180),mp=new Map();
    for(let v=0;v<nv;v++){const kk=keyOf(v);let l=mp.get(kk);if(!l){l=[];mp.set(kk,l);}l.push(v);}
    for(const lst of mp.values()){
      if(j){const i=lst[0]*3,f=1+(hashP(Math.round(P[i]*997),Math.round(P[i+1]*991),Math.round(P[i+2]*983))-0.5)*j;for(const v of lst)JF[v]=f;}
      if(o.nrm||o.flat)continue;
      for(const v of lst){const f=(v/3|0)*3;let sx=0,sy=0,sz=0;
        for(const w of lst){const g=(w/3|0)*3;if(FN[f]*FN[g]+FN[f+1]*FN[g+1]+FN[f+2]*FN[g+2]>=cc){const a=AW[w];sx+=FN[g]*a;sy+=FN[g+1]*a;sz+=FN[g+2]*a;}}
        const l=Math.hypot(sx,sy,sz);if(l<1e-9){VN[v*3]=FN[f];VN[v*3+1]=FN[f+1];VN[v*3+2]=FN[f+2];}else{VN[v*3]=sx/l;VN[v*3+1]=sy/l;VN[v*3+2]=sz/l;}}}}
  for(let k=0;k<nT;k++){const ord=flip[k]?[0,2,1]:[0,1,2];for(const q of ord){const v=k*3+q,i=v*3,f=JF[v];
      gb.v8(P[i],P[i+1],P[i+2],col[0]*f,col[1]*f,col[2]*f,e,b,VN[i],VN[i+1],VN[i+2]);}}}
function addU(gb,tris,m,c){for(const tr of tris)for(const p of tr){const q=xf(m,p[0],p[1],p[2]);gb.v7(q[0],q[1],q[2],c[0],c[1],c[2],c[3]);}}
const ID=mat();

/* ---------- shaders ---------- */
/* Com POST a cena é desenhada em HDR linear num framebuffer; o tom, a cor e o brilho (bloom) saem no pós-processamento.
   Sem POST (aparelho sem alvo float) cada shader faz o próprio tom, como antes. */
function acesInv1(y){y=clamp(y,0,0.985);const a=2.43*y-2.51,b=0.59*y-0.03,c=0.14*y;return(-b-Math.sqrt(Math.max(b*b-4*a*c,0)))/(2*a);}
function toLin(c,ex){return[acesInv1(Math.pow(c[0],2.2))/ex,acesInv1(Math.pow(c[1],2.2))/ex,acesInv1(Math.pow(c[2],2.2))/ex];}
const GLSL_ACES=`vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}
vec3 acesInv(vec3 y){y=clamp(y,0.0,0.985);vec3 a=2.43*y-2.51,b=0.59*y-0.03,c=0.14*y;return(-b-sqrt(max(b*b-4.0*a*c,0.0)))/(2.0*a);}`;
const GLSL_LUZ=`uniform vec3 uCam,uHemiS,uHemiG,uDirD,uDirC,uSpotP,uSpotD,uSpotC,uFog,uFogSun,uSunD;
uniform vec4 uPL[4];uniform vec3 uPC[4];
uniform vec2 uSpotK;uniform float uSpotR,uFogD,uExp,uTexel,uAlpha,uDetail,uShadowOn,uTaps,uMist;uniform int uNPL;
uniform mat4 uShadowM,uShadowM2;uniform float uCasc;uniform sampler2DShadow uShadow;uniform sampler2D uNoise;
float gInt=0.0,gSh=1.0;
${GLSL_ACES}
const vec2 PD[12]=vec2[12](vec2(-0.326,-0.406),vec2(-0.840,-0.074),vec2(-0.696,0.457),vec2(-0.203,0.621),vec2(0.962,-0.195),vec2(0.473,-0.480),vec2(0.519,0.767),vec2(0.185,-0.893),vec2(0.507,0.064),vec2(0.896,0.412),vec2(-0.322,-0.933),vec2(-0.792,-0.598));
float pcf(vec3 sp,vec2 t,float z){
if(uTaps>3.5){float a=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)*6.2831;float c=cos(a),s=sin(a);float r=0.0;
for(int i=0;i<12;i++){vec2 o=vec2(c*PD[i].x-s*PD[i].y,s*PD[i].x+c*PD[i].y);r+=texture(uShadow,vec3(sp.xy+o*t*1.8,z));}return r/12.0;}
if(uTaps>2.5){float r=0.0;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)r+=texture(uShadow,vec3(sp.xy+vec2(float(i),float(j))*t*1.25,z));return r/9.0;}
if(uTaps>1.5)return 0.25*(texture(uShadow,vec3(sp.xy+vec2(-t.x,-t.y),z))+texture(uShadow,vec3(sp.xy+vec2(t.x,-t.y),z))+texture(uShadow,vec3(sp.xy+vec2(-t.x,t.y),z))+texture(uShadow,vec3(sp.xy+vec2(t.x,t.y),z)));
return texture(uShadow,vec3(sp.xy,z));}
/* duas cascatas lado a lado na mesma textura: perto (nítida) e longe (cobre a cidade inteira à vista) */
float sombra(vec3 p,vec3 n){if(uShadowOn<0.5)return 1.0;vec2 t=uCasc>0.5?vec2(uTexel*0.5,uTexel):vec2(uTexel);
vec4 sc=uShadowM*vec4(p+n*0.05,1.0);vec3 sp=sc.xyz/sc.w;float x1=uCasc>0.5?0.4965:0.998;
if(sp.x>0.0035&&sp.x<x1&&sp.y>0.003&&sp.y<0.997&&sp.z<1.0)return pcf(sp,t*0.9,sp.z-0.0004);
if(uCasc>0.5){vec4 s2=uShadowM2*vec4(p+n*0.32,1.0);vec3 q=s2.xyz/s2.w;
if(q.x>0.5035&&q.x<0.9965&&q.y>0.003&&q.y<0.997&&q.z<1.0){float e=max(abs(q.x-0.75)*4.0,abs(q.y-0.5)*2.0);return mix(1.0,pcf(q,t*0.9,q.z-0.0022),1.0-smoothstep(0.86,0.99,e));}}
return 1.0;}
vec3 luz(vec3 p,vec3 n){float sh=sombra(p,n);gSh=sh;vec3 L=mix(uHemiG,uHemiS,n.y*0.5+0.5)*mix(0.74,1.0,sh)*mix(1.0,0.14,gInt);
L+=uDirC*max(dot(n,uDirD),0.0)*sh*(1.0-gInt);
for(int i=0;i<4;i++){if(i>=uNPL)break;vec3 lv=uPL[i].xyz-p;float d=length(lv);float r=uPL[i].w;if(r>0.0&&d<r){
L+=uPC[i]*max(dot(n,lv/d),0.0)*pow(clamp(1.0-pow(d/r,4.0),0.0,1.0),2.0)/(d*d+1.0);}}
if(uSpotC.r>0.0){vec3 ls=uSpotP-p;float ds=length(ls);vec3 ln=ls/max(ds,0.001);
float cone=smoothstep(uSpotK.x,uSpotK.y,dot(-ln,uSpotD));
L+=uSpotC*cone*max(dot(n,ln),0.0)*pow(clamp(1.0-pow(ds/uSpotR,4.0),0.0,1.0),2.0)/(ds*ds*0.0194+3.07);}   /* v10.2.2: alcança longe (a 20 m ainda 30% da luz de perto) */
return L;}
vec4 acabar(vec3 c,vec3 p,float e){vec3 dv=p-uCam;float d=length(dv);vec3 v=dv/max(d,0.001);
float f=1.0-exp(-pow(uFogD*d,2.0));
f+=uMist*(1.0-exp(-d*0.035))*exp(-max(p.y+1.2,0.0)*0.42);
f=clamp(f,0.0,1.0)*(1.0-clamp(e,0.0,1.0)*0.55)*(1.0-smoothstep(0.3,0.6,gInt)*0.88);
vec3 fc=mix(uFog,uFogSun,pow(max(dot(v,uSunD),0.0),5.0));
#ifdef POST
return vec4(mix(c,fc,f),uAlpha);
#else
c=pow(aces(c*uExp),vec3(1.0/2.2));return vec4(mix(c,fc,f),uAlpha);
#endif
}`;
const LIT_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec4 aCol;layout(location=2) in float aBone;layout(location=5) in vec3 aNrm;layout(location=6) in vec2 aUV;
#ifdef INST
layout(location=3) in vec4 aI0;layout(location=4) in vec4 aI1;
uniform float uTime,uSway;uniform vec2 uWind;
#endif
uniform mat4 uViewProj;
#ifdef SKIN
uniform mat4 uBones[12];
#endif
#ifdef STAT
uniform mat4 uModel;uniform float uIntO;
#endif
out vec3 vW,vN;out vec4 vC;out float vInt;out vec2 vUV;
#ifdef SKIN
uniform float uIntS;
#endif
void main(){vInt=0.0;vUV=aUV;
#ifdef SKIN
mat4 B=uBones[int(aBone+0.5)];vec4 w=B*vec4(aPos,1.0);vN=mat3(B)*aNrm;vC=aCol;vInt=uIntS;
#endif
#ifdef INST
float c=cos(aI0.w),s=sin(aI0.w);vec3 p=aPos*aI1.x;
vec4 w=vec4(c*p.x+s*p.z+aI0.x,p.y+aI0.y,-s*p.x+c*p.z+aI0.z,1.0);vC=vec4(aCol.rgb*aI1.yzw,aCol.a);vN=vec3(c*aNrm.x+s*aNrm.z,aNrm.y,-s*aNrm.x+c*aNrm.z);
float h=max(p.y,0.0),ph=uTime*1.7+aI0.x*0.31+aI0.z*0.23;w.xz+=uWind*(sin(ph)+0.4*sin(ph*2.7+1.3))*uSway*h*h;
#endif
#ifdef STAT
vec4 w=uModel*vec4(aPos,1.0);vC=aCol;vN=mat3(uModel)*aNrm;vInt=max(aBone,uIntO);
#endif
vW=w.xyz;gl_Position=uViewProj*w;}`;
const LIT_FS=`precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN;in vec4 vC;in float vInt;in vec2 vUV;uniform sampler2D uAlbT;uniform float uUseTex;uniform vec4 uJog;
uniform highp sampler2DArray uTR,uTN;uniform float uTexOn;uniform vec3 uTexMed[5];
uniform vec3 uTint,uRim;uniform float uEmis,uWet;uniform vec4 uVer;
${GLSL_LUZ}
out vec4 o;
void main(){
#ifndef SKIN
/* o que fica entre a câmera e o jogador (copa, galho, poste, placa) abre um furo pontilhado para ele não sumir */
if(uVer.w>0.0){vec3 sg=uVer.xyz-uCam;float L2=max(dot(sg,sg),0.01);vec3 dv=vW-uCam;float t=dot(dv,sg)/L2;
  if(t>0.02&&t<0.84&&(1.0-t)*sqrt(L2)>0.55){float r=uVer.w*(0.5+0.6*t);float dd=length(dv-sg*t);if(dd<r){float k=smoothstep(r*0.45,r,dd);
    float b=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));if(b>k)discard;}}}
#endif
vec3 nf=normalize(cross(dFdx(vW),dFdy(vW)));
vec3 n=normalize(vN);if(dot(n,nf)<0.0&&uUseTex<1.5)n=-n;   /* capim com recorte: a normal fica para cima dos dois lados (aceso como o chão) */
vec3 al=vC.rgb*uTint;float e=vC.a;float spc=0.0,shn=20.0;bool tab=false;   /* brilho (especular) do material: Etapa 21 */
/* modelo com textura de verdade (ferramentas do Poly Haven): a cor vem da textura; 2 = com recorte pela transparência (grama) */
bool txt=uUseTex>0.5;if(txt){vec4 tx=texture(uAlbT,vUV);
  /* recorte: de longe a textura menor (mipmap) mistura folha e vazio e o capim afinaria até sumir; o recorte compensa pelo nível */
  if(uUseTex>1.5){vec2 ts=vec2(textureSize(uAlbT,0)),du=dFdx(vUV)*ts,dv=dFdy(vUV)*ts;float lod=max(0.0,0.5*log2(max(max(dot(du,du),dot(dv,dv)),1e-8)));if(tx.a*(1.0+lod*0.25)<0.5)discard;
    /* 3 = folhagem alta (agulhas do pinheiro): some aos poucos (pontilhado) perto da câmera e, em volta do jogador, os galhos baixos
       também (o pinheiro novo tem galho quase até o chão: sem isso o personagem e o caminho somem dentro da copa) */
    if(uUseTex>2.5){float kf=smoothstep(1.0,3.2,length(vW-uCam));if(uJog.w>0.5){float hj=vW.y-uJog.y;if(hj<2.4)kf=min(kf,max(smoothstep(1.4,3.4,length(vW.xz-uJog.xz)),smoothstep(1.7,2.4,hj)));}
      if(kf<1.0){float bn=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));if(bn>kf)discard;}}}
  al*=tx.rgb;}
if(uDetail>0.5&&!txt){float dd=length(vW-uCam);float k=1.0-smoothstep(25.0,80.0,dd);
vec2 q=abs(nf.y)>0.55?vW.xz:(abs(nf.x)>abs(nf.z)?vW.zy:vW.xy);
float g=texture(uNoise,q*0.21).r*0.55+texture(uNoise,q*1.07).r*0.45;al*=mix(1.0,0.78+g*0.44,k*0.9);
#ifdef STAT
{float mx=max(al.r,max(al.g,al.b)),sat=mx-min(al.r,min(al.g,al.b)),lm=dot(al,vec3(0.3,0.59,0.11));
/* madeira (tons marrons): veio esticado e emenda das tábuas */
/* (vermelho e laranja forte ficam de fora: tijolo, abóbora; em superfície deitada ao ar livre, como terra de canteiro, só um veio fraco e sem emenda) */
/* v10.1: só marrom de verdade (cor relativa forte, sat > 44% do mx): pedra, rocha, concreto e cascalho cinza-quente (caverna, mina,
   poço, ponte, portal do trem, cais) pegavam a textura de tábua e pareciam caixote de madeira */
if(al.r>al.g&&al.g>=al.b*0.95&&al.g>al.r*0.38&&sat>0.02&&sat>mx*0.44&&lm<0.5){bool hz=abs(nf.y)>0.55,fora=hz&&vInt<0.5;float wk=smoothstep(0.02,0.06,sat)*k*(fora?0.3:1.0);vec2 wq=hz?vW.xz:q;
  /* prova de estilo (10/11): parede de madeira do lado de fora (base, casas, cercas) com a textura de tábua velha da Poly Haven,
     puxada para o tom da peça; o veio e a emenda de ruído saem */
  if(uTexOn>0.5&&!hz&&vInt<0.5){vec3 u1=vec3(q/1.8,4.0);vec3 tc=texture(uTR,u1).rgb;float dl=dot(tc,vec3(0.3,0.59,0.11))/max(dot(uTexMed[4],vec3(0.3,0.59,0.11)),1e-4);
    al=mix(tc*(dot(al,vec3(0.3,0.59,0.11))/max(dot(uTexMed[4],vec3(0.3,0.59,0.11)),1e-4)),al*dl,0.5);vec3 tn=texture(uTN,u1).xyz*2.0-1.0;
    float wv=texture(uNoise,q*0.07+vec2(3.1,7.7)).r,wv2=texture(uNoise,q*0.23+vec2(9.3,1.7)).r;al*=0.78+0.4*wv;al=mix(al,vec3(dot(al,vec3(0.3,0.59,0.11)))*vec3(0.92,0.93,0.95),smoothstep(0.55,0.85,wv2)*0.45);vec3 T=abs(nf.x)>abs(nf.z)?vec3(0.0,0.0,1.0):vec3(1.0,0.0,0.0);n=normalize(n+(T*tn.x-vec3(0.0,1.0,0.0)*tn.y)*0.8);tab=true;}
  else{float veio=texture(uNoise,vec2(wq.x*0.45,wq.y*8.5)).r;float em=fora?0.0:smoothstep(0.455,0.5,abs(fract(wq.y*4.0)-0.5));al*=mix(1.0,(0.8+0.4*veio)*(1.0-em*0.45),wk);}}
/* telhado (faces inclinadas): fileiras de telha com variação de uma para outra */
if(nf.y>0.3&&nf.y<0.97){vec2 sd=normalize(nf.xz+vec2(1e-4));float tr=dot(vW.xz,sd)*2.8,lat=dot(vW.xz,vec2(-sd.y,sd.x))*2.2;
  float tj=texture(uNoise,vec2(floor(tr)*0.37,floor(lat+0.5*mod(floor(tr),2.0))*0.29)).r;float ln=smoothstep(0.8,1.0,fract(tr));
  al*=mix(1.0,(1.0-ln*0.4)*(0.84+0.3*tj),k);}
/* metal e tinta cinza: manchas de ferrugem e escorrido */
if(sat<0.06&&lm>0.04&&lm<0.4&&abs(nf.y)<0.9){float ru=smoothstep(0.66,0.86,texture(uNoise,q*0.33+1.7).r)*0.5+smoothstep(0.62,0.9,texture(uNoise,vec2(q.x*0.9,q.y*0.07)+5.1).r)*0.35;
  al=mix(al,vec3(0.2,0.09,0.035)*(0.7+0.6*g),ru*k*0.55);}
/* dentro das casas abandonadas: manchas de sujeira no chão e mofo esverdeado nas paredes */
if(vInt>0.5){if(nf.y>0.9){float ms=texture(uNoise,vW.xz*0.23+7.3).r,mf=texture(uNoise,vW.xz*1.3+2.1).r;al*=1.0-(smoothstep(0.55,0.85,ms)*0.32+smoothstep(0.7,0.95,mf)*0.12)*k;}
  else if(abs(nf.y)<0.3){float mo=texture(uNoise,vec2(q.x*0.4,q.y*0.25)+4.4).r;al=mix(al,al*vec3(0.62,0.66,0.55),smoothstep(0.62,0.9,mo)*0.45*k);}}}
#endif
/* paredes claras: escorridos de sujeira e manchas de umidade (tira o branco chapado das fachadas abandonadas) */
float lum=dot(al,vec3(0.3,0.59,0.11));if(abs(nf.y)<0.3&&lum>0.2){float k2=1.0-smoothstep(70.0,170.0,dd);
  float st=texture(uNoise,vec2(q.x*0.75,q.y*0.045)).r,um=texture(uNoise,q*0.05+3.7).r;
  float suj=smoothstep(0.48,0.86,st)*0.4+smoothstep(0.55,0.8,um)*0.2;al*=(1.0-suj*smoothstep(0.2,0.42,lum)*k2)*mix(1.0,0.8,smoothstep(0.45,0.8,lum));}
#ifndef SKIN
/* Etapa 21 (gráficos Alto e Ultra): relevo pelo ruído (luz rasante mostra a textura), tijolo com argamassa, folha, casca e pedra */
if(uDetail>1.5&&k>0.01&&!tab){float mx2=max(al.r,max(al.g,al.b)),sat2=mx2-min(al.r,min(al.g,al.b)),lm2=dot(al,vec3(0.3,0.59,0.11));
  bool tij=al.r>al.g*3.2&&al.r>al.b*5.0&&abs(nf.y)<0.4&&lm2<0.42,verde=al.g>al.r*1.05&&al.g>al.b*1.15,cinza=sat2<0.06&&lm2<0.5;
  float bs=cinza?0.42:tij?0.6:verde?0.4:lm2>0.5?0.14:0.28;   /* reboco claro: relevo de leve */
  float s1=1.9,e1=0.025,h0=texture(uNoise,q*s1).r,hx=texture(uNoise,q*s1+vec2(e1,0.0)).r-h0,hy=texture(uNoise,q*s1+vec2(0.0,e1)).r-h0;vec2 gr=vec2(hx,hy)*(bs*k*7.5);
  vec3 bn=abs(nf.y)>0.55?vec3(gr.x,0.0,gr.y):(abs(nf.x)>abs(nf.z)?vec3(0.0,gr.y,gr.x):vec3(gr.x,gr.y,0.0));n=normalize(n-bn);
  if(tij){vec2 bq=vec2((abs(nf.x)>abs(nf.z)?vW.z:vW.x)*4.4,vW.y*13.0);bq.x+=0.5*mod(floor(bq.y),2.0);vec2 f=abs(fract(bq)-0.5);float ar=smoothstep(0.41,0.47,max(f.x,f.y));
    al=mix(al*(0.82+0.36*texture(uNoise,floor(bq)*0.137).r),vec3(0.36,0.34,0.31)*(0.7+0.6*lm2),ar*0.75*k);}
  if(verde){float fo=texture(uNoise,q*3.1+2.0).r;al*=mix(1.0,0.78+0.44*fo,k);vec3 Vv=normalize(uCam-vW);al+=al*vec3(0.55,0.75,0.2)*pow(max(dot(-Vv,uDirD),0.0),4.0)*0.6*k;}
  if(cinza){float gr2=texture(uNoise,q*5.3+1.3).r;al*=mix(1.0,0.86+0.28*gr2,k);float tr=1.0-smoothstep(0.0,0.012,abs(texture(uNoise,q*0.37+9.1).r-0.5));al*=1.0-tr*0.3*k;}
#ifdef INST
  /* casca das árvores: sulcos verticais */
  if(!verde&&al.r>al.g&&al.g>=al.b&&abs(nf.y)<0.6){float bk=texture(uNoise,vec2(q.x*7.0,q.y*0.55)).r,bk2=texture(uNoise,vec2(q.x*2.1,q.y*0.2)+3.0).r;al*=mix(1.0,(0.62+0.55*bk)*(0.85+0.3*bk2),k);}
#endif
  spc=cinza&&abs(nf.y)<0.9?0.24*smoothstep(0.008,0.04,lm2):sat2>0.28?0.1:verde?0.06:0.04;shn=cinza?42.0:verde?14.0:22.0;}   /* quase preto (boca da caverna, fundo da mina): sem brilho, senão vira purpurina */
#endif
}
/* na textura: metal cinza brilha, madeira e ferrugem quase nada */
if(txt&&uUseTex<1.5){float mx3=max(al.r,max(al.g,al.b)),sat3=mx3-min(al.r,min(al.g,al.b)),lm3=dot(al,vec3(0.3,0.59,0.11));float mt=(1.0-smoothstep(0.03,0.08,sat3/max(mx3,0.02)*0.25+sat3))*smoothstep(0.012,0.05,lm3);spc=mix(0.05,0.32,mt);shn=mix(16.0,48.0,mt);}
/* chuva: o que está ao ar livre molha (escurece e brilha), mais nas faces para cima */
if(uWet>0.01&&vInt<0.5){float up=smoothstep(0.2,0.9,nf.y);al*=1.0-uWet*0.22*up;spc=max(spc,uWet*0.4*(0.35+0.65*up));shn=max(shn,48.0);n=normalize(mix(n,nf,uWet*0.85*up));}   /* a água enche o relevo: superfície molhada fica lisa */
gInt=clamp(vInt,0.0,1.0);vec3 L=luz(vW,n);
#ifdef SKIN
L+=uRim*pow(1.0-abs(dot(n,normalize(uCam-vW))),3.0)*(1.0-gInt);
#endif
{vec3 Vv=normalize(uCam-vW),Hh=normalize(Vv+uDirD);float sp=pow(max(dot(n,Hh),0.0),shn)*spc*gSh*(1.0-gInt)*smoothstep(0.0,0.15,dot(n,uDirD));al*=1.0;o=acabar(al*L+uDirC*sp*(shn+8.0)/40.0+al*e*uEmis,vW,e);}}`;
/* terreno: normais suaves e texturas procedurais (grama, terra, asfalto com faixa, concreto, rocha nas encostas) */
const TER_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNrm;layout(location=2) in vec4 aCol;
uniform mat4 uViewProj;out vec3 vW,vN;out vec4 vC;
void main(){vW=aPos;vN=aNrm;vC=aCol;gl_Position=uViewProj*vec4(aPos,1.0);}`;
const TER_FS=`precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN;in vec4 vC;uniform sampler2D uSplat;uniform vec3 uSplatT;uniform float uWet;
uniform highp sampler2DArray uTR,uTN;uniform float uTexOn;uniform vec4 uTexTam;uniform vec3 uTexMed[5];
${GLSL_LUZ}
out vec4 o;
void main(){vec3 n=normalize(vN);vec2 w=vW.xz;float dist=length(vW-uCam);float near=1.0-smoothstep(18.0,60.0,dist);
vec4 m=texture(uSplat,w*uSplatT.z+uSplatT.xy);
float n1=texture(uNoise,w*0.011).r,n2=texture(uNoise,w*0.057).r,n3=texture(uNoise,w*0.27).r,n4=texture(uNoise,w*1.31).r,n5=texture(uNoise,w*4.7).r;
vec3 g=vC.rgb*(0.74+0.52*n2);
g=mix(g,vec3(dot(g,vec3(0.3,0.59,0.11)))*vec3(1.08,1.0,0.78),0.22);
g=mix(g,g*vec3(1.36,1.18,0.58),smoothstep(0.5,0.72,n1)*0.65);g=mix(g,g*vec3(0.72,0.74,0.7),smoothstep(0.66,0.86,1.0-n2)*0.35);
g=mix(g,g*vec3(0.78,0.95,0.8),smoothstep(0.62,0.8,n3)*0.35);
/* gramado menos uniforme: chão batido aparecendo em manchas, trevo mais escuro e capim seco salpicado perto de você */
g=mix(g,vec3(0.1,0.078,0.052)*(0.75+0.5*n4),smoothstep(0.66,0.84,n3*0.55+n2*0.45)*0.55);
g=mix(g,g*vec3(0.62,0.82,0.6),smoothstep(0.7,0.9,n4)*0.4*near);g=mix(g,g*vec3(1.25,1.12,0.62),smoothstep(0.72,0.92,n5)*0.35*near);
g*=mix(1.0,0.8+0.4*n4,near)*mix(1.0,0.88+0.24*n5,near*near);
/* Etapa 21: areia (praia e duna) não leva as manchas de grama: grão e marcas de vento */
{float lc=dot(vC.rgb,vec3(0.3,0.59,0.11)),sk=smoothstep(0.2,0.3,lc)*smoothstep(1.5,2.0,vC.r/max(vC.b,0.02));if(sk>0.0){float rp=sin(dot(w,vec2(0.8,0.6))*6.5+n3*7.0)*0.5+0.5;
  vec3 sa=vC.rgb*(0.9+0.2*n2)*(1.0-0.08*rp*near)*mix(1.0,0.9+0.2*n5,near);g=mix(g,sa,sk);}}
vec3 dirt=vec3(0.105,0.075,0.05)*(0.7+0.6*n3)*mix(1.0,0.8+0.4*n5,near);
vec3 road=vec3(0.15,0.118,0.082)*(0.72+0.5*n3)*mix(1.0,0.84+0.32*n5,near);
vec3 asf=vec3(0.048,0.048,0.046)*(0.78+0.44*n3)*mix(1.0,0.85+0.3*n5,near);
float crack=(1.0-smoothstep(0.0,0.016,abs(texture(uNoise,w*0.13+7.0).r-0.5)))*near*smoothstep(0.42,0.68,n2);asf*=1.0-crack*0.42;
vec3 conc=vec3(0.13,0.125,0.11)*(0.82+0.3*n3);vec2 jt=abs(fract(w/4.0)-0.5);conc*=1.0-0.35*(1.0-smoothstep(0.0,0.02,min(jt.x,jt.y)))*near;
vec3 al=g;al=mix(al,dirt,clamp(vC.a,0.0,1.0));al=mix(al,road,m.g);al=mix(al,conc,m.b);al=mix(al,asf,m.r);
if(m.r>0.3&&vW.x>7.0&&vW.x<168.0){float dz=vW.z-(5.6+sin(vW.x*0.045)*3.2);float fw=fwidth(dz);float dash=step(0.42,fract(vW.x/6.0));
float ln=(1.0-smoothstep(0.075,0.075+fw*1.5,abs(dz)))*dash*(0.45+0.55*smoothstep(0.25,0.6,n2));al=mix(al,vec3(0.5,0.38,0.07),ln*m.r);}
float rk=smoothstep(0.86,0.68,n.y)*(1.0-m.r);vec3 rock=vec3(0.14,0.135,0.12)*(0.6+0.8*texture(uNoise,vec2(w.x*0.11+w.y*0.07,vW.y*0.8)).r);
al=mix(al,rock,rk);
/* prova de estilo (10/11): texturas realistas da Poly Haven. Grama nos campos (puxada para o verde do jogo), chão de mata e folhas
   em manchas dentro da mata, terra onde o chão é batido, rocha nas encostas (projeção nos três eixos, para não esticar no barranco).
   Estrada, asfalto, concreto e areia continuam como antes. O relevo de cada textura entra na luz (tex: quanto da textura entrou). */
float tex=0.0;
if(uTexOn>0.5){float lc2=dot(vC.rgb,vec3(0.3,0.59,0.11)),areia=smoothstep(0.2,0.3,lc2)*smoothstep(1.5,2.0,vC.r/max(vC.b,0.02));
  float kt=(1.0-m.r)*(1.0-m.b)*(1.0-areia);
  if(kt>0.01){float aberto=m.a,terra=clamp(vC.a,0.0,1.0),fol=smoothstep(0.32,0.68,texture(uNoise,w*0.035+3.1).r),wR=clamp(m.g,0.0,1.0);
    float wG=aberto*(1.0-terra),wM=(1.0-aberto)*(1.0-fol)+terra,wF=(1.0-aberto)*fol*(1.0-terra);float sw=wG+wM+wF;wG/=sw;wM/=sw;wF/=sw;
    float mx=smoothstep(0.35,0.65,texture(uNoise,w*0.018+5.0).r);   /* a mesma textura em duas escalas, trocando em manchas: esconde a repetição */
    vec3 tc=vec3(0.0),tn=vec3(0.0);
    /* grama: verde do jogo com o detalhe da foto; tufos secos amarelados em manchas pequenas */
    if(wG>0.01){vec3 u1=vec3(w*uTexTam.x,0.0),u2=vec3(w*uTexTam.x*0.41+0.37,0.0);vec3 c=mix(texture(uTR,u1).rgb,texture(uTR,u2).rgb,mx);
      float dl=pow(dot(c,vec3(0.3,0.59,0.11))/max(dot(uTexMed[0],vec3(0.3,0.59,0.11)),1e-4),0.8),seco=smoothstep(0.62,0.82,texture(uNoise,w*0.21+1.3).r)*0.55;
      vec3 verde=vC.rgb*dl*0.95;c=mix(c*0.8,mix(verde,verde*vec3(1.55,1.25,0.55),seco),mix(0.72,0.92,smoothstep(0.3,0.7,n1)));
      tc+=wG*c;tn+=wG*mix(texture(uTN,u1).xyz,texture(uTN,u2).xyz,mx);}
    vec3 cm=vec3(0.0),nm=vec3(0.0);
    if(wM>0.01||wR>0.01){vec3 u1=vec3(w*uTexTam.y,1.0),u2=vec3(w*uTexTam.y*0.43+0.21,1.0);cm=mix(texture(uTR,u1).rgb,texture(uTR,u2).rgb,mx);nm=mix(texture(uTN,u1).xyz,texture(uTN,u2).xyz,mx);}
    /* chão de mata: puxa um pouco para o verde-musgo da mata e escurece */
    if(wM>0.01){float dl=pow(dot(cm,vec3(0.3,0.59,0.11))/max(dot(uTexMed[1],vec3(0.3,0.59,0.11)),1e-4),0.85);tc+=wM*mix(cm*0.62,vC.rgb*dl*1.1,0.38);tn+=wM*nm;}
    /* folhas: menos laranja e mais escuras */
    if(wF>0.01){vec3 u1=vec3(w*uTexTam.z,2.0),u2=vec3(w*uTexTam.z*0.39+0.63,2.0);vec3 c=mix(texture(uTR,u1).rgb,texture(uTR,u2).rgb,mx);c=mix(c,vec3(dot(c,vec3(0.3,0.59,0.11))),0.3)*0.5;
      tc+=wF*mix(c,vC.rgb*1.1,0.2);tn+=wF*mix(texture(uTN,u1).xyz,texture(uTN,u2).xyz,mx);}
    tc*=0.86+0.28*n2;   /* variação grande de cor (sol e sombra das manchas), como no chão de antes */
    /* estrada de terra e trilha: cascalho com pedrinhas (a mesma foto do chão de mata, acinzentada) */
    if(wR>0.01){vec3 cg=mix(cm,vec3(dot(cm,vec3(0.3,0.59,0.11))),0.4)*vec3(0.78,0.78,0.76)*(0.9+0.2*n3);tc=mix(tc,cg,wR);tn=mix(tn,nm,wR);}
    tn=tn*2.0-1.0;
    al=mix(al,tc,kt*(1.0-rk));tex=kt*(1.0-rk);
    vec3 np=normalize(vec3(n.x+tn.x*0.6,n.y,n.z-tn.y*0.6));n=normalize(mix(n,np,tex));}
  /* rocha das encostas */
  if(rk>0.01){vec3 bw=pow(abs(vN),vec3(4.0));bw/=bw.x+bw.y+bw.z;float s4=uTexTam.w;
    vec3 cx=texture(uTR,vec3(vW.zy*s4,3.0)).rgb,cy=texture(uTR,vec3(vW.xz*s4,3.0)).rgb,cz=texture(uTR,vec3(vW.xy*s4,3.0)).rgb;
    vec3 nx=texture(uTN,vec3(vW.zy*s4,3.0)).xyz*2.0-1.0,ny=texture(uTN,vec3(vW.xz*s4,3.0)).xyz*2.0-1.0,nz=texture(uTN,vec3(vW.xy*s4,3.0)).xyz*2.0-1.0;
    vec3 rc=cx*bw.x+cy*bw.y+cz*bw.z;float dl=dot(rc,vec3(0.3,0.59,0.11))/max(dot(uTexMed[3],vec3(0.3,0.59,0.11)),1e-4);
    rc=mix(rc*0.42,vec3(0.15,0.14,0.125)*dl,0.45);   /* a pedra da foto é clara demais para a mata: escurece e puxa para o cinza do jogo */
    al=mix(al,rc,rk);vec3 nr=vec3(0.0,-nx.y,nx.x)*bw.x+vec3(ny.x,0.0,-ny.y)*bw.y+vec3(nz.x,-nz.y,0.0)*bw.z;n=normalize(n+nr*rk*0.9);tex=max(tex,rk);}}
al*=1.0-uWet*0.35*(1.0-rk);
/* Etapa 21 (Alto e Ultra): relevo do chão pelo ruído (mais forte na rocha), perto da câmera */
if(uDetail>1.5&&near>0.0&&tex<0.99){float e2=0.012,sc=mix(0.9,2.2,rk),b0=texture(uNoise,w*sc).r,bx=texture(uNoise,w*sc+vec2(e2,0.0)).r-b0,bz=texture(uNoise,w*sc+vec2(0.0,e2)).r-b0;
  n=normalize(n-vec3(bx,0.0,bz)*near*(1.0-m.r)*(1.0-m.b)*mix(7.0,14.0,rk)*(1.0-tex));}
vec3 L=luz(vW,n);
vec3 c=al*L;
if(uWet>0.01){vec3 v=normalize(uCam-vW);vec3 hv=normalize(v+uDirD);c+=uDirC*pow(max(dot(normalize(mix(n,vN,0.7)),hv),0.0),60.0)*uWet*0.22*(m.r+m.b*0.6+0.15);}
o=acabar(c,vW,0.0);}`;
const DEPTH_VS=`layout(location=0) in vec3 aPos;layout(location=2) in float aBone;
#ifdef INST
layout(location=3) in vec4 aI0;layout(location=4) in vec4 aI1;
uniform float uTime,uSway;uniform vec2 uWind;
#endif
uniform mat4 uViewProj;
#ifdef SKIN
uniform mat4 uBones[12];
#endif
#ifdef STAT
uniform mat4 uModel;
#endif
void main(){
#ifdef SKIN
gl_Position=uViewProj*(uBones[int(aBone+0.5)]*vec4(aPos,1.0));
#endif
#ifdef INST
float c=cos(aI0.w),s=sin(aI0.w);vec3 p=aPos*aI1.x;vec4 w=vec4(c*p.x+s*p.z+aI0.x,p.y+aI0.y,-s*p.x+c*p.z+aI0.z,1.0);
float h=max(p.y,0.0),ph=uTime*1.7+aI0.x*0.31+aI0.z*0.23;w.xz+=uWind*(sin(ph)+0.4*sin(ph*2.7+1.3))*uSway*h*h;
gl_Position=uViewProj*w;
#endif
#ifdef STAT
gl_Position=uViewProj*(uModel*vec4(aPos,1.0));
#endif
}`;
const DEPTH_FS=`precision mediump float;void main(){}`;
const SKY_VS=`out vec2 vN;void main(){vec2 p=vec2(gl_VertexID==1?3.0:-1.0,gl_VertexID==2?3.0:-1.0);vN=p;gl_Position=vec4(p,0.9999,1.0);}`;
const SKY_FS=`precision highp float;in vec2 vN;out vec4 o;
uniform vec3 uF,uR,uU,uZen,uHor,uGlow,uMoon,uSun,uCloudLit,uCloudSh,uMoonC,uLua;uniform vec2 uTan,uCloudOff;uniform float uMoonV,uSunV,uStars,uTime,uExp,uCloud;
uniform sampler2D uNoise;
${GLSL_ACES}
float h3(vec3 p){p=fract(p*0.3183099+vec3(0.71,0.113,0.419));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
void main(){
vec3 d=normalize(uF+vN.x*uTan.x*uR+vN.y*uTan.y*uU);
float h=max(d.y,0.0);
vec3 c=mix(uHor,uZen,pow(h,0.5));
float sd=max(dot(normalize(vec3(d.x,0.0,d.z)+1e-4),normalize(vec3(uSun.x,0.0,uSun.z)+1e-4)),0.0);
c+=uGlow*pow(sd,6.0)*exp(-h*5.0);
float cov=0.0,cl=0.0;
if(d.y>0.0&&uCloud>0.01){vec2 cp=d.xz/(d.y+0.1)*0.9+uCloudOff;
float n=texture(uNoise,cp*0.07).r*0.58+texture(uNoise,cp*0.19+3.1).r*0.29+texture(uNoise,cp*0.53-1.7).r*0.13;
cov=smoothstep(1.0-uCloud,1.0-uCloud+0.26,n)*smoothstep(0.0,0.14,d.y);
float lit=clamp(0.62+(texture(uNoise,cp*0.07-uSun.xz*0.035).r-n)*3.0,0.0,1.0);
vec3 cc=mix(uCloudSh,uCloudLit,lit*(1.0-cov*0.35));
float sg=pow(max(dot(d,uSun),0.0),14.0)*uSunV;cc+=vec3(1.0,0.8,0.55)*sg*0.45*(1.0-cov);
c=mix(c,cc,cov*0.94);cl=cov;}
if(uStars>0.01){vec3 q=d*150.0;vec3 id=floor(q);vec3 f=fract(q)-0.5;float r=h3(id);
float s=smoothstep(0.24,0.0,length(f))*step(0.986,r)*(r-0.986)*70.0;
s*=0.65+0.35*sin(uTime*2.2+r*600.0);c+=vec3(0.85,0.9,1.0)*s*uStars*smoothstep(0.03,0.3,d.y)*(1.0-cl);}
float ma=acos(clamp(dot(d,uMoon),-1.0,1.0));
vec3 mu=normalize(cross(uMoon,vec3(0.0,1.0,0.0)));vec3 mv=cross(mu,uMoon);
vec2 mp=vec2(dot(d,mu),dot(d,mv))/0.036;
float cr=0.88+0.12*sin(mp.x*5.1+1.3)*sin(mp.y*4.3-0.7)-0.08*smoothstep(0.5,0.2,length(mp-vec2(0.25,0.18)));
float disc=(1.0-smoothstep(0.031,0.036,ma))*(1.0-cl*0.9);
vec2 lp=mp/0.93;float lit=smoothstep(-0.05,0.05,lp.x*uLua.y-uLua.x*sqrt(max(0.0,1.0-lp.y*lp.y)));
c=mix(c,uMoonC*cr*(0.06+0.94*lit),disc*uMoonV);
c+=uMoonC*vec3(0.48,0.58,0.77)*(exp(-ma*ma*700.0)*0.35+exp(-ma*ma*40.0)*0.12)*uMoonV*(1.0-cl*0.6)*(0.15+0.85*uLua.z);
float sa=acos(clamp(dot(d,uSun),-1.0,1.0));float sdisc=smoothstep(0.05,0.04,sa)*(1.0-cl*0.85);
#ifdef POST
c=acesInv(pow(clamp(c,0.0,1.0),vec3(2.2)))/uExp;
c+=vec3(1.0,0.9,0.72)*(sdisc*16.0+exp(-sa*sa*60.0)*0.9*(1.0-cl*0.6))*uSunV;
c+=uMoonC*0.8*disc*uMoonV*1.2*lit;
#else
c+=vec3(1.0,0.92,0.75)*(sdisc+exp(-sa*sa*60.0)*0.35)*uSunV;
c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;
#endif
o=vec4(c,1.0);}`;
const UN_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec4 aCol;uniform mat4 uViewProj,uModel;out vec4 vC;
void main(){vC=aCol;gl_Position=uViewProj*uModel*vec4(aPos,1.0);}`;
const UN_FS=`precision mediump float;in vec4 vC;uniform vec4 uTint;uniform vec3 uFog;uniform float uSil;out vec4 o;
void main(){if(uSil>0.5){o=vec4(mix(uTint.rgb*vC.r,uFog,vC.g),1.0);}else{o=vec4(vC.rgb*uTint.rgb,vC.a*uTint.a);}}`;
const BB_VS=`layout(location=0) in vec3 aC;layout(location=1) in vec2 aK;layout(location=2) in float aS;layout(location=3) in vec4 aCol;
uniform mat4 uViewProj;uniform vec3 uR,uU;uniform float uLin,uAdd,uGain,uExpI;out vec2 vK;out vec4 vC;
${GLSL_ACES}
void main(){vK=aK;vC=aCol;
if(uLin>0.5){vec3 l=pow(max(aCol.rgb,vec3(0.0)),vec3(2.2));vC.rgb=uAdd>0.5?l*uGain:acesInv(l)*uExpI;}
gl_Position=uViewProj*vec4(aC+(uR*aK.x+uU*aK.y)*aS,1.0);}`;
const BB_FS=`precision mediump float;in vec2 vK;in vec4 vC;out vec4 o;
void main(){float r=1.0-dot(vK,vK);if(r<=0.0)discard;o=vec4(vC.rgb,vC.a*r*r);}`;
const RAIN_VS=`layout(location=0) in vec4 aD;uniform mat4 uViewProj;uniform vec3 uCam;uniform float uTime;uniform vec2 uWind;out float vA;
void main(){float B=22.0;vec3 p;
p.x=uCam.x+mod(aD.x-uCam.x+B,2.0*B)-B;p.z=uCam.z+mod(aD.z-uCam.z+B,2.0*B)-B;
float fall=mod(aD.y-uTime*17.0,24.0);p.y=uCam.y-9.0+fall;p.x+=uWind.x*fall*0.05;p.z+=uWind.y*fall*0.05;
p+=aD.w*vec3(uWind.x*0.05*0.6,0.6,uWind.y*0.05*0.6);vA=aD.w;gl_Position=uViewProj*vec4(p,1.0);}`;
const RAIN_FS=`precision mediump float;in float vA;uniform vec4 uCol;out vec4 o;void main(){o=vec4(uCol.rgb,uCol.a*(0.35+0.65*vA));}`;
/* pós-processamento: brilho (bloom em cadeia de meias resoluções) e composição final */
const QUAD_VS=`out vec2 vU;void main(){vec2 p=vec2(gl_VertexID==1?3.0:-1.0,gl_VertexID==2?3.0:-1.0);vU=p*0.5+0.5;gl_Position=vec4(p,0.0,1.0);}`;
const DOWN_FS=`precision highp float;in vec2 vU;uniform sampler2D uT;uniform vec2 uPx;uniform float uLim,uExp;out vec4 o;
vec3 s(vec2 d){return texture(uT,vU+d*uPx).rgb;}
void main(){vec3 c=s(vec2(0.0))*4.0+s(vec2(-1.0,-1.0))+s(vec2(1.0,-1.0))+s(vec2(-1.0,1.0))+s(vec2(1.0,1.0));c*=0.125;
#ifdef LIMIAR
c*=uExp;float br=max(c.r,max(c.g,c.b));float k=clamp(br-uLim,0.0,0.5);k=k*k*2.0+max(br-uLim-0.5,0.0);c*=k/max(br,1e-4);c=min(c,vec3(24.0));
#endif
o=vec4(c,1.0);}`;
const UP_FS=`precision highp float;in vec2 vU;uniform sampler2D uT;uniform vec2 uPx;out vec4 o;
vec3 s(vec2 d){return texture(uT,vU+d*uPx).rgb;}
void main(){vec3 c=s(vec2(-1.0,0.0))*2.0+s(vec2(1.0,0.0))*2.0+s(vec2(0.0,-1.0))*2.0+s(vec2(0.0,1.0))*2.0+s(vec2(-1.0,-1.0))+s(vec2(1.0,-1.0))+s(vec2(-1.0,1.0))+s(vec2(1.0,1.0))+s(vec2(0.0))*4.0;
o=vec4(c/16.0,1.0);}`;
const COMP_FS=`precision highp float;in vec2 vU;uniform sampler2D uT,uB,uAO,uRaios;uniform float uExp,uBloomK,uSat,uVig,uGrain,uTime,uCont,uAOk,uRaioK;uniform vec3 uLift,uGain,uRaioC;uniform vec2 uRes;out vec4 o;
${GLSL_ACES}
void main(){vec3 c=texture(uT,vU).rgb*uExp;c*=mix(1.0,texture(uAO,vU).r,uAOk);c+=texture(uB,vU).rgb*uBloomK+uRaioC*texture(uRaios,vU).r*uRaioK;
c=aces(c);{float gx=max(0.0,c.g-max(c.r,c.b));c=max(c+vec3(0.2,-0.3,-0.04)*gx,0.0);}   // verde puro vira oliva (mata de verdade, não de desenho)
float l=dot(c,vec3(0.2126,0.7152,0.0722));c=max(mix(vec3(l),c,uSat),0.0);
c*=mix(uLift,uGain,smoothstep(0.02,0.6,l));
c=pow(c,vec3(1.0/2.2));c=mix(c,c*c*(3.0-2.0*c),uCont);
vec2 q=(vU-0.5)*vec2(1.0,0.85);c*=1.0-dot(q,q)*uVig;
float g=fract(sin(dot(floor(vU*uRes)+fract(uTime*7.31)*91.0,vec2(12.9898,78.233)))*43758.5453);c+=(g-0.5)*uGrain;
o=vec4(c,1.0);}`;

/* oclusão de ambiente na tela (SSAO): amostras num hemisfério ao redor da normal reconstruída da profundidade */
const SSAO_FS=`precision highp float;in vec2 vU;uniform sampler2D uD;uniform vec2 uPx;uniform vec2 uPr;uniform float uN,uF,uRaio,uForca;out vec4 o;
float lin(float d){float z=d*2.0-1.0;return(2.0*uN*uF)/(uF+uN-z*(uF-uN));}
vec3 pv(vec2 uv){float z=lin(texture(uD,uv).r);vec2 c=uv*2.0-1.0;return vec3(c.x*z/uPr.x,c.y*z/uPr.y,-z);}
void main(){float d0=texture(uD,vU).r;if(d0>=0.99999){o=vec4(1.0);return;}
vec3 p=pv(vU);float fade=1.0-smoothstep(16.0,42.0,-p.z);if(fade<=0.0){o=vec4(1.0);return;}
vec3 px=pv(vU+vec2(uPx.x,0.0)),py=pv(vU+vec2(0.0,uPx.y));vec3 n=normalize(cross(px-p,py-p));if(n.z<0.0)n=-n;
float h=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453),ang=h*6.2831;
vec3 tg=normalize(abs(n.y)<0.99?cross(n,vec3(0.0,1.0,0.0)):cross(n,vec3(1.0,0.0,0.0)));vec3 bt=cross(n,tg);
float r=uRaio*clamp(-p.z*0.06+0.6,0.6,2.2),ao=0.0;
for(int i=0;i<10;i++){float fi=float(i),t=(fi+0.5)/10.0,a=ang+fi*2.39996,rr=sqrt(t);
  vec3 dir=tg*(cos(a)*rr)+bt*(sin(a)*rr)+n*sqrt(max(0.0,1.0-t));vec3 sp=p+dir*r*(0.25+0.75*t*t);
  vec2 uv=vec2(sp.x*uPr.x/-sp.z,sp.y*uPr.y/-sp.z)*0.5+0.5;if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0)continue;
  float sd=lin(texture(uD,uv).r),dz=-sp.z-sd;ao+=step(0.03,dz)*smoothstep(0.0,1.0,r/max(abs(-p.z-sd),1e-3));}
o=vec4(vec3(1.0-uForca*fade*ao/10.0),1.0);}`;
const BLUR_AO_FS=`precision highp float;in vec2 vU;uniform sampler2D uT,uD;uniform vec2 uPx,uDir;uniform float uN,uF;out vec4 o;
float lin(float d){float z=d*2.0-1.0;return(2.0*uN*uF)/(uF+uN-z*(uF-uN));}
void main(){float z0=lin(texture(uD,vU).r),s=0.0,w=0.0;for(int i=-3;i<=3;i++){vec2 uv=vU+uDir*uPx*float(i)*1.5;float z=lin(texture(uD,uv).r);float k=exp(-float(i*i)*0.18)*(1.0/(1.0+abs(z-z0)*4.0));s+=texture(uT,uv).r*k;w+=k;}o=vec4(vec3(s/w),1.0);}`;
/* raios de sol: marcha da posição do pixel até o sol na tela, somando céu aberto (profundidade no infinito) */
const RAIOS_FS=`precision highp float;in vec2 vU;uniform sampler2D uD;uniform vec2 uSol;uniform float uK;out vec4 o;
void main(){vec2 d=(uSol-vU)/28.0;vec2 uv=vU;float s=0.0,w=1.0,sw=0.0;float h=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);uv+=d*h;
for(int i=0;i<28;i++){float ceu=step(0.99999,texture(uD,clamp(uv,0.001,0.999)).r);s+=ceu*w;sw+=w;w*=0.94;uv+=d;}
float r=length((vU-uSol)*vec2(1.7,1.0));float f=(s/sw)*exp(-r*r*7.0);o=vec4(vec3(f*uK),1.0);}`;
const canvas=$('cena');
let gl=null,GDEF='';
function compileSh(type,src,defs){const s=gl.createShader(type);gl.shaderSource(s,'#version 300 es\n'+(defs||'')+src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('shader: '+gl.getShaderInfoLog(s));return s;}
function program(vs,fs,defs){const p=gl.createProgram();gl.attachShader(p,compileSh(gl.VERTEX_SHADER,vs,defs));gl.attachShader(p,compileSh(gl.FRAGMENT_SHADER,fs,defs));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('link: '+gl.getProgramInfoLog(p));
  const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,a.name);}
  return{p,u:new Proxy(u,{get:(o,k)=>k in o?o[k]:null})};}
function litAttribs(){gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,44,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,44,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,1,gl.FLOAT,false,44,28);gl.enableVertexAttribArray(5);gl.vertexAttribPointer(5,3,gl.FLOAT,false,44,32);}
function litMesh(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  litAttribs();gl.bindVertexArray(null);return{vao,buf:b,count:data.length/11};}
/* malha instanciada: geometria fixa + até max instâncias (x,y,z,giro | escala,r,g,b) */
function instMesh(data,max){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  litAttribs();
  const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,max*32,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);
  gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
  gl.bindVertexArray(null);return{vao,count:data.length/11,ib,max,n:0,arr:new Float32Array(max*8),sway:0};}
function instUpload(m,list){let n=0;const a=m.arr;for(const it of list){if(n>=m.max)break;const o=n*8;a[o]=it.x;a[o+1]=it.y;a[o+2]=it.z;a[o+3]=it.r||0;a[o+4]=it.s||1;
    const t=it.t||1;a[o+5]=it.tr??t;a[o+6]=it.tg??t;a[o+7]=it.tb??t;n++;}
  m.n=n;gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,a,0,n*8);}
function unMesh(data,dyn){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,dyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,28,12);gl.bindVertexArray(null);return{vao,buf:b,count:data.length/7};}
/* terreno: posição, normal e cor+terra (10 floats) com índices */
function terMesh(T){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,T.data,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,40,24);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,T.idx,gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,count:T.idx.length};}

let PSSAO=null,PBLURAO=null,PRAIOS=null,PL,PLS,PLI,PD,PDS,PDI,PSKY,PU,PBB,PRAIN,PTER,PDOWN,PDOWN0,PUP,PCOMP,EMPTY,BEAM,RING,DISC,BIRDS,BBV,BBBUF,RAINV,RAIN_N,SHADOW=null,NOISE_TEX=null,SPLAT_TEX=null;
function makeNoiseTex(){const N=256,d=new Uint8Array(N*N),R=rng(9),acc=new Float32Array(N*N);let amp=1,tot=0;
  for(const f of[8,16,32,64]){const g=new Float32Array(f*f);for(let i=0;i<f*f;i++)g[i]=R();
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/N*f,fy=y/N*f,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,ux=tx*tx*(3-2*tx),uy=ty*ty*(3-2*ty);
      const a=g[(iy%f)*f+ix%f],b=g[(iy%f)*f+(ix+1)%f],c=g[((iy+1)%f)*f+ix%f],e=g[((iy+1)%f)*f+(ix+1)%f];acc[y*N+x]+=amp*lerp(lerp(a,b,ux),lerp(c,e,ux),uy);}
    tot+=amp;amp*=0.55;}
  for(let i=0;i<N*N;i++)d[i]=Math.round(clamp(acc[i]/tot,0,1)*255);
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,N,N,0,gl.RED,gl.UNSIGNED_BYTE,d);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  NOISE_TEX=t;}
function makeSplatTex(D,S){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,D);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  SPLAT_TEX=t;}
const BB_MAX=1100,bbData=new Float32Array(BB_MAX*6*10);
let bbN=0;
function bb(x,y,z,s,r,g,b,a){if(bbN>=BB_MAX)return;
  const K=BBK;for(let i=0;i<6;i++){const o=(bbN*6+i)*10;bbData[o]=x;bbData[o+1]=y;bbData[o+2]=z;bbData[o+3]=K[i*2];bbData[o+4]=K[i*2+1];bbData[o+5]=s;bbData[o+6]=r;bbData[o+7]=g;bbData[o+8]=b;bbData[o+9]=a;}bbN++;}
const BBK=[-1,-1,1,-1,1,1,-1,-1,1,1,-1,1];
function makeShadow(size,casc){casc=!!casc;
  if(SHADOW){gl.deleteTexture(SHADOW.tex);gl.deleteFramebuffer(SHADOW.fbo);}
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,casc?size*2:size,size);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
  const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,tex,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);SHADOW={tex,fbo,size,casc,w:casc?size*2:size};}

/* ---------- alvos do pós-processamento ---------- */
const POSTX={ok:false,w:0,h:0,msaa:0,fbo:null,tex:null,depth:null,ms:null,msC:null,msD:null,lv:[]};
function rtTex(w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA16F,w,h);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function rtFbo(t){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f;}
function postFree(){const X=POSTX;for(const t of[X.tex,X.dtex])if(t)gl.deleteTexture(t);for(const q of[X.ao,X.ao2,X.raio])if(q){gl.deleteTexture(q.t);gl.deleteFramebuffer(q.f);}X.ao=X.ao2=X.raio=null;X.dtex=null;for(const f of[X.fbo,X.ms])if(f)gl.deleteFramebuffer(f);for(const r of[X.depth,X.msC,X.msD])if(r)gl.deleteRenderbuffer(r);
  for(const l of X.lv){gl.deleteTexture(l.t);gl.deleteFramebuffer(l.f);}X.lv=[];X.tex=X.fbo=X.ms=X.depth=X.msC=X.msD=null;}
function postSetup(w,h,msaa){if(!GDEF)return false;const X=POSTX;w=Math.max(1,w|0);h=Math.max(1,h|0);
  msaa=Math.min(msaa|0,gl.getParameter(gl.MAX_SAMPLES)|0);if(X.w===w&&X.h===h&&X.msaa===msaa&&X.fbo)return X.ok;
  postFree();X.w=w;X.h=h;X.msaa=msaa;
  X.tex=rtTex(w,h);X.fbo=rtFbo(X.tex);
  if(msaa>1){X.ms=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,X.ms);
    X.msC=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,X.msC);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,msaa,gl.RGBA16F,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,X.msC);
    X.msD=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,X.msD);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,msaa,gl.DEPTH_COMPONENT24,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,X.msD);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.deleteFramebuffer(X.ms);gl.deleteRenderbuffer(X.msC);gl.deleteRenderbuffer(X.msD);X.ms=X.msC=X.msD=null;X.msaa=0;}}
  gl.bindFramebuffer(gl.FRAMEBUFFER,X.fbo);X.dtex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,X.dtex);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,w,h);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,X.dtex,0);
  // oclusão de ambiente e raios de sol em meia/quarta resolução (texturas de 8 bits)
  const r8=(ww,hh)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA8,ww,hh);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return{t,f:rtFbo(t),w:ww,h:hh};};
  X.ao=r8(Math.max(1,w>>1),Math.max(1,h>>1));X.ao2=r8(Math.max(1,w>>1),Math.max(1,h>>1));X.raio=r8(Math.max(1,w>>2),Math.max(1,h>>2));
  gl.bindFramebuffer(gl.FRAMEBUFFER,X.fbo);
  X.ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
  let lw=w,lh=h;for(let i=0;i<5;i++){lw=Math.max(1,lw>>1);lh=Math.max(1,lh>>1);const t=rtTex(lw,lh);X.lv.push({t,f:rtFbo(t),w:lw,h:lh});if(lw<=8||lh<=8)break;}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);return X.ok;}

function initGL(){
  let fl=false;if(location.hash!=='#teste-sempos')try{const tc=document.createElement('canvas').getContext('webgl2');fl=!!(tc&&tc.getExtension('EXT_color_buffer_float'));const lc=tc&&tc.getExtension('WEBGL_lose_context');if(lc)lc.loseContext();}catch(_){}
  gl=canvas.getContext('webgl2',{antialias:!fl,alpha:false,powerPreference:'high-performance'});
  if(!gl)throw new Error('sem webgl2');
  if(fl&&!gl.getExtension('EXT_color_buffer_float'))fl=false;
  GDEF=fl?'#define POST\n':'';
  const D=GDEF;
  PL=program(LIT_VS,LIT_FS,D+'#define STAT\n');PLS=program(LIT_VS,LIT_FS,D+'#define SKIN\n');PLI=program(LIT_VS,LIT_FS,D+'#define INST\n');
  for(const q of[PL,PLS,PLI])if(q.u.uAlbT){gl.useProgram(q.p);gl.uniform1i(q.u.uAlbT,5);}   /* textura dos modelos de verdade na unidade 5 (não pode ficar na 0, que é a da sombra) */
  PTER=program(TER_VS,TER_FS,D);
  PD=program(DEPTH_VS,DEPTH_FS,'#define STAT\n');PDS=program(DEPTH_VS,DEPTH_FS,'#define SKIN\n');PDI=program(DEPTH_VS,DEPTH_FS,'#define INST\n');
  PSKY=program(SKY_VS,SKY_FS,D);PU=program(UN_VS,UN_FS,'');PBB=program(BB_VS,BB_FS,'');PRAIN=program(RAIN_VS,RAIN_FS,'');
  if(fl){PDOWN0=program(QUAD_VS,DOWN_FS,'#define LIMIAR\n');PDOWN=program(QUAD_VS,DOWN_FS,'');PUP=program(QUAD_VS,UP_FS,'');PCOMP=program(QUAD_VS,COMP_FS,'');
    PSSAO=program(QUAD_VS,SSAO_FS,'');PBLURAO=program(QUAD_VS,BLUR_AO_FS,'');PRAIOS=program(QUAD_VS,RAIOS_FS,'');}
  EMPTY=gl.createVertexArray();
  makeShadow(small?1024:2048,!small);makeNoiseTex();
  const bg=new GB(256,7);
  for(let i=0;i<16;i++){const a0=i/16*Math.PI*2,a1=(i+1)/16*Math.PI*2;
    bg.v7(0,0,0,1,0.95,0.82,1);bg.v7(Math.cos(a0),Math.sin(a0),1,1,0.95,0.82,0);bg.v7(Math.cos(a1),Math.sin(a1),1,1,0.95,0.82,0);}
  BEAM=unMesh(bg.data());
  const rg=new GB(256,7);
  for(let i=0;i<48;i++){const a0=i/48*Math.PI*2,a1=(i+1)/48*Math.PI*2,p=[[Math.cos(a0)*0.9,Math.sin(a0)*0.9],[Math.cos(a0),Math.sin(a0)],[Math.cos(a1),Math.sin(a1)],[Math.cos(a1)*0.9,Math.sin(a1)*0.9]];
    for(const k of[0,1,2,0,2,3])rg.v7(p[k][0],0,p[k][1],1,1,1,1);}
  RING=unMesh(rg.data());
  const dg=new GB(256,7);
  for(let i=0;i<20;i++){const a0=i/20*Math.PI*2,a1=(i+1)/20*Math.PI*2;dg.v7(0,0,0,0,0,0,1);dg.v7(Math.cos(a1),0,Math.sin(a1),0,0,0,0);dg.v7(Math.cos(a0),0,Math.sin(a0),0,0,0,0);}
  DISC=unMesh(dg.data());
  BIRDS=unMesh(new Float32Array(16*6*7),true);
  BBV=gl.createVertexArray();gl.bindVertexArray(BBV);BBBUF=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,BBBUF);gl.bufferData(gl.ARRAY_BUFFER,bbData.byteLength,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,40,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,1,gl.FLOAT,false,40,20);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,40,24);gl.bindVertexArray(null);
  RAIN_N=small?900:1600;const rd=new Float32Array(RAIN_N*8),rr=rng(77);
  for(let i=0;i<RAIN_N;i++){const x=rr()*44,y=rr()*24,z=rr()*44;rd.set([x,y,z,0,x,y,z,1],i*8);}
  RAINV=gl.createVertexArray();gl.bindVertexArray(RAINV);const rb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,rb);gl.bufferData(gl.ARRAY_BUFFER,rd,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,4,gl.FLOAT,false,16,0);gl.bindVertexArray(null);
  if(fl)body.classList.add('pos');
}

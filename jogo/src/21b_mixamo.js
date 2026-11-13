/* ================= personagens Mixamo: malha com pele de 4 ossos, textura e animações =================
   O jogo continua calculando a pose "de bloquinhos" (12 ossos, ângulos em ch.r): daqui ela é passada para o esqueleto do
   Mixamo (22 ossos) como rotações no espaço do personagem. As animações dos arquivos FBX entram por cima, com mistura.
   Toda pose é guardada como delta D (rotação do osso em relação à pose T de repouso): Q = D * Qrepouso. */
const SK_N=22;
const SKI={Hips:0,Spine:1,Spine1:2,Spine2:3,Neck:4,Head:5,LeftShoulder:6,LeftArm:7,LeftForeArm:8,LeftHand:9,RightShoulder:10,RightArm:11,RightForeArm:12,RightHand:13,
  LeftUpLeg:14,LeftLeg:15,LeftFoot:16,LeftToeBase:17,RightUpLeg:18,RightLeg:19,RightFoot:20,RightToeBase:21};
function b64bytes(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
/* ---------- quatérnios (x,y,z,w) em arrays com deslocamento ---------- */
function qmul(o,oi,a,ai,b,bi){const ax=a[ai],ay=a[ai+1],az=a[ai+2],aw=a[ai+3],bx=b[bi],by=b[bi+1],bz=b[bi+2],bw=b[bi+3];
  o[oi]=aw*bx+ax*bw+ay*bz-az*by;o[oi+1]=aw*by-ax*bz+ay*bw+az*bx;o[oi+2]=aw*bz+ax*by-ay*bx+az*bw;o[oi+3]=aw*bw-ax*bx-ay*by-az*bz;}
function qnlerp(o,oi,a,ai,b,bi,t){let d=a[ai]*b[bi]+a[ai+1]*b[bi+1]+a[ai+2]*b[bi+2]+a[ai+3]*b[bi+3];const s=d<0?-1:1,u=1-t;
  const x=a[ai]*u+b[bi]*t*s,y=a[ai+1]*u+b[bi+1]*t*s,z=a[ai+2]*u+b[bi+2]*t*s,w=a[ai+3]*u+b[bi+3]*t*s,l=Math.hypot(x,y,z,w)||1;o[oi]=x/l;o[oi+1]=y/l;o[oi+2]=z/l;o[oi+3]=w/l;}
function qrot(q,qi,x,y,z,out){const qx=q[qi],qy=q[qi+1],qz=q[qi+2],qw=q[qi+3];
  const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);out[0]=x+qw*tx+qy*tz-qz*ty;out[1]=y+qw*ty+qz*tx-qx*tz;out[2]=z+qw*tz+qx*ty-qy*tx;return out;}
/* euler do jogo (trs: R = Ry*Rx*Rz) -> quatérnio */
function qEuler(o,oi,rx,ry,rz){const cx=Math.cos(rx/2),sx=Math.sin(rx/2),cy=Math.cos(ry/2),sy=Math.sin(ry/2),cz=Math.cos(rz/2),sz=Math.sin(rz/2);
  // qy*qx
  const ax=cy*sx,ay=sy*cx,az=-sy*sx,aw=cy*cx;
  // (qy*qx)*qz
  o[oi]=ax*cz+ay*sz;o[oi+1]=ay*cz-ax*sz;o[oi+2]=aw*sz+az*cz;o[oi+3]=aw*cz-az*sz;}
function qFromTo(a,b){const d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];let x=a[1]*b[2]-a[2]*b[1],y=a[2]*b[0]-a[0]*b[2],z=a[0]*b[1]-a[1]*b[0],w=1+d;
  if(w<1e-6){x=0;y=0;z=1;w=0;}const l=Math.hypot(x,y,z,w);return new Float32Array([x/l,y/l,z/l,w/l]);}
const qConj=(q,i=0)=>new Float32Array([-q[i],-q[i+1],-q[i+2],q[i+3]]);
const qY=(o,a)=>{o[0]=0;o[1]=Math.sin(a/2);o[2]=0;o[3]=Math.cos(a/2);return o;};
/* matriz coluna-maior de rotação q e posição p */
function qMat(o,q,qi,px,py,pz){const x=q[qi],y=q[qi+1],z=q[qi+2],w=q[qi+3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  o[0]=1-(yy+zz);o[1]=xy+wz;o[2]=xz-wy;o[3]=0;o[4]=xy-wz;o[5]=1-(xx+zz);o[6]=yz+wx;o[7]=0;o[8]=xz+wy;o[9]=yz-wx;o[10]=1-(xx+yy);o[11]=0;o[12]=px;o[13]=py;o[14]=pz;o[15]=1;return o;}

/* ---------- tipos de esqueleto (akai = sobrevivente, yaku = zumbi) ---------- */
const SKT={};
function skTipo(nome){const d=SKD[nome];const t={nome,pai:d.pai,tb:Float32Array.from(d.t),qb:Float32Array.from(d.qb),inv:new Float32Array(b64bytes(d.inv).buffer),hip:d.quadril,alt:d.altura,
    A:new Float32Array(SK_N*4),pb:new Float32Array(SK_N*3),mesh:null,tex:null,mask:null,pronto:false};
  // posições de repouso (cinemática direta com as rotações de repouso)
  const v=[0,0,0];for(let b=0;b<SK_N;b++){const p=t.pai[b];if(p<0){t.pb[0]=t.tb[0];t.pb[1]=t.tb[1];t.pb[2]=t.tb[2];continue;}
    qrot(t.qb,p*4,t.tb[b*3],t.tb[b*3+1],t.tb[b*3+2],v);t.pb[b*3]=t.pb[p*3]+v[0];t.pb[b*3+1]=t.pb[p*3+1]+v[1];t.pb[b*3+2]=t.pb[p*3+2]+v[2];}
  // alinhamento com a pose de repouso do jogo: braços caídos ao lado do corpo e pernas retas
  for(let b=0;b<SK_N;b++){t.A[b*4+3]=1;}
  const dir=(a,b)=>{const x=t.pb[b*3]-t.pb[a*3],y=t.pb[b*3+1]-t.pb[a*3+1],z=t.pb[b*3+2]-t.pb[a*3+2],l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];};
  const setA=(lst,q)=>{for(const b of lst)t.A.set(q,b*4);};
  setA([SKI.LeftArm,SKI.LeftForeArm,SKI.LeftHand],qFromTo(dir(SKI.LeftArm,SKI.LeftForeArm),[0,-1,0]));
  setA([SKI.RightArm,SKI.RightForeArm,SKI.RightHand],qFromTo(dir(SKI.RightArm,SKI.RightForeArm),[0,-1,0]));
  setA([SKI.LeftUpLeg,SKI.LeftLeg],qFromTo(dir(SKI.LeftUpLeg,SKI.LeftLeg),[0,-1,0]));
  setA([SKI.RightUpLeg,SKI.RightLeg],qFromTo(dir(SKI.RightUpLeg,SKI.RightLeg),[0,-1,0]));
  // A*qb e sua inversa (para devolver o quadro "do jogo" das mãos/cabeça às armas e roupas)
  t.Aq=new Float32Array(SK_N*4);t.AqInv=new Float32Array(SK_N*4);for(let b=0;b<SK_N;b++){qmul(t.Aq,b*4,t.A,b*4,t.qb,b*4);t.AqInv.set(qConj(t.Aq,b*4),b*4);}
  SKT[nome]=t;return t;}

/* ---------- animações ---------- */
const SKA={};
function skClip(nome){const c=SKCLIP[nome];const d16=new Int16Array(b64bytes(c.d).buffer),h=new Float32Array(b64bytes(c.h).buffer);
  const a={nome,fps:c.fps,n:c.n,dur:c.dur,d:new Float32Array(d16.length),h};for(let i=0;i<d16.length;i++)a.d[i]=d16[i]/32767;SKA[nome]=a;return a;}
/* amostra o clipe no tempo t: deltas em o (22x4) e quadril relativo em hp */
function skAmostra(a,t,o,hp){const f=clamp(t*a.fps,0,a.n-1),i=Math.min(a.n-2,Math.floor(f)),k=f-i,b0=i*SK_N*4,b1=(i+1)*SK_N*4;
  for(let b=0;b<SK_N;b++)qnlerp(o,b*4,a.d,b0+b*4,a.d,b1+b*4,k);
  hp[0]=lerp(a.h[i*3],a.h[(i+1)*3],k);hp[1]=lerp(a.h[i*3+1],a.h[(i+1)*3+1],k);hp[2]=lerp(a.h[i*3+2],a.h[(i+1)*3+2],k);}

/* ---------- GPU: malha, textura e shaders ---------- */
const SK_VS=`layout(location=0) in vec3 aPos;layout(location=5) in vec3 aNrm;layout(location=6) in vec2 aUV;layout(location=7) in uvec4 aJ;layout(location=8) in vec4 aW;
uniform mat4 uViewProj;uniform mat4 uSk[${SK_N}];
#ifndef PROF
uniform float uIntS;out vec3 vW,vN;out vec2 vUV;out float vInt;
#endif
#ifdef CASCA
uniform float uInfla;
#endif
void main(){mat4 M=uSk[aJ.x]*aW.x+uSk[aJ.y]*aW.y+uSk[aJ.z]*aW.z+uSk[aJ.w]*aW.w;vec3 p=aPos;
#ifdef CASCA
p+=aNrm*uInfla;
#endif
vec4 w=M*vec4(p,1.0);
#ifndef PROF
vN=mat3(M)*aNrm;vW=w.xyz;vUV=aUV;vInt=uIntS;
#endif
gl_Position=uViewProj*w;}`;
const SK_FS=`precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN;in vec2 vUV;in float vInt;
uniform sampler2D uAlb,uMask;uniform float uUseMask,uTexK,uEmis,uPe,uZumbi;uniform vec3 uTint,uRim;
#ifndef CASCA
uniform sampler2D uNrmT,uRugT;uniform float uUseNrm;
#endif
${GLSL_LUZ}
out vec4 o;
#ifdef CASCA
uniform vec3 uCor;uniform float uPelo;
#endif
void main(){
#ifdef CASCA
float n1=texture(uNoise,vUV*7.0).r,n2=texture(uNoise,vUV*31.0+vec2(0.37,0.11)).r,n3=texture(uNoise,vUV*97.0).r;
vec3 al=uCor*(0.78+0.44*n1)*mix(0.9+0.2*n2,0.62+0.76*n3,uPelo)*uTint;
#else
if(uUseMask>0.5&&texture(uMask,vUV).r<0.5)discard;
vec3 al=texture(uAlb,vUV).rgb*uTexK*uTint;
/* detalhe preso na textura (não escorrega quando o personagem anda): trama leve no tecido e na pele */
al*=0.93+0.14*texture(uNoise,vUV*23.0).r;
/* zumbi: pele manchada, arroxeada e com sangue seco */
if(uZumbi>0.5){float m1=texture(uNoise,vUV*5.0+0.3).r,m2=texture(uNoise,vUV*13.0+1.7).r;
  al=mix(al,al*vec3(0.78,0.9,0.72),smoothstep(0.45,0.75,m1)*0.6);al=mix(al,vec3(0.16,0.03,0.02),smoothstep(0.7,0.9,m2)*0.5);}
#endif
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;
float rug=-1.0;
#ifndef CASCA
/* relevo da pele e da roupa (mapa de normais do modelo, quadro tirado das derivadas da posição e da UV, convenção glTF) */
if(uUseNrm>0.5){vec3 dp1=dFdx(vW),dp2=dFdy(vW);vec2 du1=dFdx(vUV),du2=dFdy(vUV);float det=du1.x*du2.y-du2.x*du1.y;
  if(abs(det)>1e-12){vec3 tt=(du2.y*dp1-du1.y*dp2)/det;tt=tt-n*dot(n,tt);float lt=length(tt);
    if(lt>1e-8){tt/=lt;vec3 bv=(du1.x*dp2-du2.x*dp1)/det;vec3 bb=cross(n,tt)*(dot(cross(n,tt),bv)>0.0?-1.0:1.0);
      vec3 tn=texture(uNrmT,vUV).xyz*2.0-1.0;n=normalize(mat3(tt,bb,n)*tn);}}
  rug=texture(uRugT,vUV).r;}
/* contato com o chão: pés e canelas um pouco mais escuros (o personagem não parece flutuar) */
al*=mix(0.72,1.0,smoothstep(0.0,0.55,vW.y-uPe));
#endif
gInt=clamp(vInt,0.0,1.0);vec3 L=luz(vW,n);
/* brilho fraco do sol na pele e no tecido, com a sombra */
{vec3 V=normalize(uCam-vW),H=normalize(V+uDirD);float ex=rug<0.0?26.0:mix(52.0,7.0,rug),kk=rug<0.0?0.1:mix(0.3,0.045,rug);L+=uDirC*pow(max(dot(n,H),0.0),ex)*kk*(1.0-gInt)*sombra(vW,n);}
L+=uRim*pow(1.0-abs(dot(n,normalize(uCam-vW))),3.0)*(1.0-gInt);
o=acabar(al*L,vW,0.0);}`;
let PSK=null,PDSK=null,PSKC=null;
/* roupas de couro e pele viram "cascas" sobre o corpo do Akai: os triângulos da região, inflados pela normal e com cor própria */
const SK_CASCAS={
  camisaCouro:[{sub:'troncoCurto',inf:0.007,cor:0x8a5a36,pelo:0},{sub:'gola',inf:0.012,cor:0x5a3820,pelo:0}],
  casacoPele:[{sub:'troncoLongo',inf:0.015,cor:0x7a5638,pelo:0.25},{sub:'golaLonga',inf:0.026,cor:0xd6c29c,pelo:1}],
  calcaCouro:[{sub:'pernas',inf:0.006,cor:0x6b4a30,pelo:0}],
  botasCouro:[{sub:'pes',inf:0.011,cor:0x5a3a24,pelo:0}],
  gorroPele:[{sub:'cabeca',inf:0.024,cor:0x8c6b4a,pelo:0.55},{sub:'cabecaAba',inf:0.034,cor:0xd6c29c,pelo:1}]};
function skSubconjuntos(t,vb,idx,maoA){const nv=vb.length/28,dv=new DataView(vb.buffer,vb.byteOffset,vb.byteLength),dom=new Uint8Array(nv),X=new Float32Array(nv),Y=new Float32Array(nv),Z=new Float32Array(nv);
  for(let i=0;i<nv;i++){const o=i*28;X[i]=dv.getFloat32(o,true);Y[i]=dv.getFloat32(o+4,true);Z[i]=dv.getFloat32(o+8,true);let bw=-1,bb=0;for(let k=0;k<4;k++){const w=vb[o+24+k];if(w>bw){bw=w;bb=vb[o+20+k];}}dom[i]=bb;}
  const K=SKI,hip=t.hip,neck=t.pb[K.Neck*3+1],head=t.pb[K.Head*3+1],joelho=t.pb[K.LeftLeg*3+1],em=(i,l)=>l.includes(dom[i]);
  const mL=maoA?maoA.slice(0,3):[t.pb[K.LeftHand*3],t.pb[K.LeftHand*3+1],t.pb[K.LeftHand*3+2]],mR=maoA?maoA.slice(3,6):[t.pb[K.RightHand*3],t.pb[K.RightHand*3+1],t.pb[K.RightHand*3+2]];
  const dHand=i=>Math.min(Math.hypot(X[i]-mL[0],Y[i]-mL[1],Z[i]-mL[2]),Math.hypot(X[i]-mR[0],Y[i]-mR[1],Z[i]-mR[2]));
  const tronco=[K.Spine,K.Spine1,K.Spine2,K.LeftShoulder,K.RightShoulder,K.LeftArm,K.RightArm];
  const curto=i=>em(i,tronco)||(dom[i]===K.Hips&&Y[i]>hip+0.04)||(dom[i]===K.Neck&&Y[i]<neck+0.02);
  const longo=i=>curto(i)||em(i,[K.LeftForeArm,K.RightForeArm])&&dHand(i)>0.025||(dom[i]===K.Hips&&Y[i]>hip-0.14)||(em(i,[K.LeftUpLeg,K.RightUpLeg])&&Y[i]>hip-0.2);
  const pernas=i=>(em(i,[K.LeftUpLeg,K.RightUpLeg,K.LeftLeg,K.RightLeg])&&Y[i]>0.1)||(dom[i]===K.Hips&&Y[i]<=hip+0.06);
  const pes=i=>em(i,[K.LeftFoot,K.LeftToeBase,K.RightFoot,K.RightToeBase])||(em(i,[K.LeftLeg,K.RightLeg])&&Y[i]<0.34);
  const cab=i=>dom[i]===K.Head&&Y[i]>head+0.07;
  const tris=f=>{const o=[];for(let i=0;i<idx.length;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2];if(f(a)&&f(b)&&f(c))o.push(a,b,c);}return o;};
  let hem=1e9;for(let i=0;i<nv;i++)if(longo(i))hem=Math.min(hem,Y[i]);let capMin=1e9;for(let i=0;i<nv;i++)if(cab(i))capMin=Math.min(capMin,Y[i]);
  return{troncoCurto:tris(curto),gola:tris(i=>curto(i)&&Y[i]>neck-0.06),troncoLongo:tris(longo),golaLonga:tris(i=>longo(i)&&(Y[i]>neck-0.07||Y[i]<hem+0.06||em(i,[K.LeftForeArm,K.RightForeArm])&&dHand(i)<0.09)),
    pernas:tris(pernas),pes:tris(pes),cabeca:tris(cab),cabecaAba:tris(i=>cab(i)&&Y[i]<capMin+0.04),
    rosto:tris(i=>(dom[i]===K.Head||dom[i]===K.Neck)&&Y[i]>neck-0.005&&Y[i]<head+0.055),
    maos:tris(i=>em(i,[K.LeftHand,K.RightHand])||em(i,[K.LeftForeArm,K.RightForeArm])&&dHand(i)<0.06),
    pernasCurtas:tris(i=>(em(i,[K.LeftUpLeg,K.RightUpLeg])&&Y[i]>joelho+0.1)||(dom[i]===K.Hips&&Y[i]<=hip+0.06)),
    cinto:tris(i=>em(i,[K.Hips,K.Spine,K.LeftUpLeg,K.RightUpLeg])&&Y[i]>hip+0.0&&Y[i]<hip+0.085),
    mangaLonga:tris(i=>curto(i)||em(i,[K.LeftForeArm,K.RightForeArm])&&dHand(i)>0.03)};}
/* textura nova é montada na unidade 8 (nenhum sampler lê essa) e a unidade ativa de antes volta no fim. Antes ela entrava na
   unidade ativa, que no meio do desenho é a 0, a da sombra: os lugares montam quando alguém chega perto (no meio do desenho),
   a sombra saía da unidade 0 e o desenho seguinte dava "Mismatch between texture format and sampler type". O retorno de
   chamada (cb) também roda com a unidade 8 ativa e a textura ligada nela. */
function skNaUnidade(f){const a=gl.getParameter(gl.ACTIVE_TEXTURE);gl.activeTexture(gl.TEXTURE8);try{f();}finally{gl.activeTexture(a);}}
function skTextura(url,srgb,cb){const t=gl.createTexture();
  skNaUnidade(()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([150,140,130,255]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);});   /* enquanto a imagem não chega, o pixel provisório já serve (textura completa) */
  const im=new Image();im.onload=()=>{if(!gl)return;skNaUnidade(()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,srgb?gl.SRGB8_ALPHA8:gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);if(cb)cb();});};
  im.src=url;return t;}
function skMalha(t){const d=SKD[t.nome],vb=b64bytes(d.vb),ib=b64bytes(d.ib);
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,vb,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0);
  gl.enableVertexAttribArray(5);gl.vertexAttribPointer(5,3,gl.BYTE,true,28,12);
  gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.UNSIGNED_SHORT,true,28,16);
  gl.enableVertexAttribArray(7);gl.vertexAttribIPointer(7,4,gl.UNSIGNED_BYTE,28,20);
  gl.enableVertexAttribArray(8);gl.vertexAttribPointer(8,4,gl.UNSIGNED_BYTE,true,28,24);
  const idx=d.i32?new Uint32Array(ib.buffer):new Uint16Array(ib.buffer);let todos=idx;t.sub={};
  if(t.nome==='akai'||t.nome==='yaku'||t.nome==='surv'){const S=skSubconjuntos(t,vb,idx,d.maoA);let n=idx.length;for(const k in S)n+=S[k].length;todos=new (d.i32?Uint32Array:Uint16Array)(n);todos.set(idx);let o=idx.length;
    for(const k in S){todos.set(S[k],o);t.sub[k]={off:o*(d.i32?4:2),n:S[k].length};o+=S[k].length;}}
  const e=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,e);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,todos,gl.STATIC_DRAW);
  gl.bindVertexArray(null);t.mesh={vao,count:d.ni,tipo:d.i32?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT};
  t.tex=skTextura(d.tex,true);if(d.mask)t.mask=skTextura(d.mask,false);if(d.nrm){t.nrm=skTextura(d.nrm,false);t.rug=skTextura(d.rug,false);}t.pronto=true;}
function skInit(){if(PSK)return;PSK=program(SK_VS,SK_FS,GDEF);PDSK=program(SK_VS,DEPTH_FS,'#define PROF\n');PSKC=program(SK_VS,SK_FS,GDEF+'#define CASCA\n');
  for(const n of['akai','yaku','surv'])if(SKD[n])skMalha(skTipo(n));for(const n in SKCLIP)skClip(n);}

/* ---------- estado por personagem ---------- */
function skNovo(tipo){return{t:tipo,D:new Float32Array(SK_N*4),Dp:new Float32Array(SK_N*4),hip:[0,tipo.hip,0],skin:new Float32Array(SK_N*16),G:new Float32Array(SK_N*16),
  Q:new Float32Array(SK_N*4),P:new Float32Array(SK_N*3),ini:false,clip:null,ct:0,cv:1,cl:false,cw:0,cwAlvo:0,craiz:null,suave:16,sobre:null};}
/* toca um clipe: vel (velocidade), laco (repete), raiz ('fixa' = sem andar com a animação, 'xz' = só altura fica, 'livre'), ini (segundo inicial) */
function skTocar(ch,nome,o){const s=ch.sk;if(!s)return;o=o||{};const a=SKA[nome];if(!a)return;
  if(s.clip===a&&!o.reinicia){s.cwAlvo=o.peso??1;s.cv=o.vel??s.cv;if(o.mix!==undefined)s.cmix=o.mix;if(o.rot!==undefined)s.rotRaiz=o.rot;return;}
  s.clip=a;s.ct=o.ini||0;s.ini0=o.ini||0;s.cv=o.vel??1;s.cl=!!o.laco;s.ext=!!o.ext;s.rotRaiz=o.rot||0;s.dyRaiz=o.dy||0;s.cwAlvo=o.peso??1;s.craiz=o.raiz||'fixa';s.cfim=o.fim??a.dur;s.cmix=o.mix??8;if(o.imediato)s.cw=s.cwAlvo;}
function skParar(ch,mix){const s=ch.sk;if(!s)return;s.cwAlvo=0;if(mix!==undefined)s.cmix=mix;}
const _W=new Float32Array(12*4),_Dc=new Float32Array(SK_N*4),_hc=[0,0,0],_v3=[0,0,0],_sq=new Float32Array(4),_ROOT=new Float32Array(16),_L=new Float32Array(16),_M=new Float32Array(16);
const PROC_PAI=[-1,0,1,1,3,1,5,0,7,0,9,6];
/* pose do jogo (12 ossos) -> deltas do Mixamo */
function skDaPose(ch,t,D){const r=ch.r;
  for(let i=0;i<12;i++){qEuler(_sq,0,r[i*3],r[i*3+1],r[i*3+2]);const p=PROC_PAI[i];if(p<0)_W.set(_sq,0);else qmul(_W,i*4,_W,p*4,_sq,0);}
  const set=(b,i)=>{qmul(D,b*4,_W,i*4,t.A,b*4);};
  set(SKI.Hips,0);set(SKI.Spine2,1);qnlerp(D,SKI.Spine*4,D,0,D,SKI.Spine2*4,0.34);qnlerp(D,SKI.Spine1*4,D,0,D,SKI.Spine2*4,0.67);
  set(SKI.Head,2);qnlerp(D,SKI.Neck*4,D,SKI.Spine2*4,D,SKI.Head*4,0.5);
  D.set(D.subarray(SKI.Spine2*4,SKI.Spine2*4+4),SKI.LeftShoulder*4);D.set(D.subarray(SKI.Spine2*4,SKI.Spine2*4+4),SKI.RightShoulder*4);
  set(SKI.LeftArm,3);set(SKI.LeftForeArm,4);set(SKI.LeftHand,4);set(SKI.RightArm,5);set(SKI.RightForeArm,6);set(SKI.RightHand,11);
  set(SKI.LeftUpLeg,7);set(SKI.LeftLeg,8);set(SKI.RightUpLeg,9);set(SKI.RightLeg,10);
  // pés quase sempre paralelos ao chão (seguem um pouco a canela)
  const I=[0,0,0,1];qnlerp(D,SKI.LeftFoot*4,I,0,D,SKI.LeftLeg*4,0.28);qnlerp(D,SKI.RightFoot*4,I,0,D,SKI.RightLeg*4,0.28);
  D.set(D.subarray(SKI.LeftFoot*4,SKI.LeftFoot*4+4),SKI.LeftToeBase*4);D.set(D.subarray(SKI.RightFoot*4,SKI.RightFoot*4+4),SKI.RightToeBase*4);}
/* calcula a pose final, as matrizes da pele e os quadros de encaixe (mão, peito, cabeça) que armas e roupas usam */
function skPose(ch,dt){const s=ch.sk,t=s.t;
  skDaPose(ch,t,s.Dp);let hx=0,hy=t.hip+(ch.hipY||0)*(t.hip/0.92),hz=0;
  /* locomoção do sobrevivente (62z): pose dos clipes misturados, por osso (braços ficam com o jogo quando há algo na mão) */
  if(s.loco&&s.loco.w>0.001){const L=s.loco,w=L.w;for(let b=0;b<SK_N;b++){const wb=w*L.m[b];if(wb>0.001)qnlerp(s.Dp,b*4,s.Dp,b*4,L.D,b*4,wb);}
    hy=lerp(hy,t.hip+L.hy*(t.hip/SKT.akai.hip)+(ch.hipY||0)*(t.hip/0.92)*L.hyJogo,w);hx=lerp(hx,L.hx*(t.hip/SKT.akai.hip),w);hz=lerp(hz,L.hz*(t.hip/SKT.akai.hip),w);}
  // clipe por cima, com mistura (rot gira a animação inteira em torno do eixo vertical)
  if(s.clip){s.cw=approach(s.cw,s.cwAlvo,dt*s.cmix);
    if(s.cw<=0.001&&s.cwAlvo<=0){s.clip=null;}
    else{const a=s.clip;if(!s.ext){s.ct+=dt*s.cv;const fim=s.cfim;if(s.ct>=fim){if(s.cl)s.ct=s.ini0+((s.ct-s.ini0)%Math.max(0.01,fim-s.ini0));else s.ct=fim;}}
      skAmostra(a,s.ct,_Dc,_hc);const w=s.cw,k=t.hip/SKT.akai.hip;
      if(s.rotRaiz){qY(_sq,s.rotRaiz);for(let b=0;b<SK_N;b++)qmul(_Dc,b*4,_sq,0,_Dc,b*4);const c=Math.cos(s.rotRaiz),sn=Math.sin(s.rotRaiz),x=_hc[0];_hc[0]=c*x+sn*_hc[2];_hc[2]=-sn*x+c*_hc[2];}
      for(let b=0;b<SK_N;b++)qnlerp(s.Dp,b*4,s.Dp,b*4,_Dc,b*4,w);
      let cx=0,cz=0;if(s.craiz==='livre'){cx=(_hc[0]-(s.h0x||0))*k;cz=(_hc[2]-(s.h0z||0))*k;}
      hx=lerp(hx,cx,w);hz=lerp(hz,cz,w);hy=lerp(hy,t.hip+_hc[1]*k+(s.dyRaiz||0),w);}}
  // suavização da pose: tira os "pulos" entre poses (troca de estado do zumbi, golpe começando etc.)
  if(!s.ini){s.D.set(s.Dp);s.hip[0]=hx;s.hip[1]=hy;s.hip[2]=hz;s.ini=true;}
  else{const k=1-Math.exp(-dt*s.suave);for(let b=0;b<SK_N;b++)qnlerp(s.D,b*4,s.D,b*4,s.Dp,b*4,k);s.hip[0]=lerp(s.hip[0],hx,k);s.hip[1]=lerp(s.hip[1],hy,k);s.hip[2]=lerp(s.hip[2],hz,k);}
  // cinemática direta no espaço do personagem
  const Q=s.Q,P=s.P,D=s.D;
  for(let b=0;b<SK_N;b++){qmul(Q,b*4,D,b*4,t.qb,b*4);const p=t.pai[b];
    if(p<0){P[0]=s.hip[0];P[1]=s.hip[1];P[2]=s.hip[2];}
    else{qrot(Q,p*4,t.tb[b*3],t.tb[b*3+1],t.tb[b*3+2],_v3);P[b*3]=P[p*3]+_v3[0];P[b*3+1]=P[p*3+1]+_v3[1];P[b*3+2]=P[p*3+2]+_v3[2];}}
  if(ch.proc&&ch.procOmbro){qmul(_sq,0,Q,SKI.Spine2*4,t.AqInv,SKI.Spine2*4);
    for(const[sg,L]of[[1,[SKI.LeftArm,SKI.LeftForeArm,SKI.LeftHand]],[-1,[SKI.RightArm,SKI.RightForeArm,SKI.RightHand]]]){qrot(_sq,0,sg*ch.procOmbro,0,0,_v3);for(const b of L){P[b*3]+=_v3[0];P[b*3+1]+=_v3[1];P[b*3+2]+=_v3[2];}}}
  trs(_ROOT,ch.x,ch.y,ch.z,ch.pitch,ch.yaw,ch.roll,ch.s,ch.s,ch.s);
  for(let b=0;b<SK_N;b++){qMat(_L,Q,b*4,P[b*3],P[b*3+1],P[b*3+2]);const G=s.G.subarray(b*16,b*16+16);mul(G,_ROOT,_L);mul(s.skin.subarray(b*16,b*16+16),G,t.inv.subarray(b*16,b*16+16));}
  // quadros de encaixe no formato dos ossos antigos (para arma na mão, lanterna no peito, chapéu na cabeça, mochila)
  const enc=(i,b,ox,oy,oz)=>{qmul(_sq,0,Q,b*4,t.AqInv,b*4);qrot(Q,b*4,ox,oy,oz,_v3);qMat(_L,_sq,0,P[b*3]+_v3[0],P[b*3+1]+_v3[1],P[b*3+2]+_v3[2]);mul(ch.m.subarray(i*16,i*16+16),_ROOT,_L);};
  const encE=(b,ox,oy,oz)=>{qmul(_sq,0,Q,b*4,t.AqInv,b*4);qrot(Q,b*4,ox,oy,oz,_v3);qMat(_L,_sq,0,P[b*3]+_v3[0],P[b*3+1]+_v3[1],P[b*3+2]+_v3[2]);mul(ch.mE,_ROOT,_L);};
  enc(11,SKI.RightHand,0,0.075,0);if(ch.mE)encE(SKI.LeftHand,0,0.075,0);enc(1,SKI.Spine,0,-0.06,0);enc(2,SKI.Neck,0,0,0);enc(6,SKI.RightForeArm,0,0,0);enc(4,SKI.LeftForeArm,0,0,0);enc(0,SKI.Hips,0,0,0);
  // boneco de partes (jogador): todos os 12 ossos seguem o esqueleto animado; a cabeça vai com o osso da cabeça
  if(ch.proc){enc(2,SKI.Head,0,-0.095,0);enc(3,SKI.LeftArm,0,0,0);enc(5,SKI.RightArm,0,0,0);enc(7,SKI.LeftUpLeg,0,0,0);enc(8,SKI.LeftLeg,0,0,0);enc(9,SKI.RightUpLeg,0,0,0);enc(10,SKI.RightLeg,0,0,0);}}
/* ---------- desenho (sombra e cena) ---------- */
function skDesenharUm(Pg,c){const m=c.sk.t.mesh;gl.uniformMatrix4fv(Pg.u.uSk,false,c.sk.skin);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,m.tipo,0);}
function skSombra(chars,lvp){let ok=false;for(const c of chars){if(!c.sk||!c.sk.t.pronto||c.proc||d2(c.x,c.z,P.x,P.z)>42*42)continue;
    if(!ok){gl.useProgram(PDSK.p);gl.uniformMatrix4fv(PDSK.u.uViewProj,false,lvp||LVP);ok=true;}skDesenharUm(PDSK,c);}}
function skDesenhar(chars){let ok=false;
  for(const c of chars){if(!c.sk||!c.sk.t.pronto||c.proc)continue;if(c===P.ch&&(cfg.cam==='1'||camDist<0.75))continue;
    if(!ok){setLit(PSK);gl.disable(gl.CULL_FACE);gl.uniform1f(PSK.u.uTexK,1.0);ok=true;}
    const t=c.sk.t;gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.uniform1i(PSK.u.uAlb,3);
    gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,t.mask||t.tex);gl.uniform1i(PSK.u.uMask,4);gl.uniform1f(PSK.u.uUseMask,t.mask?1:0);
    if(PSK.u.uNrmT){gl.activeTexture(gl.TEXTURE9);gl.bindTexture(gl.TEXTURE_2D,t.nrm||t.tex);gl.uniform1i(PSK.u.uNrmT,9);gl.activeTexture(gl.TEXTURE10);gl.bindTexture(gl.TEXTURE_2D,t.rug||t.tex);gl.uniform1i(PSK.u.uRugT,10);gl.uniform1f(PSK.u.uUseNrm,t.nrm?1:0);}
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform3fv(PSK.u.uTint,c.tint||[1,1,1]);gl.uniform1f(PSK.u.uIntS,interiorEm(c.x,c.y+0.3,c.z));gl.uniform1f(PSK.u.uPe,c.y||0);gl.uniform1f(PSK.u.uZumbi,c.zumbi?1:0);skDesenharUm(PSK,c);}
  if(ok){gl.uniform1f(PSK.u.uIntS,0);skCascas();skCascasNpc(chars);gl.enable(gl.CULL_FACE);}}
/* roupas vestidas pelo jogador, por cima do corpo */
function skCascas(){const c=P.ch;if(!c||!c.sk||!c.sk.t.pronto||c.proc||!P.roupa||cfg.cam==='1'||camDist<0.75||CARRO.ativo)return;const t=c.sk.t;let ok=false;
  const TAB=t.cascas||SK_CASCAS;for(const slot of ROUPA_SLOTS){const id=P.roupa[slot],L=id&&TAB[id];if(!L)continue;
    if(!ok){setLit(PSKC);gl.uniformMatrix4fv(PSKC.u.uSk,false,c.sk.skin);gl.uniform1f(PSKC.u.uIntS,interiorEm(c.x,c.y+0.3,c.z));gl.uniform3fv(PSKC.u.uTint,c.tint||[1,1,1]);gl.bindVertexArray(t.mesh.vao);ok=true;}
    for(const k of L){const sb=t.sub[k.sub];if(!sb||!sb.n)continue;gl.uniform1f(PSKC.u.uInfla,k.inf);gl.uniform3fv(PSKC.u.uCor,k.lin||(k.lin=lin(k.cor)));gl.uniform1f(PSKC.u.uPelo,k.pelo);
      gl.drawElements(gl.TRIANGLES,sb.n,t.mesh.tipo,sb.off);}}
  if(ok)gl.uniform1f(PSKC.u.uIntS,0);}

/* deslocamento do quadril no clipe (m, escala do Akai) no tempo t, girado por rot: usado pela física para seguir a animação */
function skRaiz(nome,t,rot,o){const a=SKA[nome];o=o||[0,0,0];if(!a){o[0]=o[1]=o[2]=0;return o;}const f=clamp(t*a.fps,0,a.n-1),i=Math.min(a.n-2,Math.floor(f)),k=f-i;
  let x=lerp(a.h[i*3],a.h[(i+1)*3],k),y=lerp(a.h[i*3+1],a.h[(i+1)*3+1],k),z=lerp(a.h[i*3+2],a.h[(i+1)*3+2],k);
  if(rot){const c=Math.cos(rot),s=Math.sin(rot),xx=x;x=c*xx+s*z;z=-s*xx+c*z;}o[0]=x;o[1]=y;o[2]=z;return o;}

/* ================= Serra Velha nova e Gruta da Serra Velha (teste da etapa 1, 12/11/2026) — pedido do Himalaia =================
   "Quero algo realista, inovador, profissional: crie montanhas com cavernas". Projeto de uma página aprovado em 12/11 ("VAYDR —
   Montanhas com cavernas"); este módulo é o teste da etapa 1: a serra de verdade no noroeste e a Gruta da Serra Velha, em que se
   entra andando, sem tela de transição. Os dados vêm de 10a_serra_dados.js (tools/serra_gerar.py: relevo com erosão por gotas de
   chuva e caverna esculpida em 3D).
   · Chão: grade de 0,5 m no retângulo da serra (alinhado às linhas da grade do terreno). As células de lá saem do terreno de
     sempre (terrainData) e a serra desenha as dela em pedaços de 16 m: 0,5 m perto da câmera e 1, 2 e 4 m mais longe, com
     "saia" nas bordas dos pedaços (sem fresta entre níveis). Perto da beira do retângulo e da boca da gruta a grade segue o chão
     de antes ponto a ponto; no resto, curva suave (Catmull-Rom) e lascas de pedra nas encostas íngremes.
   · ground(): na serra, a grade de 0,5 m (mesma divisão em triângulos da malha); dentro da pegada da gruta, o chão da caverna
     (a montanha fica em cima). A grade grossa (TH) recebe a altura nova nos vértices de dentro.
   · Gruta: uma malha só (paredes, teto, estalactites, pedras e o paredão da boca) com programa próprio: rocha da Poly Haven nos
     três eixos, barro molhado no chão, escuro que aumenta para dentro (a luz do dia entra pela boca), brilho da lanterna no
     molhado e olho que se acostuma ao escuro.
   · Dentro da gruta: colisão nas paredes (caixas com faixa de altura), teto para a câmera, abrigo (não chove nem molha), a
     beira da mata deixa passar (a gruta segue por baixo dela).
   · Encosta: andando, o jogador não sobe encosta de mais de ~42° (anda de lado). Árvores, moitas, pedras e capim saem dos
     paredões, da boca e do pátio da frente; a serra ganha mata no pé e nas encostas mais suaves (árvores novas no fim da lista,
     com números novos: os jogos salvos continuam valendo). */
const SVN_G0=ground;   // o chão de antes (o do 61t, que já tem tudo do mundo)
const SVN=(function(){const D=SERRA_DADOS,nx=D.nx,nz=D.nz,x0=D.x0,z0=D.z0,x1=D.x1,z1=D.z1,dx=(x1-x0)/nx,dz=(z1-z0)/nz;
  const i16=s=>{const u=b64bytes(s);return new Int16Array(u.buffer,0,u.length>>1);};
  const S={x0,x1,z0,z1,nx,nz,dx,dz,W1:nx+1,NX2:nx*2,NZ2:nz*2,W2:nx*2+1,hx:dx/2,hz:dz/2,CH:32,pedacos:[],quadro:0,adapt:0};
  /* grade de 1 m: o chão de antes mais o quanto a serra sobe */
  const off=i16(D.off),W1=S.W1,H1=new Float32Array(W1*(nz+1));
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*W1+i;H1[k]=SVN_G0(x0+(x1-x0)*i/nx,z0+(z1-z0)*j/nz)+off[k]/100;}
  S.off=off;S.H1=H1;
  /* células da boca (o terreno some ali; quem desenha é o paredão da gruta) */
  const pb=b64bytes(D.buraco),bur=new Uint8Array(nx*nz);let bi0=1e9,bi1=-1,bj0=1e9,bj1=-1;
  for(let k=0;k<nx*nz;k++)if(pb[k>>3]&(128>>(k&7))){bur[k]=1;const i=k%nx,j=(k/nx)|0;if(i<bi0)bi0=i;if(i>bi1)bi1=i;if(j<bj0)bj0=j;if(j>bj1)bj1=j;}
  S.bur=bur;
  /* distância (m) até a célula de boca mais perto, numa folga de 8 m em volta delas */
  const dbur=(x,z)=>{if(bi1<0)return 99;const i=(x-x0)/dx,j=(z-z0)/dz;if(i<bi0-8||i>bi1+9||j<bj0-8||j>bj1+9)return 99;let b=99;
    for(let jj=Math.max(bj0,Math.floor(j-8));jj<=Math.min(bj1,Math.ceil(j+8));jj++)for(let ii=Math.max(bi0,Math.floor(i-8));ii<=Math.min(bi1,Math.ceil(i+8));ii++)
      if(bur[jj*nx+ii]){const d=Math.hypot((ii+0.5-i)*dx,(jj+0.5-j)*dz);if(d<b)b=d;}return b;};
  /* grade de 0,5 m */
  const NX2=S.NX2,NZ2=S.NZ2,W2=S.W2,H2=new Float32Array(W2*(NZ2+1));
  const h1=(i,j)=>H1[(j<0?0:j>nz?nz:j)*W1+(i<0?0:i>nx?nx:i)];
  const crx=(i,j)=>(-h1(i-1,j)+9*h1(i,j)+9*h1(i+1,j)-h1(i+2,j))/16;   // meio da célula na linha j (curva Catmull-Rom)
  for(let j2=0;j2<=NZ2;j2++)for(let i2=0;i2<=NX2;i2++){const i=i2>>1,j=j2>>1,oi=i2&1,oj=j2&1,x=x0+i2*S.hx,z=z0+j2*S.hz;
    let bil,cr;
    if(!oi&&!oj){bil=cr=h1(i,j);}
    else if(oi&&!oj){bil=(h1(i,j)+h1(i+1,j))/2;cr=crx(i,j);}
    else if(!oi&&oj){bil=(h1(i,j)+h1(i,j+1))/2;cr=(-h1(i,j-1)+9*h1(i,j)+9*h1(i,j+1)-h1(i,j+2))/16;}
    else{bil=(h1(i,j)+h1(i+1,j)+h1(i,j+1)+h1(i+1,j+1))/4;cr=(-crx(i,j-1)+9*crx(i,j)+9*crx(i,j+1)-crx(i,j+2))/16;}
    const borda=Math.min(x-x0,x1-x,z-z0,z1-z),o=Math.abs(off[Math.min(j+oj,nz)*W1+Math.min(i+oi,nx)])/100;
    const w=smooth(4,12,borda)*smooth(0.05,0.6,o)*smooth(1.5,5,dbur(x,z));
    let h=bil+(cr-bil)*w;
    if(w>0){const gx=(h1(i+1,j)-h1(i-1,j))/(2*dx),gz=(h1(i,j+1)-h1(i,j-1))/(2*dz),st=smooth(0.75,1.5,Math.hypot(gx,gz));
      if(st>0)h+=((vnoise(x*0.7+13.1,z*0.7-5.3)-0.5)*0.36+(vnoise(x*1.9-7.7,z*1.9+2.9)-0.5)*0.16)*st*w;}
    H2[j2*W2+i2]=h;}
  S.H2=H2;
  /* gruta */
  const G=D.gruta,P_=G.piso;S.EX=G.boca[0];S.hE=G.boca[1];S.EZ=G.boca[2];S.ca=G.dir[0];S.sa=G.dir[1];
  S.piso={x0:P_.x0,z0:P_.z0,res:P_.res,nx:P_.nx,nz:P_.nz,h:i16(P_.h),teto:i16(P_.teto)};
  S.pisoCaixa=[P_.x0,P_.z0,P_.x0+P_.res*(P_.nx-1),P_.z0+P_.res*(P_.nz-1)];
  S.gruta=G;
  /* linhas da grade grossa que fazem a beira do retângulo */
  const acha=v=>{let b=0,bd=1e9;for(let i=0;i<=T_N;i++){const d=Math.abs(GX[i]-v);if(d<bd){bd=d;b=i;}}return b;};
  S.I0=acha(x0);S.I1=acha(x1);S.J0=acha(z0);S.J1=acha(z1);
  return S;})();
/* altura na grade de 0,5 m (a mesma divisão em triângulos da malha: A,B,C e A,C,D) */
function svnAlt(x,z){const S=SVN,fx=(x-S.x0)/S.hx,fz=(z-S.z0)/S.hz;let i=Math.floor(fx),j=Math.floor(fz);
  if(i<0)i=0;else if(i>=S.NX2)i=S.NX2-1;if(j<0)j=0;else if(j>=S.NZ2)j=S.NZ2-1;
  const u=fx-i,v=fz-j,k=j*S.W2+i,H=S.H2,hA=H[k],hD=H[k+1],hB=H[k+S.W2],hC=H[k+S.W2+1];
  return v>=u?hA+(hC-hB)*u+(hB-hA)*v:hA+(hD-hA)*u+(hC-hD)*v;}
/* chão da caverna (null fora da pegada) e teto em cima dele (null = céu aberto) */
function svnPiso(x,z){const P=SVN.piso,fx=(x-P.x0)/P.res,fz=(z-P.z0)/P.res;if(!(fx>=0&&fz>=0&&fx<P.nx-1&&fz<P.nz-1))return null;
  const i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=j*P.nx+i,h=P.h;let s=0,w=0,q,a;
  if((q=h[k])>-32768){a=(1-u)*(1-v);s+=q*a;w+=a;}if((q=h[k+1])>-32768){a=u*(1-v);s+=q*a;w+=a;}
  if((q=h[k+P.nx])>-32768){a=(1-u)*v;s+=q*a;w+=a;}if((q=h[k+P.nx+1])>-32768){a=u*v;s+=q*a;w+=a;}
  return w>0.05?s/w/100:null;}
function svnTeto(x,z){const P=SVN.piso,i=Math.round((x-P.x0)/P.res),j=Math.round((z-P.z0)/P.res);if(i<0||j<0||i>=P.nx||j>=P.nz)return null;
  const q=P.teto[j*P.nx+i];return q>-32768?q/100:null;}
const svnS=(x,z)=>(x-SVN.EX)*SVN.ca+(z-SVN.EZ)*SVN.sa,svnT=(x,z)=>-(x-SVN.EX)*SVN.sa+(z-SVN.EZ)*SVN.ca;
function svnNaGruta(x,y,z){const f=svnPiso(x,z);if(f===null)return false;const t=svnTeto(x,z);if(t===null)return false;return y>f-1.6&&y<t+0.4;}
/* escuro de dentro: a luz do dia entra pela boca e some uns 13 m para dentro */
function svnEscuro(x,y,z){return svnNaGruta(x,y,z)?0.96*smooth(-0.5,13,svnS(x,z)):0;}
function svnNaSerra(x,z){const S=SVN;return x>S.x0&&x<S.x1&&z>S.z0&&z<S.z1;}
/* o quanto a serra sobe acima do chão de antes (m) e a inclinação (subida por metro) */
function svnOffEm(x,z){const S=SVN,fx=clamp((x-S.x0)/S.dx,0,S.nx-1e-6),fz=clamp((z-S.z0)/S.dz,0,S.nz-1e-6),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=j*S.W1+i,o=S.off;
  return((o[k]*(1-u)+o[k+1]*u)*(1-v)+(o[k+S.W1]*(1-u)+o[k+S.W1+1]*u)*v)/100;}
function svnIncl(x,z){const e=0.7;return Math.hypot(svnAlt(x+e,z)-svnAlt(x-e,z),svnAlt(x,z+e)-svnAlt(x,z-e))/(2*e);}
/* pátio na frente da boca e a própria boca (sem mato, sem árvore, chão pisado) */
function svnPatio(x,z,folga=0){const s=svnS(x,z),t=svnT(x,z);return s>-28-folga&&s<11+folga&&Math.abs(t)<(s<-16?16:21)+folga;}

/* ---------- o chão do jogo passa a ter a serra ---------- */
ground=function(x,z){const S=SVN;if(x>S.x0&&x<S.x1&&z>S.z0&&z<S.z1){const c=S.pisoCaixa;
    if(x>c[0]&&x<c[2]&&z>c[1]&&z<c[3]){const f=svnPiso(x,z);if(f!==null)return f;}
    return svnAlt(x,z);}
  return SVN_G0(x,z);};
/* a grade grossa recebe a altura nova nos vértices de dentro (normais da borda, mapa, quem lê TH direto) */
for(let j=SVN.J0+1;j<SVN.J1;j++)for(let i=SVN.I0+1;i<SVN.I1;i++)TH[j*TW+i]=svnAlt(GX[i],GX[j]);
/* o terreno de sempre não desenha as células da serra */
{const _td=terrainData;terrainData=function(){const T=_td.apply(this,arguments),idx=T.idx,out=new Uint16Array(idx.length),S=SVN;let q=0;
  for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2],i=Math.min(a%TW,b%TW,c%TW),j=Math.min((a/TW)|0,(b/TW)|0,(c/TW)|0);
    if(i>=S.I0&&i<S.I1&&j>=S.J0&&j<S.J1)continue;out[q++]=a;out[q++]=b;out[q++]=c;}
  return{data:T.data,idx:out.slice(0,q)};};}

/* ---------- gruta: colisão, teto, escuro, abrigo e a beira do mapa ---------- */
for(const c of SVN.gruta.col)colBox(c[0],c[1],c[2],c[3],0,{y0:c[4],y1:c[5],gruta:true});
{const _te=tetoEm;tetoEm=function(x,y,z){const r=_te(x,y,z);if(r!==null)return r;return svnNaGruta(x,y,z)?svnTeto(x,z):null;};}
{const _ie=interiorEm;interiorEm=function(x,y,z){const r=_ie(x,y,z);if(r>=0.96)return r;const k=svnEscuro(x,y,z);return k>r?k:r;};}
{const _ab=abrigado;abrigado=function(){if(svnEscuro(P.x,P.y+0.3,P.z)>0.15)return true;return _ab.apply(this,arguments);};}
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){if(_dm(x,z,m))return true;const c=SVN.pisoCaixa;return x>c[0]&&x<c[2]&&z>c[1]&&z<c[3]&&svnPiso(x,z)!==null;};}
/* chuva: dentro da gruta não cai na câmera; e o olho se acostuma ao escuro (devagar, como de verdade) */
{const _ce=computeEnv;let tAnt=0;computeEnv=function(){const r=_ce.apply(this,arguments);try{const S=SVN,agora=performance.now()/1000,dt=Math.min(0.5,Math.max(0,agora-tAnt));tAnt=agora;
    const k=svnEscuro(cam.pos[0],cam.pos[1],cam.pos[2]),alvo=G.modo==='jogo'?k:0;S.adapt+=(alvo-S.adapt)*(1-Math.exp(-dt*(alvo>S.adapt?0.55:1.6)));
    if(E){if(k>0.05&&E.r)E.r*=1-smooth(0.05,0.35,k);if(S.adapt>0.01)E.exp*=1+1.35*S.adapt;
      /* ar mais limpo de dia: com a neblina de antes, a 200 m já não se via quase nada e a serra sumia; agora ela fica azulada
         ao longe (perspectiva do ar) e vira ponto de referência. À noite e na neblina do clima continua como antes */
      if(E.fogD)E.fogD*=lerp(0.6,1,clamp((E.n||0)+(typeof climaK==='function'?climaK('neblina'):0),0,1));}}catch(e){}return r;};}
/* câmera mais perto dentro da gruta */
{const _uc=updateCamera;updateCamera=function(dt){if(cfg.cam==='1'||!svnNaGruta(P.x,P.y+1,P.z))return _uc.apply(this,arguments);
  const cd=cfg.camDist;cfg.camDist=(cd||1)*0.72;try{return _uc.apply(this,arguments);}finally{cfg.camDist=cd;}};}
/* encosta: andando não se sobe paredão; o passo que subiria vira passo de lado */
{const _up=updatePlayer;updatePlayer=function(dt){const x0=P.x,z0=P.z;const r=_up.apply(this,arguments);try{svnEncosta(x0,z0);}catch(e){}return r;};}
function svnEncosta(x0,z0){if(!P.alive||!P.noChao||CARRO.ativo||P.escala||P.montado||P.nada)return;const x=P.x,z=P.z;if(!svnNaSerra(x,z))return;
  if(svnPiso(x,z)!==null)return;if(Math.abs(P.y-svnAlt(x,z))>0.25)return;   // na caverna ou em cima de outra coisa (construção, tronco)
  const e=0.6,gx=(svnAlt(x+e,z)-svnAlt(x-e,z))/(2*e),gz=(svnAlt(x,z+e)-svnAlt(x,z-e))/(2*e),g=Math.hypot(gx,gz);if(g<0.9)return;
  const sobe=((x-x0)*gx+(z-z0)*gz)/g;if(sobe<=0)return;const k=Math.min(1,(g-0.9)/0.3);P.x-=gx/g*sobe*k;P.z-=gz/g*sobe*k;
  if(P.ch){P.ch.x=P.x;P.ch.z=P.z;}}

/* ---------- mata: tira dos paredões, da boca e do pátio; põe mata no pé da serra ---------- */
let SVN_INFO=null;
function svnLimpar(){const inf={arvores:0,pedras:0,moitas:0,chao:0,brenha:0,novas:0},S=SVN;
  const tira=(x,z,lim)=>{if(!svnNaSerra(x,z))return false;const c=S.pisoCaixa;if(x>c[0]-1&&x<c[2]+1&&z>c[1]-1&&z<c[3]+1&&svnPiso(x,z)!==null)return true;
    if(svnPatio(x,z))return true;return lim>0&&svnIncl(x,z)>lim;};
  for(const t of TREES)if(!t.agua&&tira(t.x,t.z,0.72)){t.agua=true;t.alive=false;colRemove(COLL.find(c=>c.tree===t));inf.arvores++;}
  for(const r of ROCKS)if(!r.agua&&tira(r.x,r.z,1.25)){r.agua=true;r.alive=false;colRemove(COLL.find(c=>c.rock===r));inf.pedras++;}
  for(const b of BUSHES)if(!b.agua&&tira(b.x,b.z,0.85)){b.agua=true;b.frutas=false;inf.moitas++;}
  for(const p of PICKS)if(!p.agua&&tira(p.x,p.z,1.1)){p.agua=true;p.alive=false;inf.chao++;}
  for(const L of[GRASS,FLORES,SAMAMBAIAS,FOLHAS_CHAO])for(const b of L)if(b.y>-900&&tira(b.x,b.z,0.95)){b.y=-999;inf.chao++;}
  if(typeof GALHOS_SECOS!=='undefined')for(const b of GALHOS_SECOS)if(b.y>-900&&tira(b.x,b.z,0.95)){b.y=-999;inf.chao++;}
  for(const L of[BRENHA,BRENHA_PEDRAS])for(const b of L)if(b.y>-900&&tira(b.x,b.z,0.9)){b.y=-999;inf.brenha++;}
  /* a parede de mato da beira do mapa passa por cima da gruta: ali ela não segura (a gruta segue por baixo) */
  for(const c of COLL.filter(c=>c.brenha&&svnPiso(c.x,c.z)!==null))colRemove(c);
  /* mata nova no pé da serra e nas encostas suaves (fora do mapa: só para ver; dentro: com colisão) */
  const R=rng(31013);let id=TREES.reduce((m,t)=>Math.max(m,t.id|0),-1)+1;
  for(let k=0;k<26000&&inf.novas<1400;k++){const x=S.x0+8+R()*(S.x1-S.x0-16),z=S.z0+8+R()*(S.z1-S.z0-16),o=svnOffEm(x,z);if(o<1.5||o>48)continue;
    if(tira(x,z,0.6))continue;const ab=vnoise(x*0.03+7.7,z*0.03-2.2);if(R()>lerp(0.15,0.95,smooth(0.3,0.62,ab))*smooth(48,30,o))continue;
    let perto=false;for(const c of colQuery(x,z,2.6))if(c.tree){perto=true;break;}if(perto)continue;
    const r0=R(),alto=smooth(18,40,o),kind=r0<0.12+0.35*alto?0:r0<0.8?1:r0<0.94?3:2,s=1.0+R()*0.85;
    const t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.8+R()*0.3,serra:true};TREES.push(t);
    if(dentroMapa(x,z,-3))colCircle(x,z,TREE_R*s,{tree:t});inf.novas++;}
  SVN_INFO=inf;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{svnLimpar();}catch(e){console.error('serra (mata)',e);}return r;};}

/* ---------- desenho ---------- */
const SVN_CAV_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNrm;layout(location=2) in vec4 aCol;layout(location=3) in float aEsc;
uniform mat4 uViewProj;out vec3 vW,vN;out vec4 vC;out float vE;
void main(){vW=aPos;vN=aNrm;vC=aCol;vE=aEsc;gl_Position=uViewProj*vec4(aPos,1.0);}`;
const SVN_CAV_FS=`precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN;in vec4 vC;in float vE;uniform float uWet;
uniform highp sampler2DArray uTR,uTN;uniform float uTexOn;uniform vec4 uTexTam;uniform vec3 uTexMed[5];
${GLSL_LUZ}
out vec4 o;
/* luz da caverna: como luz(), mas o céu (luz ambiente) quase some lá dentro; lanterna e fogo continuam inteiros */
vec3 luzCav(vec3 p,vec3 n,float esc){float sh=sombra(p,n);gSh=sh;float amb=mix(1.0,0.022,smoothstep(0.0,0.9,esc));
  vec3 L=mix(uHemiG,uHemiS,n.y*0.5+0.5)*mix(0.74,1.0,sh)*amb;
  L+=uDirC*max(dot(n,uDirD),0.0)*sh*(1.0-esc);
  for(int i=0;i<4;i++){if(i>=uNPL)break;vec3 lv=uPL[i].xyz-p;float d=length(lv);float r=uPL[i].w;if(r>0.0&&d<r){
    L+=uPC[i]*max(dot(n,lv/d),0.0)*pow(clamp(1.0-pow(d/r,4.0),0.0,1.0),2.0)/(d*d+1.0);}}
  if(uSpotC.r>0.0){vec3 ls=uSpotP-p;float ds=length(ls);vec3 ln=ls/max(ds,0.001);float cone=smoothstep(uSpotK.x,uSpotK.y,dot(-ln,uSpotD));
    L+=uSpotC*cone*max(dot(n,ln),0.0)*pow(clamp(1.0-pow(ds/uSpotR,4.0),0.0,1.0),2.0)/(ds*ds*0.05+2.2)*2.2;}   /* lanterna mais forte e que alcança mais: na caverna ela é a luz */
  return L;}
void main(){vec3 n0=normalize(vN),n=n0;gInt=vE;
  vec3 bw=pow(abs(n0),vec3(4.0));bw/=bw.x+bw.y+bw.z;float s4=uTexTam.w*1.2;
  vec3 rc;vec3 nr=vec3(0.0);
  if(uTexOn>0.5){vec3 cx=texture(uTR,vec3(vW.zy*s4,3.0)).rgb,cy=texture(uTR,vec3(vW.xz*s4,3.0)).rgb,cz=texture(uTR,vec3(vW.xy*s4,3.0)).rgb;
    vec3 nx=texture(uTN,vec3(vW.zy*s4,3.0)).xyz*2.0-1.0,ny=texture(uTN,vec3(vW.xz*s4,3.0)).xyz*2.0-1.0,nz=texture(uTN,vec3(vW.xy*s4,3.0)).xyz*2.0-1.0;
    rc=cx*bw.x+cy*bw.y+cz*bw.z;float dl=dot(rc,vec3(0.3,0.59,0.11))/max(dot(uTexMed[3],vec3(0.3,0.59,0.11)),1e-4);
    rc=mix(rc*0.42,vec3(0.15,0.14,0.125)*dl,0.45);nr=vec3(0.0,-nx.y,nx.x)*bw.x+vec3(ny.x,0.0,-ny.y)*bw.y+vec3(nz.x,-nz.y,0.0)*bw.z;}
  else{float t1=texture(uNoise,vW.xz*0.21+vW.y*0.13).r,t2=texture(uNoise,vec2(vW.x*0.9+vW.z*0.4,vW.y*1.3)).r;rc=vec3(0.15,0.14,0.125)*(0.65+0.5*t1)*(0.85+0.3*t2);}
  vec3 al=rc*vC.rgb*1.55;
  /* barro no chão: lama marrom-avermelhada, escura e molhada */
  float barro=clamp(vC.a,0.0,1.0),nn=texture(uNoise,vW.xz*0.37).r;
  vec3 lama=vec3(0.085,0.052,0.035)*(0.75+0.5*nn);al=mix(al,lama,barro*0.85);
  n=normalize(n0+nr*0.9*(1.0-barro*0.75));
  /* parede úmida e barro molhado: escurece e brilha na lanterna */
  float molh=mix(0.22,0.85,barro)*smoothstep(0.08,0.5,vE)+uWet*0.35*(1.0-smoothstep(0.1,0.4,vE));
  al*=1.0-molh*0.22;
  vec3 c=al*luzCav(vW,n,vE);
  vec3 v=normalize(uCam-vW);
  if(uSpotC.r>0.0){vec3 ls=uSpotP-vW;float ds=length(ls);vec3 ln=ls/max(ds,0.001);float cone=smoothstep(uSpotK.x,uSpotK.y,dot(-ln,uSpotD));
    float at=pow(clamp(1.0-pow(ds/uSpotR,4.0),0.0,1.0),2.0)/(ds*ds*0.05+2.2);c+=uSpotC*cone*at*pow(max(dot(normalize(mix(n,n0,0.75)),normalize(ln+v)),0.0),48.0)*molh*1.1*(1.0-smoothstep(5.0,14.0,ds));}
  for(int i=0;i<4;i++){if(i>=uNPL)break;vec3 lv=uPL[i].xyz-vW;float d=length(lv);float r=uPL[i].w;if(r>0.0&&d<r){vec3 l=lv/d;
    c+=uPC[i]*pow(max(dot(normalize(mix(n,n0,0.75)),normalize(l+v)),0.0),40.0)*molh*pow(clamp(1.0-pow(d/r,4.0),0.0,1.0),2.0)/(d*d+1.0)*0.9;}}
  c+=uDirC*pow(max(dot(n,normalize(uDirD+v)),0.0),40.0)*molh*0.25*gSh*(1.0-vE);
  o=acabar(c,vW,0.0);}`;
/* cor e terra de cada ponto do chão da serra (a mesma do terreno de sempre, mais o capim seco do alto e o solo nas encostas) */
const SVN_SECO=lin(0x7b7347);
function svnCorV(x,z,ny){let c=groundCol(x,z);const o=svnOffEm(x,z),seco=smooth(10,38,o)*0.55;if(seco>0)c=mixc(c,mixc(SVN_SECO,c,0.35),seco);
  let d=dirtAmt(x,z);const solo=smooth(0.05,0.13,1-ny)*0.55*smooth(2,9,o);if(solo>d)d=solo;
  const s=svnS(x,z),t=svnT(x,z),pt=0.62*smooth(6.5,2,Math.abs(t))*smooth(-15,-8,s)*smooth(2,-1,s);if(pt>d)d=pt;   // trilha pisada até a boca
  return[c[0],c[1],c[2],d];}
/* normal e cor da grade grossa (perto da beira do retângulo a serra puxa para elas: sem costura de luz) */
function svnGrossa(x,z){const i=clamp(cellOf(x),1,T_N-2),j=clamp(cellOf(z),1,T_N-2),u=clamp((x-GX[i])/(GX[i+1]-GX[i]),0,1),v=clamp((z-GX[j])/(GX[j+1]-GX[j]),0,1);
  const nv=(ii,jj)=>{const ddx=(TH[jj*TW+ii+1]-TH[jj*TW+ii-1])/(GX[ii+1]-GX[ii-1]),ddz=(TH[(jj+1)*TW+ii]-TH[(jj-1)*TW+ii])/(GX[jj+1]-GX[jj-1]);return[-ddx,1,-ddz];};
  const cv=(ii,jj)=>{const c=groundCol(GX[ii],GX[jj]);return[c[0],c[1],c[2],dirtAmt(GX[ii],GX[jj])];};
  const mix4=(f)=>{const a=f(i,j),b=f(i+1,j),c=f(i,j+1),d=f(i+1,j+1),r=[];for(let k=0;k<a.length;k++)r.push((a[k]*(1-u)+b[k]*u)*(1-v)+(c[k]*(1-u)+d[k]*u)*v);return r;};
  return{n:mix4(nv),c:mix4(cv)};}
function svnMontaPedaco(pc,lv){const S=SVN,s=1<<lv,i0=pc.i0,j0=pc.j0,i1=pc.i1,j1=pc.j1,H=S.H2,W2=S.W2;
  const xs=[],zs=[];for(let i=i0;i<i1;i+=s)xs.push(i);xs.push(i1);for(let j=j0;j<j1;j+=s)zs.push(j);zs.push(j1);
  const nxv=xs.length,nzv=zs.length,nv=nxv*nzv,np=2*(nxv+nzv),data=new Float32Array((nv+np)*10),saia=1+s;
  const put=(o,x,y,z,n,c)=>{data[o]=x;data[o+1]=y;data[o+2]=z;data[o+3]=n[0];data[o+4]=n[1];data[o+5]=n[2];data[o+6]=c[0];data[o+7]=c[1];data[o+8]=c[2];data[o+9]=c[3];};
  for(let jj=0;jj<nzv;jj++)for(let ii=0;ii<nxv;ii++){const gi=xs[ii],gj=zs[jj],x=S.x0+gi*S.hx,z=S.z0+gj*S.hz,y=H[gj*W2+gi];
    const ia=Math.max(0,gi-s),ib=Math.min(S.NX2,gi+s),ja=Math.max(0,gj-s),jb=Math.min(S.NZ2,gj+s);
    let n=[-(H[gj*W2+ib]-H[gj*W2+ia])/((ib-ia)*S.hx),1,-(H[jb*W2+gi]-H[ja*W2+gi])/((jb-ja)*S.hz)];let l=Math.hypot(n[0],n[1],n[2]);n=[n[0]/l,n[1]/l,n[2]/l];
    let c=svnCorV(x,z,n[1]);const borda=Math.min(x-S.x0,S.x1-x,z-S.z0,S.z1-z),wb=smooth(7,0,borda);
    if(wb>0){const g=svnGrossa(x,z),gl_=Math.hypot(g.n[0],g.n[1],g.n[2]);n=[lerp(n[0],g.n[0]/gl_,wb),lerp(n[1],g.n[1]/gl_,wb),lerp(n[2],g.n[2]/gl_,wb)];l=Math.hypot(n[0],n[1],n[2]);n=[n[0]/l,n[1]/l,n[2]/l];
      c=[lerp(c[0],g.c[0],wb),lerp(c[1],g.c[1],wb),lerp(c[2],g.c[2],wb),lerp(c[3],g.c[3],wb)];}
    put((jj*nxv+ii)*10,x,y,z,n,c);}
  /* saia: a beira do pedaço repetida mais embaixo (tapa a fresta entre pedaços de detalhe diferente) */
  const lados=[[...Array(nxv).keys()].map(ii=>ii),[...Array(nxv).keys()].map(ii=>(nzv-1)*nxv+ii),[...Array(nzv).keys()].map(jj=>jj*nxv),[...Array(nzv).keys()].map(jj=>jj*nxv+nxv-1)];
  let vp=nv;const idx=[];
  for(const L of lados){const base=vp;for(const k of L){const o=k*10,q=vp*10;for(let t=0;t<10;t++)data[q+t]=data[o+t];data[q+1]-=saia;vp++;}
    for(let a=0;a<L.length-1;a++){const p=L[a],q=L[a+1],p2=base+a,q2=base+a+1;idx.push(p,q,q2,p,q2,p2,p,q2,q,p,p2,q2);}}
  for(let jj=0;jj<nzv-1;jj++)for(let ii=0;ii<nxv-1;ii++){
    if(lv<=1){const ci=xs[ii]>>1,cj=zs[jj]>>1;if(ci<S.nx&&cj<S.nz&&S.bur[cj*S.nx+ci])continue;}
    else if(pc.bur){let b=false;for(let cj=zs[jj]>>1;cj<=(zs[jj+1]-1)>>1&&!b;cj++)for(let ci=xs[ii]>>1;ci<=(xs[ii+1]-1)>>1;ci++)if(S.bur[cj*S.nx+ci]){b=true;break;}if(b)continue;}
    const A=jj*nxv+ii,B=A+nxv,C=B+1,Dd=A+1;idx.push(A,B,C,A,C,Dd);}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,vp*10),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,40,24);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);gl.bindVertexArray(null);
  return{vao,vb,ib,n:idx.length,t:S.quadro,lv};}
function svnSoltar(m){if(!m)return;gl.deleteVertexArray(m.vao);gl.deleteBuffer(m.vb);gl.deleteBuffer(m.ib);}
function svnPreparaGL(){const S=SVN;S.pronto=false;
  /* pedaços de 16 m com a caixa de cada um */
  S.pedacos.length=0;const CH=S.CH;
  for(let cj=0;cj*CH<S.NZ2;cj++)for(let ci=0;ci*CH<S.NX2;ci++){const i0=ci*CH,j0=cj*CH,i1=Math.min(i0+CH,S.NX2),j1=Math.min(j0+CH,S.NZ2);let y0=1e9,y1=-1e9;
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const h=S.H2[j*S.W2+i];if(h<y0)y0=h;if(h>y1)y1=h;}
    let bur=false;for(let j=j0>>1;j<=(j1-1)>>1&&!bur;j++)for(let i=i0>>1;i<=(i1-1)>>1;i++)if(S.bur[j*S.nx+i]){bur=true;break;}
    S.pedacos.push({i0,j0,i1,j1,bur,m:[null,null,null,null],b:[S.x0+i0*S.hx,y0-10,S.z0+j0*S.hz,S.x0+i1*S.hx,y1+0.5,S.z0+j1*S.hz]});}
  for(const pc of S.pedacos){pc.m[3]=svnMontaPedaco(pc,3);pc.m[2]=svnMontaPedaco(pc,2);if(pc.bur)pc.m[1]=svnMontaPedaco(pc,1);}
  /* gruta */
  const G=S.gruta,o=G.o,v=b64bytes(G.v),n=b64bytes(G.n),c=b64bytes(G.c),ix=b64bytes(G.i),nv=G.nv;
  const V=new Uint16Array(v.buffer,0,nv*3),N=new Int8Array(n.buffer,0,nv*3),I=new Uint32Array(ix.buffer,0,G.nt*3),data=new Float32Array(nv*11);
  for(let k=0;k<nv;k++){const q=k*11;data[q]=o[0]+V[k*3]/1000;data[q+1]=o[1]+V[k*3+1]/1000;data[q+2]=o[2]+V[k*3+2]/1000;
    data[q+3]=N[k*3]/127;data[q+4]=N[k*3+1]/127;data[q+5]=N[k*3+2]/127;for(let t=0;t<5;t++)data[q+6+t]=c[k*5+t]/255;}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,44,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,44,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,44,24);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,1,gl.FLOAT,false,44,40);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I),gl.STATIC_DRAW);gl.bindVertexArray(null);
  const cx=G.caixa;S.cav={vao,n:I.length,b:[cx[0],cx[1],cx[2],cx[3],cx[4],cx[5]]};
  S.prog=program(SVN_CAV_VS,SVN_CAV_FS,GDEF);S.pronto=true;}
INIT_MALHAS.push(function svnMalhas(){try{svnPreparaGL();}catch(e){console.error('serra (malhas)',e);}});
/* planos da câmera (para não desenhar pedaço fora da tela) */
const SVN_PL=new Float32Array(24);
function svnPlanos(m){for(let p=0;p<6;p++){const r=p>>1,sg=p&1?-1:1,a=m[3]+sg*m[r],b=m[7]+sg*m[4+r],c=m[11]+sg*m[8+r],d=m[15]+sg*m[12+r],l=Math.hypot(a,b,c)||1;
  SVN_PL[p*4]=a/l;SVN_PL[p*4+1]=b/l;SVN_PL[p*4+2]=c/l;SVN_PL[p*4+3]=d/l;}}
function svnVisivel(b){for(let p=0;p<6;p++){const a=SVN_PL[p*4],bb=SVN_PL[p*4+1],c=SVN_PL[p*4+2],d=SVN_PL[p*4+3];
  if(a*(a>0?b[3]:b[0])+bb*(bb>0?b[4]:b[1])+c*(c>0?b[5]:b[2])+d<0)return false;}return true;}
function svnDistCaixa(b,x,y,z){const dx=Math.max(b[0]-x,0,x-b[3]),dy=Math.max(b[1]-y,0,y-b[4]),dz=Math.max(b[2]-z,0,z-b[5]);return Math.hypot(dx,dy,dz);}
const SVN_LOD={baixo:0.6,medio:0.8,alto:1,ultra:1.35};
function svnNivel(pc,d){const k=SVN_LOD[cfg.graf]||1;let lv=d<34*k?0:d<80*k?1:d<190*k?2:3;if(pc.bur&&lv>1)lv=1;return lv;}
function svnMalhaPara(pc,lv,podeMontar){let m=pc.m[lv];if(!m&&podeMontar){m=pc.m[lv]=svnMontaPedaco(pc,lv);SVN.feitos++;}
  if(!m){for(let l=lv+1;l<4;l++)if(pc.m[l])return pc.m[l];for(let l=lv-1;l>=0;l--)if(pc.m[l])return pc.m[l];}return m;}
function svnDesenhaTerreno(){const S=SVN;S.quadro++;S.feitos=0;svnPlanos(VP);const cx=cam.pos[0],cy=cam.pos[1],cz=cam.pos[2];
  setLit(PTER);gl.uniform3f(PTER.u.uSplatT,0.5,0.5,1/(2*SPLAT_H));gl.uniform1f(PTER.u.uWet,E.wet||0);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  let tri=0,ped=0;
  for(const pc of S.pedacos){if(!svnVisivel(pc.b))continue;const lv=svnNivel(pc,svnDistCaixa(pc.b,cx,cy,cz)),m=svnMalhaPara(pc,lv,S.feitos<3);if(!m)continue;
    m.t=S.quadro;gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0);tri+=m.n/3;ped++;}
  S.tri=tri;S.ped=ped;
  /* guarda no máximo 60 pedaços de 0,5 m e 180 de 1 m (os que ficaram mais tempo sem aparecer saem da placa de vídeo) */
  if(S.quadro%30===0)for(const[lv,max]of[[0,60],[1,180]]){const L=S.pedacos.filter(pc=>pc.m[lv]&&!(pc.bur&&lv===1));if(L.length<=max)continue;
    L.sort((a,b)=>a.m[lv].t-b.m[lv].t);for(let k=0;k<L.length-max;k++){svnSoltar(L[k].m[lv]);L[k].m[lv]=null;}}}
function svnDesenhaGruta(){const S=SVN,C=S.cav;if(!C||!svnVisivel(C.b))return;setLit(S.prog);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  gl.bindVertexArray(C.vao);gl.drawElements(gl.TRIANGLES,C.n,gl.UNSIGNED_SHORT,0);}
DESENHO.opaco.push(function svnDesenho(Pg){if(!SVN.pronto)return;try{svnDesenhaTerreno();svnDesenhaGruta();}finally{gl.disable(gl.CULL_FACE);setLit(Pg);}});
DESENHO.sombra.push(function svnSombra(Pg,perto){const S=SVN;if(!S.pronto)return;const R=perto?60:150;gl.uniformMatrix4fv(Pg.u.uModel,false,ID);
  for(const pc of S.pedacos){const b=pc.b,d=Math.hypot(Math.max(b[0]-P.x,0,P.x-b[3]),Math.max(b[2]-P.z,0,P.z-b[5]));if(d>R)continue;
    const m=svnMalhaPara(pc,perto?1:2,false);if(!m)continue;gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0);}
  const C=S.cav,b=C&&C.b;if(C&&Math.hypot(Math.max(b[0]-P.x,0,P.x-b[3]),Math.max(b[2]-P.z,0,P.z-b[5]))<R){gl.bindVertexArray(C.vao);gl.drawElements(gl.TRIANGLES,C.n,gl.UNSIGNED_SHORT,0);}});
/* minimapa: dentro da gruta aparece o nome dela; em cima da serra nova (fora do círculo antigo da região) aparece "Serra Velha"
   em vez de "Mata" */
{const _hl=hud2Lugar;hud2Lugar=function(x,z){try{if(SVN.pronto&&svnS(x,z)>-1&&svnPiso(x,z)!==null&&svnTeto(x,z)!==null)return{nome:SERRA_DADOS.gruta.nome||'Gruta da Serra Velha',d:null};}catch(e){}
  const r=_hl.apply(this,arguments);try{if(r&&r.d===null&&r.nome==='Mata'&&svnNaSerra(x,z)&&svnOffEm(x,z)>3)return{nome:'Serra Velha',d:null};}catch(e){}return r;};}

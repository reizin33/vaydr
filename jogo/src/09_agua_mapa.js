/* ================= rio e lago: traçado, nível da água e o leito escavado no terreno =================
   O Rio Claro desce das serras ao norte, passa a leste da clareira, cruza a estrada asfaltada debaixo da ponte
   e deságua no Lago Serra Azul, ao sul (com uma ilhota). Este arquivo só define a forma e a altura da água:
   o terreno usa aguaTerreno() para cavar o leito e aguaPlano() para alisar o vale; o resto do mundo pergunta
   aguaNivel(x,z) (altura da superfície ou null) e aguaProf(x,z) (profundidade).
   O nível é calculado do próprio terreno: desce sempre rio abaixo e termina no nível do lago. */
const RIO_PTS=[[44,-178],[36,-150],[26,-124],[18,-98],[16,-70],[14,-45],[16,-22],[24,-2],[31,9],[34,26],[30,46],[37,70],[52,95]];
const LAGO={x:66,z:104,a:24,b:17,ilha:{x:73,z:108,r:4.6}};
const RIO={pts:[],cum:[],L:0,nivel:null,ok:false,larg:s=>lerp(3.6,5.4,clamp(s,0,1)),prof:s=>lerp(1.55,2.5,clamp(s,0,1)),BANCO:5};
(function(){let L=0;RIO.pts=RIO_PTS.map(p=>p.slice());RIO.cum=[0];for(let i=1;i<RIO.pts.length;i++){L+=Math.hypot(RIO.pts[i][0]-RIO.pts[i-1][0],RIO.pts[i][1]-RIO.pts[i-1][1]);RIO.cum.push(L);}RIO.L=L;})();
/* ponto mais perto do traçado: distância, posição ao longo (0..1) e direção da correnteza */
const _rq={d:0,s:0,dx:0,dz:1,i:0};
function rioPerto(x,z){let bd=1e9,bs=0,bi=0,bt=0;const P_=RIO.pts;
  for(let i=0;i<P_.length-1;i++){const a=P_[i],b=P_[i+1],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=clamp(t,0,1);
    const d=Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t);if(d<bd){bd=d;bi=i;bt=t;}}
  const a=P_[bi],b=P_[bi+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;_rq.d=bd;_rq.i=bi;_rq.s=(RIO.cum[bi]+bt*l)/RIO.L;_rq.dx=(b[0]-a[0])/l;_rq.dz=(b[1]-a[1])/l;return _rq;}
/* distância normalizada ao lago (1 = margem), com a margem um pouco irregular */
function lagoR(x,z){const dx=(x-LAGO.x)/LAGO.a,dz=(z-LAGO.z)/LAGO.b,ang=Math.atan2(dz,dx);return Math.hypot(dx,dz)/(1+0.07*Math.sin(3*ang+0.7)+0.05*Math.sin(5*ang+2.1));}
function ilhaD(x,z){return Math.hypot(x-LAGO.ilha.x,z-LAGO.ilha.z);}
/* alisamento do vale (entra no flatMask do terreno): o relevo fica mais manso perto da água */
function aguaPlano(x,z){if(x<-20||z<-185)return 1;let m=1;
  const q=rioPerto(x,z),w=RIO.larg(q.s);if(q.d<w+30)m=Math.min(m,lerp(0.42,1,smooth(w+2,w+28,q.d)));
  const r=lagoR(x,z);if(r<2.1)m=Math.min(m,lerp(0.25,1,smooth(1.0,2.0,r)));return m;}
/* nível do lago e do rio: calculados uma vez, do terreno já alisado (sem a escavação) */
function hSemAgua(x,z){return baseH(x,z)*flatMask(x,z)+(vnoise(x*0.7+50,z*0.7)-0.5)*0.07*smooth(4,14,distCidade(x,z));}
function aguaNiveis(){if(RIO.ok)return;RIO.ok=true;
  // lago: abaixo do ponto mais baixo da margem
  let lk=1e9;for(let k=0;k<48;k++){const a=k/48*6.283;for(const f of[1.0,1.12]){const x=LAGO.x+Math.cos(a)*LAGO.a*f,z=LAGO.z+Math.sin(a)*LAGO.b*f;lk=Math.min(lk,hSemAgua(x,z));}}
  LAGO.nivel=lk-0.35;
  // rio: 64 amostras; cada uma abaixo do chão das margens; nunca sobe rio abaixo; termina no lago
  const N=64,niv=new Float32Array(N+1);
  for(let i=0;i<=N;i++){const s=i/N,p=rioPonto(s),w=RIO.larg(s);let mn=1e9;for(const o of[-1.25,-1,1,1.25]){mn=Math.min(mn,hSemAgua(p[0]-p[3]*w*o,p[1]+p[2]*w*o));}niv[i]=mn-0.45;}
  for(let i=1;i<=N;i++)niv[i]=Math.min(niv[i],niv[i-1]);
  for(let i=0;i<=N;i++)niv[i]=Math.max(niv[i],LAGO.nivel);
  // suaviza (média móvel) e garante de novo a descida
  const sm=new Float32Array(N+1);for(let i=0;i<=N;i++){let a=0,c=0;for(let k=-3;k<=3;k++){const j=clamp(i+k,0,N);a+=niv[j];c++;}sm[i]=a/c;}
  for(let i=1;i<=N;i++)sm[i]=Math.min(sm[i],sm[i-1]);sm[N]=LAGO.nivel;for(let i=N-1;i>=N-4;i--)sm[i]=Math.max(LAGO.nivel,Math.min(sm[i],LAGO.nivel+(N-i)*0.06));
  RIO.nivel=sm;}
function rioPonto(s){const d=clamp(s,0,1)*RIO.L,P_=RIO.pts;let i=0;while(i<P_.length-2&&RIO.cum[i+1]<d)i++;const a=P_[i],b=P_[i+1],l=(RIO.cum[i+1]-RIO.cum[i])||1,t=(d-RIO.cum[i])/l;
  return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,(b[0]-a[0])/l,(b[1]-a[1])/l];}
function rioNivel(s){const N=RIO.nivel.length-1,f=clamp(s,0,1)*N,i=Math.min(N-1,Math.floor(f)),t=f-i;return lerp(RIO.nivel[i],RIO.nivel[i+1],t);}
/* terreno com o leito do rio e a bacia do lago escavados (e a ilhota) */
function aguaTerreno(x,z,h){if(x<-20||z<-190)return h;aguaNiveis();
  // lago
  const r=lagoR(x,z);
  if(r<1.9){const Lk=LAGO.nivel,di=ilhaD(x,z),IR=LAGO.ilha.r;
    if(r<1){const fundo=Lk-0.35-3.9*Math.pow(1-r*r,0.8);let hh=Math.min(h,fundo);
      if(di<IR+5){const k=smooth(IR+5,IR-0.5,di);hh=lerp(hh,Lk+1.15+0.25*vnoise(x*0.4,z*0.4),k);}return hh;}
    const sm=smooth(1.0,1.55,r);h=Math.max(lerp(Lk,h,sm),Lk+0.4*smooth(1.0,1.08,r));}
  // rio
  const q=rioPerto(x,z);if(q.d>RIO.larg(q.s)+RIO.BANCO+1)return h;
  if(q.s>0.985&&lagoR(x,z)<1.05)return h;
  const w=RIO.larg(q.s),D=RIO.prof(q.s),L=rioNivel(q.s);
  if(q.d<w){const u=q.d/w,fundo=L-0.3-D*(1-u*u);return Math.min(h,fundo);}
  const sm=smooth(w,w+RIO.BANCO,q.d);return Math.max(lerp(L,h,sm),L+0.38*smooth(w,w+1.3,q.d));}
/* consulta: altura da superfície da água em (x,z) (null se não tem água ali) */
function aguaNivel(x,z){if(!RIO.ok||x<-20||z<-190)return null;
  const r=lagoR(x,z);if(r<1.02&&ilhaD(x,z)>LAGO.ilha.r+0.5)return LAGO.nivel;
  const q=rioPerto(x,z),w=RIO.larg(q.s),ex=RIO.enchente||0;if(q.d<w+0.25+ex*4&&q.s<=1)return rioNivel(q.s)+ex;return null;}
function aguaProf(x,z){const n=aguaNivel(x,z);if(n===null)return 0;return Math.max(0,n-ground(x,z));}
/* para colocar coisas no mundo: está na água ou na margem molhada? */
function aguaPerto(x,z,m){if(x<-24-m||z<-190)return false;if(lagoR(x,z)<1+(m||0)/Math.min(LAGO.a,LAGO.b))return true;const q=rioPerto(x,z);return q.d<RIO.larg(q.s)+(m||0);}
/* ponte da estrada sobre o rio */
const PONTE={x:31,z:8.7,yaw:0,hw:10,hd:3.6,y:0};
let VEG_GERANDO=false;

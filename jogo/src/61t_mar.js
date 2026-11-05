/* ================= Etapa 20: o mar — costa, praia, maré, água salgada, malhas e mapa =================
   A costa fica a leste da cidade (x ≈ 352) e faz uma curva suave para noroeste e para sudoeste: a cidade fica na ponta,
   com o mar na frente e dos dois lados. Entre o tapume da cidade e a água há uma praia de areia, estreita na frente da cidade
   e larga nas pontas (lá, atrás das dunas, tem um alagado que enche na maré alta).
   costaD(x,z): distância até a linha da costa (positiva no mar). O fundo desce devagar perto da praia (bancos de areia) e
   depois mais fundo; um canal dragado acompanha o cais do porto (onde está o navio).
   Maré: o nível do mar sobe e desce num ciclo de 12,4 horas do jogo (duas marés altas por dia). Perto da lua cheia e da
   lua nova a maré é maior (sizígia); nos quartos, menor. Vento e chuva aumentam as ondas.
   A água do mar entra em aguaNivel/aguaProf/aguaPerto: nadar, barco, afogados, pescar e encher garrafa funcionam no mar
   (água salgada não mata a sede). Fora da grade do terreno (x > 360) o chão é o fundo do mar, desenhado à parte. */
const MAR={base:-0.9,amp:0.72,periodo:12.4,fase:0.12,onda:0.14,x0:352,z0:60,k:0.00161,larg:14,largMax:40,hIn:0.3,hInMax:0.55,
  zJog:330,dJog:240,areas:[]};
const MAPA_MAR={x1:420};
function costaX(z){const a=Math.max(0,Math.abs(z)-MAR.z0);return MAR.x0-MAR.k*a*a;}
function costaS(z){const a=Math.max(0,Math.abs(z)-MAR.z0);return z>0?-2*MAR.k*a:2*MAR.k*a;}   // dx/dz da linha da costa
function costaD(x,z){const s=costaS(z);return(x-costaX(z))/Math.sqrt(1+s*s);}
function costaN(z){const s=costaS(z),l=Math.sqrt(1+s*s);return[1/l,-s/l];}   // normal para o mar
function marLarg(z){return lerp(MAR.larg,MAR.largMax,smooth(90,230,Math.abs(z)));}
function marHin(z){return lerp(MAR.hIn,MAR.hInMax,smooth(90,230,Math.abs(z)));}
/* perto o bastante da costa para a água do mar contar (e fora da cidade) */
function marEm(x,z){return x>costaX(z)-MAR.largMax-4&&!dentroCidade(x,z,0.5);}
/* altura do fundo (e da praia) a uma distância d da costa */
function marPerfil(d,x,z){const S=MAR.base;let h;
  if(d<0){const u=Math.min(1,-d/marLarg(z));h=S+0.2+u*(marHin(z)-S-0.2);}
  else if(d<30)h=S+0.2-d*0.07;else if(d<100)h=S-1.9-(d-30)*0.06;else h=Math.max(-16,S-6.1-(d-100)*0.035);
  if(d>3)h+=(vnoise(x*0.045+17,z*0.045-5)-0.5)*0.7*smooth(3,18,d);   // bancos de areia
  for(const a of MAR.areas)h=a(x,z,h,d);
  return h;}
/* áreas especiais do fundo: canal do porto, chão plano do naufrágio, alagado atrás da duna */
const dRet=(x,z,x0,x1,z0,z1)=>Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));
const PORTO={x0:336,x1:376,z0:-4,z1:20,y:0.35,navio:{x:383.6,z:8,L:76,B:12,yDeck:3.85,quilha:-6.2},
  canal:{x0:371,x1:398,z0:-44,z1:60,fundo:-6.6},naufragio:{x:372,z:112,fundo:-2.3},veleiro:{x:428,z:-150,fundo:-6.4},
  alagado:{x:296,z:-204,rx:12,rz:8,fundo:-0.45},rampa:{z:44,w:5}};
MAR.areas.push((x,z,h)=>{const C=PORTO.canal,d=dRet(x,z,C.x0,C.x1,C.z0,C.z1);if(d>9)return h;return Math.min(h,lerp(h,C.fundo,smooth(9,1,d)));},
  (x,z,h)=>{const N=PORTO.naufragio,d=Math.hypot(x-N.x,z-N.z);if(d>18)return h;return lerp(h,N.fundo,smooth(18,10,d));},
  (x,z,h)=>{const N=PORTO.veleiro,d=Math.hypot(x-N.x,z-N.z);if(d>20)return h;return lerp(h,N.fundo,smooth(20,9,d));},
  (x,z,h,d)=>{const A=PORTO.alagado,q=Math.hypot((x-A.x)/A.rx,(z-A.z)/A.rz);if(q>1.9)return h;return Math.min(h,lerp(h,A.fundo+0.08*vnoise(x*0.5,z*0.5),smooth(1.9,0.85,q)));});
/* terreno: a praia e o fundo substituem o morro perto da costa (fora da cidade) */
function marTerreno(x,z,h){if(dentroCidade(x,z,0.5))return h;const d=costaD(x,z),W=marLarg(z);if(d<-W-18)return h;const p=marPerfil(d,x,z);
  if(d<-W)return lerp(p,h,smooth(-W,-W-18,d));return p;}
/* fora da grade do terreno: o fundo do mar (e, nas pontas, a terra subindo) */
function marFora(x,z){const d=costaD(x,z),W=marLarg(z);if(d>=-W)return marPerfil(d,x,z);return lerp(marHin(z),6,smooth(-W,-W-40,d));}
(function marAplicar(){for(let j=0;j<=T_N;j++)for(let i=0;i<=T_N;i++){const x=GX[i],z=GX[j];if(x<costaX(z)-MAR.largMax-22)continue;const k=j*TW+i;TH[k]=marTerreno(x,z,TH[k]);}})();
ground=function(x,z){const i=cellOf(x),j=cellOf(z);if(i<0||j<0)return marFora(x,z);
  const u=(x-GX[i])/(GX[i+1]-GX[i]),v=(z-GX[j])/(GX[j+1]-GX[j]);
  const hA=TH[j*TW+i],hD=TH[j*TW+i+1],hB=TH[(j+1)*TW+i],hC=TH[(j+1)*TW+i+1];
  return v>=u?hA+(hC-hB)*u+(hB-hA)*v:hA+(hD-hA)*u+(hC-hD)*v;};
/* ---------- maré ---------- */
function mareHoras(){return(G.dia||1)*24+(G.hora||0);}
function mareFase(){const f=mareHoras()/MAR.periodo+MAR.fase;return f-Math.floor(f);}   // 0,25 = alta · 0,75 = baixa
function mareAmp(){let f=0;try{f=luaFase();}catch(e){}return MAR.amp*(0.72+0.28*Math.abs(Math.cos(Math.PI*2*f/LUA_CICLO)));}
let _mnT=-1,_mnV=MAR.base;
function marNivel(){if(_mnT!==G.t){_mnT=G.t;_mnV=MAR.base+mareAmp()*Math.sin(2*Math.PI*mareFase());}return _mnV;}
function mareEstado(){const a=2*Math.PI*mareFase(),s=Math.sin(a);return s>0.8?'alta':s<-0.8?'baixa':Math.cos(a)>0?'enchendo':'vazando';}
function mareProx(){const f=mareFase(),ate=a=>((a-f)%1+1)%1*MAR.periodo;return{alta:ate(0.25),baixa:ate(0.75)};}
const MARE_NOME={alta:'Maré alta',baixa:'Maré baixa',enchendo:'Maré enchendo',vazando:'Maré vazando'};
const mareHorasTxt=h=>{const m=Math.round(h*60);return m<60?m+' min':Math.floor(m/60)+' h'+(m%60?(' '+String(m%60).padStart(2,'0')):'');};
/* ondas: as mesmas na malha (vértice) e aqui (barco, nado, linha de pesca) */
let _oaT=-1,_oaV=MAR.onda;
function marOndaA(){if(_oaT!==G.t){_oaT=G.t;let v=0;try{v=climaK('ventania');}catch(e){}const ch=G.chuva||0;_oaV=MAR.onda*(1+1.5*Math.max(v,ch>0.4?0.6*ch:0));}return _oaV;}
function marOnda(x,z){const t=G.t;return marOndaA()*(0.6*Math.sin(x*0.11+z*0.03-t*1.1)+0.4*Math.sin(x*0.05-z*0.07-t*0.7));}
function marNivelEm(x,z){return marNivel()+marOnda(x,z);}
/* até onde a água chega agora (distância da costa, negativa = em cima da areia) */
function marLinhaD(z){const n=marNivel(),hi=marHin(z),S=MAR.base;if(n>=S+0.2)return -Math.min(1,(n-S-0.2)/(hi-S-0.2))*marLarg(z);return(S+0.2-n)/0.07;}
/* ---------- a água do mar no resto do jogo ---------- */
const _anDoce=aguaNivel,_apDoce=aguaPerto;
aguaNivel=function(x,z){if(marEm(x,z)){const d=costaD(x,z);if(d>-MAR.largMax-2){const n=marNivelEm(x,z);if(n>ground(x,z)-0.01)return n;if(d>=0)return null;}}return _anDoce(x,z);};   // banco de areia de fora na maré baixa: seco
aguaPerto=function(x,z,m){if(marEm(x,z)&&costaD(x,z)>marLinhaD(z)-(m||0))return true;return _apDoce(x,z,m);};
/* é água do mar (salgada)? */
function aguaDoMar(x,z){if(!marEm(x,z))return false;const d=costaD(x,z);return d>-MAR.largMax-2&&_anDoce(x,z)===null;}
/* área jogável: a praia e o mar até ~240 m da costa */
function marJogavel(x,z,m=0){if(Math.abs(z)>MAR.zJog-m||x<costaX(z)-MAR.largMax-4)return false;const d=costaD(x,z);return d>-marLarg(z)-2+m&&d<MAR.dJog-m;}   // emenda com a cidade sem faixa de fora
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){if(_dm(x,z,m))return true;return marJogavel(x,z,m);};
 const _fp=faunaPontoOk;faunaPontoOk=function(x,z){if(marEm(x,z)&&costaD(x,z)>-MAR.largMax-6)return false;return _fp.apply(this,arguments);};}
/* cor do chão: areia seca, areia molhada (onde a maré alta chega) e o fundo */
const MAR_COR={seca:lin(0xcbb78e),seca2:lin(0xd9c9a2),molhada:lin(0x9a8865),fundo:lin(0x75694f),fundo2:lin(0x3f4840),mato:lin(0x55663a)};
function marCorChao(x,z,c){if(!marEm(x,z))return c;const d=costaD(x,z),W=marLarg(z);if(d<-W-14)return c;
  let s=mixc(MAR_COR.seca,MAR_COR.seca2,vnoise(x*0.3+3,z*0.3-8)*0.7);
  s=mixc(s,MAR_COR.molhada,smooth(-W*0.62,-W*0.18,d));
  if(d>0)s=mixc(MAR_COR.molhada,mixc(MAR_COR.fundo,MAR_COR.fundo2,smooth(12,70,d)),smooth(0,9,d));
  {const A=PORTO.alagado,q=Math.hypot((x-A.x)/A.rx,(z-A.z)/A.rz);if(q<2)s=mixc(s,lin(0x5b5440),smooth(1.8,0.8,q));}
  return mixc(s,c,smooth(-W,-W-14,d));}
{const _acc=aguaCorChao;aguaCorChao=function(x,z,c){return marCorChao(x,z,_acc(x,z,c));};}
/* ---------- malhas: a água do mar (com ondas e maré no vértice) e o fundo fora da grade do terreno ---------- */
const MAR_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec4 aD;uniform mat4 uViewProj;uniform float uMarY,uOndaA,uTime;uniform vec3 uCam;
out vec3 vW;out vec4 vD;
void main(){vec2 p=aPos.xz;float t=uTime;float dc=length(p-uCam.xz);float A=uOndaA*(1.0-smoothstep(260.0,520.0,dc));
float w=A*(0.6*sin(p.x*0.11+p.y*0.03-t*1.1)+0.4*sin(p.x*0.05-p.y*0.07-t*0.7));
float y=uMarY+w;vW=vec3(p.x,y,p.y);vD=vec4(aD.xyz,y-aPos.y);gl_Position=uViewProj*vec4(vW,1.0);}`;
const MAR_FS=AGUA_FS.replace('uniform vec3 uCeu;','uniform vec3 uCeu;uniform float uOndaA;')
  .replace('vec3 fundo=mix(vec3(0.045,0.085,0.07),vec3(0.008,0.03,0.04),clamp(prof/3.2,0.0,1.0));','vec3 fundo=mix(vec3(0.07,0.16,0.15),vec3(0.004,0.03,0.058),clamp(prof/7.0,0.0,1.0));')
  .replace('float espuma=(1.0-smoothstep(0.0,0.3,prof))*(0.55+0.45*a2);','float espuma=(1.0-smoothstep(0.0,0.42,prof))*(0.5+0.5*a2)+smoothstep(0.62,0.72,a1*0.6+a2*0.4)*clamp(uOndaA*2.2-0.25,0.0,0.6)*smoothstep(1.0,4.0,prof);')
  .replace('float a=clamp(0.5+prof*0.2,0.5,0.93);','float a=clamp(0.55+prof*0.16,0.55,1.0);')
  .replace('vec3 col=mix(fundo*L*1.5,ceu*(1.0-0.5*uNoite),fr*0.9);','vec3 col=mix(fundo*L*1.5,ceu*vec3(0.6,0.74,0.84)*(1.0-0.5*uNoite),fr*0.72);');   // o reflexo do céu puxado para o azul do mar
let MARM=null;
const MAR_OFF=[-50,-46,-42,-38,-34,-30,-27,-24,-21,-18,-16,-14,-12,-10,-8,-6,-4,-2,0,2,4,6,9,12,16,21,27,34,42,52,65,80,100,125,160,210,280,370,480,620,800,1000,1250,1500];
function marPonto(z,o){const n=costaN(z);return[costaX(z)+o*n[0],z+o*n[1]];}
function marMalhas(){const ZS=[];for(let z=-700;z<=700;){ZS.push(z);const az=Math.abs(z);z+=az<360?2:az<500?4:8;}const NO=MAR_OFF.length,NZ=ZS.length;
  // vértices: posição e chão
  const VX=new Float32Array(NZ*NO),VZ=new Float32Array(NZ*NO),VG=new Float32Array(NZ*NO),VC=new Uint8Array(NZ*NO);
  for(let a=0;a<NZ;a++)for(let b=0;b<NO;b++){const p=marPonto(ZS[a],MAR_OFF[b]),k=a*NO+b;VX[k]=p[0];VZ[k]=p[1];
    if(dentroCidade(p[0],p[1],0.5)){VG[k]=5;VC[k]=1;}else VG[k]=ground(p[0],p[1]);}
  const topo=MAR.base+MAR.amp+0.45,ga=new GB(1<<17,7),gf=new GB(1<<16,8),fora=k=>Math.abs(VX[k])>=359.4||Math.abs(VZ[k])>=359.4;
  const corF=(x,z,g)=>{const c=marCorChao(x,z,MAR_COR.mato);return scl(c,lerp(1,0.55,smooth(-1,-9,g)));};
  for(let a=0;a<NZ-1;a++)for(let b=0;b<NO-1;b++){const q=[a*NO+b,a*NO+b+1,(a+1)*NO+b+1,(a+1)*NO+b];
    if(q.some(k=>VC[k]))continue;
    // água: só onde pode molhar
    if(q.some(k=>VG[k]<topo)){const n=costaN(ZS[a]);for(const t of[0,1,2,0,2,3]){const k=q[t];ga.v7(VX[k],VG[k],VZ[k],-n[0]*0.3,-n[1]*0.3,0.35,0);}}
    // fundo: fora da grade do terreno (o terreno cobre o resto)
    if(q.some(fora)&&MAR_OFF[b]>-46){const P_=q.map(k=>[VX[k],VG[k]-0.03,VZ[k]]);
      const nrm=(A,B,C)=>{const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;if(ny<0){nx=-nx;ny=-ny;nz=-nz;}return[nx/l,ny/l,nz/l];};
      for(const tri of[[0,1,2],[0,2,3]]){const N=nrm(P_[tri[0]],P_[tri[1]],P_[tri[2]]);for(const t of tri){const p=P_[t],c=corF(p[0],p[2],p[1]);gf.v8(p[0],p[1],p[2],c[0],c[1],c[2],0,0,N[0],N[1],N[2]);}}}}
  MARM={prog:program(MAR_VS,MAR_FS,GDEF),agua:unMesh(ga.data()),fundo:litMesh(gf.data())};}
INIT_MALHAS.push(marMalhas);
function marPerto(){return MARM&&costaD(cam.pos[0],cam.pos[2])>-480;}
function desenharMar(){if(!marPerto())return;const Pg=MARM.prog,u=Pg.u,post=POSTX.ok&&!!GDEF;
  setLit(Pg);gl.uniform1f(u.uChuva,E.r||0);gl.uniform1f(u.uNoite,E.n||0);gl.uniform3fv(u.uCeu,post?toLin(E.zen,E.exp):E.zen);gl.uniform1f(u.uMarY,marNivel());gl.uniform1f(u.uOndaA,marOndaA());
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);gl.disable(gl.CULL_FACE);
  gl.bindVertexArray(MARM.agua.vao);gl.drawArrays(gl.TRIANGLES,0,MARM.agua.count);gl.disable(gl.BLEND);gl.depthMask(true);}
DESENHO.agua.push(desenharMar);
DESENHO.opaco.push(Pg=>{if(marPerto())drawStat(Pg,MARM.fundo,ID);});
/* ---------- serras de fundo: somem no lado do mar (o horizonte do mar fica aberto) ---------- */
silhouettes=function(){const U=new GB(1<<13,7);
  const ring=(Rr,n,hb,ha,f,br,ft,sd)=>{const hh=a=>{const x=Rr*Math.cos(a),z=Rr*Math.sin(a),k=smooth(25,-70,costaD(x,z));
      return(hb+(vnoise(Math.cos(a)*f+sd,Math.sin(a)*f)*0.7+vnoise(Math.cos(a)*f*3+sd,Math.sin(a)*f*3)*0.3)*ha)*k-8*(1-k);};
    for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,h0=hh(a0),h1=hh(a1);if(h0<-7.9&&h1<-7.9)continue;
      const b0=[Rr*Math.cos(a0),-8,Rr*Math.sin(a0)],b1=[Rr*Math.cos(a1),-8,Rr*Math.sin(a1)],t0=[b0[0],h0,b0[2]],t1=[b1[0],h1,b1[2]];
      for(const[p,g]of[[b0,1],[b1,1],[t1,ft],[b0,1],[t1,ft],[t0,ft]])U.v7(p[0],p[1],p[2],br,g,0,1);}};
  ring(490,150,23,68,2.2,1.2,0.45,3);ring(430,130,13,36,3.1,0.82,0.24,11);
  return U.data();};
/* ---------- mapa e minimapa: o mar, a praia e o alagado ---------- */
MAPA_DESENHOS.push((g,X,Y,k,n,range)=>{if(range<1e4&&costaD(P.x,P.z)<-range-60)return;
  const areia=n>0.5?'#4a4436':'#c9b48a',agua=n>0.5?'#1d3346':'#3f7fb8',lim=range<1e4?[P.z-range-20,P.z+range+20]:[-700,700];
  const pts=o=>{const L=[];for(let z=Math.max(-700,lim[0]);z<=Math.min(700,lim[1]);z+=6){const W=o==='praia'?-marLarg(z):o==='agua'?marLinhaD(z):0;L.push(marPonto(z,W));}return L;};
  for(const[o,cor]of[['praia',areia],['agua',agua]]){const L=pts(o);if(L.length<2)continue;g.fillStyle=cor;g.beginPath();g.moveTo(X(L[0][0]),Y(L[0][1]));for(const p of L)g.lineTo(X(p[0]),Y(p[1]));
    g.lineTo(X(2400),Y(L[L.length-1][1]));g.lineTo(X(2400),Y(L[0][1]));g.closePath();g.fill();}
  const A=PORTO.alagado;if(marNivel()>A.fundo+0.05){g.fillStyle=agua;g.beginPath();g.ellipse(X(A.x),Y(A.z),A.rx*k*0.9,A.rz*k*0.9,0,0,Math.PI*2);g.fill();}});
/* ---------- maré no relógio (perto do mar) ---------- */
iconesNovos({'i-mare':'<path d="M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1"/><path d="M2 19c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1"/><path d="M12 3v8M9 8l3 3 3-3"/>',
  'i-onda':'<path d="M2 16c3 0 3-6 7-6 3 0 3 3 5 3s3-5 8-5"/><path d="M2 20h20"/>'});
{const est=$('dia-est');if(est&&!$('dia-mare'))est.insertAdjacentHTML('afterend','<span class="dia-clima dia-est dia-mare" id="dia-mare" hidden><svg class="ico" aria-hidden="true"><use href="#i-mare"/></svg><span>Maré</span></span>');}
let mareHudT=0;
HUDS.push(()=>{mareHudT-=1;if(mareHudT>0)return;mareHudT=15;const el=$('dia-mare');if(!el)return;const perto=G.modo==='jogo'&&marEm(P.x,P.z)&&costaD(P.x,P.z)>-70;
  if(el.hidden===perto)el.hidden=!perto;if(!perto)return;const e=mareEstado(),pr=mareProx(),t=MARE_NOME[e]+(e==='enchendo'?' · alta em '+mareHorasTxt(pr.alta):e==='vazando'?' · baixa em '+mareHorasTxt(pr.baixa):'');
  const sp=el.querySelector('span');if(sp.textContent!==t)sp.textContent=t;el.title='Nível do mar: '+(marNivel()-MAR.base>=0?'+':'')+(marNivel()-MAR.base).toFixed(1).replace('.',',')+' m · próxima maré alta em '+mareHorasTxt(pr.alta)+' · baixa em '+mareHorasTxt(pr.baixa);});
/* ---------- chegando na praia: dica e diário ---------- */
let marVistoT=0;
PASSOS.push(dt=>{marVistoT-=dt;if(marVistoT>0||G.modo!=='jogo'||!P.alive)return;marVistoT=1;if(!marEm(P.x,P.z))return;const d=costaD(P.x,P.z);if(d<-marLarg(P.z)-3)return;
  if(typeof diarioDescobre==='function')diarioDescobre('lugar','praia','Praia do Farol Velho',10);
  dica('mar','corpo','O mar! A maré sobe e desce duas vezes por dia (veja no relógio). Na maré baixa a praia cresce e dá para chegar andando em lugares que na alta só nadando. Água do mar não mata a sede.');});

/* ================= Serra Velha (teste da etapa 1): afloramentos de rocha e pedras soltas (12/11/2026) =================
   A serra (62x_serra.js) ganha rocha de verdade onde a encosta é íngreme: pedaços de paredão escaneados (mountainside e
   rock_face_01 da Poly Haven, CC0) cravados nas encostas, virados para baixo do morro, e pedras soltas (o matacão e as com
   musgo) no pé dos paredões, onde a pedra que despenca para. Lugares sorteados uma vez (o mesmo mundo, a mesma serra).
   Perto (até 90 m) a versão detalhada; longe, a leve. Pedra dentro do mapa tem colisão; a de fora é só paisagem.
   Os paredões fazem sombra. */
const SVP={ok:false,tipos:[],aflor:[],soltas:[],info:null};
/* ângulo (yaw das instâncias) que vira a face escaneada do paredão tipo para a direção (dx,dz) */
function svpVira(tipo,dx,dz){const M=tipo===0?MATA.paredao:MATA.paredao2,f=(M&&M.frente)||[0,0,1];return Math.atan2(dx,dz)-Math.atan2(f[0],f[2]);}
function svpSemear(){SVP.aflor=[];SVP.soltas=[];if(typeof SVN==='undefined'||typeof MATA==='undefined')return;const S=SVN,R=rng(70417);
  const longe=(L,x,z,d)=>{for(const q of L)if((q.x-x)**2+(q.z-z)**2<d*d)return true;return false;};
  const fora=(x,z)=>{const c=S.pisoCaixa;return(x>c[0]-6&&x<c[2]+6&&z>c[1]-6&&z<c[3]+6&&svnPiso(x,z)!==null)||svnPatio(x,z,4);};
  for(let k=0;k<30000&&SVP.aflor.length<120;k++){const x=S.x0+10+R()*(S.x1-S.x0-20),z=S.z0+10+R()*(S.z1-S.z0-20);if(svnOffEm(x,z)<4)continue;
    const g=svnIncl(x,z);if(g<1.0||fora(x,z)||longe(SVP.aflor,x,z,8.5))continue;
    const e=1.2,gx=(svnAlt(x+e,z)-svnAlt(x-e,z)),gz=(svnAlt(x,z+e)-svnAlt(x,z-e)),tipo=R()<0.6?0:1,yaw=svpVira(tipo,-gx,-gz)+(R()-0.5)*0.9;
    const s=0.6+R()*0.9;SVP.aflor.push({x,z,y:0,r:yaw,s,tipo,t:0.82+R()*0.25});}
  /* moldura da boca da gruta: dois paredões dos lados e um em cima da entrada, com a face escaneada para fora */
  {const W=(s_,t_)=>[S.EX+S.ca*s_-S.sa*t_,S.EZ+S.sa*s_+S.ca*t_],ox=-S.ca,oz=-S.sa;
    for(const[s_,t_,tipo,sc,dy]of[[1.2,-6.4,1,1.35,-0.9],[1.4,6.6,1,1.3,-0.9],[4.6,0.4,0,0.62,3.9],[-0.6,-10.5,0,0.55,-1.5],[-0.4,10.8,0,0.5,-1.5]]){const[x,z]=W(s_,t_);
      SVP.aflor.push({x,z,y:S.hE+dy,yFixo:true,r:svpVira(tipo,ox,oz)+(t_<-1?0.25:t_>1?-0.25:0),s:sc,tipo,t:0.9,moldura:true});}}

  for(const a of SVP.aflor){if(a.yFixo)continue;const M=a.tipo===0?MATA.paredao:MATA.paredao2;const h=M?M.hi[1]-M.lo[1]:5;a.y=svnAlt(a.x,a.z)-h*a.s*0.55;}
  for(let k=0;k<40000&&SVP.soltas.length<320;k++){const x=S.x0+8+R()*(S.x1-S.x0-16),z=S.z0+8+R()*(S.z1-S.z0-16),o=svnOffEm(x,z);if(o<1.2)continue;
    const g=svnIncl(x,z);if(g<0.25||g>0.95||fora(x,z))continue;
    /* mais pedra perto de paredão (no pé dele) */
    let pe=0;for(const a of SVP.aflor){const d=Math.hypot(a.x-x,a.z-z);if(d<26){pe=1-d/26;break;}}if(R()>0.12+0.88*pe)continue;
    const s=0.5+Math.pow(R(),1.6)*1.9,y=svnAlt(x,z)-s*0.28;const q={x,z,y,r:R()*6.283,s,v:Math.floor(R()*8),t:0.8+R()*0.3};SVP.soltas.push(q);
    if(dentroMapa(x,z,-1)&&!(svnPiso(x,z)!==null))colCircle(x,z,0.62*s,{rock:null,serraPedra:true});}
  SVP.info={afloramentos:SVP.aflor.length,soltas:SVP.soltas.length};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{svpSemear();}catch(e){console.error('serra (pedras)',e);}return r;};}
function svpMontar(){SVP.ok=false;SVP.tipos=[];if(typeof MATA==='undefined')return;
  const mk=(A,partes,max)=>{const ms=[];for(const d of partes){const t=texModelo('svp_'+A.src+'_'+d.mat,A.tex[d.mat],true);ms.push(Object.assign(instTex(d,max,t,0),{texP:t}));}return ms;};
  const par=[[MATA.paredao,MATA.paredao_l],[MATA.paredao2,MATA.paredao2_l]];
  for(const[A,Al]of par){if(!A)continue;SVP.tipos.push({perto:mk(A,A.partes,160),longe:mk(Al||A,(Al||A).partes,160)});}
  /* pedras soltas: o matacão (perto e longe) e as 7 maiores com musgo */
  SVP.pedras=[];if(MATA.pedra)SVP.pedras.push({perto:mk(MATA.pedra,MATA.pedra.partes,340),longe:mk(MATA.pedra_l||MATA.pedra,(MATA.pedra_l||MATA.pedra).partes,340)});
  if(MATA.pedras_musgo){const pc=MATA.pedras_musgo.pecas.slice().sort((a,b)=>(b.hi[0]-b.lo[0])*(b.hi[2]-b.lo[2])-(a.hi[0]-a.lo[0])*(a.hi[2]-a.lo[2])).slice(0,7);
    for(const p of pc){const ms=mk(MATA.pedras_musgo,[p],340);SVP.pedras.push({perto:ms,longe:ms,k:1.6/Math.max(0.05,p.hi[0]-p.lo[0],p.hi[2]-p.lo[2])});}}
  SVP.ok=SVP.tipos.length>0;}
etapaMalha('mata','mata',2,()=>{try{svpMontar();}catch(e){console.error('serra (pedras)',e);SVP.ok=false;}});
function svpProntas(){const L=[...SVP.tipos,...SVP.pedras];for(const t of L)for(const m of[...t.perto,...t.longe])if(!m.texP.pronta)return false;return L.length>0;}
function svpDistribuir(){if(!SVP.ok)return;const L=[...SVP.tipos,...SVP.pedras];for(const t of L)for(const m of[...t.perto,...t.longe])m.n=0;
  const tmp=new Float32Array(8),put=(ms,q,k)=>{tmp[0]=q.x;tmp[1]=q.y;tmp[2]=q.z;tmp[3]=q.r;tmp[4]=q.s*(k||1);tmp[5]=tmp[6]=tmp[7]=q.t;for(const m of ms)copiarInst(m,tmp,0);};
  for(const a of SVP.aflor){const T=SVP.tipos[a.tipo%SVP.tipos.length];if(!T)continue;put(d2(a.x,a.z,P.x,P.z)<90*90?T.perto:T.longe,a);}
  if(SVP.pedras.length)for(const q of SVP.soltas){if(d2(q.x,q.z,P.x,P.z)>240*240)continue;const T=SVP.pedras[q.v%SVP.pedras.length];put(d2(q.x,q.z,P.x,P.z)<60*60?T.perto:T.longe,q,T.k);}
  for(const t of L)for(const m of[...t.perto,...t.longe])subirInst(m);}
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;const r=_rv.apply(this,arguments);if(force||vegT!==ia-1){try{svpDistribuir();}catch(e){console.error('serra (pedras)',e);}}return r;};}
function svpListas(){return[...SVP.tipos,...SVP.pedras];}
DESENHO.opaco.push(function svpDesenho(Pg){if(!SVP.ok||!svpProntas())return;setLit(PLI);const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);
  for(const t of svpListas())for(const m of[...t.perto,...t.longe])if(m.n)drawInst(PLI,m);if(cf)gl.enable(gl.CULL_FACE);setLit(Pg);});
/* sombra dos paredões: o programa da sombra de instâncias com a mesma luz da cascata que está sendo desenhada */
DESENHO.sombra.push(function svpSombra(Pg,perto){if(!SVP.ok||!SVP.aflor.length)return;const vp=gl.getUniform(Pg.p,Pg.u.uViewProj);
  gl.useProgram(PDI.p);gl.uniformMatrix4fv(PDI.u.uViewProj,false,vp);gl.uniform1f(PDI.u.uTime,G.t);gl.uniform2fv(PDI.u.uWind,E.wind);
  for(const t of SVP.tipos)for(const m of(perto?t.perto:t.longe))if(m.n)drawInst(PDI,m);gl.useProgram(Pg.p);});

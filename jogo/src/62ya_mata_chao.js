/* ================= Mata de verdade (2): samambaias, folhagem do chão da mata e pedras (12/11/2026) =================
   Continuação do 62y_mata.js, com os modelos da Poly Haven (CC0) convertidos por tools/mata_banco.py:
   · Samambaias: as de sempre (mesmos lugares, mesma quantidade por nível de gráfico) passam a ser a samambaia de verdade
     (fern_02, 4 variantes), maiores, como as da mata úmida.
   · Folhagem do chão da mata (nova, só enfeite, sem colisão): calathea, antúrio, monguba e arbusto, em volta dos troncos das
     árvores da mata (onde a sombra é maior), longe de estrada, trilha, casa e lugar com nome. Desenhada perto do jogador.
   · Pedras: as pedras de sempre (mesmo lugar, tamanho, colisão e minério) passam a ser pedras escaneadas (o matacão e as pedras
     com musgo). A sombra continua a da pedra de antes.
   12/11, 22h30: as moitas redondas viram folhagem grande de verdade (calathea e antúrio; os arbustos shrub_02/04 saíram porque
   a conversão deixou as folhas como placas claras no chão), e tudo isso vale também no gráfico Baixo
   (o dono pediu tirar todas as formas de bola e cone). Enquanto as texturas não carregam, aparece o desenho antigo. */
const MCH={ok:false,fet:[],pedras:[],plantas:[],moitas:[],info:null,R:{baixo:14,medio:22,alto:30,ultra:40}};
const MCH_PL=[];   // folhagem nova: {x,z,y,r,s,v (variante),t}
function mchLigada(){return MCH.ok;}
function mchProntas(L){for(const q of L)if(q.tex&&!q.tex.pronta)return false;return true;}
function mchLim(f){const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let i=0;i+10<f.length;i+=11)for(let k=0;k<3;k++){const v=f[i+k];if(v<lo[k])lo[k]=v;if(v>hi[k])hi[k]=v;}return{lo,hi};}
function mchEscala(f,k,dy){const n=f.length/11;for(let i=0;i<n;i++){const a=i*11;f[a]*=k;f[a+1]=f[a+1]*k+(dy||0);f[a+2]*=k;}}
/* uma variante de modelo: as partes dela, cada uma uma malha instanciada com a textura do material */
function mchVariante(A,partes,max,k,alfa,dy,tint){const tex=[],ms=[];
  for(const d of partes){const t=texModelo('mch_'+A.src+'_'+d.mat,A.tex[d.mat],true);tex.push(t);
    ms.push(instTex(d,max,t,alfa||0,f=>{mchEscala(f,k,dy);if(tint)for(let i=0;i<f.length;i+=11){f[i+3]*=tint[0];f[i+4]*=tint[1];f[i+5]*=tint[2];}}));}
  return{ms,tex:tex.map(t=>({tex:t}))};}
function mchMontar(){MCH.ok=false;if(typeof MATA==='undefined'||!MESH.samambaia||!MESH.rock)return;const V=vegGeometry(),info={};
  /* samambaias: do tamanho das de antes, um pouco maiores (as da mata úmida passam do joelho) */
  if(MATA.samambaia&&V.samambaia){const L=mchLim(V.samambaia),alt=(L.hi[1]-L.lo[1])*1.35;MCH.fet=MATA.samambaia.variantes.map(v=>mchVariante(MATA.samambaia,v.partes,MESH.samambaia.max,alt/Math.max(0.1,v.hi[1]-v.lo[1]),0,0,[0.9,1,0.88]));
    for(const v of MCH.fet)for(const m of v.ms)m.sway=MESH.samambaia.sway;info.samambaias=MCH.fet.length;}
  /* pedras: o matacão e as 7 maiores com musgo, do tamanho da pedra de antes (largura), afundadas um pouco */
  if(V.rock&&(MATA.pedra||MATA.pedras_musgo)){const L=mchLim(V.rock),larg=Math.max(L.hi[0]-L.lo[0],L.hi[2]-L.lo[2]);const vs=[];
    if(MATA.pedra)vs.push({A:MATA.pedra,partes:MATA.pedra.partes,lo:MATA.pedra.lo,hi:MATA.pedra.hi});
    if(MATA.pedras_musgo){const pc=MATA.pedras_musgo.pecas.slice().sort((a,b)=>(b.hi[0]-b.lo[0])*(b.hi[2]-b.lo[2])-(a.hi[0]-a.lo[0])*(a.hi[2]-a.lo[2])).slice(0,7);
      for(const p of pc)vs.push({A:MATA.pedras_musgo,partes:[p],lo:p.lo,hi:p.hi});}
    MCH.pedras=vs.map(v=>{const w=Math.max(v.hi[0]-v.lo[0],v.hi[2]-v.lo[2]),k=larg*1.05/Math.max(0.05,w);return mchVariante(v.A,v.partes,MESH.rock.max,k,0,-(v.hi[1]-v.lo[1])*k*0.12);});info.pedras=MCH.pedras.length;}
  /* folhagem do chão da mata */
  MCH.plantas=[];const esp=[['calathea',1.9,[1,1,1]],['antorio',1.7,[1,1,1]],['monguba',1.25,[1,1,1]]];   // o arbusto (shrub_02) saiu: a conversão deixou as folhas como placas claras no chão
  for(const[id,k,tint]of esp){const A=MATA[id];if(!A||!A.variantes)continue;for(const v of A.variantes){const x=mchVariante(A,v.partes,900,k,0,0,tint);x.id=id;for(const m of x.ms)m.sway=0.02;MCH.plantas.push(x);}}
  info.plantas=MCH.plantas.length;
  /* moitas (as bolas de folha de sempre, com e sem frutinha): viram os arbustos de verdade, do tamanho da moita, um pouco maiores */
  MCH.moitas=[];if(V.bush&&MESH.bush){const L=mchLim(V.bush),alt=(L.hi[1]-L.lo[1])*1.3;for(const id of['calathea','antorio']){const A=MATA[id];if(!A||!A.variantes)continue;
    for(const v of A.variantes){const x=mchVariante(A,v.partes,MESH.bush.max,alt/Math.max(0.1,v.hi[1]-v.lo[1]),0,0,[0.95,1,0.93]);for(const m of x.ms)m.sway=MESH.bush.sway||0.03;MCH.moitas.push(x);}}}
  info.moitas=MCH.moitas.length;
  MCH.ok=MCH.fet.length>0||MCH.pedras.length>0||MCH.plantas.length>0||MCH.moitas.length>0;MCH.info=info;}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);try{mchMontar();}catch(e){console.error('mata (chão)',e);MCH.ok=false;MCH.erro=String(e);}return r;};}
/* onde nasce a folhagem nova: em volta dos troncos das árvores da mata (sorteio fixo: o mesmo mundo, a mesma mata) */
function mchSemear(){MCH_PL.length=0;const R=rng(61031),n=MCH.plantas.length||12;let tent=0;
  for(const t of TREES){if(t.agua||!t.alive||t.alto||t.anel||t.serra)continue;if(R()>0.42)continue;
    const q=1+(R()<0.35?1:0);for(let k=0;k<q;k++){tent++;const a=R()*6.283,d=1.3+R()*2.6,x=t.x+Math.cos(a)*d,z=t.z+Math.sin(a)*d;
      if(!dentroMapa(x,z,2)||mata(x,z)<0.6||dentroCidade(x,z,4))continue;const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+1.5)continue;
      if(pointBlocked(x,z,0.5)||(typeof ruralCasaEm==='function'&&ruralCasaEm(x,z,1))||(RIO.ok&&aguaPerto(x,z,1.2)))continue;
      if(typeof svnNaSerra==='function'&&svnNaSerra(x,z)&&svnIncl(x,z)>0.6)continue;
      MCH_PL.push({x,z,y:ground(x,z)-0.03,r:R()*6.283,s:0.75+R()*0.6,v:Math.floor(R()*n),t:0.85+R()*0.3});}}
  MCH.info=Object.assign(MCH.info||{},{folhagem:MCH_PL.length});}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{mchSemear();}catch(e){console.error('mata (folhagem)',e);}return r;};}
/* reparte: samambaias de sempre entre as 4 variantes; pedras de sempre entre as 8; folhagem nova perto do jogador */
function mchDistribuir(){if(!MCH.ok)return;const liga=mchLigada();
  for(const L of[MCH.fet,MCH.pedras,MCH.plantas,MCH.moitas||[]])for(const v of L)for(const m of v.ms)m.n=0;
  if(liga){const S=MESH.samambaia,a=S.arr;if(MCH.fet.length)for(let i=0;i<S.n;i++){const o=i*8,v=MCH.fet[Math.floor(pinhoHash(a[o]+3.1,a[o+2])*MCH.fet.length)%MCH.fet.length];for(const m of v.ms)copiarInst(m,a,o);}
    const Rk=MESH.rock,b=Rk.arr;if(MCH.pedras.length)for(let i=0;i<Rk.n;i++){const o=i*8,v=MCH.pedras[Math.floor(pinhoHash(b[o]-7.3,b[o+2]+1.1)*MCH.pedras.length)%MCH.pedras.length];for(const m of v.ms)copiarInst(m,b,o);}
    const Bu=MESH.bush,bb=Bu.arr;if(MCH.moitas&&MCH.moitas.length)for(let i=0;i<Bu.n;i++){const o=i*8,v=MCH.moitas[Math.floor(pinhoHash(bb[o]+5.3,bb[o+2]-2.2)*MCH.moitas.length)%MCH.moitas.length];for(const m of v.ms)copiarInst(m,bb,o);}
    const R2=(MCH.R[cfg.graf]||30)**2,tmp=new Float32Array(8);if(MCH.plantas.length)for(const q of MCH_PL){if(d2(q.x,q.z,P.x,P.z)>R2)continue;const v=MCH.plantas[q.v%MCH.plantas.length];
      tmp[0]=q.x;tmp[1]=q.y;tmp[2]=q.z;tmp[3]=q.r;tmp[4]=q.s;tmp[5]=tmp[6]=tmp[7]=q.t;for(const m of v.ms)copiarInst(m,tmp,0);}}
  for(const L of[MCH.fet,MCH.pedras,MCH.plantas,MCH.moitas||[]])for(const v of L)for(const m of v.ms)subirInst(m);}
{const _rg=rebuildGrass;rebuildGrass=function(){const r=_rg.apply(this,arguments);try{mchDistribuir();}catch(e){console.error('mata (chão)',e);}return r;};}
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;const r=_rv.apply(this,arguments);if(force||vegT!==ia-1){try{mchDistribuir();}catch(e){console.error('mata (chão)',e);}}return r;};}
function mchDesenhaLista(Pg,L,dupla){const cf=gl.isEnabled(gl.CULL_FACE);if(dupla&&cf)gl.disable(gl.CULL_FACE);for(const v of L)for(const m of v.ms)if(m.n)drawInstMch(Pg,m);if(dupla&&cf)gl.enable(gl.CULL_FACE);}
let drawInstMch=null;
{const _di=drawInst;drawInstMch=_di;drawInst=function(Pg,m){
  if(Pg===PLI&&mchLigada()){
    if(m===MESH.samambaia&&MCH.fet.length&&MCH.fet.every(v=>mchProntas(v.tex))){mchDesenhaLista(Pg,MCH.fet,true);return;}
    if(m===MESH.rock&&MCH.pedras.length&&MCH.pedras.every(v=>mchProntas(v.tex))){mchDesenhaLista(Pg,MCH.pedras,false);return;}
    if(m===MESH.bush&&MCH.moitas&&MCH.moitas.length&&MCH.moitas.every(v=>mchProntas(v.tex))){mchDesenhaLista(Pg,MCH.moitas,true);return;}}
  return _di.apply(this,arguments);};}
DESENHO.opaco.push(function mchFolhagem(Pg){if(!mchLigada()||!MCH.plantas.length||!MCH.plantas.every(v=>mchProntas(v.tex)))return;setLit(PLI);mchDesenhaLista(PLI,MCH.plantas,true);setLit(Pg);});

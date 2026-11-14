/* ================= Parede de mato da borda do mapa, de verdade (v10.2.2, 13/11/2026) =================
   "Moitas bolha" (Himalaia): a borda do mapa (o círculo da mata, o corredor do vale, a serra) era uma fila de bolas verdes
   escuras emboladas (tufos de icosfera). Agora cada moita é uma planta escaneada grande — monguba, antúrio, calathea ou
   samambaia (as mesmas da mata, 62ya), no lugar e do tamanho da moita de antes, com a mesma colisão — e as pedras da borda
   viram o matacão escaneado. Enquanto as texturas não carregam, aparece o desenho de antes. */
const BRV={ok:false,vs:[],pedras:[],ass:''};
INIT_MALHAS.push(function brenhaReal(){try{
  if(typeof MATA==='undefined'||!MESH.brenha||typeof mchVariante!=='function')return;const max=MESH.brenha.max;
  for(const[id,alt]of[['monguba',2.4],['antorio',2.0],['calathea',1.9],['samambaia',1.7]]){const A=MATA[id];if(!A||!A.variantes)continue;
    for(const v of A.variantes){const k=alt/Math.max(0.1,v.hi[1]-v.lo[1]),x=mchVariante(A,v.partes,max,k,0,-0.05,[0.8,0.9,0.78]);for(const m of x.ms)m.sway=0.02;BRV.vs.push(x);}}
  if(MATA.pedra&&MESH.brenhaPedra){const L=mchLim(vegGeometry().rock),larg=Math.max(L.hi[0]-L.lo[0],L.hi[2]-L.lo[2]),A=MATA.pedra,w=Math.max(A.hi[0]-A.lo[0],A.hi[2]-A.lo[2]),k=larg*1.05/Math.max(0.05,w);
    BRV.pedras.push(mchVariante(A,A.partes,MESH.brenhaPedra.max,k,0,-(A.hi[1]-A.lo[1])*k*0.15));}
  BRV.ok=BRV.vs.length>0;}catch(e){console.error('borda de mato',e);BRV.ok=false;}});
function brvProntas(){return BRV.ok&&BRV.vs.every(v=>mchProntas(v.tex))&&BRV.pedras.every(v=>mchProntas(v.tex));}
/* reparte as moitas (MESH.brenha) entre as plantas e as pedras da borda entre os matacões; só quando a lista mudou */
function brvDistribuir(){if(!BRV.ok||!MESH.brenha)return;const B=MESH.brenha,a=B.arr,Pd=MESH.brenhaPedra;
  const ass=B.n+':'+(B.n?a[0].toFixed(2)+','+a[(B.n-1)*8+2].toFixed(2):'')+':'+(Pd?Pd.n:0);if(ass===BRV.ass)return;BRV.ass=ass;
  for(const L of[BRV.vs,BRV.pedras])for(const v of L)for(const m of v.ms)m.n=0;
  /* duas plantas por moita (a segunda deslocada, girada e menor): a parede fica fechada como a de antes */
  const t2=BRV.tmp||(BRV.tmp=new Float32Array(8)),nV=BRV.vs.length;
  for(let i=0;i<B.n;i++){const o=i*8,h=pinhoHash(a[o]+1.7,a[o+2]-4.4),v=BRV.vs[Math.floor(h*nV)%nV];for(const m of v.ms)copiarInst(m,a,o);
    for(let k=0;k<8;k++)t2[k]=a[o+k];const r=a[o+3]+1.9,d=0.95*a[o+4];t2[0]+=Math.cos(r)*d;t2[2]+=Math.sin(r)*d;t2[3]=a[o+3]+2.4;t2[4]=a[o+4]*0.82;
    const v2=BRV.vs[(Math.floor(h*nV)+5)%nV];for(const m of v2.ms)copiarInst(m,t2,0);}
  if(Pd&&BRV.pedras.length)for(let i=0;i<Pd.n;i++)for(const m of BRV.pedras[0].ms)copiarInst(m,Pd.arr,i*8);
  for(const L of[BRV.vs,BRV.pedras])for(const v of L)for(const m of v.ms)subirInst(m);}
{const _rv=rebuildVeg;rebuildVeg=function(force){const r=_rv.apply(this,arguments);try{brvDistribuir();}catch(e){console.error('borda de mato',e);}return r;};}
/* desenho: no lugar das bolas (folhas dos dois lados) e das pedras lisas */
{const _di=drawInst;drawInst=function(Pg,m){
  if(Pg===PLI&&(m===MESH.brenha||m===MESH.brenhaPedra)&&brvProntas()){const L=m===MESH.brenha?BRV.vs:BRV.pedras;if(L.length){const cf=gl.isEnabled(gl.CULL_FACE);if(cf&&m===MESH.brenha)gl.disable(gl.CULL_FACE);
      for(const v of L)for(const q of v.ms)if(q.n)_di(Pg,q);if(cf&&m===MESH.brenha)gl.enable(gl.CULL_FACE);return;}}
  return _di.apply(this,arguments);};}

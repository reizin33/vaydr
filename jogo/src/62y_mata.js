/* ================= Mata de verdade (12/11/2026) — direção do VAYDR: a serra da Mata Atlântica =================
   "Hoje o jogo está muito quadrado, sem vida, parece Roblox" (Himalaia). As árvores redondas e as bétulas, feitas de cone e bola,
   dão lugar a 5 árvores de verdade da Poly Haven (licença CC0), convertidas por tools/mata_banco.py (21i_mata_dados.js):
   jacarandá (a grande, de copa larga e folha miúda) e quatro árvores de folha larga (as "island trees" e a "tree small").
   · Cada árvore fica sempre com a mesma espécie (sorteio pela posição) e do tamanho de antes (a altura da espécie é ajustada
     à da árvore redonda; o tamanho de cada árvore continua o dela). O lugar, a colisão, o corte e o save são os de antes.
   · De perto (LOD0, até 16 a 30 m conforme o gráfico): casca, galhos e ~3 mil folhas com recorte. Até o fim do "perto"
     (arvPerto): a versão de meia distância (LOD1). De longe: placas cruzadas com a foto da própria espécie, tirada no começo
     do jogo (como as árvores de longe do 62s).
   · As folhas recebem luz como um volume (normal para fora da copa) e o miolo da copa é mais escuro (a luz não entra).
   · A sombra continua a da árvore de antes (mesmo lugar e altura).
   · No gráfico Baixo (aparelho fraco) fica tudo como antes. Enquanto as texturas não carregam, aparecem as árvores de antes. */
const MATA_ESP=['jacaranda','ilha1','ilha2','ilha3','pequena'];
const MATA_ALT={jacaranda:1.3,ilha1:1.05,ilha2:0.95,ilha3:0.9,pequena:0.95};   // altura em relação à árvore redonda de antes
const MATA_R0={baixo:0,medio:16,alto:22,ultra:30};                            // até onde vai a versão de perto (m)
const MATAV={ok:false,esp:[],restoR:null,restoB:null,longe:null,info:null,erro:null};
function mataLigada(){return MATAV.ok&&cfg.graf!=='baixo';}
function mataProntas(){for(const e of MATAV.esp)for(const k in e.tex)if(!e.tex[k].pronta)return false;return MATAV.esp.length>0;}
function mataEsp(x,z){const n=MATAV.esp.length;return Math.min(n-1,Math.floor(pinhoHash(x+0.37,z-1.71)*n));}
/* altura da árvore redonda detalhada de antes (s = 1) */
function mataAlturaRedonda(){const L=ARVL.lim&&ARVL.lim.roundHi;return L?L.hi[1]-L.lo[1]:7;}
/* escala da espécie e cor das folhas: miolo da copa mais escuro, pontas mais claras, um pouco de variação de verde */
function mataGeo(f,k,fol){const n=f.length/11;for(let i=0;i<n;i++){const a=i*11;f[a]*=k;f[a+1]*=k;f[a+2]*=k;}
  if(!fol)return;let cx=0,cy=0,cz=0;for(let i=0;i<n;i++){cx+=f[i*11];cy+=f[i*11+1];cz+=f[i*11+2];}cx/=n;cy/=n;cz/=n;
  let rm=0.01;for(let i=0;i<n;i++){const a=i*11,r=Math.hypot(f[a]-cx,(f[a+1]-cy)*1.4,f[a+2]-cz);if(r>rm)rm=r;}
  for(let i=0;i<n;i++){const a=i*11,r=Math.hypot(f[a]-cx,(f[a+1]-cy)*1.4,f[a+2]-cz)/rm,emb=f[a+1]<cy?0.85:1,ao=(0.5+0.5*Math.min(1,r*1.15))*emb;
    f[a+3]=0.95*ao;f[a+4]=1.0*ao;f[a+5]=0.9*ao;}}
function mataMontar(){MATAV.ok=false;MATAV.esp=[];if(typeof MATA==='undefined'||!MESH.roundN||!MESH.birchN)return;
  const hR=mataAlturaRedonda(),max=MESH.roundN.max+MESH.birchN.max;
  for(const id of MATA_ESP){const A=MATA[id];if(!A||A.tipo!=='arvore')continue;const k=hR*(MATA_ALT[id]||1)/A.h;
    const tex={};for(const nome in A.tex)tex[nome]=texModelo('mata_'+id+'_'+nome,A.tex[nome],nome!=='folhas');
    const lods=A.lod.map(L=>{const partes=[];for(const nome in L){const fol=nome==='folhas';
        const m=instTex(L[nome],max,tex[nome],fol?1:0,f=>mataGeo(f,k,fol));m.sway=MESH.roundN.sway;partes.push({m,fol,tex:tex[nome]});}return partes;});
    MATAV.esp.push({id,tex,lods,k,lim:{lo:A.lo.map(v=>v*k),hi:A.hi.map(v=>v*k)}});}
  MATAV.restoR=instClone(MESH.roundN,MESH.roundN.max);MATAV.restoB=instClone(MESH.birchN,MESH.birchN.max);
  MATAV.ok=MATAV.esp.length>0;MATAV.info={especies:MATAV.esp.map(e=>({id:e.id,escala:+e.k.toFixed(3),altura:+(e.lim.hi[1]).toFixed(2),
    tri:e.lods.map(L=>L.reduce((s,p)=>s+p.m.tri,0))})),alturaRedonda:+hR.toFixed(2)};}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);try{mataMontar();}catch(e){console.error('mata nova',e);MATAV.erro=String(e);MATAV.ok=false;}return r;};}
/* as árvores de perto (redondas e bétulas) vão para a espécie de cada uma: de perto o LOD0, até o fim do "perto" o LOD1 */
function mataDistribuir(){if(!MATAV.ok)return;const R0=(MATA_R0[cfg.graf]??22)**2,liga=mataLigada()&&mataProntas();
  for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)p.m.n=0;MATAV.restoR.n=0;MATAV.restoB.n=0;
  for(const[src,re]of[[MESH.roundN,MATAV.restoR],[MESH.birchN,MATAV.restoB]]){const a=src.arr;
    for(let i=0;i<src.n;i++){const o=i*8;if(!liga){copiarInst(re,a,o);continue;}
      const e=MATAV.esp[mataEsp(a[o],a[o+2])],L=e.lods[d2(a[o],a[o+2],P.x,P.z)<R0?0:1];for(const p of L)copiarInst(p.m,a,o);}}
  for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)subirInst(p.m);subirInst(MATAV.restoR);subirInst(MATAV.restoB);
  mataLongeDistribuir();}
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;const r=_rv.apply(this,arguments);if(force||vegT!==ia-1){try{mataDistribuir();}catch(e){console.error('mata nova',e);}}return r;};}
/* fotos das espécies para as árvores de longe (uma vez, quando as texturas chegam) */
function mataAssar(){const F=MATAV.esp.map(e=>({nome:e.id,partes:e.lods[0].map(p=>({m:p.m,tex:p.tex,alfa:p.fol?1:0})),lim:e.lim}));
  const C=ARVL_CEL,pad=ARVL_PAD,cols=4,nc=F.length*2,AW=cols*C,AH=Math.ceil(nc/cols)*C;
  const vp=gl.getParameter(gl.VIEWPORT),cc=gl.getParameter(gl.COLOR_CLEAR_VALUE),cf=gl.isEnabled(gl.CULL_FACE),dt=gl.isEnabled(gl.DEPTH_TEST),bl=gl.isEnabled(gl.BLEND),
    sc=gl.isEnabled(gl.SCISSOR_TEST),dm=gl.getParameter(gl.DEPTH_WRITEMASK),fb0=gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,AW,AH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const fbo=gl.createFramebuffer(),rb=gl.createRenderbuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,AW,AH);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,AW,AH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,cels=[];
  if(ok){if(!ARVL_P)ARVL_P=program(ARVL_VS,ARVL_FS,'');
    gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,AW,AH);gl.clearColor(0.05,0.08,0.05,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
    gl.useProgram(ARVL_P.p);gl.uniform1i(ARVL_P.u.uT,5);gl.uniform1f(ARVL_P.u.uSomb,0.62);const O=new Float32Array(16);
    F.forEach((fo,i)=>{const L=fo.lim,W=Math.max(Math.abs(L.lo[0]),Math.abs(L.hi[0]),Math.abs(L.lo[2]),Math.abs(L.hi[2])),H=L.hi[1]-L.lo[1],s=Math.max(2*W,H)*1.04,y0=L.lo[1]-s*0.01,zr=W+1;
      const cel={nome:fo.nome,s,y0,uv:[]};
      for(let v=0;v<2;v++){const c=i*2+v,cx=(c%cols)*C,cy=Math.floor(c/cols)*C;
        gl.viewport(cx+pad,cy+pad,C-2*pad,C-2*pad);gl.uniformMatrix4fv(ARVL_P.u.uVP,false,arvlOrto(O,s,y0,zr,v===1));
        for(const pa of fo.partes){gl.uniform1f(ARVL_P.u.uUseT,pa.alfa?2:1);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,pa.tex);gl.activeTexture(gl.TEXTURE0);
          gl.bindVertexArray(pa.m.vao);gl.drawArrays(gl.TRIANGLES,0,pa.m.count);}
        cel.uv.push([(cx+pad)/AW,(cy+pad)/AH,(cx+C-pad)/AW,(cy+C-pad)/AH]);}
      cels.push(cel);});
    gl.bindVertexArray(null);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb0);gl.deleteFramebuffer(fbo);gl.deleteRenderbuffer(rb);
  gl.viewport(vp[0],vp[1],vp[2],vp[3]);gl.clearColor(cc[0],cc[1],cc[2],cc[3]);gl.depthMask(dm);
  for(const[k,e]of[[gl.CULL_FACE,cf],[gl.DEPTH_TEST,dt],[gl.BLEND,bl],[gl.SCISSOR_TEST,sc]])e?gl.enable(k):gl.disable(k);
  if(!ok){gl.deleteTexture(tex);throw new Error('sem textura para as fotos da mata');}
  gl.bindTexture(gl.TEXTURE_2D,tex);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAX_LEVEL,4);
  const max=MESH.round.max+MESH.birch.max,sway=MESH.round.sway;
  MATAV.longe={tex,m:cels.map(cel=>Object.assign(arvlMalha(arvlGeo(cel),max,sway),{tex})),atlas:[AW,AH]};mataLongeDistribuir();}
function mataLongeDistribuir(){const L=MATAV.longe;if(!L||!mataLigada())return;for(const m of L.m)m.n=0;
  for(const s of[MESH.round,MESH.birch])for(let i=0;i<s.n;i++){const o=i*8;copiarInst(L.m[mataEsp(s.arr[o],s.arr[o+2])],s.arr,o);}
  for(const m of L.m)subirInst(m);}
PASSOS.push(function mataFotos(){if(MATAV.longe||MATAV.erroFoto||!MATAV.ok||!mataLigada()||!mataProntas())return;
  try{mataAssar();mataDistribuir();}catch(e){MATAV.erroFoto=String(e);console.error('mata (fotos)',e);}});
/* desenho com luz: no lugar das redondas e bétulas de perto entram as espécies (madeira com o lado de trás escondido, folhas dos
   dois lados); de longe, as placas da própria espécie */
{const _di=drawInst;drawInst=function(Pg,m){
  if(Pg===PLI&&MATAV.ok&&(m===MESH.roundN||m===MESH.birchN)){_di(Pg,m===MESH.roundN?MATAV.restoR:MATAV.restoB);
    if(m===MESH.roundN&&mataLigada()&&mataProntas()){for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)if(!p.fol&&p.m.n)_di(Pg,p.m);
      const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)if(p.fol&&p.m.n)_di(Pg,p.m);if(cf)gl.enable(gl.CULL_FACE);}
    return;}
  if(Pg===PLI&&MATAV.longe&&mataLigada()&&(m===MESH.round||m===MESH.birch)){if(m===MESH.round){const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);
      for(const q of MATAV.longe.m)if(q.n)_di(Pg,q);if(cf)gl.enable(gl.CULL_FACE);}return;}
  return _di.apply(this,arguments);};}

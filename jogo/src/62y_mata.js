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
   · Enquanto as texturas não carregam, aparecem as árvores de antes. (Desde 12/11, 22h30, vale também no gráfico Baixo, com
     distâncias menores: o dono pediu tirar todas as árvores de bola e cone.)
   · 12/11, 22h ("árvores redondas com cone, está feio"): os pinheiros de cone também viram espécies da mata (na altura deles) e as
     gigantes ganham copa de jacarandá do tamanho delas (a madeira, os galhos andáveis, os cipós e a colisão continuam os delas;
     a sombra da copa é a da copa antiga). Para o jogo não pesar: de perto o LOD0, até MATA_R1 o LOD1 e dali em diante a placa. */
const MATA_R1={baixo:30,medio:45,alto:60,ultra:80};                            // até onde vai a versão de meia distância (m)
const MATA_ESP=['jacaranda','ilha1','ilha2','ilha3','pequena'];
const MATA_ALT={jacaranda:1.3,ilha1:1.05,ilha2:0.95,ilha3:0.9,pequena:0.95};   // altura em relação à árvore redonda de antes
const MATA_R0={baixo:10,medio:16,alto:22,ultra:30};                            // até onde vai a versão de perto (m)
const MATAV={ok:false,esp:[],restoR:null,restoB:null,longe:null,info:null,erro:null};
function mataLigada(){return MATAV.ok;}
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
  const hR=mataAlturaRedonda(),LP=ARVL.lim&&ARVL.lim.pineHi,hP=LP?LP.hi[1]-LP.lo[1]:hR*1.4;MATAV.kPinho=hP/hR;
  const max=MESH.roundN.max+MESH.birchN.max+(MESH.pineN?MESH.pineN.max:0)+GIGANTES.length+(typeof FRUTEIRAS!=='undefined'?FRUTEIRAS.length+40:0);
  for(const id of MATA_ESP){const A=MATA[id];if(!A||A.tipo!=='arvore')continue;const k=hR*(MATA_ALT[id]||1)/A.h;
    const tex={};for(const nome in A.tex)tex[nome]=texModelo('mata_'+id+'_'+nome,A.tex[nome],nome!=='folhas');
    const lods=A.lod.map(L=>{const partes=[];for(const nome in L){const fol=nome==='folhas';
        const m=instTex(L[nome],max,tex[nome],fol?1:0,f=>mataGeo(f,k,fol));m.sway=MESH.roundN.sway;partes.push({m,fol,tex:tex[nome]});}return partes;});
    MATAV.esp.push({id,tex,lods,k,lim:{lo:A.lo.map(v=>v*k),hi:A.hi.map(v=>v*k)}});}
  MATAV.restoR=instClone(MESH.roundN,MESH.roundN.max);MATAV.restoB=instClone(MESH.birchN,MESH.birchN.max);MATAV.restoP=MESH.pineN?instClone(MESH.pineN,MESH.pineN.max):null;
  MATAV.jac=MATAV.esp.findIndex(e=>e.id==='jacaranda');MATAV.peq=MATAV.esp.findIndex(e=>e.id==='pequena');MATAV.extra=new Float32Array((MESH.roundN.max+MESH.birchN.max+(MESH.pineN?MESH.pineN.max:0)+GIGANTES.length)*8);MATAV.nExtra=0;
  MATAV.ok=MATAV.esp.length>0;MATAV.info={especies:MATAV.esp.map(e=>({id:e.id,escala:+e.k.toFixed(3),altura:+(e.lim.hi[1]).toFixed(2),
    tri:e.lods.map(L=>L.reduce((s,p)=>s+p.m.tri,0))})),alturaRedonda:+hR.toFixed(2)};}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);try{mataMontar();}catch(e){console.error('mata nova',e);MATAV.erro=String(e);MATAV.ok=false;}return r;};}
/* as árvores de perto (redondas e bétulas) vão para a espécie de cada uma: de perto o LOD0, até o fim do "perto" o LOD1 */
function mataDistribuir(){if(!MATAV.ok)return;const R0=(MATA_R0[cfg.graf]??22)**2,R1=(MATA_R1[cfg.graf]??60)**2,liga=mataLigada()&&mataProntas(),tmp=MATAV.tmp||(MATAV.tmp=new Float32Array(8));
  for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)p.m.n=0;MATAV.restoR.n=0;MATAV.restoB.n=0;if(MATAV.restoP)MATAV.restoP.n=0;MATAV.nExtra=0;
  const poe=(e,d,a,o)=>{if(d>=R1){MATAV.extra.set(a.subarray(o,o+8),MATAV.nExtra*8);MATAV.nExtra++;return;}for(const p of e.lods[d<R0?0:1])copiarInst(p.m,a,o);};
  for(const[src,re,ks]of[[MESH.roundN,MATAV.restoR,1],[MESH.birchN,MATAV.restoB,1],[MESH.pineN,MATAV.restoP,MATAV.kPinho]]){if(!src||!re)continue;const a=src.arr;
    for(let i=0;i<src.n;i++){const o=i*8;if(!liga){copiarInst(re,a,o);continue;}
      const e=MATAV.esp[mataEsp(a[o],a[o+2])],d=d2(a[o],a[o+2],P.x,P.z);
      if(ks!==1){for(let k=0;k<8;k++)tmp[k]=a[o+k];tmp[4]*=ks;poe(e,d,tmp,0);}else poe(e,d,a,o);}}
  /* árvores de fruta dos quintais e dos sítios: a copa vira a árvore pequena de verdade (copa larga e baixa, 4,2 m), com as frutas
     dentro da copa (a ilha3, mais rala, deixava as frutas soltas no ar) */
  if(liga&&MATAV.peq>=0&&typeof FRUTEIRAS!=='undefined'){const e=MATAV.esp[MATAV.peq];for(const F of FRUTEIRAS){const d=d2(F.x,F.z,P.x,P.z);if(d>R1*1.5)continue;
      tmp[0]=F.x;tmp[1]=F.y;tmp[2]=F.z;tmp[3]=F.x*1.7+F.z;tmp[4]=4.2/e.lim.hi[1];tmp[5]=0.95;tmp[6]=1.02;tmp[7]=0.92;for(const p of e.lods[d<R0?0:1])copiarInst(p.m,tmp,0);}}
  /* gigantes: copa de jacarandá do tamanho delas */
  if(liga&&MATAV.jac>=0){const e=MATAV.esp[MATAV.jac];for(const T of GIGANTES){tmp[0]=T.x;tmp[1]=T.y-0.3;tmp[2]=T.z;tmp[3]=T.id*2.39;tmp[4]=T.H*1.12/e.lim.hi[1];tmp[5]=0.95;tmp[6]=1;tmp[7]=0.95;
      const d=d2(T.x,T.z,P.x,P.z);if(d<170*170)for(const p of e.lods[d<R0*2.6?0:1])copiarInst(p.m,tmp,0);else{MATAV.extra.set(tmp,MATAV.nExtra*8);MATAV.nExtra++;}}}
  for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)subirInst(p.m);subirInst(MATAV.restoR);subirInst(MATAV.restoB);if(MATAV.restoP)subirInst(MATAV.restoP);
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
  const max=MESH.round.max+MESH.birch.max+(MESH.pine?MESH.pine.max:0)+MESH.roundN.max+MESH.birchN.max+(MESH.pineN?MESH.pineN.max:0)+GIGANTES.length,sway=MESH.round.sway;
  MATAV.longe={tex,m:cels.map(cel=>Object.assign(arvlMalha(arvlGeo(cel),max,sway),{tex})),atlas:[AW,AH]};mataLongeDistribuir();}
function mataLongeDistribuir(){const L=MATAV.longe;if(!L||!mataLigada())return;for(const m of L.m)m.n=0;
  const tmp=MATAV.tmp||(MATAV.tmp=new Float32Array(8));
  for(const[s,ks]of[[MESH.round,1],[MESH.birch,1],[MESH.pine,MATAV.kPinho]]){if(!s)continue;for(let i=0;i<s.n;i++){const o=i*8,q=L.m[mataEsp(s.arr[o],s.arr[o+2])];
    if(ks===1)copiarInst(q,s.arr,o);else{for(let k=0;k<8;k++)tmp[k]=s.arr[o+k];tmp[4]*=ks;copiarInst(q,tmp,0);}}}
  for(let i=0;i<MATAV.nExtra;i++){const o=i*8,a=MATAV.extra;copiarInst(L.m[a[o+4]>3.0&&MATAV.jac>=0&&GIGANTES.some(T=>T.x===a[o]&&T.z===a[o+2])?MATAV.jac:mataEsp(a[o],a[o+2])],a,o);}
  for(const m of L.m)subirInst(m);}
PASSOS.push(function mataFotos(){if(MATAV.longe||MATAV.erroFoto||!MATAV.ok||!mataLigada()||!mataProntas())return;
  try{mataAssar();mataDistribuir();}catch(e){MATAV.erroFoto=String(e);console.error('mata (fotos)',e);}});
/* desenho com luz: no lugar das redondas e bétulas de perto entram as espécies (madeira com o lado de trás escondido, folhas dos
   dois lados); de longe, as placas da própria espécie */
{const _di=drawInst;drawInst=function(Pg,m){
  if(Pg===PDI&&MATAV.sombraPerto&&(m===MESH.roundN||m===MESH.birchN||m===MESH.pineN))return;   // sombra de perto: quem faz é a árvore nova (mataSombra)
  if(Pg===PLI&&MATAV.ok&&(m===MESH.roundN||m===MESH.birchN||(m===MESH.pineN&&MATAV.restoP))){_di(Pg,m===MESH.roundN?MATAV.restoR:m===MESH.birchN?MATAV.restoB:MATAV.restoP);
    if(m===MESH.roundN&&mataLigada()&&mataProntas()){for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)if(!p.fol&&p.m.n)_di(Pg,p.m);
      const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);for(const e of MATAV.esp)for(const L of e.lods)for(const p of L)if(p.fol&&p.m.n)_di(Pg,p.m);if(cf)gl.enable(gl.CULL_FACE);}
    return;}
  if(Pg===PLI&&MATAV.longe&&mataLigada()&&(m===MESH.round||m===MESH.birch||m===MESH.pine)){if(m===MESH.round){const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);
      for(const q of MATAV.longe.m)if(q.n)_di(Pg,q);if(cf)gl.enable(gl.CULL_FACE);}return;}
  return _di.apply(this,arguments);};}
/* gigante com a mata nova ligada: só a madeira (a copa é o jacarandá das instâncias) */
gigMalha=function(T){return T.meshM&&MATAV.ok&&MATAV.jac>=0&&mataLigada()&&mataProntas()?T.meshM:T.mesh;};
/* bolas de folha das árvores de fruta (14c_rurais): só sem a mata nova; a sombra delas fica sempre (é a sombra da copa nova) */
{const _bw=buildWorld;buildWorld=function(){if(typeof COPAS_FRUT!=='undefined')COPAS_FRUT.n=0;MESH.copasFrut=null;return _bw.apply(this,arguments);};}
function mataCopasFrut(){if(typeof COPAS_FRUT==='undefined'||!COPAS_FRUT.n)return null;if(!MESH.copasFrut)MESH.copasFrut=litMesh(COPAS_FRUT.data());return MESH.copasFrut;}
DESENHO.opaco.push(function mataFrutDesenho(Pg){if(mataLigada()&&mataProntas()&&MATAV.peq>=0)return;const m=mataCopasFrut();if(m)drawStat(Pg,m,ID);});
DESENHO.sombra.push(function mataFrutSombra(Pg,perto){if(perto&&mataLigada()&&mataProntas()&&MATAV.peq>=0)return;const m=mataCopasFrut();if(m)drawStat(Pg,m,ID);});
/* sombra de perto das árvores novas: madeira e folhas (com o recorte da textura), no lugar da sombra da árvore de bola e cone;
   na sombra de longe (borrada) continua a forma antiga. Gigante: na de perto, só a madeira dela (a copa é o jacarandá). */
const MATA_DVS=DEPTH_VS.replace('layout(location=0) in vec3 aPos;','layout(location=0) in vec3 aPos;layout(location=6) in vec2 aUV;out vec2 vUV;').replace('void main(){','void main(){vUV=aUV;');
const MATA_DFS='precision mediump float;in vec2 vUV;uniform sampler2D uAlbT;uniform float uCorte;void main(){if(uCorte>0.5&&texture(uAlbT,vUV).a<0.5)discard;}';
let PDIT=null;
DESENHO.sombra.push(function mataSombra(Pg,perto){MATAV.sombraPerto=!!perto&&mataLigada()&&mataProntas();if(!MATAV.sombraPerto)return;
  if(!PDIT)PDIT=program(MATA_DVS,MATA_DFS,'#define INST\n');const vp=gl.getUniform(Pg.p,Pg.u.uViewProj);
  gl.useProgram(PDIT.p);gl.uniformMatrix4fv(PDIT.u.uViewProj,false,vp);if(PDIT.u.uTime)gl.uniform1f(PDIT.u.uTime,G.t);if(PDIT.u.uWind)gl.uniform2fv(PDIT.u.uWind,E.wind);if(PDIT.u.uAlbT)gl.uniform1i(PDIT.u.uAlbT,5);
  const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);
  for(const e of MATAV.esp)for(const L of e.lods)for(const p of L){const m=p.m;if(!m.n)continue;if(PDIT.u.uCorte)gl.uniform1f(PDIT.u.uCorte,p.fol?1:0);if(PDIT.u.uSway)gl.uniform1f(PDIT.u.uSway,m.sway||0);
    gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,p.tex);gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(m.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,m.count,m.n);}
  if(cf)gl.enable(gl.CULL_FACE);gl.bindVertexArray(null);gl.useProgram(Pg.p);});
gigSombra=function(T,perto){return perto&&T.meshM&&MATAV.ok&&MATAV.jac>=0&&mataLigada()&&mataProntas()?T.meshM:T.mesh;};

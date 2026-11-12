/* ================= Árvores de longe com a cara das de perto (12/11/2026) — pedido do Himalaia =================
   "o gráfico bonito só aparece de perto": em primeira pessoa (a pé ou no carro) o horizonte mostrava a versão leve das
   árvores (cones e bolos de ~150 triângulos), bem diferente das de perto.
   Agora, logo no começo, cada árvore de perto é fotografada de lado, de dois ângulos (frente e lado), numa textura só
   (impostor): os 3 pinheiros de verdade e as versões detalhadas da árvore redonda, da bétula e da árvore seca.
   De longe, cada árvore vira duas placas cruzadas com essas fotos: 4 triângulos por árvore, a mesma cara da de perto, a mesma
   cor de cada árvore e o mesmo balanço do vento.
   · Pinheiros: a placa entra logo depois do pinheiro de verdade (PINHO_R); antes, entre ele e o fim do "perto", ficava o
     pinheiro detalhado antigo, de outra cara. As outras árvores passam para a placa no fim do "perto" (arvPerto).
   · A sombra continua a de antes (a das versões leve e detalhada, que têm a mesma forma).
   · No gráfico Baixo (aparelho fraco) fica tudo como antes.
   · Enquanto as texturas do pinheiro não carregam, fica a versão leve; a foto é tirada assim que elas chegam (ou, se elas
     não chegarem em 15 s, com o pinheiro detalhado antigo, e de novo quando chegarem). */
const ARVL={ok:false,erro:false,tex:null,m:{},pinhos:[],lim:{},info:null,desl:false,resto:true,t0:0,comFir:false};
const ARVL_CEL=256,ARVL_PAD=4;
function arvlLigado(){return!ARVL.desl&&cfg.graf!=='baixo';}

/* medidas das árvores detalhadas (o mesmo desenho que vira MESH.pineN, roundN, birchN e deadN) */
function arvlLimites(f){const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
  for(let i=0;i+10<f.length;i+=11)for(let k=0;k<3;k++){const v=f[i+k];if(v<lo[k])lo[k]=v;if(v>hi[k])hi[k]=v;}return{lo,hi};}
{const _vg=vegGeometry;vegGeometry=function(){const V=_vg.apply(this,arguments);
  try{for(const k of['pineHi','roundHi','birchHi','deadHi'])if(V[k])ARVL.lim[k]=arvlLimites(V[k]);}catch(e){console.error('árvores de longe',e);}return V;};}

/* foto da árvore: cor da peça (com a textura e o recorte das agulhas, como no jogo) e um sombreado leve pela normal,
   porque a placa de longe recebe a luz por igual */
let ARVL_P=null;
const ARVL_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec4 aCol;layout(location=5) in vec3 aNrm;layout(location=6) in vec2 aUV;
uniform mat4 uVP;out vec3 vC,vN;out vec2 vUV;
void main(){vC=aCol.rgb;vN=aNrm;vUV=aUV;gl_Position=uVP*vec4(aPos,1.0);}`;
const ARVL_FS=`precision highp float;in vec3 vC,vN;in vec2 vUV;uniform sampler2D uT;uniform float uUseT,uSomb;out vec4 o;
void main(){vec3 c=vC;
  if(uUseT>0.5){vec4 t=texture(uT,vUV);
    if(uUseT>1.5){vec2 ts=vec2(textureSize(uT,0)),du=dFdx(vUV)*ts,dv=dFdy(vUV)*ts;float lod=max(0.0,0.5*log2(max(max(dot(du,du),dot(dv,dv)),1e-8)));if(t.a*(1.0+lod*0.25)<0.5)discard;}
    c*=t.rgb;}
  vec3 n=normalize(vN);c*=mix(uSomb,1.0,clamp(n.y*0.5+0.5,0.0,1.0));
  o=vec4(c,1.0);}`;
/* projeção ortográfica de lado: quadrado de lado s, de y0 para cima; lado=false olha ao longo de z (placa no plano XY), true ao longo de x */
function arvlOrto(o,s,y0,zr,lado){o.fill(0);const k=2/s;if(!lado){o[0]=k;o[10]=-1/zr;}else{o[8]=k;o[2]=-1/zr;}o[5]=k;o[13]=-(2*y0/s+1);o[15]=1;return o;}
function arvlUniao(a,b){return{lo:[0,1,2].map(k=>Math.min(a.lo[k],b.lo[k])),hi:[0,1,2].map(k=>Math.max(a.hi[k],b.hi[k]))};}

/* duas placas cruzadas do tamanho da foto; a normal aponta para cima e abre um pouco para fora nas bordas */
function arvlGeo(cel){const f=[],uv=[],h=cel.s/2,y0=cel.y0,y1=y0+cel.s;
  for(let v=0;v<2;v++){const[u0,v0,u1,v1]=cel.uv[v];
    const P=(a,y,u,w)=>{const na=a/h*0.35,l=Math.hypot(na,1);if(v===0)f.push(a,y,0,1,1,1,0,0,na/l,1/l,0);else f.push(0,y,a,1,1,1,0,0,0,1/l,na/l);uv.push(u,w);};
    P(-h,y0,u0,v0);P(h,y0,u1,v0);P(h,y1,u1,v1);P(-h,y0,u0,v0);P(h,y1,u1,v1);P(-h,y1,u0,v1);}
  return{f:new Float32Array(f),uv:new Float32Array(uv)};}
function arvlMalha(g,max,sway){const m=instMesh(g.f,max);gl.bindVertexArray(m.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g.uv,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.FLOAT,false,8,0);gl.bindVertexArray(null);return Object.assign(m,{uvBuf:b,tex:ARVL.tex,alfa:1,sway:sway||0});}

/* tira as fotos (uma vez; de novo só quando o pinheiro de verdade fica pronto depois) */
function arvlAssar(){const t0=performance.now(),fir=PINHO.ok&&pinhoPronto(),F=[];
  if(fir)PINHO.v.forEach((v,i)=>F.push({nome:'pinho'+i,partes:[{m:v.madeira,tex:PINHO.tc,alfa:1},{m:v.agulha,tex:PINHO.ta,alfa:2}],lim:arvlUniao(v.madeira,v.agulha)}));
  else F.push({nome:'pinho0',partes:[{m:MESH.pineN}],lim:ARVL.lim.pineHi});
  F.push({nome:'round',partes:[{m:MESH.roundN}],lim:ARVL.lim.roundHi},{nome:'birch',partes:[{m:MESH.birchN}],lim:ARVL.lim.birchHi},{nome:'dead',partes:[{m:MESH.deadN}],lim:ARVL.lim.deadHi});
  if(F.some(x=>!x.lim||!x.partes.every(p=>p.m&&p.m.vao)))throw new Error('árvores sem medida');
  const C=ARVL_CEL,pad=ARVL_PAD,cols=4,nc=F.length*2,AW=cols*C,AH=Math.ceil(nc/cols)*C;
  const vp=gl.getParameter(gl.VIEWPORT),cc=gl.getParameter(gl.COLOR_CLEAR_VALUE),cf=gl.isEnabled(gl.CULL_FACE),dt=gl.isEnabled(gl.DEPTH_TEST),bl=gl.isEnabled(gl.BLEND),
    sc=gl.isEnabled(gl.SCISSOR_TEST),dm=gl.getParameter(gl.DEPTH_WRITEMASK),fb0=gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,AW,AH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const fbo=gl.createFramebuffer(),rb=gl.createRenderbuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,AW,AH);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);
  let srgb=true;if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){srgb=false;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,AW,AH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);}
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,cels=[];
  if(ok){if(!ARVL_P)ARVL_P=program(ARVL_VS,ARVL_FS,'');
    gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,AW,AH);gl.clearColor(0.05,0.08,0.05,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
    gl.useProgram(ARVL_P.p);gl.uniform1i(ARVL_P.u.uT,5);gl.uniform1f(ARVL_P.u.uSomb,0.62);const O=new Float32Array(16);
    F.forEach((fo,i)=>{const L=fo.lim,W=Math.max(Math.abs(L.lo[0]),Math.abs(L.hi[0]),Math.abs(L.lo[2]),Math.abs(L.hi[2])),H=L.hi[1]-L.lo[1],s=Math.max(2*W,H)*1.04,y0=L.lo[1]-s*0.01,zr=W+1;
      const cel={nome:fo.nome,s,y0,uv:[]};
      for(let v=0;v<2;v++){const c=i*2+v,cx=(c%cols)*C,cy=Math.floor(c/cols)*C;
        gl.viewport(cx+pad,cy+pad,C-2*pad,C-2*pad);gl.uniformMatrix4fv(ARVL_P.u.uVP,false,arvlOrto(O,s,y0,zr,v===1));
        for(const pa of fo.partes){gl.uniform1f(ARVL_P.u.uUseT,pa.tex?pa.alfa:0);if(pa.tex){gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,pa.tex);gl.activeTexture(gl.TEXTURE0);}
          gl.bindVertexArray(pa.m.vao);gl.drawArrays(gl.TRIANGLES,0,pa.m.count);}
        cel.uv.push([(cx+pad)/AW,(cy+pad)/AH,(cx+C-pad)/AW,(cy+C-pad)/AH]);}
      cels.push(cel);});
    gl.bindVertexArray(null);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb0);gl.deleteFramebuffer(fbo);gl.deleteRenderbuffer(rb);
  gl.viewport(vp[0],vp[1],vp[2],vp[3]);gl.clearColor(cc[0],cc[1],cc[2],cc[3]);gl.depthMask(dm);
  for(const[k,e]of[[gl.CULL_FACE,cf],[gl.DEPTH_TEST,dt],[gl.BLEND,bl],[gl.SCISSOR_TEST,sc]])e?gl.enable(k):gl.disable(k);
  if(!ok){gl.deleteTexture(tex);throw new Error('sem textura para as fotos das árvores');}
  gl.bindTexture(gl.TEXTURE_2D,tex);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAX_LEVEL,4);
  {const an=gl.getExtension('EXT_texture_filter_anisotropic');if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);}
  if(ARVL.tex)gl.deleteTexture(ARVL.tex);ARVL.tex=tex;ARVL.m={};ARVL.pinhos=[];
  for(const cel of cels){const pinho=cel.nome.startsWith('pinho'),base=pinho?MESH.pine:MESH[cel.nome];
    const m=arvlMalha(arvlGeo(cel),pinho?MESH.pine.max+MESH.pineN.max:base.max,base.sway);ARVL.m[cel.nome]=m;if(pinho)ARVL.pinhos.push(m);}
  ARVL.ok=true;ARVL.comFir=fir;ARVL.info={ms:Math.round(performance.now()-t0),srgb,atlas:[AW,AH],tipos:cels.map(c=>c.nome),fir};
  rebuildVeg(true);}

/* hora de tirar as fotos: no primeiro quadro com as árvores montadas (esperando até 15 s o pinheiro de verdade) */
function arvlHora(){if(ARVL.erro||!arvlLigado()||!MESH.roundN||!ARVL.lim.roundHi)return false;
  if(!ARVL.ok){if(!PINHO.ok||pinhoPronto())return true;if(!ARVL.t0)ARVL.t0=performance.now();return performance.now()-ARVL.t0>15000;}
  return!ARVL.comFir&&PINHO.ok&&pinhoPronto();}
{const _r=render;render=function(){if(arvlHora()){try{arvlAssar();}catch(e){ARVL.erro=true;ARVL.ok=false;console.error('árvores de longe',e);}}
  /* mudou o gráfico (ou ligou/desligou as placas): refaz as listas já, sem esperar a próxima volta */
  const k=cfg.graf+(arvlLigado()?1:0);if(ARVL.ok&&ARVL.k!==k){ARVL.k=k;try{rebuildVeg(true);}catch(e){console.error('árvores de longe',e);}}
  return _r.apply(this,arguments);};}

/* as árvores de longe (e os pinheiros depois do de verdade) vão para as placas; cada pinheiro com a foto do mesmo modelo que ele tem de perto */
function arvlDistribuir(){if(!ARVL.ok||!arvlLigado())return;const M=ARVL.m,np=ARVL.pinhos.length;
  for(const q of ARVL.pinhos)q.n=0;M.round.n=0;M.birch.n=0;M.dead.n=0;
  const pinho=(a,o)=>{const v=np>1?Math.min(np-1,Math.floor(pinhoHash(a[o],a[o+2])*np)):0;copiarInst(ARVL.pinhos[v],a,o);};
  {const s=MESH.pine;for(let i=0;i<s.n;i++)pinho(s.arr,i*8);}
  if(ARVL.resto&&ARVL.comFir&&PINHO.ok&&pinhoPronto()&&PINHO.resto){const re=PINHO.resto;for(let i=0;i<re.n;i++)pinho(re.arr,i*8);re.n=0;}
  for(const[k,s]of[['round',MESH.round],['birch',MESH.birch],['dead',MESH.dead]])for(let i=0;i<s.n;i++)copiarInst(M[k],s.arr,i*8);
  for(const q of ARVL.pinhos)subirInst(q);subirInst(M.round);subirInst(M.birch);subirInst(M.dead);}
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;const r=_rv.apply(this,arguments);
  if(force||vegT!==ia-1){try{arvlDistribuir();}catch(e){console.error('árvores de longe',e);}}return r;};}

/* no desenho com luz, a versão leve dá lugar às placas (a sombra continua com a versão leve) */
{const _di=drawInst;drawInst=function(Pg,m){
  if(Pg===PLI&&ARVL.ok&&arvlLigado()){const L=m===MESH.pine?ARVL.pinhos:m===MESH.round?[ARVL.m.round]:m===MESH.birch?[ARVL.m.birch]:m===MESH.dead?[ARVL.m.dead]:null;
    if(L){const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);for(const q of L)_di(Pg,q);if(cf)gl.enable(gl.CULL_FACE);return;}}
  return _di.apply(this,arguments);};}

/* para os testes: a textura com as fotos, como imagem (o vazio fica cinza) */
function arvlAtlasPNG(){if(!ARVL.tex||!ARVL.info)return null;const[AW,AH]=ARVL.info.atlas,old=gl.getParameter(gl.FRAMEBUFFER_BINDING),fb=gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ARVL.tex,0);const px=new Uint8Array(AW*AH*4);gl.readPixels(0,0,AW,AH,gl.RGBA,gl.UNSIGNED_BYTE,px);
  gl.bindFramebuffer(gl.FRAMEBUFFER,old);gl.deleteFramebuffer(fb);const cv=document.createElement('canvas');cv.width=AW;cv.height=AH;const cx=cv.getContext('2d'),im=cx.createImageData(AW,AH);
  for(let y=0;y<AH;y++)for(let x=0;x<AW;x++){const s=((AH-1-y)*AW+x)*4,d=(y*AW+x)*4,a=px[s+3]>0;im.data[d]=a?px[s]:70;im.data[d+1]=a?px[s+1]:70;im.data[d+2]=a?px[s+2]:74;im.data[d+3]=255;}
  cx.putImageData(im,0,0);return cv.toDataURL('image/png');}

/* ================= Ferramentas com modelo de verdade (Poly Haven, licença CC0) =================
   MOD3D (21c_mod3d_dados.js) traz cada modelo inteiro, já no espaço da mão (osso 11: cabo ao longo de +z; lâmina, cano ou
   ponta para -y), e a textura de cor em 1K. Aqui eles viram malhas com textura e entram no lugar das feitas de caixinha:
   pistola (cabo de madeira), machado de incêndio, picareta, pá e corta-cadeado; v10.2.2 (tools/mao_banco.py, dos GLB da Poly Haven):
   faca, facão, taco (e o com pregos), pé de cabra e lanterna de mão. Valem na mão (1ª e 3ª pessoa), no chão
   quando a peça é largada e na mão dos sobreviventes. A ponta do cano da pistola (clarão e fumaça) vem do próprio modelo. */
const MOD3D_TEX={};
let MOD3D_INFO={};
function mod3dDecodificar(d){const bin=b64bytes(d.b),dv=new DataView(bin.buffer,bin.byteOffset,bin.byteLength);
  const nv=dv.getUint32(0,true),nt=dv.getUint32(4,true),lo=[0,1,2].map(i=>dv.getFloat32(8+i*4,true)),hi=[0,1,2].map(i=>dv.getFloat32(20+i*4,true));
  let o=32;const P=new Float32Array(nv*3),U=new Float32Array(nv*2),N=new Float32Array(nv*3),I=new Uint32Array(nt*3),i32=nv>65535;
  for(let i=0;i<nv*3;i++){const k=i%3;P[i]=lo[k]+(hi[k]-lo[k])*dv.getUint16(o,true)/65535;o+=2;}
  {const u0=d.uv0||[0,0],uS=d.uvS||[1,1];for(let i=0;i<nv*2;i++){U[i]=u0[i&1]+uS[i&1]*dv.getUint16(o,true)/65535;o+=2;}}   // uv0/uvS: textura repetida (UV além de 0..1)
  for(let i=0;i<nt*3;i++){I[i]=i32?dv.getUint32(o,true):dv.getUint16(o,true);o+=i32?4:2;}
  for(let i=0;i<nv*3;i++){N[i]=dv.getInt8(o)/127;o++;}
  /* triângulos soltos no formato das outras malhas do jogo (posição, cor branca, brilho 0, interior 0, normal) + UV à parte */
  const f=new Float32Array(nt*3*11),uv=new Float32Array(nt*3*2);
  for(let t=0;t<nt*3;t++){const v=I[t],a=t*11,nx=N[v*3],ny=N[v*3+1],nz=N[v*3+2],l=Math.hypot(nx,ny,nz)||1;
    f[a]=P[v*3];f[a+1]=P[v*3+1];f[a+2]=P[v*3+2];f[a+3]=1;f[a+4]=1;f[a+5]=1;f[a+6]=0;f[a+7]=0;f[a+8]=nx/l;f[a+9]=ny/l;f[a+10]=nz/l;
    uv[t*2]=U[v*2];uv[t*2+1]=U[v*2+1];}
  return{f,uv,nv,nt,lo,hi};}
/* malha com textura: o mesmo arranjo das outras (a sombra e o resto do desenho continuam iguais) + coordenada de textura no atributo 6 */
function texMesh(f,uv,tex){const m=litMesh(f);gl.bindVertexArray(m.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,uv,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.FLOAT,false,8,0);gl.bindVertexArray(null);m.uvBuf=b;m.tex=tex;return m;}
function mod3dTextura(id,url){if(MOD3D_TEX[id])return MOD3D_TEX[id];
  const t=skTextura(url,true,()=>{t.pronta=true;const an=gl.getExtension('EXT_texture_filter_anisotropic');if(an){gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);}});
  /* o filtro do pixel provisório agora é posto dentro de skTextura (lá a textura fica ligada só na unidade 8) */
  return MOD3D_TEX[id]=t;}
function mod3dAplicar(){if(typeof MOD3D==='undefined'||!MESH.arma)return;
  {const b=gl.createTexture();gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,b);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.activeTexture(gl.TEXTURE0);}
  MOD3D_INFO={};
  for(const id in MOD3D){const d=MOD3D[id],g=mod3dDecodificar(d),m=texMesh(g.f,g.uv,mod3dTextura(id,d.t));m.mod3d=id;
    const velho=MESH.arma[id];if(velho&&!velho.mod3d)liberarMesh(velho);MESH.arma[id]=m;MOD3D_INFO[id]={tri:g.nt,vert:g.nv,min:g.lo,max:g.hi};}
  if(MOD3D.pistola&&MOD3D.pistola.boca){WGRIP.pistola[0]=MOD3D.pistola.boca[0];WGRIP.pistola[1]=MOD3D.pistola.boca[1];WGRIP.pistola[2]=MOD3D.pistola.boca[2];}}
etapaMalha('fim','lugares',1,()=>mod3dAplicar());   /* (antes embrulhava initMeshes; 13/11: etapa da montagem) */

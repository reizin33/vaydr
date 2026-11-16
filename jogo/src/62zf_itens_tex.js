/* ================= Textura nos itens feitos no código (v10.2.4, 16/11/2026) =================
   Himalaia: "muitos itens na mão estão sem textura". Os itens com modelo 3D de verdade (pistola, machado de incêndio, picareta,
   pá, faca, facão, taco, pé de cabra, corta-cadeado, lanterna) já tinham textura; os feitos no código (machado de pedra, faca de
   pedra, lança, porrete, taco cravado, pedra, coquetel...) eram só cor. Agora cada peça deles ganha a textura do material:
   · madeira (cabos, porrete, haste da lança): veio de uma tábua (weathered_planks);
   · metal (lâminas, pregos, ferragens): metal com ferrugem (rusty_metal_02);
   · pedra (cabeça do machado de pedra, faca de pedra, pedra): grão de rocha (rock_boulder_dry);
   · fibra, corda e pano (amarrações, trapo do coquetel): trama de linho (rough_linen);
   · vidro e o que é verde ficam lisos.
   O material sai da cor de cada triângulo (a cor continua a mesma: a textura tem brilho médio 0,5 e a cor vai em dobro), e a
   coordenada de textura é a projeção na face (de 25 em 25 cm, com o veio correndo ao longo do cabo). Cada item vira até 5
   pedaços, um por material; drawStat desenha os pedaços (mão, chão, sobreviventes, sombra e 1ª pessoa). */
const ITX={feito:false,tex:{},pedra:new Set(['pedra','machadoPedra','facaPedra']),pula:new Set(['braco']),erro:null,info:null};
function itxTex(k){if(ITX.tex[k])return ITX.tex[k];
  const t=skTextura(ITX_DADOS[k],true,()=>{skNaUnidade(()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);});t.pronta=true;});
  return ITX.tex[k]=t;}
function itxMaterial(id,r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx-mn,lum=0.2126*r+0.7152*g+0.0722*b;
  if(g>r*1.05&&g>b)return null;                                   // vidro e folha: lisos
  if(sat<0.035||(mx>0&&sat/mx<0.25))return ITX.pedra.has(id)?'pedra':'metal';
  if(r>g&&g>=b*0.8)return lum<0.25?'madeira':'pano';
  return'metal';}
function itxConverter(){const Wg=weaponGeometry();let n=0;const lista=[];
  for(const id in Wg){if(ITX.pula.has(id)||(typeof MOD3D!=='undefined'&&MOD3D[id]))continue;const m0=MESH.arma[id];if(!m0||m0.mod3d||m0.partes)continue;
    const f=Wg[id],nt=Math.floor(f.length/33),grupos={};
    for(let t=0;t<nt;t++){const o=t*33,r=(f[o+3]+f[o+14]+f[o+25])/3,g=(f[o+4]+f[o+15]+f[o+26])/3,b=(f[o+5]+f[o+16]+f[o+27])/3;
      const k=itxMaterial(id,r,g,b)||'liso';(grupos[k]||(grupos[k]=[])).push(t);}
    if(Object.keys(grupos).length===1&&grupos.liso)continue;
    const partes=[];
    for(const k in grupos){const tris=grupos[k],ff=new Float32Array(tris.length*33),uv=new Float32Array(tris.length*6);
      tris.forEach((t,j)=>{const a=t*33;ff.set(f.subarray(a,a+33),j*33);
        const ux=f[a+11]-f[a],uy=f[a+12]-f[a+1],uz=f[a+13]-f[a+2],vx=f[a+22]-f[a],vy=f[a+23]-f[a+1],vz=f[a+24]-f[a+2],
          nx=Math.abs(uy*vz-uz*vy),ny=Math.abs(uz*vx-ux*vz),nz=Math.abs(ux*vy-uy*vx);
        for(let q=0;q<3;q++){const p=a+q*11,X=f[p],Y=f[p+1],Z=f[p+2];let U,V;if(nz>=nx&&nz>=ny){U=X;V=Y;}else if(nx>=ny){U=Z;V=Y;}else{U=Z;V=X;}
          uv[j*6+q*2]=U*4+0.37;uv[j*6+q*2+1]=V*4+0.61;
          if(k!=='liso'){const d=j*33+q*11;ff[d+3]*=2;ff[d+4]*=2;ff[d+5]*=2;}}});
      partes.push(k==='liso'?litMesh(ff):texMesh(ff,uv,itxTex(k)));}
    MESH.arma[id]={partes,vao:partes[0].vao,count:partes[0].count,itx:true};n++;lista.push(id+':'+Object.keys(grupos).join('+'));}
  ITX.info={itens:n,lista};}
PASSOS.push(function itensTex(){if(ITX.feito||!MESH.arma||typeof ITX_DADOS==='undefined'||typeof texMesh!=='function')return;ITX.feito=true;
  try{itxConverter();}catch(e){ITX.erro=String(e);console.error('itens com textura',e);}});
{const _ds=drawStat;drawStat=function(Pg,mesh,M){if(mesh&&mesh.partes){for(const p of mesh.partes)_ds(Pg,p,M);return;}return _ds(Pg,mesh,M);};}

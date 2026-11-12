/* ================= Baú, galhos secos e pinheiro de verdade (Poly Haven, CC0) — pedidos do Himalaia =================
   Os modelos vêm de 21e_modelos_dados.js (blendtools/modelos.py), sem tirar triângulos, com a textura de cor em 1K.
   · Baú (Wooden Crate 01): entra no lugar do baú feito de caixinha, no que o jogador constrói (no chão, no alto, no prédio,
     no telhado) e no baú do ferreiro da Serra. Colisão, vida, uso e o fantasma da construção continuam os de antes.
   · Galhos secos (Dry Branches Medium 01): 3 modelos espalhados no chão da mata, perto das árvores, só de enfeite (não se
     pegam; os gravetos de pegar continuam os mesmos). Desenhados perto do jogador; a quantidade e a distância mudam com o
     nível de gráfico.
   · Pinheiro (Fir Sapling Medium, versão leve): os pinheiros perto do jogador são desenhados com um dos 3 modelos, sempre o
     mesmo para a mesma árvore; os de longe continuam os de antes. Cada modelo tem de 8 a 15 mil triângulos, então a
     distância do pinheiro novo depende do nível de gráfico (PINHO_R); dali até o fim do "perto" fica o pinheiro detalhado
     antigo. A sombra continua a do pinheiro antigo, que tem a mesma altura e o mesmo lugar (as agulhas com recorte não
     entram na sombra).
   Enquanto as texturas não carregam, aparece o desenho antigo (nada fica sem árvore nem com placa cinza). */
let MODX_INFO={};
/* textura de modelo: 1K, com mipmap e anisotropia; rep = repete fora de 0..1 (casca e agulhas do pinheiro) */
function texModelo(id,url,rep){if(MOD3D_TEX[id])return MOD3D_TEX[id];
  const t=skTextura(url,true,()=>{gl.bindTexture(gl.TEXTURE_2D,t);const an=gl.getExtension('EXT_texture_filter_anisotropic');if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);
    if(rep){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}t.pronta=true;});
  /* o filtro do pixel provisório agora é posto dentro de skTextura (lá a textura fica ligada só na unidade 8) */
  return MOD3D_TEX[id]=t;}
/* malha instanciada com textura (atributo 6 = UV), no mesmo arranjo das outras instanciadas */
function instTex(d,max,tex,alfa,cor){const g=mod3dDecodificar(d);if(cor)cor(g.f);const m=instMesh(g.f,max);gl.bindVertexArray(m.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g.uv,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.FLOAT,false,8,0);gl.bindVertexArray(null);return Object.assign(m,{uvBuf:b,tex,alfa:alfa||0,tri:g.nt,lo:g.lo,hi:g.hi});}   // alfa: 0 opaco, 1 recorte (capim), 2 recorte e some perto da câmera (agulhas)
function copiarInst(m,a,o){if(m.n>=m.max)return;m.arr.set(a.subarray(o,o+8),m.n*8);m.n++;}
function subirInst(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.arr,0,m.n*8);}

/* ---------- baú ---------- */
function modxBau(){if(typeof MODX==='undefined'||!MODX.bau||!MESH.obra)return;const d=MODX.bau,g=mod3dDecodificar(d),m=texMesh(g.f,g.uv,texModelo('bau',d.t,false));m.mod3d='bau';
  const velho=MESH.obra.bau;MESH.obra.bau=m;if(velho&&!velho.mod3d)liberarMesh(velho);MODX_INFO.bau={tri:g.nt,min:g.lo.map(v=>+v.toFixed(3)),max:g.hi.map(v=>+v.toFixed(3))};}

/* ---------- galhos secos no chão da mata ---------- */
const GALHOS_SECOS=[],GALHO_M=[];let GALHOS_INFO=null;
const GALHO_CFG={baixo:{r:16,max:16},medio:{r:24,max:36},alto:{r:30,max:60},ultra:{r:42,max:110}};
function galhosMontar(){GALHOS_SECOS.length=0;const R=rng(77031);let tent=0;
  for(const t of TREES){if(t.agua||R()>0.32)continue;tent++;
    const a=R()*6.283,d=(1.4+R()*3.2)*Math.min(1.6,Math.max(0.8,t.s||1)),x=t.x+Math.cos(a)*d,z=t.z+Math.sin(a)*d;
    if(!dentroMapa(x,z,-1)||!freeSpot(x,z,0.45)||(RIO.ok&&aguaPerto(x,z,1.5))||(typeof marEm==='function'&&marEm(x,z)))continue;const y=ground(x,z),n=aguaNivel(x,z);if(n!==null&&y<n+0.1)continue;
    GALHOS_SECOS.push({x,y:y-0.03,z,r:R()*6.283,s:0.9+R()*0.7,t:0.8+R()*0.35,k:Math.floor(R()*3)%3});}
  GALHOS_INFO={total:GALHOS_SECOS.length,arvoresTentadas:tent};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{galhosMontar();}catch(e){console.error('galhos secos',e);}return r;};}
function galhosProntos(){return GALHO_M.length===3&&!!GALHO_M[0].tex.pronta;}
function galhosAtualizar(){if(GALHO_M.length!==3)return;const c=GALHO_CFG[cfg.graf]||GALHO_CFG.alto,R2=c.r*c.r,L=[];
  for(const g of GALHOS_SECOS){const d=d2(g.x,g.z,P.x,P.z);if(d<R2)L.push([d,g]);}
  if(L.length>c.max){L.sort((a,b)=>a[0]-b[0]);L.length=c.max;}
  for(const m of GALHO_M)m.n=0;
  for(const[,g]of L){const m=GALHO_M[g.k];if(m.n>=m.max)continue;const o=m.n*8,a=m.arr;a[o]=g.x;a[o+1]=g.y;a[o+2]=g.z;a[o+3]=g.r;a[o+4]=g.s;a[o+5]=a[o+6]=a[o+7]=g.t;m.n++;}
  for(const m of GALHO_M)subirInst(m);}
DESENHO.opaco.push(function galhosDesenho(Pg){if(!galhosProntos()||!GALHO_M.some(m=>m.n))return;setLit(PLI);for(const m of GALHO_M)drawInst(PLI,m);setLit(Pg);});

/* ---------- pinheiro de perto ---------- */
const PINHO={v:[],ok:false,tc:null,ta:null,resto:null};
const PINHO_R={baixo:0,medio:16,alto:24,ultra:36};   // até onde (m) o pinheiro novo é desenhado em cada nível de gráfico (no Baixo, que é para aparelho fraco, fica o de antes)
/* outra lista de instâncias para a mesma malha (o pinheiro detalhado antigo, para os de perto que ficam além de PINHO_R) */
function instClone(m,max){gl.bindVertexArray(m.vao);const vb=gl.getVertexAttrib(0,gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vb);litAttribs();
  const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,max*32,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);
  gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
  gl.bindVertexArray(null);return{vao,count:m.count,ib,max,n:0,arr:new Float32Array(max*8),sway:m.sway};}
/* agulhas: o miolo da copa fica mais escuro que a ponta dos galhos (a luz não entra lá dentro) e o verde puxa um pouco para o do
   pinheiro de longe, para a troca de um para o outro não saltar à vista */
function pinhoCorAgulha(f){const n=f.length/11,NB=12;let ym=0.01;for(let i=0;i<n;i++)ym=Math.max(ym,f[i*11+1]);
  const rm=new Float32Array(NB).fill(0.3),bin=y=>Math.min(NB-1,Math.max(0,Math.floor(y/ym*NB)));
  for(let i=0;i<n;i++){const a=i*11,r=Math.hypot(f[a],f[a+2]),b=bin(f[a+1]);if(r>rm[b])rm[b]=r;}
  for(let i=0;i<n;i++){const a=i*11,k=0.45+0.55*Math.min(1,Math.hypot(f[a],f[a+2])/rm[bin(f[a+1])]);f[a+3]=0.62*k;f[a+4]=0.74*k;f[a+5]=0.62*k;}}
function pinhoPronto(){return PINHO.ok&&!!PINHO.tc.pronta&&!!PINHO.ta.pronta;}
function pinhoHash(x,z){const s=Math.sin(x*91.7311+z*47.1393)*24634.6345;return s-Math.floor(s);}
/* reparte os pinheiros de perto (os mesmos de MESH.pineN) entre os 3 modelos, sempre o mesmo modelo para a mesma árvore */
function pinhoDistribuir(){if(!PINHO.ok)return;const src=MESH.pineN,a=src.arr,R=PINHO_R[cfg.graf]||PINHO_R.alto,R2=R*R,re=PINHO.resto;
  for(const v of PINHO.v){v.madeira.n=0;v.agulha.n=0;}re.n=0;
  for(let i=0;i<src.n;i++){const o=i*8;if(d2(a[o],a[o+2],P.x,P.z)>=R2){copiarInst(re,a,o);continue;}
    const v=PINHO.v[Math.min(2,Math.floor(pinhoHash(a[o],a[o+2])*3))];copiarInst(v.madeira,a,o);copiarInst(v.agulha,a,o);}
  for(const v of PINHO.v){subirInst(v.madeira);subirInst(v.agulha);}subirInst(re);}
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;const r=_rv.apply(this,arguments);if(force||vegT!==ia-1){try{pinhoDistribuir();}catch(e){console.error('pinheiro',e);}}return r;};}

/* ---------- montar as malhas (depois das outras) ---------- */
function modxMontar(){MODX_INFO={};if(typeof MODX==='undefined')return;
  try{modxBau();}catch(e){console.error('baú novo',e);}
  GALHO_M.length=0;
  try{if(MODX.galhos){const tex=texModelo('galhos',MODX.galhos.t,false);for(const d of MODX.galhos.v)GALHO_M.push(instTex(d,140,tex,false));MODX_INFO.galhos=GALHO_M.map(m=>m.tri);}}catch(e){console.error('galhos secos',e);GALHO_M.length=0;}
  PINHO.ok=false;PINHO.v=[];
  try{if(MODX.pinheiro&&MESH.pineN){const P_=MODX.pinheiro;PINHO.tc=texModelo('pinhoCasca',P_.tc,true);PINHO.ta=texModelo('pinhoAgulha',P_.ta,true);
    for(const d of P_.v)PINHO.v.push({madeira:instTex(d.madeira,MESH.pineN.max,PINHO.tc,false),agulha:Object.assign(instTex(d.agulha,MESH.pineN.max,PINHO.ta,2,pinhoCorAgulha),{sway:MESH.pineN.sway})});
    for(const v of PINHO.v)v.madeira.sway=MESH.pineN.sway;
    PINHO.resto=instClone(MESH.pineN,MESH.pineN.max);
    PINHO.ok=PINHO.v.length===3;MODX_INFO.pinheiro=PINHO.v.map(v=>({madeira:v.madeira.tri,agulha:v.agulha.tri}));}}catch(e){console.error('pinheiro',e);PINHO.ok=false;}}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);modxMontar();return r;};}
{const _rg=rebuildGrass;rebuildGrass=function(){const r=_rg.apply(this,arguments);try{galhosAtualizar();}catch(e){console.error('galhos secos',e);}return r;};}
/* no desenho com luz: no lugar do pinheiro detalhado antigo entram os 3 modelos (madeira com o lado de trás escondido; agulhas dos dois lados) */
{const _di=drawInst;drawInst=function(Pg,m){if(m===MESH.pineN&&Pg===PLI&&pinhoPronto()){_di(Pg,PINHO.resto);for(const v of PINHO.v)_di(Pg,v.madeira);
    const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);for(const v of PINHO.v)_di(Pg,v.agulha);if(cf)gl.enable(gl.CULL_FACE);return;}
  return _di.apply(this,arguments);};}

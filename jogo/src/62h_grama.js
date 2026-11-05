/* ================= Capim de verdade (Poly Haven, Grass Medium 01, CC0) — pedido do Himalaia =================
   O capim continua nascendo nos mesmos lugares (GRASS) e sendo escolhido do mesmo jeito em volta do jogador (rebuildGrass, que
   continua enchendo MESH.grass como antes). O que muda é o desenho de cada tufo: no lugar dos 7 fios de triângulo entra um dos
   4 tufos do Grass Medium 01 (versão leve, LOD2), com a textura de cor e o recorte das folhas (21d_grama_dados.js).
   · Cada tufo novo é mais cheio, então só uma parte dos tufos de antes é desenhada (GRAMA.frac). A escolha é fixa pelo
     lugar (não pisca quando a lista muda) e o tipo de tufo também.
   · A cor da textura é um verde-oliva escuro de verdade (feita para a luz do Blender): aqui ela ganha o verde do capim do
     jogo, mais escuro no pé e mais claro na ponta como o capim antigo, senão o capim some no chão (gramaCor).
   · Enquanto a textura não termina de carregar, aparece o capim antigo (nunca fica o chão pelado nem triângulo cinza). */
const GRAMA={v:[],ok:false,frac:0.85,peso:[0.30,0.20,0.15,0.35],tex:null};   // peso: mid_b, mid_c, small_b, tall_a
let GRAMA_INFO=null;
function gramaHash(x,z){const s=Math.sin(x*12.9898+z*78.233)*43758.5453;return s-Math.floor(s);}
function gramaCor(f){const n=f.length/11;let ym=0.01;for(let i=0;i<n;i++)ym=Math.max(ym,f[i*11+1]);
  for(let i=0;i<n;i++){const a=i*11,k=0.7+0.6*f[a+1]/ym;f[a+3]=2.2*k;f[a+4]=4.1*k;f[a+5]=1.7*k;}}
function gramaMontar(){GRAMA.ok=false;GRAMA.v=[];if(typeof GRAMA3D==='undefined'||!MESH.grass)return;
  const tex=mod3dTextura('grama',GRAMA3D.t);GRAMA.tex=tex;const tris=[];
  for(let i=0;i<GRAMA3D.v.length;i++){const g=mod3dDecodificar({b:GRAMA3D.v[i]});gramaCor(g.f);const m=instMesh(g.f,MESH.grass.max);
    gl.bindVertexArray(m.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g.uv,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.FLOAT,false,8,0);gl.bindVertexArray(null);
    Object.assign(m,{uvBuf:b,tex,alfa:true,sway:MESH.grass.sway||0.42,nome:GRAMA3D.nomes[i],tri:g.nt});GRAMA.v.push(m);tris.push(g.nt);}
  GRAMA.ok=GRAMA.v.length===GRAMA.peso.length;GRAMA_INFO={tufos:GRAMA3D.nomes.slice(),tris};}
/* reparte os tufos escolhidos (os mesmos de MESH.grass) entre os 4 tipos */
function gramaDistribuir(){if(!GRAMA.ok)return;const src=MESH.grass,a=src.arr,n=src.n,V=GRAMA.v,W=GRAMA.peso;
  for(const m of V)m.n=0;
  for(let i=0;i<n;i++){const o=i*8,x=a[o],z=a[o+2];if(gramaHash(x,z)>=GRAMA.frac)continue;
    let h=gramaHash(z+17.3,x-5.1),k=0;while(k<W.length-1&&h>=W[k]){h-=W[k];k++;}
    const m=V[k];if(m.n>=m.max)continue;m.arr.set(a.subarray(o,o+8),m.n*8);m.n++;}
  for(const m of V){gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.arr,0,m.n*8);}}
function gramaPronta(){return GRAMA.ok&&!!GRAMA.tex&&!!GRAMA.tex.pronta;}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);try{gramaMontar();}catch(e){console.error('capim novo',e);GRAMA.ok=false;}return r;};}
{const _rg=rebuildGrass;rebuildGrass=function(){const r=_rg.apply(this,arguments);try{gramaDistribuir();}catch(e){console.error('capim novo',e);}return r;};}
/* no desenho: no lugar do capim antigo entram os 4 tufos novos (só no passe com luz; o capim não faz sombra, como antes) */
{const _di=drawInst;drawInst=function(Pg,m){if(m===MESH.grass&&Pg===PLI&&gramaPronta()){for(const v of GRAMA.v)_di(Pg,v);return;}return _di.apply(this,arguments);};}

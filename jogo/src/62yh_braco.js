/* ================= Braço da primeira pessoa de verdade (v10.2.2, etapa do personagem) =================
   Pedido do Himalaia: na 1ª pessoa, o braço era uma caixa cor de pele em volta do cabo do que estava na mão. Agora é o
   antebraço e a mão do corpo do MakeHuman (CC0), com a mão fechada em volta do cabo (tools/braco_fp.py → 21l_braco_dados.js).
   · A mão pega cada coisa do jeito da mão do boneco na 3ª pessoa: os modelos estão no espaço da mão (cabo ao longo de +z,
     lâmina, cano ou ponta para -y), então o polegar vai para +z, o antebraço reto para +y e a palma olha para +x. 13/11: antes a
     mão da pistola fechava em volta do cano (ficava de frente para a câmera, sem segurar nada); depois girava em volta do cabo
     atrás do cotovelo e mostrava a palma. A lanterna é segura pelo corpo (eixo y), com o antebraço indo para o cotovelo.
   · O pulso dobra (para o lado do mindinho ou do polegar, e para a frente ou para trás) para o antebraço ir na direção do
     cotovelo, atrás, embaixo e à direita da câmera, até um limite. A dobra é refeita só quando muda (passos de 0,05 rad).
   · A mão vai na escala do item (as ferramentas são desenhadas a 85%), para o cabo caber na mão.
   · No tom de pele do personagem; a manga da peça do tronco (longa ou dobrada) e a luva de couro são pintadas na própria pele
     (a máscara diz onde é a mão e onde fica cada ponto do pulso ao cotovelo). A luva de falcoaria é a luva de couro na mão.
   · Sem os dados, fica o braço de antes. */
const BRF={m:null,geo:null,img:null,mk:null,tex:{},dyn:null,chave:'',falhou:false};
/* como a mão pega cada coisa (no espaço do item): x = eixo do cabo, do indicador para o mindinho; y = o antebraço com o pulso
   reto (null: vai para o cotovelo, girando em volta do cabo) */
const BRF_PADRAO={x:[0,0,-1],y:[0,1,0]},BRF_CABO={lanterna:{x:[0,1,0],y:null}};
const BRF_COTOVELO=[0.45,-0.38,0];   // onde fica o cotovelo, na câmera
const BRF_DESVIO=[-0.35,0.7],BRF_FLEXAO=[-0.9,0.9];   // quanto o pulso dobra (rad): - polegar/+ mindinho; - costas/+ palma da mão
const BRF_SEM_ITEM={luvaFalcoaria:true};   // a luva de falcoaria é a própria mão de luva (o modelo de caixinha da luva sai)
function brfSemItem(id){return!!(id&&BRF_SEM_ITEM[id]&&brfMalha());}
function brfMalha(){if(BRF.m||BRF.falhou)return BRF.m;if(typeof BRACO3D==='undefined'||!BRACO3D.direito){BRF.falhou=true;return null;}
  try{const d=BRACO3D.direito,g=mod3dDecodificar(d);BRF.geo=g;BRF.m=texMesh(g.f,g.uv,texModelo('braco_pele',d.t,false));BRF.base=BRF.m.tex;
    /* a imagem da pele e a máscara, para pintar manga e luva */
    const a=new Image();a.onload=()=>{BRF.img=a;};a.src=d.t;const b=new Image();b.onload=()=>{BRF.mk=b;};b.src=d.m;}
  catch(e){console.error('braço 1ª pessoa',e);BRF.falhou=true;BRF.m=null;}
  return BRF.m;}
/* o pulso dobrado: o antebraço gira em volta do pulso (o centro dele, tirado da malha), a dobra espalhada em 5 cm para não vincar.
   a: em volta da normal da palma (+ = para o +x da malha: o mindinho na direita, o polegar na esquerda); f: em volta do eixo do
   cabo (+ = para o lado da palma). Uma malha por mão (L: BRF é a direita, BRF.E a esquerda), refeita quando a dobra muda */
function brfPrepDobra(L){const f=L.geo.f,n=f.length/11;let px=0,pz=0,c=0;
  for(let i=0;i<n;i++)if(Math.abs(f[i*11+1]-0.112)<0.006){px+=f[i*11];pz+=f[i*11+2];c++;}
  const piv=[c?px/c:0,0.112,c?pz/c:0],ix=[],w=[];
  for(let i=0;i<n;i++){let t=(f[i*11+1]-piv[1]+0.01)/0.05;if(t<=0)continue;t=t>=1?1:t*t*(3-2*t);ix.push(i);w.push(t);}
  L.piv=piv;L.ix=Int32Array.from(ix);L.w=Float32Array.from(w);L.buf=new Float32Array(f);
  L.dyn=texMesh(L.buf,L.geo.uv,BRF.base);gl.bindBuffer(gl.ARRAY_BUFFER,L.dyn.buf);gl.bufferData(gl.ARRAY_BUFFER,L.buf,gl.DYNAMIC_DRAW);L.chave='0_0';}
function brfDobrar(L,a,fl){if(!L.geo)return L.m;
  try{if(!L.dyn)brfPrepDobra(L);const k=a+'_'+fl;if(k===L.chave)return L.dyn;L.chave=k;
    const F0=L.geo.f,B=L.buf,P0=L.piv,ix=L.ix,W=L.w;
    for(let j=0;j<ix.length;j++){const o=ix[j]*11,t=W[j],ca=Math.cos(a*t),sa=Math.sin(a*t),cf=Math.cos(fl*t),sf=Math.sin(fl*t);
      const x=F0[o]-P0[0],y=F0[o+1]-P0[1],z=F0[o+2]-P0[2],y1=y*cf-z*sf;B[o]=P0[0]+x*ca+y1*sa;B[o+1]=P0[1]-x*sa+y1*ca;B[o+2]=P0[2]+y*sf+z*cf;
      const nx=F0[o+8],ny=F0[o+9],nz=F0[o+10],n1=ny*cf-nz*sf;B[o+8]=nx*ca+n1*sa;B[o+9]=-nx*sa+n1*ca;B[o+10]=ny*sf+nz*cf;}
    gl.bindBuffer(gl.ARRAY_BUFFER,L.dyn.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,B);return L.dyn;}
  catch(e){console.error('braço: dobra',e);L.geo=null;return L.m;}}
/* a mão esquerda (14/11): a direita espelhada (x -> -x, cada triângulo virado). Nela o polegar fica no +x da malha. Segura o
   arco pela empunhadura e a frente da espingarda, do rifle e da besta; o antebraço vai para o cotovelo esquerdo */
function brfEsq(){if(BRF.E!==undefined)return BRF.E;BRF.E=null;if(!brfMalha()||!BRF.geo)return null;
  try{const f0=BRF.geo.f,u0=BRF.geo.uv,nt=f0.length/33,f=new Float32Array(f0.length),uv=new Float32Array(u0.length);
    for(let t=0;t<nt;t++)for(let k=0;k<3;k++){const de=t*3+k,pa=t*3+(k?3-k:0),a=de*11,b=pa*11;   // vértices 0,1,2 -> 0,2,1
      for(let j=0;j<11;j++)f[b+j]=f0[a+j];f[b]=-f0[a];f[b+8]=-f0[a+8];uv[pa*2]=u0[de*2];uv[pa*2+1]=u0[de*2+1];}
    BRF.E={geo:{f,uv},m:texMesh(f,uv,BRF.base),dyn:null,chave:''};}
  catch(e){console.error('mão esquerda',e);BRF.E=null;}
  return BRF.E;}
const BRF_COTOVELO_E=[-0.45,-0.38,0];   // o cotovelo esquerdo, na câmera
/* frente das armas longas, no espaço do item (onde a mão esquerda fecha; o cano vai para -y) */
const BRF_FRENTE={espingarda:[0,-0.42,0.066],rifle:[0,-0.36,0.055],besta:[0,-0.26,0.07]};
const _BRF_ME=M4();
/* desenha a mão esquerda fechada num cabo: o = centro da mão (câmera), T = para onde vai o polegar ao longo do cabo */
function bracoEsqFP(Pg,CW,o,T,ks){const L=brfEsq();if(!L)return;ks=ks||1;
  const X=norm(T),F=norm([BRF_COTOVELO_E[0]-o[0],BRF_COTOVELO_E[1]-o[1],BRF_COTOVELO_E[2]-o[2]]),fx=F[0]*X[0]+F[1]*X[1]+F[2]*X[2];
  const Y=norm([F[0]-fx*X[0]-0.12*(1-X[0]*X[0]),F[1]-fx*X[1]+0.12*X[0]*X[1],F[2]-fx*X[2]+0.12*X[0]*X[2]]);   // gira em volta do cabo para o cotovelo (um pouco de "para a esquerda" segura)
  const Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]];   // na esquerda: palma = polegar × antebraço
  const fy=Math.max(1e-6,F[0]*Y[0]+F[1]*Y[1]+F[2]*Y[2]),fz=F[0]*Z[0]+F[1]*Z[1]+F[2]*Z[2],q=v=>Math.round(v*20)/20;
  const da=q(clamp(Math.atan2(fx,fy),-BRF_DESVIO[1],-BRF_DESVIO[0])),df=q(clamp(Math.atan2(fz,fy),BRF_FLEXAO[0],BRF_FLEXAO[1]));
  const M=_BRF_ME;M[0]=X[0]*ks;M[1]=X[1]*ks;M[2]=X[2]*ks;M[3]=0;M[4]=Y[0]*ks;M[5]=Y[1]*ks;M[6]=Y[2]*ks;M[7]=0;M[8]=Z[0]*ks;M[9]=Z[1]*ks;M[10]=Z[2]*ks;M[11]=0;M[12]=o[0];M[13]=o[1];M[14]=o[2];M[15]=1;
  mul(TMP2,CW,M);
  const tr=P.roupa&&P.roupa.tronco,mg=tr&&typeof MANGAS_FP!=='undefined'?MANGAS_FP[tr]:null,lv=!!(P.roupa&&P.roupa.maos==='luvasCouro');
  const m=brfDobrar(L,da,df);m.tex=brfTextura(mg,lv);const t=brfTom();if(Pg.u.uTint)gl.uniform3f(Pg.u.uTint,t[0],t[1],t[2]);
  drawStat(Pg,m,TMP2);if(Pg.u.uTint)gl.uniform3f(Pg.u.uTint,1,1,1);}
/* textura com manga e luva pintadas (feita uma vez por combinação) */
function brfTextura(manga,luva){const k=(manga?manga.t+manga.cor+'_'+manga.punho:'')+'|'+(luva?1:0);if(k==='|')return BRF.base;
  if(BRF.tex[k])return BRF.tex[k];if(!BRF.img||!BRF.mk)return BRF.base;
  try{const w=BRF.img.width,h=BRF.img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.drawImage(BRF.img,0,0);
    const px=cx.getImageData(0,0,w,h),mc=document.createElement('canvas');mc.width=w;mc.height=h;const mx=mc.getContext('2d');mx.drawImage(BRF.mk,0,0,w,h);const mk=mx.getImageData(0,0,w,h).data,D=px.data;
    const rgb=c=>[(c>>16)&255,(c>>8)&255,c&255],cou=rgb(0x5a3e28),cm=manga?rgb(manga.cor):null,cp=manga?rgb(manga.punho):null,c0=manga?(manga.t==='longa'?0.05:0.6):9,c1=c0+0.09;
    for(let i=0;i<D.length;i+=4){const mao=mk[i]/255,pos=mk[i+1]/255,l=(D[i]*0.3+D[i+1]*0.59+D[i+2]*0.11)/180,sh=0.55+0.55*Math.min(1.2,l);let c=null;
      if(luva&&mao>0.5)c=cou;else if(manga&&mao<0.5&&pos>c0)c=pos<c1?cp:cm;
      if(c){D[i]=Math.min(255,c[0]*sh);D[i+1]=Math.min(255,c[1]*sh);D[i+2]=Math.min(255,c[2]*sh);}}
    cx.putImageData(px,0,0);BRF.tex[k]=texModelo('braco_'+k,cv.toDataURL('image/png'),false);}catch(e){console.error('braço: manga',e);BRF.tex[k]=BRF.base;}
  return BRF.tex[k];}
/* tom de pele: a média da textura é levada para a cor de pele do personagem */
function brfTom(){if(P.ch&&P.ch.surv)return BRF_TOM_SURV;const J=MESH.jogador,c=J&&J.spec&&J.spec.c?J.spec.c.skin:0xd8b09a;
  if(BRF.tomC===c)return BRF.tom;BRF.tomC=c;const L=lin(c),Lr=lin(0xd8b09a);   // 0xd8b09a: a média da pele do MakeHuman na mão
  BRF.tom=[0,1,2].map(i=>clamp(Math.sqrt(L[i]/Lr[i]),0.6,1.1));return BRF.tom;}
const BRF_TOM_SURV=[0.9,0.82,0.76];   // o sobrevivente é um pouco mais queimado de sol que a pele do MakeHuman
const _BRF_M=M4();
function bracoFPDesenhar(Pg,CW,T,id){const m0=brfMalha();
  if(!m0){const ad=norm([0.32,-0.55,0.77]);mul(TMP2,CW,alignY(T[12],T[13],T[14],ad[0],ad[1],ad[2]));drawStat(Pg,bracoFPMesh(),TMP2);return;}   // sem os dados: o braço de antes
  if(id==='arco')return;   // o arco tem desenho próprio: a mão esquerda na empunhadura sai de desenharArco1P (a direita, na corda, fica junto do rosto)
  /* X: o eixo do cabo na câmera (sem a escala do item); Y: o antebraço com o pulso reto */
  const C=BRF_CABO[id]||BRF_PADRAO,e=C.x,ks=Math.hypot(T[0],T[1],T[2])||1,eixo=v=>norm([T[0]*v[0]+T[4]*v[1]+T[8]*v[2],T[1]*v[0]+T[5]*v[1]+T[9]*v[2],T[2]*v[0]+T[6]*v[1]+T[10]*v[2]]);
  const X=eixo(e),F=norm([BRF_COTOVELO[0]-T[12],BRF_COTOVELO[1]-T[13],BRF_COTOVELO[2]-T[14]]);let Y;
  if(C.y){const v=eixo(C.y),d=v[0]*X[0]+v[1]*X[1]+v[2]*X[2];Y=norm([v[0]-d*X[0],v[1]-d*X[1],v[2]-d*X[2]]);}
  else{const fx=F[0]*X[0]+F[1]*X[1]+F[2]*X[2];Y=norm([F[0]-fx*X[0]+0.12*(1-X[0]*X[0]),F[1]-fx*X[1]-0.12*X[0]*X[1],F[2]-fx*X[2]-0.12*X[0]*X[2]]);}   // gira em volta do cabo, para o cotovelo
  const Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]],M=_BRF_M;
  /* o pulso dobra o que falta para o antebraço ir para o cotovelo */
  const fx=F[0]*X[0]+F[1]*X[1]+F[2]*X[2],fy=Math.max(1e-6,F[0]*Y[0]+F[1]*Y[1]+F[2]*Y[2]),fz=F[0]*Z[0]+F[1]*Z[1]+F[2]*Z[2];
  const q=v=>Math.round(v*20)/20,da=q(clamp(Math.atan2(fx,fy),BRF_DESVIO[0],BRF_DESVIO[1])),df=q(clamp(Math.atan2(fz,fy),BRF_FLEXAO[0],BRF_FLEXAO[1]));
  M[0]=X[0]*ks;M[1]=X[1]*ks;M[2]=X[2]*ks;M[3]=0;M[4]=Y[0]*ks;M[5]=Y[1]*ks;M[6]=Y[2]*ks;M[7]=0;M[8]=Z[0]*ks;M[9]=Z[1]*ks;M[10]=Z[2]*ks;M[11]=0;M[12]=T[12];M[13]=T[13];M[14]=T[14];M[15]=1;
  mul(TMP2,CW,M);
  /* manga e luva do que está vestido */
  const tr=P.roupa&&P.roupa.tronco,mg=tr&&typeof MANGAS_FP!=='undefined'?MANGAS_FP[tr]:null,lv=!!(P.roupa&&P.roupa.maos==='luvasCouro')||id==='luvaFalcoaria';
  const m=brfDobrar(BRF,da,df);m.tex=brfTextura(mg,lv);const t=brfTom();if(Pg.u.uTint)gl.uniform3f(Pg.u.uTint,t[0],t[1],t[2]);
  drawStat(Pg,m,TMP2);if(Pg.u.uTint)gl.uniform3f(Pg.u.uTint,1,1,1);
  /* armas longas: a mão esquerda na frente, com o polegar para o cano */
  const fr=BRF_FRENTE[id];if(fr)bracoEsqFP(Pg,CW,[T[0]*fr[0]+T[4]*fr[1]+T[8]*fr[2]+T[12],T[1]*fr[0]+T[5]*fr[1]+T[9]*fr[2]+T[13],T[2]*fr[0]+T[6]*fr[1]+T[10]*fr[2]+T[14]],[-T[4],-T[5],-T[6]],ks);}
/* a faca de caça não tinha modelo na mão (só o punho fechado aparecia): usa o da faca */
etapaMalha('fim','lugares',1,()=>{if(MESH.arma&&!MESH.arma.facaCaca&&MESH.arma.faca)MESH.arma.facaCaca=MESH.arma.faca;});

/* ================= aparência do sobrevivente (criação de personagem) =================
   O corpo do jogador é o boneco de partes do jogo (cabeça, tronco, braços, pernas), animado pelo mesmo esqueleto e
   pelas mesmas animações de antes. Cada escolha da criação muda a malha 3D de verdade: formato do rosto, tom de pele,
   olhos, sobrancelhas, nariz, boca, barba, cabelo e cor, altura e porte. As roupas do jogador são montadas para o corpo
   dele (servem em qualquer porte). Todo mundo começa só de bermuda, descalço e sem nada na mochila. */
const APAR={
  rostos:[{n:'Oval'},{n:'Quadrado',w:1.03,f:[[0,0.3,0.02],[0.07,0.61,0.018],[0.17,0.82,0.012],[0.3,0.93,0.006],[0.45,0.985,0],[0.6,1.0,-0.004],[0.74,0.97,-0.008],[0.85,0.86,-0.008],[0.93,0.66,-0.006],[0.98,0.38,-0.003],[1,0,0]]},
    {n:'Redondo',w:1.06,h:0.96,f:[[0,0.3,0.02],[0.07,0.62,0.018],[0.17,0.83,0.012],[0.3,0.95,0.006],[0.45,1.0,0],[0.6,1.0,-0.004],[0.74,0.96,-0.008],[0.85,0.85,-0.008],[0.93,0.66,-0.006],[0.98,0.38,-0.003],[1,0,0]]},
    {n:'Alongado',w:0.965,h:1.08},{n:'Fino',w:0.97,f:[[0,0.15,0.022],[0.07,0.42,0.02],[0.17,0.66,0.013],[0.3,0.86,0.006],[0.45,0.97,0],[0.6,1.0,-0.004],[0.74,0.97,-0.008],[0.85,0.86,-0.008],[0.93,0.66,-0.006],[0.98,0.38,-0.003],[1,0,0]]}],
  peles:[0xecc9a5,0xdcae86,0xc68c60,0xa8714a,0x875737,0x5c3a24],
  olhos:[0x3a2616,0x5a3a1e,0x7a6230,0x4a6a3a,0x6a7682,0x3a5a8a],
  olhosNome:['Castanho escuro','Castanho','Mel','Verde','Cinza','Azul'],
  sobrancelhas:[{n:'Média',w:0.05,h:0.012,a:0.12,dy:0.1},{n:'Fina',w:0.048,h:0.0085,a:0.06,dy:0.1},{n:'Grossa',w:0.054,h:0.017,a:0.1,dy:0.1},{n:'Arqueada',w:0.05,h:0.011,a:0.27,dy:0.11},
    {n:'Fina arqueada',w:0.046,h:0.008,a:0.22,dy:0.11},{n:'Grossa reta',w:0.056,h:0.018,a:0.02,dy:0.095}],
  narizes:[{n:'Médio',w:0.034,h:0.06,d:0.042},{n:'Fino',w:0.027,h:0.058,d:0.04},{n:'Largo',w:0.043,h:0.058,d:0.045},{n:'Curto',w:0.033,h:0.047,d:0.035},{n:'Comprido',w:0.034,h:0.07,d:0.049}],
  bocas:[{n:'Média',w:0.026,h:0.0075},{n:'Fina',w:0.025,h:0.0048},{n:'Larga',w:0.032,h:0.008},{n:'Cheia',w:0.027,h:0.0115},{n:'Pequena',w:0.02,h:0.007}],
  barbas:['Sem barba','Por fazer','Cavanhaque','Curta','Cheia'],
  cabelos:['Curto bagunçado','Raspado','Médio','Comprido','Careca','Rabo de cavalo'],
  coresCabelo:[0x161210,0x2b1d14,0x4a3020,0x7a5a3a,0xc8a060,0x8a3a1e,0x8a8580],
  coresCabeloNome:['Preto','Castanho escuro','Castanho','Castanho claro','Loiro','Ruivo','Grisalho'],
  alturas:[0.94,0.97,1.0,1.03,1.06],alturasNome:['1,68 m','1,73 m','1,78 m','1,83 m','1,89 m'],
  portes:[{n:'Magro',ombro:0.035,m:{chestW:0.44,waistW:0.36,depth:0.24,hipW:0.37,armW:0.118,legW:0.152}},{n:'Médio',ombro:0.05,m:{chestW:0.48,waistW:0.395,depth:0.26,hipW:0.39,armW:0.132,legW:0.168}},
    {n:'Forte',ombro:0.07,m:{chestW:0.54,waistW:0.43,depth:0.29,hipW:0.42,armW:0.152,legW:0.186}}]};
/* aparência padrão (a da foto): rosto quadrado, pele clara bronzeada, olhos castanho-escuros, sobrancelha grossa, cabelo curto
   bagunçado castanho-escuro e barba por fazer */
const APAR_PADRAO={nome:'',rosto:1,pele:1,olhos:0,sobr:2,nariz:0,boca:0,barba:1,cabelo:0,corCab:1,altura:2,porte:1};
const APAR_CAMPOS={rosto:'rostos',pele:'peles',olhos:'olhos',sobr:'sobrancelhas',nariz:'narizes',boca:'bocas',barba:'barbas',cabelo:'cabelos',corCab:'coresCabelo',altura:'alturas',porte:'portes'};
function aparLimpa(ap){const o=Object.assign({},APAR_PADRAO);if(ap&&typeof ap==='object'){for(const k in APAR_CAMPOS){const v=ap[k],n=APAR[APAR_CAMPOS[k]].length;if(Number.isInteger(v)&&v>=0&&v<n)o[k]=v;}
    if(typeof ap.nome==='string')o.nome=ap.nome.replace(/[<>]/g,'').trim().slice(0,24);}return o;}
function aparAleatoria(){const o={nome:''};for(const k in APAR_CAMPOS)o[k]=Math.floor(Math.random()*APAR[APAR_CAMPOS[k]].length);
  if(Math.random()<0.5)o.altura=1+Math.floor(Math.random()*3);return o;}
const hexMix=(a,b,t)=>{const ca=[(a>>16)&255,(a>>8)&255,a&255],cb=[(b>>16)&255,(b>>8)&255,b&255];return ca.map((v,i)=>Math.round(lerp(v,cb[i],t))).reduce((s,v)=>s*256+v,0);};
/* medidas do corpo: comprimentos de osso iguais aos do esqueleto animado; larguras pelo porte; cabeça pelo formato do rosto.
   Por baixo de tudo o corpo do jogador usa uma cueca escura (nunca fica sem roupa de baixo); a bermuda é uma peça de verdade. */
function specJogador(ap,chapeu){ap=aparLimpa(ap);const P=survivorSpec(),A=APAR,po=A.portes[ap.porte],ro=A.rostos[ap.rosto],pele=A.peles[ap.pele],cab=A.coresCabelo[ap.corCab];
  Object.assign(P,{thigh:0.41,shin:0.43,foot:0.1,uArm:0.26,lArm:0.26,torsoH:0.45,hipX:0.087},po.m);P.shX=0.149+po.ombro;
  P.headW=0.255*(ro.w||1);P.headH=0.285*(ro.h||1);P.headD=0.27*(ro.d||1);P.fCab=ro.f||null;
  for(const k in P.c)if(P.c[k]===0xc68c60)P.c[k]=pele;P.c.skin=pele;P.c.pants=0x26282c;P.cueca=0x55585f;
  P.eye=lin(A.olhos[ap.olhos]);P.cabelo=cab;P.barba=cab;P.brow=lin(hexMix(cab,0x000000,0.15));P.labio=lin(hexMix(pele,0x9a4a3a,0.55));
  P.cabeloEst=ap.cabelo;P.barbaEst=ap.barba;P.sobr=A.sobrancelhas[ap.sobr];P.nariz=A.narizes[ap.nariz];P.boca=A.bocas[ap.boca];P.semLanterna=true;P.chapeu=!!chapeu;P.seg=1.5;P.palpebras=true;P.rnd=rng(77);return P;}
/* peças de cabeça que escondem o topo do cabelo (o corpo troca para a versão "de chapéu" e o cabelo não fura a peça) */
const CHAPEUS={bone:1,gorroPele:1};
/* troca a malha do jogador pela da aparência escolhida; as roupas dele e a versão de chapéu são montadas quando aparecem */
function aplicarAparencia(ap){ap=aparLimpa(ap);const sp=specJogador(ap);
  const J=MESH.jogador;if(J&&typeof liberarMesh==='function'){liberarMesh(J.mesh);if(J.meshChapeu)liberarMesh(J.meshChapeu);for(const k in J.bracos||{})liberarMesh(J.bracos[k]);}
  MESH.jogador={mesh:litMesh(buildHuman(sp,survivorExtras)),meshChapeu:null,bones:bonesOf(sp),sk:SKT.akai,spec:sp,ap,bracos:{}};
  const velhas=MESH.roupaJ;MESH.roupaJ={};if(velhas&&typeof liberarMesh==='function')for(const k in velhas)liberarMesh(velhas[k]);
  if(!P.ch)P.ch=newChar(MESH.jogador,1);P.ch.mesh=MESH.jogador.mesh;P.ch.bones=MESH.jogador.bones;P.ch.proc=true;P.ch.procOmbro=APAR.portes[ap.porte].ombro;P.ch.s=APAR.alturas[ap.altura];
  return ap;}
/* malha das roupas do jogador (a do corpo dele), montada na primeira vez que a peça aparece */
function roupaMeshJ(id){const J=MESH.jogador;if(!J||!ITEMS[id])return MESH.roupa&&MESH.roupa[id];let m=MESH.roupaJ[id];
  if(!m){try{m=MESH.roupaJ[id]=litMesh(roupaGeometry(J.spec,id));}catch(e){console.error('roupa',id,e);m=MESH.roupaJ[id]=MESH.roupa[id];}}return m;}
/* corpo certo para o que está na cabeça (chamado a cada quadro antes de desenhar) */
function jogadorMalha(){const J=MESH.jogador;if(!J||!P.ch||!P.ch.proc)return;const cab=P.roupa&&P.roupa.cabeca;
  if(cab&&CHAPEUS[cab]){if(!J.meshChapeu)J.meshChapeu=litMesh(buildHuman(specJogador(J.ap,true),survivorExtras));P.ch.mesh=J.meshChapeu;}else P.ch.mesh=J.mesh;}
/* braço da primeira pessoa: pele do sobrevivente, manga da peça do tronco e luva quando houver */
const MANGAS_FP={camisaLeve:{t:'dobrada',cor:0x2f3742,punho:0x262c35},casacoPele:{t:'longa',cor:0x7a5638,punho:0xd6c29c},casacoGrande:{t:'longa',cor:0x6c4b2f,punho:0x4a3220}};
function bracoFPMesh(){const J=MESH.jogador;if(!J)return MESH.arma.braco;const tr=P.roupa&&P.roupa.tronco,mg=tr&&MANGAS_FP[tr]?tr:'',lv=P.roupa&&P.roupa.maos==='luvasCouro',k=mg+'|'+(lv?1:0);
  let m=J.bracos[k];if(!m){const g=new GB(512,8),pl=lin(J.spec.c.skin),M=MANGAS_FP[mg];
    if(lv){add(g,bevelTris(0.095,0.11,0.084,0.022),mat(0,0,0),lin(0x5a3e28));add(g,bevelTris(0.1,0.05,0.092,0.012),mat(0,0.075,0),lin(0x46301e));}
    else add(g,bevelTris(0.085,0.1,0.074,0.02),mat(0,0,0),pl);
    add(g,bevelTris(0.084,0.4,0.082,0.022,{tx:1.14,tz:1.14}),mat(0,0.25,0),pl);
    if(M&&M.t==='longa'){add(g,bevelTris(0.108,0.34,0.106,0.02,{tx:1.08,tz:1.08}),mat(0,0.28,0),lin(M.cor));add(g,bevelTris(0.118,0.06,0.116,0.016),mat(0,0.11,0),lin(M.punho));}
    if(M&&M.t==='dobrada'){add(g,bevelTris(0.11,0.12,0.108,0.02),mat(0,0.41,0),lin(M.cor));add(g,bevelTris(0.122,0.065,0.12,0.02),mat(0,0.35,0),lin(M.punho));}
    m=J.bracos[k]=litMesh(g.data());}
  return m;}
/* ---------- roupas achadas no mundo, montadas no corpo de partes (o do jogador e o dos sobreviventes) ---------- */
function roupaGeoNova(put,P,id,M){const ra=M.braco.R,rl=M.coxa.R,T=P.torsoH,PV=M.pelve,TR=M.tronco,FC=P.fCab||F_CABECA,H=M.cabeca;
  const cintura=(dr,y0,y1,col)=>put(0,latheTris([[PV.R*0.95,y0],[PV.R*0.96,y1]],14,1,PV.sz,{dr}),ID,col);
  const noTronco=(t,dr)=>{const p=perfil(formaDe(M,F_TRONCO),t,t,TR.R,TR.y0,TR.h)[0];return{y:p[1],z:(p[0]+dr)*TR.sz+p[2],r:p[0]+dr};};
  const naCanela=(t,dr)=>{const p=perfil(formaDe(M,F_CANELA),t,t,M.canela.R,M.canela.y0,M.canela.h)[0];return{y:M.canela.y0+M.canela.h-(p[1]-M.canela.y0),z:(p[0]+dr)*M.canela.sz+p[2]};};
  const mangas=(dr,t1,cor,ant,punho)=>{for(const s of[1,-1]){const b=s>0?3:5,l=s>0?4:6;put(b,ellipTris(ra*1.12+dr,ra*1.25+dr*0.9,ra*1.06+dr,12,8),mat(-s*0.008,-0.01,0),cor);
      put(b,parteCorpo(M,F_BRACO,'braco',0,t1,dr,12),ID,cor);if(ant){put(l,ellipTris(ra*0.77+dr,ra*0.84+dr*0.9,ra*0.74+dr,10,6),ID,cor);put(l,parteCorpo(M,F_ANTEB,'antebraco',0,ant,dr*0.95,12),ID,cor);}
      if(punho)punho(b,l);}};
  if(id==='bermuda'){const co=lin(0x3d434c),es=lin(0x2e333a),fr=lin(0xaab0b6),cd=lin(0xd9d5cc);
    put(0,parteCorpo(M,F_PELVE,'pelve',0,1,0.013,14,{capB:true}),ID,co);cintura(0.02,0.05,0.09,es);
    const fz=(PV.R*0.955+0.02)*PV.sz+0.004;for(const s of[1,-1])put(0,boxTris(0.006,0.07,0.006),mat(s*0.013,0.022,fz,0.1,0,s*0.16),cd,0);
    for(const s of[1,-1]){const u=s>0?7:9;put(u,parteCorpo(M,F_COXA,'coxa',0,0.5,0.014,12),ID,co);put(u,parteCorpo(M,F_COXA,'coxa',0.45,0.52,0.019,12),ID,es);
      put(u,parteCorpo(M,F_COXA,'coxa',0.3,0.47,0.0175,2,{a0:s*Math.PI/2-0.06,a1:s*Math.PI/2+0.06}),ID,fr);}}
  if(id==='calcaCargo'){const co=lin(0x353a31),es=lin(0x272b25),bo=lin(0x2e3229);
    put(0,parteCorpo(M,F_PELVE,'pelve',0,1,0.013,14,{capB:true}),ID,co);cintura(0.02,0.05,0.09,lin(0x23211d));
    for(const s of[1,-1]){const u=s>0?7:9,l=s>0?8:10,rx=rl*0.94+0.015;
      put(u,parteCorpo(M,F_COXA,'coxa',0,1,0.015,12),ID,co);
      put(u,bevelTris(0.03,0.13,0.11,0.01),mat(s*(rx+0.013),-0.19,0.004),bo);put(u,bevelTris(0.034,0.035,0.116,0.008),mat(s*(rx+0.017),-0.115,0.004),es);
      put(l,ellipTris(rl*0.75+0.016,rl*0.82+0.014,rl*0.76+0.016,10,6),ID,co);
      put(l,parteCorpo(M,F_CANELA,'canela',0,0.93,0.014,12),ID,co);put(l,parteCorpo(M,F_CANELA,'canela',0.86,0.95,0.019,12),ID,es);}}
  if(id==='camiseta'){const co=lin(0xcdc1a4),go=lin(0xb1a588);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.965,0.011,18),ID,co);for(const[t,m]of ombrosTris(P,0.011))put(1,t,m,co);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.935,0.99,0.014,16),ID,go);
    put(0,parteCorpo(M,F_PELVE,'pelve',0.55,1,0.026,14),ID,co);put(0,parteCorpo(M,F_PELVE,'pelve',0.55,0.61,0.029,14),ID,go);
    mangas(0.011,0.42,co,0,(b)=>put(b,parteCorpo(M,F_BRACO,'braco',0.36,0.44,0.0145,12),ID,go));}
  if(id==='camisaLeve'){const co=lin(0x2f3742),go=lin(0x252b34),bt=lin(0x9a9488);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.955,0.02,18),ID,co);for(const[t,m]of ombrosTris(P,0.02))put(1,t,m,co);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.9,1,0.032,16,{a0:0.55,a1:Math.PI*2-0.55}),ID,go);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.02,0.9,0.024,3,{a0:-0.035,a1:0.035}),ID,go);
    for(let i=0;i<4;i++){const q=noTronco(0.16+i*0.18,0.026);put(1,ellipTris(0.007,0.007,0.004,6,4),mat(0,q.y,q.z),bt,0);}
    put(0,parteCorpo(M,F_PELVE,'pelve',0.5,1,0.032,14),ID,co);
    mangas(0.017,1,co,0.36,(b,l)=>put(l,parteCorpo(M,F_ANTEB,'antebraco',0.26,0.42,0.027,12),ID,go));}
  if(id==='colete'){const co=lin(0x272b30),es=lin(0x1b1e22),bo=lin(0x30353b),pl=lin(0xc9ccc8);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.08,0.86,0.04,18),ID,co);put(1,parteCorpo(M,F_TRONCO,'tronco',0.05,0.11,0.046,16),ID,es);
    for(const s of[1,-1])put(1,bevelTris(0.075,0.03,0.29,0.01),mat(s*0.11,T-0.012,-0.006,0,0,-s*0.32),co);
    const q=noTronco(0.42,0.04);for(const x of[-0.09,0,0.09])put(1,bevelTris(0.075,0.1,0.04,0.012),mat(x,q.y,q.z+0.012),bo);
    const q2=noTronco(0.7,0.04);put(1,bevelTris(0.16,0.045,0.012,0.004),mat(0,q2.y,q2.z+0.002),pl,0);
    const qb=noTronco(0.5,0.04);put(1,bevelTris(0.24,0.26,0.03,0.012),mat(0,qb.y,-qb.z),bo);}
  if(id==='casacoGrande'){const co=lin(0x6c4b2f),es=lin(0x4a3220),bt=lin(0x2a1d14);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.95,0.032,18),ID,co);for(const[t,m]of ombrosTris(P,0.032))put(1,t,m,co);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.84,1,0.056,16,{a0:0.4,a1:Math.PI*2-0.4}),ID,es);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.02,0.84,0.037,3,{a0:0.03,a1:0.1}),ID,es);
    for(let i=0;i<4;i++){const q=noTronco(0.12+i*0.2,0.04);put(1,latheTris([[0.011,-0.006],[0.011,0.006]],8,1,1,{capB:true,capT:true}),mat(0.05,q.y,q.z-0.012,Math.PI/2,0,0),bt,0);}
    put(0,parteCorpo(M,F_PELVE,'pelve',0.2,1,0.046,14),ID,co);
    put(0,latheTris([[PV.R*1.05+0.07,-0.34],[PV.R*1.0+0.055,-0.2],[PV.R*0.98+0.046,-0.11]],14,1,PV.sz*1.12,{a0:0.55,a1:Math.PI*2-0.55}),ID,co);
    mangas(0.028,1,co,0.86,(b,l)=>put(l,parteCorpo(M,F_ANTEB,'antebraco',0.76,0.9,0.036,12),ID,es));}
  if(id==='botasTrilha'){const co=lin(0x6b4a2e),es=lin(0x4a3220),so=lin(0x2a2018),la=lin(0xc9b48a);
    for(const s of[1,-1]){const l=s>0?8:10,fy=-P.shin-P.foot/2;
      put(l,parteCorpo(M,F_CANELA,'canela',0.72,1,0.02,12),ID,co);put(l,parteCorpo(M,F_CANELA,'canela',0.7,0.76,0.027,12),ID,es);
      put(l,bevelTris(P.legW*0.98,P.foot+0.034,P.legW*1.76,0.036,{tz:0.88,tx:0.92}),mat(0,fy+0.012,0.056),co);
      put(l,bevelTris(P.legW*0.86,0.05,P.legW*0.42,0.02),mat(0,fy-0.004,0.056+P.legW*0.66),es);
      put(l,bevelTris(P.legW*1.04,0.034,P.legW*1.84,0.012),mat(0,-P.shin-P.foot+0.008,0.056),so);
      for(let i=0;i<4;i++){const q=naCanela(0.76+i*0.06,0.022);put(l,boxTris(0.044,0.006,0.008),mat(0,q.y,q.z),la,0);}}}
  if(id==='cinto'||id==='cinturaoExploracao'){const ex=id==='cinturaoExploracao',co=lin(ex?0x8a6a3a:0x4a3020),me=lin(0xb9a06a),bo=lin(ex?0x6a5030:0x3a2a1c),dr=ex?0.034:0.03,R0=PV.R*0.955+dr;
    cintura(dr,ex?0.035:0.045,ex?0.095:0.085,co);put(0,bevelTris(0.05,0.042,0.012,0.004),mat(0,0.065,R0*PV.sz+0.005),me,0);
    const bolsa=(a,w,h,d,y)=>put(0,bevelTris(w,h,d,0.01),mat(Math.sin(a)*(R0+d/2),y,Math.cos(a)*(R0*PV.sz+d/2),0,a,0),bo);
    bolsa(-Math.PI/2,0.06,0.075,0.04,0.035);
    if(ex){bolsa(Math.PI/2,0.065,0.08,0.045,0.035);bolsa(Math.PI*0.27,0.055,0.07,0.04,0.04);bolsa(-Math.PI*0.78,0.06,0.075,0.04,0.04);
      put(0,bevelTris(0.03,0.2,0.05,0.008),mat(-(R0+0.026),-0.06,-0.035,0,0,0.1),lin(0x3e2a18));put(0,boxTris(0.02,0.08,0.03),mat(-(R0+0.026),0.07,-0.035),lin(0x2a1d14));}}
  if(id==='luvasCouro'){const co=lin(0x5a3e28),es=lin(0x46301e);
    for(const s of[1,-1]){const l=s>0?4:6,hy=-P.lArm-0.05;
      put(l,ellipTris(0.041,0.055,0.024,10,6),mat(0,hy+0.004,0.004),co);put(l,ellipTris(0.038,0.038,0.021,10,6),mat(0,hy-0.05,0.012,0.35,0,0),co);
      put(l,ellipTris(0.016,0.032,0.016,8,5),mat(s*-0.034,hy-0.004,0.02,0.3,0,s*0.55),co);put(l,parteCorpo(M,F_ANTEB,'antebraco',0.84,1,0.013,12),ID,es);}}
  if(id==='bone'){const co=lin(0x3b4a3a),ab=lin(0x2e3a2e),f=frenteCabeca(M,0.66,0,FC);
    put(2,parteCorpo(M,FC,'cabeca',0.6,1,0.02,16,{capT:true}),ID,co);put(2,parteCorpo(M,FC,'cabeca',0.58,0.64,0.024,16),ID,ab);
    put(2,ellipTris(0.1,0.007,0.085,14,4),mat(0,f.y-0.004,f.z+0.05,-0.12,0,0),ab);put(2,ellipTris(0.013,0.007,0.013,6,4),mat(0,H.y0+H.h+0.021,0),ab);}
  if(id==='mascaraGas'){const bo=lin(0x2b2f2a),es=lin(0x1a1c1a),vi=lin(0x6f8288),fi=lin(0x3d4238),ol=frenteCabeca(M,0.53,0.045,FC),bc=frenteCabeca(M,0.22,0,FC);
    put(2,parteCorpo(M,FC,'cabeca',0.1,0.68,0.022,16,{a0:-1.45,a1:1.45}),ID,bo);
    for(const s of[1,-1]){put(2,cylTris(0.031,0.031,0.022,12),mat(s*0.046,ol.y,ol.z+0.03,Math.PI/2,0,0),es);put(2,cylTris(0.025,0.025,0.024,12),mat(s*0.046,ol.y,ol.z+0.033,Math.PI/2,0,0),vi,0);}
    put(2,cylTris(0.036,0.032,0.06,12),mat(0,bc.y-0.012,bc.z+0.05,Math.PI/2-0.45,0,0),fi);put(2,cylTris(0.039,0.039,0.012,12),mat(0,bc.y-0.025,bc.z+0.077,Math.PI/2-0.45,0,0),es);
    put(2,parteCorpo(M,FC,'cabeca',0.5,0.56,0.021,14,{a0:1.35,a1:Math.PI*2-1.35}),ID,es);put(2,parteCorpo(M,FC,'cabeca',0.78,0.84,0.021,14,{a0:1.1,a1:Math.PI*2-1.1}),ID,es);}
  if(id==='bandana'||id==='mascaraPano'){const pano=id==='mascaraPano',co=lin(pano?0x8d8a80:0x7a2a22),es=lin(pano?0x6e6b62:0x5e1f1a),na=frenteCabeca(M,0.4,0,FC);
    put(2,parteCorpo(M,FC,'cabeca',0.04,0.44,0.017,16,{a0:-2.05,a1:2.05}),ID,co);
    put(2,bevelTris(0.078,0.08,0.05,0.016,{tx:0.6,tz:0.7}),mat(0,na.y-0.012,na.z+0.01,-0.1,0,0),co);
    if(pano){const bo=frenteCabeca(M,0.25,0,FC);put(2,ellipTris(0.042,0.032,0.012,10,5),mat(0,bo.y,bo.z+0.024),lin(0x2c2c2a),0);}
    const ty=H.y0+H.h*0.36,tz=-(H.R*0.95*H.sz+0.016);put(2,ellipTris(0.022,0.018,0.018,8,5),mat(0,ty,tz),es);
    for(const s of[1,-1])put(2,bevelTris(0.03,0.075,0.008,0.003),mat(s*0.014,ty-0.045,tz-0.004,0.15,0,s*0.25),co);}}

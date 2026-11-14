/* ================= malhas e desenho ================= */
let W=1,H=1,dpr=1,vegDirty=true,vegT=0,grassT=0;
/* malha da gigante para desenhar: a de sempre (a mata nova, quando ligada, usa só a madeira e põe a copa de verdade) */
function gigMalha(T){return T.mesh;}
function gigSombra(T,perto){return T.mesh;}
function obraGeometry(){const O={},R=rng(77);const mk=f=>{const g=new GB(1024,8);f(g);return g.data();};
  O.barricada=mk(g=>{add(g,cylTris(0.17,0.17,2.9,7),mat(1.45,0.62,0,0,0,Math.PI/2),lin(0x5d4129),{j:0.1,rnd:R});
    for(let k=0;k<4;k++){const sx=-1.05+k*0.7;for(const sg of[1,-1]){const dy=Math.sin(0.87),dz=Math.cos(0.87)*sg,L=1.95,by=0.62-dy*L/2,bz=-dz*L/2;
      add(g,cylTris(0.05,0.06,L-0.25,5),alignY(sx,by,bz,0,dy,dz),lin(0x6b4c30),{j:0.12,rnd:R});add(g,cylTris(0,0.05,0.25,5),alignY(sx,by+dy*(L-0.25),bz+dz*(L-0.25),0,dy,dz),lin(0xa98a5f));}}});
  O.muro=mk(g=>{for(let i=0;i<10;i++){const x=-1.35+i*0.3,h=2.1+R()*0.25;add(g,bvTris(0.27,h,0.09),mat(x,h/2,0.04),mixc(lin(0x6e5235),lin(0x7d6142),R()),{j:0.08,rnd:R});
      add(g,cylTris(0,0.14,0.18,4,{phase:Math.PI/4}),mat(x,h,0.04,0,0,0,1,1,0.5),lin(0x8a6a45));}
    for(const y of[0.5,1.6])add(g,bvTris(3.0,0.18,0.08),mat(0,y,-0.06),lin(0x5a412a));});
  O.muroPedra=mk(g=>{for(let r=0;r<5;r++)for(let i=0;i<6;i++){const x=-1.25+i*0.5+(r%2)*0.25-0.12,y=0.22+r*0.4;if(x>1.4)continue;
      add(g,icoTris(0.3,0.3,R),mat(x,y,0,R(),R()*3,R(),1.0,0.75,0.9),mixc(lin(0x6d6c64),lin(0x8a877d),R()),{j:0.1,rnd:R});}});
  O.estacas=mk(g=>{add(g,cylTris(0.1,0.1,2.0,6),mat(1.0,0.1,-0.3,0,0,Math.PI/2),lin(0x5d4129));add(g,cylTris(0.1,0.1,2.0,6),mat(1.0,0.1,0.3,0,0,Math.PI/2),lin(0x5d4129));
    for(let i=0;i<9;i++){const x=-0.9+(i%5)*0.45+(i>4?0.22:0),z=i>4?0.3:-0.3;add(g,cylTris(0,0.055,0.95,5),alignY(x,0.05,z,(R()-0.5)*0.3,1,0.45),lin(0x8a6a45),{j:0.1,rnd:R});}});
  O.portaoBase=mk(g=>{for(const px of[-1.5,1.5])add(g,bvTris(0.22,2.2,0.22),mat(px,1.1,0),lin(0x5a3f27));add(g,bvTris(3.2,0.16,0.2),mat(0,2.25,0),lin(0x5a3f27));});
  O.portaoFolha=mk(g=>{for(const y of[0.45,0.85,1.25,1.65])add(g,bvTris(2.8,0.3,0.07),mat(1.4,y,0.05),mixc(lin(0x6e5235),lin(0x7d6142),R()),{j:0.08,rnd:R});
    for(const x of[0.25,2.55])add(g,bvTris(0.14,1.7,0.08),mat(x,1.05,0.12),lin(0x5a412a));add(g,bvTris(0.14,2.6,0.08),mat(1.4,1.05,0.13,0,0,0.95),lin(0x5a412a));
    add(g,bvTris(0.5,0.08,0.09),mat(0.4,1.0,0.16),lin(0x55595c));add(g,bvTris(0.5,0.08,0.09),mat(2.4,1.0,0.16),lin(0x55595c));});
  O.fogueira=mk(g=>{for(let i=0;i<9;i++){const a=i/9*6.283;add(g,icoTris(0.16,0.35,R),mat(Math.cos(a)*0.62,0.05,Math.sin(a)*0.62,R(),R()*6,R(),1.25,0.8,1.05),mixc(lin(0x5d5a55),lin(0x7a766d),R()),{j:0.15,rnd:R});}
    for(let i=0;i<5;i++){const a=i/5*6.283+0.4,bx=Math.cos(a)*0.45,bz=Math.sin(a)*0.45;add(g,cylTris(0.06,0.075,0.55,6),alignY(bx,0.02,bz,-bx,0.4,-bz),lin(0x5a3d27),{e:0.18,rnd:R});}
    for(let i=0;i<10;i++){const a=R()*6.283,r=R()*0.35;add(g,bvTris(0.08,0.05,0.08),mat(Math.cos(a)*r,0.04,Math.sin(a)*r),lin(0xff5418),{e:1.6});}});
  O.bau=mk(g=>{const W=1.02,D=0.62,ferro=lin(0x3b3e42);
    for(let i=0;i<3;i++)add(g,bvTris(W,0.158,D),mat(0,0.085+i*0.162,0),mixc(lin(0x6b4e30),lin(0x84643f),R()),{j:0.06,rnd:R});
    add(g,bvTris(W+0.03,0.045,D+0.03),mat(0,0.505,0),lin(0x45311f));
    add(g,cylTris(0.335,0.335,W+0.04,12),mat(W/2+0.02,0.52,0,0,0,Math.PI/2,0.52,1,1),mixc(lin(0x6f5133),lin(0x7f5f3b),R()),{j:0.05,rnd:R});
    for(const x of[-0.33,0.33]){add(g,bvTris(0.075,0.5,D+0.035),mat(x,0.25,0),ferro);add(g,cylTris(0.35,0.35,0.075,12),mat(x+0.0375,0.52,0,0,0,Math.PI/2,0.52,1,1),ferro);}
    for(const x of[-0.5,0.5])for(const z of[-0.3,0.3])add(g,bvTris(0.06,0.5,0.06),mat(x,0.25,z),ferro);
    add(g,bvTris(0.14,0.16,0.04),mat(0,0.47,-D/2-0.03),lin(0xb08a3a));add(g,bvTris(0.03,0.055,0.012),mat(0,0.455,-D/2-0.052),lin(0x161412));
    for(const x of[-0.42,0.42])add(g,bvTris(0.16,0.035,0.035),mat(x,0.36,-D/2-0.01),ferro);});
  /* caixas da mata: madeira (comum), suprimentos (verde com faixa amarela) e escondida (lata enferrujada meio enterrada) */
  O.cx_comum=mk(g=>{const c=lin(0x6f5236);add(g,bvTris(0.62,0.5,0.5),mat(0,0.25,0),c,{j:0.08,rnd:R});for(const y of[0.07,0.43])add(g,bvTris(0.64,0.06,0.52),mat(0,y,0),scl(c,0.6));
    add(g,bvTris(0.06,0.52,0.52),mat(0,0.25,0),scl(c,0.75));add(g,bvTris(0.5,0.04,0.05),mat(0,0.25,0.258,0,0,0.62),scl(c,0.8));});
  O.cx_suprimentos=mk(g=>{const v=lin(0x3f4a2c),e=lin(0x2c3420);add(g,bvTris(0.78,0.36,0.42),mat(0,0.18,0),v,{j:0.05,rnd:R});add(g,bvTris(0.8,0.06,0.44),mat(0,0.38,0),e);
    add(g,bvTris(0.79,0.05,0.43),mat(0,0.12,0),lin(0xc9a227));add(g,bvTris(0.16,0.04,0.04),mat(0,0.43,0),lin(0x2b2b2b));for(const x of[-0.42,0.42])add(g,bvTris(0.04,0.08,0.16),mat(x,0.22,0),lin(0x2b2b2b));});
  O.cx_escondida=mk(g=>{add(g,ellipTris(0.55,0.14,0.45,10,5),mat(0,-0.03,0),lin(0x3a2d21),{j:0.15,rnd:R});
    add(g,bvTris(0.42,0.2,0.3),mat(0,0.06,0,0.12,0.4,0.05),lin(0x6a4a30),{j:0.2,rnd:R});add(g,bvTris(0.43,0.04,0.31),mat(0,0.17,0,0.12,0.4,0.05),lin(0x4a3424));
    for(let k=0;k<5;k++){const a=k*1.3;add(g,cylTris(0.01,0.014,0.35,4),alignY(Math.cos(a)*0.3,0.02,Math.sin(a)*0.25,Math.cos(a)*0.6,0.5,Math.sin(a)*0.6),lin(0x4a3a26),{j:0.2,rnd:R});}});
  /* oficina: o que aparece na bancada da clareira depois da melhoria (coordenadas locais da bancada) */
  O.oficina=mk(g=>{const aco=lin(0x6f777e),az=lin(0x3d5a73),ver=lin(0xa8261d),mad=lin(0x6b4e30),esc=lin(0x2b2b2b);
    add(g,bvTris(0.14,0.08,0.16),mat(-0.66,0.96,-0.05),az);add(g,bvTris(0.05,0.1,0.18),mat(-0.61,1.03,-0.05),az);add(g,bvTris(0.05,0.1,0.18),mat(-0.72,1.03,-0.05),aco);
    add(g,cylTris(0.009,0.009,0.26,6),mat(-0.53,1.0,-0.05,0,0,Math.PI/2),aco);
    add(g,bvTris(0.46,0.2,0.22),mat(0.3,0.425,0.02),ver,{j:0.05,rnd:R});add(g,bvTris(0.47,0.025,0.23),mat(0.3,0.53,0.02),lin(0x7e1c15));add(g,bvTris(0.2,0.03,0.03),mat(0.3,0.565,0.02),esc);
    for(const x of[-0.7,0.7])add(g,bvTris(0.06,1.05,0.06),mat(x,1.38,-0.34),mad);
    add(g,bvTris(1.46,0.72,0.025),mat(0,1.5,-0.355),lin(0x8a6a45),{j:0.06,rnd:R});
    add(g,bvTris(0.03,0.26,0.03),mat(-0.42,1.52,-0.33),mad);add(g,bvTris(0.13,0.05,0.05),mat(-0.42,1.66,-0.33),aco);
    add(g,bvTris(0.32,0.12,0.012),mat(-0.08,1.52,-0.335,0,0,0.1),aco);add(g,bvTris(0.1,0.035,0.03),mat(-0.27,1.54,-0.33),mad);
    add(g,bvTris(0.035,0.3,0.015),mat(0.26,1.5,-0.335,0,0,-0.25),aco);add(g,cylTris(0.03,0.03,0.016,8),mat(0.3,1.66,-0.335,Math.PI/2,0,0),aco);
    add(g,bvTris(0.06,0.06,0.06),mat(0.5,1.45,-0.33),lin(0xb08a3a));add(g,bvTris(0.06,0.06,0.06),mat(0.58,1.6,-0.33),lin(0x8d969f));});
  altoGeometry(O,R,mk);baseGeometry(O,R,mk);
  return O;}
function extraGeometry(){const X={},R=rng(91);const mk=f=>{const g=new GB(512,8);f(g);return g.data();};
  X.caixa=mk(g=>{add(g,boxTris(1.1,0.8,0.8),mat(0,0.4,0),lin(0x4f5c3b),{j:0.05,rnd:R});for(const x of[-0.3,0.3])add(g,boxTris(0.08,0.82,0.82),mat(x,0.4,0),lin(0x2a2c2e));
    add(g,cylTris(0.03,0.03,0.25,6),mat(0.4,0.8,0.25,0.4,0,0.3),lin(0xff3020),{e:2.5});});
  X.saco=mk(g=>{add(g,icoTris(0.22,0.3,R),mat(0,0.18,0,0,0,0,1,0.8,1),lin(0x6b5a3a),{j:0.1,rnd:R});add(g,cylTris(0.05,0.08,0.1,6),mat(0,0.32,0),lin(0x5a4a2e));});
  X.mochila=mk(g=>{add(g,boxTris(0.42,0.5,0.25,{tx:0.94}),mat(0,0.25,0,0.3,0,0),lin(0x56603a));add(g,cylTris(0.09,0.09,0.46,7),mat(0.23,0.5,0.05,0,0,Math.PI/2),lin(0x7a5537));
    add(g,boxTris(0.3,0.16,0.07),mat(0,0.2,0.16,0.3,0,0),lin(0x4a5331));});
  return X;}
function buildFire(){const g=new GB(512,8),R=rng(31),bones=[];
  const L=[[0.25,0.76,0xff4a12,1.8],[0.23,0.64,0xff5a16,1.8],[0.24,0.7,0xff4a12,1.8],[0.18,0.94,0xff8a24,2.1],[0.16,0.84,0xff8a24,2.1],[0.12,0.76,0xffc65a,2.4],[0.1,0.58,0xffe39a,2.6]];
  L.forEach((l,i)=>{add(g,cylTris(0,l[0],l[1],5,{phase:R()*6}),ID,lin(l[2]),{b:i,e:l[3]});const a=i/L.length*6.283,r=i<3?0.13:i<5?0.06:0.02;bones.push([Math.cos(a)*r,Math.sin(a)*r,R()*6.283,l[1]]);});
  return{mesh:litMesh(g.data()),bones,m:new Float32Array(192)};}
let FIREM=null;
/* a montagem do mundo por etapas (13/11/2026): cada etapa é [nome na tela de carregamento, peso (de fábrica: o tempo medido dela,
   em quartos de segundo, num computador sem placa de vídeo; depois a barra aprende o tempo do PC da pessoa),
   função]. initMeshes() roda todas de uma vez, como antes; boot() roda uma por vez (montarMundoPorEtapas) e a tela de
   carregamento mostra a etapa e a porcentagem de verdade entre uma e outra. Os módulos de depois põem as etapas deles com
   etapaMalha(fase,nome,peso,f): fase 'mata' (logo depois da mata do jogo) ou 'fim' (depois de tudo, como era o initMeshes
   embrulhado). */
const ETAPAS_MALHAS={mata:[],fim:[]};
function etapaMalha(fase,nome,peso,f){ETAPAS_MALHAS[fase].push([nome,peso,f,fase+'/'+nome+'/'+ETAPAS_MALHAS[fase].length]);}
function etapasMalhasEmOrdem(){const L=[];
  L.push(['terreno',67,()=>{const w=buildWorld();MESH.world=litMesh(w.data);MESH.world.casters=w.casterVerts;MESH.sil=unMesh(w.sil);MESH.towerSil=unMesh(w.towerSil);MESH.tower=litMesh(w.tower);},'terreno']);
  L.push(['mata',19,()=>{const V=vegGeometry();const inst=(k,max)=>instMesh(V[k],max);
  MESH.pine=inst('pine',3200);MESH.round=inst('round',1600);MESH.dead=inst('dead',700);MESH.stump=inst('stump',3000);MESH.birch=inst('birch',1000);
  MESH.pineN=inst('pineHi',900);MESH.roundN=inst('roundHi',520);MESH.deadN=inst('deadHi',260);MESH.birchN=inst('birchHi',360);MESH.flor=inst('flor',3600);
  MESH.rock=inst('rock',220);MESH.bush=inst('bush',480);MESH.berries=inst('berries',480);
  MESH.samambaia=inst('samambaia',2500);MESH.folhas=inst('folhas',2700);for(const T of GIGANTES){T.mesh=litMesh(geoGigante(T));T.meshM=litMesh(geoGigante(T,true));}
  MESH.pedra=inst('pedra',200);MESH.galho=inst('galho',200);MESH.cogumelo=inst('cogumelo',100);MESH.fibra=inst('fibra',200);MESH.grass=inst('grass',4600);
  for(const[k,v]of[['pine',0.0035],['pineN',0.0035],['round',0.006],['roundN',0.006],['birch',0.006],['birchN',0.006],['dead',0.002],['deadN',0.002],['bush',0.035],['berries',0.035],['grass',0.42],['fibra',0.18],['flor',0.5],['samambaia',0.12]])MESH[k].sway=v;},'vegetacao']);
  for(const e of ETAPAS_MALHAS.mata)L.push(e);
  L.push(['cidade',72,()=>{const Wg=weaponGeometry();MESH.arma={};for(const k in Wg)MESH.arma[k]=litMesh(Wg[k]);
  const Og=obraGeometry();MESH.obra={};for(const k in Og)MESH.obra[k]=litMesh(Og[k]);
  const Xg=extraGeometry();for(const k in Xg)MESH[k]=litMesh(Xg[k]);
  {const cg=carroGeometry();MESH.carro=litMesh(cg.body);MESH.roda=litMesh(cg.roda);}
  initCidadeMeshes();},'cidade-armas']);
  L.push(['cidade',10,()=>{FIREM=buildFire();MESH.ter=terMesh(terrainData());makeSplatTex(splatData(),SPLAT_S);},'cidade-terreno']);
  L.push(['lugares',15,()=>{skInit();
  const sv=survivorSpec();MESH.surv={mesh:litMesh(buildHuman(sv,survivorExtras)),bones:bonesOf(sv),sk:SKT.akai};P.ch=newChar(MESH.surv,1);
  MESH.roupa={};for(const id in ITEMS)if(ITEMS[id].tipo==='roupa')MESH.roupa[id]=litMesh(roupaGeometry(sv,id));
  MESH.roupaSK={};for(const id of['mochila','mochilaRef','mochilaPequena','mochilaExpedicao'])MESH.roupaSK[id]=litMesh(roupaGeometry(sv,id,{semAlca:true,dz:0.085,dy:0.02}));
  aplicarAparencia(APAR_PADRAO);},'lugares-sobrevivente']);
  L.push(['lugares',28,()=>{const mkZ=(t,seed)=>{const sp=zombieSpec(t,seed);return{mesh:litMesh(buildHuman(sp,zombieExtras)),bones:bonesOf(sp),sk:SKT.yaku};};
  ZMESH.walker=[mkZ('walker',11),mkZ('walker',12),mkZ('walker',13),mkZ('walker',14),mkZ('walker',19),mkZ('walker',23)];
  faunaMalhas();ZMESH.cao=buildCao();CAO.ch=newChar(ZMESH.cao,1);caoInicio();
  VULTO.ch=newChar(ZMESH.walker[3],1.08);VULTO.ch.vis=false;ZMESH.runner=[mkZ('runner',15),mkZ('runner',21)];ZMESH.brute=[mkZ('brute',16)];ZMESH.screamer=[mkZ('screamer',17)];zumbis2Meshes();armas3Meshes();efeitosMeshes();baseMilitarGeo();baseMilitarMontar();},'lugares-zumbis']);
  for(const f of INIT_MALHAS)L.push(['lugares',0.5,()=>{try{f();}catch(e){console.error('malha',f.name,e);}},'m:'+(f.name||'')]);
  for(const e of ETAPAS_MALHAS.fim)L.push(e);
  return L;}
function initMeshes(){for(const e of etapasMalhasEmOrdem())e[2]();}
/* a mesma montagem com uma pausa de um quadro quando passa de 40 ms sem pausa: a tela de carregamento se redesenha.
   aviso(etapa,fração) vem antes de cada etapa e no fim ('fim',1). No modo de teste, window.__etapasTempo guarda quanto cada
   etapa levou (para acertar os pesos) */
/* um quadro para a tela de carregamento aparecer; com a janela escondida (minimizada) não tem quadro: segue depois de 100 ms */
function quadroDeCarga(){return new Promise(r=>{let ok=false;const ir=()=>{if(!ok){ok=true;r();}};requestAnimationFrame(()=>setTimeout(ir,0));setTimeout(ir,100);});}
/* a barra aprende com o computador: ao fim de cada montagem fica guardado quanto cada etapa levou neste PC, e na próxima a barra
   anda no ritmo de verdade dele. Se a lista de etapas mudou (versão nova), vale uma vez o peso de fábrica. aviso(etapa, onde a barra
   está, onde ela chega no fim da etapa, quanto tempo a etapa deve levar em ms): a tela desliza a barra durante a etapa */
async function montarMundoPorEtapas(aviso){const L=etapasMalhasEmOrdem(),chaves=L.map((e,i)=>e[3]||String(i)).join('|'),sv=store.get('vaydr_carga_v1'),
  aprendeu=!!(sv&&sv.chaves===chaves&&Array.isArray(sv.ms)&&sv.ms.length===L.length),peso=L.map((e,i)=>aprendeu?Math.max(4,+sv.ms[i]||0):e[1]),
  tot=peso.reduce((s,p)=>s+p,0),tempos=[],ini=performance.now();let feito=0,ult=0;
  for(let i=0;i<L.length;i++){const[nome,p0,f]=L[i];aviso(nome,feito/tot,(feito+peso[i])/tot,aprendeu?peso[i]:peso[i]*120);
    if(!document.hidden&&performance.now()-ult>40){await quadroDeCarga();ult=performance.now();}
    const t0=performance.now();f();tempos.push([nome,p0,Math.round(performance.now()-t0),L[i][3]||'']);feito+=peso[i];}
  aviso('fim',1);store.set('vaydr_carga_v1',{chaves,ms:tempos.map(t=>t[2])});
  if(TESTE){window.__etapasTempo=tempos;window.__etapasTotal=Math.round(performance.now()-ini);window.__etapasAprendidas=aprendeu;}}
function buildWorld(){const C=new GB(1<<16,8),N=new GB(1<<16,8),TWR=new GB(1<<12,8),R=rng(20261026);
  gerarCidade();
  clearingProps(C,N,R);gasStation(C,N,R);farm(C,N,R);village(C,N,R);sitios(C,N,R);towerSite(C,N,R,TWR);
  placeVegetation();sinistros(C,N,R);troncosGeometry(C,R);
  const casterVerts=C.n;
  const st=C.st,all=new Float32Array((C.n+N.n)*st);all.set(C.f.subarray(0,C.n*st));all.set(N.f.subarray(0,N.n*st),C.n*st);
  return{data:all,casterVerts,sil:silhouettes(),towerSil:towerSilhouette(),tower:TWR.data()};}
function rebuildVeg(force){vegT-=1;if(!vegDirty&&!force&&vegT>0)return;vegT=30;vegDirty=false;
  const pine=[],round=[],dead=[],stump=[],birch=[],pN=[],rN=[],dN=[],bN=[];
  const nr=GF().arvPerto,far=GF().arvLonge;
  /* v10.2.2: com a mata de verdade pronta (62y), a árvore queimada fica de pé, carbonizada (só a madeira da espécie, preta) no lugar
     do toco com espeto preto, e a que está pegando fogo escurece aos poucos e perde as folhas (marca: tr >= 9, ver mataDistribuir) */
  const qm=typeof queimadasSet==='function'?queimadasSet():null;
  for(const t of TREES){if(t.agua)continue;const dd=d2(t.x,t.z,P.x,P.z);if(dd>far*far)continue;
    if(!t.alive){if(qm&&qm.has(t.id)){const v=0.8+0.2*pinhoHash(t.x+1.3,t.z),it={x:t.x,y:t.y,z:t.z,r:t.r,s:t.s,tr:10+0.15*v,tg:0.135*v,tb:0.125*v};(t.kind===0?pN:t.kind===3?bN:rN).push(it);continue;}
      stump.push({x:t.x,y:t.y+0.1,z:t.z,r:t.r,s:t.s*0.9,t:t.t});continue;}
    const it={x:t.x,y:t.y,z:t.z,r:t.r,s:t.s,t:t.t,tr:t.tr,tg:t.tg,tb:t.tb};let near=dd<nr*nr;
    if(t.fogo&&qm){const k=clamp(1-t.fogoT/(t.fogo0||30),0,1),b0=t.tr??t.t??1,c=lerp(1,0.17,k*k*(3-2*k));it.tr=b0*c*(1+0.25*k*(1-k)*4);it.tg=(t.tg??t.t??1)*c*(1-0.35*k);it.tb=(t.tb??t.t??1)*c*(1-0.5*k);
      if(k>0.55)it.tr+=10;near=true;}
    if(near)(t.kind===0?pN:t.kind===1?rN:t.kind===3?bN:dN).push(it);else(t.kind===0?pine:t.kind===1?round:t.kind===3?birch:dead).push(it);}
  instUpload(MESH.pine,pine);instUpload(MESH.round,round);instUpload(MESH.dead,dead);instUpload(MESH.stump,stump);instUpload(MESH.birch,birch);
  instUpload(MESH.pineN,pN);instUpload(MESH.roundN,rN);instUpload(MESH.deadN,dN);instUpload(MESH.birchN,bN);
  const inR=o=>d2(o.x,o.z,P.x,P.z)<far*far;instUpload(MESH.rock,ROCKS.filter(r=>r.alive&&inR(r)));instUpload(MESH.bush,BUSHES.filter(b=>!b.agua&&inR(b)));instUpload(MESH.berries,BUSHES.filter(b=>b.frutas&&!b.agua&&inR(b)));
  instUpload(MESH.pedra,PICKS.filter(p=>p.alive&&p.kind==='pedra'));instUpload(MESH.galho,PICKS.filter(p=>p.alive&&p.kind==='galho'));instUpload(MESH.cogumelo,PICKS.filter(p=>p.alive&&p.kind==='cogumelo'));instUpload(MESH.fibra,PICKS.filter(p=>p.alive&&p.kind==='fibra'));}
function rebuildGrass(){const lim=GRAF[cfg.graf].grama,R2=GF().grRaio**2,out=[],limpo=G.modo==='criacao'?36:0;for(const g of GRASS){const d=d2(g.x,g.z,P.x,P.z);if(d<R2&&d>=limpo){out.push(g);if(out.length>=lim)break;}}instUpload(MESH.grass,out);   // na criação o chão em volta do personagem fica limpo (o capim não tampa a câmera)
  const fl=[],RF2=(GF().grRaio+8)**2,lf=Math.round(lim*GF().flores);for(const f of FLORES){const d=d2(f.x,f.z,P.x,P.z);if(d<RF2&&d>=limpo){fl.push(f);if(fl.length>=lf)break;}}instUpload(MESH.flor,fl);
  const sm=[],RS2=(GF().grRaio+10)**2,ls=GF().samamb;for(const f of SAMAMBAIAS){const d=d2(f.x,f.z,P.x,P.z);if(d<RS2&&d>=limpo){sm.push(f);if(sm.length>=ls)break;}}instUpload(MESH.samambaia,sm);
  const fo=[],RO2=(GF().grRaio+6)**2,lo=GF().folhas;for(const f of FOLHAS_CHAO){const d=d2(f.x,f.z,P.x,P.z);if(d<RO2&&d>=limpo){fo.push(f);if(fo.length>=lo)break;}}instUpload(MESH.folhas,fo);}

/* ---------- câmera, luz e desenho ---------- */
const V=M4(),PR=M4(),VP=M4(),LV=M4(),LP=M4(),LVP=M4(),SM=M4(),TMP=M4(),TMP2=M4(),VPV=M4(),PRV=M4(),CW=M4();
const BIAS=new Float32Array([0.5,0,0,0,0,0.5,0,0,0,0,0.5,0,0.5,0.5,0.5,1]),BIAS0=new Float32Array([0.25,0,0,0,0,0.5,0,0,0,0,0.5,0,0.25,0.5,0.5,1]),BIAS1=new Float32Array([0.25,0,0,0,0,0.5,0,0,0,0,0.5,0,0.75,0.5,0.5,1]);
const LV2=M4(),LP2=M4(),LVP2=M4(),SM2=M4();
/* luz do sol vista de cima, presa à grade de texels (as bordas das sombras não tremem quando o jogador anda) */
function luzSol(LVo,LPo,LVPo,cx,cz,meio,S){const L=E.dd,f=norm([-L[0],-L[1],-L[2]]),r=norm([f[2],0,-f[0]]),u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];
  const tx=2*meio/S,a=cx*r[0]+cz*r[2],b=cx*u[0]+cz*u[2],da=Math.round(a/tx)*tx-a,db=Math.round(b/tx)*tx-b,C=[cx+r[0]*da+u[0]*db,u[1]*db,cz+r[2]*da+u[2]*db];
  lookAt(LVo,[C[0]+L[0]*150,C[1]+L[1]*150,C[2]+L[2]*150],C,[0,1,0]);ortho(LPo,-meio,meio,-meio,meio,1,330);mul(LVPo,LPo,LVo);}
let spotP=[0,-100,0],spotD=[0,-1,0];const PLv=new Float32Array(16),PCv=new Float32Array(12);let NPL=0;
function setLit(Pg){const u=Pg.u,sh=GRAF[cfg.graf].sombra>0,post=!!GDEF;gl.useProgram(Pg.p);if(u.uAlbT){gl.uniform1i(u.uAlbT,5);gl.uniform1f(u.uUseTex,0);}if(u.uJog)gl.uniform4f(u.uJog,P.x,P.y,P.z,P.alive&&!CARRO.ativo?1:0);
  gl.uniformMatrix4fv(u.uViewProj,false,VP);gl.uniform3fv(u.uCam,cam.pos);gl.uniform3f(u.uTint,1,1,1);gl.uniform1f(u.uAlpha,1);
  gl.uniform3fv(u.uHemiS,E.hs);gl.uniform3fv(u.uHemiG,E.hg);gl.uniform3fv(u.uDirD,E.dd);gl.uniform3fv(u.uDirC,E.dc);
  gl.uniform4fv(u.uPL,PLv);gl.uniform3fv(u.uPC,PCv);gl.uniform1i(u.uNPL,NPL);gl.uniform1f(u.uTaps,cfg.graf==='ultra'?4:cfg.graf==='alto'?3:2);
  gl.uniform3fv(u.uSpotP,spotP);gl.uniform3fv(u.uSpotD,spotD);gl.uniform3fv(u.uSpotC,E.spot);if(CARRO.ativo){gl.uniform2f(u.uSpotK,Math.cos(0.62),Math.cos(0.28));gl.uniform1f(u.uSpotR,75);}else{gl.uniform2f(u.uSpotK,Math.cos(0.5),Math.cos(0.2));gl.uniform1f(u.uSpotR,60);}   // v10.2.2: facho mais largo e alcance de 42 m (era 30)
  gl.uniform3fv(u.uFog,post?E.fogL:E.hor);gl.uniform3fv(u.uFogSun,post?E.fogSunL:E.fogSun);gl.uniform3fv(u.uSunD,E.sunFogD);gl.uniform1f(u.uMist,E.mist);
  gl.uniform1f(u.uFogD,E.fogD);gl.uniform1f(u.uExp,E.exp);gl.uniform1f(u.uDetail,GRAF[cfg.graf].detalhe);if(u.uWet)gl.uniform1f(u.uWet,E.wet||0);gl.uniform1f(u.uEmis,post?2.2:1);
  gl.uniform3fv(u.uRim,E.rim);gl.uniform1f(u.uTime,G.t);gl.uniform2fv(u.uWind,E.wind);
  if(u.uVer){if(cfg.cam!=='1'&&!CARRO.ativo&&P.alive&&camDist>1.2)gl.uniform4f(u.uVer,P.x,P.y+(P.agachado?0.75:1.1),P.z,0.95);else gl.uniform4f(u.uVer,0,0,0,0);}
  gl.uniform1f(u.uShadowOn,sh?1:0);gl.uniformMatrix4fv(u.uShadowM,false,SM);gl.uniformMatrix4fv(u.uShadowM2,false,SM2);gl.uniform1f(u.uCasc,SHADOW&&SHADOW.casc?1:0);gl.uniform1f(u.uTexel,1/(SHADOW?SHADOW.size:1024));
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,SHADOW.tex);gl.uniform1i(u.uShadow,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,NOISE_TEX);gl.uniform1i(u.uNoise,1);
  if(u.uSplat){gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,SPLAT_TEX);gl.uniform1i(u.uSplat,2);}gl.activeTexture(gl.TEXTURE0);}
function luzes(){let n=0;PLv.fill(0);PCv.fill(0);const nMax=Math.min(4,GF().luzes||4),put=(x,y,z,r,c)=>{if(n>=nMax)return;PLv.set([x,y,z,r],n*4);PCv.set(c,n*3);n++;};
  if(P.y<-20)luzSub(put);
  put(FIRE[0],FIRE[1]+0.7,FIRE[2],24,E.fire);
  if(G.modo==='criacao'){   // palco da criação: três luzes que acompanham a câmera (sobra a fogueira atrás, já posta acima)
    const a=P.ch.yaw+CRIA.luz,s=P.ch.s||1,L=(da,d,h,r,c)=>put(P.x+Math.sin(a+da)*d,P.y+h*s,P.z+Math.cos(a+da)*d,r,c);
    L(0.65,2.6,2.4,9,[2.5,2.32,2.15]);     // principal: quente, na frente e de lado (como antes)
    L(-1.05,2.4,1.45,7,[0.5,0.62,0.86]);   // preenchimento: fria e fraca, do outro lado (a sombra do rosto não fica preta)
    L(Math.PI-0.4,2.1,2.7,6.5,[1.9,1.5,1.1]); // recorte: atrás e alto, desenha o contorno do cabelo e dos ombros
    NPL=n;return;}
  if(P.flash>0&&P.muzzle)put(P.muzzle[0],P.muzzle[1],P.muzzle[2],14,[6,4.2,2.2]);
  if(E.n>0.2)put(LANTERN[0],LANTERN[1],LANTERN[2],9,scl([1,0.62,0.25],2.4*E.n));
  let best=null,bd=1e9;for(const f of FIRES){const d=d2(f.x,f.z,P.x,P.z);if(d<bd){bd=d;best=f;}}
  if(best){if(best.branca)put(best.x,best.y-0.15,best.z,19,scl([0.9,0.95,1],lerp(1.6,5.2,E.n)));else if(best.eletrica)put(best.x,best.y-0.12,best.z,17,scl([1,0.86,0.62],lerp(1.4,4.4,E.n)));else if(best.lamp)put(best.x,best.y+0.35,best.z,11,scl([1,0.62,0.28],lerp(1.4,3.6,E.n)));else put(best.x,best.y+0.6,best.z,18,scl([1,0.45,0.15],lerp(3,7,E.n)*E.flick));}
  if(G.ev&&G.ev.ativo)put(G.ev.x,G.ev.y+1.2,G.ev.z,10,scl([1,0.15,0.08],2.5+Math.sin(G.t*9)));
  {let ch=null,cd=1e9;for(const c of CHAMAS){const d=d2(c.x,c.z,P.x,P.z);if(d<cd&&(c.k||0)>0.05){cd=d;ch=c;}}if(ch&&cd<70*70)put(ch.x,ch.y+(ch.mata?3.2:0.8),ch.z,ch.mata?22:14,scl([1,0.45,0.15],(3.5+Math.sin(G.t*13)*0.6)*(ch.k||0)*(ch.mata?1.6:1)));}   // v10.2.2: árvore em chamas ilumina mais alto e mais longeluzesCidade(put);
  /* a segunda lâmpada elétrica mais perto também ilumina, se sobrar vaga */
  {let b2=null,dd=45*45;for(const f of FIRES){if(f===best||!f.eletrica)continue;const d=d2(f.x,f.z,P.x,P.z);if(d<dd){dd=d;b2=f;}}if(b2)put(b2.x,b2.y-0.15,b2.z,16,b2.branca?scl([0.9,0.95,1],lerp(1.4,4.6,E.n)):scl([1,0.86,0.62],lerp(1.2,4,E.n)));}
  NPL=n;}
function fireBones(fx,fy,fz,m,sc){FIREM.bones.forEach((b,i)=>{const sy=b[3]*(0.78+0.3*Math.sin(G.t*7.3+i*1.7+fx)+0.12*Math.sin(G.t*13.1+i*2.9));const s=(0.9+0.12*Math.sin(G.t*5.1+i))*sc;
  trs(LOC,fx+b[0]*sc,fy+0.1,fz+b[1]*sc,Math.sin(G.t*3.1+i)*0.12,b[2]+G.t*0.6,Math.cos(G.t*2.7+i*1.3)*0.12,s,sy/b[3]*sc,s);m.set(LOC,i*16);});}
function drawInst(Pg,m){if(!m.n)return;gl.uniform1f(Pg.u.uSway,m.sway||0);gl.bindVertexArray(m.vao);
  if(m.tex&&Pg.u.uUseTex){gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,m.tex);gl.activeTexture(gl.TEXTURE0);gl.uniform1f(Pg.u.uUseTex,m.alfa?1+m.alfa:1);   // instâncias com textura (capim novo: com recorte)
    gl.drawArraysInstanced(gl.TRIANGLES,0,m.count,m.n);gl.uniform1f(Pg.u.uUseTex,0);return;}
  gl.drawArraysInstanced(gl.TRIANGLES,0,m.count,m.n);}
function drawStat(Pg,mesh,M){gl.uniformMatrix4fv(Pg.u.uModel,false,M);gl.bindVertexArray(mesh.vao);
  if(mesh.tex&&Pg.u.uUseTex){gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,mesh.tex);gl.activeTexture(gl.TEXTURE0);gl.uniform1f(Pg.u.uUseTex,1);   // modelo com textura (ferramentas novas)
    gl.drawArrays(gl.TRIANGLES,0,mesh.count);gl.uniform1f(Pg.u.uUseTex,0);return;}
  gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
/* igual, mas escurecendo como interior (k de 0 a 1) quando a peça está dentro de prédio ou metrô */
function drawStatI(Pg,mesh,M,k){if(k>0&&Pg.u.uIntO)gl.uniform1f(Pg.u.uIntO,k);drawStat(Pg,mesh,M);if(k>0&&Pg.u.uIntO)gl.uniform1f(Pg.u.uIntO,0);}
/* golpe de cima na primeira pessoa: quanto a mão anda (x direita, y cima, z para trás), gira de lado (rz) e a mais na lâmina (rx)
   no alto do preparo (sobe) e no fim da descida (desce). Ajuste de 12/11: a cabeça do machado acaba no meio da tela, um pouco
   abaixo da mira (antes descia até a borda de baixo e quase sumia: só aparecia a ponta do cabo), e gira no cabo para a lâmina
   aparecer de lado na batida (de costas ela fica fina como um prego) */
/* v10.2.2 (13/11): com o braço de verdade (62yh_braco.js), o que tem modelo na mão sobe para a mão aparecer no canto de baixo à
   direita, fechada no cabo (antes a mão ficava abaixo da tela e só a ferramenta aparecia). O preparo e a batida do golpe de cima
   continuam no mesmo lugar da tela de antes: os números de GOLPE_FP levam da pose nova até eles (o sexto é o giro de lado).
   Sem modelo na mão (punho vazio, chave, curativo…) fica a pose de antes, com o soco subindo da borda de baixo */
const VM_MAO=[0.29,-0.24,-0.52,-2.499,0.062,3.833],VM_VAZIA=[0.33,-0.46,-0.62,-2.45,0.25,Math.PI];   // na mão: cabo para cima e para a frente, lâmina para a frente e um pouco para a esquerda
const GOLPE_FP={k:-0.85,kd:0,sobe:[0.12,0.08,0.05,-0.293,0.049,0.188],desce:[-0.18,-0.14,-0.18,0.207,0.149,0.188]};
const GOLPE_FP_VAZIA={k:-0.85,kd:0,sobe:[0.08,0.3,0.15,0.4,0,0],desce:[-0.22,0.08,-0.08,0.9,0.1,0]};
function viewModel(o){const d=selDef(),id=selItem()?selItem().id:null;const a=P.acao;let sx=0,sy=0,kick=0,bob=Math.sin(P.ph*2)*0.012*P.amp,bobx=Math.cos(P.ph)*0.012*P.amp,gx=0,gy=0,gz=0,gr=0;
  const comItem=!!(id&&MESH.arma&&MESH.arma[id]&&ITEMS[id]&&(ITEMS[id].tipo==='arma'||ITEMS[id].mao)&&typeof brfMalha==='function'&&brfMalha()),G0=comItem?GOLPE_FP:GOLPE_FP_VAZIA,B0=comItem?VM_MAO:VM_VAZIA;
  if(a&&a.tipo==='golpe'){const s=clamp(a.t/a.dur,0,1);const w=s<0.4?-easeIO(s/0.4)*0.9:lerp(-0.9,1.2,easeOut(Math.min(1,(s-0.4)/0.25)))*(1-smooth(0.7,1,s));if(a.vertical)sx=w*(a.soco?1:w<0?G0.k:G0.kd);else sy=-w*1.2;
    /* v10.1, golpe de cima (machado, picareta): o giro estava ao contrário (a lâmina descia para fora da tela no preparo e subia no
       golpe); agora sobe no preparo e desce no golpe (k negativo). E o braço inteiro trabalha: no preparo a mão sobe e vai para trás
       do ombro; na descida cruza para o meio da tela, para baixo e para a frente, e volta. Antes só o punho girava */
    if(a.vertical&&!a.soco){const sobe=s<0.4?easeIO(s/0.4):1-easeOut(Math.min(1,(s-0.4)/0.2)),desce=s<0.4?0:easeOut(Math.min(1,(s-0.4)/0.2))*(1-smooth(0.68,1,s)),A=G0.sobe,B=G0.desce;
      gx=A[0]*sobe+B[0]*desce;gy=A[1]*sobe+B[1]*desce;gz=A[2]*sobe+B[2]*desce;gr=A[3]*sobe+B[3]*desce;sx+=A[4]*sobe+B[4]*desce;sy+=A[5]*sobe+B[5]*desce;}}
  if(a&&a.tipo==='usar')kick=-0.5*Math.min(1,a.t/0.2,(a.dur-a.t)/0.2);
  if(a&&a.tipo==='recarga')kick=-0.6*Math.sin(Math.min(1,a.t/a.dur)*Math.PI);
  if(a&&a.tipo==='empurrar')kick=0.4*Math.min(1,a.t/0.12,(a.dur-a.t)/0.2);
  if(a&&a.tipo==='arremesso'){const s=clamp(a.t/a.dur,0,1);kick=s<0.4?-1.1*easeIO(s/0.4):lerp(-1.1,0.9,easeOut(Math.min(1,(s-0.4)/0.2)))*(1-smooth(0.7,1,s));}
  const fogo=d&&(d.fogo||id==='lanterna');   // a lanterna de mão fica na frente como a pistola
  let px=(fogo?0.17:B0[0])+bobx,py=(fogo?-0.17:B0[1])+bob-P.recuo*0.02,pz=(fogo?-0.42:B0[2])+P.recuo*0.05;
  // soco de mãos vazias: o punho sobe e avança para dentro da tela (dá para ver a pele e a manga escolhidas)
  if(!fogo&&a&&a.tipo==='golpe'&&a.soco&&!a.pedra){const k=Math.sin(clamp(a.t/a.dur,0,1)*Math.PI);px-=0.13*k;py+=0.27*k;pz-=0.16*k;}
  if(fogo)trs(o,px,py,pz,-Math.PI/2+P.recuo*0.12+kick,Math.PI,0,1,1,1);
  else trs(o,px+gx,py+gy,pz+gz,B0[3]+sx+kick,B0[4]+sy,B0[5]+gr,0.85,0.85,0.85);
  return id;}
/* pássaros de dia: dois bandos circulando alto */
const BIRD_N=10,birdArr=new Float32Array(16*6*7);
function birdsGeom(){if(E.n>0.4||E.r>0.5)return 0;let q=0;const t=G.t,put=(p,c)=>{birdArr.set([p[0],p[1],p[2],c,c,c*1.1,1],q*7);q++;};
  for(let f=0;f<2;f++){const ang=t*(f?0.05:-0.038)+f*2.4,R=f?78:58,cx=f?-20:30,cz=f?30:-25,h=34+f*7;
    const hx=-Math.sin(ang)*(f?1:-1),hz=Math.cos(ang)*(f?1:-1),rx=hz,rz=-hx;
    for(let b=0;b<5;b++){const side=b===0?0:(b%2?1:-1),k=Math.ceil(b/2);const bx=cx+Math.cos(ang)*R+rx*side*k*1.6-hx*k*1.3,bz=cz+Math.sin(ang)*R+rz*side*k*1.6-hz*k*1.3,by=h+Math.sin(t*0.7+b)*0.6;
      const fl=Math.sin(t*9+b*1.7+f)*0.32,c=0.035;
      const H=[bx+hx*0.28,by,bz+hz*0.28],T=[bx-hx*0.3,by+0.02,bz-hz*0.3],L=[bx-rx*0.62-hx*0.08,by+fl,bz-rz*0.62-hz*0.08],Rt=[bx+rx*0.62-hx*0.08,by+fl,bz+rz*0.62-hz*0.08];
      put(H,c);put(L,c);put(T,c);put(H,c);put(T,c);put(Rt,c);}}
  return q;}
/* olhos brilhando na mata à noite: alguma coisa está olhando (somem quando você chega perto ou ilumina) */
const OLHOS=[];let olhoT=10;
function updateOlhos(dt){const n=E.n||0;olhoT-=dt;
  if((n>0.6||(n>0.3&&mata(P.x,P.z)>0.85))&&P.alive&&!CARRO.ativo&&olhoT<=0&&OLHOS.length<3){olhoT=7+Math.random()*13;const yaw=Math.atan2(cam.fwd[0],cam.fwd[2]);
    for(let k=0;k<12;k++){const a=yaw+(Math.random()-0.5)*1.5,r=15+Math.random()*20,x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;
      if(Math.hypot(x-FIRE[0],z-FIRE[2])<22||!perto(TREES,x,z,5,t=>t.alive))continue;
      OLHOS.push({x,z,y:ground(x,z)+1.4+Math.random()*0.3,t:0,dur:3+Math.random()*4.5,pisca:Math.random()*3});if(Math.random()<0.6)sfx('galho',x,z,0.7);break;}}
  for(let i=OLHOS.length-1;i>=0;i--){const o=OLHOS[i];o.t+=dt;const dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz);
    if(d<10||n<0.5)o.dur=Math.min(o.dur,o.t+0.25);
    if(P.lanterna&&d<32){const fl=Math.hypot(cam.fwd[0],cam.fwd[2])||1;if((dx*cam.fwd[0]+dz*cam.fwd[2])/(d*fl)>0.96){if(o.dur>o.t+0.2&&Math.random()<0.4)sfx('galho',o.x,o.z,0.5);o.dur=Math.min(o.dur,o.t+0.15);}}
    if(o.t>o.dur)OLHOS.splice(i,1);}}
function desenharOlhos(){for(const o of OLHOS){const fi=clamp(Math.min(o.t/0.7,(o.dur-o.t)/0.3),0,1),bl=((o.t+o.pisca)%3.3)<0.13?0:1,al=fi*bl;if(al<=0.01)continue;
    const dx=o.x-cam.pos[0],dz=o.z-cam.pos[2],l=Math.hypot(dx,dz)||1,px=-dz/l*0.046,pz=dx/l*0.046;
    bb(o.x+px,o.y,o.z+pz,0.028,1.0,0.5,0.16,al);bb(o.x-px,o.y,o.z-pz,0.028,1.0,0.5,0.16,al);}}
function vagalumes(n){if(n<0.55||E.r>0.4)return;const cs=9,pcx=Math.floor(P.x/cs),pcz=Math.floor(P.z/cs),k0=(n-0.55)/0.45*(1-E.r);
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const gx=pcx+a,gz=pcz+b;for(let k=0;k<2;k++){const h=hash2(gx*3+k,gz*7-k);if(h<0.4)continue;
    const sx=(gx+hash2(gx+11,gz+k))*cs,sz=(gz+hash2(gx-k,gz+19))*cs,sd=h*100;
    const x=sx+Math.sin(G.t*0.31+sd)*1.6,z=sz+Math.cos(G.t*0.27+sd*1.3)*1.6,y=ground(x,z)+0.45+h*1.3+Math.sin(G.t*0.9+sd)*0.3;
    const bl=Math.max(0,Math.sin(G.t*(1.1+h)+sd*3.1)),al=bl*bl*bl*k0*smooth(3,7,Math.hypot(x-cam.pos[0],y-cam.pos[1],z-cam.pos[2]));if(al>0.02)bb(x,y,z,0.06,0.78,1,0.32,al);}}}
function render(){
  const asp=W/H;lookAt(V,cam.pos,cam.tgt,camUp());persp(PR,cam.fov,asp,0.08,700);mul(VP,PR,V);
  const sh=GRAF[cfg.graf].sombra>0,post=POSTX.ok&&!!GDEF;
  const fl0=Math.hypot(cam.fwd[0],cam.fwd[2])||1,fx0=cam.fwd[0]/fl0,fz0=cam.fwd[2]/fl0,cas=SHADOW&&SHADOW.casc,SS=SHADOW?SHADOW.size:1024;
  const sR=GF().sombraR||[27,0];
  if(cas){luzSol(LV,LP,LVP,P.x+fx0*sR[0]/3,P.z+fz0*sR[0]/3,sR[0],SS);mul(SM,BIAS0,LVP);luzSol(LV2,LP2,LVP2,P.x+fx0*sR[1]*0.54,P.z+fz0*sR[1]*0.54,sR[1],SS);mul(SM2,BIAS1,LVP2);}
  else{luzSol(LV,LP,LVP,P.x+fx0*sR[0]/3,P.z+fz0*sR[0]/3,sR[0],SS);mul(SM,BIAS,LVP);SM2.set(SM);}
  jogadorMalha();const chars=CARRO.ativo&&!motoristaVisivel()?[]:[P.ch];{const zd=GF().zDist**2,bd=GF().bDist**2;for(const z of Z)if(z.ch.vis&&d2(z.x,z.z,P.x,P.z)<zd)chars.push(z.ch);for(const b of BICHOS)if(b.ch.vis&&d2(b.x,b.z,P.x,P.z)<bd)chars.push(b.ch);}if(CAO.ch&&CAO.ch.vis)chars.push(CAO.ch);charsSobrev(chars);if(VULTO.ativo&&VULTO.ch&&VULTO.ch.vis)chars.push(VULTO.ch);
  for(const c of chars)poseBones(c);
  const chest=P.ch.m.subarray(16,32);
  if(CARRO.ativo){spotP=carroLocal(0,1.0,2.7);spotD=norm([Math.sin(CARRO.yaw),-0.13,Math.cos(CARRO.yaw)]);}
  else if(cfg.cam==='1'){spotP=lanternaNaMao()?[cam.pos[0]+cam.fwd[0]*0.58+cam.right[0]*0.17-cam.up[0]*0.17,cam.pos[1]+cam.fwd[1]*0.58-cam.up[1]*0.17,cam.pos[2]+cam.fwd[2]*0.58+cam.right[2]*0.17-cam.up[2]*0.17]:[cam.pos[0]+cam.right[0]*0.2,cam.pos[1]-0.15,cam.pos[2]+cam.right[2]*0.2];spotD=norm([cam.fwd[0],cam.fwd[1]-0.08,cam.fwd[2]]);}
  else{const fd=lookDir(P.yaw,P.pitch-0.12);spotD=norm(fd);
    /* lanterna na mão: a luz sai da ponta dela. Sem ela na mão (v10.2.2): sai da altura da cabeça, um palmo à frente na direção
       da mira. Antes saía da frente do peito apontando para a mira: virado para a câmera, ele acendia a luz no próprio corpo
       (o círculo claro no peito) e o brilho da lente ficava como uma bola no peito. */
    if(lanternaNaMao())spotP=xf(P.ch.m.subarray(11*16,12*16),LANT_PONTA[0],LANT_PONTA[1],LANT_PONTA[2]);
    else{const hy=P.y+lerp(1.6,1.08,P.agK||0)*(P.ch.s||1);spotP=[P.x+spotD[0]*0.5,hy+spotD[1]*0.5,P.z+spotD[2]*0.5];}}
  luzes();
  const hand=P.ch.m.subarray(11*16,12*16),selId=selItem()?selItem().id:null,armaMesh=selId&&MESH.arma[selId]&&(ITEMS[selId].tipo==='arma'||ITEMS[selId].mao)?MESH.arma[selId]:null;
  // sombra (com cascatas: perto à esquerda da textura, longe à direita)
  if(sh){gl.bindFramebuffer(gl.FRAMEBUFFER,SHADOW.fbo);gl.viewport(0,0,SHADOW.w,SHADOW.size);gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.6,3);
    gl.viewport(0,0,SHADOW.size,SHADOW.size);sombraCascata(LVP,true,chars,hand,armaMesh);
    if(cas){gl.viewport(SHADOW.size,0,SHADOW.size,SHADOW.size);gl.polygonOffset(3.0,6);sombraCascata(LVP2,false,chars,hand,armaMesh);}
    gl.disable(gl.POLYGON_OFFSET_FILL);}
  // cena
  if(post){gl.bindFramebuffer(gl.FRAMEBUFFER,POSTX.ms||POSTX.fbo);gl.viewport(0,0,POSTX.w,POSTX.h);}
  else{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);}
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.useProgram(PSKY.p);const su=PSKY.u,th=Math.tan(cam.fov/2);
  gl.uniform3f(su.uF,-V[2],-V[6],-V[10]);gl.uniform3f(su.uR,V[0],V[4],V[8]);gl.uniform3f(su.uU,V[1],V[5],V[9]);gl.uniform2f(su.uTan,th*asp,th);
  gl.uniform3fv(su.uZen,E.zen);gl.uniform3fv(su.uHor,E.hor);gl.uniform3fv(su.uGlow,E.glow);gl.uniform3fv(su.uMoon,MOON_DIR);gl.uniform3fv(su.uSun,E.sun);
  gl.uniform1f(su.uMoonV,E.moonV);gl.uniform1f(su.uSunV,E.sunV);gl.uniform1f(su.uStars,E.stars);gl.uniform1f(su.uTime,G.t);gl.uniform1f(su.uExp,E.exp);
  gl.uniform3fv(su.uMoonC,E.moonC);if(su.uLua)gl.uniform3fv(su.uLua,E.lua||[-1,1,1]);gl.uniform1f(su.uCloud,E.cloud);gl.uniform3fv(su.uCloudLit,E.cloudL);gl.uniform3fv(su.uCloudSh,E.cloudS);gl.uniform2fv(su.uCloudOff,E.cloudOff);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,NOISE_TEX);gl.uniform1i(su.uNoise,1);gl.activeTexture(gl.TEXTURE0);
  /* v10.1: com a câmera no subsolo o céu e as montanhas não são desenhados (fica o fundo preto). As salas de lá são fechadas,
     mas o túnel do metrô escaneado deixa frestas (furos na parede, pé da parede do fim) e por elas aparecia o céu claro */
  const ceuOn=!(cam.pos[1]<SUB_FUNDO);
  gl.bindVertexArray(EMPTY);if(ceuOn)gl.drawArrays(gl.TRIANGLES,0,3);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
  gl.useProgram(PU.p);gl.uniformMatrix4fv(PU.u.uViewProj,false,VP);gl.uniformMatrix4fv(PU.u.uModel,false,ID);const sl=post?E.silL:E.sil;gl.uniform4f(PU.u.uTint,sl[0],sl[1],sl[2],1);
  gl.uniform3fv(PU.u.uFog,post?E.fogL:E.hor);gl.uniform1f(PU.u.uSil,1);gl.bindVertexArray(MESH.sil.vao);if(ceuOn)gl.drawArrays(gl.TRIANGLES,0,MESH.sil.count);
  const towerFar=Math.hypot(cam.pos[0]-TOWER[0],cam.pos[2]-TOWER[1])>70;
  if(towerFar){gl.bindVertexArray(MESH.towerSil.vao);gl.drawArrays(gl.TRIANGLES,0,MESH.towerSil.count);}
  gl.uniform1f(PU.u.uSil,0);gl.uniform4f(PU.u.uTint,1,1,1,1);const nb=birdsGeom();
  if(nb){gl.bindBuffer(gl.ARRAY_BUFFER,BIRDS.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,birdArr,0,nb*7);gl.bindVertexArray(BIRDS.vao);gl.drawArrays(gl.TRIANGLES,0,nb);}
  gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  setLit(PTER);gl.uniform3f(PTER.u.uSplatT,0.5,0.5,1/(2*SPLAT_H));gl.uniform1f(PTER.u.uWet,E.wet);gl.bindVertexArray(MESH.ter.vao);gl.drawElements(gl.TRIANGLES,MESH.ter.count,gl.UNSIGNED_SHORT,0);
  skDesenhar(chars);
  setLit(PLS);
  for(const c of chars){if(c===P.ch&&G.modo!=='criacao'&&(cfg.cam==='1'||camDist<0.75))continue;
    if(c.sk&&c.sk.t.pronto&&!c.proc){const id=c===P.ch&&P.roupa&&P.roupa.costas,mm=id&&(MESH.roupaSK[id]||MESH.roupa[id]);if(mm){gl.uniform3fv(PLS.u.uTint,[1,1,1]);gl.uniform1f(PLS.u.uIntS,interiorEm(c.x,c.y+0.3,c.z));gl.uniformMatrix4fv(PLS.u.uBones,false,c.m);gl.bindVertexArray(mm.vao);gl.drawArrays(gl.TRIANGLES,0,mm.count);}continue;}
    gl.uniform3fv(PLS.u.uTint,c.tint||[1,1,1]);gl.uniform1f(PLS.u.uIntS,interiorEm(c.x,c.y+0.3,c.z));gl.uniformMatrix4fv(PLS.u.uBones,false,c.m);gl.bindVertexArray(c.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,c.mesh.count);
    if(c===P.ch)for(const k of ROUPA_SLOTS){const id=P.roupa[k],rm=id&&roupaMeshJ(id);if(rm){const tk=typeof roupaTint==='function'?roupaTint(k,c.tint):null;if(tk)gl.uniform3fv(PLS.u.uTint,tk);gl.bindVertexArray(rm.vao);gl.drawArrays(gl.TRIANGLES,0,rm.count);if(tk)gl.uniform3fv(PLS.u.uTint,c.tint||[1,1,1]);}}}
  gl.uniform3f(PLS.u.uTint,1,1,1);gl.uniform1f(PLS.u.uIntS,0);
  setLit(PLI);
  drawInst(PLI,MESH.pine);drawInst(PLI,MESH.round);drawInst(PLI,MESH.birch);drawInst(PLI,MESH.dead);drawInst(PLI,MESH.pineN);drawInst(PLI,MESH.roundN);drawInst(PLI,MESH.birchN);drawInst(PLI,MESH.deadN);drawInst(PLI,MESH.stump);drawInst(PLI,MESH.rock);drawInst(PLI,MESH.bush);drawInst(PLI,MESH.berries);
  drawInst(PLI,MESH.pedra);drawInst(PLI,MESH.cogumelo);drawInst(PLI,MESH.fibra);
  setLit(PL);drawStat(PL,MESH.world,ID);if(!towerFar)drawStat(PL,MESH.tower,ID);desenharCidade(PL,false);
  gl.disable(gl.CULL_FACE);
  const obD=GF().obDist**2;for(const o of OB){if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>obD)continue;const dmg=o.hp/o.hpMax;if(OBRA.ativo&&OBRA.mira===o){const q=0.5+0.5*Math.sin(G.t*7),dz=OBRA.desm&&OBRA.desm.o===o;gl.uniform3f(PL.u.uTint,dz?1.9+0.3*q:1.45+0.3*q,dz?0.55:1.3+0.25*q,dz?0.45:0.55);}else gl.uniform3f(PL.u.uTint,lerp(0.55,1,dmg),lerp(0.5,1,dmg),lerp(0.48,1,dmg));if(o.intK===undefined)o.intK=emPredios(o.x,o.z,2)?interiorEm(o.x,o.y+0.3,o.z):0;if(o.intK>0&&PL.u.uIntO)gl.uniform1f(PL.u.uIntO,o.intK);desenharObra(PL,o);if(o.intK>0&&PL.u.uIntO)gl.uniform1f(PL.u.uIntO,0);}
  gl.uniform3f(PL.u.uTint,1,1,1);
  if(MESH.baseMil&&d2(BASEM.x,BASEM.z,cam.pos[0],cam.pos[2])<230*230)drawStat(PL,MESH.baseMil,ID);
  if(G.fab&&G.fab.nv>=2)drawStat(PL,MESH.obra.oficina,trs(TMP,BENCH[0],ground(BENCH[0],BENCH[1]),BENCH[1],0,-0.35,0,1,1,1));
  for(const T of GIGANTES)if(d2(T.x,T.z,cam.pos[0],cam.pos[2])<170*170)drawStat(PL,gigMalha(T),trs(TMP,T.x,T.y,T.z,0,0,0,1,1,1));
  for(const c of CAIXAS){if(c.x===undefined||c.estado==='espera')continue;const vd=CAIXA_CFG.verDist[c.cat];if(d2(c.x,c.z,P.x,P.z)>vd*vd)continue;
    const k=c.estado==='saqueada'?0.5:1;gl.uniform3f(PL.u.uTint,k,k,k);drawStat(PL,MESH.obra['cx_'+c.cat],trs(TMP,c.x,c.y,c.z,0,c.yaw,0,1,1,1));}
  gl.uniform3f(PL.u.uTint,1,1,1);
  desenharChao(PL);   // itens no chão: cada um com o seu modelo (48yc)
  if(P.mochila){trs(TMP,P.mochila.x,P.mochila.y,P.mochila.z,0,0.6,0,1,1,1);drawStat(PL,MESH.mochila,TMP);}
  if(G.ev&&G.ev.ativo){trs(TMP,G.ev.x,G.ev.y,G.ev.z,0,0.4,0,1,1,1);drawStat(PL,MESH.caixa,TMP);}
  if(armaMesh&&cfg.cam!=='1'&&!CARRO.ativo){drawStat(PL,armaMesh,hand);if(selId==='lanterna'&&P.lanterna&&MESH.lanternaLente)drawStat(PL,MESH.lanternaLente,hand);}
  desenharArmas2(PL);desenharSobrevArmas(PL);desenharBase(PL);desenharArmasZ(PL);desenharArmas3(PL);desenhoFase('opaco',PL);
  desenharCarro(PL);
  setLit(PLI);drawInst(PLI,MESH.galho);drawInst(PLI,MESH.grass);drawInst(PLI,MESH.flor);drawInst(PLI,MESH.samambaia);drawInst(PLI,MESH.folhas);
  setLit(PLS);
  fireBones(FIRE[0],FIRE[1],FIRE[2],FIREM.m,1);gl.uniformMatrix4fv(PLS.u.uBones,false,FIREM.m);gl.bindVertexArray(FIREM.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,FIREM.mesh.count);
  for(const f of FIRES){if(f.lamp||f.semChama)continue;fireBones(f.x,f.y,f.z,FIREM.m,0.8);gl.uniformMatrix4fv(PLS.u.uBones,false,FIREM.m);gl.drawArrays(gl.TRIANGLES,0,FIREM.mesh.count);}
  // sombra de contato sob os personagens
  gl.useProgram(PU.p);gl.uniformMatrix4fv(PU.u.uViewProj,false,VP);gl.uniform1f(PU.u.uSil,0);gl.uniform4f(PU.u.uTint,0,0,0,sh?0.32:0.48);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);gl.bindVertexArray(DISC.vao);
  for(const c of chars){if(c===P.ch&&cfg.cam==='1'&&G.modo!=='criacao')continue;if(d2(c.x,c.z,cam.pos[0],cam.pos[2])>55*55)continue;const r=0.46*(c.s||1)*(c.pitch<-0.6?1.5:1);
    trs(TMP,c.x,(c.y??ground(c.x,c.z))+0.03,c.z,0,0,0,r,1,r);gl.uniformMatrix4fv(PU.u.uModel,false,TMP);gl.drawArrays(gl.TRIANGLES,0,DISC.count);}
  // manchas de sangue: respingos de verdade, gotas e poças (efeitos)
  desenharManchas();
  gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.disable(gl.BLEND);
  // fantasma da construção
  if(OBRA.ativo){setLit(PL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(PL.u.uAlpha,0.5);
    gl.uniform3f(PL.u.uTint,OBRA.ok?0.6:2.2,OBRA.ok?1.8:0.5,OBRA.ok?0.7:0.4);{const ef=obraEscFantasma()||[1,1,1];trs(TMP,OBRA.x,OBRA.y??ground(OBRA.x,OBRA.z),OBRA.z,0,OBRA.yaw,0,ef[0],ef[1],ef[2]);}const fm=fantasmaAlto();
    if(OBRA.tipo==='portao'||OBRA.tipo==='portaoFerro'){const fe=OBRA.tipo==='portaoFerro';drawStat(PL,fe?MESH.obra.portaoFerroBase:MESH.obra.portaoBase,TMP);drawStat(PL,fe?MESH.obra.portaoFerroFolha:MESH.obra.portaoFolha,mul(TMP2,TMP,trs(M4(),-1.4,0,0,0,0,0,1,1,1)));}else if(fm)drawStat(PL,fm,TMP);else drawStat(PL,MESH.obra[OBRA.tipo],TMP);
    gl.uniform1f(PL.u.uAlpha,1);gl.uniform3f(PL.u.uTint,1,1,1);gl.depthMask(true);gl.disable(gl.BLEND);}
  desenhoFase('agua');
  // transparências
  gl.enable(gl.BLEND);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.useProgram(PU.p);gl.uniform1f(PU.u.uSil,0);
  if(P.lanterna&&E.n>0.05&&cfg.cam!=='1'&&!CARRO.ativo){const yaw=Math.atan2(spotD[0],spotD[2]),pit=-Math.asin(clamp(spotD[1],-1,1)),len=lanternaForte()?15:11,rad=len*Math.tan(0.4);
    trs(TMP,spotP[0],spotP[1],spotP[2],pit,yaw,0,rad,rad,len);gl.uniformMatrix4fv(PU.u.uModel,false,TMP);gl.uniform4f(PU.u.uTint,1,1,1,0.05*E.n*(1-0.4*E.r));
    gl.bindVertexArray(BEAM.vao);gl.drawArrays(gl.TRIANGLES,0,BEAM.count);}
  for(const rg of RINGS){if(rg.a<0)continue;const s=0.6+rg.a*7;trs(TMP,rg.x,rg.y,rg.z,0,0,0,s,1,s);gl.uniformMatrix4fv(PU.u.uModel,false,TMP);
    gl.uniform4f(PU.u.uTint,1,0.45,0.35,0.6*(1-rg.a/1.5));gl.bindVertexArray(RING.vao);gl.drawArrays(gl.TRIANGLES,0,RING.count);}
  gl.useProgram(PBB.p);gl.uniformMatrix4fv(PBB.u.uViewProj,false,VP);gl.uniform3f(PBB.u.uR,V[0],V[4],V[8]);gl.uniform3f(PBB.u.uU,V[1],V[5],V[9]);
  gl.uniform1f(PBB.u.uLin,post?1:0);gl.uniform1f(PBB.u.uExpI,1/E.exp);gl.uniform1f(PBB.u.uGain,1.8);gl.uniform1f(PBB.u.uAdd,0);
  bbN=0;const n=E.n;
  for(const p of PART)if(!p.add){const k=p.l/p.L;bb(p.x,p.y,p.z,p.s*(p.g<5?1+k*2:1),p.c[0],p.c[1],p.c[2],p.c[3]*(1-k));}
  for(const s of SMOKE){const k=s.l/s.L;bb(s.x,s.y,s.z,0.35+k*1.9,lerp(0.62,0.32,n),lerp(0.62,0.36,n),lerp(0.64,0.44,n),(1-k)*smooth(0,0.15,k)*lerp(0.16,0.13,n));}
  bbAmbiente();bbGas();bbFeridas();bbInchados();desenhoFase('alfa');
  if(G.ev&&G.ev.ativo)for(let i=0;i<10;i++){const k=((G.t*0.25+i/10)%1);bb(G.ev.x+0.4+Math.sin(i*2.1+G.t*0.3)*k*1.5,G.ev.y+1+k*14,G.ev.z+0.25,0.6+k*3,0.9,0.25,0.2,(1-k)*0.35);}
  const alphaN=bbN;
  const fl=E.flick;
  const glow=(x,y,z,big)=>{bb(x,y+0.6,z,2.3*big,1,0.5,0.18,lerp(0.14,0.32,n)*fl);bb(x,y+0.35,z,1.0*big,1,0.78,0.4,0.42*fl);};
  glow(FIRE[0],FIRE[1],FIRE[2],1);for(const f of FIRES){if(f.eletrica||f.semChama)continue;if(f.lamp)bb(f.x,f.y+0.16,f.z,0.55,1,0.72,0.35,lerp(0.12,0.4,n));else glow(f.x,f.y,f.z,0.8);}
  for(const e of EMBERS){const k=e.l/e.L;bb(e.x,e.y,e.z,0.055,1,0.62,0.25,(1-k)*0.9);}
  for(const p of PART)if(p.add){const k=p.l/p.L;bb(p.x,p.y,p.z,p.s,p.c[0],p.c[1],p.c[2],p.c[3]*(1-k));}
  bbArmas2();bbChefe();bbBase();bbZumbis2();bbArmas3();desenhoFase('aditivo');
  const pk=post?0.45:1;bb(LANTERN[0],LANTERN[1],LANTERN[2],post?0.7:1.0,1,0.72,0.38,lerp(0.12,0.55,n)*pk);
  const blink=(Math.sin(G.t*3.2)>0.2?1:0.08);bb(TOWER_TOP[0],TOWER_TOP[1],TOWER_TOP[2],post?2.6:3.4,1,0.16,0.1,blink*lerp(post?0.12:0.5,post?0.75:0.95,n));
  if(P.flash>0&&P.muzzle)bb(P.muzzle[0],P.muzzle[1],P.muzzle[2],0.45,1,0.8,0.45,1);
  /* faróis: desenhados pelo módulo dos veículos (DESENHO.aditivo) */
  if(P.lanterna&&n>0.05&&cfg.cam!=='1'&&!CARRO.ativo&&lanternaNaMao())bb(spotP[0],spotP[1],spotP[2],post?0.05:0.08,1,0.95,0.8,(post?0.45:0.6)*n);   // brilho só na lente da lanterna de mão (v10.2.2: pequeno; grande ele virava a "bola" na mão)
  for(const d of DROPS){const dd=d2(d.x,d.z,P.x,P.z);if(dd<7*7)continue;bb(d.x,d.y+0.45+Math.sin(G.t*3)*0.04,d.z,0.18,1,0.85,0.4,0.2*Math.min(1,(Math.sqrt(dd)-7)/4));}   // o brilho só ajuda a achar de longe; de perto valem o modelo e a etiqueta
  vagalumes(n);desenharOlhos();
  gl.bindBuffer(gl.ARRAY_BUFFER,BBBUF);gl.bufferSubData(gl.ARRAY_BUFFER,0,bbData,0,bbN*60);gl.bindVertexArray(BBV);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,alphaN*6);
  gl.uniform1f(PBB.u.uAdd,1);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.TRIANGLES,alphaN*6,(bbN-alphaN)*6);
  if(E.r>0.01){gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(PRAIN.p);const ru=PRAIN.u;
    gl.uniformMatrix4fv(ru.uViewProj,false,VP);gl.uniform3fv(ru.uCam,cam.pos);gl.uniform1f(ru.uTime,G.t);gl.uniform2f(ru.uWind,1.6,0.4);
    const rc=[lerp(0.78,0.66,n),lerp(0.82,0.74,n),lerp(0.88,0.86,n)],rl=post?toLin(rc,E.exp):rc;
    gl.uniform4f(ru.uCol,rl[0],rl[1],rl[2],lerp(0.42,0.5,n)*E.r);gl.bindVertexArray(RAINV);gl.drawArrays(gl.LINES,0,RAIN_N*2);}
  gl.depthMask(true);gl.disable(gl.BLEND);
  // arma em primeira pessoa
  if(cfg.cam==='1'&&P.alive&&!CARRO.ativo&&!lunetaAtiva()&&!P.nada){const id=viewModel(TMP);gl.clear(gl.DEPTH_BUFFER_BIT);persp(PRV,0.9,asp,0.01,10);   // dirigindo (CARRO.ativo): as mãos estão no volante, sem a arma na frente
    const f=cam.fwd,r=cam.right,u=cam.up,p=cam.pos;CW.set([r[0],r[1],r[2],0,u[0],u[1],u[2],0,-f[0],-f[1],-f[2],0,p[0],p[1],p[2],1]);
    mul(VPV,PRV,V);setLit(PL);gl.uniformMatrix4fv(PL.u.uViewProj,false,VPV);gl.uniform1f(PL.u.uShadowOn,0);mul(TMP2,CW,TMP);
    if(id==='arco')desenharArco1P(PL,CW);
    else if(id&&MESH.arma[id]&&(ITEMS[id].tipo==='arma'||ITEMS[id].mao)&&!brfSemItem(id)){drawStat(PL,MESH.arma[id],TMP2);if(id==='lanterna'&&P.lanterna&&MESH.lanternaLente)drawStat(PL,MESH.lanternaLente,TMP2);}
    bracoFPDesenhar(PL,CW,TMP,id);}   // v10.2.2: braço e mão de verdade, fechada no cabo (62yh_braco.js)
  gl.bindVertexArray(null);
  if(post)posProcessar();}
/* desenha o que projeta sombra numa cascata (perto: tudo; longe: só o que é grande) */
function sombraCascata(lvp,perto,chars,hand,armaMesh){const R=perto?60:150;
  gl.useProgram(PD.p);gl.uniformMatrix4fv(PD.u.uViewProj,false,lvp);gl.uniformMatrix4fv(PD.u.uModel,false,ID);gl.bindVertexArray(MESH.world.vao);gl.drawArrays(gl.TRIANGLES,0,MESH.world.casters);
  for(const o of OB)if(d2(o.x,o.z,P.x,P.z)<R*R)desenharObra(PD,o);
  if(G.fab&&G.fab.nv>=2)drawStat(PD,MESH.obra.oficina,trs(TMP,BENCH[0],ground(BENCH[0],BENCH[1]),BENCH[1],0,-0.35,0,1,1,1));
  if(MESH.baseMil&&d2(BASEM.x,BASEM.z,P.x,P.z)<(R+30)*(R+30))drawStat(PD,MESH.baseMil,ID);
  for(const T of GIGANTES)if(d2(T.x,T.z,P.x,P.z)<(perto?62:150)**2)drawStat(PD,gigSombra(T,perto),trs(TMP,T.x,T.y,T.z,0,0,0,1,1,1));
  desenharCidade(PD,true,perto?55:140);
  if(perto){for(const c of CAIXAS)if(c.x!==undefined&&c.estado!=='espera'&&d2(c.x,c.z,P.x,P.z)<30*30)drawStat(PD,MESH.obra['cx_'+c.cat],trs(TMP,c.x,c.y,c.z,0,c.yaw,0,1,1,1));
    if(armaMesh&&cfg.cam!=='1'&&!CARRO.ativo)drawStat(PD,armaMesh,hand);}
  desenharCarro(PD);desenhoFase('sombra',PD,perto);
  gl.useProgram(PDI.p);gl.uniformMatrix4fv(PDI.u.uViewProj,false,lvp);gl.uniform1f(PDI.u.uTime,G.t);gl.uniform2fv(PDI.u.uWind,E.wind);drawInst(PDI,MESH.pineN);drawInst(PDI,MESH.roundN);drawInst(PDI,MESH.deadN);drawInst(PDI,MESH.birchN);
  if(!perto){drawInst(PDI,MESH.pine);drawInst(PDI,MESH.round);drawInst(PDI,MESH.birch);}
  if(perto){gl.useProgram(PDS.p);gl.uniformMatrix4fv(PDS.u.uViewProj,false,lvp);
    for(const c of chars){if(c.sk&&c.sk.t.pronto&&!c.proc)continue;gl.uniformMatrix4fv(PDS.u.uBones,false,c.m);gl.bindVertexArray(c.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,c.mesh.count);
      if(c===P.ch)for(const k of ROUPA_SLOTS){const id=P.roupa[k],rm=id&&roupaMeshJ(id);if(rm){gl.bindVertexArray(rm.vao);gl.drawArrays(gl.TRIANGLES,0,rm.count);}}}
    skSombra(chars,lvp);}}
const CW2=M4();
function posProcessar(){const X=POSTX;
  const gr=GRAF[cfg.graf]||GRAF.alto,aoOn=!!(gr.ssao&&PSSAO&&X.ao&&X.dtex),raioOn=!!(gr.raios&&PRAIOS&&X.raio&&X.dtex);
  if(X.ms){gl.bindFramebuffer(gl.READ_FRAMEBUFFER,X.ms);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,X.fbo);gl.blitFramebuffer(0,0,X.w,X.h,0,0,X.w,X.h,gl.COLOR_BUFFER_BIT,gl.NEAREST);
    if(aoOn||raioOn)gl.blitFramebuffer(0,0,X.w,X.h,0,0,X.w,X.h,gl.DEPTH_BUFFER_BIT,gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER,null);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null);}
  gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.bindVertexArray(EMPTY);gl.activeTexture(gl.TEXTURE0);
  // oclusão de ambiente (meia resolução) com desfoque que respeita as bordas
  if(aoOn){gl.useProgram(PSSAO.p);gl.bindFramebuffer(gl.FRAMEBUFFER,X.ao.f);gl.viewport(0,0,X.ao.w,X.ao.h);gl.bindTexture(gl.TEXTURE_2D,X.dtex);const u=PSSAO.u;
    gl.uniform1i(u.uD,0);gl.uniform2f(u.uPx,1/X.ao.w,1/X.ao.h);gl.uniform2f(u.uPr,PR[0],PR[5]);gl.uniform1f(u.uN,0.08);gl.uniform1f(u.uF,700);gl.uniform1f(u.uRaio,0.55);gl.uniform1f(u.uForca,1.15);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.useProgram(PBLURAO.p);const b=PBLURAO.u;gl.uniform1i(b.uT,0);gl.uniform1i(b.uD,1);gl.uniform1f(b.uN,0.08);gl.uniform1f(b.uF,700);gl.uniform2f(b.uPx,1/X.ao.w,1/X.ao.h);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,X.dtex);gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,X.ao2.f);gl.bindTexture(gl.TEXTURE_2D,X.ao.t);gl.uniform2f(b.uDir,1,0);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.bindFramebuffer(gl.FRAMEBUFFER,X.ao.f);gl.bindTexture(gl.TEXTURE_2D,X.ao2.t);gl.uniform2f(b.uDir,0,1);gl.drawArrays(gl.TRIANGLES,0,3);}
  // raios de sol saindo por trás de prédios e árvores (só com o sol na frente da câmera)
  let raioK=0,sol=[0.5,0.5];
  if(raioOn&&E.sunV>0.05&&E.sun[1]>-0.02){const sd=cam.fwd[0]*E.sun[0]+cam.fwd[1]*E.sun[1]+cam.fwd[2]*E.sun[2];
    if(sd>0.15){const q=[cam.pos[0]+E.sun[0]*500,cam.pos[1]+E.sun[1]*500,cam.pos[2]+E.sun[2]*500],x=VP[0]*q[0]+VP[4]*q[1]+VP[8]*q[2]+VP[12],y=VP[1]*q[0]+VP[5]*q[1]+VP[9]*q[2]+VP[13],w=VP[3]*q[0]+VP[7]*q[1]+VP[11]*q[2]+VP[15];
      if(w>0.1){sol=[x/w*0.5+0.5,y/w*0.5+0.5];raioK=Math.min(1,E.sunV)*smooth(0.15,0.6,sd)*(1-0.6*(E.r||0))*(1-(E.cloud||0)*0.5);
        gl.useProgram(PRAIOS.p);gl.bindFramebuffer(gl.FRAMEBUFFER,X.raio.f);gl.viewport(0,0,X.raio.w,X.raio.h);gl.bindTexture(gl.TEXTURE_2D,X.dtex);
        gl.uniform1i(PRAIOS.u.uD,0);gl.uniform2f(PRAIOS.u.uSol,sol[0],sol[1]);gl.uniform1f(PRAIOS.u.uK,1);gl.drawArrays(gl.TRIANGLES,0,3);}}}
  const bloomOn=!!GRAF[cfg.graf].bloom&&X.lv.length>1;
  if(bloomOn){let src=X.tex,sw=X.w,sh=X.h;
    for(let i=0;i<X.lv.length;i++){const Lv=X.lv[i],Pg=i===0?PDOWN0:PDOWN;gl.useProgram(Pg.p);gl.bindFramebuffer(gl.FRAMEBUFFER,Lv.f);gl.viewport(0,0,Lv.w,Lv.h);
      gl.bindTexture(gl.TEXTURE_2D,src);gl.uniform1i(Pg.u.uT,0);gl.uniform2f(Pg.u.uPx,1/sw,1/sh);gl.uniform1f(Pg.u.uLim,2.4);gl.uniform1f(Pg.u.uExp,E.exp);
      gl.drawArrays(gl.TRIANGLES,0,3);src=Lv.t;sw=Lv.w;sh=Lv.h;}
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(PUP.p);
    for(let i=X.lv.length-1;i>0;i--){const S=X.lv[i],D=X.lv[i-1];gl.bindFramebuffer(gl.FRAMEBUFFER,D.f);gl.viewport(0,0,D.w,D.h);
      gl.bindTexture(gl.TEXTURE_2D,S.t);gl.uniform1i(PUP.u.uT,0);gl.uniform2f(PUP.u.uPx,1/S.w,1/S.h);gl.drawArrays(gl.TRIANGLES,0,3);}
    gl.disable(gl.BLEND);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
  const u=PCOMP.u;gl.useProgram(PCOMP.p);gl.bindTexture(gl.TEXTURE_2D,X.tex);gl.uniform1i(u.uT,0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,bloomOn?X.lv[0].t:X.tex);gl.uniform1i(u.uB,1);gl.activeTexture(gl.TEXTURE0);
  gl.uniform1f(u.uExp,E.exp);gl.uniform1f(u.uBloomK,bloomOn?E.bloom:0);gl.uniform1f(u.uSat,E.sat);gl.uniform3fv(u.uLift,E.lift);gl.uniform3fv(u.uGain,E.gain);
  gl.uniform1f(u.uVig,E.vig||0.62);gl.uniform1f(u.uGrain,cfg.graf==='baixo'?0:0.028);gl.uniform1f(u.uTime,G.t);gl.uniform1f(u.uCont,0.15);gl.uniform2f(u.uRes,canvas.width,canvas.height);
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,aoOn?X.ao.t:X.tex);gl.uniform1i(u.uAO,2);gl.uniform1f(u.uAOk,aoOn?0.85:0);
  gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,raioK>0?X.raio.t:X.tex);gl.uniform1i(u.uRaios,3);gl.uniform1f(u.uRaioK,raioK*0.42);gl.uniform3f(u.uRaioC,1.0,0.84,0.6);gl.activeTexture(gl.TEXTURE0);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.bindVertexArray(null);}
function project(p){const x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12],y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13],w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];
  if(w<=0.1)return null;return[(x/w*0.5+0.5)*W,(1-(y/w*0.5+0.5))*H];}

/* ---------- fogo, fagulhas e fumaça ---------- */
const EMBERS=[],SMOKE=[];
function updateFx(dt){const fy=FIRE[1];
  const fires=[[FIRE[0],FIRE[1],FIRE[2]],...FIRES.filter(f=>!f.lamp&&!f.semChama).map(f=>[f.x,f.y,f.z])];
  for(const f of fires){if(EMBERS.length<80&&Math.random()<dt*30)EMBERS.push({x:f[0]+(Math.random()-0.5)*0.5,y:f[1]+0.4,z:f[2]+(Math.random()-0.5)*0.5,vx:(Math.random()-0.5)*0.9,vy:0.8+Math.random()*1.1,vz:(Math.random()-0.5)*0.9,l:0,L:0.8+Math.random()*1.1});
    if(SMOKE.length<24&&Math.random()<dt*4)SMOKE.push({x:f[0]+(Math.random()-0.5)*0.3,y:f[1]+1.0,z:f[2]+(Math.random()-0.5)*0.3,l:0,L:4+Math.random()*2});}
  for(let i=EMBERS.length-1;i>=0;i--){const e=EMBERS[i];e.l+=dt;e.x+=(e.vx+Math.sin(G.t*3+i)*0.3)*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;if(e.l>e.L)EMBERS.splice(i,1);}
  for(let i=SMOKE.length-1;i>=0;i--){const s=SMOKE[i];s.l+=dt;s.y+=dt*0.9;s.x+=dt*0.25;if(s.l>s.L)SMOKE.splice(i,1);}
  for(let i=PART.length-1;i>=0;i--){const p=PART[i];p.l+=dt;p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const g=p.gota?chaoEm(p.x,p.z,p.y+0.25):ground(p.x,p.z);if(p.y<g+0.02){p.y=g+0.02;p.vx*=0.4;p.vz*=0.4;p.vy=0;if(p.gota){p.gota=false;gotaPousou(p);p.L=Math.min(p.L,p.l+0.06);}}if(p.l>p.L)PART.splice(i,1);}
  for(let i=RINGS.length-1;i>=0;i--){RINGS[i].a+=dt;if(RINGS[i].a>1.5)RINGS.splice(i,1);}
  for(const o of OB)if(o.tipo==='portao'||o.tipo==='portaoFerro'){const perto=d2(o.x,o.z,P.x,P.z)<9||energiaFiado(o)&&!!o.energ;o.abre=approach(o.abre,perto?1:0,dt*2.5);}
  if(emPredios(P.x,P.z,40))for(const d of CID.portas){const alvo=d.estado==='aberta'?1:0;if(d.abre!==alvo&&d2(d.x,d.z,P.x,P.z)<40*40)d.abre=approach(d.abre||0,alvo,dt*3);}}

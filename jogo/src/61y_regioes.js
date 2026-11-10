/* ================= Etapa 22: mundo aberto — borda de mata fechada, regiões e carregamento por distância =================
   · Borda: todo o limite do mapa (o círculo da mata, o corredor do vale do rio e o planalto do Alto do Rio Claro) virou uma faixa
     de mata fechada: moitas densas umas encostadas nas outras, com pedras grandes nos trechos de serra. Você para no mato antes
     do fim do mundo; atrás dele a mata continua e o terreno sobe para a serra (no Alto, a serra fecha o planalto por três lados).
   · Região nova: Alto do Rio Claro, o planalto ao norte, onde nasce o Rio Claro (o 61z_altorio monta o que tem lá). Chega-se
     pela Trilha da Serra: sai do fim da rua da vila, segue o rio para o norte e sobe a encosta ao lado da cachoeira.
   · Regiões (REGIOES): o mapa dividido em regiões com nome; ao entrar na primeira vez, aviso e diário. Cada região tem três níveis
     pela distância: perto (tudo carregado e simulado), longe (só os marcos que se veem de longe; zumbis da região guardados como
     número) e muito longe (malhas liberadas da placa de vídeo; só o estado salvo). As malhas voltam uma por quadro, sem travar.
   · G.regioes guarda o estado de cada região (descoberta, visitas, última visita, zumbis vivos e o que cada uma precisa). */

/* ---------- forma do Alto do Rio Claro: o planalto (círculo) e o corredor do vale ---------- */
const ARC={id:'alto',nome:'Alto do Rio Claro',x:50,z:-244,r:64,cw:13,corr:[[30,-128],[38,-152],[48,-168],[60,-182],[66,-198]]};
const MAPA_Z0=ARC.z-ARC.r-6;
function arcCorrD(x,z){const c=ARC.corr;let b=1e9;for(let i=0;i<c.length-1;i++){const d=segDist(x,z,c[i][0],c[i][1],c[i+1][0],c[i+1][1]);if(d<b)b=d;}return b;}
function noPlanalto(x,z,m=0){const dx=x-ARC.x,dz=z-ARC.z;return dx*dx+dz*dz<(ARC.r-m)**2;}
function dentroARC(x,z,m=0){if(noPlanalto(x,z,m))return true;if(x<-4||x>100||z>-96||z<-232)return false;return arcCorrD(x,z)<ARC.cw-m;}
/* enquanto a mata do círculo nasce (VEG_GERANDO), o mapa é o de antes: assim as árvores de sempre nascem nos mesmos lugares */
const dentroMapaBase=dentroMapa;
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){return _dm(x,z,m)||(!VEG_GERANDO&&dentroARC(x,z,m));};}
{const _vm=voltarMapa;voltarMapa=function(e,x0,z0){if(!dentroMapa(x0,z0)){const dx=e.x-ARC.x,dz=e.z-ARC.z,d=Math.hypot(dx,dz);
    if(d<ARC.r+40&&d>1e-3){const k=Math.min(d,ARC.r-0.6)/d;e.x=ARC.x+dx*k;e.z=ARC.z+dz*k;return;}}return _vm(e,x0,z0);};}

/* ---------- lugares do Alto (o 61z_altorio monta cada um) e os patamares planos de cada construção ---------- */
const ARC_L={
  trilha:[[28,-80],[29,-96],[33,-110],[40,-124],[43,-138],[46,-150],[52,-160],[57,-168]],          // trilha de terra (até o pé da encosta)
  degraus:[[57,-168],[60,-174],[63,-181],[66,-189],[68,-197],[70,-203]],                          // degraus de madeira na encosta
  bloqueio:{x:72,z:-208,r:8,b:7},          // bloqueio do Exército no alto da trilha (caixa militar com cronômetro)
  pousada:{x:28,z:-236,r:21,b:9},          // recepção e chalés da Pousada Alto do Rio Claro
  galpao:{x:58,z:-258,r:13,b:8},           // galpão da pousada: o prédio-desafio (fusível, alavanca e cartão)
  campo:{x:90,z:-242,r:10,b:8},            // campo dos passeios de balão
  balao:{x:104,z:-221},                    // balão caído na beira da serra
  posto:{x:92,z:-270,r:9,b:7},             // posto do guarda-parque
  mirante:{x:76,z:-282,r:4,b:5},           // torre do mirante, no pico
  marco:{x:94,z:-283},                     // marco de pedras do pico (esconderijo)
  nascente:{x:46,z:-212},cachoeira:{x:44,z:-191,yTopo:0,yPe:0}};   // nascente, córrego e a queda d'água até o poço do rio
const ARC_PADS=[ARC_L.bloqueio,ARC_L.pousada,ARC_L.galpao,ARC_L.campo,ARC_L.posto,ARC_L.mirante];
/* córrego da nascente até a beira do planalto (onde vira cachoeira) */
const ARC_CORREGO=[[46,-212],[45.5,-205],[44.6,-198],[44,-192.5]];
function arcCorregoD(x,z){let b=1e9;const c=ARC_CORREGO;for(let i=0;i<c.length-1;i++){const d=segDist(x,z,c[i][0],c[i][1],c[i+1][0],c[i+1][1]);if(d<b)b=d;}return b;}

/* ---------- terreno do Alto: serra em volta, patamares planos, leito do córrego (aplicado na grade antes de montar o mundo) ---------- */
(function arcTerrenoAplicar(){
  const g0=(x,z)=>ground(x,z);
  for(const p of ARC_PADS){let s=0,n=0;for(let k=0;k<9;k++){const a=k/8*6.283,rr=k?p.r*0.6:0;s+=g0(p.x+Math.cos(a)*rr,p.z+Math.sin(a)*rr);n++;}p.h=s/n+(p.dh||0);}
  const nasc=ARC_L.nascente;
  for(let j=0;j<=T_N;j++)for(let i=0;i<=T_N;i++){const x=GX[i],z=GX[j];if(x<-60||x>170||z>-176||z<-360)continue;const k=j*TW+i;let h=TH[k];
    // serra: sobe por fora do planalto (norte, leste e oeste); para o sul fica a beira do planalto, com vista para a mata
    const dx=x-ARC.x,dz=z-ARC.z,d=Math.hypot(dx,dz),out=d-ARC.r;
    if(out>0){const dirz=dz/(d||1),wDir=smooth(0.62,0.18,dirz),wCor=smooth(ARC.cw+6,ARC.cw+24,arcCorrD(x,z));
      if(wDir*wCor>0)h+=(15+vnoise(x*0.035+5,z*0.035-9)*20)*smooth(1.5,32,out)*wDir*wCor;}
    // patamares das construções
    for(const p of ARC_PADS){const dd=Math.hypot(x-p.x,z-p.z);if(dd<p.r+p.b)h=lerp(h,p.h,smooth(p.r+p.b,p.r,dd));}
    // leito do córrego: rasga a terra da nascente até a beira (a água corre 0,5 m abaixo das margens)
    {const dc=arcCorregoD(x,z);if(dc<3&&z<-189.5&&z>-215)h-=0.65*smooth(3,0.7,dc);const dn=Math.hypot(x-nasc.x,z-nasc.z);if(dn<4.5)h-=0.45*smooth(4.5,1.6,dn);}
    TH[k]=h;}})();

/* ================= borda de mata fechada ================= */
const BRENHA=[],BRENHA_PEDRAS=[],BORDA_PTS=[];
/* pontos candidatos do limite (com a normal para fora): círculo da mata, planalto, margens do corredor e da estrada de entrada */
function bordaCandidatos(){const L=[],ds=1.7;
  const circ=(cx,cz,r)=>{const n=Math.round(2*Math.PI*r/ds);for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);L.push([cx+c*r,cz+s*r,c,s]);}};
  circ(0,0,MAP_R);circ(ARC.x,ARC.z,ARC.r);
  const C=ARC.corr,w=ARC.cw;for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L0=Math.hypot(dx,dz),nx=-dz/L0,nz=dx/L0,n=Math.max(2,Math.round(L0/ds));
    for(let k=0;k<=n;k++){const t=k/n,x=a[0]+dx*t,z=a[1]+dz*t;L.push([x+nx*w,z+nz*w,nx,nz]);L.push([x-nx*w,z-nz*w,-nx,-nz]);}}
  for(let i=1;i<C.length-1;i++)circ(C[i][0],C[i][1],w);
  for(let x=MAP_R-12;x<=CIDADE.x0+6;x+=ds){const zc=x<168?roadZ(x):8.2;L.push([x,zc+11,0,1]);L.push([x,zc-11,0,-1]);}
  // praia ao norte e ao sul da cidade: o lado de terra da faixa de areia (restinga fechada) e as pontas (costão de pedra)
  if(typeof costaX==='function'){for(let z=-MAR.zJog+1;z<=MAR.zJog-1;z+=ds){const s=costaS(z),k=Math.sqrt(1+s*s),x=costaX(z)-(marLarg(z)+2)*k;L.push([x,z,-1/k,s/k]);L.push([costaX(z)-MAR.largMax-4,z,-1,0]);}
    for(const sz of[-1,1])for(let x=costaX(MAR.zJog)-70;x<=costaX(MAR.zJog)+8;x+=ds)L.push([x,sz*MAR.zJog,0,sz]);}
  return L;}
/* fica só o que é limite de verdade: um pouco para dentro é mapa, um pouco para fora não é */
function bordaPontosCalc(){BORDA_PTS.length=0;for(const q of bordaCandidatos()){const[x,z,nx,nz]=q;if(!dentroMapa(x-nx*0.9,z-nz*0.9)||dentroMapa(x+nx*0.9,z+nz*0.9))continue;BORDA_PTS.push(q);}return BORDA_PTS;}
/* trechos de serra (pedras grandes no meio do mato): noroeste perto da Serra Velha e a serra do Alto */
function bordaSerra(x,z){if(Math.hypot(x-SERRA.x,z-SERRA.z)<90)return true;if(Math.hypot(x-ARC.x,z-ARC.z)<ARC.r+6&&z<ARC.z+30)return true;return vnoise(x*0.02+41,z*0.02-13)>0.68;}
function bordaMontar(){const R=rng(22022);bordaPontosCalc();BRENHA.length=0;BRENHA_PEDRAS.length=0;
  for(let i=0;i<BORDA_PTS.length;i++){const[x,z,nx,nz]=BORDA_PTS[i],tx=-nz,tz=nx;
    const o=0.35+R()*0.5,j=(R()-0.5)*0.6,cx=x+nx*o+tx*j,cz=z+nz*o+tz*j,praia=x>MAP_R+60&&!dentroCidade(x,z,4);
    if(praia&&ground(x,z)<0.3)continue;   // dentro d'água o limite é o mar
    if(praia&&Math.abs(z)>MAR.zJog-3){const s=1.7+R()*0.9;BRENHA_PEDRAS.push({x:cx+nx*0.5,z:cz+nz*0.5,y:ground(cx,cz)-s*0.3,r:R()*6.283,s,t:0.85+R()*0.2});colCircle(x+nx*0.3,z+nz*0.3,1.05,{brenha:true});continue;}
    if(bordaSerra(x,z)&&i%4===0){const s=1.5+R()*0.9;BRENHA_PEDRAS.push({x:cx+nx*0.4,z:cz+nz*0.4,y:ground(cx,cz)-s*0.3,r:R()*6.283,s,t:0.8+R()*0.25});}
    else BRENHA.push({x:cx,z:cz,y:ground(cx,cz)-0.12,r:R()*6.283,s:0.95+R()*0.45,t:0.78+R()*0.32});
    colCircle(x+nx*0.3,z+nz*0.3,1.05,{brenha:true});   // a parede de mato, sem vão (um a cada 1,7 m, raio 1,05)
    if(i%2===0){const o2=2.0+R()*1.4,ex=x+nx*o2+tx*(R()-0.5)*1.4,ez=z+nz*o2+tz*(R()-0.5)*1.4;BRENHA.push({x:ex,z:ez,y:ground(ex,ez)-0.12,r:R()*6.283,s:1.1+R()*0.55,t:0.72+R()*0.3});}
    if(i%5===2){const o3=3.6+R()*2.5,ex=x+nx*o3,ez=z+nz*o3;BRENHA.push({x:ex,z:ez,y:ground(ex,ez)-0.12,r:R()*6.283,s:1.2+R()*0.6,t:0.7+R()*0.3});}}}
/* desenho: moita fechada (vários tufos escuros embolados, galhos secos e cipó) */
function geoBrenha(){const g=new GB(4096,8),R=rng(2207),v=[lin(0x2a4220),lin(0x33502a),lin(0x23381c),lin(0x3d5a2c)],sec=lin(0x5a4a36);
  const tufos=[[0,0.85,0,1.0,0.95],[0.9,0.6,0.3,0.8,0.8],[-0.85,0.65,0.25,0.8,0.85],[0.3,0.55,-0.9,0.75,0.7],[-0.35,0.6,0.85,0.75,0.75],[0.15,1.55,0.1,0.7,0.7],[0.95,0.4,-0.7,0.55,0.55],[-0.9,0.4,-0.6,0.6,0.55]];
  tufos.forEach((t,i)=>add(g,icoSubTris(t[3],0.42,R,1),mat(t[0],t[2]===undefined?0:t[1],t[2],R()*0.6,R()*6,R()*0.6,1.15,t[4],1.15),v[i%4],{j:0.22,rnd:R,crease:85}));
  for(let i=0;i<9;i++){const a=i/9*6.283+R()*0.4,l=0.9+R()*0.7;add(g,cylTris(0.012,0.03,l,4),alignY(Math.cos(a)*0.7,0.2+R()*0.6,Math.sin(a)*0.7,Math.cos(a)*0.8,0.9+R()*0.5,Math.sin(a)*0.8),sec,{j:0.1,rnd:R});}
  for(let i=0;i<5;i++){const a=R()*6.283;add(g,cylTris(0.01,0.01,1.6,3),alignY(Math.cos(a)*1.1,0.1,Math.sin(a)*1.1,-Math.cos(a)*0.4,1,-Math.sin(a)*0.4),lin(0x3a4a26),{j:0.08,rnd:R});}
  return g.data();}
let brenhaT=0;
INIT_MALHAS.push(function brenhaMalhas(){const V=vegGeometry();MESH.brenha=instMesh(geoBrenha(),2400);MESH.brenha.sway=0.02;MESH.brenhaPedra=instMesh(V.rock,700);
  // mais vaga para as pedras, arbustos e coletáveis do Alto
  for(const[k,src,max]of[['rock','rock',700],['bush','bush',900],['berries','berries',900],['pedra','pedra',320],['galho','galho',320],['cogumelo','cogumelo',160],['fibra','fibra',320]]){const sw=MESH[k]&&MESH[k].sway||0;MESH[k]=instMesh(V[src],max);MESH[k].sway=sw;}});
{const _rv=rebuildVeg;rebuildVeg=function(force){const ia=vegT;_rv.apply(this,arguments);if(!MESH.brenha)return;brenhaT-=1;if(!force&&brenhaT>0&&vegT===ia-1)return;brenhaT=30;
  const far=GF().arvLonge+25,f2=far*far,L=[],Lp=[];for(const b of BRENHA)if(d2(b.x,b.z,P.x,P.z)<f2)L.push(b);for(const b of BRENHA_PEDRAS)if(d2(b.x,b.z,P.x,P.z)<f2)Lp.push(b);
  instUpload(MESH.brenha,L);instUpload(MESH.brenhaPedra,Lp);};}
DESENHO.opaco.push(function brenhaDesenho(Pg){if(!MESH.brenha||(!MESH.brenha.n&&!MESH.brenhaPedra.n))return;setLit(PLI);drawInst(PLI,MESH.brenha);drawInst(PLI,MESH.brenhaPedra);setLit(Pg);});

/* ---------- vegetação do Alto: árvores, pedras, arbustos, capim, flores, samambaias, folhas e coletáveis ---------- */
function arcLivre(x,z,m){for(const p of ARC_PADS)if(Math.hypot(x-p.x,z-p.z)<p.r+m)return false;
  if(arcCorregoD(x,z)<3+m)return false;if(Math.hypot(x-ARC_L.balao.x,z-ARC_L.balao.z)<9+m)return false;
  const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+m*0.6+0.6)return false;for(let i=0;i<ARC_L.degraus.length-1;i++){const a=ARC_L.degraus[i],b=ARC_L.degraus[i+1];if(segDist(x,z,a[0],a[1],b[0],b[1])<1.8+m*0.5)return false;}
  if(ruralEm(x,z,m*0.5))return false;if(pointBlocked(x,z,m*0.6))return false;return true;}
/* mata do planalto em manchas (mata de araucária) e campos abertos (campo de altitude) */
function arcMata(x,z){const m=smooth(0.36,0.6,vnoise(x*0.028+13,z*0.028-21));return z>-216?Math.max(m,smooth(-216,-200,z)*0.85):m;}   // a encosta do sul (beira do planalto e vale da cachoeira) tem mata
function arcVegetacao(){const R=rng(22221),T0=TREES.length;let id=TREES.reduce((m,t)=>Math.max(m,t.id),0)+1;
  // as árvores de sempre que ficaram dentro do corredor do vale (fora do círculo) ganham colisão agora
  for(const t of TREES){if(t.agua||Math.hypot(t.x,t.z)<MAP_R+6||dentroMapaBase(t.x,t.z,-3)||!dentroARC(t.x,t.z,-3))continue;colCircle(t.x,t.z,TREE_R*t.s,{tree:t});}
  const G2=new Map(),K=(gx,gz)=>(gx+500)*1000+(gz+500),near=(x,z,d)=>{const gx=Math.floor(x/4),gz=Math.floor(z/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=G2.get(K(gx+a,gz+b));if(l)for(const p of l)if((p[0]-x)**2+(p[1]-z)**2<d*d)return true;}return false;};
  const marca=(x,z)=>{const k=K(Math.floor(x/4),Math.floor(z/4));if(!G2.has(k))G2.set(k,[]);G2.get(k).push([x,z]);};
  for(const t of TREES)if(t.z<-140&&t.x>-40&&t.x<150)marca(t.x,t.z);
  const box={x0:ARC.x-ARC.r-34,x1:ARC.x+ARC.r+34,z0:ARC.z-ARC.r-34,z1:-150};
  // árvores: no planalto e no corredor (com colisão) e na serra em volta (só de enfeite, fora do alcance)
  for(let tries=0;tries<26000&&TREES.length<T0+900;tries++){const x=box.x0+R()*(box.x1-box.x0),z=box.z0+R()*(box.z1-box.z0),dentro=dentroARC(x,z,0),dc=Math.hypot(x-ARC.x,z-ARC.z);
    if(Math.hypot(x,z)<180&&!dentro)continue;                      // perto do círculo a mata de antes já cobre
    if(!dentro&&dc>ARC.r+32)continue;if(dentro&&!arcLivre(x,z,2.2))continue;
    const dens=dentro?lerp(0.16,0.95,arcMata(x,z)):0.75;if(R()>dens)continue;if(near(x,z,dentro?2.9:2.5))continue;marca(x,z);
    const r0=R(),kind=r0<0.62?0:r0<0.86?1:r0<0.95?3:2,s=R()<0.12?2.1+R()*0.8:1.1+R()*0.95;
    const t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.82+R()*0.3,alto:true};if(kind===1&&R()<0.15){t.tr=1.25*t.t;t.tg=1.0*t.t;t.tb=0.6*t.t;}
    TREES.push(t);if(dentroMapa(x,z,-3))colCircle(x,z,TREE_R*s,{tree:t});}
  // pedras (as de dentro dão para quebrar como as outras)
  for(let i=0;i<260&&ROCKS.length<1e4;i++){const x=box.x0+R()*(box.x1-box.x0),z=box.z0+R()*(box.z1-box.z0);if(!noPlanalto(x,z,2)||!arcLivre(x,z,2.0))continue;
    const s=0.55+Math.pow(R(),2)*1.3,rk={id:ROCKS.length,x,z,y:ground(x,z)-s*0.25,s,r:R()*6.283,hp:4,alive:true,t:0.82+R()*0.25,alto:true};ROCKS.push(rk);colCircle(x,z,0.85*s,{rock:rk});if(ROCKS.filter(q=>q.alto).length>=70)break;}
  for(let i=0;i<500;i++){const x=box.x0+R()*(box.x1-box.x0),z=box.z0+R()*(box.z1-box.z0);if(!dentroARC(x,z,1.5)||!arcLivre(x,z,1.2))continue;
    BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s:0.8+R()*0.5,r:R()*6.283,frutas:R()<0.55,cresce:0,t:0.85+R()*0.3,alto:true});if(BUSHES.filter(b=>b.alto).length>=110)break;}
  const pk=(kind,n)=>{let k=0;for(let i=0;i<n*8&&k<n;i++){const x=box.x0+R()*(box.x1-box.x0),z=box.z0+R()*(box.z1-box.z0);if(!dentroARC(x,z,2)||!arcLivre(x,z,0.8))continue;
    PICKS.push({id:PICKS.length,kind,x,z,y:ground(x,z),r:R()*6.283,s:0.8+R()*0.5,alive:true,t:0.9+R()*0.2,alto:true});k++;}};
  pk('pedra',36);pk('galho',36);pk('cogumelo',16);pk('fibra',34);
  // chão: capim e flores nos campos, samambaias e folhas na mata
  for(let i=0;i<14000;i++){const x=box.x0+R()*(box.x1-box.x0),z=box.z0+R()*(box.z1-box.z0);if(!dentroARC(x,z,-1))continue;const m=arcMata(x,z),ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.3)continue;
    if(arcCorregoD(x,z)<1.6||pointBlocked(x,z,0.35)||ruralCasaEm(x,z,0.3))continue;
    if(R()<0.55-m*0.3)GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.7+R()*0.6,t:0.8+R()*0.4,alto:true});
    else if(m<0.4&&vnoise(x*0.07+5,z*0.07-9)>0.5&&R()<0.5)FLORES.push({x,z,y:ground(x,z),r:R()*6.283,s:0.75+R()*0.5,t:0.85+R()*0.3,tr:[1,1,0.72,1,0.5][i%5],tg:[1,0.86,0.46,0.48,0.62][i%5],tb:[1,0.22,1,0.62,1][i%5],alto:true});
    else if(m>0.55&&R()<0.35)SAMAMBAIAS.push({x,z,y:ground(x,z)-0.03,r:R()*6.283,s:0.7+R()*0.7,t:0.8+R()*0.35,alto:true});
    else if(m>0.45&&R()<0.3)FOLHAS_CHAO.push({x,z,y:ground(x,z)+0.01,r:R()*6.283,s:0.8+R()*0.6,t:0.85+R()*0.3,alto:true});}
  // troncos caídos na mata do planalto (dá para andar em cima)
  let nt=0;for(let i=0;i<300&&nt<10;i++){const x=ARC.x+(R()*2-1)*ARC.r,z=ARC.z+(R()*2-1)*ARC.r;if(!noPlanalto(x,z,6)||arcMata(x,z)<0.6||!arcLivre(x,z,2.5))continue;
    const yaw=R()*6.283,L=3.5+R()*5,rad=0.22+R()*0.22,dx=Math.sin(yaw)*L/2,dz=Math.cos(yaw)*L/2;if(pointBlocked(x+dx,z+dz,0.6)||pointBlocked(x-dx,z-dz,0.6)||!arcLivre(x+dx,z+dz,1)||!arcLivre(x-dx,z-dz,1))continue;
    const t={x,z,yaw,L,rad,ax:x-dx,az:z-dz,ay:ground(x-dx,z-dz)+rad*0.75,bx:x+dx,bz:z+dz,by:ground(x+dx,z+dz)+rad*0.75,musgo:R()<0.6,alto:true};TRONCOS.push(t);nt++;
    supAdd({t:'seg',ax:t.ax,az:t.az,ay:t.ay,bx:t.bx,bz:t.bz,by:t.by,r0:t.rad,r1:t.rad*0.92,larg:0.8,dono:'tronco'});
    if(t.rad>0.3)colBox(t.x,t.z,t.rad*0.9,t.L/2,t.yaw,{y0:Math.min(t.ay,t.by)-1,y1:Math.max(t.ay,t.by)+t.rad*0.9,tronco:t});}}
/* a vegetação do Alto entra depois da vegetação de sempre (a mata do círculo nasce igual a antes; a borda e a trilha entram
   depois do mundo montado, no 61z, para não mudar o sorteio de nada que já existia) */
{const _pv=placeVegetation;placeVegetation=function(){_pv.apply(this,arguments);try{arcVegetacao();}catch(e){console.error('vegetação do Alto',e);}};}

/* ================= regiões ================= */
const REGIOES=[
  {id:'alto',nome:'Alto do Rio Claro',desc:'planalto da nascente do rio: pousada, galpão trancado, balão caído, mirante e o bloqueio do Exército',em:(x,z)=>dentroARC(x,z,0)&&z<-176,x:ARC.x,z:ARC.z,r:ARC.r,niveis:true,aviso:true},
  {id:'litoral',nome:'Litoral e Porto',desc:'praia, cais, navio, contêineres e naufrágios',em:(x,z)=>typeof costaD==='function'&&x>CIDADE.x1-2&&costaD(x,z)>-46,x:370,z:0,r:120},
  {id:'cidade',nome:'Cidade abandonada',desc:'prédios, metrô, hospital e armazéns',em:(x,z)=>dentroCidade(x,z,0),x:254,z:5,r:120},
  {id:'vila',nome:'Vila São José',desc:'casas, farmácia, mercadinho, bar e a igreja',em:(x,z)=>Math.hypot(x-62,z+80)<46,x:62,z:-80,r:46},
  {id:'serra',nome:'Serra Velha',desc:'morros de pedra, a mina velha e a base militar',em:(x,z)=>Math.hypot(x+100,z+70)<52,x:-100,z:-70,r:52},
  {id:'fazenda',nome:'Fazenda e pastos',desc:'casa, celeiro, plantação e pasto',em:(x,z)=>Math.hypot(x+72,z-60)<42,x:-72,z:60,r:42},
  {id:'lago',nome:'Lago Serra Azul',desc:'lago com ilhota, cais e a cabana do pescador',em:(x,z)=>Math.hypot(x-66,z-104)<38,x:66,z:104,r:38},
  {id:'estrada',nome:'Estrada da cidade',desc:'o asfalto que liga a mata à cidade, com o posto de gasolina',em:(x,z)=>x>78&&x<CIDADE.x0&&Math.abs(z-(x<168?roadZ(x):8.2))<16,x:130,z:6,r:50},
  {id:'mata',nome:'Mata do Rio Claro',desc:'a mata em volta da clareira, com o rio, os sítios e a torre de rádio',em:(x,z)=>x*x+z*z<(MAP_R+2)**2||dentroARC(x,z,0),x:0,z:0,r:MAP_R}];
const REG_NIVEL={perto:0,longe:1,muitoLonge:2},REG_DIST={perto:110,longe:280,histerese:15};
function regD(){if(!G.regioes||typeof G.regioes!=='object')G.regioes={};for(const r of REGIOES)if(!G.regioes[r.id])G.regioes[r.id]={descoberta:0,visitas:0,ultima:0};return G.regioes;}
function regiaoEm(x,z){for(const r of REGIOES)if(r.em(x,z))return r;return null;}
const regiaoById=id=>REGIOES.find(r=>r.id===id);
/* nível de detalhe de uma região pela distância do jogador até a beira dela (com folga para não ficar trocando) */
function regNivelCalc(r,atual){const d=Math.max(0,Math.hypot(P.x-r.x,P.z-r.z)-r.r),h=REG_DIST.histerese;
  if(atual==='perto')return d<REG_DIST.perto+h?'perto':d<REG_DIST.longe?'longe':'muitoLonge';
  if(atual==='longe')return d<REG_DIST.perto-h?'perto':d<REG_DIST.longe+h?'longe':'muitoLonge';
  return d<REG_DIST.perto?'perto':d<REG_DIST.longe-h?'longe':'muitoLonge';}
/* quem quer saber quando o nível muda (o Alto monta e libera as malhas, povoa e guarda os zumbis) */
const REG_GANCHOS=[];   // f(regiao, nivelNovo, nivelAntes)
const REG_ESTADO={};    // nível atual de cada região (não vai no save: recalcula na hora)
let regT=0,regAtual=null;
function regPasso(dt,forca){regT-=dt;if(regT>0&&!forca)return;regT=0.5;const D=regD();
  for(const r of REGIOES){if(!r.niveis)continue;const antes=REG_ESTADO[r.id]||null,nv=regNivelCalc(r,antes||'muitoLonge');
    if(nv!==antes){REG_ESTADO[r.id]=nv;for(const f of REG_GANCHOS){try{f(r,nv,antes);}catch(e){console.error('região',r.id,e);}}}}
  if(!P.alive||G.modo!=='jogo')return;const r=regiaoEm(P.x,P.z),id=r?r.id:null;
  if(id!==regAtual){const ant=regAtual;regAtual=id;if(!r)return;const S=D[r.id];S.visitas=(S.visitas||0)+1;S.ultima=Math.round(G.tm||0);
    // só a região nova avisa (as de antes já têm os avisos dos lugares delas): na primeira vez, aviso e diário; depois, o nome
    if(!S.descoberta){S.descoberta=G.dia||1;if(r.aviso){if(typeof diarioDescobre==='function')diarioDescobre('lugar','reg_'+r.id,r.nome,40);
      toast('corpo','Região nova: '+r.nome+'. '+r.desc[0].toUpperCase()+r.desc.slice(1)+'.');}}
    else if(r.aviso&&ant!==null&&r.id!==ant)feed(r.nome);}}
PASSOS.push(dt=>regPasso(dt));
V8.novo.regioes=()=>{G.regioes=null;regD();regAtual=null;};
V8.salvar.regioes=()=>regD();
V8.carregar.regioes=s=>{G.regioes=s&&typeof s==='object'?s:null;regD();regAtual=null;regT=0;};

/* ---------- mapa grande: o planalto, o corredor do vale, a serra em volta e os nomes das regiões ---------- */
MAPA_DESENHOS.push(function mapaAlto(g,X,Y,k,n,range){
  g.fillStyle=n>0.5?'#1a2418':'#2f3a28';g.beginPath();g.arc(X(ARC.x),Y(ARC.z),(ARC.r+26)*k,Math.PI*0.95,Math.PI*2.05);g.fill();   // serra
  g.fillStyle=n>0.5?'#1d2a1c':'#24331e';g.beginPath();g.arc(X(ARC.x),Y(ARC.z),ARC.r*k,0,Math.PI*2);g.fill();
  g.strokeStyle=g.fillStyle;g.lineCap='round';g.lineJoin='round';g.lineWidth=ARC.cw*2*k;g.beginPath();ARC.corr.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();
  if(range<1e3)return;const D=regD();g.font=`600 italic ${Math.max(11,Math.round(g.canvas.width/78))}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  for(const r of REGIOES){if(r.id==='mata'||r.id==='estrada'||!D[r.id]||!D[r.id].descoberta)continue;let tx=X(r.x);const ty=Y(r.z)+(r.id==='alto'?-r.r*k*0.55:r.r*k*0.62);
    {const m=g.measureText(r.nome).width/2+4;tx=Math.max(m,Math.min(g.canvas.width-m,tx));}   // nome perto da beira do mapa (Mata dos Morros) não sai cortado
    g.lineWidth=3;g.strokeStyle='rgba(7,10,9,.7)';g.strokeText(r.nome,tx,ty);g.fillStyle='rgba(232,214,160,.92)';g.fillText(r.nome,tx,ty);}});

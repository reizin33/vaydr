/* ================= Mata dos Morros: a borda de fora aberta (Parte 2 do prompt geral, 05/11/2026) =================
   Antes o mapa acabava no círculo da mata (150 m da clareira): do lado de fora havia mata desenhada e a parede de mato fechado.
   Agora, a sudeste do lago, ao sul, a oeste e a noroeste (longe da cidade, do corredor do Alto do Rio Claro e do mar), a mata
   continua morro acima até uns 205 m da clareira. A parede de mato fechado foi para a beira nova. As árvores que já estavam
   desenhadas ali ganham colisão e a faixa, que era fechada de propósito, rareia como a mata de dentro (dá para andar e dirigir);
   ganha mais árvores, moitas, pedras, capim, samambaias, folhas e coletáveis, três regiões de bichos e zumbis andando de dia. Até o mundo de antes nascer inteiro (MORROS_LIGADO) o mapa é o de antes, então tudo o que já
   existia nasce no mesmo lugar (jogos salvos continuam valendo); as árvores novas entram no fim da lista, com números novos.
   Ângulos em graus pelo atan2(z,x): 0 = leste (cidade), 90 = sul, 180 = oeste, 270 = norte (corredor do Alto). */
const MORROS={ext:56,a0:50,a1:262,rampa:16};
/* quanto a mata avança além do círculo no ângulo a */
function morrosExt(a){a=((a%360)+360)%360;if(a<=MORROS.a0||a>=MORROS.a1)return 0;
  const k=Math.min(smooth(MORROS.a0,MORROS.a0+MORROS.rampa,a),smooth(MORROS.a1,MORROS.a1-MORROS.rampa,a)),r=a*Math.PI/180;
  return MORROS.ext*k*(0.86+0.09*Math.sin(r*5+0.7)+0.05*Math.sin(r*11+2.1));}
const morrosAng=(x,z)=>Math.atan2(z,x)*180/Math.PI;
function raioMapaAng(a){return MAP_R+morrosExt(a);}
/* a mata nova só passa a valer depois que o mundo de antes nasceu inteiro (fim do buildWorld): assim as pedras da serra, a
   trilha do Alto, a volta da cidade e os galhos secos nascem nos mesmos lugares da v9.5.1 e os jogos salvos (que guardam
   árvores, pedras e moitas pelo número) continuam valendo. Antes era só durante a mata do círculo (VEG_GERANDO) e as pedras da
   serra mudavam de lugar (conferido em 10/11) */
let MORROS_LIGADO=false;
raioMapaEm=function(x,z){return MORROS_LIGADO?raioMapaAng(morrosAng(x,z)):MAP_R;};
const raioMapaMax=()=>MAP_R+MORROS.ext;
/* dentro da faixa nova (com folga m para dentro; m negativo = um pouco para fora) */
function dentroMorros(x,z,m=0){const r=Math.hypot(x,z);if(r<MAP_R-4)return false;const e=morrosExt(morrosAng(x,z));return e>0&&r<MAP_R+e-m;}
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){return _dm(x,z,m)||(MORROS_LIGADO&&dentroMorros(x,z,m));};}
/* a mata fechada do fim do mapa vai para a beira nova (os pontos do círculo que ficaram para dentro somem no bordaPontosCalc) */
{const _bc=bordaCandidatos;bordaCandidatos=function(){const L=_bc.apply(this,arguments),ds=1.7;
  for(let a=MORROS.a0;a<=MORROS.a1;){const r=raioMapaAng(a),ra=a*Math.PI/180,c=Math.cos(ra),s=Math.sin(ra),
      dr=(raioMapaAng(a+0.25)-raioMapaAng(a-0.25))/(0.5*Math.PI/180),tx=dr*c-r*s,tz=dr*s+r*c,tl=Math.hypot(tx,tz)||1;
    L.push([r*c,r*s,tz/tl,-tx/tl]);a+=ds/Math.max(20,tl)*180/Math.PI;}
  return L;};}
/* ---------- a mata nova ---------- */
let MORROS_INFO=null;
function morrosMontar(){const R=rng(52021);let id=TREES.reduce((m,t)=>Math.max(m,t.id|0),-1)+1;
  const inf={colisaoNova:0,raleadas:0,raleadasCirculo:0,arvores:0,pedras:0,moitas:0,capim:0,samambaias:0,folhas:0,coletaveis:0};
  const novo=(x,z,m)=>dentroMorros(x,z,m)&&Math.hypot(x,z)>MAP_R-1;
  /* a faixa de mata que ficava fora do mapa era fechada de propósito (a parede verde do fim do mapa), com o dobro de árvores da
     mata de dentro. Agora é mata de andar e de dirigir: rareia como a de dentro, com trechos abertos e trechos fechados (mancha de
     ruído), e continua fechada nos últimos 8 m antes da beira nova. As árvores que já tinham colisão (até 6 m do círculo) ficam. */
  const aberto=(x,z)=>vnoise(x*0.045+17,z*0.045-23);
  for(const t of TREES){if(t.agua||t.alto||t.anel||t.morros||Math.hypot(t.x,t.z)<MAP_R+6||!dentroMorros(t.x,t.z,8))continue;
    if(aberto(t.x,t.z)<0.42||hash2(Math.floor(t.x*13),Math.floor(t.z*7))<0.38){t.agua=true;t.morrosRalo=true;inf.raleadas++;}}
  /* a faixa do círculo antigo (os últimos 8 m de dentro, de mata cheia, e os 6 m de fora que já tinham colisão) era a parede do fim
     do mapa. Nos lados que abriram ela ficou no meio do caminho, com quase o dobro de árvores da mata de dentro (teste p233b, 10/11):
     rareia até ficar como a mata de dentro, e as árvores que somem perdem a colisão */
  for(const t of TREES){if(t.agua||t.alto||t.anel||t.morros)continue;const r=Math.hypot(t.x,t.z);if(r<MAP_R-8||r>=MAP_R+6||morrosExt(morrosAng(t.x,t.z))<12)continue;
    if(aberto(t.x,t.z)<0.3||hash2(Math.floor(t.x*11),Math.floor(t.z*5))<0.22){t.agua=true;t.morrosRalo=true;inf.raleadasCirculo++;
      for(const c of colQuery(t.x,t.z,0.2))if(c.tree===t){colRemove(c);break;}}}
  /* um ponto sorteado na faixa (e até 30 m além da beira nova, para a mata continuar no morro de fora) */
  const ponto=(fora)=>{for(let k=0;k<12;k++){const a=MORROS.a0+R()*(MORROS.a1-MORROS.a0),e=morrosExt(a);if(e<2)continue;
      const r0=MAP_R-1,r1=MAP_R+e+(fora||0),r=Math.sqrt(r0*r0+R()*(r1*r1-r0*r0)),ra=a*Math.PI/180;return[Math.cos(ra)*r,Math.sin(ra)*r,r,e];}return null;};
  /* árvores que já estavam desenhadas e agora ficam no caminho: ganham colisão */
  for(const t of TREES){if(t.agua||t.alto||t.anel||Math.hypot(t.x,t.z)<MAP_R+6||!dentroMorros(t.x,t.z,-3))continue;colCircle(t.x,t.z,TREE_R*t.s,{tree:t});inf.colisaoNova++;}
  /* mais árvores: a mata de sempre ia até ~178 m; daí até a beira (e um pouco além) nasce mata nova, fechada perto da beira */
  const G=new Map(),K=(x,z)=>Math.floor(x/4)*100000+Math.floor(z/4),marca=(x,z)=>{const k=K(x,z);if(!G.has(k))G.set(k,[]);G.get(k).push([x,z]);};
  for(const t of TREES)if(!t.agua&&Math.hypot(t.x,t.z)>MAP_R-12)marca(t.x,t.z);
  const perto=(x,z,d)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=G.get(K(x+a*4,z+b*4));if(l)for(const p of l)if((p[0]-x)**2+(p[1]-z)**2<d*d)return true;}return false;};
  /* no miolo da faixa (dentro do mapa e antes dos 8 m fechados da beira) entram no máximo 240 árvores novas: com mais que isso
     a caminhonete não passava (teste p233b, 07/11) */
  for(let tries=0,miolo=0;tries<60000&&inf.arvores<1500;tries++){const q=ponto(30);if(!q)continue;const[x,z,r,e]=q;if(r<176)continue;
    if(typeof dentroARC==='function'&&dentroARC(x,z,-8))continue;if(!freeSpot(x,z,3.2))continue;
    const dentro=r<MAP_R+e,meio=dentro&&r<=MAP_R+e-8;if(meio&&miolo>=240)continue;
    const dens=!dentro?0.8:!meio?1:lerp(0.12,0.7,aberto(x,z));if(R()>dens||perto(x,z,dentro?2.75:2.6))continue;marca(x,z);if(meio)miolo++;
    const r0=R(),kind=r0<0.66?0:r0<0.84?1:r0<0.95?3:2,s=R()<0.12?2.1+R()*0.8:1.15+R()*0.9;
    const t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.82+R()*0.3,morros:true};if(kind===1&&R()<0.15){t.tr=1.25*t.t;t.tg=1.0*t.t;t.tb=0.6*t.t;}
    TREES.push(t);if(dentroMapa(x,z,-3))colCircle(x,z,TREE_R*s,{tree:t});inf.arvores++;}
  /* pedras, moitas e coletáveis só dentro da faixa */
  for(let i=0;i<1400&&inf.pedras<80;i++){const q=ponto(0);if(!q)continue;const[x,z]=q;if(!novo(x,z,2)||!freeSpot(x,z,2.4))continue;
    const s=0.5+Math.pow(R(),2)*1.25,rk={id:ROCKS.length,x,z,y:ground(x,z)-s*0.25,s,r:R()*6.283,hp:4,alive:true,t:0.82+R()*0.25,morros:true};ROCKS.push(rk);colCircle(x,z,0.85*s,{rock:rk});inf.pedras++;}
  for(let i=0;i<3000&&inf.moitas<200;i++){const q=ponto(0);if(!q)continue;const[x,z]=q;if(!novo(x,z,1.5)||!freeSpot(x,z,1.4))continue;
    BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s:0.8+R()*0.5,r:R()*6.283,frutas:R()<0.6,cresce:0,t:0.85+R()*0.3,morros:true});inf.moitas++;}
  const pk=(kind,n)=>{let k=0;for(let i=0;i<n*12&&k<n;i++){const q=ponto(0);if(!q)continue;const[x,z]=q;if(!novo(x,z,2)||!freeSpot(x,z,0.8))continue;
    PICKS.push({id:PICKS.length,kind,x,z,y:ground(x,z),r:R()*6.283,s:0.8+R()*0.5,alive:true,t:0.9+R()*0.2,morros:true});k++;inf.coletaveis++;}};
  pk('pedra',40);pk('galho',48);pk('cogumelo',20);pk('fibra',40);
  /* chão: capim nas clareiras, samambaias e folhas na mata (um pouco além da beira, para não aparecer um corte) */
  for(let i=0;i<30000&&inf.capim<9000;i++){const q=ponto(4);if(!q)continue;const[x,z]=q;if(!novo(x,z,-4))continue;const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.3)continue;
    if(pointBlocked(x,z,0.35)||ruralCasaEm(x,z,0.3)||(RIO.ok&&aguaPerto(x,z,0.4)))continue;const m=vnoise(x*0.05+3,z*0.05-8);
    if(m<0.62)GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.7+R()*0.6,t:0.8+R()*0.4,morros:true}),inf.capim++;
    else if(R()<0.4&&inf.samambaias<1600)SAMAMBAIAS.push({x,z,y:ground(x,z)-0.03,r:R()*6.283,s:0.7+R()*0.7,t:0.8+R()*0.35,morros:true}),inf.samambaias++;
    else if(R()<0.4&&inf.folhas<1800)FOLHAS_CHAO.push({x,z,y:ground(x,z)+0.01,r:R()*6.283,s:0.8+R()*0.6,t:0.85+R()*0.3,morros:true}),inf.folhas++;}
  MORROS_INFO=inf;return inf;}
/* liga a mata nova, refaz a parede de mato fechado (que o mundo de antes montou no círculo) na beira nova e monta a mata */
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);MORROS_LIGADO=true;
  try{for(const c of COLL.filter(c=>c.brenha))colRemove(c);bordaMontar();}catch(e){console.error('beira nova',e);}
  try{morrosMontar();}catch(e){console.error('mata dos morros',e);}return r;};}
/* ---------- bichos: três regiões novas (a população entra no save pelo jeito de sempre) ---------- */
ZONAS_FAUNA.push(
  {id:'morrosOeste',nome:'Morros do Oeste',x:-182,z:-6,r:30,hab:'mata fechada no morro',f:{cervo:3,javali:3,lobo:2,coelho:2}},
  {id:'morrosSul',nome:'Morros do Sul',x:-36,z:182,r:30,hab:'mata e campo no morro',f:{cervo:3,coelho:3,raposa:2,javali:2}},
  {id:'morrosNoroeste',nome:'Morros do Noroeste',x:-128,z:-136,r:28,hab:'morro de pedra e mata',f:{cabra:4,lobo:3,urso:1}});
/* ---------- zumbis andando de dia na mata nova (como os da mata do círculo) ---------- */
function morrosZumbis(){const R=Math.random;let k=0;
  for(let t=0;t<40&&k<5;t++){const a=MORROS.a0+R()*(MORROS.a1-MORROS.a0),e=morrosExt(a);if(e<15)continue;const ra=a*Math.PI/180,rr=MAP_R+5+R()*(e-12),x=Math.cos(ra)*rr,z=Math.sin(ra)*rr;
    if(Math.hypot(x-P.x,z-P.z)<30||!pontoLivre(x,z))continue;if(criarZ(R()<0.85?'walker':'runner',x,z))k++;}
  return k;}
{const _pd=popularDia;popularDia=function(){const r=_pd.apply(this,arguments);try{morrosZumbis();}catch(e){console.error('zumbis dos morros',e);}return r;};}
/* ---------- região (descoberta, diário e nome no mapa) ---------- */
{const i=REGIOES.findIndex(r=>r.id==='mata');REGIOES.splice(i<0?REGIOES.length:i,0,{id:'morros',nome:'Mata dos Morros',
  desc:'a mata que sobe os morros em volta, ao sul, a oeste e a noroeste da clareira',em:(x,z)=>Math.hypot(x,z)>=MAP_R&&dentroMorros(x,z,0),x:-178,z:-20,r:20});}

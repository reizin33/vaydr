/* ================= A volta da cidade aberta (pedido do Himalaia) =================
   Antes o mapa acabava na linha do tapume da quarentena: do lado de fora havia mata e morro desenhados, mas uma parede invisível.
   Agora uma faixa em volta da cidade é andável: a oeste, a mata entre o círculo da mata e a cidade (46 m); ao norte e ao sul, a
   encosta dos morros (28 m). O fim do mapa (a mata fechada) foi para a beira dessa faixa, e o tapume ganhou 4 buracos no fim de
   ruas (14_cidade: CERCO_BRECHAS). As árvores que já estavam desenhadas a oeste passam a ter colisão, e a faixa ganhou árvores,
   moitas, pedras, capim e coletáveis. Enquanto a mata do círculo nasce (VEG_GERANDO) o mapa é o de antes, então tudo o que já
   existia nasce no mesmo lugar (jogos salvos continuam valendo). */
const ANEL={x0:CIDADE.x0-46,x1:CIDADE.x1,z0:CIDADE.z0-28,z1:CIDADE.z1+28};
function dentroAnel(x,z,m=0){return x>ANEL.x0+m&&x<ANEL.x1-m&&z>ANEL.z0+m&&z<ANEL.z1-m;}
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){return _dm(x,z,m)||(!VEG_GERANDO&&dentroAnel(x,z,m));};}
/* a mata fechada do fim do mapa acompanha a beira da faixa nova (os pontos que ficaram para dentro somem sozinhos no bordaPontosCalc) */
{const _bc=bordaCandidatos;bordaCandidatos=function(){const L=_bc.apply(this,arguments),ds=1.7;
  for(let z=ANEL.z0;z<=ANEL.z1;z+=ds)L.push([ANEL.x0,z,-1,0]);
  for(let x=ANEL.x0;x<=ANEL.x1+24;x+=ds){L.push([x,ANEL.z0,0,-1]);L.push([x,ANEL.z1,0,1]);}
  return L;};}
let ANEL_INFO=null;
function anelMontar(){const R=rng(26110),T0=TREES.length;let id=TREES.reduce((m,t)=>Math.max(m,t.id|0),-1)+1;
  const novo=(x,z,m)=>dentroAnel(x,z,m)&&!dentroCidade(x,z,-2)&&Math.hypot(x,z)>MAP_R-2;   // a faixa nova (o círculo já tem a mata dele)
  const inf={colisaoNova:0,arvores:0,pedras:0,moitas:0,capim:0,coletaveis:0};
  /* árvores desenhadas que agora ficam no caminho: ganham colisão (antes eram só enfeite, fora do alcance) */
  for(const t of TREES){if(t.agua||t.alto||Math.hypot(t.x,t.z)<MAP_R+6||dentroMapaBase(t.x,t.z,-3)||!dentroAnel(t.x,t.z,-3))continue;colCircle(t.x,t.z,TREE_R*t.s,{tree:t});inf.colisaoNova++;}
  /* mata nova onde não tinha (encostas do norte e do sul e os cantos de oeste): mais rala perto do tapume */
  const G=new Map(),K=(x,z)=>Math.floor(x/4)*100000+Math.floor(z/4);const marca=(x,z)=>{const k=K(x,z);if(!G.has(k))G.set(k,[]);G.get(k).push([x,z]);};
  for(const t of TREES)if(dentroAnel(t.x,t.z,-6))marca(t.x,t.z);
  const perto=(x,z,d)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=G.get(K(x+a*4,z+b*4));if(l)for(const p of l)if((p[0]-x)**2+(p[1]-z)**2<d*d)return true;}return false;};
  for(let tries=0;tries<20000&&inf.arvores<260;tries++){const x=ANEL.x0+R()*(ANEL.x1-ANEL.x0),z=ANEL.z0+R()*(ANEL.z1-ANEL.z0);if(!novo(x,z,1.5)||!freeSpot(x,z,3.2))continue;
    const dc=distCidade(x,z),dens=clamp((dc-6)/22,0.08,0.75);if(R()>dens||perto(x,z,3.0))continue;marca(x,z);
    const r0=R(),kind=r0<0.6?0:r0<0.85?1:r0<0.95?3:2,s=R()<0.1?2.0+R()*0.7:1.1+R()*0.9;
    const t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.82+R()*0.3,anel:true};if(kind===1&&R()<0.15){t.tr=1.25*t.t;t.tg=1.0*t.t;t.tb=0.6*t.t;}
    TREES.push(t);colCircle(x,z,TREE_R*s,{tree:t});inf.arvores++;}
  for(let i=0;i<900&&inf.pedras<60;i++){const x=ANEL.x0+R()*(ANEL.x1-ANEL.x0),z=ANEL.z0+R()*(ANEL.z1-ANEL.z0);if(!novo(x,z,2)||!freeSpot(x,z,2.4))continue;
    const s=0.5+Math.pow(R(),2)*1.2,rk={id:ROCKS.length,x,z,y:ground(x,z)-s*0.25,s,r:R()*6.283,hp:4,alive:true,t:0.82+R()*0.25,anel:true};ROCKS.push(rk);colCircle(x,z,0.85*s,{rock:rk});inf.pedras++;}
  for(let i=0;i<1600&&inf.moitas<150;i++){const x=ANEL.x0+R()*(ANEL.x1-ANEL.x0),z=ANEL.z0+R()*(ANEL.z1-ANEL.z0);if(!novo(x,z,1.5)||!freeSpot(x,z,1.4))continue;
    BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s:0.8+R()*0.5,r:R()*6.283,frutas:R()<0.55,cresce:0,t:0.85+R()*0.3,anel:true});inf.moitas++;}
  const pk=(kind,n)=>{let k=0;for(let i=0;i<n*10&&k<n;i++){const x=ANEL.x0+R()*(ANEL.x1-ANEL.x0),z=ANEL.z0+R()*(ANEL.z1-ANEL.z0);if(!novo(x,z,2)||!freeSpot(x,z,0.8))continue;
    PICKS.push({id:PICKS.length,kind,x,z,y:ground(x,z),r:R()*6.283,s:0.8+R()*0.5,alive:true,t:0.9+R()*0.2,anel:true});k++;inf.coletaveis++;}};
  pk('pedra',30);pk('galho',36);pk('cogumelo',12);pk('fibra',30);
  for(let i=0;i<16000&&inf.capim<5200;i++){const x=ANEL.x0+R()*(ANEL.x1-ANEL.x0),z=ANEL.z0+R()*(ANEL.z1-ANEL.z0);if(!novo(x,z,-1)||dentroCidade(x,z,-0.5))continue;
    const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.3)continue;if(pointBlocked(x,z,0.35))continue;
    GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.7+R()*0.6,t:0.8+R()*0.4,anel:true});inf.capim++;}
  if(typeof vegDirty!=='undefined')vegDirty=true;ANEL_INFO=inf;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{anelMontar();}catch(e){console.error('volta da cidade',e);}return r;};}

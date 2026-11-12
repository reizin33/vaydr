/* ================= estado do jogo ================= */
const CFG_KEY='nnc_cfg_v1';let SAVE_KEY='nnc_jogo_v1';   // a chave muda com o mundo escolhido (62q_perfis: saveChaves)
const cfg=Object.assign({graf:small?'medio':touch?'alto':'ultra',dif:'normal',cam:'3',tela:touch?'celular':'pc',sens:1,som:1,musica:0.55,efeitos:0.9,teclas:1},store.get(CFG_KEY)||{});
function saveCfg(){store.set(CFG_KEY,cfg);}
const DIF={facil:{dano:0.6,hp:0.8,horda:0.7,fome:0.75},normal:{dano:1,hp:1,horda:1,fome:1},dificil:{dano:1.5,hp:1.25,horda:1.4,fome:1.25}};
const GRAF={baixo:{dpr:1,sombra:0,grama:700,detalhe:0,msaa:0,bloom:0},medio:{dpr:1.5,sombra:1024,grama:1600,detalhe:1,msaa:4,bloom:1},alto:{dpr:2,sombra:2048,casc:1,grama:2600,detalhe:2,msaa:4,bloom:1,ssao:1,raios:1},
  ultra:{dpr:2,sombra:3072,casc:1,grama:4200,detalhe:2,msaa:4,bloom:1,ssao:1,raios:1,ultra:1}};
/* Etapa 21: o que cada nível de gráfico muda (distâncias de desenho e de detalhe, mato, luzes, raio das sombras) */
Object.assign(GRAF.baixo,{arvPerto:20,arvLonge:90,grRaio:24,flores:0.5,samamb:300,folhas:350,cidLod:42,obDist:110,zDist:65,bDist:55,luzes:2,sombraR:[27,0]});
Object.assign(GRAF.medio,{arvPerto:30,arvLonge:130,grRaio:30,flores:0.7,samamb:1100,folhas:1000,cidLod:58,obDist:140,zDist:85,bDist:70,luzes:3,sombraR:[27,0]});
Object.assign(GRAF.alto,{arvPerto:40,arvLonge:185,grRaio:34,flores:0.7,samamb:1600,folhas:1800,cidLod:70,obDist:170,zDist:95,bDist:80,luzes:4,sombraR:[24,96]});
Object.assign(GRAF.ultra,{arvPerto:55,arvLonge:320,grRaio:42,flores:0.8,samamb:2400,folhas:2600,cidLod:95,obDist:220,zDist:120,bDist:100,luzes:4,sombraR:[30,130]});
function GF(){return GRAF[cfg.graf]||GRAF.alto;}
const ZS={walker:{hp:100,vaga:0.7,caca:1.75,dano:12,alcance:1.55,r:0.34},runner:{hp:65,vaga:1.0,caca:4.3,dano:9,alcance:1.5,r:0.3},
  brute:{hp:420,vaga:0.6,caca:1.6,dano:30,alcance:2.1,r:0.55,obra:3},screamer:{hp:70,vaga:0.6,caca:1.45,dano:8,alcance:1.45,r:0.3}};

const G={modo:'carregando',dia:1,hora:7,noiteN:0,noite:false,final:false,kills:0,mortes:0,chuva:0,chuvaAlvo:0,chuvaT:0.3,salvarT:40,
  m:{etapa:0,pecas:{bateria:false,cabo:false,antena:false},fim:false},ev:null,ondas:[],dicas:{},t:0,limiteT:0,xp:0,nivel:1,pontos:0,perks:{},tarefas:[],tarefaN:0,raio:0,luaSangue:false,caiuNoite:false};
const P={x:SPAWN[0],z:SPAWN[1],y:0,vy:0,air:0,yaw:Math.PI,pitch:-0.08,body:Math.PI,vx:0,vz:0,vida:100,fome:100,sede:100,energia:100,
  inv:new Array(INV_N).fill(null),sel:0,acao:null,cd:0,lanterna:false,alive:true,agachado:false,agK:0,socoMad:0,hurt:0,mochila:null,ch:null,ph:0,amp:0,mortoT:0,recuo:0,flash:0,shake:0,aim:0,roupa:{cabeca:null,tronco:null,pernas:null,pes:null,costas:null}};
const Z=[],ZMAX=60,OB=[],DROPS=[],PART=[],RINGS=[],NOISE=[],FIRES=[];
const MESH={};const ZMESH={};
let E={};

/* ---------- ambiente: relógio, luz, clima ---------- */
// dia: céu azul empoeirado, horizonte de neblina seca cinza-amarelada (fumaça e poeira no ar), halo morno em volta do sol
const ENV_DAY={hs:[0.54,0.62,0.78],hg:[0.2,0.18,0.12],dc:[2.3,2.1,1.74],zen:srgb(0x56799f),hor:srgb(0xbcc0b4),glow:[0.1,0.075,0.04],fogD:0.0082,exp:1.0,sil:srgb(0x86918a)};
const ENV_DUSK={hs:[0.4,0.34,0.42],hg:[0.12,0.09,0.07],dc:[1.9,0.9,0.42],zen:srgb(0x2c3d6a),hor:srgb(0xd98a5a),glow:[0.6,0.26,0.08],fogD:0.011,exp:1.05,sil:srgb(0x4a4058)};
const ENV_NIGHT={hs:[0.085,0.12,0.24],hg:[0.018,0.022,0.03],dc:[0.28,0.36,0.6],zen:srgb(0x04070d),hor:srgb(0x152233),glow:[0,0,0],fogD:0.031,exp:1.3,sil:srgb(0x0b1320)};
const RAINY={zenN:srgb(0x07090e),horN:srgb(0x131b25),zenD:srgb(0x67788a),horD:srgb(0x8b979f),silN:srgb(0x0c131c),silD:srgb(0x6e7f8c)};
const MOON_DIR=norm([-0.46,0.25,-0.86]),MOON_LIGHT=norm([-0.32,0.78,-0.6]);
function nightAmt(h){if(h>=20.75||h<5)return 1;if(h>=19.25)return smooth(19.25,20.75,h);if(h<6.5)return 1-smooth(5,6.5,h);return 0;}
function duskAmt(h){return clamp(Math.max(1-Math.abs(h-19.3)/1.5,1-Math.abs(h-5.8)/1.1),0,1);}
function sunDir(h){const a=clamp((h-6)/14,0,1)*Math.PI;return norm([Math.cos(a)*0.85,Math.max(Math.sin(a),0.06)*0.9+0.1,-0.4]);}
function computeEnv(){const h=G.hora,n=nightAmt(h),k=duskAmt(h)*(1-n*0.55),r=smooth(0,1,G.chuva);
  const mixE=(key)=>{const a=ENV_DAY[key],b=ENV_NIGHT[key],c=ENV_DUSK[key];if(typeof a==='number')return lerp(lerp(a,b,n),c,k);return mixc(mixc(a,b,n),c,k);};
  const e={n,k,r};e.hs=scl(mixE('hs'),1-0.3*r);e.hg=mixE('hg');e.dc=scl(mixE('dc'),1-0.6*r);
  const sd=sunDir(h);e.sun=sd;e.dd=norm(mixc(sd,MOON_LIGHT,n));
  e.zen=mixc(mixE('zen'),mixc(RAINY.zenD,RAINY.zenN,n),r);e.hor=mixc(mixE('hor'),mixc(RAINY.horD,RAINY.horN,n),r);e.glow=scl(mixE('glow'),1-r);
  e.sil=mixc(mixE('sil'),mixc(RAINY.silD,RAINY.silN,n),r);e.fogD=mixE('fogD')*(1+0.5*r)*(1+(G.modo==='jogo'||G.modo==='morto'?mata(P.x||0,P.z||0):0)*(0.35+0.5*n));e.exp=mixE('exp');
  const fl=0.85+0.1*Math.sin(G.t*9.1)+0.07*Math.sin(G.t*15.7)+0.05*Math.sin(G.t*23.3);e.flick=fl;
  e.fire=scl([1,0.45,0.15],lerp(4,9,n)*fl);e.spot=CARRO.ativo&&CARRO.luz&&CARRO.hp>0?scl([1,0.95,0.86],lerp(3,11,n)):P.lanterna?scl([1,0.93,0.8],lerp(2.5,6.5,Math.max(n,emPredios(P.x,P.z,2)||P.y<-20?interiorEm(P.x,P.y+0.3,P.z):0))*(lanternaForte()?1.75:1)):[0,0,0];
  e.moonC=G.luaSangue?[1,0.3,0.2]:[0.93,0.94,0.98];e.moonV=n*(1-0.85*r)*(G.luaSangue?1.25:1);e.sunV=(1-n)*(1-r)*(1-k*0.3);e.stars=n*(1-r);
  // nuvens, vento, névoa e cor final
  e.cloud=clamp(0.42+(vnoise(G.dia*0.9+0.3,h/24*1.7)-0.5)*0.55+r*0.6,0.1,0.96);
  let cl=mixc(mixc(CLOUD.dL,CLOUD.nL,n),CLOUD.kL,k),cs=mixc(mixc(CLOUD.dS,CLOUD.nS,n),CLOUD.kS,k);
  e.cloudL=mixc(cl,mixc(CLOUD.rL,CLOUD.rnL,n),r);e.cloudS=mixc(cs,mixc(CLOUD.rS,CLOUD.rnS,n),r);e.cloudOff=[G.t*0.0045,G.t*0.0017];
  const wv=(0.7+0.3*Math.sin(G.t*0.23)+0.15*Math.sin(G.t*0.71)+0.35*n*Math.max(0,Math.sin(G.t*0.37)))*(1+r*1.1)*(1+0.35*n);e.wind=[0.85*wv,0.35*wv];
  e.mist=clamp(Math.max(0,1-Math.abs(h-6.2)/2.3)*0.55+n*0.34+k*0.15+r*0.22+(1-n)*(1-k)*0.06,0,0.8);e.vig=lerp(0.62,1.08,n);   // mist +: um véu baixo de dia nos vales
  e.sunFogD=n>0.5?MOON_DIR:sd;
  e.fogSun=n>0.5?mixc(e.hor,[0.34,0.42,0.56],0.3*(1-r)):mixc(mixc(e.hor,[1,0.97,0.9],0.3*(1-r)),[1,0.64,0.36],k*0.85*(1-r));
  e.rim=[0.35*0.22*n+0.5*0.12*k,0.45*0.22*n+0.32*0.12*k,0.75*0.22*n+0.18*0.12*k];
  e.wet=smooth(0,1,G.chuva)*0.9;
  e.bloom=lerp(0.065,0.1,n);e.sat=lerp(0.9,0.72,n)*(1-0.15*r);
  e.lift=mixc(mixc([0.97,1.0,1.04],[0.86,0.95,1.16],n),[0.98,0.95,1.02],k*0.6);
  e.gain=mixc(mixc([1.04,1.0,0.95],[0.95,1.0,1.06],n),[1.1,0.98,0.84],k*0.8);
  if(G.luaSangue&&n>0.05){const b=n;e.hor=mixc(e.hor,[0.34,0.1,0.1],0.4*b);e.zen=mixc(e.zen,[0.12,0.02,0.03],0.35*b);e.hs=mixc(e.hs,[0.3,0.09,0.08],0.45*b);e.dc=mixc(e.dc,[0.75,0.2,0.15],0.55*b);e.sil=mixc(e.sil,[0.2,0.05,0.06],0.4*b);}
  if(G.raio>0){const f=smooth(0,0.22,G.raio)*(0.6+0.4*Math.sin(G.raio*90));e.hs=[e.hs[0]+0.9*f,e.hs[1]+1.0*f,e.hs[2]+1.4*f];e.zen=mixc(e.zen,[0.55,0.6,0.75],f*0.6);e.hor=mixc(e.hor,[0.6,0.64,0.78],f*0.5);}
  climaAmbiente(e);
  if(GDEF){e.fogL=toLin(e.hor,e.exp);e.fogSunL=toLin(e.fogSun,e.exp);e.silL=toLin(e.sil,e.exp);}
  E=e;}
const CLOUD={dL:[0.93,0.92,0.89],dS:[0.57,0.59,0.63],nL:[0.17,0.19,0.25],nS:[0.06,0.07,0.09],kL:[1.0,0.68,0.46],kS:[0.44,0.33,0.4],
  rL:[0.6,0.62,0.65],rS:[0.38,0.4,0.43],rnL:[0.1,0.1,0.12],rnS:[0.05,0.05,0.06]};
function crossed(prev,now,h){return prev<=now?(prev<h&&now>=h):(prev<h||now>=h);}
function fmtHora(h){const hh=Math.floor(h),mm=Math.floor((h-hh)*60);return String(hh).padStart(2,'0')+':'+String(mm-mm%5).padStart(2,'0');}

/* ---------- ruído ---------- */
function barulho(x,z,r,proprio,y){r*=(G.chuva>0.5?0.65:1)*climaRuido();if(proprio){r*=1-0.2*perk('silencio');const b=roupaItem('pes');if(b&&b.silencio)r*=1-b.silencio;}NOISE.push({x,z,r,y:y??(proprio?P.y:ground(x,z))});if(proprio)P.ruidoK=Math.max(P.ruidoK||0,r);}
/* o som se espalha com alcance, atraso e limite: paredes e o subsolo abafam, só os mais perto (até 10 por barulho) vão ver */
function ouvirBarulhos(){for(const nz of NOISE){const sn=emPredios(nz.x,nz.z,4)?salaEm(nz.x,nz.y+0.3,nz.z):null,cand=[];
  for(const z of Z){if(!z.vivo||z.st==='caca'||z.st==='golpe'||z.st==='grito'||z.st==='sobe')continue;if(Math.abs(nz.y-z.y)>8&&(nz.y<-20||z.y<-20))continue;let r=nz.r;
    if(sn||z.zona){const sz=z.zona||null;if((nz.y<-1)!==(z.y<-1))r*=0.25;else if(sn!==sz){r*=sn&&sz?(sn.p&&sz.p&&sn.p===sz.p?0.8:0.4):0.6;}}
    const d=Math.hypot(z.x-nz.x,z.z-nz.z);if(d<r)cand.push([d,z]);}
  cand.sort((a,b)=>a[0]-b[0]);for(let i=0;i<Math.min(cand.length,10);i++){const[d,z]=cand[i],t=0.15+d/16+Math.random()*0.3;if(!z.ouvir||z.ouvir.t>t)z.ouvir={x:nz.tx??nz.x,z:nz.tz??nz.z,y:nz.y,t};}}}

/* ---------- partículas ---------- */
function part(x,y,z,vx,vy,vz,L,s,c,add,g){if(PART.length>420)PART.shift();PART.push({x,y,z,vx,vy,vz,l:0,L,s,c,add:!!add,g:g===undefined?9.8:g});}
/* manchas de sangue no chão (somem devagar) */
const MANCHAS=[];function mancha(x,y,z,r){const g=chaoEm(x,z,y+0.3);addMancha({x,y:g,z,r,rot:Math.random()*6.28,t:0,s:Math.random(),tipo:'mancha',v:Math.floor(Math.random()*4)});}
function updateManchas(dt){for(let i=MANCHAS.length-1;i>=0;i--){const m=MANCHAS[i];m.t+=dt;if(m.t>(m.tipo==='gota'?60:150))MANCHAS.splice(i,1);}}
function sangue(x,y,z,n,dir,forte){sangue2(x,y,z,n||8,dir,forte);}
function lascas(x,y,z,c,n){for(let i=0;i<(n||7);i++)part(x,y,z,(Math.random()-0.5)*2.6,1+Math.random()*2,(Math.random()-0.5)*2.6,0.8,0.045,c);}
function faiscas(x,y,z){for(let i=0;i<6;i++)part(x,y,z,(Math.random()-0.5)*3,Math.random()*2.5,(Math.random()-0.5)*3,0.25,0.035,[1,0.8,0.4,1],true);}
function poeira(x,y,z,n){for(let i=0;i<(n||10);i++)part(x+(Math.random()-0.5),y+Math.random(),z+(Math.random()-0.5),(Math.random()-0.5)*1.5,Math.random()*1.2,(Math.random()-0.5)*1.5,1.2,0.25,[0.45,0.38,0.3,0.4],false,1);}

/* ---------- câmera ---------- */
const cam={pos:[0,8,20],tgt:[0,1,0],fov:1.0,fwd:[0,0,-1],right:[1,0,0],up:[0,1,0]};let camDist=3.6,camPiv=null,camIn=0,camTeto=null,camLivre=0;
function lookDir(yaw,pitch){const cp=Math.cos(pitch);return[Math.sin(yaw)*cp,Math.sin(pitch),Math.cos(yaw)*cp];}
/* a câmera não atravessa paredes (na altura dela), teto de prédio/metrô nem obstáculo baixo */
function camBloqueio(x,y,z,teto){if(teto!==null&&y>teto-0.12)return true;
  for(const c of colQuery(x,z,0.6)){if(!c.solid||c.tree)continue;if(c.y1!==undefined){if(y<c.y0-0.1||y>c.y1+0.1)continue;}else if(y<-20||y-ground(x,z)>(c.obra?2.4:4.5))continue;
    if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<0.18+c.r)return true;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,qx=clamp(lx,-c.hw,c.hw),qz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-qx,lz-qz)<0.18)return true;}}
  return false;}
function updateCamera(dt){const asp=W/H,first=cfg.cam==='1';
  const aimK=P.aim;cam.fov=(asp>=1?0.98:1.2)*(cfg.fov||1)*(1-aimK*0.18)*(1+0.075*(P.runK||0));
  const d=lookDir(P.yaw,P.pitch+P.recuo*0.04+(P.kickP||0));
  const shake=(P.shake>0?P.shake*0.07*(Math.sin(G.t*61.3)*0.6+Math.sin(G.t*37.1+1.3)*0.4):0)-(P.pouso||0);P.pouso=(P.pouso||0)*Math.exp(-dt*7);
  if(CARRO.ativo){const c=CARRO;cam.fov=(asp>=1?1.0:1.22)+Math.abs(c.v)*0.006;
    if(first){const p=carroLocal(...VT().assento),d2=lookDir(P.yaw,clamp(P.pitch,-0.7,0.5));cam.pos=[p[0],p[1]+shake,p[2]];cam.tgt=[p[0]+d2[0],p[1]+d2[1],p[2]+d2[2]];}
    else{const d2=lookDir(P.yaw,clamp(P.pitch,-0.6,0.35)-0.1),piv=[c.x,c.y+VT().camH,c.z],dist=VT().camD+Math.abs(c.v)*0.09;
      let cx=piv[0]-d2[0]*dist,cy=piv[1]-d2[1]*dist+0.7,cz=piv[2]-d2[2]*dist;const gy=ground(cx,cz)+0.6;if(cy<gy)cy=gy;
      cam.pos=[cx,cy+shake,cz];cam.tgt=[piv[0]+d2[0]*6,piv[1]+d2[1]*6,piv[2]+d2[2]*6];}}
  else if(first){const bob=P.amp*Math.sin(P.ph*2)*0.018;const hy=P.alive?lerp(1.62,1.12,P.agK||0):0.4;
    cam.pos=[P.x+d[0]*0.08,P.y+hy+bob+shake,P.z+d[2]*0.08];cam.tgt=[cam.pos[0]+d[0],cam.pos[1]+d[1],cam.pos[2]+d[2]];}
  else{const rx=-Math.cos(P.yaw),rz=Math.sin(P.yaw);
    // dentro de prédio (corredor, escada): a câmera chega mais perto e mais para trás do ombro, devagar, sem ficar batendo nas paredes
    {const dentro=P.y>-20&&!!salaEm(P.x,P.y+0.4,P.z);camIn+=((dentro?1:0)-camIn)*(1-Math.exp(-dt*3));}
    const dist=lerp(lerp(3.6,2.65,aimK)*(cfg.camDist||1),lerp(2.25,1.9,aimK),camIn),side=lerp(lerp(0.55,0.7,aimK),0.42,camIn);
    const alvo=[P.x+rx*side,P.y+lerp(1.55,1.12,P.agK||0)+Math.sin(P.ph*2)*0.022*P.amp*(1+0.4*(P.runK||0)),P.z+rz*side];
    if(!camPiv||Math.hypot(alvo[0]-camPiv[0],alvo[2]-camPiv[2])>3)camPiv=alvo.slice();else{const kp=1-Math.exp(-dt*24);for(let i=0;i<3;i++)camPiv[i]+=(alvo[i]-camPiv[i])*(i===1?kp*0.7:kp);}
    // teto suavizado: desce na hora (não atravessa a laje) e sobe devagar (na escada o teto muda a cada degrau e a câmera pulava)
    const piv=camPiv;let dd=dist;const teto0=tetoEm(P.x,P.y+0.3,P.z);
    if(teto0===null)camTeto=null;else if(camTeto===null||teto0<camTeto)camTeto=teto0;else camTeto+=(teto0-camTeto)*(1-Math.exp(-dt*2.5));
    const teto=camTeto;if(teto!==null&&piv[1]>teto-0.15)piv[1]=teto-0.15;
    for(let t=0.4;t<=dist;t+=0.2){const x=piv[0]-d[0]*t,y=piv[1]-d[1]*t,z=piv[2]-d[2]*t;if(camBloqueio(x,y,z,teto)){dd=Math.max(teto!==null?0.3:0.6,t-0.25);break;}}
    // aproxima rápido quando bate; só volta a afastar depois de um tempinho livre (evita o vai e vem)
    if(dd<camDist-0.05)camLivre=0;else camLivre+=dt;if(dd>camDist&&camLivre<0.3)dd=camDist;
    camDist+=(dd-camDist)*(1-Math.exp(-dt*(dd<camDist?26:4)));let cx=piv[0]-d[0]*camDist,cy=piv[1]-d[1]*camDist,cz=piv[2]-d[2]*camDist;
    const gy=chaoEm(cx,cz,P.y+0.4)+0.35;if(cy<gy)cy=gy;if(teto!==null&&cy>teto-0.12)cy=teto-0.12;
    cam.pos=[cx,cy+shake,cz];cam.tgt=[piv[0]+d[0]*4,piv[1]+d[1]*4,piv[2]+d[2]*4];}
  lunetaCam(d,shake);camImpacto(dt);
  if(G.camFix){cam.pos=G.camFix.pos.slice();cam.tgt=G.camFix.tgt.slice();if(G.camFix.fov)cam.fov=G.camFix.fov;}
  const f=norm([cam.tgt[0]-cam.pos[0],cam.tgt[1]-cam.pos[1],cam.tgt[2]-cam.pos[2]]);cam.fwd=f;
  const r=norm([-f[2],0,f[0]]);cam.right=r;
  cam.up=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];}

/* ---------- entrada abstrata (preenchida pela interface) ---------- */
const IN={mx:0,mz:0,run:false,attack:false,atkQ:false,aim:false,keys:{}};

/* ---------- jogador ---------- */
function selItem(){return P.inv[P.sel];}
function selDef(){const s=selItem();return s?ITEMS[s.id]:null;}
function updatePlayer(dt){const ch=P.ch;
  if(!P.alive){P.mortoT+=dt;if(ch.sk){if(!P.skMorte){P.skMorte=1;P.rola=null;P.muro=null;skTocar(ch,'zLevantar',{ext:true,ini:0,peso:1,mix:2.6,rot:Math.PI,reinicia:true});}ch.sk.ct=0;ch.pitch=0;}else ch.pitch=-1.45*easeOut(Math.min(1,P.mortoT/0.8));ch.x=P.x;ch.z=P.z;ch.y=P.y;if(P.mortoT>1.8&&G.modo==='jogo')mostrarMorte();return;}
  if(CARRO.ativo){if(IN.atkQ||IN.attack){IN.atkQ=false;buzinar();}P.aim=0;P.amp=0;P.agK=0;
    P.recuo=Math.max(0,P.recuo-dt*6);P.shake=Math.max(0,P.shake-dt*3);P.flash=Math.max(0,P.flash-dt);P.hurt=Math.max(0,P.hurt-dt);
    P.energia=Math.min(100,P.energia+15*dt);sobreviver(dt,false);ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;return;}
  if(P.dorme){P.vx=P.vz=0;P.aim=0;P.hurt=Math.max(0,P.hurt-dt);P.energia=Math.min(100,P.energia+20*dt);sobreviver(dt*0.5,false);poseDormindo();return;}
  if(P.trilho&&draisinePasso(dt))return;
  if(IN.giro)P.yaw-=IN.giro*dt*2.6;if(IN.borda)P.yaw-=IN.borda*dt*2.4;
  if(nadoPasso(dt))return;
  if(P.escala){updateEscalada(dt);P.cd-=dt;sobreviver(dt,false);P.agK=approach(P.agK||0,0,dt*5);return;}
  if(P.muro){updateMuro(dt);P.cd-=dt;sobreviver(dt,false);return;}
  if(P.rola){updateRola(dt);P.cd-=dt;sobreviver(dt,true);return;}
  let mx=IN.mx,mz=IN.mz;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}
  {const esf=P.acao&&P.acao.tipo==='revistar'&&P.acao.alvo&&P.acao.alvo.k==='carcaca';P.agK=approach(P.agK||0,P.agachado||esf?1:0,dt*5);}   // esfolando: agacha junto do bicho
  const moving=ml>0.15,running=IN.run&&moving&&P.energia>3&&mz>-0.2&&!P.agachado&&!pernaRuim();
  let spd=running?6.2*(1+0.08*perk('corrida')):(P.agachado?1.9:3.7);if(P.acao&&(P.acao.tipo==='usar'||P.acao.tipo==='revistar'||P.acao.tipo==='recarga'))spd*=0.45;if(P.fome<=0||P.sede<=0)spd*=0.8;if(P.aim>0.5)spd*=0.6;if(P.acao&&P.acao.tipo==='arco')spd*=0.85;if(naAgua(P.x,P.y,P.z))spd*=0.55;spd*=lesaoVel()*sonoVel()*(P.lentoMata||1);
  if(P.travaAnda>0){P.travaAnda-=dt;mx=mz=0;}const px0=P.x,pz0=P.z;
  const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);const dx=sy*mz-cy*mx,dz=cy*mz+sy*mx;
  const k=1-Math.exp(-dt*(moving?(running?8:11):13));P.vx+=(dx*spd-P.vx)*k;P.vz+=(dz*spd-P.vz)*k;P.runK=approach(P.runK||0,running&&Math.hypot(P.vx,P.vz)>4?1:0,dt*2.5);P.correndo=running&&Math.hypot(P.vx,P.vz)>3;
  {const ox=P.x,oz=P.z;P.x+=P.vx*dt;P.z+=P.vz*dt;
    /* beirada: andando no alto, não despenca sem querer (correndo ou pulando dá para saltar) */
    if(P.noChao&&!running&&P.y-ground(ox,oz)>2.2&&chaoEm(P.x,P.z,P.y)<P.y-1.2){P.x=ox;P.z=oz;P.vx*=0.2;P.vz*=0.2;dica('beirada','corpo','Beirada! Andando você não cai. Para saltar daqui, corra ou pule.');}}
  {const x0=P.x,z0=P.z;collide(P,0.3,c=>!c.portao);const px=P.x-x0,pz=P.z-z0,pl=Math.hypot(px,pz);
    if(pl>1e-5){const nx=px/pl,nz=pz/pl,vn=P.vx*nx+P.vz*nz;if(vn<0){P.vx-=vn*nx;P.vz-=vn*nz;}}}
  if(!dentroMapa(P.x,P.z)&&!(P.y<-20&&salaSubEm(P.x,P.y+0.3,P.z))){voltarMapa(P,px0,pz0);P.vx*=0.3;P.vz*=0.3;if(G.t-G.limiteT>6){G.limiteT=G.t;toast('corpo',P.x>150?'Destroços e mato fechado bloqueiam a passagem por aqui.':'A mata é fechada demais por aqui. Volte para a clareira.');}}
  fisicaVertical(dt);
  if(running){P.energia=Math.max(0,P.energia-4.6*dt*(1-0.15*perk('folego'))*(1+Math.max(0,pesoRoupa()-5)*0.05));}else P.energia=Math.min(100,P.energia+(P.acao?10:18)*dt*(1+0.2*perk('folego'))*sonoRegen());
  const sp=Math.hypot(P.vx,P.vz);
  let bodyT=P.body;if(cfg.cam==='1'||P.acao||P.aim>0.3)bodyT=P.acao&&P.acao.mira!==undefined?P.acao.mira:P.yaw;else if(sp>0.5)bodyT=Math.atan2(P.vx,P.vz);
  P.body=angLerp(P.body,bodyT,1-Math.exp(-dt*(P.acao||P.aim>0.3?16:10)));
  P.amp=approach(P.amp,sp>0.4?(running?1:0.75):0,dt*4);P.ph+=dt*(running?11:7.5)*(sp>0.3?1:0.25);
  {const st=Math.floor(P.ph/Math.PI);if(st!==P.passoN){P.passoN=st;if(sp>0.6&&P.noChao){const agua=naAgua(P.x,P.y,P.z),ri=agua?null:roadInfo(P.x,P.z),sup=agua?'agua':dentroCidade(P.x,P.z,-2)?'asf':ri.road&&ri.d<ri.road.w/2?(ri.road.cor==='asfalto'?'asf':'terra'):'grama';
      sfx('passo',undefined,undefined,agua?(running?0.7:0.45):running?0.5:P.agachado?0.1:0.26,sup);if(agua){barulho(P.x,P.z,running?13:P.agachado?4:8,true,P.y);dica('agua','corpo','Na água você anda devagar e cada passo faz barulho. Agachado faz menos. Mais fundo, você nada.');}}}}
  if(running&&sp>2)barulho(P.x,P.z,9,true);
  // mira
  const d=selDef();P.aim=approach(P.aim,((IN.aim&&d&&(d.fogo||d.arco||d.arremesso))||(P.acao&&P.acao.tipo==='arco'))?1:0,dt*(P.acao&&P.acao.tipo==='arco'?9:6));
  P.recuo=Math.max(0,P.recuo-dt*6);P.shake=Math.max(0,P.shake-dt*3);P.flash=Math.max(0,P.flash-dt);P.hurt=Math.max(0,P.hurt-dt);
  // ações
  P.cd-=dt;
  if(P.acao)stepAcao(dt);
  else if((IN.attack||IN.atkQ)&&P.cd<=0&&!OBRA.ativo){IN.atkQ=false;atacar();}
  sobreviver(dt,running);
  // personagem
  ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;ch.pitch=0;
  animarJogador(dt);}
function sobreviver(dt,running){const df=DIF[cfg.dif],mt=1-0.15*perk('metab');P.fome=Math.max(0,P.fome-0.065*dt*df.fome*mt*(running?1.4:1));P.sede=Math.max(0,P.sede-0.09*dt*df.fome*mt*(running?1.5:1)*(G.hora>10&&G.hora<16?1.15:1)*climaSede());
  if(P.fome<=0||P.sede<=0){P.vida-=0.6*dt;if(!G.dicas.fome){G.dicas.fome=1;toast('corpo',P.fome<=0?'Você está faminto e perdendo vida. Coma alguma coisa.':'Você está com muita sede e perdendo vida. Beba água.');}}
  else if(P.fome>55&&P.sede>55&&P.vida<vidaMax())P.vida=Math.min(vidaMax(),P.vida+0.28*dt);
  if(P.fome>20&&P.sede>20)G.dicas.fome=0;
  if(comFrio()){const lim=100-50*(1-calorRoupa());if(P.energia>lim)P.energia=Math.max(lim,P.energia-24*dt);dica('frio','clima','A noite está fria: sem roupa quente sua energia não enche. Fique perto do fogo ou faça um casaco e um gorro de pele.');}
  if(P.vida<=0)morrer();}
function animarJogador(dt){const o=P.ch.r,a=P.acao,d=selDef(),k=P.agK||0;
  poseLoco(o,P.ph,P.amp*(1-0.4*k),G.t,Math.max(P.runK||0,P.amp>0.85?clamp((P.amp-0.85)/0.15,0,1)*0.6:0)*(1-k));   // corrida misturada aos poucos (sem trocar de pose de uma vez)
  if(k>0.01){o[3]+=0.34*k;o[6]-=0.2*k;o[9]-=0.2*k;o[12]-=0.35*k;o[15]-=0.2*k;o[18]-=0.35*k;o[21]-=1.0*k;o[24]+=1.55*k;o[27]-=1.0*k;o[30]+=1.55*k;}
  if(a&&a.tipo==='golpe'){const s=clamp(a.t/a.dur,0,1);const B=new Float32Array(36);B.set(o);poseMelee(B,s,a.vertical);const w=Math.min(1,s/0.1,(1-s)/0.2+0.3);for(let i=3;i<36;i++)if(i<21||i>=33)o[i]=lerp(o[i],B[i],clamp(w,0,1));}
  else if(d&&d.fogo&&(P.aim>0.05||(a&&a.tipo==='tiro')))poseAim(o,Math.max(P.aim,a&&a.tipo==='tiro'?1:0),P.recuo);
  else if(d&&d.fogo){S3(o,5,-0.35,0,-0.1);S3(o,6,-0.45,0,0);}
  else if(d&&d.arco)poseArco(o,a&&a.tipo==='arco'?1:P.aim,a&&a.tipo==='arco'?a.puxa:0);
  if(a&&a.tipo==='arremesso')poseArremesso(o,clamp(a.t/a.dur,0,1));
  if(a&&a.tipo==='usar')poseUse(o,Math.min(1,a.t/0.25,(a.dur-a.t)/0.25));
  if(a&&a.tipo==='empurrar')posePush(o,Math.min(1,a.t/0.12,(a.dur-a.t)/0.2));
  if(a&&a.tipo==='recarga'){S3(o,5,-1.0,0,0.3);S3(o,6,-0.8,0,0);S3(o,3,-1.1,0,-0.3);S3(o,4,-0.9,0,0);}
  // segurando E: esfolando, a mão da faca corta indo e vindo e a outra segura o bicho; revistando, as duas mãos mexem na frente
  if(a&&a.tipo==='revistar'){const t=Math.min(1,a.t/0.3,(a.dur-a.t)/0.2+0.2);
    if(a.alvo&&a.alvo.k==='carcaca'){const sw=Math.sin(G.t*9);o[3]+=0.3*t;S3(o,5,lerp(o[15],-1.05+0.38*sw,t),0,lerp(o[17],0.3,t));S3(o,6,lerp(o[18],-0.95-0.4*sw,t),0,0);S3(o,3,lerp(o[9],-0.95,t),0,lerp(o[11],-0.25,t));S3(o,4,lerp(o[12],-0.7,t),0,0);S3(o,2,lerp(o[6],-0.35,t),0,0);}
    else{const sw=Math.sin(G.t*6.5);S3(o,5,lerp(o[15],-0.85+0.22*sw,t),0,lerp(o[17],0.18,t));S3(o,6,lerp(o[18],-0.9,t),0,0);S3(o,3,lerp(o[9],-0.85-0.22*sw,t),0,lerp(o[11],-0.18,t));S3(o,4,lerp(o[12],-0.9,t),0,0);S3(o,2,lerp(o[6],-0.2,t),0,0);}}
  if(P.hurt>0.4)o[3]-=0.15;poseCambaleio(o);
  P.ch.hipY=(!P.noChao?0.05:-Math.abs(Math.sin(P.ph))*0.03*P.amp)-0.26*k;}
/* ajuda de mira: o golpe vira para o zumbi ou bicho mais próximo dentro do alcance e na frente da câmera */
function miraMelee(alc){let best,bs=-1;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);
  const cand=(x,z,r)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz),lim=alc+r+0.9;if(d>lim||d<0.01)return;const dot=(dx*fx+dz*fz)/d;if(dot<0.4)return;const sc=dot*1.5-d/lim;if(sc>bs){bs=sc;best=Math.atan2(dx,dz);}};
  for(const z of Z)if(z.vivo&&z.ch.vis)cand(z.x,z.z,ZS[z.tipo].r);for(const b of BICHOS)if(b.vivo)cand(b.x,b.z,BS[b.tipo].r);return best;}
function atacar(){const s=selItem(),d=s?ITEMS[s.id]:null;
  if(d&&s.id==='pedra'){if(P.energia<1.2){feed('Sem energia',true);P.cd=0.3;return;}P.energia=Math.max(0,P.energia-1.2);P.acao={tipo:'golpe',t:0,dur:0.44,vertical:true,soco:true,pedra:true,mira:miraMelee(1.75)};sfx('golpe');return;}
  if(!d||d.tipo==='material'||d.tipo==='util'||d.tipo==='municao'||d.tipo==='missao'||d.tipo==='garrafa'||d.tipo==='roupa'){if(P.energia<1){feed('Sem energia',true);P.cd=0.3;return;}P.energia=Math.max(0,P.energia-1);P.acao={tipo:'golpe',t:0,dur:0.38,vertical:false,soco:true,mira:miraMelee(1.7)};sfx('golpe');return;}
  if(d.corpo){if(P.energia<3){feed('Sem energia',true);P.cd=0.3;return;}P.acao={tipo:'golpe',t:0,dur:d.tempo*0.85,vertical:!!d.vertical,arma:s,mira:miraMelee(d.alcance||2)};P.energia=Math.max(0,P.energia-3);sfx('golpe');return;}
  if(d.arco){comecarArco(s);return;}
  if(d.arremesso){comecarArremesso(s);return;}
  if(d.fogo){if(s.mun>0){P.acao={tipo:'tiro',t:0,dur:d.tempo};atirar(s,d);}else{sfx('vazio');P.cd=0.35;if(invCount(d.municao)>0)recarregar();else if(s.id==='pistola')dica('semMunicao','corpo','A pistola está sem balas. Procure munição no posto, nos carros e nas casas.');else feed('Sem '+ITEMS[d.municao].nome.toLowerCase(),true);}return;}
  if(d.tipo==='comida'||d.tipo==='bebida'||d.tipo==='cura'){P.acao={tipo:'usar',t:0,dur:1.0,slot:P.sel};return;}}
function recarregar(){const s=selItem(),d=s?ITEMS[s.id]:null;if(!d||!d.fogo)return;if(P.acao){if(P.acao.tipo==='tiro')P.recPend=true;return;}if(s.mun>=d.pente)return;if(invCount(d.municao)<=0){feed('Sem munição',true);return;}
  P.acao={tipo:'recarga',t:0,dur:d.porCartucho?0.35+0.42*Math.min(d.pente-s.mun,invCount(d.municao)):(d.recarga||1.3)};sfx(d.besta?'puxar':'recarga');}
function empurrar(){if(P.acao||P.cd>0||P.energia<8||!P.alive)return;P.acao={tipo:'empurrar',t:0,dur:0.4,mira:miraMelee(1.6)};P.energia-=8;sfx('golpe');}
function agachar(on){if(!P.alive)return;P.agachado=on===undefined?!P.agachado:!!on;if(P.agachado){IN.run=false;IN.runFix=false;}sfx('clique');feed(P.agachado?'Agachado':'De pé');
  if(P.agachado)dica('agachar','corpo','Agachado você anda devagar e em silêncio, os zumbis demoram mais para te ver e um golpe pelas costas dá o dobro de dano.');}
function pular(){if(P.escala){sairEscalada(null);return;}if(P.muro||P.rola)return;{const a=alvoMuro();if(a){comecarMuro(a);return;}}if(P.agachado){agachar(false);return;}if((!P.noChao&&!(P.coyote>0))||!P.alive||P.energia<4)return;if(pernaRuim()){feed(pernaSemTala()?'Com a perna quebrada não dá para pular':'Com a tala não dá para pular',true);return;}P.vy=4.8;P.noChao=false;P.coyote=0;P.energia-=4;}
function stepAcao(dt){const a=P.acao;a.t+=dt;
  if(a.tipo==='arco'){passoArco(a,dt);return;}
  if(a.tipo==='arremesso'&&!a.done&&a.t>=a.dur*0.4){a.done=true;lancarMolotov(a);}
  if(a.tipo==='golpe'&&!a.hit&&a.t>=a.dur*(a.vertical?0.55:0.45)){a.hit=true;golpeAcerta(a);}
  if(a.tipo==='empurrar'&&!a.hit&&a.t>=0.15){a.hit=true;const fx=Math.sin(P.body),fz=Math.cos(P.body);let n=0;
    for(const z of Z){if(!z.vivo||z.tipo==='colosso')continue;const dx=z.x-P.x,dz=z.z-P.z,dd=Math.hypot(dx,dz);if(dd<2.2&&(dx*fx+dz*fz)/(dd||1)>0.3){const f=z.tipo==='brute'?0.5:1.6;
      z.kx=dx/(dd||1)*f*3;z.kz=dz/(dd||1)*f*3;z.st='atordoado';z.t=z.tipo==='brute'?0.35:0.9;n++;}}
    if(n)sfx('acerto');barulho(P.x,P.z,6,true);}
  if(a.tipo==='usar'&&!a.done&&a.t>=a.dur*0.7){a.done=true;usarItem(a.slot);}
  if(a.tipo==='recarga'&&!a.done&&a.t>=a.dur){a.done=true;const s=selItem(),d=s?ITEMS[s.id]:null;if(s&&d&&d.fogo){const need=d.pente-s.mun,k=Math.min(need,invCount(d.municao));invRemove(d.municao,k);s.mun+=k;hudBarra();}}
  if(a.tipo==='revistar'){const t=a.alvo&&a.alvo.o;const tx=a.alvo.px??t.x,tz=a.alvo.pz??t.z;if(Math.hypot(tx-P.x,tz-P.z)>3.2){P.acao=null;return;}
    if(!a.done&&a.t>=a.dur){a.done=true;alvoInter=a.alvo;interagir(true);}}
  if(a.t>=a.dur){P.acao=null;P.cd=a.tipo==='golpe'?0.05:0.1;if(P.selPend!=null){const j=P.selPend;P.selPend=null;P.recPend=false;selecionar(j);}else if(P.recPend){P.recPend=false;recarregar();}}}
function usarItem(i){const s=P.inv[i];if(!s)return;const d=ITEMS[s.id];if(d.cantil){cantilBeber(i);return;}if(d.trata&&!precisaTratar(d.trata)){feed('Sua perna está boa: a tala não precisa',true);return;}
  if(d.fome)P.fome=clamp(P.fome+d.fome,0,100);if(d.sede)P.sede=clamp(P.sede+d.sede,0,100);if(d.vida)P.vida=clamp(P.vida+d.vida*(d.tipo==='cura'?1+0.3*perk('medico'):1),0,vidaMax());if(d.energia)P.energia=clamp(P.energia+d.energia,0,100);
  s.n--;if(s.n<=0)P.inv[i]=null;if(d.vira){const left=invAdd(d.vira,1);if(left)soltarItens([[d.vira,left]],P.x,P.z,P.y);}
  for(const f of USO_EXTRA)f(s.id,d);
  const lm=curaLesoes(s.id);feed(lm?lm:d.tipo==='cura'?'Curou '+d.vida+' de vida':d.tipo==='bebida'?'Bebeu '+d.nome.toLowerCase():'Comeu '+d.nome.toLowerCase());sfx('pegar');hudBarra();invRender();}
function golpeAcerta(a){const s=a.arma,d=s?ITEMS[s.id]:a.pedra?BALANCO.brancas.pedra:BALANCO.brancas.maos,fx=Math.sin(P.body),fz=Math.cos(P.body);
  const alc=d.alcance||1.7;const alvos=[];
  for(const z of Z){if(!z.vivo||!z.ch.vis||Math.abs(z.y-P.y)>1.7)continue;const dx=z.x-P.x,dz=z.z-P.z,dd=Math.hypot(dx,dz);if(dd<alc+ZS[z.tipo].r+0.15&&(dx*fx+dz*fz)/(dd||1)>0.32)alvos.push([dd,z]);}
  for(const b of BICHOS){if(!b.vivo)continue;const dx=b.x-P.x,dz=b.z-P.z,dd=Math.hypot(dx,dz);if(dd<alc+BS[b.tipo].r+0.3&&(dx*fx+dz*fz)/(dd||1)>0.32){const fu=P.agK>0.5&&b.st!=='foge';if(fu)feed('Golpe furtivo: dano dobrado');ferirBicho(b,(d.dano||9)*danoUp(s)*(1+0.12*perk('forca'))*(fu?2:1),dx/(dd||1),dz/(dd||1),'corte');sfx('acerto');barulho(P.x,P.z,6,true);if(s)gastar(s,1);return;}}
  if(!alvos.length){for(const f of GOLPE_ALVOS)if(f(s,d,fx,fz)){if(s)gastar(s,1);return;}}
  if(!alvos.length&&golpePorta(d.dano||9)){if(s)gastar(s,1);return;}
  alvos.sort((a,b)=>a[0]-b[0]);const maxHits=a.vertical?1:2;let hits=0;
  for(const[,z]of alvos){if(hits>=maxHits)break;const furtivo=P.agK>0.5&&(z.st==='vaga'||z.st==='alerta'||z.st==='marcha'||z.st==='quebra');
    const dmg=danoGolpe(d,s,z,a.vertical,furtivo);const dx=z.x-P.x,dz=z.z-P.z,dd=Math.hypot(dx,dz)||1;
    if(furtivo){feed('Golpe furtivo: dano dobrado');progresso('furtivo');}ZHIT={k:'golpe'};marcarFerida(z,[z.x-dx/dd*0.28,z.y+1.25*(z.ch.s||1),z.z-dz/dd*0.28],false);ferirZ(z,dmg,dx/dd*(d.empurra||0.6),dz/dd*(d.empurra||0.6),d.empurra?1:0);hits++;}
  if(hits){sfx('acerto');barulho(P.x,P.z,P.agK>0.5?4:7,true);P.shake=0.3;G.hitstop=Math.max(G.hitstop||0,alvos.some(([,z])=>!z.vivo)?0.11:0.065);if(s)gastar(s,1);return;}
  {const gi=GIGANTES.find(T=>Math.hypot(T.x-P.x,T.z-P.z)<T.R+1.7&&Math.abs(P.y-T.y)<3&&((T.x-P.x)*fx+(T.z-P.z)*fz)>0);
    if(gi){lascas(P.x+fx*0.9,P.y+1.1,P.z+fz*0.9,[0.5,0.36,0.22,1],5);sfx('madeira',gi.x,gi.z,0.7);barulho(P.x,P.z,10,true);if(s)gastar(s,1);
      if(s&&d.corta){P.socoMad=(P.socoMad||0)+1;if(P.socoMad>=3){P.socoMad=0;ganhar('madeira',1);}dica('gigante','corpo','Árvore gigante não cai: rende madeira devagar com machado. Os cipós no tronco mostram onde dá para subir.');}
      else dica('gigante2','corpo','Essa árvore é grande demais para derrubar. Procure os cipós no tronco: por eles dá para subir até os galhos.');return;}}
  if(s&&d.corta){const t=perto(TREES,P.x+fx*1.0,P.z+fz*1.0,1.6,t=>t.alive&&Math.hypot(t.x-P.x,t.z-P.z)<2.6);
    if(t){t.hp--;const n=1+(Math.random()<(d.rende??0.5)?1:0)+(t.hp<=0?perk('lenhador'):0);ganhar('madeira',n);lascas(t.x,t.y+1.0,t.z,[0.55,0.38,0.22,1]);sfx('madeira',t.x,t.z);barulho(P.x,P.z,14,true);gastar(s,1);
      if(t.hp<=0)derrubarArvore(t);
      return;}}
  if(!s||a.soco){const t=perto(TREES,P.x+fx*0.8,P.z+fz*0.8,1.4,t=>t.alive&&Math.hypot(t.x-P.x,t.z-P.z)<1.75+0.3*t.s);
    if(t){lascas(t.x,t.y+1.1,t.z,[0.55,0.38,0.22,1],4);sfx('madeira',t.x,t.z,0.6);barulho(P.x,P.z,6,true);P.shake=0.12;P.socoMad=(P.socoMad||0)+1;
      if(a.pedra){P.socoMad+=0.5;const sp=selItem();if(sp&&sp.id==='pedra'&&Math.random()<0.1){sp.n--;if(sp.n<=0)P.inv[P.sel]=null;feed('A pedra rachou',true);hudBarra();}}
      if(P.socoMad>=3){P.socoMad=0;t.hp--;ganhar('madeira',1+(t.hp<=0?perk('lenhador'):0));if(t.hp<=0)derrubarArvore(t);}
      if(a.pedra)dica('pedraArvore','corpo','Com a pedra na mão a árvore cede mais rápido: a cada 2 batidas, 1 madeira. De vez em quando a pedra racha.');
      else dica('soco','corpo','Na mão sai madeira devagar: a cada 3 socos, 1 madeira. Pegue uma pedra do chão e bata com ela: rende mais.');
      return;}}
  if(s&&d.minera){const r=perto(ROCKS,P.x+fx*1.0,P.z+fz*1.0,1.2+1.2,r=>r.alive&&Math.hypot(r.x-P.x,r.z-P.z)<2.4+r.s*0.8);
    if(r){r.hp--;ganhar('pedra',2);if(Math.random()<(r.serra?0.5:0.1))ganhar('minerioFerro',1);lascas(r.x,r.y+r.s*0.6,r.z,[0.5,0.5,0.47,1]);sfx('pedra',r.x,r.z);barulho(P.x,P.z,12,true);gastar(s,1);
      if(r.hp<=0){r.alive=false;colRemove(COLL.find(c=>c.rock===r)||{});poeira(r.x,r.y+0.5,r.z,12);vegDirty=true;ganharXP(6);progresso('rocha');}return;}}
  if(s&&d.corta){const r=perto(ROCKS,P.x+fx,P.z+fz,2.0,r=>r.alive);if(r)dica('picareta','corpo','O machado não quebra rocha. Faça uma picareta: 2 pedras, 2 gravetos e 3 fibras.');}}
function derrubarArvore(t){t.alive=false;colRemove(COLL.find(c=>c.tree===t)||{});ganhar('madeira',Math.max(2,Math.round(1.5*(t.s||1))));poeira(t.x,t.y+2,t.z,14);vegDirty=true;ganharXP(8);progresso('arvore');
  dica('tabuas','corpo','Transforme madeira em tábuas na bancada (aba Fabricar): a da clareira ou uma que você construir (B → Bancada de trabalho). Tábuas constroem e consertam defesas.');}
function perto(list,x,z,maxD,f){let best=null,bd=maxD*maxD;for(const it of list){if(f&&!f(it))continue;const d=(it.x-x)**2+(it.z-z)**2;if(d<bd){bd=d;best=it;}}return best;}
function gastar(s,n){if(s.dur===undefined)return;s.dur-=n;if(s.dur<=0){const i=P.inv.indexOf(s);if(i>=0)P.inv[i]=null;toast('corpo',ITEMS[s.id].nome+' quebrou.');sfx('quebrar');}hudBarra();}
function ganhar(id,n,ex){const left=invAdd(id,n,ex);const ok=n-left;if(ok>0)feed('+'+ok+' '+ITEMS[id].nome);if(left>0){soltarItens([[id,left,ex]],P.x,P.z,P.y);feed(P.roupa.costas?'Mochila cheia':'Bolsos cheios',true);if(!P.roupa.costas)dica('semMochila','corpo','Seus bolsos encheram. Faça uma mochila na bancada da clareira (aba Fabricar) para carregar muito mais.');}sfx('pegar');hudBarra();invRender();
  if(id==='gasolina')dica('gasolina','corpo','Galão de gasolina! A caminhonete parada na fazenda anda com ele. Ela aparece no minimapa.');
  if((id==='graveto'||id==='fibra')&&invCount('graveto')>=2&&invCount('fibra')>=3&&invCount('pedra')>=1)dica('fabricar','corpo','Já dá para fazer um machado improvisado: 1 pedra, 2 gravetos e 3 fibras. Abra a mochila, aba Fabricar.');}
/* tiro: raio a partir da câmera, com ajuda de mira no toque */
function raySeg(o,d,a,b){const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2],wx=o[0]-a[0],wy=o[1]-a[1],wz=o[2]-a[2];
  const B=d[0]*ex+d[1]*ey+d[2]*ez,Cc=ex*ex+ey*ey+ez*ez,D=d[0]*wx+d[1]*wy+d[2]*wz,Ee=ex*wx+ey*wy+ez*wz,den=Cc-B*B;
  let u=den>1e-6?(Ee-B*D)/den:0;u=clamp(u,0,1);let t=-D+u*B;if(t<0)t=0;u=clamp((t*B+Ee)/Cc,0,1);t=Math.max(0,-D+u*B);
  const px=o[0]+d[0]*t-(a[0]+ex*u),py=o[1]+d[1]*t-(a[1]+ey*u),pz=o[2]+d[2]*t-(a[2]+ez*u);return{t,u,dist:Math.hypot(px,py,pz)};}
function atirar(s,d){if(d.besta||d.chumbo||d.atravessa){atirarEsp(s,d);return;}s.mun--;P.recuo=1;P.flash=0.07;P.shake=0.35;sfx('tiro');barulho(P.x,P.z,d.barulho,true);hudBarra();
  let o=cam.pos.slice(),dir=assistCel(o,cam.fwd.slice());   // no celular a ajuda de mira vai para o peito (antes ia para a cabeça: todo tiro matava)
  {const a=abreTiro(s.id);if(a>0)dir=espalhar(dir,a);}
  let hit=null,ht=70,hr=null,hc=null;
  for(const z of Z){if(!z.vivo)continue;const C=zCorpo(z),r=raySeg(o,dir,C.a,C.b);
    if(r.dist<C.r&&r.t<ht){ht=r.t;hit=z;hr=r;hc=C;}}
  let bicho=null;for(const b of BICHOS){if(!b.vivo)continue;const h=bichoAlt(b),r=raySeg(o,dir,[b.x,b.y+h*0.3,b.z],[b.x,b.y+h,b.z]);if(r.dist<bichoHitR(b)&&r.t<ht){ht=r.t;bicho=b;hit=null;}}
  // obstáculos no caminho
  let block=null;for(let t=1;t<Math.min(ht,70);t+=0.5){const x=o[0]+dir[0]*t,y=o[1]+dir[1]*t,z=o[2]+dir[2]*t;if(y<ground(x,z)){block=[x,y,z];ht=t;hit=null;bicho=null;break;}
    const c=bloqueiaTiro(x,y,z);if(c){block=[x,y,z];ht=t;hit=null;bicho=null;break;}}
  const mz=cfg.cam==='1'?[cam.pos[0]+dir[0]*0.7+cam.right[0]*0.16-cam.up[0]*0.12,cam.pos[1]+dir[1]*0.7+cam.right[1]*0.16-cam.up[1]*0.12,cam.pos[2]+dir[2]*0.7+cam.right[2]*0.16-cam.up[2]*0.12]:xf(P.ch.m.subarray(11*16,12*16),WGRIP.pistola[0],WGRIP.pistola[1],WGRIP.pistola[2]);P.muzzle=mz;
  for(let i=0;i<5;i++)part(mz[0],mz[1],mz[2],dir[0]*3+(Math.random()-0.5),dir[1]*3+(Math.random()-0.5),dir[2]*3+(Math.random()-0.5),0.15,0.06,[1,0.75,0.35,1],true,0);
  if(bicho&&!block){ferirBicho(bicho,danoBicho(s.id,s)*(1+0.15*perk('mira')),dir[0],dir[2],'bala');marcarAcerto(false);}
  if(hit){const reg=regiaoTiro(hit,hr,hc,o,dir),head=reg==='cabeca',hp=[o[0]+dir[0]*ht,o[1]+dir[1]*ht,o[2]+dir[2]*ht];sangue(hp[0],hp[1],hp[2],head?18:9,dir,head);marcarFerida(hit,hp,head);if(Math.random()<0.7)jatoChao(hit.x+dir[0]*(0.9+Math.random()),hit.y,hit.z+dir[2]*(0.9+Math.random()),0.22+Math.random()*0.18,Math.atan2(dir[0],dir[2]));
    ZHIT=zhitDe('bala',s.id,reg);ferirZ(hit,danoTiro(s.id,reg,distJogador(hp),hit,s),dir[0]*0.8,dir[2]*0.8,head?1:0);marcarAcerto(head);if(head)progresso('cabeca');G.hitstop=Math.max(G.hitstop||0,hit.vivo?0.035:0.08);}
  else if(block)faiscas(block[0],block[1],block[2]);}

/* ---------- zumbis ---------- */
let zid=1;
function criarZ(tipo,x,z,o){if(Z.length>=ZMAX){const i=Z.findIndex(q=>!q.vivo);if(i>=0)Z.splice(i,1);else return null;}
  const S=ZS[tipo],pool=ZMESH[tipo]||ZMESH[S.malha||'walker'],mi=pool[Math.floor(Math.random()*pool.length)];
  const ch=newChar(mi,S.esc||(tipo==='colosso'?CHEFE.esc:tipo==='brute'?1.3:tipo==='elite'?1.42:0.95+Math.random()*0.12));ch.zumbi=1;   // zumbi: pele manchada no shader
  const q=Object.assign({id:zid++,tipo,ch,x,z,y:ground(x,z),hp:S.hp*DIF[cfg.dif].hp,vivo:true,st:'vaga',t:0,ph:Math.random()*6,hx:x,hz:z,ax:x,az:z,viu:99,
    kx:0,kz:0,sink:0,flash:0,bateu:false,gritou:false,stuck:0,lastX:x,lastZ:z,desvio:0,noturno:false,gemT:2+Math.random()*8,idleT:0},o||{});
  q.hpMax=q.hp;ch.x=x;ch.z=z;ch.y=q.y;ch.yaw=Math.random()*6.28;Z.push(q);zNovo2(q);return q;}
function ferirZ(z,dmg,kx,kz,forte){if(!z.vivo){ZHIT=null;return;}dmg=zArmadura(z,dmg);if(z.tipo==='colosso'&&z.st==='atordoado')dmg*=1.6;z.hp-=dmg;z.flash=0.15;z.flinch=0.32;sangue(z.x,z.y+1.2*(z.ch.s||1)*(ZS[z.tipo].baixo?0.25:ZS[z.tipo].cao?0.4:1),z.z,6,(kx||kz)?norm([kx,0.25,kz]):null,dmg>60);mancha(z.x+(Math.random()-0.5)*0.6,z.y,z.z+(Math.random()-0.5)*0.6,0.25+Math.random()*0.2);if(z.hp<=0)mancha(z.x,z.y,z.z,0.55+Math.random()*0.3);
  if(z.hp<=0){z.vivo=false;z.st='morrendo';z.t=0;G.kills++;z.queima=0;if(z.flechas)soltarFlechasZ(z);sfx('acerto',z.x,z.z);sfx('morteZ',z.x,z.z,0.8,z.tipo);zMorreu(z);if(z.tipo==='colosso')chefeMorreu(z);const lo=rollLoot('zumbi');if(Math.random()<0.45&&lo.length)soltarItens(lo,z.x,z.z,z.y);if(z.tipo==='elite')soltarItens(sortearTab(CID_LOOT.elite,3,0),z.x+0.4,z.z+0.4,z.y);if(z.posto&&G.cid){G.cid.postos=G.cid.postos||{};G.cid.postos[z.posto.id]=G.tm||0;}return;}
  z.lx=P.x;z.lz=P.z;z.viu=0;
  if(z.tipo==='colosso'){if(z.st==='vaga'||z.st==='marcha'||z.st==='alerta')z.st='caca';}
  else if(z.tipo!=='brute'||forte){z.st='atordoado';z.t=z.tipo==='brute'?0.2:0.3+(forte?0.3:0);z.kx=kx*3;z.kz=kz*3;}
  else if(z.st!=='golpe')z.st='caca';}
function ferirJogador(d,src){if(!P.alive)return;if(P.rola&&P.rola.t>P.rola.dur*0.08&&P.rola.t<P.rola.dur*0.72){if(src)sfx('golpe',src.x,src.z,0.4);return;}d*=DIF[cfg.dif].dano*(1-protecao());if(CARRO.ativo&&!VT().exposto){CARRO.hp=Math.max(0,CARRO.hp-d*0.7);d*=0.3;}P.vida-=d;P.hurt=0.7;P.shake=0.6;sfx('dor');flashDano();if(src&&typeof roupaGastar==='function')roupaGastar(d,'golpe');if(src)direcaoDano(src.x,src.z);if(src||d>=8)impactoJogador(d,src);if(G.noite)G.caiuNoite=G.caiuNoite||P.vida<=0;if(P.vida<=0)morrer();}
function zVisao(){const n=E.n||0;let r=lerp(24,11,n);if(P.lanterna&&n>0.3)r+=14;if(G.chuva>0.5)r*=0.8;r*=climaVisao();
  if(!P.lanterna&&(emPredios(P.x,P.z,2)||P.y<-20)){const s=salaEm(P.x,P.y+0.3,P.z);if(s&&s.escura>0.5)r*=0.6;}if(camuflado())r*=0.55;if(P.fumaca>0.3)r*=1-0.75*P.fumaca;return r;}   // no escuro de dentro, sem lanterna, é mais difícil te ver
function updateZombies(dt){const ag=(P.agK||0)>0.5,vis=zVisao()*(ag?0.6:1);let horda=0;ouvirBarulhos();
  for(let i=Z.length-1;i>=0;i--){const z=Z[i],ch=z.ch,S=ZS[z.tipo],P2=ZP[z.tipo];
    const dxp=P.x-z.x,dzp=P.z-z.z,dp=Math.hypot(dxp,dzp);
    z.flash=Math.max(0,z.flash-dt);ch.tint=z.flash>0?[2.2,1.3,1.3]:(z.tint||[1,1,1]);
    if(z.st==='morrendo'){z.t+=dt;if(!zSkMorto(z)){if(S.cao){const k=easeOut(Math.min(1,z.t/0.45));ch.roll=1.5*k;ch.hipY=-0.22*k;}else ch.pitch=-1.5*easeOut(Math.min(1,z.t/0.6));}if(z.t>0.7){z.st='morto';z.t=0;}ch.y=z.y;continue;}
    if(z.st==='morto'){z.t+=dt;zSkMorto(z);if(z.t>18){z.st='sumindo';z.t=0;}continue;}
    if(z.st==='sumindo'){z.t+=dt;zSkMorto(z);z.sink-=dt*0.6;ch.y=z.y+z.sink;if(z.t>2.2)Z.splice(i,1);continue;}
    if(z.st==='sobe'){z.t+=dt;const k=clamp(z.t/1.8,0,1);z.sink=ch.sk?-0.55*(1-easeOut(Math.min(1,k*2.5))):-1.75*(1-easeOut(k));z.y=ground(z.x,z.z);ch.x=z.x;ch.z=z.z;ch.y=z.y+z.sink;ch.vis=dp<100;
      ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*3));if(ch.sk)zSkLevantar(z,0.06+k*0.94);else poseZAttack(ch.r,0.35+0.25*Math.sin(z.t*5),P2);if(Math.random()<dt*10)poeira(z.x,z.y+0.1,z.z,2);
      if(k>=1){z.sink=0;z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;if(ch.sk)skParar(ch,5);}continue;}
    if(dp>120&&!z.noturno){ch.vis=false;continue;}
    ch.vis=dp<100;
    if(z.st==='dorme'){   // emboscada: parada no escuro até alguém chegar perto, fazer barulho ou bater nela
      if(z.ouvir){z.ouvir.t-=dt;if(z.ouvir.t<=0){z.st='alerta';z.ax=z.ouvir.x;z.az=z.ouvir.z;z.ay=z.ouvir.y;z.ouvir=null;ch.pitch=0;}}
      if(z.st==='dorme'&&P.alive&&((dp<(ag?2.0:3.6)&&Math.abs(P.y-z.y)<2)||z.flash>0)){z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;ch.pitch=0;sfx('ataqueZ',z.x,z.z,1,z.tipo);}
      if(z.st==='dorme'){z.stAnt='dorme';ch.x=z.x;ch.z=z.z;ch.y=z.y;if(ch.vis&&!zSkDeitado(z)){poseZIdle(ch.r,G.t*0.3+z.id,P2);ch.pitch=0.3;}continue;}}
    // acordou: levanta do chão antes de agir (com o esqueleto novo)
    if(z.stAnt==='dorme'&&ch.sk&&!S.baixo){z.levanta=z.tipo==='emboscada'?1.0:1.5;z.levantaD=z.levanta;}z.stAnt=z.st;
    if(z.levanta>0){z.levanta-=dt;zSkLevantar(z,1-z.levanta/z.levantaD);ch.x=z.x;ch.z=z.z;ch.y=z.y;ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*2.5));if(z.levanta<=0)skParar(ch,5);continue;}if(z.noturno||z.st==='caca'||z.st==='marcha')horda++;
    if(z.chefe&&chefeAtualiza(z,dt,dp,dxp,dzp))continue;
    if(zEspecial(z,dt,dp,dxp,dzp))continue;
    // percepção
    if(P.alive){const fx=Math.sin(ch.yaw),fz=Math.cos(ch.yaw);const ang=dp>0.01?(dxp*fx+dzp*fz)/dp:1;
      if(z.ignora>0)z.ignora-=dt;
      const alto=P.y-z.y>3.2&&!(z.zona&&P.y-z.y<4.5),sent=z.tipo==='sentinela',vz=vis*(sent?1.35:1);let sees=alto?(dp<2.5&&!(z.ignora>0)):(dp<(ag?(sent?2.2:1.3):3.5)||(dp<vz&&ang>(sent?-0.6:-0.35))||(!ag&&dp<vz*0.5));
      if(sees&&(z.zona||emPredios(P.x,P.z,2)))sees=enxerga(z);if(sees&&Math.abs(P.y-z.y)>8&&(P.y<-20||z.y<-20))sees=false;   // na cidade, parede e andar escondem
      if(sees&&z.st!=='atordoado'){z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;
        if(z.st==='vaga'||z.st==='alerta'||z.st==='marcha'||z.st==='guarda'||z.st==='volta'||(z.st==='quebra'&&dp<7&&!quebraNoCaminho(z)&&!z.derrubando)){if((z.tipo==='screamer'||sent)&&!z.gritou){z.st='grito';z.t=0;}else z.st='caca';}}
      else z.viu+=dt;}
    else if((z.st==='caca'||z.st==='golpe')&&!aliadoPerto(z,1e9)){z.st=z.noturno?'marcha':'vaga';}
    z.zonaT=(z.zonaT||0)-dt;if(z.zonaT<=0){z.zonaT=0.4+Math.random()*0.2;z.zona=emPredios(z.x,z.z,4)?salaEm(z.x,z.y+0.3,z.z):null;}
    if(z.ouvir){z.ouvir.t-=dt;if(z.ouvir.t<=0){const o=z.ouvir;z.ouvir=null;if(z.st==='vaga'||z.st==='marcha'||z.st==='quebra'||z.st==='alerta'||z.st==='dorme'||z.st==='guarda'||z.st==='volta'){z.st='alerta';z.ax=o.x;z.az=o.z;z.ay=o.y;}}}
    let tx=null,tz=null,spd=0;const noite=(E.n||0)>0.5?1.18:1;
    let ac=false,dcao=1e9,AL=null;if(z.st==='caca'||z.st==='golpe'){AL=aliadoPerto(z,dp);if(AL){ac=true;dcao=AL.d;}}   // Caramelo ou sobrevivente mais perto que você vira o alvo
    switch(z.st){
      case'guarda':ch.yaw=angLerp(ch.yaw,(z.yaw0||0)+Math.sin(G.t*0.45+z.id)*0.9,1-Math.exp(-dt*2));break;   // sentinela: parada no posto, olhando em volta
      case'volta':{const q=z.posto;tx=q?q.x:z.hx;tz=q?q.z:z.hz;spd=S.vaga;if(d2(z.x,z.z,tx,tz)<0.6&&Math.abs((q?q.y:z.y)-z.y)<1.2){z.st='guarda';z.gritou=false;}break;}
      case'vaga':if(z.posto){z.st='volta';break;}z.idleT-=dt;if(z.idleT<=0){z.idleT=4+Math.random()*7;const s=z.zona;
          if(s&&s.p&&s.tipo!=='telhado'){const w=pw(s.p,s.u0+0.5+Math.random()*(s.u1-s.u0-1),s.v0+0.5+Math.random()*(s.v1-s.v0-1));z.ax=w[0];z.az=w[1];}
          else if(s&&s.metro){z.ax=s.x0+1+Math.random()*(s.x1-s.x0-2);z.az=s.z0+0.6+Math.random()*(s.z1-s.z0-1.2);}
          else{const a=Math.random()*6.28,r=Math.random()*7;z.ax=z.hx+Math.cos(a)*r;z.az=z.hz+Math.sin(a)*r;}z.ay=z.y;}
        if(d2(z.x,z.z,z.ax,z.az)>0.6){tx=z.ax;tz=z.az;spd=S.vaga;}break;
      case'marcha':if(z.cidade){tx=z.mx??z.hx;tz=z.mz??z.hz;spd=S.vaga*1.25*noite;if(!z.horda&&d2(z.x,z.z,tx,tz)<4){z.st='vaga';z.hx=z.x;z.hz=z.z;}break;}
        tx=FIRE[0];tz=FIRE[2];spd=S.caca*0.7*noite;if(d2(z.x,z.z,tx,tz)<36){z.st='vaga';z.hx=z.x;z.hz=z.z;}break;
      case'alerta':tx=z.ax;tz=z.az;spd=S.caca*0.8*noite;if(d2(z.x,z.z,tx,tz)<2&&Math.abs((z.ay??z.y)-z.y)<1.6){z.st=z.horda?'marcha':z.noturno&&!z.cidade?'marcha':'vaga';z.hx=z.x;z.hz=z.z;z.idleT=2;z.sai=false;}break;
      case'caca':tx=ac?AL.x:z.viu<0.5?P.x:z.lx;tz=ac?AL.z:z.viu<0.5?P.z:z.lz;spd=S.caca*noite;
        if(!ac&&P.y-z.y>1.75&&z.viu<0.5&&!zonaDe(P.x,P.y,P.z)){
          {const pil=typeof pilarParaDerrubar==='function'?pilarParaDerrubar(z):null;if(pil){z.st='derruba';z.obra=pil;z.fora=0;break;}}   // forte: vai derrubar o pilar que segura o piso
          z.fora=(z.fora||0)+dt;   // jogador no alto: rodeia embaixo, geme e acaba desistindo
          if(dp<1.5){tx=null;ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*4));}if(Math.random()<dt*0.25)sfx('gemido',z.x,z.z,0.6,z.tipo);
          if(z.fora>14){z.st=z.noturno?'marcha':'vaga';z.hx=z.x;z.hz=z.z;z.idleT=1;z.fora=0;z.ignora=12;}break;}
        z.fora=0;
        if((ac?dcao:dp)<S.alcance*(ch.s||1)&&(ac||(P.alive&&zAlcanca(z)))){z.st='golpe';z.t=0;z.bateu=false;z.mira=ac?AL:'p';if(Math.random()<0.7)sfx('ataqueZ',z.x,z.z,0.9,z.tipo);}
        if(z.viu>6&&!ac){z.st='alerta';z.ax=z.lx;z.az=z.lz;z.ay=z.ly;}break;
      case'golpe':{z.t+=dt*(S.cao?1.7:1);const mc=z.mira!=='p'&&aliadoValido(z.mira),mp=mc?aliadoPos(z.mira):null,gx=mc?mp[0]-z.x:dxp,gz=mc?mp[1]-z.z:dzp,gd=Math.hypot(gx,gz);ch.yaw=angLerp(ch.yaw,Math.atan2(gx,gz),1-Math.exp(-dt*8));
        if(z.t>=0.62&&!z.bateu){z.bateu=true;const fx=Math.sin(ch.yaw),fz=Math.cos(ch.yaw);if(gd<S.alcance*(ch.s||1)+0.35&&(gx*fx+gz*fz)/(gd||1)>0.3&&(mc||zAlcanca(z))){if(mc)ferirAliado(z.mira,S.dano);else ferirJogador(S.dano,z);zBateu(z,!mc);}}
        if(z.t>=1.05)z.st='caca';break;}
      case'derruba':{const o=z.obra;if(!o||o.hp<=0||!OB.includes(o)||!(P.y-z.y>1.75)||!P.alive){z.st='caca';z.obra=null;z.derrubando=false;break;}
        const d=Math.hypot(o.x-z.x,o.z-z.z);if(d>S.r*(ch.s||1)+0.5){tx=o.x;tz=o.z;spd=S.caca*noite;break;}
        z.st='quebra';z.t=0;z.derrubando=true;if(typeof derrubaAviso==='function')derrubaAviso(z,o);break;}
      case'quebra':{const o=z.obra;if(!o||o.hp<=0||(o.larg!==undefined&&!portaFechada(o))||(z.derrubando&&!(P.y-z.y>1.75))){z.st=z.noturno&&!z.cidade?'marcha':'caca';z.obra=null;z.derrubando=false;break;}z.t+=dt;z.ph+=dt*5.5;
        ch.yaw=angLerp(ch.yaw,Math.atan2(o.x-z.x,o.z-z.z),1-Math.exp(-dt*6));
        if(z.t>1.1){z.t=0;if(o.larg!==undefined)danoPorta(o,S.dano*(S.obra||1),true);else danoObra(o,S.dano*(S.obra||1)*(o.tipo==='pilar'?0.5:1));}break;}
      case'grito':{z.t+=dt;ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*6));
        if(z.t>0.4&&!z.gritou){z.gritou=true;RINGS.push({x:z.x,z:z.z,y:z.y+1.9,a:0},{x:z.x,z:z.z,y:z.y+1.9,a:-0.35});sfx('grito',z.x,z.z,1.3);
          if(z.tipo==='sentinela'){NOISE.push({x:z.x,z:z.z,r:30,tx:P.x,tz:P.z,y:z.y});dica('sentinela','alerta','Uma sentinela te viu e chamou os de perto. Elas ficam paradas guardando lugares importantes: chegue agachado, pelo escuro.');}
          else{NOISE.push({x:z.x,z:z.z,r:60,tx:P.x,tz:P.z,y:z.y});dica('grito','alerta','Um gritador te viu e chamou a horda. Mate ele primeiro da próxima vez.');}}
        if(z.t>1.8)z.st='caca';break;}
      case'atordoado':z.t-=dt;z.x+=z.kx*dt;z.z+=z.kz*dt;z.kx*=Math.exp(-dt*5);z.kz*=Math.exp(-dt*5);if(z.t<=0)z.st='caca';break;}
    if(z.pula&&z.pula.j&&janelaTapada(z.pula.j)){z.pula=null;z.rota=null;z.rotaT=0;}
    if(z.pula){z.pula.t-=dt;if(z.pula.t<=0){let q=z.pula;if(q.j&&bloqueadoAlto(q.x,q.z,0.3,q.y)){const nx=Math.sin(q.j.yaw),nz=Math.cos(q.j.yaw),a=janelaPouso(q.j,(q.x-q.j.x)*nx+(q.z-q.j.z)*nz<0);if(a)q={x:a.x,y:a.y,z:a.z};}z.x=q.x;z.z=q.z;z.y=q.y;z.pula=null;z.rotaI++;poeira(z.x,z.y+0.5,z.z,4);sfx('madeira',z.x,z.z,0.5);}else{tx=null;}}
    // na cidade: rota por portas, corredores e escadas quando o alvo está em outra zona
    if(tx!==null&&spd>0&&(z.zona||z.cidade||emPredios(tx,tz,2))){const ty=z.st==='caca'?(z.viu<0.5?P.y:(z.ly??z.y)):z.st==='alerta'?(z.ay??z.y):z.st==='volta'&&z.posto?z.posto.y:z.y;const wp=navProximo(z,tx,ty,tz);if(wp){tx=wp.x;tz=wp.z;}}
    // movimento
    if(tx!==null&&spd>0){let dx=tx-z.x,dz=tz-z.z;const dd=Math.hypot(dx,dz);if(dd>0.05){dx/=dd;dz/=dd;
        if(z.desvio>0){z.desvio-=dt;const s=z.desvioS;const px=-dz*s,pz=dx*s;dx=dx*0.35+px;dz=dz*0.35+pz;}
        let sx=0,sz=0;for(const o of Z){if(o===z||!o.vivo)continue;const ox=z.x-o.x,oz=z.z-o.z,od=ox*ox+oz*oz;if(od<1.0&&od>1e-4){const k=(1-Math.sqrt(od))/Math.sqrt(od);sx+=ox*k;sz+=oz*k;}}
        let slow=1;for(const ob of OB){if((ob.tipo==='estacas'||ob.tipo==='espetosFerro')&&d2(ob.x,ob.z,z.x,z.z)<2.2){const dx2=z.x-ob.x,dz2=z.z-ob.z,lx=dx2*ob.col.c-dz2*ob.col.s,lz=dx2*ob.col.s+dz2*ob.col.c;
          if(Math.abs(lx)<1.05&&Math.abs(lz)<0.6){const fe=ob.tipo==='espetosFerro';slow=fe?0.35:0.45;z.hp-=(fe?26:14)*dt;z.flash=0.05;ob.hp-=(fe?3:6)*dt;if(ob.hp<=0)destruirObra(ob);if(z.hp<=0){z.vivo=false;z.st='morrendo';z.t=0;G.kills++;zMorreu(z);}}}
          else if(ob.tipo==='arame'&&d2(ob.x,ob.z,z.x,z.z)<3.2)slow=Math.min(slow,arameZumbi(z,ob,dt));}
        const v=spd*slow*zVelAgua(z);z.x+=(dx*v+sx*1.5)*dt;z.z+=(dz*v+sz*1.5)*dt;
        ch.yaw=angLerp(ch.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*7));z.ph+=dt*v*3.2;
        const hit=collide(z,S.r*(ch.s||1),c=>c.solid);
        if(hit&&(hit.obra||hit.porta)&&(z.st==='caca'||z.st==='marcha'||z.st==='alerta'||(z.st==='derruba'&&!(hit.obra&&hit.obra.tipo==='pilar'&&hit.obra!==z.obra)))){if(z.st==='derruba')z.derrubando=true;z.st='quebra';z.obra=hit.obra||hit.porta;z.t=0;}
        z.stuck+=dt;if(z.stuck>1.2){const mv=Math.hypot(z.x-z.lastX,z.z-z.lastZ);if(mv<0.25&&z.desvio<=0){z.desvio=0.9;z.desvioS=Math.random()<0.5?-1:1;}z.stuck=0;z.lastX=z.x;z.lastZ=z.z;}}}
    else if(z.st==='atordoado')collide(z,S.r*(ch.s||1),c=>c.solid);
    if(!dentroMapa(z.x,z.z,-10)&&z.y>-20){const k=Math.hypot(z.x,z.z),rm=raioMapaEm(z.x,z.z);if(k>rm+10&&!dentroCidade(z.x,z.z,10)){z.x*=(rm+10)/k;z.z*=(rm+10)/k;}}
    {const cz=zChaoAgua(z,chaoEm(z.x,z.z,z.y));if(z.y>cz+0.3||z.vy>0){z.vy=(z.vy||0)-14*dt;z.y+=z.vy*dt;if(z.y<=cz){if(z.vy<-12)ferirZ(z,(-z.vy-12)*9,0,0,true);z.y=cz;z.vy=0;}}else{if(z.vy<-12)ferirZ(z,(-z.vy-12)*9,0,0,true);z.y=cz;z.vy=0;}}
    ch.x=z.x;ch.z=z.z;ch.y=z.y+z.sink;
    // animação
    if(!ch.vis)continue;
    const moving=tx!==null&&spd>0;
    if(zPoseEsp(z,ch,moving,spd,dt));
    else if(z.st==='golpe')poseZAttack(ch.r,clamp(z.t/0.9,0,1),P2);
    else if(z.st==='quebra')poseZPound(ch.r,z.ph,P2);
    else if(z.st==='grito'){poseZScream(ch.r,G.t,clamp(Math.min(z.t/0.3,(1.8-z.t)/0.4),0,1));}
    else if(z.st==='atordoado'){poseZWalk(ch.r,z.ph,P2,0.2);ch.r[3]+=-0.35;ch.r[6]-=0.4;}
    else if(moving)poseZWalk(ch.r,z.ph,P2,clamp(spd/1.4,0.6,1.2));
    else poseZIdle(ch.r,G.t+z.id,P2);
    if(z.flinch>0&&!S.cao){z.flinch-=dt;const k=Math.max(0,z.flinch/0.32);ch.r[3]-=0.45*k;ch.r[6]-=0.4*k;ch.r[9]+=0.35*k;ch.r[15]+=0.35*k;}
    if(!S.cao)ch.hipY=moving?Math.abs(Math.cos(z.ph))*0.03-0.015:0;
    z.gemT-=dt;if(z.gemT<=0){z.gemT=(z.st==='caca'?3:5)+Math.random()*9;if(dp<30)sfx('gemido',z.x,z.z,0.8,z.tipo);}}
  NOISE.length=0;return horda;}
function pontoLivre(x,z,r){if(!dentroMapa(x,z,2))return false;if(ruralCasaEm(x,z,0.3))return false;if(RIO.ok&&aguaPerto(x,z,1))return false;return!pointBlocked(x,z,r||0.6);}
function popularDia(){for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(!z.vivo||(!z.noturno&&Math.hypot(z.x-P.x,z.z-P.z)>40))Z.splice(i,1);}
  const R=Math.random;const spawnAt=(list,tipos)=>{for(const[x,z]of list){if(Math.hypot(x-P.x,z-P.z)<28)continue;if(Z.length>=ZMAX-12)break;
    const t=pick(R,tipos);const px=x+(R()-0.5)*4,pz=z+(R()-0.5)*4;if(pontoLivre(px,pz))criarZ(t,px,pz);}};
  spawnAt(ZSPAWN.posto,['walker','walker','walker','screamer']);spawnAt(ZSPAWN.fazenda,['walker','walker','runner']);
  spawnAt(ZSPAWN.vila,['walker','walker','runner','screamer','walker']);spawnAt(ZSPAWN.torre,['walker','brute','walker']);for(const p of PLACES)if(p.sitio&&ZSPAWN[p.id]&&Math.random()<0.6)spawnAt(ZSPAWN[p.id],['walker','walker','runner']);
  for(let k=0;k<9;k++){const a=R()*6.28,r=35+R()*100,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-P.x,z-P.z)>30&&pontoLivre(x,z))criarZ(R()<0.85?'walker':'runner',x,z);}popularDia2();}
function ondaNoturna(){if(Math.hypot(P.x-FIRE[0],P.z-FIRE[2])>165)return;   // longe da clareira (na cidade): a horda da mata não vem
  const n=G.noiteN,df=DIF[cfg.dif],forca=typeof ondaForca==='function'?ondaForca(n):1;let qtd=typeof ondaQtd==='function'?ondaQtd(n):Math.round((2+n*1.8)*df.horda*(G.final?1.8:1)*(G.luaSangue?1.5:1)*baseFatorHorda());qtd=Math.min(qtd,ZMAX-Z.filter(z=>z.vivo).length);
  for(let i=0;i<qtd;i++){let x,z,ok=false;for(let t=0;t<12&&!ok;t++){const a=Math.random()*6.283,r=42+Math.random()*14;x=FIRE[0]+Math.cos(a)*r;z=FIRE[2]+Math.sin(a)*r;ok=pontoLivre(x,z)&&Math.hypot(x-P.x,z-P.z)>22;}
    if(!ok)continue;let tipo='walker';const R=Math.random();if(n>=2&&R<0.2)tipo='runner';else if(n>=2&&R<0.28)tipo='screamer';if(i===0&&(n>=3||G.final))tipo='brute';
    if(typeof ondaTipo==='function')tipo=ondaTipo(n,i);
    const q=criarZ(tipoNoturno2(tipo,n,i),x,z,{noturno:true,st:'marcha'});if(q&&forca>1){q.hp*=forca;q.hpMax=q.hp;}}
  if(qtd>0)sfx('gemido',FIRE[0]+30,FIRE[2]-30,1);ondaCaes(n);
  if(P.alive&&!CARRO.ativo&&Math.hypot(P.x-FIRE[0],P.z-FIRE[2])>18){const m=1+(n>=3?1:0);for(let i=0;i<m;i++){const p=pontoLevantar(9,16,true);if(p)zLevantar('walker',p[0],p[1],{noturno:true});}}}

/* ---------- construções ---------- */
let obid=1;
function criarObra(tipo,x,z,yaw,hp,aberto,y,ext){const D=OBRAS[tipo],g=ground(x,z);const o={id:obid++,tipo,x,z,y:y??g,yaw,hp:hp??D.hp,hpMax:D.hp,aberto:!!aberto,abre:0,ext:ext?Object.assign({},ext):{}};
  if(D.bau)o.itens=new Array(BAU_N).fill(null);
  if(D.alto)montarAlto(o,D,o.ext);
  else if(tipo==='tabuasPorta'){const d=CID.portas[o.ext.porta];const w=d?d.larg/2+0.1:0.6;o.col=colBox(x,z,w,0.14,yaw,{solid:true,obra:o,y0:o.y,y1:o.y+2.2});}
  else if(tipo==='tabuasJanela'){const j=CID.janelas[o.ext.janela];o.col=colBox(x,z,j?j.larg/2+0.1:0.7,0.12,yaw,{solid:true,obra:o,y0:o.y,y1:o.y+2.4});}
  else if(D.montar)D.montar(o);   // peças com colisores e malha próprios (48yd: pilar, porta, janela)
  else{const elev=o.y-g>0.35,ek=modK(o),eh=modKH(o);o.col=colBox(x,z,D.hw*ek,D.hd*ek,yaw,Object.assign({solid:D.solid,obra:o,portao:!!D.portao},elev?{y0:o.y-0.05,y1:o.y+(D.bau?0.75:1.2)}:{y0:o.y-0.3,y1:o.y+(D.hCol||2.45)*eh}));}
  if(D.torre||D.horta||D.coletor||D.gerador)montarBase(o);
  OB.push(o);if(D.luz&&!o.ext.apagada)FIRES.push({x,y:o.y,z,obra:o,lamp:!!D.lamp});casaAjusteTeto(o);return o;}
function danoObra(o,d){o.hp-=d;poeira(o.x,o.y+(OBRAS[o.tipo].alto==='plat'?-0.1:0.6),o.z,3);sfx('madeira',o.x,o.z,0.7);if(o.hp<=0)destruirObra(o);}
function destruirObra(o){const i=OB.indexOf(o);if(i<0)return;OB.splice(i,1);colRemove(o.col);desmontarAlto(o);desmontarBase(o);poeira(o.x,o.y+0.6,o.z,18);sfx('quebrar',o.x,o.z);
  const fi=FIRES.findIndex(f=>f.obra===o);if(fi>=0)FIRES.splice(fi,1);
  const guard=o.itens?o.itens.filter(Boolean):[];if(guard.length)soltarItens(guard.map(s=>[s.id,s.n,(s.dur!==undefined||s.mun!==undefined)?{dur:s.dur,mun:s.mun}:null]),o.x,o.z);
  if(Math.hypot(o.x-P.x,o.z-P.z)<60)toast('alerta',o.tipo==='bau'?'O baú foi destruído. As coisas caíram no chão.':OBRAS[o.tipo].nome+' foi destruída.');
  quedaEmCadeia(o);}
const OBRA={ativo:false,tipo:'barricada',rot:0,x:0,z:0,yaw:0,ok:false};
function obraAlvo(){const ctxO=contextoObra();{if(ctxO!==OBRA.ctx){OBRA.ctx=ctxO;if(!obrasVisiveis().includes(OBRA.tipo))OBRA.tipo=obrasVisiveis()[0];hudObras();}else if(OBRA.tipo!==OBRA.tipoMostrado&&obrasVisiveis().includes(OBRA.tipo))hudObras();}
  if(!OBRAS[OBRA.tipo]){OBRA.tipo=obrasVisiveis()[0];hudObras();}   // tipo que não existe (não trava o modo de construção)
  const D=OBRAS[OBRA.tipo];if(D.alto){obraAlvoAlto(D);hudMotivo();return;}
  if(OBRA.tipo==='tabuasPorta'||OBRA.tipo==='tabuasJanela'){const r=alvoAbertura(OBRA.tipo==='tabuasPorta'?'porta':'janela');OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':r.motivo;OBRA.ok=!!r.ok&&invHas(custoObra(OBRA.tipo));hudMotivo();return;}
  const noPredio=ctxO==='predio'||ctxO==='telhado',alto=ctxO==='alto',perto=alto||ctxO==='predio',f=lookDir(P.yaw,0);let x=P.x+f[0]*(perto?1.6:3.2),z=P.z+f[2]*(perto?1.6:3.2);
  if(cfg.cam!=='1'){x+=cam.right[0]*0.5;z+=cam.right[2]*0.5;}
  if(cam.fwd[1]<-0.04){const h0=alto||noPredio?P.y:ground(cam.pos[0],cam.pos[2]),t=(cam.pos[1]-h0)/(-cam.fwd[1]),hx=cam.pos[0]+cam.fwd[0]*t,hz=cam.pos[2]+cam.fwd[2]*t,dp=Math.hypot(hx-P.x,hz-P.z);
    if(dp>(perto?0.9:1.8)&&dp<(perto?4:7.5)){x=hx;z=hz;}}
  x=Math.round(x*4)/4;z=Math.round(z*4)/4;const yaw=P.yaw+OBRA.rot;
  if(D.alvo&&ctxO==='chao'){const r=D.alvo(x,z,yaw,ctxO);if(r){OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':(r.motivo||'Não cabe aqui');OBRA.ok=!!r.ok&&invHas(custoObra(OBRA.tipo));hudMotivo();return;}}
  let ok=invHas(custoObra(OBRA.tipo)),y=ground(x,z),motivo='';const c=Math.cos(yaw),s=Math.sin(yaw);
  if(alto){if(!(D.bau||D.peq)){ok=false;motivo='Isso só vai no chão';y=chaoEm(x,z,P.y+0.4);}else{const r=pequenoNoAlto(D,x,z,yaw);y=r.y;if(!r.ok){ok=false;motivo=r.motivo;}}}
  else if(noPredio){y=chaoEm(x,z,P.y+0.4);if(Math.abs(y-P.y)>0.6){ok=false;motivo='Piso em outro nível';}
    if(OBRA.tipo==='fogueira'&&ctxO==='predio'){ok=false;motivo='Sem ventilação: faça fogo no telhado ou na rua';}
    {const zz=salaEm(x,y+0.3,z);if(zz&&zz.metro&&zz.nome==='Túnel'){ok=false;motivo='Nos trilhos não dá para construir';}if(zz&&zz.poco){ok=false;motivo='Dentro do poço do elevador não';}
      if(zz&&zz.fragil&&(OBRA.tipo==='muro'||OBRA.tipo==='muroPedra'||OBRA.tipo==='barricada')){ok=false;motivo='Piso fraco: não aguenta coisa pesada aqui';}}
    for(const[lx,lz]of[[0,0],[D.hw,D.hd],[-D.hw,D.hd],[D.hw,-D.hd],[-D.hw,-D.hd],[D.hw,0],[-D.hw,0]]){const wx=x+lx*c+lz*s,wz=z-lx*s+lz*c;if(bloqueadoAlto(wx,wz,0.1,y)||Math.abs(chaoEm(wx,wz,y+0.3)-y)>0.2){ok=false;motivo=motivo||'Não cabe aqui';break;}}
    {const dx=P.x-x,dz=P.z-z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<D.hw+0.4&&Math.abs(lz)<D.hd+0.4){ok=false;motivo='Perto demais de você';}}}
  else{for(const[lx,lz]of[[0,0],[D.hw,D.hd],[-D.hw,D.hd],[D.hw,-D.hd],[-D.hw,-D.hd],[D.hw,0],[-D.hw,0]]){const wx=x+lx*c+lz*s,wz=z-lx*s+lz*c;if(bloqueadoChao(wx,wz,0.12,y)){ok=false;motivo='Tem coisa no caminho';break;}}
    {const dx=P.x-x,dz=P.z-z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<D.hw+0.4&&Math.abs(lz)<D.hd+0.4){ok=false;motivo='Perto demais de você';}}
    if(!dentroMapa(x,z,3)){ok=false;motivo='Longe demais';}}
  OBRA.x=x;OBRA.z=z;OBRA.y=y;OBRA.yaw=yaw;OBRA.ok=ok;OBRA.ext=null;OBRA.motivo=motivo;hudMotivo();}
function colocarObra(){if(!OBRA.ativo)return;obraAlvo();const D=OBRAS[OBRA.tipo];
  if(!obraLiberada(OBRA.tipo)){feed(OBRAS[OBRA.tipo].desb==='oficina'?'Precisa da oficina: melhore a bancada':OBRAS[OBRA.tipo].desb.startsWith('planta')?'Precisa achar e estudar a planta dessa construção':'Libera depois da primeira noite',true);sfx('vazio');return;}
  const custo=custoObra(OBRA.tipo);if(!invHas(custo)){feed('Faltam materiais',true);sfx('vazio');return;}if(!OBRA.ok){feed(OBRA.motivo||'Não cabe aqui',true);sfx('vazio');return;}
  invPay(custo);{const o=criarObra(OBRA.tipo,OBRA.x,OBRA.z,OBRA.yaw,undefined,false,OBRA.y,OBRA.ext);if(perk('constr')){o.hpMax=Math.round(D.hp*(1+0.25*perk('constr')));o.hp=o.hpMax;}baseColocada(o);}ganharXP(6);if(!D.bau)progresso('obra');sfx('construir');barulho(P.x,P.z,12,true);poeira(OBRA.x,(OBRA.y??ground(OBRA.x,OBRA.z))+0.3,OBRA.z,6);
  if(D.alto==='plat')dica('plataforma','corpo','Plataforma pronta. Encoste outras nela, ponha parapeito nas beiradas, telhado, baú e uma escada de corda para descer.');
  if(D.alto==='ponte')dica('ponte','corpo','Ponte de corda pronta. Andando você não cai dela; correndo ou pulando, cuidado.');
  feed(obraPronta(D));hudObras();hudBarra();G.dicas.construiu=1;if(D.bau)dica('bau','corpo','Baú pronto. Aperte E perto dele para guardar coisas: o que fica no baú não se perde quando você cai.');}

/* "Muro construído", "Fogueira construída", "Estacas construídas" */
function obraPronta(D){if(D.pomar)return D.nome+' plantada';const n=D.nome,w=n.split(' ')[0],pl=/s$/.test(w),m=['Muro','Portão','Baú','Parapeito','Telhado','Colchão','Coletor','Arame','Alarme','Gerador','Poste','Defumador','Armário','Pilar'].includes(w);
  return n+' '+(m?(pl?'construídos':'construído'):(pl?'construídas':'construída'));}
/* ---------- interação ---------- */
let alvoInter=null,segurarT=0;
function interAtual(){if(!P.alive)return null;if(CARRO.ativo)return{k:'carro',o:CARRO};const fx=Math.sin(cfg.cam==='1'?P.yaw:P.body),fz=Math.cos(cfg.cam==='1'?P.yaw:P.body);let best=null,bs=-1e9;
  const tryIt=(o,x,z,r,score,fmin,y)=>{if(y===undefined&&P.y<-20)return;if(y!==undefined&&Math.abs(y-P.y)>1.7)return;const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d>r)return;const f=d>0.3?(dx*fx+dz*fz)/d:1;if(f<(fmin??-0.2))return;const s=score-d+f*0.8;if(s>bs){bs=s;best=o;o.px=x;o.pz=z;}};   // px,pz: o ponto de usar (porta do contêiner, ponta do carro...), para segurar E longe do centro
  for(const it of INTER)tryIt({k:'inter',o:it},it.x,it.z,it.r,it.prio||1,undefined,it.yChk);   // yChk: só de perto na altura (contêiner do navio, naufrágio)
  {const vp=viaPerto();if(vp){const q=vp.u?vp.v.topo:vp.v.base;tryIt({k:'via',o:vp},q.x,q.z,1.4,2.6,-1.1,q.y);}}
  for(const c of CAIXAS)if((c.estado==='cheia'||c.estado==='saqueada')&&c.x!==undefined&&Math.abs(c.x-P.x)<3&&Math.abs(c.z-P.z)<3)tryIt({k:'caixaMata',o:c},c.x,c.z,CAIXA_CFG.raioUsar[c.cat],c.cat==='escondida'?0.6:1.1,undefined,c.y);
  for(const p of PICKS)if(p.alive)tryIt({k:'pick',o:p},p.x,p.z,1.7,0.5);
  for(const b of BUSHES)if(b.frutas)tryIt({k:'bush',o:b},b.x,b.z,1.9,0.3);
  for(const d of DROPS)tryIt({k:'drop',o:d},d.x,d.z,1.8,1.2,undefined,d.y);
  if(P.mochila)tryIt({k:'mochila',o:P.mochila},P.mochila.x,P.mochila.z,2.0,3);
  if(G.ev&&G.ev.ativo)tryIt({k:'caixa',o:G.ev},G.ev.x,G.ev.z,2.4,3);
  for(const b of BICHOS)if(!b.vivo&&b.carc&&!b.carc.vazia)tryIt({k:'carcaca',o:b},b.x,b.z,2.3,2.2,-0.5);
  for(const o of OB){if(OBRAS[o.tipo]&&OBRAS[o.tipo].bau&&o.itens)tryIt({k:'guarda',o},o.x,o.z,2.3,1.6,-0.5,o.y);
    else if(o.tipo==='escadaCorda'&&o.via&&o.via.recolhida)tryIt({k:'escadaBaixar',o},o.x,o.z,2.0,2.4,-0.6,o.y);
    else if(o.tipo==='lamparina')tryIt({k:'lamp',o},o.x,o.z,1.9,0.7,-0.5,o.y);
    else if(o.tipo==='cama')tryIt({k:'camaObra',o},o.x,o.z,1.9,1.0,-0.5,o.y);
    else if(o.hp<o.hpMax*0.7&&o.tipo!=='estacas')tryIt({k:'obra',o},o.x,o.z,2.6,-0.5,undefined,o.y);}
  if(carroInter())tryIt({k:'carro',o:CARRO},CARRO.x,CARRO.z,3.6,2.2,-0.75);
  if(CAO.st==='espera'||caoAtivoLivre()||CAO.st==='descansa')tryIt({k:'cao',o:CAO},CAO.x,CAO.z,CAO.st==='espera'?2.6:2.2,CAO.st==='espera'?2.4:0.9,-0.5);
  cidInter(tryIt);sobrevInter(tryIt);baseInter(tryIt);histInter(tryIt);
  if(temCozinhar()){tryIt({k:'fogo',o:{x:FIRE[0],y:FIRE[1],z:FIRE[2]}},FIRE[0],FIRE[2],2.8,2.5,-0.6);for(const f of FIRES)if(!f.lamp)tryIt({k:'fogo',o:{x:f.x,y:f.y,z:f.z}},f.x,f.z,2.6,2.5,-0.6,f.y);}
  for(const f of INTERS)f(tryIt);
  return best;}
const CID_KINDS=new Set(['cont','porta','janela','gerador','passarela','alcapao','entulho','fumaca','painel','mirante','bomba','porao']);
function textoInter(a){if(!a)return null;const o=a.o;
  if(CID_KINDS.has(a.k))return cidTexto(a);
  switch(a.k){case'via':{if(o.u&&o.v.dono&&o.v.dono.tipo==='escadaCorda')return{t:'Descer pela escada',s:'segure para recolher a escada',alt:true,dur:0.7};const dn=o.v.dono;
      return{t:o.u?'Descer':'Escalar',s:o.v.tipo==='escada'?(dn&&dn.pecas?'escada de metal':dn&&dn.tipo==='torreVigia'?'escada da torre de vigia':'escada de corda'):'pelos cipós da árvore'};}
    case'escadaBaixar':return{t:'Baixar a escada de corda',s:'está recolhida'};
    case'camaObra':return{t:'Cama',s:'toque: salva e vira seu ponto de volta · segure: dormir',alt:true,dur:0.8};
    case'lamp':return{t:o.ext&&o.ext.apagada?'Acender a lamparina':'Apagar a lamparina',s:'luz chama atenção à noite'};
    case'caixaMata':{if(o.estado!=='cheia')return{t:CAIXA_CFG.nomes[o.cat]+': vazia',s:'alguém já levou tudo'};return{t:o.cat==='escondida'?'Desenterrar a caixa escondida':o.cat==='suprimentos'?'Abrir a caixa de suprimentos':'Abrir a caixa de madeira',s:'segure para abrir',hold:true,dur:CAIXA_CFG.tempoAbrir[o.cat]};}
    case'inter':{if(o.kind==='bau'){const vazio=bauVazio(o);return{t:vazio?o.label.replace('Revistar','Revistado:').replace('Pegar','Já pegou:'):o.label,s:vazio?'vazio por enquanto':'segure para revistar',hold:!vazio};}
      if(o.kind==='agua'){const g=invCount('garrafa'),c=cantisPraEncher(false);return{t:g&&c?'Encher garrafas e cantil':g?'Encher garrafas':c?'Encher o cantil':'Beber água',s:o.label};}
      if(o.kind==='bancada'){if(G.m.etapa!==0&&typeof terrRadioOk==='function'&&terrRadioOk())return{t:G.fab.nv>=2?'Oficina e rádio':'Bancada e rádio',s:'toque: fabricar · segure: rádio (trocas com os grupos)',alt:true,dur:0.7};
        return{t:G.m.etapa===0?'Ligar o rádio':G.fab.nv>=2?'Oficina':'Bancada de trabalho',s:G.m.etapa===0?'alguém está chamando':'fabricar, consertar e melhorar'};}
      if(o.kind==='cama')return{t:'Barraca',s:'toque: salva o jogo · segure: dormir',alt:true,dur:0.8};
      if(o.kind==='torre')return{t:'Painel da torre',s:G.m.etapa===2?(temPecas()?'instalar as peças':'faltam peças'):G.m.etapa>2?'transmissor ligado':'precisa de peças'};
      return{t:o.label,s:''};}
    case'pick':return{t:{pedra:'Pegar pedra',galho:'Pegar gravetos',cogumelo:'Pegar cogumelo',fibra:'Colher fibras'}[o.kind],s:o.kind==='fibra'?'touceira de capim':''};
    case'bush':return{t:'Colher frutas',s:''};
    case'drop':return{t:'Pegar itens',s:o.itens.map(i=>i[1]+' '+ITEMS[i[0]].nome).slice(0,2).join(', ')};
    case'mochila':return{t:'Recuperar sua mochila',s:'suas coisas estão aqui',hold:true};
    case'caixa':return{t:'Abrir a caixa de suprimentos',s:'segure para abrir',hold:true};
    case'obra':return{t:'Consertar '+OBRAS[o.tipo].nome.toLowerCase(),s:'usa 2 tábuas'};
    case'carro':return CARRO.ativo?null:carroInter();
    case'fogo':return cozinharTexto();
    case'cao':return caoInter();
    case'sobrev':return sobrevTexto(o);
    case'baseObra':return baseTexto(o);
    case'hist':return histTexto(o);
    case'carcaca':return carcacaTexto(o);
    case'guarda':{const n=o.itens.filter(Boolean).length;return{t:'Abrir o baú',s:n?n+' de '+BAU_N+' espaços usados':'vazio'};}}
  if(INTER_K[a.k])return INTER_K[a.k].texto(o,a);
  return null;}
function bauVazio(o){if(o.missao&&pecaDisponivel(o.missao))return false;if(o.dia===undefined)return false;if(o.once)return true;return G.dia-o.dia<(o.respawn||3);}
function pecaDisponivel(p){return G.m.etapa===1&&!G.m.pecas[p]&&!invCount(p)&&!(P.mochila&&P.mochila.itens.some(i=>i&&i.id===p));}
function temPecas(){return invCount('bateria')&&invCount('cabo')&&invCount('antena');}
function temLamina(){for(const s of P.inv)if(s&&ITEMS[s.id].esfola)return s;return null;}
function interagir(segurado){const a=alvoInter;if(!a)return;const info=textoInter(a);if(info&&info.hold&&!segurado){P.acao={tipo:'revistar',t:0,dur:info.dur||1.15,alvo:a};return;}
  if(info&&info.alt&&!segurado){P.acao={tipo:'revistar',t:0,dur:info.dur||0.7,alvo:a,alt:true};return;}
  if(cidInteragir(a,segurado))return;
  const o=a.o;
  switch(a.k){
    case'inter':
      if(o.kind==='bau'){const man=manualDoLocal(o.id);if(man)acharManual(man);if(bauVazio(o)){if(!man)feed('Vazio por enquanto',true);return;}const it=rollLoot(o.tabela);if(o.primeiro&&o.dia===undefined)it.unshift(...o.primeiro.map(x=>lootItem(x[0],x[1])));
        if(Math.random()<0.25*perk('catador')){const ex=rollLoot(o.tabela);if(ex.length)it.push(ex[0]);}ganharXP(o.dia===undefined?15:4);progresso('busca');
        if(o.missao&&pecaDisponivel(o.missao)){it.unshift([o.missao,1]);G.m.pecas[o.missao]=true;missaoPeca(o.missao);}
        // peça da missão entra direto; o resto abre o painel "Achados" para escolher o que levar (nos testes automáticos antigos, pega tudo como antes)
        o.dia=G.dia;const ehM=x=>ITEMS[x[0]]&&ITEMS[x[0]].tipo==='missao',resto=it.filter(x=>!ehM(x));for(const[id,n,ex]of it.filter(ehM))ganhar(id,n,ex);
        if(resto.length&&!(TESTE&&!window.__painelAchados))achadosAbrir(resto,o);else for(const[id,n,ex]of resto)ganhar(id,n,ex);sfx('pegar');barulho(P.x,P.z,5,true);dica('mochila','corpo','Abra a mochila (Tab ou o botão da mochila) para comer, beber e fabricar.');}
      else if(o.kind==='agua'){const g=invCount('garrafa'),c=cantisEncher(false);if(g){invRemove('garrafa',g);invAdd('agua',g);}if(g||c)feed('Encheu '+[g?g+(g>1?' garrafas':' garrafa'):'',c?(c>1?c+' cantis':'o cantil'):''].filter(Boolean).join(' e '));else{P.sede=Math.min(100,P.sede+32);feed('Bebeu água');}sfx('pegar');hudBarra();}
      else if(o.kind==='bancada'){if(G.m.etapa===0)missaoRadio();else if(segurado&&typeof abrirRadio==='function'&&terrRadioOk())abrirRadio();else abrirMochila('fabricar');}
      else if(o.kind==='cama'){if(segurado)sonoComecar({barraca:true,x:o.x,y:o.y,z:o.z});else camaBarraca();}
      else if(o.kind==='torre')instalarTorre();
      break;
    case'pick':{const p=o;p.alive=false;vegDirty=true;if(p.kind==='pedra')ganhar('pedra',1+(Math.random()<0.5?1:0));else if(p.kind==='galho')ganhar('graveto',2+(Math.random()<0.4?1:0));else if(p.kind==='fibra'){ganhar('fibra',2+(Math.random()<0.5?1:0));dica('fibra','corpo','Fibras vegetais! 5 fibras viram uma corda. Com pedra e gravetos, viram ferramentas.');}else ganhar('cogumelo',1);break;}
    case'bush':o.frutas=false;o.cresce=G.dia+(typeof estacao==='function'?estacao().arbusto:2);vegDirty=true;ganhar('frutas',2+Math.floor(Math.random()*3));ganhar('fibra',1);ganharXP(3);progresso('colheita');break;
    case'drop':{const left=[];for(const[id,n,ex]of o.itens){const l=invAdd(id,n,ex||null);if(l)left.push([id,l,ex]);else feed('+'+n+' '+ITEMS[id].nome);}o.itens=left;if(!left.length)DROPS.splice(DROPS.indexOf(o),1);
      else{feed('Mochila cheia: escolha o que levar',true);if(!(TESTE&&!window.__painelAchados)){const c=chaoAbrir();if(c){bauAberto=c;bauMsg='Mochila cheia: deixe algo no chão para pegar o que quer.';abrirMochila('bau');}}}
      sfx('pegar');hudBarra();invRender();break;}
    case'mochila':{const m=o;let sobrou=[];for(const s of m.itens){if(!s)continue;const l=invAdd(s.id,s.n,s.dur!==undefined||s.mun!==undefined?{dur:s.dur,mun:s.mun}:null);if(l)sobrou.push(Object.assign({},s,{n:l}));}
      if(sobrou.length){m.itens=sobrou;feed('Mochila cheia: ficaram coisas',true);}else{P.mochila=null;toast('corpo','Você recuperou suas coisas.');}sfx('pegar');hudBarra();invRender();break;}
    case'caixa':{const it=rollLoot('suprimentos');for(const[id,n,ex]of it)ganhar(id,n,ex);G.ev.ativo=false;G.ev.feito=true;toast('radio','Pegou os suprimentos? Bom. Agora sai daí antes que eles cheguem.');break;}
    case'fogo':cozinhar();break;
    case'carro':{if(CARRO.ativo)sairCarro();else if(CARRO.hp<=0)feed('A caminhonete quebrou',true);else if(invCount('gasolina')&&CARRO.comb<=55)abastecer();else entrarCarro();break;}
    case'guarda':abrirBau(o);break;
    case'cao':caoInteragir();break;
    case'sobrev':sobrevFalar(o);break;
    case'baseObra':baseInteragir(o);break;
    case'hist':histUsar(o);break;
    case'carcaca':esfolar(o);break;
    case'caixaMata':abrirCaixaMata(o);break;
    case'via':if(segurado&&o.u&&o.v.dono&&o.v.dono.tipo==='escadaCorda')escadaRecolher(o.v.dono,true);else comecarEscalada(o);break;
    case'escadaBaixar':escadaRecolher(o,false);break;
    case'camaObra':if(segurado)sonoComecar({cama:true,x:o.x,y:o.y,z:o.z});else dormirAqui(o);break;
    case'lamp':lampAlternar(o);break;
    case'obra':{if(invCount('tabuas')<2){feed('Precisa de 2 tábuas',true);return;}invRemove('tabuas',2);o.hp=Math.min(o.hpMax,o.hp+o.hpMax*0.5);sfx('construir');feed(OBRAS[o.tipo].nome+' consertada');hudBarra();break;}
    default:if(INTER_K[a.k])INTER_K[a.k].usar(o,segurado,a);}}
function soltarItens(itens,x,z,y){if(!itens.length)return;const nx=x+(Math.random()-0.5)*0.6,nz=z+(Math.random()-0.5)*0.6;DROPS.push({x:nx,z:nz,y:y===undefined?ground(x,z):chaoEm(nx,nz,y+0.3),itens:itens.map(i=>[i[0],i[1],i[2]||null])});}

/* ---------- missões ---------- */
function missaoInfo(){const m=G.m;
  if(m.etapa===0)return{n:'Sinal fraco',t:'Use o rádio na bancada da clareira.',alvo:INTER.find(i=>i.id==='bancada')};
  if(m.etapa===1){const falta=[];if(!m.pecas.bateria)falta.push(['bateria','a bateria no posto de gasolina','posto-oficina']);if(!m.pecas.cabo)falta.push(['cabo','o cabo no celeiro da fazenda','faz-celeiro']);if(!m.pecas.antena)falta.push(['antena','a antena na casa da vila','vila-antena']);
    let alvo=null,bd=1e9;for(const f of falta){const it=INTER.find(i=>i.id===f[2]);const d=Math.hypot(it.x-P.x,it.z-P.z);if(d<bd){bd=d;alvo=it;}}
    return{n:'Peças do transmissor',t:'Ache '+falta.map(f=>f[1]).join(', ').replace(/, ([^,]*)$/,' e $1')+'.',alvo};}
  if(m.etapa===2)return{n:'Religar a torre',t:temPecas()?'Leve as peças ao painel da torre de rádio, ao norte.':'Recupere as peças que estão na sua mochila caída e leve à torre.',alvo:TOWER_PANEL};
  if(m.etapa===3)return{n:'Última noite',t:G.noite?'Aguente até o amanhecer. O resgate está a caminho.':'O sinal foi enviado. Prepare a clareira: a próxima noite é a última.',alvo:{x:FIRE[0],z:FIRE[2]}};
  {const h=typeof histInfo==='function'?histInfo():null;if(h)return h;}
  return{n:'Modo sem fim',t:'Você foi resgatado. Continue sobrevivendo quantas noites conseguir.',alvo:null};}
function missaoRadio(){G.m.etapa=1;sfx('missao');ganharXP(40);toast('radio','...alguém na escuta? A torre ao norte ainda tem energia, mas o transmissor está sem peças.');
  setTimeout(()=>toast('radio','Precisa de uma bateria de carro, um rolo de cabo e uma antena. Tente o posto, a fazenda e a vila.'),4200);hudMissao(true);salvarJogo();}
function missaoPeca(p){const nomes={bateria:'a bateria',cabo:'o cabo',antena:'a antena'};const falta=Object.values(G.m.pecas).filter(v=>!v).length;
  toast('radio',falta?'Achou '+nomes[p]+'? Ótimo. Faltam '+falta+(falta>1?' peças.':' peça.'):'Achou a última peça. Leve tudo para o painel da torre, ao norte.');
  if(!falta)G.m.etapa=2;hudMissao(true);sfx('missao');ganharXP(80);}
function instalarTorre(){const m=G.m;if(m.etapa<2){toast('radio','O painel está morto. Ele precisa da bateria, do cabo e da antena.');return;}
  if(m.etapa>2){feed('O transmissor está ligado');return;}
  if(!temPecas()){feed('Faltam peças',true);return;}invRemove('bateria',1);invRemove('cabo',1);invRemove('antena',1);m.etapa=3;G.final=true;
  sfx('construir');toast('radio','Sinal no ar! Um helicóptero vem buscar vocês ao amanhecer da próxima noite. Aguentem firme na clareira.');
  barulho(P.x,P.z,70,true);hudMissao(true);ganharXP(200);salvarJogo();}

/* ---------- dia, noite e eventos ---------- */
function inicioNoite(){G.noite=true;G.noiteN++;G.chefeVeio=false;if(typeof cidSurto==='function')cidSurto();G.caiuNoite=false;G.luaSangue=G.noiteN>=3&&G.noiteN%4===3;G.luaSangueVivo=G.luaSangue;G.ondas=G.noiteN<=1?[20.8,23.0,1.6]:[20.6,22.4,0.6,2.8];if(G.luaSangue)G.ondas.push(21.5,3.6);if(G.final)G.ondas.push(1.8,4.0);
  toast('alerta',G.luaSangue?'Lua de sangue! Esta noite a horda vem dobrada e tem algo enorme andando com ela. Quem sobreviver ganha uma recompensa.':G.final?'A última noite começou. Eles vêm em peso. Aguente até o amanhecer.':distCidade(P.x,P.z)<40?'Anoiteceu na cidade. Os zumbis saem dos prédios e tomam as ruas: fique entre paredes fechadas.':'Anoiteceu. A horda vai atacar a clareira: fique perto das defesas.');sfx('horda',undefined,undefined,0.8);
  if(G.ev&&G.ev.ativo){G.ev.ativo=false;}hudDia();}
function inicioDia(primeiro){if(!primeiro){G.dia++;if(G.dia>=2)liberarNoite1();if(G.noiteN>0&&P.alive){ganharXP(30+20*G.noiteN);if(!G.caiuNoite)progresso('noiteLimpa');}
    if(G.luaSangue){ganharXP(150);setTimeout(()=>toast('radio','Vocês aguentaram a lua de sangue! Um avião vai largar uma caixa de suprimentos perto daí.'),2600);}}
  const eraSangue=G.luaSangue;G.noite=false;G.luaSangue=false;
  if(G.final&&G.m.etapa===3&&!primeiro){G.final=false;G.m.etapa=4;G.m.fim=true;conquista('resgatado');setTimeout(()=>mostrarFim(),1500);}
  for(const b of BUSHES)if(!b.agua&&!b.frutas&&b.cresce<=G.dia){b.frutas=true;vegDirty=true;}
  for(const p of PICKS)if(!p.agua&&!p.alive&&Math.random()<(p.kind==='cogumelo'&&typeof estacao==='function'?Math.min(0.95,0.5*estacao().cogu):0.5)){p.alive=true;vegDirty=true;}
  for(const z of Z)if(z.noturno&&z.vivo){z.noturno=false;z.st='vaga';z.hx=z.x;z.hz=z.z;}
  popularDia();popularBichos();if(!primeiro){caoAmanhece();sobrevAmanhece();sobrevRadio();histAmanhece();conqAmanhece();for(const f of AMANHECE){try{f();}catch(e){console.error(e);}}}
  G.ev=eraSangue&&!primeiro?{hora:7.2,ativo:false,feito:false}:Math.random()<0.65?{hora:9.5+Math.random()*4,ativo:false,feito:false}:null;
  G.chuvaT=Math.random()<0.35?6.5+Math.random()*10:-1;
  if(!primeiro)toast('radio',G.dia===2?'Amanheceu. Você aguentou a primeira noite. Aproveite a luz para explorar.':'Dia '+G.dia+'. Aproveite a luz para juntar o que der antes da próxima noite.');
  if(!primeiro&&G.fab){const mf=G.fab.manuais,d=G.dia===2&&!mf.manualMecanico?'A oficina do posto de gasolina, a leste pela estrada, tem um manual de mecânico. Com ele, pregos e sucata, sua bancada vira oficina.':
    G.dia===3&&!mf.cadernoCaca?'O caçador da fazenda, a sudoeste, deixou um caderno na casa. Ele ensina a costurar um casaco de pele para as noites frias.':
    G.dia===4&&!mf.guiaSocorros?'A farmácia da vila, a nordeste, deve ter um guia de primeiros socorros. Com remédios e bandagens dá para montar kit médico.':null;
    if(d)setTimeout(()=>toast('radio',d),20000);}
  hudDia();if(!primeiro){salvarJogo();const r=store.get('nnc_recorde')||{dias:0};if(G.dia>r.dias)store.set('nnc_recorde',{dias:G.dia});}}
function eventoCaixa(){const e=G.ev;let x,z,ok=false;for(let t=0;t<40&&!ok;t++){const a=Math.random()*6.283,r=45+Math.random()*65;x=Math.cos(a)*r;z=Math.sin(a)*r;ok=pontoLivre(x,z,1.5);}
  if(!ok){G.ev=null;return;}if(aereoLancar(x,z,'radio')){e.x=x;e.z=z;e.y=ground(x,z);e.ativo=false;e.caindo=true;toast('radio','Avião de suprimentos chegando! Olhe para o céu: a caixa vai descer de paraquedas.');return;}
  e.x=x;e.z=z;e.y=ground(x,z);e.ativo=true;
  const ang=Math.atan2(x,-z)*180/Math.PI,dirs=['ao norte','a nordeste','a leste','a sudeste','ao sul','a sudoeste','a oeste','a noroeste'];const dir=dirs[(Math.round(((ang+360)%360)/45))%8];
  toast('radio','Caixa de suprimentos lançada '+dir+' da clareira. Siga a fumaça vermelha, mas vai ter visita.');
  for(let i=0;i<3;i++){const a=Math.random()*6.28;criarZ(Math.random()<0.8?'walker':'runner',x+Math.cos(a)*8,z+Math.sin(a)*8);}}
function updateClock(dt){if(G.fab)G.fab.tj+=dt;if(G.raio>0)G.raio=Math.max(0,G.raio-dt);const prev=G.hora;const rate=(G.hora>=6&&G.hora<20)?1/30:1/24;G.hora+=dt*rate;G.tm=(G.tm||0)+dt*rate*60;if(G.hora>=24)G.hora-=24;const h=G.hora;
  if(crossed(prev,h,20))inicioNoite();if(crossed(prev,h,6))inicioDia(false);
  if(G.noite)for(let i=G.ondas.length-1;i>=0;i--)if(crossed(prev,h,G.ondas[i])){G.ondas.splice(i,1);ondaNoturna();}
  if(G.ev&&!G.ev.ativo&&!G.ev.feito&&G.ev.x===undefined&&crossed(prev,h,G.ev.hora))eventoCaixa();
  if(crossed(prev,h,18.6)&&!G.noite)toast('clima',G.noiteN===0?'Está escurecendo. Dá para ouvir coisas se mexendo na mata... volte para perto do fogo.':'Escurecendo de novo. Eles estão acordando.');
  if(G.chuvaT>0&&crossed(prev,h,G.chuvaT)){G.chuvaAlvo=1;G.chuvaFim=(h+1.5+Math.random()*2.5)%24;toast('clima','Começou a chover. O barulho fica abafado e os zumbis enxergam menos.');}
  if(G.chuvaAlvo===1&&G.chuvaFim!==undefined&&crossed(prev,h,G.chuvaFim)){G.chuvaAlvo=0;G.chuvaFim=undefined;}
  G.chuva=approach(G.chuva,G.chuvaAlvo,dt/20);}

/* ---------- morte, salvar e carregar ---------- */
function morrer(){if(!P.alive)return;if(typeof diarioEvento==='function')diarioEvento('Você caiu em '+(typeof zonaEm==='function'&&zonaEm(P.x,P.z)?zonaEm(P.x,P.z).nome:'combate'),'combate');poca(P.x,P.y,P.z,0.95);G.luaSangueVivo=false;salvarRecorde();if(CARRO.ativo){CARRO.ativo=false;CARRO.v=0;IN.freio=false;carroColisor();body.classList.remove('dirigindo');}P.alive=false;P.mortoT=0;P.vida=0;G.mortes++;P.acao=null;
  const itens=P.inv.slice(BAR_N).filter(Boolean);for(let i=BAR_N;i<INV_N;i++)P.inv[i]=null;
  if(itens.length){if(P.mochila){P.mochila.itens.push(...itens);}else P.mochila={x:P.x,z:P.z,y:ground(P.x,P.z),itens};}
  if(document.pointerLockElement)document.exitPointerLock();}
function renascer(){resetLesoes();corpoLevanta();P.escala=null;P.rola=null;P.muro=null;P.queima=0;P.skMorte=0;P.invul=0;if(P.ch&&P.ch.sk){P.ch.sk.clip=null;P.ch.sk.cw=0;P.ch.sk.dyRaiz=0;}P.noChao=false;P.y=ground(SPAWN[0],SPAWN[1]);P.alive=true;P.agachado=false;P.vida=65;P.fome=Math.max(P.fome,45);P.sede=Math.max(P.sede,45);P.energia=100;P.x=SPAWN[0];P.z=SPAWN[1];P.vx=P.vz=0;P.ch.pitch=0;P.mortoT=0;
  {const cm=G.cama&&OB.find(o=>o.tipo==='cama'&&Math.hypot(o.x-G.cama.x,o.z-G.cama.z)<0.3&&Math.abs(o.y-G.cama.y)<0.3);if(cm){P.x=cm.x+Math.sin(cm.yaw)*1.3;P.z=cm.z+Math.cos(cm.yaw)*1.3;P.y=chaoEm(P.x,P.z,cm.y+0.4);}
   else if(G.cama&&G.cama.vagao){P.x=G.cama.x;P.z=G.cama.z;P.y=chaoEm(P.x,P.z,G.cama.y+0.4);}}
  for(const z of Z)if(z.vivo&&Math.hypot(z.x-P.x,z.z-P.z)<14){const a=Math.atan2(z.x-P.x,z.z-P.z);z.x=P.x+Math.sin(a)*22;z.z=P.z+Math.cos(a)*22;z.st=z.noturno?'marcha':'vaga';}
  salvarJogo();}
const MUNDO_V=2;   // muda quando o mapa muda (árvores, casas): o save antigo não aplica a lista velha de árvores e rochas
/* posição gravada: no meio de uma escalada (cipó, escada de corda) grava a saída mais perto (base ou topo), para não voltar pendurado no ar e cair.
   Em cima de uma árvore gigante, encostado no tronco, o carregar acharia que você ficou "dentro" do tronco e mandaria para o chão:
   grava um pouco mais para fora, no mesmo galho (seguindo o rumo da saída do cipó, quando houver). */
function posSalvar(){const e=P.escala;let q={x:P.x,z:P.z,y:P.y};
  if(e&&e.v&&e.v.base&&e.v.topo){const p=e.u>=0.5?e.v.topo:e.v.base;q={x:p.x,z:p.z,y:p.y+0.02,rumo:p.rumo};}
  if(q.y>-20&&typeof bloqueadoAlto==='function'){const c=bloqueadoAlto(q.x,q.z,0.4,q.y);
    if(c&&c.gigante&&q.y>ground(q.x,q.z)+1.2){const T=c.gigante,R=T.R*0.98+0.5;let dx=q.x-T.x,dz=q.z-T.z;if(q.rumo!==undefined){dx=Math.sin(q.rumo);dz=Math.cos(q.rumo);}
      const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
      for(let d=0;d<3;d+=0.1){const x=T.x+dx*(R+d),z=T.z+dz*(R+d),y=chaoEm(x,z,q.y+0.6);if(Math.abs(y-q.y)<0.9&&!bloqueadoAlto(x,z,0.4,y)){q={x,z,y:y+0.02};break;}}}}
  return q;}
function serializar(){const q=posSalvar();return{v:1,mv:MUNDO_V,dia:G.dia,hora:G.hora,noiteN:G.noiteN,noite:G.noite,final:G.final,kills:G.kills,mortes:G.mortes,m:G.m,ev:G.ev,ondas:G.ondas,chuva:G.chuvaAlvo,dicas:G.dicas,
  P:{x:q.x,z:q.z,yaw:P.yaw,vida:P.vida,fome:P.fome,sede:P.sede,energia:P.energia,inv:P.inv,sel:P.sel,lanterna:P.lanterna,roupa:P.roupa,bat:+(P.bat||0).toFixed(1),y:+(q.y||0).toFixed(2)},tm:+(G.tm||0).toFixed(2),cama:G.cama||null,caixas:caixasSalvar(),mapaAlvo:G.mapaAlvo,mapaCid:G.mapaCid||null||null,mochila:P.mochila,
  obras:OB.map(o=>[o.tipo,+o.x.toFixed(2),+o.z.toFixed(2),+o.yaw.toFixed(3),Math.round(o.hp),o.hpMax,o.itens||0,+o.y.toFixed(2),o.ext&&Object.keys(o.ext).length?o.ext:0]),
  arvores:TREES.filter(t=>!t.alive).map(t=>t.id),rochas:ROCKS.filter(r=>!r.alive).map(r=>r.id),
  arbustos:BUSHES.filter(b=>!b.frutas).map(b=>[b.id,b.cresce]),inter:INTER.filter(i=>i.dia!==undefined).map(i=>[i.id,i.dia]),
  carro:(t=>({x:+t.x.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(3),comb:+t.comb.toFixed(3),hp:Math.round(t.hp)}))(VEICS.find(v=>v.tipo==='caminhonete')||CARRO),
  cao:{a:CAO.ativo,st:CAO.st,m:CAO.modo,x:+CAO.x.toFixed(2),z:+CAO.z.toFixed(2),hp:Math.round(CAO.hp),fx:+CAO.ficaX.toFixed(2),fz:+CAO.ficaZ.toFixed(2)},
  prog:{xp:G.xp,nivel:G.nivel,pontos:G.pontos,perks:G.perks,tarefas:G.tarefas,tarefaN:G.tarefaN,luaSangue:G.luaSangue,caiuNoite:G.caiuNoite},fab:G.fab,cid:cidSalvar(),sob:sobrevSalvar(),x8:v8Salvar()};}
function salvarJogo(){if(G.modo!=='jogo'&&G.modo!=='pausa'&&G.modo!=='morto')return;G.salvarT=45;let s;try{s=serializar();}catch(e){console.error(e);saveFalhou('erro ao montar o save');return false;}return gravarSave(s);}
function resetMundo(){for(const t of TREES){if(t.agua)continue;if(!t.alive){t.alive=true;t.hp=5;if(!COLL.find(c=>c.tree===t))colCircle(t.x,t.z,TREE_R*t.s,{tree:t});}t.hp=5;}
  for(const r of ROCKS){if(r.agua)continue;if(!r.alive){r.alive=true;colCircle(r.x,r.z,0.85*r.s,{rock:r});}r.hp=4;}
  for(const b of BUSHES){if(b.agua)continue;b.frutas=true;b.cresce=0;}for(const p of PICKS)if(!p.agua)p.alive=true;for(const i of INTER)delete i.dia;
  while(OB.length)destruirObraSilenciosa(OB[0]);Z.length=0;BICHOS.length=0;DROPS.length=0;PART.length=0;RINGS.length=0;MANCHAS.length=0;resetArmas2();resetAmbiente();resetZumbis2();resetArmas3();resetEfeitos();vegDirty=true;}
function destruirObraSilenciosa(o){const i=OB.indexOf(o);if(i>=0)OB.splice(i,1);colRemove(o.col);desmontarAlto(o);desmontarBase(o);const fi=FIRES.findIndex(f=>f.obra===o);if(fi>=0)FIRES.splice(fi,1);}
function novoJogo(){resetMundo();Object.assign(G,{dia:1,hora:7.0,noiteN:0,noite:false,final:false,kills:0,mortes:0,chuva:0,chuvaAlvo:0,chuvaT:-1,ev:null,ondas:[],dicas:{},
  m:{etapa:0,pecas:{bateria:false,cabo:false,antena:false},fim:false},xp:0,nivel:1,pontos:0,perks:{},tarefas:[],tarefaN:0,luaSangue:false,caiuNoite:false,raio:0});G.fab=fabNovo();
  const pi=pontoInicio(),yi=Math.atan2(-pi[0],-pi[1]);
  Object.assign(P,{escala:null,noChao:true,y:ground(pi[0],pi[1]),x:pi[0],z:pi[1],yaw:yi,pitch:-0.06,body:yi,vx:0,vz:0,vida:100,fome:85,sede:80,energia:100,sel:0,acao:null,alive:true,mochila:null,lanterna:false,air:0,vy:0});
  P.inv=new Array(INV_N).fill(null);P.agachado=false;P.agK=0;P.muro=null;P.rola=null;P.escala=null;P.queima=0;P.skMorte=0;if(P.ch&&P.ch.sk){P.ch.sk.clip=null;P.ch.sk.cw=0;P.ch.sk.dyRaiz=0;}P.socoMad=0;P.roupa={cabeca:null,tronco:null,pernas:null,pes:null,costas:null};
  for(const a of BARRICADE_ARC.angs){const p=a*Math.PI/180;criarObra('barricada',BARRICADE_ARC.r*Math.sin(p),-BARRICADE_ARC.r*Math.cos(p),-p);}
  criarObra('portao',0,-BARRICADE_ARC.r,0);
  cidNovo();G.cama=null;inicioDia(true);G.noiteN=0;encherTarefas();carroInicio();caoInicio();body.classList.remove('dirigindo');
  G.tm=0;G.mapaAlvo=null;G.mapaCid=null;G.obsAte=0;P.bat=0;caixasNovo();sobrevInicio();v8Novo();}
/* ponto de partida: um lugar livre na mata perto de INICIO */
function pontoInicio(){for(let r=0;r<12;r+=0.75)for(let k=0;k<12;k++){const a=k/12*6.283,x=INICIO[0]+Math.cos(a)*r,z=INICIO[1]+Math.sin(a)*r;if(!pointBlocked(x,z,0.7))return[x,z];}return[INICIO[0],INICIO[1]];}
/* carregarJogo (48w_save) escolhe a fonte boa e chama este */
function carregarSave(s){resetMundo();
  Object.assign(G,{dia:s.dia,hora:s.hora,noiteN:s.noiteN,noite:s.noite,final:s.final,kills:s.kills||0,mortes:s.mortes||0,m:s.m,ev:s.ev,ondas:s.ondas||[],chuvaAlvo:s.chuva||0,chuva:s.chuva||0,dicas:s.dicas||{}});
  Object.assign(P,s.P,{alive:true,acao:null,vx:0,vz:0,air:0,vy:0,body:s.P.yaw,agachado:false,agK:0,escala:null,muro:null,rola:null,queima:0,skMorte:0,noChao:false});if(P.ch&&P.ch.sk){P.ch.sk.clip=null;P.ch.sk.cw=0;P.ch.sk.dyRaiz=0;}if(typeof P.y!=='number')P.y=ground(P.x,P.z);P.inv=(s.P.inv||[]).slice(0,INV_N);while(P.inv.length<INV_N)P.inv.push(null);P.mochila=s.mochila||null;
  {const r=s.P.roupa||{};P.roupa={};for(const k of ROUPA_SLOTS)P.roupa[k]=null;
   // peças salvas numa vaga que mudou (ex.: máscara de gás foi da cabeça para o rosto) vão para a vaga nova; se ela estiver ocupada, voltam para a mochila
   const sobra=[];for(const k in r){const id=r[k];if(!id||!ITEMS[id]||!ITEMS[id].slot)continue;const sl=ITEMS[id].slot;if(!P.roupa[sl])P.roupa[sl]=id;else sobra.push(id);}
   if(!s.P.roupa)P.roupa.costas='mochila';for(const id of sobra){if(invAdd(id,1))soltarItens([[id,1]],P.x,P.z,P.y);}}
  const mesmoMapa=s.mv===MUNDO_V;
  if(mesmoMapa)for(const id of s.arvores||[]){const t=TREES[id];if(t&&!t.agua){t.alive=false;colRemove(COLL.find(c=>c.tree===t)||{});}}
  if(mesmoMapa)for(const id of s.rochas||[]){const r=ROCKS[id];if(r&&!r.agua){r.alive=false;colRemove(COLL.find(c=>c.rock===r)||{});}}
  for(const[id,c]of s.arbustos||[]){const b=BUSHES[id];if(b){b.frutas=false;b.cresce=c;}}
  for(const[id,d]of s.inter||[]){const it=INTER.find(i=>i.id===id);if(it)it.dia=d;}
  for(const o of s.obras||[]){if(!OBRAS[o[0]])continue;const ob=criarObra(o[0],o[1],o[2],o[3],o[4],false,typeof o[7]==='number'?o[7]:undefined,o[8]||undefined);if(o[5])ob.hpMax=o[5];if(ob.itens&&Array.isArray(o[6]))for(let i=0;i<BAU_N;i++){const it=o[6][i];ob.itens[i]=it&&ITEMS[it.id]&&it.n>0?it:null;}}
  G.fab=fabCarregar(s.fab);cidCarregar(s.cid);
  G.cama=s.cama||null;G.tm=typeof s.tm==='number'?s.tm:(s.dia-1)*1440+((s.hora-6+24)%24)*60;G.mapaAlvo=s.mapaAlvo||null;G.mapaCid=s.mapaCid||null;G.obsAte=0;P.bat=+P.bat||0;caixasCarregar(s.caixas);
  veicPadrao();if(s.carro){const t=VEICS[0];Object.assign(t,s.carro,{ativo:false,v:0});t.y=chaoVeic(t.x,t.z);CARRO=t;veicColisor(t);}body.classList.remove('dirigindo');
  caoInicio();if(s.cao&&s.cao.a){const k=s.cao;Object.assign(CAO,{ativo:true,st:k.st,modo:k.m||'segue',x:k.x,z:k.z,hp:k.hp||CAO.hpMax,ficaX:k.fx||k.x,ficaZ:k.fz||k.z});
    if(CAO.st==='ataca')CAO.st=CAO.modo;if(CAO.st==='carro'){CAO.st='segue';CAO.modo='segue';CAO.x=P.x+1.5;CAO.z=P.z-1;}if(CAO.st==='ferido'){CAO.st='descansa';CAO.x=FIRE[0]+1.9;CAO.z=FIRE[2]+1.3;}
    if(!['segue','fica','descansa'].includes(CAO.st)){CAO.st='segue';CAO.modo='segue';}CAO.y=ground(CAO.x,CAO.z);}
  const pg=s.prog||{};Object.assign(G,{xp:pg.xp||0,nivel:pg.nivel||1,pontos:pg.pontos||0,perks:pg.perks||{},tarefas:pg.tarefas||[],tarefaN:pg.tarefaN||0,luaSangue:!!pg.luaSangue,caiuNoite:!!pg.caiuNoite});encherTarefas();
  sobrevCarregar(s.sob);v8Carregar(s.x8);
  if(!mesmoMapa||P.y>-20&&bloqueadoAlto(P.x,P.z,0.3,P.y))desentalar();
  popularDia();popularBichos();if(G.noite)ondaNoturna();
  vegDirty=true;saveDepoisDeCarregar(s);return true;}
/* o save foi feito num mapa diferente (ou o jogador ficou dentro de algo): procura o lugar livre mais perto */
function desentalar(){if(P.y<-20||CARRO.ativo)return;if(!bloqueadoAlto(P.x,P.z,0.35,P.y)&&dentroMapa(P.x,P.z,1))return;
  for(let r=1;r<40;r+=0.7)for(let k=0;k<16;k++){const a=k/16*6.283,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(!dentroMapa(x,z,1)||pointBlocked(x,z,0.4))continue;if(RIO.ok&&aguaProf(x,z)>0.8)continue;P.x=x;P.z=z;P.y=chaoEm(x,z,ground(x,z)+2);P.vy=0;return;}}

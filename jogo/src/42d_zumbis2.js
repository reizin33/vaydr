/* ================= mais zumbis e os chefes de cada região =================
   rastejante: se arrasta pelo chão, some no mato e agarra a perna (pode fazer sangrar). Bala alta passa por cima.
   policial: farda, colete e capacete. Bala e flecha no peito perdem força; tiro na cabeça bate no capacete
     até ele voar longe (2 acertos). Espingarda e rifle atravessam.
   inchado: estufado de gás. Quando morre ou chega perto, estoura numa nuvem verde que machuca e faz tossir.
     O gás pega fogo: molotov nele vira explosão.
   cachorro zumbi: vem em matilha de noite, muito rápido; morde e recua, morde e recua.
   chefes de região: um em cada lugar, aparece quando você chega perto e só uma vez por jogo.
     Açougueiro (Armazém Sul) · Sargento (Delegacia) · Paciente Zero (Hospital) · Maquinista (túnel do metrô) · Fazendeiro (fazenda) */
Object.assign(ZS,{
  rastejante:{hp:65,vaga:0.3,caca:1.05,dano:9,alcance:1.3,r:0.3,malha:'walker',baixo:true,xp:14,obra:0.4,sangra:0.3},
  policial:{hp:150,vaga:0.65,caca:1.95,dano:14,alcance:1.6,r:0.36,malha:'policial',xp:30,colete:0.6,capacete:2},
  inchado:{hp:85,vaga:0.45,caca:1.35,dano:8,alcance:1.4,r:0.44,malha:'inchado',xp:24,gas:3.4,obra:0.6,esc:1.08},
  caoZ:{hp:45,vaga:1.4,caca:5.4,dano:7,alcance:1.3,r:0.28,malha:'caoZ',xp:14,cao:true,obra:0.25,sangra:0.22},
  acougueiro:{hp:1100,vaga:0.6,caca:1.8,dano:26,alcance:2.0,r:0.55,malha:'brute',xp:300,obra:4,chefeR:1,esc:1.5,sangra:0.6},
  sargento:{hp:900,vaga:0.6,caca:2.15,dano:18,alcance:1.7,r:0.42,malha:'policial',xp:280,obra:2,chefeR:1,esc:1.28,colete:0.45,capacete:5},
  pacienteZero:{hp:800,vaga:0.5,caca:1.55,dano:14,alcance:1.6,r:0.5,malha:'inchado',xp:280,obra:2,chefeR:1,esc:1.35,gas:5.5},
  maquinista:{hp:650,vaga:0.9,caca:4.3,dano:16,alcance:1.6,r:0.38,malha:'runner',xp:260,obra:2,chefeR:1,esc:1.18},
  fazendeiro:{hp:1000,vaga:0.55,caca:1.85,dano:22,alcance:2.5,r:0.48,malha:'walker',xp:280,obra:3,chefeR:1,esc:1.38}});
Object.assign(ZP,{rastejante:ZP.walker,caoZ:ZP.walker,
  policial:{lean:0.16,arm:1.05,arm2:0.95,spread:0.1,leg:0.42,sway:0.8,tilt:0.06},
  inchado:{lean:0.06,arm:0.7,arm2:0.62,spread:0.36,leg:0.34,sway:1.7,tilt:0.2},
  acougueiro:{lean:0.3,arm:0.75,arm2:0.6,spread:0.28,leg:0.34,sway:0.8,tilt:0.08},
  sargento:{lean:0.12,arm:0.9,arm2:0.85,spread:0.12,leg:0.44,sway:0.6,tilt:0.04},
  pacienteZero:{lean:0.04,arm:0.85,arm2:0.8,spread:0.38,leg:0.32,sway:1.9,tilt:0.24},
  maquinista:ZP.runner,
  fazendeiro:{lean:0.2,arm:0.5,arm2:1.0,spread:0.15,leg:0.42,sway:0.9,tilt:0.1}});
/* roupas (cascas sobre o corpo do Yaku) e tom de pele de cada tipo */
const ZR=(sub,inf,cor,pelo)=>({sub,inf,cor,pelo:pelo||0});
const ZVISUAL={
  policial:{tint:[0.86,0.9,0.98],roupas:[ZR('troncoLongo',0.014,0x3e5170),ZR('troncoCurto',0.036,0x15181d,0.08),ZR('pernas',0.008,0x1c2433),ZR('pes',0.012,0x111111)]},
  inchado:{tint:[0.98,1.02,0.86],roupas:[ZR('troncoCurto',0.075,0x7b8562,0.4),ZR('pernas',0.009,0x3a3a30)]},
  rastejante:{tint:[0.82,0.82,0.76]},
  acougueiro:{tint:[1.0,0.78,0.72],roupas:[ZR('troncoCurto',0.03,0xc9bfae,0.12),ZR('pernas',0.008,0x2f2a26),ZR('pes',0.014,0x1a1714)]},
  sargento:{tint:[0.8,0.84,0.9],roupas:[ZR('troncoLongo',0.014,0x2c3a52),ZR('troncoCurto',0.044,0x23281e,0.1),ZR('pernas',0.009,0x161c28),ZR('pes',0.013,0x0d0d0d)]},
  pacienteZero:{tint:[1.08,1.06,0.86],roupas:[ZR('troncoLongo',0.085,0xa9c3c6,0.15),ZR('pernas',0.012,0xa9c3c6)]},
  maquinista:{tint:[0.78,0.8,0.84],roupas:[ZR('troncoLongo',0.014,0x34475a),ZR('pernas',0.009,0x34475a),ZR('pes',0.012,0x151515),ZR('cabeca',0.03,0x2a3a4a),ZR('cabecaAba',0.05,0x1a1a1a)]},
  fazendeiro:{tint:[0.95,0.86,0.76],roupas:[ZR('troncoLongo',0.014,0x6e2e22,0.2),ZR('pernas',0.009,0x3a4a6a),ZR('pes',0.014,0x3a2a1a),ZR('cabeca',0.05,0xc8a860,0.6),ZR('cabecaAba',0.11,0xc8a860,0.6)]}};
const CHEFES_R=[
  {id:'acougueiro',nome:'O Açougueiro',onde:{predio:'Armazém Sul'},arma:'cutelo',
    boato:'Quem passou pelo Armazém Sul viu um sujeito enorme de avental, com um cutelo na mão. Corta fundo: leve curativo.',
    loot:[['facao',1],['carneCrua',6],['feijao',4],['bandagem',3]]},
  {id:'sargento',nome:'O Sargento',onde:{predio:'Delegacia'},
    boato:'Na Delegacia tem um policial de capacete e colete que não cai com tiro de pistola. E ele apita: chama os outros.',
    loot:[['espingarda',1],['cartucho',12],['municao9',10]]},
  {id:'pacienteZero',nome:'Paciente Zero',onde:{predio:'Hospital',andar:9},
    boato:'No último andar do Hospital São Lucas está o Paciente Zero. Ele solta gás verde: não fique perto, e fogo nele estoura tudo.',
    loot:[['seringa',3],['mascaraGas',1],['kit',1],['remedios',3]]},
  {id:'maquinista',nome:'O Maquinista',onde:{metroTunel:true},
    boato:'Lá no túnel do metrô tem um que corre feito trem e vem em linha reta. Desvie para o lado e ele bate na parede.',
    loot:[['rifle',1],['balaRifle',10],['lanterna',1]]},
  {id:'fazendeiro',nome:'O Fazendeiro',onde:{lugar:'fazenda',dx:-9.5,dz:13},arma:'forcado',
    boato:'O dono da fazenda ainda anda pelo terreiro com o forcado. Alcança longe. Quando ele toca o berrante, os mortos do pasto levantam.',
    loot:[['besta',1],['virote',12],['sementes',10],['corda',3]]}];
const CHEFE_R_DEF=id=>CHEFES_R.find(c=>c.id===id);
/* ---------- malhas ---------- */
function zumbis2Meshes(){const mk=(t,seed,f)=>{const sp=zombieSpec('walker',seed);sp.type=t;if(f)f(sp);return{mesh:litMesh(buildHuman(sp,zombieExtras)),bones:bonesOf(sp),sk:SKT.yaku};};
  ZMESH.policial=[mk('policial',31,p=>{Object.assign(p.c,{shirt:0x1f2a3d,sleeveL:0x1f2a3d,sleeveR:0x1f2a3d,foreL:0x1f2a3d,foreR:0x1f2a3d,pants:0x1c2433,shinL:0x1c2433,shinR:0x1c2433});p.hair=0;p.cabelo=0;}),
    mk('policial',37,p=>{Object.assign(p.c,{shirt:0x24314a,sleeveL:0x24314a,sleeveR:0x24314a,foreL:0x8b9a76,foreR:0x24314a,pants:0x1c2433,shinL:0x1c2433,shinR:0x1c2433});p.hair=0;p.cabelo=0;})];
  ZMESH.inchado=[mk('inchado',33,p=>{Object.assign(p,{chestW:0.64,waistW:0.66,depth:0.42,hipW:0.46,stains:5,longHair:false});Object.assign(p.c,{skin:0x9aa86a,shirt:0x8f9a5a,sleeveL:0x9aa86a,sleeveR:0x9aa86a,foreL:0x9aa86a,foreR:0x9aa86a});})];
  ZMESH.caoZ=[buildCaoZ()];}
/* cachorro zumbi: o mesmo esqueleto do Caramelo, pelo ralo cinza, feridas, costelas à mostra e sem coleira */
function buildCaoZ(){const g=new GB(2048,8),R=rng(611),pel=lin(0x56493e),pel2=lin(0x342b24),pele=lin(0x7a6258),fer=lin(0x3e0c08),oss=lin(0xb0a68e),pre=lin(0x0e0c0b);
  const put=(b,t,m,col,o)=>add(g,t,m,col,Object.assign({b,j:0.08,rnd:R},o||{}));
  put(0,bevelTris(0.24,0.25,0.62,0.07,{bx:0.9}),mat(0,0,0),pel);put(0,bevelTris(0.17,0.06,0.42,0.03),mat(0,-0.12,0.02),pele);
  put(0,bevelTris(0.18,0.05,0.46,0.02),mat(0,0.125,-0.03),pel2);
  put(0,bevelTris(0.02,0.14,0.2,0.008),mat(0.122,-0.01,0.06),pele,{j:0.1});for(let i=0;i<4;i++)put(0,boxTris(0.012,0.016,0.16),mat(0.13,-0.06+i*0.04,0.06,0,0,0),oss,{j:0.03});   // costelas à mostra num lado
  put(0,bevelTris(0.02,0.08,0.12,0.008),mat(-0.122,0.05,-0.14),fer,{j:0.1});put(0,bevelTris(0.12,0.02,0.16,0.008),mat(0.0,0.128,0.12),fer,{j:0.1});
  put(1,bevelTris(0.13,0.19,0.14,0.04),mat(0,0.07,0.02,0.4,0,0),pel);put(1,bevelTris(0.16,0.15,0.19,0.05,{tz:0.9}),mat(0,0.17,0.08),pel);
  put(1,bevelTris(0.095,0.08,0.14,0.03),mat(0,0.13,0.21),pel2);put(1,boxTris(0.045,0.032,0.03),mat(0,0.16,0.282),pre,{j:0});
  put(1,boxTris(0.07,0.03,0.09),mat(0,0.09,0.235,0.3,0,0),lin(0x3a1010));   // boca aberta
  for(let i=0;i<4;i++)put(1,boxTris(0.012,0.022,0.012),mat(-0.027+i*0.018,0.112,0.272),oss,{j:0});
  for(const s of[1,-1]){put(1,boxTris(0.02,0.016,0.012),mat(s*0.05,0.2,0.172),lin(0x8a2a18),{j:0,e:0.45});
    put(1,cylTris(0,0.048,0.11,3,{phase:Math.PI/6}),mat(s*0.06,0.232,0.05,0.4,0,-s*0.5,1,1,0.55),pel2);}
  for(let i=0;i<4;i++){const b=2+i;put(b,cylTris(0.04,0.026,0.34,6),mat(0,-0.34,0),pel);if(i===1)put(b,bevelTris(0.03,0.08,0.05,0.01),mat(0.03,-0.12,0.0),fer,{j:0.1});}
  put(6,cylTris(0.012,0.024,0.24,5),mat(0,0,0),pel2);
  return{mesh:litMesh(g.data()),bones:caoBones()};}
/* ---------- criação: roupas, capacete, chefes ---------- */
function zNovo2(q){const S=ZS[q.tipo];if(!S)return;
  if(S.capacete)q.capacete=S.capacete;
  const v=ZVISUAL[q.tipo];if(v){if(v.roupas)q.ch.roupas=v.roupas.slice();if(v.tint&&!q.tint)q.tint=v.tint.slice();}
  if(S.chefeR){const d=CHEFE_R_DEF(q.tipo);q.chefeR={fase:null,t:0,cd1:3+Math.random()*2,cd2:7,cd3:0,usou:false};q.nomeChefe=d?d.nome:q.tipo;}
  if(S.cao){q.ch.yaw=Math.random()*6.28;q.recua=0;}}
/* ---------- onde o corpo está (para tiro e flecha) ---------- */
function zCorpo(z){const sc=z.ch.s||1,S=ZS[z.tipo]||{};
  if(S.baixo){const fx=Math.sin(z.ch.yaw),fz=Math.cos(z.ch.yaw);return{a:[z.x-fx*0.75*sc,z.y+0.16,z.z-fz*0.75*sc],b:[z.x+fx*0.78*sc,z.y+0.3,z.z+fz*0.78*sc],r:0.27*sc,cab:0.8};}
  if(S.cao){const fx=Math.sin(z.ch.yaw),fz=Math.cos(z.ch.yaw);return{a:[z.x-fx*0.36,z.y+0.42,z.z-fz*0.36],b:[z.x+fx*0.5,z.y+0.58,z.z+fz*0.5],r:0.22,cab:0.74};}
  return{a:[z.x,z.y+0.2,z.z],b:[z.x,z.y+1.82*sc,z.z],r:0.34*sc,cab:(1.5*sc-0.2)/(1.82*sc-0.2)};}
/* colete e capacete: chamado por ferirZ com o tipo do golpe que acabou de acontecer */
let ZHIT=null;
const ARMA_FORTE=new Set(['espingarda','rifle']);
function zArmadura(z,dmg){const h=ZHIT;ZHIT=null;const S=ZS[z.tipo];if(!h||!S)return dmg;
  if(h.head&&z.capacete>0&&h.k!=='golpe'){if(h.arma&&ARMA_FORTE.has(h.arma)){z.capacete=0;capaceteVoa(z);return dmg;}
    z.capacete--;const p=xf(z.ch.m.subarray(2*16,3*16),0,0.16,0.02);faiscas(p[0],p[1],p[2]);sfx('capacete',z.x,z.z,1);
    if(z.capacete<=0)capaceteVoa(z);else dica('capacete','corpo','O tiro bateu no capacete! Mais um acerto na cabeça e ele voa longe. Espingarda e rifle atravessam.');
    return dmg/(h.mult||(h.k==='flecha'?2.5:2.6))*0.45;}
  if(S.colete&&!h.head&&h.k!=='fogo'&&(!h.reg||h.reg==='tronco')){/* o colete cobre só o tronco: braço e perna entram inteiros */if(h.arma&&ARMA_FORTE.has(h.arma))return dmg*0.9;return dmg*(h.k==='golpe'?Math.min(1,S.colete+0.25):S.colete);}
  return dmg;}
function capaceteVoa(z){z.capacete=0;progresso('capacete');sfx('capacete',z.x,z.z,1.2);{const m=z.ch.m.subarray(2*16,3*16),p=xf(m,0,0.15,0.0),sc=z.ch.s||1;CAPACETES.push({x:p[0],y:p[1],z:p[2],vx:(Math.random()-0.5)*2.5,vy:3+Math.random()*1.5,vz:(Math.random()-0.5)*2.5,rx:0,ry:z.ch.yaw,rz:0,wx:(Math.random()-0.5)*14,wz:(Math.random()-0.5)*14,t:0,s:sc,chao:false});}
  const p=xf(z.ch.m.subarray(2*16,3*16),0,0.16,0.02);for(let i=0;i<10;i++)part(p[0],p[1],p[2],(Math.random()-0.5)*3,2+Math.random()*2,(Math.random()-0.5)*3,0.9,0.06,[0.09,0.1,0.12,1],false,9.8);
  feed('O capacete voou!');}
/* ---------- gás verde dos inchados ---------- */
const GAS=[];let gasT=0;
function gasNuvem(x,y,z,r,dur,forte){GAS.push({x,y,z,r,dur,t:0,f:forte||1,puf:Array.from({length:9},(_,i)=>({a:i*0.7,d:Math.random(),h:Math.random()}))});sfx('gas',x,z,1);}
function estourarInchado(z,motivo){if(z.estourou)return;z.estourou=true;const S=ZS[z.tipo],r=S.gas||3.4;
  gasNuvem(z.x,z.y,z.z,r,z.tipo==='pacienteZero'?12:9,z.tipo==='pacienteZero'?1.5:1);sangue(z.x,z.y+1,z.z,16);
  for(let i=0;i<18;i++)part(z.x,z.y+1,z.z,(Math.random()-0.5)*6,Math.random()*4,(Math.random()-0.5)*6,0.9,0.09,[0.42,0.5,0.16,0.9],false,9.8);
  if(motivo==='perto'&&z.vivo){z.hp=0.5;ferirZ(z,5,0,0,1);}
  dica('inchado','alerta','O inchado estourou numa nuvem de gás! Saia de dentro dela. Dica: de longe, uma flecha ou um tiro estoura ele sem você no meio. Fogo no gás explode.');}
function explodirGas(g){g.explodiu=true;g.dur=Math.min(g.dur,g.t+0.4);sfx('impacto',g.x,g.z,1.4);sfx('fogo',g.x,g.z,1.2);P.shake=Math.max(P.shake,0.5*clamp(1-Math.hypot(P.x-g.x,P.z-g.z)/25,0,1));
  for(let i=0;i<40;i++){const a=Math.random()*6.283,v=3+Math.random()*6;part(g.x,g.y+0.6,g.z,Math.cos(a)*v,1+Math.random()*4,Math.sin(a)*v,0.6+Math.random()*0.4,0.14,[1,0.55+Math.random()*0.3,0.15,1],true,-1);}
  RINGS.push({x:g.x,z:g.z,y:g.y+0.3,a:0});const R=g.r+1.5;
  for(const z of Z)if(z.vivo&&d2(z.x,z.z,g.x,g.z)<R*R&&Math.abs(z.y-g.y)<3){ZHIT={k:'fogo'};ferirZ(z,95,(z.x-g.x)*0.3,(z.z-g.z)*0.3,1);if(z.vivo&&typeof acender==='function')acender(z,6);}
  const d=Math.hypot(P.x-g.x,P.z-g.z);if(P.alive&&d<R&&Math.abs(P.y-g.y)<3){ferirJogador(30*(1-0.5*d/R),{x:g.x,z:g.z});if(typeof empurraJogador==='function')empurraJogador({x:g.x,z:g.z},7);}
  for(const o of OB)if(d2(o.x,o.z,g.x,g.z)<R*R)danoObra(o,60);
  dica('gasFogo','corpo','O gás do inchado pegou fogo e explodiu! Dá para usar isso: atraia zumbis para a nuvem e jogue um molotov.');progresso('explosaoGas');}
function updateGas(dt){P.gas=Math.max(0,(P.gas||0)-dt*0.5);gasT-=dt;let dentro=null;
  for(let i=GAS.length-1;i>=0;i--){const g=GAS[i];g.t+=dt;if(g.t>g.dur){GAS.splice(i,1);continue;}
    const R=g.r*Math.min(1,0.45+g.t*1.6);g.R=R;
    if(!g.explodiu){for(const c of CHAMAS)if((c.k||0)>0.1&&d2(c.x,c.z,g.x,g.z)<(R+0.6)*(R+0.6)){explodirGas(g);break;}
      if(!g.explodiu)for(const q of Z)if(q.vivo&&(q.queima||0)>0&&d2(q.x,q.z,g.x,g.z)<R*R){explodirGas(g);break;}}
    if(g.explodiu)continue;
    if(P.alive&&!CARRO.ativo&&d2(P.x,P.z,g.x,g.z)<R*R&&Math.abs(P.y-g.y)<2.6)dentro=g;
    for(const s of SOBREV)if(sobAtivo(s)&&d2(s.x,s.z,g.x,g.z)<R*R&&Math.random()<dt*1.2)ferirSobrev(s,4*g.f);
    if(caoAtivoLivre()&&d2(CAO.x,CAO.z,g.x,g.z)<R*R&&Math.random()<dt*1.2)ferirCao(3*g.f);
    if(Math.random()<dt*7){const a=Math.random()*6.283,r=Math.random()*R;part(g.x+Math.cos(a)*r,g.y+0.2+Math.random()*1.2,g.z+Math.sin(a)*r,(Math.random()-0.5)*0.3,0.15+Math.random()*0.25,(Math.random()-0.5)*0.3,2.2,0.32,[0.48,0.58,0.2,0.22],false,-0.05);}}
  if(dentro){const prot=protecaoGas();P.gas=Math.min(1,P.gas+dt*2.2*(1-prot));
    if(gasT<=0){gasT=0.55;if(prot<0.99){ferirJogador(3.2*dentro.f*(1-prot),null);if(Math.random()<0.7)sfx('tosse');}}}
  const el=document.getElementById('gas-tela');if(el){const v=Math.min(1,P.gas||0);if(v<0.01){if(!el.hidden)el.hidden=true;}else{el.hidden=false;el.style.opacity=(v*0.62).toFixed(3);}}}
function protecaoGas(){let p=0;for(const s of ROUPA_SLOTS){const d=roupaItem(s);if(d&&d.gas)p=Math.max(p,d.gas);}return p;}
function bbGas(){for(const g of GAS){const k=Math.min(1,g.t*2)*Math.min(1,(g.dur-g.t)/2.5),R=g.R||g.r;if(g.explodiu)continue;
  const luz=lerp(1,0.4,E.n||0);for(const p of g.puf){const a=p.a+g.t*0.12*(p.d>0.5?1:-1),r=R*(0.2+0.62*p.d);bb(g.x+Math.cos(a)*r,g.y+0.45+p.h*1.2+Math.sin(g.t*0.6+p.a)*0.15,g.z+Math.sin(a)*r,R*(0.5+0.25*p.h),0.36*luz,0.46*luz,0.14*luz,0.24*k);}
  bb(g.x,g.y+0.8,g.z,R*1.15,0.34*luz,0.44*luz,0.13*luz,0.16*k);}}
/* ---------- comportamento especial (antes do movimento normal); true = já cuidou do zumbi neste quadro ---------- */
function zEspecial(z,dt,dp,dxp,dzp){const S=ZS[z.tipo];if(!S)return false;const ch=z.ch;if(z.alvoBase)zAlvoBase(z);
  if(ch.sk&&ch.sk.cwAlvo>0&&!z.levanta&&(S.baixo)&&z.st!=='dorme')skParar(ch,6);
  // cachorro: depois de morder, recua um pouco e volta
  if(S.cao&&z.recua>0){z.recua-=dt;const d=dp||1,v=4.2;z.x-=dxp/d*v*dt;z.z-=dzp/d*v*dt;z.ph+=dt*v*3.2;collide(z,S.r,c=>c.solid);
    {const cz=chaoEm(z.x,z.z,z.y);z.y=cz;}ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*6));ch.x=z.x;ch.z=z.z;ch.y=z.y;
    if(ch.vis)ch.hipY=poseCao(ch.r,'corre',z.ph,1,G.t,0,0,0.12);return true;}
  // inchado: perto de você, estufa e estoura
  if(S.gas&&!S.chefeR&&z.vivo){if(z.inchando>0){z.inchando-=dt;ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*4));poseZIdle(ch.r,G.t*6,ZP.inchado);ch.r[3]-=0.9;ch.r[6]-=0.9;
      ch.s=(ZS.inchado.esc||1)*(1+0.08*Math.sin(G.t*30)*(1-z.inchando));if(Math.random()<dt*12)part(z.x,z.y+1.2,z.z,(Math.random()-0.5),0.6,(Math.random()-0.5),1.2,0.12,[0.48,0.58,0.2,0.3],false,-0.2);
      if(z.inchando<=0)estourarInchado(z,'perto');ch.x=z.x;ch.z=z.z;ch.y=z.y;return true;}
    if((z.st==='caca'||z.st==='golpe')&&dp<1.7&&P.alive&&Math.abs(P.y-z.y)<1.6&&!z.estourou){z.inchando=0.9;sfx('gas',z.x,z.z,0.6);return true;}}
  if(z.chefeR)return chefeREspecial(z,dt,dp,dxp,dzp);
  return false;}
/* depois de bater: cachorro recua; rastejante e cachorro podem fazer sangrar */
function zBateu(z,emJogador){const S=ZS[z.tipo];if(!S)return;if(S.cao){z.recua=0.55+Math.random()*0.4;sfx('rosnado',z.x,z.z,0.8);}
  if(emJogador&&S.sangra&&Math.random()<S.sangra&&typeof lesao==='function')lesao('sangramento',z);
  if(emJogador&&typeof lesaoMordida==='function')lesaoMordida(z);}
/* ---------- poses especiais: true = já posou ---------- */
function zPoseEsp(z,ch,moving,spd,dt){const S=ZS[z.tipo];if(!S)return false;
  if(S.cao){const modo=z.st==='golpe'?'morde':moving&&spd>2.5?'corre':moving?'pe':'pe';ch.hipY=poseCao(ch.r,modo,z.ph,moving?Math.min(1,spd/3):0.15,G.t,0,0,z.st==='golpe'?0.25:0.12);
    if(z.st==='quebra')ch.hipY=poseCao(ch.r,'morde',z.ph,0.6,G.t,0,0,0.3);return true;}
  if(S.baixo){poseRastejar(ch.r,z.ph,z.st==='golpe'?clamp(z.t/0.9,0,1):-1,moving);const fx=Math.sin(ch.yaw),fz=Math.cos(ch.yaw),sc=ch.s||1;
    ch.pitch=1.42;ch.x=z.x-fx*0.86*sc;ch.z=z.z-fz*0.86*sc;ch.y=z.y+0.13*sc;ch.hipY=0;return true;}
  return false;}
/* rastejante: deitado de bruços, braços puxando o corpo por cima da cabeça, pernas arrastando */
function poseRastejar(o,ph,golpe,mov){o.fill(0);const s=Math.sin(ph*0.8),c=Math.cos(ph*0.8),k=mov?1:0.25;
  S3(o,0,0,0,s*0.08*k);S3(o,1,-0.12+Math.abs(s)*0.06*k,0,s*0.1*k);S3(o,2,-0.95+c*0.08,s*0.15,0);
  if(golpe>=0){const w=golpe<0.6?golpe/0.6:1-(golpe-0.6)/0.4;S3(o,3,-2.7-0.35*w,0,0.32);S3(o,4,-0.2,0,0);S3(o,5,-2.7-0.35*w,0,-0.32);S3(o,6,-0.2,0,0);S3(o,2,-1.15,0,0);}
  else{S3(o,3,-2.55-s*0.45*k,0,0.38);S3(o,4,-0.55-Math.max(0,c)*0.7*k,0,0);S3(o,5,-2.55+s*0.45*k,0,-0.38);S3(o,6,-0.55-Math.max(0,-c)*0.7*k,0,0);}
  S3(o,7,0.05+s*0.08*k,0,0.12);S3(o,8,0.25+Math.max(0,s)*0.5*k,0,0);S3(o,9,0.05-s*0.08*k,0,-0.12);S3(o,10,0.25+Math.max(0,-s)*0.5*k,0,0);}
/* ---------- quem nasce onde ---------- */
function tipoNoturno2(tipo,n,i){if(tipo!=='walker')return tipo;const r=Math.random();
  if(n>=1&&r<0.12)return'rastejante';if(n>=3&&r<0.2)return'inchado';return tipo;}
function ondaCaes(n,cx,cz){if(n<2)return;if(n<4&&Math.random()>0.4)return;const q=2+(Math.random()<0.5?1:0)+(n>=5?1:0),X=cx??FIRE[0],Zc=cz??FIRE[2];
  for(let t=0;t<14;t++){const a=Math.random()*6.283,r=48+Math.random()*10,x=X+Math.cos(a)*r,z=Zc+Math.sin(a)*r;if(!pontoLivre(x,z)||Math.hypot(x-P.x,z-P.z)<25)continue;
    for(let k=0;k<q;k++)criarZ('caoZ',x+(Math.random()-0.5)*3,z+(Math.random()-0.5)*3,{noturno:true,st:'marcha'});
    setTimeout(()=>{sfx('uivo',x,z,1.2);toast('alerta','Uivos... uma matilha de cachorros zumbis vem vindo. Eles são rápidos: mordem e recuam.');},1200);return;}}
function tipoCidade2(tipo,noite,dentro,a){if(tipo!=='walker'&&tipo!=='emboscada')return tipo;const r=Math.random(),p=a&&a.p,nome=p&&p.nome||'';
  if(/Delegacia/.test(nome)&&r<0.55)return'policial';if(/Hospital/.test(nome)&&r<0.18)return'inchado';
  if(r<0.08)return'policial';if(r<0.12&&!dentro)return'inchado';if(dentro&&r<0.2)return'rastejante';if(a&&a.sala&&a.sala.metro&&r<0.3)return'rastejante';return tipo;}
/* de dia: rastejantes deitados no capim perto dos lugares (parecem corpos); a base militar tem seus mortos */
function popularDia2(){if(typeof BASEM!=='undefined'&&Math.hypot(P.x-BASEM.x,P.z-BASEM.z)>45){for(let k=0;k<5;k++){const a=Math.random()*6.283,r=3+Math.random()*10,x=BASEM.x+Math.cos(a)*r,z=BASEM.z+Math.sin(a)*r;if(pontoLivre(x,z))criarZ(k===0?'brute':k<3?'walker':Math.random()<0.5?'runner':'rastejante',x,z);}}const L=[...(ZSPAWN.fazenda||[]),...(ZSPAWN.vila||[]),...(ZSPAWN.posto||[])];let n=0;
  for(let k=0;k<12&&n<3;k++){const p=L[Math.floor(Math.random()*L.length)];if(!p)break;const x=p[0]+(Math.random()-0.5)*12,z=p[1]+(Math.random()-0.5)*12;
    if(Math.hypot(x-P.x,z-P.z)<30||!pontoLivre(x,z))continue;const q=criarZ('rastejante',x,z);if(q){q.st='dorme';q.ch.yaw=Math.random()*6.28;n++;}}}
/* ---------- chefes de região ---------- */
let chefeRT=0;
function lugarChefeR(d){const o=d.onde;
  if(o.metroTunel&&CID.metro&&CID.metro.partes){const s=CID.metro.partes.find(q=>q.nome==='Túnel');if(s)return{x:(s.x0+s.x1)/2,y:s.y,z:(s.z0+s.z1)/2};}
  if(o.predio){const p=CID.predios.find(q=>q.nome.indexOf(o.predio)>=0);if(p){const andares=p.salas.length||1;let f=Math.min(o.andar||0,andares-1);
      for(;f>=0;f--){const L=(p.salas[f]||[]).filter(s=>!/corredor|escada|poco|banheiro|elevador|telhado|sacada/.test(s.tipo||''));if(!L.length)continue;
        let best=null,ba=0;for(const s of L){const a=(s.u1-s.u0)*(s.v1-s.v0);if(a>ba){ba=a;best=s;}}if(best){const w=pw(p,(best.u0+best.u1)/2,(best.v0+best.v1)/2);return{x:w[0],y:best.y,z:w[1],sala:best};}}}}
  if(o.lugar){const pl=placeById(o.lugar);if(pl){const x=pl.x+(o.dx||0),z=pl.z+(o.dz||0);return{x,y:ground(x,z),z};}}
  return null;}
function chefeRNascer(d,L){const st=G.chefesR[d.id];const q=criarZ(d.id,L.x,L.z,{y:L.y,cidade:dentroCidade(L.x,L.z,2),hx:L.x,hz:L.z,hy:L.y});if(!q)return null;
  if(st.hp)q.hp=Math.min(q.hpMax,st.hp);q.st='vaga';q.casa=L;q.chefeId=d.id;st.st='vivo';
  if(!st.visto){st.visto=true;setTimeout(()=>toast('alerta',d.nome+' está aqui. '+d.boato),600);}return q;}
function updateChefesR(dt){chefeRT-=dt;if(chefeRT>0||!G.chefesR||G.modo!=='jogo')return;chefeRT=1;
  for(const d of CHEFES_R){const st=G.chefesR[d.id];if(!st||st.st==='morto')continue;const vivo=Z.find(q=>q.chefeId===d.id&&q.vivo);
    if(!st.L){const L=lugarChefeR(d);if(!L)continue;st.L={x:L.x,y:L.y,z:L.z};}
    const L=st.L,dp=Math.hypot(P.x-L.x,P.z-L.z);
    if(!vivo){if(dp<38&&Math.abs(P.y-L.y)<9&&P.alive)chefeRNascer(d,L);continue;}
    st.hp=vivo.hp;
    // longe de casa e sem te ver: volta e se recupera aos poucos; muito longe de você: some (guarda a vida)
    const dc=Math.hypot(vivo.x-L.x,vivo.z-L.z);if(vivo.st!=='caca'&&vivo.st!=='golpe'&&dc>14){vivo.st='alerta';vivo.ax=L.x;vivo.az=L.z;vivo.ay=L.y;}
    if(vivo.st!=='caca'&&vivo.st!=='golpe')vivo.hp=Math.min(vivo.hpMax,vivo.hp+vivo.hpMax*0.004);
    if(Math.hypot(P.x-vivo.x,P.z-vivo.z)>95){st.hp=vivo.hp;st.st='dorme';Z.splice(Z.indexOf(vivo),1);}}}
function chefeRMorreu(z){const d=CHEFE_R_DEF(z.tipo);if(!d)return;const st=G.chefesR[d.id];if(st){st.st='morto';st.hp=0;}
  const lo=d.loot.filter(([id])=>ITEMS[id]).map(([id,n])=>[id,n,null]);soltarItens(lo,z.x,z.z,z.y);P.shake=Math.max(P.shake,0.5);poeira(z.x,z.y+0.4,z.z,20);sfx('impacto',z.x,z.z,1.1);
  if(z.tipo==='pacienteZero'&&G.hist&&G.hist.cap>=2&&!G.hist.amostra){G.hist.amostra=true;ganhar('amostra',1);setTimeout(()=>toast('radio','A amostra! Guarde bem esse frasco com o sangue dele.'),2600);histAvanca();}
  G.chefesMortos=(G.chefesMortos||0)+1;progresso('chefeRegional');if(typeof conquista==='function')conquista('chefe_'+d.id);
  setTimeout(()=>toast('radio','Você derrubou '+d.nome.replace(/^O /,'o ').replace(/^A /,'a ')+'? Ninguém acreditava! Ele deixou coisa boa no chão. Faltam '+CHEFES_R.filter(c=>G.chefesR[c.id].st!=='morto').length+' chefes.'),1500);}
/* ataques especiais de cada chefe */
function chefeREspecial(z,dt,dp,dxp,dzp){const c=z.chefeR,ch=z.ch,S=ZS[z.tipo];c.cd1-=dt;c.cd2-=dt;c.cd3-=dt;
  const caca=z.st==='caca'||z.st==='golpe',olhar=k=>{ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*k));},mesmo=Math.abs(P.y-z.y)<1.8;
  // Paciente Zero deixa rastro de gás; o resto, passos pesados
  if(z.tipo==='pacienteZero'&&(z.st==='caca'||z.st==='vaga'||z.st==='alerta')&&c.cd3<=0){c.cd3=caca?1.6:4;gasNuvem(z.x,z.y,z.z,1.5,6,0.7);}
  if(!c.fase&&P.alive&&!CARRO.ativo&&caca&&mesmo){
    if(z.tipo==='acougueiro'&&c.cd1<=0&&dp<3.3){c.fase='giro';c.t=0;sfx('rugido',z.x,z.z,0.7);}
    else if(z.tipo==='sargento'&&c.cd2<=0&&dp<30){c.fase='apito';c.t=0;}
    else if(z.tipo==='pacienteZero'&&c.cd1<=0&&dp>3&&dp<11){c.fase='vomito';c.t=0;}
    else if(z.tipo==='maquinista'&&c.cd1<=0&&dp>6&&dp<22&&trechoLivreChefe(z)){c.fase='investida';c.t=0;c.dir=Math.atan2(dxp,dzp);c.bateu=false;}
    else if(z.tipo==='fazendeiro'&&!c.usou&&z.hp<z.hpMax*0.6){c.fase='berrante';c.t=0;c.usou=true;}}
  if(z.tipo==='sargento'&&!c.usou&&z.hp<z.hpMax*0.5){c.usou=true;for(let k=0;k<3;k++){const a=Math.random()*6.283;const p=[z.x+Math.cos(a)*9,z.z+Math.sin(a)*9];
      if(!pontoLivre(p[0],p[1],0.5))continue;const q=criarZ('policial',p[0],p[1],{y:z.y,cidade:z.cidade});if(q){q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;}}
    toast('alerta','O Sargento chamou reforço!');}
  if(!c.fase)return false;c.t+=dt;
  switch(c.fase){
    case'giro':{const prep=0.75;if(c.t<prep){olhar(5);poseZAttack(ch.r,0.35*c.t/prep,ZP[z.tipo]);ch.r[3]-=0.5;ch.r[5]-=0.5;break;}
      ch.yaw+=dt*13;poseZAttack(ch.r,0.85,ZP[z.tipo]);ch.r[3]=-1.5;ch.r[5]=-1.5;if(Math.random()<dt*14)sfx('golpe',z.x,z.z,0.5);
      if(!c.bateu&&P.alive&&dp<2.9*(ch.s>1.3?1:0.9)&&mesmo&&!(P.rola&&P.rola.t<P.rola.dur*0.72)){c.bateu=true;ferirJogador(30,z);if(typeof lesao==='function'&&Math.random()<0.75)lesao('sangramento',z);empurraJogador(z,6);}
      if(c.t>=prep+0.55){c.fase=null;c.bateu=false;c.cd1=7.5+Math.random()*3.5;}break;}
    case'apito':{olhar(4);poseZScream(ch.r,G.t,clamp(Math.min(c.t/0.25,(1.3-c.t)/0.3),0,1));ch.r[5]=-2.4;ch.r[6]=-1.6;
      if(c.t>0.3&&!c.apitou){c.apitou=true;sfx('apito',z.x,z.z,1.4);NOISE.push({x:z.x,z:z.z,r:45,tx:P.x,tz:P.z,y:z.y});RINGS.push({x:z.x,z:z.z,y:z.y+2.2,a:0});
        dica('apito','alerta','O Sargento apitou e chamou os zumbis de perto. Derrube ele rápido ou saia dali.');}
      if(c.t>=1.3){c.fase=null;c.apitou=false;c.cd2=18+Math.random()*8;}break;}
    case'vomito':{olhar(6);poseZScream(ch.r,G.t,clamp(Math.min(c.t/0.35,(1.1-c.t)/0.3),0,1));
      if(c.t>0.45&&!c.jogou){c.jogou=true;sfx('gas',z.x,z.z,0.9);const sc=ch.s||1;VOMITOS.push({x:z.x,y:z.y+1.6*sc,z:z.z,tx:P.x,ty:P.y,tz:P.z,t:0,dur:0.85});}
      if(c.t>=1.1){c.fase=null;c.jogou=false;c.cd1=6+Math.random()*3;}break;}
    case'investida':{const prep=0.55,dur=1.25;if(c.t<prep){olhar(7);c.dir=ch.yaw;poseZScream(ch.r,G.t,clamp(c.t/0.25,0,1));if(!c.rugiu&&c.t>0.1){c.rugiu=true;sfx('rugido',z.x,z.z,0.7);}break;}
      const dx=Math.sin(c.dir),dz=Math.cos(c.dir),v=10,ox=z.x,oz=z.z;z.x+=dx*v*dt;z.z+=dz*v*dt;z.ph+=dt*v*1.8;const hit=collide(z,S.r*(ch.s||1),q=>q.solid),mv=Math.hypot(z.x-ox,z.z-oz);
      poseZWalk(ch.r,z.ph,ZP.runner,1.4);ch.r[3]+=0.3;if(Math.random()<dt*12)poeira(z.x,z.y,z.z,1);
      if(!c.bateu&&P.alive&&d2(P.x,P.z,z.x,z.z)<1.9*1.9&&mesmo){c.bateu=true;ferirJogador(24,z);empurraJogador(z,10);}
      if(hit&&mv<v*dt*0.45){sfx('impacto',z.x,z.z,1);poeira(z.x+dx,z.y+1,z.z+dz,10);c.fase=null;c.rugiu=false;c.cd1=6.5+Math.random()*3;z.st='atordoado';z.t=2.0;z.kx=-dx;z.kz=-dz;
        dica('maquinistaTonto','corpo','O Maquinista bateu e ficou tonto. Agora!');break;}
      if(c.t>=prep+dur){c.fase=null;c.rugiu=false;c.cd1=6.5+Math.random()*3;}break;}
    case'berrante':{olhar(3);poseZScream(ch.r,G.t,clamp(Math.min(c.t/0.3,(2.2-c.t)/0.4),0,1));ch.r[3]=-2.3;ch.r[4]=-1.4;
      if(c.t>0.4&&!c.tocou){c.tocou=true;sfx('berrante',z.x,z.z,1.5);RINGS.push({x:z.x,z:z.z,y:z.y+2.4,a:0},{x:z.x,z:z.z,y:z.y+2.4,a:-0.4});
        for(let k=0;k<4;k++){const p=pontoLevantar?pontoLevantar(5,12,false):null;if(p&&typeof zLevantar==='function')zLevantar('walker',p[0],p[1],{});}
        toast('alerta','O Fazendeiro tocou o berrante: os mortos do pasto estão levantando!');}
      if(c.t>=2.2){c.fase=null;c.tocou=false;}break;}}
  {const cz=chaoEm(z.x,z.z,z.y);z.y=cz;z.vy=0;}ch.x=z.x;ch.z=z.z;ch.y=z.y;ch.hipY=0;return true;}
/* vômito de gás do Paciente Zero: voa em arco e vira nuvem onde cai */
const VOMITOS=[];
function updateVomitos(dt){for(let i=VOMITOS.length-1;i>=0;i--){const v=VOMITOS[i];v.t+=dt;const k=Math.min(1,v.t/v.dur),x=lerp(v.x,v.tx,k),z=lerp(v.z,v.tz,k),y=lerp(v.y,v.ty+0.3,k)+Math.sin(k*Math.PI)*2.2;
    if(Math.random()<dt*40)part(x,y,z,(Math.random()-0.5)*0.4,0,(Math.random()-0.5)*0.4,0.5,0.12,[0.45,0.56,0.18,0.8],false,1);
    if(k>=1){VOMITOS.splice(i,1);gasNuvem(v.tx,chaoEm(v.tx,v.tz,v.ty+0.4),v.tz,2.6,7,1);sangue(v.tx,v.ty+0.2,v.tz,6);}}}
/* capacete dos policiais: malha própria presa no osso da cabeça; o que voa cai rolando e fica no chão um tempo */
const CAPACETES=[];let MESH_CAP=null;
function capaceteGeo(){const g=new GB(1024,8),R=rng(77),pr=lin(0x161a20),vis=lin(0x28323c);
  const Y=CAP_CFG.y,dome=icoSubTris(0.142,0,R,2).filter(t=>(t[0][1]+t[1][1]+t[2][1])/3>-0.03);add(g,dome,mat(0,Y,CAP_CFG.z,0,0,0,1.03,0.95,1.1),pr);
  add(g,boxTris(0.26,0.075,0.03,{tx:0.96}),mm(mat(0,Y-0.035,CAP_CFG.z+0.15),mat(0,0,0,-0.15,0,0)),vis,{e:0.08});
  add(g,boxTris(0.27,0.03,0.18),mat(0,Y-0.02,CAP_CFG.z-0.1,0.35,0,0),pr);for(const s of[-1,1])add(g,boxTris(0.03,0.08,0.11),mat(s*0.145,Y-0.04,CAP_CFG.z+0.02),pr);
  add(g,boxTris(0.05,0.02,0.16),mat(0,Y+0.13,CAP_CFG.z),lin(0x0e1014));MESH_CAP=litMesh(g.data());}
const CAP_CFG={y:0.215,z:0.005};function capAjuste(y,z){CAP_CFG.y=y;CAP_CFG.z=z;MESH_CAP=null;}
function updateCapacetes(dt){for(let i=CAPACETES.length-1;i>=0;i--){const c=CAPACETES[i];c.t+=dt;
    if(!c.chao){c.vy-=9.8*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.rx+=c.wx*dt;c.rz+=c.wz*dt;const g=chaoEm(c.x,c.z,c.y+0.3);
      if(c.y<=g+0.08){c.y=g+0.08;if(Math.abs(c.vy)>2.2){c.vy*=-0.35;c.vx*=0.6;c.vz*=0.6;c.wx*=0.5;c.wz*=0.5;sfx('capacete',c.x,c.z,0.35);}else{c.chao=true;c.rx=Math.PI*0.9;c.rz=0.3;}}}
    if(c.t>40)CAPACETES.splice(i,1);}}
const _MCA=new Float32Array(16),_MCB=new Float32Array(16);
function desenharCapacetes(Pg){if(!MESH_CAP)capaceteGeo();
  for(const z of Z){if(!(z.capacete>0)||!z.ch.vis||!z.vivo&&z.st!=='morrendo'&&z.st!=='morto')continue;if(d2(z.x,z.z,cam.pos[0],cam.pos[2])>70*70)continue;const s=1;drawStat(Pg,MESH_CAP,mul(_MCA,z.ch.m.subarray(2*16,3*16),trs(_MCB,0,0,0,0,0,0,s,s,s)));}
  for(const c of CAPACETES)drawStat(Pg,MESH_CAP,trs(_MCA,c.x,c.y-0.12*c.s,c.z,c.rx,c.ry,c.rz,c.s,c.s,c.s));}
/* armas dos chefes: cutelo do Açougueiro e forcado do Fazendeiro */
let ARMA_CHEFE=null;const _MZA=new Float32Array(16),_MZB=new Float32Array(16);
function armaChefeGeo(){const mk=f=>{const g=new GB(256,8);f(g);return litMesh(g.data());},aco=lin(0xa9adb2),cabo=lin(0x3a2a1c);
  ARMA_CHEFE={cutelo:mk(g=>{add(g,cylTris(0.022,0.022,0.16,6),mat(0,0,0,Math.PI/2,0,0),cabo);add(g,boxTris(0.012,0.17,0.3),mat(0,-0.07,0.27),aco,{j:0.04,rnd:Math.random});add(g,boxTris(0.013,0.03,0.3),mat(0,0.0,0.27),lin(0x6a3a30));}),
    forcado:mk(g=>{add(g,cylTris(0.02,0.02,1.9,6),mat(0,0,-0.7,Math.PI/2,0,0),cabo);add(g,boxTris(0.24,0.03,0.03),mat(0,0,1.2),lin(0x55595c));
      for(const x of[-0.11,0,0.11])add(g,cylTris(0.009,0.006,0.34,5),mat(x,0,1.2,Math.PI/2,0,0),lin(0x6a6e72));})};}
function desenharArmasZ(Pg){desenharCapacetes(Pg);for(const z of Z){if(!z.chefeR||!z.ch.vis||!z.vivo)continue;const d=CHEFE_R_DEF(z.tipo);if(!d||!d.arma)continue;if(d2(z.x,z.z,cam.pos[0],cam.pos[2])>60*60)continue;
  if(!ARMA_CHEFE)armaChefeGeo();const m=ARMA_CHEFE[d.arma];if(!m)continue;const s=d.arma==='cutelo'?1.25:1.1;mul(_MZA,z.ch.m.subarray(11*16,12*16),trs(_MZB,0,0,0,0,0,0,s,s,s));drawStat(Pg,m,_MZA);}}
/* bolhas no corpo dos inchados (desenhadas com as partículas normais) */
function bbInchados(){const luz=lerp(1,0.4,E.n||0);for(const z of Z){const S=ZS[z.tipo];if(!S||!S.gas||!z.vivo||!z.ch.vis)continue;if(d2(z.x,z.z,cam.pos[0],cam.pos[2])>22*22)continue;
  const m=z.ch.m.subarray(16,32),sc=z.ch.s||1;for(let i=0;i<7;i++){const a=(z.id*1.7+i*2.39)%6.283,h=0.05+((z.id*0.37+i*0.53)%1)*0.3,r=0.2+0.03*Math.sin(G.t*3+i);
    const p=xf(m,Math.sin(a)*r,h,Math.cos(a)*r*0.9);bb(p[0],p[1],p[2],(0.03+0.012*((i*7)%3))*sc,0.6*luz,0.58*luz,0.3*luz,0.95);}}}
/* olhos vermelhos dos cachorros zumbis no escuro */
function bbZumbis2(){const n=E.n||0;if(n<0.3)return;for(const z of Z){if(z.tipo!=='caoZ'||!z.vivo||!z.ch.vis)continue;const m=z.ch.m.subarray(1*16,2*16);
  for(const s of[-1,1]){const p=xf(m,s*0.05,0.2,0.18);bb(p[0],p[1],p[2],0.022,1,0.15,0.05,0.9*n);}}}
/* marcas no mapa: chefes de que você já ouviu falar */
function mapaChefesR(marca){if(!G.chefesR)return;for(const d of CHEFES_R){const st=G.chefesR[d.id];if(!st||!st.ouviu||st.st==='morto'||!st.L)continue;marca(st.L.x,st.L.z,'#e8604e',3.2);}}
function ouvirBoatoChefe(){if(!G.chefesR)return null;const d=CHEFES_R.find(c=>{const s=G.chefesR[c.id];return s&&!s.ouviu&&s.st!=='morto';});if(!d)return null;const st=G.chefesR[d.id];st.ouviu=true;
  if(!st.L){const L=lugarChefeR(d);if(L)st.L={x:L.x,y:L.y,z:L.z};}return d;}
function updateZumbis2(dt){updateCapacetes(dt);updateGas(dt);updateVomitos(dt);updateChefesR(dt);}
function resetZumbis2(){CAPACETES.length=0;GAS.length=0;VOMITOS.length=0;P.gas=0;}
V8.novo.zumbis2=()=>{G.chefesR={};for(const d of CHEFES_R)G.chefesR[d.id]={st:'dorme',ouviu:false,visto:false,hp:0,L:null};resetZumbis2();};
V8.salvar.zumbis2=()=>G.chefesR;
V8.carregar.zumbis2=s=>{V8.novo.zumbis2();if(s&&typeof s==='object')for(const k in s)if(G.chefesR[k])Object.assign(G.chefesR[k],s[k],{st:s[k].st==='morto'?'morto':'dorme'});};
/* morte: inchado estoura; chefe deixa o espólio */
function zMorreuEsp(z){const S=ZS[z.tipo];if(!S)return;if(!S.gas)poca(z.x,z.y,z.z,(S.cao?0.35:0.55)*(z.ch.s||1));if(S.gas&&!z.estourou)estourarInchado(z,'morte');if(z.chefeR)chefeRMorreu(z);}

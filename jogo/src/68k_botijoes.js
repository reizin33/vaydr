/* ================= Botijões de gás pela cidade: pegar, vazar, explodir e armar (v10.8.6) =================
   Himalaia (19/11/2026): "itens que se conectam, coisas que se conectam". O botijão de gás só servia para o maçarico do balão
   do Campo dos balões. Agora ele também está em pé pela cidade (fundos da padaria, do mercado e das conveniências, atrás das
   barracas da Feira e no bar da Vila São José):
   · E pega (vai para a mochila: gás do balão ou armadilha);
   · tiro ou golpe abre um vazamento (chiado e jato branco) e ele explode em 1 a 2 s; um segundo tiro, fogo ou outra explosão
     perto explode na hora (um botijão estoura o do lado);
   · na mochila, "Pôr no chão" deixa o botijão em pé na sua frente: atraia os zumbis e atire nele;
   · tarefa nova do rádio: derrubar zumbis com botijão. Os botijões da cidade voltam 4 dias depois de pegos ou explodidos. */
const BOTI={lista:[],ok:false,malhas:[],chk:0,somT:0,dicaT:0};
const BOTI_COR=[0x2f6a8a,0xd06a20,0x6a7a80,0x2a7a5a,0xa83228];
ITEMS.botijaoGas.acao='Pôr no chão';ITEMS.botijaoGas.acaoExtra=true;
ITEMS.botijaoGas.desc='Botijão de gás, cheio. Alimenta o maçarico do balão (uns 3 minutos de chama cada) e vira armadilha: posto no chão, um tiro faz explodir.';
function botiD(){const D=ativD();if(!D.botijoes||typeof D.botijoes!=='object')D.botijoes={st:{},soltos:[]};const S=D.botijoes;if(!S.st||typeof S.st!=='object')S.st={};if(!Array.isArray(S.soltos))S.soltos=[];return S;}
/* os da cidade (fixos, com estado salvo) e os que o jogador pôs no chão */
function botiTodos(){const S=botiD(),L=[];for(const b of BOTI.lista)if(!S.st[b.id])L.push(b);for(const b of S.soltos)if(b&&Number.isFinite(b.x))L.push(b);return L;}
function botiMontar(){if(BOTI.ok)return;BOTI.ok=true;const R=rng(55331),L=BOTI.lista;
  const poe=(x,z,yRef)=>{if(!isFinite(x)||!isFinite(z)||pointBlocked(x,z,0.3))return false;const y=chaoEm(x,z,(yRef??ground(x,z))+1.2);if(!Number.isFinite(y))return false;
    if(L.some(b=>d2(b.x,b.z,x,z)<0.8*0.8))return false;L.push({id:'b'+L.length,x,z,y,yaw:R()*6.28,ci:Math.floor(R()*BOTI_COR.length),mundo:true});return true;};
  /* fundos e lados dos prédios de comida (no sistema do prédio: v < 0 é a frente) */
  if(typeof CID!=='undefined'&&CID.predios)for(const p of CID.predios){if(p.rural||!/padaria|mercado|conveniencia/.test(p.tipo||'')||!isFinite(p.W)||!isFinite(p.D))continue;
    const quer=p.tipo==='mercado'?3:2;let k=0;
    for(let t=0;t<40&&k<quer;t++){const lado=Math.floor(R()*3),a=0.6+R()*Math.max(0.1,(lado===0?p.W:p.D)-1.2),f=0.42;
      const uv=lado===0?[a,p.D+f]:lado===1?[-f,Math.min(a,p.D-0.6)]:[p.W+f,Math.min(a,p.D-0.6)],w=pw(p,uv[0],uv[1]);
      if(typeof quadraEm==='function'&&!quadraEm(w[0],w[1]))continue;if(poe(w[0],w[1],QUADRA_Y)){k++;if(R()<0.4&&poe(w[0]+(R()-0.5)*0.9,w[1]+(R()-0.5)*0.9,QUADRA_Y))k++;}}}
  /* atrás de algumas barracas da Feira */
  if(typeof FEIRA!=='undefined'&&FEIRA.barracas)for(const b of FEIRA.barracas){if(R()>0.36)continue;poe(b.cx+b.lado*(b.d/2+0.32),b.cz+(R()-0.5)*(b.w-0.7),b.y0);}
  /* bar da Vila São José: na lateral */
  if(typeof VILA!=='undefined'){const bar=Object.values(VILA).find(p=>p&&/Bar/.test(p.nome||''));if(bar&&isFinite(bar.x0)){for(let t=0;t<12;t++){const x=R()<0.5?bar.x0-0.4:bar.x1+0.4,z=bar.z0+0.6+R()*Math.max(0.2,bar.z1-bar.z0-1.2);if(poe(x,z))break;}}}}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{botiMontar();}catch(e){console.error('botijões',e);}return r;};}

/* ---------- desenho: o botijão P13 (base, corpo, ombro, colarinho e válvula), uma malha por cor ---------- */
function botiGeo(cor,seed){const g=new GB(1<<11,8),R=rng(seed),A=(t,m,c,o)=>add(g,t,m,lin(c),Object.assign({j:0.05,rnd:R},o||{}));
  A(cylTris(0.155,0.155,0.045,14),mat(0,0,0),0x3a3a3a);A(cylTris(0.18,0.18,0.29,16),mat(0,0.04,0),cor);A(cylTris(0.11,0.18,0.07,16),mat(0,0.33,0),cor);
  A(cylTris(0.105,0.105,0.075,14),mat(0,0.4,0),cor);A(cylTris(0.025,0.025,0.05,8),mat(0,0.4,0),0x8a7a4a);A(boxTris(0.06,0.025,0.03),mat(0.035,0.45,0),0x2a2a2a);
  for(const s of[-1,1])A(boxTris(0.12,0.03,0.02),mat(0,0.465,s*0.09),cor);   // alça do colarinho
  return g.data();}
etapaMalha('fim','botijoes',1,()=>{try{BOTI.malhas=BOTI_COR.map((c,i)=>litMesh(botiGeo(c,9100+i)));}catch(e){console.error('botijões (desenho)',e);BOTI.malhas=[];}});
const BOTI_M=new Float32Array(16);
function botiDesenhar(Pg,raio,cx,cz){if(!BOTI.malhas.length)return;for(const b of botiTodos()){if(b.foi||d2(b.x,b.z,cx,cz)>raio*raio)continue;const m=BOTI.malhas[b.ci%BOTI.malhas.length];
  const tr=b.vaza!=null?Math.sin((G.t||0)*60)*0.012:0;drawStat(Pg,m,trs(BOTI_M,b.x+tr,b.y,b.z,0,b.yaw,0,1,1,1));}}
DESENHO.opaco.push(function botijoesDesenho(Pg){botiDesenhar(Pg,70,cam.pos[0],cam.pos[2]);});
DESENHO.sombra.push((Pg,perto)=>botiDesenhar(Pg,perto?30:50,P.x,P.z));

/* ---------- atingido: vaza e explode ---------- */
function botiAtingido(b,como){if(b.foi)return;if(b.vaza!=null){if(como==='tiro'||como==='fogo')b.vaza=Math.min(b.vaza,0.05);return;}
  b.vaza=como==='fogo'?0.5:como==='tiro'?1.1+Math.random()*0.5:1.6+Math.random()*0.6;b.jato=Math.random()*6.28;sfx('gas',b.x,b.z,1);sfx('impacto',b.x,b.z,0.6);
  if(Math.hypot(b.x-P.x,b.z-P.z)<12)feed('O botijão está vazando! Saia de perto',true);}
function botiExplodir(b){if(b.foi)return;b.foi=true;b.vaza=null;const S=botiD();
  if(b.mundo)S.st[b.id]={st:'foi',dia:G.dia|0};else{const i=S.soltos.indexOf(b);if(i>=0)S.soltos.splice(i,1);}
  const R=5.5,antes=Z.filter(z=>z.vivo&&Math.hypot(z.x-b.x,z.z-b.z)<R+0.5);
  explosao(b.x,b.y+0.3,b.z,R,190);
  CHAMAS.push({x:b.x,y:b.y,z:b.z,r:1.4,t:0,dur:7,rr:0});
  const n=antes.filter(z=>!z.vivo).length;if(n&&typeof progresso==='function')progresso('killBoti',n);}
/* explosão perto estoura o botijão (com um respiro: a corrente de botijões vai estourando um depois do outro) */
{const _ex=explosao;explosao=function(x,y,z,R,dano){const r=_ex.apply(this,arguments);try{for(const b of botiTodos())if(!b.foi&&Math.hypot(b.x-x,b.z-z)<R+1&&Math.abs(b.y-y)<3){if(b.vaza==null)botiAtingido(b,'fogo');b.vaza=Math.min(b.vaza,0.2+Math.random()*0.35);}}catch(e){}return r;};}
/* tiro: o raio da câmera; o zumbi ou a parede na frente seguram a bala */
function botiRaio(o,dir,maxT){let best=null,bt=maxT;for(const b of botiTodos()){if(b.foi||Math.hypot(b.x-o[0],b.z-o[2])>maxT+1)continue;const r=raySeg(o,dir,[b.x,b.y+0.05,b.z],[b.x,b.y+0.44,b.z]);if(r.dist<0.22&&r.t>0&&r.t<bt){bt=r.t;best=b;}}return best?{b:best,t:bt}:null;}
function botiTampado(o,dir,t){for(const z of Z){if(!z.vivo)continue;const C=zCorpo(z),r=raySeg(o,dir,C.a,C.b);if(r.dist<C.r&&r.t<t)return true;}
  for(let s=1;s<t-0.35;s+=0.4){const x=o[0]+dir[0]*s,y=o[1]+dir[1]*s,z=o[2]+dir[2]*s;if(y<ground(x,z)||camBloqueio(x,y,z,null))return true;}return false;}
function botiTiro(){try{if(!BOTI.ok)return null;const o=cam.pos.slice(),dir=cam.fwd.slice(),h=botiRaio(o,dir,60);return h&&!botiTampado(o,dir,h.t)?h.b:null;}catch(e){return null;}}
{const _at=atirar;atirar=function(s,d){if(d&&(d.besta||d.chumbo||d.atravessa))return _at.apply(this,arguments);const b=botiTiro(),r=_at.apply(this,arguments);if(b)botiAtingido(b,'tiro');return r;};}   // as armas especiais passam pelo atirarEsp
{const _ae=atirarEsp;atirarEsp=function(s,d){const b=botiTiro(),r=_ae.apply(this,arguments);if(b)botiAtingido(b,'tiro');return r;};}
/* golpe: o botijão na frente, ao alcance */
{const _ga=golpeAcerta;golpeAcerta=function(a){try{const fx=Math.sin(P.body),fz=Math.cos(P.body);for(const b of botiTodos()){if(b.foi)continue;const dx=b.x-P.x,dz=b.z-P.z,dd=Math.hypot(dx,dz);
      if(dd<1.9&&Math.abs(b.y-P.y)<1.4&&(dx*fx+dz*fz)/(dd||1)>0.5){botiAtingido(b,'golpe');break;}}}catch(e){}return _ga.apply(this,arguments);};}
PASSOS.push(function botijoesPasso(dt){if(!BOTI.ok||G.modo!=='jogo')return;const L=botiTodos();
  for(const b of L){if(b.foi||b.vaza==null)continue;b.vaza-=dt;
    if(Math.random()<dt*40){const a=b.jato+(Math.random()-0.5)*0.5,v=2.5+Math.random()*2;part(b.x+Math.sin(a)*0.06,b.y+0.47,b.z+Math.cos(a)*0.06,Math.sin(a)*v,0.6+Math.random()*0.8,Math.cos(a)*v,0.45+Math.random()*0.3,0.07+Math.random()*0.06,[0.86,0.88,0.9,0.45],false,-0.4);}
    b.som=(b.som||0)-dt;if(b.som<=0){b.som=0.55;sfx('gas',b.x,b.z,0.7);}
    if(b.vaza<=0)botiExplodir(b);}
  BOTI.chk-=dt;if(BOTI.chk>0)return;BOTI.chk=0.25;
  /* fogo perto (molotov, árvore queimando, outra chama) explode */
  for(const b of L){if(b.foi)continue;for(const c of CHAMAS){if(c.t>=c.dur||Math.abs(c.y-b.y)>2)continue;if(Math.hypot(c.x-b.x,c.z-b.z)<(c.r||1.5)+0.35){botiAtingido(b,'fogo');break;}}}
  /* a primeira vez perto de um: a dica */
  if(!BOTI.dicaT){for(const b of L)if(!b.foi&&Math.hypot(b.x-P.x,b.z-P.z)<4&&Math.abs(b.y-P.y)<2){BOTI.dicaT=1;dica('botijao','corpo','Botijão de gás: E pega (serve no balão). Tiro ou golpe faz vazar e explodir; fogo ou explosão estouram na hora. Na mochila, "Pôr no chão" vira armadilha.');break;}}
  /* os da cidade voltam 4 dias depois, longe dos olhos */
  const S=botiD();for(const id in S.st){const q=S.st[id],b=BOTI.lista.find(o=>o.id===id);if(!b||!q||(G.dia|0)-(q.dia|0)<4||Math.hypot(b.x-P.x,b.z-P.z)<60)continue;delete S.st[id];b.foi=false;b.vaza=null;}});

/* ---------- pegar e pôr no chão ---------- */
INTERS.push(tryIt=>{if(!BOTI.ok||P.bonde)return;for(const b of botiTodos()){if(b.foi||Math.abs(b.x-P.x)>2.4||Math.abs(b.z-P.z)>2.4)continue;tryIt({k:'botijao',o:b},b.x,b.z,1.5,1.3,-0.4,b.y);}});
INTER_K.botijao={texto:b=>b.vaza!=null?{t:'Botijão vazando!',s:'saia de perto'}:{t:'Pegar o botijão de gás',s:'gás do balão ou armadilha · tiro, golpe ou fogo explode'},
  usar:b=>{if(b.foi||b.vaza!=null){sfx('vazio');return;}const S=botiD();if(b.mundo)S.st[b.id]={st:'pego',dia:G.dia|0};else{const i=S.soltos.indexOf(b);if(i>=0)S.soltos.splice(i,1);}
    b.foi=true;ganhar('botijaoGas',1);if(typeof invRender==='function')invRender();}};
UTIL_ACOES.botijaoGas=(i)=>{const S=botiD();if(P.bonde||CARRO.ativo||P.balao){feed('Aqui não dá',true);return false;}if(S.soltos.length>=8){feed('Já tem 8 botijões no chão',true);return false;}
  const a=P.body,x=P.x+Math.sin(a)*0.95,z=P.z+Math.cos(a)*0.95;if(pointBlocked(x,z,0.25)){feed('Sem lugar na sua frente',true);return false;}
  const y=chaoEm(x,z,P.y+0.8);if(!Number.isFinite(y)||Math.abs(y-P.y)>1.2){feed('Sem lugar na sua frente',true);return false;}
  const b={id:'s'+((G.t*1000)|0)+'_'+Math.floor(Math.random()*1e4),x,z,y,yaw:Math.random()*6.28,ci:Math.floor(Math.random()*BOTI_COR.length)};S.soltos.push(b);
  gastarUm(i);sfx('madeira',x,z,0.6);feed('Botijão no chão: um tiro nele e ele explode');if(typeof invRender==='function')invRender();};
/* ---------- ligações, tarefa do rádio e jogo novo ---------- */
if(typeof LIGA_EXTRA!=='undefined')(LIGA_EXTRA.botijaoGas=LIGA_EXTRA.botijaoGas||[]).push('o gás do balão do Campo dos balões','armadilha: posto no chão, um tiro faz explodir');
if(typeof ligaLugares==='function'){const _ll=ligaLugares;ligaLugares=function(id){const L=_ll.apply(this,arguments);if(id==='botijaoGas')L.unshift('em pé pela cidade (fundos da padaria, do mercado e das conveniências), atrás de barracas da Feira e no bar da Vila');return L;};}
if(typeof TAREFAS!=='undefined')TAREFAS.push({id:'botijao',txt:n=>'Derrube '+n+' zumbis com botijão de gás',ev:'killBoti',meta:()=>3,xp:80,rec:[['municao9',8],['bandagem',1]],min:2,
  dica:'Tem botijão de gás em pé atrás da padaria, do mercado e das barracas da Feira. Atraia os zumbis e atire nele.'});
V8.novo.botijoes=()=>{for(const b of BOTI.lista){b.foi=false;b.vaza=null;}BOTI.dicaT=0;};
V8.carregar.botijoes=()=>{const S=botiD();for(const b of BOTI.lista){b.foi=!!S.st[b.id];b.vaza=null;}for(const b of S.soltos)if(b){b.foi=false;b.vaza=null;}};

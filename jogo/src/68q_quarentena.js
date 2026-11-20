/* ================= Quarentena do Hotel Imperial (v10.8.8) =================
   Himalaia (19/11/2026): "desafios, coisas para fazer". O Hotel Imperial (6 andares) foi lacrado como quarentena: tábuas em X
   na porta, a placa vermelha QUARENTENA e a fita zebrada. Para entrar:
   · arranque o lacre com um pé de cabra (segure E; faz barulho) — ou entre por onde der;
   · lá dentro tem infectados nos 6 andares (uns andando, outros dormindo nos quartos) e, na suíte do último andar, um dos fortes;
     enquanto você está no hotel, a tela mostra quantos faltam;
   · limpo o hotel, a caixa da Defesa Civil aparece na recepção (munição de rifle, munição 9 mm, kit médico e colete);
   · 5 dias depois de limpo, o hotel volta a ser quarentena (lacre novo, infectados novos).
   Se você for embora com a quarentena no meio, os que faltam continuam lá (voltam quando você chegar perto).
   Entra no "O que fazer" como Quarentena. */
const QUAR={ok:false,p:null,portas:[],lobby:null,malha:null,caixa:null,hud:null,t:0};
const QUAR_PREMIO=[['balaRifle',14],['municao9',24],['kit',1],['colete',1]];
const QUAR_TIPOS=new Set(['quarto_hotel','quarto_luxo','suite','corredor','recepcao_hotel','restaurante','cozinha','deposito','lavanderia','banheiro']);
ATIV_TIPOS.quarentena={nome:'Quarentena',cor:'#ff5a5a',l:'Q'};
function quarD(){const D=ativD();if(!D.quar||typeof D.quar!=='object')D.quar={aberta:false,ativa:false,total:0,mortos:0,feito:false,pego:false,diaFeito:0};return D.quar;}
function quarNoHotel(){if(!QUAR.ok)return false;const s=salaEm(P.x,P.y+0.3,P.z);return!!(s&&s.p===QUAR.p);}
function quarFaltam(){const S=quarD();return Math.max(0,(S.total|0)-(S.mortos|0));}
/* o hotel, as portas de fora (com o lado de fora de cada uma) e a recepção */
function quarMontar(){if(QUAR.ok||typeof CID==='undefined'||!CID.predios)return;const p=CID.predios.find(q=>/Hotel Imperial/.test(q.nome||''));if(!p||!p.salas||!p.salas.length)return;
  QUAR.p=p;QUAR.portas=CID.portas.filter(d=>d.p===p&&d.tipo!=='elevador'&&d.estado!=='trancada'&&(d.sA==='fora'||d.sB==='fora')).map(d=>{const n=d.sA==='fora'?d.nA:d.nB,dx=n.x-d.x,dz=n.z-d.z,l=Math.hypot(dx,dz)||1;return{d,nx:dx/l,nz:dz/l};});
  const rec=(p.salas[0]||[]).find(s=>s.tipo==='recepcao_hotel')||(p.salas[0]||[]).find(s=>s.tipo!=='escada'&&s.tipo!=='poco');if(!rec||!QUAR.portas.length)return;
  QUAR.lobby={x:rec.x,z:rec.z,y:rec.y};QUAR.ok=true;}   // o lacre entra no jogo novo e no carregar (V8), quando o estado das portas da cidade já existe
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{quarMontar();}catch(e){console.error('quarentena',e);}return r;};}
/* lacre: as portas de fora ficam fechadas (como estavam: aberta ou quebrada volta a fechada) enquanto o lacre está inteiro */
function quarLacrar(forca){if(!QUAR.ok||!G.cid||!G.cid.portas)return;const S=quarD();if(S.aberta&&!forca)return;for(const{d}of QUAR.portas){if(d.estado!=='fechada'&&d.estado!=='trancada'){d.hp=d.hpMax;portaEstado(d,'fechada');}}}
const quarLacrada=d=>QUAR.ok&&!quarD().aberta&&QUAR.portas.some(q=>q.d===d);
{const _pt=portaTexto;portaTexto=function(d){if(quarLacrada(d)){const pc=temPeDeCabra();return pc?{t:'Arrancar o lacre da quarentena',s:'pé de cabra · faz barulho · segure',hold:true,dur:2.6}:{t:'Porta lacrada: QUARENTENA',s:'precisa de um pé de cabra para arrancar o lacre'};}return _pt.apply(this,arguments);};}
{const _pu=portaUsar;portaUsar=function(d,segurado){if(quarLacrada(d)){const pc=temPeDeCabra();if(!pc){feed('Precisa de um pé de cabra',true);sfx('vazio');return;}if(!segurado)return;
    gastar(pc,4);quarAbrir(d);return;}return _pu.apply(this,arguments);};}
function quarAbrir(d){const S=quarD();if(S.aberta)return;S.aberta=true;if(d){portaEstado(d,'aberta');sfx('quebrar',d.x,d.z,1);sfx('madeira',d.x,d.z,0.8);barulho(d.x,d.z,16,true,d.y);}ativLimpa();   // o barulho acorda o térreo; lá em cima ainda tem quem durma
 
  feed('Lacre arrancado');quarComecar();}
/* os infectados: 3 por andar (2 no térreo), em salas sorteadas; uns dormindo; o forte na suíte do último andar */
function quarNascer(s,tipo,dorme){const p=QUAR.p;for(let t=0;t<10;t++){const u=s.u0+0.5+Math.random()*Math.max(0.1,s.u1-s.u0-1),v=s.v0+0.5+Math.random()*Math.max(0.1,s.v1-s.v0-1),w=pw(p,u,v),x=w[0],z=w[1],y=s.y;
    if(bloqueadoAlto(x,z,0.4,y)||Math.abs(chaoEm(x,z,y+0.3)-y)>0.35)continue;if(Math.hypot(x-P.x,z-P.z)<6&&Math.abs(y-P.y)<2)continue;
    const q=criarZ(tipo,x,z,{y,cidade:true,hx:x,hz:z});if(!q)return null;q.quar=true;if(dorme)q.st='dorme';if(tipo==='elite')q.tint=[0.72,0.55,0.55];return q;}return null;}
function quarSalas(f){return(QUAR.p.salas[f]||[]).filter(s=>QUAR_TIPOS.has(s.tipo));}
function quarComecar(){const S=quarD();if(S.ativa||S.feito||!QUAR.ok)return;const n=QUAR.p.andares||1;let k=0;
  for(let f=0;f<n;f++){const L=quarSalas(f);if(!L.length)continue;const quer=f===0?2:3;for(let i=0;i<quer;i++){const s=L[Math.floor(Math.random()*L.length)],r=Math.random();
      if(quarNascer(s,r<0.16?'runner':r<0.42?'emboscada':'walker',r>=0.16&&r<0.42))k++;}}
  const top=quarSalas(n-1),su=top.find(s=>s.tipo==='suite')||top[0];if(su&&quarNascer(su,'elite',false))k++;
  S.ativa=true;S.total=k;S.mortos=0;ativLimpa();sfx('gemido',QUAR.lobby.x,QUAR.lobby.z,1,'walker');
  toast('alerta','Hotel Imperial em quarentena: '+k+' infectados nos 6 andares, alguns dormindo nos quartos e um dos fortes na suíte lá em cima. Limpe tudo para abrir a caixa da Defesa Civil na recepção.');}
/* quem morre conta (quem some sem morrer volta a nascer quando você chega perto) */
{const _zm=zMorreu;zMorreu=function(z){const r=_zm.apply(this,arguments);try{if(z&&z.quar&&!z.quarContou){z.quarContou=true;const S=quarD();if(S.ativa&&!S.feito){S.mortos=(S.mortos|0)+1;ativLimpa();
      if(quarFaltam()<=0)quarFim();else if(quarFaltam()<=3)feed('Quarentena: falta'+(quarFaltam()>1?'m ':' ')+quarFaltam());}}}catch(e){}return r;};}
function quarFim(){const S=quarD();S.feito=true;S.diaFeito=G.dia|0;S.pego=false;ativLimpa();sfx('missao');ganharXP(250);P.shake=Math.max(P.shake||0,0.12);
  toast('habilidade','Hotel Imperial limpo! A caixa da Defesa Civil está aberta na recepção.');if(typeof diarioEvento==='function')diarioEvento('Limpou a quarentena do Hotel Imperial','geral');
  if(typeof progresso==='function')progresso('quarentena');}
PASSOS.push(function quarPasso(dt){if(!QUAR.ok||G.modo!=='jogo')return;QUAR.t-=dt;if(QUAR.t>0)return;QUAR.t=1;const S=quarD(),L=QUAR.lobby,d=Math.hypot(P.x-L.x,P.z-L.z);
  /* entrou por outro lugar ou um zumbi quebrou a porta: começa */
  if(!S.feito&&!S.ativa&&(quarNoHotel()||(!S.aberta&&QUAR.portas.some(q=>q.d.estado==='quebrada')))){S.aberta=true;quarComecar();}
  /* os que faltam e sumiram (longe) voltam a nascer quando você chega perto, fora da vista */
  if(S.ativa&&!S.feito&&d<70){const vivos=Z.filter(z=>z.quar&&z.vivo).length,falta=quarFaltam();
    for(let i=vivos;i<falta;i++){const n=QUAR.p.andares||1,f=1+Math.floor(Math.random()*Math.max(1,n-1)),Ls=quarSalas(f);if(!Ls.length)break;if(!quarNascer(Ls[Math.floor(Math.random()*Ls.length)],Math.random()<0.3?'emboscada':'walker',Math.random()<0.3))break;}}
  /* 5 dias depois de limpo, longe dali: lacre novo */
  if(S.feito&&(G.dia|0)-(S.diaFeito|0)>=5&&d>90){Object.assign(S,{aberta:false,ativa:false,total:0,mortos:0,feito:false,pego:false});quarLacrar(true);ativLimpa();}
  quarHud(S.ativa&&!S.feito&&(quarNoHotel()||d<14)?S:null);});
function quarHud(S){let el=QUAR.hud;if(!S){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='quar-hud';el.setAttribute('aria-live','off');
    el.style.cssText='position:fixed;left:50%;top:86px;transform:translateX(-50%);z-index:29;padding:7px 14px;border-radius:10px;background:rgba(40,8,8,.72);color:#f6e8e4;font:700 14px/1.2 var(--f-ui,system-ui);text-align:center;pointer-events:none;letter-spacing:.02em;box-shadow:0 2px 12px rgba(0,0,0,.35)';
    document.body.appendChild(el);QUAR.hud=el;}
  if(typeof CORR!=='undefined'&&CORR.ativa){el.hidden=true;return;}el.hidden=false;el.textContent='Quarentena · Hotel Imperial · faltam '+quarFaltam()+' de '+(S.total|0);}
/* desenho: o lacre em cada porta de fora (tábuas em X, a placa e a fita) e a caixa da Defesa Civil na recepção */
function quarGeo(){const g=new GB(1<<13,8),R=rng(88101);
  for(const{d,nx,nz}of QUAR.portas){const yaw=Math.atan2(nx,nz),c=Math.cos(yaw),s=Math.sin(yaw),M=(u,y,v,rz)=>mat(d.x+c*u+s*v,d.y+y,d.z-s*u+c*v,0,yaw,rz||0),L=d.larg||1.2,H=L>1.3?2.4:2.15;
    const ang=Math.atan2(H,L+0.3);for(const a of[ang,-ang])add(g,boxTris(Math.hypot(L+0.3,H)*0.92,0.16,0.04),M(0,H/2,0.18,a),lin(0x8a6a45),{j:0.08,rnd:R});
    add(g,boxTris(1.1,0.38,0.02),M(0,H*0.62,0.215),lin(0xb3261e));textoBlocos(g,M(-0.45,H*0.62+0.06,0.228),'QUARENTENA',0.016,0xf4f0e8);
    for(const yy of[0.85,1.55]){for(let k=0;k<6;k++){const u=-L/2-0.1+(L+0.2)*(k+0.5)/6;add(g,boxTris((L+0.2)/6,0.07,0.012),M(u,yy+(k%2?0.01:-0.01),0.235),lin(k%2?0x1a1a1a:0xe0b81e));}}}
  return g.data();}
function quarCaixaGeo(){const g=new GB(1<<10,8),R=rng(88102);add(g,boxTris(1.0,0.55,0.6),mat(0,0.275,0),lin(0x3d5a3a),{j:0.04,rnd:R});add(g,boxTris(1.04,0.06,0.64),mat(0,0.58,0),lin(0x2f4a2e));
  add(g,boxTris(0.5,0.16,0.01),mat(0,0.34,0.305),lin(0xe8e2d0));textoBlocos(g,mat(-0.2,0.38,0.312),'DEFESA CIVIL',0.007,0x1a1a1a);return g.data();}
etapaMalha('fim','quarentena',1,()=>{if(!QUAR.ok)return;try{QUAR.malha=litMesh(quarGeo());QUAR.caixa=litMesh(quarCaixaGeo());}catch(e){console.error('quarentena (desenho)',e);QUAR.malha=null;QUAR.caixa=null;}});
DESENHO.opaco.push(function quarDesenho(Pg){if(!QUAR.ok)return;const S=quarD(),L=QUAR.lobby;if(d2(L.x,L.z,cam.pos[0],cam.pos[2])>160*160)return;
  if(QUAR.malha&&!S.aberta)drawStat(Pg,QUAR.malha,ID);if(QUAR.caixa&&S.feito&&!S.pego)drawStat(Pg,QUAR.caixa,mat(L.x,L.y,L.z,0,0,0));});
INTERS.push(tryIt=>{if(!QUAR.ok)return;const S=quarD(),L=QUAR.lobby;if(!S.feito||S.pego||Math.abs(P.x-L.x)>3||Math.abs(P.z-L.z)>3)return;tryIt({k:'quarCaixa',o:S},L.x,L.z,1.8,2.6,-0.8,L.y);});
INTER_K.quarCaixa={texto:()=>({t:'Abrir a caixa da Defesa Civil',s:ativPremio(QUAR_PREMIO)}),usar:S=>{if(!S.feito||S.pego)return;S.pego=true;ativDar(QUAR_PREMIO);sfx('bau');ativLimpa();
  toast('habilidade','Caixa da Defesa Civil: '+ativPremio(QUAR_PREMIO)+'. O hotel volta a ser quarentena daqui a 5 dias.');}};
ativFonte(()=>{if(!QUAR.ok)return[];const S=quarD(),L=QUAR.lobby,q=QUAR.portas[0];const x=q?q.d.x+q.nx*2:L.x,z=q?q.d.z+q.nz*2:L.z;
  return[{id:'quar-hotel',tipo:'quarentena',nome:'Quarentena: Hotel Imperial',x,z,r:16,feito:S.feito&&S.pego,
    falta:S.feito?(S.pego?'':'pegue a caixa da Defesa Civil na recepção'):S.ativa?'faltam '+quarFaltam()+' infectados lá dentro (6 andares)':'arranque o lacre da porta (pé de cabra) e limpe os 6 andares',
    premio:'caixa da Defesa Civil: '+ativPremio(QUAR_PREMIO)}];});
V8.novo.quar=()=>{for(const z of Z)if(z.quar)z.quar=false;if(QUAR.ok)quarLacrar(true);quarHud(null);};
V8.carregar.quar=()=>{quarHud(null);if(!QUAR.ok)return;const S=quarD();if(!S.aberta)quarLacrar(true);};

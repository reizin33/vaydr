/* ================= fauna: dez espécies, comportamento, população por região, caça e carcaças =================
   Balanceamento só nas tabelas (sem mexer na lógica):
     FAUNA        vida, velocidades, sentidos, grupo, ataque, presas, tamanho e dificuldade de cada espécie
     FAUNA_RENDE  o que cada carcaça dá (couro, carne, ossos, gordura, lã, tendões) · valor fixo, sem sorteio
     FAUNA_FORMA  medidas do corpo de cada espécie (a malha 3D é montada a partir delas)
     ZONAS_FAUNA  regiões do mapa, habitat e limite de cada espécie
     FAUNA_POP    ritmo de recuperação, limite de bichos ativos e distâncias de simulação
   Estados: repouso, explora, come, alerta, foge, defende, persegue, ataca, recupera (e morto = carcaça).
   População: cada região guarda quantos bichos existem de cada espécie. Só os que estão perto do jogador viram
   entidades; longe ninguém é simulado (o número fica guardado). Caçar baixa o número; ele volta devagar (casal tem
   filhote, região vazia recebe bichos das vizinhas), nunca passa do limite e nunca zera para sempre.
   Carcaça: os recursos são fixados na morte e saem para a mochila ao esfolar; o que não couber continua nela.
   Multijogador (futuro): carcaças e regiões têm id próprio e a coleta é registrada, para um servidor validar depois. */
const FAUNA={
  coelho:{nome:'Coelho',pl:'coelhos',porte:'pequeno',hp:10,anda:0.9,trota:2.4,corre:6.8,ve:17,fov:-0.55,ouve:1.3,ia:'presa',grupo:[1,2],r:0.2,alt:0.32,hr:0.24,esc:[0.9,1.1],dif:'Muito baixa',xp:6,esfola:1.2,pop:0.16,rastroM:3.5},
  raposa:{nome:'Raposa',pl:'raposas',porte:'pequeno',hp:24,anda:1.2,trota:2.8,corre:7.4,ve:22,fov:-0.2,ouve:1.5,ia:'arisco',grupo:[1,1],r:0.28,alt:0.45,hr:0.3,esc:[0.92,1.08],dif:'Baixa',xp:10,esfola:1.5,pop:0.08,rastroM:3,
    presas:['coelho'],fomeS:260,ataque:{dano:5,alc:0.9,cad:0.9,sangra:0.2},noturno:true},
  ovelha:{nome:'Ovelha',pl:'ovelhas',porte:'medio',hp:40,anda:0.8,trota:1.9,corre:4.8,ve:14,fov:-0.5,ouve:1.0,ia:'rebanho',grupo:[3,5],r:0.42,alt:0.9,hr:0.45,esc:[0.9,1.08],dif:'Baixa',xp:8,esfola:2.0,pop:0.08,rastroM:2.4},
  cabra:{nome:'Cabra',pl:'cabras',porte:'medio',hp:45,anda:1.0,trota:2.4,corre:6.0,ve:19,fov:-0.5,ouve:1.1,ia:'rebanho',grupo:[2,4],r:0.38,alt:0.85,hr:0.4,esc:[0.9,1.08],dif:'Baixa a média',xp:10,esfola:2.0,pop:0.07,rastroM:2.4,escala:true},
  cervo:{nome:'Cervo',pl:'cervos',porte:'medio',hp:55,anda:1.1,trota:3.0,corre:8.4,ve:27,fov:-0.6,ouve:1.6,ia:'presa',grupo:[2,4],r:0.45,alt:1.35,hr:0.45,esc:[0.92,1.1],dif:'Média',xp:14,esfola:2.4,pop:0.06,rastroM:2.2},
  vaca:{nome:'Vaca',pl:'vacas',porte:'grande',hp:130,anda:0.8,trota:1.8,corre:4.3,ve:13,fov:-0.5,ouve:0.9,ia:'rebanho',grupo:[2,4],r:0.72,alt:1.45,hr:0.7,esc:[0.92,1.06],dif:'Baixa a média',xp:12,esfola:3.4,pop:0.04,rastroM:2},
  javali:{nome:'Javali',pl:'javalis',porte:'medio',hp:95,anda:1.0,trota:2.6,corre:6.6,ve:14,fov:-0.3,ouve:1.3,ia:'defensivo',grupo:[1,3],r:0.48,alt:0.85,hr:0.5,esc:[0.9,1.12],dif:'Média a alta',xp:22,esfola:2.6,pop:0.05,rastroM:2.2,
    ataque:{dano:12,alc:1.5,cad:1.6,sangra:0.4,investida:true}},
  lobo:{nome:'Lobo',pl:'lobos',porte:'medio',hp:70,anda:1.3,trota:3.2,corre:8.8,ve:30,fov:-0.1,ouve:1.7,ia:'matilha',grupo:[2,4],r:0.4,alt:0.85,hr:0.42,esc:[0.92,1.08],dif:'Alta',xp:26,esfola:2.2,pop:0.04,rastroM:2.6,
    presas:['coelho','ovelha','cabra','cervo'],fomeS:300,ataque:{dano:9,alc:1.6,cad:1.4,sangra:0.45},noturno:true},
  urso:{nome:'Urso',pl:'ursos',porte:'grande',hp:420,anda:1.2,trota:2.6,corre:7.6,ve:22,fov:-0.2,ouve:1.2,ia:'territorial',grupo:[1,1],r:0.85,alt:1.5,hr:0.85,esc:[0.95,1.08],dif:'Muito alta',xp:90,esfola:4,pop:0.012,rastroM:2.4,
    presas:['cervo','ovelha','javali'],fomeS:520,ataque:{dano:34,alc:2.2,cad:1.9,sangra:0.8,forte:0.55,derruba:true}},
  onca:{nome:'Onça',pl:'onças',porte:'grande',hp:170,anda:1.1,trota:2.8,corre:9.4,ve:32,fov:-0.1,ouve:1.6,ia:'emboscada',grupo:[1,1],r:0.5,alt:0.95,hr:0.5,esc:[0.95,1.08],dif:'Muito alta',xp:80,esfola:3.2,pop:0.012,rastroM:3.2,
    presas:['cervo','javali','cabra','ovelha','coelho'],fomeS:420,ataque:{dano:24,alc:2.0,cad:1.5,sangra:0.85,forte:0.45},noturno:true,couroQ:2}};
const BS=FAUNA;   // nome antigo: o resto do jogo lê BS[tipo].r
const FAUNA_TIPOS=Object.keys(FAUNA);
/* rendimento por carcaça (unidades do jogo). O couro segue a tabela do pedido: coelho e raposa 1 pequeno; ovelha e cabra 2 comuns;
   cervo e javali 3 comuns; lobo 2 comuns; onça 3 resistentes; urso 5 grandes; vaca 4 grandes */
const FAUNA_RENDE={
  coelho:{couroPequeno:1,carneCrua:1},
  raposa:{couroPequeno:1,carneCrua:1,ossos:1},
  ovelha:{couro:2,carneCrua:2,la:3,ossos:1},
  cabra:{couro:2,carneCrua:2,ossos:1,tendao:1},
  cervo:{couro:3,carneCrua:3,ossos:2,tendao:1},
  vaca:{couroGrande:4,carneCrua:6,gordura:2,ossos:2,tendao:1},
  javali:{couro:3,carneCrua:3,gordura:2,ossos:1},
  lobo:{couro:2,carneCrua:2,ossos:1,tendao:1},
  urso:{couroGrande:5,carneCrua:6,gordura:4,ossos:3,tendao:2},
  onca:{couroResistente:3,carneCrua:2,ossos:2,tendao:2}};
/* regiões de fauna: onde cada espécie vive e quantas cabem (r0 = miolo vazio; rio = faixa ao longo do Rio Claro) */
const ZONAS_FAUNA=[
  {id:'pastos',nome:'Pastos da Fazenda',x:-72,z:60,r:46,hab:'fazenda e pasto',f:{vaca:5,ovelha:6,coelho:3,raposa:1}},
  {id:'clareira',nome:'Mata da Clareira',x:0,z:0,r:62,r0:22,hab:'mata e arbustos',f:{coelho:6,cervo:3,raposa:2}},
  {id:'rio',nome:'Vale do Rio Claro',x:22,z:-30,r:24,rio:true,hab:'mata e campo na beira do rio',f:{cervo:4,javali:2,raposa:2,coelho:2}},
  {id:'serra',nome:'Serra Velha',x:-100,z:-84,r:38,hab:'morros e pedras',f:{cabra:6,lobo:4,urso:1}},
  {id:'norte',nome:'Mata Fechada do Norte',x:8,z:-122,r:32,hab:'mata densa e selvagem',f:{javali:3,lobo:3,onca:1,cervo:2}},
  {id:'lago',nome:'Margens do Lago',x:66,z:104,r:44,hab:'campo e mata na beira do lago',f:{cervo:3,coelho:3,onca:1,javali:1}},
  {id:'sul',nome:'Bosque do Sudoeste',x:-100,z:108,r:38,hab:'mata densa',f:{javali:3,cervo:3,raposa:2,coelho:3,urso:1}},
  {id:'vila',nome:'Arredores da Vila',x:62,z:-72,r:40,r0:16,hab:'área rural perigosa',f:{raposa:2,coelho:2}},
  {id:'leste',nome:'Campos do Leste',x:118,z:-70,r:30,hab:'campo aberto',f:{cervo:3,coelho:3,cabra:2}}];
const FAUNA_POP={ativosMax:34,raioAtiva:90,raioSome:178,raioLento:105,spawnMin:30,checaS:2,migraDias:[3,5],vizinhoZerada:0.5,casal:1.5};
const QUAL_NOME=['Baixa','Comum','Boa','Excepcional'];
let FAUNA_ID=0,faunaSpawnT=1,faunaOcultoT=0,faunaUivoT=40;
const BICHOS=[],TRAPS=[];

/* ---------- população por região ---------- */
function faunaNovo(){const z={};for(const Z of ZONAS_FAUNA){z[Z.id]={};for(const sp in Z.f)z[Z.id][sp]={n:Z.f[sp],rec:0};}
  return{v:1,z,tm:G.tm||0,migra:(G.tm||0)+1440*randi(Math.random,FAUNA_POP.migraDias[0],FAUNA_POP.migraDias[1]),ev:[],mortos:{}};}
function faunaEstado(){if(!G.fauna||!G.fauna.z)G.fauna=faunaNovo();return G.fauna;}
/* passa o tempo da população (em horas de jogo): filhotes, vindos das vizinhas e migrações */
function faunaPopTick(){const F=faunaEstado(),dtH=(G.tm-F.tm)/60;if(dtH<0.25){if(dtH<0)F.tm=G.tm;return;}F.tm=G.tm;
  for(const Z of ZONAS_FAUNA){const zz=F.z[Z.id];for(const sp in Z.f){const e=zz[sp]||(zz[sp]={n:Z.f[sp],rec:0}),cap=Z.f[sp];
      if(e.n>=cap){e.rec=0;continue;}let taxa=FAUNA[sp].pop*(typeof estacaoFaunaK==='function'?estacaoFaunaK():1);if(e.n>=2)taxa*=FAUNA_POP.casal;else if(e.n===0)taxa*=FAUNA_POP.vizinhoZerada;
      e.rec+=taxa*Math.min(dtH,72);while(e.rec>=1&&e.n<cap){e.rec-=1;e.n++;}}}
  if(G.tm>=F.migra){F.migra=G.tm+1440*randi(Math.random,FAUNA_POP.migraDias[0],FAUNA_POP.migraDias[1]);faunaMigracao();}}
function faunaMigracao(){const F=faunaEstado(),cands=[];
  for(const A of ZONAS_FAUNA)for(const sp in A.f){if(!['cervo','ovelha','cabra','javali','lobo'].includes(sp))continue;const ea=F.z[A.id][sp];if(!ea||ea.n<2)continue;
    for(const B of ZONAS_FAUNA){if(B===A||!B.f[sp])continue;const eb=F.z[B.id][sp];if(eb.n<B.f[sp])cands.push([A,B,sp]);}}
  if(!cands.length)return;const[A,B,sp]=cands[Math.floor(Math.random()*cands.length)],k=Math.min(2,F.z[A.id][sp].n-1,B.f[sp]-F.z[B.id][sp].n);if(k<=0)return;
  F.z[A.id][sp].n-=k;F.z[B.id][sp].n+=k;const txt=FAUNA[sp].pl[0].toUpperCase()+FAUNA[sp].pl.slice(1)+' saíram de '+A.nome+' para '+B.nome;
  F.ev.push({tm:Math.round(G.tm),txt});if(F.ev.length>30)F.ev.shift();if(typeof diarioEvento==='function')diarioEvento('Migração: '+txt.toLowerCase(),'caca');
  if(G.modo==='jogo'&&G.dia>1)toast('radio','Rádio: andaram vendo '+FAUNA[sp].pl+' mudando de lugar, '+A.nome+' para '+B.nome+'. Quem caça, fica de olho nos rastros.');}
function faunaBaixa(b){const F=faunaEstado();if(b.zona&&F.z[b.zona]&&F.z[b.zona][b.tipo]){const e=F.z[b.zona][b.tipo];e.n=Math.max(0,e.n-1);}
  F.mortos[b.tipo]=(F.mortos[b.tipo]||0)+1;}
function faunaZona(id){return ZONAS_FAUNA.find(z=>z.id===id);}
function zonaDentro(Z,x,z){if(Z.rio){if(z<-112||z>72||!RIO.ok)return false;return rioPerto(x,z).d<Z.r;}const d=Math.hypot(x-Z.x,z-Z.z);return d<Z.r&&d>=(Z.r0||0);}
function zonaDist(Z,x,z){if(Z.rio){if(!RIO.ok||z<-172||z>132)return 1e9;return Math.max(0,rioPerto(x,z).d-Z.r);}return Math.max(0,Math.hypot(x-Z.x,z-Z.z)-Z.r);}
function zonaEm(x,z){for(const Z of ZONAS_FAUNA)if(zonaDentro(Z,x,z))return Z;return null;}
/* ---------- onde um bicho pode aparecer ---------- */
function densidadeMata(x,z){let n=0;for(const c of colQuery(x,z,6))if(c.tree&&d2(c.x,c.z,x,z)<36)n++;return n;}
function faunaPontoOk(x,z,sp,rigor){const S=FAUNA[sp];if(!dentroMapa(x,z,5)||dentroCidade(x,z,25)||ruralEm(x,z,2))return false;
  if(RIO.ok&&aguaPerto(x,z,1.5))return false;if(typeof aguaPoi==='function'&&aguaPoi(x,z))return false;
  if(pointBlocked(x,z,S.r+0.4))return false;if(d2(x,z,FIRE[0],FIRE[2])<26*26)return false;
  for(const o of OB)if(d2(o.x,o.z,x,z)<16*16)return false;
  for(const p of PLACES)if(p.id!=='fazenda'&&Math.hypot(x-p.x,z-p.z)<p.r+4)return false;
  if(rigor){const dm=densidadeMata(x,z);if((sp==='javali'||sp==='onca'||sp==='urso'||sp==='lobo')&&dm<2)return false;if((sp==='vaca'||sp==='ovelha')&&dm>2)return false;}
  return true;}
function faunaPonto(Z,sp){for(let k=0;k<16;k++){let x,z;
    if(Z.rio){const s=0.18+Math.random()*0.66,p=rioPonto(s),w=RIO.larg(s)+3+Math.random()*Math.max(1,Z.r-RIO.larg(s)-6),lado=Math.random()<0.5?-1:1;x=p[0]+p[3]*w*lado;z=p[1]-p[2]*w*lado;}
    else{const a=Math.random()*6.283,r=(Z.r0||0)+Math.sqrt(Math.random())*(Z.r-(Z.r0||0));x=Z.x+Math.cos(a)*r;z=Z.z+Math.sin(a)*r;}
    const dp=Math.hypot(x-P.x,z-P.z);if(dp<FAUNA_POP.spawnMin)continue;
    // nunca nasce na frente da câmera: à vista só bem longe; fora da vista, a partir de 30 m
    if(dp<(Z.falhas>6?45:75)){const vx=x-cam.pos[0],vz=z-cam.pos[2],l=Math.hypot(vx,vz)||1,f=Math.hypot(cam.fwd[0],cam.fwd[2])||1;if((vx*cam.fwd[0]+vz*cam.fwd[2])/(l*f)>0.3)continue;}
    if(faunaPontoOk(x,z,sp,k<11)){Z.falhas=0;return[x,z];}}Z.falhas=(Z.falhas||0)+1;return null;}
function faunaAtivos(){let n=0;for(const b of BICHOS)if(b.vivo)n++;return n;}
/* liga as regiões perto do jogador: cria os bichos que faltam (até o número que a região tem) */
function faunaMaterializar(){if(G.modo==='menu'||!P.alive&&G.modo!=='jogo'||P.y<-20)return;const F=faunaEstado();let ativos=faunaAtivos();
  for(const Z of ZONAS_FAUNA){if(zonaDist(Z,P.x,P.z)>FAUNA_POP.raioAtiva)continue;
    for(const sp in Z.f){const e=F.z[Z.id][sp];if(!e)continue;let tem=0;for(const b of BICHOS)if(b.vivo&&b.zona===Z.id&&b.tipo===sp)tem++;
      let falta=e.n-tem;while(falta>0&&ativos<FAUNA_POP.ativosMax){const S=FAUNA[sp],q=Math.min(falta,randi(Math.random,S.grupo[0],S.grupo[1]));
        const pt=faunaPonto(Z,sp);if(!pt)break;const g=criarGrupo(sp,pt[0],pt[1],q,Z.id);falta-=g;ativos+=g;if(!g)break;}}}}
function criarGrupo(sp,x,z,q,zona){let lider=null,n=0;
  for(let i=0;i<q;i++){const a=Math.random()*6.283,r=i?1.5+Math.random()*2.5:0,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(i&&!faunaPontoOk(px,pz,sp,false))continue;
    const v=sp==='cervo'?(i===0||Math.random()<0.25?'':'F'):sp==='cabra'||sp==='vaca'?(Math.random()<0.4?'B':''):'';
    const b=criarBicho(sp,px,pz,{zona,lider,var:v});if(!b)continue;if(!lider){lider=b;if(typeof rastroChegada==='function')rastroChegada(b);}n++;}
  return n;}
function criarBicho(tipo,x,z,o){o=o||{};const S=FAUNA[tipo];if(!S)return null;const malha=ZMESH['bicho_'+tipo+(o.var||'')]||ZMESH['bicho_'+tipo];if(!malha)return null;
  const s=o.s||lerp(S.esc[0],S.esc[1],Math.random()),ch=newChar(malha,s),y=chaoBicho(x,z);
  const b={id:++FAUNA_ID,tipo,zona:o.zona||null,var:o.var||'',ch,x,z,y,yaw:o.yaw??Math.random()*6.283,hp:S.hp*s,hpMax:S.hp*s,vivo:true,
    st:Math.random()<0.35?'repouso':'explora',t:2+Math.random()*6,ph:Math.random()*6,amp:0,v:0,vAlvo:0,rx:0,rz:1,alerta:0,amea:null,ameaT:0,lider:o.lider||null,
    fome:Math.random()*(S.fomeS||100)*0.6,golpes:0,dano:0,px:x,pz:z,progT:0,lodT:0,somT:4+Math.random()*12,cd:0,atqT:0,flash:0,sink:0,desvT:0,desvMant:0,dvx:0,dvz:0,
    offA:Math.random()*6.283,offR:1.6+Math.random()*2.4,passo:0,golpeadoT:0,investidas:0,pose:0};
  ch.x=x;ch.z=z;ch.y=y;ch.yaw=b.yaw;BICHOS.push(b);return b;}
/* compatibilidade: chamado ao amanhecer e ao carregar (a população nova já cuida de tudo) */
function popularBichos(){faunaEstado();faunaPopTick();for(let i=BICHOS.length-1;i>=0;i--){const b=BICHOS[i];if(b.vivo&&Math.hypot(b.x-P.x,b.z-P.z)>60)BICHOS.splice(i,1);}faunaSpawnT=0.5;}
function chaoBicho(x,z){return typeof chaoVeic==='function'?chaoVeic(x,z):ground(x,z);}
const bichoAlt=b=>FAUNA[b.tipo].alt*b.ch.s,bichoHitR=b=>FAUNA[b.tipo].hr*b.ch.s;
/* o jogador está escondido no mato? (arbustos e samambaias perto) */
function jogadorNaVegetacao(){let n=0;for(const b of BUSHES)if(Math.abs(b.x-P.x)<2.2&&Math.abs(b.z-P.z)<2.2&&d2(b.x,b.z,P.x,P.z)<4.4)n+=2;
  if(typeof SAMAMBAIAS!=='undefined')for(const s of SAMAMBAIAS)if(Math.abs(s.x-P.x)<1.8&&Math.abs(s.z-P.z)<1.8)n++;return n>=2;}

/* ---------- laço de caça: pega bicho pequeno (coelho e raposa) que passa por ele ---------- */
function armarLaco(i){const s=P.inv[i];if(!s)return false;if(CARRO.ativo||P.nada){feed('Precisa estar no chão firme',true);return false;}
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),x=P.x+fx*1.2,z=P.z+fz*1.2;
  if(pointBlocked(x,z,0.3)||(RIO.ok&&aguaPerto(x,z,0.2))||dentroCidade(x,z,2)||ruralCasaEm(x,z,0.2)){feed('Não dá para armar aqui',true);return false;}
  if(TRAPS.length>=12){feed('Você já armou laços demais (12)',true);return false;}
  TRAPS.push({id:'l'+(++FAUNA_ID),x,z,yaw:P.yaw,armado:true,t0:G.tm,tc:G.tm});s.n--;if(s.n<=0)P.inv[i]=null;sfx('construir');
  feed('Laço armado. Volte depois: coelhos e raposas que passarem caem nele.');dica('laco','corpo','Laço armado! Bichos pequenos que passam por ele ficam presos. Funciona melhor perto de mato, onde há rastros de coelho.');
  invRender();hudBarra();return true;}
function updateLacos(dt){for(const t of TRAPS){if(!t.armado)continue;
    for(const b of BICHOS){if(!b.vivo||(b.tipo!=='coelho'&&b.tipo!=='raposa'))continue;if(d2(b.x,b.z,t.x,t.z)<0.85*0.85){t.armado=false;t.tc=G.tm;b.x=t.x;b.z=t.z;faunaMorre(b,'laco',b.hp);t.pego=b.tipo;break;}}
    // longe do jogador: a cada hora de jogo há chance de pegar algo, se a região tem bicho pequeno
    if(t.armado&&Math.hypot(t.x-P.x,t.z-P.z)>55&&G.tm-t.tc>=60){t.tc=G.tm;const Z=zonaEm(t.x,t.z),F=faunaEstado();
      for(const sp of['coelho','raposa']){const e=Z&&F.z[Z.id][sp];if(!e||e.n<=0)continue;if(Math.random()<(sp==='coelho'?0.1:0.03)){
          const b=criarBicho(sp,t.x,t.z,{zona:Z.id});if(b){t.armado=false;t.pego=sp;faunaMorre(b,'laco',b.hp);}break;}}}}}
INTERS.push(tryIt=>{for(const t of TRAPS)if(Math.abs(t.x-P.x)<3&&Math.abs(t.z-P.z)<3)tryIt({k:'laco',o:t},t.x,t.z,1.6,1.2,-0.6);});
function lacoRecolher(t){const i=TRAPS.indexOf(t);if(i>=0)TRAPS.splice(i,1);const l=invAdd('laco',1);if(l)soltarItens([['laco',1]],t.x,t.z);feed('Recolheu o laço');sfx('pegar');invRender();hudBarra();}
INTER_K.laco={texto:t=>t.armado?{t:'Recolher o laço',s:'armado · segure para tirar',hold:true,dur:0.8}:{t:'Armar o laço de novo',s:(t.pego?'pegou '+FAUNA[t.pego].nome.toLowerCase()+' · ':'')+'toque: armar · segure: recolher',alt:true},
  usar:(t,seg)=>{if(t.armado||seg){lacoRecolher(t);return;}t.armado=true;t.pego=null;t.tc=G.tm;sfx('clique');feed('Laço armado de novo');},
  curto:t=>{t.armado=true;t.pego=null;t.tc=G.tm;sfx('clique');feed('Laço armado de novo');}};

/* ---------- inteligência ---------- */
function updateBichos(dt){if(!ZMESH.bicho_coelho)return;faunaPopTick();
  faunaSpawnT-=dt;if(faunaSpawnT<=0){faunaSpawnT=FAUNA_POP.checaS;faunaMaterializar();}
  faunaOcultoT-=dt;if(faunaOcultoT<=0){faunaOcultoT=0.5;P.vegOculto=jogadorNaVegetacao();}
  updateLacos(dt);
  for(let i=BICHOS.length-1;i>=0;i--){const b=BICHOS[i];
    if(!b.vivo){updateCarcaca(b,dt,i);continue;}
    const dp=Math.hypot(b.x-P.x,b.z-P.z)+(P.y<-20?150:0);   // no subsolo os bichos de cima não te percebem
    if(dp>FAUNA_POP.raioSome&&b.st!=='persegue'){BICHOS.splice(i,1);continue;}
    if(dp>FAUNA_POP.raioLento){b.lodT+=dt;b.ch.vis=false;if(b.lodT<0.5)continue;const d=b.lodT;b.lodT=0;faunaIA(b,d,dp,true);continue;}
    faunaIA(b,dt,dp,false);}
  // uivos dos lobos à noite (dá a pista de onde a matilha anda)
  faunaUivoT-=dt;if(faunaUivoT<=0){faunaUivoT=50+Math.random()*70;if((E.n||0)>0.5){let lb=null,bd=1e9;for(const b of BICHOS)if(b.vivo&&b.tipo==='lobo'){const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<bd){bd=d;lb=b;}}
      if(lb&&bd<160)sfx('uivo',undefined,undefined,clamp(1-bd/170,0.15,0.9));}}}
function faunaIA(b,dt,dp,lento){const S=FAUNA[b.tipo];if(b.congelado){b.ch.vis=true;faunaPose(b,S,dt);return;}b.t-=dt;b.cd=Math.max(0,b.cd-dt);b.flash=Math.max(0,b.flash-dt);b.golpeadoT=Math.max(0,b.golpeadoT-dt);
  if(S.presas)b.fome+=dt;if(b.hp<b.hpMax&&b.st!=='foge'&&b.st!=='persegue'&&b.st!=='ataca')b.hp=Math.min(b.hpMax,b.hp+b.hpMax*0.004*dt);
  if(!lento)faunaPercebe(b,S,dt,dp);else{b.alerta=Math.max(0,b.alerta-dt*0.3);}
  if(b.st==='ataca')faunaAtacando(b,S,dt);else faunaDecide(b,S,dt,dp);
  faunaMove(b,S,dt);
  if(!lento){b.ch.vis=dp<110;b.ch.tint=b.flash>0?[2.2,1.3,1.3]:[1,1,1];if(b.ch.vis)faunaPose(b,S,dt);
    b.somT-=dt;if(b.somT<=0){b.somT=10+Math.random()*22;if(dp<45&&(b.st==='come'||b.st==='explora'||b.st==='repouso'))faunaSom(b,'idle');}}}
/* percepção: visão (cone e distância), barulho, zumbis, predadores, veículo e fogo */
function faunaPercebe(b,S,dt,dp){let amX=0,amZ=0,forca=0,ehP=false;const noite=E.n||0,kv=typeof climaVisao==='function'?climaVisao():1;
  if(P.alive&&!P.dorme&&dp<S.ve*2){let alc=S.ve*kv*(S.noturno?1:lerp(1,0.62,noite))*(S.presas&&typeof estacaoPredador==='function'?estacaoPredador():1);
    if((P.agK||0)>0.5)alc*=0.45;if(P.vegOculto)alc*=0.7;if(CARRO.ativo)alc*=1.5;if(P.lanterna&&noite>0.3)alc*=1.35;if(b.st==='come')alc*=0.78;if(b.st==='repouso')alc*=0.6;
    const fx=Math.sin(b.yaw),fz=Math.cos(b.yaw),dx=P.x-b.x,dz=P.z-b.z,cv=(dx*fx+dz*fz)/(dp||1);
    if(dp<alc&&(cv>S.fov||dp<alc*0.3))b.alerta=Math.min(1.5,b.alerta+dt*(0.8+3.2*(1-dp/alc))*(P.correndo?1.6:1));
    if(S.presas&&P.lesoes&&P.lesoes.sangra>0&&dp<S.ve*1.4)b.alerta=Math.min(1.5,b.alerta+dt*0.6);
    if(b.alerta>0.15&&dp<S.ve*1.6){amX=P.x;amZ=P.z;forca=1;ehP=true;}}
  for(const nz of NOISE){const d=Math.hypot(b.x-nz.x,b.z-nz.z),alc=nz.r*S.ouve;if(d<alc){const f=1-d/alc;b.alerta=Math.min(1.5,b.alerta+0.25+f*1.3);if(f*1.6>forca){amX=nz.x;amZ=nz.z;forca=f*1.6;ehP=d2(nz.x,nz.z,P.x,P.z)<4;}}}
  b.zT=(b.zT||0)-dt;if(b.zT<=0){b.zT=0.6;b.zumbi=null;let bd=14*14;for(const z of Z){if(!z.vivo)continue;const q=d2(z.x,z.z,b.x,b.z);if(q<bd){bd=q;b.zumbi=z;}}
    b.predador=null;if(S.ia!=='territorial'&&S.ia!=='emboscada'){let pd=1e9;for(const o of BICHOS){if(!o.vivo||o===b)continue;const So=FAUNA[o.tipo];if(!So.presas||!So.presas.includes(b.tipo))continue;
        const q=d2(o.x,o.z,b.x,b.z),lim=o.presa===b?28:16;if(q<lim*lim&&q<pd){pd=q;b.predador=o;}}}
    if(CAO&&CAO.ativo&&CAO.ch&&(S.ia==='presa'||S.ia==='rebanho'||S.ia==='arisco')&&d2(CAO.x,CAO.z,b.x,b.z)<12*12)b.cao=true;else b.cao=false;}
  if(b.zumbi&&b.zumbi.vivo&&forca<1.2){b.alerta=Math.min(1.5,b.alerta+dt*2);amX=b.zumbi.x;amZ=b.zumbi.z;forca=1.2;ehP=false;}
  if(b.predador&&b.predador.vivo&&forca<1.3){b.alerta=Math.min(1.5,b.alerta+dt*2.5);amX=b.predador.x;amZ=b.predador.z;forca=1.3;ehP=false;}
  if(b.cao&&forca<1.1){b.alerta=Math.min(1.5,b.alerta+dt*1.5);amX=CAO.x;amZ=CAO.z;forca=1.1;ehP=false;}
  if(CARRO.ativo&&Math.abs(CARRO.v)>3&&d2(CARRO.x,CARRO.z,b.x,b.z)<26*26){b.alerta=1.5;amX=CARRO.x;amZ=CARRO.z;forca=2;ehP=false;}
  for(const f of FIRES)if(!f.lamp&&d2(f.x,f.z,b.x,b.z)<5*5&&forca<0.9){amX=f.x;amZ=f.z;forca=0.9;b.alerta=Math.max(b.alerta,0.8);ehP=false;}
  if(forca>0){b.amea={x:amX,z:amZ,f:forca,p:ehP};b.ameaT=6;}else{b.alerta=Math.max(0,b.alerta-dt*0.22);b.ameaT-=dt;if(b.ameaT<=0)b.amea=null;}}
const lider=b=>b.lider&&b.lider.vivo&&BICHOS.includes(b.lider)?b.lider:null;
function membros(b){const L=lider(b)||b,out=[];for(const o of BICHOS)if(o.vivo&&(o===L||lider(o)===L))out.push(o);return out;}
function faunaFugir(b,am,dur){const S=FAUNA[b.tipo];if(b.st!=='foge'){faunaSom(b,'fuga');if(typeof rastroDeixar==='function')rastroDeixar(b,'fuga');}b.st='foge';b.t=dur||6;b.fogeDe={x:am.x,z:am.z};b.rumoT=0;
  // o susto passa para o grupo
  if(S.ia==='rebanho'||S.ia==='presa'||S.ia==='matilha')for(const o of membros(b))if(o!==b&&o.st!=='foge'&&o.st!=='ataca'){o.st='foge';o.t=(dur||6)*0.9;o.fogeDe={x:am.x,z:am.z};o.rumoT=0;o.alerta=1;}}
function faunaDecide(b,S,dt,dp){const am=b.amea,dA=am?Math.hypot(am.x-b.x,am.z-b.z):1e9;
  if(b.st==='morto')return;
  // muito ferido: até os bravos fogem
  if(b.hp<b.hpMax*0.3&&am&&b.st!=='foge'&&!(S.ia==='emboscada'&&b.st==='persegue'&&dA<3)){faunaFugir(b,am,10);return;}
  switch(S.ia){
    case'presa':case'rebanho':case'arisco':{
      if(S.presas&&b.st==='persegue'&&b.presa){faunaCaca(b,S,dt);return;}
      if(am&&b.alerta>=(S.ia==='rebanho'?0.85:0.65)){const lim=S.ia==='rebanho'?S.ve*0.62:S.ve*0.82;
        if(am.f>=1.2||dA<lim||(b.st==='alerta'&&b.t<=0)||b.golpeadoT>0){faunaFugir(b,am,S.ia==='rebanho'?5:S.ia==='arisco'?8:7);return;}
        if(b.st!=='alerta'&&b.st!=='foge'){b.st='alerta';b.t=0.8+Math.random()*1.4;faunaSom(b,'alerta');}}
      break;}
    case'defensivo':{ // javali: foge, mas encurralado ou ferido vira e ataca
      if(am&&b.alerta>=0.7){
        if((am.p&&(dA<5||b.golpeadoT>0))&&b.investidas<2&&b.hp>b.hpMax*0.35){if(b.st!=='defende'&&b.st!=='persegue'){b.st='defende';b.t=0.9;faunaSom(b,'alerta');b.alvoP=true;}}
        else if(b.st!=='defende'&&b.st!=='persegue'&&b.st!=='recupera'){if(dA<S.ve||am.f>=1.2){faunaFugir(b,am,7);return;}if(b.st!=='alerta'){b.st='alerta';b.t=1.2;faunaSom(b,'alerta');}}}
      if(b.st==='defende'&&b.t<=0){b.st='persegue';b.t=4;b.investidas++;faunaSom(b,'ataque');}
      if(b.st==='persegue'&&b.alvoP){faunaPerseguirJogador(b,S,dt,dp,true);return;}
      break;}
    case'matilha':{ // lobo
      const L=lider(b)||b,grupo=membros(b),fortes=grupo.filter(o=>o.hp>o.hpMax*0.55).length,noite=(E.n||0)>0.5;
      const fraco=P.vida<45||(P.lesoes&&P.lesoes.sangra>0),abrigo=pertoDoFogo()||(typeof sobBase==='function'&&sobBase(P.x,P.z,26))||CARRO.ativo;
      if(b.st==='persegue'&&b.presa){faunaCaca(b,S,dt);return;}
      if(b.st==='persegue'&&b.alvoP){if(abrigo||fortes<Math.max(1,grupo.length-1)){faunaFugir(b,{x:P.x,z:P.z},8);return;}faunaPerseguirJogador(b,S,dt,dp,false);return;}
      if(am&&am.p&&b.alerta>=0.75&&P.alive){const ataca=!abrigo&&fortes>=2&&(noite||fraco||b.golpeadoT>0||(L.st==='come'&&dp<9));
        if(ataca){for(const o of grupo)if(o.st!=='ataca'){o.st='persegue';o.alvoP=true;o.presa=null;o.t=12;}faunaSom(b,'ataque');return;}
        if(b.golpeadoT>0||dp<5){faunaFugir(b,am,7);return;}
        if(dp<14){if(b.st!=='defende'){b.st='defende';b.t=2+Math.random();faunaSom(b,'alerta');}return;}
        if(b.st!=='alerta'&&b.st!=='defende'&&b.st!=='recupera'){b.st='alerta';b.t=2.5;}}
      else if(am&&!am.p&&am.f>=1.2&&b.st!=='foge'){faunaFugir(b,am,6);return;}
      if(b.st==='defende'&&b.t<=0){b.st='recupera';b.t=6;b.recDe={x:P.x,z:P.z};}
      break;}
    case'territorial':{ // urso: defende o espaço, investe se você insiste, foge muito ferido
      if(b.st==='persegue'&&b.presa){faunaCaca(b,S,dt);return;}
      if(am&&am.p&&b.alerta>=0.6&&P.alive){
        if(b.st==='persegue'&&b.alvoP){if(dp>24||CARRO.ativo){b.st='recupera';b.t=8;b.recDe={x:P.x,z:P.z};return;}faunaPerseguirJogador(b,S,dt,dp,false);return;}
        if(b.golpeadoT>0&&b.hp>b.hpMax*0.45&&b.st!=='persegue'){b.st='persegue';b.alvoP=true;b.t=10;faunaSom(b,'ataque');return;}
        if(dp<16&&b.st!=='defende'&&b.st!=='persegue'&&b.st!=='recupera'){b.st='defende';b.t=2.6;faunaSom(b,'alerta');return;}
        if(b.st==='defende'&&b.t<=0){if(dp<13){b.st='persegue';b.alvoP=true;b.t=10;faunaSom(b,'ataque');}else{b.st='recupera';b.t=8;b.recDe={x:P.x,z:P.z};}return;}}
      else if(am&&!am.p&&am.f>=1.3&&b.st!=='foge'&&b.st!=='persegue'){faunaFugir(b,am,5);return;}
      break;}
    case'emboscada':{ // onça: evita o jogador; à noite ou com o jogador fraco, persegue escondida e dá o bote
      if(b.st==='persegue'&&b.presa){faunaCaca(b,S,dt);return;}
      const noite=(E.n||0)>0.55,fraco=P.vida<50||(P.lesoes&&P.lesoes.sangra>0),abrigo=pertoDoFogo()||(typeof sobBase==='function'&&sobBase(P.x,P.z,26))||CARRO.ativo;
      if(am&&am.p&&b.alerta>=0.5&&P.alive){const quer=!abrigo&&(noite||fraco||b.golpeadoT>0)&&b.hp>b.hpMax*0.5;
        if(b.st==='persegue'&&b.alvoP){if(!quer){faunaFugir(b,am,10);return;}faunaPerseguirJogador(b,S,dt,dp,false,true);return;}
        if(quer&&b.st!=='recupera'){b.st='persegue';b.alvoP=true;b.t=30;b.furtivo=true;return;}
        if(b.st!=='foge'&&b.st!=='recupera'){faunaFugir(b,am,9);b.devagar=true;return;}}
      else if(am&&!am.p&&am.f>=1.3&&b.st!=='foge'){faunaFugir(b,am,6);return;}
      break;}}
  faunaRotina(b,S,dt,dp);}
/* comportamento sem ameaça: descansa, anda pela região, come; rebanho segue o líder; predador com fome caça */
function faunaRotina(b,S,dt,dp){const L=lider(b);
  switch(b.st){
    case'foge':{if(b.t<=0||(b.fogeDe&&Math.hypot(b.x-b.fogeDe.x,b.z-b.fogeDe.z)>S.ve*1.4)){b.st='recupera';b.t=8+Math.random()*8;b.devagar=false;b.recDe=b.fogeDe;}
      else{b.rumoT=(b.rumoT||0)-dt;if(b.rumoT<=0){b.rumoT=0.5;const r=rumoFuga(b,S);b.rx=r[0];b.rz=r[1];}b.vAlvo=b.devagar?S.trota*1.2:S.corre*(b.hp<b.hpMax*0.4?0.75:1);}return;}
    case'alerta':{b.vAlvo=0;if(b.amea){const a=Math.atan2(b.amea.x-b.x,b.amea.z-b.z);b.yaw=angLerp(b.yaw,a,1-Math.exp(-dt*4));}if(b.t<=0&&b.alerta<0.5){b.st='explora';b.t=3+Math.random()*4;}else if(b.t<=0)b.t=0.5;return;}
    case'defende':{b.vAlvo=0;const a=Math.atan2(P.x-b.x,P.z-b.z);b.yaw=angLerp(b.yaw,a,1-Math.exp(-dt*5));if(b.t<=0&&FAUNA[b.tipo].ia!=='defensivo'&&FAUNA[b.tipo].ia!=='matilha'&&FAUNA[b.tipo].ia!=='territorial'){b.st='explora';b.t=3;}return;}
    case'recupera':{// anda devagar para longe de onde veio o perigo e volta ao normal
      const de=b.recDe||{x:b.x-b.rx,z:b.z-b.rz},dx=b.x-de.x,dz=b.z-de.z,l=Math.hypot(dx,dz)||1;b.rx=dx/l;b.rz=dz/l;b.vAlvo=S.anda*(b.hp<b.hpMax*0.5?0.7:1);
      if(b.t<=0){b.st='explora';b.t=3+Math.random()*5;b.alvoP=false;b.furtivo=false;b.investidas=0;}return;}
    case'persegue':{if(!b.presa&&!b.alvoP){b.st='explora';b.t=3;}return;}
  }
  // predador com fome procura presa
  if(S.presas&&b.fome>S.fomeS&&(!L||FAUNA[b.tipo].ia!=='matilha')){const pr=procurarPresa(b,S);if(pr){b.st='persegue';b.presa=pr;b.t=22;b.alvoP=false;
      if(S.ia==='matilha')for(const o of membros(b))if(o!==b&&o.st!=='ataca'){o.st='persegue';o.presa=pr;o.t=22;o.alvoP=false;}return;}}
  // rebanho e matilha: os outros acompanham o líder
  if(L){const a=L.yaw+b.offA,tx=L.x+Math.sin(a)*b.offR,tz=L.z+Math.cos(a)*b.offR,d=Math.hypot(tx-b.x,tz-b.z);
    if(d>2.2){b.st='explora';b.rx=tx-b.x;b.rz=tz-b.z;b.vAlvo=d>9?S.trota:S.anda*(d>4?1.3:1);return;}
    if(L.st==='repouso'||L.st==='come'){if(b.st!==L.st){b.st=L.st;b.t=L.t+Math.random()*3;}b.vAlvo=0;return;}
    b.vAlvo=0;if(b.t<=0){b.st=Math.random()<0.6?'come':'explora';b.t=2+Math.random()*4;}return;}
  if(b.t<=0){const r=Math.random(),noite=(E.n||0)>0.5,dorme=S.noturno?!noite:noite;
    b.st=r<(dorme?0.45:0.18)?'repouso':r<0.62?'come':'explora';b.t=b.st==='repouso'?12+Math.random()*25:b.st==='come'?5+Math.random()*9:4+Math.random()*7;
    if(b.st==='explora'){const Z=b.zona&&faunaZona(b.zona);let tx,tz;
      if(Z&&!zonaDentro(Z,b.x,b.z)&&!Z.rio){tx=Z.x-b.x;tz=Z.z-b.z;}else{const a=b.yaw+(Math.random()-0.5)*2.4;tx=Math.sin(a);tz=Math.cos(a);}
      const l=Math.hypot(tx,tz)||1;b.rx=tx/l;b.rz=tz/l;}
    if(b.st==='repouso'&&typeof rastroDeixar==='function')rastroDeixar(b,'cama');
    if(b.st==='come'&&typeof rastroDeixar==='function'&&Math.random()<0.5)rastroDeixar(b,'comida');}
  b.vAlvo=b.st==='explora'?S.anda:0;
  if(b.st==='come'&&b.comendo&&!b.comendo.vivo&&d2(b.comendo.x,b.comendo.z,b.x,b.z)>1.6*1.6){b.rx=b.comendo.x-b.x;b.rz=b.comendo.z-b.z;b.vAlvo=S.anda;}}
function procurarPresa(b,S){let best=null,bd=(S.ve*1.1)**2;for(const o of BICHOS){if(!o.vivo||!S.presas.includes(o.tipo))continue;const q=d2(o.x,o.z,b.x,b.z);if(q<bd){bd=q;best=o;}}return best;}
/* predador atrás da presa: corre, morde, mata e come */
function faunaCaca(b,S,dt){const pr=b.presa;if(!pr||!pr.vivo||!BICHOS.includes(pr)||b.t<=0){b.presa=null;b.st='recupera';b.t=5;return;}
  const dx=pr.x-b.x,dz=pr.z-b.z,d=Math.hypot(dx,dz);if(d>S.ve*1.6){b.presa=null;b.st='recupera';b.t=5;return;}
  b.rx=dx;b.rz=dz;b.vAlvo=S.corre*(d<6?1:0.9);if(d<S.ataque.alc*b.ch.s+FAUNA[pr.tipo].r&&b.cd<=0){b.st='ataca';b.atqT=0;b.atqAlvo=pr;b.atqFeito=false;}}
/* perseguindo o jogador (investida do javali passa reto; a onça chega escondida e dá o bote) */
function faunaPerseguirJogador(b,S,dt,dp,investida,furtiva){const dx=P.x-b.x,dz=P.z-b.z;
  if(b.t<=0||!P.alive){b.st='recupera';b.t=6;b.recDe={x:P.x,z:P.z};return;}
  if(furtiva){const vx=Math.sin(P.yaw),vz=Math.cos(P.yaw),olhando=(-dx*vx-dz*vz)/(dp||1)>0.6;
    if(olhando&&dp<14&&dp>7){b.vAlvo=0;b.rx=dx;b.rz=dz;b.parada=(b.parada||0)+dt;if(b.parada>2.5){b.parada=0;faunaFugir(b,{x:P.x,z:P.z},8);b.devagar=true;}return;}
    b.parada=0;b.rx=dx;b.rz=dz;b.vAlvo=dp>8?S.anda*1.25:S.corre;b.furtivo=dp>8;}
  else{// matilha: no máximo dois atacam de cada vez; os outros rodeiam rosnando
    if(S.ia==='matilha'&&dp<8){let perto=0;for(const o of membros(b))if(o!==b&&(o.st==='ataca'||(o.st==='persegue'&&Math.hypot(o.x-P.x,o.z-P.z)<3.5)))perto++;
      if(perto>=2){const a=Math.atan2(b.x-P.x,b.z-P.z)+0.9;b.rx=P.x+Math.sin(a)*6.5-b.x;b.rz=P.z+Math.cos(a)*6.5-b.z;b.vAlvo=S.trota;return;}}
    b.rx=dx;b.rz=dz;b.vAlvo=S.corre*(investida?1.05:dp<4?0.8:1);}
  const alc=S.ataque.alc*b.ch.s+0.35;if(dp<alc&&b.cd<=0){b.st='ataca';b.atqT=0;b.atqAlvo='P';b.atqFeito=false;b.furtivo=false;}}
/* golpe: preparação curta, acerta se o alvo ainda está perto e na frente, depois o intervalo */
function faunaAtacando(b,S,dt){const A=S.ataque,prep=b.tipo==='urso'?0.5:b.tipo==='onca'?0.3:b.tipo==='javali'?0.08:0.32;b.atqT+=dt;
  const alvo=b.atqAlvo==='P'?P:b.atqAlvo;if(alvo&&alvo!==P&&!alvo.vivo&&b.comendo===alvo){b.st='come';b.t=35+Math.random()*40;b.cd=A.cad;if(typeof rastroDeixar==='function')rastroDeixar(b,'comida');return;}
  if(!alvo||(alvo!==P&&!alvo.vivo)){b.st='recupera';b.t=4;return;}
  const dx=alvo.x-b.x,dz=alvo.z-b.z,d=Math.hypot(dx,dz),encosta=(alvo===P?0.45:FAUNA[alvo.tipo].r)+S.r*b.ch.s;
  // vira de frente para o alvo e encosta nele (sem passar direto); o javali investe reto
  if(b.tipo!=='javali'){b.yaw=angLerp(b.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*14));b.rx=dx;b.rz=dz;b.vAlvo=b.atqT<prep&&d>encosta+0.3?(b.tipo==='onca'?S.corre:S.trota):0;}
  else b.vAlvo=S.corre*0.9;
  if(!b.atqFeito&&b.atqT>=prep){b.atqFeito=true;const fx=Math.sin(b.yaw),fz=Math.cos(b.yaw),frente=(dx*fx+dz*fz)/(d||1),alc=A.alc*b.ch.s*1.3+(alvo===P?0.4:FAUNA[alvo.tipo].r);
    if(d<alc&&(frente>0.2||d<encosta+0.6)){if(alvo===P)faunaFerirJogador(b,S);else{ferirBicho(alvo,A.dano*3,fx,fz,'predador');if(!alvo.vivo){b.comendo=alvo;b.presa=null;b.fome=0;}}}
    faunaSom(b,'ataque');}
  if(b.atqT>=prep+A.cad*0.6){b.cd=A.cad;
    if(b.comendo){b.st='come';b.t=35+Math.random()*40;return;}
    if(b.atqAlvo==='P'){if(b.tipo==='javali'){b.st='recupera';b.t=2.5;b.recDe={x:P.x,z:P.z};return;}
      if(b.tipo==='lobo'&&Math.random()<0.7){b.st='recupera';b.t=2.5+Math.random()*2;b.recDe={x:P.x,z:P.z};return;}
      if(b.tipo==='onca'&&(b.golpeadoT>0||Math.random()<0.4)){faunaFugir(b,{x:P.x,z:P.z},7);b.devagar=false;return;}
      b.st='persegue';b.alvoP=true;b.t=Math.max(b.t,6);return;}
    b.st='persegue';}}
function faunaFerirJogador(b,S){const A=S.ataque;if(!P.alive)return;const d=A.dano*b.ch.s;ferirJogador(d,{x:b.x,z:b.z,tipo:'bicho_'+b.tipo});
  if(Math.random()<A.sangra){const L=P.lesoes||(P.lesoes=lesNovo()),forte=Math.random()<(A.forte||0.25),antes=L.sangra;L.sangra=Math.max(L.sangra,forte?2:1);L.sangraT=0;
    if(L.sangra>antes)toast('alerta',forte?'O '+S.nome.toLowerCase()+' abriu um corte fundo! Use bandagem ou kit médico logo.':'Mordida do '+S.nome.toLowerCase()+': você está sangrando.');}
  if(typeof feridaGrave==='function'&&d>=24)feridaGrave(d);
  if(A.derruba){P.vx=(P.x-b.x)*3;P.vz=(P.z-b.z)*3;P.shake=1;}
  const nome=S.nome.toLowerCase();dica('bicho_'+b.tipo,'alerta',b.tipo==='urso'?'Urso! Ele defende o espaço dele: afaste-se devagar. Se ele investir, corra para longe ou suba num lugar alto. Caçar urso pede preparo: arco forte, arma de fogo ou armadilha.':
    b.tipo==='lobo'?'Lobos atacam em grupo quando você está ferido, sozinho ou no escuro. Fogo e a base afastam a matilha. Derrube um e o resto costuma recuar.':
    b.tipo==='onca'?'A onça chega escondida pelo mato e dá o bote. Olhar na direção dela faz ela parar; luz e fogo também afastam.':'O '+nome+' revidou! Bicho encurralado ou ferido ataca.');}
/* rumo de fuga: longe da ameaça, sem obstáculo, água ou ladeira; a raposa procura o mato; o coelho ziguezagueia */
function rumoFuga(b,S){const de=b.fogeDe||b.amea||{x:P.x,z:P.z};let ax=b.x-de.x,az=b.z-de.z;const l=Math.hypot(ax,az)||1;ax/=l;az/=l;let best=null,bs=-1e9;
  for(let k=0;k<12;k++){const a=k/12*6.283,dx=Math.sin(a),dz=Math.cos(a);let s=(dx*ax+dz*az)*2;
    const px=b.x+dx*3.2,pz=b.z+dz*3.2;if(!rumoLivre(b,dx,dz,S))s-=4;
    if(S.ia==='arisco'||S.ia==='emboscada')s+=Math.min(3,densidadeMata(px,pz))*0.35;
    const Z=b.zona&&faunaZona(b.zona);if(Z&&!Z.rio&&!zonaDentro(Z,px,pz))s-=0.4;
    if(s>bs){bs=s;best=[dx,dz];}}
  if(b.tipo==='coelho'){const zz=Math.sin(G.t*5+b.id)*0.55;return[best[0]+best[1]*zz,best[1]-best[0]*zz];}return best;}
function rumoLivre(b,dx,dz,S){const k=Math.max(1,b.ch.s*S.r*3);
  for(const dist of[1.0*k,2.2*k]){const x=b.x+dx*dist,z=b.z+dz*dist;if(!dentroMapa(x,z,4)||dentroCidade(x,z,12))return false;if(pointBlocked(x,z,S.r*0.8))return false;
    if(RIO.ok&&aguaNivel(x,z)!==null&&aguaProfVeic(x,z)>0.35)return false;
    if(!S.escala&&Math.abs(chaoBicho(x,z)-b.y)/dist>0.8)return false;}
  return true;}
function melhorRumo(b,dx,dz,S){for(const a of[0.55,-0.55,1.1,-1.1,1.7,-1.7,2.4,-2.4,3.14]){const c=Math.cos(a),s=Math.sin(a),nx=dx*c-dz*s,nz=dx*s+dz*c;if(rumoLivre(b,nx,nz,S))return[nx,nz];}return null;}
function faunaMove(b,S,dt){let va=b.st==='repouso'||b.st==='come'&&!b.comendo?0:(b.vAlvo||0);
  if(va>0.05){let dx=b.rx,dz=b.rz;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    b.desvT-=dt;if(b.desvT<=0){b.desvT=0.25;if(!rumoLivre(b,dx,dz,S)){const alt=melhorRumo(b,dx,dz,S);if(alt){b.dvx=alt[0];b.dvz=alt[1];b.desvMant=0.7;}else{va=0;}}}
    if(b.desvMant>0){b.desvMant-=dt;dx=b.dvx;dz=b.dvz;}
    b.yaw=angLerp(b.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*(va>S.trota?6:3.5)));}
  b.v=approach(b.v,va,dt*(va>b.v?S.corre*1.3:S.corre*2.2));if(b.v<0.01)return;
  const fx=Math.sin(b.yaw),fz=Math.cos(b.yaw),ox=b.x,oz=b.z;b.x+=fx*b.v*dt;b.z+=fz*b.v*dt;
  if(RIO.ok&&aguaNivel(b.x,b.z)!==null&&aguaProfVeic(b.x,b.z)>0.5){b.x=ox;b.z=oz;b.v*=0.3;b.desvT=0;}
  b.y=chaoBicho(b.x,b.z);collide(b,S.r*b.ch.s,c=>c.solid);
  if(!dentroMapa(b.x,b.z,4)||dentroCidade(b.x,b.z,10)){b.x=ox;b.z=oz;b.yaw+=Math.PI*0.7;b.v*=0.4;}
  b.y=chaoBicho(b.x,b.z);
  // preso: andando sem sair do lugar? vira e tenta outro rumo
  b.progT+=dt;if(b.progT>1.2){const m=Math.hypot(b.x-b.px,b.z-b.pz);if(va>0.6&&m<0.3*b.progT){b.yaw+=(Math.random()<0.5?1:-1)*(1.2+Math.random());b.rx=Math.sin(b.yaw);b.rz=Math.cos(b.yaw);b.desvMant=0;b.travou=(b.travou||0)+1;if(b.st==='explora'){b.st='come';b.t=2;}}else b.travou=0;b.px=b.x;b.pz=b.z;b.progT=0;}
  b.passo+=Math.hypot(b.x-ox,b.z-oz);if(b.passo>S.rastroM){b.passo=0;if(typeof rastroDeixar==='function')rastroDeixar(b,'pegada');}}

/* ---------- golpes, morte e carcaça ---------- */
function ferirBicho(b,dmg,kx,kz,tipoDano){if(!b||!b.vivo)return;const S=FAUNA[b.tipo];b.hp-=dmg;b.flash=0.15;b.golpes++;b.dano+=dmg;
  if(tipoDano==='fogo')b.queimou=true;if(tipoDano==='explosao')b.explodiu=true;
  sangue(b.x,b.y+bichoAlt(b)*0.6,b.z,S.porte==='grande'?8:5);if(typeof rastroDeixar==='function')rastroDeixar(b,'sangue');
  if(b.hp<=0){faunaMorre(b,tipoDano,dmg);return;}
  faunaSom(b,'dor');b.golpeadoT=6;b.alerta=1.5;
  if(tipoDano!=='predador'){b.amea={x:P.x,z:P.z,f:1.6,p:true};b.ameaT=8;}
  if(S.ia==='presa'||S.ia==='rebanho'||S.ia==='arisco'){faunaFugir(b,b.amea||{x:b.x-kx,z:b.z-kz},9);return;}
  if(tipoDano==='predador')return;
  if(S.ia==='defensivo'&&b.hp>b.hpMax*0.35){b.st='defende';b.t=0.5;b.alvoP=true;return;}
  if(S.ia==='matilha'){if(b.hp<b.hpMax*0.6)faunaFugir(b,b.amea,8);else for(const o of membros(b))if(o.hp>o.hpMax*0.55&&o.st!=='ataca'){o.st='persegue';o.alvoP=true;o.t=10;}return;}
  if(S.ia==='territorial'){if(b.hp>b.hpMax*0.45){b.st='persegue';b.alvoP=true;b.t=12;faunaSom(b,'ataque');}else faunaFugir(b,b.amea,12);return;}
  if(S.ia==='emboscada'){if(b.hp>b.hpMax*0.5&&Math.hypot(P.x-b.x,P.z-b.z)<10){b.st='persegue';b.alvoP=true;b.t=8;b.furtivo=false;}else{faunaFugir(b,b.amea,12);b.devagar=false;}}}
function faunaMorre(b,tipoDano,dmg){const S=FAUNA[b.tipo];b.vivo=false;b.st='morto';b.t=0;b.lado=Math.random()<0.5?1:-1;b.v=0;
  const limpo=b.golpes<=2&&!b.queimou&&!b.explodiu&&tipoDano!=='predador',estrago=b.golpes>6||!!b.queimou||!!b.explodiu||dmg>b.hpMax*1.8;
  const rest=Object.assign({},FAUNA_RENDE[b.tipo]);if(tipoDano==='predador'){rest.carneCrua=Math.floor((rest.carneCrua||0)*0.35);if(rest.gordura)rest.gordura=Math.floor(rest.gordura/2);}
  b.carc={id:'c'+b.id+'_'+Math.round(G.tm),rest,t0:G.tm,q:null,limpo,estrago,comido:tipoDano==='predador',esfolada:false,vazia:false,coletas:[]};
  faunaBaixa(b);faunaSom(b,'morte');
  for(const o of membros(b))if(o!==b&&o.vivo&&FAUNA[o.tipo].ia!=='matilha'){o.alerta=1.2;faunaFugir(o,{x:b.x,z:b.z},6);}
  for(const o of BICHOS)if(o.lider===b)o.lider=null;
  if(tipoDano==='predador'||tipoDano==='laco'&&Math.hypot(b.x-P.x,b.z-P.z)>40)return;
  ganharXP(S.xp);progresso('caca');if(typeof conqEvento==='function')conqEvento('caca',b.tipo);if(typeof diarioConta==='function'){diarioConta('caca_'+b.tipo);diarioEvento('Caçou: '+S.nome.toLowerCase()+(tipoDano==='laco'?' (no laço)':''),'caca');}
  dica('esfolar','corpo','Bicho abatido! Com uma faca (ou outra lâmina) na mochila, segure E perto da carcaça para esfolar: sai couro, carne e o que a espécie tiver. Faca de pedra: 1 madeira e 2 pedras.');}
function updateCarcaca(b,dt,i){const c=b.carc,ch=b.ch;b.t+=dt;ch.tint=c&&c.vazia?[0.72,0.34,0.3]:[1,1,1];
  const idade=G.tm-(c?c.t0:G.tm);let some=false;
  if(c&&c.vazia&&G.tm-(c.tv||G.tm)>360)some=true;   // depois de esfolada, os restos somem em 6 horas
  if(c&&!c.vazia&&idade>2880)some=true;              // carcaça inteira apodrece em 2 dias
  if(!c&&b.t>200)some=true;
  if(some){b.sink-=dt*0.35;if(b.sink<-0.8){BICHOS.splice(i,1);return;}}
  ch.x=b.x;ch.z=b.z;ch.y=chaoBicho(b.x,b.z)+b.sink;ch.yaw=b.yaw;ch.vis=d2(b.x,b.z,P.x,P.z)<110*110;if(ch.vis)poseMorto(b,dt);}
/* qualidade do couro: espécie, estado da carcaça (golpes, fogo, explosão, idade), lâmina e perícia. Baixa, Comum, Boa ou Excepcional */
function faunaQualidade(b,lamina){const c=b.carc;let q=FAUNA[b.tipo].couroQ??1;if(c.estrago)q--;if(c.limpo)q++;
  const h=(G.tm-c.t0)/60;if(h>24)q-=2;else if(h>10)q--;const d=lamina&&ITEMS[lamina.id];q+=(d&&d.esfolaQ)||0;if(typeof perk==='function'&&perk('esfolador')>=2)q++;
  return clamp(q,0,3);}
function carcacaResumo(c){return Object.entries(c.rest).filter(([k,n])=>n>0).map(([k,n])=>n+' '+(ITEMS[k]?ITEMS[k].nome.toLowerCase():k)).join(', ');}
function carcacaTexto(b){const c=b.carc,S=FAUNA[b.tipo];if(!c)return null;const res=carcacaResumo(c);
  if(!temLamina())return{t:'Precisa de faca para esfolar',s:S.nome+(res?' · '+res:'')};
  const dur=S.esfola*(typeof perk==='function'&&perk('esfolador')?0.7:1);
  return{t:(c.esfolada?'Recolher o resto do ':'Esfolar o ')+S.nome.toLowerCase(),s:(res||'nada')+' · segure',hold:true,dur};}
function esfolar(b){const c=b.carc;if(!c||c.vazia)return;const s=temLamina();if(!s){feed('Precisa de uma faca (ou outra lâmina) para esfolar',true);return;}
  if(c.q===null||c.q===undefined)c.q=faunaQualidade(b,s);const ganhos=[],sobrou=[];
  for(const id of Object.keys(c.rest)){const n=c.rest[id];if(!n||!ITEMS[id])continue;const extra=ITEMS[id].qual?{q:c.q}:undefined;
    const left=invAdd(id,n,extra),ok=n-left;c.rest[id]=left;if(ok>0)ganhos.push(ok+' '+ITEMS[id].nome.toLowerCase()+(extra?' ('+QUAL_NOME[c.q].toLowerCase()+')':''));if(left>0)sobrou.push(left+' '+ITEMS[id].nome.toLowerCase());}
  if(ganhos.length){c.coletas.push({tm:Math.round(G.tm),quem:'local',itens:ganhos.length});gastar(s,FAUNA[b.tipo].porte==='grande'?4:2);sangue(b.x,b.y+0.3,b.z,10);sfx('mordida',b.x,b.z,0.6);feed('Esfolou: '+ganhos.join(', '));}
  if(!c.esfolada){c.esfolada=true;ganharXP(5);progresso('esfolar');if(typeof diarioConta==='function')diarioConta('esfolou');if(typeof conqEvento==='function')conqEvento('esfolar',b.tipo);}
  if(sobrou.length){feed('Mochila cheia: ficou na carcaça '+sobrou.join(', '),true);dica('carcacaCheia','corpo','A mochila encheu. O que não coube continua na carcaça: libere espaço e volte antes que ela apodreça (uns 2 dias).');}
  else{c.vazia=true;c.tv=G.tm;}
  if(c.q!==null)dica('qualidade','corpo','Couro tem qualidade: baixa, comum, boa ou excepcional. Morte limpa (poucos golpes, sem fogo nem explosão), carcaça fresca e uma faca boa dão couro melhor. Roupa feita com couro bom dura mais.');
  invRender();hudBarra();}

/* ---------- sons por espécie ---------- */
function faunaSom(b,ev){const d=Math.hypot(b.x-P.x,b.z-P.z);if(d>48)return;sfx('bicho',b.x,b.z,ev==='idle'?0.5:0.8,b.tipo+':'+ev);}
SONS.bicho=({noise,tone,voz,r,extra})=>{const[tp,ev]=(extra||'').split(':');
  const V={coelho:()=>{if(ev==='dor'||ev==='morte')voz(0.25,900*r(),700,1800,3200,0.2,0,0.1);else noise(0.12,'bandpass',2600,1200,1.2,0.25);},
    raposa:()=>{if(ev==='idle'||ev==='alerta'){voz(0.16,720*r(),520,1400,2600,0.22,0,0.15);voz(0.14,700*r(),500,1400,2600,0.18,0.22,0.1);}else voz(0.3,600*r(),380,1200,2400,0.25,0,0.2);},
    ovelha:()=>voz(ev==='dor'?0.5:0.75,260*r(),ev==='dor'?320:230,700,1800,0.26,0,0.06),
    cabra:()=>{voz(0.55,330*r(),300,800,2100,0.24,0,0.08);},
    cervo:()=>{if(ev==='alerta'||ev==='fuga')noise(0.22,'bandpass',900,600,1.4,0.45);else voz(0.4,420*r(),300,900,2000,0.2,0,0.1);},
    vaca:()=>voz(ev==='dor'?0.8:1.4,128*r(),105,500,900,0.32,0,0.05),
    javali:()=>{if(ev==='dor'||ev==='morte')voz(0.5,700*r(),900,1500,3000,0.25,0,0.2);else{voz(0.22,95*r(),80,400,800,0.3,0,0.35);voz(0.2,90*r(),75,400,800,0.25,0.28,0.35);}},
    lobo:()=>{if(ev==='dor'||ev==='morte')voz(0.4,900*r(),600,1600,3000,0.25,0,0.1);else if(ev==='idle')voz(1.6,330*r(),420,800,1600,0.18,0,0);else voz(0.7,85*r(),70,420,900,0.32,0,0.35);},
    urso:()=>{if(ev==='alerta'||ev==='ataque')voz(1.1,70*r(),58,300,700,0.5,0,0.5);else voz(0.5,95*r(),80,350,800,0.3,0,0.3);},
    onca:()=>{if(ev==='idle'){for(let i=0;i<4;i++)voz(0.18,140*r(),110,500,1100,0.25,i*0.32,0.4);}else voz(0.6,120*r(),90,450,1000,0.42,0,0.45);}};
  (V[tp]||V.coelho)();};

/* ---------- salvar e carregar ---------- */
V8.novo.fauna=()=>{G.fauna=faunaNovo();TRAPS.length=0;};
V8.salvar.fauna=()=>({pop:G.fauna,carc:BICHOS.filter(b=>!b.vivo&&b.carc&&!b.carc.vazia).map(b=>({t:b.tipo,v:b.var,x:+b.x.toFixed(2),z:+b.z.toFixed(2),y:+b.yaw.toFixed(2),s:+b.ch.s.toFixed(3),
  c:{id:b.carc.id,rest:b.carc.rest,t0:Math.round(b.carc.t0),q:b.carc.q,limpo:b.carc.limpo,estrago:b.carc.estrago,comido:b.carc.comido,esfolada:b.carc.esfolada,coletas:b.carc.coletas.slice(-6)}})),
  lacos:TRAPS.map(t=>({x:+t.x.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),armado:t.armado,pego:t.pego||null,t0:Math.round(t.t0)}))});
V8.carregar.fauna=s=>{G.fauna=s&&s.pop&&s.pop.z?s.pop:faunaNovo();const F=G.fauna;for(const Z of ZONAS_FAUNA){F.z[Z.id]=F.z[Z.id]||{};for(const sp in Z.f)if(!F.z[Z.id][sp])F.z[Z.id][sp]={n:Z.f[sp],rec:0};}
  F.ev=F.ev||[];F.mortos=F.mortos||{};if(typeof F.tm!=='number'||F.tm>G.tm)F.tm=G.tm;if(typeof F.migra!=='number')F.migra=G.tm+1440*4;
  for(let i=BICHOS.length-1;i>=0;i--)BICHOS.splice(i,1);
  for(const k of(s&&s.carc)||[]){if(!FAUNA[k.t])continue;const b=criarBicho(k.t,k.x,k.z,{var:k.v||'',s:k.s,yaw:k.y});if(!b)continue;b.vivo=false;b.st='morto';b.lado=1;b.rolo=1.45;
    b.carc=Object.assign({q:null,coletas:[],vazia:false},k.c);b.carc.rest=Object.assign({},k.c.rest);}
  TRAPS.length=0;for(const t of(s&&s.lacos)||[])TRAPS.push({id:'l'+(++FAUNA_ID),x:t.x,z:t.z,yaw:t.yaw,armado:!!t.armado,pego:t.pego,t0:t.t0||G.tm,tc:G.tm});};

/* ================= malhas: um corpo próprio para cada espécie (12 ossos: corpo, pescoço, cabeça, 4 pernas em 2 partes, rabo) ================= */
const FAUNA_FORMA={
  coelho:{L:0.3,W:0.17,H:0.17,corpo:[[0,0.8,0.9,0.02],[0.3,1,1,0.025],[0.65,0.9,0.86,0.01],[1,0.62,0.68,0]],pS:[0.06,0.11],pI:[0.06,0.07],pR:[0.03,0.022,0.016],legZ:[0.1,-0.08],legX:0.05,
    pesc:{len:0.05,r0:0.055,r1:0.05,ang:0.9,y:0.04,z:0.12},cab:{len:0.1,w:0.1,h:0.09,foc:0.05,focW:0.045,focH:0.04,ang:0.25},ore:{tipo:'longa',len:0.13,w:0.035},rabo:{tipo:'bola',len:0.04,r0:0.035,ang:0.4,y:0.04},
    cor:{base:0x8a7a66,barriga:0xd8cfc0,pata:0x9a8a76,focinho:0xb0a08a,nariz:0x3a2a28,claro:0xf2eee6},pata:'pata',dobra:'coelho',j:0.07},
  raposa:{L:0.52,W:0.19,H:0.22,corpo:[[0,0.8,0.85,0.01],[0.35,1,1,0.01],[0.75,0.95,0.98,0.01],[1,0.78,0.85,0.02]],pS:[0.15,0.17],pI:[0.15,0.15],pR:[0.032,0.024,0.017],legZ:[0.2,-0.19],legX:0.06,
    pesc:{len:0.13,r0:0.07,r1:0.058,ang:0.6,y:0.05,z:0.22},cab:{len:0.16,w:0.12,h:0.1,foc:0.12,focW:0.035,focH:0.032,ang:0.15},ore:{tipo:'ponta',len:0.1,w:0.055},rabo:{tipo:'peludo',len:0.42,r0:0.04,r1:0.07,ang:-0.35,y:0.04},
    cor:{base:0xc0602a,barriga:0xf0e8dc,pata:0x2a2420,focinho:0xf0e8dc,nariz:0x141010,claro:0xf6f2ea},pata:'pata',dobra:'pata',j:0.06},
  ovelha:{L:0.8,W:0.52,H:0.52,corpo:[[0,0.8,0.82,0],[0.3,1,1,0.01],[0.7,1,0.98,0.02],[1,0.78,0.8,0.03]],pS:[0.22,0.24],pI:[0.22,0.21],pR:[0.042,0.03,0.024],legZ:[0.3,-0.28],legX:0.14,
    pesc:{len:0.18,r0:0.12,r1:0.09,ang:0.75,y:0.08,z:0.34},cab:{len:0.2,w:0.13,h:0.14,foc:0.1,focW:0.06,focH:0.065,ang:0.45},ore:{tipo:'lado',len:0.1,w:0.045},rabo:{tipo:'curto',len:0.12,r0:0.05,ang:-1.0,y:0.06},
    cor:{base:0xe6dcc6,barriga:0xd8ccb4,pata:0x2b2622,focinho:0x2b2622,nariz:0x1a1614,cabeca:0x2b2622},pata:'casco',dobra:'casco',j:0.05,la:true},
  cabra:{L:0.72,W:0.3,H:0.36,corpo:[[0,0.82,0.85,0],[0.35,1,1,0.01],[0.75,0.95,0.98,0.02],[1,0.75,0.82,0.03]],pS:[0.25,0.27],pI:[0.24,0.24],pR:[0.038,0.027,0.019],legZ:[0.27,-0.26],legX:0.1,
    pesc:{len:0.26,r0:0.085,r1:0.065,ang:0.9,y:0.07,z:0.3},cab:{len:0.2,w:0.11,h:0.12,foc:0.11,focW:0.048,focH:0.055,ang:0.5},ore:{tipo:'lado',len:0.11,w:0.04},rabo:{tipo:'curto',len:0.09,r0:0.03,ang:0.9,y:0.07},
    cor:{base:0xddd5c8,barriga:0xc8bfb2,pata:0xb8ae9e,focinho:0xc8bfb2,nariz:0x2a2420,chifre:0x5a5048},pata:'casco',dobra:'casco',j:0.06,chifres:'cabra',barba:true},
  cervo:{L:1.0,W:0.34,H:0.42,corpo:[[0,0.8,0.85,0],[0.3,1,1,0.01],[0.7,0.97,1,0.02],[1,0.78,0.86,0.04]],pS:[0.4,0.42],pI:[0.4,0.4],pR:[0.05,0.034,0.022],legZ:[0.38,-0.36],legX:0.11,
    pesc:{len:0.42,r0:0.12,r1:0.075,ang:1.0,y:0.1,z:0.42},cab:{len:0.26,w:0.13,h:0.13,foc:0.15,focW:0.05,focH:0.055,ang:0.6},ore:{tipo:'lado',len:0.16,w:0.065,cima:0.5},rabo:{tipo:'curto',len:0.13,r0:0.045,ang:-0.6,y:0.08},
    cor:{base:0x8a6440,barriga:0xd8c4a0,pata:0x6a4c30,focinho:0x5a4a3a,nariz:0x141010,claro:0xf0e8dc,chifre:0xd8c9a8},pata:'casco',dobra:'casco',j:0.05,galhada:true,anca:true},
  vaca:{L:1.55,W:0.64,H:0.72,corpo:[[0,0.86,0.92,0],[0.25,1,1,0],[0.7,1,1,0.02],[1,0.82,0.92,0.04]],pS:[0.38,0.4],pI:[0.36,0.36],pR:[0.08,0.06,0.05],legZ:[0.6,-0.58],legX:0.2,
    pesc:{len:0.3,r0:0.22,r1:0.17,ang:0.35,y:0.12,z:0.7},cab:{len:0.36,w:0.24,h:0.26,foc:0.16,focW:0.12,focH:0.12,ang:0.65},ore:{tipo:'lado',len:0.15,w:0.07},rabo:{tipo:'fino',len:0.72,r0:0.025,ang:-1.35,y:0.18,tufo:true},
    cor:{base:0xf0ece4,barriga:0xe8e2d8,pata:0xd8d0c4,focinho:0xd8a8a0,nariz:0xc89088,mancha:0x1c1a18,chifre:0xe0d6c0},pata:'casco',dobra:'casco',j:0.04,chifres:'vaca',ubere:true,manchas:true},
  javali:{L:0.95,W:0.4,H:0.5,corpo:[[0,0.75,0.7,-0.03],[0.3,0.92,0.85,0],[0.6,1,1,0.04],[0.85,1,1.02,0.07],[1,0.85,0.9,0.04]],pS:[0.18,0.2],pI:[0.18,0.17],pR:[0.05,0.035,0.024],legZ:[0.32,-0.32],legX:0.13,
    pesc:{len:0.14,r0:0.19,r1:0.16,ang:0.12,y:0.04,z:0.44},cab:{len:0.3,w:0.17,h:0.2,foc:0.2,focW:0.065,focH:0.065,ang:0.55},ore:{tipo:'ponta',len:0.08,w:0.05},rabo:{tipo:'fino',len:0.22,r0:0.015,ang:-1.2,y:0.06,tufo:true},
    cor:{base:0x3a2e26,barriga:0x4a3a30,pata:0x1e1814,focinho:0x5a4a40,nariz:0x2a2220,presa:0xece4d0},pata:'casco',dobra:'casco',j:0.12,presas:true,crina:true},
  lobo:{L:0.9,W:0.28,H:0.34,corpo:[[0,0.8,0.82,0],[0.35,0.95,0.95,0],[0.75,1,1.03,0.02],[1,0.82,0.92,0.03]],pS:[0.28,0.3],pI:[0.27,0.26],pR:[0.044,0.031,0.022],legZ:[0.34,-0.33],legX:0.09,
    pesc:{len:0.24,r0:0.13,r1:0.1,ang:0.55,y:0.07,z:0.38},cab:{len:0.22,w:0.15,h:0.14,foc:0.16,focW:0.05,focH:0.05,ang:0.2},ore:{tipo:'ponta',len:0.11,w:0.07},rabo:{tipo:'peludo',len:0.48,r0:0.05,r1:0.08,ang:-0.8,y:0.06},
    cor:{base:0x8a8580,barriga:0xd8d2c8,pata:0xb8b2a8,focinho:0xc8c2b8,nariz:0x141010,escuro:0x4a4642},pata:'pata',dobra:'pata',j:0.08,sela:true},
  urso:{L:1.45,W:0.78,H:0.8,corpo:[[0,0.8,0.8,0],[0.25,0.95,0.95,0.02],[0.55,1,1,0.04],[0.78,1,1.08,0.1],[1,0.8,0.86,0.05]],pS:[0.34,0.36],pI:[0.3,0.28],pR:[0.13,0.11,0.1],legZ:[0.5,-0.5],legX:0.24,
    pesc:{len:0.26,r0:0.28,r1:0.22,ang:0.25,y:0.1,z:0.62},cab:{len:0.34,w:0.3,h:0.28,foc:0.16,focW:0.1,focH:0.1,ang:0.35},ore:{tipo:'redonda',len:0.07,w:0.07},rabo:{tipo:'curto',len:0.1,r0:0.06,ang:-0.5,y:0.1},
    cor:{base:0x4a3424,barriga:0x3e2c1e,pata:0x2a1e16,focinho:0x7a5a3e,nariz:0x141010},pata:'garra',dobra:'pata',j:0.14},
  onca:{L:1.15,W:0.36,H:0.4,corpo:[[0,0.82,0.85,0],[0.35,0.95,0.95,0],[0.75,1,1.02,0.02],[1,0.85,0.9,0.03]],pS:[0.24,0.27],pI:[0.24,0.23],pR:[0.065,0.05,0.04],legZ:[0.42,-0.42],legX:0.12,
    pesc:{len:0.2,r0:0.16,r1:0.13,ang:0.3,y:0.05,z:0.52},cab:{len:0.24,w:0.2,h:0.17,foc:0.1,focW:0.075,focH:0.065,ang:0.25},ore:{tipo:'redonda',len:0.05,w:0.06},rabo:{tipo:'fino',len:0.7,r0:0.045,r1:0.035,ang:-0.6,y:0.06},
    cor:{base:0xd89a3a,barriga:0xf2e6d0,pata:0xd8a050,focinho:0xf2e6d0,nariz:0x5a3a30,mancha:0x1a140e},pata:'pata',dobra:'pata',j:0.05,rosetas:true}};
/* variantes de cor/sexo (mesmo corpo da espécie): cerva sem galhada, cabra e vaca marrons */
const FAUNA_VAR={cervoF:{galhada:false},cabraB:{cor:{base:0x6a4a32,barriga:0x5a3e2a,pata:0x2a2018,focinho:0x4a3424}},vacaB:{cor:{base:0x7a4a2a,barriga:0x6a3e24,mancha:0xf0ece4,pata:0x4a2e1c}}};
function faunaOssos(F){const Hc=F.H*0.28+F.pS[0]+F.pI[0],yF=-F.H*0.28,yB=-(Hc-F.pS[1]-F.pI[1]),pc=F.pesc;
  return[{p:-1,o:[0,Hc,0]},{p:0,o:[0,pc.y,pc.z]},{p:1,o:[0,pc.len*Math.sin(pc.ang),pc.len*Math.cos(pc.ang)]},
    {p:0,o:[F.legX,yF,F.legZ[0]]},{p:3,o:[0,-F.pS[0],0]},{p:0,o:[-F.legX,yF,F.legZ[0]]},{p:5,o:[0,-F.pS[0],0]},
    {p:0,o:[F.legX,yB,F.legZ[1]]},{p:7,o:[0,-F.pS[1],0]},{p:0,o:[-F.legX,yB,F.legZ[1]]},{p:9,o:[0,-F.pS[1],0]},
    {p:0,o:[0,F.rabo.y||0.04,-F.L*0.47]}];}
/* perfil do corpo no ponto t (0 = anca, 1 = peito): largura, altura e deslocamento vertical */
function corpoPerfil(F,t){const c=F.corpo;if(t<=c[0][0])return c[0];for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1];if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]);return[t,lerp(a[1],b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u)];}}return c[c.length-1];}
/* ponto na pele do corpo (ang: 0 = barriga, π = lombo) com a normal: para pintar manchas, lã, crina */
function corpoPonto(F,t,ang,fora){const p=corpoPerfil(F,t),rx=F.W/2*p[1],ry=F.H/2*p[2],x=Math.sin(ang)*rx,y=p[3]-Math.cos(ang)*ry,z=(t-0.5)*F.L;
  let nx=Math.sin(ang)/rx,ny=-Math.cos(ang)/ry;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const k=fora||0;return[x+nx*k,y+ny*k,z,nx,ny,0];}
function bichoMalha(tipo,vid){const F0=FAUNA_FORMA[tipo],V=vid&&FAUNA_VAR[tipo+vid]||{},F=Object.assign({},F0,V,{cor:Object.assign({},F0.cor,V.cor||{})}),C=F.cor;
  const g=new GB(8192,8),R=rng(tipo.length*977+(vid?vid.charCodeAt(0):0)*31+7),put=(b,t,m,col,j)=>add(g,t,m,lin(col),{b,j:j??F.j,rnd:R});
  const ROT=mat(0,0,0,Math.PI/2,0,0);
  // corpo: revolução ao longo do comprimento (lombo na cor da espécie, barriga clara)
  const N=14,prof=[];for(let i=0;i<=N;i++){const t=-0.04+1.08*i/N,tt=clamp(t,0,1),p=corpoPerfil(F,tt),ponta=t<0||t>1?0.35:1;prof.push([1,(t-0.5)*F.L,-p[3],F.W/2*p[1]*ponta,F.H/2*p[2]*ponta]);}
  prof[0][3]=prof[0][4]=0.0001;prof[N][3]=prof[N][4]=0.0001;
  const corpoTris=(a0,a1)=>latheTris(prof.map(q=>q.slice()),14,1,1,{a0,a1});
  put(0,corpoTris(-1.05,1.05),ROT,C.barriga);put(0,corpoTris(1.05,2*Math.PI-1.05),ROT,C.base);
  // pescoço
  const pc=F.pesc,neckRot=Math.PI/2-pc.ang;put(1,latheTris([[pc.r0*1.08,-pc.r0*0.6],[pc.r0,0],[lerp(pc.r0,pc.r1,0.5),pc.len*0.5],[pc.r1,pc.len],[pc.r1*0.8,pc.len+pc.r1*0.4]],10,1,1),mat(0,0,0,neckRot,0,0),C.base);
  if(F.la||tipo==='ovelha')put(1,latheTris([[pc.r0*1.2,-pc.r0*0.4],[pc.r0*1.15,pc.len*0.5],[pc.r1*1.1,pc.len*0.85]],10,1,1),mat(0,0,0,neckRot,0,0),C.base,0.08);
  // cabeça (osso 2): crânio, focinho, olhos, nariz, orelhas
  const cb=F.cab,HM=mat(0,0,0,cb.ang,0,0),hm=m=>mm(HM,m),corCab=C.cabeca||C.base;
  put(2,ellipTris(cb.w/2,cb.h/2,cb.len/2,12,8),hm(mat(0,0,cb.len*0.18)),corCab);
  put(2,latheTris([[cb.focW*1.25,0,0,1,cb.focH/cb.focW],[cb.focW*1.05,cb.foc*0.55,0,1,cb.focH/cb.focW],[cb.focW*0.82,cb.foc,0,1,cb.focH/cb.focW],[0.0001,cb.foc+cb.focW*0.35]],10,1,1),hm(mat(0,-cb.h*0.12,cb.len*0.3,Math.PI/2,0,0)),C.focinho||corCab);
  put(2,ellipTris(cb.focW*0.55,cb.focH*0.45,cb.focW*0.3,8,5),hm(mat(0,-cb.h*0.1,cb.len*0.3+cb.foc+cb.focW*0.12)),C.nariz,0.02);
  for(const s of[1,-1]){put(2,ellipTris(cb.w*0.09,cb.w*0.09,cb.w*0.07,7,5),hm(mat(s*cb.w*0.42,cb.h*0.12,cb.len*0.38)),0x0c0a08,0);
    const o=F.ore;
    if(o.tipo==='longa')put(2,ellipTris(o.w,o.len/2,o.w*0.45,8,6),hm(mat(s*cb.w*0.22,cb.h*0.4+o.len*0.45,cb.len*0.05,-0.25,0,-s*0.12)),C.base);
    else if(o.tipo==='ponta'){put(2,cylTris(0,o.w/2,o.len,6),hm(mat(s*cb.w*0.3,cb.h*0.32,cb.len*0.05,-0.15,0,-s*0.18,1,1,0.45)),C.base);if(tipo==='raposa')put(2,cylTris(0,o.w*0.36,o.len*0.7,5),hm(mat(s*cb.w*0.3,cb.h*0.33,cb.len*0.05+0.008,-0.15,0,-s*0.18,1,1,0.3)),0x1a1410);}
    else if(o.tipo==='redonda')put(2,ellipTris(o.w,o.len,o.w*0.45,8,6),hm(mat(s*cb.w*0.36,cb.h*0.42,cb.len*0.02)),C.base);
    else put(2,ellipTris(o.len/2,o.w*0.45,o.w,8,6),hm(mat(s*(cb.w*0.5+o.len*0.38),cb.h*0.28+(o.cima||0)*o.len*0.3,cb.len*0.02,0,0,s*(0.25+(o.cima||0)))),corCab);}
  // pernas (3..10): coxa/braço e canela; casco, pata ou garra
  for(let k=0;k<4;k++){const tr=k>=2,up=3+k*2,lo=up+1,Sx=F.pS[tr?1:0],Ix=F.pI[tr?1:0],[r0,r1,r2]=F.pR;
    put(up,cylTris(r0,r1,Sx,8),mat(0,-Sx,0),C.base);put(up,ellipTris(r0*1.45,Sx*0.45,r0*(tr?1.9:1.5),8,6),mat(0,-Sx*0.22,tr?-r0*0.3:r0*0.2),C.base);
    put(lo,cylTris(r1*0.95,r2,Ix,8),mat(0,-Ix,0),C.pata);
    if(F.pata==='casco')put(lo,cylTris(r2*1.05,r2*1.25,r2*1.6,7),mat(0,-Ix,r2*0.15),0x1a1612,0.02);
    else if(F.pata==='garra'){put(lo,ellipTris(r2*1.3,r2*0.55,r2*1.7,8,5),mat(0,-Ix+r2*0.3,r2*0.6),C.pata);for(let c=-1;c<=1;c++)put(lo,cylTris(0,r2*0.18,r2*0.6,4),mat(c*r2*0.5,-Ix+r2*0.12,r2*2.2,1.45,0,0),0xd8d0c0,0.02);}
    else put(lo,ellipTris(r2*1.25,r2*0.6,r2*1.6,8,5),mat(0,-Ix+r2*0.35,r2*0.55),C.pata);}
  // rabo (osso 11)
  const rb=F.rabo,rbM=mat(0,0,0,-Math.PI/2+(rb.ang||0),0,0);
  if(rb.tipo==='bola')put(11,icoSubTris(rb.r0,0.25,R,1),mat(0,0,0),C.claro||0xf2eee6,0.03);
  else if(rb.tipo==='peludo'){put(11,latheTris([[rb.r0,0],[rb.r1,rb.len*0.45],[rb.r1*0.95,rb.len*0.75],[rb.r0*0.6,rb.len*0.97],[0.0001,rb.len]],10,1,1),rbM,C.base,0.1);
    put(11,latheTris([[rb.r0*0.7,rb.len*0.8],[rb.r0*0.4,rb.len*1.0],[0.0001,rb.len*1.04]],8,1,1),rbM,tipo==='raposa'?0xf4f0e8:C.escuro||C.base);}
  else if(rb.tipo==='fino'){put(11,latheTris([[rb.r0,0],[rb.r1||rb.r0*0.8,rb.len*0.7],[(rb.r1||rb.r0)*0.7,rb.len]],7,1,1),rbM,C.base);
    if(rb.tufo)put(11,ellipTris(rb.r0*2.2,rb.len*0.1,rb.r0*2.2,7,5),mm(rbM,mat(0,rb.len,0)),C.escuro||0x1c1a18,0.1);
    if(tipo==='onca')put(11,latheTris([[(rb.r1||rb.r0)*0.75,rb.len*0.85],[(rb.r1||rb.r0)*0.72,rb.len*1.0],[0.0001,rb.len*1.04]],7,1,1),rbM,C.mancha);}
  else put(11,latheTris([[rb.r0,0],[rb.r0*0.9,rb.len*0.6],[0.0001,rb.len]],8,1,1),rbM,C.claro||C.base);
  bichoExtras(tipo,F,C,put,R,hm);
  return{mesh:litMesh(g.data()),bones:faunaOssos(F)};}
/* detalhes que fazem cada espécie ser ela mesma */
function bichoExtras(tipo,F,C,put,R,hm){const cb=F.cab;
  if(F.galhada!==false&&F.galhada){for(const s of[1,-1]){const b0=hm(mat(s*cb.w*0.22,cb.h*0.42,cb.len*0.02));
      const seg=(m,r,l,rx,rz)=>{put(2,cylTris(r*0.7,r,l,5),mm(m,mat(0,0,0,rx,0,rz)),C.chifre,0.03);return mm(m,mm(mat(0,0,0,rx,0,rz),mat(0,l,0)));};
      let m=seg(b0,0.018,0.16,-0.3,-s*0.35);const t1=seg(m,0.012,0.12,0.6,-s*0.1);m=seg(m,0.016,0.18,-0.45,-s*0.15);seg(m,0.01,0.11,0.7,s*0.2);m=seg(m,0.012,0.14,-0.2,-s*0.2);seg(m,0.008,0.09,0.5,s*0.3);}}
  if(F.chifres==='cabra')for(const s of[1,-1]){let m=hm(mat(s*cb.w*0.2,cb.h*0.45,cb.len*0.08));for(let i=0;i<4;i++){const r=0.02-i*0.004,l=0.07;put(2,cylTris(r*0.8,r,l,6),mm(m,mat(0,0,0,-0.65-i*0.1,0,-s*0.12)),C.chifre,0.04);m=mm(m,mm(mat(0,0,0,-0.65-i*0.1,0,-s*0.12),mat(0,l,0)));}}
  if(F.chifres==='vaca')for(const s of[1,-1])put(2,cylTris(0.008,0.026,0.15,6),hm(mat(s*cb.w*0.42,cb.h*0.38,cb.len*0.02,0,0,-s*1.05)),C.chifre,0.03);
  if(F.barba)put(2,cylTris(0.02,0.0001,0.09,6),hm(mat(0,-cb.h*0.42,cb.len*0.42,Math.PI,0,0)),0xd8d0c4,0.08);
  if(F.presas)for(const s of[1,-1])put(2,cylTris(0.0001,0.012,0.08,5),hm(mat(s*cb.focW*0.9,-cb.h*0.2,cb.len*0.3+cb.foc*0.6,-0.6,0,-s*0.5)),C.presa,0.02);
  if(F.ubere){put(0,ellipTris(0.14,0.09,0.13,10,6),mat(0,-F.H*0.45,-F.L*0.25),0xe0aaa0,0.03);for(const s of[1,-1])for(const t of[1,-1])put(0,cylTris(0.012,0.016,0.06,5),mat(s*0.05,-F.H*0.45-0.13,-F.L*0.25+t*0.05),0xd09088,0.02);}
  if(F.manchas){for(let i=0;i<9;i++){const t=0.08+R()*0.84,a=(R()<0.5?1:-1)*(1.2+R()*1.6),p=corpoPonto(F,t,a,0.006);put(0,ellipTris(0.11+R()*0.09,0.012,0.09+R()*0.08,9,4),alignY(p[0],p[1],p[2],p[3],p[4],p[5]),C.mancha,0.04);}
    put(2,ellipTris(cb.w*0.3,0.01,cb.len*0.3,8,4),hm(mat(cb.w*0.3,cb.h*0.3,cb.len*0.1,0,0,-0.6)),C.mancha,0.04);}
  if(F.rosetas){for(let i=0;i<70;i++){const t=R(),a=(R()<0.5?1:-1)*(0.7+R()*2.3),p=corpoPonto(F,t,a,0.004),rr=0.018+R()*0.022;
      if(R()<0.55){for(let k=0;k<5;k++){const aa=k/5*6.283,ox=Math.cos(aa)*rr*1.3,oz=Math.sin(aa)*rr*1.3;const m=mm(alignY(p[0],p[1],p[2],p[3],p[4],p[5]),mat(ox,0,oz));put(0,ellipTris(rr*0.45,0.006,rr*0.45,6,3),m,C.mancha,0.03);}}
      else put(0,ellipTris(rr,0.006,rr*1.2,7,3),alignY(p[0],p[1],p[2],p[3],p[4],p[5]),C.mancha,0.03);}
    for(let k=0;k<4;k++)for(let i=0;i<6;i++){const up=3+k*2,Sx=F.pS[k>=2?1:0];put(up,ellipTris(0.012,0.006,0.012,6,3),mat((R()-0.5)*0.08,-Sx*(0.2+R()*0.7),F.pR[0]*0.95,Math.PI/2,0,0),C.mancha,0.03);}
    for(let i=0;i<10;i++)put(2,ellipTris(0.008,0.004,0.008,6,3),hm(mat((R()-0.5)*cb.w*0.7,cb.h*0.42,cb.len*(R()*0.4))),C.mancha,0.03);}
  if(F.sela){const p=corpoPonto(F,0.55,Math.PI,0.01);put(0,ellipTris(F.W*0.42,0.05,F.L*0.32,10,6),mat(p[0],p[1]-0.03,p[2]),C.escuro,0.1);}
  if(F.anca){const p=corpoPonto(F,0.02,Math.PI*0.75,0.005);put(0,ellipTris(F.W*0.32,F.H*0.3,0.04,9,6),mat(0,p[1]-F.H*0.12,-F.L*0.48),C.claro,0.03);}
  if(F.crina)for(let i=0;i<14;i++){const t=0.35+i*0.045,p=corpoPonto(F,Math.min(1,t),Math.PI,0);put(0,boxTris(0.03,0.07+R()*0.04,0.03,{tx:0.2,tz:0.4}),mat(p[0],p[1]+0.02,p[2],-0.3,0,0),0x1a1410,0.1);}
  if(F.la){for(let i=0;i<46;i++){const t=0.03+R()*0.94,a=(R()<0.5?1:-1)*(0.5+R()*2.6),p=corpoPonto(F,t,a,0.005);put(0,icoSubTris(0.075+R()*0.05,0.3,R,1),mat(p[0],p[1],p[2]),C.base,0.07);}}
  if(tipo==='raposa'){put(1,ellipTris(0.06,0.09,0.05,8,6),mat(0,0.0,0.06,0.5,0,0),C.barriga);}
  if(tipo==='urso'){const p=corpoPonto(F,0.78,Math.PI,0);put(0,ellipTris(F.W*0.35,0.12,0.22,10,6),mat(0,p[1]-0.06,p[2]),C.base,0.15);}
  if(tipo==='coelho')for(const s of[1,-1])put(7+(s<0?2:0),ellipTris(0.045,0.06,0.075,8,6),mat(0,-0.03,-0.02),C.base);}
function faunaMalhas(){for(const tp of FAUNA_TIPOS){try{ZMESH['bicho_'+tp]=bichoMalha(tp);}catch(e){console.error('malha '+tp,e);}}
  for(const k in FAUNA_VAR){const tp=FAUNA_TIPOS.find(t=>k.startsWith(t)),v=k.slice(tp.length);try{ZMESH['bicho_'+tp+v]=bichoMalha(tp,v);}catch(e){console.error('malha '+k,e);}}
  try{MESH.laco=laco3D();}catch(e){console.error('laço',e);}}
function laco3D(){const g=new GB(512,8),R=rng(55),m=lin(0x5a4430),c=lin(0xb9a77a);
  add(g,cylTris(0.012,0.015,0.38,5),mat(0,0,0,0.12,0,0),m,{j:0.1,rnd:R});add(g,cylTris(0.004,0.004,0.3,4),mat(0,0.34,0,0,0,1.2),c);
  for(let i=0;i<10;i++){const a=i/10*6.283,b=(i+1)/10*6.283;add(g,cylTris(0.004,0.004,0.06,3),alignY(Math.cos(a)*0.09-0.25,0.05,Math.sin(a)*0.09,Math.cos(b)-Math.cos(a),0,Math.sin(b)-Math.sin(a)),c);}
  return litMesh(g.data());}
DESENHO.opaco.push(Pg=>{if(!MESH.laco)return;for(const t of TRAPS)if(d2(t.x,t.z,cam.pos[0],cam.pos[2])<60*60)drawStat(Pg,MESH.laco,mat(t.x,ground(t.x,t.z),t.z,0,t.yaw,0));});

/* ---------- poses: andar, trotar, galopar, pular, comer, alerta, deitar, defender, atacar, morrer ---------- */
const MARCHA={passo:[0.25,0.75,0,0.5],trote:[0,0.5,0.5,0],galope:[0,0.12,0.55,0.66],salto:[0,0.06,0.5,0.56]};
function faunaPose(b,S,dt){const F=FAUNA_FORMA[b.tipo],ch=b.ch,o=ch.r,v=b.v,t=G.t+b.id*1.7;o.fill(0);ch.hipY=0;ch.pitch=0;ch.roll=0;
  const leg=F.pS[0]+F.pI[0],coelho=b.tipo==='coelho';let marcha='passo',A=0.35,B=0.6,passoL=leg*1.9;
  if(coelho&&v>0.3){marcha='salto';A=0.85;B=1.0;passoL=leg*4;}else if(v>(S.trota+S.corre)/2){marcha='galope';A=0.75;B=1.1;passoL=leg*4.2;}else if(v>(S.anda+S.trota)/2){marcha='trote';A=0.5;B=0.85;passoL=leg*2.8;}
  b.amp=approach(b.amp,v>0.12?1:0,dt*4);b.ph+=dt*v/Math.max(0.1,passoL*b.ch.s)*6.283;
  const off=MARCHA[marcha],amp=b.amp;
  if(amp>0.01)for(let k=0;k<4;k++){const a=b.ph+off[k]*6.283,s=Math.sin(a),c=Math.cos(a),up=3+k*2;o[up*3]=s*A*amp*(k<2?0.9:1);o[(up+1)*3]=Math.max(0,-c)*B*amp*(k<2?1:0.9);}
  if(marcha==='galope'||marcha==='salto'){ch.pitch=Math.sin(b.ph)*0.07*amp;ch.hipY=Math.max(0,Math.sin(b.ph))*leg*0.12*amp;}else ch.hipY=-Math.abs(Math.sin(b.ph))*leg*0.03*amp;
  let pesc=Math.sin(b.ph*2)*0.05*amp,cab=0,rabo=Math.sin(t*2.2)*0.12;
  const st=b.st;
  if(st==='come'&&v<0.2){pesc=b.tipo==='javali'?0.65:F.pesc.ang*0.85+0.62;cab=0.3+Math.sin(t*5)*0.08;ch.hipY-=leg*0.03;
    if(b.tipo==='urso'||b.tipo==='lobo'||b.tipo==='onca'||b.tipo==='raposa'){pesc=0.7;cab=0.3+Math.sin(t*3)*0.15;}}
  else if(st==='alerta'){pesc=-0.32;cab=-0.1;rabo=b.tipo==='cervo'||b.tipo==='coelho'?1.0:0.3;}
  else if(st==='repouso'&&v<0.2){poseDeitado(b,F,o,t);return;}
  else if(st==='defende'){
    if(b.tipo==='urso'){poseEmPe(b,F,o,t);return;}
    if(b.tipo==='javali'){pesc=0.5;cab=0.15;ch.pitch=0.06;o[3*3]=-0.35+Math.sin(t*9)*0.45;o[4*3]=Math.max(0,Math.sin(t*9))*0.8;ch.hipY-=0.03;}
    else{pesc=0.32;cab=-0.25;ch.pitch=0.07;ch.hipY-=leg*0.07;rabo=-0.7;for(const k of[0,1]){o[(3+k*2)*3]=-0.12;o[(4+k*2)*3]=0.22;}for(const k of[2,3]){o[(3+k*2)*3]=-0.25;o[(4+k*2)*3]=0.45;}}}
  else if(st==='ataca'){const prep=b.tipo==='urso'?0.5:0.35,k=clamp(b.atqT/prep,0,1),f=Math.sin(Math.min(1,b.atqT/(prep+0.25))*Math.PI);
    if(b.tipo==='urso'){poseEmPe(b,F,o,t,0.55*f);o[5*3]=-1.6+k*2.0;o[6*3]=0.4;ch.roll=Math.sin(k*Math.PI)*0.15;return;}
    if(b.tipo==='onca'){ch.hipY+=f*leg*0.45;ch.pitch=-0.15*f;o[3*3]=o[5*3]=-1.1*f;o[7*3]=o[9*3]=0.7*f;pesc=-0.2+0.4*k;cab=0.2;}
    else{pesc=-0.25+0.6*k;cab=0.25*k;ch.pitch=0.12*f;o[3*3]=o[5*3]=-0.5*f;}}
  else if(st==='recupera'&&v<1.5){pesc=0.25;cab=Math.sin(t*9)*0.05;}
  else if(st==='persegue'&&b.furtivo){ch.hipY-=leg*0.22;pesc=0.15;cab=-0.2;rabo=-0.2+Math.sin(t*3)*0.25;for(let k=0;k<4;k++)o[(4+k*2)*3]+=0.35;}
  if(coelho&&v<0.3){for(const k of[2,3]){o[(3+k*2)*3]=-0.9;o[(4+k*2)*3]=1.6;}ch.hipY-=0.05;ch.pitch=-0.1;}
  // ladeira: o corpo acompanha o chão
  const fx=Math.sin(b.yaw)*F.L*0.4*ch.s,fz=Math.cos(b.yaw)*F.L*0.4*ch.s;ch.pitch+=clamp(-Math.atan2(chaoBicho(b.x+fx,b.z+fz)-chaoBicho(b.x-fx,b.z-fz),F.L*0.8*ch.s),-0.5,0.5);
  S3(o,1,pesc,0,0);S3(o,2,cab,0,0);o[11*3]+=rabo;o[11*3+1]=Math.sin(t*1.7)*0.2;
  ch.x=b.x;ch.z=b.z;ch.y=b.y;ch.yaw=b.yaw;}
function poseDeitado(b,F,o,t){const ch=b.ch,leg=F.pS[0]+F.pI[0];ch.hipY=-leg*0.82;
  if(F.dobra==='casco'){o[3*3]=o[5*3]=0.6;o[4*3]=o[6*3]=-2.6;o[7*3]=o[9*3]=-1.2;o[8*3]=o[10*3]=2.5;}
  else if(F.dobra==='coelho'){ch.hipY=-leg*0.45;o[3*3]=o[5*3]=-0.3;o[7*3]=o[9*3]=-1.1;o[8*3]=o[10*3]=2.2;}
  else{o[3*3]=o[5*3]=-1.35;o[4*3]=o[6*3]=-0.15;o[7*3]=o[9*3]=-1.2;o[8*3]=o[10*3]=2.4;}
  S3(o,1,0.3+Math.sin(t*0.6)*0.05,Math.sin(t*0.3)*0.15,0);S3(o,2,0.2,0,0);o[11*3]=-0.3;ch.x=b.x;ch.z=b.z;ch.y=b.y;ch.yaw=b.yaw;}
/* urso em pé nas patas de trás (o quadril gira em torno dos pés de trás) */
function poseEmPe(b,F,o,t,k){k=k??1;const ch=b.ch,a=-1.15*k,Hc=F.H*0.28+F.pS[0]+F.pI[0],jy=-(Hc-F.pS[1]-F.pI[1]),jz=F.legZ[1];
  const yj=jy*Math.cos(a)-jz*Math.sin(a),raiz=F.pS[1]+F.pI[1]-yj;ch.pitch=0;o[0]=a;ch.hipY=raiz-Hc;
  o[7*3]=o[9*3]=-a;o[3*3]=o[5*3]=-0.9*k+Math.sin(t*3)*0.2;o[4*3]=o[6*3]=0.6*k;S3(o,1,-0.15,0,0);S3(o,2,0.35*k,0,0);o[11*3]=-0.4;ch.x=b.x;ch.z=b.z;ch.y=b.y;ch.yaw=b.yaw;}
function poseMorto(b,dt){const F=FAUNA_FORMA[b.tipo],ch=b.ch,o=ch.r,Hc=F.H*0.28+F.pS[0]+F.pI[0];o.fill(0);
  const alvo=(b.lado||1)*1.45;b.rolo=lerp(b.rolo||0,alvo,Math.min(1,dt*5));ch.roll=0;ch.pitch=0;o[2]=b.rolo;const k=Math.abs(b.rolo)/1.45;
  ch.hipY=lerp(0,F.W*0.42-Hc,k);o[3*3]=-0.35;o[5*3]=-0.15;o[7*3]=0.35;o[9*3]=0.15;o[4*3]=o[6*3]=o[8*3]=o[10*3]=0.12;S3(o,1,-0.25,0,0);S3(o,2,0.1,0,0);o[11*3]=-0.3;}

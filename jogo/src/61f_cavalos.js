/* ================= Etapa 14: fauna e domesticação · cavalos =================
   Cavalos selvagens andam em bando nos Pastos da Fazenda, nos Campos do Leste e no campo da beira do lago, em cinco pelagens
   (castanho, tordilho, preto, alazão e pampa). Fogem de quem chega de pé ou correndo.
   Domar: chegue agachado e devagar com comida de cavalo na mochila (feno, cenoura, maçã, milho, abóbora ou frutas) e segure E
   para oferecer na mão. Cada comida sobe a confiança (maçã e cenoura sobem mais); com confiança, ele até vem até você.
   Com a confiança cheia, segure E com um cabresto na mochila: o cavalo é seu e ganha um nome.
   Cavalo domado: toque E perto dele monta; segure E abre o painel: dar comida, escovar, tratar ferida (bandagem), pôr ou
   tirar sela e alforjes, ferrar, abrir os alforjes, seguir você ou esperar (amarrado, se tiver um poste perto) e soltar.
   Montado: W/A/S/D levam o cavalo para onde a câmera olha; Shift galopa (só com sela; gasta o fôlego dele); C anda a passo;
   E desce. A galope ele derruba zumbi no caminho e faz barulho. Água funda, ladeira forte, casa e beira do mapa barram.
   Zumbi que bate em você montado acerta o cavalo também; ferido demais, ele se assusta e te derruba.
   Cuidados: a fome sobe com o esforço (parado na grama ele pasta sozinho; perto de um cocho com comida, come do cocho);
   o fôlego volta andando a passo ou parado; vida volta devagar com ele alimentado (escovado, mais rápido); sem ferradura,
   o asfalto gasta os cascos e ele manca (não galopa). Passando fome demais, adoece e morre.
   Alforjes: 10 espaços de carga (o cavalo leva, você abre pelo painel). O carro continua mais rápido e leva mais; o cavalo
   não gasta gasolina e passa pela mata.
   Assobio (tecla X; no controle, segure LB): chama os seus cavalos (o alcance cresce com o vínculo) e o gavião.
   Construções novas (B → Animais): poste de amarrar e cocho. Receitas novas (Fabricar → Animais): feno, cabresto, escova,
   sela, alforjes e ferraduras; liberam quando você vê o primeiro cavalo selvagem. */

/* ---------- espécie: o cavalo entra na fauna (população, rastros, diário, carcaça) ---------- */
FAUNA.cavalo={nome:'Cavalo',pl:'cavalos',porte:'grande',hp:190,anda:1.5,trota:3.8,corre:10.5,ve:30,fov:-0.65,ouve:1.4,ia:'rebanho',grupo:[2,4],r:0.62,alt:1.62,hr:0.62,
  esc:[0.95,1.05],dif:'Média (dá para domar)',xp:12,esfola:3.4,pop:0.03,rastroM:2.6};
FAUNA_TIPOS.push('cavalo');
FAUNA_RENDE.cavalo={couroGrande:3,carneCrua:5,ossos:2,tendao:2};
{const zf=id=>ZONAS_FAUNA.find(q=>q.id===id);zf('pastos').f.cavalo=3;zf('leste').f.cavalo=4;zf('lago').f.cavalo=2;}
FAUNA_FORMA.cavalo={L:1.5,W:0.5,H:0.62,corpo:[[0,0.86,0.9,0.02],[0.18,1,1,0.02],[0.5,0.95,0.96,0],[0.8,1,1.02,0.02],[1,0.82,0.94,0.06]],
  pS:[0.46,0.5],pI:[0.5,0.48],pR:[0.075,0.048,0.04],legZ:[0.56,-0.52],legX:0.15,
  pesc:{len:0.72,r0:0.12,r1:0.08,ang:0.95,y:0.16,z:0.64},cab:{len:0.48,w:0.19,h:0.23,foc:0.27,focW:0.085,focH:0.1,ang:0.95},
  ore:{tipo:'ponta',len:0.0005,w:0.0005},rabo:{tipo:'fino',len:0.16,r0:0.05,r1:0.04,ang:-0.9,y:0.18},
  cor:{base:0x6b3f22,barriga:0x77462a,pata:0x231812,focinho:0x3b2a20,nariz:0x141010,crina:0x15100c,claro:0xece6da},pata:'casco',dobra:'casco',j:0.04,cavalo:true};
Object.assign(FAUNA_VAR,{
  cavaloT:{cor:{base:0x9e9c96,barriga:0xb4b2ac,pata:0x5c5a56,focinho:0x48464a,crina:0xd2cec6}},
  cavaloP:{cor:{base:0x1c1917,barriga:0x221e1b,pata:0x141110,focinho:0x262220,crina:0x0d0b0a},estrela:'pequena'},
  cavaloA:{cor:{base:0x9b5426,barriga:0xa45e2e,pata:0x8a4a22,focinho:0x6e3c22,crina:0xa8622e},estrela:'listra',meias:true},
  cavaloM:{cor:{mancha:0xf2eee6},manchas:true,estrela:'listra',meias:true}});
const CAV_PELO={'':'castanho',T:'tordilho',P:'preto',A:'alazão',M:'pampa'};
/* cavalo prefere campo aberto */
{const _fpo=faunaPontoOk;faunaPontoOk=function(x,z,sp,rigor){if(!_fpo.apply(this,arguments))return false;if(sp==='cavalo'&&rigor&&densidadeMata(x,z)>2)return false;return true;};}
/* pelagem sorteada (castanho é a mais comum) */
{const _cb=criarBicho;criarBicho=function(tipo,x,z,o){if(tipo==='cavalo'){o=Object.assign({},o||{});if(!o.varFixa){const r=Math.random();o.var=r<0.38?'':r<0.56?'T':r<0.72?'P':r<0.88?'A':'M';}}
  return _cb.call(this,tipo,x,z,o);};}

/* ---------- o corpo do cavalo: pescoço alto, crina, topete, orelhas em pé, cauda de crina, estrela e meias brancas ---------- */
{const _bx=bichoExtras;bichoExtras=function(tipo,F,C,put,R,hm){_bx.apply(this,arguments);if(tipo!=='cavalo')return;
  const pc=F.pesc,cb=F.cab,NR=mat(0,0,0,Math.PI/2-pc.ang,0,0),nm=m=>mm(NR,m),L=pc.len;
  // pescoço fundo e estreito (seção oval), mais grosso na base
  const anel=(y,kx,kz,zo)=>[1,y,zo,kx,kz];
  put(1,latheTris([anel(-0.16,0.15,0.3,0.05),anel(0,0.14,0.27,0.03),anel(L*0.35,0.12,0.2,0.0),anel(L*0.7,0.1,0.15,-0.01),anel(L,0.085,0.12,-0.01),anel(L+0.08,0.05,0.07,-0.01),[0.0001,L+0.1]],12,1,1),NR,C.base);
  // crina: lâminas pela nuca até a cernelha, caídas para um lado
  const kzAt=t=>t<0.35?lerp(0.27,0.2,t/0.35):t<0.7?lerp(0.2,0.15,(t-0.35)/0.35):lerp(0.15,0.12,(t-0.7)/0.3);
  for(let i=0;i<13;i++){const t=i/12,y=-0.06+t*(L+0.04),r=kzAt(clamp(y/L,0,1))+0.025,h=0.1*(1-0.35*t)+R()*0.02;
    put(1,boxTris(0.045,0.1,h,{tx:0.6}),nm(mat(0.025,y,-(r+h*0.4),0.2,0,0.35)),C.crina,0.08);}
  // topete entre as orelhas
  put(2,boxTris(0.07,0.035,0.13,{tx:0.6}),hm(mat(0.01,cb.h*0.47,cb.len*0.12,-0.25,0,0.2)),C.crina,0.08);
  // orelhas em pé (compensa a cabeça inclinada)
  for(const s of[1,-1]){put(2,cylTris(0,0.035,0.13,6),hm(mat(s*cb.w*0.27,cb.h*0.4,-cb.len*0.02,-cb.ang+0.3,0,-s*0.18,1,1,0.55)),C.base);
    put(2,cylTris(0,0.02,0.1,5),hm(mat(s*cb.w*0.27,cb.h*0.41,-cb.len*0.02+0.012,-cb.ang+0.3,0,-s*0.18,1,1,0.3)),0x1a1410);}
  // ganacha (bochecha larga) e queixo
  for(const s of[1,-1])put(2,ellipTris(0.035,0.075,0.08,8,6),hm(mat(s*cb.w*0.36,-cb.h*0.08,-cb.len*0.08)),C.base);
  // cauda: crina comprida caindo
  const rbM=mat(0,0,0,-Math.PI/2-1.25,0,0);
  put(11,latheTris([[0.045,0],[0.075,0.16],[0.085,0.38],[0.06,0.6],[0.02,0.74],[0.0001,0.78]],9,1,0.75),mm(mat(0,0,0,-0.35,0,0),rbM),C.crina,0.1);
  // estrela/listra branca na testa
  if(F.estrela){const lg=F.estrela==='listra';put(2,ellipTris(lg?0.03:0.04,0.012,lg?cb.len*0.42:0.05,8,4),hm(mat(0,cb.h*0.47,cb.len*(lg?0.22:0.3))),C.claro,0.02);
    if(lg)put(2,ellipTris(0.025,0.01,cb.foc*0.45,8,4),hm(mat(0,-cb.h*0.12+cb.focH*0.92,cb.len*0.3+cb.foc*0.5)),C.claro,0.02);}
  // meias brancas nas canelas
  if(F.meias){const[r0,r1,r2]=F.pR;for(let k=0;k<4;k++){if(k===1&&R()<0.5)continue;const tr=k>=2,lo=4+k*2,Ix=F.pI[tr?1:0],h=Ix*(0.32+R()*0.2),rt=lerp(r2,r1*0.95,h/Ix);
    put(lo,cylTris(rt*1.07,r2*1.08,h,8),mat(0,-Ix,0),C.claro,0.02);}}};}

/* ---------- voz: bufa, relincha, guincha de dor ---------- */
{const _sb=SONS.bicho;SONS.bicho=function(A){const[tp,ev]=(A.extra||'').split(':');if(tp!=='cavalo')return _sb.apply(this,arguments);const{noise,voz,r}=A;
  if(ev==='idle'){noise(0.32,'bandpass',520*r(),300,0.9,0.32);noise(0.18,'lowpass',380,200,0.7,0.2,0.3);}
  else if(ev==='dor'){voz(0.35,1400*r(),900,1500,2900,0.24,0,0.2);}
  else if(ev==='morte'){voz(0.9,1100*r(),380,1200,2400,0.26,0,0.25);}
  else{voz(0.22,950*r(),1250,1100,2400,0.2,0,0.12);voz(0.6,1220*r(),640,1000,2200,0.24,0.2,0.16);voz(0.34,620*r(),420,800,1800,0.16,0.76,0.22);noise(0.25,'bandpass',480,300,0.9,0.22,1.05);}};}
SONS.casco=({noise,tone,extra})=>{const s=extra||'grama';
  if(s==='asf'){noise(0.035,'bandpass',2600,1800,4,0.3);tone(0.03,'triangle',900,700,0.06);}
  else if(s==='agua')noise(0.12,'bandpass',900,600,0.8,0.28);
  else{noise(0.06,'lowpass',420,180,0.8,0.42);tone(0.05,'sine',110,70,0.16);}};
SONS.relincho=({voz,noise,r})=>{voz(0.22,980*r(),1280,1100,2400,0.22,0,0.12);voz(0.7,1240*r(),620,1000,2200,0.26,0.2,0.18);voz(0.4,600*r(),400,800,1800,0.18,0.86,0.22);noise(0.3,'bandpass',460,280,0.9,0.25,1.2);};
SONS.cavaloCome=({noise})=>{for(let i=0;i<4;i++)noise(0.07,'bandpass',1400,900,1.5,0.18,i*0.16);};
SONS.montar=({noise,tone})=>{noise(0.18,'bandpass',700,400,1.2,0.25);tone(0.12,'triangle',220,160,0.06,0.05);noise(0.1,'lowpass',300,150,0.8,0.25,0.18);};
SONS.escovar=({noise})=>{for(let i=0;i<5;i++)noise(0.12,'highpass',3000,2600,0.7,0.12,i*0.15);};
SONS.assobio=({tone})=>{tone(0.22,'sine',1900,2500,0.16);tone(0.32,'sine',2500,1700,0.16,0.24);};

/* ---------- itens, ícones e receitas ---------- */
iconesNovos({
  'i-cavalo':'<path d="M6 21v-6.5L4 12l3-5.5L9 3l1.5 2.2L13 4c3.6.6 6.5 3.4 7 7.6l-2.6.6-1.6-3.1-2.3 1.4.6 4.2L13 21"/><path d="M9.6 7.6h.01"/>',
  'i-ferradura':'<path d="M7 20H4.5C3.6 17 3 14.6 3 12a9 9 0 0 1 18 0c0 2.6-.6 5-1.5 8H17"/><path d="M7 20c-.8-2.4-1.2-4.8-1.2-7.2a6.2 6.2 0 0 1 12.4 0c0 2.4-.4 4.8-1.2 7.2"/><path d="M6.4 9.5h.01M17.6 9.5h.01M5.6 14h.01M18.4 14h.01"/>',
  'i-sela':'<path d="M3 11c3 .8 5 1.6 9 1.6s6-.8 9-1.6c-.6 3-2.5 5-5 5.6H8C5.5 16 3.6 14 3 11z"/><path d="M16 11.2c0-2 .8-4 2.5-4.6M12 16.6v3.4M10.5 20h3"/>',
  'i-alforjes':'<path d="M4 8h16"/><path d="M5 8v9a2 2 0 0 0 2 2h2.5a2 2 0 0 0 2-2V8M12.5 8v9a2 2 0 0 0 2 2H17a2 2 0 0 0 2-2V8"/><path d="M5 11.5h6.5M12.5 11.5H19"/>',
  'i-cabresto':'<path d="M8 4c-1.5 4-1.5 9 0 14h8c1.5-5 1.5-10 0-14"/><path d="M7.3 9h9.4M7.6 15h8.8M12 18v3.5"/>',
  'i-escova':'<path d="M4 14h16v3H4z"/><path d="M6 14V8.5C6 7 7.4 6 9 6h6c1.6 0 3 1 3 2.5V14"/><path d="M6 17v3M9 17v3M12 17v3M15 17v3M18 17v3"/>',
  'i-feno':'<path d="M4 9.5C4 7.6 7.6 6 12 6s8 1.6 8 3.5v6c0 1.9-3.6 3.5-8 3.5s-8-1.6-8-3.5z"/><path d="M4 9.5C4 11.4 7.6 13 12 13s8-1.6 8-3.5M8 12.6v6M16 12.6v6M6 8l-2-3M18 8l2-3M12 6V3"/>',
  'i-poste-amarrar':'<path d="M7 21V5M17 21V5M5 5h14M7 9h10"/><path d="M12 9c-1.2 1.5-1.2 3 0 4.5s1.2 3 0 4.5"/>',
  'i-cocho':'<path d="M3 9h18l-2.5 7h-13z"/><path d="M6.5 16 5 21M17.5 16l1.5 5"/><path d="M7 9c.5-1.6 1.6-2.6 3-2.6M12 9c.3-1.8 1.4-3 3-3.2M15.5 9c.4-1 1-1.6 2-1.8"/>'});
Object.assign(ITEMS,{
  feno:{nome:'Feno',icon:'i-feno',max:20,tipo:'material',desc:'Capim e fibras secos, amarrados em fardo. Comida de cavalo: mata bastante a fome dele.'},
  cabresto:{nome:'Cabresto',icon:'i-cabresto',max:3,tipo:'util',desc:'Corda trançada que vai na cabeça do cavalo. Com a confiança do cavalo cheia, segure E perto dele para domar.'},
  sela:{nome:'Sela',icon:'i-sela',max:1,tipo:'util',desc:'Sela de couro com estribos. No cavalo domado (segure E perto dele → Pôr a sela): deixa galopar e cansa menos o cavalo.'},
  alforjes:{nome:'Alforjes',icon:'i-alforjes',max:1,tipo:'util',desc:'Dois bolsões de couro presos atrás da sela: o cavalo leva 10 espaços de carga.'},
  ferraduras:{nome:'Ferraduras',icon:'i-ferradura',max:4,tipo:'util',desc:'Jogo de quatro ferraduras. Ferrado, o cavalo anda no asfalto sem gastar os cascos. Gastam com o tempo.'},
  escova:{nome:'Escova de cavalo',icon:'i-escova',max:1,tipo:'util',durMax:40,desc:'Escovar o cavalo aumenta o vínculo (ele vem de mais longe quando você assobia) e ajuda a sarar.'}});
RECIPES.push(
  {faz:'feno',n:1,custo:{fibra:4},cat:'animais',etapa:1,est:0,desb:{fauna:'cavalo'}},
  {faz:'cabresto',n:1,custo:{corda:2},cat:'animais',etapa:1,est:0,desb:{fauna:'cavalo'}},
  {faz:'escova',n:1,custo:{madeira:1,fibra:3},cat:'animais',etapa:1,est:0,desb:{fauna:'cavalo'}},
  {faz:'sela',n:1,custo:{couroGrandeCurtido:1,couroCurtido:1,madeira:2,corda:1},cat:'animais',etapa:2,est:'couro',desb:{fauna:'cavalo'}},
  {faz:'alforjes',n:1,custo:{couroCurtido:2,linha:2,corda:1},cat:'animais',etapa:2,est:'couro',desb:{fauna:'cavalo'}},
  {faz:'ferraduras',n:1,custo:{barraFerro:1,carvao:1},cat:'animais',etapa:3,est:'forja',desb:{fauna:'cavalo'}});
if(!FAB_CATS.some(c=>c[0]==='animais'))FAB_CATS.push(['animais','Animais','i-cavalo']);
/* receitas que liberam quando você vê o bicho pela primeira vez (cavalo, gavião) */
function faunaVista(k){const D=typeof diarioD==='function'?diarioD():null;if(D&&D.desc&&(D.desc['especie:'+k]||D.desc['ave:'+k]))return true;
  if(k==='cavalo')return CAVALOS.length>0;if(k==='gaviao')return!!(typeof GAV!=='undefined'&&GAV.domado);return false;}
const FAUNA_DESB_NOME={cavalo:'um cavalo selvagem',gaviao:'um gavião selvagem de perto'};
{const _re=receitaEstado;receitaEstado=function(r){const d=r.desb;if(d&&d.fauna)return faunaVista(d.fauna)?'nova':'travada';return _re.apply(this,arguments);};
 const _dt=desbTexto;desbTexto=function(r){const d=r.desb;if(d&&d.fauna)return'Libera quando você vir '+(FAUNA_DESB_NOME[d.fauna]||d.fauna)+' pela primeira vez.';return _dt.apply(this,arguments);};
 if(typeof receitaComo==='function'){const _rc=receitaComo;receitaComo=function(r){const d=r.desb;if(d&&d.fauna)return faunaVista(d.fauna)?'aprendeu ao ver '+(FAUNA_DESB_NOME[d.fauna]||d.fauna):'ainda não';return _rc.apply(this,arguments);};}}

/* ---------- regras ---------- */
const CAV={passo:1.7,trote:4.3,galope:10.4,max:4,carga:10,giro:[2.7,2.0,1.35],fomeH:1.5,fomeTroteH:3,fomeGalopeH:9,pastoH:12,cascoKm:22,ferrKm:3.5,
  comida:{feno:{fome:35,conf:0.26},cenoura:{fome:16,conf:0.4},maca:{fome:15,conf:0.4},milho:{fome:20,conf:0.32},abobora:{fome:24,conf:0.28},frutas:{fome:8,conf:0.22}},
  ordemDar:['feno','milho','abobora','cenoura','maca','frutas'],ordemDomar:['maca','cenoura','milho','abobora','feno','frutas'],
  nomes:['Estrela','Trovão','Pé de Pano','Baio','Pingo','Ventania','Faísca','Canela','Pinhão','Paçoca','Relâmpago','Mel','Tufão','Cigano','Brisa','Moreno']};
const CAVALOS=[];let CAV_ID=0;
function comidaCavalo(ordem){for(const k of ordem||CAV.ordemDomar)if(ITEMS[k]&&invCount(k)>0)return k;return null;}
const cavNomeItem=k=>ITEMS[k]?ITEMS[k].nome.toLowerCase():k;

/* ---------- cavalo selvagem: calmo com você agachado, devagar e com comida; com confiança, chega perto ---------- */
function calmoComCavalo(dp){return P.alive&&!CARRO.ativo&&!P.montado&&(P.agK||0)>0.5&&!P.correndo&&Math.hypot(P.vx,P.vz)<2.4&&dp<18&&!!comidaCavalo();}
{const _fp=faunaPercebe;faunaPercebe=function(b,S,dt,dp){if(b.tipo!=='cavalo'||b.domado)return _fp.apply(this,arguments);const a0=b.alerta;_fp.apply(this,arguments);
  if(calmoComCavalo(dp)&&b.golpeadoT<=0){const g=b.alerta-a0;if(g>0)b.alerta=a0+g*0.06*(1-0.8*(b.conf||0));b.alerta=Math.min(b.alerta,0.55);}};}
{const _fr=faunaRotina;faunaRotina=function(b,S,dt,dp){if(b.tipo==='cavalo'&&!b.domado){if(!(calmoComCavalo(dp)&&dp<12))b.conf=Math.max(0,(b.conf||0)-dt*0.0015);
    if(b.maoT>0){b.maoT-=dt;b.st='come';b.vAlvo=0;b.yaw=angLerp(b.yaw,Math.atan2(P.x-b.x,P.z-b.z),1-Math.exp(-dt*4));return;}
    if((b.conf||0)>0.25&&calmoComCavalo(dp)&&dp<14&&b.st!=='foge'){if(dp>2.5){b.st='explora';b.rx=P.x-b.x;b.rz=P.z-b.z;b.vAlvo=S.anda*0.8;b.t=0.5;return;}
      b.st='come';b.vAlvo=0;b.t=2;b.yaw=angLerp(b.yaw,Math.atan2(P.x-b.x,P.z-b.z),1-Math.exp(-dt*3));return;}}
  return _fr.apply(this,arguments);};}
INTERS.push(function cavInter(tryIt){if(!P.alive||CARRO.ativo||P.nada)return;
  if(P.montado){tryIt({k:'cavaloDesce',o:P.montado},P.x,P.z,9,99,-2);return;}
  for(const b of BICHOS){if(b.tipo!=='cavalo'||!b.vivo||Math.abs(b.x-P.x)>4||Math.abs(b.z-P.z)>4)continue;
    if(b.domado)tryIt({k:'cavalo',o:b},b.x,b.z,2.9,3.4,-0.7);else if(b.st!=='foge')tryIt({k:'cavaloDomar',o:b},b.x,b.z,3.4,3.4,-0.7);}});
INTER_K.cavaloDomar={texto:b=>{const c=b.conf||0,f=comidaCavalo(),pct=Math.round(c*100)+'%';
    if(c>=0.97)return invCount('cabresto')?{t:'Pôr o cabresto e domar',s:'segure · confiança cheia',hold:true,dur:2.4}:{t:'Cavalo calmo (confiança cheia)',s:'precisa de um cabresto (Fabricar → Animais: 2 cordas)'};
    if(!f)return{t:'Cavalo selvagem',s:'traga comida de cavalo (feno, cenoura, maçã, milho, abóbora ou frutas) e chegue agachado'};
    return{t:'Oferecer '+cavNomeItem(f)+' na mão',s:((P.agK||0)>0.5?'segure, devagar':'agache (de pé ele se assusta)')+' · confiança '+pct,hold:true,dur:2.0};},
  usar:(b,seg)=>{if(!seg||!b.vivo||b.domado)return;const c=b.conf||0;
    if(c>=0.97){if(!invCount('cabresto')){feed('Precisa de um cabresto',true);return;}if(CAVALOS.length>=CAV.max){feed('Você já cuida de '+CAV.max+' cavalos',true);return;}invRemove('cabresto',1);domarCavalo(b);return;}
    const f=comidaCavalo();if(!f)return;if((P.agK||0)<0.5){b.alerta=1.2;faunaFugir(b,{x:P.x,z:P.z},6);feed('O cavalo se assustou: chegue agachado',true);return;}
    invRemove(f,1);b.conf=Math.min(1,c+CAV.comida[f].conf);if(b.conf>0.97)b.conf=1;b.alerta=0;b.maoT=2.2;sfx('cavaloCome',b.x,b.z,0.7);
    feed(b.conf>=0.97?'O cavalo comeu da sua mão e confia em você. Ponha o cabresto (segure E).':'O cavalo comeu '+cavNomeItem(f)+' da sua mão · confiança '+Math.round(b.conf*100)+'%');
    dica('domarCavalo','corpo','Cada comida aumenta a confiança (maçã e cenoura mais). Com confiança cheia e um cabresto na mochila, segure E para domar.');invRender();hudBarra();}};

/* ---------- domar ---------- */
function domarCavalo(b){const F=faunaEstado();if(b.zona&&F.z[b.zona]&&F.z[b.zona].cavalo)F.z[b.zona].cavalo.n=Math.max(0,F.z[b.zona].cavalo.n-1);
  for(const o of BICHOS)if(o.lider===b)o.lider=null;
  const usados=new Set(CAVALOS.map(h=>h.nome)),livres=CAV.nomes.filter(n=>!usados.has(n));
  Object.assign(b,{domado:true,zona:null,lider:null,conf:1,hid:++CAV_ID,nome:livres.length?livres[Math.floor(Math.random()*livres.length)]:'Cavalo '+(CAVALOS.length+1),
    fome:40,folego:80,vinculo:0.15,casco:100,ferr:0,sela:false,alforjes:false,carga:new Array(CAV.carga).fill(null),modo:'segue',fx:b.x,fz:b.z,escT:-1e9,tmUlt:G.tm,empinaT:1.3,st:'explora',t:2,v:0,alerta:0,amea:null});
  CAVALOS.push(b);sfx('relincho',b.x,b.z,0.9);ganharXP(30);
  toast('corpo','Você domou um cavalo '+CAV_PELO[b.var||'']+'! O nome dele é '+b.nome+'. Toque E para montar, segure E para cuidar dele. Uma sela (estação de couro) deixa galopar; alforjes levam carga.');
  if(typeof diarioEvento==='function')diarioEvento('Domou o cavalo '+b.nome+' ('+CAV_PELO[b.var||'']+')','caca');if(typeof conqEvento==='function')conqEvento('domar','cavalo');}

/* ---------- os domados ficam fora da rotina dos selvagens (e não somem de longe) ---------- */
{const _ub=updateBichos;updateBichos=function(dt){for(let i=BICHOS.length-1;i>=0;i--){const b=BICHOS[i];if(b.domado&&b.vivo&&b.tipo==='cavalo')BICHOS.splice(i,1);}
  _ub.apply(this,arguments);if(!ZMESH.bicho_coelho)return;
  for(let i=CAVALOS.length-1;i>=0;i--){const h=CAVALOS[i];if(!h.vivo){CAVALOS.splice(i,1);continue;}if(!BICHOS.includes(h))BICHOS.push(h);cavaloIA(h,dt);}};}
{const _fm=faunaMorre;faunaMorre=function(b){const dom=b.domado&&b.tipo==='cavalo';const r=_fm.apply(this,arguments);if(dom)cavaloPerdido(b);return r;};}
function cavaloPerdido(h){const i=CAVALOS.indexOf(h);if(i>=0)CAVALOS.splice(i,1);if(P.montado===h)descerDoCavalo(true);
  const it=[];for(const s of h.carga||[])if(s)it.push([s.id,s.n,exDe(s)]);if(h.sela)it.push(['sela',1]);if(h.alforjes)it.push(['alforjes',1]);soltarItens(it,h.x,h.z);
  toast('perigo',h.nome+' morreu.'+(it.length?' O que ele levava ficou no chão.':''));if(typeof diarioEvento==='function')diarioEvento('Perdeu o cavalo '+h.nome,'caca');}
{const _fb=ferirBicho;ferirBicho=function(b,dmg,kx,kz,tipo){if(!b||!b.domado||!b.vivo||b.tipo!=='cavalo')return _fb.apply(this,arguments);
  b.hp-=dmg;b.flash=0.15;b.golpeadoT=4;sangue(b.x,b.y+1.1,b.z,6);if(b.hp<=0){faunaMorre(b,tipo,dmg);return;}faunaSom(b,'dor');b.vinculo=Math.max(0,b.vinculo-0.03);
  if(P.montado!==b&&b.vinculo<0.5){b.susto={x:b.x-kx*3,z:b.z-kz*3,t:2.5};}};}

/* ---------- comportamento do domado: seguir, esperar (amarrado), vir ao assobio, pastar, comer do cocho, assustar ---------- */
function cavaloNaGrama(h){if(dentroCidade(h.x,h.z,-2)||naAgua(h.x,h.y+0.3,h.z))return false;const ri=roadInfo(h.x,h.z);return!(ri.road&&ri.d<ri.road.w/2+0.3);}
function cavaloSuperficie(h){if(RIO.ok&&aguaProfVeic(h.x,h.z)>0.15)return'agua';if(dentroCidade(h.x,h.z,-2))return'asf';const ri=roadInfo(h.x,h.z);
  return ri.road&&ri.d<ri.road.w/2?(ri.road.cor==='asfalto'?'asf':'terra'):'grama';}
function cochoPerto(h,r){let best=null,bd=(r||12)**2;for(const o of OB){if(o.tipo!=='cocho'||o.hp<=0||!o.itens)continue;const d=d2(o.x,o.z,h.x,h.z);if(d<bd&&o.itens.some(s=>s&&CAV.comida[s.id])){bd=d;best=o;}}return best;}
function cavaloIA(h,dt){const S=FAUNA.cavalo,dp=Math.hypot(h.x-P.x,h.z-P.z);
  h.t-=dt;h.flash=Math.max(0,h.flash-dt);h.golpeadoT=Math.max(0,(h.golpeadoT||0)-dt);h.empinaT=Math.max(0,(h.empinaT||0)-dt);
  if(h.congelado){h.ch.vis=dp<115;if(h.ch.vis){faunaPose(h,S,dt);if(h.empinaT>0)cavaloEmpina(h,h.empinaT);}return;}
  cavaloCuidados(h,dt);
  if(P.montado===h){h.ch.vis=true;h.ch.tint=h.flash>0?[2.2,1.3,1.3]:[1,1,1];faunaPose(h,S,dt);return;}
  let tx=null,tz=null,vA=0,st=null;
  if(h.susto&&h.susto.t>0){h.susto.t-=dt;const dx=h.x-h.susto.x,dz=h.z-h.susto.z,l=Math.hypot(dx,dz)||1;tx=h.x+dx/l*5;tz=h.z+dz/l*5;vA=S.trota*1.4;st='explora';}
  else{// zumbi perto: com pouco vínculo, foge um pouco
    h.zT=(h.zT||0)-dt;if(h.zT<=0){h.zT=0.7;let bd=8*8,zz=null;for(const z of Z){if(!z.vivo)continue;const q=d2(z.x,z.z,h.x,h.z);if(q<bd){bd=q;zz=z;}}
      if(zz&&h.vinculo<0.6&&!(h.modo==='amarrado')){h.susto={x:zz.x,z:zz.z,t:2};if(Math.random()<0.5)faunaSom(h,'alerta');}}}
  if(tx===null&&h.chamado){if(dp<3.4||G.t>h.chamadoAte)h.chamado=false;else{tx=P.x;tz=P.z;vA=dp>25?S.corre*0.85:dp>9?S.trota:S.anda;st='explora';}}
  if(tx===null&&h.modo!=='segue'&&h.fome>35){const c=cochoPerto(h,h.modo==='amarrado'?3.5:12);if(c){const dc=Math.hypot(c.x-h.x,c.z-h.z);
      if(dc>1.5){tx=c.x;tz=c.z;vA=S.anda;st='explora';}else{st='come';h.yaw=angLerp(h.yaw,Math.atan2(c.x-h.x,c.z-h.z),1-Math.exp(-dt*3));h.cochoT=(h.cochoT||0)+dt;
        if(h.cochoT>3){h.cochoT=0;for(const k of CAV.ordemDar){const j=c.itens.findIndex(s=>s&&s.id===k);if(j<0)continue;const s=c.itens[j];s.n--;if(s.n<=0)c.itens[j]=null;h.fome=Math.max(0,h.fome-CAV.comida[k].fome);if(dp<30)sfx('cavaloCome',h.x,h.z,0.5);break;}}}}}
  if(tx===null&&st===null){
    if(h.modo==='segue'&&P.alive&&!CARRO.ativo){const b=P.body,gx=P.x-Math.sin(b)*3.2+Math.cos(b)*1.7,gz=P.z-Math.cos(b)*3.2-Math.sin(b)*1.7,dg=Math.hypot(gx-h.x,gz-h.z);
      if(dp>150){h.modo='fica';h.fx=h.x;h.fz=h.z;}
      else if(dg>1.5&&dp>2.2){tx=gx;tz=gz;const pv=Math.hypot(P.vx,P.vz);vA=dg>20?S.corre*0.8:dg>7?S.trota:clamp(pv+dg*0.5,S.anda*0.8,S.trota);st='explora';}}
    else{const ax=h.fx??h.x,az=h.fz??h.z,raio=h.modo==='amarrado'?1.1:4,da=Math.hypot(ax-h.x,az-h.z);
      if(da>raio){tx=ax;tz=az;vA=da>10?S.trota:S.anda;st='explora';}
      else{if(h.t<=0){h.t=5+Math.random()*9;h.pasto=Math.random()<0.6?null:{x:ax+(Math.random()-0.5)*raio*1.5,z:az+(Math.random()-0.5)*raio*1.5};}
        if(h.pasto&&Math.hypot(h.pasto.x-h.x,h.pasto.z-h.z)>0.7){tx=h.pasto.x;tz=h.pasto.z;vA=S.anda*0.7;st='explora';}}}}
  if(st===null)st=cavaloNaGrama(h)?'come':'explora';
  h.st=st;h.vAlvo=vA;if(tx!==null){h.rx=tx-h.x;h.rz=tz-h.z;}
  cavaloMove(h,dt);
  h.ch.vis=dp<115;h.ch.tint=h.flash>0?[2.2,1.3,1.3]:[1,1,1];
  if(h.ch.vis){faunaPose(h,S,dt);if(h.empinaT>0)cavaloEmpina(h,h.empinaT);}
  if(dp<40&&h.v>1.2)cavaloPassos(h,0.6);
  h.somT=(h.somT||8)-dt;if(h.somT<=0){h.somT=14+Math.random()*25;if(dp<40)faunaSom(h,'idle');}}
/* empinar (logo que é domado): o corpo gira em torno das patas de trás */
function cavaloEmpina(h,k){const F=FAUNA_FORMA.cavalo,o=h.ch.r,f=Math.sin(Math.min(1,k/1.3)*Math.PI);poseEmPe(h,F,o,G.t,0.75*f);o[3*3]=o[5*3]=-0.9*f+Math.sin(G.t*14)*0.3*f;S3(o,1,-0.35*f,0,0);}
function cavaloLivre(h,dx,dz){for(const dd of[1.5,2.7]){const x=h.x+dx*dd,z=h.z+dz*dd;if(!dentroMapa(x,z,4))return false;if(pointBlocked(x,z,0.45))return false;
    if(RIO.ok&&aguaNivel(x,z)!==null&&aguaProfVeic(x,z)>0.9)return false;if(Math.abs(chaoBicho(x,z)-h.y)/dd>0.9)return false;if(salaEm(x,chaoBicho(x,z)+0.6,z))return false;}return true;}
function cavaloMove(h,dt){const S=FAUNA.cavalo;let va=h.st==='come'||h.st==='repouso'?0:(h.vAlvo||0);
  if(va>0.05){let dx=h.rx,dz=h.rz;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;h.desvT=(h.desvT||0)-dt;
    if(h.desvT<=0){h.desvT=0.25;if(!cavaloLivre(h,dx,dz)){let alt=null;for(const a of[0.5,-0.5,1.0,-1.0,1.6,-1.6,2.3,-2.3]){const c=Math.cos(a),s=Math.sin(a),nx=dx*c-dz*s,nz=dx*s+dz*c;if(cavaloLivre(h,nx,nz)){alt=[nx,nz];break;}}
        if(alt){h.dvx=alt[0];h.dvz=alt[1];h.desvMant=0.8;}else va=0;}}
    if(h.desvMant>0){h.desvMant-=dt;dx=h.dvx;dz=h.dvz;}h.yaw=angLerp(h.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*(va>S.trota?4:3)));}
  h.v=approach(h.v,va,dt*(va>h.v?3:6));if(h.v<0.01){h.y=chaoBicho(h.x,h.z);return;}
  cavaloAnda(h,dt);}
/* anda na direção do focinho com colisão no corpo todo (peito e anca), água funda, ladeira, casas e beira do mapa */
function cavaloAnda(h,dt){const fx=Math.sin(h.yaw),fz=Math.cos(h.yaw),ox=h.x,oz=h.z,oy=h.y,s=h.ch.s||1;h.x+=fx*h.v*dt;h.z+=fz*h.v*dt;let bloq=null;
  if(RIO.ok&&aguaNivel(h.x,h.z)!==null&&aguaProfVeic(h.x,h.z)>1.0)bloq='agua';else if(!dentroMapa(h.x,h.z,3))bloq='mapa';
  else{const ny=chaoBicho(h.x,h.z),dd=Math.hypot(h.x-ox,h.z-oz);if(salaEm(h.x,ny+0.6,h.z))bloq='casa';else if(dd>0.001&&(ny-oy)/dd>1.0)bloq='ladeira';}
  if(bloq){h.x=ox;h.z=oz;h.v*=0.25;h.bloq=bloq;h.y=chaoBicho(h.x,h.z);return false;}h.bloq=null;
  for(const k of[0.68,-0.62]){const q={x:h.x+fx*k*s,z:h.z+fz*k*s},qx=q.x,qz=q.z;collide(q,0.36*s,c=>c.solid);h.x+=q.x-qx;h.z+=q.z-qz;}
  collide(h,0.42*s,c=>c.solid);const mv=Math.hypot(h.x-ox,h.z-oz),esp=h.v*dt;if(esp>0.02&&mv<esp*0.35){h.v*=0.5;h.bateu=(h.bateu||0)+dt;}else h.bateu=0;
  h.y=chaoBicho(h.x,h.z);h.andou=(h.andou||0)+mv;
  // cascos: asfalto sem ferradura gasta; com ferradura gasta a ferradura
  if(mv>0){const sup=cavaloSuperficie(h);if(h.ferr>0)h.ferr=Math.max(0,h.ferr-mv/(CAV.ferrKm*10));else if(sup==='asf')h.casco=Math.max(0,h.casco-mv/(CAV.cascoKm*10)*(h.v>7?2:1));
    if(h.ferr<=0&&h.ferrAviso){h.ferrAviso=false;feed('As ferraduras de '+h.nome+' gastaram',true);}}
  return true;}
/* barulho de casco a cada passada (o som muda no asfalto, na terra e na água) */
function cavaloPassos(h,vol){const st=Math.floor((h.ph||0)/Math.PI);if(st===h.passoN)return;h.passoN=st;const sup=cavaloSuperficie(h),gal=h.v>7;
  sfx('casco',h.x,h.z,vol*(gal?1:h.v>2.6?0.8:0.55),sup);if(gal)setTimeout(()=>sfx('casco',h.x,h.z,vol*0.8,sup),70);}
function cavaloMancando(h){return h.casco<35;}
function cavaloVelK(h){let k=1;if(cavaloMancando(h))k*=0.72;if(h.fome>85)k*=0.85;if(h.hp<h.hpMax*0.35)k*=0.8;return k;}
/* fome, fôlego, vida, cascos e vínculo (a fome conta em horas de jogo, mesmo longe) */
function cavaloCuidados(h,dt){const dm=Math.max(0,Math.min(180,G.tm-(h.tmUlt??G.tm)));h.tmUlt=G.tm;const hH=dm/60,v=h.v||0,gal=v>7,tro=v>2.6&&!gal;
  h.fome=clamp(h.fome+hH*(CAV.fomeH+(gal?CAV.fomeGalopeH:tro?CAV.fomeTroteH:0)),0,100);
  if(h.st==='come'&&v<0.2&&!h.cochoT&&cavaloNaGrama(h))h.fome=Math.max(0,h.fome-hH*CAV.pastoH);
  if(gal)h.folego=Math.max(0,h.folego-dt*(h.sela?1.75:2.4));else if(tro)h.folego=Math.max(0,h.folego-dt*0.06);else h.folego=Math.min(100,h.folego+dt*(h.fome<80?4:1.4));
  if(h.fome<75&&h.hp<h.hpMax&&!h.golpeadoT)h.hp=Math.min(h.hpMax,h.hp+h.hpMax*hH*(G.tm-h.escT<240?0.12:0.06));
  if(h.fome>=100){h.hp-=h.hpMax*hH*0.05;h.vinculo=Math.max(0,h.vinculo-hH*0.02);if(G.tm-(h.fomeAviso||-1e9)>180){h.fomeAviso=G.tm;toast('perigo',h.nome+' está passando fome. Dê feno, milho, frutas ou deixe pastar.');}
    if(h.hp<=0){h.hp=1;faunaMorre(h,'fome',1);return;}}
  if(cavaloSuperficie(h)!=='asf'&&v<3)h.casco=Math.min(100,h.casco+hH*2);
  if(h.fome>85&&G.tm-(h.fomeAviso2||-1e9)>360&&h.fome<100){h.fomeAviso2=G.tm;feed(h.nome+' está com fome',true);}}

/* ---------- montar, cavalgar e descer ---------- */
function montar(h){if(!h||!h.domado||!h.vivo||P.montado||CARRO.ativo||P.nada)return;if(P.acao)P.acao=null;
  if(RIO.ok&&aguaProfVeic(h.x,h.z)>0.8){feed('Fundo demais para montar aqui',true);return;}
  P.montado=h;h.chamado=false;h.susto=null;h.st='explora';h.vAlvo=0;P.agachado=false;P.agK=0;P.vx=P.vz=0;P.mtT=0;P.mtDe={x:P.x,y:P.y,z:P.z};P.aim=0;
  if(P.ch.sk)P.ch.sk.cwAlvo=0;sfx('montar',h.x,h.z,0.8);
  dica('montar','corpo','Montado! W/A/S/D levam '+h.nome+' para onde a câmera olha. Shift galopa (só com sela, e cansa o cavalo), C anda a passo, E desce. Galopando ele derruba zumbi e faz barulho.');}
function descerDoCavalo(forcado){const h=P.montado;if(!h)return;P.montado=null;if(h.vivo){h.v=forcado?h.v:0;h.st='explora';h.vAlvo=0;}
  const s=Math.sin(h.yaw),c=Math.cos(h.yaw),L=[[-c,s],[c,-s],[-s,-c],[s,c]];let px=h.x-c*1.1,pz=h.z+s*1.1;
  for(const[dx,dz]of L){const x=h.x+dx*1.15,z=h.z+dz*1.15;if(pontoLivre(x,z,0.35)&&!(RIO.ok&&aguaProf(x,z)>0.9)){px=x;pz=z;break;}}
  P.x=px;P.z=pz;P.y=chaoEm(px,pz,(h.y||0)+1.2);P.vy=0;P.vx=P.vz=0;P.noChao=true;P.ch.pitch=0;P.ch.roll=0;P.ch.hipY=0;
  if(h.modo==='segue'||!h.fx){h.fx=h.x;h.fz=h.z;}
  if(forcado){P.shake=0.9;ferirJogador(8,{x:h.x,z:h.z});feed('Você caiu do cavalo',true);}else sfx('montar',h.x,h.z,0.5);}
INTER_K.cavalo={texto:h=>({t:h.nome+' ('+CAV_PELO[h.var||'']+')',s:'toque: montar · segure: cuidar'+(h.fome>70?' · com fome':''),alt:true,dur:0.55}),
  curto:h=>montar(h),usar:(h,seg)=>{if(seg)abrirCavalo(h);else montar(h);}};
INTER_K.cavaloDesce={texto:h=>({t:'Descer do cavalo',s:h.nome+' · fôlego '+Math.round(h.folego)+'%'}),usar:()=>descerDoCavalo(false)};
const CAV_SELA_Y=0.06;
/* passo do jogador montado (no lugar do andar normal) */
function montariaPasso(dt){const h=P.montado;if(!h)return false;
  if(!h.vivo||!P.alive||CARRO.ativo){descerDoCavalo(!!(h.vivo&&P.alive));return false;}
  const S=FAUNA.cavalo,F=FAUNA_FORMA.cavalo;P.mtT=(P.mtT||0)+dt;
  let mx=IN.mx,mz=IN.mz;const ml=Math.hypot(mx,mz);let vAlvo=0,rumo=h.yaw;
  if(ml>0.15){const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),dx=sy*mz-cy*mx,dz=cy*mz+sy*mx;rumo=Math.atan2(dx,dz);
    const podeGal=h.sela&&h.folego>6&&!cavaloMancando(h)&&!(h.fome>=100);
    if(IN.run&&!podeGal&&P.mtT>0.5){const m=!h.sela?'Sem sela não dá para galopar':cavaloMancando(h)?h.nome+' está mancando (cascos gastos)':h.nome+' está sem fôlego';if(G.t-(P.cavAvisoT||0)>4){P.cavAvisoT=G.t;feed(m,true);}}
    vAlvo=(IN.run&&podeGal?CAV.galope:P.agachado?CAV.passo:CAV.trote)*cavaloVelK(h);
    const da=Math.abs(angDiff(h.yaw,rumo));if(da>1.4)vAlvo=Math.min(vAlvo,CAV.passo*1.4);else if(da>0.8)vAlvo=Math.min(vAlvo,CAV.trote);}
  if(h.folego<6&&h.v>7&&G.t-(P.cavAvisoT||0)>4){P.cavAvisoT=G.t;feed(h.nome+' cansou: deixe ele andar a passo para recuperar o fôlego',true);faunaSom(h,'idle');}
  const gi=h.v<2.5?CAV.giro[0]:h.v<6?CAV.giro[1]:CAV.giro[2];{const d=angDiff(h.yaw,rumo),m=gi*dt;h.yaw+=clamp(d,-m,m);}
  h.v=approach(h.v,vAlvo,dt*(vAlvo>h.v?3.2:7));
  if(h.v>0.01){const ok=cavaloAnda(h,dt);if(!ok&&h.bloq&&G.t-(P.cavBloqT||0)>3){P.cavBloqT=G.t;feed(h.bloq==='agua'?'Fundo demais para o cavalo':h.bloq==='casa'?'O cavalo não entra em casa':h.bloq==='ladeira'?'Íngreme demais':'Não dá para passar',true);}}
  else h.y=chaoBicho(h.x,h.z);
  h.st=h.v>0.1?'explora':'alerta';h.vAlvo=h.v;
  // atropela zumbi a galope
  if(h.v>6.5){const fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);for(const z of Z){if(!z.vivo||Math.abs(z.y-h.y)>1.6)continue;const dx=z.x-h.x,dz=z.z-h.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);
      if(f>0&&f<1.6&&l<0.75){ferirZ(z,h.v*4.2,fx*0.6,fz*0.6,true);h.v*=0.55;sfx('impacto',z.x,z.z,0.9);h.hp=Math.max(1,h.hp-3);}}}
  // barulho
  P.cavBarT=(P.cavBarT||0)-dt;if(P.cavBarT<=0){P.cavBarT=0.45;if(h.v>7)barulho(h.x,h.z,16,true);else if(h.v>2.6)barulho(h.x,h.z,8,true);else if(h.v>0.5)barulho(h.x,h.z,3.5,true);}
  cavaloPassos(h,0.9);
  // o jogador vai junto, sentado na sela
  const fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);P.vx=fx*h.v;P.vz=fz*h.v;P.vy=0;P.noChao=true;P.amp=0;P.runK=h.v>7?1:0;P.correndo=false;
  const ass=cavaloAssento(h),k=clamp(P.mtT/0.35,0,1),e=k*k*(3-2*k);P.x=lerp(P.mtDe.x,ass.x,e);P.z=lerp(P.mtDe.z,ass.z,e);P.y=lerp(P.mtDe.y,ass.y,e);
  P.body=h.yaw;P.energia=Math.min(100,P.energia+8*dt);P.cd-=dt;
  if(IN.attack||IN.atkQ){IN.atkQ=false;IN.attack=false;dica('cavaloArma','corpo','Montado não dá para lutar: desça do cavalo (E). A galope, o cavalo derruba zumbi no caminho.');}
  P.recuo=Math.max(0,(P.recuo||0)-dt*6);P.shake=Math.max(0,(P.shake||0)-dt*3);P.flash=Math.max(0,(P.flash||0)-dt);P.hurt=Math.max(0,(P.hurt||0)-dt);
  sobreviver(dt,false);poseMontado(h,dt);return true;}
/* onde fica o quadril de quem monta: em cima do lombo, girando junto com a inclinação do cavalo */
function cavaloAssento(h){const F=FAUNA_FORMA.cavalo,s=h.ch.s||1,Hc=F.H*0.28+F.pS[0]+F.pI[0],top=F.H/2*0.96,ps=P.ch.s||1,hip=P.ch.sk&&P.ch.sk.t&&P.ch.sk.t.pronto?P.ch.sk.t.hip*ps:(P.ch.bones&&P.ch.bones[0]?P.ch.bones[0].o[1]*ps:0.95);
  const p=h.ch.pitch||0,cp=Math.cos(p),sp=Math.sin(p),ly=(Hc+(h.ch.hipY||0)+top+CAV_SELA_Y)*s,lz=0.06*s,y1=ly*cp-lz*sp,z1=ly*sp+lz*cp;
  return{x:h.x+Math.sin(h.yaw)*z1,y:(h.ch.y??h.y)+y1-hip+0.06,z:h.z+Math.cos(h.yaw)*z1};}
function poseMontado(h,dt){const ch=P.ch,o=ch.r,gal=h.v>7,tro=h.v>2.6&&!gal,ph=h.ph||0;o.fill(0);
  const balanco=gal?Math.sin(ph)*0.05:tro?Math.abs(Math.sin(ph*2))*0.035:0;
  o[3]=0.1+(gal?0.32:tro?0.12:0)+Math.sin(ph)*0.03*(gal?1:0);o[6]=-0.06-(gal?0.18:0.04);
  S3(o,7,-1.05,0,0.38);S3(o,8,1.3,0,0);S3(o,9,-1.05,0,-0.38);S3(o,10,1.3,0,0);
  S3(o,3,-0.6+(gal?-0.2:0),0,-0.18);S3(o,4,-1.0,0,0);S3(o,5,-0.6+(gal?-0.2:0),0,0.18);S3(o,6,-1.0,0,0);
  ch.hipY=0;ch.x=P.x;ch.z=P.z;ch.y=P.y+balanco;ch.yaw=h.yaw;ch.pitch=(h.ch.pitch||0)*0.8;ch.roll=0;}
/* updatePlayer: montado, o cavalo anda no lugar do jogador */
{const _up=updatePlayer;updatePlayer=function(dt){if(P.montado&&P.alive&&!CARRO.ativo&&!P.dorme){if(montariaPasso(dt))return;}return _up.apply(this,arguments);};}
/* câmera: montado, fica um pouco mais longe e mais alta */
{const _uc=updateCamera;updateCamera=function(dt){if(!P.montado||cfg.cam==='1')return _uc.apply(this,arguments);const cd=cfg.camDist;cfg.camDist=(cd||1)*1.45;try{_uc.apply(this,arguments);}finally{cfg.camDist=cd;}};}
/* zumbi que acerta você montado acerta o cavalo também; ferido demais ele se assusta e te derruba */
{const _fj=ferirJogador;ferirJogador=function(d,src){const h=P.montado;if(!h||!src||src.x===undefined||!P.alive)return _fj.apply(this,arguments);
  const r=_fj.call(this,d*0.75,src);if(!h.vivo)return r;h.hp-=d*0.5;h.flash=0.15;faunaSom(h,'dor');sangue(h.x,h.y+1.1,h.z,4);
  if(h.hp<=0){faunaMorre(h,'zumbi',d);return r;}
  if(h.hp<h.hpMax*0.25||(h.vinculo<0.3&&Math.random()<0.25)){descerDoCavalo(true);h.susto={x:src.x,z:src.z,t:3};h.empinaT=1.1;sfx('relincho',h.x,h.z,0.9);toast('perigo',h.nome+' se assustou e te derrubou!');}return r;};}
/* montado não empurra nem rola; E é descer */
{const _em=empurrar;empurrar=function(){if(P.montado)return;return _em.apply(this,arguments);};}
{const _ro=rolar;rolar=function(){if(P.montado)return false;return _ro.apply(this,arguments);};}
{const _pu=pular;pular=function(){if(P.montado)return;return _pu.apply(this,arguments);};}
PASSOS.push(function cavSeguranca(){if(P.montado&&(!P.alive||CARRO.ativo||P.y<-20))descerDoCavalo(false);});

/* ---------- assobio: chama os cavalos (e o gavião, se tiver) ---------- */
function assobiar(){if(G.modo!=='jogo'||!P.alive)return;if(G.t-(P.assobioT||-9)<1.2)return;P.assobioT=G.t;sfx('assobio',P.x,P.z,0.9);barulho(P.x,P.z,12,true);
  const vem=[];for(const h of CAVALOS){if(!h.vivo||P.montado===h)continue;const d=Math.hypot(h.x-P.x,h.z-P.z),alc=70+170*h.vinculo;if(d<=alc){h.chamado=true;h.chamadoAte=G.t+90;if(h.modo==='amarrado')h.modo='fica';vem.push(h.nome);}}
  if(typeof gavAssobio==='function'&&gavAssobio())vem.push(GAV.nome);
  feed(vem.length?'Você assobiou: '+vem.join(', ')+(vem.length>1?' vêm vindo':' vem vindo'):CAVALOS.length?'Você assobiou, mas nenhum cavalo ouviu (longe demais)':'Você assobiou');}
ACOES_TECLA.splice(ACOES_TECLA.findIndex(a=>a.id==='buzina'),0,{id:'assobiar',nome:'Assobiar (chama o cavalo e o gavião)',pad:'KeyX'});montarTraducao();if(typeof rotulosTeclas==='function')rotulosTeclas();
window.addEventListener('keydown',e=>{if(e.code!=='KeyX'||e.repeat)return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||''))return;if(G.modo==='jogo'){e.preventDefault();assobiar();}});
/* controle: segurar LB meio segundo assobia (montado, é só apertar) */
{const _lc=lerControle;const GPA={t:0,ja:false};lerControle=function(dt){_lc.apply(this,arguments);if(!GP.ativo||G.modo!=='jogo')return;const gp=padAtual();if(!gp)return;
  const b=!!(gp.buttons[4]&&(gp.buttons[4].pressed||gp.buttons[4].value>0.5));if(b){GPA.t+=dt;if(!GPA.ja&&(GPA.t>=0.5||P.montado)){GPA.ja=true;assobiar();}}else{GPA.t=0;GPA.ja=false;}};}

/* ---------- painel do cavalo (o mesmo painel das estações) ---------- */
function abrirCavalo(h){if(G.modo!=='jogo')return;h.estTipo='cavalo';abrirEstacao(h);}
function postePerto(h,r){let best=null,bd=(r||6)**2;for(const o of OB){if(o.tipo!=='posteAmarrar'||o.hp<=0)continue;const d=d2(o.x,o.z,h.x,h.z);if(d<bd){bd=d;best=o;}}return best;}
function cavMedidor(nome,f,txt){return'<div class="es-vaga med'+(f<0.25?'':' pronta')+'"><span><b>'+nome+'</b><small>'+txt+'</small></span>'+barraHTML(f)+'</div>';}
ESTACAO_UI.cavalo={resumo:h=>h.nome,
  render(h){const C=CAV.comida,fd=comidaCavalo(CAV.ordemDar),esc=invCount('escova')>0,podeSela=invCount('sela')>0,podeAlf=invCount('alforjes')>0,cheio=(h.carga||[]).filter(Boolean).length;
    let c='<div class="es-lista">'+cavMedidor('Vida',h.hp/h.hpMax,Math.round(h.hp)+' de '+Math.round(h.hpMax)+(h.hp<h.hpMax?' · sara devagar alimentado':''))+
      cavMedidor('Fome',1-h.fome/100,h.fome>85?'faminto':h.fome>60?'com fome':h.fome>30?'satisfeito':'bem alimentado')+
      cavMedidor('Fôlego',h.folego/100,Math.round(h.folego)+'%'+(h.folego<20?' · deixe descansar':''))+
      cavMedidor('Vínculo',h.vinculo,Math.round(h.vinculo*100)+'% · ouve o assobio a '+Math.round(70+170*h.vinculo)+' m')+
      cavMedidor(h.ferr>0?'Ferraduras':'Cascos',h.ferr>0?h.ferr/100:h.casco/100,h.ferr>0?'ferrado · '+Math.round(h.ferr)+'%':cavaloMancando(h)?'gastos: está mancando':Math.round(h.casco)+'%'+(h.casco<70?' · evite asfalto':''))+'</div>';
    const eq=[['Cabresto',true],['Sela',h.sela],['Alforjes',h.alforjes],['Ferraduras',h.ferr>0]].map(([n,t])=>(t?'✓ ':'· ')+n).join(' &nbsp; ');
    c+='<p class="es-info">'+eq+'<br>'+(h.modo==='segue'?'Seguindo você.':h.modo==='amarrado'?'Amarrado no poste.':'Esperando aqui.')+(h.alforjes?' Carga: '+cheio+' de '+CAV.carga+'.':'')+'</p>';
    const A=[{id:'montar',t:'Montar',s:'toque E perto dele também',prim:true},
      {id:'comer',t:'Dar comida',s:fd?cavNomeItem(fd)+' (tem '+invCount(fd)+')':'feno, milho, abóbora, cenoura, maçã ou frutas',ok:!!fd&&h.fome>2},
      {id:'escovar',t:'Escovar',s:esc?(G.tm-h.escT<120?'escovado há pouco':'+ vínculo, sara mais rápido'):'precisa de uma escova',ok:esc&&G.tm-h.escT>=120},
      {id:'curar',t:'Tratar ferida',s:invCount('bandagem')?'1 bandagem · +60 de vida':'precisa de bandagem',ok:invCount('bandagem')>0&&h.hp<h.hpMax}];
    if(h.sela)A.push({id:'tiraSela',t:'Tirar a sela',s:h.alforjes?'tire os alforjes antes':'volta para a mochila',ok:!h.alforjes});else A.push({id:'poeSela',t:'Pôr a sela',s:podeSela?'deixa galopar':'faça na estação de couro',ok:podeSela});
    if(h.alforjes){A.push({id:'carga',t:'Abrir os alforjes',s:cheio+' de '+CAV.carga+' espaços'});A.push({id:'tiraAlf',t:'Tirar os alforjes',s:cheio?'esvazie antes':'volta para a mochila',ok:!cheio});}
    else A.push({id:'poeAlf',t:'Pôr os alforjes',s:!h.sela?'precisa da sela':podeAlf?'10 espaços de carga':'faça na estação de couro',ok:h.sela&&podeAlf});
    A.push({id:'ferrar',t:'Ferrar',s:invCount('ferraduras')?'1 jogo de ferraduras':'ferraduras se fazem na forja',ok:invCount('ferraduras')>0&&h.ferr<60});
    const pt=postePerto(h);
    if(h.modo==='segue'){A.push({id:'fica',t:pt?'Amarrar no poste':'Esperar aqui',s:pt?'fica pastando em volta do poste':'fica por perto, pastando'});}
    else A.push({id:'segue',t:'Seguir você',s:'vem atrás quando você anda'});
    A.push({id:'soltar',t:h.soltarConf?'Confirmar: soltar':'Soltar na natureza',s:h.soltarConf?'toque de novo para soltar '+h.nome:'ele volta a ser selvagem',ok:!h.alforjes&&!h.sela});
    return{sub:'Cavalo '+CAV_PELO[h.var||'']+' · domado',corpo:c,acoes:A};},
  acao(h,id){if(id!=='soltar')h.soltarConf=false;
    switch(id){
      case'montar':fecharEstacao();montar(h);return'';
      case'comer':{const f=comidaCavalo(CAV.ordemDar);if(!f)return'Sem comida de cavalo na mochila';invRemove(f,1);h.fome=Math.max(0,h.fome-CAV.comida[f].fome);h.vinculo=Math.min(1,h.vinculo+0.02);sfx('cavaloCome',h.x,h.z,0.7);return h.nome+' comeu '+cavNomeItem(f);}
      case'escovar':{const s=P.inv.find(q=>q&&q.id==='escova');if(!s)return'Precisa de uma escova';gastar(s,1);h.escT=G.tm;h.vinculo=Math.min(1,h.vinculo+0.08);sfx('escovar',h.x,h.z,0.7);return h.nome+' gostou · vínculo '+Math.round(h.vinculo*100)+'%';}
      case'curar':if(!invRemove('bandagem',1))return'Precisa de bandagem';h.hp=Math.min(h.hpMax,h.hp+60);h.vinculo=Math.min(1,h.vinculo+0.03);return'Ferida tratada';
      case'poeSela':if(!invRemove('sela',1))return'Sem sela na mochila';h.sela=true;sfx('montar',h.x,h.z,0.6);return'Sela posta: agora dá para galopar (Shift)';
      case'tiraSela':if(h.alforjes)return'Tire os alforjes antes';if(invAdd('sela',1))return'Mochila cheia';h.sela=false;return'Sela na mochila';
      case'poeAlf':if(!h.sela)return'Os alforjes vão presos na sela';if(!invRemove('alforjes',1))return'Sem alforjes na mochila';h.alforjes=true;return'Alforjes postos: 10 espaços de carga';
      case'tiraAlf':if((h.carga||[]).some(Boolean))return'Esvazie os alforjes antes';if(invAdd('alforjes',1))return'Mochila cheia';h.alforjes=false;return'Alforjes na mochila';
      case'carga':fecharEstacao();abrirBau({itens:h.carga,nome:'Alforjes de '+h.nome,alforje:h});return'';
      case'ferrar':if(!invRemove('ferraduras',1))return'Sem ferraduras';h.ferr=100;h.casco=Math.max(h.casco,60);h.ferrAviso=true;sfx('construir',h.x,h.z,0.7);return h.nome+' ferrado: o asfalto não gasta mais os cascos';
      case'fica':{const pt=postePerto(h);if(pt){h.modo='amarrado';h.fx=pt.x+Math.sin(pt.yaw)*0.9;h.fz=pt.z+Math.cos(pt.yaw)*0.9;return h.nome+' amarrado no poste';}h.modo='fica';h.fx=h.x;h.fz=h.z;return h.nome+' vai esperar aqui';}
      case'segue':h.modo='segue';h.chamado=false;return h.nome+' vai seguir você';
      case'soltar':if(h.sela||h.alforjes)return'Tire a sela e os alforjes antes';if(!h.soltarConf){h.soltarConf=true;return'Toque de novo para confirmar';}
        soltarCavalo(h);fecharEstacao();return'';}
    return'';}};
function soltarCavalo(h){const i=CAVALOS.indexOf(h);if(i>=0)CAVALOS.splice(i,1);for(const s of h.carga||[])if(s)soltarItens([[s.id,s.n,exDe(s)]],h.x,h.z);
  h.domado=false;h.conf=0.3;h.zona=zonaEm(h.x,h.z)?zonaEm(h.x,h.z).id:null;h.st='explora';h.t=3;h.nome=undefined;h.estTipo=undefined;
  feed('Você soltou o cavalo. Ele volta para o bando.');if(typeof diarioEvento==='function')diarioEvento('Soltou um cavalo na natureza','caca');}
/* o painel da mochila mostra "Alforjes" no lugar de "Baú" */
{const _br=bauRender;bauRender=function(){_br.apply(this,arguments);const B=bauAberto;if(!B||!B.alforje)return;const el=$('aba-bau-t');if(el)el.textContent='Alforjes';};}

/* ---------- construções: poste de amarrar e cocho (aba Animais) ---------- */
Object.assign(OBRAS,{
  posteAmarrar:{nome:'Poste de amarrar',icon:'i-poste-amarrar',custo:{madeira:3,corda:1},hp:120,hw:0.12,hd:0.12,solid:true,hCol:1.3,peq:true,
    desc:'Para amarrar o cavalo: no painel dele, "Amarrar no poste". Amarrado, fica pastando em volta e não foge de zumbi.'},
  cocho:{nome:'Cocho',icon:'i-cocho',custo:{tabuas:3,pregos:2},hp:120,hw:0.85,hd:0.32,solid:true,hCol:0.9,bau:true,
    desc:'Ponha feno, milho, frutas e outras comidas (E). Cavalo esperando ou amarrado perto come sozinho do cocho quando tem fome.'}});
{const tab={id:'animais',nome:'Animais',ico:'i-cavalo',t:['posteAmarrar','cocho']};const pl=OBRA_CATS.find(c=>c.id==='plantio');OBRA_CATS.splice(pl?OBRA_CATS.indexOf(pl)+1:OBRA_CATS.length,0,tab);
  for(const k of tab.t){if(!OBRA_ORDEM.includes(k))OBRA_ORDEM.push(k);if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);}}
{const _ti=textoInter;textoInter=function(a){if(a&&a.k==='guarda'&&a.o&&a.o.tipo==='cocho'){const n=a.o.itens.filter(s=>s&&CAV.comida[s.id]).reduce((t,s)=>t+s.n,0);return{t:'Cocho',s:n?n+' porç'+(n>1?'ões':'ão')+' de comida de cavalo':'vazio: ponha feno, milho ou frutas'};}return _ti.apply(this,arguments);};}
INIT_MALHAS.push(function cavObrasMalhas(){const R=rng(1414),mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());},O=MESH.obra;
  const mad=lin(0x7a5a3a),mad2=lin(0x5e4329),corda=lin(0xb9a77a);
  O.posteAmarrar=mk(g=>{add(g,cylTris(0.07,0.08,1.25,8),mat(0,0,0),mad,{j:0.05,rnd:R});add(g,cylTris(0.075,0.075,0.04,8),mat(0,1.25,0),mad2,{j:0.05,rnd:R});
    add(g,cylTris(0.082,0.082,0.07,10,{top:false}),mat(0,0.95,0),corda,{j:0.05,rnd:R});add(g,cylTris(0.018,0.018,0.5,5),mat(0.06,0.95,0.02,0,0,2.7),corda,{j:0.05,rnd:R});});
  O.cocho=mk(g=>{add(g,boxTris(1.7,0.06,0.6),mat(0,0.5,0),mad,{j:0.05,rnd:R});for(const s of[1,-1]){add(g,boxTris(1.7,0.3,0.05),mat(0,0.68,s*0.29,s*0.12,0,0),mad,{j:0.05,rnd:R});
      add(g,boxTris(0.05,0.32,0.62),mat(s*0.83,0.68,0),mad2,{j:0.05,rnd:R});for(const t of[1,-1])add(g,boxTris(0.08,0.5,0.08),mat(s*0.7,0.25,t*0.22),mad2,{j:0.05,rnd:R});}});});
{const _dob=desenharObra;desenharObra=function(Pg,o){const r=_dob.apply(this,arguments);if(o&&o.tipo==='cocho'&&o.itens&&MESH.cavFeno){const n=o.itens.filter(s=>s&&CAV.comida[s.id]).reduce((t,s)=>t+s.n,0);
    if(n>0)drawStat(Pg,MESH.cavFeno,mat(o.x,o.y+0.53+Math.min(0.12,n*0.012),o.z,0,o.yaw,0));}return r;};}

/* ---------- arreios: sela, manta, alforjes e cabresto desenhados presos aos ossos do cavalo ---------- */
function cavSuperficie(F,t0,t1,a0,a1,fora,nt,na){const T=[],P2=(t,a)=>{const p=corpoPonto(F,t,a,fora);return[p[0],p[1],p[2]];};
  for(let i=0;i<nt;i++)for(let j=0;j<na;j++){const ta=lerp(t0,t1,i/nt),tb=lerp(t0,t1,(i+1)/nt),aa=lerp(a0,a1,j/na),ab=lerp(a0,a1,(j+1)/na);
    const A=P2(ta,aa),B=P2(tb,aa),C=P2(tb,ab),D=P2(ta,ab);T.push([A,C,B],[A,D,C]);}return T;}
INIT_MALHAS.push(function cavArreios(){const F=FAUNA_FORMA.cavalo,R=rng(1515),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},cb=F.cab;
  const couro=lin(0x5a3a22),couro2=lin(0x6e4a2c),manta=lin(0x8c3a2a),manta2=lin(0x2f4a6a),metal=lin(0x9a9a92),corda=lin(0xb9a77a),PI=Math.PI;
  MESH.cavSela=mk(g=>{add(g,cavSuperficie(F,0.36,0.76,PI-1.05,PI+1.05,0.012,6,10),ID,manta,{j:0.03,rnd:R});
    add(g,cavSuperficie(F,0.36,0.76,PI-1.06,PI-0.98,0.014,6,1),ID,manta2,{j:0.02,rnd:R});add(g,cavSuperficie(F,0.36,0.76,PI+0.98,PI+1.06,0.014,6,1),ID,manta2,{j:0.02,rnd:R});
    add(g,cavSuperficie(F,0.42,0.7,PI-0.62,PI+0.62,0.045,6,8),ID,couro,{j:0.04,rnd:R});
    add(g,cavSuperficie(F,0.45,0.66,PI-1.35,PI-0.62,0.03,4,4),ID,couro2,{j:0.04,rnd:R});add(g,cavSuperficie(F,0.45,0.66,PI+0.62,PI+1.35,0.03,4,4),ID,couro2,{j:0.04,rnd:R});
    const top=corpoPonto(F,0.69,PI,0.045),tras=corpoPonto(F,0.42,PI,0.045);
    add(g,cylTris(0.028,0.04,0.1,8),mat(top[0],top[1],top[2],0.35,0,0),couro,{j:0.04,rnd:R});add(g,ellipTris(0.15,0.055,0.04,10,6),mat(tras[0],tras[1]+0.035,tras[2]),couro,{j:0.04,rnd:R});
    add(g,cavSuperficie(F,0.58,0.615,0,2*PI,0.006,1,20),ID,couro2,{j:0.02,rnd:R});
    for(const s of[1,-1]){const p=corpoPonto(F,0.58,PI+s*1.45,0.04);add(g,boxTris(0.02,0.36,0.035),mat(p[0],p[1]-0.18,p[2]),couro,{j:0.03,rnd:R});
      add(g,boxTris(0.09,0.02,0.06),mat(p[0]+s*0.02,p[1]-0.37,p[2]),metal,{j:0.03,rnd:R});add(g,boxTris(0.012,0.06,0.06),mat(p[0]+s*0.065,p[1]-0.34,p[2]),metal,{j:0.03,rnd:R});
      add(g,boxTris(0.012,0.06,0.06),mat(p[0]-s*0.025,p[1]-0.34,p[2]),metal,{j:0.03,rnd:R});}});
  MESH.cavAlforjes=mk(g=>{for(const s of[1,-1]){const p=corpoPonto(F,0.27,PI+s*1.42,0.07);add(g,bvTris(0.1,0.3,0.36),mat(p[0],p[1]-0.06,p[2]),couro2,{j:0.04,rnd:R});
      add(g,bvTris(0.11,0.12,0.37),mat(p[0]+s*0.005,p[1]+0.06,p[2]),couro,{j:0.04,rnd:R});add(g,boxTris(0.115,0.03,0.03),mat(p[0]+s*0.006,p[1]-0.0,p[2]+0.09),metal,{j:0.02,rnd:R});
      add(g,boxTris(0.115,0.03,0.03),mat(p[0]+s*0.006,p[1]-0.0,p[2]-0.09),metal,{j:0.02,rnd:R});}
    add(g,cavSuperficie(F,0.22,0.33,PI-1.42,PI+1.42,0.02,2,8),ID,couro,{j:0.03,rnd:R});});
  const HM=mat(0,0,0,cb.ang,0,0),hm=m=>mm(HM,m);
  MESH.cavCabresto=mk(g=>{add(g,cylTris(cb.focW*1.32,cb.focW*1.36,0.035,12,{top:false}),hm(mat(0,-cb.h*0.12,cb.len*0.3+cb.foc*0.42,PI/2,0,0,1,1,cb.focH/cb.focW*1.04)),couro,{j:0.02,rnd:R});
    add(g,cylTris(1,1,0.032,14,{top:false}),hm(mat(0,0,-cb.len*0.1,PI/2,0,0,cb.w*0.57,1,cb.h*0.56)),couro,{j:0.02,rnd:R});
    for(const s of[1,-1])add(g,boxTris(0.012,0.03,cb.len*0.42),hm(mat(s*cb.w*0.47,-cb.h*0.04,cb.len*0.15,0.22,s*0.05,0)),couro,{j:0.02,rnd:R});
    add(g,cylTris(0.025,0.025,0.03,8),hm(mat(0,-cb.h*0.12-cb.focH*1.3,cb.len*0.3+cb.foc*0.42)),metal,{j:0.02,rnd:R});});
  MESH.cavFeno=mk(g=>{for(let i=0;i<14;i++)add(g,boxTris(0.06+R()*0.08,0.03,0.2+R()*0.2),mat((R()-0.5)*1.3,R()*0.06,(R()-0.5)*0.35,0,R()*3,0),lin(R()<0.5?0xc9b46a:0xb39a52),{j:0.08,rnd:R});});});
DESENHO.opaco.push(function cavArreiosDesenho(Pg){if(!MESH.cavSela)return;for(const h of CAVALOS){if(!h.vivo||!h.ch.vis||d2(h.x,h.z,P.x,P.z)>78*78)continue;
  const M0=h.ch.m.subarray(0,16),M2=h.ch.m.subarray(32,48);drawStat(Pg,MESH.cavCabresto,M2);if(h.sela)drawStat(Pg,MESH.cavSela,M0);if(h.alforjes)drawStat(Pg,MESH.cavAlforjes,M0);}});
DESENHO.sombra.push(function cavArreiosSombra(Pg,perto){if(!MESH.cavSela)return;for(const h of CAVALOS){if(!h.vivo||!h.ch.vis||!h.sela||d2(h.x,h.z,P.x,P.z)>(perto?40:78)**2)continue;drawStat(Pg,MESH.cavSela,h.ch.m.subarray(0,16));}});

/* ---------- minimapa: os seus cavalos (marrom claro) ---------- */
MAPA_DESENHOS.push((g,X,Y,k,n,range)=>{for(const h of CAVALOS){if(!h.vivo||P.montado===h)continue;g.fillStyle='#e0b070';g.strokeStyle='#2a1a0e';g.lineWidth=1;g.beginPath();g.arc(X(h.x),Y(h.z),3,0,Math.PI*2);g.fill();g.stroke();}});

/* ---------- salvar e carregar ---------- */
const CAV_CAMPOS=['hid','nome','fome','folego','vinculo','casco','ferr','sela','alforjes','modo','fx','fz','escT','hp','hpMax'];
V8.novo.cavalos=()=>{CAVALOS.length=0;CAV_ID=0;if(P.montado)P.montado=null;};
V8.salvar.cavalos=()=>({id:CAV_ID,L:CAVALOS.filter(h=>h.vivo).map(h=>{const o={v:h.var||'',s:+h.ch.s.toFixed(3),x:+h.x.toFixed(2),z:+h.z.toFixed(2),yaw:+h.yaw.toFixed(2),carga:h.carga};
  for(const k of CAV_CAMPOS)o[k]=typeof h[k]==='number'?Math.round(h[k]*1000)/1000:h[k];return o;})});
V8.carregar.cavalos=s=>{CAVALOS.length=0;P.montado=null;CAV_ID=s&&s.id||0;for(const c of(s&&s.L)||[]){const b=criarBicho('cavalo',c.x,c.z,{var:c.v||'',varFixa:true,s:c.s,yaw:c.yaw});if(!b)continue;
  for(const k of CAV_CAMPOS)if(c[k]!==undefined)b[k]=c[k];b.domado=true;b.zona=null;b.lider=null;b.conf=1;b.tmUlt=G.tm;b.st='explora';b.t=2;b.v=0;
  b.carga=Array.isArray(c.carga)?c.carga.slice(0,CAV.carga):[];while(b.carga.length<CAV.carga)b.carga.push(null);if(b.modo==='segue'){b.modo='fica';b.fx=b.x;b.fz=b.z;}
  CAVALOS.push(b);CAV_ID=Math.max(CAV_ID,b.hid||0);}};

/* ---------- manual: seção Criação de animais e o guia do cavalo ---------- */
{const _ms=mnSecReceita;mnSecReceita=function(r){if(r.cat==='animais')return'animais';return _ms.apply(this,arguments);};
 const _mo=mnSecObra;mnSecObra=function(k,tab){if(k==='posteAmarrar'||k==='cocho'||k==='poleiro')return'animais';return _mo.apply(this,arguments);};}
MANUAL_EXTRA.push(()=>[{id:'x:cavalo',sec:'animais',nome:'Cavalo: domar, montar e cuidar',icon:'i-cavalo',trav:false,como:'desde o começo',
  desc:'Cavalos selvagens vivem em bando nos Pastos da Fazenda, nos Campos do Leste e no campo da beira do lago.',
  ing:{},est:{nome:'Onde: nos campos abertos',icon:'i-cavalo',onde:''},ferr:['Cabresto (2 cordas) para domar; sela para galopar; alforjes para carga'],
  proc:['Chegue agachado e devagar, com comida de cavalo na mochila (maçã e cenoura são as preferidas; feno, milho, abóbora e frutas também servem).',
    'Perto dele, segure E para oferecer na mão. Cada comida sobe a confiança; de pé ou correndo, o bando foge.',
    'Com a confiança cheia e um cabresto na mochila, segure E: o cavalo é seu e ganha um nome.',
    'Toque E perto dele para montar. W/A/S/D levam para onde a câmera olha; C anda a passo; Shift galopa (só com sela); E desce.',
    'Segure E perto dele para o painel: comida, escova, bandagem, sela, alforjes, ferraduras, seguir ou esperar, soltar.',
    'Assobie (X, ou segure LB no controle) para chamar: quanto maior o vínculo, de mais longe ele vem.'],
  res:null,obs:['A galope ele cansa (fôlego) e faz barulho, mas derruba zumbi no caminho.','Parado na grama, pasta sozinho. Esperando ou amarrado perto de um cocho com comida, come do cocho.',
    'Sem ferradura, o asfalto gasta os cascos; com os cascos gastos ele manca e não galopa (os cascos voltam devagar na grama).',
    'Zumbi que acerta você montado acerta o cavalo também; muito ferido, ele se assusta e te derruba.',
    'Carro e moto continuam mais rápidos e levam mais; o cavalo não gasta gasolina e passa pela mata.'],tipo:'Guia'}]);

/* ---------- ajuda (Como jogar): assobio e o parágrafo dos animais ---------- */
{const aj=document.querySelector('#t-ajuda .ajuda');if(aj&&!aj.querySelector('[data-e14]'))aj.insertAdjacentHTML('beforeend','<kbd data-e14>X</kbd><span>Assobiar: chama o seu cavalo e o gavião (no controle, segure LB).</span>');
 const p=[...document.querySelectorAll('#t-ajuda .cartao p')].find(q=>q.textContent.includes('cachorro caramelo'));
 if(p&&!document.querySelector('#t-ajuda [data-e14p]'))p.insertAdjacentHTML('afterend','<p data-e14p>Nos campos abertos vivem cavalos selvagens. Chegue agachado, com maçã, cenoura, milho, feno ou frutas, e segure E para dar na mão; com a confiança cheia e um cabresto, ele é seu. Toque E para montar e E para descer; Shift galopa (com sela). Alforjes levam carga. Gaviões planam nos campos: com a luva de falcoaria na mão e carne crua, segure E e ele desce na luva; domado, vigia você e a base. No rio e no lago mordem dez espécies de peixe, cada uma com seu tamanho.</p>');}

/* ---------- pose do cavalo pastando: pescoço bem baixo e a cabeça em pé, o focinho chega no capim ---------- */
{const _fpz=faunaPose;faunaPose=function(b,S,dt){_fpz.apply(this,arguments);if(b.tipo!=='cavalo'||b.st!=='come'||(b.v||0)>=0.2||b.st==='morto')return;const o=b.ch.r,t=G.t+b.id*1.7;
  S3(o,1,1.85+Math.sin(t*0.7)*0.05,Math.sin(t*0.3)*0.08,0);S3(o,2,-1.15+Math.sin(t*5)*0.06,0,0);};}

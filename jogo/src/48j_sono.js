/* ================= sono e cansaço, água suja e fervida, fogueira que cozinha e dor de barriga =================
   sono: cai devagar acordado (mais rápido correndo); abaixo de 35 a energia enche mais devagar; abaixo de 15 você
     anda mais devagar e cochila de pé (a tela apaga); em 0 a vida cai. Dorme na barraca, numa cama ou no saco de dormir:
     o tempo passa rápido, mas zumbi chegando perto, dano ou barulho te acordam.
   água: rio e lago dão água suja. Ferva na fogueira ou use pastilha de cloro. Suja pode dar dor de barriga
     (sede e fome caem mais rápido, vômito). Remédio cura. Café espanta o sono. */
iconesNovos({
  'i-agua-suja':'<path d="M10 2.8h4v2.8l2 2.8V20a1.2 1.2 0 0 1-1.2 1.2H9.2A1.2 1.2 0 0 1 8 20V8.4l2-2.8z"/><path d="M8 12.2h8"/><path d="M10 15.5h.01M13.5 17.2h.01M11.6 18.6h.01" stroke-width="2.4"/>',
  'i-pastilha':'<rect x="4" y="8" width="16" height="8" rx="4"/><path d="M12 8v8"/>',
  'i-cafe':'<path d="M6 8h10v8a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 3.5c0 1.2 1 1.4 1 2.6M12.5 3.5c0 1.2 1 1.4 1 2.6"/>',
  'i-saco':'<path d="M4 15.5c0-3 2.2-5 5-5h8.5a2.5 2.5 0 0 1 2.5 2.5v5.5H4z"/><path d="M4 18.5v-3M9 10.5c0 2 1 3.2 2.8 3.2"/><circle cx="7" cy="13.3" r="1.6"/>',
  'i-zzz':'<path d="M4 6h5l-5 6h5M12 4h4l-4 5h4M15 13h5l-5 7h5"/>',
  'i-barriga':'<path d="M7 4v4.5a5 5 0 0 0 10 0V4"/><path d="M12 13.5V20M9 17h6"/><path d="M10 8.5c.8.8 3.2.8 4 0"/>'});
Object.assign(ITEMS,{
  aguaSuja:{nome:'Água suja',icon:'i-agua-suja',max:6,tipo:'bebida',sede:30,vira:'garrafa',suja:0.45,desc:'Do rio ou do lago. Ferva na fogueira ou ponha uma pastilha de cloro. Bebida assim pode dar dor de barriga.'},
  pastilha:{nome:'Pastilha de cloro',icon:'i-pastilha',max:12,tipo:'util',acao:'Purificar água',desc:'Cada pastilha deixa uma garrafa de água suja boa para beber.'},
  cafe:{nome:'Lata de café',icon:'i-cafe',max:6,tipo:'bebida',sede:8,sono:22,energia:25,desc:'Café frio de lata. Espanta o sono por um tempo.'},
  sacoDormir:{nome:'Saco de dormir',icon:'i-saco',max:1,tipo:'util',acao:'Dormir aqui',desc:'Dá para dormir em qualquer lugar. Longe de uma base é arriscado: zumbis e barulho te acordam.'}});
ITEMS.remedios.acao='Tomar remédio';ITEMS.remedios.acaoExtra=true;
RECIPES.push({faz:'sacoDormir',n:1,custo:{pano:6,corda:2,couro:1},alt:{couro:['la',3]},cat:'roupas',etapa:2,est:1});
for(const[t,e]of[['casa',['cafe',1,1,0.2]],['casa',['pastilha',1,2,0.15]],['mercado',['cafe',1,2,0.3]],['farmacia',['pastilha',2,4,0.5]],['suprimentos',['pastilha',2,3,0.4]],['militar',['pastilha',2,4,0.35]],['militar',['cafe',1,2,0.3]],['oficina',['cafe',1,1,0.15]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['ap_cozinha',['cafe',.2,1,1]],['conveniencia',['cafe',.3,1,2]],['hosp_deposito',['pastilha',.4,2,3]],['estoque',['pastilha',.2,1,2]],['mercado',['cafe',.25,1,2]],['porao',['pastilha',.2,1,2]],['escritorio',['cafe',.2,1,1]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
for(const t of['suprimentos','escondida'])if(typeof CAIXA_LOOT!=='undefined'&&CAIXA_LOOT[t])CAIXA_LOOT[t].push(['pastilha',.06,1,2]);
const SONO_CFG={queda:0.068,noite:7,cochilo:3,turbo:10,perto:14};
/* ---------- fogueira: assa carne e peixe, ferve água ---------- */
const COZINHA=[{de:'carneCrua',para:'carneAssada',n1:'carne',nn:'carnes',xp:3,assa:true},{de:'peixeCru',para:'peixeAssado',n1:'peixe',nn:'peixes',xp:3,assa:true},{de:'aguaSuja',para:'agua',n1:'garrafa fervida',nn:'garrafas fervidas',xp:1}];
function temCozinhar(){for(const c of COZINHA)if(ITEMS[c.de]&&invCount(c.de))return true;return cantisSujos().length>0;}
function cozinharTexto(){const p=[];for(const c of COZINHA){const n=ITEMS[c.de]?invCount(c.de):0;if(n)p.push(n+' '+(c.assa?(n>1?c.nn:c.n1):(n>1?'águas':'água')));}
  {const k=cantisSujos().length;if(k)p.push(k>1?k+' cantis':'cantil');}
  const so=p.every(x=>/água|cantil/.test(x));return{t:(so?'Ferver água':'Cozinhar')+' ('+p.join(', ')+')',s:'segure: a fogueira assa a comida e ferve a água suja',hold:true};}
function cozinhar(){let tot=0,assou=0;const msg=[];
  {const k=cantisFerver();if(k){tot+=k;msg.push(k>1?k+' cantis':'o cantil');ganharXP(k);}}
  for(const c of COZINHA){if(!ITEMS[c.de])continue;const n=invCount(c.de);if(!n)continue;invRemove(c.de,n);const left=invAdd(c.para,n);if(left)soltarItens([[c.para,left]],P.x,P.z,P.y);
    tot+=n;if(c.assa)assou+=n;msg.push(n+' '+(n>1?c.nn:c.n1));ganharXP(c.xp*n);}
  if(!tot)return;feed((assou?'Cozinhou: ':'Ferveu: ')+msg.join(', '));sfx('pegar');if(assou)progresso('assar',assou);if(typeof diarioConta==='function')diarioConta('cozinhou',tot);hudBarra();invRender();}
/* ---------- efeitos ao beber e comer ---------- */
USO_EXTRA.push((id,d)=>{if(d.sono)P.sono=clamp((P.sono??100)+d.sono,0,100);
  if(d.suja&&Math.random()<d.suja*(cfg.dif==='facil'?0.6:1)){P.intox=Math.max(P.intox||0,200+Math.random()*120);setTimeout(()=>toast('corpo','A água suja te deu dor de barriga: sede e fome vão cair mais rápido por um tempo. Remédio resolve. Da próxima vez, ferva na fogueira ou use pastilha de cloro.'),600);}});
UTIL_ACOES.pastilha=i=>{if(!invCount('aguaSuja')){const cs=cantisSujos()[0];if(cs){cs.mun=0;gastarUm(i);sfx('pegar');feed('Purificou a água do cantil');return;}feed('Precisa de uma garrafa de água suja ou de um cantil com água suja',true);return false;}invRemove('aguaSuja',1);const l=invAdd('agua',1);if(l)soltarItens([['agua',l]],P.x,P.z,P.y);gastarUm(i);sfx('pegar');feed('Purificou uma garrafa de água');};
UTIL_ACOES.remedios=i=>{if(!(P.intox>0)){feed('Você não está doente: guarde o remédio',true);return false;}P.intox=0;gastarUm(i);sfx('pegar');feed('O remédio fez efeito: a dor de barriga passou');hudSono(true);};
UTIL_ACOES.sacoDormir=()=>{sonoComecar({saco:true,x:P.x,y:P.y,z:P.z});return false;};
/* ---------- sono ---------- */
let sonoMicroT=30,sonoDicaT=0,vomitoT=40;
const sonoRegen=()=>{const s=P.sono??100;return s>=35?1:lerp(0.55,1,s/35);};
const sonoVel=()=>{const s=P.sono??100;return s<15?0.9:1;};
function updateSono(dt){if(G.modo!=='jogo'||!P.alive)return;if(P.sono===undefined)P.sono=100;
  if(G.dormindo){updateDormindo(dt);return;}
  const df=DIF[cfg.dif];let k=SONO_CFG.queda*(df.fome||1)*(1+0.35*(P.runK||0));if(CARRO.ativo)k*=0.85;P.sono=Math.max(0,P.sono-k*dt);
  if(P.sono<35&&!G.dicas.sono){G.dicas.sono=1;toast('corpo','Você está ficando com sono: a energia enche mais devagar. Durma na barraca, numa cama ou num saco de dormir (segure E na cama).');}
  if(P.sono>50)G.dicas.sono=0;
  if(P.sono<15){sonoMicroT-=dt;if(sonoMicroT<=0){sonoMicroT=(P.sono<=0?14:32)+Math.random()*20;if(typeof apagao==='function')apagao();feed('Você cochilou de pé...',true);P.vx*=0.2;P.vz*=0.2;
      if(!G.dicas.exausto){G.dicas.exausto=1;toast('corpo','Exausto! Você anda mais devagar e apaga de pé. Se o sono chegar a zero, a vida começa a cair.');}}}
  if(P.sono<=0){P.vida-=0.18*dt;if(P.vida<=0)morrer();}
  // dor de barriga
  if(P.intox>0){P.intox-=dt;P.sede=Math.max(0,P.sede-0.13*dt);P.fome=Math.max(0,P.fome-0.05*dt);vomitoT-=dt;
    if(vomitoT<=0){vomitoT=35+Math.random()*30;P.sede=Math.max(0,P.sede-7);P.energia=Math.max(0,P.energia-25);P.vida=Math.max(1,P.vida-2);sfx('dor');feed('Você vomitou',true);P.shake=Math.max(P.shake,0.3);barulho(P.x,P.z,8,true,P.y);}
    if(P.intox<=0){P.intox=0;feed('A dor de barriga passou');}}}
/* lugares para dormir: a barraca da clareira, camas construídas e o saco de dormir */
const sonoNoite=()=>G.hora>=18||G.hora<5;
function sonoPodeDormir(lugar){if(!P.alive||CARRO.ativo)return'Agora não dá';if(P.nada)return'Não dá para dormir na água';
  if((P.sono??100)>85&&!(sonoNoite()&&lugar&&(lugar.cama||lugar.barraca||lugar.saco)))return'Ainda sem sono. Na barraca ou na cama dá para dormir quando escurecer (depois das 18h).';
  for(const z of Z)if(z.vivo&&(z.st==='caca'||z.st==='golpe')&&Math.hypot(z.x-P.x,z.z-P.z)<30)return'Tem zumbi atrás de você: não dá para dormir';
  if(P.lesoes&&P.lesoes.sangra>0)return'Você está sangrando: faça um curativo antes';return null;}
function sonoComecar(lugar){const nao=sonoPodeDormir(lugar);if(nao){feed(nao,true);toast('corpo',nao);return;}
  const h=G.hora,noite=h>=18||h<5,horas=noite?(6.4-h+24)%24:SONO_CFG.cochilo,k=lugar.saco?0.85:1;
  G.dormindo={fim:(G.tm||0)+horas*60,ini:h,k:SONO_CFG.turbo,taxa:100/SONO_CFG.noite*k,lugar,t:0,vida0:P.vida,noite};P.dorme=true;P.acao=null;P.vx=P.vz=0;IN.attack=false;
  if(lugar.cama||lugar.barraca){salvarJogo();}const el=$('tela-sono');if(el){el.hidden=false;el.classList.remove('sai');}
  sfx('clique');if(typeof diarioEvento==='function')diarioEvento('Dormiu '+(lugar.saco?'no saco de dormir':lugar.barraca?'na barraca':'numa cama')+' às '+fmtHora(h));}
function updateDormindo(dt){const d=G.dormindo;d.t+=dt;const prev=G.hora;
  P.sono=Math.min(100,P.sono+d.taxa*dt/((G.hora>=6&&G.hora<20)?30:24));   // a taxa é por hora de jogo
  // fome e sede caem pela metade dormindo (sobreviver roda no passo do jogador)
  const el=$('tela-sono-h');if(el)el.textContent=fmtHora(G.hora);
  let motivo=null;
  if(P.vida<d.vida0-0.5)motivo='Você acordou com um ataque!';
  else for(const z of Z){if(!z.vivo)continue;const dz=Math.hypot(z.x-P.x,z.z-P.z);if(dz<SONO_CFG.perto&&(z.st==='caca'||z.st==='golpe'||z.st==='quebra'||dz<6)){motivo='Barulho lá fora! Você acordou: tem zumbi por perto.';break;}}
  if(!motivo&&(G.chuvaForte||0)>0.8&&Math.random()<dt*0.004)motivo='Um trovão te acordou.';
  const chegou=(G.tm||0)>=d.fim||(!d.noite&&P.sono>=99.5);
  if(motivo||chegou||P.fome<=2||P.sede<=2)sonoAcordar(motivo||(P.fome<=2||P.sede<=2?'A fome e a sede te acordaram.':null));}
function sonoAcordar(motivo){const d=G.dormindo;if(!d)return;const manual=motivo==='__manual';if(manual)motivo=null;G.dormindo=null;P.dorme=false;const el=$('tela-sono');if(el){el.classList.add('sai');setTimeout(()=>{el.hidden=true;},400);}
  P.vida=Math.min(vidaMax(),P.vida+(motivo||manual?0:8));hudSono(true);
  if(manual){feed('Você levantou');}else if(motivo){toast('alerta',motivo);sfx('coracao');}else{toast('corpo',d.noite?'Bom dia. Você dormiu a noite e acordou descansado.':'Você tirou um cochilo e acordou melhor.');ganharXP(10);progresso('dormir');}
  if(typeof diarioConta==='function')diarioConta('dormiu',1);if(!motivo&&(d.lugar.cama||d.lugar.barraca))salvarJogo();}
/* pose deitada enquanto dorme (o personagem continua no lugar) */
function poseDormindo(){const ch=P.ch;ch.x=P.x;ch.z=P.z;ch.y=P.y+0.12;ch.pitch=-1.45;P.amp=0;}
function camaBarraca(){salvarJogo();P.vida=Math.min(vidaMax(),P.vida+5);toast('corpo','Jogo salvo. Se cair, você acorda aqui na barraca. Para dormir, segure E.');}
/* ---------- HUD ---------- */
let sonoHudT=0;
function hudSono(forca){sonoHudT-=forca?1e9:0.016;if(sonoHudT>0&&!forca)return;sonoHudT=0.3;const c=$('vx-intox');if(c)c.hidden=!(P.intox>0);}
HUDS.push(()=>hudSono(false));
PASSOS.push(updateSono);
V8.novo.sono=()=>{P.sono=100;P.intox=0;P.dorme=false;G.dormindo=null;};
V8.salvar.sono=()=>({sono:+(P.sono??100).toFixed(1),intox:+(P.intox||0).toFixed(0)});
V8.carregar.sono=s=>{P.sono=s&&typeof s.sono==='number'?clamp(s.sono,0,100):100;P.intox=s&&s.intox>0?s.intox:0;P.dorme=false;G.dormindo=null;};
/* acordar pelo botão ou pelas teclas E / Espaço */
{const b=$('bt-acordar');if(b)b.addEventListener('click',()=>sonoAcordar('__manual'));}
window.addEventListener('keydown',e=>{if(G.dormindo&&(e.code==='KeyE'||e.code==='Space')){e.preventDefault();sonoAcordar('__manual');}});

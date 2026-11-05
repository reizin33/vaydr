/* ================= Etapa 13 · água e automação: poço, bomba, canos, caixa d'água, barril, fervedor, filtro e irrigação =================
   Tudo pelo menu de construção (B → aba Água):
   · Poço: guarda até 300 L e enche sozinho com o lençol (na chuva, mais rápido). Sem bomba, tira água suja com o balde.
   · Bomba d'água: vai ao lado de um poço. Com um gerador ligado e com gasolina a até 25 m, bombeia sozinha 72 L por hora
     (gasta gasolina do gerador, de dia ou de noite); sem energia, bombeie à mão (cansa).
   · Canos: 2 m cada, montados ponta com ponta: a ponta do cano novo gruda na ponta solta mais perto (de outro cano ou de
     uma peça da rede) e ele segue para onde você olha (gire com R).
   · Caixa d'água (400 L) guarda água bruta; barril (80 L) guarda água limpa, pronta para beber.
   · Fervedor: ferve a água bruta que chega pelos canos (gasta lenha ou carvão) e manda a água fervida para os barris.
   · Filtro: limpa a água sem fogo, mais devagar; o carvão dele gasta e precisa ser trocado (manutenção).
   · Irrigador: rega a horta e os canteiros por perto (crescem como na chuva) gastando água da rede.
   · O coletor de chuva ligado nos canos manda a água dele para a rede.
   Peças ligadas por canos formam uma rede: a água anda sozinha (poço → bomba → fervedor ou filtro → barril), com capacidade,
   vazão, consumo, energia e estado de cada peça (peça muito quebrada trabalha pela metade; zumbi quebra cano). A ligação
   completa com a energia (fiação, painéis) entra na Etapa 17: por enquanto a bomba usa o gerador que já existe. */
iconesNovos({
  'i-poco':'<path d="M4 13h16v7H4z"/><path d="M4 16.5h16M9 13v7M15 13v7"/><path d="M6 13V5h12v8M5 5h14"/><path d="M12 5v4.5"/><path d="M10.5 9.5h3v2h-3z"/>',
  'i-bomba-agua':'<path d="M8 21h8M10 21V9h4v12"/><path d="M14 11h3.5v2.5"/><path d="M10 9 6 4.5M6 4.5 4.5 6"/><path d="M17.5 16c0 1-.6 1.6-.6 2.3a.6.6 0 0 0 1.2 0c0-.7-.6-1.3-.6-2.3z"/>',
  'i-cano':'<path d="M3 10h18v4H3z"/><path d="M6 9v6M18 9v6"/>',
  'i-caixa-agua':'<path d="M5 6.5C5 5 8 4 12 4s7 1 7 2.5v5C19 13 16 14 12 14s-7-1-7-2.5z"/><path d="M5 6.5C5 8 8 9 12 9s7-1 7-2.5"/><path d="M7 14v6.5M17 14v6.5M7 18h10"/>',
  'i-barril-agua':'<path d="M7 4h10c1.2 2.6 1.2 13.4 0 16H7C5.8 17.4 5.8 6.6 7 4z"/><path d="M6.2 8.5h11.6M6.2 15.5h11.6"/><path d="M17.8 12h2.5v1.8"/>',
  'i-fervedor':'<path d="M6 9h12v6H6z"/><path d="M6 9c0-1 2.7-1.8 6-1.8S18 8 18 9"/><path d="M4 21l2-6M20 21l-2-6M4 21h16"/><path d="M9.5 18.5c0-1 1-1.4 1-2.4M13.5 18.5c0-1 1-1.4 1-2.4"/><path d="M10 5c0-1 .8-1.3.8-2.2M13.5 5c0-1 .8-1.3.8-2.2"/>',
  'i-filtro-agua':'<path d="M7 3h10v18H7z"/><path d="M7 8h10M7 12.5h10M7 16.5h10"/><path d="M9 10h.01M12 10.3h.01M15 10h.01M9.5 14.5h5"/><path d="M12 21v1.5"/>',
  'i-irrigador':'<path d="M12 21V11"/><path d="M9 21h6"/><path d="M12 11l-2-2h4z"/><path d="M5 8c1.5-1.5 3-2 4-2M19 8c-1.5-1.5-3-2-4-2M4 12c.8-1.2 1.7-2 3-2.4M20 12c-.8-1.2-1.7-2-3-2.4"/>',
  'i-rede-agua':'<path d="M12 3c2.6 3.3 4 5.8 4 7.7a4 4 0 0 1-8 0C8 8.8 9.4 6.3 12 3z"/><path d="M3 17h5v3H3zM16 17h5v3h-5zM8 18.5h8"/>'});
const AGUA_CFG={poco:{cap:300,recarga:0.8,ini:120},bomba:{vazao:1.2,mao:12,gen:0.5/480/1.2,raioGen:25,prende:2.8},caixa:{cap:400},barril:{cap:80},
  fervedor:{cap:30,vazao:0.75,saida:30,lenha:15,carvao:40,combMax:180},filtro:{cap:10,vazao:20/60,saida:10,vida:300},irrig:{gasto:8/60,raio:4.5}};
/* ---------- peças ---------- */
Object.assign(OBRAS,{
  poco:{nome:'Poço',icon:'i-poco',custo:{pedra:16,tabuas:4,corda:3,sucata:2},hp:420,hw:0.78,hd:0.78,solid:true,hCol:0.9,etapa:2,agua:'poco',estacao:'poco',base:true},
  bombaAgua:{nome:'Bomba d\'água',icon:'i-bomba-agua',custo:{sucata:6,pregos:4,chapaFerro:1,corda:1},hp:220,hw:0.32,hd:0.32,solid:true,hCol:1.1,etapa:3,agua:'bomba',estacao:'bombaAgua',alvo:alvoBomba,base:true},
  cano:{nome:'Cano',icon:'i-cano',custo:{sucata:1,pregos:1},hp:70,hw:0.08,hd:1.0,solid:false,etapa:2,agua:'cano',alvo:alvoCano},
  caixaAgua:{nome:'Caixa d\'água',icon:'i-caixa-agua',custo:{tabuas:8,pregos:6,sucata:6,chapaFerro:1},hp:320,hw:0.9,hd:0.9,solid:true,hCol:2.6,etapa:2,agua:'caixa',estacao:'caixaAgua',base:true},
  barrilAgua:{nome:'Barril de água',icon:'i-barril-agua',custo:{tabuas:4,pregos:2,sucata:2},hp:160,hw:0.42,hd:0.42,solid:true,hCol:1.0,peq:true,etapa:1,agua:'barril',estacao:'barrilAgua',base:true},
  fervedor:{nome:'Fervedor',icon:'i-fervedor',custo:{pedra:8,sucata:6,chapaFerro:1},hp:240,hw:0.62,hd:0.62,solid:true,hCol:1.3,etapa:2,agua:'fervedor',estacao:'fervedor',base:true},
  filtroAgua:{nome:'Filtro de água',icon:'i-filtro-agua',custo:{tabuas:3,pano:3,carvao:3,pedra:4},hp:130,hw:0.45,hd:0.45,solid:true,hCol:1.4,etapa:2,agua:'filtro',estacao:'filtroAgua',base:true},
  irrigador:{nome:'Irrigador',icon:'i-irrigador',custo:{sucata:2,corda:1,tabuas:1},hp:70,hw:0.2,hd:0.2,solid:false,etapa:2,agua:'irrigador',estacao:'irrigador'}});
OBRAS.coletor.agua='coletor';
const AGUA_OBRAS=['poco','bombaAgua','cano','caixaAgua','barrilAgua','fervedor','filtroAgua','irrigador'];
OBRA_ORDEM.push(...AGUA_OBRAS);
for(const k of AGUA_OBRAS)if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);
for(const k of['barrilAgua','caixaAgua','fervedor','filtroAgua','irrigador','cano'])if(typeof OBRAS_TELHADO!=='undefined'&&!OBRAS_TELHADO.includes(k))OBRAS_TELHADO.push(k);
{const pl=OBRA_CATS.find(c=>c.id==='plantio');if(pl)pl.t=pl.t.filter(k=>k!=='coletor');
  OBRA_CATS.splice(pl?OBRA_CATS.indexOf(pl):OBRA_CATS.length,0,{id:'agua',nome:'Água',ico:'i-rede-agua',t:[...AGUA_OBRAS,'coletor']});}
Object.assign(ESTACOES,{
  poco:{nome:'Poço',icon:'i-poco',ir:'um poço (construa: B → Água)',chip:'Poço'},
  bombaAgua:{nome:'Bomba d\'água',icon:'i-bomba-agua',ir:'a bomba ao lado do poço',chip:'Bomba'},
  caixaAgua:{nome:'Caixa d\'água',icon:'i-caixa-agua',ir:'uma caixa d\'água',chip:'Caixa d\'água'},
  barrilAgua:{nome:'Barril de água',icon:'i-barril-agua',ir:'um barril de água',chip:'Barril'},
  fervedor:{nome:'Fervedor',icon:'i-fervedor',ir:'um fervedor (construa: B → Água)',chip:'Fervedor'},
  filtroAgua:{nome:'Filtro de água',icon:'i-filtro-agua',ir:'um filtro de água (construa: B → Água)',chip:'Filtro'},
  irrigador:{nome:'Irrigador',icon:'i-irrigador',ir:'um irrigador',chip:'Irrigador'}});
/* estado inicial de cada peça (montarBase do jogo chama para as peças de base; aqui vale para todas) */
function aguaIni(o){const D=OBRAS[o.tipo];if(!D||!D.agua)return;if(!o.ext)o.ext={};const e=o.ext;
  if(D.agua==='poco'&&e.agua===undefined)e.agua=AGUA_CFG.poco.ini;if(D.agua==='caixa'&&e.agua===undefined)e.agua=0;if(D.agua==='barril'&&e.limpa===undefined)e.limpa=0;
  if(D.agua==='fervedor'){if(e.agua===undefined)e.agua=0;if(e.limpa===undefined)e.limpa=0;if(e.comb===undefined)e.comb=0;}
  if(D.agua==='filtro'){if(e.agua===undefined)e.agua=0;if(e.limpa===undefined)e.limpa=0;if(e.vida===undefined)e.vida=AGUA_CFG.filtro.vida;}
  if(D.agua==='bomba'&&e.pend===undefined)e.pend=0;}
{const _co=criarObra;criarObra=function(){const o=_co.apply(this,arguments);if(o)aguaIni(o);aguaSujo=true;return o;};}
{const _do=destruirObra;destruirObra=function(o){const r=_do.apply(this,arguments);aguaSujo=true;return r;};}

/* ---------- onde a peça vai: bomba ao lado do poço, cano ponta com ponta ---------- */
function pocoPerto(x,z,r){let b=null,bd=r*r;for(const o of OB){if(o.tipo!=='poco'||o.hp<=0)continue;const d=d2(o.x,o.z,x,z);if(d<bd){bd=d;b=o;}}return b;}
function alvoBomba(x,z,yaw){const p=pocoPerto(x,z,4);if(!p)return{x,z,y:ground(x,z),yaw,ok:false,motivo:'A bomba vai ao lado de um poço'};
  let dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<0.01){dx=Math.sin(yaw);dz=Math.cos(yaw);d=1;}const bx=p.x+dx/d*1.18,bz=p.z+dz/d*1.18;
  const ok=!pointBlocked(bx,bz,0.2)&&!OB.some(o=>o.tipo==='bombaAgua'&&o.hp>0&&d2(o.x,o.z,bx,bz)<0.7*0.7);
  return{x:bx,z:bz,y:ground(bx,bz),yaw:Math.atan2(p.x-bx,p.z-bz)+Math.PI,ok,motivo:ok?'':'Tem coisa no caminho'};}
function aguaRaio(o){const D=OBRAS[o.tipo];return Math.max(D.hw,D.hd);}
function canoPontas(o){const e=o.ext||{};return[e.a,e.b].filter(Boolean);}
function alvoCano(x,z,yaw){yaw=Math.round(yaw/(Math.PI/8))*(Math.PI/8);let best=null,bd=2.2;
  for(const o of OB){const D=OBRAS[o.tipo];if(!D||!D.agua||o.hp<=0)continue;if(Math.abs((o.y||0)-P.y)>2.2)continue;
    if(D.agua==='cano'){for(const p of canoPontas(o)){const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;best={x:p[0],z:p[1]};}}continue;}
    const r=aguaRaio(o)+0.25,dc=Math.hypot(x-o.x,z-o.z),d=Math.max(0,dc-r);if(d<bd){bd=d;const ux=dc>0.05?(x-o.x)/dc:Math.sin(yaw),uz=dc>0.05?(z-o.z)/dc:Math.cos(yaw);best={x:o.x+ux*r,z:o.z+uz*r};}}
  const f=fwd(yaw,1);let a,b;if(best){a=[best.x,best.z];b=[best.x+f[0]*2,best.z+f[1]*2];}else{a=[x-f[0],z-f[1]];b=[x+f[0],z+f[1]];}
  const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,ga=ground(a[0],a[1]),gb=ground(b[0],b[1]);
  let ok=true,motivo='';for(const t of[0.3,0.5,0.75,1])if(pointBlocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,0.06)){ok=false;motivo='Tem coisa no caminho do cano';break;}
  if(ok&&Math.abs(gb-ga)>1.2){ok=false;motivo='Íngreme demais para o cano';}
  if(ok&&!best)motivo='';
  return{x:cx,z:cz,y:(ga+gb)/2+0.1,yaw,ok,motivo,ext:{a,b,inc:-Math.atan2(gb-ga,2),solto:!best}};}

/* ---------- redes: o que está ligado por canos ---------- */
let aguaSujo=true,aguaCache=[],aguaCacheT=0;
function aguaRedes(){if(!aguaSujo&&G.t-aguaCacheT<3)return aguaCache;aguaSujo=false;aguaCacheT=G.t;
  const L=OB.filter(o=>o.hp>0&&OBRAS[o.tipo]&&OBRAS[o.tipo].agua),n=L.length,pai=L.map((_,i)=>i);
  const raiz=i=>{while(pai[i]!==i){pai[i]=pai[pai[i]];i=pai[i];}return i;},une=(i,j)=>{const a=raiz(i),b=raiz(j);if(a!==b)pai[a]=b;};
  for(let i=0;i<n;i++){const A=L[i],DA=OBRAS[A.tipo];
    for(let j=i+1;j<n;j++){const B=L[j],DB=OBRAS[B.tipo];if(Math.abs((A.y||0)-(B.y||0))>2.5)continue;
      if(DA.agua==='cano'&&DB.agua==='cano'){let ok=false;for(const p of canoPontas(A))for(const q of canoPontas(B))if(Math.hypot(p[0]-q[0],p[1]-q[1])<0.5)ok=true;if(ok)une(i,j);continue;}
      if(DA.agua==='cano'||DB.agua==='cano'){const C=DA.agua==='cano'?A:B,O=C===A?B:A,r=aguaRaio(O)+0.5;if(canoPontas(C).some(p=>Math.hypot(p[0]-O.x,p[1]-O.z)<r))une(i,j);continue;}
      if((DA.agua==='bomba'&&DB.agua==='poco')||(DA.agua==='poco'&&DB.agua==='bomba')){if(d2(A.x,A.z,B.x,B.z)<AGUA_CFG.bomba.prende**2)une(i,j);continue;}
      if(d2(A.x,A.z,B.x,B.z)<(aguaRaio(A)+aguaRaio(B)+0.15)**2)une(i,j);}}   // encostadas também se ligam
  const G2={};for(let i=0;i<n;i++){const r=raiz(i);(G2[r]||(G2[r]=[])).push(L[i]);}
  aguaCache=Object.values(G2);return aguaCache;}
function redeDe(o){return aguaRedes().find(R=>R.includes(o))||[o];}
function aguaEstado(o){return o.hp<o.hpMax*0.35?0.5:1;}   // muito quebrada: trabalha pela metade
function geradorPerto(o){let b=null;for(const g of OB){const D=OBRAS[g.tipo];if(!D||!D.gerador||g.hp<=0||!g.ext||!g.ext.ligado||!((g.ext.comb||0)>0))continue;
  if(d2(g.x,g.z,o.x,o.z)<AGUA_CFG.bomba.raioGen**2){b=g;break;}}return b;}
function pocoDaBomba(b){let p=null,bd=AGUA_CFG.bomba.prende**2;for(const o of OB){if(o.tipo!=='poco'||o.hp<=0)continue;const d=d2(o.x,o.z,b.x,b.z);if(d<bd){bd=d;p=o;}}return p;}
function chovendo(){return(G.chuva||0)>0.3;}
/* irrigador: tem planta crescendo no alcance? */
function irrigAlvos(o){const r=AGUA_CFG.irrig.raio,H=[],C=[];for(const h of OB)if(h.tipo==='horta'&&h.hp>0&&d2(h.x,h.z,o.x,o.z)<r*r&&(h.ext&&(h.ext.cresce||0)<1))H.push(h);
  if(typeof PLANTIO_DEF!=='undefined'){const S=plantioD();for(const d of PLANTIO_DEF){const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;if(d2(mx,mz,o.x,o.z)<(r+1)**2&&S[d.id]>=0&&S[d.id]<1)C.push(d);}}
  return{H,C};}
/* um passo da rede: dm minutos de jogo */
function aguaPasso(dm){if(!(dm>0))return;
  for(const o of OB)if(o.tipo==='poco'&&o.hp>0){aguaIni(o);o.ext.agua=Math.min(AGUA_CFG.poco.cap,o.ext.agua+AGUA_CFG.poco.recarga*(chovendo()?2:1)*dm);}
  for(const R of aguaRedes()){const T=t=>R.filter(o=>OBRAS[o.tipo].agua===t);for(const o of R)aguaIni(o);
    const bombas=T('bomba'),caixas=T('caixa'),barris=T('barril'),ferv=T('fervedor'),filt=T('filtro'),irr=T('irrigador'),colet=T('coletor');
    // de onde vem a água bruta: coletores, o que foi bombeado à mão e as bombas ligadas no gerador
    const fontes=[];for(const c of colet)fontes.push({tem:()=>c.ext.agua||0,tira:n=>{c.ext.agua=Math.max(0,(c.ext.agua||0)-n);}});
    for(const b of bombas)fontes.push({tem:()=>b.ext.pend||0,tira:n=>{b.ext.pend=Math.max(0,b.ext.pend-n);}});
    for(const b of bombas){const p=pocoDaBomba(b),g=geradorPerto(b);b.ligada=!!(p&&g);b.bombeou=0;if(!b.ligada)continue;const cap=AGUA_CFG.bomba.vazao*dm*aguaEstado(b);
      fontes.push({tem:()=>Math.min(cap-b.bombeou,p.ext.agua),tira:n=>{p.ext.agua-=n;b.bombeou+=n;g.ext.comb=Math.max(0,g.ext.comb-n*AGUA_CFG.bomba.gen);if(g.ext.comb<=0)feed('O gerador da bomba ficou sem gasolina',true);}});}
    const livre=()=>fontes.reduce((s,f)=>s+f.tem(),0);
    const tirar=n=>{let t=0;for(const f of fontes){if(t>=n)break;const k=Math.min(n-t,f.tem());if(k>0){f.tira(k);t+=k;}}return t;};
    const daCaixa=n=>{let t=0;for(const c of caixas){if(t>=n)break;const k=Math.min(n-t,c.ext.agua);if(k>0){c.ext.agua-=k;t+=k;}}return t;};
    // 1) irrigação
    if(!chovendo())for(const o of irr){const A=irrigAlvos(o);o.alvos=A.H.length+A.C.length;if(!o.alvos)continue;const q=AGUA_CFG.irrig.gasto*dm;let t=tirar(q);if(t<q)t+=daCaixa(q-t);if(t>q*0.5)o.regaAte=G.tm+3;}
    // 2) fervedor e filtro puxam água bruta; 3) o que sobra vai para as caixas
    for(const o of[...ferv,...filt]){const D=o.tipo==='fervedor'?AGUA_CFG.fervedor:AGUA_CFG.filtro,vaga=D.cap-o.ext.agua;if(vaga<=0)continue;let t=tirar(vaga);if(t<vaga)t+=daCaixa(vaga-t);o.ext.agua+=t;}
    for(const c of caixas){const vaga=AGUA_CFG.caixa.cap-c.ext.agua;if(vaga>0)c.ext.agua+=tirar(Math.min(vaga,livre()));}
    // fervura e filtro
    for(const o of ferv){const k=aguaEstado(o),q=Math.min(o.ext.agua,AGUA_CFG.fervedor.vazao*dm*k,o.ext.comb,AGUA_CFG.fervedor.saida-o.ext.limpa);
      if(q>0){o.ext.agua-=q;o.ext.limpa+=q;o.ext.comb-=q;o.ferveAte=G.tm+3;}}
    for(const o of filt){const k=aguaEstado(o),q=Math.min(o.ext.agua,AGUA_CFG.filtro.vazao*dm*k,o.ext.vida,AGUA_CFG.filtro.saida-o.ext.limpa);
      if(q>0){o.ext.agua-=q;o.ext.limpa+=q;o.ext.vida-=q;o.filtraAte=G.tm+3;if(o.ext.vida<=0)feed('O carvão do filtro de água gastou: troque',true);}}
    // água limpa vai para os barris
    for(const o of[...ferv,...filt])for(const b of barris){if(o.ext.limpa<=0)break;const vaga=AGUA_CFG.barril.cap-b.ext.limpa;if(vaga<=0)continue;const k=Math.min(vaga,o.ext.limpa);b.ext.limpa+=k;o.ext.limpa-=k;}}}
let aguaTm=null,aguaPassoT=0;
PASSOS.push(function aguaRede(dt){aguaPassoT-=dt;if(aguaPassoT>0)return;aguaPassoT=1;const tm=G.tm||0;if(aguaTm===null||tm<aguaTm){aguaTm=tm;return;}const dm=Math.min(720,tm-aguaTm);if(dm<0.25)return;aguaTm=tm;
  if(OB.some(o=>OBRAS[o.tipo]&&OBRAS[o.tipo].agua)){const n=Math.min(144,Math.ceil(dm/5));for(let i=0;i<n;i++)aguaPasso(dm/n);}});   // tempo grande (sono, carregar) em pedaços de até 5 min
/* irrigação: a horta e os canteiros no alcance crescem como se chovesse */
PASSOS.push(function aguaIrriga(dt){if(chovendo()||G.modo!=='jogo')return;const dia=G.hora>=6&&G.hora<20?1:0.8,cl=typeof climaHorta==='function'?climaHorta():1;
  for(const o of OB){if(o.tipo!=='irrigador'||!(o.regaAte>=G.tm))continue;const A=irrigAlvos(o);
    for(const h of A.H)h.ext.cresce=Math.min(1,(h.ext.cresce||0)+dt/(36*30)*dia*cl);
    if(A.C.length){const S=plantioD(),r=dt/(PLANTIO_CFG.horas*30)*(PLANTIO_CFG.chuva-1)*(G.hora>=6&&G.hora<20?1:PLANTIO_CFG.noite)*cl;for(const d of A.C)S[d.id]=Math.min(1,S[d.id]+r);}}});

/* ---------- painel de cada peça (o painel das estações) ---------- */
const L1=v=>Math.round(v*10)/10,Lt=v=>Math.round(v)+' L';
function redeResumo(o){const R=redeDe(o),T=t=>R.filter(q=>OBRAS[q.tipo].agua===t),canos=T('cano').length,pecas=R.length-canos;
  if(R.length<=1)return'Sozinha: ligue com canos (B → Água → Cano) a um poço com bomba, à caixa d\'água, ao fervedor ou filtro e ao barril.';
  const bruta=T('caixa').reduce((s,c)=>s+c.ext.agua,0),capB=T('caixa').length*AGUA_CFG.caixa.cap,limpa=T('barril').reduce((s,c)=>s+c.ext.limpa,0),capL=T('barril').length*AGUA_CFG.barril.cap,b=T('bomba');
  const lig=b.filter(q=>q.ligada).length,partes=[pecas+' peças e '+canos+' cano'+(canos===1?'':'s')];
  if(capB)partes.push('caixas: '+Lt(bruta)+' de '+Lt(capB));if(capL)partes.push('barris: '+Lt(limpa)+' de '+Lt(capL)+' de água limpa');
  if(b.length)partes.push(lig?lig+' bomba'+(lig>1?'s':'')+' no gerador':'bomba sem energia (bombeie à mão)');
  const ir=T('irrigador').filter(q=>q.regaAte>=G.tm).length;if(ir)partes.push(ir+' irrigador'+(ir>1?'es':'')+' regando');
  return'Rede: '+partes.join(' · ')+'.';}
function aguaBarra(nome,v,cap,cor){return'<div class="es-vaga'+(v>=cap-0.5?' pronta':'')+'">'+svgUse(cor==='limpa'?'i-agua':'i-agua-suja')+'<span><b>'+nome+'</b><small>'+Lt(v)+' de '+Lt(cap)+'</small></span>'+barraHTML(cap?v/cap:0)+'</div>';}
function garrafasDe(id,n,de){const g=Math.min(invCount('garrafa'),Math.floor(n));if(g<=0)return 0;invRemove('garrafa',g);const left=invAdd(id,g);if(left){invAdd('garrafa',left);return g-left;}return g;}
function beberDe(fonte,suja){if(fonte<1)return'Não tem água.';P.sede=Math.min(100,P.sede+32);sfx('pegar');hudBarra();
  if(suja&&Math.random()<(ITEMS.aguaSuja.suja||0.45)*(cfg.dif==='facil'?0.6:1)){P.intox=Math.max(P.intox||0,200+Math.random()*120);setTimeout(()=>toast('corpo','A água suja te deu dor de barriga. Ferva ou filtre antes de beber.'),900);}
  return suja?'Bebeu água suja.':'Bebeu água limpa.';}
function despejarSuja(o,cap){const n=Math.min(invCount('aguaSuja'),Math.floor(cap-o.ext.agua));if(n<=0)return 0;invRemove('aguaSuja',n);invAdd('garrafa',n);o.ext.agua+=n;return n;}
const AGUA_UI={
  poco(o){const e=o.ext,c='<div class="es-lista">'+aguaBarra('Água no poço (suja)',e.agua,AGUA_CFG.poco.cap,'suja')+'</div>',b=OB.find(q=>q.tipo==='bombaAgua'&&q.hp>0&&pocoDaBomba(q)===o);
    return{sub:'Enche sozinho com o lençol ('+L1(AGUA_CFG.poco.recarga*60)+' L por hora; na chuva, o dobro). Com uma bomba do lado, a água vai pelos canos.',corpo:c+'<p class="es-info">'+(b?'Bomba ligada a este poço. ':'Sem bomba: só dá para tirar com o balde. ')+redeResumo(o)+'</p>',
      acoes:[{id:'balde',t:'Tirar água com o balde',s:invCount('garrafa')?'enche '+Math.min(invCount('garrafa'),Math.floor(e.agua))+' garrafa(s) com água suja':'precisa de garrafas vazias',ok:invCount('garrafa')>0&&e.agua>=1,prim:true},
        {id:'beber',t:'Beber água do poço',s:'água suja: pode dar dor de barriga',ok:e.agua>=1}]};},
  bombaAgua(o){const p=pocoDaBomba(o),g=geradorPerto(o);let s=p?(g?'Ligada no gerador: bombeia sozinha '+Math.round(AGUA_CFG.bomba.vazao*60*aguaEstado(o))+' L por hora e gasta a gasolina dele.':'Sem energia: ligue um gerador com gasolina a até '+AGUA_CFG.bomba.raioGen+' m, ou bombeie à mão.'):'Sem poço do lado: a bomba precisa ficar encostada num poço.';
    const c='<div class="es-lista">'+(p?aguaBarra('Água no poço',p.ext.agua,AGUA_CFG.poco.cap,'suja'):'')+(o.ext.pend>0.5?aguaBarra('Bombeada esperando lugar na rede',o.ext.pend,AGUA_CFG.bomba.mao*5,'suja'):'')+'</div>';
    return{sub:s,corpo:c+'<p class="es-info">'+redeResumo(o)+(aguaEstado(o)<1?' A bomba está muito quebrada: trabalha pela metade (conserte com T no modo de construção).':'')+'</p>',
      acoes:[{id:'bombear',t:'Bombear à mão (+'+AGUA_CFG.bomba.mao+' L)',s:'cansa: gasta energia',ok:!!p&&p.ext.agua>=1&&P.energia>=6&&o.ext.pend<AGUA_CFG.bomba.mao*5,prim:!g}]};},
  caixaAgua(o){const e=o.ext;return{sub:'Guarda até '+AGUA_CFG.caixa.cap+' L de água bruta (suja). O fervedor, o filtro e os irrigadores da rede puxam daqui.',
    corpo:'<div class="es-lista">'+aguaBarra('Água bruta',e.agua,AGUA_CFG.caixa.cap,'suja')+'</div><p class="es-info">'+redeResumo(o)+'</p>',
    acoes:[{id:'encherSuja',t:'Encher garrafas',s:invCount('garrafa')?'água suja · '+Math.min(invCount('garrafa'),Math.floor(e.agua))+' garrafa(s)':'precisa de garrafas vazias',ok:invCount('garrafa')>0&&e.agua>=1},
      {id:'despejar',t:'Despejar água suja da mochila',s:invCount('aguaSuja')+' garrafa(s)',ok:invCount('aguaSuja')>0&&e.agua<AGUA_CFG.caixa.cap-1}]};},
  barrilAgua(o){const e=o.ext,cs=typeof cantis==='function'?cantis().length:0;return{sub:'Guarda até '+AGUA_CFG.barril.cap+' L de água limpa, que chega fervida ou filtrada pelos canos.',
    corpo:'<div class="es-lista">'+aguaBarra('Água limpa',e.limpa,AGUA_CFG.barril.cap,'limpa')+'</div><p class="es-info">'+redeResumo(o)+'</p>',
    acoes:[{id:'encher',t:'Encher garrafas',s:invCount('garrafa')?'água limpa · '+Math.min(invCount('garrafa'),Math.floor(e.limpa))+' garrafa(s)':'precisa de garrafas vazias',ok:invCount('garrafa')>0&&e.limpa>=1,prim:true},
      {id:'cantil',t:'Encher o cantil',s:cs?'água limpa':'sem cantil na mochila',ok:cs>0&&e.limpa>=1},{id:'beber',t:'Beber',s:'água limpa',ok:e.limpa>=1}]};},
  fervedor(o){const e=o.ext,fv=o.ferveAte>=G.tm;return{sub:'Ferve a água bruta da rede (ou a que você despejar) e manda a água fervida para os barris. Gasta lenha: 1 madeira ferve '+AGUA_CFG.fervedor.lenha+' L, 1 carvão ferve '+AGUA_CFG.fervedor.carvao+' L.',
    corpo:'<div class="es-lista">'+aguaBarra('Água para ferver',e.agua,AGUA_CFG.fervedor.cap,'suja')+aguaBarra('Água fervida esperando barril',e.limpa,AGUA_CFG.fervedor.saida,'limpa')+
      '<div class="es-vaga'+(e.comb>0?' pronta':'')+'">'+svgUse('i-fogueira')+'<span><b>Lenha</b><small>'+(e.comb>0?'dá para ferver mais '+Lt(e.comb)+(fv?' · fervendo agora':''):'sem lenha: o fogo apagou')+'</small></span>'+barraHTML(e.comb/AGUA_CFG.fervedor.combMax)+'</div></div><p class="es-info">'+redeResumo(o)+'</p>',
    acoes:[{id:'lenha',t:'Pôr lenha (1 madeira)',s:'+'+AGUA_CFG.fervedor.lenha+' L de fervura · tem '+invCount('madeira'),ok:invCount('madeira')>0&&e.comb<AGUA_CFG.fervedor.combMax-AGUA_CFG.fervedor.lenha,prim:e.comb<=0},
      {id:'carvao',t:'Pôr carvão (1)',s:'+'+AGUA_CFG.fervedor.carvao+' L de fervura · tem '+invCount('carvao'),ok:invCount('carvao')>0&&e.comb<AGUA_CFG.fervedor.combMax-AGUA_CFG.fervedor.carvao},
      {id:'despejar',t:'Despejar água suja da mochila',s:invCount('aguaSuja')+' garrafa(s)',ok:invCount('aguaSuja')>0&&e.agua<AGUA_CFG.fervedor.cap-1},
      {id:'recolher',t:'Encher garrafas com água fervida',s:Lt(e.limpa)+' pronta',ok:invCount('garrafa')>0&&e.limpa>=1}]};},
  filtroAgua(o){const e=o.ext,v=Math.max(0,e.vida/AGUA_CFG.filtro.vida);return{sub:'Limpa a água sem fogo, mais devagar ('+Math.round(AGUA_CFG.filtro.vazao*60)+' L por hora). O carvão de dentro gasta: troque quando acabar.',
    corpo:'<div class="es-lista">'+aguaBarra('Água para filtrar',e.agua,AGUA_CFG.filtro.cap,'suja')+aguaBarra('Água filtrada esperando barril',e.limpa,AGUA_CFG.filtro.saida,'limpa')+
      '<div class="es-vaga'+(v<0.15?'':' pronta')+'">'+svgUse('i-carvao')+'<span><b>Carvão do filtro</b><small>'+(e.vida>0?'filtra mais '+Lt(e.vida):'gasto: troque o carvão')+'</small></span>'+barraHTML(v)+'</div></div><p class="es-info">'+redeResumo(o)+'</p>',
    acoes:[{id:'trocar',t:'Trocar o carvão do filtro',s:'2 carvão e 1 pano · volta a filtrar '+AGUA_CFG.filtro.vida+' L',ok:invHas({carvao:2,pano:1})&&e.vida<AGUA_CFG.filtro.vida*0.9,prim:e.vida<=0},
      {id:'despejar',t:'Despejar água suja da mochila',s:invCount('aguaSuja')+' garrafa(s)',ok:invCount('aguaSuja')>0&&e.agua<AGUA_CFG.filtro.cap-1},
      {id:'recolher',t:'Encher garrafas com água filtrada',s:Lt(e.limpa)+' pronta',ok:invCount('garrafa')>0&&e.limpa>=1}]};},
  irrigador(o){const A=irrigAlvos(o),reg=o.regaAte>=G.tm;return{sub:'Rega a horta e os canteiros a até '+AGUA_CFG.irrig.raio+' m: crescem como na chuva. Gasta uns '+Math.round(AGUA_CFG.irrig.gasto*60)+' L por hora da rede, só quando tem planta crescendo.',
    corpo:'<div class="es-lista"><div class="es-vaga'+(reg?' pronta':'')+'">'+svgUse('i-horta')+'<span><b>'+(chovendo()?'Chovendo: não precisa regar':reg?'Regando agora':'Parado')+'</b><small>'+(A.H.length+A.C.length)+' canteiro(s) crescendo no alcance</small></span></div></div><p class="es-info">'+redeResumo(o)+'</p>',acoes:[]};}};
function aguaAcao(o,id){const e=o.ext;aguaIni(o);
  switch(id){
    case'balde':{const n=garrafasDe('aguaSuja',e.agua);e.agua-=n;sfx('lavar');return n?'Encheu '+n+' garrafa(s) com água suja do poço.':'Sem garrafas vazias.';}
    case'beber':{if(o.tipo==='poco'){const r=beberDe(e.agua,true);if(e.agua>=1)e.agua-=1;return r;}const r=beberDe(e.limpa,false);if(e.limpa>=1)e.limpa-=1;return r;}
    case'bombear':{const p=pocoDaBomba(o);if(!p)return'Sem poço do lado.';if(P.energia<6)return'Cansado demais para bombear.';const k=Math.min(AGUA_CFG.bomba.mao*aguaEstado(o),p.ext.agua,AGUA_CFG.bomba.mao*5-e.pend);if(k<=0)return'Nada para bombear agora.';
      p.ext.agua-=k;e.pend+=k;P.energia-=6;sfx('bombaAgua');aguaPassoT=0;return'Bombeou '+Lt(k)+'.';}
    case'encherSuja':{const n=garrafasDe('aguaSuja',e.agua);e.agua-=n;sfx('lavar');return n?'Encheu '+n+' garrafa(s) com água suja.':'Sem garrafas vazias.';}
    case'encher':{const n=garrafasDe('agua',e.limpa);e.limpa-=n;sfx('lavar');return n?'Encheu '+n+' garrafa(s) com água limpa.':'Sem garrafas vazias.';}
    case'cantil':{const n=cantisEncher(false);if(n)e.limpa=Math.max(0,e.limpa-n*2);sfx('lavar');return n?'Encheu o cantil com água limpa.':'O cantil já está cheio.';}
    case'despejar':{const cap=o.tipo==='caixaAgua'?AGUA_CFG.caixa.cap:o.tipo==='fervedor'?AGUA_CFG.fervedor.cap:AGUA_CFG.filtro.cap,n=despejarSuja(o,cap);sfx('lavar');return n?'Despejou '+n+' garrafa(s) de água suja.':'Nada para despejar.';}
    case'lenha':{if(!invCount('madeira'))return'Sem madeira.';invRemove('madeira',1);e.comb=Math.min(AGUA_CFG.fervedor.combMax,e.comb+AGUA_CFG.fervedor.lenha);sfx('madeira');return'Pôs lenha no fervedor.';}
    case'carvao':{if(!invCount('carvao'))return'Sem carvão.';invRemove('carvao',1);e.comb=Math.min(AGUA_CFG.fervedor.combMax,e.comb+AGUA_CFG.fervedor.carvao);sfx('madeira');return'Pôs carvão no fervedor.';}
    case'recolher':{const n=garrafasDe('agua',e.limpa);e.limpa-=n;sfx('lavar');return n?'Encheu '+n+' garrafa(s) com água limpa.':'Sem garrafas vazias.';}
    case'trocar':{if(!invHas({carvao:2,pano:1}))return'Precisa de 2 carvão e 1 pano.';invPay({carvao:2,pano:1});anotarGasto({carvao:2,pano:1});e.vida=AGUA_CFG.filtro.vida;sfx('construir');ganharXP(2);return'Trocou o carvão: o filtro volta a limpar '+AGUA_CFG.filtro.vida+' L.';}}
  return'';}
for(const t of Object.keys(AGUA_UI))ESTACAO_UI[t]={resumo:o=>{aguaIni(o);const e=o.ext;
    switch(t){case'poco':return Lt(e.agua)+' no poço';case'bombaAgua':return pocoDaBomba(o)?(geradorPerto(o)?'ligada no gerador':'sem energia: bombeie à mão'):'sem poço do lado';
      case'caixaAgua':return Lt(e.agua)+' de água bruta';case'barrilAgua':return Lt(e.limpa)+' de água limpa';case'fervedor':return e.comb>0?(o.ferveAte>=G.tm?'fervendo':'aceso, esperando água'):'sem lenha';
      case'filtroAgua':return e.vida>0?(o.filtraAte>=G.tm?'filtrando':'esperando água'):'carvão gasto';case'irrigador':return o.regaAte>=G.tm?'regando':'parado';}return'';},
  render:o=>{aguaIni(o);return AGUA_UI[t](o);},acao:(o,id)=>{const m=aguaAcao(o,id);invRender();hudBarra();return m;}};

/* ---------- desenho ---------- */
INIT_MALHAS.push(function aguaMalhas(){const R=rng(1313),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},O=MESH.obra;
  const pd=lin(0x77736a),pd2=lin(0x5e5a52),md=lin(0x6b4e30),md2=lin(0x54402c),aco=lin(0x55595c),aco2=lin(0x3d4246),ferr=lin(0x7a4a2a),azul=lin(0x2f5f86),agua=lin(0x23465a);
  O.poco=mk(g=>{for(let i=0;i<16;i++){const a=i/16*Math.PI*2;for(let k=0;k<3;k++)add(g,bvTris(0.32,0.24,0.2),mat(Math.sin(a+k*0.2)*0.66,0.12+k*0.25,Math.cos(a+k*0.2)*0.66,0,a+k*0.2,0),k%2?pd2:pd,{j:0.08,rnd:R});}
    add(g,cylTris(0.56,0.56,0.02,16),mat(0,0.38,0),agua,{e:0.04});add(g,cylTris(0.74,0.74,0.06,16),mat(0,0.74,0),pd2,{j:0.05,rnd:R});
    for(const s of[-1,1])add(g,bvTris(0.1,1.5,0.1),mat(s*0.72,1.45,0),md2,{j:0.05,rnd:R});
    for(const s of[-1,1])add(g,boxTris(1.75,0.04,0.62),mm(mat(0,2.36,s*0.24),mat(0,0,0,s*0.55,0,0)),md,{j:0.06,rnd:R});
    add(g,cylTris(0.05,0.05,1.5,8),mm(mat(-0.75,1.85,0),mat(0,0,0,0,0,-Math.PI/2)),md2);add(g,boxTris(0.04,0.22,0.04),mat(0.82,1.75,0.09),aco2);add(g,boxTris(0.16,0.04,0.04),mat(0.86,1.65,0.18),md);
    add(g,cylTris(0.008,0.008,0.75,4),mat(0,1.1,0),lin(0x8a7650));add(g,cylTris(0.13,0.15,0.2,10),mat(0,0.92,0),lin(0x6a6e70));});
  O.bombaAgua=mk(g=>{const ve=lin(0x8a2a22),ve2=lin(0x6a1f1a);add(g,bvTris(0.6,0.16,0.6),mat(0,0.08,0),lin(0x8a8a84),{j:0.04,rnd:R});
    add(g,cylTris(0.11,0.12,0.85,10),mat(0,0.16,0),ve,{j:0.04,rnd:R});add(g,cylTris(0.14,0.14,0.08,10),mat(0,1.0,0),ve2);
    add(g,cylTris(0.04,0.03,0.32,8),mm(mat(0,0.72,0.1),mat(0,0,0,Math.PI/2-0.25,0,0)),ve2);add(g,boxTris(0.05,0.05,0.62),mm(mat(0,1.08,-0.05),mat(0,0,0,0.35,0,0)),aco2);
    add(g,bvTris(0.26,0.22,0.3),mat(0.2,0.3,-0.12),aco,{j:0.04,rnd:R});for(let i=0;i<4;i++)add(g,boxTris(0.27,0.012,0.02),mat(0.2,0.24+i*0.04,0.04),aco2);
    add(g,cylTris(0.035,0.035,0.55,8),mm(mat(0,0.25,0.0),mat(0,0,0,Math.PI/2,0,0)),aco);});
  O.cano=mk(g=>{const c=lin(0x6a6e70),c2=lin(0x4a4e50);add(g,cylTris(0.055,0.055,2.0,10),mat(0,0.02,-1,Math.PI/2,0,0),c,{j:0.03,rnd:R});
    for(const z of[-0.98,0.98])add(g,cylTris(0.085,0.085,0.07,10),mat(0,0.02,z-0.035,Math.PI/2,0,0),c2);
    for(const z of[-0.5,0.5])add(g,boxTris(0.05,0.12,0.05),mat(0,-0.05,z),md2);});
  O.caixaAgua=mk(g=>{for(const x of[-0.7,0.7])for(const z of[-0.7,0.7])add(g,bvTris(0.12,1.6,0.12),mat(x,0.8,z),md2,{j:0.05,rnd:R});
    add(g,bvTris(1.75,0.08,1.75),mat(0,1.6,0),md,{j:0.05,rnd:R});for(const s of[-1,1])add(g,boxTris(1.5,0.06,0.06),mm(mat(0,0.8,s*0.7),mat(0,0,0,0,0,s*0.85)),md2);
    add(g,cylTris(0.8,0.74,1.0,18),mat(0,1.64,0),azul,{j:0.03,rnd:R});add(g,cylTris(0.62,0.3,0.16,18),mat(0,2.64,0),lin(0x24486a));add(g,cylTris(0.12,0.12,0.06,10),mat(0,2.8,0),lin(0x24486a));
    add(g,cylTris(0.04,0.04,1.55,6),mat(0.55,0.05,0.6),aco);add(g,boxTris(0.12,0.06,0.06),mat(0.55,0.08,0.6),aco2);
    for(let i=0;i<5;i++)add(g,boxTris(0.36,0.03,0.04),mat(-0.88,0.3+i*0.3,0),md);for(const s of[-0.15,0.15])add(g,boxTris(0.04,1.6,0.04),mat(-0.9,0.8,s),md2);});
  O.barrilAgua=mk(g=>{add(g,latheTris([[0.3,0],[0.37,0.2],[0.39,0.48],[0.37,0.76],[0.3,0.96]],14,1,1,{capB:true,capT:true}),ID,lin(0x7a5536),{j:0.05,rnd:R});
    for(const y of[0.12,0.48,0.84])add(g,latheTris([[0.34+(y===0.48?0.055:0.035),y-0.025],[0.34+(y===0.48?0.055:0.035),y+0.025]],14,1,1),ID,aco2);
    add(g,cylTris(0.3,0.3,0.02,14),mat(0,0.96,0),lin(0x5a3e28));add(g,cylTris(0.022,0.022,0.14,8),mm(mat(0,0.2,0.36),mat(0,0,0,Math.PI/2,0,0)),lin(0xb9a06a));add(g,boxTris(0.05,0.03,0.03),mat(0,0.25,0.48),lin(0xb9a06a));});
  O.fervedor=mk(g=>{for(let i=0;i<10;i++){const a=i/10*Math.PI*2;add(g,bvTris(0.3,0.38,0.22),mat(Math.sin(a)*0.5,0.19,Math.cos(a)*0.5,0,a,0),i%2?pd2:pd,{j:0.08,rnd:R});}
    add(g,cylTris(0.44,0.44,0.72,14),mat(0,0.42,0),lin(0x50555a),{j:0.04,rnd:R});add(g,cylTris(0.46,0.46,0.05,14),mat(0,1.12,0),aco2);add(g,cylTris(0.45,0.45,0.04,14),mat(0,0.62,0),ferr);
    add(g,cylTris(0.06,0.06,0.65,8),mat(0.26,1.14,-0.2),aco2);add(g,cylTris(0.08,0.06,0.06,8),mat(0.26,1.78,-0.2),aco2);
    for(let i=0;i<4;i++)add(g,cylTris(0.035,0.035,0.55,6),mm(mat(-0.25+i*0.16,0.05,-0.25),mat(0,0,0,Math.PI/2,(i-1.5)*0.3,0)),md2);});
  O.fervedorFogo=mk(g=>{for(let i=0;i<5;i++)add(g,icoTris(0.08+R()*0.05,1,R),mat((R()-0.5)*0.4,0.12+R()*0.06,(R()-0.5)*0.4),lin(R()<0.5?0xff9a3a:0xffd06a),{e:2.4});});
  O.filtroAgua=mk(g=>{for(const x of[-0.38,0.38])for(const z of[-0.38,0.38])add(g,bvTris(0.07,1.3,0.07),mat(x,0.65,z),md2,{j:0.05,rnd:R});
    const cam=[[0x6d6a64,0.3],[0xc8b48a,0.6],[0x2a2a2a,0.9]];for(const[c,y]of cam)add(g,cylTris(0.3,0.3,0.24,12),mat(0,y,0),lin(0x9aa1a6),{j:0.03,rnd:R}),add(g,cylTris(0.27,0.27,0.02,12),mat(0,y+0.23,0),lin(c));
    add(g,cylTris(0.32,0.32,0.04,12),mat(0,1.18,0),lin(0x7a5536));add(g,cylTris(0.025,0.025,0.15,8),mm(mat(0,0.34,0.28),mat(0,0,0,Math.PI/2,0,0)),aco);
    add(g,cylTris(0.12,0.1,0.14,10),mat(0,0.02,0.46),lin(0x6a6e70));});
  O.irrigador=mk(g=>{add(g,cylTris(0.025,0.025,0.55,6),mat(0,0,0),aco2);add(g,cylTris(0.06,0.04,0.06,8),mat(0,0.55,0),lin(0xb9a06a));
    for(const s of[-1,1])add(g,boxTris(0.22,0.02,0.02),mat(s*0.1,0.62,0,0,0,s*0.25),aco);add(g,cylTris(0.02,0.02,0.6,6),mm(mat(0,0.05,0),mat(0,0,0,Math.PI/2,0,0)),lin(0x2a4a2a));});});
{const _dob=desenharObra;desenharObra=function(Pg,o){if(o.tipo==='cano'&&MESH.obra.cano){trs(TMP,o.x,o.y,o.z,(o.ext&&o.ext.inc)||0,o.yaw,0,1,1,1);drawStat(Pg,MESH.obra.cano,TMP);return;}
  _dob.apply(this,arguments);if(o.tipo==='fervedor'&&o.ferveAte>=G.tm&&MESH.obra.fervedorFogo){drawStat(Pg,MESH.obra.fervedorFogo,TMP);}};}
/* vapor do fervedor, gotas do irrigador e água escorrendo da bomba */
let aguaFxT=0;
PASSOS.push(function aguaEfeitos(dt){aguaFxT-=dt;if(aguaFxT>0)return;aguaFxT=0.18;for(const o of OB){if(d2(o.x,o.z,P.x,P.z)>40*40)continue;
  if(o.tipo==='fervedor'&&o.ferveAte>=G.tm&&Math.random()<0.7)part(o.x+(Math.random()-0.5)*0.3,o.y+1.2,o.z+(Math.random()-0.5)*0.3,0.08,0.6,0,2.2,0.18,[0.92,0.92,0.92,0.35],false,-0.25);
  if(o.tipo==='irrigador'&&o.regaAte>=G.tm)for(let i=0;i<3;i++){const a=Math.random()*6.283,v=1.2+Math.random()*1.4;part(o.x,o.y+0.65,o.z,Math.sin(a)*v,1.4,Math.cos(a)*v,0.9,0.05,[0.65,0.8,1,0.55],false,6);}
  if(o.tipo==='bombaAgua'&&o.ligada&&o.bombeou>0&&Math.random()<0.5)part(o.x+Math.sin(o.yaw)*0.2,o.y+0.62,o.z+Math.cos(o.yaw)*0.2,0.02,0.2,0,0.6,0.05,[0.6,0.78,1,0.5],false,4);}});
SONS.bombaAgua=({noise,tone,r})=>{tone(0.22,'sawtooth',90*r(),70,0.06);noise(0.3,'bandpass',700*r(),400,1.5,0.35,0.05);noise(0.25,'lowpass',500,200,1,0.3,0.25);};
/* manual: a água vai para a seção de água, mais o guia da água automática */
{const _s=mnSecObra;mnSecObra=function(k,tab){if(OBRAS[k]&&OBRAS[k].agua)return'agua';return _s.apply(this,arguments);};}
{const _o=mnObsObra;mnObsObra=function(k){const O=_o.apply(this,arguments),A={
    poco:'Enche sozinho com o lençol ('+L1(AGUA_CFG.poco.recarga*60)+' L por hora, o dobro na chuva) e guarda até '+AGUA_CFG.poco.cap+' L. Sem bomba, tire água suja com o balde.',
    bombaAgua:'Vai encostada num poço. Com um gerador ligado e com gasolina a até '+AGUA_CFG.bomba.raioGen+' m, bombeia sozinha '+Math.round(AGUA_CFG.bomba.vazao*60)+' L por hora; sem energia, bombeie à mão.',
    cano:'2 m cada, ponta com ponta: a ponta do cano novo gruda na ponta solta mais perto e ele segue para onde você olha (gire com R). Tudo o que os canos ligam vira uma rede.',
    caixaAgua:'Guarda até '+AGUA_CFG.caixa.cap+' L de água bruta para o fervedor, o filtro e os irrigadores.',barrilAgua:'Guarda até '+AGUA_CFG.barril.cap+' L de água limpa: encha garrafas e o cantil ou beba ali mesmo.',
    fervedor:'Ferve '+Math.round(AGUA_CFG.fervedor.vazao*60)+' L por hora; 1 madeira ferve '+AGUA_CFG.fervedor.lenha+' L e 1 carvão '+AGUA_CFG.fervedor.carvao+' L. A água fervida vai sozinha para os barris.',
    filtroAgua:'Filtra '+Math.round(AGUA_CFG.filtro.vazao*60)+' L por hora sem fogo. O carvão filtra '+AGUA_CFG.filtro.vida+' L; depois troque (2 carvão e 1 pano).',
    irrigador:'Rega a até '+AGUA_CFG.irrig.raio+' m: a horta e os canteiros crescem como na chuva. Só gasta água quando tem planta crescendo.',
    coletor:'Ligado por cano, manda a água da chuva para a rede.'}[k];if(A)O.splice(1,0,A);return O;};}
MANUAL_EXTRA.push(()=>[{id:'x:aguaAuto',sec:'agua',nome:'Água automática: poço → fervura → barril',icon:'i-rede-agua',trav:false,como:'desde o começo',desc:'Monte uma rede e a água limpa chega sozinha no barril.',
  ing:{pedra:24,sucata:16,pregos:10,tabuas:8,chapaFerro:2,corda:4},est:{nome:'Modo de construção (B → Água)',icon:'i-martelo',onde:'Na sua base, perto de um gerador.'},ferr:['Nenhuma: só os materiais das peças'],
  proc:['Construa um poço e encoste uma bomba d\'água nele.','Ligue um gerador com gasolina a até '+AGUA_CFG.bomba.raioGen+' m da bomba (ou bombeie à mão).','Saia da bomba com canos, ponta com ponta, até um fervedor (ou um filtro).','Do fervedor, mais canos até um barril de água.','Ponha lenha ou carvão no fervedor: a água bombeada ferve e enche o barril sozinha.','Quer guardar mais? Ponha uma caixa d\'água no caminho; para a horta, um irrigador.'],
  res:{txt:'Barril cheio de água limpa sem você fazer nada à mão (só repor a lenha e a gasolina).'},obs:['Os ingredientes acima são a soma das peças (poço, bomba, fervedor, barril e alguns canos).','A rede respeita capacidade, vazão e consumo; peça muito quebrada trabalha pela metade.','A bomba usa o gerador que já existe; a fiação completa entra junto com a energia.'],tipo:'Guia'}]);
/* salvar e jogo novo: as peças guardam tudo no ext (salvo com as construções) */
V8.novo.agua=()=>{aguaTm=null;aguaSujo=true;};
V8.carregar.agua=()=>{aguaTm=null;aguaSujo=true;for(const o of OB)aguaIni(o);};

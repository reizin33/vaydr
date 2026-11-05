/* ================= zumbis, ameaças e desafios (Etapa 7) =================
   · Ondas da noite reequilibradas: a quantidade cresce rápido nas primeiras noites e devagar depois, com teto por onda; a força
     cresce com as noites (mais corredores, mais brutamontes e um pouco mais de vida). A dificuldade e o nível da base pesam:
     base fortificada traz hordas menores, mas com um brutamontes a mais; na fortaleza eles vêm um pouco mais fortes.
   · Brutamontes (e elite, colosso e açougueiro) que não alcançam você no andar de cima batem nos pilares que seguram o piso.
     Se caírem os pilares que seguram a plataforma, ela desaba (com o que estiver em cima). Paredes no térreo protegem os pilares:
     eles quebram a parede antes de chegar no pilar.
   · Caixa militar com cronômetro (base militar, torre de rádio e estação ferroviária): segure E para ligar; em 2 minutos ela
     abre, mas o alarme chama os zumbis em ondas. Defenda até abrir. Esvaziada, tranca de novo com coisas novas 3 dias depois.
   · Prédio-desafio: Armazém Norte (Distrito Industrial). O quadro de força está sem fusível (tem um na caixa de ferramentas do
     Armazém Sul; fusível também aparece em oficinas). Com o fusível no quadro, a alavanca liga a energia, abre o portão de aço do
     estoque e dispara o alarme. No estoque, a mesa do supervisor guarda o cartão, que abre a sala de segurança com o armário de
     equipamento. Recomeça 5 dias depois de concluído (com você longe).
   · Esconderijos sempre com recompensa: o painel solto do Edifício Aurora e do Bela Vista, a caixa enterrada na mata e o alçapão
     que o incêndio revela nunca vêm vazios. */

/* ---------- ondas da noite ---------- */
function ondaQtd(n){const df=DIF[cfg.dif],base=n<=6?3+n*1.4:11.4+(n-6)*0.7,teto=(G.luaSangue||G.final?34:24)*df.horda;
  return Math.round(Math.min(teto,base*df.horda*(G.final?1.8:1)*(G.luaSangue?1.5:1)*baseFatorHorda()*(typeof luaHorda==='function'?luaHorda():1)));}
function ondaBrutos(n){if(n<3)return 0;return Math.min(4,1+Math.floor((n-3)/5)+((G.baseNv||1)>=3?1:0));}
function ondaTipo(n,i){if(i<ondaBrutos(n)||(i===0&&G.final))return'brute';const R=Math.random(),pr=n>=2?Math.min(0.32,0.12+0.02*n):0;
  if(R<pr)return'runner';if(n>=2&&R<pr+0.08)return'screamer';return'walker';}
function ondaForca(n){return 1+Math.min(0.4,Math.max(0,n-3)*0.025)+((G.baseNv||1)>=4?0.1:0);}

/* ---------- quem derruba pilares ---------- */
const ZS_DERRUBA={brute:1,elite:1,colosso:1,acougueiro:1},PAREDES_CASA={paredeCasa:1,portaMadeira:1,janela:1};
function pilarParaDerrubar(z){if(!ZS_DERRUBA[z.tipo]||!P.alive||P.y-z.y<1.75)return null;let best=null,bd=1e9;
  for(const o of OB){if(o.tipo!=='pilar'||o.hp<=0||!o.ext||Math.abs((o.ext.top??o.y)-P.y)>0.7||Math.abs(o.y-z.y)>1.2)continue;if(d2(o.x,o.z,P.x,P.z)>7*7)continue;
    const d=d2(o.x,o.z,z.x,z.z);if(d<bd){bd=d;best=o;}}
  if(!best)return null;
  // parede, porta ou janela presa no pilar protege: ele quebra a parede antes de chegar no pilar
  let par=null,pd=1e9;for(const o of OB){if(!PAREDES_CASA[o.tipo]||o.hp<=0||Math.abs(o.y-best.y)>0.6||d2(o.x,o.z,best.x,best.z)>1.75*1.75)continue;const d=d2(o.x,o.z,z.x,z.z);if(d<pd){pd=d;par=o;}}
  return par||best;}
function derrubaAviso(){if(G.derrubaT&&G.t-G.derrubaT<45)return;G.derrubaT=G.t;
  toast('alerta','Um brutamontes está tentando derrubar a casa: bate nas paredes do térreo e nos pilares. Se caírem os pilares que seguram o piso, ele desaba.');
  dica('derruba','alerta','Zumbis fortes derrubam pilares quando não te alcançam lá em cima. Feche o térreo com paredes: eles quebram a parede antes de chegar nos pilares. E atire de cima.');}

/* ---------- caixa militar com cronômetro ---------- */
const CXM_SEG=120,CXM_ONDAS=[105,75,45,15],CXM_TRANCA=3;
const CXM_DEF=[{id:'cxmBase',nome:'Caixa militar da base',ax:-112,az:-40},{id:'cxmTorre',nome:'Caixa militar da torre de rádio',ax:-36,az:-102},{id:'cxmEstacao',nome:'Caixa militar da estação',ax:120,az:-46}];
LOOT.cxmCrono=[['balaRifle',10,20,0.9],['municao9',20,40,0.8],['kit',1,2,0.7],['colete',1,1,0.35],['rifle',1,1,0.2],['espingarda',1,1,0.25],['cartucho',6,12,0.5],
  ['bombaCaseira',1,2,0.4],['seringa',1,2,0.5],['racao',2,4,0.6],['mascaraGas',1,1,0.3],['plantaFerro',1,1,0.15]];
function cxmD(){if(!G.cxm||typeof G.cxm!=='object')G.cxm={};for(const d of CXM_DEF)if(!G.cxm[d.id])G.cxm[d.id]={st:'trancada',resta:0,itens:null,dia:0,onda:0,visto:false};return G.cxm;}
function cxmTempo(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function cxmLugar(d){if(d.x!==undefined)return d;const R=rng(d.id.length*131+7);
  // longe de escadas e do que a base militar monta ao começar o jogo (torres de vigia, gerador e postes)
  const EVITA=[[BASEM.x+11.5,BASEM.z-11.5,5],[BASEM.x-11.5,BASEM.z+12.2,5],[BASEM.x+5,BASEM.z-8,3.5],[BASEM.x+12,BASEM.z-6,2],[BASEM.x-1,BASEM.z+6,2],[BASEM.x-8,BASEM.z,2],[BASEM.x+6,BASEM.z+13,2]];
  const longeDeEscada=(x,z)=>!VIAS.some(v=>[v.base,v.topo].some(q=>q&&Math.hypot(q.x-x,q.z-z)<3.5))&&!EVITA.some(([ex,ez,er])=>Math.hypot(ex-x,ez-z)<er);
  for(let r=0;r<14;r+=0.8)for(let k=0;k<10;k++){const a=R()*6.283,x=d.ax+Math.cos(a)*r,z=d.az+Math.sin(a)*r;if(pontoLivre(x,z,1.6)&&!pointBlocked(x,z,2.2)&&longeDeEscada(x,z)){d.x=x;d.z=z;d.y=ground(x,z);d.yaw=R()*6.283;return d;}}
  d.x=d.ax;d.z=d.az;d.y=ground(d.ax,d.az);d.yaw=0;return d;}
INIT_MALHAS.push(()=>{for(const d of CXM_DEF){cxmLugar(d);if(!d.col)d.col=colBox(d.x,d.z,0.78,0.48,d.yaw,{solid:true,y0:d.y,y1:d.y+0.8});}});
function cxmLigar(d){const c=cxmD()[d.id];if(c.st!=='trancada')return;c.st='contando';c.resta=CXM_SEG;c.onda=0;c.bipT=0;
  sfx('alarme',d.x,d.z,1.2);barulho(d.x,d.z,55,false);toast('alerta','O cronômetro da caixa militar começou: abre em 2 minutos. O alarme vai chamar os zumbis: defenda o lugar!');
  if(typeof diarioEvento==='function')diarioEvento('Ligou o cronômetro: '+d.nome.toLowerCase(),'evento');}
function cxmOnda(d,k){if(Math.hypot(d.x-P.x,d.z-P.z)>140)return;   // longe: o alarme chama quem está perto, mas não nasce horda do nada
  const n=Math.round(Math.min(8,3+Math.floor(G.dia/3))*(G.noite?1.4:1)*DIF[cfg.dif].horda);
  for(let i=0;i<n;i++)for(let t=0;t<12;t++){const a=Math.random()*6.283,r=24+Math.random()*12,x=d.x+Math.cos(a)*r,z=d.z+Math.sin(a)*r;if(!pontoLivre(x,z)||Math.hypot(x-P.x,z-P.z)<16)continue;
    const tipo=k>=2&&i===0&&G.dia>=5?'brute':Math.random()<0.3?'runner':'walker',q=criarZ(tipo,x,z,{st:'alerta'});if(q){q.ax=d.x;q.az=d.z;q.ay=d.y;q.cxm=d.id;}break;}
  if(k===0)sfx('horda',d.x+20,d.z+20,0.8);}
function cxmAbrir(d,c){c.st='aberta';c.dia=G.dia;c.resta=0;let L=rollLoot('cxmCrono').filter(q=>ITEMS[q[0]]);
  for(const q of[['balaRifle',8],['municao9',20],['kit',1]])if(L.length<3&&!L.some(x=>x[0]===q[0]))L.push(q);
  c.itens=new Array(BAU_N).fill(null);let i=0;for(const[id,n,ex]of L){if(i>=BAU_N)break;c.itens[i++]=Object.assign(newItem(id,n),ex||{});}
  sfx('missao');if(Math.hypot(d.x-P.x,d.z-P.z)<90){sfx('portaMetal',d.x,d.z,0.9);toast('corpo','A caixa militar abriu! Pegue o que tem dentro (E).');}else toast('radio','A caixa militar que você ligou abriu. O que tem dentro espera por você lá.');
  ganharXP(60);if(typeof diarioEvento==='function')diarioEvento('Abriu: '+d.nome.toLowerCase(),'evento');if(typeof conquista==='function')conquista('caixaMilitar');}
PASSOS.push(dt=>{if(G.modo!=='jogo')return;const C=cxmD();for(const d of CXM_DEF){const c=C[d.id];if(d.x===undefined)continue;
  if(!c.visto&&Math.hypot(d.x-P.x,d.z-P.z)<60){c.visto=true;dica('cxm','corpo','Caixa militar trancada por perto: segure E nela para ligar o cronômetro. Em 2 minutos abre, mas o alarme chama zumbis.');}
  if(c.st==='contando'){c.resta-=dt;c.bipT=(c.bipT||0)-dt;if(c.bipT<=0){c.bipT=3;if(Math.hypot(d.x-P.x,d.z-P.z)<120)sfx('bipe',d.x,d.z,0.9);barulho(d.x,d.z,40,false);}
    while(c.onda<CXM_ONDAS.length&&c.resta<=CXM_ONDAS[c.onda]){cxmOnda(d,c.onda);c.onda++;}
    if(c.resta<=0)cxmAbrir(d,c);}
  else if(c.st==='aberta'&&!(c.itens||[]).some(Boolean)&&G.dia>=c.dia+CXM_TRANCA&&Math.hypot(d.x-P.x,d.z-P.z)>50){c.st='trancada';c.itens=null;}}});
INTERS.push(tryIt=>{if(P.y<-20)return;for(const d of CXM_DEF){if(d.x===undefined||Math.abs(d.x-P.x)>4||Math.abs(d.z-P.z)>4)continue;tryIt({k:'cxm',o:d},d.x,d.z,2.2,2.0,-0.6,d.y);}});
INTER_K.cxm={texto:d=>{const c=cxmD()[d.id];
    if(c.st==='trancada')return{t:d.nome+' (trancada)',s:'segure: ligar o cronômetro · abre em 2 min, mas o alarme chama zumbis',hold:true,dur:1.4};
    if(c.st==='contando')return{t:d.nome+': abre em '+cxmTempo(c.resta),s:'o alarme está chamando os zumbis: defenda até abrir'};
    const n=(c.itens||[]).filter(Boolean).length;return n?{t:'Abrir a '+d.nome.toLowerCase(),s:n+(n>1?' coisas':' coisa')+' dentro'}:{t:d.nome+': vazia',s:'tranca de novo, com coisas novas, em alguns dias'};},
  usar:(d,seg)=>{const c=cxmD()[d.id];if(c.st==='trancada'){if(seg)cxmLigar(d);return;}if(c.st==='aberta'&&(c.itens||[]).some(Boolean))abrirBau({itens:c.itens,nome:d.nome});}};
HUDS.push(()=>{const el=$('missao-cxm');if(!el)return;let t='';if(G.cxm)for(const d of CXM_DEF){const c=G.cxm[d.id];if(c&&c.st==='contando'&&d.x!==undefined&&Math.hypot(d.x-P.x,d.z-P.z)<150){t='Caixa militar: abre em '+cxmTempo(c.resta)+'. Defenda!';break;}}
  if(el.textContent!==t)el.textContent=t;if(el.hidden!==!t)el.hidden=!t;});
INIT_MALHAS.push(()=>{const R=rng(9901),mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());},verde=lin(0x3d4a32),verde2=lin(0x2f3a27),aco=lin(0x55595c);
  MESH.cxm=mk(g=>{add(g,boxTris(1.5,0.62,0.9),mat(0,0.31,0),verde,{j:0.04,rnd:R});add(g,boxTris(1.56,0.1,0.96),mat(0,0.66,0),verde2);for(const sx of[-0.62,0.62])add(g,boxTris(0.08,0.66,0.94),mat(sx,0.33,0),verde2);
    add(g,boxTris(0.36,0.2,0.05),mat(0,0.44,0.46),aco);add(g,boxTris(0.5,0.04,0.3),mat(0,0.72,0.2),lin(0xd8c23a));add(g,boxTris(0.14,0.08,0.14),mat(0.45,0.75,-0.2),aco);});
  MESH.cxmAberta=mk(g=>{add(g,boxTris(1.5,0.62,0.9),mat(0,0.31,0),verde,{j:0.04,rnd:R});add(g,boxTris(1.56,0.08,0.96),mat(0,0.95,-0.62,-1.25,0,0),verde2);add(g,boxTris(1.4,0.05,0.8),mat(0,0.6,0),lin(0x1e241a));});
  MESH.cxmLuz=mk(g=>{add(g,boxTris(0.12,0.1,0.12),mat(0,0,0),lin(0xff3020),{e:3});});});
DESENHO.opaco.push(Pg=>{if(!MESH.cxm||cam.pos[1]<-20)return;for(const d of CXM_DEF){if(d.x===undefined||d2(d.x,d.z,cam.pos[0],cam.pos[2])>140*140)continue;const c=G.cxm&&G.cxm[d.id];
  drawStat(Pg,c&&c.st==='aberta'?MESH.cxmAberta:MESH.cxm,mat(d.x,d.y,d.z,0,d.yaw,0));if(c&&c.st==='contando'&&Math.sin(G.t*9)>0)drawStat(Pg,MESH.cxmLuz,mat(d.x,d.y+0.8,d.z,0,d.yaw,0));}});
MAPA_DESENHOS.push((g,X,Y)=>{if(!G.cxm)return;for(const d of CXM_DEF){const c=G.cxm[d.id];if(!c||d.x===undefined||(!c.visto&&c.st==='trancada'))continue;const x=X(d.x),y=Y(d.z);
  g.fillStyle=c.st==='contando'?'#ff4a3d':c.st==='aberta'?'#8a8a7a':'#7a9a4a';g.fillRect(x-3.5,y-2.5,7,5);g.strokeStyle='#111';g.lineWidth=1;g.strokeRect(x-3.5,y-2.5,7,5);}});
CONQ.push({id:'caixaMilitar',nome:'Aguentou o alarme',desc:'Abra uma caixa militar com cronômetro.'},{id:'armazemNorte',nome:'Sala de segurança',desc:'Termine o desafio do Armazém Norte.'});
V8.novo.cxm=()=>{G.cxm=null;cxmD();};
V8.salvar.cxm=()=>cxmD();
V8.carregar.cxm=s=>{G.cxm=s&&typeof s==='object'?s:null;cxmD();};

/* ---------- prédio-desafio: Armazém Norte ---------- */
iconesNovos({'i-fusivel':'<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M8 7h8M8 17h8M12 10v4"/>'});
Object.assign(ITEMS,{
  fusivel:{nome:'Fusível',icon:'i-fusivel',max:5,tipo:'material',desc:'Fusível de cartucho, ainda bom. O quadro de força do Armazém Norte está sem o dele.'},
  cartaoArmazem:{nome:'Cartão do armazém',icon:'i-cartao',max:1,tipo:'util',desc:'Cartão magnético do supervisor do Armazém Norte. Abre a sala de segurança: passe na porta dela.'}});
CID_LOOT.desafioFusivel=[['pregos',.6,3,8],['sucata',.6,1,3],['corda',.3,1,1],['pilhas',.25,1,2]];
CID_LOOT.desafioMesa=[['municao9',.5,6,12],['pilhas',.4,1,2],['remedios',.3,1,1],['racao',.3,1,1]];
CID_LOOT.desafioCofre=[['balaRifle',.95,12,24],['municao9',.85,20,40],['kit',.8,1,2],['colete',.45,1,1],['rifle',.3,1,1],['espingarda',.3,1,1],['cartucho',.5,6,12],['bombaCaseira',.45,1,2],['seringa',.5,1,2],['mascaraGas',.3,1,1]];
for(const[t,p]of[['oficina',.08],['pecas',.1],['deposito',.04],['armazem_caixa',.06],['fosso',.15],['metro_manut',.08]])if(CID_LOOT[t])CID_LOOT[t].push(['fusivel',p,1,1]);
for(const t of['oficina','militar'])lootMais('LOOT',t,['fusivel',1,1,0.06]);
const DSF={p:null};
function dsfD(){if(!G.dsf||typeof G.dsf!=='object')G.dsf={fus:false,luz:false,cartao:false,fim:0,visto:false};return G.dsf;}
/* monta o desafio nos dados da cidade (antes das malhas dos prédios: o quadro, o leitor e os móveis entram no desenho do prédio) */
{const _g=gerarCidade;gerarCidade=function(){_g.apply(this,arguments);try{dsfMontar();}catch(e){console.error('desafio do armazém',e);}};}
function dsfLivreU(p,u0,u1,v,r){for(let k=0;k<=12;k++){const u=u0+(u1-u0)*(k%2?0.5-k/26:0.5+k/26),w=pw(p,u,v);if(!pointBlocked(w[0],w[1],r))return u;}return(u0+u1)/2;}
function dsfMontar(){const p=CID.predios.find(q=>q.nome==='Armazém Norte'),q=CID.predios.find(q=>q.nome==='Armazém Sul');if(!p)return;DSF.p=p;
  const W=p.W,D=p.D,E=0.25,vB=D-E-5.2,ya=p.y0,S0=p.salas[0]||[],sal=S0.find(s=>s.tipo==='galpao'),dep=S0.find(s=>s.tipo==='estoque'),esc=S0.find(s=>s.tipo==='escritorio_loja');
  const PT=CID.portas.filter(d=>d.p===p&&d.f===0);DSF.portao=PT.find(d=>d.sA===sal&&d.sB===dep);DSF.cofre=PT.find(d=>d.sA===sal&&d.sB===esc);DSF.fundos=PT.find(d=>d.sA===dep&&d.sB==='fora');
  for(const[d,k]of[[DSF.portao,'portao'],[DSF.cofre,'cartao'],[DSF.fundos,'fundos']])if(d){d.desafio=k;d.estado='desafio';d.tipo='metal';d.hpMax=d.hp=900;d.alarme=false;portaColisor(d);}
  const vQ=vB-0.06,uQ=W*0.3+1.5;DSF.vQ=vQ;DSF.ya=ya;DSF.quadro={u:uQ,v:vQ-0.45};DSF.alavanca={u:uQ+0.9,v:vQ-0.45};
  peca(p,uQ-0.32,uQ+0.32,ya+0.8,ya+1.5,vQ-0.16,vQ,0x4a4f52,0.6);peca(p,uQ-0.26,uQ+0.26,ya+0.86,ya+1.44,vQ-0.19,vQ-0.15,0x2a2d30,0.6);
  peca(p,uQ+0.78,uQ+1.02,ya+0.95,ya+1.35,vQ-0.08,vQ,0x3a3d40,0.6);
  const uL=W*0.8-0.95;peca(p,uL-0.09,uL+0.09,ya+1.1,ya+1.38,vQ-0.07,vQ,0x1e2226,0.6);peca(p,uL-0.05,uL+0.05,ya+1.3,ya+1.34,vQ-0.08,vQ-0.07,0xd84a2a,0.6,0);
  if(dep)DSF.mesa=contExtra(p,dep,'mesa','desafioMesa',dsfLivreU(p,W*0.36,W*0.54,D-E-0.75,0.8),D-E-0.75,ya,0,'dsf',{sufixo:'m',desafio:'cartao'});
  if(esc)DSF.armario=contExtra(p,esc,'armarioArmas','desafioCofre',dsfLivreU(p,W*0.66,W-E-0.9,D-E-0.45,0.7),D-E-0.45,ya,Math.PI,'dsf',{sufixo:'a',desafio:'cofre'});
  if(q){const sq=(q.salas[0]||[]).find(s=>s.tipo==='galpao');if(sq){const u=q.W-E-0.4,vv=(sq.v0+sq.v1)/2;DSF.caixaSul=contExtra(q,sq,'caixaFerr','desafioFusivel',u,vv,q.y0,-Math.PI/2,'dsf',{sufixo:'f',desafio:'fusivel'});}}}
function dsfPos(o,dv){const w=pw(DSF.p,o.u,o.v+(dv||0));return w;}
function dsfPortasConferir(){const D=dsfD();if(DSF.portao)portaEstado(DSF.portao,D.luz?'aberta':'desafio');if(DSF.cofre)portaEstado(DSF.cofre,D.cartao?'aberta':'desafio');if(DSF.fundos&&DSF.fundos.estado!=='desafio')portaEstado(DSF.fundos,'desafio');}
/* portas do desafio: não quebram nem forçam; o portão abre com a energia e a sala de segurança com o cartão */
{const _t=portaTexto;portaTexto=function(d){if(d&&d.desafio&&d.estado==='desafio')return dsfPortaTexto(d);return _t.apply(this,arguments);};}
{const _u=portaUsar;portaUsar=function(d,seg){if(d&&d.desafio&&d.estado==='desafio'){dsfPortaUsar(d,seg);return;}return _u.apply(this,arguments);};}
{const _d=danoPorta;danoPorta=function(d){if(d&&d.desafio&&d.estado==='desafio')return;return _d.apply(this,arguments);};}
function dsfPortaTexto(d){const D=dsfD();
  if(d.desafio==='portao')return{t:'Portão de aço do estoque',s:D.fus?'puxe a alavanca do quadro de força':'sem energia: o quadro de força está sem fusível'};
  if(d.desafio==='cartao')return invCount('cartaoArmazem')?{t:'Passar o cartão na porta',s:'sala de segurança do armazém'}:{t:'Sala de segurança (leitor de cartão)',s:'precisa do cartão do supervisor'};
  return{t:'Porta dos fundos de aço',s:'travada por dentro'};}
function dsfPortaUsar(d){const D=dsfD();
  if(d.desafio==='cartao'&&invCount('cartaoArmazem')){invRemove('cartaoArmazem',1);D.cartao=true;D.fim=G.dia;portaEstado(d,'aberta');sfx('bipe',d.x,d.z,1);sfx('portaMetal',d.x,d.z,0.9);
    toast('corpo','O leitor aceitou o cartão: a sala de segurança abriu.');ganharXP(150);hudBarra();invRender();
    if(typeof diarioEvento==='function')diarioEvento('Abriu a sala de segurança do Armazém Norte','missao');if(typeof conquista==='function')conquista('armazemNorte');return;}
  feed(d.desafio==='portao'?'Sem energia':'Trancada',true);sfx('vazio');}
function dsfLigar(){const D=dsfD();if(!D.fus||D.luz)return;D.luz=true;const p=DSF.p,w=dsfPos(DSF.alavanca);sfx('puxar',w[0],w[1],1);sfx('alarme',w[0],w[1],1.3);
  if(DSF.portao){portaEstado(DSF.portao,'aberta');sfx('portaMetal',DSF.portao.x,DSF.portao.z,1);}barulho(w[0],w[1],55,false);
  toast('alerta','A energia voltou: o portão do estoque abriu e o alarme do armazém disparou! Vem zumbi.');
  if(typeof diarioEvento==='function')diarioEvento('Ligou a energia do Armazém Norte','missao');
  // a rua em frente: o alarme chama
  const n=Math.min(9,4+Math.floor(G.dia/4));for(let i=0;i<n;i++)for(let t=0;t<12;t++){const f=pw(p,p.W/2+(Math.random()-0.5)*16,-7-Math.random()*9);if(!pontoLivre(f[0],f[1]))continue;
    const q=criarZ(Math.random()<0.3?'runner':'walker',f[0],f[1],{st:'alerta',cidade:true,hx:f[0],hz:f[1]});if(q){q.ax=w[0];q.az=w[1];q.ay=DSF.ya;}break;}
  // e no estoque escuro, dois esperando
  const dep=(p.salas[0]||[]).find(s=>s.tipo==='estoque');if(dep)for(let i=0;i<2;i++)for(let t=0;t<12;t++){const u=dep.u0+0.8+Math.random()*(dep.u1-dep.u0-1.6),v=dep.v0+0.8+Math.random()*(dep.v1-dep.v0-1.6),f=pw(p,u,v);
    if(bloqueadoAlto(f[0],f[1],0.4,DSF.ya))continue;const q=criarZ('emboscada',f[0],f[1],{y:DSF.ya,cidade:true,hx:f[0],hz:f[1]});if(q)q.st='dorme';break;}}
INTERS.push(tryIt=>{const p=DSF.p;if(!p||P.y<-20||Math.abs(P.y-DSF.ya)>1.6)return;const c=pw(p,p.W/2,p.D/2);if(Math.abs(P.x-c[0])>18||Math.abs(P.z-c[1])>18)return;
  for(const k of['quadro','alavanca']){const w=dsfPos(DSF[k]);tryIt({k:'dsf_'+k,o:DSF[k]},w[0],w[1],1.8,1.5,0.1,DSF.ya);}});
INTER_K.dsf_quadro={texto:()=>{const D=dsfD();if(!D.fus)return invCount('fusivel')?{t:'Pôr o fusível no quadro de força',s:'o quadro está sem fusível'}:{t:'Quadro de força sem fusível',s:'ache um fusível: caixa de ferramentas do Armazém Sul, oficinas'};
    return D.luz?{t:'Quadro de força ligado',s:'a energia do armazém está ligada'}:{t:'Quadro de força: fusível no lugar',s:'agora puxe a alavanca do lado'};},
  usar:()=>{const D=dsfD();if(D.fus){feed(D.luz?'Ligado':'Puxe a alavanca do lado');return;}if(!invCount('fusivel')){feed('Falta um fusível',true);sfx('vazio');return;}
    invRemove('fusivel',1);D.fus=true;sfx('clique');sfx('construir');feed('Fusível no lugar');hudBarra();invRender();}};
INTER_K.dsf_alavanca={texto:()=>{const D=dsfD();if(D.luz)return{t:'Alavanca da energia (ligada)',s:'o portão do estoque está aberto'};
    return D.fus?{t:'Puxar a alavanca da energia',s:'abre o portão do estoque · o alarme vai tocar',hold:true,dur:1.0}:{t:'Alavanca da energia',s:'sem fusível no quadro, não acontece nada'};},
  usar:(o,seg)=>{const D=dsfD();if(!D.fus){sfx('puxar');feed('Nada: falta o fusível no quadro',true);return;}if(!D.luz&&seg)dsfLigar();}};
/* o que vai garantido nos móveis do desafio (cartão, fusível e o armário bom) e esconderijos nunca vazios */
function dsfPoe(c,id,n){if(!c.itens)c.itens=new Array(4).fill(null);let i=c.itens.indexOf(null);if(i<0){c.itens.push(null);i=c.itens.length-1;}c.itens[i]=newItem(id,n);c.estado='vasculhado';}
function garanteMinimo(c,minimo,extras){if(!c.itens)c.itens=new Array(4).fill(null);for(const[id,n]of extras){if(c.itens.filter(Boolean).length>=minimo)break;if(!ITEMS[id]||c.itens.some(q=>q&&q.id===id))continue;dsfPoe(c,id,n);}if(c.itens.some(Boolean))c.estado='vasculhado';}
{const _ce=contEncher;contEncher=function(c){_ce.apply(this,arguments);const D=dsfD();
  if(c.desafio==='cartao'&&!D.cartao&&!invCount('cartaoArmazem'))dsfPoe(c,'cartaoArmazem',1);
  if(c.desafio==='fusivel'&&!D.fus&&!invCount('fusivel'))dsfPoe(c,'fusivel',1);
  if(c.desafio==='cofre'){const pl=['plantaFerro','plantaEstufa','plantaRadio'].find(id=>!(G.fab&&G.fab.reg&&G.fab.reg.marcos&&G.fab.reg.marcos[id]!==undefined)&&!invCount(id));
    if(pl)dsfPoe(c,pl,1);garanteMinimo(c,4,[['balaRifle',12],['municao9',20],['kit',1],['colete',1]]);}
  if(c.tabela==='esconderijo')garanteMinimo(c,2,[['municao9',6],['kit',1],['remedios',2],['pistola',1]]);};}
/* alçapão do incêndio e caixa enterrada da mata: nunca vazios */
{const _r=rollLoot;rollLoot=function(t){const L=_r.apply(this,arguments);if(t==='esconderijo'){for(const q of[['municao9',8],['remedios',1],['racao',2]])if(L.length<2&&!L.some(x=>x[0]===q[0]))L.push(q);}return L;};}
if(CAIXA_CFG.vazia)CAIXA_CFG.vazia.escondida=0;
{const _s=sortearConteudo;sortearConteudo=function(cat){const L=_s.apply(this,arguments);if(cat==='escondida'&&!L.length)L.push(lootItem('sucata',2));return L;};}
/* recomeço do desafio: 5 dias depois de concluído, com você longe */
let dsfT=0;
PASSOS.push(dt=>{if(!DSF.p)return;dsfT-=dt;if(dsfT>0)return;dsfT=2;const D=dsfD(),c=pw(DSF.p,DSF.p.W/2,DSF.p.D/2),d=Math.hypot(P.x-c[0],P.z-c[1]);
  if(!D.visto&&d<24&&Math.abs(P.y-DSF.ya)<3){D.visto=true;if(typeof diarioDescobre==='function')diarioDescobre('lugar','armazemNorte','Armazém Norte: quadro de força, estoque trancado e sala de segurança',10);
    toast('corpo','Armazém Norte: o portão do estoque e a sala de segurança estão trancados. O quadro de força, perto do portão, está sem fusível.');}
  if(D.fim&&G.dia>=D.fim+5&&d>70){Object.assign(D,{fus:false,luz:false,cartao:false,fim:0});for(const q of[DSF.mesa,DSF.armario,DSF.caixaSul])if(q){q.estado='fechado';q.itens=null;q.t=0;}dsfPortasConferir();}});
/* desenho: luz do quadro (vermelha sem fusível, amarela com fusível, verde ligado) e a alavanca (em cima ou embaixo) */
INIT_MALHAS.push(()=>{const mk=f=>{const g=new GB(512,8);f(g);return litMesh(g.data());};
  MESH.dsfLuz={r:mk(g=>add(g,boxTris(0.08,0.08,0.05),mat(0,0,0),lin(0xff3020),{e:3})),a:mk(g=>add(g,boxTris(0.08,0.08,0.05),mat(0,0,0),lin(0xffb020),{e:3})),v:mk(g=>add(g,boxTris(0.08,0.08,0.05),mat(0,0,0),lin(0x40ff60),{e:3}))};
  MESH.dsfAlav=mk(g=>{add(g,boxTris(0.05,0.34,0.05),mat(0,0,0),lin(0x8a8e92));add(g,boxTris(0.1,0.08,0.1),mat(0,0.18,0),lin(0xd84a2a));});});
DESENHO.opaco.push(Pg=>{const p=DSF.p;if(!p||!MESH.dsfLuz||d2(pw(p,p.W/2,p.D/2)[0],pw(p,p.W/2,p.D/2)[1],cam.pos[0],cam.pos[2])>60*60)return;const D=dsfD();
  const l=pw(p,DSF.quadro.u,DSF.vQ-0.2);drawStat(Pg,D.luz?MESH.dsfLuz.v:D.fus?MESH.dsfLuz.a:MESH.dsfLuz.r,mat(l[0],DSF.ya+1.62,l[1],0,p.yaw,0));
  const a=pw(p,DSF.alavanca.u,DSF.vQ-0.14);drawStat(Pg,MESH.dsfAlav,mat(a[0],DSF.ya+(D.luz?0.86:1.32),a[1],0,p.yaw,0));});
V8.novo.dsf=()=>{G.dsf=null;dsfD();if(DSF.p)dsfPortasConferir();};
V8.salvar.dsf=()=>dsfD();
V8.carregar.dsf=s=>{G.dsf=s&&typeof s==='object'?s:null;dsfD();if(DSF.p)dsfPortasConferir();};

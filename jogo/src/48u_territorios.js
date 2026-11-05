/* ================= territórios, logística, expedições, comércio pelo rádio e dados do grupo =================
   Regiões estratégicas: posto (combustível), fazenda (comida), vila (pano, remédio, tábua), base militar (munição),
   estação (ferro velho), mina (minério e carvão), torre de rádio (escuta: mostra os eventos no mapa) e os sítios (água e
   fruta). Para tomar um lugar: limpe os zumbis em volta e finque a bandeira do grupo no ponto de controle. Território
   tomado produz um pouco a cada manhã no depósito dele (caixa ao lado da bandeira) e precisa de cuidado: a cada noite
   pode vir uma invasão. Se você estiver perto, a horda vem de verdade atrás da bandeira; se estiver longe, a defesa conta
   os vigias do grupo, as construções em volta e o controle do lugar. Perdeu? Limpe e finque a bandeira de novo.
   Logística: quem do grupo estiver em "Transportar" leva a produção dos depósitos para os baús da clareira toda manhã.
   Expedição: quem estiver em "Expedição" sai para o lugar que você escolher e volta com o que achar (cidade rende mais e
   arrisca mais). Comércio: com o rádio da clareira funcionando, grupos de longe oferecem trocas; você paga com o que tem
   na mochila ou nos baús e a carga chega na caixa de trocas da clareira na manhã seguinte. Tudo fica registrado.
   (Etapa 6: a aba virou o rádio, com sintonia por grupo, notícias, pedidos sob encomenda e acompanhamento: 48zc_radio.)
   Grupo: membros, papéis e permissões ficam salvos (prontos para um multiplayer futuro; nesta versão não há rede). */
const TERR_DEF=[
  {id:'posto',nome:'Posto de gasolina',x:92,z:-9,r:20,prod:{gasolina:[1,0.55],sucata:[2,0.7],pano:[1,0.3]}},
  {id:'fazenda',nome:'Fazenda',x:-72,z:60,r:24,prod:{milho:[2,0.8],batata:[2,0.7],carneCrua:[1,0.4],couro:[1,0.2]}},
  {id:'vila',nome:'Vila',x:62,z:-72,r:30,prod:{pano:[2,0.7],remedios:[1,0.3],tabuas:[2,0.6],feijao:[1,0.4]}},
  {id:'base',nome:'Base Militar',x:-108,z:-30,r:20,prod:{municao9:[6,0.7],balaRifle:[3,0.4],racao:[1,0.6]}},
  {id:'estacao',nome:'Estação ferroviária',x:128,z:-52,r:16,prod:{sucata:[2,0.8],pregos:[3,0.6],barraFerro:[1,0.25]}},
  {id:'mina',nome:'Mina velha',x:-88,z:-80,r:14,prod:{minerioFerro:[2,0.7],carvao:[2,0.6],pedra:[3,0.8]}},
  {id:'torre',nome:'Torre de rádio',x:-44,z:-110,r:14,prod:{pilhas:[1,0.3]},escuta:true}];
for(const p of PLACES)if(p.sitio)TERR_DEF.push({id:p.id,nome:p.nome,x:p.x,z:p.z,r:p.r+6,prod:{agua:[2,0.8],frutas:[2,0.6],sementes:[1,0.35]}});
const TERR_VAL={municao9:1,balaRifle:2,cartucho:2,racao:4,agua:2,kit:12,bandagem:3,remedios:6,seringa:10,gasolina:8,sucata:1,pregos:0.5,tabuas:1,madeira:0.5,pano:1,corda:2,
  couro:4,couroPequeno:2,carneDefumada:4,carneSeca:4,peixeDefumado:4,milho:1,batata:1,feijao:2,minerioFerro:2,barraFerro:5,chapaFerro:8,pilhas:3,sementes:1,mascaraGas:15,
  molotov:5,flecha:1,linha:1,sal:2,gordura:2,fibraHostil:1,bulboSeco:2,carneCrua:2,frutas:1,carvao:1,pedra:0.3};
const TERR_GRUPOS=[{id:'rio',nome:'Grupo do Rio Claro',da:['municao9','balaRifle','gasolina','pilhas'],quer:['carneDefumada','carneSeca','racao','feijao','milho']},
  {id:'serra',nome:'Comunidade da Serra',da:['carneDefumada','feijao','sal','couro','sementes'],quer:['barraFerro','pregos','sucata','tabuas','corda']},
  {id:'sitio',nome:'Família do Sítio',da:['milho','batata','sementes','frutas','agua'],quer:['remedios','bandagem','pano','linha','kit']},
  {id:'estrada',nome:'Mercadores da Estrada',da:['kit','seringa','mascaraGas','molotov','remedios'],quer:['gasolina','municao9','couro','chapaFerro','minerioFerro']}];
iconesNovos({'i-pessoa':'<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>','i-bandeira':'<path d="M5 21V3M5 4h11l-2 4 2 4H5"/>','i-troca':'<path d="M4 8h13l-3-3M20 16H7l3 3"/>'});
Object.assign(ITEMS,{bandeira:{nome:'Bandeira do grupo',icon:'i-bandeira',max:3,tipo:'util',desc:'Finque no ponto de controle de um lugar limpo de zumbis para tomar o território para o grupo.'}});
RECIPES.push({faz:'bandeira',n:1,custo:{pano:3,madeira:2,corda:1},cat:'materiais',etapa:1,est:0});
SOB_TAREFAS.transportar={n:'Transportar',d:'Toda manhã leva a produção dos territórios para os baús da clareira.'};
SOB_TAREFAS.expedicao={n:'Expedição',d:'Sai para o lugar escolhido e volta com o que achar. Lugar perigoso rende mais e arrisca mais.'};
const EXPEDICAO={vila:{nome:'Vila',dias:1,risco:0.12,loot:[['pano',1,3,0.7],['feijao',1,2,0.6],['remedios',1,1,0.3],['tabuas',1,3,0.5],['bandagem',1,2,0.4]]},
  posto:{nome:'Posto',dias:1,risco:0.12,loot:[['gasolina',1,1,0.45],['sucata',2,4,0.8],['pano',1,2,0.4],['pilhas',1,2,0.3]]},
  fazenda:{nome:'Fazenda',dias:1,risco:0.08,loot:[['milho',2,4,0.7],['batata',1,3,0.6],['sementes',1,3,0.5],['corda',1,1,0.3],['carneCrua',1,2,0.4]]},
  serra:{nome:'Serra e mina',dias:1,risco:0.18,loot:[['minerioFerro',1,3,0.6],['carvao',1,3,0.6],['pedra',2,5,0.8],['couro',1,1,0.2]]},
  cidade:{nome:'Cidade',dias:2,risco:0.3,loot:[['municao9',4,10,0.6],['remedios',1,2,0.5],['kit',1,1,0.25],['racao',1,2,0.5],['pilhas',1,3,0.4],['seringa',1,1,0.15],['barraFerro',1,2,0.25]]}};
/* ---------- estado ---------- */
function terrNovo(){const T={};for(const d of TERR_DEF)T[d.id]={dono:null,controle:0,dep:null,hp:300,inv:false,hist:[]};
  return{t:T,ofertas:[],precos:{},trocasPendentes:[],caixaTrocas:null,registro:[],dia:G.dia||1};}
function terrD(){if(!G.terr)G.terr=terrNovo();for(const d of TERR_DEF)if(!G.terr.t[d.id])G.terr.t[d.id]={dono:null,controle:0,dep:null,hp:300,inv:false,hist:[]};return G.terr;}
function grupoNovo(){return{id:'g-'+Math.random().toString(36).slice(2,8),nome:'Grupo da Clareira',criado:Date.now(),
  papeis:{lider:{construir:true,baus:true,territorio:true,trocar:true},membro:{construir:false,baus:true,territorio:false,trocar:false}},membros:[{id:'jogador',nome:'Você',papel:'lider'}],rede:false};}
function grupoD(){if(!G.grupo)G.grupo=grupoNovo();const g=G.grupo;// membros: você e quem está no acampamento
  if(typeof SOBREV!=='undefined')for(const s of SOBREV){const ok=s.st==='base'||s.st==='fora'||s.st==='caido';const m=g.membros.find(q=>q.id===s.id);if(ok&&!m)g.membros.push({id:s.id,nome:s.nome,papel:'membro'});if(!ok&&m&&m.id!=='jogador')g.membros.splice(g.membros.indexOf(m),1);}
  return g;}
function terrRegistro(txt,tipo){const D=terrD();D.registro.push({tm:Math.round(G.tm||0),txt,tipo:tipo||'terr'});if(D.registro.length>120)D.registro.splice(0,D.registro.length-120);if(typeof diarioEvento==='function')diarioEvento(txt,'evento');}
/* ponto de controle: um lugar livre perto do centro (calculado uma vez) */
function terrPonto(d){if(d.px!==undefined)return d;const R=rng(d.id.length*37+d.x*3);for(let r=4;r<d.r;r+=1.5)for(let k=0;k<10;k++){const a=R()*6.283,x=d.x+Math.cos(a)*r,z=d.z+Math.sin(a)*r;
    if(pointBlocked(x,z,1.6)||pointBlocked(x+1.4,z,0.7)||ruralEm(x,z,0.5)||(RIO.ok&&aguaPerto(x,z,2)))continue;d.px=x;d.pz=z;d.py=ground(x,z);return d;}d.px=d.x;d.pz=d.z;d.py=ground(d.x,d.z);return d;}
function zumbisNoTerr(d){let n=0;for(const z of Z)if(z.vivo&&!z.subsolo&&Math.hypot(z.x-d.x,z.z-d.z)<d.r)n++;return n;}
/* ---------- tomar ---------- */
function terrTomar(d){const T=terrD().t[d.id],g=grupoD();if(T.dono)return;if(!g.papeis.lider.territorio){feed('Seu papel no grupo não deixa tomar territórios',true);return;}
  const n=zumbisNoTerr(d);if(n>0){feed('Ainda tem '+n+(n>1?' zumbis':' zumbi')+' no '+d.nome.toLowerCase()+'. Limpe a área primeiro.',true);sfx('vazio');return;}
  if(!invCount('bandeira')){feed('Precisa de uma bandeira do grupo (pano, madeira e corda)',true);return;}
  invRemove('bandeira',1);T.dono=g.id;T.controle=60;T.hp=300;T.dep=T.dep||new Array(BAU_N).fill(null);T.desde=G.dia;sfx('missao');ganharXP(60);
  toast('corpo',d.nome+' agora é do seu grupo! Ele produz um pouco toda manhã (depósito ao lado da bandeira) e pode sofrer invasões à noite.');terrRegistro('Tomou: '+d.nome,'terr');
  if(typeof conquista==='function')conquista('territorio');if(Object.values(terrD().t).filter(q=>q.dono).length>=4&&typeof conquista==='function')conquista('territorios4');}
/* ---------- manhã: produção, invasões resolvidas de longe, logística, ofertas ---------- */
function terrAmanhece(){const D=terrD(),g=grupoD();
  for(const d of TERR_DEF){const T=D.t[d.id];if(!T.dono)continue;
    // invasão da noite que passou (se você não estava lá para ver)
    if(T.inv&&!T.invViu){const atk=(18+Math.min(110,G.dia*3.5))*(0.75+Math.random()*0.5),def=terrDefesa(d);
      if(def>=atk){T.controle=Math.max(10,T.controle-8);terrRegistro('Invasão no '+d.nome.toLowerCase()+': aguentou (defesa '+Math.round(def)+' contra '+Math.round(atk)+')','inv');toast('grupo','A horda atacou o '+d.nome.toLowerCase()+' esta noite, mas a defesa aguentou.');}
      else{terrPerder(d,'a horda passou por cima (defesa '+Math.round(def)+' contra '+Math.round(atk)+')');}}
    T.inv=false;T.invViu=false;if(!T.dono)continue;
    T.controle=Math.min(100,T.controle+6);T.hp=Math.min(300,T.hp+40);
    // produção
    const L=[];for(const id in d.prod){const[n,ch]=d.prod[id];if(Math.random()<ch*(T.controle<30?0.5:1))L.push([id,Math.max(1,Math.round(n*(0.6+Math.random()*0.8)))]);}
    for(const[id,n]of L)depAdd(T,id,n);T.ultProd=L;
    // a próxima noite pode ter invasão
    if(Math.random()<Math.min(0.42,0.12+G.dia*0.015)){T.inv=true;if(D.t.torre&&D.t.torre.dono)toast('radio','Escuta da torre: uma horda vai para o '+d.nome.toLowerCase()+' esta noite.');}}
  // logística: quem transporta leva os depósitos para os baús
  const carregadores=typeof SOBREV!=='undefined'?SOBREV.filter(s=>s.st==='base'&&s.tarefa==='transportar'&&s.hp>35):[];
  if(carregadores.length&&!bausBase().length)toast('grupo','Quem transporta não tem onde guardar: construa um baú perto da fogueira da clareira.');
  if(carregadores.length&&bausBase().length){let total=[];for(const d of TERR_DEF){const T=D.t[d.id];if(!T.dono||!T.dep)continue;let cap=12*carregadores.length;
      for(let i=0;i<T.dep.length&&cap>0;i++){const it=T.dep[i];if(!it)continue;const k=Math.min(it.n,cap);total.push([it.id,k]);it.n-=k;cap-=k;if(it.n<=0)T.dep[i]=null;}
      if(T.controle<40&&Math.random()<0.2){const s=carregadores[0];s.hp=Math.max(30,s.hp-30);toast('grupo',s.nome+' se machucou na estrada do '+d.nome.toLowerCase()+'.');}}
    const junta={};for(const[id,n]of total)junta[id]=(junta[id]||0)+n;const L=Object.entries(junta);if(L.length){depositarBase(L);toast('grupo',carregadores.map(s=>s.nome).join(' e ')+' trouxe dos territórios: '+nomesItens(L)+'.');terrRegistro('Logística: '+nomesItens(L),'log');}}
  // comércio: chega o que foi trocado ontem e o rádio traz ofertas novas
  if(D.trocasPendentes.length){if(typeof radioEntregas==='function')radioEntregas(D);
    else{if(!D.caixaTrocas)D.caixaTrocas=new Array(BAU_N).fill(null);for(const t of D.trocasPendentes){depAddL(D.caixaTrocas,t.da[0],t.da[1]);terrRegistro('Troca recebida de '+t.grupo+': '+t.da[1]+' '+ITEMS[t.da[0]].nome.toLowerCase(),'troca');}
      D.trocasPendentes=[];toast('radio','As trocas chegaram: estão na caixa de trocas, perto do rádio da clareira.');}}
  terrOfertas();}
AMANHECE.push(terrAmanhece);
function depAddL(L,id,n){const d=ITEMS[id];if(!d)return n;for(let i=0;i<L.length&&n>0;i++){const it=L[i];if(it&&it.id===id&&it.n<d.max){const k=Math.min(n,d.max-it.n);it.n+=k;n-=k;}}
  for(let i=0;i<L.length&&n>0;i++)if(!L[i]){const k=Math.min(n,d.max);L[i]=newItem(id,k);n-=k;}return n;}
function depAdd(T,id,n){if(!T.dep)T.dep=new Array(BAU_N).fill(null);return depAddL(T.dep,id,n);}
function terrDefesa(d){let v=0;const vig=typeof SOBREV!=='undefined'?SOBREV.filter(s=>s.st==='base'&&s.tarefa==='vigiar').length:0,nT=Math.max(1,Object.values(terrD().t).filter(q=>q.dono).length);
  v+=vig*28/nT;for(const o of OB){if(Math.hypot(o.x-d.x,o.z-d.z)>d.r)continue;const O=OBRAS[o.tipo];if(!O)continue;if(O.solid||O.armadilha||o.tipo==='torreVigia')v+=o.hp/90;}
  return v+terrD().t[d.id].controle/4;}
function terrPerder(d,motivo){const T=terrD().t[d.id];T.dono=null;T.controle=0;if(T.dep)for(let i=0;i<T.dep.length;i++)if(T.dep[i]&&Math.random()<0.5)T.dep[i]=null;
  toast('alerta','Perdemos o '+d.nome.toLowerCase()+': '+motivo+'. Limpe a área e finque a bandeira de novo.');terrRegistro('Perdeu: '+d.nome+' ('+motivo+')','inv');}
/* ---------- invasão de verdade quando você está perto à noite ---------- */
let terrNoiteAnt=null,terrT=0;
PASSOS.push(dt=>{const D=terrD();if(terrNoiteAnt===null)terrNoiteAnt=G.noite;
  if(G.noite&&!terrNoiteAnt){for(const d of TERR_DEF){const T=D.t[d.id];if(!T.dono||!T.inv)continue;terrPonto(d);if(Math.hypot(P.x-d.px,P.z-d.pz)<80&&P.y>SUB_FUNDO)terrInvasaoReal(d);}}
  terrNoiteAnt=G.noite;
  terrT-=dt;if(terrT>0)return;terrT=0.5;
  for(const d of TERR_DEF){const T=D.t[d.id];if(!T.dono||!T.invViu||d.px===undefined)continue;let n=0;
    for(const z of Z){if(!z.vivo||z.terrAlvo!==d.id)continue;n++;if(Math.hypot(z.x-d.px,z.z-d.pz)<2.6){T.hp-=3;if(Math.random()<0.2)sfx('golpe',d.px,d.pz,0.6);}else if(z.st==='vaga'){z.st='alerta';z.ax=d.px;z.az=d.pz;z.ay=d.py;}}
    if(T.hp<=0){terrPerder(d,'a horda derrubou a bandeira');T.invViu=false;}else if(n===0&&T.invAtiva){T.invAtiva=false;T.controle=Math.min(100,T.controle+10);toast('corpo','Você defendeu o '+d.nome.toLowerCase()+'!');terrRegistro('Defendeu: '+d.nome,'inv');ganharXP(50);}}});
function terrInvasaoReal(d){const T=terrD().t[d.id];T.invViu=true;T.invAtiva=true;const n=6+Math.min(10,Math.floor(G.dia/2));
  for(let i=0;i<n;i++){for(let k=0;k<10;k++){const a=Math.random()*6.283,r=34+Math.random()*10,x=d.px+Math.cos(a)*r,z=d.pz+Math.sin(a)*r;if(!pontoLivre(x,z))continue;
    const q=criarZ(Math.random()<0.18?'runner':'walker',x,z,{st:'alerta'});if(q){q.terrAlvo=d.id;q.ax=d.px;q.az=d.pz;q.ay=d.py;}break;}}
  toast('alerta','Invasão! Uma horda está indo para a bandeira do '+d.nome.toLowerCase()+'. Defenda o território.');sfx('horda',d.px,d.pz);}
/* ---------- comércio pelo rádio ---------- */
function terrRadioOk(){return!!(G.m&&G.m.etapa>=2);}
function terrOfertas(){const D=terrD();if(!terrRadioOk()){D.ofertas=[];return;}
  for(const id in TERR_VAL)D.precos[id]=clamp((D.precos[id]||1)*(0.85+Math.random()*0.3),0.7,1.45);
  // no ar hoje: com a antena da base, os quatro grupos e duas ofertas de cada; sem ela, um grupo some do ar e cada um faz uma oferta
  const ant=temAntenaBase(),fora=ant?null:TERR_GRUPOS[Math.floor(Math.random()*TERR_GRUPOS.length)].id;D.ofertas=[];
  for(const g of TERR_GRUPOS){if(g.id===fora)continue;const usados=[];
    for(let k=0;k<(ant?2:1);k++){const opc=g.da.filter(q=>ITEMS[q]&&!usados.includes(q)),qs=g.quer.filter(q=>ITEMS[q]);if(!opc.length||!qs.length)break;
      const da=opc[Math.floor(Math.random()*opc.length)],quer=qs[Math.floor(Math.random()*qs.length)];usados.push(da);
      const nDa=Math.max(1,Math.round((TERR_VAL[da]>=8?1:TERR_VAL[da]>=4?3:6)*(0.8+Math.random()*0.6))),valor=nDa*TERR_VAL[da]*(D.precos[da]||1),nQuer=Math.max(1,Math.round(valor*(D.precos[quer]||1)/TERR_VAL[quer]));
      D.ofertas.push({id:'o'+G.dia+'_'+g.id+(k?'_'+k:''),g:g.id,grupo:g.nome,da:[da,nDa],quer:[quer,nQuer],aceita:false});}}
  if(typeof radioDia==='function')radioDia(fora);}
function terrTem(id){return invCount(id)+(typeof contarBase==='function'?contarBase(it=>it.id===id):0);}
function terrAceitar(o){const D=terrD(),g=grupoD();if(o.aceita)return;if(!g.papeis.lider.trocar){feed('Seu papel no grupo não deixa fazer trocas',true);return;}
  const[q,n]=o.quer;if(terrTem(q)<n){feed('Falta: '+n+' '+ITEMS[q].nome.toLowerCase(),true);sfx('vazio');return;}
  let falta=n;const m=Math.min(falta,invCount(q));if(m){invRemove(q,m);falta-=m;}while(falta>0&&tirarDaBase(it=>it.id===q))falta--;
  o.aceita=true;{const t={grupo:o.grupo,da:o.da.slice()};if(typeof radioPendente==='function')radioPendente(t,o);D.trocasPendentes.push(t);}terrRegistro('Troca com '+o.grupo+': '+n+' '+ITEMS[q].nome.toLowerCase()+' por '+o.da[1]+' '+ITEMS[o.da[0]].nome.toLowerCase(),'troca');
  sfx('missao');toast('radio',o.grupo+': combinado! A carga chega amanhã cedo na caixa de trocas da clareira.');terrRender();}
/* ---------- interações: bandeira, depósito, caixa de trocas ---------- */
const CAIXA_TROCAS={x:3.2,z:-3.6};
INTERS.push(tryIt=>{if(P.y<SUB_FUNDO)return;const D=terrD();
  for(const d of TERR_DEF){if(Math.abs(d.x-P.x)>d.r+6||Math.abs(d.z-P.z)>d.r+6)continue;terrPonto(d);const T=D.t[d.id];
    tryIt({k:'terrBandeira',o:d},d.px,d.pz,2.2,2.3,-0.7,d.py);if(T.dono)tryIt({k:'terrDeposito',o:d},d.px+1.4,d.pz,1.8,2.0,-0.6,d.py);}
  if(Math.abs(CAIXA_TROCAS.x-P.x)<3&&Math.abs(CAIXA_TROCAS.z-P.z)<3&&D.caixaTrocas&&D.caixaTrocas.some(Boolean))tryIt({k:'terrCaixaTrocas',o:D},CAIXA_TROCAS.x,CAIXA_TROCAS.z,1.8,2,-0.6);});
INTER_K.terrBandeira={texto:d=>{const T=terrD().t[d.id];if(T.dono)return{t:d.nome+': território do grupo',s:'controle '+Math.round(T.controle)+'%'+(T.inv?' · horda vindo esta noite':'')+' · K abre os territórios'};
    const n=zumbisNoTerr(d);return{t:'Tomar o '+d.nome.toLowerCase(),s:n?'limpe a área: '+n+(n>1?' zumbis':' zumbi'):invCount('bandeira')?'segure: fincar a bandeira':'precisa de uma bandeira do grupo',hold:!n&&!!invCount('bandeira'),dur:2.2};},
  usar:(d,seg)=>{const T=terrD().t[d.id];if(T.dono){abrirTerritorios();return;}if(!seg&&!zumbisNoTerr(d)&&invCount('bandeira'))return;terrTomar(d);}};
INTER_K.terrDeposito={texto:d=>{const T=terrD().t[d.id],n=(T.dep||[]).filter(Boolean).length;return{t:'Depósito do '+d.nome.toLowerCase(),s:n?n+' tipos de coisa guardados':'vazio: produz toda manhã'};},
  usar:d=>{const T=terrD().t[d.id];if(!T.dep)T.dep=new Array(BAU_N).fill(null);abrirBau({itens:T.dep,nome:'Depósito: '+d.nome});}};
INTER_K.terrCaixaTrocas={texto:()=>({t:'Caixa de trocas',s:'o que chegou pelo rádio'}),usar:D=>abrirBau({itens:D.caixaTrocas,nome:'Caixa de trocas'})};
/* ---------- desenho: bandeira e depósito dos territórios, caixa de trocas ---------- */
INIT_MALHAS.push(()=>{const R=rng(7171),mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());};
  MESH.terrMastro=mk(g=>{add(g,cylTris(0.06,0.07,4.2,8),mat(0,0,0),lin(0x8a8e92));add(g,cylTris(0.35,0.4,0.25,10),mat(0,0,0),lin(0x6a6a62),{j:0.05,rnd:R});});
  MESH.terrPano=mk(g=>{for(let i=0;i<6;i++)add(g,boxTris(0.24,1.0,0.03),mat(0.14+i*0.23,3.55,Math.sin(i*1.1)*0.06),lin(i%2?0xc9402a:0xd85a3a),{j:0.04,rnd:R});add(g,boxTris(0.5,0.3,0.035),mat(0.7,3.55,0.02),lin(0xf0e0c0));});
  MESH.terrDep=mk(g=>{add(g,boxTris(1.1,0.7,0.75),mat(0,0.35,0),lin(0x6b4e30),{j:0.06,rnd:R});add(g,boxTris(1.12,0.08,0.77),mat(0,0.72,0),lin(0x5a4028));add(g,boxTris(0.3,0.2,0.02),mat(0,0.45,0.38),lin(0xc9402a));});});
DESENHO.opaco.push(Pg=>{if(!MESH.terrMastro||cam.pos[1]<SUB_FUNDO||!G.terr)return;const D=G.terr;
  for(const d of TERR_DEF){const T=D.t[d.id];if(!T||!T.dono||d.px===undefined)continue;if(d2(d.px,d.pz,cam.pos[0],cam.pos[2])>170*170)continue;
    drawStat(Pg,MESH.terrMastro,mat(d.px,d.py,d.pz));drawStat(Pg,MESH.terrPano,mat(d.px,d.py,d.pz,0,Math.sin(G.t*0.8)*0.25,0));drawStat(Pg,MESH.terrDep,mat(d.px+1.4,d.py,d.pz));}
  if(D.caixaTrocas&&D.caixaTrocas.some(Boolean))drawStat(Pg,MESH.terrDep,mat(CAIXA_TROCAS.x,ground(CAIXA_TROCAS.x,CAIXA_TROCAS.z),CAIXA_TROCAS.z,0,0.5,0));});
MAPA_DESENHOS.push((g,X,Y,k,n)=>{const D=G.terr;if(!D)return;for(const d of TERR_DEF){const T=D.t[d.id];if(!T)continue;const x=X(d.x),y=Y(d.z);
  if(T.dono){g.strokeStyle=T.inv?'#ff6a4a':'#e8c060';g.lineWidth=2;g.beginPath();g.arc(x,y,Math.max(5,d.r*k),0,6.283);g.stroke();g.fillStyle='#c9402a';g.fillRect(x-1,y-7,1.6,7);g.fillRect(x+0.6,y-7,4,2.6);}}
  // a escuta da torre mostra os eventos do mundo no mapa
  if(((D.t.torre&&D.t.torre.dono)||temAntenaBase())&&G.mundo){g.strokeStyle='rgba(255,200,120,.8)';g.lineWidth=1;for(const e of G.mundo.ev){if(e.fim)continue;g.beginPath();g.arc(X(e.x),Y(e.z),7,0,6.283);g.stroke();}}});
/* ---------- expedições: destino escolhido no painel do grupo ---------- */
function grupoExtra(s){if(s.tarefa!=='expedicao')return'';const dest=s.exp||'vila';let h='<div class="g-dest"><b>Destino da expedição</b><div>';
  for(const k in EXPEDICAO){const E=EXPEDICAO[k];h+='<button type="button" class="btn'+(k===dest?' prim':'')+'" data-dest="'+k+'">'+E.nome+' · '+E.dias+(E.dias>1?' dias':' dia')+' · risco '+Math.round(E.risco*100)+'%</button>';}
  return h+'</div></div>';}
{const el=document.getElementById('g-tarefas');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-dest]');if(!b||!grupoSel)return;grupoSel.exp=b.dataset.dest;sfx('clique');grupoRender();
  $('g-fala').textContent='“'+({vila:'Vila? Tranquilo, volto antes de escurecer.',posto:'Vou ver se sobrou gasolina no posto.',fazenda:'A fazenda sempre tem alguma coisa.',serra:'Vou subir a serra. Se tiver urso, eu corro.',cidade:'A cidade... são dois dias. Se eu não voltar, não vá atrás.'}[grupoSel.exp])+'”';});}
function expSaem(){for(const s of SOBREV)if(s.st==='base'&&s.tarefa==='expedicao'&&s.hp>45){const E=EXPEDICAO[s.exp||'vila'];s.st='fora';s.ch.vis=false;s.saiu=G.dia;s.volta=G.dia+E.dias-1;s.expAtual=s.exp||'vila';terrRegistro(s.nome+' saiu em expedição: '+E.nome,'exp');}}
function expVoltam(){for(const s of SOBREV){if(s.st!=='fora'||!s.expAtual)continue;if(G.dia<s.volta)continue;const E=EXPEDICAO[s.expAtual];s.st='base';const a=-0.4+s.i*0.3;s.x=FIRE[0]+Math.sin(a)*13;s.z=FIRE[2]+Math.cos(a)*13;s.y=ground(s.x,s.z);
    const L=[];for(const[id,a0,b0,ch]of E.loot)if(ITEMS[id]&&Math.random()<ch*(s.def.hab==='buscar'?1.3:1))L.push([id,a0+Math.floor(Math.random()*(b0-a0+1))]);if(!L.length)L.push(['sucata',2]);
    depositarBase(L);let mach='';if(Math.random()<E.risco){s.hp=Math.max(22,s.hp-(35+Math.random()*30));s.danoT=8;mach=' Voltou machucado.';}
    toast('grupo',s.nome+' voltou da expedição ('+E.nome.toLowerCase()+') com: '+nomesItens(L)+'.'+mach);terrRegistro(s.nome+' voltou de '+E.nome+': '+nomesItens(L)+(mach?' (ferido)':''),'exp');s.expAtual=null;}}
let expHora=null;
PASSOS.push(()=>{if(typeof SOBREV==='undefined')return;const h=G.hora;if(expHora!==null){if(crossed(expHora,h,7.5))expSaem();if(crossed(expHora,h,17.4))expVoltam();}expHora=h;});
/* ---------- tela ---------- */
let terrAba='terr';
function abrirTerritorios(){if(G.modo==='jogo')pausar();tela('t-terr');terrRender();}
function terrRender(){const D=terrD(),g=grupoD(),el=$('tr-lista');if(!el)return;for(const b of document.querySelectorAll('.tr-aba'))b.setAttribute('aria-pressed',String(b.dataset.aba===terrAba));
  const li=(ico,t,s,ok,extra)=>'<li class="'+(ok?'ok':'')+'">'+svgUse(ico)+'<span><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+(extra||'')+'</span></li>';let h='',res='';
  if(terrAba==='terr'){const meus=TERR_DEF.filter(d=>D.t[d.id].dono);res=meus.length+' de '+TERR_DEF.length+' territórios do grupo';
    for(const d of TERR_DEF){const T=D.t[d.id];const prod=Object.keys(d.prod).map(k=>ITEMS[k]?ITEMS[k].nome.toLowerCase():k).join(', ');
      if(T.dono){const dep=(T.dep||[]).filter(Boolean);h+=li('i-bandeira',d.nome,'controle '+Math.round(T.controle)+'% · defesa '+Math.round(terrDefesa(d))+(T.inv?' · <em>horda esperada esta noite</em>':'')+'<br>produz: '+prod+(dep.length?'<br>no depósito: '+dep.map(q=>q.n+' '+ITEMS[q.id].nome.toLowerCase()).join(', '):''),true);}
      else h+=li('i-mapa',d.nome,'livre · produz: '+prod+(d.escuta?' · a escuta mostra os eventos no mapa':''),false);}}
  else if(terrAba==='troca'&&typeof radioRender==='function'){const r=radioRender();res=r.res;h=r.h;}
  else if(terrAba==='troca'){res=terrRadioOk()?'Ofertas de hoje pelo rádio':'O rádio da clareira ainda não funciona';
    if(!terrRadioOk())h=li('i-radio','Sem rádio','Conserte o rádio da clareira (missão) para falar com outros grupos.',false);
    for(const o of D.ofertas){const[q,n]=o.quer,[dd,nd]=o.da;const tem=terrTem(q);h+='<li class="'+(o.aceita?'ok':'')+'">'+svgUse('i-troca')+'<span><b>'+o.grupo+'</b><small>dão '+nd+' '+ITEMS[dd].nome.toLowerCase()+' · querem '+n+' '+ITEMS[q].nome.toLowerCase()+' (você tem '+tem+')</small></span>'+
      (o.aceita?'<em class="tr-ok">combinado</em>':'<button type="button" class="btn'+(tem>=n?' prim':'')+'" data-oferta="'+o.id+'"'+(tem>=n?'':' disabled')+'>Trocar</button>')+'</li>';}
    if(D.trocasPendentes.length)h+=li('i-relogio','Chegam amanhã cedo',D.trocasPendentes.map(t=>t.da[1]+' '+ITEMS[t.da[0]].nome.toLowerCase()+' ('+t.grupo+')').join(', '),true);}
  else if(terrAba==='grupo'){res=g.nome+' · '+g.membros.length+(g.membros.length>1?' membros':' membro');
    for(const m of g.membros)h+=li(m.papel==='lider'?'i-trofeu':'i-pessoa',m.nome,m.papel==='lider'?'líder':'membro',m.papel==='lider');
    for(const p of['membro']){const P0=g.papeis[p];h+='<li class="tr-perm">'+svgUse('i-cadeado')+'<span><b>Permissões de quem é membro</b><small>'+
      [['construir','Construir'],['baus','Mexer nos baús'],['territorio','Tomar territórios'],['trocar','Fazer trocas']].map(([k,n])=>'<label><input type="checkbox" data-perm="'+k+'"'+(P0[k]?' checked':'')+'> '+n+'</label>').join(' ')+'</small></span></li>';}
    h+=li('i-radio','Multiplayer','Os dados do grupo, papéis e permissões ficam salvos e prontos. Nesta versão o jogo não tem conexão online: o grupo é você e os sobreviventes.',false);}
  else{res=D.registro.length+' registros';for(let i=D.registro.length-1;i>=0;i--){const r=D.registro[i];h+=li(r.tipo==='troca'?'i-troca':r.tipo==='inv'?'i-alerta':r.tipo==='exp'?'i-mapa':'i-bandeira',r.txt,quandoTxt(r.tm),true);}if(!D.registro.length)h=li('i-livro','Nada registrado ainda','',false);}
  $('tr-resumo').textContent=res;el.innerHTML=h;}
TELAS_NOVAS.push('t-terr');
{for(const b of document.querySelectorAll('.tr-aba'))b.addEventListener('click',()=>{terrAba=b.dataset.aba;terrRender();});
 const l=document.getElementById('tr-lista');if(l){l.addEventListener('click',e=>{const b=e.target.closest('[data-oferta]');if(b){const o=terrD().ofertas.find(q=>q.id===b.dataset.oferta);if(o)terrAceitar(o);}});
   l.addEventListener('change',e=>{const c=e.target.closest('[data-perm]');if(c){grupoD().papeis.membro[c.dataset.perm]=c.checked;terrRegistro('Permissão de membro: '+c.dataset.perm+' = '+(c.checked?'sim':'não'),'grupo');}});}
 const v=document.getElementById('tr-voltar');if(v)v.addEventListener('click',()=>tela('t-pausa'));
 const p=document.getElementById('p-terr');if(p)p.addEventListener('click',abrirTerritorios);}
window.addEventListener('keydown',e=>{if(e.code==='KeyK'&&G.modo==='jogo'&&!e.repeat)abrirTerritorios();});
CONQ.push({id:'territorio',nome:'Bandeira fincada',desc:'Tome o primeiro território para o grupo.'},{id:'territorios4',nome:'Dono da região',desc:'Tenha 4 territórios ao mesmo tempo.'});
/* ---------- salvar e carregar ---------- */
V8.novo.territorios=()=>{G.terr=terrNovo();G.grupo=grupoNovo();};
V8.salvar.territorios=()=>({terr:terrD(),grupo:grupoD()});
V8.carregar.territorios=s=>{G.terr=s&&s.terr?s.terr:terrNovo();G.grupo=s&&s.grupo?s.grupo:grupoNovo();terrD();};

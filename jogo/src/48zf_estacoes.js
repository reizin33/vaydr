/* ================= estações do ano, temperatura, fases da lua e eclipses (Etapa 8) =================
   O ano tem quatro estações de 7 dias de jogo (começa na primavera). Cada estação muda de verdade:
   · temperatura (no relógio, em °C): de dia esquenta até a tarde, de noite fica na mínima; o tempo do dia, a serra (mais alta)
     e o eclipse mudam também. Noite de verão não dá frio; no inverno faz frio até de dia quando passa de 10 °C para baixo
     (roupa quente, abrigo e fogo resolvem); no calor forte do verão a sede aperta ao sol.
   · plantação: horta, canteiros e pomar crescem mais na primavera, normal no verão, menos no outono e pouco no inverno
     (a estufa continua dando verdura toda manhã).
   · comida no mato: os arbustos voltam a dar fruta em 2 dias na primavera e no verão, 3 no outono e 5 no inverno; mais
     cogumelos no outono; o peixe morde mais rápido no verão e mais devagar no inverno.
   · animais: na primavera nascem mais filhotes; no inverno a população cresce devagar e os predadores famintos te percebem
     de mais longe.
   · tempo: verão com calorão e temporal no fim da tarde; inverno com frente fria, céu fechado o dia todo e neve na serra;
     outono com ventania e folhas caindo; primavera com chuva e neblina. E períodos de vários dias de chuva, de seca e ondas
     de frio (avisados no rádio), além da garoa (chuva fraca).
   · aparência: cor das copas (outono amarelo e laranja, inverno seco), cor da luz, força do vento e folhas voando.
   Lua: ciclo de 8 dias (nova, crescente, cheia e minguante), com o desenho certo no céu. Lua cheia clareia a noite (você, os
   zumbis e os bichos enxergam mais longe, e a horda vem um pouco maior); lua nova escurece. Eclipse do sol ao meio-dia a cada
   13 dias, avisado no rádio de manhã: escurece como a noite, esfria e eles aparecem. Eclipse da lua em algumas noites de lua
   cheia: a lua fica vermelha e escura. Tudo sai do dia do jogo e do tempo sorteado (os dois ficam salvos). */
iconesNovos({'i-flor':'<circle cx="12" cy="10" r="2.4"/><path d="M12 7.6c0-2.6 3.2-2.6 3.2 0M14.4 10c2.6 0 2.6 3.2 0 3.2M12 12.4c0 2.6-3.2 2.6-3.2 0M9.6 10c-2.6 0-2.6-3.2 0-3.2M12 12.4V21M12 17c2-.5 3-2 3.5-3.5"/>',
  'i-folha':'<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
  'i-floco':'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.6 12 6l2-1.4M10 19.4 12 18l2 1.4"/>',
  'i-vento':'<path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 13h15a3 3 0 1 1-3 3M3 17h7"/>'});
const ESTACOES_ANO=[
  {id:'primavera',nome:'Primavera',icon:'i-flor',temp:[15,25],horta:1.2,arbusto:2,fauna:1.6,peixe:0.9,cogu:1,pred:1,folhas:0.7,vento:1,
    luz:{gain:[0.99,1.04,0.97],sat:1.05},peso:{neblina:1.3,chuva:1.35,calor:0.7,frio:0.6,tempestade:0.9,garoa:1.2,ventania:0.7,escuro:0.4},
    copa:{1:[0.94,1.08,0.9],3:[0.98,1.08,0.9],0:[1,1.03,1]}},
  {id:'verao',nome:'Verão',icon:'i-sol',temp:[21,33],horta:1,arbusto:2,fauna:1.1,peixe:0.75,cogu:0.7,pred:1,folhas:0.5,vento:0.9,
    luz:{gain:[1.06,1.02,0.92],sat:1.05},peso:{neblina:0.5,chuva:1,calor:2.6,frio:0,tempestade:1.7,garoa:0.4,ventania:0.6,escuro:0.2},
    copa:{1:[1.03,1,0.86],3:[1.04,1.02,0.88],0:[1,1,0.97]}},
  {id:'outono',nome:'Outono',icon:'i-folha',temp:[11,23],horta:0.8,arbusto:3,fauna:0.8,peixe:1,cogu:2.2,pred:1.1,folhas:2.6,vento:1.3,
    luz:{gain:[1.06,0.98,0.86],sat:0.97},peso:{neblina:1.2,chuva:1.2,calor:0.5,frio:1.2,tempestade:0.8,garoa:1.3,ventania:2.2,escuro:0.8},
    copa:{1:[1.42,0.98,0.5],3:[1.42,1.24,0.56],0:[1,0.97,0.94]}},
  {id:'inverno',nome:'Inverno',icon:'i-floco',temp:[2,16],horta:0.35,arbusto:5,fauna:0.4,peixe:1.2,cogu:0.6,pred:1.3,folhas:0.35,vento:1.15,
    luz:{gain:[0.94,0.98,1.07],sat:0.82},peso:{neblina:1.4,chuva:0.8,calor:0,frio:2.6,tempestade:0.4,garoa:1.1,ventania:1.2,escuro:1.8},
    copa:{1:[0.92,0.8,0.68],3:[1.08,1.02,0.92],0:[0.9,0.95,0.98]}}];
const DIAS_ESTACAO=7,LUA_CICLO=8;
const LUA_NOMES=['Lua nova','Lua crescente','Quarto crescente','Crescente gibosa','Lua cheia','Minguante gibosa','Quarto minguante','Lua minguante'];
function estacaoIdx(dia){return Math.floor(Math.max(0,(dia??G.dia??1)-1)/DIAS_ESTACAO)%4;}
function estacao(dia){return ESTACOES_ANO[estacaoIdx(dia)];}
function estacaoDiaN(dia){return(Math.max(0,(dia??G.dia??1)-1)%DIAS_ESTACAO)+1;}
/* ---------- lua ---------- */
function luaFase(dia){return((dia??G.dia??1)+1)%LUA_CICLO;}   // dia 1: crescente; a primeira cheia é no dia 3
function luaIlum(dia){return G.luaSangue?1:(1-Math.cos(2*Math.PI*luaFase(dia)/LUA_CICLO))/2;}
function luaNome(dia){return G.luaSangue?'Lua de sangue':LUA_NOMES[luaFase(dia)];}
function luaHorda(){return!G.luaSangue&&luaFase()===4?1.15:1;}   // lua cheia: a horda vem um pouco maior
/* ---------- eclipses ---------- */
function eclipseSolarDia(d){d=d??G.dia;return d>=6&&(d*7+3)%13===0;}
function eclipseSolarK(){if(!eclipseSolarDia())return 0;const h=G.hora;if(h<11.8||h>13.6)return 0;return clamp(Math.min((h-11.8)/0.5,(13.6-h)/0.5),0,1);}
function eclipseLunarDia(d){d=d??G.dia;return d>=9&&luaFase(d)===4&&d%3===2;}
function eclipseLunarK(){if(!eclipseLunarDia())return 0;const h=G.hora<6?G.hora+24:G.hora;if(h<22.8||h>25.6)return 0;return clamp(Math.min((h-22.8)/0.5,(25.6-h)/0.5),0,1);}
/* ---------- temperatura ---------- */
function naSerra(x,z){return Math.hypot(x-SERRA.x,z-SERRA.z)<SERRA.sig*2.1;}
function nevando(){return estacaoIdx()===3&&naSerra(P.x,P.z)&&!!G.clima&&['frio','garoa','escuro','nublado','chuva'].includes(G.clima.atual);}
function temperatura(x,z){const E0=estacao(),mn=E0.temp[0],mx=E0.temp[1],h=G.hora;const s=h>=6&&h<=20?Math.sin(Math.PI*(h-6)/14):0;
  let t=mn+(mx-mn)*s;
  t+=5*climaK('calor')-8*climaK('frio')-3*Math.max(climaK('chuva'),0.7*climaK('garoa'))-4*climaK('tempestade')-2*climaK('nublado')-1.5*climaK('neblina')-3*climaK('escuro')-2.5*climaK('ventania');
  if(naSerra(x??P.x,z??P.z))t-=5;if(nevando())t-=2;t-=5*eclipseSolarK();return t;}
/* frio pela temperatura (0 a 1); noite de verão não dá frio; calor forte dá sede ao sol */
{const _f=climaFrio;climaFrio=function(){return Math.max(_f.apply(this,arguments),clamp((10-temperatura())/12,0,1));};}
{const _cf=comFrio;comFrio=function(){if(!P.alive||CARRO.ativo||pertoDoFogo())return false;const ab=typeof abrigado==='function'&&abrigado(),cal=calorRoupa()+(ab?0.35:0);
  return((E.n||0)>0.6&&temperatura()<18&&cal<0.99)||climaFrio()*(ab?0.5:1)>cal+0.01;};}
{const _s=climaSede;climaSede=function(){let k=_s.apply(this,arguments);const T=temperatura();
  if(T>29&&(E.n||0)<0.5){const sombra=CARRO.ativo||((emPredios(P.x,P.z,2)||P.y<-20)&&interiorEm(P.x,P.y+0.3,P.z)>0.5);k*=1+(sombra?0.1:0.35)*Math.min(1,(T-29)/5);}return k;};}
/* plantação, peixe, bichos */
{const _h=climaHorta;climaHorta=function(){return _h.apply(this,arguments)*estacao().horta;};}
{const _p=peixeMult;peixeMult=function(){return _p.apply(this,arguments)*estacao().peixe;};}
function estacaoFaunaK(){return estacao().fauna;}
function estacaoPredador(){return estacao().pred;}
/* lua cheia: enxerga-se mais longe à noite; lua nova, menos; eclipse da lua escurece */
{const _v=climaVisao;climaVisao=function(){let k=_v.apply(this,arguments);const n=E.n||0;if(n>0.5)k*=lerp(1,0.82+0.36*luaIlum(),n)*(1-0.2*eclipseLunarK());return k;};}
/* ---------- tempo: pesos por estação, tipos novos e períodos de vários dias ---------- */
Object.assign(CLIMA_DEF,{garoa:{nome:'Garoa',icon:'i-chuva',chuva:0.38},ventania:{nome:'Ventania',icon:'i-vento',chuva:0},escuro:{nome:'Céu fechado',icon:'i-nublado',chuva:0}});
const CLIMA_EXTRA=[[10,[[6,30,'garoa']]],[9,[[9,19,'ventania']]],[8,[[6,30,'escuro']]],[6,[[6,12,'garoa'],[12,18,'nublado'],[18,24,'garoa']]]];
function climaPeso(p,E0){let w=p[0];if(!p[1].length)return w*(E0.id==='verao'?1.2:E0.id==='inverno'?0.85:1);for(const s of p[1])w*=E0.peso[s[2]]??1;return w;}
function climaPeriodo(dia,E0){const c=G.clima;if(!c)return null;let p=c.periodo;if(p&&dia>p.ate)p=c.periodo=null;
  if(!p){const r=Math.random();
    if((E0.id==='primavera'||E0.id==='verao')&&r<0.12)p={tipo:'chuvas',ate:dia+1+Math.floor(Math.random()*2)};
    else if((E0.id==='verao'||E0.id==='inverno')&&r<0.22)p={tipo:'seca',ate:dia+2+Math.floor(Math.random()*2)};
    else if(E0.id==='inverno'&&r<0.4)p={tipo:'frio',ate:dia+1+Math.floor(Math.random()*2)};
    if(p){c.periodo=p;const txt={chuvas:'Vêm aí uns dias de chuva sem parar. Guarde água limpa e proteja a horta.',seca:'Tempo seco pelos próximos dias. A mata seca pega fogo fácil.',frio:'Onda de frio chegando: uns dias gelados. Roupa quente e lenha.'}[p.tipo];
      setTimeout(()=>{if(G.modo==='jogo'||G.modo==='pausa')toast('radio',txt);},9000);if(typeof diarioEvento==='function')diarioEvento('Rádio: '+txt,'evento');}}
  if(!p)return null;
  if(p.tipo==='chuvas')return Math.random()<0.5?[[6,30,'chuva']]:[[6,10,'garoa'],[10,17,'chuva'],[17,21,'tempestade'],[21,30,'chuva']];
  if(p.tipo==='seca')return E0.id==='verao'?[[10,18,'calor']]:[];
  if(p.tipo==='frio')return[[6,30,'frio']];return null;}
{const _cs=climaSortear;climaSortear=function(dia){if(dia<=1)return _cs.apply(this,arguments);const E0=estacao(dia),per=climaPeriodo(dia,E0);if(per)return per.map(s=>s.slice());
  const L=CLIMA_PADROES.concat(CLIMA_EXTRA);let tot=0;const ws=L.map(p=>{const w=climaPeso(p,E0);tot+=w;return w;});let r=Math.random()*tot,pad=L[0];
  for(let i=0;i<L.length;i++){r-=ws[i];if(r<=0){pad=L[i];break;}}
  const segs=pad[1].map(s=>s.slice());if(pad===CLIMA_PADROES[4]&&Math.random()<(E0.id==='verao'?0.6:0.4))segs.push([17.5,21,'tempestade']);return segs;};}
{const _av=climaAviso;climaAviso=function(t){const m={garoa:'Começou uma garoa. Molha devagar, mas molha.',ventania:'Ventania! As árvores balançam forte, folhas voando e o vento esfria.',escuro:'Céu fechado e escuro: o dia vai ficar sombrio. Leve a lanterna.'}[t];
  if(m){if(G.modo==='jogo')toast('clima',m);if(typeof diarioEvento==='function')diarioEvento('Clima: '+CLIMA_DEF[t].nome.toLowerCase());return;}return _av.apply(this,arguments);};}
{const _sv=V8.salvar.clima,_cg=V8.carregar.clima;V8.salvar.clima=()=>{const o=_sv();if(o&&G.clima&&G.clima.periodo)o.periodo=G.clima.periodo;return o;};
  V8.carregar.clima=s=>{_cg(s);if(G.clima)G.clima.periodo=s&&s.periodo&&Number.isFinite(s.periodo.ate)?s.periodo:null;};}
/* ---------- luz, vento, lua e eclipses no ambiente ---------- */
{const _a=climaAmbiente;climaAmbiente=function(e){_a.apply(this,arguments);const E0=estacao(),n=e.n||0,il=luaIlum(),es=eclipseSolarK(),el=eclipseLunarK();
  e.gain=mixc(e.gain,mixc(e.gain,E0.luz.gain,1),0.55*(1-n));e.sat*=lerp(1,E0.luz.sat,1-n*0.5);
  const vk=E0.vento*(1+1.4*climaK('ventania'));e.wind=[e.wind[0]*vk,e.wind[1]*vk];
  if(n>0){const f=lerp(1,0.78+0.44*il,n)*(1-0.3*el);e.hs=scl(e.hs,f);e.dc=scl(e.dc,f);e.moonV*=(0.3+0.7*il)*(1-0.75*el);e.stars=Math.min(1,e.stars*(1.15-0.3*il)+0.25*el);}
  if(el>0)e.moonC=mixc(e.moonC,[0.9,0.32,0.22],el);
  if(es>0){e.hs=scl(e.hs,1-0.82*es);e.dc=scl(e.dc,1-0.9*es);e.sunV*=1-es;e.stars=Math.max(e.stars,0.7*es);e.zen=mixc(e.zen,[0.012,0.018,0.04],0.85*es);e.hor=mixc(e.hor,[0.3,0.16,0.08],0.6*es);
    e.glow=scl(e.glow||[0,0,0],1-es);e.n=Math.max(e.n||0,0.8*es);}
  if(climaK('escuro')>0){const k=climaK('escuro');e.dc=scl(e.dc,1-0.45*k);e.hs=scl(e.hs,1-0.25*k);e.cloud=Math.max(e.cloud,0.95*k);e.sunV*=1-0.85*k;}
  const f=luaFase();e.lua=G.luaSangue?[-1,1,1]:[Math.cos(2*Math.PI*f/LUA_CICLO),f<4?1:-1,il];};}
/* eclipse do sol: os zumbis saem na escuridão; aviso no rádio de manhã */
let eclAviso=0;
PASSOS.push(dt=>{if(G.modo!=='jogo')return;const k=eclipseSolarK();if(k>0.5&&G.eclSol!==G.dia){G.eclSol=G.dia;toast('alerta','Eclipse! O sol sumiu e o dia virou noite. Eles saem da mata: fique perto de luz e de abrigo.');
    if(typeof diarioEvento==='function')diarioEvento('Eclipse do sol','evento');
    if(P.alive&&!CARRO.ativo&&P.y>-20&&!emPredios(P.x,P.z,2)){const q=6+Math.min(6,Math.floor(G.dia/4));for(let i=0;i<q;i++)for(let t=0;t<12;t++){const a=Math.random()*6.283,r=30+Math.random()*12,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
      if(!pontoLivre(x,z)||(typeof vistoPeloJogador==='function'&&vistoPeloJogador(x,0,z)))continue;const zz=criarZ(Math.random()<0.25?'runner':'walker',x,z,{st:'alerta'});if(zz){zz.ax=P.x;zz.az=P.z;zz.ay=P.y;zz.eclipse=true;}break;}}}
  const kl=eclipseLunarK();if(kl>0.5&&G.eclLua!==G.dia){G.eclLua=G.dia;toast('clima','Eclipse da lua: ela ficou vermelha e escura. A noite vai ficar mais escura por um tempo.');if(typeof diarioEvento==='function')diarioEvento('Eclipse da lua','evento');}});
AMANHECE.push(()=>{const E0=estacao(),d=estacaoDiaN();
  if(d===1)setTimeout(()=>toast('clima','Começou '+(E0.id==='verao'?'o verão':E0.id==='inverno'?'o inverno':E0.id==='outono'?'o outono':'a primavera')+'. '+{primavera:'A horta cresce mais e os bichos têm filhotes.',verao:'Dias quentes: leve água. Temporal no fim da tarde.',outono:'Folhas caindo, ventania e mais cogumelos. As noites esfriam.',inverno:'Frio até de dia, horta devagar, comida difícil e neve na serra. Roupa quente e lenha.'}[E0.id]),4500);
  if(eclipseSolarDia())setTimeout(()=>toast('radio','Professor Pedro calculou: hoje, por volta do meio-dia, tem eclipse do sol. Vai escurecer como a noite por uma hora.'),7000);
  if(estacaoDiaN()===1&&typeof diarioEvento==='function')diarioEvento('Estação: '+E0.nome,'evento');});
/* ---------- copas das árvores e folhas conforme a estação ---------- */
let copaEst=-1;
function copasEstacao(force){const i=estacaoIdx();if(i===copaEst&&!force)return;copaEst=i;const C=ESTACOES_ANO[i].copa;
  for(const t of TREES){if(t.b0===undefined)t.b0=t.tr!==undefined?[t.tr,t.tg,t.tb]:null;const k=C[t.kind]||[1,1,1],b=t.b0||[t.t??1,t.t??1,t.t??1];t.tr=b[0]*k[0];t.tg=b[1]*k[1];t.tb=b[2]*k[2];}
  vegDirty=true;}
/* árvore que o raio matou fica escura como antes (a cor da estação não cobre) */
{const _r=raioCai;raioCai=function(){_r.apply(this,arguments);for(const t of TREES)if(t.kind===2&&t.b0===null&&t.tr!==undefined&&t.t<0.6){t.tr=t.tg=t.tb=t.t;}};}
PASSOS.push(()=>{if(G.modo==='jogo'&&estacaoIdx()!==copaEst)copasEstacao();});
const FOLHA_EST=[null,null,[[0.62,0.36,0.08],[0.7,0.5,0.12],[0.55,0.2,0.06],[0.48,0.3,0.08],[0.66,0.42,0.1]],[[0.42,0.34,0.22],[0.36,0.3,0.2],[0.5,0.44,0.3]]];
function folhaCor(){const L=FOLHA_EST[estacaoIdx()];return L&&Math.random()<0.8?L[Math.floor(Math.random()*L.length)]:FOLHA_COR[Math.floor(Math.random()*FOLHA_COR.length)];}
function folhaRitmo(){return estacao().folhas*(1+1.5*climaK('ventania'));}
/* neve na serra no inverno: flocos em volta de você e mais frio */
let neveT=0;
PASSOS.push(dt=>{if(G.modo!=='jogo'||!nevando()||CARRO.ativo)return;neveT-=dt;if(neveT>0)return;neveT=0.03;const w=E.wind||[0.6,0.2];
  for(let i=0;i<3;i++){const a=Math.random()*6.283,r=1+Math.random()*13;part(P.x+Math.cos(a)*r,P.y+5+Math.random()*4,P.z+Math.sin(a)*r,w[0]*0.35+(Math.random()-0.5)*0.4,-0.9-Math.random()*0.5,w[1]*0.35+(Math.random()-0.5)*0.4,6,0.035,[0.96,0.97,1,0.9],false,0);}});
/* ---------- relógio: estação, temperatura e lua ---------- */
let estHudT=0;
HUDS.push(()=>{estHudT-=1;if(estHudT>0)return;estHudT=20;const el=$('dia-est');if(!el)return;const E0=estacao(),T=Math.round(temperatura()),noite=(E.n||0)>0.5;
  const t=E0.nome+' · '+T+' °C'+(noite?' · '+luaNome():'')+(nevando()?' · neve':'');const u=el.querySelector('use'),ic='#'+(noite?'i-lua':E0.icon);
  if(u.getAttribute('href')!==ic)u.setAttribute('href',ic);const sp=el.querySelector('span');if(sp.textContent!==t)sp.textContent=t;el.title='Dia '+estacaoDiaN()+' de '+DIAS_ESTACAO+' da '+E0.nome.toLowerCase()+(eclipseSolarDia()?' · eclipse do sol ao meio-dia':'');});
V8.novo.estacoes=()=>{copaEst=-1;G.eclSol=0;G.eclLua=0;};
V8.carregar.estacoes=()=>{copaEst=-1;};

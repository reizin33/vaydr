/* ================= Etapa 17: energia =================
   Peças elétricas (aba Energia no modo de construção) ligadas por FIOS. Cada fio vai de uma saída (gerador, banco de baterias,
   interruptor, temporizador, sensor, divisor) para a entrada de quem gasta. A ligação é feita na TELA DE FIOS (com o alicate):
   arraste com o mouse (ou o dedo) da saída de uma peça até a entrada de outra; toque num fio para cortar (o fio volta). Cada 4 m
   de distância gasta 1 fio elétrico. Ao construir uma peça que gasta energia perto de uma fonte, ela já sai ligada (se tiver fio).
   · Gerador: com gasolina e ligado, produz 1200 W quando alguém puxa energia (gasta mais com mais carga). Sem fio nenhum, continua
     como antes: à noite acende os postes e eletrifica o arame por perto.
   · Banco de baterias: guarda a sobra do gerador (até 6000 Wh) e solta quando falta. Entrada: carregar; saída: alimentar.
   · Interruptor (toque E liga e desliga), temporizador (liga só num horário), sensor de movimento (liga quando chega zumbi, gente
     ou qualquer um, até 10 m), divisor (uma entrada, três saídas).
   · Gastam energia: poste (só à noite), lâmpada elétrica, lamparinas (ligadas viram elétricas), arame (eletrificado), bomba d'água,
     fervedor (ferve sem lenha), barril (purifica a água suja que você despejar), poço (a bomba elétrica dentro dele dobra a
     recarga), antena da base (mais uma oferta por dia no rádio), fornalha e defumador (trabalham 50% mais rápido), portas e
     portões (abrem quando recebem energia: ponha um interruptor ou um sensor no meio), armadilha de mandíbula (se arma sozinha),
     geladeira (comida envelhece a 10%) e freezer (não envelhece), esteira, besta automática, armadilha de cartucho e lança-chamas.
   · Se a produção (gerador + baterias) não dá conta do consumo da rede, falta energia para todos daquela rede.
   A energia continua com você longe (as peças da base seguem as mesmas regras). */
iconesNovos({
  'i-energia':'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  'i-fio':'<path d="M4 18c3 0 3-6 6-6s3 6 6 6 3-6 4-6"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="12" r="1.6"/>',
  'i-alicate':'<path d="M9 14 4 21M15 14l5 7"/><path d="M9 14c-2-3-2-7 0-10l3 5 3-5c2 3 2 7 0 10"/><circle cx="12" cy="12" r="1.3"/>',
  'i-bateria-base':'<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M7 8V5h3v3M14 8V5h3v3"/><path d="M11 11l-2 4h4l-2 3"/>',
  'i-interruptor':'<rect x="7" y="3" width="10" height="18" rx="2"/><rect x="9.5" y="6" width="5" height="6" rx="1"/><path d="M12 15v3"/>',
  'i-temporizador':'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>',
  'i-sensor':'<circle cx="12" cy="14" r="3"/><path d="M6.5 8.5a8 8 0 0 1 11 0M4 5.5a12 12 0 0 1 16 0"/><path d="M12 17v4"/>',
  'i-divisor':'<path d="M3 12h6"/><path d="M9 12l6-6h6M9 12h12M9 12l6 6h6"/><circle cx="9" cy="12" r="1.5"/>',
  'i-lampada':'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  'i-geladeira':'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8 5v2M8 12v4"/>',
  'i-freezer':'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M12 13v4M10 15h4M10.5 13.5l3 3M13.5 13.5l-3 3"/>',
  'i-besta-auto':'<path d="M4 9h16M12 9v12M8 21h8"/><path d="M6 5c4 3 8 3 12 0"/><path d="M12 9l7-3"/>',
  'i-cartucho-arm':'<rect x="4" y="12" width="12" height="7" rx="1"/><path d="M16 15h5M7 12V8h6v4"/><path d="M2 21h20"/>',
  'i-lanca-chamas':'<rect x="3" y="8" width="7" height="12" rx="2"/><path d="M10 12h6l3-2"/><path d="M19 7c1.5 1 2 2.5 1 4-.6-1-1.4-1.3-2-1 0-1.2.3-2.1 1-3z"/>',
  'i-esteira':'<rect x="2" y="10" width="20" height="5" rx="2.5"/><circle cx="5" cy="12.5" r="1"/><circle cx="12" cy="12.5" r="1"/><circle cx="19" cy="12.5" r="1"/><path d="M8 7h6M12 5l2 2-2 2"/>'});
Object.assign(ITEMS,{
  fio:{nome:'Fio elétrico',icon:'i-fio',max:60,tipo:'material',desc:'Fio de cobre encapado. Liga as peças elétricas na tela de fios: cada 4 m de distância gasta 1 fio (que volta quando você corta).'},
  alicate:{nome:'Alicate de eletricista',icon:'i-alicate',max:1,tipo:'util',durMax:80,desc:'Com ele na mochila, a tela de fios deixa ligar e cortar fios (segure E numa peça elétrica, ou no modo de construção: Fios).'}});
RECIPES.push({faz:'fio',n:4,custo:{sucata:1,linha:1},cat:'materiais',etapa:1,est:1},{faz:'alicate',n:1,custo:{sucata:2,madeira:1},cat:'ferramentas',etapa:1,est:1});
for(const[t,e]of[['oficina',['fio',.35,2,6]],['deposito',['fio',.2,1,4]],['garagem',['fio',.3,2,5]],['estoque',['fio',.15,1,3]]])if(typeof CID_LOOT!=='undefined'&&CID_LOOT[t])CID_LOOT[t].push(e);
for(const[t,e]of[['casa',['fio',1,3,0.15]],['suprimentos',['fio',2,5,0.3]],['celeiro',['fio',1,3,0.15]]])if(LOOT[t])LOOT[t].push(e);

/* ---------- peças novas ---------- */
Object.assign(OBRAS,{
  bateriaBase:{nome:'Banco de baterias',icon:'i-bateria-base',custo:{sucata:6,pilhas:6,fio:4},hp:260,hw:0.55,hd:0.38,solid:true,hCol:1.0,etapa:3,desb:'oficina',
    desc:'Guarda a sobra do gerador (até 6000 Wh) e solta quando falta. Entrada: carregar; saída: alimentar.'},
  interruptor:{nome:'Interruptor',icon:'i-interruptor',custo:{sucata:1,fio:2},hp:60,hw:0.15,hd:0.12,solid:false,peq:true,etapa:1,desc:'Toque E para ligar e desligar o que está depois dele.'},
  temporizador:{nome:'Temporizador',icon:'i-temporizador',custo:{sucata:2,fio:2,pilhas:1},hp:60,hw:0.15,hd:0.12,solid:false,peq:true,etapa:1,desc:'Deixa a energia passar só num horário (à noite, de dia ou o que você escolher).'},
  sensor:{nome:'Sensor de movimento',icon:'i-sensor',custo:{sucata:2,fio:3,pilhas:1},hp:60,hw:0.15,hd:0.12,solid:false,peq:true,etapa:1,desc:'Deixa a energia passar quando chega alguém perto: zumbi, gente ou qualquer um, até 10 m.'},
  divisor:{nome:'Divisor de energia',icon:'i-divisor',custo:{sucata:1,fio:4},hp:60,hw:0.2,hd:0.15,solid:false,peq:true,etapa:1,desc:'Uma entrada e três saídas: leva a energia para mais de uma peça.'},
  luminaria:{nome:'Lâmpada elétrica',icon:'i-lampada',custo:{sucata:2,fio:2},hp:40,hw:0.18,hd:0.18,solid:false,peq:true,etapa:1,luzE:true,desc:'Luz forte e branca enquanto recebe energia (40 W).'},
  geladeira:{nome:'Geladeira',icon:'i-geladeira',custo:{sucata:10,chapaFerro:2,fio:4},hp:300,hw:0.42,hd:0.38,solid:true,hCol:1.8,bau:true,etapa:3,desb:'oficina',conserva:0.5,
    desc:'Guarda comida. Com energia (150 W), a comida envelhece a 10%; sem energia, como num baú.'},
  freezer:{nome:'Freezer',icon:'i-freezer',custo:{sucata:12,chapaFerro:2,fio:6},hp:300,hw:0.6,hd:0.38,solid:true,hCol:0.95,bau:true,etapa:3,desb:'oficina',conserva:0.5,
    desc:'Guarda comida congelada. Com energia (250 W), a comida não envelhece; sem energia, como num baú.'},
  esteira:{nome:'Esteira',icon:'i-esteira',custo:{tabuas:4,sucata:4,fio:2},hp:150,hw:0.35,hd:0.8,solid:false,etapa:2,
    desc:'Com energia, leva coisas do que está atrás dela (baú, fornalha, defumador) para o que está na frente (baú, geladeira, fornalha, defumador), com filtro.'},
  bestaAuto:{nome:'Besta automática',icon:'i-besta-auto',custo:{tabuas:4,sucata:6,corda:2,fio:4},hp:240,hw:0.4,hd:0.4,solid:true,hCol:1.4,bau:true,etapa:3,desb:'oficina',
    desc:'Com energia (80 W) e flechas dentro, atira sozinha no zumbi mais perto até 18 m.'},
  armCartucho:{nome:'Armadilha de cartucho',icon:'i-cartucho-arm',custo:{sucata:4,pregos:2,fio:2},hp:140,hw:0.3,hd:0.25,solid:false,peq:true,bau:true,etapa:2,
    desc:'Com energia (30 W) e cartuchos dentro, dispara quando um zumbi passa na frente (até 5 m).'},
  lancaChamas:{nome:'Lança-chamas a óleo',icon:'i-lanca-chamas',custo:{sucata:8,chapaFerro:1,fio:3},hp:260,hw:0.45,hd:0.45,solid:true,hCol:1.2,bau:true,etapa:3,desb:'oficina',
    desc:'Com energia (120 W) e óleo de motor dentro, queima os zumbis na frente (até 6 m). Cada óleo dá 8 jatos.'}});
const E17_OBRAS=['bateriaBase','interruptor','temporizador','sensor','divisor','luminaria','geladeira','freezer','esteira','bestaAuto','armCartucho','lancaChamas'];
OBRA_ORDEM.push(...E17_OBRAS);for(const k of E17_OBRAS)if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);
if(typeof OBRAS_PREDIO!=='undefined')for(const k of['interruptor','temporizador','sensor','divisor','luminaria','geladeira','freezer','bateriaBase'])if(!OBRAS_PREDIO.includes(k))OBRAS_PREDIO.push(k);
for(const k of['interruptor','luminaria','divisor'])if(!OBRAS_ALTO.includes(k))OBRAS_ALTO.push(k);
{const base=OBRA_CATS.find(c=>c.id==='base');if(base)base.t=base.t.filter(k=>k!=='gerador'&&k!=='poste');const i=OBRA_CATS.findIndex(c=>c.id==='oficina');
  OBRA_CATS.splice(i>=0?i+1:OBRA_CATS.length,0,{id:'energia',nome:'Energia',ico:'i-energia',t:['gerador','bateriaBase','poste','luminaria','interruptor','temporizador','sensor','divisor','geladeira','freezer','esteira','bestaAuto','armCartucho','lancaChamas']});}
Object.assign(BASE_DICAS,{bateriaBase:'Banco de baterias: ligue a saída do gerador na entrada dele (tela de fios) e a saída dele no que gasta. Ele guarda a sobra e segura a casa quando o gerador para.',
  interruptor:'Interruptor: ponha entre a fonte e o que você quer controlar. Toque E para ligar e desligar.',
  temporizador:'Temporizador: deixa a energia passar só no horário escolhido (segure E para mudar).',
  sensor:'Sensor de movimento: ligue um portão, uma lâmpada ou uma defesa depois dele. Segure E para escolher quem ele percebe.',
  geladeira:'Geladeira: com energia, a comida dentro quase não envelhece. Toque E para abrir; segure E para ver a energia.',
  freezer:'Freezer: com energia, a comida dentro não envelhece.',
  bestaAuto:'Besta automática: ponha flechas dentro (toque E) e ligue na energia. Ela atira sozinha nos zumbis até 18 m.',
  armCartucho:'Armadilha de cartucho: ponha cartuchos dentro e ligue na energia. Dispara quando um zumbi passa na frente dela.',
  lancaChamas:'Lança-chamas a óleo: ponha óleo de motor dentro e ligue na energia. Queima os zumbis na frente dele.',
  esteira:'Esteira: com energia, leva coisas do que está atrás dela para o que está na frente. Segure E para escolher o filtro.',
  luminaria:'Lâmpada elétrica: acende enquanto recebe energia.'});
/* ---------- quem é o quê na rede: papel, consumo (W), produção (W), entradas e saídas ---------- */
const ELET={gerador:{p:'fonte',prod:1200,sai:3},bateriaBase:{p:'bateria',cap:6000,taxa:1500,ent:1,sai:2},
  interruptor:{p:'logica',ent:1,sai:1},temporizador:{p:'logica',ent:1,sai:1},sensor:{p:'logica',ent:1,sai:1},divisor:{p:'logica',ent:1,sai:3},
  poste:{w:60},luminaria:{w:40},lamparina:{w:25},lampParede:{w:25},arame:{w:150},bombaAgua:{w:400},fervedor:{w:500},barrilAgua:{w:60},poco:{w:200},antenaBase:{w:120},
  fornalha:{w:300},defumador:{w:200},portaMadeira:{w:20},portao:{w:40},portaoFerro:{w:40},portaoGrande:{w:60},armadilhaUrso:{w:20},
  geladeira:{w:150},freezer:{w:250},esteira:{w:100},bestaAuto:{w:80},armCartucho:{w:30},lancaChamas:{w:120}};
for(const k in ELET){const d=ELET[k];if(!d.p)d.p='consumo';if(d.ent===undefined)d.ent=d.p==='fonte'?0:1;if(d.sai===undefined)d.sai=0;}
const eletDe=o=>o&&o.hp>0&&OBRAS[o.tipo]?ELET[o.tipo]||null:null;
function eidDe(o){if(!o.ext)o.ext={};if(!o.ext.eid)o.ext.eid=Math.random().toString(36).slice(2,9);return o.ext.eid;}
const ENER={fios:[],ultTm:null,fiados:new Set(),mapa:new Map(),redes:[],t:0,versao:0};
function energiaFiado(o){return!!(o&&o.ext&&o.ext.eid&&ENER.fiados.has(o.ext.eid));}
function eletPorEid(id){return ENER.mapa.get(id)||null;}
function eletMapa(){ENER.mapa.clear();for(const o of OB){if(!eletDe(o)||!o.ext||!o.ext.eid)continue;ENER.mapa.set(o.ext.eid,o);}
  ENER.fios=ENER.fios.filter(f=>ENER.mapa.has(f.a)&&ENER.mapa.has(f.b));ENER.fiados=new Set();for(const f of ENER.fios){ENER.fiados.add(f.a);ENER.fiados.add(f.b);}}
/* ---------- fios: ligar e cortar ---------- */
const FIO_M=4,FIO_MAX=30;
const fiosSaida=o=>ENER.fios.filter(f=>f.a===o.ext.eid).length,fiosEntrada=o=>ENER.fios.filter(f=>f.b===o.ext.eid).length;
function fioCusto(a,b){return Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z,(a.y||0)-(b.y||0))/FIO_M));}
function podeLigar(a,b){const da=eletDe(a),db=eletDe(b);if(!da||!db)return'Só entre peças elétricas';if(a===b)return'Escolha outra peça';
  if(!da.sai)return OBRAS[a.tipo].nome+' não tem saída';if(!db.ent)return OBRAS[b.tipo].nome+' não tem entrada';
  eidDe(a);eidDe(b);if(ENER.fios.some(f=>f.a===a.ext.eid&&f.b===b.ext.eid))return'Já estão ligados';
  if(ENER.fios.some(f=>f.a===b.ext.eid&&f.b===a.ext.eid))return'Já tem um fio no sentido contrário';
  if(fiosSaida(a)>=da.sai)return OBRAS[a.tipo].nome+': as '+da.sai+' saídas já estão ocupadas';if(fiosEntrada(b)>=db.ent)return OBRAS[b.tipo].nome+': a entrada já está ocupada';
  if(Math.hypot(a.x-b.x,a.z-b.z)>FIO_MAX)return'Longe demais: o fio vai até '+FIO_MAX+' m';return'';}
function ligarFio(a,b,gratis){const m=podeLigar(a,b);if(m)return m;const n=fioCusto(a,b);if(!gratis){if(invCount('fio')<n)return'Faltam fios: precisa de '+n+' (tem '+invCount('fio')+')';invRemove('fio',n);}
  ENER.fios.push({a:a.ext.eid,b:b.ext.eid,n:gratis?0:n});eletMapa();energiaResolver(0);sfx('clique');return'';}
function cortarFio(f){const i=ENER.fios.indexOf(f);if(i<0)return;ENER.fios.splice(i,1);if(f.n){const l=invAdd('fio',f.n);if(l>0)soltarItens([['fio',l]],P.x,P.z);}eletMapa();energiaResolver(0);sfx('clique');}
/* peça nova que gasta energia sai ligada na fonte (ou divisor, interruptor...) mais perto, se tiver fio */
/* prefere quem já tem energia (gerador com gasolina, baterias com carga, divisor ou interruptor que recebe energia); senão, o mais perto */
function eletAlimentada(q){const d=ELET[q.tipo],e=q.ext||{};return d.p==='fonte'?e.ligado!==false&&(e.comb||0)>0:d.p==='bateria'?(e.carga||0)>0.5||!!q.energ:!!q.energ;}
function autoLigar(o,silencio){const d=eletDe(o);if(!d||!d.ent||fiosEntrada(eidDe(o)&&o))return null;let best=null,bd=1e9;
  for(const q of OB){const dq=eletDe(q);if(!dq||q===o||!dq.sai||q.y<SUB_FUNDO!==o.y<SUB_FUNDO)continue;const dd=d2(q.x,q.z,o.x,o.z);if(dd>=25*25)continue;eidDe(q);if(fiosSaida(q)>=dq.sai)continue;
    const nota=Math.sqrt(dd)+(eletAlimentada(q)?0:100);if(nota>=bd)continue;bd=nota;best=q;}
  if(!best)return null;const m=ligarFio(best,o);if(m){if(!silencio)feed('Sem ligação: '+m.toLowerCase(),true);return null;}
  if(!silencio)feed('Fio ligado: '+OBRAS[best.tipo].nome.toLowerCase()+' → '+OBRAS[o.tipo].nome.toLowerCase()+' ('+fioCusto(best,o)+' fio'+(fioCusto(best,o)>1?'s':'')+'). Para mudar: tela de fios ('+nomeTecla(teclaDe('telaFios'))+').');return best;}
/* ---------- estado das peças de lógica ---------- */
function horaNo(h0,h1){const h=G.hora;return h0<=h1?h>=h0&&h<h1:h>=h0||h<h1;}
function logicaLigada(o){const e=o.ext;switch(o.tipo){case'interruptor':return e.on!==false;case'temporizador':return horaNo(e.h0??18,e.h1??6);case'sensor':return(o.sensAte||0)>G.t;default:return true;}}
/* quanto cada peça quer puxar agora (W) */
function querW(o){const d=ELET[o.tipo],e=o.ext;if(!d||!d.w)return 0;
  switch(o.tipo){case'poste':return(E.n||0)>0.3?d.w:0;
    case'bombaAgua':return typeof pocoDaBomba==='function'&&pocoDaBomba(o)?d.w:0;
    case'fornalha':case'defumador':return(e.proc||[]).some(c=>G.tm<c.fim)?d.w:8;
    case'fervedor':return(e.agua||0)>0.5?d.w:10;
    case'barrilAgua':return(e.uv||0)>0?d.w:2;
    case'portaMadeira':case'portao':case'portaoFerro':case'portaoGrande':return d.w;
    case'esteira':return d.w;default:return d.w;}}
/* ---------- a conta da rede (a cada meio segundo de jogo) ---------- */
function energiaResolver(dtMin){eletMapa();const M=ENER.mapa,pai=new Map(),acha=x=>{while(pai.get(x)!==x){pai.set(x,pai.get(pai.get(x)));x=pai.get(x);}return x;};
  for(const id of ENER.fiados)pai.set(id,id);for(const f of ENER.fios){const ra=acha(f.a),rb=acha(f.b);if(ra!==rb)pai.set(ra,rb);}
  const grupos=new Map();for(const id of ENER.fiados){const r=acha(id);if(!grupos.has(r))grupos.set(r,[]);grupos.get(r).push(M.get(id));}
  const saidas=new Map();for(const f of ENER.fios){if(!saidas.has(f.a))saidas.set(f.a,[]);saidas.get(f.a).push(f.b);}
  /* quem a energia alcança: atravessa interruptor, temporizador, sensor e divisor ligados; a do gerador atravessa também as baterias
     (elas deixam passar enquanto carregam), a das baterias sai só da carga delas */
  const alcanca=(ini,passaBat)=>{const vis=new Set(),fila=[...ini];while(fila.length){const id=fila.shift();for(const b of saidas.get(id)||[]){if(vis.has(b))continue;vis.add(b);const q=M.get(b),d=ELET[q.tipo];
      if(d.p==='logica'&&!logicaLigada(q))continue;if(d.p==='logica'||(passaBat&&d.p==='bateria'))fila.push(b);}}return vis;};
  const dtH=dtMin/60;ENER.redes=[];
  for(const L of grupos.values()){const gens=L.filter(o=>ELET[o.tipo].p==='fonte'),bats=L.filter(o=>ELET[o.tipo].p==='bateria');
    const gensOk=gens.filter(g=>g.ext.ligado!==false&&(g.ext.comb||0)>0),deG=alcanca(gensOk.map(g=>g.ext.eid),true),deB=alcanca(bats.filter(b=>(b.ext.carga||0)>0.5).map(b=>b.ext.eid));
    const cons=L.filter(o=>ELET[o.tipo].p==='consumo'),ligG=cons.filter(o=>deG.has(o.ext.eid)),ligB=cons.filter(o=>!deG.has(o.ext.eid)&&deB.has(o.ext.eid));
    const D=[...ligG,...ligB].reduce((s,o)=>s+querW(o),0),carregar=bats.filter(b=>deG.has(b.ext.eid)&&(b.ext.carga||0)<ELET.bateriaBase.cap-1);
    const Pg=gensOk.length?gensOk.length*ELET.gerador.prod:0,Pb=bats.filter(b=>deB.size&&(b.ext.carga||0)>0.5).reduce((s,b)=>s+Math.min(ELET.bateriaBase.taxa,(b.ext.carga||0)/Math.max(dtH,1/120)),0);
    const precisa=D>0||carregar.length>0,ok=D<=Pg+Pb+0.01,rede={L,D:Math.round(D),Pg:gensOk.length&&precisa?Pg:0,carga:0,cap:bats.length*ELET.bateriaBase.cap,ok};
    let usaG=0;if(ok&&D>0){usaG=Math.min(D,Pg);const falta=D-usaG;if(falta>0&&bats.length){const porB=falta/Math.max(1,bats.filter(b=>(b.ext.carga||0)>0.5).length);for(const b of bats)if((b.ext.carga||0)>0.5)b.ext.carga=Math.max(0,b.ext.carga-porB*dtH);}}
    if(gensOk.length&&carregar.length){const sobra=Math.max(0,Pg-usaG),porB=Math.min(ELET.bateriaBase.taxa,sobra/carregar.length);for(const b of carregar)b.ext.carga=Math.min(ELET.bateriaBase.cap,(b.ext.carga||0)+porB*dtH);usaG+=Math.min(sobra,porB*carregar.length);}
    for(const g of gens){const roda=gensOk.includes(g)&&precisa;g.rodando=roda;if(roda&&dtMin>0){const carga=clamp(usaG/Math.max(1,Pg),0,1);g.ext.comb=Math.max(0,(g.ext.comb||0)-dtH*0.125*(0.3+0.7*carga));if(g.ext.comb<=0&&d2(g.x,g.z,P.x,P.z)<60*60)feed('O gerador ficou sem gasolina',true);}}
    for(const o of cons)o.energ=ok&&(ligG.includes(o)||ligB.includes(o))&&!!(Pg||Pb);
    for(const o of L)if(ELET[o.tipo].p==='logica')o.energ=deG.has(o.ext.eid)||deB.has(o.ext.eid);
    for(const b of bats)b.energ=deG.has(b.ext.eid);
    rede.carga=bats.reduce((s,b)=>s+(b.ext.carga||0),0);rede.falta=!ok&&D>0;ENER.redes.push(rede);
    if(rede.falta&&!rede.avisou&&L.some(o=>d2(o.x,o.z,P.x,P.z)<50*50)){const k=L.map(o=>o.ext.eid).sort().join();if(ENER.avisoK!==k){ENER.avisoK=k;feed('Falta energia: a rede pede '+Math.round(D)+' W e só tem '+Math.round(Pg+Pb)+' W',true);}}}
  for(const o of OB)if(eletDe(o)&&!energiaFiado(o)){o.energ=false;if(ELET[o.tipo].p==='fonte')o.rodando=false;}
  ENER.versao++;}
/* ---------- o que a energia faz em cada peça ---------- */
function luzSync(o,acesa,dy,lx){const i=FIRES.findIndex(f=>f.obra===o||f.poste===o),w=localW(o,lx||0,0);if(acesa&&i<0)FIRES.push({x:w[0],y:o.y+(dy||0),z:w[1],obra:o,lamp:true,eletrica:true,branca:o.tipo==='luminaria'});
  else if(acesa){const f=FIRES[i];f.x=w[0];f.z=w[1];f.y=o.y+(dy||0);}else if(!acesa&&i>=0)FIRES.splice(i,1);}
function energiaEfeitos(dtMin){const dtH=dtMin/60;
  for(const o of OB){const d=eletDe(o);if(!d||!energiaFiado(o))continue;const e=o.ext,on=!!o.energ;
    switch(o.tipo){
      case'poste':{const lig=on&&(E.n||0)>0.3;if(lig!==!!o.aceso){o.aceso=lig;const i=FIRES.findIndex(f=>f.poste===o);if(lig&&i<0)FIRES.push({x:o.x+Math.sin(o.yaw)*0.62,y:o.y+2.95,z:o.z+Math.cos(o.yaw)*0.62,poste:o,lamp:true,eletrica:true});else if(!lig&&i>=0)FIRES.splice(i,1);}break;}
      case'luminaria':o.aceso=on;luzSync(o,on,1.72,0.3);break;
      case'lamparina':case'lampParede':{if(o.energAnt===on)break;o.energAnt=on;const apag=!on;if(!!e.apagada!==apag){e.apagada=apag;const i=FIRES.findIndex(f=>f.obra===o);if(!apag&&i<0)FIRES.push({x:o.x,y:o.y,z:o.z,obra:o,lamp:true});else if(apag&&i>=0)FIRES.splice(i,1);}break;}
      case'arame':o.eletrico=on;break;
      case'fervedor':if(on&&(e.comb||0)<10)e.comb=10;break;
      case'barrilAgua':if(on&&(e.uv||0)>0){const n=Math.min(e.uv,6*dtH,Math.max(0,AGUA_CFG.barril.cap-(e.limpa||0)));e.uv-=n;e.limpa=(e.limpa||0)+n;if(n>0&&typeof aguaSujo!=='undefined')aguaSujo=true;}break;
      case'poco':if(on&&dtH>0&&typeof AGUA_CFG!=='undefined')e.agua=Math.min(AGUA_CFG.poco.cap,(e.agua||0)+AGUA_CFG.poco.recarga*dtMin);break;
      case'fornalha':case'defumador':if(on&&dtMin>0)for(const c of e.proc||[])if(G.tm<c.fim)c.fim-=dtMin*0.5;break;
      case'portaMadeira':if(o.energAnt===on)break;{const prim=o.energAnt===undefined;o.energAnt=on;if(prim&&!on)break;if(!!e.aberta!==on){e.aberta=on;if(o.folha)o.folha.solid=!on;sfx('portaMad',o.x,o.z,0.6);}}break;
      case'armadilhaUrso':if(on&&e.armada===false){o.rearma=(o.rearma||0)+dtMin;if(o.rearma>=10&&!Z.some(z=>z.vivo&&d2(z.x,z.z,o.x,o.z)<1.5*1.5)){e.armada=true;o.rearma=0;sfx('clique',o.x,o.z,0.6);}}break;
      case'geladeira':o.conservaK=on?0.1:undefined;break;
      case'freezer':o.conservaK=on?0:undefined;break;}}
  /* sem fio: desliga o que a energia ligava (a lâmpada apaga; porta e lamparina ficam como estão, para a mão) */
  for(const o of OB){if(!ELET[o.tipo]||energiaFiado(o))continue;if(o.tipo==='geladeira'||o.tipo==='freezer')o.conservaK=undefined;else if(o.tipo==='luminaria'&&(o.aceso||FIRES.some(f=>f.obra===o))){o.aceso=false;luzSync(o,false);}
    if(o.energAnt!==undefined)o.energAnt=undefined;if(o.energ)o.energ=false;}}
/* passo: conta da rede a cada 0,5 s; sensores a cada 0,25 s */
let enerT=0,sensT=0;
PASSOS.push(function energiaPasso(dt){sensT-=dt;if(sensT<=0){sensT=0.25;for(const o of OB){if(o.tipo!=='sensor'||o.hp<=0)continue;const m=o.ext.modo||'zumbi',r=o.ext.r||10,r2_=r*r;let viu=false;
      if(m!=='gente')for(const z of Z){if(z.vivo&&d2(z.x,z.z,o.x,o.z)<r2_){viu=true;break;}}
      if(!viu&&m!=='zumbi'){if(P.alive&&d2(P.x,P.z,o.x,o.z)<r2_)viu=true;else if(typeof SOBREV!=='undefined'&&SOBREV.some(s=>s.st==='base'&&s.x!==undefined&&d2(s.x,s.z,o.x,o.z)<r2_))viu=true;else if(CARRO.ativo&&d2(CARRO.x,CARRO.z,o.x,o.z)<r2_)viu=true;}
      if(viu)o.sensAte=G.t+(o.ext.seg||6);}}
  enerT-=dt;if(enerT>0)return;enerT=0.5;if(ENER.ultTm===null)ENER.ultTm=G.tm;const dm=Math.max(0,Math.min(120,G.tm-ENER.ultTm));ENER.ultTm=G.tm;energiaResolver(dm);energiaEfeitos(dm);});
/* sem fio nenhum, o gerador, os postes e o arame continuam como antes (48c); com fio, quem manda é a rede */
{const _gp=typeof geradorPerto==='function'?geradorPerto:null;if(_gp)geradorPerto=function(o){if(energiaFiado(o))return o.energ?{ext:{comb:1,ligado:true},hp:1}:null;return _gp.apply(this,arguments);};}
/* antena com energia: uma oferta a mais por dia no rádio */
function antenaEnergizada(){return OB.some(o=>o.tipo==='antenaBase'&&o.hp>0&&energiaFiado(o)&&o.energ);}
/* (a oferta a mais sai junto com as do dia, em terrOfertas: um grupo no ar oferece mais uma coisa) */
function ofertaExtraEnergia(){const D=terrD();if(!antenaEnergizada()||!D.ofertas||!D.ofertas.length||D.ofertas.some(o=>o.extraE))return null;const noAr=[...new Set(D.ofertas.map(o=>o.g))],g=TERR_GRUPOS.find(q=>q.id===noAr[Math.floor(Math.random()*noAr.length)]);if(!g)return null;
  const usados=D.ofertas.filter(o=>o.g===g.id).map(o=>o.da[0]),opc=g.da.filter(q=>ITEMS[q]&&!usados.includes(q)),qs=g.quer.filter(q=>ITEMS[q]);if(!opc.length||!qs.length)return null;
  const da=opc[Math.floor(Math.random()*opc.length)],quer=qs[Math.floor(Math.random()*qs.length)],nDa=Math.max(1,Math.round((TERR_VAL[da]>=8?1:TERR_VAL[da]>=4?3:6)*(0.8+Math.random()*0.6))),valor=nDa*TERR_VAL[da]*(D.precos[da]||1),
    nQuer=Math.max(1,Math.round(valor*(D.precos[quer]||1)/TERR_VAL[quer])),o={id:'o'+G.dia+'_'+g.id+'_e',g:g.id,grupo:g.nome,da:[da,nDa],quer:[quer,nQuer],aceita:false,extraE:true};D.ofertas.push(o);return o;}
if(typeof terrOfertas==='function'){const _to=terrOfertas;terrOfertas=function(){const r=_to.apply(this,arguments);try{ofertaExtraEnergia();}catch(_){}return r;};}
/* ---------- salvar ---------- */
V8.salvar.energia=()=>({fios:ENER.fios.map(f=>[f.a,f.b,f.n||0])});
V8.carregar.energia=s=>{ENER.fios=(s&&Array.isArray(s.fios)?s.fios:[]).filter(f=>Array.isArray(f)&&typeof f[0]==='string'&&typeof f[1]==='string').map(f=>({a:f[0],b:f[1],n:+f[2]||0}));ENER.ultTm=null;eletMapa();};
V8.novo.energia=()=>{ENER.fios=[];ENER.ultTm=null;ENER.fiados=new Set();};
/* ---------- peça nova: id elétrico e ligação automática ---------- */
{const _cr=criarObra;criarObra=function(){const o=_cr.apply(this,arguments);if(o&&eletDe(o))eidDe(o);return o;};}
{const _co=colocarObra;colocarObra=function(){const t=OBRA.ativo&&!OBRA.mov?OBRA.tipo:null,n0=OB.length,r=_co.apply(this,arguments);
  if(t&&OB.length>n0&&ELET[t]&&ELET[t].ent&&ELET[t].p!=='bateria'){const o=OB[OB.length-1];if(o&&o.tipo===t)autoLigar(o);}return r;};}
/* ---------- malhas das peças novas ---------- */
INIT_MALHAS.push(function malhasEnergia(){const R=rng(1717),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},aco=lin(0x6a7076),aco2=lin(0x4a4f54),esc=lin(0x2b2b2b),mad=lin(0x6e5235),
    ama=lin(0xc9a227),ver=lin(0x3aa070),verm=lin(0xa83a2a),bra=lin(0xd8dcd8),cin=lin(0x8d969f);
  MESH.obra.bateriaBase=mk(g=>{add(g,boxTris(1.05,0.12,0.7),mat(0,0.06,0),aco2,{j:0.04,rnd:R});for(let i=0;i<3;i++){add(g,boxTris(0.3,0.62,0.6),mat(-0.34+i*0.34,0.43,0),i%2?lin(0x3a4a5a):lin(0x34424f),{j:0.04,rnd:R});
      add(g,boxTris(0.06,0.05,0.06),mat(-0.4+i*0.34,0.77,0.15),verm);add(g,boxTris(0.06,0.05,0.06),mat(-0.28+i*0.34,0.77,0.15),esc);}add(g,boxTris(0.5,0.08,0.03),mat(0,0.55,0.31),ama,{e:0.3});});
  const caixa=(g,cor,tampa)=>{add(g,boxTris(0.24,0.32,0.1),mat(0,1.1,0),cor,{j:0.04,rnd:R});add(g,boxTris(0.06,1.0,0.06),mat(0,0.5,-0.02),mad,{j:0.06,rnd:R});if(tampa)tampa(g);};
  MESH.obra.interruptor=mk(g=>caixa(g,cin,g=>{add(g,boxTris(0.1,0.14,0.05),mat(0,1.12,0.06),bra);}));
  MESH.obra.temporizador=mk(g=>caixa(g,cin,g=>{add(g,cylTris(0.08,0.08,0.03,10),mat(0,1.12,0.05,Math.PI/2,0,0),bra);add(g,boxTris(0.015,0.06,0.02),mat(0,1.14,0.08),esc);}));
  MESH.obra.sensor=mk(g=>caixa(g,cin,g=>{add(g,icoSubTris(0.07,0.2,R,0),mat(0,1.2,0.07),lin(0x9ab0b8),{e:0.2});}));
  MESH.obra.divisor=mk(g=>{add(g,boxTris(0.36,0.22,0.14),mat(0,0.9,0),aco,{j:0.04,rnd:R});add(g,boxTris(0.06,0.9,0.06),mat(0,0.45,-0.03),mad);for(let i=0;i<3;i++)add(g,boxTris(0.04,0.04,0.06),mat(-0.1+i*0.1,0.98,0.08),ama);add(g,boxTris(0.04,0.04,0.06),mat(0,0.82,0.08),ver);});
  MESH.obra.luminaria=mk(g=>{add(g,boxTris(0.06,1.9,0.06),mat(0,0.95,0),aco2);add(g,boxTris(0.36,0.05,0.06),mat(0.15,1.9,0),aco2);add(g,cylTris(0.14,0.06,0.12,10),mat(0.3,1.78,0),aco);add(g,icoSubTris(0.07,0.2,R,0),mat(0.3,1.72,0),lin(0xfff4d0),{e:1.4});});
  MESH.luminariaApagada=mk(g=>{add(g,icoSubTris(0.075,0.2,R,0),mat(0.3,1.72,0),lin(0x9a9488));});
  MESH.obra.geladeira=mk(g=>{add(g,bvTris(0.82,1.78,0.72),mat(0,0.89,0),lin(0xe6e8e4),{j:0.03,rnd:R});add(g,boxTris(0.8,0.02,0.02),mat(0,1.15,0.37),lin(0x9aa0a4));add(g,boxTris(0.04,0.3,0.05),mat(0.32,1.4,0.38),lin(0x8d969f));add(g,boxTris(0.04,0.4,0.05),mat(0.32,0.75,0.38),lin(0x8d969f));});
  MESH.obra.freezer=mk(g=>{add(g,boxTris(1.18,0.88,0.72),mat(0,0.44,0),lin(0xe6e8e4),{j:0.03,rnd:R});add(g,boxTris(1.2,0.06,0.74),mat(0,0.9,0),lin(0xd0d4d2));add(g,boxTris(0.3,0.04,0.05),mat(0,0.8,0.38),lin(0x8d969f));});
  MESH.obra.esteira=mk(g=>{for(const x of[-0.3,0.3])add(g,boxTris(0.06,0.18,1.6),mat(x,0.42,0),aco2,{j:0.04,rnd:R});add(g,boxTris(0.56,0.05,1.56),mat(0,0.5,0),lin(0x2f3236));for(let i=0;i<6;i++)add(g,cylTris(0.04,0.04,0.56,6),mat(0,0.45,-0.7+i*0.28,0,0,Math.PI/2),cin);
    for(const z of[-0.7,0.7])for(const x of[-0.3,0.3])add(g,boxTris(0.06,0.36,0.06),mat(x,0.18,z),aco2);add(g,boxTris(0.14,0.08,0.06),mat(0,0.56,0.6),ama,{e:0.4});});
  MESH.obra.bestaAuto=mk(g=>{add(g,cylTris(0.3,0.38,0.2,8),mat(0,0.1,0),aco2,{j:0.04,rnd:R});add(g,cylTris(0.08,0.08,1.0,7),mat(0,0.2,0),aco);add(g,boxTris(0.36,0.3,0.3),mat(0,0.4,-0.25),lin(0x3a4a5a));});
  MESH.bestaCabeca=mk(g=>{add(g,boxTris(0.12,0.12,0.8),mat(0,0,0.1),mad,{j:0.06,rnd:R});add(g,boxTris(0.9,0.05,0.06),mat(0,0.02,0.42),lin(0x4a3424));add(g,boxTris(0.02,0.02,0.8),mat(0,0.07,0.15),lin(0xd8cfa8));add(g,boxTris(0.14,0.1,0.14),mat(0,0,-0.25),aco2);});
  MESH.obra.armCartucho=mk(g=>{add(g,boxTris(0.5,0.08,0.4),mat(0,0.04,0),mad,{j:0.06,rnd:R});add(g,boxTris(0.18,0.16,0.3),mat(0,0.16,-0.04),aco2);add(g,cylTris(0.035,0.035,0.42,7),mat(0,0.2,0.14,Math.PI/2,0,0),esc);add(g,boxTris(0.06,0.06,0.06),mat(0.12,0.2,-0.05),verm);});
  MESH.obra.lancaChamas=mk(g=>{add(g,cylTris(0.24,0.24,0.9,9),mat(-0.12,0,-0.15),verm,{j:0.04,rnd:R});add(g,cylTris(0.26,0.26,0.05,9),mat(-0.12,0.9,-0.15),aco2);add(g,boxTris(0.12,0.12,0.6),mat(0.12,0.75,0.2),aco2);
    add(g,cylTris(0.05,0.07,0.32,8),mat(0.12,0.78,0.62,Math.PI/2,0,0),esc);add(g,boxTris(0.06,0.6,0.06),mat(0.12,0.38,0.2),aco2);});});
/* desenho: lâmpada apagada, cabeça da besta virando, faísca do sensor */
DESENHO.opaco.push(function energiaDesenho(Pg){for(const o of OB){if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>80*80)continue;
  if(o.tipo==='luminaria'&&!o.aceso&&MESH.luminariaApagada){trs(_MBA,o.x,o.y,o.z,0,o.yaw,0,1,1,1);drawStat(Pg,MESH.luminariaApagada,_MBA);}
  else if(o.tipo==='bestaAuto'&&MESH.bestaCabeca){trs(_MBA,o.x,o.y+1.25,o.z,o.mPitch||0,o.mYaw??o.yaw,0,1,1,1);drawStat(Pg,MESH.bestaCabeca,_MBA);}}});
/* ---------- defesas automáticas ---------- */
function tirarDe(o,id,n){let falta=n||1;for(let i=0;i<o.itens.length&&falta>0;i++){const s=o.itens[i];if(!s||s.id!==id)continue;const k=Math.min(falta,s.n);s.n-=k;falta-=k;if(s.n<=0)o.itens[i]=null;}return falta<=0;}
const temDentro=(o,id)=>o.itens&&o.itens.some(s=>s&&s.id===id&&s.n>0);
function zumbiNaFrente(o,alc,cone){let best=null,bd=alc*alc;const fx=Math.sin(o.yaw),fz=Math.cos(o.yaw);for(const z of Z){if(!z.vivo)continue;const dx=z.x-o.x,dz=z.z-o.z,dd=dx*dx+dz*dz;if(dd>=bd)continue;
  const l=Math.sqrt(dd)||1;if((dx*fx+dz*fz)/l<Math.cos(cone))continue;bd=dd;best=z;}return best;}
PASSOS.push(function defesasEletricas(dt){for(const o of OB){if(o.hp<=0||!o.energ||!energiaFiado(o))continue;
  if(o.tipo==='bestaAuto'){o.cd=(o.cd||0)-dt;let alvo=null,bd=18*18;for(const z of Z){if(!z.vivo)continue;const dd=d2(z.x,z.z,o.x,o.z);if(dd<bd){bd=dd;alvo=z;}}
    if(!alvo){o.mYaw=aproxAng(o.mYaw??o.yaw,o.yaw,dt*1.5);continue;}const ay=Math.atan2(alvo.x-o.x,alvo.z-o.z);o.mYaw=aproxAng(o.mYaw??o.yaw,ay,dt*4);o.mPitch=-Math.atan2((alvo.y+1)-(o.y+1.25),Math.sqrt(bd))*0.6;
    if(o.cd<=0&&Math.abs(angDiff(o.mYaw,ay))<0.18){if(!temDentro(o,'flecha')){if(!o.avisouF&&d2(o.x,o.z,P.x,P.z)<60*60){o.avisouF=true;feed('A besta automática está sem flechas',true);}o.cd=2;continue;}
      o.avisouF=false;tirarDe(o,'flecha',1);o.cd=1.4;sfx('besta',o.x,o.z,0.8);const l=Math.sqrt(bd)||1,kx=(alvo.x-o.x)/l,kz=(alvo.z-o.z)/l;ferirZ(alvo,55,kx*2,kz*2,false);alvo.flechas=(alvo.flechas||0)+1;
      for(let i=0;i<6;i++){const t=i/6;part(o.x+(alvo.x-o.x)*t,o.y+1.25+((alvo.y+1)-(o.y+1.25))*t,o.z+(alvo.z-o.z)*t,0,0,0,0.35,0.05,[0.9,0.85,0.7,0.6],false,0);}}}
  else if(o.tipo==='armCartucho'){o.cd=(o.cd||0)-dt;if(o.cd>0)continue;const z=zumbiNaFrente(o,4,0.6);if(!z)continue;
    if(!temDentro(o,'cartucho')){o.cd=2;if(!o.avisouC&&d2(o.x,o.z,P.x,P.z)<60*60){o.avisouC=true;feed('A armadilha de cartucho está vazia',true);}continue;}o.avisouC=false;tirarDe(o,'cartucho',1);o.cd=1.6;sfx('espingarda',o.x,o.z,1);barulho(o.x,o.z,30,true);
    const fx=Math.sin(o.yaw),fz=Math.cos(o.yaw);for(const q of Z){if(!q.vivo)continue;const dx=q.x-o.x,dz=q.z-o.z,d=Math.hypot(dx,dz);if(d>6||d<0.01||(dx*fx+dz*fz)/d<Math.cos(0.6))continue;ferirZ(q,70*(1-d/7),dx/d*3,dz/d*3,true);}
    for(let i=0;i<10;i++)part(o.x+fx*0.4,o.y+0.25,o.z+fz*0.4,fx*6+(Math.random()-0.5)*2,0.4+Math.random(),fz*6+(Math.random()-0.5)*2,0.25,0.06,[1,0.85,0.4,0.9],true,0);}
  else if(o.tipo==='lancaChamas'){o.cd=(o.cd||0)-dt;if(o.cd>0)continue;const z=zumbiNaFrente(o,6,0.45);if(!z)continue;
    if(!((o.ext.oleo||0)>0)){if(tirarDe(o,'oleoMotor',1))o.ext.oleo=8;else{o.cd=2;if(!o.avisouO&&d2(o.x,o.z,P.x,P.z)<60*60){o.avisouO=true;feed('O lança-chamas está sem óleo',true);}continue;}}
    o.avisouO=false;o.ext.oleo-=1;o.cd=0.7;sfx('fogo',o.x,o.z,1);const fx=Math.sin(o.yaw),fz=Math.cos(o.yaw);
    for(const q of Z){if(!q.vivo)continue;const dx=q.x-o.x,dz=q.z-o.z,d=Math.hypot(dx,dz);if(d>6.5||d<0.01||(dx*fx+dz*fz)/d<Math.cos(0.5))continue;acender(q,6);ferirZ(q,8,dx/d,dz/d,false);}
    for(let i=0;i<22;i++){const v=3+Math.random()*5;part(o.x+fx*0.7,o.y+0.8,o.z+fz*0.7,fx*v+(Math.random()-0.5)*1.5,0.3+Math.random()*0.8,fz*v+(Math.random()-0.5)*1.5,0.6,0.3,[1,0.55+Math.random()*0.3,0.15,0.9],true,0.4);}}}});
function aproxAng(a,b,k){const d=angDiff(a,b);return Math.abs(d)<=k?b:a+Math.sign(d)*k;}
/* ---------- esteira: leva do que está atrás para o que está na frente ---------- */
const EST_FILTROS=[['tudo','Tudo'],['comida','Comida'],['minerio','Minério, carvão e madeira'],['municao','Munição e flechas'],['material','Materiais']];
function filtroAceita(f,id){const d=ITEMS[id];if(!d)return false;switch(f||'tudo'){case'tudo':return true;case'comida':return d.tipo==='comida';case'minerio':return['minerioFerro','carvao','madeira','barraFerro'].includes(id);
  case'municao':return d.tipo==='municao'||/^(municao|bala|cartucho|flecha)/.test(id);case'material':return d.tipo==='material';default:return id===f;}}
function vizinhoEsteira(o,lado){const fx=Math.sin(o.yaw)*lado,fz=Math.cos(o.yaw)*lado;let best=null,bd=1.9*1.9;for(const q of OB){if(q===o||q.hp<=0)continue;const D=OBRAS[q.tipo];if(!D||!(q.itens||D.estacao==='forja'||D.estacao==='conserva'))continue;
  const dd=d2(q.x,q.z,o.x+fx*1.2,o.z+fz*1.2);if(dd<bd){bd=dd;best=q;}}return best;}
function poeEm(q,id,n,extra){if(q.itens){const d=ITEMS[id];for(const s of q.itens)if(s&&s.id===id&&s.n<d.max){const k=Math.min(n,d.max-s.n);s.n+=k;n-=k;if(n<=0)return 0;}
    for(let i=0;i<q.itens.length&&n>0;i++)if(!q.itens[i]){const k=Math.min(n,d.max);q.itens[i]=Object.assign({id,n:k},extra||{});n-=k;}return n;}return n;}
function esteiraPasso(o){const de=vizinhoEsteira(o,-1),para=vizinhoEsteira(o,1),f=o.ext.filtro||'tudo';o.estado='parada';if(!de||!para)return;const Dd=OBRAS[de.tipo],Dp=OBRAS[para.tipo];
  /* saída de fornalha ou defumador para um baú: recolhe o que ficou pronto */
  if((Dd.estacao==='forja'||Dd.estacao==='conserva')&&para.itens){const L=de.ext.proc||[];const tipo=Dd.estacao;for(let i=L.length-1;i>=0;i--){const it=L[i];if(G.tm<it.fim)continue;const R=PROCESSOS[tipo].rec.find(r=>r.id===it.r);if(!R||!filtroAceita(f,R.para[0]))continue;
      const sob=poeEm(para,R.para[0],it.n||R.para[1]);if(sob>0){it.n=sob;o.estado='cheio';return;}L.splice(i,1);o.estado='levou '+ITEMS[R.para[0]].nome.toLowerCase();return;}return;}
  if(!de.itens)return;
  /* entrada de fornalha ou defumador: começa um processo com o que tem no baú de trás */
  if(Dp.estacao==='forja'||Dp.estacao==='conserva'){const D=PROCESSOS[Dp.estacao],L=para.ext.proc||(para.ext.proc=[]);if(L.length>=D.vagas){o.estado='fornalha cheia';return;}
    for(const R of D.rec){if(R.manual&&!G.fab.manuais[R.manual])continue;if(!Object.keys(R.de).every(k=>filtroAceita(f,k)))continue;const tem=k=>de.itens.reduce((s,q)=>s+(q&&q.id===k?q.n:0),0);
      if(!Object.entries(R.de).every(([k,n])=>tem(k)>=n))continue;for(const[k,n]of Object.entries(R.de))tirarDe(de,k,n);L.push({r:R.id,ini:G.tm,fim:G.tm+R.h*60});o.estado=R.nome.toLowerCase();return;}return;}
  if(!para.itens)return;
  for(let i=0;i<de.itens.length;i++){const s=de.itens[i];if(!s||!filtroAceita(f,s.id))continue;const ex={};for(const k of['v','q','dur','mun'])if(s[k]!==undefined)ex[k]=s[k];
    const sob=poeEm(para,s.id,1,ex);if(sob>0)continue;s.n-=1;if(s.n<=0)de.itens[i]=null;o.estado='levou '+ITEMS[s.id].nome.toLowerCase();return;}}
PASSOS.push(function esteiras(dt){for(const o of OB){if(o.tipo!=='esteira'||o.hp<=0)continue;if(!o.energ||!energiaFiado(o)){o.estado='sem energia';continue;}o.estT=(o.estT||0)-dt;if(o.estT>0)continue;o.estT=3;esteiraPasso(o);}});
/* ---------- mover e desmontar (Etapa 16) com fios ----------
   · enquanto a peça está na mão (mover), os fios dela continuam; posta longe demais (mais de 30 m), o fio é cortado e volta;
   · desmontar uma peça corta os fios dela e devolve o fio. */
{const _em=eletMapa;eletMapa=function(){const M=typeof OBRA!=='undefined'&&OBRA.mov?OBRA.mov.o:null;if(!M||!eletDe(M)||!M.ext||!M.ext.eid)return _em.apply(this,arguments);
  OB.push(M);try{return _em.apply(this,arguments);}finally{const i=OB.lastIndexOf(M);if(i>=0)OB.splice(i,1);}};}
{const _pm=porPecaMovida;porPecaMovida=function(){const M=OBRA.mov,o=M&&M.o,r=_pm.apply(this,arguments);
  if(o&&!OBRA.mov&&OB.includes(o)&&o.ext&&o.ext.eid){let n=0;for(const f of ENER.fios.filter(f=>f.a===o.ext.eid||f.b===o.ext.eid)){const q=eletPorEid(f.a===o.ext.eid?f.b:f.a);if(q&&Math.hypot(q.x-o.x,q.z-o.z)>FIO_MAX){cortarFio(f);n++;}}
    if(n)feed(n+' fio'+(n>1?'s ficaram':' ficou')+' longe demais e '+(n>1?'voltaram':'voltou')+' para a mochila',true);eletMapa();energiaResolver(0);}return r;};}
{const _dp=desmontarPeca;desmontarPeca=function(o){if(o&&o.ext&&o.ext.eid&&ENER.fios.some(f=>f.a===o.ext.eid||f.b===o.ext.eid)){const r=podeMexer(o,'desmontar');
    if(r.ok)for(const f of ENER.fios.filter(f=>f.a===o.ext.eid||f.b===o.ext.eid))cortarFio(f);}return _dp.apply(this,arguments);};}

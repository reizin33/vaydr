/* ================= clima dinâmico: limpo, nublado, chuva, tempestade, neblina, calor e frente fria =================
   cada amanhecer sorteia o tempo do dia (o rádio dá a previsão) e o tempo muda aos poucos.
   consequências:
   · neblina: enxerga-se pouco (você e eles); os zumbis só te veem bem de perto.
   · chuva: abafa o barulho, molha (molhado + noite = frio), enche coletor e filtro, a horta cresce mais rápido.
   · tempestade: escuro, vento forte, trovão abafa tudo, raios caem em árvores altas (fogo) e acordam quem dorme.
   · calor: a sede cai bem mais rápido de dia longe da sombra; a horta sem chuva cresce devagar.
   · frente fria: noite gelada; nem a roupa quente segura sozinha: fique perto do fogo. A horta para de crescer. */
iconesNovos({
  'i-nublado':'<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 10a4.2 4.2 0 0 0 0 8.5z"/>',
  'i-chuva':'<path d="M7 14.5h10a3.6 3.6 0 0 0 .5-7.2A5 5 0 0 0 7.3 7a3.8 3.8 0 0 0-.3 7.5z"/><path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5"/>',
  'i-tempestade':'<path d="M7 13.5h10a3.6 3.6 0 0 0 .5-7.2A5 5 0 0 0 7.3 6a3.8 3.8 0 0 0-.3 7.5z"/><path d="M12.5 13.5l-2.5 4h3l-2 4"/>',
  'i-neblina':'<path d="M4 9h16M6 13h12M4 17h16"/><path d="M8 5.5h8" opacity=".6"/>',
  'i-calor':'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  'i-frio':'<path d="M12 2.5v19M4 7l16 10M4 17L20 7"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
  'i-gota2':'<path d="M12 3.5c3 4 5 6.9 5 9.9a5 5 0 0 1-10 0c0-3 2-5.9 5-9.9z"/><path d="M4.5 15.5c.9 1.1 1.4 1.9 1.4 2.8a1.4 1.4 0 0 1-2.8 0c0-.9.5-1.7 1.4-2.8z"/>'});
const CLIMA_DEF={
  limpo:{nome:'Céu limpo',icon:'i-sol',chuva:0},
  nublado:{nome:'Nublado',icon:'i-nublado',chuva:0},
  chuva:{nome:'Chuva',icon:'i-chuva',chuva:0.72},
  tempestade:{nome:'Tempestade',icon:'i-tempestade',chuva:1},
  neblina:{nome:'Neblina',icon:'i-neblina',chuva:0},
  calor:{nome:'Calorão',icon:'i-calor',chuva:0},
  frio:{nome:'Frente fria',icon:'i-frio',chuva:0}};
/* padrões de dia: [peso, segmentos [ini,fim,tipo]] em horas do dia de jogo (o dia vira às 6h: 6 a 30, e 24 a 30 é a madrugada seguinte) */
const CLIMA_PADROES=[
  [30,[]],
  [16,[[6,9.6,'neblina']]],
  [12,[[9,14,'nublado'],[14,18.5,'chuva']]],
  [8,[[12,16,'nublado'],[16,19,'chuva'],[19,24.5,'tempestade']]],
  [9,[[10.5,17.5,'calor']]],
  [9,[[17,20,'nublado'],[20,30,'frio']]],
  [8,[[6,11,'nublado'],[11,13.5,'chuva'],[13.5,16,'nublado']]],
  [8,[[6,7.5,'neblina'],[7.5,12,'nublado'],[21,28,'chuva'],[28,30,'neblina']]]];
function climaSortear(dia){const segs=[];
  if(dia<=1){segs.push([20.5,26,'nublado']);return segs;}   // primeiro dia: limpo para aprender
  let tot=0;for(const p of CLIMA_PADROES)tot+=p[0];let r=Math.random()*tot,pad=CLIMA_PADROES[0];for(const p of CLIMA_PADROES){r-=p[0];if(r<=0){pad=p;break;}}
  for(const s of pad[1])segs.push(s.slice());
  if(pad===CLIMA_PADROES[4]&&Math.random()<0.4)segs.push([17.5,21,'tempestade']);   // tempestade de verão no fim de um dia quente
  return segs;}
function climaAgora(){const c=G.clima;if(!c)return'limpo';const h=G.hora<6?G.hora+24:G.hora;for(const s of c.segs)if(h>=s[0]&&h<s[1])return s[2];return'limpo';}
function climaPrevisao(segs){const nomes=t=>({nublado:'tempo fechado',chuva:'chuva',tempestade:'tempestade forte',neblina:'neblina',calor:'calorão',frio:'uma frente fria'}[t]);
  const per=h=>h<12?'de manhã':h<18?'à tarde':h<24?'à noite':'de madrugada';
  if(!segs.length)return'Previsão: céu limpo o dia inteiro. Bom para explorar longe.';
  const p=[];for(const s of segs){const t=nomes(s[2])+' '+per(s[0]);if(!p.includes(t))p.push(t);}
  const dica={tempestade:' Na tempestade os raios caem nas árvores altas e o barulho esconde tudo.',neblina:' Na neblina eles não te veem de longe, mas você também não.',calor:' Leve água: no calor a sede aperta.',frio:' Durma perto do fogo: nem roupa quente segura essa.',chuva:' A chuva molha: molhado à noite dá frio.'};
  const extra=segs.map(s=>dica[s[2]]).find(Boolean)||'';
  return'Previsão: '+listaE(p)+'.'+extra;}
let climaT=0,raioT=40;
function updateClima(dt){if(G.modo!=='jogo'||!G.clima)return;const c=G.clima;
  if(c.dia!==G.dia){c.segs=climaSortear(G.dia);c.dia=G.dia;if(G.dia>1)setTimeout(()=>{if(G.modo==='jogo'||G.modo==='pausa')toast('radio',climaPrevisao(c.segs));},6000);}
  const tipo=climaAgora();if(tipo!==c.atual){c.antes=c.atual;c.atual=tipo;c.k=0;climaAviso(tipo);}
  c.k=Math.min(1,(c.k||0)+dt/25);const D=CLIMA_DEF[c.atual]||CLIMA_DEF.limpo;
  // chuva: o tempo manda (o sorteio antigo de chuva fica desligado)
  G.chuvaT=-1;G.chuvaAlvo=D.chuva;G.chuvaFim=undefined;G.chuvaForte=c.atual==='tempestade'?c.k:0;
  // molhado: chuva sem teto molha; fogo e tempo seco secam; nadar encharca
  const sob=CARRO.ativo||((emPredios(P.x,P.z,2)||P.y<-20)&&interiorEm(P.x,P.y+0.3,P.z)>0.5)||P.dorme&&G.dormindo&&G.dormindo.lugar&&(G.dormindo.lugar.barraca||G.dormindo.lugar.cama)||(typeof abrigado==='function'&&abrigado());
  if(P.nada)P.molhado=1;else if(G.chuva>0.3&&!sob)P.molhado=Math.min(1,(P.molhado||0)+dt*G.chuva/70*(1-chuvaRoupa()));
  else P.molhado=Math.max(0,(P.molhado||0)-dt*(pertoDoFogo()?1/22:sob?1/120:1/260));
  // tempestade: trovões mais seguidos e raios que caem nas árvores altas
  if(c.atual==='tempestade'&&c.k>0.5&&AU&&AU.proxTrovao>9)AU.proxTrovao=Math.min(AU.proxTrovao,4+Math.random()*9);
  if(c.atual==='tempestade'&&c.k>0.7){raioT-=dt;if(raioT<=0){raioT=45+Math.random()*70;raioCai();}}
  climaT-=dt;if(climaT<=0){climaT=1;hudClima();}}
function climaAviso(t){const m={neblina:'A neblina está baixando. Dá para passar perto deles sem ser visto, mas fique atento.',tempestade:'Tempestade chegando! Fique longe das árvores altas e procure abrigo.',
  chuva:'Começou a chover. O barulho fica abafado e os zumbis enxergam menos. A chuva molha: à noite, molhado dá frio.',calor:'Que calor. A sede vai apertar: beba água.',frio:'O vento virou e esfriou muito. Esta noite, só o fogo esquenta de verdade.',nublado:null,limpo:null}[t];
  if(m&&G.modo==='jogo')toast('clima',m);if(typeof diarioEvento==='function'&&t!=='limpo'&&t!=='nublado')diarioEvento('Clima: '+CLIMA_DEF[t].nome.toLowerCase());}
/* raio: escolhe uma árvore alta perto do jogador; queima, vira árvore morta e o fogo no pé dela machuca quem estiver perto */
function raioCai(){let best=null;for(let k=0;k<40;k++){const t=TREES[Math.floor(Math.random()*TREES.length)];if(!t||!t.alive||t.agua)continue;const d=Math.hypot(t.x-P.x,t.z-P.z);if(d<18||d>85)continue;if(t.s<1.05)continue;best=t;break;}
  G.raio=0.32;if(!best){sfx('trovao',undefined,undefined,1,0.3);return;}
  const g=ground(best.x,best.z),d=Math.hypot(best.x-P.x,best.z-P.z);sfx('trovao',best.x,best.z,1.2,0.05+d/340);
  best.kind=2;best.t=0.55;vegDirty=true;faiscas(best.x,g+6,best.z);faiscas(best.x,g+3,best.z);for(let i=0;i<10;i++)part(best.x,g+2+Math.random()*6,best.z,(Math.random()-0.5)*3,Math.random()*3,(Math.random()-0.5)*3,1.1,0.12,[1,0.85,0.5,1],true,4);
  CHAMAS.push({x:best.x+0.8,y:g,z:best.z+0.4,r:2.0,t:0,dur:20,rr:0});barulho(best.x,best.z,55,false,g);incendioDeRaio(best);
  for(const z of Z)if(z.vivo&&Math.hypot(z.x-best.x,z.z-best.z)<4.5)ferirZ(z,70,z.x-best.x,z.z-best.z,1);
  if(d<5&&P.alive){ferirJogador(30);P.shake=1;feed('O raio caiu do seu lado!',true);}
  if(typeof diarioEvento==='function')diarioEvento('Um raio incendiou uma árvore');}
/* ---------- efeitos usados pelos outros sistemas ---------- */
function climaK(t){const c=G.clima;return c&&c.atual===t?(c.k||0):0;}
function climaAmbiente(e){const c=G.clima;if(!c)return;const t=c.atual,k=c.k||0;
  // a transição do tempo anterior para o novo é suave (k vai de 0 a 1)
  const neb=climaK('neblina'),tem=climaK('tempestade'),nub=Math.max(climaK('nublado'),tem*0.8,climaK('chuva')*0.6),cal=climaK('calor'),fri=climaK('frio');
  if(neb>0){e.fogD*=1+2.4*neb;e.mist=Math.min(1,e.mist+0.5*neb);e.dc=scl(e.dc,1-0.45*neb);e.sat*=1-0.18*neb;}
  if(tem>0){e.fogD*=1+0.6*tem;e.hs=scl(e.hs,1-0.38*tem);e.dc=scl(e.dc,1-0.65*tem);e.cloud=Math.max(e.cloud,0.88*tem);e.wind=[e.wind[0]*(1+1.9*tem),e.wind[1]*(1+1.9*tem)];e.sunV*=1-0.9*tem;e.moonV*=1-0.9*tem;e.stars*=1-tem;}
  if(nub>0){e.cloud=Math.max(e.cloud,0.55+0.3*nub);e.dc=scl(e.dc,1-0.35*nub);e.sunV*=1-0.6*nub;e.stars*=1-0.8*nub;}
  if(cal>0){e.gain=mixc(e.gain,[1.12,1.0,0.86],0.5*cal);e.mist*=1-0.6*cal;e.sat*=1+0.06*cal;}
  if(fri>0){e.lift=mixc(e.lift,[0.86,0.94,1.12],0.6*fri);e.gain=mixc(e.gain,[0.95,1.0,1.08],0.5*fri);e.mist=Math.min(1,e.mist+0.15*fri);}}
function climaVisao(){return(1-0.5*climaK('neblina'))*(1-0.25*climaK('tempestade'));}
function climaRuido(){return 1-0.3*climaK('tempestade');}
function climaSede(){const c=climaK('calor');if(!c)return 1;const sombra=CARRO.ativo||((emPredios(P.x,P.z,2)||P.y<-20)&&interiorEm(P.x,P.y+0.3,P.z)>0.5);return sombra?1+0.2*c:1+0.6*c;}
/* frio do tempo (0..1): frente fria à noite, molhado à noite ou na tempestade; compara com o calor da roupa */
function climaFrio(){let f=0;const n=E.n||0;f=Math.max(f,climaK('frio')*(0.6+0.6*n));if((P.molhado||0)>0.35)f=Math.max(f,(P.molhado||0)*(n>0.5?0.9:climaK('tempestade')>0.5?0.7:0));return f;}
function climaHorta(){const fr=climaK('frio'),ca=climaK('calor');if(fr>0.3)return 0.15;if(ca>0.3&&G.chuva<0.3)return 0.7;return 1;}
/* ---------- HUD: ícone e nome do tempo no relógio, chip de molhado ---------- */
function hudClima(){const c=G.clima;const el=$('dia-clima');if(el&&c){const D=CLIMA_DEF[c.atual]||CLIMA_DEF.limpo,mostra=c.atual!=='limpo';el.hidden=!mostra;if(mostra){el.querySelector('use').setAttribute('href','#'+D.icon);el.querySelector('span').textContent=D.nome;}}
  const m=$('vx-molhado');if(m)m.hidden=!((P.molhado||0)>0.35);}
PASSOS.push(updateClima);
V8.novo.clima=()=>{G.clima={dia:G.dia,segs:climaSortear(G.dia),atual:'limpo',k:1};P.molhado=0;};
V8.salvar.clima=()=>G.clima?{dia:G.clima.dia,segs:G.clima.segs,atual:G.clima.atual,molhado:+(P.molhado||0).toFixed(2)}:null;
V8.carregar.clima=s=>{if(s&&Array.isArray(s.segs)){G.clima={dia:s.dia,segs:s.segs,atual:s.atual||'limpo',k:1};P.molhado=s.molhado||0;}else V8.novo.clima();};

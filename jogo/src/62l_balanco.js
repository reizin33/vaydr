/* ================= Balanceamento das armas e do dano (pedido do Himalaia) =================
   O que estava errado:
   · pistola com 55 de dano (143 na cabeça) e, no celular, a ajuda de mira da pistola apontava sempre para a cabeça: todo tiro
     de pistola no celular matava qualquer zumbi comum na hora;
   · espingarda 8 × 19 (até 182 de perto), rifle 150 e besta 120: um tiro no corpo matava qualquer zumbi comum;
   · o tiro só sabia "cabeça ou não": braço, perna e peito davam o mesmo dano;
   · a besta contava a habilidade "Mão firme" duas vezes (no disparo e no acerto).
   Agora os números ficam todos aqui, em BALANCO (é só mudar aqui para ajustar depois):
   · armas: categoria, dano-base (tiro no tronco, perto), precisão (abertura do tiro em radianos: sem mirar e mirando; correndo
     abre mais), cadência (tempo entre tiros), alcance efetivo e quanto o dano cai depois dele, carregador, recarga e munição.
     Hierarquia: pistola < arco < besta < espingarda (de perto) < rifle de precisão. Submetralhadora e rifle comum não existem
     no jogo e não foram inventados;
   · regiões do corpo: cabeça, tronco, braços e pernas, com multiplicador geral e ajuste por categoria (chumbo na cabeça rende
     menos; o rifle de precisão rende mais);
   · zumbis: vida e resistência (quanto do dano das armas do jogador entra: comuns 100%, resistentes e especiais menos, chefes
     bem menos). Colete e capacete (policial e sargento) continuam valendo depois disso; o colete só cobre o tronco;
   · armas brancas: dano, tempo e alcance de cada uma; golpe de cima e golpe furtivo.
   Dano de um acerto = dano-base × melhoria da arma × região × distância × resistência do zumbi × "Mão firme" × variação (±8%).
   Animais (caça) levam o mesmo dano de antes de cada arma, para a caça não mudar. Explosão e fogo continuam como eram. */
const BALANCO={
  regioes:{cabeca:2.5,tronco:1,bracos:0.6,pernas:0.7},
  regioesCat:{espingarda:{cabeca:1.6,bracos:0.7,pernas:0.75},precisao:{cabeca:3}},
  variacao:0.08,          // ± no dano de cada acerto (de cada bago, na espingarda)
  correndo:1.6,           // a abertura do tiro cresce assim correndo
  miraPorNivel:0.15,      // habilidade "Mão firme": armas de fogo, arco e besta
  forcaPorNivel:0.12,     // habilidade "Braço forte": corpo a corpo
  categorias:{pistola:'Pistola',espingarda:'Espingarda',precisao:'Rifle de precisão',projetil:'Arco e besta',branca:'Arma branca'},
  armas:{
    pistola:{cat:'pistola',dano:30,tempo:0.3,pente:8,recarga:1.3,municao:'municao9',alcance:20,alcanceMax:50,minK:0.55,abre:0.012,abreMira:0.004,bicho:55},
    espingarda:{cat:'espingarda',dano:14,chumbo:8,tempo:0.9,pente:5,municao:'cartucho',alcance:5,alcanceMax:25,minK:0.15,abre:0.075,abreMira:0.06,bicho:19},
    rifle:{cat:'precisao',dano:125,tempo:1.15,pente:5,recarga:2,municao:'balaRifle',alcance:80,alcanceMax:140,minK:0.8,abre:0.03,abreMira:0,atravessa:2,atravessaK:0.65,bicho:150},
    besta:{cat:'projetil',dano:80,tempo:0.25,pente:1,recarga:1.5,municao:'virote',bicho:120},
    arco:{cat:'projetil',dano:45,municao:'flecha',bicho:62}},
  brancas:{maos:{dano:9,alcance:1.7},pedra:{dano:12,alcance:1.75},
    facaPedra:{dano:13,tempo:0.4,alcance:1.7},faca:{dano:20,tempo:0.38,alcance:1.8},porrete:{dano:21,tempo:0.58,alcance:2.1},peDeCabra:{dano:22,tempo:0.6,alcance:2},
    machadoPedra:{dano:24,tempo:0.72,alcance:2.15},facaCaca:{dano:24,tempo:0.38,alcance:1.85},picareta:{dano:26,tempo:0.72,alcance:2.2},lanca:{dano:27,tempo:0.6,alcance:2.85},
    taco:{dano:28,tempo:0.55,alcance:2.25},machado:{dano:34,tempo:0.66,alcance:2.3},tacoCravado:{dano:37,tempo:0.56,alcance:2.25},facao:{dano:44,tempo:0.5,alcance:2.15}},
  golpe:{deCima:1.15,furtivo:2},
  zumbis:{
    walker:{hp:100,resist:1,grupo:'comum'},runner:{hp:65,resist:1,grupo:'comum'},screamer:{hp:70,resist:1,grupo:'comum'},
    rastejante:{hp:65,resist:1,grupo:'comum'},caoZ:{hp:45,resist:1,grupo:'comum'},emboscada:{hp:90,resist:1,grupo:'comum'},
    inchado:{hp:85,resist:1,grupo:'especial'},elite:{hp:700,resist:0.85,grupo:'especial'},
    policial:{hp:150,resist:1,grupo:'resistente'},sentinela:{hp:150,resist:0.9,grupo:'resistente'},brute:{hp:420,resist:0.9,grupo:'resistente'},
    colosso:{hp:1800,resist:0.8,grupo:'chefe'},acougueiro:{hp:1100,resist:0.85,grupo:'chefe'},sargento:{hp:900,resist:0.85,grupo:'chefe'},
    pacienteZero:{hp:800,resist:0.85,grupo:'chefe'},maquinista:{hp:650,resist:0.85,grupo:'chefe'},fazendeiro:{hp:1000,resist:0.85,grupo:'chefe'}}};
/* os números entram nos itens e nos zumbis do jogo (o resto do jogo continua lendo ITEMS e ZS como sempre) */
function balancoAplicar(){
  for(const id in BALANCO.armas){const d=ITEMS[id],B=BALANCO.armas[id];if(!d)continue;for(const k of['dano','tempo','pente','recarga','chumbo','atravessa'])if(B[k]!==undefined)d[k]=B[k];if(d.chumbo)d.abre=B.abre;}
  for(const id in BALANCO.brancas){const d=ITEMS[id],B=BALANCO.brancas[id];if(!d)continue;for(const k of['dano','tempo','alcance'])if(B[k]!==undefined)d[k]=B[k];}
  for(const t in BALANCO.zumbis){const S=ZS[t];if(S)S.hp=BALANCO.zumbis[t].hp;}}
balancoAplicar();
function zResist(z){const B=z&&BALANCO.zumbis[z.tipo];return B&&B.resist!==undefined?B.resist:1;}
function multRegiao(cat,reg){const o=BALANCO.regioesCat[cat];if(o&&o[reg]!==undefined)return o[reg];const v=BALANCO.regioes[reg];return v===undefined?1:v;}
function quedaDist(B,d){if(!B||!B.alcance||d<=B.alcance)return 1;return lerp(1,B.minK,clamp((d-B.alcance)/Math.max(1,(B.alcanceMax||B.alcance*2)-B.alcance),0,1));}
function variacaoDano(){const v=BALANCO.variacao;return 1-v+Math.random()*2*v;}
function distJogador(p){return Math.hypot(p[0]-P.x,p[1]-(P.y+1.4),p[2]-P.z);}
/* onde o tiro pegou. r = raySeg(o,dir,C.a,C.b) no corpo C = zCorpo(z). Em pé: cabeça acima de 1,5 m (× escala), pernas abaixo
   do quadril (0,9 m), braços nas laterais do corpo (o ponto de entrada fica a mais de 62% do raio do eixo, de lado em relação
   a para onde o zumbi olha). Rastejante: cabeça, tronco e pernas (atrás). Cão: cabeça ou tronco. */
function regiaoTiro(z,r,C,o,dir){const S=ZS[z.tipo]||{};if(r.u>C.cab)return'cabeca';if(S.cao)return'tronco';if(S.baixo)return r.u<0.35?'pernas':'tronco';
  const sc=z.ch.s||1,h=C.a[1]+(C.b[1]-C.a[1])*r.u-z.y;if(h<0.9*sc)return'pernas';
  let lat=r.dist;if(o&&dir){const hz=Math.max(0.2,Math.hypot(dir[0],dir[2])),te=Math.max(0,r.t-Math.sqrt(Math.max(0,C.r*C.r-r.dist*r.dist))/hz),
    px=o[0]+dir[0]*te-z.x,pz=o[2]+dir[2]*te-z.z,ya=z.ch.yaw||0;lat=Math.abs(px*Math.cos(ya)-pz*Math.sin(ya));}
  return lat>C.r*0.62?'bracos':'tronco';}
/* dano de um acerto de arma de fogo (sem colete/capacete, que entram depois em ferirZ) */
function danoTiro(id,reg,dist,z,s){const B=BALANCO.armas[id]||{},d=ITEMS[id]||{};
  return(d.dano||0)*danoUp(s)*multRegiao(B.cat,reg)*quedaDist(B,dist)*zResist(z)*(1+BALANCO.miraPorNivel*perk('mira'))*variacaoDano();}
/* flecha e virote: f.dano já vem com a força da corda (arco) e a melhoria da arma */
function danoFlecha(f,reg,z){const B=BALANCO.armas[f.arma||'arco']||{};return f.dano*multRegiao(B.cat||'projetil',reg)*zResist(z)*(1+BALANCO.miraPorNivel*perk('mira'))*variacaoDano();}
function danoGolpe(d,s,z,vertical,furtivo){const g=BALANCO.golpe;return(d.dano||9)*danoUp(s)*(vertical?g.deCima:1)*(furtivo?g.furtivo:1)*(1+BALANCO.forcaPorNivel*perk('forca'))*zResist(z)*variacaoDano();}
/* dano em animal: o de antes de cada arma */
function danoBicho(id,s){const B=BALANCO.armas[id];return(B&&B.bicho||ITEMS[id]&&ITEMS[id].dano||0)*danoUp(s);}
/* abertura do tiro agora (sem mirar, mirando, correndo) */
function abreTiro(id){const B=BALANCO.armas[id];if(!B||B.abre===undefined)return 0;const mira=P.aim>0.6||lunetaAtiva();
  return(mira?(B.abreMira||0):B.abre)*(IN.run&&Math.hypot(IN.mx,IN.mz)>0.1?BALANCO.correndo:1);}
function zhitDe(k,arma,reg){const B=BALANCO.armas[arma]||{};return{k,head:reg==='cabeca',arma,reg,mult:multRegiao(B.cat,reg)};}

/* ---------- na mochila: o que cada arma faz ---------- */
{const st=document.createElement('style');st.textContent='.stats-arma .stat{grid-template-columns:76px minmax(0,1fr) 70px}.stat-tipo em{grid-column:2/-1;text-align:left;text-transform:none;letter-spacing:.02em}';document.head.appendChild(st);}
function numBR(x){return String(Math.round(x*10)/10).replace('.',',');}
function statsArma(id,d,s){const B=BALANCO.armas[id],up=danoUp(s);let h='<div class="stat stat-tipo"><span>Tipo</span><em>'+BALANCO.categorias[B.cat]+'</em></div>';
  const tot=d.dano*(d.chumbo||1)*up;h+=barraStat('Dano',tot/BALANCO.armas.rifle.dano,d.chumbo?d.chumbo+' × '+numBR(d.dano*up):numBR(d.dano*up),'var(--ember)');
  const mc=multRegiao(B.cat,'cabeca');h+=barraStat('Cabeça',mc/3,'× '+numBR(mc),'var(--blood)');
  if(id==='arco')h+=barraStat('Puxar',ARCO.puxa/1.5,numBR(ARCO.puxa)+' s','var(--grain)');
  else{const ciclo=d.tempo+(d.pente===1?(d.recarga||0):0);h+=barraStat('Cadência',0.3/ciclo,numBR(1/ciclo)+'/s','var(--grain)');}
  if(B.alcance)h+=barraStat('Alcance',B.alcance/80,'até '+B.alcance+' m','var(--water)');
  if(B.abre!==undefined){const pm=1-Math.min(1,(B.abreMira||0)/0.08);h+=barraStat('Precisão',pm,Math.round(pm*100)+'%','var(--moss)');}
  if(d.fogo){h+=barraStat('Pente',d.pente/8,String(d.pente),'');h+=barraStat('Recarga',d.porCartucho?0.6:Math.min(1,1/(d.recarga||1.3)),d.porCartucho?'1 por vez':numBR(d.recarga||1.3)+' s','');}
  return h;}
{const _si=statsItem;statsItem=function(s,d){const h=_si.apply(this,arguments);if(!d||d.tipo!=='arma'||!d.dano)return h;
  const id=s&&s.id&&ITEMS[s.id]===d?s.id:Object.keys(ITEMS).find(k=>ITEMS[k]===d);
  const velho=barraStat('Dano',d.dano/55,String(d.dano),'var(--ember)')+barraStat('Rapidez',0.3/d.tempo,(1/d.tempo).toFixed(1)+'/s','var(--grain)')+(d.alcance?barraStat('Alcance',d.alcance/3,d.alcance.toFixed(1)+' m','var(--water)'):'');
  if(!h.includes(velho))return h;
  if(BALANCO.armas[id])return h.replace('<div class="stats-i">','<div class="stats-i stats-arma">').replace(velho,statsArma(id,d,s));
  if(BALANCO.brancas[id])return h.replace('<div class="stats-i">','<div class="stats-i stats-arma">').replace(velho,'<div class="stat stat-tipo"><span>Tipo</span><em>'+BALANCO.categorias.branca+(d.vertical?' · golpe de cima +15%':'')+'</em></div>'+velho);
  return h;};}

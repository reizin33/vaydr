/* ================= Liga com: para que serve e onde achar (v10.8.2) =================
   Himalaia (19/11/2026): "está faltando ... itens que se conectam, coisas que se conectam". O jogo tem muita coisa ligada
   (receitas, construção, melhorias de arma, abrigos, corridas, saque por lugar), mas nada dizia a ligação. Agora cada item
   da mochila mostra:
   · Serve para: o que se fabrica com ele, o que se constrói, as melhorias de arma e os abrigos que precisam dele;
   · Onde achar: os lugares onde ele costuma aparecer (pelas tabelas de saque do mundo: casas, oficinas, farmácias, metrô,
     militares, Morro, Feira, Cidade Alta...), os achados de primeira vez (a casa das máquinas do Plano Inclinado), se dá
     para fabricar e se é prêmio de corrida.
   E no "O que fazer" (mapa grande), o que falta para religar um abrigo diz onde costuma aparecer. */
const LIGA={idx:null,chave:''};
/* nome da tabela de saque -> lugar (o primeiro que casar vale; null = não mostra) */
const LIGA_LUGAR=[
  [/^inicio$|^lenha$/,null],[/^zumbi$/,'zumbis mortos'],
  [/^hosp|cofre_hosp/,'hospital'],[/farmacia/,'farmácias'],[/^metro/,'metrô'],[/^ap_/,'apartamentos'],
  [/_pol$|delegado|^arsenal|vestiario/,'delegacia'],[/hotel|suite|lavanderia/,'hotel'],
  [/mercado|conveniencia|padaria|armazem|caixa_loja|estoque|quiosque/,'mercados e lojas'],
  [/^oficina$|^pecas$/,'oficinas'],[/^carro$/,'carros abandonados'],[/^lixo$/,'lixo e entulho'],
  [/militar|cxm|comboio|guarita|comandante|vagaoBlindado|^elite$/,'militares (caixas, comboio, guaritas)'],
  [/^morro/,'Morro do Sabiá'],[/^feira/,'Feira'],[/^calta/,'Cidade Alta'],
  [/cessna|heli|carga/,'aviões e helicópteros caídos'],[/balao/,'balão caído'],
  [/naufragio|veleiro|capitao|conteiner|salvaVidas|pescador/,'litoral e porto'],
  [/^desafio/,'Armazém Norte'],[/^casa$|^dormitorio$|^banheiro$|^porao$|^adega$|^teto$|^cobertura$/,'casas'],
  [/escritorio|recepcao|deposito/,'escritórios e depósitos'],[/^celeiro$/,'celeiros e fazendas'],
  [/^comum$|^suprimentos$/,'caixas e sacos na mata'],[/escondid|esconderijo/,'esconderijos'],
  [/laboratorio|labSeg/,'laboratório'],[/estacaoSub|arsenalSub|minaEsc|abrigoDep|abrigoSala/,'subsolo e minas'],
  [/bilheteria/,'bilheterias'],[/enchente/,'enchente'],[/elevador|fosso/,'elevadores e fossos'],[/cofre/,'cofres']];
function ligaNomeTab(t){for(const[re,n]of LIGA_LUGAR)if(re.test(t))return n;return null;}
/* índice: de onde cada item vem e para que serve (refeito se aparecer abrigo, corrida ou receita nova) */
function ligaIndice(){const ch=RECIPES.length+'/'+ABRIGOS.length+'/'+CORRIDAS.length+'/'+(G.modo==='jogo'?1:0);if(LIGA.idx&&LIGA.chave===ch)return LIGA.idx;
  const fonte={},uso={},fab={},pr={};
  const add=(id,lugar,p)=>{if(!id||!ITEMS[id]||!lugar)return;const o=fonte[id]||(fonte[id]={});o[lugar]=Math.max(o[lugar]||0,p);};
  const tab=(T,iProb)=>{if(!T)return;for(const k in T){const L=T[k],n=ligaNomeTab(k);if(!n||!Array.isArray(L))continue;
    for(const e of L)if(Array.isArray(e)){const p=+e[iProb];add(e[0],n,isFinite(p)&&p>0?p:0.1);}}};
  tab(LOOT,3);if(typeof CID_LOOT!=='undefined')tab(CID_LOOT,1);if(typeof CAIXA_LOOT!=='undefined')tab(CAIXA_LOOT,1);
  for(const o of INTER)if(o&&Array.isArray(o.primeiro)&&o.label){const lug=String(o.label).replace(/^Revistar\s+(o |a |os |as )?/i,'');for(const e of o.primeiro)add(e[0],lug,1);}
  const u=(k,q)=>{if(ITEMS[k])(uso[k]||(uso[k]=[])).push(q);};
  for(const r of RECIPES){if(!r||!r.custo||!ITEMS[r.faz])continue;if(!fab[r.faz])fab[r.faz]=r;for(const k in r.custo)u(k,{t:'fab',nome:ITEMS[r.faz].nome});}
  for(const t in OBRAS){const o=OBRAS[t];if(o&&o.custo&&o.nome)for(const k in o.custo)u(k,{t:'obra',nome:o.nome});}
  if(typeof MELHORIAS!=='undefined')for(const t in MELHORIAS){const m=MELHORIAS[t];if(m&&m.custo)for(const k in m.custo)u(k,{t:'melh',nome:m.nome});}
  for(const A of ABRIGOS)for(const k in A.custo||{})u(k,{t:'abrigo',nome:A.nome});
  for(const C of CORRIDAS)for(const m in C.premios||{})for(const e of C.premios[m])(pr[e[0]]||(pr[e[0]]=new Set())).add(C.nome);
  LIGA.idx={fonte,uso,fab,pr};LIGA.chave=ch;return LIGA.idx;}
/* usos que não estão em receita nem em obra (veículos, Armazém Norte...) */
const LIGA_EXTRA={fusivel:['religar o quadro do Armazém Norte'],gasolina:['abastecer veículos'],oleoMotor:['trocar o óleo dos veículos'],bateriaVeic:['a bateria dos veículos'],
  pecaVeiculo:['consertar o motor dos veículos'],pecasRotor:['o rotor do helicóptero'],pneu:['trocar pneu de veículo'],kitFerramentas:['consertos de veículo']};
function ligaLista(a,n){return a.length<=n?a.join(', '):a.slice(0,n).join(', ')+' e mais '+(a.length-n);}
const ligaUnico=(L,t)=>[...new Set(L.filter(q=>q.t===t).map(q=>q.nome.toLowerCase()))];
/* lugares onde o item aparece, do mais provável para o menos */
function ligaLugares(id){const f=ligaIndice().fonte[id];return f?Object.entries(f).sort((a,b)=>b[1]-a[1]).map(q=>q[0]):[];}
function ligaHtml(id){if(!ITEMS[id])return'';const I=ligaIndice();let h='';
  const L=I.uso[id]||[];if(L.length||LIGA_EXTRA[id]){const p=[],fb=ligaUnico(L,'fab'),ob=ligaUnico(L,'obra'),me=ligaUnico(L,'melh'),ab=[...new Set(L.filter(q=>q.t==='abrigo').map(q=>q.nome))];
    if(fb.length)p.push('fabricar '+ligaLista(fb,5));if(ob.length)p.push('construir '+ligaLista(ob,4));if(me.length)p.push('melhorar arma ('+ligaLista(me,3)+')');
    if(ab.length)p.push('religar a luz do '+ligaLista(ab,2));
    if(LIGA_EXTRA[id])p.push(...LIGA_EXTRA[id]);
    h+='<p class="det-nota liga">'+svgUse('i-chave')+'<span><b>Serve para:</b> '+p.join('; ')+'.</span></p>';}
  const lug=ligaLugares(id),ex=[];if(I.fab[id])ex.push('dá para fabricar');if(I.pr[id])ex.push('prêmio da '+[...I.pr[id]].join(', '));
  if(lug.length||ex.length)h+='<p class="det-nota liga">'+svgUse('i-mapa')+'<span><b>Onde achar:</b> '+(lug.length?ligaLista(lug,5):'')+(lug.length&&ex.length?'; ':'')+ex.join('; ')+'.</span></p>';
  return h;}
/* na mochila: entra antes dos botões do item escolhido */
{const _ir=invRender;invRender=function(){const r=_ir.apply(this,arguments);
  try{if(invAba==='mochila'&&invSel>=0&&P.inv[invSel]&&!$('inv').hidden){const det=$('detalhe'),ac=det&&det.querySelector('.det-acoes');
      if(det&&!det.querySelector('.liga')){const h=ligaHtml(P.inv[invSel].id);if(h){if(ac)ac.insertAdjacentHTML('beforebegin',h);else det.insertAdjacentHTML('beforeend',h);}}}}
  catch(e){console.error('liga',e);}return r;};}
/* "O que fazer": o que falta de um abrigo diz onde costuma aparecer (o lugar mais provável de cada peça que falta) */
function ligaOndeFalta(c){const f=[];for(const k in c||{}){if(invCount(k)>=c[k])continue;const l=ligaLugares(k);if(l.length)f.push(ITEMS[k].nome.toLowerCase()+': '+ligaLista(l,2));}return f.join(' · ');}
{const _at=ativTodas;ativTodas=function(){const L=_at.apply(this,arguments);
  try{for(const a of L){if(a.tipo!=='abrigo'||a.feito||a.ligaOk)continue;const A=ABRIGOS.find(q=>'abrigo-'+q.id===a.id);if(!A)continue;
      const S=abrigoD(A.id);if(S.limpo&&ativFalta(A.custo).length){const o=ligaOndeFalta(A.custo);if(o)a.falta+=' (onde achar: '+o+')';}a.ligaOk=true;}}catch(e){}
  return L;};}
/* ================= viajar entre abrigos acesos (v10.8.2) =================
   Com dois ou mais abrigos acesos, quem está dentro de um vê no "O que fazer" (mapa grande) a lista dos outros com o botão
   Viajar: você vai a pé pelo caminho conhecido (o tempo passa: uns 50 min por km, com fome e sede do caminho) e chega na
   cama do outro abrigo, que vira o lugar de voltar se cair. Não dá dirigindo, na corrida, no desafio nem com zumbi caçando. */
function abrigoOnde(){for(const A of ABRIGOS)if(abrigoPronto(A)&&abrigoD(A.id).ligado&&Math.hypot(P.x-A.x,P.z-A.z)<A.r&&Math.abs(P.y-(A.y??P.y))<8)return A;return null;}
function abrigoViagemHoras(de,A){return clamp(Math.hypot(A.x-de.x,A.z-de.z)/1000*0.85,0.3,3);}
function abrigoViagemNao(){if(!P.alive)return'Agora não dá';if(typeof CARRO!=='undefined'&&CARRO.ativo)return'Saia do veículo antes';if(CORR.ativa)return'Termine a corrida antes';
  if(typeof RES!=='undefined'&&RES.ativo)return'Termine o desafio antes';
  for(const z of Z)if(z.vivo&&(z.st==='caca'||z.st==='golpe')&&Math.hypot(z.x-P.x,z.z-P.z)<25)return'Tem zumbi atrás de você';return null;}
/* ponto livre perto da cama do abrigo (na altura dela) */
function abrigoChegada(A){const c=A.cama;for(const r of[1.1,1.6,2.2])for(let k=0;k<8;k++){const a=k/8*Math.PI*2,x=c.x+Math.sin(a)*r,z=c.z+Math.cos(a)*r,y=chaoEm(x,z,c.y+0.6);
    if(Math.abs(y-c.y)<0.5&&!bloqueadoAlto(x,z,0.32,y))return{x,y,z};}return{x:c.x,y:c.y+0.3,z:c.z};}
function abrigoViajar(A){const de=abrigoOnde();if(!de||de===A||!abrigoD(A.id).ligado)return;const nao=abrigoViagemNao();if(nao){feed(nao,true);return;}
  const horas=abrigoViagemHoras(de,A);if(G.modo==='mapa')fecharMapa();
  const q=abrigoChegada(A);P.x=q.x;P.z=q.z;P.y=q.y;P.vx=P.vz=0;P.vy=0;P.noChao=true;P.escala=null;P.muro=null;P.rola=null;P.acao=null;
  P.yaw=P.body=Math.atan2(A.x-P.x,A.z-P.z);
  /* o tempo do caminho: o relógio anda de segundo em segundo (noite, dia, chuva e as levas da noite acontecem no caminho) */
  const tm0=G.tm||0;let n=0;while((G.tm||0)-tm0<horas*60&&n<40000){updateClock(1);sobreviver(1,false);n++;}
  const c=A.cama;G.cama={x:c.x,y:c.y,z:c.z,vagao:true,abrigo:A.id};ativLimpa();sfx('missao');
  const h=Math.floor(horas),m=Math.round((horas-h)*60);
  toast('corpo','Você foi a pé do '+de.nome+' até o '+A.nome+' ('+(h?h+' h ':'')+(m?m+' min':'')+' de caminhada). Se cair, acorda aqui.');
  if(typeof diarioEvento==='function')diarioEvento('Viajou do '+de.nome+' para o '+A.nome,'geral');salvarJogo();}
{const _al=ativLista;ativLista=function(){const r=_al.apply(this,arguments);
  try{const el=$('mapa-ativ');if(!el)return r;if(!el.dataset.viajar){el.dataset.viajar='1';el.addEventListener('click',e=>{const b=e.target.closest('[data-viajar]');if(!b)return;const A=ABRIGOS.find(q=>q.id===b.dataset.viajar);if(A){sfx('clique');abrigoViajar(A);}});}
    const de=abrigoOnde();if(!de)return r;const outros=ABRIGOS.filter(A=>A!==de&&abrigoPronto(A)&&abrigoD(A.id).ligado);
    let h='<h3>Viajar entre abrigos <small>você está no '+ativEsc(de.nome)+'</small></h3>';
    if(!outros.length)h+='<p class="at-vazio">Acenda outro abrigo para poder viajar até ele daqui.</p>';
    for(const A of outros){const hs=abrigoViagemHoras(de,A),d=Math.hypot(A.x-de.x,A.z-de.z);
      h+='<div class="at-i"><i style="background:'+ATIV_TIPOS.abrigo.cor+'">A</i><div><b>'+ativEsc(A.nome)+'</b><small>'+(d>=1000?(d/1000).toFixed(1).replace('.',',')+' km':Math.round(d)+' m')+' · uns '+Math.round(hs*60)+' min de caminhada</small></div>'
        +'<button class="btn" type="button" data-viajar="'+A.id+'">Viajar</button></div>';}
    el.insertAdjacentHTML('afterbegin',h);}catch(e){console.error('viagem',e);}return r;};}

/* ================= rádio da clareira: comércio com os quatro grupos de troca (Etapa 6) =================
   Com o rádio da clareira funcionando (missão do transmissor), cada grupo tem a sua frequência. No rádio dá para:
   · sintonizar um grupo e ouvir as notícias dele: o que viram por aí (estrada fechada, ninho, comboio, incêndio, enchente,
     fartura, cardume, lua de sangue) e o que estão precisando. O que você ouve no rádio fica marcado no mapa;
   · ver as ofertas do dia (o que dão e o que querem) e trocar;
   · ver o que o grupo tem guardado e o que procura, e fazer um pedido: escolhe o item e a quantidade, eles dizem o preço em
     coisas que querem (encomenda custa um pouco mais que a oferta do dia) e você escolhe com o que pagar (mochila ou baús);
   · acompanhar os pedidos: combinado → a caminho → entregue na caixa de trocas, perto do rádio. Os grupos de longe (Serra e
     Mercadores da Estrada) levam duas manhãs, e estrada fechada por árvores caídas atrasa as entregas deles até alguém limpar.
   A antena da base melhora o rádio: os quatro grupos no ar todo dia (sem ela, um some do ar), duas ofertas de cada, estoque
   maior, notícias de todos os eventos, a previsão do tempo e a escuta dos eventos no mapa.
   Segure E na bancada da clareira para abrir o rádio (ou K, aba Rádio). Os itens e o equilíbrio das ofertas são os de antes. */
const RADIO_INFO={rio:{freq:'98,3',curto:'Rio Claro',longe:false},serra:{freq:'101,7',curto:'Serra',longe:true},
  sitio:{freq:'94,1',curto:'Sítio',longe:false},estrada:{freq:'106,5',curto:'Estrada',longe:true}};
const RADIO_FALAS={
  rio:['Aqui é o pessoal do Rio Claro. Munição a gente tem; comida é que anda faltando.','Rio Claro na escuta. Carne defumada vale ouro por aqui.','O rio deu peixe hoje, mas peixe não enche a barriga de todo mundo. Precisamos de feijão e milho.'],
  serra:['Comunidade da Serra falando. Precisamos de ferro e prego para a cerca.','Aqui em cima sobra sal e couro. Falta ferramenta e corda.','A serra gela à noite. Quem tiver tábua e corda, chama a gente.'],
  sitio:['Família do Sítio na escuta. A horta vai bem; remédio é que acabou.','Temos milho, batata e semente. As crianças precisam de bandagem.','Água limpa a gente tem. Se tiver pano e linha, a troca sai fácil.'],
  estrada:['Mercadores da Estrada, sempre de passagem. Tem kit e seringa para quem pagar bem.','Gasolina e munição: é disso que a estrada vive.','Paramos onde dá. Se a estrada fechar, a entrega atrasa.']};
const RADIO_LOCAIS={posto:'no posto de gasolina',vila:'na vila',fazenda:'na fazenda',torre:'na torre de rádio',trem:'no trem abandonado',estacao:'na estação ferroviária'};
const RADIO_ACRESCIMO=1.15;   // pedido sob encomenda custa 15% a mais que a oferta do dia
let radioPed=null,radioMsg='';   // pedido sendo montado na tela: {g,id,n}
function radioGrupo(id){return TERR_GRUPOS.find(q=>q.id===id)||null;}
function radioGrupoPorNome(n){const g=TERR_GRUPOS.find(q=>q.nome===n);return g?g.id:'rio';}
function radioD(){const D=terrD();if(!D.radio)D.radio={sint:'rio',dia:-1,ar:{},est:{},pedidos:[],seq:1,ouvidos:{}};const R=D.radio;if(!R.ouvidos)R.ouvidos={};
  // trocas combinadas antes do rádio novo (jogos salvos antigos) ganham número e grupo para poder acompanhar
  for(const t of D.trocasPendentes)if(!t.id)radioPendente(t,{g:radioGrupoPorNome(t.grupo),tipo:'oferta',chega:G.dia});
  return R;}
/* o dia no rádio: quem está no ar e o que cada um tem guardado (as ofertas do dia saem em terrOfertas) */
function radioDia(fora){const R=radioD(),ant=temAntenaBase();R.dia=G.dia;R.ant=ant;
  for(const g of TERR_GRUPOS){R.ar[g.id]=g.id!==fora;const e={};
    for(const id of g.da){if(!ITEMS[id])continue;const v=TERR_VAL[id]||1,base=v>=8?2:v>=4?4:9;e[id]=Math.max(1,Math.round(base*(ant?1.5:1)*(0.6+Math.random()*0.8)));}
    R.est[g.id]=e;}}
/* garante o dia de hoje (jogo carregado, rádio consertado no meio do dia) */
function radioGarante(){const D=terrD(),R=radioD();if(!terrRadioOk())return R;
  if(R.dia!==G.dia){if(!D.ofertas.length)terrOfertas();else{const com=new Set(D.ofertas.map(o=>o.g||radioGrupoPorNome(o.grupo)));const fora=TERR_GRUPOS.find(g=>!com.has(g.id));radioDia(fora?fora.id:null);}}
  if(!radioGrupo(R.sint))R.sint='rio';return R;}
/* ---------- notícias de cada grupo (o que viram por aí) ---------- */
function radioEventoTxt(e){const lugar=(x,z)=>{const Z=typeof zonaEm==='function'?zonaEm(x,z):null;return Z&&Z.nome?' perto de '+Z.nome.toLowerCase():'';};
  switch(e.tipo){
    case'estrada':return'Árvores caídas fecharam uma estrada'+lugar(e.x,e.z)+'. Carro não passa: precisa de machado. As entregas de longe atrasam até limpar.';
    case'infestacao':return'Tem um ninho de zumbis '+(RADIO_LOCAIS[e.local]||'em '+(((EVM.locais[e.local]||{}).nome)||'algum lugar').toLowerCase())+'. Eles juntam mais a cada dia.';
    case'comboio':return'Um comboio do Exército tombou na estrada da cidade. Tem caixa lá, mas os soldados viraram.';
    case'esconderijo':return'Depois do incêndio, apareceu uma caixa enterrada nas cinzas'+lugar(e.x,e.z)+'.';}
  return null;}
function radioNoticias(g,ant){const L=[],M=G.mundo,F=RADIO_FALAS[g.id]||[];
  if(F.length)L.push({t:F[(G.dia+g.id.length)%F.length],k:'fala'});
  const lim=ant?5:1;let n=0;const mais=(t,k,ev)=>{if(n<lim){L.push({t,k,ev});n++;}};
  if(M){for(const e of M.ev){if(e.fim)continue;const t=radioEventoTxt(e);if(t)mais(t,'evento',e);}
    if(M.fogo)mais('Fumaça na mata: tem incêndio. Fiquem longe do vento.','evento');
    if(M.cheia&&M.cheia.ativa)mais('O Rio Claro está subindo. Tirem o carro da beira da água.','evento');
    if(M.frutas===G.dia)mais('Os arbustos amanheceram carregados de frutas. Dia bom para colher.','evento');
    if((M.cardume||0)>G.tm)mais('Cardume subindo o rio: hoje o peixe morde rápido.','evento');}
  {const k=G.noiteN+1;if(!G.noite&&k>=3&&k%4===3)L.push({t:'Cuidado: hoje à noite tem lua de sangue. A horda vem dobrada.',k:'alerta'});}
  // boatos dos desafios da Etapa 7 (enquanto ninguém resolveu)
  if(typeof DSF!=='undefined'&&DSF.p&&!(G.dsf&&G.dsf.luz)&&(g.id==='estrada'||g.id==='rio'))L.push({t:'Dizem que o Armazém Norte, no Distrito Industrial, guardava equipamento numa sala de segurança. O quadro de força de lá está sem fusível.',k:'info'});
  if(typeof CXM_DEF!=='undefined'&&(g.id==='serra'||g.id==='sitio')&&!(G.cxm&&Object.values(G.cxm).some(c=>c.st!=='trancada')))L.push({t:'Ainda tem caixa militar trancada na base militar, na torre de rádio e na estação. Ligar o cronômetro abre, mas o alarme chama zumbi.',k:'info'});
  if(ant&&G.clima&&G.clima.dia===G.dia&&typeof climaPrevisao==='function')L.push({t:climaPrevisao(G.clima.segs),k:'tempo'});
  if(!n&&!ant)L.push({t:'Sem a antena da base, o sinal chega fraco: só dá para ouvir o principal.',k:'info'});
  return L;}
/* o que se ouve no rádio fica marcado no mapa (com a escuta da torre ou a antena, o mapa já mostra todos) */
function radioOuvir(L){const R=radioD();for(const q of L)if(q.ev)R.ouvidos[q.ev.id]=G.dia;}
MAPA_DESENHOS.push((g,X,Y)=>{const D=G.terr,M=G.mundo;if(!D||!D.radio||!M)return;if((D.t.torre&&D.t.torre.dono)||temAntenaBase())return;
  g.save();g.setLineDash([3,3]);g.strokeStyle='rgba(255,200,120,.85)';g.lineWidth=1.2;
  for(const e of M.ev){if(e.fim||D.radio.ouvidos[e.id]===undefined)continue;g.beginPath();g.arc(X(e.x),Y(e.z),8,0,6.283);g.stroke();}g.restore();});
/* ---------- pedidos: combinar, pagar, acompanhar e entregar ---------- */
function radioPendente(t,o){const R=terrD().radio||radioD();t.id=R.seq++;t.g=o.g||radioGrupoPorNome(t.grupo);t.tipo=o.tipo||'oferta';
  t.pago=o.pago?o.pago.slice():(o.quer?o.quer.slice():null);t.dia=t.dia??G.dia;t.chega=o.chega??G.dia+1;t.st='combinado';
  R.pedidos.push({id:t.id,g:t.g,grupo:t.grupo,tipo:t.tipo,da:t.da.slice(),pago:t.pago,dia:t.dia,chega:t.chega,st:t.st});
  if(R.pedidos.length>40)R.pedidos.splice(0,R.pedidos.length-40);return t;}
function radioPreco(id,n){const D=terrD();return n*(TERR_VAL[id]||1)*(D.precos[id]||1)*RADIO_ACRESCIMO;}
function radioFormas(g,id,n){const D=terrD(),v=radioPreco(id,n),G0=radioGrupo(g);if(!G0)return[];
  return G0.quer.filter(q=>ITEMS[q]&&TERR_VAL[q]).map(q=>[q,Math.max(1,Math.ceil(v/(TERR_VAL[q]*(D.precos[q]||1))))]);}
function radioPagar(q,n){let falta=n;const m=Math.min(falta,invCount(q));if(m){invRemove(q,m);falta-=m;}while(falta>0&&tirarDaBase(it=>it.id===q))falta--;hudBarra();invRender();}
function radioPedir(g,id,n,q){const D=terrD(),R=radioGarante(),G0=radioGrupo(g);
  if(!terrRadioOk())return'O rádio da clareira ainda não funciona.';if(!G0)return'Grupo desconhecido.';
  if(!grupoD().papeis.lider.trocar)return'Seu papel no grupo não deixa fazer trocas.';
  if(!R.ar[g])return G0.nome+' está fora do ar hoje.';
  n=Math.floor(n);const est=R.est[g]||{};if(!(n>=1)||(est[id]||0)<n)return'Eles não têm tudo isso guardado.';
  const f=radioFormas(g,id,n).find(x=>x[0]===q);if(!f)return'Eles não aceitam isso como pagamento.';
  if(terrTem(q)<f[1])return'Falta: '+f[1]+' '+ITEMS[q].nome.toLowerCase()+' (você tem '+terrTem(q)+').';
  radioPagar(q,f[1]);est[id]-=n;
  const t={grupo:G0.nome,da:[id,n]};radioPendente(t,{g,tipo:'pedido',pago:[q,f[1]],chega:G.dia+(RADIO_INFO[g].longe?2:1)});D.trocasPendentes.push(t);
  terrRegistro('Pedido ao '+G0.nome+': '+n+' '+ITEMS[id].nome.toLowerCase()+' por '+f[1]+' '+ITEMS[q].nome.toLowerCase(),'troca');sfx('missao');
  toast('radio',G0.nome+': pedido anotado! Chega '+(t.chega-G.dia>1?'em duas manhãs':'amanhã cedo')+' na caixa de trocas da clareira.');
  return'';}
function radioBloqueio(){const M=G.mundo;return!!(M&&M.ev.some(e=>e.tipo==='estrada'&&!e.fim));}
/* de manhã: chega o que está na hora (estrada fechada atrasa os grupos de longe); o que não cabe na caixa fica no chão ao lado */
function radioEntregas(D){const R=radioD(),bloq=radioBloqueio(),chegou=[],atrasou=[];
  if(!D.caixaTrocas)D.caixaTrocas=new Array(BAU_N).fill(null);
  for(const t of D.trocasPendentes){if((t.chega??0)>G.dia){t.st='a caminho';continue;}
    if(bloq&&RADIO_INFO[t.g]&&RADIO_INFO[t.g].longe){t.st='atrasado';t.chega=G.dia+1;atrasou.push(t);continue;}
    const sobra=ITEMS[t.da[0]]?depAddL(D.caixaTrocas,t.da[0],t.da[1]):0;if(sobra>0)soltarItens([[t.da[0],sobra]],CAIXA_TROCAS.x+0.9,CAIXA_TROCAS.z+0.6);
    t.st='entregue';t.entregue=G.dia;chegou.push(t);terrRegistro('Troca recebida de '+t.grupo+': '+t.da[1]+' '+ITEMS[t.da[0]].nome.toLowerCase(),'troca');}
  D.trocasPendentes=D.trocasPendentes.filter(t=>t.st!=='entregue');
  for(const t of D.trocasPendentes.concat(chegou)){const h=R.pedidos.find(p=>p.id===t.id);if(h){h.st=t.st;h.chega=t.chega;if(t.entregue)h.entregue=t.entregue;}}
  if(chegou.length)toast('radio','As trocas chegaram: estão na caixa de trocas, perto do rádio da clareira.');
  if(atrasou.length){const gs=[...new Set(atrasou.map(t=>t.grupo))];setTimeout(()=>toast('radio',listaE(gs)+': a estrada está fechada por árvores caídas. A entrega atrasa até alguém limpar o caminho.'),2400);
    terrRegistro('Entrega atrasada pela estrada fechada: '+gs.join(', '),'troca');}}
function radioStatus(p){const falta=(p.chega??G.dia)-G.dia,quando=falta<=1?'chega amanhã cedo':'chega em '+falta+' manhãs';
  if(p.st==='entregue')return'entregue na caixa de trocas'+(p.entregue?' (dia '+p.entregue+')':'');
  if(p.st==='atrasado')return'atrasado: a estrada está fechada por árvores caídas · '+quando+' se liberarem';
  if(p.st==='a caminho')return'a caminho · '+quando;
  return'combinado'+(p.dia===G.dia?' hoje':'')+' · '+quando;}
/* ---------- tela (aba Rádio dos territórios) ---------- */
function abrirRadio(){terrAba='troca';radioMsg='';abrirTerritorios();}
const rdLi=(cls,ico,t,s,extra)=>'<li class="'+cls+'">'+svgUse(ico)+'<span><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span>'+(extra||'')+'</li>';
const rdNome=id=>ITEMS[id]?ITEMS[id].nome.toLowerCase():id;
function radioRender(){const D=terrD();
  if(!terrRadioOk())return{res:'O rádio da clareira ainda não funciona',h:rdLi('','i-radio','Sem rádio','Conserte o rádio da clareira (missão do transmissor) para falar com os outros grupos.')};
  const R=radioGarante(),ant=temAntenaBase(),g=radioGrupo(R.sint),I=RADIO_INFO[g.id],noAr=!!R.ar[g.id];let h='';
  // sintonia
  h+='<li class="rd-sint" role="group" aria-label="Sintonizar um grupo">';
  for(const q of TERR_GRUPOS){const ar=!!R.ar[q.id],on=q.id===g.id;h+='<button type="button" class="rd-g'+(ar?'':' fora')+'" data-sint="'+q.id+'" aria-pressed="'+on+'"><b>'+RADIO_INFO[q.id].curto+'</b><small>'+RADIO_INFO[q.id].freq+' MHz · '+(ar?(ant||!RADIO_INFO[q.id].longe?'sinal forte':'sinal fraco'):'fora do ar')+'</small></button>';}
  h+='</li>';
  h+=rdLi('rd-ant'+(ant?' ok':''),'i-antena',ant?'Antena da base ligada':'Sem antena na base',ant?'Os quatro grupos no ar todo dia, duas ofertas de cada, mais estoque, todas as notícias e a previsão do tempo.':'Um grupo some do ar a cada dia, cada um faz uma oferta e as notícias chegam pela metade. A planta da antena aparece no mundo.');
  if(radioMsg)h+='<li class="rd-msg" aria-live="polite">'+radioMsg+'</li>';
  if(!noAr)h+=rdLi('','i-radio',g.nome+': só chiado','Fora do ar hoje. Tente amanhã'+(ant?'.':' (com a antena da base, os quatro ficam no ar todo dia).'));
  else{const N=radioNoticias(g,ant);radioOuvir(N);
    h+='<li class="rd-not">'+svgUse('i-radio')+'<span><b>'+g.nome+' · '+I.freq+' MHz</b>'+N.map(q=>'<small class="rd-'+q.k+'">'+q.t+'</small>').join('')+'</span></li>';
    // ofertas do dia
    const OF=D.ofertas.filter(o=>(o.g||radioGrupoPorNome(o.grupo))===g.id);
    h+='<li class="rd-tit">Ofertas de hoje</li>';
    if(!OF.length)h+='<li class="vazio">Nenhuma oferta deste grupo hoje.</li>';
    for(const o of OF){const[q,n]=o.quer,[dd,nd]=o.da,tem=terrTem(q);h+='<li class="'+(o.aceita?'ok':'')+'">'+svgUse('i-troca')+'<span><b>Dão '+nd+' '+rdNome(dd)+'</b><small>querem '+n+' '+rdNome(q)+' (você tem '+tem+')</small></span>'+
      (o.aceita?'<em class="tr-ok">combinado</em>':'<button type="button" class="btn'+(tem>=n?' prim':'')+'" data-oferta="'+o.id+'"'+(tem>=n?'':' disabled')+'>Trocar</button>')+'</li>';}
    // o que eles têm: pedido sob encomenda
    h+='<li class="rd-tit">O que eles têm guardado</li>';const E=R.est[g.id]||{};let algum=false;
    for(const id in E){if(!ITEMS[id])continue;const n=E[id];algum=true;const ed=radioPed&&radioPed.g===g.id&&radioPed.id===id;
      h+='<li>'+svgUse(ITEMS[id].icon||'i-troca')+'<span><b>'+rdNome(id)+'</b><small>'+(n>0?n+' guardado'+(n>1?'s':''):'acabou por hoje')+'</small></span>'+(n>0&&!ed?'<button type="button" class="btn" data-pedir="'+id+'">Pedir</button>':'')+'</li>';
      if(ed){const q=Math.min(radioPed.n,n),F=radioFormas(g.id,id,q);
        h+='<li class="rd-ped"><span class="rd-qtd"><b>Quantos?</b><button type="button" class="btn" data-qtd="-1" aria-label="Menos"'+(q<=1?' disabled':'')+'>−</button><output>'+q+'</output><button type="button" class="btn" data-qtd="1" aria-label="Mais"'+(q>=n?' disabled':'')+'>+</button></span>'+
          '<span class="rd-pagar"><b>Pagar com</b>'+F.map(([pq,pn])=>{const tem=terrTem(pq);return'<button type="button" class="btn'+(tem>=pn?' prim':'')+'" data-pagar="'+pq+'"'+(tem>=pn?'':' disabled')+'>'+pn+' '+rdNome(pq)+'<small>você tem '+tem+'</small></button>';}).join('')+'</span>'+
          '<span class="rd-rod"><small>Chega '+(I.longe?'em duas manhãs':'amanhã cedo')+' na caixa de trocas. Encomenda custa um pouco mais que a oferta do dia.</small><button type="button" class="btn" data-cancelar="1">Cancelar</button></span></li>';}}
    if(!algum)h+='<li class="vazio">Nada guardado hoje.</li>';
    // o que eles procuram
    h+='<li class="rd-tit">O que eles procuram</li>';
    h+=rdLi('','i-mochila','Aceitam como pagamento',g.quer.filter(q=>ITEMS[q]).map(q=>rdNome(q)+' (você tem '+terrTem(q)+')').join(' · '));}
  // pedidos
  h+='<li class="rd-tit">Seus pedidos e trocas</li>';
  const pend=D.trocasPendentes.slice().sort((a,b)=>(b.id||0)-(a.id||0)),feitos=R.pedidos.filter(p=>p.st==='entregue').slice(-5).reverse();
  if(!pend.length&&!feitos.length)h+='<li class="vazio">Nenhum pedido ainda. Troque uma oferta ou peça algo do que os grupos têm guardado.</li>';
  for(const p of pend)h+=rdLi(p.st==='atrasado'?'rd-atraso':'','i-relogio','#'+(p.id||'?')+' · '+p.da[1]+' '+rdNome(p.da[0])+' · '+p.grupo,(p.tipo==='pedido'?'encomenda':'oferta do dia')+(p.pago?' · pagou '+p.pago[1]+' '+rdNome(p.pago[0]):'')+' · '+radioStatus(p));
  for(const p of feitos)h+=rdLi('ok','i-troca','#'+p.id+' · '+p.da[1]+' '+rdNome(p.da[0])+' · '+p.grupo,radioStatus(p));
  const nPend=pend.length;
  return{res:(noAr?'Sintonizado: ':'Fora do ar: ')+g.nome+' ('+I.freq+' MHz)'+(nPend?' · '+nPend+(nPend>1?' pedidos':' pedido')+' a caminho':''),h};}
{const l=document.getElementById('tr-lista');if(l)l.addEventListener('click',e=>{const b=e.target.closest('[data-sint],[data-pedir],[data-qtd],[data-pagar],[data-cancelar]');if(!b||b.disabled)return;const R=radioD();
  if(b.dataset.sint){R.sint=b.dataset.sint;radioPed=null;radioMsg='';sfx('clique');}
  else if(b.dataset.pedir){radioPed={g:R.sint,id:b.dataset.pedir,n:1};radioMsg='';sfx('clique');}
  else if(b.dataset.qtd&&radioPed){const n=(R.est[radioPed.g]||{})[radioPed.id]||1;radioPed.n=clamp(radioPed.n+(+b.dataset.qtd),1,Math.max(1,n));sfx('clique');}
  else if(b.dataset.pagar&&radioPed){const r=radioPedir(radioPed.g,radioPed.id,radioPed.n,b.dataset.pagar);radioMsg=r||'Pedido feito: '+radioPed.n+' '+rdNome(radioPed.id)+'. Acompanhe em "Seus pedidos e trocas".';if(!r)radioPed=null;}
  else if(b.dataset.cancelar){radioPed=null;radioMsg='';sfx('clique');}
  terrRender();});}

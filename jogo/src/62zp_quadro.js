/* ================= Quadro de energia da base (v10.3.0, 18/11/2026) =================
   Himalaia: "coloque um módulo ou disjuntor para ligar tudo a ele para controlar a energia da base" (e "pode decidir você");
   depois da 1ª captura: "melhora o quadro de energia e o painel de energia".
   O QUADRO DE ENERGIA é o centro da rede:
   · em cima, 4 ENTRADAS (prensa-cabos verdes): fontes (roda d'água, cata-vento, placa solar, gerador) e baterias. Ele junta tudo
     sozinho. O fio sobe da tomada, passa por cima da caixa e desce por trás do poste;
   · embaixo, 6 SAÍDAS (prensa-cabos amarelos) = 6 CIRCUITOS com disjuntor (de fábrica: Luzes, Portões, Defesas, Cozinha, Água e
     Oficina; o nome que aparece é o das peças ligadas nele). Cada circuito tem a sua chave (liga e desliga), o horário (sempre, só
     à noite ou só com a bateria acima de 30%) e a prioridade;
   · DISJUNTOR GERAL: corta todos os circuitos de uma vez (sair da base, poupar a bateria, mexer na fiação);
   · PRIORIDADE: quando a energia não dá para tudo, o quadro corta primeiro os circuitos de prioridade baixa (de fábrica: cozinha,
     água e oficina), depois os de média (luzes e portões), e as defesas por último. Volta sozinho quando sobra energia;
   · DISJUNTOR: um circuito que puxa mais de 2000 W desarma. É só ir ao quadro e religar (e dividir a carga em dois circuitos);
   · GERADOR AUTOMÁTICO: com ele ligado no quadro, o gerador a gasolina liga sozinho quando as baterias da rede caem abaixo de 20%
     e desliga quando passam de 90%: só gasta gasolina quando precisa;
   · para carregar as baterias: a saída delas numa entrada do quadro e um circuito do quadro na entrada delas (ele carrega com o
     que sobra).
   No mundo: caixa de metal pintada num poste com telhadinho de zinco. Pela janela da tampa aparecem o disjuntor geral e os 6
   disjuntores (a alavanca sobe ligado, desce desligado e fica no meio, vermelha, quando desarma), com um LED em cima de cada um
   (verde ligado, amarelo fora do horário, laranja cortado por falta de energia, vermelho desarmado); o medidor de ponteiro mostra
   o que a rede gasta (até 2,5 kW, faixa vermelha depois de 2 kW) e o visor, a bateria (5 tracinhos). As 4 luzinhas de cima são
   as entradas que estão mandando energia.
   No painel: os números da rede, as entradas, o gráfico das últimas 24 h e cada circuito com chave, horário e prioridade.
   O quadro gasta como o resto e, se os zumbis quebrarem, a base apaga: vale deixar dentro, protegido. */
const QD={LIMITE:2000,ESCALA:2500,nomes:['Luzes','Portões','Defesas','Cozinha','Água','Oficina'],prio:[2,2,1,3,3,3],avisoT:{},din:null};
/* posições no espaço da peça (x para o lado, y altura, z para a frente): disjuntores, LEDs, tomadas, medidor e visor */
const QDG={cx:[-0.155,-0.065,0.025,0.115,0.205,0.295],gx:-0.27,ly:1.41,ledY:1.545,entX:[-0.27,-0.09,0.09,0.27],saiX:[-0.3,-0.18,-0.06,0.06,0.18,0.3],med:[-0.205,1.705],lcd:[0.165,1.705]};
OBRAS.quadroEnergia={nome:'Quadro de energia',icon:'i-quadro',custo:{sucata:10,chapaFerro:3,fio:8,pregos:4},hp:340,hw:0.5,hd:0.3,solid:true,hCol:2.1,etapa:3,desb:'oficina',
  desc:'O centro da energia da base: até 4 fontes ou baterias nas entradas de cima e 6 circuitos com disjuntor nas saídas de baixo. No painel: disjuntor geral, cada circuito (chave, horário e prioridade), gerador automático e o gráfico do dia.'};
ELET.quadroEnergia={p:'logica',ent:4,sai:6,quadro:true};
E17_OBRAS.push('quadroEnergia');OBRA_ORDEM.push('quadroEnergia');if(!OBRAS_CHAO.includes('quadroEnergia'))OBRAS_CHAO.push('quadroEnergia');
if(typeof OBRAS_PREDIO!=='undefined'&&!OBRAS_PREDIO.includes('quadroEnergia'))OBRAS_PREDIO.push('quadroEnergia');
{const c=OBRA_CATS.find(q=>q.id==='energia');if(c&&!c.t.includes('quadroEnergia'))c.t.unshift('quadroEnergia');}
iconesNovos({'i-quadro':'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M7 7h10M7 11h2M11 11h2M15 11h2"/><path d="M7.5 14.5v3M11.5 14.5v3M15.5 14.5v3"/>'});
BASE_DICAS.quadroEnergia='Quadro de energia: com o alicate, ligue as fontes e baterias nas entradas de cima (verdes) e cada circuito (saídas de baixo, amarelas) no que ele vai alimentar. Toque E para o painel.';
ELET_CURTO.quadroEnergia='Quadro';ELET_ALT.quadroEnergia=1.2;
/* tomadas: as entradas na tampa de cima (o fio sobe, passa por cima da caixa e desce por trás do poste); as saídas embaixo (desce reto).
   A peça é posta com a frente virada para quem constrói: o desenho é feito com a frente em +z e girado meia volta (x e z trocam de sinal) */
if(typeof PINO_TIPO!=='undefined')PINO_TIPO.quadroEnergia={e:QDG.entX.map(x=>[-x,1.9,0]),s:QDG.saiX.map(x=>[-x,0.865,0]),ev:QDG.entX.map(x=>[[-x,1.95,0],[-x,1.95,0.42]])};
/* bateria e quadro podem ter fio nos dois sentidos: a saída da bateria numa entrada do quadro (ela alimenta a base) e um circuito
   do quadro na entrada dela (ele carrega com a sobra). Entre as outras peças continua proibido */
{const _pl=podeLigar;podeLigar=function(a,b){const m=_pl.apply(this,arguments);if(m==='Já tem um fio no sentido contrário'&&a&&b&&((a.tipo==='quadroEnergia'&&b.tipo==='bateriaBase')||(a.tipo==='bateriaBase'&&b.tipo==='quadroEnergia'))){
    const db=ELET[b.tipo],da=ELET[a.tipo];if(fiosSaida(a)>=da.sai)return OBRAS[a.tipo].nome+': as '+da.sai+' saídas já estão ocupadas';if(fiosEntrada(b)>=db.ent)return OBRAS[b.tipo].nome+': a entrada já está ocupada';
    if(Math.hypot(a.x-b.x,a.z-b.z)>FIO_MAX)return'Longe demais: o fio vai até '+FIO_MAX+' m';return'';}return m;};}
/* estado de cada circuito (fica salvo com a peça) */
function qdCirc(q,k){const e=q.ext||(q.ext={});if(!Array.isArray(e.circ))e.circ=[];const c=e.circ[k]||(e.circ[k]={});if(c.on===undefined)c.on=true;if(!c.modo)c.modo='sempre';if(!c.prio)c.prio=QD.prio[k];return c;}
function qdRede(q){return ENER.redes.find(r=>r.L.includes(q))||null;}
function qdBat(q){const r=qdRede(q);return r&&r.cap>0?r.carga/r.cap:null;}
function qdHorario(q,c){if(c.modo==='noite')return(E.n||0)>0.3;if(c.modo==='bat'){const b=qdBat(q);return b===null||b>=0.3;}return true;}
function quadroPassa(q,k){if(q.hp<=0||(q.ext&&q.ext.geral===false))return false;const c=qdCirc(q,k);return c.on&&!c.des&&!(q.cortados&&q.cortados.has(k))&&qdHorario(q,c);}
/* o que cada circuito alimenta (só por ele: atravessa interruptor, sensor, divisor...) e quanto pede agora */
function qdCircuitos(q){const id=q.ext&&q.ext.eid,out=[];if(!id)return out;const saidas=new Map();for(const f of ENER.fios){if(!saidas.has(f.a))saidas.set(f.a,[]);saidas.get(f.a).push(f.b);}
  const S=saidas.get(id)||[];
  for(let k=0;k<6;k++){const r={k,ids:[],D:0,pecas:[]};if(k<S.length){const vis=new Set([id]),fila=[S[k]];
      while(fila.length){const b=fila.shift();if(vis.has(b))continue;vis.add(b);const o=eletPorEid(b);if(!o)continue;const d=ELET[o.tipo];
        if(d.p==='consumo'){r.pecas.push(o);r.D+=querW(o);}else if(d.p==='bateria'){r.pecas.push(o);}
        else if(d.p==='logica'&&!d.quadro&&logicaLigada(o))for(const x of saidas.get(b)||[])fila.push(x);}}
    r.ligado=k<S.length;out.push(r);}return out;}
function qdNome(q,k,r){const L=(r||qdCircuitos(q)[k]).pecas;if(!L.length)return QD.nomes[k];const cont={};for(const o of L){const n=ELET_CURTO[o.tipo]||eletNome(o);cont[n]=(cont[n]||0)+1;}
  return Object.entries(cont).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([n,c])=>c>1?n+' ×'+c:n).join(', ');}
/* o que está em cada entrada (na ordem das tomadas) */
function qdEntradas(q){const id=q.ext&&q.ext.eid,L=[];if(!id)return L;for(const f of ENER.fios)if(f.b===id)L.push(eletPorEid(f.a));return L;}
/* falta energia: o quadro corta circuito por circuito (prioridade baixa primeiro, o que pede mais primeiro) até caber */
{const _er=energiaResolver;energiaResolver=function(dtMin){const Qs=OB.filter(o=>o.tipo==='quadroEnergia'&&o.hp>0&&o.ext&&o.ext.eid);if(!Qs.length)return _er.apply(this,arguments);
  const antes=new Map(Qs.map(q=>[q,q.cortados?[...q.cortados].join():'']));for(const q of Qs)q.cortados=new Set();
  for(let it=0;it<7;it++){_er(0);let mudou=false;
    for(const q of Qs){const R=qdRede(q);if(!R||!R.falta)continue;const C=qdCircuitos(q).filter(r=>r.ligado&&r.D>0&&quadroPassa(q,r.k));if(!C.length)continue;
      C.sort((a,b)=>qdCirc(q,b.k).prio-qdCirc(q,a.k).prio||b.D-a.D);q.cortados.add(C[0].k);mudou=true;}
    if(!mudou)break;}
  const r=_er(dtMin);
  for(const q of Qs){const k=[...q.cortados].join();if(k!==antes.get(q)&&k&&d2(q.x,q.z,P.x,P.z)<60*60)feed('Faltou energia: o quadro desligou '+[...q.cortados].map(i=>'o circuito '+(i+1)).join(' e ')+' (prioridade baixa primeiro)',true);}
  return r;};}
/* o gráfico do dia: uma marca a cada 10 minutos de jogo (gerando, gastando e a bateria), as últimas 24 h ficam salvas com o quadro */
function qdAmostra(q){const e=q.ext,t=Math.floor((G.tm||0)/10);if(e.hT===t)return;e.hT=t;const R=qdRede(q),b=qdBat(q);
  const H=Array.isArray(e.hist)?e.hist:(e.hist=[]);H.push([t,R?Math.round(R.Pg):0,R?Math.round(R.D):0,b===null?-1:Math.round(b*100)]);while(H.length>145||(H.length&&H[0][0]<t-144))H.shift();}
/* disjuntor: circuito com mais de 2000 W desarma; gerador automático pela carga das baterias */
let qdT=0;
PASSOS.push(function quadroPasso(dt){qdT-=dt;if(qdT>0)return;qdT=0.5;let mexeu=false;
  for(const q of OB){if(q.tipo!=='quadroEnergia'||q.hp<=0||!q.ext||!q.ext.eid)continue;
    for(const r of qdCircuitos(q)){if(!r.ligado||!quadroPassa(q,r.k)||r.D<=QD.LIMITE)continue;const c=qdCirc(q,r.k);c.des=true;mexeu=true;
      if(d2(q.x,q.z,P.x,P.z)<70*70){feed('Disjuntor do circuito '+(r.k+1)+' desarmou: '+wTxt(r.D)+' (o limite é '+wTxt(QD.LIMITE)+'). Religue no quadro e divida a carga.',true);sfx('clique',q.x,q.z,1);
        const lx=QDG.cx[r.k],lz=0.14,c0=Math.cos((q.yaw||0)+Math.PI),s0=Math.sin((q.yaw||0)+Math.PI),wx=q.x+lx*c0+lz*s0,wz=q.z-lx*s0+lz*c0;
        for(let i=0;i<12;i++)part(wx,(q.y||0)+QDG.ly,wz,(Math.random()-0.5)*1.6,0.8+Math.random()*1.4,(Math.random()-0.5)*1.6,0.35,0.05,[1,0.85,0.4,1],true,9.8);}}
    if(q.ext.genAuto){const R=qdRede(q),b=R&&R.cap>0?R.carga/R.cap:null;if(b!==null)for(const g of R.L){if(g.tipo!=='gerador')continue;const e=g.ext||(g.ext={});
        if(b<0.2&&e.ligado===false&&(e.comb||0)>0){e.ligado=true;mexeu=true;}else if(b>0.9&&e.ligado!==false){e.ligado=false;mexeu=true;}}}
    qdAmostra(q);}
  if(mexeu){energiaResolver(0);energiaEfeitos(0);}});
/* ---------- painel do quadro ---------- */
{const c=$('es-corpo');if(c)c.addEventListener('click',e=>{const b=e.target.closest('[data-ea]');if(b&&!b.disabled){e.stopPropagation();estAcao(b.dataset.ea);}});}
/* o painel do quadro é mais largo (duas colunas) */
{const _er=estRender;estRender=function(){const r=_er.apply(this,arguments);const c=document.querySelector('#t-estacao .est-cartao');if(c)c.classList.toggle('qd-larga',!!(estAberta&&estAberta.tipo==='quadroEnergia'&&ENER.painel===estAberta));return r;};}
function qdEntradaHTML(q,a,i){
  if(!a)return'<div class="qd2-f vazia"><i>'+(i+1)+'</i><span><b>Entrada '+(i+1)+' livre</b><small>ligue aqui uma fonte ou uma bateria</small></span></div>';
  const d=ELET[a.tipo],e=a.ext||{},D=OBRAS[a.tipo];let w='—',s='',f=null,c='';
  if(d.p==='fonte'){const p=fontePot(a);
    if(d.renov){w=wTxt(p);f=p/d.prod;c=p>0?'':'off';s=e.ligado===false?'desligada no painel dela':'de '+wTxt(d.prod)+' · '+renovMotivo(a)+' · conservação '+Math.round(renovConserva(a)*100)+'%';}
    else{const tq=clamp(e.comb||0,0,1);f=tq;w=a.rodando?'ligado':'parado';c=a.rodando?'':'off';s=(e.ligado===false?'desligado':tq<=0?'sem gasolina':a.rodando?'trabalhando':'pronto, esperando')+' · tanque '+Math.round(tq*100)+'%'+(q.ext.genAuto?' · automático':'');}}
  else if(d.p==='bateria'){const b=(e.carga||0)/d.cap,R=qdRede(q),fl=R?(R.Pg||0)-(R.D||0):0;f=b;w=Math.round(b*100)+'%';c='bat';s=whTxt(e.carga||0)+' de '+whTxt(d.cap)+(fl<0&&b>0.001&&R.D>0?' · descarregando':a.energ&&fl>0&&b<0.995?' · carregando com a sobra':b>=0.995?' · cheia':'');}
  else{w=a.energ?'ok':'—';c=a.energ?'':'off';s=eletEstado(a);}
  return'<div class="qd2-f '+c+'">'+svgUse(D.icon)+'<span><b>'+eletNome(a)+'</b><small>'+s+'</small></span><em>'+w+'</em>'+(f!==null?barraHTML(f):'')+'</div>';}
function qdGrafico(q){const H0=Array.isArray(q.ext.hist)?q.ext.hist:[],t1=Math.floor((G.tm||0)/10),t0=t1-144,H=H0.filter(h=>h[0]>=t0&&h[0]<=t1);
  if(H.length<3)return'<div class="qd2-graf vazio">O gráfico das últimas 24 h vai se formando com o tempo: uma marca a cada 10 minutos de jogo (gerando, gastando e a bateria).</div>';
  let mx=200;for(const h of H)mx=Math.max(mx,h[1],h[2]);mx=Math.ceil(mx/100)*100;
  const X=t=>((t-t0)/144*300).toFixed(1),Y=w=>(90-w/mx*84).toFixed(1),Yb=p=>(90-p/100*84).toFixed(1),hr=t=>(((G.hora||0)-(t1-t)/6)%24+24)%24,ns='vector-effect="non-scaling-stroke"';
  let noite='',ini=null;for(let t=Math.max(t0,H[0][0]);t<=t1;t++){const n=hr(t)<6||hr(t)>=19;if(n&&ini===null)ini=t;if(ini!==null&&(!n||t===t1)){noite+='<rect x="'+X(ini)+'" y="0" width="'+(X(t)-X(ini)).toFixed(1)+'" height="90" fill="rgba(98,184,255,.08)"/>';ini=null;}}
  const B=H.filter(h=>h[3]>=0),area='M'+X(H[0][0])+',90 L'+H.map(h=>X(h[0])+','+Y(h[1])).join(' L')+' L'+X(H[H.length-1][0])+',90 Z';
  const svg='<svg viewBox="0 0 300 90" preserveAspectRatio="none" role="img" aria-label="Energia nas últimas 24 horas">'+noite+
    '<line x1="0" y1="6" x2="300" y2="6" stroke="rgba(236,228,210,.1)" '+ns+'/><line x1="0" y1="48" x2="300" y2="48" stroke="rgba(236,228,210,.07)" '+ns+'/><line x1="0" y1="90" x2="300" y2="90" stroke="rgba(236,228,210,.2)" '+ns+'/>'+
    '<path d="'+area+'" fill="rgba(232,171,67,.16)" stroke="#e8ab43" stroke-width="1.6" '+ns+'/>'+
    '<polyline points="'+H.map(h=>X(h[0])+','+Y(h[2])).join(' ')+'" fill="none" stroke="#ece4d2" stroke-width="1.6" '+ns+'/>'+
    (B.length>1?'<polyline points="'+B.map(h=>X(h[0])+','+Yb(h[3])).join(' ')+'" fill="none" stroke="#97c76e" stroke-width="2" '+ns+'/>':'')+'</svg>';
  return'<div class="qd2-graf"><div class="en-h"><span>Últimas 24 h</span><span>até '+wTxt(mx)+'</span></div>'+svg+'<div class="eixo"><span>−24 h</span><span class="qd2-leg"><span><i style="background:#e8ab43"></i>gerando</span><span><i style="background:#ece4d2"></i>gastando</span>'+
    (B.length>1?'<span><i style="background:#97c76e"></i>bateria</span>':'')+'<span><i style="background:rgba(98,184,255,.45)"></i>noite</span></span><span>agora</span></div></div>';}
function qdCircHTML(q,c0){const k=c0.k,c=qdCirc(q,k),geral=q.ext.geral!==false,cort=q.cortados&&q.cortados.has(k),fora=!qdHorario(q,c);
  const est=!c0.ligado?'sem':c.des?'des':!c.on||!geral?'off':cort?'cort':fora?'fora':'on';
  const st={sem:'sem fio: ligue a saída '+(k+1)+' (embaixo do quadro) no que este circuito vai alimentar',des:'desarmou: passou de '+wTxt(QD.LIMITE)+' · divida a carga e religue',off:!c.on?'desligado na chave':'desligado no geral',
    cort:'cortado: faltou energia (volta sozinho quando sobrar)',fora:c.modo==='noite'?'esperando a noite':'esperando a bateria passar de 30%',on:'ligado'}[est];
  const alav=c.des?'<button type="button" class="qd2-rel" data-ea="qc_rel_'+k+'" aria-label="Religar o disjuntor do circuito '+(k+1)+'">Re-<br>ligar</button>'
    :'<button type="button" class="qd2-alav '+(c.on?'on':'off')+'" data-ea="qc_on_'+k+'" aria-label="'+(c.on?'Desligar':'Ligar')+' o circuito '+(k+1)+'"'+(c0.ligado?'':' disabled')+'><i></i></button>';
  const fr=c0.ligado?clamp(c0.D/QD.LIMITE,0,1):0,seg=(t,ops,at)=>'<span class="qd2-seg" role="group">'+ops.map(([v,n])=>'<button type="button"'+(v===at?' class="sel" aria-pressed="true"':'')+' data-ea="qc_'+t+'_'+k+'_'+v+'">'+n+'</button>').join('')+'</span>';
  return'<div class="qd2-c '+est+'">'+alav+'<span class="qd2-n"><i class="qd2-led '+(est==='off'||est==='sem'?'':est)+'"></i><b>'+(k+1)+' · '+(c0.ligado?qdNome(q,k,c0):QD.nomes[k])+'</b></span>'+
    '<span class="qd2-w">'+(c0.ligado?'<b>'+wTxt(c0.D)+'</b><span class="es-barra'+(fr>0.8?' alto':'')+'"><i style="width:'+Math.round(fr*100)+'%"></i></span>':'')+'</span>'+
    '<span class="qd2-s"><span class="qd2-st">'+st+'</span>'+(c0.ligado?seg('modo',[['sempre','Sempre'],['noite','Noite'],['bat','Bateria']],c.modo)+seg('prio',[[1,'Alta'],[2,'Média'],[3,'Baixa']],c.prio):'')+'</span></div>';}
{const U=ESTACAO_UI.energia,_r=U.render,_a=U.acao;
  U.render=function(o){const r=_r.apply(this,arguments);if(o.tipo!=='quadroEnergia'||!r)return r;const e=o.ext||(o.ext={}),R=qdRede(o),C=qdCircuitos(o),geral=e.geral!==false,ent=qdEntradas(o);
    const tg='<div class="en-k"><small>Disjuntor geral</small><div class="qd2-geral'+(geral?'':' off')+'"><button type="button" class="qd2-alav geral '+(geral?'on':'off')+'" data-ea="q_geral" aria-label="'+(geral?'Desligar':'Ligar')+' o disjuntor geral"><i></i></button><b>'+(geral?'Ligado':'Desligado')+'</b><span>'+(geral?'desça para cortar tudo de uma vez':'todos os circuitos sem energia')+'</span></div></div>';
    let h='<div class="qd2">'+(R?enerKpi(R,tg):'<div class="en-kpi"><div class="en-k" style="grid-column:span 3"><small>Rede</small><b>—</b><span>Sem fio ainda: com o alicate na mão, ligue as fontes e baterias nas entradas de cima (verdes) e cada circuito numa saída de baixo (amarela).</span></div>'+tg+'</div>');
    h+='<div class="qd2-col"><div class="qd2-cs" style="gap:10px"><div><div class="en-h"><span>Entradas</span><span>'+ent.length+' de 4</span></div><div class="qd2-ent">';
    for(let i=0;i<4;i++)h+=qdEntradaHTML(o,ent[i]||null,i);
    h+='</div></div>'+qdGrafico(o)+'</div>';
    const nl=C.filter(c=>c.ligado).length,on=C.filter(c=>c.ligado&&quadroPassa(o,c.k)).length;
    h+='<div><div class="en-h"><span>Circuitos</span><span>'+(nl?on+' de '+nl+' com energia':'nenhum ligado')+'</span></div><div class="qd2-cs">';for(const c0 of C)h+=qdCircHTML(o,c0);h+='</div></div></div>';
    h+='</div>';
    r.corpo=h;r.sub='';   // o resumo de cima já diz tudor.acoes=(r.acoes||[]).filter(a=>a.id!=='auto');
    r.acoes.unshift({id:'q_gen',t:'Gerador automático: '+(e.genAuto?'ligado':'desligado'),s:e.genAuto?'liga com a bateria abaixo de 20% e desliga em 90%':'o gerador fica como você deixar',ok:true,prim:!e.genAuto&&!!R&&R.L.some(g=>g.tipo==='gerador')});
    return r;};
  U.acao=function(o,id){if(o.tipo==='quadroEnergia'){const e=o.ext||(o.ext={}),m=/^qc_(on|modo|prio|rel)_(\d)(?:_(\w+))?$/.exec(id);
      if(m){const k=+m[2],c=qdCirc(o,k),v=m[3];
        if(m[1]==='on')c.on=!c.on;else if(m[1]==='modo')c.modo=['sempre','noite','bat'].includes(v)?v:{sempre:'noite',noite:'bat',bat:'sempre'}[c.modo];
        else if(m[1]==='prio')c.prio=/^[123]$/.test(v||'')?+v:(c.prio>=3?1:c.prio+1);else c.des=false;
        energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.8);return m[1]==='rel'?'Circuito '+(k+1)+' religado.':'';}
      if(id==='q_geral'){e.geral=e.geral===false;energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,1);return e.geral?'Disjuntor geral ligado.':'Disjuntor geral desligado: todos os circuitos sem energia.';}
      if(id==='q_gen'){e.genAuto=!e.genAuto;sfx('clique');return e.genAuto?'Gerador automático ligado.':'Gerador automático desligado.';}}
    return _a.apply(this,arguments);};}
{const _ee=eletEstado;eletEstado=function(o){if(o.tipo!=='quadroEnergia')return _ee.apply(this,arguments);if(o.ext&&o.ext.geral===false)return'disjuntor geral desligado'+(energiaFiado(o)?'':' · sem fio');
  const C=qdCircuitos(o),lig=C.filter(c=>c.ligado&&quadroPassa(o,c.k)).length,des=C.filter(c=>c.ligado&&qdCirc(o,c.k).des).length,R=qdRede(o);
  return lig+' de 6 circuitos ligados'+(des?' · '+des+' desarmado'+(des>1?'s':''):'')+(R?' · gastando '+wTxt(R.D):'')+(energiaFiado(o)?'':' · sem fio');};}
/* ---------- desenho ----------
   parado (com textura): poste com base de concreto, fundo de compensado, caixa pintada, tampa com janela, telhadinho de zinco,
   prensa-cabos, medidor, visor, adesivo de perigo, fechadura e o fio terra com a haste de cobre.
   mexendo (a cada quadro): as 7 alavancas, os 11 LEDs, o ponteiro e os tracinhos da bateria */
const _MQD=M4(),_MQD2=M4(),_MQD3=M4();let QD_T=0;
INIT_MALHAS.push(function malhasQuadro(){const R=rng(5151),grupos={lataria:new GB(4096,8),madeira:new GB(1024,8),pedra:new GB(512,8),metal:new GB(2048,8),liso:new GB(4096,8)};
  const A=(k,t,m,c,o)=>add(grupos[k],t,m,c,Object.assign({j:0.04,rnd:R},o||{})),PI2=Math.PI/2;
  const tinta=lin(0x7b878a),tinta2=lin(0x6a757b),esc=lin(0x1b1d1e),esc2=lin(0x2c2f31),marfim=lin(0xe6e0cf),papel=lin(0xd9dbd6),mad=lin(0x6b5034),mad2=lin(0x8a6b48),conc=lin(0x8c8a84),
    ama=lin(0xe0b12a),verde=lin(0x2e9b74),amaA=lin(0xd8a23c),zinco=lin(0x9aa1a3),cobre=lin(0xb0693a),terra=lin(0x4f8a3a),verm=lin(0xb02a20);
  /* poste, base e fundo */
  A('pedra',bvTris(0.36,0.16,0.36),mat(0,0.08,-0.2),conc);A('madeira',bvTris(0.12,2.06,0.12),mat(0,1.03,-0.2),mad);A('madeira',boxTris(0.9,1.1,0.025),mat(0,1.38,-0.115),mad2);
  for(const y of[1.06,1.7])A('metal',boxTris(0.17,0.035,0.16),mat(0,y,-0.2),zinco);
  /* caixa e a moldura da janela */
  A('lataria',bvTris(0.78,0.92,0.2),mat(0,1.38,0),tinta);
  for(const y of[1.511,1.309])A('lataria',boxTris(0.72,0.012,0.008),mat(0,y,0.104),tinta2);for(const x of[-0.354,0.354])A('lataria',boxTris(0.012,0.214,0.008),mat(x,1.41,0.104),tinta2);
  /* janela: fundo, trilho, o geral (escuro) e os 6 disjuntores (marfim) com o rasgo da alavanca */
  A('liso',boxTris(0.696,0.19,0.004),mat(0,1.41,0.1015),esc);A('liso',boxTris(0.69,0.03,0.006),mat(0,1.41,0.104),esc2);
  A('liso',bvTris(0.092,0.17,0.026),mat(QDG.gx,1.41,0.113),esc2);A('liso',boxTris(0.036,0.07,0.003),mat(QDG.gx,1.41,0.1265),esc);
  for(const x of QDG.cx){A('liso',bvTris(0.072,0.16,0.024),mat(x,1.41,0.112),marfim);A('liso',boxTris(0.03,0.064,0.003),mat(x,1.41,0.1245),esc);}
  /* etiqueta (papel com os números riscados) e os aros dos LEDs */
  A('liso',boxTris(0.69,0.026,0.002),mat(0,1.283,0.101),papel);for(const x of QDG.cx)A('liso',boxTris(0.012,0.016,0.002),mat(x,1.283,0.1022),esc);A('liso',boxTris(0.04,0.012,0.002),mat(QDG.gx,1.283,0.1022),verm);
  for(const x of[QDG.gx,...QDG.cx])A('liso',cylTris(0.016,0.016,0.004,10),mat(x,QDG.ledY,0.1,PI2,0,0),esc);
  for(const x of QDG.entX)A('liso',cylTris(0.013,0.013,0.004,10),mat(x,1.805,0.1,PI2,0,0),esc);
  /* medidor de ponteiro: aro, mostrador, marcas e a faixa vermelha (2 a 2,5 kW) */
  const[mx,my]=QDG.med;A('liso',cylTris(0.08,0.08,0.012,22),mat(mx,my,0.1,PI2,0,0),esc2);A('liso',cylTris(0.068,0.068,0.004,22),mat(mx,my,0.112,PI2,0,0),lin(0xe9e4d4));
  for(let i=0;i<=5;i++){const a=PI2-i/5*Math.PI;A('liso',boxTris(0.004,0.014,0.002),mat(mx-Math.sin(a)*0.054,my+Math.cos(a)*0.054,0.1165,0,0,a),esc);}
  for(const f of[0.83,0.89,0.95])A('liso',boxTris(0.012,0.008,0.002),mat(mx-Math.sin(PI2-f*Math.PI)*0.06,my+Math.cos(PI2-f*Math.PI)*0.06,0.1166,0,0,PI2-f*Math.PI+PI2),verm);
  A('liso',cylTris(0.009,0.009,0.008,8),mat(mx,my,0.114,PI2,0,0),esc);
  /* visor da bateria: moldura, tela e os 5 tracinhos apagados */
  const[lx,ly]=QDG.lcd;A('liso',bvTris(0.25,0.105,0.014),mat(lx,ly,0.107),esc2);A('liso',boxTris(0.226,0.078,0.002),mat(lx,ly,0.1145),lin(0x0f2a1c),{e:0.1});
  for(let i=0;i<5;i++)A('liso',boxTris(0.034,0.05,0.002),mat(lx-0.088+i*0.044,ly,0.1152),lin(0x1c3a2a));A('liso',boxTris(0.008,0.026,0.002),mat(lx+0.118,ly,0.1152),lin(0x1c3a2a));
  /* adesivo de perigo (triângulo amarelo com o raio) */
  {const pr=(r,d)=>{const P=[[0,r],[-r*0.866,-r*0.5],[r*0.866,-r*0.5]],f=P.map(p=>[p[0],p[1],d/2]),b=P.map(p=>[p[0],p[1],-d/2]),t=[[f[0],f[1],f[2]],[b[0],b[2],b[1]]];
      for(let i=0;i<3;i++){const j=(i+1)%3;t.push([f[i],b[i],b[j]],[f[i],b[j],f[j]]);}return t;};
    A('liso',pr(0.078,0.002),mat(-0.215,1.1,0.1012),esc);A('liso',pr(0.064,0.002),mat(-0.215,1.1,0.1022),ama);
    A('liso',boxTris(0.011,0.042,0.002),mat(-0.209,1.112,0.1034,0,0,-0.45),esc);A('liso',boxTris(0.011,0.038,0.002),mat(-0.221,1.085,0.1034,0,0,-0.45),esc);A('liso',boxTris(0.024,0.009,0.002),mat(-0.215,1.099,0.1034),esc);}
  /* fechadura, puxador e dobradiças */
  A('metal',cylTris(0.014,0.014,0.01,10),mat(0.3,1.12,0.1,PI2,0,0),zinco);A('liso',boxTris(0.004,0.012,0.002),mat(0.3,1.12,0.1105),esc);A('metal',bvTris(0.022,0.1,0.02),mat(0.345,1.12,0.112),esc2);
  for(const y of[0.985,1.705])A('metal',cylTris(0.011,0.011,0.07,8),mat(-0.393,y,0.09),zinco);
  /* prensa-cabos: verdes em cima (entradas), amarelos embaixo (saídas) */
  for(const x of QDG.entX){A('liso',cylTris(0.02,0.02,0.045,10),mat(x,1.84,0),esc2);A('liso',cylTris(0.026,0.026,0.012,6),mat(x,1.848,0),verde);}
  for(const x of QDG.saiX){A('liso',cylTris(0.02,0.02,0.045,10),mat(x,0.875,0),esc2);A('liso',cylTris(0.026,0.026,0.012,6),mat(x,0.9,0),amaA);}
  /* telhadinho de zinco ondulado (cai para a frente) */
  {const T=mat(0,2.06,0.03,0.2,0,0);A('metal',boxTris(0.98,0.016,0.5),T,zinco,{j:0.06});for(let i=0;i<8;i++)A('metal',cylTris(0.012,0.012,0.5,6),mm(T,mat(-0.42+i*0.12,0.008,-0.25,PI2,0,0)),zinco);}
  /* fio terra e a haste de cobre */
  A('liso',cylTris(0.006,0.006,0.86,5),mat(-0.37,0.06,0.06),terra);A('liso',cylTris(0.01,0.01,0.22,6),mat(-0.37,-0.05,0.06),cobre);A('metal',bvTris(0.03,0.025,0.03),mat(-0.37,0.15,0.06),zinco);
  /* junta as partes: cada material com a sua textura (como os veículos) */
  const partes=[],vira=f=>{for(let i=0;i<f.length;i+=11){f[i]=-f[i];f[i+2]=-f[i+2];f[i+8]=-f[i+8];f[i+10]=-f[i+10];}return f;};   // meia volta: a frente fica para quem pôs
  for(const k in grupos){const g=grupos[k];if(!g.n)continue;const f=vira(g.data());let m=null;
    if(k!=='liso'&&typeof itxMalha==='function'&&typeof ITX_DADOS!=='undefined'&&ITX_DADOS[k]){try{m=itxMalha('qd_'+k,f,k==='lataria'?1.2:1.6,true,k);}catch(e){m=null;}}
    if(m)partes.push(...m.partes);else partes.push(litMesh(f));}
  MESH.obra.quadroEnergia={partes,vao:partes[0].vao,count:partes[0].count,itx:true};
  /* as peças que mexem */
  const mk=(c,e,f)=>{const g=new GB(256,8);f(g,lin(c),e);return litMesh(g.data());},alv=(c,e)=>mk(c,e,(g,cc,ee)=>add(g,boxTris(0.022,0.02,0.032),mat(0,0,0.016),cc,{e:ee})),
    led=(c,e)=>mk(c,e,(g,cc,ee)=>add(g,cylTris(0.011,0.011,0.006,10),mat(0,0,0,PI2,0,0),cc,{e:ee})),seg=(c,e)=>mk(c,e,(g,cc,ee)=>add(g,boxTris(0.034,0.05,0.002),mat(0,0,0),cc,{e:ee}));
  QD.din={alav:alv(0xf0ebe0,0),alavD:alv(0xe2493a,0.3),alavG:mk(0xc8261d,0.1,(g,cc,ee)=>add(g,boxTris(0.03,0.022,0.036),mat(0,0,0.018),cc,{e:ee})),
    agulha:mk(0xc8261d,0.15,(g,cc,ee)=>add(g,boxTris(0.004,0.058,0.002),mat(0,0.024,0),cc,{e:ee})),seg:seg(0x2fe36a,0.85),segB:seg(0xff9f1a,0.85),
    led:{on:led(0x1fd04a,1.0),fora:led(0xf0c418,0.95),cort:led(0xff7a14,1.0),des:led(0xff2a1a,1.2),sem:led(0x2a2d2a,0),verm:led(0xff2a1a,1.0)}};});
DESENHO.opaco.push(function quadroDesenho(Pg){const D=QD.din;if(!D)return;const now=performance.now(),dt=QD_T?Math.min(0.1,(now-QD_T)/1000):0;QD_T=now;
  for(const q of OB){if(q.tipo!=='quadroEnergia'||q.hp<=0||d2(q.x,q.z,cam.pos[0],cam.pos[2])>40*40)continue;
    const e=q.ext||{},liga=!!e.eid,C=liga?qdCircuitos(q):[],R=liga?qdRede(q):null,geral=e.geral!==false;
    trs(_MQD,q.x,q.y||0,q.z,0,(q.yaw||0)+Math.PI,0,1,1,1);const put=(m,x,y,z,rx,rz)=>{trs(_MQD2,x,y,z,rx||0,0,rz||0,1,1,1);mul(_MQD3,_MQD,_MQD2);drawStat(Pg,m,_MQD3);};
    const Al=q._alav||(q._alav=[0,0,0,0,0,0,0]),k1=Math.min(1,dt*12);
    Al[0]+=((geral?-0.6:0.6)-Al[0])*k1;put(D.alavG,QDG.gx,QDG.ly,0.127,Al[0]);
    for(let k=0;k<6;k++){const c=qdCirc(q,k),alvo=c.des?0:c.on?-0.6:0.6;Al[k+1]+=(alvo-Al[k+1])*k1;put(c.des?D.alavD:D.alav,QDG.cx[k],QDG.ly,0.126,Al[k+1]);
      const r=C[k],est=!r||!r.ligado?'sem':c.des?'des':!c.on||!geral?'sem':q.cortados&&q.cortados.has(k)?'cort':!qdHorario(q,c)?'fora':'on';put(D.led[est],QDG.cx[k],QDG.ledY,0.1035);}
    put(D.led[!geral?'verm':R&&(R.Pg>0||R.carga>0.5)?'on':'sem'],QDG.gx,QDG.ledY,0.1035);
    const ent=liga?qdEntradas(q):[];for(let i=0;i<4;i++){const a=ent[i];let s='sem';
      if(a){const d=ELET[a.tipo];if(d.p==='fonte')s=fontePot(a)>0&&(d.renov||a.rodando)?'on':'sem';else if(d.p==='bateria'){const b=(a.ext.carga||0)/d.cap;s=b>0.2?'on':b>0.005?'fora':'sem';}else s=a.energ?'on':'sem';}
      put(D.led[s],QDG.entX[i],1.805,0.1035);}
    const f=clamp((R?R.D:0)/QD.ESCALA,0,1);q._ag=q._ag===undefined?f:q._ag+(f-q._ag)*Math.min(1,dt*3);put(D.agulha,QDG.med[0],QDG.med[1],0.1175,0,Math.PI/2-q._ag*Math.PI);
    const b=R&&R.cap>0?R.carga/R.cap:null;if(b!==null&&b>0.01){const n=Math.min(5,Math.ceil(b*5));for(let i=0;i<n;i++)put(b<0.2?D.segB:D.seg,QDG.lcd[0]-0.088+i*0.044,QDG.lcd[1],0.1158);}}});
/* ---------- manual ---------- */
MANUAL_EXTRA.push(()=>[{id:'x:quadro',sec:'eletricidade',nome:'Quadro de energia',icon:'i-quadro',trav:false,como:'desde o começo',desc:'O centro da energia da base: junta as fontes e divide a energia em 6 circuitos com disjuntor.',ing:{},
  est:{nome:'Onde: aba Energia (precisa da oficina)',icon:'i-quadro',onde:''},ferr:['Alicate e fio para ligar'],
  proc:['Ligue até 4 fontes ou baterias nas entradas de cima, verdes (com o alicate na mão, como os outros fios).','Ligue cada saída de baixo, amarela (um circuito), no que ela vai alimentar: luzes, portões, defesas, cozinha, água, oficina.',
    'No painel (E): disjuntor geral, a chave de cada circuito, o horário (sempre, só à noite, só com bateria acima de 30%) e a prioridade (alta, média, baixa).',
    'Faltou energia: o quadro corta primeiro a prioridade baixa e volta sozinho quando sobra. Mais de 2000 W num circuito desarma: religue no painel.',
    'Gerador automático: liga o gerador a gasolina quando as baterias caem abaixo de 20% e desliga em 90%.',
    'Baterias: a saída delas numa entrada do quadro e um circuito do quadro na entrada delas (carregam com a sobra).'],
  res:null,obs:['Na caixa: alavanca para cima é ligado, para baixo desligado e no meio (vermelha) desarmado. LED verde ligado, amarelo fora do horário, laranja cortado por falta de energia, vermelho desarmado.',
    'O ponteiro mostra o que a rede gasta (a faixa vermelha passa de 2 kW) e o visor, a bateria. O painel tem o gráfico das últimas 24 h.','Se os zumbis quebrarem o quadro, a base apaga: deixe dentro, protegido.'],tipo:'Guia'}]);

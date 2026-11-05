/* ================= Manual de Sobrevivência do VAYDR =================
   Um livro do jogo (tecla N, ou Pausa → Manual de Sobrevivência) com tudo o que se fabrica, constrói, curte, cozinha,
   conserva, melhora e desmancha. Ele se monta sozinho a partir das listas do jogo (receitas, construções, processos das
   estações, curtimento, cozinha, melhorias de arma, desmanche e recuperação), então toda receita nova das próximas etapas
   entra sozinha; um módulo também pode pôr entradas próprias em MANUAL_EXTRA (função que devolve uma lista de entradas).
   Cada receita mostra a imagem (o ícone desenhado), o nome, os ingredientes com as quantidades, a estação, as ferramentas,
   o processo, o resultado e as observações. O que ainda não foi descoberto aparece bloqueado: nome, ícone e o caminho para
   descobrir, sem ingredientes nem processo. */
const MANUAL_EXTRA=[];
const MN_SECOES=[['ferramentas','Ferramentas','i-picareta'],['armas','Armas e munição','i-taco'],['roupas','Roupas e armaduras','i-malha'],['mochilas','Mochilas','i-mochila'],
  ['couros','Couros','i-couro'],['materiais','Materiais','i-corda'],['cura','Cura e remédios','i-bandagem'],['comida','Comida e conservação','i-carne'],['agua','Tratamento de água','i-agua'],
  ['agricultura','Agricultura','i-horta'],['animais','Criação de animais','i-pele'],['mecanica','Mecânica e veículos','i-oficina'],['eletricidade','Eletricidade','i-gerador'],['barcos','Barcos','i-ponte'],
  ['recuperacao','Desmanche e recuperação','i-desmanche'],['construcoes','Construções e base','i-telhado']];
let mnSec='ferramentas',mnSel=null,mnBusca='',mnVolta='t-pausa',mnCache=null;
/* ---------- montar as entradas ---------- */
function mnEst(tipo){const E=ESTACOES[tipo];return E?{nome:E.nome,icon:E.icon,onde:'Onde achar: '+E.ir+'.'}:{nome:tipo,icon:'i-martelo',onde:''};}
function mnSecReceita(r){const d=ITEMS[r.faz],f=r.faz;if(d.tipo==='roupa')return d.slot==='costas'?'mochilas':'roupas';
  if(f==='cantil')return'agua';if(f==='kitFerramentas'||r.est==='mecanica')return'mecanica';if(f==='jangada')return'barcos';if(f==='remendo'||f==='agulhaOsso')return'couros';
  if(f==='farinhaOsso')return'agricultura';if(d.tipo==='comida')return'comida';if(r.cat==='armas')return'armas';if(r.cat==='cura')return'cura';if(r.cat==='ferramentas')return'ferramentas';
  if(r.cat==='roupas')return'roupas';return'materiais';}
function mnEstReceita(r){if(!r.est)return{nome:'Na mão, em qualquer lugar',icon:'i-mao',onde:''};if(typeof r.est==='string')return mnEst(r.est);
  return r.est>=2?{nome:'Oficina (bancada nível 2)',icon:'i-oficina',onde:'Melhore a bancada com o Manual do mecânico e '+custoLista(OFICINA_CUSTO)+'.'}:
    {nome:'Bancada de trabalho',icon:'i-martelo',onde:'A da clareira ou uma construída (B → Oficina → Bancada de trabalho).'};}
function mnAlt(r){return Object.keys(r.alt).map(k=>'No lugar de '+r.custo[k]+' '+ITEMS[k].nome.toLowerCase()+', serve '+r.alt[k][1]+' '+ITEMS[r.alt[k][0]].nome.toLowerCase()).join('. ')+'.';}
function mnObsRoupa(d){const O=[];if(!d.durMax)return O;
  O.push('Gasta com os golpes e com o uso, e suja (lama, chuva, sangue, trabalho). Roupa suja gasta mais rápido e esquenta menos: lave na água pela mochila.');
  O.push(d.mat==='metal'?'Conserte na bancada'+(d.malha?' ou na fornalha, com anéis de malha e sucata':' com sucata e pano')+'.':'Conserte com '+(d.mat==='tecido'?'pano':'remendo de couro')+', linha e agulha; na estação de couro o conserto fica perfeito.');
  if(d.arm&&d.arm.som)O.push('Desvantagem: pesa (anda e nada mais devagar, cansa mais e o fôlego volta devagar), tilinta a cada passo (os zumbis escutam de mais longe) e não esquenta.');return O;}
function mnReceita(r,i){const d=ITEMS[r.faz],st=receitaEstado(r),est=mnEstReceita(r),nome=r.nome||d.nome;
  const proc=[r.est?(typeof r.est==='string'?'Vá até '+(ESTACOES[r.est]?ESTACOES[r.est].ir:'a estação')+'.':'Fique perto '+(r.est>=2?'da oficina (bancada nível 2).':'de uma bancada.')):'Dá para fazer em qualquer lugar, na mão.',
    'Junte na mochila: '+custoLista(r.custo)+'.'];
  if(r.ferramenta)proc.push('Tenha uma faca ou outra lâmina na mochila.');
  proc.push('Abra a mochila (Tab) → Fabricar → '+nome+' e toque em Fabricar.');
  proc.push(d.tipo==='roupa'?'Fica pronto na hora; a qualidade do couro passa para a peça.':'Fica pronto na hora'+(r.n>1?' e rende '+r.n+'.':'.'));
  const obs=[d.desc];if(r.alt)obs.push(mnAlt(r));obs.push('Descoberta: '+receitaComo(r)+'.');obs.push(...mnObsRoupa(d));
  if(Object.keys(r.custo).some(k=>ITEMS[k]&&ITEMS[k].tipo==='roupa'))obs.push('A peça usada na receita precisa estar na mochila (tire do corpo antes).');
  return{id:'r'+i,sec:mnSecReceita(r),nome:nome+(r.n>1?' × '+r.n:''),icon:d.icon||'i-peca',trav:st==='travada',nova:st==='nova',como:st==='travada'?desbTexto(r):receitaComo(r),
    desc:d.desc,ing:r.custo,est,ferr:[r.ferramenta?'Faca ou outra lâmina na mochila':'Nenhuma além da estação'],proc,res:{id:r.faz,n:r.n||1},obs,tipo:'Fabricar'};}
function mnSecObra(k,tab){if(k==='gerador'||k==='poste')return'eletricidade';if(k==='coletor')return'agua';if(tab&&tab.id==='plantio')return'agricultura';return'construcoes';}
function mnTravaObra(k){const d=OBRAS[k].desb;if(d==='noite1')return'Libera depois de sobreviver à primeira noite.';if(d==='oficina')return'Precisa da oficina: melhore a bancada (nível 2).';
  if(d&&d.startsWith('planta'))return'Ache e estude a '+(ITEMS[d]?ITEMS[d].nome.toLowerCase():'planta')+' (na mochila ou na mesa de estudo).';return'';}
function mnObsObra(k){const D=OBRAS[k],O=[];if(D.desc)O.push(D.desc);O.push('Resistência: '+D.hp+'. Os zumbis podem quebrar; conserte no modo de construção (Consertar tudo, T).');
  if(D.estacao&&ESTACOES[D.estacao])O.push('É uma estação: '+ESTACOES[D.estacao].nome.toLowerCase()+' (chegue perto e use com E).');
  if(D.bau)O.push('Guarda itens.');if(D.luz)O.push('Ilumina à noite.');if(D.portao)O.push('Abre e fecha; os zumbis não passam.');if(D.armadilha)O.push('Armadilha: fere quem pisa ou encosta.');
  if(k==='mesaEstudo')O.push('Dá para estudar: '+listaE(Object.keys(ESTUDOS).filter(q=>!ESTUDOS[q].planta).map(q=>ITEMS[q].nome.toLowerCase()))+' e as plantas de construção.');
  if(k==='bancadaDesmanche')O.push('Desmancha: '+listaE(Object.keys(DESMANCHE).map(q=>ITEMS[q].nome.toLowerCase()))+'; e desmonta itens da mochila devolvendo mais material.');
  return O;}
function mnEntradas(){const L=[];
  RECIPES.forEach((r,i)=>{if(ITEMS[r.faz])L.push(mnReceita(r,i));});
  for(const k of Object.keys(OBRAS)){const D=OBRAS[k];if(!D||!D.custo||!D.nome)continue;const lib=obraLiberada(k),tab=OBRA_CATS.find(c=>c.t.includes(k));
    L.push({id:'o:'+k,sec:mnSecObra(k,tab),grupo:tab?tab.nome:'Outras',nome:D.nome,icon:D.icon||'i-martelo',trav:!lib,como:lib?(D.desb?'já liberada':'desde o começo'):mnTravaObra(k),
      desc:mnObsObra(k)[0],ing:D.custo,est:{nome:'Modo de construção (B)',icon:'i-martelo',onde:'Em qualquer lugar livre'+(OBRAS_CHAO.includes(k)?', no chão':'')+'.'},ferr:['Nenhuma: só os materiais'],
      proc:['Aperte B para entrar no modo de construção.','Escolha a aba '+(tab?tab.nome:'certa')+' → '+D.nome+' (ou o número da peça).','Mire onde quer, gire com R e confirme com o clique.','Os materiais saem da mochila na hora.'],
      res:{obra:k},obs:mnObsObra(k),tipo:'Construir'});}
  for(const tipo in PROCESSOS)for(const R of PROCESSOS[tipo].rec){const out=ITEMS[R.para[0]];if(!out)continue;const trav=!!(R.manual&&!(G.fab&&G.fab.manuais[R.manual])),M=R.manual&&MANUAIS[R.manual];
    L.push({id:'p:'+tipo+':'+R.id,sec:tipo==='forja'?'materiais':R.para[0]==='farinhaOsso'?'agricultura':'comida',nome:R.nome,icon:out.icon,trav,
      como:trav?'Ache o '+M.nome+' '+M.onde+'.':(M?'com o '+M.nome:'desde o começo'),desc:out.desc,ing:R.de,est:mnEst(tipo),ferr:['Nenhuma'],
      proc:['Vá até '+(ESTACOES[tipo]?ESTACOES[tipo].ir:'a estação')+'.','Junte na mochila: '+custoLista(R.de)+'.','Use a estação (E) e escolha “'+R.nome+'”.','Leva '+horasTxt(R.h*60)+' de jogo e continua com você longe.','Volte e toque em Recolher.'],
      res:{id:R.para[0],n:R.para[1]},obs:[out.desc],tipo:'Processo'});}
  for(const id in CURTIR){const C=CURTIR[id],out=ITEMS[C.para];if(!out||!ITEMS[id])continue;
    L.push({id:'c:'+id,sec:'couros',nome:'Curtir '+ITEMS[id].nome.toLowerCase(),icon:out.icon,trav:false,como:'desde o começo',desc:out.desc,ing:{[id]:1},alt:'Mais 1 gordura animal ou 1 sal para cada couro.',
      est:mnEst('couro'),ferr:['Uma lâmina para esfolar o bicho antes'],
      proc:['Esfole um bicho com uma lâmina para tirar o couro bruto.','Vá até '+ESTACOES.couro.ir+'.','Use a estação e escolha “Curtir '+ITEMS[id].nome.toLowerCase()+'”: gasta 1 gordura ou 1 sal.','Leva '+horasTxt(curtTempo(id))+' de jogo, mesmo com você longe.','Volte e recolha o couro curtido.'],
      res:{id:C.para,n:1},obs:[out.desc,'A qualidade do couro (baixa a excepcional) passa para as peças feitas com ele.','Com o Manual do curtidor o couro curte 35% mais rápido.'],tipo:'Processo'});}
  for(const c of COZINHA){if(!ITEMS[c.de]||!ITEMS[c.para])continue;const ag=c.para==='agua';
    L.push({id:'k:'+c.de,sec:ag?'agua':'comida',nome:ag?'Ferver água suja':'Assar '+ITEMS[c.de].nome.toLowerCase(),icon:ITEMS[c.para].icon,trav:false,como:'desde o começo',desc:ITEMS[c.para].desc,ing:{[c.de]:1},
      est:{nome:'Fogueira acesa',icon:'i-fogueira',onde:'A da clareira ou uma construída (B → Base → Fogueira).'},ferr:['Nenhuma'],
      proc:['Chegue perto de uma fogueira acesa com '+ITEMS[c.de].nome.toLowerCase()+' na mochila.','Segure E em “'+(ag?'Ferver água':'Cozinhar')+'”: a fogueira faz tudo o que você tiver de uma vez.'],
      res:{id:c.para,n:1},obs:[ITEMS[c.para].desc].concat(ag?['Água suja sem ferver faz mal. A pastilha de cloro também purifica.']:['Comida tem validade: defumada e seca dura mais.']),tipo:'Cozinhar'});}
  const SERVE={cabo:'armas de mão (facas, machados, tacos)',fio:'lâminas e machados',corda:'arco e besta',mira:'armas de fogo'};
  for(const k in MELHORIAS){const M=MELHORIAS[k];L.push({id:'u:'+k,sec:'armas',nome:M.nome,icon:'i-oficina',trav:false,como:'desde o começo',desc:M.desc,ing:M.custo,est:mnEst('armas'),ferr:['A arma que vai melhorar, na mochila'],
    proc:['Leve a arma até '+ESTACOES.armas.ir+'.','Use a bancada (E) e escolha “'+M.nome+'” na arma.','Fica pronto na hora e a melhoria fica na arma.'],res:{txt:M.desc},obs:['Serve em: '+(SERVE[k]||'algumas armas')+'.','A bancada de armas também conserta gastando 30% menos.'],tipo:'Melhoria'});}
  for(const id in DESMANCHE){const D=DESMANCHE[id];L.push({id:'d:'+id,sec:'recuperacao',nome:'Desmanchar '+ITEMS[id].nome.toLowerCase(),icon:ITEMS[id].icon,trav:false,como:'desde o começo',desc:ITEMS[id].desc,ing:{[id]:1},
    est:mnEst('desmanche'),ferr:['Kit de ferramentas na mochila (não é obrigatório: rende mais e acaba mais rápido)'],
    proc:['Construa uma bancada de desmanche (B → Oficina).','Use a bancada (E) e escolha “Desmanchar '+ITEMS[id].nome.toLowerCase()+'”.','Leva '+horasTxt(D.min)+' de jogo ('+horasTxt(D.min*0.75)+' com o kit) e continua com você longe.','Volte e toque em Recolher o material.'],
    res:{txt:'Rende '+desmancheProvaveis(id)+'. Quanto sai depende do estado das peças (boas, gastas ou enferrujadas) e da ferramenta.'},obs:[ITEMS[id].desc],tipo:'Desmanche'});}
  for(const[t,nome,peca,onde]of[['carro','Peças de carros abandonados','pecasCarro','Carros, viaturas, ambulância, caminhões e o ônibus parados nas estradas, nos sítios e na cidade.'],
    ['movel','Restos de móveis','restosMovel','Mesas, cadeiras, cômodas, racks, bancos, sofás e poltronas das casas e prédios. O móvel some da casa.'],
    ['maquina','Peças de máquinas','pecasMaquina','Empilhadeiras, fogões, macas de hospital e os contêineres do porto da cidade.'],['aviao','Destroços de avião','destrocosAviao','O monomotor da ilhota, o avião de carga e o helicóptero militar caídos.']]){const D=RECUP_TIPOS[t];
    L.push({id:'w:'+t,sec:'recuperacao',nome,icon:ITEMS[peca].icon,trav:false,como:'desde o começo',desc:ITEMS[peca].desc,ing:null,ingTxt:'Nada: só a ferramenta.',est:{nome:'No próprio lugar',icon:'i-mapa',onde},
      ferr:[D.ferr==='mec'?'Kit de ferramentas ou pé de cabra':'Machado, pé de cabra ou kit de ferramentas'],
      proc:['Chegue perto com a ferramenta na mochila: aparece “Desmontar”.','Segure E até a barra encher (uns '+Math.round(D.dur)+' segundos).','Cada vez tira '+(t==='movel'?'1':'1 ou 2')+' '+ITEMS[peca].nome.toLowerCase()+(t==='movel'?'':'; o lugar aguenta algumas vezes')+'.','Leve para a bancada de desmanche e transforme em material.'],
      res:{id:peca,n:1},obs:['Faz barulho: os zumbis escutam.','Sem luva dá para cortar a mão; com luva o risco é bem menor.','Suja a roupa (graxa e poeira).'].concat(t==='movel'?['Sofá e poltrona dão pano na hora, se você tiver uma lâmina.']:[]),tipo:'Recuperar'});}
  for(const f of MANUAL_EXTRA){try{const r=f();if(Array.isArray(r))L.push(...r);}catch(e){console.error('manual: entrada extra',e);}}
  return L;}
/* ---------- manutenção de veículos e água: o que não é receita de fabricar, mas é processo com material ---------- */
MANUAL_EXTRA.push(()=>{const kit='Kit de ferramentas na mochila (gasta um pouco a cada serviço)',oficina={nome:'O próprio veículo',icon:'i-oficina',onde:'Segure E perto do veículo: abre a oficina dele.'};
  const V=(id,nome,icon,ing,ferr,proc,res,obs)=>({id:'v:'+id,sec:'mecanica',nome,icon,trav:false,como:'desde o começo',desc:obs[0],ing,est:oficina,ferr:[ferr],proc,res:{txt:res},obs,tipo:'Manutenção'});
  return[V('abastecer','Abastecer o veículo','i-gasolina',{gasolina:1},'Nenhuma',['Segure E perto do veículo.','Escolha Abastecer: cada galão enche uma parte do tanque.'],'Tanque mais cheio.',['Sem combustível o veículo não liga. Galões aparecem em postos, oficinas e carros.']),
    V('motor','Consertar o motor','i-peca',{pecaVeiculo:1},kit,['Segure E perto do veículo.','Escolha Consertar o motor.'],'Motor de volta a 100%.',['A peça de motor sai da oficina mecânica (barra de ferro e sucata), de outro veículo ou da bancada de desmanche.']),
    V('pneu','Trocar pneu','i-pneu-usado',{pneu:1},kit,['Segure E perto do veículo.','Escolha Trocar pneu: troca o pior.'],'Pneu novo (ou usado, com o estado que tinha).',['Serve um pneu novo ou um pneu usado do mesmo tipo de roda (carro, moto ou triciclo).']),
    V('bateria','Instalar bateria','i-bateria-v',{bateriaVeic:1},kit,['Segure E perto do veículo.','Escolha Instalar bateria.'],'O veículo volta a ligar.',['Serve a bateria automotiva nova ou uma usada do tamanho certo (carro ou moto).']),
    Object.assign(V('tirar','Tirar peças de um veículo','i-kit-ferr',null,kit,['Segure E perto de um veículo que você não vai usar.','Escolha Tirar um pneu, Tirar a bateria, Tirar peça do motor ou Desmontar o rotor.','A peça vai para a mochila e serve em outro veículo compatível.'],
      'Pneu usado, bateria, peça de motor ou peças de rotor.',['Tirar peça do motor deixa o motor 50% pior.','Para lataria e sucata, desmonte os carros abandonados (aba Desmanche e recuperação).']),{ingTxt:'Nada: só o kit de ferramentas.'}),
    {id:'v:pastilha',sec:'agua',nome:'Purificar com pastilha de cloro',icon:ITEMS.pastilha?ITEMS.pastilha.icon:'i-agua',trav:false,como:'desde o começo',desc:ITEMS.pastilha?ITEMS.pastilha.desc:'',ing:{pastilha:1,aguaSuja:1},
      est:{nome:'Na mão, em qualquer lugar',icon:'i-mao',onde:''},ferr:['Nenhuma'],proc:['Tenha a pastilha e uma garrafa (ou o cantil) com água suja.','Na mochila, toque na pastilha e use.'],res:{id:'agua',n:1},
      obs:['Também serve para o cantil com água suja.','As pastilhas aparecem em farmácias, hospitais e casas.'],tipo:'Tratar água'}];});
/* ---------- tela ---------- */
function mnIngHTML(ing){return'<ul class="mn-ing">'+Object.entries(ing).map(([k,n])=>{const it=ITEMS[k];if(!it)return'';const t=invCount(k),ok=t>=n;
  return'<li>'+svgUse(it.icon||'i-peca')+'<span>'+n+' × '+it.nome+'</span><b class="'+(ok?'k':'f')+'" title="Na mochila">'+Math.min(t,999)+'/'+n+'</b></li>';}).join('')+'</ul>';}
function mnResHTML(e){const R=e.res||{};if(R.txt)return'<p>'+R.txt+'</p>';
  if(R.obra){const D=OBRAS[R.obra];return'<div class="mn-res">'+svgUse(D.icon||'i-martelo')+'<span><b>'+D.nome+'</b><small>Construção · resistência '+D.hp+'</small></span></div>';}
  const d=ITEMS[R.id];if(!d)return'';const s=d.durMax?{id:R.id,q:1,dur:durMaxDe({id:R.id,q:1})}:null;
  return'<div class="mn-res">'+svgUse(d.icon||'i-peca')+'<span><b>'+(R.n>1?R.n+' × ':'')+d.nome+'</b><small>'+(TIPO_NOME[d.tipo]||'')+'</small></span></div>'+statsItem(s,d);}
function mnDetalheHTML(e){if(!e)return'<p class="mn-vazio">Escolha uma receita na lista.</p>';const sec=MN_SECOES.find(s=>s[0]===e.sec);
  let h='<div class="mn-cab"><div class="mn-img'+(e.trav?' trav':'')+'">'+svgUse(e.icon)+(e.trav?svgUse('i-cadeado','mn-cad'):'')+'</div><div><h3>'+e.nome+'</h3><small>'+(sec?sec[1]:'')+' · '+e.tipo+(e.nova?' · descoberta':'')+'</small></div></div>';
  if(e.trav)return h+'<div class="mn-trava">'+svgUse('i-cadeado')+'<p><b>Receita ainda não descoberta.</b> Os ingredientes e o processo aparecem quando você descobrir.<br><span>Como descobrir: '+e.como+'</span></p></div>'+(e.desc?'<p class="mn-desc">'+e.desc+'</p>':'');
  h+='<h4>Ingredientes</h4>'+(e.ing?mnIngHTML(e.ing):'<p>'+(e.ingTxt||'Nenhum.')+'</p>')+(e.alt?'<p class="mn-alt">'+e.alt+'</p>':'');
  h+='<h4>Estação necessária</h4><div class="mn-est">'+svgUse(e.est.icon||'i-martelo')+'<p><b>'+e.est.nome+'</b>'+(e.est.onde?'<br><small>'+e.est.onde+'</small>':'')+'</p></div>';
  h+='<h4>Ferramentas</h4><p>'+e.ferr.join('; ')+'.</p>';
  h+='<h4>Processo</h4><ol class="mn-proc">'+e.proc.map(p=>'<li>'+p+'</li>').join('')+'</ol>';
  h+='<h4>Resultado</h4>'+mnResHTML(e);
  if(e.obs&&e.obs.length)h+='<h4>Observações</h4><ul class="mn-obs">'+e.obs.filter(Boolean).map(o=>'<li>'+o+'</li>').join('')+'</ul>';
  return h;}
function mnNorm(s){return(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function manualRender(foco){const L=mnCache||(mnCache=mnEntradas()),des=L.filter(e=>!e.trav).length;
  $('mn-cont').textContent=des+' de '+L.length+' receitas descobertas';
  const secs=MN_SECOES.filter(s=>L.some(e=>e.sec===s[0]));if(!secs.some(s=>s[0]===mnSec))mnSec=secs[0]?secs[0][0]:'ferramentas';
  $('mn-abas').innerHTML=secs.map(s=>{const n=L.filter(e=>e.sec===s[0]),d=n.filter(e=>!e.trav).length;
    return'<button class="cq-aba" type="button" data-sec="'+s[0]+'" aria-pressed="'+(!mnBusca&&s[0]===mnSec)+'">'+s[1]+' <span class="mn-n">'+d+'/'+n.length+'</span></button>';}).join('');
  const q=mnNorm(mnBusca.trim()),vis=q?L.filter(e=>mnNorm(e.nome).includes(q)||(!e.trav&&e.ing&&Object.keys(e.ing).some(k=>ITEMS[k]&&mnNorm(ITEMS[k].nome).includes(q)))):L.filter(e=>e.sec===mnSec);
  if(!vis.some(e=>e.id===mnSel))mnSel=vis[0]?vis[0].id:null;
  let h='',grupo=null;
  for(const e of vis){const g=q?(MN_SECOES.find(s=>s[0]===e.sec)||[])[1]:e.grupo||null;if(g&&g!==grupo){grupo=g;h+='<div class="mn-grupo">'+g+'</div>';}
    h+='<button class="mn-it'+(e.trav?' trav':'')+(e.nova?' nova':'')+'" type="button" data-mn="'+e.id+'" aria-pressed="'+(e.id===mnSel)+'" aria-label="'+e.nome+(e.trav?' (bloqueada)':'')+'">'+svgUse(e.icon)+'<span>'+e.nome+'</span>'+(e.trav?svgUse('i-cadeado','mn-st'):'')+'</button>';}
  if(!vis.length)h='<p class="mn-vazio">Nada com esse nome no manual.</p>';
  $('mn-lista').innerHTML=h;$('mn-det').innerHTML=mnDetalheHTML(L.find(e=>e.id===mnSel));
  if(foco){const b=$('mn-lista').querySelector('[aria-pressed="true"]');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest'});}}
function abrirManual(volta){mnVolta=volta||'t-pausa';if(G.modo==='jogo')pausar();else if(G.modo==='mochila'){fecharMochila();G.modo='jogo';pausar();}
  if(G.modo!=='pausa'&&G.modo!=='menu')return;mnCache=null;tela('t-manual');manualRender(true);sfx('estudo');}
function fecharManual(){if($('t-manual').hidden)return;if(G.modo==='pausa'&&mnVolta==='jogo'){G.modo='jogo';tela(null);if(typeof pedirTrava==='function')pedirTrava();}else tela(mnVolta);}
TELAS.push('t-manual');
{const ab=$('mn-abas');if(ab)ab.addEventListener('click',e=>{const b=e.target.closest('[data-sec]');if(!b)return;mnSec=b.dataset.sec;mnBusca='';$('mn-busca').value='';mnSel=null;manualRender();sfx('clique');});
 const li=$('mn-lista');if(li)li.addEventListener('click',e=>{const b=e.target.closest('[data-mn]');if(!b)return;mnSel=b.dataset.mn;manualRender();sfx('clique');
   if(window.innerWidth<760){const d=$('mn-det');if(d&&d.scrollIntoView)d.scrollIntoView({block:'start',behavior:'smooth'});}});
 const bu=$('mn-busca');if(bu)bu.addEventListener('input',()=>{mnBusca=bu.value;mnSel=null;manualRender();});
 const v=$('mn-voltar');if(v)v.addEventListener('click',fecharManual);
 const p=$('p-manual');if(p)p.addEventListener('click',()=>abrirManual('t-pausa'));}
/* tecla N (dá para trocar em Ajustes → Teclas) */
ACOES_TECLA.splice(ACOES_TECLA.findIndex(a=>a.id==='diario')+1,0,{id:'manual',nome:'Manual de Sobrevivência',pad:'KeyN'});montarTraducao();rotulosTeclas();
window.addEventListener('keydown',e=>{if(e.code!=='KeyN'||e.repeat)return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||''))return;
  if(!$('t-manual').hidden){e.preventDefault();fecharManual();return;}if(G.modo==='jogo'||G.modo==='mochila'){e.preventDefault();abrirManual('jogo');}});
/* no diário, a aba Receitas lembra do manual */
{const _dh=diarioReceitasHTML;diarioReceitasHTML=function(){const r=_dh.apply(this,arguments);r.res+=' · todas no Manual de Sobrevivência (N)';return r;};}

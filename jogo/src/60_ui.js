/* ================= interface: HUD, menus, mochila, construção e controles ================= */
const hudEl=$('hud'),radioEl=$('radio'),feedEl=$('feed');
const svgUse=(id,cls)=>'<svg class="ico'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>';
const KIND={conquista:['Conquista','#e8c060','i-trofeu'],radio:['Rádio · 104,3','var(--ember)','i-radio'],alerta:['Alerta','var(--blood)','i-alerta'],clima:['Clima','var(--water)','i-chuva'],
  habilidade:['Progresso','var(--moss)','i-subir'],corpo:['Sobrevivência','var(--grain)','i-fome'],grupo:['Grupo','#6fb7e8','i-grupo']};
const toastFila=[];
const toastsVivos=()=>radioEl.querySelectorAll('.toast:not(.sai)').length,toastMax=()=>window.innerHeight<=620?1:2;
function proxToast(){if(toastFila.length&&toastsVivos()<toastMax()){const q=toastFila.shift();toast(q[0],q[1]);}}
function toast(kind,text){if(toastsVivos()>=toastMax()){toastFila.push([kind,text]);if(toastFila.length>5)toastFila.shift();return;}
  const k=KIND[kind]||KIND.corpo,el=document.createElement('div');el.className='toast painel';el.style.setProperty('--k',k[1]);
  const h=document.createElement('h4');h.innerHTML=svgUse(k[2]);h.append(k[0]);const p=document.createElement('p');el.append(h,p);radioEl.append(el);
  if(kind==='radio'&&!reduced){let i=0;const tick=()=>{i=Math.min(text.length,i+2);p.textContent=text.slice(0,i);if(i<text.length&&el.isConnected)setTimeout(tick,28);};tick();}else p.textContent=text;
  while(radioEl.children.length>3)radioEl.firstElementChild.remove();
  setTimeout(()=>{el.classList.add('sai');setTimeout(()=>{el.remove();proxToast();},500);},8000);}
function feed(text,ruim){const s=document.createElement('span');s.textContent=text;if(ruim)s.className='ruim';feedEl.append(s);while(feedEl.children.length>5)feedEl.firstElementChild.remove();
  setTimeout(()=>{s.classList.add('sai');setTimeout(()=>s.remove(),500);},2200);}
function dica(key,kind,text){if(G.dicas[key])return;G.dicas[key]=1;toast(kind,text);}
let acertoT=0;function marcarAcerto(head){acertoT=head?0.35:0.2;}
function flashDano(){const d=$('dano');d.style.opacity='1';setTimeout(()=>d.style.opacity=String(clamp(1-P.vida/100,0,0.6)),180);}

/* ---------- barra rápida ---------- */
const slotsEl=$('slots');
function slotHTML(s,i,key){if(!s)return'<span class="k so-pc">'+(key?i+1:'')+'</span>';const d=ITEMS[s.id];let q='';
  if(d.fogo)q='<span class="q">'+s.mun+'/'+invCount(d.municao)+'</span>';else if(d.cantil)q='<span class="q'+(s.mun&&s.dur>0?' suja':'')+'">'+cantilGoles(s)+'/'+d.cantil+'</span>';else if(d.durMax)q='<span class="dur"><i style="width:'+Math.round(100*s.dur/d.durMax)+'%"></i></span>';else if(s.n>1||d.max>1)q='<span class="q">'+s.n+'</span>';
  return(key?'<span class="k so-pc">'+(i+1)+'</span>':'')+svgUse(d.icon)+q;}
function hudBarra(){let h='';for(let i=0;i<BAR_N;i++){const s=P.inv[i];h+='<button class="slot'+(s?'':' vazio')+'" type="button" data-i="'+i+'" aria-pressed="'+(P.sel===i)+'" aria-label="'+(s?ITEMS[s.id].nome:'Vazio')+'">'+slotHTML(s,i,true)+'</button>';}
  slotsEl.innerHTML=h;const d=selDef();if(OBRA.ativo)hudObras();else $('item-nome').textContent=d?d.nome:maosVaziasTxt();
  let ic='i-machado',lb='Atacar';if(d&&selItem().id==='pedra'){ic='i-pedra';lb='Bater';}else if(!d||!d.tipo||d.tipo==='material'||d.tipo==='util'||d.tipo==='municao'||d.tipo==='missao'||d.tipo==='garrafa'||d.tipo==='roupa'){ic='i-mao';lb='Socar';}
  else if(d.fogo){ic='i-pistola';lb='Atirar';}else if(d.arco){ic='i-arco';lb='Puxar';}else if(d.arremesso){ic='i-molotov';lb='Jogar';}else if(d.corpo){ic=d.icon;lb=d.corta?'Golpear':'Atacar';}else if(d.tipo==='comida'){ic=d.icon;lb='Comer';}else if(d.tipo==='bebida'){ic=d.icon;lb='Beber';}else if(d.tipo==='cura'){ic=d.icon;lb='Curar';}
  if(CARRO.ativo){ic='i-alerta';lb='Buzina';}
  $('a-atacar-i').setAttribute('href','#'+ic);$('a-atacar-l').textContent=lb;$('a-recarregar').hidden=!(d&&d.fogo)||CARRO.ativo;
  $('a-usar').querySelector('span').textContent=CARRO.ativo?'Sair':'Usar';$('a-pular').querySelector('span').textContent=CARRO.ativo?'Freio':'Pular';
  $('painel-carro').hidden=!CARRO.ativo;slotsEl.classList.toggle('dirigindo',CARRO.ativo);hudArma();}
function selecionar(i){if(P.acao&&(P.acao.tipo==='arco'||P.acao.tipo==='arremesso'&&P.acao.done))P.acao=null;if(P.acao&&(P.acao.tipo==='golpe'||P.acao.tipo==='tiro'||P.acao.tipo==='empurrar')){P.selPend=i;return;}if(P.acao&&P.acao.tipo==='recarga')P.acao=null;P.selPend=null;P.sel=i;P.aim=0;hudBarra();sfx('clique');}

/* ---------- mochila, fabricação e baú ---------- */
let invSel=-1,invAba='mochila',roupaSel=null,fabSel=-1,fabCat='todas',desmPend=-1,fabQtd=1,fabQtdDe=-1;
function abrirMochila(aba){if(G.modo!=='jogo')return;invAba=aba||(G.pontos>0&&!abrirMochila.viu?'nivel':'mochila');abrirMochila.viu=G.pontos>0;
  if(!bauAberto&&aba==='chao'){const c=chaoAbrir();if(c){bauAberto=c;bauMsg='';invAba='bau';}else invAba='mochila';}   // o chão tem o menu dele (segure E na pilha); o Tab abre só a mochila
  invSel=-1;roupaSel=null;desmPend=-1;$('inv').hidden=false;G.modo='mochila';if(document.pointerLockElement)document.exitPointerLock();IN.attack=false;invRender();}
function fecharMochila(){$('inv').hidden=true;if(G.modo==='mochila')G.modo='jogo';if(bauAberto&&bauAberto.saque){if(bauAberto.aoMudar)bauAberto.aoMudar();else caixaConferir(bauAberto.caixa);}
  // achados e chão: o que você não pegou (ou deixou) fica no chão, num monte só
  if(bauAberto&&bauAberto.chao){for(const d of bauAberto.fonte){const i=DROPS.indexOf(d);if(i>=0)DROPS.splice(i,1);}soltarResto(bauAberto.itens,bauAberto.lugar);}
  else if(bauAberto&&bauAberto.achados)soltarResto(bauAberto.itens,bauAberto.lugar);
  if(bauAberto)sfx('bau');bauAberto=null;bauMsg='';if(invAba==='bau')invAba='mochila';hudBarra();}
let bauAberto=null,bauMsg='';
function abrirBau(o){if(G.modo!=='jogo')return;bauAberto=o;bauMsg='';sfx('bau');abrirMochila('bau');}
/* itens no chão perto de você viram um "baú" de passagem na mochila: pegar um por um, pegar tudo ou deixar algo da mochila no lugar (trocar) */
function chaoPerto(){return DROPS.filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<2.6&&Math.abs((d.y??P.y)-P.y)<1.8);}
function chaoAbrir(){const L=chaoPerto();if(!L.length)return null;const B=[];for(const d of L)for(const[id,n,ex]of d.itens)if(ITEMS[id])B.push(Object.assign({id,n},ex||{}));
  if(!B.length)return null;const cap=Math.max(12,B.length+6);while(B.length<cap)B.push(null);return{itens:B,nome:'Chão',chao:true,fonte:L,lugar:{x:P.x,y:P.y,z:P.z}};}
/* o que você achou ao revistar (gaveta, quarto, porta-malas, portão do posto...): escolhe o que levar; o resto fica no chão */
function achadosAbrir(itens,o){const B=itens.filter(x=>ITEMS[x[0]]).map(([id,n,ex])=>Object.assign({id,n},ex||{}));const cap=Math.max(8,B.length+4);while(B.length<cap)B.push(null);
  bauAberto={itens:B,nome:'Achados',achados:true,origem:o&&o.label||'',lugar:{x:o&&o.x!==undefined?o.x:P.x,y:o&&o.y!==undefined?o.y:P.y,z:o&&o.z!==undefined?o.z:P.z}};
  bauMsg='';sfx('bau');abrirMochila('bau');}
function soltarResto(B,L){const resto=B.filter(Boolean).map(s=>[s.id,s.n,exDe(s)]);if(resto.length)soltarItens(resto,L.x,L.z,L.y);}
function exDe(s){const o={};let tem=false;for(const k of['dur','mun','q','rep','v'])if(s[k]!==undefined){o[k]=s[k];tem=true;}return tem?o:null;}
function bauGuardar(i){const B=bauAberto&&bauAberto.itens,s=P.inv[i];if(!B||!s)return false;if(bauAberto.saque){bauMsg='Essa caixa não guarda nada.';return false;}const d=ITEMS[s.id];
  if(d.max>1)for(const t of B)if(t&&t.id===s.id&&t.n<d.max&&s.n>0&&mesmaQual(t,s.q)){const k=Math.min(s.n,d.max-t.n);juntarPilha(t,k,s);t.n+=k;s.n-=k;}
  if(s.n>0){const j=B.indexOf(null);if(j<0)return false;B[j]=s;}P.inv[i]=null;if(P.sel===i)P.aim=0;return true;}
function bauPegar(j){const B=bauAberto&&bauAberto.itens,s=B&&B[j];if(!s)return true;const left=invAdd(s.id,s.n,exDe(s));if(left){s.n=left;return false;}B[j]=null;if(bauAberto.saque){if(bauAberto.aoMudar)bauAberto.aoMudar();else caixaConferir(bauAberto.caixa);}return true;}
function pertoBancada(){const b=INTER.find(i=>i.id==='bancada');if(b&&Math.hypot(b.x-P.x,b.z-P.z)<4.5)return true;return!!bancadaPerto();}   // a da clareira ou uma construída (48yd)
const TIPO_NOME={util:'Utensílio',arma:'Arma e ferramenta',material:'Material',comida:'Comida',bebida:'Bebida',cura:'Cura',roupa:'Roupa',municao:'Munição',missao:'Peça da missão',garrafa:'Recipiente'};
function custoLista(c){return Object.entries(c).map(([k,n])=>n+' '+ITEMS[k].nome.toLowerCase()).join(', ');}
function detTopo(nome,icon,sub){return'<div class="det-tit">'+nome+'</div><div class="det-ico">'+svgUse(icon)+(sub?'<small>'+sub+'</small>':'')+'</div>';}
function barraStat(nome,f,txt,cor){return'<div class="stat"><span>'+nome+'</span><i><b style="width:'+Math.round(clamp(f,0,1)*100)+'%'+(cor?';background:'+cor:'')+'"></b></i><em>'+txt+'</em></div>';}
function statsItem(s,d){let h='';
  if(d.durMax&&s&&s.dur!==undefined){const f=s.dur/Math.max(1,durMaxDe(s));h+=barraStat('Estado',f,s.dur<=0&&d.tipo==='roupa'?'rasgada':Math.round(f*100)+'%',f<0.25?'var(--blood)':'');}
  if(s&&s.q!==undefined&&(d.qual||d.tipo==='roupa'))h+=barraStat('Qualidade',(s.q+1)/4,QUAL_NOME[s.q],'var(--grain)');
  if(d.tipo==='arma'&&d.dano){h+=barraStat('Dano',d.dano/55,String(d.dano),'var(--ember)');h+=barraStat('Rapidez',0.3/d.tempo,(1/d.tempo).toFixed(1)+'/s','var(--grain)');if(d.alcance)h+=barraStat('Alcance',d.alcance/3,d.alcance.toFixed(1)+' m','var(--water)');}
  if(d.tipo==='roupa'){const qe=s&&s.q!==undefined?QUAL_EF[s.q]:1;if(d.espaco)h+=barraStat('Espaço',d.espaco/32,'+'+d.espaco,'var(--water)');if(d.bolsos)h+=barraStat('Bolsos',d.bolsos/4,'+'+d.bolsos,'var(--water)');if(d.prot||!d.espaco)h+=barraStat('Proteção',(d.prot||0)*qe/0.25,Math.round((d.prot||0)*qe*100)+'%');
    if(d.quente)h+=barraStat('Calor',d.quente,Math.round(d.quente*qe*100)+'%','var(--grain)');if(d.chuva)h+=barraStat('Chuva',d.chuva,Math.round(d.chuva*100)+'%','var(--water)');if(d.esporos)h+=barraStat('Esporos',d.esporos,Math.round(d.esporos*100)+'%','var(--grain)');if(d.peso)h+=barraStat('Peso',d.peso/3,d.peso.toFixed(1)+' kg','');}
  if(d.fome>0)h+=barraStat('Fome',d.fome/45,'+'+d.fome,'var(--grain)');if(d.sede>0)h+=barraStat('Sede',d.sede/45,'+'+d.sede,'var(--water)');if(d.vida>0)h+=barraStat('Vida',d.vida/65,'+'+d.vida,'var(--blood)');
  return h?'<div class="stats-i">'+h+'</div>':'';}
function reqLinhas(c){return Object.entries(c).map(([k,n])=>{const t=invCount(k),ok=t>=n;return'<div class="req '+(ok?'ok':'falta')+'">'+svgUse(ITEMS[k].icon)+'<span>'+ITEMS[k].nome+'</span><b class="n">'+Math.min(t,999)+'/'+n+'</b></div>';}).join('');}
function slotBtn(i){const s=P.inv[i];return'<button class="slot'+(i<BAR_N?' barra-r':'')+(s?'':' vazio')+'" type="button" data-i="'+i+'" aria-pressed="'+(invSel===i)+'" aria-label="'+(s?ITEMS[s.id].nome+(s.n>1?' × '+s.n:''):'Vazio')+'">'+slotHTML(s,i,i<BAR_N)+'</button>';}
function invRender(){if($('inv').hidden)return;if(invAba==='bau'&&!bauAberto)invAba='mochila';$('aba-bau').hidden=!bauAberto;$('aba-tarefas').hidden=$('aba-nivel').hidden=$('aba-mochila').hidden=$('aba-fabricar').hidden=!!bauAberto;   // baú ou chão aberto: só o menu dele
  for(const a of['mochila','fabricar','tarefas','nivel','bau']){$('aba-'+a).setAttribute('aria-pressed',String(invAba===a));$('inv-'+a).hidden=invAba!==a;}
  $('aba-fab-t').textContent=fabAbaNome();
  if(invAba==='bau'){bauRender();return;}
  if(invAba==='tarefas'){let h='';for(const t of G.tarefas||[]){const T=tarefaDef(t.id);if(!T)continue;
      h+='<div class="receita">'+svgUse('i-alvo')+'<div><b>'+T.txt(t.meta)+'</b><small>'+(T.dica?T.dica+' · ':'')+'Recompensa: '+T.rec.map(r=>r[1]+' '+ITEMS[r[0]].nome.toLowerCase()).join(' e ')+' · '+T.xp+' XP</small>'+
        '<span class="prog"><i style="width:'+Math.round(100*t.n/t.meta)+'%"></i></span></div><span class="cont">'+t.n+'/'+t.meta+'</span></div>';}
    $('lista-tarefas').innerHTML=h||'<p class="vazio-txt">Sem tarefas agora. O rádio manda mais daqui a pouco.</p>';
    $('tar-info').innerHTML='<div class="det-tit">Tarefas do rádio</div><p>Cumpra para ganhar itens e experiência. Quando uma termina, chega outra.</p><p>Tarefas cumpridas: '+(G.tarefaN||0)+'.</p>';return;}
  if(invAba==='nivel'){let h='';for(const p of PERKS){const lv=perk(p.id),cheio=lv>=p.max,ok=G.pontos>0&&!cheio;
      h+='<div class="receita">'+svgUse(p.ico)+'<div><b>'+p.nome+' <span class="nv-t">'+lv+'/'+p.max+'</span></b><small>'+p.desc+'</small></div>'+
        '<button class="btn'+(ok?' prim':'')+'" type="button" data-perk="'+p.id+'"'+(ok?'':' disabled')+'>'+(cheio?'Completo':'Aprender')+'</button></div>';}
    $('lista-perks').innerHTML=h;
    $('niv-info').innerHTML='<div class="det-tit">Nível '+G.nivel+'</div><p>Experiência: '+G.xp+' de '+xpProx()+'.</p><p>'+(G.pontos>0?'Você tem <b>'+G.pontos+'</b> '+(G.pontos>1?'pontos':'ponto')+' para gastar.':'Ganhe experiência matando zumbis, revistando lugares, construindo, fabricando e sobrevivendo às noites.')+'</p>';return;}
  if(invAba==='mochila'){mochilaRender();return;}
  fabRender();}
/* aba mochila: vestindo à esquerda, bolsos e mochila no meio, detalhes à direita */
function mochilaRender(){const lim=invLimite();
  let h='<span class="rot-grade">Vestindo</span><div class="equip">';const area={cabeca:'a',rosto:'b',camiseta:'c',tronco:'d',maos:'e',cintura:'f',pernas:'g',pes:'h',costas:'i'};
  for(const k of ROUPA_SLOTS){const id=P.roupa[k],I=id&&ITEMS[id].durMax?roupaInfoDe(k):null,rasg=I&&I.dur<=0;h+='<button class="slot roupa'+(id?'':' vazio')+(rasg?' rasgada':'')+'" style="grid-area:'+area[k]+'" type="button" data-r="'+k+'" aria-pressed="'+(roupaSel===k)+'" aria-label="'+ROUPA_NOME[k]+': '+(id?ITEMS[id].nome:'nada')+'" title="'+ROUPA_NOME[k]+'">'+svgUse(id?ITEMS[id].icon:ROUPA_ICO[k])+'</button>';}
  h+='<div class="equip-v" style="grid-area:j"><b>'+Math.round(protecao()*100)+'%</b><small>Proteção</small></div><div class="equip-v" style="grid-area:k"><b>'+Math.round(calorRoupa()*100)+'%</b><small>Calor</small></div><div class="equip-v" style="grid-area:l"><b>'+Math.round(chuvaRoupa()*100)+'%</b><small>Chuva</small></div></div>';
  $('inv-equip').innerHTML=h;
  h='<span class="rot-barra">Na mão</span>';for(let i=0;i<INV_N;i++){if(i===BAR_N)h+='<span class="rot-barra">Bolsos</span>';
    if(i===BAR_N+BOLSOS)h+='<span class="rot-barra">'+(P.roupa.costas?ITEMS[P.roupa.costas].nome:'Mochila · faça uma na bancada')+'</span>';
    if(i>=lim){h+='<button class="slot travado" type="button" disabled aria-label="'+(P.roupa.costas?'Precisa da mochila reforçada':'Precisa de mochila')+'">'+svgUse(P.roupa.costas?'i-cadeado':'i-mochila')+'</button>';continue;}
    h+=slotBtn(i);}
  $('grade').innerHTML=h;$('inv-cap').textContent='Livre '+invSpace()+' de '+lim;
  const det=$('detalhe');
  if(roupaSel&&P.roupa[roupaSel]){const id=P.roupa[roupaSel],d=ITEMS[id];
    const I=roupaInfoDe(roupaSel),ci=d.durMax?consertoInfo(roupaSel):null;let h3=detTopo(nomeItem(I),d.icon,'Vestindo · '+ROUPA_NOME[roupaSel])+'<p>'+d.desc+'</p>'+statsItem(I,d)+(I&&I.rep?'<p class="det-nota">'+svgUse('i-remendo')+'<span>Consertada '+I.rep+'× fora da estação: máximo '+Math.round(durMaxDe(I)/d.durMax/QUAL_DUR[I.q??1]*100)+'%</span></p>':'');
    if(ci&&!ci.vazio)h3+='<p class="det-nota">'+svgUse('i-agulha')+'<span>Conserto: '+custoLista(ci.c)+(ci.metal?' · na bancada':' · precisa de agulha'+(ci.est?' (na estação: sem perder o máximo)':''))+'</span></p>';
    det.innerHTML=h3+'<div class="det-acoes">'+(ci&&!ci.vazio?'<button class="btn prim" type="button" data-acao="consertarR"'+(ci.ok?'':' disabled')+'>'+svgUse('i-agulha')+'Consertar</button>':'')+'<button class="btn" type="button" data-acao="tirar">Tirar</button></div>';return;}
  const s=invSel>=0?P.inv[invSel]:null;
  if(!s){det.innerHTML='<div class="det-tit">Mochila</div><p>Toque num item para ver o que ele faz. Toque em outro espaço para mover ou trocar de lugar. O que está em <b>Na mão</b> é a barra rápida.</p>'+(P.roupa.costas?'':'<p class="msg-falta">Sem mochila você só tem os bolsos. Faça uma na bancada da clareira.</p>');return;}
  const d=ITEMS[s.id];let h2=detTopo(nomeItem(s)+(s.n>1?' × '+s.n:''),d.icon,TIPO_NOME[d.tipo]||'')+'<p>'+d.desc+'</p>'+statsItem(s,d);
  if(d.fogo)h2+='<p>No pente: '+s.mun+' de '+d.pente+'. Na mochila: '+invCount(d.municao)+'.</p>';
  if(d.cantil)h2+='<p>No cantil: <b>'+cantilTexto(s)+'</b>.</p>';
  if(d.arco)h2+='<p>Flechas na mochila: '+invCount('flecha')+'.</p>';
  const cc=custoConserto(s),temConserto=!!(cc&&Object.keys(cc).length),ret=retornoDesmonte(s),banc=pertoBancada();
  if(temConserto)h2+='<p class="det-nota">'+svgUse('i-chave')+'<span>Conserto: '+custoLista(cc)+(banc?'':' · só na bancada')+'</span></p>';
  if(ret)h2+='<p class="det-nota">'+svgUse('i-desmontar')+'<span>Desmontar devolve: '+custoLista(ret)+'</span></p>';
  let bt='';
  if(d.tipo==='roupa'){bt+='<button class="btn prim" type="button" data-acao="vestir">Vestir</button>';const ci=d.durMax?consertoInfo(invSel):null;if(ci&&!ci.vazio){h2+='<p class="det-nota">'+svgUse('i-agulha')+'<span>Conserto: '+custoLista(ci.c)+(ci.metal?' · na bancada':' · precisa de agulha')+'</span></p>';bt+='<button class="btn" type="button" data-acao="consertarI"'+(ci.ok?'':' disabled')+'>'+svgUse('i-agulha')+'Consertar</button>';}}
  if(d.tipo==='comida'||d.tipo==='bebida'||d.tipo==='cura')bt+='<button class="btn prim" type="button" data-acao="usar">'+(d.tipo==='comida'?'Comer':d.tipo==='bebida'?'Beber':'Usar')+'</button>';
  if(d.tipo==='arma'&&invSel>=BAR_N)bt+='<button class="btn prim" type="button" data-acao="barra">Pôr na mão</button>';
  if((d.tipo==='util'||d.acaoExtra)&&d.acao)bt+='<button class="btn prim" type="button" data-acao="util">'+d.acao+'</button>';
  if(temConserto)bt+='<button class="btn" type="button" data-acao="consertar"'+(banc&&invHas(cc)?'':' disabled')+'>'+svgUse('i-chave')+'Consertar</button>';
  if(s.n>1)bt+='<button class="btn" type="button" data-acao="dividir"'+(invSpace()?'':' disabled')+'>'+svgUse('i-dividir')+'Dividir</button>';
  if(ret)bt+='<button class="btn'+(desmPend===invSel?' perigo largo':'')+'" type="button" data-acao="desmontar">'+svgUse('i-desmontar')+(desmPend===invSel?'Confirmar: desmontar':'Desmontar')+'</button>';
  if(d.tipo!=='missao')bt+='<button class="btn perigo" type="button" data-acao="largar">Largar</button>';
  det.innerHTML=h2+'<div class="det-acoes">'+bt+'</div>';}
/* aba fabricar: categorias à esquerda, receitas no meio, detalhes à direita e as melhorias da bancada embaixo */
function receitasVisiveis(){const v=[];for(let i=0;i<RECIPES.length;i++){const r=RECIPES[i];if((fabCat==='todas'||r.cat===fabCat)&&receitaVisivel(r))v.push(i);}return v;}
function fabRender(){const banc=pertoBancada();
  let h='';for(const[k,n,ic]of FAB_CATS){const q=RECIPES.filter(r=>(k==='todas'||r.cat===k)&&receitaVisivel(r)&&podeFabricar(r)).length;
    h+='<button class="cat" type="button" data-cat="'+k+'" aria-pressed="'+(fabCat===k)+'" aria-label="'+n+'">'+svgUse(ic)+'<span>'+n+'</span>'+(q?'<em>'+q+'</em>':'')+'</button>';}
  $('fab-cats').innerHTML=h;
  const vis=receitasVisiveis();if(!vis.includes(fabSel)){const p=vis.find(i=>podeFabricar(RECIPES[i]));fabSel=p!==undefined?p:(vis.length?vis[0]:-1);}
  h='';for(const i of vis){const r=RECIPES[i],d=ITEMS[r.faz],st=receitaEstado(r),pode=podeFabricar(r);
    h+='<button class="tile'+(pode?' pode':'')+(st==='travada'?' trav':'')+'" type="button" data-k="'+i+'" aria-pressed="'+(fabSel===i)+'" aria-label="'+d.nome+(st==='travada'?' (bloqueada)':'')+'">'+svgUse(d.icon)+'<span>'+(r.nome||d.nome)+(r.n>1?' ×'+r.n:'')+'</span>'+(st==='travada'?svgUse('i-cadeado','cad'):r.est?svgUse(estIcone(r.est),'est'):'')+'</button>';}
  $('receitas').innerHTML=h;
  {const dk=$('fab-dica');if(dk){dk.hidden=banc;if(!banc)dk.textContent='Longe da bancada você faz só o básico de sobrevivência na mão. Tábuas, munição, armas e o resto ficam na bancada: use a da clareira ou construa uma (B → Bancada de trabalho: 6 madeira, 4 pedras e 2 cordas).';}}
  $('fab-cap').textContent=RECIPES.filter(receitaLiberada).length+' de '+RECIPES.length+' liberadas';
  const cn=FAB_CATS.find(c=>c[0]===fabCat);$('fab-tit').textContent=(fabCat==='todas'?'Receitas':cn[1])+' · '+(pertoEstacao('couro')?'na estação de couro':banc?(G.fab.nv>=2?'na oficina':'na bancada'):'na mão');
  fabDetalhe();fabNivel();}
function fabDetalhe(){const el=$('fab-info'),r=RECIPES[fabSel];if(!r){el.innerHTML='<div class="det-tit">Fabricar</div><p>Nenhuma receita aqui.</p>';return;}
  const d=ITEMS[r.faz],st=receitaEstado(r),{c}=custoReceita(r);
  // quantidade: volta para 1 ao trocar de receita; os materiais mostram o total da quantidade escolhida
  if(fabQtdDe!==fabSel){fabQtdDe=fabSel;fabQtd=1;}const qMax=Math.max(1,fabMaximo(r));fabQtd=clamp(fabQtd,1,qMax);const cq={};for(const k in c)cq[k]=c[k]*fabQtd;
  let h=detTopo((r.nome||d.nome)+(r.n>1?' × '+r.n:''),d.icon,null);
  h+='<div class="chips"><span class="chip-e e'+r.etapa+'">'+ETAPA_NOME[r.etapa]+'</span><span class="chip-e">'+estNome(r.est)+'</span>'+(st==='nova'?'<span class="chip-e nova">Descoberta</span>':'')+'</div>';
  h+='<p>'+d.desc+'</p>';
  if(st==='travada')h+='<div class="trava">'+svgUse('i-cadeado')+'<p><b>Bloqueada.</b> '+desbTexto(r)+'</p></div>';
  h+='<span class="rot-grade">Materiais'+(fabQtd>1?' · para '+fabQtd:'')+'</span><div class="reqs">'+reqLinhas(cq)+'</div>';
  if(r.alt)h+='<p class="det-nota">'+svgUse('i-dividir')+'<span>'+Object.keys(r.alt).map(k=>'No lugar de '+r.custo[k]+' '+ITEMS[k].nome.toLowerCase()+', serve '+r.alt[k][1]+' '+ITEMS[r.alt[k][0]].nome.toLowerCase()).join('. ')+'.</span></p>';
  if(r.est){const ok=estacaoOk(r);h+='<div class="req '+(ok?'ok':'falta')+'">'+svgUse(estIcone(r.est))+'<span>Precisa de '+(typeof r.est==='string'?ESTACOES[r.est].chip.toLowerCase():r.est>1?'oficina':'bancada')+'</span><b class="n">'+(ok?'Sim':'Não')+'</b></div>';}
  {const qs=qualEsperada(c);
   h+='<span class="rot-grade">Resultado</span>'+statsItem(qs!==null&&(d.tipo==='roupa'||d.qual)?{id:r.faz,q:qs,dur:durMaxDe({id:r.faz,q:qs})}:null,d)+'<p class="det-nota">'+svgUse('i-relogio')+'<span>Tempo: na hora'+(qs!==null&&(d.tipo==='roupa'||d.qual)?' · qualidade esperada: '+QUAL_NOME[qs].toLowerCase()+' (usa o seu melhor material)':'')+'</span></p>';}
  if(r.ferramenta){const ok=ferramentaOk(r);h+='<div class="req '+(ok?'ok':'falta')+'">'+svgUse('i-faca')+'<span>Precisa de lâmina</span><b class="n">'+(ok?'Sim':'Não')+'</b></div>';}
  const pode=podeFabricar(r);
  if(pode)h+='<div class="fab-qtd"><span class="rot">Quantidade</span><button type="button" data-qtd="-1" aria-label="Menos"'+(fabQtd<=1?' disabled':'')+'>−</button><span class="n">'+fabQtd+'</span>'+
    '<button type="button" data-qtd="1" aria-label="Mais"'+(fabQtd>=qMax?' disabled':'')+'>+</button><button type="button" class="max" data-qtd="max"'+(fabQtd>=qMax?' disabled':'')+'>Máx · '+qMax+'</button></div>';
  h+='<button class="btn prim grande" type="button" data-fab="'+fabSel+'"'+(pode?'':' disabled')+'>Fabricar'+(pode&&fabQtd>1?' × '+fabQtd:'')+'</button>';
  if(!pode&&st!=='travada'){const m=motivoFalta(r);if(m)h+='<p class="msg-falta">'+m+'</p>';}
  el.innerHTML=h;}
function fabNivel(){const el=$('fab-nv'),nv=G.fab.nv,banc=pertoBancada(),man=!!G.fab.manuais.manualMecanico;
  const mats=Object.entries(OFICINA_CUSTO).map(([k,n])=>{const t=invCount(k);return'<span class="'+(t>=n?'k':'f')+'">'+ITEMS[k].nome+' '+Math.min(t,99)+'/'+n+'</span>';}).join(' · ');
  let h='<span class="rot-grade">Melhorias da bancada</span><div class="nvs">'+
    '<div class="nv feito">'+svgUse('i-martelo')+'<div><b>Nível 1 · Bancada</b><small>'+(nv===1?'Atual':'Feito')+'</small></div></div>'+
    '<div class="nv '+(nv>=2?'feito':'prox')+'">'+svgUse('i-oficina')+'<div><b>Nível 2 · Oficina</b><small>'+(nv>=2?'Atual: mochila reforçada, taco com pregos e munição':man?mats:'Precisa do Manual do mecânico')+'</small></div></div>'+
    '<div class="nv trav">'+svgUse('i-cadeado')+'<div><b>Nível 3 · Em breve</b><small>Peças da base militar, numa próxima atualização</small></div></div></div>';
  if(nv<2){const f=oficinaFalta();h+='<button class="btn'+(f.length?'':' prim')+'" type="button" data-nv="2"'+(f.length?' disabled':'')+'>'+svgUse('i-subir')+'Melhorar</button>';
    h+='<p class="nv-msg">'+(!man?'O Manual do mecânico está na oficina do posto de gasolina.':!banc?'Chegue perto de uma bancada (a da clareira ou uma construída) para melhorar.':!invHas(OFICINA_CUSTO)?'Faltam: '+faltaLista(OFICINA_CUSTO)+'.':'Tudo pronto: toque em Melhorar.')+'</p>';}
  el.innerHTML=h;}
/* aba baú: sua mochila e o baú lado a lado, com transferência rápida */
function bauRender(){const B=bauAberto.itens,lim=invLimite(),sq=!!bauAberto.saque,nome=bauAberto.nome||'Baú';let h='';
  for(let i=0;i<B.length;i++){const s=B[i];h+='<button class="slot'+(s?'':' vazio')+'" type="button" data-b="'+i+'" aria-label="'+(s?ITEMS[s.id].nome+(s.n>1?' × '+s.n:''):'Vazio')+'">'+slotHTML(s,i,false)+'</button>';}
  $('grade-bau').innerHTML=h;h='';
  for(let i=0;i<lim;i++){const s=P.inv[i];h+='<button class="slot'+(i<BAR_N?' barra-r':'')+(s?'':' vazio')+'" type="button" data-i="'+i+'" aria-label="'+(s?ITEMS[s.id].nome:'Vazio')+'">'+slotHTML(s,i,false)+'</button>';}
  $('grade-bau-inv').innerHTML=h;const usados=B.filter(Boolean).length;
  $('bau-cap').textContent=usados+' de '+B.length;$('bau-cap-inv').textContent='Livre '+invSpace()+' de '+lim;$('bau-tit').textContent=nome;$('aba-bau-t').textContent=sq?'Caixa':'Baú';
  if(bauAberto.chao||bauAberto.achados){const ch=!!bauAberto.chao;$('aba-bau-t').textContent=ch?'Chão':'Achados';
    $('bau-info').innerHTML=detTopo(ch?'Itens no chão':'O que você achou',ch?'i-mochila':'i-bau',usados?usados+(usados>1?' coisas':' coisa'):'nada')+(bauAberto.origem?'<p><small>'+bauAberto.origem+'</small></p>':'')+
      '<p>Toque num item para pegar. Mochila cheia? Toque num item da mochila para deixar '+(ch?'no chão':'aqui')+' e abrir espaço.'+(ch?'':' O que você não pegar fica no chão.')+'</p>'+(bauMsg?'<p class="msg-falta">'+bauMsg+'</p>':'')+
      (usados?'<div class="det-acoes col"><button class="btn prim" type="button" data-bau="pegar">Pegar tudo</button></div>':'');return;}
  if(sq){$('bau-info').innerHTML=detTopo(nome,'i-bau',usados?usados+(usados>1?' coisas':' coisa'):'vazia')+'<p>'+(usados?'Toque num item para pegar, ou pegue tudo de uma vez.':'Você pegou tudo. Daqui a um tempo outra caixa aparece em outro canto da mata.')+'</p>'+(bauMsg?'<p class="msg-falta">'+bauMsg+'</p>':'')+
      (usados?'<div class="det-acoes col"><button class="btn prim" type="button" data-bau="pegar">Pegar tudo</button></div>':'');return;}
  $('bau-info').innerHTML=detTopo('Baú','i-bau','Espaços '+usados+'/'+B.length)+'<p>Toque num item para passar de um lado para o outro. O que fica no baú não se perde quando você cai.</p>'+(bauMsg?'<p class="msg-falta">'+bauMsg+'</p>':'')+
    '<div class="det-acoes col"><button class="btn prim" type="button" data-bau="guardar">Guardar tudo</button><button class="btn" type="button" data-bau="materiais">Guardar materiais</button><button class="btn" type="button" data-bau="pegar">Pegar tudo</button></div><p><small>Guardar não mexe no que está na mão.</small></p>';}
function tocarSlot(i){roupaSel=null;desmPend=-1;if(invSel<0){if(P.inv[i])invSel=i;}else if(invSel===i)invSel=-1;else{const t=P.inv[i];P.inv[i]=P.inv[invSel];P.inv[invSel]=t;invSel=-1;sfx('clique');}invRender();}
$('inv-equip').addEventListener('click',e=>{const b=e.target.closest('.slot');if(!b||!b.dataset.r)return;const k=b.dataset.r;invSel=-1;desmPend=-1;roupaSel=roupaSel===k||!P.roupa[k]?null:k;if(!P.roupa[k])feed('Nada vestido: '+ROUPA_NOME[k].toLowerCase());invRender();});
$('grade').addEventListener('click',e=>{const b=e.target.closest('.slot');if(!b||b.disabled||b.dataset.i===undefined)return;tocarSlot(+b.dataset.i);});
$('detalhe').addEventListener('click',e=>{const b=e.target.closest('[data-acao]');if(!b||b.disabled)return;const a=b.dataset.acao;
  if(a==='tirar'){if(roupaSel&&tirarRoupa(roupaSel))roupaSel=null;invRender();hudBarra();return;}
  if(a==='consertarR'){if(roupaSel)consertarRoupa(roupaSel);invRender();hudBarra();return;}
  if(a==='consertarI'){if(invSel>=0)consertarRoupa(invSel);invRender();hudBarra();return;}
  if(invSel<0)return;const s=P.inv[invSel];if(!s)return;
  if(a==='desmontar'&&desmPend!==invSel){desmPend=invSel;invRender();return;}
  desmPend=-1;
  if(a==='vestir'){vestir(invSel);invSel=-1;}
  else if(a==='usar'){usarItem(invSel);if(!P.inv[invSel])invSel=-1;}
  else if(a==='barra'){let j=P.inv.findIndex((x,k)=>k<BAR_N&&!x);if(j<0)j=P.sel;const t=P.inv[j];P.inv[j]=s;P.inv[invSel]=t;invSel=-1;}
  else if(a==='consertar')consertar(invSel);
  else if(a==='util'){const i=invSel;usarUtil(i);if(!P.inv[i])invSel=-1;}
  else if(a==='dividir'){const lim=invLimite(),j=P.inv.findIndex((x,k)=>k>=BAR_N&&k<lim&&!x);if(j>=0&&s.n>1){const m=Math.floor(s.n/2);s.n-=m;P.inv[j]=Object.assign(newItem(s.id,m),exDe(s)||{});sfx('clique');}}
  else if(a==='desmontar'){desmontar(invSel);invSel=-1;}
  else if(a==='largar'){soltarItens([[s.id,s.n,exDe(s)]],P.x+Math.sin(P.body)*0.8,P.z+Math.cos(P.body)*0.8,P.y);P.inv[invSel]=null;invSel=-1;}
  invRender();hudBarra();});
$('fab-cats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;fabCat=b.dataset.cat;fabSel=-1;sfx('clique');invRender();});
$('receitas').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;fabSel=+b.dataset.k;sfx('clique');invRender();});
$('receitas').addEventListener('dblclick',e=>{const b=e.target.closest('[data-k]');if(b)fabricar(+b.dataset.k);});
$('fab-info').addEventListener('click',e=>{const q=e.target.closest('[data-qtd]');
  if(q){if(q.disabled)return;const r=RECIPES[fabSel],mx=r?Math.max(1,fabMaximo(r)):1;fabQtd=q.dataset.qtd==='max'?mx:clamp(fabQtd+(+q.dataset.qtd),1,mx);sfx('clique');fabDetalhe();return;}
  const b=e.target.closest('[data-fab]');if(b&&!b.disabled)fabricarVarios(+b.dataset.fab,fabQtd);});
$('fab-nv').addEventListener('click',e=>{const b=e.target.closest('[data-nv]');if(b&&!b.disabled)melhorarBancada();});
for(const a of['mochila','fabricar','tarefas','nivel','bau'])$('aba-'+a).addEventListener('click',()=>{invAba=a;invSel=-1;roupaSel=null;desmPend=-1;invRender();});
$('grade-bau').addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b||!bauAberto)return;const j=+b.dataset.b;if(!bauAberto.itens[j])return;
  if(bauPegar(j)){bauMsg='';sfx('pegar');}else bauMsg='A mochila está cheia.';invRender();hudBarra();});
$('grade-bau-inv').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b||!bauAberto)return;const i=+b.dataset.i;if(!P.inv[i])return;
  if(bauGuardar(i)){bauMsg='';sfx('clique');}else bauMsg='O baú está cheio.';invRender();hudBarra();});
$('bau-info').addEventListener('click',e=>{const b=e.target.closest('[data-bau]');if(!b||!bauAberto)return;bauMsg='';const m=b.dataset.bau;
  if(m==='guardar'||m==='materiais'){for(let i=BAR_N;i<INV_N;i++){const s=P.inv[i];if(!s||(m==='materiais'&&ITEMS[s.id].tipo!=='material'))continue;if(!bauGuardar(i)){bauMsg='O baú está cheio.';break;}}}
  else{for(let j=0;j<bauAberto.itens.length;j++)if(!bauPegar(j)){bauMsg='A mochila está cheia.';break;}}
  sfx('pegar');invRender();hudBarra();});
$('lista-perks').addEventListener('click',e=>{const b=e.target.closest('[data-perk]');if(b)aprender(b.dataset.perk);});
$('inv-x').addEventListener('click',()=>{fecharMochila();pedirTrava();});

/* ---------- construção ---------- */
/* menu de construção: abas por tipo (com ícone) e uma fileira de cartões só com as peças da aba (ícone e nome);
   embaixo, a peça escolhida com o custo (ícone de cada material; o que falta em vermelho, com quanto você tem).
   Com 10 peças ou menos não há abas. */
const OBRA_CATS=[
  {id:'muros',nome:'Muros',ico:'i-muro',t:['barricada','muro','muroPedra','muroFerro','portao','portaoFerro']},
  {id:'defesa',nome:'Defesa',ico:'i-estacas',t:['estacas','espetosFerro','arame','latas','torreVigia','redeCamuflagem']},
  {id:'casa',nome:'Casa',ico:'i-telhado',t:['pilar','plataforma','paredeCasa','portaMadeira','janela','escadaMadeira','escadaInterna','parapeito','paredeAlta','janelaAlta','escadaCorda','ponteCorda','telhado','prancha','tabuasPorta','tabuasJanela']},
  {id:'base',nome:'Base',ico:'i-fogueira',t:['fogueira','bau','lamparina','cama','despensa','armarioFerro','gerador','poste','antenaBase']},
  {id:'oficina',nome:'Oficina',ico:'i-oficina',t:['bancadaTrab','estacaoCouro','bancadaArmas','fornalha','defumador']},
  {id:'plantio',nome:'Plantio',ico:'i-horta',t:['horta','coletor','estufa'].concat(typeof POMAR!=='undefined'?Object.keys(POMAR):[])}];
const obraCat=k=>{for(const c of OBRA_CATS)if(c.t.includes(k))return c.id;return'base';};
/* todas as peças do lugar, aba por aba (é a ordem da roda do mouse); peça sem aba conhecida vai para Base */
function obrasOrdem(){const V=obrasVisiveis(),out=[];for(const c of OBRA_CATS){for(const k of c.t)if(V.includes(k))out.push(k);
  if(c.id==='base')for(const k of V)if(!OBRA_CATS.some(q=>q.t.includes(k)))out.push(k);}return out;}
const obrasComAbas=()=>obrasVisiveis().length>10;
/* as peças que aparecem agora (a aba da peça escolhida): as teclas 1 a 9 e 0 escolhem entre elas */
function obrasDaAba(){const L=obrasOrdem();if(!obrasComAbas())return L;const c=obraCat(OBRA.tipo);return L.filter(k=>obraCat(k)===c);}
const obraNomeCurto=D=>D.nome.replace(' de madeira','').replace(' de pedra',' pedra');
/* a linha de baixo: nome da peça e o custo, com o ícone de cada material; o que falta fica vermelho, com quanto você tem */
function obraNomeHTML(k){const D=OBRAS[k];if(!obraLiberada(k))return'<b>'+D.nome+'</b><span class="cc trava">'+svgUse('i-cadeado')+travaObra(k).replace(/^ · /,'')+'</span>';
  const hp=D.hp?Math.round(D.hp*(1+0.25*(perk('constr')||0))):0;
  return'<b>'+D.nome+'</b>'+(hp?'<span class="cc vida" title="Vida da peça">'+svgUse('i-escudo')+hp+'</span>':'')+Object.entries(custoObra(k)).map(([i,n])=>{const t=invCount(i),I=ITEMS[i];return'<span class="cc'+(t<n?' f':'')+'">'+svgUse(I.icon||'i-peca')+n+' '+I.nome.toLowerCase()+(t<n?' <small>(tem '+t+')</small>':'')+'</span>';}).join('');}
function hudObras(){const on=OBRA.ativo;$('obras').hidden=!on;$('obra-acoes').hidden=!on;slotsEl.hidden=on;$('item-nome').closest('.barra').classList.toggle('construindo',on);
  if(!on){$('obra-cats').hidden=true;$('item-nome').textContent=selDef()?selDef().nome:maosVaziasTxt();return;}
  // guarda o mesmo contexto que obraAlvo compara (antes guardava verdadeiro/falso, e o menu era refeito a cada quadro: o clique às vezes se perdia)
  OBRA.ctx=contextoObra();motivoMostrado=null;const L=obrasOrdem();if(!L.includes(OBRA.tipo))OBRA.tipo=L[0];
  OBRA.tipoMostrado=OBRA.tipo;const abas=obrasComAbas(),cat=obraCat(OBRA.tipo);(OBRA.ultimo||(OBRA.ultimo={}))[cat]=OBRA.tipo;
  $('item-nome').innerHTML=obraNomeHTML(OBRA.tipo);
  const ce=$('obra-cats');ce.hidden=!abas;
  if(abas){let h='';for(const c of OBRA_CATS){if(!L.some(k=>obraCat(k)===c.id))continue;h+='<button class="obra-cat" type="button" role="tab" data-cat="'+c.id+'" aria-selected="'+(c.id===cat)+'">'+svgUse(c.ico)+'<span>'+c.nome+'</span></button>';}ce.innerHTML=h;}
  let h='',ix=0;for(const k of L){const D=OBRAS[k],lib=obraLiberada(k),ck=custoObra(k),tem=lib&&invHas(ck),vis=!abas||obraCat(k)===cat;
    const tecla=vis&&cfg.tela==='pc'&&ix<10?'<i class="obra-tecla">'+(ix===9?0:ix+1)+'</i>':'';if(vis)ix++;
    const nome=D.nome+(lib?': '+custoTxt(ck):travaObra(k));
    h+='<button class="obra'+(tem?'':' falta')+(lib?'':' trav')+'" type="button" data-o="'+k+'" aria-pressed="'+(OBRA.tipo===k)+'" aria-label="'+nome+'" title="'+nome+'"'+(vis?'':' hidden')+'>'+tecla+svgUse(lib?D.icon:'i-cadeado')+'<b>'+obraNomeCurto(D)+'</b></button>';}
  $('obras').innerHTML=h;{const b=$('obras').querySelector('[aria-pressed="true"]');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest',inline:'nearest'});}}
$('obra-cats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;const c=b.dataset.cat,L=obrasOrdem().filter(k=>obraCat(k)===c);if(!L.length)return;
  const u=OBRA.ultimo&&OBRA.ultimo[c];OBRA.tipo=L.includes(u)?u:L[0];motivoMostrado=null;hudObras();sfx('clique');});
/* motivo de não caber, mostrado no nome da obra enquanto mira */
let motivoMostrado=null;function hudMotivo(){const m=OBRA.ok?'':OBRA.motivo||'';if(m===motivoMostrado)return;motivoMostrado=m;const D=OBRAS[OBRA.tipo];
  if(m)$('item-nome').innerHTML='<b>'+D.nome+'</b><span class="cc motivo">'+svgUse('i-alerta')+m+'</span>';else $('item-nome').innerHTML=obraNomeHTML(OBRA.tipo);}
function custoCurto(c){return Object.entries(c).map(([k,n])=>'<span class="'+(invCount(k)<n?'f':'')+'">'+n+' '+ITEMS[k].nome.toLowerCase().split(' ')[0]+'</span>').join(' ');}
function custoTxt(c){return Object.entries(c).map(([k,n])=>n+' '+ITEMS[k].nome.toLowerCase()).join(' + ');}
function modoObra(on){OBRA.ativo=on===undefined?!OBRA.ativo:on;IN.attack=false;if(OBRA.ativo){OBRA.rot=0;dica('obra3','corpo',cfg.tela==='pc'?'Construção: as abas (Muros, Defesa, Casa, Base...) separam as peças; a roda do mouse passa por todas, e as teclas 1 a 9 escolhem na aba; R (ou Shift + roda) gira; clique para colocar; B sai.':'Escolha a aba e a peça embaixo, mire onde quer construir, toque em Girar e depois em Construir.');}hudBarra();hudObras();}
$('obras').addEventListener('click',e=>{const b=e.target.closest('[data-o]');if(b){OBRA.tipo=b.dataset.o;motivoMostrado=null;hudObras();sfx('clique');}});
$('o-girar').addEventListener('click',()=>{OBRA.rot+=Math.PI/4;sfx('clique');});$('o-colocar').addEventListener('click',colocarObra);$('o-sair').addEventListener('click',()=>modoObra(false));

/* ---------- HUD por quadro ---------- */
const teclasEl=document.querySelector('.teclas');const stEls={};for(const k of['vida','fome','sede','energia','sono']){const el=$('st-'+k);if(!el)continue;stEls[k]={el,bar:k==='vida'?el.querySelector('.vida-bar i'):el.querySelector('circle.pr'),num:el.querySelector('b'),last:-1};}
let hudAcc=0,mapAcc=0,ruidoLvl=-1,promptAlvo=null;
function hudDia(){const n=G.noite;$('dia-i').setAttribute('href',n?'#i-lua':'#i-sol');$('dia-nome').textContent=n?'Noite '+G.noiteN:'Dia '+G.dia;}
/* mão vazia mas com arma ou ferramenta na barra: diz em que tecla ela está (evita achar que o machado sumiu) */
function maosVaziasTxt(){for(let i=0;i<BAR_N;i++){const s=P.inv[i],D=s&&ITEMS[s.id];if(D&&(D.tipo==='arma'||D.mao))return'Mãos vazias · '+D.nome.toLowerCase()+' na tecla '+(i+1);}return'Mãos vazias';}
/* HUD mais limpo no PC: o cartão da missão encolhe (só o objetivo) depois de uns segundos sem mudar e volta inteiro quando algo muda */
let missaoChave='',missaoT=0;
HUDS.push(function missaoCompacta(dt){const el=$('missao');if(!el||el.hidden)return;const ch=$('missao-n').textContent+'|'+$('missao-t').textContent+'|'+($('missao-tar')?$('missao-tar').textContent:'');
  if(ch!==missaoChave){missaoChave=ch;missaoT=0;el.classList.remove('compacto');return;}missaoT+=dt||0;if(missaoT>12&&cfg.tela==='pc'&&!el.classList.contains('compacto'))el.classList.add('compacto');});
function hudMissao(pisca){const mi=missaoInfo();if(pisca){missaoChave='';}$('missao').hidden=false;$('missao-n').textContent=mi.n;$('missao-t').textContent=mi.t;
  if(pisca){const el=$('missao');el.style.borderColor='var(--ember)';setTimeout(()=>el.style.borderColor='',1500);}}
function updateHUD(dt,horda){hudAcc+=dt;
  for(const k in stEls){const v=Math.round(P[k]),s=stEls[k],mx=k==='vida'?vidaMax():100;if(v!==s.last||s.mx!==mx){s.last=v;s.mx=mx;const f=clamp(v/mx,0,1);
    if(k==='vida')s.bar.style.transform='scaleX('+f+')';else s.bar.style.strokeDashoffset=String(94.25*(1-f));s.num.textContent=v;s.el.classList.toggle('baixo',v<mx*0.25);}}
  hudBussola();
  const lvl=clamp(Math.round((P.ruidoK||0)/12),0,5);P.ruidoK=Math.max(0,(P.ruidoK||0)-dt*18);
  if(lvl!==ruidoLvl){ruidoLvl=lvl;$('barulho').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('on',i<lvl));}
  if(hudAcc>0.25){hudAcc=0;const h=G.hora;$('dia-sub').textContent=fmtHora(h);
    let falta,txt;if(G.noite){falta=(6-h+24)%24;txt='amanhece em '+Math.ceil(falta)+'h';}else{falta=(20-h+24)%24;txt='anoitece em '+(falta<1?Math.ceil(falta*60)+' min':Math.ceil(falta)+'h');}$('dia-tempo').textContent=txt;
    const chip=$('dia-chip');if(G.noite){chip.classList.remove('calmo');chip.textContent=(G.final?'Noite final · ':'Horda: ')+horda;}else{chip.classList.add('calmo');chip.textContent=h>=18?'Prepare a defesa':'Explore e colete';}
    hudDia();hudTarefa();hudXP(0);const mi=missaoInfo();$('missao-t').textContent=mi.t;$('missao-n').textContent=mi.n;
    const alvo=mi.alvo;$('missao-d').textContent=alvo?Math.round(Math.hypot(alvo.x-P.x,alvo.z-P.z))+' m · '+direcao(alvo.x-P.x,alvo.z-P.z):'';
    teclasEl.classList.toggle('some',G.t-sessIni>240);hudExtras();hudArma();$('a-correr').setAttribute('aria-pressed',String(IN.run));$('a-agachar').setAttribute('aria-pressed',String(!!P.agachado));$('u-lanterna').setAttribute('aria-pressed',String(P.lanterna));}
  mapAcc+=dt;if(mapAcc>0.1){mapAcc=0;drawMap();if(CARRO.ativo){$('pc-vel').textContent=Math.round(Math.abs(CARRO.v)*3.6);$('pc-comb').style.width=Math.round(CARRO.comb)+'%';$('pc-hp').textContent='Lataria '+Math.round(CARRO.hp)+'%';$('pc-comb').classList.toggle('pouco',CARRO.comb<20);}}hudMarca();hudChefe();
  // mira, alvo e prompt
  acertoT=Math.max(0,acertoT-dt);const mira=$('mira');mira.classList.toggle('escondido',lunetaAtiva()||!(G.modo==='jogo'&&P.alive&&(cfg.cam==='1'||(selDef()&&(selDef().fogo||selDef().arco||selDef().arremesso)&&P.aim>0.3)||OBRA.ativo)));
  {const pa=P.acao&&P.acao.tipo==='arco'?P.acao.puxa:0;mira.style.setProperty('--puxa',pa.toFixed(2));mira.classList.toggle('puxando',pa>0);mira.classList.toggle('cheio',pa>=1);}mira.classList.toggle('acerto',acertoT>0);
  alvoInter=OBRA.ativo?null:interAtual();const info=textoInter(alvoInter),pr=$('prompt');
  if(info&&G.modo==='jogo'){const a0=alvoInter,o=a0.k==='via'?(a0.o.u?a0.o.v.topo:a0.o.v.base):a0.o;const pt=project([o.x,(o.y??ground(o.x,o.z))+1.25,o.z]);
    if(pt){pr.classList.remove('escondido');{const kb=pr.querySelector('kbd');const tk=info.tecla||'E';if(kb&&kb.textContent!==tk)kb.textContent=tk;}$('prompt-t').textContent=info.t;$('prompt-s').textContent=info.s||'';const an=$('prompt-anel');an.hidden=!info.hold;
      const prog=P.acao&&P.acao.tipo==='revistar'?clamp(P.acao.t/P.acao.dur,0,1):0;an.style.setProperty('--p',prog);
      pr.style.transform='translate('+clamp(pt[0],120,W-120).toFixed(0)+'px,'+clamp(pt[1],135,H-180).toFixed(0)+'px) translate(-50%,-100%)';}else pr.classList.add('escondido');}
  else pr.classList.add('escondido');
  $('dano').style.opacity=String(P.hurt>0?Math.min(1,P.hurt*1.4):clamp(1-P.vida/100,0,0.55)*(P.vida<35?1:0));
  for(const f of HUDS){try{f(dt);}catch(e){console.error('hud',f.name,e);}}}
function hudXP(ganho){const el=$('st-xp');if(!el||!G.nivel)return;const k=clamp(G.xp/xpProx(),0,1);$('xp-anel').style.strokeDashoffset=String(125.66*(1-k));
  $('xp-n').textContent=G.nivel;el.title='Nível '+G.nivel+' · '+Math.round(k*100)+'% para o próximo';
  if(ganho>0){const gEl=$('xp-ganho');gEl.textContent='+'+Math.round(ganho)+' XP';gEl.classList.remove('vai');void gEl.offsetWidth;gEl.classList.add('vai');}
  const pts=G.pontos>0;el.classList.toggle('pontos',pts);for(const id of['badge-nivel','badge-mochila'])$(id).hidden=!pts;if(pts)for(const id of['badge-nivel','badge-mochila'])$(id).textContent=G.pontos;}
/* bússola: pontos cardeais e marcadores (objetivo, acampamento, caminhonete, Caramelo...) */
const busFita=$('bus-fita'),BUS=[];
(function(){const nomes={0:'N',45:'NE',90:'L',135:'SE',180:'S',225:'SO',270:'O',315:'NO'};
  for(let a=0;a<360;a+=15){const el=document.createElement('span'),nm=nomes[a];el.className=nm?'bus-c'+(a%90===0?' bus-p':'')+(a===0?' bus-n':''):'bus-t';el.textContent=nm||'';busFita.append(el);BUS.push({el,a:a*Math.PI/180,v:null});}})();
const BUSM={};
function busMarca(id,ico,cor){let m=BUSM[id];if(!m){const el=document.createElement('span');el.className='bus-m';el.style.color=cor;el.innerHTML=svgUse(ico)+'<b></b>';busFita.append(el);m=BUSM[id]={el,b:el.querySelector('b'),v:null};}return m;}
function hudBussola(){if(!busFita.offsetParent)return;const W2=busFita.clientWidth/2,lim=Math.PI*0.55,k=W2/lim,yaw=Math.atan2(cam.fwd[0],-cam.fwd[2]);
  const pos=(o,d)=>{const vis=Math.abs(d)<lim;if(vis!==o.v){o.v=vis;o.el.style.visibility=vis?'visible':'hidden';}if(vis)o.el.style.transform='translateX('+(W2+d*k).toFixed(1)+'px)';};
  for(const p of BUS)pos(p,angDiff(yaw,p.a));
  const mi=missaoInfo(),lst=[];if(mi.alvo)lst.push(['obj','i-alvo','#ff8a3d',mi.alvo.x,mi.alvo.z,true]);
  lst.push(['fogo','i-fogueira','#ffb066',FIRE[0],FIRE[2],Math.hypot(FIRE[0]-P.x,FIRE[2]-P.z)>18]);
  lst.push(['carro','i-gasolina','#e0c77e',CARRO.x,CARRO.z,!CARRO.ativo&&(CARRO.comb>0||invCount('gasolina')>0||Math.hypot(CARRO.x-P.x,CARRO.z-P.z)<70)]);
  lst.push(['cao','i-cao','#e0a35c',CAO.x,CAO.z,CAO.ativo&&CAO.st!=='carro'&&Math.hypot(CAO.x-P.x,CAO.z-P.z)>12]);
  if(P.mochila)lst.push(['moch','i-mochila','#97c76e',P.mochila.x,P.mochila.z,true]);
  if(G.ev&&G.ev.ativo)lst.push(['caixa','i-alerta','#ff4a3d',G.ev.x,G.ev.z,true]);
  if(G.mapaAlvo){const c=CAIXAS.find(q=>q.id===G.mapaAlvo&&q.estado==='cheia'&&q.x!==undefined);if(c)lst.push(['mapa','i-mapa','#e8ab43',c.x,c.z,true]);else G.mapaAlvo=null;}
  if(G.mapaCid){const c=CID.conts.find(q=>q.id===G.mapaCid&&q.oculto&&q.estado==='fechado');if(c)lst.push(['mapa','i-mapa','#e8ab43',c.x,c.z,true]);else G.mapaCid=null;}
  const vistos={};for(const[id,ico,cor,x,z,show]of lst){if(!show)continue;vistos[id]=1;const m=busMarca(id,ico,cor),dx=x-P.x,dz=z-P.z;pos(m,angDiff(yaw,Math.atan2(dx,-dz)));
    const d=Math.round(Math.hypot(dx,dz));if(m.d!==d){m.d=d;m.b.textContent=id==='obj'||id==='caixa'||id==='moch'||id==='mapa'?d+' m':'';}}
  for(const id in BUSM)if(!vistos[id]&&BUSM[id].v!==false){BUSM[id].v=false;BUSM[id].el.style.visibility='hidden';}}
function hudExtras(){const pr=protecao(),ep=$('vx-prot');ep.hidden=pr<=0;if(pr>0)ep.querySelector('b').textContent=Math.round(pr*100)+'%';
  {const eb=$('vx-bat'),tem=invCount('lanterna')>0;eb.hidden=!tem;if(tem){eb.querySelector('b').textContent=Math.round(P.bat||0)+'%';eb.classList.toggle('baixo',(P.bat||0)<15);}}
  $('vx-frio').hidden=!comFrio();const ec=$('vx-cao');ec.hidden=!CAO.ativo;
  if(CAO.ativo){$('vx-cao-b').style.width=Math.round(100*CAO.hp/CAO.hpMax)+'%';
    $('vx-cao-t').textContent={segue:'Seguindo',fica:'Vigiando',ataca:'Brigando',carro:'Na caçamba',ferido:'Ferido',descansa:'Descansando'}[CAO.st]||'';}}
function hudArma(){const el=$('arma'),s=selItem(),d=s?ITEMS[s.id]:null;if(!d||d.tipo!=='arma'||CARRO.ativo){el.hidden=true;return;}el.hidden=false;
  $('arma-i').setAttribute('href','#'+d.icon);$('arma-n').textContent=d.nome;const b=$('arma-b');
  if(d.fogo){$('arma-v').innerHTML=s.mun+'<small> / '+invCount(d.municao)+'</small>';b.hidden=true;}
  else if(d.arremesso){$('arma-v').textContent=s.n+'×';b.hidden=true;}
  else if(d.arco){$('arma-v').innerHTML=invCount('flecha')+'<small> flechas</small>';b.hidden=false;const f=s.dur/d.durMax;b.firstChild.style.width=Math.round(f*100)+'%';b.firstChild.style.background=f<0.25?'var(--blood)':'var(--moss)';}
  else{$('arma-v').textContent=d.durMax?Math.round(100*s.dur/d.durMax)+'%':'';b.hidden=!d.durMax;if(d.durMax){const f=s.dur/d.durMax;b.firstChild.style.width=Math.round(f*100)+'%';b.firstChild.style.background=f<0.25?'var(--blood)':'var(--moss)';}}}
function hudChefe(){const el=$('chefe');if(!el)return;const b=G.modo==='jogo'&&P.alive?chefeVivo():null;if(!b){if(!el.hidden)el.hidden=true;return;}el.hidden=false;{const nm=b.nomeChefe||'O Colosso';if(el.dataset.n!==nm){el.dataset.n=nm;el.querySelector('.chefe-n').textContent=nm;el.setAttribute('aria-label','Vida de '+nm);}}$('chefe-v').style.width=Math.max(0,100*b.hp/b.hpMax).toFixed(1)+'%';}
function hudTarefa(){const el=$('missao-tar');if(!el)return;const t=tarefaTop();if(!t){el.hidden=true;return;}const T=tarefaDef(t.id);el.hidden=false;el.textContent='Tarefa: '+T.txt(t.meta)+' · '+t.n+'/'+t.meta;}
const marcaEl=$('marca');
function hudMarca(){const mi=missaoInfo(),a=mi.alvo;if(!a||G.modo!=='jogo'||OBRA.ativo||!P.alive){marcaEl.hidden=true;return;}
  const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<6){marcaEl.hidden=true;return;}
  let pt=project([a.x,(a.y!==undefined?a.y:ground(a.x,a.z))+2.6,a.z]),fora=false;
  if(!pt){const dx=a.x-cam.pos[0],dz=a.z-cam.pos[2],sx=dx*cam.right[0]+dz*cam.right[2];pt=[sx>0?W:0,H*0.45];fora=true;}
  const m=34;let x=pt[0],y=pt[1];if(x<m||x>W-m||y<90||y>H-170)fora=true;x=clamp(x,m,W-m);y=clamp(y,90,H-170);
  marcaEl.hidden=false;marcaEl.style.transform='translate('+x.toFixed(0)+'px,'+y.toFixed(0)+'px) translate(-50%,-50%)';$('marca-d').textContent=Math.round(d)+' m';marcaEl.classList.toggle('fora',fora);}
function direcaoDano(x,z){const el=$('dir-dano'),dx=x-P.x,dz=z-P.z,yw=cfg.cam==='1'?P.yaw:P.yaw;const f=dx*Math.sin(yw)+dz*Math.cos(yw),r=dx*-Math.cos(yw)+dz*Math.sin(yw);
  el.style.transition='none';el.style.opacity='1';el.style.transform='rotate('+Math.atan2(r,f).toFixed(3)+'rad)';requestAnimationFrame(()=>{el.style.transition='opacity .9s ease-out';el.style.opacity='0';});}
function direcao(dx,dz){const a=(Math.atan2(dx,-dz)*180/Math.PI+360)%360;return['norte','nordeste','leste','sudeste','sul','sudoeste','oeste','noroeste'][Math.round(a/45)%8];}

/* ---------- minimapa ---------- */
const mapC=$('minimapa');let mapCtx=null;
function drawMap(){if(!mapCtx)return;const obs=(G.obsAte||0)>G.t,c=mapC,g=mapCtx,Wd=c.width,R=Wd/2,cx=R,cy=R,range=obs?110:42,k=(R-3)/range,sx=P.x,sz=P.z,n=E.n||0;
  const X=x=>cx+(x-sx)*k,Y=z=>cy+(z-sz)*k;
  g.clearRect(0,0,Wd,Wd);g.save();g.beginPath();g.arc(cx,cy,R-1,0,Math.PI*2);g.clip();
  const v2=cfg.tela==='pc';   // HUD v2 (62w_hud2): verde-escuro, anéis de distância e a missão em losango
  g.fillStyle=n>0.5?(v2?'#0e1a11':'#111a14'):(v2?'#1f3a24':'#25341f');g.fillRect(0,0,Wd,Wd);
  for(const p of PLACES){g.fillStyle=n>0.5?(v2?'#16261a':'#1d2a1c'):(v2?'#2f4d31':'#3f5733');g.beginPath();g.arc(X(p.x),Y(p.z),p.r*k,0,Math.PI*2);g.fill();}
  g.lineCap='round';for(const r of ROADS){g.strokeStyle=r.cor==='asfalto'?(n>0.5?'#3a3a38':'#6d6b66'):(n>0.5?'#4d4335':'#8b7759');g.lineWidth=Math.max(1.5,r.w*k*0.8);
    g.beginPath();r.pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();}
  for(const f of MAPA_DESENHOS){try{f(g,X,Y,k,n,range);}catch(e){}}
  if(distCidade(sx,sz)<range+12){const noite=n>0.5;g.fillStyle=noite?'#1a1a19':'#3a3a38';g.fillRect(X(CIDADE.x0),Y(CIDADE.z0),(CIDADE.x1-CIDADE.x0)*k,(CIDADE.z1-CIDADE.z0)*k);
    g.fillStyle=noite?'#2c2b28':'#6d6b64';for(const q of CID.quadras)g.fillRect(X(q.x0),Y(q.z0),(q.x1-q.x0)*k,(q.z1-q.z0)*k);
    for(const p of CID.predios){g.fillStyle=p.tipo==='hospital'?(noite?'#4a5552':'#c9d3cf'):(noite?'#3d3a35':'#a59f93');g.fillRect(X(p.x0),Y(p.z0),(p.x1-p.x0)*k,(p.z1-p.z0)*k);g.strokeStyle='#070a09';g.lineWidth=1;g.strokeRect(X(p.x0),Y(p.z0),(p.x1-p.x0)*k,(p.z1-p.z0)*k);}
    g.fillStyle='#4a8ad8';for(const b of CID.metro.bocas)g.fillRect(X(b.x0)-1,Y(b.z1)-1,(b.x1-b.x0)*k+2,4);}
  g.fillStyle='#a07a4a';for(const o of OB){g.save();g.translate(X(o.x),Y(o.z));g.rotate(-o.yaw);const D=OBRAS[o.tipo];g.fillRect(-D.hw*k,-Math.max(D.hd,0.25)*k,D.hw*2*k,Math.max(D.hd,0.25)*2*k);g.restore();}
  const fg=g.createRadialGradient(X(FIRE[0]),Y(FIRE[2]),0,X(FIRE[0]),Y(FIRE[2]),4*k);fg.addColorStop(0,'rgba(255,150,60,.9)');fg.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=fg;g.beginPath();g.arc(X(FIRE[0]),Y(FIRE[2]),4*k,0,Math.PI*2);g.fill();
  for(const z of Z){if(!z.vivo||d2(z.x,z.z,sx,sz)>range*range)continue;g.fillStyle=z.tipo==='screamer'?'#ffb0a8':z.tipo==='brute'?'#ff2a1a':'#ff4a3d';g.beginPath();g.arc(X(z.x),Y(z.z),z.tipo==='brute'?3.2:2.2,0,Math.PI*2);g.fill();}
  if(obs&&G.cid)for(const h of G.cid.hordas||[]){if(h.membros.length)continue;const q=h.n||0;g.fillStyle='rgba(255,60,40,.35)';g.beginPath();g.arc(X(h.x),Y(h.z),Math.max(3,(2+q*0.25)*k*2.2),0,Math.PI*2);g.fill();g.fillStyle='#ff6a50';g.beginPath();g.arc(X(h.x),Y(h.z),2.6,0,Math.PI*2);g.fill();}
  for(const rg of RINGS){if(rg.a<0)continue;g.strokeStyle='rgba(255,110,90,'+(0.8*(1-rg.a/1.5))+')';g.lineWidth=1.5;g.beginPath();g.arc(X(rg.x),Y(rg.z),(0.6+rg.a*7)*k,0,Math.PI*2);g.stroke();}
  if(v2){g.strokeStyle='rgba(236,228,210,.11)';g.lineWidth=1;for(const f of [0.36,0.7]){g.beginPath();g.arc(cx,cy,R*f,0,Math.PI*2);g.stroke();}}
  g.restore();
  const marca=(x,z,cor,raio)=>{let mx=X(x),my=Y(z);const dx=mx-cx,dy=my-cy,dd=Math.hypot(dx,dy);if(dd>R-6){mx=cx+dx/dd*(R-6);my=cy+dy/dd*(R-6);}
    g.fillStyle=cor;g.beginPath();g.arc(mx,my,raio,0,Math.PI*2);g.fill();g.strokeStyle='#070a09';g.lineWidth=1.2;g.stroke();};
  if(d2(CARRO.x,CARRO.z,sx,sz)<range*range){g.save();g.translate(X(CARRO.x),Y(CARRO.z));g.rotate(-CARRO.yaw);g.fillStyle='#e0c77e';g.strokeStyle='#070a09';g.lineWidth=1;g.fillRect(-1.1*k,-2.5*k,2.2*k,5*k);g.strokeRect(-1.1*k,-2.5*k,2.2*k,5*k);g.restore();}
  else if(CARRO.comb>0||invCount('gasolina'))marca(CARRO.x,CARRO.z,'#e0c77e',2.8);
  const mi=missaoInfo();if(mi.alvo){if(v2){let mx=X(mi.alvo.x),my=Y(mi.alvo.z);const dx=mx-cx,dy=my-cy,dd=Math.hypot(dx,dy);if(dd>R-8){mx=cx+dx/dd*(R-8);my=cy+dy/dd*(R-8);}
    const s2=Math.max(4,R*0.075)*(1+0.12*Math.sin(G.t*5));g.save();g.translate(mx,my);g.rotate(Math.PI/4);g.shadowColor='rgba(255,138,61,.85)';g.shadowBlur=8;
    g.fillStyle='#ff8a3d';g.fillRect(-s2,-s2,s2*2,s2*2);g.shadowBlur=0;g.strokeStyle='#2a1508';g.lineWidth=1;g.strokeRect(-s2,-s2,s2*2,s2*2);g.restore();}
    else marca(mi.alvo.x,mi.alvo.z,'#ff8a3d',3.6+Math.sin(G.t*5));}
  if(P.mochila)marca(P.mochila.x,P.mochila.z,'#97c76e',3.4);
  if(CAO.ativo&&CAO.st!=='carro')marca(CAO.x,CAO.z,'#e0a35c',2.6);else if(CAO.st==='espera'&&d2(CAO.x,CAO.z,sx,sz)<30*30)marca(CAO.x,CAO.z,'#e0a35c',2.2);
  if(G.ev&&G.ev.ativo)marca(G.ev.x,G.ev.z,'#ff4a3d',3.4);
  mapaSobrev(marca,sx,sz,range);mapaChefesR(marca);
  if(d2(FIRE[0],FIRE[2],sx,sz)>range*range)marca(FIRE[0],FIRE[2],'#ffcf8a',2.6);
  marca(TOWER[0],TOWER[1],'#ff5a4a',2.4);
  const f=[Math.sin(P.yaw),Math.cos(P.yaw)],s=Math.max(5,R*0.13);g.save();g.translate(cx,cy);g.fillStyle='#ece4d2';g.strokeStyle='#070a09';g.lineWidth=1.5;g.beginPath();
  g.moveTo(f[0]*s,f[1]*s);g.lineTo(-f[1]*s*0.7-f[0]*s*0.7,f[0]*s*0.7-f[1]*s*0.7);g.lineTo(-f[0]*s*0.25,-f[1]*s*0.25);g.lineTo(f[1]*s*0.7-f[0]*s*0.7,-f[0]*s*0.7-f[1]*s*0.7);g.closePath();g.stroke();g.fill();g.restore();}

/* ---------- telas ---------- */
const TELAS=['t-titulo','t-menu','t-confirma','t-ajustes','t-ajuda','t-pausa','t-morte','t-fim','t-conquistas',...TELAS_NOVAS];
function tela(id){for(const t of TELAS)$(t).hidden=t!==id;
  if(!id)setTimeout(()=>{if(G.modo==='jogo'&&cfg.tela==='pc'&&(!navigator.userActivation||navigator.userActivation.isActive))pedirTrava();},0);}
let ajustesVolta='t-menu',ajudaVolta='t-menu';
function mostrarMenu(){G.modo='menu';tela('t-menu');{const a=$('m-aviso'),d=typeof saveDanificado==='function'&&!temSave()&&saveDanificado();if(a){a.hidden=!d;if(d)a.textContent='O jogo salvo neste aparelho está danificado e não abre. Em Salvamentos dá para abrir uma cópia guardada em arquivo; ou comece um novo jogo.';}}hudEl.classList.add('oculto');{const r=store.get('nnc_recorde');$('m-recorde').textContent=r&&r.dias>1?' · Recorde: '+r.dias+' dias':'';}$('m-continuar').hidden=!temSave();$('m-novo').classList.toggle('prim',!temSave());}
let sessIni=0;
function jogar(){sessIni=G.t;G.modo='jogo';tela(null);hudEl.classList.remove('oculto');audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();hudBarra();hudDia();hudMissao();hudObras();rebuildVeg(true);rebuildGrass();
  if(G.m.etapa===0&&G.dia===1&&G.hora<7.6){setTimeout(()=>toast('radio','Teste, teste... se alguém estiver ouvindo, venha até o rádio na bancada da clareira.'),1500);
    setTimeout(()=>{if(G.modo==='jogo'||G.modo==='mochila')dica('inicio','corpo','Você acordou na mata, sem nada. Junte gravetos (galhos no chão), pedras e fibras (touceiras de capim). Com uma pedra na mão dá para bater nas árvores e tirar madeira. A clareira com o rádio fica ao norte.');},11000);}}
function pausar(){if(G.modo!=='jogo')return;G.modo='pausa';tela('t-pausa');IN.attack=false;IN.mx=IN.mz=0;
  $('p-stats').innerHTML=statsHTML();{const n=G.aparencia&&G.aparencia.nome,el=$('p-nome');if(el){el.hidden=!n;el.textContent=n?'Sobrevivente: '+n:'';}}salvarJogo();}
function statsHTML(){return'<div><b>'+G.nivel+'</b><span>Nível</span></div><div><b>'+G.dia+'</b><span>Dia</span></div><div><b>'+G.noiteN+'</b><span>Noites</span></div><div><b>'+G.kills+'</b><span>Zumbis</span></div>';}
function mostrarMorte(){if(G.modo!=='jogo')return;G.modo='morto';tela('t-morte');$('morte-stats').innerHTML=statsHTML();
  $('morte-t').textContent=(G.causa==='virus'?'O vírus venceu: faltou a seringa. ':G.causa==='sangramento'?'Você perdeu sangue demais. ':'')+(P.mochila?'Sua mochila ficou onde você caiu, marcada em verde no minimapa. Volte lá para pegar suas coisas.':'Você acorda na barraca da clareira.');G.causa=null;}
function mostrarFim(){G.modo='fim';tela('t-fim');$('fim-stats').innerHTML=statsHTML();if(document.pointerLockElement)document.exitPointerLock();}
function ajustesUI(){const set=(id,v)=>$(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(v))));
  set('aj-graf',cfg.graf);set('aj-dif',cfg.dif);set('aj-cam',cfg.cam);set('aj-tela',cfg.tela);set('aj-som',cfg.som);set('aj-teclas',cfg.teclas===0?0:1);$('aj-sens').value=cfg.sens;{const v=$('aj-sens-v');if(v)v.textContent=(+cfg.sens||1).toFixed(2);}$('aj-fov').value=cfg.fov||1;$('aj-mus').value=cfg.musica??0.55;$('aj-efx').value=cfg.efeitos??0.9;}
function aplicarCfg(){body.dataset.tela=cfg.tela;body.classList.toggle('sem-teclas',cfg.teclas===0);const gr=GRAF[cfg.graf]||GRAF.alto;if(gl){const want=gr.sombra||1024;if(SHADOW&&(SHADOW.size!==want||SHADOW.casc!==!!gr.casc))makeShadow(want,!!gr.casc);}dpr=Math.min(window.devicePixelRatio||1,gr.dpr);resize();audioVol();saveCfg();
  $('u-camera').setAttribute('aria-label',cfg.cam==='1'?'Mudar para terceira pessoa':'Mudar para primeira pessoa');}
for(const[id,key]of[['aj-graf','graf'],['aj-dif','dif'],['aj-cam','cam'],['aj-tela','tela'],['aj-som','som'],['aj-teclas','teclas']])
  $(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg[key]=key==='som'||key==='teclas'?+b.dataset.v:b.dataset.v;if(key==='graf')cfg.grafManual=1;ajustesUI();aplicarCfg();sfx('clique');});
$('teclas-x').addEventListener('click',e=>{e.stopPropagation();cfg.teclas=0;aplicarCfg();sfx('clique');feed('Comandos escondidos: dá para mostrar de novo nos Ajustes');});
$('aj-sens').addEventListener('input',e=>{cfg.sens=+e.target.value;saveCfg();const v=$('aj-sens-v');if(v)v.textContent=cfg.sens.toFixed(2);});
$('g-tarefas').addEventListener('click',e=>{const b=e.target.closest('.g-tar');if(b)grupoTarefa(b.dataset.t);});
$('g-ok').addEventListener('click',()=>{sfx('clique');fecharGrupo();});$('g-x').addEventListener('click',()=>fecharGrupo());
$('aj-fov').addEventListener('input',e=>{cfg.fov=+e.target.value;saveCfg();});
$('aj-mus').addEventListener('input',e=>{cfg.musica=+e.target.value;audioVol();saveCfg();});
$('aj-efx').addEventListener('input',e=>{cfg.efeitos=+e.target.value;audioVol();saveCfg();sfx('clique');});
$('aj-ok').addEventListener('click',()=>tela(ajustesVolta));
$('aj-fechar').addEventListener('click',()=>tela(ajudaVolta));
$('m-continuar').addEventListener('click',()=>{audioInit();if(carregarJogo())jogar();else{mostrarMenu();const a=$('m-aviso');if(a){a.hidden=false;a.textContent='Não deu para abrir o jogo salvo. Veja as cópias em Salvamentos ou comece um novo jogo.';}}});
$('m-novo').addEventListener('click',()=>{audioInit();if(temSave())tela('t-confirma');else abrirCriacao();});   // novo jogo: primeiro a criação do personagem
$('c-sim').addEventListener('click',()=>abrirCriacao(true));$('c-nao').addEventListener('click',mostrarMenu);
$('m-ajustes').addEventListener('click',()=>{ajustesVolta='t-menu';ajustesUI();tela('t-ajustes');});
$('m-ajuda').addEventListener('click',()=>{ajudaVolta='t-menu';tela('t-ajuda');});
$('m-conq').addEventListener('click',()=>abrirConquistas('t-menu'));$('p-conq').addEventListener('click',()=>abrirConquistas('t-pausa'));$('p-foto').addEventListener('click',()=>{G.modo='jogo';fotoAbrir();});
$('cq-voltar').addEventListener('click',()=>tela(conqVolta));
for(const b of document.querySelectorAll('#t-conquistas [data-aba]'))b.addEventListener('click',()=>{conqAba=b.dataset.aba;conqRender();if(conqAba==='online'){try{$('cq-nome').value=store.get('nnc_nome')||'';}catch(_){}}});
$('cq-enviar').addEventListener('click',async()=>{const nome=$('cq-nome').value.trim()||'Sobrevivente';store.set('nnc_nome',nome);const m=$('cq-msg');m.textContent='Enviando…';
  try{await placarOnlineEnviar(nome);m.textContent='Recorde enviado.';conqRender();}catch(e){m.textContent=e&&(e.code==='not_granted'||e.code==='permission_denied'||e.code==='forbidden')?'Você pode ver o placar, mas não tem permissão para enviar. Seu recorde fica salvo neste aparelho.':'Não deu para enviar agora. Seu recorde fica salvo neste aparelho.';}});
$('foto-filtro').addEventListener('click',()=>{FOTO.filtro=(FOTO.filtro+1)%FILTROS.length;fotoUI();});
$('foto-hora').addEventListener('click',()=>{FOTO.hora=(FOTO.hora+1)%FOTO_HORAS.length;fotoUI();});
$('foto-pers').addEventListener('click',()=>{FOTO.esconde=!FOTO.esconde;fotoUI();});
$('foto-tirar').addEventListener('click',()=>{fotoTirar();});
$('foto-sair').addEventListener('click',()=>fotoFechar());
$('foto-perto').addEventListener('click',()=>{FOTO.dist=Math.max(0.8,FOTO.dist*0.8);});$('foto-longe').addEventListener('click',()=>{FOTO.dist=Math.min(14,FOTO.dist*1.25);});
$('p-voltar').addEventListener('click',()=>{G.modo='jogo';tela(null);pedirTrava();});
$('p-ajustes').addEventListener('click',()=>{ajustesVolta='t-pausa';ajustesUI();tela('t-ajustes');});
$('p-ajuda').addEventListener('click',()=>{ajudaVolta='t-pausa';tela('t-ajuda');});
$('p-sair').addEventListener('click',()=>{salvarJogo();mostrarMenu();});
$('morte-ok').addEventListener('click',()=>{renascer();G.modo='jogo';tela(null);hudBarra();});
$('fim-ok').addEventListener('click',()=>{G.modo='jogo';tela(null);hudMissao(true);salvarJogo();});
$('bt-pausa').addEventListener('click',pausar);

/* ---------- controles ---------- */
const KEYS=IN.keys;
function moverTeclas(){IN.mx=(KEYS.KeyD?1:0)-(KEYS.KeyA?1:0);IN.mz=(KEYS.KeyW||KEYS.ArrowUp?1:0)-(KEYS.KeyS||KEYS.ArrowDown?1:0);IN.giro=(KEYS.ArrowRight?1:0)-(KEYS.ArrowLeft?1:0);}
/* G: larga no chão, na sua frente, o item que está na mão (a pilha inteira) */
function largarRapido(){if(G.modo!=='jogo'||!P.alive)return;const s=P.inv[P.sel],d=s&&ITEMS[s.id];if(!s){feed('Mão vazia: nada para largar',true);return;}
  if(d&&d.tipo==='missao'){feed('Esse item é da missão: não dá para largar',true);sfx('vazio');return;}
  soltarItens([[s.id,s.n,exDe(s)]],P.x+Math.sin(P.body)*0.8,P.z+Math.cos(P.body)*0.8,P.y);P.inv[P.sel]=null;P.acao=null;hudBarra();sfx('pegar');feed('Largou: '+(d?d.nome:s.id)+(s.n>1?' ×'+s.n:''));}
function usarPress(){if(G.modo!=='jogo'||!P.alive)return;if(P.acao)return;interagir(false);}
function usarSolta(){if(P.acao&&P.acao.tipo==='revistar'&&!P.acao.done){const a=P.acao;P.acao=null;if(a.alt&&a.t<a.dur){const k=a.alvo.k,o=a.alvo.o;if(k==='via')comecarEscalada(o);else if(k==='porta')portaUsar(o,false);
    else if(k==='camaObra')dormirAqui(o);else if(k==='inter'&&o.kind==='cama')camaBarraca();else if(k==='inter'&&o.kind==='bancada')abrirMochila('fabricar');else if(INTER_K[k]&&INTER_K[k].curto)INTER_K[k].curto(o);}}}
function trocarCamera(){cfg.cam=cfg.cam==='1'?'3':'1';saveCfg();ajustesUI();feed(cfg.cam==='1'?'Primeira pessoa':'Terceira pessoa');}
function lanterna(){if(CARRO.ativo){CARRO.luz=!CARRO.luz;feed(CARRO.luz?'Faróis ligados':'Faróis desligados');}else P.lanterna=!P.lanterna;sfx('clique');}
window.addEventListener('keydown',e=>{if(e.code==='Tab'&&(G.modo==='jogo'||G.modo==='mochila')){e.preventDefault();if(G.modo==='mochila'){fecharMochila();pedirTrava();}else if(G.modo==='jogo')abrirMochila();return;}
  if(e.code==='Escape'){if(G.modo==='grupo'){fecharGrupo();return;}if(G.modo==='mochila')fecharMochila();else if(OBRA.ativo)modoObra(false);else if(G.modo==='jogo')pausar();else if(G.modo==='pausa'){G.modo='jogo';tela(null);}return;}
  if(G.modo!=='jogo'||e.repeat&&e.code!=='KeyW')return;
  if(e.target&&(e.target.tagName==='INPUT'))return;
  KEYS[e.code]=true;moverTeclas();
  switch(e.code){case'ShiftLeft':case'ShiftRight':IN.run=true;if(P.agachado)agachar(false);break;case'Space':e.preventDefault();if(CARRO.ativo)IN.freio=true;else pular();break;case'KeyH':if(CARRO.ativo)buzinar();break;case'KeyE':usarPress();break;case'KeyR':if(OBRA.ativo){OBRA.rot+=Math.PI/4;}else recarregar();break;
    case'KeyQ':if(!CARRO.ativo)empurrar();break;case'KeyC':if(CARRO.ativo){if(VT().voa)IN.desce=true;}else{if(IN.run&&Math.hypot(IN.mx,IN.mz)>0.15&&rolar())break;agachar();}break;case'Minus':case'NumpadSubtract':mudarSens(-0.1);break;case'Equal':case'NumpadAdd':mudarSens(0.1);break;case'KeyF':lanterna();break;case'KeyG':if(!CARRO.ativo)largarRapido();break;case'KeyV':trocarCamera();break;case'KeyB':if(!CARRO.ativo)modoObra();break;case'KeyI':abrirMochila();break;
    default:if(e.code.startsWith('Digit')){const n=+e.code.slice(5);if(OBRA.ativo&&n>=0&&n<=9){OBRA.tipo=obrasDaAba()[n===0?9:n-1]||OBRA.tipo;motivoMostrado=null;hudObras();sfx('clique');}else if(n>=1&&n<=9&&n<=BAR_N)selecionar(n-1);}}});
window.addEventListener('keyup',e=>{KEYS[e.code]=false;moverTeclas();if(e.code==='Space')IN.freio=false;if(e.code==='KeyC')IN.desce=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')IN.run=false;if(e.code==='KeyE')usarSolta();});
window.addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false;moverTeclas();IN.attack=false;IN.aim=false;IN.run=false;});
function olhar(dx,dy,k){if(CARRO.ativo&&(Math.abs(dx)+Math.abs(dy)>1))olharT=performance.now();const ks=k*cfg.sens*(lunetaAtiva()?0.3:1),fp=cfg.cam==='1'&&!CARRO.ativo;
  P.yaw-=dx*ks;P.pitch=clamp(P.pitch-dy*ks,fp?-1.45:-1.25,fp?1.35:1.05);}
function mudarSens(d){cfg.sens=Math.round(clamp((cfg.sens||1)+d,0.2,3)*100)/100;saveCfg();const el=$('aj-sens');if(el)el.value=cfg.sens;const v=$('aj-sens-v');if(v)v.textContent=cfg.sens.toFixed(2);feed('Sensibilidade do mouse: '+cfg.sens.toFixed(2));}
let lockPedido=false,lockComGesto=true,arrasto=null,semTrava=!canvas.requestPointerLock||location.hash.startsWith('#teste'),avisouSolto=false,
  lockFalhas=0,lockFalhaT=0,lockCru=true,lockPromessa=false,moveMed=0,avisoCliqueT=-99;   // nos testes automáticos (navegador sem tela) a trava do mouse gera uma enxurrada de eventos
function pedirTrava(){if(cfg.tela!=='pc'||G.modo!=='jogo'||document.pointerLockElement||semTrava||lockPedido||!canvas.requestPointerLock)return;lockPedido=true;
  lockComGesto=!navigator.userActivation||navigator.userActivation.isActive;
  /* sem um clique ou tecla logo antes o navegador recusa, e logo depois do Esc ele também recusa por um instante:
     uma recusa não desiste da trava (antes o jogo passava a partida inteira com o mouse solto: sensibilidade diferente e
     clique caindo nos botões da tela). Só joga com o mouse solto depois de 3 recusas seguidas com clique, em mais de 4 s.
     Entrada crua (sem a aceleração do Windows) quando o navegador deixa; se não deixa, pede a trava normal. */
  try{const r=lockCru?canvas.requestPointerLock({unadjustedMovement:true}):canvas.requestPointerLock();lockPromessa=!!(r&&r.then);
    if(lockPromessa)r.then(()=>{lockFalhas=0;},e=>falhaTrava(e));}catch(err){falhaTrava(err);}setTimeout(()=>lockPedido=false,700);}
function falhaTrava(e){lockPedido=false;
  if(lockCru&&e&&e.name==='NotSupportedError'){lockCru=false;pedirTrava();return;}
  if(!lockComGesto)return;const t=performance.now();if(t-lockFalhaT>15000)lockFalhas=0;if(!lockFalhas)lockFalhaT=t;lockFalhas++;
  if(lockFalhas>=3&&t-lockFalhaT>4000){semTrava=true;mouseSolto();return;}
  if(t-avisoCliqueT>6000){avisoCliqueT=t;feed('Clique na tela para prender o mouse');}}
function mouseSolto(){if(avisouSolto)return;avisouSolto=true;toast('corpo','Aqui o mouse não fica preso: é só mexer o mouse para girar a câmera (ou use as setas ← →). Encostar o cursor na borda da tela continua girando.');}
document.addEventListener('pointerlockerror',()=>{if(lockPromessa){lockPedido=false;return;}falhaTrava(null);});   // navegador sem promessa (Firefox): conta aqui
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousedown',e=>{if(G.modo!=='jogo'||cfg.tela!=='pc')return;
  if(!document.pointerLockElement&&!semTrava&&canvas.requestPointerLock){pedirTrava();if(e.button===0&&!OBRA.ativo)return;}
  if(e.button===0){if(OBRA.ativo)colocarObra();else{IN.attack=true;IN.atkQ=true;}}if(e.button===2)IN.aim=true;arrasto=[e.clientX,e.clientY];});
window.addEventListener('mouseup',e=>{if(e.button===0)IN.attack=false;if(e.button===2)IN.aim=false;arrasto=null;});
window.addEventListener('mousemove',e=>{if(G.modo!=='jogo'||cfg.tela!=='pc'){IN.borda=0;return;}
  if(document.pointerLockElement===canvas){const mx=e.movementX,my=e.movementY,mg=Math.abs(mx)+Math.abs(my);IN.borda=0;
    if(mg>400&&mg>moveMed*6){moveMed=moveMed*0.7+40;return;}   // salto falso que o Chrome manda de vez em quando com o mouse preso: ignora
    moveMed=moveMed*0.8+mg*0.2;olhar(mx,my,0.0016);return;}
  if(semTrava){olhar(e.movementX||0,e.movementY||0,0.0016);const w=window.innerWidth,x=e.clientX,m=w*0.06;IN.borda=x<m?-(1-x/m):x>w-m?(x-(w-m))/m:0;return;}
  if(arrasto){olhar(e.clientX-arrasto[0],e.clientY-arrasto[1],0.004);arrasto=[e.clientX,e.clientY];}});
document.addEventListener('mouseleave',()=>{IN.borda=0;});
let rodaT=0;
canvas.addEventListener('wheel',e=>{if(G.modo!=='jogo')return;e.preventDefault();
  // construindo: a roda troca o que vai construir (com o mouse preso não dá para clicar na barra); Shift + roda gira a peça
  if(OBRA.ativo){if(e.shiftKey){OBRA.rot+=Math.sign(e.deltaY)*Math.PI/8;return;}const agora=performance.now();if(agora-rodaT<110)return;rodaT=agora;
    const L=obrasOrdem(),i=Math.max(0,L.indexOf(OBRA.tipo));OBRA.tipo=L[(i+(e.deltaY>0?1:L.length-1))%L.length];motivoMostrado=null;hudObras();sfx('clique');return;}selecionar((P.sel+(e.deltaY>0?1:5))%BAR_N);},{passive:false});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement&&G.modo!=='jogo'){document.exitPointerLock();return;}   // a trava chegou com um painel já aberto: solta o mouse
  if(!document.pointerLockElement&&G.modo==='jogo'&&cfg.tela==='pc'&&!lockPedido){IN.attack=false;}});
// toque: olhar arrastando na tela
const toques=new Map();
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;if(G.modo!=='jogo')return;toques.set(e.pointerId,[e.clientX,e.clientY]);try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')return;const p=toques.get(e.pointerId);if(!p)return;olhar(e.clientX-p[0],e.clientY-p[1],0.0055);toques.set(e.pointerId,[e.clientX,e.clientY]);});
const fimToque=e=>{toques.delete(e.pointerId);};canvas.addEventListener('pointerup',fimToque);canvas.addEventListener('pointercancel',fimToque);
const joy=$('joy'),knob=$('joy-knob');let jid=null;
const jmove=e=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const m=r.width*0.34,l=Math.hypot(dx,dy);
  if(l>m){dx*=m/l;dy*=m/l;}knob.style.transform='translate('+dx+'px,'+dy+'px)';IN.mx=dx/m;IN.mz=-dy/m;if(l>m*1.35&&!IN.runFix&&!P.agachado)IN.run=true;};
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.classList.add('ativo');try{joy.setPointerCapture(jid);}catch(_){}jmove(e);});
joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e);});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;joy.classList.remove('ativo');knob.style.transform='';IN.mx=IN.mz=0;if(!IN.runFix)IN.run=false;};
joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
const botao=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('toque');if(G.modo==='jogo')down();});
  const fim=()=>{b.classList.remove('toque');if(up)up();};b.addEventListener('pointerup',fim);b.addEventListener('pointercancel',fim);b.addEventListener('pointerleave',fim);};
botao('a-atacar',()=>{if(OBRA.ativo)colocarObra();else{const d=selDef();if(d&&d.luneta){IN.aim=true;IN.lunetaToque=true;return;}IN.attack=true;IN.atkQ=true;IN.aim=!!(d&&(d.fogo||d.arco));}},()=>{if(IN.lunetaToque){IN.lunetaToque=false;IN.atkQ=true;setTimeout(()=>{IN.aim=false;},200);return;}IN.attack=false;IN.aim=false;});
botao('a-usar',usarPress,usarSolta);botao('a-pular',()=>{if(CARRO.ativo)IN.freio=true;else pular();},()=>{IN.freio=false;});botao('a-empurrar',empurrar);botao('a-recarregar',recarregar);
botao('a-correr',()=>{IN.runFix=!IN.runFix;IN.run=IN.runFix;if(IN.run&&P.agachado){P.agachado=false;feed('De pé');}});botao('a-agachar',()=>{if(IN.run&&Math.hypot(IN.mx,IN.mz)>0.15&&rolar())return;agachar();});
botao('u-mochila',()=>abrirMochila());botao('u-construir',()=>{if(!CARRO.ativo)modoObra();});botao('u-camera',trocarCamera);botao('u-lanterna',lanterna);
slotsEl.addEventListener('click',e=>{const b=e.target.closest('.slot');if(b)selecionar(+b.dataset.i);});
function resize(){W=Math.max(1,window.innerWidth);H=Math.max(1,window.innerHeight);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  if(gl&&GDEF&&!postSetup(canvas.width,canvas.height,GRAF[cfg.graf].msaa)){GDEF='';body.classList.remove('pos');}
  const r=mapC.getBoundingClientRect(),md=Math.min(2,window.devicePixelRatio||1);mapC.width=Math.max(40,Math.round((r.width||96)*md));mapC.height=mapC.width;if(mapCtx&&G.modo!=='menu')drawMap();}
window.addEventListener('resize',resize);

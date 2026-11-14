/* ================= modo criativo (administração): testar sistemas, criar coisas e ir a qualquer lugar =================
   Só existe com ativação explícita: Ajustes → "Modo criativo (testes)" → Ligado. Aí o menu mostra o botão "Modo criativo",
   que abre um jogo separado. Tudo o que acontece nele (jogo salvo, cópias, conquistas e recordes) fica em chaves próprias
   (nnc_adm_...), sem tocar no jogo normal. Ao voltar ao menu, o jogo normal volta a ser o de sempre.
   No jogo criativo, a tecla ' (a que fica do lado do 1) ou o botão "Painel criativo" da pausa abrem o painel:
   · Jogador: voar (Espaço sobe; Ctrl ou Z desce; Shift mais rápido), imortal, fabricar e construir sem gastar material,
     liberar todas as receitas e construções (também sem estação), encher vida/fome/sede/energia, curar e subir de nível.
     (v10.2.2: saiu o "inspecionar a mira", que escrevia "Nada na mira (até 9 m)" e as coordenadas na tela; o dono não pediu.)
   · Ir para: os lugares do mapa, prédios da cidade e destroços.
   · Tempo: hora do dia, clima, lua de sangue.
   · Criar: itens (com busca), bichos, zumbis (inclusive os chefes) e veículos prontos para andar, na sua frente.
   · Eventos: enchente, incêndio, estrada bloqueada, infestação, comboio, fartura, cardume, suprimentos de avião e o Colosso. */
const ADM={ativo:false,voar:false,imortal:false,gratis:false,liberar:false,aba:'jogador',qtd:1,busca:'',msg:''};
const ADM_CHAVES=/^nnc_(jogo_v1|recorde|recordes|conq)/;
TELAS_NOVAS.push('t-criativo');
if(typeof TELAS!=='undefined'&&Array.isArray(TELAS)&&!TELAS.includes('t-criativo'))TELAS.push('t-criativo');   // a lista de telas já foi montada pela interface

/* ---------- guardar em separado: enquanto o criativo está ativo, as chaves do progresso ganham o prefixo nnc_adm_ ---------- */
function admChave(k){return ADM.ativo&&typeof k==='string'&&ADM_CHAVES.test(k)?'nnc_adm_'+k.slice(4):k;}
(function(){try{const S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem;
  S.getItem=function(k){return g.call(this,admChave(k));};
  S.setItem=function(k,v){return s.call(this,admChave(k),v);};
  S.removeItem=function(k){return r.call(this,admChave(k));};}catch(e){console.error('criativo: armazenamento',e);}})();

/* ---------- ganchos nas regras do jogo (só mudam algo com o criativo ativo) ---------- */
{const _fer=ferirJogador;ferirJogador=function(d,src){if(ADM.ativo&&ADM.imortal)return;return _fer.apply(this,arguments);};}
{const _mor=morrer;morrer=function(){if(ADM.ativo&&ADM.imortal){P.vida=Math.max(P.vida,1);return;}return _mor.apply(this,arguments);};}
{const _has=invHas;invHas=function(c){if(ADM.ativo&&ADM.gratis)return true;return _has.apply(this,arguments);};}
{const _pay=invPay;invPay=function(c){if(ADM.ativo&&ADM.gratis)return;return _pay.apply(this,arguments);};}
{const _payq=invPayQ;invPayQ=function(c){if(ADM.ativo&&ADM.gratis)return null;return _payq.apply(this,arguments);};}
{const _est=receitaEstado;receitaEstado=function(r){if(ADM.ativo&&ADM.liberar)return'livre';return _est.apply(this,arguments);};}
{const _ob=obraLiberada;obraLiberada=function(k){if(ADM.ativo&&ADM.liberar)return true;return _ob.apply(this,arguments);};}
{const _eo=estacaoOk;estacaoOk=function(r){if(ADM.ativo&&ADM.liberar)return true;return _eo.apply(this,arguments);};}
{const _fo=ferramentaOk;ferramentaOk=function(r){if(ADM.ativo&&ADM.liberar)return true;return _fo.apply(this,arguments);};}
/* voar: sem gravidade; Espaço sobe, Ctrl ou Z desce (Shift: mais rápido); nunca abaixo do chão */
{const _fv=fisicaVertical;fisicaVertical=function(dt){if(!(ADM.ativo&&ADM.voar))return _fv.apply(this,arguments);
  const sobe=KEYS.Space?1:0,desce=(KEYS.ControlLeft||KEYS.ControlRight||KEYS.KeyZ)?1:0,v=(IN.run?24:9)*(sobe-desce);
  P.vy=0;P.y+=v*dt;const chao=chaoEm(P.x,P.z,P.y+0.3);if(P.y<chao)P.y=chao;P.noChao=P.y<=chao+0.002;P.air=P.y-chao;P.coyote=0;};}
/* ao voltar ao menu, o jogo normal volta a valer */
{const _mm=mostrarMenu;mostrarMenu=function(){if(ADM.ativo)admSair();const r=_mm.apply(this,arguments);admBotoes();return r;};}
{const _aj=ajustesUI;ajustesUI=function(){const r=_aj.apply(this,arguments);const el=$('aj-criativo');
  if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(cfg.criativo===1?1:0))));return r;};}
PASSOS.push(function criativoPasso(dt){P.voo=ADM.ativo&&ADM.voar&&P.alive&&!CARRO.ativo&&!P.montado&&!P.nada&&!P.escala;if(!ADM.ativo)return;if(ADM.imortal){P.vida=100;}});
/* v10.2.2: pose de voo. Antes o corpo ficava com a pose de quem está caindo (braços abertos e joelhos dobrados) parado no ar.
   Agora, no ar com o voo ligado, o corpo fica de pé, relaxado (o clipe de parado, no 62z_sobrevivente.js), e inclina para a
   frente conforme a velocidade (até uns 30 graus com Shift), girando em volta do meio do corpo e não dos pés; parado no ar,
   balança de leve. */
{const _aj=animarJogador;animarJogador=function(dt){_aj.apply(this,arguments);const ch=P.ch;
  const voando=P.voo&&!P.noChao,b=P.body,fr=(P.vx*Math.sin(b)+P.vz*Math.cos(b)),lat=(P.vx*Math.cos(b)-P.vz*Math.sin(b));
  P.vooK=approach(P.vooK||0,voando?1:0,dt*4);
  const alvo=voando?clamp(fr/34,-0.35,1)*0.55:0;P.vooP=lerp(P.vooP||0,alvo,1-Math.exp(-dt*5));
  if(P.vooK<0.001&&Math.abs(P.vooP)<0.001)return;
  const th=P.vooP*P.vooK,c=0.95;ch.pitch=th;
  ch.x-=Math.sin(b)*c*Math.sin(th);ch.z-=Math.cos(b)*c*Math.sin(th);ch.y+=c*(1-Math.cos(th))+Math.sin(G.t*1.7)*0.035*P.vooK*(1-clamp(Math.hypot(fr,lat)/6,0,1));};}

/* ---------- entrar e sair ---------- */
function admBotoes(){const m=$('m-criativo');if(m)m.hidden=cfg.criativo!==1;const p=$('p-criativo');if(p)p.hidden=!ADM.ativo;
  document.body.classList.toggle('criativo',ADM.ativo);}
function admEntrar(){if(cfg.criativo!==1)return false;ADM.ativo=true;admBotoes();try{audioInit();}catch(_){}
  if(temSave()&&carregarJogo()){jogar();admAviso();return true;}
  novoJogo();jogar();admAviso();return true;}
function admAviso(){feed('Modo criativo: aperte \' (do lado do 1) para abrir o painel. Este jogo fica separado do normal.');}
function admSair(){ADM.ativo=false;ADM.voar=ADM.imortal=ADM.gratis=ADM.liberar=false;admBotoes();}
function admRecomecar(){if(!ADM.ativo)return;apagarSaves();novoJogo();admFechar();feed('Mundo criativo novo.');}

/* ---------- painel ---------- */
function admAbrir(){if(!ADM.ativo||(G.modo!=='jogo'&&G.modo!=='pausa'))return;G.modo='criativo';tela('t-criativo');if(document.pointerLockElement)document.exitPointerLock();admRender();}
function admFechar(){if(G.modo!=='criativo')return;G.modo='jogo';tela(null);if(typeof pedirTrava==='function')pedirTrava();}
const ADM_ABAS=[['jogador','Jogador'],['ir','Ir para'],['tempo','Tempo'],['criar','Criar'],['eventos','Eventos']];
function admBtn(id,t,s,on){return'<button type="button" class="btn'+(on?' prim':'')+'" data-a="'+id+'"'+(on!==undefined?' aria-pressed="'+!!on+'"':'')+'><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</button>';}
function admRender(){const abas=$('ad-abas'),c=$('ad-corpo');if(!abas||!c)return;
  abas.innerHTML=ADM_ABAS.map(([k,n])=>'<button type="button" data-aba="'+k+'" aria-pressed="'+(ADM.aba===k)+'">'+n+'</button>').join('');
  let h='';const A=ADM.aba;
  if(A==='jogador'){h+='<div class="vc-acoes">'+admBtn('voar','Voar',ADM.voar?'ligado · Espaço sobe, Ctrl ou Z desce, Shift acelera':'desligado',ADM.voar)+admBtn('imortal','Imortal',ADM.imortal?'ligado':'desligado',ADM.imortal)
      +admBtn('gratis','Sem gastar material',ADM.gratis?'ligado: fabricar e construir de graça':'desligado',ADM.gratis)+admBtn('liberar','Liberar tudo',ADM.liberar?'ligado: receitas, construções e estações':'desligado',ADM.liberar)
      +admBtn('encher','Encher tudo','vida, fome, sede e energia')+admBtn('curar','Curar','sangramento, perna, vírus e esporos')+admBtn('nivel','Subir um nível','+1 ponto de talento')
      +admBtn('recomecar','Recomeçar o mundo criativo','apaga só o jogo criativo')+admBtn('sair','Sair do modo criativo','salva e volta ao menu')+'</div>';}
  else if(A==='ir'){h+='<div class="vc-acoes">'+admLugares().map((l,i)=>admBtn('ir:'+i,l.nome,l.sub||'')).join('')+'</div>';}
  else if(A==='tempo'){h+='<p class="es-sub">Hora</p><div class="vc-acoes">'+[0,3,6,9,12,15,18,21].map(hh=>admBtn('hora:'+hh,(hh<10?'0':'')+hh+':00','')).join('')+'</div>';
    h+='<p class="es-sub">Clima até o fim do dia</p><div class="vc-acoes">'+[['limpo','Limpo'],['nublado','Nublado'],['chuva','Chuva'],['tempestade','Tempestade'],['neblina','Neblina'],['calor','Calor'],['frio','Frente fria']].map(([k,n])=>admBtn('clima:'+k,n,'')).join('')+'</div>';
    h+='<div class="vc-acoes">'+admBtn('lua','Lua de sangue esta noite',G.luaSangue?'marcada':'',!!G.luaSangue)+'</div>';}
  else if(A==='criar'){h+='<div class="ad-linha"><input id="ad-busca" type="search" placeholder="Procurar item" value="'+ADM.busca.replace(/"/g,'&quot;')+'"><div class="segs" id="ad-qtd">'
      +[1,5,20].map(q=>'<button type="button" data-q="'+q+'" aria-pressed="'+(ADM.qtd===q)+'">'+q+'</button>').join('')+'</div></div>';
    const b=ADM.busca.trim().toLowerCase(),its=Object.keys(ITEMS).filter(k=>!b||ITEMS[k].nome.toLowerCase().includes(b)||k.toLowerCase().includes(b));
    h+='<p class="es-sub">Itens ('+its.length+')</p><div class="vc-acoes ad-itens">'+its.slice(0,60).map(k=>admBtn('item:'+k,ITEMS[k].nome,TIPO_NOME[ITEMS[k].tipo]||'')).join('')+'</div>';
    h+='<p class="es-sub">Bichos</p><div class="vc-acoes">'+Object.keys(FAUNA).map(k=>admBtn('bicho:'+k,FAUNA[k].nome,'')).join('')+'</div>';
    h+='<p class="es-sub">Zumbis e chefes</p><div class="vc-acoes">'+Object.keys(ZS).map(k=>admBtn('zumbi:'+k,ADM_ZNOME[k]||k,'')).join('')+'</div>';
    h+='<p class="es-sub">Veículos prontos para andar</p><div class="vc-acoes">'+Object.keys(VTIPOS).map(k=>admBtn('veic:'+k,VTIPOS[k].nome,VTIPOS[k].agua?'na água':'')).join('')+'</div>';}
  else if(A==='eventos'){h+='<div class="vc-acoes">'+[['enchente','Enchente','o rio sobe'],['incendio','Incêndio na mata','numa árvore perto'],['estrada','Estrada bloqueada',''],['infestacao','Infestação','ninho de zumbis'],
      ['comboio','Comboio do Exército',''],['frutas','Fartura de frutas',''],['cardume','Cardume',''],['aviao','Suprimentos de avião','caem perto de você'],['colosso','Colosso agora','perto de você']].map(([k,n,s])=>admBtn('ev:'+k,n,s)).join('')+'</div>';}
  c.innerHTML=h;$('ad-msg').textContent=ADM.msg;ADM.msg='';
  const bu=$('ad-busca');if(bu){bu.addEventListener('input',()=>{ADM.busca=bu.value;const pos=bu.selectionStart;admRender();const nb=$('ad-busca');if(nb){nb.focus();try{nb.setSelectionRange(pos,pos);}catch(_){}}});}}
const ADM_ZNOME={walker:'Zumbi comum',runner:'Corredor',brute:'Brutamontes',screamer:'Gritador',colosso:'Colosso',rastejante:'Rastejante',policial:'Policial',inchado:'Inchado',
  caoZ:'Cachorro zumbi',acougueiro:'O Açougueiro',sargento:'O Sargento',pacienteZero:'Paciente Zero',maquinista:'O Maquinista',fazendeiro:'O Fazendeiro',emboscada:'Zumbi de emboscada',elite:'Zumbi de elite',sentinela:'Sentinela'};

/* lugares para onde ir (calculados na hora: o mapa é montado no começo do jogo) */
function admLugares(){const L=[];
  for(const p of PLACES)L.push({nome:p.nome,x:p.x,z:p.z+(p.r?Math.min(p.r*0.4,6):0)});
  for(const t of TERR_DEF)if(t.id==='estacao'||t.id==='mina')L.push({nome:t.nome,x:t.x,z:t.z});
  const E=EST_MUNDO.find(e=>e.id==='defumadorLago');if(E)L.push({nome:'Cabana do pescador',sub:'lago',x:E.x+2,z:E.z+2});
  if(typeof CID!=='undefined'&&CID&&CID.predios){for(const nome of['Hospital São Lucas','Delegacia do 4º Distrito','Mercado Bom Preço','Armazém Sul','Hotel Imperial','Oficina do Zé']){
    const p=CID.predios.find(q=>q.nome===nome);if(!p||p.x0===undefined)continue;const cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,f=p.frente||'N';
    L.push({nome:p.nome,sub:'cidade, na frente',x:f==='E'?p.x1+2.5:f==='W'?p.x0-2.5:cx,z:f==='N'?p.z0-2.5:f==='S'?p.z1+2.5:cz});}}
  if(typeof AEREO!=='undefined'&&AEREO.destrocos)for(const d of AEREO.destrocos)L.push({nome:d.nome,sub:'destroços',x:d.x+3,z:d.z+3});
  return L;}
function admIr(x,z){if(CARRO.ativo&&typeof sairCarro==='function')sairCarro();const y=chaoEm(x,z,ground(x,z)+1.5);
  P.x=x;P.z=z;P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;if(typeof rebuildVeg==='function')rebuildVeg(true);}
/* um ponto na frente do jogador, no chão */
function admFrente(d){const x=P.x+Math.sin(P.yaw)*d,z=P.z+Math.cos(P.yaw)*d;return{x,z,y:chaoEm(x,z,P.y+2)};}

function admAcao(a){const[k,v]=a.split(/:(.*)/s);
  switch(k){
    case'voar':ADM.voar=!ADM.voar;if(!ADM.voar)P.vy=0;P.voo=ADM.voar;break;
    case'imortal':ADM.imortal=!ADM.imortal;break;
    case'gratis':ADM.gratis=!ADM.gratis;break;
    case'liberar':ADM.liberar=!ADM.liberar;break;
    case'encher':P.vida=100;P.fome=100;P.sede=100;P.energia=100;if('sono'in P)P.sono=100;ADM.msg='Vida, fome, sede, energia e sono cheios.';break;
    case'curar':if(P.lesoes)Object.assign(P.lesoes,{sangra:0,sangraT:0,perna:0,tala:false,pernaH:0,virus:0});if('esporo'in P)P.esporo=0;P.vida=100;ADM.msg='Ferimentos, vírus e esporos curados.';break;
    case'nivel':G.nivel=(G.nivel||1)+1;G.pontos=(G.pontos||0)+1;ADM.msg='Nível '+G.nivel+': 1 ponto de talento a mais.';break;
    case'recomecar':admRecomecar();return;
    case'sair':admFechar();salvarJogo();mostrarMenu();return;
    case'ir':{const l=admLugares()[+v];if(l){admIr(l.x,l.z);ADM.msg='Você foi para '+l.nome+'.';}break;}
    case'hora':{G.hora=+v;const noite=G.hora>=20||G.hora<6;   // pular para a noite começa a noite (ondas); pular para o dia amanhece
      if(noite&&!G.noite)inicioNoite();else if(!noite&&G.noite)inicioDia(false);ADM.msg='Agora são '+v+'h.';break;}
    case'clima':if(G.clima){G.clima.segs=v==='limpo'?[]:[[0,30,v]];}ADM.msg='Clima: '+v+' até o fim do dia.';break;
    case'lua':G.luaSangue=!G.luaSangue;ADM.msg=G.luaSangue?'Esta noite é de lua de sangue.':'Lua de sangue desmarcada.';break;
    case'item':{const n=Math.min(ADM.qtd,ITEMS[v].max||99);ganhar(v,n);ADM.msg='+'+n+' '+ITEMS[v].nome+'.';break;}
    case'bicho':{const f=admFrente(7);const b=criarBicho(v,f.x,f.z);ADM.msg=b?'Na sua frente: '+FAUNA[v].nome+'.':'Não deu para criar esse bicho aqui.';break;}
    case'zumbi':{const f=admFrente(8);let z=null;if(v==='colosso'&&typeof criarChefe==='function')z=criarChefe(f.x,f.z);else z=criarZ(v,f.x,f.z,{y:f.y});ADM.msg=z?'Na sua frente: '+(ADM_ZNOME[v]||v)+'.':'Não deu para criar aqui (limite de zumbis?).';break;}
    case'veic':{const T=VTIPOS[v],f=admFrente(T.agua?6:5);if(T.agua&&!(typeof aguaNivel==='function'&&aguaNivel(f.x,f.z)!==null)){ADM.msg='Esse veículo precisa de água: vá até a beira do rio ou do lago.';break;}
      veicNovo(v,f.x,f.z,P.yaw+Math.PI/2,{id:'adm'+Date.now().toString(36),comb:100,oleo:100,visto:true});ADM.msg='Na sua frente: '+T.nome+', '+(T.art==='a'?'pronta':'pronto')+' para andar.';break;}
    case'ev':ADM.msg=admEvento(v);break;}
  admRender();}
function admEvento(t){const M=mundoD();
  if(t==='enchente'){if(!RIO.ok)return'Este mapa não tem rio.';const C=M.cheia;if(C.ativa)return'Já está tendo enchente.';C.ativa=true;C.alvo=1.0+Math.random()*0.5;C.fim=G.tm+8*60;C.chuva=0;
    evAviso('clima','O rio está subindo! As margens baixas vão alagar. Cuidado com o carro perto da água.','Enchente do Rio Claro');return'Enchente começou.';}
  if(t==='incendio'){let best=null,bd=1e9;for(const q of TREES){if(!q.alive||q.agua||q.fogo)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<25||d>90)continue;if(d<bd){bd=d;best=q;}}
    return best&&incendioComecar(best,'criativo')?'Incêndio começou a '+Math.round(bd)+' m.':'Não deu (já tem um incêndio ou não há árvore perto).';}
  if(t==='estrada')return estradaComecar()===true?'Estrada bloqueada (veja no mapa).':'Não deu para bloquear uma estrada agora.';
  if(t==='infestacao')return infestacaoComecar()===true?'Infestação começou (veja no mapa).':'Não deu para começar uma infestação agora.';
  if(t==='comboio')return comboioComecar()===true?'Comboio apareceu (veja no mapa).':'Não deu para criar o comboio agora.';
  if(t==='frutas'){for(const b of BUSHES)if(!b.agua)b.frutas=true;vegDirty=true;M.frutas=G.dia;evAviso('clima','Época de frutas: os arbustos amanheceram carregados.','Fartura de frutas');return'Fartura de frutas.';}
  if(t==='cardume'){M.cardume=G.tm+24*60;evAviso('clima','Cardume subindo o rio! Hoje o peixe morde bem mais rápido no rio e no lago.','Cardume no rio');return'Cardume no rio e no lago.';}
  if(t==='aviao')return aereoLancar(P.x+10,P.z+10,'criativo')?'O avião está vindo: a caixa cai perto de você.':'Já tem um avião a caminho.';
  if(t==='colosso'){const f=admFrente(25);const z=typeof criarChefe==='function'?criarChefe(f.x,f.z):null;return z?'O Colosso apareceu.':'Não deu para criar o Colosso.';}
  return'';}

/* ---------- botões e teclas ---------- */
{const m=$('m-criativo');if(m)m.addEventListener('click',()=>{sfx('clique');admEntrar();});
  const p=$('p-criativo');if(p)p.addEventListener('click',()=>{sfx('clique');G.modo='jogo';tela(null);admAbrir();});
  const f=$('ad-fechar');if(f)f.addEventListener('click',()=>{sfx('clique');admFechar();});
  const ab=$('ad-abas');if(ab)ab.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ADM.aba=b.dataset.aba;sfx('clique');admRender();});
  const c=$('ad-corpo');if(c)c.addEventListener('click',e=>{const q=e.target.closest('[data-q]');if(q){ADM.qtd=+q.dataset.q;sfx('clique');admRender();return;}
    const b=e.target.closest('button[data-a]');if(!b)return;sfx('clique');admAcao(b.dataset.a);});
  const aj=$('aj-criativo');if(aj)aj.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg.criativo=+b.dataset.v;saveCfg();ajustesUI();admBotoes();sfx('clique');});}
window.addEventListener('keydown',e=>{if(!ADM.ativo)return;if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='Backquote'){e.preventDefault();if(G.modo==='jogo')admAbrir();else if(G.modo==='criativo')admFechar();}
  else if(e.code==='Escape'&&G.modo==='criativo'){admFechar();}});
admBotoes();

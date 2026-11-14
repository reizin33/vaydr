/* ================= Etapa 11: controles e interface =================
   Teclas: toda ação do teclado troca de tecla em Ajustes → Teclas e controle. A tecla escolhida faz o que a de fábrica fazia, em
   todo o jogo (as dicas na tela mostram a tecla nova); se a tecla já era de outra ação, as duas trocam. Tab, Esc, setas e
   números ficam fixos. "Voltar às teclas de fábrica" desfaz tudo.
   Controle (gamepad), do começo ao fim:
   · no jogo: esquerdo anda (aperte: correr), direito olha (aperte: câmera), A pula, B agacha (correndo: rola), X usa (segure:
     revistar), Y troca de arma, RT ataca, LT mira, LB empurra (no carro: buzina), RB recarrega, ↑ lanterna, ↓ construir,
     ← → item da mão, Select mochila (segure: mapa), Start pausa;
   · construindo: ← → escolhem a peça, LB troca a aba, RB gira, RT constrói, Y conserta tudo, B sai;
   · nos menus e painéis (menu inicial, pausa, mochila, fabricação, estações, rádio, diário, mapa, teclado de senha...):
     direcional ou analógico escolhe, A aperta, B volta ou fecha, LB e RB trocam de aba, analógico direito rola a lista;
     no controle deslizante, ← → mudam o valor.
   Ajustes novos: inverter o olhar vertical (mouse, toque e controle), sensibilidade do controle, distância da câmera em 3ª
   pessoa e tamanho da interface. A pausa ganhou o botão Mapa.
   Diário: aba Receitas com tudo o que você sabe fabricar (onde e como aprendeu, e quando), mais as plantas de construção;
   cada receita aprendida entra no histórico. */

/* ---------- troca de teclas ---------- */
const ACOES_TECLA=[
  ['frente','Andar para frente','KeyW'],['tras','Andar para trás','KeyS'],['esq','Andar para a esquerda','KeyA'],['dir','Andar para a direita','KeyD'],
  ['correr','Correr','ShiftLeft'],['pular','Pular e subir','Space'],['agachar','Agachar (correndo: rolar)','KeyC'],
  ['usar','Usar e pegar (segure: revistar)','KeyE'],['recarregar','Recarregar (construindo: girar a peça)','KeyR'],['empurrar','Empurrar','KeyQ'],
  ['lanterna','Lanterna','KeyF'],['largar','Largar o item da mão','KeyG'],['camera','Primeira ou terceira pessoa','KeyV'],
  ['construir','Construir','KeyB'],['mochila','Mochila (além do Tab)','KeyI'],['mapa','Mapa','KeyM'],['diario','Diário','KeyJ'],
  ['territorios','Territórios, rádio e grupo','KeyK'],['foto','Modo foto','KeyP'],['buzina','Buzina do veículo','KeyH'],
  ['consertarTudo','Consertar tudo (construindo)','KeyT'],['sensMenos','Sensibilidade do mouse −','Minus'],['sensMais','Sensibilidade do mouse +','Equal']
].map(([id,nome,pad])=>({id,nome,pad}));
const TECLAS_FIXAS=/^(Escape|Tab|Digit\d|Numpad\d|Arrow\w+|F\d+|Meta\w*|OS\w*|ContextMenu)$/;
function teclaDe(id){const a=ACOES_TECLA.find(q=>q.id===id);return(cfg.mapaTeclas&&cfg.mapaTeclas[id])||(a&&a.pad)||'';}
function nomeTecla(c){if(!c)return'—';if(c.startsWith('Key'))return c.slice(3);if(c.startsWith('Digit'))return c.slice(5);if(c.startsWith('Numpad'))return'Num '+c.slice(6);
  return{Space:'Espaço',ShiftLeft:'Shift',ShiftRight:'Shift dir.',ControlLeft:'Ctrl',ControlRight:'Ctrl dir.',AltLeft:'Alt',AltRight:'AltGr',Minus:'-',Equal:'=',
    BracketLeft:'´',BracketRight:'[',Semicolon:'Ç',Quote:'~',Backquote:"'",Backslash:']',IntlBackslash:'\\',IntlRo:'/',Comma:',',Period:'.',Slash:';',CapsLock:'Caps Lock',
    Enter:'Enter',Backspace:'Backspace',Delete:'Delete',Insert:'Insert',Home:'Home',End:'End',PageUp:'Page Up',PageDown:'Page Down'}[c]||c;}
function chaveDe(c){if(c.startsWith('Key'))return c.slice(3).toLowerCase();if(c.startsWith('Digit'))return c.slice(5);return{Space:' ',ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Control',Minus:'-',Equal:'='}[c]||c;}
/* tradução tecla apertada → tecla de fábrica da ação; tecla de fábrica que ficou sem ação não faz nada */
let TRAD=null;
function montarTraducao(){const T={},usadas=new Set(ACOES_TECLA.map(a=>teclaDe(a.id)));
  for(const a of ACOES_TECLA){const u=teclaDe(a.id);if(u!==a.pad)T[u]=a.pad;}
  for(const a of ACOES_TECLA){const u=teclaDe(a.id);if(u!==a.pad&&!usadas.has(a.pad))T[a.pad]=null;}
  TRAD=Object.keys(T).length?T:null;}
let capturaTecla=null,teclasMsg='';
for(const tipo of['keydown','keyup'])window.addEventListener(tipo,e=>{if(e.__vaydr)return;
  if(capturaTecla&&tipo==='keydown'){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;const c=e.code;
    if(c==='Escape'){capturaTecla=null;teclasMsg='Troca cancelada.';teclasRender();return;}
    if(TECLAS_FIXAS.test(c)||!c){teclasMsg='Essa tecla é fixa: escolha outra.';sfx('vazio');teclasRender();return;}
    definirTecla(capturaTecla,c);capturaTecla=null;teclasRender();return;}
  if(!TRAD||!(e.code in TRAD))return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||''))return;
  e.preventDefault();e.stopImmediatePropagation();const novo=TRAD[e.code];if(!novo)return;
  const ev=new KeyboardEvent(tipo,{code:novo,key:chaveDe(novo),bubbles:true,cancelable:true,repeat:e.repeat,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey});ev.__vaydr=1;(e.target||window).dispatchEvent(ev);},true);
function definirTecla(id,c){const M=Object.assign({},cfg.mapaTeclas||{}),atual=teclaDe(id),outro=ACOES_TECLA.find(a=>a.id!==id&&teclaDe(a.id)===c);
  M[id]=c;if(outro)M[outro.id]=atual;for(const a of ACOES_TECLA)if(M[a.id]===a.pad)delete M[a.id];
  cfg.mapaTeclas=M;saveCfg();montarTraducao();rotulosTeclas();
  teclasMsg=ACOES_TECLA.find(a=>a.id===id).nome+': '+nomeTecla(c)+(outro?'. '+outro.nome+' ficou com '+nomeTecla(atual)+'.':'.');sfx('clique');}
/* dicas na tela com as teclas escolhidas */
function rotulosTeclas(){const k=id=>nomeTecla(teclaDe(id)),el=$('teclas');
  if(el){const x=$('teclas-x');for(const n of[...el.children])if(n!==x)n.remove();
    const L=[[[k('frente'),k('esq'),k('tras'),k('dir')].join(' '),'Andar · '+k('correr')+' corre'],[k('agachar'),'Agachar · '+k('pular')+' pula'],['Clique','Atacar · '+k('empurrar')+' empurra'],
      [k('usar'),'Usar · segure para revistar'],['Tab','Mochila · '+k('construir')+' constrói'],[k('largar'),'Largar o item da mão'],[k('mapa'),'Mapa · '+k('diario')+' diário'],
      [k('camera'),'Câmera · '+k('lanterna')+' lanterna'],['← →','Girar a câmera']];
    for(const[a,b]of L){const kb=document.createElement('kbd');kb.textContent=a;const sp=document.createElement('span');sp.textContent=b;el.append(kb,sp);}}
  for(const[sel,id,tit]of[['#u-construir','construir','Construir'],['#u-camera','camera','Primeira ou terceira pessoa'],['#u-lanterna','lanterna','Lanterna']]){const b=document.querySelector(sel);if(!b)continue;
    const kb=b.querySelector('kbd');if(kb)kb.textContent=k(id);b.title=tit+' ('+k(id)+')';}
  for(const[sel,id]of[['#o-girar kbd','recarregar'],['#o-sair kbd','construir'],['#o-consertar kbd','consertarTudo'],['#prompt kbd','usar'],['#mapa-x kbd','mapa']]){const e=document.querySelector(sel);if(e)e.textContent=k(id);}}
const PAD_AJUDA=[['Analógico esquerdo','andar (aperte: correr)'],['Analógico direito','olhar (aperte: 1ª/3ª pessoa)'],['A','pular e subir'],['B','agachar · correndo, rolar'],
  ['X','usar · segure: revistar'],['Y','trocar de arma'],['RT','atacar'],['LT','mirar'],['LB','empurrar · no carro: buzina'],['RB','recarregar'],['↑','lanterna'],['↓','construir'],
  ['← →','item da mão'],['Select','mochila · segure: mapa'],['Start','pausa'],['Construindo','← → peça · LB aba (segure: roda de peças) · RB gira · RT constrói · Y conserta tudo · B sai'],
  ['Nos menus','direcional escolhe · A aperta · B volta · LB e RB trocam a aba · analógico direito rola']];
function abrirTeclas(){capturaTecla=null;teclasMsg='';tela('t-teclas');teclasRender();}
function teclasRender(){const el=$('tk-lista');if(!el)return;let h='';
  for(const a of ACOES_TECLA){const c=teclaDe(a.id),ouv=capturaTecla===a.id;h+='<span>'+a.nome+'</span><button type="button" data-tk="'+a.id+'" class="'+(ouv?'ouvindo':c!==a.pad?'mudou':'')+'" aria-label="'+a.nome+': '+nomeTecla(c)+'">'+(ouv?'aperte…':nomeTecla(c))+'</button>';}
  el.innerHTML=h;const m=$('tk-msg');if(m)m.textContent=teclasMsg;const p=$('tk-pad');if(p&&!p.dataset.ok){p.dataset.ok=1;p.innerHTML=PAD_AJUDA.map(([a,b])=>'<b>'+a+'</b><span>'+b+'</span>').join('');}}
{const l=$('tk-lista');if(l)l.addEventListener('click',e=>{const b=e.target.closest('[data-tk]');if(!b)return;capturaTecla=capturaTecla===b.dataset.tk?null:b.dataset.tk;
    teclasMsg=capturaTecla?'Aperte a tecla nova para "'+ACOES_TECLA.find(a=>a.id===capturaTecla).nome+'" (Esc cancela).':'';teclasRender();sfx('clique');});
  const p=$('tk-padrao');if(p)p.addEventListener('click',()=>{cfg.mapaTeclas={};saveCfg();montarTraducao();rotulosTeclas();capturaTecla=null;teclasMsg='As teclas de fábrica voltaram.';teclasRender();sfx('clique');});
  const o=$('tk-ok');if(o)o.addEventListener('click',()=>{capturaTecla=null;ajustesUI();tela('t-ajustes');sfx('clique');});}
TELAS.push('t-teclas');

/* ---------- ajustes novos ---------- */
function aplicarHud(){const v=+cfg.hudEsc||1;hudEl.classList.toggle('esc',v!==1);hudEl.style.setProperty('--hud-esc',String(v));}
{const _aj=ajustesUI;ajustesUI=function(){const r=_aj.apply(this,arguments);const set=(id,v)=>{const el=$(id);if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(v))));};
  set('aj-invy',cfg.invY?1:0);set('aj-hud',String(+cfg.hudEsc||1));
  for(const[id,k]of[['aj-sensgp','sensGP'],['aj-camdist','camDist']]){const el=$(id),v=+cfg[k]||1;if(el)el.value=v;const t=$(id+'-v');if(t)t.textContent=v.toFixed(2);}return r;};}
{const _ap=aplicarCfg;aplicarCfg=function(){const r=_ap.apply(this,arguments);aplicarHud();return r;};}
{const seg=(id,f)=>{const el=$(id);if(el)el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;f(b.dataset.v);saveCfg();ajustesUI();sfx('clique');});};
  seg('aj-invy',v=>{cfg.invY=+v;});seg('aj-hud',v=>{cfg.hudEsc=+v;aplicarHud();});
  const rng=(id,k)=>{const el=$(id);if(el)el.addEventListener('input',e=>{cfg[k]=+e.target.value;saveCfg();const t=$(id+'-v');if(t)t.textContent=cfg[k].toFixed(2);});};
  rng('aj-sensgp','sensGP');rng('aj-camdist','camDist');
  const b=$('aj-teclas-btn');if(b)b.addEventListener('click',()=>{abrirTeclas();sfx('clique');});
  const pm=$('p-mapa');if(pm)pm.addEventListener('click',()=>{G.modo='jogo';tela(null);abrirMapa();});}
/* olhar invertido: mouse e toque passam por olhar() */
{const _ol=olhar;olhar=function(dx,dy,k){return _ol.call(this,dx,cfg.invY?-dy:dy,k);};}

/* ---------- controle (gamepad) ---------- */
const GP2={selT:0,dir:null,repT:0,t:0};
function padAtual(){if(!navigator.getGamepads)return null;for(const g of navigator.getGamepads())if(g&&g.connected)return g;return null;}
function padPeca(d){const L=obrasOrdem();if(!L.length)return;const i=L.indexOf(OBRA.tipo);OBRA.tipo=L[((i<0?0:i)+d+L.length)%L.length];motivoMostrado=null;hudObras();sfx('clique');}
function padAbaObra(){const L=obrasOrdem(),cats=OBRA_CATS.filter(c=>L.some(k=>obraCat(k)===c.id));if(!cats.length)return;const cur=obraCat(OBRA.tipo),j=(cats.findIndex(c=>c.id===cur)+1)%cats.length,c2=cats[j];
  const LC=L.filter(k=>obraCat(k)===c2.id),u=OBRA.ultimo&&OBRA.ultimo[c2.id];OBRA.tipo=LC.includes(u)?u:LC[0];motivoMostrado=null;hudObras();sfx('clique');}
/* no jogo (o laço do jogo chama a cada quadro) */
lerControle=function(dt){if(!GP.ativo||G.modo!=='jogo')return;const gp=padAtual();if(!gp)return;
  const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5)),A=GP.ant,apertou=i=>b(i)&&!A[i],soltou=i=>!b(i)&&A[i],obra=OBRA.ativo;
  const lx=zonaMorta(gp.axes[0]||0,0.16),ly=zonaMorta(gp.axes[1]||0,0.16);
  if(lx||ly){IN.mx=lx;IN.mz=-ly;GP.mov=true;}else if(GP.mov){GP.mov=false;IN.mx=IN.mz=0;moverTeclas();}
  const rx=zonaMorta(gp.axes[2]||0,0.12),ry=zonaMorta(gp.axes[3]||0,0.12);
  if(rx||ry){const k=dt*(P.aim>0.5?1.6:2.9)*(cfg.sens||1)*(cfg.sensGP||1),iv=cfg.invY?-1:1,fp=cfg.cam==='1'&&!CARRO.ativo;P.yaw-=rx*k;P.pitch=clamp(P.pitch-ry*k*0.75*iv,fp?-1.45:-1.25,fp?1.35:1.05);}
  if(apertou(10)){IN.runFix=!IN.runFix;IN.run=IN.runFix;if(IN.run&&P.agachado)agachar(false);}
  if(IN.runFix&&!(lx||ly)&&!KEYS.ShiftLeft){IN.runFix=false;IN.run=false;}
  if(apertou(0)){if(CARRO.ativo)IN.freio=true;else pular();}if(soltou(0))IN.freio=false;
  if(apertou(1)){if(obra)modoObra(false);else if(!CARRO.ativo){if(IN.run&&(lx||ly)&&rolar()){}else agachar();}}
  if(!obra){if(apertou(2))usarPress();if(soltou(2))usarSolta();}
  if(apertou(3)){if(obra){if(typeof consertarTudoUI==='function')consertarTudoUI();}
    else{const n=BAR_N;for(let k=1;k<=n;k++){const j=(P.sel+k)%n;if(P.inv[j]&&ITEMS[P.inv[j].id]&&(ITEMS[P.inv[j].id].tipo==='arma'||ITEMS[P.inv[j].id].mao)){selecionar(j);break;}}}}
  if(b(7)||(gp.buttons[7]&&gp.buttons[7].value>0.35)){if(!A[7]){if(obra)colocarObra();else{IN.attack=true;IN.atkQ=true;}}}else if(A[7])IN.attack=false;
  IN.aim=!obra&&(b(6)||!!(gp.buttons[6]&&gp.buttons[6].value>0.35));
  if(apertou(4)){if(obra)padAbaObra();else if(CARRO.ativo)buzinar();else empurrar();}
  if(apertou(5)){if(obra)OBRA.rot+=Math.PI/4;else recarregar();}
  if(apertou(11))trocarCamera();if(apertou(12))lanterna();if(apertou(13)&&!CARRO.ativo)modoObra();
  if(apertou(14)){if(obra)padPeca(-1);else selecionar((P.sel+BAR_N-1)%BAR_N);}if(apertou(15)){if(obra)padPeca(1);else selecionar((P.sel+1)%BAR_N);}
  // Select: toque abre a mochila; segurando meio segundo abre o mapa
  if(apertou(8))GP2.selT=0;if(b(8)){const t0=GP2.selT;GP2.selT+=dt;if(t0<0.5&&GP2.selT>=0.5)abrirMapa();}else if(soltou(8)&&GP2.selT<0.5)abrirMochila();
  if(apertou(9))pausar();
  for(let i=0;i<gp.buttons.length;i++)A[i]=b(i);};
/* nos menus e painéis: escolher, apertar, voltar, abas e rolar */
function menuAtivo(){if(G.modo==='mochila'){const i=$('inv');if(i&&!i.hidden)return i;}
  for(const id of TELAS){const el=$(id);if(el&&!el.hidden)return el;}return[...document.querySelectorAll('.tela')].find(e=>!e.hidden)||null;}
function focaveis(c){if(!c)return[];return[...c.querySelectorAll('button,input[type=range],select,a[href],[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&!e.closest('[hidden]')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');}
function navFoca(e){body.classList.add('gp-nav');e.focus({preventScroll:true});if(e.scrollIntoView)e.scrollIntoView({block:'nearest',inline:'nearest'});}
function navMover(c,dir){const L=focaveis(c);if(!L.length)return;const cur=document.activeElement;
  if(!L.includes(cur)){const p=c.querySelector('.prim:not([disabled])'),ini=p&&L.includes(p)?p:L[0];navFoca(ini);sfx('clique');return;}
  if(cur.type==='range'&&(dir==='esq'||dir==='dir')){const st=+cur.step||0.05,v=clamp(+cur.value+(dir==='dir'?st:-st),+cur.min,+cur.max);cur.value=String(Math.round(v*1000)/1000);
    cur.dispatchEvent(new Event('input',{bubbles:true}));cur.dispatchEvent(new Event('change',{bubbles:true}));return;}
  const r0=cur.getBoundingClientRect(),cx=(r0.left+r0.right)/2,cy=(r0.top+r0.bottom)/2;let best=null,bs=1e9;
  for(const e of L){if(e===cur)continue;const r=e.getBoundingClientRect(),ex=(r.left+r.right)/2,ey=(r.top+r.bottom)/2,dx=ex-cx,dy=ey-cy;let pri,sec;
    if(dir==='dir'||dir==='esq'){if(dir==='dir'?dx<=4:dx>=-4)continue;pri=Math.abs(dx);sec=Math.min(r.bottom,r0.bottom)-Math.max(r.top,r0.top)>2?0:Math.abs(dy);}
    else{if(dir==='baixo'?dy<=4:dy>=-4)continue;pri=Math.abs(dy);sec=Math.min(r.right,r0.right)-Math.max(r.left,r0.left)>2?0:Math.abs(dx);}
    const s=pri+sec*2.5;if(s<bs){bs=s;best=e;}}
  if(best){navFoca(best);sfx('clique');}}
function navVoltar(c){
  if(G.modo==='mochila'){fecharMochila();return;}if(G.modo==='mapa'){fecharMapa();return;}if(G.modo==='teclado'){fecharTeclado();return;}
  if(G.modo==='estacao'){fecharEstacao();return;}if(G.modo==='grupo'&&typeof fecharGrupo==='function'){fecharGrupo();return;}
  if(c&&c.id==='t-pausa'){G.modo='jogo';tela(null);return;}
  // telas abertas por cima da pausa ou do menu (ajustes, diário, conquistas...): o botão de voltar ou fechar delas
  const L=focaveis(c),bt=L.find(e=>/-(x|fechar|voltar|ok|nao)$/.test(e.id||'')&&e.id!=='p-voltar');
  if(bt){bt.click();sfx('clique');return;}
  if(G.modo==='pausa'){G.modo='jogo';tela(null);return;}
  window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}));}
function navAba(c,d){const T=[...c.querySelectorAll('.abas > button, .cq-abas > button')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));if(T.length<2)return;
  let i=T.findIndex(e=>e.getAttribute('aria-pressed')==='true'||e.getAttribute('aria-selected')==='true');if(i<0)i=0;const n=T[(i+d+T.length)%T.length];n.click();sfx('clique');}
function navRolar(c,dy){let e=document.activeElement&&c.contains(document.activeElement)?document.activeElement:c;
  while(e&&e!==c.parentElement){const s=getComputedStyle(e);if(e.scrollHeight>e.clientHeight+2&&/(auto|scroll)/.test(s.overflowY)){e.scrollTop+=dy;return;}e=e.parentElement;}c.scrollTop+=dy;}
function navApertar(c){const cur=document.activeElement;if(cur&&focaveis(c).includes(cur)){if(cur.type!=='range'){body.classList.add('gp-nav');cur.click();}}else navMover(c,'baixo');}
function padMenus(){requestAnimationFrame(padMenus);const agora=performance.now()/1000,dt=Math.min(0.1,agora-(GP2.t||agora));GP2.t=agora;
  if(!GP.ativo)return;const gp=padAtual();if(!gp)return;
  const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5)),A=GP.ant,apertou=i=>b(i)&&!A[i];
  if(gp.buttons.some((q,i)=>b(i))||gp.axes.some(v=>Math.abs(v)>0.4))GP2.usou=agora;
  if(G.modo==='jogo'){GP2.c=null;return;}const c=menuAtivo();
  // menu novo aberto com o controle em uso: o botão principal já vem escolhido (A aperta direto)
  if(c!==GP2.c){GP2.c=c;if(c&&agora-(GP2.usou||-99)<30){const L=focaveis(c),p=c.querySelector('.prim:not([disabled])'),ini=p&&L.includes(p)?p:L[0];if(ini&&!c.contains(document.activeElement))navFoca(ini);}}
  if(c){const ax=gp.axes[0]||0,ay=gp.axes[1]||0;let dir=null;if(b(12)||ay<-0.55)dir='cima';else if(b(13)||ay>0.55)dir='baixo';else if(b(14)||ax<-0.55)dir='esq';else if(b(15)||ax>0.55)dir='dir';
    if(dir){if(dir!==GP2.dir){GP2.dir=dir;GP2.repT=0.38;navMover(c,dir);}else{GP2.repT-=dt;if(GP2.repT<=0){GP2.repT=0.11;navMover(c,dir);}}}else GP2.dir=null;
    if(apertou(0))navApertar(c);if(apertou(1))navVoltar(c);if(apertou(4))navAba(c,-1);if(apertou(5))navAba(c,1);
    if(apertou(9)){if(G.modo==='pausa'||G.modo==='mochila')navVoltar(c);else if(G.modo==='menu'||G.modo==='morto'||G.modo==='fim')navApertar(c);else navVoltar(c);}
    if(apertou(8)&&G.modo==='mochila')navVoltar(c);
    const ry=zonaMorta(gp.axes[3]||0,0.2);if(ry)navRolar(c,ry*dt*900);}
  else if(apertou(1)||apertou(9))window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}));   // modo foto e telas sem lista
  for(let i=0;i<gp.buttons.length;i++)A[i]=b(i);}
requestAnimationFrame(padMenus);
window.addEventListener('mousemove',()=>{if(body.classList.contains('gp-nav'))body.classList.remove('gp-nav');});

/* ---------- diário: receitas aprendidas ---------- */
DIARIO_ICO.receita='i-livro';
function diarioAprendeu(rs,como){const D=diarioD();if(!D.rec)D.rec={};const nomes=[];
  for(const r of rs){if(D.rec[r.faz]!==undefined)continue;D.rec[r.faz]=Math.round(G.tm||0);nomes.push(ITEMS[r.faz].nome.toLowerCase());}
  if(nomes.length)diarioEvento('Aprendeu '+(nomes.length>1?'as receitas: ':'a receita: ')+listaE(nomes)+(como?' ('+como+')':''),'receita');}
{const _mv=marcarVisto;marcarVisto=function(id){const novo=!!(G.fab&&!G.fab.visto[id]);const r=_mv.apply(this,arguments);
  if(novo&&G.fab.visto[id]&&ITEMS[id]&&G.modo!=='menu')diarioAprendeu(RECIPES.filter(q=>q.desb&&q.desb.item===id),'ao pegar '+ITEMS[id].nome.toLowerCase());return r;};}
{const _am=acharManual;acharManual=function(id){const novo=!(G.fab&&G.fab.manuais[id]);const r=_am.apply(this,arguments);
  if(novo&&G.fab.manuais[id])diarioAprendeu(RECIPES.filter(q=>q.desb&&q.desb.manual===id),'com o '+MANUAIS[id].nome);return r;};}
{const _mb=melhorarBancada;melhorarBancada=function(){const antes=G.fab.nv;const r=_mb.apply(this,arguments);if(antes<2&&G.fab.nv>=2)diarioAprendeu(RECIPES.filter(q=>q.desb&&q.desb.oficina),'com a oficina');return r;};}
if(typeof PLANTAS!=='undefined'&&typeof UTIL_ACOES!=='undefined')for(const id in PLANTAS){const _u=UTIL_ACOES[id];if(!_u)continue;
  UTIL_ACOES[id]=function(i){const ja=G.fab&&G.fab.reg&&G.fab.reg.marcos[id]!==undefined;const r=_u.apply(this,arguments);const D=diarioD();if(!D.rec)D.rec={};
    if(!ja&&D.rec['planta:'+id]===undefined){D.rec['planta:'+id]=Math.round(G.tm||0);diarioEvento('Estudou a planta: agora sabe construir '+PLANTAS[id],'receita');}return r;};}
function receitaOnde(r){if(!r.est)return'na mão';if(typeof r.est==='string')return ESTACOES[r.est]?'em: '+ESTACOES[r.est].nome.toLowerCase():'numa estação';return r.est>=2?'na oficina':'na bancada';}
function receitaComo(r){const d=r.desb;if(!d)return'desde o começo';if(d.item)return'ao pegar '+(ITEMS[d.item]?ITEMS[d.item].nome.toLowerCase():d.item);
  if(d.manual)return MANUAIS[d.manual]?'com o '+MANUAIS[d.manual].nome:'com um manual';if(d.oficina)return'com a oficina';return'';}
function diarioReceitasHTML(){const D=diarioD(),rec=D.rec||{},li=(ico,t,s)=>'<li class="ok">'+svgUse(ico)+'<span><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span></li>';
  const sabe=RECIPES.filter(r=>receitaEstado(r)!=='travada'),visto=new Set();let h='';
  for(const[k,n]of FAB_CATS){if(k==='todas')continue;const L=sabe.filter(r=>r.cat===k&&!visto.has(r));if(!L.length)continue;h+='<li class="dr-grupo">'+n+' ('+L.length+')</li>';
    for(const r of L){visto.add(r);const d=ITEMS[r.faz];if(!d)continue;h+=li(d.icon||'i-peca',d.nome+(r.n>1?' × '+r.n:''),receitaOnde(r)+' · '+receitaComo(r)+(rec[r.faz]!==undefined&&r.desb?' · '+quandoTxt(rec[r.faz]):''));}}
  const outras=sabe.filter(r=>!visto.has(r));if(outras.length){h+='<li class="dr-grupo">Outras ('+outras.length+')</li>';for(const r of outras){const d=ITEMS[r.faz];if(d)h+=li(d.icon||'i-peca',d.nome,receitaOnde(r)+' · '+receitaComo(r));}}
  if(typeof PLANTAS!=='undefined'){const P2=Object.keys(PLANTAS).filter(id=>G.fab&&G.fab.reg&&G.fab.reg.marcos[id]!==undefined);
    if(P2.length){h+='<li class="dr-grupo">Plantas de construção ('+P2.length+')</li>';for(const id of P2)h+=li('i-planta',ITEMS[id]?ITEMS[id].nome:id,'ensina a construir '+PLANTAS[id]+(rec['planta:'+id]!==undefined?' · '+quandoTxt(rec['planta:'+id]):''));}}
  const falta=RECIPES.length-sabe.length;
  return{h:h||li('i-livro','Nenhuma receita ainda',''),res:sabe.length+' de '+RECIPES.length+' receitas conhecidas'+(falta?' · faltam '+falta+' (manuais, materiais novos e a oficina)':'')};}
{const _dr=diarioRender;diarioRender=function(){if(diarioAba!=='rec')return _dr.apply(this,arguments);const el=$('dr-lista');if(!el)return;
  for(const b of document.querySelectorAll('.dr-aba'))b.setAttribute('aria-pressed',String(b.dataset.aba==='rec'));const r=diarioReceitasHTML();$('dr-resumo').textContent=r.res;el.innerHTML=r.h;};}

/* começo: tradução das teclas, dicas e interface */
montarTraducao();rotulosTeclas();aplicarHud();

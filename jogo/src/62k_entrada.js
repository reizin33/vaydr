/* ================= Teclado, mouse e controle (pedido do Himalaia: "Espaço aumentando a sensibilidade, Ctrl abaixando e
   Shift assobiando"; "o helicóptero não voa") =================
   No jogo, Espaço pula (no veículo: freio; no helicóptero: sobe), Shift corre e Ctrl não faz nada de fábrica; a sensibilidade
   muda com - e = e o assobio é o X. Para Espaço mudar a sensibilidade e Shift assobiar, a tecla precisa estar trocada (Ajustes
   → Teclas) ou vir de um "controle" que o navegador enxerga junto com o teclado. O que muda aqui:
   · teclas trocadas por engano: se Espaço, Shift ou W A S D ficaram ligadas a uma ação que não é de andar, ou se a
     sensibilidade ou o assobio ficaram no Ctrl, Alt ou Shift, as teclas voltam de fábrica ao abrir o jogo, com aviso (com
     Espaço trocado, o helicóptero também não subia). Ctrl ligado a outra ação qualquer continua valendo;
   · a troca de tecla só ouve a tecla nova com a tela "Teclas" aberta (antes, sair da tela de outro jeito deixava a troca
     esperando, e a primeira tecla apertada no jogo virava a tecla nova daquela ação);
   · último aparelho usado manda: enquanto você usa teclado ou mouse, o controle (gamepad) fica de lado por um instante, e
     Ajustes → Teclas mostra se o navegador está vendo algum controle, com a opção de desligar o controle;
   · helicóptero: o painel mostra a tecla de subir e de descer e avisa enquanto o rotor ainda está ganhando força. */
const TECLAS_ANDAR=new Set(['frente','tras','esq','dir','correr','pular','agachar','usar']);
const TECLAS_CRITICAS=new Set(['Space','ShiftLeft','ShiftRight','KeyW','KeyA','KeyS','KeyD']),TECLAS_SO_FABRICA=new Set(['sensMenos','sensMais','assobiar']);
let TECLAS_REVISTAS=null;
function teclasRevisar(){const M=cfg.mapaTeclas||{},erradas=[];
  for(const id in M){if(TECLAS_ANDAR.has(id))continue;const k=M[id];if(TECLAS_CRITICAS.has(k)||(TECLAS_SO_FABRICA.has(id)&&/^(Control|Alt|Shift)/.test(k)))erradas.push(id);}
  TECLAS_REVISTAS={erradas:erradas.slice(),antes:Object.assign({},M)};
  if(!erradas.length)return false;
  cfg.mapaTeclas={};saveCfg();montarTraducao();if(typeof rotulosTeclas==='function')rotulosTeclas();
  const nomes=erradas.map(id=>{const a=ACOES_TECLA.find(q=>q.id===id);return(a?a.nome.toLowerCase():id)+' estava no '+nomeTecla(M[id]);});
  TECLAS_REVISTAS.aviso='As teclas voltaram de fábrica: '+nomes.join('; ')+'. Espaço pula, Shift corre, C agacha, - e = mudam a sensibilidade e X assobia. Dá para trocar em Ajustes → Teclas.';
  return true;}
/* o aviso aparece quando a partida começa (no menu não há onde mostrar) */
{const _j=jogar;jogar=function(){const r=_j.apply(this,arguments);if(TECLAS_REVISTAS&&TECLAS_REVISTAS.aviso&&!TECLAS_REVISTAS.avisado){TECLAS_REVISTAS.avisado=true;setTimeout(()=>{try{toast('corpo',TECLAS_REVISTAS.aviso);}catch(_){}},1200);}return r;};}
try{teclasRevisar();}catch(e){console.error('teclas',e);}
/* troca de tecla: só com a tela Teclas aberta */
{const _t=tela;tela=function(id){if(id!=='t-teclas'&&typeof capturaTecla!=='undefined'&&capturaTecla){capturaTecla=null;teclasMsg='';}return _t.apply(this,arguments);};}

/* ---------- último aparelho usado manda ---------- */
let ENTRADA_TM=0;
for(const t of['keydown','mousedown','wheel'])window.addEventListener(t,e=>{if(!e.__vaydr)ENTRADA_TM=performance.now();},true);
window.addEventListener('mousemove',e=>{if(e.movementX||e.movementY)ENTRADA_TM=performance.now();},true);
if(cfg.usarControle===undefined)cfg.usarControle=true;
function controleDeLado(){return cfg.usarControle===false||performance.now()-ENTRADA_TM<900;}
function controleLembrar(){const gp=padAtual();if(!gp)return;for(let i=0;i<gp.buttons.length;i++)GP.ant[i]=!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5));
  if(GP.mov){GP.mov=false;IN.mx=IN.mz=0;moverTeclas();}}
{const _lc=lerControle;lerControle=function(dt){if(GP.ativo&&controleDeLado()){controleLembrar();return;}return _lc.apply(this,arguments);};}
{const _pm=padMenus;padMenus=function(){if(GP.ativo&&controleDeLado()){requestAnimationFrame(padMenus);controleLembrar();return;}return _pm.apply(this,arguments);};}
/* Ajustes → Teclas: que controle o navegador está vendo e a opção de não usar controle */
function controleInfo(){let L=[];try{L=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(g=>g&&g.connected).map(g=>g.id.replace(/\s*\(.*?\)\s*/g,' ').trim()||'controle sem nome');}catch(_){}return L;}
function controleRender(){const el=$('tk-gp');if(!el)return;const L=controleInfo(),on=cfg.usarControle!==false;
  el.querySelector('.tk-gp-txt').textContent=L.length?'O navegador está vendo: '+L.join(', ')+'.'+(on?'':' (desligado no jogo)'):'Nenhum controle ligado agora.';
  const b=el.querySelector('button');b.textContent=on?'Usar controle: sim':'Usar controle: não';b.setAttribute('aria-pressed',String(on));}
{const pad=$('tk-pad');if(pad&&!$('tk-gp')){const d=document.createElement('div');d.id='tk-gp';d.className='tk-gp';d.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:0 0 10px';
    d.innerHTML='<span class="tk-gp-txt" style="flex:1 1 220px;min-width:0;color:var(--ash);font:600 13px/1.3 var(--f-ui)"></span><button type="button" class="btn" id="tk-gp-usar"></button>';
    pad.parentNode.insertBefore(d,pad);d.querySelector('button').addEventListener('click',()=>{cfg.usarControle=cfg.usarControle===false;saveCfg();if(cfg.usarControle===false){IN.mx=IN.mz=0;moverTeclas();IN.aim=false;}controleRender();sfx('clique');});}}
{const _tr=teclasRender;teclasRender=function(){const r=_tr.apply(this,arguments);controleRender();return r;};}
window.addEventListener('gamepadconnected',()=>{try{controleRender();}catch(_){}});window.addEventListener('gamepaddisconnected',()=>{try{controleRender();}catch(_){}});

/* ---------- helicóptero: teclas de voo e rotor no painel ---------- */
HUDS.push(function hudVoo(){const el=$('painel-carro');if(!el||el.hidden||!CARRO||!CARRO.ativo)return;const c=CARRO,T=VT(c);let h=el.querySelector('.pc-voo');
  if(!T.voa){if(h)h.hidden=true;return;}
  if(!h){h=document.createElement('small');h.className='pc-voo';h.style.cssText='display:block;margin-top:3px;opacity:.9;font-size:11px;letter-spacing:.02em';el.appendChild(h);}
  h.hidden=false;const p=c.pecas,on=c.hp>0&&p.motor>0&&c.comb>0&&p.rotor>=2;let t;
  if(!on)t=veicPode(c)||'O motor não pega';
  else if((c.rotor||0)<0.8)t='Rotor ganhando força… '+Math.round((c.rotor||0)/0.8*100)+'%';
  else if(c.alt<0.25&&Math.abs(c.v)<1)t='Pousado · '+nomeTecla(teclaDe('pular'))+': decola · '+nomeTecla(teclaDe('usar'))+': sair';
  else t=nomeTecla(teclaDe('pular'))+': sobe · '+nomeTecla(teclaDe('agachar'))+' ou Ctrl: desce · '+nomeTecla(teclaDe('frente'))+': frente · '+nomeTecla(teclaDe('tras'))+': freia e ré';
  if(h.textContent!==t)h.textContent=t;});

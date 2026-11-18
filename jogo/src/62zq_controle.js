/* ================= Controle remoto do quadro de energia (v10.3.1, 18/11/2026) =================
   Depois do quadro novo, a lista combinada com o Himalaia: controle remoto, fechadura com senha, sirene e holofote, bomba no rio.
   CONTROLE DO QUADRO: um rádio de mão (bancada nível 2: 2 pilhas, 2 de sucata e 2 fios). Com ele na mão (barra 1 a 6):
   · perto de um quadro de energia (até 3 m), clique: o controle fica pareado com ele (também dá pelo painel do quadro);
   · em qualquer lugar a até 300 m do quadro, clique: abre o painel dele à distância, com os circuitos (chave, horário e
     prioridade), o disjuntor geral e o gerador automático. Fios não: para ligar e cortar, só indo até lá;
   · cada uso gasta um pouco das pilhas dele (durabilidade); com o quadro quebrado ou longe demais, ele avisa.
   Exemplo: chegando de noite, acende o circuito das luzes da base antes de entrar; saindo para longe, desliga o geral. */
const CTRLQ={alc:300,parear:3,hint:null,txt:''};
iconesNovos({'i-controle':'<rect x="7" y="7" width="10" height="14" rx="2"/><path d="M12 7V3M9.6 4.6a3.4 3.4 0 0 1 4.8 0"/><circle cx="12" cy="11.5" r="1.6"/><path d="M9.5 15.5h1.5M13 15.5h1.5M9.5 18.2h1.5M13 18.2h1.5"/>'});
Object.assign(ITEMS,{controleQuadro:{nome:'Controle do quadro',icon:'i-controle',max:1,tipo:'util',durMax:150,
  desc:'Controle remoto do quadro de energia. Na mão: clique perto de um quadro para parear; depois, de até 300 m, clique para abrir o painel dele (circuitos, disjuntor geral e gerador automático).'}});
RECIPES.push({faz:'controleQuadro',n:1,custo:{pilhas:2,sucata:2,fio:2},cat:'ferramentas',etapa:2,est:2});
function ctrlqAtivo(){const s=selItem();return!!(s&&s.id==='controleQuadro'&&!(s.dur<=0)&&G.modo==='jogo'&&P.alive&&!OBRA.ativo&&!CARRO.ativo&&cfg.tela==='pc');}
function ctrlqPerto(){let b=null,bd=CTRLQ.parear*CTRLQ.parear;for(const o of OB){if(o.tipo!=='quadroEnergia'||o.hp<=0)continue;const d=d2(o.x,o.z,P.x,P.z);if(d<bd){bd=d;b=o;}}return b;}
function ctrlqQuadro(s){if(!s||!s.par)return null;eletMapa();const q=eletPorEid(s.par);return q&&q.tipo==='quadroEnergia'&&q.hp>0?q:null;}
function ctrlqParear(s,q){s.par=eidDe(q);sfx('clique',q.x,q.z,0.9);feed('Controle pareado com este quadro de energia: agora ele abre o painel de até '+CTRLQ.alc+' m.');}
function ctrlqUsar(){const s=selItem();if(!s||s.id!=='controleQuadro')return'';const perto=ctrlqPerto();
  if(perto&&s.par!==(perto.ext&&perto.ext.eid)){ctrlqParear(s,perto);return'pareou';}
  if(!s.par){feed('Controle sem quadro: chegue perto de um quadro de energia (até '+CTRLQ.parear+' m) e clique para parear.');sfx('vazio');return'sem';}
  const q=ctrlqQuadro(s);if(!q){feed('O quadro deste controle não existe mais (quebrou ou foi desmontado). Pareie com outro.');sfx('vazio');s.par=null;return'perdido';}
  const d=Math.hypot(q.x-P.x,q.z-P.z);if(d>CTRLQ.alc){feed('Fora do alcance: o quadro está a '+Math.round(d)+' m (o controle vai até '+CTRLQ.alc+' m).');sfx('vazio');return'longe';}
  gastar(s,1);ENER.remoto=d>CTRLQ.parear?Math.round(d):0;abrirEnergia(q);if(G.modo!=='estacao')ENER.remoto=0;sfx('clique');return'abriu';}
window.addEventListener('mousedown',e=>{if(e.button!==0||!ctrlqAtivo())return;if(!document.pointerLockElement&&!semTrava)return;e.stopImmediatePropagation();e.preventDefault();ctrlqUsar();},true);
/* o painel aberto pelo controle: sem fios (só no lugar), com a distância em cima */
{const _fe=fecharEstacao;fecharEstacao=function(){const r=_fe.apply(this,arguments);if(G.modo!=='estacao')ENER.remoto=0;return r;};}
PASSOS.push(function ctrlqPasso(){if(ENER.remoto&&G.modo!=='estacao')ENER.remoto=0;});
{const U=ESTACAO_UI.energia,_r=U.render,_a=U.acao;
  U.render=function(o){const r=_r.apply(this,arguments);if(!r||o.tipo!=='quadroEnergia')return r;
    if(ENER.remoto){r.sub='Pelo controle remoto, a '+ENER.remoto+' m · os fios só no lugar';r.acoes=(r.acoes||[]).filter(a=>a.id==='q_gen');return r;}
    const c=P.inv.find(s=>s&&s.id==='controleQuadro'&&!(s.dur<=0));if(c&&c.par!==(o.ext&&o.ext.eid))r.acoes.push({id:'q_parear',t:'Parear o controle',s:c.par?'troca o quadro do controle para este':'abre este painel de até '+CTRLQ.alc+' m',ok:true});
    return r;};
  U.acao=function(o,id){if(o.tipo==='quadroEnergia'){if(ENER.remoto&&/^(fios|cortar|auto|q_parear)$/.test(id))return'Pelo controle não dá: vá até o quadro.';
      if(id==='q_parear'){const c=P.inv.find(s=>s&&s.id==='controleQuadro'&&!(s.dur<=0));if(!c)return'Sem controle na mochila.';ctrlqParear(c,o);return'Controle pareado com este quadro.';}}
    return _a.apply(this,arguments);};}
/* dica embaixo da mira com o controle na mão */
HUDS.push(function ctrlqHud(){const on=ctrlqAtivo();if(!CTRLQ.hint){if(!on)return;const el=document.createElement('div');el.className='fio-hint';el.hidden=true;el.setAttribute('aria-live','polite');document.body.appendChild(el);CTRLQ.hint=el;}
  if(!on){if(!CTRLQ.hint.hidden)CTRLQ.hint.hidden=true;return;}const s=selItem(),perto=ctrlqPerto(),q=ctrlqQuadro(s);let h;
  if(perto&&s.par!==(perto.ext&&perto.ext.eid))h='Controle do quadro: clique para <b>parear com este quadro</b><small>depois ele abre o painel de até '+CTRLQ.alc+' m</small>';
  else if(!s.par)h='Controle do quadro <b>sem quadro</b><small>chegue perto de um quadro de energia e clique para parear</small>';
  else if(!q)h='<span class="ruim">O quadro deste controle não existe mais</span><small>chegue perto de outro quadro e clique para parear</small>';
  else{const d=Math.hypot(q.x-P.x,q.z-P.z);h=d>CTRLQ.alc?'<span class="ruim">Quadro fora do alcance</span> · a '+Math.round(d)+' m<small>o controle vai até '+CTRLQ.alc+' m</small>':'Controle do quadro: clique para <b>abrir o painel</b><small>quadro a '+Math.round(d)+' m · '+eletEstado(q)+' · pilhas '+Math.round(clamp((s.dur??150)/150,0,1)*100)+'%</small>';}
  if(h!==CTRLQ.txt){CTRLQ.txt=h;CTRLQ.hint.innerHTML=h;}CTRLQ.hint.hidden=false;});
/* manual */
MANUAL_EXTRA.push(()=>[{id:'x:controleQuadro',sec:'eletricidade',nome:'Controle do quadro',icon:'i-controle',trav:false,como:'bancada nível 2',desc:'Controle remoto do quadro de energia: liga e desliga os circuitos e o geral de longe.',ing:{pilhas:2,sucata:2,fio:2},
  est:{nome:'Onde: bancada (nível 2), aba Ferramentas',icon:'i-controle',onde:''},ferr:['Um quadro de energia na base'],
  proc:['Faça o controle na bancada e ponha na barra (1 a 6).','Com ele na mão, chegue perto do quadro (até 3 m) e clique: ele fica pareado (ou no painel do quadro: Parear o controle).',
    'De até 300 m, com ele na mão, clique: abre o painel do quadro. Dá para mexer nos circuitos (chave, horário e prioridade), no disjuntor geral e no gerador automático.'],
  res:null,obs:['Fios só no lugar: pelo controle não dá para ligar nem cortar.','Cada uso gasta um pouco das pilhas dele; quando acaba, faça outro.'],tipo:'Guia'}]);

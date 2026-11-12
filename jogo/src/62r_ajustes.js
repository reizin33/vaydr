/* ================= Ajustes em seções (versão 10) =================
   A lista única virou seções: Gráficos, Som, Controles e teclas, Jogo, Acessibilidade e Conta e perfil.
   As opções são as mesmas de antes (os mesmos ids, os mesmos ouvintes): aqui elas só mudam de lugar. Opção que outro
   arquivo puser nos Ajustes depois e não estiver na lista vai para "Jogo".
   Conta e perfil: nome do perfil, personagem, trocar de perfil e apagar o perfil (com todos os mundos dele). No meio de
   um jogo, trocar e apagar ficam para o menu. */
const AJ_SECOES=[['graficos','Gráficos',['aj-graf','aj-graf-nota','aj-tex','aj-fps','aj-fov']],['som','Som',['aj-som','aj-mus','aj-efx']],
  ['controles','Controles e teclas',['aj-sens','aj-invy','aj-sensgp','aj-teclas-btn','aj-tela']],['jogo','Jogo',['aj-dif','aj-cam','aj-camdist','aj-animabre','aj-criativo']],
  ['acess','Acessibilidade',['aj-hud','aj-teclas']],['conta','Conta e perfil',[]]];
let ajSecao='graficos',ajApagaConfirma=false;
{const st=document.createElement('style');st.textContent=`
#t-ajustes .cartao.aj-sec-cartao{width:min(820px,100%);grid-template-columns:200px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;align-items:start;gap:16px 22px}
.aj-sec-cartao>h2{grid-column:1/3}.aj-sec-cartao>#aj-ok{grid-column:1/3}
.aj-nav{grid-column:1;grid-row:2;display:grid;gap:6px;align-content:start}
.aj-nav button{appearance:none;display:flex;align-items:center;gap:9px;width:100%;min-height:42px;padding:0 12px;border-radius:9px;border:1px solid transparent;background:transparent;color:var(--ash);
  font:800 14.5px/1.1 var(--f-ui);text-align:left;cursor:pointer}
.aj-nav button:hover{color:var(--bone);background:rgba(255,255,255,.04)}
.aj-nav button[aria-pressed="true"]{color:var(--bone);background:rgba(194,85,29,.2);border-color:rgba(255,138,61,.5)}
.aj-nav .ico{width:17px;height:17px;flex:none}
.aj-painel{grid-column:2;grid-row:2;display:grid;gap:14px;align-content:start;max-height:min(62vh,560px);overflow-y:auto;padding-right:4px;min-width:0}
.aj-painel[hidden]{display:none}
.aj-painel h3{margin:0 0 2px}
.aj-linha{display:flex;gap:8px;flex-wrap:wrap}.aj-linha .aj-pf-nome{flex:1 1 180px;width:auto}.cartao .aj-linha .btn{width:auto;min-height:42px}
.aj-pf-topo{display:flex;align-items:center;gap:12px}.aj-pf-topo .lg-av{width:52px;height:52px;border-radius:11px}
.aj-pf-topo b{display:block;font:800 18px/1.1 var(--f-ui);color:var(--bone)}.aj-pf-topo small{font:600 13px/1.3 var(--f-ui);color:var(--ash)}
.cartao .aj-perigo{border-color:rgba(227,73,62,.6);color:var(--blood-ink)}.cartao .aj-perigo.sim{background:rgba(227,73,62,.24);border-color:var(--blood)}
.cartao p.aj-pf-msg{min-height:1em;font-size:13.5px;color:#f2d36b}
.cartao p.aj-pf-dica{font-size:13px}
@media (max-width:700px){#t-ajustes .cartao.aj-sec-cartao{grid-template-columns:minmax(0,1fr)}.aj-sec-cartao>h2,.aj-sec-cartao>#aj-ok{grid-column:1}
  .aj-nav{grid-column:1;grid-row:2;display:flex;overflow-x:auto;gap:6px;padding-bottom:4px}.aj-nav button{width:auto;flex:none;min-height:38px}.aj-painel{grid-column:1;grid-row:3;max-height:none}.aj-sec-cartao>#aj-ok{grid-row:4}}`;document.head.appendChild(st);}
{const card=document.querySelector('#t-ajustes .cartao'),ok=$('aj-ok');card.classList.add('aj-sec-cartao');
 const nav=document.createElement('nav');nav.className='aj-nav';nav.setAttribute('aria-label','Seções dos ajustes');
 const ICO={graficos:'<path d="M3 5h18v12H3zM8 21h8M12 17v4"/>',som:'<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
   controles:'<rect x="2.5" y="7" width="19" height="10" rx="2"/><path d="M6.5 10.5v3M5 12h3M15.5 11h.01M18 13h.01"/>',jogo:'<path d="M12 3 4 7v5c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V7z"/>',
   acess:'<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5 8.5 21M12 14.5l3.5 6.5"/>',conta:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-3.8 3.9-6 7.5-6s6.6 2.2 7.5 6"/>'};
 const paineis={};
 for(const[k,nome,ids]of AJ_SECOES){const b=document.createElement('button');b.type='button';b.dataset.secB=k;b.setAttribute('aria-pressed','false');
   b.innerHTML='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ICO[k]+'</svg><span>'+nome+'</span>';nav.append(b);
   const p=document.createElement('section');p.className='aj-painel';p.dataset.sec=k;p.setAttribute('aria-label',nome);p.hidden=true;paineis[k]=p;
   for(const id of ids){const el=$(id);if(!el)continue;const row=el.classList.contains('opcao')||el.tagName==='P'?el:el.closest('.opcao');if(row)p.append(row);}}
 // o que sobrou solto no cartão (opção nova de outro arquivo) vai para Jogo
 for(const el of[...card.children])if(el.classList&&(el.classList.contains('opcao')||el.classList.contains('aj-nota')))paineis.jogo.append(el);
 paineis.conta.innerHTML='<div class="aj-pf-topo"><span class="lg-av" id="aj-pf-av"></span><span><b id="aj-pf-n"></b><small id="aj-pf-info"></small></span></div>'+
   '<div class="opcao"><label for="aj-pf-nome">Nome do perfil</label><div class="aj-linha"><input class="aj-pf-nome" id="aj-pf-nome" maxlength="20" autocomplete="off" spellcheck="false"><button class="btn" id="aj-pf-salvar" type="button">Salvar nome</button></div></div>'+
   '<div class="opcao"><span class="rot">Personagem</span><button class="btn" id="aj-pf-pers" type="button">Mudar a aparência</button></div>'+
   '<div class="opcao"><span class="rot">Trocar de perfil</span><button class="btn" id="aj-pf-trocar" type="button">Voltar para "Quem vai jogar?"</button></div>'+
   '<div class="opcao"><span class="rot">Apagar este perfil</span><p class="aj-pf-dica">Apaga o perfil e todos os mundos dele neste aparelho. Não dá para desfazer.</p><button class="btn aj-perigo" id="aj-pf-apagar" type="button">Apagar perfil</button></div>'+
   '<p class="aj-pf-msg" id="aj-pf-msg" role="status"></p>';
 const h2=card.querySelector('h2');h2.after(nav);nav.after(...Object.values(paineis));card.append(ok);}
function ajMostrarSecao(k){ajSecao=k;for(const b of document.querySelectorAll('.aj-nav [data-sec-b]'))b.setAttribute('aria-pressed',String(b.dataset.secB===k));
  for(const p of document.querySelectorAll('#t-ajustes .aj-painel'))p.hidden=p.dataset.sec!==k;if(k==='conta')ajContaRender();}
function ajContaRender(){const noJogo=ajustesVolta!=='t-menu',tem=!!PERFIL;$('aj-pf-n').textContent=tem?PERFIL.nome:'Sem perfil';$('aj-pf-av').innerHTML=tem?pfAvatar(PERFIL):'';
  $('aj-pf-info').textContent=tem?(PERFIL.mundos.length===1?'1 mundo':PERFIL.mundos.length+' mundos')+' · perfil neste aparelho':'';
  if(document.activeElement!==$('aj-pf-nome'))$('aj-pf-nome').value=tem?PERFIL.nome:'';
  for(const id of['aj-pf-nome','aj-pf-salvar'])$(id).disabled=!tem;for(const id of['aj-pf-pers','aj-pf-trocar','aj-pf-apagar'])$(id).disabled=!tem||noJogo;
  const ap=$('aj-pf-apagar');ap.classList.toggle('sim',ajApagaConfirma);ap.textContent=ajApagaConfirma?'Toque de novo: apagar o perfil e '+(PERFIL?PERFIL.mundos.length:0)+' mundo(s)':'Apagar perfil';
  if(noJogo&&!$('aj-pf-msg').textContent)$('aj-pf-msg').textContent='No meio de um jogo dá para mudar o nome. Para trocar de perfil, mudar o personagem ou apagar, saia para o menu.';}
document.querySelector('.aj-nav').addEventListener('click',e=>{const b=e.target.closest('[data-sec-b]');if(!b)return;sfx('clique');ajApagaConfirma=false;$('aj-pf-msg').textContent='';ajMostrarSecao(b.dataset.secB);});
{const _a=ajustesUI;ajustesUI=function(){const r=_a.apply(this,arguments);ajApagaConfirma=false;$('aj-pf-msg').textContent='';ajMostrarSecao(ajSecao);return r;};}
$('aj-pf-salvar').addEventListener('click',()=>{if(!PERFIL)return;sfx('clique');const n=pfNome($('aj-pf-nome').value),m=$('aj-pf-msg');
  if(!n){m.textContent='Escreva um nome.';return;}
  if(PERFIS.lista.some(p=>p!==PERFIL&&p.nome.toLowerCase()===n.toLowerCase())){m.textContent='Já existe outro perfil com esse nome.';return;}
  PERFIL.nome=n;pfGravar();m.textContent='Nome salvo.';ajContaRender();});
$('aj-pf-nome').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('aj-pf-salvar').click();}e.stopPropagation();});
$('aj-pf-pers').addEventListener('click',()=>{sfx('clique');pfAbrirPersonagem('perfil');});
$('aj-pf-trocar').addEventListener('click',()=>{sfx('clique');pfSair();pfMostrarLogin();});
$('aj-pf-apagar').addEventListener('click',()=>{if(!PERFIL)return;sfx('clique');if(!ajApagaConfirma){ajApagaConfirma=true;ajContaRender();return;}
  ajApagaConfirma=false;const p=PERFIL;pfApagarPerfil(p);pfMostrarLogin();$('lg-msg').textContent='O perfil "'+p.nome+'" foi apagado.';});
ajMostrarSecao(ajSecao);

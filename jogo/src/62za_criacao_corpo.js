/* ================= tipo de corpo na criação do personagem (13/11/2026) =================
   Pedido aprovado pelo dono: na tela de criação a pessoa escolhe o corpo.
   · Sobrevivente: o personagem realista (62z_sobrevivente.js), com rosto, cabelo grisalho, barba, calça jeans e botas
     próprios. Escolhe o nome e a altura (as outras opções não mudam esse corpo e ficam escondidas).
   · Personalizado: o boneco de partes de sempre (23_aparencia.js), com todas as opções da criação.
   A escolha fica na aparência do personagem (ap.corpo): grava no jogo salvo e no perfil. Os jogos e perfis de antes não
   têm a escolha: para eles vale o ajuste "Personagem" (cfg.personagem), como até agora. O ajuste continua nos Ajustes e,
   com um jogo aberto, troca o corpo desse personagem. */
const CORPOS={sobrevivente:'Sobrevivente',personalizado:'Personalizado'};
function corpoDe(ap){const c=ap&&ap.corpo;return c==='sobrevivente'||c==='personalizado'?c:(cfg&&cfg.personagem==='classico'?'personalizado':'sobrevivente');}
/* a aparência guarda o corpo (aparLimpa só guardava os campos numéricos e o nome) */
{const _al=aparLimpa;aparLimpa=function(ap){const o=_al.apply(this,arguments);if(ap&&(ap.corpo==='sobrevivente'||ap.corpo==='personalizado'))o.corpo=ap.corpo;return o;};}
/* o corpo do jogador: na criação, o que está sendo montado; no jogo, o do personagem salvo */
survLigado=function(){if(typeof SKT==='undefined'||!SKT.surv||!SKT.surv.pronto)return false;
  const ap=G.modo==='criacao'?CRIA.ap:(G.aparencia||(MESH.jogador&&MESH.jogador.ap));return corpoDe(ap)==='sobrevivente';};
/* o "Aleatório" sorteia o resto e mantém o corpo escolhido */
{const _aa=aparAleatoria;aparAleatoria=function(){const o=_aa.apply(this,arguments);if(G.modo==='criacao'&&CRIA.ap)o.corpo=corpoDe(CRIA.ap);return o;};}
/* ao começar e ao guardar no perfil, a escolha fica escrita (mesmo quando a pessoa não mexeu: vale o que estava no palco) */
{const _cc=criaComecar;criaComecar=function(){if(CRIA.ap)CRIA.ap.corpo=corpoDe(CRIA.ap);return _cc.apply(this,arguments);};}
if(typeof pfSalvarAparencia==='function'){const _ps=pfSalvarAparencia;pfSalvarAparencia=function(){if(CRIA.ap)CRIA.ap.corpo=corpoDe(CRIA.ap);return _ps.apply(this,arguments);};}
/* a altura dele: as mesmas cinco escolhas, com a medida do sobrevivente (1,74 m no meio) */
{const _no=criaNomeOp;criaNomeOp=function(k,i){if(k==='altura'&&G.modo==='criacao'&&corpoDe(CRIA.ap)==='sobrevivente')return(APAR.alturas[i]*SURV_ALT).toFixed(2).replace('.',',')+' m';return _no.apply(this,arguments);};}
/* desenho das duas escolhas */
function criaCorpoSvg(k){
  if(k==='sobrevivente')return'<svg viewBox="0 0 40 64" aria-hidden="true"><circle cx="20" cy="9" r="5.2" fill="currentColor"/><path d="M15.2 11.5q4.8 6.5 9.6 0v2.3q-4.8 4.2-9.6 0z" fill="currentColor" fill-opacity=".55"/>'
    +'<path d="M12.5 19h15l1.6 17h-3.2l-.9-9.5v31h-4.2V40h-1.6v17.5H15V26.5l-.9 9.5h-3.2z" fill="currentColor"/><path d="M15 39h10v18.5h-4.2V40h-1.6v17.5H15z" fill="#3b4f6e"/></svg>';
  return'<svg viewBox="0 0 40 64" aria-hidden="true"><circle cx="17" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 19h14l1.5 17M10 19l-1.5 17M12 30v27M22 30v27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    +'<path d="M29 24h8M29 33h8M29 42h8" stroke="currentColor" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="24" r="2" fill="currentColor"/><circle cx="35" cy="33" r="2" fill="currentColor"/><circle cx="31" cy="42" r="2" fill="currentColor"/></svg>';}
{const st=document.createElement('style');st.textContent='.cr-ops.dois{grid-template-columns:1fr 1fr}.cr-corpo .cr-texto{margin-top:8px}';document.head.appendChild(st);}
/* o painel: o tipo de corpo em cima das abas de rosto, cabelo e corpo; com o sobrevivente, só o que muda esse corpo */
function criaCorpoPainel(aba){const el=$('cr-opcoes');if(!el||!CRIA.ap)return;const c=corpoDe(CRIA.ap),surv=c==='sobrevivente';
  if(aba==='rosto'||aba==='cabelo'||aba==='corpo'){
    const topo=`<div class="cr-sec cr-corpo"><h3>Tipo de corpo<small>${CORPOS[c]}</small></h3><div class="cr-ops dois" role="group" aria-label="Tipo de corpo">`
      +['sobrevivente','personalizado'].map(k=>`<button type="button" class="cr-op txt" data-corpo="${k}" aria-pressed="${k===c}" title="${CORPOS[k]}">${criaCorpoSvg(k)}<b>${CORPOS[k]}</b></button>`).join('')
      +`</div><p class="cr-texto">${surv?'Rosto, cabelo grisalho, barba, calça jeans e botas do próprio sobrevivente. Você escolhe o nome e a altura.':'O boneco de partes, montado do seu jeito: rosto, pele, olhos, cabelo, barba, altura e porte.'}</p></div>`;
    if(surv&&aba!=='corpo')el.innerHTML=topo+`<div class="cr-sec"><p class="cr-texto">${aba==='rosto'?'O sobrevivente tem rosto e barba próprios.':'O sobrevivente tem o cabelo grisalho próprio.'} Para escolher ${aba==='rosto'?'o rosto':'o cabelo'}, use o corpo Personalizado.</p></div>`;
    else{if(surv){const p=el.querySelector('[data-k="porte"]');const s=p&&p.closest('.cr-sec');if(s)s.remove();}el.insertAdjacentHTML('afterbegin',topo);}}
  else if(aba==='roupas'&&surv){const card=el.querySelector('.cr-info-card div');
    if(card)card.innerHTML='<b>Calça jeans e botas</b><span>São do próprio sobrevivente. Como a bermuda do corpo personalizado, cobrem, mas não protegem nem esquentam.</span><span class="cr-trava">Vestidas no começo</span>';}}
{const _ca=criaAba;criaAba=function(aba){const r=_ca.apply(this,arguments);try{criaCorpoPainel(CRIA.aba);}catch(e){console.error('corpo na criação',e);}return r;};}
{const el=$('cr-opcoes');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-corpo]');if(!b||!CRIA.ap)return;const c=b.dataset.corpo;if(corpoDe(CRIA.ap)===c)return;
  CRIA.ap.corpo=c;aplicarAparencia(CRIA.ap);const y=el.scrollTop;criaAba(CRIA.aba);el.scrollTop=y;criaResumo();CRIA.sujo=G.t;sfx('clique');
  const nb=el.querySelector('[data-corpo="'+c+'"]');if(nb)nb.focus({preventScroll:true});});}
/* o resumo (lado e confirmação) */
{const _cr=criaResumoHTML;criaResumoHTML=function(ap){if(corpoDe(ap)!=='sobrevivente')return _cr.apply(this,arguments);
  const alt=(APAR.alturas[ap.altura]*SURV_ALT).toFixed(2).replace('.',',')+' m';
  return[['rosto','Rosto','sobrevivente · barba grisalha'],['cabelo','Cabelo','grisalho, curto'],['corpo','Corpo',alt+' · sobrevivente'],['roupas','Roupas','calça jeans e botas'],['acess','Acessórios','nenhum']]
    .map(([a,t,v])=>`<li>${criaIcoAba(a)}<div>${t} <span>${v}</span></div></li>`).join('');};}
/* o rostinho do perfil: o do sobrevivente é grisalho e de barba */
if(typeof pfAvatar==='function'){const _pa=pfAvatar;pfAvatar=function(p){const ap=aparLimpa(p&&p.ap||APAR_PADRAO);if(corpoDe(ap)!=='sobrevivente')return _pa.apply(this,arguments);
  try{return criaCabeloSvg(Object.assign({},ap,{rosto:1,pele:2,corCab:6,barba:4,cabelo:0}),0);}catch(_){return'';}};}
/* Ajustes: "Personagem" vira "Corpo do personagem"; com um jogo aberto, troca o corpo do personagem dele (e fica gravado) */
{const l=$('aj-personagem-l'),el=$('aj-personagem');if(l){const r=l.querySelector('.rot');if(r)r.textContent='Corpo do personagem';}
  if(el){const bc=el.querySelector('[data-v="classico"]');if(bc)bc.textContent='Personalizado';const bs=el.querySelector('[data-v="sobrevivente"]');if(bs)bs.textContent='Sobrevivente';
    el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;const c=b.dataset.v==='classico'?'personalizado':'sobrevivente';
      if(G.aparencia)G.aparencia.corpo=c;if(MESH.jogador&&MESH.jogador.ap)MESH.jogador.ap.corpo=c;survMarcaAjuste();});}}
survMarcaAjuste=function(){const el=$('aj-personagem');if(!el)return;const ap=G.aparencia||(MESH.jogador&&MESH.jogador.ap),c=corpoDe(ap);
  el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.v==='classico'?'personalizado':'sobrevivente')===c)));};

/* ================= cópia automática em arquivo: gravar (v10.4.3, 19/11/2026) =================
   Só no .exe (SAVE_PC, 00b_save_arquivo.js). Toda vez que o jogo salva um mundo (gravarSave conferiu e gravou), o mesmo save vai
   para Documentos\VAYDR\Jogos salvos\<chave do mundo>.json, e a gravação anterior fica como <chave>.anterior.json (desktop/saves.js).
   A lista de perfis e mundos, os ajustes, as conquistas e os recordes vão junto (um pouco depois de mudar). Mundo apagado: o
   arquivo vai para a subpasta "Apagados". Ao fechar a janela, a cópia termina antes de a janela fechar.
   Na tela Salvamento: onde fica a pasta e o botão "Abrir a pasta". Depois de uma recuperação (00b), o menu avisa. */
if(SAVE_PC){
  const SAVE_PC_CHAVES=new Set(['vaydr_perfis_v1','nnc_cfg_v1','nnc_conq','nnc_recordes','nnc_recorde','nnc_nome']);
  let savePcEspera=false,savePcUltimo=0;
  const savePcCopia=(k,esperar)=>{try{const t=localStorage.getItem(k);if(!t)return false;const ok=SAVE_PC.saveGravar(k,t,esperar);if(ok)savePcUltimo=Date.now();return ok;}catch(_){return false;}};
  /* o mundo: logo depois de cada gravação boa */
  {const _gs=gravarSave;gravarSave=function(){const ok=_gs.apply(this,arguments);if(ok)savePcCopia(SAVE_KEY,savePcEspera);return ok;};}
  /* fechar a janela: o aplicativo chama window.__vaydrPC.salvar(); aí a cópia espera terminar */
  if(window.__vaydrPC&&typeof window.__vaydrPC.salvar==='function'){const _sv=window.__vaydrPC.salvar;
    window.__vaydrPC.salvar=function(){savePcEspera=true;try{return _sv.apply(this,arguments);}finally{savePcEspera=false;}};}
  /* perfis, ajustes, conquistas e recordes: um pouco depois de mudar (os ajustes mudam várias vezes seguidas) */
  const savePcPend=new Set();let savePcT=0;
  const savePcPendentes=()=>{savePcT=0;for(const k of savePcPend)savePcCopia(k,false);savePcPend.clear();};
  {const _set=store.set;store.set=function(k){const r=_set.apply(this,arguments);if(r&&SAVE_PC_CHAVES.has(k)){savePcPend.add(k);if(!savePcT)savePcT=setTimeout(savePcPendentes,1500);}return r;};}
  /* apagou um mundo (ou começou de novo no mesmo): a cópia vai para "Apagados" */
  const ehMundo=k=>k==='nnc_jogo_v1'||(typeof PERFIS!=='undefined'&&PERFIS.lista.some(p=>p.mundos.some(m=>m.chave===k)));
  {const _del=store.del;store.del=function(k){const eraMundo=typeof k==='string'&&ehMundo(k);_del.apply(this,arguments);if(eraMundo)SAVE_PC.saveApagar(k);};}
  /* quem já jogava: a primeira cópia de tudo sai alguns segundos depois de abrir */
  setTimeout(()=>{try{for(const k of SAVE_PC_CHAVES)savePcCopia(k,false);
    for(const p of(typeof PERFIS!=='undefined'?PERFIS.lista:[]))for(const m of p.mundos)savePcCopia(m.chave,false);
    if(!localStorage.getItem('vaydr_perfis_v1'))savePcCopia('nnc_jogo_v1',false);}catch(e){console.warn('cópia em arquivo: primeira cópia',e);}},5000);
  /* tela Salvamento: a pasta e o botão (numa linha só, para o Voltar continuar cabendo na tela de 720 px) */
  {const ac=document.querySelector('#t-salvo .sv-acoes');
   if(ac){ac.insertAdjacentHTML('beforebegin','<div class="sv-pc" id="sv-pc" title="Para levar seus jogos para outro computador, copie esta pasta para o mesmo lugar lá antes de abrir o jogo pela primeira vez."><span><b>Cópia automática no computador</b><small id="sv-pc-pasta"></small></span><button class="btn" id="sv-pc-abrir" type="button">Abrir a pasta</button></div>');
     const b=$('sv-pc-abrir');if(b)b.addEventListener('click',()=>{sfx('clique');SAVE_PC.saveAbrirPasta();});}
   const st=document.createElement('style');st.textContent='.sv-pc{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.sv-pc b{display:block;font:700 14px/1.2 var(--f-ui);color:var(--bone)}'
     +'.sv-pc small{display:block;margin-top:2px;font:500 12px/1.35 var(--f-ui);color:var(--ash);overflow-wrap:anywhere}';document.head.appendChild(st);}
  {const _sr=saveRender;saveRender=function(){const r=_sr.apply(this,arguments);const el=$('sv-pc-pasta');if(el&&!el.textContent){const p=SAVE_PC.savePasta();el.textContent=p||'(não deu para usar nenhuma pasta neste computador)';}return r;};}
  /* depois de recuperar da pasta (00b): o menu avisa uma vez */
  if(saveRecuperados>0){const _mm=mostrarMenu;let avisou=false;mostrarMenu=function(){const r=_mm.apply(this,arguments);if(!avisou){avisou=true;const a=$('m-aviso');
    if(a){a.hidden=false;a.textContent='Seus jogos salvos voltaram da cópia automática no computador ('+saveRecuperados+(saveRecuperados>1?' arquivos':' arquivo')+' da pasta '+(SAVE_PC.savePasta()||'Jogos salvos')+').';}}return r;};}
}

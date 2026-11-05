/* ================= Barra de progresso ao usar um item =================
   Kit médico, bandagem, comida e bebida: enquanto o personagem usa (a ação "usar"), aparece embaixo da mira uma barra com o
   nome do item enchendo até o efeito acontecer. Recarregar uma arma também mostra a barra (dá para saber quando terminou). */
let usoBarraEl=null;
HUDS.push(function hudUsoBarra(){
  if(!usoBarraEl){const st=document.createElement('style');
    st.textContent='.uso-barra{position:fixed;left:50%;top:calc(50% + 46px);z-index:5;transform:translateX(-50%);pointer-events:none;min-width:190px;padding:7px 12px 9px;border-radius:10px;'+
      'background:rgba(14,16,18,.78);border:1px solid rgba(255,255,255,.12);color:#efe9dc;font:600 13px/1.2 system-ui,sans-serif;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.35)}'+
      '.uso-barra b{display:block;margin-bottom:6px;letter-spacing:.02em}.uso-barra i{display:block;height:6px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden}'+
      '.uso-barra i::after{content:"";display:block;height:100%;width:calc(var(--p,0)*100%);background:linear-gradient(90deg,#e9a23b,#f3c96b);border-radius:3px}';
    document.head.appendChild(st);usoBarraEl=document.createElement('div');usoBarraEl.className='uso-barra';usoBarraEl.hidden=true;usoBarraEl.setAttribute('aria-live','polite');
    usoBarraEl.innerHTML='<b></b><i></i>';document.body.appendChild(usoBarraEl);}
  const a=P.acao,ok=G.modo==='jogo'&&P.alive&&a&&(a.tipo==='usar'||a.tipo==='recarga')&&!a.done;
  if(!ok){if(!usoBarraEl.hidden)usoBarraEl.hidden=true;return;}
  let nome='';if(a.tipo==='usar'){const s=P.inv[a.slot];nome=s&&ITEMS[s.id]?'Usando: '+ITEMS[s.id].nome:'Usando';}else{const s=selItem();nome='Recarregando'+(s&&ITEMS[s.id]?': '+ITEMS[s.id].nome:'');}
  /* o efeito do item acontece aos 70% da ação: a barra enche até lá */
  const fim=a.tipo==='usar'?a.dur*0.7:a.dur,p=clamp(a.t/Math.max(0.01,fim),0,1);
  usoBarraEl.hidden=false;const b=usoBarraEl.firstChild;if(b.textContent!==nome)b.textContent=nome;usoBarraEl.style.setProperty('--p',p.toFixed(3));});

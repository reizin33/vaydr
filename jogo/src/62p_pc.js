/* ================= versão para PC (.exe): o jogo dentro do aplicativo do VAYDR =================
   O aplicativo (pasta desktop/ do projeto) põe window.vaydrPC na página antes do jogo começar. Aqui:
   - a versão do aplicativo no menu ("Versão 9.9.0 · PC")
   - o botão "Sair do jogo" no menu
   - o aviso de atualização pronta: ela baixa sozinha e entra quando o jogo fecha, ou na hora pelo botão do menu
   - window.__vaydrPC.salvar(), que o aplicativo chama ao fechar a janela (o jogo salva antes de sair)
   No link e no celular window.vaydrPC não existe e nada aqui roda. */
const PC_APP=typeof window.vaydrPC==='object'&&window.vaydrPC?window.vaydrPC:null;
if(PC_APP){
  document.body.classList.add('app-pc');
  window.__vaydrPC={salvar(){if(G.modo==='jogo'||G.modo==='pausa')return salvarJogo()!==false;return null;},modo:()=>G.modo};
  {const st=document.createElement('style');st.textContent=`
.m-atualiza{display:grid;gap:8px;justify-items:center;margin-top:2px;padding:10px 12px;border:1px solid rgba(255,138,61,.45);border-radius:6px;
  background:rgba(255,138,61,.08);color:#ffd2b0;font:600 13px/1.35 var(--f-ui);text-align:center}
.m-atualiza b{color:#ffb27a}
.menu-col .m-atualiza .btn{min-height:40px;font-size:14px}`;document.head.appendChild(st);}
  {const vs=document.querySelector('#t-menu .versao');if(vs&&vs.firstChild&&vs.firstChild.nodeType===3)vs.firstChild.textContent='Versão '+PC_APP.versao+' · PC ';}
  const pcCol=document.querySelector('#t-menu .menu-col');
  if(pcCol){const b=document.createElement('button');b.type='button';b.className='btn';b.id='m-sair';b.textContent='Sair do jogo';
    b.addEventListener('click',()=>{try{sfx('clique');}catch(_){}PC_APP.sair();});pcCol.insertBefore(b,$('m-aviso'));}
  PC_APP.aoAtualizar(v=>{
    if(pcCol&&!$('m-atualiza')){const d=document.createElement('div');d.className='m-atualiza';d.id='m-atualiza';
      d.innerHTML='<span>A versão <b></b> já foi baixada. Ela entra quando você fechar o jogo.</span><button type="button" class="btn">Reiniciar e atualizar agora</button>';
      d.querySelector('b').textContent=v;const bt=d.querySelector('button');
      bt.addEventListener('click',()=>{bt.disabled=true;bt.textContent='Atualizando…';PC_APP.reiniciarParaAtualizar();});
      pcCol.insertBefore(d,$('m-aviso'));}
    if(G.modo==='jogo'||G.modo==='pausa')feed('Atualização '+v+' baixada: ela entra quando você fechar o jogo.');});
}

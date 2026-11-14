/* ================= Lobby (versão 10): quatro caminhos — Jogar sozinho, Multiplayer, Personagem e Configurações =================
   Pedido do Himalaia (11/11): "um lobby separado com jogar sozinho, multiplayer, personagem e configurações", "bonito, inovador,
   elegante", dividido nessas 4 categorias (desenho aprovado no quadro "VAYDR — Lobby"); depois de escolher o caminho, a tela
   dele no mesmo padrão (em Configurações, as abas de Som, Resolução e Sensibilidade). Toma o lugar do lobby com o personagem
   em 3D que estava na 62q.
   · Lobby: quatro painéis altos lado a lado. O do mouse (ou o escolhido no teclado: 1 a 4 e as setas, Enter entra) se abre,
     a imagem aproxima e aparecem os detalhes. Jogar sozinho vem aberto, com o Continuar do último mundo.
     Em cima: a marca e o perfil (Trocar volta ao "Quem vai jogar?"). Embaixo: Conquistas, Como jogar, Salvamentos, Sair (PC).
   · Telas de cada caminho: a mesma barra de cima, com "Lobby" para voltar, o número e o nome do caminho na cor dele.
   · Multiplayer ainda não funciona: o painel diz "Em breve" e a tela dele explica o que vem, sem botão que finja funcionar.
   · Os botões de sempre (m-sozinho, m-personagem, m-ajustes, m-continuar...) só mudam de lugar: os mesmos ouvintes e testes.
   · Com o lobby (ou a tela de um caminho) cobrindo tudo, o cenário 3D de trás não é desenhado: poupa a placa de vídeo. */
const VL_CAM=[
  {k:'sozinho',n:'01',tit:'Jogar sozinho',sub:'Seus mundos, no seu ritmo. Cada mundo é uma partida separada.',cor:'#ff8a3d',img:LOBBY_IMG.sozinho,bt:'m-sozinho',ir:'Entrar'},
  {k:'multi',n:'02',tit:'Multiplayer',sub:'O mesmo mundo com os amigos, por rede local ou Radmin VPN.',cor:'#62b8ff',img:LOBBY_IMG.multi,bt:'m-multi',ir:'Ver como vai ser',tag:'Em breve',
    mais:'<span>Criar mundo e chamar os amigos</span><span>Entrar no mundo de um amigo</span>'},
  {k:'pers',n:'03',tit:'Personagem',sub:'Rosto, cabelo e corpo do seu sobrevivente.',cor:'#97c76e',img:LOBBY_IMG.pers,bt:'m-personagem',ir:'Ajustar',
    mais:'<span>Vale para os mundos novos e para o multiplayer</span>'},
  {k:'conf',n:'04',tit:'Configurações',sub:'Gráficos, resolução, som, sensibilidade, controles e conta.',cor:'#ece4d2',img:null,bt:'m-ajustes',ir:'Abrir',mais:'<span id="vl-conf-resumo"></span>'}];
const VL_SETA='<svg class="vl-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const VL_VOLTA='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const VL_GEAR='<svg class="vl-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';

/* ---------- visual ---------- */
{const st=document.createElement('style');st.textContent=`
#t-menu.vl-on,.tela.vl-sub{place-items:stretch;padding:0;overflow:hidden;background:#0d1114}
.vl,.vl-caixa{position:relative;width:100%;height:100%;min-height:0;display:grid;gap:20px;justify-items:stretch;align-items:stretch;text-align:left;
  padding:calc(22px + env(safe-area-inset-top,0px)) max(44px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(44px,env(safe-area-inset-left,0px));
  background:radial-gradient(ellipse 55% 38% at 50% 106%,rgba(255,138,61,.2),rgba(255,138,61,0) 70%),radial-gradient(ellipse 100% 90% at 50% 45%,rgba(13,17,20,0) 45%,rgba(5,7,8,.9) 100%),#0d1114}
.vl{grid-template-rows:auto minmax(0,1fr) auto}
.vl-caixa{grid-template-rows:auto minmax(0,1fr)}
.vl>.logo{display:none}
/* barra de cima */
.vl-topo,.vl-cab{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:54px;min-width:0}
.vl-marca{display:flex;align-items:center;gap:16px;min-width:0}
.vl-logo{font:700 40px/1 var(--f-display);letter-spacing:.14em;color:var(--bone);text-shadow:0 3px 24px rgba(0,0,0,.5)}
.vl-fio{width:1px;height:28px;background:rgba(236,228,210,.22)}
.vl-lema{font:800 12.5px/1 var(--f-ui);letter-spacing:.36em;text-transform:uppercase;color:var(--ember)}
.vl .m-perfil,.vl-cab-p{display:flex;align-items:center;gap:12px;width:auto;max-width:44%;padding:0;background:none;border:0;justify-self:auto;text-align:right}
.vl .m-perfil .lg-av,.vl-cab-p .lg-av{order:2;width:48px;height:48px;border-radius:50%;border:2px solid rgba(236,228,210,.3)}
.vl .m-pn{order:1;justify-items:end;text-align:right;gap:4px}.vl .m-pn b{order:1;font:800 18px/1 var(--f-ui);letter-spacing:.04em}.vl .m-pn small{order:2}
.vl .m-pn small{font:600 13.5px/1.2 var(--f-ui);letter-spacing:0;text-transform:none;color:var(--ash)}
.vl .m-trocar{order:3;padding:9px 14px;border-radius:999px;border:1px solid rgba(236,228,210,.22);font:800 13px/1 var(--f-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--ash)}
.vl .menu-col{position:absolute;left:50%;top:calc(80px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:3;width:min(520px,calc(100% - 32px));display:grid;gap:8px}
.vl .menu-col:not(:has(>:not([hidden]))){display:none}
.vl .m-aviso{margin:0;padding:10px 14px;border-radius:10px;background:rgba(227,73,62,.16);border:1px solid rgba(227,73,62,.5);color:var(--blood-ink);font:600 13.5px/1.35 var(--f-ui)}
/* os quatro painéis */
.vl-fila{display:flex;gap:14px;min-height:0}
.vl-pan{position:relative;flex:1 1 0;min-width:0;overflow:hidden;border-radius:18px;border:1px solid rgba(236,228,210,.16);background:#151b1f;cursor:pointer;outline:none;
  container-type:inline-size;transition:flex-grow .55s cubic-bezier(.2,.7,.2,1),border-color .3s,box-shadow .3s}
.vl-pan.vl-dest{flex-grow:1.55}
.vl-fila:hover .vl-pan,.vl-fila:has(.vl-pan:focus-visible) .vl-pan{flex-grow:1}
.vl-fila .vl-pan.vl-pan:hover,.vl-fila .vl-pan.vl-pan:focus-visible{flex-grow:1.75;border-color:rgba(236,228,210,.4)}
.vl-pan:focus-visible{box-shadow:0 0 0 2px var(--cor)}
.vl-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 25%;filter:saturate(.8) brightness(.72);transition:transform .8s cubic-bezier(.2,.7,.2,1),filter .5s}
.vl-pan:hover .vl-img,.vl-pan:focus-visible .vl-img{transform:scale(1.06);filter:saturate(1) brightness(.85)}
.vl-pan[data-k="multi"] .vl-img{filter:saturate(.55) brightness(.6)}
.vl-pan[data-k="pers"] .vl-img{object-position:50% 4%}
.vl-grade{position:absolute;inset:0;background-image:linear-gradient(rgba(236,228,210,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(236,228,210,.05) 1px,transparent 1px);background-size:28px 28px}
.vl-gear{position:absolute;left:50%;top:34%;width:min(300px,80%);height:auto;transform:translate(-50%,-50%);color:rgba(236,228,210,.16);transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
.vl-pan:hover .vl-gear,.vl-pan:focus-visible .vl-gear{transform:translate(-50%,-50%) rotate(30deg)}
.vl-veu{position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,12,14,.22) 0%,rgba(9,12,14,.12) 40%,rgba(9,12,14,.96) 100%)}
.vl-pan[data-k="multi"] .vl-veu{background:linear-gradient(180deg,rgba(20,48,78,.35) 0%,rgba(9,14,20,.3) 40%,rgba(8,12,17,.96) 100%)}
.vl-cor{position:absolute;left:0;right:0;top:0;height:3px;background:var(--cor)}
.vl-num{font:800 14px/1 var(--f-ui);letter-spacing:.32em;color:rgba(236,228,210,.75)}
.vl-pan>.vl-num{position:absolute;left:26px;top:24px}
.vl-tag{position:absolute;right:20px;top:18px;padding:5px 9px;border-radius:999px;border:1px solid rgba(143,202,255,.5);background:rgba(12,26,40,.7);font:800 11.5px/1 var(--f-ui);letter-spacing:.16em;text-transform:uppercase;color:#cfe7ff}
.vl-txt{position:absolute;left:26px;right:26px;bottom:26px;display:grid;grid-template-columns:minmax(0,1fr);gap:12px;color:var(--bone)}
.vl-barra{display:block;width:38px;height:3px;border-radius:2px;background:var(--cor)}
.vl-tit{margin:0;font:700 clamp(18px,8.2cqw,38px)/.98 var(--f-display);letter-spacing:.05em;text-transform:uppercase;text-wrap:balance}
.vl p.vl-sub{margin:0;font:600 16px/1.35 var(--f-ui);letter-spacing:0;text-transform:none;color:#c3c7bb}
.vl-mais{display:grid;gap:8px;opacity:0;max-height:0;overflow:hidden;transition:opacity .35s,max-height .45s;font:700 14.5px/1.3 var(--f-ui);color:#d9dccf}
.vl-pan.vl-dest .vl-mais{opacity:1;max-height:170px}
.vl-fila:hover .vl-pan .vl-mais,.vl-fila:has(.vl-pan:focus-visible) .vl-pan .vl-mais{opacity:0;max-height:0}
.vl-fila .vl-pan.vl-pan:hover .vl-mais,.vl-fila .vl-pan.vl-pan:focus-visible .vl-mais{opacity:1;max-height:170px}
.vl-pan[data-k="multi"] .vl-mais{color:#cfe7ff}.vl-pan[data-k="pers"] .vl-mais{color:#d6e8c4}
.vl-mais small{font:700 13.5px/1.3 var(--f-ui);color:var(--ash)}
.vl #m-continuar{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:100%;min-height:0;padding:11px 14px 11px 40px;border-radius:12px;border:0;background:rgba(194,85,29,.92);color:#fff7ee;
  font:800 15px/1 var(--f-ui);letter-spacing:.1em;text-transform:uppercase;text-align:left;position:relative;cursor:pointer}
.vl #m-continuar::before{content:"";position:absolute;left:16px;top:50%;margin-top:-7px;border-style:solid;border-width:7px 0 7px 11px;border-color:transparent transparent transparent currentColor}
.vl #m-continuar:hover{background:#d8641f}.vl #m-continuar small{font:600 13.5px/1.1 var(--f-ui);letter-spacing:0;text-transform:none;opacity:.92}
.vl #m-continuar[hidden]{display:none}
.vl-ir.btn{display:inline-flex;align-items:center;gap:8px;justify-self:start;width:auto;min-height:0;padding:4px 0;border:0;background:none;color:#fff;font:800 clamp(11.5px,4.7cqw,14px)/1 var(--f-ui);letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}
.vl-ir.btn.prim{background:none;border:0}.vl-ir.btn:disabled{opacity:1}
.vl-seta{transition:transform .3s}.vl-pan:hover .vl-seta,.vl-pan:focus-visible .vl-seta{transform:translateX(6px)}
/* rodapé */
.vl-rodape{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.vl-links{display:flex;flex-wrap:wrap;gap:4px 24px}
.vl-links .btn{width:auto;min-height:0;padding:6px 0;border:0;background:none;color:var(--ash);font:700 15px/1 var(--f-ui);letter-spacing:0;text-transform:none}
.vl-links .btn:hover,.vl-links .btn:focus-visible{color:#fff}.vl-links .btn[hidden]{display:none}
.vl-teclas{display:flex;align-items:center;gap:7px;font:700 13.5px/1 var(--f-ui);color:#8a9086}
.vl kbd,.vl-caixa kbd{padding:2px 7px;border-radius:5px;border:1px solid rgba(236,228,210,.25);font:800 12.5px/1.2 var(--f-ui);color:#c3c7bb}
.vl .versao{font:700 12.5px/1 var(--f-ui);letter-spacing:.14em;text-transform:uppercase;color:#8a9086}
body[data-tela="celular"] .vl-teclas{display:none}
/* telas de cada caminho: a mesma barra de cima */
.vl-cab-t{display:flex;align-items:center;gap:14px;min-width:0;margin-right:auto}
.vl-cab-t .vl-num{color:var(--cor)}
.vl-cab-t h2{margin:0;font:700 34px/1 var(--f-display);letter-spacing:.06em;text-transform:uppercase;color:var(--bone);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vl-volta{appearance:none;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px 0 12px;border-radius:999px;border:1px solid rgba(236,228,210,.22);background:rgba(255,255,255,.03);
  color:var(--bone);font:800 13.5px/1 var(--f-ui);letter-spacing:.1em;text-transform:uppercase;cursor:pointer;flex:none}
.vl-volta:hover,.vl-volta:focus-visible{border-color:var(--cor,var(--ember));color:#fff;outline:none}
.vl-cab-p{gap:10px}.vl-cab-p b{font:800 16px/1 var(--f-ui);color:var(--bone)}.vl-cab-p .lg-av{width:40px;height:40px}
.vl-corpo{min-height:0;display:grid}
/* Jogar sozinho (refeito em 12/11, "melhore o visual dessa parte"): à esquerda o mundo escolhido em destaque, com imagem,
   números grandes e o Jogar; à direita a lista dos mundos e o Novo mundo */
#t-sozinho .cartao.sz{width:100%;max-width:none;height:100%;min-height:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;
  display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,380px);grid-template-rows:minmax(0,1fr);gap:22px}
#t-sozinho .sz-topo{display:none}
.sz-hero{grid-column:1;grid-row:1;position:relative;min-height:0;display:grid;align-content:end;padding:clamp(22px,3.2vw,40px);border-radius:20px;overflow:hidden;
  border:1px solid rgba(236,228,210,.16);background:#12181b}
.sz-h-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 28%;filter:saturate(.85) brightness(.78);animation:szZoom 24s ease-in-out infinite alternate}
@keyframes szZoom{from{transform:scale(1.02)}to{transform:scale(1.09) translateX(-1.5%)}}
.sz-h-veu{position:absolute;inset:0;background:linear-gradient(90deg,rgba(9,12,14,.94) 0%,rgba(9,12,14,.66) 42%,rgba(9,12,14,.1) 100%),linear-gradient(0deg,rgba(9,12,14,.92) 0%,rgba(9,12,14,0) 58%)}
.sz-h-cor{position:absolute;left:0;right:0;top:0;height:3px;background:var(--ember)}
.sz-h-txt{position:relative;display:grid;gap:16px;max-width:680px;min-width:0}
.sz-h-rot{display:flex;align-items:center;gap:10px;font:800 12.5px/1 var(--f-ui);letter-spacing:.3em;text-transform:uppercase;color:var(--ember)}
.sz-h-rot::before{content:"";width:28px;height:3px;border-radius:2px;background:var(--ember)}
#sz-hero .sz-h-nome{margin:0;font:700 clamp(38px,5.2vw,72px)/.95 var(--f-display);letter-spacing:.04em;text-transform:uppercase;color:var(--bone);overflow-wrap:anywhere;text-shadow:0 4px 30px rgba(0,0,0,.5)}
.sz-h-desc{margin:0;font:600 16px/1.45 var(--f-ui);color:#c3c7bb;max-width:52ch}
.sz-h-stats{display:flex;flex-wrap:wrap;gap:14px 0;padding:14px 0;border-top:1px solid rgba(236,228,210,.14);border-bottom:1px solid rgba(236,228,210,.14)}
.sz-h-stat{display:grid;gap:7px;padding:0 26px;border-left:1px solid rgba(236,228,210,.12)}.sz-h-stat:first-child{padding-left:0;border-left:0}
.sz-h-stat small{font:800 11px/1 var(--f-ui);letter-spacing:.22em;text-transform:uppercase;color:#8a9086}
.sz-h-stat b{font:800 28px/1 var(--f-ui);color:var(--bone);font-variant-numeric:tabular-nums}.sz-h-stat b i{font-style:normal;font-size:16px;color:var(--ash);margin-left:3px}
.sz-h-bts{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.sz-h-bts button{appearance:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;min-height:46px;padding:0 18px;border-radius:12px;border:1px solid rgba(236,228,210,.24);
  background:rgba(13,17,20,.55);color:var(--bone);font:800 14px/1 var(--f-ui);letter-spacing:.06em;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.sz-h-bts button:hover,.sz-h-bts button:focus-visible{border-color:rgba(255,138,61,.6);color:#fff;outline:none}
.sz-h-bts .sz-h-jogar{min-height:58px;padding:0 34px 0 30px;border:0;background:linear-gradient(180deg,#d8641f,#b9501a);color:#fff7ee;font-size:17px;letter-spacing:.16em;text-transform:uppercase;box-shadow:0 10px 30px rgba(194,85,29,.35)}
.sz-h-bts .sz-h-jogar:hover{background:linear-gradient(180deg,#ea7027,#c95a1d)}
.sz-h-bts .sz-h-jogar svg{width:18px;height:18px}
.sz-h-bts .sz-apagar{color:var(--blood-ink);border-color:rgba(227,73,62,.45)}.sz-h-bts .sz-apagar.sim{background:rgba(227,73,62,.28);border-color:var(--blood);color:#fff}
.sz-h-ren{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.sz-h-ren .sz-ren{flex:1 1 260px;width:auto;min-height:52px;font:700 24px/1 var(--f-display);letter-spacing:.04em;text-transform:uppercase}
.sz-dir{grid-column:2;grid-row:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:14px}
.sz-dir-cab{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:2px 2px 0}
.sz-dir-cab h3{margin:0;font:700 22px/1 var(--f-display)!important;letter-spacing:.06em!important;text-transform:uppercase;color:var(--bone)!important}
.sz-dir-cab span{font:700 13px/1 var(--f-ui);color:#8a9086}
#t-sozinho .sz-lista{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;align-content:start;max-height:none;height:100%;min-height:0;overflow-y:auto;padding:2px 4px 2px 2px}
#t-sozinho .sz-m{position:relative;display:flex;align-items:center;gap:12px;padding:0;border-radius:14px;border:1px solid rgba(236,228,210,.1);background:rgba(255,255,255,.028);overflow:hidden;transition:border-color .2s,background .2s}
#t-sozinho .sz-m:hover{border-color:rgba(236,228,210,.26)}
#t-sozinho .sz-m.sel{border-color:rgba(255,138,61,.6);background:linear-gradient(90deg,rgba(255,138,61,.17),rgba(255,138,61,.03) 70%)}
#t-sozinho .sz-m.sel::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 2px 2px 0;background:var(--ember)}
.sz-ver{appearance:none;display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px 14px 18px;border:0;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit}
.sz-ver:focus-visible{outline:2px solid var(--ember);outline-offset:-2px;border-radius:14px}
#t-sozinho .sz-i{display:grid;gap:5px;min-width:0;flex:1}
#t-sozinho .sz-i b{font:700 18px/1.1 var(--f-display);letter-spacing:.05em;text-transform:uppercase;color:var(--bone);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#t-sozinho .sz-i small{font:600 13.5px/1.25 var(--f-ui);color:var(--ash)}
.sz-tag{flex:none;padding:4px 8px;border-radius:999px;background:rgba(255,138,61,.16);border:1px solid rgba(255,138,61,.45);font:800 10.5px/1 var(--f-ui);letter-spacing:.14em;text-transform:uppercase;color:#ffc59e}
.sz-chev{flex:none;color:#8a9086;transition:transform .2s}.sz-m.sel .sz-chev,.sz-m:hover .sz-chev{color:var(--bone);transform:translateX(3px)}
#t-sozinho .sz-vazio{padding:26px 18px;border-radius:14px;border:1px dashed rgba(236,228,210,.2);color:var(--ash);font:600 15px/1.4 var(--f-ui);text-align:center}
.sz-pe{display:grid;gap:10px}
#t-sozinho #sz-acoes .btn{position:relative;display:grid;justify-items:start;gap:5px;width:100%;min-height:0;padding:16px 18px 16px 62px;border-radius:14px;border:1px dashed rgba(255,138,61,.55);
  background:rgba(255,138,61,.06);color:var(--bone);text-align:left;font:800 16px/1 var(--f-ui);letter-spacing:.12em;text-transform:uppercase}
#t-sozinho #sz-acoes .btn small{font:600 13px/1.3 var(--f-ui);letter-spacing:0;text-transform:none;color:var(--ash)}
#t-sozinho #sz-acoes .btn::before{content:"+";position:absolute;left:16px;top:50%;width:32px;height:32px;margin-top:-16px;border-radius:50%;display:grid;place-items:center;background:var(--ember-deep);color:#fff;font:700 22px/1 var(--f-ui)}
#t-sozinho #sz-acoes .btn:hover:not(:disabled){background:rgba(255,138,61,.13);border-style:solid}
#t-sozinho .sz-msg{margin:0;min-height:0;color:#f2d36b;font:600 13.5px/1.35 var(--f-ui)}#t-sozinho .sz-msg:empty{display:none}
#t-sozinho .sz-espaco{margin:0;color:#8a9086;font:600 12.5px/1.35 var(--f-ui)}
/* Multiplayer (em breve) */
.mp{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,40%);gap:28px;min-height:0;align-items:stretch}
.mp-esq{display:grid;gap:16px;align-content:center;min-width:0;max-width:640px}
.mp-esq .vl-tag{position:static;justify-self:start}
.mp-esq h3{margin:0;font:700 clamp(30px,4vw,52px)/1 var(--f-display);letter-spacing:.04em;text-transform:uppercase;color:var(--bone)}
.mp-esq p{margin:0;font:600 17px/1.5 var(--f-ui);color:#c3c7bb}
.mp-ops{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.mp-op{display:grid;gap:8px;padding:18px;border-radius:14px;border:1px dashed rgba(143,202,255,.35);background:rgba(18,30,42,.5)}
.mp-op b{font:800 17px/1.2 var(--f-ui);color:#e4f2ff}.mp-op span{font:600 14px/1.4 var(--f-ui);color:#a8bfd3}
.mp-op i{justify-self:start;font:800 11px/1 var(--f-ui);font-style:normal;letter-spacing:.14em;text-transform:uppercase;color:#8fcaff}
.mp-nota{font:600 14px/1.45 var(--f-ui)!important;color:#8a9086!important}
.mp-img{position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(143,202,255,.25);min-height:260px;background:var(--mp-img) 50% 30%/cover}
.mp-img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,48,78,.35),rgba(8,12,17,.75))}
/* Configurações: abas à esquerda, opções em linhas */
#t-ajustes .cartao.aj-sec-cartao{width:100%;max-width:1180px;justify-self:center;height:100%;min-height:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;
  grid-template-columns:240px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:16px 30px}
.aj-sec-cartao>h2{display:none}
#t-ajustes .aj-nav{grid-column:1;grid-row:1;gap:4px}
#t-ajustes .aj-nav button{min-height:48px;padding:0 14px;border-radius:12px;font:800 15.5px/1.1 var(--f-ui);color:var(--ash)}
#t-ajustes .aj-nav button[aria-pressed="true"]{background:rgba(236,228,210,.08);border-color:rgba(236,228,210,.28);color:var(--bone);box-shadow:inset 3px 0 0 var(--ember)}
#t-ajustes .aj-painel{grid-column:2;grid-row:1;max-height:100%;gap:10px;padding:2px 8px 6px 2px}
#t-ajustes .aj-painel .opcao{grid-template-columns:minmax(0,1fr) minmax(250px,440px);align-items:center;gap:10px 22px;padding:16px 18px;border-radius:14px;
  background:rgba(255,255,255,.025);border:1px solid rgba(236,228,210,.08)}
#t-ajustes .aj-painel .opcao>label,#t-ajustes .aj-painel .opcao>.rot{font:700 16px/1.3 var(--f-ui);letter-spacing:0;text-transform:none;color:var(--bone)}
#t-ajustes .aj-painel .opcao>label b{color:var(--ember);margin-left:4px}
#t-ajustes .aj-painel .opcao>.btn,#t-ajustes .aj-painel .opcao>.aj-linha,#t-ajustes .aj-painel .opcao>p{grid-column:1/-1}
#t-ajustes .aj-painel .opcao>.btn{justify-self:start;width:auto;min-width:220px}
#t-ajustes .aj-painel .aj-nota,#t-ajustes .aj-painel>p{margin:2px 4px;font:600 14px/1.45 var(--f-ui)!important;color:#8a9086!important}
#t-ajustes .aj-pf-topo{padding:6px 4px 10px}
#t-ajustes .segs{background:rgba(236,228,210,.1);border-radius:11px}#t-ajustes .segs button{min-height:40px;border-radius:9px;font-size:14.5px}
#t-ajustes .cartao .aj-sec-cartao>#aj-ok,#t-ajustes #aj-ok{grid-column:2;grid-row:2;justify-self:end;width:auto;min-width:200px;min-height:48px;border-radius:12px;letter-spacing:.12em;text-transform:uppercase}
@media (max-width:860px){.mp{grid-template-columns:minmax(0,1fr)}.mp-img{display:none}
  #t-sozinho .cartao.sz{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto;overflow-y:auto}.sz-hero{grid-column:1;grid-row:1;min-height:360px}.sz-dir{grid-column:1;grid-row:2}#t-sozinho .sz-lista{height:auto;overflow:visible}.sz-h-stat{padding:0 16px}
  #t-ajustes .cartao.aj-sec-cartao{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto}
  #t-ajustes .aj-nav{grid-row:1;display:flex;overflow-x:auto;padding-bottom:4px}#t-ajustes .aj-nav button{flex:none;width:auto;min-height:42px}
  #t-ajustes .aj-painel{grid-column:1;grid-row:2}#t-ajustes #aj-ok{grid-column:1;grid-row:3;justify-self:stretch}
  #t-ajustes .aj-painel .opcao{grid-template-columns:minmax(0,1fr)}}
/* login "Quem vai jogar?": o cenário 3D de noite atrás, escurecido; perfis como cartões lado a lado */
#t-login{background:radial-gradient(ellipse 70% 60% at 50% 42%,rgba(13,17,20,.5),rgba(5,7,8,.94) 100%)}
#t-login .titulo{gap:26px}
#t-login .logo{font-size:clamp(48px,min(9vw,13vh),104px)}
#t-login .lg-caixa{width:min(1040px,100%);padding:0;background:none;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;gap:18px;justify-items:center}
#t-login .lg-t{font:700 32px/1 var(--f-display);letter-spacing:.08em}
#t-login .lg-sub{font:600 16px/1.4 var(--f-ui)!important;color:#c3c7bb;max-width:60ch}
#t-login .lg-lista{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;max-height:none;overflow:visible;width:100%}
#t-login .lg-perfil{position:relative;flex-direction:column;align-items:center;justify-content:flex-start;gap:12px;width:188px;padding:22px 14px 18px;border-radius:18px;border:1px solid rgba(236,228,210,.16);
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015)),#12181b;text-align:center;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
#t-login .lg-perfil::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--ember);opacity:.55}
#t-login .lg-perfil:hover,#t-login .lg-perfil:focus-visible{transform:translateY(-4px);border-color:rgba(255,138,61,.6);box-shadow:0 16px 40px rgba(0,0,0,.45);background:linear-gradient(180deg,rgba(255,138,61,.12),rgba(255,255,255,.02)),#12181b}
#t-login .lg-perfil .lg-av{width:104px;height:104px;border-radius:50%;border:2px solid rgba(236,228,210,.28)}
#t-login .lg-del{top:12px;right:12px}#t-login .lg-cart:hover .lg-del,#t-login .lg-cart:hover .lg-perfil{transform:translateY(-4px)}   /* a lixeira sobe junto com o cartão */
#t-login .lg-cart.apaga .lg-perfil{transform:none}
#t-login .lg-conf{border-radius:18px}
#t-login .lg-i{justify-items:center;width:100%}#t-login .lg-i b{font:700 20px/1.1 var(--f-display);letter-spacing:.05em;text-transform:uppercase;max-width:100%}
#t-login .lg-i small{white-space:normal;text-align:center}
#t-login .lg-ent{opacity:.85}
#t-login #lg-mais{width:auto;min-width:220px;min-height:46px;border-radius:999px;border-style:dashed;background:transparent}
#t-login .lg-novo{width:min(420px,100%)}
/* telas baixas (celular deitado) e estreitas (celular em pé) */
@media (max-height:560px){.vl,.vl-caixa{gap:12px;padding-top:calc(12px + env(safe-area-inset-top,0px));padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}
  .vl-logo{font-size:30px}.vl-lema,.vl-fio{display:none}.vl-sub{display:none}.vl-txt{left:16px;right:16px;bottom:16px;gap:8px}.vl-pan>.vl-num{left:16px;top:14px}
  .vl-cab-t h2{font-size:26px}.vl-teclas{display:none}}
@media (max-width:760px) and (orientation:portrait){.vl,.vl-caixa{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
  #t-menu.vl-on{overflow-y:auto}.vl{height:auto;min-height:100%}
  .vl-fila{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(190px,auto)}.vl-pan.vl-dest{grid-column:1/-1;min-height:250px}
  .vl-lema,.vl-fio{display:none}.vl-logo{font-size:30px}.vl .m-pn,.vl-cab-p b{display:none}.vl-sub{display:none}.vl-txt{left:16px;right:16px;bottom:16px}
  .vl-cab-t h2{font-size:24px}.vl-teclas{display:none}.vl-caixa{overflow-y:auto}}`;
 document.body.appendChild(st);}   // no fim do body: depois do <style> da página (no head ele perde os empates de especificidade)

/* ---------- lobby ---------- */
{const tm=$('t-menu'),tit=tm.querySelector('.titulo');tm.classList.remove('clara');tm.classList.add('vl-on');tit.classList.add('vl');
 const topo=document.createElement('header');topo.className='vl-topo';
 topo.innerHTML='<div class="vl-marca"><span class="vl-logo">VAYDR</span><i class="vl-fio" aria-hidden="true"></i><span class="vl-lema">Sobreviver é construir</span></div>';
 topo.append($('m-perfil'));
 const fila=document.createElement('nav');fila.className='vl-fila';fila.id='vl-fila';fila.setAttribute('aria-label','Lobby');
 for(const c of VL_CAM){const p=document.createElement('div');p.className='vl-pan'+(c.k==='sozinho'?' vl-dest':'');p.dataset.k=c.k;p.tabIndex=0;p.setAttribute('role','group');p.setAttribute('aria-label',c.tit);p.style.setProperty('--cor',c.cor);
   p.innerHTML=(c.img?'<img class="vl-img" alt="" src="'+c.img+'">':'<span class="vl-grade" aria-hidden="true"></span>'+VL_GEAR)+'<span class="vl-veu" aria-hidden="true"></span><span class="vl-cor" aria-hidden="true"></span>'+
     '<span class="vl-num">'+c.n+'</span>'+(c.tag?'<span class="vl-tag">'+c.tag+'</span>':'')+
     '<div class="vl-txt"><span class="vl-barra" aria-hidden="true"></span><h2 class="vl-tit">'+c.tit+'</h2><p class="vl-sub">'+c.sub+'</p><div class="vl-mais">'+(c.mais||'')+'</div></div>';
   const b=$(c.bt);b.className='btn vl-ir';b.innerHTML=c.ir+VL_SETA;p.querySelector('.vl-txt').append(b);fila.append(p);}
 // Jogar sozinho: o Continuar do último mundo e quantos mundos o perfil tem
 {const mais=fila.querySelector('[data-k="sozinho"] .vl-mais');mais.append($('m-continuar'));mais.insertAdjacentHTML('beforeend','<small id="lb-mundo"></small>');}
 // Multiplayer: abre a tela que explica o que vem (não finge funcionar)
 {const m=fila.querySelector('#m-multi');m.disabled=false;m.removeAttribute('title');}   // (a fila ainda não está na página: $() não acha)
 const rodape=document.createElement('footer');rodape.className='vl-rodape';const links=document.createElement('div');links.className='vl-links';
 for(const id of['m-conq','m-ajuda','m-salvo','m-criativo','m-sair']){const b=$(id);if(b){b.classList.remove('prim');links.append(b);}}
 rodape.append(links);rodape.insertAdjacentHTML('beforeend','<span class="vl-teclas"><kbd>1</kbd>–<kbd>4</kbd> escolhem · <kbd>Enter</kbd> entra</span>');rodape.append(tit.querySelector('.versao'));
 const col=tit.querySelector('.menu-col'),sec=col.querySelector('.m-sec');if(sec)sec.remove();
 tit.replaceChildren(topo,fila,rodape,col,tit.querySelector('.logo')||document.createElement('span'));}
/* clicar em qualquer parte do painel = o botão dele (o Continuar e o próprio botão seguem com o clique deles) */
$('vl-fila').addEventListener('click',e=>{if(e.target.closest('button'))return;const p=e.target.closest('.vl-pan');if(!p)return;const c=VL_CAM.find(x=>x.k===p.dataset.k);if(c)$(c.bt).click();});
/* teclado: 1 a 4 e as setas escolhem, Enter entra */
function vlNoLobby(){return G.modo==='menu'&&!$('t-menu').hidden;}
addEventListener('keydown',e=>{if(!vlNoLobby()||e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  const ps=[...document.querySelectorAll('#vl-fila .vl-pan')],i=ps.indexOf(document.activeElement);let alvo=null;
  if(/^[1-4]$/.test(e.key))alvo=ps[Number(e.key)-1];
  else if(e.key==='ArrowRight'||e.key==='ArrowDown')alvo=ps[i<0?0:Math.min(ps.length-1,i+1)];
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp')alvo=ps[i<0?0:Math.max(0,i-1)];
  else if((e.key==='Enter'||e.key===' ')&&i>=0){e.preventDefault();e.stopImmediatePropagation();const c=VL_CAM[i];sfx('clique');$(c.bt).click();return;}
  if(alvo){e.preventDefault();e.stopImmediatePropagation();alvo.focus({preventScroll:true});}},true);
function vlAtualiza(){if(!PERFIL)return;
  const sm=document.querySelector('#m-perfil .m-pn small');if(sm)sm.textContent=MUNDO&&pfTemSave(MUNDO)?MUNDO.nome+' · dia '+MUNDO.dia+' · nível '+MUNDO.nivel:(PERFIL.mundos.length?PERFIL.mundos.length+(PERFIL.mundos.length===1?' mundo':' mundos'):'Perfil neste computador');
  const n=PERFIL.mundos.filter(pfTemSave).length,el=$('lb-mundo');if(el)el.textContent=n?(n===1?'1 mundo salvo':n+' mundos salvos')+' · novo mundo a qualquer hora':'Nenhum mundo ainda: comece o primeiro';
  const r=$('vl-conf-resumo');if(r)r.textContent='Gráficos '+({baixo:'Baixo',medio:'Médio',alto:'Alto',ultra:'Ultra'}[cfg.graf]||cfg.graf)+' · resolução '+(cfg.res&&cfg.res!=='auto'?Math.round(Number(cfg.res)*100)+'%':'automática')+' · som '+(cfg.som?'ligado':'desligado');}
{const _pm=pfMenuAtualiza;pfMenuAtualiza=function(){const r=_pm.apply(this,arguments);try{vlAtualiza();}catch(e){console.error('lobby',e);}return r;};}

/* ---------- barra de cima das telas de cada caminho ---------- */
function vlCabecalho(telaId,c,volta){const t=$(telaId),caixa=document.createElement('div');caixa.className='vl-caixa';t.classList.remove('clara');t.classList.add('vl-sub');
  const cab=document.createElement('header');cab.className='vl-cab';cab.style.setProperty('--cor',c.cor);
  cab.innerHTML='<div class="vl-cab-t"><span class="vl-num">'+c.n+'</span><span class="vl-barra" aria-hidden="true" style="--cor:'+c.cor+'"></span><h2>'+c.tit+'</h2></div><div class="vl-cab-p"><b class="vl-cab-nome"></b><span class="lg-av vl-cab-av"></span></div>';
  volta.classList.add('vl-volta');volta.innerHTML=VL_VOLTA+'<span>Lobby</span>';cab.prepend(volta);
  const corpo=document.createElement('div');corpo.className='vl-corpo';corpo.append(...t.children);caixa.append(cab,corpo);t.append(caixa);return corpo;}
function vlPerfilCab(){for(const el of document.querySelectorAll('.vl-cab-nome'))el.textContent=PERFIL?PERFIL.nome:'';for(const el of document.querySelectorAll('.vl-cab-av'))el.innerHTML=PERFIL?pfAvatar(PERFIL):'';}
// Jogar sozinho: o Voltar vira o "Lobby" da barra; à esquerda o mundo escolhido em destaque, à direita a lista e o Novo mundo
{const corpo=vlCabecalho('t-sozinho',VL_CAM[0],$('sz-voltar')),card=corpo.querySelector('.cartao.sz');
 const hero=document.createElement('section');hero.className='sz-hero';hero.id='sz-hero';hero.setAttribute('aria-live','polite');
 const dir=document.createElement('div');dir.className='sz-dir';dir.innerHTML='<div class="sz-dir-cab"><h3>Seus mundos</h3><span id="sz-conta"></span></div>';
 const pe=document.createElement('div');pe.className='sz-pe';pe.append($('sz-acoes'),$('sz-msg'),$('sz-espaco'));
 dir.append($('sz-lista'),pe);card.append(hero,dir);
 $('m-novo').innerHTML='Novo mundo<small>Começa no dia 1, com o seu personagem do perfil e nada na mochila</small>';}
/* a tela nova de Jogar sozinho: o destaque mostra o mundo escolhido na lista (começa no último jogado). As ações são as
   mesmas da 62q (jogar, renomear, cópias e apagar com confirmação), agora nos botões grandes do destaque. */
let szSel=null;
const SZ_PLAY='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',SZ_CHEV='<svg class="sz-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
function szQuando(ms){if(!ms)return'';const d=new Date(ms),h=new Date(),hm=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),dia=x=>x.toDateString();
  if(dia(d)===dia(h))return'hoje, '+hm;const o=new Date(h);o.setDate(h.getDate()-1);if(dia(d)===dia(o))return'ontem, '+hm;return pfQuando(ms);}
pfSoloRender=function(){if(!PERFIL)return;$('sz-perfil').textContent=PERFIL.nome;
  const L=PERFIL.mundos.slice().sort((a,b)=>(b.usado||0)-(a.usado||0));
  if(!L.some(m=>m.id===szSel))szSel=(MUNDO&&L.includes(MUNDO)?MUNDO:L[0]||{}).id||null;
  const m=L.find(x=>x.id===szSel)||null;
  $('sz-lista').innerHTML=L.length?L.map(w=>{const tem=pfTemSave(w);return'<li class="sz-m'+(w.id===szSel?' sel':'')+(MUNDO===w?' atual':'')+'" data-id="'+w.id+'"><button type="button" class="sz-ver" data-a="ver" aria-pressed="'+(w.id===szSel)+'">'+
      '<span class="sz-i"><b>'+pfEsc(w.nome)+'</b><small>'+(tem?'Dia '+w.dia+' · nível '+w.nivel+' · '+szQuando(w.usado):'Ainda não começou')+'</small></span>'+(MUNDO===w?'<span class="sz-tag">Atual</span>':'')+SZ_CHEV+'</button></li>';}).join(''):
    '<li class="sz-vazio">Você ainda não tem mundos. Toque em "Novo mundo" para começar o primeiro.</li>';
  $('sz-conta').textContent=L.length?L.length+' de '+PF_MUNDOS_MAX:'';
  const h=$('sz-hero'),img='<img class="sz-h-img" alt="" src="'+LOBBY_IMG.sozinho+'"><span class="sz-h-veu" aria-hidden="true"></span><span class="sz-h-cor" aria-hidden="true"></span>';
  if(!m){h.dataset.id='';h.innerHTML=img+'<div class="sz-h-txt"><span class="sz-h-rot">Comece aqui</span><h3 class="sz-h-nome">Seu primeiro mundo</h3>'+
      '<p class="sz-h-desc">Cada mundo é uma partida separada, com o seu dia, a sua base e as suas coisas. O mapa é o mesmo; o que acontece nele é só daquele mundo.</p>'+
      '<div class="sz-h-bts"><button type="button" class="sz-h-jogar" data-a="novo">'+SZ_PLAY+'Criar mundo</button></div></div>';}
  else{const tem=pfTemSave(m),ren=szRenomeia===m.id,conf=szConfirma===m.id;h.dataset.id=m.id;
    h.innerHTML=img+'<div class="sz-h-txt"><span class="sz-h-rot">'+(MUNDO===m&&tem?'Último jogado':tem?'Mundo salvo':'Ainda não começou')+'</span>'+
      (ren?'<div class="sz-h-ren"><input class="sz-ren" id="sz-ren" maxlength="24" aria-label="Nome do mundo" value="'+pfEsc(m.nome)+'"><button type="button" class="sz-h-jogar" data-a="ren-ok">Salvar nome</button><button type="button" data-a="ren-x">Cancelar</button></div>':
        '<h3 class="sz-h-nome">'+pfEsc(m.nome)+'</h3>')+
      (tem?'<div class="sz-h-stats"><span class="sz-h-stat"><small>Dia</small><b>'+m.dia+'</b></span><span class="sz-h-stat"><small>Nível</small><b>'+m.nivel+'</b></span>'+
        '<span class="sz-h-stat"><small>Tempo jogado</small><b>'+pfTempo(m.tempo).replace(/ min$/,'<i>min</i>')+'</b></span><span class="sz-h-stat"><small>Última vez</small><b>'+pfEsc(szQuando(m.usado))+'</b></span></div>':
        '<p class="sz-h-desc">Este mundo foi criado mas ainda não tem jogo salvo. Use "Novo mundo" para começar nele.</p>')+
      (ren?'':'<div class="sz-h-bts">'+(tem?'<button type="button" class="sz-h-jogar" data-a="jogar">'+SZ_PLAY+'Jogar</button>':'')+'<button type="button" data-a="renomear">Renomear</button>'+
        (tem?'<button type="button" data-a="copias">Cópias</button>':'')+'<button type="button" class="sz-apagar'+(conf?' sim':'')+'" data-a="apagar">'+(conf?'Toque de novo para apagar':'Apagar')+'</button></div>')+'</div>';}
  const cheio=PERFIL.mundos.length>=PF_MUNDOS_MAX&&PERFIL.mundos.every(pfTemSave),nv=$('m-novo');nv.disabled=cheio;nv.classList.add('prim');
  nv.title=cheio?'Este perfil já tem '+PF_MUNDOS_MAX+' mundos. Apague um para criar outro.':'';
  $('sz-espaco').textContent=pfEspacoTexto();if(szRenomeia){const i=$('sz-ren');if(i){i.focus();i.select();}}};
/* escolher um mundo na lista */
$('sz-lista').addEventListener('click',e=>{const b=e.target.closest('[data-a="ver"]'),li=b&&b.closest('[data-id]');if(!li)return;if(szSel!==li.dataset.id){szSel=li.dataset.id;szRenomeia=null;szConfirma=null;}pfSoloRender();});
/* os botões do destaque: as mesmas ações de antes */
$('sz-hero').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!PERFIL)return;const a=b.dataset.a;
  if(a==='novo'){$('m-novo').click();return;}
  const m=PERFIL.mundos.find(x=>x.id===$('sz-hero').dataset.id);if(!m)return;sfx('clique');if(a!=='apagar')szConfirma=null;$('sz-msg').textContent='';
  if(a==='jogar'){pfUsarMundo(m);pfGravar();try{audioInit();}catch(_){}if(carregarJogo())jogar();else{$('sz-msg').textContent='Não deu para abrir este mundo. Veja as cópias dele em "Cópias".';pfSoloRender();}return;}
  if(a==='renomear'){szRenomeia=m.id;pfSoloRender();return;}
  if(a==='ren-x'){szRenomeia=null;pfSoloRender();return;}
  if(a==='ren-ok'){const n=pfNome($('sz-ren').value,24);if(n)m.nome=n;szRenomeia=null;pfGravar();pfSoloRender();return;}
  if(a==='copias'){pfUsarMundo(m);pfGravar();abrirSalvamento('t-sozinho');return;}
  if(a==='apagar'){if(szConfirma!==m.id){szConfirma=m.id;pfSoloRender();return;}szConfirma=null;pfApagarMundo(m);$('sz-msg').textContent='O mundo "'+m.nome+'" foi apagado.';szSel=null;pfSoloRender();}});
$('sz-hero').addEventListener('keydown',e=>{if(e.target.id!=='sz-ren')return;e.stopPropagation();
  if(e.key==='Enter'){e.preventDefault();const b=document.querySelector('#sz-hero [data-a="ren-ok"]');if(b)b.click();}else if(e.key==='Escape'){e.preventDefault();szRenomeia=null;pfSoloRender();}});
{const _a=pfAbrirSozinho;pfAbrirSozinho=function(){szSel=null;return _a.apply(this,arguments);};}
// Multiplayer: tela nova, só de informação (ainda não funciona)
{$('t-ajustes').insertAdjacentHTML('beforebegin','<div class="tela" id="t-multi" hidden><div class="mp"><div class="mp-esq"><span class="vl-tag">Em breve</span><h3>Jogar junto</h3>'+
   '<p>O multiplayer ainda não funciona: ele é a próxima grande etapa do jogo. Quando ficar pronto, vai ser assim:</p>'+
   '<div class="mp-ops"><div class="mp-op"><i>Em breve</i><b>Criar mundo e chamar os amigos</b><span>Você abre um mundo seu e os amigos entram nele.</span></div>'+
   '<div class="mp-op"><i>Em breve</i><b>Entrar no mundo de um amigo</b><span>Pela rede local (LAN) ou pelo Radmin VPN, com o IP do amigo.</span></div></div>'+
   '<p class="mp-nota">Cada um entra com o próprio personagem do perfil, a sua mochila e o seu progresso. Até lá, os seus mundos ficam em Jogar sozinho.</p></div>'+
   '<div class="mp-img" aria-hidden="true"></div></div><button class="btn" id="mp-voltar" type="button">Voltar</button></div>');
 TELAS.push('t-multi');const img=document.querySelector('#t-multi .mp-img');img.style.setProperty('--mp-img','url("'+LOBBY_IMG.multi+'")');
 vlCabecalho('t-multi',VL_CAM[1],$('mp-voltar'));}
$('m-multi').addEventListener('click',()=>{sfx('clique');G.modo='menu';tela('t-multi');});
$('mp-voltar').addEventListener('click',()=>{sfx('clique');mostrarMenu();});
// Configurações: a barra de cima volta pelo "Pronto" (no meio do jogo, ele volta para a pausa)
{const v=document.createElement('button');v.type='button';v.id='aj-volta';vlCabecalho('t-ajustes',VL_CAM[3],v);v.addEventListener('click',()=>$('aj-ok').click());}
{const _a=ajustesUI;ajustesUI=function(){const r=_a.apply(this,arguments);try{const s=$('aj-volta').querySelector('span');if(s)s.textContent=ajustesVolta==='t-menu'?'Lobby':'Voltar ao jogo';}catch(_){}return r;};}
{const _t=tela;tela=function(id){const r=_t.apply(this,arguments);try{vlPerfilCab();if(id==='t-menu')vlAtualiza();}catch(e){console.error('lobby',e);}return r;};}
// Esc nas telas de cada caminho volta (no lobby e no jogo, o Esc continua como era)
addEventListener('keydown',e=>{if(e.key!=='Escape'||G.modo!=='menu')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  if(!$('t-multi').hidden){e.preventDefault();$('mp-voltar').click();}else if(!$('t-sozinho').hidden){e.preventDefault();$('sz-voltar').click();}},true);

/* ---------- com o lobby cobrindo tudo, o cenário 3D de trás não é desenhado ---------- */
function vlCobre(){if(G.modo!=='menu')return false;for(const id of['t-menu','t-sozinho','t-multi'])if(!$(id).hidden)return true;return!$('t-ajustes').hidden&&ajustesVolta==='t-menu';}
{const _r=render;render=function(){if(vlCobre())return;return _r.apply(this,arguments);};}

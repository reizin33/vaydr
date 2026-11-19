/* ================= O mapa tem que ser fabricado (v10.4.1, 18/11/2026) =================
   Pedido do Himalaia: "mude o mapa, coloque para ter o mapa ter que construir ele". Ninguém começa com o mapa da região:
   · o mapa grande (tecla M, o botão da pausa, o toque no minimapa e o botão do controle) e o minimapa do canto só existem depois
     que você fabrica o "Mapa da região" na bancada: 2 tecidos (o item "Tecido") e 1 graveto, desenhado com a ponta queimada; 1 couro
     serve no lugar dos tecidos;
   · a receita aparece quando você pega tecido pela primeira vez (como as outras receitas novas);
   · fabricou, aprendeu: o mapa não ocupa a mochila nem se perde quando você cai;
   · sem mapa, a bússola continua (com a missão e o que ela aponta), e no lugar do minimapa fica um aviso "Sem mapa"; no menu
     de pausa o botão vira "Mapa · fabrique na bancada" (e não fecha a pausa); o Manual (Exploração e regiões) explica;
   · quem já jogava (jogo salvo de antes desta versão) continua com o mapa; no modo criativo ele já vem;
   · nos testes automáticos o jogo novo já vem com o mapa, como antes (window.__semMapa testa sem). */
ITEMS.mapa={nome:'Mapa da região',icon:'i-mapa',max:1,tipo:'util',
  desc:'Desenhado à mão num pedaço de tecido, com a ponta de um graveto queimado: estradas, rios, lugares e a cidade. Fabricou, aprendeu: a tecla M abre o mapa e o minimapa aparece no canto.'};
RECIPES.push({faz:'mapa',n:1,custo:{pano:2,graveto:1},alt:{pano:['couro',1]},cat:'ferramentas',etapa:1,est:1,desb:{item:'pano'}});
KIND.mapa=['Mapa','#c9b07a','i-mapa'];
function teclaMapaNome(){try{const n=nomeTecla(teclaDe('mapa'));return n&&n!=='—'?n:'M';}catch(e){return'M';}}   // a tecla que o jogador escolheu nos controles
const MAPA_COMO='Fabrique o Mapa da região na bancada: 2 tecidos e 1 graveto (ou 1 couro e 1 graveto).';
function temMapa(){return!!G.temMapa||(typeof ADM!=='undefined'&&ADM.ativo);}
function mapaSemAviso(){document.body.classList.toggle('sem-mapa',!temMapa());mapaPausaBotao();}
/* no menu de pausa, o botão Mapa diz o que falta (e, sem mapa, não fecha a pausa) */
function mapaPausaBotao(){const b=$('p-mapa'),s=b&&b.querySelector('span');if(!s||b.dataset.pisca)return;const sem=!temMapa(),t=sem?'Mapa · fabrique na bancada':'Mapa';
  if(s.textContent!==t)s.textContent=t;b.classList.toggle('pz-sem',sem);}
/* começo, salvar e carregar (registro dos módulos: 39_v8) */
V8.novo.mapa=()=>{G.temMapa=!!(TESTE&&!window.__semMapa);mapaSemAviso();};
V8.salvar.mapa=()=>G.temMapa?1:0;
V8.carregar.mapa=v=>{G.temMapa=v===undefined?true:!!v;mapaSemAviso();};   // jogo salvo de antes: já tinha o mapa
/* fabricou (ou ganhou de outro jeito): vira conhecimento, não item na mochila */
{const _ia=invAdd;invAdd=function(id,n){if(id!=='mapa')return _ia.apply(this,arguments);if(!(n>0))return 0;
  const novo=!G.temMapa;G.temMapa=true;mapaSemAviso();marcarVisto('mapa');
  if(novo&&G.modo!=='menu'){sfx('missao');toast('mapa','Mapa pronto! Aperte '+teclaMapaNome()+' para abrir o mapa grande. O minimapa já está no canto.');}
  return 0;};}
/* depois de feito, a receita some da lista da bancada */
{const _rv=receitaVisivel;receitaVisivel=function(r){if(r&&r.faz==='mapa'&&G.temMapa)return false;return _rv.apply(this,arguments);};}
/* e não dá para gastar tecido num segundo mapa (fabricar vários de uma vez, atalho do painel) */
{const _pf=podeFabricar;podeFabricar=function(r){if(r&&r.faz==='mapa'&&G.temMapa)return false;return _pf.apply(this,arguments);};}
/* sem mapa, nada abre o mapa grande (a tecla M, o botão da pausa, o minimapa, o controle): avisa o que fazer */
function mapaFaltaAviso(){feed('Você ainda não tem mapa',true);sfx('vazio');toast('mapa',MAPA_COMO);}
{const _am=abrirMapa;abrirMapa=function(){if(!temMapa()){if(G.modo==='jogo')mapaFaltaAviso();return;}return _am.apply(this,arguments);};}
/* no lugar do minimapa, enquanto não tem mapa */
{const st=document.createElement('style');st.textContent=`
.mapa-sem{display:none}
body.sem-mapa .mapa{cursor:help}
body.sem-mapa #minimapa,body.sem-mapa .mapa .mapa-n{visibility:hidden}
body.sem-mapa .mapa-sem{display:grid;place-items:center;position:absolute;inset:0;border-radius:50%;text-align:center;padding:10%;font:800 11px/1.2 var(--f-ui);letter-spacing:.1em;text-transform:uppercase;color:rgba(236,228,210,.72);background:repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 6px,transparent 6px 12px);pointer-events:none}`;
 document.head.appendChild(st);
 const sec=$('minimapa')&&$('minimapa').closest('.mapa');
 if(sec){sec.insertAdjacentHTML('beforeend','<span class="mapa-sem" aria-hidden="true">Sem<br>mapa</span>');sec.addEventListener('click',()=>{if(!temMapa()&&G.modo==='jogo')mapaFaltaAviso();});}
 st.textContent+='#p-mapa.pz-sem .ico{opacity:.45}#p-mapa.pz-sem span{color:var(--dim)}';
 /* o clique chega aqui antes do botão da pausa (61b), que fecharia a pausa para abrir o mapa */
 const pm=$('p-mapa');if(pm)pm.addEventListener('click',e=>{if(temMapa())return;e.stopImmediatePropagation();e.preventDefault();sfx('vazio');
   const s=pm.querySelector('span');if(!s)return;pm.dataset.pisca='1';s.textContent='Sem mapa: 2 tecidos e 1 graveto na bancada';
   clearTimeout(pm._pisca);pm._pisca=setTimeout(()=>{delete pm.dataset.pisca;mapaPausaBotao();},2600);},true);}
/* no Manual de Sobrevivência (Exploração e regiões) */
if(!MN_SECOES.some(s=>s[0]==='exploracao'))MN_SECOES.push(['exploracao','Exploração e regiões','i-mapa']);
MANUAL_EXTRA.push(()=>[{id:'x:mapa',sec:'exploracao',nome:'Mapa da região',icon:'i-mapa',trav:false,como:'desde o começo',
  desc:'Ninguém começa com o mapa: você desenha o seu num pedaço de tecido. Sem ele não tem mapa grande nem minimapa; a bússola continua apontando a missão.',
  ing:{},est:{nome:'Bancada (2 tecidos e 1 graveto, ou 1 couro e 1 graveto)',icon:'i-mapa',onde:''},ferr:['Nenhuma'],
  proc:['Tecido se acha nas casas, nos mercados, nas caçambas, nas caixas de suprimentos da mata e às vezes revistando zumbi; pegou o primeiro, a receita aparece na bancada da clareira.',
    'Na bancada, fabrique o Mapa da região. Ele não ocupa a mochila e não se perde quando você cai.',
    'Pronto: a tecla '+teclaMapaNome()+' abre o mapa grande e o minimapa aparece no canto.'],
  res:null,obs:'Quem já jogava antes desta versão continua com o mapa. No modo criativo ele já vem.',tipo:'Guia'}]);
/* caiu sem mapa: a mochila largada aparece na bússola (o minimapa ainda não existe) */
{const _mm=mostrarMorte;mostrarMorte=function(){const r=_mm.apply(this,arguments);if(!temMapa()){const t=$('morte-t');
  if(t&&t.textContent.includes('marcada em verde no minimapa'))t.textContent=t.textContent.replace('marcada em verde no minimapa','marcada em verde na bússola');}return r;};}
/* o modo criativo liga e desliga quando quiser: confere de vez em quando */
setInterval(()=>{if(G.modo!=='menu')mapaSemAviso();},1000);
/* um lembrete, uma vez, depois dos primeiros minutos de um jogo novo sem mapa */
let mapaLembreteT=0;
PASSOS.push(function mapaLembrete(dt){if(temMapa()||G.dicas.semMapa)return;mapaLembreteT+=dt||0;if(mapaLembreteT<150)return;   // dois minutos e meio jogando
  dica('semMapa','mapa','Você ainda não tem mapa. Ache tecido nas casas e '+MAPA_COMO.charAt(0).toLowerCase()+MAPA_COMO.slice(1));});
mapaSemAviso();

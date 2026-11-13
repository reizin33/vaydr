/* ================= tela de carregamento (13/11/2026) =================
   A tela da imagem que o dono aprovou (carregamento_1920.png, que até aqui era só um conceito, fora do jogo):
   à esquerda o VAYDR, a barra com a porcentagem de verdade, as etapas da montagem do mundo (terreno, mata, cidade,
   lugares, sons) e uma dica do jogo; à direita o sobrevivente de mochila (a foto do lobby, que o build.py põe no HTML).
   Embaixo, a versão e, no .exe, o que a atualização automática está fazendo (procurando, baixando com a porcentagem,
   pronta, em dia, sem internet). A montagem vai por etapas (montarMundoPorEtapas, 50_render.js) e a tela anda entre
   uma e outra; boot() chama cargaProgresso antes de cada etapa e cargaPronto no fim. */
const CARGA={etapas:['terreno','mata','cidade','lugares','sons'],dica:-1,troca:null,pronto:false};
/* as dicas: só o que o jogo faz de verdade (conferido na ajuda, nos avisos do jogo e nos controles). {acao} vira a tecla
   dessa ação do jeito que a pessoa deixou nos controles; as marcadas com 1 só valem com teclado */
const CARGA_DICAS=[
  ['Com uma pedra na mão já dá para bater nas árvores e tirar madeira.'],
  ['Agachado ({agachar}), você anda em silêncio, os zumbis demoram mais para te ver e um golpe pelas costas dá o dobro de dano.',1],
  ['Correndo, aperte {agachar} para rolar no chão. Pegou fogo? Role para apagar.',1],
  ['Aperte {usar} para usar, pegar e beber. Segure {usar} para revistar.',1],
  ['Arco e flecha não fazem barulho, e as flechas cravadas dá para recolher passando por cima.'],
  ['Para assar a carne crua, segure {usar} perto da fogueira.',1],
  ['O que fica guardado no baú não se perde quando você cai.'],
  ['Achou o cachorro caramelo com fome? Dê qualquer comida e ele vira seu companheiro: late quando tem zumbi perto e ajuda na briga.'],
  ['As receitas abrem aos poucos: algumas aparecem quando você pega um material novo, outras com os manuais escondidos no posto, na fazenda e na vila.'],
  ['Ferramentas gastam com o uso. Na bancada dá para consertar.'],
  ['Corte fundo faz sangrar: a bandagem para. Queda alta quebra a perna: faça uma tala.'],
  ['Em noite de lua de sangue a horda vem dobrada, mas quem sobrevive ganha uma caixa de suprimentos.'],
  ['Aperte {mapa} para o mapa, {lanterna} para a lanterna e {camera} para trocar entre primeira e terceira pessoa.',1],
  ['Aperte {foto} para o modo foto: a câmera fica livre, com filtros e hora do dia.',1],
  ['Aperte {pular} para pular. De frente para carro, contêiner ou mureta, você sobe.',1],
  ['Aperte {Tab} para a mochila e a fabricação e {construir} para a construção.',1],
  ['Dá para jogar com controle de Xbox ou PlayStation.'],
];
function cargaTecla(id){if(id==='Tab')return'Tab';try{return nomeTecla(teclaDe(id));}catch(_){return'';}}
/* o texto da dica com as teclas em destaque (<kbd>), montado sem innerHTML */
function cargaTexto(el,t){el.textContent='';t.split(/\{(\w+)\}/).forEach((x,i)=>{if(i%2){const k=document.createElement('kbd');k.textContent=cargaTecla(x);el.appendChild(k);}else if(x)el.appendChild(document.createTextNode(x));});}
function cargaDica(){const el=$('cg-dica'),L=CARGA_DICAS.filter(d=>!(d[1]&&touch));if(!el||!L.length)return;
  let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===CARGA.dica)i=(i+1)%L.length;CARGA.dica=i;cargaTexto(el,L[i][0]);}
/* troca a dica na hora e ela entra devagar (a animação anda sozinha mesmo com a montagem ocupando o jogo; um apagar-e-trocar com
   tempo marcado deixava a dica sumida enquanto uma etapa longa rodava) */
function cargaTrocarDica(){const el=$('cg-dica');if(!el||CARGA.pronto)return;cargaDica();el.classList.remove('entra');void el.offsetWidth;el.classList.add('entra');}
/* a barra, a porcentagem e as etapas (feitas em verde, a de agora em destaque) */
function cargaProgresso(nome,f){f=Math.max(0,Math.min(1,+f||0));const p=Math.round(f*100);
  const b=$('cg-barra');if(b)b.style.setProperty('--p',f.toFixed(4));
  const t=$('cg-pct');if(t)t.textContent=p+'%';
  const pr=$('cg-prog');if(pr)pr.setAttribute('aria-valuenow',String(p));
  const i=nome==='fim'?CARGA.etapas.length:CARGA.etapas.indexOf(nome);
  if(i>=0)document.querySelectorAll('#cg-etapas li').forEach((li,j)=>{li.classList.toggle('feita',j<i);li.classList.toggle('atual',j===i);});
  if(TESTE){window.__cargaPct=f;window.__cargaEtapa=nome;}}
function cargaPronto(){CARGA.pronto=true;cargaProgresso('fim',1);const c=$('carregando');if(c){c.textContent='Pronto';c.classList.add('pronto');}
  const s=$('cg-status');if(s&&!s.dataset.estado)s.textContent='Mundo pronto';
  if(CARGA.troca){clearInterval(CARGA.troca);CARGA.troca=null;}}
/* a atualização automática do .exe (desktop/main.js manda o estado; preload.js põe em window.vaydrPC) */
const CARGA_ESTADOS={
  procurando:()=>'Procurando atualização…',
  baixando:o=>'Baixando a versão '+(o.versao||'nova')+(o.pct!=null?' · '+o.pct+'%':''),
  pronta:o=>'Versão '+(o.versao||'nova')+' pronta · entra quando você fechar o jogo',
  'em-dia':()=>'Você está na versão mais nova',
  'sem-internet':o=>'Sem internet · jogando a versão '+(o.atual||(PC_APP&&PC_APP.versao)||''),
  erro:()=>'Não deu para procurar atualização agora'};
function cargaAtualizacao(o){const el=$('cg-status');if(!el)return;const f=o&&typeof o==='object'&&CARGA_ESTADOS[o.estado];
  el.dataset.estado=f?o.estado:'';el.textContent=f?f(o):(CARGA.pronto?'Mundo pronto':'Carregando o mundo');}
/* a versão no canto: a do aplicativo no .exe; no navegador, a mesma do menu */
{const v=$('cg-versao');if(v){if(PC_APP&&PC_APP.versao)v.textContent='Versão '+PC_APP.versao+' · PC';
  else{const m=document.querySelector('#t-menu .versao');if(m&&m.firstChild&&m.firstChild.nodeType===3)v.textContent=m.firstChild.textContent.trim();}}}
if(PC_APP){try{if(typeof PC_APP.estadoAtualizacao==='function')cargaAtualizacao(PC_APP.estadoAtualizacao());
  if(typeof PC_APP.aoEstadoAtualizacao==='function')PC_APP.aoEstadoAtualizacao(cargaAtualizacao);}catch(e){console.error('atualização na tela de carregamento',e);}}
/* a última etapa da montagem: os sons gravados já saem do texto (base64) para bytes; no primeiro clique só falta o áudio */
etapaMalha('fim','sons',0.5,()=>{try{sgravPreparar();}catch(e){console.error('sons (preparo)',e);}});
cargaDica();CARGA.troca=setInterval(cargaTrocarDica,7000);

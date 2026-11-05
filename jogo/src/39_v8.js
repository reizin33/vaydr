/* ================= versão 8: registro de salvar/carregar/novo jogo dos módulos novos =================
   cada módulo põe aqui o que guarda (salvar), como volta (carregar) e o estado do começo (novo) */
const V8={salvar:{},carregar:{},novo:{}};
function v8Salvar(){const o={};for(const k in V8.salvar){try{o[k]=V8.salvar[k]();}catch(e){console.error('salvar '+k,e);}}return o;}
function v8Carregar(s){for(const k in V8.carregar){try{V8.carregar[k](s?s[k]:undefined);}catch(e){console.error('carregar '+k,e);}}}
function v8Novo(){for(const k in V8.novo){try{V8.novo[k]();}catch(e){console.error('novo '+k,e);}}}
/* ---------- ganchos dos sistemas novos (prompt mestre) ----------
   PASSOS: funções chamadas a cada passo de simulação (dt) · HUDS: a cada quadro do HUD
   INTERS: procuram alvos de interação (recebem tryIt) · INTER_K: texto e ação de cada tipo de alvo
   DESENHO: listas de funções de desenho por fase (opaco, sombra, alfa, aditivo, agua) */
const PASSOS=[],HUDS=[],INTERS=[],INTER_K={},DESENHO={opaco:[],sombra:[],alfa:[],aditivo:[],agua:[]};
function passosNovos(dt){for(const f of PASSOS){try{f(dt);}catch(e){console.error('passo',f.name,e);}}}
function desenhoFase(fase,a,b){for(const f of DESENHO[fase]){try{f(a,b);}catch(e){console.error('desenho '+fase,f.name,e);}}}
/* UTIL_ACOES: ação dos itens utilitários (mochila) por id · USO_EXTRA: efeitos a mais ao comer/beber/usar um item */
const UTIL_ACOES={},USO_EXTRA=[];
/* ícones novos: cada módulo registra os seus (traço 24×24, no mesmo estilo dos outros) e eles entram no sprite da página */
function iconesNovos(lista){const sp=document.querySelector('svg symbol');if(!sp)return;const pai=sp.parentNode,NS='http://www.w3.org/2000/svg';
  for(const id in lista){if(document.getElementById(id))continue;const s=document.createElementNS(NS,'symbol');s.setAttribute('id',id);s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');
    s.setAttribute('stroke-width','1.8');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.innerHTML=lista[id];pai.appendChild(s);}}
/* SONS: sons novos por nome (recebem as ferramentas do sfx: noise, tone, voz, eco...) · INIT_MALHAS: montam malhas depois das do jogo */
const SONS={},INIT_MALHAS=[];
/* MAPA_DESENHOS: desenham no minimapa (g, X(x), Y(z), escala, noite) */
const MAPA_DESENHOS=[];
/* TELAS_NOVAS: telas (div.tela) dos módulos novos, somadas à lista de telas da interface */
const TELAS_NOVAS=[];
/* LOOT_DEPOIS: saque que um módulo quer pôr numa tabela que só é criada por um módulo que carrega depois dele (ex.: a caixa
   militar, criada pela história). Entra quando todos os módulos já carregaram (70_main chama lootDepois). Tabela que não
   existir nem assim aparece no console, em vez de sumir calada (foi assim que as peças de rotor sumiram na V8). */
const LOOT_DEPOIS=[];
function lootMais(tab,chave,entrada){LOOT_DEPOIS.push([tab,chave,entrada]);}
function lootDepois(){for(const[tab,chave,e]of LOOT_DEPOIS){const T=tab==='CID'?CID_LOOT:tab==='CAIXA'?CAIXA_LOOT:LOOT;
    if(T&&T[chave])T[chave].push(e);else console.error('saque: a tabela '+tab+'.'+chave+' não existe ('+e[0]+')');}
  LOOT_DEPOIS.length=0;}
/* AMANHECE: rodam a cada manhã nova (não na primeira) · GOLPE_ALVOS: alvos extras do golpe corpo a corpo (devolvem true se acertaram) */
const AMANHECE=[],GOLPE_ALVOS=[];

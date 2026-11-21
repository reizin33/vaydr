/* consulta do servidor de exportação: o catálogo de construções do jogo antigo (OBRAS, as categorias e a ordem) e a tabela
   da fogueira (COZINHA). O resultado vira dados/jogo/antigo_obras.json. */
(function(){const O={};for(const k in OBRAS){const o=OBRAS[k];const c={};for(const f in o){const v=o[f];if(typeof v==='function')continue;try{JSON.stringify(v);c[f]=v;}catch(e){}}O[k]=c;}
 return JSON.stringify({OBRAS:O,OBRA_CATS:OBRA_CATS,OBRA_ORDEM:OBRA_ORDEM,COZINHA:typeof COZINHA!=='undefined'?COZINHA:null});})()

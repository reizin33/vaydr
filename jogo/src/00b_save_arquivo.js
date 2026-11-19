/* ================= cópia automática em arquivo: recuperar ao abrir (v10.4.3, 19/11/2026) =================
   Só no .exe (window.vaydrPC, desktop/preload.js + desktop/saves.js). Cada salvamento também vai para um arquivo no computador
   (Documentos\VAYDR\Jogos salvos; a parte de gravar está em 63c_save_arquivo.js). Este arquivo roda antes de tudo que lê os
   saves (os perfis de 62q leem logo ao carregar): se o armazenamento da página está vazio (nem a lista de perfis nem o primeiro
   mundo existem) e a pasta tem cópias, tudo volta da pasta (perfis, mundos, ajustes, conquistas e recordes). Acontece quando
   o Windows foi reinstalado, a pasta de dados do jogo foi apagada ou o jogo foi instalado em outro computador e a pasta foi
   copiada para lá. O menu avisa (63c). */
const SAVE_PC=(()=>{try{return window.vaydrPC&&typeof vaydrPC.saveLista==='function'&&typeof vaydrPC.saveGravar==='function'?vaydrPC:null;}catch(_){return null;}})();
let saveRecuperados=0;
if(SAVE_PC){try{const tem=k=>{try{return!!localStorage.getItem(k);}catch(_){return true;}};
  if(!tem('vaydr_perfis_v1')&&!tem('nnc_jogo_v1')){
    for(const it of SAVE_PC.saveLista()){if(!it||typeof it.chave!=='string'||tem(it.chave))continue;const t=SAVE_PC.saveLer(it.chave);if(typeof t!=='string'||!t)continue;
      try{JSON.parse(t);localStorage.setItem(it.chave,t);saveRecuperados++;}catch(e){console.warn('cópia em arquivo: não deu para recuperar '+it.chave,e);}}
    if(saveRecuperados)console.log('cópia em arquivo: '+saveRecuperados+' recuperados da pasta');}}
  catch(e){console.warn('cópia em arquivo: recuperar',e);}}

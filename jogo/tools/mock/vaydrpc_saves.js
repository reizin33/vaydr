/* window.vaydrPC de mentira para testar fora do .exe a cópia automática em arquivo (v10.4.3): a "pasta" fica no sessionStorage,
   que sobrevive ao recarregar a página (como a pasta do computador sobrevive). Uso: INIT=tools/mock/vaydrpc_saves.js python3 tools/sessao.py ... */
(()=>{const K='__pasta_saves__';const ler=()=>{try{return JSON.parse(sessionStorage.getItem(K)||'{}');}catch(_){return{};}};
  const gravar=d=>{try{sessionStorage.setItem(K,JSON.stringify(d));}catch(_){}};
  window.__pcLog=[];const L=(...a)=>window.__pcLog.push(a);
  window.vaydrPC={versao:'teste',aoAtualizar(){},estadoAtualizacao(){return null;},aoEstadoAtualizacao(){},reiniciarParaAtualizar(){},sair(){L('sair');},
    telaCheia(){},estaTelaCheia(){return false;},lanHospedar(){return Promise.resolve({ok:true,porta:47811,ips:[{ip:'192.168.0.50'}]});},lanParar(){return Promise.resolve(true);},
    /* LAN v10.4.3: o teste escolhe a resposta em window.__lanTeste ({codigo} ou ok) e o Firewall em window.__fw ({existe,liberar}) */
    lanTestar(ip,porta){L('lanTestar',ip,porta);const r=window.__lanTeste||{ok:true};return Promise.resolve(r.ok?{ok:true}:{ok:false,codigo:r.codigo});},
    lanFirewall(){L('lanFirewall');const f=window.__fw||{existe:true};return Promise.resolve({ok:!!f.existe,windows:true});},
    lanLiberar(){L('lanLiberar');const f=window.__fw||{};if(f.liberar)f.existe=true;return new Promise(r=>setTimeout(()=>r({ok:!!f.liberar,windows:true,cancelado:!f.liberar}),300));},
    saveGravar(k,t,esperar){const d=ler();if(d[k])d[k+'.anterior']=d[k];d[k]=String(t);gravar(d);L('gravar',k,String(t).length,!!esperar);return true;},
    saveLista(){const d=ler();return Object.keys(d).filter(k=>!k.endsWith('.anterior')&&!k.startsWith('Apagados/')).map(k=>({chave:k,bytes:d[k].length,quando:Date.now()}));},
    saveLer(k){const d=ler();return d[k]||d[k+'.anterior']||null;},
    saveApagar(k){const d=ler();if(d[k]){d['Apagados/'+k]=d[k];delete d[k];delete d[k+'.anterior'];gravar(d);}L('apagar',k);},
    savePasta(){return 'C:\\Users\\Teste\\Documents\\VAYDR\\Jogos salvos';},saveAbrirPasta(){L('abrir');}};})();

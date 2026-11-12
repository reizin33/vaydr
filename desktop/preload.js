'use strict';
/* Ponte entre o aplicativo e a página do jogo: o jogo vê window.vaydrPC (jogo/src/62p_pc.js) e nada mais do computador. */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('vaydrPC', {
  versao: ipcRenderer.sendSync('vaydr:versao'),
  aoAtualizar: (cb) => { ipcRenderer.on('vaydr:atualizacao-pronta', (_e, v) => { try { cb(String(v)); } catch (_) {} }); },
  reiniciarParaAtualizar: () => ipcRenderer.send('vaydr:reiniciar-atualizar'),
  sair: () => ipcRenderer.send('vaydr:sair'),
  telaCheia: (ligar) => ipcRenderer.send('vaydr:tela-cheia', !!ligar),
  estaTelaCheia: () => ipcRenderer.sendSync('vaydr:tela-cheia?'),
});

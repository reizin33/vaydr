'use strict';
/* Ponte entre o aplicativo e a página do jogo: o jogo vê window.vaydrPC (jogo/src/62p_pc.js) e nada mais do computador. */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('vaydrPC', {
  versao: ipcRenderer.sendSync('vaydr:versao'),
  aoAtualizar: (cb) => { ipcRenderer.on('vaydr:atualizacao-pronta', (_e, v) => { try { cb(String(v)); } catch (_) {} }); },
  // o que a atualização automática está fazendo (a tela de carregamento mostra): o estado de agora e as mudanças
  estadoAtualizacao: () => { try { return ipcRenderer.sendSync('vaydr:atualizacao-estado?'); } catch (_) { return null; } },
  aoEstadoAtualizacao: (cb) => { ipcRenderer.on('vaydr:atualizacao-estado', (_e, o) => { try { cb(o && typeof o === 'object' ? Object.assign({}, o) : null); } catch (_) {} }); },
  reiniciarParaAtualizar: () => ipcRenderer.send('vaydr:reiniciar-atualizar'),
  sair: () => ipcRenderer.send('vaydr:sair'),
  telaCheia: (ligar) => ipcRenderer.send('vaydr:tela-cheia', !!ligar),
  estaTelaCheia: () => ipcRenderer.sendSync('vaydr:tela-cheia?'),
  // partida em rede local (LAN): abre o servidor neste PC e devolve a porta e os IPs para os amigos
  lanHospedar: (porta) => ipcRenderer.invoke('vaydr:lan-hospedar', porta),
  lanParar: () => ipcRenderer.invoke('vaydr:lan-parar'),
  // v10.4.3: testar se o computador de quem abriu responde (com o motivo) e o Firewall do Windows de quem abre
  lanTestar: (ip, porta) => ipcRenderer.invoke('vaydr:lan-testar', String(ip), +porta),
  lanFirewall: () => ipcRenderer.invoke('vaydr:lan-firewall?'),
  lanLiberar: () => ipcRenderer.invoke('vaydr:lan-liberar'),
  // cópia automática dos jogos salvos em arquivo (v10.4.3, saves.js): gravar (sem esperar, ou esperando ao fechar), listar, ler, apagar
  saveGravar: (chave, texto, esperar) => { try { if (esperar) return ipcRenderer.sendSync('vaydr:save-gravar', String(chave), String(texto)); ipcRenderer.send('vaydr:save-gravar', String(chave), String(texto)); return true; } catch (_) { return false; } },
  saveLista: () => { try { const r = ipcRenderer.sendSync('vaydr:save-lista'); return Array.isArray(r) ? r : []; } catch (_) { return []; } },
  saveLer: (chave) => { try { const r = ipcRenderer.sendSync('vaydr:save-ler', String(chave)); return typeof r === 'string' ? r : null; } catch (_) { return null; } },
  saveApagar: (chave) => { try { ipcRenderer.send('vaydr:save-apagar', String(chave)); } catch (_) {} },
  savePasta: () => { try { return String(ipcRenderer.sendSync('vaydr:save-pasta?') || ''); } catch (_) { return ''; } },
  saveAbrirPasta: () => { try { ipcRenderer.send('vaydr:save-abrir-pasta'); } catch (_) {} },
});

'use strict';
/* VAYDR para PC: o jogo numa janela própria (Electron).
   - abre a página do jogo (app/index.html) pelo endereço vaydr://jogo/, sempre o mesmo, para os saves ficarem no mesmo lugar
     de uma versão para a outra
   - tela cheia: F11 ou Alt+Enter alternam, e o jogo lembra a escolha
   - salva o jogo quando a janela fecha
   - atualização automática pelas versões publicadas no GitHub; desliga com "vaydr.atualizacaoAutomatica": false no
     package.json (a versão da Steam é montada assim, porque a Steam atualiza sozinha)
   - fotos do modo foto vão para Imagens\VAYDR; a cópia do save abre a janela de salvar em Documentos\VAYDR
   - testes de fumaça (usados no GitHub): --smoke=1 abre, começa um jogo, salva, baixa a cópia e fecha;
     --smoke=2 reabre, continua o jogo salvo e sai pelo botão Sair do jogo; --smoke=atualizacao procura a versão nova, baixa e instala;
     --smoke=versao só escreve a versão. Resultados na pasta da variável VAYDR_TESTE_SAIDA. */
const { app, BrowserWindow, protocol, net, shell, session, ipcMain, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const pkg = require('./package.json');

const arg = (n) => { const a = process.argv.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : ''; };
const SMOKE = arg('smoke');
const SAIDA = process.env.VAYDR_TESTE_SAIDA || '';
const DEPURAR = process.argv.includes('--depurar');
const ATUALIZA_LIGADA = !(pkg.vaydr && String(pkg.vaydr.atualizacaoAutomatica) === 'false');
const ATUALIZA = app.isPackaged && ATUALIZA_LIGADA && (!SMOKE || SMOKE === 'atualizacao');
const RAIZ = path.join(__dirname, 'app');
const ENDERECO = 'vaydr://jogo/index.html';

if (SMOKE && process.env.VAYDR_GL === 'swiftshader') {   // computador sem placa de vídeo (o Windows do GitHub)
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
}
protocol.registerSchemesAsPrivileged([{ scheme: 'vaydr', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
app.setAppUserModelId('com.vaydr.jogo');

/* ---------- registro (vaydr.log na pasta de dados do jogo; ajuda a achar problema no PC de quem joga) ---------- */
let arqLog = null;
function log(...partes) {
  const linha = new Date().toISOString() + ' ' + partes.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ') + '\n';
  try {
    if (!arqLog) { arqLog = path.join(app.getPath('userData'), 'vaydr.log'); if (fs.existsSync(arqLog) && fs.statSync(arqLog).size > 1e6) fs.renameSync(arqLog, arqLog + '.antigo'); }
    fs.appendFileSync(arqLog, linha);
  } catch (_) {}
  if (SMOKE) { try { process.stdout.write(linha); } catch (_) {} }
}
// erro inesperado no aplicativo: fica no registro em vez de abrir uma caixa de erro (no teste, encerra com código 4)
process.on('uncaughtException', (e) => { log('erro inesperado', String((e && e.stack) || e)); if (SMOKE) { try { rel.excecao = String((e && e.stack) || e); escrever(); } catch (_) {} app.exit(4); } });

/* ---------- estado da janela (tela cheia, tamanho) ---------- */
const arqJanela = () => path.join(app.getPath('userData'), 'janela.json');
function lerJanela() { try { return JSON.parse(fs.readFileSync(arqJanela(), 'utf8')); } catch (_) { return {}; } }
function guardarJanela(win) {
  if (SMOKE || !win || win.isDestroyed()) return;
  try {
    const b = win.getNormalBounds();
    fs.writeFileSync(arqJanela(), JSON.stringify({ telaCheia: win.isFullScreen(), maximizada: win.isMaximized(), largura: b.width, altura: b.height }));
  } catch (_) {}
}

let win = null, podeFechar = false, codigoSaida = 0;
const testes = { eventos: [], downloads: [] };   // o que os testes de fumaça leem

/* ---------- salvar antes de fechar: o jogo expõe window.__vaydrPC.salvar() (jogo/src/62p_pc.js) ---------- */
function salvarAntes() {
  if (!win || win.isDestroyed()) return Promise.resolve('sem janela');
  const js = "(()=>{try{return window.__vaydrPC?window.__vaydrPC.salvar():'sem gancho';}catch(e){return 'erro: '+e.message;}})()";
  return Promise.race([
    win.webContents.executeJavaScript(js, true).catch((e) => 'erro: ' + e.message),
    new Promise((r) => setTimeout(() => r('tempo esgotado'), 2500)),
  ]);
}

/* ---------- atualização automática ---------- */
let atualizador = null, versaoBaixada = null;
function avisarAtualizacao() {
  if (versaoBaixada && win && !win.isDestroyed()) win.webContents.send('vaydr:atualizacao-pronta', versaoBaixada);
}
function iniciarAtualizacao() {
  if (!ATUALIZA) { log('atualização automática desligada', { empacotado: app.isPackaged, ligada: ATUALIZA_LIGADA, smoke: SMOKE }); return; }
  try { atualizador = require('electron-updater').autoUpdater; } catch (e) { log('sem electron-updater', e.message); return; }
  atualizador.autoDownload = true;
  atualizador.autoInstallOnAppQuit = true;
  atualizador.logger = { info: (m) => log('[atualização]', String(m)), warn: (m) => log('[atualização] aviso', String(m)), error: (m) => log('[atualização] erro', String(m)), debug: () => {} };
  const ev = (nome, valor) => { testes.eventos.push({ nome, valor, t: Date.now() }); if (SMOKE === 'atualizacao') fumacaAtualizacao(nome, valor); };
  atualizador.on('checking-for-update', () => ev('procurando'));
  atualizador.on('update-available', (i) => ev('tem-versao-nova', i && i.version));
  atualizador.on('update-not-available', (i) => ev('sem-versao-nova', i && i.version));
  atualizador.on('download-progress', (p) => { if (Math.round(p.percent) % 25 === 0) ev('baixando', Math.round(p.percent)); });
  atualizador.on('update-downloaded', (i) => { versaoBaixada = i.version; log('versão nova baixada', i.version); ev('baixou', i.version); avisarAtualizacao(); });
  atualizador.on('error', (e) => ev('erro', e && e.message));
  const procurar = () => atualizador.checkForUpdates().catch((e) => log('procurar atualização falhou', e && e.message));
  setTimeout(procurar, SMOKE ? 300 : 8000);
  if (!SMOKE) setInterval(procurar, 4 * 3600 * 1000);
}

/* ---------- janela ---------- */
function criarJanela() {
  const est = SMOKE ? {} : lerJanela();
  const telaCheia = !SMOKE && est.telaCheia !== false;
  win = new BrowserWindow({
    width: SMOKE ? 1280 : est.largura || 1600, height: SMOKE ? 720 : est.altura || 900, useContentSize: true,
    minWidth: 960, minHeight: 540, show: false, backgroundColor: '#070a09', title: 'VAYDR', autoHideMenuBar: true, fullscreen: telaCheia,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false,
      autoplayPolicy: 'no-user-gesture-required', spellcheck: false,
    },
  });
  if (!SMOKE && est.maximizada && !telaCheia) win.maximize();
  win.once('ready-to-show', () => { win.show(); win.focus(); if (DEPURAR) win.webContents.openDevTools({ mode: 'detach' }); });
  Promise.resolve(win.webContents.setVisualZoomLevelLimits(1, 1)).catch(() => {});

  // F11 e Alt+Enter: tela cheia
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.on('enter-full-screen', () => guardarJanela(win));
  win.on('leave-full-screen', () => guardarJanela(win));

  // links para fora abrem no navegador; a janela nunca sai do jogo
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('vaydr://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });

  win.webContents.on('console-message', (ev, nivel, msg, linha, origem) => {
    const n = ev && ev.level !== undefined ? ev.level : nivel, m = ev && ev.message !== undefined ? ev.message : msg;
    if (n === 'error' || n === 3) { log('[página] erro', m); testes.eventos.push({ nome: 'erro-pagina', valor: String(m).slice(0, 400), t: Date.now() }); }
  });
  win.webContents.on('render-process-gone', (_e, d) => { log('a página caiu', d); if (!SMOKE && d.reason !== 'clean-exit') win.reload(); });
  win.webContents.on('unresponsive', () => log('a página não responde'));
  win.webContents.on('did-finish-load', () => { avisarAtualizacao(); if (SMOKE === '1' || SMOKE === '2') fumaca().catch((e) => falhar(e)); });

  // ao fechar: o jogo salva antes
  win.on('close', (e) => {
    guardarJanela(win);
    if (podeFechar) return;
    e.preventDefault();
    salvarAntes().then((r) => { log('salvou ao fechar:', r); if (SMOKE) { rel.salvouAoFechar = r; escrever(); } podeFechar = true; if (win && !win.isDestroyed()) win.close(); });
  });
  win.on('closed', () => { win = null; });
  win.loadURL(ENDERECO + (SMOKE ? '#teste' : ''));
}

/* ---------- downloads: fotos e cópias do save ---------- */
function prepararDownloads() {
  session.defaultSession.on('will-download', (_e, item) => {
    const nome = item.getFilename();
    if (SMOKE && SAIDA) item.setSavePath(path.join(SAIDA, nome));
    else if (/^vaydr-foto-/.test(nome)) {
      const pasta = path.join(app.getPath('pictures'), 'VAYDR'); fs.mkdirSync(pasta, { recursive: true });
      item.setSavePath(path.join(pasta, nome));
    } else {
      const pasta = path.join(app.getPath('documents'), 'VAYDR'); fs.mkdirSync(pasta, { recursive: true });
      item.setSaveDialogOptions({ title: 'Salvar cópia do jogo', defaultPath: path.join(pasta, nome), filters: [{ name: 'Jogo salvo do VAYDR', extensions: ['json'] }] });
    }
    item.once('done', (_ev, estado) => {
      const p = item.getSavePath(); let tam = 0; try { tam = fs.statSync(p).size; } catch (_) {}
      testes.downloads.push({ nome, estado, tam, pasta: path.dirname(p) }); log('download', nome, estado, tam);
    });
  });
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(['pointerLock', 'fullscreen', 'clipboard-sanitized-write'].includes(perm)));
}

/* ---------- conversa com a página (preload.js) ---------- */
const daPagina = (e) => { try { return new URL(e.senderFrame.url).protocol === 'vaydr:'; } catch (_) { return false; } };
ipcMain.on('vaydr:versao', (e) => { e.returnValue = app.getVersion(); });
ipcMain.on('vaydr:sair', (e) => { if (daPagina(e) && win) win.close(); });
ipcMain.on('vaydr:reiniciar-atualizar', async (e) => {
  if (!daPagina(e) || !atualizador || !versaoBaixada) return;
  log('reiniciar para atualizar:', await salvarAntes());
  podeFechar = true;
  atualizador.quitAndInstall(true, true);
});

/* ---------- testes de fumaça ---------- */
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const t0 = Date.now();
const rel = { modo: SMOKE, versao: app.getVersion(), electron: process.versions.electron, chrome: process.versions.chrome, passos: [] };
function escrever() { if (!SAIDA) return; try { fs.mkdirSync(SAIDA, { recursive: true }); rel.eventos = testes.eventos; rel.downloads = testes.downloads; fs.writeFileSync(path.join(SAIDA, 'relatorio-' + SMOKE + '.json'), JSON.stringify(rel, null, 1)); } catch (e) { log('não escreveu o relatório', e.message); } }
function passo(nome, dados) { rel.passos.push({ nome, s: Math.round((Date.now() - t0) / 1000), ...dados }); log('[teste]', nome, dados); escrever(); }
function falhar(e) { rel.ok = false; rel.excecao = String((e && e.stack) || e); escrever(); log('teste falhou', rel.excecao); app.exit(2); }
const INFO_GL = "(()=>{const c=document.createElement('canvas'),gl=c.getContext('webgl2');if(!gl)return{webgl2:false};const d=gl.getExtension('WEBGL_debug_renderer_info');"
  + "return{webgl2:true,placa:d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),falha3D:!document.getElementById('falha').hidden,"
  + "fonte:document.fonts?[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).slice(0,12):[],tela:[innerWidth,innerHeight]};})()";
const FPS = "new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;const dt=performance.now()-t0;if(dt<6000)requestAnimationFrame(f);else r(Math.round(n/(dt/1000)*10)/10);};requestAnimationFrame(f);})";
async function fumaca() {
  const js = (c) => win.webContents.executeJavaScript(c, true);
  const esperar = async (c, ms) => { const fim = Date.now() + ms; while (Date.now() < fim) { try { if (await js(c)) return true; } catch (_) {} await dormir(500); } return false; };
  const foto = async (nome) => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(SAIDA, nome + '.png'), img.toPNG()); };
  const erros = () => testes.eventos.filter((e) => e.nome === 'erro-pagina');
  rel.gpu = app.getGPUFeatureStatus();
  const menu = await esperar("!!document.getElementById('t-menu')&&!document.getElementById('t-menu').hidden&&typeof __nnc!=='undefined'", 180000);
  await dormir(2500);
  passo('menu apareceu', { ok: menu, gl: await js(INFO_GL), versaoNoMenu: await js("document.querySelector('#t-menu .versao').textContent"), botaoSair: await js("!!document.getElementById('m-sair')") });
  await foto(SMOKE === '1' ? '1-menu' : '2-menu-reaberto');
  if (SMOKE === '1') {
    await js("document.getElementById('m-novo').click()");
    await dormir(300);
    await js("try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}");
    const jogando = await esperar("__nnc.G.modo==='jogo'", 240000);
    passo('novo jogo', { ok: jogando });
    await dormir(20000);
    await foto('1-jogo');
    passo('quadros por segundo', { fps: await js(FPS) });
    const s1 = await js("(()=>{const r=__nnc.ev('salvarJogo')();const t=localStorage.getItem('nnc_jogo_v1');return{retorno:r,tem:!!t,tamanho:t?t.length:0,salvoEm:t?JSON.parse(t).salvoEm:0};})()");
    passo('salvar', s1);
    const antes = testes.downloads.length;
    await js("__nnc.ev('saveBaixar')()");
    const fim = Date.now() + 30000; while (testes.downloads.length === antes && Date.now() < fim) await dormir(300);
    const dl = testes.downloads[antes] || null;
    passo('cópia do save em arquivo', { ok: !!dl && dl.estado === 'completed' && dl.tam > 100, dl });
    await js("__nnc.P.fome=33.3");
    rel.marca = { fome: 33.3, salvoEmAntes: s1.salvoEm };
    rel.ok = menu && jogando && s1.tem && !!dl && dl.estado === 'completed' && erros().length === 0;
    codigoSaida = rel.ok ? 0 : 1;
    passo('fechando a janela como o jogador (o jogo deve salvar sozinho)', { errosNaPagina: erros().length });
    win.close();
    return;
  }
  // SMOKE === '2': reabriu depois do teste 1
  let anterior = null; try { anterior = JSON.parse(fs.readFileSync(path.join(SAIDA, 'relatorio-1.json'), 'utf8')); } catch (_) {}
  const s = await js("(()=>{const t=localStorage.getItem('nnc_jogo_v1');if(!t)return null;const s=JSON.parse(t);return{salvoEm:s.salvoEm,fome:s.P&&s.P.fome,dia:s.dia};})()");
  const continuar = await js("!document.getElementById('m-continuar').hidden");
  const salvouAoFechar = !!(s && anterior && anterior.marca && s.salvoEm > anterior.marca.salvoEmAntes && Math.abs(s.fome - anterior.marca.fome) < 1.5);
  passo('save depois de reabrir', { save: s, botaoContinuar: continuar, salvouAoFechar });
  await js("document.getElementById('m-continuar').click()");
  const jogando = await esperar("__nnc.G.modo==='jogo'", 240000);
  await dormir(15000);
  await foto('2-continuou');
  passo('continuou o jogo salvo', { ok: jogando, fome: await js('Math.round(__nnc.P.fome*10)/10'), dia: await js('__nnc.G.dia') });
  // volta ao menu e sai pelo botão "Sair do jogo", como o jogador
  await js("__nnc.ev('mostrarMenu')()");
  await dormir(1500);
  const sair = await js("!!document.getElementById('m-sair')&&!document.getElementById('t-menu').hidden");
  passo('menu com o botão Sair do jogo', { ok: sair });
  rel.ok = !!s && continuar && salvouAoFechar && jogando && sair && erros().length === 0;
  codigoSaida = rel.ok ? 0 : 1;
  escrever();
  setTimeout(() => { rel.ok = false; rel.motivo = 'o botão Sair do jogo não fechou o jogo'; escrever(); app.exit(5); }, 15000);
  await js("document.getElementById('m-sair').click()");
}
let atualizacaoTerminou = false;
function fumacaAtualizacao(nome, valor) {
  passo('atualização: ' + nome, { valor });
  if (atualizacaoTerminou) return;
  if (nome === 'baixou') {
    atualizacaoTerminou = true; rel.ok = true; rel.baixou = valor; escrever();
    setTimeout(() => { podeFechar = true; atualizador.quitAndInstall(true, false); }, 1500);   // instala em silêncio, sem abrir depois
  } else if (nome === 'erro' || nome === 'sem-versao-nova') {
    atualizacaoTerminou = true; rel.ok = false; escrever(); setTimeout(() => app.exit(1), 500);
  }
}

/* ---------- começo ---------- */
if (SMOKE === 'versao') {
  app.whenReady().then(() => { if (SAIDA) { fs.mkdirSync(SAIDA, { recursive: true }); fs.writeFileSync(path.join(SAIDA, 'versao.txt'), app.getVersion()); } app.exit(0); });
} else if (!SMOKE && !app.requestSingleInstanceLock()) {
  app.quit();   // já tem um VAYDR aberto: a outra janela vem para a frente
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle('vaydr', (req) => {
      let p = decodeURIComponent(new URL(req.url).pathname);
      if (p === '/' || p === '') p = '/index.html';
      const arq = path.normalize(path.join(RAIZ, p));
      if (!arq.startsWith(RAIZ + path.sep)) return new Response('não encontrado', { status: 404 });
      return net.fetch(pathToFileURL(arq).toString());
    });
    prepararDownloads();
    log('VAYDR', app.getVersion(), 'abrindo', { electron: process.versions.electron, smoke: SMOKE || undefined });
    if (SMOKE === 'atualizacao') {
      setTimeout(() => { if (!atualizacaoTerminou) { rel.ok = false; rel.motivo = 'tempo esgotado'; escrever(); app.exit(3); } }, 8 * 60 * 1000);
      iniciarAtualizacao();
      return;   // este teste não precisa da janela do jogo
    }
    if (SMOKE) setTimeout(() => { rel.ok = false; rel.motivo = 'tempo esgotado'; escrever(); app.exit(3); }, 12 * 60 * 1000);
    criarJanela();
    iniciarAtualizacao();
  });
  app.on('window-all-closed', () => { if (SMOKE) { escrever(); app.exit(codigoSaida); } else app.quit(); });
}

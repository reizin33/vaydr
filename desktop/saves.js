'use strict';
/* VAYDR · cópia automática dos jogos salvos em arquivo (v10.4.3, 19/11/2026)
   Cada vez que o jogo salva, o save também vai para um arquivo no computador: Documentos\VAYDR\Jogos salvos\<chave>.json
   (se o Windows não deixar gravar em Documentos, vai para a pasta de dados do jogo). A versão anterior de cada arquivo fica
   como <chave>.anterior.json. Mundo apagado no jogo: o arquivo vai para a subpasta "Apagados" (não some de vez).
   Se o armazenamento da página sumir (Windows reinstalado, pasta de dados apagada, jogo instalado em outro computador com a
   pasta copiada), o jogo recupera tudo desta pasta ao abrir (jogo/src/00b_save_arquivo.js).
   Tudo aqui é síncrono de propósito: a gravação feita ao fechar a janela termina antes de a janela fechar. */
const fs = require('node:fs');
const path = require('node:path');

const CHAVE_OK = /^[A-Za-z0-9_-]{1,80}$/;
const MAX = 64 * 1024 * 1024;
const esperar = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (_) {} };

function criarSaves(pastas, log) {
  let pasta = null;
  function garantir() {
    if (pasta) return pasta;
    for (const p of pastas) {
      try { fs.mkdirSync(p, { recursive: true }); const t = path.join(p, '.vaydr-teste'); fs.writeFileSync(t, 'ok'); fs.unlinkSync(t); pasta = p; return p; }
      catch (e) { if (log) log('saves: não deu para usar ' + p + ': ' + String((e && e.code) || e)); }
    }
    return null;
  }
  // antivírus ou o OneDrive segurando o arquivo por um instante: tenta de novo algumas vezes
  const tentar = (f) => { let ultimo = null; for (let i = 0; i < 4; i++) { try { return f(); } catch (e) { ultimo = e; esperar(80 * (i + 1)); } } throw ultimo; };
  function gravar(chave, texto) {
    if (!CHAVE_OK.test(chave) || typeof texto !== 'string' || !texto || texto.length > MAX) return false;
    const dir = garantir(); if (!dir) return false;
    const arq = path.join(dir, chave + '.json'), tmp = arq + '.tmp', ant = path.join(dir, chave + '.anterior.json');
    try {
      fs.writeFileSync(tmp, texto, 'utf8');
      if (fs.existsSync(arq)) { try { tentar(() => fs.copyFileSync(arq, ant)); } catch (_) {} }
      tentar(() => fs.renameSync(tmp, arq));
      return true;
    } catch (e) {
      if (log) log('saves: falhou ao gravar ' + chave + ': ' + String((e && e.code) || e));
      try { fs.unlinkSync(tmp); } catch (_) {}
      return false;
    }
  }
  function listar() {
    const dir = garantir(); if (!dir) return [];
    let nomes = []; try { nomes = fs.readdirSync(dir); } catch (_) { return []; }
    const R = [];
    for (const n of nomes) {
      if (!n.endsWith('.json') || n.endsWith('.anterior.json')) continue;
      const chave = n.slice(0, -5); if (!CHAVE_OK.test(chave)) continue;
      try { const st = fs.statSync(path.join(dir, n)); if (st.isFile()) R.push({ chave, bytes: st.size, quando: st.mtimeMs }); } catch (_) {}
    }
    return R;
  }
  // o arquivo da chave (ou o anterior, se o principal não abrir)
  function ler(chave) {
    if (!CHAVE_OK.test(chave)) return null; const dir = garantir(); if (!dir) return null;
    for (const n of [chave + '.json', chave + '.anterior.json']) { try { const t = fs.readFileSync(path.join(dir, n), 'utf8'); JSON.parse(t); return t; } catch (_) {} }
    return null;
  }
  function apagar(chave) {
    if (!CHAVE_OK.test(chave)) return false; const dir = garantir(); if (!dir) return false;
    const arq = path.join(dir, chave + '.json'); if (!fs.existsSync(arq)) return false;
    try {
      const lix = path.join(dir, 'Apagados'); fs.mkdirSync(lix, { recursive: true });
      const quando = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      tentar(() => fs.renameSync(arq, path.join(lix, chave + '-' + quando + '.json')));
      try { fs.unlinkSync(path.join(dir, chave + '.anterior.json')); } catch (_) {}
      return true;
    } catch (e) { if (log) log('saves: falhou ao apagar ' + chave + ': ' + String((e && e.code) || e)); return false; }
  }
  return { gravar, listar, ler, apagar, pasta: garantir };
}

module.exports = { criarSaves };

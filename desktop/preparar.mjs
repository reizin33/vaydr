// Prepara a página do jogo para o aplicativo: pega jogo/test.html (o jogo inteiro numa página só) e põe as fontes
// dentro dela, para o jogo ter a letra certa sem internet. Roda no GitHub, que tem internet, antes de montar o .exe.
// Saída: desktop/app/index.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORIGEM = path.join(AQUI, '..', 'jogo', 'test.html');
const DESTINO = path.join(AQUI, 'app', 'index.html');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const SUBCONJUNTOS = new Set(['latin', 'latin-ext']);   // português só precisa destes

let html = fs.readFileSync(ORIGEM, 'utf8');
const link = html.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)">/);
if (!link) throw new Error('não achei o link das fontes do Google na página');
const r = await fetch(link[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } });
if (!r.ok) throw new Error('o Google Fonts respondeu ' + r.status);
const css = await r.text();

// cada bloco vem como: /* latin */ @font-face { font-family: '...'; font-style: ...; font-weight: ...; src: url(...) format('woff2'); unicode-range: ...; }
const grupos = new Map();
for (const [, sub, corpo] of css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*{([^}]+)}/g)) {
  if (!SUBCONJUNTOS.has(sub)) continue;
  const prop = (n) => { const m = corpo.match(new RegExp(n + ':\\s*([^;]+);')); return m ? m[1].trim() : ''; };
  const url = (corpo.match(/url\((https:[^)]+)\)/) || [])[1];
  if (!url) throw new Error('bloco de fonte sem endereço: ' + corpo.slice(0, 120));
  const chave = [prop('font-family'), prop('font-style'), url, prop('unicode-range')].join('|');
  const g = grupos.get(chave) || { familia: prop('font-family'), estilo: prop('font-style'), url, faixa: prop('unicode-range'), pesos: [] };
  g.pesos.push(...prop('font-weight').split(/\s+/).map(Number));
  grupos.set(chave, g);
}
if (grupos.size < 5) throw new Error('poucas fontes no CSS do Google: ' + grupos.size);

let saida = '', total = 0;
for (const g of grupos.values()) {
  const f = await fetch(g.url);
  if (!f.ok) throw new Error('não baixou ' + g.url + ' (' + f.status + ')');
  const buf = Buffer.from(await f.arrayBuffer());
  total += buf.length;
  const pmin = Math.min(...g.pesos), pmax = Math.max(...g.pesos);
  saida += `@font-face{font-family:${g.familia};font-style:${g.estilo};font-weight:${pmin === pmax ? pmin : pmin + ' ' + pmax};font-display:swap;`
    + `src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');unicode-range:${g.faixa}}\n`;
}
html = html.replace(link[0], '<style>/* fontes do jogo dentro da página, para jogar sem internet */\n' + saida + '</style>');
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) throw new Error('ainda sobrou endereço do Google Fonts na página');
fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
fs.writeFileSync(DESTINO, html);
// as mesmas fontes num arquivo à parte: o teste do .exe manda junto com as fotos, e as fotos e vídeos feitos fora do Windows
// (jogo/build.py com FONTES=...) ficam com a letra igual à do jogo
fs.writeFileSync(path.join(path.dirname(DESTINO), 'fontes.css'), saida);
console.log(`ok: ${grupos.size} fontes (${Math.round(total / 1024)} KB) dentro de app/index.html (${(Buffer.byteLength(html) / 1e6).toFixed(1)} MB)`);

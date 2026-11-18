'use strict';
/* VAYDR · servidor da rede local (LAN), v10.4.0 (18/11/2026)
   Quem hospeda abre este servidor dentro do próprio .exe (main.js: "vaydr:lan-hospedar"). Ele só repassa mensagens entre os
   jogos: o jogo do anfitrião decide o mundo (zumbis, hora, clima) e os convidados mandam o que fazem. Não tem dependência
   nenhuma: o WebSocket (RFC 6455) é feito aqui mesmo, só com o que o Node já traz (http e crypto).
   Mensagens (texto JSON), sempre com "t" (tipo):
     oi        convidado/anfitrião → servidor: {t:'oi', nome, papel:'anfitriao'|'convidado', versao}
     bemvindo  servidor → quem chegou: {t:'bemvindo', id, anfitriao}      recusa: {t:'recusa', motivo}
     lista     servidor → todos, quando alguém entra ou sai: {t:'lista', jogadores:[{id, nome, anfitriao}]}
     o resto   o servidor carimba "de" (id de quem mandou) e entrega: com "para" só para aquele jogador; "hitZ" só para o
               anfitrião; "mundo" e "dano" só saem do anfitrião; "eu", "chat" e o resto vão para todos menos quem mandou.
   Também dá para rodar sozinho para testar: node lan.js [porta] */
const http = require('node:http');
const crypto = require('node:crypto');
const os = require('node:os');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MSG = 512 * 1024, MAX_JOGADORES = 8;

/* IPs desta máquina na rede (os que os amigos digitam): rede de casa, cabo, Radmin (26.x) */
function ipsLocais() {
  const L = [];
  for (const [nome, lista] of Object.entries(os.networkInterfaces())) for (const a of lista || []) {
    if (a.internal || (a.family !== 'IPv4' && a.family !== 4)) continue;
    L.push({ ip: a.address, nome });
  }
  // Radmin e a rede de casa primeiro; os adaptadores virtuais (VirtualBox, WSL, Hyper-V) por último
  const peso = (q) => /^26\./.test(q.ip) ? 0 : /^(192\.168|10\.)/.test(q.ip) && !/vEthernet|VirtualBox|VMware|WSL/i.test(q.nome) ? 1 : 2;
  return L.sort((a, b) => peso(a) - peso(b));
}

/* um quadro do WebSocket (servidor → jogo: sem máscara) */
function quadro(op, dados) {
  const n = dados.length;
  let cab;
  if (n < 126) { cab = Buffer.alloc(2); cab[1] = n; }
  else if (n < 65536) { cab = Buffer.alloc(4); cab[1] = 126; cab.writeUInt16BE(n, 2); }
  else { cab = Buffer.alloc(10); cab[1] = 127; cab.writeBigUInt64BE(BigInt(n), 2); }
  cab[0] = 0x80 | op;
  return Buffer.concat([cab, dados]);
}

class Conexao {
  constructor(sock, aoTexto, aoFechar) {
    this.sock = sock; this.buf = Buffer.alloc(0); this.partes = []; this.opPartes = 0; this.fechada = false;
    this.aoTexto = aoTexto; this.aoFechar = aoFechar; this.visto = Date.now();
    sock.setNoDelay(true);
    sock.on('data', (d) => this.receber(d));
    sock.on('close', () => this.fechar());
    sock.on('error', () => this.fechar());
  }
  receber(d) {
    this.visto = Date.now();
    this.buf = this.buf.length ? Buffer.concat([this.buf, d]) : d;
    for (;;) {
      const b = this.buf; if (b.length < 2) return;
      const fin = (b[0] & 0x80) !== 0, op = b[0] & 0x0f, mascara = (b[1] & 0x80) !== 0;
      let n = b[1] & 0x7f, p = 2;
      if (n === 126) { if (b.length < 4) return; n = b.readUInt16BE(2); p = 4; }
      else if (n === 127) { if (b.length < 10) return; const g = b.readBigUInt64BE(2); if (g > BigInt(MAX_MSG)) return this.fechar(1009); n = Number(g); p = 10; }
      if (n > MAX_MSG) return this.fechar(1009);
      if (!mascara) return this.fechar(1002);   // quem manda para o servidor sempre mascara
      if (b.length < p + 4 + n) return;
      const m = b.subarray(p, p + 4), dados = Buffer.from(b.subarray(p + 4, p + 4 + n));
      for (let i = 0; i < n; i++) dados[i] ^= m[i & 3];
      this.buf = b.subarray(p + 4 + n);
      if (op === 8) return this.fechar(1000);
      if (op === 9) { this.mandarBruto(quadro(10, dados)); continue; }
      if (op === 10) continue;
      if (op === 1 || op === 2) { this.partes = [dados]; this.opPartes = op; }
      else if (op === 0) { this.partes.push(dados); if (this.partes.reduce((s, q) => s + q.length, 0) > MAX_MSG) return this.fechar(1009); }
      else return this.fechar(1002);
      if (fin) { const tudo = Buffer.concat(this.partes); this.partes = []; if (this.opPartes === 1) this.aoTexto(tudo.toString('utf8')); }
    }
  }
  mandarBruto(q) { if (!this.fechada) try { this.sock.write(q); } catch (_) { this.fechar(); } }
  mandar(obj) { this.mandarBruto(quadro(1, Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj), 'utf8'))); }
  fechar(cod) {
    if (this.fechada) return; this.fechada = true;
    try { if (cod) { const c = Buffer.alloc(2); c.writeUInt16BE(cod, 0); this.sock.write(quadro(8, c)); } } catch (_) {}
    try { this.sock.end(); } catch (_) {}
    setTimeout(() => { try { this.sock.destroy(); } catch (_) {} }, 500);
    this.aoFechar();
  }
}

function criarServidorLan(opcoes) {
  const o = Object.assign({ porta: 47811, log: () => {} }, opcoes || {});
  const jogadores = new Map();   // id → {id, nome, anfitriao, versao, con}
  let proximo = 1, anfitriaoId = 0;
  const lista = () => [...jogadores.values()].filter((j) => j.nome).map((j) => ({ id: j.id, nome: j.nome, anfitriao: j.id === anfitriaoId }));
  const paraTodos = (msg, exceto) => { const s = typeof msg === 'string' ? msg : JSON.stringify(msg); for (const j of jogadores.values()) if (j.nome && j.id !== exceto) j.con.mandar(s); };

  function aoTexto(j, txt) {
    let m; try { m = JSON.parse(txt); } catch (_) { return; }
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
    if (!j.nome) {   // primeira mensagem: o "oi"
      if (m.t !== 'oi') return j.con.fechar(1008);
      const nome = String(m.nome || 'Jogador').replace(/[<>]/g, '').slice(0, 20) || 'Jogador', papel = m.papel === 'anfitriao' ? 'anfitriao' : 'convidado';
      const anf = anfitriaoId && jogadores.get(anfitriaoId);
      if (papel === 'anfitriao' && anf) { j.con.mandar({ t: 'recusa', motivo: 'Já tem um anfitrião nesta partida.' }); return j.con.fechar(1000); }
      if (papel === 'convidado' && !anf) { j.con.mandar({ t: 'recusa', motivo: 'O anfitrião ainda não entrou na partida.' }); return j.con.fechar(1000); }
      if (papel === 'convidado' && anf.versao && m.versao && String(m.versao) !== anf.versao) {
        j.con.mandar({ t: 'recusa', motivo: 'Versões diferentes: o anfitrião está na ' + anf.versao + ' e você na ' + m.versao + '. Atualizem os dois.' }); return j.con.fechar(1000); }
      if (lista().length >= MAX_JOGADORES) { j.con.mandar({ t: 'recusa', motivo: 'A partida está cheia (' + MAX_JOGADORES + ' jogadores).' }); return j.con.fechar(1000); }
      j.nome = nome; j.versao = m.versao ? String(m.versao) : '';
      if (papel === 'anfitriao') anfitriaoId = j.id;
      j.con.mandar({ t: 'bemvindo', id: j.id, anfitriao: papel === 'anfitriao', anfitriaoId });
      o.log('lan: entrou', j.id, nome, papel);
      paraTodos({ t: 'lista', jogadores: lista() });
      return;
    }
    m.de = j.id;
    if (m.t === 'oi') return;
    if ((m.t === 'mundo' || m.t === 'dano' || m.t === 'zevento') && j.id !== anfitriaoId) return;   // só o jogo do anfitrião decide o mundo
    if (m.para !== undefined) { const d = jogadores.get(+m.para); if (d && d.nome) d.con.mandar(m); return; }
    if (m.t === 'hitZ') { const a = jogadores.get(anfitriaoId); if (a && j.id !== anfitriaoId) a.con.mandar(m); return; }
    paraTodos(m, j.id);
  }

  const srv = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); res.end('VAYDR: partida em rede local (' + lista().length + ' jogando)'); });
  srv.on('upgrade', (req, sock) => {
    const chave = req.headers['sec-websocket-key'];
    if (!chave || String(req.headers.upgrade || '').toLowerCase() !== 'websocket') { sock.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
    const aceite = crypto.createHash('sha1').update(chave + GUID).digest('base64');
    sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + aceite + '\r\n\r\n');
    const j = { id: proximo++, nome: '', versao: '' };
    j.con = new Conexao(sock, (t) => aoTexto(j, t), () => {
      if (!jogadores.has(j.id)) return; jogadores.delete(j.id);
      if (j.nome) { o.log('lan: saiu', j.id, j.nome); paraTodos({ t: 'saiu', id: j.id, nome: j.nome, anfitriao: j.id === anfitriaoId }); paraTodos({ t: 'lista', jogadores: lista() }); }
      if (j.id === anfitriaoId) anfitriaoId = 0;
    });
    jogadores.set(j.id, j);
  });
  // quem some sem fechar (cabo, Wi-Fi) sai depois de 90 s sem mandar nada (o jogo manda 10 vezes por segundo; a montagem do mundo,
  // ao carregar, pode segurar a página alguns segundos sem mandar)
  const vigia = setInterval(() => { const t = Date.now(); for (const j of [...jogadores.values()]) if (t - j.con.visto > 90000) j.con.fechar(1001); }, 5000);

  return new Promise((resolve, reject) => {
    srv.once('error', (e) => { clearInterval(vigia); reject(e); });
    srv.listen(o.porta, '0.0.0.0', () => {
      o.log('lan: servidor na porta', o.porta);
      resolve({
        porta: o.porta, ips: ipsLocais, jogadores: lista,
        parar: () => new Promise((r) => { clearInterval(vigia); for (const j of jogadores.values()) j.con.fechar(1001); srv.close(() => r()); setTimeout(r, 1500); }),
      });
    });
  });
}

module.exports = { criarServidorLan, ipsLocais };

if (require.main === module) {
  const porta = +process.argv[2] || 47811;
  criarServidorLan({ porta, log: (...a) => console.log(new Date().toISOString(), ...a) })
    .then((s) => console.log('VAYDR LAN pronto na porta', s.porta, s.ips().map((q) => q.ip).join(', ')))
    .catch((e) => { console.error('não abriu:', e.message); process.exit(1); });
}

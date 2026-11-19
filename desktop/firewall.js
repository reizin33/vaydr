'use strict';
/* VAYDR · Firewall do Windows e teste de conexão da partida em rede (v10.4.3, 19/11/2026)
   O problema que apareceu no primeiro teste com os amigos: quem entra fica em "Conectando…" e depois "não achei a partida".
   O mais comum: o Firewall do Windows de quem abriu a partida joga fora as conexões de fora. Quando o VAYDR abre a porta, o
   Windows pergunta uma vez; se a pessoa clicou em Cancelar, ou liberou só "redes privadas" e a rede está como pública (o
   padrão do Windows 11, e a rede do Radmin VPN também), o Windows cria regras de bloqueio e ninguém entra.
   · regraExiste(): a regra "VAYDR (partida em rede)" já está lá? (ler não precisa de administrador)
   · liberar(): apaga as regras do Windows para o VAYDR.exe (inclusive as de bloqueio, que ganham das de liberação) e cria uma
     que libera a entrada TCP em todos os tipos de rede. Precisa de administrador: o Windows mostra o aviso "Deseja permitir...?"
     e a pessoa clica em Sim. Sem Windows (testes no Linux) não faz nada.
   · testar(ip, porta): antes de abrir a conexão do jogo, vê se o computador de quem abriu responde. Dá o motivo certo:
     ECONNREFUSED (o computador respondeu, mas a partida não está aberta), ETIMEDOUT (nada respondeu: Firewall, IP errado ou
     rede diferente), EHOSTUNREACH/ENETUNREACH (esse IP não está na sua rede). */
const net = require('node:net');
const { execFile } = require('node:child_process');

const REGRA = 'VAYDR (partida em rede)';
const ehWindows = process.platform === 'win32';

function rodar(exe, args, ms, literal) {
  return new Promise((res) => {
    execFile(exe, args, { windowsHide: true, timeout: ms || 20000, encoding: 'utf8', windowsVerbatimArguments: !!literal },
      (err, out, errOut) => res({ ok: !err, codigo: err ? (err.code ?? 1) : 0, saida: String(out || '') + String(errOut || '') }));
  });
}

async function regraExiste() {
  if (!ehWindows) return { ok: true, windows: false };
  const r = await rodar('netsh', ['advfirewall', 'firewall', 'show', 'rule', 'name=' + REGRA], 15000);
  return { ok: r.ok && r.saida.includes(REGRA), windows: true };
}

// os comandos do netsh (num cmd só): apaga as regras do programa e cria a de liberação
function comandos(exe) {
  const p = String(exe).replace(/"/g, '');
  return 'netsh advfirewall firewall delete rule name=all program="' + p + '" & '
    + 'netsh advfirewall firewall add rule name="' + REGRA + '" dir=in action=allow program="' + p + '" enable=yes profile=any protocol=TCP';
}

// com o aviso do Windows (administrador); semAviso: roda direto (o teste do GitHub já roda como administrador)
async function liberar(exe, semAviso) {
  if (!ehWindows) return { ok: true, windows: false };
  const cmd = comandos(exe || process.execPath);
  let r;
  // cmd /s /c "...": o cmd tira as aspas de fora e roda a linha como está (os caminhos com espaço ficam entre aspas lá dentro)
  if (semAviso) r = await rodar('cmd.exe', ['/d /s /c "' + cmd + '"'], 30000, true);
  else {
    // o PowerShell pede o administrador (o aviso do Windows); o script vai em base64 para nenhuma aspa do caminho atrapalhar
    const ps = "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d /s /c \"" + cmd.replace(/'/g, "''") + "\"' -Verb RunAs -Wait -WindowStyle Hidden -PassThru; exit $p.ExitCode";
    r = await rodar('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], 120000);
  }
  const t = await regraExiste();
  return { ok: t.ok, windows: true, cancelado: !t.ok && !r.ok, codigo: r.codigo, saida: r.saida.slice(-400) };
}

async function apagarRegra() {
  if (!ehWindows) return { ok: true, windows: false };
  const r = await rodar('netsh', ['advfirewall', 'firewall', 'delete', 'rule', 'name=' + REGRA], 15000);
  return { ok: r.ok, saida: r.saida.slice(-300) };
}

function testar(ip, porta, ms) {
  return new Promise((res) => {
    const host = String(ip || '').trim(), p = +porta;
    if (!/^[\w.-]{1,253}$/.test(host) || !(p >= 1 && p <= 65535)) return res({ ok: false, codigo: 'ENDERECO' });
    let fim = false;
    const s = net.connect({ host, port: p });
    const acaba = (r) => { if (fim) return; fim = true; try { s.destroy(); } catch (_) {} res(r); };
    s.setTimeout(ms || 6000, () => acaba({ ok: false, codigo: 'ETIMEDOUT' }));
    s.on('connect', () => acaba({ ok: true }));
    s.on('error', (e) => acaba({ ok: false, codigo: (e && e.code) || String(e) }));
  });
}

module.exports = { regraExiste, liberar, apagarRegra, testar, comandos, REGRA };

"""Monta o banco de sons gravados do jogo (src/45b_sons_dados.js) a partir de pacotes de licença CC0 (domínio público).
Fonte: github.com/lavenderdotpet/CC0-Public-Domain-Sounds (coleção CC0), que reúne:
  · Kenney (kenney.nl) — Impact Sounds e RPG Audio, CC0
  · rubberduck (opengameart.org) — 100 CC0 SFX, 100 CC0 SFX 2, 100 CC0 wood/metal SFX, 75 CC0 breaking/falling/hit,
    80 CC0 creature SFX (1 e 2), 80 CC0 RPG SFX, 25 CC0 bang SFX — CC0
  · Ben Burnes — Micro Pack "Organic Wooshes", CC0
  · Team Forbidden (Warfork) — armas e vozes do jogador da pasta cc0, CC0
  · pastas "beast_or_animal" e "angerdog" da mesma coleção CC0
Cada arquivo: mono 44,1 kHz, corta o silêncio do começo e do fim, entrada e saída suaves (sem estalo), mesmo volume
entre as variações de um som e MP3 de 80 kbps (toca em PC, Android e iPhone).
Para baixar só o que é usado:
  git clone --depth 1 --filter=blob:none --no-checkout https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds cc0
  cd cc0 && git sparse-checkout init --cone && git sparse-checkout set <as pastas usadas abaixo> && git reset --hard HEAD
Uso: python3 tools/sons_banco.py <pasta da coleção>   →   escreve src/45b_sons_dados.js"""
import os, sys, subprocess, base64, math
import numpy as np
from scipy.signal import lfilter
RAIZ = sys.argv[1] if len(sys.argv) > 1 else '.'
SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '45b_sons_dados.js')
SR = 44100
K = 'kenney_impactsounds/Audio/'; RPG = 'kenney_rpgaudio/Audio/'; WM = '100-CC0-wood-metal-SFX/'; BF = '75-cc0-breaking-falling-hit-sfx/'
C1 = '80-CC0-creature-SFX/'; C2 = '80-CC0-creature-sfx-2/'; CR = '80-CC0-RPG-SFX/'; WF = 'warfork-cc0/sounds/'; BG = '25-CC0-bang-sfx/'
BANCO = {
    'passo_grama': [K + 'footstep_grass_00%d.ogg' % i for i in range(5)],
    'passo_asf': [K + 'footstep_concrete_00%d.ogg' % i for i in range(5)],
    'passo_agua': ['100-cc0-sfx-2/sfx100v2_footstep_wet_0%d.ogg' % i for i in (1, 2, 3)],
    'golpe': ['Micro Pack - Organic Wooshes/Swish %d.wav' % i for i in (1, 2, 4, 6)] + ['Micro Pack - Organic Wooshes/Classic Swish %d.wav' % i for i in (1, 2)],
    'acerto': [K + 'impactPunch_heavy_00%d.ogg' % i for i in range(5)] + [WF + 'weapons/blade_hitflsh%d.ogg' % i for i in (1, 2, 3)],
    'madeira': [RPG + 'chop.ogg'] + [K + 'impactWood_heavy_00%d.ogg' % i for i in range(5)],
    'pedra': [K + 'impactMining_00%d.ogg' % i for i in range(5)],
    'quebrar': [WM + 'wood_breaking_0%d.ogg' % i for i in (1, 2)] + [BF + 'bfh1_wood_breaking_0%d.ogg' % i for i in (1, 2, 3)],
    'vidro': [BF + 'bfh1_glass_breaking_0%d.ogg' % i for i in range(1, 7)],
    'construir': [WM + 'hammer_0%d.ogg' % i for i in range(1, 5)] + [WM + 'wood_hammer_0%d.ogg' % i for i in (1, 2)],
    'galho': [WM + 'wood_cracking_0%d.ogg' % i for i in range(1, 5)],
    'gemido': ['beast_or_animal/Growl 1.wav', 'beast_or_animal/Growl 2.wav', 'beast_or_animal/Growl.wav', 'beast_or_animal/Voice 3.wav',
               'beast_or_animal/Voice.wav', C1 + 'monster_04.ogg', C1 + 'monster_07.ogg'],
    'ataqueZ': [C1 + 'grunt_02.ogg', C2 + 'grunt_07.ogg', C2 + 'grunt_08.ogg', 'beast_or_animal/Voice 1.wav', 'beast_or_animal/Voice 2.wav'],
    'morteZ': [C2 + 'die_03.ogg', CR + 'creature_die_01.ogg', C1 + 'hurt_05.ogg', C1 + 'roar_01.ogg'],
    'rugido': [C1 + 'roar_02.ogg', C2 + 'roar_04.ogg', C2 + 'roar_05.ogg', CR + 'creature_roar_01.ogg', CR + 'creature_roar_02.ogg'],
    'dor': [WF + 'players/male/pain%d.ogg' % i for i in (25, 50, 75, 100)],
    'tiro': [BG + 'shot_01.ogg', BG + 'shot_03.ogg', BG + 'bang_09.ogg'],
    'espingarda': [WF + 'weapons/riotgun_fire_strong.ogg', BG + 'bang_06.ogg', BG + 'bang_01.ogg'],
    'rifle': [BG + 'bang_07.ogg', BG + 'bang_09.ogg'],
    'explosao': [WF + 'weapons/gren_strong_explosion1.ogg', WF + 'weapons/gren_strong_explosion2.ogg', WF + 'weapons/rocket_strong_explosion.ogg', BG + 'cannon_02.ogg'],
    'vazio': [WF + 'weapons/weapon_noammo.ogg'],
    'recarga': [RPG + 'metalLatch.ogg', RPG + 'metalClick.ogg'],
    'latido': ['angerdog/angerdog%d.ogg' % i for i in range(1, 7)],
    'uivo': [C1 + 'howl.ogg'],
    'tosse': [C1 + 'cough_0%d.ogg' % i for i in (1, 2, 3)],
    'trovao': ['100-cc0-sfx-2/sfx100v2_thunder_01.ogg'],
    'bau': ['100-CC0-SFX/wooded_box_open.ogg'] + [RPG + 'creak%d.ogg' % i for i in (1, 2, 3)],
    'pegar': [RPG + 'cloth%d.ogg' % i for i in range(1, 5)] + [RPG + 'handleSmallLeather.ogg', RPG + 'handleSmallLeather2.ogg'],
}
MAX_S = {'gemido': 3.2, 'explosao': 2.2, 'trovao': 4.5, 'uivo': 3.5}

def ler(f):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
    if r.returncode: raise RuntimeError(r.stderr.decode()[:200])
    return np.frombuffer(r.stdout, dtype='<f4').astype(np.float64)

def kpeso(x):
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    Kk = math.tan(math.pi * f0 / SR); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + Kk / Q + Kk * Kk
    x = lfilter([(Vh + Vb * Kk / Q + Kk * Kk) / a0, 2 * (Kk * Kk - Vh) / a0, (Vh - Vb * Kk / Q + Kk * Kk) / a0], [1, 2 * (Kk * Kk - 1) / a0, (1 - Kk / Q + Kk * Kk) / a0], x)
    f0, Q = 38.13547087602444, 0.5003270373238773; Kk = math.tan(math.pi * f0 / SR)
    return lfilter([1, -2, 1], [1, 2 * (Kk * Kk - 1) / (1 + Kk / Q + Kk * Kk), (1 - Kk / Q + Kk * Kk) / (1 + Kk / Q + Kk * Kk)], x)

def preparar(x, chave):
    pk = np.abs(x).max()
    if pk < 1e-5: raise RuntimeError('mudo')
    env = np.convolve(np.abs(x), np.ones(64) / 64, 'same'); lim = pk * 10 ** (-48 / 20)
    ii = np.where(env > lim)[0]; a = max(0, ii[0] - int(0.005 * SR)); z = min(len(x), ii[-1] + int(0.02 * SR))
    x = x[a:z][:int(MAX_S.get(chave, 2.6) * SR)].copy()
    n1 = int(0.003 * SR); n2 = min(int(0.02 * SR), len(x) // 3)
    x[:n1] *= np.linspace(0, 1, n1); x[-n2:] *= np.linspace(1, 0, n2)
    # mesmo volume entre variações: maior sonoridade em 400 ms (filtro K) em -16 LUFS, sem passar de -1 dBFS de pico
    k = kpeso(x); w = min(len(k), int(0.4 * SR)); e = np.cumsum(np.concatenate([[0], k ** 2]))
    lmax = -0.691 + 10 * np.log10(((e[w:] - e[:-w]) / w).max() + 1e-12)
    g = 10 ** ((-16 - lmax) / 20); g = min(g, 10 ** (-1 / 20) / np.abs(x).max())
    return x * g

def mp3(x):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '80k', '-f', 'mp3', '-'],
                       input=x.astype('<f4').tobytes(), capture_output=True)
    if r.returncode: raise RuntimeError(r.stderr.decode()[:200])
    return r.stdout

def main():
    linhas, total, n = [], 0, 0
    for chave, arqs in BANCO.items():
        uris = []
        for a in arqs:
            f = os.path.join(RAIZ, a)
            try: d = mp3(preparar(ler(f), chave))
            except Exception as e: print('PULEI', a, e); continue
            uris.append('"data:audio/mpeg;base64,' + base64.b64encode(d).decode() + '"'); total += len(d); n += 1
        linhas.append('  %s:[%s]' % (chave, ','.join(uris)))
        print('%-12s %d variações' % (chave, len(uris)))
    cab = ('/* ================= sons gravados (v10.1): banco de áudio =================\n'
           '   Gerado por tools/sons_banco.py. Todas as gravações são de licença CC0 (domínio público), da coleção\n'
           '   github.com/lavenderdotpet/CC0-Public-Domain-Sounds: Kenney (Impact Sounds, RPG Audio), rubberduck (pacotes CC0 do\n'
           '   OpenGameArt: SFX, madeira e metal, quebrando e batendo, criaturas, RPG e estouros), Ben Burnes (Organic Wooshes),\n'
           '   Team Forbidden (Warfork, pasta cc0) e as pastas beast_or_animal e angerdog. Não precisa de crédito, mas fica aqui. */\n')
    open(SAIDA, 'w', encoding='utf-8').write(cab + 'const SOM_DADOS={\n' + ',\n'.join(linhas) + '};\n')
    print('ok', n, 'arquivos,', total // 1024, 'KB de MP3 →', os.path.getsize(SAIDA) // 1024, 'KB no código')

main()

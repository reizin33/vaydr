"""Converte animações do Mixamo (FBX binário, sem pele) para o formato de clipe do jogo (SKCLIP de 21b_mixamo.js):
deltas D de cada um dos 22 ossos em relação à pose T de repouso do próprio arquivo, no espaço do personagem (Q = D * Qrepouso,
rotações de mundo, como o jogo usa), em Int16, e a
posição do quadril (m) relativa à de repouso, na escala do Akai (quadril a 0,9993 m), a 30 quadros por segundo.
Uso como módulo: clipe(caminho) -> dict; ou na linha de comando para ver o resumo de cada arquivo."""
import sys, os, base64, math
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fbx_ler import ler_fbx, esqueleto, valor, rot_local, duracao, qmul, qconj, qrot
OSSOS = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm',
         'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase']
PAI = [-1, 0, 1, 2, 3, 4, 3, 6, 7, 8, 3, 10, 11, 12, 0, 14, 15, 16, 0, 18, 19, 20]
QUADRIL_AKAI = 0.9993
FPS = 30

def carregar(caminho):
    M, G = esqueleto(ler_fbx(caminho)); nm = {m['nome']: m for m in M.values()}
    falta = [o for o in OSSOS if o not in nm]
    if falta: raise ValueError('faltam ossos em %s: %s' % (caminho, falta))
    esc = float(G.get('UnitScaleFactor', [1.0])[0]) / 100.0          # cm -> m
    return M, nm, esc

def repouso(nm, esc):
    """pose T do arquivo: rotações de repouso NO ESPAÇO DO PERSONAGEM (o jogo usa rotações de mundo: Q = D * Qrepouso e
    posição do filho = posição do pai + Q_pai * t) e deslocamentos locais (m, no quadro do pai)"""
    ql = np.array([rot_local(nm[o]) for o in OSSOS]); tb = np.array([valor(nm[o], 'Lcl Translation') * esc for o in OSSOS])
    return mundo(ql), tb

def mundo(ql):
    W = np.zeros((22, 4))
    for b in range(22): W[b] = ql[b] if PAI[b] < 0 else qmul(W[PAI[b]], ql[b])
    return W

def clipe(caminho, inicio=0.0, fim=None):
    M, nm, esc = carregar(caminho); qb, tb = repouso(nm, esc)
    dur = duracao(M) if fim is None else fim; dur = max(dur - inicio, 1.0 / FPS)
    n = int(round(dur * FPS)) + 1; hip0 = tb[0].copy(); k = QUADRIL_AKAI / hip0[1]
    D = np.zeros((n, 22, 4)); H = np.zeros((n, 3))
    for f in range(n):
        t = inicio + min(f / FPS, dur)
        W = mundo(np.array([rot_local(nm[o], t) for o in OSSOS]))
        for b in range(22):
            q = qmul(W[b], qconj(qb[b])); q /= np.linalg.norm(q)      # delta no espaço do personagem
            if f and np.dot(q, D[f - 1, b]) < 0: q = -q                 # continuidade (sem trocar de hemisfério entre quadros)
            D[f, b] = q
        H[f] = (valor(nm['Hips'], 'Lcl Translation', t) * esc - hip0) * k
    return {'fps': FPS, 'n': n, 'dur': round((n - 1) / FPS, 4), 'D': D, 'H': H, 'quadril_fonte': float(hip0[1]), 'qb': qb, 'tb': tb}

def para_js(c):
    d16 = np.clip(np.round(c['D'] * 32767), -32767, 32767).astype('<i2')
    return {'fps': c['fps'], 'n': c['n'], 'dur': c['dur'], 'd': base64.b64encode(d16.tobytes()).decode(),
            'h': base64.b64encode(c['H'].astype('<f4').tobytes()).decode()}

if __name__ == '__main__':
    for arq in sys.argv[1:]:
        c = clipe(arq); H = c['H']
        print('%-34s %5.2fs %4d quadros  quadril fonte %.3f m  y %+.2f..%+.2f  deriva xz %.2f m' % (os.path.basename(arq)[9:], c['dur'], c['n'], c['quadril_fonte'],
              H[:, 1].min(), H[:, 1].max(), float(np.hypot(H[-1, 0] - H[0, 0], H[-1, 2] - H[0, 2]))))

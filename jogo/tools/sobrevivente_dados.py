"""Gera src/21j_sobrevivente_dados.js: o sobrevivente (SKD.surv, de tools/sobrevivente_rig.py) e as animações novas do Mixamo
(SKCLIP), com cortes, sem deslocamento de raiz nas que andam e com a velocidade natural de cada passo (para os pés não
escorregarem: o jogo acerta a velocidade do clipe pela velocidade de verdade).
Uso: python3 tools/sobrevivente_dados.py male_survivor1.zip pasta_dos_fbx"""
import sys, os, json, base64
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mixamo_clipes as MC
import sobrevivente_rig as SR
from fbx_ler import qmul, qrot

# id no jogo: (arquivo, início s, fim s, tratamento)
CLIPES = {
    'sParado': ('Idle', 0, None, 'laco'), 'sRespira': ('Breathing_Idle', 0, None, 'laco'),
    'sAnda': ('Walking', 0, None, 'passo'), 'sAndaTras': ('Walking_Backwards', 0, None, 'passo'),
    'sLadoE': ('Left_Strafe_Walking', 0, None, 'passo'), 'sLadoD': ('Right_Strafe_Walking', 0, None, 'passo'),
    'sCorre': ('Running', 0, None, 'passo'), 'sDispara': ('Sprint', 0, None, 'passo'),
    'sAgachado': ('Crouching_Idle', 0, None, 'laco'), 'sAgachadoAnda': ('Crouched_Walking', 0, None, 'passo'),
    'sFeridoParado': ('Injured_Idle', 0, None, 'laco'), 'sFeridoAnda': ('Injured_Walk', 0, None, 'passo'),
    'sPulo': ('Jump', 0, None, 'pulo'), 'sCaindo': ('Falling_Idle', 0, None, 'laco'), 'sQueda': ('Hard_Landing', 0.13, None, 'uma'),
    'sPega': ('Picking_Up', 0.7, 4.3, 'uma'), 'sBebe': ('Drinking', 1.8, 6.2, 'uma'), 'sGolpe': ('Standing_Melee_Attack_Downward', 0, None, 'uma'),
}

def fk(c, f):
    """posições das juntas no quadro f (convenção do jogo: Q = D * Qrepouso no espaço do personagem)"""
    D = c['D'][f]; qb = c['qb']; tb = c['tb']; W = np.zeros((22, 4)); P = np.zeros((22, 3))
    for b in range(22):
        W[b] = qmul(D[b], qb[b]); p = MC.PAI[b]
        if p < 0: P[b] = tb[0] + c['H'][f] / (MC.QUADRIL_AKAI / c['quadril_fonte'])
        else: P[b] = P[p] + qrot(W[p], tb[b])
    return P

def velocidade_natural(c):
    """velocidade do chão que o passo do clipe 'pede' (m/s, escala do Akai): o pé que está no chão anda para trás na
    velocidade do corpo; média nos quadros em que um pé está bem mais baixo que o outro"""
    n = c['n']; pes = []
    for f in range(n): P = fk(c, f); pes.append((P[MC.OSSOS.index('LeftToeBase')], P[MC.OSSOS.index('RightToeBase')]))
    pes = np.array(pes); k = MC.QUADRIL_AKAI / c['quadril_fonte']; vs = []
    for f in range(1, n - 1):
        yl, yr = pes[f, 0, 1], pes[f, 1, 1]; i = 0 if yl < yr else 1
        if abs(yl - yr) < 0.02: continue
        v = (pes[f + 1, i] - pes[f - 1, i]) * MC.FPS / 2; vs.append(-v * k)
    if not vs: return [0.0, 0.0, 0.0]
    v = np.median(np.array(vs), 0); return [round(float(v[0]), 3), 0.0, round(float(v[2]), 3)]

def tratar(c, modo):
    H = c['H']
    if modo == 'passo':
        dv = H[-1] - H[0]
        if np.hypot(dv[0], dv[2]) > 0.5: c['vel_raiz'] = [round(float(dv[0] / c['dur']), 3), 0.0, round(float(dv[2] / c['dur']), 3)]   # o clipe andava: essa é a velocidade dele
    if modo in ('passo', 'laco'):
        # tira a deriva (raiz que anda): fica só o balanço; e fecha o laço (último quadro = primeiro)
        for e in (0, 2): H[:, e] -= np.linspace(H[0, e] - H[0, e], H[-1, e] - H[0, e], len(H))
    if modo == 'pulo':
        H[:, 1] = np.minimum(H[:, 1], H[0, 1])        # a física sobe o corpo; do clipe fica só o agachar antes e depois
    return c

if __name__ == '__main__':
    zipg, pasta = sys.argv[1], sys.argv[2]
    SKDs, rig = SR.montar(zipg, os.path.join(pasta, 'Idle.fbx'))
    if len(sys.argv) > 3:
        import pickle; pickle.dump(rig, open(sys.argv[3], 'wb'))
    saida = {}
    for cid, (arq, i0, i1, modo) in CLIPES.items():
        c = MC.clipe(os.path.join(pasta, arq + '.fbx'), i0, i1); c = tratar(c, modo); js = MC.para_js(c)
        if modo == 'passo': js['vel'] = c.get('vel_raiz') or velocidade_natural(c)
        saida[cid] = js; print('%-14s %-32s %5.2fs %4d quadros %s' % (cid, arq, c['dur'], c['n'], js.get('vel', '')), flush=True)
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    caminho = os.path.join(raiz, 'src', '21j_sobrevivente_dados.js')
    cab = ('/* gerado por tools/sobrevivente_dados.py (não editar à mão): o sobrevivente (male_survivor1, montado em tools/sobrevivente_rig.py)\n'
           '   e as animações do Mixamo dele (sem pele, 30 quadros/s, convertidas de FBX por tools/mixamo_clipes.py). vel = velocidade do passo. */\n')
    open(caminho, 'w', encoding='utf-8').write(cab + 'SKD.surv=' + json.dumps(SKDs, separators=(',', ':')) + ';\nObject.assign(SKCLIP,' + json.dumps(saida, separators=(',', ':')) + ');\n')
    print('ok %s (%.2f MB)' % (caminho, os.path.getsize(caminho) / 2 ** 20))

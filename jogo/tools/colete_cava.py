"""Cava do colete (v10.2.4, pedido do dono em 14/11: "roupa no personagem está bugada").
O colete é o casaco male_casualsuit05 sem as mangas. Em mh_personagem.py as mangas saíam tirando todo triângulo com algum
vértice do braço: a borda da cava ficava serrilhada e funda (o lado do casaco tem pesos do braço). Aqui o colete é refeito a
partir do casaco inteiro já pronto em src/21m_mh_dados.js (o "Casaco de pele", mesma forma e textura), sem precisar dos dados
do MakeHuman:
  · corte liso por uma superfície em volta de cada ombro: o plano perpendicular ao braço (do ombro ao cotovelo, na pose de
    ligação) um pouco para dentro do ombro, que se abre para longe do eixo do braço (o lado do tronco não é cortado);
  · triângulo atravessado pelo corte é partido na linha do corte (posição, normal, UV e pesos interpolados), então a borda é
    uma curva lisa;
  · o corpo volta a aparecer perto da cava (os triângulos do corpo que o colete antigo escondia e que agora ficam à mostra).
Uso: python3 -I tools/colete_cava.py src/21m_mh_dados.js"""
import sys, json, base64, struct
import numpy as np

RECUO = 0.03        # m: a cava começa este tanto para dentro do ombro
RAIO = 0.085        # m: até esta distância do eixo do braço o corte é o plano; depois ele se abre (não corta o tronco)
ABRE = 60.0
FOLGA_CORPO = 0.03  # m: o corpo reaparece até esta distância para dentro da cava


def campo(Pt, juntas):
    f = np.full(len(Pt), -1.0)
    for S, E in juntas:
        a = (E - S) / np.linalg.norm(E - S); C = S - a * RECUO
        d = Pt - C; s = d @ a; rad = np.linalg.norm(d - np.outer(s, a), axis=1)
        f = np.maximum(f, s - ABRE * np.maximum(0, rad - RAIO) ** 2)
    return f


def juntas_do(corpo):
    nomes = corpo['ossos']; inv = np.frombuffer(base64.b64decode(corpo['inv']), np.float32).reshape(-1, 4, 4)
    pos = {}
    for i, n in enumerate(nomes):
        Mb = np.linalg.inv(inv[i].T)          # matriz de ligação (as matrizes do jogo são por coluna)
        pos[n] = Mb[:3, 3]
    return [(pos['LeftArm'], pos['LeftForeArm']), (pos['RightArm'], pos['RightForeArm'])]


DT = np.dtype([('p', '<f4', 3), ('n', 'i1', 3), ('pad', 'u1'), ('uv', '<u2', 2), ('b', 'u1', 4), ('w', 'u1', 4)])


def recortar(peca, juntas, antebraco):
    V = np.frombuffer(base64.b64decode(peca['vb']), DT).copy(); I = np.frombuffer(base64.b64decode(peca['ib']), '<u4' if peca['i32'] else '<u2').astype(np.int64).reshape(-1, 3)
    f = campo(V['p'].astype(np.float64), juntas)
    # o que é do antebraço e da mão (punho da manga) sai sempre: fica fora do eixo do braço e o campo não pegaria
    pa = (np.isin(V['b'], antebraco) * V['w']).sum(1) / 255.0; f = np.where(pa > 0.5, np.maximum(f, 0.05), f)
    novos = []; cache = {}

    def ponto(i, j):
        a, b = (i, j) if i < j else (j, i); k = (a, b)
        if k not in cache:
            t = f[a] / (f[a] - f[b]); va, vb = V[a], V[b]; nv = np.zeros(1, DT)[0]
            nv['p'] = va['p'] + (vb['p'] - va['p']) * t
            n = va['n'].astype(np.float64) * (1 - t) + vb['n'].astype(np.float64) * t; n /= (np.linalg.norm(n) or 1); nv['n'] = np.clip(np.round(n * 127), -127, 127)
            nv['uv'] = np.round(va['uv'].astype(np.float64) * (1 - t) + vb['uv'].astype(np.float64) * t)
            pes = {}
            for v, k2 in ((va, 1 - t), (vb, t)):
                for o, w in zip(v['b'], v['w']):
                    if w: pes[int(o)] = pes.get(int(o), 0) + w * k2
            top = sorted(pes.items(), key=lambda q: -q[1])[:4]; tot = sum(w for _, w in top) or 1
            ws = [int(round(w / tot * 255)) for _, w in top]; ws[0] += 255 - sum(ws)
            nv['b'] = [o for o, _ in top] + [0] * (4 - len(top)); nv['w'] = ws + [0] * (4 - len(ws))
            cache[k] = len(V) + len(novos); novos.append(nv)
        return cache[k]

    T = []
    for tri in I:
        dentro = f[tri] < 0; nd = int(dentro.sum())
        if nd == 3: T.append(tri); continue
        if nd == 0: continue
        for k in range(3):
            v0, v1, v2 = tri[k], tri[(k + 1) % 3], tri[(k + 2) % 3]
            if nd == 1 and dentro[k]:
                T.append([v0, ponto(v0, v1), ponto(v2, v0)]); break
            if nd == 2 and not dentro[k]:
                p01, p20 = ponto(v0, v1), ponto(v2, v0); T.append([p01, v1, v2]); T.append([p01, v2, p20]); break
    V2 = np.concatenate([V, np.array(novos, DT)]) if novos else V
    T = np.array(T, np.int64)
    usados = np.unique(T); mapa = -np.ones(len(V2), np.int64); mapa[usados] = np.arange(len(usados)); V3 = V2[usados]; T3 = mapa[T]
    i32 = len(V3) > 65535
    peca['vb'] = base64.b64encode(V3.tobytes()).decode(); peca['ib'] = base64.b64encode(T3.astype('<u4' if i32 else '<u2').tobytes()).decode()
    peca['nv'] = int(len(V3)); peca['ni'] = int(T3.size); peca['i32'] = bool(i32)
    return len(I), len(T3), len(novos)


def mostrar_corpo(corpo, peca, juntas):
    V = np.frombuffer(base64.b64decode(corpo['vb']), DT); I = np.frombuffer(base64.b64decode(corpo['ib']), '<u4' if corpo['i32'] else '<u2').astype(np.int64).reshape(-1, 3)
    oc = np.unpackbits(np.frombuffer(base64.b64decode(peca['oculta']), np.uint8), bitorder='little')[:len(I)].astype(bool)
    f = campo(V['p'].astype(np.float64), juntas)
    volta = oc & (f[I] > -FOLGA_CORPO).any(1)
    oc2 = oc & ~volta
    peca['oculta'] = base64.b64encode(np.packbits(oc2, bitorder='little').tobytes()).decode(); peca['nocult'] = int(oc2.sum())
    return int(volta.sum())


def main():
    arq = sys.argv[1]; s = open(arq, encoding='utf8').read()
    i = s.index('const MHP=') + len('const MHP='); j = s.rindex(';')
    M = json.loads(s[i:j]); peca = M['pecas']['colete']; casaco = M['pecas']['casacoPele']
    for cid in peca['corpos']:
        p = peca[cid]
        if 'mesmo' in p or cid not in casaco or 'mesmo' in casaco[cid]: continue
        for k in ('vb', 'ib', 'nv', 'ni', 'i32', 'oculta', 'nocult'): p[k] = casaco[cid][k]   # parte do casaco inteiro
        jt = juntas_do(M['corpos'][cid]); os_ = M['corpos'][cid]['ossos']
        ab = [os_.index(n) for n in ('LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand')]
        a, b, n = recortar(p, jt, ab); v = mostrar_corpo(M['corpos'][cid], p, jt)
        print('%s: %d -> %d triângulos (%d vértices novos na borda), %d triângulos do corpo voltam a aparecer' % (cid, a, b, n, v))
    open(arq, 'w', encoding='utf8').write(s[:i] + json.dumps(M, separators=(',', ':')) + s[j:])


if __name__ == '__main__':
    main()

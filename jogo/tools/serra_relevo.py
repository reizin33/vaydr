"""Relevo da Serra Velha nova: maciço de cristas (ruído com distorção de domínio) + erosão por gotas de chuva
(milhares de gotas descendo o morro ao mesmo tempo, arrancando terra onde correm rápido e largando onde perdem força: abre
ravinas e forma leques de pedra no pé) + desmoronamento leve. Usado por tools/serra_gerar.py (importa relevo())."""
import math, time
import numpy as np

def sm(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

class Ruido2:
    def __init__(s, semente, n=256):
        s.n = n; s.t = np.random.default_rng(semente).random((n, n))
    def v(s, x, y):
        n = s.n; xi = np.floor(x).astype(np.int64); yi = np.floor(y).astype(np.int64)
        q = lambda t: t * t * t * (t * (t * 6 - 15) + 10); fx = q(x - xi); fy = q(y - yi)
        a = s.t[yi % n, xi % n]; b = s.t[yi % n, (xi + 1) % n]; c = s.t[(yi + 1) % n, xi % n]; d = s.t[(yi + 1) % n, (xi + 1) % n]
        return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy

def fbm(r, x, y, oit=5, ga=0.5, la=2.03):
    s = 0; a = 1; t = 0
    for o in range(oit): s += a * r.v(x, y); t += a; a *= ga; x = x * la + 17.1; y = y * la - 9.3
    return s / t

class Gradiente2:
    """ruído de gradiente (Perlin): cristas de verdade saem dele (o de valor deixa tudo arredondado)"""
    def __init__(s, semente, n=256):
        r = np.random.default_rng(semente); a = r.random((n, n)) * 2 * math.pi; s.n = n; s.gx = np.cos(a); s.gy = np.sin(a)
    def v(s, x, y):
        n = s.n; xi = np.floor(x).astype(np.int64); yi = np.floor(y).astype(np.int64); fx = x - xi; fy = y - yi
        q = lambda t: t * t * t * (t * (t * 6 - 15) + 10); u = q(fx); w = q(fy)
        def g(ox, oy):
            i = (xi + ox) % n; j = (yi + oy) % n; return s.gx[j, i] * (fx - ox) + s.gy[j, i] * (fy - oy)
        a = g(0, 0); b = g(1, 0); c = g(0, 1); d = g(1, 1)
        return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * w   # ~ -0.7..0.7

def cristas(r, x, y, oit=7, ganho=0.5, offset=1.0):
    """ridged multifractal (Musgrave) com ruído de gradiente: 0..~1"""
    s = 0; a = 1; t = 0; w = 1
    for o in range(oit):
        n = offset - np.abs(r.v(x, y) * 1.45); n = np.clip(n, 0, 1) ** 2; n *= w; s += a * n; t += a
        w = np.clip(n * 1.8, 0, 1); a *= ganho; x = x * 2.07 + 31.7; y = y * 2.07 - 12.9
    return s / t

def erosao_gotas(H, n_gotas=320000, lote=400, vida=56, raio=3, semente=3, inercia=0.06, cap=5.0, cap_min=0.01,
                 tira=0.35, larga=0.25, evapora=0.015, grav=6.0, mascara=None):
    H = H.copy(); NY, NX = H.shape; rng = np.random.default_rng(semente)
    # pincel da erosão: pesos de um disco de raio r em volta da célula
    off = [(dy, dx) for dy in range(-raio, raio + 1) for dx in range(-raio, raio + 1) if dy * dy + dx * dx <= raio * raio]
    pw = np.array([max(0, raio - math.sqrt(dy * dy + dx * dx)) for dy, dx in off]); pw /= pw.sum()
    ody = np.array([o[0] for o in off]); odx = np.array([o[1] for o in off])
    feitas = 0
    while feitas < n_gotas:
        B = min(lote, n_gotas - feitas); feitas += B
        if mascara is not None:   # gotas caem mais onde há serra
            p = mascara.ravel() / mascara.sum(); k = rng.choice(NY * NX, size=B, p=p); py = (k // NX) + rng.random(B); px = (k % NX) + rng.random(B)
        else:
            px = rng.random(B) * (NX - 1); py = rng.random(B) * (NY - 1)
        dx = np.zeros(B); dy = np.zeros(B); v = np.ones(B); w = np.ones(B); s = np.zeros(B); viva = np.ones(B, bool)
        for passo in range(vida):
            ix = np.clip(px.astype(np.int64), 0, NX - 2); iy = np.clip(py.astype(np.int64), 0, NY - 2); fx = px - ix; fy = py - iy
            h00 = H[iy, ix]; h10 = H[iy, ix + 1]; h01 = H[iy + 1, ix]; h11 = H[iy + 1, ix + 1]
            gx = (h10 - h00) * (1 - fy) + (h11 - h01) * fy; gy = (h01 - h00) * (1 - fx) + (h11 - h10) * fx
            h0 = h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy
            dx = dx * inercia - gx * (1 - inercia); dy = dy * inercia - gy * (1 - inercia)
            l = np.hypot(dx, dy); parada = l < 1e-6; l[parada] = 1; dx /= l; dy /= l
            nx_ = px + dx; ny_ = py + dy
            viva &= ~parada & (nx_ >= 0) & (nx_ < NX - 1) & (ny_ >= 0) & (ny_ < NY - 1)
            if not viva.any(): break
            jx = np.clip(nx_.astype(np.int64), 0, NX - 2); jy = np.clip(ny_.astype(np.int64), 0, NY - 2); gfx = nx_ - jx; gfy = ny_ - jy
            h1 = H[jy, jx] * (1 - gfx) * (1 - gfy) + H[jy, jx + 1] * gfx * (1 - gfy) + H[jy + 1, jx] * (1 - gfx) * gfy + H[jy + 1, jx + 1] * gfx * gfy
            dh = h1 - h0
            c = np.maximum(-dh * v * w * cap, cap_min)
            larg = viva & ((s > c) | (dh > 0))
            am = np.where(dh > 0, np.minimum(dh, s), (s - c) * larga) * larg
            s -= am
            for (ox, oy, wt) in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
                np.add.at(H, (iy + oy, ix + ox), am * wt)
            er = viva & ~larg
            ae = np.where(er, np.minimum((c - s) * tira, -dh), 0)
            if er.any():
                ei = np.flatnonzero(er); ey = iy[ei][:, None] + ody[None, :]; ex = ix[ei][:, None] + odx[None, :]
                ok = (ey >= 0) & (ey < NY) & (ex >= 0) & (ex < NX); ey = np.clip(ey, 0, NY - 1); ex = np.clip(ex, 0, NX - 1)
                q = ae[ei][:, None] * pw[None, :] * ok
                q = np.minimum(q, np.maximum(H[ey, ex] - 0, 0))   # não cava abaixo de zero
                np.add.at(H, (ey, ex), -q); s[ei] += q.sum(1)
            v = np.sqrt(np.maximum(v * v + dh * grav, 0)); w *= (1 - evapora)
            px = np.where(viva, nx_, px); py = np.where(viva, ny_, py)
    return H

def termico(H, dx=1.0, n=30, tal=math.tan(math.radians(36)), k=0.2, fixo=None):
    OFF = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]; H = H.copy(); NY, NX = H.shape
    for _ in range(n):
        P = np.pad(H, 1, mode='edge'); mov = np.zeros_like(H)
        for dy, dx_ in OFF:
            d = math.hypot(dy, dx_) * dx; hn = P[1 + dy:1 + dy + NY, 1 + dx_:1 + dx_ + NX]; ex = (H - hn) / d - tal
            Q = np.where(ex > 0, ex * d * k / 8, 0)
            if fixo is not None: Q = Q * (1 - fixo)
            mov -= Q; mov[max(0, dy):NY + min(0, dy), max(0, dx_):NX + min(0, dx_)] += Q[max(0, -dy):NY - max(0, dy), max(0, -dx_):NX - max(0, dx_)]
        H += mov
    return H

def relevo(XX, ZZ, alvo_mask, altura=78.0, log=print):
    """XX, ZZ: grade (m); alvo_mask: 0..1 onde a serra pode subir. Devolve o quanto a serra sobe (m)."""
    t0 = time.time(); G1 = Gradiente2(11); G2 = Gradiente2(23); R2 = Ruido2(29); R3 = Ruido2(47)
    # distorção de domínio: as cristas fazem curvas e ramificam
    wx = (fbm(R3, XX / 80.0 + 5, ZZ / 80.0 - 3, oit=4) - 0.5) * 70; wz = (fbm(R3, XX / 80.0 - 8, ZZ / 80.0 + 6, oit=4) - 0.5) * 70
    cr = cristas(G1, (XX + wx) / 120.0, (ZZ + wz) / 120.0, oit=8, ganho=0.52)
    largo = fbm(R2, XX / 170.0 + 2, ZZ / 170.0 - 1, oit=3)
    H = altura * alvo_mask * np.clip(cr * 1.25, 0, 1.2) * (0.55 + 0.9 * largo)
    log('  maciço: máx %.1f m (%.1fs)' % (H.max(), time.time() - t0))
    # erosão por gotas em duas escalas: grade de 3 m (os vales grandes descem a serra inteira) e grade de 1 m (ravinas)
    k = 3; Hc = H[::k, ::k].copy(); mc = alvo_mask[::k, ::k]
    Ec = erosao_gotas(Hc, n_gotas=90000, vida=90, raio=2, cap=3.0, tira=0.3, larga=0.2, mascara=np.clip(mc, 0.02, 1)) - Hc
    from scipy import ndimage
    E = ndimage.zoom(Ec, (H.shape[0] / Ec.shape[0], H.shape[1] / Ec.shape[1]), order=3)[:H.shape[0], :H.shape[1]]
    H = np.maximum(H + E, 0)
    H = erosao_gotas(H, n_gotas=200000, vida=40, raio=2, cap=2.2, tira=0.25, larga=0.2, mascara=np.clip(alvo_mask, 0.02, 1))
    log('  erosão por gotas: máx %.1f m (%.1fs)' % (H.max(), time.time() - t0))
    # rocha: onde é íngreme, lascas e degraus (camadas da rocha) em vez de encosta lisa
    gy, gx = np.gradient(H); incl = np.hypot(gx, gy); ingreme = sm(0.55, 1.2, incl) * sm(8, 25, H)
    deg = 2.6 + 1.2 * fbm(R2, XX / 40.0, ZZ / 40.0, oit=2)
    terr = np.floor(H / deg) * deg + deg * sm(0.15, 0.85, (H / deg) % 1.0)
    H = H * (1 - 0.55 * ingreme) + terr * 0.55 * ingreme
    lasca = (cristas(G2, XX / 14.0, ZZ / 14.0, oit=3) - 0.35) * 3.4 * ingreme
    H = H + lasca
    H = termico(H, fixo=np.clip(ingreme * 1.3, 0, 0.92), n=20)
    log('  rocha e desmoronamento: máx %.1f m (%.1fs)' % (H.max(), time.time() - t0))
    return np.maximum(H, 0)

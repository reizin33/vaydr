"""Leitor de FBX binário (7.x) para os arquivos do Mixamo: esqueleto (LimbNode), pose de repouso e curvas de animação.
Só leitura; não executa nada do arquivo. Uso como módulo: from fbx_ler import ler_fbx, esqueleto, amostrar."""
import struct, zlib, math
import numpy as np
TICKS = 46186158000.0          # ticks do FBX por segundo

def ler_fbx(caminho):
    b = open(caminho, 'rb').read()
    if b[:20] != b'Kaydara FBX Binary  ':
        raise ValueError('não é FBX binário: ' + caminho)
    ver = struct.unpack_from('<I', b, 23)[0]; big = ver >= 7500
    def no(pos):
        if big: end, nprop, plen = struct.unpack_from('<QQQ', b, pos); pos += 24
        else: end, nprop, plen = struct.unpack_from('<III', b, pos); pos += 12
        nl = b[pos]; pos += 1
        if end == 0: return None, pos
        nome = b[pos:pos + nl].decode('latin1'); pos += nl; props = []
        for _ in range(nprop):
            t = chr(b[pos]); pos += 1
            if t == 'Y': v = struct.unpack_from('<h', b, pos)[0]; pos += 2
            elif t == 'C': v = b[pos] != 0; pos += 1
            elif t == 'I': v = struct.unpack_from('<i', b, pos)[0]; pos += 4
            elif t == 'F': v = struct.unpack_from('<f', b, pos)[0]; pos += 4
            elif t == 'D': v = struct.unpack_from('<d', b, pos)[0]; pos += 8
            elif t == 'L': v = struct.unpack_from('<q', b, pos)[0]; pos += 8
            elif t in 'fdlib':
                n, enc, cl = struct.unpack_from('<III', b, pos); pos += 12; raw = b[pos:pos + cl]; pos += cl
                if enc == 1: raw = zlib.decompress(raw)
                v = np.frombuffer(raw, {'f': '<f4', 'd': '<f8', 'l': '<i8', 'i': '<i4', 'b': 'u1'}[t], n)
            elif t in 'SR':
                n = struct.unpack_from('<I', b, pos)[0]; pos += 4; v = b[pos:pos + n]; pos += n
                if t == 'S': v = v.decode('utf-8', 'replace')
            else: raise ValueError('tipo de propriedade desconhecido %r em %s' % (t, nome))
            props.append(v)
        filhos = []
        while pos < end:
            f, pos = no(pos)
            if f is None: break
            filhos.append(f)
        return {'nome': nome, 'props': props, 'filhos': filhos}, end
    pos = 27; raiz = []
    while pos < len(b) - 13:
        f, pos2 = no(pos)
        if f is None: break
        raiz.append(f); pos = pos2
    return {'versao': ver, 'nos': raiz}

def filho(n, nome):
    for f in n['filhos']:
        if f['nome'] == nome: return f
    return None
def props70(n):
    p = filho(n, 'Properties70'); out = {}
    if p:
        for e in p['filhos']:
            if e['nome'] == 'P': out[e['props'][0]] = e['props'][4:]
    return out

def q_euler_xyz(rx, ry, rz):
    """rotação do FBX (graus, ordem XYZ: R = Rz*Ry*Rx) como quatérnio (x, y, z, w)"""
    def eixo(a, i):
        h = math.radians(a) / 2; q = [0.0, 0.0, 0.0, math.cos(h)]; q[i] = math.sin(h); return np.array(q)
    return qmul(qmul(eixo(rz, 2), eixo(ry, 1)), eixo(rx, 0))
def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return np.array([aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
                     aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz])
def qconj(q): return np.array([-q[0], -q[1], -q[2], q[3]])
def qrot(q, v):
    x, y, z, w = q; t = 2 * np.cross([x, y, z], v); return v + w * t + np.cross([x, y, z], t)

def esqueleto(fbx):
    """ossos (LimbNode/Null/Root) com nome sem prefixo, pai, propriedades de repouso e curvas; e as configurações globais"""
    objs = filho({'filhos': fbx['nos']}, 'Objects'); cons = filho({'filhos': fbx['nos']}, 'Connections')
    gs = filho({'filhos': fbx['nos']}, 'GlobalSettings'); G = props70(gs) if gs else {}
    modelos, nos_c, curvas = {}, {}, {}
    for o in objs['filhos']:
        if o['nome'] == 'Model':
            id_ = o['props'][0]; nome = o['props'][1].split('\x00')[0]; nome = nome.split(':')[-1]
            modelos[id_] = {'id': id_, 'nome': nome, 'tipo': o['props'][2], 'p': props70(o), 'pai': None, 'cn': {}}
        elif o['nome'] == 'AnimationCurveNode':
            nos_c[o['props'][0]] = {'nome': o['props'][1].split('\x00')[0], 'p': props70(o), 'c': {}}
        elif o['nome'] == 'AnimationCurve':
            kt = filho(o, 'KeyTime'); kv = filho(o, 'KeyValueFloat')
            curvas[o['props'][0]] = (np.asarray(kt['props'][0], np.float64) / TICKS, np.asarray(kv['props'][0], np.float64))
    for c in cons['filhos']:
        pr = c['props']; tipo, a, b_ = pr[0], pr[1], pr[2]
        if tipo == 'OO' and a in modelos and b_ in modelos: modelos[a]['pai'] = b_
        elif tipo == 'OP' and a in curvas and b_ in nos_c: nos_c[b_]['c'][pr[3]] = curvas[a]
        elif tipo == 'OP' and a in nos_c and b_ in modelos: modelos[b_]['cn'][pr[3]] = nos_c[a]
    return modelos, G

def valor(m, prop, t=None, padrao=(0.0, 0.0, 0.0)):
    """valor de Lcl Translation/Rotation/Scaling no tempo t (None = repouso, as propriedades do osso)"""
    base = [float(v) for v in m['p'].get(prop, padrao)[:3]] if prop in m['p'] else list(padrao)
    if t is None or prop not in m['cn']: return np.array(base)
    cn = m['cn'][prop]; out = []
    for k, eixo in enumerate(('d|X', 'd|Y', 'd|Z')):
        if eixo in cn['c']:
            tt, vv = cn['c'][eixo]; out.append(float(np.interp(t, tt, vv)))
        else:
            d = cn['p'].get(eixo); out.append(float(d[0]) if d else base[k])
    return np.array(out)

def rot_local(m, t=None):
    """quatérnio da rotação local: PreRotation * R(t) * PostRotation^-1 (ordem XYZ, que é a do Mixamo)"""
    if int(m['p'].get('RotationOrder', [0])[0] or 0) != 0: raise ValueError('ordem de rotação diferente de XYZ em ' + m['nome'])
    pre = q_euler_xyz(*[float(v) for v in m['p'].get('PreRotation', (0, 0, 0))[:3]])
    post = q_euler_xyz(*[float(v) for v in m['p'].get('PostRotation', (0, 0, 0))[:3]])
    return qmul(qmul(pre, q_euler_xyz(*valor(m, 'Lcl Rotation', t))), qconj(post))

def duracao(modelos):
    t1 = 0.0
    for m in modelos.values():
        for cn in m['cn'].values():
            for tt, vv in cn['c'].values(): t1 = max(t1, float(tt[-1]))
    return t1

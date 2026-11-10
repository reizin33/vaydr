"""Compara as saídas de duas versões (pastas de jogo/logs gravadas pelo tools/bateria.py).

Uso: python3 tools/comparar.py logs/base logs/novo [--tudo]

Para cada teste mostra: conferências que deram erro só na versão nova, avisos e erros novos no console, conferências que
sumiram ou apareceram e os valores que mudaram (números com diferença de até 3% contam como iguais). Sem --tudo, mostra no
máximo 8 valores mudados por conferência."""
import json, os, re, sys

TOL = 0.03


def folhas(v, cam=''):
    if isinstance(v, dict):
        for k, x in v.items():
            yield from folhas(x, cam + '.' + str(k))
    elif isinstance(v, list) and len(v) <= 40 and all(isinstance(x, (dict, list)) for x in v):
        for i, x in enumerate(v):
            yield from folhas(x, cam + '[' + str(i) + ']')
    else:
        yield cam, v


def igual(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= max(TOL * max(abs(a), abs(b)), 0.02)
    return a == b


def curto(v, n=70):
    s = json.dumps(v, ensure_ascii=False)
    return s if len(s) <= n else s[:n] + '…'


def limpa(l):
    l = re.sub(r'0x[0-9a-f]+', '0x', l)
    return re.sub(r'\d+(\.\d+)?', '#', l)


def main():
    a_dir, b_dir = sys.argv[1], sys.argv[2]
    tudo = '--tudo' in sys.argv
    nomes = sorted(set(os.listdir(a_dir)) | set(os.listdir(b_dir)))
    resumo = []
    for f in nomes:
        if not f.endswith('.out.json'):
            continue
        t = f[:-9]
        pa, pb = os.path.join(a_dir, f), os.path.join(b_dir, f)
        if not os.path.exists(pb):
            print(f'## {t}: SEM SAÍDA na versão nova'); resumo.append((t, 'sem saída')); continue
        A = json.load(open(pa)) if os.path.exists(pa) else {}
        B = json.load(open(pb))
        linhas = []
        for k in B:
            if k.endswith('_logs'):
                la = {limpa(x) for x in A.get(k, []) if 'GL Driver' not in x}
                nov = [x for x in B[k] if 'GL Driver' not in x and limpa(x) not in la]
                for x in nov[:6]:
                    linhas.append('  console novo: ' + x[:220])
                continue
            vb = B[k]
            if isinstance(vb, dict) and 'ERRO' in vb and not (isinstance(A.get(k), dict) and 'ERRO' in A.get(k)):
                linhas.append(f'  ERRO só na nova em {k}: {str(vb["ERRO"])[:200]}'); continue
            if k not in A:
                linhas.append(f'  conferência nova: {k} = {curto(vb, 160)}'); continue
            fa, fb = dict(folhas(A[k])), dict(folhas(vb))
            dif = [(c, fa.get(c, '<falta>'), fb.get(c, '<falta>')) for c in sorted(set(fa) | set(fb)) if not igual(fa.get(c, '<falta>'), fb.get(c, '<falta>'))]
            if dif:
                linhas.append(f'  {k}: {len(dif)} valor(es) mudaram')
                for c, x, y in (dif if tudo else dif[:8]):
                    linhas.append(f'     {c or "(valor)"}: {curto(x)} -> {curto(y)}')
        for k in A:
            if k not in B and not k.endswith('_logs'):
                linhas.append(f'  conferência sumiu: {k}')
        if linhas:
            print(f'## {t}'); print('\n'.join(linhas)); resumo.append((t, f'{len(linhas)} linha(s)'))
        else:
            resumo.append((t, 'igual'))
    print('\n== resumo: ' + ', '.join(f'{t}: {r}' for t, r in resumo))


if __name__ == '__main__':
    main()

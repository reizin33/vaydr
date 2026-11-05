"""Procura nomes repetidos nos registros do jogo (OBRAS, ITEMS, MESH, MESH.obra, ícones...): uma etapa nova que usa um nome
que já existia apaga a definição antiga (foi o que aconteceu com 'plataforma' na Etapa 18).
Uso: python3 choques.py <pasta src>"""
import os, re, sys
from collections import defaultdict

PASTA = sys.argv[1] if len(sys.argv) > 1 else 'src'
REG = {'ITEMS', 'OBRAS', 'LOOT', 'MESH', 'MESH.obra', 'BASE_DICAS', 'VTIPOS', 'FAUNA', 'ELET', 'RTIPOS', 'SONS', 'UTIL_ACOES', 'CONT_DEF',
       'INTER_K', 'VMESH', 'FAUNA_RENDE', 'FAUNA_FORMA', 'CAIXA_LOOT', 'CID_LOOT', 'MANUAIS', 'REPARO', 'DESMONTE_FIXO', 'ZVISUAL', 'MOVEIS_NOVOS',
       'SALA_MOVEIS', 'ANIM', 'MOTORISTA', 'ENGATE', 'PESO_VEIC', 'APAR', 'CHAPEUS', 'MANGAS_FP', 'SOB_TAREFAS', 'RASTRO_TIPOS', 'GRAF', 'DIF',
       'ICONES', 'V8.salvar', 'V8.carregar', 'V8.novo', 'ACOES_TECLA', 'HUDS', 'FAUNA_VAR', 'COR_PELO', 'RASTRO_TIPOS', 'CAIXA_CFG', 'CID_CFG', 'ALTO_CFG', 'EST_CFG', 'EST_FILTROS'}
PALAVRAS_REGEX = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await'}

def tokens(src):
    i, n, out, linha = 0, len(src), [], 1
    def ultimo():
        return out[-1] if out else None
    while i < n:
        c = src[i]
        if c == '\n':
            linha += 1; i += 1; continue
        if c in ' \t\r':
            i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2; linha += src.count('\n', i, j); i = j; continue
        if c in '\'"':
            j = i + 1; buf = []
            while j < n and src[j] != c:
                if src[j] == '\\': buf.append(src[j:j + 2]); j += 2; continue
                if src[j] == '\n': linha += 1
                buf.append(src[j]); j += 1
            out.append(('str', ''.join(buf), linha)); i = j + 1; continue
        if c == '`':
            # template: pula, contando ${ } aninhados de forma simples
            j = i + 1; prof = 0
            while j < n:
                if src[j] == '\\': j += 2; continue
                if src[j] == '\n': linha += 1
                if prof == 0 and src[j] == '`': break
                if src.startswith('${', j): prof += 1; j += 2; continue
                if prof > 0 and src[j] == '}': prof -= 1
                j += 1
            out.append(('tpl', '', linha)); i = j + 1; continue
        if c == '/':
            u = ultimo()
            eh_regex = u is None or (u[0] == 'p' and u[1] not in (')', ']', '}')) or (u[0] == 'id' and u[1] in PALAVRAS_REGEX)
            if eh_regex:
                j = i + 1; cls = False
                while j < n:
                    if src[j] == '\\': j += 2; continue
                    if src[j] == '[': cls = True
                    elif src[j] == ']': cls = False
                    elif src[j] == '/' and not cls: break
                    elif src[j] == '\n': break
                    j += 1
                j += 1
                while j < n and (src[j].isalnum()): j += 1
                out.append(('re', '', linha)); i = j; continue
        if c.isalpha() or c in '_$':
            j = i + 1
            while j < n and (src[j].isalnum() or src[j] in '_$'): j += 1
            out.append(('id', src[i:j], linha)); i = j; continue
        if c.isdigit() or (c == '.' and i + 1 < n and src[i + 1].isdigit()):
            j = i + 1
            while j < n and (src[j].isalnum() or src[j] in '._'): j += 1
            out.append(('num', src[i:j], linha)); i = j; continue
        for op in ('===', '!==', '**=', '...', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '+=', '-=', '*=', '/=', '++', '--', '**'):
            if src.startswith(op, i):
                out.append(('p', op, linha)); i += len(op); break
        else:
            out.append(('p', c, linha)); i += 1
    return out

def chaves_objeto(T, k):
    """T[k] é '{': devolve [(chave, linha)] do primeiro nível e o índice depois do '}'."""
    prof, i, res, esperando = 0, k, [], True
    while i < len(T):
        t = T[i]
        if t[0] == 'p' and t[1] in '{[(':
            prof += 1
            if prof == 1: esperando = True
            i += 1; continue
        if t[0] == 'p' and t[1] in '}])':
            prof -= 1
            if prof == 0: return res, i + 1
            i += 1; continue
        if prof == 1:
            if esperando and t[0] in ('id', 'str', 'num') and i + 1 < len(T) and T[i + 1][0] == 'p' and T[i + 1][1] in (':', ',', '(', '}'):
                res.append((t[1], t[2])); esperando = False
            elif t[0] == 'p' and t[1] == ',':
                esperando = True
            elif esperando and t[0] == 'p' and t[1] == '...':
                esperando = False
            elif esperando:
                esperando = False
        i += 1
    return res, i

def alvo_antes(T, k):
    """nome pontilhado que termina em T[k-1] (ex.: MESH.obra)."""
    partes, j = [], k - 1
    while j >= 0 and T[j][0] == 'id':
        partes.insert(0, T[j][1])
        if j - 1 >= 0 and T[j - 1] == ('p', '.', T[j - 1][2]) or (j - 1 >= 0 and T[j - 1][0] == 'p' and T[j - 1][1] == '.'):
            j -= 2; continue
        break
    return '.'.join(partes)

def main():
    defs = defaultdict(list)    # (registro, chave) -> [(arquivo, linha, como)]
    arquivos = sorted(f for f in os.listdir(PASTA) if f.endswith('.js'))
    for f in arquivos:
        T = tokens(open(os.path.join(PASTA, f), encoding='utf8').read())
        prof = 0
        for k, t in enumerate(T):
            # const NOME={...} no nível de cima
            if t[0] == 'id' and t[1] in ('const', 'let', 'var') and k + 3 < len(T) and T[k + 1][0] == 'id' and T[k + 2][1] == '=' and T[k + 3][1] == '{':
                nome = T[k + 1][1]
                if nome in REG:
                    ch, _ = chaves_objeto(T, k + 3)
                    for c, l in ch: defs[(nome, c)].append((f, l, 'const'))
            # Object.assign(ALVO,{...})
            if t[0] == 'id' and t[1] == 'assign' and k >= 2 and T[k - 1][1] == '.' and T[k - 2][1] == 'Object' and T[k + 1][1] == '(':
                j = k + 2; partes = []
                while j < len(T) and (T[j][0] == 'id' or T[j][1] == '.'):
                    partes.append(T[j][1]); j += 1
                nome = ''.join(partes)
                if nome in REG and T[j][1] == ',' and T[j + 1][1] == '{':
                    ch, _ = chaves_objeto(T, j + 1)
                    for c, l in ch: defs[(nome, c)].append((f, l, 'assign'))
            # ALVO.chave=  /  ALVO['chave']=
            if t[0] == 'p' and t[1] == '=' and k >= 3:
                if T[k - 1][0] == 'id' and T[k - 2][1] == '.':
                    nome = alvo_antes(T, k - 2)
                    if nome in REG and not (k >= 3 and T[k - 3][1] == '.' and alvo_antes(T, k - 2) != nome):
                        defs[(nome, T[k - 1][1])].append((f, T[k - 1][2], 'set'))
                elif T[k - 1][1] == ']' and T[k - 2][0] == 'str' and T[k - 3][1] == '[':
                    nome = alvo_antes(T, k - 3)
                    if nome in REG: defs[(nome, T[k - 2][1])].append((f, T[k - 2][2], 'set'))
            # iconesNovos({...})
            if t[0] == 'id' and t[1] == 'iconesNovos' and k + 2 < len(T) and T[k + 1][1] == '(' and T[k + 2][1] == '{':
                ch, _ = chaves_objeto(T, k + 2)
                for c, l in ch: defs[('ICONES', c)].append((f, l, 'icone'))
    html = os.path.join(PASTA, 'page.html')
    if os.path.exists(html):
        for m in re.finditer(r'<symbol id="([^"]+)"', open(html, encoding='utf8').read()):
            defs[('ICONES', m.group(1))].append(('page.html', 0, 'symbol'))
    n = 0
    for (reg, c), L in sorted(defs.items()):
        if len(L) > 1 and len({(a, b) for a, b, _ in L}) > 1:
            n += 1
            print(f'{reg}.{c}: ' + ' | '.join(f'{a}:{b} ({como})' for a, b, como in L))
    print(f'-- {n} nomes definidos mais de uma vez')

main()

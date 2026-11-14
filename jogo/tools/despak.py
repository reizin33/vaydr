"""Abre os pacotes .pak montados no navegador (Poly Haven / Sketchfab) e grava cada modelo como arquivo.
Formato: registros [u32 tamanho do nome][u32 tamanho dos dados][nome utf-8][dados], um atrás do outro (little-endian).
Os nomes vêm de fora: só o nome do arquivo é aproveitado (sem pasta), com letras, números, ponto, hífen e sublinhado.
Uso: python3 -I tools/despak.py pacote.pak pasta_de_saida"""
import sys, os, re, struct
PAK, SAI = sys.argv[1], sys.argv[2]
os.makedirs(SAI, exist_ok=True)
n = tot = 0
with open(PAK, 'rb') as f:
    while True:
        cab = f.read(8)
        if len(cab) < 8:
            break
        ln, ld = struct.unpack('<II', cab)
        if ln == 0 or ln > 400 or ld > 600_000_000:
            raise SystemExit('registro estranho em %d: nome %d, dados %d' % (f.tell() - 8, ln, ld))
        nome = f.read(ln).decode('utf-8', 'replace')
        nome = re.sub(r'[^A-Za-z0-9._-]', '_', os.path.basename(nome.replace('\\', '/'))).lstrip('.') or 'sem_nome_%d' % n
        dados = f.read(ld)
        if len(dados) < ld:
            raise SystemExit('pacote cortado em %s (%d de %d bytes)' % (nome, len(dados), ld))
        with open(os.path.join(SAI, nome), 'wb') as o:
            o.write(dados)
        n += 1; tot += ld
print('%d arquivos, %.1f MB em %s' % (n, tot / 1e6, SAI))

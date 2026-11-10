"""Bateria de testes: roda uma lista de testes em uma ou mais versões do jogo, um de cada vez, e guarda as saídas.

Uso (de dentro de jogo/):
  python3 tools/bateria.py rapida base=x_base.html novo=x_novo.html
  python3 tools/bateria.py borda novo=x_novo.html
  python3 tools/bateria.py p93_agua,p94_veiculos base=x_base.html novo=x_novo.html

Cada versão é nome=arquivo.html (o arquivo fica em jogo/). As saídas vão para jogo/logs/<nome>/<teste>.out.json e o andamento
para jogo/logs/estado.txt. Depois, tools/comparar.py logs/base logs/novo mostra o que mudou entre as versões.
Os testes rodam no modo rápido e sem fotos (SEMFOTO=1); as fotos têm os próprios roteiros (p233d, p235c...).

Listas:
  rapida  a bateria rápida (25 testes, um ou dois de cada sistema), que roda em toda etapa
  borda   os testes da borda do mapa, do anel da cidade, das regiões, do mapa e da Mata dos Morros"""
import os, re, subprocess, sys, time, shutil

RAPIDA = ("p205_salvar p110_save p93_agua p94_veiculos p224_veiculos p223_sair p225_teclas p228_heli p229_armas p83_armas "
          "p89_zumbis p84_chefe p87_sobrev p88_base p57_alto p97_oficinas p98_subsolo p99_esporos p61_cidade p100_ferrovia "
          "p102_eventos p104_territorios p128_plantio p232d_escalada p235_enchente").split()
BORDA = ("p199_borda p219_borda p220_anel p201_regioes p95_fauna p96_caca p227_mapa p232a_confirmar "
         "p233_morros p233b_dirigir p233e_caminho").split()

J = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def roteiro(teste):
    """gera o roteiro do teste e devolve o caminho do .json (relativo a jogo/)"""
    py = os.path.join(J, 'tools', teste + '.py')
    src = open(py, encoding='utf-8').read()
    m = re.search(r"salvar\(\s*'([^']+)'", src) or re.search(r"'\.\.',\s*'([^']+\.json)'", src)
    if not m:
        raise RuntimeError('não achei o nome do roteiro em ' + teste)
    r = subprocess.run([sys.executable, py], cwd=J, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-400:])
    return m.group(1)


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    nome = sys.argv[1]
    testes = RAPIDA if nome == 'rapida' else BORDA if nome == 'borda' else nome.split(',')
    versoes = [a.split('=', 1) for a in sys.argv[2:]]
    os.makedirs(os.path.join(J, 'logs'), exist_ok=True)
    est = open(os.path.join(J, 'logs', 'estado.txt'), 'a')
    for t in testes:
        try:
            js = roteiro(t)
        except Exception as e:
            est.write(f'{t} ROTEIRO_ERRO {e}\n'); est.flush(); continue
        out = os.path.join(J, js[:-5] + '.out.json')
        for v, html in versoes:
            os.makedirs(os.path.join(J, 'logs', v), exist_ok=True)
            if os.path.exists(out):
                os.remove(out)
            t0 = time.time()
            env = dict(os.environ, SEMFOTO='1', SRC=html)
            try:
                r = subprocess.run([sys.executable, 'run.py', js, 'rapido'], cwd=J, env=env, capture_output=True, text=True, timeout=1500)
                rc = r.returncode
            except subprocess.TimeoutExpired:
                rc = 'tempo'
            if os.path.exists(out):
                shutil.copy(out, os.path.join(J, 'logs', v, t + '.out.json'))
            est.write(f'{t} {v} rc={rc} {round(time.time() - t0)}s\n'); est.flush()
    est.write('FIM ' + nome + '\n'); est.close()


if __name__ == '__main__':
    main()

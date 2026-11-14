"""Cliente da sessão (tools/sessao.py). Uso:
  python3 tools/s.py PASTA js 'return __nnc.P.x'          (corpo de função async; o último valor com return)
  python3 tools/s.py PASTA jsf arquivo.js                  (o mesmo, lendo o código de um arquivo)
  python3 tools/s.py PASTA foto nome [espera_ms]           (shots/nome.png)
  python3 tools/s.py PASTA espera ms"""
import sys, os, json, time, uuid
PASTA, op = sys.argv[1], sys.argv[2]
q = {}
if op == 'js': q['js'] = sys.argv[3]
elif op == 'jsf': q['js'] = open(sys.argv[3]).read()
elif op == 'foto':
    q['foto'] = sys.argv[3]
    if len(sys.argv) > 4: q['espera'] = int(sys.argv[4])
elif op == 'espera': q['espera'] = int(sys.argv[3])
elif op == 'sair': q['sair'] = 1
rid = os.path.join(PASTA, '%d_%s' % (time.time() * 1000, uuid.uuid4().hex[:6]))
json.dump(q, open(rid + '.tmp', 'w')); os.replace(rid + '.tmp', rid + '.cmd.json')
t0 = time.time()
while not os.path.exists(rid + '.res.json'):
    time.sleep(0.1)
    if time.time() - t0 > 1500: print('sem resposta'); sys.exit(1)
r = json.load(open(rid + '.res.json')); os.remove(rid + '.res.json')
print(json.dumps(r, ensure_ascii=False, indent=None if len(json.dumps(r)) < 300 else 1, default=str)[:20000])

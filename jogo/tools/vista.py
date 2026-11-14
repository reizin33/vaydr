"""Põe o jogador num ponto, olhando para outro, e fotografa (sessão aberta pelo tools/sessao.py).
Uso: python3 tools/vista.py PASTA nome x z y|chao tx tz [pitch] [cam 3|1] [espera_ms] [hora]
  y = 'chao' (no chão) ou altura fixa; pitch em radianos (negativo olha para baixo)."""
import sys, os, json, subprocess
PASTA, nome, x, z, y, tx, tz = sys.argv[1:8]
pitch = float(sys.argv[8]) if len(sys.argv) > 8 else -0.1
cam = sys.argv[9] if len(sys.argv) > 9 else '3'
espera = sys.argv[10] if len(sys.argv) > 10 else '5000'
hora = sys.argv[11] if len(sys.argv) > 11 else '10'
yv = 'null' if y == 'chao' else y
js = f"""const n=__nnc,P=n.P,X=s=>n.ev(s);n.cfg.cam='{cam}';window.__hora={hora};const x={x},z={z},tx={tx},tz={tz};let y={yv};
window.__fixaY=y;P.x=x;P.z=z;P.y=(y===null?X('chaoEm')(x,z,X('ground')(x,z)+2):y);P.vx=P.vz=P.vy=0;P.noChao=(y===null);
P.yaw=Math.atan2(tx-x,tz-z);P.body=P.yaw;P.pitch={pitch};try{{X('rebuildVeg')(true);X('rebuildGrass')();}}catch(e){{}}
return [+P.x.toFixed(1),+P.y.toFixed(1),+P.z.toFixed(1)];"""
here = os.path.dirname(os.path.abspath(__file__))
r = subprocess.run([sys.executable, os.path.join(here, 's.py'), PASTA, 'js', js], capture_output=True, text=True); print(r.stdout.strip())
r = subprocess.run([sys.executable, os.path.join(here, 's.py'), PASTA, 'foto', nome, espera], capture_output=True, text=True); print(r.stdout.strip())

# Monta um vídeo .mp4 com os quadros que o teste do .exe tirou (pasta carga/ com 000.jpg, 001.jpg... e tempos.json com a hora
# de cada quadro em ms). Cada quadro fica na tela o tempo que passou até o próximo: o vídeo anda no tempo de verdade.
# Uso: python3 tools/quadros_video.py pasta_dos_quadros saida.mp4
import json, os, subprocess, sys
pasta, saida = sys.argv[1], sys.argv[2]
t = json.load(open(os.path.join(pasta, 'tempos.json')))
lst = os.path.join(pasta, 'lista.txt')
with open(lst, 'w') as f:
    for i, ms in enumerate(t):
        dur = ((t[i + 1] - ms) if i + 1 < len(t) else 1000) / 1000
        f.write(f"file '{os.path.abspath(os.path.join(pasta, str(i).zfill(3) + '.jpg'))}'\nduration {dur:.3f}\n")
    f.write(f"file '{os.path.abspath(os.path.join(pasta, str(len(t) - 1).zfill(3) + '.jpg'))}'\n")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'fps=30,format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', saida], capture_output=True, text=True)
print(r.stderr[-800:] if r.returncode else f'ok {saida}: {len(t)} quadros, {t[-1] / 1000:.1f} s')

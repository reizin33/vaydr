# p267: vídeo da tela de carregamento, do começo até o "Pronto", gravado direto da página do jogo (sem edição).
# Uso: SRC=x_carga_fontes.html python3 tools/p267_carga_video.py saida.mp4 [largura altura]
import asyncio, os, sys, json, glob, subprocess, time
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = os.environ.get('SRC', 'x_carga2.html')
SAIDA = sys.argv[1]
W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (1280, 720)
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
PASTA = BASE + 'shots/p267_video'
async def main():
    for f in glob.glob(PASTA + '/*.webm'): os.remove(f)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, record_video_dir=PASTA, record_video_size={'width': W, 'height': H})
        pg = await ctx.new_page()
        t0 = time.time()
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("window.__bootFeito===true", timeout=1800000, polling=200)
        t1 = time.time()
        await pg.wait_for_timeout(2500)
        info = await pg.evaluate("({etapas_ms:window.__etapasTotal,aprendeu:window.__etapasAprendidas})")
        await ctx.close(); await b.close()
    webm = glob.glob(PASTA + '/*.webm')[0]
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', webm, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-movflags', '+faststart', SAIDA], capture_output=True, text=True)
    print(json.dumps({'mp4': SAIDA, 'ok': r.returncode == 0, 'erro': r.stderr[-300:], 'ate_pronto_s': round(t1 - t0, 1), **info}, ensure_ascii=False))
asyncio.run(main())

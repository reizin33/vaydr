"""Mede o som do jogo de verdade: grava a saída final do WebAudio numa página de teste e devolve o volume de cada coisa.
Trechos: música do menu (noite), catálogo de efeitos (cada um sozinho, sem música e sem os zumbis do menu), jogo de dia
na clareira andando e golpeando, e jogo de noite. Grava também os .wav para ouvir.
Uso (na pasta jogo/):  SAIDA=t_som.html python3 build.py && python3 tools/p246_som.py t_som.html shots/som
Saída: <prefixo>.json com pico (dBFS), volume médio (RMS dBFS) e sonoridade aproximada (LUFS, filtro K) de cada trecho e
de cada efeito; <prefixo>_<trecho>.wav."""
import asyncio, sys, json, base64, os, wave, math
import numpy as np
from scipy.signal import lfilter
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'
PRE = sys.argv[2] if len(sys.argv) > 2 else 'shots/som'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"]
# efeito, extra, volume (como o jogo chama)
SONS = [('clique', None, 1), ('passo', 'grama', 0.26), ('passo', 'terra', 0.26), ('passo', 'agua', 0.45), ('golpe', None, 1), ('acerto', None, 1),
        ('madeira', None, 1), ('pedra', None, 1), ('galho', None, 0.95), ('tiro', None, 1), ('espingarda', None, 1), ('rifle', None, 1), ('vazio', None, 1),
        ('recarga', None, 1), ('pegar', None, 1), ('construir', None, 1), ('gemido', 'walker', 1), ('gemido', 'brute', 1), ('ataqueZ', 'walker', 1),
        ('morteZ', 'walker', 1), ('dor', None, 1), ('grito', None, 1), ('rugido', None, 1), ('impacto', None, 1), ('quebrar', None, 1), ('fogo', None, 1),
        ('explosao', None, 1), ('latido', 2, 1), ('coruja', None, 1), ('passaro', None, 1), ('nivel', None, 1), ('missao', None, 1), ('bau', None, 1),
        ('estalo', None, 0.35), ('coracao', None, 0.7), ('ameaca', None, 0.9), ('motor', None, 1), ('trovao', 0.05, 0.8)]
ESPACO = 3.2   # segundos entre um efeito e outro (as gravações de gemido e trovão passam de 2 s)

PREP = r"""async()=>{
  const n=__nnc,X=s=>n.ev(s),AU=X('AU');
  if(!AU.ctx){const C=window.AudioContext;const o=C.prototype.createDynamicsCompressor;window.__comps=[];
    C.prototype.createDynamicsCompressor=function(){const c=o.call(this);__comps.push(c);return c;};X('audioInit')();C.prototype.createDynamicsCompressor=o;}
  const ctx=AU.ctx;if(ctx.state!=='running')await ctx.resume();
  let gv=null;try{gv=X('SGRAV');}catch(_){}
  if(gv)for(let i=0;i<150&&!gv.pronto;i++)await new Promise(r=>setTimeout(r,100));   // espera o banco de sons gravados (v10.1)
  const fonte=AU.saida||(window.__comps&&__comps[0]);
  const sp=ctx.createScriptProcessor(4096,2,2);window.__rec={on:false,L:[],R:[]};
  sp.onaudioprocess=e=>{if(!__rec.on)return;__rec.L.push(e.inputBuffer.getChannelData(0).slice());__rec.R.push(e.inputBuffer.getChannelData(1).slice());};
  fonte.connect(sp);sp.connect(ctx.destination);window.__sp=sp;
  window.__recPara=()=>{__rec.on=false;const N=__rec.L.reduce((a,b)=>a+b.length,0),out=new Int16Array(N*2);let k=0;
    for(let c=0;c<__rec.L.length;c++){const L=__rec.L[c],R=__rec.R[c];for(let i=0;i<L.length;i++){out[k++]=Math.max(-32768,Math.min(32767,Math.round(L[i]*32767)));out[k++]=Math.max(-32768,Math.min(32767,Math.round(R[i]*32767)));}}
    __rec.L=[];__rec.R=[];const u=new Uint8Array(out.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
  return {sr:ctx.sampleRate,estado:ctx.state,fonte:AU.saida?'AU.saida':'compressor',musica:n.cfg.musica,efeitos:n.cfg.efeitos,gravados:gv?gv.pronto:null,grupos:gv?Object.keys(gv.buf).length:0,arquivos:gv?Object.values(gv.buf).reduce((a,b)=>a+b.length,0):0};}"""

def kpeso(x, sr):
    """filtro K (ITU-R BS.1770) com os coeficientes recalculados para a taxa"""
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = math.tan(math.pi * f0 / sr); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    b1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a1 = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, 0.5003270373238773; K = math.tan(math.pi * f0 / sr)
    b2 = [1, -2, 1]; a2 = [1, 2 * (K * K - 1) / (1 + K / Q + K * K), (1 - K / Q + K * K) / (1 + K / Q + K * K)]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)

def medir(x, sr):
    if len(x) == 0: return {}
    pico = float(np.max(np.abs(x))) + 1e-9; rms = float(np.sqrt(np.mean(x ** 2))) + 1e-9
    k = kpeso(x, sr); ms = np.mean(k ** 2, axis=0).sum(); lufs = -0.691 + 10 * np.log10(ms + 1e-12)
    w = int(0.4 * sr); st = -99.0   # maior volume em janela de 400 ms (o que o ouvido sente como "alto")
    if len(x) > w:
        e = np.cumsum(np.concatenate([[0], (k ** 2).sum(axis=1)])); m = (e[w:] - e[:-w]) / w
        st = float(-0.691 + 10 * np.log10(m.max() + 1e-12))
    return {'pico_dbfs': round(20 * np.log10(pico), 1), 'rms_dbfs': round(20 * np.log10(rms), 1), 'lufs': round(float(lufs), 1), 'lufs_400ms_max': round(st, 1)}

def wav(nome, x, sr):
    with wave.open(nome, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())

async def pega(pg):
    b = base64.b64decode(await pg.evaluate("()=>__recPara()"))
    return np.frombuffer(b, dtype='<i2').reshape(-1, 2).astype(np.float64) / 32767

async def gravar(pg, seg):
    await pg.evaluate("()=>{__rec.L=[];__rec.R=[];__rec.on=true;}")
    await pg.wait_for_timeout(int(seg * 1000))
    return await pega(pg)

async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        info = await pg.evaluate(PREP); sr = info['sr']; res['info'] = info
        await pg.evaluate("()=>{window.__semRender=true;}")
        # 1) menu (o menu não toca música: só o que a cena tiver)
        x = await gravar(pg, 16); wav(PRE + '_menu.wav', x, sr); res['menu'] = medir(x, sr)
        # 2) catálogo: sem música e sem os zumbis do menu, um efeito por vez
        await pg.evaluate("()=>{const n=__nnc;window.__musAnt=n.cfg.musica;n.cfg.musica=0;n.ev('audioVol')();n.Z.length=0;}")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{__rec.L=[];__rec.R=[];__rec.on=true;}")
        await pg.wait_for_timeout(300)
        for nome, extra, vol in SONS:
            await pg.evaluate("([a,e,v])=>{__nnc.ev('sfx')(a,undefined,undefined,v,e===null?undefined:e);}", [nome, extra, vol])
            await pg.wait_for_timeout(int(ESPACO * 1000))
        x = await pega(pg); wav(PRE + '_efeitos.wav', x, sr)
        env = np.abs(x).max(axis=1); ini = int(np.argmax(env > 10 ** (-60 / 20))); passo = int(ESPACO * sr); cat = {}
        for i, (nome, extra, vol) in enumerate(SONS):
            a = max(0, ini + i * passo - int(0.05 * sr)); z = a + passo
            cat[nome + ('/' + str(extra) if extra is not None else '')] = medir(x[a:z], sr)
        res['efeitos'] = cat
        await pg.evaluate("()=>{const n=__nnc;n.cfg.musica=window.__musAnt;n.ev('audioVol')();}")
        # 3) jogo de dia, na clareira: andar e golpear
        await pg.evaluate("()=>document.getElementById('m-novo').click()")   # sem mundos, o botão fica escondido atrás do cartão em destaque
        await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{try{if(__nnc.G.modo==='criacao')__nnc.ev('criaComecar')();}catch(e){}}")
        await pg.wait_for_function("__nnc.G.modo==='jogo'", timeout=240000, polling=250)
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;n.P.vida=100;window.__semRender=true;const t=document.getElementById('teclas');if(t)t.hidden=true;}")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{__rec.L=[];__rec.R=[];__rec.on=true;}")
        await pg.keyboard.down('w'); await pg.wait_for_timeout(5000); await pg.keyboard.up('w')
        for _ in range(4):
            await pg.mouse.click(480, 270); await pg.wait_for_timeout(900)
        await pg.wait_for_timeout(6000)
        x = await pega(pg); wav(PRE + '_dia.wav', x, sr); res['dia'] = medir(x, sr)
        # 4) noite
        await pg.evaluate("()=>{const n=__nnc;n.G.hora=21.5;n.Z.length=0;}")
        await pg.wait_for_timeout(2500)
        x = await gravar(pg, 14); wav(PRE + '_noite.wav', x, sr); res['noite'] = medir(x, sr)
        res['erros'] = erros[:10]
        await b.close()
    json.dump(res, open(PRE + '.json', 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(res, indent=1, ensure_ascii=False))

asyncio.run(main())

"""Monta a versão do jogo para o site, instalável como aplicativo (PWA): index.html, manifesto, service worker e ícones.
Usado pelo build.py depois de juntar o jogo. Saída: a pasta site/ ao lado do vaydr.html."""
import json, os
from PIL import Image, ImageDraw, ImageFilter

VERSAO = 'vaydr-v9-6'          # troque quando mudar a lista de arquivos do service worker
COR_FUNDO = '#070a09'

def _icone(tam, mascara=False, cantos=True):
    """V de estêncil cor de osso sobre o fundo escuro, com brilho de brasa embaixo; a versão "máscara" cabe no círculo seguro do Android."""
    S = 1000; k = 4; W = S * k
    fundo = Image.new('RGBA', (W, W), (11, 16, 14, 255))
    brilho = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(brilho).ellipse([W * 0.12, W * 0.62, W * 0.88, W * 1.18], fill=(194, 85, 29, 120))
    fundo = Image.alpha_composite(fundo, brilho.filter(ImageFilter.GaussianBlur(W * 0.09)))
    if cantos and not mascara:
        m = Image.new('L', (W, W), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.22), fill=255)
        base = Image.new('RGBA', (W, W), (0, 0, 0, 0)); base.paste(fundo, (0, 0), m)
    else:
        base = fundo
    esc = 0.8 if mascara else 1.0
    P = lambda x, y: (W / 2 + (x - 500) * k * esc, W / 2 + (y - 500) * k * esc)
    im = base.copy(); d = ImageDraw.Draw(im)
    d.polygon([P(165, 205), P(835, 205), P(500, 790)], fill=(236, 228, 210, 255))
    corte = Image.new('L', (W, W), 0); dc = ImageDraw.Draw(corte)
    dc.polygon([P(335, 205), P(665, 205), P(500, 560)], fill=255)          # o vão do V
    dc.rectangle([*P(150, 420), *P(850, 452)], fill=255)                  # a ponte do estêncil
    im.paste(base, (0, 0), corte)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([*P(330, 845), *P(670, 885)], radius=int(20 * k * esc), fill=(255, 138, 61, 255))   # traço de brasa
    return im.resize((tam, tam), Image.LANCZOS)

def icones(pasta):
    os.makedirs(pasta, exist_ok=True)
    _icone(192).save(os.path.join(pasta, 'icone-192.png'))
    _icone(512).save(os.path.join(pasta, 'icone-512.png'))
    _icone(512, mascara=True).save(os.path.join(pasta, 'icone-mascara-512.png'))
    _icone(180, cantos=False).convert('RGB').save(os.path.join(pasta, 'apple-touch-icon.png'))
    _icone(48).save(os.path.join(pasta, 'favicon-48.png'))

MANIFESTO = {
    "name": "VAYDR", "short_name": "VAYDR", "lang": "pt-BR", "dir": "ltr",
    "description": "Sobrevivência com zumbis para PC e celular. Sobreviver é construir.",
    "id": "./", "start_url": "./", "scope": "./",
    "display": "fullscreen", "display_override": ["fullscreen", "standalone"],
    "orientation": "any", "background_color": COR_FUNDO, "theme_color": COR_FUNDO, "categories": ["games"],
    "icons": [
        {"src": "icones/icone-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icones/icone-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icones/icone-mascara-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}

SW = r"""/* VAYDR: service worker do site. Guarda o jogo para abrir sem internet e atualiza sozinho quando há versão nova. */
const VERSAO='__VERSAO__';
const ARQS=['./','index.html','manifest.webmanifest','icones/icone-192.png','icones/icone-512.png','icones/icone-mascara-512.png','icones/apple-touch-icon.png','icones/favicon-48.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('vaydr-')&&k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* a página do jogo: tenta a internet primeiro (pega a versão nova), com até 6 s; sem resposta, abre a cópia guardada */
function paginaRede(req){return new Promise(ok=>{let feito=false;const t=setTimeout(()=>{if(!feito)caches.match('index.html').then(m=>{if(m&&!feito){feito=true;ok(m);}});},6000);
  fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(VERSAO).then(x=>x.put('index.html',c));}if(!feito){feito=true;clearTimeout(t);ok(r);}})
    .catch(()=>caches.match('index.html').then(m=>{if(!feito){feito=true;clearTimeout(t);ok(m||Response.error());}}));});}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'&&u.origin===location.origin){e.respondWith(paginaRede(r));return;}
  /* ícones, manifesto e as fontes do Google: a cópia guardada primeiro; o que vier da internet fica guardado.
     As fontes têm prazo de 4 s: com internet ruim ou sem internet, o jogo abre com a letra reserva em vez de ficar esperando. */
  const fonte=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(u.origin===location.origin||fonte){
    e.respondWith(caches.match(r).then(m=>m||comPrazo(fetch(r),fonte?4000:20000).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(VERSAO).then(x=>x.put(r,c));}return res;})
      .catch(()=>u.hostname==='fonts.googleapis.com'?new Response('',{headers:{'Content-Type':'text/css'}}):Response.error())));}});
function comPrazo(p,ms){return Promise.race([p,new Promise((_,n)=>setTimeout(()=>n(new Error('prazo')),ms))]);}
"""

CABECA = ('<link rel="manifest" href="manifest.webmanifest">'
          '<meta name="theme-color" content="' + COR_FUNDO + '">'
          '<meta name="mobile-web-app-capable" content="yes">'
          '<meta name="apple-mobile-web-app-capable" content="yes">'
          '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
          '<meta name="apple-mobile-web-app-title" content="VAYDR">'
          '<meta name="application-name" content="VAYDR">'
          '<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">'
          '<link rel="icon" type="image/png" sizes="48x48" href="icones/favicon-48.png">'
          '<link rel="icon" type="image/png" sizes="192x192" href="icones/icone-192.png">')

BOTAO = '<button class="btn" id="m-instalar" type="button" hidden>Instalar o jogo</button>'

# instala: Android/PC (Chrome, Edge) pelo pedido do navegador; iPhone e iPad pelo menu Compartilhar do Safari
SCRIPT = r"""<script>
(()=>{'use strict';
  const b=document.getElementById('m-instalar'),aviso=document.getElementById('m-aviso');let pedido=null;
  const instalado=()=>matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const avisar=t=>{if(aviso){aviso.textContent=t;aviso.hidden=false;}};
  if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>console.warn('service worker',e));});
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();pedido=e;if(b&&!instalado())b.hidden=false;});
  addEventListener('appinstalled',()=>{pedido=null;if(b)b.hidden=true;avisar('VAYDR instalado! Abra pelo ícone na tela inicial.');});
  if(b&&ios&&!instalado())b.hidden=false;
  if(b)b.addEventListener('click',async()=>{
    if(pedido){pedido.prompt();try{const r=await pedido.userChoice;if(r&&r.outcome==='accepted')b.hidden=true;}catch(_){}pedido=null;return;}
    if(ios)avisar('No iPhone e no iPad: toque em Compartilhar (o quadrado com a seta) e depois em "Adicionar à Tela de Início".');
    else avisar('Use o menu do navegador (⋮) e escolha "Instalar app" ou "Adicionar à tela inicial".');});
})();
</script>"""

LEIA = """VAYDR NO SITE: JOGO INSTALÁVEL (aplicativo web)
================================================

O QUE TEM NESTA PASTA
- index.html ............ o jogo (o mesmo do VAYDR.html, com o que o celular precisa para instalar)
- manifest.webmanifest .. nome, ícone e cores do aplicativo
- sw.js ................. guarda o jogo no aparelho: depois da primeira vez, abre até sem internet
- icones/ ............... ícones do aplicativo

COMO COLOCAR NO SITE
1. Suba TODOS os arquivos desta pasta para a mesma pasta do site (mantendo a pasta icones/ junto).
   Exemplo: https://seusite.com.br/jogo/index.html, .../jogo/sw.js, .../jogo/icones/...
2. O site precisa abrir com https:// (cadeado). Sem https o navegador não deixa instalar.
   Hospedagens como Netlify, Vercel, GitHub Pages e Cloudflare Pages já dão https de graça.
3. Teste abrindo o endereço no Chrome do celular.

COMO A PESSOA INSTALA
- Android (Chrome, Samsung Internet) e PC (Chrome, Edge): no menu do jogo aparece o botão "Instalar o jogo".
  Também dá pelo menu do navegador (⋮ → "Instalar app" ou "Adicionar à tela inicial").
- iPhone e iPad (Safari): botão Compartilhar → "Adicionar à Tela de Início".
- Instalado, o VAYDR abre em tela cheia pelo ícone, como um aplicativo.

ATUALIZAR O JOGO
- Troque o index.html no site pelo novo. Quem tem o jogo instalado pega a versão nova na próxima vez que abrir
  com internet (sem internet, abre a última versão guardada).
- Os salvamentos ficam no aparelho e continuam depois da atualização.

OBSERVAÇÕES
- Abrindo o index.html direto do computador (dois cliques), o jogo funciona, mas não instala: precisa estar no site.
- As fontes do jogo vêm do Google Fonts na primeira vez; depois ficam guardadas junto com o jogo.
"""

def montar(out, skel, dest_pasta):
    """out: a página do jogo (page.html com o JS dentro); skel: o começo do documento (head) usado no test.html."""
    os.makedirs(dest_pasta, exist_ok=True)
    ic = os.path.join(dest_pasta, 'icones')
    if not os.path.exists(os.path.join(ic, 'icone-mascara-512.png')): icones(ic)
    cab = skel.replace('<html>', '<html lang="pt-BR">').replace('</head>', CABECA + '</head>')
    menu = '<button class="btn" id="m-ajuda" type="button">Como jogar</button>'
    assert out.count(menu) == 1, 'botão Como jogar não achado'
    pag = out.replace(menu, menu + BOTAO)
    open(os.path.join(dest_pasta, 'index.html'), 'w', encoding='utf-8').write(cab + pag + SCRIPT + '</body></html>')
    json.dump(MANIFESTO, open(os.path.join(dest_pasta, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(dest_pasta, 'sw.js'), 'w', encoding='utf-8').write(SW.replace('__VERSAO__', VERSAO))
    open(os.path.join(dest_pasta, 'LEIA-ME-SITE.txt'), 'w', encoding='utf-8').write(LEIA)
    return os.path.join(dest_pasta, 'index.html')

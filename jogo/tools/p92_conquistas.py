"""p92: conquistas, recordes, tela de conquistas, modo foto e música dinâmica."""
import json, os
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "vivo=()=>{if(!P.alive){n.renascer();}G.modo='jogo';P.vida=100;},r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def tela(nome):
    return [js("window.__turbo=1;window.__semRender=false;"), ["wait", 2.2], ["shot", nome], js("window.__semRender=true;window.__turbo=6;")]
steps = [["wait", 2], ["js", "localStorage.removeItem('nnc_conq');localStorage.removeItem('nnc_recordes');"], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;"),
         ["gwait", 0.3]]
# conquistas: por evento (contador) e direta
steps += [js("for(let i=0;i<100;i++)n.conqEvento('kill',1);n.conquista('caramelo');n.conqEvento('noiteSobrevivida',1);"), ["wait", 1.0],
          ev("conquistas", "return{feitas:Object.keys(n.CQ.f).join(','),kills:n.CQ.c.kill,toast:[...document.querySelectorAll('.toast h4')].map(h=>h.textContent).filter(t=>/Conquista/.test(t)).length,salvo:!!localStorage.getItem('nnc_conq')};")]
# recordes: amanhecer guarda a partida
steps += [js("G.noiteN=3;G.kills=42;n.conqAmanhece();n.conqAmanhece();"), ev("recordes", "return JSON.parse(localStorage.getItem('nnc_recordes')||'[]');")]
# tela de conquistas e de recordes
steps += [js("n.pausar?n.pausar():null;G.modo='pausa';n.abrirConquistas('t-pausa');"), ["wait", 0.6],
          ev("tela_conq", "const t=document.getElementById('t-conquistas');return{aberta:!t.hidden,itens:t.querySelectorAll('.cq-lista li').length,ok:t.querySelectorAll('.cq-lista li.ok').length,resumo:document.getElementById('cq-resumo').textContent};")]
steps += tela("320_conquistas.png")
steps += [js("document.querySelector('#t-conquistas [data-aba=rec]').click();"), ["wait", 0.4],
          ev("tela_rec", "return{itens:[...document.querySelectorAll('#cq-lista li')].map(l=>l.textContent).slice(0,3),online:!document.getElementById('cq-aba-online').hidden};")]
steps += tela("321_recordes.png")
steps += [js("document.getElementById('cq-voltar').click();"), ev("voltou", "return{pausa:!document.getElementById('t-pausa').hidden};")]
# modo foto
steps += [js("document.getElementById('p-foto').click();"), ["wait", 0.5],
          ev("foto_aberto", "return{modo:G.modo,ui:!document.getElementById('foto-ui').hidden,hud:document.getElementById('hud').classList.contains('oculto'),classe:document.body.classList.contains('modo-foto')};"),
          js("n.FOTO.filtro=2;n.FOTO.hora=3;n.FOTO.dist=5;n.FOTO.yaw+=0.8;n.fotoUI();"), ["wait", 1.0]]
steps += tela("322_modo_foto.png")
steps += [["js", "window.__f=null;__nnc.fotoTirar().then(b=>{window.__f=b?b.size:0;});"], ["wait", 3.0],
          ev("foto_tirada", "return{bytes:window.__f};"),
          js("n.fotoFechar();"), ev("foto_fechado", "return{modo:G.modo,ui:!document.getElementById('foto-ui').hidden,filtro:document.getElementById('cena').style.filter};"),
          js("document.getElementById('p-voltar').click();")]
# música: combate e chefe mudam as camadas
steps += [js("vivo();Z.length=0;vai(F[0]+30,F[2]+30);for(let k=0;k<3;k++){const q=n.criarZ('walker',P.x+3+k,P.z+3);q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;}"), ["gwait", 2.0],
          ev("musica_combate", "return{ctx:n.AU.ctx?n.AU.ctx.state:null,tens:r2(n.AU.tens),comb:r2(n.AU.comb||0)};"),
          js("Z.length=0;const q=n.criarZ('acougueiro',P.x+12,P.z+12);q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;P.vida=100;"), ["gwait", 3.0],
          ev("musica_chefe", "return{boss:r2(n.AU.boss||0)};"), js("Z.length=0;")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p92.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))

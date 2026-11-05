"""p170: controles e interface (Etapa 11). Troca de teclas pela tela nova (pular no X; usar no F troca com a lanterna; tecla fixa
recusada; Esc cancela), as teclas novas funcionando no jogo (X pula e Espaço não; E acende a lanterna; F abre a porta), dicas da
tela com as teclas novas, voltar às teclas de fábrica; ajustes novos (olhar invertido, sensibilidade do controle, distância da
câmera, tamanho da interface); controle (gamepad simulado): Start pausa com o botão principal já escolhido, direcional anda pelo
menu, A aperta (Mapa), B fecha, diário com LB/RB trocando a aba, Select abre a mochila (RB vai para Fabricar, B fecha), Select
segurado abre o mapa, construção pelo controle (↓ entra, → troca a peça, LB troca a aba, Y conserta tudo, B sai), controle
deslizante pelo direcional, teclado de senha pelo controle; diário com a aba Receitas e a receita aprendida no histórico."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const ae=()=>document.activeElement&&(document.activeElement.id||document.activeElement.dataset.k||document.activeElement.textContent.trim().slice(0,20)),vis=id=>{const e=document.getElementById(id);return!!(e&&!e.hidden);};")
PAD = ("window.__pad={connected:true,id:'teste',buttons:[...Array(17)].map(()=>({pressed:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad];n.ev('GP.ativo=true');"
       "window.__bt=(i,v)=>{window.__pad.buttons[i].pressed=!!v;window.__pad.buttons[i].value=v?1:0;};"
       # toque: o botão fica apertado por 3 quadros da página e solta (não depende do relógio do teste)
       "window.__btQ=i=>{window.__btAtivo=true;window.__bt(i,1);let f=0;const st=()=>{if(++f>=3){window.__bt(i,0);requestAnimationFrame(()=>requestAnimationFrame(()=>{window.__btAtivo=false;}));}else requestAnimationFrame(st);};requestAnimationFrame(st);};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
def bt(i, segura=0.15, depois=0.2):   # aperta e solta um botão do controle
    if segura >= 0.5:   # segurado de propósito (Select segurado abre o mapa): segura até o jogo contar 0,6 s de botão apertado
        return [js("window.__bt(%d,1);" % i), ["until", "()=>__nnc.ev('GP2.selT')>=0.6||__nnc.G.modo==='mapa'", 60], js("window.__bt(%d,0);" % i), ["wait", depois]]
    # toque: 3 quadros apertado (com 0,15 s de relógio, às vezes nenhum quadro lia o controle e o toque se perdia)
    return [js("window.__btQ(%d);" % i), ["until", "()=>!window.__btAtivo", 30], ["wait", depois]]
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};n.ev(\"{const _p=pular;pular=function(){window.__pulos=(window.__pulos||0)+1;return _p.apply(this,arguments);};}\");")]
# ---- tela de teclas ----
s += [j("n.pausar();document.getElementById('p-ajustes').click();document.getElementById('aj-teclas-btn').click();"), ["wait", 0.3],
      e("telaTeclas", "return{tela:vis('t-teclas'),linhas:document.querySelectorAll('#tk-lista [data-tk]').length,pad:document.querySelectorAll('#tk-pad b').length,pular:document.querySelector('[data-tk=pular]').textContent};"),
      j("document.querySelector('[data-tk=pular]').click();"), ["wait", 0.2],
      e("ouvindo", "return{botao:document.querySelector('[data-tk=pular]').textContent,msg:document.getElementById('tk-msg').textContent};"),
      ["press", "KeyX"], ["wait", 0.2],
      e("pularNoX", "return{mapa:n.cfg.mapaTeclas,botao:document.querySelector('[data-tk=pular]').textContent,trad:X('TRAD'),msg:document.getElementById('tk-msg').textContent};"),
      j("document.querySelector('[data-tk=usar]').click();"), ["press", "KeyF"], ["wait", 0.2],
      e("usarNoF", "return{mapa:n.cfg.mapaTeclas,lanterna:document.querySelector('[data-tk=lanterna]').textContent,msg:document.getElementById('tk-msg').textContent};"),
      j("document.querySelector('[data-tk=mapa]').click();"), ["press", "Tab"], ["wait", 0.2],
      e("teclaFixa", "return{msg:document.getElementById('tk-msg').textContent,mapa:n.cfg.mapaTeclas.mapa||null,ouvindo:!!document.querySelector('#tk-lista .ouvindo')};"),
      ["press", "Escape"], ["wait", 0.2],
      e("cancelou", "return{msg:document.getElementById('tk-msg').textContent,ouvindo:!!document.querySelector('#tk-lista .ouvindo'),tela:vis('t-teclas')};"),
      j("document.getElementById('tk-ok').click();"), ["wait", 0.2],
      e("voltouAjustes", "return{ajustes:vis('t-ajustes')};"),
      j("document.getElementById('aj-ok').click();G.modo='jogo';X('tela')(null);"), ["gwait", 0.3]]
# ---- as teclas novas no jogo ----
s += [j("const g=X('ground');vai(F[0]+6,F[2]+14);const o=X('criarObra')('portaMadeira',P.x,P.z+1.3,0);window.__po=o;P.yaw=0;P.body=0;P.pitch=0;window.__pulos=0;window.__lant=P.lanterna;"), ["gwait", 0.4],
      ["press", "KeyX"], ["gwait", 0.6], ["press", "Space"], ["gwait", 0.6],
      e("pulos", "return{pulos:window.__pulos};"),
      ["press", "KeyE"], ["gwait", 0.2],
      e("lanternaNoE", "return{antes:window.__lant,agora:P.lanterna};"),
      e("alvo", "const a=X('alvoInter');return a&&a.k;"),
      ["press", "KeyF"], ["gwait", 0.4],
      e("portaNoF", "return{aberta:!!window.__po.ext.aberta};"),
      e("dicas", "return{teclas:document.getElementById('teclas').textContent.replace(/\\s+/g,' ').trim(),lanterna:document.querySelector('#u-lanterna kbd').textContent,prompt:document.querySelector('#prompt kbd').textContent};"),
      j("X('ajustesUI')();document.getElementById('aj-teclas-btn')&&0;X('abrirTeclas')();document.getElementById('tk-padrao').click();document.getElementById('tk-ok').click();G.modo='jogo';X('tela')(null);window.__pulos=0;"), ["gwait", 0.3],
      ["press", "Space"], ["gwait", 0.6],
      e("padrao", "return{mapa:n.cfg.mapaTeclas,trad:X('TRAD'),pulos:window.__pulos,lanterna:document.querySelector('#u-lanterna kbd').textContent};")]
# ---- ajustes novos ----
s += [j("n.pausar();document.getElementById('p-ajustes').click();document.querySelector('#aj-invy [data-v=\"1\"]').click();document.querySelector('#aj-hud [data-v=\"1.15\"]').click();"
        "const r=document.getElementById('aj-camdist');r.value='1.4';r.dispatchEvent(new Event('input',{bubbles:true}));const s2=document.getElementById('aj-sensgp');s2.value='1.8';s2.dispatchEvent(new Event('input',{bubbles:true}));"), ["wait", 0.2],
      e("ajustes", "const h=document.getElementById('hud');const p0=P.pitch;X('olhar')(0,40,0.002);const sobe=P.pitch>p0;P.pitch=p0;"
                   "return{invY:n.cfg.invY,olharSobeComMouseParaBaixo:sobe,hudEsc:n.cfg.hudEsc,hudClasse:h.classList.contains('esc'),hudVar:h.style.getPropertyValue('--hud-esc'),camDist:n.cfg.camDist,sensGP:n.cfg.sensGP,"
                   "rotulos:{camdist:document.getElementById('aj-camdist-v').textContent,sensgp:document.getElementById('aj-sensgp-v').textContent},pressionado:document.querySelector('#aj-invy [aria-pressed=\"true\"]').textContent};"),
      j("document.getElementById('aj-ok').click();G.modo='jogo';X('tela')(null);n.cfg.cam='3';vai(F[0]+8,F[2]+20);P.yaw=0;P.pitch=0.1;n.cfg.camDist=1;"), ["wait", 2.5],
      e("camPerto", "return r2(Math.hypot(X('cam').pos[0]-P.x,X('cam').pos[2]-P.z));"),
      j("n.cfg.camDist=1.4;"), ["wait", 2.5],
      e("camLonge", "return r2(Math.hypot(X('cam').pos[0]-P.x,X('cam').pos[2]-P.z));"),
      j("n.cfg.camDist=1;n.cfg.invY=0;n.cfg.hudEsc=1;X('aplicarCfg')();")]
# ---- controle (gamepad simulado) ----
s += [js(PAD), ["gwait", 0.2]]
s += bt(9) + [e("startPausa", "return{modo:G.modo,foco:ae()};")]
s += bt(13) + bt(13) + [e("desceu2", "return{foco:ae()};")]
s += [j("document.getElementById('p-mapa').focus();")] + bt(0, 0.15, 0.3) + [e("aMapa", "return{modo:G.modo,mapa:vis('t-mapa')};")]
s += bt(1, 0.15, 0.3) + [e("bFechaMapa", "return{modo:G.modo};")]
s += bt(9) + [j("document.getElementById('p-diario').focus();")] + bt(0, 0.15, 0.3) + [e("diario", "return{tela:vis('t-diario'),aba:document.querySelector('.dr-aba[aria-pressed=\"true\"]').dataset.aba};")]
s += bt(5) + [e("rbAba", "return{aba:document.querySelector('.dr-aba[aria-pressed=\"true\"]').dataset.aba};")]
s += bt(4) + bt(4) + [e("lbAba", "return{aba:document.querySelector('.dr-aba[aria-pressed=\"true\"]').dataset.aba};")]
s += bt(1, 0.15, 0.3) + [e("bVoltaPausa", "return{modo:G.modo,pausa:vis('t-pausa'),diario:vis('t-diario')};")]
s += bt(1, 0.15, 0.3) + [e("bVoltaJogo", "return{modo:G.modo};")]
s += bt(8, 0.12, 0.3) + [e("selectMochila", "return{modo:G.modo,inv:vis('inv')};")]
s += bt(5) + [e("rbFabricar", "return{fabricar:document.getElementById('aba-fabricar').getAttribute('aria-pressed')};")]
s += bt(1, 0.15, 0.3) + [e("bFechaMochila", "return{modo:G.modo,inv:vis('inv')};")]
s += bt(8, 0.9, 0.3) + [e("selectSegurado", "return{modo:G.modo,mapa:vis('t-mapa')};")]
s += bt(1, 0.15, 0.3)
# construção pelo controle
s += [j("window.__danif=X('OB').find(o=>o.tipo==='portaMadeira');window.__danif.hp=window.__danif.hpMax*0.5;n.invAdd('tabuas',20);n.invAdd('pregos',20);")]
s += bt(13, 0.12, 0.3) + [e("construir", "return{ativo:X('OBRA').ativo,tipo:X('OBRA').tipo,cat:X('obraCat')(X('OBRA').tipo)};")]
s += bt(15) + [e("pecaSeguinte", "return{tipo:X('OBRA').tipo};")]
s += bt(4) + [e("abaSeguinte", "return{tipo:X('OBRA').tipo,cat:X('obraCat')(X('OBRA').tipo)};")]
s += bt(3) + [e("yConserta", "return{hpPorta:r2(window.__danif.hp/window.__danif.hpMax)};")]
s += bt(1, 0.15, 0.3) + [e("bSai", "return{ativo:X('OBRA').ativo,agachado:!!P.agachado};")]
# controle deslizante e teclado de senha pelo controle
s += bt(9) + [j("document.getElementById('p-ajustes').click();"), ["wait", 0.2], j("window.__s0=n.cfg.sens;document.getElementById('aj-sens').focus();")] + bt(15) + bt(15) + \
     [e("deslizante", "return{antes:window.__s0,depois:n.cfg.sens};"), j("document.getElementById('aj-ok').click();G.modo='jogo';X('tela')(null);window.__abriu=0;"
        "X('abrirTeclado')({x:P.x,z:P.z,titulo:'Teste',codigo:()=>'1111',abrir:()=>{window.__abriu=1;}});"), ["wait", 0.3],
      e("tecladoFoco", "return{modo:G.modo,foco:ae()};"), j("document.querySelector('#tc-teclas [data-k=\"1\"]').focus();")] + bt(0) + bt(0) + bt(0) + bt(0) + \
     [j("document.querySelector('#tc-teclas [data-k=\"ok\"]').focus();")] + bt(0, 0.15, 0.3) + [e("tecladoPeloControle", "return{abriu:window.__abriu,modo:G.modo};")]
# ---- diário: receitas ----
s += [j("n.invAdd('sucata',1);"), ["gwait", 0.3],
      e("aprendeu", "const D=G.diario;return{historico:D.ev.filter(q=>q.cat==='receita').map(q=>q.txt),rec:Object.keys(D.rec||{})};"),
      j("X('abrirDiario')('t-pausa');document.querySelector('.dr-aba[data-aba=\"rec\"]').click();"), ["wait", 0.2],
      e("abaReceitas", "const L=[...document.querySelectorAll('#dr-lista li')];return{resumo:document.getElementById('dr-resumo').textContent,grupos:L.filter(l=>l.classList.contains('dr-grupo')).map(l=>l.textContent),itens:L.filter(l=>!l.classList.contains('dr-grupo')).length,"
                       "pregos:(L.find(l=>/Pregos/.test(l.textContent))||{}).textContent};"),
      j("document.getElementById('dr-voltar').click();G.modo='jogo';X('tela')(null);")]
# ---- salvar e carregar mantém a troca de teclas ----
s += [j("n.cfg.mapaTeclas={pular:'KeyX'};n.saveCfg&&n.saveCfg();X('saveCfg')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.4]]
s += [ev("depoisDeRecarregar", "return{mapa:n.cfg.mapaTeclas,trad:X('TRAD'),dica:document.getElementById('teclas').textContent.includes('X pula')};"),
      js("n.cfg.mapaTeclas={};X('saveCfg')();")]
salvar('p170.json', s)

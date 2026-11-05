"""p170f: fotos da Etapa 11: tela de troca de teclas (com teclas trocadas), ajustes novos, pausa com o foco do controle,
diário na aba Receitas, e o HUD num monitor 1920x1080 (normal e com a interface grande)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
PAD = ("window.__pad={connected:true,id:'teste',buttons:[...Array(17)].map(()=>({pressed:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad];n.ev('GP.ativo=true');"
       "window.__bt=(i,v)=>{window.__pad.buttons[i].pressed=!!v;window.__pad.buttons[i].value=v?1:0;};")
def bt(i, segura=0.15, depois=0.25):
    return [js("window.__bt(%d,1);" % i), ["wait", segura], js("window.__bt(%d,0);" % i), ["wait", depois]]
def plano(vp):
    s = inicio("window.__turbo=6;window.__semRender=true;")
    s += [js("vivo();Z.length=0;G.hora=15;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};n.invAdd('sucata',2);n.invAdd('couro',1);vai(F[0]+5,F[2]+7);P.yaw=2.6;P.body=P.yaw;")]
    return s
s = plano((1280, 720))
s += [js("n.cfg.mapaTeclas={pular:'KeyX',usar:'KeyF',lanterna:'KeyE'};X('montarTraducao')();X('rotulosTeclas')();n.pausar();document.getElementById('p-ajustes').click();document.getElementById('aj-teclas-btn').click();")]
s += foto('p170_teclas.png', "", 0.2, 2.5)
s += [js("document.getElementById('tk-ok').click();document.querySelector('.tela:not([hidden])').scrollTop=520;")]
s += foto('p170_ajustes.png', "", 0.2, 2.5)
s += [js("document.getElementById('aj-ok').click();n.ev(\"G.modo='jogo';tela(null);\");n.cfg.mapaTeclas={};X('montarTraducao')();X('rotulosTeclas')();" + PAD), ["gwait", 0.3]]
s += bt(9) + bt(13) + bt(13)
s += foto('p170_pausa_controle.png', "", 0.1, 2.0)
s += [js("X('abrirDiario')('t-pausa');document.querySelector('.dr-aba[data-aba=\"rec\"]').click();")]
s += foto('p170_diario_receitas.png', "", 0.1, 2.5)
s += [js("document.getElementById('dr-voltar').click();n.ev(\"G.modo='jogo';tela(null);\");")]
salvar('p170f.json', s)
s2 = plano((1920, 1080))
s2 += [js("vai(F[0]+5,F[2]+7);P.yaw=2.6;")]
s2 += foto('p170_hud_1080.png', "", 0.5, 3.0)
s2 += [js("n.cfg.hudEsc=1.15;X('aplicarCfg')();")]
s2 += foto('p170_hud_1080_grande.png', "", 0.3, 3.0)
s2 += [js("n.cfg.hudEsc=1;X('aplicarCfg')();")]
salvar('p170g.json', s2, (1920, 1080))

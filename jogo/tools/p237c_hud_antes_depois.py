"""p237c (11/11): fotos de antes e depois do HUD, do mesmo lugar e com os mesmos valores, nas duas versões.
Uso: SRC=x_base.html python3 run.py ... com o roteiro de  python3 tools/p237c_hud_antes_depois.py antes
     SRC=x_hud.html  python3 run.py ... com o roteiro de  python3 tools/p237c_hud_antes_depois.py depois
1 tudo bem, de dia (fome e sede um pouco gastas)
2 com muita sede, fome baixa, perdendo vida e quase sem fôlego
3 a mochila aberta numa noite fria"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
q = sys.argv[1] if len(sys.argv) > 1 else 'depois'
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=10.5;P.vida=100;P.fome=80;P.sede=74;P.sono=90;P.energia=100;window.__cadaPasso=()=>{__nnc.Z.length=0;};"), ["gwait", 3.5]]
s += foto(q + "_hud_normal.png", "vai(F[0]+6,F[2]-9);P.yaw=2.4;P.body=P.yaw;P.pitch=-0.05;", 0.3, 3.0)
# muita sede, fome baixa, vida caindo, fôlego quase no fim
s += [js("P.sede=9;P.fome=27;P.sono=55;P.energia=22;P.vida=60;"), ["gwait", 1.5],
      js("window.__perde=true;window.__cadaPasso=()=>{__nnc.Z.length=0;if(window.__perde&&__nnc.P.vida>35)__nnc.P.vida-=0.25;__nnc.P.energia=22;};"), ["gwait", 2.0]]
s += foto(q + "_hud_baixo.png", "window.__perde=false;", 0.1, 3.0)
s += [js("window.__cadaPasso=()=>{__nnc.Z.length=0;};")]
# mochila aberta numa noite fria
s += [js("P.vida=76;P.energia=58;P.fome=32;P.sede=41;P.sono=80;window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.energia=58;};G.hora=2;n.ev('E').n=1;X('abrirMochila')('mochila');window.__semRender=false;window.__turbo=1;"),
      ["wait", 2.5], ["shot", q + "_hud_mochila.png"],
      js("document.getElementById('inv').hidden=true;window.__semRender=true;window.__turbo=6;G.hora=10.5;n.ev('E').n=0;")]
salvar('tools/p237c_' + q + '.json', s, vp=(1280, 720))

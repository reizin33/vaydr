"""p237b (11/11): o HUD novo do PC em vários tamanhos de janela, com o quadro de comandos aparecendo (os primeiros 4 minutos).
Nada se sobrepõe: barra rápida, nome do item, botões de baixo, ícones do DayZ, barra de fôlego, comandos, rádio; e tudo cabe na tela."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
OV = ("const R=s=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||e.closest('[hidden]'))return null;"
      "const r=e.getBoundingClientRect();return r.width?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null;};"
      "const o={slots:R('#slots'),nome:R('#item-nome'),util:R('#util'),dz:R('#dz'),folego:R('#dz-folego'),teclas:R('#teclas'),radio:R('.radio'),nivel:R('.vitais .nivel'),extras:R('.vitais .extras'),arma:R('#arma')};"
      "const ov=(a,b)=>a&&b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];const ks=Object.keys(o);o.sobrepoe=[];"
      "for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)if(ov(o[ks[i]],o[ks[j]]))o.sobrepoe.push(ks[i]+'+'+ks[j]);"
      "const W=innerWidth,H=innerHeight;o.foraDaTela=ks.filter(k=>Array.isArray(o[k])&&(o[k][0]<-1||o[k][1]<-1||o[k][2]>W+1||o[k][3]>H+1));o.tam=[W,H];return o;")
def plano(nome, vp):
    st = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
          js("n.cfg.graf='medio';n.aplicarCfg&&n.aplicarCfg();G.hora=10;Z.length=0;X('FAUNA_POP').ativosMax=0;P.vida=100;P.energia=40;P.sede=30;n.invAdd('machado',1);const Fi=X('FIRE');vai(Fi[0]+5,Fi[2]+4);"),
          ["gwait", 1.0], ev("hud", OV)]
    if nome == '1280x720':
        st += [js("G.modo='pausa';window.__semRender=false;window.__turbo=1;"), ["wait", 3], ["shot", "hud_comandos.png"], js("G.modo='jogo';window.__semRender=true;window.__turbo=6;")]
    return [nome, {"viewport": {"width": vp[0], "height": vp[1]}}, st]
plan = [plano('%dx%d' % t, t) for t in ((1920, 1080), (1600, 900), (1366, 768), (1280, 720), (1100, 650), (1000, 560), (900, 600))]
json.dump(plan, open('tools/p237b_hud_tamanhos.json', 'w'), ensure_ascii=False)
print('ok')

"""p117: HUD no jogo em celular (em pé e deitado), tablet e PC: nada se sobrepõe à barra rápida e tudo cabe na tela."""
import sys,os,json;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
OV=("const R=s=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||e.closest('[hidden]'))return null;const r=e.getBoundingClientRect();return r.width?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null;};"
    "const o={slots:R('#slots'),nome:R('#item-nome'),vitais:R('.vitais'),dir:R('.dir'),esq:R('.esq'),teclas:R('#teclas'),util:R('#util'),radio:R('.radio'),mapa:R('.mapa'),joy:R('#joy')||R('.joy')};"
    "const ov=(a,b)=>a&&b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];o.sobrepoe=[];for(const k of['vitais','dir','esq','teclas','util','radio','joy'])if(ov(o.slots,o[k])||ov(o.nome,o[k]))o.sobrepoe.push(k);"
    "const W=innerWidth,H=innerHeight;o.foraDaTela=Object.keys(o).filter(k=>Array.isArray(o[k])&&o[k].length===4&&(o[k][0]<-1||o[k][1]<-1||o[k][2]>W+1||o[k][3]>H+1));o.tam=[W,H];o.rolagem=document.documentElement.scrollWidth>W;return o;")
def plano(nome, vp, extra={}):
    st=[["wait",2.5],["click","#m-novo"],["wait",1.5],
        js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();G.hora=10;Z.length=0;X('FAUNA_POP').ativosMax=0;n.invAdd('machado',1);n.invAdd('pedra',5);n.invAdd('feijao',2);n.invAdd('agua',1);const Fi=X('FIRE');vai(Fi[0]+5,Fi[2]+4);P.yaw=P.body=2.4;"),
        ["gwait",0.5], js("G.modo='pausa';window.__semRender=false;window.__turbo=1;"), ["wait",4], ["shot","650_hud_%s.png"%nome], js("G.modo='jogo';window.__semRender=true;window.__turbo=6;"),
        ev("hud", OV)]
    o={"viewport":{"width":vp[0],"height":vp[1]}};o.update(extra)
    return [nome,o,st]
plan=[plano("celular_pe",(390,844),{"is_mobile":True,"has_touch":True,"device_scale_factor":2}),
      plano("celular_deitado",(844,390),{"is_mobile":True,"has_touch":True,"device_scale_factor":2}),
      plano("tablet",(1340,800),{"is_mobile":True,"has_touch":True}),
      plano("pc",(1366,768))]
json.dump(plan,open('p117.json','w'),ensure_ascii=False)
print('ok')

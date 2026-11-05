"""p212d: depuração — por que as fotos dos degraus e do planalto estouram o tempo (p209f e p211f) e as da cachoeira e da beira
não: mede, em cada um desses lugares, quanto tempo leva cada quadro desenhado, quantos zumbis o jogo cria por segundo e quantos
existem, com o teste apagando os zumbis a cada passo (como nas fotos) e só marcando como mortos (como no p208f)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cam1=()=>{n.cfg.cam='1';},hora=h=>{G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y===undefined?X('chaoEm')(x,z,X('ground')(x,z)+1):y);P.vx=P.vz=0;};"
     "const zera=()=>{window.__perf={passo:0,veg:0,render:0,hud:0,n:0};window.__nz0=window.__nz;window.__t0=performance.now();},"
     "mede=()=>{const p=window.__perf,dt=(performance.now()-window.__t0)/1000;return{quadros:p.n,segundos:Math.round(dt),msDesenho:p.n?Math.round(p.render/p.n):null,msPasso:p.n?Math.round(p.passo/p.n*10)/10:null,"
     "zumbisCriados:window.__nz-window.__nz0,zumbis:Z.length,vivos:Z.filter(z=>z.vivo).length,arvLonge:X('GF')().arvLonge,brenha:X('MESH').brenha.n};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
def lugar(nome, c, apaga=True):
    limpa = "window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};" if apaga else "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};"
    return [j(limpa + "window.__semRender=true;window.__turbo=6;hora(11);cam1();" + c), ["gwait", 1.0, 600],
            j("window.__semRender=false;window.__turbo=1;zera();"), ["wait", 25], e(nome, "const r=mede();window.__semRender=true;window.__turbo=6;return r;")]
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;X('perfDone=true');window.__nz=0;"
         "X(\"{const _c=criarZ;criarZ=function(){window.__nz++;return _c.apply(this,arguments);};}\");")]
s += lugar("cachoeira_apaga", "pos(47,-170);mira(44,6,-189);")
s += lugar("degraus_apaga", "pos(57.5,-165);mira(65,8,-188);")
s += lugar("planalto_apaga", "pos(74,-206);mira(30,19,-240);")
s += lugar("planalto_marca", "pos(74,-206);mira(30,19,-240);", apaga=False)
s += lugar("degraus_marca", "pos(57.5,-165);mira(65,8,-188);", apaga=False)
salvar('p212d.json', s)

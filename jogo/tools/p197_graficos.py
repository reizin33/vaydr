"""p197: Etapa 21, gráficos: os quatro níveis (Baixo, Médio, Alto, Ultra) mudam de verdade o que é desenhado (árvores perto e longe,
mato, luzes, sombra, detalhe dos materiais) e o tempo de cada quadro, na mata e na cidade; o shader novo compila (relevo, brilho,
tijolo, areia) e a chuva molha os materiais."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const nivel=g=>{n.cfg.graf=g;n.cfg.grafManual=true;X('aplicarCfg')();X('perfDone=true');X('rebuildGrass')();X('rebuildVeg')(true);},"
     "contar=()=>{const M=X('MESH');return{pertoArv:M.pineN.n+M.roundN.n+M.birchN.n+M.deadN.n,longeArv:M.pine.n+M.round.n+M.birch.n+M.dead.n,grama:M.grass.n,flores:M.flor.n,samamb:M.samambaia.n,folhas:M.folhas.n,"
     "sombra:X('SHADOW')?X('SHADOW').size:0,casc:!!(X('SHADOW')&&X('SHADOW').casc),detalhe:X('GRAF')[n.cfg.graf].detalhe,luzes:X('GF')().luzes,cidLod:X('GF')().cidLod};},"
     "zera=()=>{window.__perf={passo:0,veg:0,render:0,hud:0,n:0};},mede=()=>{const p=window.__perf;return{quadros:p.n,msRender:p.n?Math.round(p.render/p.n*10)/10:null};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=1;window.__perfSync=true;window.__semRender=true;vivo();Z.length=0;G.hora=11;n.cfg.cam='1';window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"),
      e("shader", "const f=X('LIT_FS'),t=X('TER_FS');return{relevo:f.includes('gSh*'),tijolo:f.includes('tij'),chuva:f.includes('uWet>0.01'),areia:t.includes('marcas de vento'),relevoChao:t.includes('relevo do chão')};")]
for lugar, pos in (("mata", "vai(F[0]+18,F[2]+6);P.yaw=-2.3;P.pitch=-0.05;"), ("cidade", "vai(232,8);P.yaw=Math.PI/2;P.pitch=-0.02;")):
    for g in ("baixo", "medio", "alto", "ultra"):
        s += [j(pos + "nivel('" + g + "');window.__semRender=false;"), ["gwait", 0.6], j("zera();"), ["gwait", 1.6],
              e(lugar + "_" + g, "const r=Object.assign(contar(),mede());window.__semRender=true;return r;")]
# chuva: o material molha (uWet chega ao programa dos objetos)
s += [j("nivel('alto');G.chuva=1;"), ["gwait", 0.6],
      e("chuvaUniforme", "const E=X('E');return{wet:Math.round((E.wet||0)*100)/100,prog:!!X('PL').u.uWet};"),
      j("G.chuva=0;")]
salvar("p197.json", s, vp=(640, 360))

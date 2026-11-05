"""p232d (Parte 1, correção): salvar no meio da escalada. Antes, o jogo gravava a posição pendurada no ar e, ao carregar,
o personagem caía (com dano). Agora grava a saída mais perto da rota (base ou topo). Testa nas duas metades da subida."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();window.__cadaPasso=()=>{__nnc.Z.length=0;};X('BICHOS').length=0;")]
for nome, u in (("alto", 0.8), ("baixo", 0.25)):
    s += [js("const V=X('VIAS').filter(v=>v.base&&v.topo&&v.topo.y-v.base.y>6);const v=V[0];window.__v=v;"
             "P.x=v.base.x;P.z=v.base.z;P.y=v.base.y+0.02;P.vy=0;P.vida=100;X('comecarEscalada')({v,u:0});P.escala.u=" + str(u) + ";"), ["gwait", 0.3]]
    s += [ev("antes_" + nome, "const v=window.__v,e=P.escala,sv=X('serializar')().P;return{escalando:!!e,u:e?+e.u.toFixed(2):null,yNoAr:+P.y.toFixed(2),altBase:+v.base.y.toFixed(2),altTopo:+v.topo.y.toFixed(2),"
                                "gravouY:sv.y,gravouNaSaida:Math.abs(sv.y-(" + ("v.topo.y" if u > 0.5 else "v.base.y") + "+0.02))<0.05&&Math.hypot(sv.x-" + ("v.topo.x" if u > 0.5 else "v.base.x") + ",sv.z-" + ("v.topo.z" if u > 0.5 else "v.base.z") + ")<0.05,salvou:X('salvarJogo')()!==false};")]
    s += [js("X('novoJogo')();"), ["gwait", 0.5], js("X('carregarJogo')();"), ["gwait", 2.5]]
    s += [ev("depois_" + nome, "return{vida:Math.round(P.vida),noChao:!!P.noChao,escalando:!!P.escala,y:+P.y.toFixed(2),altChao:+(P.y-n.chaoEm(P.x,P.z,P.y+0.3)).toFixed(2),vy:+P.vy.toFixed(2)};")]
salvar('tools/p232d_escalada.json', s, vp=(640, 360))

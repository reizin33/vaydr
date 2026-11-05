"""p227: como está o mapa: foto do mapa grande do jogo (M) e uma grade do que é andável (dentroMapa) com os lugares marcados."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;")]
s += [ev("grade", "const dm=X('dentroMapa'),L=[];for(let z=-300;z<=300;z+=5){let row='';for(let x=-300;x<=420;x+=5)row+=dm(x,z,0)?'1':'0';L.push(row);}"
          "const P_=X('PLACES').map(p=>[p.id||p.nome,Math.round(p.x),Math.round(p.z),Math.round(p.r||0)]);const E=(X('EST_MUNDO')||[]).map(e=>[e.id||e.estTipo,Math.round(e.x),Math.round(e.z)]);"
          "const S=X('SUB').entradas.map(e=>[e.id,e.sup[0],e.sup[1]]);let reg=[];try{reg=Object.entries(X('ARC_L')).map(([k,v])=>[k,Math.round(v.x),Math.round(v.z)]);}catch(_){}"
          "return{rows:L,places:P_,est:E,sub:S,arc:reg,cidade:X('CIDADE'),mapR:X('MAP_R')};")]
s += foto("e28_mapa_grande.png", "n.ev('abrirMapa()');")
salvar('tools/p227_mapa.json', s, vp=(1280, 800))

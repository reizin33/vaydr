"""p219: levantamento em volta da cidade (antes de abrir a parede invisível): altura do terreno e o que existe fora do tapume."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("")
s += [ev("borda", "const C=X('CIDADE'),gr=X('ground'),dm=X('dentroMapa'),T=X('TREES'),B=X('BRENHA'),GX=X('GX'),o={grade:[Math.round(GX[0]),Math.round(GX[GX.length-1])]};"
         "const amostra=(x,z)=>({h:Math.round(gr(x,z)*10)/10,mapa:dm(x,z),arvores:T.filter(t=>Math.abs(t.x-x)<15&&Math.abs(t.z-z)<15).length,brenha:B.filter(b=>Math.abs(b.x-x)<15&&Math.abs(b.z-z)<15).length});"
         "for(const d of [8,25,45]){o['norte'+d]=amostra((C.x0+C.x1)/2,C.z0-d);o['sul'+d]=amostra((C.x0+C.x1)/2,C.z1+d);o['oesteN'+d]=amostra(C.x0-d,C.z0+30);o['oesteS'+d]=amostra(C.x0-d,C.z1-30);}"
         "o.cidadeChao=Math.round(gr((C.x0+C.x1)/2,0)*10)/10;o.vaoMataCidade=amostra(160,-40);o.vaoMataCidade2=amostra(160,60);return o;")]
salvar('p219_borda.json', s, vp=(640, 360))

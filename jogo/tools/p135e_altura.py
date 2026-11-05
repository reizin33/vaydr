"""p135e: colisores que deveriam ficar só embaixo da terra (metrô, subsolo) ou só no alto, mas pegam o nível da rua; e colisores de porta
de portas abertas ou quebradas (passagem livre com parede invisível)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("altura", "const L=X('COLL'),C=X('CIDADE'),r=c=>({x:r2(c.x),z:r2(c.z),a:r2(c.hw!==undefined?c.hw:c.r),b:r2(c.hd||0),y0:c.y0===undefined?null:r2(c.y0),y1:c.y1===undefined?null:r2(c.y1),chaves:Object.keys(c).filter(k=>!['x','z','hw','hd','c','s','yaw','r','y0','y1','t','solid'].includes(k)).join(',')});"
         "const metro=L.filter(c=>c.metro),metroRua=metro.filter(c=>c.y1===undefined||c.y1>-0.5);"
         "const sub=L.filter(c=>c.sub||c.subsolo),subRua=sub.filter(c=>c.y1===undefined||c.y1>-0.5);"
         "const portas=L.filter(c=>c.porta),D=X('CID').portas;let abertaComCol=[];for(const c of portas){const d=typeof c.porta==='object'?c.porta:D[c.porta];if(d&&(d.aberta||d.estado==='aberta'||d.estado==='quebrada'||d.quebrada)&&c.solid)abertaComCol.push(Object.assign(r(c),{estado:d.estado,aberta:d.aberta}));}"
         "return{metro:metro.length,metroRua:metroRua.length,exMetro:metroRua.slice(0,12).map(r),sub:sub.length,subRua:subRua.length,exSub:subRua.slice(0,6).map(r),portas:portas.length,abertaComCol:abertaComCol.length,exPorta:abertaComCol.slice(0,10),"
         "tipoPorta:portas.slice(0,3).map(c=>typeof c.porta)};")]
salvar('p135e.json', s)

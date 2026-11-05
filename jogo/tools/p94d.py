"""p94d: travessia da ponte de ponta a ponta + fotos dos veículos (depois da remoção do desenharCarro duplicado)."""
import sys,os,json;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
V = "const VS=X('VEICS'),vv=id=>VS.find(q=>q.id===id||q.tipo===id),IN=X('IN');"
s = inicio()
s += [js(V+"vivo();const t=vv('caminhonete'),Pn=X('PONTE');t.x=Pn.x-17;t.z=Pn.z;t.yaw=Math.PI/2;t.comb=60;t.y=X('chaoVeic')(t.x,t.z);X('veicColisor')(t);vai(t.x-2,t.z+2);X('entrarVeic')(t);IN.mz=1;"),
      ["gwait", 1.0], ev("p1", V+"const t=vv('caminhonete');return{x:r2(t.x),y:r2(t.y),v:r2(t.v)};"),
      ["gwait", 1.0], ev("p2", V+"const t=vv('caminhonete');return{x:r2(t.x),y:r2(t.y),v:r2(t.v)};"),
      ["gwait", 1.0], ev("p3", V+"const t=vv('caminhonete');return{x:r2(t.x),y:r2(t.y),v:r2(t.v)};"),
      ["gwait", 1.5], ev("p4", V+"const t=vv('caminhonete');return{x:r2(t.x),y:r2(t.y),v:r2(t.v)};"),
      ["gwait", 1.5], js(V+"IN.mz=0;IN.freio=true;"), ["gwait", 1.5], js(V+"IN.freio=false;"),
      ev("atravessou", V+"const t=vv('caminhonete'),Pn=X('PONTE');return{x:r2(t.x),z:r2(t.z),passou:t.x>Pn.x+Pn.hw,y:r2(t.y),hp:r2(t.hp)};"), js("X('sairCarro')();")]
fotos = [("344_triFazenda.png", "triFazenda", (-3.2, 1.6, -2.6)), ("345_barcoCais.png", "barcoCais", (4.5, 2.4, 4.5)), ("347_caminhonete.png", "caminhonete", (4.5, 2.2, 4.0))]
for nome, id, (dx, dy, dz) in fotos:
    s += foto(nome, V+f"vivo();const m=vv('{id}');vai(m.x+6,m.z+6);G.camFix={{pos:[m.x+{dx},m.y+{dy},m.z+{dz}],tgt:[m.x,m.y+0.7,m.z]}};", 0.3)
s += [js("G.camFix=null;")]
salvar('p94d.json', s)

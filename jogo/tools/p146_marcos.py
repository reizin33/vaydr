"""p146: marcos da vila (caixa d'água, ponto de ônibus, mesas do Bar do Zé): fotos e colisores."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("cols", "const L=X('COLL');const mesas=L.filter(c=>c.t===0&&Math.abs(c.r-0.48)<0.01&&Math.hypot(c.x-65.5,c.z-88)<6).length,cad=L.filter(c=>c.t===0&&Math.abs(c.r-0.2)<0.01&&c.y1>0.9&&Math.hypot(c.x-65.5,c.z-88)<7).length;"
  "const pes=L.filter(c=>c.t===0&&Math.abs(c.r-0.27)<0.01&&Math.hypot(c.x-77,c.z+51.5)<3).length;const ponto=L.filter(c=>Math.hypot(c.x-64.9,c.z+50.6)<2.5).length;"
  "const portaBar=X('CID').portas.filter(d=>d.p===X('VILA').v7).map(d=>({x:r2(d.x),z:r2(d.z)}));return{mesas,cad,pes,ponto,portaBar};")]
s += foto("780_vila_entrada.png", "G.hora=9.5;G.chuva=0;Z.length=0;vai(60,-40);P.yaw=P.body=Math.PI;G.camFix={pos:[58.5,P.y+2.2,-38],tgt:[70,P.y+4.5,-54],fov:1.05};", 0.6, 4.0)
s += foto("781_bar_mesas.png", "G.hora=16;Z.length=0;vai(61.5,-85);G.camFix={pos:[60.6,P.y+2.0,-83.4],tgt:[66,P.y+0.5,-88.6],fov:1.0};", 0.6, 4.0)
s += foto("782_caixa_dagua.png", "G.hora=9.5;Z.length=0;vai(70,-44);G.camFix={pos:[68,P.y+1.7,-41],tgt:[77,P.y+8,-51.5],fov:1.05};", 0.6, 4.0)
salvar('p146.json', s)

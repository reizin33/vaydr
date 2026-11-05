"""p106: fotos das casas da cidade (referência de estilo para as casas da vila)"""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = "const CP=X('CID').predios,gr=(x,z)=>X('ground')(x,z);"
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += foto("460_cidade_casas.png", F+"vivo();Z.length=0;G.hora=10;vai(200,-48);G.camFix={pos:[200,7,-44],tgt:[190,1.5,-60]};", 0.5)
s += foto("461_cidade_casa_perto.png", F+"vai(178,-50);G.camFix={pos:[185,3.2,-48],tgt:[178.5,1.8,-57]};", 0.5)
s += foto("462_cidade_casa_dentro.png", F+"const p=CP.find(q=>q.casa&&q.andares===1);const s=p.salas[0][0];vai(s.x,s.z,s.y);G.camFix=null;window.__turbo=1;", 0.6)
s += [ev("info", F+"const p=CP.find(q=>q.casa&&q.andares===1);return{nome:p.nome,W:p.W,D:p.D,salas:p.salas[0].map(s=>s.tipo).join(','),conts:X('CID').conts.filter(c=>c.p===p).map(c=>c.tipo).join(',')};")]
salvar('p106.json', s)

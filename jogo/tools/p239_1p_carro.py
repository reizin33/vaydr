"""p239 (11/11): primeira pessoa dentro da caminhonete. Antes: a mão com a arma aparecia na frente e a caminhonete sumia.
Uso: python3 tools/p239_1p_carro.py NOME  (fotos shots/NOME_1p_carro.png e NOME_1p_lado.png)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
q = sys.argv[1] if len(sys.argv) > 1 else 'x'
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=10;n.invAdd('pistola',1);"
         "const t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');const x=F[0]+8,z=F[2]-12;t.x=x;t.z=z;t.y=n.ground(x,z);t.yaw=0.6;t.v=0;t.comb=80;t.hp=90;X('veicColisor')(t);"
         "vai(x+2,z+2);X('entrarVeic')(t);n.cfg.cam='1';P.yaw=t.yaw;P.pitch=-0.12;"), ["gwait", 1.0]]
s += [ev("estado", "return{carro:X('CARRO').ativo,cam:n.cfg.cam};")]
s += foto(q + "_1p_carro.png", "P.yaw=X('CARRO').yaw;P.pitch=-0.12;", 0.3, 3.0)
s += foto(q + "_1p_lado.png", "P.yaw=X('CARRO').yaw+1.2;P.pitch=-0.05;", 0.3, 3.0)
salvar('tools/p239_' + q + '.json', s, vp=(1280, 720))

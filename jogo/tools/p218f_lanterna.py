"""p218f: lanterna de mão na mão, à noite: foto de lado em 3ª pessoa (braço apontando, luz saindo da ponta) e em 1ª pessoa;
confere, depois de um quadro desenhado, que a origem da luz é a ponta da lanterna."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
from p218b_visual import foto_mao
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=21.5;X('invAdd')('lanterna',1);P.bat=100;sel('lanterna');P.lanterna=true;P.yaw=0.6;P.body=0.6;P.pitch=-0.12;"),
      ["gwait", 1.0]]
s += foto_mao("e26_lanterna_3p.png", 1.15, 0.35, 0.2)
s += [ev("luz_3p", "const h=P.ch.m.subarray(11*16,12*16),T=X('LANT_PONTA'),p=X('xf')(h,T[0],T[1],T[2]),sp=X('spotP');return{luzNaPonta:r2(Math.hypot(sp[0]-p[0],sp[1]-p[1],sp[2]-p[2])),bracoFrente:r2(P.lantK)};")]
s += foto("e26_lanterna_1p.png", "n.cfg.cam='1';P.pitch=-0.12;")
s += [ev("luz_1p", "const sp=X('spotP'),c=X('cam');return{distCamera:r2(Math.hypot(sp[0]-c.pos[0],sp[1]-c.pos[1],sp[2]-c.pos[2]))};")]
salvar('p218f_lanterna.json', s, vp=(960, 540))

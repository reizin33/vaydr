"""p229c: (1) distância de novo, com o motivo quando o tiro não acerta; (2) besta e arco de verdade (fluxo do jogo) com o registro
das flechas (FLOG), a mira e a origem do disparo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open('tools/p229_armas.py').read().split('DIST = ')[0].split('from vt import *')[1])
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.P.vida=100;__nnc.P.energia=100;};G.hora=11;" + LIB +
         "L.C=L.campo([10,15],260);window.__d={};"),
      ]
# besta e arco de verdade, em 1ª pessoa, a 10 m e a 15 m
for arma in ['besta', 'arco']:
    for d in [10, 15]:
        s += [js("const L=window.__A;n.cfg.cam='1';Z.length=0;P.inv.fill(null);P.inv[0]={id:'" + arma + "',n:1,mun:1,dur:140};P.inv[1]={id:'virote',n:5};P.inv[2]={id:'flecha',n:5};X('selecionar')(0);"
                 "P.acao=null;P.cd=0;const S=L.poe(L.C," + str(d) + ");const z=L.zumbi('walker',L.C.T,S);z.st='atordoado';z.t=60;window.__fz=z;window.__fh=z.hp;const p=L.alvo(z,'tronco');mira(p[0],p[1],p[2]);X('FLOG').length=0;"), ["gwait", 0.2],
              js("const L=window.__A,z=window.__fz,p=L.alvo(z,'tronco');mira(p[0],p[1],p[2]);"), ["gwait", 0.1],
              js("const cam=X('cam');window.__m={camPos:cam.pos.map(r2),camFwd:cam.fwd.map(v=>Math.round(v*1000)/1000),mira:X('pontoMira')(120).map(r2),zx:[r2(window.__fz.x),r2(window.__fz.z)],P:[r2(P.x),r2(P.y),r2(P.z)],pitch:r2(P.pitch),yaw:r2(P.yaw)};"
                 "P.acao=null;P.cd=0;" + ("X('IN').attack=true;X('atacar')();" if arma == 'arco' else "X('atacar')();")),
              ["gwait", 1.0 if arma == 'arco' else 0.8]]
        if arma == 'arco':
            s += [js("X('IN').attack=false;"), ["gwait", 0.8]]
        s += [ev(arma + str(d), "const z=window.__fz;return{dano:r2(window.__fh-z.hp),vivo:z.vivo,flechasNoZumbi:(z.flechas||[]).length,log:X('FLOG').map(f=>f.m+'@'+f.x+','+f.y+','+f.z),m:window.__m,"
                 "virote:X('invCount')('virote'),flecha:X('invCount')('flecha'),pente:(P.inv[0]||{}).mun};")]
salvar('tools/p229c_projeteis.json', s, vp=(800, 450))

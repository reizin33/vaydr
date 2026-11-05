"""p215d: depuração — quanto custa remontar a vegetação perto do jogador (rebuildVeg, que roda a cada 30 quadros) em lugares
diferentes e nos níveis Médio e Alto; e se isso trava o laço do jogo (teste do controle perdia botão apertado por 0,15 s)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
def lugar(nome, x, z, graf):
    return [js("n.cfg.graf='%s';X('aplicarCfg')();vai(%s,%s,X('ground')(%s,%s)+1);X('rebuildVeg')(true);" % (graf, x, z, x, z)), ["gwait", 0.5],
            ev(nome, "const rv=X('rebuildVeg'),t=[];for(let i=0;i<6;i++){const a=performance.now();rv(true);t.push(performance.now()-a);}t.sort((a,b)=>a-b);"
                     "return{mediana:Math.round(t[3]*10)/10,maior:Math.round(t[5]*10)/10,arvores:X('TREES').length,moitas:X('BRENHA').length};")]
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};")]
for g in ('medio', 'alto'):
    s += lugar("clareira_" + g, "F[0]+8", "F[2]+8", g)
    s += lugar("alto_" + g, 50, -238, g)
    s += lugar("cidade_" + g, 254, 5, g)
    s += lugar("borda_" + g, -95, 110, g)
salvar('p215d.json', s, vp=(640, 360))

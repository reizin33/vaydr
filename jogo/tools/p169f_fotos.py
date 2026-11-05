"""p169f: fotos da Etapa 10. Uma casa de dois cômodos (pilares, piso de cima e telhado) com porta reforçada, teclado do cadeado e
lamparina de parede ao lado; janela da frente com tábuas em X, janela do lado com chapas e persiana fechada, janela dos fundos
com tábuas empilhadas e parede revestida; dentro, cama, mesa, cadeira, estante e lamparina. Fora: armadilha aberta e fechada,
paliçada, portão grande e muralha. Fotos: casa de dia, casa à noite (luz saindo pelas janelas), dentro de casa, os muros com o
portão abrindo, o menu de construção (aba Móveis e o botão Consertar tudo) e o painel da porta."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),C=window.__C,M=window.__M;")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;P.vida=100;};"
def j(c): return js(H + c)
s = inicio("window.__casa3=true;window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;" + LIMPA + "n.cfg.cam='3';G.fab.noite1=true;window.__C={x:9,z:6,y:X('ground')(9,6)};window.__M={x:-9,z:13,y:X('ground')(-9,13)};")]
# a casa
s += [j("const y=C.y,p=(x,z)=>cria('pilar',C.x+x,C.z+z,0,undefined,{top:+(y+2.6).toFixed(2)});for(const x of[-3,0,3])for(const z of[-1.5,1.5])p(x,z);"
        "for(const x of[-1.5,1.5]){cria('plataforma',C.x+x,C.z,0,y+2.6,{apoio:'pilar'});cria('telhado',C.x+x,C.z,0,y+2.6);}"
        # frente: porta reforçada com cadeado e tranca; janela com tábuas em X por fora
        "const po=cria('portaMadeira',C.x-1.5,C.z+1.5,0,y,{reforco:1,cad:'fechado',senha:'4719',dentro:-1,tr:'livre'});po.hpMax=760;po.hp=760;"
        "cria('janela',C.x+1.5,C.z+1.5,0,y,{tab:'x',tabHp:120,tabLado:1});"
        # fundos: parede com chapas e janela com tábuas empilhadas; lados: parede com chapas e janela com chapas e persiana fechada
        "cria('paredeCasa',C.x-1.5,C.z-1.5,Math.PI,y,{metal:1,metalLado:1});cria('janela',C.x+1.5,C.z-1.5,Math.PI,y,{tab:'pilha',tabHp:300,tabLado:1});"
        "cria('paredeCasa',C.x-3,C.z,-Math.PI/2,y,{metal:1,metalLado:1});cria('janela',C.x+3,C.z,Math.PI/2,y,{metal:1,metalLado:1,fechada:true});"
        # dentro: cama, mesa, cadeira, estante e a lamparina na parede dos fundos; fora: lamparina ao lado da porta e as armadilhas
        "cria('camaMadeira',C.x+1.75,C.z-0.62,Math.PI/2);cria('mesa',C.x-1.55,C.z-0.62,0);cria('cadeira',C.x-1.55,C.z+0.25,Math.PI);cria('prateleira',C.x-2.62,C.z+0.55,Math.PI/2);"
        "cria('lampParede',C.x-0.6,C.z-1.5+0.31,0,y+1.62);cria('lampParede',C.x-2.48,C.z+1.5+0.31,0,y+1.62);"
        "cria('armadilhaUrso',C.x+1.2,C.z+3.6,0.4);const t2=cria('armadilhaUrso',C.x+2.3,C.z+4.1,-0.3);t2.ext.armada=false;"
        # os muros: muralha, duas paliçadas e o portão grande em linha
        "const m=M.y;cria('muralha',M.x-6,M.z,0,m);cria('palicada',M.x-3,M.z,0,m);cria('palicada',M.x,M.z,0,m);cria('portaoGrande',M.x+4.5,M.z,0,m);cria('palicada',M.x+9,M.z,0,m);"
        "G.hora=10;G.noite=false;")]
s += [j("vai(C.x+7,C.z+12);")]
s += foto('p169_casa_dia.png', H + "G.hora=15.5;G.noite=false;G.camFix={pos:[C.x+6.5,C.y+3.4,C.z+9.5],tgt:[C.x-0.2,C.y+1.4,C.z+0.6]};", 1.0, 4.0)
s += foto('p169_casa_fundos.png', H + "G.camFix={pos:[C.x-7.5,C.y+3.0,C.z-8],tgt:[C.x+0.2,C.y+1.3,C.z-0.6]};", 0.5, 4.0)
s += foto('p169_casa_noite.png', H + "G.hora=22.3;G.noite=true;vai(C.x+7,C.z+12);G.camFix={pos:[C.x+5.5,C.y+2.6,C.z+9],tgt:[C.x-0.2,C.y+1.4,C.z+0.6]};", 1.5, 4.0)
s += foto('p169_dentro.png', H + "G.hora=21.5;G.noite=true;vai(C.x+0.2,C.z+0.9);G.camFix={pos:[C.x+2.55,C.y+1.75,C.z+1.15],tgt:[C.x-1.6,C.y+0.75,C.z-0.7],fov:1.25};", 1.0, 4.0)
s += [j("G.camFix=null;G.hora=10.5;G.noite=false;vai(M.x+4.5,M.z+3.2);"), ["gwait", 2.5]]
s += [j("G.camFix={pos:[M.x+2.5,M.y+4.2,M.z+13.5],tgt:[M.x+1.5,M.y+1.6,M.z]};")]
s += foto('p169_muros.png', H + "", 0.3, 4.0)
# menu de construção: aba Móveis e o botão Consertar tudo (com uma parede danificada)
s += [j("G.camFix=null;vai(C.x+1,C.z+4.5);P.yaw=Math.PI;P.body=P.yaw;P.pitch=-0.1;const w=X('OB').find(o=>o.tipo==='paredeCasa');w.hp=w.hpMax*0.5;X('OBRA').tipo='camaMadeira';X('modoObra')(true);")]
s += foto('p169_menu.png', H + "", 0.5, 4.0)
s += [j("X('modoObra')(false);const po=X('OB').find(o=>o.tipo==='portaMadeira'&&o.ext.cad);vai(po.x+0.3,po.z+1.3);P.yaw=Math.PI;n.alvo={k:'portaMad',o:po};n.interagir(true);")]
s += foto('p169_painel_porta.png', H + "", 0.2, 3.0)
salvar('p169f.json', s)

"""p207: Etapa 22 (extra), o balão do Campo dos balões: sem material não conserta; consertado, sem gás não sobe; com botijão,
sobe no cesto; o maçarico (Espaço) faz subir, o vento leva para longe, lá de cima o minimapa mostra longe, a válvula (C) e o ar
esfriando fazem descer e pousar; sai do cesto; o balão fica onde pousou depois de salvar e carregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const B=()=>X('balD')(),BV=X('BV'),alvo=()=>{window.__a={k:'balaoCesto',o:B()};X('alvoInter=window.__a');},texto=()=>X('INTER_K').balaoCesto.texto().t;")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;if(window.__queima)__nnc.ev('BV').queima=6;if(window.__valvula)__nnc.ev('BV').vent=4;};"),
      e("semMaterial", "const b=B();vai(b.x+1.6,b.z,X('ground')(b.x+1.6,b.z));P.inv.fill(null);alvo();const t=texto();X('interagir')(true);return{st:B().st,texto:t};"),
      e("conserta", "n.invAdd('pano',8);n.invAdd('corda',4);n.invAdd('sucata',2);n.invAdd('pecasMaquina',1);alvo();X('interagir')(true);return{st:B().st,sobrouPano:conta('pano'),colisor:!!X('ARC_LAY').campo.cestoCol};"),
      e("semGas", "alvo();const t=texto();X('interagir')(true);return{texto:t,noCesto:!!P.balao};"),
      e("sobe", "n.invAdd('botijaoGas',1);alvo();X('interagir')(true);return{noCesto:!!P.balao,gas:Math.round(B().gas),botijoes:conta('botijaoGas'),texto:texto()};"),
      j("X('pular')();window.__q0=X('BV').queima;window.__x0=B().x;window.__z0=B().z;window.__y0=B().y;window.__queima=true;"),
      ["gwait", 40.0],
      e("voando", "const b=B(),g=X('ground')(b.x,b.z);return{queimaApertou:window.__q0,st:b.st,altura:Math.round(b.y-g),andou:Math.round(Math.hypot(b.x-window.__x0,b.z-window.__z0)),gasusado:Math.round(180-b.gas),minimapaLonge:G.obsAte>G.t,jogadorNoCesto:Math.abs(P.y-b.y-0.32)<0.05,dentroMapa:X('dentroMapa')(b.x,b.z)};"),
      j("window.__queima=false;window.__valvula=true;"),
      ["gwait", 70.0],
      e("pousou", "const b=B(),g=X('ground')(b.x,b.z),a=X('aguaNivel')(b.x,b.z);return{st:b.st,altura:Math.round((b.y-Math.max(g,a===null?-99:a))*10)/10,vida:P.vida};"),
      j("window.__valvula=false;"),
      e("sai", "alvo();X('interagir')(true);const b=B();return{noCesto:!!P.balao,distCesto:Math.round(Math.hypot(P.x-b.x,P.z-b.z)*10)/10,noChao:Math.abs(P.y-X('chaoEm')(P.x,P.z,P.y+1))<0.2};"),
      e("salva", "window.__bx=B().x;X('salvarJogo')();return{ok:true};"),
      j("X('carregarJogo')();"), ["gwait", 0.5],
      e("carregou", "const b=B();return{st:b.st,mesmoLugar:Math.abs(b.x-window.__bx)<0.5,gas:Math.round(b.gas),noCesto:!!P.balao};")]
salvar('p207.json', s, vp=(640, 360))

"""p160: sobrevivência (Etapa 3). Água suja dá dor de barriga e o remédio cura; pastilha e fervura limpam a água; sangrando não dá
para dormir e a bandagem resolve; dormir no saco longe da base: zumbi chegando acorda; sem zumbi, dorme até de manhã e o sono enche;
perna quebrada + tala; vírus + seringa; ferida grave + kit de sutura; frente fria à noite dá frio e perto da fogueira passa;
calor aumenta a sede; chuva molha; salvar e carregar mantém dor de barriga, perna, ferida, molhado e sono."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const L=()=>P.lesoes||{},slot=id=>P.inv.findIndex(q=>q&&q.id===id),usa=id=>{const i=slot(id);if(i<0)return'sem '+id;X('usarItem')(i);return'ok';},"
     "util=id=>{const i=slot(id);if(i<0)return'sem '+id;return X('UTIL_ACOES')[id](i);},"
     "longe=()=>{for(let a=0;a<6.28;a+=0.2){const x=Math.cos(a)*58,z=Math.sin(a)*58;if(X('aguaNivel')(x,z)===null&&!X('pointBlocked')(x,z,0.6))return[x,z];}return[40,40];};")
def e(nome, c):
    c = c.replace("return{", "return{_vida:Math.round(P.vida),_vivo:P.alive,_modo:G.modo,_causa:G.causa||null,", 1)
    return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.fome=80;P.sede=80;P.sono=90;"),
      # água suja: dor de barriga certa (sorteio fixado), remédio cura
      e("aguaSuja", "n.invAdd('aguaSuja',3);n.invAdd('remedios',1);const r=Math.random;Math.random=()=>0;const u=usa('aguaSuja');Math.random=r;const intox=P.intox;"
                    "const chip=!document.getElementById('vx-intox').hidden;const cura=util('remedios');return{u,intox:Math.round(intox),chip,depoisRemedio:Math.round(P.intox||0),garrafas:conta('garrafa')};"),
      ["gwait", 0.2],
      # pastilha e fervura
      e("limpar", "n.invAdd('pastilha',1);const a0=conta('agua'),s0=conta('aguaSuja');util('pastilha');const a1=conta('agua'),s1=conta('aguaSuja');X('cozinhar')();"
                  "return{pastilha:{limpa:a1-a0,suja:s1-s0},fervura:{limpa:conta('agua')-a1,sujaFicou:conta('aguaSuja')}};"),
      # sangrando não dorme; bandagem resolve
      j("const p=longe();vai(p[0],p[1]);G.hora=22;P.sono=30;Z.length=0;"), ["gwait", 0.2],
      e("sangrando", "X('lesao')('sangramento');const nao=X('sonoPodeDormir')({saco:true});n.invAdd('bandagem',1);usa('bandagem');return{sangrava:!!nao,motivo:nao,depois:L().sangra,podeAgora:X('sonoPodeDormir')({saco:true})};"),
      # dorme no saco, longe da base; um zumbi chegando acorda
      e("dormiu", "const d=Math.round(Math.hypot(P.x-F[0],P.z-F[2]));X('sonoComecar')({saco:true});return{dorme:!!P.dorme,longeDaBase:d,hora:Math.round(G.hora*10)/10};"),
      ["gwait", 0.4],
      j("const a=P.yaw;const z=ZZ('walker',P.x+Math.sin(a)*9,P.z+Math.cos(a)*9);if(z){z.st='caca';}"),
      ["until", "!__nnc.P.dorme", 60],
      e("acordou", "return{dorme:!!P.dorme,hora:Math.round(G.hora*10)/10,zumbis:Z.filter(z=>z.vivo).length};"),
      # sem zumbi: dorme até de manhã e o sono enche
      j("for(const z of Z)z.vivo=false;Z.length=0;G.hora=22;P.sono=30;P.fome=90;P.sede=90;X('sonoComecar')({saco:true});"),
      ["until", "!__nnc.P.dorme", 240],
      e("manha", "return{hora:Math.round(G.hora*10)/10,sono:Math.round(P.sono),dorme:!!P.dorme,vivo:P.alive};"),
      # daqui em diante, sem zumbis (as hordas da noite atrapalhariam a conferência do clima)
      js("window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};"),
      # perna quebrada e tala; vírus e seringa; ferida grave e sutura
      e("perna", "X('lesao')('perna');const antes=L().perna;n.invAdd('tala',1);usa('tala');return{quebrou:antes>0,tala:!!L().tala,chip:!document.getElementById('vx-perna').hidden};"),
      e("virus", "L().virus=1;n.invAdd('seringa',1);usa('seringa');return{virus:L().virus,imune:Math.round(L().imuneH||0)};"),
      e("ferida", "X('feridaGrave')(30);const tinha=!!L().ferida;n.invAdd('sutura',1);usa('sutura');return{tinha,depois:!!L().ferida};"),
      # frente fria à noite: frio sem roupa; perto da fogueira passa
      j("const p=longe();vai(p[0],p[1]);G.hora=23;G.clima.segs=[[0,30,'frio']];P.molhado=0;"), ["gwait", 3],
      e("frio", "return{clima:X('climaAgora')(),frio:X('comFrio')(),chip:!document.getElementById('vx-frio').hidden,calorRoupa:Math.round(X('calorRoupa')()*100)/100};"),
      j("vai(F[0]+3,F[2]+1);"), ["gwait", 1],
      e("fogueira", "return{pertoDoFogo:X('pertoDoFogo')(),frio:X('comFrio')()};"),
      # calor: sede cai mais rápido ao sol
      j("const p=longe();vai(p[0],p[1]);G.hora=13;G.clima.segs=[[0,30,'calor']];"), ["gwait", 3],
      e("calor", "return{clima:X('climaAgora')(),sedeVezes:Math.round(X('climaSede')()*100)/100};"),
      # chuva molha
      j("G.hora=11;G.clima.segs=[[0,30,'chuva']];P.molhado=0;"), ["gwait", 25],
      e("chuva", "return{clima:X('climaAgora')(),chuva:Math.round(G.chuva*100)/100,molhado:Math.round((P.molhado||0)*100)/100,chip:!document.getElementById('vx-molhado').hidden};"),
      # salvar e carregar: dor de barriga, perna, ferida, molhado e sono
      e("antesSalvar", "P.intox=150;X('lesao')('perna');X('feridaGrave')(30);P.sono=44;X('salvarJogo')();return{intox:Math.round(P.intox),perna:L().perna>0,ferida:!!L().ferida,molhado:Math.round((P.molhado||0)*100)/100,sono:Math.round(P.sono)};"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.2],
      e("carregou", "return{intox:Math.round(P.intox||0),perna:L().perna>0,ferida:!!L().ferida,molhado:Math.round((P.molhado||0)*100)/100,sono:Math.round(P.sono)};")]
salvar('p160.json', s)

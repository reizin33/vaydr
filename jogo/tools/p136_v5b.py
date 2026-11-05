"""p136: conferências finais da versão 5: etiquetas dos itens no chão aparecem jogando (com o desenho ligado), receitas de arma sem
duplicata, e fotos (itens no chão com etiqueta, mata com os pinheiros refeitos, rua da vila com as cores novas)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("receitas", "const R=X('RECIPES'),c=f=>R.filter(r=>r.faz===f).length;return{pistola:c('pistola'),espingarda:c('espingarda'),rifle:c('rifle'),besta:c('besta'),cartucho:c('cartucho'),balaRifle:c('balaRifle'),virote:c('virote'),municao9:c('municao9')};"),
      js("vivo();Z.length=0;G.hora=10;G.chuva=0;X('DROPS').length=0;vai(6,34);P.yaw=P.body=0;const lista=[['pistola',1],['municao9',6],['maca',3],['tabuas',4],['kit',1],['madeira',5],['agua',1],['pano',2],['gasolina',1],['espingarda',1]];"
         "lista.forEach((it,i)=>X('soltarItens')([it],6+(i%5-2)*0.9,36.2+Math.floor(i/5)*1.1,P.y));X('soltarItens')([['corda',1],['pregos',5]],6,38.6,P.y);"
         "G.camFix={pos:[6,P.y+2.3,32.6],tgt:[6,P.y+0.2,36.8],fov:0.95};window.__turbo=1;window.__semRender=false;"),
      ["wait", 3.0],
      ev("etiquetas", "const t=[...document.querySelectorAll('.chao-tag')].filter(e=>!e.hidden).map(e=>e.textContent);return{n:t.length,t};"),
      ["shot", "733_itens_chao.png"],
      js("window.__semRender=true;window.__turbo=6;G.camFix=null;X('DROPS').length=0;")]
s += foto("734_vis_mata.png", "G.hora=10;G.chuva=0;vai(-40,22);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.6, 4.0)
s += foto("735_vis_vila.png", "G.hora=10;const p=X('PLACES').find(q=>q.id==='vila');vai(p.x+2,p.z+16);P.yaw=P.body=Math.PI;G.camFix={pos:[p.x+3.5,P.y+2.2,p.z+22],tgt:[p.x,P.y+1.4,p.z],fov:0.95};", 0.6, 4.0)
salvar('p136.json', s)

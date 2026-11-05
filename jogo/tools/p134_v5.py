"""p134: o que entra na versão 5.
(1) menu de construção: abas por tipo; a roda do mouse passa por todas as peças, as teclas escolhem dentro da aba, os botões mostram o número;
(2) armas: receitas novas (pistola, espingarda, rifle, besta, cartucho, bala de rifle, virote), munição 9mm reequilibrada, mais armas no saque,
    dica ao pegar munição sem a arma;
(3) revistar abre o painel "Achados" (pegar um item; o resto vai para o chão ao fechar); a mochila mostra a aba "Chão" perto de itens largados
    (pegar tudo); pegar do chão com a mochila cheia abre o painel para trocar;
(4) itens no chão com modelo próprio e etiqueta (nome e quantidade);
(5) esfolar agacha o personagem; (6) câmera dentro de prédio chega mais perto; fotos (itens no chão, mata com pinheiros novos, vila)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;window.__painelAchados=true;")
# (1) construção: menu compacto com abas (Muros, Defesa, Casa, Base, Oficina, Plantio); a roda passa por todas as peças, aba por aba;
#     as teclas 1 a 9 e 0 escolhem dentro da aba; o clique na aba troca a aba
MENU = ("const O=X('OBRA'),b=[...document.querySelectorAll('#obras .obra')],vis=b.filter(x=>!x.hidden);"
        "return{ativo:O.ativo,tipo:O.tipo,teclas:document.querySelectorAll('#obras .obra-tecla').length,visiveis:vis.map(x=>x.dataset.o).join(','),total:b.length,"
        "abas:[...document.querySelectorAll('#obra-cats .obra-cat')].map(x=>x.textContent+(x.getAttribute('aria-selected')==='true'?'*':'')).join(' '),"
        "nome:document.getElementById('item-nome').textContent,dica:(vis.find(x=>x.dataset.o===O.tipo)||{}).title};")
s += [js("vivo();Z.length=0;G.hora=10;G.chuva=0;vai(4,30);X('OBRA').tipo='barricada';"), ["gwait", 0.3], ["press", "b"], ["gwait", 0.3],
      ev("obra0", MENU),
      js("const c=document.querySelector('canvas');c.dispatchEvent(new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));"), ["wait", 0.3],
      ev("roda", "const O=X('OBRA'),L=X('obrasOrdem')();return{tipo:O.tipo,indice:L.indexOf(O.tipo),total:L.length};"),
      ["press", "Digit3"], ["wait", 0.2],
      ev("tecla3", "return X('OBRA').tipo;"),
      ["click", "#obra-cats [data-cat=\"casa\"]"], ["wait", 0.3],
      ev("abaCasa", MENU),
      ["press", "Digit0"], ["wait", 0.2],
      ev("tecla0", "return X('OBRA').tipo;"),
      js("const c=document.querySelector('canvas');c.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,bubbles:true,cancelable:true}));"), ["wait", 0.3],
      ev("rodaVolta", MENU),
      js("document.querySelector('#obras [data-o=\"armarioFerro\"]').click();"), ["wait", 0.2],
      ev("outraAba", MENU),
      ["press", "b"], ["gwait", 0.2]]
# (2) armas
s += [ev("armas", "const R=X('RECIPES'),q=f=>R.filter(r=>r.faz===f).map(r=>({custo:r.custo,est:r.est,n:r.n}));const L=X('LOOT'),C=X('CID_LOOT'),ch=(t,id)=>((L[t]||[]).find(x=>x[0]===id)||[])[3];"
         "X('invRemove')('pistola',9);X('invRemove')('municao9',99);X('ganhar')('municao9',4);return{pistola:q('pistola'),espingarda:q('espingarda'),rifle:q('rifle'),besta:q('besta'),cartucho:q('cartucho'),balaRifle:q('balaRifle'),virote:q('virote'),mun9:q('municao9'),"
         "saque:{casaPistola:ch('casa','pistola'),celeiroEsp:ch('celeiro','espingarda'),arsenalEsp:!!(C.arsenal||[]).find(x=>x[0]==='espingarda')}};"),
      ["gwait", 0.3],
      ev("dicaMun", "return{dica:!!G.dicas['mun_municao9']};")]
# (3) achados e chão
s += [js("const I=X('INTER').find(i=>i.id==='vila-casa3');window.__I=I;delete I.dia;vai(I.x+0.6,I.z);n.alvo={k:'inter',o:I};n.interagir(true);"), ["wait", 0.4],
      ev("achados", "const b=n.ev('bauAberto');return{modo:G.modo,aba:n.ev('invAba'),achados:!!(b&&b.achados),itens:b?b.itens.filter(Boolean).map(s=>s.id+':'+s.n):[],titulo:document.getElementById('aba-bau-t').textContent};"),
      js("const el=document.querySelector('#grade-bau [data-b=\"0\"]');window.__pegou=el?el.getAttribute('aria-label'):null;if(el)el.click();"), ["wait", 0.2],
      ev("pegouUm", "const b=n.ev('bauAberto');return{pegou:window.__pegou,pistola:conta('pistola'),resto:b?b.itens.filter(Boolean).length:-1};"),
      js("window.__drops0=X('DROPS').length;"), ["press", "Tab"], ["wait", 0.3],
      ev("fechouAchados", "return{modo:G.modo,drops:X('DROPS').length,antes:window.__drops0};"),
      ["press", "Tab"], ["wait", 0.3],
      ev("abaChao", "const b=n.ev('bauAberto');return{modo:G.modo,chao:!!(b&&b.chao),aba:n.ev('invAba'),itens:b?b.itens.filter(Boolean).map(s=>s.id+':'+s.n):[],titulo:document.getElementById('aba-bau-t').textContent};"),
      js("const el=document.querySelector('#bau-info [data-bau=\"pegar\"]');if(el)el.click();"), ["wait", 0.2], ["press", "Tab"], ["wait", 0.3],
      ev("pegouTudo", "const I=window.__I;return{modo:G.modo,mun9:conta('municao9'),dropsPerto:X('DROPS').filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<3).length};"),
      # mochila cheia: pegar do chão abre o painel para escolher
      js("const inv=P.inv;for(let i=0;i<inv.length;i++)if(!inv[i])inv[i]={id:'pedra',n:1};X('soltarItens')([['tabuas',3],['corda',2]],P.x+0.5,P.z,P.y);"), ["gwait", 0.2],
      js("const D=X('DROPS'),d=D[D.length-1];n.alvo={k:'drop',o:d};n.interagir(true);"), ["wait", 0.3],
      ev("cheia", "const b=n.ev('bauAberto');return{modo:G.modo,chao:!!(b&&b.chao),msg:n.ev('bauMsg'),itens:b?b.itens.filter(Boolean).map(s=>s.id+':'+s.n):[]};"),
      ["press", "Tab"], ["wait", 0.3],
      js("for(let i=0;i<P.inv.length;i++)if(P.inv[i]&&P.inv[i].id==='pedra')P.inv[i]=null;X('hudBarra')();")]
# (4) itens no chão: modelos e etiquetas
s += [js("X('DROPS').length=0;vai(6,34);P.yaw=P.body=0;const lista=[['pistola',1],['municao9',6],['maca',3],['tabuas',4],['kit',1],['madeira',5],['agua',1],['pano',2],['gasolina',1],['espingarda',1]];"
         "lista.forEach((it,i)=>X('soltarItens')([it],6+(i%5-2)*0.9,36.2+Math.floor(i/5)*1.1,P.y));X('soltarItens')([['corda',1],['pregos',5]],6,38.6,P.y);"
         "G.camFix={pos:[6,P.y+2.3,32.6],tgt:[6,P.y+0.2,36.8],fov:0.95};"), ["gwait", 0.4]]
s += foto("730_itens_chao.png", "", 0.3, 4.0)
s += [ev("etiquetas", "const t=[...document.querySelectorAll('.chao-tag')].filter(e=>!e.hidden).map(e=>e.textContent);return{n:t.length,t};"),
      js("G.camFix=null;X('DROPS').length=0;")]
# (5) esfolar agacha; (6) câmera dentro de casa
s += [js("window.__agk=[];P.acao={tipo:'revistar',t:0,dur:3,alvo:{k:'carcaca',o:{x:P.x+0.8,z:P.z}}};window.__cadaPasso=()=>{if(window.__agk.length<200&&P.acao)window.__agk.push(P.agK);};"), ["gwait", 1.2],
      ev("esfolar", "window.__cadaPasso=null;const a=window.__agk;P.acao=null;return{agkMax:Math.round(Math.max(...a,0)*100)/100,amostras:a.length};"),
      js("const p=X('CID').predios.find(q=>q.rural&&q.casa);const s=p.salas[0][0];const c=X('pw')(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);vai(c[0],c[1],p.y0+0.05);"), ["gwait", 2.0],
      ev("cameraDentro", "return{camIn:Math.round(n.ev('camIn')*100)/100,camDist:Math.round(n.ev('camDist')*100)/100,sala:!!X('salaEm')(P.x,P.y+0.4,P.z)};")]
# fotos do visual: mata (pinheiros novos e gramado) e vila (quinas arredondadas)
s += foto("731_vis_mata.png", "G.hora=10;G.chuva=0;vai(-40,22);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.6, 4.0)
s += foto("732_vis_vila.png", "G.hora=10;const p=X('PLACES').find(q=>q.id==='vila');vai(p.x+2,p.z+16);P.yaw=P.body=Math.PI;G.camFix={pos:[p.x+3.5,P.y+2.2,p.z+22],tgt:[p.x,P.y+1.4,p.z],fov:0.95};", 0.6, 4.0)
salvar('p134.json', s)

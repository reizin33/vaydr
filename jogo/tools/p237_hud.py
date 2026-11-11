"""p237 (11/11): HUD no estilo do DayZ, no PC.
1 os ícones existem, enchem conforme o valor e mudam de cor (branco, amarelo, vermelho; termômetro azul no frio)
2 setas de tendência: comendo, a fome sobe (seta para cima); a vida caindo rápido mostra duas setas para baixo
3 barra de fôlego: some quando cheia e acompanha a energia
4 fotos: tudo cheio de dia; tudo baixo com aviso de sangrando; o HUD antigo continua no celular"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=10.5;window.__cadaPasso=()=>{__nnc.Z.length=0;};"), ["gwait", 3.5]]
s += [ev("cheio", "const q=k=>{const el=document.getElementById('dz-'+k),r=el.querySelector('clipPath rect');return{cls:el.className,y:+r.getAttribute('y'),seta:el.querySelector('.dz-seta').dataset.k};};"
             "return{sede:q('sede'),fome:q('fome'),temp:q('temp'),sono:q('sono'),vida:q('vida'),folegoCheio:document.getElementById('dz-folego').classList.contains('cheio'),"
             "painelAntigoVisivel:getComputedStyle(document.querySelector('.vitais .vit .gauges')).display!=='none',dzVisivel:getComputedStyle(document.getElementById('dz')).display!=='none'};")]
s += foto("hud_cheio.png", "vai(F[0]+6,F[2]-9);P.yaw=2.4;P.body=P.yaw;P.pitch=-0.05;", 0.3, 3.0)
# tudo baixo: sede crítica, fome baixa, vida caindo, fôlego gasto
s += [js("P.sede=9;P.fome=27;P.sono=55;P.energia=22;P.vida=60;"), ["gwait", 1.5],
      js("window.__perde=true;window.__cadaPasso=()=>{__nnc.Z.length=0;if(window.__perde&&__nnc.P.vida>25)__nnc.P.vida-=0.25;};"), ["gwait", 2.0]]
s += [js("P.energia=22;window.__cadaPasso=()=>{__nnc.Z.length=0;if(window.__perde&&__nnc.P.vida>25)__nnc.P.vida-=0.25;__nnc.P.energia=22;};"), ["gwait", 0.3]]
s += [ev("baixo", "const q=k=>{const el=document.getElementById('dz-'+k);return{cls:el.className,seta:el.querySelector('.dz-seta').dataset.k};};"
             "const f=document.getElementById('dz-folego');return{sede:q('sede'),fome:q('fome'),vida:q('vida'),folego:f.className,folegoX:f.querySelector('i').style.transform};")]
s += foto("hud_baixo.png", "window.__perde=false;", 0.1, 3.0)
s += [js("window.__cadaPasso=()=>{__nnc.Z.length=0;};"), ["gwait", 6.0]]
# comendo: a fome sobe depressa (seta para cima)
s += [js("window.__cadaPasso=()=>{__nnc.Z.length=0;if(__nnc.P.fome<95)__nnc.P.fome+=0.4;};"), ["gwait", 1.5],
      ev("comendo", "const el=document.getElementById('dz-fome');return{cls:el.className,seta:el.querySelector('.dz-seta').dataset.k};"),
      js("window.__cadaPasso=()=>{__nnc.Z.length=0;};")]
# frio: noite fria de inverno, sem roupa
s += [js("G.hora=2;n.ev('E').n=1;"), ["gwait", 1.0], ev("frio", "const el=document.getElementById('dz-temp');return{cls:el.className,title:el.title,comFrio:X('comFrio')()};")]
s += [js("G.hora=10.5;")]
# painel de Estado na mochila (barras): com valores diferentes e frio
s += [js("P.vida=76;P.energia=58;P.fome=32;P.sede=41;P.sono=80;window.__cadaPasso=()=>{__nnc.Z.length=0;__nnc.P.energia=58;};G.hora=2;n.ev('E').n=1;X('abrirMochila')('mochila');window.__semRender=false;window.__turbo=1;"),
      ["wait", 2.0], ["shot", "hud_mochila.png"],
      ev("mochila", "const q=k=>document.getElementById('est-'+k).style.transform,R=e=>e.getBoundingClientRect(),col=R(document.getElementById('inv-equip')),est=R(document.getElementById('est'));"
                    "const slots=[...document.querySelectorAll('#inv-equip .equip > *')].map(R),dir=Math.max(...slots.map(r=>r.right),est.right);"
                    "return{existe:!!document.getElementById('est'),vida:q('vida'),folego:q('energia'),fome:q('fome'),sede:q('sede'),sono:q('sono'),temp:document.getElementById('est-temp-v').textContent,"
                    "marca:document.getElementById('est-temp-m').style.left,zona:[...document.querySelectorAll('.est-z .on')].map(e=>e.textContent).join(','),titulo:document.getElementById('est-temp-l').title,"
                    "colLarg:Math.round(col.width),slotLarg:Math.round(slots[0].width),cabeNaColuna:dir<=col.right+0.5&&est.bottom<=col.bottom+0.5,sobra:Math.round(col.right-dir)};"),
      js("X('fecharMochila')&&X('fecharMochila')();document.getElementById('inv').hidden=true;window.__semRender=true;window.__turbo=6;G.hora=10.5;n.ev('E').n=0;window.__cadaPasso=()=>{__nnc.Z.length=0;};")]
# celular: o HUD de antes continua
s += [js("n.cfg.tela='celular';document.body.dataset.tela='celular';X('abrirMochila')('mochila');"), ["gwait", 0.5],
      ev("celular", "return{dz:getComputedStyle(document.getElementById('dz')).display,gauges:getComputedStyle(document.querySelector('.vitais .vit .gauges')).display,"
                    "estado:document.getElementById('est')?getComputedStyle(document.getElementById('est')).display:'sem'};"),
      js("X('fecharMochila')&&X('fecharMochila')();document.getElementById('inv').hidden=true;n.cfg.tela='pc';document.body.dataset.tela='pc';")]
salvar('tools/p237_hud.json', s, vp=(1280, 720))

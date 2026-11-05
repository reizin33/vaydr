"""p225: Espaço, Shift e Ctrl (pedido do Himalaia: "Espaço aumentando a sensibilidade, Ctrl abaixando e Shift assobiando").
1. com as teclas trocadas como dariam esses sintomas (sensibilidade + no Espaço, sensibilidade − no Ctrl, assobio no Shift) gravadas
   nos ajustes, o jogo abre, as teclas voltam de fábrica e avisa;
2. teclas de verdade (eventos de teclado): Espaço pula, Shift corre, = e - mudam a sensibilidade, X assobia; o helicóptero sobe
   com Espaço;
3. troca de tecla esquecida: clica numa ação na tela Teclas, sai da tela por outro caminho e aperta Espaço no jogo: nada muda;
4. controle (gamepad) de mentira, com LB e o direcional direito apertados: com teclado em uso ele fica de lado; parado o
   teclado ele gira a câmera e o LB assobia; com "Usar controle: não" ele não faz nada."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
RUIM = "{sensMais:'Space',pular:'Equal',sensMenos:'ControlLeft',assobiar:'ShiftLeft',correr:'KeyX'}"
s = [["wait", 2], ["js", "(()=>{const c=JSON.parse(localStorage.getItem('nnc_cfg_v1')||'{}');c.mapaTeclas=" + RUIM + ";localStorage.setItem('nnc_cfg_v1',JSON.stringify(c));})()"],
     ["reload"], ["wait", 3.5]]
s += [ev("abriu", "return{mapa:n.cfg.mapaTeclas,revistas:X('TECLAS_REVISTAS'),trad:X('TRAD'),toast:[...document.querySelectorAll('.toast,#toasts *')].map(e=>e.textContent).join(' | ').slice(0,300)};")]
s += inicio("X('FAUNA_POP').ativosMax=0;")
s += [["wait", 1.6], ev("aviso", "return[...document.querySelectorAll('.toast p')].map(e=>e.textContent).filter(t=>t.includes('fábrica'));")]
TECLA = "const tecla=(t,c)=>{const e=new KeyboardEvent(t,{code:c,key:c==='Space'?' ':c,bubbles:true,cancelable:true});window.dispatchEvent(e);};"
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};" + TECLA + "window.__s0=n.cfg.sens;window.__a0=P.assobioT||-9;P.noChao=true;tecla('keydown','Space');window.__vy=P.vy;tecla('keyup','Space');"), ["gwait", 0.2],
      js(TECLA + "tecla('keydown','ShiftLeft');window.__run=X('IN').run;tecla('keyup','ShiftLeft');window.__a1=P.assobioT||-9;tecla('keydown','ControlLeft');tecla('keyup','ControlLeft');window.__s1=n.cfg.sens;"
         "tecla('keydown','Equal');tecla('keyup','Equal');window.__s2=n.cfg.sens;tecla('keydown','Minus');tecla('keyup','Minus');window.__s3=n.cfg.sens;tecla('keydown','KeyX');tecla('keyup','KeyX');window.__a2=P.assobioT||-9;"),
      ev("teclas", "return{espacoPulou:window.__vy>0.5,vy:r2(window.__vy),shiftCorre:window.__run,shiftAssobiou:window.__a1!==window.__a0,sensAntes:window.__s0,depoisCtrl:window.__s1,depoisMais:window.__s2,depoisMenos:window.__s3,xAssobiou:window.__a2!==window.__a1};")]
# troca de tecla esquecida
s += [js("n.ev('abrirTeclas()');document.querySelector('#tk-lista [data-tk=\"sensMais\"]').click();window.__cap1=X('capturaTecla');n.ev('tela(null)');G.modo='jogo';" + TECLA + "tecla('keydown','Space');tecla('keyup','Space');"),
      ev("captura", "return{capturando:window.__cap1,depois:X('capturaTecla'),mapa:n.cfg.mapaTeclas,sensMais:X('teclaDe')('sensMais')};")]
# helicóptero sobe com Espaço (consertado na hora) e o painel mostra as teclas
s += [js("const v=X('VEICS').find(q=>q.tipo==='heli');Object.assign(v.pecas,{motor:100,bateria:true,rotor:2});v.comb=80;v.hp=100;vai(v.x+3,v.z+3);X('entrarVeic')(v);window.__h=v;" + TECLA + "tecla('keydown','Space');"), ["gwait", 0.6],
      js("X('updateHUD')(0.016,0);const h=document.querySelector('#painel-carro .pc-voo');window.__hud1=h&&h.textContent;"), ["gwait", 5.0],
      js(TECLA + "X('updateHUD')(0.016,0);const h=document.querySelector('#painel-carro .pc-voo');window.__hud2=h&&h.textContent;tecla('keyup','Space');window.__alt=window.__h.alt;tecla('keydown','KeyC');"), ["gwait", 6.0],
      js(TECLA + "tecla('keyup','KeyC');window.__alt2=window.__h.alt;window.__h.v=0;X('sairCarro')();"),
      ev("heli", "return{hudComecando:window.__hud1,hudVoando:window.__hud2,altura:r2(window.__alt),depoisDeDescer:r2(window.__alt2),saiu:!window.__h.ativo};")]
# controle de mentira
PAD = ("const B=i=>({pressed:i===4,value:i===4?1:0});window.__pad={id:'Controle de teste (mentira)',index:0,connected:true,mapping:'standard',axes:[0,0,0.9,0],buttons:Array.from({length:17},(_,i)=>B(i)),timestamp:1};"
       "navigator.getGamepads=()=>[window.__pad];X('GP').ativo=true;")
s += [js(PAD + "window.__y0=P.yaw;window.__aT=P.assobioT||-9;window.__kb=setInterval(()=>{const e=new KeyboardEvent('keydown',{code:'KeyL',key:'l',bubbles:true});window.dispatchEvent(e);},120);"), ["gwait", 2.0],
      js("clearInterval(window.__kb);window.__y1=P.yaw;window.__aT1=P.assobioT||-9;"), ["wait", 1.6], ["gwait", 2.0],
      js("window.__y2=P.yaw;window.__aT2=P.assobioT||-9;n.cfg.usarControle=false;window.__y3a=P.yaw;"), ["wait", 1.6], ["gwait", 2.0],
      js("window.__y3=P.yaw;n.cfg.usarControle=true;n.ev('abrirTeclas()');window.__gp=(document.getElementById('tk-gp')||{}).textContent;n.ev('tela(null)');G.modo='jogo';"),
      ev("controle", "return{comTecladoGirou:r2(window.__y1-window.__y0),comTecladoAssobiou:window.__aT1!==window.__aT,semTecladoGirou:r2(window.__y2-window.__y1),semTecladoAssobiou:window.__aT2!==window.__aT1,"
         "desligadoGirou:r2(window.__y3-window.__y3a),telaTeclas:window.__gp};")]
salvar('tools/p225_teclas.json', s, vp=(800, 450))

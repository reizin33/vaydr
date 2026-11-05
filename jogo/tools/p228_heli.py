"""p228: helicóptero (pedido do Himalaia: "não freia e não pousa"). Com teclas de verdade: decola com Espaço; anda com W até
pegar velocidade; solta tudo e mede quanto tempo leva para parar no ar; anda de novo e freia com S; desce com C até pousar
(sem dano no pouso); desce também com Ctrl; o painel mostra "Pousado"; sai com E."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
T = "const tecla=(t,c)=>{const e=new KeyboardEvent(t,{code:c,key:c==='Space'?' ':c,bubbles:true,cancelable:true});window.dispatchEvent(e);};const h=window.__h;"
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};const v=X('VEICS').find(q=>q.tipo==='heli');Object.assign(v.pecas,{motor:100,bateria:true,rotor:2});v.comb=90;v.hp=100;"
         "vai(v.x+3,v.z+3);X('entrarVeic')(v);window.__h=v;window.__r={};" + "const tecla=(t,c)=>{const e=new KeyboardEvent(t,{code:c,key:c==='Space'?' ':c,bubbles:true,cancelable:true});window.dispatchEvent(e);};tecla('keydown','Space');"), ["gwait", 6.0],
      js(T + "tecla('keyup','Space');window.__r.altDecolou=r2(h.alt);tecla('keydown','KeyW');"), ["gwait", 4.0],
      js(T + "window.__r.velW=r2(h.v);tecla('keyup','KeyW');window.__r.p0=[h.x,h.z];window.__r.alt0=h.alt;window.__t0=n.G.t;window.__parou=null;window.__chk=setInterval(()=>{if(window.__parou===null&&Math.abs(window.__h.v)<0.5)window.__parou=n.G.t-window.__t0;},30);"), ["gwait", 6.0],
      js(T + "clearInterval(window.__chk);window.__r.tempoParaParar=window.__parou===null?null:r2(window.__parou);window.__r.andouDepoisDeSoltar=r2(Math.hypot(h.x-window.__r.p0[0],h.z-window.__r.p0[1]));window.__r.altParado=r2(h.alt);window.__r.altMudou=r2(h.alt-window.__r.alt0);tecla('keydown','KeyW');"), ["gwait", 4.0],
      js(T + "tecla('keyup','KeyW');window.__r.vel2=r2(h.v);tecla('keydown','KeyS');window.__t1=n.G.t;window.__parou2=null;window.__chk2=setInterval(()=>{if(window.__parou2===null&&Math.abs(window.__h.v)<0.5)window.__parou2=n.G.t-window.__t1;},30);"), ["gwait", 3.0],
      js(T + "clearInterval(window.__chk2);tecla('keyup','KeyS');window.__r.freioS=window.__parou2===null?null:r2(window.__parou2);window.__r.velDepoisS=r2(h.v);window.__r.hp0=h.hp;tecla('keydown','KeyC');"), ["gwait", 9.0],
      js(T + "tecla('keyup','KeyC');window.__r.altC=r2(h.alt);window.__r.hpPouso=r2(h.hp-window.__r.hp0);X('updateHUD')(0.016,0);const e=document.querySelector('#painel-carro .pc-voo');window.__r.painel=e&&e.textContent;tecla('keydown','Space');"), ["gwait", 3.0],
      js(T + "tecla('keyup','Space');window.__r.subiuDeNovo=r2(h.alt);tecla('keydown','ControlLeft');"), ["gwait", 8.0],
      js(T + "tecla('keyup','ControlLeft');window.__r.altCtrl=r2(h.alt);tecla('keydown','KeyE');tecla('keyup','KeyE');"), ["gwait", 0.5],
      ev("heli", "const h=window.__h;window.__r.saiu=!h.ativo;window.__r.hpFinal=r2(h.hp);return window.__r;")]
salvar('tools/p228_heli.json', s, vp=(640, 360))

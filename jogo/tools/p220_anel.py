"""p220: a volta da cidade aberta. Confere no jogo: a faixa em volta da cidade é andável (oeste, norte e sul) e fora dela não;
a mata fechada do fim do mapa foi para a beira da faixa (e saiu da beira do corredor da estrada); as árvores da faixa têm colisão;
o tapume tem buraco nos 4 fins de rua escolhidos e continua fechado no resto; andando com W o jogador sai da mata, entra na
cidade pelo buraco do oeste e sai pelo do norte; fotos da faixa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;"),
      ev("area", "const A=X('ANEL'),C=X('CIDADE'),dm=X('dentroMapa');const p=(x,z)=>dm(x,z);"
         "return{info:X('ANEL_INFO'),oeste:p(150,-60),oeste2:p(140,100),norte:p(255,C.z0-15),sul:p(255,C.z1+15),cantoNO:p(A.x0+3,A.z0+3),"
         "foraOeste:p(A.x0-4,-100),foraNorte:p(255,A.z0-4),foraSul:p(255,A.z1+4),"
         "brenhaCorredor:X('BRENHA').filter(b=>b.x>140&&b.x<172&&Math.abs(b.z-8)<14).length,brenhaBeiraNova:X('BRENHA').filter(b=>Math.abs(b.z-A.z0)<5||Math.abs(b.z-A.z1)<5||Math.abs(b.x-A.x0)<5).length,"
         "arvoresSemColisaoNaFaixa:X('TREES').filter(t=>t.alive&&X('dentroAnel')(t.x,t.z,-3)&&!X('dentroCidade')(t.x,t.z,0)&&!X('pointBlocked')(t.x,t.z,0.1)).length};"),
      ev("tapume", "const C=X('CIDADE'),pb=X('pointBlocked');const cerca=(x,z)=>!!pb(x,z,0.3);"
         "return{brechaOesteNorte:cerca(C.x0+0.3,-44),brechaOesteSul:cerca(C.x0+0.3,58),brechaNorte:cerca(255,C.z0+0.3),brechaSul:cerca(255,C.z1-0.3),"
         "fechadoOeste:cerca(C.x0+0.3,-70),fechadoNorte:cerca(230,C.z0+0.3),fechadoSul:cerca(280,C.z1-0.3)};")]
# andar: da mata até o buraco do oeste (rua z = 58) e para dentro da cidade
ANDA = ("window.__anda=(x,z)=>{P.yaw=Math.atan2(x-P.x,z-P.z);P.body=P.yaw;const K=X('KEYS');K.KeyW=true;X('moverTeclas')();};"
        "window.__para=()=>{const K=X('KEYS');K.KeyW=false;X('moverTeclas')();};")
s += [js(ANDA + "vai(150,58);"), ["gwait", 0.3]]
for i in range(10):
    s += [js("window.__anda(X('CIDADE').x0+6,58);"), ["gwait", 1.0]]
s += [js("window.__para();"), ev("entrou_oeste", "const C=X('CIDADE');return{x:r2(P.x),z:r2(P.z),naCidade:X('dentroCidade')(P.x,P.z,1)};")]
# de dentro da cidade para fora pelo buraco do norte (rua x = 255)
s += [js("vai(255,X('CIDADE').z0+10);"), ["gwait", 0.3]]
for i in range(8):
    s += [js("window.__anda(255,X('CIDADE').z0-14);"), ["gwait", 1.0]]
s += [js("window.__para();"), ev("saiu_norte", "const C=X('CIDADE');return{x:r2(P.x),z:r2(P.z),foraDaCidade:P.z<C.z0-2,altura:r2(P.y)};")]
# fotos
s += foto("e26_anel_oeste.png", "vai(146,52);n.cfg.cam='3';P.yaw=Math.atan2(1,0.05);P.body=P.yaw;P.pitch=-0.05;")
s += foto("e26_anel_norte.png", "vai(250,X('CIDADE').z0-16);n.cfg.cam='3';P.yaw=Math.atan2(0.2,1);P.body=P.yaw;P.pitch=-0.1;")
salvar('p220_anel.json', s, vp=(960, 540))

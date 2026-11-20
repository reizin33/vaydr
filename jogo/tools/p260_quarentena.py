"""p260 (v10.8.8): quarentena do Hotel Imperial.
1 montada: o hotel, as portas de fora lacradas (fechadas) no jogo novo, a recepção
2 sem pé de cabra a porta diz que está lacrada; com ele, segurar arranca o lacre: a porta abre e os infectados nascem nos andares
3 derrubados todos, a quarentena acaba e a caixa da Defesa Civil dá o prêmio na recepção
4 5 dias depois, longe, o hotel é lacrado de novo; e o O que fazer mostra a quarentena"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__semZ=true;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;n.P.sede=100;n.P.vida=Math.max(n.P.vida,80);if(window.__semZ)n.Z.length=0;};")]
s += [ev("montada", "const Q=X('QUAR');return{ok:Q.ok,nome:Q.p&&Q.p.nome,andares:Q.p&&Q.p.andares,portas:Q.portas.map(q=>q.d.estado),lobby:Q.lobby&&[r2(Q.lobby.x),r2(Q.lobby.y),r2(Q.lobby.z)],malha:!!Q.malha,caixa:!!Q.caixa,S:X('quarD')()};"),
      js("const q=X('QUAR').portas[0],d=q.d;window.__d=d;vai(d.x+q.nx*1.4,d.z+q.nz*1.4,d.y+0.05);P.yaw=Math.atan2(-q.nx,-q.nz);P.body=P.yaw;"), ["gwait", 0.5],
      ev("semPeDeCabra", "const t=X('portaTexto')(window.__d);return{t:t&&(t.t+' | '+t.s),hold:!!(t&&t.hold)};"),
      js("X('ganhar')('peDeCabra',1);"), ["gwait", 0.2],
      ev("comPeDeCabra", "const t=X('portaTexto')(window.__d);return{t:t&&(t.t+' | '+t.s),hold:!!(t&&t.hold)};"),
      js("window.__semZ=false;Z.length=0;X('portaUsar')(window.__d,true);"), ["gwait", 1.0],
      ev("abriu", "const S=X('quarD')(),q=Z.filter(z=>z.quar&&z.vivo);const ys=[...new Set(q.map(z=>Math.round(z.y)))].sort((a,b)=>a-b);return{aberta:S.aberta,ativa:S.ativa,total:S.total,vivos:q.length,dormindo:q.filter(z=>z.st==='dorme').length,elite:q.filter(z=>z.tipo==='elite').length,alturas:ys,porta:window.__d.estado};"),
      js("const L=X('QUAR').lobby;vai(L.x,L.z,L.y+0.05);"), ["gwait", 1.2],
      ev("hud", "const el=document.getElementById('quar-hud');return{visivel:!!el&&!el.hidden,txt:el&&el.textContent};"),
      js("X('ZHIT={k:\"golpe\"}');for(const z of Z.filter(z=>z.quar&&z.vivo)){X('ZHIT={k:\"golpe\"}');X('ferirZ')(z,99999,0,0,1);}"), ["gwait", 1.5],
      ev("limpo", "const S=X('quarD')();return{feito:S.feito,mortos:S.mortos,total:S.total,vivos:Z.filter(z=>z.quar&&z.vivo).length};"),
      js("const L=X('QUAR').lobby;vai(L.x+0.9,L.z,L.y+0.05);P.yaw=-Math.PI/2;P.body=P.yaw;window.__br=conta('balaRifle');window.__kit=conta('kit');"), ["gwait", 0.5],
      ev("caixaTexto", "const a=X('interAtual')(),t=a&&X('INTER_K')[a.k]?X('INTER_K')[a.k].texto(a.o):null;return{k:a&&a.k,t:t&&(t.t+' | '+t.s)};"),
      js("const a=X('interAtual')();if(a&&a.k==='quarCaixa')X('INTER_K').quarCaixa.usar(a.o);"), ["gwait", 0.4],
      ev("premio", "const S=X('quarD')();return{pego:S.pego,balaRifle:conta('balaRifle')-window.__br,kit:conta('kit')-window.__kit,colete:conta('colete')};"),
      ev("oQueFazer1", "X('ativLimpa')();const a=X('ativTodas')().find(q=>q.id==='quar-hotel');return a?{nome:a.nome,feito:a.feito,falta:a.falta}:{sem:true};"),
      js("window.__semZ=true;Z.length=0;const S=X('quarD')();S.diaFeito=(G.dia|0)-5;const L=X('QUAR').lobby;vai(L.x+110,L.z,X('chaoEm')(L.x+110,L.z,5));"), ["gwait", 1.6],
      ev("relacrou", "const S=X('quarD')();return{aberta:S.aberta,feito:S.feito,portas:X('QUAR').portas.map(q=>q.d.estado)};"),
      ev("oQueFazer2", "X('ativLimpa')();const a=X('ativTodas')().find(q=>q.id==='quar-hotel');return a?{nome:a.nome,feito:a.feito,falta:a.falta,premio:a.premio}:{sem:true};")]
salvar('tools/p260_quarentena.json', s)

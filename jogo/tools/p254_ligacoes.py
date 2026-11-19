"""p254 (v10.8.2, Himalaia 19/11: "falta jogabilidade, coisas para fazer, itens que se conectam, desafios"):
1 Liga com: o fusível na mochila mostra "Serve para" (abrigo) e "Onde achar" (lugares do saque); o índice tem uso e lugar
  para os itens comuns (fio, fita, pregos, gasolina, bandagem)
2 "O que fazer": entram o Abrigo do Sabiá e os três desafios "Segurar a posição" (R)
3 Abrigo do Sabiá: montado no Largo do Morro; limpa a área, faz o gato (3 fios e 2 fitas) e acende; cama e baú aparecem;
  zumbi que entra na luz é empurrado para a beira
4 Segurar a posição (Feira): acende o sinalizador, as levas chegam, aguenta 90 s na área e ganha o prêmio; repetir no
  mesmo dia não deixa; e outro lugar (Posto) perde quando você sai da área"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__cadaPasso=()=>{const n=__nnc;n.P.fome=100;n.P.sede=100;if(window.__imortal)n.P.vida=100;if(window.__semZ)n.Z.length=0;};window.__semZ=true;")]
# 1 Liga com
s += [ev("liga", "const h=X('ligaHtml'),txt=id=>{const d=document.createElement('div');d.innerHTML=h(id);return d.textContent;};"
         "const I=X('ligaIndice')(),ids=['fusivel','fio','fita','pregos','gasolina','bandagem','sucata','municao9'];"
         "const cobre=ids.map(id=>[id,!!(I.uso[id]&&I.uso[id].length),X('ligaLugares')(id).length]);"
         "let comFonte=0,total=0;for(const id in X('ITEMS')){total++;if(X('ligaLugares')(id).length||I.fab[id])comFonte++;}"
         "return{fusivel:txt('fusivel'),fio:txt('fio'),cobre,comFonte,total};")]
s += [js("X('ganhar')('fusivel',1);const i=P.inv.findIndex(q=>q&&q.id==='fusivel');X('abrirMochila')('mochila');n.ev('invAba=\"mochila\";invSel='+i);X('invRender')();"),
      ["gwait", 0.2],
      ev("ligaNaMochila", "const d=document.getElementById('detalhe');const L=[...d.querySelectorAll('.liga')].map(e=>e.textContent);const r={notas:L,antesDosBotoes:!!d.querySelector('.liga + .det-acoes')};X('fecharMochila')();G.modo='jogo';return r;")]
# 2 O que fazer
s += [ev("oQueFazer", "const L=X('ativTodas')();return{total:L.length,sabia:L.filter(a=>a.id==='abrigo-sabia').map(a=>a.nome+' | '+a.falta),posicoes:L.filter(a=>a.tipo==='posicao').map(a=>a.nome+' @'+Math.round(a.x)+','+Math.round(a.z)+' | '+a.falta+' | '+a.premio)};")]
# 3 Abrigo do Sabiá
s += [ev("sabiaMontado", "const S=X('SAB'),A=S.abrigo,L=X('MOR').largo;if(!A)return{ok:false};return{ok:true,x:r2(A.x),z:r2(A.z),y:r2(A.y),largo:[L.x0,L.x1,r2(L.z0),r2(L.z1)],quadro:[r2(A.quadro.x),r2(A.quadro.z)],cama:[r2(A.cama.x),r2(A.cama.z)],"
         "quadroLivre:!X('pointBlocked')(A.quadro.x+0.9,A.quadro.z,0.3),camaLivre:!X('pointBlocked')(A.cama.x,A.cama.z+0.9,0.3),malha:!!S.malha};"),
      js("const A=X('SAB').abrigo;window.__semZ=true;vai(A.x,A.z,A.y+0.05);"), ["gwait", 1.5],
      ev("sabiaLimpo", "const A=X('SAB').abrigo,S=X('abrigoD')(A.id);return{limpo:S.limpo,ligado:S.ligado};"),
      js("const A=X('SAB').abrigo;X('ganhar')('fio',3);X('ganhar')('fita',2);vai(A.quadro.x+0.7,A.quadro.z,A.y+0.05);P.yaw=P.body=-Math.PI/2;"), ["gwait", 0.4],
      ev("sabiaQuadro", "const A=X('SAB').abrigo;const t=X('INTER_K').abrigoQuadro.texto(A);X('INTER_K').abrigoQuadro.usar(A,true);const S=X('abrigoD')(A.id);"
         "return{texto:t.t+' | '+t.s,ligado:S.ligado,fio:X('invCount')('fio'),fita:X('invCount')('fita'),luzes:X('FIRES').filter(f=>f.abrigo==='sabia').length};"),
      js("const A=X('SAB').abrigo;window.__semZ=false;Z.length=0;const q=ZZ('walker',A.x+3,A.z+2);if(q){q.st='caca';window.__zq=q;}vai(A.x,A.z,A.y+0.05);"), ["gwait", 1.0],
      ev("sabiaLuz", "const A=X('SAB').abrigo,q=window.__zq;return q?{dist:r2(Math.hypot(q.x-A.x,q.z-A.z)),rIn:r2(A.r*0.55),st:q.st}:{semZumbi:true};"),
      js("window.__semZ=true;Z.length=0;")]
# 4 Segurar a posição na Feira (imortal), depois repetir e perder no Posto
s += [js("window.__semZ=false;window.__imortal=true;Z.length=0;const R=X('POSICOES').find(q=>q.id==='feira'),p=X('posicaoLugar')(R);vai(p.x,p.z,p.y+0.05);"), ["gwait", 0.5],
      ev("feiraIni", "const R=X('POSICOES').find(q=>q.id==='feira');const t=X('INTER_K').posicaoIni.texto(R);X('INTER_K').posicaoIni.usar(R,true);return{texto:t.t+' | '+t.s,ativo:!!X('RES').ativo,p:R.p&&[r2(R.p.x),r2(R.p.y),r2(R.p.z)]};"),
      ["gwait", 8],
      ev("feiraLeva1", "const RES=X('RES');return{t:r2(RES.t),leva:RES.leva,nasceram:RES.ids.length,vivos:Z.filter(z=>z.posicao&&z.vivo).length,hud:(document.getElementById('posicao-hud')||{}).textContent};"),
      js("const R=X('POSICOES').find(q=>q.id==='feira'),p=R.p;window.__guarda=setInterval(()=>{const P=__nnc.P;if(Math.hypot(P.x-p.x,P.z-p.z)>R.r-2){P.x=p.x;P.z=p.z;P.y=p.y+0.05;}},200);"),
      ["gwait", 90],
      ev("feiraFim", "clearInterval(window.__guarda);const R=X('POSICOES').find(q=>q.id==='feira'),S=X('posicaoD')('feira');return{ativo:!!X('RES').ativo,feito:S.feito,vitorias:S.vitorias,municao9:X('invCount')('municao9'),kit:X('invCount')('kit'),"
         "levas:X('RES').leva,nasceram:X('RES').ids.length,repetir:X('INTER_K').posicaoIni.texto(R).t};"),
      js("window.__semZ=true;Z.length=0;const R=X('POSICOES').find(q=>q.id==='posto'),p=X('posicaoLugar')(R);vai(p.x,p.z,p.y+0.05);"), ["gwait", 0.4],
      ev("postoLugar", "const R=X('POSICOES').find(q=>q.id==='posto'),p=R.p;return{p:[r2(p.x),r2(p.y),r2(p.z)],livre:!X('pointBlocked')(p.x,p.z,0.4),chao:r2(X('ground')(p.x,p.z))};"),
      js("window.__semZ=false;const R=X('POSICOES').find(q=>q.id==='posto');X('INTER_K').posicaoIni.usar(R,true);"), ["gwait", 4],
      js("const R=X('POSICOES').find(q=>q.id==='posto'),p=R.p;vai(p.x+R.r+8,p.z,X('chaoEm')(p.x+R.r+8,p.z,p.y+3));"), ["gwait", 8],
      ev("postoSaiu", "const S=X('posicaoD')('posto');return{ativo:!!X('RES').ativo,feito:S.feito,vivo:P.alive,vida:Math.round(P.vida),mortes:G.mortes};"),
      js("window.__imortal=false;window.__semZ=true;Z.length=0;vivo();")]
# 5 corrida Subida do Sabiá: os pontos (Feira, Escadaria, Largo, caixa-d'água) e uma volta pulando de ponto em ponto
s += [ev("sabiaCorrida", "const C=X('SAB').corrida;if(!C)return{ok:false};return{ok:true,ini:[r2(C.ini.x),r2(C.ini.y),r2(C.ini.z)],pts:C.pts.map(p=>[r2(p.x),r2(p.y),r2(p.z)]),tempos:C.tempos,"
         "livres:C.pts.map(p=>!X('pointBlocked')(p.x,p.z,0.3)),chaoOk:C.pts.map(p=>r2(X('chaoEm')(p.x,p.z,p.y+0.5)-p.y))};"),
      js("window.__semZ=true;Z.length=0;const C=X('SAB').corrida;window.__c=C;vai(C.ini.x,C.ini.z,C.ini.y);window.__f0=X('invCount')('fusivel');X('corridaComecar')(C);"), ["gwait", 3.4]]
for i in range(6):
    s += [js("const C=window.__c,p=C.pts[" + str(i) + "];if(p)vai(p.x,p.z,p.y+0.05);"), ["gwait", 0.6]]
s += [ev("sabiaCorridaFim", "const C=window.__c,S=X('corridaD')(C.id);return{ativa:!!X('CORR').ativa,melhor:S.melhor,medalha:S.medalha,fusivel:X('invCount')('fusivel')-window.__f0};")]
# 6 viajar entre abrigos acesos: do Sabiá (aceso no passo 3) para a Matriz (acesa aqui)
s += [js("window.__semZ=true;Z.length=0;const D=X('abrigoD');D('matriz').limpo=true;D('matriz').ligado=true;const A=X('SAB').abrigo;vai(A.x,A.z,A.y+0.05);X('abrirMapa')();"), ["gwait", 0.3],
      ev("viagemLista", "const el=document.getElementById('mapa-ativ');const bs=el?[...el.querySelectorAll('[data-viajar]')].map(b=>b.dataset.viajar):[];const h=el&&el.querySelector('h3');return{botoes:bs,titulo:h&&h.textContent,onde:X('abrigoOnde')()&&X('abrigoOnde')().id};"),
      js("window.__tm0=G.tm;const M=X('ABRIGOS').find(q=>q.id==='matriz');X('abrigoViajar')(M);"), ["gwait", 0.3],
      ev("viagem", "const M=X('ABRIGOS').find(q=>q.id==='matriz');return{modo:G.modo,dist:r2(Math.hypot(P.x-M.cama.x,P.z-M.cama.z)),dy:r2(P.y-M.cama.y),minutos:Math.round(G.tm-window.__tm0),cama:G.cama&&G.cama.abrigo,onde:X('abrigoOnde')()&&X('abrigoOnde')().id};")]
salvar('tools/p254_ligacoes.json', s)

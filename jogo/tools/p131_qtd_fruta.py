"""p131: (1) fabricar com quantidade: −/+/Máx no painel, materiais mostram o total, 'Fabricar × N' fabrica N de uma vez;
o mouse aparece com o painel aberto e some ao fechar (classe sem-cursor). (2) colher fruta segurando E num pé de fruta da
vila e num de sítio, parado num lugar livre ao lado do tronco (com registro do que acontece a cada passo).
(3) foto: pé de fruta de sítio ao lado de uma macieira plantada, com fruta nas duas."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
B = ("const FR=X('FRUTEIRAS'),W=X('pomarD')(),r4=v=>Math.round(v*1e4)/1e4,"
     "inv=()=>{const o={};for(const k of['linha','fibra','maca','laranja','manga','acerola'])o[k]=conta(k);return o;},dif=(a,b)=>{const o={};for(const k in b)if(b[k]!==a[k])o[k]=b[k]-a[k];return o;},"
     "livre=(f,r)=>{for(let i=0;i<16;i++){const a=i*Math.PI/8,x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r;if(!X('pointBlocked')(x,z,0.3)&&!X('emPredios')(x,z,0.3)&&!X('salaEm')(x,f.y+0.4,z))return[x,z];}return null;},"
     "Q=s=>document.querySelector(s);")
s = inicio()
# --- (1) quantidade na fabricação ---
s += [js(B + "vivo();Z.length=0;G.hora=10;X('invRemove')('fibra',999);X('invAdd')('fibra',12);const i=X('RECIPES').findIndex(r=>r.faz==='linha'&&r.custo.fibra===3);window.__i=i;"
         "window.__cls0=document.body.classList.contains('sem-cursor');X('abrirMochila')('fabricar');n.ev('fabSel='+i);X('invRender')();window.__a=inv();"),
      ["wait", 0.4],
      ev("painel", B + "const q=Q('#fab-info .fab-qtd');return{modo:G.modo,i:window.__i,qtd:!!q,n:q&&q.querySelector('.n').textContent,botao:Q('#fab-info [data-fab]').textContent,semCursorJogo:window.__cls0,semCursorPainel:document.body.classList.contains('sem-cursor')};"),
      js("document.querySelector('#fab-info [data-qtd=\"1\"]').click();document.querySelector('#fab-info [data-qtd=\"1\"]').click();"), ["wait", 0.2],
      ev("mais2", B + "return{n:Q('#fab-info .fab-qtd .n').textContent,rotulo:[...document.querySelectorAll('#fab-info .rot-grade')].map(e=>e.textContent),req:Q('#fab-info .req .n').textContent,botao:Q('#fab-info [data-fab]').textContent};"),
      js("document.querySelector('#fab-info [data-qtd=\"max\"]').click();"), ["wait", 0.2],
      ev("maximo", B + "return{n:Q('#fab-info .fab-qtd .n').textContent,botao:Q('#fab-info [data-fab]').textContent,maxDesab:Q('#fab-info [data-qtd=\"max\"]').disabled};"),
      js("document.querySelector('#fab-info [data-fab]').click();"), ["wait", 0.3],
      ev("fabricou", B + "const q=Q('#fab-info .fab-qtd');return{ganhou:dif(window.__a,inv()),qtdVisivel:!!q,botao:Q('#fab-info [data-fab]')&&Q('#fab-info [data-fab]').textContent,desab:Q('#fab-info [data-fab]')&&Q('#fab-info [data-fab]').disabled};"),
      ["press", "Tab"], ["wait", 0.3],
      ev("fechou", "return{modo:G.modo,semCursor:document.body.classList.contains('sem-cursor')};")]
# --- (2) colher fruta: vila (FR[0]) e sítio (último) ---
for nome, idx in (("vila", "0"), ("sitio", "FR.length-1")):
    s += [js(B + "G.hora=10;Z.length=0;const f=FR[" + idx + "];W[f.id]=1;const p=livre(f,1.35)||livre(f,1.7)||[f.x+1.3,f.z];window.__f=f.id;vai(p[0],p[1]);mira(f.x,f.y+1.2,f.z);window.__a=inv();"
             "window.__log=[];window.__cadaPasso=()=>{if(window.__log.length<500){const a=n.ev('alvoInter');window.__log.push((P.acao?P.acao.tipo+':'+(P.acao.alvo&&P.acao.alvo.k):'-')+'|'+(a?a.k:'-')+'|'+P.vida);}};"),
          ["gwait", 0.4],
          ev("alvo_" + nome, B + "const f=FR.find(x=>x.id===window.__f),a=X('alvoInter');return{id:f.id,fruta:f.fruta,dist:r4(Math.hypot(f.x-P.x,f.z-P.z)),alvo:a&&a.k,alvoId:a&&a.o&&a.o.id,modo:G.modo,acao:P.acao&&P.acao.tipo};"),
          ["down", "e"], ["wait", 1.8], ["up", "e"], ["gwait", 0.3],
          ev("colheu_" + nome, B + "const f=FR.find(x=>x.id===window.__f);window.__cadaPasso=null;const L=window.__log,seq=[];for(const s of L)if(seq[seq.length-1]!==s)seq.push(s);"
             "return{w:W[f.id],ganhou:dif(window.__a,inv()),seq:seq.slice(0,14),dist:r4(Math.hypot(f.x-P.x,f.z-P.z))};")]
# --- (3) foto: pé de fruta de sítio ao lado de uma macieira plantada ---
s += foto("715_pomar.png", B + "G.hora=10;G.chuva=0;Z.length=0;const f=FR[FR.length-1];W[f.id]=1;const p=livre(f,3.4)||[f.x+3.4,f.z];const o=X('criarObra')('macieira',p[0],p[1],0);o.ext.cresce=1;o.ext.fruto=1;"
          "const mx=(o.x+f.x)/2,mz=(o.z+f.z)/2,dx=o.x-f.x,dz=o.z-f.z,L=Math.hypot(dx,dz)||1,cx=mx-dz/L*8,cz=mz+dx/L*8;vai(mx-dz/L*4,mz+dx/L*4);"
          "G.camFix={pos:[cx,f.y+2.6,cz],tgt:[mx,f.y+1.7,mz],fov:1.0};", 0.6, 4.0)
salvar('p131.json', s)

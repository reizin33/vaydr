"""p98: subterrâneos (bunker, túnel, estação escondida, mina, caverna, laboratório, abrigo da vila): estrutura, descer/subir,
andar e colisão lá embaixo, portas com cartão/chave/código/energia/parede rachada/entulho, documentos, minério, zumbis presos,
isolamento entre superfície e subsolo, salvar/carregar e fotos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const S=X('SUB'),D=()=>X('subD')(),ent=id=>S.entradas.find(e=>e.id===id),pt=f=>S.portas.find(f),sala=nm=>S.salas.find(s=>s.nome===nm),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),IK=X('INTER_K'),IN=X('IN'),YS=X('Y_SUB'),"
     "dentro=(x,z)=>!!X('salaSubEm')(x,YS+0.5,z),andar=(yaw)=>{P.yaw=yaw;P.body=yaw;IN.mz=1;IN.mx=0;},parar=()=>{IN.mz=0;IN.mx=0;};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
# o teste confere portas, documentos, teclado, caixas e salvar/carregar lá embaixo, não o combate: a vida volta a 100 a cada passo
# (com 5 zumbis no bunker, o jogador morria no caminho e o resto do teste ficava sem sentido)
s += [js("window.__cadaPasso=()=>{P.vida=100;};")]
# ---------- estrutura ----------
s += [ev("estrutura", F+"let sobre=0;for(const a of S.salas)for(const b of S.salas){if(a===b)continue;if(a.x0<b.x1-0.01&&b.x0<a.x1-0.01&&a.z0<b.z1-0.01&&b.z0<a.z1-0.01)sobre++;}"
     # grafo: salas ligadas por passagem livre ou porta (ignora as trancas) e alcance a partir de cada entrada
     "const viz=new Map();const liga=(a,b)=>{(viz.get(a)||viz.set(a,[]).get(a)).push(b);(viz.get(b)||viz.set(b,[]).get(b)).push(a);};for(const l of S.ligas)liga(l.A,l.B);"
     "const alc=s0=>{const v=new Set([s0]),q=[s0];while(q.length){const a=q.pop();for(const b of viz.get(a)||[])if(!v.has(b)){v.add(b);q.push(b);}}return v;};"
     "const tudo=alc(X('salaSubEm')(ent('bunker').sub[0],YS+0.5,ent('bunker').sub[1]));"
     "const ilhas=S.salas.filter(s=>!tudo.has(s)&&s.c.id!=='abrigo').map(s=>s.nome);"
     "const foraSala=[...S.terminais,...S.caixas,...S.veios].filter(o=>!X('salaSubEm')(o.x,YS+0.5,o.z)).map(o=>o.id);"
     "const entOk=S.entradas.every(e=>!!X('salaSubEm')(e.sub[0],YS+0.5,e.sub[1]));"
     "const bloq=[...S.terminais,...S.caixas].filter(o=>{const dx=Math.sin(X('subYaw')(o))*0.75,dz=Math.cos(X('subYaw')(o))*0.75;return X('bloqueadoAlto')(o.x+dx,o.z+dz,0.25,YS+0.1);}).map(o=>o.id);"
     "return{salas:S.salas.length,portas:S.portas.length,ligas:S.ligas.length,entradas:S.entradas.length,complexos:S.complexos.map(c=>c.id).join(','),sobrepostas:sobre/2,"
     "foraDaRede:ilhas,objetosForaDeSala:foraSala,entradasOk:entOk,frenteBloqueada:bloq,trancas:S.portas.map(d=>d.tranca.tipo).join(',')};")]
# ---------- descer pelo alçapão da base ----------
s += [js(F+"vivo();vazio();P.lanterna=true;const e=ent('bunker');vai(e.sup[0]+0.8,e.sup[1]+0.5);window.__antes=X('interAtual')();IK.entradaSub.usar(e);"), ["wait", 1.6], ["gwait", 0.3],
      ev("descer", F+"const s=X('salaEm')(P.x,P.y+0.3,P.z);return{alvoAntes:window.__antes&&window.__antes.k,y:r2(P.y),noSubsolo:X('noSubsolo')(),sala:s&&s.nome,teto:r2(X('tetoEm')(P.x,P.y+0.3,P.z)),"
         "interior:X('interiorEm')(P.x,P.y+0.3,P.z),abrigado:X('abrigado')(),visitou:!!D().visitou.bunker,zumbisSub:Z.filter(q=>q.vivo&&q.subsolo).length,diario:!!X('G').diario.desc['subsolo:bunker']};")]
# ---------- andar no corredor e bater na porta trancada do arsenal ----------
s += [js(F+"Z.length=0;vai(-112,-31.6,YS);andar(Math.PI/2);"), ["gwait", 2.0], js(F+"parar();"),
      ev("andar", F+"return{x:r2(P.x),y:r2(P.y),z:r2(P.z),dentro:dentro(P.x,P.z),noChao:P.noChao};"),
      js(F+"vai(-111,-31.6,YS);andar(Math.PI);"), ["gwait", 2.0], js(F+"parar();"),
      ev("portaTrancada", F+"const d=pt(d=>d.B.nome==='Arsenal');return{z:r2(P.z),parouNaPorta:P.z>-33.4,texto:IK.portaSub.texto(d).t,aberta:d.aberta};"),
      js(F+"add('cartaoMilitar',1);const d=pt(d=>d.B.nome==='Arsenal');IK.portaSub.usar(d,false);vai(-111,-31.6,YS);andar(Math.PI);"), ["gwait", 2.5], js(F+"parar();"),
      ev("portaCartao", F+"const d=pt(d=>d.B.nome==='Arsenal');const s=X('salaSubEm')(P.x,P.y+0.5,P.z);return{aberta:d.aberta,z:r2(P.z),sala:s&&s.nome,colisor:!!d.col};")]
# ---------- terminal do arsenal (código) e do comando ----------
s += [js(F+"vai(-109.4,-36.5,YS);P.yaw=P.body=Math.PI/2;"), ["gwait", 0.2],
      ev("alvoTerminal", F+"const a=X('interAtual')();return{k:a&&a.k,doc:a&&a.o&&a.o.doc};"),
      js(F+"IK.terminalSub.usar(S.terminais.find(t=>t.id==='t_arsenal'));"), ["wait", 0.4],
      ev("docArsenal", F+"const tx=document.getElementById('doc-txt').textContent;return{modo:G.modo,tela:!document.getElementById('t-doc').hidden,temCodigo:tx.indexOf(D().codigo.arsenal)>=0,lido:!!D().docs.inventario};"),
      js("window.__semRender=false;window.__turbo=1;"), ["wait", 1.2], ["shot", "381_documento.png"], js("window.__semRender=true;window.__turbo=6;"),
      js(F+"X('fecharDoc')();IK.terminalSub.usar(S.terminais.find(t=>t.id==='t_bunker'));X('fecharDoc')();")]
# ---------- parede rachada (machado) e gerador do bunker ----------
s += [js(F+"vazio();add('machado',1);const d=pt(d=>d.tranca.tipo==='rachada');vai(d.x,d.z+1.2,YS);window.__dur=P.inv.find(q=>q&&q.id==='machado').dur;window.__txtR=IK.portaSub.texto(d);IK.portaSub.usar(d,true);"),
      ev("rachada", F+"const d=pt(d=>d.tranca.tipo==='rachada');const m=P.inv.find(q=>q&&q.id==='machado');return{texto:window.__txtR.t,segurar:!!window.__txtR.hold,aberta:d.aberta,durAntes:window.__dur,durDepois:m&&m.dur};"),
      js(F+"vazio();const d=pt(d=>d.tranca.tipo==='energia');vai(-93,-32.6,YS);window.__semEnergia=IK.portaSub.texto(d).s;IK.portaSub.usar(d,false);window.__ab0=d.aberta;add('gasolina',1);IK.geradorSub.usar(S.geradorBunker);IK.portaSub.usar(d,false);"),
      ev("energia", F+"const d=pt(d=>d.tranca.tipo==='energia');return{semEnergia:window.__semEnergia,abriuSemEnergia:window.__ab0,energia:!!D().energia.bunker,aberta:d.aberta,gasolina:conta('gasolina')};")]
# ---------- túnel de serviço até a estação (andando) ----------
s += [js(F+"vai(-92.5,-36,YS);andar(Math.PI);"), ["gwait", 8], js(F+"parar();"),
      ev("tunel", F+"const s=X('salaSubEm')(P.x,P.y+0.5,P.z);return{z:r2(P.z),y:r2(P.y),sala:s&&s.nome};")]
# ---------- teclado: sala de controle da estação ----------
s += [js(F+"const d=pt(d=>d.tranca.tipo==='codigo'&&d.tranca.cod==='arsenal');vai(d.x-1.0,d.z,YS);IK.portaSub.usar(d,false);"), ["wait", 0.3],
      js(F+"for(const k of '0000')X('tecladoTecla')(k);X('tecladoTecla')('ok');"),
      ev("tecladoErrado", F+"const d=pt(d=>d.tranca.tipo==='codigo'&&d.tranca.cod==='arsenal');return{modo:G.modo,msg:document.getElementById('tc-msg').textContent,aberta:d.aberta};"),
      js(F+"const c=D().codigo.arsenal;for(const k of c.slice(0,2))X('tecladoTecla')(k);"), js("window.__semRender=false;window.__turbo=1;"), ["wait", 1.0], ["shot", "380_teclado.png"], js("window.__semRender=true;window.__turbo=6;"),
      js(F+"const c=D().codigo.arsenal;for(const k of c.slice(2))X('tecladoTecla')(k);X('tecladoTecla')('ok');"),
      ev("tecladoCerto", F+"const d=pt(d=>d.tranca.tipo==='codigo'&&d.tranca.cod==='arsenal');return{modo:G.modo,aberta:d.aberta};")]
# ---------- portão da mina (chave) e entulho da caverna (picareta); minério ----------
s += [js(F+"vazio();const d=pt(d=>d.tranca.tipo==='chave');vai(d.x+1,d.z,YS);IK.portaSub.usar(d,false);window.__semChave=d.aberta;add('chaveMina',1);IK.portaSub.usar(d,false);"),
      ev("chaveMina", F+"const d=pt(d=>d.tranca.tipo==='chave');return{semChave:window.__semChave,comChave:d.aberta};"),
      js(F+"vazio();add('picareta',1);const ds=S.portas.filter(d=>d.tranca.tipo==='entulho');for(const d of ds){vai(d.x+(d.eixo==='z'?1:0),d.z+(d.eixo==='x'?1:0),YS);IK.portaSub.usar(d,true);}"),
      ev("entulho", F+"return{abertas:S.portas.filter(d=>d.tranca.tipo==='entulho').map(d=>d.aberta),pedra:conta('pedra')};"),
      js(F+"const v=S.veios[0];vai(v.x+1.0,v.z,YS);window.__tv=IK.veioSub.texto(v);IK.veioSub.usar(v,true);window.__tv2=IK.veioSub.texto(v).t;"),
      ev("veio", F+"return{texto:window.__tv.t,segurar:!!window.__tv.hold,minerio:conta('minerioFerro'),depois:window.__tv2};")]
# ---------- caixas: chave da mina no abrigo, cartão do laboratório na segurança ----------
s += [js(F+"vazio();const c=S.caixas.find(c=>c.id==='cx_abr2');IK.caixaSub.usar(c);"), ["wait", 0.3],
      ev("caixaAbrigo", F+"const L=D().caixas.cx_abr2;return{modo:G.modo,temChave:L.some(q=>q&&q.id==='chaveMina'),itens:L.filter(Boolean).map(q=>q.id).join(',')};"),
      js(F+"X('fecharMochila')();const c=S.caixas.find(c=>c.id==='cx_seg');IK.caixaSub.usar(c);"), ["wait", 0.3],
      ev("caixaSeg", F+"const L=D().caixas.cx_seg;return{temCartao:L.some(q=>q&&q.id==='cartaoLab')};"), js(F+"X('fecharMochila')();")]
# ---------- isolamento: embaixo das caixas da base, o que é de cima não aparece ----------
s += [js(F+"vazio();const b=X('INTER').find(i=>i.id==='base-caixa0');vai(b.x,b.z,YS);window.__i1=X('interAtual')();const b2=X('INTER').find(i=>i.id==='base-comandante');vai(b2.x+0.3,b2.z,YS);window.__i2=X('interAtual')();"),
      ev("isolamento", F+"return{embaixoCaixa:window.__i1&&window.__i1.k,embaixoComandante:window.__i2&&window.__i2.k};")]
# ---------- zumbis presos ficam lá embaixo; zumbi de cima não te vê (a vida volta a 100 a cada passo e o dano é somado:
# com 6 zumbis lá embaixo o jogador morria e o resto do teste, salvar e carregar no subsolo, ficava sem sentido) ----------
s += [js(F+"Z.length=0;D().populou={};const n0=X('subPopular')(S.complexos.find(c=>c.id==='bunker'));window.__nz=n0;vai(-104,-31.5,YS);P.lanterna=true;const q=X('criarZ')('walker',-104,-30.5,{y:X('ground')(-104,-30.5)});q.st='vaga';window.__zc=q;window.__dano=0;window.__cadaPasso=()=>{if(P.vida<100){window.__dano+=100-P.vida;P.vida=100;}};"),
      ["gwait", 4],
      ev("zumbis", F+"const sub=Z.filter(q=>q.subsolo&&q.vivo);return{criados:window.__nz,embaixo:sub.length,yOk:sub.every(q=>q.y<-25),cimaY:r2(window.__zc.y),cimaEstado:window.__zc.st,dano:Math.round(window.__dano)};"), js("window.__cadaPasso=()=>{P.vida=100;};")]
# ---------- salvar e carregar lá embaixo ----------
s += [js(F+"Z.length=0;vai(-110,-36.5,YS);X('salvarJogo')();"), js(F+"X('carregarJogo')();X('jogar')();"), ["gwait", 1.0],
      ev("carregar", F+"return{y:r2(P.y),noSubsolo:X('noSubsolo')(),arsenalAberto:pt(d=>d.B.nome==='Arsenal').aberta,rachadaAberta:pt(d=>d.tranca.tipo==='rachada').aberta,energia:!!D().energia.bunker,"
         "docs:Object.keys(D().docs).length,codigoIgual:!!D().codigo.lab};")]
# ---------- fotos ----------
s += foto("370_bunker_corredor.png", F+"vivo();Z.length=0;P.lanterna=true;vai(-113.5,-31.5,YS);P.yaw=P.body=Math.PI/2;G.camFix={pos:[-115.2,YS+1.9,-31.2],tgt:[-100,YS+1.2,-31.8]};", 0.3)
s += foto("371_comando.png", F+"vai(-99.5,-35,YS);G.camFix={pos:[-98.2,YS+2.2,-34.0],tgt:[-102.5,YS+0.9,-40.0]};", 0.3)
s += foto("372_arsenal.png", F+"vai(-110,-34.4,YS);G.camFix={pos:[-109.2,YS+2.0,-33.6],tgt:[-112.8,YS+0.9,-38.6]};", 0.3)
s += foto("373_estacao.png", F+"vai(-82,-76,YS);G.camFix={pos:[-81.5,YS+2.6,-75.0],tgt:[-95,YS+1.0,-83.5]};", 0.3)
s += foto("374_mina.png", F+"vai(-106,-83,YS);G.camFix={pos:[-105.2,YS+2.0,-81.0],tgt:[-106.6,YS+0.8,-93]};", 0.3)
s += foto("375_caverna.png", F+"vai(-118,-95,YS);G.camFix={pos:[-114.0,YS+2.4,-93.5],tgt:[-121.5,YS+1.0,-101]};", 0.3)
s += foto("376_lab_cultivo.png", F+"pt(d=>d.B.nome==='Sala de cultivo').aberta=true;vai(-47,-115,YS);G.camFix={pos:[-43.2,YS+2.0,-114.8],tgt:[-50.5,YS+0.6,-119.5]};", 0.3)
s += foto("377_nucleo.png", F+"vai(-39,-118,YS);G.camFix={pos:[-40.6,YS+2.6,-117.0],tgt:[-35.5,YS+1.5,-123.0]};", 0.3)
s += foto("378_abrigo.png", F+"vai(52,-60,YS);G.camFix={pos:[49.0,YS+2.2,-58.6],tgt:[56,YS+0.6,-64.5]};", 0.3)
s += [js("G.camFix=null;")]
# ---------- subir e as entradas na superfície ----------
s += [js(F+"const e=ent('bunker');vai(e.sub[0],e.sub[1]+0.3,YS);IK.saidaSub.usar(e);"), ["wait", 1.6], ["gwait", 0.3],
      ev("subir", F+"const e=ent('bunker');return{y:r2(P.y),chao:r2(X('ground')(P.x,P.z)),noSubsolo:X('noSubsolo')(),dist:r2(Math.hypot(P.x-e.sup[0],P.z-e.sup[1]))};")]
s += foto("382_alcapao_base.png", F+"vivo();const e=ent('bunker');vai(e.sup[0]+3,e.sup[1]+3);G.hora=10;G.camFix={pos:[e.sup[0]+3.5,X('ground')(e.sup[0],e.sup[1])+2.6,e.sup[1]+3.5],tgt:[e.sup[0],X('ground')(e.sup[0],e.sup[1])+0.2,e.sup[1]]};", 0.3)
s += foto("383_entrada_mina.png", F+"const e=ent('mina');vai(e.sup[0]+5,e.sup[1]+6);const g=X('ground')(e.sup[0],e.sup[1]);G.camFix={pos:[e.sup[0]+Math.sin(e.sup[2])*-7,g+3,e.sup[1]+Math.cos(e.sup[2])*-7],tgt:[e.sup[0],g+1.4,e.sup[1]]};", 0.3)
s += foto("384_boca_caverna.png", F+"const e=ent('caverna');vai(e.sup[0]+6,e.sup[1]+6);const g=X('ground')(e.sup[0],e.sup[1]);G.camFix={pos:[e.sup[0]+Math.sin(e.sup[2])*-8,g+3,e.sup[1]+Math.cos(e.sup[2])*-8],tgt:[e.sup[0],g+1.4,e.sup[1]]};", 0.3)
s += [js("G.camFix=null;")]
salvar('p98.json', s)

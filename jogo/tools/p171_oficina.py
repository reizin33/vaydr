"""p171: Etapa 12 (fabricação, manual e equipamento).
Manual de Sobrevivência (N e pausa; todas as receitas; bloqueada sem ingredientes nem processo; desbloqueia com o tratado; busca; tecla na
troca de teclas); aba Fabricar sem materiais de receita bloqueada; mesa de estudo (estuda camiseta e colete e aprende; planta da estufa);
bancada de desmanche (peças de carro com o kit; desmontar item rende mais que na mão; confirmação); recuperação no mundo (carro de
estrada pela interação de verdade, móvel de casa some da malha e do colisor, máquina, destroços de avião, sem ferramenta não deixa);
baú do ferreiro com o Tratado do armeiro; armaduras de malha fabricadas na fornalha (vestir, proteção com teto maior, mais lento,
barulho por passo, cansaço, conserto com anéis na fornalha); progresso (consertos ensinam a calça reforçada); sujeira (gasta mais,
esquenta menos, nadar e lavar limpam, garrafa d'água, cor na roupa, barra na mochila, botão Lavar); desgaste pelo uso; salvar e carregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const vis=id=>{const e=document.getElementById(id);return!!(e&&!e.hidden);},RI=f=>X('RECIPES').findIndex(r=>r.faz===f),est=f=>X('receitaEstado')(X('RECIPES')[RI(f)]),"
     "cheio=()=>{P.roupa.costas='mochilaExpedicao';},inv=(id,n,ex)=>X('invAdd')(id,n,ex),PS=nome=>X('PASSOS').find(f=>f.name===nome);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);cheio();G.hora=10;G.noite=false;"
        "n.ev(\"{const _b=barulho;barulho=function(x,z,r){(window.__brs||(window.__brs=[])).push(r);return _b.apply(this,arguments);};}\");")]
# ---- manual: abre com N, conta tudo, bloqueada sem ingredientes ----
s += [["press", "KeyN"], ["wait", 0.4],
      e("manualAbre", "const L=X('mnEntradas')(),R=X('RECIPES'),O=Object.keys(X('OBRAS')).filter(k=>X('OBRAS')[k].custo&&X('OBRAS')[k].nome);"
        "let proc=0;for(const t in X('PROCESSOS'))proc+=X('PROCESSOS')[t].rec.length;"
        "return{tela:vis('t-manual'),modo:G.modo,total:L.length,receitas:L.filter(e=>e.id[0]==='r').length,recipes:R.length,obras:L.filter(e=>e.id.startsWith('o:')).length,obrasCat:O.length,"
        "proc:L.filter(e=>e.id.startsWith('p:')).length,procCat:proc,curtir:L.filter(e=>e.id.startsWith('c:')).length,cozinha:L.filter(e=>e.id.startsWith('k:')).length,melhor:L.filter(e=>e.id.startsWith('u:')).length,"
        "desm:L.filter(e=>e.id.startsWith('d:')||e.id.startsWith('w:')).length,travadas:L.filter(e=>e.trav).length,abas:[...document.querySelectorAll('#mn-abas [data-sec]')].map(b=>b.textContent),"
        "cont:document.getElementById('mn-cont').textContent,itens:document.querySelectorAll('#mn-lista .mn-it').length};"),
      j("X('mnSec=\"roupas\"');X('mnSel=\"r'+RI('capaceteMalha')+'\"');X('manualRender')();"), ["wait", 0.2],
      e("bloqueada", "const d=document.getElementById('mn-det');return{nome:d.querySelector('h3').textContent,trava:!!d.querySelector('.mn-trava'),ing:!!d.querySelector('.mn-ing'),proc:!!d.querySelector('.mn-proc'),"
        "como:d.querySelector('.mn-trava')&&d.querySelector('.mn-trava').textContent.slice(0,160),listaTrav:!!document.querySelector('#mn-lista [aria-pressed=true].trav')};"),
      j("X('mnSel=\"r'+RI('bandagem')+'\"');X('mnSec=\"cura\"');X('manualRender')();"), ["wait", 0.2],
      e("liberada", "const d=document.getElementById('mn-det');return{nome:d.querySelector('h3').textContent,h4:[...d.querySelectorAll('h4')].map(h=>h.textContent),ing:d.querySelectorAll('.mn-ing li').length,passos:d.querySelectorAll('.mn-proc li').length,img:!!d.querySelector('.mn-img svg'),res:!!d.querySelector('.mn-res')};"),
      j("const b=document.getElementById('mn-busca');b.value='malha';b.dispatchEvent(new Event('input'));"), ["wait", 0.2],
      e("busca", "return{n:document.querySelectorAll('#mn-lista .mn-it').length,nomes:[...document.querySelectorAll('#mn-lista .mn-it span')].map(s=>s.textContent)};"),
      j("const b=document.getElementById('mn-busca');b.value='';b.dispatchEvent(new Event('input'));"),
      ["press", "KeyN"], ["wait", 0.3],
      e("manualFecha", "return{tela:vis('t-manual'),modo:G.modo};"),
      j("n.pausar();document.getElementById('p-manual').click();"), ["wait", 0.3],
      e("manualPausa", "return{tela:vis('t-manual'),botao:!!document.getElementById('p-manual')};"),
      j("document.getElementById('mn-voltar').click();"), ["wait", 0.2],
      e("manualVolta", "return{pausa:vis('t-pausa'),manual:vis('t-manual'),tecla:X('ACOES_TECLA').find(a=>a.id==='manual')};"),
      j("G.modo='jogo';X('tela')(null);"), ["gwait", 0.2]]
# ---- aba Fabricar: receita bloqueada sem materiais ----
s += [j("X('abrirMochila')('fabricar');X('fabSel='+RI('peitoralMalha'));X('fabDetalhe')();"), ["wait", 0.2],
      e("fabTravada", "const el=document.getElementById('fab-info');return{trava:!!el.querySelector('.trava'),reqs:!!el.querySelector('.reqs'),botao:!!el.querySelector('[data-fab]'),txt:el.textContent.slice(0,200)};"),
      j("X('fabSel='+RI('bandagem'));X('fabDetalhe')();"),
      e("fabLivre", "const el=document.getElementById('fab-info');return{reqs:!!el.querySelector('.reqs'),botao:!!el.querySelector('[data-fab]')};"),
      j("X('fecharMochila')();G.modo='jogo';"), ["gwait", 0.2]]
# ---- mesa de estudo ----
s += [j("vai(F[0]+9,F[2]+12);const m=X('criarObra')('mesaEstudo',P.x+1.2,P.z,0);window.__mesa=m;inv('camiseta',1);inv('colete',1);inv('plantaEstufa',1);"), ["gwait", 0.2],
      e("mesaAntes", "const st=window.__mesa;X('abrirEstacao')(st);const r=X('ESTACAO_UI').estudo.render(st);return{modo:G.modo,acoes:r.acoes.map(a=>a.id+':'+(a.ok!==false)),camiseta:est('camiseta'),texto:X('INTER_K').estacao.texto(st).t};"),
      j("X('estAcao')('est:camiseta');"),
      e("estudando", "const st=window.__mesa;return{est:st.ext.est&&st.ext.est.id,naMochila:conta('camiseta'),msg:document.getElementById('es-msg').textContent,ocupada:X('ESTACAO_UI').estudo.render(st).acoes.filter(a=>a.id.startsWith('est:')).every(a=>a.ok===false)};"),
      j("G.tm+=61;X('estRender')();X('estAcao')('recolher');"),
      e("aprendeu", "return{camiseta:est('camiseta'),volta:conta('camiseta'),mesa:window.__mesa.ext.est,diario:!!(X('diarioD')().rec||{}).camiseta,msg:document.getElementById('es-msg').textContent};"),
      j("X('estAcao')('est:colete');G.tm+=181;X('estAcao')('recolher');X('estAcao')('est:plantaEstufa');G.tm+=61;X('estAcao')('recolher');"),
      e("aprendeu2", "return{jaqueta:est('jaquetaReforcada'),estufa:X('obraLiberada')('estufa'),planta:conta('plantaEstufa'),colete:conta('colete')};"),
      j("X('fecharEstacao')();"), ["gwait", 0.2]]
# ---- bancada de desmanche ----
s += [j("const b=X('criarObra')('bancadaDesmanche',P.x-1.6,P.z+1.5,0);window.__banc=b;inv('pecasCarro',2);inv('kitFerramentas',1);inv('camisaCouro',1,{q:1,dur:200});"),
      e("bancada", "const b=window.__banc;X('abrirEstacao')(b);const r=X('ESTACAO_UI').desmanche.render(b);const i=P.inv.findIndex(q=>q&&q.id==='camisaCouro');"
        "return{acoes:r.acoes.map(a=>a.id+':'+(a.ok!==false)).slice(0,8),mao:X('retornoDesmonte')(P.inv[i]),bancada:X('retornoBancada')(P.inv[i])};"),
      j("window.__antes={sucata:conta('sucata'),pregos:conta('pregos'),chapa:conta('chapaFerro'),kit:P.inv.find(q=>q&&q.id==='kitFerramentas').dur};X('estAcao')('dm:pecasCarro');"),
      e("desmanchando", "const L=window.__banc.ext.dm;return{n:L.length,cond:L[0]&&L[0].cond,min:L[0]&&Math.round(L[0].fim-L[0].ini),out:L[0]&&L[0].out,pecas:conta('pecasCarro'),kit:P.inv.find(q=>q&&q.id==='kitFerramentas').dur};"),
      j("G.tm+=30;X('estAcao')('recolher');"),
      e("recolheu", "const a=window.__antes;return{sucata:conta('sucata')-a.sucata,pregos:conta('pregos')-a.pregos,chapa:conta('chapaFerro')-a.chapa,vagas:window.__banc.ext.dm.length,msg:document.getElementById('es-msg').textContent};"),
      j("const i=P.inv.findIndex(q=>q&&q.id==='camisaCouro');window.__ci=i;window.__cc=conta('couroCurtido');X('estAcao')('desm:'+i);"),
      e("confirma", "return{ainda:conta('camisaCouro'),msg:document.getElementById('es-msg').textContent};"),
      j("X('estAcao')('desm:'+window.__ci);"),
      e("desmontou", "return{jaqueta:conta('camisaCouro'),couro:conta('couroCurtido')-window.__cc,linha:conta('linha'),msg:document.getElementById('es-msg').textContent};"),
      j("X('fecharEstacao')();"), ["gwait", 0.2]]
# ---- recuperação no mundo ----
s += [j("X('recupMontar')();"),
      e("recupLista", "const R=X('RECUP'),T=Object.values(R.alvos),c=t=>T.filter(q=>q.tipo===t).length;return{pts:R.pts.length,carro:c('carro'),viatura:c('viatura'),caminhao:c('caminhao'),onibus:c('onibus'),ambulancia:c('ambulancia'),movel:c('movel'),maquina:c('maquina'),aviao:c('aviao'),"
        "estrada:T.filter(q=>q.tipo==='carro'&&R.pts.some(p=>p.alvo===q&&Math.abs(p.x)<150)).length};"),
      # carro da estrada: interação de verdade (alvo, segurar, concluir)
      j("const R=X('RECUP');const it=X('INTER').find(i=>i.id==='posto-carro1');let best=null,bd=1e9;for(const p of R.pts){if(p.alvo.tipo!=='carro')continue;const d=Math.hypot(p.x-it.x,p.z-it.z);if(d<bd){bd=d;best=p;}}"
        "window.__pc=best;P.inv=P.inv.map(q=>q&&q.id==='kitFerramentas'?null:q);vai(best.x+0.2,best.z+0.2);const t=best.alvo;P.yaw=Math.atan2(best.x-P.x,best.z-P.z);P.body=P.yaw;"), ["gwait", 0.2],
      e("semFerramenta", "const a=X('interAtual')();return{alvo:a&&a.k,texto:a&&X('textoInter')(a),dist:Math.round(Math.hypot(window.__pc.x-P.x,window.__pc.z-P.z)*100)/100};"),
      j("inv('kitFerramentas',1);window.__brs=[];"),
      e("comFerramenta", "const a=X('interAtual')();n.alvo=a;return{alvo:a&&a.k,texto:a&&X('textoInter')(a)};"),
      j("n.interagir(false);"), ["gwait", 1.0],
      e("segurando", "return{acao:P.acao&&P.acao.tipo,dur:P.acao&&r2(P.acao.dur),alvo:P.acao&&P.acao.alvo.k};"),
      ["gwait", 4.5],
      e("tirou", "const T=window.__pc.alvo;return{pecas:conta('pecasCarro'),usados:X('E12')().recup[T.key],resta:X('recupRestante')(T),acao:!!P.acao,ruido:Math.max(0,...(window.__brs||[])),kit:P.inv.find(q=>q&&q.id==='kitFerramentas').dur};"),
      # móvel de casa: some da malha e do colisor
      j("const R=X('RECUP');const T=Object.values(R.alvos).find(q=>q.tipo==='movel'&&q.m.k==='mesa'&&q.col);window.__mv=T;const p=R.pts.find(q=>q.alvo===T);window.__mp=p;"
        "window.__malha=T.m.p.mPerto;window.__ncol=n.COLL.length;inv('machado',1);vai(p.x+0.9,p.z,p.y);P.yaw=Math.atan2(p.x-P.x,p.z-P.z);P.body=P.yaw;"), ["gwait", 0.2],
      e("movelAlvo", "const a=X('interAtual')();return{alvo:a&&a.k,texto:a&&X('textoInter')(a),y:r2(P.y),my:r2(window.__mp.y)};"),
      j("X('recupConcluir')(window.__mp);"),
      e("movelSumiu", "const T=window.__mv;return{removido:!!T.m.removido,col:!T.col.cells,colDiff:window.__ncol-n.COLL.length,malhaNova:T.m.p.mPerto!==window.__malha,restos:conta('restosMovel'),movRem:X('E12')().movRem.length,"
        "alvoDepois:(()=>{const a=X('interAtual')();return a&&a.k==='recup'&&a.o===window.__mp;})()};"),
      # máquina e avião
      j("const R=X('RECUP');const T=Object.values(R.alvos).find(q=>q.tipo==='maquina');window.__mq=R.pts.find(q=>q.alvo===T);X('recupConcluir')(window.__mq);"
        "const A=Object.values(R.alvos).find(q=>q.tipo==='aviao');window.__av=R.pts.find(q=>q.alvo===A);X('recupConcluir')(window.__av);"),
      e("maqAviao", "return{maquina:window.__mq&&window.__mq.alvo.nome,pecasMaq:conta('pecasMaquina'),aviao:window.__av&&window.__av.alvo.nome,destrocos:conta('destrocosAviao'),usosAviao:window.__av&&window.__av.alvo.usos};"),
      # baú do ferreiro e o Tratado
      j("const b=X('BAU_FERREIRO'),it=X('INTER').find(i=>i.id==='serra-ferreiro');window.__bf={b:!!b,it:!!it};vai(it.x+1.1,it.z+0.3);P.yaw=Math.atan2(it.x-P.x,it.z-P.z);P.body=P.yaw;"), ["gwait", 0.3],
      j("const a=X('interAtual')();n.alvo=a;window.__bfa=a&&a.o&&a.o.id;n.interagir(true);"), ["gwait", 0.3],
      e("tratado", "return{bau:window.__bf,alvo:window.__bfa,manual:!!G.fab.manuais.tratadoArmeiro,capacete:est('capaceteMalha'),aneis:est('aneisFerro'),diario:!!(X('diarioD')().rec||{}).peitoralMalha};"),
      j("G.modo='jogo';X('tela')(null);"), ["gwait", 0.2]]
# ---- armaduras de malha na fornalha ----
s += [j("vai(F[0]+9,F[2]+16);X('criarObra')('fornalha',P.x+1.4,P.z,0);P.inv.fill(null);cheio();inv('barraFerro',8);inv('carvao',8);inv('chapaFerro',1);inv('couroCurtido',4,{q:2});inv('linha',5);inv('pano',3);if(!G.fab.manuais.tratadoArmeiro)X('acharManual')('tratadoArmeiro');"
        "window.__prot0=X('protecao')();window.__vel0=X('lesaoVel')();"), ["gwait", 0.2],
      j("const f=X('fabricarVarios');window.__an=f(RI('aneisFerro'),8);window.__fab=[X('fabricar')(RI('capaceteMalha')),X('fabricar')(RI('peitoralMalha')),X('fabricar')(RI('calcaMalha'))];"),
      e("fabricou", "return{aneis:window.__an,fab:window.__fab,capacete:conta('capaceteMalha'),peitoral:conta('peitoralMalha'),calca:conta('calcaMalha'),q:(P.inv.find(q=>q&&q.id==='peitoralMalha')||{}).q};"),
      j("for(const id of['capaceteMalha','peitoralMalha','calcaMalha']){const i=P.inv.findIndex(q=>q&&q.id===id);X('vestir')(i);}"),
      e("vestiu", "const a=X('armaduraEf')();return{roupa:[P.roupa.cabeca,P.roupa.tronco,P.roupa.pernas],prot0:r2(window.__prot0),prot:r2(X('protecao')()),soma:r2(X('somaRoupa')('prot')),vel0:r2(window.__vel0),vel:r2(X('lesaoVel')()),peso:r2(X('pesoRoupa')()),"
        "corrida:r2(1+Math.max(0,X('pesoRoupa')()-5)*0.05),calor:r2(X('calorRoupa')()),arm:a};"),
      j("window.__brs=[];P.ruidoK=0;P.vx=3;P.vz=0;P.noChao=true;P.correndo=false;P.agachado=false;P.passoN=(P.passoN||0)+1;PS('e12Armadura')(0.016);P.passoN++;P.correndo=true;PS('e12Armadura')(0.016);P.vx=0;P.correndo=false;"),
      e("barulho", "return{ruidos:(window.__brs||[]).map(r2),ruidoK:r2(P.ruidoK)};"),
      j("P.correndo=false;P.energia=50;PS('e12Armadura')(1.0);window.__e1=P.energia;"),
      e("cansa", "return{antes:50,depois:r2(window.__e1)};"),
      j("const I=X('roupaInfoDe')('tronco');I.dur=200;inv('aneisFerro',2);inv('sucata',3);"),
      e("consertoMalha", "const c=X('consertoInfo')('tronco');const ok=X('consertarRoupa')('tronco');return{custo:c&&c.c,ferr:c&&c.ferr,ok,dur:X('roupaInfoDe')('tronco').dur,max:X('roupaMax')('tronco')};"),
      # nada: a malha afunda
      j("P.energia=80;P.nada=true;PS('e12Armadura')(1.0);window.__nadoE=P.energia;P.nada=false;")]
s += [e("nado", "return{energiaNadando:r2(window.__nadoE)};")]
# ---- progresso: consertos ensinam a calça reforçada ----
s += [j("window.__cr0=est('calcaReforcada');G.fab.reg.cons=5;window.__e12pt=0;X('e12ProgT=0');PS('e12Progresso')(0.1);"),
      e("progresso", "return{antes:window.__cr0,depois:est('calcaReforcada'),prog:X('E12')().prog.consertos,diario:!!(X('diarioD')().rec||{}).calcaReforcada};")]
# ---- sujeira e desgaste pelo uso ----
s += [j("for(const sl of['cabeca','tronco','pernas']){const i=P.inv.findIndex(q=>!q);X('tirarRoupa')(sl);}P.inv=P.inv.map(q=>q&&['capaceteMalha','peitoralMalha','calcaMalha'].includes(q.id)?null:q);"
        "inv('casacoGrande',1);inv('calcaCouro',1);for(const id of['casacoGrande','calcaCouro']){const i=P.inv.findIndex(q=>q&&q.id===id);X('vestir')(i);}"
        "const I=X('roupaInfoDe')('tronco');I.suj=0;window.__cal0=X('calorRoupa')();I.suj=0.9;window.__cal1=X('calorRoupa')();"
        "I.dur=200;X('roupaDesgasta')('tronco',10);window.__d1=200-I.dur;I.suj=0;I.dur=200;X('roupaDesgasta')('tronco',10);window.__d0=200-I.dur;"),
      e("sujeiraEfeitos", "return{calorLimpo:r2(window.__cal0),calorSujo:r2(window.__cal1),gastoLimpo:r2(window.__d0),gastoSujo:r2(window.__d1)};"),
      j("const I=X('roupaInfoDe')('tronco');I.dur=200;I.suj=0;X('e12Tm=G.tm');G.tm+=120;PS('e12Roupas')(0.016);window.__uso=200-I.dur;window.__suj=I.suj;"),
      e("usoGasta", "return{gastoEm2h:r2(window.__uso),sujEm2h:Math.round(window.__suj*10000)/10000};"),
      j("const I=X('roupaInfoDe')('tronco');I.suj=0.6;P.nada=true;PS('e12Roupas')(5);window.__nadou=I.suj;P.nada=false;"),
      e("nadarLava", "return{depois:r2(window.__nadou)};"),
      j("const I=X('roupaInfoDe')('tronco');I.suj=0.7;X('roupaInfoDe')('pernas').suj=0.5;window.__tint=X('roupaTint')('tronco',[1,1,1]);"
        "window.__stats=X('statsItem')(I,X('ITEMS').casacoGrande);X('abrirMochila')('mochila');X('roupaSel=\"tronco\"');X('mochilaRender')();"),
      e("sujeiraUI", "const d=document.getElementById('detalhe');return{tint:window.__tint&&window.__tint.map(r2),barra:/Sujeira/.test(window.__stats),botao:!!d.querySelector('[data-acao=lavarRoupas]'),desab:!!(d.querySelector('[data-acao=lavarRoupas]')||{}).disabled,"
        "agua:X('aguaParaLavar')()};"),
      j("inv('agua',1);X('mochilaRender')();document.querySelector('#detalhe [data-acao=lavarRoupas]').click();"),
      e("lavouGarrafa", "return{suj:r2(X('roupaInfoDe')('tronco').suj),pernas:r2(X('roupaInfoDe')('pernas').suj),agua:conta('agua'),garrafa:conta('garrafa'),molhado:r2(P.molhado||0)};"),
      j("X('fecharMochila')();G.modo='jogo';")]
# ---- salvar e carregar: estudos, consertos e o móvel tirado ----
s += [j("window.__sv=X('v8Salvar')();X('V8').novo.e12();window.__novo={camiseta:est('camiseta'),mesa:window.__mv.m.removido,col:!!window.__mv.col.cells};X('v8Carregar')(window.__sv);"),
      e("salvarCarregar", "const T=window.__mv;return{novo:window.__novo,camiseta:est('camiseta'),jaqueta:est('jaquetaReforcada'),removido:!!T.m.removido,col:!T.col.cells,recup:Object.keys(X('E12')().recup).length,json:JSON.stringify(window.__sv.e12).length};")]
salvar('p171.json', s)

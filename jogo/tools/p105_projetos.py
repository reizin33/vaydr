"""p105: projetos e base que evolui — obras novas travadas pela planta, estudar as plantas libera, construir pelo fluxo normal
(gasta material, mensagem certa), portão de ferro abre perto, estacas de ferro ferem, armário de ferro é baú da base, rede de
camuflagem reduz a visão dos zumbis, estufa produz de manhã, antena dá uma oferta a mais, nível da base sobe (posto avançado,
base fortificada com horda menor, fortaleza com conquista e material), plantas no mundo (galpão do sítio, arsenal, estação),
salvar/carregar e fotos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
NOVAS = "['muroFerro','portaoFerro','espetosFerro','armarioFerro','redeCamuflagem','estufa','antenaBase']"
F = ("const IK=X('INTER_K'),O=X('OBRAS'),OB=X('OB'),gr=(x,z)=>X('ground')(x,z),lib=k=>X('obraLiberada')(k),NOVAS=" + NOVAS + ","
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),ob=t=>OB.filter(o=>o.tipo===t),"
     "bau=()=>X('bausBase')().map(b=>b.tipo+':'+b.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(',')).join(' | '),"
     "feedTxt=()=>[...document.querySelectorAll('#feed span')].map(s=>s.textContent).slice(-2).join(' / '),"
     "estudar=id=>{vazio();add(id,1);const i=P.inv.findIndex(q=>q&&q.id===id);X('usarUtil')(i);};")
s = inicio("X('FAUNA_POP').ativosMax=0;G.fab.nv=1;X(\"window.__toasts=[];const _t=toast;toast=function(k,t){window.__toasts.push(t);return _t(k,t);}\");")
s += [js(F+"vivo();Z.length=0;vazio();vai(F[0]+9,F[2]+4);P.yaw=0;P.body=0;X('modoObra')(true);"), ["wait", 0.3],
      ev("antes", F+"const b=[...document.querySelectorAll('#obras .obra')];return{noMenu:NOVAS.filter(k=>b.some(x=>x.dataset.o===k)).join(','),"
                    "travadas:NOVAS.filter(k=>!lib(k)).join(','),txtTrava:X('travaObra')('muroFerro',true)+' / '+X('travaObra')('armarioFerro',true),rede:lib('redeCamuflagem'),"
                    "botaoTrav:b.filter(x=>NOVAS.includes(x.dataset.o)&&x.classList.contains('trav')).length};"),
      js(F+"X('OBRA').tipo='muroFerro';X('hudObras')();"), ["wait", 0.3]]
s += [js("window.__turbo=1;window.__semRender=false;"), ["wait", 2.5], ["shot", "455_menu_obras_ferro.png"], js("window.__semRender=true;window.__turbo=6;")]
s += [js(F+"vazio();add('chapaFerro',3);add('barraFerro',2);add('pedra',4);X('OBRA').tipo='muroFerro';X('colocarObra')();"),
      ev("semPlanta", F+"return{muros:ob('muroFerro').length,chapa:conta('chapaFerro'),msg:feedTxt()};"),
      js(F+"X('modoObra')(false);estudar('plantaFerro');window.__f=conta('plantaFerro');estudar('plantaEstufa');estudar('plantaRadio');G.fab.nv=2;"),
      ev("estudou", F+"return{liberadas:NOVAS.filter(k=>lib(k)).join(','),gastou:window.__f===0,marcos:['plantaFerro','plantaEstufa','plantaRadio'].filter(k=>G.fab.reg.marcos[k]!==undefined).join(','),"
                       "diario:Object.keys(X('diarioD')().desc).filter(k=>k.startsWith('manual:planta')).join(',')};")]
# construir pelo fluxo normal: mira, cabe, gasta, cria
s += [js(F+"vazio();add('chapaFerro',3);add('barraFerro',2);add('pedra',4);vai(F[0]+12,F[2]+6);P.yaw=0;P.body=0;X('modoObra')(true);const OB0=X('OBRA');OB0.tipo='muroFerro';OB0.rot=0;"
         "const c=X('cam');c.fwd=[0,0,1];c.right=[0,0,0];X('obraAlvo')();window.__ok=[OB0.ok,OB0.motivo];X('colocarObra')();X('modoObra')(false);"),
      ev("construiu", F+"const o=ob('muroFerro')[0];return{ok:window.__ok,muros:ob('muroFerro').length,hp:o&&o.hp,solido:!!(o&&o.col&&o.col.solid),sobrou:['chapaFerro','barraFerro','pedra'].map(k=>conta(k)).join(','),msg:feedTxt()};")]
# as outras peças (colocação direta, para os testes e as fotos)
s += [js(F+"const c=(t,dx,dz,y)=>X('criarObra')(t,F[0]+dx,F[2]+dz,y||0);window.__pf=c('portaoFerro',-12,8);c('espetosFerro',16,-6);c('armarioFerro',4.5,4.0,Math.PI);c('redeCamuflagem',-8,-9);c('estufa',9,-12);c('antenaBase',-13,-3);"),
      ev("pecas", F+"return NOVAS.map(k=>k+':'+ob(k).length).join(' ');")]
s += foto("456_obras_ferro.png", F+"vai(F[0]+2,F[2]+16);G.hora=10;G.camFix={pos:[F[0]+4,gr(F[0],F[2])+9,F[2]+20],tgt:[F[0]-1,gr(F[0],F[2])+1,F[2]-4]};", 0.5)
s += [js("G.camFix=null;")]
# portão de ferro: abre com você perto, fecha longe; segura zumbi
s += [js(F+"const o=window.__pf;vai(o.x+2,o.z+3);"), ["gwait", 1.2], ev("portaoPerto", F+"const o=window.__pf;return{abre:r2(o.abre),solido:!!o.col.solid,portao:!!o.col.portao};"),
      js(F+"vai(F[0]+20,F[2]+20);"), ["gwait", 1.2], ev("portaoLonge", F+"return{abre:r2(window.__pf.abre)};")]
# estacas de ferro: zumbi atravessando apanha
s += [js(F+"Z.length=0;const e=ob('espetosFerro')[0];vai(e.x,e.z+5);mira(e.x,e.y+1,e.z-4);const q=ZZ('walker',e.x,e.z-2.2,{st:'alerta'});q.ax=P.x;q.az=P.z;q.ay=P.y;window.__q=q;window.__hp0=q.hp;window.__ehp=e.hp;P.vida=100;"), ["gwait", 3.0],
      ev("estacas", F+"const q=window.__q,e=ob('espetosFerro')[0];return{zumbiPerdeu:r2(window.__hp0-Math.max(0,q.hp)),vivo:q.vivo,estacaGastou:r2(window.__ehp-(e?e.hp:0))};"),
      js(F+"Z.length=0;P.vida=100;")]
# armário de ferro: é baú da base
s += [js(F+"vazio();add('pregos',10);const a=ob('armarioFerro')[0];X('depositarBase')([['pregos',7]]);vai(a.x,a.z+1.6);mira(a.x,a.y+1,a.z);"), ["gwait", 0.3],
      ev("armario", F+"const a=ob('armarioFerro')[0],it=X('interAtual')();return{ehBau:X('bausBase')().includes(a),alvo:it&&it.k,tipoAlvo:it&&it.o&&it.o.tipo,pregosNaBase:X('contarBase')(q=>q.id==='pregos'),itens:a.itens.length};"),
      js(F+"const a=ob('armarioFerro')[0];__nnc.alvo={k:'guarda',o:a};__nnc.interagir(false);"), ["wait", 0.3],
      ev("armarioAbre", F+"return{modo:G.modo};"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# rede de camuflagem: zumbis veem de mais perto
s += [js(F+"G.hora=10;const r=ob('redeCamuflagem')[0];vai(r.x+8,r.z+8);"), ["gwait", 0.2],
      ev("redeFora", F+"return{camuflado:X('camuflado')(),visao:r2(X('zVisao')())};"),
      js(F+"const r=ob('redeCamuflagem')[0];vai(r.x+0.3,r.z+0.3);"), ["gwait", 0.2],
      ev("redeDentro", F+"return{camuflado:X('camuflado')(),visao:r2(X('zVisao')())};")]
# estufa e produção da base pela manhã; antena dá a 4ª oferta
s += [js(F+"window.__b0=bau();for(let k=0;k<3;k++)for(const f of X('AMANHECE'))if(String(f).includes('estufa'))f();"),
      ev("estufa", F+"return{antes:window.__b0,depois:bau()};"),
      js(F+"G.m.etapa=Math.max(2,G.m.etapa);X('terrOfertas')();"),
      ev("antena", F+"return{temAntena:X('temAntenaBase')(),ofertas:X('terrD')().ofertas.length};")]
# nível da base: 2, 3 e 4
s += [js(F+"vai(F[0]+3,F[2]+3);window.__nv0=X('baseNivel')();window.__pts0=window.__nv0.pts;G.baseNv=window.__nv0.n.n;"),
      ev("nivelInicial", F+"const b=window.__nv0;return{pontos:b.pts,nivel:b.n.nome,prox:b.prox&&b.prox.nome};")]
def subir(alvo, nome):
    return [js(F+"let a=0;while(X('basePontos')()<" + str(alvo) + "&&a<200){const ang=a*0.37,r=20+(a%6)*2.2;X('criarObra')('muroPedra',F[0]+Math.cos(ang)*r,F[2]+Math.sin(ang)*r,ang);a++;}"), ["gwait", 3.6],
            ev(nome, F+"const b=X('baseNivel')();return{pontos:b.pts,nivel:b.n.nome,baseNv:G.baseNv,fatorHorda:X('baseFatorHorda')(),fortaleza:!!X('CQ').f.fortaleza,toasts:(window.__toasts||[]).filter(t=>t.includes('base')).slice(-1).join('')};")]
s += subir(40, "nivel2")
s += [js(F+"window.__b1=bau();for(const f of X('AMANHECE'))if(String(f).includes('carneCrua'))f();"), ev("comidaNv2", F+"return{antes:window.__b1,depois:bau()};")]
s += subir(110, "nivel3")
s += subir(220, "nivel4")
s += [js(F+"window.__b2=bau();for(const f of X('AMANHECE'))if(String(f).includes('carneCrua'))f();"), ev("materialNv4", F+"return{antes:window.__b2,depois:bau()};")]
s += foto("457_bandeira_fortaleza.png", F+"const x=F[0]-4.2,z=F[2]-3.4;vai(F[0]+3,F[2]+3);G.camFix={pos:[x+5,gr(x,z)+3.4,z+5],tgt:[x,gr(x,z)+3.6,z]};", 0.4)
s += [js("G.camFix=null;")]
# plantas no mundo
s += [js(F+"vazio();const it=X('INTER').find(i=>i.id==='galpao-sitio1');window.__g=!!it;if(it){delete it.dia;vai(it.x+1.2,it.z);__nnc.alvo={k:'inter',o:it};__nnc.interagir(true);}"), ["wait", 0.3],
      ev("plantasNoMundo", F+"const S=X('SUB');return{galpao:window.__g,plantaEstufaDoGalpao:conta('plantaEstufa'),arsenal:(S.caixas.find(c=>c.id==='cx_ars1')||{}).fixo,estacao:(S.caixas.find(c=>c.id==='cx_est')||{}).fixo,"
                              "lootArsenal:X('LOOT').arsenalSub.some(q=>q[0]==='plantaFerro'),lootHeli:!!(X('LOOT').heliCx&&X('LOOT').heliCx.some(q=>q[0]==='plantaRadio'))};")]
# salvar e carregar
s += [js(F+"window.__antes=JSON.stringify({nv:G.baseNv,marcos:['plantaFerro','plantaEstufa','plantaRadio'].filter(k=>G.fab.reg.marcos[k]!==undefined).length,novas:NOVAS.map(k=>ob(k).length).join(''),arm:(ob('armarioFerro')[0]||{itens:[]}).itens.filter(Boolean).length});"
         "X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("carregar", F+"const OB2=X('OB'),ob2=t=>OB2.filter(o=>o.tipo===t);return{antes:window.__antes,depois:JSON.stringify({nv:G.baseNv,marcos:['plantaFerro','plantaEstufa','plantaRadio'].filter(k=>G.fab.reg.marcos[k]!==undefined).length,novas:NOVAS.map(k=>ob2(k).length).join(''),arm:(ob2('armarioFerro')[0]||{itens:[]}).itens.filter(Boolean).length})};")]
salvar('p105.json', s)

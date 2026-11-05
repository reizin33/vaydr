"""p104: territórios — pontos de controle livres, tomar com zumbi por perto (recusa), sem bandeira (recusa), com bandeira (toma),
produção da manhã no depósito, invasão de longe (perde e aguenta), invasão de verdade com você perto (horda vai para a bandeira,
derruba vida da bandeira, você defende), logística (quem transporta leva para o baú), expedição (sai e volta com saque), comércio
pelo rádio (ofertas, aceitar, chega na caixa de trocas), tela do grupo (abas, permissões, K), mapa, salvar/carregar e foto."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const TD=X('TERR_DEF'),T=()=>X('terrD')(),IK=X('INTER_K'),gr=(x,z)=>X('ground')(x,z),S=X('SOBREV'),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),D=id=>{const d=TD.find(d=>d.id===id);X('terrPonto')(d);return d;},"
     "dep=t=>(T().t[t].dep||[]).filter(Boolean).map(q=>q.id+'x'+q.n).join(','),bau=()=>X('bausBase')().map(b=>b.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(',')).join(' | ');")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("defs", F+"return{n:TD.length,pontos:TD.map(d=>{X('terrPonto')(d);return d.id+':'+(X('pointBlocked')(d.px,d.pz,0.5)?'BLOQ':'ok')+(X('dentroMapa')(d.px,d.pz,1)?'':'/FORA')+(X('RIO').ok&&X('aguaProf')(d.px,d.pz)>0.3?'/AGUA':'')+'/'+r2(Math.hypot(d.px-d.x,d.pz-d.z));}).join(' '),"
                  "receita:!!X('RECIPES').find(r=>r.faz==='bandeira'),tarefas:['transportar','expedicao'].every(k=>!!X('SOB_TAREFAS')[k])};")]
# ---------- tomar a fazenda ----------
s += [js(F+"vivo();Z.length=0;vazio();const d=D('fazenda');vai(d.px+2.2,d.pz);mira(d.px,d.py+1,d.pz);ZZ('walker',d.x+6,d.z+6);"), ["gwait", 0.3],
      ev("comZumbi", F+"const d=D('fazenda'),a=X('interAtual')();const t=IK.terrBandeira.texto(d);IK.terrBandeira.usar(d,true);return{alvo:a&&a.k,txt:t.t+' / '+t.s,hold:!!t.hold,dono:T().t.fazenda.dono};"),
      js(F+"Z.length=0;"),
      ev("semBandeira", F+"const d=D('fazenda');const t=IK.terrBandeira.texto(d);IK.terrBandeira.usar(d,true);return{txt:t.s,hold:!!t.hold,dono:T().t.fazenda.dono};"),
      js(F+"add('bandeira',1);const d=D('fazenda');window.__t=IK.terrBandeira.texto(d);IK.terrBandeira.usar(d,false);window.__toque=T().t.fazenda.dono;IK.terrBandeira.usar(d,true);"), ["gwait", 0.3],
      ev("tomou", F+"const T0=T().t.fazenda;return{hold:!!window.__t.hold,dur:window.__t.dur,toqueNaoToma:window.__toque===null,dono:T0.dono===X('grupoD')().id,controle:T0.controle,bandeiras:conta('bandeira'),conquista:!!X('CQ').f.territorio,registro:T().registro.map(r=>r.txt).join(' / ')};")]
s += foto("450_bandeira_fazenda.png", F+"const d=D('fazenda');Z.length=0;vai(d.px+5,d.pz+5);G.camFix={pos:[d.px+6,d.py+3.2,d.pz+5],tgt:[d.px+0.6,d.py+1.8,d.pz]};", 0.4)
s += [js("G.camFix=null;")]
# ---------- produção ----------
s += [js(F+"for(let k=0;k<4;k++)X('terrAmanhece')();"),
      ev("producao", F+"const d=D('fazenda');vai(d.px+1.4,d.pz+1.6);mira(d.px+1.4,d.py+0.5,d.pz);return{dep:dep('fazenda'),controle:T().t.fazenda.controle,txt:IK.terrDeposito.texto(d).s};"),
      js(F+"const d=D('fazenda');IK.terrDeposito.usar(d);"), ["wait", 0.3],
      ev("abriuDeposito", F+"return{modo:G.modo};"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# ---------- invasão de longe: perde (horda grande) e aguenta (muros) ----------
s += [js(F+"vivo();Z.length=0;add('bandeira',2);const d=D('posto');vai(d.px+2,d.pz);IK.terrBandeira.usar(d,true);vai(0,0);const T0=T().t.posto;T0.inv=true;T0.invViu=false;window.__dia=G.dia;G.dia=30;window.__def=X('terrDefesa')(d);X('terrAmanhece')();G.dia=window.__dia;"),
      ev("perdeu", F+"const T0=T().t.posto;return{tomado:true,defesa:r2(window.__def),dono:T0.dono,registro:T().registro.slice(-1)[0].txt};"),
      js(F+"const d=D('posto');vai(d.px+2,d.pz);IK.terrBandeira.usar(d,true);for(let i=0;i<6;i++)X('criarObra')('muroFerro',d.px-6+i*3.2,d.pz+8,0);vai(0,0);const T0=T().t.posto;T0.controle=100;T0.inv=true;T0.invViu=false;window.__def=X('terrDefesa')(d);X('terrAmanhece')();"),
      ev("aguentou", F+"const T0=T().t.posto;return{defesa:r2(window.__def),dono:!!T0.dono,controle:T0.controle,registro:T().registro.slice(-1)[0].txt};")]
# ---------- invasão de verdade: você perto quando a noite cai ----------
s += [js(F+"vivo();Z.length=0;const d=D('fazenda');vai(d.px+8,d.pz+8);const T0=T().t.fazenda;T0.inv=true;T0.invViu=false;T0.hp=300;X('terrNoiteAnt=false');X('inicioNoite')();"), ["gwait", 1.0],
      ev("invasao", F+"const d=D('fazenda'),L=Z.filter(q=>q.vivo&&q.terrAlvo==='fazenda');return{zumbis:L.length,alerta:L.filter(q=>q.st==='alerta'||q.st==='caca').length,distMedia:r2(L.reduce((a,q)=>a+Math.hypot(q.x-d.px,q.z-d.pz),0)/Math.max(1,L.length)),invAtiva:T().t.fazenda.invAtiva};"),
      ["gwait", 4.0],
      ev("aproximam", F+"const d=D('fazenda'),L=Z.filter(q=>q.vivo&&q.terrAlvo==='fazenda');return{zumbis:L.length,distMedia:r2(L.reduce((a,q)=>a+Math.hypot(q.x-d.px,q.z-d.pz),0)/Math.max(1,L.length))};"),
      js(F+"vai(D('fazenda').px+30,D('fazenda').pz+30);const d=D('fazenda');for(const q of Z.filter(q=>q.vivo&&q.terrAlvo==='fazenda').slice(0,3)){q.x=d.px+1.2;q.z=d.pz+0.5;q.y=gr(q.x,q.z);}"), ["gwait", 2.0],
      ev("bandeiraApanha", F+"return{hp:r2(T().t.fazenda.hp),dono:!!T().t.fazenda.dono};"),
      js(F+"for(const q of Z.filter(q=>q.vivo&&q.terrAlvo==='fazenda'))X('ferirZ')(q,9999,0,0,true);"), ["gwait", 1.5],
      ev("defendeu", F+"const T0=T().t.fazenda;return{invAtiva:T0.invAtiva,dono:!!T0.dono,controle:T0.controle,registro:T().registro.slice(-1)[0].txt};"),
      js(F+"X('inicioDia')();G.hora=10;Z.length=0;")]
# ---------- logística: quem transporta leva do depósito para o baú da clareira ----------
s += [js(F+"vivo();Z.length=0;const s=S[0];s.st='base';s.tarefa='transportar';s.hp=100;s.x=F[0]+5;s.z=F[2]+6;s.y=gr(s.x,s.z);s.ch.vis=true;X('criarObra')('bau',F[0]+5.5,F[2]-4.5,0);"
         "const T0=T().t.fazenda;T0.controle=90;T0.dep=new Array(X('BAU_N')).fill(null);X('depAdd')(T0,'milho',5);X('depAdd')(T0,'couro',2);window.__nome=s.nome;window.__antes=dep('fazenda');X('terrAmanhece')();"),
      ev("logistica", F+"return{transportador:window.__nome,depAntes:window.__antes,depDepois:dep('fazenda'),bau:bau(),registro:T().registro.filter(r=>r.tipo==='log').map(r=>r.txt).join(' / ')};")]
# ---------- expedição: escolhe o destino na tela do grupo, sai às 7h30 e volta às 17h24 ----------
s += [js(F+"const s=S[1];s.st='base';s.tarefa='expedicao';s.hp=100;s.x=F[0]-5;s.z=F[2]+6;s.y=gr(s.x,s.z);s.ch.vis=true;X('abrirGrupo')(s);"), ["wait", 0.4],
      ev("telaGrupo", F+"const b=[...document.querySelectorAll('#g-tarefas [data-dest]')];return{botoes:b.map(x=>x.dataset.dest).join(','),tarefaTransportar:!!document.querySelector('#g-tarefas [data-t=\"transportar\"],#g-tarefas [data-tarefa=\"transportar\"]')||document.getElementById('g-tarefas').textContent.includes('Transportar')};"),
      ["click", "#g-tarefas [data-dest='fazenda']"], ["wait", 0.3],
      ev("destino", F+"return{exp:S[1].exp,fala:document.getElementById('g-fala').textContent};")]
s += [["shot", "451_grupo_expedicao.png"]]
s += [js(F+"X('fecharGrupo')();G.modo='jogo';G.hora=7.52;X('expHora=7.45');"), ["gwait", 0.4],
      ev("saiu", F+"const s=S[1];return{st:s.st,expAtual:s.expAtual,volta:s.volta,dia:G.dia,registro:T().registro.slice(-1)[0].txt};"),
      js(F+"window.__b0=bau();G.hora=17.45;X('expHora=17.38');"), ["gwait", 0.4],
      ev("voltou", F+"const s=S[1];return{st:s.st,expAtual:s.expAtual,hp:Math.round(s.hp),bauAntes:window.__b0,bauDepois:bau(),registro:T().registro.slice(-1)[0].txt};")]
# ---------- comércio pelo rádio ----------
s += [js(F+"G.hora=10;window.__etapa=G.m.etapa;G.m.etapa=0;X('terrOfertas')();window.__semRadio=T().ofertas.length;G.m.etapa=Math.max(2,window.__etapa);X('terrOfertas')();"),
      ev("ofertas", F+"return{semRadio:window.__semRadio,n:T().ofertas.length,lista:T().ofertas.map(o=>o.grupo+': '+o.da[1]+' '+o.da[0]+' por '+o.quer[1]+' '+o.quer[0]).join(' / ')};"),
      js(F+"const o=T().ofertas[0];window.__o=o;window.__falta=(()=>{X('terrAceitar')(o);return o.aceita;})();add(o.quer[0],o.quer[1]);window.__q0=conta(o.quer[0]);X('terrAceitar')(o);"),
      ev("aceitou", F+"const o=window.__o;return{semItensAceitou:window.__falta,aceita:o.aceita,pagou:window.__q0-conta(o.quer[0]),pendentes:T().trocasPendentes.length};"),
      js(F+"X('abrirTerritorios')();"), ["wait", 0.3], ["click", ".tr-aba[data-aba='troca']"], ["wait", 0.4]]
s += [["shot", "452_trocas.png"]]
s += [ev("telaTroca", F+"return{visivel:!document.getElementById('t-terr').hidden,resumo:document.getElementById('tr-resumo').textContent,itens:document.querySelectorAll('#tr-lista li').length,combinado:document.querySelectorAll('#tr-lista .tr-ok').length};"),
      ["click", ".tr-aba[data-aba='grupo']"], ["wait", 0.3],
      ev("telaGrupoTerr", F+"const c=document.querySelector('#tr-lista [data-perm=\"construir\"]');const antes=X('grupoD')().papeis.membro.construir;c.click();return{resumo:document.getElementById('tr-resumo').textContent,membros:X('grupoD')().membros.map(m=>m.nome+'/'+m.papel).join(','),permAntes:antes,permDepois:X('grupoD')().papeis.membro.construir,rede:X('grupoD')().rede,txtMulti:document.getElementById('tr-lista').textContent.includes('Multiplayer')};"),
      ["click", ".tr-aba[data-aba='terr']"], ["wait", 0.3]]
s += [["shot", "453_territorios.png"]]
s += [ev("telaTerr", F+"return{resumo:document.getElementById('tr-resumo').textContent,donos:document.querySelectorAll('#tr-lista li.ok').length,itens:document.querySelectorAll('#tr-lista li').length};"),
      ["click", ".tr-aba[data-aba='reg']"], ["wait", 0.3],
      ev("telaReg", F+"return{resumo:document.getElementById('tr-resumo').textContent,itens:document.querySelectorAll('#tr-lista li').length};"),
      ["click", "#tr-voltar"], ["wait", 0.3], ev("voltarPausa", "return{pausa:!document.getElementById('t-pausa').hidden,modo:__nnc.G.modo};"), js("__nnc.ev('jogar')();"), ["wait", 0.3],
      ["press", "k"], ["wait", 0.4],
      ev("teclaK", F+"const v=!document.getElementById('t-terr').hidden;return{abriu:v,modo:G.modo};"),
      ["click", "#tr-voltar"], ["wait", 0.3], js("__nnc.ev('jogar')();")]
# a carga chega na manhã seguinte na caixa de trocas
s += [js(F+"X('terrAmanhece')();const c=X('CAIXA_TROCAS');vai(c.x+1.6,c.z+0.2);mira(c.x,gr(c.x,c.z)+0.4,c.z);"), ["gwait", 0.3],
      ev("chegou", F+"const a=X('interAtual')();return{caixa:(T().caixaTrocas||[]).filter(Boolean).map(q=>q.id+'x'+q.n).join(','),esperado:window.__o.da.join('x'),alvo:a&&a.k,pendentes:T().trocasPendentes.length};"),
      js(F+"IK.terrCaixaTrocas.usar(T());"), ["wait", 0.3], ev("abriuCaixa", F+"return{modo:G.modo};"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# ---------- minimapa com territórios e escuta da torre ----------
s += [js(F+"T().t.torre.dono=X('grupoD')().id;X('estradaComecar')();const d=D('fazenda');vai(d.px+4,d.pz+4);G.obsAte=G.t+60;"), ["gwait", 0.3],
      ev("mapa", F+"const c=document.getElementById('minimapa'),g=c.getContext('2d');let err='';for(const f of X('MAPA_DESENHOS')){try{f(g,x=>x,z=>z,1,0,110);}catch(e){err+=e.message+';';}}return{erros:err||null,escuta:!!(T().t.torre.dono||X('temAntenaBase')()),eventos:X('mundoD')().ev.filter(e=>!e.fim).length};")]
s += foto("454_minimapa_territorio.png", F+"const d=D('fazenda');vai(d.px+4,d.pz+4);G.obsAte=G.t+60;", 0.3)
# ---------- salvar e carregar ----------
s += [js(F+"window.__antes=JSON.stringify({donos:TD.filter(d=>T().t[d.id].dono).map(d=>d.id),reg:T().registro.length,perm:X('grupoD')().papeis.membro.construir,exp:S[1].exp});X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.3],
      ev("carregar", F+"return{antes:window.__antes,depois:JSON.stringify({donos:TD.filter(d=>T().t[d.id].dono).map(d=>d.id),reg:T().registro.length,perm:X('grupoD')().papeis.membro.construir,exp:S[1].exp})};")]
salvar('p104.json', s)

"""p113: testes de integração — sete fluxos seguidos na MESMA campanha, sem recomeçar, e no fim salvar, recarregar a página e conferir tudo.
F1 começo: criação → só bermuda → junta graveto/pedra/fibra do chão → fabrica machado de pedra → bate numa árvore
F2 vila: entra numa casa, abre a porta, vasculha gavetas e armários de verdade até achar roupa → veste (a peça antiga volta para a mochila)
F3 base e noite: constrói barricada pelo modo de construção (gasta material) → anoitece → as ondas vêm → defesa → amanhece (dia seguinte)
F4 combate e queda: zumbi morde (ferida) → bandagem → cai → acorda na clareira → busca a mochila onde caiu
F5 veículo: abastece a caminhonete, dirige, guarda carga no porta-malas
F6 mundo dinâmico: caixa de suprimento chamada pelo sinalizador desce de paraquedas e é aberta; evento de estrada bloqueada é liberado com o machado
F7 grupo e economia: toma um território com bandeira, aceita uma troca pelo rádio
Fim: salvar → recarregar a página → Continuar → aparência, roupas, inventário, construções, veículo, território, eventos e dia iguais."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const IN=X('IN'),gr=(x,z)=>X('ground')(x,z),ids=()=>P.inv.filter(Boolean).map(q=>q.id+(q.n>1?'x'+q.n:'')).join(','),"
     "add=(id,q,ex)=>X('invAdd')(id,q,ex),visto=()=>{const o={};for(const k of X('ROUPA_SLOTS'))if(P.roupa[k])o[k]=P.roupa[k];return o;},"
     "pega=k=>{const L=X('PICKS').filter(p=>p.alive&&p.kind===k).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));const p=L[0];if(!p)return false;vai(p.x+0.6,p.z);n.alvo={k:'pick',o:p};n.interagir(true);return!p.alive;},"
     "VS=()=>X('VEICS'),vv=id=>VS().find(q=>q.id===id||q.tipo===id),T=()=>X('terrD')(),ob=t=>X('OB').filter(o=>o.tipo===t),IK=X('INTER_K'),"
     "RU=X('RURAIS'),CI=X('CID'),V=id=>RU.find(p=>p.lote===id),porta=p=>CI.portas.find(d=>d.p===p&&(d.sA==='fora'||d.sB==='fora')),sala=(p,t)=>p.salas.flat().find(s=>s&&s.tipo===t),"
     "TD=X('TERR_DEF'),D=id=>{const d=TD.find(d=>d.id===id);X('terrPonto')(d);return d;},"
     "vasculha=p=>{for(const c of CI.conts.filter(c=>c.p===p)){if(c.estado!=='fechado')continue;vai(c.x+Math.sin(c.yaw||0)*0.9,c.z+Math.cos(c.yaw||0)*0.9,c.y);X('abrirCont')(c);window.__abertos++;"
     "const B=c.itens||[];for(let j=0;j<B.length;j++){const q=B[j];if(q&&X('ITEMS')[q.id]&&X('ITEMS')[q.id].tipo==='roupa'){window.__achou.push(q.id);X('bauPegar')(j);}}if(G.modo==='mochila')X('fecharMochila')();if(window.__achou.length)return true;}return false;};")
s = [["wait", 2], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3]]
# ---------------- F1 ----------------
s += [["click", "#m-novo", "criacao"], ["wait", 0.5],
      ["click", "#cr-opcoes [data-k='pele'][data-i='2']"], ["click", "#cr-opcoes [data-k='barba'][data-i='3']"], ["click", "#cr-nav [data-aba='cabelo']"], ["click", "#cr-opcoes [data-k='corCab'][data-i='0']"],
      js("const i=document.getElementById('cr-nome');i.value='Teste Integração';i.dispatchEvent(new Event('input',{bubbles:true}));"),
      ["click", "#cr-confirmar"], ["wait", 0.3], ["click", "#cr-m-sim"], ["wait", 1.0],
      js("document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';X('FAUNA_POP').ativosMax=0;"),
      ev("F1_inicio", F+"return{modo:G.modo,ap:G.aparencia,vestido:visto(),inv:ids(),dia:G.dia};"),
      js(F+"Z.length=0;window.__pegou=[pega('pedra'),pega('galho'),pega('galho'),pega('fibra'),pega('fibra'),pega('fibra')];"), ["gwait", 0.3],
      ev("F1_coleta", F+"return{pegou:window.__pegou,inv:ids(),pedra:conta('pedra'),graveto:conta('graveto'),fibra:conta('fibra')};"),
      js(F+"const R=X('RECIPES'),i=R.findIndex(r=>r.faz==='machadoPedra');window.__pode=X('podeFabricar')(R[i]);window.__fez=X('fabricar')(i);"),
      ev("F1_fabricou", F+"return{podia:window.__pode,fez:window.__fez,machado:conta('machadoPedra'),inv:ids()};"),
      js(F+"Z.length=0;const t=X('TREES').filter(t=>t.alive&&!t.agua&&t.s<2).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];window.__arv=t;window.__hp0=t.hp;window.__mad0=conta('madeira');"
         "const a=Math.atan2(P.x-t.x,P.z-t.z);vai(t.x+Math.sin(a)*1.25,t.z+Math.cos(a)*1.25);mira(t.x,P.y+1.1,t.z);sel('machadoPedra');IN.attack=true;"),
      ["gwait", 6], js(F+"IN.attack=false;"),
      ev("F1_arvore", F+"const t=window.__arv;return{hpAntes:window.__hp0,hp:t.hp,viva:t.alive,madeira:conta('madeira')-window.__mad0,machadoDur:(P.inv.find(q=>q&&q.id==='machadoPedra')||{}).dur};")]
# ---------------- F2 ----------------
s += [js(F+"Z.length=0;G.hora=10;const p=V('v3'),d=porta(p);window.__casa=p&&p.lote;window.__d0=d&&d.estado;const w=X('pw')(p,p.uF,-1.8);vai(w[0],w[1]);if(d)X('portaUsar')(d);"),
      ["gwait", 0.6],
      js(F+"const p=V('v3'),d=porta(p),s=sala(p,'sala_casa')||p.salas.flat().find(Boolean),w=X('pw')(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);window.__d1=d&&d.estado;vai(w[0],w[1],s.y);window.__sala=(X('salaEm')(P.x,P.y+0.3,P.z)||{}).tipo;"
         "window.__abertos=0;window.__achou=[];vasculha(p);"),
      ev("F2_vasculhou", F+"return{casa:window.__casa,portaAntes:window.__d0,portaDepois:window.__d1,salaDentro:window.__sala,abertos:window.__abertos,achou:window.__achou,inv:ids()};"),
      # se a sorte não deu roupa nessa casa, vasculha as outras casas da vila e dos sítios (sempre o loot sorteado pelo jogo, nada é posto à mão)
      js(F+"if(!window.__achou.length)for(const p of RU){if(vasculha(p))break;}"
         "const r=window.__achou[0];window.__slot=r&&X('ITEMS')[r].slot;window.__antes=r&&P.roupa[window.__slot];const i=r?P.inv.findIndex(q=>q&&q.id===r):-1;if(i>=0)X('vestir')(i);"),
      ev("F2_vestiu", F+"const r=window.__achou[0];return{abertos:window.__abertos,achou:window.__achou,slot:window.__slot,vestida:r?P.roupa[window.__slot]===r:null,antiga:window.__antes||null,antigaNaMochila:window.__antes?conta(window.__antes):null,vestido:visto(),inv:ids(),"
         "malha:r?!!(X('roupaMeshJ')(r)&&X('roupaMeshJ')(r).count>0):null};")]
# ---------------- F3 ----------------
s += [js(F+"Z.length=0;G.hora=17;add('tabuas',8);add('madeira',4);const Fi=X('FIRE');vai(Fi[0]+2,Fi[2]-6);P.yaw=Math.PI;P.body=Math.PI;window.__ob0=ob('barricada').length;window.__tab0=conta('tabuas');"
         "X('modoObra')(true);const O=X('OBRA');O.tipo='barricada';O.rot=0;const c=X('cam');c.fwd=[0,0,-1];c.right=[0,0,0];X('obraAlvo')();window.__okOb=[O.ok,O.motivo];X('colocarObra')();X('modoObra')(false);"),
      ev("F3_construiu", F+"return{ok:window.__okOb,barricadas:ob('barricada').length-window.__ob0,tabuasGastas:window.__tab0-conta('tabuas')};"),
      js(F+"Z.length=0;P.vida=100;G.hora=19.97;window.__dia0=G.dia;"), ["until", "__nnc.G.noite===true", 120],
      ev("F3_noite", F+"return{noite:G.noite,ondas:G.ondas.map(h=>Math.round(h*100)/100)};"),
      js(F+"G.hora=Math.max(G.hora,(G.ondas[0]||20.5)-0.03);"), ["until", "__nnc.Z.filter(z=>z.vivo).length>0", 160],
      ev("F3_onda", F+"const L=Z.filter(z=>z.vivo);return{zumbis:L.length,tipos:[...new Set(L.map(z=>z.tipo))].join(','),distMedia:Math.round(L.reduce((a,z)=>a+Math.hypot(z.x-P.x,z.z-P.z),0)/Math.max(1,L.length))};"),
      js(F+"P.vida=100;for(const z of Z)if(z.vivo)X('ferirZ')(z,9999,P.x,P.z);G.ondas=[];G.hora=5.96;"), ["until", "__nnc.G.noite===false", 120], ["gwait", 1],
      ev("F3_amanheceu", F+"return{dia:G.dia,diaAntes:window.__dia0,noite:G.noite,vivo:P.alive,barricadas:ob('barricada').length,kills:G.kills};")]
# ---------------- F4 ----------------
s += [js(F+"Z.length=0;G.hora=11;P.vida=100;const z=ZZ('walker',P.x+1.2,P.z,{st:'caca'});z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;window.__z=z;window.__v0=P.vida;"), ["gwait", 4],
      ev("F4_mordida", F+"return{vida:Math.round(P.vida),perdeu:Math.round(window.__v0-P.vida),lesoes:P.lesoes?Object.keys(P.lesoes).filter(k=>P.lesoes[k]===true||P.lesoes[k]>0).join(','):''};"),
      js(F+"const z=window.__z;if(z&&z.vivo)X('ferirZ')(z,9999,P.x,P.z);Z.length=0;add('bandagem',2);const i=P.inv.findIndex(q=>q&&q.id==='bandagem');window.__b0=conta('bandagem');X('usarItem')(i);"), ["gwait", 4],
      ev("F4_bandagem", F+"return{usou:window.__b0-conta('bandagem'),sangra:!!(P.lesoes&&P.lesoes.sangra),vida:Math.round(P.vida),virus:!!(P.lesoes&&P.lesoes.virus)};"),
      # a mordida passou o vírus: sem a seringa ele mata em algumas horas (regra do jogo); aplica a seringa antiviral
      js(F+"add('seringa',1);const i=P.inv.findIndex(q=>q&&q.id==='seringa');window.__vir0=!!(P.lesoes&&P.lesoes.virus);X('usarItem')(i);"), ["gwait", 2],
      ev("F4_seringa", F+"return{tinhaVirus:window.__vir0,virusDepois:!!(P.lesoes&&P.lesoes.virus),seringas:conta('seringa'),vida:Math.round(P.vida)};"),
      js(F+"Z.length=0;add('tabuas',3);const x0=P.x,z0=P.z;vai(x0+25,z0+12);window.__ondeCaiu=[P.x,P.z];window.__invAntes=ids();X('morrer')();"), ["gwait", 2],
      js(F+"if(!P.alive){X('renascer')();G.modo='jogo';n.tela&&0;}"), ["gwait", 1],
      ev("F4_caiu", F+"const M=P.mochila;return{vivo:P.alive,vida:Math.round(P.vida),mochilaNoChao:!!M,lugar:M?Math.round(Math.hypot(M.x-window.__ondeCaiu[0],M.z-window.__ondeCaiu[1])):null,itensNaMochila:M?M.itens.filter(Boolean).length:0,inv:ids(),vestido:visto()};"),
      js(F+"const M=P.mochila;if(M){vai(M.x+0.8,M.z);n.alvo={k:'mochila',o:M};n.interagir(true);}"), ["gwait", 0.5],
      ev("F4_recuperou", F+"return{mochilaNoChao:!!P.mochila,inv:ids(),igualAntes:ids()===window.__invAntes};")]
# ---------------- F5 ----------------
s += [js(F+"Z.length=0;G.hora=11;const t=vv('caminhonete');vai(t.x+2.2,t.z+1);add('gasolina',2);window.__comb0=t.comb;window.__pos0=[t.x,t.z];X('abrirVeiculo')(t);X('veicAcao')('abastecer');X('veicAcao')('dirigir');IN.mz=1;"),
      ["gwait", 3], js(F+"IN.mz=0;IN.freio=true;"), ["gwait", 2], js(F+"IN.freio=false;X('sairCarro')();"),
      js(F+"const t=vv('caminhonete');vai(t.x+2.5,t.z);add('pregos',6);X('abrirBau')({itens:t.itens,nome:'Porta-malas'});const j=P.inv.findIndex(q=>q&&q.id==='pregos');X('bauGuardar')(j);X('fecharMochila')();"),
      ev("F5_veiculo", F+"const t=vv('caminhonete');return{combAntes:r2(window.__comb0),comb:r2(t.comb),andou:r2(Math.hypot(t.x-window.__pos0[0],t.z-window.__pos0[1])),carga:t.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(','),dentro:X('CARRO').ativo};")]
# ---------------- F6 ----------------
s += [js(F+"Z.length=0;G.ev=null;X('aereoD')().lancamento=null;add('sinalizador',1);const i=P.inv.findIndex(q=>q&&q.id==='sinalizador');X('usarUtil')(i);"
         # o jogador do teste fica parado esperando a caixa; os mortos que vêm com o sinal são abatidos como se ele se defendesse (contados em 'defendidos')
         "window.__defZ=0;clearInterval(window.__defI);window.__defI=setInterval(()=>{const n=__nnc;for(const z of n.Z)if(z.vivo&&Math.hypot(z.x-n.P.x,z.z-n.P.z)<14){n.ev('ferirZ')(z,9999,n.P.x,n.P.z);window.__defZ++;}},150);"), ["wait", 21], ["gwait", 0.5],
      ev("F6_sinal", F+"const L=X('aereoD')().lancamento;return{aviao:!!L,motivo:L&&L.motivo};"),
      ["until", "__nnc.G.ev&&__nnc.G.ev.ativo", 200],
      js(F+"const e=G.ev;vai(e.x+1.2,e.z);mira(e.x,(e.y||P.y)+0.4,e.z);"), ["gwait", 0.4],
      js(F+"const a=X('interAtual')();window.__alvoCaixa=a&&a.k;window.__invAntes=P.inv.filter(Boolean).map(q=>q.id+'x'+q.n).join(',');if(a){n.interagir(true);}"), ["wait", 0.4],
      ev("F6_caixa", F+"clearInterval(window.__defI);const e=G.ev;return{defendidos:window.__defZ,alvo:window.__alvoCaixa,aberta:!!(e&&e.feito),ativa:!!(e&&e.ativo),vivo:P.alive,vida:Math.round(P.vida),antes:window.__invAntes,depois:P.inv.filter(Boolean).map(q=>q.id+'x'+q.n).join(',')};"),
      js(F+"if(G.modo==='mochila')X('fecharMochila')();window.__okE=X('estradaComecar')();"),
      ev("F6_estrada", F+"const e=X('mundoD')().ev.find(q=>q.tipo==='estrada'&&!q.fim);return{criou:window.__okE,troncos:e?e.troncos.length:0,bloqueia:e?e.troncos.every(t=>!!X('pointBlocked')(t.x,t.z,0.3)):null};"),
      js(F+"const e=X('mundoD')().ev.find(q=>q.tipo==='estrada'&&!q.fim);if(e){add('machado',1);sel('machado');for(const t of e.troncos){vai(t.x+1.5,t.z+1.5);for(let k=0;k<3;k++)IK.evTronco.usar(t,true);}}"), ["gwait", 1.5],
      ev("F6_liberou", F+"const L=X('mundoD')().ev.filter(q=>q.tipo==='estrada');return{fim:L.map(e=>e.fim||'aberta').join(','),hp:L.map(e=>e.troncos.map(t=>Math.round(t.hp)).join('/')).join(' ')};")]
# ---------------- F7 ----------------
# a mochila (sem mochila nas costas, só os bolsos) encheu de coisas: guarda o que não é da barra rápida no porta-malas da caminhonete
s += [js(F+"if(G.modo==='mochila')X('fecharMochila')();if(!P.alive){X('renascer')();}G.modo='jogo';const t=vv('caminhonete');vai(t.x+2.5,t.z);X('abrirBau')({itens:t.itens,nome:'Porta-malas'});for(let i=6;i<P.inv.length;i++)if(P.inv[i])X('bauGuardar')(i);X('fecharMochila')();"),
      ev("F7_guardou", F+"const t=vv('caminhonete');return{inv:ids(),carga:t.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(',')};")]
s += [js(F+"Z.length=0;G.hora=12;const d=D('fazenda');vai(d.px+2.2,d.pz);mira(d.px,d.py+1,d.pz);add('bandeira',1);window.__hold0=T().t.fazenda.dono;"), ["gwait", 0.3],
      js(F+"Z.length=0;const d=D('fazenda'),a=X('interAtual')();window.__alvoT=a&&a.k;IK.terrBandeira.usar(d,true);"), ["gwait", 0.4],
      ev("F7_territorio", F+"const t=T().t.fazenda;return{alvo:window.__alvoT,donoAntes:window.__hold0,doGrupo:t.dono===X('grupoD')().id,controle:Math.round(t.controle||0),bandeiras:conta('bandeira'),registro:(T().registro.slice(-1)[0]||{}).txt};"),
      js(F+"G.m.etapa=Math.max(2,G.m.etapa);X('terrOfertas')();const o=T().ofertas[0];window.__ofertas=T().ofertas.length;if(o){add(o.quer[0],o.quer[1]);window.__q0=conta(o.quer[0]);X('terrAceitar')(o);window.__aceitou=o.aceita;window.__pagou=window.__q0-conta(o.quer[0]);}"),
      ev("F7_troca", F+"return{ofertas:window.__ofertas,aceitou:window.__aceitou,pagou:window.__pagou,pendentes:T().trocasPendentes.length};")]
# ---------------- salvar, recarregar e conferir ----------------
# salva longe da fazenda: lá mora o Fazendeiro (chefe da região, 1000 de vida), que nasce assim que você chega a 38 m e
# ataca quem continua o jogo parado do lado dele. O teste confere o salvamento, então salva junto da caminhonete.
s += [js(F+"G.modo='jogo';Z.length=0;const t=vv('caminhonete'),e=X('mundoD')();vai(t.x+2.5,t.z);sessionStorage.setItem('__int',JSON.stringify({ap:G.aparencia,v:visto(),inv:ids(),dia:G.dia,barr:ob('barricada').length,obras:X('OB').length,comb:r2(t.comb),tx:r2(t.x),carga:t.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(','),dono:T().t.fazenda.dono,ev:e.ev.length,trocas:T().trocasPendentes.length}));X('salvarJogo')();"),
      ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.0],
      ev("FIM_carregou", F+"const a=JSON.parse(sessionStorage.getItem('__int')||'null'),t=vv('caminhonete'),e=X('mundoD')(),agora={ap:G.aparencia,v:visto(),inv:ids(),dia:G.dia,barr:ob('barricada').length,obras:X('OB').length,comb:r2(t.comb),tx:r2(t.x),carga:t.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(','),dono:T().t.fazenda.dono,ev:e.ev.length,trocas:T().trocasPendentes.length};"
         "const dif=[];if(a)for(const k in a)if(JSON.stringify(a[k])!==JSON.stringify(agora[k]))dif.push(k+': '+JSON.stringify(a[k])+' -> '+JSON.stringify(agora[k]));return{modo:G.modo,diferencas:dif,agora};")]
s += foto("620_integracao_fim.png", F+"G.hora=11;Z.length=0;n.cfg.cam='3';const a=P.ch.yaw;G.camFix={pos:[P.x+Math.sin(a)*2.8,P.y+1.3,P.z+Math.cos(a)*2.8],tgt:[P.x,P.y+0.95,P.z],fov:0.75};", 0.4)
salvar('p113.json', s)

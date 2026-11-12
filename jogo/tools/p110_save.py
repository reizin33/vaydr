"""p110: salvamento seguro — cópia anterior, conferência antes de gravar (não troca o bom por um quebrado), recuperação pela cópia
anterior e pela do começo do dia, tudo quebrado (menu avisa), migração (item e construção que não existem mais, número inválido),
salvo caído (acorda na clareira com a mochila no lugar), tela Salvamento (voltar para uma cópia), baixar e abrir de arquivo, novo jogo apaga."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const K=X('SAVE_KEY'),KB=X('SAVE_BAK'),KD=X('SAVE_DIA'),KR=X('SAVE_RUIM'),LS=localStorage,ler=k=>{try{return JSON.parse(LS.getItem(k));}catch(e){return 'ERRO';}},"
     "toasts=()=>[...document.querySelectorAll('#radio .toast p')].map(p=>p.textContent).slice(-2).join(' / ');")
s = inicio("X('FAUNA_POP').ativosMax=0;Z.length=0;for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);")
# 1) duas gravações: a primeira vira a cópia anterior
s += [js(F+"vivo();G.dia=3;X('salvarJogo')();window.__t1=LS.getItem(K);G.dia=4;X('salvarJogo')();"),
      ev("copias", F+"const a=ler(K),b=ler(KB);return{principal:a&&a.dia,anterior:b&&b.dia,sv:a&&a.sv,tamanhoKB:Math.round(LS.getItem(K).length/1024)};")]
# 2) conferência: posição NaN não sobrescreve
s += [js(F+"const x=P.x;P.x=NaN;window.__ok=X('salvarJogo')();P.x=x;"), ["wait", 0.3],
      ev("naoGravaQuebrado", F+"const a=ler(K);return{gravou:window.__ok,principalAindaDia:a&&a.dia,posValida:a&&isFinite(a.P.x),aviso:toasts()};")]
# 3) principal estragado: abre a anterior e avisa
s += [js(F+"LS.setItem(K,'{\"v\":1,\"dia\":\"quebrado\"');G.dia=99;window.__ok=X('carregarJogo')();X('jogar')();"), ["wait", 2.4],
      ev("recuperaAnterior", F+"return{abriu:window.__ok,dia:G.dia,guardouEstragado:!!LS.getItem(KR),aviso:toasts()};")]
# 4) principal e anterior estragados: abre a do começo do dia
s += [js(F+"const ok=JSON.parse(window.__t1);ok.dia=2;LS.setItem(KD,JSON.stringify(ok));LS.setItem(K,'xx');LS.setItem(KB,'{\"v\":1}');window.__ok=X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("recuperaDia", F+"return{abriu:window.__ok,dia:G.dia};")]
# 5) tudo estragado: não abre, menu avisa
s += [js(F+"LS.setItem(K,'xx');LS.setItem(KB,'yy');LS.setItem(KD,'zz');window.__tem=X('temSave')();X('mostrarMenu')();"), ["wait", 0.3], ["wait", 0.4]]   # sem "Continuar": o menu avisa que o save não abre
s += [ev("tudoQuebrado", F+"return{temSave:window.__tem,continuarVisivel:!document.getElementById('m-continuar').hidden,aviso:(document.getElementById('m-aviso')||{}).textContent,modo:G.modo};")]
# 6) migração: item que não existe, construção que não existe, vida inválida, pilha acima do máximo
s += [js(F+"const ok=JSON.parse(window.__t1);ok.dia=5;ok.P.inv[0]={id:'itemQueSumiu',n:3};ok.P.inv[1]={id:'pregos',n:9999};ok.P.vida='abc';ok.obras.push(['obraQueSumiu',1,1,0,10,10,0,0,0]);"
         "LS.setItem(K,JSON.stringify(ok));window.__ok=X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("migracao", F+"return{abriu:window.__ok,dia:G.dia,slot0:P.inv[0],pregos:P.inv[1]&&P.inv[1].n,max:X('ITEMS').pregos.max,vida:P.vida,obrasDesconhecidas:X('OB').filter(o=>!X('OBRAS')[o.tipo]).length};")]
# 7) salvo caído: acorda com vida e a mochila fica onde caiu
s += [js(F+"vivo();Z.length=0;for(let i=6;i<P.inv.length;i++)P.inv[i]=null;X('invAdd')('tabuas',5);const x=P.x,z=P.z;vai(x+30,z+5);window.__onde=[P.x,P.z];X('morrer')();G.modo='morto';X('salvarJogo')();window.__ok=X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("caidoAoCarregar", F+"return{abriu:window.__ok,vivo:P.alive,vida:Math.round(P.vida),mochila:!!P.mochila,mochilaNoLugar:P.mochila?Math.round(Math.hypot(P.mochila.x-window.__onde[0],P.mochila.z-window.__onde[1])):null,longeDaMochila:P.mochila?Math.round(Math.hypot(P.mochila.x-P.x,P.mochila.z-P.z)):null};")]
# 8) tela Salvamento (da pausa): lista e voltar para a cópia anterior
s += [js(F+"vivo();G.dia=7;X('salvarJogo')();G.dia=8;X('salvarJogo')();X('pausar')();"), ["wait", 0.3], ["click", "#p-salvo"], ["wait", 0.4]]
s += [["shot", "500_tela_salvamento.png"]]
s += [ev("telaSalvamento", F+"return{visivel:!document.getElementById('t-salvo').hidden,itens:[...document.querySelectorAll('#sv-lista li')].map(l=>l.textContent.slice(0,60)).join(' | ')};"),
      ["click", "#sv-lista [data-copia]"], ["wait", 0.2],
      ev("confirma", F+"const b=document.querySelector('#sv-lista [data-copia]');return{texto:b&&b.textContent};"),
      ["click", "#sv-lista [data-copia]"], ["wait", 0.6],
      ev("voltouCopia", F+"return{modo:G.modo,dia:G.dia};")]
# 9) baixar e abrir de arquivo
s += [js(F+"window.__dl=null;X('saveBaixar')().then(ok=>{window.__dl=ok;});"), ["wait", 0.6],
      ev("baixar", F+"return{ok:window.__dl,tem:!!window.__saveBaixado,msg:document.getElementById('sv-msg').textContent};"),
      js(F+"X('pausar')();X('abrirSalvamento')('t-pausa');const t=JSON.parse(window.__saveBaixado);t.dia=11;window.__okA=X('saveAbrirTexto')(JSON.stringify(t));window.__okB=X('saveAbrirTexto')('isso não é save');"), ["wait", 0.3],
      ev("abrirArquivo", F+"return{valido:window.__okA,invalido:window.__okB,msg:document.getElementById('sv-msg').textContent};"),
      js(F+"const t=JSON.parse(window.__saveBaixado);t.dia=11;X('saveAbrirTexto')(JSON.stringify(t));"), ["wait", 0.2],
      ["click", "#sv-lista [data-copia='arquivo']"], ["wait", 0.2], ["click", "#sv-lista [data-copia='arquivo']"], ["wait", 0.6],
      ev("abriuArquivo", F+"return{modo:G.modo,dia:G.dia};")]
# 10) menu: Salvamentos abre e volta; (versão 10) Novo mundo começa noutro mundo e não apaga o de antes
s += [js(F+"X('salvarJogo')();X('salvarJogo')();X('mostrarMenu')();"), ["wait", 0.3], ["click", "#m-salvo"], ["wait", 0.3],
      ev("doMenu", F+"return{visivel:!document.getElementById('t-salvo').hidden};"), ["click", "#sv-voltar"], ["wait", 0.3],
      ev("voltouMenu", F+"return{menu:!document.getElementById('t-menu').hidden};"),
      ["click", "#m-novo"], ["wait", 1.0],
      ev("novoMundo", F+"return{antigoContinua:!!LS.getItem('nnc_jogo_v1')&&ler('nnc_jogo_v1').dia,chaveNova:K!=='nnc_jogo_v1',novoSalvo:!!LS.getItem(K),diaJogo:G.dia};")]
salvar('p110.json', s)

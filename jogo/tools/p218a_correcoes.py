"""p218a: correções pedidas pelo Himalaia no jogo (sem fotos, só lógica, no jogo rodando):
trava do mouse que não desiste por uma recusa; rifle atirando logo depois de recarregar (recarga pelo R, pela arma vazia e com
clique durante a recarga, mirando ou não); Tab abre só a mochila; pilha no chão (toque E pega tudo, segure E abre o menu do chão
sozinho); de frente para a porta o E é da porta; barra de progresso ao usar o kit médico e ao recarregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=Math.max(P.vida,1);};G.hora=11;")]
# --- mouse: uma recusa não desiste; três recusas em mais de 4 s, sim ---
s += [ev("mouse", "X('semTrava=false');X('lockComGesto=true');X('lockFalhas=0');X('falhaTrava')({name:'SecurityError'});const a=X('semTrava');"
         "X('falhaTrava')({name:'SecurityError'});const b=X('semTrava');X('lockFalhaT=performance.now()-5000');X('falhaTrava')({name:'SecurityError'});const c=X('semTrava');"
         "X('semTrava=true');return{depoisDe1:a,depoisDe2:b,depoisDe3em5s:c};")]
# --- rifle ---
s += [js("X('invAdd')('rifle',1);X('invAdd')('balaRifle',20);sel('rifle');const it=X('selItem')();it.mun=0;X('IN').aim=false;P.acao=null;P.cd=0;"),
      js("X('recarregar')();"), ["gwait", 0.4],
      ev("rifle_recarregando", "const a=P.acao;return{acao:a&&a.tipo,barra:!document.querySelector('.uso-barra').hidden,texto:document.querySelector('.uso-barra b').textContent};"),
      ["gwait", 2.0],
      ev("rifle_recarregou", "return{mun:X('selItem')().mun,acao:P.acao&&P.acao.tipo,cd:r2(P.cd)};"),
      js("const I=X('IN');I.atkQ=true;"), ["gwait", 0.25],
      ev("rifle_tiro1", "return{mun:X('selItem')().mun,acao:P.acao&&P.acao.tipo};")]
for i in range(4):
    s += [["gwait", 1.3], js("X('IN').atkQ=true;"), ["gwait", 0.2]]
s += [ev("rifle_vazio", "return{mun:X('selItem')().mun};"),
      ["gwait", 1.3], js("X('IN').atkQ=true;"), ["gwait", 0.6],   # arma vazia: o clique recarrega sozinho
      ev("rifle_autorecarga", "return{acao:P.acao&&P.acao.tipo};"),
      js("X('IN').atkQ=true;"), ["gwait", 0.3],   # clique durante a recarga: fica na fila
      ev("rifle_fila", "return{acao:P.acao&&P.acao.tipo,fila:X('IN').atkQ};"), ["gwait", 1.8],
      ev("rifle_depoisFila", "return{mun:X('selItem')().mun,acao:P.acao&&P.acao.tipo};"),
      # mirando (luneta) e recarregando com R no meio do pente
      ["gwait", 1.4], js("X('IN').aim=true;"), ["gwait", 0.5], js("X('recarregar')();"), ["gwait", 2.3],
      ev("rifle_mirandoRecarregou", "return{mun:X('selItem')().mun,luneta:X('lunetaAtiva')(),acao:P.acao&&P.acao.tipo};"),
      js("X('IN').atkQ=true;"), ["gwait", 0.25],
      ev("rifle_mirandoTiro", "return{mun:X('selItem')().mun,acao:P.acao&&P.acao.tipo};"),
      js("X('IN').aim=false;"), ["gwait", 1.4]]
# --- Tab e pilha no chão ---
s += [js("sel('machado')||0;X('soltarItens')([['madeira',5]],P.x+0.5,P.z+0.2);"), ["gwait", 0.3],
      js("X('abrirMochila')();"), ["gwait", 0.2],
      ev("tab", "return{aba:X('invAba'),bau:!!X('bauAberto'),abaMochilaVisivel:!document.getElementById('aba-mochila').hidden};"),
      js("X('fecharMochila')();P.yaw=Math.atan2(0.5,0.2);P.body=P.yaw;"), ["gwait", 0.3],
      ev("pilha_texto", "const a=X('interAtual')();X('alvoInter='+'null');return{alvo:a&&a.k,txt:a&&X('textoInter')(a)};"),
      js("const a=X('interAtual')();window.__a=a;n.ev('alvoInter=window.__a');X('usarPress')();"), ["gwait", 0.15], js("X('usarSolta')();"), ["gwait", 0.2],
      ev("pilha_toque", "return{madeira:conta('madeira'),pilhas:X('DROPS').length};"),
      js("X('soltarItens')([['madeira',3]],P.x+0.5,P.z+0.2);"), ["gwait", 0.3],
      js("const a=X('interAtual')();window.__a=a;n.ev('alvoInter=window.__a');X('usarPress')();"), ["gwait", 0.9],
      ev("pilha_segura", "return{modo:G.modo,aba:X('invAba'),bau:!!X('bauAberto'),abas:['mochila','fabricar','tarefas','nivel','bau'].filter(k=>!document.getElementById('aba-'+k).hidden)};"),
      js("X('fecharMochila')();")]
# --- de frente para a porta, com pilha no pé ---
s += [js("const D=X('CID').portas.filter(d=>d.estado!=='quebrada'&&d.tipo!=='elevador'&&d.f===0&&Math.abs(d.y-X('ground')(d.x,d.z))<0.3);"
         "let d=null,bd=1e9;for(const q of D){const k=Math.hypot(q.x-P.x,q.z-P.z);if(k<bd){bd=k;d=q;}}window.__d=d;"
         "const nx=Math.sin(d.yaw),nz=Math.cos(d.yaw);let x=d.x+nx*1.1,z=d.z+nz*1.1;if(X('pointBlocked')(x,z,0.3)){x=d.x-nx*1.1;z=d.z-nz*1.1;}vai(x,z,d.y);"
         "P.yaw=Math.atan2(d.x-P.x,d.z-P.z);P.body=P.yaw;X('soltarItens')([['madeira',2]],P.x,P.z,P.y);"), ["gwait", 0.4],
      ev("porta", "const a=X('interAtual')();return{alvo:a&&a.k,txt:a&&X('textoInter')(a)&&X('textoInter')(a).t,porta:!!window.__d,dist:r2(Math.hypot(window.__d.x-P.x,window.__d.z-P.z))};")]
# --- kit médico: barra de progresso ---
s += [js("X('invAdd')('kit',1);P.vida=40;sel('kit');P.acao=null;P.cd=0;X('atacar')();"), ["gwait", 0.3],
      ev("kit_usando", "const b=document.querySelector('.uso-barra');return{acao:P.acao&&P.acao.tipo,barra:!b.hidden,texto:b.firstChild.textContent,p:+getComputedStyle(b).getPropertyValue('--p')};"),
      ["gwait", 1.0],
      ev("kit_depois", "const b=document.querySelector('.uso-barra');return{vida:Math.round(P.vida),barra:!b.hidden,kit:conta('kit')};")]
salvar('p218a_correcoes.json', s, vp=(960, 540))

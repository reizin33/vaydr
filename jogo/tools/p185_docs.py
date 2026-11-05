"""p185: Etapa 17, manual (guias de energia na seção Eletricidade; peças novas da aba Energia na mesma seção), ajuda e tecla da tela de fios."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("docs", "const L=[];for(const f of X('MANUAL_EXTRA')){try{const r=f();if(Array.isArray(r))L.push(...r);}catch(e){L.push({id:'ERRO '+e.message});}}"
         "const e17=L.filter(q=>/^x:(energia|logica|ligaveis|geladeira|defesasE|esteira)$/.test(q.id));const aj=document.querySelector('#t-ajuda [data-e17p]');"
         "const secs=X('E17_OBRAS').map(k=>k+':'+X('mnSecObra')(k));return{guias:e17.map(q=>q.id+':'+q.sec+':'+q.proc.length),erros:L.filter(q=>/^ERRO/.test(q.id)).map(q=>q.id),ajuda:aj?aj.textContent.slice(0,90):null,"
         "secoes:secs.filter(t=>!t.endsWith(':eletricidade')),receitas:X('RECIPES').filter(r=>r.faz==='fio'||r.faz==='alicate').map(r=>r.faz+':'+r.cat),tecla:X('ACOES_TECLA').filter(a=>a.id==='telaFios').map(a=>a.id+':'+a.pad)};"),
      js("X('abrirManual')&&X('abrirManual')();"), ["wait", 0.6],
      ev("manualTela", "const t=document.getElementById('t-manual');const txt=t?t.textContent:'';return{aberto:!!t&&!t.hidden,temEletricidade:/Eletricidade/.test(txt)};")]
salvar('p185.json', s)

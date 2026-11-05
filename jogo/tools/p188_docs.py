"""p188: Etapa 18, manual (guias de reboque e guincho na seção Mecânica e veículos), ajuda e os reboques novos na aba Oficina."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("docs", "const L=[];for(const f of X('MANUAL_EXTRA')){try{const r=f();if(Array.isArray(r))L.push(...r);}catch(e){L.push({id:'ERRO '+e.message});}}"
         "const e18=L.filter(q=>/^x:(reboques|guincho|guinchoCam)$/.test(q.id));const aj=document.querySelector('#t-ajuda [data-e18p]');"
         "return{guias:e18.map(q=>q.id+':'+q.sec+':'+q.proc.length),erros:L.filter(q=>/^ERRO/.test(q.id)).map(q=>q.id),ajuda:aj?aj.textContent.slice(0,80):null,"
         "aba:X('OBRA_CATS').find(c=>c.id==='oficina').t.slice(-2),secoes:['reboqueBarco','plataformaReboque'].map(k=>X('mnSecObra')(k))};"),
      js("X('abrirManual')&&X('abrirManual')();"), ["wait", 0.6],
      ev("manualTela", "const t=document.getElementById('t-manual');const txt=t?t.textContent:'';return{aberto:!!t&&!t.hidden,temMecanica:/Mecânica e veículos/.test(txt)};")]
salvar('p188.json', s)

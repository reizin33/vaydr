"""p181: Etapa 16, manual (guias novos na seção Construções e base, serrote e pá nas ferramentas), ajuda e missões da primeira casa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("docs", "const L=[];for(const f of X('MANUAL_EXTRA')){try{const r=f();if(Array.isArray(r))L.push(...r);}catch(e){L.push({id:'ERRO '+e.message});}}"
         "const e16=L.filter(q=>/^x:(mover|estabilidade|casa4|escadas|porao|marco|pontes)$/.test(q.id));const aj=document.querySelector('#t-ajuda [data-e16p]');const GP=X('GUIA_PASSOS');"
         "return{guias:e16.map(q=>q.id+':'+q.sec+':'+q.proc.length),ajuda:aj?aj.textContent.slice(0,80):null,escada:GP.find(q=>q.id==='escada').d.slice(0,60),telhado:GP.find(q=>q.id==='telhado').d.slice(0,50),"
         "receitas:X('RECIPES').filter(r=>r.faz==='serrote'||r.faz==='pa').map(r=>r.faz+':'+r.cat),teclas:X('ACOES_TECLA').filter(a=>/Peca$/.test(a.id)).map(a=>a.id+':'+a.pad)};"),
      js("X('abrirManual')&&X('abrirManual')();"), ["wait", 0.6],
      ev("manualTela", "const t=document.getElementById('t-manual');const txt=t?t.textContent:'';return{aberto:!!t&&!t.hidden,temConstrucoes:/Construções e base/.test(txt)};")]
salvar('p181.json', s)

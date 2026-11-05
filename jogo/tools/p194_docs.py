"""p194: Etapa 20, manual e ajuda: os guias do mar (maré, porto, naufrágios, peixes do mar, mergulho, deque e píer no mar),
o guia dos peixes de água doce sem os do mar, o parágrafo da ajuda e as obras novas na aba Água."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("docs", "const L=[];for(const f of X('MANUAL_EXTRA')){try{L.push(...f());}catch(e){L.push({id:'ERRO',nome:String(e)});}}const ids=['x:mar','x:porto','x:naufragios','x:peixesMar','x:mergulho','x:construcoesMar'];"
       "const g=ids.map(id=>{const e=L.find(q=>q.id===id);return e?id+':'+e.sec+':'+e.proc.length:id+':FALTA';}),doce=L.find(q=>q.id==='x:peixes'),pm=L.find(q=>q.id==='x:peixesMar');"
       "const aj=document.querySelector('#t-ajuda [data-e20p]');return{guias:g,erros:L.filter(q=>q.id==='ERRO').map(q=>q.nome),doceSemMar:doce?!doce.proc.some(t=>/Tainha|Robalo|Garoupa/.test(t)):null,doceN:doce&&doce.proc.length,"
       "marN:pm&&pm.proc.length,ajuda:aj?aj.textContent.slice(0,80):null,aba:X('OBRA_CATS').find(c=>c.id==='agua').t.slice(-3),pierDesc:!!X('OBRAS').pier.desc,dequeDesc:X('OBRAS').deque.desc.slice(0,60)};")]
salvar('p194.json', s)

import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = "const B=X('BICHOS'),cria=(t,x,z,o)=>X('criarBicho')(t,x,z,o||{}),limpa=()=>{B.length=0;};"
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js(F+"vivo();limpa();G.hora=0.5;P.vida=100;vai(66,80);P.yaw=0;P.body=0;const o=cria('onca',66,66,{yaw:0});window.__o=o;window.__tr=[];window.__cadaPasso=()=>{const o=window.__o;if(Math.random()<0.05)window.__tr.push([o.st,Math.round(Math.hypot(o.x-P.x,o.z-P.z)*10)/10,Math.round(o.vAlvo*10)/10,Math.round(o.v*10)/10,o.alerta.toFixed(2),o.amea?o.amea.p:null,Math.round(P.vida)]);};")]
s += [["gwait", 8.0], ev("onca", F+"window.__cadaPasso=null;return{tr:window.__tr.slice(0,60),En:X('E').n};")]
s += [js(F+"vivo();limpa();G.hora=11;vai(-40,100);const l=cria('lobo',-70,90,{yaw:0});l.fome=999;const o=cria('ovelha',-70,98,{yaw:0});o.st='come';o.t=30;window.__l=l;window.__o2=o;window.__tr=[];"
         "window.__cadaPasso=()=>{const l=window.__l,o=window.__o2;if(Math.random()<0.05)window.__tr.push([l.st,o.st,Math.round(Math.hypot(o.x-l.x,o.z-l.z)*10)/10,Math.round(o.hp),l.presa===o,l.atqT.toFixed(2),l.cd.toFixed(2)]);};")]
s += [["gwait", 8.0], ev("predador", F+"window.__cadaPasso=null;return window.__tr.slice(0,60);")]
salvar('p96d.json', s)

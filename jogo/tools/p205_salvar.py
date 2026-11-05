"""p205: Etapa 25, salvar e carregar em todos os sistemas: mexe em vários sistemas (baú e horta construídos, porta e contêiner de
um sítio, regiões e descobertas, desafios do Armazém Norte e do Galpão, caixa militar, diário, vida), salva, começa um jogo novo,
carrega e confere parte por parte (as gerais e as de cada módulo, inclusive as que ficaram como estavam) que o jogo voltou igual."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const DD=(x,y,p,o)=>{if(o.length>=6)return;if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))DD(x[k],y[k],p+'.'+k,o);}else o.push([p,String(JSON.stringify(x)).slice(0,90),String(JSON.stringify(y)).slice(0,90)]);},"
     "ord=o=>{if(typeof o==='number')return Math.round(o*1e9)/1e9;if(Array.isArray(o))return o.map(ord);if(o&&typeof o==='object'){const r={};for(const k of Object.keys(o).sort())r[k]=ord(o[k]);return r;}return o;},J=o=>JSON.stringify(ord(o));")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{P.vida=100;P.fome=100;P.sede=100;};"),
      j("n.invAdd('tabuas',40);n.invAdd('pregos',40);n.invAdd('madeira',40);n.invAdd('pedra',30);n.invAdd('sementes',6);"
        "window.__pos=[];for(const[t,dx,dz]of[['bau',4,3],['muro',7,-3],['fogueira',-5,4],['horta',-8,-5]]){vai(F[0]+dx,F[2]+dz);P.yaw=0;P.pitch=-0.4;const n0=X('OB').length;try{X('modoObra')(true);X('OBRA').tipo=t;X('obraAlvo')();X('colocarObra')();}finally{X('modoObra')(false);}window.__pos.push([t,X('OB').length>n0]);}"),
      ["gwait", 1.0],
      j("const d=X('CID').portas.find(q=>q.p&&q.p.rural&&q.estado==='fechada');if(d)X('portaUsar')(d,false);const c=X('CID').conts.find(q=>q.p&&q.p.rural);if(c){X('contEncher')(c);c.estado='vasculhado';}"
        "const R=X('regD')();R.alto.descoberta=1;R.alto.mapeada=true;R.vila.descoberta=1;const g=X('pdsD')();g.fus=true;X('dsfD')().fus=true;"
        "X('cxmD')().cxmAlto.visto=true;if(X('diarioEvento'))X('diarioEvento')('Teste de salvar','geral');G.kills=7;P.vida=80;"),
      ["gwait", 1.0],
      e("antes", "const s=X('serializar')();return{chaves:Object.keys(s).length,x8:Object.keys(s.x8).length,obras:s.obras.length,colocadas:window.__pos,kb:Math.round(J(s).length/1024)};"),
      e("salvou", "window.__s1=J(X('serializar')());const ok=X('salvarJogo')()!==false;let gravado=null;try{gravado=X('fontesSave')()[0].s;}catch(e){}const sem=o=>{const c=Object.assign({},o);delete c.sv;delete c.salvoEm;return J(c);};return{ok,mesmoQueGravou:gravado?sem(gravado)===sem(JSON.parse(window.__s1)):'?'};"),
      j("X('novoJogo')();"), ["gwait", 0.5],
      e("zerado", "const s=X('serializar')();return{obras:s.obras.length,igual:J(s)===window.__s1};"),
      e("carregou", "X('carregarJogo')();window.__s2=J(X('serializar')());const a=JSON.parse(window.__s1),b=JSON.parse(window.__s2),dif=[],volat=new Set(['tm','salvoEm','sv']);for(const k in a){if(volat.has(k)||k==='x8')continue;if(JSON.stringify(a[k])!==JSON.stringify(b[k]))dif.push(k);}"
        "for(const k in a.x8){if(JSON.stringify(a.x8[k])!==JSON.stringify((b.x8||{})[k]))dif.push('x8.'+k);}return{chaves:Object.keys(a).length+Object.keys(a.x8).length,diferentes:dif,obras:b.obras.length};"),
      e("detalhe", "const a=JSON.parse(window.__s1),b=JSON.parse(window.__s2),volat=new Set(['tm','salvoEm','sv']),out={};for(const k in a){if(volat.has(k)||k==='x8')continue;const o=[];DD(a[k],b[k],k,o);if(o.length)out[k]=o;}for(const q in a.x8){const o=[];DD(a.x8[q],(b.x8||{})[q],'x8.'+q,o);if(o.length)out['x8.'+q]=o;}return out;")]
salvar('p205.json', s, vp=(640, 360))

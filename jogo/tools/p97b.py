"""p97: rastros, oficinas (fornalha, bancada de armas, defumador, oficina), validade da comida, ferida grave, abrigo, chuva x roupa, serra e minério."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const B=X('BICHOS'),cria=(t,x,z,o)=>X('criarBicho')(t,x,z,o||{}),limpa=()=>{B.length=0;},vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},"
     "add=(id,q,ex)=>X('invAdd')(id,q,ex),EM=id=>X('EST_MUNDO').find(e=>e.id===id),RA=X('RASTROS');")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("serra", F+"const S=X('SERRA'),h=X('ground')(S.x,S.z),h2=X('ground')(-20,-30),R=X('ROCKS').filter(r=>r.serra);return{alturaCentro:r2(h),alturaMata:r2(h2),pedrasSerra:R.length};"),
      js(F+"vivo();vazio();add('picareta',1);const r=X('ROCKS').find(r=>r.serra&&r.alive);vai(r.x+r.s*0.9+0.6,r.z);mira(r.x,r.y+0.5,r.z);P.body=P.yaw;const i=P.inv.findIndex(s=>s&&s.id==='picareta');n.selecionar(i);window.__r=r;"),
      js(F+"for(let k=0;k<6;k++){X('golpeAcerta')({arma:P.inv[P.sel],vertical:true});}"),
      ev("minerio", F+"return{pedra:X('invCount')('pedra'),minerio:X('invCount')('minerioFerro'),hp:window.__r.hp};")]
s += foto("361_serra.png", F+"vivo();vazio();G.hora=10;const S=X('SERRA');vai(S.x+30,S.z+28);G.camFix={pos:[S.x+34,X('ground')(S.x+34,S.z+30)+5,S.z+30],tgt:[S.x,X('ground')(S.x,S.z)+2,S.z]};", 0.3)
s += foto("362_oficinas.png", F+"vivo();const e=EM('fornalhaSerra');vai(e.x+4,e.z+4);G.camFix={pos:[e.x+3.2,e.y+2.0,e.z+3.2],tgt:[e.x,e.y+0.8,e.z]};", 0.3)
s += foto("363_curtume.png", F+"vivo();const e=X('EST_MUNDO')[0];vai(e.x+5,e.z+5);G.camFix={pos:[e.x+2.6,e.y+1.7,e.z+2.8],tgt:[e.x,e.y+0.9,e.z]};", 0.3)
s += [js("G.camFix=null;"), js(F+"vivo();const e=X('EST_MUNDO')[0];vai(e.x+1.6,e.z+0.8);vazio();add('couro',3,{q:1});add('gordura',1);X('abrirEstacao')(e);"), ["wait", 0.5],
      js("window.__semRender=false;window.__turbo=1;"), ["wait", 2], ["shot", "364_tela_estacao.png"], js("window.__semRender=true;window.__turbo=6;"), js(F+"X('fecharEstacao')();")]
s += [js(F+"vivo();G.modo='jogo';X('diarioEvento')('Teste do diário');X('abrirDiario')('t-pausa');"), ["wait",0.5], js("window.__semRender=false;window.__turbo=1;"), ["wait",1.5], ["shot","365_diario.png"],
      js("document.querySelector('.dr-aba[data-aba=desc]').click();"), ["wait",0.8], ["shot","366_diario_desc.png"],
      js("document.querySelector('.dr-aba[data-aba=est]').click();"), ["wait",0.8], ["shot","367_diario_est.png"], js("window.__semRender=true;window.__turbo=6;"),
      ev("diario", F+"const D=X('G').diario;return{ev:D.ev.length,desc:Object.keys(D.desc).length,contas:JSON.stringify(D.contas).slice(0,300),tela:!document.getElementById('t-diario').hidden,itens:document.querySelectorAll('#dr-lista li').length};"),
      js("document.getElementById('dr-voltar').click();")]
salvar('p97b.json', s)

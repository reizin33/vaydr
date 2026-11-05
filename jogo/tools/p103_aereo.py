"""p103: destroços de avião (ilhota, avião de carga, helicóptero): saque, documento, sinalizador; caixa de suprimentos que desce de paraquedas;
sinalizador chama o avião; afogados sobem da água quando você nada; salvar/carregar; fotos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const AE=X('AEREO'),A=()=>X('aereoD')(),IK=X('INTER_K'),IN=X('IN'),gr=(x,z)=>X('ground')(x,z),RIO=X('RIO'),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),D=id=>AE.destrocos.find(d=>d.id===id);")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("destrocos", F+"return AE.destrocos.map(d=>({id:d.id,y:r2(d.y),chao:r2(gr(d.x,d.z)),caixas:d.pts.caixas.length,arvoresEmCima:X('TREES').filter(t=>t.alive&&Math.hypot(t.x-d.x,t.z-d.z)<4).length,bloqueia:!!X('pointBlocked')(d.x,d.z,0.3)}));")]
# helicóptero: caixa com sinalizador e documento
s += [js(F+"vivo();vazio();Z.length=0;const d=D('heli'),c=d.pts.caixas[0];vai(c.p[0]+1.2,c.p[1]);"), ["gwait", 0.3], ev("alvoHeli", F+"const a=X('interAtual')();return a&&a.k;"),
      js(F+"const c=D('heli').pts.caixas[0];IK.avCaixa.usar(c);"), ["wait", 0.3],
      ev("caixaHeli", F+"const L=A().caixas[D('heli').pts.caixas[0].id];return{modo:G.modo,itens:L.filter(Boolean).map(q=>q.id).join(','),sinalizador:L.some(q=>q&&q.id==='sinalizador')};"),
      js(F+"X('fecharMochila')();const d=D('heli');IK.avDoc.usar(d);"), ["wait", 0.3],
      ev("docHeli", F+"return{modo:G.modo,titulo:document.getElementById('doc-tit').textContent};"), js(F+"X('fecharDoc')();")]
# caixa de suprimentos: avião, paraquedas e pouso
s += [js(F+"G.ev=null;const x=P.x+30,z=P.z+5;window.__alvo=[x,z];window.__ok=X('aereoLancar')(x,z,'radio');"), ["gwait", 2],
      ev("vooComecou", F+"const L=A().lancamento;return{ok:window.__ok,fase:L&&L.fase,t:L&&r2(L.t),tSolta:L&&r2(L.tSolta)};")]
s += foto("430_aviao_paraquedas.png", F+"const L=A().lancamento;L.t=L.tSolta+1.5;L.fase='desce';L.y=gr(L.x,L.z)+22;G.camFix={pos:[L.x+18,gr(L.x,L.z)+6,L.z+18],tgt:[L.x,gr(L.x,L.z)+16,L.z]};", 0.2)
s += [js("G.camFix=null;"), ["gwait", 12],
      ev("pousou", F+"return{lancamento:!!A().lancamento,caixa:!!(G.ev&&G.ev.ativo),x:G.ev&&r2(G.ev.x),z:G.ev&&r2(G.ev.z),alvo:window.__alvo};")]
# sinalizador: dispara e o avião vem
s += [js(F+"G.ev=null;A().lancamento=null;vazio();add('sinalizador',1);const i=P.inv.findIndex(q=>q&&q.id==='sinalizador');X('usarUtil')(i);"), ["wait", 21], ["gwait", 0.5],
      ev("sinalizador", F+"const L=A().lancamento;return{gastou:conta('sinalizador')===0,aviaoVindo:!!L,motivo:L&&L.motivo,dist:L?r2(Math.hypot(L.x-P.x,L.z-P.z)):null};")]
# afogados: nadar no lago faz eles subirem
s += [js(F+"A().lancamento=null;G.ev=null;Z.length=0;const L=X('LAGO');vai(L.x-6,L.z+2);G.hora=22;A().afogT=0;"), ["gwait", 1],
      js(F+"A().afogT=0;"), ["gwait", 1], js(F+"A().afogT=0;"), ["gwait", 1], js(F+"A().afogT=0;"), ["gwait", 1],
      ev("afogados", F+"const L=Z.filter(z=>z.afogado&&z.vivo);return{nadando:!!P.nada,prof:r2(X('aguaProf')(P.x,P.z)),afogados:L.length,tint:L[0]&&L[0].tint,estado:L[0]&&L[0].st};")]
# ilhota: monomotor
s += foto("431_monomotor_ilha.png", F+"Z.length=0;G.hora=11;const d=D('cessna');vai(d.x+3,d.z+3);G.camFix={pos:[d.x+7,d.y+3.5,d.z+7],tgt:[d.x,d.y+0.6,d.z]};", 0.3)
s += foto("432_aviao_carga.png", F+"const d=D('carga');vai(d.x+20,d.z+20);G.camFix={pos:[d.x+20,d.y+8,d.z+18],tgt:[d.x,d.y+1,d.z]};", 0.3)
s += foto("433_helicoptero.png", F+"const d=D('heli');vai(d.x+8,d.z+8);G.camFix={pos:[d.x+9,d.y+3.5,d.z+8],tgt:[d.x,d.y+0.8,d.z]};", 0.3)
s += [js("G.camFix=null;")]
# salvar com caixa aberta
s += [js(F+"X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.3],
      ev("carregar", F+"return{caixasAbertas:Object.keys(A().caixas).length,docs:Object.keys(A().docs).length};")]
salvar('p103.json', s)

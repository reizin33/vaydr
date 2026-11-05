"""p96: fauna em ação — habitats, fuga, matilha, urso, javali, onça, predador caçando, colisões, rendimento, carcaça,
inventário cheio, curtimento, receitas, vestir/tirar, atributos, mochilas, conserto, salvar/carregar e desempenho."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const vg=(x,z)=>vai(x,z,X('chaoEm')(x,z,X('ground')(x,z)+0.6)),B=X('BICHOS'),FA=X('FAUNA'),RE=X('FAUNA_RENDE'),cria=(t,x,z,o)=>X('criarBicho')(t,x,z,o||{}),limpa=()=>{B.length=0;},"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),"
     "frente=(d)=>[P.x+Math.sin(P.yaw)*d,P.z+Math.cos(P.yaw)*d],est=()=>X('EST_MUNDO')[0];")
s = inicio("X('FAUNA_POP').ativosMax=0;")
# 1) habitats: cada região cria as espécies dela (perto do jogador)
s += [js(F+"X('FAUNA_POP').ativosMax=60;"),
      ev("habitats", F+"const out={},ZF=X('ZONAS_FAUNA');for(const z of ZF){limpa();let c;if(z.rio){c=X('rioPonto')(0.5);c=[c[0]+c[3]*(z.r+20),c[1]-c[2]*(z.r+20)];}else{const l=Math.hypot(z.x,z.z)||1;c=[z.x-z.x/l*(z.r+25),z.z-z.z/l*(z.r+25)];}"
         "vg(c[0],c[1]);for(let k=0;k<4;k++)X('faunaMaterializar')();const daZona=B.filter(b=>b.vivo&&b.zona===z.id);const tem={};for(const b of daZona)tem[b.tipo]=(tem[b.tipo]||0)+1;"
         "out[z.id]={tem,esperado:z.f,especieErrada:daZona.filter(b=>!z.f[b.tipo]).length,foraDaZona:daZona.filter(b=>!X('zonaDentro')(z,b.x,b.z)).length};}"
         "limpa();X('FAUNA_POP').ativosMax=0;return out;")]
# 2) cervo foge quando o jogador chega perto
s += [js(F+"vivo();limpa();G.hora=10;vg(-20,40);P.yaw=0;P.body=0;const b=cria('cervo',-20,54,{yaw:Math.PI});b.st='explora';b.t=30;window.__b=b;"),
      ["gwait", 0.4], js("P.correndo=true;"),
      ["gwait", 2.5], ev("cervo_foge", F+"const b=window.__b;return{st:b.st,d:r2(Math.hypot(b.x-P.x,b.z-P.z)),alerta:r2(b.alerta)};"),
      ["gwait", 3.0], ev("cervo_longe", F+"const b=window.__b;return{st:b.st,d:r2(Math.hypot(b.x-P.x,b.z-P.z))};"), js("P.correndo=false;")]
# 3) matilha à noite ataca o jogador sozinho
s += [js(F+"vivo();limpa();G.hora=23.5;P.vida=100;vg(-60,-80);P.yaw=0;P.body=0;const l=cria('lobo',-60,-64,{yaw:Math.PI});cria('lobo',-62,-63,{lider:l,yaw:Math.PI});cria('lobo',-58,-63,{lider:l,yaw:Math.PI});window.__l=l;"),
      ["gwait", 8.0], ev("lobos_noite", F+"return{vida:r2(P.vida),est:B.filter(b=>b.tipo==='lobo').map(b=>b.st).join(','),perto:B.filter(b=>b.tipo==='lobo'&&Math.hypot(b.x-P.x,b.z-P.z)<4).length};"),
      js(F+"vivo();P.vida=100;")]
# 4) de dia, a matilha observa e não ataca quem está bem
s += [js(F+"vivo();limpa();G.hora=11;P.vida=100;if(P.lesoes)P.lesoes.sangra=0;vg(-60,-80);const l=cria('lobo',-60,-68,{yaw:Math.PI});cria('lobo',-62,-67,{lider:l,yaw:Math.PI});"),
      ["gwait", 6.0], ev("lobos_dia", F+"return{vida:r2(P.vida),est:B.filter(b=>b.tipo==='lobo').map(b=>b.st).join(',')};")]
# 5) urso: fica em pé quando você chega perto; insiste, ele investe
s += [js(F+"vivo();limpa();G.hora=11;P.vida=100;vg(-100,-84);P.yaw=0;P.body=0;const u=cria('urso',-100,-73,{yaw:Math.PI});u.st='come';u.t=30;window.__u=u;"),
      ["gwait", 2.0], ev("urso_defende", F+"const u=window.__u;return{st:u.st,d:r2(Math.hypot(u.x-P.x,u.z-P.z))};"),
      ["gwait", 4.0], ev("urso_ataca", F+"const u=window.__u;return{st:u.st,vida:r2(P.vida),d:r2(Math.hypot(u.x-P.x,u.z-P.z))};"), js(F+"vivo();P.vida=100;")]
# 6) javali: foge; encurralado e ferido, investe
s += [js(F+"vivo();limpa();G.hora=11;P.vida=100;vg(8,-120);P.yaw=0;P.body=0;const j=cria('javali',8,-116.5,{yaw:Math.PI});j.st='come';j.t=30;window.__j=j;"),
      ["gwait", 0.6], js(F+"X('ferirBicho')(window.__j,15,0,1);"), ["gwait", 3.5],
      ev("javali", F+"const j=window.__j;return{st:j.st,vida:r2(P.vida),inv:j.investidas,hp:r2(j.hp)};"), js(F+"vivo();P.vida=100;")]
# 7) onça à noite: chega por trás (jogador de costas) e dá o bote
s += [js(F+"vivo();limpa();G.hora=0.5;P.vida=100;vg(66,80);P.yaw=0;P.body=0;const o=cria('onca',66,66,{yaw:0});window.__o=o;"),
      ["gwait", 10.0], ev("onca", F+"const o=window.__o;return{st:o.st,vida:r2(P.vida),d:r2(Math.hypot(o.x-P.x,o.z-P.z)),furtivo:!!o.furtivo};"), js(F+"vivo();P.vida=100;G.hora=11;")]
# 8) predador caçando: lobo com fome pega uma ovelha
s += [js(F+"vivo();limpa();G.hora=11;vg(-40,100);const l=cria('lobo',-70,90,{yaw:0});l.fome=999;const o=cria('ovelha',-70,98,{yaw:0});o.st='come';o.t=30;window.__l=l;window.__o=o;"),
      ["gwait", 9.0], ev("predador", F+"const l=window.__l,o=window.__o;return{lobo:l.st,ovelhaViva:o.vivo,comida:!!(o.carc&&o.carc.comido),carne:o.carc?o.carc.rest.carneCrua:null,fome:r2(l.fome)};")]
# 9) colisões: bichos correndo pela clareira não entram nas barricadas, árvores e pedras
s += [js(F+"vivo();limpa();G.hora=11;vg(0,30);window.__amostras=0;window.__dentro=0;for(let k=0;k<8;k++){const a=k/8*6.283;const b=cria(['cervo','javali','vaca','cabra'][k%4],Math.cos(a)*16,Math.sin(a)*16,{});b.st='foge';b.t=30;b.fogeDe={x:Math.cos(a)*40,z:Math.sin(a)*40};}"
         "window.__cadaPasso=()=>{for(const b of B){if(!b.vivo)continue;window.__amostras++;if(X('pointBlocked')(b.x,b.z,FA[b.tipo].r*b.ch.s*0.45))window.__dentro++;}};"),
      ["gwait", 8.0], ev("colisoes", F+"window.__cadaPasso=null;return{amostras:window.__amostras,dentro:window.__dentro,presos:B.filter(b=>(b.travou||0)>3).length};")]
# 10) rendimento de cada espécie (faca na mochila, mochila de expedição vestida)
s += [js(F+"vivo();limpa();vazio();P.roupa.costas='mochilaExpedicao';P.roupaInfo={};add('faca',1);vg(0,30);"),
      ev("rendimento", F+"const out={};for(const t of Object.keys(FA)){vazio();add('faca',1);const b=cria(t,P.x+1,P.z+1,{});X('ferirBicho')(b,9999,0,0);"
         "X('esfolar')(b);const got={};for(const s of P.inv)if(s&&s.id!=='faca')got[s.id]=(got[s.id]||0)+s.n;const ord=o=>JSON.stringify(Object.fromEntries(Object.entries(o).sort()));out[t]={ok:ord(got)===ord(RE[t]),got,q:b.carc.q,vazia:b.carc.vazia};"
         "const antes=JSON.stringify(got);X('esfolar')(b);const got2={};for(const s of P.inv)if(s&&s.id!=='faca')got2[s.id]=(got2[s.id]||0)+s.n;out[t].segunda=JSON.stringify(got2)===antes;}return out;")]
# 11) inventário cheio: o que não coube fica na carcaça; depois de liberar espaço, sai o resto
s += [js(F+"vivo();limpa();vazio();P.roupa.costas=null;add('faca',1);const lim=X('invLimite')();for(let i=0;i<lim;i++)if(!P.inv[i])P.inv[i]={id:'pedra',n:1};"),
      ev("cheio", F+"const b=cria('vaca',P.x+1,P.z+1,{});X('ferirBicho')(b,9999,0,0);window.__v=b;X('esfolar')(b);return{resto:JSON.stringify(b.carc.rest),vazia:b.carc.vazia,livre:X('invSpace')()};"),
      js(F+"for(let i=0;i<P.inv.length;i++)if(P.inv[i]&&P.inv[i].id==='pedra')P.inv[i]=null;P.roupa.costas='mochilaExpedicao';X('esfolar')(window.__v);"),
      ev("cheio_depois", F+"const b=window.__v,got={};for(const s of P.inv)if(s&&s.id!=='faca'&&s.id!=='pedra')got[s.id]=(got[s.id]||0)+s.n;return{resto:JSON.stringify(b.carc.rest),vazia:b.carc.vazia,got};")]
# 12) curtimento na estação do curtume da fazenda (gordura e sal; tempo de jogo; qualidade mantida)
s += [js(F+"vivo();limpa();vazio();P.roupa.costas='mochilaExpedicao';const e=est();vg(e.x+1.6,e.z+0.8);add('couro',2,{q:2});add('couroGrande',1,{q:1});add('gordura',2);add('sal',1);X('abrirEstacao')(e);"
         "const U=X('ESTACAO_UI').couro;window.__m=[U.acao(e,'curtir:couro'),U.acao(e,'curtir:couro'),U.acao(e,'curtir:couroGrande')];X('estRender')();"),
      ev("curtindo", F+"const e=est();return{msgs:window.__m,varal:e.ext.curt.map(c=>c.id+':'+c.q+':'+Math.round(c.fim-G.tm)),gordura:X('invCount')('gordura'),sal:X('invCount')('sal'),couro:X('invCount')('couro'),tela:!document.getElementById('t-estacao').hidden,txt:document.getElementById('es-corpo').textContent.slice(0,160)};"),
      js(F+"G.tm+=7*60;const e=est();window.__r=X('ESTACAO_UI').couro.acao(e,'recolher');X('fecharEstacao')();"),
      ev("curtido", F+"const L=P.inv.filter(s=>s&&/Curtido$/.test(s.id)).map(s=>s.id+':'+s.n+':q'+s.q);return{msg:window.__r,itens:L,varal:est().ext.curt.length};")]
# 13) receita da jaqueta: consome o certo, sai com a qualidade do couro; vestir, atributos, tirar
s += [js(F+"vivo();vazio();add('couroCurtido',3,{q:2});add('linha',2);add('pano',1);"),
      ev("receita", F+"const R=X('RECIPES'),i=R.findIndex(r=>r.faz==='camisaCouro');const pode=X('podeFabricar')(R[i]);const ok=X('fabricar')(i);const j=P.inv.find(s=>s&&s.id==='camisaCouro');"
         "return{pode,ok,couro:X('invCount')('couroCurtido'),linha:X('invCount')('linha'),pano:X('invCount')('pano'),jaqueta:j?{q:j.q,dur:j.dur,max:X('durMaxDe')(j)}:null};"),
      ev("vestir", F+"const p0=X('protecao')(),c0=X('calorRoupa')(),ch0=X('chuvaRoupa')();const i=P.inv.findIndex(s=>s&&s.id==='camisaCouro');X('vestir')(i);"
         "const p1=X('protecao')(),c1=X('calorRoupa')(),ch1=X('chuvaRoupa')();return{vaga:P.roupa.tronco,info:JSON.stringify(P.roupaInfo.tronco),prot:[r2(p0),r2(p1)],calor:[r2(c0),r2(c1)],chuva:[r2(ch0),r2(ch1)]};"),
      ev("desgaste", F+"P.vida=100;for(let k=0;k<40;k++)X('roupaDesgasta')('tronco',4);const I=P.roupaInfo.tronco,p=X('protecao')();X('roupaDesgasta')('tronco',999);const p2=X('protecao')();return{dur:I.dur,protMeio:r2(p),protRasgada:r2(p2),efeito:r2(X('roupaEf')('tronco'))};"),
      ev("conserto", F+"add('agulhaOsso',1);add('remendo',4);add('linha',3);const I=P.roupaInfo.tronco;I.dur=Math.round(X('durMaxDe')(I)*0.5);const r0=X('invCount')('remendo'),l0=X('invCount')('linha');"
         "vg(0,30);const ok=X('consertarRoupa')('tronco');return{ok,remendo:r0-X('invCount')('remendo'),linha:l0-X('invCount')('linha'),dur:I.dur,max:X('durMaxDe')(I),rep:I.rep,agulha:(P.inv.find(s=>s&&s.id==='agulhaOsso')||{}).dur};"),
      ev("tirar", F+"const ok=X('tirarRoupa')('tronco');const j=P.inv.find(s=>s&&s.id==='camisaCouro');return{ok,vaga:P.roupa.tronco,jaqueta:j?{q:j.q,dur:j.dur,rep:j.rep}:null,prot:r2(X('protecao')())};")]
# 14) mochilas: capacidade por dados; troca para mochila menor recusada com itens além do limite
s += [js(F+"vivo();vazio();P.roupa.costas=null;P.roupa.pernas=null;P.roupa.cintura=null;P.roupaInfo={};add('mochilaPequena',1);add('mochila',1);add('mochilaExpedicao',1);"),
      ev("mochilas", F+"const L=[X('invLimite')()];let i=P.inv.findIndex(s=>s&&s.id==='mochilaPequena');X('vestir')(i);L.push(X('invLimite')());i=P.inv.findIndex(s=>s&&s.id==='mochilaExpedicao');X('vestir')(i);L.push(X('invLimite')());"
         "for(let k=35;k<44;k++)P.inv[k]={id:'pedra',n:1};i=P.inv.findIndex(s=>s&&s.id==='mochila');X('vestir')(i);const recusou=P.roupa.costas==='mochilaExpedicao';for(let k=35;k<44;k++)P.inv[k]=null;"
         "X('vestir')(P.inv.findIndex(s=>s&&s.id==='mochila'));L.push(X('invLimite')());const pequenas=P.inv.filter(s=>s&&/^mochila/.test(s.id)).map(s=>s.id).join(',');"
         "add('calcaCargo',1);X('vestir')(P.inv.findIndex(s=>s&&s.id==='calcaCargo'));L.push(X('invLimite')());return{limites:L,recusou,vestida:P.roupa.costas,naMochila:pequenas};")]
# 15) laço: coelho que passa fica preso
s += [js(F+"vivo();limpa();vazio();P.roupa.costas='mochila';add('laco',1);vg(-30,30);P.yaw=0;P.body=0;const i=P.inv.findIndex(s=>s&&s.id==='laco');X('armarLaco')(i);const t=X('TRAPS')[0];const c=cria('coelho',t.x,t.z-3,{yaw:0});c.st='explora';c.vAlvo=1;c.rx=0;c.rz=1;c.t=20;window.__c=c;"),
      ["gwait", 4.0], ev("laco", F+"const t=X('TRAPS')[0],c=window.__c;return{armado:t.armado,pego:t.pego,coelhoVivo:c.vivo,d:r2(Math.hypot(c.x-t.x,c.z-t.z))};")]
# 16) salvar e carregar: roupas vestidas (estado, qualidade), carcaça com o resto, varal, população
s += [js(F+"vivo();limpa();vazio();P.roupa.costas='mochila';P.roupaInfo={};add('camisaCouro',1,{q:3,dur:120,rep:1});X('vestir')(P.inv.findIndex(s=>s&&s.id==='camisaCouro'));add('couroCurtido',2,{q:2});"
         "const b=cria('cervo',P.x+2,P.z+1,{});X('ferirBicho')(b,9999,0,0);b.carc.rest.couro=1;window.__id=b.carc.id;const e=est();e.ext.curt=[{id:'couro',q:1,ini:G.tm,fim:G.tm+100}];"
         "G.fauna.z.serra.lobo.n=1;X('salvarJogo')();X('carregarJogo')();G.modo='jogo';"),
      ev("carregado", F+"const c=B.find(b=>!b.vivo&&b.carc&&b.carc.id===window.__id);return{tronco:P.roupa.tronco,info:JSON.stringify(P.roupaInfo.tronco),couro:P.inv.filter(s=>s&&s.id==='couroCurtido').map(s=>s.n+':q'+s.q).join(','),"
         "carcaca:c?JSON.stringify(c.carc.rest):null,varal:JSON.stringify(est().ext.curt),loboSerra:G.fauna.z.serra.lobo.n};")]
# 17) desempenho: tempo do updateBichos com 34 bichos ativos
s += [js(F+"vivo();limpa();vg(0,40);X('FAUNA_POP').ativosMax=34;for(let k=0;k<6;k++)X('faunaMaterializar')();"),
      ev("desempenho", F+"const qn=B.filter(b=>b.vivo).length,t0=performance.now();for(let i=0;i<300;i++)X('updateBichos')(1/60);const ms=(performance.now()-t0)/300;return{ativos:qn,msPorPasso:r2(ms)};")]
salvar('p96.json', s)

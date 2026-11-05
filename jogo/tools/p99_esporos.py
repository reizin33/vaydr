"""p99: mata hostil (bulbo, trepadeira, espinheiro), esporos no pulmão, máscara, cortar e queimar, espalhar a cada manhã, obras largadas,
zumbis esporados, receitas, capítulo 5 (queimar o núcleo e colher a cepa), finais, salvar/carregar e fotos."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const PL=X('ESP_PL'),E=()=>X('espD')(),IK=X('INTER_K'),IN=X('IN'),YS=X('Y_SUB'),gr=(x,z)=>X('ground')(x,z),"
     "vazio=()=>{for(let i=0;i<P.inv.length;i++)P.inv[i]=null;},add=(id,q,ex)=>X('invAdd')(id,q,ex),"
     "acha=(t,e)=>PL.find(p=>p.t===t&&p.e===(e??2)),limpaZ=()=>{Z.length=0;},"
     "roupa=(slot,id)=>{P.roupa[slot]=id;if(P.roupaInfo)delete P.roupaInfo[slot];};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("plantas", F+"const por={},tipos={},fase=[0,0,0];let agua=0,cidade=0;for(const p of PL){por[p.f]=(por[p.f]||0)+1;tipos[p.t]=(tipos[p.t]||0)+1;fase[p.e]++;"
         "const n=X('aguaNivel')(p.x,p.z);if(n!==null&&n>gr(p.x,p.z)-0.15)agua++;if(X('dentroCidade')(p.x,p.z,1))cidade++;}"
         "return{total:PL.length,porFoco:por,tipos,fases:fase,naAgua:agua,naCidade:cidade};")]
# ---------- esporos: sem máscara, com bandana, com máscara de gás; baixa longe ----------
s += [js(F+"vivo();vazio();limpaZ();P.esporo=0;roupa('rosto',null);const p=acha('bulbo');window.__b=p;vai(p.x+0.9,p.z+0.3);"), ["gwait", 5],
      ev("semMascara", F+"return{esporo:r2(P.esporo),intens:r2(X('espIntensidade')(P.x,P.y,P.z)),chip:!document.getElementById('vx-esporo').hidden,chipTxt:document.querySelector('#vx-esporo b').textContent};"),
      js(F+"P.esporo=0;roupa('rosto','bandana');"), ["gwait", 5], ev("bandana", F+"return{esporo:r2(P.esporo),prot:r2(X('espProtecao')())};"),
      js(F+"P.esporo=0;roupa('rosto','mascaraGas');"), ["gwait", 5], ev("mascaraGas", F+"return{esporo:r2(P.esporo),prot:r2(X('espProtecao')())};"),
      js(F+"roupa('rosto',null);P.esporo=50;vai(window.__b.x+30,window.__b.z+30);"), ["gwait", 10], ev("baixa", F+"return{esporo:r2(P.esporo)};")]
# ---------- efeitos: tosse, vista turva, vida caindo ----------
s += [js(F+"P.esporo=90;P.vida=100;window.__v0=P.vida;"), ["gwait", 3],
      ev("efeitos", F+"const t=document.getElementById('esporo-tela');return{vidaAntes:window.__v0,vida:r2(P.vida),turva:!t.hidden,opac:t.style.opacity,alto:document.getElementById('vx-esporo').classList.contains('alto')};"),
      js(F+"P.esporo=0;P.vida=100;")]
# ---------- trepadeira prende, espinheiro corta ----------
s += [js(F+"const p=acha('trepadeira');vai(p.x,p.z);P.yaw=P.body=0;IN.mz=1;"), ["gwait", 0.4], ev("trepadeira", F+"return{lento:P.lentoMata};"), js(F+"IN.mz=0;"),
      js(F+"const p=acha('espinheiro');vai(p.x+0.2,p.z);P.vida=100;IN.mz=1;P.yaw=P.body=Math.PI;"), ["gwait", 1.2], js(F+"IN.mz=0;"),
      ev("espinheiro", F+"return{vida:r2(P.vida)};"), js(F+"P.vida=100;")]
# ---------- cortar com machado e queimar com molotov ----------
s += [js(F+"vazio();add('machado',1);sel('machado');const p=acha('bulbo');window.__alvo=p;vai(p.x,p.z+1.3);mira(p.x,gr(p.x,p.z)+0.6,p.z);window.__n0=PL.length;window.__hp0=p.hp;"
         "X('golpeAcerta')({arma:P.inv[P.sel],vertical:true});window.__hp1=p.hp;for(let k=0;k<4&&PL.includes(p);k++)X('golpeAcerta')({arma:P.inv[P.sel],vertical:true});"),
      ev("cortar", F+"return{hpAntes:window.__hp0,hpDepois1:r2(window.__hp1),morreu:!PL.includes(window.__alvo),bulboSeco:conta('bulboSeco'),fibra:conta('fibraHostil'),cortadas:E().cortadas};"),
      js(F+"const p=acha('espinheiro')||acha('trepadeira');window.__alvoF=p;window.__fibra0=conta('fibraHostil');X('CHAMAS').push({x:p.x,y:gr(p.x,p.z),z:p.z,r:1.6,t:0,dur:6,rr:0});"), ["gwait", 3],
      ev("queimar", F+"return{morreu:!PL.includes(window.__alvoF),fibraIgual:conta('fibraHostil')===window.__fibra0,queimadas:E().queimadas};")]
# ---------- receitas ----------
s += [js(F+"vazio();add('fibraHostil',3);add('bulboSeco',2);add('agua',2);add('pano',2);add('carvao',2);add('linha',1);vai(X('FIRE')[0]+20,X('FIRE')[2]);"),
      ev("receitas", F+"const R=X('RECIPES'),rc=R.find(r=>r.faz==='corda'&&r.custo.fibraHostil),rm=R.find(r=>r.faz==='mascaraPano'),rt=R.find(r=>r.faz==='chaBulbo');"
         "const longe=X('estacaoOk')(rt);X('fabricar')(R.indexOf(rc));const mLonge=X('podeFabricar')(rm);{const b=X('INTER').find(i=>i.id==='bancada');vai(b.x,b.z);}X('fabricar')(R.indexOf(rm));vai(X('FIRE')[0]+2,X('FIRE')[2]+1);const perto=X('estacaoOk')(rt);X('fabricar')(R.indexOf(rt));"
         "return{corda:conta('corda'),mascara:conta('mascaraPano'),mascaraLongeBancada:mLonge,cha:conta('chaBulbo'),chaLongeFogo:longe,chaPertoFogo:perto};"),
      js(F+"P.esporo=60;const i=P.inv.findIndex(q=>q&&q.id==='chaBulbo');X('usarItem')(i);"), ev("cha", F+"return{esporo:r2(P.esporo)};"), js(F+"P.esporo=0;")]
# ---------- espalhar a cada manhã; obras largadas ----------
s += [js(F+"vivo();const n0=PL.length,f0=PL.filter(p=>p.e===2).length;window.__n0=n0;window.__f0=f0;const o=X('criarObra')('barricada',30,40,0);o.ext.visto=G.dia-5;window.__ob=o;window.__ohp=o.hp;"
         "vai(-120,100);for(let k=0;k<4;k++){X('espAmanhece')();}"),
      ev("espalhar", F+"const o=window.__ob,pl=PL.find(p=>p.obra===o.id);const por={};for(const p of PL)por[p.f]=(por[p.f]||0)+1;"
         "return{antes:window.__n0,depois:PL.length,adultasAntes:window.__f0,adultas:PL.filter(p=>p.e===2).length,max:X('ESP').max,porFoco:por,obraTomada:!!pl,obraHpAntes:window.__ohp,obraHp:o.hp,obraMin:o.hpMax*0.5};")]
# ---------- zumbis esporados ----------
s += [js(F+"limpaZ();const p=acha('bulbo');const q=ZZ('walker',p.x+3,p.z+2);window.__z=q;window.__zhp=q.hp;"), ["gwait", 1.6],
      ev("esporado", F+"const q=window.__z;return{esporado:!!q.esporado,hpAntes:r2(window.__zhp),hp:r2(q.hp),tint:q.tint};"), js(F+"limpaZ();")]
# ---------- fotos da mata ----------
s += foto("390_mata_torre.png", F+"vivo();G.hora=10;const p=acha('bulbo');vai(p.x+7,p.z+7);G.camFix={pos:[p.x+5.5,gr(p.x,p.z)+2.4,p.z+5.5],tgt:[p.x,gr(p.x,p.z)+0.6,p.z]};", 0.5)
s += foto("391_trepadeira_espinheiro.png", F+"const p=acha('espinheiro')||acha('trepadeira');vai(p.x+6,p.z+6);G.camFix={pos:[p.x+3.2,gr(p.x,p.z)+1.8,p.z+3.2],tgt:[p.x,gr(p.x,p.z)+0.3,p.z]};", 0.5)
s += foto("392_vila_tomada.png", F+"const f=X('ESP').focos.find(f=>f.id==='vila');vai(f.x+20,f.z+20);G.camFix={pos:[f.x+16,gr(f.x+16,f.z+16)+7,f.z+16],tgt:[f.x,gr(f.x,f.z)+0.5,f.z]};", 0.5)
s += [js("G.camFix=null;"), js(F+"const p=acha('bulbo');vai(p.x+1.2,p.z+0.6);P.esporo=82;mira(p.x,gr(p.x,p.z)+0.8,p.z);n.cfg.cam='1';"), ["gwait", 1.5]]
s += foto("393_nuvem_esporos.png", F+"P.esporo=82;", 0.2)
s += [js(F+"n.cfg.cam='3';P.esporo=0;")]
# ---------- capítulo 5 começa depois da vacina ----------
s += [js(F+"vivo();G.m.etapa=4;G.m.fim=true;G.hist.cap=4;G.hist.fim2=true;E().cap5.espera=0;vai(-60,20);"), ["gwait", 45],
      ev("cap5inicio", F+"const C=E().cap5,mi=X('missaoInfo')();return{ativo:C.ativo,missao:mi.n,texto:mi.t};"),
      js(F+"const S=X('subD')();S.visitou.bunker=true;"), ev("cap5passo2", F+"return X('missaoInfo')().t;"),
      js(F+"const S=X('subD')();S.docs.ordem77=true;"), ev("cap5passo3", F+"return X('missaoInfo')().t;")]
# ---------- núcleo: queimar ----------
s += [js(F+"vazio();limpaZ();roupa('rosto','mascaraGas');vai(-36,-119.2,YS);P.yaw=P.body=Math.PI;const S=X('subD')();S.salaVista[X('SUB').salas.find(q=>q.nome==='Núcleo do Projeto Esporo').id]=true;"), ["gwait", 0.4],
      ev("nucleoSem", F+"const a=X('interAtual')();return{alvo:a&&a.k,texto:a&&IK[a.k].texto(a.o).t,s:a&&IK[a.k].texto(a.o).s,missao:X('missaoInfo')().t,intens:r2(X('espIntensidade')(P.x,P.y,P.z))};"),
      js(F+"add('gasolina',2);add('isqueiro',1);IK.nucleoQ.usar(null,true);"), ["gwait", 1],
      ev("queimou", F+"const D=E(),lab=X('SUB').salas.filter(s=>s.c.id==='lab');return{nucleo:D.nucleo,fogo:!!D.fogoLab,gasolina:conta('gasolina'),esporosLab:lab.map(s=>s.esporos).join(','),chamas:X('CHAMAS').length,missao:X('missaoInfo')().t};"),
      js(F+"roupa('rosto',null);"), ["gwait", 40],
      ev("fumaca", F+"return{fumaca:r2(P.fumaca||0),vida:r2(P.vida),tempo:r2(E().fogoLab.t)};"),
      js(F+"P.vida=100;const e=X('SUB').entradas.find(q=>q.id==='torre');vai(e.sub[0],e.sub[1],YS);X('subD')().abertas.ent_torre=true;IK.saidaSub.usar(e);"), ["wait", 1.5], ["gwait", 3], ["wait", 1],
      ev("finalQueimado", F+"const t=document.getElementById('t-fim');return{modo:G.modo,tela:!t.hidden,titulo:t.querySelector('h2').textContent,texto:document.getElementById('fim-t').textContent,stats:document.querySelectorAll('#fim-stats div').length,fim:E().cap5.fim,conquista:!!X('CQ').f.mataQueimada};"),
      js("window.__semRender=false;window.__turbo=1;"), ["wait", 1.2], ["shot", "394_final_queimado.png"], js("window.__semRender=true;window.__turbo=6;"),
      js(F+"document.getElementById('fim-ok').click();const n0=PL.length;window.__pn=n0;window.__pe=PL.reduce((a,p)=>a+p.e,0);X('espAmanhece')();"),
      ev("secando", F+"return{antes:window.__pn,depois:PL.length,somaFasesAntes:window.__pe,somaFases:PL.reduce((a,p)=>a+p.e,0),intens:X('espIntensidade')(PL[0]?PL[0].x:0,0,PL[0]?PL[0].z:0),modo:G.modo,missao:X('missaoInfo')().n};")]
# ---------- outro caminho: colher a cepa, centrífuga, soro ----------
s += [js(F+"G.esp=X('espNovo')();X('espSemear')();for(const s of X('SUB').salas)s.esporos=s.esporos0;E().cap5.ativo=true;vazio();limpaZ();roupa('rosto','mascaraGas');vai(-38.6,-122,YS);P.yaw=P.body=Math.PI/2;"), ["gwait", 0.3],
      js(F+"add('garrafa',1);IK.nucleoC.usar(null,true);"),
      ev("colheu", F+"return{nucleo:E().nucleo,cepa:conta('cepa'),garrafa:conta('garrafa'),missao:X('missaoInfo')().t};"),
      js(F+"const B=X('BASEM'),g=X('geradorBaseObra')();g.ext.comb=1;g.hp=g.hpMax;vai(B.x+4.2,B.z+8.2);P.yaw=P.body=0;"), ["gwait", 0.3],
      ev("centrifAlvo", F+"const a=X('interAtual')();return{alvo:a&&a.k,texto:a&&IK[a.k].texto(a.o).t};"),
      js(F+"IK.centrifCepa.usar(E());for(const f of X('AMANHECE'))if(f.toString().indexOf('centrif')>=0)f();"),
      ev("centrifuga", F+"const cf=E().cap5.centrif;return{rodando:!!cf,pronta:cf&&cf.pronta,cepa:conta('cepa'),missao:X('missaoInfo')().t};"),
      js(F+"IK.centrifCepa.usar(E());const i=P.inv.findIndex(q=>q&&q.id==='soroEsporo');window.__soros=conta('soroEsporo');X('usarItem')(i);"), ["wait", 3.5],
      ev("soro", F+"const t=document.getElementById('t-fim');return{soros:window.__soros,soro:E().soro,titulo:t.querySelector('h2').textContent,tela:!t.hidden,conquista:!!X('CQ').f.cepaSoro};"),
      js("window.__semRender=false;window.__turbo=1;"), ["wait", 1.2], ["shot", "395_final_cepa.png"], js("window.__semRender=true;window.__turbo=6;"),
      js(F+"document.getElementById('fim-ok').click();roupa('rosto',null);P.esporo=0;const p=acha('bulbo');vai(p.x+0.9,p.z+0.3);"), ["gwait", 5],
      ev("imune", F+"return{esporo:r2(P.esporo)};")]
# ---------- salvar e carregar ----------
s += [js(F+"window.__salvo={n:PL.length,soro:E().soro,nucleo:E().nucleo,fases:PL.map(p=>p.e).join('')};X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("carregar", F+"return{antes:window.__salvo,n:PL.length,soro:E().soro,nucleo:E().nucleo,fasesIguais:PL.map(p=>p.e).join('')===window.__salvo.fases};")]
salvar('p99.json', s)

"""p172: Etapa 13 (água e automação). Aba Água no menu B; bomba só ao lado do poço; canos ponta com ponta (a ponta gruda na bomba
e no cano anterior); rede ligada (poço, bomba, canos, caixa, fervedor, barril, irrigador); com o gerador a água vai sozinha do poço,
pela fervura, até o barril (gasta gasolina e lenha; o poço baixa e enche de novo); sem gerador não bombeia, à mão sim; irrigação
faz a horta crescer mais rápido que uma horta sem água; filtro limpa e gasta o carvão, troca do carvão; painéis (balde, encher
garrafas de água limpa, beber, despejar); peça muito quebrada trabalha pela metade; cano tirado corta a rede; manual."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const OB=()=>X('OB'),cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),inv=(id,n)=>X('invAdd')(id,n),PS=nome=>X('PASSOS').find(f=>f.name===nome),"
     "cano=(x,z,yaw)=>{const r=X('alvoCano')(x,z,yaw);if(!r.ok)return{erro:r.motivo,r};return cria('cano',r.x,r.z,r.yaw,r.y,r.ext);},"
     "rede=o=>X('redeDe')(o),passo=m=>{const n=Math.ceil(m/5);for(let i=0;i<n;i++){G.tm+=m/n;X('aguaPasso')(m/n);}},W=window;")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;G.chuva=0;"
        "const x=F[0]+14,z=F[2]+24;W.__x=x;W.__z=z;vai(x-3,z);")]
s += [e("abaAgua", "const c=X('OBRA_CATS').find(q=>q.id==='agua'),pl=X('OBRA_CATS').find(q=>q.id==='plantio');return{tab:c&&c.nome,pecas:c&&c.t,plantioTemColetor:pl&&pl.t.includes('coletor')};")]
# poço, bomba (só do lado), gerador
s += [j("const x=W.__x,z=W.__z;W.__poco=cria('poco',x,z,0);W.__longe=X('alvoBomba')(x+9,z+9,0);const r=X('alvoBomba')(x+1.4,z+0.2,0);W.__ab=r;W.__bomba=cria('bombaAgua',r.x,r.z,r.yaw,r.y);"
        "W.__ger=cria('gerador',x+4,z+4.5,0);W.__ger.ext.comb=1;W.__ger.ext.ligado=true;"),
      e("bomba", "const r=W.__ab,p=W.__poco;return{longe:{ok:W.__longe.ok,motivo:W.__longe.motivo},ok:r.ok,dist:r2(Math.hypot(r.x-p.x,r.z-p.z)),poco:p.ext.agua,ligadaA:X('pocoDaBomba')(W.__bomba)===p,ger:!!X('geradorPerto')(W.__bomba)};")]
# canos ponta com ponta até o fervedor; do fervedor ao barril; caixa d'água no meio; irrigador na horta
s += [j("const b=W.__bomba;const c1=cano(b.x+0.7,b.z,Math.PI/2);W.__c1=c1;const c2=cano(c1.ext.b[0]+0.2,c1.ext.b[1],Math.PI/2);W.__c2=c2;"
        "const fx=c2.ext.b[0]+0.62+0.25,fz=c2.ext.b[1];W.__ferv=cria('fervedor',fx,fz,0);const c3=cano(fx+0.9,fz,Math.PI/2);W.__c3=c3;"
        "W.__barril=cria('barrilAgua',c3.ext.b[0]+0.42+0.25,c3.ext.b[1],0);const c4=cano(fx,fz-0.9,Math.PI);W.__c4=c4;W.__caixa=cria('caixaAgua',c4.ext.b[0],c4.ext.b[1]-0.9-0.25,0);"
        "const c5=cano(W.__caixa.x-1.2,W.__caixa.z,-Math.PI/2);W.__c5=c5;W.__irr=cria('irrigador',c5.ext.b[0]-0.3,c5.ext.b[1],0);W.__horta=cria('horta',W.__irr.x-1.6,W.__irr.z+0.4,0);W.__horta.ext.cresce=0.2;"
        "W.__horta2=cria('horta',W.__x-12,W.__z+14,0);W.__horta2.ext.cresce=0.2;"),
      e("canos", "const P1=W.__c1,P2=W.__c2,b=W.__bomba;return{c1:!P1.erro,c2:!P2.erro,c3:!W.__c3.erro,c4:!W.__c4.erro,c5:!W.__c5.erro,c1a_bomba:r2(Math.hypot(P1.ext.a[0]-b.x,P1.ext.a[1]-b.z)),"
        "pontaComPonta:r2(Math.hypot(P2.ext.a[0]-P1.ext.b[0],P2.ext.a[1]-P1.ext.b[1])),comp:r2(Math.hypot(P1.ext.b[0]-P1.ext.a[0],P1.ext.b[1]-P1.ext.a[1])),erros:[P1.erro,P2.erro,W.__c3.erro,W.__c4.erro,W.__c5.erro].filter(Boolean)};"),
      e("rede", "X('aguaSujo=true');const R=rede(W.__poco),t=R.map(o=>o.tipo).sort();return{n:R.length,tipos:t,barrilNaRede:R.includes(W.__barril),irrNaRede:R.includes(W.__irr),hortaFora:!R.includes(W.__horta)};")]
# automação: poço → bomba (gerador) → fervedor → barril
s += [j("W.__ferv.ext.comb=60;W.__p0=W.__poco.ext.agua;W.__g0=W.__ger.ext.comb;passo(30);W.__a1={poco:W.__poco.ext.agua,fA:W.__ferv.ext.agua,fL:W.__ferv.ext.limpa,barril:W.__barril.ext.limpa,caixa:W.__caixa.ext.agua,comb:W.__ferv.ext.comb,ger:W.__ger.ext.comb,ligada:W.__bomba.ligada,rega:W.__irr.regaAte>=G.tm};"
        "passo(60);W.__a2={poco:W.__poco.ext.agua,barril:W.__barril.ext.limpa,caixa:W.__caixa.ext.agua,comb:W.__ferv.ext.comb};"),
      e("automatica", "const r=o=>{const q={};for(const k in o)q[k]=typeof o[k]==='number'?r2(o[k]):o[k];return q;};return{poco0:r2(W.__p0),ger0:W.__g0,depois30:r(W.__a1),depois90:r(W.__a2)};"),
      # sem lenha: o fervedor para; sem gerador: não bombeia; à mão bombeia
      j("W.__ferv.ext.comb=0;const b0=W.__barril.ext.limpa;passo(30);W.__semLenha={antes:b0,depois:W.__barril.ext.limpa};W.__ger.ext.ligado=false;const p0=W.__poco.ext.agua,c0=W.__caixa.ext.agua;passo(1);"
        "W.__semGer={ligada:W.__bomba.ligada,poco:r2(W.__poco.ext.agua-p0),caixa:r2(W.__caixa.ext.agua-c0)};"
        "X('abrirEstacao')(W.__bomba);const en=P.energia;X('estAcao')('bombear');W.__mao={pend:W.__bomba.ext.pend,energia:r2(en-P.energia),msg:document.getElementById('es-msg').textContent};X('fecharEstacao')();"
        "const c1=W.__caixa.ext.agua;passo(1);W.__mao.caixa=r2(W.__caixa.ext.agua-c1);W.__mao.pend2=W.__bomba.ext.pend;"),
      e("semEnergia", "return{semLenha:W.__semLenha,semGerador:W.__semGer,aMao:W.__mao};")]
# irrigação: horta regada cresce mais que a sem água
s += [j("W.__horta.ext.cresce=0.2;W.__horta2.ext.cresce=0.2;W.__ger.ext.ligado=true;W.__ger.ext.comb=1;W.__irr.regaAte=0;passo(2);W.__regando=W.__irr.regaAte>=G.tm;"
        "const f=PS('aguaIrriga'),g=PS('plantioCresce');for(let i=0;i<60;i++){f(1);}W.__h1=W.__horta.ext.cresce;W.__h2=W.__horta2.ext.cresce;"),
      e("irrigacao", "return{regando:W.__regando,regada:r2(W.__h1),semAgua:r2(W.__h2),alvos:W.__irr.alvos};")]
# painéis: balde, barril (encher, beber), despejar na caixa
s += [j("inv('garrafa',4);X('abrirEstacao')(W.__poco);X('estAcao')('balde');W.__balde={suja:conta('aguaSuja'),garrafa:conta('garrafa')};X('fecharEstacao')();"
        "W.__barril.ext.limpa=20;inv('garrafa',3);X('abrirEstacao')(W.__barril);const r=X('ESTACAO_UI').barrilAgua.render(W.__barril);X('estAcao')('encher');P.sede=40;X('estAcao')('beber');"
        "W.__barrilUI={acoes:r.acoes.map(a=>a.id+':'+(a.ok!==false)),limpa:conta('agua'),barril:r2(W.__barril.ext.limpa),sede:P.sede,resumo:X('ESTACAO_UI').barrilAgua.resumo(W.__barril),texto:X('INTER_K').estacao.texto(W.__barril).t};X('fecharEstacao')();"
        "const c0=W.__caixa.ext.agua;X('abrirEstacao')(W.__caixa);X('estAcao')('despejar');W.__desp={caixa:r2(W.__caixa.ext.agua-c0),suja:conta('aguaSuja')};X('fecharEstacao')();"),
      e("paineis", "return{balde:W.__balde,barril:W.__barrilUI,despejar:W.__desp};")]
# filtro em outra rede: caixa cheia → filtro → barril; carvão gasta e troca
s += [j("const x=W.__x-8,z=W.__z-8;const cx=cria('caixaAgua',x,z,0);cx.ext.agua=200;const c=cano(x+1.2,z,Math.PI/2);const fi=cria('filtroAgua',c.ext.b[0]+0.45+0.25,c.ext.b[1],0);const c2=cano(fi.x+0.75,fi.z,Math.PI/2);"
        "const br=cria('barrilAgua',c2.ext.b[0]+0.42+0.25,c2.ext.b[1],0);W.__fi=fi;W.__br2=br;W.__cx2=cx;X('aguaSujo=true');passo(120);W.__f1={barril:br.ext.limpa,vida:fi.ext.vida,caixa:cx.ext.agua};"
        "fi.ext.vida=1;passo(60);W.__f2={vida:fi.ext.vida,barril:br.ext.limpa};inv('carvao',2);inv('pano',1);X('abrirEstacao')(fi);X('estAcao')('trocar');W.__f2.trocou=fi.ext.vida;W.__f2.carvao=conta('carvao');X('fecharEstacao')();"),
      e("filtro", "const r=o=>{const q={};for(const k in o)q[k]=r2(o[k]);return q;};return{depois2h:r(W.__f1),gasto:r(W.__f2),separada:!rede(W.__fi).includes(W.__poco)};")]
# estado: peça muito quebrada trabalha pela metade; cano tirado corta a rede
s += [j("const fv=W.__ferv;fv.ext.comb=100;fv.ext.agua=30;fv.ext.limpa=0;W.__barril.ext.limpa=0;const k=X('aguaEstado')(fv);fv.hp=fv.hpMax*0.2;const k2=X('aguaEstado')(fv);W.__ger.ext.ligado=false;"
        "X('aguaPasso')(10);W.__quebrado={k,k2,fervida:r2(W.__barril.ext.limpa)};fv.hp=fv.hpMax;"
        "X('destruirObra')(W.__c3);X('aguaSujo=true');W.__corte={barrilNaRede:rede(W.__ferv).includes(W.__barril),poco:rede(W.__ferv).includes(W.__poco)};"),
      e("estado", "return{quebrado:W.__quebrado,corte:W.__corte};")]
# manual
s += [e("manual", "const L=X('mnEntradas')(),A=L.filter(q=>q.sec==='agua');return{n:A.length,nomes:A.map(q=>q.nome),guia:!!L.find(q=>q.id==='x:aguaAuto'),canoObs:(L.find(q=>q.id==='o:cano')||{}).obs};")]
salvar('p172.json', s)

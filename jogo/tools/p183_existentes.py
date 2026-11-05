"""p183: Etapa 17, o que já existia ligado na rede (poste à noite, lamparina, arame eletrificado, fornalha e defumador mais rápidos,
porta de madeira e portões abrindo com energia, armadilha de mandíbula se armando sozinha, barril purificando, poço e bomba d'água,
fervedor sem lenha, filtro mais rápido, antena com oferta a mais) e as defesas automáticas (besta automática com flechas, armadilha
de cartucho, lança-chamas a óleo) e a esteira (baú → baú, com filtro; baú → fornalha; fornalha → baú)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=window.__C,g=(x,z)=>X('ground')(x,z),ob=t=>X('OB').filter(o=>o.tipo===t),E=()=>X('ENER'),"
     "cria=(t,dx,dz,yaw,ext)=>X('criarObra')(t,C[0]+dx,C[1]+dz,yaw||0,undefined,undefined,g(C[0]+dx,C[1]+dz),ext),"
     "W=()=>{X('energiaResolver')(0);X('energiaEfeitos')(0);},st=o=>({energ:!!o.energ}),"
     "fonte=o=>{let gr=X('OB').find(q=>q.tipo==='gerador'&&q.__teste&&X('ENER').fios.filter(f=>f.a===X('eidDe')(q)).length<3&&Math.hypot(q.x-o.x,q.z-o.z)<25);"
     "if(!gr){gr=X('criarObra')('gerador',o.x+1.6,o.z+1.6,0,undefined,undefined,g(o.x+1.6,o.z+1.6));gr.ext.comb=1;gr.ext.ligado=true;gr.__teste=true;}return X('ligarFio')(gr,o,true);},"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "qt=(o,id)=>(o.itens||[]).reduce((s,q)=>s+(q&&q.id===id?q.n:0),0);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__zfix=[];window.__cadaPasso=()=>{for(const z of __nnc.Z){const f=window.__zfix.find(q=>q.z===z);if(f){if(z.vivo&&!(z.presoT>0)){z.x=f.x;z.z=f.zz;}}else z.vivo=false;}P.vida=100;P.fome=100;P.sede=100;};"),
      ev("lugar", "const livre=(x,z,g0)=>Math.abs(X('ground')(x,z)-g0)<3&&!(X('RIO').ok&&X('aguaPerto')(x,z,1.5));let C=null,bl=1e9;"
         "for(let r=18;r<90;r+=4)for(let a=0;a<6.28;a+=0.3){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;if(!X('dentroMapa')(x,z,30))continue;const g0=X('ground')(x,z);let ok=true,nb=0;"
         "for(let i=-12;i<=12&&ok;i+=3)for(let k=-15;k<=15&&ok;k+=3){if(!livre(x+i,z+k,g0))ok=false;else if(X('pointBlocked')(x+i,z+k,0.5))nb++;}if(ok&&nb<bl){bl=nb;C=[x,z];}}window.__C=C;vai(C[0],C[1]+14);return{achou:!!C};"),
      # ---------- o que já existia ----------
      j("const pe={};pe.poste=cria('poste',-10,-10);pe.lamp=cria('lamparina',-7,-10);pe.lamp.ext.apagada=true;X('FIRES').splice(X('FIRES').findIndex(f=>f.obra===pe.lamp),1);"
        "pe.arame=cria('arame',-4,-10);pe.porta=cria('portaMadeira',-1,-10);pe.porta.ext.aberta=false;pe.urso=cria('armadilhaUrso',2,-10);pe.urso.ext.armada=false;"
        "pe.forn=cria('fornalha',-10,-5);pe.forn.ext.proc=[{r:'carvao',ini:G.tm,fim:G.tm+60}];pe.forn2=cria('fornalha',-10,0);pe.forn2.ext.proc=[{r:'carvao',ini:G.tm,fim:G.tm+60}];"
        "pe.defu=cria('defumador',-6,-5);pe.barril=cria('barrilAgua',-2,-5);pe.barril.ext.uv=10;pe.barril.ext.limpa=0;"
        "pe.poco=cria('poco',3,-5);pe.poco.ext.agua=50;pe.poco2=cria('poco',9,-5);pe.poco2.ext.agua=50;pe.bomba=cria('bombaAgua',3+1.4,-5);"
        "pe.ferv=cria('fervedor',7,0);pe.ferv.ext.agua=10;pe.ferv.ext.comb=0;pe.antena=cria('antenaBase',10,-10);pe.portao=cria('portao',-6,6);pe.portaoG=cria('portaoGrande',2,8);pe.filtro=cria('filtroAgua',-2,0);"
        "window.__pe=pe;for(const k of['poste','lamp','arame','porta','urso','forn','defu','barril','poco','bomba','ferv','antena','portao','portaoG','filtro'])window.__r=(window.__r||'')+k+':'+fonte(pe[k])+'|';"),
      e("ligados", "const pe=window.__pe;return{falhas:window.__r.split('|').filter(t=>t&&!t.endsWith(':')),fiados:Object.keys(pe).filter(k=>X('energiaFiado')(pe[k])).sort(),geradores:ob('gerador').length};"),
      ["gwait", 2.0],
      e("deDia", "const pe=window.__pe;return{poste:{aceso:!!pe.poste.aceso,energ:!!pe.poste.energ},lamparina:{apagada:!!pe.lamp.ext.apagada,fogo:X('FIRES').some(f=>f.obra===pe.lamp)},arame:!!pe.arame.eletrico,"
        "porta:{aberta:!!pe.porta.ext.aberta,solida:pe.porta.folha?pe.porta.folha.solid:null},portao:r2(pe.portao.abre||0),portaoGrande:pe.portaoG.alvoAbre,longe:Math.round(Math.hypot(P.x-pe.portao.x,P.z-pe.portao.z)),"
        "fervedor:Math.round(pe.ferv.ext.comb||0),barril:{uv:r2(pe.barril.ext.uv),limpa:r2(pe.barril.ext.limpa)},bomba:{ligada:!!pe.bomba.ligada,energ:!!pe.bomba.energ},antena:X('antenaEnergizada')(),filtroX:X('aguaEstado')(pe.filtro)};"),
      ["gwait", 6.0],
      e("depois", "const pe=window.__pe;return{fornalhaComEnergia:r2(pe.forn.ext.proc[0]?pe.forn.ext.proc[0].fim-G.tm:-1),fornalhaSemFio:r2(pe.forn2.ext.proc[0]?pe.forn2.ext.proc[0].fim-G.tm:-1),"
        "armadilha:pe.urso.ext.armada,barril:{uv:r2(pe.barril.ext.uv),limpa:r2(pe.barril.ext.limpa)},poco:{comEnergia:r2(pe.poco.ext.agua),semFio:r2(pe.poco2.ext.agua)}};"),
      j("G.hora=22;"), ["gwait", 1.5],
      e("noite", "const pe=window.__pe;return{poste:{aceso:!!pe.poste.aceso,luz:X('FIRES').some(f=>f.poste===pe.poste&&f.eletrica)}};"),
      # sem energia: porta fecha; dá para abrir na mão e ela fica aberta
      e("cortaPorta", "const pe=window.__pe,f=E().fios.find(f=>f.b===pe.porta.ext.eid);X('cortarFio')(f);W();const r={semFio:{aberta:!!pe.porta.ext.aberta}};"
        "const gr=X('eletPorEid')(f.a),it=X('criarObra')('interruptor',pe.porta.x+1.5,pe.porta.z+1,0,undefined,undefined,g(pe.porta.x+1.5,pe.porta.z+1));X('ligarFio')(gr,it,true);X('ligarFio')(it,pe.porta,true);W();"
        "r.comInterruptor={aberta:!!pe.porta.ext.aberta};it.ext.on=false;W();r.desligou={aberta:!!pe.porta.ext.aberta};X('portaAlternar')(pe.porta);W();W();r.abriuNaMao={aberta:!!pe.porta.ext.aberta};"
        "it.ext.on=true;W();r.religou={aberta:!!pe.porta.ext.aberta};return r;"),
      # antena: com energia, uma oferta a mais por dia no rádio
      e("antena", "const D=X('terrD')(),m0=G.m.etapa;if(G.m.etapa<2)G.m.etapa=2;const ok=X('terrRadioOk')();const pe=window.__pe;X('terrOfertas')();const com=D.ofertas.length,extra=D.ofertas.filter(o=>o.extraE).length;"
        "const f=E().fios.find(f=>f.b===pe.antena.ext.eid);X('cortarFio')(f);W();X('terrOfertas')();const sem=D.ofertas.length,extra2=D.ofertas.filter(o=>o.extraE).length;G.m.etapa=m0;return{radioOk:ok,comEnergia:com,extra,semEnergia:sem,extraSem:extra2};"),
      j("G.hora=10;")]
# ---------- defesas automáticas ----------
s += [j("const pe=window.__pe2={};pe.besta=cria('bestaAuto',0,14,Math.PI);pe.besta.itens[0]={id:'flecha',n:6};pe.cart=cria('armCartucho',-12,12,0);pe.cart.itens[0]={id:'cartucho',n:4};"
        "pe.lanca=cria('lancaChamas',12,12,0);pe.lanca.itens[0]={id:'oleoMotor',n:2};for(const k of['besta','cart','lanca'])fonte(pe[k]);W();vai(C[0],C[1]-14);"
        "window.__zumbis=[];const poeZ=(x,z)=>{const q=ZZ('walker',x,z);if(q){q.st='caca';window.__zfix.push({z:q,x,zz:z});window.__zumbis.push(q);}return q;};"
        "pe.zb=poeZ(C[0]+2,C[1]+14-11);pe.zc=poeZ(C[0]-12,C[1]+12+3);pe.zl=poeZ(C[0]+12,C[1]+12+4);window.__hp0=[pe.zb,pe.zc,pe.zl].map(z=>z&&z.hp);"),
      e("defesasAntes", "const pe=window.__pe2;return{energia:['besta','cart','lanca'].map(k=>!!pe[k].energ),zumbis:[pe.zb,pe.zc,pe.zl].map(z=>!!z),flechas:qt(pe.besta,'flecha'),cartuchos:qt(pe.cart,'cartucho'),oleo:qt(pe.lanca,'oleoMotor')};"),
      ["gwait", 5.0],
      e("defesas", "const pe=window.__pe2,h=window.__hp0,z=[pe.zb,pe.zc,pe.zl];return{besta:{flechas:qt(pe.besta,'flecha'),acertou:!!z[0]&&(!z[0].vivo||z[0].hp<h[0]),flechasNoZumbi:z[0]&&z[0].flechas||0,vivo:z[0]&&z[0].vivo},"
        "cartucho:{cartuchos:qt(pe.cart,'cartucho'),acertou:!!z[1]&&(!z[1].vivo||z[1].hp<h[1]),vivo:z[1]&&z[1].vivo},lanca:{oleo:qt(pe.lanca,'oleoMotor'),tanque:pe.lanca.ext.oleo||0,queimando:!!z[2]&&(z[2].queima>0||!z[2].vivo),acertou:!!z[2]&&(!z[2].vivo||z[2].hp<h[2])}};"),
      # sem munição: avisa; sem energia: não atira
      e("semMunicao", "const pe=window.__pe2;pe.besta.itens=pe.besta.itens.map(()=>null);for(const z of Z)z.vivo=false;window.__zfix=[];Z.length=0;const q=ZZ('walker',pe.besta.x+6,pe.besta.z);if(q){window.__zfix.push({z:q,x:q.x,zz:q.z});}window.__q=q;return{zumbi:!!q};"),
      ["gwait", 2.5],
      e("semMunicaoDepois", "const q=window.__q;return{vivo:q&&q.vivo,hp:q&&Math.round(q.hp),aviso:ult()};"),
      e("semEnergia", "const pe=window.__pe2,q=window.__q;pe.besta.itens[0]={id:'flecha',n:5};const f=E().fios.find(f=>f.b===pe.besta.ext.eid);X('cortarFio')(f);W();window.__hpq=q&&q.hp;return{energ:!!pe.besta.energ};"),
      ["gwait", 2.5],
      e("semEnergiaDepois", "const pe=window.__pe2,q=window.__q;return{flechas:qt(pe.besta,'flecha'),hpIgual:q?q.hp===window.__hpq:null};"),
      j("for(const z of Z)z.vivo=false;window.__zfix=[];Z.length=0;")]
# ---------- esteira ----------
s += [j("const pe=window.__pe3={};pe.est=cria('esteira',-12,-14,0);pe.atras=cria('bau',-12,-14-1.3,0);pe.frente=cria('bau',-12,-14+1.3,0);pe.atras.itens[0]={id:'madeira',n:5};pe.atras.itens[1]={id:'carneCrua',n:2,v:Math.round(G.tm+1440)};"
        "fonte(pe.est);W();"),
      ["gwait", 7.0],
      e("esteiraTudo", "const pe=window.__pe3;return{energ:!!pe.est.energ,frente:{madeira:qt(pe.frente,'madeira'),carne:qt(pe.frente,'carneCrua')},atras:{madeira:qt(pe.atras,'madeira'),carne:qt(pe.atras,'carneCrua')},estado:pe.est.estado};"),
      j("const pe=window.__pe3;pe.est.ext.filtro='comida';pe.frente.itens=pe.frente.itens.map(()=>null);pe.atras.itens=pe.atras.itens.map(()=>null);pe.atras.itens[0]={id:'madeira',n:4};pe.atras.itens[1]={id:'carneCrua',n:2,v:Math.round(G.tm+1440)};"),
      ["gwait", 8.0],
      e("esteiraFiltro", "const pe=window.__pe3;return{frente:{madeira:qt(pe.frente,'madeira'),carne:qt(pe.frente,'carneCrua')},atras:{madeira:qt(pe.atras,'madeira')}};"),
      # baú → fornalha: começa a queimar carvão sozinha; fornalha → baú: recolhe o que ficou pronto
      j("const pe=window.__pe3;pe.est2=cria('esteira',-4,-14,0);pe.b2=cria('bau',-4,-14-1.3,0);pe.f2=cria('fornalha',-4,-14+1.6,0);pe.b2.itens[0]={id:'madeira',n:6};"
        "pe.est3=cria('esteira',4,-14,0);pe.f3=cria('fornalha',4,-14-1.6,0);pe.b3=cria('bau',4,-14+1.3,0);pe.f3.ext.proc=[{r:'carvao',ini:G.tm-200,fim:G.tm-10}];fonte(pe.est2);fonte(pe.est3);W();"),
      ["gwait", 4.0],
      e("esteiraFornalha", "const pe=window.__pe3;return{entrada:{processos:(pe.f2.ext.proc||[]).map(p=>p.r),madeiraNoBau:qt(pe.b2,'madeira')},saida:{carvaoNoBau:qt(pe.b3,'carvao'),processos:(pe.f3.ext.proc||[]).length},estados:[pe.est2.estado,pe.est3.estado]};")]
salvar('p183.json', s)

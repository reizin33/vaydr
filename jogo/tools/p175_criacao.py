"""p175: Etapa 15, agricultura e animais. Registro (itens, receitas, construções nas abas, malhas, manual); época de plantio
(milho no inverno quase não cresce, cenoura cresce; o texto do canteiro avisa); sementes selecionadas (plantio de verdade com
segurar E, crescem 35% mais rápido, colhem um a mais); adubo no canteiro e na horta; composteira pelo painel; galinhas soltas
perto da fazenda (aparecem, deixam chegar agachado, pegar segurando E, fogem correndo de quem chega de pé); galinheiro (soltar,
comida, água, ovos, pintinho, pintinho cresce, galinha morre sem comida e água, galinhas ciscando em volta); ovo cozido na
fogueira; vaca domada de verdade (milho na mão agachado, corda), segue você; curral com cocho e bebedouro; pôr no curral pelo
painel da vaca; ela entra pela porteira, bebe e come; ordenhar; ovelha sem faca não tosquia, com faca dá lã; casal tem filhote,
o filhote cresce; esterco; bebedouro enche pela rede de água; colmeia (enxame com horta perto, mel e cera, ferroada sem
fumigador, fumigador evita); biodigestor (gás, fogareiro cozinha e gasta gás, adubo); salvar e carregar; manual."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),"
     "abre=o=>{if(G.modo==='estacao')X('fecharEstacao')();G.modo='jogo';X('abrirEstacao')(o);return G.modo;},fecha=()=>X('fecharEstacao')(),"
     "ea=id=>{const b=document.querySelector('#es-acoes [data-ea='+id+']');if(!b)return'sem botão';if(b.disabled)return'desabilitado';b.click();return document.getElementById('es-msg').textContent;},"
     "corpo=()=>document.getElementById('es-corpo').textContent,PD=()=>X('plantioD')(),"
     "olha=(x,z)=>{P.yaw=Math.atan2(x-P.x,z-P.z);P.body=P.yaw;},"
     "segura=()=>{const a=X('interAtual')();n.alvo=a;W.__ak=a&&a.k;W.__at=a&&X('textoInter')(a);n.interagir(false);return W.__ak;},"
     "alvo=()=>{const a=X('interAtual')();return{k:a&&a.k,txt:a&&X('textoInter')(a)};},"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_se=X('salaEm'),_an=X('aguaNivel'),_ap=X('aguaProfVeic'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm'),"
     "dirLivre=(x,z)=>{let best=0,bl=-1;const g0=_gr(x,z);for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "const gp=_gr(px,pz);if(!_dm(px,pz,4)||_pb(px,pz,0.9)||_se(px,gp+0.6,pz)||(_an(px,pz)!==null&&_ap(px,pz)>0.4)||Math.abs(gp-g0)>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;__nnc.Z.length=0;G.ondas=[];P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[-62,52],[-80,70],[118,-70],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,12)||_re(x,z,10)||arv(x,z,16)>0||_pb(x,z,2))continue;const g0=_gr(x,z);let plano=true;for(let q=0;q<8;q++){const b=q/8*6.283;if(Math.abs(_gr(x+Math.cos(b)*12,z+Math.sin(b)*12)-g0)>1.4)plano=false;}if(!plano)continue;const d=dirLivre(x,z);if(d.l>=30)c={x,z,a:d.a};}if(!c)c={x:-62,z:52,a:0};W.__c=c;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);vai(c.x,c.z);X(\"morrer=(function(o){return function(){window.__morte={vida:P.vida,causa:G.causa,modo:G.modo,stack:String(new Error().stack).slice(0,700),x:P.x,y:P.y,z:P.z};return o.apply(this,arguments);};})(morrer)\");")]
# ---- registro ----
s += [e("registro", "const I=X('ITEMS'),O=X('OBRAS'),M=X('MESH'),ab=id=>(X('OBRA_CATS').find(q=>q.id===id)||{}).t||[];"
        "return{faltaItem:['ovo','ovoCozido','leite','mel','cera','esterco','adubo','sementesBoas','galinha','fumigador','vela'].filter(k=>!I[k]),"
        "faltaObra:['composteira','biodigestor','galinheiro','curral','bebedouro','colmeia'].filter(k=>!O[k]||!M.obra[k]),"
        "animais:ab('animais'),plantio:ab('plantio'),foraDoChao:['galinheiro','curral','bebedouro','colmeia','composteira','biodigestor'].filter(k=>!X('OBRAS_CHAO').includes(k)),"
        "receitas:['sementesBoas','fumigador','vela'].filter(k=>X('RECIPES').some(r=>r.faz===k)),galinha:!!X('AVE_SP').galinha&&!!(M.ave&&M.ave.galinha),"
        "cozinha:X('COZINHA').some(q=>q.de==='ovo'),estacoes:['composteira','biodigestor','galinheiro','curral','bebedouro','colmeia','cria'].filter(k=>!X('ESTACAO_UI')[k]),"
        "ajuda:!!document.querySelector('#t-ajuda [data-e15p]')};")]
# ---- época de plantio: inverno ----
s += [e("epoca", "G.dia=22;const K=X('epocaK'),T=X('epocaTxt');return{idx:X('estacaoIdx')(),milho:K('milho'),cenoura:K('cenoura'),batata:K('batata'),txtMilho:T('milho'),txtCenoura:T('cenoura'),"
        "melhorMilho:X('epocaMelhor')('milho'),melhorCenoura:X('epocaMelhor')('cenoura')};"),
      j("const D=X('PLANTIO_DEF').filter(d=>d.tipo==='fazenda'),S=PD(),C=X('plantioC')();W.__d=D;S[D[0].id]=0;C[D[0].id]=0;S[D[1].id]=0;C[D[1].id]=4;"), ["gwait", 20],
      e("crescimentoInverno", "const D=W.__d,S=PD();return{milho:+S[D[0].id].toFixed(4),cenoura:+S[D[1].id].toFixed(4),razao:r2(S[D[0].id]/Math.max(1e-6,S[D[1].id]))};"),
      j("const d=W.__d[2],S=PD();S[d.id]=-1;inv('sementes',5);const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;vai(mx,mz+1.0);olha(mx,mz);G.plantioSel=0;"), ["gwait", 0.3],
      e("textoInverno", "return alvo();"),
      j("G.dia=1;"), ["gwait", 0.3],
      e("textoPrimavera", "return Object.assign(alvo(),{idx:X('estacaoIdx')()});")]
# ---- sementes selecionadas: plantar segurando E, crescer, colher ----
s += [j("inv('sementesBoas',2);const d=W.__d[2];const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;vai(mx,mz+1.0);olha(mx,mz);"), ["gwait", 0.3],
      e("textoSelecionada", "return alvo();"),
      j("segura();"), ["gwait", 1.5],
      e("plantouSelecionada", "const d=W.__d[2];return{alvo:W.__ak,estado:PD()[d.id],marcada:X('plantioM')()[d.id]||0,boas:conta('sementesBoas'),sementes:conta('sementes'),cultura:X('culturaDe')(d).id};"),
      j("const D=W.__d,S=PD(),C=X('plantioC')();S[D[2].id]=0;S[D[3].id]=0;C[D[3].id]=0;"), ["gwait", 20],
      e("crescimentoSelecionada", "const D=W.__d,S=PD();return{boa:+S[D[2].id].toFixed(4),normal:+S[D[3].id].toFixed(4),razao:r2(S[D[2].id]/Math.max(1e-6,S[D[3].id]))};"),
      j("const d=W.__d[2];PD()[d.id]=1;W.__m0=conta('milho');const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;vai(mx,mz+1.0);olha(mx,mz);"), ["gwait", 0.3],
      j("segura();"), ["gwait", 1.4],
      e("colheuSelecionada", "const d=W.__d[2];return{alvo:W.__ak,txt:W.__at,milho:conta('milho')-W.__m0,estado:PD()[d.id],marca:X('plantioM')()[d.id]||0};")]
# ---- adubo: canteiro e horta ----
s += [j("const d=W.__d[3],S=PD();S[d.id]=0.2;const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;vai(mx,mz+1.0);olha(mx,mz);inv('adubo',1);"),
      e("adubouCanteiro", "const d=W.__d[3],t0=X('INTER_K').canteiro.texto(d).s,i=P.inv.findIndex(q=>q&&q.id==='adubo');X('UTIL_ACOES').adubo(i);return{estado:r2(PD()[d.id]),adubo:conta('adubo'),texto:t0};"),
      j("const c=W.__c;vai(c.x,c.z);const h=cria('horta',c.x+2.2,c.z,0);h.ext.cresce=0.3;W.__h=h;inv('farinhaOsso',1);"),
      e("adubouHorta", "const h=W.__h,i=P.inv.findIndex(q=>q&&q.id==='farinhaOsso');X('UTIL_ACOES').farinhaOsso(i);return{cresce:r2(h.ext.cresce),farinha:conta('farinhaOsso')};")]
# ---- composteira pelo painel ----
s += [j("const c=W.__c,rx=Math.cos(c.a),rz=-Math.sin(c.a);X('destruirObraSilenciosa')(W.__h);vai(c.x,c.z);const o=cria('composteira',c.x-rx*5,c.z-rz*5,c.a);W.__cp=o;vai(c.x-rx*3.6,c.z-rz*3.6);"
        "inv('esterco',4);inv('frutas',2);abre(o);W.__r1=ea('por');W.__t1=corpo();fecha();"),
      e("composteiraPor", "const e=W.__cp.ext;return{msg:W.__r1,texto:W.__t1.slice(0,170),esterco:conta('esterco'),frutas:conta('frutas'),porcoes:e.porcoes,lotes:e.lotes.length};"),
      j("G.tm+=601;abre(W.__cp);W.__r2=ea('tirar');fecha();"),
      e("composteiraAdubo", "const e=W.__cp.ext;return{msg:W.__r2,adubo:conta('adubo'),pronto:e.pronto,lotes:e.lotes.length};")]
# ---- galinhas soltas perto da fazenda ----
s += [j("const f=X('PLACES').find(p=>p.id==='fazenda');let p=null;for(let k=0;k<24&&!p;k++){const a=k/24*6.283,x=f.x+Math.cos(a)*25,z=f.z+Math.sin(a)*25;if(_dm(x,z,4)&&!_pb(x,z,0.6)&&!_se(x,_gr(x,z)+0.6,z))p={x,z};}vai(p.x,p.z);"), ["gwait", 4],
      e("galinhasSoltas", "const L=X('AVES').filter(b=>b.sp==='galinha'&&b.sitio);return{n:L.length,faz:L.filter(b=>b.sitio.id==='faz').length,st:L.map(b=>b.st),sitios:X('galSitios')().length,dist:L.map(b=>Math.round(Math.hypot(b.x-P.x,b.z-P.z)))};"),
      j("const L=X('AVES').filter(b=>b.sitio&&b.sitio.id==='faz'&&b.st==='chao');const b=L[0];W.__gb=b;let x=b.x+1.4,z=b.z;for(let k=0;k<12;k++){const a=k*0.52;x=b.x+Math.cos(a)*1.4;z=b.z+Math.sin(a)*1.4;if(!_pb(x,z,0.4)&&_dm(x,z,2))break;}"
        "vai(x,z);P.agachado=true;P.agK=1;olha(b.x,b.z);"), ["gwait", 0.6],
      e("galinhaCalma", "const b=W.__gb;return Object.assign(alvo(),{st:b.st,dist:r2(Math.hypot(b.x-P.x,b.z-P.z))});"),
      j("const b=W.__gb;olha(b.x,b.z);P.agachado=true;P.agK=1;segura();"), ["gwait", 1.6],
      e("pegouGalinha", "return{alvo:W.__ak,galinha:conta('galinha'),naLista:X('AVES').includes(W.__gb),resta:X('e15')().gal.faz};"),
      j("P.agachado=false;P.agK=0;const L=X('AVES').filter(b=>b.sitio&&b.sitio.id==='faz'&&b.st==='chao');const b=L[0];W.__gb2=b;if(b){W.__gp=[b.x,b.z];vai(b.x+1.8,b.z);}"), ["gwait", 0.6],
      e("galinhaFoge", "const b=W.__gb2;if(!b)return{semGalinha:true};return{st:b.st,andou:r2(Math.hypot(b.x-W.__gp[0],b.z-W.__gp[1])),altura:r2(b.y-X('ground')(b.x,b.z))};"),
      ["gwait", 2.5],
      e("galinhaParou", "const b=W.__gb2;if(!b)return{semGalinha:true};return{st:b.st,altura:r2(b.y-X('ground')(b.x,b.z)),naLista:X('AVES').includes(b)};")]
# ---- galinheiro ----
s += [j("const c=W.__c,rx=Math.cos(c.a),rz=-Math.sin(c.a);vai(c.x,c.z);const g=cria('galinheiro',c.x+rx*8,c.z+rz*8,c.a);W.__g=g;vai(c.x+rx*5.9,c.z+rz*5.9);"
        "inv('galinha',2);inv('milho',6);inv('agua',3);abre(g);W.__r=[ea('soltar'),ea('comida'),ea('agua')];W.__t=corpo();fecha();"),
      e("galinheiroMontado", "const e=W.__g.ext;return{msgs:W.__r,g:e.g,comida:e.comida,agua:e.agua,galinha:conta('galinha'),milho:conta('milho'),garrafas:conta('garrafa'),texto:W.__t.slice(0,220)};"),
      j("G.tm+=1440;"), ["gwait", 3],
      e("galinheiroDia1", "const e=W.__g.ext;return{ovos:e.ovos,esterco:e.esterco,comida:r2(e.comida),agua:r2(e.agua),pin:e.pin.length,ciscando:X('AVES').filter(b=>b.casa===W.__g).map(b=>r2(Math.hypot(b.x-W.__g.x,b.z-W.__g.z)))};"),
      j("const R=Math.random;Math.random=()=>0.1;try{G.tm+=1440;X('galPasso')(W.__g);}finally{Math.random=R;}"),
      e("galinheiroDia2", "const e=W.__g.ext;return{ovos:e.ovos,pin:e.pin.length,g:e.g};"),
      j("abre(W.__g);W.__r=ea('ovos');W.__r2=ea('esterco');fecha();"),
      e("recolheuOvos", "return{msg:W.__r,msgE:W.__r2,ovos:conta('ovo'),noNinho:W.__g.ext.ovos,esterco:conta('esterco')};"),
      j("G.tm+=3*1440+5;X('galPasso')(W.__g);"),
      e("pintoCresceu", "const e=W.__g.ext;return{g:e.g,pin:e.pin.length,comida:r2(e.comida),agua:r2(e.agua)};"),
      j("const e=W.__g.ext;e.comida=0;e.agua=0;W.__g0=e.g+e.pin.length;G.tm+=2*1440+10;X('galPasso')(W.__g);"),
      e("galinhaMorre", "const e=W.__g.ext;return{antes:W.__g0,depois:e.g+e.pin.length};"),
      j("const Fo=X('FIRE');vai(Fo[0]+2.2,Fo[2]);olha(Fo[0],Fo[2]);"), ["gwait", 0.3],
      e("fogueiraTexto", "return alvo();"),
      j("segura();"), ["gwait", 3.5],
      e("ovosCozidos", "return{alvo:W.__ak,ovo:conta('ovo'),cozido:conta('ovoCozido')};")]
# ---- vaca: domar de verdade ----
s += [j("const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);vai(c.x,c.z);for(const b of X('BICHOS').slice())if(b.vivo&&!b.domado&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);"
        "const v=X('criarBicho')('vaca',c.x-rx*7+fx*4,c.z-rz*7+fz*4,{});W.__v=v;v.st='come';v.t=60;v.lider=null;inv('milho',6);inv('corda',1);"
        "const dx=c.x-v.x,dz=c.z-v.z,l=Math.hypot(dx,dz);vai(v.x+dx/l*2.4,v.z+dz/l*2.4);P.agachado=true;P.agK=1;olha(v.x,v.z);"), ["gwait", 1.0],
      e("vacaAlvo", "const v=W.__v;return Object.assign(alvo(),{st:v.st,alerta:r2(v.alerta),dist:r2(Math.hypot(v.x-P.x,v.z-P.z)),modo:G.modo,vivo:P.alive,morte:W.__morte||null});")]
for i in range(4):
    s += [j("const v=W.__v;const dx=P.x-v.x,dz=P.z-v.z,l=Math.hypot(dx,dz)||1;if(l>2.9||l<1.8)vai(v.x+dx/l*2.4,v.z+dz/l*2.4);P.agachado=true;P.agK=1;olha(v.x,v.z);segura();"), ["gwait", 2.3],
          e("milho%d" % (i + 1), "const v=W.__v;return{alvo:W.__ak,conf:r2(v.conf||0),milho:conta('milho'),st:v.st,dist:r2(Math.hypot(v.x-P.x,v.z-P.z))};")]
s += [j("const v=W.__v;const dx=P.x-v.x,dz=P.z-v.z,l=Math.hypot(dx,dz)||1;if(l>2.9||l<1.8)vai(v.x+dx/l*2.4,v.z+dz/l*2.4);P.agachado=true;P.agK=1;olha(v.x,v.z);segura();"), ["gwait", 2.6],
      e("vacaDomada", "const v=W.__v;return{alvo:W.__ak,txt:W.__at,domado:!!v.domado,cria:!!v.cria,modo:v.modo,naCriacao:X('CRIACAO').includes(v),naFauna:X('BICHOS').includes(v),corda:conta('corda')};"),
      j("P.agachado=false;P.agK=0;const v=W.__v,c=W.__c;vai(c.x,c.z);W.__dv0=Math.hypot(v.x-P.x,v.z-P.z);"), ["gwait", 8],
      e("vacaSegue", "const v=W.__v;return{antes:r2(W.__dv0),depois:r2(Math.hypot(v.x-P.x,v.z-P.z)),st:v.st,modo:v.modo};")]
# ---- curral com cocho e bebedouro; pôr a vaca no curral pelo painel dela ----
s += [j("const c=W.__c,a=c.a;const K=cria('curral',c.x+Math.sin(a)*14,c.z+Math.cos(a)*14,a);W.__K=K;const o1=X('owl')(K,-2.2,1.6),o2=X('owl')(K,1.2,1.6);"
        "const co=cria('cocho',o1[0],o1[1],a);co.itens[0]=X('newItem')('feno',4);W.__co=co;const be=cria('bebedouro',o2[0],o2[1],a);W.__be=be;"
        "const g=X('owl')(K,0,-4.6);vai(g[0],g[1]);olha(K.x,K.z);inv('agua',4);abre(be);W.__r=ea('encher');fecha();"), ["gwait", 6],
      e("curralMontado", "const K=W.__K,v=W.__v;return{modo:G.modo,vivo:P.alive,morte:W.__morte||null,cols:(K.cols||[]).length,msg:W.__r,agua:W.__be.ext.agua,vacaDist:r2(Math.hypot(v.x-P.x,v.z-P.z)),resumo:X('ESTACAO_UI').curral.resumo(K)};"),
      j("const v=W.__v;const dx=P.x-v.x,dz=P.z-v.z,l=Math.hypot(dx,dz)||1;if(l>2.2)vai(v.x+dx/l*1.9,v.z+dz/l*1.9);olha(v.x,v.z);segura();"), ["gwait", 0.9],
      e("painelVaca", "return{alvo:W.__ak,txt:W.__at,modo:G.modo,nome:document.getElementById('es-nome').textContent,corpo:corpo().slice(0,220),botoes:[...document.querySelectorAll('#es-acoes [data-ea]')].map(b=>b.dataset.ea+(b.disabled?'-':'+'))};"),
      j("W.__r=ea('curral');fecha();"), ["gwait", 16],
      e("vacaNoCurral", "const v=W.__v,K=W.__K;return{msg:W.__r,modo:v.modo,dentro:X('curralDentro')(K,v.x,v.z,0.3),local:X('curralLocal')(K,v.x,v.z).map(r2)};"),
      j("const v=W.__v;v.sede=60;W.__a0=W.__be.ext.agua;"), ["gwait", 14],
      e("vacaBebe", "const v=W.__v;return{sede:r2(v.sede),agua:r2(W.__be.ext.agua),antes:W.__a0,st:v.st};"),
      j("const v=W.__v;v.fome=60;"), ["gwait", 14],
      e("vacaCome", "const v=W.__v,s=W.__co.itens.find(q=>q&&q.id==='feno');return{fome:r2(v.fome),feno:s?s.n:0};"),
      j("const v=W.__v;v.prodTm=G.tm-1500;v.fome=20;v.sede=20;abre(W.__K);W.__r=ea('ordenhar');fecha();"),
      e("ordenhou", "return{msg:W.__r,leite:conta('leite')};")]
# ---- ovelha: tosquiar precisa de faca ----
s += [j("const K=W.__K,p=X('owl')(K,-1.5,-0.5);const o=X('criarBicho')('ovelha',p[0],p[1],{});X('domarCria')(o);o.modo='curral';o.curral={x:K.x,z:K.z};o.prodTm=G.tm-4400;o.fome=10;o.sede=10;W.__ov=o;"
        "abre(K);W.__r=ea('tosquiar');fecha();W.__l0=conta('la');inv('faca',1);abre(K);W.__r2=ea('tosquiar');fecha();"),
      e("tosquia", "return{semFaca:W.__r,la0:W.__l0,comFaca:W.__r2,la:conta('la'),criacao:X('CRIACAO').length};")]
# ---- casal de vacas tem filhote; filhote cresce; esterco ----
s += [j("const K=W.__K,p=X('owl')(K,1.5,-0.5);const v2=X('criarBicho')('vaca',p[0],p[1],{});X('domarCria')(v2);v2.modo='curral';v2.curral={x:K.x,z:K.z};W.__v2=v2;"
        "for(const b of[W.__v,v2]){b.fome=10;b.sede=10;}X('curralPasso')(K);W.__prox=K.ext.prox.vaca-G.tm;"
        "G.tm+=6*1440+5;for(const b of[W.__v,v2]){b.fome=10;b.sede=10;}X('curralPasso')(K);W.__f=X('CRIACAO').find(b=>b.nasc!==null&&b.nasc!==undefined&&b.tipo==='vaca');"),
      e("filhote", "const f=W.__f;return{espera:Math.round(W.__prox),nasceu:!!f,escala:f&&r2(f.ch.s),modo:f&&f.modo,nome:f&&X('criaNome')(f),criacao:X('CRIACAO').length,noCurral:X('curralAnimais')(W.__K).length};"),
      ["gwait", 1],
      j("const f=W.__f;if(f){G.tm+=3*1440+5;}"), ["gwait", 1],
      e("filhoteCresceu", "const f=W.__f;return f?{escala:r2(f.ch.s),nasc:f.nasc,nome:X('criaNome')(f)}:{};"),
      j("abre(W.__K);W.__r=ea('esterco');fecha();"),
      e("esterco", "return{msg:W.__r,esterco:conta('esterco'),resumo:X('ESTACAO_UI').curral.resumo(W.__K)};")]
# ---- bebedouro na rede de água ----
s += [j("const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);const b=cria('bebedouro',c.x-fx*6+rx*6,c.z-fz*6+rz*6,c.a);b.ext.agua=0;"
        "const cx=cria('caixaAgua',b.x+rx*1.6,b.z+rz*1.6,c.a);cx.ext.agua=100;W.__b2=b;W.__cx=cx;X('aguaSujo=true');vai(c.x,c.z);"), ["gwait", 12],
      e("bebedouroRede", "return{agua:r2(W.__b2.ext.agua),caixa:r2(W.__cx.ext.agua),rede:X('redeDe')(W.__b2).length,resumo:X('redeResumo')(W.__b2)};")]
# ---- colmeia ----
s += [j("const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);const h=cria('horta',c.x-fx*4-rx*8,c.z-fz*4-rz*8,c.a);const o=cria('colmeia',c.x-fx*4-rx*5.5,c.z-fz*4-rz*5.5,c.a);W.__cm=o;"
        "vai(o.x+rx*1.8,o.z+rz*1.8);olha(o.x,o.z);abre(o);W.__t0=corpo();fecha();G.tm+=1441;abre(o);W.__t1=corpo();fecha();"),
      e("colmeiaEnxame", "const e=W.__cm.ext;return{antes:W.__t0.slice(0,120),enxame:e.enxame,depois:W.__t1.slice(0,120),flor:X('florPerto')(W.__cm)};"),
      j("G.tm+=2880;P.vida=100;abre(W.__cm);W.__r=ea('colher');W.__vida=P.vida;fecha();"),
      e("colheuSemFumigador", "return{msg:W.__r,vida:W.__vida,mel:conta('mel'),cera:conta('cera'),brava:W.__cm.ext.raivaAte>X('G').t};"),
      j("G.tm+=2880;P.vida=100;inv('fumigador',1);abre(W.__cm);W.__r=ea('colher');W.__vida=P.vida;fecha();"),
      e("colheuComFumigador", "const f=P.inv.find(q=>q&&q.id==='fumigador');return{msg:W.__r,vida:W.__vida,mel:conta('mel'),cera:conta('cera'),fumigador:f&&f.dur};")]
# ---- biodigestor ----
s += [j("const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);const o=cria('biodigestor',c.x-fx*8+rx*1,c.z-fz*8+rz*1,c.a);W.__bd=o;vai(o.x-fx*2.2,o.z-fz*2.2);olha(o.x,o.z);"
        "inv('esterco',4);abre(o);W.__r=ea('por');fecha();G.tm+=120;X('bioPasso')(o);"),
      e("biodigestorGas", "const e=W.__bd.ext;return{msg:W.__r,carga:r2(e.carga),gas:r2(e.gas),fogo:X('FIRES').some(f=>f.bio===W.__bd),fogueira:r2(Math.hypot(P.x-X('FIRE')[0],P.z-X('FIRE')[2]))};"),
      j("for(const id of['ovo','ovoCozido'])while(conta(id))X('invRemove')(id,conta(id));inv('carneCrua',1);W.__g0=W.__bd.ext.gas;"), ["gwait", 0.4],
      e("fogareiroTexto", "return alvo();"),
      j("segura();"), ["gwait", 3.5],
      e("fogareiroCozinhou", "return{alvo:W.__ak,gasAntes:r2(W.__g0),gas:r2(W.__bd.ext.gas),assada:conta('carneAssada'),crua:conta('carneCrua')};"),
      j("G.tm+=16*60+5;X('bioPasso')(W.__bd);abre(W.__bd);W.__r=ea('adubo');fecha();"),
      e("biodigestorAdubo", "return{msg:W.__r,adubo:conta('adubo'),carga:r2(W.__bd.ext.carga)};")]
# ---- cerca e estábulo (o cavalo fica na baia e sara mais rápido) ----
s += [j("const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);vai(c.x,c.z);const ce=cria('cerca',c.x+fx*4+rx*10,c.z+fz*4+rz*10,c.a);W.__ce=ce;"
        "const e=cria('estabulo',c.x+fx*6-rx*12,c.z+fz*6-rz*12,c.a+Math.PI);W.__eb=e;const p=X('owl')(e,0,-3.4);"
        "const h=X('criarBicho')('cavalo',p[0],p[1],{s:1});h.conf=1;X('domarCavalo')(h);h.empinaT=0;W.__hb=h;h.hp=h.hpMax*0.5;h.fome=20;"
        "const q=X('owl')(e,1.2,-4.6);vai(q[0],q[1]);X('abrirCavalo')(h);W.__bt=[...document.querySelectorAll('#es-acoes [data-ea]')].map(b=>b.dataset.ea+':'+b.querySelector('span').textContent);W.__r=ea('fica');fecha();"), ["gwait", 10],
      e("estabulo", "const h=W.__hb,e=W.__eb;return{botoes:W.__bt.filter(t=>/^fica/.test(t)),msg:W.__r,modo:h.modo,naBaia:!!X('naBaia')(h),dist:r2(Math.hypot(h.x-e.x,h.z-e.z)),cols:(e.cols||[]).length,cerca:!!(W.__ce.col&&W.__ce.col.solid),malhas:!!X('MESH').obra.cerca&&!!X('MESH').obra.estabulo};"),
      j("const h=W.__hb;W.__hp0=h.hp;G.tm+=60;"), ["gwait", 3],
      e("estabuloSara", "const h=W.__hb;return{antes:Math.round(W.__hp0),depois:Math.round(h.hp),max:h.hpMax};")]
# ---- salvar e carregar; manual ----
s += [e("morte", "return{modo:G.modo,vivo:P.alive,morte:W.__morte||null};"),
      e("salvo", "const sv=X('v8Salvar')(),c=sv.criacao;const antes=X('CRIACAO').length;X('v8Carregar')(JSON.parse(JSON.stringify(sv)));const L=X('CRIACAO');"
        "return{salvos:c.L.length,tipos:c.L.map(q=>q.t).sort(),antes,depois:L.length,modos:L.map(b=>b.modo),filhote:c.L.filter(q=>q.nasc!==null&&q.nasc!==undefined).length,pm:typeof c.pm,gal:Object.keys(c.gal||{}).length};"),
      ["gwait", 1],
      e("depoisDeCarregar", "const L=X('CRIACAO');return{n:L.length,naFauna:L.filter(b=>X('BICHOS').includes(b)).length,vivos:L.filter(b=>b.vivo).length};"),
      e("manual", "const ex=X('MANUAL_EXTRA').flatMap(f=>f());return{epoca:!!ex.find(q=>q.id==='x:epoca'),criacao:!!ex.find(q=>q.id==='x:criacao'),colmeia:!!ex.find(q=>q.id==='x:colmeia'),"
        "secoes:[X('mnSecObra')('curral'),X('mnSecObra')('composteira'),X('mnSecReceita')({faz:'fumigador'}),X('mnSecReceita')({faz:'sementesBoas'})]};")]
salvar('p175.json', s)

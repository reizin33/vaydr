"""p155: fabricação na mão só do básico, bancada construída com material básico (fabrica, abre com E, vira oficina) e cantil
(receita na bancada, encher no barril e no rio, beber na mochila e na mão, ferver na fogueira, pastilha, filtro, salvar)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
FOTOS = os.environ.get('FOTOS','1')=='1'
H = ("const C=window.__C||JSON.parse(localStorage.getItem('__C155')||'null'),g=(x,z)=>X('ground')(x,z),cam=X('cam'),R=()=>X('RECIPES'),"
     "vis=()=>{X(\"fabCat='todas'\");return X('receitasVisiveis')().map(i=>R()[i].faz);},ri=(faz,est)=>R().findIndex(r=>r.faz===faz&&(est===undefined||r.est===est)),"
     "poe=(tipo,ax,az,yaw)=>{const c0=n.cfg.cam;n.cfg.cam='1';P.yaw=yaw;P.body=yaw;P.pitch=0;const px=ax-Math.sin(yaw)*3.2,pz=az-Math.cos(yaw)*3.2;vai(px,pz,g(px,pz));"
     "cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];X('modoObra')(true);X('OBRA').tipo=tipo;X('OBRA').rot=0;X('obraAlvo')();const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo};"
     "const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "usaE=()=>{const a=X('interAtual')();if(a)X('(a=>{alvoInter=a;interagir(false);})')(a);return a&&a.k;},"
     "txt=()=>{const a=X('interAtual')();return a?{k:a.k,t:X('textoInter')(a).t}:null;},"
     "ct=()=>{const s=P.inv.find(q=>q&&q.id==='cantil');return s?{g:s.dur|0,suja:!!s.mun}:null;},ci=()=>P.inv.findIndex(q=>q&&q.id==='cantil'),"
     "rot=()=>{const i=ci();const el=document.createElement('div');el.innerHTML=X('slotHTML')(P.inv[i],i,false);const q=el.querySelector('.q');return q?q.outerHTML:null;},"
     "aba=()=>({aba:document.getElementById('aba-fab-t').textContent,dica:!document.getElementById('fab-dica').hidden,tiles:document.querySelectorAll('#receitas .tile').length,"
     "nomes:[...document.querySelectorAll('#receitas .tile span')].map(e=>e.textContent)});")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)

s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;"),
      ev("lugar", "const B=X('BENCH'),ok=(x,z)=>{if(!X('dentroMapa')(x,z,10))return false;const g0=X('ground')(x,z);for(let i=-2;i<=2;i++)for(let k=-2;k<=2;k++){const px=x+i*1.5,pz=z+k*1.5;"
         "if(Math.abs(X('ground')(px,pz)-g0)>0.5||X('pointBlocked')(px,pz,0.6)||(X('RIO').ok&&X('aguaPerto')(px,pz,1.5)))return false;}return Math.hypot(x-B[0],z-B[1])>14&&Math.hypot(x-F[0],z-F[2])>12;};"
         "let C=null;for(let r=18;r<70&&!C;r+=2)for(let k=0;k<36&&!C;k++){const a=k/36*6.283,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r);if(ok(x,z))C=[x,z];}"
         "window.__C=C;localStorage.setItem('__C155',JSON.stringify(C));return{C,inv:P.inv.filter(Boolean).length};")]
# ---- receitas: na mão só o básico ----
s += [e("receitas", "const mao=R().filter(r=>!r.est).map(r=>r.faz),est=k=>{const r=R().find(q=>q.faz===k);return r&&r.est;};"
        "return{mao:[...new Set(mao)].sort().join(','),nMao:mao.length,tabuas:est('tabuas'),porrete:est('porrete'),vara:est('vara'),laco:est('laco'),pano:est('pano'),cantil:est('cantil'),total:R().length};"),
      j("vai(C[0],C[1],g(C[0],C[1]));"), ["gwait", 0.3],
      e("longe_lista", "const v=vis();return{aba:X('fabAbaNome')(),perto:X('pertoBancada')(),n:v.length,lista:[...new Set(v)].sort().join(',')};"),
      j("X('abrirMochila')();"), ["gwait", 0.2],
      e("mochila_abre", "return{aba:X('invAba'),modo:G.modo};"),
      j("X('fecharMochila')();X('abrirMochila')('fabricar');"), ["gwait", 0.2],
      e("longe_ui", "const r=aba();X('fecharMochila')();return r;")]
# ---- corda na mão, longe da bancada ----
s += [j("n.invAdd('fibra',10);n.invAdd('madeira',8);n.invAdd('pedra',4);"),
      e("corda_mao", "const i=ri('corda',0);const a=X('podeFabricar')(R()[i]);X('fabricar')(i);X('fabricar')(i);const t=ri('tabuas');return{podia:a,corda:conta('corda'),fibra:conta('fibra'),tabuasPode:X('podeFabricar')(R()[t]),motivo:X('motivoFalta')(R()[t])};")]
# ---- bancada da clareira ----
s += [j("const b=X('INTER').find(i=>i.id==='bancada');vai(b.x,b.z,g(b.x,b.z));"), ["gwait", 0.3],
      e("clareira", "const v=vis();return{aba:X('fabAbaNome')(),perto:X('pertoBancada')(),n:v.length,temTabuas:v.includes('tabuas'),temMunicao:v.includes('municao9')};"),
      j("X('abrirMochila')('fabricar');"), ["gwait", 0.2],
      e("clareira_ui", "const r=aba();r.nomes=r.nomes.length;X('fecharMochila')();return r;")]
# ---- bancada construída com material básico ----
s += [j("vai(C[0],C[1],g(C[0],C[1]));"),
      e("bancada_poe", "const r=poe('bancadaTrab',C[0],C[1],0.4);const b=X('OB').find(o=>o.tipo==='bancadaTrab');r.sobra={madeira:conta('madeira'),pedra:conta('pedra'),corda:conta('corda')};"
        "r.col=b&&b.col?{y0:r2(b.col.y0-b.y),y1:r2(b.col.y1-b.y),hw:b.col.hw}:null;r.menu=X('obrasVisiveis')().indexOf('bancadaTrab');return r;"),
      j("const b=X('OB').find(o=>o.tipo==='bancadaTrab');const px=b.x+Math.sin(b.yaw+Math.PI)*1.3,pz=b.z+Math.cos(b.yaw+Math.PI)*1.3;vai(px,pz,g(px,pz));P.yaw=b.yaw;P.body=b.yaw;"), ["gwait", 0.3],
      e("bancada_perto", "const v=vis();return{alvo:txt(),aba:X('fabAbaNome')(),perto:X('pertoBancada')(),n:v.length,temTabuas:v.includes('tabuas')};"),
      j("usaE();"), ["gwait", 0.2],
      e("bancada_E", "const r={aba:X('invAba'),modo:G.modo,ui:aba()};r.ui.nomes=r.ui.nomes.length;X('fecharMochila')();return r;"),
      e("bancada_tabuas", "const i=ri('tabuas'),a=conta('tabuas');X('fabricar')(i);return{antes:a,depois:conta('tabuas'),madeira:conta('madeira')};"),
      j("G.fab.manuais.manualMecanico=1;n.invAdd('tabuas',8);n.invAdd('pregos',6);n.invAdd('sucata',4);"),
      e("oficina", "const f=X('oficinaFalta')();const ok=X('melhorarBancada')();return{falta:f,ok,nv:G.fab.nv,aba:X('fabAbaNome')(),municao:vis().includes('municao9')};")]
if FOTOS:
    s += foto("810_bancada.png", H + "G.hora=10;const b=X('OB').find(o=>o.tipo==='bancadaTrab');const px=b.x+Math.sin(b.yaw+Math.PI)*2.4,pz=b.z+Math.cos(b.yaw+Math.PI)*2.4;vai(px+1.2,pz,g(px+1.2,pz));"
              "const fx=b.x+Math.sin(b.yaw+Math.PI)*2.2+Math.cos(b.yaw)*1.0,fz=b.z+Math.cos(b.yaw+Math.PI)*2.2-Math.sin(b.yaw)*1.0;G.camFix={pos:[fx,b.y+1.7,fz],tgt:[b.x,b.y+0.8,b.z],fov:0.95};", 0.6, 4.0)
# ---- cantil ----
s += [e("cantil_receita", "n.invAdd('sucata',2);n.invAdd('couroPequeno',1);const i=ri('cantil');const v=vis();const a=X('podeFabricar')(R()[i]);X('fabricar')(i);return{visivel:v.includes('cantil'),podia:a,cantil:ct(),rotulo:rot(),loot:Object.keys(X('LOOT')).filter(k=>X('LOOT')[k].some(q=>q[0]==='cantil')).join(',')};"),
      e("cantil_vazio", "P.sede=20;const i=ci();X('usarItem')(i);return{cantil:ct(),sede:Math.round(P.sede),existe:ci()>=0};"),
      j("const b=X('INTER').find(i=>i.kind==='agua'&&i.label==='Barril de água');window.__bar=b;vai(b.x,b.z-0.4,g(b.x,b.z-0.4));P.yaw=0;P.body=0;"), ["gwait", 0.3],
      e("barril_txt", "return txt();"),
      e("barril", "usaE();return{cantil:ct(),rotulo:rot()};"),
      e("beber_mochila", "P.sede=20;X('usarItem')(ci());return{cantil:ct(),sede:Math.round(P.sede)};"),
      j("P.sede=20;sel('cantil');X('atacar')();"), ["gwait", 1.3],
      e("beber_mao", "return{cantil:ct(),sede:Math.round(P.sede),botao:document.getElementById('a-atacar-l').textContent};"),
      j("const R0=X('RIO'),s0=0.3,q=X('rioPonto')(s0),w=R0.larg(s0)+1.8;vai(q[0]+q[3]*w,q[1]-q[2]*w);P.yaw=Math.atan2(-q[3],q[2]);P.body=P.yaw;"), ["gwait", 0.4],
      e("rio_txt", "return txt();"),
      e("rio", "usaE();return{cantil:ct(),rotulo:rot()};"),
      e("beber_suja", "const r0=Math.random;Math.random=()=>0;P.intox=0;P.sede=20;X('usarItem')(ci());Math.random=r0;return{cantil:ct(),intox:P.intox>0,sede:Math.round(P.sede)};"),
      j("P.intox=0;vai(F[0]+1.6,F[2]+0.4);P.yaw=Math.atan2(F[0]-P.x,F[2]-P.z);P.body=P.yaw;"), ["gwait", 0.3],
      e("fogo_txt", "return{tem:X('temCozinhar')(),txt:txt(),cozinha:X('cozinharTexto')().t};"),
      e("fogo", "X('cozinhar')();return{cantil:ct(),tem:X('temCozinhar')()};"),
      e("pastilha", "const s=P.inv[ci()];s.mun=1;n.invAdd('pastilha',1);const i=P.inv.findIndex(q=>q&&q.id==='pastilha');X('usarUtil')(i);return{cantil:ct(),pastilha:conta('pastilha')};"),
      e("filtro", "const s=P.inv[ci()];s.dur=1;s.mun=1;n.invAdd('filtro',1);G.chuva=0.8;const i=P.inv.findIndex(q=>q&&q.id==='filtro');X('usarUtil')(i);G.chuva=0;return{cantil:ct(),filtro:conta('filtro')};"),
      j("const s=P.inv[ci()];s.dur=3;s.mun=1;"), ["gwait", 0.2], js("__nnc.salvarJogo()"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.4],
      e("carregado", "return{cantil:ct(),bancada:X('OB').filter(o=>o.tipo==='bancadaTrab').length,nv:G.fab.nv,aba:X('fabAbaNome')()};")]
salvar('p155.json', s)

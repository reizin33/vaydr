"""p177: Etapa 16, mover e desmontar peças no modo de construção (mira acha a peça; mover leva vida, itens e o mesmo objeto;
devolve ao cancelar; salvar no meio grava o lugar antigo; peça que segura outra não sai), desmontar devolve parte do material
(confirmação em dois toques), marco da base (único, centro da base, painel, mover), estabilidade (porcentagem, sacada em
balanço, pilar danificado, recusa abaixo de 30%) e desabamento (pilar quebrado: piso, sacada, baú e telhado da casa caem)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=window.__C,g=(x,z)=>X('ground')(x,z),cam=X('cam'),O=()=>X('OBRA'),"
     "poe=(tipo,ax,az,yaw,rot)=>{const c0=n.cfg.cam;n.cfg.cam='1';P.yaw=yaw;P.body=yaw;P.pitch=0;const px=ax-Math.sin(yaw)*3.4,pz=az-Math.cos(yaw)*3.4;vai(px,pz,g(px,pz));"
     "cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];X('modoObra')(true);O().tipo=tipo;O().rot=rot||0;X('obraAlvo')();const Q=O(),r={ok:Q.ok,motivo:Q.motivo,x:r2(Q.x-C[0]),z:r2(Q.z-C[1])};"
     "const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "noAlto=(tipo,yaw,dx,dz,pl)=>{pl=pl||plat();const c0=n.cfg.cam;n.cfg.cam='1';vai(pl.x+(dx||0),pl.z+(dz||0),pl.y);P.yaw=yaw;P.body=yaw;P.pitch=0;cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];"
     "X('modoObra')(true);O().tipo=tipo;O().rot=0;X('obraAlvo')();const Q=O(),r={ctx:X('contextoObra')(),ok:Q.ok,motivo:Q.motivo,est:Q.est===null||Q.est===undefined?null:r2(Q.est),"
     "chip:(document.getElementById('item-nome').textContent.match(/estabilidade \\d+%/)||[''])[0]};const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "mirar=(o,dy)=>{const ey=P.y+1.62,tx=o.x,ty=o.y+(dy===undefined?0.8:dy),tz=o.z,dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,ty-ey,dz);P.yaw=Math.atan2(dx,dz);P.body=P.yaw;"
     "cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];if(!O().ativo)X('modoObra')(true);X('obraAlvo')();return O().mira;},"
     "olhar=(tx,tz)=>{const ey=P.y+1.62,ty=g(tx,tz),dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,ty-ey,dz);P.yaw=Math.atan2(dx,dz);P.body=P.yaw;cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];"
     "X('obraAlvo')();const Q=O();return{ok:Q.ok,motivo:Q.motivo,x:r2(Q.x-C[0]),z:r2(Q.z-C[1])};},"
     "ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "alvoTxt=()=>{const e=document.getElementById('obra-alvo');return e.classList.contains('escondido')?'':e.textContent;},"
     "bt=id=>{const e=document.getElementById(id);return e.hidden?null:e.textContent.trim();},"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},plat=()=>X('OB').find(o=>o.tipo==='plataforma'),ob=t=>X('OB').filter(o=>o.tipo===t),"
     "est=o=>{const v=X('estabilidade')(o);return v===null?null:r2(v);};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"
         "n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));"),
      ev("lugar", "const livre=(px,pz,g0,t)=>!(Math.abs(X('ground')(px,pz)-g0)>t||X('pointBlocked')(px,pz,0.5)||(X('RIO').ok&&X('aguaPerto')(px,pz,1.0)));"
         "const ok=(x,z)=>{if(!X('dentroMapa')(x,z,20))return false;const g0=X('ground')(x,z);for(let i=-2;i<=5;i++)for(let k=-2;k<=5;k++)if(!livre(x+i*1.5,z+k*1.5,g0,0.8))return false;"
         "for(const[dx,dz]of[[6.5,-2.5],[3.1,-2.5],[6.5,-0.2],[6.5,-3.2],[-2,6.5],[-2,3.1],[1,6.5],[-2.4,2.6],[-2.6,-2.6]])for(const[ex,ez]of[[0,0],[0.7,0],[-0.7,0],[0,0.7],[0,-0.7]])if(!livre(x+dx+ex,z+dz+ez,g0,1.2))return false;return true;};"
         "let C=null;for(let r=18;r<170&&!C;r+=2)for(let k=0;k<48&&!C;k++){const a=k/48*6.283,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r);if(ok(x,z))C=[x,z];}"
         "window.__C=C;return{C};")]
# ---- casa de 4 pilares com plataforma, parede e um baú com coisas dentro ----
s += [j("dar({madeira:80,pedra:40,corda:30,tabuas:150,pregos:90,sucata:10,fibra:30});"),
      e("casa", "const r=[poe('pilar',C[0],C[1],0),poe('pilar',C[0]+4.3,C[1]+0.3,0),poe('pilar',C[0]-0.3,C[1]+3.8,Math.PI/2),poe('pilar',C[0]+4.1,C[1]+4.2,-Math.PI/2)].map(q=>q.feito);"
        "const c0=n.cfg.cam;n.cfg.cam='1';vai(C[0]+2,C[1]-0.6,g(C[0]+2,C[1]-0.6));P.yaw=0;P.body=0;P.pitch=0;cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[0,0,1];X('modoObra')(true);O().tipo='plataforma';X('obraAlvo')();X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;"
        "const pl=plat();const pa=poe('paredeCasa',C[0]-0.3,C[1]+2.1,Math.PI/2);const ba=poe('bau',C[0]+6.5,C[1]-2.5,Math.PI/2);const b=ob('bau')[0];if(b)b.itens[0]={id:'pedra',n:5};"
        "return{pilares:r,plat:!!pl,platRel:pl&&[r2(pl.x-C[0]),r2(pl.z-C[1]),r2(pl.y-g(pl.x,pl.z))],parede:pa.feito,bau:ba.feito,bauPos:b&&[r2(b.x-C[0]),r2(b.z-C[1])]};")]
# ---- mira e mover o baú ----
s += [e("miraBau", "const b=ob('bau')[0];vai(b.x-3.2,b.z+0.1,g(b.x-3.2,b.z+0.1));const m=mirar(b,0.35);X('obraAlvo')();"
        "return{achou:m===b,tipo:m&&m.tipo,rotulo:alvoTxt(),mover:bt('o-mover'),desmontar:bt('o-desmontar'),destaque:O().mira===b};"),
      e("moveBau", "const b=ob('bau')[0];window.__b={o:b,id:b.id,x:b.x,z:b.z,hp:b.hp};const t0=conta('tabuas');X('moverAcao')();window.__t0=t0;"
        "return{mov:!!O().mov,foraDoMundo:!X('OB').includes(b),tipo:O().tipo,menu:X('obrasOrdem')(),custo:X('custoObra')('bau'),linha:document.getElementById('item-nome').textContent,botao:bt('o-mover'),rotulo:alvoTxt(),col:!!(b.col&&b.col.cells)};"),
      e("poeBau", "const B=window.__b,b=B.o;const a=olhar(B.x,B.z+2.3);X('colocarObra')();"
        "return{alvo:a,voltou:X('OB').includes(b),mesmoId:b.id===B.id,andou:r2(Math.hypot(b.x-B.x,b.z-B.z)),itens:b.itens[0]&&b.itens[0].id+'x'+b.itens[0].n,hp:b.hp===B.hp,"
        "tabuasGastas:window.__t0-conta('tabuas'),mov:O().mov,col:!!(b.col&&b.col.cells&&b.col.obra===b),noMenu:X('obrasOrdem')().length>1};"),
      j("X('modoObra')(false);"),
      # salvar no meio da mudança grava o lugar de antes; o baú volta quando você desiste
      e("salvaMovendo", "const b=ob('bau')[0];const x0=b.x,z0=b.z;vai(b.x,b.z-3,g(b.x,b.z-3));mirar(b,0.35);X('moverAcao')();const mov=!!O().mov;X('salvarJogo')();"
        "const sv=JSON.parse(localStorage.getItem(X('SAVE_KEY'))||'{}');const L=(sv.obras||[]).filter(q=>q[0]==='bau');X('moverAcao')();"
        "return{mov,salvos:L.length,noLugar:L.some(q=>Math.abs(q[1]-x0)<0.05&&Math.abs(q[2]-z0)<0.05),itensNoSave:L[0]&&L[0][6]&&L[0][6][0]&&L[0][6][0].id,voltou:X('OB').includes(b),mesmoLugar:r2(Math.hypot(b.x-x0,b.z-z0)),movDepois:O().mov};"),
      j("X('modoObra')(false);")]
# ---- mover a parede e desistir (B): volta ao lugar com os colisores ----
s += [e("cancelaParede", "const w=ob('paredeCasa')[0];const x0=w.x,z0=w.z,nc=(w.cols||[w.col]).filter(Boolean).length;vai(C[0]+1.8,C[1]+2.2,g(C[0]+1.8,C[1]+2.2));const m=mirar(w,1.0);"
        "X('moverAcao')();const mov=!!O().mov,sumiu=!X('OB').includes(w);X('modoObra')(false);"
        "return{mirou:m===w,mov,sumiu,voltou:X('OB').includes(w),lugar:r2(Math.hypot(w.x-x0,w.z-z0)),cols:(w.cols||[w.col]).filter(c=>c&&c.cells).length,colsAntes:nc,bloqueia:!!X('pointBlocked')(w.x,w.z,0.2)};"),
      # um dos 4 pilares pode mudar de lugar (o piso continua em cima dos outros 3)
      e("pilarMove", "const p=X('OB').find(o=>o.tipo==='pilar'&&Math.hypot(o.x-C[0],o.z-C[1])<1),x0=p.x,z0=p.z;vai(C[0]-2.6,C[1]-2.6,g(C[0]-2.6,C[1]-2.6));const m=mirar(p,1.2);X('moverAcao')();"
        "const r={mirou:m===p,mov:!!O().mov,noMundo:X('OB').includes(p),piso:!!plat()};X('modoObra')(false);r.voltou=X('OB').includes(p);r.lugar=r2(Math.hypot(p.x-x0,p.z-z0));r.top=r2(p.ext.top-plat().y);return r;")]
# ---- desmontar a parede: dois toques, devolve parte do material ----
s += [e("desmontaParede", "const w=ob('paredeCasa')[0];vai(C[0]+1.8,C[1]+2.2,g(C[0]+1.8,C[1]+2.2));mirar(w,1.0);const esp=X('devolucaoObra')(w),t0=conta('tabuas'),p0=conta('pregos');"
        "X('desmontarAcao')();const r={pend:!!O().desm,rotulo:alvoTxt(),botao:bt('o-desmontar'),aindaLa:X('OB').includes(w)};X('obraAlvo')();X('desmontarAcao')();"
        "Object.assign(r,{sumiu:!X('OB').includes(w),volta:esp,tabuas:conta('tabuas')-t0,pregos:conta('pregos')-p0,msg:ult(),custo:X('OBRAS').paredeCasa.custo,semColisor:!X('COLL').some(c=>c.obra===w)});X('modoObra')(false);return r;"),
      e("desmontaDanificado", "const b=X('criarObra')('barricada',C[0]+30,C[1]+30,0);b.hp=b.hpMax*0.2;const r={volta:X('devolucaoObra')(b),cheia:X('devolucaoObra')(Object.assign({},b,{hp:b.hpMax})),custo:X('OBRAS').barricada.custo};"
        "n.invAdd('kitFerramentas',1);r.comKit=X('devolucaoObra')(Object.assign({},b,{hp:b.hpMax}));X('destruirObraSilenciosa')(b);return r;")]
# ---- piso com baú em cima não sai ----
s += [e("bauNoAlto", "const r=noAlto('bau',0,-0.6,-1.0);const b=ob('bau').find(q=>q.y>g(q.x,q.z)+1);r.noAlto=!!b;return r;"),
      e("platRecusa", "const pl=plat();vai(pl.x+0.4,pl.z-0.3,g(pl.x+0.4,pl.z-0.3));const m=mirar(pl,-0.12);X('desmontarAcao')();const r={mirou:m===pl,tipo:m&&m.tipo,pend:!!O().desm,msg:ult(),noMundo:X('OB').includes(pl)};X('moverAcao')();r.mov=!!O().mov;r.msg2=ult();X('modoObra')(false);return r;")]
# ---- marco da base ----
s += [e("marco", "const r=poe('marcoBase',C[0]-2,C[1]+6.5,0);const m=ob('marcoBase')[0];r.centro=m&&X('baseCentro')().map(v=>r2(v)).join()===[r2(m.x),r2(m.z)].join();"
        "r.sob=m&&[X('sobBase')(m.x+20,m.z),X('sobBase')(m.x+45,m.z),X('sobBase')(F[0],F[2])];r.dist=m&&r2(Math.hypot(m.x-F[0],m.z-F[2]));return r;"),
      e("marco2", "return poe('marcoBase',C[0]-2.2,C[1]+2.4,Math.PI);"),
      e("marcoPainel", "const m=ob('marcoBase')[0];vai(m.x,m.z-1.6,g(m.x,m.z-1.6));P.yaw=0;P.body=0;const a=X('interAtual')();n.alvo=a;window.__ak=a&&a.k;n.interagir(false);return{alvo:window.__ak,txt:a&&X('textoInter')(a)};"),
      ["gwait", 0.9],
      e("marcoPainel2", "const r={modo:G.modo,nome:document.getElementById('es-nome').textContent,acoes:[...document.querySelectorAll('#es-acoes [data-ea]')].map(b=>b.textContent.trim().slice(0,40)),corpo:(document.getElementById('es-corpo')||{textContent:''}).textContent.slice(0,160)};X('fecharEstacao')();return r;"),
      e("marcoMove", "const m=ob('marcoBase')[0],x0=m.x,z0=m.z;vai(m.x+3,m.z,g(m.x+3,m.z));mirar(m,1.0);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyZ'}));const mov=!!O().mov;"
        "const a=olhar(x0-0.4,z0-3.9);X('colocarObra')();const r={mov,alvo:a,andou:r2(Math.hypot(m.x-x0,m.z-z0)),centro:X('baseCentro')().map(v=>r2(v)).join()===[r2(m.x),r2(m.z)].join(),unico:ob('marcoBase').length};X('modoObra')(false);return r;")]
# ---- estabilidade: piso em 4 pilares 100%, sacada em balanço 70%, telhado da casa por cima ----
s += [e("estPiso", "const pl=plat();return{piso:est(pl),pilar:est(ob('pilar')[0]),bau:est(ob('bau').find(b=>b.y>g(b.x,b.z)+1))};"),
      e("sacada", "const r=noAlto('plataforma',0,0,1.8);const ps=ob('plataforma'),s1=ps.find(p=>p!==plat());r.n=ps.length;r.apoio=s1&&s1.apoio;r.real=s1&&est(s1);r.rel=s1&&[r2(s1.x-plat().x),r2(s1.z-plat().z)];return r;"),
      e("telhadoCasa", "const t0=conta('tabuas');const r=noAlto('telhadoCasa',0,0.2,-0.4);const t=ob('telhadoCasa')[0];r.n=t&&t.ext.n;r.est=t&&est(t);r.gastou=t0-conta('tabuas');return r;"),
      e("tiraPilares", "const keep=X('OB').find(o=>o.tipo==='pilar'&&Math.hypot(o.x-C[0],o.z-C[1])<1);for(const p of ob('pilar'))if(p!==keep)X('destruirObra')(p);n.ev('estCache=null');"
        "const pl=plat(),s1=ob('plataforma').find(p=>p!==pl);return{pilares:ob('pilar').length,piso:est(pl),sacada:s1&&est(s1),pisos:ob('plataforma').length,teto:ob('telhadoCasa').length};"),
      e("pilarRecusa", "const p=ob('pilar')[0];vai(C[0]-2.6,C[1]-2.6,g(C[0]-2.6,C[1]-2.6));const m=mirar(p,1.2);X('moverAcao')();"
        "const r={mirou:m===p,mov:!!O().mov,msg:ult(),noMundo:X('OB').includes(p)};X('desmontarAcao')();X('desmontarAcao')();r.desm=X('OB').includes(p);r.msg2=ult();X('modoObra')(false);return r;"),
      e("danoPilar", "const p=ob('pilar')[0];p.hp=p.hpMax*0.1;n.ev('estCache=null');const pl=plat(),s1=ob('plataforma').find(q=>q!==pl);return{piso:est(pl),sacada:s1&&est(s1)};"),
      e("sacada2", "const pl=plat(),s1=ob('plataforma').find(q=>q!==pl);const r=noAlto('plataforma',0,0,1.8,s1);r.pisos=ob('plataforma').length;return r;"),
      e("desaba", "const b=ob('bau').find(q=>q.y>g(q.x,q.z)+1);if(b)b.itens[0]={id:'corda',n:3};const d0=X('DROPS').length;const p=ob('pilar')[0];X('destruirObra')(p);"
        "return{pisos:ob('plataforma').length,teto:ob('telhadoCasa').length,bauAlto:ob('bau').filter(q=>q.y>g(q.x,q.z)+1).length,soltou:X('DROPS').length-d0,pilares:ob('pilar').length};")]
salvar('p177.json', s)

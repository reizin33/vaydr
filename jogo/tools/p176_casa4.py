"""p176: Etapa 16, casa maior (módulo de 4 m e pé-direito de 3 m) montada pelo modo de construção, como o jogador faz:
4 pilares (o primeiro começa a casa nova; os outros encaixam na grade de 4 m), plataforma em cima a 3 m, porta, janela e parede
entre os pilares (colisores do tamanho novo), muro encaixado, escada interna (abre o piso e sobe andando, menos íngreme),
andar de cima (janela, paredes, telhado da plataforma), o fantasma no tamanho novo, peças antigas (sem módulo) seguem com 3 m,
e o módulo fica salvo na peça."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=window.__C,g=(x,z)=>X('ground')(x,z),cam=X('cam'),"
     "poe=(tipo,ax,az,yaw,rot)=>{const c0=n.cfg.cam;n.cfg.cam='1';P.yaw=yaw;P.body=yaw;P.pitch=0;const px=ax-Math.sin(yaw)*3.4,pz=az-Math.cos(yaw)*3.4;vai(px,pz,g(px,pz));"
     "cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];X('modoObra')(true);X('OBRA').tipo=tipo;X('OBRA').rot=rot||0;X('obraAlvo')();const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,x:r2(O.x-C[0]),z:r2(O.z-C[1]),m:O.ext&&O.ext.m||3};"
     "const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "noAlto=(tipo,yaw,dx,dz)=>{const pl=plat();const c0=n.cfg.cam;n.cfg.cam='1';vai(pl.x+(dx||0),pl.z+(dz||0),pl.y);P.yaw=yaw;P.body=yaw;P.pitch=0;cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];"
     "X('modoObra')(true);X('OBRA').tipo=tipo;X('OBRA').rot=0;X('obraAlvo')();const O=X('OBRA'),r={ctx:X('contextoObra')(),ok:O.ok,motivo:O.motivo,m:O.ext&&O.ext.m||3};const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;"
     "const o=X('OB')[X('OB').length-1];if(r.feito&&o.col)r.col=[r2(o.col.hw),r2(o.col.y1-o.col.y0)];X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},plat=()=>X('OB').find(o=>o.tipo==='plataforma'),ob=t=>X('OB').filter(o=>o.tipo===t),"
     "cols=o=>(o.cols||[o.col]).filter(Boolean).map(c=>[r2(c.hw),r2(c.hd),r2(c.y0-o.y),r2(c.y1-o.y)]);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};"
         "n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));"),
      ev("lugar", "const ok=(x,z)=>{if(!X('dentroMapa')(x,z,12))return false;const g0=X('ground')(x,z);for(let i=-2;i<=5;i++)for(let k=-2;k<=5;k++){const px=x+i*1.5,pz=z+k*1.5;"
         "if(Math.abs(X('ground')(px,pz)-g0)>0.8||X('pointBlocked')(px,pz,0.5)||(X('RIO').ok&&X('aguaPerto')(px,pz,1.0)))return false;}return true;};"
         "let C=null;for(let r=16;r<140&&!C;r+=2)for(let k=0;k<48&&!C;k++){const a=k/48*6.283,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r);if(ok(x,z))C=[x,z];}"
         "window.__C=C;return{C};")]
# ---- pilares na grade nova de 4 m ----
s += [j("dar({madeira:60,pedra:20,corda:30,tabuas:140,pregos:90,sucata:10,fibra:20});"),
      e("pilar1", "const r=poe('pilar',C[0],C[1],0);const o=ob('pilar')[0];r.alto=o&&r2(o.ext.top-o.y);r.col=o&&cols(o);r.esc=o&&X('obraEsc')(o).map(r2);return r;"),
      e("pilar2", "return poe('pilar',C[0]+4.3,C[1]+0.3,0);"),
      e("pilar3", "return poe('pilar',C[0]-0.3,C[1]+3.8,Math.PI/2);"),
      e("pilar4", "return poe('pilar',C[0]+4.1,C[1]+4.2,-Math.PI/2);"),
      e("grade", "const ps=ob('pilar');const d=[];for(let i=0;i<ps.length;i++)for(let k=i+1;k<ps.length;k++)d.push(r2(Math.hypot(ps[i].x-ps[k].x,ps[i].z-ps[k].z)));"
        "return{n:ps.length,dist:d.sort((a,b)=>a-b),m:ps.map(o=>o.ext.m||3),alturas:ps.map(o=>r2(o.ext.top-o.y))};")]
# ---- plataforma em cima dos pilares (mirando do chão), fantasma no tamanho novo ----
s += [e("plat", "const c0=n.cfg.cam;n.cfg.cam='1';vai(C[0]+2,C[1]-0.6,g(C[0]+2,C[1]-0.6));P.yaw=0;P.body=0;P.pitch=0;cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[0,0,1];X('modoObra')(true);X('OBRA').tipo='plataforma';X('obraAlvo')();"
        "const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,apoio:O.ext&&O.ext.apoio,m:O.ext&&O.ext.m,dx:r2(O.x-C[0]),dz:r2(O.z-C[1]),altura:r2(O.y-g(O.x,O.z)),fantasma:X('obraEscFantasma')()};X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;"
        "const pl=plat();r.feita=!!pl;r.sup=pl&&pl.sup&&[r2(pl.sup.hw),r2(pl.sup.hd)];r.col=pl&&pl.col?[r2(pl.col.hw),r2(pl.col.y0-pl.y),r2(pl.col.y1-pl.y)]:null;return r;"),
      e("embaixo", "vai(C[0]+2,C[1]+2,g(C[0]+2,C[1]+2));const pl=plat();return{pe:r2(pl.y-P.y),preso:!!X('bloqueadoAlto')(P.x,P.z,0.3,P.y)};")]
# ---- porta, janela, parede e muro encaixados entre os pilares ----
s += [e("porta", "const r=poe('portaMadeira',C[0]+2.1,C[1]-0.3,0);const o=ob('portaMadeira')[0];r.cols=o&&cols(o);r.pos=o&&[r2(o.x-C[0]),r2(o.z-C[1])];return r;"),
      e("janela", "const r=poe('janela',C[0]+4.3,C[1]+1.9,-Math.PI/2);const o=ob('janela')[0];r.cols=o&&cols(o);r.pos=o&&[r2(o.x-C[0]),r2(o.z-C[1])];return r;"),
      e("parede", "const r=poe('paredeCasa',C[0]-0.3,C[1]+2.1,Math.PI/2);const o=ob('paredeCasa')[0];r.col=o&&cols(o);r.pos=o&&[r2(o.x-C[0]),r2(o.z-C[1])];r.tetoPlat=o&&r2(plat().y-0.26-o.y);return r;"),
      e("muro", "const r=poe('muro',C[0]+1.9,C[1]+4.3,Math.PI);const o=ob('muro')[0];r.col=o&&cols(o);r.pos=o&&[r2(o.x-C[0]),r2(o.z-C[1])];return r;")]
# ---- escada interna (dentro da casa, na parede oeste) e subir andando ----
s += [e("escadaInt", "const c0=n.cfg.cam;n.cfg.cam='1';vai(C[0]+2.4,C[1]+2,g(C[0]+2.4,C[1]+2));P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=0;cam.fwd=[-1,0,0];"
        "X('modoObra')(true);X('OBRA').tipo='escadaInterna';X('OBRA').rot=0;X('obraAlvo')();const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,m:O.ext&&O.ext.m};const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;"
        "const q=ob('escadaInterna')[0],pl=plat();r.furo=!!(pl&&pl.furo);r.piso=pl&&pl.sups?pl.sups.length:0;r.lance=q&&q.sups?r2(q.sups[1].hd*2):null;r.altura=q&&r2(q.ext.h);r.inclinacao=q&&r2(Math.atan2(q.ext.h,q.sups[1].hd*2)*57.3);return r;")]
s += [j("const q=ob('escadaInterna')[0],c=Math.cos(q.yaw),sn=Math.sin(q.yaw);const L=q.sups[1].hd*2+q.sups[0].hd*2;const px=q.x+sn*(L+0.35),pz=q.z+c*(L+0.35);vai(px,pz,g(px,pz));P.yaw=q.yaw+Math.PI;P.body=P.yaw;P.pitch=0;window.__turbo=2;"),
      ["gwait", 0.3], ["down", "w"], ["until", "(()=>{const n=__nnc,pl=n.OB.find(o=>o.tipo==='plataforma');return n.P.y>pl.y-0.05;})()", 25], ["up", "w"],
      js("window.__turbo=6;"), ["gwait", 0.4],
      e("subiu", "const pl=plat();return{dy:r2(P.y-pl.y),dentro:X('noRet')(P.x,P.z,pl.x,pl.z,pl.yaw,2.05,2.05,0),vida:Math.round(P.vida)};")]
# ---- andar de cima: janela, paredes e telhado da plataforma ----
s += [e("cima_janela", "return noAlto('janelaAlta',Math.PI/2,-0.4,0);"),
      e("cima_parede_sul", "return noAlto('paredeAlta',Math.PI,0,0.4);"),
      e("cima_parede_norte", "return noAlto('paredeAlta',0,0.5,-0.4);"),
      e("cima_telhado", "const r=noAlto('telhado',0,0.4,0.4);const o=ob('telhado')[0];r.esc=o&&X('obraEsc')(o).map(r2);return r;")]
# ---- telhado da casa: recusa com o telhado pequeno; casa de 2 módulos (mais 2 pilares e outra plataforma) e um telhado só ----
s += [e("tetoRecusa", "const r=noAlto('telhadoCasa',0,0.2,0.2);return r;"),
      j("X('destruirObraSilenciosa')(ob('telhado')[0]);"),
      e("pilar5", "return poe('pilar',C[0]+8.2,C[1]-0.1,0);"),
      e("pilar6", "return poe('pilar',C[0]+8.1,C[1]+3.9,0);"),
      e("plat2", "const c0=n.cfg.cam;n.cfg.cam='1';vai(C[0]+6,C[1]-0.8,g(C[0]+6,C[1]-0.8));P.yaw=0;P.body=0;P.pitch=0;cam.fwd=[0,0,1];X('modoObra')(true);X('OBRA').tipo='plataforma';X('obraAlvo')();"
        "const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,dx:r2(O.x-C[0]),dz:r2(O.z-C[1]),m:O.ext&&O.ext.m};X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;r.n=ob('plataforma').length;return r;"),
      e("tetoCasa", "const t0=conta('tabuas'),f0=conta('fibra');const r=noAlto('telhadoCasa',0,0.3,0.3);const o=ob('telhadoCasa')[0];"
        "if(o)Object.assign(r,{ni:o.ext.ni,nj:o.ext.nj,lado:[r2(o.ext.hw*2),r2(o.ext.hd*2)],acimaPiso:r2(o.y-plat().y),malha:!!o.mesh,estilo:o.ext.estilo,centro:[r2(o.x-C[0]),r2(o.z-C[1])]});r.gastou=[t0-conta('tabuas'),f0-conta('fibra')];return r;"),
      e("tetoSegundo", "return noAlto('telhadoCone',0,0.3,0.3);"),
      e("tetoPainel", "const pl=plat();vai(pl.x+0.3,pl.z+0.3,pl.y);P.yaw=0;P.body=0;const a=X('interAtual')();n.alvo=a;window.__ak=a&&a.k;n.interagir(false);return{alvo:window.__ak,txt:a&&X('textoInter')(a)};"),
      ["gwait", 0.9],
      e("tetoTroca", "const o=ob('telhadoCasa')[0],m0=o.mesh;const b=q=>{const el=document.querySelector('#es-acoes [data-ea='+q+']');if(!el||el.disabled)return'x';el.click();return document.getElementById('es-msg').textContent;};"
        "const r={modo:G.modo,nome:document.getElementById('es-nome').textContent,pontudo:b('e_quatro'),estilo1:o.ext.estilo,palha:b('c_palha'),cor:o.ext.cor,plano:b('e_plano'),estilo2:o.ext.estilo,malhaNova:o.mesh!==m0};X('fecharEstacao')();return r;"),
      e("tetoCobre", "const o=ob('telhadoCasa')[0],pl=plat();return{emCima:X('tetoCobre')(o,pl.x,pl.z,pl.y),noTerreo:X('tetoCobre')(o,pl.x,pl.z,X('ground')(pl.x,pl.z)),fora:X('tetoCobre')(o,pl.x+9,pl.z,pl.y)};")]
# ---- peça antiga (sem módulo) continua com 3 m; o módulo vai para o save ----
s += [e("legado", "const cr=X('criarObra'),x=C[0]+20,z=C[1]+20;const p=cr('pilar',x,z,0,undefined,false,g(x,z),{top:g(x,z)+2.6});const pl=cr('plataforma',x+1.5,z+1.5,0,undefined,false,g(x,z)+2.6,{apoio:'pilar',nivel:0});"
        "const w=cr('paredeCasa',x+1.5,z,0,undefined,false,g(x+1.5,z));return{pilar:cols(p),plat:[r2(pl.sup.hw),r2(pl.sup.hd)],parede:cols(w),esc:X('obraEsc')(pl),k:X('modK')(pl)};"),
      e("salvo", "const L=X('OB').filter(o=>o.ext&&o.ext.m===4).map(o=>o.tipo);const sv=JSON.parse(JSON.stringify(X('OB').map(o=>o.ext||{})));return{com4:L.length,tipos:[...new Set(L)].sort(),noSave:sv.filter(e=>e.m===4).length};")]
salvar('p176.json', s)

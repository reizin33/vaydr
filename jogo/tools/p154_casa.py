"""p154: casa de dois andares (pilares, plataforma em cima dos pilares, paredes encaixadas, porta, janela, escada de madeira,
andar de cima), porta abre/fecha e zumbi arromba, tiro pela janela, baú embaixo da plataforma, salvar/carregar e queda dos pilares."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
FOTOS = os.environ.get('FOTOS','1')=='1'
# C: canto do primeiro pilar (procurado num lugar plano e livre perto da clareira); a casa ocupa C..C+3 em x e z
H = ("const C=window.__C||JSON.parse(localStorage.getItem('__C154')||'null'),g=(x,z)=>X('ground')(x,z),cam=X('cam'),"
     "poe=(tipo,ax,az,yaw,rot)=>{const c0=n.cfg.cam;n.cfg.cam='1';P.yaw=yaw;P.body=yaw;P.pitch=0;const px=ax-Math.sin(yaw)*3.2,pz=az-Math.cos(yaw)*3.2;vai(px,pz,g(px,pz));"
     "cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];X('modoObra')(true);X('OBRA').tipo=tipo;X('OBRA').rot=rot||0;X('obraAlvo')();const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,x:r2(O.x),z:r2(O.z),y:r2(O.y),yaw:r2(O.yaw)};"
     "const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "noAlto=(tipo,yaw,dx,dz)=>{const pl=X('OB').find(o=>o.tipo==='plataforma');const c0=n.cfg.cam;n.cfg.cam='1';vai(pl.x+(dx||0),pl.z+(dz||0),pl.y);P.yaw=yaw;P.body=yaw;P.pitch=0;cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];"
     "X('modoObra')(true);X('OBRA').tipo=tipo;X('OBRA').rot=0;X('obraAlvo')();const O=X('OBRA'),r={ctx:X('contextoObra')(),ok:O.ok,motivo:O.motivo};const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;return r;},"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},tipos=()=>{const m={};for(const o of X('OB'))m[o.tipo]=(m[o.tipo]||0)+1;return m;},"
     "porta=()=>X('OB').find(o=>o.tipo==='portaMadeira'),plat=()=>X('OB').find(o=>o.tipo==='plataforma'),esc=()=>X('OB').find(o=>o.tipo==='escadaMadeira');")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)

s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;"
         "n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));"),
      ev("lugar", "const ok=(x,z)=>{if(!X('dentroMapa')(x,z,10))return false;const g0=X('ground')(x,z);for(let i=-3;i<=4;i++)for(let k=-3;k<=4;k++){const px=x+i*1.5,pz=z+k*1.5;"
         "if(Math.abs(X('ground')(px,pz)-g0)>0.5||X('pointBlocked')(px,pz,0.6)||(X('RIO').ok&&X('aguaPerto')(px,pz,1.5)))return false;}return true;};"
         "let C=null;for(let r=16;r<60&&!C;r+=2)for(let k=0;k<36&&!C;k++){const a=k/36*6.283,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r);if(ok(x,z))C=[x,z];}"
         "window.__C=C;localStorage.setItem('__C154',JSON.stringify(C));"
         "return{C,lim:X('invLimite')(),dBanc:C&&r2(Math.hypot(C[0]-X('BENCH')[0],C[1]-X('BENCH')[1]))};")]
# ---- pilares na grade de 3 m ----
s += [j("dar({madeira:40,pedra:20,corda:20,tabuas:90,pregos:60,sucata:10,fibra:12});"),
      e("pilar1", "const r=poe('pilar',C[0],C[1],0);const o=X('OB').find(q=>q.tipo==='pilar');r.top=o&&r2(o.ext.top-o.y);r.cols=o&&o.cols&&o.cols.length;r.mesh=!!(o&&o.mesh);r.madeira=conta('madeira');r.corda=conta('corda');return r;"),
      e("pilar2", "return poe('pilar',C[0]+3.2,C[1]+0.3,0);"),
      e("pilar3", "return poe('pilar',C[0]-0.3,C[1]+2.8,Math.PI/2);"),
      e("pilar4", "return poe('pilar',C[0]+3.1,C[1]+3.2,-Math.PI/2);"),
      e("grade", "const ps=X('OB').filter(o=>o.tipo==='pilar');const d=[];for(let i=0;i<ps.length;i++)for(let k=i+1;k<ps.length;k++)d.push(r2(Math.hypot(ps[i].x-ps[k].x,ps[i].z-ps[k].z)));"
        "return{n:ps.length,dist:d.sort((a,b)=>a-b),pos:ps.map(o=>[r2(o.x-C[0]),r2(o.z-C[1]),r2(o.ext.top-o.y)]),tops:ps.map(o=>r2(o.ext.top))};"),
      e("pilar_perto", "const r=poe('pilar',C[0]+0.1,C[1]+0.1,0);return r;")]
# ---- plataforma em cima dos pilares (mirando do chão) ----
s += [e("plat_mira", "const c0=n.cfg.cam;n.cfg.cam='1';vai(C[0]+1.5,C[1]-0.5,g(C[0]+1.5,C[1]-0.5));P.yaw=0;P.body=0;P.pitch=0;cam.fwd=[0,0,1];X('modoObra')(true);X('OBRA').tipo='plataforma';X('obraAlvo')();"
        "const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,apoio:O.ext&&O.ext.apoio,dx:r2(O.x-C[0]),dz:r2(O.z-C[1]),altura:r2(O.y-g(O.x,O.z))};X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;"
        "const pl=plat();r.feita=!!pl;r.apoioFeita=pl&&pl.apoio;r.col=pl&&pl.col?[r2(pl.col.y0-pl.y),r2(pl.col.y1-pl.y)]:null;return r;"),
      e("embaixo", "vai(C[0]+1.5,C[1]+1.5,g(C[0]+1.5,C[1]+1.5));return{py:r2(P.y-g(P.x,P.z)),preso:!!X('bloqueadoAlto')(P.x,P.z,0.3,P.y)};")]
# ---- paredes encaixadas entre os pilares: porta ao sul, janela a leste, muros a oeste e ao norte ----
s += [e("porta_poe", "const r=poe('portaMadeira',C[0]+1.7,C[1]-0.2,0);const o=porta();r.cols=o&&o.cols.length;r.dx=o&&r2(o.x-C[0]);r.dz=o&&r2(o.z-C[1]);r.folhaSolida=o&&o.folha.solid;return r;"),
      e("janela_poe", "const r=poe('janela',C[0]+3.3,C[1]+1.3,-Math.PI/2);const o=X('OB').find(q=>q.tipo==='janela');r.dx=o&&r2(o.x-C[0]);r.dz=o&&r2(o.z-C[1]);return r;"),
      e("parede_oeste", "const r=poe('paredeCasa',C[0]-0.2,C[1]+1.6,Math.PI/2);const o=X('OB').find(q=>q.tipo==='paredeCasa');r.col=o&&o.col?[r2(o.col.y0-o.y),r2(o.col.y1-o.y),o.col.hw]:null;return r;"),
      e("muro_norte", "const r=poe('muro',C[0]+1.4,C[1]+3.2,Math.PI);return r;"),
      e("muro_repetido", "return poe('muro',C[0]+1.5,C[1]+3.1,Math.PI);"),
      e("paredes", "return X('OB').filter(o=>['muro','paredeCasa','portaMadeira','janela'].includes(o.tipo)).map(o=>[o.tipo,r2(o.x-C[0]),r2(o.z-C[1]),r2(((o.yaw%Math.PI)+Math.PI)%Math.PI),o.col?[r2(o.col.y0-o.y),r2(o.col.y1-o.y)]:'cols']);")]
# ---- escada de madeira (do chão, ao norte) ----
s += [e("escada_mira", "const c0=n.cfg.cam;n.cfg.cam='1';const px=C[0]+1.5,pz=C[1]+3+3.2;vai(px,pz,g(px,pz));P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;cam.fwd=[0,0,-1];X('modoObra')(true);X('OBRA').tipo='escadaMadeira';X('obraAlvo')();"
        "const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,ext:O.ext,dx:r2(O.x-C[0]),dz:r2(O.z-C[1])};const k=X('OB').length;X('colocarObra')();r.feito=X('OB').length>k;X('modoObra')(false);n.cfg.cam=c0;"
        "const e=esc();r.sups=e&&e.sups&&e.sups.length;r.cols=e&&e.cols&&e.cols.length;r.mesh=!!(e&&e.mesh);return r;"),
      j("const e=esc(),L=e.ext.L,fx=e.x+Math.sin(e.yaw)*(L+0.8),fz=e.z+Math.cos(e.yaw)*(L+0.8);vai(fx,fz,g(fx,fz));P.yaw=e.yaw+Math.PI;P.body=P.yaw;P.pitch=0;window.__turbo=2;"),
      ["gwait", 0.3], ["down", "w"], ["until", "(()=>{const n=__nnc,pl=n.OB.find(o=>o.tipo==='plataforma');return n.P.y>pl.y-0.05&&Math.hypot(n.P.x-pl.x,n.P.z-pl.z)<1.6;})()", 25], ["up", "w"],
      js("window.__turbo=6;"), ["gwait", 0.3],
      e("subiu", "const pl=plat();return{dy:r2(P.y-pl.y),dCentro:r2(Math.hypot(P.x-pl.x,P.z-pl.z)),noChao:P.noChao,vida:Math.round(P.vida)};")]
# ---- andar de cima: janela, paredes, beirada da escada recusada, telhado ----
s += [e("cima_janela", "return noAlto('janelaAlta',-Math.PI/2);"),
      e("cima_parede_leste", "return noAlto('paredeAlta',Math.PI/2);"),
      e("cima_parede_sul", "return noAlto('paredeAlta',Math.PI);"),
      e("cima_beirada_escada", "return noAlto('paredeAlta',0);"),
      e("cima_bancada", "return noAlto('bancadaTrab',Math.PI,0.2,1.2);"),
      e("cima_telhado", "return noAlto('telhado',0);"),
      e("cima_tipos", "return tipos();")]
# ---- baú embaixo da plataforma: quem anda em cima não esbarra ----
s += [e("bau_embaixo", "const r=poe('bau',C[0]+1.0,C[1]+1.7,Math.PI/2);const b=X('OB').find(o=>o.tipo==='bau');if(!b)return r;const pl=plat();vai(b.x,b.z,pl.y);r.bloqueiaEmCima=!!X('bloqueadoAlto')(b.x,b.z,0.3,pl.y);r.bloqueiaEmbaixo=!!X('bloqueadoAlto')(b.x,b.z,0.3,g(b.x,b.z));return r;")]
# ---- porta: E abre e fecha; passa aberta, não passa fechada ----
s += [j("const o=porta();vai(C[0]+1.5,C[1]+1.1,g(C[0]+1.5,C[1]+1.1));P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;"), ["gwait", 0.3],
      e("porta_alvo", "const a=X('interAtual')();return{k:a&&a.k,txt:a?X('textoInter')(a):null};"),
      j("const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(false);usarSolta();})')(a);"), ["gwait", 0.6],
      e("porta_aberta", "const o=porta();return{aberta:o.ext.aberta,folhaSolida:o.folha.solid,abre:r2(o.abre)};"),
      j("window.__turbo=2;"), ["down", "w"], ["gwait", 1.6], ["up", "w"], js("window.__turbo=6;"),
      e("passou", "return{dz:r2(P.z-C[1]),fora:P.z<C[1]-0.3};"),
      j("vai(C[0]+1.5,C[1]-0.9,g(C[0]+1.5,C[1]-0.9));P.yaw=0;P.body=0;"), ["gwait", 0.3],
      e("porta_fora_txt", "const a=X('interAtual')();return{k:a&&a.k,txt:a?X('textoInter')(a):null};"),
      j("const a=X('interAtual')();X('(a=>{alvoInter=a;interagir(false);usarSolta();})')(a);"), ["gwait", 0.6],
      e("porta_fechada", "const o=porta();return{aberta:o.ext.aberta,folhaSolida:o.folha.solid,abre:r2(o.abre)};"),
      j("window.__turbo=2;"), ["down", "w"], ["gwait", 1.6], ["up", "w"], js("window.__turbo=6;"),
      e("barrou", "return{dz:r2(P.z-C[1]),dentro:P.z>C[1]+0.2};")]
# ---- janela: não passa andando, mas o tiro passa pelo vão (e bate no peitoril) ----
s += [j("const jn=X('OB').find(o=>o.tipo==='janela');vai(C[0]+2.2,C[1]+1.5,g(C[0]+2.2,C[1]+1.5));P.yaw=Math.PI/2;P.body=P.yaw;window.__turbo=2;"), ["down", "w"], ["gwait", 1.4], ["up", "w"], js("window.__turbo=6;"),
      e("janela", "const jn=X('OB').find(o=>o.tipo==='janela');return{dx:r2(P.x-C[0]),dentro:P.x<C[0]+2.95,vao:!!X('bloqueiaTiro')(jn.x,jn.y+1.45,jn.z),peitoril:!!X('bloqueiaTiro')(jn.x,jn.y+0.5,jn.z),parede:!!X('bloqueiaTiro')(jn.x+0,jn.y+1.45,jn.z+1.0)};")]
# ---- zumbi arromba a porta fechada (jogador dentro) ----
s += [j("vivo();Z.length=0;vai(C[0]+1.5,C[1]+1.6,g(C[0]+1.5,C[1]+1.6));const z=ZZ('walker',C[0]+1.5,C[1]-5);z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;window.__z=z;window.__hp0=porta().hp;"),
      ["gwait", 14],
      e("zumbi_porta", "const z=window.__z,o=porta();return{st:z.st,obra:z.obra&&z.obra.tipo,dz:r2(z.z-C[1]),hp:o?Math.round(o.hp):null,hp0:Math.round(window.__hp0),vida:Math.round(P.vida)};"),
      j("const o=porta();X('portaAlternar')(o);"), ["gwait", 0.3],
      e("zumbi_porta_aberta", "const z=window.__z;return{st:z.st,obra:z.obra&&z.obra.tipo};"),
      j("Z.length=0;const o=porta();if(o.ext.aberta)X('portaAlternar')(o);vivo();")]
# ---- salvar e carregar: casa volta igual, jogador em cima da plataforma não é tirado de lá ----
s += [j("const pl=plat();vai(pl.x-0.6,pl.z+0.7,pl.y);window.__antes=JSON.stringify(tipos());X('portaAlternar')(porta());"),
      ["gwait", 0.3], js("__nnc.salvarJogo()"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.4],
      e("carregado", "const pl=plat(),o=porta(),e=esc();return{tipos:tipos(),apoio:pl&&pl.apoio,naPlat:pl?r2(P.y-pl.y):null,portaAberta:o&&o.ext.aberta,folhaSolida:o&&o.folha.solid,escada:e&&{sups:e.sups&&e.sups.length,L:e.ext.L,h:e.ext.h},pilarTop:X('OB').filter(q=>q.tipo==='pilar').map(q=>r2(q.ext.top-q.y))};")]
if FOTOS:
    s += foto("800_casa_fora.png", H + "G.hora=10;G.chuva=0;const pl=plat();vai(C[0]-3,C[1]-4,g(C[0]-3,C[1]-4));P.yaw=P.body=0.6;G.camFix={pos:[C[0]-5.5,pl.y+1.2,C[1]-7.5],tgt:[C[0]+1.6,pl.y-0.6,C[1]+1.6],fov:1.0};", 0.6, 4.0)
    s += foto("801_casa_escada.png", H + "G.hora=10;const pl=plat(),e=esc();vai(C[0]+5,C[1]+7,g(C[0]+5,C[1]+7));G.camFix={pos:[C[0]+7.5,pl.y+0.8,C[1]+9.5],tgt:[C[0]+1.5,pl.y-0.6,C[1]+3.5],fov:1.0};", 0.6, 4.0)
    s += foto("802_casa_dentro.png", H + "G.hora=10;const pl=plat();vai(C[0]+1.5,C[1]+2.6,g(C[0]+1.5,C[1]+2.6));G.camFix={pos:[C[0]+2.6,g(C[0]+2.6,C[1]+2.7)+1.6,C[1]+2.7],tgt:[C[0]+1.2,g(C[0]+1.2,C[1])+1.1,C[1]],fov:1.05};", 0.6, 4.0)
    s += foto("803_casa_cima.png", H + "G.hora=10;const pl=plat(),e=esc();vai(e.x+Math.sin(e.yaw)*2.2,e.z+Math.cos(e.yaw)*2.2,pl.y-1.4);G.camFix={pos:[pl.x+1.25,pl.y+1.65,pl.z+1.4],tgt:[pl.x-1.5,pl.y+1.1,pl.z-0.6],fov:1.1};", 0.6, 4.0)
# ---- pilares caem: com um pilar a menos a plataforma fica; sem nenhum, tudo em cima cai ----
s += [j("const ps=X('OB').filter(o=>o.tipo==='pilar');X('destruirObra')(ps[0]);"), ["gwait", 0.3],
      e("um_pilar_a_menos", "return tipos();"),
      j("for(const o of X('OB').filter(o=>o.tipo==='pilar'))X('destruirObra')(o);"), ["gwait", 0.5],
      e("sem_pilar", "return{tipos:tipos(),chao:X('DROPS').length};")]
salvar('p154.json', s)

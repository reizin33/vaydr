"""p173: Etapa 14, cavalos. Espécie nova na fauna (zonas, pelagens, malhas, arreios); receitas da aba Animais travadas até ver um
cavalo; cavalo selvagem foge de quem chega de pé e fica calmo com você agachado com comida; domar pela interação de verdade (segurar
E: 3 maçãs e o cabresto); painel (comida, sela, alforjes, carga); montar tocando E; cavalgar com W (trote) e Shift+W (galope, gasta
fôlego); sem sela não galopa; galope derruba zumbi; zumbi que acerta você montado fere o cavalo; descer com E; assobio chama de longe;
cascos gastos fazem mancar e as ferraduras resolvem; cocho alimenta o cavalo esperando; poste amarra; salvar e carregar; manual;
soltar na natureza."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),"
     "rec=id=>X('RECIPES').find(r=>r.faz===id),est=id=>X('receitaEstado')(rec(id)),H0=()=>X('CAVALOS')[0],"
     "dirLivre=(x,z)=>{let best=0,bl=-1;for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "if(!X('dentroMapa')(px,pz,4)||X('pointBlocked')(px,pz,0.9)||X('salaEm')(px,X('ground')(px,pz)+0.6,pz)||(X('aguaNivel')(px,pz)!==null&&X('aguaProfVeic')(px,pz)>0.4)||Math.abs(X('ground')(px,pz)-X('ground')(x,z))>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;G.chuva=0;n.cfg.cam='3';X(\"barulho=(function(o){return function(x,z,r){(window.__brs=window.__brs||[]).push(Math.round(r*10)/10);return o.apply(this,arguments);};})(barulho)\");")]
# ---- espécie, zonas, malhas, receitas, abas ----
s += [e("especie", "const FA=X('FAUNA').cavalo,Zs=X('ZONAS_FAUNA'),zm=X('ZMESH'),M=X('MESH');return{nome:FA&&FA.nome,tipos:X('FAUNA_TIPOS').includes('cavalo'),zonas:Zs.filter(z=>z.f.cavalo).map(z=>z.id+':'+z.f.cavalo),"
        "malhas:['','T','P','A','M'].map(v=>!!zm['bicho_cavalo'+v]),arreios:[!!M.cavSela,!!M.cavAlforjes,!!M.cavCabresto,!!M.obra.cocho,!!M.obra.posteAmarrar],"
        "receitas:X('RECIPES').filter(r=>r.cat==='animais').map(r=>r.faz),fab:X('FAB_CATS').some(c=>c[0]==='animais'),obraTab:(X('OBRA_CATS').find(c=>c.id==='animais')||{}).t,"
        "tecla:(X('ACOES_TECLA').find(a=>a.id==='assobiar')||{}).pad};"),
      e("travadas", "const a=est('sela'),b=est('feno'),txt=X('desbTexto')(rec('sela'));X('diarioDescobre')('especie','cavalo','Cavalo',3);return{antes:[a,b],texto:txt,depois:[est('sela'),est('feno'),est('cabresto')]};")]
# ---- dois cavalos selvagens nos Campos do Leste: um para a prova de susto, outro para domar ----
s += [j("const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');let c=null;for(let k=0;k<40&&!c;k++){const a=k*0.9,r=k*0.6,x=Zl.x+Math.cos(a)*r,z=Zl.z+Math.sin(a)*r;const d=dirLivre(x,z);if(d.l>=40)c={x,z,a:d.a};}"
        "W.__c=c;const fx=Math.sin(c.a),fz=Math.cos(c.a);for(const b of X('BICHOS').slice())if(Math.hypot(b.x-c.x,b.z-c.z)<90)b.vivo&&X('BICHOS').splice(X('BICHOS').indexOf(b),1);"
        "const h2=X('criarBicho')('cavalo',c.x+fx*8,c.z+fz*8,{zona:'leste'});W.__h2=h2;h2.st='come';h2.t=60;h2.lider=null;"
        "vai(c.x+fx*14,c.z+fz*14);P.agachado=false;P.agK=0;P.yaw=Math.atan2(h2.x-P.x,h2.z-P.z);P.body=P.yaw;W.__d2=Math.hypot(h2.x-P.x,h2.z-P.z);"), ["gwait", 2.5],
      e("dePeFoge", "const h=W.__h2;return{antes:r2(W.__d2),st:h.st,alerta:r2(h.alerta),dist:r2(Math.hypot(h.x-P.x,h.z-P.z)),var:h.var};"),
      j("const B=X('BICHOS'),i=B.indexOf(W.__h2);if(i>=0)B.splice(i,1);const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);const h1=X('criarBicho')('cavalo',c.x+fx*8,c.z+fz*8,{zona:'leste'});W.__h1=h1;h1.st='come';h1.t=60;h1.lider=null;"
        "inv('maca',6);inv('cabresto',1);vai(c.x+fx*14,c.z+fz*14);P.agachado=true;P.agK=1;P.yaw=Math.atan2(h1.x-P.x,h1.z-P.z);P.body=P.yaw;"), ["gwait", 2.5],
      e("agachadoCalmo", "const h=W.__h1;return{st:h.st,alerta:r2(h.alerta),dist:r2(Math.hypot(h.x-P.x,h.z-P.z))};"),
      j("const h=W.__h1;const dx=P.x-h.x,dz=P.z-h.z,l=Math.hypot(dx,dz);vai(h.x+dx/l*2.3,h.z+dz/l*2.3);P.agachado=true;P.agK=1;P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;"), ["gwait", 0.6],
      e("alvoDomar", "const a=X('interAtual')();return{k:a&&a.k,texto:a&&X('textoInter')(a),st:W.__h1.st};")]
# três maçãs na mão (segurar E de verdade) e o cabresto
for i in range(3):
    s += [j("const h=W.__h1;const dx=P.x-h.x,dz=P.z-h.z,l=Math.hypot(dx,dz)||1;if(l>2.6||l<1.6)vai(h.x+dx/l*2.2,h.z+dz/l*2.2);P.agachado=true;P.agK=1;P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;"
            "const a=X('interAtual')();n.alvo=a;W.__ak=a&&a.k;n.interagir(false);"), ["gwait", 2.6],
          e("maca%d" % (i+1), "const h=W.__h1;return{alvo:W.__ak,conf:r2(h.conf||0),macas:conta('maca'),st:h.st,dist:r2(Math.hypot(h.x-P.x,h.z-P.z))};")]
s += [j("const h=W.__h1;const dx=P.x-h.x,dz=P.z-h.z,l=Math.hypot(dx,dz)||1;if(l>2.6||l<1.6)vai(h.x+dx/l*2.2,h.z+dz/l*2.2);P.agachado=true;P.agK=1;P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;"
        "W.__pop=X('faunaEstado')().z.leste.cavalo.n;const a=X('interAtual')();n.alvo=a;W.__txt=a&&X('textoInter')(a);n.interagir(false);"), ["gwait", 3.0],
      e("domado", "const h=W.__h1,L=X('CAVALOS');return{texto:W.__txt,domado:!!h.domado,n:L.length,nome:h.nome,cabresto:conta('cabresto'),pop:[W.__pop,X('faunaEstado')().z.leste.cavalo.n],zona:h.zona,"
        "naLista:X('BICHOS').includes(h),diario:X('diarioD')().ev.slice(-3).map(q=>q.txt)};")]
# ---- painel do cavalo: comida, sela, alforjes e carga ----
s += [j("const h=H0();P.agachado=false;P.agK=0;h.fome=60;inv('feno',3);X('abrirCavalo')(h);W.__p1=document.getElementById('es-nome').textContent+' | '+document.getElementById('es-corpo').textContent.slice(0,160);"
        "X('estAcao')('comer');W.__fome=h.fome;X('estAcao')('poeSela');W.__semSela=document.getElementById('es-msg').textContent;inv('sela',1);inv('alforjes',1);X('estAcao')('poeSela');X('estAcao')('poeAlf');"
        "W.__eq=[h.sela,h.alforjes,conta('sela'),conta('alforjes')];X('estAcao')('carga');inv('pedra',5);const i=P.inv.findIndex(q=>q&&q.id==='pedra');X('bauGuardar')(i);W.__carga=h.carga.filter(Boolean).map(q=>q.id+'x'+q.n);"
        "W.__bauNome=X('bauAberto')&&X('bauAberto').nome;X('fecharMochila')();G.modo='jogo';"),
      e("painel", "return{texto:W.__p1,fomeDepois:W.__fome,semSela:W.__semSela,equip:W.__eq,carga:W.__carga,bau:W.__bauNome};")]
# ---- montar tocando E ----
s += [j("const h=H0(),c=W.__c;h.x=c.x;h.z=c.z;h.yaw=c.a;h.v=0;h.st='come';h.modo='segue';vai(c.x-Math.cos(c.a)*1.4,c.z+Math.sin(c.a)*1.4);P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;"
        "const a=X('interAtual')();n.alvo=a;W.__ka=a&&a.k;W.__ta=a&&X('textoInter')(a);n.interagir(false);X('usarSolta')();W.__hip=[P.ch.s,P.ch.sk&&P.ch.sk.t&&P.ch.sk.t.hip];"), ["gwait", 0.8],
      e("montou", "const h=H0(),a=X('interAtual')();return{alvo:W.__ka,texto:W.__ta,montado:X('P').montado===h,py:r2(P.y-h.y),hip:W.__hip,agora:a&&a.k,txtDesce:a&&X('textoInter')(a)};")]
# ---- cavalgar: trote com W, galope com Shift+W ----
s += [j("const c=W.__c;P.yaw=c.a;P.pitch=-0.1;W.__x0=P.x;W.__z0=P.z;"), ["down", "KeyW"], ["gwait", 3.0],
      e("trote", "const h=H0();return{v:r2(h.v),andou:r2(Math.hypot(P.x-W.__x0,P.z-W.__z0)),juntos:r2(Math.hypot(P.x-h.x,P.z-h.z)),folego:r2(h.folego),pose:[r2(P.ch.r[21]),r2(P.ch.r[24])],corpo:r2(P.body-h.yaw)};"),
      j("W.__x1=P.x;W.__z1=P.z;W.__f1=H0().folego;window.__brs=[];"), ["down", "ShiftLeft"], ["gwait", 3.0],
      e("galope", "const h=H0();return{v:r2(h.v),andou:r2(Math.hypot(P.x-W.__x1,P.z-W.__z1)),folego:[r2(W.__f1),r2(h.folego)],barulho:[...new Set(window.__brs||[])].slice(0,6)};"),
      ["up", "ShiftLeft"], ["up", "KeyW"], ["gwait", 2.0],
      j("const h=H0();h.sela=false;const d=dirLivre(h.x,h.z);P.yaw=d.a;h.yaw=d.a;W.__x2=P.x;W.__z2=P.z;"), ["down", "KeyW"], ["down", "ShiftLeft"], ["gwait", 2.0],
      e("semSela", "const h=H0();return{v:r2(h.v),maxTrote:X('CAV').trote};"), ["up", "ShiftLeft"], ["up", "KeyW"], ["gwait", 1.5], j("H0().sela=true;")]
# ---- galope derruba zumbi; zumbi que acerta o montado fere o cavalo ----
s += [j("const h=H0();const d=dirLivre(h.x,h.z);P.yaw=d.a;W.__da=d;h.yaw=d.a;h.folego=100;"), ["down", "KeyW"], ["down", "ShiftLeft"], ["gwait", 2.2],
      j("const h=H0();const z=ZZ('walker',h.x+Math.sin(h.yaw)*11,h.z+Math.cos(h.yaw)*11);z.st='vaga';W.__z=z;W.__hv=h.v;"), ["gwait", 0.1], j("W.__zhp=W.__z.hp;"), ["gwait", 1.6],
      e("atropelou", "const z=W.__z;return{vCavalo:r2(W.__hv),hp:[r2(W.__zhp),r2(z.hp)],vivo:z.vivo,st:z.st,dirLivre:r2(W.__da.l)};"), ["up", "ShiftLeft"], ["up", "KeyW"], ["gwait", 1.5],
      j("Z.length=0;const h=H0();W.__hhp=h.hp;W.__pv=P.vida;const z=ZZ('walker',P.x+Math.sin(h.yaw+1.57)*1.1,P.z+Math.cos(h.yaw+1.57)*1.1);z.st='caca';W.__z2=z;"), ["gwait", 6.0],
      e("zumbiBate", "const h=H0();return{vidaP:[r2(W.__pv),r2(P.vida)],vidaCavalo:[r2(W.__hhp),r2(h.hp)],montado:!!X('P').montado,zst:W.__z2.st};"),
      j("Z.length=0;P.vida=100;")]
# ---- descer com E ----
s += [j("const a=X('interAtual')();n.alvo=a;W.__kd=a&&a.k;n.interagir(false);"), ["gwait", 0.6],
      e("desceu", "const h=H0();return{alvo:W.__kd,montado:!!X('P').montado,dist:r2(Math.hypot(P.x-h.x,P.z-h.z)),chao:r2(P.y-X('chaoEm')(P.x,P.z,P.y+1))};")]
# ---- assobio chama de longe ----
s += [j("const h=H0();h.modo='fica';h.fx=h.x;h.fz=h.z;h.vinculo=0.2;const d=dirLivre(h.x,h.z);vai(h.x+Math.sin(d.a)*36,h.z+Math.cos(d.a)*36);W.__d0=Math.hypot(P.x-h.x,P.z-h.z);X('assobiar')();W.__cham=h.chamado;"), ["gwait", 14.0],
      e("assobio", "const h=H0();return{antes:r2(W.__d0),chamado:W.__cham,depois:r2(Math.hypot(P.x-h.x,P.z-h.z)),modo:h.modo};")]
# ---- cascos e ferraduras; fome deixa mais lento ----
s += [j("const h=H0();h.casco=20;h.fome=10;W.__k1=X('cavaloVelK')(h);W.__manca=X('cavaloMancando')(h);inv('ferraduras',1);X('abrirCavalo')(h);X('estAcao')('ferrar');W.__ferr=[h.ferr,h.casco,X('cavaloMancando')(h)];"
        "h.fome=95;W.__k2=X('cavaloVelK')(h);h.fome=10;X('fecharEstacao')();"),
      e("cascos", "return{velMancando:r2(W.__k1),manca:W.__manca,ferrado:W.__ferr,velFome:r2(W.__k2)};")]
# ---- cocho e poste ----
s += [j("const h=H0();h.modo='fica';h.fx=h.x;h.fz=h.z;h.fome=70;const co=cria('cocho',h.x+3,h.z+1,0);co.itens[0]={id:'feno',n:4};W.__co=co;"), ["gwait", 12.0],
      e("cocho", "const h=H0(),co=W.__co;return{feno:(co.itens[0]||{n:0}).n,fome:r2(h.fome),dist:r2(Math.hypot(h.x-co.x,h.z-co.z)),texto:X('textoInter')({k:'guarda',o:co})};"),
      j("const h=H0();const pt=cria('posteAmarrar',h.x-2,h.z,0);X('abrirCavalo')(h);X('estAcao')('fica');W.__amarra=[h.modo,r2(Math.hypot(h.fx-pt.x,h.fz-pt.z))];X('fecharEstacao')();"),
      e("poste", "return{amarra:W.__amarra};")]
# ---- salvar e carregar ----
s += [j("const h=H0();h.nome='Teste';const sv=JSON.parse(JSON.stringify(X('V8').salvar.cavalos()));W.__sv=sv;X('V8').carregar.cavalos(sv);"),
      e("salvo", "const L=X('CAVALOS'),h=L[0];return{n:L.length,nome:h&&h.nome,sela:h&&h.sela,alforjes:h&&h.alforjes,carga:h&&h.carga.filter(Boolean).map(q=>q.id+'x'+q.n),domado:h&&h.domado,naLista:X('BICHOS').includes(h),modo:h&&h.modo};")]
# ---- manual ----
s += [e("manual", "X('mnCache=null');const L=X('mnEntradas')(),A=L.filter(q=>q.sec==='animais');return{n:A.length,nomes:A.map(q=>q.nome),guia:!!L.find(q=>q.id==='x:cavalo')};")]
# ---- soltar ----
s += [j("const h=H0();X('abrirCavalo')(h);X('estAcao')('carga');X('fecharMochila')();G.modo='jogo';h.carga.fill(null);X('abrirCavalo')(h);X('estAcao')('tiraAlf');X('estAcao')('tiraSela');X('estAcao')('soltar');X('estAcao')('soltar');W.__solto=h;G.modo='jogo';X('tela')(null);"),
      e("soltou", "const h=W.__solto;return{n:X('CAVALOS').length,domado:!!h.domado,conf:h.conf,sela:conta('sela'),alforjes:conta('alforjes')};")]
salvar('p173.json', s)

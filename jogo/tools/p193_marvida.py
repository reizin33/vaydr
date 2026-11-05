"""p193: Etapa 20, vida no mar e construções: água do mar (não bebe, enche garrafa, ferve e vira sal), peixes do mar (sorteio por
lugar, fundo, estrutura, estação), pescar do cais com a água lá embaixo até pegar um peixe do mar, vara e linha na mão,
caranguejos (aparecem na maré baixa, pega agachado, cozinha), gaivotas e golfinhos, deque no mar, píer emendado,
areia que a maré cobre recusa construção comum, máscara dobra o fôlego, barco e reboque da praia, mapa grande com o mar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const alvo=a=>{window.__a=a;X('alvoInter=window.__a');},usa=a=>{alvo(a);X('interagir')(true);},hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},"
     "beira=(z,o)=>X('marPonto')(z,X('marLinhaD')(z)+(o||0)),obra=(t)=>{X('modoObra')(true);X('OBRA').tipo=t;X('OBRA').rot=0;X('obraAlvo')();const O=X('OBRA');return O;};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.energia=100;};"),
      e("itens", "const I=X('ITEMS'),K=X('COZINHA');return{itens:['aguaMar','caranguejo','caranguejoCozido','mascaraMergulho'].map(k=>!!I[k]),cozinha:K.filter(c=>c.de==='caranguejo'||c.de==='aguaMar').map(c=>c.de+'>'+c.para)};"),
      # água do mar: na beira, olhando para o mar
      j("hora(3,10);P.nada=null;const b=beira(80,3.0);vai(b[0],b[1]);P.yaw=Math.PI/2;P.body=P.yaw;P.sede=50;"), ["gwait", 0.4],
      e("beberMar", "const a=X('interAtual')(),t=a&&X('textoInter')(a);if(a)usa(a);return{alvo:a&&a.k,texto:t&&t.t,sub:t&&t.s,sede:Math.round(P.sede)};"),
      e("encher", "n.invAdd('garrafa',2);const a=X('interAtual')(),t=a&&X('textoInter')(a);if(a)usa(a);return{texto:t&&t.t,aguaMar:conta('aguaMar'),garrafa:conta('garrafa')};"),
      e("ferver", "const s0=conta('sal');X('cozinhar')();return{sal:conta('sal')-s0,garrafa:conta('garrafa'),aguaMar:conta('aguaMar')};"),
      # peixes do mar
      e("peixes", "const PX=X('PEIXES'),mar=Object.keys(PX).filter(k=>PX[k].onde.mar),ps=X('peixeSorteia'),am=(x,z,dia,N)=>{G.dia=dia;const o={};for(let i=0;i<N;i++){const k=ps(x,z);o[k]=(o[k]||0)+1;}return o;};"
        "const raso=am(356,40,3,400),fundo=am(430,40,3,400),naufr=am(375,112,3,400),inverno=am(356,40,24,400);G.dia=3;"
        "return{especies:mar,local:X('peixeLocal')(380,0),lago:X('peixeLocal')(66,104),raso,fundo,naufr,inverno,soMar:Object.keys(raso).every(k=>mar.includes(k))};"),
      # pescar do cais (água lá embaixo): sorteia uma espécie do mar e pega
      j("window.__turbo=1;hora(3,16);P.nada=null;P.mergulho=0;n.invAdd('vara',1);sel('vara');vai(374,-3.4,0.35);P.yaw=Math.PI;P.body=P.yaw;"), ["gwait", 0.4],
      e("pescaCais", "const a=X('interAtual')(),t=a&&X('textoInter')(a);if(a)usa(a);const p=P.pesca;if(p){p.morde=0.05;}return{alvo:a&&a.k,alto:!!(a&&a.o&&a.o.alto),texto:t&&t.t,pescando:!!p,mar:!!(p&&p.mar),dy:p?r2(P.y-p.y):null};"),
      ["gwait", 0.35],
      e("fisgou", "const p=P.pesca;const r={mordeu:!!(p&&p.mordeu),esp:p&&p.esp};if(p&&p.mordeu){alvo({k:'pescaPuxar',o:p});X('interagir')(false);X('usarSolta')();}const R=X('G').peixes||{},PX=X('PEIXES');"
        "r.pegouMar=Object.keys(R).some(k=>PX[k]&&PX[k].onde.mar);r.peixeCru=conta('peixeCru');window.__turbo=6;return r;"),
      e("vara", "P.pesca={x:374,y:X('marNivel')(),z:-10,t:1,morde:99,mordeu:false,janela:0,px:P.x,pz:P.z,mar:true};const pt=X('varaPonta')(),pl=X('MESH').linhaPesca;P.pesca=null;"
        "return{malha:!!X('MESH').arma.vara,linha:!!pl,pontaPerto:r2(Math.hypot(pt[0]-P.x,pt[2]-P.z)),pontaAlta:r2(pt[1]-P.y)};")]
# caranguejos na maré baixa
s += [j("hora(3,8.4);X('CRABS').length=0;const b=beira(70,-4);vai(b[0],b[1]);P.agachado=true;"), ["gwait", 6.0],
      e("caranguejos", "const C=X('CRABS');window.__nc=C.length;return{n:C.length,naAreia:C.every(c=>X('aguaNivel')(c.x,c.z)===null),molhada:C.every(c=>X('costaD')(c.x,c.z)>X('marLinhaD')(c.z)-10.5)};"),
      e("pegaCaranguejo", "const C=X('CRABS');let tent=0;for(let i=0;i<8&&C.length&&conta('caranguejo')<1;i++){const c=C[0];vai(c.x-0.8,c.z,undefined);P.agachado=true;P.vx=P.vz=0;c.st='anda';usa({k:'caranguejo',o:c});tent++;}"
        "const c0=conta('caranguejo');X('cozinhar')();return{tentativas:tent,pegou:c0,cozido:conta('caranguejoCozido')};"),
      e("fogeCorrendo", "const C=X('CRABS');if(!C.length)return{sem:true};const c=C[0];P.agachado=false;vai(c.x-2.5,c.z);return{antes:c.st};"),
      ["gwait", 0.3], e("fogeDepois", "const C=X('CRABS');return{algumFoge:C.some(c=>c.st==='foge')||C.length<window.__nc};"),
      # gaivotas e golfinhos
      j("hora(3,11);vai(345,0);"), ["gwait", 9.0],
      e("gaivotas", "return{n:X('AVES').filter(b=>b.sp==='gaivota').length,altas:X('AVES').filter(b=>b.sp==='gaivota').every(b=>b.y>X('marNivel')()+5)};"),
      e("golfinhos", "let k=0;for(let i=0;i<8&&!X('DELF').length;i++){X('delfT=0');X('golfinhos')(0.016);k++;}const D=X('DELF');return{tentativas:k,n:D.length,longe:D.every(q=>X('costaD')(q.x,q.z)>40),malha:!!X('MESH').golfinho};")]
# construções no mar
s += [j("hora(3,10);X('OB').length;n.invAdd('tabuas',60);n.invAdd('madeira',30);n.invAdd('pregos',60);n.invAdd('sucata',20);n.invAdd('corda',10);n.cfg.cam='1';const b=beira(-60,-1.0);vai(b[0],b[1]);P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.2;"),
      e("dequeMar", "const O=obra('deque'),r={ok:O.ok,motivo:O.motivo,y:r2(O.y),mar:O.ext&&O.ext.mar};const k=X('OB').length;X('colocarObra')();X('modoObra')(false);const d=X('OB')[X('OB').length-1];"
        "r.feito=X('OB').length>k&&d.tipo==='deque';r.alturaMare=r2(d.y-X('MAR_ALTO')());return r;"),
      j("const b=beira(-110,-1.0);vai(b[0],b[1]);P.yaw=Math.PI/2+0.35;P.body=P.yaw;P.pitch=-0.2;"),
      e("pier1", "const O=obra('pier'),r={ok:O.ok,motivo:O.motivo,n:O.ext&&O.ext.n};const k=X('OB').length;X('colocarObra')();X('modoObra')(false);const p=X('OB')[X('OB').length-1];r.feito=X('OB').length>k&&p.tipo==='pier';window.__p1=p;r.sups=p.sups&&p.sups.length;return r;"),
      e("pier2", "const p=window.__p1,ponta=[p.x+Math.sin(p.yaw)*2.4,p.z+Math.cos(p.yaw)*2.4];vai(ponta[0],ponta[1],p.y);P.yaw=p.yaw;P.body=P.yaw;const O=obra('pier'),r={ok:O.ok,motivo:O.motivo,n:O.ext&&O.ext.n,emenda:O.ext&&O.ext.emenda};"
        "const k=X('OB').length;X('colocarObra')();X('modoObra')(false);const q=X('OB')[X('OB').length-1];r.feito=X('OB').length>k&&q.tipo==='pier';r.mesmaAltura=r2(q.y-p.y);r.alinhado=r2(Math.abs(q.yaw-p.yaw));"
        "const f=[q.x+Math.sin(q.yaw)*2.5,q.z+Math.cos(q.yaw)*2.5];r.piso=r2(X('chaoEm')(f[0],f[1],q.y+0.2)-q.y);return r;"),
      j("hora(3,14.8);const p=window.__p1,w=X('localW')(p,1.2+0.55,0);P.mergulho=0;vai(w[0],w[1],X('marNivel')()-1.3);P.yaw=p.yaw-Math.PI/2;P.body=P.yaw;"), ["gwait", 0.5],
      e("subirBorda", "const a=X('interAtual')(),t=a&&X('textoInter')(a);if(a&&a.k==='subirBorda'){window.__a=a;X('alvoInter=window.__a');X('interagir')(true);}return{nada0:true,alvo:a&&a.k,texto:t&&t.t};"),
      ["gwait", 1.5],
      e("subiuBorda", "const p=window.__p1;return{nada:!!P.nada,y:r2(P.y),noPier:Math.abs(P.y-p.y)<0.15};"),
      j("hora(3,10);P.nada=null;"),
      e("areiaMolhada", "const b=beira(32,-3.5);vai(b[0]-3,b[1]);P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.35;const O=obra('barricada'),r={ok:O.ok,motivo:O.motivo,chao:r2(X('ground')(O.x,O.z))};X('modoObra')(false);"
        "vai(338.6,32);P.yaw=Math.PI/2;P.body=P.yaw;const O2=obra('barricada');r.secaOk=O2.ok;r.chao2=r2(X('ground')(O2.x,O2.z));r.motivo2=O2.motivo;X('modoObra')(false);n.cfg.cam='3';return r;"),
      e("folego", "const a=X('folegoMax')();n.invAdd('mascaraMergulho',1);const b=X('folegoMax')();return{sem:a,com:b};"),
      e("praia", "const V=X('VEICS').find(v=>v.id==='barcoPraia'),R=X('REBOQUES').find(r=>r.id==='reboquePorto');return{barco:!!V,naAreia:V&&X('aguaNivel')(V.x,V.z)===null,motor:V&&V.pecas.motor,reboque:!!R,perto:R&&V?r2(Math.hypot(R.x-V.x,R.z-V.z)):null};"),
      e("mapa", "X('abrirMapa')();const c=document.getElementById('mapa-g'),ok=!!c&&c.width>0;X('fecharMapa')();return{ok,x1:X('MAPA_MAR').x1};")]
salvar('p193.json', s, vp=(960, 540))

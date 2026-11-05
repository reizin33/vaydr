"""p229: armas e dano (pedido do Himalaia: "rebalanceamento completo das armas e do sistema de dano").
Roda igual na versão de antes (x_antes.html, feita com o código guardado em patches/antes_armas) e na nova (x.html), para a
tabela de antes e depois. Tudo pelas funções de verdade do jogo:
1. tabela: num campo aberto achado pelo próprio teste, cada arma atira em cada tipo de zumbi (17 tipos) mirando na cabeça, no
   tronco, no braço e na perna, num zumbi novo, até ele morrer (atirar, flechaAcerta, golpeAcerta). Anota o dano do 1º acerto,
   quantos acertos para matar e a região que o jogo detectou (lida em ferirZ). A variação do dano fica fixa no meio (sorteio
   = 0,5) para o número ser sempre o mesmo; espingarda com os 8 bagos no mesmo ponto (o máximo de perto);
2. distância: pistola, espingarda (com a abertura de verdade, média de 20 tiros) e rifle em várias distâncias;
3. precisão: tiros de pistola na cabeça a 15 m sem mirar e mirando; rifle sem e com a luneta;
4. celular: para onde a ajuda de mira manda o tiro;
5. variação: 20 tiros de cada arma no tronco com o sorteio normal;
6. bomba caseira em cada tipo (não mexi; só para a tabela);
7. munição, recarga e mochila pelo fluxo do jogo (atacar/recarregar e o tempo passando), com a besta e o arco atirando de
   verdade (a flecha voa até o zumbi);
8. salvar, recarregar a página e continuar: valores das armas, munição no pente e dano por região depois de carregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *

LIB = r"""
const L={};window.__A=L;L.novo=n.ev("typeof BALANCO!=='undefined'");
for(const k of['cam','ITEMS','ZS','ground','bloqueiaTiro','emPredios','bloqueadoAlto','aguaNivel','criarZ','zCorpo','atirar','flechaAcerta','golpeAcerta','explosao','DROPS','GAS','pointBlocked','DIF','cfg'])L[k]=n.ev(k);
L.Z=n.Z;window.__capt=null;
n.ev("(()=>{const _f=ferirZ;ferirZ=function(z,dmg){if(window.__capt)window.__capt.push({tipo:z.tipo,dmg,h:ZHIT?{k:ZHIT.k,head:ZHIT.head,reg:ZHIT.reg,arma:ZHIT.arma}:null});return _f.apply(this,arguments);};})()");
L.livre=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],D=Math.hypot(dx,dy,dz);for(let t=0.5;t<D;t+=0.5){const k=t/D,x=a[0]+dx*k,y=a[1]+dy*k,z=a[2]+dz*k;
  if(y<L.ground(x,z)+0.03)return false;if(L.bloqueiaTiro(x,y,z))return false;if(L.emPredios(x,z,2)&&L.bloqueadoAlto(x,z,0.02,y-0.3))return false;}return true;};
L.linhaOk=(T,u,d)=>{const S=[T[0]-u[0]*d,0,T[2]-u[2]*d];if(L.aguaNivel(S[0],S[2])!==null||L.pointBlocked(S[0],S[2],0.4))return false;S[1]=L.ground(S[0],S[2]);const o=[S[0],S[1]+1.6,S[2]];
  for(const h of[0.25,0.5,1.2,1.75,2.6,3.8])if(!L.livre(o,[T[0],T[1]+h,T[2]]))return false;return true;};
L.campo=(dists,R)=>{const cx=P.x,cz=P.z;for(let i=0;i<4000;i++){const x=cx+(Math.random()*2-1)*R,z=cz+(Math.random()*2-1)*R;if(L.aguaNivel(x,z)!==null||L.emPredios(x,z,2))continue;const g=L.ground(x,z);
    let ok=true;for(const[a,b]of[[1.5,0],[-1.5,0],[0,1.5],[0,-1.5]])if(Math.abs(L.ground(x+a,z+b)-g)>0.3)ok=false;if(!ok||L.pointBlocked(x,z,1.2))continue;
    for(let k=0;k<8;k++){const an=k*Math.PI/4,u=[Math.sin(an),0,Math.cos(an)];if(dists.every(d=>L.linhaOk([x,g,z],u,d)))return{T:[x,g,z],u,dists};}}return null;};
L.zumbi=(tipo,T,S)=>{L.Z.length=0;L.DROPS.length=0;L.GAS.length=0;const z=L.criarZ(tipo,T[0],T[2],{y:T[1],st:'caca',viu:0,lx:S[0],lz:S[2]});z.ch.vis=true;
  const ya=Math.atan2(S[0]-T[0],S[2]-T[2]),Sd=L.ZS[tipo];z.ch.yaw=(Sd.baixo||Sd.cao)?ya+Math.PI/2:ya;return z;};
L.alvo=(z,reg)=>{const C=L.zCorpo(z),S=L.ZS[z.tipo],sc=z.ch.s||1,ya=z.ch.yaw,rx=Math.cos(ya),rz=-Math.sin(ya);
  const em=u=>[C.a[0]+(C.b[0]-C.a[0])*u,C.a[1]+(C.b[1]-C.a[1])*u,C.a[2]+(C.b[2]-C.a[2])*u];
  if(S.cao)return reg==='cabeca'?em(0.87):reg==='tronco'?em(0.4):null;
  if(S.baixo)return reg==='cabeca'?em(0.9):reg==='tronco'?em(0.55):reg==='pernas'?em(0.15):null;
  const h=reg==='cabeca'?1.66*sc:reg==='pernas'?0.5*sc:1.2*sc,lat=reg==='bracos'?0.8*C.r:0;return[z.x+rx*lat,z.y+h,z.z+rz*lat];};
L.mira=(S,p)=>{const o=[S[0],S[1]+1.6,S[2]],d=[p[0]-o[0],p[1]-o[1],p[2]-o[2]],l=Math.hypot(d[0],d[1],d[2]);for(let i=0;i<3;i++){L.cam.pos[i]=o[i];L.cam.fwd[i]=d[i]/l;}return{o,d:[d[0]/l,d[1]/l,d[2]/l],l};};
L.poe=(C,dist)=>{const S=[C.T[0]-C.u[0]*dist,0,C.T[2]-C.u[2]*dist];S[1]=L.ground(S[0],S[2]);P.x=S[0];P.z=S[2];P.y=S[1];P.vx=P.vz=P.vy=0;P.agK=0;P.agachado=false;return S;};
L.atira=(arma,z,reg,S,slot)=>{const p=L.alvo(z,reg);if(!p)return false;const m=L.mira(S,p),d=L.ITEMS[arma]||{};
  if(d.fogo&&!d.besta){slot.mun=99;L.atirar(slot,d);return true;}
  if(arma==='besta'||arma==='arco'){const f={dano:d.dano,arma,item:arma==='arco'?'flecha':'virote',k:1,x:m.o[0],y:m.o[1],z:m.o[2],t:0};L.flechaAcerta(f,m.o,m.d,m.l+2);return true;}
  P.body=Math.atan2(z.x-P.x,z.z-P.z);const soco=arma==='maos'||arma==='pedra';L.golpeAcerta({arma:soco?null:slot,vertical:arma==='pedra'||!!d.vertical,pedra:arma==='pedra',soco});return true;};
L.medir=(arma,tipo,reg,C,dist,max)=>{const S=L.poe(C,dist);P.aim=1;const z=L.zumbi(tipo,C.T,S);if(!L.alvo(z,reg))return null;const hp0=z.hp,slot={id:arma,mun:99};let n=0,d1=null,zeros=0;const regs={};
  window.__capt=[];while(z.vivo&&n<max){const h=z.hp;L.atira(arma,z,reg,S,slot);n++;const dd=h-z.hp;if(d1===null)d1=dd;if(dd<=0){if(++zeros>=3)break;}else zeros=0;}
  for(const c of window.__capt)if(c.h){const k=c.h.reg||(c.h.head?'cabeca':'corpo');regs[k]=(regs[k]||0)+1;}window.__capt=null;
  return{d1:Math.round(d1*10)/10,tiros:z.vivo?null:n,hp:Math.round(hp0),reg:Object.keys(regs).join('+')};};
L.fixo=f=>{const R=Math.random;Math.random=()=>0.5;try{return f();}finally{Math.random=R;}};
L.semAbertura=on=>{const E=L.ITEMS.espingarda;if(on){L._ab=E.abre;E.abre=0;if(L.novo){const B=n.ev('BALANCO').armas.espingarda;L._ab2=[B.abre,B.abreMira];B.abre=B.abreMira=0;}}
  else{E.abre=L._ab;if(L.novo){const B=n.ev('BALANCO').armas.espingarda;B.abre=L._ab2[0];B.abreMira=L._ab2[1];}}};
"""
DIST = {'pistola': 8, 'espingarda': 3, 'rifle': 8, 'besta': 8, 'arco': 8}
BRANCAS = ['maos', 'pedra', 'facaPedra', 'faca', 'porrete', 'peDeCabra', 'machadoPedra', 'facaCaca', 'picareta', 'lanca', 'taco', 'machado', 'tacoCravado', 'facao']

s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.P.vida=100;__nnc.P.fome=100;__nnc.P.sede=100;};G.hora=11;n.cfg.cam='3';" + LIB +
         "L.C=L.campo([1.2,3,8,15],260);L.C2=L.campo([8,20,30,45],320);L.C3=L.campo([60,100],420);window.__tab={};"),
      ev("valores", "const L=window.__A;return{novo:L.novo,campo:L.C&&{T:L.C.T.map(r2),u:L.C.u.map(r2)},campo2:!!L.C2,campo3:!!L.C3,"
         "armas:Object.fromEntries(['pistola','espingarda','rifle','besta','arco'].map(k=>[k,{dano:L.ITEMS[k].dano,chumbo:L.ITEMS[k].chumbo,pente:L.ITEMS[k].pente,tempo:L.ITEMS[k].tempo,recarga:L.ITEMS[k].recarga,abre:L.ITEMS[k].abre}])),"
         "brancas:Object.fromEntries(" + str(BRANCAS[2:]) + ".map(k=>[k,[L.ITEMS[k].dano,L.ITEMS[k].tempo,L.ITEMS[k].alcance]])),"
         "zumbis:Object.fromEntries(Object.keys(L.ZS).map(t=>[t,L.ZS[t].hp])),dif:L.DIF[n.cfg.dif],difNome:n.cfg.dif};")]
# 1) tabela: cada arma × cada zumbi × cada região
for arma, d in DIST.items():
    s += [js("const L=window.__A;if(!L.C)return;L.semAbertura(true);try{L.fixo(()=>{const r={};for(const t of Object.keys(L.ZS)){r[t]={};for(const g of['cabeca','tronco','bracos','pernas'])r[t][g]=L.medir('" + arma + "',t,g,L.C," + str(d) + ",400);}window.__tab['" + arma + "']=r;});}finally{L.semAbertura(false);}")]
s += [js("const L=window.__A;if(!L.C)return;L.fixo(()=>{for(const a of " + str(BRANCAS) + "){const r={};for(const t of Object.keys(L.ZS))r[t]={golpe:L.medir(a,t,'tronco',L.C,1.2,400)};window.__tab[a]=r;}});")]
s += [ev("tabela", "return window.__tab;")]
# 2) distância
s += [js("const L=window.__A;const r={};window.__dist=r;"
         "if(L.C2){L.fixo(()=>{for(const d of[8,20,30,45]){r['pistola_'+d]=L.medir('pistola','walker','tronco',L.C2,d,1).d1;r['rifle_'+d]=L.medir('rifle','walker','tronco',L.C2,d,1).d1;}});"
         "for(const d of[3,8,20,30]){let t=0,ac=0;const N=20;for(let i=0;i<N;i++){const m=L.medir('espingarda','walker','tronco',L.C2.dists.includes(d)?L.C2:L.C,d<8?3:d,1);t+=Math.max(0,m.d1);if(m.d1>0)ac++;}r['espingarda_'+d]={media:Math.round(t/N*10)/10,acertou:ac+'/'+N};}}"
         "if(L.C3){L.fixo(()=>{for(const d of[60,100])r['rifle_'+d]=L.medir('rifle','walker','tronco',L.C3,d,1).d1;r['pistola_60']=L.medir('pistola','walker','tronco',L.C3,60,1).d1;});}"),
      ev("distancia", "return window.__dist;")]
# 3) precisão (sorteio normal): cabeça a 15 m
s += [js("const L=window.__A;const r={};window.__prec=r;if(!L.C)return;const tiro=(arma,aim,N)=>{let cab=0,corpo=0,erro=0;for(let i=0;i<N;i++){const S=L.poe(L.C,15);const z=L.zumbi('walker',L.C.T,S);P.aim=aim;"
         "window.__capt=[];L.atira(arma,z,'cabeca',S,{id:arma,mun:9});const c=window.__capt[0];window.__capt=null;if(!c)erro++;else if(c.h&&c.h.head)cab++;else corpo++;}return{cabeca:cab,corpo:corpo,errou:erro};};"
         "r.pistolaSemMirar=tiro('pistola',0,60);r.pistolaMirando=tiro('pistola',1,60);r.rifleSemLuneta=tiro('rifle',0,40);r.rifleMirando=tiro('rifle',1,40);P.aim=0;"),
      ev("precisao", "return window.__prec;")]
# 4) celular: a ajuda de mira
s += [js("const L=window.__A;const r={};window.__cel=r;if(!L.C)return;const t0=n.cfg.tela;n.cfg.tela='celular';"
         "try{L.fixo(()=>{const caso=(nome,f)=>{const S=L.poe(L.C,10);const z=L.zumbi('walker',L.C.T,S);P.aim=1;const p=f(z);L.mira(S,p);const h=z.hp;window.__capt=[];L.atirar({id:'pistola',mun:9},L.ITEMS.pistola);"
         "const c=window.__capt[0];window.__capt=null;r[nome]={dano:Math.round((h-z.hp)*10)/10,regiao:c&&c.h?(c.h.reg||(c.h.head?'cabeca':'corpo')):'errou',morreu:!z.vivo};};"
         "caso('miraAoLadoDoPeito',z=>{const p=L.alvo(z,'tronco'),ya=z.ch.yaw;return[p[0]+Math.cos(ya)*0.75,p[1],p[2]-Math.sin(ya)*0.75];});"
         "caso('miraNaPerna',z=>L.alvo(z,'pernas'));caso('miraNoBraco',z=>L.alvo(z,'bracos'));caso('miraNaCabeca',z=>L.alvo(z,'cabeca'));});}finally{n.cfg.tela=t0;}"),
      ev("celular", "return window.__cel;")]
# 5) variação: 20 tiros no tronco com o sorteio normal
s += [js("const L=window.__A;const r={};window.__var=r;if(!L.C)return;for(const[a,d]of[['pistola',8],['espingarda',3],['rifle',8],['besta',8],['arco',8],['facao',1.2],['machado',1.2]]){const v=[];"
         "for(let i=0;i<20;i++){const m=L.medir(a,'walker','tronco',L.C,d,1);if(m&&m.d1>0)v.push(m.d1);}r[a]={min:Math.min(...v),max:Math.max(...v),n:v.length};}"),
      ev("variacao", "return window.__var;")]
# 6) bomba caseira a 1 m de cada tipo
s += [js("const L=window.__A;const r={};window.__bomba=r;if(!L.C)return;L.fixo(()=>{for(const t of Object.keys(L.ZS)){const S=L.poe(L.C,8);const z=L.zumbi(t,L.C.T,S);const h=z.hp;"
         "L.explosao(L.C.T[0]+1,L.C.T[1],L.C.T[2],5.2,170);r[t]=Math.round((h-z.hp)*10)/10;}});L.Z.length=0;L.DROPS.length=0;"),
      ev("bomba", "return window.__bomba;")]
# 7) munição, recarga e mochila pelo fluxo do jogo (1ª pessoa para a mira da câmera ser a do teste)
DAR = ("const dar=(id,n,ex)=>{const k=P.inv.findIndex(q=>!q);P.inv[k]=Object.assign({id,n},ex||{});return P.inv[k];};P.inv.fill(null);"
       "dar('pistola',1,{mun:3});dar('espingarda',1,{mun:0});dar('rifle',1,{mun:0});dar('besta',1,{mun:0});dar('arco',1,{dur:140});"
       "dar('municao9',10);dar('cartucho',3);dar('balaRifle',7);dar('virote',4);dar('flecha',5);")
EST = ("const est=()=>({pente:Object.fromEntries(P.inv.filter(q=>q&&X('ITEMS')[q.id].fogo).map(q=>[q.id,q.mun])),mochila:Object.fromEntries(['municao9','cartucho','balaRifle','virote','flecha'].map(k=>[k,conta(k)])),"
       "slots:P.inv.slice(0,10).map(q=>q?q.id:'-').join(',')});")
s += [js("const L=window.__A;n.cfg.cam='1';Z.length=0;" + DAR + "sel('pistola');P.acao=null;P.cd=0;P.aim=0;const S=L.poe(L.C,10);window.__f={S};window.__fl={};" + EST + "window.__fl.inicio=est();"),
      ["gwait", 0.3]]
for i in range(3):
    s += [js("P.acao=null;P.cd=0;X('atacar')();"), ["gwait", 0.45]]
s += [js(EST + "window.__fl.depois3tiros=est();P.acao=null;P.cd=0;X('atacar')();window.__fl.acaoSemBala=P.acao&&P.acao.tipo;"), ["gwait", 1.8],
      js(EST + "window.__fl.pistolaRecarregada=est();sel('espingarda');P.acao=null;P.cd=0;X('recarregar')();window.__fl.recEsp=P.acao&&Math.round(P.acao.dur*100)/100;"), ["gwait", 2.1],
      js(EST + "window.__fl.espingardaRecarregada=est();P.acao=null;P.cd=0;X('atacar')();"), ["gwait", 1.1],
      js(EST + "window.__fl.espingardaAtirou=est();sel('rifle');P.acao=null;P.cd=0;X('recarregar')();window.__fl.recRifle=P.acao&&P.acao.dur;"), ["gwait", 2.4],
      js(EST + "window.__fl.rifleRecarregado=est();sel('besta');P.acao=null;P.cd=0;X('recarregar')();window.__fl.recBesta=P.acao&&P.acao.dur;"), ["gwait", 1.9],
      # besta de verdade: walker parado (tonto) a 10 m, mira no peito; o virote voa
      js(EST + "const L=window.__A;window.__fl.bestaArmada=est();const S=window.__f.S;const z=L.zumbi('walker',L.C.T,S);z.st='atordoado';z.t=60;window.__fz=z;window.__fh=z.hp;const p=L.alvo(z,'tronco');mira(p[0],p[1],p[2]);"), ["gwait", 0.15],
      js("P.acao=null;P.cd=0;X('atacar')();window.__fl.virotesVoando=X('FLECHAS').filter(f=>f.voa).length;"), ["gwait", 0.8],
      js(EST + "const z=window.__fz;window.__fl.besta={dano:Math.round((window.__fh-z.hp)*10)/10,vivo:z.vivo,estado:est()};"),
      # arco: segura 1 s (corda toda) e solta
      js("const L=window.__A;sel('arco');const S=window.__f.S;const z=L.zumbi('walker',L.C.T,S);z.st='atordoado';z.t=60;window.__fz=z;window.__fh=z.hp;const p=L.alvo(z,'tronco');mira(p[0],p[1],p[2]);"), ["gwait", 0.15],
      js("P.acao=null;P.cd=0;X('IN').attack=true;X('atacar')();"), ["gwait", 1.0],
      js("X('IN').attack=false;"), ["gwait", 1.0],
      js(EST + "const z=window.__fz;window.__fl.arco={dano:Math.round((window.__fh-z.hp)*10)/10,vivo:z.vivo,estado:est()};n.cfg.cam='3';"),
      ev("fluxo", "return window.__fl;")]
# 8) salvar, recarregar a página, continuar
s += [js("Z.length=0;const q=P.inv.find(q=>q&&q.id==='pistola');q.mun=5;sel('pistola');sessionStorage.setItem('__antes',JSON.stringify({mun:5,bala:conta('municao9')}));X('salvarJogo')();"),
      ["js", "window.__semRender=true;"], ["wait", 1.0], ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.5],
      js("vivo();window.__cadaPasso=()=>{__nnc.P.vida=100;};" + LIB + "L.C=L.campo([8],260);"),
      ev("carregou", "const L=window.__A,a=JSON.parse(sessionStorage.getItem('__antes')||'{}'),q=P.inv.find(q=>q&&q.id==='pistola');"
         "const m=L.C?L.fixo(()=>({cabeca:L.medir('pistola','walker','cabeca',L.C,8,1),tronco:L.medir('pistola','walker','tronco',L.C,8,1),perna:L.medir('pistola','walker','pernas',L.C,8,1),"
         "runnerHp:L.zumbi('runner',L.C.T,L.poe(L.C,8)).hp})):null;L.Z.length=0;"
         "return{modo:G.modo,novo:L.novo,pistolaDano:L.ITEMS.pistola.dano,rifleDano:L.ITEMS.rifle.dano,pente:q&&q.mun,penteAntes:a.mun,balas:conta('municao9'),balasAntes:a.bala,tiros:m};")]
# foto: a ficha das armas na mochila (só a versão nova muda)
FOTO = ("const L=window.__A;G.modo='jogo';n.cfg.cam='3';Z.length=0;P.inv.fill(null);const k=P.inv.findIndex(q=>!q);P.inv[0]={id:'pistola',n:1,mun:8};P.inv[1]={id:'espingarda',n:1,mun:5};"
        "P.inv[2]={id:'rifle',n:1,mun:5};P.inv[3]={id:'facao',n:1,dur:200};X('selecionar')(0);X('abrirMochila')('mochila');n.ev('invSel=%d');X('invRender')();")
s += foto("229_ficha_pistola.png", FOTO % 0)
s += [js("X('fecharMochila')&&X('fecharMochila')();G.modo='jogo';")]
s += foto("229_ficha_espingarda.png", FOTO % 1)
s += [js("X('fecharMochila')&&X('fecharMochila')();G.modo='jogo';")]
salvar('tools/p229_novo.json', s, vp=(1280, 720))
salvar('tools/p229_antes.json', s, vp=(1280, 720))

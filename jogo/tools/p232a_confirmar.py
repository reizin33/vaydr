"""p232a (Parte 1, teste geral): confere os itens que ficaram 'a confirmar' na auditoria de 05/11.
1 Campos do Leste: por que cada espécie é recusada nos pontos da região e quantos bichos de cada tipo aparecem de verdade.
2 Cabine entre duas árvores: plataformas encadeadas do galho de uma gigante até a vizinha (apoio de cada uma).
3 Construir dentro do vagão-abrigo e da bilheteria da estação: o que o menu oferece e o que o jogo aceita lá dentro.
4 Fios da superfície para o subsolo: gerador em cima, lâmpada numa sala do subsolo, fio ligado e energia chegando."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=34;")
s += [js("vivo();window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;P.fome=100;P.sede=100;};")]

# ---------- 1 Campos do Leste ----------
s += [ev("leste_razoes", """
const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste'),FA=X('FAUNA'),res={};
const dm=X('dentroMapa'),dc=X('dentroCidade'),re=X('ruralEm'),RIO=X('RIO'),ap=X('aguaPerto'),apo=X('aguaPoi'),pb=X('pointBlocked'),OB=X('OB'),PL=X('PLACES'),den=X('densidadeMata');
for(const sp in Zl.f){const S=FA[sp],c={};let okR=0,okL=0;
 for(let i=0;i<400;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*Zl.r,x=Zl.x+Math.cos(a)*r,z=Zl.z+Math.sin(a)*r;let m='';
  if(!dm(x,z,5))m='foraDoMapa';else if(dc(x,z,25))m='cidade';else if(re(x,z,2))m='rural';else if(RIO.ok&&ap(x,z,1.5))m='agua';
  else if(typeof apo==='function'&&apo(x,z))m='aguaPoi';else if(pb(x,z,S.r+0.4))m='bloqueado';else if(Math.hypot(x-F[0],z-F[2])<26)m='fogueira';
  else if(OB.some(o=>Math.hypot(o.x-x,o.z-z)<16))m='obra';else{const p=PL.find(p=>p.id!=='fazenda'&&Math.hypot(x-p.x,z-p.z)<p.r+4);if(p)m='lugar:'+p.id;}
  if(!m){okL++;const d=den(x,z);if((sp==='javali'||sp==='onca'||sp==='urso'||sp==='lobo')&&d<2)m='rigorMata';else if((sp==='vaca'||sp==='ovelha')&&d>2)m='rigorPasto';else okR++;}
  if(m)c[m]=(c[m]||0)+1;}
 res[sp]={okRigor:okR,okLeve:okL,recusas:c};}
return{zona:{x:Zl.x,z:Zl.z,r:Zl.r,f:Zl.f},res};""")]
s += [js("const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste'),B=X('BICHOS'),Fa=X('faunaEstado')();for(const sp in Zl.f)Fa.z.leste[sp]={n:Zl.f[sp],rec:0};"
         "B.length=0;vai(Zl.x-48,Zl.z);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=0;"), ["gwait", 0.4]]
s += [ev("leste_aparecem", """
const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste'),B=X('BICHOS'),Fa=X('faunaEstado')();
for(let k=0;k<8;k++)X('faunaMaterializar')();
const c={};for(const b of B)if(b.vivo&&b.zona==='leste')c[b.tipo]=(c[b.tipo]||0)+1;
return{contagem:c,populacao:JSON.parse(JSON.stringify(Fa.z.leste)),falhas:Zl.falhas||0,ativos:B.filter(b=>b.vivo).length};""")]
s += [js("const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste'),B=X('BICHOS');B.length=0;vai(Zl.x-22,Zl.z+4);P.yaw=Math.PI;P.body=P.yaw;"
         "for(let i=0;i<34;i++){const a=i*0.18,x=P.x-125+Math.cos(a)*6,z=P.z+Math.sin(a)*6;X('criarBicho')('cervo',x,z,{zona:'norte'});}"), ["gwait", 0.3],
      js("const c=X('cam');c.fwd=[-1,0,0];c.pos=[P.x+2,P.y+1.6,P.z];")]
s += [ev("leste_limiteCheio", """
const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste'),B=X('BICHOS'),Fa=X('faunaEstado')();for(const sp in Zl.f)Fa.z.leste[sp]={n:Zl.f[sp],rec:0};
const antes=B.filter(b=>b.vivo).length;for(let k=0;k<8;k++)X('faunaMaterializar')();
const c={};for(const b of B)if(b.vivo&&b.zona==='leste')c[b.tipo]=(c[b.tipo]||0)+1;
return{antes,contagem:c,ativos:B.filter(b=>b.vivo).length,deOutraRegiao:B.filter(b=>b.vivo&&b.zona==='norte').length};""")]
s += [["gwait", 20]]
s += [ev("leste_depois", """
const B=X('BICHOS'),c={};for(const b of B)if(b.vivo&&b.zona==='leste')c[b.tipo]=(c[b.tipo]||0)+1;
const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');return{contagem:c,dentro:B.filter(b=>b.vivo&&b.zona==='leste'&&Math.hypot(b.x-Zl.x,b.z-Zl.z)<Zl.r+8).length};""")]

# ---------- 2 Cabine entre duas árvores ----------
s += [js("for(const[k,q]of[['tabuas',200],['corda',60],['pregos',80],['fibra',40]])X('invAdd')(k,q);X('BICHOS').length=0;")]
s += [ev("cabine", """
const G2=n.GIGANTES,gE=(b,t)=>[b.ax+(b.bx-b.ax)*t,b.ay+(b.by-b.ay)*t+(b.r0+(b.r1-b.r0)*t)*0.95,b.az+(b.bz-b.az)*t],tg=X('topoGalho'),noRet=X('noRet');
let best=null,bs=1e9;
for(const A of G2)for(const B of G2){if(A===B)continue;if(Math.hypot(A.x-B.x,A.z-B.z)>34)continue;
 for(const ka of A.galhos)for(let ta=0.55;ta<=0.96;ta+=0.1)for(const kb of B.galhos)for(let tb=0.35;tb<=0.96;tb+=0.1){const p=gE(ka,ta),q=gE(kb,tb),d=Math.hypot(p[0]-q[0],p[2]-q[2]),dy=Math.abs(p[1]-q[1]);
  if(d<5||d>10||dy>0.6)continue;const sc=dy*3+Math.abs(d-7)*0.3;if(sc<bs){bs=sc;best={A,B,p,q,d,dy};}}}
if(!best)return{par:null,gigantes:G2.length};
const {A,B,p,q}=best,yaw=Math.atan2(q[0]-p[0],q[2]-p[2]),cad=[];
const quem=o=>{const r=[];const k=(o.ext&&o.ext.k)||1,h=1.5*k;for(const T of[A,B]){let ok=false;if(o.y>T.y+2.2&&o.y<T.y+T.H*0.8&&noRet(T.x,T.z,o.x,o.z,o.yaw,h,h,T.R*0.85))ok=true;
  for(const b of T.galhos){if(ok)break;for(let t=0;t<=1.001;t+=0.08){const gx=b.ax+(b.bx-b.ax)*t,gz=b.az+(b.bz-b.az)*t,gy=tg(b,t);if(noRet(gx,gz,o.x,o.z,o.yaw,h,h,0.25)&&o.y-gy>-0.3&&o.y-gy<1.1){ok=true;break;}}}
  if(ok)r.push(T===A?'A':'B');}return r.join('+')||'-';};
P.x=p[0];P.z=p[2];P.y=p[1]+0.02;P.vy=0;P.yaw=yaw;P.body=yaw;P.escala=null;n.modoObra(true);n.OBRA.rot=0;
for(let i=0;i<4;i++){
 if(i>0){const u=n.OB.filter(o=>o.tipo==='plataforma').pop();P.x=u.x;P.z=u.z;P.y=u.y+0.05;const yy=Math.atan2(q[0]-u.x,q[2]-u.z);P.yaw=yy;P.body=yy;}
 n.OBRA.tipo='plataforma';n.obraAlvo();const O=n.OBRA,r={ok:!!O.ok,motivo:O.motivo||'',apoio:O.ext&&O.ext.apoio,nivel:O.ext&&O.ext.nivel,dQ:+Math.hypot(O.x-q[0],O.z-q[2]).toFixed(1)};
 if(!O.ok){cad.push(r);break;}const antes=n.OB.length;n.colocarObra();const o=n.OB[n.OB.length-1];r.feita=n.OB.length>antes;if(o&&o.tipo==='plataforma')r.seguradaPor=quem(o);
 cad.push(r);if(r.dQ<1.6)break;}
n.modoObra(false);
const ps=n.OB.filter(o=>o.tipo==='plataforma'),todos=new Set(ps.map(quem).join('+').split('+').filter(x=>x&&x!=='-'));
return{par:{dTroncos:+Math.hypot(A.x-B.x,A.z-B.z).toFixed(1),dGalhos:+best.d.toFixed(1),dy:+best.dy.toFixed(2)},cadeia:cad,plataformas:ps.length,arvoresQueSeguram:[...todos].sort().join('+')};""")]
s += [ev("cabine_telhado", """
const ps=n.OB.filter(o=>o.tipo==='plataforma');if(!ps.length)return null;const r={};const m=ps[Math.floor(ps.length/2)];
P.x=m.x;P.z=m.z;P.y=m.y+0.05;n.modoObra(true);n.OBRA.tipo='telhado';n.obraAlvo();r.telhado=n.OBRA.ok?'ok':n.OBRA.motivo;n.colocarObra();
n.OBRA.tipo='paredeAlta';P.yaw=m.yaw+Math.PI/2;n.obraAlvo();r.parede=n.OBRA.ok?'ok':n.OBRA.motivo;n.colocarObra();n.modoObra(false);
r.instaveis=X('revalidarPlats')().length;return r;""")]

# ---------- 3 Vagão-abrigo e bilheteria da estação ----------
s += [js("P.inv.fill(null);for(const[k,q]of[['tabuas',40],['pregos',30],['madeira',30],['pedra',30],['sucata',30],['corda',20],['fibra',20],['graveto',20],['pano',10],['fio',20]])X('invAdd')(k,q);")]
s += [ev("vagao", """
const T=X('FERRO').trem,x=(T.pass[0]+T.pass[1])/2,z=T.z,g=n.ground(x,z),y=n.chaoEm(x,z,g+2.6),r={piso:+(y-g).toFixed(2)};
P.x=x;P.z=z;P.y=y+0.02;P.vy=0;P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.2;
n.modoObra(true);r.contexto=X('contextoObra')();r.menu=n.obrasVisiveis().slice();r.tenta={};
for(const t of r.menu){n.OBRA.tipo=t;n.OBRA.rot=0;n.obraAlvo();r.tenta[t]=n.OBRA.ok?'ok':(n.OBRA.motivo||'nao');}
n.modoObra(false);return r;""")]
s += [ev("estacao", """
const E=X('FERRO').est,x=E.x,z=E.z,g=n.ground(x,z),y=n.chaoEm(x,z,g+1.6),r={piso:+(y-g).toFixed(2)};
P.x=x;P.z=z;P.y=y+0.02;P.vy=0;P.yaw=0;P.body=0;P.pitch=-0.2;
n.modoObra(true);r.contexto=X('contextoObra')();r.menu=n.obrasVisiveis().slice();r.tenta={};
for(const t of r.menu){n.OBRA.tipo=t;n.OBRA.rot=0;n.obraAlvo();r.tenta[t]=n.OBRA.ok?'ok':(n.OBRA.motivo||'nao');}
n.modoObra(false);return r;""")]

# ---------- 4 Fios da superfície para o subsolo ----------
s += [js("P.inv.fill(null);for(const[k,q]of[['tabuas',30],['sucata',40],['fio',30],['pregos',20],['pano',10],['gasolina',4],['corda',10]])X('invAdd')(k,q);"
         "if(X('ITEMS').alicate)X('invAdd')('alicate',1);")]
s += [ev("fios_sub", """
const S=X('SUB'),r={};
const salas=S.salas.filter(s=>!s.rocha).sort((a,b)=>(b.x1-b.x0)*(b.z1-b.z0)-(a.x1-a.x0)*(a.z1-a.z0)),sala=salas[0];r.sala=sala.nome;r.tamanho=[+(sala.x1-sala.x0).toFixed(1),+(sala.z1-sala.z0).toFixed(1)];
P.x=sala.x;P.z=sala.z;P.y=sala.y+0.02;P.vy=0;P.yaw=0;P.body=0;P.pitch=-0.5;n.modoObra(true);r.contexto=X('contextoObra')();r.menuEletrico=n.obrasVisiveis().filter(t=>X('ELET')[t]);
let lamp=null;r.tentativas={};for(const t of['luminaria','lamparina','lampParede','interruptor']){if(lamp)break;n.OBRA.tipo=t;n.OBRA.rot=0;n.obraAlvo();r.tentativas[t]=n.OBRA.ok?'ok':(n.OBRA.motivo||'nao:'+JSON.stringify({x:n.OBRA.x,y:n.OBRA.y}).slice(0,60));
 if(n.OBRA.ok&&X('ELET')[t]&&X('ELET')[t].ent){const a=n.OB.length;n.colocarObra();if(n.OB.length>a)lamp=n.OB[n.OB.length-1];}}
n.modoObra(false);
const forca=(t,x,y,z)=>X('criarObra')(t,x,z,0,undefined,false,y,null);
if(!lamp){lamp=forca('luminaria',sala.x,sala.y,sala.z);r.lampadaPostaDireto=!!lamp;}
let ger=null;const tent=[];
for(let k=0;k<60&&!ger;k++){const a=k*2.4,rr=1+k*0.45,x=sala.x+Math.cos(a)*rr,z=sala.z+Math.sin(a)*rr,g=n.ground(x,z);P.x=x;P.z=z;P.y=g+0.02;P.vy=0;P.yaw=a;P.body=a;P.pitch=-0.35;
 n.modoObra(true);n.OBRA.tipo='gerador';n.OBRA.rot=0;n.obraAlvo();if(n.OBRA.ok){const c0=n.OB.length;n.colocarObra();if(n.OB.length>c0)ger=n.OB[n.OB.length-1];}else tent.push(n.OBRA.motivo||'nao');n.modoObra(false);}
if(!ger){const gx=sala.x+4,gz=sala.z;ger=forca('gerador',gx,n.ground(gx,gz),gz);r.geradorPostoDireto=!!ger;}
r.lampada=lamp?lamp.tipo:null;r.gerador=!!ger;r.tentativasGerador=[...new Set(tent)].slice(0,5);
if(lamp&&ger){r.lampY=+lamp.y.toFixed(1);r.gerY=+ger.y.toFixed(1);r.dist=+Math.hypot(lamp.x-ger.x,lamp.z-ger.z).toFixed(1);
 r.podeLigar=X('podeLigar')(ger,lamp)||'sim';r.ligar=X('ligarFio')(ger,lamp,true)||'ligou';ger.ext.comb=20;ger.ext.ligado=true;X('energiaResolver')(1);}
window.__fs={lamp,ger};return r;""")]
s += [js("G.hora=21;"), ["gwait", 3]]
s += [ev("fios_sub_energia", """
const {lamp,ger}=window.__fs||{};if(!lamp||!ger)return null;X('energiaResolver')(1);
return{lampEnergia:!!lamp.energ,gerRodando:!!ger.rodando,comb:+(ger.ext.comb||0).toFixed(2),fios:X('ENER').fios.length};""")]
salvar('tools/p232a_confirmar.json', s, vp=(1280, 720))

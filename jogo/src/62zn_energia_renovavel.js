/* ================= Energia sem gasolina e desgaste da base (v10.3.0, 17/11/2026) =================
   Himalaia: a "automação" da base é ela se sustentar sozinha, como no Rust: "pode colocar e lembrar de cada um dá mais energia, e
   outra, os materiais como o muro e a base também desgastam". A rede elétrica da Etapa 17 (fios, baterias, sensor, portão,
   bomba, fervedor, defesas...) ganha três fontes que não gastam gasolina, cada uma com a sua força:
   · Placa solar (até 200 W): só de dia, mais ao meio-dia, menos com nuvem e chuva;
   · Cata-vento (até 500 W): com o vento, que é mais forte à noite e na chuva; no alto do morro gera mais;
   · Roda d'água (até 900 W): na água corrente do rio (ou do córrego, com metade da força), de dia e de noite; na cheia gera mais.
   Elas entram na rede pelos fios como o gerador; o gerador a gasolina só trabalha no que elas não dão conta (61n_energia.js:
   fontePot). Com baterias, a base passa a noite sem gasolina nenhuma.
   DESGASTE: tudo o que você constrói vai gastando com o tempo (madeira mais depressa, e mais ainda na chuva; pedra e metal
   devagar; a roda d'água gasta com a água). A fonte gasta gera menos. O desgaste sozinho não derruba nada (para em 25%),
   mas a peça gasta cai mais fácil no ataque. Conserto: o de sempre (painel da peça, ou T no modo de construção para consertar
   tudo da base, com material). Fica de fora a Base Militar (as peças da história). */
iconesNovos({
  'i-roda-agua':'<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.6"/><path d="M12 4.5v15M4.5 12h15M6.7 6.7l10.6 10.6M17.3 6.7 6.7 17.3"/><path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/>',
  'i-cata-vento':'<path d="M12 10v12M9 22h6"/><circle cx="12" cy="8" r="1.5"/><path d="M12 6.5 11 1.5c2 0 3 1.5 1 5zM13.3 8.8l4.6 2.2c-1 1.8-2.8 1.8-4.6-2.2zM10.7 8.8l-4.6 2.2c1 1.8 2.8 1.8 4.6-2.2z"/>',
  'i-placa-solar':'<path d="M4 15 7 6h13l-3 9z"/><path d="M5.5 10.5h13M10 6l-2 9M15 6l-2 9"/><path d="M11 15v5M8 20h6"/>'});
Object.assign(OBRAS,{
  rodaDagua:{nome:"Roda d'água",icon:'i-roda-agua',custo:{tabuas:12,madeira:6,pregos:8,sucata:6,fio:4},hp:480,hw:1.15,hd:1.55,solid:true,hCol:2.4,etapa:3,desb:'oficina',
    desc:"Na água corrente do rio (ou do córrego): gera até 900 W de dia e de noite, sem gasolina. Na cheia gera mais. A água gasta a roda: conserte de vez em quando."},
  cataVento:{nome:'Cata-vento',icon:'i-cata-vento',custo:{tabuas:6,sucata:8,chapaFerro:2,fio:4,corda:2},hp:300,hw:0.7,hd:0.7,solid:true,hCol:6.5,etapa:3,desb:'oficina',
    desc:'Gera até 500 W com o vento: mais à noite, na chuva e no alto do morro.'},
  placaSolar:{nome:'Placa solar',icon:'i-placa-solar',custo:{sucata:4,chapaFerro:2,fio:3,pilhas:2},hp:160,hw:0.62,hd:0.7,solid:true,hCol:1.3,etapa:3,desb:'oficina',
    desc:'Gera até 200 W com sol: só de dia, mais ao meio-dia, menos com nuvem e chuva. Ligue numa bateria para guardar para a noite.'}});
Object.assign(ELET,{rodaDagua:{p:'fonte',prod:900,sai:2,ent:0,renov:'agua'},cataVento:{p:'fonte',prod:500,sai:2,ent:0,renov:'vento'},placaSolar:{p:'fonte',prod:200,sai:1,ent:0,renov:'sol'}});
/* combinador (como o do Rust): duas entradas e uma saída, para juntar duas fontes num fio só (o banco de baterias tem uma entrada) */
OBRAS.combinador={nome:'Combinador de energia',icon:'i-combinador',custo:{sucata:1,fio:4},hp:60,hw:0.2,hd:0.15,solid:false,peq:true,etapa:1,
  desc:'Duas entradas e uma saída: junta duas fontes (placa, cata-vento, roda, gerador) num fio só, por exemplo para a mesma bateria.'};
ELET.combinador={p:'logica',ent:2,sai:1};
iconesNovos({'i-combinador':'<path d="M3 6h6l6 6M3 18h6l6-6M15 12h6"/><circle cx="15" cy="12" r="1.5"/>'});
const RENOV=['placaSolar','cataVento','rodaDagua'];
OBRA_ORDEM.push(...RENOV,'combinador');for(const k of[...RENOV,'combinador'])if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);
if(typeof OBRAS_PREDIO!=='undefined'&&!OBRAS_PREDIO.includes('combinador'))OBRAS_PREDIO.push('combinador');if(typeof OBRAS_ALTO!=='undefined'&&!OBRAS_ALTO.includes('combinador'))OBRAS_ALTO.push('combinador');
{const c=OBRA_CATS.find(q=>q.id==='energia');if(c){const i=c.t.indexOf('gerador');c.t.splice(i>=0?i+1:0,0,...RENOV.filter(k=>!c.t.includes(k)));const j=c.t.indexOf('divisor');if(!c.t.includes('combinador'))c.t.splice(j>=0?j+1:c.t.length,0,'combinador');}}
Object.assign(BASE_DICAS,{rodaDagua:"Roda d'água pronta: ligue a saída dela (tela de fios) numa bateria ou direto no que gasta. Ela gira dia e noite.",
  cataVento:'Cata-vento pronto: ligue a saída numa bateria. Venta mais à noite e na chuva; no alto gera mais.',
  placaSolar:'Placa solar pronta: ligue numa bateria para a energia do dia sobrar para a noite.',
  combinador:'Combinador: ligue duas fontes nas entradas dele e a saída na bateria (ou no que gasta).'});

/* ---------- quanto cada uma gera agora ---------- */
function renovAmbiente(o){const e=o.ext||{};
  switch(o.tipo){
    case'placaSolar':{if(G.hora<6||G.hora>=20)return 0;const s=Math.sin(Math.PI*(G.hora-6)/14);return Math.pow(Math.max(0,s),0.7)*(1-0.7*clamp(G.chuva||0,0,1))*(1-0.35*clamp(E.cloud||0,0,1));}
    case'cataVento':{const w=E.wind?Math.hypot(E.wind[0],E.wind[1]):0.8;return clamp((w-0.35)/1.4,0.08,1)*clamp(0.8+(o.y||0)/30,0.8,1.3);}
    case'rodaDagua':{if(aguaProf(o.x,o.z)<0.25)return 0;const ch=RIO.enchente||0;return(e.corr?0.55:1)*(1+0.6*clamp(ch/1.5,0,1));}}
  return 0;}
function renovConserva(o){const D=OBRAS[o.tipo];return D&&o.hpMax?clamp(o.hp/o.hpMax,0,1):1;}
function renovPot(o){const d=ELET[o.tipo];if(!d)return 0;return Math.round(Math.min(d.prod*1.3,d.prod*renovAmbiente(o)*(0.35+0.65*renovConserva(o))));}
function renovMotivo(o){if(o.tipo==='placaSolar')return G.hora<6||G.hora>=20?'de noite':(G.chuva||0)>0.4?'chuva':'sol';
  if(o.tipo==='cataVento'){const w=E.wind?Math.hypot(E.wind[0],E.wind[1]):0.8;return w<0.6?'vento fraco':w<1.3?'vento bom':'vento forte';}
  if(o.tipo==='rodaDagua')return aguaProf(o.x,o.z)<0.25?'sem água corrente':(RIO.enchente||0)>0.3?'rio cheio':(o.ext&&o.ext.corr?'córrego':'correnteza');return'';}

/* ---------- roda d'água: vai na água corrente, com a pá na correnteza ---------- */
function alvoRodaDagua(x,z,yaw){const r={x,z,y:ground(x,z),yaw:P.yaw},no=m=>Object.assign(r,{ok:false,motivo:m}),f=[Math.sin(P.yaw),Math.cos(P.yaw)];let b=null;
  for(let s=1.5;s<=5.5;s+=0.5){const px=P.x+f[0]*s,pz=P.z+f[1]*s,n=aguaNivel(px,pz);if(n===null)continue;const gy=ground(px,pz);if(n-gy<0.5)continue;
    const q=RIO.ok?rioPerto(px,pz):null,noRio=!!q&&q.d<RIO.larg(q.s)+0.5,corr=!noRio&&typeof arcCorregoD==='function'&&arcCorregoD(px,pz)<2.4;
    if(!noRio&&!corr)continue;b={px,pz,n,gy,dx:q?q.dx:f[0],dz:q?q.dz:f[1],corr};break;}
  if(!b)return no("A roda vai na água corrente: na margem, olhe para o rio (ou para o córrego) de perto");
  if(!dentroMapa(b.px,b.pz,3))return no('Longe demais');
  if(OB.some(q=>q.tipo==='rodaDagua'&&d2(q.x,q.z,b.px,b.pz)<5*5))return no('Muito perto de outra roda');
  if(OB.some(q=>(q.tipo==='ponteMadeira'||q.tipo==='deque')&&d2(q.x,q.z,b.px,b.pz)<3.5*3.5))return no('Encosta numa ponte ou deque');
  Object.assign(r,{x:b.px,z:b.pz,y:b.n,yaw:Math.atan2(b.dx,b.dz),ext:{corr:b.corr?1:0}});r.ok=true;return r;}
OBRAS.rodaDagua.alvo=alvoRodaDagua;

/* ---------- desenho: armação parada + parte que gira ---------- */
const _MRV=M4(),_MRV2=M4(),_MRV3=M4();
INIT_MALHAS.push(function malhasRenovavel(){const R=rng(2626),mk=f=>{const g=new GB(8192,8);f(g);const d=g.data(),m=litMesh(d);m.f=d;return m;},
    mad=lin(0x6e5235),mad2=lin(0x5a4330),esc=lin(0x2b2b2b),aco=lin(0x6a7076),aco2=lin(0x4a4f54),ver=lin(0x3d5a3a),ama=lin(0xc9a227),bra=lin(0xd8dcd8),
    A=(g,t,m,c,o)=>add(g,t,m,c,Object.assign({j:0.06,rnd:R},o||{}));
  /* roda d'água: a armação (postes até o fundo, mancais, a casinha do dínamo na margem de cá) */
  MESH.obra.rodaDagua=mk(g=>{for(const sx of[-0.62,0.62]){A(g,boxTris(0.16,2.7,0.16),mat(sx,-0.25,0),mad2);for(const sz of[-1,1])A(g,boxTris(0.1,2.0,0.1),mat(sx,-0.35,sz*0.55,sz*0.5,0,0),mad2);
      A(g,boxTris(0.22,0.22,0.3),mat(sx,0.55,0),aco2);}
    A(g,boxTris(1.6,0.12,0.14),mat(0,1.18,0),mad);
    A(g,boxTris(0.6,0.1,1.2),mat(1.05,0.12,0),mad);for(const sz of[-0.5,0.5])A(g,boxTris(0.1,1.9,0.1),mat(1.05,-0.8,sz),mad2);   // tablado do dínamo
    A(g,boxTris(0.48,0.48,0.56),mat(1.02,0.45,0),ver);A(g,boxTris(0.5,0.06,0.58),mat(1.02,0.72,0),aco2);A(g,boxTris(0.04,0.1,0.3),mat(1.27,0.45,0),ama,{e:0.25});
    A(g,cylTris(0.07,0.07,0.5,8),mat(0.95,0.55,0,0,0,Math.PI/2),aco);});
  MESH.rodaDaguaGiro=mk(g=>{const Rr=1.3,N=16,L=2*Math.PI*Rr/N+0.02;
    for(const sx of[-0.44,0.44]){for(let i=0;i<N;i++){const a=(i+0.5)/N*Math.PI*2;A(g,boxTris(0.06,0.1,L),mat(sx,Rr*Math.cos(a),Rr*Math.sin(a),a,0,0),mad);}
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;A(g,boxTris(0.05,Rr,0.06),mat(sx,Rr/2*Math.cos(a),Rr/2*Math.sin(a),a,0,0),mad2);}}
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;A(g,boxTris(0.86,0.42,0.045),mat(0,(Rr-0.14)*Math.cos(a),(Rr-0.14)*Math.sin(a),a,0,0),i%2?mad:mad2);}   // pás
    A(g,cylTris(0.13,0.13,1.0,10),mat(0.5,0,0,0,0,Math.PI/2),aco2);});
  /* cata-vento: torre de treliça de 6 m; a cabeça (vira para o vento) e as pás (giram) à parte */
  MESH.obra.cataVento=mk(g=>{const H=6,b=0.6,t=0.16,P0=[[-b,-b],[b,-b],[b,b],[-b,b]],P1=[[-t,-t],[t,-t],[t,t],[-t,t]];
    for(let i=0;i<4;i++){const a=P0[i],c=P1[i],d=[c[0]-a[0],H,c[1]-a[1]];A(g,cylTris(0.04,0.05,Math.hypot(...d),5),alignY(a[0],0,a[1],d[0],d[1],d[2]),aco);}
    for(const k of[0.3,0.55,0.8]){const y=H*k,w=b+(t-b)*k;for(const sg of[-1,1]){A(g,boxTris(w*2,0.04,0.04),mat(0,y,sg*w),aco2);A(g,boxTris(0.04,0.04,w*2),mat(sg*w,y,0),aco2);}}   // travessas
    A(g,boxTris(0.5,0.08,0.5),mat(0,H,0),aco2);A(g,boxTris(1.3,0.06,1.3),mat(0,0.03,0),lin(0x77746b));A(g,boxTris(0.3,0.4,0.2),mat(0.35,0.5,0.35),ver);});
  MESH.cataVentoCabeca=mk(g=>{A(g,bvTris(0.32,0.32,0.9),mat(0,0.16,0.05),bra);A(g,boxTris(0.04,0.05,1.3),mat(0,0.2,-0.9),aco2);A(g,boxTris(0.03,0.55,0.7,{tz:0.6}),mat(0,0.3,-1.55),bra);
    A(g,cylTris(0.07,0.07,0.2,8),mat(0,0.16,0.5,Math.PI/2,0,0),aco2);});
  MESH.cataVentoPas=mk(g=>{for(let i=0;i<3;i++){const a=i/3*Math.PI*2;A(g,boxTris(0.16,1.55,0.03,{tx:0.45}),mm(mat(0,0,0,0,0,a),mat(0,0.85,0,0,0.18,0)),bra);}A(g,icoSubTris(0.12,0.1,R,0),mat(0,0,0.05),aco2);});
  MESH.obra.combinador=mk(g=>{A(g,boxTris(0.36,0.22,0.14),mat(0,0.9,0),aco);A(g,boxTris(0.06,0.9,0.06),mat(0,0.45,-0.03),mad);for(const x of[-0.08,0.08])A(g,boxTris(0.04,0.04,0.06),mat(x,0.98,0.08),ama);A(g,boxTris(0.04,0.04,0.06),mat(0,0.82,0.08),ver);});
  /* placa solar: a do kit (Post Apocalypse Kitbash) quando tiver; senão, a feita aqui */
  let solar=null;try{if(typeof kitOk==='function'&&kitOk()&&KITX.pecas.solar){const d=kitPeca('solar');if(d&&d.n){solar=texMesh(d.f,d.uv,texModelo('kit_atlas',KITX.tex,false));solar.kit=true;}}}catch(e){solar=null;}
  MESH.obra.placaSolar=solar||mk(g=>{A(g,boxTris(1.15,0.05,1.3),mat(0,1.05,0,-0.55,0,0),lin(0x1c2a44));for(let i=1;i<4;i++)A(g,boxTris(0.012,0.06,1.28),mat(-0.58+i*0.29,1.06,0,-0.55,0,0),bra);
    for(const sx of[-0.45,0.45]){A(g,boxTris(0.06,1.25,0.06),mat(sx,0.62,-0.38),aco2);A(g,boxTris(0.06,0.7,0.06),mat(sx,0.35,0.42),aco2);}A(g,boxTris(1.1,0.05,0.9),mat(0,0.03,0),aco);});});
let RENOV_T=0;
DESENHO.opaco.push(function renovDesenho(Pg){const now=performance.now(),dt=RENOV_T?Math.min(0.1,(now-RENOV_T)/1000):0;RENOV_T=now;
  for(const o of OB){if(o.hp<=0||(o.tipo!=='rodaDagua'&&o.tipo!=='cataVento'))continue;if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>110*110)continue;
    const f=renovAmbiente(o);
    if(o.tipo==='rodaDagua'&&MESH.rodaDaguaGiro){o.rvGiro=((o.rvGiro||0)+dt*(f>0?0.5+0.9*f:0))%(Math.PI*2);trs(_MRV,o.x,o.y,o.z,0,o.yaw,0,1,1,1);trs(_MRV2,0,0.55,0,-o.rvGiro,0,0,1,1,1);mul(_MRV3,_MRV,_MRV2);drawStat(Pg,MESH.rodaDaguaGiro,_MRV3);}
    else if(o.tipo==='cataVento'&&MESH.cataVentoCabeca){const w=E.wind||[0.6,0.2],alvo=Math.atan2(w[0],w[1])+Math.PI;o.rvCab=o.rvCab===undefined?alvo:o.rvCab+angDiff(o.rvCab,alvo)*Math.min(1,dt*0.8);
      o.rvGiro=((o.rvGiro||0)+dt*(1.5+7*f))%(Math.PI*2);trs(_MRV,o.x,o.y+6.05,o.z,0,o.rvCab,0,1,1,1);drawStat(Pg,MESH.cataVentoCabeca,_MRV);
      trs(_MRV2,0,0.16,0.62,0,0,o.rvGiro,1,1,1);mul(_MRV3,_MRV,_MRV2);drawStat(Pg,MESH.cataVentoPas,_MRV3);}}});

/* ---------- painel (segure E): quanto gera, por quê, conservação ---------- */
{const _ee=eletEstado;eletEstado=function(o){const d=ELET[o.tipo];if(!d||!d.renov)return _ee.apply(this,arguments);const e=o.ext||{},c=Math.round(renovConserva(o)*100);
  if(e.ligado===false)return'desligada · conservação '+c+'%';const p=renovPot(o);return(p>0?'gerando '+wTxt(p)+' de '+wTxt(d.prod):'parada')+' · '+renovMotivo(o)+' · conservação '+c+'%'+(energiaFiado(o)?'':' · sem fio');};}
{const U=ESTACAO_UI.energia,_r=U.render,_a=U.acao;
  U.render=function(o){const r=_r.apply(this,arguments);const d=ELET[o.tipo];
    if(o.tipo==='combinador'&&r){r.corpo=(r.corpo||'')+'<p class="es-info">Duas entradas e uma saída: ligue duas fontes (placa, cata-vento, roda ou gerador) nas entradas e a saída numa bateria ou no que gasta.</p>';return r;}
    if(!d||!d.renov||!r)return r;const e=o.ext||(o.ext={});
    r.acoes=(r.acoes||[]).filter(a=>a.id!=='tog');r.acoes.unshift({id:'tog',t:e.ligado===false?'Ligar':'Desligar',s:e.ligado===false?'volta a mandar energia para a rede':'para de mandar energia (ela continua girando)',ok:true,prim:e.ligado===false});
    const conserto=renovConserva(o)<0.999?' Gasta, ela gera menos: conserte no painel de consertos ou com T no modo de construção.':'';
    const txt={placaSolar:'Até '+wTxt(d.prod)+' com sol a pino. De noite não gera: ligue numa bateria para guardar o dia.',cataVento:'Até '+wTxt(d.prod)+' com vento forte. Venta mais à noite e na chuva; no alto do morro gera mais.',
      rodaDagua:'Até '+wTxt(d.prod)+' de dia e de noite enquanto a água corre'+(e.corr?' (no córrego, metade)':'')+'. Na cheia gera mais, mas a água gasta a roda mais depressa.'}[o.tipo]||'';
    r.corpo=(r.corpo||'').replace(/<p class="es-info">[\s\S]*?<\/p>$/,'')+'<p class="es-info">'+txt+' A gasolina do gerador só entra no que as fontes sem gasolina não dão conta.'+conserto+'</p>';
    return r;};
  U.acao=function(o,id){const d=ELET[o.tipo];if(id==='tog'&&d&&d.renov){const e=o.ext||(o.ext={});e.ligado=e.ligado===false;energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.7);return e.ligado?OBRAS[o.tipo].nome+' ligada.':OBRAS[o.tipo].nome+' desligada.';}
    return _a.apply(this,arguments);};}

/* ---------- desgaste das construções ---------- */
const DESG={ultTm:null,t:0,avisoTm:-1e9,piso:0.25,dia:{madeira:0.04,pedra:0.018,metal:0.012,outro:0.025},fonte:{rodaDagua:0.05,cataVento:0.03,placaSolar:0.02},fora:new Set(['fogueira'])};
function desgMaterial(D){const c=D.custo||{},m=(c.madeira||0)+(c.tabuas||0)*1.5+(c.corda||0)*0.5,p=(c.pedra||0)+(c.cimento||0)*2,f=(c.sucata||0)+(c.chapaFerro||0)*2+(c.barraFerro||0)*2;
  if(m<=0&&p<=0&&f<=0)return null;return f>=m&&f>=p?'metal':p>=m?'pedra':'madeira';}
function desgTaxa(o,D){if(!D||D.base||D.semDesgaste||D.peq||DESG.fora.has(o.tipo))return 0;
  if(typeof BASEM!=='undefined'&&d2(o.x,o.z,BASEM.x,BASEM.z)<48*48)return 0;   // as peças da história na Base Militar ficam como estão
  let t=DESG.fonte[o.tipo];if(t===undefined){const m=desgMaterial(D);if(!m)return 0;t=DESG.dia[m];if(m==='madeira'&&(G.chuva||0)>0.3)t*=1.5;}
  if(o.tipo==='rodaDagua'&&(RIO.enchente||0)>0.3)t*=2;return t;}
PASSOS.push(function desgastePasso(dt){DESG.t-=dt;if(DESG.t>0||G.modo!=='jogo')return;DESG.t=2;if(DESG.ultTm===null){DESG.ultTm=G.tm;return;}
  const dm=Math.max(0,Math.min(180,G.tm-DESG.ultTm));DESG.ultTm=G.tm;if(dm<=0)return;let gastas=0;
  for(const o of OB){if(o.hp<=0||!o.hpMax)continue;const D=OBRAS[o.tipo],t=desgTaxa(o,D);if(!t)continue;const piso=o.hpMax*DESG.piso;if(o.hp<=piso)continue;
    const antes=o.hp/o.hpMax;o.hp=Math.max(piso,o.hp-o.hpMax*t*dm/1440);if(antes>=0.5&&o.hp/o.hpMax<0.5&&obraDaBase(o))gastas++;}
  if(gastas&&G.tm-DESG.avisoTm>120){DESG.avisoTm=G.tm;feed((gastas>1?gastas+' construções da base estão gastas':'Uma construção da base está gasta')+': conserte (T no modo de construção)',true);}});
{const _r=resetMundo;resetMundo=function(){DESG.ultTm=null;DESG.avisoTm=-1e9;return _r.apply(this,arguments);};}
{const _c=carregarJogo;carregarJogo=function(){DESG.ultTm=null;return _c.apply(this,arguments);};}

/* ---------- manual: energia sem gasolina e desgaste ---------- */
MANUAL_EXTRA.push(()=>{const G_=(id,nome,icon,desc,est,ferr,proc,obs)=>({id,sec:'eletricidade',nome,icon,trav:false,como:'desde o começo',desc,ing:{},est:{nome:est,icon,onde:''},ferr,proc,res:null,obs,tipo:'Guia'});
  return[G_('x:renovavel','Energia sem gasolina','i-roda-agua','Placa solar, cata-vento e roda d\'água: ligadas nos fios como o gerador, mas sem gastar gasolina. Cada uma dá mais energia que a outra.','Onde: aba Energia (precisa da oficina)',
      ['Alicate e fio para ligar'],
      ['Placa solar: até 200 W, só de dia (mais ao meio-dia, menos com nuvem e chuva).','Cata-vento: até 500 W com vento forte. Venta mais à noite e na chuva; no alto do morro gera mais.',
       'Roda d\'água: até 900 W de dia e de noite. Vai na água corrente do rio (no córrego, com metade da força); na cheia gera mais.',
       'Ligue a saída delas num banco de baterias: o que sobra de dia fica guardado para a noite. O gerador a gasolina só trabalha no que elas não dão conta.',
       'A bateria tem uma entrada só: para juntar duas fontes, use o combinador (duas entradas, uma saída).'],
      ['Gastas, geram menos: conserte (painel da peça, ou T no modo de construção).','Segure E numa delas para ver quanto está gerando agora e por quê.']),
    G_('x:desgaste','Desgaste e conserto da base','i-martelo','Tudo o que você constrói vai gastando com o tempo, como no Rust.','Onde: qualquer construção da base',['Material do conserto'],
      ['Madeira gasta mais depressa (e mais ainda na chuva); pedra e metal, devagar. A roda d\'água gasta com a água (o dobro na cheia).',
       'O desgaste sozinho não derruba nada: para em 25%. Mas a peça gasta cai mais fácil quando os zumbis atacam.',
       'Para consertar: painel da peça, ou T no modo de construção (conserta tudo da base de uma vez, se tiver material).'],
      ['Quando uma peça passa da metade, o jogo avisa.'])];});

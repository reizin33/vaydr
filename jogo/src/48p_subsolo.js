/* ================= subterrâneos: bunker militar, abrigo da vila, estação escondida, mina velha, caverna e o laboratório do Projeto Esporo =================
   Tudo fica no mesmo nível (Y_SUB, 30 m abaixo do chão), embaixo do lugar onde a entrada está no mapa. Túneis ligam os complexos
   (rede de passagens). Entra-se por alçapões, pela boca da caverna, pela entrada da mina e pela escada da torre: a tela escurece e
   você aparece lá embaixo, ao pé da escada. Lá dentro é escuro (lanterna ajuda), a chuva não chega e o frio pesa menos.
   Portas com tranca: cartão (militar ou do laboratório), chave (da mina), código (teclado numérico; o código está num documento),
   energia (o gerador do bunker precisa de gasolina), parede rachada (quebrar com ferramenta) e entulho (cavar com picareta).
   Terminais e cadernos contam a história do Projeto Esporo e dão os códigos (sorteados a cada partida). Veios de minério na mina
   e na caverna. Zumbis presos lá embaixo aparecem na primeira visita e voltam alguns dias depois. */
const Y_SUB=-30,SUB_H=3.2,SUB_FUNDO=-20;   // abaixo de SUB_FUNDO = subsolo (o metrô da cidade fica a -6)
const SUB={complexos:[],salas:[],portas:[],entradas:[],terminais:[],veios:[],caixas:[],lampadas:[],props:[],paredes:[],ligas:[]};
iconesNovos({
  'i-cartao':'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
  'i-chave-velha':'<circle cx="7" cy="12" r="3.5"/><path d="M10.5 12H21M17 12v3M20 12v2"/>',
  'i-cepa':'<path d="M9 3h6M10 3v5l-4 9a3 3 0 0 0 3 4h6a3 3 0 0 0 3-4l-4-9V3"/><circle cx="11" cy="15" r="1"/><circle cx="14" cy="17" r="1"/>'});
Object.assign(ITEMS,{
  cartaoMilitar:{nome:'Cartão militar',icon:'i-cartao',max:1,tipo:'util',desc:'Cartão de acesso do Exército. Abre a porta do arsenal no bunker embaixo da base militar.'},
  cartaoLab:{nome:'Cartão do laboratório',icon:'i-cartao',max:1,tipo:'util',desc:'Cartão branco com o símbolo do Projeto Esporo. Abre as portas de dentro do laboratório e a escada da torre de rádio.'},
  chaveMina:{nome:'Chave da mina',icon:'i-chave-velha',max:1,tipo:'util',desc:'Chave velha da Mineração Serra Velha. Abre o portão de ferro entre a mina e a estação escondida.'}});
const subD=()=>G.sub||(G.sub=subNovo());
function subNovo(){const c=()=>String(1000+Math.floor(Math.random()*9000));return{abertas:{},docs:{},energia:{},visitou:{},caixas:{},veios:{},codigo:{lab:c(),arsenal:c()},populou:{},salaVista:{}};}
/* ---------- salas, ligações e portas ---------- */
function subComplexo(id,nome,tipo,cores){const c={id,nome,tipo,salas:[],cor:Object.assign({piso:0x55524c,par:0x6a6862,teto:0x3c3b38},cores||{}),seed:id.length*131+id.charCodeAt(0)*7};SUB.complexos.push(c);return c;}
function subSala(c,nome,x0,x1,z0,z1,o){o=o||{};const h=o.h||SUB_H,s={id:'sub'+SUB.salas.length,c,nome,x0,x1,z0,z1,y:Y_SUB,h,teto:Y_SUB+h,escura:o.escura??0.94,metro:true,sub:true,tipo:'subsolo',modelo:!!o.modelo,
    rocha:!!o.rocha,esporos:o.esporos||0,esporos0:o.esporos||0,ab:{n:[],s:[],o:[],l:[]},x:(x0+x1)/2,z:(z0+z1)/2};SUB.salas.push(s);c.salas.push(s);return s;}
/* abre uma passagem entre duas salas encostadas (no meio da parte em comum, ou na posição pedida) */
function subLiga(A,B,w,pos){w=w||1.4;
  if(Math.abs(A.x1-B.x0)<0.02||Math.abs(B.x1-A.x0)<0.02){const z0=Math.max(A.z0,B.z0),z1=Math.min(A.z1,B.z1),c=clamp(pos??(z0+z1)/2,z0+w/2,z1-w/2),oe=Math.abs(A.x1-B.x0)<0.02?A:B,le=oe===A?B:A;
    oe.ab.l.push([c-w/2,c+w/2]);le.ab.o.push([c-w/2,c+w/2]);SUB.ligas.push({A,B,x:oe.x1,z:c});return{x:oe.x1,z:c,eixo:'z',w};}
  if(Math.abs(A.z1-B.z0)<0.02||Math.abs(B.z1-A.z0)<0.02){const x0=Math.max(A.x0,B.x0),x1=Math.min(A.x1,B.x1),c=clamp(pos??(x0+x1)/2,x0+w/2,x1-w/2),no=Math.abs(A.z1-B.z0)<0.02?A:B,su=no===A?B:A;
    no.ab.s.push([c-w/2,c+w/2]);su.ab.n.push([c-w/2,c+w/2]);SUB.ligas.push({A,B,x:c,z:no.z1});return{x:c,z:no.z1,eixo:'x',w};}
  console.warn('subsolo: salas não encostam',A.nome,B.nome);return null;}
function subPorta(A,B,w,tranca,pos){const L=subLiga(A,B,w,pos);if(!L)return null;const d={id:'p'+SUB.portas.length,x:L.x,z:L.z,y:Y_SUB,eixo:L.eixo,w:L.w,tranca,aberta:false,col:null,A,B};SUB.portas.push(d);return d;}
function subPortaColisor(d){if(d.col){colRemove(d.col);d.col=null;}if(d.aberta)return;d.col=colBox(d.x,d.z,d.eixo==='x'?d.w/2:0.16,d.eixo==='x'?0.16:d.w/2,0,{solid:true,y0:Y_SUB-0.5,y1:Y_SUB+SUB_H,portaSub:d,sub:true});}
/* paredes: cada sala tem as suas, por dentro da borda, menos onde há passagem; viram colisores (só valem lá embaixo) */
function subParedes(s){const T=0.3,out=[];
  for(const lado of['n','s','o','l']){const L=lado==='n'||lado==='s',a0=L?s.x0:s.z0,a1=L?s.x1:s.z1;let segs=[[a0,a1]];
    for(const[o0,o1]of s.ab[lado]){const nv=[];for(const[b0,b1]of segs){if(o1<=b0||o0>=b1){nv.push([b0,b1]);continue;}if(o0>b0)nv.push([b0,o0]);if(o1<b1)nv.push([o1,b1]);}segs=nv;}
    for(const[b0,b1]of segs){if(b1-b0<0.05)continue;let x0,x1,z0,z1;
      if(lado==='n'){z0=s.z0;z1=s.z0+T;x0=b0;x1=b1;}else if(lado==='s'){z0=s.z1-T;z1=s.z1;x0=b0;x1=b1;}else if(lado==='o'){x0=s.x0;x1=s.x0+T;z0=b0;z1=b1;}else{x0=s.x1-T;x1=s.x1;z0=b0;z1=b1;}
      out.push({lado,x0,x1,z0,z1,b0,b1});}}
  return out;}
/* ---------- os complexos ---------- */
function subMontar(){if(SUB.complexos.length)return;
  // ===== bunker militar (embaixo da base) =====
  const B=subComplexo('bunker','Bunker militar Serra Velha','militar',{piso:0x4f514c,par:0x7a7c76,teto:0x45474a});
  const bCor=subSala(B,'Corredor do bunker',-116,-96,-33,-30),bPoco=subSala(B,'Poço de acesso do bunker',-104,-100,-30,-26),bArs=subSala(B,'Arsenal',-114,-108,-40,-33),
    bCom=subSala(B,'Sala de comando',-106,-97,-41,-33),bDor=subSala(B,'Dormitório do bunker',-124,-116,-34,-27),bOc=subSala(B,'Depósito escondido',-124,-118,-40,-34),
    bGer=subSala(B,'Casa do gerador',-96,-90,-34,-28);
  subLiga(bCor,bPoco,1.6);subPorta(bCor,bArs,1.3,{tipo:'cartao',item:'cartaoMilitar'});subLiga(bCor,bCom,1.6);subLiga(bCor,bDor,1.6);subPorta(bDor,bOc,1.2,{tipo:'rachada'},-121);subLiga(bCor,bGer,1.6);
  // ===== túnel de serviço do bunker até a estação escondida (porta elétrica) =====
  const T1=subComplexo('tunel1','Túnel de serviço','tunel',{piso:0x4a4844,par:0x5e5c56,teto:0x3a3936});
  const t1a=subSala(T1,'Túnel de serviço',-94,-91,-74,-34,{h:2.8});
  subPorta(bGer,t1a,1.4,{tipo:'energia',gerador:'bunker'},-92.5);
  // ===== estação escondida (o fim da linha do trem de abastecimento) =====
  const E=subComplexo('estacao','Estação escondida','estacao',{piso:0x5a5752,par:0x6c6a64,teto:0x3e3d3a});
  const ePlat=subSala(E,'Plataforma escondida',-100,-80,-82,-74,{h:4}),eLinha=subSala(E,'Linha do trem escondida',-100,-80,-86,-82,{h:4}),eSala=subSala(E,'Sala de controle da estação',-80,-74,-80,-74);
  subLiga(ePlat,t1a,1.6,-92.5);subLiga(ePlat,eLinha,6);subPorta(ePlat,eSala,1.2,{tipo:'codigo',cod:'arsenal'},-77);
  // v10.1: a linha segue para um túnel de metrô abandonado (modelo escaneado, 62u_lugares: tunelMetro). A sala dá o nome, o escuro,
  // as paredes de colisão e a parede das pontas; o resto (piso, teto, laterais) quem desenha é o modelo
  const eTun=subSala(E,'Túnel do metrô abandonado',-80,-66,-89.5,-80,{h:6.5,modelo:true});subLiga(eLinha,eTun,4);
  // ===== mina velha (liga na estação e na caverna) =====
  const M=subComplexo('mina','Mina velha da Serra','mina',{piso:0x4a3f34,par:0x5a4c3e,teto:0x3a3027});
  const mGal=subSala(M,'Galeria da mina',-108,-100,-86,-80,{rocha:true,h:3}),mFrente=subSala(M,'Frente de lavra',-112,-104,-96,-86,{rocha:true,h:3}),mEsc=subSala(M,'Escritório da mina',-104,-100,-92,-86);
  subPorta(mGal,ePlat,1.6,{tipo:'chave',item:'chaveMina'},-81);subLiga(mGal,mFrente,2,-106);subLiga(mGal,mEsc,1.4,-102);
  // ===== caverna natural =====
  const K=subComplexo('caverna','Caverna da Serra','caverna',{piso:0x4a4440,par:0x5a524a,teto:0x3a3530});
  const kBoca=subSala(K,'Boca da caverna',-124,-116,-92,-86,{rocha:true,h:3.6}),kSalao=subSala(K,'Salão da caverna',-124,-112,-104,-92,{rocha:true,h:4.5}),kFundo=subSala(K,'Fundo da caverna',-130,-124,-102,-94,{rocha:true,h:3});
  subLiga(kBoca,kSalao,2.4,-119);subPorta(kSalao,mFrente,1.6,{tipo:'entulho'},-94);subPorta(kSalao,kFundo,1.4,{tipo:'entulho'},-98);
  // ===== túnel e laboratório secreto do Projeto Esporo (embaixo da torre de rádio) =====
  const T2=subComplexo('tunel2','Túnel do laboratório','tunel',{piso:0x4a4844,par:0x5e5c56,teto:0x3a3936});
  const t2a=subSala(T2,'Túnel do laboratório',-74,-48,-79,-76,{h:2.8}),t2b=subSala(T2,'Túnel do laboratório (fim)',-51,-48,-104,-79,{h:2.8,esporos:0.1});
  subPorta(eSala,t2a,1.3,{tipo:'codigo',cod:'lab'},-77.5);subLiga(t2a,t2b,3,-49.5);
  const L=subComplexo('lab','Laboratório do Projeto Esporo','lab',{piso:0xb8bcb8,par:0xccd0cc,teto:0x989c9a});
  const lEcl=subSala(L,'Eclusa do laboratório',-52,-46,-110,-104,{escura:0.88,esporos:0.15}),lCor=subSala(L,'Corredor do laboratório',-52,-36,-114,-110,{escura:0.9,esporos:0.3}),
    lSeg=subSala(L,'Segurança do laboratório',-36,-30,-116,-108,{escura:0.9,esporos:0.2}),lCult=subSala(L,'Sala de cultivo',-52,-42,-124,-114,{escura:0.92,esporos:0.75}),
    lNuc=subSala(L,'Núcleo do Projeto Esporo',-42,-30,-128,-116,{escura:0.93,esporos:1,h:4.5}),lPoco=subSala(L,'Poço da torre',-46,-42,-110,-106,{escura:0.88});
  subLiga(t2b,lEcl,1.4,-49.5);subLiga(lEcl,lCor,1.4,-49);subLiga(lCor,lSeg,1.3,-112);subPorta(lCor,lCult,1.3,{tipo:'cartao',item:'cartaoLab'},-47);subPorta(lCult,lNuc,1.6,{tipo:'cartao',item:'cartaoLab'},-120);
  subLiga(lEcl,lPoco,1.4,-108);
  // ===== abrigo antiaéreo da vila =====
  const A=subComplexo('abrigo','Abrigo antiaéreo da vila','civil',{piso:0x6a5f52,par:0x8a8072,teto:0x4a443c});
  const aSala=subSala(A,'Abrigo da vila',48,58,-66,-58,{escura:0.9}),aDep=subSala(A,'Depósito do abrigo',58,62,-66,-61),aPoco=subSala(A,'Escada do abrigo',48,51,-58,-55);
  subLiga(aSala,aDep,1.2);subLiga(aSala,aPoco,1.2,49.5);
  // ===== entradas (superfície ↔ subsolo): [x, z, rumo de quem chega] =====
  SUB.entradas.push(
    {id:'bunker',nome:'Alçapão do bunker',tipo:'alcapao',sup:[-102,-25.4,Math.PI],sub:[-102,-27.3,Math.PI],c:B},
    {id:'caverna',nome:'Boca da caverna',tipo:'caverna',sup:[-113.5,-86.5,-0.9],sub:[-119.5,-87.2,Math.PI],c:K},
    {id:'mina',nome:'Entrada da mina velha',tipo:'mina',sup:[-90,-80.5,0.6],sub:[-101.2,-81.2,-Math.PI/2],c:M},
    {id:'torre',nome:'Escada de serviço da torre',tipo:'alcapao',sup:[-41.5,-107.6,0],sub:[-43.2,-107.2,Math.PI/2],c:L,trancada:{tipo:'cartao',item:'cartaoLab'}},
    {id:'abrigo',nome:'Alçapão do abrigo da vila',tipo:'alcapao',sup:[49.5,-53.5,0],sub:[49.5,-56.6,0],c:A});
  // ===== terminais e cadernos =====
  SUB.terminais.push(
    {id:'t_bunker',x:-103.6,z:-40.4,doc:'ordem77',c:B},{id:'t_arsenal',x:-108.6,z:-36.5,doc:'inventario',c:B},
    {id:'t_estacao',x:-75.6,z:-79.4,doc:'linha',c:E},{id:'t_mina',x:-100.6,z:-89,doc:'mina',papel:true,c:M},{id:'t_abrigo',x:57.4,z:-62,doc:'abrigo',papel:true,c:A},
    {id:'t_seg',x:-30.6,z:-112,doc:'seguranca',c:L},{id:'t_cult',x:-42.6,z:-122.5,doc:'cultivo',c:L},{id:'t_nucleo',x:-36,z:-127.4,doc:'nucleo',c:L});
  // ===== armários e caixas =====
  SUB.caixas.push(
    {id:'cx_ars1',x:-112.6,z:-39.3,tab:'arsenalSub',nome:'Armário de armas',c:B},{id:'cx_ars2',x:-109.6,z:-39.3,tab:'militar',nome:'Caixa militar',c:B},
    {id:'cx_dor',x:-117.2,z:-33.3,tab:'dormitorio',nome:'Armário do dormitório',c:B},{id:'cx_ocul',x:-123.2,z:-39.3,tab:'escondido',nome:'Caixa escondida',c:B,fixo:['cartaoLab']},
    {id:'cx_ger',x:-90.8,z:-33.3,tab:'oficina',nome:'Caixa de ferramentas',c:B},{id:'cx_est',x:-74.8,z:-75,tab:'estacaoSub',nome:'Armário da estação',c:E},
    {id:'cx_mina',x:-103.3,z:-91.3,tab:'minaEsc',nome:'Gaveta do escritório da mina',c:M},{id:'cx_cav',x:-129.3,z:-101.3,tab:'escondido',nome:'Mochila esquecida',c:K},
    {id:'cx_abr1',x:61.3,z:-65.3,tab:'abrigoDep',nome:'Prateleira do depósito',c:A},{id:'cx_abr2',x:48.8,z:-65.3,tab:'abrigoSala',nome:'Baú do abrigo',c:A,fixo:['chaveMina']},
    {id:'cx_seg',x:-30.7,z:-108.7,tab:'labSeg',nome:'Armário da segurança',c:L,fixo:['cartaoLab']});
  // ===== veios de minério de ferro =====
  for(const[x,z,c]of[[-111.3,-88.6,M],[-111.3,-91.2,M],[-106.6,-95.3,M],[-123.3,-101,K],[-113,-103.3,K],[-129.3,-96,K]])SUB.veios.push({id:'v'+SUB.veios.length,x,z,c});
  // ===== lâmpadas (bunker e estação acendem com o gerador; o laboratório tem luz de emergência) =====
  for(const[x,z,c,e]of[[-106,-31.5,B,'bunker'],[-120,-30.5,B,'bunker'],[-101.5,-37,B,'bunker'],[-111,-36.5,B,'bunker'],[-93,-31,B,'bunker'],[-121,-37,B,'bunker'],
    [-92.5,-55,T1,'bunker'],[-90,-78,E,'bunker'],[-77,-77,E,'bunker'],[-49,-107,L,'lab'],[-44,-112,L,'lab'],[-47,-119,L,'lab'],[-36,-122,L,'lab'],[-33,-112,L,'lab']])
    SUB.lampadas.push({x,z,y:Y_SUB+(salaSubEm(x,Y_SUB+1,z)||{h:SUB_H}).h-0.08,c,e});
  subProps(B,T1,E,M,K,L,A);
  // colisores das paredes e o chão de cada sala
  for(const s of SUB.salas){s.paredes=subParedes(s);for(const p of s.paredes){SUB.paredes.push(p);p.col=colBox((p.x0+p.x1)/2,(p.z0+p.z1)/2,(p.x1-p.x0)/2,(p.z1-p.z0)/2,0,{solid:true,y0:s.y-0.5,y1:s.teto+0.3,sub:true});}
    supAdd({t:'ret',x:s.x,z:s.z,hw:(s.x1-s.x0)/2,hd:(s.z1-s.z0)/2,yaw:0,y:s.y,sub:true});}
  // móveis grandes também bloqueiam
  for(const b of SUB.blocos||[])colBox(b[0],b[1],b[2],b[3],0,{solid:true,y0:Y_SUB-0.5,y1:Y_SUB+(b[4]||1.2),sub:true});
  for(const d of SUB.portas)subPortaColisor(d);}
/* móveis, trilhos, escoras, tanques de cultivo e o núcleo (só enfeite; os grandes entram em SUB.blocos para bloquear) */
function subProps(B,T1,E,M,K,L,A){const pr=(c,f)=>SUB.props.push({c,f}),bl=(x,z,hw,hd,h)=>(SUB.blocos||(SUB.blocos=[])).push([x,z,hw,hd,h]);
  const cx=(g,R,x,y,z,w,h,d,col,b,o)=>add(g,boxTris(w,h,d),mat(x,y+h/2,z,0,(o&&o.ry)||0,0),lin(col),{b,j:(o&&o.j)??0.07,rnd:R,e:(o&&o.e)||0});
  const escada=(g,R,x,z,eixo,b,cor)=>{for(const s of[-0.3,0.3]){const px=eixo==='x'?x+s:x,pz=eixo==='x'?z:z+s;cx(g,R,px,Y_SUB,pz,0.08,SUB_H,0.08,cor,b);}
    for(let i=1;i<9;i++)cx(g,R,x,Y_SUB+i*0.35-0.03,z,eixo==='x'?0.6:0.05,0.05,eixo==='x'?0.05:0.6,0x8a9096,b);};
  const Y=Y_SUB;
  pr(B,(g,R)=>{const b=0.94;
    for(const x of[-122.9,-120.9,-118.9]){cx(g,R,x,Y,-28.3,0.9,0.42,1.9,0x4a5236,b);cx(g,R,x,Y+0.42,-28.3,0.85,0.12,1.8,0x6a6a5a,b);cx(g,R,x,Y+1.25,-28.3,0.9,0.1,1.9,0x4a5236,b);for(const s of[-0.4,0.4])for(const t of[-0.9,0.9])cx(g,R,x+s,Y,-28.3+t,0.05,1.35,0.05,0x3a3e40,b);}
    cx(g,R,-101.5,Y,-37,3,0.8,1.2,0x5a5c58,b);for(let i=0;i<4;i++)cx(g,R,-102.8+i*0.9,Y,-35.6,0.45,0.9,0.45,0x3a3e40,b);
    cx(g,R,-99,Y,-40.6,2.6,1.3,0.45,0x2a2e30,b);cx(g,R,-99,Y+0.85,-40.36,2.2,0.4,0.05,0x3a7a5a,b,{e:1.2,j:0});
    for(let i=0;i<3;i++)cx(g,R,-113.6,Y,-37.6+i*1.5,0.6,1.9,1.1,0x3a4030,b);
    cx(g,R,-93,Y,-31,1.8,1.1,1.0,0x4b5a3a,b);cx(g,R,-93,Y+1.1,-31,0.5,0.35,0.4,0x2b2b2b,b);cx(g,R,-92,Y+0.5,-31,0.12,0.12,1.4,0x2b2b2b,b);
    for(let i=0;i<5;i++)cx(g,R,-123,Y,-35.4-i*0.9,0.7,0.5+0.2*(i%2),0.7,0x5a4a32,b);
    escada(g,R,-102,-26.4,'x',b,0x6a7076);});
  bl(-101.5,-37,1.5,0.6,0.8);bl(-99,-40.6,1.3,0.25,1.3);bl(-113.6,-36.1,0.3,2.3,1.9);bl(-93,-31,0.9,0.5,1.1);
  pr(T1,(g,R)=>{const b=0.95;for(let z=-70;z<-36;z+=6){cx(g,R,-93.7,Y+1.2,z,0.12,0.12,5.6,0x3a3a36,b);cx(g,R,-93.7,Y+1.45,z,0.08,0.08,5.6,0x5a4a3a,b);}});
  pr(E,(g,R)=>{const b=0.94;cx(g,R,-90,Y+0.002,-81.75,20,0.01,0.35,0xc9a227,b,{j:0});
    for(let x=-99.4;x<-80;x+=1.1)cx(g,R,x,Y-0.08,-84,0.24,0.1,2.8,0x4a3a2a,b);for(const z of[-83.3,-84.7])cx(g,R,-90,Y+0.02,z,20,0.12,0.09,0x6a6a68,b);
    cx(g,R,-87,Y+0.5,-84,7,2.4,2.6,0x5a3a2a,b);cx(g,R,-87,Y+2.9,-84,7.2,0.2,2.8,0x3a2a20,b);for(const s of[-1,1])cx(g,R,-87+s*2.6,Y,-84,0.9,0.5,2.2,0x2b2b2b,b);
    for(let i=0;i<4;i++)cx(g,R,-89.5+i*1.6,Y+1.6,-82.68,1,0.6,0.05,0x1e2226,b);
    cx(g,R,-98.6,Y,-75.2,1.2,0.9,0.7,0x6b4e30,b);cx(g,R,-97.2,Y,-75.2,1.2,0.6,0.7,0x6b4e30,b);});
  bl(-87,-84,3.5,1.3,2.9);bl(-97.9,-75.2,1.3,0.35,0.9);
  pr(M,(g,R)=>{const b=0.95;for(let z=-85;z>-96;z-=2.5){for(const x of[-107.6,-104.4])cx(g,R,x,Y,z,0.18,2.9,0.18,0x5a4430,b);cx(g,R,-106,Y+2.8,z,3.4,0.2,0.22,0x5a4430,b);}
    for(const x of[-106.5,-105.5])cx(g,R,x,Y+0.01,-88,0.08,0.08,14,0x6a6a68,b);for(let z=-94.6;z<-81;z+=0.9)cx(g,R,-106,Y-0.04,z,1.4,0.06,0.18,0x4a3a2a,b);
    cx(g,R,-106,Y+0.25,-90,1,0.7,1.4,0x6a4a30,b);for(let i=0;i<5;i++)add(g,icoTris(0.2,0.4,R),mat(-106+(R()-0.5)*0.6,Y+1.05,-90+(R()-0.5)*1),lin(0x7a3a20),{b,j:0.1,rnd:R});
    for(const s of[-0.45,0.45])for(const t of[-0.6,0.6])add(g,cylTris(0.14,0.14,0.08,10),mm(mat(-106+s,Y+0.14,-90+t),mat(0,0,0,0,0,Math.PI/2)),lin(0x3a3a38),{b});
    cx(g,R,-101.2,Y,-87.6,1.5,0.8,0.8,0x6b4e30,b);cx(g,R,-102.8,Y,-91.4,0.9,1.6,0.5,0x5a5a52,b);});
  bl(-106,-90,0.55,0.75,1);bl(-101.2,-87.6,0.75,0.4,0.8);
  pr(K,(g,R)=>{const b=0.96;for(let i=0;i<22;i++){const x=-123.5+R()*11,z=-103.5+R()*11;add(g,cylTris(0,0.08+R()*0.12,0.5+R()*1.1,6),mat(x,Y+4.48,z,Math.PI,0,0),lin(0x5a524a),{b,j:0.12,rnd:R});}
    for(let i=0;i<8;i++){const x=-122.5+R()*9,z=-102.5+R()*9;add(g,cylTris(0,0.1+R()*0.12,0.4+R()*0.7,6),mat(x,Y,z),lin(0x55504a),{b,j:0.12,rnd:R});}
    for(let i=0;i<8;i++){const x=-129.4+R()*4.8,z=-101.5+R()*7;add(g,icoSubTris(0.25+R()*0.35,0.4,R,1),mat(x,Y+0.15,z),lin(0x4f4842),{b,j:0.12,rnd:R});}
    cx(g,R,-120,Y+0.01,-97,3,0.02,2,0x1e2a30,b,{j:0});});
  pr(L,(g,R)=>{const b=0.9;for(let i=0;i<4;i++){const x=-50+i*2.4,z=-117.2;add(g,cylTris(0.45,0.45,1.7,14),mat(x,Y,z),lin(0x9ad8b0),{b:0.86,j:0.03,rnd:R});
      add(g,cylTris(0.5,0.5,0.15,14,{bottom:true}),mat(x,Y,z),lin(0x6a706c),{b});add(g,icoSubTris(0.33,0.5,R,1),mat(x,Y+0.85,z),lin(0x5a8a3a),{e:0.7,b,j:0.15,rnd:R});}
    cx(g,R,-36,Y,-122,3,1.0,3,0x7a7e7a,b);add(g,icoSubTris(1.15,0.55,R,2),mat(-36,Y+2.2,-122),lin(0x6aa03a),{e:1.5,b,j:0.2,rnd:R});
    for(let i=0;i<12;i++){const a=i/12*6.283;add(g,cylTris(0.05,0.13,2.6,5),alignY(-36+Math.cos(a)*1.0,Y+1.4,-122+Math.sin(a)*1.0,Math.cos(a),0.55,Math.sin(a)),lin(0x3a5a2a),{b,j:0.15,rnd:R});}
    for(let i=0;i<14;i++){const x=-41.5+R()*11,z=-127.5+R()*11;add(g,cylTris(0.04,0.09,0.6+R()*1.4,5),alignY(x,Y,z,(R()-0.5)*0.6,1,(R()-0.5)*0.6),lin(0x3a5a2a),{b,j:0.15,rnd:R});}
    for(let i=0;i<10;i++){const x=-51.5+R()*9,z=-123.5+R()*3;add(g,cylTris(0.03,0.08,0.4+R()*1.0,5),alignY(x,Y,z,(R()-0.5)*0.8,1,(R()-0.5)*0.8),lin(0x456a30),{b,j:0.15,rnd:R});}
    cx(g,R,-49,Y+2.26,-104.45,1.6,0.25,0.08,0xb02a20,b,{e:0.6,j:0});
    escada(g,R,-42.4,-108,'z',b,0x8a9096);});
  bl(-36,-122,1.5,1.5,1.0);for(let i=0;i<4;i++)bl(-50+i*2.4,-117.2,0.45,0.45,1.7);
  pr(A,(g,R)=>{const b=0.9;for(const x of[50.8,53,55.2]){cx(g,R,x,Y,-64.9,1.8,0.45,0.9,0x7a5a3a,b);cx(g,R,x,Y+0.45,-64.9,1.7,0.1,0.8,0x8a8270,b);}
    cx(g,R,54,Y,-60.2,2.2,0.78,1,0x6b4e30,b);for(const s of[-1,1])cx(g,R,54+s*1.4,Y,-60.2,0.45,0.45,0.45,0x5a4430,b);
    for(let i=0;i<4;i++)cx(g,R,60,Y+i*0.5+0.02,-65.6,1.6,0.05,0.5,0x6b4e30,b);for(const s of[-0.78,0.78])cx(g,R,60+s,Y,-65.6,0.06,2,0.5,0x5a4430,b);
    cx(g,R,52,Y+1.6,-58.2,1.2,0.8,0.05,0x8a7a5a,b);escada(g,R,49.5,-55.35,'x',b,0x6a6a68);});
  bl(54,-60.2,1.1,0.5,0.78);}
/* saques próprios do subsolo (o cartão militar fica no armário do comandante, em cima, na base) */
Object.assign(LOOT,{arsenalSub:[['rifle',1,1,0.35],['balaRifle',4,10,0.9],['espingarda',1,1,0.25],['cartucho',4,10,0.8],['bombaCaseira',1,2,0.5],['mascaraGas',1,1,0.35],['kit',1,1,0.5],['colete',1,1,0.3]],
  dormitorio:[['racao',1,3,0.8],['agua',1,2,0.7],['bandagem',1,2,0.6],['pilhas',1,2,0.4],['camiseta',1,1,0.4],['calcaCargo',1,1,0.25],['botasTrilha',1,1,0.25]],
  escondido:[['rifle',1,1,0.3],['balaRifle',6,12,0.8],['seringa',1,2,0.6],['kit',1,1,0.7],['facaCaca',1,1,0.4],['mochilaPequena',1,1,0.3],['mascaraGas',1,1,0.25]],
  estacaoSub:[['pilhas',2,4,0.7],['lanterna',1,1,0.4],['sucata',2,5,0.8],['kitFerramentas',1,1,0.3],['racao',1,2,0.5]],
  minaEsc:[['picareta',1,1,0.6],['carvao',2,5,0.8],['barraFerro',1,2,0.4],['pilhas',1,2,0.4],['lanterna',1,1,0.25]],
  abrigoDep:[['feijao',2,4,0.9],['agua',2,3,0.9],['sal',1,3,0.6],['linha',1,3,0.5],['pano',2,4,0.6],['remedios',1,2,0.4]],
  abrigoSala:[['agulha',1,1,0.6],['bandana',1,1,0.5],['camisaLeve',1,1,0.4],['racao',1,2,0.5]],
  labSeg:[['mascaraGas',1,1,0.7],['seringa',1,2,0.6],['antisseptico',1,2,0.5],['municao9',6,12,0.6]],
  comandante:[['municao9',4,8,0.6],['racao',1,1,0.5],['pilhas',1,2,0.4],['remedios',1,1,0.3]]});
/* ---------- onde fica o subsolo ---------- */
function salaSubEm(x,y,z){if(y>Y_SUB+7||y<Y_SUB-4)return null;for(const s of SUB.salas)if(x>=s.x0&&x<=s.x1&&z>=s.z0&&z<=s.z1)return s;return null;}
function subterraneoEm(x,y,z){return!!salaSubEm(x,y,z);}
function noSubsolo(){return P.y<SUB_FUNDO&&!!salaSubEm(P.x,P.y+0.3,P.z);}
/* ---------- descer e subir (a tela escurece) ---------- */
let subFadeT=null;
function subFade(f){const el=$('tela-fade');if(!el){f();return;}if(subFadeT)clearTimeout(subFadeT);el.hidden=false;el.classList.add('on');
  subFadeT=setTimeout(()=>{f();subFadeT=setTimeout(()=>{el.classList.remove('on');subFadeT=setTimeout(()=>{el.hidden=true;subFadeT=null;},420);},140);},360);}
function subIr(x,y,z,yaw){P.x=x;P.z=z;P.y=y;P.vx=P.vz=P.vy=0;P.noChao=true;P.escala=null;P.muro=null;P.rola=null;P.acao=null;P.yaw=yaw;P.body=yaw;camPiv=null;}
function subDescer(e){const D=subD();sfx('escadaSub');subFade(()=>{subIr(e.sub[0],Y_SUB,e.sub[1],e.sub[2]);
    if(CAO&&CAO.ativo&&CAO.st!=='morto'&&CAO.modo!=='fica'){CAO.modoAntes=CAO.modo;CAO.modo='fica';CAO.ficaX=e.sup[0]+1.2;CAO.ficaZ=e.sup[1]+1.2;D.caoEspera=e.id;feed('Caramelo fica esperando na entrada');}
    if(!D.visitou[e.c.id]){D.visitou[e.c.id]=true;if(typeof diarioDescobre==='function')diarioDescobre('subsolo',e.c.id,e.c.nome,25);}
    subPopular(e.c);dica('subsolo','corpo','Aqui embaixo é escuro: acenda a lanterna (F). A chuva não chega e o frio pesa menos. Para subir, use a escada por onde desceu.');});}
function subSubir(e){const D=subD();sfx('escadaSub');subFade(()=>{const y=ground(e.sup[0],e.sup[1]);subIr(e.sup[0],y,e.sup[1],e.sup[2]+Math.PI);P.y=chaoEm(P.x,P.z,y+0.3);
    if(D.caoEspera&&CAO&&CAO.ativo){CAO.modo=CAO.modoAntes||'segue';D.caoEspera=null;}});}
/* zumbis presos lá embaixo: na primeira visita e de novo depois de alguns dias */
function subPopular(c){const D=subD();if(D.populou[c.id]!==undefined&&G.dia-D.populou[c.id]<4)return 0;D.populou[c.id]=G.dia;
  const tipos={militar:['walker','runner','walker','sentinela'],estacao:['walker','walker','runner'],mina:['walker','rastejante'],caverna:['rastejante','walker'],lab:['inchado','walker','runner'],civil:['walker'],tunel:['walker','rastejante']}[c.tipo]||['walker'];
  let n=0;for(const s of c.salas){if((s.x1-s.x0)*(s.z1-s.z0)<22)continue;const k=c.tipo==='lab'?2:1;for(let i=0;i<k;i++){if(Math.random()<0.3)continue;
    const x=lerp(s.x0+1,s.x1-1,Math.random()),z=lerp(s.z0+1,s.z1-1,Math.random());if(Math.hypot(x-P.x,z-P.z)<8)continue;
    const t=tipos[Math.floor(Math.random()*tipos.length)];if(!ZS[t])continue;const q=criarZ(t,x,z,{y:Y_SUB});if(q){q.subsolo=true;q.hx=x;q.hz=z;n++;}}}return n;}
/* ---------- portas ---------- */
function temQuebraSub(){let best=null;for(const s of P.inv){if(!s||!ITEMS[s.id])continue;const d=ITEMS[s.id];if(d.minera||d.corta||s.id==='marreta'||s.id==='pecaCabra'){if(!best||(d.minera&&!ITEMS[best.id].minera))best=s;}}return best;}
function temPicareta(){for(const s of P.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].minera)return s;return null;}
function subPortaTexto(d){const T=d.tranca,D=subD();if(d.aberta)return{t:'Passagem aberta',s:''};
  if(T.tipo==='cartao'){const tem=invCount(T.item)>0;return{t:tem?'Passar o '+ITEMS[T.item].nome.toLowerCase():'Porta trancada',s:tem?'abre a porta':'precisa do '+ITEMS[T.item].nome.toLowerCase()};}
  if(T.tipo==='chave'){const tem=invCount(T.item)>0;return{t:tem?'Abrir com a '+ITEMS[T.item].nome.toLowerCase():'Portão de ferro trancado',s:tem?'abre o portão':'precisa da '+ITEMS[T.item].nome.toLowerCase()};}
  if(T.tipo==='codigo')return{t:'Teclado da porta',s:'digite o código de 4 números'};
  if(T.tipo==='energia')return{t:'Porta elétrica',s:D.energia.bunker?'abrir':'sem energia: ligue o gerador do bunker'};
  if(T.tipo==='rachada'){const f=temQuebraSub();return{t:'Parede rachada',s:f?'segure para quebrar':'quebre com machado, marreta ou picareta',hold:!!f,dur:2.4};}
  if(T.tipo==='entulho'){const f=temPicareta();return{t:'Entulho de pedra',s:f?'segure para cavar':'cave com uma picareta',hold:!!f,dur:3};}
  return null;}
function subAbrirPorta(d,msg){const D=subD();d.aberta=true;D.abertas[d.id]=true;subPortaColisor(d);
  sfx(d.tranca.tipo==='rachada'||d.tranca.tipo==='entulho'?'entulho':'portaMetal',d.x,d.z);if(msg)feed(msg);
  if(d.tranca.tipo==='rachada'||d.tranca.tipo==='entulho')poeira(d.x,Y_SUB+0.6,d.z,16);
  if(typeof diarioEvento==='function')diarioEvento('Abriu caminho: '+d.B.nome,'subsolo');ganharXP(10);if(typeof subPortaAberta==='function')subPortaAberta(d);}
function subPortaUsar(d,seg){const T=d.tranca,D=subD();if(d.aberta)return;
  if(T.tipo==='cartao'||T.tipo==='chave'){if(invCount(T.item))subAbrirPorta(d,ITEMS[T.item].nome+': '+(T.tipo==='chave'?'portão aberto':'porta aberta'));else{feed('Trancada: precisa do '+ITEMS[T.item].nome.toLowerCase(),true);sfx('erroBip',d.x,d.z);}return;}
  if(T.tipo==='codigo'){abrirTeclado(d);return;}
  if(T.tipo==='energia'){if(D.energia.bunker)subAbrirPorta(d,'A porta elétrica abriu');else{feed('Sem energia. O gerador do bunker precisa de gasolina.',true);sfx('erroBip',d.x,d.z);}return;}
  if(T.tipo==='rachada'){const s=temQuebraSub();if(!s){feed('Precisa de machado, marreta ou picareta',true);return;}if(!seg)return;gastar(s,8);subAbrirPorta(d,'A parede cedeu: tinha uma sala escondida atrás!');barulho(d.x,d.z,22,true,Y_SUB);return;}
  if(T.tipo==='entulho'){const s=temPicareta();if(!s){feed('Precisa de uma picareta',true);return;}if(!seg)return;gastar(s,6);subAbrirPorta(d,'Abriu caminho no entulho');ganhar('pedra',3);barulho(d.x,d.z,16,true,Y_SUB);}}
/* teclado numérico */
let tecladoPorta=null,tecladoTxt='',tecladoErros=0;
function abrirTeclado(d){if(G.modo!=='jogo')return;tecladoPorta=d;tecladoTxt='';G.modo='teclado';IN.attack=false;IN.mx=IN.mz=0;tela('t-teclado');$('tc-msg').textContent='';tecladoRender();if(document.pointerLockElement)document.exitPointerLock();sfx('bipe');}
function fecharTeclado(){if(G.modo!=='teclado')return;G.modo='jogo';tela(null);tecladoPorta=null;}
function tecladoRender(){const el=$('tc-visor');if(el)el.textContent=(tecladoTxt+'____').slice(0,4).split('').join(' ');}
function tecladoTecla(k){if(!tecladoPorta)return;const msg=$('tc-msg');
  if(k==='apagar'){tecladoTxt=tecladoTxt.slice(0,-1);sfx('bipe');tecladoRender();return;}
  if(k==='ok'){const d=tecladoPorta,cod=d.codigo?d.codigo():subD().codigo[d.tranca.cod];if(tecladoTxt===cod){fecharTeclado();if(d.abrir)d.abrir();else subAbrirPorta(d,'Código aceito: porta aberta');}
    else{sfx('erroBip');tecladoErros++;msg.textContent=tecladoTxt.length<4?'O código tem 4 números':'Código errado';tecladoTxt='';tecladoRender();}return;}
  if(tecladoTxt.length<4){tecladoTxt+=k;sfx('bipe');msg.textContent='';tecladoRender();}}
TELAS_NOVAS.push('t-teclado','t-doc');
{const t=document.getElementById('tc-teclas');if(t)t.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)tecladoTecla(b.dataset.k);});
 const f=document.getElementById('tc-fechar');if(f)f.addEventListener('click',fecharTeclado);
 const fd=document.getElementById('doc-fechar');if(fd)fd.addEventListener('click',fecharDoc);}
window.addEventListener('keydown',e=>{if(G.modo==='teclado'){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;if(e.code==='Escape'||e.code==='Tab'){fecharTeclado();return;}
    if(/^(Digit|Numpad)\d$/.test(e.code))tecladoTecla(e.code.slice(-1));else if(e.code==='Backspace')tecladoTecla('apagar');else if(e.code==='Enter'||e.code==='NumpadEnter')tecladoTecla('ok');return;}
  if(G.modo==='doc'&&(e.code==='Escape'||e.code==='KeyE'||e.code==='Tab'||e.code==='Enter')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)fecharDoc();}},true);
/* ---------- documentos (terminais e cadernos) ---------- */
function docTexto(id){const D=subD(),cl=D.codigo.lab,ca=D.codigo.arsenal;return({
  ordem77:['Terminal do comando · Ordem 77','Para: Destacamento Serra Velha. Assunto: Projeto Esporo.<br><br>O laboratório embaixo da torre de rádio perdeu o controle da cultura. Isolem a estação escondida e o túnel do laboratório. Código da porta do túnel (na sala de controle da estação): <b>'+cl+'</b>.<br><br>Ninguém entra sem máscara. Ninguém sai.'],
  inventario:['Terminal do arsenal','Inventário: fuzis, espingardas, coletes, máscaras de gás.<br><br>Nota do sargento: a porta da sala de controle da estação escondida usa o mesmo código do arsenal: <b>'+ca+'</b>. Troquem isso, pelo amor de Deus.<br><br>O túnel de serviço sai da casa do gerador. A porta é elétrica: sem gerador, nada feito.'],
  linha:['Painel da estação escondida','Linha de carga Serra Velha. O trem de abastecimento do laboratório parava aqui, embaixo da serra, e seguia pelo túnel até a cidade.<br><br>A ponte do Rio Claro caiu na noite da evacuação e o trem ficou parado na linha.<br><br>Túnel do laboratório: porta com teclado. O código está no terminal do comando, no bunker.'],
  mina:['Livro do encarregado da mina','A galeria nova furou um buraco natural: uma caverna enorme. Os homens dizem que ouvem coisa lá dentro. Fechei com entulho até o engenheiro vir.<br><br>O portão de ferro da estação dos militares fica trancado. A chave eu deixei com a minha mulher, no abrigo da vila.'],
  abrigo:['Caderno do abrigo da vila','Dia 3 no abrigo. O rádio só chia.<br><br>O Zé da mina deixou a chave do portão da estação com a gente antes de subir para procurar a filha. Não voltou.<br><br>Se alguém ler isso: a chave está no baú. E não desça na mina à noite.'],
  seguranca:['Terminal da segurança do laboratório','ALERTA DE CONTENÇÃO.<br><br>A cultura passou para a ventilação. Esporos em todo o setor de cultivo: use máscara de gás. O cartão de acesso das salas internas está no armário desta sala.<br><br>A saída de emergência é a escada do poço, que sobe para dentro da torre de rádio.'],
  cultivo:['Relatório de cultivo · Projeto Esporo','A planta não é só uma planta. Ela solta esporos que deixam os mortos mais fortes e cresce em cima de tudo que o homem largou.<br><br>O núcleo, no fundo do setor, alimenta a mata hostil inteira. Se ele queimar, a mata morre junto.<br><br>Uma amostra viva, levada para uma centrífuga, daria um soro contra os esporos. Mas a mata continuaria crescendo.'],
  nucleo:['O núcleo do Projeto Esporo','O coração da mata hostil pulsa na sua frente.<br><br><b>Queimar o núcleo</b>: 2 galões de gasolina e fogo. A mata hostil morre e os esporos acabam, mas a pesquisa vai junto.<br><br><b>Colher a cepa viva</b>: precisa de uma garrafa vazia. Levada para a centrífuga da base, vira um soro contra os esporos, mas a mata continua viva.']}[id])||['?','...'];}
let docAberto=null;
function abrirDoc(id){if(G.modo!=='jogo')return;const D=subD(),[t,x]=docTexto(id);docAberto=id;G.modo='doc';tela('t-doc');$('doc-tit').textContent=t;$('doc-txt').innerHTML=x;if(document.pointerLockElement)document.exitPointerLock();
  if(!D.docs[id]){D.docs[id]=true;ganharXP(8);if(typeof diarioDescobre==='function')diarioDescobre('manual','doc_'+id,t);if(typeof subDocLido==='function')subDocLido(id);}sfx('clique');}
function fecharDoc(){if(G.modo!=='doc')return;G.modo='jogo';tela(null);docAberto=null;}
/* ---------- interações lá embaixo e nas entradas ---------- */
INTERS.push(tryIt=>{const sub=P.y<SUB_FUNDO;
  for(const e of SUB.entradas){if(sub){if(Math.abs(e.sub[0]-P.x)<3&&Math.abs(e.sub[1]-P.z)<3)tryIt({k:'saidaSub',o:e},e.sub[0],e.sub[1],2.0,2.4,-1,Y_SUB);}
    else if(Math.abs(e.sup[0]-P.x)<3.5&&Math.abs(e.sup[1]-P.z)<3.5)tryIt({k:'entradaSub',o:e},e.sup[0],e.sup[1],2.4,2.4,-1);}
  if(!sub)return;
  for(const d of SUB.portas)if(!d.aberta&&Math.abs(d.x-P.x)<3&&Math.abs(d.z-P.z)<3)tryIt({k:'portaSub',o:d},d.x,d.z,2.1,2.2,-0.6,Y_SUB);
  for(const t of SUB.terminais)if(Math.abs(t.x-P.x)<3&&Math.abs(t.z-P.z)<3)tryIt({k:'terminalSub',o:t},t.x,t.z,1.9,2,-0.4,Y_SUB);
  for(const c of SUB.caixas)if(Math.abs(c.x-P.x)<3&&Math.abs(c.z-P.z)<3)tryIt({k:'caixaSub',o:c},c.x,c.z,1.9,1.8,-0.4,Y_SUB);
  for(const v of SUB.veios)if(Math.abs(v.x-P.x)<3&&Math.abs(v.z-P.z)<3)tryIt({k:'veioSub',o:v},v.x,v.z,2,1.6,-0.4,Y_SUB);
  {const g=SUB.geradorBunker;if(Math.abs(g.x-P.x)<3&&Math.abs(g.z-P.z)<3)tryIt({k:'geradorSub',o:g},g.x,g.z,2.1,2,-0.4,Y_SUB);}});
INTER_K.entradaSub={texto:e=>{const tr=e.trancada,D=subD();if(tr&&tr.tipo==='dentro'&&!D.abertas['ent_'+e.id])return{t:e.nome+': portão de aço fechado',s:'só abre por dentro'};if(tr&&tr.item&&!D.abertas['ent_'+e.id]&&!invCount(tr.item))return{t:e.nome+': trancado',s:'precisa do '+ITEMS[tr.item].nome.toLowerCase()};
    return{t:(e.tipo==='caverna'||e.tipo==='mina'?'Entrar na ':e.tipo==='portal'?'Entrar no ':'Descer: ')+e.nome.toLowerCase(),s:D.visitou[e.c.id]?e.c.nome:'lugar desconhecido'};},
  usar:e=>{const tr=e.trancada,D=subD();if(tr&&tr.tipo==='dentro'&&!D.abertas['ent_'+e.id]){feed('O portão de aço está trancado por dentro',true);sfx('erroBip');return;}if(tr&&tr.item&&!D.abertas['ent_'+e.id]){if(!invCount(tr.item)){feed('Trancado: precisa do '+ITEMS[tr.item].nome.toLowerCase(),true);sfx('erroBip');return;}D.abertas['ent_'+e.id]=true;feed(ITEMS[tr.item].nome+': aberto');}subDescer(e);}};
INTER_K.saidaSub={texto:e=>{const tr=e.trancada;if(tr&&tr.tipo==='dentro'&&!subD().abertas['ent_'+e.id])return{t:'Abrir o portão do túnel',s:'alavanca: o portão de aço abre para fora'};return{t:(e.tipo==='portal'?'Sair pelo ':'Subir: ')+e.nome.toLowerCase(),s:'volta para a superfície'};},
  usar:e=>{const tr=e.trancada,D=subD();if(tr&&tr.tipo==='dentro'&&!D.abertas['ent_'+e.id]){D.abertas['ent_'+e.id]=true;sfx('portaMetal');feed('O portão do túnel abriu: agora é um atalho');if(typeof diarioEvento==='function')diarioEvento('Abriu o portão do túnel da serra','subsolo');ganharXP(15);return;}subSubir(e);}};
INTER_K.portaSub={texto:d=>subPortaTexto(d),usar:(d,seg)=>subPortaUsar(d,seg)};
INTER_K.terminalSub={texto:t=>({t:(subD().docs[t.doc]?'Ler de novo: ':'Ler: ')+(t.papel?'caderno':'terminal'),s:docTexto(t.doc)[0]}),usar:t=>abrirDoc(t.doc)};
INTER_K.caixaSub={texto:c=>{const L=subD().caixas[c.id];return{t:'Revistar: '+c.nome.toLowerCase(),s:L?(L.some(Boolean)?'ainda tem coisa':'vazio'):''};},usar:c=>{const D=subD();let L=D.caixas[c.id];
  if(!L){L=new Array(BAU_N).fill(null);let i=0;for(const id of c.fixo||[])if(i<BAU_N)L[i++]=newItem(id,1);for(const[id,n,ex]of rollLoot(c.tab)){if(i>=BAU_N)break;if(ITEMS[id])L[i++]=Object.assign(newItem(id,n),ex||{});}
    D.caixas[c.id]=L;ganharXP(6);}
  abrirBau({itens:L,nome:c.nome,saque:true,aoMudar:()=>{}});}};
INTER_K.veioSub={texto:v=>{const D=subD(),q=D.veios[v.id];if(q&&G.tm<q)return{t:'Veio esgotado',s:'volta a dar minério em '+horasTxt(q-G.tm)};return temPicareta()?{t:'Minerar o veio de ferro',s:'segure',hold:true,dur:2.2}:{t:'Veio de minério de ferro',s:'precisa de picareta'};},
  usar:(v,seg)=>{const D=subD();if(D.veios[v.id]&&G.tm<D.veios[v.id])return;const s=temPicareta();if(!s){feed('Precisa de uma picareta',true);return;}if(!seg)return;
    gastar(s,3);ganhar('minerioFerro',2+(Math.random()<0.4?1:0));if(Math.random()<0.3)ganhar('pedra',1);if(Math.random()<0.12)ganhar('carvao',1);D.veios[v.id]=G.tm+2880;sfx('pedra',v.x,v.z);lascas(v.x,Y_SUB+1,v.z,[0.45,0.3,0.25,1]);ganharXP(4);
    if(typeof diarioConta==='function')diarioConta('minerou',1);}};
SUB.geradorBunker={x:-93,z:-31};
INTER_K.geradorSub={texto:g=>{const D=subD();return D.energia.bunker?{t:'Gerador do bunker ligado',s:'portas e luzes com energia'}:{t:invCount('gasolina')?'Abastecer o gerador do bunker':'Gerador do bunker',s:invCount('gasolina')?'1 galão: liga as luzes e a porta elétrica':'precisa de 1 galão de gasolina'};},
  usar:g=>{const D=subD();if(D.energia.bunker)return;if(!invCount('gasolina')){feed('Precisa de 1 galão de gasolina',true);sfx('vazio');return;}invRemove('gasolina',1);D.energia.bunker=true;sfx('motor',g.x,g.z,0.8);feed('O gerador do bunker pegou: luzes e porta elétrica');
    if(typeof diarioEvento==='function')diarioEvento('Ligou o gerador do bunker','subsolo');barulho(g.x,g.z,25,false,Y_SUB);hudBarra();}};
/* chega numa sala nova: mostra o nome (uma vez) */
let subSalaT=0,subSalaUlt=null;
PASSOS.push(dt=>{subSalaT-=dt;if(subSalaT>0)return;subSalaT=0.5;if(P.y>SUB_FUNDO){subSalaUlt=null;return;}const s=salaSubEm(P.x,P.y+0.3,P.z);if(!s||s===subSalaUlt)return;subSalaUlt=s;
  const D=subD();if(!D.salaVista[s.id]){D.salaVista[s.id]=true;feed(s.nome);}});
/* ---------- desenho ---------- */
let SUB_MALHAS=null;
function subGeo(c){const g=new GB(32768,8),R=rng(c.seed),C=c.cor;
  const box=(x0,x1,y0,y1,z0,z1,col,s,j)=>add(g,boxTris(x1-x0,y1-y0,z1-z0),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),lin(col),{b:s.escura,j:j??0.06,rnd:R});
  for(const s of c.salas){const y=s.y,t=s.teto,pc=s.rocha?0x5a524a:C.par;
    if(!s.modelo){box(s.x0,s.x1,y-0.3,y,s.z0,s.z1,s.rocha?0x4a4440:C.piso,s,s.rocha?0.14:0.05);box(s.x0,s.x1,t,t+0.3,s.z0,s.z1,s.rocha?0x3a3530:C.teto,s,s.rocha?0.14:0.05);}
    for(const p of s.paredes){if(s.modelo&&(p.lado==='n'||p.lado==='s'))continue;   // sala com modelo: só as paredes das pontas
      box(p.x0,p.x1,y,t,p.z0,p.z1,pc,s,s.rocha?0.18:0.05);
      if(s.rocha){const n=Math.max(1,Math.floor((p.b1-p.b0)/1.5));for(let k=0;k<n;k++){const u=p.b0+(k+0.5)*(p.b1-p.b0)/n,L=p.lado==='n'||p.lado==='s',px=L?u:(p.lado==='o'?s.x0+0.3:s.x1-0.3),pz=L?(p.lado==='n'?s.z0+0.3:s.z1-0.3):u;
          add(g,icoSubTris(0.5+R()*0.4,0.45,R,1),mat(px,y+0.3+R()*(t-y-0.6),pz),lin(R()<0.5?0x5f5750:0x4f4842),{b:s.escura,j:0.12,rnd:R});}}
      else if(c.tipo!=='tunel'&&p.b1-p.b0>2){const L=p.lado==='n'||p.lado==='s',px=L?(p.x0+p.x1)/2:(p.lado==='o'?s.x0+0.31:s.x1-0.31),pz=L?(p.lado==='n'?s.z0+0.31:s.z1-0.31):(p.z0+p.z1)/2;   // faixa no meio da parede
        add(g,boxTris(L?p.x1-p.x0:0.02,0.18,L?0.02:p.z1-p.z0),mat(px,y+1.05,pz),lin(c.tipo==='lab'?0x3a7a6a:c.tipo==='militar'?0x5a6040:0x6a5a40),{b:s.escura});}}
    // vergas em cima das passagens
    for(const l of['n','s','o','l'])for(const[o0,o1]of s.ab[l]){if(l==='n'||l==='s'){const z=l==='n'?s.z0+0.15:s.z1-0.15;box(o0,o1,y+2.25,t,z-0.15,z+0.15,pc,s);}
      else{const x=l==='o'?s.x0+0.15:s.x1-0.15;box(x-0.15,x+0.15,y+2.25,t,o0,o1,pc,s);}}}
  for(const p of SUB.props)if(p.c===c)p.f(g,R);
  return litMesh(g.data());}
INIT_MALHAS.push(()=>{subMontar();SUB_MALHAS=SUB.complexos.map(c=>({c,m:subGeo(c),x0:Math.min(...c.salas.map(s=>s.x0)),x1:Math.max(...c.salas.map(s=>s.x1)),z0:Math.min(...c.salas.map(s=>s.z0)),z1:Math.max(...c.salas.map(s=>s.z1))}));
  const R=rng(919),mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());};
  MESH.subPorta=mk(g=>{add(g,boxTris(1,2.2,0.12),mat(0,1.1,0),lin(0x5a6066),{b:0.9,j:0.04,rnd:R});add(g,boxTris(0.94,0.08,0.14),mat(0,1.6,0),lin(0x484c50),{b:0.9});add(g,boxTris(0.94,0.08,0.14),mat(0,0.6,0),lin(0x484c50),{b:0.9});add(g,boxTris(0.12,0.16,0.18),mat(0.36,1.1,0),lin(0xc9a227),{b:0.9,e:0.4});});
  MESH.subPortaLab=mk(g=>{add(g,boxTris(1,2.2,0.12),mat(0,1.1,0),lin(0xd8dcd8),{b:0.88,j:0.03,rnd:R});add(g,boxTris(0.5,0.3,0.14),mat(0,1.5,0),lin(0x9ab0b8),{b:0.88,e:0.15});add(g,boxTris(0.12,0.16,0.18),mat(0.36,1.1,0),lin(0x3aa070),{b:0.88,e:0.8});});
  MESH.subGrade=mk(g=>{for(let i=0;i<7;i++)add(g,boxTris(0.05,2.2,0.05),mat(-0.45+i*0.15,1.1,0),lin(0x4a4038),{b:0.94});for(const y of[0.3,1.1,1.9])add(g,boxTris(1,0.06,0.06),mat(0,y,0),lin(0x4a4038),{b:0.94});add(g,boxTris(0.14,0.2,0.12),mat(0.3,1.1,0.05),lin(0x6a5a3a),{b:0.94});});
  MESH.subRacha=mk(g=>{add(g,boxTris(1,2.25,0.32),mat(0,1.12,0),lin(0x76786f),{b:0.93,j:0.08,rnd:R});for(let i=0;i<7;i++)add(g,boxTris(0.03,0.5+R()*0.5,0.34),mat(-0.35+R()*0.7,0.4+R()*1.5,0,0,0,(R()-0.5)*1.4),lin(0x2a2826),{b:0.93});});
  MESH.subEntulho=mk(g=>{for(let i=0;i<11;i++)add(g,icoSubTris(0.3+R()*0.35,0.45,R,1),mat((R()-0.5)*1.1,0.25+R()*1.9,(R()-0.5)*0.5),lin(R()<0.5?0x5a524a:0x6a6058),{b:0.95,j:0.12,rnd:R});});
  MESH.subTerminal=mk(g=>{add(g,boxTris(0.62,1.15,0.42),mat(0,0.575,0),lin(0x3a3e40),{b:0.9});add(g,boxTris(0.5,0.34,0.05),mat(0,0.98,0.215),lin(0x3aa070),{e:1.6,b:0.9});add(g,boxTris(0.5,0.05,0.25),mat(0,0.74,0.3),lin(0x2a2e30),{b:0.9});});
  MESH.subCaderno=mk(g=>{add(g,boxTris(0.8,0.75,0.5),mat(0,0.375,0),lin(0x6b4e30),{b:0.92,j:0.05,rnd:R});add(g,boxTris(0.3,0.03,0.22),mat(0,0.77,0),lin(0xd8cfa8),{b:0.92});add(g,boxTris(0.3,0.012,0.22),mat(0.005,0.79,0.004),lin(0x8a2a20),{b:0.92});});
  MESH.subCaixa=mk(g=>{add(g,boxTris(0.9,0.6,0.55),mat(0,0.3,0),lin(0x4a5236),{b:0.92,j:0.05,rnd:R});add(g,boxTris(0.94,0.05,0.59),mat(0,0.6,0),lin(0x3c4430),{b:0.92});add(g,boxTris(0.14,0.08,0.03),mat(0,0.45,0.29),lin(0x8a9096),{b:0.92});});
  MESH.subArmario=mk(g=>{add(g,boxTris(0.9,1.8,0.5),mat(0,0.9,0),lin(0x5a6066),{b:0.92,j:0.04,rnd:R});add(g,boxTris(0.02,1.7,0.52),mat(0,0.9,0),lin(0x3a3e40),{b:0.92});for(const s of[-0.08,0.08])add(g,boxTris(0.03,0.15,0.03),mat(s,1.0,0.27),lin(0xb0b4b8),{b:0.92});});
  MESH.subVeio=mk(g=>{for(let i=0;i<5;i++)add(g,icoSubTris(0.3+R()*0.25,0.5,R,1),mat((R()-0.5)*0.7,0.4+R()*1.4,(R()-0.5)*0.2),lin(i%2?0x7a3a20:0x8a5a40),{b:0.95,j:0.15,rnd:R});
    for(let i=0;i<7;i++)add(g,boxTris(0.08,0.08,0.08),mat((R()-0.5)*0.8,0.4+R()*1.5,0.25),lin(0xc8b8a0),{e:0.5,b:0.95});});
  MESH.subLamp=mk(g=>{add(g,boxTris(0.7,0.06,0.2),mat(0,0,0),lin(0xfff4d0),{e:3});add(g,boxTris(0.76,0.04,0.26),mat(0,0.04,0),lin(0x3a3e40));});
  MESH.subLampLab=mk(g=>{add(g,boxTris(0.5,0.06,0.16),mat(0,0,0),lin(0x8affb0),{e:2.2});add(g,boxTris(0.56,0.04,0.22),mat(0,0.04,0),lin(0x3a3e40));});
  MESH.subAlcapao=mk(g=>{add(g,boxTris(1.7,0.22,1.7),mat(0,0.11,0),lin(0x6a6c66),{j:0.05,rnd:R});add(g,boxTris(1.2,0.06,1.2),mat(0,0.24,0),lin(0x4a5236),{j:0.04,rnd:R});
    add(g,cylTris(0.22,0.22,0.05,12,{bottom:true}),mat(0,0.28,0),lin(0x2b2b2b));add(g,boxTris(0.04,0.04,0.42),mat(0,0.3,0),lin(0x2b2b2b));add(g,boxTris(0.42,0.04,0.04),mat(0,0.3,0),lin(0x2b2b2b));});
  MESH.subAlcapaoMadeira=mk(g=>{add(g,boxTris(1.5,0.16,1.5),mat(0,0.08,0),lin(0x5a4430),{j:0.08,rnd:R});for(let i=0;i<5;i++)add(g,boxTris(1.3,0.04,0.24),mat(0,0.18,-0.52+i*0.26),lin(0x6b4e30),{j:0.1,rnd:R});add(g,boxTris(0.1,0.05,0.35),mat(0.45,0.22,0),lin(0x3a3a38));});
  MESH.subCaverna=mk(g=>{for(let i=0;i<16;i++){const a=-0.25+i/15*(Math.PI+0.5);add(g,icoSubTris(0.75+R()*0.6,0.4,R,1),mat(Math.cos(a)*2.3,0.2+Math.sin(a)*2.5,(R()-0.5)*0.8),lin(R()<0.5?0x5f5750:0x6b625a),{j:0.12,rnd:R});}
    add(g,ellipTris(1.9,2.1,0.35,12,6),mat(0,0.95,0.35),lin(0x080706),{});for(let i=0;i<6;i++)add(g,icoSubTris(0.5+R()*0.4,0.4,R,1),mat((R()-0.5)*5,0.1,-0.6-R()*0.8),lin(0x5a524a),{j:0.12,rnd:R});});
  MESH.subMina=mk(g=>{const md=lin(0x5a4430);for(const s of[-1,1])add(g,boxTris(0.26,2.9,0.26),mat(s*1.35,1.45,0),md,{j:0.08,rnd:R});add(g,boxTris(3.1,0.3,0.32),mat(0,2.95,0),md,{j:0.08,rnd:R});
    add(g,boxTris(2.44,2.75,0.3),mat(0,1.37,0.32),lin(0x080706));add(g,boxTris(1.4,0.5,0.06),mat(0,3.4,-0.12),lin(0x7a6a4a),{j:0.1,rnd:R});add(g,boxTris(1.2,0.08,0.07),mat(0,3.4,-0.16),lin(0x2a2018));
    for(let i=0;i<12;i++){const a=R()*Math.PI;add(g,icoSubTris(0.7+R()*0.6,0.4,R,1),mat(Math.cos(a)*(2.2+R()*1.2),0.3+Math.sin(a)*3.2,0.9+R()*0.6),lin(0x5f5750),{j:0.12,rnd:R});}
    for(const x of[-0.5,0.5])add(g,boxTris(0.07,0.07,3),mat(x,0.04,-1.2),lin(0x6a6a68));});});
function subYaw(o){if(o._yaw!==undefined)return o._yaw;const s=salaSubEm(o.x,Y_SUB+1,o.z);let y=0;if(s){const d=[[o.z-s.z0,0],[s.z1-o.z,Math.PI],[o.x-s.x0,Math.PI/2],[s.x1-o.x,-Math.PI/2]].sort((a,b)=>a[0]-b[0]);y=d[0][1];}o._yaw=y;return y;}
function subPerto(m,px,pz,r){return px>m.x0-r&&px<m.x1+r&&pz>m.z0-r&&pz<m.z1+r;}
function subDesenhar(Pg){if(!SUB_MALHAS)return;const cy=cam.pos[1],sub=P.y<SUB_FUNDO||cy<SUB_FUNDO;
  if(sub){const D=subD(),px=cam.pos[0],pz=cam.pos[2];for(const M of SUB_MALHAS)if(subPerto(M,px,pz,60))drawStat(Pg,M.m,ID);
    for(const d of SUB.portas){if(d.aberta||d2(d.x,d.z,px,pz)>60*60)continue;const t=d.tranca.tipo,m=t==='rachada'?MESH.subRacha:t==='entulho'?MESH.subEntulho:t==='chave'?MESH.subGrade:d.A.c.tipo==='lab'||d.B.c.tipo==='lab'?MESH.subPortaLab:MESH.subPorta;
      drawStat(Pg,m,mat(d.x,Y_SUB,d.z,0,d.eixo==='x'?0:Math.PI/2,0,t==='rachada'||t==='entulho'?d.w+0.1:d.w,1,1));}
    for(const t of SUB.terminais)if(d2(t.x,t.z,px,pz)<50*50)drawStat(Pg,t.papel?MESH.subCaderno:MESH.subTerminal,mat(t.x,Y_SUB,t.z,0,subYaw(t),0));
    for(const c of SUB.caixas)if(d2(c.x,c.z,px,pz)<50*50)drawStat(Pg,/Armário|Prateleira/.test(c.nome)?MESH.subArmario:MESH.subCaixa,mat(c.x,Y_SUB,c.z,0,subYaw(c),0));
    for(const v of SUB.veios)if(!(D.veios[v.id]&&G.tm<D.veios[v.id])&&d2(v.x,v.z,px,pz)<50*50)drawStat(Pg,MESH.subVeio,mat(v.x,Y_SUB,v.z,0,subYaw(v),0));
    for(const l of SUB.lampadas)if((D.energia[l.e]||l.e==='lab')&&d2(l.x,l.z,px,pz)<50*50)drawStat(Pg,l.e==='lab'?MESH.subLampLab:MESH.subLamp,mat(l.x,l.y,l.z));}
  if(cy>SUB_FUNDO)for(const e of SUB.entradas){if(e.tipo==='portal'||d2(e.sup[0],e.sup[1],cam.pos[0],cam.pos[2])>150*150)continue;const m=e.tipo==='caverna'?MESH.subCaverna:e.tipo==='mina'?MESH.subMina:e.id==='abrigo'?MESH.subAlcapaoMadeira:MESH.subAlcapao;
    drawStat(Pg,m,mat(e.sup[0],ground(e.sup[0],e.sup[1])-(e.tipo==='alcapao'?0.06:0.25),e.sup[1],0,e.sup[2],0));}}
DESENHO.opaco.push(subDesenhar);
DESENHO.sombra.push(Pg=>{if(!SUB_MALHAS||P.y>SUB_FUNDO)return;for(const M of SUB_MALHAS)if(subPerto(M,P.x,P.z,40))drawStat(Pg,M.m,ID);});
/* luz lá embaixo: a lâmpada acesa mais perto (com gerador; as do laboratório são de emergência, verdes e fracas) */
function luzSub(put){if(P.y>SUB_FUNDO||!SUB.lampadas.length)return;const D=subD(),ps=salaSubEm(P.x,P.y+0.3,P.z),c=[];
  for(const l of SUB.lampadas){if(!(D.energia[l.e]||l.e==='lab'))continue;if(l.sala===undefined)l.sala=salaSubEm(l.x,Y_SUB+1,l.z);const d=d2(l.x,l.z,P.x,P.z);if(d>26*26)continue;c.push([d+(l.sala===ps?0:220),l]);}
  c.sort((a,b)=>a[0]-b[0]);for(let i=0;i<Math.min(2,c.length);i++){const l=c[i][1];put(l.x,l.y-0.25,l.z,l.e==='lab'?10:16,l.e==='lab'?[0.45,1.5,0.7]:[2.8,2.5,2.0]);}}
/* minimapa: as entradas que você já usou */
MAPA_DESENHOS.push((g,X,Y,k,n)=>{const D=G.sub;if(!D)return;g.lineWidth=1.5;for(const e of SUB.entradas){if(!D.visitou[e.c.id])continue;const x=X(e.sup[0]),y=Y(e.sup[1]);
  g.fillStyle=n>0.5?'#2a2620':'#3a342a';g.strokeStyle=n>0.5?'#a89060':'#e0c070';g.beginPath();g.rect(x-3.5,y-3.5,7,7);g.fill();g.stroke();g.beginPath();g.moveTo(x-2,y+1);g.lineTo(x,y-1.5);g.lineTo(x+2,y+1);g.stroke();}});
/* sons */
SONS.portaMetal=({noise,tone,r})=>{noise(0.5,'lowpass',900*r(),200,1.2,0.5);tone(0.35,'square',90*r(),60,0.08,0.05);noise(0.12,'bandpass',2400,1800,4,0.25,0.42);};
SONS.bipe=({tone,r})=>{tone(0.07,'square',1320*r(),1320,0.05);};
SONS.erroBip=({tone})=>{tone(0.18,'square',240,220,0.07);tone(0.18,'square',240,220,0.07,0.22);};
SONS.escadaSub=({noise,r})=>{for(let i=0;i<5;i++)noise(0.08,'bandpass',1500*r(),900,3,0.22,i*0.17);};
/* ---------- salvar e carregar ---------- */
V8.novo.subsolo=()=>{G.sub=subNovo();for(const d of SUB.portas){d.aberta=false;subPortaColisor(d);}};
V8.salvar.subsolo=()=>G.sub;
V8.carregar.subsolo=s=>{G.sub=s&&s.codigo?s:subNovo();const D=G.sub;for(const k of['abertas','docs','energia','visitou','caixas','veios','populou','salaVista'])D[k]=D[k]||{};
  for(const d of SUB.portas){d.aberta=!!D.abertas[d.id];subPortaColisor(d);}};
/* o cartão militar: no armário do comandante, no alojamento norte da base (só na primeira vez) */
INIT_MALHAS.push(()=>{const X=BASEM.x,Zc=BASEM.z;if(!INTER.some(i=>i.id==='base-comandante'))interAdd({id:'base-comandante',kind:'bau',x:X-3.5,z:Zc+6.7,label:'Revistar o armário do comandante',tabela:'comandante',respawn:5,primeiro:[['cartaoMilitar',1]]});});

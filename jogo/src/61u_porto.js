/* ================= Etapa 20: porto, navio cargueiro, naufrágios e a praia =================
   PORTO: a avenida do meio da cidade (z = 8) passa pela abertura do tapume e vira o cais de concreto (x 336 a 376), com
   cabeços, pneus de atracação, postes, um guindaste, uma guarita (armário para revistar) e contêineres. A parede do cais
   mostra a marca da maré (lodo verde entre a maré baixa e a alta).
   NAVIO: o cargueiro Atlântico Sul está encalhado no canal ao lado do cais (o casco assentou no fundo: não sobe nem desce
   com a maré). Uma prancha sobe do cais ao convés. No convés, 18 pilhas de contêineres; os de baixo têm porta para o corredor:
   uns estão abertos (revistar), outros com cadeado (pé de cabra arromba, faz barulho). A ponte de comando tem uma porta;
   dentro, o armário do comandante. Tem zumbi da tripulação no convés e no cais.
   NAUFRÁGIOS: o pesqueiro Esperança está deitado no banco de areia ao sudeste do cais: na maré baixa dá para ir andando
   (água pela cintura); na alta, nadando. Cabine e porão para revistar. Longe da praia, a nordeste, um veleiro afundado a
   uns 6 m: só mergulhando (segure C nadando) se chega no baú dele.
   PRAIA: rampa de barcos (para o reboque), um barco a motor abandonado na areia (conserta e reboca), o reboque do porto,
   quiosque (revistar), posto de salva-vidas, o farol velho na ponta norte, pedras na ponta e troncos trazidos pela maré. */
iconesNovos({'i-conteiner':'<path d="M3 7h18v11H3z"/><path d="M7 7v11M11 7v11M15 7v11M19 7v11"/>',
  'i-navio':'<path d="M3 15h18l-3 5H6z"/><path d="M6 15V9h7v6M13 11h4v4"/><path d="M8 9V6h3v3"/>',
  'i-ancora':'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8"/><path d="M4 14c0 4 4 7 8 7s8-3 8-7"/>',
  'i-farol':'<path d="M9 21l1.5-14h3L15 21z"/><path d="M8.5 7h7l-1-3h-5z"/><path d="M4 5l4 1M20 5l-4 1"/>'});
/* ---------- loot ---------- */
Object.assign(LOOT,{
  conteiner:[['sucata',2,5,0.55],['chapaFerro',1,3,0.3],['pregos',3,8,0.35],['corda',1,3,0.35],['pano',2,6,0.35],['camiseta',1,2,0.18],['bermuda',1,1,0.12],
    ['pecasMaquina',1,2,0.22],['pecasCarro',1,2,0.18],['pneu',1,1,0.12],['oleoMotor',1,2,0.2],['pilhas',1,3,0.2],['fita',1,2,0.2],['biscoito',1,4,0.25],['refri',1,4,0.25],
    ['feijao',1,3,0.2],['agua',1,3,0.2],['lanterna',1,1,0.06],['kitFerramentas',1,1,0.05],['fio',2,5,0.15],['bateriaVeic',1,1,0.05]],
  capitao:[['sinalizador',1,2,0.6],['kit',1,1,0.5],['remedios',1,2,0.4],['pistola',1,1,0.12],['municao9',4,12,0.45],['mapaSecreto',1,1,0.35],['isqueiro',1,1,0.4],['cafe',1,2,0.4],['lanterna',1,1,0.3],['mascaraMergulho',1,1,0.25]],
  guarita:[['agua',1,2,0.5],['cafe',1,1,0.4],['biscoito',1,2,0.4],['lanterna',1,1,0.15],['pilhas',1,2,0.3],['fita',1,1,0.25],['corda',1,2,0.3],['mapaSecreto',1,1,0.08]],
  quiosque:[['refri',1,4,0.6],['agua',1,3,0.5],['biscoito',1,3,0.4],['isqueiro',1,1,0.15],['sal',1,2,0.35],['garrafa',1,2,0.3],['vara',1,1,0.12]],
  salvaVidas:[['bandagem',1,3,0.5],['kit',1,1,0.25],['corda',1,3,0.4],['sinalizador',1,1,0.2],['agua',1,2,0.4],['mascaraMergulho',1,1,0.35]],
  naufragio:[['corda',1,3,0.5],['sucata',1,4,0.5],['garrafa',1,2,0.3],['vara',1,1,0.25],['isqueiro',1,1,0.15],['peixeCru',1,2,0.2],['lanterna',1,1,0.12],['sinalizador',1,1,0.12]],
  naufragioPorao:[['sucata',2,6,0.6],['corda',2,4,0.45],['oleoMotor',1,2,0.35],['gasolina',1,2,0.35],['pecaVeiculo',1,1,0.2],['chapaFerro',1,2,0.3],['mascaraMergulho',1,1,0.2]],
  veleiro:[['kit',1,2,0.55],['sinalizador',1,2,0.5],['pistola',1,1,0.25],['municao9',6,16,0.5],['mapaSecreto',1,1,0.5],['lanterna',1,1,0.3],['remedios',1,3,0.5],['kitFerramentas',1,1,0.15]]});
/* ---------- planta do porto ---------- */
const NAV=PORTO.navio,NV={proa:-38,popa:38,hw:6,cont:{L:6.06,W:2.44,H:2.59},baias:[-21.47,-13.58,-5.69,2.2,10.09,17.98],cols:[-2.44,0,2.44],casa:{v0:24,v1:35,hw:5.2},prancha:{z:14,x0:366}};
const navW=v=>v<-26?6*Math.sqrt(Math.max(0,1-((v+26)/12)**2)):v>35?6-(v-35)/3*0.8:6;
const navP=(u,v)=>[NAV.x+u,NAV.z+v];
/* contêineres: as pilhas do convés e as do cais */
const CONTS=[];
(function contsMontar(){const R=rng(2020),cores=[0xa33a2a,0x2d4f7a,0x3d6a45,0xc2672a,0x7a7f84,0xc9a227,0x2f6f73,0xb8b8b0,0x6a2a3a,0x4a5a2a];
  let n=0;for(const v of NV.baias)for(const u of NV.cols){const h=R()<0.42?2:1,cor=[cores[Math.floor(R()*cores.length)],cores[Math.floor(R()*cores.length)]],st=R()<0.5?'aberto':'cadeado';
    const p=navP(u,v);CONTS.push({id:'navio-c'+(++n),x:p[0],z:p[1],y:NAV.yDeck,yaw:0,h,cor,st,navio:true});}
  for(const[x,z,h,st]of[[365.5,-1.9,2,'aberto'],[365.5,0.9,1,'cadeado'],[358.5,-1.9,1,'aberto']])CONTS.push({id:'cais-c'+(++n),x,z,y:PORTO.y,yaw:Math.PI/2,h,cor:[cores[Math.floor(R()*cores.length)],cores[Math.floor(R()*cores.length)]],st});})();
/* posição na frente da porta (porta no lado -z local do contêiner) */
function contPorta(c,d){const L=NV.cont.L/2+(d||0);return[c.x-Math.sin(c.yaw)*L,c.z-Math.cos(c.yaw)*L];}
/* ---------- colisões, pisos e pontos de revistar ---------- */
const PORTO_COLS=[];
function portoMontarMundo(){
  // cais: piso (com rampa curta na saída da cidade), massa de concreto (bloqueia barco e quem nada), meio-fio
  supAdd({t:'ram',x:337,z:8,hw:12,hd:1,yaw:Math.PI/2,ya:0.02,yb:PORTO.y,dono:'cais'});
  supAdd({t:'ret',x:357,z:8,hw:19,hd:12,yaw:0,y:PORTO.y,dono:'cais'});
  PORTO_COLS.push(colBox(342,8,4,12,0,{solid:true,sub:true,y0:-3,y1:PORTO.y,cais:true}),colBox(361,8,15,12,0,{solid:true,sub:true,y0:-12,y1:PORTO.y,cais:true}));
  // guindaste e guarita
  PORTO_COLS.push(colBox(371,16.5,1.0,1.0,0,{solid:true,y0:PORTO.y-0.1,y1:16}));
  {const gx=342.5,gz=16.4;for(const[x,z,hw,hd]of[[gx,gz-1.5,1.6,0.08],[gx,gz+1.5,1.6,0.08],[gx+1.6,gz,0.08,1.5],[gx-1.6,gz-0.95,0.08,0.55],[gx-1.6,gz+0.95,0.08,0.55]])PORTO_COLS.push(colBox(x,z,hw,hd,0,{solid:true,y0:PORTO.y-0.1,y1:PORTO.y+2.6}));
   interAdd({id:'porto-guarita',kind:'bau',x:gx+0.9,z:gz+0.8,y:PORTO.y,yChk:PORTO.y,r:1.6,label:'Revistar o armário da guarita',tabela:'guarita',respawn:3});}
  // prancha do cais ao convés
  {const P0=NV.prancha,x1=NAV.x-NV.hw,L=x1-P0.x0,cx=(P0.x0+x1)/2;supAdd({t:'ram',x:cx,z:P0.z,hw:0.7,hd:L/2,yaw:Math.PI/2,ya:PORTO.y,yb:NAV.yDeck,dono:'prancha'});
   for(const s of[-1,1])PORTO_COLS.push(colBox(cx,P0.z+s*0.72,L/2,0.05,0,{solid:true,y0:PORTO.y+0.4,y1:NAV.yDeck+1.0}));}
  // navio: casco (massa), convés, amurada (com a abertura da prancha), ponte de comando
  PORTO_COLS.push(colBox(NAV.x,NAV.z+6,NV.hw,32,0,{solid:true,sub:true,y0:NAV.quilha,y1:NAV.yDeck-0.05,navio:true}),colBox(NAV.x,NAV.z-32,3.4,6,0,{solid:true,sub:true,y0:NAV.quilha,y1:NAV.yDeck-0.05,navio:true}));
  supAdd({t:'ret',x:NAV.x,z:NAV.z+6,hw:NV.hw-0.15,hd:31.9,yaw:0,y:NAV.yDeck,dono:'navio'});supAdd({t:'ret',x:NAV.x,z:NAV.z-31,hw:3.4,hd:5,yaw:0,y:NAV.yDeck,dono:'navio'});
  {const am=(x,z,hw,hd)=>PORTO_COLS.push(colBox(x,z,hw,hd,0,{solid:true,y0:NAV.yDeck-0.1,y1:NAV.yDeck+1.05}));const gz=NV.prancha.z-NAV.z;
   am(NAV.x+NV.hw-0.06,NAV.z+5.5,0.06,31.5);am(NAV.x-NV.hw+0.06,NAV.z+(-26+gz-1.25)/2,0.06,(gz-1.25+26)/2);am(NAV.x-NV.hw+0.06,NAV.z+(gz+1.25+37)/2,0.06,(37-gz-1.25)/2);am(NAV.x,NAV.z+37.9,NV.hw-0.6,0.06);
   for(const s of[-1,1])for(let v=-37;v<-26;v+=1.5){const u=navW(v+0.75)-0.1;PORTO_COLS.push(colBox(NAV.x+s*u,NAV.z+v+0.75,0.12,0.8,0,{solid:true,y0:NAV.yDeck-0.1,y1:NAV.yDeck+1.05}));}}
  {const C=NV.casa,y0=NAV.yDeck-0.1,y1=NAV.yDeck+8.5,parede=(x,z,hw,hd)=>PORTO_COLS.push(colBox(x,z,hw,hd,0,{solid:true,y0,y1}));
   parede(NAV.x-(C.hw+0.85)/2,NAV.z+C.v0,(C.hw-0.85)/2,0.12);parede(NAV.x+(C.hw+0.85)/2,NAV.z+C.v0,(C.hw-0.85)/2,0.12);parede(NAV.x,NAV.z+C.v1,C.hw,0.12);
   parede(NAV.x-C.hw,NAV.z+(C.v0+C.v1)/2,0.12,(C.v1-C.v0)/2);parede(NAV.x+C.hw,NAV.z+(C.v0+C.v1)/2,0.12,(C.v1-C.v0)/2);
   PORTO_COLS.push(colBox(NAV.x+3.6,NAV.z+33.7,1.1,0.5,0,{solid:true,y0,y1:NAV.yDeck+2}),colBox(NAV.x-3.4,NAV.z+30,0.9,1.9,0,{solid:true,y0,y1:NAV.yDeck+0.7}));
   interAdd({id:'navio-capitao',kind:'bau',x:NAV.x+3.6,z:NAV.z+32.6,y:NAV.yDeck,yChk:NAV.yDeck,r:1.6,label:'Revistar o armário do comandante',tabela:'capitao',respawn:99,once:true});}
  // contêineres: colisão, tampo (dá para subir escalando) e porta para revistar
  for(const c of CONTS){const hw=NV.cont.W/2,hd=NV.cont.L/2,top=c.y+NV.cont.H*c.h;PORTO_COLS.push(colBox(c.x,c.z,c.yaw?hd:hw,c.yaw?hw:hd,0,{solid:true,y0:c.y-0.1,y1:top,cont:c}));
    supAdd({t:'ret',x:c.x,z:c.z,hw,hd,yaw:c.yaw,y:top,dono:'conteiner'});if(c.st==='aberto')contAbrirInter(c);}
  // naufrágios (casco bloqueia; pontos de revistar na cabine, no porão e no baú do veleiro)
  for(const W of NAUFRAGIOS){const c=Math.cos(W.yaw),s=Math.sin(W.yaw);PORTO_COLS.push(colBox(W.x,W.z,W.hw,W.hd,W.yaw,{solid:true,sub:true,y0:W.y0,y1:W.y1,naufragio:true}));
    for(const p of W.pontos){const x=W.x+p.u*c+p.v*s,z=W.z-p.u*s+p.v*c;interAdd({id:p.id,kind:'bau',x,z,y:p.y,yChk:p.y,r:p.r||2.2,label:p.label,tabela:p.tabela,respawn:p.respawn||6,prio:3});}}   // prio: o ponto de revistar ganha da água em volta
  // praia: farol, posto de salva-vidas, quiosque, pedras da ponta
  PORTO_COLS.push(colCircle(FAROL.x,FAROL.z,2.4,{solid:true}));
  {const S=SALVA;for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])PORTO_COLS.push(colCircle(S.x+dx*1.05,S.z+dz*1.05,0.12,{solid:true,y1:2.2,y0:-1}));
   interAdd({id:'praia-salvavidas',kind:'bau',x:S.x+1.8,z:S.z,r:1.8,label:'Revistar a caixa do salva-vidas',tabela:'salvaVidas',respawn:4});}
  {const Q=QUIOSQUE;PORTO_COLS.push(colBox(Q.x+1.6,Q.z,0.3,1.6,0,{solid:true,y1:Q.y+1.1,y0:Q.y-1}));for(const[dx,dz]of[[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])PORTO_COLS.push(colCircle(Q.x+dx,Q.z+dz,0.12,{solid:true}));
   interAdd({id:'praia-quiosque',kind:'bau',x:Q.x+0.6,z:Q.z,r:1.8,label:'Revistar o balcão do quiosque',tabela:'quiosque',respawn:3});}
  for(const r of PEDRAS_PONTA)PORTO_COLS.push(colCircle(r.x,r.z,r.r*0.85,{solid:true,rock:true,y1:r.y+r.r*1.2,y0:r.y-6}));}
/* um contêiner aberto vira ponto de revistar (na frente da porta, na altura do piso) */
function contAbrirInter(c){if(INTER.some(i=>i.id===c.id))return;const p=contPorta(c,0.75);interAdd({id:c.id,kind:'bau',x:p[0],z:p[1],y:c.y,yChk:c.y,r:1.5,label:'Revistar o contêiner',tabela:'conteiner',respawn:5});}
/* naufrágios e coisas da praia */
const NAUFRAGIOS=[
  {id:'esperanca',nome:'Naufrágio do pesqueiro Esperança',x:PORTO.naufragio.x,z:PORTO.naufragio.z,y:PORTO.naufragio.fundo,yaw:0.55,roll:0.42,pitch:-0.05,hw:2.6,hd:8.6,y0:-4,y1:0.25,L:17,B:5,
    pontos:[{id:'naufragio-cabine',u:0.6,v:-7.2,y:-1.05,label:'Revistar a cabine do naufrágio',tabela:'naufragio',respawn:6},
            {id:'naufragio-porao',u:-2.7,v:1.5,y:-1.8,label:'Revistar o porão do naufrágio',tabela:'naufragioPorao',respawn:8}]},
  {id:'veleiro',nome:'Veleiro afundado',x:PORTO.veleiro.x,z:PORTO.veleiro.z,y:PORTO.veleiro.fundo,yaw:-0.9,roll:1.15,pitch:0.04,hw:1.6,hd:6.2,y0:-9,y1:-4.6,L:12,B:3.6,fundo:true,
    pontos:[{id:'veleiro-bau',u:2.4,v:-1.2,y:-5.9,r:2.4,label:'Abrir o baú do veleiro',tabela:'veleiro',respawn:12}]}];
const FAROL=(()=>{const p=marPonto(-176,-22);return{x:p[0],z:p[1]};})(),SALVA={x:343.5,z:-38},QUIOSQUE={x:340.5,z:86};
const PEDRAS_PONTA=[];
(function(){const R=rng(77);for(let i=0;i<9;i++){const z=-150-i*9-R()*5,d=-4+R()*22,n=costaN(z),x=costaX(z)+n[0]*d,zz=z+n[1]*d,r=1.1+R()*1.8;PEDRAS_PONTA.push({x,z:zz,r,y:ground(x,zz),s:R()});}})();
/* ---------- malhas ---------- */
function geoCais(){const g=new GB(1<<15,8),R=rng(2033),con=lin(0x8a8780),con2=lin(0x6c6a64),lodo=lin(0x3f4a38),am=lin(0xc9a227),ferro=lin(0x34383c),pneu=lin(0x1c1c1c),o={j:0.04,rnd:R},Y=PORTO.y;
  // piso e massa do cais (a parte da praia é rasa)
  add(g,boxTris(40,0.5,24),mat(356,Y-0.25,8),con,o);add(g,boxTris(10,3.2,24),mat(343,Y-1.85,8),con2,o);add(g,boxTris(30,11.6,24),mat(361,Y-6.3,8),con2,o);
  for(let i=0;i<10;i++)add(g,boxTris(39.4,0.012,0.05),mat(356.3,Y+0.006,-3.5+i*2.6),lin(0x7a7770));
  // marca da maré: lodo entre a maré baixa e a alta, nas faces que dão para a água
  const yb=MAR.base-MAR.amp-0.1,ya=MAR.base+MAR.amp*0.9;add(g,boxTris(30.12,ya-yb,24.12),mat(361,(ya+yb)/2,8),lodo,{j:0.12,rnd:R});
  // meio-fio pintado na beira, cabeços e pneus de atracação
  add(g,boxTris(0.35,0.14,24),mat(375.8,Y+0.07,8),am);for(let i=0;i<8;i++)add(g,boxTris(0.36,0.141,0.7),mat(375.8,Y+0.071,-3.3+i*3.3),lin(0x1a1a1a));
  for(const s of[-1,1])add(g,boxTris(40,0.14,0.3),mat(356,Y+0.07,8+s*11.85),am);
  for(const z of[-2.5,3.5,9.5,15.5,19]){add(g,cylTris(0.17,0.2,0.42,9),mat(375,Y,z),ferro,o);add(g,cylTris(0.26,0.26,0.07,9),mat(375,Y+0.42,z),ferro);}
  for(const z of[-2,1,4,7,10,13,16,19])add(g,cylTris(0.42,0.42,0.32,10),mat(376.15,Y-0.55,z,0,0,Math.PI/2),pneu,o);
  // escadas de marinheiro nos lados do cais (até abaixo da maré baixa)
  for(const e of[[368,-4,0,-1],[362,20,0,1],[376,-1.5,1,0]]){const[x,z,nx,nz]=e;for(const s2 of[-1,1]){const px=x+nx*0.12+(nz?s2*0.25:0),pz=z+nz*0.12+(nx?s2*0.25:0);add(g,boxTris(0.05,Y-MAR.base+MAR.amp+0.8,0.05),mat(px,(Y+MAR.base-MAR.amp-0.8)/2,pz),ferro);}
    for(let yy=Y-0.1;yy>MAR.base-MAR.amp-0.7;yy-=0.32)add(g,boxTris(nz?0.5:0.04,0.035,nx?0.5:0.04),mat(x+nx*0.12,yy,z+nz*0.12),ferro);}
  // postes de luz
  for(const[x,z]of[[350,-3.4],[366,19.4],[341,19.4]]){add(g,cylTris(0.08,0.11,7,7),mat(x,Y,z),ferro);add(g,boxTris(1.2,0.08,0.08),mat(x+0.5,Y+6.9,z),ferro);add(g,boxTris(0.45,0.12,0.25),mat(x+1.05,Y+6.82,z),lin(0xd8d0b0));}
  // guindaste: torre, cabine, lança sobre a água e o contrapeso
  {const x=371,z=16.5,ama=lin(0xb8962a),fer=lin(0x5a4a3a);add(g,boxTris(2.2,0.8,2.2),mat(x,Y+0.4,z),con2);
   for(const[dx,dz]of[[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]])add(g,boxTris(0.16,14,0.16),mat(x+dx,Y+7.8,z+dz),ama);
   for(let h=1.5;h<14;h+=1.6){add(g,boxTris(1.5,0.08,0.08),mat(x,Y+h,z-0.7),ama);add(g,boxTris(1.5,0.08,0.08),mat(x,Y+h,z+0.7),ama);add(g,boxTris(0.08,0.08,1.5),mat(x-0.7,Y+h,z),ama);add(g,boxTris(0.08,0.08,1.5),mat(x+0.7,Y+h,z),ama);}
   add(g,boxTris(2.2,1.8,2.0),mat(x,Y+15.6,z),ama,o);add(g,boxTris(1.6,0.9,0.05),mat(x,Y+15.8,z-1.02),lin(0x1a2228));
   add(g,boxTris(20,0.5,0.7),mat(x+9.5,Y+16.7,z),ama,o);add(g,boxTris(6,0.6,0.9),mat(x-4,Y+16.6,z),ama,o);add(g,boxTris(2.2,1.6,1.4),mat(x-6.4,Y+15.8,z),con2,o);
   add(g,boxTris(0.03,7,0.03),mat(x+16,Y+12.9,z),lin(0x222222));add(g,boxTris(0.5,0.4,0.3),mat(x+16,Y+9.2,z),fer);}
  // guarita (paredes com porta a oeste, telhado, janela)
  {const gx=342.5,gz=16.4,br=lin(0xd8d2c4),az=lin(0x2d4f7a);
   add(g,boxTris(3.2,2.6,0.16),mat(gx,Y+1.3,gz-1.5),br,o);add(g,boxTris(3.2,2.6,0.16),mat(gx,Y+1.3,gz+1.5),br,o);add(g,boxTris(0.16,2.6,3.0),mat(gx+1.6,Y+1.3,gz),br,o);
   for(const s of[-1,1])add(g,boxTris(0.16,2.6,1.1),mat(gx-1.6,Y+1.3,gz+s*0.95),br,o);add(g,boxTris(0.16,0.45,0.8),mat(gx-1.6,Y+2.38,gz),br);
   add(g,boxTris(3.6,0.18,3.4),mat(gx,Y+2.7,gz),az,o);add(g,boxTris(0.05,0.9,1.4),mat(gx+1.69,Y+1.55,gz),lin(0x1e262c));
   add(g,boxTris(0.9,1.3,0.5),mat(gx+0.9,Y+0.65,gz+1.15),lin(0x6a6e72),o);add(g,boxTris(1.2,0.06,0.6),mat(gx+0.6,Y+0.85,gz-1.1),lin(0x7a5a3a));}
  // prancha do cais ao convés, com corrimão
  {const P0=NV.prancha,x1=NAV.x-NV.hw,L=x1-P0.x0,dy=NAV.yDeck-PORTO.y,a=Math.atan2(dy,L),cx=(P0.x0+x1)/2,cy=(PORTO.y+NAV.yDeck)/2,Lr=Math.hypot(L,dy);
   add(g,boxTris(Lr,0.08,1.3),mat(cx,cy-0.04,P0.z,0,0,a),lin(0x6a6e72),o);for(let i=0;i<14;i++){const t=(i+0.5)/14;add(g,boxTris(0.06,0.03,1.2),mat(P0.x0+L*t,lerp(PORTO.y,NAV.yDeck,t)+0.015,P0.z),lin(0x4a4e52));}
   for(const s of[-1,1]){add(g,boxTris(Lr,0.05,0.05),mat(cx,cy+0.95,P0.z+s*0.68,0,0,a),am);for(let i=0;i<=6;i++){const t=i/6;add(g,boxTris(0.05,0.95,0.05),mat(P0.x0+L*t,lerp(PORTO.y,NAV.yDeck,t)+0.47,P0.z+s*0.68),ferro);}}}
  // rampa de barcos na praia (concreto acompanhando a areia, até dentro d'água)
  {const Rm=PORTO.rampa;for(let x=337.5;x<361;x+=1.5){const y0=ground(x,Rm.z)+0.05,y1=ground(x+1.5,Rm.z)+0.05,a=Math.atan2(y1-y0,1.5);
     add(g,boxTris(1.56,0.12,Rm.w),mat(x+0.75,(y0+y1)/2-0.03,Rm.z,0,0,a),mixc(con,lodo,smooth(MAR.base+0.5,MAR.base-0.6,(y0+y1)/2)));}}
  return litMesh(g.data());}
function geoNavio(){const g=new GB(1<<16,8),R=rng(4040),o={j:0.05,rnd:R},casco=lin(0x24344a),fundo=lin(0x8a2a22),faixa=lin(0x15161a),branco=lin(0xd8d8d0),conv=lin(0x4f5a50),fer=lin(0x3a3e42),ama=lin(0xc28a22),
    X=NAV.x,Z=NAV.z,Yd=NAV.yDeck,Yq=NAV.quilha,vs=[];
  for(let v=NV.proa;v<=NV.popa;v+=1)vs.push(v);
  const larg=(v,y)=>{const k=clamp((y-Yq)/(Yd-Yq),0,1),w=navW(v);return w*lerp(0.72,1,Math.sqrt(k))*(v<-26?lerp(0.55,1,k):1);};
  // casco em faixas: fundo vermelho até a linha d'água, faixa preta e o costado azul
  const faixaCasco=(y0,y1,cor)=>{const T=[];for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1];for(const s of[-1,1]){const p0=[s*larg(a,y0),y0,a],p1=[s*larg(b,y0),y0,b],q0=[s*larg(a,y1),y1,a],q1=[s*larg(b,y1),y1,b];T.push([p0,p1,q1],[p0,q1,q0]);}}
    {const v=NV.popa;T.push([[-larg(v,y0),y0,v],[larg(v,y0),y0,v],[larg(v,y1),y1,v]],[[-larg(v,y0),y0,v],[larg(v,y1),y1,v],[-larg(v,y1),y1,v]]);}
    add(g,T,mat(X,0,Z),cor,o);};
  faixaCasco(Yq,MAR.base+0.15,fundo);faixaCasco(MAR.base+0.15,MAR.base+0.55,faixa);faixaCasco(MAR.base+0.55,Yd-0.35,casco);faixaCasco(Yd-0.35,Yd,branco);
  {const T=[];for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1];T.push([[-larg(a,Yq),Yq,a],[larg(a,Yq),Yq,a],[larg(b,Yq),Yq,b]],[[-larg(a,Yq),Yq,a],[larg(b,Yq),Yq,b],[-larg(b,Yq),Yq,b]]);}add(g,T,mat(X,0,Z),fundo);}
  // convés (placa com espessura) e amurada
  {const T=[],top=Yd,bot=Yd-0.22;for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1],wa=navW(a),wb=navW(b);
     T.push([[-wa,top,a],[wa,top,a],[wb,top,b]],[[-wa,top,a],[wb,top,b],[-wb,top,b]],[[-wa,bot,a],[wb,bot,b],[wa,bot,a]],[[-wa,bot,a],[-wb,bot,b],[wb,bot,b]]);}
   add(g,T,mat(X,0,Z),conv,{j:0.1,rnd:R});}
  {const gz=NV.prancha.z-Z;for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1];for(const s of[-1,1]){if(s<0&&a>=gz-1.3&&b<=gz+1.3)continue;
      const xa=s*(navW(a)-0.06),xb=s*(navW(b)-0.06),L=Math.hypot(xb-xa,b-a),ang=Math.atan2(xb-xa,b-a);add(g,boxTris(0.1,1.0,L+0.02),mat(X+(xa+xb)/2,Yd+0.5,Z+(a+b)/2,0,ang,0),casco,{j:0.06,rnd:R});
      add(g,boxTris(0.16,0.06,L+0.02),mat(X+(xa+xb)/2,Yd+1.02,Z+(a+b)/2,0,ang,0),branco);}}
   add(g,boxTris(NV.hw*2-1.2,1.0,0.1),mat(X,Yd+0.5,Z+NV.popa-0.1),casco);}
  // tampas dos porões debaixo das pilhas e o guincho da âncora na proa
  for(const v of NV.baias)add(g,boxTris(7.6,0.3,6.2),mat(X,Yd+0.15,Z+v),lin(0x3e4842),{j:0.08,rnd:R});
  add(g,boxTris(2.2,0.9,1.4),mat(X,Yd+0.45,Z-33),fer,o);for(const s of[-1,1])add(g,cylTris(0.5,0.5,0.6,10),mat(X+s*1.4,Yd+0.55,Z-33,0,0,Math.PI/2),fer);
  add(g,boxTris(0.12,5.5,0.12),mat(X,Yd+2.75,Z-35),fer);add(g,boxTris(1.6,0.08,0.08),mat(X,Yd+5.2,Z-35),fer);
  // âncora pendurada no costado
  add(g,boxTris(0.25,1.6,0.25),mat(X-4.3,Yd-1.6,Z-31),fer);add(g,boxTris(1.1,0.25,0.25),mat(X-4.3,Yd-2.4,Z-31),fer);
  // ponte de comando: paredes de verdade no primeiro nível (com porta), blocos em cima, janelas, chaminé, mastro e o bote salva-vidas
  {const C=NV.casa,w=C.hw,v0=C.v0,v1=C.v1,h1=2.8,br=lin(0xe4e2da),br2=lin(0xc8c6be),vid=lin(0x1c2830),zc=Z+(v0+v1)/2,dv=v1-v0;
   add(g,boxTris(w-0.85,h1,0.24),mat(X-(w+0.85)/2,Yd+h1/2,Z+v0),br,o);add(g,boxTris(w-0.85,h1,0.24),mat(X+(w+0.85)/2,Yd+h1/2,Z+v0),br,o);add(g,boxTris(1.7,h1-2.2,0.24),mat(X,Yd+2.2+(h1-2.2)/2,Z+v0),br);
   add(g,boxTris(w*2,h1,0.24),mat(X,Yd+h1/2,Z+v1),br,o);for(const s of[-1,1])add(g,boxTris(0.24,h1,dv),mat(X+s*w,Yd+h1/2,zc),br,o);
   add(g,boxTris(w*2+0.3,0.25,dv+0.3),mat(X,Yd+h1,zc),br2,o);
   add(g,boxTris(w*2,2.6,dv),mat(X,Yd+h1+1.4,zc),br,o);add(g,boxTris(w*2+2.2,2.4,5.5),mat(X,Yd+h1+3.9,Z+v0+2.75),br,o);add(g,boxTris(w*2+2.4,0.25,5.8),mat(X,Yd+h1+5.2,Z+v0+2.75),br2);
   for(let i=0;i<9;i++)add(g,boxTris(1.15,1.0,0.05),mat(X-w-0.6+0.4+i*1.4,Yd+h1+4.2,Z+v0-0.03),vid);for(const s of[-1,1])for(let i=0;i<3;i++)add(g,boxTris(0.05,1.0,1.2),mat(X+s*(w+1.12),Yd+h1+4.2,Z+v0+1+i*1.6),vid);
   for(const s of[-1,1])for(let i=0;i<4;i++)add(g,boxTris(0.05,0.8,1.1),mat(X+s*(w+0.01),Yd+h1+1.4,Z+v0+1.4+i*2.6),vid);
   add(g,cylTris(1.0,1.15,4.2,12),mat(X,Yd+h1+2.6,Z+v1-1.8),lin(0x2a2a2c),o);add(g,cylTris(1.02,1.02,0.8,12),mat(X,Yd+h1+5.0,Z+v1-1.8),lin(0xa33a2a));
   add(g,boxTris(0.15,4.5,0.15),mat(X,Yd+h1+7.5,Z+v0+3),lin(0x6a6e72));add(g,boxTris(2.4,0.1,0.3),mat(X,Yd+h1+9.2,Z+v0+3),lin(0x6a6e72));
   // dentro: armário, beliche, mesa
   add(g,boxTris(2.0,2.0,0.7),mat(X+3.6,Yd+1.0,Z+33.7),lin(0x5a6a72),o);add(g,boxTris(0.05,1.8,0.02),mat(X+3.6,Yd+1.0,Z+33.34),lin(0x2a3238));
   add(g,boxTris(1.8,0.6,3.8),mat(X-3.4,Yd+0.35,Z+30),lin(0x6a5038),o);add(g,boxTris(1.7,0.18,3.6),mat(X-3.4,Yd+0.72,Z+30),lin(0x8a8a7a));
   add(g,boxTris(1.4,0.75,0.8),mat(X+1,Yd+0.38,Z+27.5),lin(0x7a5a3a),o);
   // bote salva-vidas laranja nos turcos do lado de fora
   add(g,ellipTris(1.1,0.55,3.2,10,6),mat(X+w+1.4,Yd+h1+0.6,Z+v0+5.5),lin(0xe06a1a),o);add(g,boxTris(2.0,0.4,5.6),mat(X+w+1.4,Yd+h1+0.95,Z+v0+5.5),lin(0xe8e4d8));
   for(const dz of[-2.3,2.3])add(g,boxTris(0.12,2.2,0.12),mat(X+w+0.6,Yd+h1+0.9,Z+v0+5.5+dz),fer);}
  // escada de marinheiro no costado (só enfeite) e o nome na popa
  for(let y=Yd-0.4;y>MAR.base-MAR.amp-0.7;y-=0.42)add(g,boxTris(0.06,0.04,0.5),mat(X+NV.hw+0.06,y,Z+30),fer);for(const s2 of[-1,1])add(g,boxTris(0.05,Yd-MAR.base+MAR.amp+0.6,0.05),mat(X+NV.hw+0.08,(Yd+MAR.base-MAR.amp-0.6)/2,Z+30+s2*0.25),fer);
  add(g,boxTris(5.5,0.5,0.05),mat(X,Yd-1.0,Z+NV.popa+0.03),branco);
  return litMesh(g.data());}
/* contêineres: corpo, nervuras e (nos que não abrem) a porta fechada; as portas que abrem vão à parte */
function geoConteineres(){const g=new GB(1<<16,8),R=rng(5050),D=NV.cont;
  for(const c of CONTS){for(let t=0;t<c.h;t++){const cor=lin(c.cor[t%2]),cor2=scl(cor,0.82),y=c.y+t*D.H,M=mat(c.x,y,c.z,0,c.yaw,0),o={j:0.06,rnd:R},P_=(lx,ly,lz,w,h,d,cc)=>{const m=new Float32Array(16);add(g,boxTris(w,h,d),mul(m,M,mat(lx,ly,lz)),cc,o);};
      P_(0,D.H/2,0,D.W,D.H-0.04,D.L,cor);
      for(let i=0;i<14;i++){const z=-D.L/2+0.3+i*0.42;for(const s of[-1,1])P_(s*(D.W/2+0.015),D.H/2,z,0.03,D.H-0.25,0.16,cor2);}
      for(const s of[-1,1])for(const yy of[0.06,D.H-0.06])P_(s*(D.W/2-0.03),yy,0,0.1,0.12,D.L+0.02,scl(cor,0.65));
      P_(0,D.H/2,D.L/2+0.03,D.W-0.1,D.H-0.2,0.04,cor2);
      if(t>0||c.st==='lacrado'||!contAbre(c)){for(const s of[-1,1])P_(s*D.W/4,D.H/2,-D.L/2-0.025,D.W/2-0.04,D.H-0.22,0.04,cor2);for(const s of[-1,1])for(const xx of[0.12,0.45])P_(s*xx,D.H/2,-D.L/2-0.06,0.035,D.H-0.4,0.035,lin(0x2a2a2a));}
      else P_(0,D.H/2,-D.L/2+0.02,D.W-0.12,D.H-0.16,0.02,lin(0x0c0c0c));}}
  return litMesh(g.data());}
const contAbre=c=>c.st==='aberto'||c.st==='cadeado';
function geoPortaCont(lado){const g=new GB(512,8),D=NV.cont;add(g,boxTris(D.W/2-0.04,D.H-0.22,0.04),mat(-lado*D.W/4,0,0),lin(0x8a8a86));
  for(const xx of[0.18,0.5])add(g,boxTris(0.035,D.H-0.4,0.035),mat(-lado*xx,0,-0.035),lin(0x2a2a2a));return g.data();}
/* naufrágios: casco aberto, deitado de lado, com cabine quebrada, mastro caído e redes */
function geoNaufragio(W){const g=new GB(1<<14,8),R=rng(W.id==='veleiro'?71:61),o={j:0.12,rnd:R},L=W.L,B=W.B,Hc=W.fundo?2.0:2.6,cas=W.fundo?lin(0xd8d0c0):lin(0x3a5a6a),fer=lin(0x5a4030),mad=lin(0x6a5038);
  const M=mat(W.x,W.y+0.9,W.z,W.pitch,W.yaw,W.roll),T=[],T2=[],N=12;
  const hl=v=>{const t=v/(L/2);return B/2*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,-t),2.2)))*(t>0.85?lerp(1,0.85,(t-0.85)/0.15):1);};
  for(let i=0;i<N;i++){const a=-L/2+L*i/N,b=-L/2+L*(i+1)/N;for(const s of[-1,1]){const p0=[s*hl(a),Hc*0.5,a],p1=[s*hl(b),Hc*0.5,b],q0=[s*hl(a)*0.4,-Hc*0.5,a],q1=[s*hl(b)*0.4,-Hc*0.5,b];
      if(s>0&&i===5)continue;(i%3?T:T2).push([p0,p1,q1],[p0,q1,q0]);}}
  add(g,T,M,cas,o);add(g,T2,M,lin(0x6a3a28),o);
  const P_=(tris,lx,ly,lz,rx,ry,rz,cor)=>{const m=new Float32Array(16);add(g,tris,mul(m,M,mat(lx,ly,lz,rx,ry,rz)),cor,o);};
  for(let i=0;i<5;i++)P_(boxTris(B*0.8,0.08,0.3),0,Hc*0.38,-L/2+3+i*2.4,0,0,0,mad);
  if(!W.fundo){P_(boxTris(2.6,1.8,2.8),0,Hc*0.5+0.9,L/2-2.6,0,0,0.05,lin(0xd8d4c8));P_(boxTris(2.0,0.6,0.05),0,Hc*0.5+1.3,L/2-4.02,0,0,0,lin(0x1a2228));
    P_(boxTris(0.14,6,0.14),0.4,Hc*0.5+1.2,-2,1.25,0,0.2,fer);P_(boxTris(3,0.05,2.2),-1.2,Hc*0.4,1.2,0.3,0.4,0,lin(0x4a5a3a));}
  else{P_(boxTris(0.12,9,0.12),0,Hc*0.5+3.6,-1,0.15,0,0,lin(0xb8b0a0));P_(boxTris(1.6,0.6,2.2),0,Hc*0.5+0.3,1.5,0,0,0,lin(0xc8c0b0));
    const p=W.pontos[0],m2=new Float32Array(16);add(g,boxTris(1.1,0.7,0.7),mul(m2,mat(W.x,W.y+0.35,W.z),mat(p.u*Math.cos(W.yaw)+p.v*Math.sin(W.yaw),0,-p.u*Math.sin(W.yaw)+p.v*Math.cos(W.yaw),0,W.yaw+0.3,0.1)),lin(0x5a3a22),o);}
  // conchas e algas em volta
  for(let i=0;i<10;i++){const a=R()*6.283,r=2+R()*7,x=W.x+Math.cos(a)*r,z=W.z+Math.sin(a)*r;add(g,icoTris(0.12+R()*0.18,0.5,R),mat(x,ground(x,z)+0.05,z,0,0,0,1,0.5,1),lin(0x4a5a3a),o);}
  return litMesh(g.data());}
function geoPraia(){const g=new GB(1<<15,8),R=rng(8080),o={j:0.08,rnd:R},mad=lin(0x7a5a3a),mad2=lin(0x9a8a6a),br=lin(0xe8e4d8),ver=lin(0xb02a20);
  // farol: torre listrada, galeria, lanterna, casinha
  {const F=FAROL,y=ground(F.x,F.z)-0.3;add(g,cylTris(3.0,3.2,1.2,14),mat(F.x,y,F.z),lin(0x6a6a64),o);
   for(let i=0;i<6;i++){const r0=lerp(2.1,1.4,i/6),r1=lerp(2.1,1.4,(i+1)/6);add(g,cylTris(r1,r0,2.5,14),mat(F.x,y+1.2+i*2.5,F.z),i%2?ver:br,o);}
   add(g,cylTris(2.0,2.0,0.25,14),mat(F.x,y+16.2,F.z),lin(0x2a2a2a));add(g,cylTris(1.1,1.1,1.8,10),mat(F.x,y+16.45,F.z),lin(0x9ab8c0));add(g,cylTris(0,1.3,1.0,10),mat(F.x,y+18.25,F.z),ver);
   add(g,boxTris(3.6,2.6,3.0),mat(F.x+4.2,y+1.6,F.z+1),br,o);add(g,roofTris(3.8,1.0,3.2),mat(F.x+4.2,y+2.9,F.z+1),ver);}
  // posto de salva-vidas: quatro pés, cabine e bandeira
  {const S=SALVA,y=ground(S.x,S.z);for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])add(g,boxTris(0.14,2.2,0.14),mat(S.x+dx*1.05,y+1.1,S.z+dz*1.05),mad2);
   add(g,boxTris(2.4,0.12,2.4),mat(S.x,y+2.2,S.z),mad2,o);add(g,boxTris(2.2,1.4,0.08),mat(S.x,y+2.95,S.z-1.1),lin(0xe0d0a0));add(g,boxTris(0.08,1.4,2.2),mat(S.x-1.1,y+2.95,S.z),lin(0xe0d0a0));
   add(g,boxTris(2.7,0.12,2.7),mat(S.x,y+3.7,S.z),ver,o);add(g,boxTris(0.05,2.0,0.05),mat(S.x+1.2,y+4.7,S.z+1.2),lin(0x3a3a3a));add(g,boxTris(0.05,0.6,0.9),mat(S.x+1.2,y+5.4,S.z+1.65),ver);
   for(let i=0;i<5;i++)add(g,boxTris(0.9,0.05,0.1),mat(S.x+1.5,y+0.3+i*0.42,S.z),mad2);add(g,boxTris(0.9,0.35,0.6),mat(S.x+1.8,y+0.18,S.z),lin(0xd04a20));}
  // quiosque: telhado de palha, balcão, banquinhos
  {const Q=QUIOSQUE,y=ground(Q.x,Q.z);for(const[dx,dz]of[[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])add(g,cylTris(0.1,0.12,2.6,7),mat(Q.x+dx,y,Q.z+dz),mad,o);
   add(g,copaTris(3.1,1.6,10,R,0.2),mat(Q.x,y+2.55,Q.z),lin(0xa8925a),o);add(g,boxTris(0.5,1.1,3.2),mat(Q.x+1.6,y+0.55,Q.z),mad,o);add(g,boxTris(0.7,0.06,3.4),mat(Q.x+1.6,y+1.12,Q.z),mad2);
   for(let i=0;i<3;i++){const z=Q.z-1+i;add(g,cylTris(0.2,0.2,0.05,8),mat(Q.x+2.5,y+0.65,z),mad2);add(g,cylTris(0.04,0.05,0.65,5),mat(Q.x+2.5,y,z),lin(0x4a4a4a));}
   add(g,boxTris(0.5,0.6,0.5),mat(Q.x+0.4,y+0.3,Q.z-1.2),lin(0x2a5a9a),o);}
  // guarda-sóis tombados, cadeiras e troncos trazidos pela maré
  for(let i=0;i<7;i++){const z=-70+i*24+R()*8,x=costaX(z)-8-R()*4,y=ground(x,z);if(R()<0.5){add(g,boxTris(0.05,2.0,0.05),mat(x,y+0.15,z,1.4,R()*6,0),lin(0x9a9a9a));add(g,copaTris(1.2,0.4,8,R,0),mat(x+0.9,y+0.3,z,1.2,R()*6,0),i%2?ver:lin(0x2a6aa8),o);}
    else add(g,boxTris(0.6,0.08,1.4),mat(x,y+0.25,z,0.3,R()*6,0),i%2?lin(0x2a6aa8):lin(0xe0c040));
    const tz=z+10,tx=costaX(tz)-5-R()*3;add(g,cylTris(0.18,0.22,3+R()*3,7),mat(tx,ground(tx,tz)+0.15,tz,0,R()*6,Math.PI/2),lin(0x8a7a62),o);}
  // pedras da ponta
  for(const r of PEDRAS_PONTA){r.y=ground(r.x,r.z);add(g,icoSubTris(r.r,0.35,R,1),mat(r.x,r.y+r.r*0.3,r.z,0,r.s*6,0,1,0.8,1.1),mixc(lin(0x5a5950),lin(0x6a665a),r.s),{j:0.15,rnd:R,crease:35});}
  return litMesh(g.data());}
let PORTO_M=null,PORTA_M=null;
INIT_MALHAS.push(function portoMalhas(){PORTO_M={cais:geoCais(),navio:geoNavio(),conts:geoConteineres(),praia:geoPraia(),naufr:NAUFRAGIOS.map(geoNaufragio)};PORTA_M=[litMesh(geoPortaCont(-1)),litMesh(geoPortaCont(1))];});
const _PM=new Float32Array(16),_PM2=new Float32Array(16);
function portoDesenho(Pg){if(!PORTO_M)return;const cx=cam.pos[0],cz=cam.pos[2];if(costaD(cx,cz)<-470)return;
  if(d2(cx,cz,360,8)<520*520){drawStat(Pg,PORTO_M.cais,ID);drawStat(Pg,PORTO_M.navio,ID);drawStat(Pg,PORTO_M.conts,ID);}
  drawStat(Pg,PORTO_M.praia,ID);for(let i=0;i<NAUFRAGIOS.length;i++)if(d2(cx,cz,NAUFRAGIOS[i].x,NAUFRAGIOS[i].z)<260*260)drawStat(Pg,PORTO_M.naufr[i],ID);
  // portas dos contêineres que abrem (abertas depois de revistar)
  if(PORTA_M&&d2(cx,cz,370,8)<120*120){const D=NV.cont;for(const c of CONTS){if(!contAbre(c)||c.st==='lacrado')continue;const it=INTER.find(i=>i.id===c.id),aberta=c.st==='aberto'&&it&&it.dia!==undefined?1.7:c.st==='aberto'?0.25:0;
      for(const s of[-1,1]){trs(_PM,c.x,c.y+D.H/2,c.z,0,c.yaw,0,1,1,1);mul(_PM2,_PM,mat(s*D.W/2,0,-D.L/2-0.025,0,s*aberta,0));drawStat(Pg,PORTA_M[s>0?1:0],_PM2);}}}}
DESENHO.opaco.push(portoDesenho);
DESENHO.sombra.push((Pg,perto)=>{if(!PORTO_M)return;const d=d2(P.x,P.z,370,8);if(d<(perto?90:160)**2){drawStat(Pg,PORTO_M.navio,ID);drawStat(Pg,PORTO_M.conts,ID);drawStat(Pg,PORTO_M.cais,ID);}
  if(d2(P.x,P.z,330,-100)<(perto?120:220)**2)drawStat(Pg,PORTO_M.praia,ID);});
/* ---------- veículo no cais: a altura do piso (e a rampa curta da saída da cidade) ---------- */
function caisAlt(x,z){if(z<PORTO.z0||z>PORTO.z1||x<PORTO.x0||x>PORTO.x1)return -1e9;if(x<338)return lerp(0.02,PORTO.y,(x-336)/2);return PORTO.y;}
{const _cv=chaoVeic;chaoVeic=function(x,z){const a=_cv(x,z),b=caisAlt(x,z);return b>a?b:a;};
 const _apv=aguaProfVeic;aguaProfVeic=function(x,z){if(caisAlt(x,z)>-1e8)return 0;return _apv(x,z);};}
/* ---------- contêiner com cadeado: pé de cabra arromba ---------- */
INTERS.push(tryIt=>{if(P.nada||CARRO.ativo)return;if(d2(P.x,P.z,370,8)>60*60)return;
  for(const c of CONTS){if(c.st!=='cadeado')continue;const p=contPorta(c,0.75);tryIt({k:'contCadeado',o:c},p[0],p[1],1.5,1.2,-0.4,c.y);}});
INTER_K.contCadeado={texto:c=>invCount('peDeCabra')?{t:'Arrombar o cadeado do contêiner',s:'pé de cabra · faz barulho',hold:true}:{t:'Contêiner trancado com cadeado',s:'precisa de pé de cabra'},
  usar:c=>{const pc=P.inv.find(q=>q&&q.id==='peDeCabra');if(!pc){feed('O cadeado não cede: precisa de pé de cabra',true);sfx('vazio');return;}
    gastar(pc,2);c.st='aberto';portoD().abertos[c.id]=1;contAbrirInter(c);sfx('portaMetal',c.x,c.z,0.9);barulho(c.x,c.z,22,true);ganharXP(6);feed('Cadeado arrombado: o contêiner abriu');
    if(PORTO_M){liberarMesh(PORTO_M.conts);PORTO_M.conts=geoConteineres();}}};
/* ---------- estado salvo do porto ---------- */
function portoD(){if(!G.porto||typeof G.porto!=='object')G.porto={abertos:{},povoado:0};if(!G.porto.abertos)G.porto.abertos={};return G.porto;}
function portoAplicar(){for(const c of CONTS){if(c.id in portoD().abertos&&c.st==='cadeado'){c.st='aberto';contAbrirInter(c);}}if(PORTO_M){liberarMesh(PORTO_M.conts);PORTO_M.conts=geoConteineres();}}
function portoReset(){G.porto={abertos:{},povoado:0};for(const c of CONTS){if(c.trancadoOrig){c.st='cadeado';const i=INTER.findIndex(q=>q.id===c.id);if(i>=0)INTER.splice(i,1);}}if(PORTO_M){liberarMesh(PORTO_M.conts);PORTO_M.conts=geoConteineres();}}
for(const c of CONTS)if(c.st==='cadeado')c.trancadoOrig=true;
V8.novo.porto=()=>{portoReset();};
V8.salvar.porto=()=>{const D=portoD(),dias={};for(const c of CONTS){const it=INTER.find(i=>i.id===c.id);if(it&&it.dia!==undefined)dias[c.id]=it.dia;}return{abertos:D.abertos,povoado:D.povoado,dias};};
V8.carregar.porto=s=>{portoReset();if(s&&typeof s==='object'){G.porto={abertos:s.abertos&&typeof s.abertos==='object'?s.abertos:{},povoado:+s.povoado||0};}portoAplicar();
  if(s&&s.dias&&typeof s.dias==='object')for(const id in s.dias){const it=INTER.find(i=>i.id===id);if(it&&Number.isFinite(+s.dias[id]))it.dia=+s.dias[id];}};   // o dia em que cada contêiner foi revistado (os arrombados só existem depois do portoAplicar)
/* ---------- tripulação: zumbis no convés e no cais (uma vez por dia, quando você chega perto) ---------- */
const PORTO_ZUMBIS=[[350,10],[361,1],[368,17],[378.9,-6],[388.3,4],[388.3,-16],[383.6,29.5]];   // cais e convés (corredores, fora das pilhas)
let portoZT=0;
PASSOS.push(dt=>{portoZT-=dt;if(portoZT>0||G.modo!=='jogo'||!P.alive)return;portoZT=2;const d=Math.hypot(P.x-370,P.z-8);if(d>75||d<12)return;const D=portoD();if(D.povoado===G.dia)return;D.povoado=G.dia;
  let n=0;for(const[x,z]of PORTO_ZUMBIS){if(Math.hypot(x-P.x,z-P.z)<14||Math.random()<0.25)continue;if(Z.length>=ZMAX-10)break;const y=chaoEm(x,z,12);const q=criarZ(Math.random()<0.8?'walker':'runner',x,z,{y});if(q){q.porto=true;n++;}}
  if(n&&typeof diarioConta==='function')diarioConta('porto',1);});
/* ---------- veículos e reboque da praia ---------- */
{const _vp=veicPadrao;veicPadrao=function(){_vp.apply(this,arguments);if(!VEICS.some(v=>v.id==='barcoPraia'))veicNovo('barco',341.6,58,Math.PI/2,{id:'barcoPraia',comb:0,motor:35,hp:55});};
 if(!VEICS.some(v=>v.id==='barcoPraia'))veicNovo('barco',341.6,58,Math.PI/2,{id:'barcoPraia',comb:0,motor:35,hp:55});}
{const _rp=rbPadrao;rbPadrao=function(){_rp.apply(this,arguments);if(!REBOQUES.some(r=>r.id==='reboquePorto'))rbNovo('reboqueBarco',339.6,33,0,{id:'reboquePorto'});};
 const _rc=V8.carregar.reboques;V8.carregar.reboques=function(s){_rc.apply(this,arguments);if(!REBOQUES.some(r=>r.id==='reboquePorto'))rbNovo('reboqueBarco',339.6,33,0,{id:'reboquePorto'});};}
/* ---------- chegando: diário e dicas ---------- */
const PORTO_LUGARES=[{id:'porto',nome:'Porto Velho',x:356,z:8,r:22,dica:'O porto: o cargueiro encalhado tem contêineres no convés (suba pela prancha). Os com cadeado abrem com pé de cabra. Cuidado com a tripulação.'},
  {id:'navio',nome:'Cargueiro Atlântico Sul',x:NAV.x,z:NAV.z+6,r:16,dica:''},
  {id:'naufragio',nome:'Naufrágio do pesqueiro Esperança',x:PORTO.naufragio.x,z:PORTO.naufragio.z,r:26,dica:'O naufrágio fica num banco de areia: na maré baixa dá para ir andando; na alta, só nadando.'},
  {id:'farol',nome:'Farol Velho',x:FAROL.x,z:FAROL.z,r:30,dica:''},
  {id:'veleiro',nome:'Veleiro afundado',x:PORTO.veleiro.x,z:PORTO.veleiro.z,r:24,dica:'Lá embaixo, uns 6 m, um veleiro afundado. Nadando, segure C para mergulhar (Espaço sobe). Cuidado com o fôlego.'}];
let portoVistoT=0;
PASSOS.push(dt=>{portoVistoT-=dt;if(portoVistoT>0||G.modo!=='jogo'||!P.alive)return;portoVistoT=1.2;if(P.x<300)return;
  for(const L of PORTO_LUGARES){if(Math.hypot(P.x-L.x,P.z-L.z)>L.r)continue;if(typeof diarioDescobre==='function')diarioDescobre('lugar',L.id,L.nome,12);if(L.dica)dica('mar_'+L.id,'corpo',L.dica);}});
MAPA_DESENHOS.push((g,X,Y,k,n,range)=>{if(range<1e4&&Math.hypot(P.x-370,P.z-8)>range+80)return;
  g.fillStyle=n>0.5?'#3a3a38':'#8f8b82';g.fillRect(X(PORTO.x0),Y(PORTO.z0),(PORTO.x1-PORTO.x0)*k,(PORTO.z1-PORTO.z0)*k);
  g.fillStyle=n>0.5?'#2a3442':'#33465e';g.beginPath();g.moveTo(X(NAV.x-NV.hw),Y(NAV.z-26));g.lineTo(X(NAV.x),Y(NAV.z-38));g.lineTo(X(NAV.x+NV.hw),Y(NAV.z-26));g.lineTo(X(NAV.x+NV.hw),Y(NAV.z+38));g.lineTo(X(NAV.x-NV.hw),Y(NAV.z+38));g.closePath();g.fill();
  g.fillStyle='#c87a3a';for(const c of CONTS)if(c.navio)g.fillRect(X(c.x-1.2),Y(c.z-3),2.4*k,6*k);
  const D=G.diario,vis=id=>D&&D.desc&&D.desc['lugar:'+id];
  for(const W of NAUFRAGIOS){if(range>=1e4&&!vis(W.id==='esperanca'?'naufragio':'veleiro'))continue;g.strokeStyle=n>0.5?'#9aa0a6':'#2a2420';g.lineWidth=2;const x=X(W.x),y=Y(W.z);g.beginPath();g.moveTo(x-4,y-4);g.lineTo(x+4,y+4);g.moveTo(x+4,y-4);g.lineTo(x-4,y+4);g.stroke();}
  g.fillStyle='#e8e4d8';g.beginPath();g.arc(X(FAROL.x),Y(FAROL.z),Math.max(2.5,2.4*k),0,Math.PI*2);g.fill();g.fillStyle='#b02a20';g.beginPath();g.arc(X(FAROL.x),Y(FAROL.z),Math.max(1.2,1.2*k),0,Math.PI*2);g.fill();});
/* escadas de marinheiro: da água para o cais (três lados) e para o convés (costado leste); o pé da escada acompanha a maré */
const ESCADAS_MAR=[{x:368,z:-4,lado:[0,-1],topo:PORTO.y},{x:362,z:20,lado:[0,1],topo:PORTO.y},{x:376,z:-1.5,lado:[1,0],topo:PORTO.y},{x:NAV.x+NV.hw,z:NAV.z+30,lado:[1,0],topo:NAV.yDeck}];
function escadasMar(){for(const e of ESCADAS_MAR){const nx=e.lado[0],nz=e.lado[1],rumo=Math.atan2(-nx,-nz),y0=marNivel()-1.32,
    base={x:e.x+nx*0.6,y:y0,z:e.z+nz*0.6},topo={x:e.x-nx*1.1,y:e.topo,z:e.z-nz*1.1,rumo};
    const v=viaReta(e.x+nx*0.25,e.z+nz*0.25,y0,e.topo,rumo,base,topo,'cais');v.mar=true;VIAS.push(v);e.via=v;}}
portoMontarMundo();escadasMar();

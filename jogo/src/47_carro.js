/* ================= veículos: caminhonete, carro, moto, triciclo, barco, jangada e helicóptero =================
   Cada veículo tem peças com estado: motor, pneus, óleo, bateria e lataria, além do tanque e do porta-malas.
   · motor: perde com batidas, enchente e falta de óleo; em 0 não pega. Conserta com peça de motor + kit de ferramentas.
   · pneus: furam em batidas e atropelando; furado deixa lento e puxa para o lado. Troca com pneu + kit.
   · óleo: gasta rodando; pouco óleo estraga o motor. Repõe com óleo de motor.
   · bateria: carro, moto e helicóptero precisam dela para pegar.
   · lataria: batidas e zumbis. Conserta com 3 sucata + 2 pregos.
   · porta-malas: carga do veículo (a caminhonete leva 12, a moto 2).
   Toque E: entra (se der). Segure E: oficina do veículo (estado, consertos, abastecer, porta-malas).
   A caminhonete continua sendo o "CARRO" de sempre; CARRO passa a ser o veículo que você está dirigindo (ou o último). */
iconesNovos({
  'i-pneu':'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/>',
  'i-oleo':'<path d="M5 9h9l3-3 3 2-3 3v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 19z"/><path d="M8 6h4M10 6v3"/><path d="M9 14c1.2 1.3 2.4 1.3 3.6 0"/>',
  'i-bateria-v':'<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M7 7V5h3v2M14 7V5h3v2M7 13h3M15.5 11.5v3M14 13h3"/>',
  'i-kit-ferr':'<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17v3h3l5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.2-.8-.8-2.2z"/>',
  'i-rotor':'<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2V3M13.6 12.9l6.2 3.6M10.4 12.9 4.2 16.5"/>',
  'i-jangada':'<path d="M3 15h18l-1.5 3h-15z"/><path d="M5 15V9M9 15V8M13 15V8M17 15V9"/><path d="M4 11h15" stroke-width="1.3"/>',
  'i-carro':'<path d="M4 15.5v-3l2-4.5h12l2 4.5v3"/><path d="M3 15.5h18v2.5H3z"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/>',
  'i-moto':'<circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16l4-6h4l4 6M13 10l1-3h3"/>',
  'i-heli':'<path d="M3 5h18M12 5v3"/><path d="M6 13a4.5 4.5 0 0 1 4.5-4.5H15l2 4.5-2 3H10.5A4.5 4.5 0 0 1 6 13z"/><path d="M17 13h4M9 19.5h7M10.5 16.5v3M14.5 16.5v3"/>',
  'i-barco':'<path d="M3 14h18l-3 5H6z"/><path d="M8 14V8l5-3v9M13 8h4"/>'});
Object.assign(ITEMS,{
  pneu:{nome:'Pneu',icon:'i-pneu',max:2,tipo:'material',desc:'Pneu bom para trocar um furado. Precisa do kit de ferramentas.'},
  oleoMotor:{nome:'Óleo de motor',icon:'i-oleo',max:4,tipo:'material',desc:'Um litro de óleo. Motor sem óleo esquenta e estraga.'},
  bateriaVeic:{nome:'Bateria automotiva',icon:'i-bateria-v',max:1,tipo:'material',desc:'Bateria carregada. Sem ela carro, moto e helicóptero não pegam.'},
  kitFerramentas:{nome:'Kit de ferramentas',icon:'i-kit-ferr',max:1,tipo:'util',durMax:30,desc:'Chave de roda, macaco e chaves. Precisa dele para trocar pneu e bateria e para mexer no motor. Gasta com o uso.'},
  pecasRotor:{nome:'Peças de rotor',icon:'i-rotor',max:2,tipo:'material',desc:'Pás e eixo de rotor de helicóptero. Raríssimas: avião caído, depósitos militares e o laboratório.'},
  jangada:{nome:'Jangada desmontada',icon:'i-jangada',max:1,tipo:'util',acao:'Pôr na água',desc:'Toras amarradas. Use na beira do rio ou do lago para pôr na água e remar.'}});
ITEMS.pecaVeiculo.nome='Peça de motor';ITEMS.pecaVeiculo.acao='Usar num veículo';ITEMS.pecaVeiculo.desc='Peça rara de motor. Conserta o motor de carro, moto, triciclo, barco ou helicóptero (precisa do kit de ferramentas).';
ITEMS.gasolina.desc='Abastece veículos e geradores. Cada galão enche parte do tanque (a moto enche inteira).';
RECIPES.push({faz:'kitFerramentas',n:1,custo:{sucata:4,pregos:2,madeira:1},cat:'ferramentas',etapa:3,est:2,desb:{oficina:true}},{faz:'jangada',n:1,custo:{madeira:12,corda:4,tabuas:4},cat:'materiais',etapa:2,est:1});
REPARO.kitFerramentas={sucata:2};
for(const[t,e]of[['oficina',['pneu',1,1,0.3]],['oficina',['oleoMotor',1,2,0.4]],['oficina',['kitFerramentas',1,1,0.15]],['oficina',['bateriaVeic',1,1,0.12]],['carro',['oleoMotor',1,1,0.15]],['carro',['pneu',1,1,0.08]],
  ['celeiro',['oleoMotor',1,1,0.2]],['celeiro',['kitFerramentas',1,1,0.08]],['militar',['bateriaVeic',1,1,0.12]],['militar',['pecasRotor',1,1,0.04]],['suprimentos',['oleoMotor',1,1,0.2]]])lootMais('LOOT',t,e);   // depois: a caixa militar só existe quando a história carrega
for(const[t,e]of[['pecas',['pneu',.25,1,1]],['pecas',['oleoMotor',.35,1,2]],['pecas',['bateriaVeic',.15,1,1]],['pecas',['kitFerramentas',.12,1,1]],['carro',['oleoMotor',.12,1,1]],['fosso',['kitFerramentas',.15,1,1]],['fosso',['oleoMotor',.3,1,2]]])lootMais('CID',t,e);
/* tipos: velocidade, aceleração, gasto, rodas [x,y,z,frente,escala], carga, barulho, caixa de colisão, lugares de câmera */
/* v10.1: veículos mais lentos e com arrancada mais pesada (pedido do Himalaia: estavam rápidos demais). Antes:
   caminhonete 17/8,5 · carro 19/9,5 · moto 22/11 · triciclo 15/9 · barco 12/4,5 · helicóptero 30/6 (velocidade máx. m/s / aceleração m/s²).
   A aceleração também cai perto da velocidade máxima (acelTaper), em vez de ir reta até o limite. */
const VTIPOS={
  caminhonete:{nome:'Caminhonete',art:'a',maxV:13,ace:3.0,cons:1,galao:50,cap:12,ruido:24,hw:1.0,hd:2.45,bateria:true,terra:true,cacamba:true,fora:0.9,
    rodas:[[0.86,0.42,1.55,1,1],[-0.86,0.42,1.55,1,1],[0.86,0.42,-1.55,0,1],[-0.86,0.42,-1.55,0,1]],assento:[0.42,1.48,0.12],farol:[[0.68,0.98,2.47],[-0.68,0.98,2.47]],lanterna:[[0.8,1.08,-2.5],[-0.8,1.08,-2.5]],camD:7.4,camH:1.9,larg:1.72,comp:3.1},
  sedan:{nome:'Carro',art:'o',maxV:14.5,ace:3.4,cons:0.8,galao:60,cap:8,ruido:20,hw:0.95,hd:2.15,bateria:true,terra:true,fora:0.7,
    rodas:[[0.8,0.37,1.3,1,0.88],[-0.8,0.37,1.3,1,0.88],[0.8,0.37,-1.35,0,0.88],[-0.8,0.37,-1.35,0,0.88]],assento:[0.38,1.18,-0.15],farol:[[0.6,0.72,2.12],[-0.6,0.72,2.12]],lanterna:[[0.62,0.78,-2.12],[-0.62,0.78,-2.12]],camD:6.6,camH:1.6,larg:1.6,comp:2.65},
  moto:{nome:'Moto',art:'a',maxV:16,ace:4.2,cons:0.45,galao:100,cap:2,ruido:26,hw:0.35,hd:1.05,bateria:true,terra:true,fora:0.85,exposto:true,moto:true,
    rodas:[[0,0.33,0.74,1,0.78],[0,0.33,-0.72,0,0.78]],assento:[0,1.45,-0.15],farol:[[0,0.98,0.95]],lanterna:[[0,0.75,-1.0]],camD:5.2,camH:1.55,larg:0.3,comp:1.46},
  triciclo:{nome:'Triciclo',art:'o',maxV:11,ace:3.2,cons:0.6,galao:80,cap:4,ruido:22,hw:0.75,hd:1.3,bateria:false,terra:true,fora:1.0,exposto:true,
    rodas:[[0,0.36,0.98,1,0.86],[0.66,0.38,-0.62,0,0.9],[-0.66,0.38,-0.62,0,0.9]],assento:[0,1.38,-0.2],farol:[[0,0.92,1.15]],lanterna:[[0.5,0.8,-1.0],[-0.5,0.8,-1.0]],camD:5.6,camH:1.6,larg:1.32,comp:1.6},
  barco:{nome:'Barco a motor',art:'o',maxV:9,ace:2.4,cons:0.9,galao:50,cap:6,ruido:22,hw:0.95,hd:2.3,bateria:false,agua:true,exposto:true,
    assento:[0,1.15,-1.4],farol:[[0,1.0,2.1]],lanterna:[],camD:7,camH:1.8},
  jangada:{nome:'Jangada',art:'a',maxV:2.6,ace:1.6,cons:0,galao:0,cap:3,ruido:4,hw:1.2,hd:1.6,bateria:false,agua:true,exposto:true,remo:true,semMotor:true,
    assento:[0,1.25,-0.3],farol:[],lanterna:[],camD:6,camH:1.7},
  heli:{nome:'Helicóptero',art:'o',maxV:22,ace:3.5,cons:3.2,galao:25,cap:4,ruido:75,hw:1.4,hd:3.8,bateria:true,voa:true,rotor:true,
    assento:[0.4,1.75,1.15],farol:[[0,0.9,2.6]],lanterna:[],camD:11,camH:3.2}};
const VT=v=>VTIPOS[(v||CARRO).tipo]||VTIPOS.caminhonete;
const VEICS=[];
function veicNovo(tipo,x,z,yaw,o){const T=VTIPOS[tipo];o=o||{};
  const v={id:o.id||tipo,tipo,x,z,y:0,yaw,v:0,steer:0,comb:o.comb??0,hp:o.hp??100,ativo:false,ligado:false,pitch:0,roll:0,giro:0,luz:true,col:null,fumaca:0,buz:0,rotor:0,alt:0,vy:0,
    pecas:{motor:o.motor??100,pneus:(o.pneus||(T.rodas?T.rodas.map(()=>100):[])).slice(),oleo:o.oleo??80,bateria:o.bateria??true,rotor:o.rotor??2},itens:new Array(T.cap).fill(null),visto:!!o.visto};
  v.y=veicChao(v,v.x,v.z);VEICS.push(v);veicColisor(v);return v;}
let CARRO=null;
function veicPadrao(){for(const v of VEICS)if(v.col)colRemove(v.col);VEICS.length=0;
  CARRO=veicNovo('caminhonete',-57,49,2.28,{comb:0,motor:100,oleo:70});
  veicNovo('sedan',57.5,-48,0.35,{id:'sedanVila',comb:0,bateria:false,pneus:[100,0,100,100],motor:70,oleo:35,hp:75});
  veicNovo('moto',186,15.5,1.2,{id:'motoCidade',comb:0,motor:0,oleo:50,hp:80});
  veicNovo('triciclo',-79,63,-2.4,{id:'triFazenda',comb:15,pneus:[100,0,100],oleo:20,hp:85});
  veicNovo('barco',74.6,91.3,0.05,{id:'barcoCais',comb:0,motor:0,hp:90});
  veicNovo('heli',-112,-30,1.57,{id:'heliBase',comb:0,motor:0,bateria:false,rotor:0,hp:60});}
function carroInicio(){veicPadrao();}
function veicColisor(v){if(v.col)colRemove(v.col);v.col=null;const T=VT(v);if(!v.ativo&&!T.agua&&!T.voa)v.col=colBox(v.x,v.z,T.hw,T.hd,v.yaw,{carro:true,veic:v});
  else if(!v.ativo&&T.voa&&v.alt<0.5)v.col=colBox(v.x,v.z,T.hw,T.hd*0.8,v.yaw,{carro:true,veic:v});}
function carroColisor(){if(CARRO)veicColisor(CARRO);}
/* chão do veículo: terreno/ponte; na água, a superfície */
function veicChao(v,x,z){const T=VT(v);if(T.agua){const n=RIO.ok?aguaNivel(x,z):null;return n!==null?n-0.25:chaoVeic(x,z);}return chaoVeic(x,z);}
function carroLocal(lx,ly,lz,v){v=v||CARRO;const c=Math.cos(v.yaw),s=Math.sin(v.yaw);return[v.x+lx*c+lz*s,v.y+ly,v.z-lx*s+lz*c];}
/* ---------- geometria ---------- */
function carroGeometry(){const R=rng(808),paint=lin(0x4f6b4a),paint2=lin(0x445d40),dark=lin(0x1d2124),glass=lin(0x18232b),trim=lin(0x5a5f63),rust=lin(0x6e4a2c);
  const mk=f=>{const g=new GB(2048,8);f(g);return g.data();};
  const body=mk(g=>{const A=(t,m,c,o)=>add(g,t,m,c,o||{j:0.04,rnd:R});
    A(bevelTris(1.95,0.52,4.8,0.08),mat(0,0.72,0),paint);
    A(bevelTris(1.9,0.3,1.55,0.08,{tz:0.92}),mat(0,1.1,1.55),paint);
    A(bevelTris(1.86,0.82,1.75,0.1,{tx:0.94,tz:0.82}),mat(0,1.38,0.12),paint2);
    A(boxTris(1.62,0.5,0.06),mat(0,1.44,0.93,-0.55,0,0),glass,{});A(boxTris(1.5,0.44,0.06),mat(0,1.48,-0.72),glass,{});
    for(const s of[1,-1])A(boxTris(0.06,0.42,1.2),mat(s*0.93,1.48,0.05),glass,{});
    for(const s of[1,-1])A(bevelTris(0.12,0.46,2.05,0.03),mat(s*0.92,1.16,-1.4),paint);
    A(bevelTris(1.95,0.46,0.12,0.03),mat(0,1.16,-2.4),paint);A(boxTris(1.75,0.05,2.0),mat(0,0.98,-1.4),dark,{});
    A(cylTris(0.36,0.36,0.24,12),mat(0.15,1.12,-1.5,0,0,0.25),lin(0x161616));
    A(bevelTris(2.05,0.22,0.2,0.05),mat(0,0.62,2.45),trim);A(bevelTris(2.05,0.22,0.2,0.05),mat(0,0.62,-2.45),trim);
    A(boxTris(1.0,0.26,0.05),mat(0,0.98,2.42),dark,{});
    for(const s of[1,-1]){A(boxTris(0.34,0.16,0.06),mat(s*0.68,0.98,2.42),lin(0xfff1c8),{e:2.6});A(boxTris(0.22,0.14,0.05),mat(s*0.8,1.08,-2.45),lin(0x9a1a14),{e:1.4});
      for(const z of[1.55,-1.55])A(bevelTris(0.12,0.5,1.0,0.04),mat(s*0.99,0.76,z),lin(0x2a2d2f));
      A(boxTris(0.05,0.12,0.18),mat(s*1.0,1.45,0.75),dark,{});}
    for(let i=0;i<5;i++)A(boxTris(0.25+R()*0.3,0.02,0.2+R()*0.3),mat((R()-0.5)*1.4,1.25,1.2+R()*0.6),rust,{});
    for(let i=0;i<4;i++){const s=R()<0.5?1:-1;A(boxTris(0.02,0.15+R()*0.2,0.2+R()*0.4),mat(s*0.985,0.65+R()*0.3,(R()-0.5)*3.5),rust,{});}});
  const roda=mk(g=>{add(g,cylTris(0.42,0.42,0.3,14),mat(0.15,0,0,0,0,Math.PI/2),lin(0x161616));add(g,cylTris(0.2,0.2,0.32,10),mat(0.16,0,0,0,0,Math.PI/2),lin(0x6d7276));
    for(let i=0;i<5;i++){const a=i/5*6.283;add(g,boxTris(0.33,0.06,0.04),mat(0.17,Math.cos(a)*0.28,Math.sin(a)*0.28,a,0,0),lin(0x0e0e0e));}});
  return{body,roda};}
const RODAS=VTIPOS.caminhonete.rodas;
function veicGeometrias(){const R=rng(809),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},dark=lin(0x1c1f22),glass=lin(0x1a252d),trim=lin(0x5c6166),rust=lin(0x6e4a2c),A=(g,t,m,c,o)=>add(g,t,m,c,o||{j:0.04,rnd:R});
  MESH.v_sedan=mk(g=>{const p=lin(0x7a2e2a),p2=lin(0x652522);A(g,bevelTris(1.78,0.5,4.25,0.12,{tx:0.97,tz:0.97}),mat(0,0.62,0),p);A(g,bevelTris(1.6,0.55,2.1,0.12,{tx:0.82,tz:0.7}),mat(0,1.13,-0.3),p2);
    A(g,boxTris(1.5,0.44,0.05),mat(0,1.13,0.72,-0.75,0,0),glass,{});A(g,boxTris(1.4,0.4,0.05),mat(0,1.12,-1.32,0.7,0,0),glass,{});for(const s of[1,-1])A(g,boxTris(0.05,0.36,1.5),mat(s*0.79,1.15,-0.3),glass,{});
    A(g,bevelTris(1.84,0.18,0.16,0.04),mat(0,0.45,2.12),trim);A(g,bevelTris(1.84,0.18,0.16,0.04),mat(0,0.45,-2.12),trim);
    for(const s of[1,-1]){A(g,boxTris(0.32,0.12,0.05),mat(s*0.6,0.72,2.12),lin(0xfff1c8),{e:2.4});A(g,boxTris(0.3,0.1,0.05),mat(s*0.62,0.78,-2.12),lin(0x9a1a14),{e:1.2});for(const z of[1.3,-1.35])A(g,bevelTris(0.1,0.42,0.9,0.04),mat(s*0.9,0.55,z),dark);}
    for(let i=0;i<6;i++)A(g,boxTris(0.2+R()*0.3,0.02,0.2+R()*0.3),mat((R()-0.5)*1.3,0.88,(R()-0.5)*3.4),rust,{});});
  MESH.v_moto=mk(g=>{const p=lin(0x2b3a52),cr=lin(0x8a9096);A(g,bevelTris(0.3,0.32,0.75,0.08),mat(0,0.9,0.15),p);A(g,bevelTris(0.26,0.12,0.7,0.05),mat(0,1.08,-0.35),dark);A(g,boxTris(0.22,0.28,0.4),mat(0,0.6,0),trim);
    A(g,cylTris(0.03,0.03,0.8,6),mat(0,0.35,0.72,-0.45,0,0),cr);A(g,cylTris(0.025,0.025,0.6,6),mat(0,1.15,0.6,0,0,Math.PI/2),cr);A(g,cylTris(0.07,0.06,0.12,8),mat(0,1.0,0.85,Math.PI/2,0,0),lin(0xfff1c8),{e:2.2});
    A(g,cylTris(0.03,0.03,0.85,6),mat(0,0.35,-0.72,0.6,0,0),cr);A(g,cylTris(0.05,0.05,0.5,6),mat(0.14,0.45,-0.55,Math.PI/2.4,0,0),cr);});
  MESH.v_tri=mk(g=>{const p=lin(0x8a6a2a),p2=lin(0x6f5420);A(g,bevelTris(0.5,0.35,1.2,0.08),mat(0,0.75,0.25),p);A(g,bevelTris(1.25,0.3,0.8,0.08),mat(0,0.72,-0.55),p2);A(g,bevelTris(0.45,0.14,0.7,0.05),mat(0,1.02,-0.2),dark);
    A(g,cylTris(0.03,0.03,0.85,6),mat(0,0.36,0.98,-0.5,0,0),trim);A(g,cylTris(0.025,0.025,0.7,6),mat(0,1.12,0.6,0,0,Math.PI/2),trim);A(g,cylTris(0.08,0.07,0.12,8),mat(0,0.95,1.08,Math.PI/2,0,0),lin(0xfff1c8),{e:2.2});
    A(g,boxTris(1.1,0.35,0.5),mat(0,1.05,-0.75),lin(0x3f3f3a));});
  MESH.v_barco=mk(g=>{const casco=lin(0xd8d4c8),f=lin(0x2d5a7a),mad=lin(0x6b5038);A(g,bevelTris(1.8,0.65,4.2,0.2,{bx:0.7,bz:0.9}),mat(0,0.35,0),casco);A(g,boxTris(1.8,0.18,4.25,{bx:0.72}),mat(0,0.05,0),f);
    A(g,cylTris(0.05,0.9,0.95,4,{phase:Math.PI/4}),mm(mat(0,0.5,2.35,Math.PI/2,0,0),mat(0,0,0,0,0,0,1.0,1,0.6)),casco);for(const z of[-0.8,0.6])A(g,boxTris(1.6,0.08,0.4),mat(0,0.7,z),mad);
    A(g,boxTris(0.45,0.55,0.4),mat(0,0.85,-2.2),dark);A(g,cylTris(0.04,0.04,0.7,6),mat(0,0.15,-2.3),trim);A(g,boxTris(0.12,0.3,0.2),mat(0,-0.15,-2.32),dark);});
  MESH.v_jangada=mk(g=>{const tr=lin(0x7a5a3a),tr2=lin(0x664a30),co=lin(0xb9a77a);for(let i=0;i<7;i++)A(g,cylTris(0.17,0.17,3.0,8),mat(-1.0+i*0.34,0.15,1.5,Math.PI/2,0,0),i%2?tr:tr2);
    for(const z of[-1.1,0,1.1])A(g,boxTris(2.4,0.08,0.12),mat(0,0.34,z),tr2);for(const z of[-1.1,0,1.1])for(const x of[-0.85,0.85])A(g,cylTris(0.2,0.2,0.08,8),mat(x,0.3,z,0,0,Math.PI/2),co);
    A(g,cylTris(0.025,0.025,1.9,5),mat(0.9,0.42,-0.7,1.2,0,0.4),tr);A(g,boxTris(0.18,0.03,0.42),mat(1.25,0.6,0.85,0.3,0,0.4),tr);});
  MESH.v_heli=mk(g=>{const p=lin(0x4a5236),p2=lin(0x3a4129);A(g,ellipTris(1.25,1.15,1.9,14,10),mat(0,1.45,0.6),p);A(g,boxTris(0.32,0.35,3.6,{tx:0.6}),mat(0,1.65,-2.4),p2);
    A(g,boxTris(0.06,0.9,0.6),mat(0,2.0,-4.1),p2);A(g,ellipTris(0.95,0.7,0.9,10,8),mat(0,1.7,1.65),glass,{});A(g,boxTris(0.5,0.25,0.5),mat(0,2.55,0.45),dark);
    for(const s of[-1,1]){A(g,boxTris(0.07,0.07,3.2),mat(s*0.95,0.12,0.5),trim);for(const z of[-0.4,1.4])A(g,boxTris(0.05,0.6,0.05),mat(s*0.75,0.4,z,0,0,s*0.35),trim);}
    A(g,cylTris(0.06,0.06,0.25,8),mat(0,2.65,0.45),trim);});
  MESH.v_rotor=mk(g=>{for(let i=0;i<2;i++)add(g,boxTris(9.2,0.04,0.32),mat(0,0,0,0,i*Math.PI/2,0),dark);add(g,cylTris(0.15,0.15,0.12,10),mat(0,-0.06,0),trim);});
  MESH.v_rotorCauda=mk(g=>{add(g,boxTris(0.03,1.4,0.18),mat(0,0,0),dark);});}
INIT_MALHAS.push(veicGeometrias);
veicPadrao();
const VMESH={caminhonete:'carro',sedan:'v_sedan',moto:'v_moto',triciclo:'v_tri',barco:'v_barco',jangada:'v_jangada',heli:'v_heli'};
/* ---------- física ---------- */
function updateCarro(dt){for(const v of VEICS){if(v===CARRO&&v.ativo)updateVeic(v,dt);else if(Math.abs(v.v)>0.02||VT(v).voa&&v.alt>0.05||VT(v).agua)updateVeic(v,dt);}}
function veicPode(v){const T=VT(v),p=v.pecas;if(v.hp<=0)return T.nome+' destruíd'+T.art;if(!T.semMotor&&p.motor<=0)return'O motor está quebrado';if(T.bateria&&!p.bateria)return'Sem bateria: não pega';
  if(T.rotor&&p.rotor<2)return'Faltam peças de rotor ('+p.rotor+' de 2)';if(!T.semMotor&&v.comb<=0)return'Sem combustível';return null;}
/* força da arrancada conforme a velocidade: cheia parado, vai caindo até 12% perto do máximo (o carro "pesa" no fim) */
function acelTaper(v,maxV){return v<=0?1:Math.max(0.12,1-Math.pow(clamp(v/maxV,0,1),2));}
function updateVeic(v,dt){const T=VT(v);if(T.voa)return updateHeli(v,dt);if(T.agua)return updateBarco(v,dt);const c=v,p=v.pecas;
  let acc=0,str=0;if(c.ativo){acc=IN.mz;str=IN.mx;}
  const vivo=c.hp>0&&p.motor>0,temComb=c.comb>0;if(!vivo||!temComb)acc=Math.min(acc,0)*(vivo?1:0);
  const fur=p.pneus.filter(q=>q<=0).length,mot=p.motor/100,ri=roadInfo(c.x,c.z),naEstrada=ri.road&&ri.d<ri.road.w/2+1||dentroCidade(c.x,c.z,-2);
  const maxV=T.maxV*(1-0.22*fur)*(p.motor<35?0.75:1)*(naEstrada?1:T.fora),ace=T.ace*(0.55+0.45*mot);
  if(acc>0.05)c.v+=ace*acc*dt*(c.v<0?2:acelTaper(c.v,maxV));else if(acc<-0.05)c.v+=(c.v>0.5?-15:-5.5)*(-acc)*dt;else c.v*=Math.exp(-dt*0.55);
  if(IN.freio&&c.ativo)c.v*=Math.exp(-dt*3.5);
  if(!temComb&&c.ativo)c.v*=Math.exp(-dt*0.8);
  c.v=clamp(c.v,-6,maxV);if(c.v>maxV)c.v=maxV;if(Math.abs(c.v)<0.03&&Math.abs(acc)<0.05)c.v=0;
  // pneu furado puxa para o lado
  if(fur&&Math.abs(c.v)>2){let puxa=0;T.rodas.forEach((w,i)=>{if(p.pneus[i]<=0)puxa+=(w[0]>0?1:w[0]<0?-1:0)*(w[3]?0.25:0.12);});str=clamp(str+puxa,-1,1);}
  c.steer=approach(c.steer,str,dt*3.2);
  const turn=c.steer*clamp(Math.abs(c.v)/3.5,0,1)*(T.moto?1.75:1.55)*(1-0.45*clamp(Math.abs(c.v)/T.maxV,0,1))*(c.v>=0?1:-1);
  c.yaw-=turn*dt;
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);
  if(c.v!==0){const ox=c.x,oz=c.z;c.x+=fx*c.v*dt;c.z+=fz*c.v*dt;c.giro+=c.v*dt/0.42;
    // água funda: o carro não passa e o motor afoga
    if(RIO.ok){const pr=aguaProfVeic(c.x+fx*T.hd*0.8,c.z+fz*T.hd*0.8);if(pr>1.15){c.x=ox;c.z=oz;c.v*=-0.2;}}
    let hitV=0;const raio=T.moto?0.45:T.hw;for(const k of T.moto?[0.6,-0.6]:[T.hd-raio,-(T.hd-raio)]){const e={x:c.x+fx*k,z:c.z+fz*k,y:c.y},ox2=e.x,oz2=e.z;const h=collide(e,raio,q=>!q.portao&&!(q.veic===c));
      if(h){const px=e.x-ox2,pz=e.z-oz2;c.x+=px;c.z+=pz;const along=(px*fx+pz*fz)*Math.sign(c.v);if(along<0||Math.hypot(px,pz)>0.03)hitV=Math.max(hitV,Math.abs(c.v));}}
    if(hitV>0){if(hitV>7){const d=(hitV-7)*2;c.hp=Math.max(0,c.hp-d);p.motor=Math.max(0,p.motor-d*0.35);if(hitV>9&&T.rodas&&Math.random()<0.4){const i=Math.floor(Math.random()*T.rodas.length);p.pneus[i]=Math.max(0,p.pneus[i]-60);}
        P.shake=Math.min(1,hitV*0.06);sfx('quebrar',c.x,c.z,0.6);if(c.ativo&&T.exposto&&hitV>9){ferirJogador((hitV-8)*3);feed('Você bateu feio',true);}if(typeof veicCarga==='function')veicCarga(c,hitV);}c.v*=hitV>3?-0.25:0.5;}
    if(!dentroMapa(c.x,c.z,1.5)){voltarMapa(c,c.x-fx*c.v*dt,c.z-fz*c.v*dt);c.v*=0.5;}}
  // terreno: altura e inclinação
  const hf=T.moto?0.74:T.hd*0.63,hl=T.moto?0.01:T.hw*0.86;
  const gF=chaoVeic(c.x+fx*hf,c.z+fz*hf),gB=chaoVeic(c.x-fx*hf,c.z-fz*hf),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw),gL=chaoVeic(c.x+rx*hl,c.z+rz*hl),gR=chaoVeic(c.x-rx*hl,c.z-rz*hl);
  c.y=(gF+gB+gL+gR)/4;c.pitch=lerp(c.pitch,-Math.atan2(gF-gB,hf*2),Math.min(1,dt*10));
  if(T.moto)c.roll=lerp(c.roll,-c.steer*0.32*clamp(Math.abs(c.v)/8,0,1),Math.min(1,dt*6));else c.roll=lerp(c.roll,Math.atan2(gL-gR,hl*2||1),Math.min(1,dt*10));
  if(RIO.ok){const pr=aguaProfVeic(c.x,c.z);if(pr>0.45){c.v*=Math.exp(-dt*2.2*pr);if(c.ativo&&vivo&&pr>0.8){p.motor=Math.max(0,p.motor-22*dt);if(p.motor<=0)feed('O motor afogou na água',true);}}}
  // atropelar e empurrar zumbis
  if(Math.abs(c.v)>0.2||c.ativo)for(const z of Z){if(!z.vivo)continue;const dx=z.x-c.x,dz=z.z-c.z;if(dx*dx+dz*dz>16)continue;
    const lz=dx*fx+dz*fz,lx=dx*fz-dz*fx;if(Math.abs(lz)>T.hd+0.15||Math.abs(lx)>T.hw+0.25)continue;
    const sp=Math.abs(c.v);if(sp>3.2&&z.st!=='atordoado'){const br=z.tipo==='brute'||z.chefe||z.chefeR;ferirZ(z,sp*(br?5:10)*(T.moto?0.6:1),fx*Math.sign(c.v)*(br?0.6:2.4)+lx*0.3,fz*Math.sign(c.v)*(br?0.6:2.4),1);
      c.v*=br?0.55:T.moto?0.75:0.9;c.hp=Math.max(0,c.hp-(br?4:1.2));if(T.rodas&&Math.random()<0.025){const i=Math.floor(Math.random()*T.rodas.length);p.pneus[i]=Math.max(0,p.pneus[i]-40);}
      sangue(z.x,z.y+1,z.z,10);P.shake=Math.max(P.shake,0.25);if(sp>8)ganharXP(2);if(T.moto&&c.ativo&&br){ferirJogador(10);}}
    const push=T.hw+0.3-Math.abs(lx);if(push>0){const s=lx>=0?1:-1;z.x+=fz*s*push*0.5;z.z+=-fx*s*push*0.5;}}
  // bichos na frente do veículo: atropelados (os grandes amassam e freiam o veículo)
  if(Math.abs(c.v)>3.2)for(const b of BICHOS){if(!b.vivo)continue;const dx=b.x-c.x,dz=b.z-c.z;if(dx*dx+dz*dz>20)continue;const lz=dx*fx+dz*fz,lx=dx*fz-dz*fx;
    if(Math.abs(lz)>T.hd+FAUNA[b.tipo].r||Math.abs(lx)>T.hw+FAUNA[b.tipo].r)continue;const gr=FAUNA[b.tipo].porte==='grande',sp=Math.abs(c.v);
    ferirBicho(b,sp*(gr?6:12),fx*Math.sign(c.v)*2,fz*Math.sign(c.v)*2,'veiculo');c.v*=gr?0.45:0.85;c.hp=Math.max(0,c.hp-(gr?8:1));P.shake=Math.max(P.shake,gr?0.5:0.2);}
  // combustível, óleo, barulho, fumaça
  if(c.ativo&&temComb&&vivo){c.comb=Math.max(0,c.comb-(0.02+Math.abs(c.v)*0.012)*T.cons*dt);if(Math.abs(c.v)>0.5)p.oleo=Math.max(0,p.oleo-dt*0.01*(0.4+Math.abs(c.v)/T.maxV));
    if(p.oleo<12){p.motor=Math.max(0,p.motor-dt*0.3);dica('semOleo','corpo','O óleo acabou e o motor está esquentando. Ponha óleo de motor (segure E perto do veículo).');}}
  if(c.ativo&&vivo&&temComb)barulho(c.x,c.z,Math.abs(c.v)>1?T.ruido:T.ruido*0.5,true);
  if(c.buz>0)c.buz-=dt;
  c.fumaca-=dt;if((c.hp<35||p.motor<25)&&c.fumaca<=0&&(c.ativo||c.hp<35)){c.fumaca=0.12;const q=carroLocal(0,T.moto?0.9:1.2,T.hd*0.7,c);part(q[0],q[1],q[2],(Math.random()-0.5)*0.4,1.2+Math.random(),(Math.random()-0.5)*0.4,1.6,0.3,c.hp<=0?[0.12,0.12,0.12,0.6]:[0.4,0.4,0.42,0.35],false,-0.5);}
  veicSeguir(c,dt,fx,fz);}
function veicSeguir(c,dt,fx,fz){if(!c.ativo)return;const T=VT(c);P.x=c.x;P.z=c.z;P.y=c.y+(T.voa?0.6:0.6);P.vx=fx*c.v;P.vz=fz*c.v;P.body=c.yaw;
  if(!carroOlhando())P.yaw=angLerp(P.yaw,c.yaw,1-Math.exp(-dt*2.2));
  if(!T.semMotor&&c.comb<=0&&!G.dicas.semComb){G.dicas.semComb=1;toast('corpo','A gasolina acabou. Ache outro galão no posto, nos carros ou no depósito de combustível e abasteça.');}}
/* barco e jangada: só na água; encalha na margem; a correnteza do rio leva */
function updateBarco(v,dt){const T=VT(v),c=v,p=v.pecas;let acc=0,str=0;if(c.ativo){acc=IN.mz;str=IN.mx;}
  const motorOk=T.semMotor||(c.hp>0&&p.motor>0&&c.comb>0);if(!motorOk)acc=Math.min(0,acc)*0.3;
  const maxV=T.maxV*(T.semMotor?1:(0.6+0.4*p.motor/100));if(acc>0.05)c.v+=T.ace*acc*dt*acelTaper(c.v,maxV);else if(acc<-0.05)c.v-=T.ace*0.8*(-acc)*dt;else c.v*=Math.exp(-dt*(T.semMotor?0.9:0.45));
  c.v=clamp(c.v,-maxV*0.4,maxV);c.steer=approach(c.steer,str,dt*2.5);c.yaw-=c.steer*clamp(Math.abs(c.v)/2+0.25,0,1)*(T.semMotor?0.8:1.1)*dt*(c.v>=0?1:-1);
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),ox=c.x,oz=c.z;c.x+=fx*c.v*dt;c.z+=fz*c.v*dt;
  if(RIO.ok&&lagoR(c.x,c.z)>1){const q=rioPerto(c.x,c.z);if(q.d<RIO.larg(q.s)){const k=lerp(0.6,0.3,q.s);c.x+=q.dx*k*dt;c.z+=q.dz*k*dt;}}
  const proa=[c.x+fx*T.hd*0.85,c.z+fz*T.hd*0.85],n=RIO.ok?aguaNivel(proa[0],proa[1]):null;
  if(n===null||n-ground(proa[0],proa[1])<0.45){c.x=ox;c.z=oz;if(Math.abs(c.v)>3){c.hp=Math.max(0,c.hp-(Math.abs(c.v)-3));sfx('madeira',c.x,c.z,0.6);}c.v*=-0.15;}
  {const e={x:c.x,z:c.z,y:c.y},h=collide(e,T.hw*0.8,q=>q.solid&&!q.tree);if(h){c.x=e.x;c.z=e.z;c.v*=0.5;}}
  const nv=RIO.ok?aguaNivel(c.x,c.z):null;c.y=(nv!==null?nv:ground(c.x,c.z))-0.22+Math.sin(G.t*1.6+c.x)*0.04;c.pitch=Math.sin(G.t*1.3)*0.03-c.v*0.006;c.roll=Math.sin(G.t*1.1+1)*0.035+c.steer*0.04*Math.abs(c.v)/4;
  if(c.ativo&&!T.semMotor&&motorOk){c.comb=Math.max(0,c.comb-(0.02+Math.abs(c.v)*0.015)*T.cons*dt);barulho(c.x,c.z,Math.abs(c.v)>1?T.ruido:T.ruido*0.5,true,c.y);}
  if(c.ativo&&T.remo&&Math.abs(acc)>0.1){c.remoT=(c.remoT||0)-dt;if(c.remoT<=0){c.remoT=0.9;sfx('nado',undefined,undefined,0.35);barulho(c.x,c.z,T.ruido,true,c.y);}}
  veicSeguir(c,dt,fx,fz);}
/* helicóptero: Espaço sobe, C desce, W/S inclina para frente e para trás, A/D gira. Precisa de pista para pousar devagar. */
function updateHeli(v,dt){const T=VT(v),c=v,p=v.pecas,on=c.ativo&&c.hp>0&&p.motor>0&&c.comb>0&&p.rotor>=2;
  c.rotor=approach(c.rotor||0,on?1:0,dt*(on?0.35:0.25));const sus=c.rotor>0.8;
  const g=Math.max(chaoVeic(c.x,c.z),RIO.ok&&aguaNivel(c.x,c.z)!==null?aguaNivel(c.x,c.z):-1e9,heliTeto(c.x,c.z));
  let up=0;if(c.ativo){if(IN.freio)up+=1;if(IN.desce||KEYS.ControlLeft||KEYS.ControlRight)up-=1;}   // sobe: Espaço · desce: C ou Ctrl
  /* descendo perto do chão ele vem devagar (pouso macio); sem tecla de subir ou descer ele fica parado no ar */
  const vDesce=c.alt<4?lerp(1.5,5,clamp((c.alt-0.4)/3.6,0,1)):5;
  c.vy=approach(c.vy||0,sus?(up>0?5:up<0?-vDesce:0):(c.alt>0.05?-9:0),dt*(sus?3:6));
  if(sus){const acc=c.ativo?IN.mz:0;let alvo=acc*T.maxV,taxa=T.ace;
    if(Math.abs(acc)<0.05){alvo=0;taxa=T.ace*(c.alt<1.2?3:1.5);}                        // sem W/S: freia sozinho (para no ar; rente ao chão, para logo)
    else if(acc*c.v<-0.01){alvo=0;taxa=T.ace*2.4;}                                         // tecla contrária: freio forte até parar
    else if(acc<0)alvo=acc*T.maxV*0.35;                                                    // parado, S: ré devagar
    c.v=approach(c.v,alvo,dt*taxa);c.yaw-=(c.ativo?IN.mx:0)*1.2*dt;}else c.v*=Math.exp(-dt*1.5);
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);if(c.alt>0.3||sus){c.x+=fx*c.v*dt;c.z+=fz*c.v*dt;}
  if(!dentroMapa(c.x,c.z,4)){voltarMapa(c,c.x-fx*c.v*dt,c.z-fz*c.v*dt);c.v*=0.3;}
  c.y+=c.vy*dt;if(c.y<g){const imp=-c.vy;c.y=g;if(imp>6||(Math.abs(c.v)>6&&c.alt<1)){c.hp=Math.max(0,c.hp-(imp-4)*6-Math.abs(c.v));sfx('quebrar',c.x,c.z,1);P.shake=1;if(c.ativo)ferirJogador(Math.max(0,imp-6)*5);}c.vy=0;c.v*=0.4;}
  c.alt=c.y-g;c.pitch=lerp(c.pitch,clamp(-c.v/T.maxV*0.35,-0.35,0.35),dt*2);c.roll=lerp(c.roll,(c.ativo?-IN.mx:0)*0.2,dt*2);
  if(c.rotor>0.05){c.giro+=dt*c.rotor*28;if(c.ativo)barulho(c.x,c.z,T.ruido,true,c.y);c.somT=(c.somT||0)-dt;if(c.somT<=0){c.somT=0.35;sfx('helice',undefined,undefined,0.5*c.rotor);}}
  if(on)c.comb=Math.max(0,c.comb-(0.06+Math.abs(c.v)*0.01)*T.cons*dt);
  if(c.hp<=0&&c.ativo){feed('O helicóptero caiu!',true);ferirJogador(40);c.ativo=false;CARRO.ativo=false;c.v=0;body.classList.remove('dirigindo');P.y=chaoVeic(c.x,c.z);hudBarra();}
  veicSeguir(c,dt,fx,fz);if(c.ativo)P.y=c.y+0.6;}
/* teto dos prédios da cidade: o helicóptero não atravessa */
function heliTeto(x,z){if(!emPredios(x,z,2)||!CID||!CID.predios)return -1e9;for(const p of CID.predios)if(x>p.x0-0.5&&x<p.x1+0.5&&z>p.z0-0.5&&z<p.z1+0.5)return(p.yTopo||p.y0+12)+1.2;return -1e9;}
let olharT=0;const carroOlhando=()=>performance.now()-olharT<1200;
/* ---------- entrar, sair, abastecer, buzinar ---------- */
function entrarVeic(v){const nao=veicPode(v);if(nao){feed(nao,true);sfx('vazio');abrirVeiculo(v);return;}
  const T=VT(v);if(T.agua&&RIO.ok&&aguaNivel(v.x,v.z)===null){feed('Ponha na água primeiro',true);return;}
  CARRO=v;v.ativo=true;v.ligado=true;P.agachado=false;P.acao=null;P.nada=null;IN.run=false;IN.runFix=false;veicColisor(v);P.yaw=v.yaw;sfx('clique');if(!T.semMotor)sfx('motor',v.x,v.z,0.6);body.classList.add('dirigindo');hudBarra();
  if(!v.visto){v.visto=true;if(typeof diarioConta==='function')diarioConta('veiculos',1);}
  dica('dirigir_'+v.tipo,'corpo',T.voa?'Helicóptero: espere o rotor ganhar força, Espaço sobe, C (ou Ctrl) desce, W vai para a frente, S freia (parado, dá ré), A/D gira. Soltando tudo ele para no ar. Perto do chão ele desce devagar para pousar. E sai (só no chão).':T.agua?(T.remo?'Jangada: W rema, A/D vira. E desce (na margem ou na água).':'Barco: W acelera, S dá ré, A/D vira. E desce.'):(cfg.tela==='pc'?'W acelera, S freia e dá ré, A e D viram, Espaço é o freio de mão, clique buzina e E sai. Segure E perto do veículo para a oficina e o porta-malas.':'O joystick acelera, freia e vira. Freio segura, Buzina chama atenção e Sair desce.'));}
function entrarCarro(){entrarVeic(CARRO);}
function sairCarro(){const c=CARRO;if(!c||!c.ativo)return;const T=VT(c);
  if(T.voa&&c.alt>0.6){feed('Pouse antes de sair',true);return;}
  if(Math.abs(c.v)>4&&!T.agua){feed('Diminua a velocidade para descer',true);return;}
  let ok=null;const op=T.agua?[[2,0],[-2,0],[0,3],[0,-3],[2.6,1.5],[-2.6,1.5],[2.6,-1.5],[-2.6,-1.5]]:T.moto?[[0.9,0],[-0.9,0],[0,-1.6],[1.4,0],[-1.4,0],[0,1.6],[0,-2.3]]:[[T.hw+0.7,0.3],[-T.hw-0.7,0.3],[0,-T.hd-0.85],[0,T.hd+0.85],[T.hw+1.3,0.3],[-T.hw-1.3,0.3],[T.hw+0.8,-T.hd*0.7],[-T.hw-0.8,-T.hd*0.7],[T.hw+0.8,T.hd*0.7],[-T.hw-0.8,T.hd*0.7],[0,-T.hd-1.6],[0,T.hd+1.6]];   // mais lugares para descer antes de dizer que não tem espaço
  for(const[lx,lz]of op){const q=carroLocal(lx,0,lz,c);if(!pointBlocked(q[0],q[2],0.4)&&(!T.agua||!RIO.ok||aguaNivel(q[0],q[2])===null)){ok=q;break;}}
  if(!ok&&T.agua){const q=carroLocal(1.8,0,0,c);ok=q;}   // sem margem por perto: pula na água e nada
  if(!ok&&!T.agua){for(let r=1.2;r<=7&&!ok;r+=0.4)for(let k=0;k<16;k++){const a=c.yaw+k/16*6.283,x=c.x+Math.sin(a)*r,z=c.z+Math.cos(a)*r;   // nenhum dos lugares de sempre livre:
      if(!pointBlocked(x,z,0.4)&&dentroMapa(x,z,0)&&!(RIO.ok&&aguaNivel(x,z)!==null)&&Math.abs(chaoVeic(x,z)-c.y)<2.5){ok=[x,c.y,z];break;}}}   // o lugar livre mais perto em volta (até 7 m)
  if(!ok){feed('Sem espaço para descer',true);return;}
  c.ativo=false;c.ligado=false;if(!T.agua)c.v=0;else c.v*=0.3;P.x=ok[0];P.z=ok[2];P.y=T.agua?Math.min(ground(P.x,P.z),c.y):chaoVeic(P.x,P.z);if(T.agua&&RIO.ok){const n=aguaNivel(P.x,P.z);if(n!==null)P.y=n-1.0;}
  P.vx=P.vz=0;P.noChao=false;IN.freio=false;IN.desce=false;veicColisor(c);body.classList.remove('dirigindo');hudBarra();sfx('clique');}
function abastecer(v){v=v||CARRO;const T=VT(v);if(T.semMotor||!invCount('gasolina'))return false;if(v.comb>=97){feed('O tanque já está cheio',true);return false;}
  invRemove('gasolina',1);v.comb=Math.min(100,v.comb+T.galao);sfx('pegar');feed('Abasteceu: '+Math.round(v.comb)+'% de combustível');hudBarra();return true;}
function buzinar(){if(!CARRO||CARRO.buz>0)return;const T=VT();if(T.semMotor)return;CARRO.buz=0.6;sfx('buzina');barulho(CARRO.x,CARRO.z,45,true);}
function carroInter(){return null;}   // a interação dos veículos parados agora passa por INTERS ('veic')
/* ---------- interação com veículos parados ---------- */
INTERS.push(tryIt=>{if(CARRO&&CARRO.ativo)return;for(const v of VEICS){const T=VT(v),d=Math.hypot(v.x-P.x,v.z-P.z),r=T.voa?4.6:T.agua?3.4:T.moto?2.4:3.6;if(d>r+0.5)continue;
  tryIt({k:'veic',o:v},v.x,v.z,r,2.2,-0.75,T.agua?undefined:v.y);}});
INTER_K.veic={texto:v=>{const T=VT(v),nao=veicPode(v),art=T.art==='a'?'a':'o';
    if(nao)return{t:T.nome+': '+nao.toLowerCase(),s:'toque: ver o que falta · segure: oficina',alt:true,dur:0.6};
    return{t:(T.agua?'Subir n'+art+' ':T.voa?'Pilotar o ':'Dirigir '+(art==='a'?'a ':'o '))+T.nome.toLowerCase(),s:(T.semMotor?'':Math.round(v.comb)+'% de combustível · ')+'segure: oficina e porta-malas',alt:true,dur:0.6};},
  usar:(v,seg)=>{if(seg)abrirVeiculo(v);else entrarVeic(v);},curto:v=>{if(veicPode(v))abrirVeiculo(v);else entrarVeic(v);}};
/* ---------- oficina do veículo (tela) ---------- */
TELAS_NOVAS.push('t-veiculo');
let veicAberto=null,veicMsg='';
function abrirVeiculo(v){if(G.modo!=='jogo')return;veicAberto=v;veicMsg='';G.modo='veiculo';IN.attack=false;IN.mx=IN.mz=0;tela('t-veiculo');veicRender();if(document.pointerLockElement)document.exitPointerLock();}
function fecharVeiculo(){if(G.modo!=='veiculo')return;G.modo='jogo';tela(null);veicAberto=null;if(typeof pedirTrava==='function')pedirTrava();}
const pct=v=>Math.round(clamp(v,0,100))+'%';
function veicAcoes(v){const T=VT(v),p=v.pecas,kit=invCount('kitFerramentas')>0,A=[];const temKit=()=>kit?'':' (precisa do kit de ferramentas)';
  if(!T.semMotor){A.push({id:'abastecer',t:'Abastecer',s:invCount('gasolina')?'1 galão: +'+T.galao+'%':'sem galão de gasolina',ok:invCount('gasolina')>0&&v.comb<97});}
  if(v.hp<100)A.push({id:'lataria',t:T.agua?'Remendar o casco':'Consertar a lataria',s:'3 sucata e 2 pregos: +35%',ok:invCount('sucata')>=3&&invCount('pregos')>=2});
  if(!T.semMotor&&p.motor<100)A.push({id:'motor',t:'Consertar o motor',s:'1 peça de motor'+temKit(),ok:kit&&invCount('pecaVeiculo')>0});
  if(T.rodas&&p.pneus.some(q=>q<60))A.push({id:'pneu',t:'Trocar pneu',s:'1 pneu'+temKit(),ok:kit&&invCount('pneu')>0});
  if(!T.semMotor&&!T.agua&&p.oleo<90)A.push({id:'oleo',t:'Pôr óleo',s:'1 óleo de motor: +45%',ok:invCount('oleoMotor')>0});
  if(T.bateria&&!p.bateria)A.push({id:'bateria',t:'Instalar bateria',s:'1 bateria automotiva'+temKit(),ok:kit&&invCount('bateriaVeic')>0});
  if(T.rotor&&p.rotor<2)A.push({id:'rotor',t:'Montar rotor',s:'peças de rotor ('+p.rotor+' de 2)'+temKit(),ok:kit&&invCount('pecasRotor')>0});
  if(typeof veicMelhorias==='function')for(const m of veicMelhorias(v))A.push(m);
  A.push({id:'carga',t:'Porta-malas',s:v.itens.filter(Boolean).length+' de '+v.itens.length+' espaços',ok:true});
  A.push({id:'dirigir',t:T.voa?'Pilotar':T.agua?'Subir':'Dirigir',s:veicPode(v)||'pronto',ok:!veicPode(v)});
  return A;}
function veicRender(){const v=veicAberto;if(!v)return;const T=VT(v),p=v.pecas;$('vc-nome').textContent=T.nome;
  const linha=(nome,val,ruim)=>'<div class="vc-l'+(ruim?' ruim':'')+'"><span>'+nome+'</span><b>'+val+'</b></div>';let h='';
  if(!T.semMotor)h+=linha('Combustível',pct(v.comb),v.comb<15)+linha('Motor',pct(p.motor),p.motor<35);
  h+=linha(T.agua?'Casco':'Lataria',pct(v.hp),v.hp<35);
  if(T.rodas)h+=linha('Pneus',p.pneus.map(q=>q<=0?'furado':pct(q)).join(' · '),p.pneus.some(q=>q<=0));
  if(!T.semMotor&&!T.agua)h+=linha('Óleo',pct(p.oleo),p.oleo<15);
  if(T.bateria)h+=linha('Bateria',p.bateria?'ok':'faltando',!p.bateria);
  if(T.rotor)h+=linha('Rotor',p.rotor+' de 2 peças',p.rotor<2);
  if(v.blind)h+=linha('Blindagem',v.blind+' placa'+(v.blind>1?'s':''),false);
  h+=linha('Carga',v.itens.filter(Boolean).length+' de '+v.itens.length,false);
  $('vc-estado').innerHTML=h;$('vc-msg').textContent=veicMsg||'';
  $('vc-acoes').innerHTML=veicAcoes(v).map(a=>'<button class="btn'+(a.id==='dirigir'?' prim':'')+'" type="button" data-va="'+a.id+'"'+(a.ok?'':' disabled')+'><span>'+a.t+'</span><small>'+a.s+'</small></button>').join('');}
function veicAcao(id){const v=veicAberto;if(!v)return;const T=VT(v),p=v.pecas,kit=P.inv.find(s=>s&&s.id==='kitFerramentas');let msg='';
  switch(id){
    case'abastecer':if(abastecer(v))msg='Tanque em '+pct(v.comb);break;
    case'lataria':if(invCount('sucata')>=3&&invCount('pregos')>=2){invRemove('sucata',3);invRemove('pregos',2);v.hp=Math.min(100,v.hp+35);sfx('construir');msg=(T.agua?'Casco':'Lataria')+' em '+pct(v.hp);}break;
    case'motor':if(kit&&invCount('pecaVeiculo')){invRemove('pecaVeiculo',1);p.motor=Math.min(100,p.motor+70);gastar(kit,3);sfx('construir');msg='Motor em '+pct(p.motor);progresso('consertar');}break;
    case'pneu':if(kit&&invCount('pneu')){let i=p.pneus.indexOf(Math.min(...p.pneus));invRemove('pneu',1);p.pneus[i]=100;gastar(kit,2);sfx('construir');msg='Pneu trocado';}break;
    case'oleo':if(invCount('oleoMotor')){invRemove('oleoMotor',1);p.oleo=Math.min(100,p.oleo+45);sfx('pegar');msg='Óleo em '+pct(p.oleo);}break;
    case'bateria':if(kit&&invCount('bateriaVeic')){invRemove('bateriaVeic',1);p.bateria=true;gastar(kit,1);sfx('construir');msg='Bateria instalada';}break;
    case'rotor':if(kit&&invCount('pecasRotor')){const k=Math.min(2-p.rotor,invCount('pecasRotor'));invRemove('pecasRotor',k);p.rotor+=k;gastar(kit,3);sfx('construir');msg=p.rotor>=2?'Rotor montado!':'Falta mais 1 peça de rotor';if(p.rotor>=2&&typeof conquista==='function')progresso('rotor');}break;
    case'carga':{const vv=v;fecharVeiculo();abrirBau({itens:vv.itens,nome:'Porta-malas · '+T.nome});return;}
    case'dirigir':{const vv=v;fecharVeiculo();entrarVeic(vv);return;}
    default:if(typeof veicMelhoriaAcao==='function')msg=veicMelhoriaAcao(v,id)||'';}
  veicMsg=msg;veicRender();invRender();hudBarra();}
{const el=$('t-veiculo');if(el){el.addEventListener('click',e=>{const b=e.target.closest('[data-va]');if(b&&!b.disabled){veicAcao(b.dataset.va);sfx('clique');}});$('vc-fechar').addEventListener('click',fecharVeiculo);}}
window.addEventListener('keydown',e=>{if(G.modo==='veiculo'&&(e.code==='Escape'||e.code==='KeyE'||e.code==='Tab')){e.preventDefault();e.stopImmediatePropagation();fecharVeiculo();}},true);
UTIL_ACOES.pecaVeiculo=()=>{let best=null,bd=6;for(const v of VEICS){const d=Math.hypot(v.x-P.x,v.z-P.z);if(d<bd){bd=d;best=v;}}if(!best){feed('Use perto de um veículo',true);return false;}fecharMochila();abrirVeiculo(best);return false;};
UTIL_ACOES.jangada=i=>{if(!RIO.ok){feed('Precisa de água',true);return false;}const fx=Math.sin(P.body),fz=Math.cos(P.body);let pt=null;
  for(const d of[2.5,3.5,4.5]){const x=P.x+fx*d,z=P.z+fz*d,n=aguaNivel(x,z);if(n!==null&&n-ground(x,z)>0.6){pt=[x,z];break;}}
  if(!pt){feed('Fique de frente para a água, na beira do rio ou do lago',true);return false;}
  gastarUm(i);const v=veicNovo('jangada',pt[0],pt[1],P.body,{id:'jangada'+Date.now().toString(36)});v.y=veicChao(v,v.x,v.z);sfx('mergulho',pt[0],pt[1],0.6);feed('Jangada na água. Toque E perto dela para subir.');progresso('jangada');};
/* ---------- desenho ---------- */
function desenharCarro(Pg){for(const v of VEICS){if(v.ativo&&cfg.cam==='1'&&Pg===PL&&!VT(v).exposto)continue;desenharVeic(Pg,v);}}
const _VR=M4();
function desenharVeic(Pg,v){if(d2(v.x,v.z,cam.pos[0],cam.pos[2])>160*160)return;const T=VT(v),m=MESH[VMESH[v.tipo]];if(!m)return;trs(TMP,v.x,v.y,v.z,v.pitch,v.yaw,v.roll,1,1,1);
  if(Pg===PL)gl.uniform3f(PL.u.uTint,v.hp>0?1:0.45,v.hp>0?1:0.42,v.hp>0?1:0.4);drawStat(Pg,m,TMP);
  if(T.rodas)for(let i=0;i<T.rodas.length;i++){const w=T.rodas[i],dr=w[0]<0,sc=w[4]||1,fu=v.pecas.pneus[i]<=0;trs(TMP2,w[0],w[1]*(fu?0.82:1),w[2],dr?-v.giro:v.giro,(w[3]?-v.steer*0.5:0)+(dr?Math.PI:0),0,T.moto?0.5:sc,sc*(fu?0.85:1),sc);mul(CW2,TMP,TMP2);drawStat(Pg,MESH.roda,CW2);}
  if(T.voa&&MESH.v_rotor){trs(TMP2,0,2.75,0.45,0,v.giro,0,1,1,1);mul(CW2,TMP,TMP2);drawStat(Pg,MESH.v_rotor,CW2);trs(TMP2,0.12,2.0,-4.15,v.giro*1.7,0,0,1,1,1);mul(CW2,TMP,TMP2);drawStat(Pg,MESH.v_rotorCauda,CW2);}
  if(v.blind&&MESH.v_blind)drawStat(Pg,MESH.v_blind,TMP);
  if(Pg===PL)gl.uniform3f(PL.u.uTint,1,1,1);}
/* faróis acesos (dirigindo à noite) */
DESENHO.aditivo.push(()=>{const c=CARRO;if(!c||!c.ativo||!c.luz||c.hp<=0)return;const n=E.n||0;if(n<0.1)return;const T=VT(c),post=POSTX.ok&&!!GDEF;
  for(const f of T.farol){const q=carroLocal(f[0],f[1],f[2]);bb(q[0],q[1],q[2],post?0.22:0.3,1,0.95,0.8,0.7*n);}for(const f of T.lanterna){const q=carroLocal(f[0],f[1],f[2]);bb(q[0],q[1],q[2],0.18,1,0.15,0.1,0.6*n);}});
/* ---------- HUD do veículo ---------- */
let veicHudT=0;
HUDS.push(dt=>{veicHudT-=dt;if(veicHudT>0)return;veicHudT=0.2;const c=CARRO,el=$('pc-extra');if(!el||!c||!c.ativo)return;const T=VT(c),p=c.pecas,b=[];
  if(T.voa)b.push('Altura '+Math.round(c.alt)+' m');if(!T.semMotor)b.push('Motor '+pct(p.motor));if(T.rodas){const f=p.pneus.filter(q=>q<=0).length;b.push(f?f+(f>1?' pneus furados':' pneu furado'):'Pneus ok');}
  if(!T.semMotor&&!T.agua)b.push('Óleo '+pct(p.oleo));b.push('Carga '+c.itens.filter(Boolean).length+'/'+c.itens.length);el.textContent=b.join(' · ');
  const hp=$('pc-hp');if(hp)hp.textContent=(T.agua?'Casco ':'Lataria ')+Math.round(c.hp)+'%';const cb=$('pc-comb');if(cb&&T.semMotor)cb.style.width='0%';});
/* ---------- salvar ---------- */
function veicSalvar(){return VEICS.map(v=>({id:v.id,tipo:v.tipo,x:+v.x.toFixed(2),z:+v.z.toFixed(2),yaw:+v.yaw.toFixed(3),comb:+v.comb.toFixed(3),hp:Math.round(v.hp),pecas:v.pecas,itens:v.itens,visto:v.visto,blind:v.blind||0,alt:+(v.alt||0).toFixed(1)}));}
function veicCarregar(lista){if(!Array.isArray(lista))return;for(const s of lista){if(!s||!VTIPOS[s.tipo])continue;let v=VEICS.find(q=>q.id===s.id);
    if(!v)v=veicNovo(s.tipo,s.x,s.z,s.yaw,{id:s.id});
    v.x=s.x;v.z=s.z;v.yaw=s.yaw;v.comb=s.comb;v.hp=s.hp;v.visto=!!s.visto;v.blind=s.blind||0;v.v=0;v.ativo=false;
    if(s.pecas&&typeof s.pecas==='object'){Object.assign(v.pecas,s.pecas);if(VT(v).rodas&&(!Array.isArray(v.pecas.pneus)||v.pecas.pneus.length!==VT(v).rodas.length))v.pecas.pneus=VT(v).rodas.map(()=>100);}
    if(Array.isArray(s.itens))for(let i=0;i<v.itens.length;i++){const it=s.itens[i];v.itens[i]=it&&ITEMS[it.id]?it:null;}
    v.y=veicChao(v,v.x,v.z);if(VT(v).voa){v.alt=0;}veicColisor(v);}
  CARRO=VEICS[0];}
V8.novo.veiculos=()=>{};   // os veículos novos já nascem no carroInicio (novo jogo)
V8.salvar.veiculos=veicSalvar;
V8.carregar.veiculos=s=>{if(Array.isArray(s))veicCarregar(s);};
/* ---------- sons ---------- */
Object.assign(SONS,{helice:({noise,tone})=>{noise(0.34,'lowpass',380,180,0.8,0.55);tone(0.3,'sawtooth',38,34,0.06);}});

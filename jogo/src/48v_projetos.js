/* ================= base que evolui, construções reforçadas e plantas (projetos) =================
   Nível da base: o acampamento ganha pontos com o que você constrói perto da fogueira, com quem mora nele e com os
   territórios do grupo: Acampamento → Posto avançado → Base fortificada → Fortaleza. Cada nível dá algo de verdade:
   o grupo traz comida (posto avançado), as hordas da noite na clareira vêm menores (base fortificada) e o grupo produz
   material toda manhã (fortaleza). A bandeira da clareira muda de cor com o nível.
   Construções reforçadas: muro e portão de chapa de ferro, estacas de ferro, armário de ferro (baú que aguenta mais),
   rede de camuflagem (os zumbis enxergam menos quem está embaixo dela), estufa (verdura toda manhã) e antena da base
   (uma oferta de troca a mais e a escuta dos eventos no mapa). As de ferro, a estufa e a antena precisam da planta:
   papéis achados no mundo (arsenal do bunker, galpões dos sítios, estação escondida...). */
const BASE_NIVEIS=[{n:1,nome:'Acampamento',pts:0,cor:0x8a7a5a},{n:2,nome:'Posto avançado',pts:40,cor:0x3a7a4a},{n:3,nome:'Base fortificada',pts:110,cor:0x3a5a8a},{n:4,nome:'Fortaleza',pts:220,cor:0xb08a2a}];
iconesNovos({'i-planta':'<path d="M4 4h12l4 4v12H4zM16 4v4h4M8 12h8M8 16h5"/>','i-estufa':'<path d="M3 20V10l9-6 9 6v10zM3 14h18M12 4v16"/>','i-antena':'<path d="M12 21V9M8 21l4-12 4 12M7 5a7 7 0 0 1 10 0M9.5 7.5a3.5 3.5 0 0 1 5 0"/>',
  'i-rede':'<path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18"/>'});
Object.assign(ITEMS,{
  plantaFerro:{nome:'Planta: construções de ferro',icon:'i-planta',max:1,tipo:'util',acao:'Estudar a planta',desc:'Desenho técnico de muro, portão e estacas de chapa de ferro. Estude para poder construir.'},
  plantaEstufa:{nome:'Planta: estufa',icon:'i-planta',max:1,tipo:'util',acao:'Estudar a planta',desc:'Como montar uma estufa com tábuas e garrafas. Estude para poder construir.'},
  plantaRadio:{nome:'Planta: antena da base',icon:'i-planta',max:1,tipo:'util',acao:'Estudar a planta',desc:'Esquema de uma antena de rádio com ferro velho e pilhas. Estude para poder construir.'}});
const PLANTAS={plantaFerro:'muro de ferro, portão de ferro e estacas de ferro',plantaEstufa:'a estufa',plantaRadio:'a antena da base'};
for(const id in PLANTAS)UTIL_ACOES[id]=i=>{marco(id);gastarUm(i);sfx('missao');ganharXP(40);toast('habilidade','Você estudou a planta: agora dá para construir '+PLANTAS[id]+' (menu de construção).');if(typeof diarioDescobre==='function')diarioDescobre('manual',id,ITEMS[id].nome);};
Object.assign(OBRAS,{
  muroFerro:{nome:'Muro de chapa de ferro',icon:'i-muro-pedra',custo:{chapaFerro:3,barraFerro:2,pedra:4},hp:1400,hw:1.5,hd:0.22,solid:true,etapa:3,desb:'plantaFerro'},
  portaoFerro:{nome:'Portão de ferro',icon:'i-portao',custo:{chapaFerro:4,barraFerro:3,pregos:6},hp:1100,hw:1.5,hd:0.18,solid:true,portao:true,etapa:3,desb:'plantaFerro'},
  espetosFerro:{nome:'Estacas de ferro',icon:'i-estacas',custo:{barraFerro:2,madeira:2},hp:380,hw:1.0,hd:0.55,solid:false,armadilha:true,etapa:3,desb:'plantaFerro'},
  armarioFerro:{nome:'Armário de ferro',icon:'i-bau',custo:{chapaFerro:2,barraFerro:2},hp:600,hw:0.5,hd:0.35,solid:true,bau:true,etapa:3,desb:'oficina'},
  redeCamuflagem:{nome:'Rede de camuflagem',icon:'i-rede',custo:{pano:4,corda:2,fibra:6},hp:80,hw:1.6,hd:1.6,solid:false,etapa:2},
  estufa:{nome:'Estufa',icon:'i-estufa',custo:{tabuas:10,pregos:8,garrafa:6,pano:2},hp:220,hw:1.8,hd:1.3,solid:true,etapa:2,desb:'plantaEstufa'},
  antenaBase:{nome:'Antena da base',icon:'i-antena',custo:{barraFerro:4,sucata:6,pilhas:2,corda:2},hp:260,hw:0.6,hd:0.6,solid:true,etapa:3,desb:'plantaRadio'}});
/* no menu de construção: no chão todas; dentro de prédio e no telhado só o armário (e a rede no telhado) */
for(const k of['muroFerro','portaoFerro','espetosFerro','armarioFerro','redeCamuflagem','estufa','antenaBase']){OBRA_ORDEM.push(k);OBRAS_CHAO.push(k);}
OBRAS_PREDIO.push('armarioFerro');OBRAS_TELHADO.push('armarioFerro','redeCamuflagem');OBRAS_ALTO.push('armarioFerro');
/* plantas no mundo: uma garantida em cada fonte, e algumas no saque */
LOOT.arsenalSub.push(['plantaFerro',1,1,0.3]);if(LOOT.militar)LOOT.militar.push(['plantaFerro',1,1,0.04]);if(LOOT.vagaoBlindado)LOOT.vagaoBlindado.push(['plantaFerro',1,1,0.4]);
if(LOOT.celeiro)LOOT.celeiro.push(['plantaEstufa',1,1,0.12]);if(LOOT.oficina)LOOT.oficina.push(['plantaEstufa',1,1,0.05]);
LOOT.estacaoSub.push(['plantaRadio',1,1,0.35]);if(LOOT.bilheteria)LOOT.bilheteria.push(['plantaRadio',1,1,0.3]);if(LOOT.heliCx)LOOT.heliCx.push(['plantaRadio',1,1,0.35]);
INIT_MALHAS.push(()=>{const c=SUB.caixas.find(q=>q.id==='cx_ars1');if(c)c.fixo=(c.fixo||[]).concat('plantaFerro');const e=SUB.caixas.find(q=>q.id==='cx_est');if(e)e.fixo=(e.fixo||[]).concat('plantaRadio');});
INIT_MALHAS.push(()=>{const it=INTER.find(i=>i.id==='galpao-sitio1');if(it)it.primeiro=[['plantaEstufa',1]];});
/* ---------- nível da base ---------- */
function basePontos(){let p=0;for(const o of OB){if(!sobBase(o.x,o.z,34))continue;const O=OBRAS[o.tipo];if(!O||o.tipo==='geradorBase')continue;p+=O.pts??Math.max(1,Math.round(Object.values(O.custo||{}).reduce((a,b)=>a+b,0)/2));}
  if(typeof SOBREV!=='undefined')p+=8*SOBREV.filter(s=>s.st==='base'||s.st==='fora').length;if(G.terr)p+=10*Object.values(G.terr.t).filter(q=>q.dono).length;return p;}
function baseNivel(){const pts=basePontos();let L=BASE_NIVEIS[0];for(const n of BASE_NIVEIS)if(pts>=n.pts)L=n;return{n:L,pts,prox:BASE_NIVEIS.find(q=>q.pts>pts)||null};}
let baseNivT=0;
PASSOS.push(dt=>{baseNivT-=dt;if(baseNivT>0)return;baseNivT=3;const b=baseNivel(),ant=G.baseNv||1;if(b.n.n!==ant){G.baseNv=b.n.n;if(b.n.n>ant&&G.modo==='jogo'){sfx('nivel');ganharXP(80*(b.n.n-1));
    toast('conquista','Sua base subiu de nível: '+b.n.nome+'! '+({2:'O grupo agora traz comida toda manhã.',3:'As hordas da noite na clareira vêm menores.',4:'O grupo produz material toda manhã.'}[b.n.n]||''));
    if(typeof diarioEvento==='function')diarioEvento('Base: '+b.n.nome,'missao');if(b.n.n>=4&&typeof conquista==='function')conquista('fortaleza');}}});
AMANHECE.push(()=>{const b=baseNivel();if(!bausBase().length)return;const L=[];
  if(b.n.n>=2){const c=['frutas','milho','batata','carneCrua','feijao'][Math.floor(Math.random()*5)];if(ITEMS[c])L.push([c,1+Math.floor(Math.random()*2)]);}
  if(b.n.n>=4){L.push(['tabuas',2],['pregos',3],['sucata',2]);}
  // estufas: verdura toda manhã
  for(const o of OB)if(o.tipo==='estufa'&&sobBase(o.x,o.z,40))for(const v of['milho','batata','abobora'])if(Math.random()<0.6)L.push([v,1+Math.floor(Math.random()*2)]);
  if(L.length){depositarBase(L);toast('grupo','Produção da base hoje: '+nomesItens(L)+'. Está nos baús.');}});
/* hordas menores na base fortificada (o jogo pergunta este fator antes de soltar a horda da noite) */
function baseFatorHorda(){const n=G.baseNv||1;return n>=3?0.8:1;}
/* rede de camuflagem: quem está embaixo dela é visto de mais perto */
function camuflado(){for(const o of OB)if(o.tipo==='redeCamuflagem'&&Math.abs(o.x-P.x)<2.4&&Math.abs(o.z-P.z)<2.4&&Math.abs((o.y||0)-P.y)<2)return true;return false;}
function temAntenaBase(){return OB.some(o=>o.tipo==='antenaBase'&&o.hp>0);}
/* ---------- desenho: as construções novas e a bandeira da clareira ---------- */
INIT_MALHAS.push(()=>{const R=rng(5577),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};const ferro=lin(0x6a6e70),ferro2=lin(0x55595b),ferrugem=lin(0x7a4a2a);
  MESH.obra.muroFerro=mk(g=>{for(const x of[-1.45,0,1.45])add(g,boxTris(0.16,2.4,0.16),mat(x,1.2,0),ferro2);for(let i=0;i<10;i++){const x=-1.35+i*0.3;add(g,boxTris(0.3,2.1,0.05),mat(x,1.1,0.06*(i%2?1:-1)),i%3===1?ferrugem:ferro,{j:0.06,rnd:R});}
    for(const y of[0.3,1.2,2.0])add(g,boxTris(3.0,0.1,0.18),mat(0,y,0),ferro2);});
  MESH.obra.portaoFerroBase=mk(g=>{for(const px of[-1.5,1.5])add(g,boxTris(0.24,2.4,0.24),mat(px,1.2,0),ferro2);add(g,boxTris(3.2,0.18,0.22),mat(0,2.4,0),ferro2);});
  MESH.obra.portaoFerroFolha=mk(g=>{for(let i=0;i<9;i++)add(g,boxTris(0.3,2.0,0.05),mat(0.15+i*0.31,1.05,0.05),i%4===2?ferrugem:ferro,{j:0.05,rnd:R});for(const y of[0.35,1.05,1.75])add(g,boxTris(2.8,0.1,0.1),mat(1.4,y,0.1),ferro2);
    add(g,boxTris(0.1,0.25,0.12),mat(2.6,1.0,0.16),lin(0x2b2b2b));});
  MESH.obra.portaoFerro=MESH.obra.portaoFerroBase;
  MESH.obra.espetosFerro=mk(g=>{add(g,boxTris(2.0,0.12,0.3),mat(0,0.06,0),ferro2);for(let i=0;i<7;i++){const x=-0.9+i*0.3;for(const s of[1,-1])add(g,cylTris(0,0.035,0.9,5),alignY(x,0.1,s*0.05,0,0.75,s*0.6),i%2?ferro:ferrugem);}});
  MESH.obra.armarioFerro=mk(g=>{add(g,boxTris(1.0,1.9,0.7),mat(0,0.95,0),ferro,{j:0.04,rnd:R});add(g,boxTris(0.02,1.8,0.72),mat(0,0.95,0),ferro2);for(const s of[-0.1,0.1])add(g,boxTris(0.04,0.18,0.04),mat(s,1.0,0.37),lin(0xb0b4b8));
    for(let i=0;i<4;i++)add(g,boxTris(0.3,0.03,0.02),mat(-0.25,1.6-i*0.06,0.36),ferro2);});
  MESH.obra.redeCamuflagem=mk(g=>{for(const[x,z]of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])add(g,cylTris(0.04,0.05,2.3,5),mat(x,0,z),lin(0x5a4430));
    add(g,boxTris(3.3,0.04,3.3),mat(0,2.3,0),lin(0x3a4a2a),{j:0.1,rnd:R});for(let i=0;i<40;i++)add(g,boxTris(0.35,0.03,0.25),mat((R()-0.5)*3.2,2.27-R()*0.15,(R()-0.5)*3.2,0,R()*3,0),lin(R()<0.5?0x4a5a2a:0x5a6a32),{j:0.15,rnd:R});
    for(let i=0;i<10;i++){const a=R()*6.283;add(g,boxTris(0.4,0.6,0.02),mat(Math.cos(a)*1.6,1.95,Math.sin(a)*1.6,0,a,0),lin(0x3a4a2a),{j:0.1,rnd:R});}});
  MESH.obra.estufa=mk(g=>{const md=lin(0x6b4e30),vidro=lin(0xc8e0d8);for(const x of[-1.8,0,1.8])for(const z of[-1.3,1.3])add(g,boxTris(0.12,1.9,0.12),mat(x,0.95,z),md);
    for(const z of[-1.3,1.3])add(g,boxTris(3.7,0.1,0.12),mat(0,1.9,z),md);for(const s of[-1,1])add(g,boxTris(3.7,0.05,1.5),mm(mat(0,2.3,s*0.68),mat(0,0,0,s*0.55,0,0)),vidro,{e:0.05});
    for(const z of[-1.3,1.3])add(g,boxTris(3.6,1.8,0.03),mat(0,0.95,z),vidro,{e:0.04});for(const x of[-1.8,1.8])add(g,boxTris(0.03,1.8,2.5),mat(x,0.95,0),vidro,{e:0.04});
    for(let i=0;i<3;i++){add(g,boxTris(0.9,0.3,2.2),mat(-1.1+i*1.1,0.15,0),lin(0x4a3a28));for(let k=0;k<5;k++)add(g,icoTris(0.16,0.3,R),mat(-1.1+i*1.1+(R()-0.5)*0.5,0.4,-0.8+k*0.4),lin(0x4f7a2f),{j:0.2,rnd:R});}});
  MESH.obra.antenaBase=mk(g=>{for(const[x,z]of[[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]])add(g,cylTris(0.04,0.05,7.5,5),alignY(x,0,z,-x*0.08,1,-z*0.08),ferro2);
    for(let y=1;y<7;y+=1.2)add(g,boxTris(0.85-y*0.06,0.05,0.85-y*0.06),mat(0,y,0),ferro);add(g,cylTris(0.02,0.02,2.2,4),mat(0,7.4,0),ferro2);
    add(g,cylTris(0.55,0.1,0.2,12),mm(mat(0.2,5.6,0.5),mat(0,0,0,1.2,0,0)),lin(0xd8d8d0));add(g,boxTris(0.5,0.4,0.3),mat(0,0.2,0.7),lin(0x3a3e40));add(g,boxTris(0.08,0.08,0.02),mat(0.1,0.3,0.86),lin(0x3aa070),{e:1});});
  MESH.baseBandeira=mk(g=>{add(g,cylTris(0.05,0.06,5.2,8),mat(0,0,0),lin(0x8a8e92));});
  MESH.baseBandeiraPano=mk(g=>{for(let i=0;i<6;i++)add(g,boxTris(0.26,1.1,0.03),mat(0.15+i*0.25,4.5,Math.sin(i*1.1)*0.06),lin(0xffffff),{j:0.03,rnd:R});});});
DESENHO.opaco.push(Pg=>{if(!MESH.baseBandeira||cam.pos[1]<SUB_FUNDO||marcoBase())return;const x=FIRE[0]-4.2,z=FIRE[2]-3.4,b=BASE_NIVEIS[(G.baseNv||1)-1]||BASE_NIVEIS[0],c=b.cor;
  if(d2(x,z,cam.pos[0],cam.pos[2])>160*160)return;const g=ground(x,z);drawStat(Pg,MESH.baseBandeira,mat(x,g,z));
  gl.uniform3f(Pg.u.uTint,((c>>16)&255)/255*1.2,((c>>8)&255)/255*1.2,(c&255)/255*1.2);drawStat(Pg,MESH.baseBandeiraPano,mat(x,g,z,0,Math.sin(G.t*0.7)*0.3,0));gl.uniform3f(Pg.u.uTint,1,1,1);});
CONQ.push({id:'fortaleza',nome:'Fortaleza',desc:'Leve a base ao nível Fortaleza.'});

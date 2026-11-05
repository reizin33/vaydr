/* ================= céu e água: aviões abandonados, suprimentos com paraquedas, sinalizador e afogados =================
   Três destroços para achar: o monomotor que caiu na ilhota do lago (nade ou vá de barco; à noite os afogados rondam), o
   avião de carga partido ao meio na mata do sudoeste (caixas espalhadas e passageiros mortos que ainda andam) e o helicóptero
   militar tombado a leste da clareira. Cada um tem saque, um documento (diário de bordo, caixa-preta, ordem de voo) e um
   sinalizador. A caixa de suprimentos agora vem de verdade: um avião cruza o céu, larga a caixa e ela desce de paraquedas
   até o chão (fumaça vermelha quando pousa). O sinalizador chama um avião até você (e chama os mortos também).
   Afogados: zumbis que vivem no fundo do rio e do lago. À noite, ou quando você nada, eles sobem atrás de você. */
const AEREO={
  destrocos:[{id:'cessna',nome:'Monomotor na ilhota',tipo:'cessna',x:73.3,z:107.2,yaw:2.3,ilha:true},
    {id:'carga',nome:'Avião de carga caído',tipo:'carga',x:-92,z:102,yaw:0.7},
    {id:'heli',nome:'Helicóptero militar tombado',tipo:'heli',x:78,z:38,yaw:-1.1}],
  aviao:{alt:62,vel:38},paraq:{vel:3.2},afog:{max:3,raioMin:9,raioMax:22,checa:14}};
iconesNovos({'i-sinalizador':'<path d="M7 21h6l1-8H6zM10 13V9M10 9c0-3 3-5 3-7M10 9c0-2-2-3-2-5"/><circle cx="16" cy="5" r="2"/>',
  'i-aviao':'<path d="M2 14l8-2 2-8 2 1-1 7 7 2v2l-7-1-1 5 2 2-1 1-3-2-3 2-1-1 2-2-1-5z"/>'});
Object.assign(ITEMS,{sinalizador:{nome:'Sinalizador',icon:'i-sinalizador',max:3,tipo:'util',acao:'Disparar para o céu',desc:'Pistola de sinal. Disparada para o céu chama um avião de suprimentos até onde você está. A luz vermelha também chama os mortos.'}});
Object.assign(LOOT,{
  cessnaCx:[['kit',1,1,0.8],['remedios',1,2,0.7],['agua',1,2,0.7],['racao',1,2,0.6],['bandagem',1,2,0.6],['lanterna',1,1,0.3]],
  cargaCx:[['racao',2,4,0.9],['agua',2,4,0.9],['municao9',6,12,0.6],['kit',1,1,0.4],['pregos',4,8,0.6],['gasolina',1,2,0.5],['pano',2,4,0.5],['barraFerro',1,2,0.3],['sinalizador',1,1,0.25]],
  heliCx:[['rifle',1,1,0.5],['balaRifle',6,12,0.8],['colete',1,1,0.4],['mascaraGas',1,1,0.4],['municao9',6,10,0.6],['kit',1,1,0.5],['bombaCaseira',1,1,0.3]]});
LOOT.suprimentos.push(['sinalizador',1,1,0.12]);if(LOOT.militar)LOOT.militar.push(['sinalizador',1,1,0.08]);if(LOOT.comboio)LOOT.comboio.push(['sinalizador',1,1,0.2]);
const DOCS_AEREO={
  cessna:['Diário de bordo do PT-VSR','Decolei da fazenda com remédio para a vila. Lá de cima a vila já estava vazia e a estrada cheia deles.<br><br>O motor engasgou em cima do lago. Consegui pousar na ilhota, mas a asa ficou na água.<br><br>Deixei o sinalizador na caixa de primeiros socorros. Se alguém achar: dispare para o céu e reze para ainda ter avião voando.'],
  carga:['Transcrição da caixa-preta · Hércules 2470','"Torre Serra Velha, aqui é o Hércules 2470 com suprimentos para a base."<br>"...perdemos o motor dois, repito, motor dois..."<br>"...vamos tentar a clareira grande ao sul da fazenda..."<br>"...tem gente lá embaixo, eles estão..."<br><br>(ruído até o fim da gravação)'],
  heli:['Ordem de voo · Águia 3','Missão: resgatar a equipe do Projeto Esporo na torre de rádio e levar as amostras para a capital.<br><br>Nota do copiloto, escrita a lápis: "o sargento foi mordido na decolagem. Ele está suando. Vou pousar no primeiro campo aberto."']};
/* ---------- estado ---------- */
function aereoNovo(){return{caixas:{},docs:{},lancamento:null,afogT:0};}
function aereoD(){return G.aereo||(G.aereo=aereoNovo());}
/* ---------- destroços: malhas, colisores e pontos de saque ---------- */
function destrocoGeo(d){const g=new GB(1<<13,8),R=rng(d.id.length*97+11);const branco=lin(0xe8e4dc),verm=lin(0xa02a20),cinza=lin(0x6a6e72),oli=lin(0x4a5236),oli2=lin(0x3c4430),preto=lin(0x1c1c1c),vidro=lin(0x1e2a33);
  const B=(w,h,dd,m,c,o)=>add(g,boxTris(w,h,dd,o),m,c,{j:0.05,rnd:R});
  if(d.tipo==='cessna'){B(1.3,1.3,6.2,mat(0,0.85,0,0.18,0,0.12),branco,{tx:0.8,tz:0.9});B(1.32,0.18,6.22,mat(0,0.6,0,0.18,0,0.12),verm);
    B(9.5,0.12,1.5,mm(mat(0,1.7,0.6,0.18,0,0.12),mat(-1.2,0,0,0,0,-0.12)),branco);B(0.12,1.5,1.2,mat(0,1.9,-3.0,0.18,0,0.12),branco);B(3.2,0.1,0.9,mat(0,1.15,-3.05,0.18,0,0.12),branco);
    B(1.0,0.5,0.06,mat(0,1.45,1.9,0.5,0,0.12),vidro);add(g,cylTris(0.25,0.3,0.35,10),mm(mat(0,0.45,3.2),mat(0,0,0,Math.PI/2,0,0)),cinza);
    for(const a of[0.3,2.4])B(0.12,1.8,0.08,mm(mat(0,0.45,3.4),mat(0,0,0,0,0,a)),preto);for(const s of[-0.9,0.9])add(g,cylTris(0.22,0.22,0.12,10),mm(mat(s,0.0,0.8),mat(0,0,0,0,0,Math.PI/2)),preto);}
  else if(d.tipo==='carga'){// parte da frente (cabine) e de trás (rampa), asa solta, motores e caixas espalhadas
    B(3.6,3.4,11,mat(-1.2,1.7,5.5,0,0.08,0.06),cinza,{tx:0.92});B(3.0,1.0,0.1,mat(-1.2,2.9,11.0,0.25,0.08,0.06),vidro);B(3.5,3.3,9,mat(1.6,1.6,-6.5,0,-0.25,-0.1),cinza,{tx:0.9});
    B(0.2,4.5,3.2,mat(1.9,4.2,-10.2,0,-0.25,-0.1),cinza);B(8,0.2,2.6,mat(1.9,3.6,-10.5,0,-0.25,-0.1),cinza);
    B(16,0.35,3.4,mat(-8,0.6,1.5,0,0.4,0.15),lin(0x7a7e82));B(7,0.35,3.2,mat(5.5,3.5,2.5,0,0.08,0),lin(0x7a7e82));
    for(const[x,z]of[[-6,2.2],[-10,0.6]]){add(g,cylTris(0.7,0.8,2.6,12),mm(mat(x,0.9,z),mat(0,0,0,Math.PI/2,0.4,0)),lin(0x5a5e62),{j:0.06,rnd:R});}
    for(let i=0;i<14;i++)B(0.6+R()*1.4,0.1+R()*0.3,0.6+R()*1.6,mat((R()-0.5)*26,0.1,(R()-0.5)*26,(R()-0.5)*0.4,R()*6,(R()-0.5)*0.4),R()<0.5?cinza:lin(0x3a3a38));
    for(let i=0;i<5;i++)B(1.0,0.06,1.0,mat((R()-0.5)*14,0.03,(R()-0.5)*14,0,R()*6,0),lin(0x1a1816));}
  else{// helicóptero tombado de lado
    B(2.2,2.0,5.4,mat(0,1.1,0,0,0,Math.PI/2*0.85),oli,{tx:0.85});B(0.6,0.6,5.2,mat(0.4,0.6,-4.6,0,0.1,Math.PI/2*0.85),oli2);B(0.1,1.6,1.0,mat(0.5,1.0,-7.0,0,0.1,0.3),oli2);
    B(1.8,0.9,0.06,mat(-0.2,1.2,2.7,0.3,0,Math.PI/2*0.85),vidro);for(const a of[0.4,1.9,3.3])B(0.3,0.05,6.5,mm(mat(-1.6,1.1,0.3),mat(0,a,0.6+R()*0.4)),preto);
    for(const s of[-0.9,0.9])B(0.1,0.1,3.8,mat(1.4,0.4+s*0.4,0,0,0,0.2),preto);for(let i=0;i<8;i++)B(0.3+R()*0.8,0.08,0.3+R()*0.8,mat((R()-0.5)*10,0.05,(R()-0.5)*10,0,R()*6,0),oli2);
    add(g,boxTris(1.0,0.06,1.4),mat(-2.4,0.03,1.6),lin(0xb02a20));}
  return litMesh(g.data());}
function destrocoPontos(d){const c=Math.cos(d.yaw),s=Math.sin(d.yaw),at=(a,b)=>[d.x+c*a+s*b,d.z-s*a+c*b];
  if(d.tipo==='cessna')return{caixas:[{id:d.id+'_cx',tab:'cessnaCx',fixo:['sinalizador'],nome:'Caixa de primeiros socorros do avião',p:at(1.4,0.6)}],doc:{p:at(-1.3,1.2)},cols:[[at(0,0),0.8,3.2]]};
  if(d.tipo==='carga')return{caixas:[{id:d.id+'_cx1',tab:'cargaCx',fixo:['sinalizador'],nome:'Caixa de carga',p:at(3,5)},{id:d.id+'_cx2',tab:'cargaCx',nome:'Caixa de carga',p:at(-4,-3)},{id:d.id+'_cx3',tab:'cargaCx',nome:'Caixa de carga',p:at(6,-1)}],
    doc:{p:at(-2.6,9.5)},cols:[[at(-1.2,5.5),1.9,5.5],[at(1.6,-6.5),1.8,4.6],[at(-8,1.5),1.2,7]]};
  return{caixas:[{id:d.id+'_cx',tab:'heliCx',fixo:['sinalizador'],nome:'Caixa do helicóptero',p:at(-2.2,-1.5)}],doc:{p:at(-1.6,3.4)},cols:[[at(0,0),1.3,3.0],[at(0.4,-4.6),0.5,2.6]]};}
INIT_MALHAS.push(()=>{for(const d of AEREO.destrocos){d.y=ground(d.x,d.z)-(d.ilha?0.25:0.1);d.malha=destrocoGeo(d);d.pts=destrocoPontos(d);
    for(const[p,hw,hd]of d.pts.cols)colBox(p[0],p[1],hw,hd,d.yaw,{solid:true,aviao:true});for(const cx of d.pts.caixas)cx.y=ground(cx.p[0],cx.p[1]);d.pts.doc.y=ground(d.pts.doc.p[0],d.pts.doc.p[1]);}
  // sem árvore em cima do destroço
  for(const d of AEREO.destrocos)for(const t of TREES)if(!t.agua&&Math.hypot(t.x-d.x,t.z-d.z)<(d.tipo==='carga'?16:7)){t.agua=true;t.alive=false;const c=COLL.find(q=>q.tree===t);if(c)colRemove(c);}vegDirty=true;
  const R=rng(4242),mk=f=>{const gb=new GB(4096,8);f(gb);return litMesh(gb.data());};
  MESH.aviaoVoo=mk(g=>{const c=lin(0x7a7e72);add(g,boxTris(3.2,3.0,16,{tx:0.9}),mat(0,0,0),c,{j:0.03,rnd:R});add(g,boxTris(30,0.4,3.6),mat(0,1.2,1),lin(0x6a6e64));add(g,boxTris(0.3,4,3),mat(0,2.6,-7.2),c);add(g,boxTris(10,0.3,2.2),mat(0,1.4,-7.4),c);
    for(const x of[-9,-4.5,4.5,9])add(g,cylTris(0.6,0.7,3,10),mm(mat(x,0.8,2.6),mat(0,0,0,Math.PI/2,0,0)),lin(0x4a4e52));add(g,boxTris(2.4,0.8,0.1),mat(0,0.9,8.05),lin(0x1e2a33),{e:0.05});});
  MESH.paraquedas=mk(g=>{add(g,ellipTris(3.2,1.4,3.2,14,6),mat(0,6,0,0,0,0,1,1,1),lin(0xd8d0b8),{j:0.04,rnd:R});for(let i=0;i<8;i++){const a=i/8*6.283;add(g,cylTris(0.015,0.015,6.2,4),alignY(Math.cos(a)*2.9,0.6,Math.sin(a)*2.9,-Math.cos(a)*2.9,5.6,-Math.sin(a)*2.9),lin(0x3a3a38));}
    for(let i=0;i<6;i++){const a=i/6*6.283;add(g,boxTris(0.9,0.05,0.4),mat(Math.cos(a)*1.8,6.6,Math.sin(a)*1.8,0,-a,0),lin(0xb02a20));}});});
function aereoDesenhar(Pg,sombra){if(cam.pos[1]<SUB_FUNDO)return;const cx=sombra?P.x:cam.pos[0],cz=sombra?P.z:cam.pos[2];
  for(const d of AEREO.destrocos)if(d.malha&&d2(d.x,d.z,cx,cz)<(sombra?60:180)**2)drawStat(Pg,d.malha,mat(d.x,d.y,d.z,0,d.yaw,0));
  if(sombra)return;const A=aereoD();
  if(MESH.caixa)for(const d of AEREO.destrocos)if(d.pts&&d2(d.x,d.z,cx,cz)<120*120)for(const c of d.pts.caixas){const L=A.caixas[c.id];if(L&&!L.some(Boolean))continue;drawStat(Pg,MESH.caixa,mat(c.p[0],c.y,c.p[1],0,d.yaw,0));}
  const L=A.lancamento;if(L){if(L.fase==='voo'||L.fase==='solta'){const t=L.t,x=L.x0+L.ux*t*AEREO.aviao.vel,z=L.z0+L.uz*t*AEREO.aviao.vel;drawStat(Pg,MESH.aviaoVoo,mat(x,AEREO.aviao.alt,z,0,Math.atan2(L.ux,L.uz),0));}
    if(L.fase==='solta'||L.fase==='desce'){if(MESH.caixa)drawStat(Pg,MESH.caixa,mat(L.x,L.y,L.z,0,L.giro||0,0));drawStat(Pg,MESH.paraquedas,mat(L.x,L.y+0.5,L.z,Math.sin(G.t*1.3)*0.06,L.giro||0,Math.cos(G.t*1.1)*0.06));}}}
DESENHO.opaco.push(Pg=>aereoDesenhar(Pg,false));DESENHO.sombra.push(Pg=>aereoDesenhar(Pg,true));
MAPA_DESENHOS.push((g,X,Y,k,n)=>{const D=G.diario;for(const d of AEREO.destrocos){if(!D||!D.desc['lugar:av_'+d.id])continue;const x=X(d.x),y=Y(d.z);g.strokeStyle=n>0.5?'#9aa0a6':'#e8e4dc';g.lineWidth=1.6;
  g.beginPath();g.moveTo(x-4,y);g.lineTo(x+4,y);g.moveTo(x,y-3);g.lineTo(x,y+4);g.moveTo(x-2,y+3);g.lineTo(x+2,y+3);g.stroke();}});
/* ---------- interações nos destroços ---------- */
INTERS.push(tryIt=>{if(P.y<SUB_FUNDO)return;for(const d of AEREO.destrocos){if(!d.pts||Math.abs(d.x-P.x)>20||Math.abs(d.z-P.z)>20)continue;const A=aereoD();
  for(const c of d.pts.caixas){const L=A.caixas[c.id];if(L&&!L.some(Boolean))continue;tryIt({k:'avCaixa',o:c},c.p[0],c.p[1],1.9,2.2,-0.6,c.y);}
  tryIt({k:'avDoc',o:d},d.pts.doc.p[0],d.pts.doc.p[1],1.9,2.0,-0.6,d.pts.doc.y);}});
INTER_K.avCaixa={texto:c=>({t:'Revistar: '+c.nome.toLowerCase(),s:aereoD().caixas[c.id]?'ainda tem coisa':''}),usar:c=>{const A=aereoD();let L=A.caixas[c.id];
  if(!L){L=new Array(BAU_N).fill(null);let i=0;for(const id of c.fixo||[])L[i++]=newItem(id,1);for(const[id,n,ex]of rollLoot(c.tab)){if(i>=BAU_N)break;if(ITEMS[id])L[i++]=Object.assign(newItem(id,n),ex||{});}A.caixas[c.id]=L;ganharXP(12);}
  abrirBau({itens:L,nome:c.nome,saque:true,aoMudar:()=>{}});}};
INTER_K.avDoc={texto:d=>({t:'Ler: '+DOCS_AEREO[d.tipo][0].toLowerCase(),s:d.nome}),usar:d=>{const[t,x]=DOCS_AEREO[d.tipo];if(G.modo!=='jogo')return;G.modo='doc';tela('t-doc');$('doc-tit').textContent=t;$('doc-txt').innerHTML=x;
  if(document.pointerLockElement)document.exitPointerLock();const A=aereoD();if(!A.docs[d.id]){A.docs[d.id]=true;ganharXP(10);if(typeof diarioDescobre==='function')diarioDescobre('manual','av_'+d.id,t);}sfx('clique');}};
let aereoDescT=0;
PASSOS.push(dt=>{aereoDescT-=dt;if(aereoDescT>0||typeof diarioDescobre!=='function')return;aereoDescT=2;for(const d of AEREO.destrocos)if(Math.hypot(P.x-d.x,P.z-d.z)<(d.tipo==='carga'?22:14)&&P.y>SUB_FUNDO)diarioDescobre('lugar','av_'+d.id,d.nome,20);});
/* ---------- suprimentos de paraquedas (a caixa de sempre agora vem de avião) ---------- */
function aereoLancar(x,z,motivo){const A=aereoD();if(A.lancamento)return false;const a=Math.random()*6.283,ux=Math.cos(a),uz=Math.sin(a),dist=260;
  A.lancamento={fase:'voo',t:0,x0:x-ux*dist,z0:z-uz*dist,ux,uz,x,z,y:AEREO.aviao.alt-2,tSolta:dist/AEREO.aviao.vel,motivo:motivo||'radio',giro:Math.random()*6};sfx('motor',x,z,1);return true;}
PASSOS.push(dt=>{const A=G.aereo;if(!A||!A.lancamento)return;const L=A.lancamento;L.t+=dt;
  if(L.fase==='voo'||L.fase==='solta'){A.somT=(A.somT||0)-dt;if(A.somT<=0){A.somT=0.7;const px=L.x0+L.ux*L.t*AEREO.aviao.vel,pz=L.z0+L.uz*L.t*AEREO.aviao.vel;sfx('motor',px,pz,1.6);}}
  if(L.fase==='voo'&&L.t>=L.tSolta){L.fase='solta';L.y=AEREO.aviao.alt-3;feed('A caixa saiu do avião!');}
  if(L.fase==='solta'||L.fase==='desce'){if(L.fase==='solta'&&L.t>L.tSolta+0.6)L.fase='desce';L.y-=dt*(L.fase==='solta'?9:AEREO.paraq.vel);L.giro=(L.giro||0)+dt*0.3;
    const g=ground(L.x,L.z);if(L.y<=g){L.y=g;aereoPousou(L);}}
  if(L.fase==='voo'||L.fase==='solta'){if(L.t>L.tSolta*2+4&&L.fase==='voo')A.lancamento=null;}});
function aereoPousou(L){const A=aereoD();A.lancamento=null;sfx('impacto',L.x,L.z,0.8);poeira(L.x,ground(L.x,L.z)+0.3,L.z,16);
  G.ev=Object.assign(G.ev||{},{x:L.x,z:L.z,y:ground(L.x,L.z),ativo:true,feito:false,hora:G.hora});barulho(L.x,L.z,45,false);
  const dirs=['ao norte','a nordeste','a leste','a sudeste','ao sul','a sudoeste','a oeste','a noroeste'],ang=Math.atan2(L.x,-L.z)*180/Math.PI,dir=dirs[(Math.round(((ang+360)%360)/45))%8];
  toast('radio',L.motivo==='sinal'?'Avião de suprimentos viu o seu sinal! A caixa pousou perto de você. Os mortos viram a luz também.':'A caixa de suprimentos pousou '+dir+' da clareira. Siga a fumaça vermelha, mas vai ter visita.');
  const n=L.motivo==='sinal'?2:3;for(let i=0;i<n;i++){const a=Math.random()*6.28;const x=L.x+Math.cos(a)*(10+Math.random()*6),z=L.z+Math.sin(a)*(10+Math.random()*6);if(pontoLivre(x,z))criarZ(Math.random()<0.8?'walker':'runner',x,z,{st:'alerta',ax:L.x,az:L.z});}
  if(typeof diarioEvento==='function')diarioEvento('Caixa de suprimentos de paraquedas','evento');}
/* sinalizador: dispara para o céu e chama o avião até você */
UTIL_ACOES.sinalizador=(i)=>{const A=aereoD();if(P.y<SUB_FUNDO||interiorEm(P.x,P.y+0.3,P.z)>0.5){feed('Precisa de céu aberto',true);return false;}
  if(A.lancamento||(G.ev&&G.ev.ativo)){feed('Já tem uma caixa a caminho ou esperando no chão',true);return false;}
  gastarUm(i);fecharMochila();sfx('tiro');barulho(P.x,P.z,65,true);for(let k=0;k<26;k++)part(P.x,P.y+2+k*1.6,P.z,(Math.random()-0.5)*0.4,14-k*0.3,(Math.random()-0.5)*0.4,1.6+k*0.06,0.35,[1,0.15,0.08,1],true,6);
  let x=P.x,z=P.z;for(let t=0;t<20;t++){const a=Math.random()*6.283,r=10+Math.random()*10,xx=P.x+Math.cos(a)*r,zz=P.z+Math.sin(a)*r;if(pontoLivre(xx,zz,1.2)){x=xx;z=zz;break;}}
  setTimeout(()=>{if(!aereoD().lancamento)aereoLancar(x,z,'sinal');},20000);feed('Sinal disparado! Ouça: um avião deve passar logo.');if(typeof diarioEvento==='function')diarioEvento('Disparou um sinalizador','evento');ganharXP(5);};
/* ---------- afogados: sobem do fundo atrás de quem nada (e à noite, de quem anda na beira) ---------- */
function afogadoCriar(x,z){const n=RIO.ok?aguaNivel(x,z):null;if(n===null)return null;const q=criarZ(Math.random()<0.75?'walker':'runner',x,z,{y:Math.min(n-1.6,ground(x,z)),st:'caca',viu:0,lx:P.x,lz:P.z});
  if(!q)return null;q.afogado=true;q.tint=[0.66,0.78,0.86];q.hp*=1.15;q.hpMax=q.hp;q.hx=x;q.hz=z;return q;}
PASSOS.push(dt=>{const A=aereoD();A.afogT-=dt;if(A.afogT>0||!RIO.ok||!P.alive||P.y<SUB_FUNDO)return;A.afogT=AEREO.afog.checa;
  // some quem ficou longe da água e de você
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(!z.afogado)continue;if(!z.vivo||Math.hypot(z.x-P.x,z.z-P.z)>70){Z.splice(i,1);}}
  const noite=(E.n||0)>0.5,beira=aguaPerto(P.x,P.z,5),nadando=!!P.nada,cheia=G.mundo&&G.mundo.cheia&&G.mundo.cheia.ativa;
  if(!nadando&&!(noite&&beira))return;const tem=Z.filter(z=>z.afogado&&z.vivo).length;if(tem>=AEREO.afog.max+(cheia?2:0))return;
  if(Math.random()>(nadando?(noite?0.75:0.35):0.45))return;
  for(let k=0;k<30;k++){const a=Math.random()*6.283,r=AEREO.afog.raioMin+Math.random()*(AEREO.afog.raioMax-AEREO.afog.raioMin),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
    if(aguaProf(x,z)<1.3)continue;const q=afogadoCriar(x,z);if(q){part(x,aguaNivel(x,z)+0.05,z,0,1.2,0,0.8,0.3,[0.8,0.88,0.95,0.6],false,4);if(!A.avisou){A.avisou=1;dica('afogados','alerta','Afogados! Zumbis que vivem no fundo da água. Nadando você é presa fácil: volte para a margem.');}
      if(typeof diarioConta==='function')diarioConta('afogados',1);break;}}});
/* ---------- salvar e carregar ---------- */
V8.novo.aereo=()=>{G.aereo=aereoNovo();};
V8.salvar.aereo=()=>{const A=aereoD();return{caixas:A.caixas,docs:A.docs,lancamento:A.lancamento?{x:A.lancamento.x,z:A.lancamento.z,motivo:A.lancamento.motivo}:null};};
V8.carregar.aereo=s=>{G.aereo=Object.assign(aereoNovo(),s&&typeof s==='object'?{caixas:s.caixas||{},docs:s.docs||{}}:{});if(s&&s.lancamento){const L=s.lancamento;aereoPousou({x:L.x,z:L.z,motivo:L.motivo});}};

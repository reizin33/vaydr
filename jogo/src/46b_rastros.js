/* ================= rastros: pegadas, pelos, fezes, galhos quebrados, mato amassado, sinais de comida e de repouso =================
   Os bichos deixam sinais enquanto andam, comem, descansam, fogem e sangram. Nada de marcador mágico: os sinais aparecem no chão
   só de perto (bicho grande deixa sinal mais fácil de ver; coelho quase não deixa), envelhecem com o tempo e a chuva apaga.
   Examinar um sinal (E) diz o que dá para ler dele: tipo de pata, direção aproximada e idade. Quem tem o Guia de rastreamento
   (armário da cabana do pescador) ou a habilidade Leitor de rastros vê de mais longe e lê espécie, idade e tamanho do grupo. */
const RASTROS=[],RASTRO_MAX=320;
/* vida em horas de jogo (a chuva gasta três vezes mais rápido) e quão visível o sinal é */
const RASTRO_TIPOS={pegada:{nome:'Pegadas',vida:10,vis:1},cama:{nome:'Mato amassado de onde um bicho deitou',vida:16,vis:1.4},comida:{nome:'Sinais de comida',vida:20,vis:1.2},
  fezes:{nome:'Fezes',vida:30,vis:1.1},pelo:{nome:'Pelos presos no mato',vida:24,vis:0.8},galho:{nome:'Galhos quebrados e mato pisado',vida:14,vis:1.1},
  sangue:{nome:'Gotas de sangue',vida:6,vis:1.3},fuga:{nome:'Terra revirada de uma corrida',vida:8,vis:1.2}};
const PORTE_RASTRO={pequeno:0.45,medio:1,grande:1.6};
const PATA_TIPO={coelho:'coelho',raposa:'pata',lobo:'pata',onca:'gato',urso:'urso',cervo:'casco',cabra:'casco',ovelha:'casco',vaca:'casco',javali:'casco'};
let rastroT=0,rastroId=0;
function rastroDeixar(b,k){const S=FAUNA[b.tipo];if(!S||b.congelado)return;if(dentroCidade(b.x,b.z,2))return;const ri=roadInfo(b.x,b.z);if(k==='pegada'&&ri.road&&ri.road.cor==='asfalto'&&ri.d<ri.road.w/2)return;
  if(RIO.ok&&aguaNivel(b.x,b.z)!==null)return;
  const push=(kk,dx,dz,yaw)=>{RASTROS.push({id:++rastroId,x:b.x+(dx||0),z:b.z+(dz||0),tipo:b.tipo,k:kk,yaw:yaw??b.yaw,t0:G.tm,idade:0,porte:S.porte,s:b.ch.s,grupo:membros(b).length});if(RASTROS.length>RASTRO_MAX)RASTROS.splice(0,RASTROS.length-RASTRO_MAX);};
  if(k==='pegada'){push('pegada');const r=Math.random();
    if(r<0.05)push('fezes',-Math.sin(b.yaw)*0.4,-Math.cos(b.yaw)*0.4);
    else if(r<0.13&&(S.porte!=='pequeno'||Math.random()<0.3)){let mato=false;for(const q of BUSHES)if(Math.abs(q.x-b.x)<2&&Math.abs(q.z-b.z)<2){mato=true;break;}
      if(mato)push('pelo');else if(S.porte!=='pequeno'&&densidadeMata(b.x,b.z)>=2)push('galho');}
    return;}
  push(k);}
/* envelhece: a chuva gasta mais rápido; some quando passa da vida */
function updateRastros(dt){rastroT-=dt;if(rastroT>0)return;rastroT=2;const F=G.tm;
  for(let i=RASTROS.length-1;i>=0;i--){const r=RASTROS[i],passou=Math.max(0,F-(r.tUlt??r.t0));r.tUlt=F;r.idade+=passou*(1+3*(G.chuva||0));if(r.idade/60>RASTRO_TIPOS[r.k].vida)RASTROS.splice(i,1);}}
PASSOS.push(updateRastros);
function rastroConhece(){return(perk('rastreador')||0)+(G.fab&&G.fab.manuais&&G.fab.manuais.guiaRastros?1:0);}
/* distância de onde dá para ver o sinal: tamanho, idade, luz, perícia e se você está agachado olhando o chão */
function rastroAlcance(r){const T=RASTRO_TIPOS[r.k],noite=E.n||0;let a=7.5*T.vis*PORTE_RASTRO[r.porte]*(r.s||1);a*=1-0.55*clamp(r.idade/60/T.vida,0,1);
  a*=1+0.35*rastroConhece();if((P.agK||0)>0.5)a*=1.25;if(noite>0.4)a*=P.lanterna?0.85:0.35;if(typeof climaVisao==='function')a*=lerp(1,climaVisao(),0.5);return Math.max(1.2,a);}
const DIR8=['norte','nordeste','leste','sudeste','sul','sudoeste','oeste','noroeste'];
function rumoTexto(yaw){const a=Math.atan2(Math.sin(yaw),-Math.cos(yaw));const i=((Math.round(a/(Math.PI/4))%8)+8)%8;return DIR8[i];}
function idadeTexto(min,exato){if(!exato){if(min<90)return'frescos';if(min<360)return'de algumas horas';return'antigos';}
  if(min<20)return'muito frescos (minutos)';if(min<60)return'de menos de 1 hora';if(min<180)return'de umas '+Math.round(min/60)+' horas';return'de mais de '+Math.floor(min/60)+' horas';}
function rastroLeitura(r){const K=rastroConhece(),S=FAUNA[r.tipo],pt=PATA_TIPO[r.tipo],idade=G.tm-r.t0;
  const tamanho=r.porte==='grande'?'grande':r.porte==='medio'?'médio':'pequeno';
  const quem=K>=1?S.nome.toLowerCase():(pt==='casco'?'bicho de casco ':pt==='urso'?'bicho de pata enorme, com garras ':pt==='gato'?'felino ':pt==='coelho'?'bicho pequeno, de salto ':'bicho de pata ')+tamanho;
  let t='';
  if(r.k==='pegada'||r.k==='fuga')t=(r.k==='fuga'?'Marcas de corrida':'Pegadas')+' de '+quem+', '+idadeTexto(idade,K>=1)+', indo para o '+rumoTexto(r.yaw)+'.';
  else if(r.k==='cama')t='Mato amassado: um '+quem+' deitou aqui ('+idadeTexto(idade,K>=1)+').';
  else if(r.k==='comida')t=(r.tipo==='javali'?'Terra fuçada':r.tipo==='urso'||r.tipo==='lobo'||r.tipo==='onca'||r.tipo==='raposa'?'Restos de comida':'Folhas e capim comidos')+': '+quem+' comeu aqui ('+idadeTexto(idade,K>=1)+').';
  else if(r.k==='fezes')t='Fezes de '+quem+', '+idadeTexto(idade,K>=1)+'. Bicho que come por perto volta.';
  else if(r.k==='pelo')t='Pelos de '+quem+' presos no mato.';
  else if(r.k==='galho')t='Galhos quebrados e mato pisado: passou um '+quem+'.';
  else if(r.k==='sangue')t='Sangue de '+quem+' ferido, '+idadeTexto(idade,K>=1)+'.';
  if(K>=2&&r.grupo>1)t+=' Pelas marcas, eram uns '+r.grupo+'.';
  if(K>=2&&(r.k==='pegada'||r.k==='fuga')){let perto=null,bd=1e9;for(const b of BICHOS)if(b.vivo&&b.tipo===r.tipo){const d=Math.hypot(b.x-r.x,b.z-r.z);if(d<bd){bd=d;perto=b;}}
    if(perto)t+=bd<40?' O bicho está perto (menos de 40 m).':bd<90?' Ele não deve estar longe.':'';}
  if(!K)t+=' (Com o Guia de rastreamento ou a habilidade Leitor de rastros dá para ler mais.)';
  return t;}
INTERS.push(tryIt=>{for(const r of RASTROS){if(Math.abs(r.x-P.x)>3||Math.abs(r.z-P.z)>3)continue;if(Math.hypot(r.x-P.x,r.z-P.z)>Math.min(2.6,rastroAlcance(r)))continue;tryIt({k:'rastro',o:r},r.x,r.z,2.2,1.3,-0.8);}});
INTER_K.rastro={texto:r=>({t:'Examinar: '+RASTRO_TIPOS[r.k].nome.toLowerCase(),s:'ler o rastro'}),
  usar:r=>{const t=rastroLeitura(r);toast('corpo',t);sfx('clique');if(!r.lido){r.lido=true;ganharXP(1);if(typeof diarioConta==='function')diarioConta('rastros');if(typeof progresso==='function')progresso('rastro');}
    dica('rastros','corpo','Rastros mostram a direção aproximada, não onde o bicho está. Siga as pegadas mais frescas. Chuva apaga os sinais; à noite só com lanterna e de perto.');}};
/* malhas dos sinais (pequenas, rentes ao chão) */
function rastroMalhas(){const R=rng(808),mk=f=>{const g=new GB(512,8);f(g);return litMesh(g.data());},terra=lin(0x2e241a),esc=lin(0x231b14);
  const M={};
  M.casco=mk(g=>{for(const s of[1,-1])add(g,ellipTris(0.022,0.004,0.042,8,3),mat(s*0.017,0,0,0,0,0),terra,{j:0.08,rnd:R});});
  M.pata=mk(g=>{add(g,ellipTris(0.03,0.004,0.028,8,3),mat(0,0,-0.01),terra,{j:0.08,rnd:R});for(let i=0;i<4;i++){const a=-0.75+i*0.5;add(g,ellipTris(0.011,0.004,0.014,6,3),mat(Math.sin(a)*0.042,0,0.03+Math.cos(a)*0.012),terra,{j:0.08,rnd:R});}});
  M.gato=mk(g=>{add(g,ellipTris(0.04,0.004,0.035,8,3),mat(0,0,-0.012),terra,{j:0.08,rnd:R});for(let i=0;i<4;i++){const a=-0.85+i*0.57;add(g,ellipTris(0.014,0.004,0.016,6,3),mat(Math.sin(a)*0.055,0,0.035+Math.cos(a)*0.01),terra,{j:0.08,rnd:R});}});
  M.urso=mk(g=>{add(g,ellipTris(0.075,0.005,0.06,9,3),mat(0,0,-0.02),esc,{j:0.08,rnd:R});for(let i=0;i<5;i++){const a=-0.9+i*0.45;add(g,ellipTris(0.018,0.005,0.02,6,3),mat(Math.sin(a)*0.09,0,0.06+Math.cos(a)*0.015),esc,{j:0.08,rnd:R});add(g,boxTris(0.006,0.006,0.035),mat(Math.sin(a)*0.11,0,0.1+Math.cos(a)*0.01,0,a*0.3,0),esc);}});
  M.coelho=mk(g=>{for(const s of[1,-1])add(g,ellipTris(0.012,0.003,0.04,6,3),mat(s*0.022,0,0.03),terra,{j:0.08,rnd:R});add(g,ellipTris(0.01,0.003,0.012,6,3),mat(0,0,-0.03),terra,{j:0.08,rnd:R});add(g,ellipTris(0.01,0.003,0.012,6,3),mat(0.004,0,-0.06),terra,{j:0.08,rnd:R});});
  M.cama=mk(g=>{add(g,ellipTris(0.45,0.012,0.7,12,4),ID,lin(0x6e6a3a),{j:0.15,rnd:R});for(let i=0;i<14;i++){const a=R()*6.283,r=R()*0.4;add(g,boxTris(0.012,0.006,0.16),mat(Math.cos(a)*r,0.008,Math.sin(a)*r*1.5,0,R()*6.283,1.4),lin(0x8a8448),{j:0.15,rnd:R});}});
  M.comida=mk(g=>{for(let i=0;i<9;i++){const a=R()*6.283,r=R()*0.25;add(g,boxTris(0.03,0.02+R()*0.03,0.012),mat(Math.cos(a)*r,0.01,Math.sin(a)*r,0,R()*6.283,0),lin(R()<0.5?0x4f6a2a:0x7a6a3a),{j:0.15,rnd:R});}add(g,ellipTris(0.3,0.006,0.3,10,3),ID,lin(0x3a2e20),{j:0.12,rnd:R});});
  M.fezes=mk(g=>{for(let i=0;i<6;i++)add(g,icoTris(0.016+R()*0.008,0.3,R),mat((R()-0.5)*0.08,0.01,(R()-0.5)*0.08),lin(0x2a2116),{j:0.1,rnd:R});});
  M.pelo=mk(g=>{for(let i=0;i<10;i++)add(g,boxTris(0.004,0.06+R()*0.05,0.004),mat((R()-0.5)*0.12,0.3+R()*0.25,(R()-0.5)*0.12,(R()-0.5)*1.2,0,(R()-0.5)*1.2),lin(0xd8d0c0),{j:0.05,rnd:R});});
  M.galho=mk(g=>{add(g,cylTris(0.012,0.014,0.35,5),mat(0,0.02,0,1.4,0.4,0),lin(0x5a4430),{j:0.1,rnd:R});add(g,cylTris(0.01,0.012,0.25,5),mat(0.12,0.02,0.1,1.3,-0.9,0),lin(0x6a5038),{j:0.1,rnd:R});add(g,ellipTris(0.35,0.006,0.5,10,3),ID,lin(0x4a5a2a),{j:0.15,rnd:R});});
  M.sangue=mk(g=>{for(let i=0;i<5;i++)add(g,ellipTris(0.02+R()*0.02,0.003,0.02+R()*0.02,7,3),mat((R()-0.5)*0.25,0,(R()-0.5)*0.25),lin(0x5a0806),{j:0.1,rnd:R});});
  M.fuga=mk(g=>{add(g,ellipTris(0.14,0.006,0.4,9,3),ID,lin(0x3a2c1e),{j:0.12,rnd:R});for(let i=0;i<5;i++)add(g,icoTris(0.02,0.4,R),mat((R()-0.5)*0.2,0.01,-0.3-R()*0.2),lin(0x4a3a28),{j:0.1,rnd:R});});
  MESH.rastro=M;}
INIT_MALHAS.push(rastroMalhas);
const COR_PELO={coelho:[0.7,0.62,0.52],raposa:[1,0.45,0.18],lobo:[0.6,0.58,0.55],urso:[0.35,0.24,0.16],onca:[0.95,0.7,0.3],cervo:[0.62,0.45,0.3],cabra:[0.9,0.88,0.84],ovelha:[1,0.98,0.92],vaca:[0.5,0.5,0.5],javali:[0.25,0.2,0.16]};
DESENHO.opaco.push(Pg=>{const M=MESH.rastro;if(!M||!RASTROS.length)return;let tingiu=false;
  for(const r of RASTROS){const dx=r.x-P.x,dz=r.z-P.z;if(Math.abs(dx)>16||Math.abs(dz)>16)continue;const d=Math.hypot(dx,dz);if(d>rastroAlcance(r))continue;
    let m=r.k==='pegada'?M[PATA_TIPO[r.tipo]||'pata']:M[r.k];if(!m)continue;const sc=r.k==='pegada'?PORTE_RASTRO[r.porte]*0.9*(r.s||1)+0.25:r.k==='cama'?PORTE_RASTRO[r.porte]*(r.s||1):1;
    if(r.k==='pelo'){gl.uniform3fv(Pg.u.uTint,COR_PELO[r.tipo]||[1,1,1]);tingiu=true;}else if(tingiu){gl.uniform3f(Pg.u.uTint,1,1,1);tingiu=false;}
    const y=ground(r.x,r.z)+0.012;drawStat(Pg,m,mat(r.x,y,r.z,0,r.yaw,0,sc,1,sc));}
  if(tingiu)gl.uniform3f(Pg.u.uTint,1,1,1);});
/* manual e habilidade */
MANUAIS.guiaRastros={nome:'Guia de rastreamento',local:'cabana-bau',onde:'no armário da cabana do pescador',ensina:'a ler espécie e idade nos rastros (e a ver os sinais de mais longe)'};
/* quando um grupo aparece, ele já vem com um rastro de onde veio (dá para seguir de trás para a frente) */
function rastroChegada(b){const S=FAUNA[b.tipo];if(!S)return;const n=Math.round(8/PORTE_RASTRO[S.porte]);for(let i=1;i<=n;i++){const d=i*S.rastroM;const r={x:b.x-Math.sin(b.yaw)*d,z:b.z-Math.cos(b.yaw)*d};
    if(RIO.ok&&aguaNivel(r.x,r.z)!==null)break;RASTROS.push({id:++rastroId,x:r.x,z:r.z,tipo:b.tipo,k:'pegada',yaw:b.yaw,t0:G.tm-i*12,idade:i*12,porte:S.porte,s:b.ch.s,grupo:1});}
  if(RASTROS.length>RASTRO_MAX)RASTROS.splice(0,RASTROS.length-RASTRO_MAX);}
V8.novo.rastros=()=>{RASTROS.length=0;};
V8.salvar.rastros=()=>RASTROS.slice(-120).map(r=>[r.tipo,r.k,+r.x.toFixed(2),+r.z.toFixed(2),+r.yaw.toFixed(2),Math.round(r.t0),Math.round(r.idade),r.porte,+(r.s||1).toFixed(2),r.grupo||1]);
V8.carregar.rastros=s=>{RASTROS.length=0;if(Array.isArray(s))for(const a of s){if(!FAUNA[a[0]]||!RASTRO_TIPOS[a[1]])continue;RASTROS.push({id:++rastroId,tipo:a[0],k:a[1],x:a[2],z:a[3],yaw:a[4],t0:a[5],idade:a[6],porte:a[7],s:a[8],grupo:a[9],tUlt:G.tm});}};

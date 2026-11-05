/* ================= Etapa 14: fauna e domesticação · aves e o gavião =================
   Aves no ambiente (além dos bandos que rodam alto no céu): bandos de pardais e rolinhas ciscando no chão, bem-te-vis, casais
   de quero-quero no campo aberto (gritam e dão rasantes em quem chega perto, e o grito chama atenção dos zumbis), garças na
   beira da água, urubus rodando em cima de carcaças (descem para comer quando você se afasta) e gaviões planando nos campos.
   Todas fogem de você (agachado e devagar dá para chegar mais perto), de zumbi, de tiro, de carro e de cavalo a galope;
   a revoada faz barulho. De noite só o quero-quero fica acordado. O diário anota cada espécie vista.
   GAVIÃO: faça a luva de falcoaria (estação de couro; libera quando você vê um gavião de perto). Com a luva na mão e carne
   crua ou peixe cru na mochila, num lugar com gavião planando por perto, segure E: ele desce, pousa na luva e come.
   Três vezes e ele é seu (nome: Carijó). Com a luva na mão, ele pousa nela; sem a luva, voa em círculos em cima de você.
   Poleiro (B → Animais): segure E perto dele para o painel: dar comida, treinar (gasta carne; 1 vez por hora de jogo),
   deixar vigiando a base ou levar com você, soltar. Níveis: 1 vigia (grita e avisa quando zumbi se aproxima: de você, ou
   da base se estiver no poleiro); 2 marca zumbis e caça no minimapa, mesmo fora do alcance (setas na borda); 3 ataca o zumbi
   que chega perto (atordoa e machuca um pouco) e ajuda a proteger a base.
   Ele come todo dia (carne crua ou peixe cru); com fome vigia pior, e passando fome por meio dia vai embora. */

/* ---------- espécies ---------- */
const AVE_SP={
  pardal:{nome:'Pardal',esc:1,grupo:[4,8],foge:6,voo:9,bate:24,hab:'aberto',corpo:[0.034,0.033,0.06],perna:0.028,cab:0.025,bico:[0.018,0.008],cauda:[0.035,0.055,0.25],asa:[0.105,0.05],
    cor:{corpo:0x8a6a48,barriga:0xd8cbb0,asa:0x5e4630,cabeca:0x7a6a5c,bico:0x3a3028,perna:0x9a7a5a,cauda:0x5a4430,marca:0x2a2420}},
  rolinha:{nome:'Rolinha',esc:1.25,grupo:[2,3],foge:7,voo:9,bate:20,hab:'aberto',corpo:[0.032,0.032,0.065],perna:0.022,cab:0.022,bico:[0.014,0.005],cauda:[0.03,0.07,0.15],asa:[0.1,0.045],
    cor:{corpo:0xb08a72,barriga:0xc8a490,asa:0x9a7660,cabeca:0x9a8a84,bico:0x3a3230,perna:0xc07070,cauda:0x7a5a48}},
  bemtevi:{nome:'Bem-te-vi',esc:1.3,grupo:[1,2],foge:8,voo:10,bate:22,hab:'beira',pousa:true,corpo:[0.034,0.035,0.065],perna:0.025,cab:0.029,bico:[0.026,0.008],cauda:[0.035,0.06,0.2],asa:[0.11,0.05],
    cor:{corpo:0x6a5a3a,barriga:0xf2d23a,asa:0x5a4a30,cabeca:0x1a1816,bico:0x1a1816,perna:0x2a2420,cauda:0x5a4a30,marca:0xf4f2ea}},
  queroquero:{nome:'Quero-quero',esc:2.0,grupo:[2,2],foge:15,voo:8,bate:12,hab:'campo',noite:true,grita:true,corpo:[0.03,0.032,0.065],perna:0.05,pesc:0.012,cab:0.024,bico:[0.022,0.006],cauda:[0.03,0.04,0.1],asa:[0.12,0.05],
    cor:{corpo:0x8e8a80,barriga:0xf2f0ea,asa:0x6e6a62,cabeca:0x8a8880,bico:0xb84040,perna:0xc05050,cauda:0x1a1816,marca:0x111111}},
  garca:{nome:'Garça-branca',esc:3.8,grupo:[1,2],foge:13,voo:7,bate:7,hab:'agua',corpo:[0.028,0.03,0.07],perna:0.085,pesc:0.075,cab:0.018,bico:[0.04,0.006],cauda:[0.025,0.03,0],asa:[0.14,0.055],
    cor:{corpo:0xf4f4f0,barriga:0xeeeeea,asa:0xf2f2ee,cabeca:0xf6f6f2,bico:0xe8c030,perna:0x1a1a18,cauda:0xf0f0ec}},
  urubu:{nome:'Urubu',esc:4.4,grupo:[2,4],foge:9,voo:8,bate:7,hab:'carcaca',plana:true,corpo:[0.034,0.033,0.07],perna:0.025,pesc:0.008,cab:0.018,bico:[0.016,0.007],cauda:[0.035,0.035,0],asa:[0.15,0.055],dedos:true,
    cor:{corpo:0x1a1816,barriga:0x161412,asa:0x1e1c1a,cabeca:0x4a4644,bico:0x8a8478,perna:0xb8b0a4,cauda:0x161412,ponta:0x8a847a}},
  gaviao:{nome:'Gavião-carijó',esc:2.9,grupo:[1,1],foge:14,voo:12,bate:10,hab:'campo',plana:true,corpo:[0.032,0.034,0.066],perna:0.03,cab:0.026,bico:[0.014,0.009],gancho:true,cauda:[0.04,0.07,0.05],asa:[0.13,0.055],dedos:true,
    cor:{corpo:0x7a6a5a,barriga:0xd8c8b0,asa:0x6a5a48,cabeca:0x6e6458,bico:0x2a2420,perna:0xe0b030,cauda:0x5a4a3a,marca:0x8a6a4a,ponta:0x3a3028}}};
const AVES=[];let aveGrupoId=0,aveSpawnT=2,aveVistaT=0;

/* ---------- malhas: pousada (asas fechadas, pernas) e em voo (corpo + duas asas que batem na junta do ombro) ---------- */
function aveForma(sp){const S=AVE_SP[sp],[rx,ry,rz]=S.corpo,yb=S.perna+ry*0.8,pesc=S.pesc||0,hy=yb+ry*0.75+pesc,hz=rz*0.85+(pesc?pesc*0.25:0);return{S,rx,ry,rz,yb,hy,hz,pesc};}
function aveCorpoGeo(g,sp,pousada,R){const{S,rx,ry,rz,yb,hy,hz,pesc}=aveForma(sp),C=S.cor,cb=S.cab,o={j:0.04,rnd:R},c=x=>lin(x);
  add(g,ellipTris(rx,ry,rz,10,7),mat(0,yb,0),c(C.corpo),o);add(g,ellipTris(rx*0.92,ry*0.82,rz*0.86,10,6),mat(0,yb-ry*0.2,rz*0.06),c(C.barriga),o);
  if(pesc)add(g,cylTris(cb*0.55,rx*0.55,pesc+ry*0.4,7),mat(0,yb+ry*0.35,rz*0.72,0.25,0,0),c(C.corpo),o);
  add(g,ellipTris(cb,cb*0.95,cb*1.12,9,7),mat(0,hy,hz),c(C.cabeca),o);
  add(g,cylTris(0,S.bico[1],S.bico[0],6),mat(0,hy-cb*0.12,hz+cb*0.95,Math.PI/2+(S.gancho?0.45:0.05),0,0),c(C.bico),o);
  if(S.gancho)add(g,ellipTris(S.bico[1]*1.1,S.bico[1]*0.8,S.bico[1]*1.0,6,4),mat(0,hy-cb*0.05,hz+cb*0.95),lin(0xe0b030),o);
  for(const s of[1,-1])add(g,ellipTris(cb*0.16,cb*0.16,cb*0.12,6,4),mat(s*cb*0.78,hy+cb*0.22,hz+cb*0.42),lin(0x0a0808),{j:0,rnd:R});
  add(g,boxTris(S.cauda[0],0.006,S.cauda[1],{tx:0.8,bx:1.15}),mat(0,yb+ry*0.12,-rz-S.cauda[1]*0.38,-(S.cauda[2]||0),0,0),c(C.cauda),o);
  // marcas da espécie
  if(sp==='pardal')add(g,ellipTris(rx*0.45,ry*0.35,0.012,8,5),mat(0,yb+ry*0.3,rz*0.84),c(C.marca),o);
  if(sp==='bemtevi')add(g,ellipTris(cb*1.04,cb*0.18,cb*0.95,9,4),mat(0,hy+cb*0.1,hz-cb*0.05),c(C.marca),o);
  if(sp==='queroquero'){add(g,ellipTris(rx*0.9,ry*0.32,0.02,9,5),mat(0,yb+ry*0.35,rz*0.8),c(C.marca),o);add(g,boxTris(0.004,0.004,0.035),mat(0,hy+cb*0.75,hz-cb*0.9,-0.4,0,0),c(C.marca),o);}
  if(sp==='gaviao'){for(let i=0;i<3;i++)add(g,ellipTris(rx*0.93,0.004,rz*0.55,9,3),mat(0,yb-ry*0.25-i*ry*0.18,rz*0.1),c(C.marca),o);
    for(let i=0;i<3;i++)add(g,boxTris(S.cauda[0]*1.02,0.008,0.008),mat(0,yb+ry*0.12+0.001,-rz-S.cauda[1]*(0.1+i*0.25)),c(C.ponta),o);}
  if(pousada){for(const s of[1,-1]){add(g,ellipTris(rx*0.36,ry*0.62,rz*0.98,8,6),mat(s*rx*0.82,yb+ry*0.08,-rz*0.12,0.1,0,0),c(C.asa),o);
      add(g,cylTris(0.0035,0.0035,S.perna+ry*0.2,4),mat(s*rx*0.32,0,rz*0.05),c(C.perna),o);add(g,boxTris(0.012,0.003,0.022),mat(s*rx*0.32,0.0015,rz*0.1),c(C.perna),o);}}}
function aveAsaGeo(g,sp,lado,R){const S=AVE_SP[sp],C=S.cor,[sp_,ch]=S.asa,o={j:0.03,rnd:R},c=x=>lin(x),L=lado;
  const seg=[[0,0.42,1],[0.42,0.78,0.86],[0.78,1,0.6]];
  for(const[a,b,k]of seg)add(g,boxTris(sp_*(b-a),0.005,ch*k,{tx:1}),mat(L*sp_*(a+b)/2,0,-ch*k*0.18),c(b===1&&C.ponta?C.ponta:C.asa),o);
  if(S.dedos)for(let i=0;i<4;i++)add(g,boxTris(sp_*0.2,0.004,ch*0.13),mat(L*sp_*1.06,0,-ch*0.05-i*ch*0.13,0,L*(i-1.5)*0.12,0),c(C.ponta||C.asa),o);}
INIT_MALHAS.push(function aveMalhas(){MESH.ave={};const R=rng(1616),mk=f=>{const g=new GB(1024,8);f(g);return litMesh(g.data());};
  for(const sp in AVE_SP)MESH.ave[sp]={pousada:mk(g=>aveCorpoGeo(g,sp,true,R)),corpo:mk(g=>aveCorpoGeo(g,sp,false,R)),asaD:mk(g=>aveAsaGeo(g,sp,1,R)),asaE:mk(g=>aveAsaGeo(g,sp,-1,R))};});

/* ---------- sons ---------- */
SONS.revoada=({noise})=>{for(let i=0;i<6;i++)noise(0.05,'bandpass',1100+Math.random()*900,700,1.2,0.16,i*0.045);};
SONS.aveCanto=({voz,tone,noise,r,extra})=>{switch(extra){
  case'queroquero':for(let i=0;i<2;i++){voz(0.1,2400*r(),2100,2600,3600,0.2,i*0.32,0.35);voz(0.14,2650*r(),2200,2600,3600,0.2,i*0.32+0.12,0.35);}break;
  case'bemtevi':voz(0.09,1800*r(),2200,2400,3500,0.12,0,0.1);voz(0.09,2600*r(),2400,2400,3500,0.14,0.14,0.1);voz(0.22,2200*r(),2900,2400,3500,0.14,0.32,0.12);break;
  case'gaviao':voz(0.65,3300*r(),2300,2800,4200,0.17,0,0.25);noise(0.4,'highpass',3200,3000,0.6,0.06);break;
  case'garca':voz(0.3,300*r(),220,600,1400,0.18,0,0.5);break;
  case'rolinha':tone(0.25,'sine',560*r(),520,0.08);tone(0.3,'sine',520*r(),480,0.07,0.32);break;
  case'urubu':noise(0.3,'lowpass',500,300,0.7,0.1);break;
  default:for(let i=0;i<3+Math.floor(Math.random()*3);i++)tone(0.05,'sine',3400*r()+i*120,3000*r(),0.06,i*0.09);}};

/* ---------- onde cada uma aparece ---------- */
function aveChaoOk(x,z){return dentroMapa(x,z,4)&&!pointBlocked(x,z,0.4)&&!(RIO.ok&&aguaPerto(x,z,0.5))&&!salaEm(x,ground(x,z)+0.4,z);}
function avePontoPara(sp){const S=AVE_SP[sp];for(let k=0;k<12;k++){const a=Math.random()*6.283,d=24+Math.random()*28,x=P.x+Math.sin(a)*d,z=P.z+Math.cos(a)*d;
    if(S.hab==='agua'){if(!RIO.ok||!aguaPerto(x,z,2.2)||aguaProf(x,z)>0.22||!dentroMapa(x,z,4)||pointBlocked(x,z,0.4))continue;return[x,z];}
    if(!aveChaoOk(x,z))continue;const dm=densidadeMata(x,z);if(S.hab==='campo'&&(dm>0||dentroCidade(x,z,-4)))continue;if(dm>3)continue;return[x,z];}return null;}
function aveSorteia(){const noite=(E.n||0)>0.6,cid=dentroCidade(P.x,P.z,10),L=[];
  const tem=sp=>AVES.some(b=>b.sp===sp&&Math.hypot(b.x-P.x,b.z-P.z)<90);
  if(!noite){L.push(['pardal',3],['rolinha',2]);if(!cid){L.push(['bemtevi',1.2]);if(!tem('garca')&&RIO.ok&&aguaPerto(P.x,P.z,45))L.push(['garca',3]);}}
  if(!cid&&!tem('queroquero')&&densidadeMata(P.x,P.z)<=1)L.push(['queroquero',noite?1:2.2]);
  if(!L.length)return null;let t=L.reduce((s,q)=>s+q[1],0)*Math.random();for(const[sp,w]of L){t-=w;if(t<=0)return sp;}return L[0][0];}
function criarAve(sp,x,z,o){const S=AVE_SP[sp];o=o||{};const s=S.esc*(0.92+Math.random()*0.16);
  const b={sp,x,z,y:o.y??ground(x,z),yaw:Math.random()*6.283,pitch:0,roll:0,v:0,vy:0,st:o.st||'chao',t:1+Math.random()*3,g:o.g||++aveGrupoId,s,fase:Math.random()*6,bate:0,canto:4+Math.random()*10,
    cx:o.cx??x,cz:o.cz??z,ch:o.ch??0,raio:o.raio??10,dir:Math.random()<0.5?1:-1,ang:Math.random()*6.283,alvo:null,bica:0,pouso:o.pouso||null};
  AVES.push(b);return b;}
function aveSpawn(){if(G.modo!=='jogo'||P.y<-20||!P.alive)return;const noite=(E.n||0)>0.6;
  // pequenas e médias no chão
  let grupos=new Set(AVES.filter(b=>!AVE_SP[b.sp].plana&&Math.hypot(b.x-P.x,b.z-P.z)<70).map(b=>b.g)).size;
  const maxG=G.chuva>0.6?1:noite?1:4;
  if(grupos<maxG&&AVES.length<36&&Math.random()<0.7){const sp=aveSorteia();if(sp){const pt=avePontoPara(sp);if(pt){const S=AVE_SP[sp],n=randi(Math.random,S.grupo[0],S.grupo[1]),g=++aveGrupoId;
      let pouso=null;if(S.pousa){let bd=30*30;for(const o of OB){if(!['posteAmarrar','poleiro','cocho','cerca','estacas'].includes(o.tipo)||o.hp<=0)continue;const d=d2(o.x,o.z,pt[0],pt[1]);if(d<bd){bd=d;pouso=o;}}}
      for(let i=0;i<n;i++){const a=Math.random()*6.283,r=i?0.4+Math.random()*1.6:0,x=pt[0]+Math.cos(a)*r,z=pt[1]+Math.sin(a)*r;
        if(pouso&&i===0){criarAve(sp,pouso.x,pouso.z,{g,st:'pousado',y:pouso.y+avePousoAlt(pouso),pouso});continue;}criarAve(sp,x,z,{g});}}}}
  // urubus em cima de carcaça (até 2 carcaças), e às vezes rodando alto no campo
  if(!noite){let nc=0;for(const c of BICHOS){if(c.vivo||!c.carc||c.carc.vazia||Math.hypot(c.x-P.x,c.z-P.z)>140)continue;if(++nc>2)break;
      if(!AVES.some(b=>b.sp==='urubu'&&b.carc===c)){const n=2+Math.floor(Math.random()*3),g=++aveGrupoId;
        for(let i=0;i<n;i++){const u=criarAve('urubu',c.x,c.z,{g,st:'plana',cx:c.x,cz:c.z,ch:chaoBicho(c.x,c.z)+18+Math.random()*10,raio:7+Math.random()*7});u.carc=c;u.y=u.ch;u.ang=Math.random()*6.283;}}}
    // gavião selvagem planando no campo (o alvo de quem quer um gavião)
    if(!(typeof GAV!=='undefined'&&GAV.domado)&&!AVES.some(b=>b.sp==='gaviao')&&densidadeMata(P.x,P.z)<=2&&!dentroCidade(P.x,P.z,8)&&Math.random()<0.5){
      const a=Math.random()*6.283,d=25+Math.random()*25,x=P.x+Math.sin(a)*d,z=P.z+Math.cos(a)*d;if(dentroMapa(x,z,10)){const w=criarAve('gaviao',x,z,{st:'plana',cx:x,cz:z,ch:ground(x,z)+22+Math.random()*8,raio:12+Math.random()*8});w.y=w.ch;}}
    if(!AVES.some(b=>b.sp==='urubu'&&!b.carc)&&Math.random()<0.15&&!dentroCidade(P.x,P.z,8)){const g=++aveGrupoId,a=Math.random()*6.283,x=P.x+Math.sin(a)*40,z=P.z+Math.cos(a)*40;
      for(let i=0;i<2;i++){const u=criarAve('urubu',x,z,{g,st:'plana',cx:x,cz:z,ch:ground(x,z)+30+i*4,raio:15+i*5});u.y=u.ch;}}}}
function avePousoAlt(o){return o.tipo==='posteAmarrar'?1.29:o.tipo==='poleiro'?2.34:o.tipo==='cocho'?0.86:o.tipo==='estacas'?1.0:1.15;}

/* ---------- comportamento ---------- */
function aveAmeaca(b){const S=AVE_SP[b.sp],d=Math.hypot(P.x-b.x,P.z-b.z);
  if(P.alive&&P.y>-20){let r=S.foge;if(P.montado)r*=P.montado.v>7?1.8:1.3;else if(P.correndo)r*=1.6;else if((P.agK||0)>0.5&&Math.hypot(P.vx,P.vz)<2.2)r*=0.55;
    if(d<r&&!(b.sp==='gaviao'&&typeof GAV!=='undefined'&&GAV.chamando===b))return{x:P.x,z:P.z};}
  for(const z of Z)if(z.vivo&&Math.abs(z.x-b.x)<5&&Math.abs(z.z-b.z)<5&&Math.hypot(z.x-b.x,z.z-b.z)<4.5)return{x:z.x,z:z.z};
  if(CARRO.ativo&&Math.abs(CARRO.v)>2&&Math.hypot(CARRO.x-b.x,CARRO.z-b.z)<16)return{x:CARRO.x,z:CARRO.z};
  for(const nz of NOISE)if(nz.r>16&&Math.hypot(nz.x-b.x,nz.z-b.z)<nz.r*0.8)return{x:nz.x,z:nz.z};
  if(typeof CAO!=='undefined'&&CAO.ativo&&CAO.ch&&Math.hypot(CAO.x-b.x,CAO.z-b.z)<4)return{x:CAO.x,z:CAO.z};
  return null;}
function aveFoge(b,de){const S=AVE_SP[b.sp];for(const o of AVES){if(o.g!==b.g||o.st==='foge'||o.st==='some')continue;
    if(S.grita&&o.st!=='alarme'){o.st='alarme';o.t=6+Math.random()*2;o.cx=de.x;o.cz=de.z;o.ch=ground(de.x,de.z)+5+Math.random()*2;o.raio=5+Math.random()*2;o.gritoT=0;continue;}
    const dx=o.x-de.x,dz=o.z-de.z,l=Math.hypot(dx,dz)||1;o.st='foge';o.t=0.6+Math.random()*0.4;o.yaw=Math.atan2(dx,dz)+(Math.random()-0.5)*0.8;o.vy=S.plana?2:3.5+Math.random()*1.5;o.v=S.voo*0.6;
    const ld=30+Math.random()*30,lx=o.x+dx/l*ld+(Math.random()-0.5)*14,lz=o.z+dz/l*ld+(Math.random()-0.5)*14;o.alvo=AVE_SP[o.sp].plana||!aveChaoOk(lx,lz)||Math.random()<0.4?{x:lx,z:lz,some:true}:{x:lx,z:lz};}
  if(Math.hypot(b.x-P.x,b.z-P.z)<45){sfx('revoada',b.x,b.z,S.esc>2?0.8:0.6);if(!S.grita)barulho(b.x,b.z,S.esc>2?6:4);}}
function aveVoaPara(b,tx,ty,tz,dt,vel,vy){vy=vy||4;const dx=tx-b.x,dz=tz-b.z,dh=Math.hypot(dx,dz),ya=Math.atan2(dx,dz),dyaw=angDiff(b.yaw,ya);b.yaw+=clamp(dyaw,-3*dt,3*dt);b.roll=lerp(b.roll,clamp(-dyaw*0.8,-0.7,0.7),1-Math.exp(-dt*4));
  b.v=approach(b.v,Math.min(vel,dh*1.5+1),dt*8);b.x+=Math.sin(b.yaw)*b.v*dt;b.z+=Math.cos(b.yaw)*b.v*dt;b.vy=lerp(b.vy,clamp((ty-b.y)*1.2,-vy,vy),1-Math.exp(-dt*3));b.y+=b.vy*dt;b.pitch=clamp(-b.vy*0.08,-0.4,0.4);return Math.hypot(dh,ty-b.y);}
function avePasso(b,dt){const S=AVE_SP[b.sp];b.t-=dt;b.canto-=dt;b.fase+=dt*S.bate*(b.bate>0.3?1:0.25);
  if(b.st==='chao'||b.st==='pousado'){b.v=0;b.vy=0;b.roll=0;b.bate=0;
    if(b.st==='chao'){const gy=b.sp==='garca'&&RIO.ok&&aguaNivel(b.x,b.z)!==null?Math.max(ground(b.x,b.z),aguaNivel(b.x,b.z)-0.18):ground(b.x,b.z);
      b.hop=Math.max(0,(b.hop||0)-dt);b.y=gy+Math.sin(Math.min(1,b.hop/0.22)*Math.PI)*0.05*b.s;
      if(b.t<=0){b.t=b.sp==='garca'?3+Math.random()*6:0.6+Math.random()*2;const a=Math.random()*6.283,dd=b.sp==='garca'?0.3:0.12+Math.random()*0.25;
        if(Math.random()<0.55){const nx=b.x+Math.sin(a)*dd*b.s,nz=b.z+Math.cos(a)*dd*b.s;if(b.sp==='garca'||aveChaoOk(nx,nz)){b.x=nx;b.z=nz;b.yaw=a;b.hop=b.sp==='garca'?0:0.22;}}else b.bica=0.35;}
      b.bica=Math.max(0,b.bica-dt);b.pitch=b.bica>0?Math.sin(b.bica/0.35*Math.PI)*0.6:0;}
    else{if(b.pouso&&(b.pouso.hp<=0||!OB.includes(b.pouso))){aveFoge(b,{x:b.x+0.1,z:b.z});return;}if(b.t<=0){b.t=2+Math.random()*4;b.yaw+=(Math.random()-0.5)*1.5;}}
    // urubu no chão perto da carcaça: some quando a carcaça acaba
    if(b.sp==='urubu'&&b.carc&&(b.carc.carc&&b.carc.carc.vazia||!BICHOS.includes(b.carc))){aveFoge(b,{x:b.x+0.1,z:b.z+0.1});return;}
    b.ameT=(b.ameT||0)-dt;if(b.ameT<=0){b.ameT=0.15;const am=aveAmeaca(b);if(am){aveFoge(b,am);return;}}
    if(b.canto<=0){b.canto=(S.grita?14:7)+Math.random()*12;if(Math.hypot(b.x-P.x,b.z-P.z)<38&&!(E.n>0.6&&!S.noite))sfx(b.sp==='pardal'?'passaro':'aveCanto',b.x,b.z,0.45,b.sp);}
    return;}
  if(b.st==='alarme'){// quero-quero: rasantes gritando em volta de quem chegou perto
    b.bate=1;b.ang+=dt*b.dir*(S.voo/b.raio);const tx=b.cx+Math.sin(b.ang)*b.raio,tz=b.cz+Math.cos(b.ang)*b.raio;aveVoaPara(b,tx,b.ch+Math.sin(b.ang*2)*1.2,tz,dt,S.voo);
    b.gritoT-=dt;if(b.gritoT<=0){b.gritoT=1.3+Math.random()*0.8;sfx('aveCanto',b.x,b.z,0.85,'queroquero');barulho(b.x,b.z,10);}
    if(b.t<=0){const am=Math.hypot(P.x-b.cx,P.z-b.cz)<S.foge*0.8;if(am){b.t=4;b.cx=P.x;b.cz=P.z;}else{b.st='voa';b.alvo={x:b.cx+(Math.random()-0.5)*20,z:b.cz+(Math.random()-0.5)*20};if(!aveChaoOk(b.alvo.x,b.alvo.z))b.alvo.some=true;}}
    return;}
  if(b.st==='plana'){// círculos (urubu e gavião), batendo asa de vez em quando
    b.ang+=dt*b.dir*(S.voo*0.7/b.raio);const tx=b.cx+Math.sin(b.ang)*b.raio,tz=b.cz+Math.cos(b.ang)*b.raio;b.bate=Math.sin(G.t*0.4+b.g)>0.85?1:0;aveVoaPara(b,tx,b.ch+Math.sin(b.ang*0.5)*1.5,tz,dt,S.voo*0.7);
    b.roll=b.dir*-0.35;if(b.canto<=0){b.canto=10+Math.random()*16;if(b.sp==='gaviao'&&Math.hypot(b.x-P.x,b.z-P.z)<70)sfx('aveCanto',b.x,b.z,0.5,'gaviao');}
    // urubu desce para a carcaça quando ninguém está perto
    if(b.sp==='urubu'&&b.carc&&b.t<=0){b.t=4+Math.random()*4;const c=b.carc;if(!BICHOS.includes(c)||!c.carc||c.carc.vazia){b.st='voa';b.alvo={x:b.x+30,z:b.z,some:true};}
      else if(Math.hypot(P.x-c.x,P.z-c.z)>22&&G.tm-c.carc.t0>60&&Math.random()<0.5){const a=Math.random()*6.283,r=1.4+Math.random()*1.2;b.st='voa';b.alvo={x:c.x+Math.cos(a)*r,z:c.z+Math.sin(a)*r};}}
    if(b.sp==='gaviao'&&typeof gavSelvagemPasso==='function')gavSelvagemPasso(b,dt);
    return;}
  if(b.st==='foge'){b.bate=1;b.y+=b.vy*dt;b.vy=Math.max(0.8,b.vy-dt*2);b.v=approach(b.v,S.voo,dt*8);b.x+=Math.sin(b.yaw)*b.v*dt;b.z+=Math.cos(b.yaw)*b.v*dt;b.pitch=-0.35;
    if(b.t<=0)b.st='voa';return;}
  if(b.st==='voa'){b.bate=1;const a=b.alvo;if(!a){b.st='some';return;}const ty=a.some?ground(b.x,b.z)+(S.plana?30:14):(a.y??ground(a.x,a.z));
    const d=aveVoaPara(b,a.x,a.some?ty:ty+Math.min(6,Math.hypot(a.x-b.x,a.z-b.z)*0.3),a.z,dt,S.voo);
    if(a.some){if(Math.hypot(b.x-P.x,b.z-P.z)>75||Math.hypot(a.x-b.x,a.z-b.z)<2)b.st='some';return;}
    if(Math.hypot(a.x-b.x,a.z-b.z)<0.5&&Math.abs(b.y-ty)<0.6){b.st='chao';b.y=ty;b.t=1+Math.random()*2;b.pitch=0;b.roll=0;}return;}}
function updateAves(dt){if(!MESH.ave)return;aveSpawnT-=dt;if(aveSpawnT<=0){aveSpawnT=2.5;aveSpawn();}
  const noite=(E.n||0)>0.6;
  for(let i=AVES.length-1;i>=0;i--){const b=AVES[i],d=Math.hypot(b.x-P.x,b.z-P.z);
    if(b.st==='some'||d>(AVE_SP[b.sp].plana?150:95)||(noite&&!AVE_SP[b.sp].noite&&!AVE_SP[b.sp].plana&&d>30&&b.st==='chao')){AVES.splice(i,1);continue;}avePasso(b,dt);}
  aveVistaT-=dt;if(aveVistaT<=0&&typeof diarioDescobre==='function'){aveVistaT=1.5;for(const b of AVES){const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<(AVE_SP[b.sp].plana?45:24))diarioDescobre('ave',b.sp,AVE_SP[b.sp].nome,1);}}}
PASSOS.push(function avesPasso(dt){if(G.modo!=='jogo')return;updateAves(dt);});

/* ---------- desenho ---------- */
function aveDesenhar(Pg,b,M){const m=MESH.ave[b.sp];if(!m)return;const pousada=b.st==='chao'||b.st==='pousado'||b.st==='luva'||b.st==='poleiro';
  if(pousada){drawStat(Pg,m.pousada,M);return;}drawStat(Pg,m.corpo,M);const{rx,ry,rz,yb}=aveForma(b.sp),ab=b.bate>0.3?Math.sin(b.fase)*0.95:0.12;
  drawStat(Pg,m.asaD,mm(M,mat(rx*0.7,yb+ry*0.35,rz*0.15,0,0,ab)));drawStat(Pg,m.asaE,mm(M,mat(-rx*0.7,yb+ry*0.35,rz*0.15,0,0,-ab)));}
DESENHO.opaco.push(function avesDesenho(Pg){if(!MESH.ave||P.y<-20)return;const cx=cam.pos[0],cz=cam.pos[2];
  for(const b of AVES){const d=d2(b.x,b.z,cx,cz);if(d>(AVE_SP[b.sp].plana?150*150:70*70))continue;aveDesenhar(Pg,b,mat(b.x,b.y,b.z,b.pitch,b.yaw,b.roll,b.s,b.s,b.s));}
  if(typeof gavDesenho==='function')gavDesenho(Pg);});

/* ---------- diário: aves vistas e peixes pescados entram nas descobertas ---------- */
const DIARIO_EXTRA=[['ave','Aves vistas','i-gaviao'],['peixe','Peixes pescados','i-peixe']];
{const _dr=diarioRender;diarioRender=function(){_dr.apply(this,arguments);if(diarioAba!=='desc')return;const D=diarioD(),el=$('dr-lista');if(!el)return;let h='';
  for(const[t,n,ic]of DIARIO_EXTRA){const L=Object.entries(D.desc).filter(([k,v])=>v.tipo===t);if(!L.length)continue;h+='<li class="dr-grupo">'+n+' ('+L.length+')</li>';
    for(const[k,v]of L){let s=quandoTxt(v.tm);const id=k.split(':')[1];if(t==='peixe'&&typeof peixeRecorde==='function')s+=peixeRecorde(id);if(t==='ave'&&AVE_SP[id])s+=' · '+aveHabTxt(id);
      h+='<li class="ok">'+svgUse(ic)+'<span><b>'+v.nome+'</b><small>'+s+'</small></span></li>';}}
  if(h)el.insertAdjacentHTML('beforeend',h);};}
function aveHabTxt(sp){return{aberto:'campo e clareira',beira:'beira de mata e cercas',campo:'campo aberto',agua:'beira de rio e lago',carcaca:'em cima de carcaça'}[AVE_SP[sp].hab]||'';}
iconesNovos({'i-gaviao':'<path d="M2 9c3-.6 5.6.2 7.5 2.2L12 9l2.5 2.2C16.4 9.2 19 8.4 22 9c-2.4 1.2-4.4 3-5.6 5.2L14 13.5l-.8 3.5h-2.4l-.8-3.5-2.4.7C6.4 12 4.4 10.2 2 9z"/>',
  'i-luva-falcao':'<path d="M7 21v-6l-1.5-5.5a1.4 1.4 0 0 1 2.7-.7L9.5 12V5.5a1.4 1.4 0 0 1 2.8 0V11V4.2a1.4 1.4 0 0 1 2.8 0V11V6a1.4 1.4 0 0 1 2.8 0v8c0 3-1.6 5-3.6 7z"/><path d="M7 18h8.5"/>',
  'i-poleiro':'<path d="M12 21V6M8 21h8M6 6h12"/><path d="M10 6c0-1.5 1-2.6 2-3 1 .4 2 1.5 2 3"/>'});

/* ================= GAVIÃO ================= */
Object.assign(ITEMS,{luvaFalcoaria:{nome:'Luva de falcoaria',icon:'i-luva-falcao',max:1,tipo:'util',mao:true,
  desc:'Luva grossa de couro até o cotovelo. Na mão, com carne crua ou peixe cru na mochila e um gavião planando por perto, segure E: ele desce e come na luva. Com o gavião domado, ele pousa nela.'}});
RECIPES.push({faz:'luvaFalcoaria',n:1,custo:{couroCurtido:1,linha:1},cat:'animais',etapa:2,est:'couro',desb:{fauna:'gaviao'}});
const GAV={domado:false,nome:'Carijó',xp:0,fome:30,conf:0,modo:'segue',poleiro:null,pol:null,x:0,y:0,z:0,yaw:0,pitch:0,roll:0,v:0,vy:0,st:'plana',t:0,fase:0,bate:0,s:2.9,sp:'gaviao',
  cx:0,cz:0,ch:0,raio:9,ang:0,dir:1,alvo:null,vigT:0,avisoT:-99,ataqueT:-99,treinoTm:-1e9,famTm:0,chamando:null,luvaT:0,tmUlt:0};
const GAV_CFG={confPor:0.34,raio:[0,40,60,72],xpNivel:[0,0,3,7],fomeH:3.5,carne:{carneCrua:45,peixeCru:35},ataqueCd:12,vigiaBase:[0,45,65,75]};
const gavNivel=()=>GAV.xp>=GAV_CFG.xpNivel[3]?3:GAV.xp>=GAV_CFG.xpNivel[2]?2:1;
function carneGav(){return invCount('carneCrua')>0?'carneCrua':invCount('peixeCru')>0?'peixeCru':null;}
const luvaNaMao=()=>{const s=selItem();return!!(s&&s.id==='luvaFalcoaria');};
function maoPos(){const M=P.ch.m.subarray(11*16,12*16),p=xf(M,0,0.02,0);
  if(!(Math.abs(p[0]-P.x)<2&&Math.abs(p[2]-P.z)<2&&Math.abs(p[1]-P.y-1.5)<1.2)){const b=P.body,fx=Math.sin(b),fz=Math.cos(b);return[P.x+fx*0.3+fz*0.24,P.y+1.8,P.z+fz*0.3-fx*0.24];}
  return[p[0],p[1]+0.07,p[2]];}

/* ---------- gavião selvagem: desce na luva para comer ---------- */
INTERS.push(function gavInter(tryIt){if(!P.alive||P.montado||CARRO.ativo||P.nada||!luvaNaMao())return;
  if(GAV.domado){if(GAV.st==='luva')tryIt({k:'gavPainel',o:GAV},P.x,P.z,1,0.5,-2);return;}
  if(!carneGav())return;let w=null,bd=85*85;for(const b of AVES){if(b.sp!=='gaviao'||b.st!=='plana')continue;const d=d2(b.x,b.z,P.x,P.z);if(d<bd){bd=d;w=b;}}
  if(w)tryIt({k:'gavChamar',o:{x:P.x,z:P.z,w}},P.x,P.z,1,0.4,-2);});
INTER_K.gavChamar={texto:o=>({t:'Erguer a luva com carne',s:'o gavião desce para comer · confiança '+Math.round(GAV.conf*100)+'%',hold:true,dur:1.4}),
  usar:(o,seg)=>{const w=o&&o.w;if(!seg||!w||!AVES.includes(w))return;if(!carneGav()){feed('Precisa de carne crua ou peixe cru',true);return;}w.st='desce';w.t=12;GAV.chamando=w;feed('O gavião viu a carne e vem descendo. Fique parado com a luva.');sfx('aveCanto',w.x,w.z,0.7,'gaviao');}};
INTER_K.gavPainel={texto:()=>({t:'Gavião '+GAV.nome+' (nível '+gavNivel()+')',s:'toque: cuidar e treinar'+(GAV.fome>70?' · com fome':'')}),usar:()=>gavAbrir()};
function gavSelvagemPasso(b,dt){}
/* descida e pouso na luva (selvagem e domado usam o mesmo voo) */
function gavParaLuva(b,dt){const[hx,hy,hz]=maoPos();const d=aveVoaPara(b,hx,hy,hz,dt,b.st==='desce'?14:10,10);b.bate=d<6?1:b.bate;return d;}
{const _ap=avePasso;avePasso=function(b,dt){if(b.sp==='gaviao'&&(b.st==='desce'||b.st==='luva')){b.t-=dt;b.fase+=dt*AVE_SP.gaviao.bate;
    if(!luvaNaMao()||P.correndo||P.montado||!P.alive||b.t<=0){b.vy=3;b.v=6;b.alvo=null;GAV.chamando=null;b.st='plana';b.cx=P.x;b.cz=P.z;b.ch=ground(P.x,P.z)+22;b.ang=Math.atan2(b.x-P.x,b.z-P.z);return;}
    if(b.st==='desce'){b.bate=1;if(gavParaLuva(b,dt)<0.35){b.st='luva';b.t=3.2;const c=carneGav();if(c){invRemove(c,1);invRender();hudBarra();}sfx('aveCanto',b.x,b.z,0.5,'gaviao');}}
    else{const[hx,hy,hz]=maoPos();b.x=hx;b.y=hy;b.z=hz;b.yaw=P.body;b.pitch=0;b.roll=0;b.bate=0;b.v=0;
      if(b.t<=0.3){GAV.conf=Math.min(1,GAV.conf+GAV_CFG.confPor);GAV.chamando=null;
        if(GAV.conf>=0.999){gavDomar(b);return;}
        feed('O gavião comeu na sua luva · confiança '+Math.round(GAV.conf*100)+'%');dica('gaviaoLuva','corpo','Mais algumas vezes e ele confia em você. Cada vez gasta uma carne crua ou um peixe cru.');
        b.vy=3.5;b.v=5;b.yaw+=Math.PI;b.alvo=null;b.st='plana';b.cx=P.x;b.cz=P.z;b.ch=ground(P.x,P.z)+20;b.ang=Math.atan2(b.x-P.x,b.z-P.z);}}
    return;}
  return _ap.apply(this,arguments);};}
function gavDomar(w){const i=AVES.indexOf(w);if(i>=0)AVES.splice(i,1);Object.assign(GAV,{domado:true,x:w.x,y:w.y,z:w.z,yaw:w.yaw,st:'luva',fome:20,xp:0,modo:'segue',poleiro:null,pol:null,chamando:null,tmUlt:G.tm,famTm:0,s:w.s});
  sfx('aveCanto',GAV.x,GAV.z,0.8,'gaviao');ganharXP(30);
  toast('corpo','O gavião é seu! O nome dele é '+GAV.nome+'. Com a luva na mão ele pousa nela; sem a luva, voa em cima de você e avisa quando zumbi chega perto. Construa um poleiro (B → Animais) para treinar e deixar vigiando a base.');
  if(typeof diarioEvento==='function')diarioEvento('Domou o gavião '+GAV.nome,'caca');if(typeof conqEvento==='function')conqEvento('domar','gaviao');}

/* ---------- gavião domado: na luva, voando em cima de você, no poleiro vigiando a base, atacando zumbi ---------- */
function gavPoleiro(){if(!GAV.pol)return null;let best=null,bd=9;for(const o of OB){if(o.tipo!=='poleiro'||o.hp<=0)continue;const d=d2(o.x,o.z,GAV.pol.x,GAV.pol.z);if(d<bd){bd=d;best=o;}}return best;}
function gavTopo(p){return[p.x,p.y+2.34,p.z];}
function gavCentro(){if(GAV.modo==='base'){const p=gavPoleiro();if(p)return{x:p.x,z:p.z,base:true,p};}return{x:P.x,z:P.z,base:false};}
function gavPasso(dt){if(!GAV.domado)return;const n=gavNivel(),dm=Math.max(0,Math.min(240,G.tm-(GAV.tmUlt||G.tm)));GAV.tmUlt=G.tm;GAV.fase+=dt*AVE_SP.gaviao.bate*(GAV.bate>0.3?1:0.25);
  GAV.fome=Math.min(100,GAV.fome+dm/60*GAV_CFG.fomeH);
  if(GAV.fome>=100){GAV.famTm+=dm;if(GAV.famTm>720){gavVaiEmbora('passou fome demais');return;}if(G.tm-(GAV.fomeAv||-1e9)>240){GAV.fomeAv=G.tm;toast('perigo',GAV.nome+' está faminto. Dê carne crua ou peixe cru (no poleiro, ou com ele na luva).');}}else GAV.famTm=0;
  if(GAV.modo==='base'&&!gavPoleiro()){GAV.modo='segue';feed('O poleiro de '+GAV.nome+' sumiu: ele volta para você',true);}
  const C=gavCentro(),noite=(E.n||0)>0.6;GAV.t-=dt;
  // decide o estado
  if(GAV.st==='ataca'){const z=GAV.alvo;if(!z||!z.vivo){GAV.st='plana';}else{const d=aveVoaPara(GAV,z.x,(z.y||0)+1.5,z.z,dt,16,10);GAV.bate=1;
      if(d<0.9){z.st='atordoado';z.t=2.0;z.kx=Math.sin(GAV.yaw)*1.5;z.kz=Math.cos(GAV.yaw)*1.5;ferirZ(z,9,Math.sin(GAV.yaw)*0.3,Math.cos(GAV.yaw)*0.3,false);sfx('aveCanto',GAV.x,GAV.z,0.9,'gaviao');
        GAV.ataqueT=G.t;GAV.st='plana';GAV.vy=4;if(Math.hypot(P.x-z.x,P.z-z.z)<40)feed(GAV.nome+' atacou um zumbi');}}}
  else if(GAV.st==='treino'){GAV.bate=1;GAV.ang+=dt*1.4;const tx=C.x+Math.sin(GAV.ang)*18,tz=C.z+Math.cos(GAV.ang)*18;aveVoaPara(GAV,tx,ground(tx,tz)+4,tz,dt,14);if(GAV.t<=0)GAV.st='plana';}
  else if(GAV.modo==='segue'&&luvaNaMao()&&!P.correndo&&!P.montado&&P.alive&&P.y>-20){const[hx,hy,hz]=maoPos();
    if(GAV.st!=='luva'){GAV.bate=1;if(aveVoaPara(GAV,hx,hy,hz,dt,11,9)<0.35){GAV.st='luva';sfx('aveCanto',GAV.x,GAV.z,0.4,'gaviao');}}else{GAV.x=hx;GAV.y=hy;GAV.z=hz;GAV.yaw=P.body;GAV.pitch=0;GAV.roll=0;GAV.v=0;GAV.bate=0;}}
  else if(C.base&&(noite||GAV.t>0&&GAV.st==='poleiro'||GAV.st==='volta')){const[tx,ty,tz]=gavTopo(C.p);
    if(GAV.st==='poleiro'){GAV.x=tx;GAV.y=ty;GAV.z=tz;GAV.v=0;GAV.bate=0;GAV.pitch=0;GAV.roll=0;if(GAV.t<=0&&!noite){GAV.st='plana';GAV.t=20+Math.random()*10;}}
    else{GAV.bate=1;if(aveVoaPara(GAV,tx,ty,tz,dt,10)<0.4){GAV.st='poleiro';GAV.t=40+Math.random()*30;}}}
  else{// voando em círculos em cima de você (ou da base)
    if(GAV.st==='luva'||GAV.st==='poleiro'){GAV.st='plana';GAV.vy=3;GAV.ang=Math.atan2(GAV.x-C.x,GAV.z-C.z);if(C.base)GAV.t=20+Math.random()*10;}
    if(GAV.st!=='plana'){GAV.st='plana';}
    const r=C.base?16:9,h=(C.base?18:14)+(noite?-5:0);GAV.ang+=dt*(AVE_SP.gaviao.voo*0.65/r);const tx=C.x+Math.sin(GAV.ang)*r,tz=C.z+Math.cos(GAV.ang)*r;
    GAV.bate=Math.sin(G.t*0.5)>0.75?1:0;aveVoaPara(GAV,tx,ground(tx,tz)+h,tz,dt,AVE_SP.gaviao.voo*0.65);GAV.roll=-0.35;
    if(C.base&&GAV.t<=0){GAV.st='volta';}}
  // vigia
  GAV.vigT-=dt;if(GAV.vigT<=0){GAV.vigT=1.5;gavVigia(C,n,noite);}}
function gavVigia(C,n,noite){let R=(C.base?GAV_CFG.vigiaBase[n]:GAV_CFG.raio[n])*(GAV.fome>80?0.6:1)*(noite?0.65:1);const novos=[];let perto=null,pd=1e9;
  for(const z of Z){if(!z.vivo)continue;const d=Math.hypot(z.x-C.x,z.z-C.z);if(d>R)continue;if(!z.gavVisto||G.t-z.gavVisto>60)novos.push(z);z.gavVisto=G.t;if(n>=2)z.marcaAte=G.t+30;
    if(n>=3&&d<pd&&z.st!=='atordoado'&&(C.base?d<26:Math.hypot(z.x-P.x,z.z-P.z)<9)){pd=d;perto=z;}}
  if(novos.length&&G.t-GAV.avisoT>18){GAV.avisoT=G.t;sfx('aveCanto',GAV.x,GAV.z,1,'gaviao');const m=novos.reduce((a,z)=>[a[0]+z.x,a[1]+z.z],[0,0]).map(v=>v/novos.length),dir=direcao(m[0]-C.x,m[1]-C.z),
      dist=Math.round(Math.hypot(m[0]-C.x,m[1]-C.z)),q=novos.length+' zumbi'+(novos.length>1?'s':'');
    if(C.base){const longe=Math.hypot(P.x-C.x,P.z-C.z)>150;if(!longe)toast('perigo',GAV.nome+' grita no poleiro: '+q+' chegando à base pelo '+dir+' ('+dist+' m).');if(typeof diarioEvento==='function')diarioEvento(GAV.nome+' avistou '+q+' perto da base','combate');}
    else feed(GAV.nome+' viu '+q+' a '+dir+' ('+dist+' m)',true);}
  if(n>=2&&!C.base&&G.t-(GAV.cacaT||-99)>25){let best=null,bd=80*80;for(const b of BICHOS){if(!b.vivo||b.domado||b.tipo==='cavalo')continue;const d=d2(b.x,b.z,P.x,P.z);if(d<bd&&d>18*18){bd=d;best=b;}}
    if(best){GAV.cacaT=G.t;best.marcaAte=G.t+30;feed(GAV.nome+' achou caça: '+FAUNA[best.tipo].nome.toLowerCase()+' a '+direcao(best.x-P.x,best.z-P.z)+' ('+Math.round(Math.sqrt(bd))+' m)');}}
  if(perto&&G.t-GAV.ataqueT>GAV_CFG.ataqueCd&&GAV.st!=='ataca'){GAV.st='ataca';GAV.alvo=perto;}}
function gavVaiEmbora(pq){GAV.domado=false;GAV.conf=0;GAV.st='plana';GAV.modo='segue';GAV.pol=null;toast('perigo',GAV.nome+' foi embora: '+pq+'.');if(typeof diarioEvento==='function')diarioEvento(GAV.nome+' foi embora ('+pq+')','caca');}
function gavAssobio(){if(!GAV.domado||GAV.modo!=='segue')return false;if(Math.hypot(GAV.x-P.x,GAV.z-P.z)>300)return false;GAV.st='plana';GAV.ang=Math.atan2(GAV.x-P.x,GAV.z-P.z);return true;}
PASSOS.push(function gaviaoPasso(dt){if(G.modo!=='jogo')return;gavPasso(dt);});
/* de braço erguido quando o gavião está na luva ou descendo para ela */
{const _aj=animarJogador;animarJogador=function(dt){_aj.apply(this,arguments);let k=0;if(luvaNaMao()){if(GAV.domado&&GAV.st==='luva')k=1;else if(GAV.chamando)k=1;else if(GAV.domado&&GAV.modo==='segue'&&Math.hypot(GAV.x-P.x,GAV.z-P.z)<8)k=0.7;}
  P.luvaK=approach(P.luvaK||0,k,dt*4);const q=P.luvaK;if(q>0.01){const o=P.ch.r;S3(o,5,lerp(o[15],-1.35,q),lerp(o[16],0,q),lerp(o[17],0.3,q));S3(o,6,lerp(o[18],-1.25,q),0,0);}};}
function gavDesenho(Pg){if(!GAV.domado||!MESH.ave)return;if(d2(GAV.x,GAV.z,cam.pos[0],cam.pos[2])>150*150)return;aveDesenhar(Pg,GAV,mat(GAV.x,GAV.y,GAV.z,GAV.pitch,GAV.yaw,GAV.roll,GAV.s,GAV.s,GAV.s));}

/* ---------- poleiro: construção e painel do gavião ---------- */
Object.assign(OBRAS,{poleiro:{nome:'Poleiro do gavião',icon:'i-poleiro',custo:{madeira:4,corda:1},hp:140,hw:0.22,hd:0.22,solid:true,hCol:2.3,estacao:'poleiro',
  desc:'Mastro com travessa no alto. Segure E perto para o painel do gavião: comida, treino, vigiar a base. Vigiando, ele fica aqui e grita quando zumbi se aproxima.'}});
Object.assign(ESTACOES,{poleiro:{nome:'Poleiro do gavião',icon:'i-poleiro',ir:'um poleiro (B → Animais → Poleiro do gavião)',chip:'Poleiro'}});
{const tab=OBRA_CATS.find(c=>c.id==='animais');if(tab&&!tab.t.includes('poleiro'))tab.t.unshift('poleiro');if(!OBRA_ORDEM.includes('poleiro'))OBRA_ORDEM.push('poleiro');if(!OBRAS_CHAO.includes('poleiro'))OBRAS_CHAO.push('poleiro');}
INIT_MALHAS.push(function poleiroMalha(){const R=rng(1717),g=new GB(1024,8),mad=lin(0x6e5236),mad2=lin(0x54402a),cor=lin(0xb9a77a);
  add(g,cylTris(0.07,0.09,2.2,8),mat(0,0,0),mad,{j:0.05,rnd:R});add(g,cylTris(0.035,0.035,0.7,6),mat(-0.35,2.25,0,0,0,Math.PI/2),mad2,{j:0.05,rnd:R});
  for(const s of[1,-1])add(g,cylTris(0.02,0.02,0.55,5),mat(s*0.02,1.85,0,0,0,s*0.6),mad2,{j:0.05,rnd:R});add(g,cylTris(0.075,0.075,0.08,8,{top:false}),mat(0,2.05,0),cor,{j:0.05,rnd:R});
  for(const s of[1,-1])add(g,boxTris(0.36,0.04,0.36),mat(0,0.02,0,0,s*0.4,0),mad2,{j:0.05,rnd:R});MESH.obra.poleiro=litMesh(g.data());});
function gavAbrir(st){const o=st||{estTipo:'gaviao',nome:'Gavião '+GAV.nome,ext:{}};abrirEstacao(o);}
function gavRender(st){const poleiro=st&&st.tipo==='poleiro';
  if(!GAV.domado){return{sub:'Nenhum gavião',corpo:'<p class="es-info">Para ter um gavião: faça a <b>luva de falcoaria</b> (estação de couro). Num campo aberto com gavião planando, fique com a luva na mão e carne crua ou peixe cru na mochila e segure E. Ele desce e come na luva; três vezes e ele é seu.'+(GAV.conf>0?' Confiança até agora: '+Math.round(GAV.conf*100)+'%.':'')+'</p>',acoes:[]};}
  const n=gavNivel(),prox=GAV_CFG.xpNivel[n+1],fd=carneGav(),podeTreino=G.tm-GAV.treinoTm>=60;
  let c='<div class="es-lista">'+cavMedidor('Fome',1-GAV.fome/100,GAV.fome>80?'faminto: vigia pior':GAV.fome>50?'com fome':'alimentado')+
    cavMedidor('Treino · nível '+n,prox?(GAV.xp-GAV_CFG.xpNivel[n])/(prox-GAV_CFG.xpNivel[n]):1,prox?GAV.xp+' de '+prox+' treinos para o nível '+(n+1):'nível máximo')+'</div>';
  const hab=['Vigia: grita e avisa quando zumbi se aproxima ('+GAV_CFG.raio[n]+' m de você, '+GAV_CFG.vigiaBase[n]+' m da base)',n>=2?'Marca zumbis e caça no minimapa (setas na borda)':'Nível 2: marca zumbis e caça no minimapa',n>=3?'Ataca o zumbi que chega perto (atordoa)':'Nível 3: ataca zumbi que chega perto'];
  c+='<p class="es-info">'+hab.map((h,i)=>(i<n?'✓ ':'· ')+h).join('<br>')+'<br>'+(GAV.modo==='base'?'Vigiando a base (no poleiro).':'Com você.')+'</p>';
  const A=[{id:'comer',t:'Dar comida',s:fd?ITEMS[fd].nome.toLowerCase()+' (tem '+invCount(fd)+')':'carne crua ou peixe cru',ok:!!fd&&GAV.fome>3,prim:GAV.fome>50},
    {id:'treinar',t:'Treinar',s:!fd?'gasta 1 carne crua ou peixe cru':!podeTreino?'descansando (1 treino por hora de jogo)':'voo de isca · +1 treino',ok:!!fd&&podeTreino&&!!prox,prim:GAV.fome<=50}];
  if(poleiro)A.push({id:'vigiar',t:'Vigiar a base aqui',s:'fica no poleiro e grita quando zumbi se aproxima',ok:!(GAV.modo==='base'&&gavPoleiro()===st)});
  A.push({id:'segue',t:'Levar comigo',s:'voa em cima de você; pousa na luva',ok:GAV.modo!=='segue'});
  A.push({id:'soltar',t:GAV.soltarConf?'Confirmar: soltar':'Soltar',s:GAV.soltarConf?'toque de novo para soltar '+GAV.nome:'ele volta para a natureza'});
  return{sub:'Gavião-carijó · '+GAV.nome+' · nível '+n,corpo:c,acoes:A};}
function gavAcao(st,id){if(id!=='soltar')GAV.soltarConf=false;if(!GAV.domado)return'';
  switch(id){
    case'comer':{const f=carneGav();if(!f)return'Sem carne crua nem peixe cru';invRemove(f,1);GAV.fome=Math.max(0,GAV.fome-GAV_CFG.carne[f]);sfx('aveCanto',GAV.x,GAV.z,0.5,'gaviao');return GAV.nome+' comeu';}
    case'treinar':{const f=carneGav();if(!f)return'Precisa de carne crua ou peixe cru';if(G.tm-GAV.treinoTm<60)return'Ele precisa descansar um pouco';const n0=gavNivel();invRemove(f,1);GAV.fome=Math.max(0,GAV.fome-15);GAV.xp++;GAV.treinoTm=G.tm;
      GAV.st='treino';GAV.t=6;GAV.ang=Math.random()*6.283;const n1=gavNivel();if(n1>n0){toast('corpo',GAV.nome+' subiu para o nível '+n1+(n1===2?': agora marca zumbis e caça no minimapa.':': agora ataca zumbi que chega perto.'));if(typeof diarioEvento==='function')diarioEvento(GAV.nome+' chegou ao nível '+n1,'caca');}
      return'Treino feito ('+GAV.xp+' no total)';}
    case'vigiar':if(!st||st.tipo!=='poleiro')return'';GAV.modo='base';GAV.pol={x:st.x,z:st.z};GAV.st='volta';return GAV.nome+' vai vigiar a base deste poleiro';
    case'segue':GAV.modo='segue';GAV.st='plana';return GAV.nome+' vem com você';
    case'soltar':if(!GAV.soltarConf){GAV.soltarConf=true;return'Toque de novo para confirmar';}GAV.soltarConf=false;gavVaiEmbora('você soltou');fecharEstacao();return'';}
  return'';}
ESTACAO_UI.poleiro={resumo:o=>GAV.domado?GAV.nome+(GAV.modo==='base'&&gavPoleiro()===o?' vigiando':'')+' · nível '+gavNivel():'sem gavião',render:o=>gavRender(o),acao:(o,id)=>gavAcao(o,id)};
ESTACAO_UI.gaviao={resumo:()=>GAV.nome,render:o=>gavRender(o),acao:(o,id)=>gavAcao(o,id)};

/* ---------- minimapa: o gavião, e o que ele marcou (setas na borda quando está longe) ---------- */
MAPA_DESENHOS.push((g,X,Y,k,n,range)=>{const cx=X(P.x),cy=Y(P.z),Rb=range*k-5,t=G.t;
  const marca=(x,z,cor)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d<range*0.95){g.strokeStyle=cor;g.lineWidth=1.5;g.beginPath();g.arc(X(x),Y(z),4.5,0,Math.PI*2);g.stroke();return;}
    const a=Math.atan2(dz,dx),px=cx+Math.cos(a)*Rb,py=cy+Math.sin(a)*Rb;g.save();g.translate(px,py);g.rotate(a);g.fillStyle=cor;g.beginPath();g.moveTo(5,0);g.lineTo(-3,-3.5);g.lineTo(-3,3.5);g.closePath();g.fill();g.restore();};
  for(const z of Z)if(z.vivo&&z.marcaAte>t)marca(z.x,z.z,'#ff5a46');for(const b of BICHOS)if(b.vivo&&b.marcaAte>t)marca(b.x,b.z,'#f2d36b');
  if(GAV.domado&&GAV.st!=='luva'){const x=X(GAV.x),y=Y(GAV.z);g.fillStyle='#d8c8b0';g.strokeStyle='#2a2018';g.lineWidth=1;g.beginPath();g.moveTo(x,y-3.5);g.lineTo(x+4,y+2);g.lineTo(x,y+0.5);g.lineTo(x-4,y+2);g.closePath();g.fill();g.stroke();}});

/* ---------- luva na mão ---------- */
INIT_MALHAS.push(function luvaMalha(){const R=rng(1818),g=new GB(512,8),c1=lin(0x8a5a32),c2=lin(0x6a4226);
  add(g,ellipTris(0.052,0.075,0.058,9,7),mat(0,0,0),c1,{j:0.05,rnd:R});add(g,cylTris(0.064,0.052,0.17,9),mat(0,-0.25,0),c2,{j:0.05,rnd:R});add(g,cylTris(0.066,0.066,0.02,9,{top:false}),mat(0,-0.09,0),c1,{j:0.03,rnd:R});
  MESH.arma.luvaFalcoaria=litMesh(g.data());});

/* ---------- salvar e carregar ---------- */
V8.novo.gaviao=()=>{Object.assign(GAV,{domado:false,xp:0,fome:30,conf:0,modo:'segue',pol:null,st:'plana',chamando:null,treinoTm:-1e9,famTm:0,tmUlt:G.tm});AVES.length=0;};
V8.salvar.gaviao=()=>({domado:GAV.domado,nome:GAV.nome,xp:GAV.xp,fome:Math.round(GAV.fome*10)/10,conf:GAV.conf,modo:GAV.modo,pol:GAV.pol,treinoTm:Math.round(GAV.treinoTm>-1e8?GAV.treinoTm:-1e9)});
V8.carregar.gaviao=s=>{s=s||{};Object.assign(GAV,{domado:!!s.domado,nome:s.nome||'Carijó',xp:s.xp||0,fome:s.fome??30,conf:s.conf||0,modo:s.modo||'segue',pol:s.pol||null,treinoTm:s.treinoTm??-1e9,
  st:'plana',chamando:null,tmUlt:G.tm,famTm:0,x:P.x,y:(P.y||0)+16,z:P.z,ang:0});AVES.length=0;if(GAV.domado&&GAV.modo==='base'){const p=gavPoleiro();if(p){const t=gavTopo(p);GAV.x=t[0];GAV.y=t[1];GAV.z=t[2];GAV.st='poleiro';GAV.t=30;}}};

/* ---------- manual ---------- */
MANUAL_EXTRA.push(()=>[{id:'x:gaviao',sec:'animais',nome:'Gavião: domar, treinar e vigiar a base',icon:'i-gaviao',trav:false,como:'desde o começo',
  desc:'Gaviões-carijós planam nos campos abertos durante o dia. Um gavião domado vigia você ou a base.',
  ing:{},est:{nome:'Onde: campos abertos, de dia',icon:'i-gaviao',onde:''},ferr:['Luva de falcoaria (estação de couro)','Carne crua ou peixe cru'],
  proc:['Faça a luva de falcoaria na estação de couro (libera quando você vê um gavião de perto).','Num campo com gavião planando, fique com a luva na mão e carne crua ou peixe cru na mochila.',
    'Segure E: ele desce e pousa na luva para comer. Fique parado (correndo, ou trocando de item, ele vai embora). Três vezes e ele é seu.',
    'Construa um poleiro (B → Animais) e segure E perto dele: dar comida, treinar (1 vez por hora de jogo, gasta carne), vigiar a base, levar com você.'],
  res:null,obs:['Nível 1: grita e avisa quando zumbi se aproxima de você ou da base.','Nível 2 (3 treinos): marca zumbis e caça no minimapa, com setas na borda quando estão longe.',
    'Nível 3 (7 treinos): ataca o zumbi que chega perto, deixando ele atordoado.','Come todo dia. Com fome vigia pior; passando fome por meio dia, vai embora.'],tipo:'Guia'},
 {id:'x:aves',sec:'animais',nome:'Aves da região',icon:'i-gaviao',trav:false,como:'desde o começo',desc:'O que voa e cisca por aqui, e o que cada uma faz quando você chega perto.',
  ing:{},est:{nome:'Onde: em todo canto',icon:'i-gaviao',onde:''},ferr:['Nenhuma'],
  proc:Object.keys(AVE_SP).map(k=>AVE_SP[k].nome+': '+aveHabTxt(k)+'.'),
  res:null,obs:['Todas fogem de você, de zumbi, de tiro e de carro; agachado e devagar dá para chegar mais perto.','A revoada faz barulho: um bando levantando voo pode chamar zumbi.',
    'O quero-quero não foge: dá rasantes gritando em cima de quem chega perto, e o grito chama atenção.','Urubu rodando no céu é sinal de carcaça embaixo.'],tipo:'Guia'}]);

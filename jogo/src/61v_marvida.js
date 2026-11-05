/* ================= Etapa 20: vida no mar, pesca no mar, mergulho e construções na água =================
   PEIXES DO MAR (somam aos dos rios e do lago, com a mesma vara e o mesmo peixe cru): tainha (mais no inverno), sardinha,
   robalo (maré enchendo e fim de tarde), corvina (de noite), pescada, cavala (só longe da praia: do píer comprido, do cais,
   do navio ou de barco parado) e garoupa (perto do naufrágio, das pedras e do cais). A maré enchendo faz morder mais rápido.
   Do cais, do píer e do convés dá para pescar mesmo com a água lá embaixo.
   A vara agora aparece na mão (em 1ª e 3ª pessoa) com a linha até a boia.
   CARANGUEJOS: na areia molhada perto da água, mais na maré baixa e de noite; andam de lado e correm para a água quando você
   chega. Agachado e devagar dá para pegar (E). Cozinha na fogueira. Gaivotas planam sobre a praia e golfinhos pulam ao longe
   quando o mar está calmo.
   ÁGUA DO MAR: não mata a sede (e dá mais sede). Garrafa com água do mar, fervida na fogueira, vira sal (a garrafa volta).
   MERGULHO: nadando, segure C para descer e Espaço para subir. O fôlego aparece na tela; acabando, você começa a se afogar.
   A máscara de mergulho (achada no navio, no salva-vidas e nos naufrágios) dobra o fôlego.
   CONSTRUÇÕES: o deque também vai no mar (alto o bastante para a maré alta); píer novo (aba Água): trechos de 2,4 × 6 m que
   se emendam mar adentro (até 12). Na areia que a maré alta cobre não dá para construir o resto. */
iconesNovos({'i-caranguejo':'<ellipse cx="12" cy="14" rx="5" ry="3.5"/><path d="M7 12 4 9l2-3M17 12l3-3-2-3M7 15l-3 2M7 17l-2 3M17 15l3 2M17 17l2 3"/>',
  'i-garrafa-mar':'<path d="M10 3h4v3l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 14c1.3-1 2.7-1 4 0s2.7 1 4 0"/>',
  'i-mascara':'<path d="M3 9h18v5a3 3 0 0 1-3 3h-3l-3-2-3 2H6a3 3 0 0 1-3-3z"/><path d="M19 9V5h2"/>',
  'i-pier':'<path d="M2 10h20M4 10v9M10 10v9M16 10v9M22 10v9"/><path d="M2 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/>'});
Object.assign(ITEMS,{
  aguaMar:{nome:'Água do mar',icon:'i-garrafa-mar',max:6,tipo:'material',desc:'Salgada: não mata a sede (dá mais sede). Ferva na fogueira: a água evapora, fica o sal e a garrafa volta vazia.'},
  caranguejo:{nome:'Caranguejo',icon:'i-caranguejo',max:10,tipo:'comida',fome:4,vida:-3,validade:14,desc:'Pegue na areia molhada perto do mar. Cozinhe na fogueira: cru faz mal.'},
  caranguejoCozido:{nome:'Caranguejo cozido',icon:'i-caranguejo',max:10,tipo:'comida',fome:16,vida:4,validade:30,desc:'Pouca carne, mas boa.'},
  mascaraMergulho:{nome:'Máscara de mergulho',icon:'i-mascara',max:1,tipo:'util',desc:'Na mochila: debaixo d\'água o fôlego dura o dobro e você enxerga melhor. Nadando, segure C para mergulhar.'}});
COZINHA.push({de:'caranguejo',para:'caranguejoCozido',n1:'caranguejo',nn:'caranguejos',xp:2,assa:true},{de:'aguaMar',para:'sal',n1:'água do mar (sal)',nn:'águas do mar (sal)',xp:1});
{const _cz=cozinhar;cozinhar=function(){const n=invCount('aguaMar');_cz.apply(this,arguments);const usou=n-invCount('aguaMar');if(usou>0){const l=invAdd('garrafa',usou);if(l)soltarItens([['garrafa',l]],P.x,P.z,P.y);}};}
for(const k of['mar','emenda'])LUGAR_EXT.add(k);
const MAR_ALTO=()=>MAR.base+MAR.amp+0.15;   // até onde a maré mais alta (com onda) chega
/* ---------- peixes do mar ---------- */
Object.assign(PEIXES,{
  tainha:{nome:'Tainha',onde:{mar:5},kg:[0.4,2.6],noite:0.6,janela:1.2,cor:0x8c9aa0,tam:1.05,mar:{inverno:2.6,raso:1.4}},
  sardinha:{nome:'Sardinha',onde:{mar:5},kg:[0.04,0.16],noite:0.7,janela:1.6,cor:0x9fb4c0,tam:0.5,mar:{}},
  robalo:{nome:'Robalo',onde:{mar:2.2},kg:[0.8,6.5],noite:1.5,janela:0.9,cor:0xa8b0a4,tam:1.3,mar:{enchendo:2.2,tarde:1.8,estrutura:1.5}},
  corvina:{nome:'Corvina',onde:{mar:2.6},kg:[0.4,3.2],noite:2.0,dia:0.6,janela:1.1,cor:0xb8a888,tam:1.05,mar:{}},
  pescada:{nome:'Pescada',onde:{mar:3},kg:[0.3,2.2],noite:1.0,janela:1.2,cor:0xc8c0b0,tam:1.0,mar:{}},
  cavala:{nome:'Cavala',onde:{mar:2},kg:[1.0,8.0],noite:0.6,janela:0.8,cor:0x4a6a7e,tam:1.35,mar:{fundo:4}},
  garoupa:{nome:'Garoupa',onde:{mar:0.4},kg:[2.0,14],noite:1.0,janela:0.75,cor:0x7a5a3a,tam:1.5,mar:{estrutura:7}}});
function peixeEstrutura(x,z){if(d2(x,z,370,8)<34*34)return true;for(const W of NAUFRAGIOS)if(d2(x,z,W.x,W.z)<16*16)return true;for(const r of PEDRAS_PONTA)if(d2(x,z,r.x,r.z)<10*10)return true;
  for(const o of OB)if((o.tipo==='pier'||o.tipo==='deque')&&d2(x,z,o.x,o.z)<8*8)return true;return false;}
{const _pl=peixeLocal;peixeLocal=function(x,z){return aguaDoMar(x,z)?'mar':_pl(x,z);};
 const _ps=peixeSorteia;peixeSorteia=function(x,z){if(peixeLocal(x,z)!=='mar')return _ps.apply(this,arguments);
   const noite=(E.n||0)>0.5,tarde=G.hora>=16.5&&G.hora<19.5,inv=typeof estacaoIdx==='function'&&estacaoIdx()===3,est=mareEstado(),fundo=aguaProf(x,z),estr=peixeEstrutura(x,z),W=[];
   for(const k in PEIXES){const F=PEIXES[k];let w=F.onde.mar||0;if(!w)continue;const M=F.mar||{};w*=noite?F.noite:(F.dia||1);
     if(M.inverno&&inv)w*=M.inverno;if(M.raso&&fundo<2.5)w*=M.raso;if(M.enchendo&&est==='enchendo')w*=M.enchendo;if(M.tarde&&tarde)w*=M.tarde;
     if(M.estrutura)w*=estr?M.estrutura:0.35;if(M.fundo)w*=fundo>=M.fundo?2:0.08;W.push([k,w]);}
   let t=W.reduce((s,q)=>s+q[1],0)*Math.random();for(const[k,w]of W){t-=w;if(t<=0)return k;}return'sardinha';};
 const _pc=pescaComecar;pescaComecar=function(o){_pc.apply(this,arguments);const p=P.pesca;if(!p||!aguaDoMar(o.x,o.z))return;p.mar=true;
   const est=mareEstado(),f=est==='enchendo'?0.7:est==='alta'?0.85:est==='baixa'?1.25:1;p.morde=(5+Math.random()*10)*f*peixeMult();};}
/* a boia acompanha a maré e as ondas */
PASSOS.push(()=>{const p=P.pesca;if(p&&p.mar)p.y=marNivelEm(p.x,p.z);});
/* pescar de cima (cais, píer, convés, deque): a água pode estar alguns metros abaixo */
INTERS.push(tryIt=>{if(P.nada||CARRO.ativo||!P.alive||P.pesca)return;if(!marEm(P.x,P.z))return;const sv=selItem();if(!sv||sv.id!=='vara')return;
  const fx=Math.sin(P.body),fz=Math.cos(P.body);for(const d of[1.5,2.6,3.8,5]){const x=P.x+fx*d,z=P.z+fz*d,n=aguaNivel(x,z);if(n===null||n-ground(x,z)<0.3)continue;const dy=P.y-n;if(dy<1.3||dy>7)continue;
    tryIt({k:'aguaRio',o:{x,y:n,z,alto:true}},x,z,5.5,1.0,-0.4);return;}});
/* água do mar: não bebe; enche garrafa com água salgada; pescar no mar */
{const K=INTER_K.aguaRio,_tx=K.texto,_us=K.usar;
 K.texto=function(o){if(!o||!aguaDoMar(o.x,o.z))return _tx.apply(this,arguments);if(segurandoVara()){const e=mareEstado();return{t:'Pescar no mar',s:MARE_NOME[e].toLowerCase()+(e==='enchendo'?': o peixe morde mais rápido':'')};}
   if(o.alto)return{t:'Água lá embaixo',s:'daqui só dá para pescar'};const g=invCount('garrafa');return g?{t:'Encher '+(g>1?g+' garrafas':'a garrafa')+' com água do mar',s:'salgada: ferva na fogueira para tirar o sal'}:{t:'Água do mar',s:'salgada: não mata a sede'};};
 K.usar=function(o){if(!o||!aguaDoMar(o.x,o.z))return _us.apply(this,arguments);if(segurandoVara()){pescaComecar(o);return;}if(o.alto)return;
   const g=invCount('garrafa');if(g){invRemove('garrafa',g);const l=invAdd('aguaMar',g);if(l)soltarItens([['aguaMar',l]],P.x,P.z,P.y);feed('Encheu '+(g>1?g+' garrafas':'a garrafa')+' com água do mar');sfx('pegar');
     dica('aguaMar','corpo','Água do mar não se bebe. Ferva na fogueira (segure E perto do fogo): a água evapora, fica o sal e a garrafa volta vazia. O sal serve para curtir couro e conservar carne.');invRender();return;}
   P.sede=Math.max(0,P.sede-6);feed('Água salgada: deu mais sede',true);sfx('vazio');hudBarra();};}
/* ---------- a vara na mão e a linha até a boia ---------- */
const VARA_M=mat(0,0,0,-0.55,0,0),VARA_PONTA=[0,0,1.78];
INIT_MALHAS.push(function varaMalha(){const g=new GB(1024,8),R=rng(33),o={j:0.05,rnd:R};
  add(g,cylTris(0.009,0.016,2.1,6),mm(VARA_M,mat(0,0,-0.32,Math.PI/2,0,0)),lin(0x2a2a2c),o);add(g,cylTris(0.02,0.02,0.34,7),mm(VARA_M,mat(0,0,-0.3,Math.PI/2,0,0)),lin(0x6a4a2c),o);
  add(g,cylTris(0.045,0.045,0.05,10),mm(VARA_M,mat(0,-0.06,0.06,0,0,Math.PI/2)),lin(0x8a9096));add(g,boxTris(0.02,0.05,0.02),mm(VARA_M,mat(0,-0.03,0.06)),lin(0x5a5e62));
  for(const z of[0.5,0.95,1.35,1.7])add(g,cylTris(0.012,0.012,0.006,6),mm(VARA_M,mat(0,-0.018,z,0,0,0)),lin(0xb0b4b8));
  MESH.arma.vara=litMesh(g.data());MESH.linhaPesca=litMesh((()=>{const q=new GB(64,8);add(q,boxTris(0.006,0.006,1),mat(0,0,0.5),lin(0xd8d8d0));return q.data();})());});
const _VP=new Float32Array(16);
function pontoMat(M,p){return[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];}
function varaPonta(){if(cfg.cam==='1'||!P.ch||!P.ch.m){const f=cam.fwd,r=cam.right,u=cam.up,p=cam.pos;return[p[0]+f[0]*1.5+u[0]*0.45+r[0]*0.25,p[1]+f[1]*1.5+u[1]*0.45+r[1]*0.25,p[2]+f[2]*1.5+u[2]*0.45+r[2]*0.25];}
  const h=P.ch.m.subarray(11*16,12*16),q=pontoMat(h,pontoMat(VARA_M,VARA_PONTA));if(Math.hypot(q[0]-P.x,q[2]-P.z)>4||!isFinite(q[1])){const fx=Math.sin(P.body),fz=Math.cos(P.body);return[P.x+fx*1.6,P.y+2.2,P.z+fz*1.6];}return q;}
DESENHO.opaco.push(function linhaPesca(Pg){const p=P.pesca;if(!p||!MESH.linhaPesca||!segurandoVara()||CARRO.ativo)return;const A=varaPonta(),B=[p.x,p.y+0.05,p.z],L=Math.hypot(B[0]-A[0],B[2]-A[2]),sag=Math.min(0.9,0.04*L+0.1)*(p.mordeu?0.2:1);
  const pt=t=>[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-sag*4*t*(1-t),A[2]+(B[2]-A[2])*t];const N=10;
  for(let i=0;i<N;i++){const a=pt(i/N),b=pt((i+1)/N),dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);if(l<1e-4)continue;
    drawStat(Pg,MESH.linhaPesca,mat(a[0],a[1],a[2],-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,1,1,l));}});
/* ---------- caranguejos ---------- */
const CRABS=[];let crabT=0;
function crabZona(x,z){if(!marEm(x,z)||aguaNivel(x,z)!==null)return false;const d=costaD(x,z),L=marLinhaD(z);return d>L-10&&d<L-0.2;}
PASSOS.push(function caranguejos(dt){if(G.modo!=='jogo'||!P.alive)return;crabT-=dt;
  if(crabT<=0){crabT=2.5;for(let i=CRABS.length-1;i>=0;i--)if(Math.hypot(CRABS[i].x-P.x,CRABS[i].z-P.z)>48)CRABS.splice(i,1);
    if(marEm(P.x,P.z)&&costaD(P.x,P.z)>-marLarg(P.z)-10&&costaD(P.x,P.z)<30){const e=mareEstado(),noite=(E.n||0)>0.5,max=(e==='baixa'?7:e==='vazando'?5:2)+(noite?3:0);
      for(let k=0;k<8&&CRABS.length<max;k++){const a=Math.random()*6.283,r=7+Math.random()*24,x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;if(!crabZona(x,z)||!dentroMapa(x,z,0)||pointBlocked(x,z,0.3))continue;
        CRABS.push({x,z,y:ground(x,z),yaw:Math.random()*6.283,dir:Math.random()*6.283,st:'anda',t:1+Math.random()*3,v:0,s:0.75+Math.random()*0.5,fase:Math.random()*6});}}}
  for(let i=CRABS.length-1;i>=0;i--){const c=CRABS[i];c.t-=dt;c.fase+=dt*12;const dp=Math.hypot(P.x-c.x,P.z-c.z),cuidado=P.agachado&&Math.hypot(P.vx,P.vz)<1.6;
    if(c.st!=='foge'&&dp<(cuidado?1.2:3.4)){c.st='foge';c.t=2.6;c.dir=Math.atan2(c.x-P.x,c.z-P.z);}
    if(c.st==='foge'){c.v=2.4;if(c.t<=0||aguaProf(c.x,c.z)>0.12){CRABS.splice(i,1);continue;}}
    else{c.v=(c.t%2.2)<1.1?0.32:0;if(c.t<=0){c.t=2+Math.random()*4;c.dir+=(Math.random()-0.5)*2.2;}}
    const nx=c.x+Math.sin(c.dir)*c.v*dt,nz=c.z+Math.cos(c.dir)*c.v*dt;if(!pointBlocked(nx,nz,0.12)&&dentroMapa(nx,nz,0)){c.x=nx;c.z=nz;}else c.dir+=1.5;
    c.yaw=c.dir+Math.PI/2;c.y=chaoEm(c.x,c.z,c.y+0.3);}});
INTERS.push(tryIt=>{if(P.nada||CARRO.ativo||!CRABS.length)return;for(const c of CRABS)if(Math.abs(c.x-P.x)<2&&Math.abs(c.z-P.z)<2)tryIt({k:'caranguejo',o:c},c.x,c.z,1.7,2.4,-0.6,c.y);});
INTER_K.caranguejo={texto:c=>({t:'Pegar o caranguejo',s:c.st==='foge'?'ele está fugindo!':'agachado e devagar é mais fácil'}),
  usar:c=>{const i=CRABS.indexOf(c);if(i<0)return;const ch=c.st==='foge'?0.35:P.agachado?0.9:0.7;
    if(Math.random()<ch){CRABS.splice(i,1);ganhar('caranguejo',1);sfx('pegar');ganharXP(2);if(typeof diarioConta==='function')diarioConta('caranguejos',1);
      if(typeof diarioDescobre==='function')diarioDescobre('especie','caranguejo','Caranguejo',2);dica('caranguejo','corpo','Caranguejo! Cozinhe na fogueira. Aparecem mais na maré baixa e de noite, na areia molhada.');}
    else{c.st='foge';c.t=2.6;c.dir=Math.atan2(c.x-P.x,c.z-P.z);feed('Escapou!',true);}}};
/* ---------- golfinhos ao longe ---------- */
const DELF=[];let delfT=20;
function golfinhos(dt){if(G.modo!=='jogo')return;delfT-=dt;
  if(delfT<=0){delfT=30+Math.random()*40;const d=costaD(P.x,P.z);if(marEm(P.x,P.z)&&d>-40&&(E.n||0)<0.4&&marOndaA()<0.24&&!DELF.length&&Math.random()<0.6){
      const n=costaN(P.z),off=50+Math.random()*90,z0=P.z+(Math.random()-0.5)*60,c=marPonto(z0,off),dir=Math.random()<0.5?0:Math.PI,k=2+Math.floor(Math.random()*2);
      for(let i=0;i<k;i++)DELF.push({x:c[0]+(Math.random()-0.5)*6,z:c[1]+(Math.random()-0.5)*6,yaw:Math.atan2(-n[1],n[0])+dir+(Math.random()-0.5)*0.3,t:-i*0.7,pulos:3+Math.floor(Math.random()*3),dur:1.1,h:1.1+Math.random()*0.5,v:6});}}
  for(let i=DELF.length-1;i>=0;i--){const q=DELF[i];q.t+=dt;if(q.t>=q.dur+0.9){q.t=0;q.pulos--;if(q.pulos<=0){DELF.splice(i,1);continue;}}
    if(q.t>0){q.x+=Math.sin(q.yaw)*q.v*dt;q.z+=Math.cos(q.yaw)*q.v*dt;}
    if(q.t>0&&q.t<q.dur&&!q.saiu){q.saiu=1;q.entrou=0;RINGS.push({x:q.x,z:q.z,y:marNivel()+0.02,a:0});}
    if(q.t>=q.dur&&!q.entrou){q.entrou=1;q.saiu=0;RINGS.push({x:q.x,z:q.z,y:marNivel()+0.02,a:0});if(Math.hypot(q.x-P.x,q.z-P.z)<120)sfx('nado',q.x,q.z,0.5);}}}
PASSOS.push(golfinhos);
INIT_MALHAS.push(function golfinhoMalha(){const g=new GB(1024,8),R=rng(44),o={j:0.04,rnd:R},c=lin(0x6a7a8a),cb=lin(0xc8ccd0);
  add(g,ellipTris(0.32,0.34,1.15,12,8),mat(0,0,0),c,o);add(g,ellipTris(0.26,0.2,0.9,10,6),mat(0,-0.12,0.05),cb,o);add(g,cylTris(0.07,0.1,0.32,7),mat(0,0,1.25,Math.PI/2,0,0),c,o);
  add(g,boxTris(0.05,0.42,0.38,{tx:0.2,tz:0.4}),mat(0,0.42,-0.05,-0.4,0,0),c,o);add(g,boxTris(0.9,0.05,0.32,{tz:0.5}),mat(0,0,-1.25),c,o);
  for(const s of[1,-1])add(g,boxTris(0.3,0.04,0.18),mat(s*0.32,-0.14,0.4,0,s*0.5,s*0.4),c,o);MESH.golfinho=litMesh(g.data());
  const h=new GB(1024,8);add(h,ellipTris(0.07,0.035,0.06,9,6),mat(0,0.03,0),lin(0xb8501e),o);for(const s of[1,-1]){add(h,ellipTris(0.028,0.018,0.035,7,5),mat(s*0.075,0.04,0.06,0,s*0.6,0),lin(0xc85a24),o);
    for(let i=0;i<3;i++)add(h,boxTris(0.06,0.008,0.008),mat(s*0.085,0.02,-0.02+i*0.025,0,0,s*-0.5),lin(0xa8481a));
    add(h,cylTris(0.004,0.004,0.025,4),mat(s*0.02,0.05,0.045),lin(0x1a1a1a));}
  MESH.caranguejo=litMesh(h.data());});
DESENHO.opaco.push(function marBichos(Pg){if(MESH.golfinho)for(const q of DELF){if(q.t<0||q.t>q.dur)continue;const u=q.t/q.dur,y=marNivel()-0.4+Math.sin(u*Math.PI)*q.h;drawStat(Pg,MESH.golfinho,mat(q.x,y,q.z,-Math.cos(u*Math.PI)*0.9,q.yaw,0));}
  if(MESH.caranguejo)for(const c of CRABS){if(d2(c.x,c.z,cam.pos[0],cam.pos[2])>40*40)continue;drawStat(Pg,MESH.caranguejo,mat(c.x,c.y+0.005+(c.v>0?Math.abs(Math.sin(c.fase))*0.01:0),c.z,0,c.yaw,0,c.s,c.s,c.s));}});
/* ---------- gaivotas ---------- */
AVE_SP.gaivota={nome:'Gaivota',esc:3.1,grupo:[2,4],foge:10,voo:11,bate:9,hab:'mar',plana:true,corpo:[0.032,0.032,0.068],perna:0.03,cab:0.022,bico:[0.022,0.007],cauda:[0.03,0.04,0.1],asa:[0.15,0.05],dedos:false,
  cor:{corpo:0xf0f0ee,barriga:0xf6f6f4,asa:0x9aa2aa,cabeca:0xf4f4f2,bico:0xe8b830,perna:0xe0a040,cauda:0xf0f0ee,ponta:0x1a1a1a}};
{const _sc=SONS.aveCanto;SONS.aveCanto=function(A){if(A.extra!=='gaivota')return _sc.apply(this,arguments);const{voz,r}=A;for(let i=0;i<2+Math.floor(Math.random()*2);i++)voz(0.22,1500*r(),1100,2600,3600,0.18,i*0.28,0.35);};}
let gaivT=3;
PASSOS.push(dt=>{if(G.modo!=='jogo'||!P.alive)return;gaivT-=dt;if(gaivT>0)return;gaivT=4;if(!marEm(P.x,P.z)||costaD(P.x,P.z)<-70||(E.n||0)>0.6)return;
  const perto=AVES.filter(b=>b.sp==='gaivota'&&Math.hypot(b.x-P.x,b.z-P.z)<110);for(const b of perto)if(Math.random()<0.18&&Math.hypot(b.x-P.x,b.z-P.z)<70)sfx('aveCanto',b.x,b.z,0.55,'gaivota');
  if(perto.length>=4||AVES.length>40)return;const g=++aveGrupoId,z=P.z+(Math.random()-0.5)*50,c=marPonto(z,-4+Math.random()*30);
  for(let i=0;i<2+Math.floor(Math.random()*2);i++){const w=criarAve('gaivota',c[0],c[1],{g,st:'plana',cx:c[0]+(Math.random()-0.5)*8,cz:c[1]+(Math.random()-0.5)*8,ch:marNivel()+8+Math.random()*9,raio:9+Math.random()*12});w.y=w.ch;w.ang=Math.random()*6.283;}});
/* ---------- mergulho ---------- */
const MERG={folego:30,vel:1.5,sobe:1.9,boia:0.35};
function folegoMax(){return MERG.folego*(invCount('mascaraMergulho')?2:1);}
{const _np=nadoPasso;nadoPasso=function(dt){if(P.escala){P.nada=null;P.mergulho=0;return false;}const r=_np.apply(this,arguments);if(!r||!P.nada){if(!P.nada){P.mergulho=0;if(P.folego!==undefined&&P.folego<folegoMax())P.folego=Math.min(folegoMax(),P.folego+dt*6);}return r;}
  const niv=aguaNivel(P.x,P.z);if(niv===null)return r;const max=Math.max(0,niv-1.32-(ground(P.x,P.z)+0.5));let m=P.mergulho||0;const K=IN.keys||{};
  if(K.KeyC)m+=MERG.vel*dt;else if(K.Space)m-=MERG.sobe*dt;else m-=MERG.boia*dt;m=clamp(m,0,max);P.mergulho=m;
  if(m>0.01){P.y-=m;P.ch.y-=m;P.ch.pitch=K.KeyC?0.6:K.Space?-0.6:P.ch.pitch;}
  const fm=folegoMax();if(P.folego===undefined)P.folego=fm;
  if(m>0.5){P.folego=Math.max(0,P.folego-dt);if(!G.dicas.mergulho){G.dicas.mergulho=1;dica('mergulho','corpo','Mergulhando! Espaço sobe, C desce. Fique de olho no fôlego: acabando, você se afoga.');}
    if(P.folego<=0){P.vida-=8*dt;if(Math.random()<dt*2)sfx('bolhas',P.x,P.z,0.6);if(P.vida<=0){G.causa='afogado';morrer();}}
    else if(Math.random()<dt*0.8)part(P.x,P.y+1.6,P.z,0,1.2,0,1.2,0.04,[0.85,0.92,1,0.7],false,-2);}
  else P.folego=Math.min(fm,P.folego+dt*6);
  return r;};}
{const el=document.createElement('div');el.id='folego-hud';el.hidden=true;el.setAttribute('aria-label','Fôlego');
  el.style.cssText='position:fixed;left:50%;top:92px;transform:translateX(-50%);width:180px;height:10px;border-radius:6px;background:rgba(10,20,30,.55);border:1px solid rgba(160,210,240,.6);z-index:5;pointer-events:none;overflow:hidden';
  el.innerHTML='<div style="height:100%;width:100%;background:linear-gradient(90deg,#5ab0e0,#a8e0ff);transition:width .2s"></div>';document.body.appendChild(el);}
let folHudT=0;
HUDS.push(()=>{folHudT-=1;if(folHudT>0)return;folHudT=4;const el=$('folego-hud');if(!el)return;const fm=folegoMax(),mostra=G.modo==='jogo'&&!!P.nada&&(P.mergulho>0.3||(P.folego!==undefined&&P.folego<fm-0.5));
  if(el.hidden===mostra)el.hidden=!mostra;if(!mostra)return;const f=clamp((P.folego??fm)/fm,0,1),b=el.firstChild;b.style.width=Math.round(f*100)+'%';b.style.background=f<0.25?'linear-gradient(90deg,#e05a3a,#ff9a6a)':'linear-gradient(90deg,#5ab0e0,#a8e0ff)';});
V8.novo.mergulho=()=>{P.folego=undefined;P.mergulho=0;CRABS.length=0;DELF.length=0;};
V8.carregar.mergulho=()=>{P.folego=undefined;P.mergulho=0;CRABS.length=0;DELF.length=0;};
/* ---------- sons: ondas na beira e o casco do navio rangendo ---------- */
SONS.ondas=({noise})=>{noise(1.9,'lowpass',900,260,0.9,0.5);noise(1.2,'bandpass',1800,600,1.4,0.18,0.5);};
SONS.casco=({tone,noise})=>{tone(1.1,'sawtooth',62,48,0.06);noise(0.8,'lowpass',300,120,0.8,0.12,0.2);};
let ondaT=0,cascoT=8;
PASSOS.push(dt=>{if(G.modo!=='jogo'||!P.alive)return;ondaT-=dt;cascoT-=dt;if(!marEm(P.x,P.z))return;
  if(ondaT<=0){ondaT=2.6+Math.random()*2.2;const L=marLinhaD(P.z),d=costaD(P.x,P.z),dist=Math.abs(d-L);if(dist<90){const n=costaN(P.z),p=marPonto(P.z,L);sfx('ondas',p[0],p[1],clamp(1.15-dist/80,0.1,1)*(1+marOndaA()));}}
  if(cascoT<=0){cascoT=9+Math.random()*12;if(Math.hypot(P.x-NAV.x,P.z-NAV.z)<45)sfx('casco',NAV.x,NAV.z,0.5);}});
/* ---------- construções: deque no mar, píer e a areia que a maré cobre ---------- */
{const _ad=OBRAS.deque.alvo;OBRAS.deque.alvo=function(x,z,yaw){const f=[Math.sin(P.yaw),Math.cos(P.yaw)];let mar=false;for(let s=0.6;s<=4;s+=0.4){if(aguaDoMar(P.x+f[0]*s,P.z+f[1]*s)){mar=true;break;}}
  if(!mar)return _ad.apply(this,arguments);
  const r={x,z,y:ground(x,z),yaw:Math.atan2(f[0],f[1])},no=m=>Object.assign(r,{ok:false,motivo:m});let A=null;
  for(let s=0.6;s<=4.5;s+=0.2){const px=P.x+f[0]*s,pz=P.z+f[1]*s;if(aguaProf(px,pz)>0.12||ground(px,pz)<MAR_ALTO()-0.3){A=[P.x+f[0]*(s-0.5),P.z+f[1]*(s-0.5)];break;}}
  if(!A)return no('O deque vai na beira, saindo para a água: olhe para o mar de perto');
  const gA=ground(A[0],A[1]),c=[A[0]+f[0]*DQ.l/2,A[1]+f[1]*DQ.l/2];let mol=0;const p={x:c[0],z:c[1],yaw:r.yaw};
  for(let i=-1;i<=1;i++)for(let j=-2;j<=2;j++){const w=localW(p,i*1.2,j*0.95);if(ground(w[0],w[1])<MAR_ALTO()-0.15)mol++;}
  if(mol<6)return no('Pouca água embaixo: avance o deque para dentro do mar');if(!dentroMapa(c[0],c[1],2))return no('Longe demais');
  const nv=MAR_ALTO(),y=Math.max(nv+0.45,gA-0.15);if(y-gA>2.6)return no('Alto demais aqui: procure a beira mais rasa');
  Object.assign(r,{x:c[0],z:c[1],y,ext:{nv:+nv.toFixed(2),y0:+gA.toFixed(2),mar:1}});
  for(const[lx,lz]of[[0,0],[1.2,1.6],[-1.2,1.6],[1.2,-1.4],[-1.2,-1.4]]){const w=localW(r,lx,lz);if(pointBlocked(w[0],w[1],0.3))return no('Tem coisa no caminho');}
  if(OB.some(q=>(q.tipo==='deque'||q.tipo==='ponteMadeira'||q.tipo==='pier')&&d2(q.x,q.z,r.x,r.z)<5*5))return no('Encosta em outra ponte, píer ou deque');
  r.ok=true;return r;};
 OBRAS.deque.desc='Piso de madeira sobre estacas, saindo da margem para a água (rio, lago ou mar). No mar fica alto o bastante para a maré alta.';}
OBRAS.pier={nome:'Píer',icon:'i-pier',custo:{tabuas:6,madeira:3,pregos:4},hp:520,hw:1.2,hd:3,solid:false,etapa:2,
  desc:'Passarela de madeira sobre estacas que vai mar adentro (também no rio e no lago), em trechos de 6 m. Comece na beira olhando para a água; para emendar, fique na ponta do píer e olhe para a frente.'};
OBRA_ORDEM.push('pier');if(!OBRAS_CHAO.includes('pier'))OBRAS_CHAO.push('pier');{const c=OBRA_CATS.find(q=>q.id==='agua');if(c&&!c.t.includes('pier'))c.t.push('pier');}
BASE_DICAS.pier='Píer pronto: vá até a ponta e construa outro trecho olhando para a frente (até 12). Da ponta dá para pescar longe (cavala e garoupa).';
const PIER={w:2.4,l:6,max:12};
function alvoPier(x,z,yaw){const f=[Math.sin(P.yaw),Math.cos(P.yaw)],r={x,z,y:ground(x,z),yaw:Math.atan2(f[0],f[1])},no=m=>Object.assign(r,{ok:false,motivo:m});
  const s=supEm(P.x,P.z,P.y,0.35),base=s&&s.dono&&typeof s.dono==='object'&&(s.dono.tipo==='pier'||s.dono.tipo==='deque')?s.dono:null;let A,y,nv,mar,n=1;
  if(base){const L=base.tipo==='pier'?PIER.l:DQ.l,ponta=[base.x+Math.sin(base.yaw)*L/2,base.z+Math.cos(base.yaw)*L/2];
    if(Math.hypot(P.x-ponta[0],P.z-ponta[1])>2.8)return no('Para emendar, vá até a ponta do píer');
    if(Math.abs(angDiff(P.yaw,base.yaw))>1.0)return no('Olhe para fora, na direção do píer');
    n=((base.ext&&base.ext.n)||1)+1;if(n>PIER.max)return no('O píer já está comprido demais (até '+PIER.max+' trechos)');
    r.yaw=base.yaw;A=ponta;y=base.y;mar=!!(base.ext&&base.ext.mar);nv=base.ext&&base.ext.nv;}
  else{for(let s2=0.6;s2<=4.5;s2+=0.2){const px=P.x+f[0]*s2,pz=P.z+f[1]*s2,ehMar=aguaDoMar(px,pz)||(marEm(px,pz)&&costaD(px,pz)>-MAR.largMax&&ground(px,pz)<MAR_ALTO()-0.3);
      if(ehMar||aguaProf(px,pz)>0.12){A=[P.x+f[0]*(s2-0.5),P.z+f[1]*(s2-0.5)];mar=ehMar;break;}}
    if(!A)return no('O píer começa na beira: olhe para a água de perto');const gA=ground(A[0],A[1]);
    if(mar){nv=MAR_ALTO();y=Math.max(nv+0.5,gA-0.1);}else{nv=aguaNivel(A[0]+f[0]*2.5,A[1]+f[1]*2.5);if(nv===null)return no('Pouca água: avance para dentro do rio ou do lago');y=Math.max(nv+0.45,gA-0.15);}
    if(y-gA>2.6)return no('A margem é alta demais aqui');}
  const c=[A[0]+Math.sin(r.yaw)*PIER.l/2,A[1]+Math.cos(r.yaw)*PIER.l/2];let mol=0;
  for(let j=-2;j<=2;j++){const w=[c[0]+Math.sin(r.yaw)*j*1.3,c[1]+Math.cos(r.yaw)*j*1.3],g=ground(w[0],w[1]);if(mar?g<MAR_ALTO()-0.1:aguaProf(w[0],w[1])>0.1)mol++;}
  if(mol<2)return no(mar?'Pouca água embaixo: o píer vai mar adentro':'Pouca água embaixo');
  if(!dentroMapa(c[0],c[1],1))return no('Longe demais');
  for(const[lx,lz]of[[0,0],[0.9,2.6],[-0.9,2.6],[0.9,-2.2],[-0.9,-2.2]]){const w=localW({x:c[0],z:c[1],yaw:r.yaw},lx,lz);if(pointBlocked(w[0],w[1],0.25))return no('Tem coisa no caminho');}
  if(OB.some(q=>q!==base&&(q.tipo==='pier'||q.tipo==='deque'||q.tipo==='ponteMadeira')&&d2(q.x,q.z,c[0],c[1])<3.6*3.6))return no('Já tem píer aqui');
  Object.assign(r,{x:c[0],z:c[1],y,ext:{nv:+(nv??0).toFixed(2),y0:+ground(A[0],A[1]).toFixed(2),mar:mar?1:0,n,emenda:base?1:0}});r.ok=true;return r;}
OBRAS.pier.alto='pier';if(!OBRAS_ALTO.includes('pier'))OBRAS_ALTO.push('pier');
{const _ma=montarAlto;montarAlto=function(o,D,e){if(D.alto!=='pier')return _ma.apply(this,arguments);o.ext=Object.assign({},e);pierMontar(o);};}
{const _oaa=obraAlvoAlto;obraAlvoAlto=function(D){if(D!==OBRAS.pier)return _oaa.apply(this,arguments);const r=alvoPier(P.x,P.z,P.yaw);
  OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':(r.motivo||'Não cabe aqui');OBRA.ok=!!r.ok&&invHas(custoObra(OBRA.tipo));};}
/* em cima do píer e do deque: valem as coisas pequenas (baú, lamparina...) como numa plataforma, e emendar o píer */
const pisoAgua=s=>s&&s.dono&&typeof s.dono==='object'&&(s.dono.tipo==='pier'||s.dono.tipo==='deque');
{const _co=contextoObra;contextoObra=function(){if(pisoAgua(supEm(P.x,P.z,P.y,0.25)))return'alto';return _co.apply(this,arguments);};
 const _pn=pequenoNoAlto;pequenoNoAlto=function(D,x,z,yaw){const r=_pn.apply(this,arguments);if(r.ok)return r;const y=chaoEm(x,z,P.y+0.4);let dono=null;
   for(const p of cantos(x,z,yaw,D.hw,D.hd)){const s=supEm(p[0],p[1],y,0.12);if(!pisoAgua(s))return r;dono=s.dono;}
   for(const p of[[x,z],...cantos(x,z,yaw,D.hw*0.9,D.hd*0.9)])if(bloqueadoAlto(p[0],p[1],0.08,y))return{y,ok:false,motivo:'Tem coisa no caminho'};
   if(Math.hypot(P.x-x,P.z-z)<D.hw+0.45)return{y,ok:false,motivo:'Perto demais de você'};return{y,ok:true,dono};};}
function geoPier(e,o){const g=new GB(8192,8),R=rng(Math.round(((o&&o.x)||1)*100+((o&&o.z)||0)*7)),C=k=>lin(COR_CASA[k]),W=PIER.w,L=PIER.l;
  for(let i=0;i<20;i++){const z=-L/2+(i+0.5)*L/20;add(g,boxTris(W,0.06,L/20*0.86),mat(0,-0.03,z),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  for(const x of[-W/2+0.12,W/2-0.12])add(g,boxTris(0.14,0.16,L),mat(x,-0.14,0),C('esc'),{j:0.06,rnd:R});
  for(const x of[-W/2+0.1,W/2-0.1])for(const z of[-L/2+0.25,0,L/2-0.25]){let gy=-3;if(o){const w=localW(o,x,z);gy=ground(w[0],w[1])-o.y;}if(gy>-0.2)continue;add(g,cylTris(0.1,0.12,-gy+0.25,7),mat(x,gy-0.1,z),C('esc'),{j:0.06,rnd:R});}
  add(g,cylTris(0.12,0.14,0.5,8),mat(W/2-0.25,0,L/2-0.3),C('esc'));add(g,cylTris(0.17,0.17,0.06,8),mat(W/2-0.25,0.5,L/2-0.3),C('esc2'));
  {const fundo=o?Math.max(ground(...localW(o,W/2+0.2,L/2-0.7))-o.y,-3.2):-2.2;for(const dz of[-0.95,-0.45])add(g,boxTris(0.06,-fundo+0.1,0.06),mat(W/2+0.2,fundo/2,L/2+dz),C('esc'));
   for(let yy=-0.3;yy>fundo;yy-=0.35)add(g,boxTris(0.05,0.04,0.5),mat(W/2+0.2,yy,L/2-0.7),C('esc2'));}
  if(e&&o&&!e.emenda&&o.y-e.y0>0.5){const h=o.y-e.y0;add(g,boxTris(1.2,0.06,Math.hypot(1.4,h)),mat(0,-h/2,-L/2-0.65,-Math.atan2(h,1.4),0,0),C('mad'),{j:0.08,rnd:R});}
  return g.data();}
function pierMontar(o){const e=o.ext||{},W=PIER.w,L=PIER.l;o.sups=[supAdd({t:'ret',x:o.x,z:o.z,hw:W/2,hd:L/2,yaw:o.yaw,y:o.y,dono:o})];
  if(!e.emenda&&o.y-(e.y0??o.y)>0.5){const w=localW(o,0,-L/2-0.7);o.sups.push(supAdd({t:'ram',x:w[0],z:w[1],hw:0.6,hd:0.72,yaw:o.yaw,ya:e.y0,yb:o.y,dono:o}));}
  o.cols=[];for(const x of[-W/2+0.1,W/2-0.1])for(const z of[-L/2+0.25,L/2-0.25]){const w=localW(o,x,z),gy=ground(w[0],w[1]);if(o.y-gy<0.4)continue;o.cols.push(colCircle(w[0],w[1],0.13,{solid:true,obra:o,y0:gy-1,y1:o.y-0.12}));}
  {const ag=e.mar?marNivel():aguaNivel(o.x,o.z),y0=(ag??(o.y-1))-1.32,a=localW(o,W/2+0.55,L/2-0.7),t=localW(o,W/2-0.7,L/2-0.7),rumo=o.yaw-Math.PI/2;
   const v=viaReta(...localW(o,W/2+0.2,L/2-0.7),y0,o.y,rumo,{x:a[0],y:y0,z:a[1]},{x:t[0],y:o.y,z:t[1],rumo},o);v.mar=!!e.mar;VIAS.push(v);o.via=v;}
  o.mesh=litMesh(geoPier(e,o));}
OBRAS.pier.montar=pierMontar;
/* o pé das escadas do mar acompanha a maré */
PASSOS.push(()=>{const y0=marNivel()-1.32;for(const v of VIAS)if(v.mar){v.y0=y0;v.base.y=y0;}});
/* nadando junto de uma borda baixa (cais, píer, deque, na maré alta): sobe direto */
INTERS.push(tryIt=>{if(!P.nada||!P.alive||(P.mergulho||0)>0.4)return;const niv=aguaNivel(P.x,P.z);if(niv===null)return;const fx=Math.sin(P.body),fz=Math.cos(P.body);
  for(const d of[0.7,1.1,1.5]){const x=P.x+fx*d,z=P.z+fz*d,h=chaoEm(x,z,niv+1.15),s=supEm(x,z,h,0.05);if(!s||h<niv+0.15||h>niv+1.1)continue;tryIt({k:'subirBorda',o:{x,y:h,z}},x,z,1.8,2.2,-0.3);return;}});
INTER_K.subirBorda={texto:()=>({t:'Subir',s:'sair da água'}),usar:o=>{P.nada=null;P.mergulho=0;P.x=o.x;P.z=o.z;P.y=o.y+0.02;P.vx=P.vz=0;P.vy=0;P.noChao=true;P.ch.pitch=0;sfx('nado',P.x,P.z,0.5);
  if(P.ch&&P.ch.sk){P.y=o.y-0.45;comecarMuro({x:o.x,z:o.z,y:o.y+0.02,yaw:P.body},'chegada');}}};
{const _fa=fantasmaAlto;fantasmaAlto=function(){if(OBRA.tipo==='pier'&&OBRA.ext){const e=OBRA.ext,k='pier:'+[OBRA.x,OBRA.z,OBRA.y,OBRA.yaw,e.y0,e.emenda].map(v=>(+v||0).toFixed(1)).join();
    if(k!==fantasmaK){if(fantasmaM)liberarMesh(fantasmaM);fantasmaM=meshAlto(geoPier(Object.assign({},e),{x:OBRA.x,y:OBRA.y,z:OBRA.z,yaw:OBRA.yaw}));fantasmaK=k;}return fantasmaM;}return _fa.apply(this,arguments);};}
/* na areia que a maré alta cobre, só as construções de água */
const OBRAS_AGUA=new Set(['deque','pier','ponteMadeira','jangada']);
{const _oa=obraAlvo;obraAlvo=function(){_oa.apply(this,arguments);if(!OBRA.ok||OBRAS_AGUA.has(OBRA.tipo)||OBRA.ctx!=='chao')return;const D=OBRAS[OBRA.tipo];if(D&&D.alto)return;
  if(marEm(OBRA.x,OBRA.z)&&costaD(OBRA.x,OBRA.z)>-MAR.largMax-2&&ground(OBRA.x,OBRA.z)<MAR_ALTO()&&caisAlt(OBRA.x,OBRA.z)<-1e8){OBRA.ok=false;OBRA.motivo='A maré alta cobre aqui: construa mais para cima da praia';hudMotivo();}};}

/* ================= construções no alto: plataforma, parapeito, parede, escada de corda, ponte de corda, telhado e lamparina =================
   Usam as superfícies e rotas de 12_altura.js. Uma plataforma só nasce com apoio de verdade: galho grosso ou tronco de árvore gigante,
   chão plano, ou encostada numa plataforma com apoio (no máximo 2 encaixes de distância). Beirada, escada, telhado, baú e lamparina vão sobre plataformas. */
const ALTO_CFG={lado:3,vizMax:2,ponteMin:3,ponteMax:16,ponteDy:2.6,escMin:1.4,escMax:18};
Object.assign(OBRAS,{
  plataforma:{nome:'Plataforma',icon:'i-plataforma',custo:{tabuas:6,corda:2,pregos:4},hp:260,hw:1.5,hd:1.5,solid:false,alto:'plat',etapa:2},
  parapeito:{nome:'Parapeito',icon:'i-parapeito',custo:{tabuas:2,corda:1},hp:120,hw:1.5,hd:0.08,solid:true,alto:'borda',etapa:2},
  paredeAlta:{nome:'Parede de tábuas',icon:'i-parede',custo:{tabuas:5,pregos:2},hp:220,hw:1.5,hd:0.08,solid:true,alto:'borda',etapa:2},
  escadaCorda:{nome:'Escada de corda',icon:'i-escada',custo:{corda:4,tabuas:2},hp:90,hw:0.4,hd:0.15,solid:false,alto:'borda',escada:true,etapa:2},
  ponteCorda:{nome:'Ponte de corda',icon:'i-ponte',custo:{corda:6,tabuas:6},hp:160,hw:0.7,hd:1,solid:false,alto:'ponte',etapa:3},
  telhado:{nome:'Telhado',icon:'i-telhado',custo:{tabuas:6,fibra:6},hp:140,hw:1.6,hd:1.6,solid:false,alto:'teto',etapa:2},
  lamparina:{nome:'Lamparina',icon:'i-lamparina',custo:{sucata:2,pano:1,graveto:2},hp:60,hw:0.2,hd:0.2,solid:false,luz:true,lamp:true,peq:true,etapa:2},
  prancha:{nome:'Prancha entre telhados',icon:'i-tabuas',custo:{tabuas:6,pregos:4,corda:1},hp:200,hw:0.4,hd:1,solid:false,alto:'prancha',etapa:1}
});
OBRA_ORDEM.push('plataforma','parapeito','paredeAlta','escadaCorda','ponteCorda','telhado','lamparina','prancha');
const OBRAS_CHAO=['barricada','muro','muroPedra','estacas','portao','fogueira','bau','lamparina','plataforma'];
const OBRAS_ALTO=['plataforma','parapeito','paredeAlta','escadaCorda','ponteCorda','telhado','bau','lamparina'];
const lugarAlto=()=>contextoObra()==='alto';
const obrasVisiveis=()=>{const c=contextoObra();return c==='alto'?OBRAS_ALTO:c==='predio'?OBRAS_PREDIO:c==='telhado'?OBRAS_TELHADO:OBRAS_CHAO;};
/* ponto (px,pz) dentro do retângulo (x,z,giro,meia-largura,meia-profundidade) com folga m */
function noRet(px,pz,x,z,yaw,hw,hd,m){const c=Math.cos(yaw),s=Math.sin(yaw),dx=px-x,dz=pz-z,lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<=hw+m&&Math.abs(lz)<=hd+m;}
function cantos(x,z,yaw,hw,hd){const c=Math.cos(yaw),s=Math.sin(yaw);return[[hw,hd],[-hw,hd],[hw,-hd],[-hw,-hd]].map(([lx,lz])=>[x+lx*c+lz*s,z-lx*s+lz*c]);}
const galhoEm=(b,t)=>[b.ax+(b.bx-b.ax)*t,topoGalho(b,t),b.az+(b.bz-b.az)*t];
/* colisor bloqueando um ponto na altura y (os sem faixa de altura valem para qualquer altura) */
function bloqueadoAlto(x,z,r,y){for(const c of colQuery(x,z,r+1)){if(!c.solid)continue;if(c.y1!==undefined&&(y>=c.y1-0.05||y+1.5<=c.y0))continue;if(c.y1===undefined&&y<-20)continue;
  if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return c;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-cx,lz-cz)<r)return c;}}return null;}

/* ---------- apoio ---------- */
function apoioPlat(x,z,yaw,y,k){k=k||1;const h=ALTO_CFG.lado/2*k;let gmin=1e9,gmax=-1e9;
  if(pilarSob(x,z,yaw,y,k))return{t:'pilar',y};   // pilar de madeira embaixo (48yd)
  for(const p of[[x,z],...cantos(x,z,yaw,h,h)]){const g=ground(p[0],p[1]);gmin=Math.min(gmin,g);gmax=Math.max(gmax,g);}
  {const s=supEm(x,z,y,0.5);if(s&&s.dono&&s.dono.andares&&y-s.y<0.5)return{t:'chao',y:s.y+0.12};}
  if(y-gmax<0.45)return gmax-gmin<0.8?{t:'chao',y:gmax+0.12}:null;
  for(const T of GIGANTES){if(d2(T.x,T.z,x,z)>(T.R+16)**2)continue;
    if(y>T.y+2.2&&y<T.y+T.H*0.8&&noRet(T.x,T.z,x,z,yaw,h,h,T.R*0.85))return{t:'tronco'};
    for(const b of T.galhos)for(let t=0;t<=1.001;t+=0.08){const p=galhoEm(b,t);if(noRet(p[0],p[2],x,z,yaw,h,h,0.25)){const d=y-p[1];if(d>-0.3&&d<1.1)return{t:'galho'};}}}
  return null;}
/* topo mais alto de galho, raiz ou tronco caído dentro da área da plataforma (entre yMin e yMax): o piso precisa ficar por cima */
function topoSob(x,z,yaw,yMin,yMax,k){k=k||1;let best=-1e9;const c=Math.cos(yaw),s=Math.sin(yaw);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const lx=(-1.4+i*0.7)*k,lz=(-1.4+j*0.7)*k,px=x+lx*c+lz*s,pz=z-lx*s+lz*c,l=SGRID.get(skey(Math.floor(px/SCELL),Math.floor(pz/SCELL)));
    if(l)for(const sp of l){if(typeof sp.dono!=='string')continue;const h=alturaSup(sp,px,pz);if(h!==null&&h>=yMin&&h<=yMax&&h>best)best=h;}}return best;}
/* refaz o nível de apoio de todas as plataformas (busca a partir das que têm apoio direto); devolve as que ficaram soltas */
function revalidarPlats(){const L=ALTO_CFG.lado,ps=OB.filter(o=>o.tipo==='plataforma');for(const p of ps)p.nivel=p.apoio==='vizinha'||(p.apoio==='pilar'&&!pilarSob(p.x,p.z,p.yaw,p.y,modK(p)))?99:0;
  for(let it=0;it<6;it++)for(const p of ps){if(!p.nivel)continue;for(const q of ps)if(q!==p&&q.nivel<p.nivel-1&&Math.abs(q.y-p.y)<0.35&&Math.abs(Math.hypot(q.x-p.x,q.z-p.z)-L*(modK(p)+modK(q))/2)<0.4)p.nivel=q.nivel+1;}
  return ps.filter(p=>p.nivel>ALTO_CFG.vizMax);}
/* um ponto (ponta de ponte) ainda tem onde se apoiar? */
function pontaApoiada(x,z,y){for(const o of OB)if(o.tipo==='plataforma'&&Math.abs(o.y-y)<0.45&&noRet(x,z,o.x,o.z,o.yaw,1.5*modK(o),1.5*modK(o),0.6))return true;
  const l=SGRID.get(skey(Math.floor(x/SCELL),Math.floor(z/SCELL)));if(l)for(const s of l)if(typeof s.dono==='string'){const h=alturaSup(s,x,z);if(h!==null&&Math.abs(h-y)<0.6)return true;}
  return false;}

/* ---------- mira de cada tipo ---------- */
function alvoPlat(f){const L=ALTO_CFG.lado,rx=P.x+f[0]*2.0,rz=P.z+f[2]*2.0;let best=null,bd=2.3*2.3,r;
  for(const o of OB){if(o.tipo!=='plataforma'||Math.abs(o.y-P.y)>0.8||d2(o.x,o.z,P.x,P.z)>81)continue;
    for(let k=0;k<4;k++){const ko=modK(o),a=o.yaw+k*Math.PI/2,x=o.x+Math.sin(a)*L*ko,z=o.z+Math.cos(a)*L*ko,d=d2(x,z,rx,rz);if(d<bd){bd=d;best={x,z,y:o.y,yaw:o.yaw,viz:o,k:ko};}}}
  if(!best){const pc=alvoCelulaPilar(rx,rz);if(pc)best={x:pc.x,z:pc.z,y:pc.y,yaw:pc.yaw,viz:null,k:pc.k||1};}   // em cima dos pilares (48yd)
  if(best){const kk=best.k||1,ap=apoioPlat(best.x,best.z,best.yaw,best.y,kk),direto=ap&&(ap.t!=='chao'||Math.abs(ap.y-best.y)<0.2),nivel=direto?0:((best.viz&&best.viz.nivel)||0)+1;
    r={x:best.x,z:best.z,y:best.y,yaw:best.yaw,ext:modExt(kk,{apoio:direto?ap.t:'vizinha',nivel})};
    if(nivel>ALTO_CFG.vizMax)return Object.assign(r,{ok:false,motivo:'Longe demais de um apoio: precisa de galho ou tronco embaixo'});
    if(topoSob(r.x,r.z,r.yaw,r.y-0.02,r.y+1.2,kk)>r.y-0.02)return Object.assign(r,{ok:false,motivo:'Um galho atravessa esse lugar'});}
  else{const yaw=P.yaw+OBRA.rot,x=Math.round(rx*4)/4,z=Math.round(rz*4)/4,ap=apoioPlat(x,z,yaw,P.y);
    if(!ap)return{x,z,y:P.y,yaw,ok:false,motivo:lugarAlto()?'Sem apoio: mire um galho grosso, o tronco ou encoste em outra plataforma':'O chão aqui é torto demais'};
    r={x,z,y:ap.t==='chao'?ap.y:P.y,yaw,ext:{apoio:ap.t,nivel:0}};
    /* o piso fica por cima do galho que passa embaixo (ou da raiz, no chão) para ser plano */
    const top=topoSob(x,z,yaw,r.y-1.2,r.y+1.0);if(top+0.03>r.y){const sobe=top+0.03-r.y;if(sobe>(ap.t==='chao'?0.4:0.75))return Object.assign(r,{ok:false,motivo:ap.t==='chao'?'Raiz ou tronco no caminho':'Galho grosso no caminho: mire mais à frente ou de lado'});r.y=top+0.03;}}
  const kr=modK(r);for(const o of OB)if(o.tipo==='plataforma'&&Math.abs(o.y-r.y)<2.2&&d2(o.x,o.z,r.x,r.z)<(L*0.95*(modK(o)+kr)/2)**2)return Object.assign(r,{ok:false,motivo:'Encavala em outra plataforma'});
  for(const p of cantos(r.x,r.z,r.yaw,1.2*kr,1.2*kr))if(bloqueadoAlto(p[0],p[1],0.05,r.y+0.3)&&!GIGANTES.some(T=>Math.hypot(p[0]-T.x,p[1]-T.z)<T.R+0.4))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho'});
  if(!dentroMapa(r.x,r.z,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});
  r.ok=true;return r;}
function alvoBorda(D,f){const ax=P.x+f[0]*1.3,az=P.z+f[2]*1.3;let best=null,bd=1e9;
  for(const o of OB){if(o.tipo!=='plataforma'||Math.abs(o.y-P.y)>0.8||d2(o.x,o.z,P.x,P.z)>36)continue;
    for(let k=0;k<4;k++){const ko=modK(o),a=o.yaw+k*Math.PI/2,x=o.x+Math.sin(a)*1.5*ko,z=o.z+Math.cos(a)*1.5*ko,nx=o.x+Math.sin(a)*3*ko,nz=o.z+Math.cos(a)*3*ko;
      if(OB.some(p=>p!==o&&p.tipo==='plataforma'&&d2(p.x,p.z,nx,nz)<0.5&&Math.abs(p.y-o.y)<0.3))continue;   // beirada interna (encostada em outra plataforma)
      const d=d2(x,z,ax,az);if(d<bd){bd=d;best={x,z,y:o.y,yaw:a,plat:o};}}}
  if(!best||bd>3*3){const x=P.x+f[0]*1.6,z=P.z+f[2]*1.6;return{x,z,y:P.y,yaw:P.yaw,ok:false,motivo:'Fique numa plataforma e mire a beirada dela'};}
  const r={x:best.x,z:best.z,y:best.y,yaw:best.yaw,ext:D.escada?undefined:modExt(modK(best.plat),undefined)};
  if(OB.some(p=>OBRAS[p.tipo].alto==='borda'&&d2(p.x,p.z,r.x,r.z)<0.5&&Math.abs(p.y-r.y)<0.5))return Object.assign(r,{ok:false,motivo:'Essa beirada já está ocupada'});
  if(OB.some(p=>p.tipo==='escadaMadeira'&&d2(p.x,p.z,r.x,r.z)<0.5&&Math.abs(p.y-r.y)<0.5))return Object.assign(r,{ok:false,motivo:'Essa beirada tem a escada de madeira'});
  if(D.escada){const ox=r.x+Math.sin(r.yaw)*0.95,oz=r.z+Math.cos(r.yaw)*0.95,h=r.y-ground(ox,oz);
    if(h<ALTO_CFG.escMin)return Object.assign(r,{ok:false,motivo:'Baixo demais para escada'});if(h>ALTO_CFG.escMax)return Object.assign(r,{ok:false,motivo:'Alto demais: a corda não chega no chão'});
    if(pointBlocked(ox,oz,0.35))return Object.assign(r,{ok:false,motivo:'O pé da escada cai num obstáculo'});}
  r.ok=true;return r;}
function alvoTeto(){let best=null,bd=4.5*4.5;for(const o of OB){if(o.tipo!=='plataforma'||Math.abs(o.y-P.y)>0.8)continue;const d=d2(o.x,o.z,P.x,P.z);if(d<bd){bd=d;best=o;}}
  if(!best)return{x:P.x,z:P.z,y:P.y,yaw:P.yaw,ok:false,motivo:'O telhado vai em cima de uma plataforma'};
  const r={x:best.x,z:best.z,y:best.y,yaw:best.yaw,ext:modExt(modK(best),undefined)};
  if(OB.some(o=>o.tipo==='telhado'&&d2(o.x,o.z,r.x,r.z)<0.3&&Math.abs(o.y-r.y)<0.3))return Object.assign(r,{ok:false,motivo:'Essa plataforma já tem telhado'});
  r.ok=true;return r;}
function alvoPonte(f){const C=ALTO_CFG,x0=P.x+f[0]*1.2,z0=P.z+f[2]*1.2;
  if(!lugarAlto())return{x:x0,z:z0,y:P.y,yaw:P.yaw,ok:false,motivo:'A ponte liga lugares altos: suba numa plataforma ou galho'};
  let ax=P.x,az=P.z;for(let s=0.25;s<=4;s+=0.25){const x=P.x+f[0]*s,z=P.z+f[2]*s;if(chaoEm(x,z,P.y+0.3)<P.y-0.6)break;ax=x;az=z;}  // ponta onde o piso acaba
  const ay=P.y;let best=null,bs=-1e9,barrado=false;
  const cand=(x,y,z)=>{const dx=x-ax,dz=z-az,d=Math.hypot(dx,dz);if(d<C.ponteMin||d>C.ponteMax||Math.abs(y-ay)>C.ponteDy)return;const k=(dx*f[0]+dz*f[2])/d;if(k<0.9)return;
    const s=k*4-d*0.05-Math.abs(y-ay)*0.3;if(s<=bs)return;
    for(const T of GIGANTES)if(segDist(T.x,T.z,ax,az,x,z)<T.R+0.35&&Math.min(Math.hypot(ax-T.x,az-T.z),Math.hypot(x-T.x,z-T.z))>T.R+0.2){barrado=true;return;}  // ponto atrás de um tronco: escolhe outro
    bs=s;best=[x,y,z];};
  for(const o of OB)if(o.tipo==='plataforma'&&d2(o.x,o.z,ax,az)<(C.ponteMax+3)**2){for(let k=0;k<4;k++){const a=o.yaw+k*Math.PI/2;cand(o.x+Math.sin(a)*1.5,o.y,o.z+Math.cos(a)*1.5);}}
  for(const T of GIGANTES)if(d2(T.x,T.z,ax,az)<(C.ponteMax+10)**2)for(const b of T.galhos)for(let t=0.2;t<=0.96;t+=0.06){const p=galhoEm(b,t);cand(p[0],p[1],p[2]);}
  if(!best)return{x:x0,z:z0,y:P.y,yaw:P.yaw,ok:false,motivo:barrado?'O tronco atrapalha a ponte':'Mire uma plataforma ou galho grosso de outra árvore (3 a 16 m)'};
  const[bx,by,bz]=best,L=Math.hypot(bx-ax,bz-az),r={x:(ax+bx)/2,z:(az+bz)/2,y:(ay+by)/2,yaw:Math.atan2(bx-ax,bz-az),ext:{ax:+ax.toFixed(2),ay:+ay.toFixed(2),az:+az.toFixed(2),bx:+bx.toFixed(2),by:+by.toFixed(2),bz:+bz.toFixed(2)}};
  for(let i=1;i<10;i++){const t=i/10,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=ay+(by-ay)*t-0.3;if(bloqueadoAlto(x,z,0.4,y)&&!GIGANTES.some(T=>Math.hypot(x-T.x,z-T.z)<T.R+1))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho da ponte'});}
  if(L<C.ponteMin)return Object.assign(r,{ok:false,motivo:'Curta demais'});
  r.ok=true;return r;}
/* mira no modo de construção para os tipos do alto */
/* prancha entre telhados: atravessa o vão (1,2 a 6 m) até o telhado vizinho, com degraus de caixote para passar por cima das muretas.
   Zumbi não se equilibra numa prancha estreita: ela é rota de fuga só sua. */
function alvoPrancha(f){const s0=dentroCidade(P.x,P.z,4)?salaEm(P.x,P.y+0.3,P.z):null,pa=s0&&s0.tipo==='telhado'?s0.p:null,x0=P.x+f[0]*1.5,z0=P.z+f[2]*1.5;
  const falha=m=>({x:x0,z:z0,y:P.y,yaw:P.yaw,ok:false,motivo:m});if(!pa)return falha('A prancha liga um telhado a outro: suba num telhado');
  const ax=Math.abs(f[0])>=Math.abs(f[2]),dir=Math.sign(ax?f[0]:f[2])||1,lat=ax?P.z:P.x,wA=ax?(dir>0?pa.x1:pa.x0):(dir>0?pa.z1:pa.z0);
  let best=null,bg=1e9;
  for(const q of CID.predios){if(q===pa||!q.telhado)continue;const wB=ax?(dir>0?q.x0:q.x1):(dir>0?q.z0:q.z1),gap=(wB-wA)*dir;if(gap<1.2||gap>6)continue;
    const l0=Math.max(ax?pa.z0:pa.x0,ax?q.z0:q.x0)+0.9,l1=Math.min(ax?pa.z1:pa.x1,ax?q.z1:q.x1)-0.9;if(l1<l0)continue;
    const lc=clamp(lat,l0,l1);if(Math.abs(lc-lat)>2.5)continue;if(gap<bg){bg=gap;best={q,wB,lc,gap};}}
  if(!best)return falha('Mire um telhado vizinho a até 6 m, de frente para ele');
  const q=best.q,yA=pa.yTopo,yB=q.yTopo,tA=yA+(pa.andares>1?1.1:0.9)+0.08,tB=yB+(q.andares>1?1.1:0.9)+0.08;
  if(Math.abs(tA-tB)>1.8)return falha('O outro telhado é alto ou baixo demais');
  const W=(sv)=>ax?[sv,best.lc]:[best.lc,sv],mid=(wA+best.wB)/2,c=W(mid),yaw=Math.atan2(ax?dir:0,ax?0:dir);
  const e={ax:ax?1:0,dir,lc:+best.lc.toFixed(2),wA:+wA.toFixed(2),wB:+best.wB.toFixed(2),yA:+yA.toFixed(2),yB:+yB.toFixed(2),tA:+tA.toFixed(2),tB:+tB.toFixed(2),pa:pa.id,pb:q.id};
  const r={x:c[0],z:c[1],y:(tA+tB)/2,yaw,ext:e};
  // degraus e chegada livres dos dois lados (casinha da escada, caixa d'água, passarela...)
  for(const[sv,y]of[[wA-dir*2.0,yA],[wA-dir*1.3,yA],[best.wB+dir*1.3,yB],[best.wB+dir*2.0,yB]]){const w=W(sv);if(bloqueadoAlto(w[0],w[1],0.3,y+0.1))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho da prancha'});}
  if(OB.some(o=>o.tipo==='prancha'&&o.ext&&o.ext.ax===e.ax&&Math.abs(o.ext.lc-e.lc)<1.2&&Math.abs((o.ext.wA+o.ext.wB)-(e.wA+e.wB))<0.5))return Object.assign(r,{ok:false,motivo:'Já tem prancha aqui'});
  r.ok=true;return r;}
function pranchaSups(o,e){const W=(sv)=>e.ax?[sv,e.lc]:[e.lc,sv],yaw=Math.atan2(e.ax?e.dir:0,e.ax?0:e.dir),out=[];
  const ram=(s0,s1,ya,yb)=>{const c=W((s0+s1)/2);out.push(supAdd({t:'ram',x:c[0],z:c[1],hw:0.36,hd:Math.abs(s1-s0)/2,yaw,ya,yb,dono:o}));};
  ram(e.wA-e.dir*2.2,e.wA-e.dir*0.6,e.yA,e.tA);ram(e.wA-e.dir*0.6,e.wB+e.dir*0.6,e.tA,e.tB);ram(e.wB+e.dir*0.6,e.wB+e.dir*2.2,e.tB,e.yB);return out;}
function obraAlvoAlto(D){const f=lookDir(P.yaw,0);const r=D.alto==='plat'?alvoPlat(f):D.alto==='borda'?alvoBorda(D,f):D.alto==='ponte'?alvoPonte(f):D.alto==='prancha'?alvoPrancha(f):D.alto==='escadaM'?alvoEscadaMadeira(f):alvoTeto();
  OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':(r.motivo||'Não cabe aqui');OBRA.ok=!!r.ok&&invHas(custoObra(OBRA.tipo));}
/* baú e lamparina sobre plataforma: todos os cantos no piso da mesma plataforma, sem colisor na altura */
function pequenoNoAlto(D,x,z,yaw){const y=chaoEm(x,z,P.y+0.4);let dono=null;
  for(const p of cantos(x,z,yaw,D.hw,D.hd)){const s=supEm(p[0],p[1],y,0.12);if(!s||!s.dono||s.dono.tipo!=='plataforma')return{y,ok:false,motivo:'Precisa ficar inteiro em cima de uma plataforma'};dono=s.dono;}
  for(const p of[[x,z],...cantos(x,z,yaw,D.hw*0.9,D.hd*0.9)])if(bloqueadoAlto(p[0],p[1],0.08,y))return{y,ok:false,motivo:'Tem coisa no caminho'};
  if(Math.hypot(P.x-x,P.z-z)<D.hw+0.45)return{y,ok:false,motivo:'Perto demais de você'};
  return{y,ok:true,dono};}

/* ---------- montar e desmontar ---------- */
function montarAlto(o,D,e){o.ext=Object.assign({},e);
  if(D.alto==='plat'){const hk=1.5*modK(o);o.apoio=e.apoio||'galho';o.nivel=e.nivel||0;o.sup=supAdd({t:'ret',x:o.x,z:o.z,hw:hk,hd:hk,yaw:o.yaw,y:o.y,dono:o});
    const gmin=Math.min(...cantos(o.x,o.z,o.yaw,hk,hk).map(p=>ground(p[0],p[1])));if(o.y-gmin>0.6)o.col=colBox(o.x,o.z,hk,hk,o.yaw,{solid:true,obra:o,y0:o.y-0.24,y1:o.y});
    platFuros(o);}   // escada interna embaixo: abertura no piso (48ye)
  else if(o.tipo==='parapeito')o.col=colBox(o.x,o.z,1.5*modK(o),0.1,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+1.1});
  else if(o.tipo==='paredeAlta')o.col=colBox(o.x,o.z,1.5*modK(o),0.1,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+2.5*modKH(o)});
  else if(o.tipo==='janelaAlta')janelaAltaMontar(o);
  else if(D.alto==='escadaM')escadaMadMontar(o,e);
  else if(D.escada){const sa=Math.sin(o.yaw),ca=Math.cos(o.yaw),hx=o.x+sa*0.24,hz=o.z+ca*0.24,g=ground(hx,hz);o.h=o.y-g;
    const base={x:o.x+sa*0.95,y:ground(o.x+sa*0.95,o.z+ca*0.95),z:o.z+ca*0.95},topo={x:o.x-sa*0.75,y:o.y,z:o.z-ca*0.75,rumo:o.yaw+Math.PI};
    const v=viaReta(hx,hz,g,o.y,o.yaw+Math.PI,base,topo,o);v.recolhida=!!e.recolhida;o.via=v;VIAS.push(v);o.mesh=meshAlto(geoEscada(o.h));}
  else if(D.alto==='ponte'){const L=Math.hypot(e.bx-e.ax,e.bz-e.az)||1,ux=(e.bx-e.ax)/L,uz=(e.bz-e.az)/L;
    o.sup=supAdd({t:'seg',ax:e.ax-ux*0.35,az:e.az-uz*0.35,ay:e.ay,bx:e.bx+ux*0.35,bz:e.bz+uz*0.35,by:e.by,r0:0.62,r1:0.62,larg:1,topo:0,flecha:Math.min(0.45,L*0.025),dono:o});
    o.mesh=meshAlto(geoPonte(e,o.y));}
  else if(D.alto==='prancha'){o.sups=pranchaSups(o,e);o.mesh=meshAlto(geoPrancha(e,o.y));}}
function desmontarAlto(o){if(o.sup){supRemove(o.sup);o.sup=null;}if(o.sups){for(const q of o.sups)supRemove(q);o.sups=null;}
  if(o.via){const i=VIAS.indexOf(o.via);if(i>=0)VIAS.splice(i,1);if(P.escala&&P.escala.v===o.via){P.escala=null;P.noChao=false;P.vy=0;}o.via=null;}
  if(o.mesh){liberarMesh(o.mesh);o.mesh=null;}}
/* depois que uma obra some: o que estava em cima ou preso nela cai junto */
function quedaEmCadeia(o){if(o.tipo==='escadaInterna'){const p=platDaEscada(o);if(p)remontarPlat(p);return;}   // a abertura no piso fecha
  if(o.tipo!=='plataforma'&&o.tipo!=='pilar')return;const cair=[];
  if(o.tipo==='plataforma')for(const q of OB){const Dq=OBRAS[q.tipo];if(q.tipo==='plataforma')continue;
    if(q.tipo==='escadaMadeira'){if(!pontaApoiada(q.x-Math.sin(q.yaw)*0.3,q.z-Math.cos(q.yaw)*0.3,q.y))cair.push(q);continue;}
    if(q.tipo==='escadaInterna'){if(!platDaEscada(q))cair.push(q);continue;}
    if(q.tipo==='ponteCorda'){const e=q.ext;if(!pontaApoiada(e.ax,e.az,e.ay)||!pontaApoiada(e.bx,e.bz,e.by))cair.push(q);continue;}
    if((Dq.alto||Dq.bau||Dq.peq)&&Math.abs(q.y-o.y)<0.35&&noRet(q.x,q.z,o.x,o.z,o.yaw,1.5*modK(o),1.5*modK(o),0.15)&&!OB.some(p=>p!==o&&p.tipo==='plataforma'&&Math.abs(p.y-q.y)<0.35&&noRet(q.x,q.z,p.x,p.z,p.yaw,1.5*modK(p),1.5*modK(p),0.15)))cair.push(q);}
  for(const p of revalidarPlats())cair.push(p);
  for(const q of cair)if(OB.includes(q))destruirObra(q);}
function liberarMesh(m){try{gl.deleteBuffer(m.buf);gl.deleteVertexArray(m.vao);}catch(_){}}
function meshAlto(data){return litMesh(data);}

/* ---------- escada de corda: descer com toque, recolher segurando; baixar de novo de cima ---------- */
function escadaRecolher(o,sim){if(!o||!o.via)return;o.via.recolhida=sim;o.ext.recolhida=sim;sfx('pegar');
  feed(sim?'Escada recolhida: ninguém sobe por ela':'Escada baixada');if(sim)dica('escadaRec','corpo','Escada recolhida. Para baixar de novo, chegue na beirada e aperte E.');}
function lampAlternar(o){const f=FIRES.findIndex(x=>x.obra===o);if(f>=0){FIRES.splice(f,1);o.ext.apagada=true;feed('Lamparina apagada: menos chance de ser visto');}
  else{FIRES.push({x:o.x,y:o.y,z:o.z,obra:o,lamp:true});o.ext.apagada=false;feed('Lamparina acesa');}sfx('clique');}

/* ---------- desenho ---------- */
function altoGeometry(O,R,mk){const mad=lin(0x6e5235),mad2=lin(0x7d6142),esc=lin(0x4a3424),corda=lin(0x8a7650),palha=lin(0x8c7a46),metal=lin(0x3b3e42);
  O.plataforma=mk(g=>{for(let i=0;i<10;i++)add(g,boxTris(0.28,0.08,3.0),mat(-1.35+i*0.3,-0.04,0),mixc(mad,mad2,R()),{j:0.08,rnd:R});
    for(const z of[-1.25,0,1.25])add(g,boxTris(3.04,0.14,0.15),mat(0,-0.15,z),esc);for(const x of[-1.44,1.44])add(g,boxTris(0.12,0.12,3.04),mat(x,-0.14,0),esc);});
  O.parapeito=mk(g=>{for(const x of[-1.42,0,1.42])add(g,boxTris(0.09,1.1,0.09),mat(x,0.55,0),esc);add(g,boxTris(3.0,0.08,0.08),mat(0,1.06,0),mad);add(g,boxTris(3.0,0.06,0.06),mat(0,0.55,0),mad2);});
  O.paredeAlta=mk(g=>{for(let i=0;i<10;i++){const h=2.42+R()*0.12;add(g,boxTris(0.28,h,0.07),mat(-1.35+i*0.3,h/2,0),mixc(mad,mad2,R()),{j:0.08,rnd:R});}
    for(const y of[0.4,1.3,2.2])add(g,boxTris(3.0,0.12,0.06),mat(0,y,-0.06),esc);});
  O.escadaRolo=mk(g=>{add(g,cylTris(0.15,0.15,0.86,8),mat(0.43,0.15,0.18,0,0,Math.PI/2),corda,{j:0.1,rnd:R});add(g,boxTris(0.7,0.08,0.14),mat(0,0.04,0.12),esc);});
  O.telhado=mk(g=>{for(const[x,z]of[[1.4,1.4],[-1.4,1.4],[1.4,-1.4],[-1.4,-1.4]])add(g,boxTris(0.12,2.5,0.12),mat(x,1.25,z),esc);
    for(const s of[1,-1])for(let i=0;i<9;i++)add(g,boxTris(0.42,0.06,1.95),mat(-1.6+i*0.4,2.8,s*0.9,s*0.36,0,0),mixc(palha,mad,R()*0.4),{j:0.1,rnd:R});
    add(g,boxTris(3.5,0.1,0.12),mat(0,3.15,0),esc);for(const z of[1.45,-1.45])add(g,boxTris(3.0,0.1,0.1),mat(0,2.48,z),esc);});
  O.cama=mk(g=>{add(g,boxTris(1.0,0.2,2.0),mat(0,0.1,0),lin(0x8a8f6b),{j:0.05,rnd:R});add(g,boxTris(0.9,0.06,1.9),mat(0,0.22,0),lin(0xb8b0a0),{j:0.06,rnd:R});add(g,boxTris(0.7,0.12,0.35),mat(0,0.28,-0.75),lin(0xe8e2d4));add(g,boxTris(0.95,0.05,0.9),mat(0,0.25,0.35,0.05,0,0),lin(0x5a5f6b),{j:0.06,rnd:R});});
  O.tabuasPorta=mk(g=>{for(const y of[0.35,0.95,1.55,2.0])add(g,boxTris(1.3,0.2,0.05),mat(0,y,0.08,0,0,(R()-0.5)*0.3),mixc(mad,mad2,R()),{j:0.08,rnd:R});for(const x of[-0.55,0.55])add(g,boxTris(0.1,2.1,0.06),mat(x,1.05,0.12),esc);});
  O.tabuasJanela=mk(g=>{for(const y of[1.2,1.55,1.9])add(g,boxTris(1.45,0.18,0.05),mat(0,y,0,0,0,(R()-0.5)*0.35),mixc(mad,mad2,R()),{j:0.08,rnd:R});});
  O.lamparina=mk(g=>{add(g,cylTris(0.11,0.13,0.05,8),mat(0,0,0),metal);add(g,cylTris(0.075,0.075,0.2,8),mat(0,0.05,0),lin(0xffc66a),{e:2.2});
    for(const a of[0,1.57,3.14,4.71])add(g,boxTris(0.02,0.22,0.02),mat(Math.cos(a)*0.09,0.16,Math.sin(a)*0.09),metal);add(g,cylTris(0.04,0.12,0.06,8),mat(0,0.26,0),metal);add(g,cylTris(0.012,0.012,0.12,5),mat(0,0.32,0),metal);});}
function geoEscada(h){const g=new GB(1024,8),R=rng(Math.round(h*100)),corda=lin(0x8a7650),deg=lin(0x6b4e30);
  for(const x of[-0.24,0.24])add(g,cylTris(0.022,0.022,h+0.1,5),mat(x,-h,0.24),corda);
  for(let y=-h+0.3;y<-0.05;y+=0.36)add(g,boxTris(0.56,0.05,0.07),mat(0,y,0.24),deg,{j:0.08,rnd:R});
  add(g,boxTris(0.7,0.08,0.14),mat(0,0.04,0.12),deg);return g.data();}
/* ponte em coordenadas locais (centro na obra, +z na direção da ponte) */
function geoPonte(e,my){const g=new GB(4096,8),R=rng(Math.round((e.ax+e.bz)*100)),L=Math.hypot(e.bx-e.ax,e.bz-e.az),fl=Math.min(0.45,L*0.025),corda=lin(0x8a7650),mad=lin(0x6e5235),mad2=lin(0x7d6142),esc=lin(0x4a3424);
  const yAt=t=>e.ay+(e.by-e.ay)*t-Math.sin(Math.PI*t)*fl-my,n=Math.max(4,Math.round(L/0.32));
  for(let i=0;i<=n;i++){const t=i/n;add(g,boxTris(1.2,0.06,0.24),mat((R()-0.5)*0.05,yAt(t)-0.03,-L/2+L*t,0,(R()-0.5)*0.08,0),mixc(mad,mad2,R()),{j:0.1,rnd:R});}
  for(const x of[-0.62,0.62]){for(const hh of[0.95,0.5])for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,z0=-L/2+L*t0,z1=-L/2+L*t1,y0=yAt(t0)+hh-Math.sin(Math.PI*t0)*0.08,y1=yAt(t1)+hh-Math.sin(Math.PI*t1)*0.08;
      add(g,cylTris(0.018,0.018,Math.hypot(z1-z0,y1-y0),4),alignY(x,y0,z0,0,y1-y0,z1-z0),corda);}
    for(let i=0;i<=n;i+=4){const t=i/n;add(g,cylTris(0.014,0.014,0.95,4),mat(x,yAt(t),-L/2+L*t),corda);}
    for(const t of[0,1])add(g,boxTris(0.1,1.15,0.1),mat(x,yAt(t)+0.52,-L/2+L*t),esc);}
  return g.data();}
/* prancha em coordenadas locais (centro no meio do vão, +z no sentido da travessia): degraus de caixote, duas tábuas e amarras */
function geoPrancha(e,my){const g=new GB(4096,8),R=rng(Math.round((e.wA+e.lc)*10)),mad=lin(0x6e5235),mad2=lin(0x7d6142),cx=lin(0x8a6a45),corda=lin(0x8a7650),gap=Math.abs(e.wB-e.wA);
  const a0=-gap/2,b0=gap/2;
  const degraus=(t0,t1,y0,y1)=>{const n=6;for(let i=0;i<n;i++){const ta=t0+(t1-t0)*i/n,tb=t0+(t1-t0)*(i+1)/n,h=y0+(y1-y0)*(i+0.5)/n-my,base=Math.min(y0,y1)-my;
      add(g,boxTris(0.72,Math.max(0.06,h-base),Math.abs(tb-ta)+0.02),mat((R()-0.5)*0.04,(h+base)/2,(ta+tb)/2),mixc(cx,mad2,R()),{j:0.1,rnd:R});}};
  degraus(a0-2.2,a0-0.6,e.yA,e.tA);degraus(b0+2.2,b0+0.6,e.yB,e.tB);
  const L=gap+1.2,n=Math.max(3,Math.round(L/0.4));for(let i=0;i<n;i++){const t0=a0-0.6+L*i/n,t1=a0-0.6+L*(i+1)/n,y=e.tA+(e.tB-e.tA)*(i+0.5)/n-my;
    for(const x of[-0.17,0.17])add(g,boxTris(0.32,0.07,t1-t0+0.01),mat(x,y-0.035,(t0+t1)/2),mixc(mad,mad2,R()),{j:0.08,rnd:R});}
  for(const t of[a0-0.1,b0+0.1])for(const x of[-0.3,0.3])add(g,boxTris(0.05,0.22,0.05),mat(x,(t<0?e.tA:e.tB)-my-0.12,t),corda);
  return g.data();}
const M_PORTA=new Float32Array(16);
function desenharObra(Pg,o){const es=obraEsc(o);if(es)trs(TMP,o.x,o.y,o.z,0,o.yaw,0,es[0],es[1],es[2]);else trs(TMP,o.x,o.y,o.z,0,o.yaw,0,1,1,1);
  if(o.tipo==='portao'||o.tipo==='portaoFerro'){const fe=o.tipo==='portaoFerro';drawStat(Pg,fe?MESH.obra.portaoFerroBase:MESH.obra.portaoBase,TMP);mul(TMP2,TMP,trs(M4(),-1.4,0,0,0,-o.abre*1.5,0,1,1,1));drawStat(Pg,fe?MESH.obra.portaoFerroFolha:MESH.obra.portaoFolha,TMP2);}
  else if(o.tipo==='escadaCorda'){if(o.via&&o.via.recolhida)drawStat(Pg,MESH.obra.escadaRolo,TMP);else if(o.mesh)drawStat(Pg,o.mesh,TMP);}
  else if(o.tipo==='portaMadeira'){drawStat(Pg,MESH.obra.portaMadeiraBase,TMP);mul(TMP2,TMP,trs(M_PORTA,-0.55,0,0,0,-(o.abre||0)*1.55,0,1,1,1));drawStat(Pg,MESH.obra.portaMadeiraFolha,TMP2);}
  else if(o.mesh)drawStat(Pg,o.mesh,TMP);else{const m=MESH.obra[o.tipo];if(m)drawStat(Pg,m,TMP);}}
/* fantasma da escada e da ponte: malha refeita só quando a mira muda de verdade */
let fantasmaM=null,fantasmaK='';
function fantasmaAlto(){const t=OBRA.tipo;let k='',data=null;
  if(t==='escadaCorda'){const sa=Math.sin(OBRA.yaw),ca=Math.cos(OBRA.yaw),h=Math.max(0.5,OBRA.y-ground(OBRA.x+sa*0.24,OBRA.z+ca*0.24));k='e'+h.toFixed(1);if(k!==fantasmaK)data=geoEscada(h);}
  else if(t==='ponteCorda'&&OBRA.ext){const e=OBRA.ext;k='p'+[e.ax,e.az,e.bx,e.bz,e.ay,e.by].map(v=>v.toFixed(1)).join();if(k!==fantasmaK)data=geoPonte(e,OBRA.y);}
  else if(t==='escadaMadeira'&&OBRA.ext&&OBRA.ext.L){const e=OBRA.ext;k='m'+e.h.toFixed(2)+'_'+e.L.toFixed(2);if(k!==fantasmaK)data=geoEscadaMad(e.h,e.L);}
  else if(t==='escadaInterna'&&OBRA.ext&&OBRA.ext.h){const e=OBRA.ext;k='i'+e.h.toFixed(2)+'_'+e.d;if(k!==fantasmaK)data=geoEscadaInt(e);}
  else if(t==='prancha'&&OBRA.ext){const e=OBRA.ext;k='r'+[e.ax,e.lc,e.wA,e.wB,e.tA,e.tB].join();if(k!==fantasmaK)data=geoPrancha(e,OBRA.y);}
  else return null;
  if(data){if(fantasmaM)liberarMesh(fantasmaM);fantasmaM=meshAlto(data);fantasmaK=k;}return fantasmaM;}

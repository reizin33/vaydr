/* ================= altura: superfícies elevadas (galhos, raízes, troncos caídos, plataformas), rotas de escalada e árvores gigantes ================= */
/* superfície 'seg': cilindro deitado (galho, raiz, tronco caído, ponte) — anda-se por cima, perto do eixo.
   superfície 'ret': retângulo plano (plataforma, piso, telhado, calçada). 'ram': retângulo inclinado ao longo do eixo local z (lance de escada).
   Cada uma fica num grid de 4 m para a busca ser barata. */
const SUPS=[],SGRID=new Map(),SCELL=4;
const skey=(i,j)=>(i+512)*2048+(j+512);
function supAdd(s){let x0,x1,z0,z1;
  if(s.t==='seg'){const m=Math.max(s.r0,s.r1)+0.2;x0=Math.min(s.ax,s.bx)-m;x1=Math.max(s.ax,s.bx)+m;z0=Math.min(s.az,s.bz)-m;z1=Math.max(s.az,s.bz)+m;const vx=s.bx-s.ax,vz=s.bz-s.az;s.l2=vx*vx+vz*vz||1e-6;}
  else{const e=Math.hypot(s.hw,s.hd)+0.1;x0=s.x-e;x1=s.x+e;z0=s.z-e;z1=s.z+e;s.c=Math.cos(s.yaw);s.s=Math.sin(s.yaw);}
  s.cells=[];for(let i=Math.floor(x0/SCELL);i<=Math.floor(x1/SCELL);i++)for(let j=Math.floor(z0/SCELL);j<=Math.floor(z1/SCELL);j++){const k=skey(i,j);if(!SGRID.has(k))SGRID.set(k,[]);SGRID.get(k).push(s);s.cells.push(k);}
  SUPS.push(s);return s;}
function supRemove(s){if(!s||!s.cells)return;for(const k of s.cells){const l=SGRID.get(k);if(l){const i=l.indexOf(s);if(i>=0)l.splice(i,1);}}s.cells=null;const i=SUPS.indexOf(s);if(i>=0)SUPS.splice(i,1);}
/* altura do topo da superfície no ponto (x,z), ou null se o ponto está fora dela */
function alturaSup(s,x,z){
  if(s.t==='seg'){const vx=s.bx-s.ax,vz=s.bz-s.az;const t=((x-s.ax)*vx+(z-s.az)*vz)/s.l2;if(t<0||t>1)return null;
    const px=s.ax+vx*t,pz=s.az+vz*t,d=Math.hypot(x-px,z-pz),r=s.r0+(s.r1-s.r0)*t,w=r*(s.larg||0.9);if(d>w)return null;
    const ya=s.ay+(s.by-s.ay)*t-(s.flecha?Math.sin(Math.PI*t)*s.flecha:0);return ya+Math.sqrt(Math.max(0,r*r-d*d))*(s.topo??0.95);}
  const dx=x-s.x,dz=z-s.z,lx=dx*s.c-dz*s.s,lz=dx*s.s+dz*s.c;if(Math.abs(lx)>s.hw||Math.abs(lz)>s.hd)return null;return s.t==='ram'?s.ya+(s.yb-s.ya)*(lz+s.hd)/(2*s.hd):s.y;}
/* buracos: retângulos onde o terreno e as superfícies 'solo' (calçadas) não contam, como a boca do metrô */
const BURACOS=[];
function emBuraco(x,z){for(const b of BURACOS)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return true;return false;}
/* chão mais alto que dá para pisar em (x,z): terreno ou superfície no máximo um degrau acima dos pés (quem está no subsolo não sobe para a rua) */
function chaoEm(x,z,yPes){const lim=yPes+0.55,bur=BURACOS.length>0&&emBuraco(x,z),g=bur?-1e9:ground(x,z);let best=g<=lim?g:-1e9;
  const l=SGRID.get(skey(Math.floor(x/SCELL),Math.floor(z/SCELL)));
  if(l)for(const s of l){if(bur&&s.solo)continue;const h=alturaSup(s,x,z);if(h!==null&&h>best&&h<=lim)best=h;}
  if(best<-1e8)return bur?yPes-50:(yPes<g-1.5?yPes:g);   // bem abaixo do terreno (metrô, fosso) sem piso: não "sobe" para a rua
  return best;}
function supEm(x,z,yPes,tol){const l=SGRID.get(skey(Math.floor(x/SCELL),Math.floor(z/SCELL)));let best=null,bd=tol||0.6;
  if(l)for(const s of l){const h=alturaSup(s,x,z);if(h!==null&&Math.abs(h-yPes)<bd){bd=Math.abs(h-yPes);best=s;}}return best;}

/* ---- rotas de escalada: só dá para subir onde existe uma (cipós das gigantes e escadas de corda) ----
   cada rota é um caminho de u=0 (embaixo) a u=1 (em cima), com ponto de saída embaixo e em cima */
const VIAS=[];
function viaHelice(cx,cz,raio,a0,a1,y0,y1,base,topo,dono){return{tipo:'cipo',cx,cz,raio,a0,a1,y0,y1,base,topo,dono,
  pos(u){const a=this.a0+(this.a1-this.a0)*u;return[this.cx+Math.cos(a)*this.raio,this.y0+(this.y1-this.y0)*u,this.cz+Math.sin(a)*this.raio];},
  rumo(u){const a=this.a0+(this.a1-this.a0)*u;return Math.atan2(-Math.cos(a),-Math.sin(a));},altura(){return this.y1-this.y0;}};}
function viaReta(x,z,y0,y1,yaw,base,topo,dono){return{tipo:'escada',x,z,y0,y1,yaw,base,topo,dono,
  pos(u){return[this.x,this.y0+(this.y1-this.y0)*u,this.z];},rumo(){return this.yaw;},altura(){return this.y1-this.y0;}};}

/* ---- árvores gigantes: raras, em bosques de 2 a 3 (perto o bastante para ligar com ponte de corda), tronco grosso, raízes, galhos andáveis, copa fechada, cipós ---- */
const GIGANTES=[];
const GIG_CFG={grupos:14,distGrupos:36,porGrupo:[2,4],vizinho:[11,15],rMin:38,rMax:142,galhos:[3,5],alturaPrimeiro:5.0,passo:[2.2,3.4],comprimento:[4.8,7.4]};
function gerarGigantes(){const R=rng(9091);GIGANTES.length=0;
  const pode=(x,z)=>{const r=Math.hypot(x,z);if(r<GIG_CFG.rMin||r>GIG_CFG.rMax||mata(x,z)<0.95||!freeSpot(x,z,7))return false;
    const g0=ground(x,z);for(let k=0;k<8;k++){const aa=k/8*6.283;if(Math.abs(ground(x+Math.cos(aa)*3.5,z+Math.sin(aa)*3.5)-g0)>0.9)return false;}return true;};
  const centros=[];for(let t=0;t<5000&&centros.length<GIG_CFG.grupos;t++){const a=R()*6.283,r=GIG_CFG.rMin+R()*(GIG_CFG.rMax-GIG_CFG.rMin),x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(pode(x,z)&&!centros.some(c=>Math.hypot(c[0]-x,c[1]-z)<GIG_CFG.distGrupos))centros.push([x,z]);}
  for(const[cx,cz]of centros){const n=GIG_CFG.porGrupo[0]+Math.floor(R()*(GIG_CFG.porGrupo[1]-GIG_CFG.porGrupo[0]+1)),gr=[[cx,cz]];
    for(let t=0;t<80&&gr.length<n;t++){const b=gr[Math.floor(R()*gr.length)],a=R()*6.283,d=GIG_CFG.vizinho[0]+R()*(GIG_CFG.vizinho[1]-GIG_CFG.vizinho[0]),x=b[0]+Math.cos(a)*d,z=b[1]+Math.sin(a)*d;
      if(pode(x,z)&&!gr.some(g=>Math.hypot(g[0]-x,g[1]-z)<GIG_CFG.vizinho[0]))gr.push([x,z]);}
    for(const[x,z]of gr)criarGigante(R,x,z,gr);}
  for(const T of GIGANTES)montarGigante(T);}
function criarGigante(R,x,z,gr){const g0=ground(x,z);
    const s=0.88+R()*0.3,Rt=0.95*s+R()*0.25,H=19*s+R()*5;const T={id:GIGANTES.length,x,z,y:g0,R:Rt,H,s,galhos:[],raizes:[],vias:[],cor:R()};
    let viz=null,vd=1e9;for(const g of gr){const d=Math.hypot(g[0]-x,g[1]-z);if(d>1&&d<vd){vd=d;viz=g;}}
    const nb=GIG_CFG.galhos[0]+Math.floor(R()*(GIG_CFG.galhos[1]-GIG_CFG.galhos[0]+1));let ang=viz?Math.atan2(viz[1]-z,viz[0]-x)-6.283/nb*0.85:R()*6.283,yy=GIG_CFG.alturaPrimeiro+R()*0.8;
    for(let i=0;i<nb;i++){ang+=6.283/nb*(0.7+R()*0.6);const L=GIG_CFG.comprimento[0]+R()*(GIG_CFG.comprimento[1]-GIG_CFG.comprimento[0]),sobe=(0.08+R()*0.16)*L;
      const ca=Math.cos(ang),sa=Math.sin(ang),r0=0.6*s,r1=0.36*s;
      T.galhos.push({a:ang,ax:x+ca*Rt*0.6,az:z+sa*Rt*0.6,ay:g0+yy,bx:x+ca*(Rt+L),bz:z+sa*(Rt+L),by:g0+yy+sobe,r0,r1,L});
      yy+=GIG_CFG.passo[0]+R()*(GIG_CFG.passo[1]-GIG_CFG.passo[0]);}
    const nr=6+Math.floor(R()*3);for(let i=0;i<nr;i++)T.raizes.push({a:i/nr*6.283+R()*0.35,L:2.4+R()*2.4,r:(0.3+R()*0.12)*s});
    GIGANTES.push(T);}
function topoGalho(b,t){const r=b.r0+(b.r1-b.r0)*t;return b.ay+(b.by-b.ay)*t+r*0.95;}
function pontoGalho(b,dist){const t=clamp(dist/(Math.hypot(b.bx-b.ax,b.bz-b.az)||1),0,1);return[b.ax+(b.bx-b.ax)*t,topoGalho(b,t),b.az+(b.bz-b.az)*t,t];}
/* colisão, superfícies e rotas de uma gigante */
function montarGigante(T){colCircle(T.x,T.z,T.R*0.98,{gigante:T});
  for(const b of T.galhos)b.sup=supAdd({t:'seg',ax:b.ax,az:b.az,ay:b.ay,bx:b.bx,bz:b.bz,by:b.by,r0:b.r0,r1:b.r1,larg:0.92,dono:'g'+T.id});
  for(const r of T.raizes){const ca=Math.cos(r.a),sa=Math.sin(r.a),ax=T.x+ca*T.R*0.8,az=T.z+sa*T.R*0.8,bx=T.x+ca*(T.R+r.L),bz=T.z+sa*(T.R+r.L);
    r.sup=supAdd({t:'seg',ax,az,ay:ground(ax,az)+0.18,bx,bz,by:ground(bx,bz)-0.05,r0:r.r,r1:r.r*0.35,larg:0.8,dono:'g'+T.id});}
  // rotas: chão → 1º galho; depois de galho em galho, em espiral pelo tronco
  const gs=T.galhos,raio=T.R+0.36;const sair=(b,d)=>{const p=pontoGalho(b,T.R*0.4+d);return{x:p[0],y:p[1],z:p[2],rumo:Math.atan2(b.bx-b.ax,b.bz-b.az)};};
  {const b=gs[0],a0=b.a+0.55,a1=b.a+0.12,bx=T.x+Math.cos(a0)*(T.R+1.0),bz=T.z+Math.sin(a0)*(T.R+1.0);
    const v=viaHelice(T.x,T.z,raio,a0,a1,T.y,topoGalho(b,0.12),{x:bx,y:ground(bx,bz),z:bz},sair(b,1.1),'g'+T.id);T.vias.push(v);VIAS.push(v);}
  for(let i=0;i+1<gs.length;i++){const b=gs[i],c=gs[i+1];let a0=b.a-0.3,a1=c.a+0.25;while(a1-a0>Math.PI)a1-=6.283;while(a0-a1>Math.PI)a1+=6.283;
    const v=viaHelice(T.x,T.z,raio,a0,a1,topoGalho(b,0.12),topoGalho(c,0.12),sair(b,1.0),sair(c,1.1),'g'+T.id);T.vias.push(v);VIAS.push(v);}}
/* desenho de uma gigante: tronco com casca irregular, raízes, galhos grossos e finos, copa em blocos de folhas e cipós nas rotas */
/* semCopa: só a madeira (tronco, raízes, galhos e cipós); as folhas vão para uma geometria de descarte, para o sorteio (R) ser o
   mesmo e a madeira sair idêntica. A copa de verdade, nesse caso, vem da mata nova (62y_mata.js). */
function geoGigante(T,semCopa){const g=new GB(1<<13,8),gf=semCopa?new GB(1<<13,8):g,R=rng(100+T.id*17),cas=lin(0x4a3423),cas2=lin(0x5c4330),musgo=lin(0x3d5229),folha=[lin(0x2c4a22),lin(0x35562a),lin(0x2a4220),lin(0x41602f)];
  const loc=(x,y,z)=>[x-T.x,y-T.y,z-T.z];
  // tronco: perfil que alarga na base e afina no alto
  const H=T.H,Rt=T.R,prof=[[Rt*1.45,0],[Rt*1.12,0.6],[Rt,1.6],[Rt*0.92,H*0.25],[Rt*0.78,H*0.45],[Rt*0.62,H*0.62],[Rt*0.45,H*0.78],[Rt*0.25,H*0.92],[0,H]];
  add(g,latheTris(prof,14,1,1),ID,mixc(cas,cas2,T.cor),{j:0.16,rnd:R,crease:50});
  for(let k=0;k<10;k++){const a=R()*6.283,y=1+R()*H*0.55,rr=Rt*(1-y/H*0.6);add(g,ellipTris(0.22,0.35,0.12,6,4),mat(Math.cos(a)*rr,y,Math.sin(a)*rr,0,-a+Math.PI/2,0),R()<0.5?musgo:cas2,{j:0.2,rnd:R});}
  // raízes
  for(const r of T.raizes){const ca=Math.cos(r.a),sa=Math.sin(r.a),a=loc(T.x+ca*T.R*0.8,ground(T.x+ca*T.R*0.8,T.z+sa*T.R*0.8)+0.18,T.z+sa*T.R*0.8),b=loc(T.x+ca*(T.R+r.L),ground(T.x+ca*(T.R+r.L),T.z+sa*(T.R+r.L))-0.05,T.z+sa*(T.R+r.L));
    const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);add(g,cylTris(r.r*0.35,r.r,L,7),alignY(a[0],a[1],a[2],b[0]-a[0],b[1]-a[1],b[2]-a[2]),cas,{j:0.14,rnd:R});}
  // galhos grossos (andáveis) com galhinhos e folhagem na ponta
  for(const b of T.galhos){const a=loc(b.ax,b.ay,b.az),c=loc(b.bx,b.by,b.bz),L=Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]);
    add(g,cylTris(b.r1,b.r0,L,9),alignY(a[0],a[1],a[2],c[0]-a[0],c[1]-a[1],c[2]-a[2]),cas,{j:0.12,rnd:R});
    const dx=(c[0]-a[0])/L,dy=(c[1]-a[1])/L,dz=(c[2]-a[2])/L,e=[c[0]+dx*2.5,c[1]+dy*2.5+1.3,c[2]+dz*2.5];add(g,cylTris(0.05,b.r1,1.9,6),alignY(c[0],c[1],c[2],dx,dy+0.3,dz),cas,{j:0.12,rnd:R});
    for(let k=0;k<3;k++){const t=0.35+k*0.25,p=[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t],side=k%2?1:-1;add(g,cylTris(0.03,0.08,1.5,5),alignY(p[0],p[1]+0.1,p[2],-dz*side*1.2,0.6,dx*side*1.2),cas2,{j:0.15,rnd:R});
      add(gf,icoTris(0.45+R()*0.25,0.35,R),mat(p[0]-dz*side*1.55,p[1]+0.85,p[2]+dx*side*1.55,0,0,0,1,0.7,1),folha[k%4],{j:0.18,rnd:R});}
    add(gf,icoTris(1.3+R()*0.5,0.35,R),mat(e[0],e[1]+0.4,e[2],0,0,0,1.1,0.75,1.1),folha[Math.floor(R()*4)],{j:0.18,rnd:R});}
  // copa: blocos grandes de folhas em volta do alto
  for(let k=0;k<11;k++){const a=R()*6.283,rr=1.5+R()*4.2,y=H*(0.62+R()*0.34);add(gf,icoTris(2.6+R()*1.8,0.32,R),mat(Math.cos(a)*rr,y,Math.sin(a)*rr,0,R()*6,0,1.15,0.72,1.15),folha[k%4],{j:0.16,rnd:R});}
  for(let k=0;k<6;k++){const a=R()*6.283,y=H*(0.55+R()*0.3),rr=Rt*0.5;add(g,cylTris(0.08,0.28,4+R()*2,6),alignY(Math.cos(a)*rr,y,Math.sin(a)*rr,Math.cos(a),0.6,Math.sin(a)),cas,{j:0.1,rnd:R});}
  // cipós marcando onde dá para subir
  for(const v of T.vias){const n=Math.max(8,Math.round(v.altura()*2.2));let p0=v.pos(0);for(let k=1;k<=n;k++){const p1=v.pos(k/n);const a=loc(p0[0],p0[1],p0[2]),b=loc(p1[0],p1[1],p1[2]);
      const s0=[a[0]*(T.R+0.06)/(Math.hypot(a[0],a[2])||1),a[1],a[2]*(T.R+0.06)/(Math.hypot(a[0],a[2])||1)],s1=[b[0]*(T.R+0.06)/(Math.hypot(b[0],b[2])||1),b[1],b[2]*(T.R+0.06)/(Math.hypot(b[0],b[2])||1)];
      add(g,cylTris(0.035,0.04,Math.hypot(s1[0]-s0[0],s1[1]-s0[1],s1[2]-s0[2]),5),alignY(s0[0],s0[1],s0[2],s1[0]-s0[0],s1[1]-s0[1],s1[2]-s0[2]),lin(0x4f6b2a));
      if(k%2)add(g,ellipTris(0.16,0.05,0.1,5,3),mat(s1[0]*1.02,s1[1],s1[2]*1.02,R(),R()*6,R()),lin(0x5f8a34));p0=p1;}}
  return g.data();}

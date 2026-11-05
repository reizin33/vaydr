/* ================= mundo: terreno, locais, vegetação, colisão ================= */
/* canteiros de plantar e colher (plantação da fazenda e hortas dos sítios); o módulo 48ya_plantio cuida deles */
const PLANTIO_DEF=[],FRUTEIRAS=[];   // FRUTEIRAS: árvores de fruta das casas e dos sítios (o módulo 48yb_pomar cuida delas)
const PLACES=[
  {id:'clareira',nome:'Clareira',x:0,z:0,r:13.5,blend:18},
  {id:'posto',nome:'Posto de gasolina',x:92,z:-9,r:16,blend:10},
  {id:'fazenda',nome:'Fazenda',x:-72,z:60,r:23,blend:12},
  {id:'vila',nome:'Vila',x:62,z:-72,r:34,blend:14},
  {id:'torre',nome:'Torre de rádio',x:-44,z:-110,r:9,blend:8},
  {id:'base',nome:'Base Militar Serra Velha',x:-108,z:-30,r:21,blend:10},
  {id:'sitio1',nome:'Sítio do Bento',x:-128,z:30,r:14,blend:9,sitio:true,frente:'E'},
  {id:'sitio2',nome:'Chácara Santa Luzia',x:-40,z:128,r:14,blend:9,sitio:true,frente:'S'},
  {id:'sitio3',nome:'Sítio Boa Vista',x:110,z:70,r:14,blend:9,sitio:true,frente:'S'},
  {id:'sitio4',nome:'Sítio dos Ipês',x:-5,z:-135,r:14,blend:9,sitio:true,frente:'N'},
  {id:'sitio5',nome:'Chácara do Posto',x:132,z:-14,r:14,blend:9,sitio:true,frente:'N'},
  {id:'sitio6',nome:'Sítio Recanto Verde',x:10,z:125,r:14,blend:9,sitio:true,frente:'W'}
];
const placeById=id=>PLACES.find(p=>p.id===id);
/* cidade abandonada a leste, no fim da estrada: retângulo plano no nível 0 */
const CIDADE={x0:172,x1:336,z0:-84,z1:94,y:0};
const dentroCidade=(x,z,m=0)=>x>CIDADE.x0-m&&x<CIDADE.x1+m&&z>CIDADE.z0-m&&z<CIDADE.z1+m;
function distCidade(x,z){const dx=Math.max(CIDADE.x0-x,0,x-CIDADE.x1),dz=Math.max(CIDADE.z0-z,0,z-CIDADE.z1);return Math.hypot(dx,dz);}
const roadZ=x=>5.6+Math.sin(x*0.045)*3.2;
const ROADS=[];
(function(){const main=[];for(let x=7;x<=168;x+=8)main.push([x,roadZ(x)]);main.push([176,8.2]);ROADS.push({w:5.2,pts:main,cor:'asfalto'});
  ROADS.push({w:3.4,pts:[[-5,8],[-18,20],[-36,34],[-52,46],[-62,52]],cor:'terra'});
  ROADS.push({w:3.6,pts:[[50,roadZ(50)],[53,-18],[57,-42],[61,-56]],cor:'terra'});
  ROADS.push({w:1.8,pts:[[0,-14],[-9,-38],[-24,-70],[-38,-98]],cor:'trilha'});
  ROADS.push({w:3.2,pts:[[-9,-38],[-30,-40],[-52,-37],[-72,-33],[-90,-31]],cor:'terra'});
  // ruas da vila: a principal (do trilho até a igreja) e a transversal (mercadinho, bar e as casas de lado)
  ROADS.push({w:5.0,pts:[[61.2,-56],[61.5,-79],[61.5,-104.5]],cor:'terra',vila:true});
  ROADS.push({w:4.6,pts:[[28,-79],[61.5,-79],[97,-79]],cor:'terra',vila:true});
  // estradas de terra dos sítios: saem da estrada mais perto, passam pela porteira e chegam na varanda da casa
  const FR={S:[0,-1],N:[0,1],E:[1,0],W:[-1,0]},liga={sitio1:[[-62,52],[-80,47],[-98,37]],sitio2:[[-36,34],[-37,60],[-41,88]],sitio3:[[107,roadZ(107)],[108,30]],
    sitio4:[[-38,-98],[-22,-108]],sitio5:[[132,roadZ(132)]],sitio6:[[-41,88],[-22,106]]};
  for(const p of PLACES){if(!p.sitio)continue;const f=FR[p.frente];ROADS.push({w:3.2,pts:liga[p.id].concat([[p.x+f[0]*15,p.z+f[1]*15],[p.x+f[0]*6.4,p.z+f[1]*6.4]]),cor:'terra',sitio:p.id});}})();
/* lotes da vila (casas, lojas e a igreja): x,z é o centro da construção; a frente dá para a rua.
   Os lotes ficam num patamar plano só, na altura da vila (a igreja, na beira do morro, corta o barranco atrás). */
const VILA_LOTES=[
  {id:'v1',tipo:'casa',frente:'E',x:51.1,z:-60.4,W:8.6,D:9.0,andares:1,cor:0,varanda:1.8},
  {id:'v2',tipo:'farmacia',frente:'E',x:51.1,z:-71.1,W:8.6,D:9.0,placa:'FARMACIA',nome:'Farmácia da Vila'},
  {id:'v3',tipo:'casa',frente:'E',x:51.1,z:-87.6,W:9.4,D:9.0,andares:2,cor:1},
  {id:'v4',tipo:'casa',frente:'E',x:51.1,z:-99.6,W:9.2,D:9.0,andares:1,cor:2,varanda:1.8},
  {id:'v5',tipo:'casa',frente:'W',x:71.9,z:-60.4,W:8.6,D:9.0,andares:1,cor:3},
  {id:'v6',tipo:'conveniencia',frente:'W',x:71.9,z:-71.1,W:8.6,D:9.0,placa:'MERCADINHO',nome:'Mercadinho da Vila'},
  {id:'v7',tipo:'conveniencia',frente:'W',x:71.4,z:-87.6,W:9.4,D:8.0,placa:'BAR DO ZE',nome:'Bar do Zé',letreiro:[0x2a5a3a,0xf2e6c8]},
  {id:'v8',tipo:'casa',frente:'W',x:71.9,z:-99.6,W:9.2,D:9.0,andares:1,cor:4,radio:true,nome:'Casa do radioamador'},
  {id:'v9',tipo:'casa',frente:'N',x:38.5,z:-89.0,W:9.0,D:8.6,andares:1,cor:5},
  {id:'v10',tipo:'casa',frente:'N',x:85.5,z:-89.0,W:9.0,D:8.6,andares:1,cor:6,varanda:1.8},
  {id:'v11',tipo:'casa',frente:'S',x:38.5,z:-68.8,W:9.0,D:9.0,andares:2,cor:7},
  {id:'v12',tipo:'casa',frente:'S',x:85.5,z:-69.0,W:9.0,D:8.6,andares:1,cor:8},
  {id:'igreja',tipo:'igreja',frente:'N',x:61.5,z:-112.3,W:8.4,D:11.0,nome:'Igreja de São José'}];
const PATAMARES=VILA_LOTES.map(l=>({x:l.x,z:l.z,r:0.5*Math.hypot(l.W+2.6,l.D+4.8)+3.5,b:6,h:0}));
function patamares(x,z,h){for(const q of PATAMARES){const d=Math.hypot(x-q.x,z-q.z);if(d<q.r+q.b)h=lerp(h,q.h,smooth(q.r+q.b,q.r,d));}return h;}
function segDist(px,pz,ax,az,bx,bz){const vx=bx-ax,vz=bz-az,l2=vx*vx+vz*vz;let t=l2?((px-ax)*vx+(pz-az)*vz)/l2:0;t=clamp(t,0,1);return Math.hypot(px-ax-vx*t,pz-az-vz*t);}
function roadInfo(x,z){let best=1e9,road=null;for(const r of ROADS)for(let i=0;i<r.pts.length-1;i++){const a=r.pts[i],b=r.pts[i+1];const d=segDist(x,z,a[0],a[1],b[0],b[1]);if(d<best){best=d;road=r;}}return{d:best,road};}

/* ---------- terreno ---------- */
const T_N=160,T_HALF=360,GX=new Float32Array(T_N+1);
for(let i=0;i<=T_N;i++){const u=-1+2*i/T_N;GX[i]=T_HALF*(0.21*u+0.79*u*u*u);}
function baseH(x,z){const r=Math.hypot(x,z);
  return (vnoise(x*0.03+3.1,z*0.03-7.7)-0.5)*9+(vnoise(x*0.08-11.3,z*0.08+5.2)-0.5)*2.6+smooth(150,225,r)*16+serraH(x,z);}
/* Serra Velha: morros de pedra a noroeste (cabras, lobos, urso e a mina velha) */
const SERRA={x:-100,z:-84,sig:21,alt:10};
function serraH(x,z){const dx=x-SERRA.x,dz=z-SERRA.z,q=(dx*dx+dz*dz)/(2*SERRA.sig*SERRA.sig);if(q>9)return 0;return SERRA.alt*Math.exp(-q)*(0.75+0.5*vnoise(x*0.06+31,z*0.06-17));}
function flatMask(x,z){let m=1;
  for(const p of PLACES){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+p.blend)m=Math.min(m,smooth(p.r,p.r+p.blend,d));}
  const ri=roadInfo(x,z);if(ri.road){const w=ri.road.w/2;m=Math.min(m,lerp(ri.road.cor==='trilha'?0.5:0.15,1,smooth(w+0.5,w+8,ri.d)));}
  m=Math.min(m,smooth(8,40,distCidade(x,z)));m=Math.min(m,aguaPlano(x,z));
  return m;}
function hBase(x,z){return baseH(x,z)*flatMask(x,z)+(vnoise(x*0.7+50,z*0.7)-0.5)*0.07*smooth(4,14,distCidade(x,z));}
{const hs=PATAMARES.map(q=>hBase(q.x,q.z)).sort((a,b)=>a-b),med=hs[hs.length>>1];for(const q of PATAMARES)q.h=med;}   // a vila inteira num patamar só (a igreja, na beira do morro, corta o barranco atrás)
function hRaw(x,z){return aguaTerreno(x,z,patamares(x,z,hBase(x,z)));}
const TW=T_N+1,TH=new Float32Array(TW*TW);
for(let j=0;j<=T_N;j++)for(let i=0;i<=T_N;i++)TH[j*TW+i]=hRaw(GX[i],GX[j]);
function cellOf(v){if(v<=GX[0]||v>=GX[T_N])return -1;let lo=0,hi=T_N;while(hi-lo>1){const m=(lo+hi)>>1;if(GX[m]<=v)lo=m;else hi=m;}return lo;}
function ground(x,z){const i=cellOf(x),j=cellOf(z);if(i<0||j<0)return 0;
  const u=(x-GX[i])/(GX[i+1]-GX[i]),v=(z-GX[j])/(GX[j+1]-GX[j]);
  const hA=TH[j*TW+i],hD=TH[j*TW+i+1],hB=TH[(j+1)*TW+i],hC=TH[(j+1)*TW+i+1];
  return v>=u?hA+(hC-hB)*u+(hB-hA)*v:hA+(hD-hA)*u+(hC-hD)*v;}
const MAP_R=150;
/* área jogável: o círculo da mata, o corredor da estrada até a cidade e a própria cidade */
function dentroMapa(x,z,m=0){if(x*x+z*z<(MAP_R-m)**2)return true;if(dentroCidade(x,z,-m))return true;
  return x>MAP_R-40&&x<CIDADE.x0+6&&Math.abs(z-(x<168?roadZ(x):8.2))<11-m;}
/* devolve a entidade para dentro: para a última posição boa, ou puxa para o círculo */
/* raio do mapa na direção do ponto (o círculo da mata; a Mata dos Morros, 62m, abre a oeste e ao sul) */
function raioMapaEm(x,z){return MAP_R;}
function voltarMapa(e,x0,z0){if(dentroMapa(x0,z0)){e.x=x0;e.z=z0;return;}const r=Math.hypot(e.x,e.z),rm=raioMapaEm(e.x,e.z);if(r>rm-0.5&&!dentroCidade(e.x,e.z)){e.x*=(rm-0.5)/r;e.z*=(rm-0.5)/r;}}

/* ---------- colisão ---------- */
const COLL=[],CGRID=new Map(),CELL=4;let cStamp=1;
const ckey=(i,j)=>(i+512)*2048+(j+512);
function colAdd(c){c.stamp=0;COLL.push(c);const r=c.t===0?c.r:Math.hypot(c.hw,c.hd);c.br=r;
  const i0=Math.floor((c.x-r)/CELL),i1=Math.floor((c.x+r)/CELL),j0=Math.floor((c.z-r)/CELL),j1=Math.floor((c.z+r)/CELL);c.cells=[];
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=ckey(i,j);let l=CGRID.get(k);if(!l){l=[];CGRID.set(k,l);}l.push(c);c.cells.push(k);}return c;}
function colRemove(c){if(!c||!c.cells)return;for(const k of c.cells){const l=CGRID.get(k);if(l){const i=l.indexOf(c);if(i>=0)l.splice(i,1);}}c.cells=null;const i=COLL.indexOf(c);if(i>=0)COLL.splice(i,1);}
const colCircle=(x,z,r,o)=>colAdd(Object.assign({t:0,x,z,r,solid:true},o||{}));
const colBox=(x,z,hw,hd,yaw,o)=>colAdd(Object.assign({t:1,x,z,hw,hd,c:Math.cos(yaw),s:Math.sin(yaw),yaw,solid:true},o||{}));
const _q=[];
function colQuery(x,z,r){_q.length=0;cStamp++;const i0=Math.floor((x-r)/CELL),i1=Math.floor((x+r)/CELL),j0=Math.floor((z-r)/CELL),j1=Math.floor((z+r)/CELL);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const l=CGRID.get(ckey(i,j));if(!l)continue;for(const c of l){if(c.stamp===cStamp)continue;c.stamp=cStamp;_q.push(c);}}return _q;}
/* empurra a entidade (e.x,e.z,raio r) para fora dos colisores; devolve o colisor mais forte que bloqueou */
function collide(e,r,filter){let hit=null,best=0;const list=colQuery(e.x,e.z,r+1);
  for(const c of list){if(!c.solid||(filter&&!filter(c)))continue;if(c.y1!==undefined){const ey=e.y===undefined?ground(e.x,e.z):e.y;if(ey>=c.y1-0.05||ey+1.7<=c.y0)continue;}else if(e.y!==undefined&&e.y<-20)continue;let px=0,pz=0,pen=0;
    if(c.t===0){const dx=e.x-c.x,dz=e.z-c.z,d=Math.hypot(dx,dz),m=r+c.r;if(d<m){if(d<1e-4){px=m;}else{px=dx/d*(m-d);pz=dz/d*(m-d);}pen=m-d;}}
    else{const dx=e.x-c.x,dz=e.z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c;
      /* peça fina (porta, cerca, tábua): lembra de que lado quem esbarra estava. Se o centro passar da metade (zumbi empurrado
         pela multidão, passo grande com o jogo lento), volta para o lado de onde veio em vez de sair do outro lado */
      if(c.hd<r&&Math.abs(lx)<c.hw+r*0.6){const L=e.__lados||(e.__lados=new WeakMap()),ant=L.get(c),sg=lz<0?-1:1;
        if(Math.abs(lz)<c.hd+r){if(ant!==undefined&&ant!==sg){const qz=ant*(c.hd+r)-lz;e.x+=qz*c.s;e.z+=qz*c.c;const pn=Math.abs(qz);if(pn>best){best=pn;hit=c;}continue;}
          if(Math.abs(lz)>c.hd*0.5)L.set(c,sg);}
        else L.set(c,sg);}
      if(Math.abs(lx)<c.hw&&Math.abs(lz)<c.hd){const ox=c.hw-Math.abs(lx)+r,oz=c.hd-Math.abs(lz)+r;let qx=0,qz=0;if(ox<oz)qx=Math.sign(lx||1)*ox;else qz=Math.sign(lz||1)*oz;
        px=qx*c.c+qz*c.s;pz=-qx*c.s+qz*c.c;pen=Math.max(ox,oz);}
      else{const cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd),ex=lx-cx,ez=lz-cz,d=Math.hypot(ex,ez);if(d<r){const k=(r-d)/(d||1);const qx=ex*k,qz=ez*k;px=qx*c.c+qz*c.s;pz=-qx*c.s+qz*c.c;pen=r-d;}}}
    if(pen>0){e.x+=px;e.z+=pz;if(pen>best){best=pen;hit=c;}}}
  return hit;}
function pointBlocked(x,z,r){for(const c of colQuery(x,z,r+1)){if(!c.solid||c.sub)continue;
  if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return c;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c;
    const cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-cx,lz-cz)<r)return c;}}return null;}

/* ---------- conteúdo do mundo ---------- */
const INTER=[];        // pontos de interação
const TREES=[],ROCKS=[],BUSHES=[],PICKS=[],GRASS=[],FLORES=[];
const ZSPAWN={};       // posições de zumbis de dia por local
let LANTERN=[0,0,0],TOWER_TOP=[0,0,0],TOWER_PANEL=null;
const FIRE=[-1.2,0,0.5];FIRE[1]=ground(FIRE[0],FIRE[2]);
const TENT=[-3.9,-3.2],TENT_YAW=Math.atan2(FIRE[0]+3.9,FIRE[2]+3.2);
const BENCH=[4.4,-1.6];
const TREE_R=0.23;        // raio de colisão do tronco (× escala da árvore)
const SPAWN=[1.6,2.4];   // onde você acorda depois de cair (perto da barraca)
const INICIO=[8,44];      // começo do jogo: no meio da mata, ao sul da clareira
const TOWER=[-44,-110];
const BARRICADE_ARC={r:10.6,angs:[-56,-38,-20,20,38,56]};

const C_TRUNK=lin(0x4a3424),C_TRUNK2=lin(0x5a4330);
function interAdd(o){INTER.push(Object.assign({r:2.0,y:ground(o.x,o.z)},o));return o;}
const fwd=(yaw,d)=>[Math.sin(yaw)*d,Math.cos(yaw)*d];

function house(C,x,z,yaw,w,d,h,wall,roof,R,opts){opts=opts||{};const g=ground(x,z),b=mat(x,g,z,0,yaw,0);
  add(C,boxTris(w,h,d),mm(b,mat(0,h/2,0)),lin(wall),{j:0.04,rnd:R});
  add(C,boxTris(w+0.1,0.25,d+0.1),mm(b,mat(0,0.12,0)),scl(lin(wall),0.7));
  if(opts.flat)add(C,boxTris(w+0.5,0.3,d+0.5),mm(b,mat(0,h+0.15,0)),lin(roof));
  else add(C,roofTris(d+0.9,opts.rh||2.2,w+0.9),mm(b,mat(0,h,0,0,Math.PI/2,0)),lin(roof),{j:0.05,rnd:R});
  add(C,boxTris(1.05,2.05,0.1),mm(b,mat(opts.dx||0,1.02,d/2+0.03)),lin(opts.door||0x4a3424));
  const win=lin(0x1d262e);
  for(const sx of[-1,1]){if(w>5)add(C,boxTris(1.0,0.9,0.08),mm(b,mat(sx*w*0.3,1.75,d/2+0.03)),win);
    add(C,boxTris(0.08,0.9,1.0),mm(b,mat(sx*(w/2+0.03),1.75,0)),win);}
  if(opts.chimney)add(C,boxTris(0.6,1.8,0.6),mm(b,mat(w*0.28,h+1.2,-d*0.15)),lin(0x6b5a4c));
  colBox(x,z,w/2,d/2,yaw);
  const dp=fwd(yaw,d/2+0.7);return{dx:x+dp[0],dz:z+dp[1]};}
function carMesh(C,x,z,yaw,paint,R,trunkOpen){const base=mat(x,ground(x,z),z,0,yaw,0),rust=lin(0x7a4a2a),trim=lin(0x55595c);
  add(C,boxTris(1.8,0.56,4.2,{tx:0.98,tz:0.98}),mm(base,mat(0,0.64,0)),lin(paint),{j:0.05,rnd:R});
  add(C,boxTris(1.62,0.58,2.05,{tx:0.8,tz:0.72}),mm(base,mat(0,1.2,-0.3)),lin(0x1c2830));
  add(C,boxTris(1.32,0.07,1.5),mm(base,mat(0,1.52,-0.3)),lin(paint));
  add(C,boxTris(0.5,0.02,0.6),mm(base,mat(0.3,0.93,1.3,0,0.3,0)),rust);
  add(C,boxTris(1.84,0.16,0.14),mm(base,mat(0,0.42,2.12)),trim);add(C,boxTris(1.84,0.16,0.14),mm(base,mat(0,0.42,-2.12)),trim);
  for(const lx of[0.6,-0.6]){add(C,boxTris(0.32,0.12,0.04),mm(base,mat(lx,0.72,2.1)),lin(0xc9c6b5));add(C,boxTris(0.3,0.1,0.04),mm(base,mat(lx,0.78,-2.1)),lin(0x7a1f1a));}
  for(const wx of[0.86,-0.86])for(const wz of[1.35,-1.35]){
    add(C,cylTris(0.37,0.37,0.26,10),mm(base,mat(wx+0.13,0.37,wz,0,0,Math.PI/2)),lin(0x181818));
    add(C,cylTris(0.15,0.15,0.28,8),mm(base,mat(wx+0.14,0.37,wz,0,0,Math.PI/2)),trim);}
  if(trunkOpen){add(C,boxTris(1.6,0.06,0.82),mm(base,mm(mat(0,0.94,-1.32,1.1,0,0),mat(0,0,-0.41))),lin(paint));
    add(C,boxTris(1.5,0.02,0.7),mm(base,mat(0,0.93,-1.72)),lin(0x141414));}
  else add(C,boxTris(1.6,0.06,0.8),mm(base,mat(0,0.95,-1.72)),lin(paint));
  colBox(x,z,0.95,2.15,yaw);const t=fwd(yaw,-2.75);return{tx:x+t[0],tz:z+t[1]};}

function clearingProps(C,N,R){const fx=FIRE[0],fz=FIRE[2],y=FIRE[1];
  for(let i=0;i<10;i++){const a=i/10*6.283+R()*0.2;
    add(C,icoTris(0.17,0.35,R),mat(fx+Math.cos(a)*0.74,y+0.04,fz+Math.sin(a)*0.74,R(),R()*6,R(),1.25,0.8,1.05),mixc(lin(0x5d5a55),lin(0x7a766d),R()),{j:0.15,rnd:R});}
  add(N,cylTris(0.62,0.66,0.035,10),mat(fx,y-0.01,fz),lin(0x2a2622),{j:0.1,rnd:R});
  for(let i=0;i<5;i++){const a=i/5*6.283+0.4,bx=fx+Math.cos(a)*0.52,bz=fz+Math.sin(a)*0.52;
    add(C,cylTris(0.065,0.08,0.62,6),alignY(bx,y+0.02,bz,fx-bx,0.42,fz-bz),lin(0x5a3d27),{e:0.18,j:0.2,rnd:R});}
  for(let i=0;i<14;i++){const a=R()*6.283,r=R()*0.42,hot=R()<0.6;
    add(N,boxTris(0.09,0.06,0.09),mat(fx+Math.cos(a)*r,y+0.04,fz+Math.sin(a)*r,0,R()*3,0),hot?lin(0xff5418):lin(0x3a1d12),{e:hot?1.8:0,j:0.3,rnd:R});}
  colCircle(fx,fz,0.75);
  // barraca
  {const g=ground(TENT[0],TENT[1]),base=mat(TENT[0],g,TENT[1],0,TENT_YAW,0),ph=-Math.PI/2;
    add(C,cylTris(1.22,1.22,2.5,3,{phase:ph,bottom:true}),mm(base,mat(0,0.61,-1.25,Math.PI/2,0,0)),lin(0x4f5c3b),{j:0.07,rnd:R});
    add(C,cylTris(0.8,0.8,0.03,3,{phase:ph,bottom:true}),mm(base,mat(0,0.4,1.25,Math.PI/2,0,0)),lin(0x141812));
    add(C,boxTris(2.6,0.03,2.9),mm(base,mat(0,0.0,0.05)),lin(0x3a3f2e));
    colBox(TENT[0],TENT[1],1.1,1.3,TENT_YAW);const d=fwd(TENT_YAW,2.0);
    interAdd({id:'cama',kind:'cama',x:TENT[0]+d[0],z:TENT[1]+d[1],label:'Descansar na barraca',sub:'salva o jogo'});}
  // bancos
  for(const[bx,bz,yaw]of[[fx,fz+1.6,0.1],[fx-1.8,fz-0.7,1.2]]){add(C,cylTris(0.18,0.18,1.6,8),mm(mat(bx,ground(bx,bz)+0.17,bz,0,yaw,0),mat(0.8,0,0,0,0,Math.PI/2)),lin(0x4a3524),{j:0.1,rnd:R});
    colBox(bx,bz,0.8,0.22,yaw);}
  // bancada com rádio
  {const x=BENCH[0],z=BENCH[1],g=ground(x,z),base=mat(x,g,z,0,-0.35,0),wood=lin(0x7a5a3a),dark=lin(0x5a412a);
    add(C,boxTris(1.7,0.08,0.72),mm(base,mat(0,0.88,0)),wood,{j:0.08,rnd:R});
    for(const p of[[0.78,0.3],[-0.78,0.3],[0.78,-0.3],[-0.78,-0.3]])add(C,boxTris(0.08,0.86,0.08),mm(base,mat(p[0],0.43,p[1])),dark);
    add(C,boxTris(1.5,0.05,0.6),mm(base,mat(0,0.3,0)),dark);
    add(C,boxTris(0.56,0.015,0.13,{tz:0.5}),mm(base,mat(0.25,0.935,0.12,0,0.3,0)),lin(0x9aa1a6));
    add(C,boxTris(0.3,0.17,0.13),mm(base,mat(-0.3,1.005,0.18)),lin(0x2f3133));
    add(N,boxTris(0.1,0.05,0.012),mm(base,mat(-0.34,1.02,0.247)),lin(0x9be38b),{e:1.4});
    add(C,cylTris(0.006,0.006,0.42,4),mm(base,mat(-0.18,1.09,0.15,-0.3,0,-0.2)),lin(0x9aa1a6));
    for(let i=0;i<3;i++)add(C,boxTris(0.2,1.5,0.04),mm(base,mat(1.0,0.72,-0.32+i*0.27,-0.22,0,-0.2-i*0.04)),mixc(wood,dark,R()*0.5),{j:0.1,rnd:R});
    colBox(x,z,0.9,0.4,-0.35);const d=fwd(-0.35,1.1);
    interAdd({id:'bancada',kind:'bancada',x:x+d[0],z:z+d[1],label:'Usar o rádio',sub:'bancada de trabalho'});}
  // caixas
  const crate=(x,z,s,yaw,yo)=>{const g=ground(x,z)+yo,base=mat(x,g,z,0,yaw,0),c=mixc(lin(0x8a6a42),lin(0x74573a),R());
    add(C,boxTris(0.62*s,0.62*s,0.62*s),mm(base,mat(0,0.31*s,0)),c,{j:0.06,rnd:R});
    add(C,boxTris(0.645*s,0.07*s,0.645*s),mm(base,mat(0,0.08*s,0)),scl(c,0.6));add(C,boxTris(0.645*s,0.07*s,0.645*s),mm(base,mat(0,0.54*s,0)),scl(c,0.6));};
  crate(5.6,0.2,1,0.3,0);crate(5.68,0.22,0.85,-0.2,0.62);crate(6.35,-0.6,1,0.1,0);colCircle(5.9,-0.1,0.75);
  // barril de água
  {const x=-1.5,z=-4.8,g=ground(x,z),b=mat(x,g,z);add(C,cylTris(0.32,0.32,0.92,10),b,lin(0x2f5a78),{j:0.05,rnd:R});
    add(C,cylTris(0.336,0.336,0.06,10),mm(b,mat(0,0.16,0)),lin(0x22374a));add(C,cylTris(0.336,0.336,0.06,10),mm(b,mat(0,0.72,0)),lin(0x22374a));
    add(C,cylTris(0.28,0.28,0.02,10),mm(b,mat(0,0.92,0)),lin(0x23435a));colCircle(x,z,0.36);
    interAdd({id:'barril',kind:'agua',x,z:z+0.9,label:'Barril de água',sub:'beber ou encher garrafas'});}
  // lenha
  {const x=-2.9,z=-4.6,g=ground(x,z),base=mat(x,g,z,0,0.25,0),rows=[5,4,3];
    for(let r=0;r<3;r++)for(let i=0;i<rows[r];i++)add(C,cylTris(0.11,0.11,0.8,7),mm(base,mat((i-(rows[r]-1)/2)*0.235,0.11+r*0.2,-0.4,Math.PI/2,0,0)),mixc(lin(0x6b4a2e),lin(0x7d5835),R()),{j:0.1,rnd:R});
    colBox(x,z,0.65,0.45,0.25);}
  // poste com lampião
  {const x=5.6,z=-4.2,g=ground(x,z),b=mat(x,g,z);add(C,cylTris(0.055,0.07,2.15,6),b,lin(0x4a3424));
    add(C,boxTris(0.55,0.05,0.05),mm(b,mat(0.25,2.05,0)),lin(0x4a3424));add(C,boxTris(0.17,0.25,0.17),mm(b,mat(0.48,1.83,0)),lin(0x242424));
    add(C,cylTris(0,0.13,0.1,4,{phase:Math.PI/4}),mm(b,mat(0.48,1.955,0)),lin(0x242424));
    add(N,boxTris(0.13,0.19,0.18),mm(b,mat(0.48,1.83,0)),lin(0xffbf6a),{e:2.6});add(N,boxTris(0.18,0.19,0.13),mm(b,mat(0.48,1.83,0)),lin(0xffbf6a),{e:2.6});
    LANTERN=xf(b,0.48,1.83,0);colCircle(x,z,0.15);}
  // toco de cortar lenha
  {const x=SPAWN[0]+0.2,z=SPAWN[1]-1.4,g=ground(x,z)-0.05;add(C,cylTris(0.36*0.92,0.36,0.42,8),mat(x,g,z),lin(0x5a4330),{j:0.12,rnd:R});
    add(C,cylTris(0.33,0.33,0.025,8),mat(x,g+0.42,z),lin(0xa07a4c));colCircle(x,z,0.36);}
}

function gasStation(C,N,R){const P=placeById('posto'),cx=P.x,cz=P.z,white=lin(0xd9d6cc),teal=lin(0x2f6f73);
  // cobertura das bombas
  const ccz=cz+4;for(const px of[cx-6,cx+6])for(const pz of[ccz+4,ccz-4]){add(C,boxTris(0.36,4.4,0.36),mat(px,ground(px,pz)+2.2,pz),white);colBox(px,pz,0.18,0.18,0);}
  add(C,boxTris(14,0.45,9.6),mat(cx,4.6,ccz),white);add(C,boxTris(14.1,0.5,9.7),mat(cx,4.2,ccz),teal);
  for(const px of[cx-2.5,cx+2.5]){const g=ground(px,ccz);add(C,boxTris(1.1,0.25,1.6),mat(px,g+0.12,ccz),lin(0x8d8a80));
    add(C,boxTris(0.75,1.55,0.5),mat(px,g+1.0,ccz),lin(0xc9c4b8));add(C,boxTris(0.5,0.35,0.52),mat(px,g+1.45,ccz),lin(0x1f2a2e));
    add(C,boxTris(0.06,0.9,0.06),mat(px+0.42,g+0.9,ccz+0.1,0,0,0.2),lin(0x151515));colBox(px,ccz,0.55,0.8,0);}
  // loja e oficina
  const loja=house(C,cx-3,cz-8,0,11,7,3.8,0xb8b2a4,0x5b5f63,R,{flat:true,door:0x2b3238});
  add(C,boxTris(8,1.0,0.12),mat(cx-3,ground(cx-3,cz-8)+1.75,cz-8+3.55),lin(0x26323a));
  add(C,boxTris(6.5,1.0,0.25),mat(cx-3,ground(cx-3,cz-8)+4.6,cz-8+3.4),teal);add(C,boxTris(6.0,0.25,0.27),mat(cx-3,ground(cx-3,cz-8)+4.6,cz-8+3.4),white);
  const ofi=house(C,cx+6.5,cz-8,0,7,7,4.2,0xa7a194,0x4d5156,R,{flat:true,door:0x55595c});
  add(C,boxTris(4.2,3.2,0.1),mat(cx+6.5,ground(cx+6.5,cz-8)+1.6,cz-8+3.56),lin(0x7d8186));
  for(let i=0;i<7;i++)add(C,boxTris(4.2,0.04,0.12),mat(cx+6.5,ground(cx+6.5,cz-8)+0.3+i*0.45,cz-8+3.58),lin(0x5f6368));
  interAdd({id:'posto-loja',kind:'bau',x:loja.dx,z:loja.dz,label:'Revistar a loja',tabela:'mercado',respawn:3,primeiro:[['gasolina',1]]});
  interAdd({id:'posto-oficina',kind:'bau',x:cx+6.5,z:cz-8+4.3,label:'Revistar a oficina',tabela:'oficina',respawn:3,missao:'bateria',primeiro:[['machado',1]]});
  // carros
  const c1=carMesh(C,cx+11,cz+5,0.35,0x8a3a2e,R,true);interAdd({id:'posto-carro1',kind:'bau',x:c1.tx,z:c1.tz,label:'Revistar o porta-malas',tabela:'carro',respawn:4});
  const c2=carMesh(C,cx-12,roadZ(cx-12)-0.6,1.9,0x3f6a6b,R,true);interAdd({id:'posto-carro2',kind:'bau',x:c2.tx,z:c2.tz,label:'Revistar o porta-malas',tabela:'carro',respawn:4});
  // caçamba, pneus, tambores
  {const x=cx-10,z=cz-9;add(C,boxTris(2.2,1.3,1.4,{tx:1.08,tz:1.1}),mat(x,ground(x,z)+0.65,z,0,0.2,0),lin(0x2f5a3a));colBox(x,z,1.1,0.7,0.2);
    interAdd({id:'posto-cacamba',kind:'bau',x:x+0.3,z:z+1.4,label:'Revistar a caçamba',tabela:'lixo',respawn:2});}
  for(let i=0;i<3;i++){const x=cx+11+i*0.9,z=cz-12;add(C,cylTris(0.3,0.3,0.9,9),mat(x,ground(x,z),z),lin(i===1?0x8a2f22:0x355a7a),{j:0.08,rnd:R});colCircle(x,z,0.32);}
  for(let i=0;i<4;i++){const x=cx+13,z=cz-6+i*0.2;add(C,cylTris(0.38,0.38,0.24,10,{top:true}),mat(x,ground(x,z)+i*0.24,z),lin(0x1a1a1a));}colCircle(cx+13,cz-5.7,0.45);
  ZSPAWN.posto=[[cx,cz+4],[cx-6,cz-2],[cx+8,cz+1],[cx-2,cz+10],[cx+10,cz-14],[cx-12,cz-3]];}

function farm(C,N,R){const P=placeById('fazenda'),cx=P.x,cz=P.z;
  const casa=house(C,cx+7,cz-6,Math.PI*0.85,9,7,3.3,0xc9b89a,0x6e2f22,R,{chimney:true,rh:2.4});
  interAdd({id:'faz-casa',kind:'bau',x:casa.dx,z:casa.dz,label:'Revistar a casa',tabela:'casa',respawn:3});
  // celeiro
  {const x=cx-11,z=cz+5,yaw=0.15,g=ground(x,z),b=mat(x,g,z,0,yaw,0);
    add(C,boxTris(12,5,9),mm(b,mat(0,2.5,0)),lin(0x8a2f22),{j:0.05,rnd:R});
    add(C,roofTris(9.8,3.2,12.8),mm(b,mat(0,5,0,0,Math.PI/2,0)),lin(0x3d4246));
    add(C,boxTris(4.2,3.8,0.12),mm(b,mat(0,1.9,4.52)),lin(0x5e1f17));
    add(C,boxTris(0.16,3.9,0.14),mm(b,mat(0,1.95,4.56)),lin(0xd8d0c0));add(C,boxTris(4.4,0.16,0.14),mm(b,mat(0,3.85,4.56)),lin(0xd8d0c0));
    add(C,boxTris(0.14,4.2,0.14),mm(b,mat(0,1.9,4.58,0,0,0.83)),lin(0xd8d0c0));add(C,boxTris(0.14,4.2,0.14),mm(b,mat(0,1.9,4.58,0,0,-0.83)),lin(0xd8d0c0));
    colBox(x,z,6,4.5,yaw);const d=fwd(yaw,5.3);
    interAdd({id:'faz-celeiro',kind:'bau',x:x+d[0],z:z+d[1],label:'Revistar o celeiro',tabela:'celeiro',respawn:3,missao:'cabo'});}
  // poço
  {const x=cx+2,z=cz-14,g=ground(x,z);add(C,cylTris(0.95,1.0,0.8,10,{top:false}),mat(x,g,z),lin(0x7d7a72),{j:0.1,rnd:R});
    add(C,cylTris(0.8,0.8,0.05,10),mat(x,g+0.7,z),lin(0x1a2a33));
    for(const sx of[-0.85,0.85])add(C,boxTris(0.12,1.9,0.12),mat(x+sx,g+0.95,z),lin(0x5a412a));
    add(C,roofTris(1.6,0.7,2.2),mat(x,g+1.9,z,0,Math.PI/2,0),lin(0x6e2f22));
    colCircle(x,z,1.05);interAdd({id:'poco',kind:'agua',x,z:z+1.6,label:'Poço',sub:'beber ou encher garrafas'});}
  // cerca e plantação
  {const x0=cx+10,z0=cz+6,w=18,dd=14;for(let i=0;i<=Math.round(w/2.5);i++)for(const zz of[z0,z0+dd]){const x=x0+i*(w/Math.round(w/2.5));add(C,boxTris(0.12,1.1,0.12),mat(x,ground(x,zz)+0.55,zz),lin(0x6b5034));}
    for(let i=0;i<=Math.round(dd/2.5);i++)for(const xx of[x0,x0+w]){const z=z0+i*(dd/Math.round(dd/2.5));add(C,boxTris(0.12,1.1,0.12),mat(xx,ground(xx,z)+0.55,z),lin(0x6b5034));}
    const gx0=x0+w*3/7,gx1=x0+w*4/7;   // porteira: vão entre o 4º e o 5º mourão da frente
    for(const hh of[0.45,0.9]){add(N,boxTris(w,0.07,0.05),mat(x0+w/2,ground(x0+w/2,z0+dd)+hh,z0+dd),lin(0x7a5a3a));
      for(const[a,b]of[[x0,gx0],[gx1,x0+w]])add(N,boxTris(b-a,0.07,0.05),mat((a+b)/2,ground((a+b)/2,z0)+hh,z0),lin(0x7a5a3a));}
    {const seg=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az);colBox((ax+bx)/2,(az+bz)/2,L/2,0.08,Math.atan2(-(bz-az)/L,(bx-ax)/L));};
      seg(x0,z0,gx0,z0);seg(gx1,z0,x0+w,z0);seg(x0,z0+dd,x0+w,z0+dd);seg(x0,z0,x0,z0+dd);seg(x0+w,z0,x0+w,z0+dd);}
    for(const xx of[x0,x0+w])for(const hh of[0.45,0.9])add(N,boxTris(0.05,0.07,dd),mat(xx,ground(xx,z0+dd/2)+hh,z0+dd/2),lin(0x7a5a3a));
    // 7 fileiras de terra; cada uma vira 3 canteiros onde dá para plantar e colher (as plantas são desenhadas pelo plantio)
    for(let r=0;r<7;r++){const z=z0+1.5+r*1.8;add(N,boxTris(w-2,0.18,0.6),mat(x0+w/2,ground(x0+w/2,z)+0.05,z),lin(0x3d3127));
      for(let j=0;j<3;j++){const a=x0+1+(w-2)*j/3+0.15,b=x0+1+(w-2)*(j+1)/3-0.15;PLANTIO_DEF.push({id:'faz'+r+'_'+j,ax:a,az:z,bx:b,bz:z,y:ground((a+b)/2,z)+0.14,tipo:'fazenda'});}}}
  // fardos de feno
  for(let i=0;i<4;i++){const x=cx-3+i*1.4,z=cz+12+(i%2)*0.3;add(C,cylTris(0.6,0.6,1.1,10),mm(mat(x,ground(x,z)+0.6,z,0,0.3,0),mat(0,0,-0.55,Math.PI/2,0,0)),lin(0xc8a54e),{j:0.1,rnd:R});colCircle(x,z,0.62);}
  // trator
  {const x=cx-2,z=cz-4,yaw=2.2,g=ground(x,z),b=mat(x,g,z,0,yaw,0),red=lin(0x9a3a1c);
    add(C,boxTris(1.1,0.9,2.6),mm(b,mat(0,1.1,0.2)),red,{j:0.1,rnd:R});add(C,boxTris(0.9,0.7,1.0),mm(b,mat(0,1.85,-0.6)),red);
    add(C,boxTris(0.1,0.9,0.1),mm(b,mat(0.3,1.9,1.1)),lin(0x2a2a2a));
    for(const sx of[0.85,-0.85]){add(C,cylTris(0.75,0.75,0.4,12),mm(b,mat(sx+0.2,0.75,-0.7,0,0,Math.PI/2)),lin(0x1b1b1b));
      add(C,cylTris(0.42,0.42,0.28,10),mm(b,mat(sx*0.75+0.14,0.42,1.2,0,0,Math.PI/2)),lin(0x1b1b1b));}
    colBox(x,z,1.2,1.7,yaw);const t=fwd(yaw,-2.4);
    interAdd({id:'faz-trator',kind:'bau',x:x+t[0],z:z+t[1],label:'Revistar a caixa do trator',tabela:'oficina',respawn:4});}
  ZSPAWN.fazenda=[[cx,cz],[cx+12,cz+10],[cx-8,cz-6],[cx+4,cz+16],[cx-14,cz+14]];}

/* vila e sítios: casas de verdade (dá para entrar), quintais e estradas — montados em 14c_rurais.js */
function village(C,N,R){vilaMontar(C,N);}
function sitios(C,N,R){sitiosMontar(C,N);}

function towerSite(C,N,R,TW2){const tx=TOWER[0],tz=TOWER[1],ty=ground(tx,tz)-0.5,H=20,c=lin(0x7d848a);
  const beam=(a,b,w)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2]);add(TW2,boxTris(w,L,w),mm(alignY(a[0],a[1],a[2],d[0],d[1],d[2]),mat(0,L/2,0)),c);};
  const leg=(sx,sz,h)=>{const k=lerp(2.4,0.45,h/H);return[tx+sx*k,ty+h,tz+sz*k];};
  const corners=[[1,1],[1,-1],[-1,-1],[-1,1]];
  for(const q of corners){beam(leg(q[0],q[1],0),leg(q[0],q[1],H),0.24);add(C,boxTris(0.6,0.5,0.6),mat(tx+q[0]*2.4,ty+0.2,tz+q[1]*2.4),lin(0x8d8a80));}
  for(let h=0;h<H-3;h+=4)for(let i=0;i<4;i++){const q=corners[i],r=corners[(i+1)%4];beam(leg(q[0],q[1],h),leg(r[0],r[1],h+4),0.1);beam(leg(r[0],r[1],h),leg(q[0],q[1],h+4),0.1);}
  add(TW2,boxTris(1.6,0.2,1.6),mat(tx,ty+H,tz),c);beam([tx,ty+H,tz],[tx,ty+H+6,tz],0.14);
  add(TW2,boxTris(0.2,1.2,0.9),mat(tx+0.5,ty+H-2,tz,0,0.4,0),lin(0xb8bcc0));
  TOWER_TOP=[tx,ty+H+6.2,tz];
  for(const q of corners)colCircle(tx+q[0]*2.4,tz+q[1]*2.4,0.4);
  // cerca e painel
  for(let i=0;i<16;i++){const a=i/16*6.283,x=tx+Math.cos(a)*6,z=tz+Math.sin(a)*6;if(i===4)continue;add(C,boxTris(0.08,1.8,0.08),mat(x,ground(x,z)+0.9,z),lin(0x6b7075));}
  {const x=tx+2.5,z=tz+4,g=ground(x,z);add(C,boxTris(1.2,1.6,0.6),mat(x,g+0.8,z,0,0.3,0),lin(0x8d9296));add(C,boxTris(0.9,0.5,0.05),mat(x,g+1.1,z+0.3,0,0.3,0),lin(0x1d262e));
    colBox(x,z,0.6,0.3,0.3);TOWER_PANEL=interAdd({id:'painel-torre',kind:'torre',x:x+0.3,z:z+1.0,label:'Painel da torre',sub:'instalar as peças'});}
  ZSPAWN.torre=[[tx+4,tz+8],[tx-6,tz+3],[tx+8,tz-2]];}

function silhouettes(){const U=new GB(1<<13,7);
  const ring=(Rr,n,hb,ha,f,br,ft,sd)=>{const hh=a=>hb+(vnoise(Math.cos(a)*f+sd,Math.sin(a)*f)*0.7+vnoise(Math.cos(a)*f*3+sd,Math.sin(a)*f*3)*0.3)*ha;
    for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,h0=hh(a0),h1=hh(a1);
      const b0=[Rr*Math.cos(a0),-8,Rr*Math.sin(a0)],b1=[Rr*Math.cos(a1),-8,Rr*Math.sin(a1)],t0=[b0[0],h0,b0[2]],t1=[b1[0],h1,b1[2]];
      for(const[p,g]of[[b0,1],[b1,1],[t1,ft],[b0,1],[t1,ft],[t0,ft]])U.v7(p[0],p[1],p[2],br,g,0,1);}};
  ring(490,150,23,68,2.2,1.2,0.45,3);ring(430,130,13,36,3.1,0.82,0.24,11);
  return U.data();}
function towerSilhouette(){const U=new GB(1<<12,7),tx=TOWER[0],tz=TOWER[1],ty=ground(tx,tz)-0.5,H=20,c=[0.62,0.3,0,1];
  const beam=(a,b,w)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2]);addU(U,boxTris(w,L,w),mm(alignY(a[0],a[1],a[2],d[0],d[1],d[2]),mat(0,L/2,0)),c);};
  const leg=(sx,sz,h)=>{const k=lerp(2.4,0.45,h/H);return[tx+sx*k,ty+h,tz+sz*k];};const corners=[[1,1],[1,-1],[-1,-1],[-1,1]];
  for(const q of corners)beam(leg(q[0],q[1],0),leg(q[0],q[1],H),0.42);
  for(let h=0;h<H-3;h+=4)for(let i=0;i<4;i++){const q=corners[i],r=corners[(i+1)%4];beam(leg(q[0],q[1],h),leg(r[0],r[1],h+4),0.22);beam(leg(r[0],r[1],h),leg(q[0],q[1],h+4),0.22);}
  addU(U,boxTris(1.8,0.25,1.8),mat(tx,ty+H,tz),c);beam([tx,ty+H,tz],[tx,ty+H+6,tz],0.22);return U.data();}

/* ---------- terreno: cor base suave, terra por vértice e mapa de pisos ---------- */
const TC={G1:lin(0x46632d),G2:lin(0x56702f),F1:lin(0x2d4322),F2:lin(0x374a24),LIT:lin(0x4b3f27),DIRT:lin(0x47392a),DIRT2:lin(0x5c4a33),
  ASF:lin(0x3d3d3b),TERRA:lin(0x6a5a45),ROCK:lin(0x5a5950),PAD:lin(0x56544c)};
function mata(x,z){let m=1;for(const p of PLACES){const d=Math.hypot(x-p.x,z-p.z);m=Math.min(m,smooth(p.r*0.8,p.r+10,d));}return m;}
function groundCol(x,z){const n1=vnoise(x*0.15+40,z*0.15-12),n2=vnoise(x*0.45,z*0.45+70),n0=vnoise(x*0.03-3,z*0.03+8),m=mata(x,z);
  let c=mixc(mixc(TC.G1,TC.G2,n1),mixc(TC.F1,TC.F2,n1),m);
  if(m>0.6&&n2>0.6)c=mixc(c,TC.LIT,0.45*smooth(0.6,0.75,n2));
  return aguaCorChao(x,z,mixc(c,scl(c,1.22),smooth(0.45,0.8,n0)*0.55));}
function dirtAmt(x,z){let d=0;const fd=Math.hypot(x-FIRE[0],z-FIRE[2]);if(fd<3.8)d=smooth(3.8,1.5,fd);
  const n1=vnoise(x*0.15+40,z*0.15-12);if(mata(x,z)<0.5&&n1>0.58)d=Math.max(d,smooth(0.58,0.74,n1)*0.75);
  const td=Math.hypot(x-TOWER[0],z-TOWER[1]);if(td<8)d=Math.max(d,smooth(8,5,td)*0.8);
  const f=placeById('fazenda');if(Math.hypot(x-(f.x-11),z-(f.z+10))<6)d=Math.max(d,0.6);
  return d;}
function terrainData(){const n=TW*TW,data=new Float32Array(n*10);
  for(let j=0;j<=T_N;j++)for(let i=0;i<=T_N;i++){const k=j*TW+i,x=GX[i],z=GX[j];
    const i0=Math.max(0,i-1),i1=Math.min(T_N,i+1),j0=Math.max(0,j-1),j1=Math.min(T_N,j+1);
    const dx=(TH[j*TW+i1]-TH[j*TW+i0])/(GX[i1]-GX[i0]),dz=(TH[j1*TW+i]-TH[j0*TW+i])/(GX[j1]-GX[j0]);
    const l=Math.hypot(dx,1,dz),c=groundCol(x,z),o=k*10;
    data[o]=x;data[o+1]=TH[k];data[o+2]=z;data[o+3]=-dx/l;data[o+4]=1/l;data[o+5]=-dz/l;data[o+6]=c[0];data[o+7]=c[1];data[o+8]=c[2];data[o+9]=dirtAmt(x,z);}
  const idx=new Uint16Array(T_N*T_N*6);let q=0;const dentro=(i,j)=>dentroCidade(GX[i],GX[j],-0.5);
  for(let j=0;j<T_N;j++)for(let i=0;i<T_N;i++){if(dentro(i,j)&&dentro(i+1,j)&&dentro(i,j+1)&&dentro(i+1,j+1))continue;   // o chão da cidade cobre
    const A=j*TW+i,B=(j+1)*TW+i,C=B+1,D=A+1;idx[q++]=A;idx[q++]=B;idx[q++]=C;idx[q++]=A;idx[q++]=C;idx[q++]=D;}
  return{data,idx:idx.slice(0,q)};}
/* mapa de pisos 1024² sobre ±180 m: R asfalto, G estrada de terra/trilha, B concreto do posto */
const SPLAT_S=1024,SPLAT_H=180;
function splatData(){const S=SPLAT_S,H=SPLAT_H,ts=2*H/S,D=new Uint8Array(S*S*4);
  const put=(ch,i,j,v)=>{const o=(j*S+i)*4+ch,b=Math.round(clamp(v,0,1)*255);if(b>D[o])D[o]=b;};
  const box=(x0,x1,z0,z1,f)=>{const i0=Math.max(0,Math.floor((x0+H)/ts)),i1=Math.min(S-1,Math.ceil((x1+H)/ts)),j0=Math.max(0,Math.floor((z0+H)/ts)),j1=Math.min(S-1,Math.ceil((z1+H)/ts));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)f(i,j,-H+(i+0.5)*ts,-H+(j+0.5)*ts);};
  for(const r of ROADS){const ch=r.cor==='asfalto'?0:1,amp=r.cor==='trilha'?0.8:1,hw=r.w/2,jit=ch?0.9:0.3;
    for(let s=0;s<r.pts.length-1;s++){const a=r.pts[s],b=r.pts[s+1],m=hw+1.6;
      box(Math.min(a[0],b[0])-m,Math.max(a[0],b[0])+m,Math.min(a[1],b[1])-m,Math.max(a[1],b[1])+m,(i,j,x,z)=>{
        const d=segDist(x,z,a[0],a[1],b[0],b[1]),e=hw+(vnoise(x*0.55+7,z*0.55-3)-0.5)*jit*2;if(d>e+0.5)return;if(aguaPerto(x,z,0.6))return;put(ch,i,j,smooth(e+0.45,e-0.3,d)*amp);});}}
  const pp=placeById('posto'),R=14.5;
  box(pp.x-R-2,pp.x+R+2,pp.z-R-2,pp.z+R+2,(i,j,x,z)=>{const d=Math.hypot(x-pp.x,z-pp.z)+(vnoise(x*0.4,z*0.4)-0.5)*2.4;put(2,i,j,smooth(R+0.8,R-0.6,d));});
  return D;}

/* ---------- vegetação e recursos (instanciados) ---------- */
function freeSpot(x,z,margin){
  for(const p of PLACES)if(Math.hypot(x-p.x,z-p.z)<p.r+margin)return false;
  if(ruralEm(x,z,margin))return false;
  if(distCidade(x,z)<margin+5)return false;
  const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+margin*0.6+0.8)return false;
  if(pointBlocked(x,z,margin*0.6))return false;
  if(!VEG_GERANDO&&(aguaPerto(x,z,margin+1)||aguaPoi(x,z)))return false;
  return true;}
function placeVegetation(){VEG_GERANDO=true;try{placeVegetation0();}finally{VEG_GERANDO=false;}aguaLimparVegetacao();serraPedras();}
function placeVegetation0(){const R=rng(31337);gerarGigantes();
  const CLAREIRINHAS=[];{const RC=rng(4711);for(let i=0;i<40&&CLAREIRINHAS.length<12;i++){const a=RC()*6.283,r=40+RC()*100,x=Math.cos(a)*r,z=Math.sin(a)*r;if(mata(x,z)>0.9)CLAREIRINHAS.push([x,z,5+RC()*3]);}}
  const G=new Map(),K=(gx,gz)=>(gx+500)*1000+(gz+500);
  const near=(x,z,d)=>{const gx=Math.floor(x/4),gz=Math.floor(z/4);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=G.get(K(gx+a,gz+b));if(l)for(const p of l)if((p[0]-x)**2+(p[1]-z)**2<d*d)return true;}return false;};
  let tries=0,id=0;
  while(TREES.length<2700&&tries<140000){tries++;
    const x=(R()*2-1)*175,z=(R()*2-1)*175,r=Math.hypot(x,z);if(r>178)continue;
    if(r<20)continue;
    if(GIGANTES.some(g=>(g.x-x)**2+(g.z-z)**2<(g.R+5.5)**2)||CLAREIRINHAS.some(c=>(c[0]-x)**2+(c[1]-z)**2<c[2]*c[2]))continue;
    if(!freeSpot(x,z,3.5))continue;
    const dense=r>MAP_R-8?1:lerp(0.72,1,vnoise(x*0.02+9,z*0.02-4));
    if(R()>dense)continue;
    if(near(x,z,r>MAP_R?2.6:2.75))continue;
    const k=K(Math.floor(x/4),Math.floor(z/4));if(!G.has(k))G.set(k,[]);G.get(k).push([x,z]);
    let kind=R()<0.72?0:R()<0.8?1:2;const s=R()<0.12?2.2+R()*0.8:1.15+R()*0.9;if(kind===1&&hash2(Math.floor(x*7),Math.floor(z*7))<0.4)kind=3;else if(kind===0&&hash2(Math.floor(x*5),Math.floor(z*9))<0.1)kind=3;
    const t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.85+R()*0.3};if(kind===1&&hash2(Math.floor(z*3),Math.floor(x*3))<0.18){t.tr=1.3*t.t;t.tg=1.0*t.t;t.tb=0.55*t.t;}
    TREES.push(t);if(r<MAP_R+6||dentroMapa(x,z,-3))colCircle(x,z,TREE_R*s,{tree:t});}
  for(let i=0;i<170;i++){const x=(R()*2-1)*150,z=(R()*2-1)*150;if(Math.hypot(x,z)<16||!freeSpot(x,z,2.5))continue;
    const s=0.5+Math.pow(R(),2)*1.1;const rk={id:ROCKS.length,x,z,y:ground(x,z)-s*0.25,s,r:R()*6.283,hp:4,alive:true,t:0.85+R()*0.3};ROCKS.push(rk);colCircle(x,z,0.85*s,{rock:rk});}
  for(let i=0;i<460;i++){const x=(R()*2-1)*145,z=(R()*2-1)*145;if(Math.hypot(x,z)<9||!freeSpot(x,z,1.4))continue;
    BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s:0.8+R()*0.5,r:R()*6.283,frutas:R()<0.75,cresce:0,t:0.85+R()*0.3});}
  const pk=(kind,n,minR,maxR)=>{for(let i=0;i<n;i++){const a=R()*6.283,rr=minR+R()*(maxR-minR),x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(!freeSpot(x,z,0.8))continue;
    PICKS.push({id:PICKS.length,kind,x,z,y:ground(x,z),r:R()*6.283,s:0.8+R()*0.5,alive:true,t:0.9+R()*0.2});}};
  pk('pedra',150,6,140);pk('galho',150,6,140);pk('cogumelo',70,15,140);pk('fibra',150,7,140);
  for(const g of GIGANTES)for(let k=0;k<3;k++){const a=R()*6.283,rr=g.R+2+R()*4,x=g.x+Math.cos(a)*rr,z=g.z+Math.sin(a)*rr;if(freeSpot(x,z,0.5))PICKS.push({id:PICKS.length,kind:'galho',x,z,y:ground(x,z),r:R()*6.283,s:1+R()*0.3,alive:true,t:0.9+R()*0.2});}
  samambaiasETroncos(R);folhasDoChao(R);
  for(let i=0;i<16000;i++){const x=(R()*2-1)*150,z=(R()*2-1)*150;const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.3)continue;
    if(Math.hypot(x-FIRE[0],z-FIRE[2])<2.2)continue;let inPlace=false;for(const p of PLACES)if(p.id!=='clareira'&&Math.hypot(x-p.x,z-p.z)<p.r*0.7)inPlace=true;if(inPlace&&R()<0.8)continue;
    if(pointBlocked(x,z,0.4)||ruralCasaEm(x,z,0.3))continue;GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.7+R()*0.6,t:0.8+R()*0.4});}
  const RF=rng(4242),PAL=[[1,1,1],[1,0.86,0.22],[0.72,0.46,1],[1,0.48,0.62],[0.5,0.62,1]];
  for(let i=0;i<9000&&FLORES.length<2600;i++){const x=(RF()*2-1)*150,z=(RF()*2-1)*150;if(vnoise(x*0.07+5,z*0.07-9)<0.56)continue;
    const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.4)continue;if(mata(x,z)>0.85&&RF()<0.8)continue;if(Math.hypot(x-FIRE[0],z-FIRE[2])<3)continue;if(pointBlocked(x,z,0.3)||ruralCasaEm(x,z,0.3))continue;
    const c=PAL[Math.floor(vnoise(x*0.05-20,z*0.05+31)*PAL.length*0.999)],k=0.85+RF()*0.3;FLORES.push({x,z,y:ground(x,z)-0.01,r:RF()*6.283,s:0.8+RF()*0.7,tr:c[0]*k,tg:c[1]*k,tb:c[2]*k});}
}

/* ---------- camadas da mata: samambaias (instanciadas) e troncos caídos (dá para subir em cima dos baixos) ---------- */
const SAMAMBAIAS=[],TRONCOS=[],FOLHAS_CHAO=[];
/* folhas secas, gravetos e pedrinhas: mais na mata e embaixo das árvores, nada na estrada, dentro de casa ou na água */
function folhasDoChao(R){for(let i=0;i<16000&&FOLHAS_CHAO.length<5200;i++){const x=(R()*2-1)*148,z=(R()*2-1)*148,m=mata(x,z);if(Math.hypot(x,z)<9)continue;
    if(m<0.35&&R()>0.25)continue;const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.2)continue;if(pointBlocked(x,z,0.3)||ruralEm(x,z,0.3))continue;
    const v=vnoise(x*0.07+11,z*0.07-4),k=0.75+R()*0.4;FOLHAS_CHAO.push({x,z,y:ground(x,z)+0.005,r:R()*6.283,s:0.7+R()*0.7,tr:k*(0.9+v*0.25),tg:k*(0.85+v*0.1),tb:k*0.8});}}
function samambaiasETroncos(R){
  for(let i=0;i<9000&&SAMAMBAIAS.length<3200;i++){const x=(R()*2-1)*148,z=(R()*2-1)*148;if(Math.hypot(x,z)<16||mata(x,z)<0.72)continue;
    const ri=roadInfo(x,z);if(ri.road&&ri.d<ri.road.w/2+0.6)continue;if(pointBlocked(x,z,0.25)||ruralEm(x,z,0.5))continue;
    SAMAMBAIAS.push({x,z,y:ground(x,z)-0.03,r:R()*6.283,s:0.7+R()*0.7,t:0.8+R()*0.35});}
  for(let i=0;i<400&&TRONCOS.length<70;i++){const a=R()*6.283,r=24+R()*122,x=Math.cos(a)*r,z=Math.sin(a)*r;if(mata(x,z)<0.85||!freeSpot(x,z,2.2))continue;
    const yaw=R()*6.283,L=3.5+R()*5.5,rad=0.22+R()*0.24,dx=Math.sin(yaw)*L/2,dz=Math.cos(yaw)*L/2;
    if(pointBlocked(x+dx,z+dz,0.6)||pointBlocked(x-dx,z-dz,0.6))continue;if(TRONCOS.some(t=>Math.hypot(t.x-x,t.z-z)<6))continue;
    const ya=ground(x-dx,z-dz)+rad*0.75,yb=ground(x+dx,z+dz)+rad*0.75;TRONCOS.push({x,z,yaw,L,rad,ax:x-dx,az:z-dz,ay:ya,bx:x+dx,bz:z+dz,by:yb,musgo:R()<0.6});}
  for(const t of TRONCOS){supAdd({t:'seg',ax:t.ax,az:t.az,ay:t.ay,bx:t.bx,bz:t.bz,by:t.by,r0:t.rad,r1:t.rad*0.92,larg:0.8,dono:'tronco'});
    if(t.rad>0.3)colBox(t.x,t.z,t.rad*0.9,t.L/2,t.yaw,{y0:Math.min(t.ay,t.by)-1,y1:Math.max(t.ay,t.by)+t.rad*0.9,tronco:t});}}
function troncosGeometry(C,R){const cas=lin(0x4d3826),musgo=lin(0x3f5a2a),dentro=lin(0x8a6a45);
  for(const t of TRONCOS){const L=Math.hypot(t.bx-t.ax,t.by-t.ay,t.bz-t.az);add(C,cylTris(t.rad*0.92,t.rad,L,8),alignY(t.ax,t.ay,t.az,t.bx-t.ax,t.by-t.ay,t.bz-t.az),cas,{j:0.14,rnd:R});
    add(C,cylTris(t.rad*0.93,t.rad*0.93,0.02,8),alignY(t.bx,t.by,t.bz,t.bx-t.ax,t.by-t.ay,t.bz-t.az),dentro);
    if(t.musgo)add(C,ellipTris(t.rad*1.02,t.rad*0.35,L*0.32,7,4),mat((t.ax+t.bx)/2,(t.ay+t.by)/2+t.rad*0.72,(t.az+t.bz)/2,0,t.yaw,0),musgo,{j:0.2,rnd:R});
    for(let k=0;k<2;k++){const u=0.3+k*0.35,px=t.ax+(t.bx-t.ax)*u,py=t.ay+(t.by-t.ay)*u,pz=t.az+(t.bz-t.az)*u,sd=k?1:-1;
      add(C,cylTris(0.02,0.06,0.9,5),alignY(px,py+t.rad*0.5,pz,Math.cos(t.yaw)*sd,0.7,-Math.sin(t.yaw)*sd),cas,{j:0.15,rnd:R});}}}

/* ---------- coisas sinistras na mata e caixas escondidas ---------- */
const SINISTROS=[];
function sinistros(C,N,R){
  const pega=(minR,maxR,margem,minMata)=>{for(let t=0;t<260;t++){const a=R()*6.283,r=minR+R()*(maxR-minR),x=Math.cos(a)*r,z=Math.sin(a)*r;
      if(mata(x,z)<(minMata||0.9)||!freeSpot(x,z,margem))continue;if(SINISTROS.some(s=>Math.hypot(s.x-x,s.z-z)<10))continue;return[x,z];}return null;};
  const graveto=lin(0x5a4430),corda=lin(0xb9a77a),osso=lin(0xd9d1bd),pano=lin(0x7a1f1a),terra=lin(0x3b2e22),cinza=lin(0x6d6c64),escuro=lin(0x141210);
  const vara=(a,b,r,c)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);add(C,cylTris(r*0.8,r,L,5),alignY(a[0],a[1],a[2],b[0]-a[0],b[1]-a[1],b[2]-a[2]),c,{j:0.15,rnd:R});};
  const loc=(x,z,yaw)=>(lx,ly,lz)=>[x+lx*Math.cos(yaw)+lz*Math.sin(yaw),ground(x,z)+ly,z-lx*Math.sin(yaw)+lz*Math.cos(yaw)];
  // bonecos de gravetos amarrados, de pé entre as árvores
  for(let i=0;i<14;i++){const p=pega(26,145,1.2);if(!p)continue;const[x,z]=p,yaw=R()*6.283,s=0.9+R()*0.35,L=loc(x,z,yaw),V=(a,b,r)=>vara(L(a[0]*s,a[1]*s,a[2]*s),L(b[0]*s,b[1]*s,b[2]*s),r,graveto);
    V([0,-0.1,0],[0,2.05,0],0.035);V([-0.5,1.5,0],[0.5,1.52,0],0.025);V([0,1.0,0],[-0.32,0.1,0.05],0.022);V([0,1.0,0],[0.3,0.1,-0.04],0.022);
    V([-0.18,1.85,0],[0.18,1.85,0],0.016);V([0,1.72,0],[0,2.18,0],0.018);
    for(const y of[1.5,1.0,1.85]){const c=L(0,y*s-0.03,0);add(C,cylTris(0.045*s,0.045*s,0.06*s,6),mat(c[0],c[1],c[2]),corda);}
    if(R()<0.5){const c=L(0,1.28*s,0.045);add(C,boxTris(0.32*s,0.42*s,0.02),mat(c[0],c[1],c[2],0.1,yaw,0),pano,{j:0.1,rnd:R});}
    colCircle(x,z,0.18);SINISTROS.push({x,z,tipo:'boneco'});}
  // estacas com caveira e ossos pendurados
  for(let i=0;i<12;i++){const p=pega(30,145,1.0);if(!p)continue;const[x,z]=p,g=ground(x,z),yaw=R()*6.283,fx=Math.sin(yaw),fz=Math.cos(yaw);
    add(C,cylTris(0.035,0.05,1.55,6),mat(x,g-0.05,z),graveto,{j:0.12,rnd:R});
    add(C,ellipTris(0.12,0.11,0.14,10,7),mat(x,g+1.62,z,0.15,yaw,0),osso);
    for(const sx of[-1,1])add(C,ellipTris(0.028,0.03,0.02,6,4),mat(x+fz*0.045*sx+fx*0.11,g+1.64,z-fx*0.045*sx+fz*0.11),escuro);
    for(let k=0;k<4;k++){const a=k/4*6.283+yaw,hx=x+Math.cos(a)*0.09,hz=z+Math.sin(a)*0.09;add(C,cylTris(0.004,0.004,0.32,3),mat(hx,g+1.08,hz),corda);add(C,cylTris(0.012,0.016,0.13,5),mat(hx,g+0.95,hz),osso);}
    colCircle(x,z,0.15);SINISTROS.push({x,z,tipo:'caveira'});}
  // covas com cruzes
  for(let i=0;i<4;i++){const p=pega(35,140,2.6);if(!p)continue;const[x,z]=p,yaw=R()*6.283,L=loc(x,z,yaw),n=3+Math.floor(R()*3);
    for(let k=0;k<n;k++){const ox=(k%3-1)*1.3+(R()-0.5)*0.3,oz=Math.floor(k/3)*1.7+(R()-0.5)*0.3,c=L(ox,0,oz);
      add(C,ellipTris(0.45,0.16,0.85,8,5),mat(c[0],c[1]-0.04,c[2],0,yaw,0),terra,{j:0.1,rnd:R});
      if(R()<0.85){const cr=L(ox,0,oz-0.75),tilt=(R()-0.5)*0.3;add(C,boxTris(0.07,0.95,0.06),mat(cr[0],cr[1]+0.42,cr[2],0,yaw,tilt),graveto,{j:0.1,rnd:R});add(C,boxTris(0.45,0.07,0.06),mat(cr[0],cr[1]+0.68,cr[2],0,yaw,tilt),graveto,{j:0.1,rnd:R});}}
    SINISTROS.push({x,z,tipo:'covas'});}
  // acampamentos abandonados: barraca rasgada, fogueira apagada, mancha escura no chão e uma caixa
  for(let i=0;i<4;i++){const p=pega(35,140,3.2);if(!p)continue;const[x,z]=p,yaw=R()*6.283,L=loc(x,z,yaw);
    const t=L(0,0,0);add(C,cylTris(0.95,0.95,1.9,3,{phase:-Math.PI/2}),mm(mat(t[0],t[1],t[2],0,yaw,0),mat(0,0.45,-0.95,Math.PI/2,0,0.35)),lin(0x5c4f3a),{j:0.1,rnd:R});
    const f=L(1.9,0,1.3);for(let k=0;k<8;k++){const a=k/8*6.283;add(C,icoTris(0.12,0.35,R),mat(f[0]+Math.cos(a)*0.5,f[1]+0.03,f[2]+Math.sin(a)*0.5,R(),R()*6,R(),1.2,0.8,1),cinza,{j:0.15,rnd:R});}
    add(N,cylTris(0.4,0.45,0.03,9),mat(f[0],f[1]-0.005,f[2]),escuro);
    const m=L(-1.2,0,1.6);add(N,cylTris(0.62,0.7,0.012,10),mat(m[0],m[1]+0.005,m[2],0,0,0,1,1,0.7),lin(0x2a0d0b));
    colCircle(t[0],t[2],1.0);SINISTROS.push({x,z,tipo:'acampamento'});}
  // altares de pedra com velas acesas (dá para ver de longe à noite)
  for(let i=0;i<5;i++){const p=pega(40,145,1.6);if(!p)continue;const[x,z]=p,g=ground(x,z);
    for(let k=0;k<7;k++){const a=k/7*6.283;add(C,icoTris(0.18,0.3,R),mat(x+Math.cos(a)*0.55,g+0.05,z+Math.sin(a)*0.55,R(),R()*6,R(),1,0.9,1),cinza,{j:0.12,rnd:R});}
    add(C,boxTris(0.5,0.32,0.4),mat(x,g+0.16,z),lin(0x5d5b55),{j:0.1,rnd:R});
    for(let k=0;k<3;k++){const vx=x+(k-1)*0.14,vz=z+(R()-0.5)*0.12,h=0.1+R()*0.08;add(C,cylTris(0.022,0.024,h,6),mat(vx,g+0.32,vz),lin(0xe8e0c8));
      add(N,cylTris(0,0.012,0.04,4),mat(vx,g+0.32+h,vz),lin(0xffb347),{e:3.2});}
    add(C,ellipTris(0.11,0.1,0.13,10,7),mat(x,g+0.42,z+0.05),osso);
    colCircle(x,z,0.4);SINISTROS.push({x,z,tipo:'altar',vela:true});}}

/* geometrias base das instâncias */
function vegGeometry(){const R=rng(5),G={};
  const mk=f=>{const g=new GB(1024,8);f(g);return g.data();};
  // pinheiro de longe: a mesma silhueta do de perto (miolo escuro + massas de agulha caídas), em ~150 triângulos, sem os pratos de cone empilhados
  G.pine=mk(g=>{add(g,cylTris(0.11,0.22,4.7,5),ID,C_TRUNK,{j:0.12,rnd:R});
    add(g,cylTris(0,0.9,3.4,6,{bottom:true}),mat(0,2.05,0),lin(0x172c1d),{j:0.14,rnd:R});
    const NA=4;for(let i=0;i<NA;i++){const t=i/(NA-1),y=2.35+t*2.55,L=2.05-t*1.45,n=i<2?4:3,ph=R()*6.28,base=mixc(lin(0x1c3426),lin(0x3e5a34),t*0.75+R()*0.25);
      for(let k=0;k<n;k++){const a=ph+k*6.283/n+(R()-0.5)*0.7,ll=L*(0.8+R()*0.35),dr=0.2+0.26*t+R()*0.18;
        add(g,octTris(0.5,0.3,R),mm(mat(0,y+(R()-0.5)*0.2,0,0,a,0),mm(mat(ll*0.5*Math.cos(dr),-ll*0.5*Math.sin(dr),0,0,0,-dr),mat(0,0,0,0,0,0,ll,0.4+0.14*(1-t),0.62+0.3*(1-t)))),scl(base,0.85+R()*0.3),{j:0.2,rnd:R,crease:80});}}
    add(g,octTris(0.5,0.25,R),mat(0,5.2,0,0,0.4,0,0.45,1.35,0.45),lin(0x2f4a2c),{j:0.15,rnd:R,crease:80});});
  G.round=mk(g=>{add(g,cylTris(0.1,0.19,2.3,6),ID,C_TRUNK2,{j:0.1,rnd:R});
    add(g,cylTris(0.035,0.06,1.0,5),mat(0.05,1.7,0,0,0,-0.8),C_TRUNK2);add(g,cylTris(0.03,0.055,0.9,5),mat(-0.05,1.9,0.05,0.5,0,0.7),C_TRUNK2);
    const col=lin(0x3f5a2c);[[0,3.05,0,1.18],[0.85,2.78,0.28,0.9],[-0.82,2.86,-0.3,0.94],[0.18,3.78,-0.22,0.86],[-0.24,2.62,0.86,0.8],[0.5,3.42,0.72,0.74],[-0.62,3.52,0.42,0.72],[0.74,3.22,-0.76,0.72],[-0.3,3.2,-0.85,0.7]].forEach((b,i)=>
      add(g,icoTris(b[3],0.36,R),mat(b[0],b[1],b[2],R(),R()*3,R(),1,0.84,1),scl(mixc(col,lin(0x5a6a34),(i%3)/3),0.8+(i%4)*0.07),{j:0.2,rnd:R,crease:85}));});
  G.birch=mk(g=>{const w=lin(0xd8d3c2),bk=lin(0x26221e);add(g,cylTris(0.075,0.125,3.5,7),ID,w,{j:0.06,rnd:R});
    for(let i=0;i<10;i++){const a=R()*6.283,y=0.3+i*0.31+R()*0.1,r=0.125-y*0.014;add(g,boxTris(0.075,0.032,0.03),mat(Math.sin(a)*r,y,Math.cos(a)*r,0,a,0),bk);}
    add(g,cylTris(0.02,0.04,0.9,4),mat(0.03,2.6,0,0,0,-0.7),w);
    const col=lin(0x6a9a3a);[[0,3.75,0,0.92],[0.55,3.35,0.2,0.66],[-0.5,3.4,-0.2,0.72],[0.1,4.35,0.1,0.6]].forEach((b,i)=>
      add(g,icoTris(b[3],0.35,R),mat(b[0],b[1],b[2],R(),R()*3,R(),1,0.9,1),scl(col,0.85+i*0.07),{j:0.2,rnd:R}));});
  G.dead=mk(g=>{const col=lin(0x5a4f43);add(g,cylTris(0.07,0.2,3.6,5),ID,col,{j:0.1,rnd:R});
    for(let i=0;i<3;i++)add(g,cylTris(0.02,0.06,1.1-i*0.2,4),mat(0,1.6+i*0.6,0,0.9+i*0.2,i*2.1,0),col);});
  // versões detalhadas para as árvores perto do jogador (formas redondas, sem cara de bloco)
  // pinheiro de perto: galhos em leque saindo do tronco, em andares desencontrados e com a ponta caída (silhueta irregular, sem cara de cones empilhados).
  // O galho mais baixo fica acima da cabeça (o jogador passa por baixo).
  G.pineHi=mk(g=>{add(g,cylTris(0.11,0.22,4.9,10),ID,C_TRUNK,{j:0.12,rnd:R});add(g,cylTris(0.24,0.3,0.12,10),mat(0,-0.04,0),C_TRUNK,{j:0.1,rnd:R});
    add(g,cylTris(0,0.85,3.3,8,{bottom:true}),mat(0,2.1,0),lin(0x172c1d),{j:0.12,rnd:R});   // miolo escuro: fecha os buracos entre os galhos
    // galhos como massas de agulha: bolos compridos e achatados saindo do tronco, com a ponta caída, em andares desencontrados (sem beirada reta de cone)
    const NA=10;for(let i=0;i<NA;i++){const t=i/(NA-1),y=2.3+t*2.7+(R()-0.5)*0.18,L=2.0-t*1.55+(R()-0.5)*0.2,n=i<NA-3?5:4,ph=R()*6.28,base=mixc(lin(0x1c3426),lin(0x3e5a34),t*0.75+R()*0.25);
      for(let k=0;k<n;k++){const a=ph+k*6.283/n+(R()-0.5)*0.8,ll=L*(0.7+R()*0.45),dr=0.18+0.28*t+R()*0.22;
        add(g,icoTris(0.5,0.28,R),mm(mat(0,y+(R()-0.5)*0.25,0,0,a,0),mm(mat(ll*0.5*Math.cos(dr),-ll*0.5*Math.sin(dr),0,0,0,-dr),mat(0,0,0,0,0,0,ll,0.32+0.12*(1-t),0.5+0.25*(1-t)))),scl(base,0.85+R()*0.3),{j:0.2,rnd:R,crease:55});}}
    add(g,icoTris(0.5,0.25,R),mat(0,5.15,0,0,0,0,0.42,1.3,0.42),lin(0x2f4a2c),{j:0.15,rnd:R,crease:55});});
  G.roundHi=mk(g=>{add(g,cylTris(0.1,0.2,2.3,9),ID,C_TRUNK2,{j:0.1,rnd:R});
    add(g,cylTris(0.035,0.06,1.0,6),mat(0.05,1.7,0,0,0,-0.8),C_TRUNK2);add(g,cylTris(0.03,0.055,0.9,6),mat(-0.05,1.9,0.05,0.5,0,0.7),C_TRUNK2);
    const col=lin(0x3f5a2c);[[0,3.05,0,1.18],[0.85,2.78,0.28,0.9],[-0.82,2.86,-0.3,0.94],[0.18,3.78,-0.22,0.86],[-0.24,2.62,0.86,0.8],[0.5,3.42,0.72,0.74],[-0.62,3.52,0.42,0.72],[0.74,3.22,-0.76,0.72],[-0.3,3.2,-0.85,0.7]].forEach((b,i)=>
      add(g,icoSubTris(b[3],0.34,R,1),mat(b[0],b[1],b[2],R(),R()*3,R(),1,0.84,1),scl(mixc(col,lin(0x5a6a34),(i%3)/3),0.8+(i%4)*0.07),{j:0.2,rnd:R,crease:85}));
    for(let i=0;i<4;i++){const a=i*1.7+R(),L=0.8+R()*0.4;add(g,cylTris(0.02,0.045,L,5),mm(mat(0,2.0+R()*0.5,0,0,a,0),mat(0,0,0,0,0,-0.9-R()*0.3)),C_TRUNK2);}});
  G.birchHi=mk(g=>{const w=lin(0xd8d3c2),bk=lin(0x26221e);add(g,cylTris(0.075,0.125,3.5,10),ID,w,{j:0.06,rnd:R});
    for(let i=0;i<10;i++){const a=R()*6.283,y=0.3+i*0.31+R()*0.1,r=0.125-y*0.014;add(g,boxTris(0.075,0.032,0.03),mat(Math.sin(a)*r,y,Math.cos(a)*r,0,a,0),bk);}
    add(g,cylTris(0.02,0.04,0.9,6),mat(0.03,2.6,0,0,0,-0.7),w);
    const col=lin(0x6a9a3a);[[0,3.75,0,0.92],[0.55,3.35,0.2,0.66],[-0.5,3.4,-0.2,0.72],[0.1,4.35,0.1,0.6]].forEach((b,i)=>
      add(g,icoSubTris(b[3],0.28,R,1),mat(b[0],b[1],b[2],R(),R()*3,R(),1,0.9,1),scl(col,0.85+i*0.07),{j:0.18,rnd:R}));});
  G.deadHi=mk(g=>{const col=lin(0x5a4f43);add(g,cylTris(0.07,0.2,3.6,8),ID,col,{j:0.1,rnd:R});
    for(let i=0;i<3;i++)add(g,cylTris(0.02,0.06,1.1-i*0.2,6),mat(0,1.6+i*0.6,0,0.9+i*0.2,i*2.1,0),col);});
  G.stump=mk(g=>{add(g,cylTris(0.3,0.33,0.45,12),ID,lin(0x5a4330),{j:0.12,rnd:R});add(g,cylTris(0.28,0.28,0.02,12),mat(0,0.45,0),lin(0xa07a4c));});
  G.rock=mk(g=>{add(g,icoSubTris(1,0.4,R,1),mat(0,0,0,0.2,0,0.1,1.3,0.72,1.05),lin(0x5e5c55),{j:0.2,rnd:R,crease:58});add(g,icoSubTris(0.48,0.38,R,1),mat(0.72,-0.1,0.42,0.5,0,0.3,1.25,0.68,1),lin(0x56544c),{j:0.2,rnd:R,crease:58});
    add(g,icoSubTris(0.34,0.4,R,1),mat(-0.62,-0.12,-0.38,0.3,1,0.2,1.3,0.6,1.1),lin(0x605d52),{j:0.2,rnd:R,crease:58});add(g,icoSubTris(0.62,0.3,R,1),mat(0.1,0.42,-0.1,0,0,0,1.4,0.18,1.2),lin(0x4f5a3a),{j:0.25,rnd:R,crease:70});});
  G.bush=mk(g=>{const c=lin(0x3a5629);add(g,icoSubTris(0.7,0.36,R,1),mat(0,0.45,0,0,0,0,1.2,0.75,1.2),c,{j:0.2,rnd:R,crease:85});add(g,icoSubTris(0.5,0.36,R,1),mat(0.45,0.35,0.2),scl(c,1.1),{j:0.2,rnd:R,crease:85});
    add(g,icoSubTris(0.42,0.36,R,1),mat(-0.4,0.3,-0.25),scl(c,0.92),{j:0.2,rnd:R,crease:85});add(g,icoSubTris(0.36,0.4,R,1),mat(0.1,0.62,-0.42),scl(mixc(c,lin(0x6a6a34),0.4),1.0),{j:0.2,rnd:R,crease:85});});
  G.berries=mk(g=>{for(let i=0;i<9;i++){const a=i*2.4,r=0.55+(i%3)*0.12;add(g,icoTris(0.055,0.1,R),mat(Math.cos(a)*r,0.35+(i%4)*0.13,Math.sin(a)*r),lin(0xb3202a),{e:0.15});}});
  G.pedra=mk(g=>add(g,icoSubTris(0.16,0.3,R,1),mat(0,0.06,0,0,0,0,1.2,0.7,1),lin(0x6e6c64),{j:0.1,rnd:R,crease:40}));
  G.galho=mk(g=>{add(g,cylTris(0.03,0.04,0.9,7),mat(-0.45,0.04,0,0,0,-Math.PI/2),lin(0x6b4a2e));add(g,cylTris(0.015,0.025,0.3,6),mat(0.1,0.05,0,0,0.7,-1.0),lin(0x6b4a2e));});
  /* um punhado de chão de mata: folhas secas de cores diferentes, um graveto e duas pedrinhas */
  G.folhas=mk(g=>{const pal=[0x7a5a2a,0x8a6a2c,0x5e4422,0x6e6030,0x4e5a28,0x93743a].map(lin);
    for(let i=0;i<16;i++){const a=R()*6.283,r=Math.sqrt(R())*0.75,L=0.07+R()*0.06;add(g,boxTris(L*0.62,0.004,L),mat(Math.cos(a)*r,0.004+R()*0.006,Math.sin(a)*r,(R()-0.5)*0.4,R()*6.283,(R()-0.5)*0.4),pal[i%pal.length],{j:0.15,rnd:R,flat:true});}
    add(g,cylTris(0.008,0.013,0.45,4),mat(-0.2,0.012,0.1,0,R()*3,Math.PI/2),lin(0x4e3a24),{j:0.1,rnd:R});
    for(let i=0;i<2;i++)add(g,icoTris(0.035+R()*0.025,0.4,R),mat((R()-0.5)*0.9,0.01,(R()-0.5)*0.9,0,0,0,1.2,0.6,1),lin(0x6a675e),{j:0.15,rnd:R});});
  /* samambaia: folhas compridas que se abrem em arco a partir do centro */
  G.samambaia=mk(g=>{const v=[lin(0x2f5a26),lin(0x3d6b2c),lin(0x4a7a33)];for(let i=0;i<9;i++){const a=i/9*6.283+R()*0.5,l=0.55+R()*0.35;
    for(let k=0;k<3;k++){const t0=k/3,t1=(k+1)/3,x0=Math.cos(a)*l*t0,z0=Math.sin(a)*l*t0,y0=0.42*Math.sin(t0*2.4),x1=Math.cos(a)*l*t1,z1=Math.sin(a)*l*t1,y1=0.42*Math.sin(t1*2.4);
      add(g,bevelTris(0.12*(1-t0*0.6),0.012,Math.hypot(x1-x0,y1-y0,z1-z0),0.004,{tx:0.6}),mm(alignY(x0,y0,z0,x1-x0,y1-y0,z1-z0),mat(0,Math.hypot(x1-x0,y1-y0,z1-z0)/2,0,Math.PI/2,0,0)),v[(i+k)%3],{j:0.12,rnd:R,flat:true});}}});
  G.fibra=mk(g=>{const v=lin(0x52773f),p=lin(0xb9b06a);for(let i=0;i<11;i++){const a=i/11*6.283+R()*0.4,l=0.45+R()*0.35,lean=0.35+R()*0.45;
    add(g,cylTris(0,0.03,l,4,{phase:R()*3}),alignY(Math.cos(a)*0.05,0,Math.sin(a)*0.05,Math.cos(a)*lean,1,Math.sin(a)*lean),mixc(v,p,R()*0.35),{j:0.12,rnd:R,flat:true});}
    for(let i=0;i<3;i++)add(g,cylTris(0.006,0.008,0.5+R()*0.2,4),mat((R()-0.5)*0.1,0,(R()-0.5)*0.1),lin(0x8c7a42));
    for(let i=0;i<3;i++)add(g,ellipTris(0.02,0.045,0.02,6,4),mat((R()-0.5)*0.12,0.55+R()*0.15,(R()-0.5)*0.12),lin(0xd8c47a));});
  G.cogumelo=mk(g=>{for(const[x,z,s]of[[0,0,1],[0.12,0.08,0.7]]){add(g,cylTris(0.025*s,0.03*s,0.12*s,8),mat(x,0,z),lin(0xe0d8c4));
    add(g,latheTris([[0.09*s,0],[0.088*s,0.022*s],[0.07*s,0.045*s],[0.04*s,0.062*s],[0,0.07*s]],10,1,1,{capB:true}),mat(x,0.105*s,z),lin(0xb8452e));}});
  G.grass=(()=>{const g=new GB(512,8),base=lin(0x2c4619),tip=lin(0x86a63e);
    for(let i=0;i<7;i++){const a=i/7*6.283+R()*0.6,r=R()*0.13,h=0.26+R()*0.36,w=0.032+R()*0.02,lean=0.12+R()*0.28,k=0.85+R()*0.3;
      const ox=Math.cos(a)*r,oz=Math.sin(a)*r,dx=Math.cos(a+1.57),dz=Math.sin(a+1.57),fx=Math.cos(a)*lean,fz=Math.sin(a)*lean,cm=mixc(base,tip,0.5);
      const p0=[ox-dx*w,0,oz-dz*w],p1=[ox+dx*w,0,oz+dz*w],m0=[ox+fx*0.3*h-dx*w*0.7,h*0.55,oz+fz*0.3*h-dz*w*0.7],m1=[ox+fx*0.3*h+dx*w*0.7,h*0.55,oz+fz*0.3*h+dz*w*0.7],t=[ox+fx*h,h,oz+fz*h];
      const Vv=(p,c)=>g.v8(p[0],p[1],p[2],c[0]*k,c[1]*k,c[2]*k,0,0);
      Vv(p0,base);Vv(p1,base);Vv(m1,cm);Vv(p0,base);Vv(m1,cm);Vv(m0,cm);Vv(m0,cm);Vv(m1,cm);Vv(t,tip);}
    return g.data();})();
  G.flor=mk(g=>{add(g,cylTris(0.008,0.011,0.3,4),ID,lin(0x3d5a22));add(g,boxTris(0.06,0.012,0.02),mat(0.03,0.16,0,0,0.4,0.5),lin(0x3d5a22));
    for(let i=0;i<5;i++){const a=i/5*6.283;add(g,boxTris(0.055,0.012,0.032),mat(Math.cos(a)*0.036,0.3,Math.sin(a)*0.036,0,-a,0.15),[0.95,0.95,0.95]);}
    add(g,boxTris(0.032,0.022,0.032),mat(0,0.31,0),[0.9,0.62,0.12]);});
  return G;}

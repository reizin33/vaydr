/* ================= Entradas de pedra de verdade (v10.2.2, 13/11/2026) =================
   "Olha como está a entrada da caverna, na verdade não sei nem o que é isso" e "muro branco com pedras voando" (Himalaia):
   · Boca da caverna (perto da Base Militar): era um arco de 16 bolas de pedra lisas. Agora: dois paredões de rocha escaneada
     (rock_face_01) dos lados, um por cima fazendo a verga, o morro de pedra (mountainside) atrás e alguns matacões na frente;
     no meio fica só o buraco escuro.
   · Túnel da serra (a ferrovia entra no morro, perto da torre de rádio): era uma parede de concreto clara sozinha no meio da mata,
     com bolas de pedra soltas no ar. Agora o concreto (mais escuro, velho) fica cravado num morro de pedra: paredões atrás, dos
     lados e por cima, e matacões no pé. As bolas de pedra saíram da malha da ferrovia (48r).
   Usa as mesmas pedras da serra (62yb: SVP.aflor e SVP.soltas), com sombra e versão leve de longe; os paredões dos lados têm
   colisão. Enquanto as texturas não carregam, a boca da caverna continua a de antes. */
const ENTR={ok:false,cav:false,tun:false};
function entrPoe(cx,cz,yaw,y0,L){const S=Math.sin(yaw),C=Math.cos(yaw);   // local x -> mundo (cos,-sin); local z -> (sin,cos)
  const W=(lx,lz)=>[cx+lx*C+lz*S,cz-lx*S+lz*C];
  for(const r of L.rochas){const[x,z]=W(r[0],r[2]),fx=Math.sin(yaw+(r[5]||0)),fz=Math.cos(yaw+(r[5]||0));
    SVP.aflor.push({x,z,y:y0+r[1],yFixo:true,r:svpVira(r[3],fx,fz),s:r[4],tipo:r[3],t:r[6]||0.86,entrada:true});
    if(r[7])for(let k=-1;k<=1;k++){const[qx,qz]=W(r[0]+k*r[7]*0.3,r[2]);colCircle(qx,qz,r[7]*0.28,{rock:null,serraPedra:true});}}
  for(const b of L.pedras){const[x,z]=W(b[0],b[1]);SVP.soltas.push({x,z,y:ground(x,z)-b[2]*0.25,r:b[0]*3.1+b[1],s:b[2],v:b[3]||0,t:0.85});
    if(dentroMapa(x,z,-1))colCircle(x,z,0.62*b[2],{rock:null,serraPedra:true});}}
/* corte da ferrovia no túnel da serra: a linha chegava ao portal 3 m abaixo do morro (o concreto ficava meio enterrado e a boca
   escura sumia: sobrava uma parede clara no meio da mata). O chão em volta dos últimos ~14 m da linha desce até o nível dela,
   com as beiradas em rampa, e o portal aparece inteiro. Feito no carregamento, antes de a serra montar a malha do terreno */
(function entrCorteTunel(){if(typeof FERRO==='undefined'||typeof SVN==='undefined'||!SVN.H2||typeof ferroAlturas!=='function')return;
  const F=FERRO,S=SVN,p=F.portal,cum=ferroCum(F.pts),L=cum[cum.length-1],ys=ferroAlturas(F.pts,cum),yP=ys[Math.max(0,ys.length-9)],chao=yP-0.3;
  const meia=3.4,rampa=5.5,ini=L-19,cheio=L-13;let n=0;
  const corta=(x,z,h)=>{if(x<p.x-0.6||h<=chao)return h;const q=ferroPerto(F.pts,cum,x,z);if(q.s<ini)return h;const k=(1-smooth(meia,meia+rampa,q.d))*smooth(ini,cheio,q.s);if(k<=0)return h;n++;return h+(chao-h)*k;};
  for(let j=0;j<=S.NZ2;j++){const z=S.z0+j*S.hz;if(Math.abs(z-p.z)>15)continue;for(let i=0;i<=S.NX2;i++){const x=S.x0+i*S.hx;if(x<p.x-1||x>p.x+25)continue;const k=j*S.W2+i;S.H2[k]=corta(x,z,S.H2[k]);}}
  for(let j=0;j<=S.nz;j++){const z=S.z0+j*S.dz;if(Math.abs(z-p.z)>15)continue;for(let i=0;i<=S.nx;i++){const x=S.x0+i*S.dx;if(x<p.x-1||x>p.x+25)continue;const k=j*S.W1+i;S.H1[k]=corta(x,z,S.H1[k]);}}
  ENTR.corte={yP:+yP.toFixed(2),chao:+chao.toFixed(2),nos:n};})();
/* tira árvore, moita e folhagem da boca (raio r) e do corredor da frente (comprimento L, meia largura w), para a entrada aparecer */
function entrLimpar(cx,cz,yaw,r,L,w){const fx=Math.sin(yaw),fz=Math.cos(yaw),den=(x,z)=>{const dx=x-cx,dz=z-cz,s=dx*fx+dz*fz,t=-dx*fz+dz*fx;return dx*dx+dz*dz<r*r||(s>0&&s<L&&Math.abs(t)<w);};
  let n=0;for(const t of TREES)if(!t.agua&&den(t.x,t.z)){t.agua=true;t.alive=false;colRemove(COLL.find(c=>c.tree===t)||{});n++;}
  if(typeof BUSHES!=='undefined')for(const b of BUSHES)if(!b.agua&&den(b.x,b.z)){b.agua=true;n++;}
  if(typeof MCH_PL!=='undefined')for(let i=MCH_PL.length-1;i>=0;i--)if(den(MCH_PL[i].x,MCH_PL[i].z))MCH_PL.splice(i,1);
  vegDirty=true;return n;}
function entrMontar(){if(typeof SVP==='undefined'||typeof MATA==='undefined'||!MATA.paredao2||typeof svpVira!=='function')return;
  /* boca da caverna (SUB: tipo 'caverna'): a frente é o +z local da entrada */
  const e=typeof SUB!=='undefined'&&SUB.entradas.find(q=>q.tipo==='caverna');
  if(e&&!ENTR.cav){ENTR.cav=true;const[x,z,yaw]=e.sup,g=ground(x,z);ENTR.limpasCav=entrLimpar(x,z,yaw,6.5,13,4.5);
    entrPoe(x,z,yaw,g,{rochas:[
      // [x local, y, z local, tipo (0 morro, 1 paredão), escala, giro extra, tom, raio da colisão]
      [-3.1,-0.7,-0.5,1,0.92,0.45,0.84,3.6],[3.2,-0.7,-0.4,1,0.95,-0.45,0.88,3.6],[0.1,2.05,-1.25,1,0.8,0,0.8,0],
      [-0.6,-1.6,-5.2,0,0.58,0.15,0.82,0],[4.6,-1.4,-3.6,0,0.42,-0.6,0.86,0],[-4.8,-1.3,-3.4,0,0.4,0.6,0.84,0]],
      pedras:[[-2.4,1.7,0.95,1],[2.7,1.3,0.75,2],[0.9,2.8,0.5,3],[-3.6,0.4,0.7,4],[3.8,0.2,0.62,5]]});
    ENTR.caverna=e;}
  /* túnel da serra (ferrovia): a frente do concreto olha para +x do mundo */
  if(!ENTR.tun&&typeof FERRO!=='undefined'&&FERRO.portal&&FERRO.portal.y!==undefined){ENTR.tun=true;const p=FERRO.portal,g=ground(p.x,p.z),yaw=Math.PI/2;   // local +z -> mundo +x
    ENTR.limpasTun=entrLimpar(p.x,p.z,yaw,7.5,16,6.5);
    entrPoe(p.x,p.z,yaw,g,{rochas:[
      [-6.6,-1.2,-2.6,0,0.78,0.2,0.86,0],[6.8,-1.2,-2.4,0,0.8,-0.2,0.84,0],[0.3,3.2,-4.0,0,0.86,0,0.82,0],
      [-5.6,-0.6,0.15,1,0.95,0.35,0.86,3.4],[5.7,-0.6,0.2,1,0.95,-0.35,0.88,3.4],[0,5.6,-1.1,1,0.9,0,0.8,0],
      [-11.5,-1.5,-4.5,0,0.62,0.45,0.85,0],[11.8,-1.5,-4.2,0,0.6,-0.45,0.85,0]],
      pedras:[[-4.2,1.6,1.0,1],[4.5,1.9,0.85,2],[-6.8,2.6,0.7,3],[7.2,2.4,0.65,4],[-2.8,3.4,0.45,5],[3.1,3.9,0.5,6]]});
    ENTR.tunel=p;}
  ENTR.ok=ENTR.cav||ENTR.tun;}
/* o svpSemear (no buildWorld) zera as pedras da serra: as das entradas voltam junto. A caverna e a ferrovia só ficam prontas depois
   (INIT_MALHAS): o que faltar entra lá */
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{ENTR.cav=ENTR.tun=false;entrMontar();}catch(e){console.error('entradas de pedra',e);}return r;};}
/* a boca da caverna vira só o buraco escuro quando as pedras de verdade estão prontas */
INIT_MALHAS.push(function entrMalhas(){try{entrMontar();}catch(e){console.error('entradas de pedra',e);}const R=rng(31337),mk=f=>{const g=new GB(1024,8);f(g);return litMesh(g.data());};
  MESH.subCavernaBoca=mk(g=>{add(g,ellipTris(2.0,2.15,0.4,14,7),mat(0,1.0,0.25),lin(0x060505),{});add(g,boxTris(3.4,2.6,2.2),mat(0,1.05,-1.0),lin(0x050404),{});
    for(let i=0;i<5;i++)add(g,icoSubTris(0.28+R()*0.2,0.45,R,1),mat((R()-0.5)*3.2,0.05,0.9+R()*0.8),lin(0x4f4842),{j:0.15,rnd:R});});});
function entrPronta(){return ENTR.ok&&typeof SVP!=='undefined'&&SVP.ok&&svpProntas();}
/* ---------- pedras no chão (v10.2.2, "pedra flutuando") ----------
   Pedra em encosta ficava com a altura do chão do centro: o lado de baixo do morro aparecia no ar (até 8 m num paredão da serra).
   Agora cada pedra desce até o chão mais baixo embaixo dela (amostrado na beira da pedra), um pouco enterrada. Pedra em cima da
   gruta não conta (lá o chão do jogo é o da caverna). */
function entrPedrasNoChao(){const inf={rocks:0,borda:0,soltas:0,aflor:0};
  const desce=(L,raio,afunda,chave,alt)=>{for(const b of L){if(!b||b.y<-900||b.alive===false||b.yFixo)continue;const s=b.s||1,r=raio(b)*s,g0=ground(b.x,b.z);
      if(typeof svnPiso==='function'&&typeof SVN!=='undefined'&&SVN.piso&&svnPiso(b.x,b.z)!==null)continue;   // em cima da gruta: o chão do jogo ali é o da caverna
      let mn=alt?alt(b.x,b.z):g0;for(let a=0;a<6.283;a+=0.785){const h=alt?alt(b.x+Math.cos(a)*r,b.z+Math.sin(a)*r):ground(b.x+Math.cos(a)*r,b.z+Math.sin(a)*r);if(h<mn)mn=h;}
      const novo=mn-afunda*s;if(novo<b.y-0.05){b.y=novo;inf[chave]++;}}};
  if(typeof ROCKS!=='undefined')desce(ROCKS,()=>0.75,0.12,'rocks');
  if(typeof BRENHA_PEDRAS!=='undefined')desce(BRENHA_PEDRAS,()=>0.85,0.3,'borda');
  if(typeof SVP!=='undefined'){const alt=typeof svnAlt==='function'?svnAlt:null;desce(SVP.soltas,()=>0.6,0.28,'soltas',alt);
    for(const a of SVP.aflor){if(a.yFixo||(SVN.piso&&svnPiso(a.x,a.z)!==null))continue;const M=a.tipo===0?MATA.paredao:MATA.paredao2;if(!M)continue;const w=(M.hi[0]-M.lo[0])*a.s*0.42,h=(M.hi[1]-M.lo[1])*a.s;
      let mn=alt?alt(a.x,a.z):ground(a.x,a.z);for(let t=0;t<6.283;t+=0.785){const q=alt?alt(a.x+Math.cos(t)*w,a.z+Math.sin(t)*w):ground(a.x+Math.cos(t)*w,a.z+Math.sin(t)*w);if(q<mn)mn=q;}
      const novo=mn-h*0.12;if(novo<a.y-0.05){a.y=novo;inf.aflor++;}}}
  vegDirty=true;ENTR.pedras=inf;return inf;}
INIT_MALHAS.push(function entrPedras(){try{entrPedrasNoChao();}catch(e){console.error('pedras no chão',e);}});

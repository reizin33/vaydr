/* ================= Etapa 4 · passo 6: a Base Militar destruída — crateras e a tenda queimada (v10.2.7, 17/11/2026) =================
   Plano da etapa 4 (aprovado em 14/11/2026), passo 6: a base maior e destruída. Os prédios e veículos novos de fora do anel
   (alojamento desabado, depósito, paiol, comboio abandonado, sacos de areia, barreiras, tambores) estão em 62u_lugares ('bm2_').
   Aqui entra o que conta que houve combate:
   · quatro crateras de explosão fora do anel: a mancha preta de queimado no chão (desenhada com as manchas, por cima do chão),
     a borda de terra revirada, pedaços pretos no meio e estilhaços de metal em volta;
   · a tenda de campanha que pegou fogo: só a armação de ferro (pés, tesouras e cumeeira), um pedaço de lona preta pendurado e
     outro caído, em cima de uma mancha de queimado.
   Árvore, pedra, moita e capim que nasceram dentro das crateras e da tenda saem de vez (como nos lugares do 62u). Sem colisão
   (é tudo baixo); a armação da tenda tem colisão só nos pés. */
const BMD={m:null,mm:null,feito:false,crat:[[-16,-20,3.2],[20,16,2.6],[-6,22,3.0],[24,-18,2.4]],tenda:[-13,25.5,0.35],cols:[]};
function baseDestruidaGeo(){const X=BASEM.x,Z=BASEM.z,R=rng(6060),g=new GB(1<<13,8),A=(t,m,c,o)=>add(g,t,m,c,Object.assign({j:0.12,rnd:R},o||{}));
  const terra=lin(0x4a3c2e),terra2=lin(0x3a3026),fuligem=lin(0x1e1a16),aco=lin(0x34302c),lona=lin(0x2a2723),lona2=lin(0x4e4a42),ferro=lin(0x2e2a26),dec=[],cor=[0.03,0.028,0.025];
  /* mancha de queimado: leque com a borda recortada, seguindo o chão; transparente na borda */
  const mancha=(cx,cz,Rr,al)=>{const N=26,k=[];for(let i=0;i<N;i++)k.push(0.85+R()*0.32);const P=(x,z)=>[x,ground(x,z)+0.05,z],c=P(cx,cz),a2=al*0.92;
    for(let i=0;i<N;i++){const j=(i+1)%N,a0=i/N*6.2832,a1=j/N*6.2832;
      const m0=P(cx+Math.cos(a0)*Rr*0.55,cz+Math.sin(a0)*Rr*0.55),m1=P(cx+Math.cos(a1)*Rr*0.55,cz+Math.sin(a1)*Rr*0.55),o0=P(cx+Math.cos(a0)*Rr*k[i],cz+Math.sin(a0)*Rr*k[i]),o1=P(cx+Math.cos(a1)*Rr*k[j],cz+Math.sin(a1)*Rr*k[j]);
      for(const[q,aa]of[[c,al],[m1,a2],[m0,a2],[m0,a2],[m1,a2],[o1,0],[m0,a2],[o1,0],[o0,0]])dec.push(q[0],q[1],q[2],cor[0],cor[1],cor[2],aa);}};
  for(const[lx,lz,Rr]of BMD.crat){const cx=X+lx,cz=Z+lz;mancha(cx,cz,Rr*1.6,0.86);
    for(let i=0;i<16;i++){const a=R()*6.2832,r=Rr*(0.75+R()*0.4),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,s=0.22+R()*0.3;
      A(icoTris(s,0.6,R),mat(x,ground(x,z)-0.04,z,R(),R()*6,R(),1.3,0.55,1.1),R()<0.5?terra:terra2);}   // terra revirada na borda
    for(let i=0;i<5;i++){const a=R()*6.2832,r=R()*Rr*0.5,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;A(icoTris(0.12+R()*0.15,0.6,R),mat(x,ground(x,z)-0.02,z,R(),R()*6,R(),1,0.5,1),fuligem);}
    for(let i=0;i<4;i++){const a=R()*6.2832,r=Rr*(1.2+R()*0.9),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;A(boxTris(0.06,0.03,0.5+R()*0.8),mat(x,ground(x,z)+0.02,z,(R()-0.5)*0.3,R()*6,(R()-0.5)*0.4),ferro);}}   // estilhaços
  /* a tenda queimada: armação de ferro de 4 x 3 m, tesouras nas pontas, cumeeira, lona preta pendurada e caída */
  {const[lx,lz,yw]=BMD.tenda,cx=X+lx,cz=Z+lz,y0=ground(cx,cz),c=Math.cos(yw),s=Math.sin(yw),W=(u,v)=>[cx+u*c+v*s,cz-u*s+v*c];mancha(cx,cz,3.6,0.8);
    const pt=(u,h,v)=>{const[x,z]=W(u,v);return[x,(h<0.01?ground(x,z):y0)+h,z];};
    const barra=(a,b,r)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2]);A(cylTris(r,r,L,5),alignY(a[0],a[1],a[2],d[0],d[1],d[2]),aco);};
    for(const u of[-2,2]){const e0=pt(u,1.6,-1.5),e1=pt(u,1.6,1.5),t=pt(u,2.6,0);barra(pt(u,0,-1.5),e0,0.035);barra(pt(u,0,1.5),e1,0.035);barra(e0,t,0.03);barra(e1,t,0.03);}
    barra(pt(-2,2.6,0),pt(2,2.6,0),0.03);barra(pt(-2,1.6,-1.5),pt(0.4,1.45,-1.5),0.025);   // cumeeira e um pedaço da travessa (o resto caiu)
    {const[x,z]=W(-0.5,-0.75);A(boxTris(2.6,0.02,1.6),mat(x,y0+2.08,z,2.553,yw,0.05),lona,{j:0.2,rnd:R});}   // lona que sobrou no telhado
    {const[x,z]=W(0.9,0.8);A(boxTris(2.2,0.03,1.4),mat(x,ground(x,z)+0.04,z,0.06,yw+0.3,0.04),lona2,{j:0.2,rnd:R});}   // lona caída
    {const[x,z]=W(-1.2,0.6);A(boxTris(0.7,0.04,1.85),mat(x,ground(x,z)+0.32,z,0,yw+0.1,0.15),ferro);for(const dv of[-0.8,0.8])A(boxTris(0.05,0.3,0.05),mat(x+dv*s,ground(x,z)+0.15,z+dv*c),ferro);}}   // cama de campanha (só o ferro)
  BMD.m=litMesh(g.data());if(dec.length)BMD.mm=unMesh(new Float32Array(dec));}
/* o que nasceu dentro das crateras e da tenda sai de vez (marca .agua: não volta a crescer nem reaparece) */
function baseDestruidaLimpar(){const X=BASEM.x,Z=BASEM.z,L=BMD.crat.map(([lx,lz,r])=>[X+lx,Z+lz,r*1.25]);L.push([X+BMD.tenda[0],Z+BMD.tenda[1],3.4]);
  const dentro=(x,z,f)=>L.some(([cx,cz,r])=>Math.hypot(x-cx,z-cz)<r+f);
  for(const t of TREES)if(!t.agua&&dentro(t.x,t.z,1.2)){t.agua=true;t.alive=false;colRemove(COLL.find(c=>c.tree===t));}
  for(const r of ROCKS)if(!r.agua&&dentro(r.x,r.z,0.8)){r.agua=true;r.alive=false;colRemove(COLL.find(c=>c.rock===r));}
  for(const b of BUSHES)if(!b.agua&&dentro(b.x,b.z,0.6)){b.agua=true;b.frutas=false;}
  for(const L2 of [GRASS,FLORES])for(const b of L2)if(b.y>-900&&dentro(b.x,b.z,0.3))b.y=-999;
  for(const c of BMD.cols.splice(0))colRemove(c);
  for(const[x,z]of baseDestruidaPes())BMD.cols.push(colCircle(x,z,0.08,{solid:true,y0:-0.2,y1:1.7}));
  vegDirty=true;}
function baseDestruidaPes(){const X=BASEM.x,Z=BASEM.z,[lx,lz,yw]=BMD.tenda,cx=X+lx,cz=Z+lz,c=Math.cos(yw),s=Math.sin(yw),o=[];
  for(const u of[-2,2])for(const v of[-1.5,1.5])o.push([cx+u*c+v*s,cz-u*s+v*c]);return o;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{baseDestruidaLimpar();}catch(e){console.error('base destruída (limpar)',e);}return r;};}
DESENHO.opaco.push(function baseDestruida(Pg){if(cam.pos[1]<SUB_FUNDO||d2(BASEM.x,BASEM.z,cam.pos[0],cam.pos[2])>190*190)return;
  if(!BMD.feito){BMD.feito=true;try{baseDestruidaGeo();}catch(e){console.error('base destruída',e);}}if(BMD.m)drawStat(Pg,BMD.m,ID);});
DESENHO.sombra.push(function baseDestruidaSombra(Pg,perto){if(!BMD.m||P.y<SUB_FUNDO||d2(BASEM.x,BASEM.z,P.x,P.z)>(perto?70*70:150*150))return;
  gl.uniformMatrix4fv(Pg.u.uModel,false,ID);gl.bindVertexArray(BMD.m.vao);gl.drawArrays(gl.TRIANGLES,0,BMD.m.count);});
{const _dm=desenharManchas;desenharManchas=function(){_dm.apply(this,arguments);
  try{if(!BMD.mm||cam.pos[1]<SUB_FUNDO||d2(BASEM.x,BASEM.z,cam.pos[0],cam.pos[2])>140*140)return;const n=E.n||0,luz=lerp(1,0.3,n);
    gl.uniform4f(PU.u.uTint,luz,luz,luz,1);gl.uniformMatrix4fv(PU.u.uModel,false,ID);gl.bindVertexArray(BMD.mm.vao);gl.drawArrays(gl.TRIANGLES,0,BMD.mm.count);gl.bindVertexArray(DISC.vao);}catch(e){}};}

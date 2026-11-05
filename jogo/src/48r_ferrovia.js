/* ================= ferrovia: a linha Serra Velha, o trem abandonado, a ponte caída, a estação e a draisine =================
   A linha sai da estação ferroviária (na beira oeste da cidade), atravessa a mata, passa pela ponte do Rio Claro e entra no
   túnel da serra, que desce até a estação escondida. Na noite da evacuação o vão do meio da ponte caiu; o trem de abastecimento
   do laboratório ficou parado no desvio antes do rio: locomotiva (com o diário do maquinista), vagão de passageiros (abrigo:
   cama, bagageiro, chuva não entra) e vagão blindado (porta com teclado; o código está com o chefe da estação da cidade).
   A draisine anda na linha principal (W acelera, S freia e volta, E desce). Consertar a ponte é um projeto: entregue as peças
   aos poucos; pronta, a draisine vai da estação da cidade até o túnel da serra. O portão do túnel só abre por dentro
   (alavanca na estação escondida): depois disso ele vira um atalho para o subsolo. */
var FERRO={pts:[[170,-40],[112,-40],[95,-44],[80,-46.5],[0,-46.5],[-12,-54],[-25,-62],[-45,-66],[-65,-70],[-79,-70.5]],
  desvio:[[70,-46.5],[62,-50.8],[19,-50.8]],cum:[],L:0,ys:[],passo:1,
  ponte:{x0:4.5,x1:21.5,v0:10.6,v1:17.8},trem:{loco:[20.5,31.5],pass:[32.5,43.5],blind:[44.5,53.5],z:-50.8},
  est:{x:128,z:-46.5,w:9,d:6},portal:{x:-79,z:-70.5},sMin:30};
const FERRO_ESTADO=()=>G.ferro||(G.ferro=ferroNovo());
function ferroNovo(){return{ponte:{entregue:{},feita:false},blindado:false,blindCx:null,bagageiro:null,draisine:{s:36,v:0},codigo:String(1000+Math.floor(Math.random()*9000)),docs:{}};}
iconesNovos({'i-trilho':'<path d="M7 3 5 21M17 3l2 18M6 7h12M5.6 12h12.8M5 17h14"/>','i-ponte':'<path d="M2 15h20M4 15V9M20 15V9M4 9q8-6 16 0M9 15v4M15 15v4"/>'});
/* ---------- geometria da linha: comprimento, altura suavizada, ponte ---------- */
function ferroCum(pts){const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return c;}
function ferroPonto(pts,cum,s){s=clamp(s,0,cum[cum.length-1]);let i=1;while(i<cum.length-1&&cum[i]<s)i++;const a=pts[i-1],b=pts[i],L=cum[i]-cum[i-1]||1,t=(s-cum[i-1])/L,ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
  return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,ux,uz];}
function ferroPerto(pts,cum,x,z){let best={d:1e9,s:0};for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz,t=clamp(((x-a[0])*vx+(z-a[1])*vz)/l2,0,1),px=a[0]+vx*t,pz=a[1]+vz*t,d=Math.hypot(x-px,z-pz);
  if(d<best.d)best={d,s:cum[i-1]+Math.sqrt(l2)*t};}return best;}
function ferroAlturas(pts,cum){const L=cum[cum.length-1],n=Math.ceil(L)+1,g=[],ys=[];for(let i=0;i<n;i++){const p=ferroPonto(pts,cum,i);g.push(ground(p[0],p[1]));}
  for(let i=0;i<n;i++){let a=0,w=0;for(let k=-7;k<=7;k++){const j=clamp(i+k,0,n-1),q=1-Math.abs(k)/8;a+=g[j]*q;w+=q;}ys.push(Math.max(a/w,g[i]-0.05)+0.3);}
  return ys;}
function ferroMontarLinha(){const F=FERRO;F.cum=ferroCum(F.pts);F.L=F.cum[F.cum.length-1];F.ys=ferroAlturas(F.pts,F.cum);
  // ponte: altura reta entre as cabeceiras, acima da água
  const P0=F.ponte,s0=ferroPerto(F.pts,F.cum,P0.x1,-46.5).s,s1=ferroPerto(F.pts,F.cum,P0.x0,-46.5).s,ya=F.ys[Math.round(s0)],yb=F.ys[Math.round(s1)],niv=RIO.ok?(aguaNivel(14.1,-46.5)??ground(14.1,-46.5)):ground(14.1,-46.5);
  P0.y=Math.max(ya,yb,niv+2.2);P0.s0=s0;P0.s1=s1;P0.sv0=ferroPerto(F.pts,F.cum,P0.v1,-46.5).s;P0.sv1=ferroPerto(F.pts,F.cum,P0.v0,-46.5).s;
  for(let i=Math.floor(s0)-6;i<=Math.ceil(s1)+6;i++){if(i<0||i>=F.ys.length)continue;const k=i<s0?(i-(s0-6))/6:i>s1?((s1+6)-i)/6:1;F.ys[i]=lerp(F.ys[i],P0.y,clamp(k,0,1));}
  // desvio: mesma ideia
  F.dcum=ferroCum(F.desvio);F.dL=F.dcum[F.dcum.length-1];F.dys=ferroAlturas(F.desvio,F.dcum);
  // portal da serra: os últimos metros ficam retos (a linha entra no morro)
  const yP=F.ys[Math.max(0,F.ys.length-9)];for(let i=F.ys.length-8;i<F.ys.length;i++)F.ys[i]=yP;F.portal.y=yP;
  F.sMin=ferroPerto(F.pts,F.cum,141,-40).s;ferroLimparMato();}
/* tira árvore, pedra, arbusto e graveto de cima da linha, do trem, da estação e da frente do portal */
function ferroLimparMato(){const F=FERRO,T=F.trem,E=F.est,perto=(x,z)=>ferroPerto(F.pts,F.cum,x,z).d<2.6||ferroPerto(F.desvio,F.dcum,x,z).d<2.6||
    (x>T.loco[0]-2&&x<T.blind[1]+2&&z>T.z-3.2&&z<T.z+4)||(Math.abs(x-E.x-1)<14&&z>E.z-E.d/2-2&&z<-38.5)||(Math.hypot(x-F.portal.x,z-F.portal.z)<6)||(x>F.ponte.x0-2&&x<F.ponte.x1+2&&Math.abs(z+46.5)<4);
  for(const t of TREES)if(!t.agua&&perto(t.x,t.z)){t.agua=true;t.alive=false;const c=COLL.find(q=>q.tree===t);if(c)colRemove(c);}
  for(const r of ROCKS)if(!r.agua&&perto(r.x,r.z)){r.agua=true;r.alive=false;const c=COLL.find(q=>q.rock===r);if(c)colRemove(c);}
  for(const b of BUSHES)if(!b.agua&&perto(b.x,b.z)){b.agua=true;b.frutas=false;}
  for(const p of PICKS)if(!p.agua&&perto(p.x,p.z)){p.agua=true;p.alive=false;}
  vegDirty=true;}
function ferroY(s,ys){ys=ys||FERRO.ys;const i=Math.floor(clamp(s,0,ys.length-1.001)),t=s-i;return lerp(ys[i],ys[Math.min(ys.length-1,i+1)],t);}
/* ---------- malha: lastro, dormentes, trilhos, ponte, estação, portal e o trem ---------- */
function ferroTrilhoGeo(g,R,pts,cum,ys,pular){const L=cum[cum.length-1],brita=lin(0x6e6a62),dorm=lin(0x5a4430),aco=lin(0x7a7c80);
  for(let s=0;s<L-0.5;s+=2){const s2=Math.min(L,s+2);if(pular&&pular(s,s2))continue;const a=ferroPonto(pts,cum,s),b=ferroPonto(pts,cum,s2),ya=ferroY(s,ys),yb=ferroY(s2,ys),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,my=(ya+yb)/2,yaw=Math.atan2(a[2],a[3]);
    const gmin=Math.min(ground(a[0],a[1]),ground(b[0],b[1]),ground(mx,mz)),h=Math.max(0.35,my-gmin+0.25);
    add(g,boxTris(3.4,h,s2-s+0.06,{tx:0.74}),mat(mx,my-h/2,mz,0,yaw,0),brita,{j:0.08,rnd:R});
    for(let k=0;k<3;k++){const t=(k+0.5)/3,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),y=lerp(ya,yb,t);add(g,boxTris(2.3,0.11,0.24),mat(x,y+0.04,z,0,yaw+(R()-0.5)*0.05,0),dorm,{j:0.1,rnd:R});}
    for(const lado of[-0.72,0.72]){const px=-a[3]*lado,pz=a[2]*lado;add(g,boxTris(0.07,Math.hypot(b[0]-a[0],yb-ya,b[1]-a[1])+0.02,0.12),alignY(mx+px,my+0.15,mz+pz,b[0]-a[0],yb-ya,b[1]-a[1]),aco,{j:0.02,rnd:R});}}}
function ferroGeo(){const g=new GB(1<<15,8),R=rng(7733),F=FERRO,P0=F.ponte;
  // linha principal (sem o vão caído) e o desvio
  ferroTrilhoGeo(g,R,F.pts,F.cum,F.ys,(a,b)=>b>P0.sv0&&a<P0.sv1);
  ferroTrilhoGeo(g,R,F.desvio,F.dcum,F.dys,null);
  // ponte: pilares, vigas laterais, as duas pontas inteiras e o vão do meio caído no rio
  const y=P0.y,conc=lin(0x8a8780),ferro=lin(0x5a4a40),madeira=lin(0x5a4430);
  for(const x of[P0.x1,14.1,P0.x0]){const gy=ground(x,-46.5);add(g,boxTris(1.6,y-gy+0.6,3.4),mat(x,gy+(y-gy)/2-0.3,-46.5),conc,{j:0.06,rnd:R});}
  for(const[a,b]of[[P0.v1,P0.x1+0.6],[P0.x0-0.6,P0.v0]]){const L=b-a,m=(a+b)/2;add(g,boxTris(L,0.35,3.2),mat(m,y-0.25,-46.5),conc,{j:0.05,rnd:R});
    for(const z of[-48.1,-44.9])add(g,boxTris(L,0.9,0.12),mat(m,y+0.45,z),ferro,{j:0.05,rnd:R});
    for(let x=a+0.6;x<b;x+=1.2)for(const z of[-48.1,-44.9])add(g,boxTris(0.1,0.9,0.1),mat(x,y+0.45,z),ferro);}
  // pedaços caídos
  add(g,boxTris(4.6,0.35,3.0),mat(P0.v0+2.3,y-1.6,-46.6,0,0.1,0.42),conc,{j:0.08,rnd:R});add(g,boxTris(3.8,0.35,3.0),mat(P0.v1-2,y-2.0,-46.4,0,-0.15,-0.55),conc,{j:0.08,rnd:R});
  for(let i=0;i<6;i++)add(g,boxTris(2.3,0.11,0.24),mat(P0.v0+1+R()*5,y-2.6+R()*0.8,-46.5+(R()-0.5)*2.4,(R()-0.5)*0.6,R()*3,(R()-0.5)*0.5),madeira,{j:0.1,rnd:R});
  add(g,boxTris(0.07,6.5,0.12),alignY(P0.v0+3,y-1.0,-45.8,0.8,-0.4,0.05),lin(0x7a7c80));add(g,boxTris(0.07,6,0.12),alignY(P0.v1-2.8,y-1.2,-47.2,-0.8,-0.45,0.02),lin(0x7a7c80));
  // para-choque no fim do desvio
  {const p=F.desvio[F.desvio.length-1],yy=ferroY(F.dL,F.dys);add(g,boxTris(0.4,0.9,2.6),mat(p[0]-0.3,yy+0.45,p[1]),lin(0x8a2a20),{j:0.05,rnd:R});add(g,boxTris(0.25,0.25,2.4),mat(p[0]+0.05,yy+0.75,p[1]),lin(0xc9a227));}
  // estação da cidade: plataforma e prédio da bilheteria
  {const E=F.est,yp=ferroY(ferroPerto(F.pts,F.cum,E.x,-40).s)+0.55,gy=ground(E.x,E.z);E.yp=yp;E.y=Math.max(gy,yp-0.55)+0.15;
    add(g,boxTris(24,yp-gy+0.6,2.8),mat(E.x+1,(yp+gy)/2-0.25,-42.2),lin(0x9a968c),{j:0.04,rnd:R});add(g,boxTris(24,0.03,0.25),mat(E.x+1,yp+0.36,-41.0),lin(0xd8c060));
    const x0=E.x-E.w/2,x1=E.x+E.w/2,z0=E.z-E.d/2,z1=E.z+E.d/2,yb=E.y,H=3.2,par=lin(0xb8a888),tel=lin(0x8a4a3a),T=0.22;
    add(g,boxTris(E.w,0.2,E.d),mat(E.x,yb-0.1,E.z),lin(0x8a8278),{j:0.04,rnd:R});
    for(const[cx,cz,w,d]of[[E.x,z0+T/2,E.w,T],[x0+T/2,E.z,T,E.d],[x1-T/2,E.z,T,E.d],[x0+(E.x-0.7-x0)/2,z1-T/2,E.x-0.7-x0,T],[x1-(x1-(E.x+0.7))/2,z1-T/2,x1-(E.x+0.7),T]])
      add(g,boxTris(w,H,d),mat(cx,yb+H/2,cz),par,{j:0.05,rnd:R,b:0.55});
    add(g,boxTris(1.4,H-2.3,T),mat(E.x,yb+2.3+(H-2.3)/2,z1-T/2),par,{b:0.55});
    for(const s of[-1,1])add(g,boxTris(E.w+0.8,0.12,E.d/2+0.7),mm(mat(E.x,yb+H+0.75,E.z+s*(E.d/4+0.12)),mat(0,0,0,s*0.42,0,0)),tel,{j:0.06,rnd:R});
    for(const s of[-1,1])add(g,boxTris(0.12,1.5,E.d),mm(mat(E.x+s*(E.w/2),yb+H+0.1,E.z),mat(0,0,0,0,0,0)),par,{b:0.55});
    for(const wx of[-2.8,2.8])add(g,boxTris(1.3,0.9,0.06),mat(E.x+wx,yb+1.7,z1+0.01),lin(0x1e2226),{e:0.03});
    add(g,boxTris(3.2,1.0,0.6),mat(E.x-1.5,yb+0.5,z0+1.2),lin(0x6b4e30),{j:0.05,rnd:R,b:0.6});add(g,boxTris(1.8,0.45,0.5),mat(E.x+2.4,yb+0.22,z1-0.9),lin(0x6b4e30),{b:0.6});
    add(g,boxTris(1.6,1.0,0.05),mat(E.x+2.2,yb+1.6,z0+0.13),lin(0x8a6a40),{b:0.6});add(g,boxTris(1.2,0.6,0.06),mat(E.x+2.2,yb+1.6,z0+0.16),lin(0xe0d8c0),{b:0.6});
    add(g,boxTris(2.6,0.5,0.08),mat(E.x,yb+H-0.2,z1+0.06),lin(0x2a4a3a));}
  // portal do túnel da serra
  {const p=F.portal,yy=p.y,gy=ground(p.x,p.z),cc=lin(0x8a8680);add(g,boxTris(0.9,7,9),mat(p.x-0.4,yy+3.5-0.6,p.z),cc,{j:0.05,rnd:R});
    add(g,boxTris(0.95,4.2,4.0),mat(p.x+0.06,yy+2.1-0.3,p.z),lin(0x0a0908));for(let i=0;i<9;i++){const a=R()*Math.PI;add(g,icoSubTris(1.1+R()*0.8,0.4,R,1),mat(p.x-1.6-R()*2,yy+1+Math.sin(a)*5,p.z+Math.cos(a)*5.5),lin(0x5f5750),{j:0.12,rnd:R});}
    add(g,boxTris(0.12,0.5,3.0),mat(p.x+0.55,yy+4.6,p.z),lin(0x6a6a5a));for(let y=-1;y<2;y++)add(g,boxTris(0.5,0.08,4.2),mat(p.x-0.6,gy+y,p.z),cc);}
  return litMesh(g.data());}
/* o trem: locomotiva, vagão de passageiros (com interior) e vagão blindado */
function tremGeo(){const g=new GB(1<<14,8),R=rng(9911),T=FERRO.trem,z=T.z,y=ferroY(ferroPerto(FERRO.desvio,FERRO.dcum,38,z).s,FERRO.dys),verm=lin(0x7a2a22),cinza=lin(0x5a5c5e),preto=lin(0x1c1c1c),ferr=lin(0x3a3c3e);T.y=y;
  const truque=(x)=>{add(g,boxTris(2.2,0.5,2.2),mat(x,y+0.55,z),ferr,{j:0.05,rnd:R});for(const dx of[-0.7,0.7])for(const s of[-0.8,0.8])add(g,cylTris(0.45,0.45,0.14,12),mm(mat(x+dx,y+0.45,z+s),mat(0,0,0,Math.PI/2,0,0)),preto);};
  // locomotiva
  {const[a,b]=T.loco,m=(a+b)/2;truque(a+2);truque(b-2);add(g,boxTris(b-a,0.35,2.9),mat(m,y+1.0,z),ferr);
    add(g,boxTris(b-a-3.4,2.3,2.4),mat(m-1.3,y+2.3,z),verm,{j:0.04,rnd:R});add(g,boxTris(3.3,3.1,2.9),mat(b-1.65,y+2.7,z),verm,{j:0.04,rnd:R});
    add(g,boxTris(3.5,0.18,3.1),mat(b-1.65,y+4.32,z),cinza);for(const s of[-1,1])add(g,boxTris(1.2,0.8,0.05),mat(b-1.6,y+3.3,z+s*1.46),lin(0x1e2226),{e:0.02});
    add(g,boxTris(0.05,0.8,1.8),mat(b+0.01,y+3.3,z),lin(0x1e2226),{e:0.02});add(g,boxTris(0.06,0.9,2.0),mat(a-0.02,y+2.4,z),cinza);add(g,cylTris(0.22,0.22,0.06,12),mm(mat(a-0.06,y+2.9,z),mat(0,0,0,0,0,Math.PI/2)),lin(0xfff0c0),{e:0.4});
    for(let i=0;i<5;i++)add(g,boxTris(0.9,0.06,2.0),mat(a+1.5+i*1.2,y+3.47,z),cinza);add(g,boxTris(0.05,0.18,2.9),mat(m,y+1.22,z),lin(0xc9a227));}
  // vagão de passageiros: piso, paredes com janelas, porta do lado sul, teto; bancos e beliche dentro
  {const[a,b]=T.pass,m=(a+b)/2,yf=y+1.25,H=2.3,W=2.9,pc=lin(0x3a5a6a),cr=lin(0xd8d0b8);T.yf=yf;truque(a+2);truque(b-2);
    add(g,boxTris(b-a,0.3,W),mat(m,yf-0.15,z),ferr);add(g,boxTris(b-a-0.2,0.02,W-0.3),mat(m,yf+0.005,z),lin(0x6a5a48),{b:0.8});
    const dz0=z+W/2,porta=[37.4,38.6];
    const parede=(x0,x1,zz)=>{add(g,boxTris(x1-x0,0.9,0.12),mat((x0+x1)/2,yf+0.45,zz),pc,{j:0.03,rnd:R});add(g,boxTris(x1-x0,0.55,0.12),mat((x0+x1)/2,yf+H-0.28,zz),pc,{j:0.03,rnd:R});
      for(let x=x0;x<x1-0.05;x+=1.4){const w=Math.min(0.25,x1-x);add(g,boxTris(w,0.85,0.12),mat(x+w/2,yf+1.32,zz),pc);}};
    parede(a,b,z-W/2+0.06);parede(a,porta[0],dz0-0.06);parede(porta[1],b,dz0-0.06);add(g,boxTris(1.2,H-2.05,0.12),mat(37.98,yf+2.05+(H-2.05)/2,dz0-0.06),pc);
    for(const x of[a+0.06,b-0.06])add(g,boxTris(0.12,H,W),mat(x,yf+H/2,z),pc,{j:0.03,rnd:R});
    add(g,boxTris(b-a+0.1,0.2,W+0.15),mat(m,yf+H+0.1,z,0,0,0),cr,{j:0.03,rnd:R});add(g,boxTris(b-a,0.05,0.3),mat(m,yf+0.95,z+W/2+0.02),cr);
    for(let x=a+3;x<b-1;x+=1.6)for(const s of[-0.85,0.85])if(!(s>0&&x>porta[0]-0.6&&x<porta[1]+0.6)){add(g,boxTris(0.5,0.45,0.9),mat(x,yf+0.22,z+s),lin(0x6a3a2a),{b:0.82});add(g,boxTris(0.12,0.6,0.9),mat(x-0.25,yf+0.75,z+s),lin(0x6a3a2a),{b:0.82});}
    add(g,boxTris(1.9,0.4,0.85),mat(a+1.2,yf+0.2,z-0.85),lin(0x4a4a3a),{b:0.82});add(g,boxTris(1.9,0.1,0.8),mat(a+1.2,yf+0.45,z-0.85),lin(0x7a6a5a),{b:0.82});
    add(g,boxTris(0.9,0.75,0.5),mat(a+1.0,yf+0.37,z+1.0),lin(0x5a4430),{b:0.82});
    for(const d of vagaoDegraus()){add(g,boxTris(1.2,0.08,0.34),mat(38,d.y-0.04,d.z),ferr);for(const s of[-0.62,0.62])add(g,boxTris(0.05,0.5,0.05),mat(38+s,d.y-0.25,d.z),ferr);}}
  // vagão blindado: aço, rebites e a porta com teclado no lado sul
  {const[a,b]=T.blind,m=(a+b)/2;truque(a+2);truque(b-2);add(g,boxTris(b-a,0.35,2.9),mat(m,y+1.1,z),ferr);add(g,boxTris(b-a,2.5,2.8),mat(m,y+2.5,z),lin(0x4b5236),{j:0.03,rnd:R});
    add(g,boxTris(b-a+0.1,0.15,2.9),mat(m,y+3.82,z),lin(0x3c4430));for(let x=a+0.4;x<b;x+=0.6)for(const yy of[1.4,3.6])add(g,boxTris(0.06,0.06,2.86),mat(x,y+yy,z),lin(0x3c4430));
    add(g,boxTris(0.25,0.32,0.06),mat(51.2,y+2.6,z+1.43),lin(0x2a2e30));add(g,boxTris(0.18,0.08,0.07),mat(51.2,y+2.75,z+1.44),lin(0x3aa070),{e:1});}
  return litMesh(g.data());}
/* porta do blindado (abre de lado) e a draisine */
INIT_MALHAS.push(()=>{const R=rng(3131),mk=f=>{const gb=new GB(2048,8);f(gb);return litMesh(gb.data());};
  ferroMontarLinha();MESH.ferro=ferroGeo();MESH.trem=tremGeo();ferroColisores();
  if(!SUB.entradas.some(e=>e.id==='tunelTrem')){const est=SUB.complexos.find(c=>c.id==='estacao');SUB.entradas.push({id:'tunelTrem',nome:'Túnel da serra',tipo:'portal',sup:[FERRO.portal.x+1.8,FERRO.portal.z,-Math.PI/2],sub:[-81.3,-84,-Math.PI/2],c:est,trancada:{tipo:'dentro'}});}
  MESH.portaoTunel=mk(g=>{for(let i=0;i<9;i++)add(g,boxTris(0.09,4.0,0.09),mat(0,2.0,-1.8+i*0.45),lin(0x4a4c4e));for(const y of[0.4,2.0,3.6])add(g,boxTris(0.1,0.12,3.9),mat(0,y,0),lin(0x3a3c3e));});
  MESH.blindPorta=mk(g=>{add(g,boxTris(1.6,2.2,0.12),mat(0,1.1,0),lin(0x4b5236),{j:0.03,rnd:R});for(const y of[0.3,1.1,1.9])add(g,boxTris(1.5,0.06,0.14),mat(0,y,0),lin(0x3c4430));add(g,boxTris(0.1,0.3,0.16),mat(0.6,1.1,0),lin(0x8a9096));});
  MESH.ponteNova=mk(g=>{const L=FERRO.ponte.v1-FERRO.ponte.v0+1.2;add(g,boxTris(L,0.3,3.0),mat(0,-0.15,0),lin(0x6b4e30),{j:0.08,rnd:R});for(let x=-L/2+0.3;x<L/2;x+=0.7)add(g,boxTris(0.22,0.1,2.3),mat(x,0.05,0),lin(0x5a4430),{j:0.1,rnd:R});
    for(const s of[-0.72,0.72])add(g,boxTris(L,0.12,0.07),mat(0,0.15,s),lin(0x7a7c80));for(const s of[-1.4,1.4])add(g,boxTris(L,0.7,0.1),mat(0,0.35,s),lin(0x6b4e30),{j:0.08,rnd:R});
    for(let x=-L/2+0.6;x<L/2;x+=1.6)add(g,boxTris(0.2,3.2,0.2),mat(x,-1.6,0),lin(0x5a4430),{j:0.08,rnd:R});});
  MESH.draisine=mk(g=>{const ferr=lin(0x4a4c4e);add(g,boxTris(2.2,0.12,1.7),mat(0,0.45,0),lin(0x6b4e30),{j:0.06,rnd:R});for(const dx of[-0.7,0.7])for(const s of[-0.72,0.72])add(g,cylTris(0.26,0.26,0.1,12),mm(mat(dx,0.26,s),mat(0,0,0,Math.PI/2,0,0)),lin(0x2b2b2b));
    add(g,boxTris(1.8,0.25,1.6),mat(0,0.27,0),ferr);add(g,boxTris(0.14,0.9,0.14),mat(0,0.97,0),ferr);for(const s of[-0.15,0.15])add(g,boxTris(0.06,0.06,0.5),mat(s,1.0,0),ferr);});
  MESH.draisineAlavanca=mk(g=>{add(g,boxTris(1.6,0.06,0.06),mat(0,0,0),lin(0x5a5c5e));for(const s of[-0.8,0.8])add(g,boxTris(0.06,0.06,0.45),mat(s,0,0),lin(0x8a6a40));});});
/* ---------- colisores e chão (estação, ponte, trem, portal) ---------- */
function ferroColisores(){const F=FERRO,T=F.trem,P0=F.ponte,E=F.est,y=T.y;
  // chão da linha: rampas por trechos de 4 m (fora o vão caído)
  const rampas=(pts,cum,ys,pular)=>{const L=cum[cum.length-1];for(let s=0;s<L-0.2;s+=4){const s2=Math.min(L,s+4);if(pular&&pular(s,s2))continue;const a=ferroPonto(pts,cum,s),b=ferroPonto(pts,cum,s2);
    supAdd({t:'ram',x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,hw:1.5,hd:(s2-s)/2,yaw:Math.atan2(a[2],a[3]),ya:ferroY(s,ys)+0.12,yb:ferroY(s2,ys)+0.12,trilho:true});}};
  rampas(F.pts,F.cum,F.ys,(a,b)=>b>P0.sv0-0.3&&a<P0.sv1+0.3);rampas(F.desvio,F.dcum,F.dys,null);
  // pontas inteiras da ponte (com mureta) — o vão do meio só depois do conserto
  for(const[a,b]of[[P0.v1,P0.x1+0.6],[P0.x0-0.6,P0.v0]]){supAdd({t:'ret',x:(a+b)/2,z:-46.5,hw:(b-a)/2,hd:1.6,yaw:0,y:P0.y+0.12,ponte:true});for(const zz of[-48.15,-44.85])colBox((a+b)/2,zz,(b-a)/2,0.08,0,{solid:true,y0:P0.y-0.5,y1:P0.y+1.0});}
  for(const x of[P0.x1,14.1,P0.x0])colBox(x,-46.5,0.8,1.7,0,{solid:true,y0:-50,y1:P0.y-0.4});
  // trem: locomotiva e blindado são blocos; o vagão de passageiros tem piso, paredes e porta
  colBox((T.loco[0]+T.loco[1])/2,T.z,(T.loco[1]-T.loco[0])/2,1.45,0,{solid:true,y0:y-2,y1:y+4.4,trem:true});
  colBox((T.blind[0]+T.blind[1])/2,T.z,(T.blind[1]-T.blind[0])/2,1.45,0,{solid:true,y0:y-2,y1:y+3.9,trem:true});
  {const[a,b]=T.pass,yf=T.yf,W=2.9,m=(a+b)/2,dg=vagaoDegraus(),topo=dg.length?dg[0].y:yf-0.4;colBox(m,T.z,(b-a)/2,W/2,0,{solid:true,y0:y-2,y1:topo-0.03,trem:true});supAdd({t:'ret',x:m,z:T.z,hw:(b-a)/2-0.15,hd:W/2+0.05,yaw:0,y:yf,vagao:true});
    const pw=(x0,x1,zz)=>colBox((x0+x1)/2,zz,(x1-x0)/2,0.1,0,{solid:true,y0:yf-0.3,y1:yf+2.5,trem:true});pw(a,b,T.z-W/2+0.08);pw(a,37.4,T.z+W/2-0.08);pw(38.6,b,T.z+W/2-0.08);
    for(const x of[a+0.08,b-0.08])colBox(x,T.z,0.1,W/2,0,{solid:true,y0:yf-0.3,y1:yf+2.5,trem:true});
    for(const d of vagaoDegraus())supAdd({t:'ret',x:38,z:d.z,hw:0.6,hd:0.17,yaw:0,y:d.y,degrau:true});}
  // estação: plataforma e o prédio (porta no lado sul)
  {const yp=E.yp+0.35;supAdd({t:'ret',x:E.x+1,z:-42.2,hw:12,hd:1.4,yaw:0,y:yp,plataforma:true});colBox(E.x+1,-43.7,12,0.12,0,{solid:true,y0:yp-3,y1:yp-0.05});
    const x0=E.x-E.w/2,x1=E.x+E.w/2,z0=E.z-E.d/2,z1=E.z+E.d/2,yb=E.y,o={solid:true,y0:yb-0.5,y1:yb+3.3};supAdd({t:'ret',x:E.x,z:E.z,hw:E.w/2,hd:E.d/2,yaw:0,y:yb,predio:true});
    colBox(E.x,z0+0.11,E.w/2,0.11,0,o);colBox(x0+0.11,E.z,0.11,E.d/2,0,o);colBox(x1-0.11,E.z,0.11,E.d/2,0,o);colBox((x0+E.x-0.7)/2,z1-0.11,(E.x-0.7-x0)/2,0.11,0,o);colBox((x1+E.x+0.7)/2,z1-0.11,(x1-E.x-0.7)/2,0.11,0,o);
    colBox(E.x-1.5,z0+1.2,1.6,0.3,0,{solid:true,y0:yb-0.5,y1:yb+1.0});}
  // portal: a frente de concreto
  {const p=F.portal;colBox(p.x-0.4,p.z,0.45,4.5,0,{solid:true});}}
/* degraus da porta do vagão de passageiros: do piso até o chão, de 0,45 m em 0,45 m */
function vagaoDegraus(){const T=FERRO.trem,W=2.9,yf=T.yf,z0=T.z+W/2,g=ground(38,z0+1.4),n=Math.max(1,Math.ceil((yf-g)/0.45)),h=(yf-g)/n,out=[];
  for(let k=1;k<n;k++)out.push({z:z0+0.05+k*0.32,y:yf-k*h});return out;}
/* ---------- dentro do vagão e da bilheteria: teto (câmera), sombra e abrigo ---------- */
function ferroInteriorEm(x,y,z){if(!FERRO)return null;const T=FERRO.trem,E=FERRO.est;if(!T.yf)return null;
  if(x>T.pass[0]+0.1&&x<T.pass[1]-0.1&&Math.abs(z-T.z)<1.4&&y>T.yf-0.4&&y<T.yf+2.4)return{teto:T.yf+2.28,escura:0.62};
  if(E.y!==undefined&&Math.abs(x-E.x)<E.w/2-0.15&&Math.abs(z-E.z)<E.d/2-0.15&&y>E.y-0.4&&y<E.y+3.2)return{teto:E.y+3.15,escura:0.55};return null;}
/* ---------- interações ---------- */
const DOCS_FERRO={maquinista:['Diário do maquinista','Noite da evacuação. Carga do laboratório da serra no vagão blindado: caixas lacradas do Exército.<br><br>A ponte do Rio Claro caiu na nossa frente. Deixei o trem no desvio e vou a pé para a cidade.<br><br>O código do vagão blindado ficou com o chefe da estação, na bilheteria.'],
  chefe:()=>['Quadro do chefe da estação','Trem de abastecimento Serra Velha: carga militar no vagão blindado.<br><br>Código da porta do blindado: <b>'+FERRO_ESTADO().codigo+'</b>. Não abrir sem ordem do Exército.<br><br>A linha entra no túnel da serra e desce até a estação dos militares. O portão do túnel só abre por dentro.']};
function ferroDoc(id){const d=DOCS_FERRO[id];const[t,x]=typeof d==='function'?d():d;if(G.modo!=='jogo')return;G.modo='doc';tela('t-doc');$('doc-tit').textContent=t;$('doc-txt').innerHTML=x;if(document.pointerLockElement)document.exitPointerLock();
  const S=FERRO_ESTADO();if(!S.docs[id]){S.docs[id]=true;ganharXP(8);if(typeof diarioDescobre==='function')diarioDescobre('manual','ferro_'+id,t);}sfx('clique');}
function ferroPontos(){const T=FERRO.trem,E=FERRO.est,P0=FERRO.ponte;return[
  {k:'doc',id:'maquinista',x:T.loco[1]-1.6,z:T.z+1.9,y:T.y,t:'Ler o diário do maquinista',s:'na cabine da locomotiva'},
  {k:'doc',id:'chefe',x:E.x+2.2,z:E.z-E.d/2+0.9,y:E.y,t:'Ler o quadro do chefe da estação',s:'bilheteria'},
  {k:'blindado',x:51.2,z:T.z+1.95,y:T.y},
  {k:'bagageiro',x:T.pass[0]+1.0,z:T.z+0.6,y:T.yf},
  {k:'camaVagao',x:T.pass[0]+1.3,z:T.z-0.55,y:T.yf},
  {k:'armarioEst',x:E.x-3.6,z:E.z+E.d/2-0.9,y:E.y},
  {k:'ponte',x:P0.v1+1.6,z:-46.5,y:P0.y},{k:'ponte',x:P0.v0-1.6,z:-46.5,y:P0.y},
  {k:'draisine'}];}
let FERRO_PONTOS=null;
INTERS.push(tryIt=>{if(P.y<SUB_FUNDO||!FERRO.ys.length)return;const S=FERRO_ESTADO();if(!FERRO_PONTOS)FERRO_PONTOS=ferroPontos();
  if(P.trilho){tryIt({k:'draisineSair',o:S.draisine},P.x,P.z,1,9,-2);return;}
  for(const q of FERRO_PONTOS){if(q.k==='draisine'){const d=S.draisine,p=ferroPonto(FERRO.pts,FERRO.cum,d.s);if(Math.abs(p[0]-P.x)<4&&Math.abs(p[1]-P.z)<4)tryIt({k:'draisine',o:d},p[0],p[1],2.2,2.2,-1,ferroY(d.s)+0.2);continue;}
    if(Math.abs(q.x-P.x)>4||Math.abs(q.z-P.z)>4)continue;if(q.k==='ponte'&&S.ponte.feita)continue;tryIt({k:'ferro_'+q.k,o:q},q.x,q.z,q.k==='ponte'?2.4:1.8,2.2,-0.6,q.y);}});
INTER_K.ferro_doc={texto:q=>({t:q.t,s:q.s}),usar:q=>ferroDoc(q.id)};
INTER_K.ferro_blindado={texto:()=>{const S=FERRO_ESTADO();return S.blindado?{t:'Revistar o vagão blindado',s:'carga do Exército'}:{t:'Teclado do vagão blindado',s:'código de 4 números'};},
  usar:q=>{const S=FERRO_ESTADO();if(!S.blindado){abrirTeclado({x:q.x,z:q.z,codigo:()=>FERRO_ESTADO().codigo,abrir:()=>{FERRO_ESTADO().blindado=true;sfx('portaMetal',q.x,q.z);feed('Código aceito: o vagão blindado abriu');ganharXP(15);if(typeof diarioEvento==='function')diarioEvento('Abriu o vagão blindado','missao');}});return;}
    let L=S.blindCx;if(!L){L=new Array(BAU_N).fill(null);let i=0;for(const id of['cartaoLab','mascaraGas'])L[i++]=newItem(id,1);for(const[id,n,ex]of rollLoot('vagaoBlindado')){if(i>=BAU_N)break;if(ITEMS[id])L[i++]=Object.assign(newItem(id,n),ex||{});}S.blindCx=L;ganharXP(20);}
    abrirBau({itens:L,nome:'Carga do vagão blindado',saque:true,aoMudar:()=>{}});}};
INTER_K.ferro_bagageiro={texto:()=>{const L=FERRO_ESTADO().bagageiro;const n=L?L.filter(Boolean).length:0;return{t:'Abrir o bagageiro do vagão',s:n?n+' de '+BAU_N+' espaços usados':'guarde suas coisas aqui'};},
  usar:()=>{const S=FERRO_ESTADO();if(!S.bagageiro)S.bagageiro=new Array(BAU_N).fill(null);abrirBau({itens:S.bagageiro,nome:'Bagageiro do vagão'});}};
INTER_K.ferro_camaVagao={texto:()=>({t:'Beliche do vagão',s:'toque: salvar e acordar aqui · segure: dormir',alt:true,dur:0.7}),
  usar:(q,seg)=>{G.cama={x:q.x+0.6,y:q.y,z:q.z+0.55,vagao:true};if(seg&&typeof sonoComecar==='function')sonoComecar({barraca:true,x:q.x,y:q.y,z:q.z});else{salvarJogo();toast('corpo','Jogo salvo. Se cair, você acorda aqui no vagão. Para dormir, segure E.');}},
  curto:q=>{G.cama={x:q.x+0.6,y:q.y,z:q.z+0.5,vagao:true};salvarJogo();toast('corpo','Jogo salvo. Se cair, você acorda aqui no vagão. Para dormir, segure E.');}};
INTER_K.ferro_armarioEst={texto:()=>({t:'Revistar o armário da bilheteria',s:FERRO_ESTADO().armario?'já revistado':''}),usar:()=>{const S=FERRO_ESTADO();let L=S.armario;
  if(!L){L=new Array(BAU_N).fill(null);let i=0;for(const[id,n,ex]of rollLoot('bilheteria')){if(i>=BAU_N)break;if(ITEMS[id])L[i++]=Object.assign(newItem(id,n),ex||{});}S.armario=L;}abrirBau({itens:L,nome:'Armário da bilheteria',saque:true,aoMudar:()=>{}});}};
Object.assign(LOOT,{vagaoBlindado:[['rifle',1,1,0.6],['balaRifle',8,16,0.9],['colete',1,1,0.5],['seringa',1,3,0.8],['kit',1,2,0.7],['bombaCaseira',1,2,0.5],['racao',2,4,0.8]],
  bilheteria:[['pilhas',1,3,0.6],['lanterna',1,1,0.35],['racao',1,2,0.4],['agua',1,1,0.5],['kitFerramentas',1,1,0.25]]});
/* projeto: consertar a ponte da ferrovia (entregas aos poucos) */
const PONTE_CUSTO={tabuas:16,pregos:10,barraFerro:4,corda:2};
INTER_K.ferro_ponte={texto:()=>{const S=FERRO_ESTADO(),E=S.ponte.entregue,falta=Object.keys(PONTE_CUSTO).filter(k=>(E[k]||0)<PONTE_CUSTO[k]).map(k=>(PONTE_CUSTO[k]-(E[k]||0))+' '+ITEMS[k].nome.toLowerCase());
    const pode=Object.keys(PONTE_CUSTO).some(k=>(E[k]||0)<PONTE_CUSTO[k]&&invCount(k)>0);return{t:'Projeto: consertar a ponte da ferrovia',s:(pode?'entregar o que tem · ':'')+'falta '+falta.join(', ')};},
  usar:()=>{const S=FERRO_ESTADO(),E=S.ponte.entregue;let deu=0;for(const k in PONTE_CUSTO){const f=PONTE_CUSTO[k]-(E[k]||0);if(f<=0)continue;const n=Math.min(f,invCount(k));if(n>0){invRemove(k,n);E[k]=(E[k]||0)+n;deu+=n;}}
    if(!deu){feed('Você não tem nenhuma peça que falta',true);sfx('vazio');return;}sfx('construir');feed('Entregou '+deu+' peças para a ponte');
    if(Object.keys(PONTE_CUSTO).every(k=>(E[k]||0)>=PONTE_CUSTO[k]))ferroPonteFeita(true);}};
function ferroPonteFeita(agora){const S=FERRO_ESTADO(),P0=FERRO.ponte;if(S.ponte.supOk)return;S.ponte.feita=true;S.ponte.supOk=true;
  supAdd({t:'ret',x:(P0.v0+P0.v1)/2,z:-46.5,hw:(P0.v1-P0.v0)/2+0.6,hd:1.5,yaw:0,y:P0.y+0.12,ponte:true,nova:true});
  for(const zz of[-47.9,-45.1])S.ponte.cols=(S.ponte.cols||[]).concat(colBox((P0.v0+P0.v1)/2,zz,(P0.v1-P0.v0)/2,0.08,0,{solid:true,y0:P0.y-0.5,y1:P0.y+0.9}));
  if(agora){ganharXP(120);sfx('missao');toast('corpo','A ponte da ferrovia está de pé de novo! A draisine passa e dá para atravessar o rio a pé por ela.');if(typeof diarioEvento==='function')diarioEvento('Consertou a ponte da ferrovia','missao');}}
/* ---------- draisine ---------- */
INTER_K.draisine={texto:()=>({t:'Subir na draisine',s:'W acelera · S freia e volta · E desce'}),usar:d=>{P.trilho=d;d.v=0;P.acao=null;P.aim=0;sfx('madeira');dica('draisine','corpo','Na draisine: W acelera, S freia e anda para trás, E desce. A ponte caída para a draisine até ser consertada.');}};
INTER_K.draisineSair={texto:()=>({t:'Descer da draisine',s:''}),usar:d=>ferroDescer()};
function ferroDescer(){const d=P.trilho;if(!d)return;P.trilho=null;const p=ferroPonto(FERRO.pts,FERRO.cum,d.s),px=-p[3]*1.6,pz=p[2]*1.6;P.x=p[0]+px;P.z=p[1]+pz;P.y=chaoEm(P.x,P.z,ferroY(d.s)+1);P.vy=0;d.v=0;}
function draisineLimites(){const S=FERRO_ESTADO(),P0=FERRO.ponte;if(S.ponte.feita)return[2,FERRO.L-6];return null;}
function draisinePasso(dt){const d=P.trilho,S=FERRO_ESTADO(),P0=FERRO.ponte;if(!d)return false;
  const acel=IN.mz>0.2?2.6:IN.mz<-0.2?-3.2:0;d.v+=acel*dt;d.v-=Math.sign(d.v)*Math.min(Math.abs(d.v),0.45*dt);d.v=clamp(d.v,-4,9);
  let s=d.s+d.v*dt;const lo=FERRO.sMin,hi=FERRO.L-6;if(s<lo){s=lo;d.v=0;}if(s>hi){s=hi;d.v=0;}
  if(!S.ponte.feita){if(d.s<=P0.sv0-1&&s>P0.sv0-1){s=P0.sv0-1;if(Math.abs(d.v)>2)sfx('impacto');d.v=0;feed('A ponte caiu: daqui a draisine não passa',true);}
    if(d.s>=P0.sv1+1&&s<P0.sv1+1){s=P0.sv1+1;if(Math.abs(d.v)>2)sfx('impacto');d.v=0;feed('A ponte caiu: daqui a draisine não passa',true);}}
  d.s=s;const p=ferroPonto(FERRO.pts,FERRO.cum,s);P.x=p[0];P.z=p[1];P.y=ferroY(s)+0.58;P.vx=P.vz=P.vy=0;P.noChao=true;P.amp=0;P.aim=0;
  if(Math.abs(d.v)>0.3)P.body=angLerp(P.body,Math.atan2(p[2]*Math.sign(d.v),p[3]*Math.sign(d.v)),1-Math.exp(-dt*4));
  d.alav=(d.alav||0)+d.v*dt*1.6;
  // atropela zumbis no caminho
  if(Math.abs(d.v)>3.5)for(const z of Z){if(!z.vivo||Math.abs(z.y-P.y)>2)continue;if(d2(z.x,z.z,P.x,P.z)<1.4*1.4){ferirZ(z,Math.abs(d.v)*9,p[2]*Math.sign(d.v),p[3]*Math.sign(d.v),true);d.v*=0.6;sfx('impacto',z.x,z.z);}}
  if(Math.abs(d.v)>0.5){d.somT=(d.somT||0)-dt;if(d.somT<=0){d.somT=0.32-Math.min(0.2,Math.abs(d.v)*0.02);sfx('estalo',P.x,P.z,0.25);}}
  sobreviver(dt,false);const ch=P.ch;ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;
  P.recuo=Math.max(0,(P.recuo||0)-dt*6);P.hurt=Math.max(0,(P.hurt||0)-dt);return true;}
function ferroDesenhar(Pg){if(!MESH.ferro||cam.pos[1]<SUB_FUNDO)return;const S=FERRO_ESTADO(),cx=cam.pos[0],cz=cam.pos[2];drawStat(Pg,MESH.ferro,ID);
  if(d2(38,-50.8,cx,cz)<220*220){drawStat(Pg,MESH.trem,ID);const T=FERRO.trem;drawStat(Pg,MESH.blindPorta,mat(51.2+(S.blindado?1.5:0),T.y+1.25,T.z+1.47));}
  if(MESH.portaoTunel&&G.sub&&!G.sub.abertas.ent_tunelTrem&&d2(FERRO.portal.x,FERRO.portal.z,cx,cz)<150*150)drawStat(Pg,MESH.portaoTunel,mat(FERRO.portal.x+0.62,FERRO.portal.y-0.25,FERRO.portal.z));
  if(S.ponte.feita)drawStat(Pg,MESH.ponteNova,mat((FERRO.ponte.v0+FERRO.ponte.v1)/2,FERRO.ponte.y+0.15,-46.5));
  {const d=S.draisine,p=ferroPonto(FERRO.pts,FERRO.cum,d.s),y=ferroY(d.s)+0.12,yaw=Math.atan2(p[2],p[3]);if(d2(p[0],p[1],cx,cz)<160*160){drawStat(Pg,MESH.draisine,mat(p[0],y,p[1],0,yaw+Math.PI/2,0));
    drawStat(Pg,MESH.draisineAlavanca,mm(mat(p[0],y+1.0,p[1],0,yaw+Math.PI/2,0),mat(0,0,0,0,0,Math.sin(d.alav||0)*0.45)));}}}
DESENHO.opaco.push(ferroDesenhar);
DESENHO.sombra.push((Pg,perto)=>{if(!MESH.ferro||P.y<SUB_FUNDO)return;if(d2(38,-50.8,P.x,P.z)<(perto?60:120)**2)drawStat(Pg,MESH.trem,ID);});
MAPA_DESENHOS.push((g,X,Y,k,n)=>{if(!FERRO.ys.length)return;g.strokeStyle=n>0.5?'#5a5048':'#8a7a66';g.lineWidth=2.2;g.setLineDash([4,3]);g.beginPath();FERRO.pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();
  g.beginPath();FERRO.desvio.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();g.setLineDash([]);
  g.fillStyle=n>0.5?'#5a3a30':'#a04a3a';const T=FERRO.trem;g.fillRect(X(T.loco[0]),Y(T.z)-2,X(T.blind[1])-X(T.loco[0]),4);});
PASSOS.push(()=>{if(P.trilho&&(!P.alive||CARRO.ativo))P.trilho=null;});
/* ---------- descobertas ---------- */
let ferroDescT=0;
PASSOS.push(dt=>{ferroDescT-=dt;if(ferroDescT>0||!FERRO.ys.length||typeof diarioDescobre!=='function')return;ferroDescT=2;const T=FERRO.trem,E=FERRO.est,p=FERRO.portal;
  if(Math.hypot(P.x-38,P.z-T.z)<18)diarioDescobre('lugar','trem','Trem abandonado',15);if(Math.hypot(P.x-E.x,P.z-E.z)<16)diarioDescobre('lugar','estacaoCidade','Estação ferroviária',12);
  if(Math.hypot(P.x-14,P.z+46.5)<16)diarioDescobre('lugar','ponteTrem','Ponte da ferrovia (caída)',8);if(Math.hypot(P.x-p.x,P.z-p.z)<14)diarioDescobre('lugar','tunelSerra','Túnel da serra',10);});
/* ---------- salvar e carregar ---------- */
V8.novo.ferrovia=()=>{G.ferro=ferroNovo();P.trilho=null;};
V8.salvar.ferrovia=()=>{const S=FERRO_ESTADO();return{ponte:{entregue:S.ponte.entregue,feita:S.ponte.feita},blindado:S.blindado,blindCx:S.blindCx,bagageiro:S.bagageiro,armario:S.armario||null,draisine:{s:+S.draisine.s.toFixed(2),v:0},codigo:S.codigo,docs:S.docs};};
V8.carregar.ferrovia=s=>{G.ferro=Object.assign(ferroNovo(),s&&typeof s==='object'?s:{});const S=G.ferro;S.ponte=Object.assign({entregue:{},feita:false},S.ponte||{});S.ponte.supOk=false;S.draisine=Object.assign({s:36,v:0},S.draisine||{});P.trilho=null;
  if(S.ponte.feita&&FERRO.ys.length)ferroPonteFeita(false);};

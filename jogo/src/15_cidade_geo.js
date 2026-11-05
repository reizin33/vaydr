/* ================= desenho da cidade: prédios (perto com interior / longe só a casca), ruas, quarteirões, objetos e metrô ================= */
/* o 4º valor de cada vértice (osso) leva o "quanto é interior" (0 rua, ~0.6 sala, ~0.9 subsolo): o shader apaga o céu e o sol aí dentro */
function geoPredio(p,longe){const g=new GB(1<<15,8),R=rng(500+p.id*13);
  for(const q of p.pecas){const[u0,u1,y0,y1,v0,v1,cor,b,k,e,rx]=q;if(longe?(k===1||b>0):k===2)continue;
    const n0=g.n;add(g,boxTris(u1-u0,y1-y0,v1-v0),mat((u0+u1)/2,(y0+y1)/2,(v0+v1)/2,rx||0,0,0),lin(cor),{b,e:e||0,j:longe?0.02:0.035,rnd:R});
    // sombra de contato no térreo: a parede escurece de leve perto do chão (cada vértice pela altura dele, então as peças emendam sem degrau)
    if(!rx&&!e&&y1-y0>0.3&&y0<p.y0+(p.H||2.9)-0.05&&Math.min(u1-u0,v1-v0)<0.5&&Math.max(u1-u0,v1-v0)>0.25){const F=g.f,H=p.H||2.9;
      for(let i=n0;i<g.n;i++){const o=i*11,f=0.74+0.26*clamp((F[o+1]-p.y0)/H,0,1);F[o+3]*=f;F[o+4]*=f;F[o+5]*=f;}}}
  if(!longe&&p.heras){   // hera: folhinhas em placas, mais cheia embaixo e afinando para cima
    for(const h of p.heras){const Rh=rng(7000+p.id*31+Math.round(h.s*10)),nf=Math.round(10+h.w*h.h*9);
      for(let i=0;i<nf;i++){const t=Math.pow(Rh(),1.6),yy=h.y0+t*h.h,ss=h.s+(Rh()-0.5)*h.w*(1-0.55*t),d=0.03+Rh()*0.05,sz=0.11+Rh()*0.1;
        const fx=h.eixo==='u'?ss:h.k+h.fora*d,fz=h.eixo==='u'?h.k+h.fora*d:ss;
        add(g,boxTris(sz,sz*0.85,0.025),mat(fx,yy,fz,(Rh()-0.5)*0.8,(h.eixo==='u'?0:Math.PI/2)+(Rh()-0.5)*0.9,(Rh()-0.5)*1.2),mixc(lin(0x2f5222),lin(0x4f7330),Rh()),{j:0.12,rnd:Rh});}}}
  if(!longe){
    for(const m of CID.moveis){if(m.p!==p)continue;const w=m.u1-m.u0,d=m.v1-m.v0,cu=(m.u0+m.u1)/2,cv=(m.v0+m.v1)/2,b=m.s.escura;
      if(m.k==='cama'){add(g,bvTris(w,0.3,d),mat(cu,m.y+0.15,cv),lin(m.c1),{b});add(g,bvTris(w-0.1,0.18,d-0.1),mat(cu,m.y+0.39,cv),lin(m.c2),{b,j:0.05,rnd:R});add(g,bvTris(w-0.2,0.12,0.4),mat(cu,m.y+0.52,m.v0+0.3),lin(0xe8e2d4),{b});}
      else if(m.k==='sofa'){add(g,bvTris(w,0.45,d),mat(cu,m.y+0.22,cv),lin(m.c1),{b,j:0.05,rnd:R});add(g,bvTris(w,0.45,0.2),mat(cu,m.y+0.65,m.v1-0.1),lin(m.c2),{b});}
      else if(m.k==='mesa'||m.k==='bancada'){add(g,bvTris(w,0.06,d),mat(cu,m.y+m.h-0.03,cv),lin(m.c1),{b,j:0.04,rnd:R});for(const su of[-1,1])for(const sv of[-1,1])add(g,bvTris(0.06,m.h-0.06,0.06),mat(cu+su*(w/2-0.06),m.y+(m.h-0.06)/2,cv+sv*(d/2-0.06)),lin(m.c2),{b});}
      else if(m.k==='maca'){add(g,bvTris(w,0.12,d),mat(cu,m.y+0.75,cv),lin(m.c2),{b});for(const su of[-1,1])for(const sv of[-1,1])add(g,bvTris(0.05,0.7,0.05),mat(cu+su*(w/2-0.05),m.y+0.35,cv+sv*(d/2-0.05)),lin(m.c1),{b});}
      else if(m.k==='gerador'){add(g,bvTris(w,0.8,d),mat(cu,m.y+0.4,cv),lin(m.c1),{b,j:0.04,rnd:R});add(g,bvTris(w*0.5,0.3,d*0.6),mat(cu,m.y+0.95,cv),lin(m.c2),{b});add(g,cylTris(0.05,0.05,0.6,6),mat(cu+w*0.35,m.y+0.8,cv),lin(0x2b2b2b),{b});}
      else if(m.k==='carro'){carroGeo(g,0,0,0,m.c1,R,false,0,mat(cu,m.y,cv,0,0,0),b);}
      else if(m.k==='palete'){add(g,bvTris(w,0.14,d),mat(cu,m.y+0.07,cv),lin(m.c1),{b,j:0.06,rnd:R});for(let i=0;i<4;i++){const su=(i%2?0.26:-0.26),sv=(i>1?0.22:-0.22);add(g,bvTris(0.5,0.45,0.42),mat(cu+su,m.y+0.37+(i===3?0.45:0),cv+sv,0,R()*0.2,0),lin(0x8a6a45),{b,j:0.08,rnd:R});}}
      else if(MOVEIS_NOVOS[m.k])geoMovelNovo(g,m,b,R);
      else if(m.k==='empilhadeira'){add(g,bvTris(w,0.9,d*0.62),mat(cu,m.y+0.55,cv+d*0.12),lin(m.c1),{b,j:0.04,rnd:R});add(g,bvTris(w*0.9,0.08,d*0.5),mat(cu,m.y+2.05,cv+d*0.15),lin(0x2b2b2b),{b});
        for(const su of[-0.5,0.5])add(g,bvTris(0.06,2.0,0.06),mat(cu+su,m.y+1.05,cv+d*0.38),lin(0x2b2b2b),{b});for(const su of[-0.45,0.45])add(g,bvTris(0.1,2.1,0.1),mat(cu+su,m.y+1.05,cv-d*0.3),lin(0x3a3d40),{b});
        for(const su of[-0.25,0.25])add(g,bvTris(0.12,0.05,0.9),mat(cu+su,m.y+0.1,cv-d*0.5),lin(0x55595c),{b});for(const sv of[-0.6,0.6])for(const su of[-0.55,0.55])add(g,cylTris(0.2,0.2,0.18,8),mat(cu+su,m.y+0.2,cv+sv*d*0.5,0,0,Math.PI/2),lin(0x181818),{b});}}
    for(const c of CID.conts){if(c.p!==p||c.oculto)continue;const D=CONT_DEF[c.tipo];if(!D)continue;const b=c.sala?c.sala.escura:0.6,M=mat(c.u,c.y,c.v,0,c.yawL,0);
      add(g,bvTris(D.hw*2,D.h,D.hd*2),mm(M,mat(0,D.h/2,0)),lin(D.cor),{b,j:0.05,rnd:R});
      if(c.tipo==='geladeira'||c.tipo==='armario'||c.tipo==='guardaRoupa'||c.tipo==='armarioMed')add(g,bvTris(0.03,0.25,0.03),mm(M,mat(D.hw*0.6,D.h*0.55,D.hd+0.02)),lin(0x9aa1a6),{b});
      if(c.tipo==='gaveta'||c.tipo==='arquivo')for(let i=0;i<3;i++)add(g,bvTris(D.hw*1.7,0.02,0.02),mm(M,mat(0,D.h*(0.25+i*0.28),D.hd+0.01)),lin(0x55595c),{b});
      if(c.tipo==='prateleira')for(let i=1;i<4;i++){add(g,bvTris(D.hw*2.02,0.04,D.hd*2.02),mm(M,mat(0,D.h*i/4,0)),lin(0x6f777e),{b});for(let j=0;j<4;j++)add(g,bvTris(0.22,0.24,0.2),mm(M,mat(-D.hw+0.3+j*0.42,D.h*i/4+0.14,0)),lin([0xc9a227,0x9a3a2e,0x3d5a73,0xd9d6cc][(i+j)%4]),{b,j:0.1,rnd:R});}
      if(c.tipo==='caixas'){add(g,bvTris(0.6,0.5,0.5),mm(M,mat(0.25,D.h+0.25,0.05,0,0.4,0)),lin(0x7a5a3c),{b,j:0.08,rnd:R});}
      if(c.tipo==='mala'){add(g,bvTris(0.25,0.05,0.04),mm(M,mat(0,D.h+0.05,0)),lin(0x2b2b2b),{b});add(g,bvTris(D.hw*2.02,0.04,D.hd*2.02),mm(M,mat(0,D.h*0.5,0)),lin(0x3a2a20),{b});}
      if(c.tipo==='armarioArmas'||c.tipo==='armarioMetal'){for(let i=0;i<4;i++)add(g,bvTris(D.hw*1.2,0.015,0.02),mm(M,mat(0,D.h*(0.7+i*0.05),D.hd+0.01)),lin(0x2b2b2b),{b});add(g,bvTris(0.03,0.2,0.03),mm(M,mat(D.hw*0.6,D.h*0.5,D.hd+0.02)),lin(0x9aa1a6),{b});}
      if(c.tipo==='freezer'){add(g,bvTris(D.hw*2.02,0.03,D.hd*2.02),mm(M,mat(0,D.h-0.12,0)),lin(0x9aa1a6),{b});}
      if(c.tipo==='bolsa'){add(g,bvTris(0.5,0.05,0.06),mm(M,mat(0,D.h+0.06,0,0,0,0.4)),lin(0x2b2b2b),{b});add(g,bvTris(0.2,0.12,0.02),mm(M,mat(0.1,D.h*0.5,D.hd+0.01)),lin(0x55595c),{b});}}}
  return g.data();}
/* móveis das casas de fora da cidade: modelo virado para +z (frente), girado conforme a parede em que encosta */
function geoMovelNovo(g,m,b,R){const N=MOVEIS_NOVOS[m.k],W=N[0],D=N[1],h=N[2],c1=lin(N[3]),c2=lin(N[4]),ang=[0,Math.PI,Math.PI/2,-Math.PI/2][m.f||0];
  const F=mat((m.u0+m.u1)/2,m.y,(m.v0+m.v1)/2,0,ang,0),A=(tr,M,c,o)=>add(g,tr,mm(F,M),c,Object.assign({b},o||{}));
  switch(m.k){
    case'rack':A(bvTris(W,h,D),mat(0,h/2,0),c1,{j:0.05,rnd:R});A(bvTris(W*0.98,0.02,D*0.9),mat(0,h*0.5,0.01),scl(c1,0.7));
      A(bvTris(W*0.6,0.42,0.06),mat(0,h+0.27,-D/2+0.14),c2);A(bvTris(W*0.56,0.36,0.01),mat(0,h+0.27,-D/2+0.175),lin(0x0b0d0f));A(bvTris(0.24,0.06,0.14),mat(0,h+0.03,-D/2+0.14),c2);break;
    case'poltrona':A(bvTris(W,0.4,D),mat(0,0.2,0),c1,{j:0.05,rnd:R});A(bvTris(W,0.5,0.16),mat(0,0.65,-D/2+0.08),c2);for(const sx of[-1,1])A(bvTris(0.14,0.26,D),mat(sx*(W/2-0.07),0.53,0),c2);
      A(bvTris(W-0.3,0.08,D-0.2),mat(0,0.43,0.05),scl(c1,1.1));break;
    case'estante':A(bvTris(W,h,D),mat(0,h/2,0),c1,{j:0.04,rnd:R});for(let i=0;i<4;i++){const y=0.3+i*0.42;A(bvTris(W-0.06,0.03,D-0.04),mat(0,y,0.01),c2);
        let x=-W/2+0.08;while(x<W/2-0.14){const bw=0.05+R()*0.07,bh=0.18+R()*0.14;A(bvTris(bw,bh,D*0.7),mat(x+bw/2,y+0.015+bh/2,0.02),lin([0x7a2a22,0x2f4f6a,0x3a5a2a,0xc9a227,0x5a3a2a,0xd8d0c0][Math.floor(R()*6)]));x+=bw+0.01+(R()<0.15?0.12:0);}}break;
    case'fogao':A(bvTris(W,h,D),mat(0,h/2,0),c1,{j:0.08,rnd:R});A(bvTris(W*0.96,0.05,D*0.92),mat(0,h+0.02,0),c2);A(bvTris(0.36,0.3,0.02),mat(-0.18,0.38,D/2+0.005),c2);
      A(bvTris(0.22,0.14,0.02),mat(0.25,0.22,D/2+0.005),lin(0x3a1a10));A(cylTris(0.07,0.07,1.75,6),mat(W/2-0.16,h,-D/2+0.14),c2);A(cylTris(0.16,0.14,0.14,8),mat(-0.18,h+0.04,0.05),lin(0x55595c));
      A(cylTris(0.13,0.13,0.1,8),mat(0.2,h+0.04,0.08),lin(0x3a3d40));break;
    case'piaL':A(bvTris(W,h,D),mat(0,h/2,0),lin(0x8a6e52),{j:0.04,rnd:R});A(bvTris(W+0.02,0.04,D+0.02),mat(0,h,0),c1);A(bvTris(0.5,0.03,0.36),mat(0.15,h+0.005,0.02),lin(0x55595c));
      A(bvTris(0.03,0.22,0.03),mat(0.15,h+0.12,-D/2+0.08),c2);A(bvTris(0.03,0.03,0.14),mat(0.15,h+0.22,-D/2+0.14),c2);
      A(cylTris(0.13,0.15,0.26,10),mat(-W/2+0.2,h+0.02,-0.05),lin(0xb06a40));A(cylTris(0.14,0.13,0.24,10),mat(-W/2+0.2,h+0.28,-0.05),lin(0xb87248));A(cylTris(0.06,0.02,0.05,8),mat(-W/2+0.2,h+0.52,-0.05),lin(0xb87248));
      for(let i=0;i<3;i++)A(bvTris(0.03,0.22,0.22),mat(0.5+i*0.05,h+0.12,-D/2+0.16),lin(0xe8e4dc));break;
    case'criado':A(bvTris(W,h,D),mat(0,h/2,0),c1,{j:0.05,rnd:R});A(bvTris(W*0.8,0.02,0.02),mat(0,h*0.6,D/2+0.005),c2);A(cylTris(0.07,0.09,0.06,8),mat(0.05,h,0),lin(0x8a8070));
      A(cylTris(0.012,0.012,0.22,4),mat(0.05,h+0.06,0),lin(0x8a8070));A(cylTris(0.13,0.07,0.15,8),mat(0.05,h+0.25,0),lin(0xe0d0a8));break;
    case'vaso':A(bvTris(0.36,0.4,0.42),mat(0,0.2,0.04),c1);A(bvTris(0.38,0.05,0.44),mat(0,0.42,0.04),c2);A(bvTris(0.4,0.36,0.16),mat(0,0.6,-D/2+0.08),c1);break;
    case'piaB':A(bvTris(0.14,0.72,0.14),mat(0,0.36,-0.04),c1);A(bvTris(W,0.14,D),mat(0,0.8,0),c1);A(bvTris(0.34,0.02,0.24),mat(0,0.87,0.02),lin(0x9aa1a6));A(bvTris(0.42,0.52,0.02),mat(0,1.5,-D/2+0.01),lin(0x9fb8c0));break;
    case'mesinha':A(bvTris(W,0.04,D),mat(0,h-0.02,0),c1,{j:0.04,rnd:R});for(const sx of[-1,1])for(const sz of[-1,1])A(bvTris(0.04,h-0.04,0.04),mat(sx*(W/2-0.05),(h-0.04)/2,sz*(D/2-0.05)),c2);
      A(bvTris(0.22,0.02,0.3),mat(0.15,h+0.01,0),lin(0xd8d0c0));break;
    case'escrivaninha':A(bvTris(W,0.05,D),mat(0,h-0.025,0),c1,{j:0.04,rnd:R});A(bvTris(0.42,h-0.05,D-0.04),mat(W/2-0.22,(h-0.05)/2,0),c2);for(const sz of[-1,1])A(bvTris(0.05,h-0.05,0.05),mat(-W/2+0.05,(h-0.05)/2,sz*(D/2-0.05)),c2);
      for(let i=0;i<3;i++)A(bvTris(0.3,0.015,0.015),mat(W/2-0.22,0.15+i*0.2,D/2+0.005),lin(0x9aa1a6));break;
    case'mesaC':A(bvTris(W,0.05,D),mat(0,h-0.025,0),c1,{j:0.04,rnd:R});for(const sx of[-1,1])for(const sz of[-1,1])A(bvTris(0.05,h-0.05,0.05),mat(sx*(W/2-0.06),(h-0.05)/2,sz*(D/2-0.06)),c2);
      for(const sz of[-1,1])for(const sx of[-0.27,0.27]){const z=sz*(D/2+0.24),caida=R()<0.15,Cm=mm(mat(sx,0,z,0,sz<0?0:Math.PI,0),caida?mat(0,0.22,0,1.45,0,0):mat(0,0,0));
        A(bvTris(0.4,0.04,0.4),mm(Cm,mat(0,0.45,0)),c2);A(bvTris(0.4,0.45,0.04),mm(Cm,mat(0,0.7,-0.18)),c2);for(const lx of[-0.17,0.17])for(const lz of[-0.17,0.17])A(bvTris(0.035,0.45,0.035),mm(Cm,mat(lx,0.225,lz)),c2);}
      A(bvTris(0.24,0.015,0.24),mat(-0.2,h+0.008,0.05),lin(0xe8e4dc));A(cylTris(0.035,0.035,0.2,6),mat(0.25,h,-0.05),lin(0x3a6a3a));break;
    case'tapete':A(bvTris(W,0.012,D),mat(0,0.006,0),c1);A(bvTris(W-0.2,0.014,D-0.2),mat(0,0.007,0),lin(0x6a2a1a));A(bvTris(W-0.5,0.016,D-0.5),mat(0,0.008,0),c2);break;
    case'quadro':case'quadroP':{const P=m.k==='quadroP',fw=W,fh=P?0.36:0.52,yq=P?1.45:1.55,tz=-D/2,tort=R()<0.3?(R()-0.5)*0.16:0,Q=(M)=>mm(mat(0,yq,tz,0,0,tort),M);
      A(bvTris(fw,fh,0.03),Q(mat(0,0,0.015)),c1);A(bvTris(fw-0.07,fh-0.07,0.012),Q(mat(0,0,0.033)),c2);
      if(P){A(bvTris(fw*0.5,fh*0.55,0.006),Q(mat(-0.03,0.02,0.04)),lin([0x8a6a45,0x6a7a8a,0x9a8a6a][Math.floor(R()*3)]));}
      else{A(bvTris(fw-0.09,0.17,0.008),Q(mat(0,0.1,0.041)),lin([0x8fb0c8,0xe0a070,0xa8c0d0][Math.floor(R()*3)]));A(bvTris(fw-0.09,0.15,0.008),Q(mat(0,-0.1,0.041)),lin([0x4a6a3a,0x6a7a3a,0x7a5a3a][Math.floor(R()*3)]));
        A(bvTris(0.12,0.12,0.009),Q(mat(fw*0.22,0.12,0.043)),lin(0xf0e0a0));}break;}
    case'planta':A(cylTris(0.17,0.13,0.3,8),mat(0,0,0),c1,{j:0.05,rnd:R});A(cylTris(0.15,0.15,0.02,8),mat(0,0.28,0),lin(0x3a2a1a));
      A(cylTris(0.3,0.06,0.42,7),mat(0,0.3,0),c2,{j:0.08,rnd:R});A(cylTris(0.05,0.3,0.36,7,{phase:0.4}),mat(0,0.72,0),scl(c2,1.15),{j:0.08,rnd:R});
      for(let i=0;i<4;i++){const a=i*1.57+R()*0.5;A(bvTris(0.07,0.02,0.34),mm(mat(Math.sin(a)*0.16,0.62+R()*0.2,Math.cos(a)*0.16,0.5,a,0),mat(0,0,0.12)),scl(c2,0.9));}break;
    case'caixasP':A(bvTris(0.62,0.42,0.5),mat(0,0.21,0),c1,{j:0.05,rnd:R});A(bvTris(0.64,0.012,0.08),mat(0,0.425,0),lin(0xc8b48a));
      A(bvTris(0.46,0.34,0.4),mat(0.04,0.59,0.02,0,0.35,0),c2,{j:0.05,rnd:R});A(bvTris(0.48,0.012,0.07),mat(0.04,0.765,0.02,0,0.35,0),lin(0xc8b48a));
      if(R()<0.5)A(bvTris(0.3,0.24,0.26),mat(-0.25,0.12,0.25,0,-0.4,0),scl(c1,0.9));break;
    case'comoda':A(bvTris(W,h,D),mat(0,h/2,0),c1,{j:0.05,rnd:R});A(bvTris(W+0.02,0.03,D+0.02),mat(0,h,0),scl(c1,0.85));
      for(let i=0;i<3;i++){A(bvTris(W*0.92,0.012,0.01),mat(0,0.27+i*0.25,D/2+0.005),c2);for(const sx of[-0.24,0.24])A(bvTris(0.07,0.025,0.02),mat(sx,0.15+i*0.25,D/2+0.012),lin(0x9aa1a6));}
      A(bvTris(0.16,0.22,0.02),mat(0.28,h+0.11,-0.08,-0.15,0,0),lin(0x2b2b2b));A(bvTris(0.12,0.16,0.01),mat(0.28,h+0.11,-0.068,-0.15,0,0),lin(0xd8c8a8));
      A(cylTris(0.05,0.06,0.16,8),mat(-0.3,h,0),lin(0x6a8a9a));break;
    case'roupasChao':A(bvTris(0.52,0.03,0.36),mat(-0.12,0.015,0,0,0.4,0),c1);A(bvTris(0.36,0.04,0.3),mat(0.18,0.02,0.1,0,-0.3,0),c2);
      A(bvTris(0.12,0.08,0.26),mat(0.05,0.04,-0.22,0,1.0,0),lin(0x3a3a3a));A(bvTris(0.11,0.07,0.25),mat(0.2,0.035,-0.18,0,0.7,0),lin(0x3a3a3a));break;
    case'entulho':for(let i=0;i<7;i++)A(bvTris(0.21,0.004,0.3),mat((R()-0.5)*0.8,0.003+i*0.001,(R()-0.5)*0.6,0,R()*3.14,0),lin([0xe8e4dc,0xd8d0c0,0xc8c0a8][i%3]));
      A(cylTris(0.035,0.035,0.24,6),mat(0.25,0.035,-0.15,1.57,R()*3,0),lin(0x3a6a3a));A(cylTris(0.033,0.033,0.11,8),mat(-0.3,0,0.2),lin(0xa83a2a));
      if(R()<0.5)A(bvTris(0.3,0.05,0.22),mat(-0.1,0.025,-0.25,0,0.6,0),lin(0x6a4a2a));break;
    case'bancadaCoz':A(bvTris(W,h-0.04,D),mat(0,(h-0.04)/2,0),c1,{j:0.04,rnd:R});A(bvTris(W+0.03,0.04,D+0.03),mat(0,h-0.02,0),c2);
      for(const sx of[-0.37,0,0.37])A(bvTris(0.012,h-0.16,0.01),mat(sx,(h-0.04)/2,D/2+0.005),scl(c1,0.7));
      A(cylTris(0.12,0.11,0.12,10),mat(-0.45,h,0.02),lin(0x55595c));A(bvTris(0.36,0.02,0.26),mat(0.1,h+0.01,0.05),lin(0xb8925a));
      for(let i=0;i<3;i++)A(cylTris(0.035,0.04,0.2+i*0.04,6),mat(0.45+i*0.09,h,-0.15),lin([0x7a2a22,0x3a6a3a,0xd8c8a0][i]));break;
    case'armarioAlto':A(bvTris(W,0.62,D),mat(0,1.85,0),c1,{j:0.04,rnd:R});A(bvTris(0.012,0.56,0.01),mat(0,1.85,D/2+0.005),scl(c1,0.7));
      for(const sx of[-0.08,0.08])A(bvTris(0.025,0.08,0.02),mat(sx,1.7,D/2+0.012),lin(0x9aa1a6));if(R()<0.35)A(bvTris(W/2-0.02,0.58,0.02),mat(W/4+0.2,1.85,D/2+0.25,0,-1.1,0),c2);break;
    case'luminaria':A(cylTris(0.15,0.16,0.03,10),mat(0,0,0),c1);A(cylTris(0.015,0.015,1.4,5),mat(0,0.03,0),c1);A(cylTris(0.11,0.2,0.26,10),mat(0,1.36,0),c2);break;
    case'cadeira':{const caida=R()<0.25,Cm=caida?mat(0,0.22,0,1.45,0,0):mat(0,0,0);A(bvTris(0.42,0.04,0.42),mm(Cm,mat(0,0.45,0)),c1);A(bvTris(0.42,0.42,0.04),mm(Cm,mat(0,0.68,-0.19)),c1);
      for(const lx of[-0.18,0.18])for(const lz of[-0.18,0.18])A(bvTris(0.035,0.45,0.035),mm(Cm,mat(lx,0.225,lz)),c2);break;}
    case'chuveiro':A(bvTris(W,0.05,D),mat(0,0.025,0),c1);A(cylTris(0.015,0.015,1.15,5),mat(-W/2+0.12,0.9,-D/2+0.05),c2);A(cylTris(0.08,0.05,0.04,8),mat(-W/2+0.12,2.0,-D/2+0.2),c2);
      A(bvTris(0.02,0.02,D),mat(W/2-0.02,1.95,0),c2);A(bvTris(0.015,1.55,D*0.6),mat(W/2-0.02,1.18,D*0.18),lin(0x9fb8c0));break;
    case'lixeira':A(cylTris(0.14,0.15,0.4,8),mat(0,0,0),c1);A(cylTris(0.16,0.16,0.04,8),mat(0,0.4,0),c2);break;
    case'banco':A(bvTris(W,0.06,0.42),mat(0,0.45,0.02),c1,{j:0.04,rnd:R});A(bvTris(W,0.5,0.05),mat(0,0.74,-D/2+0.03),c1);for(const sx of[-1,1])A(bvTris(0.06,0.88,D),mat(sx*(W/2-0.03),0.44,0),c2);break;
    case'altar':A(bvTris(W,h,D),mat(0,h/2,0),lin(0x8a6e52));A(bvTris(W+0.06,0.55,D+0.06),mat(0,h-0.26,0),c1);for(const sx of[-0.55,0.55]){A(cylTris(0.04,0.04,0.3,6),mat(sx,h,0),lin(0xe8e2d4));
        A(bvTris(0.03,0.05,0.03),mat(sx,h+0.33,0),lin(0xffb050),{e:1.2});}A(bvTris(0.5,0.02,0.35),mat(0,h+0.01,0.05),lin(0x7a2a22));break;}}
/* carro sem colisor (a colisão já foi registrada na geração) */
function carroGeo(C,x,z,yaw,paint,R,trunkOpen,y,base0,b){const base=base0||mat(x,y||0,z,0,yaw,0),rust=lin(0x7a4a2a),trim=lin(0x55595c),o={b:b||0};
  add(C,bvTris(1.8,0.56,4.2,{tx:0.98,tz:0.98}),mm(base,mat(0,0.64,0)),lin(paint),{b:o.b,j:0.05,rnd:R});
  add(C,bvTris(1.62,0.58,2.05,{tx:0.8,tz:0.72}),mm(base,mat(0,1.2,-0.3)),lin(0x1c2830),o);add(C,bvTris(1.32,0.07,1.5),mm(base,mat(0,1.52,-0.3)),lin(paint),o);
  add(C,bvTris(0.5,0.02,0.6),mm(base,mat(0.3,0.93,1.3,0,0.3,0)),rust,o);add(C,bvTris(1.84,0.16,0.14),mm(base,mat(0,0.42,2.12)),trim,o);add(C,bvTris(1.84,0.16,0.14),mm(base,mat(0,0.42,-2.12)),trim,o);
  for(const wx of[0.86,-0.86])for(const wz of[1.35,-1.35])add(C,cylTris(0.37,0.37,0.26,10),mm(base,mat(wx+0.13,0.37,wz,0,0,Math.PI/2)),lin(0x181818),o);
  if(trunkOpen){add(C,bvTris(1.6,0.06,0.82),mm(base,mm(mat(0,0.94,-1.32,1.1,0,0),mat(0,0,-0.41))),lin(paint),o);add(C,bvTris(1.5,0.02,0.7),mm(base,mat(0,0.93,-1.72)),lin(0x141414),o);}
  else add(C,bvTris(1.6,0.06,0.8),mm(base,mat(0,0.95,-1.72)),lin(paint),o);}
/* porta: folha que gira na dobradiça (em coordenadas locais da porta: x ao longo do vão, z para o lado B) */
function geoPortas(){const P={},R=rng(61),mk=f=>{const g=new GB(512,8);f(g);return g.data();};
  const folha=(g,w,c,vidro)=>{add(g,bvTris(w,2.08,0.05),mat(w/2,1.04,0),lin(c),{j:0.04,rnd:R});if(vidro)add(g,bvTris(w-0.2,1.2,0.06),mat(w/2,1.3,0),lin(0x1a2228));add(g,bvTris(0.03,0.12,0.08),mat(w-0.1,1.0,0),lin(0x9aa1a6));};
  P.madeira=mk(g=>folha(g,0.98,0x6b4e30));P.vidro=mk(g=>folha(g,0.78,0x55595c,true));P.metal=mk(g=>folha(g,0.98,0x6f777e));P.corta=mk(g=>folha(g,1.18,0x8a2a22));
  P.eletronica=mk(g=>{folha(g,0.98,0x8d969f);add(g,bvTris(0.08,0.12,0.08),mat(1.05,1.3,0.06),lin(0x2b2b2b));});
  P.grade=mk(g=>{for(let i=0;i<9;i++)add(g,bvTris(0.03,2.08,0.03),mat(0.06+i*0.108,1.04,0),lin(0x3a3d40));for(const y of[0.15,1.0,1.95])add(g,bvTris(0.98,0.05,0.04),mat(0.49,y,0),lin(0x3a3d40));add(g,bvTris(0.1,0.16,0.08),mat(0.88,1.05,0),lin(0x2b2b2b));});
  P.elevador=mk(g=>{add(g,bvTris(0.5,2.1,0.05),mat(0,1.05,0),lin(0x9aa1a6),{j:0.03,rnd:R});add(g,bvTris(0.02,2.1,0.056),mat(0.24,1.05,0),lin(0x55595c));for(const y of[0.9,1.6])add(g,bvTris(0.5,0.015,0.056),mat(0,y,0),lin(0x7a8086));});
  P.alcapao=mk(g=>{add(g,bvTris(0.72,0.05,0.7),mat(0,0.025,0),lin(0x6f777e),{b:0.9,j:0.04,rnd:R});add(g,bvTris(0.08,0.04,0.3),mat(0.22,0.07,0),lin(0x3a3d40),{b:0.9});});
  P.alcapaoMad=mk(g=>{for(let i=0;i<4;i++)add(g,bvTris(0.17,0.05,0.7),mat(-0.27+i*0.18,0.025,0),mixc(lin(0x6e5235),lin(0x7d6142),R()),{j:0.08,rnd:R});add(g,bvTris(0.66,0.04,0.08),mat(0,0.06,0.2),lin(0x4a3424));add(g,bvTris(0.12,0.03,0.05),mat(0,0.08,-0.25),lin(0x3a3d40));});
  P.cavidade=mk(g=>{add(g,bvTris(0.66,0.62,0.02),mat(0,0.31,0),lin(0x0d0b0a),{b:0.9});add(g,bvTris(0.7,0.04,0.03),mat(0,0.64,0.01),lin(0x5d4a38),{b:0.6});add(g,bvTris(0.5,0.3,0.02),mat(0.75,0.15,0.08,0,0,1.3),lin(0x5d4a38),{b:0.6});});
  P.brasa=mk(g=>{const RR=rng(5);for(let i=0;i<9;i++){const a=i*0.7,r=0.15+(i%3)*0.2;add(g,icoTris(0.08+RR()*0.08,0.4,RR),mat(Math.cos(a)*r,0.12+RR()*0.1,Math.sin(a)*r),lin(0xff5a1a),{e:1.6+RR()});}});
  P.luzVerm=mk(g=>add(g,bvTris(0.05,0.05,0.04),mat(0,0,0),lin(0xff2a1a),{e:2.5}));P.luzVerde=mk(g=>add(g,bvTris(0.05,0.05,0.04),mat(0,0,0),lin(0x3aff5a),{e:2.5}));
  P.trancaPorta=mk(g=>{for(const y of[0.6,1.2,1.8])add(g,bvTris(1.15,0.18,0.05),mat(0,y,0,0,0,(R()-0.5)*0.25),mixc(lin(0x6e5235),lin(0x7d6142),R()),{j:0.08,rnd:R});});
  return P;}
/* chão da cidade: asfalto com manchas, faixas, quarteirões elevados com meio-fio, calçada e lote, buracos do metrô */
function geoCidadeChao(){const g=new GB(1<<15,8),R=rng(8080),asf=lin(0x3a3a38),asf2=lin(0x2f2f2d),Y=0.03;
  const S=8;for(let x=CIDADE.x0;x<CIDADE.x1;x+=S)for(let z=CIDADE.z0;z<CIDADE.z1;z+=S){const w=Math.min(S,CIDADE.x1-x),d=Math.min(S,CIDADE.z1-z),n=vnoise(x*0.07+3,z*0.07-5);
    add(g,boxTris(w,0.06,d),mat(x+w/2,Y-0.03,z+d/2),mixc(asf,asf2,n),{j:0.03,rnd:R});}
  const faixa=(x0,x1,z0,z1,c)=>add(g,boxTris(x1-x0,0.012,z1-z0),mat((x0+x1)/2,Y+0.006,(z0+z1)/2),lin(c));
  for(const r of RUAS_EW){for(let x=CIDADE.x0+1;x<CIDADE.x1;x+=6){if(RUAS_NS.some(n=>Math.abs(x+1.5-n.x)<n.a+1))continue;faixa(x,x+3,r.z-0.07,r.z+0.07,0xb09a3a);}
    if(r.a>5)for(const zz of[r.z-r.a+0.4,r.z+r.a-0.4])faixa(CIDADE.x0,CIDADE.x1,zz-0.06,zz+0.06,0x9a988f);}
  for(const r of RUAS_NS)for(let z=CIDADE.z0+1;z<CIDADE.z1;z+=6){if(RUAS_EW.some(e=>Math.abs(z+1.5-e.z)<e.a+1))continue;faixa(r.x-0.07,r.x+0.07,z,z+3,0xb09a3a);}
  // faixas de pedestre nos cruzamentos
  for(const e of RUAS_EW)for(const n of RUAS_NS){for(let i=0;i<7;i++){const zz=e.z-e.a+0.6+i*(2*e.a-1.2)/6;faixa(n.x-n.a-1.6,n.x-n.a-0.4,zz-0.25,zz+0.25,0xc9c6b5);faixa(n.x+n.a+0.4,n.x+n.a+1.6,zz-0.25,zz+0.25,0xc9c6b5);}}
  // quarteirões: laje de 15 cm em retângulos (furados nas bocas do metrô), meio-fio e lote
  const corte=(r,b)=>{if(b.x1<=r[0]||b.x0>=r[1]||b.z1<=r[2]||b.z0>=r[3])return[r];const o=[];if(b.x0>r[0])o.push([r[0],b.x0,r[2],r[3]]);if(b.x1<r[1])o.push([b.x1,r[1],r[2],r[3]]);
    const x0=Math.max(r[0],b.x0),x1=Math.min(r[1],b.x1);if(b.z0>r[2])o.push([x0,x1,r[2],b.z0]);if(b.z1<r[3])o.push([x0,x1,b.z1,r[3]]);return o;};
  for(const q of CID.quadras){let rs=[[q.x0,q.x1,q.z0,q.z1]];for(const b of BURACOS)rs=rs.flatMap(r=>corte(r,b));
    for(const r of rs)add(g,boxTris(r[1]-r[0],QUADRA_Y,r[3]-r[2]),mat((r[0]+r[1])/2,QUADRA_Y/2,(r[2]+r[3])/2),lin(0x8a877e),{j:0.03,rnd:R});
    const L=q.lote,lt=q.tipoLote||'predio',cor=lt==='estacionamento'?0x3d3d3b:lt==='praca'?0x46632d:lt==='terreno'?0x5c4a33:lt==='quintal'?0x56663a:lt==='patio'?0x5d5d58:0x77746b;
    let ls=[[L.x0,L.x1,L.z0,L.z1]];for(const b of BURACOS)ls=ls.flatMap(r=>corte(r,b));for(const r of ls)add(g,boxTris(r[1]-r[0],0.012,r[3]-r[2]),mat((r[0]+r[1])/2,QUADRA_Y+0.006,(r[2]+r[3])/2),lin(cor),{j:0.05,rnd:R});
    for(const[x0,x1,z0,z1]of[[q.x0,q.x1,q.z0,q.z0+0.2],[q.x0,q.x1,q.z1-0.2,q.z1],[q.x0,q.x0+0.2,q.z0,q.z1],[q.x1-0.2,q.x1,q.z0,q.z1]])add(g,boxTris(x1-x0,0.02,z1-z0),mat((x0+x1)/2,QUADRA_Y+0.01,(z0+z1)/2),lin(0xa9a69c));
    if(lt==='estacionamento')for(let x=L.x0+2;x<L.x1-2;x+=2.8)for(const zz of[L.z0+3,L.z1-3])add(g,boxTris(0.1,0.014,4.6),mat(x,QUADRA_Y+0.008,zz),lin(0xc9c6b5));}
  return g.data();}
/* objetos de rua: carros, ônibus, barreiras, entulho, postes, bancos e lixeiras */
function geoCidadeProps(){const g=new GB(1<<15,8),R=rng(9191);
  for(const o of CID.props){const y=quadraEm(o.x,o.z)?QUADRA_Y:0;
    if(o.k==='carro')carroGeo(g,o.x,o.z,o.yaw,o.cor,R,o.aberto,y);
    else if(o.k==='onibus'){const b=mat(o.x,y,o.z,0,o.yaw,0);add(g,bvTris(2.6,2.6,11.6),mm(b,mat(0,1.55,0)),lin(0xc9a227),{j:0.04,rnd:R});add(g,bvTris(2.65,0.9,10.6),mm(b,mat(0,2.1,0.2)),lin(0x1c2830));
      add(g,bvTris(2.62,0.25,11.62),mm(b,mat(0,0.4,0)),lin(0x55595c));for(const wz of[3.6,-3.8])for(const wx of[1.2,-1.2])add(g,cylTris(0.5,0.5,0.3,10),mm(b,mat(wx+0.15*Math.sign(wx),0.5,wz,0,0,Math.PI/2)),lin(0x181818));}
    else if(o.k==='barreira'){const b=mat(o.x,y,o.z,0,o.yaw,0);for(let i=0;i<4;i++)add(g,bvTris(0.42,0.25,0.12),mm(b,mat(-0.63+i*0.42,0.85,0)),lin(i%2?0xd9d6cc:0xa8261d));for(const s of[-0.75,0.75])add(g,bvTris(0.08,0.9,0.5),mm(b,mat(s,0.45,0)),lin(0x55595c));}
    else if(o.k==='entulho'){const RR=rng(Math.floor(o.seed*1e6));for(let i=0;i<9;i++){const a=RR()*6.283,r=RR()*o.r;add(g,icoTris(0.3+RR()*0.5,0.4,RR),mat(o.x+Math.cos(a)*r,y+0.2+RR()*0.4,o.z+Math.sin(a)*r,RR(),RR()*6,RR(),1.2,0.7,1),mixc(lin(0x77746b),lin(0x8a877e),RR()),{j:0.1,rnd:RR});}
      for(let i=0;i<4;i++){const a=RR()*6.283;add(g,cylTris(0.015,0.015,1.4,4),alignY(o.x+Math.cos(a)*o.r*0.5,y+0.3,o.z+Math.sin(a)*o.r*0.5,Math.cos(a+1),0.6,Math.sin(a+1)),lin(0x5a3a2a));}}
    else if(o.k==='poste'){add(g,cylTris(0.06,0.09,6,6),mat(o.x,y,o.z),lin(0x3a3d40));const d=fwd(o.yaw,1.2);add(g,bvTris(0.12,0.08,1.4),mat(o.x+d[0]/2,y+6,o.z+d[1]/2,0,o.yaw,0),lin(0x3a3d40));add(g,bvTris(0.35,0.1,0.5),mat(o.x+d[0],y+5.94,o.z+d[1],0,o.yaw,0),lin(0x2b2b2b));}
    else if(o.k==='banco'){const b=mat(o.x,y,o.z,0,o.yaw,0);add(g,bvTris(1.6,0.06,0.45),mm(b,mat(0,0.45,0)),lin(0x6b4e30));add(g,bvTris(1.6,0.4,0.06),mm(b,mat(0,0.7,-0.22)),lin(0x6b4e30));for(const s of[-0.7,0.7])add(g,bvTris(0.06,0.45,0.4),mm(b,mat(s,0.22,0)),lin(0x3a3d40));}
    else if(o.k==='lixeira'){add(g,cylTris(0.28,0.25,0.9,8),mat(o.x,y,o.z),lin(0x3d5a3a),{j:0.06,rnd:R});}
    else if(o.k==='viatura'||o.k==='ambulancia'){const amb=o.k==='ambulancia',b=mat(o.x,y,o.z,0,o.yaw,0);
      if(amb){add(g,bvTris(2.1,2.2,5.4),mm(b,mat(0,1.3,-0.3)),lin(0xe8e6e0),{j:0.03,rnd:R});add(g,bvTris(2.12,0.25,5.42),mm(b,mat(0,1.2,-0.3)),lin(0xc8261d));add(g,bvTris(1.9,0.7,0.1),mm(b,mat(0,1.8,2.42)),lin(0x1c2830));
        for(const wz of[1.8,-1.9])for(const wx of[1.0,-1.0])add(g,cylTris(0.4,0.4,0.28,10),mm(b,mat(wx+0.14*Math.sign(wx),0.4,wz,0,0,Math.PI/2)),lin(0x181818));add(g,bvTris(0.9,0.14,0.25),mm(b,mat(0,2.45,1.6)),lin(0xc8261d),{e:0.6});}
      else{carroGeo(g,o.x,o.z,o.yaw,0x1c2430,R,false,y);add(g,bvTris(1.84,0.28,1.4),mm(b,mat(0,0.72,0.2)),lin(0xe8e6e0));add(g,bvTris(0.9,0.12,0.25),mm(b,mat(0,1.6,-0.3)),lin(0x1f3a8a),{e:0.4});add(g,bvTris(0.4,0.13,0.26),mm(b,mat(0.25,1.6,-0.3)),lin(0xc8261d),{e:0.4});}}
    else if(o.k==='caminhao'){const b=mat(o.x,y,o.z,0,o.yaw,0);add(g,bvTris(2.4,2.3,2.2),mm(b,mat(0,1.55,3.0)),lin(o.cor),{j:0.04,rnd:R});add(g,bvTris(2.3,0.8,0.1),mm(b,mat(0,2.1,4.12)),lin(0x1c2830));
      add(g,bvTris(2.5,2.9,5.6),mm(b,mat(0,1.95,-1.2)),lin(0xb8b4aa),{j:0.05,rnd:R});add(g,bvTris(2.3,0.3,8.0),mm(b,mat(0,0.45,0)),lin(0x2b2b2b));
      for(const wz of[3.0,-0.6,-2.8])for(const wx of[1.15,-1.15])add(g,cylTris(0.5,0.5,0.35,10),mm(b,mat(wx+0.17*Math.sign(wx),0.5,wz,0,0,Math.PI/2)),lin(0x181818));}
    else if(o.k==='conteiner'){const b=mat(o.x,y+o.nivel*2.6,o.z,0,o.yaw,0);add(g,bvTris(2.5,2.6,6.1),mm(b,mat(0,1.3,0)),lin(o.cor),{j:0.05,rnd:R});
      for(let i=-5;i<=5;i++)for(const s2 of[-1.27,1.27])add(g,bvTris(0.04,2.4,0.08),mm(b,mat(s2,1.3,i*0.55)),mixc(lin(o.cor),lin(0x2b2b2b),0.25));add(g,bvTris(2.3,2.3,0.06),mm(b,mat(0,1.3,3.06)),mixc(lin(o.cor),lin(0x2b2b2b),0.2));}
    else if(o.k==='caixaDagua'){for(const[dx,dz]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])add(g,bvTris(0.22,13,0.22),mat(o.x+dx,y+6.5,o.z+dz),lin(0x55595c));
      for(const h of[4,8.5])for(const[a,b2,c,d]of[[-1.6,0,0,1],[1.6,0,0,1],[0,-1.6,1,0],[0,1.6,1,0]])add(g,bvTris(c?3.2:0.08,0.08,d?3.2:0.08),mat(o.x+a,y+h,o.z+b2),lin(0x6f777e));
      add(g,cylTris(2.6,2.6,4.2,14),mat(o.x,y+13,o.z),lin(0x9aa1a6),{j:0.04,rnd:R});add(g,cylTris(0.1,2.7,1.4,14),mat(o.x,y+17.2,o.z),lin(0x6f777e));add(g,bvTris(0.12,0.12,0.12),mat(o.x,y+18.7,o.z),lin(0xff3020),{e:2.5});}
    else if(o.k==='semaforo'){add(g,cylTris(0.07,0.09,4.6,6),mat(o.x,y,o.z),lin(0x2b2b2b));const d=fwd(o.yaw,1.8);add(g,bvTris(0.1,0.1,1.8),mat(o.x+d[0]/2,y+4.5,o.z+d[1]/2,0,o.yaw,0),lin(0x2b2b2b));
      add(g,bvTris(0.32,0.95,0.3),mat(o.x+d[0],y+4.0,o.z+d[1],0,o.yaw,0),lin(0x3a3a2a));for(let i=0;i<3;i++)add(g,bvTris(0.2,0.2,0.04),mat(o.x+d[0]+Math.sin(o.yaw)*0.16,y+4.3-i*0.29,o.z+d[1]+Math.cos(o.yaw)*0.16,0,o.yaw,0),lin([0x4a1a1a,0x4a3a1a,0x1a3a1a][i]));}
    else if(o.k==='outdoor'){const b=mat(o.x,y,o.z,0,o.yaw,0);for(const s2 of[-2.5,2.5])add(g,bvTris(0.16,4.2,0.16),mm(b,mat(s2,2.1,0)),lin(0x3a3d40));
      add(g,bvTris(6.4,3.0,0.12),mm(b,mat(0,4.6,0)),lin(0x2a2c2e));add(g,bvTris(6.1,2.7,0.05),mm(b,mat(0,4.6,0.07)),lin(0xc9a227),{j:0.12,rnd:R});add(g,bvTris(3.4,0.9,0.03),mm(b,mat(-1.0,4.9,0.11)),lin(0x9a2a22));add(g,bvTris(1.8,1.6,0.03),mm(b,mat(1.7,4.4,0.11)),lin(0xe8e6e0));}
    else if(o.k==='arvore'){const RR=rng(Math.floor(o.seed*1e6)),s2=o.s;add(g,cylTris(0.13*s2,0.2*s2,2.6*s2,7),mat(o.x,y,o.z),lin(0x5a3a2a));
      for(let i=0;i<5;i++)add(g,icoTris((1.0+RR()*0.6)*s2,0.5,RR),mat(o.x+(RR()-0.5)*1.4*s2,y+(2.8+RR()*1.2)*s2,o.z+(RR()-0.5)*1.4*s2,RR(),RR()*6,RR()),mixc(lin(0x3a5a2a),lin(0x5a7a3a),RR()),{j:0.12,rnd:RR});}
    else if(o.k==='chafariz'){add(g,cylTris(2.2,2.3,0.6,16),mat(o.x,y,o.z),lin(0x9a968c),{j:0.04,rnd:R});add(g,cylTris(1.9,1.9,0.1,16),mat(o.x,y+0.52,o.z),lin(0x5a5040));
      add(g,cylTris(0.25,0.35,1.6,8),mat(o.x,y+0.6,o.z),lin(0x9a968c));add(g,cylTris(0.9,0.2,0.3,12),mat(o.x,y+2.2,o.z),lin(0x9a968c));}
    else if(o.k==='cobertura'){const cx=(o.x0+o.x1)/2,cz=(o.z0+o.z1)/2;add(g,bvTris(o.x1-o.x0,0.45,o.z1-o.z0),mat(cx,y+o.h+0.22,cz),lin(0xe8e6e0));add(g,bvTris(o.x1-o.x0+0.05,0.3,o.z1-o.z0+0.05),mat(cx,y+o.h+0.3,cz),lin(o.cor));
      for(const[x,z]of[[o.x0+0.6,o.z0+0.6],[o.x1-0.6,o.z0+0.6],[o.x0+0.6,o.z1-0.6],[o.x1-0.6,o.z1-0.6]])add(g,bvTris(0.36,o.h,0.36),mat(x,y+o.h/2,z),lin(0xd9d6cc));}
    else if(o.k==='ilha'){add(g,bvTris(1.1,0.2,3.4),mat(o.x,y+0.1,o.z),lin(0x9a968c));for(const dz of[-0.9,0.9]){add(g,bvTris(0.6,1.5,0.5),mat(o.x,y+0.95,o.z+dz),lin(0xd94a1a),{j:0.05,rnd:R});
        add(g,bvTris(0.62,0.35,0.3),mat(o.x,y+1.45,o.z+dz),lin(0xe8e6e0));add(g,bvTris(0.05,0.05,0.5),mat(o.x+0.33,y+1.0,o.z+dz),lin(0x2b2b2b));}}
    else if(o.k==='cerco'){   // tapume de chapa ondulada (gomos alternados), postes e trilhos do lado de dentro, arame farpado em cima
      const RR=rng(Math.floor(o.seed*1e6)),yc=o.campo?Math.min(ground(o.x-Math.cos(o.yaw)*o.w/2,o.z+Math.sin(o.yaw)*o.w/2),ground(o.x+Math.cos(o.yaw)*o.w/2,o.z-Math.sin(o.yaw)*o.w/2))-0.05:y,b=mat(o.x,yc,o.z,o.inc,o.yaw,0),w=o.w,h=o.h+(o.campo?0.25:0),N=8,rw=w/N;
      const base=[lin(0x8b9090),lin(0x7d5b40),lin(0x66705f),lin(0x84402e),lin(0x9a9a92)][Math.floor(o.cor*5)],fer=lin(0x3b3a37),ferr=lin(0x6a4630);
      for(let k=0;k<N;k++){const c=mixc(base,ferr,Math.min(0.75,RR()*0.45+(k%3===0?0.12:0)));add(g,boxTris(rw+0.012,h+0.12,0.028),mm(b,mat(-w/2+(k+0.5)*rw,(h+0.12)/2-0.1,k%2?0.022:-0.022)),scl(c,k%2?0.86:1.04),{j:0.1,rnd:RR});}
      add(g,boxTris(0.09,h+0.42,0.09),mm(b,mat(-w/2,(h+0.42)/2-0.1,0.08)),fer);
      for(const yy of[0.42,h-0.3])add(g,boxTris(w,0.06,0.045),mm(b,mat(0,yy,0.06)),fer);
      for(const yy of[h+0.14,h+0.27])add(g,boxTris(w,0.014,0.014),mm(b,mat(0,yy,0.0)),lin(0x55524c));
      if(o.marca)for(const s2 of[-1,1])add(g,boxTris(1.7,0.14,0.012),mm(b,mat(0,h*0.55,0.04,0,0,s2*0.72)),lin(0x9a2a22),{j:0.08,rnd:RR});}
    else if(o.k==='jersey'){const b=mat(o.x,y,o.z,0,o.yaw,0),c=mixc(lin(0x9d998f),lin(0x7d786d),o.cor);
      add(g,boxTris(2.0,0.82,0.62,{tz:0.34}),mm(b,mat(0,0.41,0)),c,{j:0.08,rnd:R});add(g,boxTris(2.0,0.1,0.64),mm(b,mat(0,0.05,0)),scl(c,0.8));
      for(const s2 of[-0.55,0.55])add(g,boxTris(0.32,0.16,0.2),mm(b,mat(s2,0.68,0)),o.cor>0.5?lin(0xc9a227):lin(0xa8261d));}
    else if(o.k==='placaPosto'){add(g,bvTris(0.25,6,0.25),mat(o.x,y+3,o.z),lin(0x3a3d40));add(g,bvTris(1.6,1.4,0.3),mat(o.x,y+5.6,o.z),lin(0xd94a1a));add(g,bvTris(1.4,0.5,0.32),mat(o.x,y+5.3,o.z),lin(0xf2e6c8));}}
  // escadas de mão (emergência e serviço) nas fachadas
  for(const e of CID.escadasExt){const v=e.via,h=v.y1-v.y0,yaw=v.yaw;const c=Math.cos(yaw),s=Math.sin(yaw);
    for(const k of[-0.3,0.3])add(g,bvTris(0.05,h+1.0,0.05),mat(v.x+c*k,v.y0+(h+1.0)/2,v.z-s*k,0,yaw,0),lin(0x3a3d40));
    for(let y=v.y0+0.3;y<v.y1+0.9;y+=0.32)add(g,bvTris(0.62,0.035,0.035),mat(v.x,y,v.z,0,yaw,0),lin(0x55595c));}
  return g.data();}
function geoMetro(){const g=new GB(1<<15,8),R=rng(3131);for(const q of CID.metro.pecas){const[x0,x1,y0,y1,z0,z1,cor,b,e]=q;add(g,boxTris(x1-x0,y1-y0,z1-z0),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),lin(cor),{b,e:e||0,j:0.04,rnd:R});}
  for(const a of CID.metro.agua)add(g,boxTris(a.x1-a.x0,0.04,a.z1-a.z0),mat((a.x0+a.x1)/2,a.y,(a.z0+a.z1)/2),lin(0x1c2a2a),{b:0.95,e:0.05});
  return g.data();}
/* malhas: cada prédio tem a de perto (com interior) e a de longe (casca) */
/* passarela: tábuas atravessadas e dois caibros; a quebrada tem buraco no meio */
function geoPassarela(pa,quebrada){const g=new GB(1024,8),R=rng(70+pa.id),L=pa.ao?pa.x1-pa.x0:pa.z1-pa.z0,lw=pa.ao?pa.z1-pa.z0:pa.x1-pa.x0;
  for(let t=0;t<L;t+=0.32){if(quebrada&&t>L*0.3&&t<L*0.75)continue;const cx=pa.ao?pa.x0+t+0.15:pa.x,cz=pa.ao?pa.z:pa.z0+t+0.15;add(g,bvTris(pa.ao?0.3:lw,0.06,pa.ao?lw:0.3),mat(cx,pa.y-0.03,cz,0,0,(R()-0.5)*0.05),mixc(lin(0x6e5235),lin(0x7d6142),R()),{j:0.08,rnd:R});}
  for(const s of[-0.45,0.45]){if(quebrada){const Lq=L*0.32,Lb=L*0.27;add(g,bvTris(pa.ao?Lq:0.12,0.1,pa.ao?0.12:Lq),mat(pa.ao?pa.x0+Lq/2:pa.x+s,pa.y-0.12,pa.ao?pa.z+s:pa.z0+Lq/2),lin(0x4a3424));
      add(g,bvTris(pa.ao?Lb:0.12,0.1,pa.ao?0.12:Lb),mat(pa.ao?pa.x1-Lb/2:pa.x+s,pa.y-0.12,pa.ao?pa.z+s:pa.z1-Lb/2),lin(0x4a3424));continue;}
    add(g,bvTris(pa.ao?L:0.12,0.1,pa.ao?0.12:L),mat(pa.ao?pa.x:pa.x+s,pa.y-0.12,pa.ao?pa.z+s:pa.z),lin(0x4a3424));}
  return g.data();}
/* entulho tomando o lance da escada (coordenadas locais do prédio) */
function geoEntulho(e){const g=new GB(1<<13,8),R=rng(900+e.id*7),p=e.p,ya=e.y,v0=p.vS+1.2,sub=1.6/3.15,pedra=[lin(0x77746b),lin(0x9a968c),lin(0x8a877e)];
  for(let i=0;i<34;i++){const t=R(),v=e.v0+(e.v1-e.v0)*t,u=e.u0+0.08+R()*(e.u1-e.u0-0.16),base=ya+Math.max(0,v-v0)*sub,h=0.25+R()*(1.25-Math.abs(t-0.4)*1.1);
    add(g,icoTris(0.2+R()*0.32,0.45,R),mat(u,base+h*R(),v,R(),R()*6,R(),1.25,0.75,1),mixc(pedra[i%3],pedra[(i+1)%3],R()),{b:0.8,j:0.1,rnd:R});}
  for(let i=0;i<3;i++){const v=e.v0+0.35+i*0.62;add(g,bvTris(e.u1-e.u0+0.35,0.16,0.55),mat((e.u0+e.u1)/2,ya+0.55+i*0.42+Math.max(0,v-v0)*sub*0.5,v,0.35*(R()-0.5),0.5*(R()-0.5),0.4),lin(0x8a877e),{b:0.8,j:0.08,rnd:R});}
  for(let i=0;i<5;i++)add(g,cylTris(0.012,0.012,1.4+R()*0.6,4),alignY(e.u0+R()*(e.u1-e.u0),ya+0.5+R()*0.9,e.v0+R()*(e.v1-e.v0),R()-0.5,0.6,R()-0.5),lin(0x5a3a2a),{b:0.8});
  add(g,bvTris(e.u1-e.u0+0.1,0.02,0.6),mat((e.u0+e.u1)/2,ya+0.01,e.v0-0.25),lin(0x6d6a62),{b:0.8,j:0.1,rnd:R});
  return g.data();}
function initCidadeMeshes(){for(const e of CID.entulhos)e.mesh=litMesh(geoEntulho(e));for(const pa of CID.passarelas){pa.mInteira=litMesh(geoPassarela(pa,false));pa.mQuebrada=litMesh(geoPassarela(pa,true));}for(const p of CID.predios){p.mPerto=litMesh(geoPredio(p,false));p.mLonge=litMesh(geoPredio(p,true));}
  MESH.cidChao=litMesh(geoCidadeChao());MESH.cidProps=litMesh(geoCidadeProps());MESH.metro=litMesh(geoMetro());const Pg=geoPortas();MESH.porta={};for(const k in Pg)MESH.porta[k]=litMesh(Pg[k]);}
function desenharCidade(Pg,sombra,alc){if(!CID.predios.length)return;const cx=cam.pos[0],cz=cam.pos[2],dc=distCidade(cx,cz);alc=alc||55;desenharRurais(Pg,sombra,alc);
  // de longe só a silhueta dos prédios altos (a cidade é reconhecível da estrada e da mata)
  if(dc>160){if((sombra&&dc>alc+60)||dc>460)return;if(sombra){for(const p of CID.predios){if(p.andares<3||p.rural)continue;trs(TMP,p.ox,0,p.oz,0,p.yaw,0,1,1,1);drawStat(Pg,p.mLonge,TMP);}return;}for(const p of CID.predios){if(p.andares<4||p.rural)continue;trs(TMP,p.ox,0,p.oz,0,p.yaw,0,1,1,1);drawStat(Pg,p.mLonge,TMP);}return;}
  for(const p of CID.predios){if(p.rural)continue;const px=clamp(cx,p.x0,p.x1),pz=clamp(cz,p.z0,p.z1),d=Math.hypot(cx-px,cz-pz);if(sombra&&d>alc)continue;
    trs(TMP,p.ox,0,p.oz,0,p.yaw,0,1,1,1);drawStat(Pg,sombra||d>GF().cidLod?p.mLonge:p.mPerto,TMP);}
  if(sombra){drawStat(Pg,MESH.cidProps,ID);return;}
  drawStat(Pg,MESH.cidChao,ID);drawStat(Pg,MESH.cidProps,ID);for(const pa of CID.passarelas)drawStat(Pg,pa.quebrada?pa.mQuebrada:pa.mInteira,ID);
  if(cam.pos[1]<-0.5||CID.metro.bocas.some(b=>Math.hypot(cx-b.x0,cz-b.z1)<45))drawStat(Pg,MESH.metro,ID);
  // entulho na escada, alçapões das cabines, esconderijos abertos e brasa da fumaça (perto da câmera)
  for(const e of CID.entulhos){if(!e.ativo||!e.mesh||d2(e.x,e.z,cx,cz)>40*40)continue;const p=e.p;trs(TMP,p.ox,0,p.oz,0,p.yaw,0,1,1,1);drawStat(Pg,e.mesh,TMP);}
  for(const a of CID.alcapoes){if(d2(a.x,a.z,cx,cz)>30*30||Math.abs(a.y-cam.pos[1])>9)continue;const p=a.p,u=a.aberto?a.u-a.lu-0.05:a.u;const w=pw(p,u,a.v);trs(TMP,w[0],a.y+(a.aberto?0.005:-0.04),w[1],0,p.yaw,0,1,1,1);drawStat(Pg,MESH.porta.alcapao,TMP);}
  for(const a of CID.poroes){if(a.p.rural||d2(a.x,a.z,cx,cz)>28*28||Math.abs(a.y-cam.pos[1])>6)continue;const p=a.p,w=pw(p,a.u,a.aberto?a.v-0.95:a.v);trs(TMP,w[0],a.y+(a.aberto?0.01:-0.035),w[1],0,p.yaw,0,1.25,1,1.25);drawStatI(Pg,MESH.porta.alcapaoMad,TMP,0.62);}
  for(const c of CID.conts){if(!c.oculto||!c.revelado||d2(c.x,c.z,cx,cz)>25*25)continue;trs(TMP,c.x,c.y-0.05,c.z,0,c.yaw,0,1,1,1);drawStat(Pg,MESH.porta.cavidade,TMP);}
  for(const f of CID.fumacas){if(!f.ativo||d2(f.x,f.z,cx,cz)>40*40)continue;trs(TMP,f.x,f.y,f.z,0,G.t*0.05,0,1,1,1);drawStat(Pg,MESH.porta.brasa,TMP);}
  // portas perto da câmera, no mesmo andar ou vizinho
  for(const d of CID.portas){if((d.p&&d.p.rural)||d.estado==='quebrada'||Math.abs(d.y-cam.pos[1])>7||d2(d.x,d.z,cx,cz)>32*32)continue;desenharPorta(Pg,d);}}
function desenharPorta(Pg,d){const w=d.larg>1.3?d.larg/2:d.larg,ab=d.abre||0;
    const c=Math.cos(d.yaw),s=Math.sin(d.yaw),hx=d.x-c*d.larg/2,hz=d.z+s*d.larg/2,mesh=MESH.porta[d.tipo]||MESH.porta.madeira;
    if(d.intK===undefined)d.intK=d.sA==='fora'||d.sB==='fora'?0:Math.min(d.sA&&d.sA.escura!==undefined?d.sA.escura:0.62,d.sB&&d.sB.escura!==undefined?d.sB.escura:0.62);
    if(d.tipo==='elevador'){for(const sg of[-1,1]){const off=sg*(0.25+ab*0.43);trs(TMP,d.x+c*off,d.y,d.z-s*off,0,d.yaw,0,1,1,1);drawStatI(Pg,mesh,TMP,d.intK);}return;}
    trs(TMP,hx,d.y,hz,0,d.yaw+ab*1.45,0,w/0.98,1,1);drawStatI(Pg,mesh,TMP,d.intK);
    if(d.larg>1.3){const hx2=d.x+c*d.larg/2,hz2=d.z-s*d.larg/2;trs(TMP,hx2,d.y,hz2,0,d.yaw+Math.PI-ab*1.45,0,w/0.98,1,1);drawStatI(Pg,mesh,TMP,d.intK);}
    if(d.tipo==='eletronica'){trs(TMP,d.x+c*(d.larg/2+0.12),d.y+1.4,d.z-s*(d.larg/2+0.12),0,d.yaw,0,1,1,1);drawStat(Pg,G.cid&&G.cid.energia>0?MESH.porta.luzVerde:MESH.porta.luzVerm,TMP);}}

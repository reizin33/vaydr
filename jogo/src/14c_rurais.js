/* ================= vila e sítios: casas de verdade, quintais com vida e estradas de terra =================
   As casas da vila e dos sítios usam o mesmo sistema das casas da cidade: salas, portas que abrem, trancam e quebram,
   janelas, móveis, armários e gavetas para vasculhar e zumbis que acham o caminho pelas portas, só que em qualquer altura
   de chão (cada lote fica num patamar plano). A vila tem a rua principal, que vai do trilho até a Igreja de São José, e a
   rua transversal, com as casas viradas para a rua, mercadinho, farmácia e o Bar do Zé. Cada sítio tem a casa com varanda
   e rede, galpão aberto com bancada, poço, horta com espantalho, varal, caixa-d'água, galinheiro, lenha, árvores de fruta,
   cerca de arame com porteira e placa, e uma estrada de terra que liga ao resto do mapa. */
const RURAIS=[];
function ruralEm(x,z,m){m=m||0;for(const p of RURAIS)if(x>p.bx0-m&&x<p.bx1+m&&z>p.bz0-m&&z<p.bz1+m)return p;return null;}
/* dentro da construção em si (com a varanda), sem o quintal */
function ruralCasaEm(x,z,m){m=m||0;for(const p of RURAIS){if(x<p.bx0-m||x>p.bx1+m||z<p.bz0-m||z>p.bz1+m)continue;const l=plc(p,x,z);
  if(l[0]>-m&&l[0]<p.W+m&&l[1]>-m-(p.varanda||0)-(p.igreja?1.4:0)&&l[1]<p.D+m)return p;}return null;}
function emPredios(x,z,m){return dentroCidade(x,z,m)||!!ruralEm(x,z,m);}
/* cria um prédio fora da cidade: x,z é o centro, a frente dá para o lado pedido (S -z, N +z, E +x, W -x) */
function predioRural(sp){const ns=sp.frente==='S'||sp.frente==='N',hx=(ns?sp.W:sp.D)/2,hz=(ns?sp.D:sp.W)/2;
  const p=Object.assign({andares:1},sp,{x0:sp.x-hx,x1:sp.x+hx,z0:sp.z-hz,z1:sp.z+hz,rural:true});p.id=CID.predios.length;CID.predios.push(p);p.salas=[];p.pecas=[];
  const F={S:[0,p.x0,p.z0],W:[Math.PI/2,p.x0,p.z1],N:[Math.PI,p.x1,p.z1],E:[-Math.PI/2,p.x1,p.z0]}[p.frente];
  p.yaw=F[0];p.ox=F[1];p.oz=F[2];p.c=Math.cos(p.yaw);p.s=Math.sin(p.yaw);
  let yq=-1e9;for(const[x,z]of[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1],[sp.x,sp.z]])yq=Math.max(yq,ground(x,z));p.yq=yq;p.y0=yq+0.12;
  if(p.igreja){p.H=5.0;p.alt=1;predioIgreja(p);}else if(p.casa){p.H=2.9;predioCasa(p);}else{p.H=ANDAR_H;predioSalao(p);}
  p.yTopo=p.casa||p.igreja?p.y0+p.andares*p.H:p.y0+p.H*(p.alt||1.15);
  const q=p.quintal||[-1.2,p.W+1.2,p.igreja?-1.8:-1.4,p.D+1.4],cs=[pw(p,q[0],q[2]),pw(p,q[1],q[2]),pw(p,q[0],q[3]),pw(p,q[1],q[3])];
  p.bx0=Math.min(...cs.map(c=>c[0]));p.bx1=Math.max(...cs.map(c=>c[0]));p.bz0=Math.min(...cs.map(c=>c[1]));p.bz1=Math.max(...cs.map(c=>c[1]));
  RURAIS.push(p);
  if(p.varanda)varandaMontar(p);if(sp.antesMoveis)sp.antesMoveis(p);mobiliar(p);bagunca(p);cortinasELuzes(p);azulejos(p);
  // janelas quebradas do térreo: zumbi entra e sai por elas
  for(const j of CID.janelas){if(j.p!==p||!j.quebrada||j.f>0)continue;const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw),xi=j.x-nx*0.8,zi=j.z-nz*0.8,s=salaEm(xi,j.y+0.3,zi);if(!s)continue;
    const a=noNovo(xi,j.y,zi,s,{janela:j}),b=noNovo(j.x+nx*0.9,p.yq,j.z+nz*0.9,'fora',{janela:j});ligar(a,b,3.5);ligar(a,s.no);j.nos=[a,b];}
  return p;}
const salaDe=(p,tipo,f)=>(p.salas[f||0]||[]).find(s=>s.tipo===tipo);
/* ---------- igreja: nave com bancos e altar, sacristia com porta lateral, frontão com sino e cruz ---------- */
function predioIgreja(p){const YQ=p.yq,W=p.W,D=p.D,E=0.3,ya=p.y0,yb=ya+p.H,cF=0xece6d8,cI=0xddd6c6,cT=0x7a3a28,R=rng(9100+p.id),hr=2.6;p.uc=W/2;p.hr=hr;
  retL(p,0,W,0,D,ya);peca(p,0,W,YQ-0.6,ya,0,D,0x8a8070,0);peca(p,E,W-E,ya-0.02,ya,E,D-E,0x7a6450,0.7);
  const nave=salaNova(p,0,E,W-E,E,D-E,'igreja','nave da igreja');nave.escura=0.7;
  const of=portaNova(p,0,'u',E/2,W/2-0.9,W/2+0.9,'fora',nave,'madeira','fechada');
  const fora=noNovo(...pw(p,W/2,-2.2).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});ligar(fora,of.porta.nA,0.6);of.porta.nA.sala='fora';p.entradas=[fora];ligar(nave.no,of.porta.nB);
  const ol=portaNova(p,0,'v',W-E/2,D-2.5,D-1.6,nave,'fora','madeira','trancada');const fl=noNovo(...pw(p,W+1.4,D-2.05).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});
  ligar(fl,ol.porta.nB,0.5);ol.porta.nB.sala='fora';p.entradas.push(fl);
  const alta=o=>({a:o.a,b:o.b,y0:ya+1.7,y1:ya+3.7}),jl=janelasEm(E+1.0,D-E-1.4,ya,0.8).map(alta),jr=janelasEm(E+1.0,D-3.2,ya,0.8).map(alta);
  regJanelas(p,0,'v',E/2,-1,jl);regJanelas(p,0,'v',W-E/2,1,jr);
  paredeL(p,'u',E/2,0,W,E,ya,yb,[of],cI,0.7,-1,cF);paredeL(p,'u',D-E/2,0,W,E,ya,yb,[],cI,0.7,1,cF);
  paredeL(p,'v',E/2,E,D-E,E,ya,yb,jl,cI,0.7,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,ya,yb,[ol,...jr],cI,0.7,1,cF);
  peca(p,E,W-E,yb-0.08,yb,E,D-E,0x6b4e30,0.7);   // forro de madeira (o telhado de duas águas é desenhado no mundo)
  for(let k=0;k<10;k++){const hw=Math.max(0.04,(W/2+0.45)*(1-(k+1)/10)-0.1);for(const[v0,v1]of[[-0.02,E],[D-E,D+0.02]])peca(p,W/2-hw,W/2+hw,yb+k*hr/10,yb+(k+1)*hr/10,v0,v1,cF,0);}
  // frontão: campanário com o vão do sino, telhadinho e cruz; óculo e moldura da porta; pilastras; escadaria
  peca(p,W/2-0.85,W/2+0.85,yb+hr-0.3,yb+hr+1.75,-0.3,0.5,cF,0);peca(p,W/2-0.45,W/2+0.45,yb+hr+0.25,yb+hr+1.25,-0.32,-0.28,0x16130f,0);
  peca(p,W/2-1.0,W/2+1.0,yb+hr+1.75,yb+hr+1.9,-0.45,0.65,cT,0);peca(p,W/2-0.06,W/2+0.06,yb+hr+1.9,yb+hr+3.0,0.04,0.16,0x3a2a1a,0);peca(p,W/2-0.36,W/2+0.36,yb+hr+2.45,yb+hr+2.57,0.04,0.16,0x3a2a1a,0);
  peca(p,W/2-0.5,W/2+0.5,ya+3.3,ya+4.3,-0.06,-0.01,0x3a5a8a,0,0,0.25);peca(p,W/2-0.62,W/2+0.62,ya+3.18,ya+4.42,-0.04,-0.02,0xd8d0c0,0);
  peca(p,W/2-1.12,W/2-0.9,ya,ya+2.45,-0.08,0,0xd8d0c0,0);peca(p,W/2+0.9,W/2+1.12,ya,ya+2.45,-0.08,0,0xd8d0c0,0);peca(p,W/2-1.12,W/2+1.12,ya+2.25,ya+2.45,-0.08,0,0xd8d0c0,0);
  for(const u of[-0.1,W-0.25])peca(p,u,u+0.35,YQ-0.3,yb+0.1,-0.12,0.24,0xd8d0c0,0);
  for(let i=0;i<3;i++){const v0=-1.35+i*0.42;peca(p,W/2-1.7+i*0.12,W/2+1.7-i*0.12,YQ-0.2,YQ+(ya-YQ)*(i+1)/3,v0,0,0x9a968c,0);}retL(p,W/2-1.7,W/2+1.7,-1.35,0,ya);
  // dentro: bancos dos dois lados do corredor, altar, cruz na parede do fundo, velas e flores
  for(let r=0;r<5;r++){const v=2.4+r*1.35;for(const u of[W*0.26,W*0.74])moveis(p,nave,'banco',u,v,R,0);}
  moveis(p,nave,'altar',W/2,D-1.35,R,1);
  peca(p,W/2-0.07,W/2+0.07,ya+1.9,ya+3.6,D-E-0.05,D-E-0.01,0x4a3424,0.7);peca(p,W/2-0.5,W/2+0.5,ya+2.95,ya+3.09,D-E-0.05,D-E-0.01,0x4a3424,0.7);
  for(const u of[W/2-1.5,W/2+1.5]){peca(p,u-0.18,u+0.18,ya,ya+0.75,D-E-0.5,D-E-0.14,0x8a6e52,0.7);peca(p,u-0.12,u+0.12,ya+0.75,ya+1.05,D-E-0.44,D-E-0.2,0x3a6a3a,0.7);peca(p,u-0.05,u+0.05,ya+1.0,ya+1.1,D-E-0.36,D-E-0.28,0xd94a6a,0.7);}
  contExtra(p,nave,'armario','ap_gaveta',E+0.3,D-1.7,ya,Math.PI/2,'iga');contExtra(p,nave,'caixas','deposito',E+0.62,1.35,ya,Math.PI/2,'igc');
  p.sino=[...pw(p,W/2,0.1),yb+hr+0.55];}
/* telhado de duas águas da igreja (cumeeira da frente para o fundo) e o sino: desenho fixo do mundo */
function igrejaTelhado(C,p){const W=p.W,D=p.D,yb=p.y0+p.H,hr=p.hr,run=W/2+0.45,L=Math.hypot(run,hr),th=Math.atan2(hr,run),B=mat(p.ox,0,p.oz,0,p.yaw,0),cT=lin(0x7a3a28);
  for(const s of[-1,1])add(C,boxTris(L+0.1,0.14,D+0.7),mm(B,mm(mat(W/2+s*run/2,yb+hr/2,D/2),mat(0,0,0,0,0,-s*th))),cT,{j:0.04,rnd:rng(p.id)});
  add(C,boxTris(0.22,0.22,D+0.75),mm(B,mat(W/2,yb+hr+0.02,D/2)),scl(cT,0.7));
  add(C,cylTris(0.3,0.16,0.48,10),mat(p.sino[0],p.sino[2]-0.2,p.sino[1]),lin(0x8a6a2a));add(C,cylTris(0.03,0.03,0.25,4),mat(p.sino[0],p.sino[2]+0.28,p.sino[1]),lin(0x3a3a38));}
/* ---------- varanda: piso de tábua, três esteios, telhado de telha (rede e cadeiras vão no desenho do quintal) ---------- */
function varandaMontar(p){const W=p.W,dv=p.varanda,ya=p.y0,YQ=p.yq,y1=ya+2.42,mad=0x7a5a3a,telha=(p.cores||CID_COR.casa)[3];
  peca(p,0.12,W-0.12,YQ-0.35,ya,-dv,-0.03,mad,0);retL(p,0.12,W-0.12,-dv,0,ya);
  p.esteios=[0.35,p.uF+1.08,W-0.35];for(const u of p.esteios){peca(p,u-0.07,u+0.07,ya,y1,-dv+0.12,-dv+0.26,0x5a3f27,0);boxL(p,u-0.07,u+0.07,-dv+0.12,-dv+0.26,ya,y1);}
  peca(p,0.2,W-0.2,y1-0.1,y1,-dv+0.13,-dv+0.25,0x5a3f27,0);
  const th=Math.atan2(0.28,dv+0.4);peca(p,-0.2,W+0.2,y1+0.06,y1+0.15,-dv-0.4,0.06,telha,0,0,0,-th);}
/* ---------- bagunça de casa abandonada: papéis, garrafas, mancha de sangue, caixas, quadros tortos, colchão no chão ---------- */
function bagunca(p){const R=rng(4400+p.id*7);
  for(const fl of p.salas)for(const s of fl||[]){if(!s||s.tipo==='telhado'||s.tipo==='escada')continue;const b=s.escura,y=s.y,du=s.u1-s.u0,dv=s.v1-s.v0;if(du<1.6||dv<1.6)continue;
    const pt=()=>[s.u0+0.4+R()*(du-0.8),s.v0+0.4+R()*(dv-0.8)];
    for(let i=0,n=2+Math.floor(R()*4);i<n;i++){const[u,v]=pt(),w=0.18+R()*0.12;peca(p,u-w/2,u+w/2,y,y+0.006,v-0.15,v+0.15,[0xe8e4d8,0xd8cfa8,0xc9c4b8][i%3],b);}
    if(R()<0.6){const[u,v]=pt(),deitada=R()<0.5;peca(p,u-0.035,u+0.035,y,y+(deitada?0.07:0.26),v-(deitada?0.13:0.035),v+(deitada?0.13:0.035),R()<0.5?0x2f5a2a:0x5a3a1a,b);}
    if(R()<0.3&&s.tipo!=='igreja'){const[u,v]=pt();peca(p,u-0.35,u+0.35,y,y+0.005,v-0.25,v+0.3,0x3a0806,b);peca(p,u+0.2,u+0.5,y,y+0.005,v+0.2,v+0.75,0x40100c,b);}
    if(R()<0.35){const[u,v]=pt();peca(p,u-0.22,u+0.22,y,y+0.32,v-0.18,v+0.18,0x9a7a4a,b);peca(p,u-0.23,u+0.23,y+0.28,y+0.3,v-0.19,v+0.19,0x8a6a3a,b);}
    if(/sala|quarto|igreja/.test(s.tipo)&&R()<0.75){const u=s.u0+0.6+R()*(du-1.2),h=y+1.45+R()*0.2;peca(p,u-0.24,u+0.24,h,h+0.36,s.v1-0.035,s.v1-0.005,[0x6b4e30,0x3a5a7a,0x8a3a2a][Math.floor(R()*3)],b);
      peca(p,u-0.19,u+0.19,h+0.05,h+0.31,s.v1-0.04,s.v1-0.03,[0xc9b48a,0x9ab0a0,0xd8c0a0][Math.floor(R()*3)],b);}
    if(s.tipo==='sala_casa'&&R()<0.35){const[u,v]=pt();peca(p,u-0.45,u+0.45,y,y+0.14,v-0.95,v+0.95,0xb8b0a0,b);peca(p,u-0.4,u+0.3,y+0.14,y+0.17,v-0.6,v+0.7,0x5a6a8a,b);}}}
/* cortinas nas janelas (por dentro) e a lâmpada pendurada no meio de cada cômodo */
function cortinasELuzes(p){if(!p.casa)return;const R=rng(6100+p.id*5),E=0.2,cores=[0xc9b48a,0x9ab0a0,0xd8a8a0,0xb8c0d8,0xe0d8b8,0x8a9a6a];
  for(const j of CID.janelas){if(j.p!==p)continue;const l=plc(p,j.x,j.z),a=((j.yaw-p.yaw)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI,y=j.y,h=j.larg/2,cor=cores[Math.floor(R()*cores.length)];
    if(R()<0.25)continue;const fecha=R()<0.3?h*0.7:0;
    for(const s of[-1,1]){const c0=s<0?l[Math.abs(a)>2.5||Math.abs(a)<0.6?0:1]-h-0.18:l[Math.abs(a)>2.5||Math.abs(a)<0.6?0:1]+h-0.22-fecha,c1=c0+0.4+fecha;
      if(Math.abs(a)>2.5)peca(p,c0,c1,y+0.85,y+2.4,E+0.01,E+0.035,cor,0.62);else if(Math.abs(a)<0.6)peca(p,c0,c1,y+0.85,y+2.4,p.D-E-0.035,p.D-E-0.01,cor,0.62);
      else if(a<0)peca(p,E+0.01,E+0.035,y+0.85,y+2.4,c0,c1,cor,0.62);else peca(p,p.W-E-0.035,p.W-E-0.01,y+0.85,y+2.4,c0,c1,cor,0.62);}}
  for(const fl of p.salas)for(const s of fl||[]){if(!s||/escada/.test(s.tipo))continue;const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,yc=s.y+p.H-0.22;
    peca(p,cu-0.01,cu+0.01,yc-0.45,yc,cv-0.01,cv+0.01,0x1a1a1a,s.escura);peca(p,cu-0.13,cu+0.13,yc-0.58,yc-0.45,cv-0.13,cv+0.13,R()<0.5?0xe8e2d4:0x8a6a45,s.escura);
    peca(p,cu-0.05,cu+0.05,yc-0.66,yc-0.58,cv-0.05,cv+0.05,0xfff2c8,s.escura);}}
/* azulejo até a altura da pia na cozinha e no banheiro (com o vão das portas) */
function azulejos(p){if(!p.casa)return;const R=rng(6600+p.id);
  for(const fl of p.salas)for(const s of fl||[]){if(!s||!/cozinha|lavabo|banheiro/.test(s.tipo))continue;const cor=[0xd8e4e0,0x9ab8c8,0xe8e0c8,0xb8d0b0][Math.floor(R()*4)],y=s.y,h=0.95,b=s.escura,e=0.012;
    const portas=CID.portas.filter(d=>d.p===p&&(d.sA===s||d.sB===s)).map(d=>{const l=plc(p,d.x,d.z);return{u:l[0],v:l[1],h:d.larg/2+0.05,ao:Math.abs(Math.sin(d.yaw-p.yaw))<0.5};});
    const faixa=(a,b2,lado,k,eixoU)=>{const cortes=portas.filter(q=>q.ao===eixoU&&Math.abs((eixoU?q.v:q.u)-k)<0.35).map(q=>[(eixoU?q.u:q.v)-q.h,(eixoU?q.u:q.v)+q.h]).sort((x,z)=>x[0]-z[0]);
      let s0=a;const seg=(x0,x1)=>{if(x1-x0<0.05)return;if(eixoU)peca(p,x0,x1,y,y+h,lado<0?k:k-e,lado<0?k+e:k,cor,b);else peca(p,lado<0?k:k-e,lado<0?k+e:k,y,y+h,x0,x1,cor,b);};
      for(const c of cortes){seg(s0,c[0]);s0=Math.max(s0,c[1]);}seg(s0,b2);};
    faixa(s.u0,s.u1,-1,s.v0,true);faixa(s.u0,s.u1,1,s.v1,true);faixa(s.v0,s.v1,-1,s.u0,false);faixa(s.v0,s.v1,1,s.u1,false);}}
/* tábuas pregadas nas janelas inteiras (por fora) */
function tabuasJanelas(p,chance){const R=rng(5100+p.id*3);
  for(const j of CID.janelas){if(j.p!==p||j.quebrada||j.f>0||R()>chance)continue;const l=plc(p,j.x,j.z),a=((j.yaw-p.yaw)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI,y=j.y,h=j.larg/2+0.12;
    for(const dy of[1.18,1.55,1.95]){const yy=y+dy+(R()-0.5)*0.06;
      if(Math.abs(a)>2.5)peca(p,l[0]-h,l[0]+h,yy,yy+0.16,-0.07,-0.02,0x7a5a3a,0);else if(Math.abs(a)<0.6)peca(p,l[0]-h,l[0]+h,yy,yy+0.16,p.D+0.02,p.D+0.07,0x7a5a3a,0);
      else if(a<0)peca(p,-0.07,-0.02,yy,yy+0.16,l[1]-h,l[1]+h,0x7a5a3a,0);else peca(p,p.W+0.02,p.W+0.07,yy,yy+0.16,l[1]-h,l[1]+h,0x7a5a3a,0);}}}
/* ---------- objetos do quintal e da rua (desenho fixo do mundo; M é a matriz da base do objeto) ---------- */
const LF=(p,u,v,y,ry)=>mm(mat(p.ox,0,p.oz,0,p.yaw,0),mat(u,y,v,0,ry||0,0));
function textoBlocos(C,M,txt,s,cor){txt=txt.toUpperCase();const n=txt.length;
  for(let k=0;k<n;k++){const g=FONTE[txt[k]]||FONTE[' '];for(let r=0;r<5;r++)for(let c=0;c<3;c++){if(g[r*3+c]!=='1')continue;add(C,bvTris(s,s*0.95,0.03),mm(M,mat(((k-(n-1)/2)*4+(c-1))*s,(4-r)*s,0)),lin(cor));}}}
function propVaral(C,M,len,R){const pau=lin(0x6b5034);for(const x of[-len/2,len/2]){add(C,cylTris(0.04,0.045,1.9,6),mm(M,mat(x,0,0)),pau);add(C,bvTris(0.05,0.05,0.7),mm(M,mat(x,1.86,0)),pau);}
  for(const z of[-0.25,0.25])add(C,bvTris(len,0.012,0.012),mm(M,mat(0,1.84,z)),lin(0x3a3a38));
  const cores=[0xe8e4dc,0x3a5a8a,0xa8261d,0xd8c050,0xd890a0,0x5a7a4a];for(let i=0;i<6;i++){const x=-len/2+0.5+i*(len-1)/5+(R()-0.5)*0.2,z=i%2?0.25:-0.25,w=0.35+R()*0.3,h=0.4+R()*0.35;
    add(C,bvTris(w,h,0.02),mm(M,mat(x,1.82-h/2,z,0,R()*0.3,0)),lin(cores[i%6]));}}
function propTanque(C,M){add(C,bvTris(0.62,0.82,0.56),mm(M,mat(0,0.41,0)),lin(0x9a968c),{j:0.05});add(C,bvTris(0.56,0.05,0.5),mm(M,mat(0,0.83,0.02)),lin(0x6d6a62));
  for(let i=0;i<5;i++)add(C,bvTris(0.5,0.015,0.03),mm(M,mat(0,0.86,-0.12+i*0.05,-0.3,0,0)),lin(0x8a877e));add(C,bvTris(0.03,0.25,0.03),mm(M,mat(0.2,1.0,-0.24)),lin(0x9aa1a6));}
function propBotijao(C,M){add(C,cylTris(0.17,0.17,0.48,10),M,lin(0x2f5a8a),{j:0.06});add(C,cylTris(0.1,0.06,0.12,8),mm(M,mat(0,0.48,0)),lin(0x2f5a8a));add(C,cylTris(0.03,0.03,0.06,6),mm(M,mat(0,0.6,0)),lin(0x9aa1a6));}
function propVaso(C,M,R){add(C,cylTris(0.16,0.2,0.32,9),M,lin(0xa0583a),{j:0.06,rnd:R});add(C,icoTris(0.26,0.3,R),mm(M,mat(0,0.5,0,0,R()*3,0,1,0.9,1)),mixc(lin(0x3f6a2a),lin(0x5a8a33),R()),{j:0.2,rnd:R});
  if(R()<0.6)for(let i=0;i<4;i++)add(C,bvTris(0.06,0.06,0.06),mm(M,mat((R()-0.5)*0.35,0.58+R()*0.15,(R()-0.5)*0.35)),lin([0xd94a6a,0xf2d040,0xe8e4dc,0xb050d0][Math.floor(R()*4)]),{e:0.1});}
function propBike(C,M){const f=lin(0x8a2a22),pn=lin(0x161616);for(const x of[-0.52,0.52])add(C,cylTris(0.33,0.33,0.04,12),mm(M,mat(x,0.34,0,Math.PI/2,0,0)),pn);
  add(C,bvTris(1.04,0.04,0.04),mm(M,mat(0,0.5,0)),f);add(C,bvTris(0.04,0.42,0.04),mm(M,mat(-0.1,0.62,0,0,0,0.3)),f);add(C,bvTris(0.6,0.04,0.04),mm(M,mat(0.12,0.8,0,0,0,-0.15)),f);
  add(C,bvTris(0.22,0.05,0.1),mm(M,mat(-0.22,0.86,0)),lin(0x1a1a1a));add(C,bvTris(0.05,0.05,0.5),mm(M,mat(0.45,0.92,0)),lin(0x55595c));}
function propCasinha(C,M,R){const m=lin(0x8a5a3a);add(C,bvTris(0.8,0.6,1.0),mm(M,mat(0,0.3,0)),m,{j:0.06,rnd:R});add(C,roofTris(1.1,0.35,0.95),mm(M,mat(0,0.6,0)),lin(0x7a3a28));
  add(C,bvTris(0.36,0.4,0.02),mm(M,mat(0,0.22,0.505)),lin(0x120e0a));add(C,cylTris(0.12,0.1,0.06,8),mm(M,mat(0.5,0,0.7)),lin(0x9aa1a6));}
function propCorreio(C,M){add(C,bvTris(0.06,1.05,0.06),mm(M,mat(0,0.52,0)),lin(0x5a412a));add(C,bvTris(0.36,0.26,0.24),mm(M,mat(0,1.15,0)),lin(0xc9a227),{j:0.04});add(C,bvTris(0.2,0.02,0.01),mm(M,mat(0,1.2,0.125)),lin(0x1a1a1a));}
/* bolas de folha das árvores de fruta: malha à parte (MESH.copasFrut), desenhada só quando a mata nova não está ligada */
const COPAS_FRUT=new GB(1<<14,8);
function propArvore(C,M,R,fruta){const t=lin(0x5a4330);add(C,cylTris(0.14,0.2,1.6,7),M,t,{j:0.1,rnd:R});for(const a of[0.6,2.4,4.3])add(C,cylTris(0.05,0.08,1.0,5),mm(M,mat(Math.sin(a)*0.15,1.4,Math.cos(a)*0.15,0.6*Math.cos(a),0,-0.6*Math.sin(a))),t);
  const verde=fruta==='manga'?lin(0x2f5a24):lin(0x3f6a2a),CC=COPAS_FRUT;for(let i=0;i<5;i++){const a=i*1.3,r=i?0.65:0;add(CC,icoTris(0.8+R()*0.3,0.3,R),mm(M,mat(Math.cos(a)*r,2.3+(i?R()*0.4:0.5),Math.sin(a)*r,R(),R()*3,R(),1.1,0.85,1.1)),mixc(verde,lin(0x4f7a2f),R()*0.5),{j:0.15,rnd:R});}
  // as frutas são desenhadas à parte (somem quando você colhe e voltam com o tempo): 48yb_pomar. Os R() ficam para o resto do sítio sair igual.
  for(let i=0;i<14;i++){R();R();R();}const p=xf(M,0,0,0);FRUTEIRAS.push({id:'fr'+FRUTEIRAS.length,M:new Float32Array(M),x:p[0],y:p[1],z:p[2],fruta});}
function propLixo(C,M,R){for(let i=0;i<3;i++)add(C,icoTris(0.22+R()*0.08,0.3,R),mm(M,mat((R()-0.5)*0.7,0.18,(R()-0.5)*0.7,0,R()*3,0,1,0.8,1)),lin(i%2?0x1a1c1e:0x2a2c30),{j:0.2,rnd:R});}
function propLenha(C,M,R){const rows=[5,4,3];for(let r=0;r<3;r++)for(let i=0;i<rows[r];i++)add(C,cylTris(0.11,0.11,0.8,7),mm(M,mat((i-(rows[r]-1)/2)*0.235,0.11+r*0.2,-0.4,Math.PI/2,0,0)),mixc(lin(0x6b4a2e),lin(0x7d5835),R()),{j:0.1,rnd:R});
  add(C,cylTris(0.3,0.33,0.4,8),mm(M,mat(-1.2,0,0.1)),lin(0x5a4330),{j:0.12,rnd:R});add(C,cylTris(0.28,0.28,0.02,8),mm(M,mat(-1.2,0.4,0.1)),lin(0xa07a4c));
  add(C,bvTris(0.04,0.04,0.7),mm(M,mat(-1.15,0.55,0.1,0.9,0.3,0)),lin(0x6b4a2e));add(C,bvTris(0.18,0.1,0.03),mm(M,mat(-1.12,0.8,0.33,0.9,0.3,0)),lin(0x9aa1a6));}
function propCaixaDagua(C,M,R){const m=lin(0x6b5034);for(const x of[-0.75,0.75])for(const z of[-0.75,0.75])add(C,bvTris(0.14,3.2,0.14),mm(M,mat(x,1.6,z)),m,{j:0.05,rnd:R});
  for(const y of[1.1,2.2])for(const s of[-1,1]){add(C,bvTris(1.6,0.08,0.06),mm(M,mat(0,y,s*0.75)),m);add(C,bvTris(0.06,0.08,1.6),mm(M,mat(s*0.75,y,0)),m);}
  add(C,bvTris(1.85,0.12,1.85),mm(M,mat(0,3.22,0)),m);add(C,cylTris(0.72,0.8,1.0,14),mm(M,mat(0,3.28,0)),lin(0x2f6aa0),{j:0.04});add(C,cylTris(0.78,0.5,0.14,14),mm(M,mat(0,4.28,0)),lin(0x2a5f90));
  add(C,cylTris(0.04,0.04,3.3,5),mm(M,mat(0.8,0,0.3)),lin(0x3a3d40));}
function propHorta(C,N,M,w,d,R){const terra=lin(0x3d3127),n=Math.max(2,Math.floor(d/1.1));
  // cada fileira de terra é um canteiro (plantar e colher); as plantas são desenhadas pelo plantio (48ya)
  for(let r=0;r<n;r++){const z=-d/2+0.5+r*(d-1)/Math.max(1,n-1);add(N,bvTris(w-0.6,0.16,0.62),mm(M,mat(0,0.06,z)),terra,{j:0.1,rnd:R});
    const a=xf(M,-(w-0.6)/2+0.15,0.14,z),b=xf(M,(w-0.6)/2-0.15,0.14,z);PLANTIO_DEF.push({id:'sit'+PLANTIO_DEF.filter(q=>q.tipo==='sitio').length,ax:a[0],az:a[2],bx:b[0],bz:b[2],y:(a[1]+b[1])/2,tipo:'sitio'});}
  for(const s of[-1,1]){for(let i=0;i<=Math.round(w/1.2);i++){const x=-w/2+i*w/Math.round(w/1.2);add(N,bvTris(0.05,0.6,0.05),mm(M,mat(x,0.3,s*d/2)),lin(0x6b5034));}
    for(let i=0;i<=Math.round(d/1.2);i++){const z=-d/2+i*d/Math.round(d/1.2);add(N,bvTris(0.05,0.6,0.05),mm(M,mat(s*w/2,0.3,z)),lin(0x6b5034));}
    add(N,bvTris(w,0.03,0.03),mm(M,mat(0,0.5,s*d/2)),lin(0x7a5a3a));add(N,bvTris(0.03,0.03,d),mm(M,mat(s*w/2,0.5,0)),lin(0x7a5a3a));}}
function propEspantalho(C,M,R){const pau=lin(0x6b5034);add(C,bvTris(0.07,1.9,0.07),mm(M,mat(0,0.95,0)),pau);add(C,bvTris(1.2,0.06,0.06),mm(M,mat(0,1.45,0)),pau);
  add(C,bvTris(0.5,0.6,0.22),mm(M,mat(0,1.3,0)),lin(0x8a3a2a),{j:0.1,rnd:R});for(const s of[-1,1])add(C,bvTris(0.4,0.14,0.16),mm(M,mat(s*0.42,1.45,0)),lin(0x8a3a2a));
  add(C,icoTris(0.16,0.2,R),mm(M,mat(0,1.82,0)),lin(0xd8c08a));add(C,cylTris(0.34,0.2,0.04,10),mm(M,mat(0,1.92,0)),lin(0xc8a54e));add(C,cylTris(0.17,0.12,0.16,8),mm(M,mat(0,1.95,0)),lin(0xc8a54e));
  for(let i=0;i<5;i++)add(C,bvTris(0.02,0.18,0.02),mm(M,mat(s4(i)*0.1,1.08,0.05,0,0,(i-2)*0.25)),lin(0xd8c060));}
const s4=i=>(i-2)*0.5;
function propGalinheiro(C,N,M,R){const m=lin(0x7a5a3a);add(C,bvTris(2.0,1.3,1.4),mm(M,mat(0,0.65,0)),m,{j:0.07,rnd:R});add(C,bvTris(2.2,0.08,1.7),mm(M,mat(0,1.42,0,0.25,0,0)),lin(0x6a6e70));
  add(C,bvTris(0.4,0.5,0.02),mm(M,mat(0.5,0.35,0.71)),lin(0x1a140e));add(C,bvTris(0.12,0.04,0.9),mm(M,mat(0.5,0.12,1.1,-0.25,0,0)),m);
  for(const[x,z]of[[-1.6,0.8],[1.6,0.8],[-1.6,3.2],[1.6,3.2],[0,3.2]])add(N,bvTris(0.06,1.1,0.06),mm(M,mat(x,0.55,z)),lin(0x6b5034));
  for(let i=0;i<6;i++){const y=0.15+i*0.17;add(N,bvTris(3.2,0.01,0.01),mm(M,mat(0,y,3.2)),lin(0x8a8e92));for(const x of[-1.6,1.6])add(N,bvTris(0.01,0.01,2.4),mm(M,mat(x,y,2.0)),lin(0x8a8e92));}
  for(let i=0;i<4;i++){const x=(R()-0.5)*2.4,z=1.4+R()*1.5;add(N,icoTris(0.12,0.2,R),mm(M,mat(x,0.14,z,0,R()*3,0,1.3,1,1)),lin(i%2?0xe8e4dc:0x8a5a3a));add(N,bvTris(0.04,0.06,0.04),mm(M,mat(x+0.1,0.25,z)),lin(0xc0281e));}}
function propPoco(C,M,cT){add(C,cylTris(0.9,0.95,0.8,10,{top:false}),M,lin(0x7d7a72),{j:0.1});add(C,cylTris(0.75,0.75,0.05,10),mm(M,mat(0,0.7,0)),lin(0x1a2a33));
  for(const sx of[-0.8,0.8])add(C,bvTris(0.12,1.9,0.12),mm(M,mat(sx,0.95,0)),lin(0x5a412a));add(C,roofTris(1.5,0.7,2.1),mm(M,mat(0,1.9,0,0,Math.PI/2,0)),lin(cT));
  add(C,cylTris(0.08,0.08,1.5,8),mm(M,mat(-0.75,1.35,0,0,0,Math.PI/2)),lin(0x6b4a2e));add(C,cylTris(0.18,0.15,0.28,8),mm(M,mat(0.25,1.0,0.2)),lin(0x6a6e70));add(C,bvTris(0.01,0.35,0.01),mm(M,mat(0.25,1.28,0.2)),lin(0x8a7a5a));}
function propCadeira(C,M,cor){const c=lin(cor);add(C,bvTris(0.46,0.05,0.44),mm(M,mat(0,0.44,0)),c);add(C,bvTris(0.46,0.5,0.05),mm(M,mat(0,0.72,-0.2,-0.12,0,0)),c);
  for(const x of[-0.2,0.2])for(const z of[-0.18,0.18])add(C,bvTris(0.04,0.44,0.04),mm(M,mat(x,0.22,z)),c);}
function propRede(C,M,len,cor){const n=7;for(let i=0;i<n;i++){const t=(i+0.5)/n,x=-len/2+t*len,y=1.55-Math.sin(t*Math.PI)*0.55,a=Math.cos(t*Math.PI)*0.9;
    add(C,bvTris(len/n+0.04,0.03,0.8),mm(M,mat(x,y,0,0,0,a*-0.45)),lin(i%2?cor:0xe8e4dc));}
  for(const s of[-1,1])add(C,bvTris(0.5,0.015,0.015),mm(M,mat(s*(len/2+0.15),1.75,0,0,0,s*-0.5)),lin(0x8a7a5a));}
function propBanco(C,M){const m=lin(0x6b5034);add(C,bvTris(1.6,0.06,0.42),mm(M,mat(0,0.45,0)),m);add(C,bvTris(1.6,0.32,0.05),mm(M,mat(0,0.72,-0.2)),m);for(const x of[-0.7,0.7])add(C,bvTris(0.08,0.45,0.4),mm(M,mat(x,0.22,0)),lin(0x3a3d40));}
function propOrelhao(C,M){add(C,bvTris(0.08,2.1,0.08),mm(M,mat(0,1.05,-0.32)),lin(0x55595c));const lj=lin(0xe0761a);
  add(C,bvTris(0.9,0.9,0.06),mm(M,mat(0,1.8,-0.3)),lj,{j:0.03});add(C,bvTris(0.9,0.06,0.6),mm(M,mat(0,2.24,-0.03)),lj);for(const s of[-1,1])add(C,bvTris(0.06,0.8,0.55),mm(M,mat(s*0.45,1.84,-0.05)),lj);
  add(C,bvTris(0.24,0.4,0.12),mm(M,mat(0,1.55,-0.22)),lin(0x2a4a7a));add(C,bvTris(0.06,0.18,0.06),mm(M,mat(0.08,1.65,-0.14)),lin(0x1a1a1a));}
function propPoste(C,x,z){const g=ground(x,z);add(C,cylTris(0.1,0.13,6.2,7),mat(x,g,z),lin(0x8a8a82));add(C,bvTris(1.0,0.08,0.08),mat(x,g+5.9,z),lin(0x6b5034));
  for(const s of[-0.4,0.4])add(C,cylTris(0.03,0.03,0.1,5),mat(x+s,g+5.94,z),lin(0xe8e4dc));colCircle(x,z,0.14);return[x,g+5.98,z];}
function propFio(N,a,b){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2]),n=6;
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,s=t=>-Math.sin(t*Math.PI)*0.45,p0=[a[0]+d[0]*t0,a[1]+d[1]*t0+s(t0),a[2]+d[2]*t0],p1=[a[0]+d[0]*t1,a[1]+d[1]*t1+s(t1),a[2]+d[2]*t1];
    add(N,cylTris(0.012,0.012,Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),3),alignY(p0[0],p0[1],p0[2],p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),lin(0x1a1a1a));}}
/* cerca de arame farpado com mourões de madeira: mourão e arame bloqueiam; só se passa pelos vãos (porteira) */
function propCerca(C,N,pts,vaos,R){for(let s=0;s<pts.length-1;s++){const a=pts[s],b=pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/2.6));
    for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(vaos.some(v=>Math.hypot(x-v[0],z-v[1])<v[2]))continue;const g=ground(x,z);
      add(C,cylTris(0.07,0.08,1.35,6),mat(x,g-0.05,z,0,R()*3,(R()-0.5)*0.08),mixc(lin(0x5a4330),lin(0x6b5034),R()),{j:0.08,rnd:R});colCircle(x,z,0.09);
      if(i<n){const t2=(i+1)/n,x2=a[0]+(b[0]-a[0])*t2,z2=a[1]+(b[1]-a[1])*t2;if(vaos.some(v=>Math.hypot((x+x2)/2-v[0],(z+z2)/2-v[1])<v[2]))continue;const g2=ground(x2,z2);
        for(const h of[0.45,0.8,1.15])add(N,cylTris(0.008,0.008,Math.hypot(x2-x,g2-g,z2-z),3),alignY(x,g+h,z,x2-x,g2-g,z2-z),lin(0x4a4a48));
        {const Ls=Math.hypot(x2-x,z2-z)||1;colBox((x+x2)/2,(z+z2)/2,Ls/2,0.06,Math.atan2(-(z2-z)/Ls,(x2-x)/Ls));}}}}}
/* porteira de madeira aberta e a placa com o nome do sítio em cima */
function propPorteira(C,N,M,nome,R){const m=lin(0x6b4a2e);for(const s of[-1,1])add(C,bvTris(0.22,2.9,0.22),mm(M,mat(s*2.3,1.45,0)),m,{j:0.06,rnd:R});
  add(C,bvTris(5.1,0.22,0.22),mm(M,mat(0,2.9,0)),m);add(C,bvTris(Math.min(4.6,nome.length*0.4+0.6),0.62,0.06),mm(M,mat(0,2.55,0.14)),lin(0x8a6a45),{j:0.05,rnd:R});
  textoBlocos(C,mm(M,mat(0,2.33,0.19)),nome,0.085,0x2a1a10);
  const G=mm(M,mat(-2.2,0,0,0,1.25,0));for(const y of[0.35,0.75,1.15])add(C,bvTris(2.0,0.12,0.06),mm(G,mat(1.0,y,0)),m);for(const x of[0.05,1.0,1.95])add(C,bvTris(0.08,1.0,0.07),mm(G,mat(x,0.75,0)),m);
  add(C,bvTris(2.1,0.08,0.06),mm(G,mat(1.0,0.75,0,0,0,0.5)),m);}
/* galpão aberto: esteios, telhado de zinco, bancada, tambores, pneus e sacos */
function propGalpao(C,N,M,R){const w=7,d=5.4,h=3.1,m=lin(0x5a412a);for(const x of[-w/2,0,w/2])for(const z of[-d/2,d/2])add(C,bvTris(0.16,h,0.16),mm(M,mat(x,h/2,z)),m,{j:0.05,rnd:R});
  for(const z of[-d/2,d/2])add(C,bvTris(w+0.2,0.14,0.14),mm(M,mat(0,h,z)),m);add(C,bvTris(w+0.9,0.06,d+0.9),mm(M,mat(0,h+0.22,0,0.09,0,0)),lin(0x8a8e92),{j:0.05,rnd:R});
  for(let i=0;i<10;i++)add(C,bvTris(0.02,0.03,d+0.9),mm(M,mat(-w/2-0.3+i*(w+0.6)/9,h+0.26,0,0.09,0,0)),lin(0x6a6e70));
  add(C,bvTris(2.2,0.08,0.7),mm(M,mat(0,0.92,-d/2+0.5)),lin(0x7a5a3c));for(const x of[-1,1])add(C,bvTris(0.08,0.9,0.6),mm(M,mat(x,0.45,-d/2+0.5)),m);
  add(C,bvTris(0.5,0.25,0.3),mm(M,mat(-0.5,1.08,-d/2+0.5)),lin(0xa8261d));add(C,bvTris(0.9,0.02,0.04),mm(M,mat(0.4,0.97,-d/2+0.6,0,0.4,0)),lin(0x9aa1a6));
  for(let i=0;i<2;i++)add(C,cylTris(0.3,0.3,0.9,10),mm(M,mat(w/2-0.6,0,-d/2+0.6+i*0.7)),lin(i?0x355a7a:0x8a2f22),{j:0.08,rnd:R});
  for(let i=0;i<3;i++)add(C,cylTris(0.36,0.36,0.22,10,{top:true}),mm(M,mat(-w/2+0.8,i*0.22,d/2-0.8)),lin(0x161616));
  for(let i=0;i<3;i++)add(C,icoTris(0.3,0.25,R),mm(M,mat(1.6+i*0.5,0.22,d/2-0.6,0,R()*3,0,1,0.7,1.4)),lin(0xc8b080),{j:0.15,rnd:R});
  add(C,bvTris(1.2,0.12,1.0),mm(M,mat(-1.5,0.06,0.6)),lin(0x8a6a45));for(let i=0;i<2;i++)add(C,bvTris(0.6,0.5,0.5),mm(M,mat(-1.7+i*0.5,0.37+i*0.5,0.6,0,R()*0.4,0)),lin(0x7a5a3c),{j:0.08,rnd:R});}
/* ---------- a vila ---------- */
// fachadas da vila com cor de verdade (desbotada pelo tempo), e telhados variados: cada casa se reconhece de longe
const CASA_CORES=[[0xd2a046,0xe6dccb,0x8a6e52,0x7a3a28],[0x6f98aa,0xdfe0d4,0x7a6450,0x5a5e62],[0xc9806e,0xe8dccc,0x8a6e52,0x8a4a30],[0x84a46c,0xe0e2dc,0x6d6f6c,0x6e2f22],
  [0xe2d8c6,0xe8e2c8,0x8a6e52,0x7a3a28],[0x9c78a2,0xe2d6c0,0x7a5a40,0x4a3a34],[0xcf9a58,0xe0e2d0,0x8a6e52,0x8a4a30],[0x6ea8a0,0xeae4d8,0x6b5a4c,0x5a5e62],[0xdcc46e,0xe6dccb,0x8a6e52,0x6e2f22]];
const MURETA_CORES=[0xd8d0c0,0xc8c0b0,0xe0d8c8,0xb8b0a0];
const VILA={};
function vilaMontar(C,N){const R=rng(26100);
  for(const l of VILA_LOTES){const sp={nome:l.nome||'Casa '+l.id.slice(1)+' da vila',tipo:l.tipo,frente:l.frente,x:l.x,z:l.z,W:l.W,D:l.D,andares:l.andares||1,local:'vila',lote:l.id};
    if(l.tipo==='casa')Object.assign(sp,{casa:true,cores:CASA_CORES[l.cor%CASA_CORES.length],margem:1.0,frenteQ:3.0,fundoQ:1.6,corMureta:MURETA_CORES[l.cor%4],varanda:l.varanda||0});
    else if(l.tipo==='igreja')sp.igreja=true;else{sp.placa=l.placa;sp.letreiro=l.letreiro;}
    if(l.radio)sp.antesMoveis=p=>{const s=salaDe(p,'sala_casa');if(!s)return;moveis(p,s,'escrivaninha',s.u0+0.4,(s.v0+s.v1)/2,R,2);const m=CID.moveis[CID.moveis.length-1];if(!m||m.p!==p)return;
      const cu=(m.u0+m.u1)/2,cv=(m.v0+m.v1)/2,y=m.y+m.h;peca(p,cu-0.12,cu+0.12,y,y+0.24,cv-0.28,cv+0.22,0x2f3133,s.escura);peca(p,cu+0.12,cu+0.125,y+0.05,y+0.2,cv-0.22,cv+0.1,0x9be38b,s.escura,0,0.6);
      peca(p,cu-0.05,cu+0.05,y,y+0.18,cv+0.3,cv+0.38,0x1a1a1a,s.escura);const w=pw(p,cu+1.5,cv);interAdd({id:'vila-antena',kind:'bau',x:w[0],z:w[1],y:p.y0,r:1.6,label:'Revistar a mesa do rádio',sub:'o radioamador morava aqui',tabela:'casa',respawn:3,missao:'antena'});};
    VILA[l.id]=predioRural(sp);}
  const P_=VILA;
  // antena de radioamador no telhado e fio até o beiral
  {const p=P_.v8,yT=p.y0+p.H,u=p.W*0.72,v=p.D*0.62;peca(p,u-0.05,u+0.05,yT+0.4,yT+5.6,v-0.05,v+0.05,0x9aa1a6,0);
    for(let i=0;i<4;i++){const y=yT+3.9+i*0.5,L=1.5-i*0.25;peca(p,u-L/2,u+L/2,y,y+0.04,v-0.02,v+0.02,0x9aa1a6,0);}peca(p,u-0.3,u+0.3,yT+5.3,yT+5.34,v-0.3,v+0.3,0x9aa1a6,0);}
  // pistola debaixo da cama da casa 9, escritórios do mercadinho e da farmácia
  {const p=P_.v9,s=salaDe(p,'quarto'),m=s&&CID.moveis.find(q=>q.p===p&&q.s===s&&q.k==='cama');if(m){const w=pw(p,m.u1+0.6,(m.v0+m.v1)/2);interAdd({id:'vila-casa3',kind:'bau',x:w[0],z:w[1],y:p.y0,r:1.4,label:'Olhar debaixo da cama',tabela:'casa',respawn:3,primeiro:[['pistola',1],['municao9',6]]});}
    else{const w=pw(p,p.W*0.75,p.D*0.75);interAdd({id:'vila-casa3',kind:'bau',x:w[0],z:w[1],y:p.y0,r:1.4,label:'Revistar o quarto',tabela:'casa',respawn:3,primeiro:[['pistola',1],['municao9',6]]});}}
  for(const[id,lote,label,tab]of[['vila-mercado','v6','Revistar o escritório do mercadinho','mercado'],['vila-farmacia','v2','Revistar o escritório da farmácia','farmacia']]){const p=P_[lote],s=salaDe(p,'escritorio_loja');
    const w=s?pw(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2):pw(p,p.W/2,p.D/2);interAdd({id,kind:'bau',x:w[0],z:w[1],y:p.y0,r:1.3,label,tabela:tab,respawn:3});}
  // tábuas nas janelas, pichação e o telhado da igreja
  for(const id in P_){const p=P_[id];if(p.casa)tabuasJanelas(p,0.3);}
  letreiro(P_.v12,'SOS',P_.v12.uF,P_.v12.y0+2.28,-0.012,0.1,0xa8261d,false);
  igrejaTelhado(C,P_.igreja);
  // quintais: vasos, varal, tanque, botijão, bicicleta, casinha de cachorro, caixa de correio, árvore de fruta, lixo
  for(const id in P_){const p=P_[id];if(!p.casa)continue;const W=p.W,D=p.D,y=p.yq,rr=rng(7300+p.id);
    for(let i=0;i<2+Math.floor(rr()*3);i++){const u=0.6+rr()*(W-1.2);if(Math.abs(u-p.uF)<1.0)continue;propVaso(C,LF(p,u,-(p.varanda?p.varanda+0.35:0.35),y),rr);}
    propVaral(C,LF(p,W/2+0.4,D+0.85,y),Math.min(4.2,W-2.2),rr);propTanque(C,LF(p,p.uB+1.15,D+0.33,y,Math.PI));boxL(p,p.uB+0.84,p.uB+1.46,D+0.05,D+0.61,y-0.2,y+0.85);
    propBotijao(C,LF(p,W-0.5,D+0.3,y));if(rr()<0.5){propBike(C,LF(p,-0.5,D*0.4,y,Math.PI/2));}
    if(rr()<0.45){propCasinha(C,LF(p,W+0.5,D*0.75,y,-Math.PI/2),rr);boxL(p,W+0.06,W+0.92,D*0.75-0.42,D*0.75+0.42,y-0.2,y+0.85);}
    propCorreio(C,LF(p,p.uF+1.0,-3.25,y));
    if(rr()<0.55){const u=rr()<0.5?0.2:W-0.2,ap=pw(p,u,-2.3);propArvore(C,LF(p,u,-2.3,y),rr,['laranja','manga','acerola'][Math.floor(rr()*3)]);colCircle(ap[0],ap[1],0.2);}
    if(rr()<0.5)propLixo(C,LF(p,W+0.4,-1.0,y),rr);}
  // carros largados, postes com fio, orelhão, banco, lixeiras e a placa da entrada
  {const cs=[[63.6,-64,0.02,0x6b6f74,true],[47,-80.9,Math.PI/2+0.06,0x2f3e5c,false],[88.5,-81.0,2.05,0x7a2a22,true]];cs.forEach((c,i)=>{const t=carMesh(C,c[0],c[1],c[2],c[3],R,c[4]);
    interAdd({id:'vila-carro'+(i+1),kind:'bau',x:t.tx,z:t.tz,label:'Revistar o porta-malas',tabela:'carro',respawn:4});});}
  {const pts=[[58.85,-58],[58.85,-75.6],[58.85,-94],[64.15,-66],[64.15,-84],[64.15,-101.5],[44,-76.6],[30,-76.6],[79,-81.45],[94,-81.45]].map(q=>propPoste(C,q[0],q[1]));
    for(const[a,b]of[[0,1],[1,2],[3,4],[4,5],[1,6],[6,7],[4,8],[8,9],[0,3]])propFio(N,pts[a],pts[b]);}
  propOrelhao(C,mat(65.4,ground(65.4,-75.6),-75.6,0,-Math.PI/2,0));colCircle(65.7,-75.6,0.2);
  propBanco(C,mat(65.6,ground(65.6,-84.6),-84.6,0,-Math.PI/2,0));colBox(65.6,-84.6,0.8,0.25,-Math.PI/2);propBanco(C,mat(57.4,ground(57.4,-76),-76,0,Math.PI,0));colBox(57.4,-76,0.8,0.25,0);
  for(const[x,z]of[[59.1,-66.4],[64.1,-93],[32.4,-81.45]]){const g=ground(x,z);add(C,cylTris(0.26,0.24,0.85,10),mat(x,g,z),lin(0x55595c));add(C,cylTris(0.28,0.28,0.06,10),mat(x,g+0.85,z),lin(0x3a3d40));colCircle(x,z,0.28);propLixo(C,mat(x+0.6,g,z+0.2),R);}
  {const x=66.8,z=-54.2,g=ground(x,z),M=mat(x,g,z,0,0,0);for(const s of[-1.4,1.4])add(C,boxTris(0.12,2.2,0.12),mm(M,mat(s,1.1,0)),lin(0x5a412a));
    add(C,boxTris(3.3,0.85,0.08),mm(M,mat(0,1.85,0)),lin(0xe8e2d4),{j:0.03});add(C,boxTris(3.4,0.08,0.1),mm(M,mat(0,2.3,0)),lin(0x2a5a3a));textoBlocos(C,mm(M,mat(0,1.62,0.05)),'VILA SAO JOSE',0.075,0x2a5a3a);
    colCircle(x-1.4,z,0.1);colCircle(x+1.4,z,0.1);}
  // marcos da vila: caixa d'água de concreto na entrada (dá para ver de longe), ponto de ônibus e as mesas de plástico na calçada do Bar do Zé
  {const x=77,z=-51.5,g=ground(x,z),ry=0.35,M=mat(x,g,z,0,ry,0),cy=Math.cos(ry),sy=Math.sin(ry),LW=(a,b)=>[x+a*cy+b*sy,z-a*sy+b*cy],conc=lin(0x9b978c),conc2=lin(0x7f7b71),ferro=lin(0x55524c);
    const pes=[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]];for(const[a,b]of pes){add(C,bvTris(0.36,9.25,0.36),mm(M,mat(a,4.6,b)),mixc(conc,conc2,0.3+R()*0.3),{j:0.05,rnd:R});const w=LW(a,b);colCircle(w[0],w[1],0.27);}
    for(const h of[3.1,6.2])for(const[a,b,w,d]of[[0,-1.5,3.0,0.24],[0,1.5,3.0,0.24],[-1.5,0,0.24,3.0],[1.5,0,0.24,3.0]])add(C,bvTris(w,0.28,d),mm(M,mat(a,h,b)),conc2,{j:0.04,rnd:R});
    add(C,bvTris(3.7,0.35,3.7),mm(M,mat(0,9.25,0)),conc2);add(C,cylTris(2.12,2.0,3.3,16),mm(M,mat(0,9.4,0)),conc,{j:0.05,rnd:R});
    add(C,cylTris(2.17,2.17,0.42,16),mm(M,mat(0,11.0,0)),lin(0x2f5f8a));add(C,cylTris(0.45,2.3,0.7,16),mm(M,mat(0,12.7,0)),conc2);add(C,cylTris(0.3,0.3,0.25,8),mm(M,mat(0,13.4,0)),conc2);
    for(let i=0;i<7;i++){const a=R()*6.283;add(C,boxTris(0.22+R()*0.35,1.4+R()*1.3,0.02),mm(M,mat(Math.cos(a)*2.07,10.2-R()*0.5,Math.sin(a)*2.07,0,Math.PI/2-a,0)),lin(0x5f5a50));}
    for(const s of[-0.22,0.22])add(C,boxTris(0.04,9.7,0.04),mm(M,mat(1.5+s,4.85,-1.92)),ferro);for(let y=0.4;y<9.5;y+=0.35)add(C,boxTris(0.48,0.03,0.03),mm(M,mat(1.5,y,-1.92)),ferro);}
  {const x=64.7,z=-50.6,g=ground(x,z),ry=-Math.PI/2,M=mat(x,g,z,0,ry,0),cy=Math.cos(ry),sy=Math.sin(ry),LW=(a,b)=>[x+a*cy+b*sy,z-a*sy+b*cy],met=lin(0x4a5257);
    for(const s of[-1.4,1.4]){add(C,bvTris(0.1,2.55,0.1),mm(M,mat(s,1.27,-0.58)),met);add(C,bvTris(0.08,2.35,0.08),mm(M,mat(s,1.17,0.55)),met);const w=LW(s,-0.58);colCircle(w[0],w[1],0.1);}
    add(C,bvTris(3.25,0.08,1.75),mm(M,mat(0,2.45,0,-0.08,0,0)),lin(0x2f6a5a));add(C,boxTris(2.9,1.55,0.04),mm(M,mat(0,1.32,-0.6)),lin(0x7f9089));
    add(C,bvTris(2.4,0.06,0.38),mm(M,mat(0,0.48,-0.34)),lin(0x6b4e30));for(const s of[-1.0,1.0])add(C,bvTris(0.06,0.46,0.3),mm(M,mat(s,0.24,-0.34)),met);
    {const w=LW(0,-0.5);colBox(w[0],w[1],1.45,0.2,ry,{y0:-0.2,y1:2.4});}
    const S=mm(M,mat(1.95,0,0.45));add(C,cylTris(0.04,0.045,2.65,6),S,met);add(C,bvTris(0.62,0.32,0.04),mm(S,mat(0,2.42,0.03)),lin(0xe8e2d4));textoBlocos(C,mm(S,mat(0,2.33,0.06)),'PONTO',0.026,0x2a3a5a);
    {const w=LW(1.95,0.45);colCircle(w[0],w[1],0.08);}propLixo(C,mm(M,mat(-1.9,0,0.2)),R);}
  {const p=P_.v7,y=p.yq,uPorta=CID.portas.filter(d=>d.p===p&&Math.abs((d.x-p.ox)*p.s+(d.z-p.oz)*p.c)<0.8).map(d=>(d.x-p.ox)*p.c-(d.z-p.oz)*p.s),cores=[0xb8261d,0xe8e6e0,0xd8a030],postas=[];let n=0;
    for(const[u,v]of[[7.3,-2.5],[2.9,-3.3],[5.1,-3.3],[8.6,-3.4]]){if(n>=2)break;const w=pw(p,u,v);if(uPorta.some(q=>Math.abs(q-u)<1.7)||postas.some(q=>Math.hypot(q[0]-u,q[1]-v)<2.0)||pointBlocked(w[0],w[1],1.0))continue;n++;postas.push([u,v]);
      const c=cores[n%2?0:2];add(C,cylTris(0.42,0.42,0.04,12),LF(p,u,v,y+0.7),lin(c));add(C,cylTris(0.05,0.07,0.7,6),LF(p,u,v,y),lin(c));add(C,cylTris(0.3,0.32,0.04,10),LF(p,u,v,y),lin(c));colCircle(w[0],w[1],0.48,{y0:-0.2,y1:0.9});
      for(let k=0;k<4;k++){const th=k*Math.PI/2+0.4+(R()-0.5)*0.4,cu=u+Math.sin(th)*0.66,cv=v+Math.cos(th)*0.66,q=pw(p,cu,cv);propCadeira(C,LF(p,cu,cv,y,th+Math.PI),cores[(k+n)%2?1:0]);colCircle(q[0],q[1],0.2,{y0:-0.2,y1:0.95});}
      if(n===1){add(C,cylTris(0.025,0.025,2.2,6),LF(p,u,v,y+0.7),lin(0xd9d6cc));add(C,cylTris(0.06,1.25,0.4,8),LF(p,u,v,y+2.55),lin(0xd8a030),{j:0.05,rnd:R});}}
    for(let i=0;i<3;i++){const u=0.7+(i===2?0.05:i*0.42),cor=i%2?0xc9a227:0xa8261d,yy=y+(i===2?0.3:0);add(C,bvTris(0.38,0.3,0.52),LF(p,u,-0.45,yy+0.15,(R()-0.5)*0.2),lin(cor));
      for(let k=0;k<6;k++)add(C,cylTris(0.025,0.025,0.1,5),LF(p,u-0.11+(k%3)*0.11,-0.6+Math.floor(k/3)*0.25,yy+0.3),lin(0x3a2a1a));}
    {const q=pw(p,0.9,-0.45);colBox(q[0],q[1],0.55,0.3,p.yaw,{y0:-0.2,y1:0.7});}}
  ZSPAWN.vila=[[61.5,-62],[61.5,-74],[61.5,-92],[61.5,-100],[48,-79],[33,-79],[75,-79],[92,-79],[61.5,-84],[55,-79]];}
/* ---------- os sítios ---------- */
function sitiosMontar(C,N){const cores=[[0xd8c8a0,0xe6dccb,0x8a6e52,0x7a3a28],[0xb8c4b0,0xdfe0d4,0x7a6450,0x4a4038],[0xc9a27a,0xe2d6c0,0x7a5a40,0x5a3a2c],[0xe0d4c0,0xeae4d8,0x8a6e52,0x6e2f22],[0xa8b8c0,0xe0e2dc,0x6d6f6c,0x3f4448],[0xd0b8a0,0xe6dccb,0x8a6e52,0x5a2a22]];
  PLACES.filter(p=>p.sitio).forEach((pl,i)=>{const R=rng(8800+i*131),f={S:[0,-1],N:[0,1],E:[1,0],W:[-1,0]}[pl.frente],W=9.2,D=8.6,c=cores[i%cores.length];
    const casa=predioRural({nome:'Casa do '+pl.nome,tipo:'casa',casa:true,frente:pl.frente,x:pl.x-f[0]*0.5,z:pl.z-f[1]*0.5,W,D,andares:1,cores:c,margem:1.2,frenteQ:3.0,fundoQ:2.0,semMureta:true,varanda:2.3,local:pl.id,temPorao:false});
    const p=casa,y=p.yq,at=(u,v)=>pw(p,u,v);tabuasJanelas(p,0.2);
    // rede e cadeiras na varanda
    {const e=p.esteios,a=e[1],b=e[2];propRede(C,LF(p,(a+b)/2,-p.varanda+0.2,p.y0),b-a-0.35,[0xc0281e,0x2a6a3a,0x2a4a8a,0xd8a030][i%4]);
      propCadeira(C,LF(p,0.9,-1.1,p.y0,0.5),0x7a5a3a);propCadeira(C,LF(p,1.6,-0.7,p.y0,-0.3),0x2a5a8a);}
    // galpão aberto ao lado, com a bancada (saque do galpão)
    {const M=LF(p,W+6.5,3.0,y),bc=at(W+6.5,3.0-2.7+0.5);propGalpao(C,N,M,R);for(const u of[W+3,W+6.5,W+10])for(const v of[0.3,5.7]){const q=at(u,v);colCircle(q[0],q[1],0.12);}
      const bq=at(W+6.5,0.8);colBox(bq[0],bq[1],1.1,0.38,p.yaw);for(const k of[0,1]){const q=at(W+9.4,0.9+k*0.7);colCircle(q[0],q[1],0.32);}
      const bi=at(W+6.5,1.9);interAdd({id:'galpao-'+pl.id,kind:'bau',x:bi[0],z:bi[1],label:'Revistar a bancada do galpão',tabela:R()<0.5?'oficina':'celeiro',respawn:3});}
    // poço na frente, à esquerda
    {const q=at(-4.5,-4.2);propPoco(C,mat(q[0],ground(q[0],q[1]),q[1],0,p.yaw,0),c[3]);colCircle(q[0],q[1],1.0);interAdd({id:'poco-'+pl.id,kind:'agua',x:q[0]+f[0]*1.5,z:q[1]+f[1]*1.5,label:'Poço do sítio',sub:'beber ou encher garrafas'});}
    // horta com espantalho, varal, tanque, lenha, caixa-d'água, galinheiro, botijão, árvores de fruta, casinha do cachorro
    propHorta(C,N,LF(p,W/2-2.2,D+4.4,y),6.4,4.0,R);{const q=at(W/2+1.4,D+4.4);propEspantalho(C,mat(q[0],ground(q[0],q[1]),q[1],0,p.yaw,0),R);colCircle(q[0],q[1],0.06);}
    propVaral(C,LF(p,-3.0,D+1.6,y,Math.PI/2),4.2,R);for(const v of[D+1.6-2.1,D+1.6+2.1]){const q=at(-3.0,v);colCircle(q[0],q[1],0.06);}
    propTanque(C,LF(p,p.uB+1.15,D+0.33,y,Math.PI));boxL(p,p.uB+0.84,p.uB+1.46,D+0.05,D+0.61,y-0.2,y+0.85);
    propLenha(C,LF(p,p.uB-1.7,D+1.05,y),R);{const q=at(p.uB-1.7,D+0.65);colBox(q[0],q[1],0.65,0.45,p.yaw);const q2=at(p.uB-2.9,D+1.15);colCircle(q2[0],q2[1],0.33);}
    {const q=at(W+2.6,D+2.2);propCaixaDagua(C,mat(q[0],ground(q[0],q[1]),q[1],0,p.yaw,0),R);for(const s of[-0.75,0.75])for(const t of[-0.75,0.75]){const k=at(W+2.6+s,D+2.2+t);colCircle(k[0],k[1],0.1);}}
    {const M=LF(p,W+7.5,D+5.0,y);propGalinheiro(C,N,M,R);const q=at(W+7.5,D+5.0);colBox(q[0],q[1],1.0,0.7,p.yaw);}
    propBotijao(C,LF(p,W-0.4,D+0.35,y));
    for(const[u,v,fr]of[[-7,D+5,'manga'],[W+3.5,-6.5,'laranja'],[-7.5,-1.5,'acerola']]){const q=at(u,v);propArvore(C,mat(q[0],ground(q[0],q[1]),q[1],0,R()*6,0),R,fr);colCircle(q[0],q[1],0.22);}
    if(R()<0.7){propCasinha(C,LF(p,-1.3,D-1.6,y,Math.PI/2),R);boxL(p,-1.7,-0.9,D-2.15,D-1.05,y-0.2,y+0.85);}
    // carro (às vezes) e trator velho (às vezes)
    if(R()<0.6){const q=at(W+3.2,-5.2),cr=carMesh(C,q[0],q[1],p.yaw+0.35,[0x6b6f74,0x2f3e5c,0x7a2a22,0x4a5a3a][i%4],R,true);interAdd({id:'carro-'+pl.id,kind:'bau',x:cr.tx,z:cr.tz,label:'Revistar o porta-malas',tabela:'carro',respawn:4});}
    // cerca de arame em volta, porteira com o nome na frente (onde a estrada chega)
    {const u0=-10,u1=W+13,v0=D/2-0.5-15,v1=D+(pl.id==='sitio4'?7:10),gate=at(W/2,v0);
      propCerca(C,N,[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1),at(u0,v0)],[[gate[0],gate[1],2.6]],R);
      propPorteira(C,N,mat(gate[0],ground(gate[0],gate[1]),gate[1],0,p.yaw+Math.PI,0),pl.nome.replace(/[íÍ]/g,'I').replace(/[áÁãÃ]/g,'A').replace(/[êÊéÉ]/g,'E').replace(/[ôÔóÓ]/g,'O').replace(/[úÚ]/g,'U'),R);
      for(const s of[-1,1]){const q=at(W/2+s*2.3,v0);colCircle(q[0],q[1],0.14);}}
    ZSPAWN[pl.id]=[at(W/2,-6),at(-6,D/2),at(W+6.5,3),at(W/2,D+6)];});
  // placa de madeira no começo de cada estrada de sítio, com a seta apontando o caminho
  for(const r of ROADS){if(!r.sitio)continue;const pl=placeById(r.sitio),a=r.pts[0],b=r.pts[1],yaw=Math.atan2(b[0]-a[0],b[1]-a[1]),dx=Math.sin(yaw),dz=Math.cos(yaw),px=Math.cos(yaw),pz=-Math.sin(yaw);
    const x=a[0]+dx*3.2+px*(r.w/2+1.1),z=a[1]+dz*3.2+pz*(r.w/2+1.1);if(pointBlocked(x,z,0.4))continue;const g=ground(x,z),nome=pl.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,''),L=Math.min(3.4,nome.length*0.24+0.7);
    add(C,cylTris(0.07,0.08,2.3,6),mat(x,g,z),lin(0x5a4330));colCircle(x,z,0.1);
    const M=mm(mat(x,g+1.9,z,0,yaw-Math.PI/2,0),mat(L/2-0.1,0,0));add(C,boxTris(L,0.36,0.05),M,lin(0x8a6a45),{j:0.05});add(C,boxTris(0.3,0.3,0.05),mm(M,mat(L/2+0.08,0,0,0,0,Math.PI/4)),lin(0x8a6a45));
    textoBlocos(C,mm(M,mat(-0.05,-0.12,0.03)),nome,0.05,0x2a1a10);textoBlocos(C,mm(M,mat(-0.05,-0.12,-0.03,0,Math.PI,0)),nome,0.05,0x2a1a10);}}
/* ---------- desenho: casas de fora da cidade (perto e longe), portas delas ---------- */
function desenharRurais(Pg,sombra,alc){const cx=cam.pos[0],cz=cam.pos[2];
  for(const p of RURAIS){const px=clamp(cx,p.x0,p.x1),pz=clamp(cz,p.z0,p.z1),d=Math.hypot(cx-px,cz-pz);if(d>(sombra?alc:230))continue;
    trs(TMP,p.ox,0,p.oz,0,p.yaw,0,1,1,1);drawStat(Pg,sombra||d>65?p.mLonge:p.mPerto,TMP);}
  if(sombra)return;
  for(const d of CID.portas){if(!d.p||!d.p.rural||d.estado==='quebrada'||Math.abs(d.y-cam.pos[1])>7||d2(d.x,d.z,cx,cz)>32*32)continue;desenharPorta(Pg,d);}
  for(const a of CID.poroes){if(!a.p.rural||d2(a.x,a.z,cx,cz)>28*28||Math.abs(a.y-cam.pos[1])>6)continue;const p=a.p,w=pw(p,a.u,a.aberto?a.v-0.95:a.v);trs(TMP,w[0],a.y+(a.aberto?0.01:-0.035),w[1],0,p.yaw,0,1.25,1,1.25);drawStatI(Pg,MESH.porta.alcapaoMad,TMP,0.62);}}


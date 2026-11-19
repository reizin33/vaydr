/* ================= Ruas, calçadas e lixo da cidade (v10.8.3) =================
   Himalaia (19/11/2026): "aproxime o jogo o máximo do real... está muito sintético" (escolheu: ruas, calçadas e chão; lixo e
   abandono). O chão da cidade era liso: asfalto de uma cor só, calçada cinza inteira, faixa pintada nova, rachadura preta
   grossa e manchas de borda dura. Agora:
   · calçada em placas de concreto (juntas a cada 1,5 m), cada placa num tom, algumas manchadas, rachadas ou faltando (terra);
   · asfalto com remendos (mais novo e mais velho), manchas de óleo no meio das faixas e sujeira no canto do meio-fio;
   · tinta gasta: faixa de pedestre e tracejado com falhas;
   · rachaduras finas e tortas, cinza-escuro (antes listras pretas grossas) e manchas de terra e queimado com a borda suave;
   · lixo: papel, jornal, folhas secas (em montes nos cantos), papelão, sacolas, latas e garrafas, mais junto do meio-fio e
     das paredes. Tudo com sorteio fixo (o mundo é sempre igual) e sem colisão (só desenho). */
const RUAS3={chao:null,lixo:null,info:null};
const R3_ASF=0x343432,R3_CAL=0x8a877e;
/* triângulo virado para cima com cor por vértice (cores já em luz linear) */
function r3Tri(g,a,b,c,ca,cb,cc){const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2];if(uz*vx-ux*vz<0){const t=b;b=c;c=t;const tc=cb;cb=cc;cc=tc;}
  g.v8(a[0],a[1],a[2],ca[0],ca[1],ca[2],0,0,0,1,0);g.v8(b[0],b[1],b[2],cb[0],cb[1],cb[2],0,0,0,1,0);g.v8(c[0],c[1],c[2],cc[0],cc[1],cc[2],0,0,0,1,0);}
/* retângulo deitado (centro, meia largura, meia profundidade, giro) de uma cor */
function r3Ret(g,x,z,y,hw,hd,yaw,c){const cs=Math.cos(yaw),sn=Math.sin(yaw),P=(u,v)=>[x+u*cs+v*sn,y,z-u*sn+v*cs];
  const a=P(-hw,-hd),b=P(hw,-hd),d=P(hw,hd),e=P(-hw,hd);r3Tri(g,a,b,d,c,c,c);r3Tri(g,a,d,e,c,c,c);}
/* mancha de borda suave: miolo na cor, borda na cor do chão em volta (parece transparente) */
function r3Mancha(g,x,z,y,r,cor,fundo,R,o){o=o||{};const n=o.n||12,ax=o.ax||1,az=o.az||1,cs=Math.cos(o.rot||0),sn=Math.sin(o.rot||0),k=o.miolo??0.55;
  const ring=[],ring2=[],ir=o.irreg||0.3;for(let i=0;i<n;i++){const a=i/n*6.2832,q=r*(1-ir+ir*R()),lx=Math.cos(a)*q*ax,lz=Math.sin(a)*q*az;
    ring.push([x+lx*cs+lz*sn,y,z-lx*sn+lz*cs]);ring2.push([x+(lx*cs+lz*sn)*k,y,z+(-lx*sn+lz*cs)*k]);}
  const C=[x,y,z];for(let i=0;i<n;i++){const j=(i+1)%n;r3Tri(g,C,ring2[i],ring2[j],cor,cor,cor);
    r3Tri(g,ring2[i],ring[i],ring[j],cor,fundo,fundo);r3Tri(g,ring2[i],ring[j],ring2[j],cor,fundo,cor);}}
const r3Mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],r3K=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
function r3Buraco(x,z,m){if(typeof BURACOS==='undefined')return false;for(const b of BURACOS)if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m)return true;return false;}
function r3Predio(x,z,m){for(const p of CID.predios)if(x>p.x0-m&&x<p.x1+m&&z>p.z0-m&&z<p.z1+m)return true;return false;}
/* faixas de calçada de um quarteirão: [x0,x1,z0,z1,ao longo de x?] */
function r3Calcadas(q){const L=[];if(q.cS>0)L.push([q.x0,q.x1,q.z0+0.2,q.z0+q.cS,true]);if(q.cN>0)L.push([q.x0,q.x1,q.z1-q.cN,q.z1-0.2,true]);
  if(q.cW>0)L.push([q.x0+0.2,q.x0+q.cW,q.z0+q.cS,q.z1-q.cN,false]);if(q.cE>0)L.push([q.x1-q.cE,q.x1-0.2,q.z0+q.cS,q.z1-q.cN,false]);return L;}
function r3Chao(){const g=new GB(1<<16,8),R=rng(70813),info={juntas:0,placas:0,remendos:0,oleo:0,gastas:0,meioFio:0};
  const cal=lin(R3_CAL),asf=lin(R3_ASF),junta=lin(0x5e5b54),terra=lin(0x5a4c3a),Yc=QUADRA_Y+0.004,Ya=0.034;
  /* calçadas em placas */
  for(const q of CID.quadras)for(const[x0,x1,z0,z1,ax]of r3Calcadas(q)){const W=x1-x0,D=z1-z0;if(W<0.5||D<0.5)continue;
    const nu=Math.max(1,Math.round((ax?W:D)/1.5)),nv=Math.max(1,Math.round((ax?D:W)/1.5)),du=(ax?W:D)/nu,dv=(ax?D:W)/nv;
    const P=(u,v)=>ax?[x0+u,z0+v]:[x0+v,z0+u];
    for(let i=1;i<nu;i++){const a=P(i*du,0),b=P(i*du,ax?D:W);const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2;if(r3Buraco(cx,cz,0.3))continue;
      r3Ret(g,cx,cz,Yc,ax?0.012:(ax?D:W)/2,ax?(D/2):0.012,0,junta);info.juntas++;}
    for(let j=1;j<nv;j++){const a=P(0,j*dv),b=P(ax?W:D,j*dv);const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2;r3Ret(g,cx,cz,Yc,ax?W/2:0.012,ax?0.012:D/2,0,junta);info.juntas++;}
    /* sujeira encostada: as pontas das placas junto do lote (pé da parede) e do meio-fio ficam mais escuras (cor por canto da placa) */
    const larg=ax?D:W,dentro=ax?(z0<q.z0+1?larg:0):(x0<q.x0+1?larg:0),fora=larg-dentro,sujo=v=>1-0.3*Math.exp(-Math.abs(v-dentro)/0.5)-0.16*Math.exp(-Math.abs(v-fora)/0.3);
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const c=P((i+0.5)*du,(j+0.5)*dv),hu=(ax?du:dv)/2-0.02,hv=(ax?dv:du)/2-0.02;if(r3Buraco(c[0],c[1],0.6))continue;const s=R();
      if(s<0.015){r3Ret(g,c[0],c[1],Yc+0.001,hu,hv,0,r3K(terra,0.8+0.4*R()));info.placas++;continue;}            // placa que falta: terra
      {const tom=r3K(cal,s<0.3?0.74+0.1*R():0.84+0.12*R()),u0=i*du+0.02,u1=(i+1)*du-0.02,v0=j*dv+0.02,v1=(j+1)*dv-0.02,V=(u,v)=>{const p=P(u,v);return[p[0],Yc+0.001,p[1]];};
        const a4=V(u0,v0),b4=V(u1,v0),c4=V(u1,v1),d4=V(u0,v1),k0=r3K(tom,sujo(v0)),k1=r3K(tom,sujo(v1));r3Tri(g,a4,b4,c4,k0,k0,k1);r3Tri(g,a4,c4,d4,k0,k1,k1);info.placas++;}   // cada placa num tom
      if(R()<0.07){r3Mancha(g,c[0]+(R()-0.5)*hu,c[1]+(R()-0.5)*hv,Yc+0.002,0.25+0.35*R(),r3K(cal,0.6+0.15*R()),r3K(cal,0.86),R,{rot:R()*3,ax:1.3,az:0.7,irreg:0.55});}   // mancha escura
      if(R()<0.05){let x=c[0]+(R()-0.5)*hu*1.6,z=c[1]+(R()-0.5)*hv*1.6,a=R()*6.28;for(let k=0;k<4;k++){const L=0.25+R()*0.35;a+=(R()-0.5)*1.2;const x2=x+Math.cos(a)*L,z2=z+Math.sin(a)*L;
        if(Math.abs(x2-c[0])>hu||Math.abs(z2-c[1])>hv)break;r3Ret(g,(x+x2)/2,(z+z2)/2,Yc+0.003,0.008,L/2,Math.atan2(x2-x,z2-z),junta);x=x2;z=z2;}}}}   // rachada
  /* asfalto: remendos e manchas de óleo nas ruas; sujeira no canto do meio-fio */
  const rua=(ew,ao,a)=>{const t0=ew?CIDADE.x0:CIDADE.z0,t1=ew?CIDADE.x1:CIDADE.z1,P=(t,o)=>ew?[t,ao+o]:[ao+o,t],cruz=t=>(ew?RUAS_NS:RUAS_EW).some(r=>Math.abs(t-(ew?r.x:r.z))<r.a+0.5);
    for(let t=t0+2;t<t1-2;t+=4+R()*9){if(cruz(t))continue;const o=(R()-0.5)*(a*2-2.5),L=1.5+R()*3.5,Wd=0.8+R()*1.6,c=P(t,o);if(r3Buraco(c[0],c[1],2))continue;
      const k=R()<0.55?0.78+0.08*R():1.1+0.12*R();r3Ret(g,c[0],c[1],Ya,ew?L/2:Wd/2,ew?Wd/2:L/2,0,r3K(asf,k));info.remendos++;
      if(R()<0.5){/* emenda do remendo: borda mais escura */const e=r3K(asf,0.62);r3Ret(g,c[0],c[1]+(ew?Wd/2:0),Ya+0.0005,ew?L/2:0.02,ew?0.02:L/2,0,e);}}
    for(const faixa of(a>5?[-a/2,a/2]:[-a/2+0.2,a/2-0.2]))for(let t=t0+3;t<t1-3;t+=5+R()*11){if(cruz(t)||R()<0.35)continue;const c=P(t,faixa+(R()-0.5)*0.8);if(r3Buraco(c[0],c[1],1.5))continue;
      r3Mancha(g,c[0],c[1],Ya+0.001,0.3+R()*0.55,r3K(asf,0.35+0.15*R()),asf,R,{ax:ew?1.6:0.7,az:ew?0.7:1.6,rot:(R()-0.5)*0.4});info.oleo++;}
    for(const lado of[-1,1])for(let t=t0+1;t<t1-1;t+=1.8+R()*2.6){if(cruz(t))continue;const c=P(t,lado*(a-0.3-R()*0.25));if(r3Buraco(c[0],c[1],0.8))continue;
      const areia=R()<0.35,cor=areia?lin([0x6a5e48,0x5e5644,0x72674e][Math.floor(R()*3)]):r3K(asf,0.6+0.15*R());
      r3Mancha(g,c[0],c[1],Ya+0.0015,0.35+R()*0.5,cor,asf,R,{ax:ew?2.2:0.55,az:ew?0.55:2.2,miolo:0.4});info.meioFio++;}};
  for(const r of RUAS_EW)rua(true,r.z,r.a);for(const r of RUAS_NS)rua(false,r.x,r.a);
  /* tinta gasta: falhas na faixa de pedestre e no tracejado */
  const falha=(x,z)=>{r3Mancha(g,x,z,0.03+0.0125,0.06+R()*0.16,r3K(asf,0.9+0.2*R()),r3K(asf,1.05),R,{n:8,miolo:0.6});info.gastas++;};
  for(const e of RUAS_EW)for(const n of RUAS_NS)for(let i=0;i<7;i++){const zz=e.z-e.a+0.6+i*(2*e.a-1.2)/6;for(const xs of[n.x-n.a-1.0,n.x+n.a+1.0]){const m=2+Math.floor(R()*5);
      for(let k=0;k<m;k++)falha(xs+(R()-0.5)*1.1,zz+(R()-0.5)*0.45);}}
  for(const r of RUAS_EW)for(let x=CIDADE.x0+1;x<CIDADE.x1;x+=6){if(RUAS_NS.some(n=>Math.abs(x+1.5-n.x)<n.a+1))continue;if(R()<0.5)for(let k=0;k<1+Math.floor(R()*3);k++)falha(x+R()*3,r.z+(R()-0.5)*0.12);}
  for(const r of RUAS_NS)for(let z=CIDADE.z0+1;z<CIDADE.z1;z+=6){if(RUAS_EW.some(e=>Math.abs(z+1.5-e.z)<e.a+1))continue;if(R()<0.5)for(let k=0;k<1+Math.floor(R()*3);k++)falha(r.x+(R()-0.5)*0.12,z+R()*3);}
  RUAS3.info=info;return g.data();}
/* lixo: papel, jornal, folhas, papelão, sacolas, latas e garrafas */
const R3_NC=4;   // lixo em pedaços (4 x 4 na cidade): só desenha os pedaços perto da câmera
function r3Pedaco(x,z){const i=clamp(Math.floor((x-CIDADE.x0)/(CIDADE.x1-CIDADE.x0)*R3_NC),0,R3_NC-1),j=clamp(Math.floor((z-CIDADE.z0)/(CIDADE.z1-CIDADE.z0)*R3_NC),0,R3_NC-1);return j*R3_NC+i;}
function r3Lixo(){const GS=[];for(let k=0;k<R3_NC*R3_NC;k++)GS.push(new GB(1<<13,8));let g=GS[0];const R=rng(70829),info={papel:0,folhas:0,papelao:0,sacolas:0,latas:0,garrafas:0};
  const papel=[0xe8e4d8,0xd8d0b8,0xc8c0a8,0xb8bcc0,0xe0d8c8].map(lin),folha=[0x5a4224,0x6b4a26,0x4a3820,0x7a5a30,0x5e5030,0x6a5a34].map(lin),
    sacola=[0xe0e0dc,0x3a5a9a,0x1a1a1a,0x9a2a22,0xd8d0b0].map(lin),lata=[0xa8261e,0xc8c8c0,0x2a5a9a,0xd8a020].map(lin),vidro=[0x3a6a3a,0x6a4a2a,0x8a9a8a].map(lin);
  const peca=(x,z,y,tipo)=>{const yaw=R()*6.283;g=GS[r3Pedaco(x,z)];
    if(tipo==='papel'){const s=R()<0.3?1.5:1;add(g,boxTris(0.21*s,0.003,0.29*s),mat(x,y+0.003,z,(R()-0.5)*0.12,yaw,(R()-0.5)*0.12),papel[Math.floor(R()*papel.length)]);info.papel++;}
    else if(tipo==='folhas'){const n=5+Math.floor(R()*10);for(let k=0;k<n;k++){const a=R()*6.283,d=R()*0.45,s=0.06+R()*0.07;add(g,boxTris(s,0.003,s*1.5),mat(x+Math.cos(a)*d,y+0.003+R()*0.01,z+Math.sin(a)*d,(R()-0.5)*0.5,R()*6.283,(R()-0.5)*0.5),folha[Math.floor(R()*folha.length)]);}info.folhas++;}
    else if(tipo==='papelao'){add(g,boxTris(0.4+R()*0.4,0.012,0.3+R()*0.35),mat(x,y+0.006,z,(R()-0.5)*0.1,yaw,(R()-0.5)*0.1),lin(0x8a6a42),{j:0.08,rnd:R});info.papelao++;}
    else if(tipo==='sacola'){add(g,icoTris(0.13+R()*0.07,0.35,R),mm(mat(x,y+0.06,z,0,yaw,0),mat(0,0,0,0,0,0,1,0.55,1)),sacola[Math.floor(R()*sacola.length)]);info.sacolas++;}
    else if(tipo==='lata'){add(g,cylTris(0.033,0.033,0.12,8),mat(x,y+0.033,z,Math.PI/2,yaw,0),lata[Math.floor(R()*lata.length)]);info.latas++;}
    else{add(g,cylTris(0.035,0.035,0.24,8),mat(x,y+0.035,z,Math.PI/2,yaw,0),vidro[Math.floor(R()*vidro.length)]);info.garrafas++;}};
  const sorteia=()=>{const s=R();return s<0.34?'papel':s<0.58?'folhas':s<0.68?'papelao':s<0.8?'sacola':s<0.93?'lata':'garrafa';};
  /* no canto do meio-fio (do lado da rua) */
  const rua=(ew,ao,a)=>{const t0=ew?CIDADE.x0:CIDADE.z0,t1=ew?CIDADE.x1:CIDADE.z1,cruz=t=>(ew?RUAS_NS:RUAS_EW).some(r=>Math.abs(t-(ew?r.x:r.z))<r.a+0.8);
    for(const lado of[-1,1])for(let t=t0+1;t<t1-1;t+=0.9+R()*2.4){if(cruz(t))continue;const o=lado*(a-0.15-R()*0.6),x=ew?t:ao+o,z=ew?ao+o:t;if(r3Buraco(x,z,0.6)||pointBlocked(x,z,0.15))continue;peca(x,z,0.03,sorteia());}
    for(let i=0;i<(t1-t0)/7;i++){const t=t0+2+R()*(t1-t0-4);if(cruz(t))continue;const o=(R()-0.5)*(a*2-1),x=ew?t:ao+o,z=ew?ao+o:t;if(r3Buraco(x,z,0.6)||pointBlocked(x,z,0.15))continue;peca(x,z,0.03,R()<0.6?'papel':sorteia());}};
  for(const r of RUAS_EW)rua(true,r.z,r.a);for(const r of RUAS_NS)rua(false,r.x,r.a);
  /* nas calçadas, mais perto da parede do lote */
  for(const q of CID.quadras)for(const[x0,x1,z0,z1,ax]of r3Calcadas(q)){const L=ax?x1-x0:z1-z0;for(let i=0;i<L/2.6;i++){const t=R(),fundo=R()<0.65;
      const x=ax?x0+t*(x1-x0):(fundo?(x0<q.x0+1?x1-0.3:x0+0.3):x0+R()*(x1-x0)),z=ax?(fundo?(z0<q.z0+1?z1-0.3:z0+0.3):z0+R()*(z1-z0)):z0+t*(z1-z0);
      if(r3Buraco(x,z,0.6)||r3Predio(x,z,0.05)||pointBlocked(x,z,0.12))continue;peca(x,z,QUADRA_Y,sorteia());}}
  RUAS3.lixo_info=info;return GS.map((q,k)=>{const i=k%R3_NC,j=Math.floor(k/R3_NC),w=(CIDADE.x1-CIDADE.x0)/R3_NC,d=(CIDADE.z1-CIDADE.z0)/R3_NC;
    return{x:CIDADE.x0+(i+0.5)*w,z:CIDADE.z0+(j+0.5)*d,r:Math.hypot(w,d)/2,dados:q.n?q.data():null};});}
etapaMalha('fim','ruasDetalhe',2,()=>{try{RUAS3.chao=litMesh(r3Chao());RUAS3.lixo=r3Lixo().filter(q=>q.dados).map(q=>({x:q.x,z:q.z,r:q.r,m:litMesh(q.dados)}));}catch(e){console.error('ruas (desenho)',e);RUAS3.erro=String(e&&e.stack||e);}});
DESENHO.opaco.push(function ruasDetalhe(Pg){if(!RUAS3.chao)return;const cx=cam.pos[0],cz=cam.pos[2],fora=distCidade(cx,cz);if(fora>240)return;
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);drawStat(Pg,RUAS3.chao,ID);if(RUAS3.lixo&&fora<40)for(const q of RUAS3.lixo)if(Math.hypot(q.x-cx,q.z-cz)<q.r+55)drawStat(Pg,q.m,ID);gl.polygonOffset(0,0);gl.disable(gl.POLYGON_OFFSET_FILL);});
/* cor do chão num ponto da cidade (para a borda das manchas sumir no chão): asfalto, calçada ou o lote (pela cor de cada tipo) */
function r3CorChao(x,z){const q=quadraEm(x,z);if(!q)return lin(R3_ASF);const L=q.lote;if(!(x>L.x0&&x<L.x1&&z>L.z0&&z<L.z1))return lin(R3_CAL);
  const lt=q.tipoLote||'predio';return lin(lt==='estacionamento'?0x3d3d3b:lt==='praca'?0x46632d:lt==='terreno'?0x5c4a33:lt==='quintal'?0x56663a:lt==='patio'?0x5d5d58:0x77746b);}
/* manchas de terra e queimado do caos (62zt): borda suave em vez de borda dura */
{const _cm=caosMancha;caosMancha=function(g,x,z,r,cor,o){o=o||{};if(o.y!==undefined||!dentroCidade(x,z,-1))return _cm.apply(this,arguments);
  const R=o.R||Math.random,q=quadraEm(x,z),y=(q?QUADRA_Y+0.028:0.048)+(o.dy||0),fundo=r3CorChao(x,z);
  /* terra mais clara que o chão: mais apagada e com a borda bem larga (antes uma placa bege no meio da rua) */
  const lum=c=>c[0]*0.3+c[1]*0.59+c[2]*0.11,clara=lum(cor)>lum(fundo)*1.1,c2=clara?r3Mix(cor,fundo,0.45):cor;
  r3Mancha(g,x,z,y,r,c2,fundo,R,{n:o.n||14,ax:o.ax||1,az:o.az||1,rot:o.rot||0,miolo:clara?0.3:0.55,irreg:0.4});};}

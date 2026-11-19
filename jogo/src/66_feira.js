/* ================= Feira da Rua do Morro (v10.7.1, 19/11/2026) =================
   Pedido do Himalaia: "a cidade menos quadrada" (as 3 opções do mapa). A rua do meio do Bairro Residencial Norte, a que sobe para
   o buraco do tapume e para o Morro do Sabiá, virou a feira largada do dia em que tudo começou: barracas dos dois lados do asfalto,
   com lona colorida ou telha de zinco, balcão com o que sobrou (fruta, roupa, eletrônico, ferramenta, sapato, panela), caixotes
   empilhados, faixa da feira atravessando a rua e o corredor estreito no meio. O entulho e os carros que já estavam na rua ficam:
   as barracas se ajeitam em volta.
   · O balcão é obstáculo (correndo, passa por cima) e o teto das barracas é chão: do balcão dá para pular para o teto e correr por
     cima da feira. Lona cede um pouco (fica mais baixa no meio), telha de zinco não.
   · Algumas barracas ainda têm o que revistar (volta depois de uns dias). */
const FEIRA={x:4,ok:false,z0:63.6,z1:91.4,rua:255,barracas:[],malha:null,erro:null};
const FEIRA_TIPOS={frutas:{nome:'frutas',tab:'feiraFrutas'},roupas:{nome:'roupas',tab:'feiraRoupas'},eletronicos:{nome:'eletrônicos',tab:'feiraEletro'},
  ferramentas:{nome:'ferramentas',tab:'feiraFerramentas'},sapatos:{nome:'sapatos',tab:'feiraRoupas'},panelas:{nome:'utilidades',tab:'feiraUtil'}};
LOOT.feiraFrutas=[['laranja',1,3,0.5],['maca',1,3,0.45],['batata',1,2,0.35],['agua',1,1,0.3],['refri',1,1,0.25],['biscoito',1,2,0.3],['carneEstragada',1,1,0.15]];
LOOT.feiraRoupas=[['pano',2,4,0.7],['bone',1,1,0.15],['bandana',1,1,0.15],['camiseta',1,1,0.12],['bermuda',1,1,0.1],['cinto',1,1,0.08],['linha',1,2,0.25]];
LOOT.feiraEletro=[['pilhas',1,3,0.6],['fio',1,3,0.5],['fita',1,1,0.35],['lanterna',1,1,0.15],['isqueiro',1,1,0.25],['luminaria',1,1,0.06]];
LOOT.feiraFerramentas=[['pregos',2,6,0.6],['fita',1,1,0.35],['alicate',1,1,0.12],['martelo',1,1,0.1],['serrote',1,1,0.06],['corda',1,1,0.25],['sucata',1,2,0.35]];
LOOT.feiraUtil=[['garrafa',1,3,0.6],['vela',1,2,0.35],['isqueiro',1,1,0.2],['sal',1,1,0.25],['cafe',1,1,0.2],['cutelo',1,1,0.06],['pano',1,2,0.3]];
const FEIRA_LONAS=[[0x2f6fa8,0x2a5f92],[0xd8a020,0xb88618],[0xb83a2a,0x983024],[0x3a8a4a,0x2e7040],[0xd86a20,0xb85a1c],[0x7a4aa8,0x623c8a],[0xe8e4dc,0x2f6fa8]];
function feiraMontar(){const R=rng(77310),X=FEIRA.rua,info={barracas:0,saque:0};
  const tipos=Object.keys(FEIRA_TIPOS);
  for(const lado of[-1,1]){let z=FEIRA.z0+R()*0.9;
    while(z<FEIRA.z1-1.9){const w=1.9+R()*0.8,d=1.6+R()*0.35,cz=z+w/2,cx=X+lado*(FEIRA.x-d/2-0.05);
      if(pointBlocked(cx,cz,Math.max(w,d)*0.55)){z+=0.9;continue;}
      const b={id:FEIRA.barracas.length,cx,cz,w,d,lado,h:2.2+R()*0.35,tipo:tipos[Math.floor(R()*tipos.length)],telha:R()<0.35,lona:FEIRA_LONAS[Math.floor(R()*FEIRA_LONAS.length)],seed:Math.floor(R()*1e6)};
      const xf=cx-lado*d/2,y0=chaoEm(cx,cz,0.5);b.y0=y0;b.xf=xf;   // frente (corredor do meio) e chão
      /* balcão: 0,62 de fundo, 0,92 de altura, na frente da barraca */
      const xb=xf+lado*0.31;colBox(xb,cz,0.31,w/2,0,{solid:true,y0:y0-0.2,y1:y0+0.92,feira:true});supAdd({t:'ret',x:xb,z:cz,hw:0.31,hd:w/2,yaw:0,y:y0+0.92,dono:'feira'});
      for(const[sx,sz]of[[-1,-1],[-1,1],[1,-1],[1,1]])colCircle(cx+sx*(d/2-0.04),cz+sz*(w/2-0.04),0.05,{solid:true,y0:y0-0.2,y1:y0+b.h,feira:true});
      /* teto: chão inclinado (a frente mais alta); lona cede no meio, zinco fica reto */
      const hf=y0+b.h,ht=hf-0.38,ya=lado<0?ht:hf,yb=lado<0?hf:ht;b.hf=hf;b.ht=ht;
      supAdd({t:'ram',x:cx,z:cz,hw:w/2+0.12,hd:d/2+0.18,yaw:Math.PI/2,ya:ya-(b.telha?0:0.05),yb:yb-(b.telha?0:0.05),dono:'feira'});
      /* o que revistar: uma barraca em três */
      if(R()<0.38){const T=FEIRA_TIPOS[b.tipo];interAdd({id:'feira-'+b.id,kind:'bau',x:xf-lado*0.25,z:cz,y:y0,r:1.9,label:'Revistar a barraca de '+T.nome,sub:'o que sobrou da feira',tabela:T.tab,respawn:4});b.saque=true;info.saque++;}
      FEIRA.barracas.push(b);info.barracas++;z+=w+0.45+R()*0.9;}}
  /* caixotes empilhados atrás das barracas (no meio-fio) */
  FEIRA.caixotes=[];for(const b of FEIRA.barracas){if(R()<0.55)continue;const x=b.cx+b.lado*(b.d/2+0.45),z=b.cz+(R()-0.5)*b.w*0.6;if(pointBlocked(x,z,0.35))continue;
    const n=1+Math.floor(R()*3);FEIRA.caixotes.push({x,z,n,r:(R()-0.5)*0.5,y:chaoEm(x,z,0.5)});colBox(x,z,0.3,0.25,0,{solid:true,y0:-0.2,y1:0.45*n,feira:true});supAdd({t:'ret',x,z,hw:0.3,hd:0.25,yaw:0,y:FEIRA.caixotes[FEIRA.caixotes.length-1].y+0.45*n,dono:'feira'});}
  FEIRA.info=info;FEIRA.ok=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{feiraMontar();}catch(e){console.error('feira',e);FEIRA.erro=String(e&&e.stack||e);}return r;};}

/* ---------- desenho ---------- */
function feiraGeo(){const g=new GB(1<<15,8),R=rng(77311),B=(x0,x1,y0,y1,z0,z1,cor,o)=>{if(x1-x0<0.003||y1-y0<0.003||z1-z0<0.003)return;add(g,boxTris(x1-x0,y1-y0,z1-z0),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),typeof cor==='number'?lin(cor):cor,o);};
  const mad=0x6b4e30,ferro=0x4a4f52,J={j:0.06,rnd:R};
  for(const b of FEIRA.barracas){const{cx,cz,w,d,lado,y0,xf,hf,ht}=b,xa=Math.min(xf,cx+lado*d/2),xc=Math.max(xf,cx+lado*d/2),Rb=rng(b.seed);
    /* armação */
    for(const[sx,sz]of[[-1,-1],[-1,1],[1,-1],[1,1]]){const x=cx+sx*(d/2-0.04),z=cz+sz*(w/2-0.04),top=(x-xa)/(xc-xa||1);const yt=lado<0?lerp(ht,hf,top):lerp(hf,ht,top);B(x-0.03,x+0.03,y0,yt,z-0.03,z+0.03,b.telha?ferro:mad);}
    /* balcão e o que está nele */
    const xb=xf+lado*0.31,cB=b.tipo==='eletronicos'?0x3a3d40:mad;B(xb-0.31,xb+0.31,y0,y0+0.9,cz-w/2,cz+w/2,cB,J);B(xb-0.33,xb+0.33,y0+0.88,y0+0.93,cz-w/2-0.02,cz+w/2+0.02,0x8a6a45,J);
    const yt=y0+0.93,n=Math.max(2,Math.floor(w/0.45));
    for(let i=0;i<n;i++){const z=cz-w/2+0.25+i*(w-0.5)/(n-1||1),x=xb+(Rb()-0.5)*0.25;
      if(b.tipo==='frutas'){add(g,bvTris(0.38,0.12,0.3),mat(x,yt+0.06,z),lin(0x9a7448),J);const cf=[0xe8902a,0xc8282a,0xd8c030,0x6a9a2a][i%4];for(let k=0;k<5;k++)add(g,icoTris(0.045,0.2,Rb),mat(x+(Rb()-0.5)*0.26,yt+0.15,z+(Rb()-0.5)*0.2),lin(cf));}
      else if(b.tipo==='roupas'||b.tipo==='sapatos'){const c=[0x3a5a8a,0xa8261d,0xe8e4dc,0x2f2f2f,0xd8c050,0x5a7a4a][Math.floor(Rb()*6)];
        if(b.tipo==='roupas')for(let k=0;k<3;k++)add(g,bvTris(0.32,0.04,0.3),mat(x,yt+0.02+k*0.045,z,0,(Rb()-0.5)*0.4,0),lin(c),J);
        else for(let k=0;k<2;k++)add(g,bvTris(0.11,0.08,0.26),mat(x+(k-0.5)*0.13,yt+0.04,z),lin(c));}
      else if(b.tipo==='eletronicos'){add(g,bvTris(0.22,0.14+Rb()*0.12,0.16),mat(x,yt+0.1,z,0,(Rb()-0.5)*0.5,0),lin(Rb()<0.5?0x1d2023:0x5a5f62),J);if(Rb()<0.4)add(g,cylTris(0.04,0.04,0.02,10),mat(x,yt+0.22,z,Math.PI/2,0,0),lin(0x8d969a));}
      else if(b.tipo==='ferramentas'){add(g,bvTris(0.34,0.03,0.08),mat(x,yt+0.015,z,0,Rb()*3,0),lin(Rb()<0.5?0x8a2a22:0x9aa1a8));add(g,bvTris(0.06,0.06,0.06),mat(x+0.08,yt+0.03,z+0.05),lin(0x6b4e30));}
      else{add(g,cylTris(0.11,0.1,0.13,10),mat(x,yt,z),lin(Rb()<0.5?0x9aa1a8:0xa8261d),J);add(g,cylTris(0.115,0.115,0.015,10),mat(x,yt+0.13,z),lin(0x5a5f62));}}
    /* roupa pendurada (barraca de roupas) */
    if(b.tipo==='roupas'){const xr=cx+lado*(d/2-0.25);B(xr-0.015,xr+0.015,y0+1.85,y0+1.88,cz-w/2+0.1,cz+w/2-0.1,ferro);for(let k=0;k<Math.floor(w/0.42);k++){const z=cz-w/2+0.3+k*0.42;B(xr-0.01,xr+0.01,y0+1.25,y0+1.83,z-0.17,z+0.17,[0x3a5a8a,0xa8261d,0xe8e4dc,0xd8c050,0xd890a0][k%5]);}}
    /* teto: lona listrada (cede no meio) ou telha de zinco ondulada */
    const L=d+0.36,th=Math.atan2(hf-ht,L)*(lado<0?1:-1),ym=(hf+ht)/2;
    if(b.telha){for(let k=0;k<Math.round((w+0.24)/0.16);k++){const z=cz-w/2-0.12+k*0.16+0.08;add(g,boxTris(L,0.025,0.085),mat(cx,ym+0.01+(k%2)*0.018,z,0,0,th),lin(k%2?0x8d969a:0x7d868a));}}
    else{const nl=Math.max(3,Math.round((w+0.24)/0.35));for(let k=0;k<nl;k++){const z0=cz-w/2-0.12+k*(w+0.24)/nl,z1=z0+(w+0.24)/nl,c=b.lona[k%2],cede=-0.06*Math.sin(Math.PI*(k+0.5)/nl);
        add(g,boxTris(L,0.02,z1-z0),mat(cx,ym+cede,(z0+z1)/2,0,0,th),lin(c));}
      add(g,boxTris(0.02,0.18,w+0.24),mat(cx-lado*(L/2),hf-0.09,cz),lin(b.lona[0]));}}   // a aba da frente
  for(const c of FEIRA.caixotes)for(let k=0;k<c.n;k++)add(g,bvTris(0.58,0.42,0.48),mat(c.x+(R()-0.5)*0.05,c.y+0.21+k*0.45,c.z,0,c.r+(R()-0.5)*0.2,0),lin(k%2?0x9a7448:0x8a6a3a),{j:0.08,rnd:R});
  /* a faixa da feira atravessando a rua, nas duas pontas */
  for(const z of[FEIRA.z0-1.2,FEIRA.z1+0.6]){const X=FEIRA.rua;for(const s of[-1,1]){add(g,cylTris(0.06,0.07,4.4,7),mat(X+s*4.7,chaoEm(X+s*4.7,z,0.5),z),lin(0x6d6a62));colCircle(X+s*4.7,z,0.09,{solid:true,y0:-0.3,y1:4.4,feira:true});}
    B(X-4.3,X+4.3,3.55,4.25,z-0.015,z+0.015,0xe8e0c8);for(const sg of[-1,1])textoBlocos(g,mat(X,3.66,z+sg*0.03,0,sg>0?0:Math.PI,0),'FEIRA DO MORRO',0.085,0x23324a);}
  /* bandeirinhas atravessando a rua (de um poste de luz ao outro, caídas no meio) */
  {const cores=[0xd83a2a,0xe8c020,0x2f8ad8,0x3aa84a,0xe86ac0,0xe8e4dc];for(const z of[69.5,77.5,85.5]){const X=FEIRA.rua,a=[X-4.6,3.9,z+(R()-0.5)],b=[X+4.6,3.9,z+(R()-0.5)];
    for(const s of[-1,1]){const zp=s<0?a[2]:b[2];add(g,cylTris(0.045,0.05,4.0,6),mat(X+s*4.6,chaoEm(X+s*4.6,zp,0.5),zp),lin(0x6d6a62));colCircle(X+s*4.6,zp,0.07,{solid:true,y0:-0.3,y1:4,feira:true});}
    const n=26;let k=0;for(let i=0;i<=n;i++){const t=i/n,x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t)-Math.sin(Math.PI*t)*0.55,zz=lerp(a[2],b[2],t);
      if(i<n){const t2=(i+1)/n,x2=lerp(a[0],b[0],t2),y2=lerp(a[1],b[1],t2)-Math.sin(Math.PI*t2)*0.55,zz2=lerp(a[2],b[2],t2);add(g,cylTris(0.008,0.008,Math.hypot(x2-x,y2-y,zz2-zz),3),alignY(x,y,zz,x2-x,y2-y,zz2-zz),lin(0x2a2a2a));}
      if(i%2===1){add(g,[[[x-0.13,y,zz],[x+0.13,y,zz],[x,y-0.24,zz]]],ID,lin(cores[k++%cores.length]),{keepWind:true});add(g,[[[x+0.13,y,zz+0.002],[x-0.13,y,zz+0.002],[x,y-0.24,zz+0.002]]],ID,lin(cores[(k-1)%cores.length]),{keepWind:true});}}}}
  return g.data();}
etapaMalha('fim','feira',1,()=>{if(!FEIRA.ok)return;try{FEIRA.malha=litMesh(feiraGeo());}catch(e){console.error('feira (desenho)',e);FEIRA.erro=String(e&&e.stack||e);}});
DESENHO.opaco.push(function feiraDesenho(Pg){if(!FEIRA.malha)return;if(d2(FEIRA.rua,(FEIRA.z0+FEIRA.z1)/2,cam.pos[0],cam.pos[2])>220*220)return;drawStat(Pg,FEIRA.malha,ID);});
DESENHO.sombra.push(function feiraSombra(Pg,perto){if(!FEIRA.malha)return;if(d2(FEIRA.rua,(FEIRA.z0+FEIRA.z1)/2,P.x,P.z)>(perto?60:120)**2)return;drawStat(Pg,FEIRA.malha,ID);});
MAPA_DESENHOS.push(function mapaFeira(g,X,Y,k,n,range){if(!FEIRA.ok)return;if(range<1e3&&Math.hypot(P.x-FEIRA.rua,P.z-(FEIRA.z0+FEIRA.z1)/2)>range+30)return;
  for(const b of FEIRA.barracas){g.fillStyle=n>0.5?'#2c2a26':'#'+(b.telha?0x8d969a:b.lona[0]).toString(16).padStart(6,'0');g.fillRect(X(b.cx-b.d/2),Y(b.cz-b.w/2),Math.max(1,b.d*k),Math.max(1,b.w*k));}});
MAPA_NOMES.push(()=>FEIRA.ok?{t:'Feira',x:FEIRA.rua,z:(FEIRA.z0+FEIRA.z1)/2,px:6}:null);
/* primeira vez na feira: entra no diário */
let feiraT=0;
PASSOS.push(function feiraAviso(dt){feiraT-=dt;if(feiraT>0)return;feiraT=1;if(!FEIRA.ok||!P.alive||G.modo!=='jogo')return;
  if(Math.abs(P.x-FEIRA.rua)<6&&P.z>FEIRA.z0&&P.z<FEIRA.z1&&typeof diarioDescobre==='function'&&diarioDescobre('lugar','feira','Feira da Rua do Morro',20))
    toast('corpo','Feira da Rua do Morro: as barracas largadas no dia em que tudo começou. Algumas ainda têm o que revistar, e do balcão dá para subir no teto e correr por cima da feira.');});
{const b=BAIRROS.find(q=>q.nome==='Bairro Residencial Norte');if(b)b.desc='Bairro Residencial Norte: casas, uma mercearia, um estacionamento cheio de carros largados e a feira da rua que sobe para o Morro do Sabiá.';}

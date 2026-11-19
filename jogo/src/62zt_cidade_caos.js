/* ================= Cidade caótica (v10.3.3, 18/11/2026) =================
   Himalaia: "a cidade está muito organizada, torne ela caótica, bagunçada, prédios no chão, caídos".
   · TORRES CAÍDAS: duas torres que tombaram inteiras. O toco (os 2 andares de baixo) ficou de pé, quebrado em cima, com a
     laje pendurada para o lado da queda, e o resto do prédio está deitado no chão, partido em dois pedaços tortos: as janelas
     dos andares correm ao longo do comprimento (a fachada virou o teto), a mureta do telhado e a caixa-d'água ficaram na
     ponta, e tem entulho na quebra e dos lados. Uma caiu do estacionamento por cima da rua do norte (z = 58) e fecha aquele
     trecho; a outra caiu no pátio do nordeste por cima do fim da rua x = 305 (que já era sem saída).
   · ESQUELETOS: prédios de 3 andares sem as paredes, com metade desabada: pilares e lajes da metade de pé (com um painel ou
     outro caído), as lajes da outra metade empilhadas no chão e uma pendurada da beirada, tijolo nos vãos de cima.
     Dá para andar embaixo das lajes de pé (o térreo é aberto). Um na entrada oeste (perto da rua z = 58) e um na avenida.
   · PANQUECAS: prédios desabados em pilha de lajes, em terrenos livres sorteados.
   · RUAS: carcaças queimadas por todo lado (encostadas, atravessadas, capotadas ou de lado, nunca com lona), engavetamentos
     nos cruzamentos, ônibus e caminhões largados, entulho, tralha, postes caídos na rua, manchas de queimado embaixo das
     carcaças, terra e areia no meio-fio, manchas de terra pelos lotes, rachaduras e crateras no asfalto.
     A avenida do meio (z = 8) mantém a faixa central livre para o carro.
   · FACHADAS: montes de entulho caídos na frente de vários prédios (longe das portas).
   · FUMAÇA E BRASA: os escombros soltam fumaça escura (62zh) e têm brasas que brilham à noite.
   Tudo com sorteio fixo (o mundo é sempre o mesmo e os jogos salvos não mudam), concreto com a textura de pedra. */
const CAOS={ruinas:[],pronto:false,info:null,carros:[],moitas:[]};
const CAOS_EVITA=[[230,-14,24],[220,28,20]];   // hospital e Aurora (a cena do começo)
function caosLivre(x,z,r){if(x<CIDADE.x0+3||x>CIDADE.x1-3||z<CIDADE.z0+3||z>CIDADE.z1-3)return false;
  for(const p of CID.predios)if(x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r)return false;
  if(typeof BURACOS!=='undefined')for(const b of BURACOS)if(x>b.x0-r-0.6&&x<b.x1+r+0.6&&z>b.z0-r-0.6&&z<b.z1+r+0.6)return false;
  return!caosBloq(x,z,r);}
/* como o pointBlocked, mas sem o que é do metrô ou fica todo embaixo do chão (a estação passa embaixo de alguns lotes) */
function caosBloq(x,z,r){for(const c of colQuery(x,z,r+1)){if(!(c.solid||c.tree||c.entulho)||c.sub||c.metro||(c.y1!==undefined&&c.y1<-0.5))continue;
    if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return c;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,qx=clamp(lx,-c.hw,c.hw),qz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-qx,lz-qz)<r)return c;}}return null;}
function caosEvita(x,z,m){return CAOS_EVITA.some(e=>Math.hypot(e[0]-x,e[1]-z)<e[2]+(m||0));}
/* local → mundo no mesmo jeito do mat(): x local = (cos, -sen), z local = (sen, cos) */
function caosW(x,z,yaw,a,b){const c=Math.cos(yaw),s=Math.sin(yaw);return[x+a*c+b*s,z-a*s+b*c];}
/* um retângulo girado inteiro livre, amostrado de ~0,9 em 0,9 m (pega parede, carro e poste) */
function caosRet(x,z,yaw,hw,hd,r,passo){passo=passo||0.9;const nx=Math.max(1,Math.ceil(2*hw/passo)),nz=Math.max(1,Math.ceil(2*hd/passo));
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const w=caosW(x,z,yaw,-hw+2*hw*i/nx,-hd+2*hd*j/nz);if(!caosLivre(w[0],w[1],r))return false;}return true;}
/* a faixa do meio da avenida (z = 8) fica livre: nenhum canto da peça entra nela */
function caosNaFaixa(x,z,yaw,hw,hd){for(const[a,b]of[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd],[0,0]]){const w=caosW(x,z,yaw,a,b);if(Math.abs(w[1]-8)<3.3&&w[0]>CIDADE.x0-30)return true;}return false;}
const caosY=(x,z)=>ground(x,z)+(quadraEm(x,z)?QUADRA_Y:0);

/* ---------- ruas ---------- */
function caosRuas(){const R=rng(91091),P=CID.props,ids=['pneuVelho','tamborVelho','sacoLixo','caixaPapelao','sacoCimento','lixeiraVelha','caixaMadeira2','tambor'];
  const N={carros:0,entulhos:0,tralha:0,onibus:0,caminhoes:0,postes:0,engav:0};
  /* carcaça queimada: nunca com lona; uma em cada dez capotada e uma em cada oito de lado */
  const carro=(x,z,yaw)=>{if(caosEvita(x,z,3)||caosNaFaixa(x,z,yaw,1,2.2)||!caosRet(x,z,yaw,1.05,2.25,0.2,0.75))return false;const h=R(),vira=h<0.1?Math.PI:h<0.22?(h<0.16?1:-1)*Math.PI/2:0;
    P.push({k:'carro',x,z,yaw,cor:0x6b6f74,aberto:false,caos:true,vira});colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:vira?1.9:1.6,carro2:true});CAOS.carros.push([x,z,yaw]);N.carros++;return true;};
  const entulho=(x,z,r)=>{if(caosEvita(x,z,2)||caosNaFaixa(x,z,0,r,r)||!caosLivre(x,z,r+0.4))return false;P.push({k:'entulho',x,z,r,seed:R()});colCircle(x,z,r*0.8,{entulho:true,y0:-0.3,y1:1.4+r*0.3});N.entulhos++;return true;};
  const lixo=(x,z)=>{if(!caosLivre(x,z,0.45)||caosNaFaixa(x,z,0,0.4,0.4))return;const id=ids[Math.floor(R()*ids.length)],tomb=(id==='lixeiraVelha'||id==='tambor'||id==='tamborVelho')&&R()<0.6;
    P.push({k:'p3d',id,x,z,yaw:R()*6.283,rx:tomb?Math.PI/2:0,rz:0,dy:tomb?0.3:0,L:55});N.tralha++;};
  const grande=(k,x,z,yaw)=>{const bus=k==='onibus',hw=bus?1.3:1.25,hd=bus?5.8:4.1;if(caosEvita(x,z,6)||caosNaFaixa(x,z,yaw,hw,hd)||!caosRet(x,z,yaw,hw+0.1,hd+0.1,0.2,0.9))return false;
    const o={k,x,z,yaw};if(!bus)o.cor=[0x8a2a22,0x3d5a73,0xc9a227][Math.floor(R()*3)];P.push(o);colBox(x,z,hw,hd,yaw,{solid:true,y0:-0.2,y1:3.2,carro2:true});CAOS.carros.push([x,z,yaw]);bus?N.onibus++:N.caminhoes++;return true;};
  /* ao longo de todas as ruas: carcaças encostadas no meio-fio (e, nas ruas de bairro, umas atravessadas no meio), entulho e tralha */
  const longo=(ao,t0,t1,a,ew)=>{for(let t=t0;t<t1;t+=5+R()*7){const q=R(),meio=a<5&&R()<0.3,lado=R()<0.5?-1:1,off=meio?(R()-0.5)*a:lado*(a-1.1-R()*0.9),x=ew?t:ao+off,z=ew?ao+off:t;
      if(q<0.4){const base=ew?Math.PI/2:0,yaw=meio?R()*6.283:base+(R()-0.5)*(a>5?0.4:1.4)+(R()<0.5?Math.PI:0);carro(x,z,yaw);}
      else if(q<0.64)entulho(x,z,0.9+R()*1.1);
      else{const k=1+Math.floor(R()*3);for(let i=0;i<k;i++)lixo(x+(R()-0.5)*2.2,z+(R()-0.5)*2.2);}}};
  for(const r of RUAS_EW)longo(r.z,CIDADE.x0+5,CIDADE.x1-5,r.a,true);
  for(const r of RUAS_NS)longo(r.x,CIDADE.z0+5,CIDADE.z1-5,r.a,false);
  /* engavetamentos: 3 a 5 carcaças batidas umas nas outras em cada cruzamento (na avenida, só nas esquinas) */
  for(const e of RUAS_EW)for(const n of RUAS_NS){const av=e.a>5,k=av?2:3+Math.floor(R()*3);let f=0;
    for(let t=0;t<40&&f<k;t++){const ang=R()*6.283,d=1.5+R()*(av?6:5),x=n.x+Math.cos(ang)*d,z=e.z+Math.sin(ang)*d;if(carro(x,z,R()*6.283))f++;}if(f>=2)N.engav++;}
  /* ônibus queimados atravessados (um por rua de bairro, onde couber) e caminhões largados */
  for(const r of[...RUAS_EW.filter(q=>q.a<5).map(q=>({ew:1,c:q.z,a:q.a})),...RUAS_NS.map(q=>({ew:0,c:q.x,a:q.a}))])for(let i=0;i<14;i++){
    const t=(r.ew?CIDADE.x0:CIDADE.z0)+18+R()*((r.ew?CIDADE.x1-CIDADE.x0:CIDADE.z1-CIDADE.z0)-36),x=r.ew?t:r.c+(R()-0.5)*r.a,z=r.ew?r.c+(R()-0.5)*r.a:t;
    if(grande('onibus',x,z,(r.ew?Math.PI/2:0)+(R()-0.5)*0.9))break;}
  for(let i=0,k=0;i<60&&k<3;i++){const ew=R()<0.5,rr=ew?RUAS_EW[R()<0.5?0:2]:RUAS_NS[Math.floor(R()*3)],t=(ew?CIDADE.x0:CIDADE.z0)+15+R()*((ew?CIDADE.x1-CIDADE.x0:CIDADE.z1-CIDADE.z0)-30),
      c=ew?rr.z:rr.x,off=(R()<0.5?-1:1)*(rr.a-1.6),x=ew?t:c+off,z=ew?c+off:t;if(grande('caminhao',x,z,(ew?Math.PI/2:0)+(R()-0.5)*0.5+(R()<0.5?Math.PI:0)))k++;}
  /* postes caídos: do meio-fio para dentro da rua, com a luminária batida no asfalto (sem colisão: dá para passar por cima) */
  for(let i=0,k=0;i<80&&k<9;i++){const ew=R()<0.5,rr=ew?RUAS_EW[R()<0.5?0:2]:RUAS_NS[Math.floor(R()*3)],lado=R()<0.5?-1:1,t=(ew?CIDADE.x0:CIDADE.z0)+8+R()*((ew?CIDADE.x1-CIDADE.x0:CIDADE.z1-CIDADE.z0)-16),
      c=(ew?rr.z:rr.x)+lado*(rr.a+0.8),x=ew?t:c,z=ew?c:t,yaw=(ew?(lado<0?0:Math.PI):(lado<0?Math.PI/2:-Math.PI/2))+(R()-0.5)*0.6;
    const pe=caosW(x,z,yaw,0,3.5);if(!caosLivre(x,z,0.6)||!caosLivre(pe[0],pe[1],0.4)||caosEvita(x,z,2))continue;
    P.push({k:'p3d',id:'poste',x,z,yaw,rx:Math.PI/2,rz:0,dy:0.22,s:[1.3,1.3,1.3],L:110});k++;N.postes++;}
  // calçadas: tralha encostada nos prédios
  for(let i=0;i<260;i++){const x=CIDADE.x0+R()*(CIDADE.x1-CIDADE.x0),z=CIDADE.z0+R()*(CIDADE.z1-CIDADE.z0),q=quadraEm(x,z);if(!q)continue;const l=q.lote;if(x>l.x0&&x<l.x1&&z>l.z0&&z<l.z1)continue;lixo(x,z);}
  return N;}
/* as carcaças desta cidade são sempre a carcaça queimada (nunca com lona), capotada ou de lado quando sorteado */
{const _pr=prpRua;prpRua=function(o){if(o&&o.k==='carro'&&o.caos&&prpOk()&&prpTem('L:carroDestruido')){const y=quadraEm(o.x,o.z)?QUADRA_Y:0,v=o.vira||0;
    prpReg(PRP.rua,'L:carroDestruido',o.x,y+(Math.abs(v)>2?1.29:v?1.11:0),o.z,o.yaw+Math.PI/2,[1,1,1],v,0,1,150);return true;}
  return _pr.apply(this,arguments);};}

/* ---------- geometria dos escombros ---------- */
function caosConcreto(R){return mixc(lin(0x8a877f),lin(0x6f6c65),R());}
function caosPedacos(g,R,cx,cy,cz,raio,n,alto){for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*raio,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,k=1-d/raio,s=0.25+R()*0.9*(0.4+k);
    add(g,icoTris(s,0.55,R),mat(x,cy+s*0.35+k*alto*R(),z,R()*3,R()*6,R()*3,1,0.55+R()*0.4,1),caosConcreto(R),{j:0.12,rnd:R});}}
function caosFerro(g,R,x,y,z,n){const fe=lin(0x5a3a26);for(let i=0;i<n;i++){const L=0.6+R()*1.6;add(g,cylTris(0.018,0.018,L,4),alignY(x+(R()-0.5)*0.8,y,z+(R()-0.5)*0.8,(R()-0.5)*1.6,0.6+R(),(R()-0.5)*1.6),fe);}}
/* brasa no meio do entulho: vermelho apagado de dia, brilha à noite */
function caosBrasas(g,R,cx,cy,cz,raio,n){for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*raio;add(g,icoTris(0.07+R()*0.12,0.5,R),mat(cx+Math.cos(a)*d,cy+0.1+R()*0.5,cz+Math.sin(a)*d,R()*3,R()*6,0),mixc(lin(0x7a2410),lin(0x9a3a12),R()),{e:0.55+R()*0.4});}}
/* mancha no chão (queimado, terra, areia): um polígono torto colado no asfalto ou na calçada, com a normal para cima */
function caosMancha(g,x,z,r,cor,o){o=o||{};const R=o.R||Math.random,n=o.n||12,ax=o.ax||1,az=o.az||1,c=Math.cos(o.rot||0),s=Math.sin(o.rot||0),pts=[];
  for(let i=0;i<n;i++){const a=i/n*6.283,k=r*(0.62+0.38*R()),lx=Math.cos(a)*k*ax,lz=Math.sin(a)*k*az;pts.push([x+lx*c+lz*s,z-lx*s+lz*c]);}
  const yy=o.y!==undefined?()=>o.y:(px,pz)=>ground(px,pz)+(quadraEm(px,pz)?0.178:0.048)+(o.dy||0),cy=yy(x,z),tris=[];
  for(let i=0;i<n;i++){const A=pts[i],B=pts[(i+1)%n];tris.push([[x,cy,z],[B[0],yy(B[0],B[1]),B[1]],[A[0],yy(A[0],A[1]),A[1]]]);}
  add(g,tris,ID,cor,{nrm:[0,1,0],keepWind:true});}

/* prédio desabado em panqueca: as lajes empilhadas e tortas, pilares quebrados, um pedaço de parede de pé e o entulho em volta */
function caosPanqueca(g,R,cx,cz,yaw,W,D,n){const base=mat(cx,ground(cx,cz)+QUADRA_Y,cz,0,yaw,0),C=caosConcreto,y0=0;let y=0.3;
  for(let i=0;i<n;i++){const w=W*(0.92-i*0.04),d=D*(0.9-i*0.05),rx=(R()-0.5)*0.22,rz=(R()-0.5)*0.26,ox=(R()-0.5)*1.4,oz=(R()-0.5)*1.4;
    if(i===n-1){for(const s of[-1,1])add(g,boxTris(w/2-0.15,0.3,d),mm(base,mat(ox+s*w/4,y+0.25+(s>0?0.5:0),oz,rx,0,rz+s*0.32)),C(R),{j:0.08,rnd:R});}
    else add(g,boxTris(w,0.32,d),mm(base,mat(ox,y,oz,rx,0,rz)),C(R),{j:0.08,rnd:R});
    for(let k=0;k<5;k++){const ex=(R()-0.5)*w,ez=(R()<0.5?-1:1)*d/2;add(g,cylTris(0.02,0.02,0.5+R()*0.8,4),mm(base,alignY(ox+ex,y,oz+ez,(R()-0.5)*0.6,R()*0.5,ez*0.3)),lin(0x5a3a26));}
    y+=0.55+R()*0.35;}
  for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const h=1.2+R()*2.6;add(g,boxTris(0.45,h,0.45),mm(base,mat(sx*(W/2-0.6),h/2,sz*(D/2-0.6),(R()-0.5)*0.3,0,(R()-0.5)*0.3)),C(R),{j:0.08,rnd:R});
    add(g,cylTris(0.02,0.02,0.9,4),mm(base,mat(sx*(W/2-0.6)+0.1,h,sz*(D/2-0.6),0.3,0,0.2)),lin(0x5a3a26));}
  /* o pedaço de parede de pé, com as janelas vazadas (dois andares) */
  {const wl=Math.min(W*0.7,9),hh=6.4,t=0.3,zf=D/2+0.2,col=mixc(lin(0xb9a68e),lin(0x8a7d6a),R()*0.5);
    for(let f=0;f<2;f++){const yb=f*3.2;add(g,boxTris(wl,0.9,t),mm(base,mat(-W*0.12,yb+0.45,zf)),col,{j:0.06,rnd:R});add(g,boxTris(wl,0.7,t),mm(base,mat(-W*0.12,yb+2.85,zf)),col,{j:0.06,rnd:R});
      for(let j=0;j<=3;j++)add(g,boxTris(0.7,1.5,t),mm(base,mat(-W*0.12-wl/2+0.35+j*(wl-0.7)/3,yb+1.65,zf)),col,{j:0.06,rnd:R});}
    for(let j=0;j<4;j++)add(g,boxTris(1.4,0.5+R()*1.2,t),mm(base,mat(-W*0.12-wl/2+0.7+j*1.9,hh+0.2,zf,0,0,(R()-0.5)*0.3)),col);}   // a beirada quebrada em cima
  caosPedacos(g,R,cx,y0+QUADRA_Y,cz,Math.max(W,D)*0.72,150,1.6);caosBrasas(g,R,cx,y+0.2,cz,W*0.3,8);
  caosMancha(g,cx,cz,Math.max(W,D)*0.72,lin(0x3a352f),{R,dy:-0.002});
  return y+0.6;}

/* torre caída: o toco de pé no terreno (2 andares inteiros e o 3º quebrado, aberto para o lado da queda) e o resto do prédio
   deitado, partido em dois, rolado de lado: a fachada de vidro em faixas virou o teto, as faixas dos lados correm em pé ao longo
   do comprimento (cada uma era um andar) e as pontas quebradas mostram o escuro de dentro.
   T = {x, z: centro do toco; dir: para onde caiu (yaw); Wd: largura; Dp: fundura (vira a altura do corpo deitado);
        lA, lB: comprimento dos dois pedaços; tw: torção do pedaço de longe} */
const CAOS_TORRE={hA:3.2,base:6.4,h3:3.0};
function caosTorreCabe(T){const{x,z,dir,Wd,Dp,lA,lB}=T,tot=lA+lB+1.4,z0=Dp/2+1.3;
  if(!caosRet(x,z,dir,Wd/2+0.6,Dp/2+0.6,0.4))return false;const c=caosW(x,z,dir,0,z0+tot/2+1);return caosRet(c[0],c[1],dir,Wd/2+2.4,tot/2+2.6,0.4);}
function caosTorre(g,R,T){const{x:sx,z:sz,dir,Wd,Dp,lA,lB}=T,tw=T.tw||0.16,{hA,base,h3}=CAOS_TORRE,yq=caosY(sx,sz),B=mat(sx,yq,sz,0,dir,0);
  const C=mixc(lin(0x9ba3a8),lin(0x8a9399),R()),C2=lin(0x646c72),vid=lin(0x16212c),esc=lin(0x0b0d0f),fu=lin(0x1c1a18),fe=lin(0x5a3a26);
  /* ---- o toco: 2 andares inteiros com a faixa de vidro em volta ---- */
  add(g,boxTris(Wd,base,Dp),mm(B,mat(0,base/2,0)),C,{j:0.04,rnd:R});
  for(let f=0;f<2;f++){const yc=f?hA+1.65:1.35,hh=f?1.45:2.2;
    for(const s of[-1,1]){add(g,boxTris(Wd-0.7,hh,0.06),mm(B,mat(0,yc,s*Dp/2)),vid);add(g,boxTris(0.06,hh,Dp-0.7),mm(B,mat(s*Wd/2,yc,0)),vid);}
    if(f)add(g,boxTris(Wd+0.12,0.22,Dp+0.12),mm(B,mat(0,f*hA,0)),C2);}
  add(g,boxTris(Wd+0.12,0.26,Dp+0.12),mm(B,mat(0,base,0)),C2);   // a laje do 3º andar (o chão do que quebrou)
  /* o 3º andar quebrado: a parede de trás inteira, os lados baixando até sumir no lado da queda, pilares tortos, ferro */
  {const yb=base+0.13;add(g,boxTris(Wd,h3+0.4,0.3),mm(B,mat(0,yb+(h3+0.4)/2,-Dp/2+0.15)),C,{j:0.05,rnd:R});
    add(g,boxTris(Wd-0.7,1.45,0.06),mm(B,mat(0,yb+1.55,-Dp/2)),vid);
    {let h=0.9+R()*0.6;for(let x=-Wd/2+0.18;x<Wd/2-0.1;x+=0.36){h=clamp(h+(R()-0.5)*0.55,0.1,1.8);add(g,boxTris(0.38,h,0.3),mm(B,mat(x,yb+h3+0.4+h/2-0.05,-Dp/2+0.15)),C,{j:0.05,rnd:R});}}   // a beirada de cima, quebrada em degraus tortos
    for(const s of[-1,1]){let e=(R()-0.5)*0.5;for(let z=-Dp/2+0.3;z<Dp/2-0.1;z+=0.36){const k=(z+Dp/2)/Dp;e=clamp(e+(R()-0.5)*0.45,-0.8,0.8);const h=Math.max(0.12,(h3+0.4)*(1-k*1.1)+e);
      add(g,boxTris(0.3,h,0.38),mm(B,mat(s*(Wd/2-0.15),yb+h/2,z)),C,{j:0.05,rnd:R});}}
    for(const[px,pz]of[[-Wd/2+0.4,Dp/2-0.4],[Wd/2-0.4,Dp/2-0.4],[0,Dp/2-0.4],[-Wd/6,0.2],[Wd/6,-0.3]]){const h=0.6+R()*1.6;add(g,boxTris(0.42,h,0.42),mm(B,mat(px,yb+h/2,pz,(R()-0.5)*0.25,0,(R()-0.5)*0.25)),C2,{j:0.05,rnd:R});
      const w=xf(B,px,yb+h,pz);caosFerro(g,R,w[0],w[1],w[2],4);}
    add(g,boxTris(Wd*0.75,0.3,3.0),mm(B,mat((R()-0.5)*1.5,base-1.2,Dp/2+0.95,0.95,0,(R()-0.5)*0.2)),caosConcreto(R),{j:0.08,rnd:R});   // a laje de cima, pendurada para fora
    for(let i=0;i<6;i++)add(g,boxTris(0.8+R()*1.6,0.04,0.8+R()*1.6),mm(B,mat((R()-0.5)*(Wd-1.2),yb+0.01,(R()-0.5)*(Dp-1.2),0,R()*3,0)),fu);
    const w=xf(B,0,yb,0.6);caosPedacos(g,R,w[0],w[1],w[2],2.2,30,0.7);caosBrasas(g,R,w[0],w[1],w[2],2.0,7);}
  /* ---- o corpo deitado ---- */
  const seg=(z0,len,o)=>{const ro=o.roll||0,s0=(o.sink||0.2)+Wd/2*Math.abs(Math.sin(ro)),M=mm(B,mat(o.dx||0,o.lev||0,z0,o.pitch||0,o.twist||0,ro)),top=Dp-s0,yc=Dp/2-s0,nf=Math.max(1,Math.round(len/hA));
    add(g,boxTris(Wd,Dp,len),mm(M,mat(0,yc,len/2)),C,{j:0.04,rnd:R});
    for(let k=0;k<nf;k++){const zc=(k+0.5)*len/nf;
      add(g,boxTris(Wd-0.7,0.06,1.45),mm(M,mat(0,top,zc)),vid);   // a faixa de vidro da fachada, agora virada para o céu
      for(const s of[-1,1])add(g,boxTris(0.06,Dp-0.7,1.45),mm(M,mat(s*Wd/2,yc,zc)),vid);   // e a dos lados, em pé (cada uma era um andar)
      if(k){add(g,boxTris(Wd+0.1,0.1,0.22),mm(M,mat(0,top+0.03,k*len/nf)),C2);for(const s of[-1,1])add(g,boxTris(0.1,Dp,0.22),mm(M,mat(s*(Wd/2+0.03),yc,k*len/nf)),C2);}}
    for(let i=0;i<4;i++)add(g,boxTris(1.2+R()*2.4,0.04,1+R()*2.6),mm(M,mat((R()-0.5)*(Wd-1.5),top+0.012,R()*len,0,R()*3,0)),fu);   // fuligem
    for(let i=0;i<4;i++){if(R()<0.5)continue;const zc=(Math.floor(R()*nf)+0.5)*len/nf;add(g,boxTris(1+R()*1.6,0.1,1.2),mm(M,mat((R()-0.5)*(Wd-2),top-0.02,zc)),esc);}   // um buraco ou outro no vidro
    return{M,yc,top};};
  const quebra=(S,zf,sg)=>{const M=S.M,dz=[M[8]*sg,M[9]*sg,M[10]*sg];   // ponta quebrada: o escuro de dentro, lajes saindo, ferro para fora
    add(g,boxTris(Wd-0.7,Dp-0.7,0.06),mm(M,mat(0,S.yc,zf+sg*0.02)),esc);
    for(let i=0;i<5;i++)add(g,boxTris(Wd*(0.35+R()*0.4),0.28,0.8+R()*1.2),mm(M,mat((R()-0.5)*Wd*0.5,S.yc+(R()-0.5)*(Dp-1),zf+sg*(0.3+R()*0.6),(R()-0.5)*0.6,(R()-0.5)*0.4,(R()-0.5)*0.5)),caosConcreto(R),{j:0.08,rnd:R});
    for(let i=0;i<9;i++){const w=xf(M,(R()-0.5)*Wd*0.9,S.yc+(R()-0.5)*(Dp-0.8),zf);add(g,cylTris(0.022,0.022,0.7+R()*1.3,4),alignY(w[0],w[1],w[2],dz[0]+(R()-0.5)*0.9,dz[1]+(R()-0.5)*0.9,dz[2]+(R()-0.5)*0.9),fe);}};
  const z0=Dp/2+1.3,lev=2.0,SA=seg(z0,lA,{lev,pitch:Math.asin(clamp((lev+0.4)/lA,0,0.5)),roll:0.15});
  const zB=z0+lA+1.4,SB=seg(zB,lB,{dx:0.5,twist:tw,roll:-0.11,sink:0.4});
  quebra(SA,0,-1);quebra(SA,lA,1);quebra(SB,0,-1);
  /* a ponta do telhado: a mureta (agora de pé), a caixa-d'água caída, a casa de máquinas e a antena torta */
  {const M=SB.M,par=(w,h,x,y)=>add(g,boxTris(w,h,0.9),mm(M,mat(x,y,lB+0.45)),C2,{j:0.05,rnd:R});
    par(Wd,0.32,0,SB.top-0.16);par(Wd,0.32,0,SB.yc-Dp/2+0.16);for(const s of[-1,1])par(0.32,Dp,s*(Wd/2-0.16),SB.yc);
    add(g,boxTris(2.4,Dp*0.45,1.6),mm(M,mat(-Wd*0.18,SB.yc+Dp*0.1,lB+0.8)),C,{j:0.05,rnd:R});   // a casa de máquinas do elevador, agora de lado
    add(g,boxTris(2.6,2.2,2.2),mm(M,mat(Wd*0.22,SB.yc-Dp/2+1.0,lB+2.3,0.15,0.5,0.3)),lin(0x7f8a8f),{j:0.06,rnd:R});
    const w=xf(M,-Wd*0.3,SB.top-0.6,lB+0.9);add(g,cylTris(0.05,0.05,6,5),alignY(w[0],w[1],w[2],M[8]+0.3,-0.22,M[10]),lin(0x6b6f72));}
  /* entulho: entre o toco e o corpo, na quebra do meio, no telhado e espalhado dos lados */
  {const w=caosW(sx,sz,dir,0,Dp/2+0.8);caosPedacos(g,R,w[0],caosY(w[0],w[1]),w[1],3.6,130,2.8);caosBrasas(g,R,w[0],caosY(w[0],w[1])+0.6,w[1],2.2,6);}
  {const w=caosW(sx,sz,dir,0,z0+lA+0.7);caosPedacos(g,R,w[0],caosY(w[0],w[1]),w[1],3.0,90,2.0);}
  {const w=xf(SB.M,0,0,lB+1.8);caosPedacos(g,R,w[0],caosY(w[0],w[2]),w[2],3.2,60,1.0);}
  for(let i=0;i<80;i++){const t=z0+R()*(lA+lB+1.4),s=R()<0.5?-1:1,w=caosW(sx,sz,dir,s*(Wd/2+0.3+R()*1.9),t);
    add(g,icoTris(0.2+R()*0.55,0.55,R),mat(w[0],caosY(w[0],w[1])+0.12,w[1],R()*3,R()*6,R()*3,1,0.6,1),caosConcreto(R),{j:0.1,rnd:R});}
  {const c=caosW(sx,sz,dir,0,(z0+lA+lB+1.4)/2+1);caosMancha(g,c[0],c[1],(lA+lB)/2+2.5,lin(0x3a352f),{R,ax:(Wd/2+2.5)/((lA+lB)/2+2.5),az:1,rot:dir,n:18,dy:-0.002});}
  /* colisão: o toco, os dois pedaços e os montes de entulho */
  colBox(sx,sz,Wd/2,Dp/2,dir,{solid:true,y0:-0.3,y1:base+h3+1,entulho:true});
  {const c=caosW(sx,sz,dir,0,z0+lA/2);colBox(c[0],c[1],Wd/2,lA/2,dir,{solid:true,y0:-0.3,y1:Dp+lev,entulho:true});}
  {const c=caosW(sx,sz,dir,0.5+Math.sin(tw)*lB/2,zB+Math.cos(tw)*lB/2);colBox(c[0],c[1],Wd/2,lB/2,dir+tw,{solid:true,y0:-0.3,y1:Dp,entulho:true});}
  for(const t of[Dp/2+0.8,z0+lA+0.7]){const w=caosW(sx,sz,dir,0,t);colCircle(w[0],w[1],2.5,{entulho:true,y0:-0.3,y1:2.4});}
  const q=caosW(sx,sz,dir,0,z0+lA+0.7);CAOS.ruinas.push({x:sx,z:sz,y:base+h3+1,tipo:'torre'},{x:q[0],z:q[1],y:Dp*0.8,tipo:'torre (quebra)'});}

/* esqueleto: pilares e lajes sem parede, metade de pé (x local > 0) e metade desabada (lajes empilhadas no chão, uma pendurada) */
function caosEsqueleto(g,R,cx,cz,yaw,W,D,n){const B=mat(cx,caosY(cx,cz),cz,0,yaw,0),hA=3.2,Cc=lin(0x8d8980),tij=mixc(lin(0x8c5a42),lin(0x9a8a74),R()*0.6),reb=lin(0xb3a58e),vid=lin(0x16191c);
  const nx=2*Math.max(1,Math.round(W/7)),nz=Math.max(2,Math.round(D/3.4)),dx=W/nx,dz=D/nz,topo=n*hA;
  /* pilares: os da metade de pé até em cima (com ferro na ponta), os da outra quebrados baixos */
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const x=-W/2+i*dx,z=-D/2+j*dz,de=i>=nx/2,h=de?topo+0.3+R()*0.9:0.5+R()*1.7;
    add(g,boxTris(0.42,h,0.42),mm(B,mat(x,h/2,z,de?0:(R()-0.5)*0.2,0,de?0:(R()-0.5)*0.2)),Cc,{j:0.05,rnd:R});const w=xf(B,x,h,z);caosFerro(g,R,w[0],w[1],w[2],de?3:5);
    if(de){const c=caosW(cx,cz,yaw,x,z);colCircle(c[0],c[1],0.3,{solid:true,y0:-0.3,y1:h});}}
  /* lajes da metade de pé, com um painel ou outro caído (mais em cima); a borda do lado que caiu fica com ferro para fora */
  for(let f=1;f<=n;f++){const y=f*hA;for(let i=nx/2;i<nx;i++)for(let j=0;j<nz;j++){if(R()<0.06+0.07*f&&!(f===1&&i===nx/2))continue;
      add(g,boxTris(dx+0.04,0.26,dz+0.04),mm(B,mat(-W/2+(i+0.5)*dx,y,-D/2+(j+0.5)*dz,(R()-0.5)*0.02,0,(R()-0.5)*0.02)),caosConcreto(R),{j:0.06,rnd:R});}
    for(let j=0;j<5;j++){const w=xf(B,0.05,y,-D/2+R()*D);add(g,cylTris(0.02,0.02,0.6+R()*1.0,4),alignY(w[0],w[1],w[2],-B[0]*1-0.0,-0.3-R()*0.5,-B[2]+(R()-0.5)*0.5),lin(0x5a3a26));}}
  /* tijolo nos vãos de cima da fachada de pé (com a janela vazada); o térreo fica aberto */
  for(let f=1;f<n;f++){const yb=f*hA+0.13,yt=(f+1)*hA-0.13,hh=yt-yb;
    const vao=(M2,larg)=>{if(R()<0.3)return;add(g,boxTris(larg,0.9,0.22),mm(M2,mat(0,yb+0.45,0)),R()<0.7?tij:reb,{j:0.08,rnd:R});add(g,boxTris(larg,0.55,0.22),mm(M2,mat(0,yt-0.28,0)),tij,{j:0.08,rnd:R});
      for(const s of[-1,1])add(g,boxTris(larg*0.22,hh-1.45,0.22),mm(M2,mat(s*larg*0.39,yb+0.9+(hh-1.45)/2,0)),tij,{j:0.08,rnd:R});
      add(g,boxTris(larg*0.56,hh-1.45,0.05),mm(M2,mat(0,yb+0.9+(hh-1.45)/2,-0.02)),vid);};
    for(let i=nx/2;i<nx;i++)for(const s of[-1,1])vao(mm(B,mat(-W/2+(i+0.5)*dx,0,s*D/2,0,s>0?Math.PI:0,0)),dx-0.42);
    for(let j=0;j<nz;j++)vao(mm(B,mat(W/2,0,-D/2+(j+0.5)*dz,0,-Math.PI/2,0)),dz-0.42);}
  /* a metade que desabou: as lajes empilhadas no chão, tortas, e a de cima pendurada da beirada da metade de pé */
  let yp=0.3;for(let k=0;k<n;k++){add(g,boxTris(W/2*(0.95-k*0.05),0.3,D*(0.95-k*0.04)),mm(B,mat(-W/4+(R()-0.5)*0.9,yp,(R()-0.5)*0.9,(R()-0.5)*0.2,(R()-0.5)*0.15,(R()-0.5)*0.24)),caosConcreto(R),{j:0.08,rnd:R});yp+=0.5+R()*0.3;}
  for(const f of[n,n-1]){if(f<1)continue;const x1=0,y1=f*hA-0.15,x2=-W*0.32,y2=yp+0.1,L=Math.hypot(x1-x2,y1-y2),th=Math.atan2(y1-y2,x1-x2);
    add(g,boxTris(L,0.26,D*(f===n?0.5:0.35)),mm(B,mat((x1+x2)/2,(y1+y2)/2,(f===n?-0.2:0.3)*D,0,0,th)),caosConcreto(R),{j:0.08,rnd:R});}
  const pc=caosW(cx,cz,yaw,-W/4,0);caosPedacos(g,R,pc[0],caosY(pc[0],pc[1]),pc[1],W*0.42,150,1.8);caosBrasas(g,R,pc[0],caosY(pc[0],pc[1])+yp*0.6,pc[1],W*0.2,7);
  for(let i=0;i<40;i++){const w=caosW(cx,cz,yaw,(R()-0.5)*(W+3),(R()<0.5?-1:1)*(D/2+0.4+R()*1.6));add(g,icoTris(0.15+R()*0.4,0.55,R),mat(w[0],caosY(w[0],w[1])+0.1,w[1],R()*3,R()*6,R()*3,1,0.6,1),caosConcreto(R),{j:0.1,rnd:R});}
  caosMancha(g,cx,cz,Math.max(W,D)*0.66,lin(0x3a352f),{R,ax:1,az:D/W+0.25,rot:yaw,n:16,dy:-0.002});
  colBox(pc[0],pc[1],W/4+0.6,D/2+0.4,yaw,{solid:true,y0:-0.3,y1:yp+0.8,entulho:true});
  CAOS.ruinas.push({x:pc[0],z:pc[1],y:yp+1,tipo:'esqueleto'});}

/* paredes desabando: montes de entulho encostados nas paredes dos prédios (frente, fundos e lados), longe das portas */
function caosFachadas(g,R){let n=0;for(const p of CID.predios){if(p.casa||p.rural||!p.W||!p.D)continue;const k=1+(R()<0.55?1:0)+((p.andares||1)>2&&R()<0.5?1:0);
    for(let t=0,f=0;t<8&&f<k;t++){const lado=Math.floor(R()*4),a=0.12+R()*0.76,u=lado<2?a*p.W:lado===2?-1.6:p.W+1.6,v=lado<2?(lado===0?-1.6:p.D+1.6):a*p.D;
      const w=pw(p,u,v),r=1.3+R()*1.3,h=0.9+R()*1.3;
      if(!caosLivre(w[0],w[1],0.7)||caosEvita(w[0],w[1],2)||(p.entradas||[]).some(e=>Math.hypot(e.x-w[0],e.z-w[1])<r+1.4))continue;
      caosPedacos(g,R,w[0],caosY(w[0],w[1]),w[1],r,30+Math.floor(r*14),h);
      if(lado<2){const b2=pw(p,u,lado===0?-0.6:p.D+0.6);add(g,boxTris(r*1.2,0.26,2.0),mat(b2[0],caosY(b2[0],b2[1])+h*0.7,b2[1],lado===0?0.9:-0.9,p.yaw,(R()-0.5)*0.4),caosConcreto(R),{j:0.08,rnd:R});}
      caosFerro(g,R,w[0],caosY(w[0],w[1])+h*0.8,w[1],4);caosMancha(g,w[0],w[1],r*1.2,lin(0x48433a),{R,dy:-0.002});
      colCircle(w[0],w[1],r*0.6,{entulho:true,y0:-0.3,y1:h+0.3});f++;n++;}}return n;}
/* telhados: manchas de chuva e de mofo, fuligem de incêndio e entulho solto (de cima a cidade deixa de ser cinza liso) */
function caosTelhados(g,R){let n=0;for(const p of CID.predios){if(p.casa||p.rural||!p.W||!p.D||!p.yTopo)continue;const y=p.yTopo+0.014,k=4+Math.floor(R()*4);
    for(let i=0;i<k;i++){const u=1+R()*(p.W-2),v=1+R()*(p.D-2),w=pw(p,u,v),r=0.8+R()*Math.min(2.6,p.W*0.16);caosMancha(g,w[0],w[1],r,mixc(lin(0x4f4c46),lin(0x403e3a),R()),{R,y,ax:0.6+R()*0.9,az:0.6+R()*0.9,rot:R()*3});n++;}
    if(R()<0.55){const w=pw(p,1.5+R()*(p.W-3),1.5+R()*(p.D-3));caosMancha(g,w[0],w[1],1.2+R()*1.6,lin(0x201e1b),{R,y:y+0.004,n:14});caosPedacos(g,R,w[0],y-0.1,w[1],1.3,14,0.3);n++;}
    if(R()<0.6){const w=pw(p,1.2+R()*(p.W-2.4),1.2+R()*(p.D-2.4));caosPedacos(g,R,w[0],y-0.12,w[1],0.9+R()*0.8,10,0.25);}}
  return n;}
/* mato tomando conta: moitas no pé das paredes, nos cantos dos lotes, nas calçadas rachadas e no meio do entulho, e árvores
   novas crescendo nos terrenos (vão para a lista da rua: mesmas árvores da praça) */
function caosMato(gV,R){const P=CID.props,verde=[lin(0x3b5528),lin(0x4a6230),lin(0x56683a),lin(0x34482a),lin(0x66663a)];let nM=0,nA=0;
  const moita=(x,z,esc)=>{if(!dentroCidade(x,z,-1.5)||!caosLivre(x,z,0.35)||CAOS.moitas.some(m=>Math.abs(m[0]-x)<1.4&&Math.abs(m[1]-z)<1.4))return false;CAOS.moitas.push([x,z,clamp(0.55+esc*0.3,0.6,1.15),R()<0.3]);nM++;return true;};
  // no pé das paredes dos prédios (frente, fundos e lados)
  for(const p of CID.predios){if(p.rural||!p.W||!p.D)continue;const k=1+Math.floor(R()*3);for(let i=0;i<k;i++){const lado=Math.floor(R()*4),a=R(),u=lado<2?a*p.W:lado===2?-0.55:p.W+0.55,v=lado<2?(lado===0?-0.55:p.D+0.55):a*p.D;
      if((p.entradas||[]).some(e=>{const w=pw(p,u,v);return Math.hypot(e.x-w[0],e.z-w[1])<1.6;}))continue;const w=pw(p,u,v);moita(w[0],w[1],0.8+R()*0.6);}}
  // calçadas, cantos de lote e beira do meio-fio
  for(let i=0;i<120;i++){const x=CIDADE.x0+2+R()*(CIDADE.x1-CIDADE.x0-4),z=CIDADE.z0+2+R()*(CIDADE.z1-CIDADE.z0-4);if(!quadraEm(x,z)||caosEvita(x,z,1))continue;moita(x,z,0.7+R()*0.9);}
  // no meio do entulho das ruínas
  for(const q of CAOS.ruinas)for(let i=0;i<5;i++){const a=R()*6.283,d=3+R()*5;moita(q.x+Math.cos(a)*d,q.z+Math.sin(a)*d,0.8+R()*0.7);}
  // árvores novas nos terrenos e nas calçadas
  for(let t=0;t<400&&nA<16;t++){const x=CIDADE.x0+4+R()*(CIDADE.x1-CIDADE.x0-8),z=CIDADE.z0+4+R()*(CIDADE.z1-CIDADE.z0-8);if(!quadraEm(x,z)||caosEvita(x,z,4)||!caosLivre(x,z,1.6))continue;
    if(CAOS.ruinas.some(q=>Math.hypot(q.x-x,q.z-z)<6))continue;if(P.some(o=>o.k==='arvore'&&Math.hypot(o.x-x,o.z-z)<5))continue;
    P.push({k:'arvore',x,z,s:0.55+R()*0.4,seed:R()});colCircle(x,z,0.3,{y0:-0.2,y1:6,tree:true});nA++;}
  return{moitas:nM,arvores:nA};}
/* acha um terreno livre de W×D dentro dos lotes das quadras (sem prédio, árvore, carro nem poste) */
function caosTerreno(W,D,R,evita,sep){const cand=[];for(const q of CID.quadras){const l=q.lote;for(let i=0;i<40;i++){const x=l.x0+W/2+1+R()*Math.max(0,l.x1-l.x0-W-2),z=l.z0+D/2+1+R()*Math.max(0,l.z1-l.z0-D-2);
      if(evita.some(e=>Math.hypot(e[0]-x,e[1]-z)<(sep||26))||caosEvita(x,z,6))continue;if(caosRet(x,z,0,W/2,D/2,0.6,1))cand.push([x,z]);if(cand.length>30)break;}}
  return cand.length?cand[Math.floor(R()*cand.length)]:null;}

/* o chão: queimado embaixo das carcaças, terra no meio-fio, manchas pelos lotes, rachaduras e crateras no asfalto */
function caosChao(g){const R=rng(60606),N={manchas:0,rachaduras:0,crateras:0},queim=[lin(0x131110),lin(0x1a1714),lin(0x221d18)],terra=[lin(0x4b463c),lin(0x524b3f),lin(0x46433b),lin(0x58513f),lin(0x434339)];
  const ok=(x,z,r)=>{if(!dentroCidade(x,z,-2))return false;for(const p of CID.predios)if(x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r)return false;
    if(typeof BURACOS!=='undefined')for(const b of BURACOS)if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false;return true;};
  const asf=(x,z)=>dentroCidade(x,z,-1)&&!quadraEm(x,z);
  for(const[x,z,yaw]of CAOS.carros)if(R()<0.6&&ok(x,z,2)){caosMancha(g,x,z,2.2+R()*1.2,queim[Math.floor(R()*3)],{R,ax:0.8,az:1.35,rot:yaw});N.manchas++;}
  const meioFio=(ao,t0,t1,a,ew)=>{for(let t=t0;t<t1;t+=3+R()*7){if(R()<0.3)continue;const lado=R()<0.5?-1:1,off=lado*(a-0.4-R()*0.6),x=ew?t:ao+off,z=ew?ao+off:t;if(!ok(x,z,1))continue;
      const L=2.0+R()*1.4;caosMancha(g,x,z,0.8+R()*1.0,terra[Math.floor(R()*terra.length)],{R,ax:ew?L:0.5,az:ew?0.5:L});N.manchas++;}};
  for(const r of RUAS_EW)meioFio(r.z,CIDADE.x0+3,CIDADE.x1-3,r.a,true);for(const r of RUAS_NS)meioFio(r.x,CIDADE.z0+3,CIDADE.z1-3,r.a,false);
  for(let i=0;i<150;i++){const x=CIDADE.x0+3+R()*(CIDADE.x1-CIDADE.x0-6),z=CIDADE.z0+3+R()*(CIDADE.z1-CIDADE.z0-6),r=1.0+R()*1.9;if(!ok(x,z,r*0.6))continue;
    caosMancha(g,x,z,r,R()<0.25?queim[Math.floor(R()*3)]:terra[Math.floor(R()*terra.length)],{R,ax:0.7+R()*0.8,az:0.7+R()*0.8,rot:R()*3});N.manchas++;}
  const rach=lin(0x1e1d1b);   // v10.8.3: cinza-escuro (antes quase preto)
  for(let i=0;i<300;i++){let x=CIDADE.x0+R()*(CIDADE.x1-CIDADE.x0),z=CIDADE.z0+R()*(CIDADE.z1-CIDADE.z0);if(!asf(x,z))continue;let a=R()*6.283;const segs=3+Math.floor(R()*6);
    for(let k=0;k<segs*2;k++){const L=0.3+R()*0.75;a+=(R()-0.5)*1.6;const x2=x+Math.cos(a)*L,z2=z+Math.sin(a)*L;if(!asf(x2,z2))break;   // v10.8.3: finas e tortas (antes listras grossas)
      add(g,boxTris(0.016+R()*0.022,0.01,L+0.03),mat((x+x2)/2,0.046,(z+z2)/2,0,Math.atan2(x2-x,z2-z),0),rach);x=x2;z=z2;}N.rachaduras++;}
  for(let i=0;i<80&&N.crateras<7;i++){const ew=R()<0.6,rr=ew?RUAS_EW[Math.floor(R()*3)]:RUAS_NS[Math.floor(R()*3)],t=(ew?CIDADE.x0:CIDADE.z0)+12+R()*((ew?CIDADE.x1-CIDADE.x0:CIDADE.z1-CIDADE.z0)-24),
      off=(R()-0.5)*(rr.a-2.2)*2,x=ew?t:(rr.x+off),z=ew?(rr.z+off):t;if(!asf(x,z)||Math.abs(z-8)<6.6||!caosLivre(x,z,2.8)||caosEvita(x,z,4))continue;
    caosMancha(g,x,z,2.8+R()*0.5,lin(0x1d1b19),{R,n:14});caosMancha(g,x,z,1.8+R()*0.5,lin(0x0c0b0a),{R,n:14,dy:0.004});   // a borda chamuscada e o buraco
    for(let j=0;j<18;j++){const a=R()*6.283,d=2.1+R()*1.2;add(g,boxTris(0.5+R()*0.8,0.08,0.4+R()*0.6),mat(x+Math.cos(a)*d,0.09,z+Math.sin(a)*d,(R()-0.5)*0.6,R()*3,(R()-0.5)*0.6),lin(0x2c2c2a),{j:0.06,rnd:R});}   // asfalto levantado
    N.crateras++;}
  return N;}

/* ---------- montagem: os prédios no chão primeiro (precisam de terreno e rua livres), depois as ruas e o chão ---------- */
function caosMontar(){const R=rng(52525),g=new GB(1<<16,8),info={torres:[],esqueletos:[],panquecas:[]},evita=[];
  /* as torres caídas, nos lugares escolhidos (se algum dia não couber, fica sem) */
  for(const T of[{x:291,z:68.6,dir:Math.PI,Wd:8,Dp:7,lA:11,lB:10,tw:0.17},{x:327.5,z:85,dir:-Math.PI/2-0.18,Wd:8,Dp:7,lA:8.5,lB:6.4,tw:-0.14}]){
    if(!caosTorreCabe(T)){info.torres.push(['não coube',T.x,T.z]);continue;}caosTorre(g,R,T);evita.push([T.x,T.z]);const f=caosW(T.x,T.z,T.dir,0,T.Dp/2+12);evita.push(f);info.torres.push([Math.round(T.x),Math.round(T.z)]);}
  /* os esqueletos: um na entrada oeste, um na beira da avenida */
  for(const E of[{x:185,z:43,yaw:0,W:14,D:9,n:3},{x:291,z:-9.5,yaw:0,W:12,D:9,n:3}]){if(!caosRet(E.x,E.z,E.yaw,E.W/2+0.8,E.D/2+0.8,0.5,0.9)){info.esqueletos.push(['não coube',E.x,E.z]);continue;}
    caosEsqueleto(g,R,E.x,E.z,E.yaw,E.W,E.D,E.n);evita.push([E.x,E.z]);info.esqueletos.push([E.x,E.z]);}
  /* as panquecas, em terrenos livres sorteados */
  for(let k=0;k<3;k++){const W=9+R()*3,D=8+R()*2,p=caosTerreno(W+2,D+2,R,evita,22);if(!p)continue;evita.push(p);const yaw=(R()-0.5)*0.3,top=caosPanqueca(g,R,p[0],p[1],yaw,W,D,5+Math.floor(R()*2));
    colBox(p[0],p[1],W/2,D/2,yaw,{solid:true,y0:-0.3,y1:top,entulho:true});CAOS.ruinas.push({x:p[0],z:p[1],y:top,tipo:'panqueca'});info.panquecas.push([Math.round(p[0]),Math.round(p[1])]);}
  try{CAOS.infoRuas=caosRuas();}catch(e){console.error('cidade caótica (ruas)',e);}
  try{info.chao=caosChao(g);}catch(e){console.error('cidade caótica (chão)',e);}
  try{info.fachadas=caosFachadas(g,R);}catch(e){console.error('cidade caótica (fachadas)',e);}
  try{info.telhados=caosTelhados(g,R);}catch(e){console.error('cidade caótica (telhados)',e);}
  const gV=new GB(1<<14,8);try{info.mato=caosMato(gV,R);}catch(e){console.error('cidade caótica (mato)',e);}
  if(g.n){const f=g.data();let m=null;try{if(typeof itxMalha==='function'&&typeof ITX_DADOS!=='undefined'&&ITX_DADOS.pedra)m=itxMalha('caos',f,0.8,true,'pedra');}catch(e){m=null;}
    CAOS.malha=m||litMesh(f);info.tris=g.n/3|0;}
  if(gV.n){const mv=litMesh(gV.data());if(CAOS.malha){const ps=CAOS.malha.partes?CAOS.malha.partes.slice():[CAOS.malha];ps.push(mv);CAOS.malha={partes:ps,vao:ps[0].vao,count:ps[0].count,itx:true};}else CAOS.malha=mv;info.trisMato=gV.n/3|0;}
  CAOS.info=info;}
{const _gr=gerarRua;gerarRua=function(){const r=_gr.apply(this,arguments);
  if(!CAOS.pronto){CAOS.pronto=true;try{caosMontar();}catch(e){console.error('cidade caótica',e);}}return r;};}
{const _gc=gerarCidade;gerarCidade=function(){const r=_gc.apply(this,arguments);
  try{if(typeof RUINA!=='undefined')for(const q of CAOS.ruinas)RUINA.fumacas.push({x:q.x+0.6,z:q.z-0.6,y:q.y,acc:0,taxa:1.1});}catch(e){console.error('cidade caótica (fumaça)',e);}return r;};}
/* as moitas da cidade entram no fim da lista de moitas, depois de toda a vegetação (os números das outras não mudam; o jogo
   salvo guarda as colhidas pelo número). Três em cada dez dão fruta. */
{const _pv=placeVegetation;placeVegetation=function(){const r=_pv.apply(this,arguments);
  try{const R=rng(7171);for(const[x,z,s,fr]of CAOS.moitas)BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s,r:R()*6.283,frutas:fr,cresce:0,t:0.85+R()*0.3,cidade:true});CAOS.nMoitas=CAOS.moitas.length;}
  catch(e){console.error('cidade caótica (moitas)',e);}return r;};}
const _MCAOS=M4();
DESENHO.opaco.push(function caosDesenho(Pg){if(!CAOS.malha||!dentroCidade(cam.pos[0],cam.pos[2],260))return;trs(_MCAOS,0,0,0,0,0,0,1,1,1);drawStat(Pg,CAOS.malha,_MCAOS);});
DESENHO.sombra.push(function caosSombra(Pg,perto){if(!CAOS.malha||!dentroCidade(P.x,P.z,perto?80:200))return;trs(_MCAOS,0,0,0,0,0,0,1,1,1);drawStat(Pg,CAOS.malha,_MCAOS);});

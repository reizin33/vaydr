/* ================= Morro do Sabiá: a favela no morro atrás da cidade (v10.6.0, 19/11/2026) =================
   Pedido do Himalaia: "faça igual a jogabilidade e o mapa do jogo [Dying Light] ... hoje o nosso mapa anda tudo junto quadrado".
   Fase do mapa: um bairro denso no morro, para correr por cima. Atrás da cidade (saindo pelo buraco do tapume no fim da rua
   x = 255) a encosta virou o Morro do Sabiá:
   · a Escadaria do Sabiá sobe do tapume até o Largo, lá em cima; duas escadinhas sobem pelos lados;
   · casas de alvenaria coladas umas nas outras, de 1 a 3 andares, em fileiras na encosta. As de baixo são mais altas, para a laje
     de uma ficar perto da altura da casa de cima. Laje de concreto com mureta, caixa-d'água azul, ferro de espera, puxadinho,
     varal e antena; tijolo à mostra (com pilar e viga de concreto) ou reboco pintado; janela com grade; portão de ferro;
   · as lajes são chão: correndo dá para subir na casa de 1 andar (64_parkour), passar de laje em laje, pular os becos, atravessar
     pelas tábuas largadas entre as lajes e subir pela escada de marinheiro de algumas casas;
   · casas abertas (portas, móveis, gavetas e moradores, como as da vila) e, no Largo, o Mercadinho e o Bar;
   · a caixa-d'água do morro, a torre mais alta: lá em cima, segure E para observar (o morro e a cidade entram no mapa);
   · caixa de ferramentas, isopor e mochila esquecidos nas lajes (saque que volta), zumbis nos becos e alguns dormindo nas lajes.
   O mundo de antes nasce igual: o morro entra no fim do buildWorld (as árvores e pedras da volta da cidade que ficavam ali saem)
   e o mapa só cresce depois (MORRO_LIGADO). As árvores novas entram no fim da lista, com números novos (jogos salvos valem). */
const MORRO={x0:192,x1:308,z0:94.2,zTopo:168,esc:255,escW:2.6,FH:2.85,fil0:99.6,dFil:7.6,franja:6.0,escs:[212,233,278,297]};
let MORRO_LIGADO=false;
const MOR={ok:false,erro:null,info:null,casas:[],predios:[],escadas:[],tabuas:[],pontos:[],lajeZ:[],saques:[],chunks:[],reservas:[],extras:[],largo:null,torre:null,seed:61021};
const MOR_COR={reboco:[0xd9c9a6,0xc9d4bc,0xa9c2cc,0xe2bfae,0xe6dca2,0xdcd8cc,0xa7bca0,0xcf8f6a,0xb9b0d0,0xe8e0d0,0x9fc0b0,0xe0a87a],
  tijolo:[0xa95f3e,0xb3683f,0x9c5536,0xb87048,0xa2593a],concreto:0x8f8b84,laje:0x8a8780,base:0x77726a,
  portas:[0x3d5a73,0x7a2a22,0x2f5a3a,0x5a5a5a,0x8a6a2a,0x6b4e30,0x2a3a5a,0xb0a890],jan:[0x6b4a32,0x3d5a73,0x2f5a3a,0xd8d0c0,0x7a2a22],
  janela:0x15171a,grade:0x2a2a2a,caixa:[0x2f6fa8,0x2a64a0,0x3a78b0],amianto:0x9a9a92};
function morroTopo(x){return MORRO.zTopo+3.0*Math.sin(x*0.083+1.1)+1.8*Math.sin(x*0.21+0.4);}
/* dentro do morro (com folga m para dentro); morroNucleo: onde ficam as casas e as escadas (a franja de mata fica em volta) */
function dentroMorro(x,z,m=0){return x>MORRO.x0+m&&x<MORRO.x1-m&&z>MORRO.z0-1&&z<morroTopo(x)-m;}
function morroNucleo(x,z,m=0){const f=MORRO.franja;return x>MORRO.x0+f+m&&x<MORRO.x1-f-m&&z>MORRO.z0-1&&z<morroTopo(x)-f-m;}
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){return _dm(x,z,m)||(MORRO_LIGADO&&dentroMorro(x,z,m));};}
/* a mata fechada do fim do mapa contorna o morro (os pontos da volta da cidade que ficaram para dentro somem no bordaPontosCalc) */
{const _bc=bordaCandidatos;bordaCandidatos=function(){const L=_bc.apply(this,arguments),ds=1.7,zA=ANEL.z1-3;
  for(let z=zA;z<=morroTopo(MORRO.x0);z+=ds)L.push([MORRO.x0,z,-1,0]);
  for(let z=zA;z<=morroTopo(MORRO.x1);z+=ds)L.push([MORRO.x1,z,1,0]);
  for(let x=MORRO.x0;x<=MORRO.x1;x+=ds){const z=morroTopo(x),dz=morroTopo(x+0.5)-morroTopo(x-0.5),l=Math.hypot(dz,1);L.push([x,z,-dz/l,1/l]);}
  return L;};}
const morroPick=(R,L)=>L[Math.floor(R()*L.length)%L.length];
function morroEsc(c,k){const r=(c>>16)&255,g=(c>>8)&255,b=c&255;return(Math.round(r*k)<<16)|(Math.round(g*k)<<8)|Math.round(b*k);}
const morroPw=(h,u,v)=>[h.cx+u*h.c+v*h.s,h.cz-u*h.s+v*h.c];
/* chão mais baixo e mais alto num retângulo girado (16 pontos) */
function morroChaoRet(cx,cz,W,D,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);let mx=-1e9,mn=1e9;
  for(let i=0;i<=3;i++)for(let j=0;j<=3;j++){const u=-W/2+W*i/3,v=-D/2+D*j/3,g=ground(cx+u*c+v*s,cz-u*s+v*c);if(g>mx)mx=g;if(g<mn)mn=g;}
  return[mn,mx];}
function morroLivre(x0,x1,z0,z1){for(const r of MOR.reservas)if(x1>r.x0&&x0<r.x1&&z1>r.z0&&z0<r.z1)return false;return true;}
function morroAabb(cx,cz,W,D,yaw){const c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw)),hx=W/2*c+D/2*s,hz=W/2*s+D/2*c;return[cx-hx,cx+hx,cz-hz,cz+hz];}

/* ---------- limpar o lugar (árvores, pedras, moitas, coletáveis e capim da volta da cidade que ficavam onde nasce o morro) ---------- */
function morroLimpar(info){const cm=new Map();for(const c of COLL){if(c.tree)cm.set(c.tree,c);else if(c.rock)cm.set(c.rock,c);}
  const f=MORRO.franja,limpa=(x,z,m)=>x>MORRO.x0+f-m&&x<MORRO.x1-f+m&&z>MORRO.z0-0.6&&z<morroTopo(x)-f+m;let n=0;
  for(const t of TREES)if(!t.agua&&limpa(t.x,t.z,1.5)){t.agua=true;t.alive=false;colRemove(cm.get(t));n++;}
  for(const r of ROCKS)if(!r.agua&&limpa(r.x,r.z,1)){r.agua=true;r.alive=false;colRemove(cm.get(r));n++;}
  for(const b of BUSHES)if(!b.agua&&limpa(b.x,b.z,0.8)){b.agua=true;b.frutas=false;n++;}
  for(const p of PICKS)if(!p.agua&&limpa(p.x,p.z,0.5)){p.agua=true;p.alive=false;n++;}
  for(const L of[GRASS,FLORES])for(const b of L)if(b.y>-900&&limpa(b.x,b.z,0.3)){b.y=-999;n++;}
  if(typeof SAMAMBAIAS!=='undefined')for(const b of SAMAMBAIAS)if(b.y>-900&&limpa(b.x,b.z,0.3)){b.y=-999;n++;}
  info.limpos=n;}

/* ---------- escadarias: x fixo, de z0 a z1, largura w. O perfil acompanha o chão mais alto na largura e só sobe; lances de 1 m
   ('ram'; 'ret' onde é plano). Os degraus de desenho ficam por cima da rampa (os pés não afundam) ---------- */
function morroEscada(x,z0,z1,w,nome,yFim){const n=Math.max(2,Math.round(z1-z0)),dz=(z1-z0)/n,ys=[];
  for(let i=0;i<=n;i++){const z=z0+i*dz;let g=-1e9;for(const dx of[-w/2,-w/4,0,w/4,w/2])g=Math.max(g,ground(x+dx,z));ys.push(g+0.1);}
  for(let i=1;i<=n;i++)ys[i]=Math.max(ys[i],ys[i-1]);
  if(yFim!==undefined){for(let i=n;i>=0;i--)ys[i]=Math.max(ys[i],yFim-(n-i)*dz*0.7);ys[n]=Math.max(ys[n],yFim);}   // chega na altura do Largo (no máximo 35° por lance)
  const E={x,z0,z1,w,n,dz,ys,nome,yEm(z){const t=clamp((z-this.z0)/this.dz,0,this.n-1e-6),i=Math.floor(t);return lerp(this.ys[i],this.ys[i+1],t-i);}};
  for(let i=0;i<n;i++){const za=z0+i*dz,ya=ys[i],yb=ys[i+1];
    supAdd(yb-ya<0.02?{t:'ret',x,z:za+dz/2,hw:w/2,hd:dz/2,yaw:0,y:yb,dono:'morroEsc'}:{t:'ram',x,z:za+dz/2,hw:w/2,hd:dz/2,yaw:0,ya,yb,dono:'morroEsc'});}
  MOR.escadas.push(E);MOR.reservas.push({x0:x-w/2-0.9,x1:x+w/2+0.9,z0:z0-1,z1:z1+0.6});return E;}

/* ---------- casas (cascas fechadas: corpo, laje andável, mureta, caixa-d'água, puxadinho, escada de marinheiro) ---------- */
function morroCasaNova(o,R){const h=Object.assign({id:MOR.casas.length,vizE:null,vizD:null},o);h.c=Math.cos(h.yaw);h.s=Math.sin(h.yaw);
  const[mn,mx]=morroChaoRet(h.cx,h.cz,h.W,h.D,h.yaw);h.yMin=mn;h.gMax=mx;h.base=mx+0.15;
  const gUp=ground(h.cx,h.cz+h.D/2+3.6);let n=Math.round((gUp-h.base)/MORRO.FH+0.75+(R()-0.5)*0.9);if(R()<0.2)n++;if(h.fil===0&&R()<0.35)n=Math.max(n,2);
  h.n=clamp(n,1,3);h.yTop=h.base+h.n*MORRO.FH;
  h.tijolo=R()<0.32;h.misto=!h.tijolo&&h.n>1&&R()<0.5;h.cor=h.tijolo?morroPick(R,MOR_COR.tijolo):morroPick(R,MOR_COR.reboco);h.corTijolo=morroPick(R,MOR_COR.tijolo);
  h.corPorta=morroPick(R,MOR_COR.portas);h.corJan=morroPick(R,MOR_COR.jan);h.janTipo=R()<0.5?0:R()<0.6?1:2;
  h.mapaCor=h.tijolo?'#9a5f42':'#b4a68a';
  const W=h.W,D=h.D,ocup=[];h.ocup=ocup;
  h.livre=(u0,u1,v0,v1)=>u0>-W/2+0.25&&u1<W/2-0.25&&v0>-D/2+0.25&&v1<D/2-0.25&&!ocup.some(q=>u1>q[0]&&u0<q[1]&&v1>q[2]&&v0<q[3]);
  /* puxadinho: um quartinho em cima da laje, num canto, rente às paredes */
  if(h.n<3&&W>4.6&&D>4.6&&R()<0.24){const pw=2.3+R()*0.9,pd=2.1+R()*0.6,su=R()<0.5?-1:1,sv=R()<0.6?1:-1,u0=su<0?-W/2:W/2-pw,v0=sv<0?-D/2:D/2-pd;
    h.puxa={u0,u1:u0+pw,v0,v1:v0+pd,su,sv,tij:R()<0.6};ocup.push([u0-0.35,u0+pw+0.35,v0-0.35,v0+pd+0.35]);}
  if(R()<0.74)for(let t=0;t<10;t++){const u=(R()-0.5)*(W-2.0),v=(R()-0.5)*(D-2.0);if(h.livre(u-0.8,u+0.8,v-0.8,v+0.8)){h.caixa={u,v,cor:R()<0.86?morroPick(R,MOR_COR.caixa):MOR_COR.amianto};ocup.push([u-0.85,u+0.85,v-0.85,v+0.85]);break;}}
  h.mureta=R()<0.5?0.32+R()*0.14:R()<0.3?0.95:0;h.ferro=!h.puxa&&R()<0.5;
  if(R()<0.26)for(let t=0;t<6;t++){const u=(R()-0.5)*(W-1.2),v=(R()-0.5)*(D-1.2);if(h.livre(u-0.3,u+0.3,v-0.3,v+0.3)){h.antena={u,v,prato:R()<0.5,rot:R()*6.28};ocup.push([u-0.35,u+0.35,v-0.35,v+0.35]);break;}}
  if(R()<0.32)for(let t=0;t<6;t++){const len=2.2+R()*1.0,rot=R()<0.5?0:Math.PI/2,hu=rot?0.4:len/2+0.1,hv=rot?len/2+0.1:0.4,u=(R()-0.5)*(W-2*hu-0.6),v=(R()-0.5)*(D-2*hv-0.6);
    if(h.livre(u-hu,u+hu,v-hv,v+hv)){h.varal={u,v,len,rot};ocup.push([u-hu,u+hu,v-hv,v+hv]);break;}}
  h.coisas=[];const ks=['vaso','vaso','botijao','tanque','cadeira','churrasqueira','balde','lixo'];
  for(let i=0,nc=Math.floor(R()*3.2);i<nc;i++)for(let t=0;t<6;t++){const u=(R()-0.5)*(W-1.2),v=(R()-0.5)*(D-1.2);if(h.livre(u-0.45,u+0.45,v-0.45,v+0.45)){h.coisas.push({k:morroPick(R,ks),u,v,r:R()*6.28});ocup.push([u-0.5,u+0.5,v-0.5,v+0.5]);break;}}
  h.ladoPorta=h.fil===0?'f':'t';h.portaJ=0;h.porao=R()<0.65;
  MOR.casas.push(h);return h;}
/* lados da mureta (retângulos locais), fora dos lados colados */
function morroMuretas(h){const W=h.W,D=h.D,e=0.15,L=[[-W/2,W/2,-D/2,-D/2+e],[-W/2,W/2,D/2-e,D/2]];if(!h.vizE)L.push([-W/2,-W/2+e,-D/2+e,D/2-e]);if(!h.vizD)L.push([W/2-e,W/2,-D/2+e,D/2-e]);return L;}
function morroCasaColisao(h,R){const Y=h.yTop,W=h.W,D=h.D;
  colBox(h.cx,h.cz,W/2,D/2,h.yaw,{solid:true,y0:h.yMin-1.2,y1:Y-0.45,morro:true});   // o topo do colisor fica abaixo da laje: degrau pequeno entre lajes vizinhas sobe a pé
  h.sup=supAdd({t:'ret',x:h.cx,z:h.cz,hw:W/2+0.1,hd:D/2+0.1,yaw:h.yaw,y:Y,dono:'morro'});
  const Lr=(u0,u1,v0,v1,y,y0)=>{const c=morroPw(h,(u0+u1)/2,(v0+v1)/2);if(y0!==undefined)colBox(c[0],c[1],(u1-u0)/2,(v1-v0)/2,h.yaw,{solid:true,y0,y1:y,morro:true});
    supAdd({t:'ret',x:c[0],z:c[1],hw:(u1-u0)/2,hd:(v1-v0)/2,yaw:h.yaw,y,dono:'morro'});};
  if(h.mureta>0)for(const m of morroMuretas(h))Lr(m[0],m[1],m[2],m[3],Y+h.mureta,h.mureta>0.6?Y:undefined);
  if(h.puxa){const q=h.puxa;Lr(q.u0,q.u1,q.v0,q.v1,Y+MORRO.FH,Y);}
  if(h.caixa){const c=morroPw(h,h.caixa.u,h.caixa.v);colCircle(c[0],c[1],0.64,{solid:true,y0:Y,y1:Y+1.18,morro:true});supAdd({t:'ret',x:c[0],z:c[1],hw:0.45,hd:0.45,yaw:h.yaw,y:Y+1.18,dono:'morro'});}
}
/* escada de marinheiro nos fundos (o beco de cima): sobe do chão até a laje (depois de todas as casas terem colisão) */
function morroCasaEscada(h,R){const Y=h.yTop,W=h.W,D=h.D;
  if(h.n>=2&&!h.escada&&R()<0.36)for(let t=0;t<6;t++){const u=(R()-0.5)*(W-1.6);if(!h.livre(u-0.5,u+0.5,D/2-1.3,D/2-0.26))continue;
    const b=morroPw(h,u,D/2+0.85),p=morroPw(h,u,D/2+0.14),tp=morroPw(h,u,D/2-0.6),yb=ground(b[0],b[1]);if(Y-yb<2.2||pointBlocked(b[0],b[1],0.35))continue;
    const via=viaReta(p[0],p[1],yb,Y,h.yaw+Math.PI,{x:b[0],y:yb,z:b[1]},{x:tp[0],y:Y,z:tp[1],rumo:h.yaw+Math.PI},{id:'morro'+h.id,pecas:true});via.tipo='escada';VIAS.push(via);
    h.escada={u,yb,via};h.ocup.push([u-0.6,u+0.6,D/2-1.4,D/2]);break;}}

/* ---------- casas abertas (o sistema das casas da vila: portas, móveis, gavetas e moradores), com laje ---------- */
function morroLajeCasa(p,yT,cF){const W=p.W,D=p.D,h=0.42,cL=MOR_COR.laje;
  peca(p,-0.12,W+0.12,yT-0.22,yT+0.02,-0.12,D+0.12,cL,0);
  for(const[u0,u1,v0,v1]of[[-0.12,W+0.12,-0.12,0.04],[-0.12,W+0.12,D-0.04,D+0.12],[-0.12,0.04,0.04,D-0.04],[W-0.04,W+0.12,0.04,D-0.04]]){peca(p,u0,u1,yT+0.02,yT+0.02+h,v0,v1,cF,0);retL(p,u0,u1,v0,v1,yT+0.02+h);}
  p.lajeTopo=[retL(p,-0.12,W+0.12,-0.12,D+0.12,yT+0.02)];}
const MOR_BECOS=['Rua de Baixo','Beco do Sabiá','Beco das Pipas','Beco da Laje','Beco da Caixa-d’Água','Beco do Varal','Beco da Bica','Beco do Mirante','Beco de Cima'];
function morroPredio(o,R){const fr=o.gMax-o.yMin>0.55?'N':'S',num=o.num,beco=MOR_BECOS[Math.min(MOR_BECOS.length-1,o.fil)];
  const p=predioRural({nome:'Casa nº '+num+' ('+beco+')',tipo:'casa',casa:true,frente:fr,x:o.cx,z:o.cz,W:o.W,D:o.D,andares:o.n,
    cores:[morroPick(R,MOR_COR.reboco),0xe2dccf,0x8a7a66,MOR_COR.laje],margem:0.5,frenteQ:1.0,fundoQ:0.6,semMureta:true,local:'morro',temPorao:false,laje:true,yq:o.gMax,corBase:MOR_COR.base});
  p.morro={yMin:o.yMin};if(p.y0-o.yMin>0.6)boxL(p,0,p.W,0,p.D,o.yMin-1.2,p.y0-0.5,{morro:true});   // a base na encosta (não tranca a porta do lado de cima)
  /* degraus de concreto do chão até a soleira (porta da frente e dos fundos), quando o chão fica abaixo do piso */
  p.morro.degraus=[];for(const[u,v0,v1]of[[p.uF,-1.5,-0.02],[p.uB,p.D+1.5,p.D+0.02]]){if(u===undefined)continue;const w=pw(p,u,v0),g=ground(w[0],w[1]);if(p.y0-g<0.28)continue;
    const va=Math.min(v0,v1),vb=Math.max(v0,v1);ramL(p,u-0.6,u+0.6,va,vb,v0<v1?g:p.y0,v0<v1?p.y0:g);p.morro.degraus.push({u,v0,v1,g});}
  MOR.predios.push(p);return p;}

/* ---------- o morro inteiro ---------- */
function morroMontar(){const R=rng(MOR.seed),info={casas:0,abertas:0,tabuas:0,escadasMar:0,saques:0,arvores:0,enfeite:0,pontos:0};MOR.info=info;
  morroLimpar(info);
  /* escadaria principal: do buraco do tapume até onde o morro aplana (o Largo) */
  let gTop=-1e9;for(let z=104;z<=150;z+=1)gTop=Math.max(gTop,ground(MORRO.esc,z));
  let zL=150;for(let z=106;z<=150;z+=0.5)if(ground(MORRO.esc,z)>=gTop-1.4){zL=z;break;}zL=clamp(zL,118,146);info.zLargo=zL;
  /* o Largo: laje de concreto no alto da escadaria; o Mercadinho e o Bar do lado de cima */
  {const x0=MORRO.esc-10,x1=MORRO.esc+10,z0=zL,z1=zL+12;let gm=-1e9,gn=1e9;
    for(let x=x0-1;x<=x1+1;x+=1.5)for(let z=z0;z<=z1+9;z+=1.5){const g=ground(x,z);if(z<=z1)gn=Math.min(gn,g);if(g>gm)gm=g;}
    const y=gm+0.12;MOR.largo={x0,x1,z0,z1,y,yMin:gn};supAdd({t:'ret',x:(x0+x1)/2,z:(z0+z1)/2,hw:(x1-x0)/2,hd:(z1-z0)/2,yaw:0,y,dono:'morroLargo'});
    colBox((x0+x1)/2,(z0+z1)/2,(x1-x0)/2,(z1-z0)/2,0,{solid:true,y0:gn-1.5,y1:y-0.45,morro:true});
    MOR.reservas.push({x0:x0-1.2,x1:x1+1.2,z0:z0-1.2,z1:z1+10.5});
    MOR.largo.merc=predioRural({nome:'Mercadinho do Sabiá',tipo:'conveniencia',frente:'S',x:x0+5,z:z1+4.6,W:9,D:8,andares:1,local:'morro',placa:'MERCADINHO',yq:y-0.12});
    MOR.largo.bar=predioRural({nome:'Bar da Laje',tipo:'conveniencia',frente:'S',x:x1-4.5,z:z1+4.6,W:8,D:8,andares:1,local:'morro',placa:'BAR',yq:y-0.12});
    for(const p of[MOR.largo.merc,MOR.largo.bar]){p.morro={yMin:gn};if(p.y0-gn>0.6)boxL(p,0,p.W,0,p.D,gn-1.5,p.y0-0.5,{morro:true});MOR.predios.push(p);}}
  /* a escadaria sobe do buraco do tapume até a laje do Largo */
  const E=morroEscada(MORRO.esc,MORRO.z0+0.3,zL,MORRO.escW,'Escadaria do Sabiá',MOR.largo.y);info.escTopo=+E.ys[E.n].toFixed(2);
  /* a caixa-d'água do morro: a torre mais alta, ao lado do Largo (escada de marinheiro até o teto do tanque) */
  {const L=MOR.largo;let best=null;for(let x=L.x1+5;x<=Math.min(L.x1+7,MORRO.escs[2]-7.2);x+=1)for(let z=L.z0+1;z<=L.z1+6;z+=2){const g=ground(x,z);if(!best||g>best.g)best={x,z,g};}
    const T=MOR.torre={x:best.x,z:best.z,g:-1e9,H:10.5,r:2.7,meio:1.9};for(const[a,b]of[[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6],[0,0]])T.g=Math.max(T.g,ground(T.x+a,T.z+b));
    T.yb=T.g+T.H;T.top=T.yb+3.3;for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])colCircle(T.x+sx*1.9,T.z+sz*1.9,0.24,{solid:true,y0:T.g-1,y1:T.yb,morro:true});
    colCircle(T.x,T.z,T.r,{solid:true,y0:T.yb,y1:T.top,morro:true});supAdd({t:'ret',x:T.x,z:T.z,hw:T.meio,hd:T.meio,yaw:0,y:T.top,dono:'morroTorre'});
    const Y=T.top,m=T.meio;colBox(T.x,T.z+m,m,0.07,0,{solid:true,y0:Y,y1:Y+1.1});colBox(T.x-m,T.z,0.07,m,0,{solid:true,y0:Y,y1:Y+1.1});colBox(T.x+m,T.z,0.07,m,0,{solid:true,y0:Y,y1:Y+1.1});
    colBox(T.x-1.15,T.z-m,0.62,0.07,0,{solid:true,y0:Y,y1:Y+1.1});colBox(T.x+1.15,T.z-m,0.62,0.07,0,{solid:true,y0:Y,y1:Y+1.1});
    const zl=T.z-T.r-0.12,g0=ground(T.x,zl-0.75);T.zl=zl;T.g0=g0;const via=viaReta(T.x,zl,g0,Y,0,{x:T.x,y:g0,z:zl-0.75},{x:T.x,y:Y,z:T.z-m+0.6,rumo:0},{id:'morroTorre',pecas:true});via.tipo='escada';VIAS.push(via);T.via=via;
    MOR.reservas.push({x0:T.x-4.2,x1:T.x+4.2,z0:T.z-5.2,z1:T.z+4.2});}
  /* escadinhas dos lados */
  for(const x of MORRO.escs){let zf=MORRO.z0+0.6;for(let z=MORRO.z0+2;z<morroTopo(x)-MORRO.franja-3;z+=1)zf=z;morroEscada(x,MORRO.z0+0.6,zf,1.5,'Escadinha');}
  /* fileiras de casas na encosta (de baixo para cima); casas coladas em grupos, com becos entre os grupos e entre as fileiras */
  const aabbs=[];let num=1;
  const cabe=b=>b[0]>MORRO.x0+MORRO.franja&&b[1]<MORRO.x1-MORRO.franja&&b[2]>MORRO.z0+2.4&&b[3]<Math.min(morroTopo(b[0]),morroTopo(b[1]))-MORRO.franja&&morroLivre(b[0],b[1],b[2],b[3]);
  const bate=(b,ignora)=>{for(const q of aabbs){if(ignora&&q.h===ignora)continue;const c=q.b;if(b[1]>c[0]+0.05&&b[0]<c[1]-0.05&&b[3]>c[2]+0.05&&b[2]<c[3]-0.05)return true;}return false;};
  for(let f=0;;f++){const zr=MORRO.fil0+f*MORRO.dFil;if(zr>morroTopo(255)-MORRO.franja-1.5)break;let x=MORRO.x0+MORRO.franja+0.3+R()*1.2,run=null,abertasFila=0,guarda=0;
    while(x<MORRO.x1-MORRO.franja-3&&guarda++<700){
      const W=3.8+R()*2.6,D=4.4+R()*1.2;
      if(!run)run={ox:x,oz:zr+(R()-0.5)*0.9,yaw:(R()-0.5)*0.08,u:0,ult:null,xFim:x};
      const yaw=run.yaw,vc=(R()-0.5)*0.6,dir=[Math.cos(yaw),-Math.sin(yaw)],nrm=[Math.sin(yaw),Math.cos(yaw)];
      let cx=run.ox+dir[0]*(run.u+W/2)+nrm[0]*vc,cz=run.oz+dir[1]*(run.u+W/2)+nrm[1]*vc,bb=morroAabb(cx,cz,W,D,yaw);
      if(f===0&&bb[2]<MORRO.z0+2.5){cz+=MORRO.z0+2.55-bb[2];bb=morroAabb(cx,cz,W,D,yaw);}   // a fileira de baixo encosta na Rua de Baixo
      if(!cabe(bb)||bate(bb,run.ult)){x=run.ult?run.xFim+0.9:x+1.0;run=null;continue;}
      const[mn,mx]=morroChaoRet(cx,cz,W,D,yaw);
      /* casa aberta (o sistema das casas da vila, com laje) no lugar de uma casa solta em chão manso */
      if(!run.ult&&info.abertas<8&&abertasFila<2&&mx-mn<1.8&&R()<0.5){const Wa=Math.max(W,5.8),Da=Math.max(D,5.6),xa0=x+0.55;let za0=cz-Da/2;if(f===0)za0=Math.max(za0,MORRO.z0+3.6);
        const ca=[xa0+Wa/2,za0+Da/2],ba=[xa0-0.5,xa0+Wa+0.5,za0-1.0,za0+Da+1.0],[mn2,mx2]=morroChaoRet(ca[0],ca[1],Wa,Da,0);
        if(cabe(ba)&&!bate(ba)&&mx2-mn2<1.7){const n=R()<0.35?2:1,p=morroPredio({cx:ca[0],cz:ca[1],W:Wa,D:Da,n,gMax:mx2,yMin:mn2,fil:f,num:num++},R);abertasFila++;info.abertas++;
          aabbs.push({b:[Math.min(p.bx0,ba[0]),Math.max(p.bx1,ba[1]),Math.min(p.bz0,ba[2]),Math.max(p.bz1,ba[3])]});x=ba[1]+0.3+R()*0.6;run=null;continue;}}
      const h=morroCasaNova({cx,cz,W,D,yaw,fil:f,num:num++},R);info.casas++;aabbs.push({b:bb,h});
      if(run.ult){h.vizE=run.ult;run.ult.vizD=h;}
      run.ult=h;run.u+=W;run.xFim=bb[1];x=bb[1];
      const gap=R()<0.55?0:R()<0.7?0.8+R()*0.6:1.5+R()*0.9;if(gap>0){x=bb[1]+gap;run=null;}}}
  for(const h of MOR.casas)morroCasaColisao(h,R);for(const h of MOR.casas)morroCasaEscada(h,R);
  info.escadasMar=MOR.casas.filter(h=>h.escada).length;
  morroTabuas(R,info);morroMata(R,info);morroSaques(R,info);morroPontos(R,info);
  MORRO_LIGADO=true;
  /* a parede de mato do fim do mapa contorna o morro */
  {const rem=new Set();for(const c of COLL)if(c.brenha)rem.add(c);
    for(const c of rem){if(c.cells)for(const k of c.cells){const l=CGRID.get(k);if(l){const i=l.indexOf(c);if(i>=0)l.splice(i,1);}}c.cells=null;}
    let j=0;for(let i=0;i<COLL.length;i++)if(!rem.has(COLL[i]))COLL[j++]=COLL[i];COLL.length=j;bordaMontar();}
  if(typeof vegDirty!=='undefined')vegDirty=true;MOR.ok=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{morroMontar();}catch(e){console.error('Morro do Sabiá',e);MOR.erro=String(e&&e.stack||e);}return r;};}

/* ---------- tábuas largadas entre as lajes (de uma fileira para a de cima, onde as alturas batem) ---------- */
const morroLocal=(h,x,z)=>{const dx=x-h.cx,dz=z-h.cz;return[dx*h.c-dz*h.s,dx*h.s+dz*h.c];};
function morroTabuas(R,info){const C=MOR.casas,usadas=[],longe=(x,z)=>!usadas.some(q=>Math.hypot(q[0]-x,q[1]-z)<7);
  const tabua=(t,a,b)=>{MOR.tabuas.push(t);usadas.push([(t.x0+t.x1)/2,(t.z0+t.z1)/2]);info.tabuas++;};
  /* de uma fileira para a de cima, atravessando o beco */
  const borda=(h,v,x)=>{const u=(x-h.cx-v*h.s)/h.c;return{u,z:h.cz-u*h.s+v*h.c};};
  for(const a of C)for(const b of C){if(info.tabuas>=26)return;if(b.fil!==a.fil+1)continue;const dy=b.yTop-a.yTop;if(Math.abs(dy)>1.3)continue;
    const ax=morroAabb(a.cx,a.cz,a.W,a.D,a.yaw),bx=morroAabb(b.cx,b.cz,b.W,b.D,b.yaw),o0=Math.max(ax[0],bx[0])+0.7,o1=Math.min(ax[1],bx[1])-0.7;if(o1-o0<0.3)continue;
    const x=(o0+o1)/2,ea=borda(a,a.D/2,x),eb=borda(b,-b.D/2,x),gap=eb.z-ea.z;if(gap<0.8||gap>3.6||!longe(x,(ea.z+eb.z)/2))continue;
    if(Math.abs(ea.u)>a.W/2-0.5||Math.abs(eb.u)>b.W/2-0.5||a.mureta>0.6||b.mureta>0.6)continue;
    if(!a.livre(ea.u-0.4,ea.u+0.4,a.D/2-0.8,a.D/2-0.26)||!b.livre(eb.u-0.4,eb.u+0.4,-b.D/2+0.26,-b.D/2+0.8))continue;
    const z0=ea.z-0.35,z1=eb.z+0.35,ya=a.yTop+0.04,yb=b.yTop+0.04;supAdd({t:'ram',x,z:(z0+z1)/2,hw:0.21,hd:(z1-z0)/2,yaw:0,ya,yb,dono:'morroTabua'});
    tabua({eixo:'z',x0:x,x1:x,z0,z1,ya,yb});a.ocup.push([ea.u-0.45,ea.u+0.45,a.D/2-0.9,a.D/2]);b.ocup.push([eb.u-0.45,eb.u+0.45,-b.D/2,-b.D/2+0.9]);}
  /* na mesma fileira, atravessando o beco do lado */
  for(const a of C){if(info.tabuas>=26)return;const ab=morroAabb(a.cx,a.cz,a.W,a.D,a.yaw);let best=null,bg=9;
    for(const b of C){if(b===a||b.fil!==a.fil||b.cx<=a.cx||a.vizD===b)continue;const bb=morroAabb(b.cx,b.cz,b.W,b.D,b.yaw),gap=bb[0]-ab[1];if(gap<0.5||gap>2.8)continue;
      const zo0=Math.max(ab[2],bb[2])+0.8,zo1=Math.min(ab[3],bb[3])-0.8;if(zo1-zo0<0.3)continue;if(gap<bg){bg=gap;best={b,z:(zo0+zo1)/2};}}
    if(!best)continue;const b=best.b,z=best.z;if(Math.abs(b.yTop-a.yTop)>0.9||a.mureta>0.6||b.mureta>0.6)continue;
    const va=(z-a.cz+(a.W/2)*a.s)/a.c,xa=a.cx+(a.W/2)*a.c+va*a.s,vb=(z-b.cz-(b.W/2)*b.s)/b.c,xb=b.cx-(b.W/2)*b.c+vb*b.s;
    if(Math.abs(va)>a.D/2-0.6||Math.abs(vb)>b.D/2-0.6||!longe((xa+xb)/2,z))continue;
    if(!a.livre(a.W/2-0.8,a.W/2-0.26,va-0.4,va+0.4)||!b.livre(-b.W/2+0.26,-b.W/2+0.8,vb-0.4,vb+0.4))continue;
    const x0=xa-0.35,x1=xb+0.35,ya=a.yTop+0.04,yb=b.yTop+0.04;supAdd({t:'ram',x:(x0+x1)/2,z,hw:0.21,hd:(x1-x0)/2,yaw:Math.PI/2,ya,yb,dono:'morroTabua'});
    tabua({eixo:'x',x0,x1,z0:z,z1:z,ya,yb});a.ocup.push([a.W/2-0.9,a.W/2,va-0.45,va+0.45]);b.ocup.push([-b.W/2,-b.W/2+0.9,vb-0.45,vb+0.45]);}}

/* ---------- mata: na franja (dentro do mapa, com colisão), umas árvores nos becos e a mata de enfeite atrás da beira ---------- */
function morroMata(R,info){let id=TREES.reduce((m,t)=>Math.max(m,t.id|0),-1)+1;
  const arv=(x,z,col,s)=>{const r0=R(),kind=r0<0.55?1:r0<0.8?0:r0<0.93?3:2,t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind,hp:5,alive:true,t:0.82+R()*0.3,morro:true};
    TREES.push(t);if(col)colCircle(x,z,TREE_R*s,{tree:t});return t;};
  for(let i=0;i<9000&&info.arvores<110;i++){const x=MORRO.x0+R()*(MORRO.x1-MORRO.x0),z=ANEL.z1-6+R()*(MORRO.zTopo+6-ANEL.z1+6);
    if(!dentroMorro(x,z,1.4)||morroNucleo(x,z,-1.2)||!freeSpot(x,z,2.6))continue;arv(x,z,true,1.0+R()*0.9);info.arvores++;}
  /* umas árvores grandes nos becos (mangueira, jaqueira), longe das casas */
  for(let i=0,k=0;i<1500&&k<10;i++){const x=MORRO.x0+MORRO.franja+R()*(MORRO.x1-MORRO.x0-2*MORRO.franja),z=MORRO.z0+3+R()*60;
    if(!morroNucleo(x,z,1)||pointBlocked(x,z,2.6)||!morroLivre(x-2.5,x+2.5,z-2.5,z+2.5))continue;let perto=false;for(const h of MOR.casas)if(Math.hypot(h.cx-x,h.cz-z)<Math.max(h.W,h.D)/2+2.2){perto=true;break;}if(perto)continue;
    arv(x,z,true,1.5+R()*0.6);k++;info.arvores++;}
  /* atrás da beira (fora do mapa): mata de enfeite, sem colisão, para o morro não acabar num campo pelado */
  for(let i=0;i<9000&&info.enfeite<240;i++){const x=MORRO.x0-46+R()*(MORRO.x1-MORRO.x0+84),z=ANEL.z1+1+R()*(MORRO.zTopo+44-ANEL.z1);
    if(dentroMorro(x,z,-3.5)||dentroMapa(x,z,-3.5)||Math.hypot(x,z)<MAP_R+MORROS.ext+4)continue;if(R()>0.75)continue;arv(x,z,false,1.1+R()*1.0);info.enfeite++;}
  for(let i=0;i<5000&&(info.capim||0)<1400;i++){const x=MORRO.x0+R()*(MORRO.x1-MORRO.x0),z=MORRO.z0+1+R()*(MORRO.zTopo-MORRO.z0);
    if(!dentroMorro(x,z,0.5)||pointBlocked(x,z,0.4))continue;if(morroNucleo(x,z,-0.5)&&R()<0.7)continue;
    let dentro=false;for(const E of MOR.escadas)if(Math.abs(x-E.x)<E.w/2+0.3&&z>E.z0-0.5&&z<E.z1+0.5){dentro=true;break;}if(dentro)continue;
    GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.6+R()*0.6,t:0.75+R()*0.4,morro:true});info.capim=(info.capim||0)+1;}}

/* ---------- saque nas lajes e nos becos ---------- */
LOOT.morroFerramentas=[['pregos',2,6,0.7],['sucata',1,3,0.6],['fita',1,1,0.35],['fio',1,2,0.3],['cano',1,1,0.25],['pilhas',1,2,0.3],['alicate',1,1,0.12],['peDeCabra',1,1,0.08],['lanterna',1,1,0.08],['kitFerramentas',1,1,0.05]];
LOOT.morroIsopor=[['agua',1,2,0.65],['refri',1,2,0.5],['biscoito',1,2,0.45],['feijao',1,1,0.3],['cafe',1,1,0.2],['sal',1,1,0.15],['garrafa',1,2,0.3]];
LOOT.morroMochila=[['bandagem',1,2,0.5],['remedios',1,1,0.3],['pano',1,3,0.5],['agua',1,1,0.4],['isqueiro',1,1,0.25],['vela',1,2,0.3],['municao9',2,5,0.15],['faca',1,1,0.08],['mochilaPequena',1,1,0.04]];
LOOT.morroLixo=[['sucata',1,2,0.55],['pano',1,2,0.5],['garrafa',1,2,0.5],['tabuas',1,2,0.3],['pregos',1,3,0.3],['corda',1,1,0.12]];
const MOR_SAQUES={ferr:{tab:'morroFerramentas',label:'Revistar a caixa de ferramentas',sub:'esquecida na laje'},isopor:{tab:'morroIsopor',label:'Revistar o isopor',sub:'esquecido na laje'},
  mochila:{tab:'morroMochila',label:'Revistar a mochila',sub:'largada na laje'},lixo:{tab:'morroLixo',label:'Revistar o entulho',sub:'no beco'}};
function morroSaques(R,info){const C=MOR.casas.filter(h=>h.n>=1).sort((a,b)=>b.yTop-a.yTop),usados=[];const tipos=['ferr','isopor','mochila','ferr','isopor','mochila'];
  for(const h of C){if(info.saques>=14)break;if(usados.some(q=>Math.hypot(q[0]-h.cx,q[1]-h.cz)<11))continue;
    for(let t=0;t<8;t++){const u=(R()-0.5)*(h.W-1.4),v=(R()-0.5)*(h.D-1.4);if(!h.livre(u-0.45,u+0.45,v-0.45,v+0.45))continue;
      const k=tipos[info.saques%tipos.length],S=MOR_SAQUES[k],w=morroPw(h,u,v),Y=h.yTop;h.ocup.push([u-0.5,u+0.5,v-0.5,v+0.5]);
      interAdd({id:'morro-s'+info.saques,kind:'bau',x:w[0],z:w[1],y:Y,yChk:Y,r:1.8,label:S.label,sub:S.sub,tabela:S.tab,respawn:3});
      MOR.saques.push({k,h,u,v,r:R()*6.28});usados.push([h.cx,h.cz]);info.saques++;break;}}
  for(let i=0,k=0;i<400&&k<6;i++){const x=MORRO.x0+MORRO.franja+R()*(MORRO.x1-MORRO.x0-2*MORRO.franja),z=MORRO.z0+1.2+R()*55;
    if(!morroNucleo(x,z,0.5)||pointBlocked(x,z,0.9)||!morroLivre(x-0.6,x+0.6,z-0.6,z+0.6))continue;
    interAdd({id:'morro-l'+k,kind:'bau',x,z,r:1.8,label:MOR_SAQUES.lixo.label,sub:MOR_SAQUES.lixo.sub,tabela:'morroLixo',respawn:2});MOR.saques.push({k:'lixo',x,z,y:ground(x,z),r:R()*6.28});colCircle(x,z,0.45,{solid:true,y0:ground(x,z)-0.3,y1:ground(x,z)+0.5,morro:true});k++;info.saques++;}}

/* ---------- onde os zumbis do morro nascem: nos becos e nas escadas; alguns dormem nas lajes ---------- */
function morroPontos(R,info){const L=MOR.pontos;
  for(let f=0;f<10;f++){const z=MORRO.fil0+f*MORRO.dFil+MORRO.dFil/2;for(let x=MORRO.x0+MORRO.franja+2;x<MORRO.x1-MORRO.franja-2;x+=4.5){const zz=z+(R()-0.5)*1.5;if(morroNucleo(x,zz,1)&&!pointBlocked(x,zz,0.6))L.push([x,zz]);}}
  for(let x=MORRO.x0+MORRO.franja+2;x<MORRO.x1-MORRO.franja-2;x+=5)if(!pointBlocked(x,95.6,0.6))L.push([x,95.6]);
  for(const E of MOR.escadas)for(let z=E.z0+4;z<E.z1-1;z+=7)L.push([E.x,z]);
  const lj=MOR.casas.filter(h=>h.W*h.D>26).sort(()=>R()-0.5);for(const h of lj){if(MOR.lajeZ.length>=6)break;for(let t=0;t<6;t++){const u=(R()-0.5)*(h.W-1.6),v=(R()-0.5)*(h.D-1.6);if(!h.livre(u-0.5,u+0.5,v-0.5,v+0.5))continue;const w=morroPw(h,u,v);MOR.lajeZ.push({x:w[0],z:w[1],y:h.yTop});break;}}
  info.pontos=L.length;}

/* ================= desenho ================= */
function mbx(g,M,u0,u1,y0,y1,v0,v1,cor,o){if(u1-u0<0.004||y1-y0<0.004||v1-v0<0.004)return;add(g,boxTris(u1-u0,y1-y0,v1-v0),mm(M,mat((u0+u1)/2,(y0+y1)/2,(v0+v1)/2)),typeof cor==='number'?lin(cor):cor,o);}
function morroChunksNovos(){MOR.chunks=[];const n=6,w=(MORRO.x1-MORRO.x0)/n;
  for(let i=0;i<n;i++)MOR.chunks.push({i,x0:MORRO.x0+i*w-6,x1:MORRO.x0+(i+1)*w+6,z0:MORRO.z0-2,z1:MORRO.zTopo+8,gB:new GB(1<<15,8),gD:new GB(1<<15,8),gL:new GB(1<<12,8),mB:null,mD:null,mL:null});}
const morroCh=x=>MOR.chunks[clamp(Math.floor((x-MORRO.x0)/((MORRO.x1-MORRO.x0)/MOR.chunks.length)),0,MOR.chunks.length-1)];
function morroGeoCasa(h,R){const ch=morroCh(h.cx),gB=ch.gB,gD=ch.gD,M=mat(h.cx,0,h.cz,0,h.yaw,0),W=h.W,D=h.D,FH=MORRO.FH,Y=h.yTop,b=h.base,J={j:0.035,rnd:R};
  const B=(g,u0,u1,y0,y1,v0,v1,cor,o)=>mbx(g,M,u0,u1,y0,y1,v0,v1,cor,o||J);
  const lados=[{e:'v',k:-D/2,a:-W/2,b:W/2,n:-1,id:'f'},{e:'v',k:D/2,a:-W/2,b:W/2,n:1,id:'t'},{e:'u',k:-W/2,a:-D/2,b:D/2,n:-1,id:'e',viz:h.vizE},{e:'u',k:W/2,a:-D/2,b:D/2,n:1,id:'d',viz:h.vizD}];
  const F=(g,L,s0,s1,y0,y1,d0,d1,cor,o)=>{const k0=L.k+L.n*d0,k1=L.k+L.n*d1,ka=Math.min(k0,k1),kb=Math.max(k0,k1);if(L.e==='v')B(g,s0,s1,y0,y1,ka,kb,cor,o);else B(g,ka,kb,y0,y1,s0,s1,cor,o);};
  {const hb=b-h.yMin;if(hb>2.3&&h.porao){   // encosta alta: a fachada desce até o chão (um andar de baixo, com janela do lado de baixo do morro)
      const cor=h.tijolo?h.corTijolo:h.cor,L=lados[0],nj=Math.max(1,Math.floor((W-0.4)/2.3));B(gB,-W/2,W/2,h.yMin-0.5,b-0.2,-D/2,D/2,cor);B(gB,-W/2-0.03,W/2+0.03,b-0.2,b,-D/2-0.03,D/2+0.03,MOR_COR.concreto);
      B(gB,-W/2-0.02,W/2+0.02,h.yMin-0.5,h.yMin+0.22,-D/2-0.02,D/2+0.02,MOR_COR.base);
      for(let j=0;j<nj;j++){const sx=-W/2+W*(j+0.5)/nj,ya=Math.max(h.yMin+0.9,b-2.1),yb=ya+1.0;if(yb>b-0.3)continue;F(gB,L,sx-0.45,sx+0.45,ya,yb,0,0.025,MOR_COR.janela);
        if(h.janTipo===0)for(let q=1;q<4;q++)F(gD,L,sx-0.45+0.9*q/4-0.013,sx-0.45+0.9*q/4+0.013,ya,yb,0.03,0.056,MOR_COR.grade);}}
    else if(hb>0.04)B(gB,-W/2+0.02,W/2-0.02,h.yMin-0.5,b,-D/2+0.02,D/2-0.02,MOR_COR.base,{j:0.06,rnd:R});}
  for(let f=0;f<h.n;f++){const y0=b+f*FH,y1=y0+FH,tj=h.tijolo||(h.misto&&f>0),cor=tj?h.corTijolo:h.cor,topo=f===h.n-1;
    B(gB,-W/2,W/2,y0,y1-0.2,-D/2,D/2,cor);
    if(topo)B(gB,-W/2-0.1,W/2+0.1,y1-0.22,y1,-D/2-0.1,D/2+0.1,MOR_COR.laje,{j:0.07,rnd:R});
    else B(gB,-W/2-0.03,W/2+0.03,y1-0.2,y1,-D/2-0.03,D/2+0.03,tj?MOR_COR.concreto:morroEsc(cor,0.86));
    if(tj)for(const su of[-1,1])for(const sv of[-1,1])B(gB,su<0?-W/2-0.03:W/2-0.2,su<0?-W/2+0.2:W/2+0.03,y0,y1-0.2,sv<0?-D/2-0.03:D/2-0.2,sv<0?-D/2+0.2:D/2+0.03,MOR_COR.concreto);
    for(const L of lados){if(L.viz&&y0<L.viz.yTop-0.3)continue;   // lado colado: só acima da casa vizinha
      const len=L.b-L.a,nj=Math.min(3,Math.max(0,Math.floor((len-0.4)/2.3)));if(!nj)continue;
      for(let j=0;j<nj;j++){const s=L.a+len*(j+0.5)/nj+(R()-0.5)*0.4;
        if(f===0&&L.id===h.ladoPorta&&j===h.portaJ){F(gB,L,s-0.48,s+0.48,y0+0.02,y0+2.08,0,0.035,h.corPorta,{j:0.04,rnd:R});F(gD,L,s-0.56,s+0.56,y0+2.08,y0+2.18,0,0.07,MOR_COR.concreto);
          F(gD,L,s+0.3,s+0.36,y0+1.0,y0+1.08,0.03,0.07,0x9aa1a6);if(h.janTipo===0)for(let q=1;q<5;q++)F(gD,L,s-0.48,s+0.48,y0+0.02+q*0.41-0.02,y0+0.02+q*0.41+0.02,0.035,0.05,morroEsc(h.corPorta,0.7));continue;}
        if(R()<0.12)continue;   // parede cega
        const larg=R()<0.3?0.6:0.95,ya=y0+(larg<0.7?1.35:1.0),yb=y0+2.05;
        F(gB,L,s-larg/2,s+larg/2,ya,yb,0,0.025,MOR_COR.janela);
        F(gD,L,s-larg/2-0.08,s+larg/2+0.08,ya-0.08,ya,0,0.09,MOR_COR.concreto);
        if(h.janTipo===0){const nb=Math.max(2,Math.round(larg/0.24));for(let q=1;q<nb;q++){const sq=s-larg/2+larg*q/nb;F(gD,L,sq-0.013,sq+0.013,ya,yb,0.03,0.056,MOR_COR.grade);}F(gD,L,s-larg/2,s+larg/2,(ya+yb)/2-0.013,(ya+yb)/2+0.013,0.03,0.056,MOR_COR.grade);}
        else if(h.janTipo===1){if(R()<0.6){F(gD,L,s-larg/2,s-0.01,ya,yb,0.026,0.05,h.corJan);F(gD,L,s+0.01,s+larg/2,ya,yb,0.026,0.05,h.corJan);}else F(gD,L,s-larg,s-larg/2,ya,yb,0.03,0.055,h.corJan);}
        else{F(gD,L,s-larg/2,s+larg/2,ya+(yb-ya)*0.15,yb,0.02,0.04,0x8d969a);for(let q=1;q<4;q++)F(gD,L,s-larg/2,s+larg/2,ya+(yb-ya)*q/4-0.012,ya+(yb-ya)*q/4+0.012,0.04,0.06,0x6d7478);}}}}
  /* laje: mureta, ferro de espera, puxadinho, caixa-d'água, antena, varal e coisas */
  const corTopo=h.tijolo||(h.misto&&h.n>1)?h.corTijolo:h.cor;
  if(h.mureta>0)for(const m of morroMuretas(h))B(gB,m[0],m[1],Y,Y+h.mureta,m[2],m[3],corTopo);
  if(h.ferro)for(const su of[-1,1])for(const sv of[-1,1]){if(su<0&&h.vizE&&h.vizE.yTop>Y)continue;if(su>0&&h.vizD&&h.vizD.yTop>Y)continue;const u=su*(W/2-0.1),v=sv*(D/2-0.1);
    for(const[a,c]of[[-0.05,-0.05],[0.05,0.05],[0.05,-0.05]])add(gD,cylTris(0.012,0.012,0.45+R()*0.5,4),mm(M,mat(u+a,Y,v+c,(R()-0.5)*0.12,0,(R()-0.5)*0.12)),lin(0x6a3a26));}
  if(h.puxa){const q=h.puxa,y1=Y+FH,cor=q.tij?h.corTijolo:h.cor;B(gB,q.u0,q.u1,Y,y1-0.2,q.v0,q.v1,cor);B(gB,q.u0-0.06,q.u1+0.06,y1-0.2,y1,q.v0-0.06,q.v1+0.06,MOR_COR.laje,{j:0.07,rnd:R});
    const Lp={e:'v',k:q.sv<0?q.v1:q.v0,n:q.sv<0?1:-1};const um=(q.u0+q.u1)/2;F(gB,Lp,um-0.42,um+0.42,Y+0.02,Y+2.0,0,0.03,h.corPorta);
    const Lq={e:'u',k:q.su<0?q.u1:q.u0,n:q.su<0?1:-1};const vm=(q.v0+q.v1)/2;F(gB,Lq,vm-0.35,vm+0.35,Y+1.2,Y+1.9,0,0.025,MOR_COR.janela);}
  if(h.caixa){const c=h.caixa,cc=lin(c.cor);B(gB,c.u-0.72,c.u+0.72,Y,Y+0.15,c.v-0.72,c.v+0.72,MOR_COR.concreto);
    add(gB,cylTris(0.6,0.63,0.95,14),mm(M,mat(c.u,Y+0.15,c.v)),cc,{j:0.03,rnd:R});add(gB,cylTris(0.64,0.64,0.08,14),mm(M,mat(c.u,Y+1.1,c.v)),mixc(cc,[0,0,0],0.25));
    add(gD,cylTris(0.025,0.025,0.6,5),mm(M,mat(c.u+0.55,Y+0.2,c.v,0,0,Math.PI/2)),lin(0x8a8a82));}
  if(h.antena){const a=h.antena,M2=mm(M,mat(a.u,Y,a.v,0,a.rot,0));add(gD,cylTris(0.022,0.022,a.prato?1.1:2.3,5),M2,lin(0x8d969a));
    if(a.prato){add(gD,cylTris(0.42,0.04,0.16,10),mm(M2,mat(0,1.05,0.05,-1.0,0,0)),lin(0xd8d8d0));}
    else for(let i=0;i<4;i++)add(gD,boxTris(0.9-i*0.15,0.02,0.02),mm(M2,mat(0,1.6+i*0.18,0)),lin(0x8d969a));}
  if(h.varal)propVaral(gD,mm(M,mat(h.varal.u,Y,h.varal.v,0,h.varal.rot,0)),h.varal.len,R);
  for(const c of h.coisas){const M2=mm(M,mat(c.u,Y,c.v,0,c.r,0));
    if(c.k==='vaso')propVaso(gD,M2,R);else if(c.k==='botijao')propBotijao(gD,M2);else if(c.k==='tanque')propTanque(gD,M2);else if(c.k==='cadeira')propCadeira(gD,M2,R()<0.5?0xe8e4dc:0x2f6fa8);
    else if(c.k==='churrasqueira'){add(gD,bvTris(0.8,0.75,0.55),mm(M2,mat(0,0.375,0)),lin(h.corTijolo),{j:0.05,rnd:R});add(gD,boxTris(0.7,0.02,0.45),mm(M2,mat(0,0.76,0)),lin(0x2a2a2a));add(gD,bvTris(0.3,0.9,0.3),mm(M2,mat(0.25,1.2,0.1)),lin(h.corTijolo));}
    else if(c.k==='balde'){add(gD,cylTris(0.17,0.14,0.32,9),M2,lin(R()<0.5?0x2a64a0:0xd8a020));}
    else propLixo(gD,M2,R);}
  if(h.escada){const u=h.escada.u,y0=h.escada.yb,M2=mm(M,mat(u,0,D/2+0.12));for(const s of[-0.22,0.22])add(gB,boxTris(0.04,Y+0.9-y0,0.04),mm(M2,mat(s,(Y+0.9+y0)/2,0)),lin(0x4a4f52));
    for(let y=y0+0.3;y<Y+0.8;y+=0.3)add(gD,boxTris(0.44,0.025,0.025),mm(M2,mat(0,y,0)),lin(0x4a4f52));}}
function morroGeoPredio(p,R){const ch=morroCh(p.x0),gB=ch.gB,gD=ch.gD,M=mat(p.ox,0,p.oz,0,p.yaw,0),yMin=(p.morro&&p.morro.yMin)??p.yq;
  for(const d of(p.morro&&p.morro.degraus)||[]){const hh=p.y0-d.g,k=Math.max(2,Math.round(hh/0.18)),L=Math.abs(d.v1-d.v0),sg=d.v1>d.v0?1:-1;
    for(let i=0;i<k;i++){const yt=d.g+(i+1)*hh/k,va=d.v0+sg*L*i/k,vb=d.v0+sg*L*(i+1)/k;mbx(gB,M,d.u-0.62,d.u+0.62,d.g-0.35,yt,Math.min(va,vb),Math.max(va,vb),0x9a968e,{j:0.05,rnd:R});}}
  if(p.y0-yMin>0.5)mbx(gB,M,-0.03,p.W+0.03,yMin-0.5,p.yq-0.5,-0.03,p.D+0.03,MOR_COR.base,{j:0.06,rnd:R});
  if(p.casa){const yT=p.y0+p.andares*p.H+0.02,u=p.W*(0.25+R()*0.5),v=p.D*(0.3+R()*0.4),cc=lin(morroPick(R,MOR_COR.caixa));
    mbx(gB,M,u-0.72,u+0.72,yT,yT+0.15,v-0.72,v+0.72,MOR_COR.concreto);add(gB,cylTris(0.6,0.63,0.95,14),mm(M,mat(u,yT+0.15,v)),cc,{j:0.03,rnd:R});add(gB,cylTris(0.64,0.64,0.08,14),mm(M,mat(u,yT+1.1,v)),mixc(cc,[0,0,0],0.25));
    const w=pw(p,u,v);colCircle(w[0],w[1],0.64,{solid:true,y0:yT,y1:yT+1.18,morro:true});supAdd({t:'ret',x:w[0],z:w[1],hw:0.45,hd:0.45,yaw:p.yaw,y:yT+1.18,dono:'morro'});}}
/* escadaria: degraus (blocos até o chão), corrimão de cano e postes com fio */
function morroGeoEscada(E,R){const x=E.x,w=E.w,cD=0x9a968e;
  for(let i=0;i<E.n;i++){const za=E.z0+i*E.dz,zb=za+E.dz,ya=E.ys[i],yb=E.ys[i+1],hh=yb-ya,ch=morroCh(x);let gMin=1e9;
    for(const dx of[-w/2,0,w/2])for(const zz of[za,zb])gMin=Math.min(gMin,ground(x+dx,zz));
    const k=hh<0.05?1:Math.max(1,Math.round(hh/0.19)),t=E.dz/k;
    for(let j=0;j<k;j++){const yt=hh<0.05?yb:ya+(j+1)*hh/k,z0=za+j*t;mbx(ch.gB,ID,x-w/2,x+w/2,Math.min(gMin-0.25,yt-0.5),yt+(hh<0.05?0:0.04),z0,z0+t,cD,{j:0.05,rnd:R});}
    /* corrimão (do lado direito de quem sobe) */
    const xr=x+w/2-0.07,p0=[xr,ya+0.95,za],p1=[xr,yb+0.95,zb];add(ch.gD,cylTris(0.026,0.026,ya+0.95-ya,5),mat(xr,ya,za),lin(0x5a5f62));
    add(ch.gD,cylTris(0.022,0.022,Math.hypot(p1[1]-p0[1],p1[2]-p0[2]),5),alignY(p0[0],p0[1],p0[2],0,p1[1]-p0[1],p1[2]-p0[2]),lin(0x5a5f62));}
  if(w>2){for(let z=E.z0+3;z<E.z1-1;z+=11){const xp=x-w/2-0.28,y=Math.min(E.yEm(z),ground(xp,z))-0.1,ch=morroCh(xp);add(ch.gB,cylTris(0.09,0.12,6.0,7),mat(xp,y,z),lin(0x8d8a82));
    add(ch.gD,bvTris(1.1,0.07,0.07),mat(xp+0.45,y+5.75,z),lin(0x6d6a62));add(ch.gD,bvTris(0.32,0.12,0.2),mat(xp+0.95,y+5.66,z),lin(0x3a3d40));colCircle(xp,z,0.15,{solid:true,y0:y-0.5,y1:y+6,morro:true});
    E.postes=E.postes||[];E.postes.push([xp,y+5.8,z]);}}}
function morroFio(g,a,b,sag){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],n=7;
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,s=t=>-Math.sin(t*Math.PI)*sag,p0=[a[0]+d[0]*t0,a[1]+d[1]*t0+s(t0),a[2]+d[2]*t0],p1=[a[0]+d[0]*t1,a[1]+d[1]*t1+s(t1),a[2]+d[2]*t1];
    add(g,cylTris(0.012,0.012,Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),3),alignY(p0[0],p0[1],p0[2],p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),lin(0x161616));}
  return[a[0]+d[0]*0.5,a[1]+d[1]*0.5-sag,a[2]+d[2]*0.5];}
/* becos de cimento: faixa que acompanha o chão entre as fileiras e a Rua de Baixo, encostada no tapume */
function morroGeoBecos(R){const caixas=MOR.casas.map(h=>morroAabb(h.cx,h.cz,h.W,h.D,h.yaw)).concat(MOR.predios.map(p=>[p.x0,p.x1,p.z0,p.z1]));
  const ocupa=(x0,x1,z0,z1)=>{for(const b of caixas)if(x1>b[0]-0.15&&x0<b[1]+0.15&&z1>b[2]-0.15&&z0<b[3]+0.15)return true;for(const E of MOR.escadas)if(x1>E.x-E.w/2-0.1&&x0<E.x+E.w/2+0.1&&z1>E.z0&&z0<E.z1)return true;
    const L=MOR.largo;if(x1>L.x0&&x0<L.x1&&z1>L.z0&&z0<L.z1)return true;return false;};
  const faixa=(z,larg)=>{const d=1.2;for(let x=MORRO.x0+MORRO.franja-1;x<MORRO.x1-MORRO.franja+1;x+=d){const z0=z-larg/2,z1=z+larg/2;if(!morroNucleo(x+d/2,z,-1)||ocupa(x,x+d,z0,z1))continue;
    const ch=morroCh(x),y=(xx,zz)=>ground(xx,zz)+0.05,A=[x,y(x,z0),z0],B=[x,y(x,z1),z1],C=[x+d,y(x+d,z0),z0],Dd=[x+d,y(x+d,z1),z1],c=0x8d8a82+(R()<0.3?0x050505:0);
    add(ch.gB,[[A,B,C],[C,B,Dd]],ID,lin(c),{keepWind:true,j:0.05,rnd:R});}};
  faixa(MORRO.z0+1.15,1.7);for(let f=0;f<10;f++){const z=MORRO.fil0+f*MORRO.dFil+MORRO.dFil/2;if(z>morroTopo(255)-MORRO.franja)break;faixa(z,1.3);}}
/* o cano em cima da laje onde os fios chegam (um por casa, na beira), acima da cabeça */
function morroMastro(h,R){if(h.mastro!==undefined)return h.mastro;h.mastro=null;
  for(let t=0;t<8;t++){const u=(R()<0.5?-1:1)*(h.W/2-0.45),v=(R()-0.5)*(h.D-1.2);if(!h.livre(u-0.2,u+0.2,v-0.2,v+0.2))continue;const w=morroPw(h,u,v),Y=h.yTop,top=Y+2.15+R()*0.3;
    add(morroCh(h.cx).gD,cylTris(0.03,0.035,top-Y,5),mat(w[0],Y,w[1]),lin(0x6d7276));h.ocup.push([u-0.25,u+0.25,v-0.25,v+0.25]);h.mastro=[w[0],top-0.05,w[1]];break;}
  return h.mastro;}
/* de longe (além de 165 m): só os volumes (corpo, laje, caixa-d'água, puxadinho), a caixa-d'água do morro e o Largo */
function morroGeoLonge(){for(const h of MOR.casas){const ch=morroCh(h.cx),M=mat(h.cx,0,h.cz,0,h.yaw,0),W=h.W,D=h.D,Y=h.yTop,b=h.base,FH=MORRO.FH;
    const c0=h.tijolo?h.corTijolo:h.cor,c1=h.tijolo||h.misto?h.corTijolo:h.cor;
    mbx(ch.gL,M,-W/2,W/2,h.yMin-0.5,b+FH-0.2,-D/2,D/2,c0);if(h.n>1)mbx(ch.gL,M,-W/2,W/2,b+FH-0.2,Y-0.2,-D/2,D/2,c1);mbx(ch.gL,M,-W/2-0.1,W/2+0.1,Y-0.22,Y,-D/2-0.1,D/2+0.1,MOR_COR.laje);
    if(h.caixa)mbx(ch.gL,M,h.caixa.u-0.6,h.caixa.u+0.6,Y,Y+1.15,h.caixa.v-0.6,h.caixa.v+0.6,h.caixa.cor);
    if(h.puxa){const q=h.puxa;mbx(ch.gL,M,q.u0,q.u1,Y,Y+FH,q.v0,q.v1,q.tij?h.corTijolo:h.cor);}}
  for(const p of MOR.predios){const ch=morroCh(p.x0),M=mat(p.ox,0,p.oz,0,p.yaw,0),yMin=(p.morro&&p.morro.yMin)??p.yq,cor=(p.cores||CID_COR[p.tipo]||CID_COR.casa)[0];
    mbx(ch.gL,M,0,p.W,yMin-0.5,p.yTopo,0,p.D,cor);mbx(ch.gL,M,-0.1,p.W+0.1,p.yTopo-0.2,p.yTopo+0.05,-0.1,p.D+0.1,MOR_COR.laje);}
  {const T=MOR.torre,ch=morroCh(T.x);for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])mbx(ch.gL,ID,T.x+sx*1.9-0.21,T.x+sx*1.9+0.21,T.g-1.2,T.yb,T.z+sz*1.9-0.21,T.z+sz*1.9+0.21,0xa9a49a);
    add(ch.gL,cylTris(T.r,T.r,3.3,12),mat(T.x,T.yb,T.z),lin(0xd8d4c8));add(ch.gL,cylTris(T.r+0.01,T.r+0.01,0.5,12),mat(T.x,T.yb+1.2,T.z),lin(0x2f6fa8));}
  {const L=MOR.largo,ch=morroCh((L.x0+L.x1)/2);mbx(ch.gL,ID,L.x0,L.x1,L.yMin-0.6,L.y,L.z0,L.z1,0x8f8b84);}}
function morroGeo(){const R=rng(MOR.seed+7);morroChunksNovos();morroGeoBecos(R);morroGeoLonge();
  for(const h of MOR.casas)morroGeoCasa(h,R);for(const p of MOR.predios)morroGeoPredio(p,R);for(const E of MOR.escadas)morroGeoEscada(E,R);
  /* o Largo: laje de concreto, mureta do lado de baixo e dois bancos */
  {const L=MOR.largo,ch=morroCh((L.x0+L.x1)/2);mbx(ch.gB,ID,L.x0,L.x1,L.yMin-0.6,L.y,L.z0,L.z1,0x8f8b84,{j:0.05,rnd:R});
    for(let x=L.x0+0.6;x<L.x1-0.5;x+=2.3)mbx(ch.gD,ID,x,x+0.08,L.y,L.y+0.02,L.z0+0.3,L.z1-0.3,0x77736c);
    for(const x of[L.x0+2.5,L.x1-2.5]){add(ch.gD,bvTris(1.6,0.08,0.45),mat(x,L.y+0.45,(L.z0+L.z1)/2),lin(0x9a958c));for(const s of[-0.6,0.6])add(ch.gD,bvTris(0.12,0.42,0.4),mat(x+s,L.y+0.21,(L.z0+L.z1)/2),lin(0x8a857c));}}
  /* a caixa-d'água do morro */
  {const T=MOR.torre,ch=morroCh(T.x),cc=lin(0xa9a49a);for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])add(ch.gB,bvTris(0.42,T.H+1.2,0.42),mat(T.x+sx*1.9,T.g-1.2+(T.H+1.2)/2,T.z+sz*1.9),cc,{j:0.05,rnd:R});
    for(const y of[T.g+3.5,T.g+7])for(const[a,b,c,d]of[[-1.9,-1.9,1.9,-1.9],[-1.9,1.9,1.9,1.9],[-1.9,-1.9,-1.9,1.9],[1.9,-1.9,1.9,1.9]])mbx(ch.gB,ID,T.x+Math.min(a,c)-0.15,T.x+Math.max(a,c)+0.15,y,y+0.32,T.z+Math.min(b,d)-0.15,T.z+Math.max(b,d)+0.15,0xa9a49a);
    mbx(ch.gB,ID,T.x-2.3,T.x+2.3,T.yb-0.35,T.yb,T.z-2.3,T.z+2.3,0x9a958c);add(ch.gB,cylTris(T.r,T.r,3.1,22),mat(T.x,T.yb,T.z),lin(0xd8d4c8),{j:0.04,rnd:R});
    add(ch.gB,cylTris(T.r+0.06,T.r+0.06,0.2,22),mat(T.x,T.top-0.2,T.z),lin(0x9a958c));
    add(ch.gB,cylTris(T.r+0.01,T.r+0.01,0.5,22),mat(T.x,T.yb+1.2,T.z),lin(0x2f6fa8));   // a faixa azul
    const m=T.meio,Y=T.top;for(const[a,b]of[[-m,-m],[m,-m],[-m,m],[m,m],[-0.5,-m],[0.5,-m]])add(ch.gD,cylTris(0.03,0.03,1.1,5),mat(T.x+a,Y,T.z+b),lin(0x4a4f52));
    for(const[a0,b0,a1,b1]of[[-m,m,m,m],[-m,-m,-m,m],[m,-m,m,m],[-m,-m,-0.5,-m],[0.5,-m,m,-m]])add(ch.gD,boxTris(Math.abs(a1-a0)+0.05,0.05,Math.abs(b1-b0)+0.05),mat(T.x+(a0+a1)/2,Y+1.08,T.z+(b0+b1)/2),lin(0x4a4f52));
    /* escada de marinheiro: do chão ao teto do tanque, presa nas vigas */
    const zl=T.zl,g0=T.g0;for(const s of[-0.24,0.24])add(ch.gB,boxTris(0.05,Y+1.0-g0,0.05),mat(T.x+s,(Y+1.0+g0)/2,zl),lin(0x4a4f52));for(let y=g0+0.3;y<Y+0.9;y+=0.3)add(ch.gD,boxTris(0.48,0.03,0.03),mat(T.x,y,zl),lin(0x4a4f52));
    for(const y of[T.g+3.6,T.g+7.1])for(const s of[-0.24,0.24])mbx(ch.gB,ID,T.x+s-0.03,T.x+s+0.03,y,y+0.06,zl,T.z-1.9,0x4a4f52);}
  /* tábuas entre as lajes */
  for(const t of MOR.tabuas){const xm=(t.x0+t.x1)/2,zm=(t.z0+t.z1)/2,ch=morroCh(xm),ym=(t.ya+t.yb)/2-0.02;
    if(t.eixo==='x'){const L=Math.hypot(t.x1-t.x0,t.yb-t.ya),th=Math.atan2(t.yb-t.ya,t.x1-t.x0);add(ch.gB,bvTris(L,0.05,0.4),mat(xm,ym,zm,0,0,th),lin(0x7a5a3a),{j:0.08,rnd:R});}
    else{const L=Math.hypot(t.z1-t.z0,t.yb-t.ya),th=Math.atan2(t.yb-t.ya,t.z1-t.z0);add(ch.gB,bvTris(0.4,0.05,L),mat(xm,ym,zm,-th,0,0),lin(0x7a5a3a),{j:0.08,rnd:R});}}
  /* saque à vista: caixa de ferramentas, isopor, mochila, entulho */
  for(const s of MOR.saques){let M,ch;if(s.h){const h=s.h;ch=morroCh(h.cx);M=mm(mat(h.cx,0,h.cz,0,h.yaw,0),mat(s.u,h.yTop,s.v,0,s.r,0));}else{ch=morroCh(s.x);M=mat(s.x,s.y,s.z,0,s.r,0);}
    if(s.k==='ferr'){add(ch.gD,bvTris(0.52,0.24,0.26),mm(M,mat(0,0.12,0)),lin(0xa8261d));add(ch.gD,bvTris(0.3,0.05,0.04),mm(M,mat(0,0.27,0)),lin(0x2a2a2a));}
    else if(s.k==='isopor'){add(ch.gD,bvTris(0.62,0.38,0.42),mm(M,mat(0,0.19,0)),lin(0xe8e6e0));add(ch.gD,bvTris(0.64,0.05,0.44),mm(M,mat(0,0.4,0)),lin(0x2f6fa8));}
    else if(s.k==='mochila'){add(ch.gD,boxTris(0.42,0.5,0.25),mm(M,mat(0,0.25,0,0.3,0,0)),lin(0x56603a));add(ch.gD,boxTris(0.3,0.16,0.07),mm(M,mat(0,0.2,0.16,0.3,0,0)),lin(0x4a5331));}
    else{propLixo(ch.gD,M,R);add(ch.gD,bvTris(0.9,0.4,0.6),mm(M,mat(0.1,0.15,0,0.1,0.3,0.05)),lin(0x8a857c),{j:0.1,rnd:R});}}
  /* fios: poste com poste na escadaria e gato do poste para as lajes de perto; pipas presas nos fios */
  {const pipas=[0xe8c020,0xd83a2a,0x2f8ad8,0x3aa84a,0xe86ac0];let np=0;
    for(const E of MOR.escadas){const P2=E.postes||[];for(let i=0;i<P2.length;i++){const a=P2[i],ch=morroCh(a[0]);if(i+1<P2.length)morroFio(ch.gD,a,P2[i+1],0.5);
      const viz=MOR.casas.filter(h=>Math.hypot(h.cx-a[0],h.cz-a[2])<14).sort(()=>R()-0.5).slice(0,3);
      for(const h of viz){const q=morroMastro(h,R);if(!q)continue;const m=morroFio(ch.gD,a,q,0.35);
        if(np<9&&R()<0.4){const c=lin(pipas[np%pipas.length]);add(ch.gD,bvTris(0.36,0.42,0.01),mat(m[0],m[1]-0.3,m[2],0,R()*3,Math.PI/4),c);add(ch.gD,boxTris(0.012,0.6,0.012),mat(m[0],m[1]-0.75,m[2]),c);np++;}}}}
    /* fios de uma laje para a outra, atravessando os becos */
    for(let i=0;i<40;i++){const a=MOR.casas[Math.floor(R()*MOR.casas.length)];if(!a)break;const b=MOR.casas.filter(h=>h!==a&&Math.hypot(h.cx-a.cx,h.cz-a.cz)<11).sort(()=>R()-0.5)[0];if(!b)continue;
      const pa=morroMastro(a,R),pb=morroMastro(b,R);if(pa&&pb)morroFio(morroCh(a.cx).gD,pa,pb,0.3+R()*0.3);}}
  for(const c of MOR.chunks){c.mB=litMesh(c.gB.data());c.mD=litMesh(c.gD.data());c.mL=litMesh(c.gL.data());c.tris=(c.gB.n+c.gD.n)/3;c.trisL=c.gL.n/3;c.gB=c.gD=c.gL=null;}
  MOR.info.tris=Math.round(MOR.chunks.reduce((s,c)=>s+c.tris,0));MOR.info.trisLonge=Math.round(MOR.chunks.reduce((s,c)=>s+c.trisL,0));}
etapaMalha('fim','morro',4,()=>{if(!MOR.ok)return;try{morroGeo();}catch(e){console.error('Morro do Sabiá (desenho)',e);MOR.erro=String(e&&e.stack||e);}});
DESENHO.opaco.push(function morroDesenho(Pg){if(!MOR.ok)return;const cx=cam.pos[0],cz=cam.pos[2];
  for(const c of MOR.chunks){const d=Math.hypot(Math.max(c.x0-cx,0,cx-c.x1),Math.max(c.z0-cz,0,cz-c.z1));if(d>650)continue;
    if(d>165){if(c.mL)drawStat(Pg,c.mL,ID);continue;}if(c.mB)drawStat(Pg,c.mB,ID);if(d<95&&c.mD)drawStat(Pg,c.mD,ID);}});
DESENHO.sombra.push(function morroSombra(Pg,perto){if(!MOR.ok)return;for(const c of MOR.chunks){if(!c.mB)continue;const d=Math.hypot(Math.max(c.x0-P.x,0,P.x-c.x1),Math.max(c.z0-P.z,0,P.z-c.z1));if(d>(perto?60:140))continue;drawStat(Pg,c.mB,ID);}});

/* ================= mapa: o morro, as escadas, o Largo, as casas e a caixa-d'água ================= */
MAPA_DESENHOS.push(function mapaMorro(g,X,Y,k,n,range){if(!MOR.ok||(range<1e3&&morDist()>range*1.5+10))return;   // minimapa: só quando o morro aparece nele
  g.fillStyle=n>0.5?'#1b2118':'#2c3324';g.beginPath();g.moveTo(X(MORRO.x0),Y(ANEL.z1-8));for(let x=MORRO.x0;x<=MORRO.x1+0.1;x+=4)g.lineTo(X(x),Y(morroTopo(x)));g.lineTo(X(MORRO.x1),Y(ANEL.z1-8));g.closePath();g.fill();
  g.strokeStyle=n>0.5?'#3a3834':'#b0aa9c';g.lineCap='butt';for(const E of MOR.escadas){g.lineWidth=Math.max(1,E.w*k);g.beginPath();g.moveTo(X(E.x),Y(E.z0));g.lineTo(X(E.x),Y(E.z1));g.stroke();}
  {const L=MOR.largo;g.fillStyle=n>0.5?'#2e2d2a':'#8a877e';g.fillRect(X(L.x0),Y(L.z0),(L.x1-L.x0)*k,(L.z1-L.z0)*k);}
  for(const h of MOR.casas){g.fillStyle=n>0.5?'#2a2622':h.mapaCor;g.beginPath();for(let i=0;i<4;i++){const q=[[-1,-1],[1,-1],[1,1],[-1,1]][i],p=morroPw(h,q[0]*h.W/2,q[1]*h.D/2);i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1]));}g.closePath();g.fill();}
  {const T=MOR.torre;g.fillStyle=n>0.5?'#2a3440':'#6f9cc4';g.beginPath();g.arc(X(T.x),Y(T.z),Math.max(2.5,T.r*k),0,Math.PI*2);g.fill();}});
MAPA_NOMES.push(()=>MOR.ok&&MOR.largo?{t:'Caixa-d’água',x:MOR.torre.x,z:MOR.torre.z,px:8}:null);
{const i=REGIOES.findIndex(r=>r.id==='mata');REGIOES.splice(i<0?REGIOES.length:i,0,{id:'morro',nome:'Morro do Sabiá',desc:'a favela no morro atrás da cidade: lajes para correr por cima, becos, escadarias e a caixa-d’água lá no alto',
  em:(x,z)=>MOR.ok&&morroNucleo(x,z,-2.5),x:255,z:132,r:44,aviso:true});}

/* ================= caixa-d'água: observar o morro e a cidade lá de cima ================= */
INTERS.push(tryIt=>{const T=MOR.torre;if(!T||Math.abs(P.x-T.x)>2.3||Math.abs(P.z-T.z)>2.3||Math.abs(P.y-T.top)>1.0)return;
  const v=T.via&&T.via.topo;if(v&&Math.hypot(P.x-v.x,P.z-v.z)<0.75)return;   // na saída da escada fica o "Descer"
  tryIt({k:'morroMirante',o:T},P.x,P.z,1.0,3.0,-2,T.top);});
INTER_K.morroMirante={texto:()=>({t:'Observar o morro e a cidade',s:morD().mapeado?'o morro e a cidade já estão no mapa · mostra zumbis por perto no minimapa':'lá de cima dá para ver o morro e a cidade inteira · segure',hold:true,dur:1.5}),
  usar:(o,seg)=>{if(!seg)return;const D=morD(),novo=!D.mapeado;D.mapeado=true;G.obsAte=G.t+60;
    if(typeof nevoaRevelar==='function'){nevoaRevelar(255,132,64);nevoaRevelarRet(CIDADE.x0,CIDADE.z0,CIDADE.x1,CIDADE.z1);}
    let nz=0;for(const z of Z)if(z.vivo&&Math.hypot(z.x-P.x,z.z-P.z)<120)nz++;
    toast('corpo','Do alto da caixa-d’água: o morro inteiro, o Largo e a cidade lá embaixo. '+(nz?nz+' zumbi'+(nz>1?'s':'')+' à vista.':'Nenhum zumbi à vista.')+(novo?' O morro e a cidade entraram no mapa.':''));
    sfx('pegar');if(novo){ganharXP(30);if(typeof diarioEvento==='function')diarioEvento('Observou o Morro do Sabiá e a cidade do alto da caixa-d’água','geral');}}};

/* ================= zumbis do morro: aparecem quando você chega perto; longe, os que sobraram ficam guardados como número ================= */
const MOR_ZMAX=16,MOR_POV={feito:false,faltam:0,t:0};
function morD(){if(!G.morro||typeof G.morro!=='object')G.morro={zVivos:-1,zDia:0,mapeado:false};return G.morro;}
function morVivos(){return Z.filter(z=>z.vivo&&z.morro&&z.st!=='morrendo'&&z.st!=='morto'&&z.st!=='sumindo');}
function morDist(){return Math.hypot(Math.max(MORRO.x0-P.x,0,P.x-MORRO.x1),Math.max(MORRO.z0-P.z,0,P.z-MORRO.zTopo));}
function morCriarZ(i){const L=MOR.pontos;if(!L.length)return false;
  for(let t=0;t<12;t++){const b=L[(i*7+t*13)%L.length],x=b[0]+(Math.random()-0.5)*2.4,z=b[1]+(Math.random()-0.5)*2.4;
    if(!pontoLivre(x,z,0.5)||Math.hypot(x-P.x,z-P.z)<20)continue;const r=Math.random(),tipo=r<0.14?'runner':r<0.19&&ZS.screamer?'screamer':'walker';
    const q=criarZ(tipo,x,z,{st:'vaga',y:chaoEm(x,z,ground(x,z)+0.3)});if(q){q.morro=true;q.hx=x;q.hz=z;return true;}}
  return false;}
function morCriarZLaje(i){const L=MOR.lajeZ;if(!L.length)return false;const b=L[i%L.length];if(Math.hypot(b.x-P.x,b.z-P.z)<18)return false;
  const q=criarZ(ZS.emboscada&&Math.random()<0.5?'emboscada':'walker',b.x,b.z,{y:b.y,hx:b.x,hz:b.z,hy:b.y});if(q){q.st='dorme';q.morro=true;return true;}return false;}
function morPovoar(){const D=morD();let n;if(D.zVivos<0||!D.zDia)n=MOR_ZMAX;else n=Math.min(MOR_ZMAX,D.zVivos+Math.max(0,(G.dia||1)-D.zDia)*3);
  D.zDia=G.dia||1;let k=0;for(let i=0;i<n;i++)if(i<3?morCriarZLaje(i)||morCriarZ(i):morCriarZ(i))k++;MOR_POV.faltam=n-k;D.zVivos=n;return k;}
function morGuardar(){MOR_POV.feito=false;const D=morD();let n=MOR_POV.faltam||0;MOR_POV.faltam=0;
  for(const z of morVivos()){n++;if(z.st==='caca'&&Math.hypot(z.x-P.x,z.z-P.z)<60)continue;z.vivo=false;z.st='sumindo';z.t=2.2;}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(z.morro&&!z.vivo&&z.st==='sumindo')Z.splice(i,1);}D.zVivos=n;D.zDia=G.dia||1;return n;}
PASSOS.push(function morroZumbis(dt){MOR_POV.t-=dt;if(MOR_POV.t>0)return;MOR_POV.t=1;if(!MOR.ok||!P.alive||G.modo!=='jogo'||P.y<-20)return;const d=morDist();
  if(!MOR_POV.feito){if(d<45){MOR_POV.feito=true;morPovoar();}return;}
  if(d>200){morGuardar();return;}
  if(MOR_POV.faltam>0&&morCriarZ(Math.floor(Math.random()*64)))MOR_POV.faltam--;
  const D=morD(),v=morVivos().length+MOR_POV.faltam;if(D.zVivos>v)D.zVivos=v;});
V8.novo.morro=()=>{G.morro=null;morD();MOR_POV.feito=false;MOR_POV.faltam=0;};
V8.salvar.morro=()=>morD();
V8.carregar.morro=s=>{G.morro=s&&typeof s==='object'?s:null;morD();MOR_POV.feito=false;MOR_POV.faltam=0;MOR.conferir=true;for(let i=Z.length-1;i>=0;i--)if(Z[i].morro)Z.splice(i,1);};
/* jogo salvo antes do morro com você parado onde hoje tem casa (a volta da cidade era mata): sai para o beco mais perto */
PASSOS.push(function morroConferirLugar(){if(!MOR.conferir||!MOR.ok||G.modo!=='jogo')return;MOR.conferir=false;if(P.y<-20||CARRO.ativo||P.escala)return;
  const dentro=c=>{if(!c||!c.morro||c.y1===undefined)return false;return P.y<c.y1-0.05&&P.y+1.6>c.y0;};let c=null;for(const q of colQuery(P.x,P.z,0.5))if(q.morro&&q.solid&&dentro(q)&&pointBlocked(P.x,P.z,0.1)===q){c=q;break;}if(!c)return;
  let best=null,bd=1e9;for(const p of MOR.pontos){const d=Math.hypot(p[0]-P.x,p[1]-P.z);if(d<bd&&!pointBlocked(p[0],p[1],0.5)){bd=d;best=p;}}
  if(best){P.x=best[0];P.z=best[1];P.y=chaoEm(P.x,P.z,ground(P.x,P.z)+0.5);P.vx=P.vz=P.vy=0;}});

/* ================= Cidade Alta: o centro histórico no alto, atrás da cidade (v10.8.0, 19/11/2026) =================
   Pedido do Himalaia: mapa "parecido com o Dying Light" sem copiar — "mapa bem maior" e "cidade menos quadrada" (as perguntas
   ficaram sem resposta; a leitura tomada foi um bairro novo da cidade, fora da grade). Saindo pelo buraco do tapume no fim da
   rua do meio do lado norte (x = 255), a encosta sobe uns 16 m até um planalto que termina num barranco sobre a Praia do Farol
   Velho. Lá em cima ficou a Cidade Alta:
   · Largo do Plano, embaixo, encostado no tapume; de lá sobem a Ladeira da Conceição (rua de pedra em diagonal na encosta, com
     muro de arrimo e mureta do lado de baixo) e o Plano Inclinado (o bondinho que subia a encosta: trilhos, escadaria de serviço
     do lado e o bondinho parado no meio);
   · ruas tortas de pedra (Rua Direita, do Rosário, do Carmo, Nova, becos) que acompanham o chão do planalto;
   · casario colonial colado: sobrados de 1 a 3 andares, fachada colorida, cunhal e moldura brancos, janela alta com veneziana,
     sacada de ferro, barrado, cimalha e telhado de telha de duas águas — o telhado é chão: correndo, sobe-se na casa de 1 andar
     e na sacada; da sacada, pulando, agarra-se o beiral; de telhado em telhado atravessa-se o quarteirão. Zumbi não sobe;
   · Praça do Mirante na beira do planalto (guarda-corpo, bancos, a cidade lá embaixo); a Rua do Carmo corre na beira do barranco
     (a praia e o farol lá embaixo);
   · Largo da Matriz com a Igreja Matriz de Santa Rita (duas torres; a do lado do largo tem escada até o sino: segure E lá em
     cima e a Cidade Alta e a cidade entram no mapa), lojas e casas abertas em volta;
   · zumbis nas ruas (guardados como número quando você vai embora), saque nos telhados, nas lojas e no bondinho.
   O mundo de antes nasce igual: o bairro entra no fim do buildWorld (o mato e as árvores que ficavam no caminho saem) e o mapa só
   cresce depois (CALTA_LIGADO). Árvores novas entram no fim da lista, com números novos (jogos salvos continuam valendo). */
const CA={ok:false,erro:null,info:null,casas:[],predios:[],ruas:[],largos:[],obbs:[],pontos:[],saques:[],chunks:[],rampas:[],telhaZ:[],postes:[],bancos:[],
  caixa:{x0:190,x1:330,z0:-240,z1:-84},plano:null,igreja:null,seed:67100,conferir:false};
let CALTA_LIGADO=false;
let CA_BONDE_MOVEL=false;   // v10.8.6: o bondinho anda (68j_bonde) e é desenhado lá, fora dos pedaços do bairro
const CA_COR={fachada:[0xe0b84a,0x6fa8c8,0xd88a9a,0x7fb07a,0xa890c0,0xd8884a,0xe8e2d4,0xc8584a,0x5ab0a8,0xe8d8a8,0xb8c870,0xe8a0a0,0xd8c060,0x88b8d8],
  moldura:[0xf0ece0,0xe8e0c8,0xf4f0e8],janela:[0x2f5a3a,0x3d5a73,0x6b4a32,0x7a2a22,0x2a3a5a,0x5a6a3a],porta:[0x3a2a1a,0x2f5a3a,0x3d5a73,0x6b2a22,0x4a3424],
  telha:[0x9a4a2e,0x8a4428,0xa65838,0x7e3e26,0x94502e],cumeeira:0x6a3020,pedra:0x9a958a,pedraEsc:0x7d786e,vidro:0x15171a,ferro:0x1e2022,calcada:0xb8b2a4};
const CA_FH=2.85,CA_BEIRAL=0.5;
PK_CFG.maxCorrendo=Math.max(PK_CFG.maxCorrendo,3.8);   // correndo, alcança o beiral do sobrado de 1 andar na rua em ladeira (até 3,8 m)
/* ---------- a área (o planalto e a encosta até a praia) ---------- */
function dentroCAlta(x,z,m=0){return x>CA.caixa.x0+m&&z>CA.caixa.z0+m&&z<-108&&x<costaX(z)+5-m;}
{const _dm=dentroMapa;dentroMapa=function(x,z,m=0){return _dm(x,z,m)||(CALTA_LIGADO&&dentroCAlta(x,z,m));};}
/* a mata fechada do fim do mapa contorna o bairro (a oeste e ao norte; a leste é a praia) */
{const _bc=bordaCandidatos;bordaCandidatos=function(){const L=_bc.apply(this,arguments),ds=1.7,B=CA.caixa;
  for(let z=-108;z>=B.z0;z-=ds)L.push([B.x0,z,-1,0]);
  for(let x=B.x0;x<=costaX(B.z0)+5;x+=ds)L.push([x,B.z0,0,-1]);
  return L;};}
const caPick=(R,L)=>L[Math.floor(R()*L.length)%L.length];
const caPw=(h,u,v)=>[h.cx+u*h.c+v*h.s,h.cz-u*h.s+v*h.c];
function caEsc(c,k){const r=(c>>16)&255,g=(c>>8)&255,b=c&255;return(Math.min(255,Math.round(r*k))<<16)|(Math.min(255,Math.round(g*k))<<8)|Math.min(255,Math.round(b*k));}
/* chão mais baixo e mais alto embaixo de um retângulo girado (16 pontos) e o chão mais alto da beira da frente */
function caChao(cx,cz,W,D,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);let mx=-1e9,mn=1e9,fr=-1e9,fc=0;
  for(let i=0;i<=3;i++)for(let j=0;j<=3;j++){const u=-W/2+W*i/3,v=-D/2+D*j/3,g=ground(cx+u*c+v*s,cz-u*s+v*c);if(g>mx)mx=g;if(g<mn)mn=g;if(j===0&&g>fr)fr=g;if(j===0&&(i===1||i===2))fc+=g/2;}
  return{mn,mx,fr,fc};}

/* ---------- ruas: polilinha suavizada (Catmull-Rom) em pontos de ~1 m, com o comprimento acumulado ---------- */
function caRuaNova(o){const P=o.pts,L=[],n=P.length;
  for(let i=0;i<n-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n-1,i+2)],d=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),k=Math.max(2,Math.ceil(d));
    for(let j=0;j<k;j++){const t=j/k,t2=t*t,t3=t2*t,f=(a,b,c,e)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-e)*t2+(-a+3*b-3*c+e)*t3);L.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
  L.push(P[n-1].slice());const cum=[0];for(let i=1;i<L.length;i++)cum.push(cum[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]));
  const r=Object.assign({id:CA.ruas.length,L,cum,len:cum[cum.length-1],calcada:1.1},o);CA.ruas.push(r);return r;}
/* ponto, tangente e normal (n = tangente girada 90°) na distância s ao longo da rua */
function caRuaEm(r,s){s=clamp(s,0,r.len);let lo=0,hi=r.cum.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(r.cum[m]<=s)lo=m;else hi=m;}
  const a=r.L[lo],b=r.L[hi],seg=r.cum[hi]-r.cum[lo]||1,t=(s-r.cum[lo])/seg,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,tx=(b[0]-a[0])/seg,tz=(b[1]-a[1])/seg;
  return{x,z,tx,tz,nx:-tz,nz:tx};}
function caRuaDist(r,x,z){let bd=1e9,bs=0;const L=r.L;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1e-9;const t=clamp(((x-a[0])*vx+(z-a[1])*vz)/l2,0,1),px=a[0]+vx*t,pz=a[1]+vz*t,d=Math.hypot(x-px,z-pz);
    if(d<bd){bd=d;bs=r.cum[i]+Math.sqrt(l2)*t;}}return{d:bd,s:bs};}
/* retângulos girados que se cruzam (eixos separadores) */
function caObb(cx,cz,hw,hd,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);return{cx,cz,hw,hd,ux:[c,-s],vx:[s,c]};}
function caObbBate(A,B,f){f=f||0;for(const ax of[A.ux,A.vx,B.ux,B.vx]){const pr=O=>{const r=Math.abs(O.ux[0]*ax[0]+O.ux[1]*ax[1])*(O.hw+f/2)+Math.abs(O.vx[0]*ax[0]+O.vx[1]*ax[1])*(O.hd+f/2),c=O.cx*ax[0]+O.cz*ax[1];return[c-r,c+r];};
    const a=pr(A),b=pr(B);if(a[1]<=b[0]||b[1]<=a[0])return false;}return true;}
/* o retângulo cabe: longe das ruas (pista e calçada), dos largos, das rampas e das outras casas */
function caLivre(ob,ignora,rua,barr){for(const o of CA.obbs)if(o!==ignora&&caObbBate(ob,o,0.02))return false;
  const pts=[];for(const su of[-1,-0.5,0,0.5,1])for(const sv of[-1,0,1])pts.push([ob.cx+ob.ux[0]*ob.hw*su+ob.vx[0]*ob.hd*sv,ob.cz+ob.ux[1]*ob.hw*su+ob.vx[1]*ob.hd*sv]);
  for(const p of pts){if(!dentroCAlta(p[0],p[1],1.5)||p[1]>-121)return false;
    for(const r of CA.ruas)if(caRuaDist(r,p[0],p[1]).d<r.w/2+r.calcada-(r===rua?0.6:0.05))return false;
    for(const L of CA.largos)if(p[0]>L.x0-0.3&&p[0]<L.x1+0.3&&p[1]>L.z0-0.3&&p[1]<L.z1+0.3)return false;
    if(p[0]>caBarranco(p[1])-(barr??2.5))return false;}
  return true;}
/* beira do barranco (onde o planalto cai para a praia): x da beira em cada z, medido no chão */
const CA_BARR=new Map();
function caBarranco(z){const k=Math.round(z);if(CA_BARR.has(k))return CA_BARR.get(k);let x=costaX(z)-6;
  for(let xx=CA.caixa.x0+20;xx<costaX(z);xx+=1){if(ground(xx,z)<9){x=xx;break;}}CA_BARR.set(k,x);return x;}

/* ---------- limpar o lugar (árvores, pedras, moitas, coletáveis e capim que ficavam onde nasce o bairro) ---------- */
function caNucleo(x,z,m=0){return x>CA.caixa.x0+6+m&&z>CA.caixa.z0+6+m&&z<-121-m&&x<caBarranco(z)-1-m;}
function caCorredor(x,z,m){for(const R of CA.rampas){const dx=x-R.P0[0],dz=z-R.P0[1],t=(dx*R.d[0]+dz*R.d[1]),q=dx*R.n[0]+dz*R.n[1];if(t>-3-m&&t<R.L+3+m&&Math.abs(q)<R.w/2+2.2+m)return true;}
  const L=CA.largoPlano;return!!L&&x>L.x0-1-m&&x<L.x1+1+m&&z>L.z0-1-m&&z<L.z1+m;}
function caLimpar(info){const cm=new Map();for(const c of COLL){if(c.tree)cm.set(c.tree,c);else if(c.rock)cm.set(c.rock,c);}
  const limpa=(x,z,m)=>caNucleo(x,z,-m)||caCorredor(x,z,m);let n=0;
  for(const t of TREES)if(!t.agua&&limpa(t.x,t.z,1.5)){t.agua=true;t.alive=false;colRemove(cm.get(t));n++;}
  for(const r of ROCKS)if(!r.agua&&limpa(r.x,r.z,1)){r.agua=true;r.alive=false;colRemove(cm.get(r));n++;}
  for(const b of BUSHES)if(!b.agua&&limpa(b.x,b.z,0.8)){b.agua=true;b.frutas=false;n++;}
  for(const p of PICKS)if(!p.agua&&limpa(p.x,p.z,0.5)){p.agua=true;p.alive=false;n++;}
  for(const L of[GRASS,FLORES])for(const b of L)if(b.y>-900&&limpa(b.x,b.z,0.3)){b.y=-999;n++;}
  if(typeof SAMAMBAIAS!=='undefined')for(const b of SAMAMBAIAS)if(b.y>-900&&limpa(b.x,b.z,0.3)){b.y=-999;n++;}
  info.limpos=n;}

/* ---------- rampa reta de P0 (embaixo) a P1 (em cima), largura w: o perfil acompanha o chão mais alto na largura e só sobe;
   lances de 1 m ('ram'). Do lado de baixo da encosta, muro de arrimo e mureta. Usada na ladeira, no plano inclinado e na
   escadaria do farol ---------- */
function caRampa(nome,P0,P1,w,o){o=o||{};const dx=P1[0]-P0[0],dz=P1[1]-P0[1],L=Math.hypot(dx,dz),d=[dx/L,dz/L],n=[-d[1],d[0]],ns=Math.max(2,Math.round(L)),ys=[],gs=[];
  for(let i=0;i<=ns;i++){const t=L*i/ns,x=P0[0]+d[0]*t,z=P0[1]+d[1]*t;let g=-1e9,gm=1e9;for(const k of[-1,-0.5,0,0.5,1]){const q=ground(x+n[0]*w/2*k,z+n[1]*w/2*k);if(q>g)g=q;if(q<gm)gm=q;}ys.push(g+0.08);gs.push(gm);}
  for(let i=1;i<=ns;i++)ys[i]=Math.max(ys[i],ys[i-1]);
  if(o.yIni!==undefined){for(let i=0;i<=ns;i++)ys[i]=Math.max(ys[i],o.yIni);}
  if(o.yFim!==undefined){for(let i=ns;i>=0;i--)ys[i]=Math.max(ys[i],o.yFim-(ns-i)*(L/ns)*0.75);ys[ns]=Math.max(ys[ns],o.yFim);}
  const lado=ground(P0[0]+d[0]*L/2+n[0]*(w/2+1.5),P0[1]+d[1]*L/2+n[1]*(w/2+1.5))<ground(P0[0]+d[0]*L/2-n[0]*(w/2+1.5),P0[1]+d[1]*L/2-n[1]*(w/2+1.5))?1:-1;   // lado de baixo da encosta
  const R={nome,P0,P1,w,L,d,n,ns,ys,gs,lado,yaw:Math.atan2(d[0],d[1]),dono:o.dono||'caltaRampa',mureta:o.mureta!==false,tipo:o.tipo||'ladeira'};
  R.yEm=t=>{const k=clamp(t/(L/ns),0,ns-1e-6),i=Math.floor(k);return lerp(ys[i],ys[i+1],k-i);};
  R.pt=t=>[P0[0]+d[0]*t,P0[1]+d[1]*t];
  const sl=L/ns;for(let i=0;i<ns;i++){const t=(i+0.5)*sl,c=R.pt(t),ya=ys[i],yb=ys[i+1];
    supAdd(yb-ya<0.02?{t:'ret',x:c[0],z:c[1],hw:w/2,hd:sl/2+0.02,yaw:R.yaw,y:yb,dono:R.dono}:{t:'ram',x:c[0],z:c[1],hw:w/2,hd:sl/2+0.02,yaw:R.yaw,ya,yb,dono:R.dono});
    colBox(c[0],c[1],w/2,sl/2,R.yaw,{solid:true,y0:Math.min(gs[i],gs[i+1])-1.2,y1:Math.min(ya,yb)-0.45,calta:true});
    if(R.mureta){const m=[c[0]+n[0]*lado*(w/2-0.12),c[1]+n[1]*lado*(w/2-0.12)];colBox(m[0],m[1],0.12,sl/2+0.02,R.yaw,{solid:true,y0:Math.min(ya,yb)-0.5,y1:Math.max(ya,yb)+0.9,calta:true});}}
  CA.rampas.push(R);return R;}

/* ---------- sobrados (cascas fechadas: corpo, sacada, beiral e o telhado andável) ---------- */
function caCasaNova(o,R){const h=Object.assign({id:CA.casas.length,vizE:null,vizD:null},o);h.c=Math.cos(h.yaw);h.s=Math.sin(h.yaw);
  h.cor=caPick(R,CA_COR.fachada);h.corMold=caPick(R,CA_COR.moldura);h.corJan=caPick(R,CA_COR.janela);h.corPorta=caPick(R,CA_COR.porta);h.corTelha=caPick(R,CA_COR.telha);
  h.fh1=h.n===1?2.55:CA_FH;h.yE=h.base+h.fh1+(h.n-1)*CA_FH;   // a casa térrea é mais baixa: correndo (e até andando) dá para subir no beiral
  h.hr=Math.min(2.2,(h.D/2+CA_BEIRAL)*0.36);h.yR=h.yE+h.hr;
  h.vaos=Math.max(1,Math.round((h.W-0.6)/2.3));h.portaJ=Math.floor(R()*h.vaos);
  h.sacada=h.n>=2&&R()<0.62;h.sacadaCorrida=h.sacada&&h.vaos>=3&&R()<0.35;h.mapaCor='#'+(h.corTelha&0xffffff).toString(16).padStart(6,'0');
  CA.casas.push(h);return h;}
function caCasaColisao(h){const W=h.W,D=h.D,e=0.06,ov=CA_BEIRAL;
  colBox(h.cx,h.cz,W/2,D/2,h.yaw,{solid:true,y0:h.yMin-1.2,y1:h.yE-0.45,calta:true});
  const sF=caPw(h,0,-(D/2+ov)/2),sT=caPw(h,0,(D/2+ov)/2);
  h.telhado=[supAdd({t:'ram',x:sF[0],z:sF[1],hw:W/2+0.03,hd:(D/2+ov)/2,yaw:h.yaw,ya:h.yE+e,yb:h.yR+e,dono:'caltaTelhado'}),
             supAdd({t:'ram',x:sT[0],z:sT[1],hw:W/2+0.03,hd:(D/2+ov)/2,yaw:h.yaw,ya:h.yR+e,yb:h.yE+e,dono:'caltaTelhado'})];
  /* sacadas: piso de pedra (degrau para o beiral) com a grade de ferro (correndo, passa por cima) */
  h.sacadas=[];if(h.sacada){const y=h.base+h.fh1,pas=W/h.vaos;
    const add1=(u0,u1)=>{const c=caPw(h,(u0+u1)/2,-D/2-0.3);supAdd({t:'ret',x:c[0],z:c[1],hw:(u1-u0)/2,hd:0.3,yaw:h.yaw,y:y+0.06,dono:'caltaSacada'});h.sacadas.push([u0,u1,y]);};   // a grade é só desenho: agarra-se a beirada e passa por cima
    if(h.sacadaCorrida)add1(-W/2+0.3,W/2-0.3);else for(let j=0;j<h.vaos;j++){const s=-W/2+pas*(j+0.5);add1(s-0.75,s+0.75);}}}
/* casario de um lado da rua, de s0 a s1: casas coladas em grupos, com becos entre os grupos. lado: +1/-1 (lado da normal) */
function caFileira(r,lado,s0,s1,R,o){o=o||{};const recuo=r.w/2+r.calcada,out=[];let s=s0,ult=null,guarda=0;
  while(s<s1-3.5&&guarda++<300){const W=o.W?o.W(R):5.0+R()*3.4,D0=o.D?o.D(R):7.5+R()*3.5;if(s+W>s1)break;
    const p=caRuaEm(r,s+W/2),nx=p.nx*lado,nz=p.nz*lado,yaw=Math.atan2(nx,nz);let D=D0,cx,cz,ob=null;
    for(const Dk of[D0,D0*0.8,Math.max(o.Dmin??5.2,D0*0.62)]){if(Dk<(o.Dmin??5.2)-0.01)continue;const x=p.x+nx*(recuo+Dk/2),z=p.z+nz*(recuo+Dk/2),q=caObb(x,z,W/2,Dk/2,yaw);
      if(caLivre(q,ult&&ult.ob,r,o.barr)){D=Dk;cx=x;cz=z;ob=q;break;}}
    if(!ob){s+=1.0;ult=null;continue;}
    const g=caChao(cx,cz,W,D,yaw);if(g.mx-g.mn>(o.desnivel??3.4)){s+=1.2;ult=null;continue;}
    let n=R()<0.28?1:R()<0.8?2:3;if(o.nMax)n=Math.min(n,o.nMax);
    const h=caCasaNova({cx,cz,yaw,W,D,n,base:Math.max(g.fc,g.fr-0.45)+0.12,yMin:g.mn,rua:r.id,lado,s:s+W/2,ob},R);out.push(h);CA.obbs.push(ob);
    if(ult){if(lado>0){h.vizE=ult;ult.vizD=h;}else{h.vizD=ult;ult.vizE=h;}}
    ult=h;s+=W;
    if(R()<(o.beco??0.15)){s+=1.8+R()*1.4;ult=null;}}
  return out;}

/* subir na sacada e no beiral do casario encostado na fachada: as provas do alvoMuro (41b) começam a 0,5 m, e a sacada e o beiral
   ficam a menos que isso da frente; com o jogador encostado, procura também a 0,12–0,42 m (só nas superfícies do casario) */
{const _am=alvoMuro;alvoMuro=function(){const a=_am.apply(this,arguments);if(a||!CA.ok||!P.alive||CARRO.ativo||P.escala||P.muro||P.rola||!P.noChao)return a;
  const mv=Math.hypot(IN.mx,IN.mz)>0.15,yaw=mv?P.yaw+Math.atan2(-IN.mx,IN.mz):P.body,fx=Math.sin(yaw),fz=Math.cos(yaw),max=(P.correndo?PK_CFG.maxCorrendo:MURO.max)+0.25;
  for(const d of[0.12,0.28,0.42]){const x=P.x+fx*d,z=P.z+fz*d,l=SGRID.get(skey(Math.floor(x/SCELL),Math.floor(z/SCELL)));if(!l)continue;
    for(const s of l){if(s.dono!=='caltaSacada'&&s.dono!=='caltaTelhado')continue;const hh=alturaSup(s,x,z);if(hh===null)continue;const dh=hh-P.y;if(dh<MURO.min||dh>max+(s.dono==='caltaSacada'?0.2:0))continue;
      let px,pz,yTop;if(s.dono==='caltaSacada'){const dx=x-s.x,dz=z-s.z,lx=clamp(dx*s.c-dz*s.s,-s.hw+0.3,s.hw-0.3);px=s.x+lx*s.c;pz=s.z-lx*s.s;yTop=s.y;}   // na sacada: fica no meio dela
      else{const xs=x+fx*0.4,zs=z+fz*0.4,hs=alturaSup(s,xs,zs);yTop=hs!==null?hs:hh;px=hs!==null?xs:x;pz=hs!==null?zs:z;}
      if(bloqueadoAlto(px,pz,0.2,yTop+0.06))continue;
      return{x:px,z:pz,y:yTop,dh:yTop-P.y,yaw};}}
  return null;};}
/* ---------- prédios abertos (o sistema das casas da vila: portas, móveis, gavetas e moradores), com telhado andável ---------- */
function caPredio(sp){const p=predioRural(Object.assign({local:'calta',margem:0.4,frenteQ:0.6,fundoQ:0.5,semMureta:true},sp));
  let gn=1e9;for(const[x,z]of[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1],[(p.x0+p.x1)/2,(p.z0+p.z1)/2]])gn=Math.min(gn,ground(x,z));
  p.calta={yMin:gn,degraus:[]};if(p.y0-gn>0.6)boxL(p,0,p.W,0,p.D,gn-1.2,p.y0-0.5,{calta:true});
  /* degraus de pedra do chão até a soleira (porta da frente), quando o chão fica abaixo do piso */
  if(p.uF!==undefined){const w=pw(p,p.uF,-1.6),g=ground(w[0],w[1]);if(p.y0-g>0.28){const L=Math.max(1.4,(p.y0-g)*1.7);ramL(p,p.uF-0.65,p.uF+0.65,-L,-0.02,g,p.y0);p.calta.degraus.push({u:p.uF,v0:-L,v1:-0.02,g});}}
  if(p.casa&&!p.lajeTopo&&typeof p.yTopo==='number'){const yT=p.yTopo,D=p.D,W=p.W,hr=1.5,e=0.06;p.lajeTopo=[ramL(p,-0.4,W+0.4,-0.45,D/2,yT+e,yT+hr+e),ramL(p,-0.4,W+0.4,D/2,D+0.45,yT+hr+e,yT+e)];}
  CA.obbs.push(caObb((p.x0+p.x1)/2,(p.z0+p.z1)/2,(p.x1-p.x0)/2+0.3,(p.z1-p.z0)/2+0.3,0));CA.predios.push(p);return p;}

/* ---------- a igreja matriz: o prédio da igreja (nave, porta, bancos, altar) com duas torres na frente; a torre do lado do
   Rosário tem escada de marinheiro por dentro até o sino ---------- */
function caIgreja(R,info){const p=predioRural({igreja:true,nome:'Igreja Matriz de Santa Rita',frente:'E',x:204,z:-166,W:11,D:20,local:'calta'});
  let gn=1e9;for(const[x,z]of[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1]])gn=Math.min(gn,ground(x,z));p.calta={yMin:gn,degraus:[]};
  if(p.y0-gn>0.5)boxL(p,0,p.W,0,p.D,gn-1.2,p.y0-0.5,{calta:true});
  /* adro: escadaria de pedra da porta até o largo (a igreja fica no alto) */
  {const w=pw(p,p.W/2,-3.2),g=ground(w[0],w[1]),hh=p.yq-g;if(hh>0.2){const L=Math.max(1.6,hh*1.8);ramL(p,p.W/2-1.7,p.W/2+1.7,-1.35-L,-1.35,g,p.yq);p.calta.adro={L,g};}}
  CA.igreja=p;CA.obbs.push(caObb((p.x0+p.x1)/2,(p.z0+p.z1)/2,(p.x1-p.x0)/2+0.6,(p.z1-p.z0)/2+0.4,0));
  /* torres: 4,3 m de lado, nos dois cantos da frente, para fora da nave */
  const T=[];for(const[u0,u1,esc]of[[-4.4,-0.1,false],[p.W+0.1,p.W+4.4,true]]){const v0=0,v1=4.3,y0=p.y0,c=pw(p,(u0+u1)/2,(v0+v1)/2),tw={u0,u1,v0,v1,x:c[0],z:c[1],y0,gn,
      yS:y0+12.2,yT:y0+15.4,yC:y0+19.2,esc};
    const ew=0.45,cw=(a0,a1,b0,b1,y0_,y1_)=>{const q=pw(p,(a0+a1)/2,(b0+b1)/2);colBox(q[0],q[1],(a1-a0)/2,(b1-b0)/2,p.yaw,{solid:true,y0:y0_,y1:y1_,calta:true});};
    /* paredes até o piso do sino (com a porta da frente, para o largo, na torre da escada) */
    if(esc){cw(u0,(u0+u1)/2-0.65,v0,v0+ew,gn-1,tw.yS);cw((u0+u1)/2+0.65,u1,v0,v0+ew,gn-1,tw.yS);cw((u0+u1)/2-0.65,(u0+u1)/2+0.65,v0,v0+ew,y0+2.35,tw.yS);}
    else cw(u0,u1,v0,v0+ew,gn-1,tw.yS);
    cw(u0,u1,v1-ew,v1,gn-1,tw.yS);cw(u0,u0+ew,v0+ew,v1-ew,gn-1,tw.yS);cw(u1-ew,u1,v0+ew,v1-ew,gn-1,tw.yS);
    if(!esc)cw(u0+ew,u1-ew,v0+ew,v1-ew,gn-1,tw.yS-0.45);   // torre fechada: maciça
    else retL(p,u0+ew,u1-ew,v0+ew,v1-ew,y0);
    /* piso do sino, pilares nos cantos, peitoril entre eles e o telhado da torre */
    retL(p,u0-0.1,u1+0.1,v0-0.1,v1+0.1,tw.yS);
    for(const[a,b]of[[u0,v0],[u1-0.6,v0],[u0,v1-0.6],[u1-0.6,v1-0.6]])cw(a,a+0.6,b,b+0.6,tw.yS,tw.yT);
    for(const[a0,a1,b0,b1]of[[u0+0.6,u1-0.6,v0,v0+0.3],[u0+0.6,u1-0.6,v1-0.3,v1],[u0,u0+0.3,v0+0.6,v1-0.6],[u1-0.3,u1,v0+0.6,v1-0.6]])cw(a0,a1,b0,b1,tw.yS,tw.yS+0.95);
    cw(u0-0.1,u1+0.1,v0-0.1,v1+0.1,tw.yT,tw.yT+0.6);
    if(esc){/* escada de marinheiro na parede do fundo, do chão da torre até o piso do sino */
      const um=(u0+u1)/2,lb=pw(p,um,v1-ew-0.12),bs=pw(p,um,v1-ew-0.85),tp=pw(p,um,v1-ew-0.95);
      const via=viaReta(lb[0],lb[1],y0,tw.yS,p.yaw,{x:bs[0],y:y0,z:bs[1]},{x:tp[0],y:tw.yS,z:tp[1],rumo:p.yaw+Math.PI},{id:'caltaTorre',pecas:true});via.tipo='escada';VIAS.push(via);tw.via=via;
      /* degraus de pedra do largo até a porta da torre */
      const wd=pw(p,um,-1.0),gd=ground(wd[0],wd[1]);tw.um=um;if(y0-gd>0.25){const L=Math.max(1.2,(y0-gd)*1.8);ramL(p,um-0.62,um+0.62,-L,0.02,gd,y0);tw.degrau={L,g:gd};}}
    T.push(tw);CA.obbs.push(caObb(c[0],c[1],2.6,2.6,0));}
  p.torres=T;CA.torre=T[1];info.torres=T.length;return p;}

/* ---------- o plano inclinado: trilhos e escadaria de serviço lado a lado; o bondinho parado no meio ---------- */
function caPlanoInclinado(info){const x=284,R=caRampa('Plano Inclinado',[x,-92.6],[x,-129.2],4.8,{dono:'caltaPlano',mureta:false,tipo:'plano'});
  const pl={x,R,carro:null};CA.plano=pl;
  /* guarda-corpo dos dois lados */
  const sl=R.L/R.ns;for(let i=0;i<R.ns;i++){const t=(i+0.5)*sl,c=R.pt(t),ya=R.ys[i],yb=R.ys[i+1];
    for(const sd of[-1,1])colBox(c[0]+sd*(R.w/2-0.05),c[1],0.05,sl/2+0.02,0,{solid:true,y0:Math.min(ya,yb)-0.3,y1:Math.max(ya,yb)+1.0,calta:true});}
  /* o bondinho, parado a 55% da subida, em cima dos trilhos (metade de oeste) */
  {const t=R.L*0.55,c=R.pt(t),y=R.yEm(t),inc=Math.atan2(R.yEm(t+2.4)-R.yEm(t-2.4),4.8);pl.carro={x:c[0]-1.15,z:c[1],y,inc,L:5.2,W:2.2,H:2.5};
    colBox(c[0]-1.15,c[1],1.1,2.6,0,{solid:true,y0:y-0.5,y1:y+2.6,calta:true});
    interAdd({id:'calta-bonde',kind:'bau',x:c[0]+0.3,z:c[1],y,yChk:y,r:1.8,label:'Revistar o bondinho',sub:'parado no meio da subida',tabela:'caltaBonde',respawn:3});info.saques++;}
  /* em cima: a casa das máquinas do bondinho (fio, fita e o fusível de reserva da primeira vez) */
  {const x=R.P1[0]-5.6,z=R.P1[1]-2.1,g=ground(x,z),y=R.ys[R.ns];pl.maq={x,z,g,y};colBox(x,z,1.8,2.2,0,{solid:true,y0:g-0.5,y1:y+3.0,calta:true});
    interAdd({id:'calta-maquinas',kind:'bau',x:x+2.4,z,y:Math.max(g,ground(x+2.4,z)),r:1.6,label:'Revistar a casa das máquinas',sub:'o painel do motor do bondinho',tabela:'caltaMaquinas',respawn:4,primeiro:[['fusivel',1],['fio',2],['fita',1]]});info.saques++;}
  return pl;}
LOOT.caltaMaquinas=[['fio',1,2,0.6],['fita',1,1,0.4],['pilhas',1,2,0.4],['sucata',1,3,0.5],['pregos',2,5,0.5],['fusivel',1,1,0.2],['alicate',1,1,0.1]];

/* ---------- o bairro inteiro ---------- */
const CA_RUAS=[
  {nome:'Rua Direita',pts:[[205,-131],[221,-133.5],[239,-134.5]],w:5,lados:[-1]},
  {nome:'Rua do Rosário',pts:[[207,-132],[211.5,-142.5],[217,-153.5]],w:4.6,lados:[-1]},
  {nome:'Rua da Matriz',pts:[[243,-139],[244.5,-147],[246.5,-155]],w:4.6,lados:[]},
  {nome:'Rua do Carmo',pts:[[293,-139.5],[288,-152],[281,-166],[270,-186],[257,-206],[244.5,-224]],w:5.4,lados:[-1]},
  {nome:'Rua Nova',pts:[[232,-177.5],[233,-193],[236,-210],[240,-224]],w:5,lados:[-1,1]},
  {nome:'Beco das Flores',pts:[[247.5,-165],[264,-166.5],[278.5,-165.5]],w:3.2,lados:[-1,1],calcada:0.6},
  {nome:'Rua da Cadeia',pts:[[230.5,-206],[218,-208.5],[204,-205]],w:4.6,lados:[-1,1]},
  {nome:'Travessa do Paço',pts:[[213.5,-183],[211.5,-193],[209.5,-202]],w:3.2,lados:[-1,1],calcada:0.6},
  {nome:'Beco do Sereno',pts:[[235,-200],[249,-201.5],[261.5,-199]],w:3,lados:[-1,1],calcada:0.6}];
const CA_LARGOS=[
  {id:'mirante',nome:'Praça do Mirante',x0:238,x1:298,z0:-139.5,z1:-128.2},
  {id:'matriz',nome:'Largo da Matriz',x0:216.5,x1:247,z0:-177.5,z1:-154.5},
  {id:'cruzeiro',nome:'Largo do Cruzeiro',x0:236,x1:252,z0:-236,z1:-224}];
LOOT.caltaTelhado=[['pano',1,2,0.45],['corda',1,1,0.25],['fita',1,1,0.25],['garrafa',1,2,0.35],['sucata',1,2,0.4],['vela',1,2,0.3],['bandagem',1,1,0.2],['municao9',2,4,0.12]];
LOOT.caltaBonde=[['agua',1,2,0.5],['biscoito',1,2,0.4],['pano',1,2,0.4],['remedios',1,1,0.2],['lanterna',1,1,0.12],['pilhas',1,2,0.3],['mochilaPequena',1,1,0.05],['canoFerro',1,1,0.06]];
LOOT.caltaSacristia=[['vela',2,5,0.8],['isqueiro',1,2,0.4],['pano',1,3,0.5],['agua',1,2,0.35],['bandagem',1,2,0.3],['remedios',1,1,0.15]];
function caMontar(){const R=rng(CA.seed),info={casas:0,abertas:0,saques:0,arvores:0,enfeite:0,pontos:0,lojas:0};CA.info=info;
  /* embaixo: o Largo do Plano (do tapume até o pé da encosta) */
  CA.largoPlano={x0:244,x1:294,z0:-92.5,z1:-84.6};
  /* subidas: a ladeira (diagonal na encosta) e o plano inclinado */
  const lad=caRampa('Ladeira da Conceição',[266,-92.2],[204.5,-128],6,{dono:'caltaLadeira'});info.ladeira={topo:+lad.ys[lad.ns].toFixed(2),inclMax:0};
  for(let i=0;i<lad.ns;i++)info.ladeira.inclMax=Math.max(info.ladeira.inclMax,+((lad.ys[i+1]-lad.ys[i])/(lad.L/lad.ns)).toFixed(2));
  caPlanoInclinado(info);
  for(const o of CA_RUAS)caRuaNova(o);
  for(const L of CA_LARGOS)CA.largos.push(Object.assign({},L));
  caLimpar(info);
  /* a igreja e os prédios abertos do Largo da Matriz */
  caIgreja(R,info);
  const LM=CA.largos.find(l=>l.id==='matriz');
  for(const o of[{nome:'Botica Santa Rita',tipo:'farmacia',placa:'BOTICA',frente:'N',x:225.2,z:LM.z1+4.6,W:8.4,D:8.4},
      {nome:'Padaria do Largo',tipo:'padaria',placa:'PADARIA',frente:'N',x:236.2,z:LM.z1+4.6,W:8.6,D:8.4},
      {nome:'Casa paroquial',tipo:'casa',casa:true,andares:2,frente:'S',x:223.5,z:LM.z0-4.7,W:8.6,D:8.6,cores:[0xe8e2d4,0xe2dccf,0x8a7a66,0x9a4a2e]},
      {nome:'Armazém Santa Rita',tipo:'conveniencia',placa:'ARMAZEM',frente:'S',x:241.2,z:LM.z0-4.7,W:9.2,D:8.6}]){
    try{caPredio(o);if(o.casa)info.abertas++;else info.lojas++;}catch(e){console.error('Cidade Alta: prédio',o.nome,e);}}
  /* casas abertas na Rua Nova (frente para a rua, que corre quase norte-sul) */
  {const r=CA.ruas.find(q=>q.nome==='Rua Nova');let k=0;
    for(const s of[9,26,40]){const p=caRuaEm(r,s);for(const lado of[1,-1]){if(k>=3)break;const W=8.2,D=8.4,nx=p.nx*lado,ok=Math.abs(nx)>0.85;if(!ok)continue;
      const cx=p.x+nx*(r.w/2+r.calcada+0.4+D/2),cz=p.z,ob=caObb(cx,cz,D/2+0.3,W/2+0.3,0);if(!caLivre(ob))continue;
      const fr=nx>0?'W':'E',cores=[caPick(R,CA_COR.fachada),0xe2dccf,0x8a7a66,caPick(R,CA_COR.telha)];
      try{caPredio({nome:'Sobrado nº '+(14+k*6)+' (Rua Nova)',tipo:'casa',casa:true,andares:R()<0.6?2:1,frente:fr,x:cx,z:cz,W,D,cores});k++;info.abertas++;}catch(e){console.error('Cidade Alta: casa aberta',e);}}}}
  /* casario fechado ao longo das ruas e em volta das praças */
  const fila=(r,lado,s0,s1,o)=>{const L=caFileira(r,lado,s0??0,s1??r.len,R,o);info.casas+=L.length;return L;};
  for(const r of CA.ruas)for(const lado of r.lados)fila(r,lado,1.5,r.len-1.5,r.w<4?{W:R=>4.6+R()*2.4,D:R=>6.5+R()*2.5,beco:0.1,Dmin:4.6}:undefined);
  /* segunda passada: casinhas estreitas nos vãos que sobraram */
  for(const r of CA.ruas)for(const lado of r.lados)fila(r,lado,1.0,r.len-1.0,{W:R=>4.2+R()*1.5,D:R=>5.8+R()*1.8,Dmin:4.4,beco:0.05});
  /* do lado do mar da Rua do Carmo: casas na beira do barranco (os fundos ficam em cima da pedra) */
  {const r=CA.ruas.find(q=>q.nome==='Rua do Carmo');fila(r,1,3,r.len-3,{D:R=>6.2+R()*1.6,Dmin:4.8,barr:-0.5,desnivel:6.5,beco:0.3,nMax:2});}
  /* frente para o mirante (as casas olham a cidade lá embaixo) */
  {const r=caRuaNova({nome:'Praça do Mirante',pts:[[248,-139.6],[268,-139.6],[287,-139.6]],w:0.2,calcada:0.3,lados:[],praca:true});fila(r,-1,0.5,r.len-0.5,{D:R=>7+R()*3});}
  /* volta do Largo do Cruzeiro (a oeste) e o lado de cima do Largo da Matriz atrás da igreja */
  {const r=caRuaNova({nome:'Largo do Cruzeiro',pts:[[236.2,-236],[236.2,-224.5]],w:0.2,calcada:0.3,lados:[],praca:true});fila(r,1,0.5,r.len-0.5,{nMax:2});}
  for(const h of CA.casas)caCasaColisao(h);
  caSaques(R,info);caPontos(R,info);caMata(R,info);
  caAtividades(lad,info);
  CALTA_LIGADO=true;
  /* a parede de mato do fim do mapa contorna o bairro */
  {const rem=new Set();for(const c of COLL)if(c.brenha)rem.add(c);
    for(const c of rem){if(c.cells)for(const k of c.cells){const l=CGRID.get(k);if(l){const i=l.indexOf(c);if(i>=0)l.splice(i,1);}}c.cells=null;}
    let j=0;for(let i=0;i<COLL.length;i++)if(!rem.has(COLL[i]))COLL[j++]=COLL[i];COLL.length=j;bordaMontar();}
  if(typeof vegDirty!=='undefined')vegDirty=true;CA.ok=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{caMontar();}catch(e){console.error('Cidade Alta',e);CA.erro=String(e&&e.stack||e);}return r;};}

/* ---------- o abrigo da Matriz e a Volta da Cidade Alta (68_atividades) ---------- */
function caAtividades(lad,info){const p=CA.igreja;
  if(p&&typeof abrigoNovo==='function'){const W=(u,v)=>pw(p,u,v),y=p.y0,q=W(10.35,1.5),cm=W(2.3,15.4),bu=W(8.9,16.7),bc=W(10.25,11.0);
    CA.abrigo=abrigoNovo({id:'matriz',nome:'Abrigo da Matriz',onde:'Cidade Alta',x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2,y,r:24,ok:()=>CA.ok,
      quadro:{x:q[0],y,z:q[1]},cama:{x:cm[0],y,z:cm[1]},bau:{x:bu[0],y,z:bu[1]},bancada:{x:bc[0],y,z:bc[1]},
      luzes:[[5.5,4],[5.5,10],[5.5,16]].map(([u,v],i)=>{const w=W(u,v);return{i,x:w[0],y:y+3.5,z:w[1]};})});
    /* o colchão, o baú e a bancada que ficaram na igreja (colisão: baú e bancada) */
    for(const[w,hw,hd,h]of[[bu,0.5,0.32,0.62],[bc,0.32,0.9,0.92]])colBox(w[0],w[1],hw,hd,p.yaw,{solid:true,y0:y-0.2,y1:y+h,calta:true});info.abrigo=true;}
  if(typeof corridaNova==='function'){const L=CA.largos,lm=L.find(l=>l.id==='matriz'),lc=L.find(l=>l.id==='cruzeiro'),lmi=L.find(l=>l.id==='mirante'),g=(x,z)=>ground(x,z);
    const pt=(x,z,y,r)=>({x,z,y:y??g(x,z),r:r||3.2}),la=lad.pt(lad.L*0.5),pl=CA.plano.R;
    CA.corrida=corridaNova({id:'calta-volta',nome:'Volta da Cidade Alta',onde:'Cidade Alta',ok:()=>CA.ok,ini:{x:271.5,y:g(271.5,-89.6),z:-89.6},
      dica:'Suba pela ladeira, passe pela Matriz, pelo Cruzeiro e pelo Mirante e desça pela escadaria do bondinho. Cortar por cima dos telhados vale.',
      pts:[pt(la[0],la[1],lad.yEm(lad.L*0.5),3.6),pt(207,-131.5),pt((lm.x0+lm.x1)/2+1.5,(lm.z0+lm.z1)/2-3.6),pt(233,-193),pt((lc.x0+lc.x1)/2+2,(lc.z0+lc.z1)/2+1.5),
        pt(268.5,-186),pt(266,(lmi.z0+lmi.z1)/2),pt(pl.P0[0]+1.3,pl.P0[1]+0.4,pl.ys[0],3.4)],
      tempos:{ouro:66,prata:82,bronze:105},xp:{bronze:40,prata:70,ouro:120},
      premios:{bronze:[['bandagem',2]],prata:[['fusivel',1],['kit',1]],ouro:[['mochilaPequena',1],['municao9',12]]}});info.corrida=CA.corrida.pts.length;}}
/* ---------- saque nos telhados (o que alguém deixou lá em cima) e na sacristia ---------- */
const CA_SAQUES={mochila:{label:'Revistar a mochila',sub:'largada no telhado'},caixa:{label:'Revistar a caixa',sub:'esquecida no telhado'},saco:{label:'Revistar o saco',sub:'amarrado na cumeeira'}};
function caSaques(R,info){const C=CA.casas.filter(h=>h.n>=2).sort(()=>R()-0.5),usados=[],tipos=['mochila','caixa','saco'];let k=0;
  for(const h of C){if(k>=10)break;if(usados.some(q=>Math.hypot(q[0]-h.cx,q[1]-h.cz)<16))continue;
    const u=(R()-0.5)*(h.W-1.6),v=(R()<0.5?-1:1)*(h.D/4+0.2),w=caPw(h,u,v),y=h.yE+h.hr*(1-Math.abs(v)/(h.D/2+CA_BEIRAL))+0.06,t=tipos[k%3],S=CA_SAQUES[t];
    interAdd({id:'calta-t'+k,kind:'bau',x:w[0],z:w[1],y,yChk:y,r:1.6,label:S.label,sub:S.sub,tabela:'caltaTelhado',respawn:3});CA.saques.push({k:t,h,u,v,y,r:R()*6.28});usados.push([h.cx,h.cz]);k++;info.saques++;}
  const p=CA.igreja;if(p){const w=pw(p,p.W-1.2,p.D-1.4);interAdd({id:'calta-sacristia',kind:'bau',x:w[0],z:w[1],y:p.y0,r:1.4,label:'Revistar a sacristia',sub:'o armário das velas',tabela:'caltaSacristia',respawn:4});info.saques++;}}
/* ---------- onde os zumbis nascem: nas ruas e nos largos ---------- */
function caPontos(R,info){const L=CA.pontos;
  for(const r of CA.ruas){if(r.praca)continue;for(let s=3;s<r.len-2;s+=6){const p=caRuaEm(r,s),x=p.x+p.nx*(R()-0.5)*r.w*0.6,z=p.z+p.nz*(R()-0.5)*r.w*0.6;if(!pointBlocked(x,z,0.6))L.push([x,z]);}}
  for(const G_ of CA.largos)for(let i=0;i<6;i++){const x=G_.x0+1+R()*(G_.x1-G_.x0-2),z=G_.z0+1+R()*(G_.z1-G_.z0-2);if(!pointBlocked(x,z,0.6))L.push([x,z]);}
  {const lp=CA.largoPlano;for(let x=lp.x0+3;x<lp.x1-2;x+=6)if(!pointBlocked(x,-88.5,0.6))L.push([x,-88.5]);}
  info.pontos=L.length;}
/* ---------- verde: quintais (atrás das casas), a beira do barranco e a mata de enfeite fora do mapa ---------- */
function caMata(R,info){let id=TREES.reduce((m,t)=>Math.max(m,t.id|0),-1)+1;
  const arv=(x,z,col,s,kind)=>{const r0=R(),k=kind??(r0<0.5?1:r0<0.78?0:r0<0.92?3:2),t={id:id++,x,z,y:ground(x,z)-0.15*s,s,r:R()*6.283,kind:k,hp:5,alive:true,t:0.82+R()*0.3,calta:true};
    TREES.push(t);if(col)colCircle(x,z,TREE_R*s,{tree:t});return t;};
  const longeDeTudo=(x,z,m)=>{for(const r of CA.ruas)if(caRuaDist(r,x,z).d<r.w/2+r.calcada+m)return false;for(const L of CA.largos)if(x>L.x0-m&&x<L.x1+m&&z>L.z0-m&&z<L.z1+m)return false;
    const ob=caObb(x,z,m,m,0);for(const o of CA.obbs)if(caObbBate(ob,o))return false;return!pointBlocked(x,z,m);};
  for(let i=0;i<5000&&info.arvores<70;i++){const x=CA.caixa.x0+3+R()*(CA.caixa.x1-CA.caixa.x0),z=-124-R()*112;if(!dentroCAlta(x,z,2)||x>caBarranco(z)-2||!longeDeTudo(x,z,2.4))continue;
    arv(x,z,true,1.0+R()*0.8);info.arvores++;}
  /* fora do mapa (oeste e norte): mata de enfeite, sem colisão */
  for(let i=0;i<6000&&info.enfeite<220;i++){const x=CA.caixa.x0-40+R()*(caBarranco(CA.caixa.z0)-CA.caixa.x0+40),z=-112-R()*(CA.caixa.z0*-1-112+40);
    if(dentroCAlta(x,z,-3.5)||dentroMapa(x,z,-3.5)||ground(x,z)<6)continue;if(R()>0.7)continue;arv(x,z,false,1.1+R()*1.0);info.enfeite++;}
  for(let i=0;i<6000&&(info.capim||0)<1200;i++){const x=CA.caixa.x0+2+R()*(CA.caixa.x1-CA.caixa.x0),z=-122-R()*114;
    if(!dentroCAlta(x,z,0.5)||x>caBarranco(z)+4||!longeDeTudo(x,z,0.5))continue;GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.6+R()*0.6,t:0.75+R()*0.4,calta:true});info.capim=(info.capim||0)+1;}}

/* ================= desenho ================= */
function caChunksNovos(){CA.chunks=[];const B=CA.caixa,nx=3,nz=4,wx=(B.x1-B.x0)/nx,wz=(B.z1-B.z0)/nz;
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)CA.chunks.push({i,j,x0:B.x0+i*wx-4,x1:B.x0+(i+1)*wx+4,z0:B.z0+j*wz-4,z1:B.z0+(j+1)*wz+4,gB:new GB(1<<15,8),gD:new GB(1<<15,8),gL:new GB(1<<12,8),mB:null,mD:null,mL:null});}
function caCh(x,z){const B=CA.caixa,i=clamp(Math.floor((x-B.x0)/((B.x1-B.x0)/3)),0,2),j=clamp(Math.floor((z-B.z0)/((B.z1-B.z0)/4)),0,3);return CA.chunks[i*4+j];}
/* quadrilátero no chão (quatro cantos já com altura), cor com variação */
function caQuad(g,A,B,C,D,cor,R,j){const ux=B[0]-A[0],uz=B[2]-A[2],vx=C[0]-A[0],vz=C[2]-A[2],ny=uz*vx-ux*vz;   // sempre virado para cima
  add(g,ny>=0?[[A,B,C],[C,B,D]]:[[A,C,B],[B,C,D]],ID,typeof cor==='number'?lin(cor):cor,{keepWind:true,j:j??0.06,rnd:R});}
/* sólido de 8 cantos (A0..A3 numa ponta, B0..B3 na outra, na mesma ordem): muro inclinado que acompanha a rampa */
function caPrisma(g,A,B,cor,R,j){const F=(a,b,c,d)=>[[a,b,c],[a,c,d]];
  add(g,[...F(A[0],A[1],B[1],B[0]),...F(A[3],A[2],B[2],B[3]),...F(A[0],A[3],B[3],B[0]),...F(A[1],A[2],B[2],B[1]),...F(A[0],A[1],A[2],A[3]),...F(B[0],B[1],B[2],B[3])],ID,typeof cor==='number'?lin(cor):cor,{j:j??0.06,rnd:R});}
const caYc=(x,z,e)=>ground(x,z)+(e??0.04);
/* pedra de rua: tons de cinza e marrom, pedra por pedra */
const CA_PEDRAS=[0x8f8a80,0x9a948a,0x847f76,0xa39c90,0x8a8174,0x968d80];
function caGeoRua(r,R){const w=r.w,c=r.calcada,dS=1.0;
  for(let s=0;s<r.len-0.01;s+=dS){const s1=Math.min(r.len,s+dS),a=caRuaEm(r,s),b=caRuaEm(r,s1),ch=caCh(a.x,a.z),nf=w>=4?5:3;
    for(let k=0;k<nf;k++){const q0=-w/2+w*k/nf,q1=-w/2+w*(k+1)/nf,P=(p,q)=>[p.x+p.nx*q,0,p.z+p.nz*q],A=P(a,q0),Bq=P(a,q1),C=P(b,q0),D=P(b,q1);
      for(const v of[A,Bq,C,D])v[1]=caYc(v[0],v[2],0.035);if(caForaBarr(A)||caForaBarr(D))continue;caQuad(ch.gB,A,Bq,C,D,caPick(R,CA_PEDRAS),R,0.1);}
    if(r.praca)continue;
    /* calçada (um pouco mais alta) e o meio-fio */
    for(const sd of[-1,1]){const P=(p,q,e)=>{const x=p.x+p.nx*q*sd,z=p.z+p.nz*q*sd;return[x,caYc(x,z,e),z];};
      const A=P(a,w/2+0.12,0.12),Bq=P(a,w/2+c,0.12),C=P(b,w/2+0.12,0.12),D=P(b,w/2+c,0.12);if(caForaBarr(A)||caForaBarr(D))continue;
      caQuad(ch.gB,A,Bq,C,D,CA_COR.calcada,R,0.05);
      const E=P(a,w/2,0.035),F=P(a,w/2+0.12,0.13),Gq=P(b,w/2,0.035),H=P(b,w/2+0.12,0.13);caQuad(ch.gB,E,F,Gq,H,0xa8a296,R,0.03);}}}
const caForaBarr=p=>p[0]>caBarranco(p[2])+1.5;
/* largo: lajotas de pedra; a Praça do Mirante em pedra portuguesa (ondas pretas e brancas) */
function caGeoLargo(L,R){const d=L.id==='mirante'?0.42:1.0;
  for(let x=L.x0;x<L.x1-0.01;x+=d)for(let z=L.z0;z<L.z1-0.01;z+=d){const x1=Math.min(L.x1,x+d),z1=Math.min(L.z1,z+d);if(x1>caBarranco((z+z1)/2)-0.5)continue;
    const ch=caCh(x,z),A=[x,caYc(x,z),z],B=[x1,caYc(x1,z),z],C=[x,caYc(x,z1),z1],D=[x1,caYc(x1,z1),z1];let cor;
    if(L.id==='mirante'){const xm=(x+x1)/2,zm=(z+z1)/2,w=Math.sin(xm*0.34+1.7*Math.sin(zm*0.42));cor=w>0.62?0x2c2c2a:(R()<0.15?0xdcd6c8:0xe8e4da);}
    else{const borda=x<L.x0+d||x1>L.x1-d||z<L.z0+d||z1>L.z1-d;cor=borda?0x7d786e:caPick(R,[0xb0a898,0xa8a090,0xb8b0a0,0xa09888]);}
    add(ch.gB,[[A,C,B],[B,C,D]],ID,lin(cor),{keepWind:true,j:0.05,rnd:R});}}
/* rampa: pedra na pista; muro de arrimo de pedra e mureta do lado de baixo; meio-fio do lado de cima */
function caGeoRampa(Rp,R){const n=Rp.n,d=Rp.d,w=Rp.w,sl=Rp.L/Rp.ns,ld=Rp.lado,pl=Rp.tipo==='plano';
  for(let i=0;i<Rp.ns;i++){const t0=i*sl,t1=(i+1)*sl,ya=Rp.ys[i],yb=Rp.ys[i+1],a=Rp.pt(t0),b=Rp.pt(t1),ch=caCh(a[0],a[1]);
    const P=(p,q,y)=>[p[0]+n[0]*q,y,p[1]+n[1]*q];
    if(!pl){const nf=6;for(let k=0;k<nf;k++){const q0=-w/2+w*k/nf,q1=-w/2+w*(k+1)/nf;caQuad(ch.gB,P(a,q0,ya+0.02),P(a,q1,ya+0.02),P(b,q0,yb+0.02),P(b,q1,yb+0.02),caPick(R,CA_PEDRAS),R,0.1);}}
    /* corpo da rampa até o chão: muro de arrimo de pedra (com a mureta em cima) do lado de baixo, meio-fio do lado de cima */
    for(const sd of[-1,1]){const baixo=sd===ld,qi=sd*(w/2-(baixo?0.26:0.12)),qo=sd*(w/2+0.02),G=(p,q)=>ground(p[0]+n[0]*q,p[1]+n[1]*q);
      const ta=ya+(baixo&&Rp.mureta?0.95:0.06),tb=yb+(baixo&&Rp.mureta?0.95:0.06),ba=Math.min(G(a,qo),ya)-0.45,bb=Math.min(G(b,qo),yb)-0.45;
      caPrisma(ch.gB,[P(a,qi,ba),P(a,qo,ba),P(a,qo,ta),P(a,qi,ta)],[P(b,qi,bb),P(b,qo,bb),P(b,qo,tb),P(b,qi,tb)],baixo?CA_COR.pedraEsc:CA_COR.pedra,R,0.08);}
    {const q0=-w/2+0.12,q1=w/2-0.12,ba=Math.min(ground(a[0],a[1]),ya)-0.45,bb=Math.min(ground(b[0],b[1]),yb)-0.45;   // enchimento por baixo da pista
      caPrisma(ch.gL,[P(a,q0,ba),P(a,q1,ba),P(a,q1,ya),P(a,q0,ya)],[P(b,q0,bb),P(b,q1,bb),P(b,q1,yb),P(b,q0,yb)],CA_COR.pedraEsc,R,0.05);}
    if(pl){/* plano inclinado: dormentes e trilhos na metade de oeste, degraus na de leste */
      const xr0=Rp.P0[0]-w/2,xm=Rp.P0[0]-0.15,zA=a[1],zB=b[1],yA=ya,yB=yb;caQuad(ch.gB,[xr0,yA+0.01,zA],[xm,yA+0.01,zA],[xr0,yB+0.01,zB],[xm,yB+0.01,zB],0x6d665c,R,0.08);
      const zc=(zA+zB)/2,yc=(yA+yB)/2,inc=Math.atan2(yB-yA,Math.abs(zB-zA));add(ch.gD,boxTris(2.0,0.08,0.22),mat((xr0+xm)/2,yc+0.06,zc,inc,0,0),lin(0x5a4430),{j:0.1,rnd:R});
      for(const xx of[xr0+0.55,xm-0.55])add(ch.gD,boxTris(0.07,0.1,Math.hypot(sl,yB-yA)+0.02),mat(xx,yc+0.15,zc,inc,0,0),lin(0x6a6e70));
      const hh=yB-yA,k=Math.max(1,Math.round(hh/0.19));for(let j=0;j<k;j++){const zt0=zA+(zB-zA)*j/k,zt1=zA+(zB-zA)*(j+1)/k,yt=yA+hh*(j+1)/k;
        mbx(ch.gB,ID,xm,Rp.P0[0]+w/2,Math.min(yA,ground(xm,zt0))-0.3,yt,Math.min(zt0,zt1),Math.max(zt0,zt1),0x9a968e,{j:0.05,rnd:R});}
      for(const sd of[-1,1]){const xx=Rp.P0[0]+sd*(w/2-0.05);add(ch.gD,boxTris(0.05,0.05,Math.hypot(sl,yB-yA)+0.02),mat(xx,yc+1.0,zc,inc,0,0),lin(0x3a3e40));
        if(i%2===0)add(ch.gD,boxTris(0.05,1.0,0.05),mat(xx,yA+0.5,zA),lin(0x3a3e40));}}}
  /* postes coloniais ao longo da ladeira (do lado de cima) */
  if(!pl)for(let t=4;t<Rp.L-2;t+=13){const p=Rp.pt(t),q=-ld*(w/2+0.35),x=p[0]+n[0]*q,z=p[1]+n[1]*q;caPoste(caCh(x,z),x,Math.max(Rp.yEm(t),ground(x,z)),z,R);}}
/* poste colonial: coluna de ferro, braço e lanterna de vidro */
function caPoste(ch,x,y,z,R,sem){add(ch.gB,cylTris(0.07,0.1,3.6,7),mat(x,y,z),lin(0x24272a));add(ch.gD,cylTris(0.14,0.16,0.35,8),mat(x,y,z),lin(0x24272a));
  add(ch.gD,boxTris(0.04,0.04,0.55),mat(x,y+3.45,z+0.25),lin(0x24272a));add(ch.gD,boxTris(0.26,0.4,0.26),mat(x,y+3.25,z+0.5),lin(0xd8c890),{e:0.15});
  add(ch.gD,cylTris(0.02,0.2,0.16,4,{phase:Math.PI/4}),mat(x,y+3.45,z+0.5),lin(0x24272a));if(!sem)colCircle(x,z,0.12,{solid:true,y0:y-0.5,y1:y+3.7,calta:true});CA.postes.push([x,y+3.25,z+0.5]);}
/* ---------- sobrado: corpo, base de pedra, barrado, cunhais, frisos, cimalha, portas, janelas com veneziana, sacadas,
   oitão e telhado de telha (canal por canal no detalhe) ---------- */
function caGeoCasa(h,R){const ch=caCh(h.cx,h.cz),gB=ch.gB,gD=ch.gD,M=mat(h.cx,0,h.cz,0,h.yaw,0),W=h.W,D=h.D,FH=CA_FH,b=h.base,yE=h.yE,hr=h.hr,ov=CA_BEIRAL,J={j:0.03,rnd:R};
  const B=(g,u0,u1,y0,y1,v0,v1,cor,o)=>mbx(g,M,u0,u1,y0,y1,v0,v1,cor,o||J);
  const cM=h.corMold,cF=h.cor,fr=-D/2,bk=D/2;
  if(b-h.yMin>0.05)B(gB,-W/2-0.02,W/2+0.02,h.yMin-0.5,b,-D/2-0.02,D/2+0.02,CA_COR.pedra,{j:0.06,rnd:R});
  B(gB,-W/2,W/2,b,yE,-D/2,D/2,cF);
  B(gD,-W/2-0.01,W/2+0.01,b,b+0.7,fr-0.03,fr,caEsc(cF,0.72));B(gD,-W/2-0.01,W/2+0.01,b,b+0.7,bk,bk+0.03,caEsc(cF,0.72));
  for(const su of[-1,1]){const viz=su<0?h.vizE:h.vizD,exp=!viz||viz.yE<yE-0.2,u=su*W/2;
    B(gB,su<0?u-0.02:u-0.3,su<0?u+0.3:u+0.02,b,yE,fr-0.05,fr+0.3,cM);B(gB,su<0?u-0.02:u-0.3,su<0?u+0.3:u+0.02,b,yE,bk-0.3,bk+0.05,cM);
    if(exp&&!viz)B(gD,su<0?u-0.03:u-0.01,su<0?u+0.01:u+0.03,b,b+0.7,fr+0.3,bk-0.3,caEsc(cF,0.72));}
  const yA=f=>b+(f?h.fh1+(f-1)*FH:0);
  for(let f=1;f<h.n;f++){const y=yA(f);B(gD,-W/2,W/2,y-0.06,y+0.08,fr-0.07,fr,cM);}
  B(gB,-W/2-0.04,W/2+0.04,yE-0.26,yE,fr-0.18,fr,cM);B(gB,-W/2-0.04,W/2+0.04,yE-0.26,yE,bk,bk+0.18,cM);
  /* fachada: porta(s) e janelas no térreo; em cima, janela de peitoril ou porta de sacada */
  const nv=h.vaos,pas=W/nv;
  for(let f=0;f<h.n;f++){const y0=yA(f);
    for(let j=0;j<nv;j++){const s=-W/2+pas*(j+0.5);
      if(f===0){if(j===h.portaJ){const lw=1.1,yt=y0+Math.min(2.45,h.fh1-0.4);B(gB,s-lw/2,s+lw/2,y0,yt,fr-0.02,fr+0.02,h.corPorta);
          B(gD,s-lw/2-0.13,s-lw/2,y0,yt+0.14,fr-0.05,fr,cM);B(gD,s+lw/2,s+lw/2+0.13,y0,yt+0.14,fr-0.05,fr,cM);B(gD,s-lw/2-0.13,s+lw/2+0.13,yt,yt+0.14,fr-0.06,fr,cM);
          B(gD,s-0.015,s+0.015,y0+0.1,yt-0.1,fr-0.04,fr-0.02,caEsc(h.corPorta,0.7));for(const q of[-1,1])B(gD,s+q*lw/4-0.15,s+q*lw/4+0.15,y0+0.45,y0+1.25,fr-0.04,fr-0.02,caEsc(h.corPorta,0.82));
          B(gD,s-lw/2-0.1,s+lw/2+0.1,y0-0.14,y0+0.02,fr-0.35,fr,CA_COR.pedra);continue;}
        caJanela(B,gB,gD,s,y0+0.95,0.95,Math.min(1.5,h.fh1-1.4),fr,h,R,false);continue;}
      const sac=h.sacada&&f===1;
      if(sac)caJanela(B,gB,gD,s,y0+0.06,1.0,2.2,fr,h,R,true);else caJanela(B,gB,gD,s,y0+0.95,0.9,1.55,fr,h,R,false);}}
  for(const[u0,u1,y]of h.sacadas||[]){B(gB,u0,u1,y-0.1,y+0.06,fr-0.6,fr,CA_COR.pedra);const gr=CA_COR.ferro;
    B(gD,u0,u1,y+0.95,y+0.99,fr-0.6,fr-0.56,gr);B(gD,u0,u0+0.04,y+0.06,y+0.99,fr-0.6,fr,gr);B(gD,u1-0.04,u1,y+0.06,y+0.99,fr-0.6,fr,gr);
    for(let q=u0+0.15;q<u1-0.06;q+=0.15)B(gD,q-0.01,q+0.01,y+0.06,y+0.95,fr-0.59,fr-0.57,gr);
    for(let q=0.15;q<0.56;q+=0.15){B(gD,u0,u0+0.02,y+0.06,y+0.95,fr-q-0.01,fr-q+0.01,gr);B(gD,u1-0.02,u1,y+0.06,y+0.95,fr-q-0.01,fr-q+0.01,gr);}}
  /* fundos: janelas simples e a porta da cozinha */
  for(let f=0;f<h.n;f++){const y0=yA(f),nb=Math.max(1,Math.round((W-0.8)/2.6));for(let j=0;j<nb;j++){if(R()<0.25)continue;const s=-W/2+W*(j+0.5)/nb;
    if(f===0&&j===0){B(gB,s-0.5,s+0.5,y0,y0+2.3,bk-0.02,bk+0.02,h.corPorta);continue;}
    B(gB,s-0.45,s+0.45,y0+1.1,y0+2.2,bk-0.02,bk+0.025,CA_COR.vidro);B(gD,s-0.53,s+0.53,y0+1.02,y0+1.1,bk,bk+0.07,cM);}}
  /* lado aberto (sem vizinha): umas janelas pequenas */
  for(const su of[-1,1]){if(su<0?h.vizE:h.vizD)continue;const u=su*W/2;for(let f=0;f<h.n;f++){const y0=yA(f);if(R()<0.4)continue;
    B(gB,su<0?u-0.025:u-0.02,su<0?u+0.02:u+0.025,y0+1.2,y0+2.1,-0.45,0.45,CA_COR.vidro);}}
  /* oitão e as duas águas de telha, com beiral, testeira e cumeeira */
  add(gB,roofTris(D,hr,W),mm(M,mat(0,yE,0,0,Math.PI/2,0)),lin(cF),J);
  const run=D/2+ov,L=Math.hypot(run,hr),th=Math.atan2(hr,run),ct=lin(h.corTelha),eu0=-W/2-(h.vizE?0:0.25),eu1=W/2+(h.vizD?0:0.25),ew=eu1-eu0,em=(eu0+eu1)/2;
  for(const sv of[-1,1]){const Ms=mm(M,mat(em,yE+hr/2+0.06,sv*run/2,sv<0?-th:th,0,0));add(gB,boxTris(ew,0.12,L+0.02),Ms,ct,{j:0.05,rnd:R});
    for(let u=-ew/2+0.21;u<ew/2-0.1;u+=0.42)add(gD,boxTris(0.08,0.04,L),mm(Ms,mat(u,0.07,0)),scl(ct,0.8));
    add(gD,boxTris(ew,0.1,0.06),mm(Ms,mat(0,-0.03,sv*L/2)),lin(0x3a2a1c));}
  add(gB,boxTris(ew+0.02,0.17,0.28),mm(M,mat(em,h.yR+0.09,0)),lin(CA_COR.cumeeira),{j:0.04,rnd:R});
  /* longe: o volume, o oitão e o telhado numa cor */
  {const gL=ch.gL;mbx(gL,M,-W/2,W/2,Math.min(h.yMin,b)-0.4,yE,-D/2,D/2,cF);add(gL,roofTris(D+2*ov,hr+0.1,ew),mm(M,mat(em,yE,0,0,Math.PI/2,0)),ct);}}
function caJanela(B,gB,gD,s,y,w,hh,fr,h,R,porta){const cM=h.corMold;
  B(gB,s-w/2,s+w/2,y,y+hh,fr-0.02,fr+0.02,CA_COR.vidro);
  B(gD,s-w/2-0.12,s+w/2+0.12,y+hh,y+hh+0.15,fr-0.06,fr,cM);B(gD,s-w/2-0.12,s-w/2,y-0.04,y+hh,fr-0.05,fr,cM);B(gD,s+w/2,s+w/2+0.12,y-0.04,y+hh,fr-0.05,fr,cM);
  if(!porta)B(gD,s-w/2-0.15,s+w/2+0.15,y-0.1,y,fr-0.1,fr,cM);
  const k=R();if(k<0.42){B(gD,s-w/2,s-0.01,y,y+hh,fr-0.04,fr-0.015,h.corJan);B(gD,s+0.01,s+w/2,y,y+hh,fr-0.04,fr-0.015,h.corJan);
    for(let q=y+0.17;q<y+hh-0.1;q+=0.17)B(gD,s-w/2+0.04,s+w/2-0.04,q-0.012,q+0.012,fr-0.05,fr-0.035,caEsc(h.corJan,0.75));}
  else if(k<0.8){B(gD,s-w-0.12,s-w/2-0.12,y,y+hh,fr-0.05,fr-0.02,h.corJan);B(gD,s+w/2+0.12,s+w+0.12,y,y+hh,fr-0.05,fr-0.02,h.corJan);}
  else B(gD,s-w/2,s,y,y+hh,fr-0.04,fr-0.015,h.corJan);}
/* ---------- igreja: telhado, adro, base de pedra e as duas torres (sino, pináculo e cruz) ---------- */
function caGeoIgreja(p,R){const ch=caCh(p.x0+2,(p.z0+p.z1)/2),gB=ch.gB,gD=ch.gD,M=mat(p.ox,0,p.oz,0,p.yaw,0),cF=0xece6d8,cM=0xd8ccb0,C=p.calta;
  igrejaTelhado(gB,p);
  if(p.y0-C.yMin>0.2)mbx(gB,M,-0.05,p.W+0.05,C.yMin-0.5,p.yq,-0.05,p.D+0.05,CA_COR.pedra,{j:0.05,rnd:R});
  if(C.adro){const L=C.adro.L,hh=p.yq-C.adro.g,k=Math.max(2,Math.round(hh/0.18));for(let i=0;i<k;i++){const yt=C.adro.g+(i+1)*hh/k,va=-1.35-L+L*i/k;mbx(gB,M,p.W/2-1.75,p.W/2+1.75,C.adro.g-0.4,yt,va,-1.35,0x9a958a,{j:0.04,rnd:R});}}
  for(const t of p.torres){const u0=t.u0,u1=t.u1,v0=t.v0,v1=t.v1,y0=t.y0,yS=t.yS,yT=t.yT;
    mbx(gB,M,u0,u1,t.gn-0.5,yS,v0,v1,cF,{j:0.03,rnd:R});
    for(const[a0,a1]of[[u0-0.06,u0+0.35],[u1-0.35,u1+0.06]])for(const[b0,b1]of[[v0-0.06,v0+0.35],[v1-0.35,v1+0.06]])mbx(gB,M,a0,a1,t.gn-0.5,yS,b0,b1,cM);
    for(const y of[y0+5.0,y0+9.0])mbx(gD,M,u0-0.1,u1+0.1,y,y+0.25,v0-0.1,v1+0.1,cM);
    mbx(gB,M,u0-0.12,u1+0.12,yS-0.3,yS,v0-0.12,v1+0.12,cM);
    /* janelinhas (seteiras) e a porta da torre da escada */
    for(const y of[y0+4.0,y0+8.0])mbx(gD,M,(u0+u1)/2-0.22,(u0+u1)/2+0.22,y,y+1.1,v0-0.02,v0+0.01,0x15171a);
    if(t.esc){mbx(gB,M,t.um-0.6,t.um+0.6,y0,y0+2.3,v0-0.03,v0+0.02,0x3a2a1a);mbx(gD,M,t.um-0.72,t.um+0.72,y0+2.3,y0+2.46,v0-0.06,v0,cM);
      if(t.degrau){const L=t.degrau.L,hh=y0-t.degrau.g,k=Math.max(2,Math.round(hh/0.18));for(let i=0;i<k;i++){const yt=t.degrau.g+(i+1)*hh/k,va=-L+L*i/k;mbx(gB,M,t.um-0.65,t.um+0.65,t.degrau.g-0.4,yt,va,0,0x9a958a,{j:0.04,rnd:R});}}
      /* escada de marinheiro por dentro (aparece pela porta) */
      const lv=v1-0.45-0.12;for(const s of[-0.24,0.24])mbx(gD,M,t.um+s-0.025,t.um+s+0.025,y0,yS+0.9,lv-0.025,lv+0.025,0x4a4f52);
      for(let y=y0+0.3;y<yS+0.8;y+=0.3)mbx(gD,M,t.um-0.24,t.um+0.24,y-0.015,y+0.015,lv-0.015,lv+0.015,0x4a4f52);}
    /* campanário: pilares, peitoril, arcos e o sino */
    for(const[a,b]of[[u0,v0],[u1-0.6,v0],[u0,v1-0.6],[u1-0.6,v1-0.6]])mbx(gB,M,a,a+0.6,yS,yT,b,b+0.6,cF);
    for(const[a0,a1,b0,b1]of[[u0+0.6,u1-0.6,v0,v0+0.3],[u0+0.6,u1-0.6,v1-0.3,v1],[u0,u0+0.3,v0+0.6,v1-0.6],[u1-0.3,u1,v0+0.6,v1-0.6]]){mbx(gB,M,a0,a1,yS,yS+0.95,b0,b1,cF);mbx(gD,M,a0-0.04,a1+0.04,yS+0.95,yS+1.05,b0-0.04,b1+0.04,cM);}
    for(const[a0,a1,b0,b1]of[[u0+0.6,u1-0.6,v0,v0+0.3],[u0+0.6,u1-0.6,v1-0.3,v1],[u0,u0+0.3,v0+0.6,v1-0.6],[u1-0.3,u1,v0+0.6,v1-0.6]])mbx(gB,M,a0,a1,yT-0.75,yT,b0,b1,cF);
    mbx(gB,M,u0-0.15,u1+0.15,yT,yT+0.35,v0-0.15,v1+0.15,cM);
    const um=(u0+u1)/2,vm=(v0+v1)/2,Mt=mm(M,mat(um,yT+0.35,vm));
    add(gB,cylTris(0.15,(u1-u0)/2+0.1,3.2,4,{phase:Math.PI/4}),Mt,lin(0x7a3a28),{j:0.03,rnd:R});   // pináculo de telha
    add(gD,boxTris(0.09,1.4,0.09),mm(Mt,mat(0,3.8,0)),lin(0x3a2a1a));add(gD,boxTris(0.7,0.09,0.09),mm(Mt,mat(0,4.1,0)),lin(0x3a2a1a));
    add(gB,cylTris(0.12,0.62,0.9,12),mm(M,mat(um,yS+1.35,vm)),lin(0x8a6a2a),{j:0.02,rnd:R});add(gD,cylTris(0.1,0.1,0.25,8),mm(M,mat(um,yS+2.25,vm)),lin(0x3a2a1a));
    add(gD,boxTris((u1-u0)-1.2,0.12,0.12),mm(M,mat(um,yS+2.45,vm)),lin(0x4a3424));
    /* longe */
    mbx(ch.gL,M,u0,u1,t.gn-0.5,yT+0.35,v0,v1,cF);add(ch.gL,cylTris(0.15,(u1-u0)/2+0.1,3.2,4,{phase:Math.PI/4}),Mt,lin(0x7a3a28));}
  /* longe: a nave e o telhado */
  mbx(ch.gL,M,0,p.W,C.yMin-0.5,p.y0+p.H,0,p.D,cF);{const hr=p.hr,run=p.W/2+0.45;add(ch.gL,roofTris(2*run,hr,p.D+0.7),mm(M,mat(p.W/2,p.y0+p.H,p.D/2)),lin(0x7a3a28));}}
/* prédios abertos: degraus, base de pedra e o volume de longe */
function caGeoPredio(p,R){const ch=caCh((p.x0+p.x1)/2,(p.z0+p.z1)/2),M=mat(p.ox,0,p.oz,0,p.yaw,0),C=p.calta||{};
  for(const d of C.degraus||[]){const hh=p.y0-d.g,k=Math.max(2,Math.round(hh/0.18)),L=Math.abs(d.v1-d.v0);for(let i=0;i<k;i++){const yt=d.g+(i+1)*hh/k,va=d.v0+L*i/k;mbx(ch.gB,M,d.u-0.66,d.u+0.66,d.g-0.35,yt,va,d.v1,0x9a958a,{j:0.05,rnd:R});}}
  if(C.yMin!==undefined&&p.y0-C.yMin>0.4)mbx(ch.gB,M,-0.03,p.W+0.03,C.yMin-0.5,p.yq-0.4,-0.03,p.D+0.03,CA_COR.pedra,{j:0.06,rnd:R});
  const cor=(p.cores||CID_COR[p.tipo]||CID_COR.casa)[0];mbx(ch.gL,M,0,p.W,(C.yMin??p.yq)-0.5,p.yTopo,0,p.D,cor);
  if(p.casa){const hr=1.5;add(ch.gL,roofTris(p.D+0.9,hr,p.W+0.8),mm(M,mat(p.W/2,p.yTopo,p.D/2,0,Math.PI/2,0)),lin((p.cores||CID_COR.casa)[3]));}}
/* ---------- o plano inclinado: o bondinho, a bilheteria de baixo e a cobertura de cima ---------- */
function caGeoPlano(R){const pl=CA.plano;if(!pl)return;const Rp=pl.R,c=pl.carro,ch=caCh(c.x,c.z);
  if(!CA_BONDE_MOVEL){const M=mat(c.x,c.y+0.35,c.z,c.inc,0,0),cor=0xc8a428,cor2=0x2a5a8a;
    add(ch.gB,boxTris(c.W,0.3,c.L),mm(M,mat(0,0.15,0)),lin(0x3a3e40));
    for(let k=0;k<3;k++){const z0=-c.L/2+k*c.L/3,yk=0;add(ch.gB,boxTris(c.W,c.H,c.L/3-0.04),mm(M,mat(0,0.3+c.H/2+yk,z0+c.L/6)),lin(k===1?cor:cor),{j:0.04,rnd:R});
      for(const sd of[-1,1])add(ch.gD,boxTris(0.03,0.8,c.L/3-0.5),mm(M,mat(sd*(c.W/2+0.01),0.3+c.H*0.62+yk,z0+c.L/6)),lin(0x1a1e22));
      add(ch.gD,boxTris(c.W+0.04,0.18,c.L/3-0.02),mm(M,mat(0,0.3+0.5+yk,z0+c.L/6)),lin(cor2));}
    add(ch.gB,boxTris(c.W+0.2,0.12,c.L+0.2),mm(M,mat(0,0.3+c.H+0.6,0)),lin(0x6a6e70));
    add(ch.gL,boxTris(c.W,c.H+0.6,c.L),mm(M,mat(0,0.3+c.H/2,0)),lin(cor));}
  /* embaixo: portal com a placa e a bilheteria */
  {const x=Rp.P0[0],z=Rp.P0[1]+0.6,y=Rp.ys[0],ch0=caCh(x,z);for(const sd of[-1,1]){add(ch0.gB,bvTris(0.35,3.4,0.35),mat(x+sd*2.6,y+1.7,z),lin(0xe0d8c4));colCircle(x+sd*2.6,z,0.22,{solid:true,y0:y-0.5,y1:y+3.4,calta:true});}
    add(ch0.gB,boxTris(5.6,0.6,0.4),mat(x,y+3.6,z),lin(0xe0d8c4));add(ch0.gD,boxTris(4.4,0.42,0.06),mat(x,y+3.6,z+0.22),lin(0x2a5a8a));
    textoBlocos(ch0.gD,mat(x,y+3.47,z+0.26),'PLANO INCLINADO',0.045,0xf0ece0);
    const bx=x+5.2,bz=z+1.8,gb=ground(bx,bz);mbx(ch0.gB,ID,bx-1.2,bx+1.2,gb-0.3,gb+2.6,bz-1.0,bz+1.0,0xe0d8c4,{j:0.03,rnd:R});mbx(ch0.gB,ID,bx-1.35,bx+1.35,gb+2.6,gb+2.8,bz-1.15,bz+1.15,0x7a3a28);
    mbx(ch0.gD,ID,bx-0.6,bx+0.6,gb+1.0,gb+1.8,bz+0.99,bz+1.02,0x15171a);colBox(bx,bz,1.2,1.0,0,{solid:true,y0:gb-0.5,y1:gb+2.8,calta:true});}
  /* em cima: cobertura de concreto sobre a chegada e a casa das máquinas */
  {const x=Rp.P1[0],z=Rp.P1[1]-1.6,y=Rp.ys[Rp.ns],ch1=caCh(x,z);for(const sx of[-1,1])for(const sz of[-1,1]){const px=x+sx*2.7,pz=z+sz*2.0;add(ch1.gB,bvTris(0.3,3.2,0.3),mat(px,y+1.6,pz),lin(0xd8d0bc));colCircle(px,pz,0.2,{solid:true,y0:y-0.5,y1:y+3.2,calta:true});}
    add(ch1.gB,boxTris(6.4,0.3,5.0),mat(x,y+3.35,z),lin(0xd8d0bc));add(ch1.gD,boxTris(4.4,0.42,0.06),mat(x,y+2.95,z+2.53),lin(0x2a5a8a));textoBlocos(ch1.gD,mat(x,y+2.82,z+2.57),'CIDADE ALTA',0.045,0xf0ece0);
    const mx=pl.maq.x,mz=pl.maq.z,gm=pl.maq.g;mbx(ch1.gB,ID,mx-1.8,mx+1.8,gm-0.5,y+3.0,mz-2.2,mz+2.2,0xd0c8b4,{j:0.03,rnd:R});mbx(ch1.gB,ID,mx-1.95,mx+1.95,y+3.0,y+3.25,mz-2.35,mz+2.35,0x8a857c);
    mbx(ch1.gD,ID,mx+1.79,mx+1.82,y+0.9,y+2.0,mz-0.6,mz+0.6,0x15171a);mbx(ch1.gB,ID,mx+1.8,mx+1.84,gm,gm+2.2,mz-0.55,mz+0.55,0x3a4a5a);
    mbx(ch1.gL,ID,mx-1.8,mx+1.8,gm-0.5,y+3.0,mz-2.2,mz+2.2,0xd0c8b4);add(ch1.gL,boxTris(6.4,0.3,5.0),mat(x,y+3.35,z),lin(0xd8d0bc));}}
/* ---------- largos: chafariz, cruzeiro, bancos, postes, guarda-corpo na beira (com colisão) ---------- */
function caGuarda(x0,z0,x1,z1,R){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/1.2)),yaw=Math.atan2(x1-x0,z1-z0);
  for(let i=0;i<n;i++){const ax=x0+(x1-x0)*i/n,az=z0+(z1-z0)*i/n,bx=x0+(x1-x0)*(i+1)/n,bz=z0+(z1-z0)*(i+1)/n,ga=caYc(ax,az,0),gb=caYc(bx,bz,0),ch=caCh(ax,az);
    add(ch.gD,boxTris(0.06,1.0,0.06),mat(ax,ga+0.5,az),lin(0x24272a));
    const mx=(ax+bx)/2,mz=(az+bz)/2,my=(ga+gb)/2,inc=Math.atan2(gb-ga,L/n);add(ch.gD,boxTris(0.05,0.05,L/n+0.04),mm(mat(mx,my+1.0,mz,0,yaw,0),mat(0,0,0,-inc,0,0)),lin(0x24272a));
    add(ch.gD,boxTris(0.03,0.03,L/n),mm(mat(mx,my+0.5,mz,0,yaw,0),mat(0,0,0,-inc,0,0)),lin(0x24272a));
    colBox(mx,mz,0.05,L/n/2+0.02,yaw,{solid:true,y0:Math.min(ga,gb)-0.3,y1:Math.max(ga,gb)+1.0,calta:true});}}
function caGeoLargos(R){
  /* Largo do Plano (embaixo): lajotas, bancos e postes */
  {const L=CA.largoPlano;for(let x=L.x0;x<L.x1-0.01;x+=1)for(let z=L.z0;z<L.z1-0.01;z+=1){const ch=caCh(x,z),x1=x+1,z1=Math.min(L.z1,z+1);
      add(ch.gB,[[[x,caYc(x,z),z],[x,caYc(x,z1),z1],[x1,caYc(x1,z),z]],[[x1,caYc(x1,z),z],[x,caYc(x,z1),z1],[x1,caYc(x1,z1),z1]]],ID,lin(caPick(R,[0xb0a898,0xa8a090,0xb8b0a0])),{keepWind:true,j:0.05,rnd:R});}
    for(const x of[248,262,276,292])caPoste(caCh(x,-90),x,ground(x,-90.5),-90.5,R);
    for(const x of[252,270]){const ch=caCh(x,-86);propBanco(ch.gD,mat(x,caYc(x,-86.2,0),-86.2,0,Math.PI,0));colBox(x,-86.2,0.8,0.25,0,{solid:true,y0:ground(x,-86.2)-0.2,y1:ground(x,-86.2)+0.5,calta:true});}}
  for(const L of CA.largos)caGeoLargo(L,R);
  /* Praça do Mirante: guarda-corpo na beira (menos na chegada do plano inclinado e da ladeira), bancos de frente para a vista */
  {const L=CA.largos.find(l=>l.id==='mirante'),ze=L.z1-0.15;caGuarda(L.x0+0.5,ze,280.9,ze,R);caGuarda(287.1,ze,Math.min(L.x1,caBarranco(ze)-1),ze,R);
    for(const x of[246,256,266,292]){const z=L.z1-1.4,ch=caCh(x,z);propBanco(ch.gD,mat(x,caYc(x,z,0),z,0,0,0));colBox(x,z,0.8,0.25,0,{solid:true,y0:ground(x,z)-0.2,y1:ground(x,z)+0.5,calta:true});}
    for(const x of[242,261,275])caPoste(caCh(x,L.z1-0.6),x,ground(x,L.z1-0.6),L.z1-0.6,R);}
  /* Rua Direita: a beira da encosta do lado de baixo, com guarda-corpo */
  {const r=CA.ruas.find(q=>q.nome==='Rua Direita');let ant=null;for(let s=2;s<=r.len;s+=2){const p=caRuaEm(r,s),q=r.w/2+0.4,x=p.x+p.nx*q,z=p.z+p.nz*q;if(ant)caGuarda(ant[0],ant[1],x,z,R);ant=[x,z];}}
  /* Largo da Matriz: chafariz no meio, bancos, postes nos cantos */
  {const L=CA.largos.find(l=>l.id==='matriz'),cx=(L.x0+L.x1)/2+1.5,cz=(L.z0+L.z1)/2,g=ground(cx,cz),ch=caCh(cx,cz);CA.chafariz={x:cx,z:cz,y:g};
    add(ch.gB,cylTris(2.3,2.4,0.55,18),mat(cx,g-0.1,cz),lin(0xc8c0b0),{j:0.03,rnd:R});add(ch.gB,cylTris(2.0,2.0,0.08,18),mat(cx,g+0.38,cz),lin(0x4a5a52));
    add(ch.gB,cylTris(0.32,0.42,1.6,10),mat(cx,g,cz),lin(0xc8c0b0));add(ch.gB,cylTris(1.0,0.5,0.32,14),mat(cx,g+1.6,cz),lin(0xc8c0b0));add(ch.gD,icoTris(0.3,0.1,R),mat(cx,g+2.05,cz),lin(0xc8c0b0));
    colCircle(cx,cz,2.35,{solid:true,y0:g-0.3,y1:g+0.45,calta:true});supAdd({t:'ret',x:cx,z:cz,hw:1.6,hd:1.6,yaw:Math.PI/4,y:g+0.45,dono:'caltaChafariz'});
    for(const[x,z,r]of[[L.x0+3,L.z0+3,0],[L.x1-3,L.z0+3,0],[L.x0+3,L.z1-3,Math.PI],[L.x1-3,L.z1-3,Math.PI]])caPoste(caCh(x,z),x,ground(x,z),z,R);
    for(const[x,z,r]of[[cx-5,cz,Math.PI/2],[cx+5,cz,-Math.PI/2],[cx,cz-5.5,0],[cx,cz+5.5,Math.PI]]){propBanco(caCh(x,z).gD,mat(x,caYc(x,z,0),z,0,r,0));colBox(x,z,0.8,0.25,r,{solid:true,y0:ground(x,z)-0.2,y1:ground(x,z)+0.5,calta:true});}
    mbx(ch.gL,ID,cx-2.3,cx+2.3,g-0.2,g+0.5,cz-2.3,cz+2.3,0xc8c0b0);}
  /* Largo do Cruzeiro: a cruz de pedra num pedestal */
  {const L=CA.largos.find(l=>l.id==='cruzeiro'),cx=(L.x0+L.x1)/2-1.5,cz=(L.z0+L.z1)/2,g=ground(cx,cz),ch=caCh(cx,cz);
    for(let i=0;i<3;i++)mbx(ch.gB,ID,cx-1.3+i*0.3,cx+1.3-i*0.3,g-0.3,g+0.3*(i+1),cz-1.3+i*0.3,cz+1.3-i*0.3,0xb8b0a0,{j:0.03,rnd:R});
    add(ch.gB,boxTris(0.32,4.2,0.32),mat(cx,g+0.9+2.1,cz),lin(0xc8c0b0));add(ch.gB,boxTris(1.9,0.3,0.3),mat(cx,g+3.9,cz),lin(0xc8c0b0));
    colBox(cx,cz,1.3,1.3,0,{solid:true,y0:g-0.3,y1:g+0.6,calta:true});supAdd({t:'ret',x:cx,z:cz,hw:0.7,hd:0.7,yaw:0,y:g+0.9,dono:'caltaCruz'});
    mbx(ch.gL,ID,cx-0.2,cx+0.2,g,g+5,cz-0.2,cz+0.2,0xc8c0b0);
    for(const[x,z]of[[L.x0+1.5,L.z0+1.5],[L.x0+1.5,L.z1-1.5]])caPoste(caCh(x,z),x,ground(x,z),z,R);}
  /* postes nas ruas (de 16 em 16 m, do lado de dentro da calçada) */
  for(const r of CA.ruas){if(r.praca||r.w<4)continue;for(let s=6;s<r.len-3;s+=16){const p=caRuaEm(r,s),sd=(Math.floor(s/16)%2)?1:-1,q=sd*(r.w/2+0.35),x=p.x+p.nx*q,z=p.z+p.nz*q;
    if(pointBlocked(x,z,0.4))continue;caPoste(caCh(x,z),x,ground(x,z)+0.1,z,R);}}}
/* saque à vista nos telhados */
function caGeoSaques(R){for(const s of CA.saques){const h=s.h,ch=caCh(h.cx,h.cz),inc=Math.atan2(h.hr,h.D/2+CA_BEIRAL)*(s.v<0?-1:1),M=mm(mat(h.cx,0,h.cz,0,h.yaw,0),mat(s.u,s.y,s.v,inc,s.r*0.2,0));
  if(s.k==='mochila'){add(ch.gD,boxTris(0.42,0.5,0.25),mm(M,mat(0,0.25,0,0.3,0,0)),lin(0x56603a));add(ch.gD,boxTris(0.3,0.16,0.07),mm(M,mat(0,0.2,0.16,0.3,0,0)),lin(0x4a5331));}
  else if(s.k==='caixa'){add(ch.gD,bvTris(0.6,0.36,0.42),mm(M,mat(0,0.18,0)),lin(0x8a6a42));add(ch.gD,bvTris(0.62,0.04,0.44),mm(M,mat(0,0.37,0)),lin(0x6a4e30));}
  else{add(ch.gD,icoTris(0.3,0.25,R),mm(M,mat(0,0.25,0,0,0,0,1,0.8,1)),lin(0xb8a888));add(ch.gD,boxTris(0.02,0.4,0.02),mm(M,mat(0,0.6,0)),lin(0x8a7a5a));}}}
/* o que ficou na igreja para o abrigo (colchão, baú, bancada, quadro de força, lâmpadas) e a placa da corrida */
function caGeoAtividades(R){const p=CA.igreja,A=CA.abrigo;if(p&&A){const ch=caCh(p.x0+2,(p.z0+p.z1)/2),gD=ch.gD,gB=ch.gB,M=mat(p.ox,0,p.oz,0,p.yaw,0),y=p.y0;
    mbx(gB,M,1.6,3.0,y,y+0.22,14.4,16.4,0x5a6a7a);mbx(gD,M,1.55,3.05,y+0.22,y+0.3,15.5,16.42,0x8a4a3a);mbx(gD,M,1.75,2.4,y+0.22,y+0.36,14.5,14.95,0xe8e2d4);   // colchão, cobertor e travesseiro
    mbx(gB,M,8.45,9.35,y,y+0.55,16.4,17.0,0x6b4e30);mbx(gD,M,8.42,9.38,y+0.55,y+0.62,16.38,17.02,0x4a3424);mbx(gD,M,8.85,8.95,y+0.35,y+0.5,16.37,16.4,0xc8a428);   // baú
    mbx(gB,M,9.95,10.6,y,y+0.9,10.1,11.9,0x7a5a3a);mbx(gD,M,9.9,10.65,y+0.9,y+0.96,10.05,11.95,0x5a4028);   // bancada
    add(gD,boxTris(0.18,0.06,0.5),mm(M,mat(10.2,y+1.0,10.6,0,0.3,0)),lin(0x8a8f92));add(gD,boxTris(0.12,0.12,0.3),mm(M,mat(10.3,y+1.02,11.4)),lin(0xa8261d));
    mbx(gB,M,10.55,10.7,y+1.0,y+1.9,1.15,1.85,0x5a6670);mbx(gD,M,10.5,10.56,y+1.1,y+1.8,1.25,1.75,0x3a4450);   // quadro de força na parede
    for(const q of A.luzes){const w=[q.x,q.z];add(gD,boxTris(0.02,0.9,0.02),mat(w[0],q.y+0.45+0.12,w[1]),lin(0x1a1a1a));add(gD,icoTris(0.09,0.05,R),mat(w[0],q.y,w[1]),lin(0xf4e8c0),{e:0.6});}}
  const C=CA.corrida;if(C){const q=C.ini,ch=caCh(q.x,q.z);add(ch.gB,cylTris(0.06,0.07,3.3,7),mat(q.x+0.9,q.y,q.z),lin(0x2a2c2e));
    add(ch.gB,boxTris(1.5,0.8,0.06),mat(q.x+0.9,q.y+2.8,q.z,0,0,0),lin(0xd8a020));textoBlocos(ch.gD,mat(q.x+0.9,q.y+2.62,q.z+0.04),'CORRIDA',0.045,0x1a1a1a);
    textoBlocos(ch.gD,mat(q.x+0.9,q.y+2.62,q.z-0.04,0,Math.PI,0),'CORRIDA',0.045,0x1a1a1a);colCircle(q.x+0.9,q.z,0.1,{solid:true,y0:q.y-0.5,y1:q.y+3.3,calta:true});}}
function caGeo(){const R=rng(CA.seed+7);caChunksNovos();
  for(const r of CA.ruas)caGeoRua(r,R);
  for(const Rp of CA.rampas)caGeoRampa(Rp,R);
  caGeoLargos(R);caGeoPlano(R);
  for(const h of CA.casas)caGeoCasa(h,R);
  if(CA.igreja)caGeoIgreja(CA.igreja,R);for(const p of CA.predios)caGeoPredio(p,R);
  caGeoSaques(R);caGeoAtividades(R);
  for(const c of CA.chunks){c.mB=litMesh(c.gB.data());c.mD=litMesh(c.gD.data());c.mL=litMesh(c.gL.data());c.tris=(c.gB.n+c.gD.n)/3;c.trisL=c.gL.n/3;c.gB=c.gD=c.gL=null;}
  CA.info.tris=Math.round(CA.chunks.reduce((s,c)=>s+c.tris,0));CA.info.trisLonge=Math.round(CA.chunks.reduce((s,c)=>s+c.trisL,0));}
etapaMalha('fim','calta',4,()=>{if(!CA.ok)return;try{caGeo();}catch(e){console.error('Cidade Alta (desenho)',e);CA.erro=String(e&&e.stack||e);}});
DESENHO.opaco.push(function caltaDesenho(Pg){if(!CA.ok)return;const cx=cam.pos[0],cz=cam.pos[2];
  for(const c of CA.chunks){const d=Math.hypot(Math.max(c.x0-cx,0,cx-c.x1),Math.max(c.z0-cz,0,cz-c.z1));if(d>700)continue;
    if(d>170){if(c.mL)drawStat(Pg,c.mL,ID);continue;}if(c.mB)drawStat(Pg,c.mB,ID);if(d<100&&c.mD)drawStat(Pg,c.mD,ID);}});
DESENHO.sombra.push(function caltaSombra(Pg,perto){if(!CA.ok)return;for(const c of CA.chunks){if(!c.mB)continue;const d=Math.hypot(Math.max(c.x0-P.x,0,P.x-c.x1),Math.max(c.z0-P.z,0,P.z-c.z1));if(d>(perto?60:140))continue;drawStat(Pg,c.mB,ID);}});

/* ================= mapa: o bairro, as ruas, os largos, as casas, a igreja e as subidas ================= */
MAPA_DESENHOS.push(function mapaCidadeAlta(g,X,Y,k,n,range){if(!CA.ok||(range<1e3&&caDist()>range*1.5+10))return;
  const B=CA.caixa;g.fillStyle=n>0.5?'#1e211c':'#34382c';g.beginPath();g.moveTo(X(B.x0),Y(-108));g.lineTo(X(B.x0),Y(B.z0));
  for(let z=B.z0;z<=-121;z+=4)g.lineTo(X(caBarranco(z)),Y(z));g.lineTo(X(caBarranco(-121)),Y(-108));g.closePath();g.fill();
  g.lineCap='round';g.lineJoin='round';
  for(const Rp of CA.rampas){g.strokeStyle=n>0.5?'#3c3a36':Rp.tipo==='plano'?'#c8a428':'#b5ab98';g.lineWidth=Math.max(1,Rp.w*k);g.beginPath();g.moveTo(X(Rp.P0[0]),Y(Rp.P0[1]));g.lineTo(X(Rp.P1[0]),Y(Rp.P1[1]));g.stroke();}
  for(const r of CA.ruas){if(r.praca)continue;g.strokeStyle=n>0.5?'#3c3a36':'#b5ab98';g.lineWidth=Math.max(1,(r.w+2*r.calcada)*k);g.beginPath();r.L.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();}
  for(const L of CA.largos.concat([CA.largoPlano])){g.fillStyle=n>0.5?'#34322e':'#a89f8c';g.fillRect(X(L.x0),Y(L.z0),(L.x1-L.x0)*k,(L.z1-L.z0)*k);}
  for(const h of CA.casas){g.fillStyle=n>0.5?'#2c2420':h.mapaCor;g.beginPath();for(let i=0;i<4;i++){const q=[[-1,-1],[1,-1],[1,1],[-1,1]][i],p=caPw(h,q[0]*h.W/2,q[1]*h.D/2);i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1]));}g.closePath();g.fill();}
  for(const p of CA.predios.concat(CA.igreja?[CA.igreja]:[])){g.fillStyle=n>0.5?'#2c2a26':p.igreja?'#e8e2d4':'#c9b89a';g.fillRect(X(p.x0),Y(p.z0),(p.x1-p.x0)*k,(p.z1-p.z0)*k);}
  if(CA.igreja)for(const t of CA.igreja.torres){g.fillStyle=n>0.5?'#3a3834':'#f4f0e6';g.fillRect(X(t.x-2.15),Y(t.z-2.15),4.3*k,4.3*k);}});
MAPA_NOMES.push(()=>CA.ok&&CA.igreja?{t:'Matriz',x:CA.igreja.x1,z:(CA.igreja.z0+CA.igreja.z1)/2,px:8}:null);
MAPA_NOMES.push(()=>CA.ok&&CA.plano?{t:'Plano Inclinado',x:CA.plano.x,z:-110,px:8}:null);
{const i=REGIOES.findIndex(r=>r.id==='mata');REGIOES.splice(i<0?REGIOES.length:i,0,{id:'calta',nome:'Cidade Alta',desc:'o centro histórico no alto, atrás da cidade: ladeira de pedra, plano inclinado, casario colorido para correr pelos telhados e a Igreja Matriz',
  em:(x,z)=>CA.ok&&(caNucleo(x,z,-3)||caCorredor(x,z,0)),x:250,z:-170,r:70,aviso:true});}

/* ================= torre da igreja: observar do alto e tocar o sino ================= */
INTERS.push(tryIt=>{const t=CA.torre;if(!t||!CA.ok||Math.abs(P.y-t.yS)>1.0||Math.hypot(P.x-t.x,P.z-t.z)>2.6)return;
  const v=t.via&&t.via.topo;if(v&&Math.hypot(P.x-v.x,P.z-v.z)<0.7)return;   // na saída da escada fica o "Descer"
  tryIt({k:'caltaSino',o:t},t.x,t.z,1.0,3.0,-2,t.yS+1.2);
  tryIt({k:'caltaMirante',o:t},P.x,P.z,1.0,2.6,-2,t.yS);});
INTER_K.caltaMirante={texto:()=>({t:'Observar a Cidade Alta',s:caD().mapeado?'o bairro e a cidade já estão no mapa · mostra zumbis por perto no minimapa':'do alto da torre dá para ver o bairro, a cidade e o mar · segure',hold:true,dur:1.5}),
  usar:(o,seg)=>{if(!seg)return;const D=caD(),novo=!D.mapeado;D.mapeado=true;G.obsAte=G.t+60;
    if(typeof nevoaRevelar==='function'){nevoaRevelarRet(CA.caixa.x0,CA.caixa.z0,caBarranco(-121)+20,-84);nevoaRevelarRet(CIDADE.x0,CIDADE.z0,CIDADE.x1,CIDADE.z1);}
    let nz=0;for(const z of Z)if(z.vivo&&Math.hypot(z.x-P.x,z.z-P.z)<120)nz++;
    toast('corpo','Do alto da torre da Matriz: os telhados da Cidade Alta, a cidade lá embaixo e o farol na praia. '+(nz?nz+' zumbi'+(nz>1?'s':'')+' à vista.':'Nenhum zumbi à vista.')+(novo?' O bairro e a cidade entraram no mapa.':''));
    sfx('pegar');if(novo){ganharXP(30);if(typeof diarioEvento==='function')diarioEvento('Subiu na torre da Igreja Matriz e viu a Cidade Alta do alto','geral');}}};
/* o sino: barulho que se ouve longe (atrai os zumbis do bairro para a igreja); de novo só depois de um tempo */
function caBadalo(){try{if(!AU.ctx)return;const ctx=AU.ctx,t0=ctx.currentTime;for(let i=0;i<3;i++){const t=t0+i*1.25,g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.55,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+4.2);g.connect(AU.fx);
    for(const[k,a]of[[1,1],[2.0,0.5],[2.76,0.32],[5.4,0.08]]){const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=NOTA(i%2?45:43)*k;og.gain.value=a;o.connect(og).connect(g);o.start(t);o.stop(t+4.3);}}}catch(e){}}
INTER_K.caltaSino={texto:()=>{const D=caD(),esp=Math.max(0,Math.ceil(((D.sinoAte||0)-(G.t||0))/60));return esp>0?{t:'O sino ainda balança',s:'espere um pouco para tocar de novo'}:{t:'Tocar o sino',s:'o barulho chama os zumbis do bairro para a igreja'};},
  usar:o=>{const D=caD();if((D.sinoAte||0)>(G.t||0))return;D.sinoAte=(G.t||0)+90;caBadalo();barulho(o.x,o.z,95,false,o.yS);P.shake=Math.max(P.shake||0,0.2);
    let n=0;for(const z of Z)if(z.vivo&&!z.lan&&Math.hypot(z.x-o.x,z.z-o.z)<95&&z.st!=='dorme'&&z.st!=='morrendo'&&z.st!=='sumindo')n++;
    toast('corpo','O sino da Matriz toca. '+(n?n+' zumbi'+(n>1?'s':'')+' ouviram e vêm para a igreja.':'Ninguém por perto para ouvir.'));if(typeof diarioEvento==='function')diarioEvento('Tocou o sino da Igreja Matriz','geral');}};

/* ================= zumbis da Cidade Alta (o esquema do Morro: aparecem perto, longe ficam guardados como número) ================= */
const CA_ZMAX=18,CA_POV={feito:false,faltam:0,t:0};
function caD(){if(!G.calta||typeof G.calta!=='object')G.calta={zVivos:-1,zDia:0,mapeado:false};return G.calta;}
function caVivos(){return Z.filter(z=>z.vivo&&z.calta&&z.st!=='morrendo'&&z.st!=='morto'&&z.st!=='sumindo');}
function caDist(){const B=CA.caixa;return Math.hypot(Math.max(B.x0-P.x,0,P.x-B.x1),Math.max(B.z0-P.z,0,P.z-(-108)));}
function caCriarZ(i){const L=CA.pontos;if(!L.length)return false;
  for(let t=0;t<12;t++){const b=L[(i*7+t*13)%L.length],x=b[0]+(Math.random()-0.5)*2.4,z=b[1]+(Math.random()-0.5)*2.4;
    if(!pontoLivre(x,z,0.5)||Math.hypot(x-P.x,z-P.z)<20)continue;const r=Math.random(),tipo=r<0.12?'runner':r<0.17&&ZS.screamer?'screamer':'walker';
    const q=criarZ(tipo,x,z,{st:'vaga',y:chaoEm(x,z,ground(x,z)+0.3)});if(q){q.calta=true;q.hx=x;q.hz=z;return true;}}
  return false;}
function caPovoar(){const D=caD();let n;if(D.zVivos<0||!D.zDia)n=CA_ZMAX;else n=Math.min(CA_ZMAX,D.zVivos+Math.max(0,(G.dia||1)-D.zDia)*3);
  D.zDia=G.dia||1;let k=0;for(let i=0;i<n;i++)if(caCriarZ(i))k++;CA_POV.faltam=n-k;D.zVivos=n;return k;}
function caGuardar(){CA_POV.feito=false;const D=caD();let n=CA_POV.faltam||0;CA_POV.faltam=0;
  for(const z of caVivos()){n++;if(z.st==='caca'&&Math.hypot(z.x-P.x,z.z-P.z)<60)continue;z.vivo=false;z.st='sumindo';z.t=2.2;}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(z.calta&&!z.vivo&&z.st==='sumindo')Z.splice(i,1);}D.zVivos=n;D.zDia=G.dia||1;return n;}
PASSOS.push(function caltaZumbis(dt){CA_POV.t-=dt;if(CA_POV.t>0)return;CA_POV.t=1;if(!CA.ok||!P.alive||G.modo!=='jogo'||P.y<-20)return;const d=caDist();
  if(!CA_POV.feito){if(d<45){CA_POV.feito=true;caPovoar();}return;}
  if(d>200){caGuardar();return;}
  if(CA_POV.faltam>0&&caCriarZ(Math.floor(Math.random()*64)))CA_POV.faltam--;
  const D=caD(),v=caVivos().length+CA_POV.faltam;if(D.zVivos>v)D.zVivos=v;});
V8.novo.calta=()=>{G.calta=null;caD();CA_POV.feito=false;CA_POV.faltam=0;};
V8.salvar.calta=()=>caD();
V8.carregar.calta=s=>{G.calta=s&&typeof s==='object'?s:null;caD();CA_POV.feito=false;CA_POV.faltam=0;CA.conferir=true;for(let i=Z.length-1;i>=0;i--)if(Z[i].calta)Z.splice(i,1);};
/* jogo salvo antes do bairro com você parado onde hoje tem casa (era mato): sai para a rua mais perto */
PASSOS.push(function caltaConferirLugar(){if(!CA.conferir||!CA.ok||G.modo!=='jogo')return;CA.conferir=false;if(P.y<-20||CARRO.ativo||P.escala)return;
  let c=null;for(const q of colQuery(P.x,P.z,0.5))if(q.calta&&q.solid&&q.y1!==undefined&&P.y<q.y1-0.05&&P.y+1.6>q.y0&&pointBlocked(P.x,P.z,0.1)===q){c=q;break;}if(!c)return;
  let best=null,bd=1e9;for(const p of CA.pontos){const d=Math.hypot(p[0]-P.x,p[1]-P.z);if(d<bd&&!pointBlocked(p[0],p[1],0.5)){bd=d;best=p;}}
  if(best){P.x=best[0];P.z=best[1];P.y=chaoEm(P.x,P.z,ground(P.x,P.z)+0.5);P.vx=P.vz=P.vy=0;}});

/* ================= arco e flecha, coquetel molotov e fogo =================
   arco: segure o ataque para puxar a corda (a câmera mira junto) e solte para atirar. Não faz barulho; a flecha voa
         em arco, crava no chão, na árvore, na parede ou no zumbi, e dá para recolher passando por cima (algumas quebram)
   molotov: o arco do voo aparece na tela; clique para jogar onde a mira aponta. Quebra e espalha fogo por uns 10 s:
         zumbi que pisa nas chamas pega fogo e passa o fogo para os do lado, madeira queima, e você também
         (rolar no chão ou entrar na água apaga) */
const ARCO={puxa:0.72,vMin:15,vMax:50,g:7,custoE:2.2};
const MOLO={v:15.5,g:9.8,raio:3.1,dur:10,alc:26};
const FLECHAS=[],ARREMESSOS=[],CHAMAS=[],FLOG=[];
function flog(m,f){FLOG.push({m,x:+f.x.toFixed(1),y:+f.y.toFixed(1),z:+f.z.toFixed(1),t:+f.t.toFixed(2)});if(FLOG.length>12)FLOG.shift();}

/* ---------- mira: ponto que a cruz aponta (primeiro zumbi, chão, parede ou obstáculo no raio da câmera) ---------- */
function bateRaio(x,y,z){if(y<chaoEm(x,z,y+0.4))return true;
  const c=pointBlocked(x,z,0.02);if(c&&(c.y1!==undefined?(y<c.y1&&y>c.y0-0.05):y<(c.tree?6.5:c.obra?2.6:3.6)))return true;
  if(emPredios(x,z,2)&&bloqueadoAlto(x,z,0.02,y-0.3))return true;
  for(const T of GIGANTES)if(Math.abs(x-T.x)<T.R+0.2&&Math.abs(z-T.z)<T.R+0.2&&Math.hypot(x-T.x,z-T.z)<T.R&&y>T.y-1&&y<T.y+(T.H||20))return true;
  return false;}
function pontoMira(maxD){const o=cam.pos,d=cam.fwd;let ht=maxD;const t0=cfg.cam==='1'?0.4:camDist+0.35;
  for(const z of Z){if(!z.vivo||!z.ch.vis)continue;const C=zCorpo(z),r=raySeg(o,d,C.a,C.b);if(r.dist<C.r*1.06&&r.t<ht&&r.t>t0)ht=r.t;}
  for(let t=t0;t<ht;t+=0.35){const x=o[0]+d[0]*t,y=o[1]+d[1]*t,z=o[2]+d[2]*t;if(bateRaio(x,y,z)){ht=t;break;}}
  return[o[0]+d[0]*ht,o[1]+d[1]*ht,o[2]+d[2]*ht];}
/* direção de lançamento para acertar o alvo com velocidade v e gravidade g (arco baixo; sem alcance: 45°) */
function dirBalistica(o,alvo,v,g){const dx=alvo[0]-o[0],dz=alvo[2]-o[2],dy=alvo[1]-o[1],dh=Math.hypot(dx,dz)||1e-3;
  const v2=v*v,disc=v2*v2-g*(g*dh*dh+2*dy*v2);const th=disc<0?Math.PI/4:Math.atan2(v2-Math.sqrt(disc),g*dh),c=Math.cos(th);
  return[dx/dh*c,Math.sin(th),dz/dh*c];}

/* ---------- quadros da mão esquerda (arco) e da direita (garrafa) ---------- */
const _MB=new Float32Array(16),_MB2=new Float32Array(16),_MS=new Float32Array(16);
function quadroMaoEsq(){const ch=P.ch;if(!ch.mE){ch.mE=new Float32Array(16);ch.mEok=false;}if(ch.sk&&ch.sk.t.pronto&&ch.mE[15]===1)return ch.mE;const m=ch.m.subarray(4*16,5*16);mul(_MB2,m,trs(_MS,0,-0.27,0,0,0,0,1,1,1));return _MB2;}
/* o arco fica de pé na mão quando mira; parado, pende ao lado do corpo */
function quadroArco(){const H=quadroMaoEsq(),k=clamp(P.acao&&P.acao.tipo==='arco'?1:P.aim,0,1);return mul(_MB,H,trs(_MS,0,0.02,0,lerp(1.75,0,k),0,0,1,1,1));}
/* posição de reserva (logo depois de teletransporte, ou sem desenho): na frente do peito */
function frentePeito(lado,alt){const fx=Math.sin(P.body),fz=Math.cos(P.body);return[P.x+fx*0.45-fz*lado,P.y+alt,P.z+fz*0.45+fx*lado];}
function origemFlecha(){if(cfg.cam==='1')return[cam.pos[0]+cam.fwd[0]*0.55-cam.up[0]*0.07,cam.pos[1]+cam.fwd[1]*0.55-cam.up[1]*0.07,cam.pos[2]+cam.fwd[2]*0.55-cam.up[2]*0.07];
  const m=quadroArco();if(Math.hypot(m[12]-P.x,m[14]-P.z)>1.3||Math.abs(m[13]-P.y-1.2)>1.2)return frentePeito(0.15,1.42);return[m[12],m[13]+0.02,m[14]];}
function origemMao(){if(cfg.cam==='1')return[cam.pos[0]+cam.fwd[0]*0.5+cam.right[0]*0.2,cam.pos[1]+cam.fwd[1]*0.5+0.05,cam.pos[2]+cam.fwd[2]*0.5+cam.right[2]*0.2];
  const m=P.ch.m.subarray(11*16,12*16);if(Math.hypot(m[12]-P.x,m[14]-P.z)>1.3)return frentePeito(-0.25,1.6);return[m[12],Math.max(m[13],P.y+1.5),m[14]];}

/* ---------- arco ---------- */
function comecarArco(s){if(invCount('flecha')<=0){sfx('vazio');P.cd=0.4;feed('Sem flechas',true);
    dica('semFlecha','corpo','Sem flechas. Na mochila (aba Fabricar), 2 gravetos, 1 pedra e 1 fibra viram 4 flechas (precisa de uma lâmina). As atiradas dá para recolher.');return;}
  P.acao={tipo:'arco',t:0,dur:1e9,puxa:0,arma:s};sfx('puxar');
  dica('arco','corpo','Arco: segure para puxar a corda e solte para atirar. Puxado até o fim vai mais longe e mata mais. Não faz barulho, e as flechas podem ser recolhidas.');}
function passoArco(a,dt){a.puxa=Math.min(1,a.t/ARCO.puxa);if(a.puxa>=1)P.energia=Math.max(0,P.energia-(9+ARCO.custoE)*dt);
  if(a.puxa>=1&&!a.cheio){a.cheio=true;sfx('clique');}
  if(!IN.attack||!P.alive||P.energia<=0){if(a.puxa>0.2)soltarFlecha(a);P.acao=null;P.cd=0.22;}}
function soltarFlecha(a){if(!invRemove('flecha',1))return;const k=a.puxa,v=lerp(ARCO.vMin,ARCO.vMax,k);
  const o=origemFlecha(),dir=dirBalistica(o,pontoMira(95),v,ARCO.g);
  flog('sai',{x:o[0],y:o[1],z:o[2],t:0});FLECHAS.push({x:o[0],y:o[1],z:o[2],vx:dir[0]*v,vy:dir[1]*v,vz:dir[2]*v,dx:dir[0],dy:dir[1],dz:dir[2],t:0,k,voa:true,dano:ITEMS.arco.dano*danoUp(selItem())*(0.3+0.7*k*k),danoBicho:danoBicho('arco',selItem())*(0.3+0.7*k*k),arma:'arco'});
  sfx('arco');barulho(P.x,P.z,3,true,P.y);P.recuo=0.35;if(a.arma)gastar(a.arma,1);hudBarra();invRender();}
function flechaAcerta(f,o,d,L){
  for(const z of Z){if(!z.vivo||!z.ch.vis)continue;if(Math.abs(z.x-o[0])>L+1.2||Math.abs(z.z-o[2])>L+1.2)continue;const sc=z.ch.s||1,C=zCorpo(z);
    const r=raySeg(o,d,C.a,C.b);if(r.t>L||r.dist>C.r*0.88)continue;
    const hx=o[0]+d[0]*r.t,hy=o[1]+d[1]*r.t,hz=o[2]+d[2]*r.t,reg=regiaoTiro(z,r,C,o,d),head=reg==='cabeca';
    const dano=danoFlecha(f,reg,z);
    sangue(hx,hy,hz,head?12:7,d,head);marcarFerida(z,[hx,hy,hz],head);
    if(!(z.flechas&&z.flechas.length>=4)){(z.flechas=z.flechas||[]).push({y:(hy-z.y)/sc,a:Math.atan2(d[0],d[2])-z.ch.yaw,p:d[1],item:f.item||'flecha'});}
    ZHIT=zhitDe('flecha',f.arma||'arco',reg);ferirZ(z,dano,d[0]*0.35,d[2]*0.35,head?1:0);marcarAcerto(head);if(head)progresso('cabeca');
    sfx('flecha',z.x,z.z,0.9);G.hitstop=Math.max(G.hitstop||0,z.vivo?0.03:0.07);if(!z.vivo)soltarFlechasZ(z);flog('zumbi '+z.tipo+' '+Math.round(dano),f);return true;}
  for(const b of BICHOS){if(!b.vivo)continue;const h=bichoAlt(b),r=raySeg(o,d,[b.x,b.y+h*0.3,b.z],[b.x,b.y+h,b.z]);
    if(r.t>L||r.dist>bichoHitR(b))continue;ferirBicho(b,(f.danoBicho||f.dano)*1.4,d[0],d[2],'flecha');marcarAcerto(false);sfx('flecha',b.x,b.z,0.8);
    if(Math.random()<0.75)soltarItens([[f.item||'flecha',1]],b.x,b.z,b.y);flog('bicho '+b.tipo,f);return true;}
  return false;}
/* flechas cravadas no corpo caem junto quando o zumbi morre (a maioria dá para reaproveitar) */
function soltarFlechasZ(z){if(!z.flechas||!z.flechas.length)return;const c={};for(const f of z.flechas)if(Math.random()<0.7){const k=f.item||'flecha';c[k]=(c[k]||0)+1;}z.flechas=null;const L=Object.entries(c);if(L.length)soltarItens(L,z.x,z.z,z.y);}
function cravar(f,onde){flog('crava '+onde,f);f.voa=false;f.t=0;f.onde=onde;
  if(onde==='chao'){if(f.dy>-0.72){const h=Math.hypot(f.dx,f.dz)||1,k=Math.sqrt(1-0.72*0.72)/h;f.dx*=k;f.dz*=k;f.dy=-0.72;}f.y=chaoEm(f.x,f.z,f.y+0.3)+0.04;}   // no chão fica fincada em pé, não deitadasfx('flecha',f.x,f.z,0.6);
  if(onde==='chao')poeira(f.x,f.y,f.z,2);else lascas(f.x,f.y,f.z,onde==='parede'?[0.55,0.55,0.52,1]:[0.5,0.38,0.24,1],3);
  if(Math.random()<(onde==='parede'?0.45:0.14))f.quebrou=true;}
function updateFlechas(dt){
  for(let i=FLECHAS.length-1;i>=0;i--){const f=FLECHAS[i];f.t+=dt;
    if(f.voa){const sp=Math.hypot(f.vx,f.vy,f.vz),n=Math.max(1,Math.ceil(sp*dt/0.3)),h=dt/n;let fim=false;
      for(let s=0;s<n&&f.voa&&!fim;s++){const ox=f.x,oy=f.y,oz=f.z;f.vy-=ARCO.g*h;f.x+=f.vx*h;f.y+=f.vy*h;f.z+=f.vz*h;
        const L=Math.hypot(f.x-ox,f.y-oy,f.z-oz)||1e-4,d=[(f.x-ox)/L,(f.y-oy)/L,(f.z-oz)/L];f.dx=d[0];f.dy=d[1];f.dz=d[2];
        if(flechaAcerta(f,[ox,oy,oz],d,L)){fim=true;break;}
        const g=chaoEm(f.x,f.z,oy+0.3);if(f.y<=g){const k=(oy-g)/Math.max(1e-4,oy-f.y);f.x=ox+(f.x-ox)*k;f.z=oz+(f.z-oz)*k;f.y=g+0.02;f.x-=d[0]*0.12;f.y-=d[1]*0.12;f.z-=d[2]*0.12;cravar(f,'chao');break;}
        if(bateRaio(f.x,f.y,f.z)){const c=pointBlocked(f.x,f.z,0.02);f.x=ox+d[0]*L*0.6;f.y=oy+d[1]*L*0.6;f.z=oz+d[2]*L*0.6;cravar(f,c&&c.tree?'arvore':emPredios(f.x,f.z,2)?'parede':'arvore');break;}}
      if(fim||f.t>8||f.y<-60){if(!fim)flog('some',f);FLECHAS.splice(i,1);continue;}}
    else{if(!f.quebrou&&P.alive&&!CARRO.ativo&&Math.abs(P.y+0.5-f.y)<1.8&&d2(P.x,P.z,f.x,f.z)<1.25*1.25){FLECHAS.splice(i,1);ganhar(f.item||'flecha',1);continue;}
      if(f.t>(f.quebrou?12:150))FLECHAS.splice(i,1);}}
  if(FLECHAS.length>60)FLECHAS.splice(0,FLECHAS.length-60);}

/* ---------- molotov ---------- */
function comecarArremesso(s){P.acao={tipo:'arremesso',t:0,dur:0.62,arma:s,mira:P.yaw};sfx('golpe');}
function lancarMolotov(a){const s=a.arma,i=P.inv.indexOf(s);if(!s||i<0||!ITEMS[s.id]||!ITEMS[s.id].arremesso)return;const tipo=s.id;s.n--;if(s.n<=0)P.inv[i]=null;hudBarra();invRender();
  const o=origemMao(),dir=dirBalistica(o,alvoArremesso(),MOLO.v,MOLO.g);
  ARREMESSOS.push({x:o[0],y:o[1],z:o[2],vx:dir[0]*MOLO.v+P.vx*0.4,vy:dir[1]*MOLO.v,vz:dir[2]*MOLO.v+P.vz*0.4,t:0,rx:0,ry:P.yaw,tipo});
  sfx(tipo==='molotov'?'fogo':'clique',P.x,P.z,0.3);barulho(P.x,P.z,4,true,P.y);}
function alvoArremesso(){const p=pontoMira(MOLO.alc+8),dx=p[0]-P.x,dz=p[2]-P.z,dh=Math.hypot(dx,dz);if(dh<=MOLO.alc)return p;
  const k=MOLO.alc/dh;return[P.x+dx*k,chaoEm(P.x+dx*k,P.z+dz*k,p[1]+2),P.z+dz*k];}
function updateArremessos(dt){
  for(let i=ARREMESSOS.length-1;i>=0;i--){const b=ARREMESSOS[i];b.t+=dt;const ox=b.x,oy=b.y,oz=b.z;
    b.vy-=MOLO.g*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.rx+=dt*11;
    if((b.tipo||'molotov')!=='isca'&&Math.random()<dt*(b.tipo==='bombaCaseira'?20:40))part(b.x,b.y+0.05,b.z,(Math.random()-0.5)*0.4,0.5,(Math.random()-0.5)*0.4,0.28,b.tipo==='bombaCaseira'?0.03:0.07,[1,0.55,0.15,0.95],true,-1);
    let bate=null;
    for(const z of Z){const sc=z.ch.s||1;if(z.vivo&&Math.abs(b.x-z.x)<0.45*sc&&Math.abs(b.z-z.z)<0.45*sc&&b.y>z.y&&b.y<z.y+1.9*sc){bate=[b.x,b.y,b.z];break;}}
    if(!bate){const g=chaoEm(b.x,b.z,oy+0.3);if(b.y<=g+0.04)bate=[b.x,g,b.z];}
    if(!bate&&bateRaio(b.x,b.y,b.z))bate=[ox,oy,oz];
    if(bate||b.t>6){ARREMESSOS.splice(i,1);if(bate)aterrissar(b,bate);}}}
function quebrarMolotov(x,y,z){const g=chaoEm(x,z,y+0.6);CHAMAS.push({x,y:g,z,r:MOLO.raio,t:0,dur:MOLO.dur,rr:0});
  if(MANCHAS.length>=60)MANCHAS.shift();MANCHAS.push({x,y:g,z,r:MOLO.raio*0.85,rot:Math.random()*6.28,t:0,s:Math.random(),q:1});
  sfx('vidro',x,z,1);sfx('fogo',x,z,1.1);barulho(x,z,24,true,g);
  for(let i=0;i<30;i++)part(x,g+0.3,z,(Math.random()-0.5)*7,1+Math.random()*4,(Math.random()-0.5)*7,0.45+Math.random()*0.4,0.16+Math.random()*0.1,[1,0.45+Math.random()*0.35,0.1,1],true,5);
  for(let i=0;i<10;i++)part(x,g+0.25,z,(Math.random()-0.5)*4,0.5+Math.random()*2,(Math.random()-0.5)*4,0.7,0.03,[0.55,0.75,0.6,1],false);
  if(d2(x,z,P.x,P.z)<14*14)P.shake=Math.max(P.shake,0.3);
  dica('molotov','corpo','Fogo! Zumbi que passa pelas chamas pega fogo e passa para os do lado. Você também queima: role no chão (correndo, C) para apagar.');}

/* ---------- fogo no chão e coisas queimando ---------- */
function acender(z,t){if(!z.vivo)return;if(!(z.queima>0))sfx('fogo',z.x,z.z,0.3);z.queima=Math.max(z.queima||0,t);}
function updateChamas(dt){
  for(let i=CHAMAS.length-1;i>=0;i--){const c=CHAMAS[i];c.t+=dt;if(c.t>=c.dur){CHAMAS.splice(i,1);continue;}
    const k=Math.min(1,c.t*4)*Math.min(1,(c.dur-c.t)/2.5),r=c.r*(0.7+0.3*Math.min(1,c.t*3));c.rr=r;c.k=k;
    const n=Math.floor(dt*(typeof fogo3dOk==='function'&&fogo3dOk()?(c.mata?3:16):95)*k+Math.random());   // v10.2.2: com as chamas de verdade (62yd_fogo), só umas faíscas
    for(let j=0;j<n;j++){const a=Math.random()*6.283,q=Math.sqrt(Math.random())*r,x=c.x+Math.cos(a)*q,z=c.z+Math.sin(a)*q,y=chaoEm(x,z,c.y+0.6);
      if(typeof fogo3dOk==='function'&&fogo3dOk())part(x,y+0.2+Math.random()*0.8,z,(Math.random()-0.5)*0.9,2.2+Math.random()*2.2,(Math.random()-0.5)*0.9,0.7+Math.random()*0.7,0.035+Math.random()*0.035,[1,0.5+Math.random()*0.35,0.12,1],true,-1.0);   // faísca miúda (a chama é o 62yd)
      else part(x,y+0.05,z,(Math.random()-0.5)*0.5,1.1+Math.random()*1.9,(Math.random()-0.5)*0.5,0.45+Math.random()*0.4,0.18+Math.random()*0.24*(1-q/r),[1,0.34+Math.random()*0.4,0.06,0.95],true,-0.7);}
    if(!(typeof fogo3dOk==='function'&&fogo3dOk())&&Math.random()<dt*6*k)part(c.x+(Math.random()-0.5)*r,c.y+1.4,c.z+(Math.random()-0.5)*r,(Math.random()-0.5)*0.3,1.2,(Math.random()-0.5)*0.3,2.4,0.5,[0.1,0.09,0.08,0.4],false,-0.35);
    if(k<0.3)continue;
    for(const z of Z){if(z.vivo&&Math.abs(z.y-c.y)<1.6&&d2(z.x,z.z,c.x,c.z)<r*r)acender(z,z.tipo==='colosso'?3:5);}
    for(const b of BICHOS){if(b.vivo&&Math.abs(b.y-c.y)<1.6&&d2(b.x,b.z,c.x,c.z)<r*r){b.queimaT=(b.queimaT||0)-dt;if(b.queimaT<=0){b.queimaT=0.5;ferirBicho(b,10,0,0,'fogo');}}}
    if(P.alive&&!CARRO.ativo&&Math.abs(P.y-c.y)<1.6&&d2(P.x,P.z,c.x,c.z)<r*r*0.75)P.queima=Math.max(P.queima||0,1.4);
    if(CAO.ativo&&CAO.vivo!==false&&d2(CAO.x,CAO.z,c.x,c.z)<r*r)CAO.queima=(CAO.queima||0)+dt;
    for(const o of OB){if(o.tipo==='muroPedra'||o.tipo==='fogueira'||OBRAS[o.tipo].alto)continue;if(d2(o.x,o.z,c.x,c.z)<(r+0.8)*(r+0.8)&&Math.abs(o.y-c.y)<2){o.queimaT=(o.queimaT||0)-dt;if(o.queimaT<=0){o.queimaT=1;danoObra(o,9);}}}}}
function updateQueimados(dt){
  for(const z of Z){if(!(z.queima>0))continue;if(!z.vivo){z.queima=0;continue;}z.queima-=dt;const sc=z.ch.s||1;if(z.st==='dorme'||z.st==='guarda')z.flash=Math.max(z.flash,0.05);
    z.hp-=(z.tipo==='colosso'?28:16)*dt*(1+0.15*perk('mira'));const fl=0.75+0.25*Math.sin(G.t*23+z.id);z.ch.tint=[1.25+0.5*fl,0.62+0.2*fl,0.32];
    if(Math.random()<dt*28*sc)part(z.x+(Math.random()-0.5)*0.5*sc,z.y+(0.3+Math.random()*1.4)*sc,z.z+(Math.random()-0.5)*0.5*sc,(Math.random()-0.5)*0.4,1+Math.random(),(Math.random()-0.5)*0.4,0.35+Math.random()*0.3,(0.12+Math.random()*0.1)*sc,[1,0.42+Math.random()*0.3,0.08,0.95],true,-0.8);
    if(Math.random()<dt*2.5)for(const o of Z)if(o!==z&&o.vivo&&!(o.queima>0)&&d2(o.x,o.z,z.x,z.z)<0.9*0.9)acender(o,3.2);
    if(z.vivo&&P.alive&&!CARRO.ativo&&d2(P.x,P.z,z.x,z.z)<0.7*0.7&&Math.abs(P.y-z.y)<1.5&&Math.random()<dt*1.2)P.queima=Math.max(P.queima||0,1.2);
    if(z.hp<=0){z.hp=0.5;z.queima=0;ferirZ(z,1,0,0,0);progresso('queimado');}}
  if(P.queima>0&&P.alive){P.queima-=dt;
    if(P.rola||naAgua(P.x,P.y,P.z)){P.queima=0;feed('Fogo apagado');sfx('apagar');}
    else{P.queimaT=(P.queimaT||0)-dt;if(P.queimaT<=0){P.queimaT=0.5;ferirJogador(4.5*(1-fogoRoupa()),null);}
      if(Math.random()<dt*24)part(P.x+(Math.random()-0.5)*0.5,P.y+0.3+Math.random()*1.3,P.z+(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.4,1+Math.random(),(Math.random()-0.5)*0.4,0.35,0.13,[1,0.45,0.1,0.95],true,-0.8);
      dica('queimando','alerta','Você está pegando fogo! Saia das chamas e role no chão (correndo, aperte C) para apagar.');}}
  if(CAO.queima>0){CAO.queima=Math.max(0,CAO.queima-dt*0.5);}}
function updateArmas2(dt){updateFlechas(dt);updateArremessos(dt);updateChamas(dt);updateQueimados(dt);}
function resetArmas2(){FLECHAS.length=0;ARREMESSOS.length=0;CHAMAS.length=0;P.queima=0;}

/* ---------- poses ---------- */
/* arco: tronco de lado (ombro esquerdo para o alvo), braço esquerdo esticado, o direito puxa a corda até o queixo */
const ARCO_POSE={sol:[-1.55,0.62,0,-0.25,0,0],cheio:[-0.203,0.829,1.755,-2.113,0,0]};
function poseArco(o,k,pu){if(k<=0.01){S3(o,3,lerp(o[9],-0.32,1),0,-0.1);S3(o,4,-0.55,0,0);return;}
  const tw=0.9*k;o[1]=lerp(o[1],-0.3,k);o[4]-=0.6*k;o[7]+=0.82*k;o[6]=lerp(o[6],-0.05,k);
  S3(o,3,lerp(o[9],-1.6,k),lerp(o[10],tw,k),lerp(o[11],0,k));S3(o,4,lerp(o[12],0,k),0,0);
  const A=ARCO_POSE.sol,B=ARCO_POSE.cheio,e=easeIO(clamp(pu,0,1));
  S3(o,5,lerp(o[15],lerp(A[0],B[0],e),k),lerp(o[16],lerp(A[1],B[1],e),k),lerp(o[17],lerp(A[2],B[2],e),k));
  S3(o,6,lerp(o[18],lerp(A[3],B[3],e),k),0,0);S3(o,11,0,0,0);}
/* arremesso por cima do ombro */
function poseArremesso(o,s){let ux,fo,ch;
  if(s<0.38){const k=easeIO(s/0.38);ux=lerp(-0.4,-2.75,k);fo=lerp(-0.5,-1.3,k);ch=lerp(0,0.35,k);}
  else{const k=easeOut(Math.min(1,(s-0.38)/0.22));ux=lerp(-2.75,-0.9,k);fo=lerp(-1.3,-0.15,k);ch=lerp(0.35,-0.45,k);}
  const w=Math.min(1,(1-s)/0.25+0.2);o[4]=lerp(o[4],ch,w);S3(o,5,lerp(o[15],ux,w),0,lerp(o[17],0.15,w));S3(o,6,lerp(o[18],fo,w),0,0);S3(o,3,lerp(o[9],-0.7,w),0,lerp(o[11],-0.25,w));}

/* ---------- desenho ---------- */
function armas2Geometria(){const out={},R=rng(77),mk=f=>{const g=new GB(512,8);f(g);return g.data();};
  const madeira=lin(0x5a3a22),couro=lin(0x2a1c14);
  // arco no quadro da mão: corpo ao longo de z, pontas curvando para +y (lado de quem atira)
  out.arco=mk(g=>{const N=7,L=0.62,C=0.15;for(const sg of[1,-1])for(let i=0;i<N;i++){const s0=i/N,s1=(i+1)/N,a=[0,C*s0*s0,sg*L*s0],b=[0,C*s1*s1,sg*L*s1];
      const r0=lerp(0.016,0.007,s0),r1=lerp(0.016,0.007,s1),M=alignY(a[0],a[1],a[2],b[0]-a[0],b[1]-a[1],b[2]-a[2]);add(g,cylTris(r1,r0,Math.hypot(b[1]-a[1],b[2]-a[2]),6),M,madeira,{j:0.05,rnd:R});}
    add(g,cylTris(0.021,0.021,0.15,7),mat(0,0,-0.075,Math.PI/2,0,0),couro);
    for(const sg of[1,-1])add(g,boxTris(0.012,0.02,0.03),mat(0,C+0.004,sg*L),lin(0xd8c8a8));});
  out.flecha=mk(g=>{add(g,cylTris(0.0055,0.0055,0.72,5),mat(0,0,0,Math.PI/2,0,0),lin(0x9a7a52));
    add(g,cylTris(0,0.016,0.075,4),mat(0,0,0.715,Math.PI/2,0,0),lin(0x6f6e68),{flat:true});
    for(let k=0;k<3;k++){const a=k*2.094;add(g,boxTris(0.002,0.026,0.1,{tx:0.4}),mm(mat(0,0,0.08,0,0,a),mat(0,0.017,0)),lin(k?0xe0d6c4:0xb8322a));}});
  out.corda=mk(g=>add(g,cylTris(1,1,1,4),mat(0,0,0),lin(0xd8cdb4)));
  return out;}
function arma2Mesh(){if(MESH.flecha)return;const g=armas2Geometria();MESH.arcoM=litMesh(g.arco);MESH.flecha=litMesh(g.flecha);MESH.corda=litMesh(g.corda);}
/* matriz que leva o eixo +z da peça para a direção d, com a base em p */
function matDir(M,p,dx,dy,dz){const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;let xx=dz,xz=-dx,xl=Math.hypot(xx,xz);if(xl<1e-4){xx=1;xz=0;xl=1;}xx/=xl;xz/=xl;
  const yx=dy*xz,yy=dz*xx-dx*xz,yz=-dy*xx;M[0]=xx;M[1]=0;M[2]=xz;M[3]=0;M[4]=yx;M[5]=yy;M[6]=yz;M[7]=0;M[8]=dx;M[9]=dy;M[10]=dz;M[11]=0;M[12]=p[0];M[13]=p[1];M[14]=p[2];M[15]=1;return M;}
/* cilindro unitário esticado de a até b com raio r */
function matSeg(M,a,b,r){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-4,y=[dx/L,dy/L,dz/L];
  let x=Math.abs(y[1])<0.95?[y[2],0,-y[0]]:[1,0,0];const xl=Math.hypot(x[0],x[1],x[2]);x=[x[0]/xl,x[1]/xl,x[2]/xl];const z=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];
  M.set([x[0]*r,x[1]*r,x[2]*r,0,y[0]*L,y[1]*L,y[2]*L,0,z[0]*r,z[1]*r,z[2]*r,0,a[0],a[1],a[2],1]);return M;}
const _MF=new Float32Array(16);
function desenharArmas2(Pg){if(!MESH.flecha)arma2Mesh();
  // flechas voando e cravadas
  for(const f of FLECHAS){if(d2(f.x,f.z,cam.pos[0],cam.pos[2])>70*70)continue;const L=0.78,tip=f.voa?0.66:0.5;
    drawStat(Pg,MESH.flecha,matDir(_MF,[f.x-f.dx*L*tip,f.y-f.dy*L*tip,f.z-f.dz*L*tip],f.dx,f.dy,f.dz));}
  // flechas no corpo dos zumbis
  for(const z of Z){if(!z.flechas||!z.vivo||!z.ch.vis||d2(z.x,z.z,cam.pos[0],cam.pos[2])>45*45)continue;const sc=z.ch.s||1;
    for(const e of z.flechas){const a=e.a+z.ch.yaw,c=Math.sqrt(Math.max(0,1-e.p*e.p)),d=[Math.sin(a)*c,e.p,Math.cos(a)*c],q=[z.x-d[0]*0.08,z.y+e.y*sc,z.z-d[2]*0.08];
      drawStat(Pg,MESH.flecha,matDir(_MF,[q[0]-d[0]*0.7,q[1]-d[1]*0.7,q[2]-d[2]*0.7],d[0],d[1],d[2]));}}
  // garrafas voando
  for(const b of ARREMESSOS)drawStat(Pg,MESH.arma[b.tipo]||MESH.arma.molotov,trs(_MF,b.x,b.y,b.z,b.rx,b.ry,0,1,1,1));
  // arco na mão (terceira pessoa)
  const s=selItem();if(!s||s.id!=='arco'||!P.alive||CARRO.ativo||cfg.cam==='1'||camDist<0.75)return;
  const M=quadroArco();drawStat(Pg,MESH.arcoM,M);
  const t1=xf(M,0,0.15,0.62),t2=xf(M,0,0.15,-0.62),a=P.acao&&P.acao.tipo==='arco'?P.acao:null;let nock=xf(M,0,0.15,0);
  if(a){const h=P.ch.m.subarray(11*16,12*16),mao=[h[12],h[13],h[14]],e=easeIO(a.puxa);nock=[lerp(nock[0],mao[0],Math.min(1,0.35+e)),lerp(nock[1],mao[1],Math.min(1,0.35+e)),lerp(nock[2],mao[2],Math.min(1,0.35+e))];
    const g=[M[12],M[13]+0.02,M[14]],d=[g[0]-nock[0],g[1]-nock[1],g[2]-nock[2]];drawStat(Pg,MESH.flecha,matDir(_MF,nock,d[0],d[1],d[2]));}
  drawStat(Pg,MESH.corda,matSeg(_MF,t1,nock,0.0028));drawStat(Pg,MESH.corda,matSeg(_MF,nock,t2,0.0028));}
/* primeira pessoa: arco à esquerda da tela, flecha apontando para a mira */
const _M1=new Float32Array(16),_M2=new Float32Array(16);
function desenharArco1P(Pg,CWm){if(!MESH.flecha)arma2Mesh();const a=P.acao&&P.acao.tipo==='arco'?P.acao:null,e=a?easeIO(a.puxa):0,bob=Math.sin(P.ph*2)*0.01*P.amp;
  // eixos da peça: x -> -x da câmera, y (curva para quem atira) -> +z da câmera, z (corpo) -> y da câmera, inclinado
  const cant=0.34,c=Math.cos(cant),s=Math.sin(cant),px=lerp(-0.26,-0.15,a?1:0),py=lerp(-0.16,-0.05,a?1:0)+bob,pz=-0.68;
  _M1.set([-c,-s,0,0,0,0,1,0,-s,c,0,0,px,py,pz,1]);mul(_M2,CWm,_M1);drawStat(Pg,MESH.arcoM,_M2);
  // flecha deitada ao lado do arco, apontando reto para a mira; puxada, a ponta chega no arco e o fim passa por trás do olho
  const T1=xf(_M1,0,0.15,0.62),T2=xf(_M1,0,0.15,-0.62),tem=a||invCount('flecha')>0,cauda=[px+0.03,py-0.012,pz+lerp(0.15,0.78,e)];
  const nock=tem?cauda:xf(_M1,0,0.15,0),w=v=>xf(CWm,v[0],v[1],v[2]);
  drawStat(Pg,MESH.corda,matSeg(_M2,w(T1),w(nock),0.0022));drawStat(Pg,MESH.corda,matSeg(_M2,w(nock),w(T2),0.0022));
  if(tem)drawStat(Pg,MESH.flecha,matDir(_M2,w(cauda),cam.fwd[0],cam.fwd[1],cam.fwd[2]));
  if(typeof bracoEsqFP==='function')bracoEsqFP(Pg,CWm,[px,py,pz],[-s,c,0],1);}   // 14/11: a mão esquerda fechada na empunhadura
/* brilho das chamas e o arco do arremesso (billboards somando luz) */
function bbArmas2(){const n=E.n||0;
  for(const f of FLECHAS)if(f.voa)for(let k=1;k<=4;k++)bb(f.x-f.vx*0.012*k,f.y-f.vy*0.012*k,f.z-f.vz*0.012*k,0.022,1,0.95,0.85,0.22*(1-k/5));   // rastro da flecha
  for(const c of CHAMAS){const k=c.k||0;if(k<=0.02)continue;const fl=0.8+0.2*Math.sin(G.t*17+c.x);bb(c.x,c.y+0.7,c.z,c.rr*1.6,1,0.45,0.15,lerp(0.12,0.3,n)*k*fl);bb(c.x,c.y+0.3,c.z,c.rr*0.8,1,0.7,0.3,0.3*k*fl);}
  for(const z of Z)if(z.queima>0&&z.vivo&&z.ch.vis){const sc=z.ch.s||1;bb(z.x,z.y+1*sc,z.z,1.3*sc,1,0.5,0.18,lerp(0.08,0.22,n));}
  if(P.queima>0)bb(P.x,P.y+1,P.z,1.2,1,0.5,0.18,lerp(0.08,0.22,n));
  // arco do voo da garrafa
  const s=selItem();if(!s||s.id!=='molotov'||!P.alive||CARRO.ativo||G.modo!=='jogo'||OBRA.ativo||(P.acao&&P.acao.tipo==='arremesso'))return;
  const o=origemMao(),v=MOLO.v,dir=dirBalistica(o,alvoArremesso(),v,MOLO.g);let x=o[0],y=o[1],z=o[2],vx=dir[0]*v,vy=dir[1]*v,vz=dir[2]*v;const forte=P.aim>0.3?1:0.55;
  for(let i=0;i<90;i++){const h=0.035;vy-=MOLO.g*h;x+=vx*h;y+=vy*h;z+=vz*h;
    if(i>1)bb(x,y,z,0.06,1,0.62,0.25,0.7*forte*(1-i/110));
    if(y<chaoEm(x,z,y+0.5)||bateRaio(x,y,z)){const g=chaoEm(x,z,y+0.6);for(let k=0;k<16;k++){const a=k/16*6.283+G.t*0.8;bb(x+Math.cos(a)*MOLO.raio*0.75,g+0.1,z+Math.sin(a)*MOLO.raio*0.75,0.1,1,0.45,0.15,0.75*forte);}bb(x,g+0.15,z,0.35,1,0.55,0.2,0.5*forte);break;}}}

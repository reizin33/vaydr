/* ================= o Colosso: zumbi gigante das noites de lua de sangue =================
   uns 4 m de altura, muita vida e não cambaleia com golpe. Ataques:
   · tapa: de perto, como os outros, mas com alcance de gigante
   · pisão: levanta os braços (dá para ver chegando) e bate no chão — onda de choque em volta; pule ou role na hora certa
   · investida: ruge, abaixa e corre em linha reta; se bater em parede, árvore ou construção, fica tonto uns segundos
   · rugido: chama os zumbis de perto
   Fogo machuca mais. Derrubado, deixa suprimentos no chão. Aparece uma vez em cada lua de sangue, perto de onde você está. */
Object.assign(ZS,{colosso:{hp:1800,vaga:0.9,caca:1.5,dano:30,alcance:1.55,r:0.7,obra:6,malha:'brute'}});
Object.assign(ZP,{colosso:{lean:0.22,arm:0.5,arm2:0.62,spread:0.3,leg:0.36,sway:0.6,tilt:0.06}});
const CHEFE={esc:2.25,pisaoR:4.8,pisaoDano:40,pisaoPrep:1.0,invDano:36,invVel:6.4,invPrep:0.75,invDur:1.7};
function criarChefe(x,z){const q=criarZ('colosso',x,z,{noturno:true,st:'caca',viu:0,lx:P.x,lz:P.z,ly:P.y,y:ground(x,z)});if(!q)return null;
  q.chefe={fase:null,t:0,cdPisao:4,cdInv:7,cdRug:0.5};q.tint=[0.8,0.68,0.66];q.ch.yaw=Math.atan2(P.x-x,P.z-z);
  toast('alerta','O Colosso chegou com a lua de sangue. Ele é lento, mas o pisão e a investida derrubam: pule ou role na hora. Fogo machuca mais.');
  return q;}
/* aparece uma vez por lua de sangue, a uns 35 m do jogador, num lugar aberto */
function updateChefe(dt){if(!G.noite||!G.luaSangue||G.chefeVeio||!P.alive||G.modo!=='jogo')return;const h=G.hora;if(!(h>=21.6||h<4))return;
  for(let k=0;k<40;k++){const a=Math.random()*6.283,r=30+Math.random()*12,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
    if(!dentroMapa(x,z,4)||pointBlocked(x,z,1.8))continue;if(emPredios(x,z,2)&&(salaEm(x,ground(x,z)+0.3,z)||bloqueadoAlto(x,z,1.6,ground(x,z)+0.2)))continue;
    if(Math.abs(ground(x,z)-P.y)>6)continue;G.chefeVeio=true;criarChefe(x,z);return;}}
function chefeVivo(){let b=null,bd=1e9;for(const z of Z)if(z.vivo&&(z.tipo==='colosso'||(z.chefeR&&(z.st==='caca'||z.st==='golpe'||z.chefeR.fase||z.hp<z.hpMax)))){const d=d2(z.x,z.z,P.x,P.z);if(d<bd){bd=d;b=z;}}return b&&bd<(b.chefeR?50:80)*(b.chefeR?50:80)?b:null;}
/* ataques especiais: devolve true quando cuidou do zumbi neste quadro (o resto do laço é pulado) */
function chefeAtualiza(z,dt,dp,dxp,dzp){const c=z.chefe,ch=z.ch;if(!c)return false;
  c.cdPisao-=dt;c.cdInv-=dt;c.cdRug-=dt;const mesmoNivel=Math.abs(P.y-z.y)<1.8;
  if(!c.fase&&P.alive&&!CARRO.ativo&&(z.st==='caca'||z.st==='marcha'||z.st==='alerta')){
    if(c.cdRug<=0&&dp<38){c.fase='rugido';c.t=0;}
    else if(c.cdPisao<=0&&dp<CHEFE.pisaoR*0.85&&mesmoNivel){c.fase='pisao';c.t=0;}
    else if(c.cdInv<=0&&dp>7&&dp<26&&mesmoNivel&&trechoLivreChefe(z)){c.fase='investida';c.t=0;c.dir=Math.atan2(dxp,dzp);c.bateu=false;}}
  {const st=Math.floor(z.ph/Math.PI);if(st!==c.passo){c.passo=st;if(dp<24&&z.st!=='atordoado'){P.shake=Math.max(P.shake,0.16*(1-dp/24));sfx('passo',z.x,z.z,1,'terra');}}}   // passos que tremem o chão
  if(!c.fase)return false;
  c.t+=dt;const P2=ZP.colosso,olhar=k=>{ch.yaw=angLerp(ch.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*k));};
  switch(c.fase){
    case'rugido':olhar(5);poseZScream(ch.r,G.t,clamp(Math.min(c.t/0.35,(2.0-c.t)/0.4),0,1));
      if(c.t>0.35&&!c.rugiu){c.rugiu=true;sfx('rugido',z.x,z.z,1.5);RINGS.push({x:z.x,z:z.z,y:z.y+4,a:0},{x:z.x,z:z.z,y:z.y+4,a:-0.3},{x:z.x,z:z.z,y:z.y+4,a:-0.6});
        NOISE.push({x:z.x,z:z.z,r:70,tx:P.x,tz:P.z,y:z.y});if(dp<30)P.shake=Math.max(P.shake,0.55*(1-dp/30));}
      if(c.t>=2.0){c.fase=null;c.rugiu=false;c.cdRug=26+Math.random()*12;}break;
    case'pisao':{if(c.t<0.6)olhar(4);const k=c.t/CHEFE.pisaoPrep;poseChefePisao(ch.r,k);
      if(c.t<CHEFE.pisaoPrep&&Math.random()<dt*12)poeira(z.x+(Math.random()-0.5)*2,z.y,z.z+(Math.random()-0.5)*2,1);
      if(c.t>=CHEFE.pisaoPrep&&!c.bateu){c.bateu=true;pisaoChefe(z);}
      if(c.t>=CHEFE.pisaoPrep+0.85){c.fase=null;c.bateu=false;c.cdPisao=6.5+Math.random()*4;}break;}
    case'investida':{if(c.t<CHEFE.invPrep){olhar(6);c.dir=ch.yaw;poseZScream(ch.r,G.t,clamp(c.t/0.3,0,1));ch.r[3]+=0.4;if(!c.rugiu&&c.t>0.15){c.rugiu=true;sfx('rugido',z.x,z.z,0.8);}break;}
      const dx=Math.sin(c.dir),dz=Math.cos(c.dir),v=CHEFE.invVel,ox=z.x,oz=z.z;z.x+=dx*v*dt;z.z+=dz*v*dt;z.ph+=dt*v*1.6;
      const hit=collide(z,ZS.colosso.r*(ch.s||1),q=>q.solid),mv=Math.hypot(z.x-ox,z.z-oz);
      poseZWalk(ch.r,z.ph,P2,1.35);ch.r[3]+=0.35;ch.r[1]*=0.5;if(Math.random()<dt*20)poeira(z.x,z.y,z.z,1);
      if(Math.random()<dt*3)sfx('passo',z.x,z.z,1,'terra');
      // pega o jogador no caminho
      if(!c.bateu&&P.alive&&d2(P.x,P.z,z.x,z.z)<2.1*2.1&&mesmoNivel){c.bateu=true;ferirJogador(CHEFE.invDano,z);empurraJogador(z,11);}
      // bateu em algo: obra leva dano, ele fica tonto
      if(hit&&mv<v*dt*0.45){if(hit.obra)danoObra(hit.obra,260);sfx('impacto',z.x,z.z,1);poeira(z.x+dx,z.y+1,z.z+dz,14);if(dp<18)P.shake=Math.max(P.shake,0.4);
        c.fase=null;c.rugiu=false;c.cdInv=11+Math.random()*6;z.st='atordoado';z.t=2.4;z.kx=-dx*1.5;z.kz=-dz*1.5;
        dica('colossoTonto','corpo','O Colosso bateu e ficou tonto: agora ele leva mais dano. É a hora de bater!');break;}
      if(c.t>=CHEFE.invPrep+CHEFE.invDur){c.fase=null;c.rugiu=false;c.cdInv=11+Math.random()*6;}break;}}
  {const cz=chaoEm(z.x,z.z,z.y);z.y=cz;z.vy=0;}ch.x=z.x;ch.z=z.z;ch.y=z.y;ch.hipY=0;return true;}
/* só a saída precisa estar livre: se ele bater numa árvore ou parede no meio do caminho, fica tonto (dá para usar isso) */
function trechoLivreChefe(z){const dx=P.x-z.x,dz=P.z-z.z,d=Math.hypot(dx,dz);for(let t=2;t<Math.min(d-1,6);t+=0.8){const x=z.x+dx/d*t,q=z.z+dz/d*t;if(pointBlocked(x,q,0.5))return false;}return true;}
function empurraJogador(z,f){const dx=P.x-z.x,dz=P.z-z.z,d=Math.hypot(dx,dz)||1;P.vx+=dx/d*f;P.vz+=dz/d*f;if(P.noChao){P.vy=4.2;P.noChao=false;}}
/* pisão: onda de choque em volta; quem está no ar (pulando) ou rolando escapa */
function pisaoChefe(z){const R=CHEFE.pisaoR,s=z.ch.s||1;sfx('impacto',z.x,z.z,1.3);P.shake=Math.max(P.shake,0.9*clamp(1-Math.hypot(P.x-z.x,P.z-z.z)/30,0.2,1));
  const fx=Math.sin(z.ch.yaw),fz=Math.cos(z.ch.yaw);RINGS.push({x:z.x+fx*1.2,z:z.z+fz*1.2,y:z.y+0.15,a:0});
  for(let i=0;i<26;i++){const a=i/26*6.283;part(z.x+fx*1.2+Math.cos(a)*0.8,z.y+0.2,z.z+fz*1.2+Math.sin(a)*0.8,Math.cos(a)*7,0.6+Math.random(),Math.sin(a)*7,0.9,0.35,[0.45,0.38,0.3,0.5],false,1.5);}
  poeira(z.x+fx*1.2,z.y,z.z+fz*1.2,16);
  const d=Math.hypot(P.x-z.x,P.z-z.z);
  if(P.alive&&d<R&&Math.abs(P.y-z.y)<1.2&&P.noChao){ferirJogador(CHEFE.pisaoDano*(1-0.45*d/R),z);empurraJogador(z,8);if(d<R*0.5&&Math.random()<0.3)lesao('perna');}
  else if(P.alive&&d<R&&!P.noChao)dica('pisaoPulo','corpo','Boa! No ar, a onda do pisão não pega.');
  for(const o of OB)if(d2(o.x,o.z,z.x,z.z)<(R+1)*(R+1))danoObra(o,90);
  for(const q of Z)if(q!==z&&q.vivo&&d2(q.x,q.z,z.x,z.z)<R*R){q.st='atordoado';q.t=0.8;const dx=q.x-z.x,dz=q.z-z.z,l=Math.hypot(dx,dz)||1;q.kx=dx/l*4;q.kz=dz/l*4;}
  if(CAO.ativo&&d2(CAO.x,CAO.z,z.x,z.z)<R*R&&typeof ferirCao==='function')ferirCao(15);}
function poseChefePisao(o,k){o.fill(0);const up=k<1?easeIO(clamp(k,0,1)):1,b=k<1?0:Math.min(1,(k-1)*8);
  const ax=lerp(lerp(-0.5,-2.95,up),-0.85,b);
  S3(o,1,lerp(lerp(0.15,-0.3,up),0.8,b),0,0);S3(o,2,lerp(lerp(0.2,-0.35,up),0.25,b),0,0);
  S3(o,3,ax,0,0.28);S3(o,4,lerp(-0.4,-0.15,up),0,0);S3(o,5,ax,0,-0.28);S3(o,6,lerp(-0.4,-0.15,up),0,0);
  S3(o,7,lerp(-0.1,-0.45,b),0,0.12);S3(o,8,lerp(0.15,0.65,b),0,0);S3(o,9,lerp(0.05,0.25,b),0,-0.12);S3(o,10,lerp(0.15,0.5,b),0,0);}
function chefeMorreu(z){conquista('colosso');P.shake=Math.max(P.shake,0.6);sfx('impacto',z.x,z.z,1.2);poeira(z.x,z.y+0.5,z.z,24);
  const lo=rollLoot('suprimentos');lo.push(['kit',1],['molotov',2],['flecha',10]);soltarItens(lo,z.x,z.z,z.y);
  G.chefes=(G.chefes||0)+1;setTimeout(()=>toast('radio','Vocês derrubaram o Colosso? Que coisa... Ele deixou suprimentos no chão. Corram pegar antes do amanhecer.'),1800);}
/* olhos vermelhos brilhando no escuro */
function bbChefe(){const n=E.n||0;for(const z of Z){if(z.tipo!=='colosso'||!z.vivo||!z.ch.vis)continue;const m=z.ch.m.subarray(2*16,3*16);
  for(const s of[-1,1]){const p=xf(m,s*0.033,0.155,0.125);bb(p[0],p[1],p[2],0.032*(z.ch.s||1),1,0.12,0.04,lerp(0.55,1,n));}}}

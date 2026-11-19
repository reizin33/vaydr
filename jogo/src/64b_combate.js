/* ================= Combate com peso, com cara de Dying Light (v10.5.0, 19/11/2026) =================
   Pedido do Himalaia: "jogabilidade dura... combate". Aqui o zumbi vai ao chão e dá para acabar com ele no chão:
   · zumbi derrubado ('derrubado'): cai de costas com o tranco, fica uns 2,4 s no chão e levanta com a animação de levantar
     (a mesma do zumbi que dorme). No chão ele não ataca, e golpe nele tira 50% a mais;
   · voadora: correndo, o empurrão (Q) vira voadora: o personagem pula para a frente com o pé e derruba os zumbis da frente
     (brutamontes, chefes, rastejantes e cachorros só cambaleiam). Gasta mais energia que o empurrão;
   · pisão: com um zumbi caído na frente, o golpe (ou o Q) vira pisão na cabeça: acaba com o zumbi comum de uma vez;
   · combinação: empurrão e logo depois um golpe derruba; armas pesadas (taco, taco com pregos, machado, picareta, clava)
     às vezes derrubam sozinhas;
   · as pernas do personagem fazem a voadora e o pisão (a pose do jogo entra nas pernas só nessa hora; 62z_sobrevivente). */
const CB={tempo:2.4,levanta:1.35,bonus:1.5,voaCusto:14,voaVel:8.2,pisaoDano:260};
function zDerrubavel(z){const S=ZS[z.tipo]||{};return!!z.vivo&&!z.lan&&!z.chefe&&!z.chefeR&&!S.chefeR&&z.tipo!=='colosso'&&z.tipo!=='brute'&&!S.baixo&&!S.cao&&z.st!=='sobe'&&z.st!=='dorme';}
function derrubarZ(z,kx,kz,t){if(!zDerrubavel(z))return false;const ch=z.ch;
  z.st='derrubado';z.t=t||CB.tempo;z.kx=kx||0;z.kz=kz||0;z.derrT=0;z.levanta=0;z.flinch=0;
  if(ch&&ch.sk)skTocar(ch,'zLevantar',{ext:true,ini:0,peso:1,mix:8,rot:0,reinicia:true});
  sfx('impacto',z.x,z.z,0.7);poeira(z.x,z.y+0.1,z.z,4);return true;}
/* chamado pelo laço dos zumbis (40_game) enquanto ele está no chão */
function zDerrubadoPasso(z,dt){const ch=z.ch,S=ZS[z.tipo]||{};z.t-=dt;z.derrT=(z.derrT||0)+dt;
  z.x+=z.kx*dt;z.z+=z.kz*dt;z.kx*=Math.exp(-dt*4.5);z.kz*=Math.exp(-dt*4.5);
  if(Math.abs(z.kx)+Math.abs(z.kz)>0.05)collide(z,S.r||0.34,q=>q.solid);
  z.y=chaoEm(z.x,z.z,z.y+0.4);ch.x=z.x;ch.z=z.z;ch.y=z.y;
  if(ch.vis){if(ch.sk){ch.sk.ct=0;ch.sk.ext=true;ch.pitch=0;}else{ch.pitch=-1.45*easeOut(Math.min(1,z.derrT/0.35));}}
  if(z.t<=0){z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;ch.pitch=0;if(ch.sk){z.levanta=CB.levanta;z.levantaD=CB.levanta;}}}
/* golpe em zumbi caído: dano maior e ele continua no chão; combinação e armas pesadas derrubam */
{const _fz=ferirZ;ferirZ=function(z,dmg,kx,kz,forte){
  if(!z||z.lan)return _fz.apply(this,arguments);
  const golpe=!!(ZHIT&&ZHIT.k==='golpe'),caido=z.st==='derrubado',t0=z.t;
  if(caido&&dmg>0)dmg*=CB.bonus;
  const empurrado=z.st==='atordoado'&&G.t-(z.empT||-9)<1.3;
  const r=_fz.call(this,z,dmg,kx,kz,forte);
  if(!z.vivo)return r;
  if(caido){z.st='derrubado';z.t=Math.max(t0,0.6);z.kx=z.kz=0;return r;}
  if(golpe){const a=P.acao,s=a&&a.arma,d=s?ITEMS[s.id]:null;let ch=0;
    if(empurrado)ch=1;else if(d){ch=Math.max(0,((d.empurra||0)-1.0))*0.45+(d.vertical&&d.corpo&&(d.dano||0)>=30?0.15:0);}
    if(ch>0&&Math.random()<ch){const l=Math.hypot(kx||0,kz||0)||1;derrubarZ(z,(kx||0)/l*3,(kz||0)/l*3);if(empurrado)feed('Derrubou!');}}
  return r;};}
/* voadora (correndo + empurrar) e pisão (zumbi caído na frente) */
function zCaidoNaFrente(alc){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let best=null,bd=alc||1.9;
  for(const z of Z){if(!z.vivo||z.st!=='derrubado'||Math.abs(z.y-P.y)>1.2)continue;const dx=z.x-P.x,dz=z.z-P.z,d=Math.hypot(dx,dz);
    if(d<bd&&(dx*fx+dz*fz)/(d||1)>0.25){bd=d;best=z;}}return best;}
function comecarPisao(z){if(P.acao||P.cd>0||!P.alive||!P.noChao||P.energia<5)return false;const y=Math.atan2(z.x-P.x,z.z-P.z);
  P.acao={tipo:'pisao',t:0,dur:0.62,alvo:z,mira:y};P.energia-=5;P.body=y;sfx('golpe');return true;}
function comecarVoadora(){if(P.acao||P.cd>0||!P.alive||!P.noChao||P.energia<CB.voaCusto)return false;
  const y=P.yaw,fx=Math.sin(y),fz=Math.cos(y);P.acao={tipo:'voadora',t:0,dur:0.7,mira:y};P.energia-=CB.voaCusto;P.body=y;
  P.vx=fx*CB.voaVel;P.vz=fz*CB.voaVel;P.vy=3.3;P.noChao=false;sfx('golpe');barulho(P.x,P.z,5,true);
  dica('voadora','corpo','Voadora! Correndo, o empurrão (Q) vira voadora e derruba. Zumbi no chão: o golpe vira pisão.');return true;}
{const _em=empurrar;empurrar=function(){if(P.montado||CARRO.ativo)return _em.apply(this,arguments);
  if(!P.acao&&P.cd<=0){const z=zCaidoNaFrente();if(z&&comecarPisao(z))return;if(P.correndo&&comecarVoadora())return;}
  return _em.apply(this,arguments);};}
{const _at=atacar;atacar=function(){const d=selDef();
  if(!P.acao&&P.cd<=0&&!CARRO.ativo&&!P.montado&&!(d&&(d.fogo||d.arco)&&(P.aim||0)>0.25)){const z=zCaidoNaFrente(1.7);if(z&&comecarPisao(z))return;}
  return _at.apply(this,arguments);};}
{const _sa=stepAcao;stepAcao=function(dt){const a=P.acao;const r=_sa.apply(this,arguments);if(!a)return r;
  /* empurrão: marca quem foi empurrado (golpe logo depois derruba) */
  if(a.tipo==='empurrar'&&a.hit&&!a.pkMarcou){a.pkMarcou=true;for(const z of Z)if(z.vivo&&z.st==='atordoado'&&Math.hypot(z.x-P.x,z.z-P.z)<2.6)z.empT=G.t;}
  if(a.tipo==='voadora'&&!a.hit&&a.t>=0.16){const fx=Math.sin(a.mira),fz=Math.cos(a.mira);let n=0;
    for(const z of Z){if(!z.vivo||z.lan||Math.abs(z.y-P.y)>1.6)continue;const dx=z.x-P.x,dz=z.z-P.z,dd=Math.hypot(dx,dz);
      if(dd<2.5&&(dx*fx+dz*fz)/(dd||1)>0.35){const l=dd||1;ZHIT={k:'voadora'};ferirZ(z,12,dx/l*0.8,dz/l*0.8,1);
        if(z.vivo&&!derrubarZ(z,dx/l*5.5,dz/l*5.5)){z.st='atordoado';z.t=Math.max(z.t||0,0.7);z.kx=dx/l*2.5;z.kz=dz/l*2.5;}n++;}}
    if(n){a.hit=true;sfx('impacto');P.shake=0.45;G.hitstop=Math.max(G.hitstop||0,0.09);P.vx*=0.35;P.vz*=0.35;}
    else if(a.t>=0.42)a.hit=true;}
  if(a.tipo==='pisao'&&!a.hit&&a.t>=0.34){a.hit=true;const z=a.alvo;
    if(z&&z.vivo&&z.st==='derrubado'&&Math.hypot(z.x-P.x,z.z-P.z)<2.3){const hy=z.y+0.18;ZHIT={k:'pisao'};
      sangue(z.x,hy,z.z,14,[0,0.4,0],true);mancha(z.x,z.y,z.z,0.5);ferirZ(z,CB.pisaoDano,0,0,1);
      sfx('impacto');sfx('estalo',z.x,z.z,0.9);P.shake=0.5;G.hitstop=Math.max(G.hitstop||0,0.12);barulho(P.x,P.z,6,true);
      if(!z.vivo&&!G.dicas.pisao){G.dicas.pisao=1;feed('Pisão!');}}else sfx('passo',undefined,undefined,0.6,'terra');}
  return r;};}
/* as pernas fazem a voadora e o pisão (no corpo do sobrevivente, as pernas vêm do clipe; aqui a pose do jogo entra nelas) */
function poseVoadora(o,k){const s=Math.sin(Math.min(1,k)*Math.PI);
  S3(o,9,-1.4*s,0,0);S3(o,10,lerp(0.9,0.05,Math.min(1,k*2.2))*s+0.05,0,0);S3(o,7,0.06*s,0,0);S3(o,8,0.08*s,0,0);   // perna de apoio reta (dobrada, o pé subia e o corpo descia até o joelho)
  S3(o,1,-0.32*s,0,0);S3(o,3,-0.5*s,0,0.75*s);S3(o,5,-0.3*s,0,-0.85*s);S3(o,0,-0.12*s,0,0);}
function posePisao(o,k){const sobe=k<0.5?Math.sin(k/0.5*Math.PI/2):1,desce=k<0.5?0:Math.min(1,(k-0.5)/0.12),volta=k>0.75?(k-0.75)/0.25:0;
  const th=lerp(-1.25*sobe,-0.35,desce),kn=lerp(1.55*sobe,0.15,desce);
  S3(o,9,th*(1-volta),0,0);S3(o,10,kn*(1-volta),0,0);S3(o,7,0.04*sobe*(1-volta),0,0);S3(o,8,0.08*sobe*(1-volta),0,0);
  S3(o,1,0.35*(1-volta),0,0);S3(o,2,0.25*(1-volta),0,0);S3(o,3,-0.4*sobe*(1-volta),0,0.35);S3(o,5,-0.4*sobe*(1-volta),0,-0.35);}
{const _aj=animarJogador;animarJogador=function(dt){const r=_aj.apply(this,arguments);const a=P.acao;
  if(a&&a.tipo==='voadora')poseVoadora(P.ch.r,a.t/a.dur);else if(a&&a.tipo==='pisao')posePisao(P.ch.r,a.t/a.dur);return r;};}
{const _sl=survLoco;survLoco=function(ch,dt){const r=_sl.apply(this,arguments);const a=P.acao,s=ch.sk;
  if(a&&(a.tipo==='voadora'||a.tipo==='pisao')&&s&&s.loco){const L=s.loco;for(let i=SKI.LeftUpLeg;i<=SKI.RightToeBase;i++)L.m[i]=0;L.m[SKI.Hips]=0.3;L.m[SKI.Spine]=0.3;L.m[SKI.Spine1]=0.3;L.m[SKI.Spine2]=0.3;}
  return r;};}

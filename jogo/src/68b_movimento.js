/* ================= Movimento com peso (v10.8.1) =================
   Himalaia (19/11/2026): "aproxime o jogo o máximo do real: estrutura, movimentação, está muito sintético"
   (escolheu andar e correr; pular, escalar e cair; câmera; zumbis).
   Jogador:
   · arrancada e parada com peso: antes chegava na velocidade e parava seco (7, 10 e 17 por segundo); agora 5, 7,5 e 9,5;
   · o corpo vira com peso andando e, parado, gira com passinhos para o lado (antes girava no lugar, com os pés deslizando);
   · o sobrevivente inclina o corpo inteiro com a aceleração: para a frente ao arrancar, para trás ao frear (os clipes dele
     cobriam a inclinação do tronco da etapa 19, que continua no boneco clássico; a de curva, no ch.roll, já valia para os dois);
   · pouso de lugar alto amortece: perde velocidade por um instante (de mais alto, mais);
   · andar devagar (Caps Lock liga e desliga): passo de caminhada de verdade, mais silencioso e mais difícil de ver;
   · a câmera de terceira pessoa segue o corpo com um atraso pequeno (antes ficava grudada).
   Ajustes > Jogo > Movimento: "Realista" (padrão) ou "Ágil" (o jeito de antes, para quem preferir).
   Zumbis (sempre):
   · cada um anda do seu jeito: velocidade própria, uns mancam (o passo puxa de uma perna), balançam de um lado para o outro
     e às vezes tropeçam na caçada;
   · inércia: aceleram, freiam e fazem a curva (antes mudavam de direção na hora e deslizavam de lado);
   · o corpo vai inclinado para a frente na caçada, mais quanto mais rápido. */
const MOV_PESOS={
  realista:{corre:5.0,anda:7.5,para:9.5,vira:9,viraParado:6,giroMax:3.6,cam:14,incl:1},
  agil:{corre:7,anda:10,para:17,vira:12,viraParado:7,giroMax:99,cam:24,incl:0}};
let MOV_PESO=MOV_PESOS.realista;
const MOV_DEVAGAR=1.75;   // m/s do andar devagar (o passo normal do jogo é 4,2: um trote)
function movPesoAplicar(){MOV_PESO=MOV_PESOS[typeof cfg!=='undefined'&&cfg&&cfg.movimento==='agil'?'agil':'realista'];}

/* virar o corpo: mirando e golpeando continua rápido; andando, com peso; parado, gira com velocidade limitada */
function movVirar(b,bt,dt,sp){const M=MOV_PESO;
  if(P.acao||P.aim>0.3)return angLerp(b,bt,1-Math.exp(-dt*16));
  if(cfg.cam==='1')return angLerp(b,bt,1-Math.exp(-dt*(sp>0.5?12:7)));   // primeira pessoa: como antes (o golpe sai para onde o corpo olha)
  if(sp>0.5)return angLerp(b,bt,1-Math.exp(-dt*M.vira));
  const lim=M.giroMax*dt;return b+clamp(angDiff(b,bt)*(1-Math.exp(-dt*M.viraParado)),-lim,lim);}

/* rampa: subindo (ladeira, escadaria, morro) você vai mais devagar e cansa mais; descendo, um pouco mais rápido (v10.8.5).
   Mede o chão 0,7 m à frente na direção em que você anda (o chão das escadas e rampas conta); buraco ou beirada à frente não conta. */
let MOV_RAMPA=0;
function movRampa(){if(!P.noChao||P.voo||!MOV_PESO.incl){MOV_RAMPA*=0.8;return 1;}const sp=Math.hypot(P.vx||0,P.vz||0);if(sp<0.5){MOV_RAMPA*=0.8;return 1;}
  const fx=P.vx/sp,fz=P.vz/sp,y1=chaoEm(P.x+fx*0.7,P.z+fz*0.7,P.y+0.6);if(!isFinite(y1)||P.y-y1>1.0){MOV_RAMPA*=0.8;return 1;}
  MOV_RAMPA+=(clamp((y1-P.y)/0.7,-1,1)-MOV_RAMPA)*0.2;
  return MOV_RAMPA>0?1-Math.min(0.28,MOV_RAMPA*0.45):1+Math.min(0.06,-MOV_RAMPA*0.12);}
/* velocidade: pouso amortecido, andar devagar e rampa */
function movFatorVel(running){let f=movRampa();
  if(P.amortece>0)f*=1-0.5*clamp(P.amortece/0.3,0,1);
  if(P.devagar&&!running&&!P.agachado)f*=MOV_DEVAGAR/4.2;
  return f;}

/* inclinação do corpo pela aceleração (no chão, andando ou correndo), no sobrevivente */
const MOVI={p:0,vx:0,vz:0,ax:0,az:0,ok:false};
function movLivre(){return P.alive&&G.modo!=='criacao'&&!(typeof CARRO!=='undefined'&&CARRO.ativo)&&!P.montado&&!P.nada&&!P.escala&&!P.muro&&!P.rola&&!P.dorme&&!P.trilho&&!P.voo;}
function movInclinar(dt){const ch=P.ch,M=MOVI;if(!ch)return;
  if(!movLivre()||!(dt>0)||!MOV_PESO.incl||!ch.surv){
    if(M.ok){M.ok=false;M.p=0;if(movLivre())ch.pitch=0;}
    M.vx=P.vx||0;M.vz=P.vz||0;M.ax=M.az=0;return;}
  const ax=((P.vx||0)-M.vx)/dt,az=((P.vz||0)-M.vz)/dt;M.vx=P.vx||0;M.vz=P.vz||0;
  const kf=1-Math.exp(-dt*10);M.ax+=(clamp(ax,-80,80)-M.ax)*kf;M.az+=(clamp(az,-80,80)-M.az)*kf;
  const b=P.body??P.yaw;let aF=M.ax*Math.sin(b)+M.az*Math.cos(b);if(!P.noChao)aF=0;
  const k=(1-0.8*clamp(P.aim||0,0,1))*(1-0.6*(P.agK||0));
  // para a frente ao arrancar, para trás ao frear; e um pouco à frente na disparada
  const tp=(clamp(aF*0.011,-0.07,0.12)+(P.runK||0)*0.045)*k;
  M.p+=(tp-M.p)*(1-Math.exp(-dt*8));ch.pitch=M.p;M.ok=true;}

{const _up=updatePlayer;updatePlayer=function(dt){movPesoAplicar();
  const r=_up.apply(this,arguments);
  try{P.amortece=Math.max(0,(P.amortece||0)-dt);movInclinar(dt);if(P.correndo&&MOV_RAMPA>0.12)P.energia=Math.max(0,P.energia-dt*MOV_RAMPA*5);}catch(e){console.error('movimento',e);}
  return r;};}

/* pouso de lugar alto: o corpo amortece e perde velocidade por um instante (o pulo normal não conta) */
{const _po=pousar;pousar=function(chao){const iq=(-P.vy)/MOV.kq;const r=_po.apply(this,arguments);
  try{if(MOV_PESO.incl&&iq>6.2&&!P.rola&&!P.voo){P.amortece=Math.min(0.55,0.18+(iq-6.2)*0.06);const k=Math.max(0.45,1-(iq-6.2)*0.09);P.vx*=k;P.vz*=k;}}catch(e){}
  return r;};}

/* sobrevivente: parado e girando, dá passinhos para o lado do giro (o clipe de andar de lado, no ritmo do giro) */
const MOVG={bAnt:null,giro:0};
{const _sl=survLoco;survLoco=function(ch,dt){
  const b=P.body??P.yaw;let w=0;if(MOVG.bAnt!==null&&dt>0)w=angDiff(MOVG.bAnt,b)/dt;MOVG.bAnt=b;
  MOVG.giro+=(clamp(w,-8,8)-MOVG.giro)*(1-Math.exp(-dt*12));
  const sp=Math.hypot(P.vx||0,P.vz||0),g=Math.abs(MOVG.giro);
  if(!MOV_PESO.incl||sp>0.3||g<0.7||!P.noChao||P.agachado||P.acao||(P.aim||0)>0.3)return _sl.apply(this,arguments);
  // velocidade de mentira só para a mistura dos clipes: para a esquerda (giro positivo) ou para a direita
  const v=Math.min(1.1,0.35+g*0.28)*Math.sign(MOVG.giro),vx0=P.vx,vz0=P.vz;
  P.vx=Math.cos(b)*v;P.vz=-Math.sin(b)*v;
  try{return _sl.apply(this,arguments);}finally{P.vx=vx0;P.vz=vz0;}};}

/* andar devagar: Caps Lock liga e desliga (dá para trocar a tecla em Ajustes > Teclas) */
ACOES_TECLA.splice(ACOES_TECLA.findIndex(a=>a.id==='agachar')+1,0,{id:'devagar',nome:'Andar devagar (liga e desliga)',pad:'CapsLock'});
montarTraducao();if(typeof rotulosTeclas==='function')rotulosTeclas();
function movDevagar(on){P.devagar=!!on;feed(on?'Andando devagar: passo de caminhada, mais silencioso':'Passo normal');
  if(on)dica('devagar','corpo','Andando devagar você faz menos barulho e os zumbis demoram mais para te notar. Correr (Shift) continua valendo; aperte de novo para voltar ao passo normal.');}
window.addEventListener('keydown',e=>{if(e.code!=='CapsLock'||e.repeat)return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||''))return;
  if(G.modo!=='jogo'||(typeof CARRO!=='undefined'&&CARRO.ativo))return;e.preventDefault();movDevagar(!P.devagar);});
{const _zv=zVisao;zVisao=function(){const r=_zv.apply(this,arguments);return P.devagar&&!P.agachado&&!IN.run&&!P.correndo?r*0.85:r;};}

/* ---------- zumbis: jeito de andar, inércia e inclinação ---------- */
const ZMARCHA={
  walker:{k:0.14,manca:0.6,balanca:0.24,inercia:4.5,trop:1},runner:{k:0.1,manca:0.18,balanca:0.07,inercia:6,trop:0.6},
  brute:{k:0.08,manca:0.3,balanca:0.12,inercia:3.2,trop:0.25},screamer:{k:0.12,manca:0.45,balanca:0.2,inercia:4.5,trop:0.8},
  policial:{k:0.1,manca:0.4,balanca:0.16,inercia:4.5,trop:0.7},inchado:{k:0.12,manca:0.5,balanca:0.3,inercia:3.4,trop:1.1},
  caoZ:{k:0.08,manca:0,balanca:0,inercia:7.5,trop:0},rastejante:{k:0.12,manca:0,balanca:0,inercia:5,trop:0},
  colosso:{k:0.04,manca:0.15,balanca:0.06,inercia:2.8,trop:0},acougueiro:{k:0.05,manca:0.25,balanca:0.1,inercia:3,trop:0},
  sargento:{k:0.05,manca:0.2,balanca:0.08,inercia:3.4,trop:0},pacienteZero:{k:0.05,manca:0.35,balanca:0.2,inercia:3,trop:0}};
const ZTROP=0.8,_ZPA=[0,0,0,1,0];
function zAcaso(z,n){const s=Math.sin(((z.id||0)+1)*12.9898+n*78.233)*43758.5453;return s-Math.floor(s);}
/* o jeito de cada zumbi (fixo pelo número dele): a velocidade média continua a do tipo */
function zGait(z){if(z.gait)return z.gait;const d=ZMARCHA[z.tipo]||ZMARCHA.walker,a=zAcaso(z,1),b=zAcaso(z,2),c=zAcaso(z,3);
  const manca=d.manca*(b<0.45?0.55+0.45*c:0.12);
  return z.gait={k:(1+d.k*(a*2-1))/(1-manca/Math.PI),manca,balanca:d.balanca*(0.6+0.8*c),inercia:d.inercia*(0.85+0.3*b),trop:d.trop,lado:a<0.5?0:Math.PI};}
/* passo do zumbi: velocidade desejada (com manco, tropeço e balanço) e inércia; devolve [vx,vz,dirX,dirZ,vel] */
function zPasso(z,dx,dz,v,dt){const o=_ZPA;
  if(z.st==='lan'||z.lan){o[0]=dx*v;o[1]=dz*v;o[2]=dx;o[3]=dz;o[4]=v;return o;}
  const g=zGait(z);let vv=v*g.k;
  if(g.manca>0.01)vv*=1-g.manca*Math.max(0,Math.sin(z.ph+g.lado));
  if(z.tropeca>0){z.tropeca=Math.max(0,z.tropeca-dt);vv*=1-0.75*Math.sin(Math.PI*(1-z.tropeca/ZTROP));}
  else if(g.trop>0&&(z.st==='caca'||z.st==='marcha')&&v>0.5&&Math.random()<dt*g.trop/40)z.tropeca=ZTROP;
  let tx=dx*vv,tz=dz*vv;
  if(g.balanca>0.01&&vv>0.2){const s=Math.sin(z.ph*0.5+g.lado+(z.id||0))*g.balanca*vv;tx-=dz*s;tz+=dx*s;}
  if(!(G.t-(z.mvT??-9)<0.25)){z.mvx=0;z.mvz=0;}   // estava parado (ou golpeando): começa do zero
  z.mvT=G.t;
  const R=z.zona?Math.max(9,g.inercia):Math.hypot(P.x-z.x,P.z-z.z)<2.5?Math.max(7,g.inercia):g.inercia,k=1-Math.exp(-dt*R);
  z.mvx+=(tx-z.mvx)*k;z.mvz+=(tz-z.mvz)*k;
  const sp=Math.hypot(z.mvx,z.mvz);o[0]=z.mvx;o[1]=z.mvz;
  if(sp>0.05){o[2]=z.mvx/sp;o[3]=z.mvz/sp;}else{o[2]=dx;o[3]=dz;}o[4]=sp;return o;}
/* bateu na parede: tira a parte da velocidade que empurra contra ela (senão a inércia fica "colada") */
function zParede(z,x0,z0){if(z.mvx===undefined)return;const px=z.x-x0,pz=z.z-z0,pl=Math.hypot(px,pz);if(pl<1e-5)return;
  const nx=px/pl,nz=pz/pl,vn=z.mvx*nx+z.mvz*nz;if(vn<0){z.mvx-=vn*nx;z.mvz-=vn*nz;}}
/* inclinação para a frente andando e caçando (e no tropeço); nos outros estados volta ao normal */
const ZINC_MOVE=new Set(['vaga','caca','marcha','alerta','volta']),ZINC_NEUTRO=new Set(['golpe','grito','quebra','guarda','atordoado']);
function zInclinar(dt){const k=1-Math.exp(-dt*6);
  for(const z of Z){const ch=z.ch;if(!ch)continue;const S=ZS[z.tipo]||{};
    if(!z.vivo||S.cao||S.baixo||z.st==='lan'||z.lan){z.incl=0;continue;}
    const mov=ZINC_MOVE.has(z.st);
    if(!mov&&!ZINC_NEUTRO.has(z.st)){if(z.incl){z.incl=0;ch.pitch=0;}continue;}
    let alvo=0;if(mov&&G.t-(z.mvT??-9)<0.2){alvo=0.02+Math.hypot(z.mvx||0,z.mvz||0)*0.03;if(z.tropeca>0)alvo+=0.32*Math.sin(Math.PI*(1-z.tropeca/ZTROP));}
    const i0=z.incl||0;z.incl=i0+(alvo-i0)*k;
    if(alvo===0&&Math.abs(z.incl)<0.002){if(i0!==0)ch.pitch=0;z.incl=0;continue;}
    ch.pitch=z.incl;}}
{const _uz=updateZombies;updateZombies=function(dt){const r=_uz.apply(this,arguments);try{zInclinar(dt);}catch(e){console.error('zInclinar',e);}return r;};}

/* ---------- Ajustes > Jogo > Movimento ---------- */
{const ok=$('aj-ok');if(ok&&!$('aj-movimento')){const ref=$('aj-personagem-l');
  const h='<div class="opcao" id="aj-movimento-l"><span class="rot">Movimento</span><div class="segs" id="aj-movimento"><button type="button" data-v="realista">Realista (com peso)</button><button type="button" data-v="agil">Ágil (o de antes)</button></div></div>';
  if(ref)ref.insertAdjacentHTML('afterend',h);else ok.insertAdjacentHTML('beforebegin',h);}
 const el=$('aj-movimento');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;sfx('clique');cfg.movimento=b.dataset.v;saveCfg();movPesoAplicar();movMarcaAjuste();});}
function movMarcaAjuste(){const el=$('aj-movimento');if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===(cfg.movimento==='agil'?'agil':'realista'))));}
{const _a=ajustesUI;ajustesUI=function(){const r=_a.apply(this,arguments);try{movMarcaAjuste();}catch(e){}return r;};}

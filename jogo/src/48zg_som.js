/* ================= som ambiente por região, clima, hora e ameaça (Etapa 9) =================
   Tudo continua feito por código (os sons gravados entram na Etapa 24). O que já existia fica (vento, folhas, chuva, fogo,
   grilos, pássaros, coruja, sustos, trovão, coração e a música que reage ao perigo) e agora muda conforme o lugar:
   · mata: folhas, pássaros de dia, grilos e coruja à noite (como antes).
   · cidade: vento grave entre os prédios, chapa de metal batendo, cachorro latindo longe, alarme de carro e sirene bem de longe;
     quase sem pássaro e com menos grilo.
   · vila, fazenda e sítios: galo no amanhecer, cachorro longe, cigarras de dia no verão.
   · rio e lago: água correndo perto do rio, marolinha perto do lago, sapos à noite.
   · subsolo: grave constante, zumbido e gotas pingando com eco; sem vento, sem pássaro e a chuva bem abafada.
   · dentro de casa ou debaixo de telhado: a chuva vira tamborilar no telhado e o vento abafa.
   · clima: garoa e chuva com volume próprio, rajadas na tempestade e na ventania (com assobio), neve abafando tudo.
   · hora: coro de pássaros no amanhecer, cigarras no calor do dia (verão), sapos, grilos e coruja à noite; no inverno quase
     não tem inseto.
   · ameaça: quando um zumbi começa a te caçar, um acorde grave avisa; se ele está perto e fora da sua vista (atrás de você),
     uma pulsação baixa; bicho perigoso em alerta perto rosna. */
const SOM={beds:null,reg:{mata:1,cidade:0,rural:0,rio:0,lago:0,sub:0,dentro:0},regT:0,prox:{cidade:5,rural:7,sapo:3,sub:2,cigarra:2,rajada:6,coro:0},caca:new Set(),ameT:0,pulsoT:0,rosnaT:0};
function somFat(){return SOM.reg;}
/* como o som que já existia muda no lugar: subsolo sem vento, folhas e chuva; cidade com menos folha, grilo e pássaro;
   debaixo de teto a chuva abafa; na neve a chuva some; no inverno quase não tem grilo */
function somAjuste(){const r=SOM.reg,neve=typeof nevando==='function'&&nevando(),inv=typeof estacaoIdx==='function'&&estacaoIdx()===3;
  return{vento:(1-0.92*r.sub)*(1-0.35*r.dentro)*(1+0.6*climaK('ventania'))*(neve?0.7:1),folhas:(1-r.sub)*(0.2+0.8*(1-r.cidade)),chuva:(1-0.85*r.sub)*(1-0.5*r.dentro)*(neve?0:1),
    chuvaF:r.dentro?1100:2600,grilo:(1-r.sub)*(1-0.7*r.cidade)*(inv?0.25:1),passaro:r.sub?0:1-0.85*r.cidade,noite:r.sub?0:1};}
/* sons novos (por código) */
Object.assign(SONS,{
  chapa:({noise,tone,r})=>{noise(0.5,'bandpass',900*r(),500,6,0.22);tone(0.6,'triangle',180*r(),150,0.06);tone(0.5,'square',260*r(),240,0.02,0.02);},
  alarmeCarro:({tone})=>{for(let i=0;i<4;i++){tone(0.16,'square',880,880,0.05,i*0.36);tone(0.16,'square',660,660,0.05,i*0.36+0.18);}},
  sirene:({ctx,out,t})=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(500,t);for(let i=0;i<3;i++){o.frequency.linearRampToValueAtTime(900,t+0.9+i*1.8);o.frequency.linearRampToValueAtTime(500,t+1.8+i*1.8);}
    const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.05,t+0.6);g.gain.linearRampToValueAtTime(0.0001,t+5.6);o.connect(f).connect(g).connect(out);o.start(t);o.stop(t+5.7);},
  galo:({voz,r})=>{voz(0.18,520*r(),700,900,1800,0.12);voz(0.22,700,820,1000,2100,0.13,0.2);voz(0.55,820,560,950,1900,0.14,0.45);},
  cigarra:({ctx,out,t})=>{const o=ctx.createOscillator(),m=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='square';o.frequency.value=5200+Math.random()*900;m.frequency.value=58+Math.random()*20;mg.gain.value=0.5;
    f.type='bandpass';f.frequency.value=5600;f.Q.value=3;const a=ctx.createGain();a.gain.value=0.5;m.connect(mg).connect(a.gain);const d=2.2+Math.random()*2;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.02,t+0.5);g.gain.linearRampToValueAtTime(0.02,t+d);g.gain.linearRampToValueAtTime(0.0001,t+d+0.8);
    o.connect(f).connect(a).connect(g).connect(out);o.start(t);m.start(t);o.stop(t+d+0.9);m.stop(t+d+0.9);},
  sapo:({tone,noise,r})=>{const f=170*r();tone(0.12,'sawtooth',f,f*0.7,0.06);tone(0.12,'sawtooth',f*1.04,f*0.72,0.05,0.16);noise(0.1,'bandpass',600,400,3,0.03);},
  gota:({tone,eco,r})=>{tone(0.09,'sine',1400*r(),700,0.07);eco(0.7);},
  rangido:({voz,noise,r})=>{voz(1.4,62*r(),48,300,700,0.05);noise(1.2,'bandpass',420,260,8,0.03);},
  rajada:({ctx,out,t})=>{const s=ctx.createBufferSource();s.buffer=AU.ruido;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(900,t+1.2);f.frequency.linearRampToValueAtTime(260,t+2.8);f.Q.value=0.8;
    const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.16,t+1.0);g.gain.linearRampToValueAtTime(0.0001,t+3);s.connect(f).connect(g).connect(out);s.start(t,Math.random());s.stop(t+3.1);},
  ameaca:({tone})=>{tone(1.4,'sawtooth',73.4,69,0.06);tone(1.4,'sawtooth',77.8,74,0.05);tone(1.2,'sine',36.7,34,0.12);},
  pulso:({tone})=>{tone(0.22,'sine',52,38,0.14);}});
/* camadas contínuas novas: nascem junto com o som do jogo */
{const _ai=audioInit;audioInit=function(){_ai.apply(this,arguments);try{somCamadas();}catch(e){console.error('som ambiente',e);}};}
function somCamadas(){if(!AU.ctx||SOM.beds||!AU.ruido)return;const ctx=AU.ctx;
  const loop=(type,f,q)=>{const s=ctx.createBufferSource();s.buffer=AU.ruido;s.loop=true;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ctx.createGain();g.gain.value=0;
    s.connect(fl).connect(g).connect(AU.amb);s.start(0,Math.random()*1.5);return{g,fl};};
  SOM.beds={cidade:loop('lowpass',170,0.9),rio:loop('bandpass',950,0.6),lago:loop('bandpass',420,1.3),sub:loop('lowpass',85,2.5),telhado:loop('highpass',3300,0.6),assobio:loop('bandpass',1100,10)};
  const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=48;g.gain.value=0;o.connect(g).connect(AU.amb);o.start();SOM.beds.hum={g};}
/* onde você está (refeito duas vezes por segundo) */
function somRegiaoCalc(){const r=SOM.reg,x=P.x,z=P.z;r.sub=P.y<-20?1:0;
  const dc=typeof distCidade==='function'?distCidade(x,z):999;r.cidade=r.sub?0:clamp(1-dc/35,0,1);
  r.dentro=!r.sub&&((emPredios(x,z,2)&&interiorEm(x,P.y+0.3,z)>0.5)||(typeof abrigado==='function'&&abrigado()))?1:0;
  let rural=0;for(const p of PLACES){if(!(p.sitio||p.id==='vila'||p.id==='fazenda'))continue;const d=Math.hypot(x-p.x,z-p.z);rural=Math.max(rural,clamp(1-(d-(p.r||20))/30,0,1));}
  r.rural=r.sub?0:rural*(1-r.cidade);
  let lago=0,rio=0;if(!r.sub){if(typeof lagoR==='function'){const lr=lagoR(x,z);lago=clamp((1.7-lr)/0.6,0,1);}
    if(RIO.ok&&typeof aguaPerto==='function'){const a=aguaPerto(x,z,4)?1:aguaPerto(x,z,12)?0.55:aguaPerto(x,z,24)?0.2:0;rio=a*(1-lago);}}
  r.lago=lago;r.rio=rio;r.mata=r.sub?0:clamp((typeof mata==='function'?mata(x,z):1),0,1)*(1-r.cidade);}
/* ameaça por perto: acorde quando um zumbi começa a te caçar; pulsação se ele está perto e atrás; bicho perigoso rosna */
function somAmeaca(dt){if(!P.alive){SOM.caca.clear();return;}const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),agora=new Set();let atras=null,ad=1e9;
  for(const z of Z){if(!z.vivo||(z.st!=='caca'&&z.st!=='golpe'))continue;const d=Math.hypot(z.x-P.x,z.z-P.z);if(d>26||Math.abs(z.y-P.y)>4)continue;agora.add(z.id);
    const cv=((z.x-P.x)*fx+(z.z-P.z)*fz)/(d||1);if(d<9&&cv<-0.2&&d<ad){ad=d;atras=z;}}
  let novo=false;for(const id of agora)if(!SOM.caca.has(id))novo=true;SOM.caca=agora;
  SOM.ameT-=dt;if(novo&&SOM.ameT<=0){SOM.ameT=7;sfx('ameaca',undefined,undefined,0.9);}
  SOM.pulsoT-=dt;if(atras&&SOM.pulsoT<=0){SOM.pulsoT=lerp(0.55,1.1,ad/9);sfx('pulso',atras.x,atras.z,0.9);}
  SOM.rosnaT-=dt;if(SOM.rosnaT<=0&&typeof BICHOS!=='undefined'){SOM.rosnaT=2.5;for(const b of BICHOS){if(!b.vivo||!(b.alerta>0.6))continue;const S=typeof FAUNA!=='undefined'&&FAUNA[b.tipo];if(!S||!S.presas)continue;
    const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<16){sfx('rosnado',b.x,b.z,0.9);break;}}}}
/* por quadro: camadas novas e sons pontuais de cada lugar */
function somAmbiente(dt){if(!AU.ctx||!SOM.beds)return;const on=cfg.som?1:0,t=AU.ctx.currentTime,n=E.n||0,r=SOM.reg,B=SOM.beds,w=Math.hypot(E.wind[0],E.wind[1]),ch=smooth(0,1,G.chuva||0);
  SOM.regT-=dt;if(SOM.regT<=0){SOM.regT=0.5;somRegiaoCalc();}
  const vent=Math.max(climaK('ventania'),climaK('tempestade')),inv=typeof estacaoIdx==='function'?estacaoIdx():0,neve=typeof nevando==='function'&&nevando();
  B.cidade.g.gain.setTargetAtTime(on*0.07*r.cidade*(0.6+0.4*w)*(1-0.4*r.dentro),t,0.8);
  B.rio.g.gain.setTargetAtTime(on*0.055*r.rio,t,0.8);B.lago.g.gain.setTargetAtTime(on*0.03*r.lago*(0.6+0.4*w),t,0.8);
  B.sub.g.gain.setTargetAtTime(on*0.08*r.sub,t,0.8);B.hum.g.gain.setTargetAtTime(on*0.018*r.sub,t,0.8);
  B.telhado.g.gain.setTargetAtTime(on*0.05*r.dentro*ch,t,0.5);
  B.assobio.g.gain.setTargetAtTime(on*0.012*vent*(1-r.sub)*(1-0.6*r.dentro)*(neve?0.5:1),t,0.6);B.assobio.fl.frequency.setTargetAtTime(900+320*Math.sin(G.t*0.7),t,0.5);
  if(!on)return;const P0=SOM.prox,R=Math.random,longe=(a,b)=>{const ang=R()*6.283,d=a+R()*(b-a);return[P.x+Math.cos(ang)*d,P.z+Math.sin(ang)*d];};
  // cidade
  P0.cidade-=dt;if(P0.cidade<=0){P0.cidade=4+R()*9;if(r.cidade>0.4&&!r.sub){const q=R(),p=longe(14,40);
      if(q<0.4)sfx('chapa',p[0],p[1],0.7*(0.5+w*0.5));else if(q<0.7)sfx('latido',p[0],p[1],0.35);else if(q<0.85&&n<0.6)sfx('alarmeCarro',p[0],p[1],0.5);else if(q<0.92)sfx('sirene',undefined,undefined,0.25);}}
  // vila, fazenda e sítios: galo no amanhecer, cachorro, cigarras no verão
  P0.rural-=dt;if(P0.rural<=0){P0.rural=6+R()*10;if(r.rural>0.4){const h=G.hora,p=longe(18,40);if(h>5.2&&h<7.4)sfx('galo',p[0],p[1],0.8);else if(R()<0.4)sfx('latido',p[0],p[1],0.3);}}
  P0.cigarra-=dt;if(P0.cigarra<=0){P0.cigarra=3+R()*5;const T=typeof temperatura==='function'?temperatura():25;if(n<0.3&&ch<0.2&&!r.sub&&inv!==3&&T>24&&(r.mata>0.3||r.rural>0.3)){const p=longe(6,20);sfx('cigarra',p[0],p[1],0.8);}}
  // amanhecer: coro de pássaros
  P0.coro-=dt;if(P0.coro<=0){P0.coro=0.7+R()*1.2;const h=G.hora;if(h>5.4&&h<7.2&&ch<0.3&&!r.sub&&r.cidade<0.5&&inv!==3)sfx('passaro');}
  // rio e lago: sapos à noite
  P0.sapo-=dt;if(P0.sapo<=0){P0.sapo=1.5+R()*4;if(n>0.5&&(r.rio>0.3||r.lago>0.3)&&inv!==3&&!neve){const p=longe(4,14);sfx('sapo',p[0],p[1],0.7);}}
  // subsolo: gotas e rangidos
  P0.sub-=dt;if(P0.sub<=0){P0.sub=0.8+R()*3;if(r.sub){const p=longe(3,14);if(R()<0.8)sfx('gota',p[0],p[1],0.8);else sfx('rangido',p[0],p[1],0.7);}}
  // rajadas de vento na ventania e na tempestade
  P0.rajada-=dt;if(P0.rajada<=0){P0.rajada=5+R()*9;if(vent>0.4&&!r.sub)sfx('rajada',undefined,undefined,0.6*(r.dentro?0.5:1));}
  somAmeaca(dt);}
{const _aa=audioAmbiente;audioAmbiente=function(dt){_aa.apply(this,arguments);try{somAmbiente(dt||0.016);}catch(e){console.error('som ambiente',e);}};}

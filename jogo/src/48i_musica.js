/* ================= música dinâmica =================
   A trilha é tocada nota a nota e muda de camada conforme o que acontece:
   · calma de dia (acordes e dedilhado) e de noite (zumbido grave e sinos)
   · tensão: zumbi te procurando por perto → tambor e o andamento sobe
   · combate: zumbi em cima de você → baixo pulsando, caixa e chimbal, até 118 batidas
   · chefe: metais graves, tambores pesados e acordes menores
   · horda e lua de sangue: um coro grave por baixo de tudo
   · acampamento seguro de dia: arpejo quente
   · vírus avançado: acordes desafinando
   e pequenos temas: o amanhecer depois de uma noite, a chegada de um chefe e a morte. */
const ACORDES_CHEFE=[[45,48,52],[45,48,52],[41,45,48],[44,47,52],[45,48,52],[43,46,50],[41,44,48],[40,44,47]];
function musica(dt){const ctx=AU.ctx;if(!ctx||ctx.state!=='running'||!cfg.som||(cfg.musica??0.55)<=0.01)return;
  let perigo=0,combate=0;for(const z of Z){if(!z.vivo)continue;const d=Math.hypot(z.x-P.x,z.z-P.z);if(d>32)continue;
    if(z.st==='caca'||z.st==='golpe'||z.st==='grito'){perigo=Math.max(perigo,1-d/30);if(d<11)combate=Math.max(combate,1-d/13);}
    else if((z.st==='alerta'||z.st==='quebra')&&d<18)perigo=Math.max(perigo,0.35*(1-d/18));}
  const chefe=(G.modo==='jogo'||G.modo==='pausa')&&typeof chefeVivo==='function'&&chefeVivo()?1:0;
  let hordaN=0;if(G.noite)for(const z of Z)if(z.vivo&&z.noturno&&Math.hypot(z.x-P.x,z.z-P.z)<60)hordaN++;
  const horda=G.noite?clamp((G.luaSangue?0.45:0)+(G.final?0.3:0)+hordaN/10,0,1):0;
  const base=typeof sobBase==='function'&&sobBase(P.x,P.z,22)&&!G.noite&&perigo<0.1?1:0;
  const vir=typeof virusNivel==='function'?clamp((virusNivel()-30)/70,0,1):0;
  if(!P.alive){perigo=0;combate=0;}
  AU.tens=approach(AU.tens,clamp(perigo*1.3,0,1),dt*(perigo*1.3>AU.tens?0.9:0.12));
  AU.comb=approach(AU.comb||0,combate,dt*(combate>(AU.comb||0)?1.6:0.14));
  AU.boss=approach(AU.boss||0,chefe,dt*(chefe>(AU.boss||0)?0.9:0.1));
  AU.hord=approach(AU.hord||0,horda,dt*0.25);AU.camp=approach(AU.camp||0,base,dt*0.15);AU.vir=approach(AU.vir||0,vir,dt*0.08);
  // temas curtos nas viradas
  if(AU.noiteAnt===true&&!G.noite&&P.alive)temaAmanhecer(ctx.currentTime+0.1);AU.noiteAnt=G.noite;
  if(chefe&&!AU.chefeAnt)temaChefe(ctx.currentTime+0.05);AU.chefeAnt=chefe;
  if(AU.vivoAnt===true&&!P.alive)temaMorte(ctx.currentTime+0.05);AU.vivoAnt=P.alive;
  const bpm=AU.boss>0.5?104:lerp(lerp(70,98,AU.tens),118,AU.comb),oit=60/bpm/2;
  if(AU.prox<ctx.currentTime)AU.prox=ctx.currentTime+0.06;
  while(AU.prox<ctx.currentTime+0.3){agendar(AU.prox,AU.nota,E.n||0,oit);AU.prox+=oit;AU.nota++;}}
function agendar(t,i,noite,oit){const p=i%8,cp=Math.floor(i/8),boss=AU.boss||0,comb=AU.comb||0,hord=AU.hord||0,camp=AU.camp||0,vir=AU.vir||0,R=Math.random;
  const ac=boss>0.5?ACORDES_CHEFE[cp%8]:ACORDES[cp%8];
  // base de sempre (calma, noite, tensão), mais baixa quando o chefe ou o combate tomam conta
  agendarV7(t,i,noite,oit);
  if(camp>0.4&&AU.tens<0.2&&noite<0.5&&p%2===1&&R()<0.75)pluck(t,ac[(p>>1)%3]+12,0.035*camp);
  if(comb>0.15){baixo(t,ac[0]-12,oit*0.85,0.06*comb);if(p===2||p===6)caixa(t,0.16*comb);chimbal(t,(p%2?0.04:0.07)*comb);}
  if(boss>0.25){if(p===0||p===4)bronze(t,ac[0]-12,oit*(p===0?3:1.6),0.07*boss);if(p===0||p===3||p===4||p===6)tambor(t,0.32*boss,p===3);
    if(p===7&&R()<0.5)tambor(t,0.2*boss,true);if(p===0&&cp%2===0)coro(t,ac,oit*8,0.022*boss);}
  if(hord>0.3&&noite>0.4&&p===0&&boss<0.3)coro(t,ac,oit*8,0.03*hord);
  if(hord>0.55&&p===4&&R()<0.6)tambor(t,0.18*hord);
  if(vir>0.15&&p===0)desafino(t,ac,oit*8,0.02+0.03*vir);}
/* instrumentos novos */
function bronze(t,m,dur,v){const ctx=AU.ctx,f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(260,t);f.frequency.exponentialRampToValueAtTime(1600,t+0.08);f.frequency.exponentialRampToValueAtTime(520,t+dur);
  const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);f.connect(g);g.connect(AU.mus);g.connect(AU.revMus);
  for(const[k,det]of[[1,-6],[1,7],[2,0]]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=NOTA(m)*k;o.detune.value=det;o.connect(f);o.start(t);o.stop(t+dur+0.05);}}
function coro(t,ac,dur,v){const ctx=AU.ctx,g=voz2(t,dur,v);for(const m of ac){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=NOTA(m-12);o.detune.value=(Math.random()-0.5)*16;
    const vb=ctx.createOscillator(),vg=ctx.createGain();vb.frequency.value=4.5+Math.random();vg.gain.value=NOTA(m-12)*0.008;vb.connect(vg).connect(o.frequency);
    for(const[fq,q]of[[700,6],[1150,7]]){const b=ctx.createBiquadFilter();b.type='bandpass';b.frequency.value=fq;b.Q.value=q;o.connect(b).connect(g);}o.start(t);vb.start(t);o.stop(t+dur*1.1);vb.stop(t+dur*1.1);}}
function caixa(t,v){const ctx=AU.ctx,s=ctx.createBufferSource();s.buffer=AU.ruido;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=0.8;const g=ctx.createGain();
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.16);s.connect(f).connect(g).connect(AU.mus);s.start(t,Math.random());s.stop(t+0.2);
  const o=ctx.createOscillator(),og=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(140,t+0.08);og.gain.setValueAtTime(v*0.6,t);og.gain.exponentialRampToValueAtTime(0.0001,t+0.1);o.connect(og).connect(AU.mus);o.start(t);o.stop(t+0.12);}
function chimbal(t,v){const ctx=AU.ctx,s=ctx.createBufferSource();s.buffer=AU.ruido;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=7000;const g=ctx.createGain();
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.04);s.connect(f).connect(g).connect(AU.mus);s.start(t,Math.random());s.stop(t+0.06);}
function desafino(t,ac,dur,v){const ctx=AU.ctx,g=voz2(t,dur,v),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;f.connect(g);
  for(const m of[ac[0],ac[0]+1,ac[2]+6]){const o=ctx.createOscillator();o.type='triangle';o.frequency.setValueAtTime(NOTA(m),t);o.frequency.linearRampToValueAtTime(NOTA(m)*0.97,t+dur);o.connect(f);o.start(t);o.stop(t+dur*1.05);}}
/* temas curtos */
function temaAmanhecer(t){for(const[k,m]of[[0,60],[1,64],[2,67],[3,72],[4.5,76]])pluck(t+k*0.16,m,0.07);pad(t,[60,64,67],2.6,0.04);sino(t+0.75,84,0.035);}
function temaChefe(t){bronze(t,33,1.4,0.12);bronze(t+0.02,40,1.4,0.08);for(let k=0;k<6;k++)tambor(t+k*0.09,0.22+k*0.03,k%2===1);tambor(t+0.62,0.45);}
function temaMorte(t){for(const[k,m]of[[0,64],[1,63],[2,60],[3,57]])pluck(t+k*0.32,m,0.06,true);pad(t+0.2,[45,48,51],3.2,0.05);drone(t+0.3,3.4,0.05);}

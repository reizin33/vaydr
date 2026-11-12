/* ================= som: mixagem, efeitos, ambiente e música que reage ao perigo ================= */
const AU={ctx:null,master:null,fx:null,amb:null,mus:null,rev:null,revIn:null,ruido:null,vento:null,folhas:null,chuvaG:null,fogoR:null,grilos:[],
  prox:0,nota:0,tens:0,proxPassaro:2,proxCoruja:12,proxTrovao:20,proxCoracao:0,proxSusto:25};
function impulso(ctx,dur,dec){const n=Math.floor(ctx.sampleRate*dur),b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec);}return b;}
function audioInit(){if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();AU.ctx=ctx;
  /* saída (v10.1): corte do grave que só treme a caixa → menos agudo áspero → compressor que junta tudo → limitador que
     segura os picos (tiro, explosão, impacto) bem abaixo do máximo, para nada estourar no ouvido.
     O compressor do navegador sobe sozinho o volume de tudo ("makeup", medido: +7,7 dB neste ajuste e +3,4 dB no limitador);
     o ganho logo depois de cada um desconta isso, para o som baixo ficar no mesmo nível de antes (+2,9 dB) e só o alto descer */
  const lim=ctx.createDynamicsCompressor();lim.threshold.value=-6;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=0.001;lim.release.value=0.12;
  const limG=ctx.createGain();limG.gain.value=Math.pow(10,-3.42/20);lim.connect(limG).connect(ctx.destination);
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-24;comp.knee.value=10;comp.ratio.value=3;comp.attack.value=0.006;comp.release.value=0.25;
  const compG=ctx.createGain();compG.gain.value=Math.pow(10,-4.78/20);comp.connect(compG).connect(lim);
  const brilho=ctx.createBiquadFilter();brilho.type='highshelf';brilho.frequency.value=6000;brilho.gain.value=-6;brilho.connect(comp);
  const sub=ctx.createBiquadFilter();sub.type='highpass';sub.frequency.value=30;sub.Q.value=0.7;sub.connect(brilho);
  AU.master=ctx.createGain();AU.master.connect(sub);AU.saida=limG;
  AU.fx=ctx.createGain();AU.amb=ctx.createGain();AU.mus=ctx.createGain();for(const g of[AU.fx,AU.amb,AU.mus])g.connect(AU.master);
  AU.rev=ctx.createConvolver();AU.rev.buffer=impulso(ctx,2.8,2.4);const rg=ctx.createGain();rg.gain.value=0.42;
  const rl=ctx.createBiquadFilter();rl.type='lowpass';rl.frequency.value=3200;rl.Q.value=0.5;AU.rev.connect(rl).connect(rg).connect(AU.master);   // eco mais quente, sem chiado
  AU.revIn=ctx.createGain();AU.revIn.connect(AU.rev);AU.revMus=ctx.createGain();AU.revMus.gain.value=0.5;AU.revMus.connect(AU.rev);
  const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.ruido=b;
  const loop=(type,f,q)=>{const s=ctx.createBufferSource();s.buffer=b;s.loop=true;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ctx.createGain();g.gain.value=0;
    s.connect(fl).connect(g).connect(AU.amb);s.start(0,Math.random()*1.5);return{g,fl};};
  AU.vento=loop('lowpass',360,0.6);AU.folhas=loop('bandpass',2800,0.7);AU.chuvaG=loop('lowpass',2600,0.3);AU.fogoR=loop('lowpass',240,0.8);
  const grilo=(f,tr,gr)=>{const o=ctx.createOscillator();o.frequency.value=f;const a=ctx.createGain();a.gain.value=0.5;const l=ctx.createOscillator();l.type='square';l.frequency.value=tr;const lg=ctx.createGain();lg.gain.value=0.5;l.connect(lg).connect(a.gain);
    const bb2=ctx.createGain();bb2.gain.value=0.5;const l2=ctx.createOscillator();l2.type='square';l2.frequency.value=gr;const lg2=ctx.createGain();lg2.gain.value=0.5;l2.connect(lg2).connect(bb2.gain);
    const out=ctx.createGain();out.gain.value=0;o.connect(a).connect(bb2).connect(out).connect(AU.amb);o.start();l.start();l2.start();return out;};
  AU.grilos=[grilo(4300,29,1.3),grilo(3900,33,0.9),grilo(4700,26,1.7)];
  {const o=ctx.createOscillator(),o2=ctx.createOscillator(),fl=ctx.createBiquadFilter(),g=ctx.createGain();o.type='sawtooth';o2.type='square';fl.type='lowpass';fl.frequency.value=420;fl.Q.value=2;g.gain.value=0;
    o.connect(fl);o2.connect(fl);fl.connect(g).connect(AU.fx);o.start();o2.start();AU.motor={o,o2,fl,g};}
  audioVol();}catch(_){AU.ctx=null;}}
function audioVol(){if(!AU.master)return;const ef=cfg.efeitos??0.9,mu=cfg.musica??0.55;AU.master.gain.value=cfg.som?0.85:0;AU.fx.gain.value=ef;AU.amb.gain.value=ef*0.9;AU.mus.gain.value=mu*0.7;AU.revMus.gain.value=0.35*mu;}
/* nível de cada efeito (v10.1), medido no jogo com tools/p246_som.py: os mais altos (explosão, impacto, tiros, os temas de
   missão e de nível) desceram para perto do resto; o ambiente fica como estava */
const SOM_NIVEL={impacto:0.43,explosao:0.5,tiro:0.62,espingarda:0.62,rifle:0.78,missao:0.45,nivel:0.58,rugido:0.72,acerto:0.7,grito:0.72,gritoLonge:0.6,
  galho:0.6,pedra:0.75,fogo:0.8,quebrar:0.9,coracao:0.8,vidro:0.7,sussurro:0.85,alarme:0.7,buzina:0.75,apito:0.7,isca:0.8,latas:0.85};
function sfx(nome,x,z,vol,extra){const ctx=AU.ctx;if(!ctx||!cfg.som||ctx.state!=='running')return;let v=(vol===undefined?1:vol)*(SOM_NIVEL[nome]??1),pan=0,dist=0;
  if(x!==undefined){const dx=x-P.x,dz=z-P.z;dist=Math.hypot(dx,dz);v*=clamp(1-dist/48,0,1);if(v<0.02)return;const rx=-Math.cos(P.yaw),rz=Math.sin(P.yaw);pan=clamp((dx*rx+dz*rz)/(dist+1),-0.85,0.85);}
  const t=ctx.currentTime,out=ctx.createGain(),pn=ctx.createStereoPanner?ctx.createStereoPanner():null;out.gain.value=v;
  if(pn){pn.pan.value=pan;out.connect(pn).connect(AU.fx);}else out.connect(AU.fx);
  const eco=k=>{const s=ctx.createGain();s.gain.value=k;out.connect(s).connect(AU.revIn);};if(dist>12)eco(clamp(dist/40,0.15,0.6));
  const noise=(dur,type,f0,f1,q,g0,dl)=>{const t0=t+(dl||0),s=ctx.createBufferSource();s.buffer=AU.ruido;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f0,t0);fl.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t0+dur);fl.Q.value=q||1;
    const g=ctx.createGain();g.gain.setValueAtTime(g0,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);s.connect(fl).connect(g).connect(out);s.start(t0,Math.random()*1.5);s.stop(t0+dur+0.05);};
  const tone=(dur,type,f0,f1,g0,dl)=>{const o=ctx.createOscillator();o.type=type;const t0=t+(dl||0);o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(g0,t0+0.01);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);o.connect(g).connect(out);o.start(t0);o.stop(t0+dur+0.05);};
  /* voz: serra com vibrato passando por dois formantes (soa como gemido de garganta) */
  const voz=(dur,f0,f1,fa,fb,g0,dl,ruido)=>{const t0=t+(dl||0),o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0,t0);o.frequency.linearRampToValueAtTime(f1,t0+dur);
    const vb=ctx.createOscillator(),vg=ctx.createGain();vb.frequency.value=5+Math.random()*3;vg.gain.value=f0*0.04;vb.connect(vg).connect(o.frequency);
    const a=ctx.createBiquadFilter();a.type='bandpass';a.frequency.value=fa;a.Q.value=4;const b2=ctx.createBiquadFilter();b2.type='bandpass';b2.frequency.value=fb;b2.Q.value=5;
    const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(g0,t0+Math.min(0.15,dur*0.25));g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
    o.connect(a).connect(g);o.connect(b2).connect(g);g.connect(out);o.start(t0);vb.start(t0);o.stop(t0+dur+0.05);vb.stop(t0+dur+0.05);
    if(ruido)noise(dur*0.9,'bandpass',fa*1.4,fa,1.5,ruido,dl);};
  const r=()=>0.9+Math.random()*0.2;
  if(SGRAV.pronto&&cfg.somGravado!==false&&sgravTocar(nome,extra,out,t,ctx,eco,pn))return;   // gravação de verdade (45c); sem ela, o som por código abaixo
  switch(nome){
    case'tiro':noise(0.35,'lowpass',4200,260,0.7,1.3);tone(0.22,'sine',130,42,1.0);noise(0.9,'lowpass',900,120,0.6,0.22,0.12);eco(0.7);break;
    case'vazio':tone(0.04,'square',1400,900,0.12);break;
    case'arco':tone(0.2,'triangle',190*r(),95,0.4);tone(0.12,'sine',420*r(),180,0.18);noise(0.32,'bandpass',2400,500,1.6,0.32,0.02);break;
    case'puxar':noise(0.55,'bandpass',260*r(),520,7,0.16);tone(0.5,'triangle',70,95,0.05);break;
    case'flecha':noise(0.07,'bandpass',1100*r(),520,2,0.85);tone(0.09,'sine',230*r(),90,0.4);break;
    case'vidro':noise(0.4,'highpass',5200,2600,1,0.75);for(let i=0;i<6;i++)tone(0.07+Math.random()*0.06,'sine',2600+Math.random()*3400,2000+Math.random()*1500,0.09,i*0.025+Math.random()*0.02);break;
    case'fogo':noise(0.9,'lowpass',260,2000,0.7,0.85);noise(1.6,'bandpass',700*r(),180,0.8,0.35,0.15);tone(0.5,'sine',60,35,0.35);break;
    case'rugido':voz(2.3,62,40,280,640,0.95,0,0.32);voz(2.1,84,52,360,880,0.55,0.12,0.2);noise(2.2,'lowpass',420,70,0.8,0.45);eco(0.85);break;
    case'impacto':tone(0.7,'sine',72,24,1.5);noise(0.9,'lowpass',700,55,0.7,1.2);noise(0.3,'bandpass',1800,400,1,0.4,0.02);eco(0.8);break;
    case'golpe':noise(0.2,'bandpass',500*r(),2100*r(),1.4,0.3);break;
    case'acerto':tone(0.16,'sine',140*r(),48,0.85);noise(0.1,'bandpass',900*r(),400,1.2,0.6);noise(0.06,'highpass',2400,1800,1,0.12,0.02);break;
    case'madeira':noise(0.09,'bandpass',1500*r(),900,3,1.0);tone(0.1,'triangle',300*r(),170,0.3);noise(0.03,'highpass',3500,2500,1,0.3);break;
    case'pedra':noise(0.08,'highpass',2600,1800,2,0.6);tone(0.13,'sine',1800*r(),1500,0.18);break;
    case'gemido':{const ty=extra||'walker',k=ty==='colosso'?0.42:ty==='brute'?0.62:ty==='runner'?1.25:ty==='screamer'?1.4:1;const f=(78+Math.random()*30)*k;
      voz(0.9+Math.random()*0.6,f,f*0.72,520*k,1150*k,0.32,0,0.05);break;}
    case'ataqueZ':{const ty=extra||'walker',k=ty==='colosso'?0.4:ty==='brute'?0.6:ty==='runner'?1.2:1;voz(0.45,150*k,95*k,700*k,1500*k,0.45,0,0.12);break;}
    case'morteZ':{const k=extra==='colosso'?0.38:extra==='brute'?0.6:1;voz(1.1,110*k,50*k,450*k,900*k,0.4,0,0.1);noise(0.25,'lowpass',700,150,1,0.4,0.05);break;}
    case'grito':voz(1.4,330,560,1200,2600,0.5,0,0.2);voz(1.2,420,640,1500,3000,0.25,0.08);break;
    case'dor':voz(0.28,190*r(),120,750,1400,0.5,0,0.08);tone(0.14,'sine',120,60,0.5);break;
    case'pegar':tone(0.07,'sine',660,990,0.22);tone(0.09,'sine',990,1320,0.14,0.05);break;
    case'construir':noise(0.06,'bandpass',500,400,3,0.9);tone(0.06,'triangle',220,160,0.3);noise(0.06,'bandpass',520,420,3,0.8,0.14);tone(0.06,'triangle',230,170,0.25,0.14);break;
    case'quebrar':noise(0.55,'lowpass',1600,180,0.8,1);noise(0.12,'bandpass',1200,600,2,0.6,0.05);break;
    case'recarga':tone(0.03,'square',1800,1600,0.12);tone(0.03,'square',1200,1100,0.12,0.5);tone(0.04,'square',2000,1800,0.14,1.0);break;
    case'clique':tone(0.04,'sine',880,700,0.15);break;
    case'galho':noise(0.04,'bandpass',2400,1500,1,0.6);noise(0.22,'bandpass',800*r(),380,2.2,0.55,0.03);tone(0.07,'triangle',240,80,0.28,0.01);noise(0.08,'bandpass',2000,1600,1,0.25,0.16);break;
    case'sussurro':{for(let i=0;i<7;i++)noise(0.09+Math.random()*0.12,'bandpass',2200+Math.random()*2200,1600+Math.random()*900,7,0.16+Math.random()*0.1,i*0.11+Math.random()*0.05);eco(0.7);break;}
    case'gritoLonge':voz(1.7,540*r(),360,1100,2500,0.22,0,0.12);voz(1.2,610,420,1250,2700,0.1,0.25,0.05);eco(1);break;
    case'passosMata':{for(let i=0;i<5;i++)noise(0.08,'bandpass',600+Math.random()*500,300,1.2,0.45,i*(0.42+Math.random()*0.1));eco(0.5);break;}
    case'latido':{const n=extra||2;for(let i=0;i<n;i++){const dl=i*0.21+Math.random()*0.03;voz(0.13,640*r(),300,950,2300,0.6,dl,0.3);noise(0.06,'bandpass',1700,900,1.4,0.35,dl);}break;}
    case'ganido':voz(0.55,1150*r(),760,1500,3100,0.18,0,0.02);voz(0.4,1050,820,1500,3000,0.12,0.5,0.02);break;
    case'mordida':noise(0.07,'bandpass',1000*r(),500,2,0.6);tone(0.05,'square',190,90,0.12);if(Math.random()<0.5)voz(0.35,150,120,520,1150,0.22,0.02,0.25);break;
    case'bau':tone(0.32,'sawtooth',120*r(),72,0.05);noise(0.28,'bandpass',650,420,7,0.3);tone(0.07,'triangle',170,120,0.3,0.3);noise(0.06,'lowpass',500,200,1,0.5,0.3);break;
    case'passo':{const sup=extra||'grama';if(sup==='agua'){noise(0.2,'bandpass',800*r(),380,0.8,0.7);noise(0.12,'highpass',3200*r(),2200,1,0.3,0.04);noise(0.08,'bandpass',1500,900,2,0.25,0.12);}
      else if(sup==='asf')noise(0.07,'bandpass',1900*r(),900,1.2,0.5);else if(sup==='terra')noise(0.09,'bandpass',1200*r(),500,0.9,0.55);
      else{noise(0.11,'lowpass',1100*r(),300,0.7,0.55);noise(0.05,'highpass',3200,2400,1,0.12);}break;}
    case'estalo':noise(0.012+Math.random()*0.02,'bandpass',1800+Math.random()*2200,1500,0.9,0.9);if(Math.random()<0.15)tone(0.02,'square',300+Math.random()*400,200,0.12);break;
    case'passaro':{const n=2+Math.floor(Math.random()*4),f=2400+Math.random()*1800,pp=(Math.random()-0.5)*1.6;if(pn)pn.pan.value=pp;out.gain.value=0.05+Math.random()*0.05;
      for(let i=0;i<n;i++)tone(0.07+Math.random()*0.06,'sine',f*(0.9+Math.random()*0.25),f*(Math.random()<0.5?1.35:0.7),0.5,i*(0.11+Math.random()*0.05));break;}
    case'coruja':{if(pn)pn.pan.value=(Math.random()-0.5)*1.6;out.gain.value=0.11;eco(0.5);for(let i=0;i<3;i++)tone(i===1?0.22:0.42,'sine',i===1?410:390,i===1?400:360,0.5,i===0?0:i===1?0.55:0.85);break;}
    case'uivo':{if(pn)pn.pan.value=(Math.random()-0.5)*1.6;out.gain.value=0.07;eco(0.8);voz(2.6,240,330,800,1600,0.4,0,0);break;}
    case'trovao':{const dl=extra||1;noise(3.2,'lowpass',420,40,0.7,0.9,dl);noise(0.6,'lowpass',1600,200,0.6,0.4,dl);eco(0.9);break;}
    case'motor':noise(0.9,'lowpass',180,120,2,0.5);tone(0.9,'sawtooth',52*r(),48,0.12);tone(0.9,'square',104,96,0.04);break;
    case'tosse':for(let i=0;i<2;i++){const dl=i*0.32+Math.random()*0.05;noise(0.14,'bandpass',650*r(),420,1.6,0.75,dl);voz(0.13,190*r(),130,620,1300,0.32,dl,0.35);}break;
    case'elevador':noise(0.7,'bandpass',2600*r(),1300,7,0.45);tone(0.7,'sawtooth',330*r(),170,0.07);noise(0.25,'lowpass',900,200,1,0.8,0.55);tone(0.18,'sine',90,45,0.6,0.6);eco(0.6);break;
    case'entulho':noise(0.9,'lowpass',900,180,0.8,0.9);noise(0.15,'highpass',2600,2000,1,0.35,0.2);noise(0.15,'highpass',2400,1800,1,0.3,0.5);tone(0.2,'sine',70,40,0.5,0.1);break;
    case'apagar':noise(1.4,'highpass',2800,1600,0.7,0.55);noise(0.8,'bandpass',900,500,1,0.3,0.1);break;
    case'alarme':tone(0.45,'square',880,880,0.16);tone(0.45,'square',660,660,0.16,0.45);eco(0.5);break;
    case'latas':for(let i=0;i<9;i++){const dl=i*0.055+Math.random()*0.05,f=900+Math.random()*1700;tone(0.16+Math.random()*0.1,'triangle',f,f*0.92,0.07,dl);tone(0.09,'sine',f*2.7,f*2.5,0.025,dl);noise(0.03,'highpass',4000,3000,1,0.12,dl);}eco(0.35);break;
    case'espingarda':noise(0.5,'lowpass',2600,180,0.7,1.0);noise(0.09,'highpass',3500,1500,1,0.7);tone(0.4,'sine',95,38,0.4);tone(0.12,'square',170,60,0.12);eco(0.85);break;
    case'rifle':noise(0.06,'highpass',6000,3000,1,0.9);noise(0.55,'lowpass',2200,300,0.8,0.7,0.02);tone(0.25,'sine',140,50,0.3);eco(1);break;
    case'besta':noise(0.08,'bandpass',1800,900,3,0.5);tone(0.12,'triangle',420,180,0.2);tone(0.06,'square',1200,700,0.05);break;
    case'explosao':noise(1.6,'lowpass',1800,60,0.6,1.2);noise(0.25,'highpass',2500,1200,1,0.6);tone(1.2,'sine',70,28,0.6);tone(0.5,'sawtooth',55,30,0.2);eco(1);break;
    case'isca':tone(0.09,'square',2600,2600,0.08);tone(0.09,'square',2600,2600,0.08,0.13);tone(0.06,'triangle',5200,5100,0.03);break;
    case'gas':noise(0.7,'lowpass',900,260,0.8,0.55);noise(0.35,'bandpass',300,120,1.2,0.35,0.05);tone(0.5,'sine',70,40,0.12);break;
    case'apito':tone(0.38,'square',2900,2800,0.07);tone(0.38,'sine',2900,2850,0.11);tone(0.14,'square',2900,2850,0.07,0.5);tone(0.6,'sine',2950,2850,0.11,0.5);eco(0.6);break;
    case'berrante':tone(1.6,'sawtooth',110,104,0.1);tone(1.6,'square',220,210,0.03);tone(1.4,'sine',165,160,0.06,0.15);eco(0.8);break;
    case'capacete':tone(0.25,'triangle',2200,2050,0.12);tone(0.3,'sine',3300,3150,0.06);noise(0.05,'highpass',5000,4000,1,0.4);break;
    case'rosnado':voz(0.55,90,70,450,900,0.3,0,0.12);break;
    case'choque':noise(0.22,'bandpass',3600,1400,2,0.5);tone(0.24,'sawtooth',118,112,0.09);tone(0.24,'square',236,230,0.035);break;
    case'buzina':tone(0.55,'square',392,392,0.18);tone(0.55,'square',494,494,0.14);eco(0.4);break;
    case'morteBicho':voz(0.5,extra==='coelho'?600:260,extra==='coelho'?400:160,900,1800,0.3,0,0.05);break;
    case'fugaBicho':noise(0.25,'bandpass',extra==='coelho'?2400:900,500,1,0.35);if(extra==='cervo')voz(0.3,300,240,800,1600,0.12,0.05);break;
    case'coracao':tone(0.12,'sine',62,40,0.9);tone(0.12,'sine',58,38,0.6,0.22);break;
    case'nivel':for(const[i,f]of[[0,523],[1,659],[2,784],[3,1046]])tone(0.5,'triangle',f,f,0.22,i*0.09);eco(0.6);break;
    case'missao':for(const[i,f]of[[0,392],[1,523],[2,659]])tone(0.7,'sine',f,f,0.25,i*0.13);eco(0.6);break;
    case'horda':{const o=ctx.createOscillator(),o2=ctx.createOscillator(),fl=ctx.createBiquadFilter(),g=ctx.createGain();o.type='sawtooth';o2.type='sawtooth';o.frequency.value=55;o2.frequency.value=82.4;o2.detune.value=8;
      fl.type='lowpass';fl.frequency.setValueAtTime(200,t);fl.frequency.linearRampToValueAtTime(700,t+1.6);fl.frequency.linearRampToValueAtTime(150,t+3.6);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.5,t+1.2);g.gain.exponentialRampToValueAtTime(0.001,t+3.8);o.connect(fl);o2.connect(fl);fl.connect(g).connect(out);eco(0.9);o.start(t);o2.start(t);o.stop(t+4);o2.stop(t+4);break;}
    default:if(SONS[nome])SONS[nome]({noise,tone,voz,eco,r,extra,out,t,ctx,pn});
  }}
/* ambiente por quadro: vento, folhas, chuva, grilos, fogo, bichos, trovão, coração */
function audioAmbiente(dt){if(!AU.ctx||!AU.vento)return;dt=dt||0.016;const n=E.n||0,on=cfg.som?1:0,t=AU.ctx.currentTime,w=Math.hypot(E.wind[0],E.wind[1]);
  const sf=typeof somAjuste==='function'?somAjuste():{vento:1,folhas:1,chuva:1,chuvaF:2600,grilo:1,passaro:1,noite:1};   // região, teto e estação (48zg)
  AU.vento.g.gain.setTargetAtTime(on*lerp(0.035,0.125,n)*(0.55+0.45*w)*sf.vento,t,0.4);AU.vento.fl.frequency.setTargetAtTime(240+w*200,t,0.6);
  AU.folhas.g.gain.setTargetAtTime(on*0.016*w*(1-G.chuva*0.6)*sf.folhas,t,0.5);
  AU.chuvaG.g.gain.setTargetAtTime(on*0.22*smooth(0,1,G.chuva)*sf.chuva,t,0.6);AU.chuvaG.fl.frequency.setTargetAtTime(sf.chuvaF,t,0.5);
  const cr=on*smooth(0.5,0.9,n)*(1-G.chuva)*0.009*sf.grilo;for(const c of AU.grilos)c.gain.setTargetAtTime(cr,t,1.2);
  let fd=Math.hypot(P.x-FIRE[0],P.z-FIRE[2]);for(const f of FIRES)if(!f.lamp)fd=Math.min(fd,Math.hypot(P.x-f.x,P.z-f.z));const fk=clamp(1-fd/14,0,1);
  AU.fogoR.g.gain.setTargetAtTime(on*0.09*fk*fk,t,0.3);if(fk>0.05&&Math.random()<dt*16*fk)sfx('estalo',undefined,undefined,0.35*fk);
  AU.proxPassaro-=dt;if(AU.proxPassaro<=0){AU.proxPassaro=1.0+Math.random()*3.5;if(n<0.35&&G.chuva<0.3&&Math.random()<sf.passaro)sfx('passaro');}
  AU.proxCoruja-=dt;if(AU.proxCoruja<=0){AU.proxCoruja=16+Math.random()*28;if(n>0.7&&G.chuva<0.4&&sf.noite)sfx(Math.random()<0.7?'coruja':'uivo');}
  AU.proxSusto-=dt;if(AU.proxSusto<=0){AU.proxSusto=lerp(16,9,n)+Math.random()*20;if(n>0.45&&!CARRO.ativo){const r=Math.random(),a=Math.random()*6.283,dd=16+Math.random()*26,x=P.x+Math.cos(a)*dd,z=P.z+Math.sin(a)*dd;
    if(r<0.34)sfx('galho',x,z,0.95);else if(r<0.6)sfx('sussurro',x,z,0.9);else if(r<0.78)sfx('gritoLonge',x,z,1.4);else if(r<0.9)sfx('passosMata',x,z,1);else sfx('uivo');}}
  if(G.chuva>0.6){AU.proxTrovao-=dt;if(AU.proxTrovao<=0){AU.proxTrovao=14+Math.random()*30;G.raio=0.22;sfx('trovao',undefined,undefined,0.8,0.6+Math.random()*2);}}
  if(P.alive&&P.vida<30){AU.proxCoracao-=dt;if(AU.proxCoracao<=0){AU.proxCoracao=lerp(0.62,1.0,P.vida/30);sfx('coracao',undefined,undefined,0.7);}}
  if(AU.motor){const lig=CARRO.ativo&&CARRO.comb>0&&CARRO.hp>0&&cfg.som,sp=Math.abs(CARRO.v),th=Math.max(0,IN.mz||0);const f=30+sp*4.6+th*14;
    AU.motor.g.gain.setTargetAtTime(lig?0.05+sp*0.0035+th*0.02:0,t,0.12);AU.motor.o.frequency.setTargetAtTime(f,t,0.08);AU.motor.o2.frequency.setTargetAtTime(f*0.5,t,0.08);AU.motor.fl.frequency.setTargetAtTime(320+sp*40+th*300,t,0.1);}
  musica(dt);}
/* ---------- música: lá menor; dedilhado de dia, sinos e drone à noite, tambores quando há perigo perto ---------- */
const NOTA=m=>440*Math.pow(2,(m-69)/12);
const ACORDES=[[57,60,64],[53,57,60],[48,52,55],[55,59,62],[57,60,64],[52,55,59],[53,57,60],[52,56,59]];
function musicaV7(dt){const ctx=AU.ctx;if(!ctx||ctx.state!=='running'||!cfg.som||(cfg.musica??0.55)<=0.01)return;
  let perigo=0;for(const z of Z){if(!z.vivo)continue;if(z.st!=='caca'&&z.st!=='golpe'&&z.st!=='grito')continue;const d=Math.hypot(z.x-P.x,z.z-P.z);if(d<24)perigo=Math.max(perigo,1-d/28);}
  if(!P.alive)perigo=0;AU.tens=approach(AU.tens,clamp(perigo*1.3,0,1),dt*(perigo*1.3>AU.tens?0.9:0.12));
  const oit=60/lerp(70,98,AU.tens)/2;
  if(AU.prox<ctx.currentTime)AU.prox=ctx.currentTime+0.06;
  while(AU.prox<ctx.currentTime+0.3){agendar(AU.prox,AU.nota,E.n||0,oit);AU.prox+=oit;AU.nota++;}}
function agendarV7(t,i,noite,oit){const p=i%8,cp=Math.floor(i/8),ac=ACORDES[cp%8],ten=AU.tens,R=Math.random;
  if(p===0){if(noite<0.6)pad(t,ac,oit*8,0.045*(1-ten*0.7)*(1-noite*0.5));else drone(t,oit*8,0.05);baixo(t,ac[0]-24,oit*5,0.1*(1-ten*0.3));}
  if(noite<0.6&&ten<0.5&&R()<0.4*(1-noite))pluck(t,ac[Math.floor(R()*3)]+(R()<0.4?12:0),0.055);
  if(noite>=0.6&&ten<0.5&&p%4===2&&R()<0.28)sino(t,pick(R,[69,72,75,76,80]),0.03);   // uma oitava abaixo: sino mais quente, sem agudo que fura
  if(ten>0.08){if(p%2===0)tambor(t,0.24*ten);if(p===3||p===7)tambor(t,0.13*ten,true);
    if(ten>0.35)pluck(t,[57,60,64,63][p%4]-12+(cp%2?-2:0),0.06*ten,true);}}
function voz2(t,dur,g0){const ctx=AU.ctx,g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(g0,t+dur*0.35);g.gain.linearRampToValueAtTime(0.0001,t+dur*1.05);g.connect(AU.mus);g.connect(AU.revMus);return g;}
function pad(t,ac,dur,v){const ctx=AU.ctx,f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(650,t);f.frequency.linearRampToValueAtTime(1050,t+dur*0.5);f.frequency.linearRampToValueAtTime(600,t+dur);
  const g=voz2(t,dur,v);f.connect(g);for(const m of ac)for(const det of[-8,8]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=NOTA(m-12);o.detune.value=det;o.connect(f);o.start(t);o.stop(t+dur*1.1);}}
function drone(t,dur,v){const ctx=AU.ctx,f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(180,t);f.frequency.linearRampToValueAtTime(340,t+dur*0.5);f.frequency.linearRampToValueAtTime(170,t+dur);
  const g=voz2(t,dur,v);f.connect(g);for(const m of[33,40,45]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=NOTA(m);o.detune.value=(Math.random()-0.5)*14;o.connect(f);o.start(t);o.stop(t+dur*1.1);}}
function baixo(t,m,dur,v){const ctx=AU.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=NOTA(m);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(AU.mus);o.start(t);o.stop(t+dur+0.05);}
function pluck(t,m,v,duro){const ctx=AU.ctx,o=ctx.createOscillator(),o2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),g2=ctx.createGain();
  o.type='triangle';o2.type='sine';o.frequency.value=NOTA(m);o2.frequency.value=NOTA(m)*2.005;g2.gain.value=0.3;
  f.type='lowpass';f.frequency.setValueAtTime(duro?2200:3200,t);f.frequency.exponentialRampToValueAtTime(380,t+0.6);
  const L=duro?0.45:1.5;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+L);
  o.connect(f);o2.connect(g2).connect(f);f.connect(g);g.connect(AU.mus);g.connect(AU.revMus);o.start(t);o2.start(t);o.stop(t+L+0.05);o2.stop(t+L+0.05);}
function sino(t,m,v){const ctx=AU.ctx,g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+3.2);g.connect(AU.mus);g.connect(AU.revMus);
  for(const[k,a]of[[1,1],[2.76,0.3],[5.4,0.06]]){const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=NOTA(m)*k;og.gain.value=a;o.connect(og).connect(g);o.start(t);o.stop(t+3.3);}}
function tambor(t,v,leve){const ctx=AU.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(leve?140:95,t);o.frequency.exponentialRampToValueAtTime(leve?70:40,t+0.3);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+(leve?0.2:0.4));o.connect(g).connect(AU.mus);o.start(t);o.stop(t+0.45);
  const s=ctx.createBufferSource();s.buffer=AU.ruido;const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=leve?2400:900;const ng=ctx.createGain();ng.gain.setValueAtTime(v*0.5,t);ng.gain.exponentialRampToValueAtTime(0.0001,t+0.08);
  s.connect(fl).connect(ng).connect(AU.mus);s.start(t,Math.random());s.stop(t+0.1);}

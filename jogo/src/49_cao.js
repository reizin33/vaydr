/* ================= Caramelo: o cachorro companheiro ================= */
const CAO_ESPERA=[-3.2,-22];
const CAO={ativo:false,st:'espera',modo:'segue',x:CAO_ESPERA[0],z:CAO_ESPERA[1],y:0,yaw:0.4,hp:80,hpMax:80,ph:0,amp:0,t:0,alvo:null,latT:0,mordT:0,medoT:0,danoT:0,ganT:3,
  ficaX:0,ficaZ:0,ch:null,stuck:0,lastX:0,lastZ:0,desvio:0,desvioS:1,travado:0,paradoT:0,flash:0,scanT:0,feridoT:0,wag:1,hy:0,hp2:0};
function caoBones(){const H=0.28,L=0.62,bx=0.095,bz=0.22,ly=-H*0.3;
  return[{p:-1,o:[0,0.36+H*0.35,0]},{p:0,o:[0,H*0.3,L/2-0.05]},{p:0,o:[bx,ly,bz]},{p:0,o:[-bx,ly,bz]},{p:0,o:[bx,ly,-bz]},{p:0,o:[-bx,ly,-bz]},{p:0,o:[0,H*0.3,-L/2+0.03]}];}
function buildCao(){const g=new GB(2048,8),R=rng(207),car=lin(0xb06e30),car2=lin(0x8a5222),cre=lin(0xe2c9a0),pre=lin(0x141210),ver=lin(0xb3261e);
  const put=(b,t,m,col,o)=>add(g,t,m,col,Object.assign({b,j:0.05,rnd:R},o||{}));
  // corpo (osso 0): caramelo com peito e barriga claros
  put(0,bevelTris(0.26,0.28,0.62,0.08,{bx:0.92}),mat(0,0,0),car);
  put(0,bevelTris(0.2,0.07,0.44,0.03),mat(0,-0.12,0.02),cre);
  put(0,bevelTris(0.19,0.05,0.48,0.025),mat(0,0.135,-0.03),car2);
  put(0,bevelTris(0.21,0.22,0.12,0.05),mat(0,-0.01,0.29),cre,{j:0.03});
  // pescoço, cabeça e bandana vermelha (osso 1)
  put(1,bevelTris(0.14,0.2,0.15,0.04),mat(0,0.07,0.02,0.4,0,0),car);
  put(1,bevelTris(0.17,0.16,0.19,0.05,{tz:0.9}),mat(0,0.17,0.08),car);
  put(1,bevelTris(0.1,0.085,0.13,0.03),mat(0,0.135,0.21),cre);
  put(1,boxTris(0.045,0.032,0.03),mat(0,0.165,0.275),pre,{j:0});
  put(1,boxTris(0.034,0.012,0.06),mat(0,0.084,0.245,0.55,0,0),lin(0xd9606a),{j:0});
  for(const s of[1,-1]){put(1,boxTris(0.026,0.026,0.012),mat(s*0.05,0.2,0.172),pre,{j:0});
    put(1,cylTris(0,0.05,0.115,3,{phase:Math.PI/6}),mat(s*0.06,0.232,0.05,0.25,0,-s*0.32,1,1,0.55),car2);}
  put(1,bevelTris(0.2,0.05,0.2,0.02),mat(0,0.0,0.0,0.3,0,0),ver);
  put(1,cylTris(0,0.075,0.12,3,{phase:Math.PI/2}),mat(0,-0.02,0.1,Math.PI+0.35,0,0,1,1,0.4),ver);
  // pernas (2..5) com meias claras
  for(let i=0;i<4;i++){const b=2+i;put(b,cylTris(0.044,0.03,0.34,6),mat(0,-0.34,0),car);put(b,bevelTris(0.07,0.06,0.09,0.015),mat(0,-0.335,0.012),cre);}
  // rabo (6)
  put(6,cylTris(0.016,0.032,0.27,6),mat(0,0,0),car);put(6,cylTris(0.004,0.016,0.06,5),mat(0,0.27,0),cre);
  return{mesh:litMesh(g.data()),bones:caoBones()};}
/* poses: devolve o quanto o quadril desce */
function poseCao(o,modo,ph,amp,t,wag,hy,hp){o.fill(0);const s=Math.sin(ph);
  if(modo==='senta'){S3(o,0,-0.45,0,0);S3(o,1,0.42+hp,hy,Math.sin(t*0.7)*0.12);S3(o,2,0.45,0,0);S3(o,3,0.45,0,0);S3(o,4,-0.95,0,0.12);S3(o,5,-0.95,0,-0.12);S3(o,6,-1.9,Math.sin(t*9)*0.5*wag,0);return -0.13;}
  if(modo==='deita'){S3(o,1,0.18+hp,hy,0);S3(o,2,-1.45,0,0);S3(o,3,-1.45,0,0);S3(o,4,-1.35,0,0.2);S3(o,5,-1.35,0,-0.2);S3(o,6,-1.75,Math.sin(t*6)*0.3*wag,0);return -0.3;}
  if(modo==='ferido'){S3(o,1,0.3,0,0);S3(o,2,0.25,0,0);S3(o,3,-0.2,0,0);S3(o,4,0.3,0,0);S3(o,5,-0.25,0,0);S3(o,6,-2.4,0,0);return 0;}
  const corre=modo==='corre',k=amp*(corre?0.85:0.55);
  S3(o,0,Math.sin(ph*2)*0.05*amp+(modo==='morde'?0.12:0),0,0);
  S3(o,1,-0.05+Math.sin(ph*2)*0.07*amp+hp+(modo==='morde'?0.4*Math.max(0,Math.sin(t*13)):0),hy,0);
  if(corre){S3(o,2,-s*k,0,0);S3(o,3,-Math.sin(ph+0.45)*k,0,0);S3(o,4,Math.sin(ph+0.95)*k,0,0);S3(o,5,Math.sin(ph+1.35)*k,0,0);}
  else{S3(o,2,-s*k,0,0);S3(o,5,-s*k,0,0);S3(o,3,s*k,0,0);S3(o,4,s*k,0,0);}
  S3(o,6,modo==='morde'?-1.0:-0.55,Math.sin(t*(wag>0.5?13:5))*0.45*Math.max(wag,0.25),0);
  return 0;}
function caoInicio(){Object.assign(CAO,{ativo:false,st:'espera',modo:'segue',x:CAO_ESPERA[0],z:CAO_ESPERA[1],yaw:0.4,hp:CAO.hpMax,alvo:null,latT:0,mordT:0,medoT:0,danoT:0,ganT:3,feridoT:0,travado:0,desvio:0,flash:0});CAO.y=ground(CAO.x,CAO.z);}
function invComida(){for(let i=INV_N-1;i>=0;i--){const s=P.inv[i];if(s&&ITEMS[s.id].tipo==='comida')return s;}return null;}
function caoAtivoLivre(){return CAO.ativo&&CAO.st!=='ferido'&&CAO.st!=='descansa'&&CAO.st!=='carro';}
function coracoes(x,y,z){for(let i=0;i<7;i++)part(x+(Math.random()-0.5)*0.4,y+Math.random()*0.2,z+(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.4,0.7+Math.random()*0.5,(Math.random()-0.5)*0.4,1.3,0.055,[1,0.32,0.48,1],true,-0.3);}
function ferirCao(d){const c=CAO;if(!caoAtivoLivre())return;c.hp-=d*DIF[cfg.dif].dano*0.8;c.danoT=5;c.flash=0.15;sangue(c.x,c.y+0.45,c.z,4);sfx('ganido',c.x,c.z,0.7);
  if(c.hp<=0){c.hp=0;c.st='ferido';c.feridoT=0;c.alvo=null;toast('alerta','O Caramelo se machucou feio! Ele vai mancando para a clareira e amanhã está bom.');}
  else if(c.hp<c.hpMax*0.3&&c.st==='ataca'){c.st=c.modo;c.alvo=null;c.medoT=6;}}
function caoTeleporte(){const b=P.body;for(let k=0;k<10;k++){const a=b+Math.PI+(Math.random()-0.5)*1.4,r=5+Math.random()*4,x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;
    if(pontoLivre(x,z,0.5)){CAO.x=x;CAO.z=z;CAO.desvio=0;CAO.travado=0;return true;}}return false;}
function caoAmanhece(){const c=CAO;if(!c.ativo)return;if(c.st==='ferido'||c.st==='descansa'){c.hp=c.hpMax;c.st='fica';c.modo='fica';c.ficaX=c.x;c.ficaZ=c.z;
    setTimeout(()=>toast('corpo','O Caramelo melhorou e está te esperando na clareira. Chame ele com E.'),5200);}else c.hp=c.hpMax;}
function caoInter(){const c=CAO;
  if(c.st==='espera'){const s=invComida();return{t:s?'Dar comida ao cachorro':'Cachorro com fome',s:s?ITEMS[s.id].nome+' · ele vai te seguir':'precisa de comida: frutas servem'};}
  if(!c.ativo||c.st==='ferido'||c.st==='carro')return null;
  if(c.st==='descansa')return{t:'O Caramelo está se recuperando',s:'amanhã ele volta'};
  return(c.st==='fica'||(c.st==='ataca'&&c.modo==='fica'))?{t:'Chamar o Caramelo',s:'ele volta a te seguir'}:{t:'Mandar o Caramelo ficar aqui',s:'ele vigia este lugar'};}
function caoInteragir(){const c=CAO;
  if(c.st==='espera'){const s=invComida();if(!s){feed('Ele precisa de comida',true);sfx('ganido',c.x,c.z,0.6);return;}
    const nome=ITEMS[s.id].nome.toLowerCase();s.n--;if(s.n<=0)P.inv[P.inv.indexOf(s)]=null;hudBarra();invRender();
    c.ativo=true;c.st='segue';c.modo='segue';c.hp=c.hpMax;conquista('caramelo');c.latT=2;sfx('latido',c.x,c.z,0.9,2);ganharXP(25);coracoes(c.x,c.y+0.75,c.z);feed('Deu '+nome+' ao cachorro');
    toast('corpo','Ele comeu, abanou o rabo e resolveu te seguir. Esse é o Caramelo! Ele late quando tem zumbi perto e ajuda na briga. Agachado, ele fica quieto do seu lado.');
    setTimeout(()=>dica('caoFica','corpo','Perto do Caramelo, aperte E para mandar ele ficar vigiando um lugar, ou para chamar de volta.'),11000);return;}
  if(!caoAtivoLivre())return;
  if(c.st==='fica'||(c.st==='ataca'&&c.modo==='fica')){c.st='segue';c.modo='segue';c.alvo=null;feed('Caramelo: vem!');sfx('latido',c.x,c.z,0.6,1);coracoes(c.x,c.y+0.7,c.z);}
  else{c.st='fica';c.modo='fica';c.alvo=null;c.ficaX=c.x;c.ficaZ=c.z;feed('Caramelo: fica!');sfx('clique');}}
function updateCao(dt){const c=CAO,ch=c.ch;if(!ch)return;
  c.t+=dt;c.latT-=dt;c.mordT-=dt;c.medoT-=dt;c.danoT-=dt;c.flash=Math.max(0,c.flash-dt);ch.tint=c.flash>0?[2.2,1.3,1.3]:[1,1,1];
  const dxp=P.x-c.x,dzp=P.z-c.z,dp=Math.hypot(dxp,dzp),quieto=(P.agK||0)>0.5;
  let tx=null,tz=null,spd=0,modo='pe',olhaP=dp<12,wag=0.6,naCacamba=false;
  if(c.st!=='ferido'&&c.st!=='descansa'&&c.danoT<=0&&c.hp<c.hpMax)c.hp=Math.min(c.hpMax,c.hp+2.5*dt);
  // entrar e sair da caminhonete junto com o jogador
  if(CARRO.ativo&&VT().cacamba&&c.ativo&&(c.st==='segue'||(c.st==='ataca'&&c.modo==='segue'))&&dp<30){c.st='carro';c.alvo=null;sfx('latido',c.x,c.z,0.5,1);dica('caoCarro','corpo','O Caramelo pulou na caçamba. Ele desce quando você descer.');}
  if(c.st==='carro'&&!CARRO.ativo){const p=carroLocal(-1.7,0,-1.6);c.x=p[0];c.z=p[2];if(!pontoLivre(c.x,c.z,0.4))caoTeleporte();c.st='segue';c.modo='segue';}
  switch(c.st){
    case'espera':{modo=dp<10?'senta':'deita';wag=dp<10?1:0.2;c.ganT-=dt;
      if(c.ganT<=0){c.ganT=6+Math.random()*7;if(dp<45&&G.modo==='jogo')sfx(dp<14?'latido':'ganido',c.x,c.z,0.55,1);}
      if(dp<16&&P.alive&&G.modo==='jogo')dica('caoAchou','corpo','Um cachorro caramelo, magro e com fome, do lado de fora do portão. Dê qualquer comida para ele (frutas servem).');break;}
    case'descansa':modo='deita';wag=0.3;break;
    case'ferido':{c.feridoT+=dt;modo='ferido';olhaP=false;
      if(c.feridoT>3.5){modo='anda';tx=FIRE[0]+1.9;tz=FIRE[2]+1.3;spd=1.15;wag=0;if(d2(c.x,c.z,tx,tz)<1.2){c.st='descansa';tx=null;}}break;}
    case'carro':{const p=carroLocal(-0.42,1.0,-1.55);c.x=p[0];c.z=p[2];c.yaw=CARRO.yaw+0.35*Math.sin(c.t*0.45);modo='senta';olhaP=false;wag=0.8;naCacamba=true;
      ch.y=p[1];ch.pitch=CARRO.pitch||0;ch.roll=CARRO.roll||0;break;}
    default:{const base=c.st==='ataca'?c.modo:c.st,ax=base==='fica'?c.ficaX:P.x,az=base==='fica'?c.ficaZ:P.z;
      // procura zumbi para enfrentar
      if(!quieto&&c.medoT<=0&&c.st!=='ataca'&&P.alive){c.scanT-=dt;if(c.scanT<=0){c.scanT=0.3;let best=null,bd=1e9;
          for(const z of Z){if(!z.vivo)continue;const da=Math.hypot(z.x-ax,z.z-az);if(da>(base==='fica'?11:13))continue;
            if(!(z.st==='caca'||z.st==='golpe'||z.st==='quebra'||z.st==='grito'||z.st==='atordoado'||da<7))continue;const dc=d2(z.x,z.z,c.x,c.z);if(dc<bd){bd=dc;best=z;}}
          if(best){c.modo=base;c.st='ataca';c.alvo=best;if(c.latT<=0){c.latT=5;sfx('latido',c.x,c.z,0.9,2);barulho(c.x,c.z,7);}
            dica('caoBriga','corpo','O Caramelo parte para cima dos zumbis. Se ele se machucar feio, volta para a clareira e melhora no dia seguinte.');}}}
      // late avisando que tem zumbi vindo
      if(!quieto&&c.st!=='ataca'&&c.latT<=0&&P.alive)for(const z of Z){if(!z.vivo)continue;if(d2(z.x,z.z,P.x,P.z)<22*22&&(z.st==='caca'||z.st==='marcha'||z.st==='alerta')){c.latT=7;sfx('latido',c.x,c.z,0.8,2);barulho(c.x,c.z,6);break;}}
      if(c.st==='ataca'){const z=c.alvo;if(!z||!z.vivo||Math.hypot(z.x-ax,z.z-az)>20||quieto){c.st=c.modo;c.alvo=null;}
        else{const dz=Math.hypot(z.x-c.x,z.z-c.z),alc=0.62+ZS[z.tipo].r*(z.ch.s||1);modo='corre';tx=z.x;tz=z.z;spd=7.4;wag=0.3;olhaP=false;
          if(dz<alc+0.2){tx=null;modo='morde';c.yaw=angLerp(c.yaw,Math.atan2(z.x-c.x,z.z-c.z),1-Math.exp(-dt*10));
            if(c.mordT<=0){c.mordT=0.85;ferirZ(z,z.tipo==='brute'?9:12,(z.x-c.x)/(dz||1)*0.35,(z.z-c.z)/(dz||1)*0.35,0);sfx('mordida',c.x,c.z,0.7);}}}}
      if(c.st==='fica'){const df=Math.hypot(c.ficaX-c.x,c.ficaZ-c.z);if(df>0.7){tx=c.ficaX;tz=c.ficaZ;spd=df>5?6:2.6;modo=df>5?'corre':'anda';}else{modo=c.paradoT>1.2?'senta':'pe';}}
      else if(c.st==='segue'){const b=P.body,back=quieto?1.1:1.7,side=quieto?0.55:0.95,gx=P.x-Math.sin(b)*back+Math.cos(b)*side,gz=P.z-Math.cos(b)*back-Math.sin(b)*side,dg=Math.hypot(gx-c.x,gz-c.z);
        if(dp>45&&P.alive)caoTeleporte();
        if(dg<0.45||(dp<2.1&&dg<1.5)){modo=c.paradoT>1.5?'senta':'pe';wag=1;}
        else{tx=gx;tz=gz;const pv=Math.hypot(P.vx,P.vz);spd=dg>6?7.4:clamp(pv+dg*0.9,1.4,6.6);if(quieto)spd=Math.min(spd,2.1);modo=spd>4.4?'corre':'anda';wag=0.8;}}
      break;}}
  // movimento
  if(tx!==null&&spd>0){let dx=tx-c.x,dz=tz-c.z;const dd=Math.hypot(dx,dz);if(dd>0.05){dx/=dd;dz/=dd;
      if(c.desvio>0){c.desvio-=dt;const px=-dz*c.desvioS,pz=dx*c.desvioS;dx=dx*0.35+px;dz=dz*0.35+pz;}
      const v=Math.min(spd,dd/Math.max(dt,1e-3));const ox=c.x,oz=c.z;c.x+=dx*v*dt;c.z+=dz*v*dt;if(RIO.ok&&aguaProf(c.x,c.z)>0.75){c.x=ox;c.z=oz;}c.yaw=angLerp(c.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*9));
      collide(c,0.28,cc=>cc.solid&&!cc.portao);
      if(!dentroMapa(c.x,c.z,2)){const rr=Math.hypot(c.x,c.z),rm=raioMapaEm(c.x,c.z);if(rr>rm-2&&!dentroCidade(c.x,c.z)){c.x*=(rm-2)/rr;c.z*=(rm-2)/rr;}}
      c.stuck+=dt;if(c.stuck>1.2){const mv=Math.hypot(c.x-c.lastX,c.z-c.lastZ);if(mv<0.3*spd/2&&c.desvio<=0){c.desvio=0.9;c.desvioS=Math.random()<0.5?-1:1;c.travado++;}else c.travado=0;c.stuck=0;c.lastX=c.x;c.lastZ=c.z;}
      if(c.travado>=3&&c.st==='segue'&&dp>5){caoTeleporte();}
      c.amp=approach(c.amp,1,dt*5);c.ph+=dt*(modo==='corre'?13:8)*Math.min(1,v/2+0.3);c.paradoT=0;}}
  else{c.amp=approach(c.amp,0,dt*5);c.paradoT+=dt;if(modo==='pe'&&c.amp<0.05&&c.st==='segue'&&olhaP)c.yaw=angLerp(c.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*2));}
  // pose e posição
  if(!naCacamba){c.y=chaoEm(c.x,c.z,c.y??ground(c.x,c.z));ch.y=c.y+(modo==='ferido'?0.08:0);ch.pitch=0;ch.roll=lerp(ch.roll||0,modo==='ferido'?1.45:0,Math.min(1,dt*6));}
  ch.x=c.x;ch.z=c.z;ch.yaw=c.yaw;ch.vis=naCacamba||dp<100;
  if(ch.vis){let hy=0,hp=0;if(olhaP&&P.alive){hy=clamp(angDiff(c.yaw,Math.atan2(dxp,dzp)),-0.95,0.95);hp=dp<2.5?-0.25:0;}
    c.hy=lerp(c.hy,hy,Math.min(1,dt*5));c.hp2=lerp(c.hp2,hp,Math.min(1,dt*5));
    ch.hipY=poseCao(ch.r,modo,c.ph,modo==='pe'||modo==='senta'||modo==='deita'?c.amp:Math.max(c.amp,0.6),c.t,wag,c.hy,c.hp2);}}

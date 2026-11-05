/* ================= movimentos com as animações dos arquivos =================
   rolamento (esquiva): o mergulho com rolamento de "Running" — corra e aperte C; protege de golpes no meio do giro
   subir em muro/obstáculo: com algo de 0,75 a 2,75 m à frente (carro, contêiner, mureta, laje baixa), o pulo vira escalada
   chegada no topo das escadas/cipós: o corpo passa por cima da borda ("Climbing To Top")
   zumbis: caem e ficam deitados quando morrem, dormem deitados e levantam ("Zombie Stand Up"), saem da terra levantando */
const ROLA={t0:0.55,t1:2.05,vel:1.32,rot:-1.794,custo:12};
const MURO_CLIP={subirTopo:{t0:0.15,t1:3.6,vel:2.3},pendurado:{t0:0.1,t1:3.6,vel:2.0},chegada:{t0:2.0,t1:3.7,vel:1.7}};
const MURO={min:0.75,max:2.75};
/* ---------- rolamento ---------- */
function podeRolar(){return P.alive&&!CARRO.ativo&&!P.escala&&!P.rola&&!P.muro&&P.noChao&&(!P.acao||P.acao.tipo==='golpe'&&P.acao.t>P.acao.dur*0.6)&&P.energia>=ROLA.custo;}
function rolar(){if(!podeRolar()||pernaRuim())return false;
  const sp=Math.hypot(P.vx,P.vz),yaw=sp>0.6?Math.atan2(P.vx,P.vz):(Math.hypot(IN.mx,IN.mz)>0.15?P.yaw+Math.atan2(-IN.mx,IN.mz):P.body);
  P.acao=null;P.rola={t:0,dur:(ROLA.t1-ROLA.t0)/ROLA.vel,yaw,ult:skRaiz('rolar',ROLA.t0,ROLA.rot)};P.energia-=ROLA.custo;P.agachado=false;P.agK=0;
  if(P.ch.sk)skTocar(P.ch,'rolar',{ext:true,ini:ROLA.t0,peso:1,mix:16,rot:ROLA.rot,reinicia:true});
  sfx('passo',undefined,undefined,0.7,'terra');barulho(P.x,P.z,7,true,P.y);dica('rolar','corpo','Rolamento: correndo, aperte C (ou o botão de agachar) para mergulhar e rolar. No meio do giro os golpes não pegam.');return true;}
function updateRola(dt){const r=P.rola,ch=P.ch;r.t+=dt;const k=Math.min(1,r.t/r.dur),ct=ROLA.t0+(ROLA.t1-ROLA.t0)*k,q=skRaiz('rolar',ct,ROLA.rot),esc=ch.sk?ch.sk.t.hip/SKT.akai.hip:1;
  const dx=(q[0]-r.ult[0])*esc,dz=(q[2]-r.ult[2])*esc;r.ult=q;const c=Math.cos(r.yaw),s=Math.sin(r.yaw);
  const mx=c*dx+s*dz,mz=-s*dx+c*dz;P.x+=mx;P.z+=mz;P.vx=mx/Math.max(dt,1e-3);P.vz=mz/Math.max(dt,1e-3);
  collide(P,0.3,c=>!c.portao);fisicaVertical(dt);
  P.body=r.yaw;P.invul=k>0.08&&k<0.72?0.05:0;P.amp=0;
  if(ch.sk){ch.sk.ct=ct;ch.sk.ext=true;}
  ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;ch.pitch=0;animarJogador(dt);
  if(k>=1){P.rola=null;P.invul=0;if(ch.sk)skParar(ch,7);P.vx*=0.6;P.vz*=0.6;}}
/* ---------- subir em obstáculo ---------- */
function alvoMuro(){if(!P.alive||CARRO.ativo||P.escala||P.muro||P.rola||!P.noChao)return null;
  const mv=Math.hypot(IN.mx,IN.mz)>0.15,yaw=mv?P.yaw+Math.atan2(-IN.mx,IN.mz):P.body,fx=Math.sin(yaw),fz=Math.cos(yaw);
  for(const d of[0.5,0.7,0.9,1.1]){const x=P.x+fx*d,z=P.z+fz*d,h=chaoEm(x,z,P.y+MURO.max-0.55+0.01),dh=h-P.y;
    if(dh<MURO.min||dh>MURO.max)continue;
    // precisa ser uma borda (não uma ladeira): no meio do caminho o chão está bem mais baixo
    const hm=chaoEm(P.x+fx*Math.max(0.15,d-0.4),P.z+fz*Math.max(0.15,d-0.4),P.y+0.4);if(hm>h-0.45)continue;
    // espaço livre em cima para ficar de pé, sem teto baixo
    const xs=P.x+fx*(d+0.35),zs=P.z+fz*(d+0.35),hs=chaoEm(xs,zs,h+0.1);const yTop=Math.abs(hs-h)<0.25?hs:h,px=Math.abs(hs-h)<0.25?xs:x,pz=Math.abs(hs-h)<0.25?zs:z;
    if(bloqueadoAlto(px,pz,0.26,yTop+0.06))continue;
    if(emPredios(px,pz,2)){const teto=tetoEm(px,yTop+0.3,pz);if(teto!==null&&teto-yTop<1.75)continue;}
    return{x:px,z:pz,y:yTop,dh:yTop-P.y,yaw};}
  return null;}
function comecarMuro(a,nome){nome=nome||(a.dh>1.75?'pendurado':'subirTopo');const C=MURO_CLIP[nome],clip=nome==='chegada'?'subirTopo':nome;
  const r0=skRaiz(clip,C.t0,0),r1=skRaiz(clip,C.t1,0),sobe=Math.max(0.05,r1[1]-r0[1]),fr=Math.max(0.05,r1[2]-r0[2]);
  P.muro={t:0,dur:(C.t1-C.t0)/C.vel,clip,C,ini:[P.x,P.y,P.z],fim:[a.x,a.y,a.z],yaw:a.yaw,r0,sv:Math.max(0,a.y-P.y)/sobe,fr};
  P.acao=null;P.vx=P.vz=P.vy=0;P.agachado=false;P.agK=0;P.body=a.yaw;
  if(P.ch.sk)skTocar(P.ch,clip,{ext:true,ini:C.t0,peso:1,mix:14,reinicia:true});
  P.energia=Math.max(0,P.energia-(nome==='chegada'?0:6));sfx('passo',undefined,undefined,0.5,'terra');
  if(nome!=='chegada')dica('muro','corpo','Pulando de frente para um carro, contêiner, mureta ou laje baixa, você sobe nele. Zumbi não sobe atrás!');}
function updateMuro(dt){const m=P.muro,ch=P.ch;m.t+=dt;const k=Math.min(1,m.t/m.dur),ct=m.C.t0+(m.C.t1-m.C.t0)*k,r=skRaiz(m.clip,ct,0);
  const up=(r[1]-m.r0[1])*m.sv,fw=clamp((r[2]-m.r0[2])/m.fr,0,1);
  P.x=lerp(m.ini[0],m.fim[0],fw);P.z=lerp(m.ini[2],m.fim[2],fw);P.y=Math.min(m.fim[1],m.ini[1]+Math.max(0,up));P.vx=P.vz=P.vy=0;P.body=m.yaw;P.amp=0;
  if(ch.sk){ch.sk.ct=ct;ch.sk.ext=true;ch.sk.dyRaiz=-(r[1]-m.r0[1]);}
  ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;ch.pitch=0;animarJogador(dt);
  if(k>=1){P.x=m.fim[0];P.z=m.fim[2];P.y=m.fim[1];P.muro=null;P.noChao=true;P.vy=0;if(ch.sk){ch.sk.dyRaiz=0;skParar(ch,6);}P.travaAnda=0.12;}}
/* ---------- zumbis com o esqueleto novo ---------- */
function zSkMorto(z){const ch=z.ch;if(!ch.sk)return false;if(!z.skMorte){z.skMorte=1;skTocar(ch,'zLevantar',{ext:true,ini:0,peso:1,mix:2.4,rot:(z.id%3===0)?Math.PI:(z.id%3===1?0.6:-0.5),reinicia:true});}
  ch.sk.ct=0;ch.pitch=0;return true;}
function zSkDeitado(z){const ch=z.ch;if(!ch.sk)return false;skTocar(ch,'zLevantar',{ext:true,ini:0,peso:1,mix:5,rot:(z.id%2)?0.4:-0.4});ch.sk.ct=0;ch.pitch=0;return true;}
function zSkLevantar(z,k){const ch=z.ch;if(!ch.sk)return;skTocar(ch,'zLevantar',{ext:true,ini:0,peso:1,mix:12});ch.sk.ct=clamp(k,0,1)*3.0;ch.pitch=0;}

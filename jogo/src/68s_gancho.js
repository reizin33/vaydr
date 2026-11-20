/* ================= Gancho de escalada (v10.8.10) =================
   Himalaia (19/11/2026): "itens que se conectam, desafios, coisas para fazer"; direção do Dying Light sem copiar. Um item novo
   de movimento que liga a corda, a sucata e a fita: o Gancho de escalada, montado na bancada. Com ele na mão, mire numa
   beirada (laje, muro, telhado, contêiner, caixa-d'água) até 15 m de distância e até 12 m acima: a mira fica verde e a
   beirada brilha. Clique: o gancho voa, prende na beirada e a corda puxa você até lá em cima; no fim você passa o corpo por
   cima da borda. Zumbi não sobe atrás. Cada subida gasta o gancho (30 usos) e faz barulho. Na corrida não vale.
   Também entra no "Serve para" da corda, da sucata e da fita. */
const GANCHO={alcance:15,alto:12,vel:13,alvo:null,chk:0,hud:null,malha:null};
ITEMS.ganchoEscalada={nome:'Gancho de escalada',icon:'i-corda',max:1,tipo:'util',durMax:30,peso:1.1,
  desc:'Corda com um gancho de sucata na ponta. Com ele na mão, mire numa beirada até 15 m (laje, muro, telhado): a mira fica verde e a beirada brilha. Clique para o gancho prender e a corda puxar você lá para cima. Gasta um pouco a cada subida.'};
RECIPES.push({faz:'ganchoEscalada',n:1,custo:{corda:3,sucata:3,fita:1},cat:'ferramentas',etapa:2,est:1,desb:{item:'corda'}});
if(typeof LIGA_EXTRA!=='undefined')for(const k of['corda','sucata','fita']){(LIGA_EXTRA[k]=LIGA_EXTRA[k]||[]).push('gancho de escalada');}
function ganchoNaMao(){const s=selItem();return!!(s&&s.id==='ganchoEscalada');}
/* a beirada sob a mira: o raio da câmera bate numa parede (ou no alto dela); em cima tem chão livre para ficar de pé */
function ganchoAlvo(){if(!P.alive||CARRO.ativo||P.nada||P.escala||P.muro||P.gancho||P.bonde)return null;
  const o=cam.pos,d=cam.fwd,H=pontoMira(GANCHO.alcance+camDist+2),fh=Math.hypot(d[0],d[2]);if(fh<0.05)return null;const fx=d[0]/fh,fz=d[2]/fh;
  if(Math.hypot(H[0]-P.x,H[2]-P.z)>GANCHO.alcance)return null;
  /* o alto do que a mira acertou, um pouco para dentro */
  let top=null;for(const k of[0.3,0.55,0.8]){const qx=H[0]+fx*k,qz=H[2]+fz*k,y=chaoEm(qx,qz,H[1]+2.2);if(y<H[1]-0.9||y<P.y+1.0||y>P.y+GANCHO.alto)continue;
    if(bloqueadoAlto(qx,qz,0.26,y+0.06))continue;if(emPredios(qx,qz,2)){const t=tetoEm(qx,y+0.3,qz);if(t!==null&&t>y+0.05&&t-y<1.75)continue;}
    top={x:qx,z:qz,y};break;}
  if(!top)return null;
  /* a borda: voltando do alto na direção de quem mira, até o piso cair */
  let ex=H[0]-fx*0.05,ez=H[2]-fz*0.05;for(let s=0.1;s<=1.0;s+=0.1){const x=top.x-fx*s,z=top.z-fz*s;if(chaoEm(x,z,top.y+0.3)<top.y-0.6){ex=x+fx*0.05;ez=z+fz*0.05;break;}}   // sem queda perto (tábua, marquise): a borda fica onde a mira bateu
  /* onde fica de pé (meio metro para dentro da borda, se couber) e onde o corpo fica pendurado antes de passar por cima */
  let lx=ex+fx*0.5,lz=ez+fz*0.5,ly=chaoEm(lx,lz,top.y+0.3);if(Math.abs(ly-top.y)>0.3||bloqueadoAlto(lx,lz,0.26,ly+0.06)){lx=top.x;lz=top.z;ly=top.y;}
  const bx=ex-fx*0.42,bz=ez-fz*0.42,by=ly-1.25;if(by<P.y-0.3)return null;
  /* o caminho da corda até lá: sem parede no meio */
  const ox=P.x,oy=P.y+1.3,oz=P.z,L=Math.hypot(bx-ox,by-oy,bz-oz);for(let t=0.6;t<L-0.6;t+=0.45){const k=t/L,x=ox+(bx-ox)*k,y=oy+(by-oy)*k,z=oz+(bz-oz)*k;if(bloqueadoAlto(x,z,0.18,y-0.4))return null;}
  return{x:lx,z:lz,y:ly,ex,ey:ly,ez,bx,by,bz,yaw:Math.atan2(fx,fz),d:Math.hypot(ex-P.x,ez-P.z)};}
/* clicar com o gancho na mão */
function ganchoUsar(){P.cd=0.35;if(typeof CORR!=='undefined'&&CORR.ativa){feed('Na corrida o gancho não vale',true);sfx('vazio');return;}
  const a=ganchoAlvo();if(!a){feed('Mire numa beirada até 15 m (a mira fica verde)',true);sfx('vazio');dica('ganchoMira','corpo','Gancho de escalada: mire numa beirada (laje, muro, telhado) até 15 m. Quando a mira ficar verde, clique: a corda puxa você lá para cima.');return;}
  if(P.energia<6){feed('Sem energia',true);return;}
  const s=selItem();P.energia=Math.max(0,P.energia-6);P.acao=null;P.agachado=false;P.agK=0;
  const L=Math.hypot(a.bx-P.x,a.by-P.y,a.bz-P.z);P.gancho={t:-0.22,dur:Math.max(0.35,L/GANCHO.vel),a:[P.x,P.y,P.z],alvo:a};P.vx=P.vz=P.vy=0;
  sfx('arco');barulho(P.x,P.z,12,true,P.y);
  if(s){if(s.dur===undefined)s.dur=durMaxDe(s);s.dur=Math.max(0,s.dur-1);if(s.dur<=0){const i=P.inv.indexOf(s);if(i>=0)P.inv[i]=null;feed('O gancho de escalada quebrou',true);sfx('quebrar');if(typeof invRender==='function')invRender();}}}
{const _at=atacar;atacar=function(){if(ganchoNaMao()){ganchoUsar();return;}return _at.apply(this,arguments);};}
/* o puxão: primeiro o gancho voa (0,22 s), depois a corda leva o corpo até a borda e ele passa por cima ("chegada" da escalada) */
function ganchoPasso(dt){const g=P.gancho,a=g.alvo,ch=P.ch;g.t+=dt;P.vx=P.vz=P.vy=0;P.noChao=false;P.invul=Math.max(P.invul||0,0.08);
  if(g.t>=0){if(!g.puxou){g.puxou=true;sfx('estalo',a.ex,a.ez,0.8);sfx('puxar');}
    const k=Math.min(1,g.t/g.dur),e=k*k*(3-2*k),arc=Math.sin(Math.PI*k)*0.35;
    P.x=lerp(g.a[0],a.bx,e);P.y=lerp(g.a[1],a.by,e)+arc;P.z=lerp(g.a[2],a.bz,e);
    if(k>=1){P.gancho=null;P.x=a.bx;P.z=a.bz;P.y=a.by;comecarMuro({x:a.x,z:a.z,y:a.y,dh:a.y-a.by,yaw:a.yaw},'chegada');sfx('passo',undefined,undefined,0.5,'terra');return;}}
  P.body=a.yaw;if(ch.sk){if(!g.anim){g.anim=true;skTocar(ch,'pendurado',{ext:true,ini:0.6,peso:1,mix:10,reinicia:true});}ch.sk.ct=0.6;ch.sk.ext=true;}
  ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;ch.pitch=0;animarJogador(dt);}
{const _up=updatePlayer;updatePlayer=function(dt){if(P.gancho&&P.alive){try{ganchoPasso(dt);}catch(e){P.gancho=null;console.error('gancho',e);}P.cd-=dt;sobreviver(dt,false);return;}return _up.apply(this,arguments);};}
{const _rn=renascer;renascer=function(){P.gancho=null;return _rn.apply(this,arguments);};}
V8.novo.gancho=()=>{P.gancho=null;};V8.carregar.gancho=()=>{P.gancho=null;};
/* mira: o alvo é recalculado umas 8 vezes por segundo com o gancho na mão */
PASSOS.push(function ganchoMira(dt){if(G.modo!=='jogo'||!ganchoNaMao()||P.gancho){GANCHO.alvo=null;ganchoHud(null);return;}
  GANCHO.chk-=dt;if(GANCHO.chk<=0){GANCHO.chk=0.12;GANCHO.alvo=ganchoAlvo();}ganchoHud(GANCHO.alvo||false);});
function ganchoHud(a){let el=GANCHO.hud;if(a===null){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='gancho-hud';el.setAttribute('aria-live','off');
    el.style.cssText='position:fixed;left:50%;top:calc(50% + 26px);transform:translateX(-50%);z-index:29;padding:3px 10px;border-radius:10px;background:rgba(10,14,12,.55);font:600 13px/1.3 var(--f-ui,system-ui);pointer-events:none;white-space:nowrap';
    document.body.appendChild(el);GANCHO.hud=el;}
  el.hidden=false;if(a){el.style.color='#9be38a';el.textContent='Gancho: clique para subir · '+Math.round(a.d)+' m';}else{el.style.color='#c8c2b4';el.textContent='Gancho: mire numa beirada (até 15 m)';}}
/* com o gancho na mão a mira aparece (também na terceira pessoa) e fica verde quando pega uma beirada */
HUDS.push(function ganchoMiraHud(){const m=document.getElementById('mira');if(!m)return;const on=G.modo==='jogo'&&P.alive&&!CARRO.ativo&&ganchoNaMao()&&!P.gancho;
  if(!GANCHO.css){GANCHO.css=true;const st=document.createElement('style');st.textContent='#mira.gancho-ok{filter:drop-shadow(0 0 2px #6be06a) drop-shadow(0 0 5px #6be06a)}';document.head.appendChild(st);}
  if(on){m.classList.remove('escondido');if(G.dicas)dica('gancho','corpo','Gancho de escalada na mão: mire numa beirada até 15 m (laje, muro, telhado, contêiner). Quando a mira ficar verde, clique: a corda puxa você lá para cima. Zumbi não sobe atrás.');}m.classList.toggle('gancho-ok',on&&!!GANCHO.alvo);});
/* a beirada que a mira pega brilha; no voo e no puxão, a corda vai da mão até o gancho */
DESENHO.aditivo.push(function ganchoBrilho(){const a=GANCHO.alvo;if(a&&!P.gancho){const p=0.75+0.25*Math.sin((G.t||0)*7);bb(a.ex,a.ey+0.05,a.ez,0.32,0.6,1,0.55,0.55*p);bb(a.ex,a.ey+0.05,a.ez,0.12,0.9,1,0.85,0.8*p);}});
etapaMalha('fim','gancho',1,()=>{try{const g=new GB(256,8);add(g,boxTris(0.022,0.022,1),mat(0,0,0.5),lin(0x8a7350));
    GANCHO.malha=litMesh(g.data());const h=new GB(512,8);for(const s of[-1,1])add(h,boxTris(0.03,0.03,0.2),mat(s*0.06,0,0.05,0,s*0.7,0),lin(0x5a5e62));add(h,boxTris(0.035,0.035,0.16),mat(0,0,-0.06),lin(0x5a5e62));GANCHO.ponta=litMesh(h.data());}catch(e){GANCHO.malha=null;}});
DESENHO.opaco.push(function ganchoCorda(Pg){const g=P.gancho;if(!g||!GANCHO.malha)return;const a=g.alvo;
  const A=typeof maoPos==='function'?maoPos():[P.x,P.y+1.5,P.z],k=g.t<0?clamp((g.t+0.22)/0.22,0,1):1,B=[lerp(A[0],a.ex,k),lerp(A[1],a.ey+0.05,k),lerp(A[2],a.ez,k)];
  const N=6,sag=g.t<0?0.25*k:0;for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,p=t=>[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-sag*4*t*(1-t),A[2]+(B[2]-A[2])*t],q0=p(t0),q1=p(t1),dx=q1[0]-q0[0],dy=q1[1]-q0[1],dz=q1[2]-q0[2],l=Math.hypot(dx,dy,dz);
    if(l<1e-4)continue;drawStat(Pg,GANCHO.malha,mat(q0[0],q0[1],q0[2],-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,1,1,l));}
  if(GANCHO.ponta){const dx=B[0]-A[0],dz=B[2]-A[2];drawStat(Pg,GANCHO.ponta,mat(B[0],B[1],B[2],0,Math.atan2(dx,dz),0));}});

/* ================= efeitos de sangue e de impacto =================
   sangue: jato na direção do golpe, névoa no tiro forte, gotas que caem e respingam no chão, respingo comprido
     atrás de quem leva tiro, poça que cresce debaixo de quem morre e feridas que ficam marcadas no corpo dos zumbis.
   quando você apanha: sangue na tela que escorre e some, solavanco e giro da câmera para longe do golpe,
     o corpo cambaleia e é empurrado, baque surdo; com pouca vida a tela perde a cor.
   vírus: veias escuras nas bordas da tela que pulsam, cor sumindo e apagões perto do fim. */
/* ---------- malhas de respingo (deitadas no chão; a cor vem na hora de desenhar) ---------- */
let SPLAT=null;
function splatMesh(R,tipo){const g=new GB(2048,7),N=tipo==='poca'?30:tipo==='gota'?14:40;
  const f1=R()*6.28,f2=R()*6.28,f3=R()*6.28,sp=[];
  if(tipo==='mancha')for(let i=0;i<5+Math.floor(R()*5);i++)sp.push({a:R()*6.28,l:0.3+R()*0.9,w:0.06+R()*0.1});
  if(tipo==='gota')for(let i=0;i<2;i++)sp.push({a:R()*6.28,l:0.2+R()*0.4,w:0.25});
  const amp=tipo==='poca'?[0.12,0.07,0.03]:tipo==='gota'?[0.1,0.06,0.04]:[0.16,0.1,0.06];
  const rr=th=>{let r=1+amp[0]*Math.sin(3*th+f1)+amp[1]*Math.sin(5*th+f2)+amp[2]*Math.sin(9*th+f3);for(const s of sp){const d=Math.abs(angDiff(th,s.a));if(d<s.w)r+=s.l*(1-d/s.w)*(1-d/s.w);}return r;};
  const P=[];for(let i=0;i<=N;i++){const t=i/N*6.283;P.push([Math.cos(t)*rr(t),Math.sin(t)*rr(t)]);}
  for(let i=0;i<N;i++){const a=P[i],b=P[i+1];
    g.v7(0,0,0,1,1,1,1);g.v7(b[0],0,b[1],1,1,1,0.96);g.v7(a[0],0,a[1],1,1,1,0.96);
    const k=1.07;g.v7(a[0],0,a[1],1,1,1,0.96);g.v7(b[0],0,b[1],1,1,1,0.96);g.v7(b[0]*k,0,b[1]*k,1,1,1,0);
    g.v7(a[0],0,a[1],1,1,1,0.96);g.v7(b[0]*k,0,b[1]*k,1,1,1,0);g.v7(a[0]*k,0,a[1]*k,1,1,1,0);}
  const disco=(cx,cz,r)=>{const n=8;for(let i=0;i<n;i++){const a0=i/n*6.283,a1=(i+1)/n*6.283;g.v7(cx,0,cz,1,1,1,1);g.v7(cx+Math.cos(a1)*r,0,cz+Math.sin(a1)*r,1,1,1,0.85);g.v7(cx+Math.cos(a0)*r,0,cz+Math.sin(a0)*r,1,1,1,0.85);}};
  if(tipo==='mancha'){const n=6+Math.floor(R()*7);for(let i=0;i<n;i++){const a=R()*6.28,d=1.25+R()*1.3;disco(Math.cos(a)*d,Math.sin(a)*d,0.04+R()*0.12);}
    for(const s of sp)if(s.l>0.7)disco(Math.cos(s.a)*(1+s.l+0.25),Math.sin(s.a)*(1+s.l+0.25),0.08+R()*0.06);}
  if(tipo==='gota'){for(let i=0;i<2;i++){const a=R()*6.28,d=1.4+R()*0.8;disco(Math.cos(a)*d,Math.sin(a)*d,0.12+R()*0.12);}}
  return unMesh(g.data());}
function efeitosMeshes(){const R=rng(4242);SPLAT={mancha:[0,1,2,3].map(()=>splatMesh(R,'mancha')),gota:[0,1,2].map(()=>splatMesh(R,'gota')),poca:[0,1].map(()=>splatMesh(R,'poca'))};}
/* ---------- manchas no chão ---------- */
let manchaK=0;
function addMancha(o){if(MANCHAS.length>=140){let i=MANCHAS.findIndex(m=>m.tipo==='gota');if(i<0)i=0;MANCHAS.splice(i,1);}o.k=(manchaK=(manchaK+1)%40);MANCHAS.push(o);return o;}
function gotaChao(x,y,z,r){return addMancha({x,y,z,r:r||0.06,rot:Math.random()*6.28,t:0,s:Math.random(),tipo:'gota',v:Math.floor(Math.random()*3)});}
function poca(x,y,z,r){const g=chaoEm(x,z,y+0.4);return addMancha({x,y:g,z,r,rot:Math.random()*6.28,t:0,s:Math.random(),tipo:'poca',v:Math.floor(Math.random()*2),cresce:4});}
function jatoChao(x,y,z,r,ang){const g=chaoEm(x,z,y+0.6);return addMancha({x,y:g,z,r,rot:-ang+Math.PI/2,t:0,s:Math.random(),tipo:'mancha',v:Math.floor(Math.random()*4),sx:1.7});}
function desenharManchas(){if(!SPLAT)return;const n=E.n||0,luz=lerp(1,0.32,n);let malha=null;
  for(const m of MANCHAS){if(d2(m.x,m.z,cam.pos[0],cam.pos[2])>45*45)continue;const tipo=m.tipo||'mancha',vida=tipo==='gota'?60:150;
    const fa=Math.min(1,m.t*10)*Math.min(1,(vida-m.t)/25);if(fa<=0)continue;const sec=Math.min(1,m.t/50),L=SPLAT[tipo]||SPLAT.mancha,me=L[(m.v||0)%L.length];
    if(me!==malha){gl.bindVertexArray(me.vao);malha=me;}
    let r=m.r;if(tipo==='poca')r*=Math.sqrt(Math.min(1,m.t/(m.cresce||3)));const sx=m.sx||1,h=m.y+0.02+(m.k||0)*0.0006;
    if(m.q)gl.uniform4f(PU.u.uTint,0.022,0.018,0.015,0.85*fa);
    else gl.uniform4f(PU.u.uTint,lerp(0.155,0.042,sec)*luz,lerp(0.007,0.004,sec)*luz,lerp(0.006,0.003,sec)*luz,(tipo==='gota'?0.9:0.94)*fa);
    trs(TMP,m.x,h,m.z,0,m.rot,0,r*sx,1,r);gl.uniformMatrix4fv(PU.u.uModel,false,TMP);gl.drawArrays(gl.TRIANGLES,0,me.count);
    if(!m.q&&tipo!=='gota'){gl.uniform4f(PU.u.uTint,lerp(0.06,0.02,sec)*luz,0.003*luz,0.003*luz,0.65*fa);trs(TMP,m.x,h+0.0015,m.z,0,m.rot+0.5,0,r*0.5*sx,1,r*0.5);
      gl.uniformMatrix4fv(PU.u.uModel,false,TMP);gl.drawArrays(gl.TRIANGLES,0,me.count);}}
  gl.bindVertexArray(DISC.vao);}
/* ---------- partículas de sangue ---------- */
function pp(o){if(PART.length>420)PART.shift();PART.push(o);}
function sangue2(x,y,z,n,dir,forte){const dx=dir?dir[0]:0,dy=dir?dir[1]:0,dz=dir?dir[2]:0,f=forte?1.45:1;
  for(let i=0;i<n;i++){const sp=(1+Math.random()*2.4)*f,c=0.15+Math.random()*0.14;
    pp({x,y,z,vx:dx*sp*1.4+(Math.random()-0.5)*2.2,vy:Math.random()*2.3+dy*sp*0.4,vz:dz*sp*1.4+(Math.random()-0.5)*2.2,l:0,L:0.55+Math.random()*0.5,s:0.022+Math.random()*0.045,c:[c,0.012,0.01,0.97],add:false,g:9.8,gota:Math.random()<0.55});}
  const nm=forte?4:2;for(let i=0;i<nm;i++)pp({x:x+(Math.random()-0.5)*0.12,y:y+(Math.random()-0.5)*0.12,z:z+(Math.random()-0.5)*0.12,vx:dx*0.9+(Math.random()-0.5)*0.5,vy:0.15+Math.random()*0.35,vz:dz*0.9+(Math.random()-0.5)*0.5,
    l:0,L:0.3+Math.random()*0.25,s:(0.08+Math.random()*0.07)*f,c:[0.27,0.015,0.015,0.32],add:false,g:0.6});
  if(forte)for(let i=0;i<5;i++)pp({x,y,z,vx:dx*3+(Math.random()-0.5)*3,vy:1+Math.random()*2.5,vz:dz*3+(Math.random()-0.5)*3,l:0,L:0.9,s:0.03+Math.random()*0.02,c:[0.16,0.02,0.02,1],add:false,g:9.8,gota:true});}
/* gota que bate no chão vira respingo (chamado pelo movimento das partículas) */
function gotaPousou(p){gotaChao(p.x,p.y,p.z,0.03+p.s*1.5);}
/* ---------- feridas no corpo dos zumbis (presas no osso do peito ou da cabeça) ---------- */
function marcarFerida(z,p,head){if(!z||!z.ch||!z.ch.m)return;const b=head?2:1,m=z.ch.m.subarray(b*16,b*16+16),tx=p[0]-m[12],ty=p[1]-m[13],tz=p[2]-m[14];
  const s2=m[0]*m[0]+m[1]*m[1]+m[2]*m[2]||1;let lx=(m[0]*tx+m[1]*ty+m[2]*tz)/s2,ly=(m[4]*tx+m[5]*ty+m[6]*tz)/s2,lz=(m[8]*tx+m[9]*ty+m[10]*tz)/s2;
  const cy=head?0.15:0.18,dl=Math.hypot(lx,ly-cy,lz)||1,lim=head?0.16:0.3;if(dl>lim){const k=lim/dl;lx*=k;ly=cy+(ly-cy)*k;lz*=k;}
  const k2=1+0.05/Math.max(0.05,Math.hypot(lx,ly-cy,lz));const f={b,o:[lx*k2,cy+(ly-cy)*k2,lz*k2],s:head?0.05:0.06+Math.random()*0.03};
  (z.feridas=z.feridas||[]).push(f);if(z.feridas.length>7)z.feridas.shift();}
function bbFeridas(){const luz=lerp(1,0.4,E.n||0);for(const z of Z){if(!z.feridas||!z.ch.vis||z.st==='sumindo')continue;if(d2(z.x,z.z,cam.pos[0],cam.pos[2])>28*28)continue;const sc=z.ch.s||1;
  for(const f of z.feridas){const p=xf(z.ch.m.subarray(f.b*16,f.b*16+16),f.o[0],f.o[1],f.o[2]);bb(p[0],p[1],p[2],f.s*sc,0.17*luz,0.008*luz,0.006*luz,0.95);}}}
/* ---------- quando você apanha ---------- */
let SPLAT_SVG=null;
function splatSVG(R){const N=48,pts=[],f=[R()*6,R()*6,R()*6];let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">';
  for(let i=0;i<N;i++){const a=i/N*6.283;let r=40+6*Math.sin(2*a+f[0])+4*Math.sin(5*a+f[1])+2.5*Math.sin(11*a+f[2]);if(R()<0.16)r+=5+R()*12;pts.push([100+Math.cos(a)*r,96+Math.sin(a)*r*0.92]);}
  let d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);for(let i=1;i<=N;i++){const a=pts[i%N],b=pts[(i+1)%N];d+=' Q'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' '+((a[0]+b[0])/2).toFixed(1)+' '+((a[1]+b[1])/2).toFixed(1);}
  s+='<defs><radialGradient id="g" cx="48%" cy="44%" r="58%"><stop offset="0" stop-color="#3a0303" stop-opacity=".95"/><stop offset=".55" stop-color="#5c0606" stop-opacity=".9"/><stop offset=".85" stop-color="#6e0a08" stop-opacity=".72"/><stop offset="1" stop-color="#7a0d0a" stop-opacity=".35"/></radialGradient></defs>';
  s+='<path d="'+d+'" fill="url(#g)"/>';
  // gotas que voaram: elipses alongadas apontando para fora, e respingos miúdos
  for(let i=0;i<12;i++){const a=R()*6.283,r=52+R()*40,w=1.5+R()*4.5,l=w*(1.4+R()*2.2),x=100+Math.cos(a)*r,y=96+Math.sin(a)*r*0.92;
    s+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="'+l.toFixed(1)+'" ry="'+w.toFixed(1)+'" transform="rotate('+(a*57.3).toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="#5a0606" fill-opacity="'+(0.6+R()*0.3).toFixed(2)+'"/>';}
  // escorridos: filete que afina e termina numa gota
  for(let i=0;i<2+Math.floor(R()*3);i++){const x=70+R()*60,y0=110+R()*22,y1=y0+50+R()*100,w=2.5+R()*4;
    s+='<path d="M'+(x-w/2).toFixed(1)+' '+y0.toFixed(1)+' C'+(x-w*0.3).toFixed(1)+' '+((y0+y1)/2).toFixed(1)+' '+(x-w*0.25).toFixed(1)+' '+(y1-6).toFixed(1)+' '+x.toFixed(1)+' '+y1.toFixed(1)+' C'+(x+w*0.25).toFixed(1)+' '+(y1-6).toFixed(1)+' '+(x+w*0.3).toFixed(1)+' '+((y0+y1)/2).toFixed(1)+' '+(x+w/2).toFixed(1)+' '+y0.toFixed(1)+' Z" fill="#4e0505" fill-opacity=".85"/><circle cx="'+x.toFixed(1)+'" cy="'+(y1+w*0.4).toFixed(1)+'" r="'+(w*0.75).toFixed(1)+'" fill="#4e0505" fill-opacity=".9"/>';}
  return'url("data:image/svg+xml;utf8,'+encodeURIComponent(s+'</svg>')+'")';}
function telaSangue(k){const el=document.getElementById('tela-sangue');if(!el||cfg.reduzido)return;if(!SPLAT_SVG){const R=rng(99);SPLAT_SVG=[0,1,2,3,4,5].map(()=>splatSVG(R));}
  const n=k>0.9?3:k>0.5?2:1;for(let i=0;i<n;i++){if(el.children.length>=7)el.firstElementChild.remove();const d=document.createElement('i');d.className='sp';
    const lado=Math.random(),tam=(20+Math.random()*16)*(0.8+k*0.35);let x,y;
    if(lado<0.38){x=-4+Math.random()*16;y=8+Math.random()*70;}else if(lado<0.76){x=84+Math.random()*16-tam*0.4;y=8+Math.random()*70;}else{x=15+Math.random()*65;y=-6+Math.random()*12;}
    d.style.cssText='left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%;width:'+tam.toFixed(1)+'vmin;height:'+(tam*1.3).toFixed(1)+'vmin;background-image:'+SPLAT_SVG[Math.floor(Math.random()*SPLAT_SVG.length)]+';--rot:rotate('+((Math.random()-0.5)*50).toFixed(0)+'deg)';
    d.addEventListener('animationend',()=>d.remove());el.append(d);}}
function impactoJogador(d,src){if(!P.alive&&P.vida>0)return;const k=clamp(d/22,0.3,1.4);
  telaSangue(k);const dir=src?norm([P.x-src.x,0.25,P.z-src.z]):[0,0.6,0];sangue2(P.x,P.y+1.25,P.z,Math.round(6+8*k),dir,k>0.95);
  if(src){const dx=P.x-src.x,dz=P.z-src.z,l=Math.hypot(dx,dz)||1;P.kickX=dx/l*0.2*k;P.kickZ=dz/l*0.2*k;const lado=(dx/l)*Math.cos(P.yaw)-(dz/l)*Math.sin(P.yaw);P.kickR=(lado>0?1:-1)*0.07*k;P.cambLado=lado>0?1:-1;
    if(P.noChao&&!CARRO.ativo){P.vx+=dx/l*2.2*k;P.vz+=dz/l*2.2*k;}}else{P.kickX=P.kickZ=0;P.kickR=(Math.random()<0.5?-1:1)*0.04*k;}
  P.kickY=-0.07*k;P.kickT=1;P.kickP=0.06*k;P.shake=Math.max(P.shake,0.45+0.45*k);P.cambaleia=0.5*Math.min(1,0.4+k);
  sfx('impacto',P.x,P.z,0.25+0.25*k);if(d>=16)G.hitstop=Math.max(G.hitstop||0,0.07);}
/* solavanco da câmera (chamado no fim de updateCamera) */
function camImpacto(dt){const t=P.kickT||0;cam.roll=0;if(t<=0)return;const e=t*t;
  cam.pos[0]+=(P.kickX||0)*e;cam.pos[1]+=(P.kickY||0)*e;cam.pos[2]+=(P.kickZ||0)*e;cam.roll=(P.kickR||0)*e;cam.fov*=1-0.04*e;P.kickT=Math.max(0,t-dt*3.2);}
const UP0=[0,1,0];
function camUp(){const r=cam.roll||0;if(!r)return UP0;return[cam.right[0]*Math.sin(r),Math.cos(r),cam.right[2]*Math.sin(r)];}
/* corpo cambaleia (somado à pose do jogador) */
function poseCambaleio(o){const c=P.cambaleia||0;if(c<=0)return;const k=Math.sin(Math.min(1,c/0.5)*Math.PI*0.5),s=P.cambLado||1;
  o[3]-=0.34*k;o[5]+=0.2*k*s;o[6]-=0.32*k;o[8]+=0.22*k*s;o[9]-=0.5*k;o[11]+=0.3*k;o[15]-=0.5*k;o[17]-=0.3*k;}
/* ---------- telas: pouca vida e vírus ---------- */
let VEIAS_SVG=null,apagaoT=0,vidaBatT=0;
function veiasSVG(){const R=rng(31);let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none">';
  const ramo=(x,y,a,len,w,n)=>{if(n<=0||w<0.6)return;let px=x,py=y,d='M'+x.toFixed(0)+' '+y.toFixed(0);for(let i=0;i<6;i++){a+=(R()-0.5)*0.7;px+=Math.cos(a)*len/6;py+=Math.sin(a)*len/6;d+=' L'+px.toFixed(0)+' '+py.toFixed(0);}
    s+='<path d="'+d+'" fill="none" stroke="#24102a" stroke-opacity="'+(0.35+w/14).toFixed(2)+'" stroke-width="'+w.toFixed(1)+'" stroke-linecap="round"/>';
    ramo(px,py,a+(R()-0.5)*1.2,len*0.7,w*0.62,n-1);if(R()<0.75)ramo(px,py,a+(R()<0.5?0.8:-0.8),len*0.6,w*0.55,n-1);};
  for(let i=0;i<10;i++){const lado=i%4,t=R();const x=lado===0?0:lado===1?1600:t*1600,y=lado===2?0:lado===3?900:t*900,a=Math.atan2(450-y,800-x)+(R()-0.5)*0.8;ramo(x,y,a,260+R()*160,7+R()*4,4);}
  return'url("data:image/svg+xml;utf8,'+encodeURIComponent(s+'</svg>')+'")';}
function apagao(){const el=document.getElementById('tela-apagao');if(!el)return;el.style.opacity='0.88';sfx('coracao');setTimeout(()=>{el.style.opacity='0';},320);}
function updateEfeitos(dt){P.cambaleia=Math.max(0,(P.cambaleia||0)-dt);P.kickP=(P.kickP||0)*Math.exp(-dt*7);
  const v=typeof virusNivel==='function'?virusNivel():0,vida=P.alive?P.vida:0;
  const cinza=document.getElementById('tela-cinza'),veias=document.getElementById('tela-veias');if(!cinza)return;
  const c=G.modo==='jogo'||G.modo==='pausa'?clamp((38-vida)/38,0,1)*0.7+clamp((v-55)/45,0,1)*0.55:0;cinza.style.opacity=Math.min(0.9,c).toFixed(3);
  {const tv=document.getElementById('tela-vida');if(tv){const baixa=(G.modo==='jogo'||G.modo==='pausa')&&P.alive?clamp((40-vida)/32,0,1):0;
    if(baixa>0.01){const bpm=1.1+baixa*1.1,bt=(G.t*bpm)%1,pulso=Math.max(Math.exp(-bt*9),0.7*Math.exp(-Math.max(0,bt-0.18)*9)*(bt>0.18?1:0));tv.style.opacity=(baixa*(0.45+0.55*pulso)).toFixed(3);
      vidaBatT-=dt;if(vidaBatT<=0&&G.modo==='jogo'){vidaBatT=1/bpm;sfx('coracao',undefined,undefined,0.25+0.5*baixa);}}else if(tv.style.opacity!=='0')tv.style.opacity='0';}}
  if(v>25&&(G.modo==='jogo'||G.modo==='pausa')){if(!VEIAS_SVG){VEIAS_SVG=veiasSVG();veias.style.backgroundImage=VEIAS_SVG;}veias.hidden=false;const pulso=0.85+0.15*Math.sin(G.t*(4+v/25));veias.style.opacity=(clamp((v-25)/60,0,1)*0.9*pulso).toFixed(3);}
  else if(!veias.hidden)veias.hidden=true;}
function resetEfeitos(){P.cambaleia=0;P.kickT=0;cam.roll=0;const el=document.getElementById('tela-sangue');if(el)el.innerHTML='';}

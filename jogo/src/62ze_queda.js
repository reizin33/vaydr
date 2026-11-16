/* ================= Árvore caindo e tora (v10.2.4, 16/11/2026) =================
   Himalaia: "não tem a animação dela quebrando e o tronco caindo". Quando o machado derruba a árvore:
   · ela estala e tomba para o lado contrário de quem cortou, girando no pé como uma vara (aceleração 3g/2L × seno do ângulo),
     com a copa inteira (a mesma espécie, textura e tamanho da árvore que estava ali); o toco fica no lugar;
   · ao bater no chão: estrondo, poeira ao longo do tronco e a câmera treme se o jogador está perto; zumbi que estiver embaixo
     leva o peso (e o jogador também, se correr para debaixo dela);
   · um segundo depois a copa se desfaz (folhas voando) e fica a tora deitada, com colisão (dá para pular por cima). O machado
     tira mais madeira dela até acabar; se ninguém mexer, ela afunda e some depois de alguns minutos;
   · os pinheiros caem com o modelo deles; árvore sem modelo de espécie cai e afunda no chão, sem tora. A tora não vai para o
     save (é passageira, como a poeira). */
const ARVQ={lista:[],toras:[],vidaTora:420,hpTora:3,_M:new Float32Array(16),erro:null};
/* as partes que desenham esta árvore: espécie da mata (folhas, galhos e tronco), pinheiro ou a malha antiga */
function quedaPartes(t){
  if(t.kind===0&&typeof PINHO!=='undefined'&&PINHO.ok&&PINHO.v&&PINHO.v.length){const v=PINHO.v[Math.min(PINHO.v.length-1,Math.floor(pinhoHash(t.x,t.z)*3))];
    return{partes:[{m:v.madeira,tronco:true},{m:v.agulha,fol:true}],L:10*t.s,tora:0.7,r:0.22*t.s};}
  if((t.kind===1||t.kind===3)&&MATAV.ok&&MATAV.esp.length&&mataLigada()&&mataProntas()){const e=MATAV.esp[mataEsp(t.x,t.z)];
    if(e&&e.lods[0])return{partes:e.lods[0].map(p=>({m:p.m,fol:p.fol,tronco:!p.fol&&!/branch|galho/i.test(p.nome||'')})),L:e.lim.hi[1]*t.s,tora:0.55,r:(e.tronco?e.tronco.r:0.3)*t.s};}
  const m=t.kind===0?MESH.pineN:t.kind===3?MESH.birchN:t.kind===2?MESH.deadN:MESH.roundN;
  return m?{partes:[{m}],L:6.5*t.s,tora:0,r:0.25*t.s}:null;}
function quedaComecar(t){try{const q=quedaPartes(t);if(!q||q.L<1)return;
    const d=Math.atan2(t.x-P.x,t.z-P.z)+(Math.random()-0.5)*0.5;   // para longe de quem cortou, com um pouco de acaso
    ARVQ.lista.push({x:t.x,y:t.y,z:t.z,r:t.r,s:t.s,d,a:0.03,w:0.2,fase:0,tt:0,tb:0,q});sfx('estalo',t.x,t.z);sfx('rangido',t.x,t.z,0.8);}
  catch(e){if(!ARVQ.erro){ARVQ.erro=String(e);console.error('queda',e);}}}
/* matriz: pé da árvore no lugar, tombada pelo ângulo a em volta do eixo deitado (cos d, 0, -sen d), girada e escalada como a
   instância (mundo = (c·x + s·z, y, -s·x + c·z) × escala) */
function quedaMat(o,M){const c=Math.cos(o.r),s=Math.sin(o.r),k=o.s,kx=Math.cos(o.d),kz=-Math.sin(o.d),ca=Math.cos(o.a),sa=Math.sin(o.a),t=1-ca,
    R00=ca+t*kx*kx,R01=-sa*kz,R02=t*kx*kz,R10=sa*kz,R11=ca,R12=-sa*kx,R20=t*kx*kz,R21=sa*kx,R22=ca+t*kz*kz;
  M[0]=(R00*c-R02*s)*k;M[1]=(R10*c-R12*s)*k;M[2]=(R20*c-R22*s)*k;M[3]=0;M[4]=R01*k;M[5]=R11*k;M[6]=R21*k;M[7]=0;
  M[8]=(R00*s+R02*c)*k;M[9]=(R10*s+R12*c)*k;M[10]=(R20*s+R22*c)*k;M[11]=0;M[12]=o.x;M[13]=o.y;M[14]=o.z;M[15]=1;return M;}
/* bateu no chão */
function quedaBate(Q){Q.fase=1;Q.aMax=Q.a;Q.w=-Math.abs(Q.w)*0.16;Q.tb=Q.tt;const L=Q.q.L,fx=Math.sin(Q.d),fz=Math.cos(Q.d),sa=Math.sin(Q.a);
  const mx=Q.x+fx*L*sa*0.5,mz=Q.z+fz*L*sa*0.5;sfx('impacto',mx,mz,1);sfx('galho',mx,mz,0.9);barulho(mx,mz,22,false);
  for(let k=1;k<=6;k++){const u=k/6*0.9,x=Q.x+fx*L*sa*u,z=Q.z+fz*L*sa*u;poeira(x,ground(x,z)+0.2,z,5);}
  const dp=Math.hypot(P.x-mx,P.z-mz);if(dp<22)P.shake=Math.max(P.shake||0,0.55*(1-dp/22));
  const ax=Q.x+fx*1.2,az=Q.z+fz*1.2,bx=Q.x+fx*L*sa*0.95,bz=Q.z+fz*L*sa*0.95,vx=bx-ax,vz=bz-az,l2=vx*vx+vz*vz||1,
    embaixo=(x,z,r)=>{const u=clamp(((x-ax)*vx+(z-az)*vz)/l2,0,1);return Math.hypot(x-(ax+vx*u),z-(az+vz*u))<r+Q.q.r*0.8+0.5*(1-u);};
  for(const z of Z)if(z.vivo&&embaixo(z.x,z.z,(ZS[z.tipo]&&ZS[z.tipo].r)||0.35)){ZHIT=null;ferirZ(z,160,fx*3,fz*3,1);}
  if(P.alive&&!P.voo&&embaixo(P.x,P.z,0.3)){ferirJogador(22,{x:mx,z:mz});feed('A árvore caiu em cima de você!',true);P.shake=Math.max(P.shake||0,0.8);}}
/* a copa se desfaz e fica a tora (só o tronco, sem galhos e folhas), com colisão */
function quedaTora(Q){const L=Q.q.L,fx=Math.sin(Q.d),fz=Math.cos(Q.d),sa=Math.sin(Q.a);
  for(let i=0;i<34;i++){const u=0.5+Math.random()*0.48,x=Q.x+fx*L*sa*u+(Math.random()-0.5)*2.5,z=Q.z+fz*L*sa*u+(Math.random()-0.5)*2.5;
    part(x,ground(x,z)+0.6+Math.random()*1.6,z,(Math.random()-0.5)*2.2,0.6+Math.random()*1.8,(Math.random()-0.5)*2.2,2.2,0.09,[0.2+Math.random()*0.1,0.34+Math.random()*0.12,0.1,0.95],false,2.2);}
  sfx('galho',Q.x+fx*L*sa*0.7,Q.z+fz*L*sa*0.7,0.8);
  const partes=Q.q.partes.filter(p=>p.tronco);if(!partes.length)return false;
  const comp=Math.max(1.2,L*Q.q.tora*sa),raio=clamp(Q.q.r*0.65,0.16,0.6),cx=Q.x+fx*comp*0.5,cz=Q.z+fz*comp*0.5,gy=ground(cx,cz);
  const T={x:Q.x,y:Q.y,z:Q.z,r:Q.r,s:Q.s,d:Q.d,a:Q.a,partes,comp,raio,hp:ARVQ.hpTora,vida:ARVQ.vidaTora,col:null};
  T.col=colBox(cx,cz,raio,comp*0.5,Q.d,{tora:T,solid:true,y0:gy-0.3,y1:gy+raio*2+0.05});ARVQ.toras.push(T);return true;}
function toraSemColisao(T){if(T.col){colRemove(T.col);T.col=null;}}
function toraTirar(T){const i=ARVQ.toras.indexOf(T);if(i>=0)ARVQ.toras.splice(i,1);toraSemColisao(T);}
/* golpe de machado na tora: lascas, um pouco de madeira e, no último golpe, o resto */
function toraGolpe(x,z,s,d){let best=null,bd=1e9;
  for(const T of ARVQ.toras){const vx=Math.sin(T.d),vz=Math.cos(T.d),u=clamp((x-T.x)*vx+(z-T.z)*vz,0,T.comp),dd=Math.hypot(x-(T.x+vx*u),z-(T.z+vz*u))-T.raio;
    if(dd<1.1&&dd<bd){bd=dd;best={T,u};}}
  if(!best)return false;const T=best.T,px=T.x+Math.sin(T.d)*best.u,pz=T.z+Math.cos(T.d)*best.u,py=ground(px,pz)+T.raio;
  T.hp--;lascas(px,py,pz,[0.55,0.38,0.22,1]);sfx('madeira',px,pz);barulho(P.x,P.z,14,true);gastar(s,1);if(Math.random()<0.35)ganhar('madeira',1);
  if(T.hp<=0){ganhar('madeira',2+(perk('lenhador')||0));poeira(px,py,pz,10);toraTirar(T);}
  return true;}
PASSOS.push(function quedaPasso(dt){if(!ARVQ.lista.length&&!ARVQ.toras.length)return;dt=Math.min(dt,0.1);
  for(let i=ARVQ.lista.length-1;i>=0;i--){const Q=ARVQ.lista[i],g=1.5*9.8/Q.q.L;Q.tt+=dt;
    if(Q.fase===0){const n=Math.ceil(dt/0.02);for(let k=0;k<n;k++){const st=dt/n;Q.w+=g*Math.sin(Q.a)*st;Q.a+=Q.w*st;}
      const sa=Math.sin(Q.a),tx=Q.x+Math.sin(Q.d)*Q.q.L*sa*0.85,tz=Q.z+Math.cos(Q.d)*Q.q.L*sa*0.85,ty=Q.y+Q.q.L*Math.cos(Q.a)*0.85;
      if(ty<=ground(tx,tz)+0.12*Q.q.L||Q.a>1.75)quedaBate(Q);}
    else if(Q.fase===1){Q.w+=g*Math.sin(Q.a)*dt;Q.a+=Q.w*dt;if(Q.a>=Q.aMax){Q.a=Q.aMax;Q.w=0;}
      if(Q.tt-Q.tb>1.1){if(Q.q.tora>0&&quedaTora(Q))ARVQ.lista.splice(i,1);else Q.fase=2;}}
    else{Q.y-=dt*0.9;if(Q.tt-Q.tb>4)ARVQ.lista.splice(i,1);}}
  for(let i=ARVQ.toras.length-1;i>=0;i--){const T=ARVQ.toras[i];T.vida-=dt;if(T.vida<0){toraSemColisao(T);T.y-=dt*0.35;if(T.vida<-4)ARVQ.toras.splice(i,1);}}});
function quedaParte(Pg,m,M){gl.uniformMatrix4fv(Pg.u.uModel,false,M);gl.bindVertexArray(m.vao);const tx=m.tex&&Pg.u.uUseTex;
  if(tx){gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,m.tex);gl.activeTexture(gl.TEXTURE0);gl.uniform1f(Pg.u.uUseTex,m.alfa?1+m.alfa:1);}
  gl.drawArrays(gl.TRIANGLES,0,m.count);if(tx)gl.uniform1f(Pg.u.uUseTex,0);}
DESENHO.opaco.push(Pg=>{if(!ARVQ.lista.length&&!ARVQ.toras.length)return;const cf=gl.isEnabled(gl.CULL_FACE),M=ARVQ._M;
  for(const Q of ARVQ.lista){quedaMat(Q,M);for(const p of Q.q.partes){if(p.fol&&cf)gl.disable(gl.CULL_FACE);quedaParte(Pg,p.m,M);if(p.fol&&cf)gl.enable(gl.CULL_FACE);}}
  for(const T of ARVQ.toras){quedaMat(T,M);for(const p of T.partes)quedaParte(Pg,p.m,M);}gl.bindVertexArray(null);});
DESENHO.sombra.push(Pg=>{if(!ARVQ.lista.length&&!ARVQ.toras.length)return;const M=ARVQ._M;
  for(const Q of ARVQ.lista){quedaMat(Q,M);for(const p of Q.q.partes)if(!p.fol)drawStat(Pg,p.m,M);}
  for(const T of ARVQ.toras){quedaMat(T,M);for(const p of T.partes)drawStat(Pg,p.m,M);}gl.bindVertexArray(null);});
/* mundo novo ou save carregado: nada caindo e nenhuma tora sobrando */
{const _rm=resetMundo;resetMundo=function(){ARVQ.lista.length=0;for(const T of ARVQ.toras.slice())toraTirar(T);return _rm.apply(this,arguments);};}

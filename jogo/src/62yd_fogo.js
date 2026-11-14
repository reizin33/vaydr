/* ================= Fogo de verdade (v10.2.2, 13/11/2026) =================
   "Olha esse fogo na mata, que coisa horrível" (Himalaia): o fogo era uma nuvem de bolinhas laranja chapadas no pé da árvore
   (centenas de partículas por segundo por árvore, o que também derrubava o FPS) e a fumaça eram bolas cinza grandes.
   Agora:
   · Chama: placas de pé viradas para a câmera com uma chama desenhada no shader (ruído que sobe, mais larga embaixo e fina em cima,
     núcleo quase branco, laranja e vermelho nas pontas), somando luz. Poucas placas por fogo (3 a 12), em vez das partículas.
   · Árvore pegando fogo: começa no pé, sobe pelo tronco e toma a copa no meio do incêndio; no fim sobra brasa no tronco.
     A árvore escurece e perde as folhas aos poucos (50_render.js/62y) e fica de pé, carbonizada.
   · Fumaça: poucas nuvens grandes e macias (com ruído por dentro) que saem da copa, sobem, crescem e vão com o vento.
   · Faíscas: só algumas, pequenas, subindo.
   O fogo no chão (molotov, raio, laboratório) usa as mesmas chamas, do tamanho da poça de fogo. */
const FOGO3D={ok:false,prog:null,vao:null,ib:null,arr:new Float32Array(600*8),n:0,fum:[],fumArr:new Float32Array(140*8),fumN:0,erro:null};
function fogo3dOk(){return FOGO3D.ok;}
const FOGO_VS=`layout(location=0) in vec2 aK;layout(location=1) in vec3 aP;layout(location=2) in vec4 aS;layout(location=3) in float aX;
uniform mat4 uViewProj;uniform vec3 uR,uU;uniform float uModo;out vec2 vUV;out vec3 vSI;
void main(){vUV=vec2(aK.x*0.5+0.5,aK.y);vSI=vec3(aS.zw,aX);
  vec3 p=uModo<0.5?aP+uR*(aK.x*aS.x*0.5)+vec3(0.0,1.0,0.0)*(aK.y*aS.y):aP+uR*(aK.x*aS.x*0.5)+uU*((aK.y-0.5)*aS.y);
  gl_Position=uViewProj*vec4(p,1.0);}`;
const FOGO_FS=`precision highp float;in vec2 vUV;in vec3 vSI;uniform float uModo,uTime,uLin,uGain,uExpI,uDia;out vec4 o;
${GLSL_ACES}
float hs(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s;}
void main(){float sd=vSI.x,I=vSI.y;
  if(uModo<0.5){
    /* chama: um campo de ruído que sobe e balança mais no alto; a forma é larga embaixo, fecha para cima e se rasga em línguas;
       borda macia (nada de recorte duro), cor do vermelho escuro na ponta ao amarelo claro no miolo, e fraca o bastante para não
       estourar em branco quando várias se somam */
    float y=vUV.y,xc=(vUV.x-0.5)*2.0,t=uTime;
    vec2 q=vec2(vUV.x*2.4+sd*11.0,y*1.7-t*1.6);
    float d1=fbm(q),d2=fbm(q*2.1+vec2(3.1,-t*1.1));
    float xs=xc+(d1-0.5)*0.9*y;
    float env=(1.0-y)*(0.78+0.5*smoothstep(0.0,0.22,y));
    float f=(env-abs(xs)*0.9-(d2-0.45)*0.95*pow(y,0.7))*2.1;
    f*=(1.0-smoothstep(0.72,1.0,abs(xc)))*smoothstep(0.0,0.12,y);
    if(f<=0.0)discard;float g=min(f,1.0);
    vec3 c=mix(vec3(0.32,0.025,0.0),vec3(0.95,0.27,0.03),smoothstep(0.0,0.35,g));
    c=mix(c,vec3(1.0,0.6,0.16),smoothstep(0.35,0.72,g));c=mix(c,vec3(1.0,0.84,0.5),smoothstep(0.8,1.0,g));
    vec3 col=c*smoothstep(0.0,0.55,g)*I*0.7;
    if(uLin>0.5)col=pow(col,vec3(2.2))*uGain;
    o=vec4(col,1.0);
  }else{
    vec2 q=vUV*2.0-1.0;float r=length(q);
    float n=fbm(vUV*2.6+vec2(sd*9.0,sd*3.0-uTime*0.11));
    float d=smoothstep(1.0,0.2,r+(n-0.5)*0.75);float a=d*I;if(a<0.004)discard;
    vec3 c=mix(vec3(0.15,0.14,0.13),vec3(0.36,0.34,0.32),n)*uDia;
    c=mix(c,vec3(0.7,0.32,0.1),vSI.z*smoothstep(0.3,-0.7,q.y)*0.8);
    if(uLin>0.5){vec3 l=pow(c,vec3(2.2));c=acesInv(l)*uExpI;}
    o=vec4(c,a);
  }}`;
INIT_MALHAS.push(function fogo3dMalhas(){try{
  FOGO3D.prog=program(FOGO_VS,FOGO_FS,'');
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,0,1,0,1,1,-1,0,1,1,-1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,FOGO3D.arr.byteLength,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(1,1);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,32,12);gl.vertexAttribDivisor(2,1);
  gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,1,gl.FLOAT,false,32,28);gl.vertexAttribDivisor(3,1);
  gl.bindVertexArray(null);FOGO3D.vao=vao;FOGO3D.ib=ib;FOGO3D.ok=true;}catch(e){FOGO3D.ok=false;FOGO3D.erro=String(e);console.error('fogo 3d',e);}});
/* uma chama: pé (x,y,z), largura, altura, semente, força */
function fogoPoe(x,y,z,w,h,s,I){const F=FOGO3D;if(F.n>=600)return;const o=F.n*8,a=F.arr;a[o]=x;a[o+1]=y;a[o+2]=z;a[o+3]=w;a[o+4]=h;a[o+5]=s;a[o+6]=I;a[o+7]=0;F.n++;}
/* altura da árvore (a de verdade, se a mata nova estiver ligada) */
function fogoAlturaArvore(t){if(typeof MATAV!=='undefined'&&MATAV.ok&&MATAV.esp.length){const e=MATAV.esp[mataEsp(t.x,t.z)];return e.lim.hi[1]*(t.s||1)*(t.kind===0?(MATAV.kPinho||1):1);}return 7*(t.s||1);}
const fogoH=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);};
function fogoMontar(){const F=FOGO3D;F.n=0;if(!F.ok)return;const cx=cam.pos[0],cz=cam.pos[2],T=G.t;
  const fl=(s,k)=>0.86+0.14*Math.sin(T*(6+k*4)+s*40);
  /* fogo no chão */
  for(const c of CHAMAS){const k=c.k||0;if(k<=0.02||c.mata)continue;if(d2(c.x,c.z,cx,cz)>200*200)continue;const r=c.rr||c.r||1.5,q=Math.max(2,Math.min(7,Math.round(r*2.2)));
    for(let i=0;i<q;i++){const s=fogoH(c.x+i,c.z),s2=fogoH(c.z-i,c.x),a=s*6.283,d=Math.sqrt(s2)*r*0.72,x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d;
      const w=(0.9+0.6*s2)*Math.min(1.3,0.45+r*0.35),h=(1.3+1.1*s)*Math.min(1.3,0.5+r*0.3)*fl(s,s2);fogoPoe(x,chaoEm(x,z,c.y+0.6)-0.05,z,w,h,s,1.15*k);}}
  /* árvores pegando fogo */
  const M=G.mundo,FG=M&&M.fogo;if(FG)for(const id of FG.ids){const t=TREES[id];if(!t||!t.fogo)continue;if(d2(t.x,t.z,cx,cz)>260*260)continue;
    const k=clamp(1-t.fogoT/(t.fogo0||30),0,1),H=fogoAlturaArvore(t),sc=Math.max(0.7,Math.min(1.6,(t.s||1))),g=t.y??ground(t.x,t.z),R=H*0.32;
    const pe=k<0.9?Math.min(1,k*6+0.35)*(1-smooth(0.75,0.9,k)):0,tronco=smooth(0.08,0.2,k)*(1-smooth(0.8,0.95,k)),copa=smooth(0.14,0.3,k)*(1-smooth(0.52,0.7,k)),brasa=smooth(0.62,0.8,k)*(1-k)*4;
    if(pe>0.02)for(let i=0;i<3;i++){const s=fogoH(t.id,i),a=s*6.283+i*2.1,d=0.35*sc;fogoPoe(t.x+Math.cos(a)*d,g-0.05,t.z+Math.sin(a)*d,(1.3+0.7*s)*sc,(2.0+1.3*s)*sc*fl(s,i),s,1.1*pe);}
    if(tronco>0.02)for(let i=0;i<2;i++){const s=fogoH(t.id+7,i),a=s*6.283;fogoPoe(t.x+Math.cos(a)*0.25,g+H*(0.18+0.22*i),t.z+Math.sin(a)*0.25,(1.2+0.6*s)*sc,(2.4+1.6*s)*sc*fl(s,i+2),s,0.95*tronco);}
    if(copa>0.02)for(let i=0;i<5;i++){const s=fogoH(t.id+13,i),s2=fogoH(i,t.id),a=s*6.283,d=R*(0.15+0.55*s2),hy=H*(0.45+0.42*fogoH(t.id,i+5));
      fogoPoe(t.x+Math.cos(a)*d,g+hy,t.z+Math.sin(a)*d,(1.8+1.2*s2)*sc,(2.6+2.0*s)*sc*fl(s,i+4),s,0.95*copa);}
    if(brasa>0.02)for(let i=0;i<2;i++){const s=fogoH(t.id+29,i);fogoPoe(t.x+(s-0.5)*0.4,g+H*(0.1+0.25*i),t.z+(fogoH(i,t.id+3)-0.5)*0.4,0.7*sc,(1.0+0.6*s)*sc*fl(s,i+7),s,0.8*Math.min(1,brasa));}}}
/* fumaça: nuvens grandes que saem da copa (árvore) ou de 1,5 m (fogo no chão), sobem, crescem e vão com o vento */
let fogoFumT=0;
PASSOS.push(function fogoFumaca(dt){const F=FOGO3D;if(!F.ok)return;const W=E.wind||[0.6,0.2];
  for(let i=F.fum.length-1;i>=0;i--){const p=F.fum[i];p.l+=dt;if(p.l>=p.L){F.fum.splice(i,1);continue;}const v=1-p.l/p.L*0.6;p.x+=(W[0]*0.9+p.vx)*dt;p.z+=(W[1]*0.9+p.vz)*dt;p.y+=p.vy*v*dt;}
  fogoFumT-=dt;if(fogoFumT>0)return;fogoFumT=0.3;if(F.fum.length>=130)return;const cx=cam.pos[0],cz=cam.pos[2];
  const M=G.mundo,FG=M&&M.fogo;if(FG)for(const id of FG.ids){const t=TREES[id];if(!t||!t.fogo||Math.random()<0.25)continue;if(d2(t.x,t.z,cx,cz)>320*320)continue;
    const k=clamp(1-t.fogoT/(t.fogo0||30),0,1),H=fogoAlturaArvore(t),g=t.y??ground(t.x,t.z),forte=0.4+0.6*Math.sin(Math.PI*Math.min(1,k*1.15));
    F.fum.push({x:t.x+(Math.random()-0.5)*2,y:g+H*(0.55+0.35*Math.random()),z:t.z+(Math.random()-0.5)*2,vx:(Math.random()-0.5)*0.6,vz:(Math.random()-0.5)*0.6,vy:2.2+Math.random()*1.2,
      l:0,L:7+Math.random()*4,s0:3+Math.random()*2,s1:11+Math.random()*6,a:0.34*forte,sd:Math.random(),gl:1});if(F.fum.length>=130)break;}
  for(const c of CHAMAS){const k=c.k||0;if(k<0.2||c.mata||Math.random()<0.45)continue;if(d2(c.x,c.z,cx,cz)>220*220)continue;
    F.fum.push({x:c.x+(Math.random()-0.5)*(c.rr||1),y:c.y+1.6,z:c.z+(Math.random()-0.5)*(c.rr||1),vx:(Math.random()-0.5)*0.4,vz:(Math.random()-0.5)*0.4,vy:1.4+Math.random(),
      l:0,L:5+Math.random()*3,s0:1.4,s1:5.5,a:0.26*k,sd:Math.random(),gl:1});}});
/* faíscas: poucas, pequenas, subindo da árvore em chamas */
let fogoFaiscaT=0;
PASSOS.push(function fogoFaiscas(dt){if(!FOGO3D.ok)return;fogoFaiscaT-=dt;if(fogoFaiscaT>0)return;fogoFaiscaT=0.12;const M=G.mundo,FG=M&&M.fogo;if(!FG)return;
  for(const id of FG.ids){const t=TREES[id];if(!t||!t.fogo||Math.random()<0.55)continue;if(d2(t.x,t.z,P.x,P.z)>90*90)continue;const H=fogoAlturaArvore(t),g=t.y??ground(t.x,t.z);
    part(t.x+(Math.random()-0.5)*2.5,g+H*(0.2+0.6*Math.random()),t.z+(Math.random()-0.5)*2.5,(Math.random()-0.5)*1.2,2.5+Math.random()*2.5,(Math.random()-0.5)*1.2,1.2+Math.random()*1.4,0.05+Math.random()*0.04,[1,0.55+Math.random()*0.3,0.15,1],true,-1.2);}});
function fogoUniforms(Pg,modo){const u=Pg.u,post=POSTX.ok&&!!GDEF;gl.useProgram(Pg.p);gl.uniformMatrix4fv(u.uViewProj,false,VP);
  if(modo<0.5){const l=Math.hypot(V[0],V[8])||1;gl.uniform3f(u.uR,V[0]/l,0,V[8]/l);}else gl.uniform3f(u.uR,V[0],V[4],V[8]);
  gl.uniform3f(u.uU,V[1],V[5],V[9]);gl.uniform1f(u.uModo,modo);gl.uniform1f(u.uTime,G.t);gl.uniform1f(u.uLin,post?1:0);gl.uniform1f(u.uGain,1.8);
  gl.uniform1f(u.uExpI,1/(E.exp||1));gl.uniform1f(u.uDia,lerp(1,0.32,E.n||0));}
/* chamas: na fase das luzes somadas (DESENHO.aditivo); depois volta o programa dos brilhos, que desenha logo em seguida */
DESENHO.aditivo.push(function fogoChamas(){const F=FOGO3D;if(!F.ok)return;fogoMontar();if(!F.n)return;
  fogoUniforms(F.prog,0);gl.blendFunc(gl.ONE,gl.ONE);gl.bindVertexArray(F.vao);gl.bindBuffer(gl.ARRAY_BUFFER,F.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,F.arr,0,F.n*8);
  gl.drawArraysInstanced(gl.TRIANGLES,0,6,F.n);gl.bindVertexArray(null);gl.useProgram(PBB.p);});
/* fumaça: na fase das transparências (DESENHO.alfa), da mais longe para a mais perto */
DESENHO.alfa.push(function fogoFumacaDesenho(){const F=FOGO3D;if(!F.ok||!F.fum.length)return;const cx=cam.pos[0],cy=cam.pos[1],cz=cam.pos[2];
  const L=F.fum.map(p=>[p,(p.x-cx)**2+(p.y-cy)**2+(p.z-cz)**2]).sort((a,b)=>b[1]-a[1]);let n=0;const a=F.fumArr;
  for(const[p]of L){if(n>=140)break;const k=p.l/p.L,s=lerp(p.s0,p.s1,Math.sqrt(k)),al=p.a*smooth(0,0.12,k)*(1-smooth(0.55,1,k)),o=n*8;
    a[o]=p.x;a[o+1]=p.y;a[o+2]=p.z;a[o+3]=s;a[o+4]=s;a[o+5]=p.sd;a[o+6]=al;a[o+7]=p.gl*(1-smooth(0,0.35,k));n++;}
  if(!n)return;fogoUniforms(F.prog,1);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(F.vao);gl.bindBuffer(gl.ARRAY_BUFFER,F.ib);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,a,0,n*8);gl.drawArraysInstanced(gl.TRIANGLES,0,6,n);gl.bindVertexArray(null);gl.useProgram(PBB.p);});
